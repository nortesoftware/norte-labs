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
and the push record are in [verification.md](verification.md#corrections).

## Frame and sample

Mirrors [../../measurements/instruction-gap/](../../measurements/instruction-gap/) so the two are
comparable.

The frame is every GitHub repository whose primary language is Go, with at least 100 stars,
pushed within the twelve months before the frame date, not a fork, enumerated in full through the
search API in star bands with no band at the API's 1,000-result cap. The sample is the first 400
repositories in the order of `sha256(seed + fullName)` — a simple random order anyone can
reproduce from the committed frame file. Seed and frame date are fixed in
`results/population-stats.json` when the frame is built.

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
  cannot be reached — are counted and reported as their own category under Rule A rather than
  dropped or silently attributed. A module in a live build graph whose publisher is no longer
  resolvable is a result.
- The resolution is done **now**, not at the version's publication date. A path whose vanity
  domain has changed hands since resolves to today's controller. That is the right answer for
  "who can change my build today" and the wrong one for history, and it is not corrected.

## What else the same traversal yields

- **Q3, the toolchain directive.** Every `go.mod` in the graph is read for a `toolchain` line:
  how many modules carry one, which versions they name, and how far ahead of the sampled
  project's own `go` directive they reach. With `GOTOOLCHAIN=auto`, the default, a line in a
  cloned repository makes the go command download and execute a different toolchain.
- **Q2's open slice.** Which modules in the graph contain `import "C"` or `#cgo` directives, and
  the flag values they pass — measured over the module graph rather than over a project's own
  source, which is what the published work covers.

## Running it

```sh
export GOMODCACHE=/var/tmp/nl-go/modcache        # not ~/go: the graph walk is large
python3 src/frame.py  results/frame-<date>.ndjson.gz
python3 src/sample.py results/frame-<date>.ndjson.gz results/population.ndjson --n 400 --seed '<seed>'
python3 src/walk.py   results/population.ndjson   results/cells.ndjson
python3 src/report.py results results/report.md
```

Temporary files under `/var/tmp/nl-go/`, deleted when the run is done.
