# norte-labs

Supply-chain security research and audits.

## What is here

- [prior-art/mcp.md](prior-art/mcp.md) — has anyone measured the MCP server ecosystem?
  Six questions (census, declared-vs-actual privilege, incidents, scanners, registries,
  vendor publications), 312 verified sources, 687 recorded searches. Verdicts on the scale
  *exists / partial / not found*. Appendix of sources and searches in
  [prior-art/mcp-sources.md](prior-art/mcp-sources.md).
- [registries/mcp/](registries/mcp/) — inventory of 24 MCP registries and catalogs (operator,
  review before listing, takedown, size) and a direct census of the official registry API on
  2026-09-11.
- [prior-art/agent-plugins.md](prior-art/agent-plugins.md) — has anyone measured the extension
  and plugin marketplaces of Cursor, Windsurf, Continue and Zed, in particular what a plugin
  does at install and first run? Seven questions, 485 verified sources, 2,292 recorded
  searches (2026-09-15/16). Population corrected on the way: Continue's Hub is gone, Windsurf's
  marketplace is Open VSX, Cursor and Devin have plugin marketplaces, Zed and JetBrains share an
  agent registry. An addendum of 2026-09-17 asks the two narrower questions the VSIX arm needed
  — has anyone traced extensions at activation at the operating-system boundary, and has anyone
  run an executed study over Open VSX as a population — over 64 further sources and 153
  searches: neither is taken. Appendix in
  [prior-art/agent-plugins-sources.md](prior-art/agent-plugins-sources.md).
- [registries/agent-plugins/](registries/agent-plugins/) — inventory of those marketplaces and
  the registries they draw from, with counts taken on 2026-09-16 and two takedown series
  derived from git history.
- [measurements/agent-plugins/](measurements/agent-plugins/) — what those plugins do at install
  and first start: the 42 ACP agents (validated cell by cell against the registry's own CI),
  330 Cursor plugins, 171 Devin plugins, 73 Zed context servers — whole populations, no
  sample — and 600 Open VSX extensions activated inside a headless editor under the same
  trace, a seeded sample of the gallery behind Cursor and Windsurf. Install scripts, egress,
  telemetry, `$HOME` paths, what hooks download, which extensions write into another agent's
  configuration and how many of them do it at every editor start, what a quarantine means;
  harness, per-cell results, generated report, findings, additional checks with their
  corrections.
- [tools/](tools/) — audits of supply-chain security tools: what the documentation promises, what
  the code does, and what the tool reports when the control it names cannot reach what it claims
  to cover. Inventory of 69 tools across install sandboxes, package scanners, CI gates, provenance
  verifiers and SBOM generators, and the three picked to audit first, with the reason for each.
- [prior-art/go-supply-chain.md](prior-art/go-supply-chain.md) — has anyone measured what a Go
  build trusts and what it runs? Four questions over four modalities, 96 sources, 143 recorded
  searches (2026-09-23). Go has no install scripts and has a checksum database, and both hold; what
  is open is the step from modules to owners, what arrives through cgo in a module graph, and the
  toolchain directive that makes the go command download and run a different toolchain by default.
  Appendix in [prior-art/go-supply-chain-sources.md](prior-art/go-supply-chain-sources.md).
- [ecosystems/go/](ecosystems/go/) — what one `go build` trusts and what it runs: 400
  repositories from a frame of 11,015, 360 resolved. A median Go project declares 10 modules and
  trusts 41 distinct owners, naming 8 of them — 78 % never named, against npm's 87 %. Go runs no
  install script and has a checksum database, and both hold; what they do not change is how many
  parties can put code into the build. 45.6 % of projects carry at least one module whose
  manifest can make the go command download and execute a different toolchain, which nobody had
  measured. Owner derivation published with its code before the run, and reported two ways.
- [measurements/mcp-install/](measurements/mcp-install/) — what 600 MCP server packages (npm,
  PyPI) do at install and at first start: install scripts, network, telemetry, `$HOME` paths.
  Harness, per-cell results, generated report, findings, and the additional checks with their
  retractions.
- [prior-art/instruction-gap.md](prior-art/instruction-gap.md) — has anyone counted, per real
  project, the publishers behind what one `npm install` brings? Per package yes (2019); per
  synthetic stack yes (2026); per declared sample of real projects no. Appendix in
  [prior-art/instruction-gap-sources.md](prior-art/instruction-gap-sources.md).
- [measurements/instruction-gap/](measurements/instruction-gap/) — 892 lockfiles from a random
  sample of GitHub repositories: a median project declares 26 packages and receives 604
  versions from 165 publishing identities, 87 % of them behind nothing it named; who is in
  nine trees of ten; the install-time code and who publishes it; the hosts; the design effect
  of shared frameworks. Read from lockfiles and the registry, nothing installed. npm only:
  PyPI's registry does not record who uploaded a release, so the count cannot be made there;
  that is a limit of the measurement, not work left to do.

## Conventions

- A prior-art sweep precedes every measurement. "Not found" means "these searches were run",
  and the searches are listed; the word "novel" is not used.
- Every rate carries its denominator and a 95 % Wilson interval; where cells share a
  publisher, a cluster-robust interval and the design effect are reported too.
- Samples are seeded and reproducible from the published population files. Purposive cases
  never enter a headline denominator.
- Corrections and retractions stay written in the document they correct.

Planned areas, not started: ecosystem audits (npm, Go, crates).
