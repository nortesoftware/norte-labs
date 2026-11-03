#!/usr/bin/env python3
"""ecosystems/npm option 3: the inputs, fetched once, every request with the norte-labs User-Agent.

1. Norte-labs dataset v2 from Zenodo (record 23090947), each file's md5 checked against the record,
   extracted, every file checked against its SHA256SUMS; then option 1's fetch_store.py builds the
   store of lockfiles from it.
2. For each project with install code, its configuration at the pinned commit (the files the plan
   names), from raw.githubusercontent.com, or from Software Heritage by the commit when GitHub does
   not serve it; a 404 is recorded as absent.
3. Each install-code version's document from registry.npmjs.org, and for esbuild and
   @anthropic-ai/claude-code the documents of their optional dependencies.
4. Bun's built-in trusted list at bun-v1.4.3, and pnpm's CHANGELOG at v10.34.7.

A project whose commit neither GitHub nor Software Heritage serves has its files recorded as
unavailable. Run again on the same inputs dir, it keeps what an earlier fetch kept, after the same
checks, and fetches the rest.

usage: fetch_inputs.py <instruction-gap results dir> <option1 dir> <inputs dir>
"""
import gzip, hashlib, json, os, re, shutil, subprocess, sys, tarfile, time, urllib.error, urllib.parse, urllib.request

UA = 'norte-labs measurement (chris@nortesoftware.dev)'
RES, OPT1, IN = sys.argv[1:4]
os.makedirs(IN, exist_ok=True)
LOG = open(os.path.join(IN, 'inputs.log'), 'a')


def log(*a):
    print(*a, file=LOG, flush=True)
    print(*a, file=sys.stderr, flush=True)


def get(url, tries=4):
    """Bytes, or None for a 404."""
    err = None
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            err = e
        except Exception as e:
            err = e
        time.sleep(5 * (attempt + 1) if not (isinstance(err, urllib.error.HTTPError) and err.code == 429) else 60)
    raise RuntimeError(f'{url}: {err}')


def blob(data):
    return hashlib.sha1(b'blob %d\0' % len(data) + data).hexdigest()


def sha256(data):
    return hashlib.sha256(data).hexdigest()


# ---- 1. dataset v2 and the store

ds_dir = os.path.join(IN, 'dataset')
os.makedirs(os.path.join(ds_dir, 'download'), exist_ok=True)
rec = json.loads(get('https://zenodo.org/api/records/23090947'))
for f in rec['files']:
    algo, want = f['checksum'].split(':', 1)
    dest = os.path.join(ds_dir, 'download', f['key'])
    kept = os.path.exists(dest) and hashlib.new(algo, open(dest, 'rb').read()).hexdigest() == want
    data = open(dest, 'rb').read() if kept else get(f['links']['self'])
    got = hashlib.new(algo, data).hexdigest()
    log(f"dataset {f['key']}: {len(data)} bytes, {algo} {'equal' if got == want else 'DIFFERENT ' + got}{', kept' if kept else ''}")
    if got != want:
        sys.exit(1)
    if not kept:
        with open(dest, 'wb') as out:
            out.write(data)
tgz = [k for k in os.listdir(os.path.join(ds_dir, 'download')) if k.endswith('.tar.gz')]
assert len(tgz) == 1, tgz
ex = os.path.join(ds_dir, 'x')
if not os.path.exists(ex):
    os.makedirs(ex)
    with tarfile.open(os.path.join(ds_dir, 'download', tgz[0])) as t:
        t.extractall(ex, filter='data')
root = [os.path.dirname(os.path.join(dp, 'SHA256SUMS')) for dp, dn, fn in os.walk(ex) if 'SHA256SUMS' in fn]
assert len(root) == 1, root
root = root[0]
bad = n = 0
for line in open(os.path.join(root, 'SHA256SUMS'), encoding='utf-8'):
    if not line.strip():
        continue
    want, rel = line.rstrip('\n').split(None, 1)
    rel = rel.lstrip('*')
    n += 1
    if sha256(open(os.path.join(root, rel), 'rb').read()) != want:
        bad += 1
