#!/usr/bin/env python3
"""Enumerate the frame through the GitHub search API in star bands.

The search API caps any single query at 1,000 results, so the frame is built in
bands narrow enough that no band reaches the cap; a band that does is split. The
band boundaries are recorded so the enumeration can be checked for completeness.
"""
import json, gzip, subprocess, sys, time

PUSHED = sys.argv[2] if len(sys.argv) > 2 else '2026-09-23'
OUT = sys.argv[1]
MIN_STARS = 100
CAP = 1000

def search(q, page):
    r = subprocess.run(['gh', 'api', '-X', 'GET', 'search/repositories',
                        '-f', f'q={q}', '-f', 'per_page=100', '-f', f'page={page}'],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr[:300])
    return json.loads(r.stdout)

def band_count(q):
    return search(q, 1)['total_count']

def fetch_band(q):
    out, page = [], 1
    while page <= 10:
        d = search(q, page)
        items = d.get('items', [])
        out.extend(items)
        if len(items) < 100:
            break
        page += 1
        time.sleep(2)
    return out

def qfor(lo, hi):
    stars = f'{lo}..{hi}' if hi else f'>={lo}'
    return f'language:Go stars:{stars} pushed:>={PUSHED_FROM} fork:false'

from datetime import date, timedelta
PUSHED_FROM = (date.fromisoformat(PUSHED) - timedelta(days=365)).isoformat()

bands, rows, seen = [], [], set()
# widen upward from the floor; split any band that reaches the cap
edges = [100,110,120,130,145,160,180,200,225,255,290,330,380,440,510,600,700,830,1000,
         1200,1450,1750,2100,2600,3200,4000,5000,6500,8500,11000,15000,20000,30000,50000,None]
for i in range(len(edges)-1):
    lo, hi = edges[i], (edges[i+1]-1 if edges[i+1] else None)
    q = qfor(lo, hi)
    n = band_count(q)
    time.sleep(2)
    if n > CAP:
        print(f'BAND OVER CAP {lo}..{hi} = {n}', file=sys.stderr)
    items = fetch_band(q)
    for it in items:
        if it['full_name'] in seen: continue
        seen.add(it['full_name'])
        rows.append({'fullName': it['full_name'], 'stars': it['stargazers_count'],
                     'pushedAt': it['pushed_at'], 'defaultBranch': it['default_branch'],
                     'size': it['size'], 'archived': it['archived']})
    bands.append({'lo': lo, 'hi': hi, 'total': n, 'fetched': len(items)})
    print(f'{lo}..{hi}: total {n}, fetched {len(items)}, cumulative {len(rows)}', file=sys.stderr)
    time.sleep(2)

with gzip.open(OUT, 'wt') as f:
    for r in sorted(rows, key=lambda r: r['fullName']):
        f.write(json.dumps(r, sort_keys=True) + '\n')
json.dump({'pushedFrom': PUSHED_FROM, 'minStars': MIN_STARS, 'bands': bands,
           'repositories': len(rows), 'overCap': [b for b in bands if b['total'] > CAP]},
          open(OUT.replace('.ndjson.gz', '-bands.json'), 'w'), indent=1)
print(f'frame: {len(rows)} repositories', file=sys.stderr)
