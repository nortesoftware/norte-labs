#!/usr/bin/env python3
"""ecosystems/npm option 3: the stops (C1, the controls, path A against path B, run 1 against run 2)
and, when none of them stops, the figures.

usage: compare.py <option1 dir> <inputs dir> <results dir> <out dir>   (out dir holds run1/ and run2/)
"""
import collections, filecmp, importlib.util, json, math, os, re, sys

OPT1, IN, RES, OUT = sys.argv[1:5]
spec = importlib.util.spec_from_file_location('o1b', os.path.join(OPT1, 'path_b.py'))
o1b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(o1b)
Z = 1.959964
FILES = ['pairs/c1.json', 'pairs/pairs.ndjson', 'controls.ndjson', 'decisions-a.ndjson', 'decisions-b.ndjson']


def wilson(k, n):
    if not n:
        return None
    p = k / n
    d = 1 + Z * Z / n
    c = (p + Z * Z / (2 * n)) / d
    h = Z * math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n)) / d
    return [round(100 * (c - h), 1), round(100 * (c + h), 1)]


def rows(path):
    return [json.loads(l) for l in open(path, encoding='utf-8') if l.strip()]


stops = []
for f in FILES:
    a, b = os.path.join(OUT, 'run1', f), os.path.join(OUT, 'run2', f)
    if not (os.path.exists(a) and os.path.exists(b)):
        stops.append(f'missing {f}')
    elif not filecmp.cmp(a, b, shallow=False):
        stops.append(f'run 1 and run 2 differ: {f}')
R = os.path.join(OUT, 'run1')
c1 = json.load(open(os.path.join(R, 'pairs/c1.json')))
if c1['different']:
    stops.append(f"C1: {len(c1['different'])} projects differ from the published install counts")
ctl = rows(os.path.join(R, 'controls.ndjson'))
bad = [c['control'] for c in ctl if not c['pass']]
if bad:
    stops.append(f'controls failed: {bad}')
A = {(r['project'], r['rule']): r for r in rows(os.path.join(R, 'decisions-a.ndjson'))}
B = {(r['project'], r['rule']): r for r in rows(os.path.join(R, 'decisions-b.ndjson'))}
disagree = [k for k in sorted(set(A) | set(B))
            if k not in A or k not in B or A[k]['marks'] != B[k]['marks'] or A[k]['exit'] != B[k]['exit']]
if disagree:
    stops.append(f'paths A and B disagree on {len(disagree)} project-rules')
print(f"C1: {c1['projects']} projects, {len(c1['different'])} different; controls: {len(ctl)}, failed {len(bad)}; "
      f"project-rules: A {len(A)}, B {len(B)}, disagreeing {len(disagree)}")
for k in disagree[:40]:
    print('  disagree', k, 'A:', A.get(k, {}).get('exit'), A.get(k, {}).get('marks'), '| B:', B.get(k, {}).get('exit'), B.get(k, {}).get('marks'))
json.dump({'stops': stops, 'disagree': [list(k) for k in disagree], 'controlsFailed': bad}, open(os.path.join(OUT, 'checks.json'), 'w'),
          indent=1, sort_keys=True)
if stops:
    print('STOP:', *stops, sep='\n  ')
    sys.exit(1)

# ---- figures, from path B (equal to path A on every project-rule)
pairs = {p['fullName']: p for p in rows(os.path.join(R, 'pairs/pairs.ndjson'))}
pop = {p['fullName']: p for p in rows(os.path.join(RES, 'population.ndjson'))}
unavailable = sorted(n for n, p in pairs.items() if p['pairs'] and B[(n, 'A')]['exit'] == 'unavailable')
projects = sorted(n for n, p in pairs.items() if p['pairs'] and n not in unavailable)
n = len(projects)
fig = {'projects': n, 'configurationUnavailable': unavailable, 'rules': {}, 'byManager': {}, 'packages': {}}
for rule in ('A', 'B'):
    runs = [p for p in projects if B[(p, rule)]['marks']]
    fails = [p for p in projects if B[(p, rule)]['exit'] != '0']
    fig['rules'][rule] = {'run': len(runs), 'pct': round(100 * len(runs) / n, 1), 'wilson': wilson(len(runs), n),
                          'installFails': len(fails), 'failsWithScriptsRun': sum(1 for p in fails if B[(p, rule)]['marks']),
                          'releases': dict(sorted(collections.Counter(B[(p, rule)]['release'] for p in projects).items()))}
    by = collections.defaultdict(lambda: [0, 0, 0])
    for p in projects:
        m = pairs[p]['manager']
        by[m][0] += 1
        by[m][1] += bool(B[(p, rule)]['marks'])
        by[m][2] += B[(p, rule)]['exit'] != '0'
    fig['byManager'][rule] = {m: {'projects': v[0], 'run': v[1], 'pct': round(100 * v[1] / v[0], 1), 'wilson': wilson(v[1], v[0]),
                                  'installFails': v[2]} for m, v in sorted(by.items())}
    pk = collections.Counter()
    for p in projects:
        pk.update({mk.split(' ')[0].rsplit('@', 1)[0] for mk in B[(p, rule)]['marks']})
    fig['packages'][rule] = pk.most_common(25)
