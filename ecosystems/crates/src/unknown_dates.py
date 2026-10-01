#!/usr/bin/env python3
"""When were the versions with no recorded publisher published?

A resolved version whose publisher is unknown has no `published_by` in the dump and, in the
API record compute.py cached for it, neither a login nor a trusted-publishing source. This reads
those records, asks crates.io's API for each version's `created_at`, and writes them sorted.

usage: unknown_dates.py <api-cache.json> <out.json>
"""
import json, subprocess, sys, time, urllib.parse
from datetime import datetime, timezone

CACHE, OUT = sys.argv[1:3]
UA = 'norte-labs measurement (chris@nortesoftware.dev)'
api = json.load(open(CACHE))
unknown = sorted(k for k, a in api.items() if not a.get('login') and not a.get('trustpub') and not a.get('missing'))
rows = []
for k in unknown:
    name, version = k.rsplit('@', 1)
    url = f'https://crates.io/api/v1/crates/{urllib.parse.quote(name)}/{urllib.parse.quote(version)}'
    r = subprocess.run(['curl', '-s', '-4', '--max-time', '30', '-A', UA, url], capture_output=True, text=True)
    v = json.loads(r.stdout)['version']
    rows.append({'crate': name, 'version': version, 'createdAt': v.get('created_at'),
                 'publishedBy': (v.get('published_by') or {}).get('login'),
                 'trustpub': bool(v.get('trustpub_data'))})
    time.sleep(1.0)
out = {'readAt': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'versions': rows}
json.dump(out, open(OUT, 'w'), indent=1)
c = sorted(r['createdAt'] for r in rows)
print(len(rows), 'from', c[0], 'to', c[-1], 'with a publisher now:', sum(1 for r in rows if r['publishedBy'] or r['trustpub']))
