#!/usr/bin/env python3
"""Who published each registry package version in a Cargo.lock, as crates.io records it.

usage: publishers.py Cargo.lock publishers.json

A version is published either by an account (published_by) or, under trusted publishing, by a
CI run in a repository (trustpub_data). Both are publishers, as instruction-gap counts them for
npm. Versions with neither predate crates.io recording the publisher and are left unknown.
"""
import hashlib, json, re, sys, time, urllib.request
LOCK, OUT = sys.argv[1], sys.argv[2]
UA = {'User-Agent': 'norte-labs measurement (chris@nortesoftware.dev)'}
# the automation pattern of measurements/instruction-gap/src/compute.ts, unchanged
AUTOMATION = re.compile(r'bot$|^bot-|-bot-|robot|automation|^types$|release-?bot|^npm$|^github actions$|\bci$|-ci$|^ci-|deploy|publisher$|^gha:', re.I)

def publisher(name, version):
    url = f'https://crates.io/api/v1/crates/{name}/{version}'
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        v = json.load(r)['version']
    time.sleep(1.0)  # crates.io asks for about one request a second
    tp = v.get('trustpub_data') or {}
    return (v.get('published_by') or {}).get('login'), tp.get('repository'), v.get('created_at')

pairs = re.findall(r'\[\[package\]\]\nname = "([^"]+)"\nversion = "([^"]+)"\nsource = "registry', open(LOCK).read())
print(f'registry versions {len(pairs)}, crates {len({n for n, _ in pairs})}', file=sys.stderr)

# controls, chosen before the run: a person, an automation account, a trusted-publishing repository
c1 = publisher('serde', '1.0.229')[0]
c2 = publisher('aws-config', '1.12.0')[0]
c3 = publisher('chacha20', '0.10.2')[1]
print(f'CONTROL serde 1.0.229 -> {c1}; aws-config 1.12.0 -> {c2}; chacha20 0.10.2 -> {c3}', file=sys.stderr)
if c1 != 'dtolnay' or not (c2 and AUTOMATION.search(c2)) or c3 != 'RustCrypto/stream-ciphers':
    sys.exit('control failed: the method is broken, nothing is reported')

rows = []
for i, (n, v) in enumerate(pairs, 1):
    login, repo, created = publisher(n, v)
    rows.append({'crate': n, 'version': v, 'published_by': login, 'trustpub_repository': repo, 'created_at': created})
    if i % 100 == 0: print(f'  {i}/{len(pairs)}', file=sys.stderr, flush=True)
json.dump(rows, open(OUT, 'w'), indent=1)

accounts = {r['published_by'] for r in rows if r['published_by']}
repos = {r['trustpub_repository'] for r in rows if r['trustpub_repository']}
auto = {a for a in accounts if AUTOMATION.search(a)}
unknown = [r for r in rows if not r['published_by'] and not r['trustpub_repository']]
print(f'versions: by an account {sum(1 for r in rows if r["published_by"])}, by trusted publishing '
      f'{sum(1 for r in rows if r["trustpub_repository"])}, unknown {len(unknown)}', file=sys.stderr)
print(f'publishers: {len(accounts)} accounts + {len(repos)} repositories = {len(accounts | repos)}; '
      f'without automation accounts and repositories: {len(accounts - auto)} (automation: {sorted(auto)})', file=sys.stderr)

# a seeded sample of 30, fetched again: the counts above must not depend on a flaky response
key = lambda p: hashlib.sha256(('nono publishers 2026-09-25' + p[0] + p[1]).encode()).hexdigest()
by = {(r['crate'], r['version']): (r['published_by'], r['trustpub_repository']) for r in rows}
bad = [(n, v) for n, v in sorted(pairs, key=key)[:30] if publisher(n, v)[:2] != by[(n, v)]]
print(f'REPRODUCTION 30 fetched again: {30 - len(bad)} match, {len(bad)} differ {bad}', file=sys.stderr)
