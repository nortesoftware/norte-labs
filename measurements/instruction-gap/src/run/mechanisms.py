"""The figures, manager by manager, that the correction draft gives: from the decisions, the pairs and the
configuration.
usage: mechanisms.py <config dir> <pairs.ndjson.gz> <decisions-b.ndjson.gz> <population.ndjson> <allowlists.json>"""
import collections, gzip, json, os, re, sys
CFG, PAIRS, DEC, POP, AL = sys.argv[1:6]
pairs = {p['fullName']: p for p in (json.loads(l) for l in gzip.open(PAIRS, 'rt'))}
D = {(r['project'], r['rule']): r for r in (json.loads(l) for l in gzip.open(DEC, 'rt'))}
pop = {r['fullName']: r for r in (json.loads(l) for l in open(POP) if l.strip())}
bp = json.load(open(AL))['byProject']
P = sorted(n for n, p in pairs.items() if p['pairs'] and D[(n, 'A')]['exit'] != 'unavailable')
def read(p, rel):
    f = os.path.join(CFG, p.replace('/', '__'), rel)
    return open(f, encoding='utf-8-sig').read() if os.path.exists(f) else None
def only_fsevents(p):
    return {a for a, _ in pairs[p]['pairs']} == {'fsevents'}
by = collections.defaultdict(list)
for p in P:
    by[pairs[p]['manager']].append(p)
ran = lambda p, rule: bool(D[(p, rule)]['marks'])
out = {}
# npm
npm = by['npm']
allow = [p for p in npm if bp[p]['allowScripts']]
out['npm'] = {'projects': len(npm), 'runA': sum(ran(p, 'A') for p in npm), 'withAllowScripts': len(allow),
              'runAWithAllowScripts': sum(ran(p, 'A') for p in allow), 'runAWithout': sum(ran(p, 'A') for p in npm if p not in allow),
              'failA': [(p, D[(p, 'A')]['exit'], json.loads(read(p, 'package.json')).get('os')) for p in npm if D[(p, 'A')]['exit'] != '0'],
              'allowScriptsNotRunning': [(p, json.loads(read(p, 'package.json'))['allowScripts'], sorted({a for a, _ in pairs[p]['pairs']}))
                                         for p in allow if not ran(p, 'A')],
              'runOnlyB': dict(collections.Counter(D[(p, 'B')]['release'] for p in npm if ran(p, 'B') and not ran(p, 'A')))}
# pnpm
pn = by['pnpm']
out['pnpm'] = {'projects': len(pn), 'runA': sum(ran(p, 'A') for p in pn), 'failA': sum(D[(p, 'A')]['exit'] != '0' for p in pn),
               'failANothingRan': sum(D[(p, 'A')]['exit'] != '0' and not ran(p, 'A') for p in pn),
               'runOnlyB': dict(collections.Counter(D[(p, 'B')]['release'] for p in pn if ran(p, 'B') and not ran(p, 'A'))),
               'runOnlyBPins': dict(collections.Counter((pop[p]['packageManager'] or '-').split('.')[0] for p in pn if ran(p, 'B') and not ran(p, 'A'))),
               'noFailNoRunA': [(p, only_fsevents(p)) for p in pn if D[(p, 'A')]['exit'] == '0' and not ran(p, 'A')]}
# Berry
yb = by['yarn-berry']
rows = []
for p in yb:
    y = read(p, '.yarnrc.yml') or ''
    m = re.search(r'(?m)^enableScripts\s*:\s*(\S+)', y)
    rows.append({'project': p, 'lockfileVersion': pairs[p].get('berryMetadata', {}).get('version'), 'enableScripts': m.group(1) if m else None,
                 'runA': ran(p, 'A'), 'onlyFsevents': only_fsevents(p), 'yarnPath': bool(re.search(r'(?m)^yarnPath\s*:', y))})
out['berry'] = {'projects': len(yb), 'runA': sum(r['runA'] for r in rows),
                'lockBelow9SetNothing': sum(1 for r in rows if int(r['lockfileVersion']) < 9 and r['enableScripts'] is None),
                'lockBelow9Set': [r['enableScripts'] for r in rows if int(r['lockfileVersion']) < 9 and r['enableScripts'] is not None],
                'lock9plus': [(r['lockfileVersion'], r['enableScripts']) for r in rows if int(r['lockfileVersion']) >= 9],
                'notRunning': [(r['project'], r['enableScripts'], r['onlyFsevents']) for r in rows if not r['runA']],
                'yarnPath': sum(r['yarnPath'] for r in rows)}
# yarn v1
y1 = by['yarn']
out['yarnV1'] = {'projects': len(y1), 'runA': sum(ran(p, 'A') for p in y1),
                 'notRunning': [(p, only_fsevents(p), (read(p, '.yarnrc') or '').strip()[:80]) for p in y1 if not ran(p, 'A')],
                 'onYarn4.18.1': sum(ran(p, 'A-yarn-4.18.1') for p in y1)}
# Bun
bn = by['bun']
out['bun'] = {'projects': len(bn), 'runA': sum(ran(p, 'A') for p in bn),
              'trusted': len([p for p in bn if bp[p]['trustedDependencies']]),
              'trustedRun': sum(ran(p, 'A') for p in bn if bp[p]['trustedDependencies']),
              'runWithoutTrusted': sum(ran(p, 'A') for p in bn if not bp[p]['trustedDependencies']),
              'runOnlyB': [(p, pop[p]['packageManager'], D[(p, 'B')]['release']) for p in bn if ran(p, 'B') and not ran(p, 'A')]}
print(json.dumps(out, indent=1))
