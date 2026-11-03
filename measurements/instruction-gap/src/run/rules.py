#!/usr/bin/env python3
"""ecosystems/npm option 3, path A: the plan's table applied to each project, from the inputs alone.

For each project with install code and each rule, the release that installs, the settings that
release reads from the committed configuration, the install-code versions that install on Linux x64
with glibc, which of their install-time scripts run, and whether the install fails.

usage: rules.py <option1 dir> <inputs dir> <results dir> <pairs.ndjson> <out file>
"""
import fnmatch, gzip, importlib.util, json, os, re, sys, tomllib

OPT1, IN, RES, PAIRS, OUT = sys.argv[1:6]
spec = importlib.util.spec_from_file_location('o1b', os.path.join(OPT1, 'path_b.py'))
o1b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(o1b)

KINDS = ('preinstall', 'install', 'postinstall')
TARGET = {'os': 'linux', 'cpu': 'x64', 'libc': 'glibc'}


# ---- versions and pins

spec = importlib.util.spec_from_file_location('pins', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pins.py'))
pins = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pins)
release_a, release_for_pin = pins.release_a, pins.release_for_pin


def semver_key(v):
    m = re.match(r'^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?', v or '')
    if not m:
        return None
    pre = m.group(4)
    return (int(m.group(1)), int(m.group(2)), int(m.group(3)), 0 if pre else 1, pre or '')


# ---- configuration files

def read_file(d, rel):
    p = os.path.join(d, rel.replace('/', '__'))
    return open(p, 'rb').read().decode('utf-8', 'replace') if os.path.exists(p) else None


def parse_json(text):
    if text is None:
        return None
    try:
        return json.loads(text.lstrip('﻿'))
    except ValueError:
        return 'not JSON'


def parse_npmrc(text):
    """key -> value (str), key[] -> list; comments and blank lines skipped; last one wins."""
    out = {}
    for line in (text or '').splitlines():
        s = line.strip()
        if not s or s[0] in '#;':
            continue
        if '=' not in s:
            out[s.lower()] = 'true'
            continue
        k, v = s.split('=', 1)
        k, v = k.strip(), v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in '"\'':
            v = v[1:-1]
        if k.endswith('[]'):
            out.setdefault(k[:-2].lower(), [])
            if isinstance(out[k[:-2].lower()], list):
                out[k[:-2].lower()].append(v)
        else:
            out[k.lower()] = v
    return out


def truthy(v):
    return v is True or (isinstance(v, str) and v.strip().lower() == 'true')


def ybool(v):
    """A YAML boolean; option 1's reader gives scalars as strings."""
    if v is True or v in ('true', 'True', 'TRUE'):
        return True
    if v is False or v in ('false', 'False', 'FALSE'):
        return False
    return None


def parse_yarnrc_v1(text):
    out = {}
    for line in (text or '').splitlines():
        s = line.strip()
        if not s or s.startswith('#'):
            continue
        m = re.match(r'^"?(--)?([^"\s]+)"?\s+(.*)$', s)
        if m:
            v = m.group(3).strip()
            out[m.group(2).lower()] = v[1:-1] if len(v) >= 2 and v[0] == v[-1] == '"' else v
        else:
            out[s.lstrip('-').lower()] = 'true'
    return out


def parse_yaml(text):
    if text is None:
        return None
    if not text.strip():
        return {}
    y = o1b.yaml_load(text)
    return y if isinstance(y, dict) else {}


# ---- platform

def list_ok(values, target):
    if not values:
        return True
    values = values if isinstance(values, list) else [values]
    if '!' + target in values:
        return False
    positive = [v for v in values if isinstance(v, str) and not v.startswith('!')]
    return not positive or target in positive or 'any' in positive


def installs(doc, release, cfg):
    """Whether the version installs on Linux x64 with glibc under this release and configuration."""
    targets = {k: [v] for k, v in TARGET.items()}
    arch = cfg.get('supportedArchitectures')
    if isinstance(arch, dict):
        for k in targets:
            vals = arch.get(k)
            if isinstance(vals, list) and vals:
                targets[k] = [TARGET[k] if v == 'current' else v for v in vals]
    for k in ('os', 'cpu', 'libc'):
        if cfg.get('npm_' + k):
            targets[k] = [cfg['npm_' + k]]
    for field in ('os', 'cpu', 'libc'):
        if field == 'libc' and release == 'yarn-1.22.22':
            continue
        if field == 'libc' and release.startswith('npm-') and 'linux' not in targets['os']:
            continue
        if not any(list_ok(doc.get(field), t) for t in targets[field]):
            return False
    return True


