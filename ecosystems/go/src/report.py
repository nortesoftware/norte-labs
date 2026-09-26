#!/usr/bin/env python3
"""Aggregate cells into results/report.md.

Shares carry 95 % Wilson intervals. Medians carry p10 and p90. Projects sharing an
ecosystem share most of a tree, so means carry a cluster-robust interval with the
ecosystem as the cluster and the design effect is reported, as in instruction-gap.
"""
import json, math, os, sys, collections

RES, OUT = sys.argv[1], sys.argv[2]
cells = [json.loads(l) for l in open(os.path.join(RES, 'cells.ndjson')) if l.strip()]
ok = [c for c in cells if c.get('status') == 'ok']

def wilson(k, n):
    if n == 0: return '—'
    z = 1.959964; p = k / n
    den = 1 + z*z/n; c = p + z*z/(2*n)
    h = z * math.sqrt(p*(1-p)/n + z*z/(4*n*n))
    return f'{100*p:.1f} % [{100*(c-h)/den:.1f}–{100*(c+h)/den:.1f}]'

class Q(float):
    """A quantile kept exact for every use and rounded once, to one decimal, where it is printed
    without a format of its own."""
    def __str__(self): return str(int(self)) if self.is_integer() else f'{float(self):.1f}'
    __repr__ = __str__

def q(v, f):
    # Linear interpolation between order statistics, as instruction-gap computes them; an
    # order statistic alone is one of the two middle values when n is even.
    if not v: return Q(0)
    s = sorted(v); x = f*(len(s)-1); i = int(x)
    val = s[i] if i + 1 >= len(s) else s[i] + (s[i+1] - s[i])*(x - i)
    return Q(val)

def med(v): return q(v, 0.5)

# Cluster: the ecosystem whose modules dominate the graph. Projects in the same
# cluster share most of a tree, which is what breaks independence.
# Ordered by specificity; a project takes the first marker its graph matches.
# More clusters than the obvious six, because cluster-robust inference with a
# handful of groups is not worth quoting -- instruction-gap had 21.
MARKERS = [
    ('cosmos', ('github.com/cosmos', 'github.com/tendermint')),
    ('ethereum', ('github.com/ethereum',)),
    ('libp2p', ('github.com/libp2p',)),
    ('kubernetes', ('k8s.io', 'sigs.k8s.io')),
    ('docker', ('github.com/docker', 'github.com/moby', 'github.com/containerd')),
    ('aws', ('github.com/aws',)),
    ('azure', ('github.com/Azure',)),
    ('gcp', ('cloud.google.com', 'github.com/googleapis')),
    ('hashicorp', ('github.com/hashicorp',)),
    ('etcd', ('go.etcd.io',)),
    ('opentelemetry', ('go.opentelemetry.io',)),
    ('prometheus', ('github.com/prometheus',)),
    ('grpc', ('google.golang.org/grpc', 'github.com/grpc')),
    ('charm', ('github.com/charmbracelet',)),
    ('gin', ('github.com/gin-gonic',)),
    ('echo', ('github.com/labstack',)),
    ('fiber', ('github.com/gofiber',)),
    ('gorm', ('gorm.io',)),
    ('cobra', ('github.com/spf13',)),
    ('testify', ('github.com/stretchr',)),
]

def cluster(c):
    b = set(c.get('ownersB', []))
    a = set(c.get('ownersA', []))
    for name, marks in MARKERS:
        if any(m in b or m in a or any(x.startswith(m) for x in b) for m in marks):
            return name
    return 'none'

def icc(vals, clusters):
    """One-way random-effects intra-class correlation, the quantity behind the
    design effect: how much of the variance sits between clusters."""
    g = collections.defaultdict(list)
    for v, c in zip(vals, clusters): g[c].append(v)
    g = {k: v for k, v in g.items() if v}
    n = sum(len(v) for v in g.values()); G = len(g)
    if G < 2 or n <= G: return 0.0, G, 0.0
    grand = sum(sum(v) for v in g.values())/n
    msb = sum(len(v)*(sum(v)/len(v) - grand)**2 for v in g.values())/(G-1)
    msw = sum(sum((x - sum(v)/len(v))**2 for x in v) for v in g.values())/(n-G)
    k = (n - sum(len(v)**2 for v in g.values())/n)/(G-1)
    if msb + (k-1)*msw == 0: return 0.0, G, sum(len(v) for v in g.values())/G
    return max(0.0, (msb-msw)/(msb+(k-1)*msw)), G, n/G


