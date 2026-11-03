#!/usr/bin/env python3
"""ecosystems/npm option 3, 2026-10-28: the projects that pin pnpm 11, installed by pnpm 11.28.7, the
last release of that line; the run of 2026-10-22 installed them with pnpm 12.14.0 under both rules.

fetch    the inputs for those projects from the run's own records (runs/): their install-code pairs,
         every version document, and their configuration fetched again from the URLs
         runs/inputs-config.ndjson.gz records, each file's sha256 equal to the recorded one.
run      inside the sandbox without network (run-pnpm11.sh): C1 for those projects against the
         published cells; K0 and the eight controls of pnpm 12.14.0, on 12.14.0 and on 11.28.7, each
         with the outcome controls/expected.json fixes for 12.14.0; path A, the table's row for
         pnpm 12.14.0 applied to both releases; path B, replicas.py's replica of each project
         installed by pnpm 12.14.0 (rule A, which must give what the run of 2026-10-22 recorded) and
         by pnpm 11.28.7 (rule B).
compare  the stops, and pnpm 11.28.7 against pnpm 12.14.0, project by project.

usage: pnpm11.py fetch <results dir> <runs dir> <inputs dir>
       pnpm11.py run <option1 dir> <inputs dir> <results dir> <opt dir> <work dir> <out dir>
       pnpm11.py compare <runs dir> <out dir>      (out dir holds run1/ and run2/)
"""
import filecmp, gzip, hashlib, importlib.util, json, os, re, sys, time, urllib.error, urllib.request

UA = 'norte-labs measurement (chris@nortesoftware.dev)'
HERE = os.path.dirname(os.path.abspath(__file__))
OLD, NEW = 'pnpm-12.14.0', 'pnpm-11.28.7'
FILES = ['c1.json', 'controls.ndjson', 'decisions-a.ndjson', 'decisions-b.ndjson']


def rows(path):
    op = gzip.open if path.endswith('.gz') else open
    with op(path, 'rt', encoding='utf-8') as f:
        return [json.loads(l) for l in f if l.strip()]


def pins_pnpm11(pop, pairs):
    """The projects with install code whose packageManager pins pnpm 11, in pairs.ndjson's order."""
    return [p for p in pairs if p['pairs'] and re.match(r'^pnpm@11\.', pop[p['fullName']]['packageManager'] or '')]


# ---- fetch

def get(url, tries=4):
    err = None
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=120) as r:
                return r.read()
        except Exception as e:
            err = e
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(f'{url}: {err}')


def fetch(res, runs, inp):
    os.makedirs(os.path.join(inp, 'docs'))
    pop = {r['fullName']: r for r in rows(os.path.join(res, 'population.ndjson'))}
    sel = pins_pnpm11(pop, rows(os.path.join(runs, 'pairs.ndjson.gz')))
    names = {p['fullName'] for p in sel}
    with open(os.path.join(inp, 'pairs.ndjson'), 'w', encoding='utf-8') as out:
        for p in sel:
            out.write(json.dumps(p, sort_keys=True) + '\n')
    for src, dst in (('inputs-versions.ndjson.gz', 'versions.ndjson'), ('inputs-optional.ndjson.gz', 'optional.ndjson')):
        with gzip.open(os.path.join(runs, src), 'rb') as f, open(os.path.join(inp, 'docs', dst), 'wb') as out:
            out.write(f.read())
    bad = 0
    with open(os.path.join(inp, 'config.ndjson'), 'w', encoding='utf-8') as out, \
            open(os.path.join(inp, 'fetch.log'), 'w', encoding='utf-8') as log:
        for r in rows(os.path.join(runs, 'inputs-config.ndjson.gz')):
            if r['project'] not in names:
                continue
            out.write(json.dumps(r, sort_keys=True) + '\n')
            d = os.path.join(inp, 'config', r['project'].replace('/', '__'))
            os.makedirs(d, exist_ok=True)
            if r['status'] != 'present':
                log.write(f"{r['project']} {r['file']}: {r['status']}\n")
                continue
            data = get(r['url'])
            time.sleep(0.2)
            same = hashlib.sha256(data).hexdigest() == r['sha256']
            bad += not same
            log.write(f"{r['project']} {r['file']}: {r['url']} {len(data)} bytes, sha256 {'equal' if same else 'DIFFERENT'}\n")
            with open(os.path.join(d, r['file'].replace('/', '__')), 'wb') as f:
                f.write(data)
    print(f'fetch: {len(sel)} projects pin pnpm 11; configuration files different from the record: {bad}', file=sys.stderr)
    return 1 if bad else 0


