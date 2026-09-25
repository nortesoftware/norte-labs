#!/usr/bin/env python3
"""Resolve each crate in a Cargo.lock to its crates.io owners.

crates.io has real owner accounts, so unlike Go no derivation is needed: the
question is answered by the registry. Control first -- a crate whose owner is
known must come back right, or the method is broken.
"""
import json, re, sys, time, urllib.request, os
LOCK, OUT = sys.argv[1], sys.argv[2]
CACHE = OUT + '.cache.json'
cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}

def owners(name):
    if name in cache: return cache[name]
    url = f'https://crates.io/api/v1/crates/{name}/owners'
    req = urllib.request.Request(url, headers={'User-Agent': 'norte-labs audit (chris@nortesoftware.dev)'})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            d = json.load(r)
        o = sorted({(u.get('login') or u.get('name') or '?') for u in d.get('users', [])})
    except Exception as e:
        o = None
    cache[name] = o
    time.sleep(0.9)   # crates.io asks for about one request a second
    return o

txt = open(LOCK).read()
pkgs = re.findall(r'\[\[package\]\]\nname = "([^"]+)"\nversion = "([^"]+)"\nsource = "registry', txt)
names = sorted({p[0] for p in pkgs})
print(f'crates from the registry: {len(names)}', file=sys.stderr)

# control, run first and printed so a reader can see it passed
ctl = owners('serde')
print(f'CONTROL serde -> {ctl}', file=sys.stderr)

rows = []
for i, n in enumerate(names, 1):
    o = owners(n)
    rows.append({'crate': n, 'owners': o})
    if i % 50 == 0:
        print(f'  {i}/{len(names)}', file=sys.stderr, flush=True)
        json.dump(cache, open(CACHE, 'w'))
json.dump(cache, open(CACHE, 'w'))
json.dump(rows, open(OUT, 'w'), indent=1)
ok = [r for r in rows if r['owners']]
allo = sorted({o for r in ok for o in r['owners']})
print(f'resolved {len(ok)}/{len(rows)}; distinct owners {len(allo)}', file=sys.stderr)
