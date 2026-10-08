#!/usr/bin/env python3
"""The registry settings committed at the root of each project in scopes.json: .npmrc, and for
yarn v1 also .yarnrc and .yarnrc.yml, at the pinned commit. Only lines that name a registry or set
npm's `scope`, which sends unscoped packages to that scope's registry, are kept. Settings in CI, in
a user's own files or in the environment are not visible here.

usage: rcfiles.py <instruction-gap results dir> <scopes.json> <out.json>
"""
import json, re, sys, time, urllib.error, urllib.request

IG, SCOPES, OUT = sys.argv[1:4]
UA = {'User-Agent': 'norte-labs measurement (chris@nortesoftware.dev)'}
pop = {json.loads(l)['fullName']: json.loads(l) for l in open(IG + '/population.ndjson')}
cells = {json.loads(l)['fullName']: json.loads(l) for l in open(IG + '/cells.ndjson')}

def get(url):
    for attempt in range(3):
        try:
            return 200, urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read().decode('utf8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code == 404: return 404, None
            err = e.code
        except Exception as e:
            err = str(e)[:80]
        time.sleep(5)
    return err, None

out = {}
for fn in sorted(json.load(open(SCOPES))):
    p = pop[fn]
    files = ['.npmrc'] + (['.yarnrc', '.yarnrc.yml'] if cells[fn]['manager'] == 'yarn' else [])
    rec = {'manager': cells[fn]['manager'], 'sha': p['sha'], 'files': {}}
    for f in files:
        status, body = get(f"https://raw.githubusercontent.com/{fn}/{p['sha']}/{f}")
        rec['files'][f] = {'status': status,
                           'registryLines': [l.strip() for l in (body or '').splitlines()
                                             if re.search(r'registry', l, re.I) or re.match(r'\s*scope\s*=', l)]}
    out[fn] = rec
    print(fn, {f: (v['status'], v['registryLines']) for f, v in rec['files'].items()})
json.dump(out, open(OUT, 'w'), indent=1, sort_keys=True)