def jaccard_overlap(ok, cl):
    """Mean owner-set overlap for pairs in the same cluster against pairs across,
    which is what makes the clustering real rather than assumed."""
    import itertools, random
    sets = [set(c['ownersA']) for c in ok]
    same, diff = [], []
    idx = list(range(len(ok)))
    for i, j in itertools.combinations(idx, 2):
        u = len(sets[i] | sets[j])
        if not u: continue
        v = len(sets[i] & sets[j])/u
        (same if cl[i] == cl[j] else diff).append(v)
    f = lambda x: sum(x)/len(x) if x else 0.0
    return f(same), f(diff), len(same), len(diff)


def cluster_robust_mean(vals, clusters):
    """Mean with a cluster-robust SE, and the design effect against the iid SE."""
    n = len(vals)
    if n < 2: return (vals[0] if vals else 0), 0, 1.0
    mean = sum(vals)/n
    iid_var = sum((v-mean)**2 for v in vals)/(n*(n-1))
    g = collections.defaultdict(list)
    for v, cl in zip(vals, clusters): g[cl].append(v)
    G = len(g)
    if G < 2: return mean, math.sqrt(iid_var), 1.0
    s = sum((sum(v-mean for v in vs))**2 for vs in g.values())
    cl_var = s * G/((G-1)*n*n)
    deff = (cl_var/iid_var) if iid_var > 0 else 1.0
    return mean, math.sqrt(cl_var), deff

L = []
L.append('# ecosystems/go — generated report\n')
L.append(f'{len(cells)} cells, {len(ok)} resolved. Shares are n/N with 95 % Wilson intervals, and the '
         'toolchain shares their design effect beside them; '
         'medians carry p10 and p90; means carry a cluster-robust interval with the ecosystem '
         'as the cluster, and the design effect against the iid interval.\n')
st = collections.Counter(c.get('status') for c in cells)
L.append('## Cells\n')
L.append('- status: ' + '; '.join(f'{k} {v}' for k, v in st.most_common()) + '\n')

