#!/usr/bin/env python3
"""The bun and pnpm 6.0 lockfiles of instruction-gap, which are not among the 572: the registry
host each package's entry names. bun.lock gives a package from any registry other than npmjs a URL
as the second element of its entry; pnpm 6.0 keys a package from a registry other than the default
by that registry's host, and gives some a tarball URL.

usage: left_out.py <instruction-gap results dir> <out.json>
"""
import collections, json, re, sys, time, urllib.request

IG, OUT = sys.argv[1:3]
UA = {'User-Agent': 'norte-labs measurement (chris@nortesoftware.dev)'}
cells = [json.loads(l) for l in open(IG + '/cells.ndjson')]
pop = {json.loads(l)['fullName']: json.loads(l) for l in open(IG + '/population.ndjson')}

def host(u):
    m = re.match(r'https?://([^/:]+)', u)
    return m.group(1).lower() if m else None

out = {}
for c in sorted(cells, key=lambda c: c['fullName']):
    if not (c['manager'] == 'bun' or c['manager'] == 'pnpm' and str(c['lockfileVersion']).startswith('6')):
        continue
    p = pop[c['fullName']]
    url = f"https://raw.githubusercontent.com/{c['fullName']}/{p['sha']}/{p['lockfile']}"
    for attempt in range(3):
        try:
            t = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read().decode('utf8', 'replace'); break
        except Exception as e:
            err = str(e)[:100]; time.sleep(5)
    else:
        out[c['fullName']] = {'manager': c['manager'], 'lockfile': p['lockfile'], 'sha': p['sha'], 'error': err}; continue
    hosts = collections.Counter()
    if c['manager'] == 'bun':
        # bun.lock is JSON with trailing commas
        j = json.loads(re.sub(r',(\s*[}\]])', r'\1', t))
        for e in (j.get('packages') or {}).values():
            if isinstance(e, list) and len(e) > 1 and isinstance(e[1], str) and e[1].startswith('http'):
                hosts[host(e[1])] += 1
    else:
        inpk = False
        for line in t.splitlines():
            if line.startswith('packages:'):
                inpk = True; continue
            if inpk and re.match(r'^\S', line):
                inpk = False
            m = re.match(r"^  '?([^/\s'][^\s']*?)/(?:@[^/]+/)?[^/]+/[^/]+'?:$", line) if inpk else None
            if m and '.' in m.group(1):
                hosts[m.group(1).lower()] += 1
            m = re.search(r'tarball: (https?://\S+?)[,}]', line)
            if m:
                hosts[host(m.group(1))] += 1
    out[c['fullName']] = {'manager': c['manager'], 'lockfileVersion': c['lockfileVersion'],
                          'lockfile': p['lockfile'], 'sha': p['sha'], 'hosts': dict(hosts)}
json.dump(out, open(OUT, 'w'), indent=1, sort_keys=True)
for fn, v in out.items():
    if v.get('hosts') or 'error' in v:
        print(fn, v)
print(len(out), 'lockfiles')
