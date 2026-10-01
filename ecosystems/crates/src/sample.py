#!/usr/bin/env python3
"""Draw the sample and fetch each project's root Cargo.lock and Cargo.toml.

usage: sample.py <frame.ndjson.gz> <population.ndjson> <store-dir> [n]

The frame is ordered by sha256(seed + "\\n" + fullName) and the first n are taken, a
simple random sample anyone can redraw from the frame file. Each is pinned to the
head commit of its default branch at fetch time; the files are read at that commit.
"""
import gzip, hashlib, json, os, subprocess, sys, time, urllib.request

FRAME, POP, STORE = sys.argv[1:4]
N = int(sys.argv[4]) if len(sys.argv) > 4 else 1000
SEED = 'norte-labs ecosystems/crates 2026-09-25'

def gh(path):
    for attempt in range(4):
        r = subprocess.run(['gh', 'api', path], capture_output=True, text=True)
        if r.returncode == 0: return json.loads(r.stdout)
        if 'Not Found' in r.stderr or 'HTTP 404' in r.stderr or 'HTTP 409' in r.stderr or 'HTTP 451' in r.stderr:
            return {'__error': r.stderr.strip()[-200:]}
        time.sleep(10 * (attempt + 1))
    return {'__error': r.stderr.strip()[-200:]}

def raw(full, sha, name):
    url = f'https://raw.githubusercontent.com/{full}/{sha}/{name}'
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r: return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
        except Exception: pass
        time.sleep(5 * (attempt + 1))
    raise RuntimeError(f'fetch failed {url}')

frame = [json.loads(l) for l in gzip.open(FRAME, 'rt')]
key = lambda r: hashlib.sha256(f'{SEED}\n{r["fullName"]}'.encode()).hexdigest()
drawn = sorted(frame, key=key)[:N]
done = set()
if os.path.exists(POP):
    done = {json.loads(l)['fullName'] for l in open(POP)}
os.makedirs(STORE, exist_ok=True)
with open(POP, 'a') as out:
    for rank, r in enumerate(drawn, 1):
        if r['fullName'] in done: continue
        row = {'rank': rank, 'fullName': r['fullName'], 'stars': r['stars'], 'pushedAt': r['pushedAt'],
               'defaultBranch': r['defaultBranch'], 'sha': None, 'committedAt': None,
               'hasCargoToml': False, 'hasCargoLock': False, 'status': None, 'note': None}
        c = gh(f'repos/{r["fullName"]}/commits/{r["defaultBranch"]}')
        if '__error' in c:
            row['status'], row['note'] = 'fetch-error', c['__error']
        else:
            row['sha'], row['committedAt'] = c['sha'], c['commit']['committer']['date']
            ls = gh(f'repos/{r["fullName"]}/contents?ref={c["sha"]}')
            names = {e['name'] for e in ls} if isinstance(ls, list) else set()
            row['hasCargoToml'], row['hasCargoLock'] = 'Cargo.toml' in names, 'Cargo.lock' in names
            d = os.path.join(STORE, r['fullName'].replace('/', '__'))
            for f in ('Cargo.toml', 'Cargo.lock'):
                if f in names:
                    b = raw(r['fullName'], c['sha'], f)
                    if b is not None:
                        os.makedirs(d, exist_ok=True); open(os.path.join(d, f), 'wb').write(b)
            row['status'] = ('ok' if row['hasCargoLock'] and os.path.exists(os.path.join(d, 'Cargo.lock'))
                             else 'no-Cargo.lock' if row['hasCargoToml'] else 'no-Cargo.toml')
        out.write(json.dumps(row) + '\n'); out.flush()
        if rank % 50 == 0: print(f'{rank}/{N}', file=sys.stderr, flush=True)
