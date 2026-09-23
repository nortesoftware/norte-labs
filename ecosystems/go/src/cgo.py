#!/usr/bin/env python3
"""Which of the packages a build actually compiles arrive through cgo.

This needs module source, not just .mod files, so it runs over a seeded subsample
and is reported as one. `go list -deps ./...` is the set the build compiles, which
is the right denominator: the module graph contains modules no package imports.
"""
import hashlib, json, os, re, subprocess, sys, time

POP, OUT = sys.argv[1], sys.argv[2]
N = int(sys.argv[sys.argv.index('--n')+1]) if '--n' in sys.argv else 40
SEED = sys.argv[sys.argv.index('--seed')+1] if '--seed' in sys.argv else 'norte-labs ecosystems-go cgo 2026-09-23'
CAP_GB = float(os.environ.get('NL_CAP_GB', '3.0'))
WORK = '/var/tmp/nl-go/cgowork'
GO = os.environ.get('NL_GO', 'go')
ENV = dict(os.environ, GOMODCACHE=os.environ.get('GOMODCACHE', '/var/tmp/nl-go/modcache'),
           GOFLAGS='-mod=mod', GOTOOLCHAIN='local', GOWORK='off', GIT_TERMINAL_PROMPT='0')
os.makedirs(WORK, exist_ok=True)

cells = [json.loads(l) for l in open(POP) if l.strip()]
ok = [c for c in cells if c.get('status') == 'ok' and c.get('modules', 0) > 1]
ranked = sorted(ok, key=lambda c: hashlib.sha256((SEED + c['fullName']).encode()).hexdigest())[:N]

done = set()
if os.path.exists(OUT):
    for l in open(OUT):
        try: done.add(json.loads(l)['fullName'])
        except Exception: pass

def cache_gb():
    r = subprocess.run(['du', '-sb', ENV['GOMODCACHE']], capture_output=True, text=True)
    try: return int(r.stdout.split()[0]) / 1e9
    except Exception: return 0.0

with open(OUT, 'a') as out:
    for c in ranked:
        fn = c['fullName']
        if fn in done: continue
        if cache_gb() > CAP_GB:
            print(f'STOP: module cache over {CAP_GB} GB', file=sys.stderr); break
        d = os.path.join(WORK, fn.replace('/', '__'))
        rec = {'fullName': fn, 'rank': c['rank']}
        try:
            subprocess.run(['rm', '-rf', d], check=False)
            g = subprocess.run(['git', 'clone', '-q', '--depth', '1',
                                f'https://github.com/{fn}.git', d], capture_output=True, timeout=300)
            if g.returncode != 0:
                rec['status'] = 'clone-failed'; out.write(json.dumps(rec)+'\n'); out.flush(); continue
            r = subprocess.run([GO, 'list', '-deps', '-e',
                                '-f', '{{.ImportPath}}\t{{if .Module}}{{.Module.Path}}{{else}}std{{end}}\t{{len .CgoFiles}}\t{{len .SFiles}}',
                                './...'], cwd=d, env=ENV, capture_output=True, text=True, timeout=1200)
            pkgs, cgo_pkgs, asm_pkgs, cgo_mods, mods = 0, 0, 0, set(), set()
            for ln in r.stdout.splitlines():
                f = ln.split('\t')
                if len(f) < 4: continue
                pkgs += 1
                mod = f[1] if f[1] not in ('', '<nil>') else None
                if mod: mods.add(mod)
                try: nc, na = int(f[2]), int(f[3])
                except ValueError: continue
                if nc: cgo_pkgs += 1;  cgo_mods.add(mod) if mod else None
                if na: asm_pkgs += 1
            rec.update({'status': 'ok', 'packages': pkgs, 'cgoPackages': cgo_pkgs,
                        'asmPackages': asm_pkgs, 'modules': len(mods),
                        'cgoModules': sorted(x for x in cgo_mods if x),
                        'stderrTail': r.stderr[-200:] if r.returncode else ''})
        except subprocess.TimeoutExpired:
            rec['status'] = 'timeout'
        except Exception as e:
            rec['status'] = 'error'; rec['error'] = str(e)[:200]
        finally:
            subprocess.run(['rm', '-rf', d], check=False)
            # Source trees are large and this question needs them, so the cache is
            # emptied between projects: disk stays flat at the cost of re-fetching.
            if os.environ.get('NL_PURGE'):
                subprocess.run([GO, 'clean', '-modcache'], env=ENV, capture_output=True)
        out.write(json.dumps(rec)+'\n'); out.flush()
        print(f"{rec.get('rank'):4d} {fn[:40]:<40} {rec.get('status'):<12} "
              f"pkgs={rec.get('packages','-')} cgo={rec.get('cgoPackages','-')} "
              f"cache={cache_gb():.2f}GB", file=sys.stderr, flush=True)
