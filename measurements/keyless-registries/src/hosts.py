#!/usr/bin/env python3
"""For every host other than registry.npmjs.org in instruction-gap's npm and yarn v1
lockfiles, read one lockfile that records it (the first by project name) again at its
pinned commit, and say what came through that host: registry tarballs, and under which
base path, or something else.

usage: hosts.py <instruction-gap results dir> <out.json>

A registry tarball is <base>/<name>/-/<file>.tgz or <base>/@<scope>/<name>/-/<file>.tgz; as
cnpm's older form writes it, <base>/<name>/download/<file>.tgz; or, as GitHub Packages writes it,
<base>/download/@<scope>/<name>/<version>/<hash>.
The host is compared without its port, and the query string is not part of the path:
an artifact server writes https://host:443/<path>/-/<file>.tgz?dl=<upstream>.
"""
import collections, json, re, sys, time, urllib.parse, urllib.request

UA = {'User-Agent': 'norte-labs measurement (chris@nortesoftware.dev)'}

IG, OUT = sys.argv[1], sys.argv[2]
SKIP = {'registry.npmjs.org', 'registry', 'none'}   # npmjs, and instruction-gap's no-URL markers
TARBALL = re.compile(r'^(.*?)/(?:@[^/]+/)?[^/]+/(?:-|download)/(?:@[^/]+/)?[^/]+\.tgz$|^(.*?)/download/@[^/]+/[^/]+/[^/]+/[0-9a-f]+$')

cells = {json.loads(l)['fullName']: json.loads(l) for l in open(IG + '/cells.ndjson')}
pop = {json.loads(l)['fullName']: json.loads(l) for l in open(IG + '/population.ndjson')}
first = {}
for fn in sorted(cells):
    c = cells[fn]
    if c['manager'] not in ('npm', 'yarn'): continue
    for h in (c['resolved'].get('hosts') or {}):
        if h not in SKIP: first.setdefault(h, fn)

out = {}
for h, fn in sorted(first.items()):
    p = pop[fn]; lf, sha = p['lockfile'], p['sha']
    url = f'https://raw.githubusercontent.com/{fn}/{sha}/{lf}'
    for attempt in range(3):
        try:
            body = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read().decode('utf8', 'replace'); break
        except Exception as e:
            err = str(e)[:100]; time.sleep(5)
    else:
        out[h] = {'project': fn, 'lockfile': lf, 'sha': sha, 'error': err}; continue
    urls = [u for u in re.findall(r'https?://[^\s"\'#,]+', body) if urllib.parse.urlsplit(u).hostname == h]
    bases = collections.Counter()
    for u in urls:
        s = urllib.parse.urlsplit(u)
        m = TARBALL.match(s.path)
        if m: bases[f'{s.scheme}://{s.netloc}{m.group(1) if m.group(1) is not None else m.group(2)}'] += 1
    out[h] = {'project': fn, 'lockfile': lf, 'sha': sha, 'urls': len(urls),
              'registryTarballs': sum(bases.values()), 'bases': bases.most_common(3)}
json.dump(out, open(OUT, 'w'), indent=1, sort_keys=True)
for h, v in out.items(): print(h, v.get('registryTarballs'), v.get('bases'), v.get('error', ''))
