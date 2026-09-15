# norte-labs

Supply-chain security research and tooling audits. Measurements first, prior art before
every measurement, verification before every claim.

## What is here

- [prior-art/mcp.md](prior-art/mcp.md) — has anyone measured the MCP server ecosystem?
  Six questions (census, declared-vs-actual privilege, incidents, scanners, registries,
  vendor publications), 312 verified sources, 687 recorded searches. Verdicts on the scale
  *exists / partial / not found*. Appendix of sources and searches in
  [prior-art/mcp-sources.md](prior-art/mcp-sources.md).
- [registries/mcp/](registries/mcp/) — inventory of 24 MCP registries and catalogs (operator,
  review before listing, takedown, size) and a direct census of the official registry API on
  2026-09-11.
- [measurements/mcp-install/](measurements/mcp-install/) — what 600 MCP server packages (npm,
  PyPI) do at install and at first start: install scripts, network, telemetry, `$HOME` paths.
  Harness, per-cell results, generated report, findings, and the adversarial verification pass
  with its retractions.

## Conventions

- A prior-art sweep precedes every measurement. "Not found" means "these searches were run",
  and the searches are listed; the word "novel" is not used.
- Every rate carries its denominator and a 95 % Wilson interval; where cells share a
  publisher, a cluster-robust interval and the design effect are reported too.
- Samples are seeded and reproducible from the published population files. Purposive cases
  never enter a headline denominator.
- Corrections and retractions stay written in the document they correct.

Planned areas, not started: ecosystem audits (npm, Go, crates), tool audits, agent-plugin
registries, an instruction-gap measurement.
