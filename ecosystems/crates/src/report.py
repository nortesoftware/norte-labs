#!/usr/bin/env python3
"""Generated report for ecosystems/crates.

usage: report.py <results-dir> <out.md>

Reads population.ndjson and cells.ndjson. Counts carry the median and the middle
half, as instruction-gap's did; shares carry p10 and p90; rates a Wilson interval.
"""
import collections, itertools, json, math, os, sys

RES, OUT = sys.argv[1], sys.argv[2]
pop = [json.loads(l) for l in open(os.path.join(RES, 'population.ndjson')) if l.strip()]
cells = [json.loads(l) for l in open(os.path.join(RES, 'cells.ndjson')) if l.strip()]
AUTOMATION_NOTE = "instruction-gap's pattern, unchanged"

def wilson(k, n):
    if n == 0: return '—'
    z = 1.959964; p = k / n
    den = 1 + z*z/n; c = p + z*z/(2*n)
    h = z * math.sqrt(p*(1-p)/n + z*z/(4*n*n))
    return f'{k}/{n} = {100*p:.1f} % [{100*(c-h)/den:.1f}–{100*(c+h)/den:.1f}]'

class Q(float):
    """A quantile kept exact for every use and rounded once, to one decimal, where it is printed
    without a format of its own."""
    def __str__(self): return str(int(self)) if self.is_integer() else f'{float(self):.1f}'
    __repr__ = __str__

def q(v, f):
    # Linear interpolation between order statistics, as instruction-gap's report computes
    # them; an order statistic alone is one of the two middle values when n is even.
    if not v: return Q(0)
    s = sorted(v); x = f*(len(s)-1); i = int(x)
    val = s[i] if i + 1 >= len(s) else s[i] + (s[i+1] - s[i])*(x - i)
    return Q(val)
med = lambda v: q(v, 0.5)
mid = lambda v: f'{med(v)} [{q(v, .25)}–{q(v, .75)}]'
pct = lambda v: f'{med(v):.1f} % [p10 {q(v, .1):.1f} %, p90 {q(v, .9):.1f} %]'

def icc(vals, clusters):
    g = collections.defaultdict(list)
    for v, c in zip(vals, clusters): g[c].append(v)
    n = sum(len(v) for v in g.values()); G = len(g)
    if G < 2 or n <= G: return 0.0, G
    grand = sum(sum(v) for v in g.values())/n
    msb = sum(len(v)*(sum(v)/len(v) - grand)**2 for v in g.values())/(G-1)
    msw = sum(sum((x - sum(v)/len(v))**2 for x in v) for v in g.values())/(n-G)
    k = (n - sum(len(v)**2 for v in g.values())/n)/(G-1)
    den = msb + (k-1)*msw
    return (max(0.0, (msb-msw)/den) if den else 0.0), G

def deff(vals, clusters):
    n = len(vals); mean = sum(vals)/n
    iid = sum((v-mean)**2 for v in vals)/(n*(n-1))
    g = collections.defaultdict(list)
    for v, c in zip(vals, clusters): g[c].append(v)
    G = len(g)
    cl = sum((sum(v-mean for v in vs))**2 for vs in g.values()) * G/((G-1)*n*n)
    return mean, (cl/iid if iid else 1.0)

def jaccard(cells, cl):
    sets = [set(c['publishers']['ids']) for c in cells]
    same, diff = [], []
    for i, j in itertools.combinations(range(len(cells)), 2):
        u = len(sets[i] | sets[j])
        if u: (same if cl[i] == cl[j] else diff).append(len(sets[i] & sets[j])/u)
    f = lambda x: sum(x)/len(x) if x else 0.0
    return f(same), f(diff)

L = ['# ecosystems/crates — generated report\n']
st = collections.Counter(r['status'] for r in pop)
L.append('## Sample\n')
L.append(f'- drawn {len(pop)}; ' + '; '.join(f'{k} {v}' for k, v in st.most_common()))
rust = [r for r in pop if r['status'] in ('ok', 'no-Cargo.lock', 'unreadable')]
L.append(f'- with a root Cargo.toml, commit a root Cargo.lock: {wilson(sum(r["status"] != "no-Cargo.lock" for r in rust), len(rust))}')
L.append(f'- cells computed: {len(cells)}\n')