changed = [p for p in projects if bool(B[(p, 'A')]['marks']) != bool(B[(p, 'B')]['marks'])]
fig['AvsB'] = {'answerDiffers': len(changed),
               'runOnlyUnderB': sum(1 for p in changed if B[(p, 'B')]['marks']),
               'runOnlyUnderA': sum(1 for p in changed if B[(p, 'A')]['marks']),
               'releaseDiffers': sum(1 for p in projects if B[(p, 'A')]['release'] != B[(p, 'B')]['release'])}
v1 = [p for p in projects if pairs[p]['manager'] == 'yarn']
k = sum(1 for p in v1 if B[(p, 'A-yarn-4.18.1')]['marks'])
fig['yarnV1OnYarn4.18.1'] = {'projects': len(v1), 'run': k, 'wilson': wilson(k, len(v1)),
                             'underRuleA': sum(1 for p in v1 if B[(p, 'A')]['marks'])}

# ---- given apart: code the replicas do not run, and pins whose own release reads differently
cfg = collections.defaultdict(dict)
for r in rows(os.path.join(IN, 'config.ndjson')):
    cfg[r['project']][r['file']] = r['status']


def text(p, rel):
    f = os.path.join(IN, 'config', p.replace('/', '__'), rel)
    return open(f, encoding='utf-8', errors='replace').read() if os.path.exists(f) else None


apart = collections.Counter()
pnpm10 = []
for p in projects:
    if cfg[p].get('.pnpmfile.cjs') == 'present' or cfg[p].get('.pnpmfile.mjs') == 'present':
        apart['pnpmfile'] += 1
    y = text(p, '.yarnrc.yml') or ''
    if re.search(r'(?m)^plugins\s*:', y):
        apart['yarn plugins'] += 1
    if re.search(r'(?m)^yarnPath\s*:', y):
        apart['yarnPath'] += 1
    ws = text(p, 'pnpm-workspace.yaml') or ''
    pj = text(p, 'package.json') or ''
    if re.search(r'(?m)^configDependencies\s*:', ws) or '"configDependencies"' in pj:
        apart['configDependencies'] += 1
    pm = pop[p]['packageManager'] or ''
    m = re.match(r'^pnpm@(10\.\d+\.\d+)', pm)
    if m:
        used = [key for key in ('onlyBuiltDependencies', 'neverBuiltDependencies', 'allowBuilds', 'dangerouslyAllowAllBuilds',
                                'strictDepBuilds', 'ignoredBuiltDependencies', 'onlyBuiltDependenciesFile')
                if re.search(rf'(?m)^{key}\s*:', ws)]
        pkg_used = [key for key in ('allowBuilds', 'dangerouslyAllowAllBuilds') if f'"{key}"' in pj]
        if used or pkg_used:
            pnpm10.append({'project': p, 'pin': m.group(1), 'pnpm-workspace.yaml': used, 'package.json': pkg_used,
                           'ruleB': {'marks': len(B[(p, 'B')]['marks']), 'exit': B[(p, 'B')]['exit']}})
fig['apart'] = {'codeNotRun': dict(sorted(apart.items())), 'pnpm10PinsWithSettings': pnpm10}
bun_old = []
for p in projects:
    pm = pop[p]['packageManager'] or ''
    m = re.match(r'^bun@(\d+\.\d+\.\d+)', pm)
    if m and tuple(int(x) for x in m.group(1).split('.')) < (1, 3, 2):
        names = {tuple(x) for x in pairs[p]['pairs']}
        bun_old.append({'project': p, 'pin': m.group(1),
                        'optimizerNames': sorted(f'{a}@{b}' for a, b in names if a in ('esbuild', '@anthropic-ai/claude-code', 'sharp')),
                        'ruleB': {'marks': B[(p, 'B')]['marks'], 'exit': B[(p, 'B')]['exit']}})
fig['apart']['bunPinsBeforeOptimizer'] = bun_old
bund = [p for p in projects if pairs[p].get('bundled')]
fig['apart']['npmBundledInstallCode'] = {
    'projects': len(bund), 'versions': sum(len(pairs[p]['bundled']) for p in bund),
    # npm 12 never runs a bundled version's scripts; both paths install it as an ordinary dependency
    'npm12ProjectsWhereABundledVersionRan': sorted(p for p in bund if B[(p, 'A')]['release'] == 'npm-12.2.1' and any(
        mk.split(' ')[0] in {f'{a}@{b}' for a, b in pairs[p]['bundled']} for mk in B[(p, 'A')]['marks']))}
fig['notes'] = dict(sorted(collections.Counter(nt for r in B.values() for nt in r['notes']).items()))
json.dump(fig, open(os.path.join(OUT, 'figures.json'), 'w'), indent=1, sort_keys=True)
for rule in ('A', 'B'):
    f = fig['rules'][rule]
    print(f"rule {rule}: {f['run']} of {n}, {f['pct']} % [{f['wilson'][0]}-{f['wilson'][1]}]; installs that fail {f['installFails']}")
print('A vs B:', fig['AvsB'])
print('v1 on Yarn 4.18.1:', fig['yarnV1OnYarn4.18.1'])
