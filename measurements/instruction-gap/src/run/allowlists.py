"""Count, over the projects with install code whose configuration could be read, the allowlists and
build settings each commits. Two readings of each file: a regex over top-level keys, and a parser
(json for package.json, option 1's yaml_load for pnpm-workspace.yaml); they must agree.
The configuration is the one fetch_inputs.py records in config.ndjson; any copy whose files match
its sha256 will do.
usage: allowlists.py <option1 dir> <config dir> <pairs.ndjson.gz> <decisions-b.ndjson.gz> <out .json>"""
import collections, gzip, importlib.util, json, os, re, sys

OPT1, CFG, PAIRS, DEC, OUTF = sys.argv[1:6]
spec = importlib.util.spec_from_file_location('o1b', os.path.join(OPT1, 'path_b.py'))
o1b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(o1b)

pairs = {p['fullName']: p for p in (json.loads(l) for l in gzip.open(PAIRS, 'rt'))}
dec = {(r['project'], r['rule']): r for r in (json.loads(l) for l in gzip.open(DEC, 'rt'))}
projects = sorted(n for n, p in pairs.items() if p['pairs'] and dec[(n, 'A')]['exit'] != 'unavailable')


def read(p, rel):
    f = os.path.join(CFG, p.replace('/', '__'), rel)
    return open(f, encoding='utf-8-sig').read() if os.path.exists(f) else None


def top_keys_regex(yaml_text):
    return set(re.findall(r'(?m)^([A-Za-z][\w-]*)\s*:', yaml_text or ''))


def top_keys_parsed(yaml_text):
    d = o1b.yaml_load(yaml_text) if yaml_text and yaml_text.strip() else {}
    return set(d) if isinstance(d, dict) else set()


def npmrc_keys(text):
    keys = set()
    for line in (text or '').splitlines():
        line = line.strip()
        if not line or line[0] in '#;':
            continue
        k = line.split('=', 1)[0].strip()
        keys.add(k[:-2] if k.endswith('[]') else k)
    return keys


out = {'projects': len(projects), 'byProject': {}}
disagree = []
for p in projects:
    m = pairs[p]['manager']
    pj_text = read(p, 'package.json')
    pj = json.loads(pj_text) if pj_text else {}
    pjk_regex = set(re.findall(r'(?m)^  "([^"]+)"\s*:', pj_text or ''))    # two-space indented top-level keys, as a check
    ws = read(p, 'pnpm-workspace.yaml')
    wk, wk2 = top_keys_regex(ws), top_keys_parsed(ws)
    if wk != wk2:
        disagree.append((p, 'pnpm-workspace.yaml', sorted(wk ^ wk2)))
    rc = npmrc_keys(read(p, '.npmrc'))
    pnpm_field = pj.get('pnpm') if isinstance(pj.get('pnpm'), dict) else {}
    meta = pj.get('dependenciesMeta') if isinstance(pj.get('dependenciesMeta'), dict) else {}
    s = {
        'manager': m,
        'allowScripts': 'allowScripts' in pj,
        'trustedDependencies': 'trustedDependencies' in pj,
        'dependenciesMetaBuilt': any(isinstance(v, dict) and 'built' in v for v in meta.values()),
        'ws': sorted(k for k in wk if k in ('allowBuilds', 'onlyBuiltDependencies', 'onlyBuiltDependenciesFile', 'neverBuiltDependencies',
                                            'ignoredBuiltDependencies', 'dangerouslyAllowAllBuilds', 'ignoreScripts', 'strictDepBuilds')),
        'pkgPnpm': sorted(k for k in pnpm_field if k in ('allowBuilds', 'onlyBuiltDependencies', 'onlyBuiltDependenciesFile', 'neverBuiltDependencies',
                                                         'ignoredBuiltDependencies', 'dangerouslyAllowAllBuilds')),
        'npmrc': sorted(k for k in rc if k in ('only-built-dependencies', 'never-built-dependencies', 'ignore-scripts', 'allow-scripts',
                                              'dangerously-allow-all-scripts', 'strict-dep-builds')),
    }
    # the regex check on package.json applies only where the file is indented by two spaces
    if pj_text and '\n  "' in pj_text and any(k in pj for k in ('allowScripts', 'trustedDependencies')) != any(
            k in pjk_regex for k in ('allowScripts', 'trustedDependencies')):
        disagree.append((p, 'package.json', 'allowScripts/trustedDependencies'))
    out['byProject'][p] = s

bp = out['byProject']
pn = [p for p in projects if bp[p]['manager'] == 'pnpm']
allow_builds = [p for p in pn if 'allowBuilds' in bp[p]['ws'] or 'allowBuilds' in bp[p]['pkgPnpm']]
only_built = [p for p in pn if 'onlyBuiltDependencies' in bp[p]['ws'] or 'onlyBuiltDependencies' in bp[p]['pkgPnpm']
              or 'only-built-dependencies' in bp[p]['npmrc']]
# what pnpm 12.14.0 reads of these: pnpm-workspace.yaml's allowBuilds, dangerouslyAllowAllBuilds, ignoreScripts
read12 = [p for p in pn if set(bp[p]['ws']) & {'allowBuilds', 'dangerouslyAllowAllBuilds', 'ignoreScripts'}]
unread12 = [p for p in pn if p not in read12 and (bp[p]['ws'] or bp[p]['pkgPnpm'] or
                                                  set(bp[p]['npmrc']) & {'only-built-dependencies', 'never-built-dependencies', 'strict-dep-builds'})]
none12 = [p for p in pn if p not in read12 and p not in unread12]
fig = {
    'projects': len(projects),
    'allowScripts': {'all': sum(bp[p]['allowScripts'] for p in projects),
                     'byManager': dict(collections.Counter(bp[p]['manager'] for p in projects if bp[p]['allowScripts']))},
    'trustedDependencies': {'all': sum(bp[p]['trustedDependencies'] for p in projects),
                            'byManager': dict(collections.Counter(bp[p]['manager'] for p in projects if bp[p]['trustedDependencies']))},
    'dependenciesMetaBuilt': {'all': sum(bp[p]['dependenciesMetaBuilt'] for p in projects)},
    'pnpm': {'projects': len(pn), 'allowBuildsOrOnlyBuilt': len(set(allow_builds) | set(only_built)), 'allowBuilds': len(allow_builds),
             'onlyBuiltDependencies': len(only_built), 'both': len(set(allow_builds) & set(only_built)),
             'pnpm12': {'readsASetting': len(read12), 'onlyUnreadSettings': len(unread12), 'none': len(none12)}},
    'npmIgnoreScriptsInNpmrc': sum(1 for p in projects if bp[p]['manager'] == 'npm' and 'ignore-scripts' in bp[p]['npmrc']),
    'npmAllowScriptsInNpmrc': sum(1 for p in projects if bp[p]['manager'] == 'npm' and 'allow-scripts' in bp[p]['npmrc']),
    'parserDisagreements': disagree,
}
print(json.dumps(fig, indent=1, sort_keys=True))
json.dump({'figures': fig, 'byProject': bp, 'pnpm12': {'read': read12, 'onlyUnread': unread12, 'none': none12}},
          open(OUTF, 'w'), indent=1, sort_keys=True)