def kinds(doc):
    s = doc.get('scripts') if isinstance(doc.get('scripts'), dict) else {}
    ks = [k for k in KINDS if s.get(k)]
    if not ks and doc.get('gypfile'):
        ks = ['install']
    return ks


# ---- npm

def npm_spec_ok(key):
    """validatePolicy: a bare name, name@*, or exact versions joined by ||; ranges and tags dropped."""
    name, ver = o1b.name_at(key)
    if not name:
        return False
    ver = ver.strip()
    if ver in ('', '*'):
        return True
    parts = [p.strip() for p in ver.split('||')]
    return all(re.match(r'^v?\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$', p) for p in parts)


def npm_policy(pkg, rc):
    pol = None
    if isinstance(pkg.get('allowScripts'), dict) and pkg['allowScripts']:
        pol = {k: v for k, v in pkg['allowScripts'].items() if npm_spec_ok(k)} or None
    if pol is None and 'allow-scripts' in rc:
        raw = rc['allow-scripts'] if isinstance(rc['allow-scripts'], list) else [rc['allow-scripts']]
        names = [p.strip() for e in raw for p in e.split(',') if p.strip()]
        pol = {n: True for n in names if npm_spec_ok(n)} or None
    return pol


def npm_allowed(pol, name, version):
    """True, False (denied) or None (unreviewed), as script-allowed.js decides for a registry node."""
    if not pol:
        return None
    allow = deny = False
    for key, value in pol.items():
        kname, kver = o1b.name_at(key)
        if kname != name:
            continue
        kver = kver.strip()
        if kver not in ('', '*') and version.lstrip('v') not in [p.strip().lstrip('v') for p in kver.split('||')]:
            continue
        if value is False:
            deny = True
        elif value is True:
            allow = True
    return False if deny else True if allow else None


def rule_npm(release, pkg, rc, inst):
    if truthy(rc.get('ignore-scripts')):
        return [], False
    if release == 'npm-10.9.9':
        return inst, False
    if truthy(rc.get('dangerously-allow-all-scripts')):
        return inst, False
    pol = npm_policy(pkg, rc)
    decided = {p: npm_allowed(pol, p[0], p[1]) for p in inst}
    if truthy(rc.get('strict-allow-scripts')) and any(v is None for v in decided.values()):
        return [], True
    if release == 'npm-11.21.1':
        return [p for p in inst if decided[p] is not False], False
    return [p for p in inst if decided[p] is True], False


# ---- pnpm

def pnpm_list(v):
    if v is None:
        return None
    return [str(x) for x in v] if isinstance(v, list) else [str(v)]


