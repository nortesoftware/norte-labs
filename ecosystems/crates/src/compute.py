#!/usr/bin/env python3
"""One cell per project: what its Cargo.lock declares, resolves, who published it
and who may publish it. Joins each root Cargo.lock to the crates.io dump index
(index_dump.py); versions the dump records no publisher for are read once from
the API, which says whether trusted publishing published them.

usage: compute.py <population.ndjson> <store-dir> <dump.sqlite> <api-cache.json> <cells.ndjson> <controls.txt>

Definitions, instruction-gap's carried over:
  local      = [[package]] entries with no source: the project's own crates
  declared   = distinct names in the dependencies of local packages that are not
               local packages (normal, dev and build dependencies of every target)
  resolved   = distinct (name, version) pairs whose source is crates.io
  publisher  = the account that published the resolved version, or gha:<repo>
               for a version published through trusted publishing
  named      = a publisher of any resolved version of a declared crate name
  owner      = a user or team listed as owner of a resolved crate, today
"""
import functools, hashlib, json, os, re, sqlite3, sys, time, tomllib, urllib.request

POP, STORE, DB, CACHE, OUT, CTRL = sys.argv[1:7]
SEED = 'norte-labs ecosystems/crates 2026-09-25'
CRATES_IO = ('registry+https://github.com/rust-lang/crates.io-index', 'sparse+https://index.crates.io/')
UA = {'User-Agent': 'norte-labs measurement (chris@nortesoftware.dev)'}
# instruction-gap's pattern, unchanged
AUTOMATION = re.compile(r'bot$|^bot-|-bot-|robot|automation|^types$|release-?bot|^npm$|^github actions$|\bci$|-ci$|^ci-|deploy|publisher$|^gha:', re.I)
CLUSTERS = [('bevy', {'bevy'}), ('tauri', {'tauri'}), ('dioxus', {'dioxus'}), ('leptos', {'leptos'}),
            ('yew', {'yew'}), ('egui', {'egui', 'eframe'}), ('iced', {'iced'}), ('gtk', {'gtk', 'gtk4'}),
            ('actix-web', {'actix-web'}), ('axum', {'axum'}), ('rocket', {'rocket'}), ('warp', {'warp'}),
            ('poem', {'poem'}), ('solana', {'solana-program', 'anchor-lang'}), ('ethereum', {'alloy', 'ethers'}),
            ('wasm-bindgen', {'wasm-bindgen'}), ('tokio', {'tokio'}), ('async-std', {'async-std'}), ('clap', {'clap'})]

db = sqlite3.connect(DB)
api = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
log = open(CTRL, 'a')
def say(s):
    print(s, file=log, flush=True); print(s, file=sys.stderr, flush=True)

@functools.lru_cache(maxsize=None)
def from_dump(name, version):
    r = db.execute('''select v.published_by, u.login from crates c join versions v on v.crate_id = c.id
                      left join users u on u.id = v.published_by where c.name = ? and v.num = ?''',
                   (name, version)).fetchone()
    if r is None: return {'status': 'missing'}
    return {'status': 'ok', 'login': r[1] if r[0] is not None else None}

def from_api(name, version):
    k = f'{name}@{version}'
    if k not in api:
        req = urllib.request.Request(f'https://crates.io/api/v1/crates/{name}/{version}', headers=UA)
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req, timeout=60) as r: v = json.load(r)['version']
                tp = v.get('trustpub_data') or {}
                # GitHub names the source repository; GitLab names the project path.
                src = tp.get('repository') or tp.get('project_path')
                api[k] = {'login': (v.get('published_by') or {}).get('login'),
                          'trustpub': src if tp.get('provider') in (None, 'github') else f"{tp.get('provider')}:{src}"}
                break
            except urllib.error.HTTPError as e:
                if e.code == 404: api[k] = {'login': None, 'trustpub': None, 'missing': True}; break
                time.sleep(5 * (attempt + 1))
            except Exception:
                time.sleep(5 * (attempt + 1))
        else:
            raise RuntimeError(f'API failed for {k}')
        time.sleep(1)
        if len(api) % 100 == 0: json.dump(api, open(CACHE, 'w'))
    return api[k]

