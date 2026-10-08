#!/usr/bin/env python3
"""Whether npmmirror's documents carry npmjs's signatures: five versions, from npmmirror and from
npmjs, in the full package document and in the per-version one, whether the full document names
attestations, and the version's publication time as npmjs records it.

usage: documents.py <out.json>
"""
import json, sys, urllib.request

UA = {'User-Agent': 'norte-labs measurement (chris@nortesoftware.dev)', 'Accept': 'application/json'}
VERSIONS = [('lodash', '4.17.21'), ('semver', '7.8.5'), ('sigstore', '5.0.0'), ('@types/lodash', '4.14.120')]
REGISTRIES = ['https://registry.npmmirror.com', 'https://registry.npmjs.org']

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return json.load(r)

# and the newest @types/lodash on npmjs when this runs
VERSIONS.append(('@types/lodash', get('https://registry.npmjs.org/@types%2flodash')['dist-tags']['latest']))
out = {}
for name, version in VERSIONS:
    enc = name.replace('/', '%2f')
    published = get(f'https://registry.npmjs.org/{enc}').get('time', {}).get(version)
    row = {'published': published}
    for base in REGISTRIES:
        full = (get(f'{base}/{enc}').get('versions') or {}).get(version, {}).get('dist', {})
        one = get(f'{base}/{name}/{version}').get('dist', {})
        row[base.split('//')[1]] = {
            'fullDoc': [s.get('keyid') for s in full.get('signatures') or []],
            'versionDoc': [s.get('keyid') for s in one.get('signatures') or []],
            'fullDocAttestations': bool(full.get('attestations'))}
    out[f'{name}@{version}'] = row
    print(name, version, json.dumps(row))
json.dump(out, open(sys.argv[1], 'w'), indent=1, sort_keys=True)