log(f'dataset files checked against SHA256SUMS: {n}, different {bad}')
if bad:
    sys.exit(1)
for name in ('cells.ndjson', 'population.ndjson', 'registry.ndjson.gz'):
    a, b = open(os.path.join(root, 'npm', name), 'rb').read(), open(os.path.join(RES, name), 'rb').read()
    log(f'dataset npm/{name} equal to instruction-gap results/{name}: {a == b}')
    if a != b:
        sys.exit(1)
store = os.path.join(IN, 'store')
r = subprocess.run([sys.executable, '-I', os.path.join(OPT1, 'fetch_store.py'), root, store,
                    os.path.join(IN, 'fetch-store.log')], capture_output=True, text=True)
log(f'fetch_store.py exit {r.returncode}: {r.stdout.strip()} {r.stderr.strip()}')
if r.returncode:
    sys.exit(1)

# ---- 2. configuration at each pinned commit

cells = {json.loads(l)['fullName']: json.loads(l) for l in open(os.path.join(RES, 'cells.ndjson'), encoding='utf-8') if l.strip()}
pop = {json.loads(l)['fullName']: json.loads(l) for l in open(os.path.join(RES, 'population.ndjson'), encoding='utf-8') if l.strip()}
projects = sorted(n for n, c in cells.items() if c['install']['versions'] > 0)


def pin_manager(pm):
    m = re.match(r'^(npm|pnpm|yarn|bun)@(\d+)\.', pm or '')
    return m.group(1) if m else None


def files_for(name):
    m, p = cells[name]['manager'], pin_manager(pop[name]['packageManager'])
    pin_v1 = p == 'yarn' and re.match(r'^yarn@1\.', pop[name]['packageManager'] or '')
    want = ['package.json', '.npmrc']
    if m == 'pnpm' or p == 'pnpm':
        want += ['pnpm-workspace.yaml', '.pnpmfile.cjs', '.pnpmfile.mjs']
    if m == 'yarn' or pin_v1:
        want += ['.yarnrc', '.yarnrc.yml']
    if m == 'yarn-berry' and '.yarnrc.yml' not in want:
        want += ['.yarnrc.yml']
    if m == 'bun':
        want += ['bunfig.toml']
    return want


swh_dirs = {}


def swh_root(sha):
    """Software Heritage's listing of the commit's root directory, {name: entry}, or None."""
    if sha not in swh_dirs:
        data = get(f'https://archive.softwareheritage.org/api/1/revision/{sha}/directory/')
        time.sleep(1)
        swh_dirs[sha] = None if data is None else {e['name']: e for e in json.loads(data).get('content', [])}
    return swh_dirs[sha]


def fetch_config(name, rel, via_swh):
    sha = pop[name]['sha']
    if not via_swh:
        url = f'https://raw.githubusercontent.com/{name}/{sha}/{urllib.parse.quote(rel)}'
        data = get(url)
        time.sleep(0.2)
        return data, url
    listing = swh_root(sha)
    if listing is None:
        raise RuntimeError(f'{name}: neither GitHub nor Software Heritage has {sha}')
    e = listing.get(rel)
    if e is None or e.get('type') != 'file':
        return None, f'swh:{sha}/{rel}'
    url = f"https://archive.softwareheritage.org/api/1/content/sha1_git:{e['target']}/raw/"
    data = get(url)
    time.sleep(1)
    return data, url


cfg_dir = os.path.join(IN, 'config')
counts = {'present': 0, 'absent': 0, 'unavailable': 0}
earlier = {}
if os.path.exists(os.path.join(IN, 'config.ndjson')):
    for l in open(os.path.join(IN, 'config.ndjson'), encoding='utf-8'):
        r = json.loads(l)
        earlier.setdefault(r['project'], []).append(r)


def kept_rows(name, d):
    """The rows an earlier fetch wrote for this project, if each file it kept is still the same bytes."""
    rows = earlier.get(name)
    if not rows or not {r['file'] for r in rows} >= set(files_for(name)):
        return None
    for r in rows:
        p = os.path.join(d, r['file'].replace('/', '__'))
        if r['status'] == 'present' and not (os.path.exists(p) and sha256(open(p, 'rb').read()) == r['sha256']):
            return None
    return rows