def publisher(name, version):
    d = from_dump(name, version)
    if d['status'] == 'missing': return None, 'missing'
    if d['login']: return d['login'], 'user'
    a = from_api(name, version)
    # instruction-gap names a trusted-publishing repository gha:<repo>; a GitLab one keeps
    # its provider prefix instead, and counts as automation all the same (see cells below).
    if a.get('trustpub'):
        tp = a['trustpub']
        return (tp if tp.startswith('gitlab:') else f'gha:{tp}'), 'trustpub'
    return None, 'unknown'

@functools.lru_cache(maxsize=None)
def owners(name):
    out = set()
    for oid, kind in db.execute('select o.owner_id, o.kind from crates c join owners o on o.crate_id = c.id where c.name = ?', (name,)):
        row = db.execute('select login from users where id = ?' if kind == 0 else 'select login from teams where id = ?', (oid,)).fetchone()
        if row: out.add(row[0])
    return frozenset(out)

def parse_lock(text):
    lock = tomllib.loads(text)
    pkgs = lock.get('package', [])
    local = {}
    for p in pkgs:
        if 'source' not in p: local.setdefault(p['name'], set()).add(p['version'])
    declared, resolved, other = set(), set(), {}
    for p in pkgs:
        src = p.get('source')
        if src is None:
            for dep in p.get('dependencies', []):
                parts = dep.split()
                n = parts[0]
                if n in local and (len(parts) == 1 or (len(parts) >= 2 and parts[1] in local[n] and len(parts) == 2)):
                    continue   # a local package depending on a sibling
                declared.add(n)
        elif src.startswith(CRATES_IO):
            resolved.add((p['name'], p['version']))
        else:
            kind = 'git' if src.startswith('git+') else 'other-registry' if src.startswith(('registry+', 'sparse+')) else 'other'
            other[kind] = other.get(kind, 0) + 1
    return lock.get('version', 1), local, declared, resolved, other

def manifest_declared(text):
    """Names a single-package root Cargo.toml asks crates.io for; None if it is a workspace."""
    m = tomllib.loads(text)
    if 'workspace' in m or 'package' not in m: return None
    out = set()
    def take(tbl):
        for k, v in (tbl or {}).items():
            if isinstance(v, dict):
                if 'path' in v or 'git' in v or 'registry' in v: continue
                out.add(v.get('package', k))
            else: out.add(k)
    for t in ('dependencies', 'dev-dependencies', 'build-dependencies'): take(m.get(t))
    for tgt in (m.get('target') or {}).values():
        for t in ('dependencies', 'dev-dependencies', 'build-dependencies'): take(tgt.get(t))
    return out

# ---- controls, before any count ----
fails = 0
def check(label, ok, got):
    global fails
    say(f'CONTROL {label}: {"pass" if ok else "FAIL"} ({got})')
    fails += 0 if ok else 1
p = publisher('serde', '1.0.229'); check('serde 1.0.229 -> dtolnay', p == ('dtolnay', 'user'), p)
p = publisher('aws-config', '1.12.0'); check('aws-config 1.12.0 -> automation', p[1] == 'user' and bool(AUTOMATION.search(p[0] or '')), p)
d = from_dump('chacha20', '0.10.2'); p = publisher('chacha20', '0.10.2')
check('chacha20 0.10.2 -> null in dump, gha:RustCrypto/stream-ciphers', d == {'status': 'ok', 'login': None} and p == ('gha:RustCrypto/stream-ciphers', 'trustpub'), (d, p))
p = publisher('num-cmp', '0.1.0'); check('num-cmp 0.1.0 -> unknown', p == (None, 'unknown'), p)
o = owners('serde'); check('serde owners include dtolnay and github:serde-rs:publish', {'dtolnay', 'github:serde-rs:publish'} <= o, sorted(o))
if fails: sys.exit(f'{fails} control(s) failed; nothing computed')

