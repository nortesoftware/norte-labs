# Has anyone measured what a Go build trusts, and what it runs?

Sweep of 2026-09-23. Four modalities — academic, industry, code and data, community and press —
96 sources, 143 recorded searches; sources and searches in
[go-supply-chain-sources.md](go-supply-chain-sources.md).

Go is the interesting case because it is supposed not to have npm's problem. `go get` and
`go build` run no package-authored install script, and the checksum database makes a fetched
module's bytes checkable against a transparency log. Both are true. The four questions below ask
what is left once they are true.

## Q1 — how many distinct owners does a Go build trust? — **not found**

Not found in all four modalities, which is unusual and worth stating plainly.

The module half of the question is taken. That a Go build pulls far more modules than a developer
declares is published: Li, Wu, Fu and Zhou (ASE 2023) and the dependency-depth work of 2025 both
establish the amplification, and the datasets that would let anyone count are public — the module
index, `proxy.golang.org`, deps.dev and its BigQuery tables, ecosyste.ms.

What is missing is the step from modules to **owners**. Go has no publisher account: a module is
named by its repository path, so an owner has to be derived — `github.com/<org>`, `golang.org/x`,
a vanity host and whoever controls its DNS. Nobody has published that derivation with a count
behind it, and nobody has reported the fraction of owners in a build graph that never appear in
the project's own `go.mod`. "On Good Authority: Release-Authority Measurement for Registries"
(2026) is the nearest thing and is about registries that *have* release authorities, which is the
attribute Go lacks.

Searched: MSR- and ASE-style mining venues, Semantic Scholar and DBLP citation graphs from the
semantic-versioning and dependency-depth papers, deps.dev's published research, libraries.io and
ecosyste.ms, Sonatype's and Endor Labs' annual reports, GopherCon and FOSDEM talk indexes. One
paper could not be read: "Extending Cloud Build Systems to Eliminate Transitive Trust"
(SCORED '24, DOI 10.1145/3689944.3696169) returns HTTP 403 from the ACM library. Its abstract and
the NixOS discussion thread describe a design for attaching metadata to build-input signatures
and TPM attestations, which is an architecture proposal rather than a count; on that basis the
verdict stands, and the paper should be read in full before anything is published.

## Q2 — what does a Go build actually execute? — **partial**

The mechanism is not in doubt and the tooling is documented. cgo compiles and links C with
`#cgo CFLAGS` and `LDFLAGS` directives the dependency controls; assembly is assembled;
`//go:generate` exists and is not run by `go build`. The Go team has restricted which flags may
be passed precisely because they are an execution surface.

What is measured is cgo's prevalence **in a project's own source**, and the classification of
which directive kinds appear. Chen, Ding, Zhang, Li et al. (Journal of Systems and Software 231,
2026) is the study of record. Its directive frequencies must be quoted carefully: the denominator
is **101 manually labelled files inside the top 20 most-starred CGO repositories**, not the 920
projects of the wider sample and not the 104 CGO-using projects among them. `LDFLAG` at 31.68 %
is 32 of those 101 files. A secondary summary of the same paper reports these as project-level
rates; that reading inflates the population by about nine times and is not used here.

Open: the same question over a **module graph** rather than over a project's own code — how much
of what a build compiles arrives through cgo — and the **values** of the flags, which nobody has
collected. Note also that Go's own telemetry has no cgo or `CGO_ENABLED` counter, so the vendor
does not measure it either.

## Q3 — GOTOOLCHAIN as a way to deliver code — **mechanism documented, measurement not taken**

Since Go 1.21 (August 2023) a `go.mod` or `go.work` may name a toolchain newer than the installed
one, and under `GOTOOLCHAIN=auto`, the default, the go command downloads that toolchain and runs
it. The mechanism is documented by the Go team — the toolchain reference, the 1.21 announcement,
Russ Cox's `57001-gotoolchain` design document. Nothing measures it.

The incident record is the reason this is worth measuring rather than merely noting:

- **CVE-2023-39320** (`golang/go#62198`, reported by Juho Nurminen of Mattermost): the toolchain
  directive "could be leveraged to execute scripts and binaries relative to the root of the
  module when the go command was executed within the module". Fixed in Go 1.21.1 — within weeks
  of the feature shipping.
- **`golang/go#79070`** (2026): "If … the checksum database returns a successful response that
  contains no entry for the module, the go command incorrectly permitted validation to succeed",
  and the report frames it for this path — "a malicious module proxy can serve altered versions
  of the Go toolchain" when one is selected via `GOTOOLCHAIN`.
- Debian **#1040507**, open from 2023: "golang-1.21-go: downloads and runs binaries from the
  Internet without permission".

What exists that looks like measurement, and is not: Go's telemetry publishes a
`gopls/gotoolchain` counter — for the week of 2026-09-21, `auto` 4050, `local` 114, `other` 63,
`path` 0. That is the **setting** among opted-in gopls users. It is not modules that name a
toolchain, not downloads, not where they are fetched from, not how they verify. The counter
configuration confirms `cmd/go` has no toolchain counter at all.

So: how many published modules carry a `toolchain` line, which versions they name, how far ahead
of the caller's installed toolchain they reach, and what a clone-and-build does as a result — all
unmeasured. Q3 cannot have prior art older than August 2023, and there is none after it.

## Q4 — what is measured about the Go module ecosystem at all — **exists, unevenly**

Taken: whole-ecosystem census (Sousa's *The Shape of Go*, 2026, at millions of modules and
edges); malicious-module persistence after takedown, with the proxy's immutability as the
mechanism (2026); repojacking and modules on deleted accounts still served by the proxy —
VulnCheck's 2023 figures and Boost Security's 63,386 packages on deleted accounts, 9,571 of them
imported by public projects; semantic-versioning practice (2023); vulnerability propagation.

Open: what fraction of real fetches the checksum database actually covers, and how often
`GOPRIVATE`, `GONOSUMDB`, `GONOSUMCHECK` or `GOFLAGS` turn it off — a question `golang/go#79070`
makes sharper, since it shows a successful-but-empty sumdb response was accepted as validation.
Also open: vanity import paths and who controls the domains behind them, beyond the repojacking
work.

## What this leaves

Q1 and Q3 are open, Q2 is open exactly where a module-graph walk would reach, and all three fall
out of a single traversal of one sample of real Go projects: resolve the graph, derive owners
from host and path, count what is never declared, count `toolchain` directives and what they ask
for, count what arrives with cgo. Q4 is well enough covered that it is context rather than a
target, with the sumdb-coverage sub-question as the exception.