with open(os.path.join(IN, 'config.ndjson.new'), 'w') as out:
    for name in projects:
        d = os.path.join(cfg_dir, name.replace('/', '__'))
        rows = kept_rows(name, d)
        if rows is not None:
            for r in rows:
                counts[r['status']] += 1
                out.write(json.dumps(r, sort_keys=True) + '\n')
            continue
        shutil.rmtree(d, ignore_errors=True)
        os.makedirs(d)
        want = files_for(name)
        data, url = fetch_config(name, 'package.json', False)
        via_swh = data is None          # every project has a package.json: a 404 means GitHub lost the commit
        if via_swh and swh_root(pop[name]['sha']) is None:
            for rel in want:
                counts['unavailable'] += 1
                out.write(json.dumps({'project': name, 'file': rel, 'status': 'unavailable',
                                      'url': f"https://raw.githubusercontent.com/{name}/{pop[name]['sha']}/{rel}"}, sort_keys=True) + '\n')
            log(f'{name}: neither GitHub nor Software Heritage serves {pop[name]["sha"]}; its configuration is unavailable')
            continue
        extra = []
        for rel in want:
            if rel != 'package.json' or via_swh:
                data, url = fetch_config(name, rel, via_swh)
            if data is not None and rel in ('package.json', 'pnpm-workspace.yaml'):
                text = data.decode('utf-8', 'replace')
                m = re.search(r'"onlyBuiltDependenciesFile"\s*:\s*"([^"]+)"', text) or re.search(r'(?m)^onlyBuiltDependenciesFile:\s*["\']?([^"\'\n]+)', text)
                if m and m.group(1).strip() not in want + extra:
                    extra.append(m.group(1).strip())
            row = {'project': name, 'file': rel, 'url': url}
            if data is None:
                row['status'] = 'absent'
            else:
                row.update(status='present', bytes=len(data), sha256=sha256(data), sha1Git=blob(data))
                with open(os.path.join(d, rel.replace('/', '__')), 'wb') as f:
                    f.write(data)
            counts[row['status']] += 1
            out.write(json.dumps(row, sort_keys=True) + '\n')
        for rel in extra:
            data, url = fetch_config(name, rel, via_swh)
            row = {'project': name, 'file': rel, 'url': url, 'named': 'onlyBuiltDependenciesFile'}
            if data is None:
                row['status'] = 'absent'
            else:
                row.update(status='present', bytes=len(data), sha256=sha256(data), sha1Git=blob(data))
                with open(os.path.join(d, rel.replace('/', '__')), 'wb') as f:
                    f.write(data)
            counts[row['status']] += 1
            out.write(json.dumps(row, sort_keys=True) + '\n')
os.replace(os.path.join(IN, 'config.ndjson.new'), os.path.join(IN, 'config.ndjson'))
log(f'configuration files for {len(projects)} projects: ' + ', '.join(f'{k} {v}' for k, v in counts.items()))

# ---- 3. version documents

reg = {}
with gzip.open(os.path.join(RES, 'registry.ndjson.gz'), 'rt', encoding='utf-8') as f:
    for l in f:
        if l.strip():
            r = json.loads(l)
            if r['status'] == 'ok' and r.get('hasInstallScript'):
                reg[(r['name'], r['version'])] = r
KEEP = ('name', 'version', 'scripts', 'os', 'cpu', 'libc', 'optionalDependencies', 'gypfile', 'bundleDependencies', 'bundledDependencies')
docs_dir = os.path.join(IN, 'docs')
os.makedirs(os.path.join(docs_dir, 'raw'), exist_ok=True)


earlier_docs = {}
for f in ('versions.ndjson', 'optional.ndjson'):
    if os.path.exists(os.path.join(docs_dir, f)):
        for l in open(os.path.join(docs_dir, f), encoding='utf-8'):
            r = json.loads(l)
            earlier_docs[(r['name'], r['version'])] = r