def rule_pnpm(release, pkg, rc, ws, d, inst):
    pnpm_field = pkg.get('pnpm') if isinstance(pkg.get('pnpm'), dict) else {}
    ws = ws if isinstance(ws, dict) else {}
    if release == 'pnpm-12.14.0':
        if truthy(ws.get('ignoreScripts')):
            return [], False
        if truthy(ws.get('dangerouslyAllowAllBuilds')):
            return inst, False
        allow = ws.get('allowBuilds') if isinstance(ws.get('allowBuilds'), dict) else {}
        runs, unreviewed = [], []
        for p in inst:
            verdict = None
            for key, val in allow.items():
                kname, kver = o1b.name_at(str(key))
                if kver and p[1] not in [x.strip() for x in kver.split('||')]:
                    continue
                if kname == p[0] or ('*' in kname and fnmatch.fnmatchcase(p[0], kname)):
                    b = ybool(val)
                    if b is not None:
                        verdict = b if verdict is None or b is False else verdict
            if verdict is True:
                runs.append(p)
            elif verdict is None:
                unreviewed.append(p)
        strict = ws.get('strictDepBuilds')
        strict = True if strict is None else truthy(strict)
        return runs, bool(strict and unreviewed)
    # pnpm 9 and 10: .npmrc, then package.json's pnpm field, then (10) pnpm-workspace.yaml
    s = {}
    if 'only-built-dependencies' in rc:
        s['onlyBuiltDependencies'] = pnpm_list(rc['only-built-dependencies'])
    if truthy(rc.get('ignore-scripts')):
        s['ignoreScripts'] = True
    if release == 'pnpm-10.34.7':
        if 'dangerously-allow-all-builds' in rc:
            s['dangerouslyAllowAllBuilds'] = truthy(rc['dangerously-allow-all-builds'])
        if 'strict-dep-builds' in rc:
            s['strictDepBuilds'] = truthy(rc['strict-dep-builds'])

    def take(src, keys, dangerous):
        out = {}
        for k in keys:
            if k in src:
                out[k] = src[k]
        if isinstance(src.get('allowBuilds'), dict):
            out.setdefault('onlyBuiltDependencies', list(out.get('onlyBuiltDependencies') or []))
            out.setdefault('ignoredBuiltDependencies', list(out.get('ignoredBuiltDependencies') or []))
            out['onlyBuiltDependencies'] = pnpm_list(out['onlyBuiltDependencies'])
            out['ignoredBuiltDependencies'] = pnpm_list(out['ignoredBuiltDependencies'])
            for k, v in src['allowBuilds'].items():
                if ybool(v) is True:
                    out['onlyBuiltDependencies'].append(str(k))
                elif ybool(v) is False:
                    out['ignoredBuiltDependencies'].append(str(k))
        if dangerous and 'dangerouslyAllowAllBuilds' in src:
            out['dangerouslyAllowAllBuilds'] = truthy(src['dangerouslyAllowAllBuilds'])
        return out

    if release == 'pnpm-9.15.9':
        for k in ('onlyBuiltDependencies', 'onlyBuiltDependenciesFile', 'neverBuiltDependencies'):
            if pnpm_field.get(k) is not None:
                s[k] = pnpm_field[k]
    else:
        # pnpm-workspace.yaml over .npmrc, and package.json's pnpm field over both: install reads it
        # again into its options (dist/pnpm.cjs:142259)
        s.update(take(ws, ('onlyBuiltDependencies', 'onlyBuiltDependenciesFile', 'neverBuiltDependencies',
                           'ignoredBuiltDependencies', 'ignoreScripts', 'strictDepBuilds'), True))
        s.update(take(pnpm_field, ('onlyBuiltDependencies', 'onlyBuiltDependenciesFile', 'neverBuiltDependencies',
                                   'ignoredBuiltDependencies'), False))
    if truthy(s.get('ignoreScripts')):
        return [], False
    only, never = pnpm_list(s.get('onlyBuiltDependencies')), pnpm_list(s.get('neverBuiltDependencies'))
    if s.get('onlyBuiltDependenciesFile'):
        text = read_file(d, str(s['onlyBuiltDependenciesFile']))
        extra = json.loads(text) if text else []
        only = (only or []) + [str(x) for x in extra]
    if release == 'pnpm-10.34.7' and s.get('dangerouslyAllowAllBuilds'):
        never = []
    if release == 'pnpm-10.34.7' and never is None and only is None and not s.get('onlyBuiltDependenciesFile'):
        only = []
    if only is not None and never is not None:
        return [], True
    if release == 'pnpm-10.34.7' and s.get('dangerouslyAllowAllBuilds'):
        allowed = lambda p: True
    elif only is not None:
        names = set()
        for e in only:
            n, v = o1b.name_at(e)
            if release == 'pnpm-10.34.7' and v:
                names |= {f'{n}@{x.strip()}' for x in v.split('||')}
            else:
                names.add(e if release == 'pnpm-9.15.9' else n)
        allowed = lambda p: p[0] in names or f'{p[0]}@{p[1]}' in names
    elif never:
        allowed = lambda p: p[0] not in set(never)
    else:
        allowed = lambda p: True
    runs = [p for p in inst if allowed(p)]
    ignored = set(pnpm_list(s.get('ignoredBuiltDependencies')) or [])
    unreviewed = [p for p in inst if not allowed(p) and p[0] not in ignored]
    return runs, bool(release == 'pnpm-10.34.7' and truthy(s.get('strictDepBuilds')) and unreviewed)


# ---- Bun

