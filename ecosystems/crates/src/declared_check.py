#!/usr/bin/env python3
"""Control on the declared set: for every project whose root Cargo.toml is a single
package, the root package's own dependencies in Cargo.lock against the names its
manifest asks for, git dependencies on both sides, path dependencies on neither,
renames resolved through `package =`, other registries left out.

usage: declared_check.py <run-dir>   (reads population.ndjson and store/)

A [patch.crates-io] entry with a path replaces a crates.io crate with a local copy:
the lockfile then records it with no source, so it is neither declared nor published,
while the manifest still names it. Those projects disagree, and are listed.
"""
import collections, json, os, sys, tomllib

RUN = sys.argv[1]
CRATES_IO = ('registry+https://github.com/rust-lang/crates.io-index', 'sparse+https://index.crates.io/')

def deptables(m):
    for t in ('dependencies', 'dev-dependencies', 'build-dependencies'): yield m.get(t) or {}
    for tgt in (m.get('target') or {}).values():
        for t in ('dependencies', 'dev-dependencies', 'build-dependencies'): yield tgt.get(t) or {}

single = agree = 0; disagree = []
for line in open(os.path.join(RUN, 'population.ndjson')):
    r = json.loads(line)
    if r['status'] != 'ok': continue
    d = os.path.join(RUN, 'store', r['fullName'].replace('/', '__'))
    m = tomllib.loads(open(os.path.join(d, 'Cargo.toml'), encoding='utf8').read())
    if 'workspace' in m or 'package' not in m: continue
    single += 1
    man = set()
    for tbl in deptables(m):
        for k, v in tbl.items():
            if isinstance(v, dict):
                if 'path' in v and 'git' not in v: continue
                if 'registry' in v: continue
                man.add(v.get('package', k))
            else: man.add(k)
    pk = tomllib.loads(open(os.path.join(d, 'Cargo.lock'), encoding='utf8').read()).get('package', [])
    srcs = collections.defaultdict(set)
    for p in pk: srcs[p['name']].add(p.get('source'))
    rootp = [p for p in pk if p['name'] == m['package']['name'] and 'source' not in p]
    if len(rootp) != 1: disagree.append((r['fullName'], f'root package in lock: {len(rootp)}')); continue
    lk = set()
    for dep in rootp[0].get('dependencies', []):
        parts = dep.split(); n = parts[0]
        src = parts[2].strip('()') if len(parts) == 3 else (next(iter(srcs[n])) if len(srcs[n]) == 1 else 'ambiguous')
        if src is None: continue
        if src.startswith(('registry+', 'sparse+')) and not src.startswith(CRATES_IO): continue
        lk.add(n)
    if lk == man: agree += 1
    else: disagree.append((r['fullName'], f'lock-only {sorted(lk - man)} manifest-only {sorted(man - lk)}'))
print(f'single-package roots {single}; root dependencies in Cargo.lock = manifest: {agree} of {single}')
for x in disagree: print('  differs', *x)
