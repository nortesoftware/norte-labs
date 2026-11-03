#!/usr/bin/env python3
"""ecosystems/npm option 3, path B: the managers themselves, each on a replica of a project, and the
controls. Runs inside the sandbox without network (run.sh); a registry on 127.0.0.1, in this
process, serves stand-ins whose install-time scripts append "<name>@<version> <script>" to a marker
file. Projects and controls are run one after another; each install starts from a new directory.

usage: replicas.py --controls <controls dir> <opt dir> <work dir> <out file>
       replicas.py <inputs dir> <results dir> <pairs.ndjson> <opt dir> <work dir> <out file>
"""
import base64, gzip, hashlib, http.server, io, json, os, re, shutil, subprocess, sys, tarfile, threading, urllib.parse

KINDS = ('preinstall', 'install', 'postinstall')
TIME = '2020-01-01T00:00:00.000Z'
TIMEOUT = 600


# ---- the registry

def semver_key(v):
    m = re.match(r'^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?', v or '')
    return (int(m.group(1)), int(m.group(2)), int(m.group(3)), 0 if m.group(4) else 1, m.group(4) or '') if m else (-1,)


def tarball(manifest):
    pj = (json.dumps(manifest, indent=2, sort_keys=True) + '\n').encode()
    buf = io.BytesIO()
    with gzip.GzipFile(filename='', fileobj=buf, mode='wb', mtime=0, compresslevel=9) as gz:
        with tarfile.open(fileobj=gz, mode='w', format=tarfile.USTAR_FORMAT) as t:
            ti = tarfile.TarInfo('package/package.json')
            ti.size, ti.mtime, ti.mode, ti.uid, ti.gid, ti.uname, ti.gname = len(pj), 0, 0o644, 0, 0, '', ''
            t.addfile(ti, io.BytesIO(pj))
    return buf.getvalue()


class Registry:
    def __init__(self):
        self.packuments, self.tarballs = {}, {}
        reg = self

        class H(http.server.BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def answer(self, body):
                path = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
                if path in reg.tarballs:
                    data, ctype = reg.tarballs[path], 'application/octet-stream'
                elif path.lstrip('/') in reg.packuments:
                    data, ctype = json.dumps(reg.packuments[path.lstrip('/')]).encode(), 'application/json'
                else:
                    data, ctype = b'{"error":"not found"}', 'application/json'
                    self.send_response(404)
                    self.send_header('Content-Type', ctype)
                    self.send_header('Content-Length', str(len(data)))
                    self.end_headers()
                    if body:
                        self.wfile.write(data)
                    return
                self.send_response(200)
                self.send_header('Content-Type', ctype)
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                if body:
                    self.wfile.write(data)

            def do_GET(self):
                self.answer(True)

            def do_HEAD(self):
                self.answer(False)

        self.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), H)
        self.server.daemon_threads = True
        self.url = f'http://127.0.0.1:{self.server.server_address[1]}'
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def add(self, manifest):
        name, version = manifest['name'], manifest['version']
        data = tarball(manifest)
        path = f"/{name}/-/{name.split('/')[-1]}-{version}.tgz"
        self.tarballs[path] = data
        v = dict(manifest)
        v['_id'] = f'{name}@{version}'
        v['dist'] = {'tarball': self.url + path, 'shasum': hashlib.sha1(data).hexdigest(),
                     'integrity': 'sha512-' + base64.b64encode(hashlib.sha512(data).digest()).decode()}
        p = self.packuments.setdefault(name, {'name': name, 'dist-tags': {}, 'versions': {},
                                              'time': {'created': TIME, 'modified': TIME}})
        p['versions'][version] = v
        p['time'][version] = TIME
        p['dist-tags']['latest'] = max(p['versions'], key=semver_key)


def lowest(rng):
    """The lowest version a simple range admits (its first alternative), or None."""
    if rng.strip() in ('*', '', 'x', 'latest'):
        return '1.0.0'
    m = re.match(r'^\s*(\^|~|>=|=)?\s*v?(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?\s*$', rng.split('||')[0])
    if not m:
        return None
    return '.'.join(x if x and x.isdigit() else '0' for x in m.group(2, 3, 4))


def stand_in(name, version, kinds, marks_file, extra=None):
    m = {'name': name, 'version': version}
    if kinds:
        m['scripts'] = {k: f"echo '{name}@{version} {k}' >> '{marks_file}'" for k in kinds}
    for k, v in (extra or {}).items():
        if v:
            m[k] = v
    return m


# ---- running one install