def rule_bun(pkg, rc, bunfig, inst, default_trusted, optional_docs, docs):
    if truthy(rc.get('ignore-scripts')) or (isinstance(bunfig.get('install'), dict) and bunfig['install'].get('ignoreScripts') is True):
        return [], False
    trusted = pkg.get('trustedDependencies')
    trusted = set(trusted) if isinstance(trusted, list) else default_trusted
    native = pkg.get('nativeDependencies')
    ignore = pkg.get('ignoreScripts')
    native_set = set(native) if isinstance(native, list) else {'esbuild', '@anthropic-ai/claude-code'}
    ignore_set = set(ignore) if isinstance(ignore, list) else None
    runs = []
    for p in inst:
        if p[0] not in trusted:
            continue
        name, version = p
        if ignore_set is not None:
            if name in ignore_set:
                continue
        elif name == 'sharp' and semver_key(version) and semver_key(version) >= (0, 33, 0, 0, ''):
            continue
        if name in native_set:
            skip = False
            for on, ov in (docs[p].get('optionalDependencies') or {}).items():
                od = optional_docs.get((on, ov))
                if od and od.get('os') and od.get('cpu') and list_ok(od['os'], 'linux') and list_ok(od['cpu'], 'x64'):
                    skip = True
            if skip:
                continue
        runs.append(p)
    return runs, False


# ---- Yarn

def yarn_meta(pkg, name, version):
    dm = pkg.get('dependenciesMeta') if isinstance(pkg.get('dependenciesMeta'), dict) else {}
    meta = {}
    for key, val in dm.items():
        kname, kver = o1b.name_at(key)
        if kname == name and isinstance(val, dict) and not kver:
            meta.update(val)
    for key, val in dm.items():
        kname, kver = o1b.name_at(key)
        if kname == name and isinstance(val, dict) and kver == version:
            meta.update(val)
    return meta


def rule_yarn4(release, pkg, yml, lockver, inst):
    yml = yml if isinstance(yml, dict) else {}
    if 'enableScripts' in yml:
        enable = truthy(yml['enableScripts'])
    elif release == 'yarn-4.18.1' and lockver is not None and lockver < 9:
        enable = True
    else:
        enable = release == 'yarn-4.13.0'
    runs = []
    for p in inst:
        meta = yarn_meta(pkg, *p)
        if meta.get('built') is False:
            continue
        if not enable and meta.get('built') is not True:
            continue
        runs.append(p)
    return runs, False


def rule_yarn1(yrc, inst):
    # .yarnrc: `ignore-scripts true`, `--ignore-scripts true`, or for the install command only,
    # `--install.ignore-scripts true`. .npmrc's is never read: yarn's own defaults, ignore-scripts
    # false among them, are merged into its configuration first (lib/cli.js:92903)
    if truthy(yrc.get('ignore-scripts')) or truthy(yrc.get('install.ignore-scripts')):
        return [], False
    return inst, False


# ---- one project, one rule

