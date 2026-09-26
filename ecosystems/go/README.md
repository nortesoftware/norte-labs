# ecosystems/go — what one `go build` trusts, and what it runs

Go is the interesting case because it is supposed not to have npm's problem. `go get` and
`go build` run no package-authored install script, and `sum.golang.org` makes a fetched module's
bytes checkable against a transparency log. Both are true. This measures what is left once they
are true.

Prior art: [../../prior-art/go-supply-chain.md](../../prior-art/go-supply-chain.md). The owner
count is **not found** in all four modalities; the toolchain directive is documented and
unmeasured; cgo is measured over projects' own code and not over module graphs.

The owner derivation is the contribution and also the soft spot, so the rule is published in
full, with the code, and a second rule is reported beside it. **It was not published before the
measurement ran:** this file and [src/owner.py](src/owner.py) reached GitHub in the same push as
the results, on 2026-09-24. An earlier version of this paragraph said otherwise; the correction
and the push record are in [Corrections](#corrections).

## Frame and sample

Mirrors [../../measurements/instruction-gap/](../../measurements/instruction-gap/) so the two are
comparable.

The frame is every GitHub repository whose primary language is Go, with at least 100 stars,
pushed within the twelve months before the frame date, not a fork, enumerated in full through the
search API in star bands with no band at the API's 1,000-result cap; each band's total and
fetched count are in `results/frame-2026-09-23-bands.json`. The sample is the first 400
repositories in the order of `sha256(seed + fullName)` — a simple random order anyone can
reproduce from the committed frame file. The seed is recorded in `results/population-stats.json`
when the sample is drawn; the frame date is in the frame file's name.

Same caveat as instruction-gap: this is a population of popular open-source repositories, not of
the projects developers run `go build` in. Libraries and tools are over-represented against
applications and private code; the star threshold selects for maturity, the push window for
maintenance. Every rate is a rate over this frame. Go projects sharing an ecosystem share most of
a tree, so means carry a cluster-robust interval and the design effect is reported.

## Deriving an owner, which is a judgement

npm has publisher accounts; Go does not. A module is named by the path the go command uses to
fetch it, so "who published this" has to be derived, and a different derivation gives a different
number. Two rules are applied to every module and **both numbers are reported**.

**Rule A — repository owner.** Resolve the path the way `go get` does: request it with
`?go-get=1`, read `<meta name="go-import" content="prefix vcs repo-url">`, take the owner from
the repository URL. A path already on a known forge is taken directly. This answers *whose
repository does the go command clone* — the account that can change what the build gets.

**Rule B — declared prefix.** Purely syntactic, no network: host plus the first path element on a
known forge, host alone otherwise. This answers *how many distinct names did the build have to
trust*.

The two disagree wherever a vanity host fronts a forge account:

| module | Rule A | Rule B |
|---|---|---|
| `github.com/spf13/cobra` | `github.com/spf13` | `github.com/spf13` |
| `k8s.io/api` | `github.com/kubernetes` | `k8s.io` |
| `sigs.k8s.io/yaml` | `github.com/kubernetes-sigs` | `sigs.k8s.io` |
| `go.uber.org/zap` | `github.com/uber-go` | `go.uber.org` |
| `google.golang.org/grpc` | `github.com/grpc` | `google.golang.org` |
| `cloud.google.com/go/storage` | `github.com/googleapis` | `cloud.google.com` |
| `golang.org/x/net` | `go.googlesource.com` | `golang.org` |
| `gopkg.in/yaml.v3` | `gopkg.in` | `gopkg.in` |

Rule A merges: `k8s.io/api` and `github.com/kubernetes/klog` become one owner. Rule B keeps them
apart. A is the better answer to "who can change my build"; B is the better answer to "how many
names did I have to trust". Neither is the truth, which is the point of publishing both.

### Cases the rule names

- **Vanity hosts** are resolved by Rule A and kept whole by Rule B; that is the main source of
  divergence between the two counts.
- **`golang.org/x/*`** resolves to `go.googlesource.com`, Google's own Git host, not to GitHub.
  Under Rule A it is a host-level owner with no account element, which is what the meta tag says.
- **`gopkg.in`** serves a `go-import` tag pointing at itself, so both rules give `gopkg.in` even
  though the code is mirrored from GitHub accounts. Both counts therefore under-split it, and it
  is called out rather than special-cased.
- **`sigs.k8s.io` against `k8s.io`** are two different GitHub organisations under Rule A
  (`kubernetes-sigs`, `kubernetes`) and two different hosts under Rule B. They do not merge under
  either rule, which is correct — they are governed separately.
- **Monorepos** publishing many modules from one repository collapse to one owner under both
  rules. That is intended: one account controls them.
- **Forks** are owned by whoever owns the fork. A module path pointing at a fork is a dependency
  on that fork's owner, and counting it as the upstream owner would be wrong.
- **Modules whose owner cannot be determined today** — the host publishes no `go-import` tag, or
  cannot be reached — are kept rather than dropped: rule A counts each under the host in its
  path, and the resolutions are reported as their own two categories; a path whose every prefix
  already failed, met again, falls in the first. A module in a live build
  graph whose publisher is no longer resolvable is a result.
- The resolution is done **now**, not at the version's publication date. A path whose vanity
  domain has changed hands since resolves to today's controller. That is the right answer for
  "who can change my build today" and the wrong one for history, and it is not corrected.

## What else was measured

- **Q3, the toolchain directive.** The `go.mod` of every module in each graph but the project's
  own is read from the module cache for a `toolchain` line, 64,624 of the 64,690 across the 360
  graphs; the other 66 were not in the cache under their path and version. How many modules carry
  one and which versions they name are counted; how far ahead of the project's own `go` directive
  they reach was not computed. Under `GOTOOLCHAIN=auto`, the default, the go command acts only on
  the line in the `go.mod` or `go.work` of the directory it runs in, and downloads and executes the
  toolchain named there when it is newer than the installed one.
- **Q2's open slice, cgo.** How many of the packages a build compiles, as `go list -deps ./...`
  reports them, carry cgo or assembly files, and which modules the cgo packages come from —
  measured over the compiled packages rather than over a project's own source, which is what the
  published work covers, in a separate run over 20 projects. The flags those packages pass to the C compiler were
  not recorded.

## Running it

```sh
export GOMODCACHE=/var/tmp/nl-go/modcache        # not ~/go: the graph walk is large
export NL_GO=/path/to/go                         # the go that src/walk.py and src/cgo.py run; the walk's was go1.27.1 (Limits)
python3 src/frame.py  results/frame-<date>.ndjson.gz <date>
python3 src/sample.py results/frame-<date>.ndjson.gz results/population.ndjson --n 400 --seed '<seed>'
python3 src/walk.py   results/population.ndjson   results/cells.ndjson
python3 src/cgo.py    results/cells.ndjson        results/cgo.ndjson
python3 src/report.py results results/report.md
```

Temporary files under `/var/tmp/nl-go/`, deleted when the run is done.

## Limits

- Every graph was resolved by `go1.27.1`, recorded in each cell as `goVersion`, under
  `GOTOOLCHAIN=local`, so no sampled repository caused a toolchain download. `GOWORK=off` reads
  what the main module's own `go.mod` pulls, not a workspace the repository carries.
- Five of the 400 could not be resolved, for reasons belonging to the projects. Four pin
  Kubernetes staging repositories to `v0.0.0` through `replace` directives that do not resolve
  standalone. One (`nikivdev/go`) publishes a `replace` pointing at `/Users/nikiv/…`, a path on the
  author's own machine. Thirty-five have no `go.mod`.
- The cgo subsample is 20 projects; `src/cgo.py` draws up to 40 unless given `--n`, and stops
  before a project once the module cache passes `NL_CAP_GB`, 3.0 GB unless set. Neither the
  settings of the run nor what ended it at 20 is recorded. Its figures are magnitudes over 20 and
  not rates over the frame.

## Figures

| figure as published | where (file:line) | field or computation | source file | moment (as of when) |
|---|---|---|---|---|
| 11,015 in the frame | findings.md:3 | rows; the bands' `total`s sum to the same | `results/frame-2026-09-23.ndjson.gz`, `results/frame-2026-09-23-bands.json` | search of 2026-09-23, pushed since 2025-09-23 |
| 400 drawn | findings.md:3, 198; README.md:26 | the first 400 frame rows in the order of `sha256(seed + fullName)`, `seed` from `results/population-stats.json` | `results/population.ndjson` | search of 2026-09-23, pushed since 2025-09-23 |
| 360 resolved | findings.md:4, 22 | `status` ok | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| thirty-five with no `go.mod`; five not resolved, and why | findings.md:198; README.md:128-131 | `status` no-go.mod, list-failed; the reasons from `error` | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| `go1.27.1`, the toolchain the walk ran | README.md:125 | `goVersion`, the same in all 400 cells: `go version go1.27.1 linux/amd64` | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| npm: 892 lockfiles | findings.md:22 | rows | `../../measurements/instruction-gap/results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of that run |
| npm: 26 declared directly, median | findings.md:23 | `declared.direct` | `../../measurements/instruction-gap/results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of that run |
| npm: 604 resolved, median | findings.md:24 | `resolved.versions` | `../../measurements/instruction-gap/results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of that run |
| npm: 165 publishers, median | findings.md:25 | `publishers.total` | `../../measurements/instruction-gap/results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of that run |
| npm: 18 named in the manifest, median | findings.md:26; README.md:276 | `publishers.behindDirect` | `../../measurements/instruction-gap/results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of that run |
| npm: 87 % never named, median share | findings.md:27 | `publishers.notChosen / publishers.total`, over the 881 with a publisher | `../../measurements/instruction-gap/results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of that run |
| 9 modules declared directly, median | findings.md:23, 34; README.md:257 | `direct − 1` | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| 81 modules resolved, median | findings.md:24; README.md:207, 257 | `modules − 1` | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| 40 to 41 owners, median (rule A) | findings.md:25, 34, 57; README.md:207, 235, 259, 318 | `len(ownersA) − 1` to `len(ownersA)`; 0 where `modules` is 1; an owner is a forge account or, where the path has no account element, a host such as `go.googlesource.com` | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| 7 to 8 named in the manifest, median (rule A) | findings.md:26, 35, 58; README.md:259 | `len(directOwnersA) − 1` to `len(directOwnersA)`; 0 where `modules` is 1 | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| 79.5 to 82.8 % never named, median share (rule A) | findings.md:27, 59; README.md:282-284 | never = `ownersA` not in `directOwnersA`; `never / len(ownersA)` to `(never + 1) / len(ownersA)`, over the 341 with `modules` > 1 | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| 19 with no dependency | findings.md:32; README.md:255-256 | `modules` is 1 | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| about a fifth chosen | findings.md:36 | 100 − the share above: 17.2 to 20.5 % | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| rule B: 41 to 42 owners, 7 to 8 named, 80.0 to 83.1 % | findings.md:57-59 | as rule A, on `ownersB` and `directOwnersB` | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| 1.00× at the median, 1.03× at p90 | findings.md:63 | `len(ownersB) / len(ownersA)`, the project counted | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| 65,050 resolutions; 71.0, 28.8, 0.2 and 0.1 %; 34 | findings.md:67-73 | `howCounts` summed over the 360 cells: forge, meta, unresolved, unreachable; a path counts once per project; a path met again after every prefix of it failed counts as unresolved, so the unreachable count is a floor | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| withdrawn: about 20 of those 34 are projects' own paths | README.md:323-326 | the cells record `howCounts`, not the path behind each resolution | — | — |
| 64,624 of the 64,690 `go.mod` files read; the other 66 | README.md:97-98 | `modFilesRead` summed over the 360 resolved cells, against `modules − 1` summed; the difference | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| 12.8 % [9.7–16.6] of the 360 resolved, design effect 1.1 | findings.md:85-88; README.md:247, 303-304 | `ownToolchain` not null, 46 of the 360 resolved, Wilson 95 %; design effect: cluster-robust variance of the mean, with G/(G−1), over s²/n, clusters from `MARKERS` in `src/report.py` | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| 45.6 % of the 360, design effect 20.9 | findings.md:89-92; README.md:243-245, 303-304 | `graphToolchains` not empty, 164 of the 360; design effect as above | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| 74 of 94, 22 of 33, 25 of 52, none of 52 | findings.md:93-94 | the same by cluster: kubernetes, docker, gcp, none | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| median 0, p90 15, largest 64 | findings.md:95-96 | entries in `graphToolchains` per project | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| `go1.21.0` to `go1.27.1`; `go1.23.6` (177), `go1.24.1` (153), `go1.24.9` (142) | findings.md:97-98; README.md:271-272 | values of `graphToolchains` over all cells, one per project per module version; lowest and highest by version number, then the most frequent | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| six of the first eleven | findings.md:120 | `ownGoDirective` newer than 1.24.4, ranks 1 to 11 | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| 19 clusters, mean size 18.9 | findings.md:127 | first marker matched from `MARKERS` in `src/report.py`; 360 / 19 | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| Jaccard 0.230 against 0.103 | findings.md:128; README.md:280-281 | mean `ownersA` overlap over all 8,802 same-cluster and 55,818 cross-cluster pairs, the project counted | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| intra-class correlation 0.561, design effect 29.5 | findings.md:129-130 | one-way ANOVA intra-class correlation of `len(ownersA)` by cluster; design effect as for 12.8 %; the project counted | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| instruction-gap's 33.5 and 36.5 | findings.md:130; README.md:305-307 | DEFF column, the raw counts: resolved versions 33.5, distinct publishers 36.5 (41.1 is log10 publishers); computed without the G/(G−1) factor that Go's 29.5 carries, and Go's without it is 28.0 | `../../measurements/instruction-gap/results/report.md` | lockfiles at the 2026-09-17 heads; registry records of that run |
| kubernetes: 94, 0, 310, 134.5 to 135.5, 88.7 to 89.6 % | findings.md:134, 148 | per cluster: n; `modules` is 1; median `modules − 1`; owners and share as rule A, the share to one decimal | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| none: 52, 18, 2.5, 1 to 2, 0.0 to 50.0 % | findings.md:135, 149 | per cluster: n; `modules` is 1; median `modules − 1`; owners and share as rule A, the share to one decimal | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| gcp: 52, 0, 100.5, 48 to 49, 80.0 to 83.1 % | findings.md:136 | per cluster: n; `modules` is 1; median `modules − 1`; owners and share as rule A, the share to one decimal | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| testify: 41, 0, 18, 10 to 11, 62.5 to 71.4 % | findings.md:137; README.md:308-309 | per cluster: n; `modules` is 1; median `modules − 1`; owners and share as rule A, the share to one decimal | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| docker: 33, 0, 165, 97 to 98, 82.6 to 84.5 % | findings.md:138 | per cluster: n; `modules` is 1; median `modules − 1`; owners and share as rule A, the share to one decimal | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| aws: 17, 0, 135, 53 to 54, 75.0 to 78.6 % | findings.md:139 | per cluster: n; `modules` is 1; median `modules − 1`; owners and share as rule A, the share to one decimal | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| cobra: 17, 0, 38, 22 to 23, 71.4 to 80.4 % | findings.md:140 | per cluster: n; `modules` is 1; median `modules − 1`; owners and share as rule A, the share to one decimal | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| hashicorp: 11, 1, 54, 29 to 30, 73.5 to 75.9 % | findings.md:141 | per cluster: n; `modules` is 1; median `modules − 1`; owners and share as rule A, the share to one decimal | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| about one in ten named (Kubernetes) | findings.md:149 | 100 − the kubernetes share: 10.4 to 11.3 % | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| 20 projects (cgo), from the 341 resolved with a dependency | findings.md:156, 160; README.md:106, 132, 313-314 | rows; the first 20 of the 341 resolved cells with `modules` > 1 in the order of `sha256(seed + fullName)`, `seed` the default in `src/cgo.py` | `results/cgo.ndjson` | not recorded in the file |
| 323 packages [126.5 to 685.4]; 61 to 1,717 | findings.md:163; README.md:300-302 | `packages`: median, p10 and p90, interpolated; minimum and maximum | `results/cgo.ndjson` | not recorded in the file |
| 18 with cgo, 13 with only the standard library's, two with none | findings.md:166-168 | `cgoPackages` > 0; `cgoModules` is `["std"]`; `cgoPackages` is 0 | `results/cgo.ndjson` | not recorded in the file |
| 5 with cgo from a dependency; four by domain, the fifth `ebitengine/purego` | findings.md:169-173; README.md:310-312 | `cgoModules` holds a module other than `std` and the project's own: ten such modules across the five, `ebitengine/purego` the only one in `londek/ipadecrypt` | `results/cgo.ndjson` | not recorded in the file |
| cgo median 3, maximum 7; assembly median 37, maximum 63; about twelve times | findings.md:174-175 | `cgoPackages`, `asmPackages`; 37 / 3 = 12.3 | `results/cgo.ndjson` | not recorded in the file |
| first published: 10, 82, 41, 8 and 78 % | findings.md:39; README.md:207-208, 248, 257, 260 | the project counted: medians of `direct`, `modules`, `len(ownersA)`, `len(directOwnersA)`; the share with the 19 at 0 % (78.4) | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| first published: 41 and 42 | README.md:235 | medians of `len(ownersA)` and `len(ownersB)`, the project counted | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| first published: a tenth | findings.md:40; README.md:268-269 | 8 named of 41 is 19.5 % | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| first published: [40.5–50.7] | README.md:244 | Wilson 95 % on 164 of 360 | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| first published: 78 to 82 % | README.md:207, 260, 284 | the share bounds with the 19 at 0 %, each median `sorted(v)[round(0.5·(n−1))]`, as the report then printed them: 78.4 to 82.0 | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| first published: `go1.23.0` to `go1.26.5` | README.md:270 | lowest and highest of the twelve most frequent values | `results/cells.ndjson` | walk of 2026-09-23, 06:31–14:46 UTC (`startedAt`) |
| first published: libp2p 163, now 236 | README.md:279-280 | median `len(ownersA)` of the libp2p cluster, the project counted: `sorted(v)[round(0.5·(n−1))]` gives 163, interpolation 236 | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| first published: two owners, names both (no marker) | findings.md:151 | the project counted: median `len(ownersA)` 2, never-named 0 % | `results/cells.ndjson` | owners resolved during the walk of 2026-09-23 |
| first published: npm 21 | README.md:276 | no field in instruction-gap's cells has a median of 21 | — | — |
| withdrawn: pilot's 465 modules, 202 owners, 80 % | README.md:205-206, 327-329 | in no file in `results/`; `cli/cli` is in the frame, not in the sample | — | — |
| withdrawn: a 5 GB cap on the cgo subsample | README.md:291-293 | in no file; `src/cgo.py` stops on `NL_CAP_GB`, the size of the module cache, and the setting of the run is not recorded | — | — |

The push times, event ids and commit counts in *Corrections* are GitHub's record of pushes to
this repository, and the Chen et al. figures are that paper's; no file in `results/` carries them.

## Corrections

- The pilot that motivated this measurement used `cli/cli`, which resolves 465 modules and 202
  owners with 80 % never named. Those figures are a single hand-picked project and are not the
  result; the frame medians are 81 modules, 40 to 41 owners and 78 to 82 % (82, 41 and 78 % as
  first published, with the project counted). The pilot is cited nowhere in the
  findings.
- An earlier reading of the prior art attributed `#cgo` directive frequencies from Chen et al.
  (JSS 231, 2026) to a 920-project sample. The denominator is 101 manually labelled files inside
  the top 20 most-starred CGO repositories. The figures are not used in the findings, and the
  correction is recorded in [../../prior-art/go-supply-chain.md](../../prior-art/go-supply-chain.md).
- `golang.org/x/*` resolves under rule A to `go.googlesource.com`, a host with no account
  element, and not to `github.com/golang`. The rule states it; an earlier version of this entry
  said it was declared before the run, which the public record does not show (see the next
  entry).
- **Withdrawn: that the owner rule was published before the measurement ran.** This directory
  said so four times — "This file and src/owner.py were committed before the measurement ran",
  "the rule is published first", "Two rules were published with their code before the run", "Both
  rules were committed with their code before the run" — and headed a section "Cases declared in
  advance"; the repository README said "Owner derivation published with its code before the run".
  GitHub's record of pushes to this repository does not support it. No push reached GitHub
  between 2026-09-17 20:41:23 UTC and 2026-09-24 03:43:03 UTC. The commit carrying the rule and
  the one carrying the measurement arrived together, in one push of 39 commits at 2026-09-24
  05:01:13 UTC (push event 22028704157), as `aab01e7` and `bd01c5b`. A force-push at 05:47:14 UTC
  (push event 22012709753) replaced them with the commits now on `main`, `cf613ef` and `6fbb1ac`;
  the files in this directory are identical in both, tree for tree. The dates those commits
  carry, 2026-09-23 09:00 and 15:20 UTC, are author dates from local commits and are not times
  anything was published. The history was rewritten locally before that push, when all 39 commits
  received committer dates between 05:00:53 and 05:00:55 UTC, and again by the force-push; 20 of
  the 39 author dates are later than the push itself, the last of them 13:28 UTC. Whether the
  rule was fixed before the run cannot be shown from the public record, so it is no longer
  claimed. What can be checked is unchanged: the rule and its code are published, both rules are
  reported, and they give medians of 41 and 42 as first published, 40 to 41 and 41 to 42 without
  the project itself.
- findings.md §3, and the repository README, said that 45.6 % of projects carry at least one module
  whose manifest can make the go command download and run a different toolchain. They do not. The
  go command reads the `toolchain` line of the main module or workspace and of nothing else: the
  module reference says the directive "only has an effect when the module is the main module", and
  `modGoToolchain` in `cmd/go/internal/toolchain/select.go` reads only the `go.work` or `go.mod` of
  the working directory. In a dependency the line is ignored. The count stands and means less:
  45.6 % of projects have a module in the graph that carries the line. It was also given with a
  Wilson interval, [40.5–50.7], which treats the 360 projects as independent. They are not: with
  the ecosystem as the cluster the design effect is 20.9, and with 19 clusters no interval is worth
  quoting as a number, as the report already said of the owner counts. The figure that describes
  the mechanism is the 12.8 % whose own `go.mod` names a toolchain [9.7–16.6], design effect 1.1.
  The title of commit `6fbb1ac` carries the claim, and the headline figures 10, 41 and 8, and is
  left as it is. `src/report.py` now prints both design effects and the split by cluster.
- The headline counted each project as one of its own dependencies. `walk.py` reads `go list -m -f
  '{{.Path}} {{.Version}} {{.Indirect}}' all`, whose first line is the main module with an empty
  version, so the line splits into two fields, the second is taken as the version, and the module
  is taken as direct. Every project therefore counted itself among its modules and its direct
  modules, and its own owner among the owners it named. instruction-gap counts only registry
  packages, so npm's figures leave the project out. 19 projects with no dependency at all showed
  one module, one owner and none unnamed. Without the project, modules and direct are exact: median
  81 and 9, not 82 and 10. Owners and named are not, because the cells keep owner sets and not
  which module each owner came from, so whether the project's owner also owns another module in the
  graph is unknown. Taking each case at its extreme gives a median of 40 to 41 owners, 7 to 8
  named, and a never-named share of 78 to 82 %, where 78 % was published. The per-cluster figures
  move the same way, and "carries two and names both" for a project that matches no marker
  described the project itself. `src/report.py` prints the bounds under *Without the project
  itself*. Clusters are still assigned with the project's own path, which is why a project with no
  dependency sits in the hashicorp cluster. The same fault put the project's own path among the
  module resolutions: about 20 of the 34 that reached no host are projects' own paths, most with no
  dot in them, such as `gonet` or `ragflow`, not modules whose publisher cannot be identified.
  `walk.py` is left as it ran; a new run would read `{{.Main}}` and drop the main module.
- findings.md §1 said the developer chose "a tenth" of the parties; its own figures, 8 named of
  41, said about a fifth.
- findings.md §3 said the toolchain versions named run from `go1.23.0` to `go1.26.5`. Those were
  the extremes of the twelve most frequent. Across all graphs they run from `go1.21.0` to
  `go1.27.1`.

### 2026-09-25

- findings.md §1 gave npm's publishers named in the manifest as a median of 21. It is 18.
- Every quantile in results/report.md was an order statistic, `sorted(v)[round(f*(n-1))]`, which
  for an even count is one of the two middle values; instruction-gap's are interpolated, and so
  are these now. Per-cluster medians move most where a cluster is small: libp2p's owners from 163
  to 236. The within-cluster overlap was computed over one pair in three; over all pairs it is
  0.230.
- The never-named share counted the 19 projects with no dependency as 0 %. With no owner besides
  itself a project has no share, and instruction-gap leaves out projects with no publisher; left
  out here too, the median is 79.5 to 82.8 %, not 78 to 82 %.
- The toolchain lines were said to be compared with the project's own `go` directive, "how far
  ahead" they reach. That comparison was not computed; `ownGoDirective` is recorded, and `src/report.py` does not
  read it.
- Modules rule A could not resolve were said to be counted as their own category rather than
  attributed to their path's host. In the owner counts rule A counts each under the host in its
  path; the two categories are counts of resolutions.
- The cgo subsample was said to be bounded by a 5 GB cap on temporary files, and in findings.md
  by a disk budget for 360 projects. No file carries either; `src/cgo.py` stops on the size of
  the module cache, and the setting of the run is not recorded.
- The resolutions that reached no host were given as 34 (0.1 %), and those whose host published
  no tag as 0.2 %. Owner lookups are cached across the walk, and a path met again after every
  prefix of it failed is counted as finding no tag, so 34 is a floor and the 0.2 % holds some
  unreachable hosts. Owner counts do not move: both cases count under the path's host.
- findings.md said the graph walk fetched `go.mod` files only. It also cloned each sampled
  repository at depth 1.
- findings.md §5 gave the median of 323 packages a bracket of 61 to 1,717, where the findings
  bracket a median with p10 and p90. 61 and 1,717 are the minimum and maximum of `packages`; p10
  and p90 are 126.5 and 685.4.
- findings.md §3 gave 12.8 % and 45.6 % as shares of sampled projects. Both are over the 360
  resolved, 46 and 164 of them.
- findings.md §4 put the design effect of 29.5 in the same range as instruction-gap's 33 to 41
  for raw counts. instruction-gap's raw counts give 33.5 for resolved versions and 36.5 for
  distinct publishers; 41.1 is that of log10 publishers. 29.5 is below both.
- findings.md §4 gave the per-cluster never-named shares in whole numbers, rounded half to even,
  so testify's 62.5 read 62. They are given to one decimal.
- findings.md §5 said the dependencies that bring cgo are domain-specific and listed those of four
  of the five projects. `cgoModules` also holds `ebitengine/purego`, from `londek/ipadecrypt`, a
  library for calling C functions that belongs to no domain.
- findings.md §5 said the 20 were drawn from the resolved cells. They are the first 20, in the
  order of the seed in `src/cgo.py`, of the 341 resolved projects with at least one dependency.
- This README said the cgo slice finds which modules in the module graph contain cgo, and the flag
  values they pass. `src/cgo.py` counts the packages `go list -deps ./...` reports, in a separate
  run over 20 projects, and `results/cgo.ndjson` has no flag values.
- findings.md §1 called the forty or forty-one owners accounts. The count is of rule-A owners,
  which include hosts with no account element, such as `go.googlesource.com` and `gopkg.in`.
- That the standard library's cgo comes from `net` and `os/user` was withdrawn: no file in the
  repository produces it; `results/cgo.ndjson` records the module, `std`, and which of its
  packages carry cgo is unmeasured.
- That about 20 of the 34 resolutions that reached no host are the sampled projects' own module
  paths, and the rest modules whose publisher cannot be identified, was withdrawn: no file in the
  repository produces it; the cells record how each resolution ended and not its path, so how many
  of the 34 are projects' own paths is unmeasured.
- The `cli/cli` pilot's 465 modules, 202 owners and 80 % never named were withdrawn: no file in the
  repository produces them; `cli/cli` is in the frame and not in the sample, and its graph is
  unmeasured.