def raw_path(name, version):
    return os.path.join(docs_dir, 'raw', re.sub(r'[^A-Za-z0-9.@-]', '_', f'{name}@{version}') + '.json')


def doc(name, version):
    r = earlier_docs.get((name, version))
    if r and r['status'] == 'ok' and os.path.exists(raw_path(name, version)) \
            and sha256(open(raw_path(name, version), 'rb').read()) == r['sha256']:
        return {k: r[k] for k in ('name', 'version', 'url', 'status', 'sha256', 'doc')}
    url = f'https://registry.npmjs.org/{name.replace("/", "%2f")}/{version}'
    data = get(url)
    time.sleep(0.05)
    row = {'name': name, 'version': version, 'url': url}
    if data is None:
        row['status'] = 'missing'
        return row
    j = json.loads(data)
    with open(raw_path(name, version), 'wb') as f:
        f.write(data)
    row.update(status='ok', sha256=sha256(data), doc={k: j[k] for k in KEEP if k in j})
    return row


opt_wanted = []
with open(os.path.join(docs_dir, 'versions.ndjson'), 'w') as out:
    for (name, version) in sorted(reg):
        row = doc(name, version)
        out.write(json.dumps(row, sort_keys=True) + '\n')
        if row['status'] == 'ok' and name in ('esbuild', '@anthropic-ai/claude-code'):
            for on, spec in sorted((row['doc'].get('optionalDependencies') or {}).items()):
                opt_wanted.append((on, spec, f'{name}@{version}'))
log(f'version documents: {len(reg)} install-code versions')
def vkey(v):
    m = re.match(r'^(\d+)\.(\d+)\.(\d+)$', v)
    return tuple(int(x) for x in m.groups()) if m else None


def resolve(name, spec):
    """The version a fresh resolution takes for a caret or tilde range: the highest release it admits."""
    m = re.match(r'^([~^])(\d+)\.(\d+)\.(\d+)$', spec)
    if not m:
        return None
    low = tuple(int(x) for x in m.group(2, 3, 4))
    if m.group(1) == '~':
        high = (low[0], low[1] + 1, 0)
    elif low[0] > 0:
        high = (low[0] + 1, 0, 0)
    elif low[1] > 0:
        high = (0, low[1] + 1, 0)
    else:
        high = (0, 0, low[2] + 1)
    data = get(f'https://registry.npmjs.org/{name.replace("/", "%2f")}')
    time.sleep(0.05)
    ok = [v for v in json.loads(data)['versions'] if vkey(v) and low <= vkey(v) < high]
    return max(ok, key=vkey) if ok else None


seen = set()
with open(os.path.join(docs_dir, 'optional.ndjson'), 'w') as out:
    for on, spec, parent in opt_wanted:
        if (on, spec) in seen:
            continue
        seen.add((on, spec))
        version = spec if re.match(r'^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$', spec) else resolve(on, spec)
        if version is None:
            log(f'optional dependency {on}@{spec} of {parent}: no exact version, and not a caret or tilde range with a release')
            sys.exit(1)
        out.write(json.dumps({**doc(on, version), 'spec': spec}, sort_keys=True) + '\n')
log(f'optional dependencies of esbuild and @anthropic-ai/claude-code: {len(seen)} documents')

# ---- 4. Bun's built-in list and pnpm's changelog

for url, dest in [('https://raw.githubusercontent.com/oven-sh/bun/bun-v1.4.3/src/install/default-trusted-dependencies.txt', 'bun-default-trusted.txt'),
                  ('https://raw.githubusercontent.com/pnpm/pnpm/v10.34.7/pnpm/CHANGELOG.md', 'pnpm-CHANGELOG-v10.34.7.md')]:
    data = get(url)
    if data is None:
        log(f'{url}: 404')
        sys.exit(1)
    with open(os.path.join(IN, dest), 'wb') as f:
        f.write(data)
    log(f'{url}: {len(data)} bytes, sha256 {sha256(data)}')
log('done')
