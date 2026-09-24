# Additional checks and corrections

## The frame is a complete enumeration, not a search result

The GitHub search API caps any query at 1,000 results, so a frame built from one query is a
sample of the search ranking rather than an enumeration. This frame was built in 34 star bands
and the band records are kept in `results/frame-2026-09-23-bands.json`. Three checks:

- no band returned a `total_count` above 1,000;
- no band returned fewer items than its `total_count` — `fetched == total` in all 34;
- the band totals sum to 11,015, which is exactly the number of distinct repositories written,
  so the bands neither overlap nor leave gaps.

## The two owner rules against each other

The headline depends on deriving an owner from a module path, which Go does not do for you. Both
rules are published with their code; that they were fixed before the run is not something the
public record shows (see Corrections). Over 360 projects the medians are 41 and 42,
the ratio is 1.00 at the median and 1.03 at p90. The derivation is therefore not load-bearing for
the figure. This was checked because it could have gone the other way, and if it had, the
sensitivity would have been the result rather than a footnote.

## Modules whose owner cannot be resolved

Of 65,050 resolutions, 120 reached a host that answers but publishes no `go-import` tag and 34
reached no host at all. Both are reported as their own categories. Attributing them to the host
in their path would have inflated the owner count with names nobody controls, and dropping them
would have hidden that a live build graph contains modules whose publisher cannot be identified.

## Three instrument faults, all found during the run

Each had the same signature — a silent, systematic exclusion that would have biased the result
in a direction that flattered it — and each is recorded because the same signature is what this
repository audits in other people's tools.

**1. `GOTOOLCHAIN=local` against a distribution toolchain.** The walk sets `GOTOOLCHAIN=local` so
that the instrument never downloads a toolchain because a sampled repository asked for one: which
repositories ask is a result. But under `local`, `go list` refuses outright when a `go.mod`
requires a version newer than the running toolchain, and Debian 13 packages `go1.24.4`. Six of
the first eleven repositories sampled required `go1.25` or `go1.26` and failed. Keeping this
would have dropped the best-maintained projects and shrunk every graph figure. Fixed by choosing
a recent toolchain once, in advance — `go1.27.1`, recorded in each cell as `goVersion` — and
keeping `GOTOOLCHAIN=local`. The principle is unchanged: no sampled repository causes a toolchain
fetch.

**2. `-mod=mod` against repositories carrying a `go.work`.** Workspace mode rejects `-mod=mod`,
so every monorepo using a Go workspace failed with `list-failed`. Eleven of the fifteen initial
failures were this. That is a class exclusion, and the class is large projects. Fixed with
`GOWORK=off`, which also asks the right question here — what the main module's own manifest
pulls. The fifteen were re-run; five still fail, for reasons belonging to the projects: four pin
Kubernetes staging repositories to `v0.0.0` through `replace` directives that do not resolve
standalone, and one (`nikivdev/go`) publishes a `replace` pointing at `/Users/nikiv/…`, a path on
the author's own machine.

**3. A `go list` template that failed silently, and reported `ok`.** The cgo subsample used
`-f '{{.ImportPath}}\t{{.Module.Path}}\t…'`. Standard-library packages have no `.Module`, so the
template died with `nil pointer evaluating *modinfo.ModulePublic.Path` on the first such package
and emitted nothing. The surrounding code counted zero packages, zero cgo, and wrote
`status: ok`. Eight cells were recorded as successful measurements of nothing before the pattern
— every cell reporting `pkgs=0` — gave it away. Fixed with
`{{if .Module}}{{.Module.Path}}{{else}}std{{end}}` and the affected cells discarded and re-run.

This last one is the failure mode this repository reports in other people's tools: a control
that cannot see anything, reporting that it saw nothing wrong. It is recorded here in the same
terms.

## The disk budget was exceeded and the run was changed for it

Temporary files are capped at 5 GB by this repository's own rule. The cgo subsample needs module
*source*, not `go.mod` files, and reached 5.2 GB before the cap in its own script stopped it. The
cache was purged and the subsample re-run with the cache emptied between projects, which holds
disk flat at the cost of re-fetching. The subsample reached 20 projects that way. Its size is
stated in the findings rather than presented as a rate over the frame, because the budget, not
the sampling plan, is what bounded it.

## Corrections

- The pilot that motivated this measurement used `cli/cli`, which resolves 465 modules and 202
  owners with 80 % never named. Those figures are a single hand-picked project and are not the
  result; the frame medians are 82 modules, 41 owners and 78 %. The pilot is cited nowhere in the
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
  reported, and they give medians of 41 and 42.