if ok:
    mods = [c['modules'] for c in ok]; direct = [c['direct'] for c in ok]
    oa = [len(c['ownersA']) for c in ok]; ob = [len(c['ownersB']) for c in ok]
    doa = [len(c['directOwnersA']) for c in ok]; dob = [len(c['directOwnersB']) for c in ok]
    neverA = [len(set(c['ownersA']) - set(c['directOwnersA'])) for c in ok]
    neverB = [len(set(c['ownersB']) - set(c['directOwnersB'])) for c in ok]
    fracA = [100*a/b if b else 0 for a, b in zip(neverA, oa)]
    fracB = [100*a/b if b else 0 for a, b in zip(neverB, ob)]
    cl = [cluster(c) for c in ok]

    L.append('## The graph, the project counted as its own dependency\n')
    L.append(f'- modules resolved: median {med(mods)} [p10 {q(mods,.1)}, p90 {q(mods,.9)}]; '
             f'direct: median {med(direct)} [p10 {q(direct,.1)}, p90 {q(direct,.9)}]')
    L.append('')
    L.append('## Owners, both rules, the project counted as its own dependency\n')
    for nm, tot, dirn, nev, fr in (('A (repository owner)', oa, doa, neverA, fracA),
                                   ('B (declared prefix)', ob, dob, neverB, fracB)):
        m, se, deff = cluster_robust_mean([float(x) for x in tot], cl)
        L.append(f'- **Rule {nm}** — owners per project: median {med(tot)} '
                 f'[p10 {q(tot,.1)}, p90 {q(tot,.9)}]; mean {m:.1f} ± {1.96*se:.1f} '
                 f'(cluster-robust, design effect {deff:.2f})')
        L.append(f'  - named in the project\'s own go.mod: median {med(dirn)} '
                 f'[p10 {q(dirn,.1)}, p90 {q(dirn,.9)}]')
        L.append(f'  - never named: median {med(nev)} [p10 {q(nev,.1)}, p90 {q(nev,.9)}], '
                 f'median share {med(fr):.0f} % [p10 {q(fr,.1):.0f} %, p90 {q(fr,.9):.0f} %]')
    ratio = [b/a if a else 0 for a, b in zip(oa, ob)]
    L.append('')
    L.append(f'- **Sensitivity**: rule B counts {med(ratio):.2f}x the owners of rule A at the '
             f'median [p10 {q(ratio, 0.1):.2f}, p90 {q(ratio,.9):.2f}]. '
             'The gap is vanity hosts fronting forge accounts.')
    how = collections.Counter()
    for c in ok:
        for k, v in (c.get('howCounts') or {}).items(): how[k] += v
    tot_how = sum(how.values()) or 1
    L.append(f'- rule A resolution: ' + '; '.join(
        f'{k} {v} ({100*v/tot_how:.1f} %)' for k, v in how.most_common()))

    L.append('')
    # walk.py reads `go list -m all`, whose first line is the main module with no version; it
    # was parsed as a direct dependency, so the project counts as one of its own modules and its
    # owner as an owner it named. npm's count leaves the project out. Modules and direct are
    # exact without it. Owners and named are not: the cells keep owner sets, not which module
    # each owner came from, so whether the project's owner also owns another module is unknown.
    # It owns nothing else (drop it from both), another direct module (keep both), or only
    # indirect ones (keep it as an owner, drop it from named). That bounds each project.
    solo = [c['modules'] == 1 for c in ok]
    L.append('## Without the project itself\n')
    L.append('The main module was counted as a direct dependency (README.md, Corrections). Modules and '
             'direct are exact without it; owners, named and the never-named share are bounded, '
             'because the cells do not record whether the project\'s owner also owns another '
             'module in the graph.\n')
    m1 = [x - 1 for x in mods]; d1 = [x - 1 for x in direct]
    L.append(f'- modules resolved: median {med(m1)} [p10 {q(m1,.1)}, p90 {q(m1,.9)}]; direct: '
             f'median {med(d1)} [p10 {q(d1,.1)}, p90 {q(d1,.9)}]; {sum(solo)} projects have no '
             'dependency at all')
    for nm, tot, dirn, nev in (('A', oa, doa, neverA), ('B', ob, dob, neverB)):
        lo_o = [0 if s else x - 1 for x, s in zip(tot, solo)]
        hi_o = [0 if s else x for x, s in zip(tot, solo)]
        lo_d = [0 if s else x - 1 for x, s in zip(dirn, solo)]
        hi_d = [0 if s else x for x, s in zip(dirn, solo)]
        # A project with no dependency has no owner besides itself, so no share: it is left out
        # of the share, as instruction-gap leaves out a project with no publisher.
        lo_f = [100*n/o for n, o, s in zip(nev, tot, solo) if not s]
        hi_f = [100*(n+1)/o for n, o, s in zip(nev, tot, solo) if not s]
        L.append(f'- rule {nm}: owners median {med(lo_o)} to {med(hi_o)}; named median {med(lo_d)} '
                 f'to {med(hi_d)}; never-named median share {med(lo_f):.1f} % to {med(hi_f):.1f} % '
                 f'[p10 {q(lo_f,.1):.1f}–{q(hi_f,.1):.1f} %, p90 {q(lo_f,.9):.1f}–{q(hi_f,.9):.1f} %]')
    L.append('')
    L.append('| cluster | n | no dependency | median owners A | median never-named A |')
    L.append('|---|---|---|---|---|')
    bc = collections.defaultdict(list)
    for c, k, s in zip(ok, cl, solo): bc[k].append((c, s))
    for k, cs in sorted(bc.items(), key=lambda kv: (-len(kv[1]), kv[0]))[:8]:
        a = [len(c['ownersA']) for c, s in cs]
        n = [len(set(c['ownersA']) - set(c['directOwnersA'])) for c, s in cs]
        lo = [100*x/o for x, o, (c, s) in zip(n, a, cs) if not s]
        hi = [100*(x+1)/o for x, o, (c, s) in zip(n, a, cs) if not s]
        L.append(f'| {k} | {len(cs)} | {sum(s for c, s in cs)} | {med([0 if s else x-1 for x, (c, s) in zip(a, cs)])} to {med([0 if s else x for x, (c, s) in zip(a, cs)])} '
                 f'| {med(lo):.1f} to {med(hi):.1f} % |')
    L.append('')
    i_a, G, avg = icc([float(x) for x in oa], cl)
    js, jd, ns, nd = jaccard_overlap(ok, cl)
    L.append('## The design effect\n')
    L.append(f'- clusters: {G}, mean size {avg:.1f}. Owner-set overlap (Jaccard) for two projects '
             f'in the same cluster is {js:.3f} against {jd:.3f} across clusters '
             f'({ns} same-cluster pairs, {nd} across), which is what makes the grouping real '
             'rather than assumed.')
    L.append(f'- intra-class correlation of owners per project: {i_a:.3f}')
    L.append('- With this many clusters the cluster-robust interval is not worth quoting as a '
             'number: the medians and the per-cluster figures below are the citable ones, and '
             'the means are not independent draws.')
    L.append('')
    L.append('## By cluster, the project counted as its own dependency\n')
    bycl = collections.defaultdict(list)
    for c, k in zip(ok, cl): bycl[k].append(c)
    L.append('| cluster | n | median modules | median owners A | median owners B | median never-named A |')
    L.append('|---|---|---|---|---|---|')
    for k, cs in sorted(bycl.items(), key=lambda kv: -len(kv[1])):
        mm = [c['modules'] for c in cs]; a = [len(c['ownersA']) for c in cs]
        b = [len(c['ownersB']) for c in cs]
        f = [100*len(set(c['ownersA'])-set(c['directOwnersA']))/max(1,len(c['ownersA'])) for c in cs]
        L.append(f'| {k} | {len(cs)} | {med(mm)} | {med(a)} | {med(b)} | {med(f):.0f} % |')

    L.append('')
    L.append('## The toolchain directive\n')
    ownTc = [c for c in ok if c.get('ownToolchain')]
    anyTc = [c for c in ok if c.get('graphToolchains')]
    L.append(f'- resolved projects whose own go.mod names a toolchain: {wilson(len(ownTc), len(ok))}')
    L.append(f'- projects with at least one module in the graph naming a toolchain: '
             f'{wilson(len(anyTc), len(ok))}')
    # a share is the mean of a 0/1 indicator; projects in one ecosystem share the modules that
    # carry the directive, so the Wilson interval above treats as independent what is not. With
    # 19 clusters the cluster-robust interval is not worth quoting, so only the design effect is
    for label, have in (('own go.mod', ownTc), ('a module in the graph', anyTc)):
        ids = {id(c) for c in have}
        m, se, deff = cluster_robust_mean([1.0 if id(c) in ids else 0.0 for c in ok], cl)
        L.append(f'  - {label}: design effect {deff:.1f}')
    by = collections.defaultdict(lambda: [0, 0])
    for c, k in zip(ok, cl):
        by[k][0] += 1; by[k][1] += bool(c.get('graphToolchains'))
    L.append('- a module in the graph naming a toolchain, by cluster: ' + '; '.join(
        f'{k} {v[1]}/{v[0]}' for k, v in sorted(by.items(), key=lambda kv: (-kv[1][0], kv[0]))))
    ntc = [len(c.get('graphToolchains') or {}) for c in ok]
    L.append(f'- modules naming a toolchain per project: median {med(ntc)} '
             f'[p90 {q(ntc,.9)}, max {max(ntc) if ntc else 0}]')
    vers = collections.Counter()
    for c in ok:
        for v in (c.get('graphToolchains') or {}).values(): vers[v] += 1
    if vers:
        L.append('- toolchain versions named across all graphs: ' +
                 '; '.join(f'{v} ({n})' for v, n in vers.most_common(12)))

open(OUT, 'w').write('\n'.join(L) + '\n')
print(f'wrote {OUT}')
