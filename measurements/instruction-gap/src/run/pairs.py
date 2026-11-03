#!/usr/bin/env python3
"""ecosystems/npm option 3: which install-code versions each project resolves, read by option 1's
path B parsers, and control C1 against instruction-gap's published install counts.

A pair (name, version) counts as instruction-gap counts it: the first node with that name and
version is a registry one, and its record in registry.ndjson.gz is ok with hasInstallScript.

usage: pairs.py <option1 dir> <store dir> <results dir> <out dir>
"""
import gzip, importlib.util, json, os, sys

OPT1, STORE, RES, OUT = sys.argv[1:5]
spec = importlib.util.spec_from_file_location('o1b', os.path.join(OPT1, 'path_b.py'))
o1b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(o1b)

reg = {}
with gzip.open(os.path.join(RES, 'registry.ndjson.gz'), 'rt', encoding='utf-8') as f:
    for l in f:
        if l.strip():
            r = json.loads(l)
            reg[(r['name'], r['version'])] = r
cells = {json.loads(l)['fullName']: json.loads(l) for l in open(os.path.join(RES, 'cells.ndjson'), encoding='utf-8') if l.strip()}
pop = [json.loads(l) for l in open(os.path.join(RES, 'population.ndjson'), encoding='utf-8') if l.strip()]

os.makedirs(OUT, exist_ok=True)
diff = []
n = 0
with open(os.path.join(OUT, 'pairs.ndjson'), 'w', encoding='utf-8') as out:
    for row in pop:
        if row['status'] != 'ok':
            continue
        n += 1
        d = os.path.join(STORE, row['fullName'].replace('/', '__'))
        text = open(os.path.join(d, row['lockfile']), encoding='utf-8').read()
        lock = o1b.parse(row['lockfile'], text)
        man = o1b.read_manifests(d, row) if lock['decls'] is None else []
        direct, _ = o1b.declared_sets(lock, man)
        first = {}
        for node in lock['nodes']:
            if node.kind == 'link':
                continue
            first.setdefault((node.name, node.version), node.kind)
        pairs = sorted(k for k, kind in first.items()
                       if kind == 'registry' and k in reg and reg[k]['status'] == 'ok' and reg[k].get('hasInstallScript'))
        got = {'versions': len(pairs), 'names': len({p[0] for p in pairs}), 'direct': sum(1 for p in pairs if p[0] in direct)}
        pub = cells[row['fullName']]['install']
        if any(got[k] != pub[k] for k in got):
            diff.append({'project': row['fullName'], 'got': got, 'published': {k: pub[k] for k in got}})
        rec = {'fullName': row['fullName'], 'manager': lock['manager'], 'lockfileVersion': lock['version'],
               'pairs': [list(p) for p in pairs], 'install': got}
        if lock['manager'] == 'npm':
            # versions npm installs from inside their parent's tarball: both paths install them as ordinary
            # dependencies; npm 12 never runs their scripts, npm 10 and 11 do
            j, bundled = json.loads(text), set()
            for path, p in (j.get('packages') or {}).items():
                if isinstance(p, dict) and p.get('inBundle') and 'node_modules/' in path:
                    bundled.add((p.get('name') or path.rsplit('node_modules/', 1)[1], str(p.get('version'))))

            def walk(deps):
                for nm, p in (deps or {}).items():
                    if isinstance(p, dict):
                        if p.get('bundled'):
                            bundled.add((nm, str(p.get('version'))))
                        walk(p.get('dependencies'))
            walk(j.get('dependencies') if not j.get('packages') else None)
            rec['bundled'] = [list(p) for p in pairs if p in bundled]
        if lock['manager'] == 'yarn-berry':
            meta = o1b.yaml_load(text).get('__metadata') or {}
            rec['berryMetadata'] = {k: str(meta[k]) for k in ('version', 'cacheKey') if k in meta}
        out.write(json.dumps(rec, sort_keys=True) + '\n')
c1 = {'projects': n, 'withInstallCode': sum(1 for c in cells.values() if c['install']['versions'] > 0),
      'different': diff}
json.dump(c1, open(os.path.join(OUT, 'c1.json'), 'w'), indent=1, sort_keys=True)
print(f'C1: {n} projects, install.versions, install.names and install.direct equal to the published cells '
      f'in {n - len(diff)}, different in {len(diff)}', file=sys.stderr)
sys.exit(1 if diff else 0)