class Runner:
    def __init__(self, opt, work, registry):
        self.opt, self.work, self.reg = opt, work, registry
        node_dir = os.path.join(opt, 'node-22.23.4', 'node-v22.23.4-linux-x64')
        self.node_bin = os.path.join(node_dir, 'bin')
        node = os.path.join(self.node_bin, 'node')
        self.cmd = {
            'npm-12.2.1': [node, os.path.join(opt, 'npm-12.2.1/package/bin/npm-cli.js'), 'install'],
            'npm-11.21.1': [node, os.path.join(opt, 'npm-11.21.1/package/bin/npm-cli.js'), 'install'],
            'npm-10.9.9': [node, os.path.join(node_dir, 'lib/node_modules/npm/bin/npm-cli.js'), 'install'],
            'pnpm-9.15.9': [node, os.path.join(opt, 'pnpm-9.15.9/package/bin/pnpm.cjs'), 'install'],
            'pnpm-10.34.7': [node, os.path.join(opt, 'pnpm-10.34.7/package/bin/pnpm.cjs'), 'install'],
            'pnpm-12.14.0': [os.path.join(opt, 'pnpm-12.14.0/pnpm'), 'install'],
            'bun-1.4.3': [os.path.join(opt, 'bun-1.4.3/bun-linux-x64/bun'), 'install'],
            'yarn-4.13.0': [node, os.path.join(opt, 'yarn-4.13.0/package/bin/yarn.js'), 'install'],
            'yarn-4.18.1': [node, os.path.join(opt, 'yarn-4.18.1/package/bin/yarn.js'), 'install'],
            'yarn-1.22.22': [node, os.path.join(opt, 'yarn-1.22.22/package/bin/yarn.js'), 'install'],
        }
        self.marks = os.path.join(work, 'marks.log')
        self.n = 0

    def env(self, release, rdir):
        home = os.path.join(rdir, 'home')
        e = {'PATH': f'{self.node_bin}:/usr/bin:/bin', 'HOME': home, 'LANG': 'C.UTF-8',
             'XDG_CONFIG_HOME': os.path.join(home, '.config'), 'XDG_DATA_HOME': os.path.join(home, '.local/share'),
             'XDG_CACHE_HOME': os.path.join(home, '.cache'), 'XDG_STATE_HOME': os.path.join(home, '.local/state'),
             'TMPDIR': os.path.join(rdir, 'tmp'), 'npm_config_cache': os.path.join(home, '.npm'),
             'PNPM_HOME': os.path.join(home, '.pnpm-home'), 'BUN_INSTALL_CACHE_DIR': os.path.join(home, '.bun-cache')}
        url = self.reg.url + '/'
        if release.startswith('npm-') or release in ('pnpm-9.15.9', 'pnpm-10.34.7'):
            e['npm_config_registry'] = url
        elif release == 'pnpm-12.14.0':
            e['pnpm_config_registry'] = url
        elif release == 'yarn-1.22.22':
            e['npm_config_registry'] = url
            e['YARN_REGISTRY'] = url
        elif release.startswith('yarn-4'):
            e['YARN_NPM_REGISTRY_SERVER'] = self.reg.url
            e['YARN_UNSAFE_HTTP_WHITELIST'] = '127.0.0.1'
        elif release == 'bun-1.4.3':
            e['BUN_CONFIG_REGISTRY'] = url
        for d in (home, e['TMPDIR'], e['XDG_CONFIG_HOME'], e['XDG_DATA_HOME'], e['XDG_CACHE_HOME'], e['XDG_STATE_HOME']):
            os.makedirs(d, exist_ok=True)
        return e

    def install(self, release, files):
        """files: {relative path: bytes}. Returns (marks, exit class, output tail)."""
        self.n += 1
        rdir = os.path.join(self.work, 'r', str(self.n))
        proj = os.path.join(rdir, 'p')
        os.makedirs(proj)
        for rel, data in files.items():
            p = os.path.join(proj, rel)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, 'wb') as f:
                f.write(data)
        open(self.marks, 'w').close()
        try:
            r = subprocess.run(self.cmd[release], cwd=proj, env=self.env(release, rdir), stdin=subprocess.DEVNULL,
                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=TIMEOUT)
            code, out = r.returncode, r.stdout
        except subprocess.TimeoutExpired as e:
            code, out = 'timeout', e.stdout or b''
        marks = sorted({l.strip() for l in open(self.marks, encoding='utf-8') if l.strip()})
        shutil.rmtree(rdir, ignore_errors=True)
        tail = out.decode('utf-8', 'replace').splitlines()[-30:]
        return marks, ('0' if code == 0 else 'timeout' if code == 'timeout' else 'fail'), {'code': code, 'tail': tail}


