#!/usr/bin/env python3
"""Per project: resolve the module graph, derive owners both ways, read every
go.mod in the graph for a toolchain directive.

Only .mod files are fetched -- no module source and no build -- so the walk costs
network and almost no disk. The cgo question needs source and is measured over a
subsample by cgo.py.
"""
import json, os, re, subprocess, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from owner import rule_a, rule_b

POP, OUT = sys.argv[1], sys.argv[2]
WORK = os.environ.get('NL_WORK', '/var/tmp/nl-go/work')
CACHE = os.environ.get('NL_OWNER_CACHE', '/var/tmp/nl-go/owner-cache.json')
os.makedirs(WORK, exist_ok=True)
ENV = dict(os.environ, GOMODCACHE=os.environ.get('GOMODCACHE', '/var/tmp/nl-go/modcache'),
           GOFLAGS='-mod=mod', GOTOOLCHAIN='local', GOWORK='off',
           GIT_TERMINAL_PROMPT='0')
# GOWORK=off: a repository carrying a go.work refuses -mod=mod in workspace mode,
# which failed every monorepo that uses one. Reading the main module's own go.mod
# is also the right question here -- what this project's manifest pulls -- so the
# workspace is switched off rather than the flag dropped.
# GOTOOLCHAIN=local: the walk must not download a toolchain because a sampled
# repository asked for one. Which repositories ask is a result, read from the
# go.mod text, not something the instrument should act on.
#
# The toolchain the walk runs is therefore chosen once, in advance, and must be
# recent: a `go` directive newer than the running toolchain makes `go list` refuse
# outright under GOTOOLCHAIN=local, and Go projects raise that directive quickly.
# Six of the first eleven repositories sampled required a version newer than the
# distribution's go1.24.4, so keeping that would have dropped the best-maintained
# projects and biased every figure. NL_GO names the binary; the version used is
# recorded in each cell.
GO = os.environ.get('NL_GO', 'go')

GOVER = subprocess.run([GO, 'version'], capture_output=True, text=True).stdout.strip()
owner_cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
done = set()
if os.path.exists(OUT):
    for l in open(OUT):
        try: done.add(json.loads(l)['fullName'])
        except Exception: pass

TOOLCHAIN = re.compile(r'^\s*toolchain\s+(\S+)', re.M)
GODIRECTIVE = re.compile(r'^\s*go\s+(\d+\.\d+(?:\.\d+)?)', re.M)

def run(args, cwd, timeout=600):
    return subprocess.run(args, cwd=cwd, env=ENV, capture_output=True, text=True, timeout=timeout)

def graph_toolchains(mods):
    """Read the cached .mod of every module in the graph for a toolchain line."""
    mc = ENV['GOMODCACHE']
    found, read = {}, 0
    for path, ver in mods:
        if not ver: continue
        esc = re.sub(r'([A-Z])', lambda m: '!' + m.group(1).lower(), path)
        p = os.path.join(mc, 'cache', 'download', esc, '@v', f'{ver}.mod')
        if not os.path.exists(p): continue
        read += 1
        try: txt = open(p, encoding='utf8', errors='replace').read()
        except OSError: continue
        m = TOOLCHAIN.search(txt)
        if m: found[f'{path}@{ver}'] = m.group(1)
    return found, read

with open(OUT, 'a') as out:
    for line in open(POP):
        r = json.loads(line)
        fn = r['fullName']
        if fn in done: continue
        t0 = time.time()
        cell = {'fullName': fn, 'stars': r['stars'], 'rank': r['rank'],
                'goVersion': GOVER,
                'startedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
        d = os.path.join(WORK, fn.replace('/', '__'))
        try:
            subprocess.run(['rm', '-rf', d], check=False)
            c = subprocess.run(['git', 'clone', '-q', '--depth', '1',
                                f'https://github.com/{fn}.git', d],
                               capture_output=True, text=True, timeout=300)
            if c.returncode != 0:
                cell['status'] = 'clone-failed'; cell['error'] = c.stderr[-300:]
                out.write(json.dumps(cell) + '\n'); out.flush(); continue
            gomod = os.path.join(d, 'go.mod')
            if not os.path.exists(gomod):
                cell['status'] = 'no-go.mod'
                out.write(json.dumps(cell) + '\n'); out.flush(); continue
            txt = open(gomod, encoding='utf8', errors='replace').read()
            mt, mg = TOOLCHAIN.search(txt), GODIRECTIVE.search(txt)
            cell['ownToolchain'] = mt.group(1) if mt else None
            cell['ownGoDirective'] = mg.group(1) if mg else None
            a = run([GO, 'list', '-m', '-f', '{{.Path}} {{.Version}} {{.Indirect}}', 'all'], d)
            if a.returncode != 0:
                cell['status'] = 'list-failed'; cell['error'] = a.stderr[-400:]
                out.write(json.dumps(cell) + '\n'); out.flush(); continue
            mods, direct = [], []
            for ln in a.stdout.splitlines():
                p = ln.split()
                if not p: continue
                path = p[0]; ver = p[1] if len(p) > 1 else ''
                ind = (len(p) > 2 and p[2] == 'true')
                mods.append((path, ver))
                if not ind: direct.append(path)
            allpaths = [m[0] for m in mods]
            oa, ob, how = {}, {}, {}
            for p in set(allpaths):
                A, h = rule_a(p, owner_cache)
                oa[p] = A; how[p] = h; ob[p] = rule_b(p)
            tc, read = graph_toolchains(mods)
            cell.update({
                'status': 'ok',
                'modules': len(mods), 'direct': len(direct),
                'ownersA': sorted({oa[p] for p in allpaths}),
                'ownersB': sorted({ob[p] for p in allpaths}),
                'directOwnersA': sorted({oa[p] for p in direct}),
                'directOwnersB': sorted({ob[p] for p in direct}),
                'howCounts': {k: sum(1 for p in set(allpaths) if how[p] == k)
                              for k in ('forge', 'meta', 'unresolved', 'unreachable')},
                'graphToolchains': tc, 'modFilesRead': read,
                'ms': int((time.time() - t0) * 1000),
            })
        except subprocess.TimeoutExpired:
            cell['status'] = 'timeout'
        except Exception as e:
            cell['status'] = 'error'; cell['error'] = str(e)[:300]
        finally:
            subprocess.run(['rm', '-rf', d], check=False)
        out.write(json.dumps(cell) + '\n'); out.flush()
        json.dump(owner_cache, open(CACHE, 'w'))
        print(f"{cell['rank']:4d} {fn[:44]:<44} {cell.get('status'):<12} "
              f"mods={cell.get('modules','-')} A={len(cell.get('ownersA',[]))} "
              f"B={len(cell.get('ownersB',[]))} tc={len(cell.get('graphToolchains',{}))}",
              file=sys.stderr, flush=True)