def decide(proj, release, lockver, cfgdir, docs, optional_docs, default_trusted):
    text = read_file(cfgdir, 'package.json')
    pkg = parse_json(text)
    notes = []
    if pkg is None:
        return [], True, ['package.json absent']
    if pkg == 'not JSON' or not isinstance(pkg, dict):
        return [], True, ['package.json is not JSON']
    rc = parse_npmrc(read_file(cfgdir, '.npmrc'))
    cfg = {}
    if release.startswith('npm-'):
        for k in ('os', 'cpu', 'libc'):
            if isinstance(rc.get(k), str) and rc[k]:
                cfg['npm_' + k] = rc[k]
    ws = yml = None
    if release.startswith('pnpm-'):
        ws = parse_yaml(read_file(cfgdir, 'pnpm-workspace.yaml')) or {}
        pf = pkg.get('pnpm') if isinstance(pkg.get('pnpm'), dict) else {}
        if release == 'pnpm-12.14.0':
            arch = ws.get('supportedArchitectures')
        elif release == 'pnpm-10.34.7':
            arch = pf['supportedArchitectures'] if 'supportedArchitectures' in pf else ws.get('supportedArchitectures')
        else:
            arch = pf.get('supportedArchitectures')
        if isinstance(arch, dict):
            cfg['supportedArchitectures'] = arch
    if release.startswith('yarn-4'):
        # Yarn builds only what fits this machine (isPackageCompatible against getArchitectureSet());
        # supportedArchitectures widens what it fetches, not what it builds
        yml = parse_yaml(read_file(cfgdir, '.yarnrc.yml')) or {}
    if release.startswith('npm-') and not installs({k: pkg.get(k) for k in ('os', 'cpu', 'libc')}, release, cfg):
        return [], True, ["the project's own os, cpu or libc excludes Linux x64 with glibc"]
    if release == 'pnpm-12.14.0' and ws.get('allowBuilds') is not None and not isinstance(ws.get('allowBuilds'), dict):
        return [], True, ['allowBuilds in pnpm-workspace.yaml is not a map']
    inst, missing = [], []
    for p in proj['pairs']:
        p = tuple(p)
        if p not in docs:
            missing.append(p)
            continue
        if kinds(docs[p]) and installs(docs[p], release, cfg):
            inst.append(p)
    if missing:
        notes.append(f'{len(missing)} install-code versions without a document')
    if release.startswith('npm-'):
        runs, fail = rule_npm(release, pkg, rc, inst)
    elif release.startswith('pnpm-'):
        runs, fail = rule_pnpm(release, pkg, rc, ws, cfgdir, inst)
    elif release == 'bun-1.4.3':
        bunfig_text = read_file(cfgdir, 'bunfig.toml')
        bunfig = tomllib.loads(bunfig_text) if bunfig_text else {}
        runs, fail = rule_bun(pkg, rc, bunfig, inst, default_trusted, optional_docs, docs)
    elif release.startswith('yarn-4'):
        runs, fail = rule_yarn4(release, pkg, yml, lockver, inst)
    else:
        runs, fail = rule_yarn1(parse_yarnrc_v1(read_file(cfgdir, '.yarnrc')), inst)
    marks = sorted({f'{n}@{v} {k}' for (n, v) in runs for k in kinds(docs[(n, v)])})
    return marks, fail, notes


def main():
    pop = {json.loads(l)['fullName']: json.loads(l) for l in open(os.path.join(RES, 'population.ndjson'), encoding='utf-8') if l.strip()}
    docs, optional_docs = {}, {}
    for l in open(os.path.join(IN, 'docs', 'versions.ndjson'), encoding='utf-8'):
        r = json.loads(l)
        if r['status'] == 'ok':
            docs[(r['name'], r['version'])] = r['doc']
    for l in open(os.path.join(IN, 'docs', 'optional.ndjson'), encoding='utf-8'):
        r = json.loads(l)
        if r['status'] == 'ok':
            optional_docs[(r['name'], r['spec'])] = r['doc']      # keyed as the parent names it
    default_trusted = {l.strip() for l in open(os.path.join(IN, 'bun-default-trusted.txt'), encoding='utf-8') if l.strip()}
    unavailable = {json.loads(l)['project'] for l in open(os.path.join(IN, 'config.ndjson'), encoding='utf-8')
                   if json.loads(l)['status'] == 'unavailable'}
    out = open(OUT, 'w', encoding='utf-8')
    for l in open(PAIRS, encoding='utf-8'):
        proj = json.loads(l)
        if not proj['pairs']:
            continue
        name = proj['fullName']
        cfgdir = os.path.join(IN, 'config', name.replace('/', '__'))
        berry_ver = int(proj['berryMetadata']['version']) if proj.get('berryMetadata', {}).get('version', '').isdigit() else None
        lockver = berry_ver if proj['manager'] == 'yarn-berry' else (-1 if proj['manager'] == 'yarn' else None)
        rel_a = release_a(proj['manager'])
        pm = pop[name]['packageManager']
        rel_b = release_for_pin(pm) or rel_a
        rules = [('A', rel_a), ('B', rel_b)]
        if proj['manager'] == 'yarn':
            rules.append(('A-yarn-4.18.1', 'yarn-4.18.1'))
        for rule, release in rules:
            if name in unavailable:
                out.write(json.dumps({'project': name, 'rule': rule, 'release': release, 'marks': [], 'exit': 'unavailable',
                                      'notes': ['configuration unavailable']}, sort_keys=True) + '\n')
                continue
            marks, fail, notes = decide(proj, release, lockver, cfgdir, docs, optional_docs, default_trusted)
            out.write(json.dumps({'project': name, 'rule': rule, 'release': release, 'marks': marks,
                                  'exit': 'fail' if fail else '0', 'notes': notes}, sort_keys=True) + '\n')
    out.close()


if __name__ == '__main__':
    main()