# ---- controls

def controls(cdir, opt, work, outf):
    reg = Registry()
    runner = Runner(opt, work, reg)
    for p in json.load(open(os.path.join(cdir, 'packages.json'))):
        extra = {k: p.get(k) for k in ('os', 'cpu', 'dependencies', 'optionalDependencies')}
        reg.add(stand_in(p['name'], p['version'], p.get('scripts') or [], runner.marks, extra))
    ctl = json.load(open(os.path.join(cdir, 'controls.json')))
    exp = json.load(open(os.path.join(cdir, 'expected.json')))
    failed = 0
    with open(outf, 'w') as out, gzip.open(outf + '.log.gz', 'wt') as log:
        for cid in sorted(ctl):
            if cid == 'K0-network':
                node = os.path.join(runner.node_bin, 'node')
                r = subprocess.run([node, '-e', "fetch('https://registry.npmjs.org/').then(()=>process.exit(0),()=>process.exit(1))"],
                                   capture_output=True, timeout=120)
                marks, ex, info = [], '0' if r.returncode == 0 else 'fail', {'code': r.returncode}
            else:
                files = {rel: text.encode() for rel, text in ctl[cid]['files'].items()}
                marks, ex, info = runner.install(ctl[cid]['release'], files)
            ok = marks == exp[cid]['marks'] and ex == exp[cid]['exit']
            failed += not ok
            out.write(json.dumps({'control': cid, 'release': ctl[cid]['release'], 'marks': marks, 'exit': ex,
                                  'pass': ok}, sort_keys=True) + '\n')
            log.write(json.dumps({'control': cid, **info}) + '\n')
            print(f"{cid}: {'pass' if ok else 'FAIL'} {ex} {marks}", file=sys.stderr, flush=True)
    print(f'controls: {len(ctl)}, failed {failed}', file=sys.stderr)
    return failed


# ---- replicas