# ---- run

def load(name, argv=None):
    if argv is not None:
        sys.argv = argv
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + '.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def run(opt1, inp, res, opt, work, out):
    rules = load('rules', ['rules.py', opt1, inp, res, os.path.join(inp, 'pairs.ndjson'), os.devnull])
    replicas = load('replicas')

    class Runner(replicas.Runner):
        """replicas.py's runner, with pnpm 11.28.7: its settings reader takes from the environment only
        the pnpm_config_ prefix (dist/pnpm.mjs:181485, 181849-181852)."""
        def __init__(self, *a):
            super().__init__(*a)
            self.cmd[NEW] = [os.path.join(self.node_bin, 'node'), os.path.join(self.opt, NEW, 'package/bin/pnpm.mjs'), 'install']

        def env(self, release, rdir):
            e = super().env(release, rdir)
            if release == NEW:
                e['pnpm_config_registry'] = self.reg.url + '/'
            return e

    replicas.Runner = Runner
    res_cells = {r['fullName']: r for r in rows(os.path.join(res, 'cells.ndjson'))}
    projects = rows(os.path.join(inp, 'pairs.ndjson'))
    fail = 0

    # C1: the recorded pairs of these projects against the published cells
    diff = []
    for p in projects:
        got = {'versions': len(p['pairs']), 'names': len({n for n, _ in p['pairs']}), 'direct': p['install']['direct']}
        pub = {k: res_cells[p['fullName']]['install'][k] for k in got}
        if got != pub or p['install'] != pub:
            diff.append({'project': p['fullName'], 'got': got, 'published': pub})
    json.dump({'projects': len(projects), 'different': diff}, open(os.path.join(out, 'c1.json'), 'w'), indent=1, sort_keys=True)
    print(f'C1: {len(projects)} projects, different {len(diff)}', file=sys.stderr)
    fail += bool(diff)

    # the controls: K0, and pnpm 12.14.0's eight on both releases, with 12.14.0's expected outcomes
    cdir = os.path.join(HERE, 'controls')
    ctl, exp = json.load(open(os.path.join(cdir, 'controls.json'))), json.load(open(os.path.join(cdir, 'expected.json')))
    sel_c, sel_e = {'K0-network': ctl['K0-network']}, {'K0-network': exp['K0-network']}
    for cid in sorted(ctl):
        if ctl[cid]['release'] == OLD:
            for rel, tag in ((OLD, 'pnpm12'), (NEW, 'pnpm11')):
                new_id = cid.replace(OLD, rel).replace('pnpm12', tag)
                sel_c[new_id] = dict(ctl[cid], release=rel)
                sel_e[new_id] = exp[cid]
    csel = os.path.join(out, 'controls-set')
    os.makedirs(csel)
    json.dump(sel_c, open(os.path.join(csel, 'controls.json'), 'w'), indent=1, sort_keys=True)
    json.dump(sel_e, open(os.path.join(csel, 'expected.json'), 'w'), indent=1, sort_keys=True)
    with open(os.path.join(cdir, 'packages.json'), 'rb') as f, open(os.path.join(csel, 'packages.json'), 'wb') as g:
        g.write(f.read())
    fail += bool(replicas.controls(csel, opt, work, os.path.join(out, 'controls.ndjson')))

    # the documents, as replicas.py and rules.py read them
    docs, optional_docs, optional_rows = {}, {}, []
    for r in rows(os.path.join(inp, 'docs', 'versions.ndjson')):
        if r['status'] == 'ok':
            docs[(r['name'], r['version'])] = r['doc']
    for r in rows(os.path.join(inp, 'docs', 'optional.ndjson')):
        if r['status'] == 'ok':
            optional_docs[(r['name'], r['spec'])] = r['doc']
            optional_rows.append(r)

    # path A: the row of pnpm 12.14.0, for rule A on 12.14.0 and rule B on 11.28.7
    with open(os.path.join(out, 'decisions-a.ndjson'), 'w', encoding='utf-8') as fa:
        for p in projects:
            cfgdir = os.path.join(inp, 'config', p['fullName'].replace('/', '__'))
            marks, failed, notes = rules.decide(p, OLD, None, cfgdir, docs, optional_docs, set())
            for rule, rel in (('A', OLD), ('B', NEW)):
                fa.write(json.dumps({'project': p['fullName'], 'rule': rule, 'release': rel, 'marks': marks,
                                     'exit': 'fail' if failed else '0', 'notes': notes}, sort_keys=True) + '\n')

    # path B: the registry as replicas.py fills it, and each replica installed by both releases
    reg = replicas.Registry()
    runner = Runner(opt, work, reg)
    served = set()
    for r in sorted(optional_rows, key=lambda r: (r['name'], r['version'])):
        n, v, d = r['name'], r['version'], r['doc']
        if (n, v) not in docs and (n, v) not in served:
            served.add((n, v))
            reg.add(replicas.stand_in(n, v, [], runner.marks, {k: d.get(k) for k in ('os', 'cpu', 'libc')}))
    for (n, v), d in sorted(docs.items()):
        extra = {k: d.get(k) for k in ('os', 'cpu', 'libc')}
        if n in ('esbuild', '@anthropic-ai/claude-code'):
            extra['optionalDependencies'] = {on: ov for on, ov in (d.get('optionalDependencies') or {}).items()
                                             if (on, ov) in optional_docs or (on, ov) in docs}
        ks = [k for k in replicas.KINDS if isinstance(d.get('scripts'), dict) and d['scripts'].get(k)]
        if not ks and d.get('gypfile'):
            ks = ['install']
        reg.add(replicas.stand_in(n, v, ks, runner.marks, extra))
    holders, plans = {}, []
    for p in projects:
        cfgdir = os.path.join(inp, 'config', p['fullName'].replace('/', '__'))
        for rule, rel in (('A', OLD), ('B', NEW)):
            files, notes = replicas.build(p, cfgdir, docs, optional_docs, rel, rule, holders)
            plans.append((p['fullName'], rule, rel, files, notes))
    for h, (n, v, constrained) in sorted(holders.items()):
        reg.add({'name': h, 'version': '1.0.0', ('optionalDependencies' if constrained else 'dependencies'): {n: v}})
    with open(os.path.join(out, 'decisions-b.ndjson'), 'w', encoding='utf-8') as fb, \
            gzip.open(os.path.join(out, 'decisions-b.log.gz'), 'wt') as log:
        for i, (name, rule, rel, files, notes) in enumerate(plans):
            marks, ex, info = runner.install(rel, files)
            log.write(json.dumps({'project': name, 'rule': rule, 'release': rel, **info}) + '\n')
            fb.write(json.dumps({'project': name, 'rule': rule, 'release': rel, 'marks': marks, 'exit': ex,
                                 'notes': notes}, sort_keys=True) + '\n')
            fb.flush()
            print(f'{i + 1}/{len(plans)} {name} {rel} {ex} {len(marks)}', file=sys.stderr, flush=True)
    return 1 if fail else 0


