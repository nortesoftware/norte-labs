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
| declared directly, median | 26 dependencies | 9 modules |
| resolved, median | 604 versions | 81 modules |
| distinct owners, median | 165 publishers | **40 to 41 owners** |
| owners named in the manifest, median | 21 | **7 to 8** |
| **owners never named, median share** | **87 %** | **78 to 82 %** |

The Go column leaves out the project itself. Modules are exact; owners, named and the share are
bounds, because the cells do not record whether the project's own owner also owns another module
in the graph ([results/report.md](results/report.md), *Without the project itself*).

A median Go project declares nine modules and ends up trusting forty or forty-one accounts, of
which it names seven or eight. The rest arrived because something else asked for them. The share
is lower than npm's and it is the same fact: the developer chose about a fifth of the parties
whose code can enter the build.

This section first gave 10, 82, 41, 8 and 78 %. They were wrong: they counted the project as a
dependency of its own, which npm's figures do not. It also said the developer chose a tenth; those
figures said about a fifth. The correction is in [verification.md](verification.md#corrections).

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
| owners per project, median | 40 to 41 | 41 to 42 |
| named in the manifest, median | 7 to 8 | 7 to 8 |
| never named, median share | 78 to 82 % | 79 to 82 % |

Both columns leave out the project itself, as in §1.

Rule B counts **1.00×** the owners of rule A at the median, 1.03× at p90. The two rules disagree
only where a vanity host fronts a forge account, and that is a small enough part of a real graph
that the headline does not move. Had it moved, that would have been the finding.

Of 65,050 module-path resolutions under rule A: 71.0 % were already on a known forge and taken
directly, 28.8 % resolved through a `go-import` meta tag, 0.2 % reached a host that published no
tag, and **0.1 % reached no host at all**. About 20 of those 34 are the sampled projects' own
module paths, counted by the fault corrected in §1; the rest are modules present in live build
graphs whose publisher cannot be identified today. They are counted as their own category rather
than attributed to their path's host.

## 3. The toolchain directive

Since Go 1.21 a `go.mod` may name a toolchain newer than the installed one, and under
`GOTOOLCHAIN=auto` — the default — the go command downloads that toolchain and runs it. It does
this for the main module only, the one it is run in. The module reference says the directive
"only has an effect when the module is the main module and the default toolchain's version is
less than the suggested toolchain's version". In a dependency the line is ignored.

- **12.8 %** [9.7–16.6] of sampled projects name a toolchain in their own `go.mod`. Cloned and
  built under the default with an older Go, each of them makes the go command download and run
  the toolchain it names. Each project decides that for itself, and the clustering barely
  touches it (design effect 1.1).
- **45.6 %** have at least one module *somewhere in the graph* whose `go.mod` has a `toolchain`
  line. As a dependency that line does nothing, so this counts how common the line is among the
  modules these projects use, not projects it acts on. It rests on modules the projects of one
  ecosystem share (design effect 20.9), and with 19 clusters no interval around it is worth
  quoting as a number. By cluster: 74 of 94 Kubernetes projects, 22 of 33 Docker, 25 of 52 GCP,
  none of the 52 with no ecosystem marker.
- Per project the median is 0, p90 is 15, and the largest single graph carries **64** modules
  with the line.
- The versions named run from `go1.21.0` to `go1.27.1`; the most frequent are `go1.23.6` (177
  occurrences across all graphs), `go1.24.1` (153) and `go1.24.9` (142).

This section first said that 45.6 % of projects carry a module whose manifest can make the go
command fetch and run a different compiler. That was wrong; the correction is in
[verification.md](verification.md#corrections).

The mechanism is documented and the delivery is sound — the toolchain arrives as an ordinary
module, `golang.org/toolchain@v0.0.1-go<version>.<goos>-<goarch>`, through the proxy, covered by
the checksum database. In the main module a `go` line newer than the installed Go has the same
effect as a `toolchain` line; that was not tabulated here. A dependency reaches the mechanism by
that road, not by its `toolchain` line: when `go get` adds a module whose `go` line is newer than
the running toolchain, the go command switches to a newer one to finish, raises the main
module's `go` line and writes a `toolchain` line. How many projects that reaches was not
measured, because the walk read the `toolchain` lines of the graph and not its `go` lines.

Two things sharpen it. The directive was a code-execution primitive from the outset:
CVE-2023-39320 had it running binaries relative to the module root within weeks of Go 1.21
shipping. And in 2026 `golang/go#79070` found the go command accepting a checksum-database
response that succeeded with no entry as proof the module was fine — reported for this path, with
an untrusted module proxy: "a malicious module proxy can serve altered versions of the Go
toolchain".

This measurement also met the mechanism by accident, through `go` lines. Six of the first eleven
repositories sampled required a toolchain newer than Debian 13's `go1.24.4`, which is why the
instrument had to be pinned to a deliberately chosen recent toolchain (verification.md). Projects
raise the requirement quickly, which is what makes the default load-bearing.

## 4. The design effect

Go projects in the same ecosystem resolve most of the same tree. With the ecosystem as the
cluster (19 clusters, mean size 18.9), the owner-set overlap (Jaccard) of two projects in the
same cluster is **0.225** against **0.103** across clusters, so the grouping is real rather than
imposed. The intra-class correlation of owners per project is **0.561** and the design effect
**29.5** — the same range as instruction-gap's 33 to 41 for raw counts.

| cluster | n | no dependency | median modules | median owners A | median never-named |
|---|---|---|---|---|---|
| kubernetes | 94 | 0 | 308 | 133 to 134 | 89 % |
| none | 52 | 18 | 3 | 1 to 2 | 0 to 33 % |
| gcp | 52 | 0 | 101 | 49 to 50 | 81 to 83 % |
| testify | 41 | 0 | 18 | 10 to 11 | 62 to 71 % |
| docker | 33 | 0 | 165 | 97 to 98 | 83 to 85 % |
| aws | 17 | 0 | 135 | 53 to 54 | 75 to 79 % |
| cobra | 17 | 0 | 38 | 22 to 23 | 71 to 80 % |
| hashicorp | 11 | 1 | 54 | 29 to 30 | 72 to 76 % |

Without the project itself, as in §1. The intra-class correlation and the design effect above
were computed with it, which moves each count by at most one. Clusters are still assigned with
the project's own path, which is why a project with no dependency sits in the hashicorp
cluster.

The spread is the point. A project in the Kubernetes cluster carries a median 133 or 134 owners
and names about one in ten; of the 52 that match no marker, 18 have no dependency at all.
Quoting a single mean over this would mostly be quoting the Kubernetes cluster. This paragraph
first said a project matching no marker carries two owners and names both; one of the two was
the project itself.

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
