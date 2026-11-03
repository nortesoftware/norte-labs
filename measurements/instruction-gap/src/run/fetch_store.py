#!/usr/bin/env python3
"""Builds the store both paths read: each project's lockfile, and for the projects whose lockfile
embeds no manifest (yarn v1, npm v1) its manifests, every file as it stood at the pinned commit.
Lockfiles the dataset ships verbatim come from the package; the rest from the URL the dataset's
provenance gives, fetched with the norte-labs User-Agent, or, where GitHub no longer serves it, from
Software Heritage by the provenance's sha1_git. Every file is kept only if its sha256 and its git
blob hash equal the provenance's. A file kept by an earlier run is reused after the same check.
Layout as instruction-gap's store: <owner>__<repo>/<file>, workspace manifests under ws/.

usage: fetch_store.py <dataset-dir> <store-dir> <log>
"""
import hashlib, json, os, sys, time, urllib.error, urllib.request

UA = 'norte-labs measurement (chris@nortesoftware.dev)'
ds, store, logf = sys.argv[1:4]
npm = os.path.join(ds, 'npm')
cells = {json.loads(l)['fullName']: json.loads(l) for l in open(os.path.join(npm, 'cells.ndjson')) if l.strip()}
from_manifests = {n for n, c in cells.items() if c['declared']['source'] == 'manifests'}
prov = [json.loads(l) for l in open(os.path.join(npm, 'provenance.ndjson')) if l.strip()]
want = [r for r in prov if r['kind'] == 'lockfile' or (r['kind'] == 'manifest' and r['project'] in from_manifests)]


def blob(data):
    return hashlib.sha1(b'blob %d\0' % len(data) + data).hexdigest()


def fetch(url):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
            err = e
        except Exception as e:
            err = e
        time.sleep(5 * (attempt + 1))
    raise RuntimeError(f'{url}: {err}')


def good(data, r):
    return data is not None and hashlib.sha256(data).hexdigest() == r['sha256'] and blob(data) == r['sha1Git']


bad = 0
counts = {'package': 0, 'github': 0, 'swh': 0, 'store': 0}
with open(logf, 'w') as log:
    for r in sorted(want, key=lambda r: (r['project'], r['kind'], r['path'])):
        rel = r['path'] if r['kind'] == 'lockfile' or r['path'] == 'package.json' else os.path.join('ws', r['path'])
        dest = os.path.join(store, r['project'].replace('/', '__'), rel)
        data, src = None, None
        if os.path.exists(dest) and good(open(dest, 'rb').read(), r):
            data, src = open(dest, 'rb').read(), 'store'
        elif r['kind'] == 'lockfile' and r['shipped'] == 'verbatim':
            data, src = open(os.path.join(ds, r['datasetPath']), 'rb').read(), 'package'
        else:
            data, src = fetch(r['url']), 'github'; time.sleep(0.2)
            if not good(data, r):
                data, src = fetch(f"https://archive.softwareheritage.org/api/1/content/sha1_git:{r['sha1Git']}/raw/"), 'swh'
                time.sleep(1)
        ok = good(data, r)
        print(f"{r['project']}\t{rel}\t{src}\t{len(data) if data is not None else '-'}\t{'ok' if ok else 'UNAVAILABLE'}", file=log, flush=True)
        if not ok:
            bad += 1; continue
        counts[src] += 1
        if src != 'store':
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, 'wb') as f:
                f.write(data)
print(f"files {len(want)}: " + ', '.join(f'{k} {v}' for k, v in counts.items()) + f", unavailable {bad}")
sys.exit(1 if bad else 0)