# ---- compare

def compare(runs, out):
    stops = []
    for f in FILES:
        a, b = os.path.join(out, 'run1', f), os.path.join(out, 'run2', f)
        if not (os.path.exists(a) and os.path.exists(b)):
            stops.append(f'missing {f}')
        elif not filecmp.cmp(a, b, shallow=False):
            stops.append(f'run 1 and run 2 differ: {f}')
    if stops:
        print('\n'.join(stops))
        return 1
    R = os.path.join(out, 'run1')
    c1 = json.load(open(os.path.join(R, 'c1.json')))
    if c1['different']:
        stops.append(f"C1: {len(c1['different'])} projects differ")
    ctl = rows(os.path.join(R, 'controls.ndjson'))
    stops += [f"control failed: {c['control']}" for c in ctl if not c['pass']]
    pa = {(r['project'], r['rule']): r for r in rows(os.path.join(R, 'decisions-a.ndjson'))}
    pb = {(r['project'], r['rule']): r for r in rows(os.path.join(R, 'decisions-b.ndjson'))}
    old_a = {(r['project'], r['rule']): r for r in rows(os.path.join(runs, 'decisions-a.ndjson.gz'))}
    old_b = {(r['project'], r['rule']): r for r in rows(os.path.join(runs, 'decisions-b.ndjson.gz'))}
    projects = sorted({k[0] for k in pb})
    keep = ('release', 'marks', 'exit', 'notes')
    for p in projects:
        if {k: pa[(p, 'A')][k] for k in keep} != {k: old_a[(p, 'A')][k] for k in keep}:
            stops.append(f'path A, pnpm 12.14.0, differs from the record of 2026-10-22: {p}')
        if {k: pb[(p, 'A')][k] for k in keep} != {k: old_b[(p, 'A')][k] for k in keep}:
            stops.append(f'path B, pnpm 12.14.0, differs from the record of 2026-10-22: {p}')
        for rule in ('A', 'B'):
            if (pa[(p, rule)]['marks'], pa[(p, rule)]['exit']) != (pb[(p, rule)]['marks'], pb[(p, rule)]['exit']):
                stops.append(f'path A and path B differ: {p} rule {rule} ({pb[(p, rule)]["release"]})')
    same, different = [], []
    for p in projects:
        new, old = pb[(p, 'B')], old_b[(p, 'B')]
        (same if (new['marks'], new['exit']) == (old['marks'], old['exit']) else different).append(
            {'project': p, 'pnpm-11.28.7': [new['exit'], new['marks']], 'pnpm-12.14.0': [old['exit'], old['marks']]})
    result = {'projects': len(projects), 'stops': stops, 'same': len(same), 'different': different,
              'controls': len(ctl), 'controls failed': sum(1 for c in ctl if not c['pass']),
              'pnpm-11.28.7': {'run': sum(1 for p in projects if pb[(p, 'B')]['marks']),
                               'fail': sum(1 for p in projects if pb[(p, 'B')]['exit'] != '0'),
                               'fail with none run': sum(1 for p in projects if pb[(p, 'B')]['exit'] != '0' and not pb[(p, 'B')]['marks'])},
              'pnpm-12.14.0, recorded': {'run': sum(1 for p in projects if old_b[(p, 'B')]['marks']),
                                         'fail': sum(1 for p in projects if old_b[(p, 'B')]['exit'] != '0')}}
    json.dump(result, open(os.path.join(out, 'result.json'), 'w'), indent=1, sort_keys=True)
    print(json.dumps(result, indent=1, sort_keys=True))
    return 1 if stops else 0


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'fetch':
        sys.exit(fetch(*sys.argv[2:5]))
    if cmd == 'run':
        sys.exit(run(*sys.argv[2:8]))
    if cmd == 'compare':
        sys.exit(compare(*sys.argv[2:4]))
    sys.exit(2)