def load_rules_module():
    import importlib.util
    here = os.path.dirname(os.path.abspath(__file__))
    spec = importlib.util.spec_from_file_location('rules_pins', os.path.join(here, 'pins.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


DROP_PKG = ('dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies', 'peerDependenciesMeta',
            'bundleDependencies', 'bundledDependencies', 'scripts', 'overrides', 'resolutions', 'packageManager',
            'devEngines', 'engines', 'workspaces', 'patchedDependencies')
DROP_PNPM_FIELD = ('overrides', 'patchedDependencies', 'packageExtensions', 'configDependencies', 'executionEnv')
NPMRC_DROP = re.compile(r'^\s*(registry|@[^:=\s]+:registry|//.*|_auth\w*|_password|username|email|always-auth|strict-ssl|'
                        r'cafile|ca|ca\[\]|cert|key|proxy|https-proxy|http-proxy|noproxy|no-proxy|use-node-version|'
                        r'node-mirror:.*|yarn-path|--registry|--yarn-path|'
                        r'frozen-lockfile|--frozen-lockfile|--install\.frozen-lockfile|pure-lockfile|--pure-lockfile)\s*(=|\s|$)', re.I)
YARNRC_YML_DROP = ('yarnPath', 'plugins', 'npmRegistryServer', 'npmScopes', 'npmAuthToken', 'npmAuthIdent', 'npmAlwaysAuth',
                   'npmPublishRegistry', 'unsafeHttpWhitelist', 'httpProxy', 'httpsProxy', 'caFilePath', 'httpsCaFilePath',
                   'httpsCertFilePath', 'httpsKeyFilePath', 'enableStrictSsl', 'networkSettings', 'packageExtensions',
                   'enableImmutableInstalls')
PNPM_WS_DROP = ('overrides', 'patchedDependencies', 'packageExtensions', 'configDependencies', 'registries', 'registry',
                'httpProxy', 'httpsProxy', 'noProxy', 'strictSsl', 'ca', 'cert', 'key', 'localAddress', 'useNodeVersion',
                'executionEnv', 'nodeDownloadMirrors', 'frozenLockfile')


def drop_yaml_keys(text, keys):
    """Removes top-level keys, with their indented or list blocks, line by line."""
    out, skipping = [], False
    for line in text.splitlines(keepends=True):
        top = re.match(r'^(["\']?)([A-Za-z0-9_@/.-]+)\1\s*:', line)
        if top and not line[0].isspace():
            skipping = top.group(2) in keys
        elif skipping and line.strip() and not line[0].isspace() and not line.lstrip().startswith('-'):
            skipping = False
        if not skipping:
            out.append(line)
    return ''.join(out)


def drop_lines(text, rx):
    return ''.join(l for l in text.splitlines(keepends=True) if not rx.match(l))


def drop_bunfig(text):
    out, section = [], ''
    for line in text.splitlines(keepends=True):
        m = re.match(r'^\s*\[\s*([^\]]+?)\s*\]', line)
        if m:
            section = m.group(1)
        if section.startswith('install.scopes') or section.startswith('install.registry'):
            continue
        if section == 'install' and re.match(r'^\s*(registry|frozenLockfile)\s*=', line):
            continue
        out.append(line)
    return ''.join(out)


CONFIG_FILES = ('.npmrc', '.yarnrc', '.yarnrc.yml', 'pnpm-workspace.yaml', 'bunfig.toml')
NOT_COPIED = ('package.json', '.pnpmfile.cjs', '.pnpmfile.mjs')


def build(proj, cfgdir, docs, optional_docs, release, rule, holders_out):
    """The replica's files, and notes."""
    notes = []
    files = {}
    raw = open(os.path.join(cfgdir, 'package.json'), 'rb').read() if os.path.exists(os.path.join(cfgdir, 'package.json')) else None
    try:
        pkg = json.loads(raw.decode('utf-8').lstrip('﻿'))
        assert isinstance(pkg, dict)
    except Exception:
        pkg = None
    for name in sorted(os.listdir(cfgdir)):
        if name in NOT_COPIED:
            continue
        text = open(os.path.join(cfgdir, name), 'rb').read().decode('utf-8', 'replace')
        if name in ('.npmrc', '.yarnrc'):
            text = drop_lines(text, NPMRC_DROP)
        elif name == '.yarnrc.yml':
            text = drop_yaml_keys(text, YARNRC_YML_DROP)
        elif name == 'pnpm-workspace.yaml':
            text = drop_yaml_keys(text, PNPM_WS_DROP)
        elif name == 'bunfig.toml':
            text = drop_bunfig(text)
        files[name.replace('__', '/')] = text.encode()
    if pkg is None:
        files['package.json'] = raw if raw is not None else b''
        notes.append('package.json is not JSON; copied as it is, without stand-ins')
        return files, notes
    for k in DROP_PKG:
        pkg.pop(k, None)
    if isinstance(pkg.get('pnpm'), dict):
        for k in DROP_PNPM_FIELD:
            pkg['pnpm'].pop(k, None)
    by_name = {}
    for n, v in proj['pairs']:
        if (n, v) in docs:
            by_name.setdefault(n, []).append(v)
    deps, opt = {}, {}
    for n in sorted(by_name):
        vs = sorted(by_name[n], key=semver_key)
        if n == pkg.get('name'):
            pkg['name'] = 'nl-replica-root'
            notes.append('root renamed: it bears the name of a dependency')
        constrained = lambda v: any(docs[(n, v)].get(k) for k in ('os', 'cpu', 'libc'))
        (opt if constrained(vs[0]) else deps)[n] = vs[0]
        for v in vs[1:]:
            h = 'nl-hold-' + hashlib.sha1(f'{n}@{v}'.encode()).hexdigest()[:16]
            holders_out[h] = (n, v, constrained(v))
            deps[h] = '1.0.0'
    if deps:
        pkg['dependencies'] = deps
    if opt:
        pkg['optionalDependencies'] = opt
    files['package.json'] = (json.dumps(pkg, indent=2) + '\n').encode()
    if release.startswith('yarn-4'):
        if proj['manager'] == 'yarn-berry':
            meta = proj.get('berryMetadata') or {}
            head = '__metadata:\n' + ''.join(f'  {k}: {meta[k]}\n' for k in ('version', 'cacheKey') if k in meta)
            files['yarn.lock'] = head.encode()
        elif proj['manager'] == 'yarn':
            files['yarn.lock'] = b'# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.\n# yarn lockfile v1\n\n\n'
    return files, notes


def replicas(inputs, res, pairs_f, opt, work, outf):
    pins = load_rules_module()
    pop = {json.loads(l)['fullName']: json.loads(l) for l in open(os.path.join(res, 'population.ndjson'), encoding='utf-8') if l.strip()}
    docs, optional_docs = {}, {}
    for l in open(os.path.join(inputs, 'docs', 'versions.ndjson'), encoding='utf-8'):
        r = json.loads(l)
        if r['status'] == 'ok':
            docs[(r['name'], r['version'])] = r['doc']
    optional_rows = []
    for l in open(os.path.join(inputs, 'docs', 'optional.ndjson'), encoding='utf-8'):
        r = json.loads(l)
        if r['status'] == 'ok':
            optional_docs[(r['name'], r['spec'])] = r['doc']      # keyed as the parent names it
            optional_rows.append(r)
    projects = [json.loads(l) for l in open(pairs_f, encoding='utf-8')]
    projects = [p for p in projects if p['pairs']]
    unavailable = {json.loads(l)['project'] for l in open(os.path.join(inputs, 'config.ndjson'), encoding='utf-8')
                   if json.loads(l)['status'] == 'unavailable'}
    reg = Registry()
    runner = Runner(opt, work, reg)
    # optional dependencies of esbuild and @anthropic-ai/claude-code: empty packages with their os, cpu and libc
    served = set()
    for r in sorted(optional_rows, key=lambda r: (r['name'], r['version'])):
        n, v, d = r['name'], r['version'], r['doc']
        if (n, v) not in docs and (n, v) not in served:
            served.add((n, v))
            reg.add(stand_in(n, v, [], runner.marks, {k: d.get(k) for k in ('os', 'cpu', 'libc')}))
    for (n, v), d in sorted(docs.items()):
        extra = {k: d.get(k) for k in ('os', 'cpu', 'libc')}
        if n in ('esbuild', '@anthropic-ai/claude-code'):
            extra['optionalDependencies'] = {on: ov for on, ov in (d.get('optionalDependencies') or {}).items()
                                             if (on, ov) in optional_docs or (on, ov) in docs}
        ks = [k for k in KINDS if isinstance(d.get('scripts'), dict) and d['scripts'].get(k)]
        if not ks and d.get('gypfile'):
            ks = ['install']
        reg.add(stand_in(n, v, ks, runner.marks, extra))
    holders = {}
    plans = []
    for proj in projects:
        name = proj['fullName']
        rel_a = pins.release_a(proj['manager'])
        rel_b = pins.release_for_pin(pop[name]['packageManager']) or rel_a
        rules = [('A', rel_a), ('B', rel_b)] + ([('A-yarn-4.18.1', 'yarn-4.18.1')] if proj['manager'] == 'yarn' else [])
        cfgdir = os.path.join(inputs, 'config', name.replace('/', '__'))
        for rule, release in rules:
            if name in unavailable:
                plans.append((name, rule, release, None, ['configuration unavailable'], rel_a))
                continue
            files, notes = build(proj, cfgdir, docs, optional_docs, release, rule, holders)
            plans.append((name, rule, release, files, notes, rel_a))
    for h, (n, v, constrained) in sorted(holders.items()):
        reg.add({'name': h, 'version': '1.0.0', ('optionalDependencies' if constrained else 'dependencies'): {n: v}})
    done = {}
    with open(outf, 'w') as out, gzip.open(outf + '.log.gz', 'wt') as log:
        for i, (name, rule, release, files, notes, rel_a) in enumerate(plans):
            if files is None:
                marks, ex = [], 'unavailable'
            elif rule == 'B' and release == rel_a:
                marks, ex = done[(name, 'A')]
                notes = notes + ['same release as rule A: result taken from A']
            else:
                marks, ex, info = runner.install(release, files)
                added = []
                if ex == 'fail' and release.startswith('yarn-4'):
                    for dep, rng in sorted(set(re.findall(r'YN0035: [^\w@]*(@?[^@\s]+)@npm:([^:]+): Package not found', '\n'.join(info['tail'])))):
                        v = lowest(rng)
                        if v and dep not in reg.packuments:
                            reg.add({'name': dep, 'version': v})
                            added.append(f'{dep}@{v}')
                    if added:
                        notes = notes + [f"served empty for Yarn's built-in package extensions: {', '.join(added)}"]
                        log.write(json.dumps({'project': name, 'rule': rule, 'release': release, **info}) + '\n')
                        marks, ex, info = runner.install(release, files)
                log.write(json.dumps({'project': name, 'rule': rule, 'release': release, **info}) + '\n')
            done[(name, rule)] = (marks, ex)
            out.write(json.dumps({'project': name, 'rule': rule, 'release': release, 'marks': marks, 'exit': ex,
                                  'notes': notes}, sort_keys=True) + '\n')
            out.flush()
            if i % 50 == 0:
                print(f'{i}/{len(plans)} {name} {rule} {release} {ex} {len(marks)}', file=sys.stderr, flush=True)
    print(f'replicas: {len(plans)} project-rules', file=sys.stderr)


if __name__ == '__main__':
    if sys.argv[1] == '--controls':
        sys.exit(1 if controls(*sys.argv[2:6]) else 0)
    replicas(*sys.argv[1:7])
