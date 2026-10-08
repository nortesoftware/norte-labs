#!/usr/bin/env python3
"""For each lockfile that resolves through a registry with neither keys nor signatures, the
packages each registry host resolved, scoped and unscoped.

usage: scopes.py <instruction-gap results dir> <probe.json> <out.json>

npm sends a scoped package to the registry its scope is mapped to and every other package to the
default registry, so a host that resolved unscoped packages was the default when they were
fetched. Names are read from the tarball URLs: <base>/<name>/-/<file>.tgz, or cnpm's older
<base>/<name>/download/<name>-<version>.tgz.
"""
import collections, json, re, sys, time, urllib.request

IG, PROBE, OUT = sys.argv[1:4]
UA = {'User-Agent': 'norte-labs measurement (chris@nortesoftware.dev)'}
URL = re.compile(r'https?://([A-Za-z0-9.-]+)(?::\d+)?/((?:@[^/\s"]+/)?[^/@\s"]+)/(?:-|download)/[^\s"#?]*\.tgz')

probe = json.load(open(PROBE))
keyless = {h for h, v in probe['hosts'].items() if v['keys'] == 'no keys, no signatures'}
cells = [json.loads(l) for l in open(IG + '/cells.ndjson')]
pop = {json.loads(l)['fullName']: json.loads(l) for l in open(IG + '/population.ndjson')}

out = {}
for c in sorted(cells, key=lambda c: c['fullName']):
    if c['manager'] not in ('npm', 'yarn') or not keyless & set(c['resolved'].get('hosts') or {}):
        continue
    p = pop[c['fullName']]
    url = f"https://raw.githubusercontent.com/{c['fullName']}/{p['sha']}/{p['lockfile']}"
    for attempt in range(3):
        try:
            body = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read().decode('utf8', 'replace'); break
        except Exception as e:
            err = str(e)[:100]; time.sleep(5)
    else:
        out[c['fullName']] = {'error': err}; continue
    names = collections.defaultdict(lambda: (set(), set()))
    for host, name in URL.findall(body):
        names[host.lower()][0 if name.startswith('@') else 1].add(name)
    # a scope that resolved through more than one host was not under one configuration
    byscope = collections.defaultdict(collections.Counter)
    for h, (s, u) in names.items():
        for name in s:
            byscope[name.split('/')[0]][h] += 1
    out[c['fullName']] = {'lockfile': p['lockfile'], 'sha': p['sha'],
                          'hosts': {h: {'scoped': len(s), 'unscoped': len(u)} for h, (s, u) in sorted(names.items())},
                          'scopesOnTwoHosts': {sc: dict(n) for sc, n in sorted(byscope.items()) if len(n) > 1}}
json.dump(out, open(OUT, 'w'), indent=1, sort_keys=True)
for fn, v in out.items():
    print(fn, v.get('hosts', v))
