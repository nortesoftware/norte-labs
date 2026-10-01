#!/usr/bin/env python3
"""Second run: fetch the same files again, at the commits the first run pinned.

usage: refetch.py <population.ndjson from run 1> <population.ndjson out> <store-dir>
"""
import json, os, sys, time, urllib.request, urllib.error

SRC, POP, STORE = sys.argv[1:4]
def raw(full, sha, name):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(f'https://raw.githubusercontent.com/{full}/{sha}/{name}', timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
        except Exception: pass
        time.sleep(5 * (attempt + 1))
    raise RuntimeError(f'fetch failed {full}@{sha}/{name}')
with open(POP, 'w') as out:
    for l in open(SRC):
        r = json.loads(l)
        if r['status'] == 'ok':
            d = os.path.join(STORE, r['fullName'].replace('/', '__')); os.makedirs(d, exist_ok=True)
            for f in ('Cargo.lock', 'Cargo.toml'):
                b = raw(r['fullName'], r['sha'], f)
                if b is not None: open(os.path.join(d, f), 'wb').write(b)
            if not os.path.exists(os.path.join(d, 'Cargo.lock')): r['status'], r['note'] = 'fetch-error', 'run 2: Cargo.lock gone at the pinned commit'
        out.write(json.dumps(r) + '\n')
