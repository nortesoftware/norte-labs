#!/usr/bin/env python3
"""Which registries in instruction-gap's lockfiles serve npm signing keys.

usage: probe.py <instruction-gap results dir> <out.json>

For each registry host, GET <base>/-/npm/v1/keys, which npm audit signatures reads for a
registry whose keys are not in Sigstore's TUF repository, and lodash 4.17.21's dist.signatures
in the per-version document (<base>/lodash/4.17.21) and in the full one (<base>/lodash), which
the audit reads and which decides the class. The bases are the ones hosts.py reads from the
lockfiles. A class is lodash 4.17.21's: other versions' documents can differ.
"""
import json, math, sys, urllib.request, urllib.error, collections

IG, OUT = sys.argv[1], sys.argv[2]
UA = {'User-Agent': 'norte-labs measurement (chris@nortesoftware.dev)', 'Accept': 'application/json'}
REGISTRY_BASES = {
    'registry.yarnpkg.com': 'https://registry.yarnpkg.com',
    'registry.npmmirror.com': 'https://registry.npmmirror.com',
    'npm.flatt.tech': 'https://npm.flatt.tech',
    'npm.pkg.github.com': 'https://npm.pkg.github.com',
    'na.artifactory.swg-devops.com': 'https://na.artifactory.swg-devops.com:443/artifactory/api/npm/wcp-wdp-npm-virtual',
}
NOT_REGISTRY = {'cdn.sheetjs.com': 'tarball', 'gitpkg.vercel.app': 'tarball', 'github.com': 'git',
                'codeload.github.com': 'git', 'gitlab.gnome.org': 'git',
                # instruction-gap's 'registry': a registry package whose lockfile entry records no URL
                'registry': 'no URL recorded', 'none': 'no URL recorded'}

def get(url):
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, b''
    except Exception as e:
        return None, str(e)[:120].encode()

def keys(base):
    s, b = get(base + '/-/npm/v1/keys')
    if s == 200:
        try: k = json.loads(b).get('keys') or []
        except Exception: k = []
        return ('serves keys' if k else 'no keys'), s, len(k)
    if s in (404, 400): return 'no keys', s, 0
    if s in (401, 403): return 'auth required', s, 0
    return 'unreachable', s, 0

def signed(base):
    """dist.signatures in the per-version document and in the full one, which npm's audit reads."""
    s1, b1 = get(base + '/lodash/4.17.21')
    s2, b2 = get(base + '/lodash')
    def dist(b, full):
        try:
            d = json.loads(b)
            d = (d.get('versions') or {}).get('4.17.21') if full else d
            return (d or {}).get('dist') or {}
        except Exception: return None
    d1 = dist(b1, False) if s1 == 200 else None
    d2 = dist(b2, True) if s2 == 200 else None
    return {'versionDoc': s1, 'versionDocSignatures': None if d1 is None else bool(d1.get('signatures')),
            'fullDoc': s2, 'fullDocSignatures': None if d2 is None else bool(d2.get('signatures')),
            'fullDocAttestations': None if d2 is None else bool(d2.get('attestations'))}

res = {'controls': {}, 'hosts': {}}
c1 = keys('https://registry.npmjs.org')
s, b = get('https://registry.npmjs.org/-/npm/v1/keysx')
c3 = signed('https://registry.npmjs.org')
res['controls'] = {'npmjs keys': c1, 'npmjs keysx status': s, 'npmjs lodash signatures': c3}
ok = c1[0] == 'serves keys' and s == 404 and c3['fullDocSignatures'] is True and c3['versionDocSignatures'] is True
print('CONTROLS', 'pass' if ok else 'FAIL', res['controls'])
if not ok: sys.exit('control failed; nothing probed')

for h, base in REGISTRY_BASES.items():
    k = keys(base); sg = signed(base)
    klass = k[0]
    if sg['versionDoc'] in (401, 403) or sg['fullDoc'] in (401, 403):
        klass = 'auth required'
    elif klass == 'no keys':
        klass = 'no keys, signatures passed through' if sg['fullDocSignatures'] else 'no keys, no signatures'
    res['hosts'][h] = {'base': base, 'keys': klass, 'keysStatus': k[1], 'keyCount': k[2], **sg}
    print(h, res['hosts'][h])

cells = [json.loads(l) for l in open(IG + '/cells.ndjson')]
pop = [c for c in cells if c['manager'] in ('npm', 'yarn')]
def wilson(k, n, z=1.96):
    p = k / n; d = 1 + z*z/n; c = p + z*z/(2*n); r = z*math.sqrt(p*(1-p)/n + z*z/(4*n*n))
    return round(100*k/n, 1), round(100*(c-r)/d, 1), round(100*(c+r)/d, 1)
cls = {h: v['keys'] for h, v in res['hosts'].items()}
cls['registry.npmjs.org'] = 'serves keys'
by = collections.defaultdict(lambda: [0, 0])
proj = collections.Counter(); versions = collections.Counter(); total_versions = 0
for c in pop:
    hs = c['resolved'].get('hosts') or {}
    total_versions += sum(hs.values())
    kinds = set()
    for h, n in hs.items():
        k = cls.get(h, NOT_REGISTRY.get(h, 'other'))
        kinds.add(k); versions[k] += n
        by[h][0] += 1; by[h][1] += n
    for k in kinds: proj[k] += 1
res['population'] = len(pop)
res['projects'] = {k: {'n': v, 'pct': wilson(v, len(pop))} for k, v in proj.items()}
res['versions'] = {'total': total_versions, **dict(versions)}
res['byHost'] = {h: {'projects': v[0], 'versions': v[1], 'class': cls.get(h, NOT_REGISTRY.get(h, 'other'))} for h, v in sorted(by.items(), key=lambda kv: -kv[1][0])}
json.dump(res, open(OUT, 'w'), indent=1)
print(json.dumps({k: res[k] for k in ('population', 'projects', 'versions')}, indent=1))