pop = [json.loads(l) for l in open(POP)]
cells, seen_pairs = [], set()
decl_checked = decl_agree = 0
for r in pop:
    if r['status'] != 'ok': continue
    d = os.path.join(STORE, r['fullName'].replace('/', '__'))
    try:
        lv, local, declared, resolved, other = parse_lock(open(os.path.join(d, 'Cargo.lock'), encoding='utf8').read())
    except Exception as e:
        say(f'UNREADABLE {r["fullName"]}: {str(e)[:120]}'); r['status'] = 'unreadable'; continue
    notes = []
    tomlp = os.path.join(d, 'Cargo.toml')
    if os.path.exists(tomlp):
        try:
            md = manifest_declared(open(tomlp, encoding='utf8').read())
        except Exception as e:
            md = None; notes.append(f'Cargo.toml unreadable: {str(e)[:80]}')
        if md is not None:
            decl_checked += 1
            if md == declared: decl_agree += 1
            else: notes.append(f'declared differs from manifest: lock-only {sorted(declared - md)[:5]}, manifest-only {sorted(md - declared)[:5]}')
    pubs, kinds, unknown, missing = {}, {}, 0, 0
    own_users, own_teams = set(), set()
    for (n, v) in sorted(resolved):
        seen_pairs.add((n, v))
        who, kind = publisher(n, v)
        if kind == 'missing': missing += 1; continue
        if who is None: unknown += 1
        else:
            pubs.setdefault(who, False)
            if n in declared: pubs[who] = True
            kinds[who] = kind
    for n in {n for n, v in resolved}:
        for o in owners(n):
            (own_teams if o.startswith('github:') else own_users).add(o)
    cluster = next((c for c, names in CLUSTERS if names & declared), 'none')
    total = len(pubs)
    cells.append({
        'fullName': r['fullName'], 'sha': r['sha'], 'stars': r['stars'], 'lockVersion': lv,
        'local': sum(len(v) for v in local.values()), 'declared': len(declared),
        'resolved': len(resolved), 'names': len({n for n, v in resolved}), 'otherSources': other,
        'lookup': {'missing': missing, 'unknownPublisher': unknown},
        'publishers': {'total': total, 'users': sum(1 for k in kinds.values() if k == 'user'),
                       'trustedPublishing': sum(1 for k in kinds.values() if k == 'trustpub'),
                       'automation': sum(1 for p in pubs if AUTOMATION.search(p) or kinds[p] == 'trustpub'),
                       'behindDeclared': sum(1 for x in pubs.values() if x),
                       'ids': sorted(pubs)},
        'owners': {'total': len(own_users) + len(own_teams), 'users': len(own_users), 'teams': len(own_teams),
                   'ids': sorted(own_users | own_teams)},
        'cluster': cluster, 'notes': notes})
json.dump(api, open(CACHE, 'w'))

# ---- controls on the run itself ----
zero = [c for c in cells if c['resolved'] == 0]
check(f'no registry dependency -> 0 publishers and 0 owners ({len(zero)} projects)',
      all(c['publishers']['total'] == 0 and c['owners']['total'] == 0 for c in zero), len(zero))
say(f'CONTROL declared from Cargo.lock = single-package manifest: {decl_agree} of {decl_checked} agree')
key = lambda nv: hashlib.sha256(f'{SEED}\n{nv[0]}@{nv[1]}'.encode()).hexdigest()
withlogin = [nv for nv in sorted(seen_pairs, key=key) if (from_dump(*nv).get('login'))][:50]
agree = 0
for n, v in withlogin:
    a = from_api(n, v)
    if a.get('login') == from_dump(n, v)['login']: agree += 1
    else: say(f'  dump/API differ: {n}@{v} dump={from_dump(n, v)["login"]} api={a.get("login")}')
json.dump(api, open(CACHE, 'w'))
check(f'dump = API on {len(withlogin)} seeded versions', agree == len(withlogin) == 50, agree)

logins = {p for c in cells for p in c['publishers']['ids'] if not p.startswith(('gha:', 'gitlab:'))}
shared = {l: n for l in sorted(logins)
          for (n,) in [db.execute('select count(*) from users where login = ?', (l,)).fetchone()] if n > 1}
say(f'CHECK publisher logins mapping to more than one user id: {len(shared)} of {len(logins)} {sorted(shared.items())[:10]}')
with open(OUT, 'w') as f:
    for c in cells: f.write(json.dumps(c, sort_keys=True) + '\n')
say(f'cells {len(cells)}; distinct resolved versions {len(seen_pairs)}; API lookups cached {len(api)}')
if fails: sys.exit(f'{fails} control(s) failed after the run')
