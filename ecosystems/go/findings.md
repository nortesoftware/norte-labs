# ecosystems/go — findings

What one `go build` trusts, and what it runs. 400 repositories drawn from a frame of 11,015;
360 resolved. Method, frame and the owner derivation in [README.md](README.md); additional checks
and corrections in [verification.md](verification.md); generated figures in
[results/report.md](results/report.md).

Shares carry 95 % Wilson intervals; medians carry p10 and p90. Projects sharing an ecosystem
share most of a tree, so the medians and the per-cluster figures are the ones to quote and the
means are not 360 independent draws — see §4.

## 1. The trust surface, against npm

Go removed the two mechanisms npm is criticised for. `go get` and `go build` run no
package-authored install script. Every module fetched through the default proxy is checked
against a transparency log at `sum.golang.org`. Both hold, and this measurement did not find a
way around either.

The surface they were meant to reduce is not smaller.

| | npm ([instruction-gap](../../measurements/instruction-gap/)) | Go |
|---|---|---|
| basis | 892 lockfiles | 360 projects |
| declared directly, median | 26 dependencies | 10 modules |
| resolved, median | 604 versions | 82 modules |
| distinct owners, median | 165 publishers | **41 owners** |
| owners named in the manifest, median | 21 | **8** |
| **owners never named, median share** | **87 %** | **78 %** |

A median Go project declares ten modules and ends up trusting forty-one accounts, of which it
names eight. The other thirty-three arrived because something else asked for them. The figure is
lower than npm's and it is the same fact: the developer chose a tenth of the parties whose code
the build compiles.

What Go's two mechanisms buy is real and is a different thing. No install script means nothing
runs *while* fetching; the checksum database means a module cannot change under a pinned version
without detection. Neither reduces how many parties can put code into the build in the first
place. That is the distinction the comparison makes: Go fixed delivery and did not touch
composition.

## 2. The owner count does not depend on the derivation

Go has no publisher accounts, so an owner has to be derived from the module path, and the
derivation is a judgement. Two rules are published with their code
([src/owner.py](src/owner.py)) and both are reported:

| | rule A, repository owner | rule B, declared prefix |
|---|---|---|
| owners per project, median | 41 [p10 3, p90 215] | 42 [p10 3, p90 217] |
| named in the manifest, median | 8 | 8 |
| never named, median share | 78 % | 79 % |

Rule B counts **1.00×** the owners of rule A at the median, 1.03× at p90. The two rules disagree
only where a vanity host fronts a forge account, and that is a small enough part of a real graph
that the headline does not move. Had it moved, that would have been the finding.

Of 65,050 module-path resolutions under rule A: 71.0 % were already on a known forge and taken
directly, 28.8 % resolved through a `go-import` meta tag, 0.2 % reached a host that published no
tag, and **0.1 % reached no host at all**. That last category is modules present in live build
graphs whose publisher cannot be identified today. They are counted as their own category rather
than attributed to their path's host.

## 3. The toolchain directive

Since Go 1.21 a `go.mod` may name a toolchain newer than the installed one, and under
`GOTOOLCHAIN=auto` — the default — the go command downloads that toolchain and runs it. Nobody
had measured how far this reaches. It reaches a long way.

- **12.8 %** [9.7–16.6] of sampled projects name a toolchain in their own `go.mod`.
- **45.6 %** [40.5–50.7] have at least one module *somewhere in the graph* that names one.
- Per project the median is 0, p90 is 15, and the largest single graph carries **64** modules
  naming a toolchain.
- The versions named run from `go1.23.0` to `go1.26.5`; the most frequent are `go1.23.6` (177
  occurrences across all graphs), `go1.24.1` (153) and `go1.24.9` (142).

The mechanism is documented and the delivery is sound — the toolchain arrives as an ordinary
module, `golang.org/toolchain@v0.0.1-go<version>.<goos>-<goarch>`, through the proxy, covered by
the checksum database. What was not known is the prevalence, and it is that almost half of these
projects contain at least one module whose manifest can make the go command fetch and execute a
different compiler before anything is built.

