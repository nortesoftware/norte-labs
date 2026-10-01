#!/usr/bin/env python3
"""Enumerate the frame through the GitHub search API in star bands.

usage: frame.py <out.ndjson.gz> <frame-date YYYY-MM-DD>

Every repository whose language is Rust, with at least 100 stars, pushed on or
after the frame date less 365 days, not a fork: the frame instruction-gap built
for npm and ecosystems/go for Go. The search API caps a query at 1,000 results,
so the frame is read in star bands, and a band that reaches the cap is split in
two until none does. Band totals are recorded so completeness can be checked.
"""
import gzip, json, subprocess, sys, time
from datetime import date, timedelta

OUT, DAY = sys.argv[1], sys.argv[2]
SINCE = (date.fromisoformat(DAY) - timedelta(days=365)).isoformat()
CAP = 1000

def search(q, page):
    for attempt in range(5):
        r = subprocess.run(['gh', 'api', '-X', 'GET', 'search/repositories', '-f', f'q={q}',
                            '-f', 'per_page=100', '-f', f'page={page}'], capture_output=True, text=True)
        if r.returncode == 0:
            return json.loads(r.stdout)
        time.sleep(30 * (attempt + 1))   # secondary rate limit
    raise RuntimeError(r.stderr[:300])

def q(lo, hi):
    stars = f'{lo}..{hi}' if hi is not None else f'>={lo}'
    return f'language:Rust stars:{stars} pushed:>={SINCE} fork:false'

rows, seen, bands = [], set(), []
todo = [(100, 149), (150, 199), (200, 299), (300, 499), (500, 999), (1000, 2999), (3000, None)]
while todo:
    lo, hi = todo.pop(0)
    d = search(q(lo, hi), 1); time.sleep(2.5)
    n = d['total_count']
    if n >= CAP:
        if hi is not None and hi > lo:
            mid = (lo + hi) // 2
            todo[:0] = [(lo, mid), (mid + 1, hi)]
            continue
        if hi is None:
            todo[:0] = [(lo, lo * 3 - 1), (lo * 3, None)]
            continue
    items, page = d.get('items', []), 1
    while len(items) < n and page < 10:
        page += 1
        more = search(q(lo, hi), page).get('items', []); time.sleep(2.5)
        if not more: break
        items += more
    for it in items:
        if it['full_name'] in seen: continue
        seen.add(it['full_name'])
        rows.append({'fullName': it['full_name'], 'stars': it['stargazers_count'],
                     'pushedAt': it['pushed_at'], 'defaultBranch': it['default_branch'],
                     'fork': it['fork'], 'archived': it['archived'], 'size': it['size']})
    bands.append({'lo': lo, 'hi': hi, 'total': n, 'fetched': len(items)})
    print(f'{lo}..{hi}: total {n}, fetched {len(items)}, cumulative {len(rows)}', file=sys.stderr, flush=True)

with gzip.open(OUT, 'wt') as f:
    for r in sorted(rows, key=lambda r: r['fullName']):
        f.write(json.dumps(r, sort_keys=True) + '\n')
json.dump({'frameDate': DAY, 'pushedFrom': SINCE, 'minStars': 100, 'language': 'Rust',
           'bands': sorted(bands, key=lambda b: b['lo']), 'repositories': len(rows),
           'short': [b for b in bands if b['fetched'] < b['total']]},
          open(OUT.replace('.ndjson.gz', '-bands.json'), 'w'), indent=1)
print(f'frame: {len(rows)} repositories', file=sys.stderr)