pub = [c['publishers']['total'] for c in cells]
non_auto = [c['publishers']['total'] - c['publishers']['automation'] for c in cells]
named = [c['publishers']['behindDeclared'] for c in cells]
never = [100*(c['publishers']['total']-c['publishers']['behindDeclared'])/c['publishers']['total']
         for c in cells if c['publishers']['total']]
own = [c['owners']['total'] for c in cells]
L.append('## Per project\n')
L.append(f'- declared: median {mid([c["declared"] for c in cells])}')
L.append(f'- resolved crates.io versions: median {mid([c["resolved"] for c in cells])}')
L.append(f'- distinct publishers: median {mid(pub)}; users {mid([c["publishers"]["users"] for c in cells])}; '
         f'trusted-publishing repositories {mid([c["publishers"]["trustedPublishing"] for c in cells])}')
L.append(f'- without automation accounts and repositories ({AUTOMATION_NOTE}): median {mid(non_auto)}')
L.append(f'- publishers behind a declared crate: median {mid(named)}')
L.append(f'- publishers behind no declared crate, share of the project\'s publishers: {pct(never)} '
         f'(over the {len(never)} projects with at least one publisher)')
L.append(f'- owners with permission to publish (users and teams): median {mid(own)}; '
         f'teams {mid([c["owners"]["teams"] for c in cells])}')
unk = sum(c['lookup']['unknownPublisher'] for c in cells); miss = sum(c['lookup']['missing'] for c in cells)
tot = sum(c['resolved'] for c in cells)
L.append(f'- resolved versions with no recorded publisher: {unk} of {tot}; not on crates.io any more: {miss}')
other = collections.Counter()
for c in cells:
    for k, v in (c['otherSources'] or {}).items(): other[k] += v
L.append(f'- other sources, versions: ' + ('; '.join(f'{k} {v}' for k, v in other.most_common()) or 'none'))
L.append(f'- projects with no crates.io dependency: {sum(c["resolved"] == 0 for c in cells)}\n')

cl = [c['cluster'] for c in cells]
i, G = icc([float(x) for x in pub], cl)
mean, d = deff([float(x) for x in pub], cl)
# With few clusters the sandwich ratio moves with any one large cluster; the range is
# printed beside it rather than the ratio alone.
big = [k for k, _ in collections.Counter(cl).most_common(5)]
loo = [deff([float(x) for x, c in zip(pub, cl) if c != k], [c for c in cl if c != k])[1] for k in big]
js, jd = jaccard(cells, cl)
L.append('## The design effect\n')
L.append(f'- clusters: {G}. Publisher-set overlap (Jaccard) within a cluster {js:.3f}, across {jd:.3f}.')
L.append(f'- publishers per project: intra-class correlation {i:.3f}, design effect {d:.1f} (mean {mean:.1f}), '
         f'a ratio of the cluster-robust to the independent variance of the mean over {G} clusters; '
         f'leaving out one of the five largest clusters gives {min(loo):.1f} to {max(loo):.1f}.')
L.append('- With this many clusters the medians and the per-cluster figures are the citable ones.\n')
L.append('| cluster | n | median declared | median publishers | median never named |')
L.append('|---|---|---|---|---|')
by = collections.defaultdict(list)
for c in cells: by[c['cluster']].append(c)
for k, cs in sorted(by.items(), key=lambda kv: (-len(kv[1]), kv[0])):
    nv = [100*(c['publishers']['total']-c['publishers']['behindDeclared'])/c['publishers']['total'] for c in cs if c['publishers']['total']]
    L.append(f'| {k} | {len(cs)} | {med([c["declared"] for c in cs])} | {med([c["publishers"]["total"] for c in cs])} | '
             f'{med(nv):.0f} % |')
L.append('')
open(OUT, 'w').write('\n'.join(L) + '\n')
print('wrote', OUT)