Two things sharpen it. The directive was a code-execution primitive from the outset:
CVE-2023-39320 had it running binaries relative to the module root within weeks of Go 1.21
shipping. And in 2026 `golang/go#79070` found the go command accepting a checksum-database
response that succeeded with no entry as proof the module was fine — reported for this path:
"a malicious module proxy can serve altered versions of the Go toolchain".

This measurement also met the directive by accident. Six of the first eleven repositories
sampled required a toolchain newer than Debian 13's `go1.24.4`, which is why the instrument had
to be pinned to a deliberately chosen recent toolchain (verification.md). Projects raise the
requirement quickly, which is what makes the default load-bearing.

## 4. The design effect

Go projects in the same ecosystem resolve most of the same tree. With the ecosystem as the
cluster (19 clusters, mean size 18.9), the owner-set overlap (Jaccard) of two projects in the
same cluster is **0.225** against **0.103** across clusters, so the grouping is real rather than
imposed. The intra-class correlation of owners per project is **0.561** and the design effect
**29.5** — the same range as instruction-gap's 33 to 41 for raw counts.

| cluster | n | median modules | median owners A | median never-named |
|---|---|---|---|---|
| kubernetes | 94 | 309 | 134 | 89 % |
| none | 52 | 4 | 2 | 0 % |
| gcp | 52 | 102 | 50 | 81 % |
| testify | 41 | 19 | 11 | 62 % |
| docker | 33 | 166 | 98 | 83 % |
| aws | 17 | 136 | 54 | 75 % |
| cobra | 17 | 39 | 23 | 71 % |
| hashicorp | 11 | 55 | 30 | 72 % |

The spread is the point. A project that touches Kubernetes carries a median 134 owners and names
eleven per cent of them; a project that matches no marker carries two and names both. Quoting a
single mean over this would be quoting the Kubernetes cluster.

## 5. What the build compiles

Measured over a subsample of 20 projects drawn from the resolved cells under a second seed,
because this question needs module *source* rather than `go.mod` files and the source does not
fit the disk budget for 360 projects. The figures below are magnitudes over 20 projects, not
rates over the frame, and the denominator is the set `go list -deps ./...` reports — the packages
the build actually compiles, not the module graph.

A median project compiles **323 packages** [61 to 1,717]. Of the 20:

- **18 compile at least one cgo package**, which sounds like cgo is everywhere and is not what it
  means. In **13 of those 18 the only cgo is the standard library's** — `net` and `os/user` reach
  C through the system resolver. Two projects compile no cgo at all.
- **5 pull cgo from a dependency**, and the dependencies are domain-specific: embedded databases
  (`lmdb-go`, `pebble`, `go-sqlite3`), hardware tokens (`karalabe/hid`), cryptocurrency
  (`go-ethereum`, `breez-sdk-spark-go`), language runtimes (`wasmtime-go`, `v8go`), compression
  (`DataDog/zstd`).
- cgo packages per project: median 3, maximum 7. **Assembly packages: median 37, maximum 63** —
  about twelve times as many at the median.

The direction matters more than the magnitude. The published work on cgo measures how many Go
*projects* use it in their own source; over a build graph the picture is that cgo's reach is
mostly the standard library's, and where a dependency brings it, it brings it for a reason
legible from the dependency's name. The C toolchain is invoked on nearly every build; what
dependencies add to that is narrow and concentrated.

## 6. What this does not say

- The frame is popular open-source repositories on GitHub with at least 100 stars, pushed within
  twelve months, not forks. Libraries and tools are over-represented against applications and
  private code. Every rate is a rate over that frame, and instruction-gap's frame was built the
  same way so the two are comparable to each other and not to "all projects".
- Nothing was built and no module source was executed. The graph walk fetched `go.mod` files
  only. The cgo subsample ran `go list`, which compiles nothing.
- Owners are resolved **as of the run**, not as of each version's publication. A vanity domain
  that changed hands resolves to whoever holds it now. That is the right answer to "who can
  change my build today" and the wrong one to history.
- `go list -m all` is the module graph under minimal version selection, not the set of packages
  imported. A module in the graph whose packages nothing imports still appears. This overstates
  what is compiled and is the correct denominator for "whose code could enter the build" — §5
  uses the narrower one.
- Thirty-five of the 400 have no `go.mod` and five could not be resolved for reasons belonging to
  the projects rather than the instrument, recorded in verification.md.
