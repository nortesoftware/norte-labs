# registries/mcp

Inventory of MCP server registries and catalogs: who operates them, what review they apply
before and after listing, how they take entries down, and how many entries they hold. State as
of 2026-09-11. Direct measurement of the official registry in
[census-2026-09-11.md](census-2026-09-11.md); prior-art sweep in
[../../prior-art/mcp.md](../../prior-art/mcp.md) (topic "registries").

Every statement about policy comes from the operator's own document, opened on the date given;
size figures are what the site or its API showed that day
([data/catalog-counts-2026-09-11.json](data/catalog-counts-2026-09-11.json)).

## Inventory

| registry | operator | submission model | review before listing | after listing / takedown | hosts or runs code | entries |
|---|---|---|---|---|---|---|
| [Official MCP Registry](https://registry.modelcontextprotocol.io) | MCP project (community; backed by Anthropic, GitHub, PulseMCP, Microsoft) | self-publishing with `mcp-publisher` | proof of namespace ownership (GitHub OAuth/OIDC, DNS, HTTP) and of package ownership; no content review — "assume minimal-to-no moderation" | manual takedown by issue; `status=deleted` with metadata retained; appeal by issue; 1 documented case (#1563) | no; metadata only | 30,830 |
| [GitHub MCP Registry](https://github.com/mcp) | GitHub | curated partners; no self-submission (manual approval via partnerships@github.com) | editorial curation; ingestion from the official registry was promised, not observed | not documented | no | 252 |
| [Docker MCP Catalog](https://hub.docker.com/mcp) | Docker | PR to `docker/mcp-registry` | CI + "every pull request requires a review from the Docker team"; "Docker-built" images signed, with SBOM and provenance; community-built ones get container isolation only | takedown by issue; no rejection figures (3,432 PRs merged / 310 closed unmerged) | builds images | 328 |
| [Smithery](https://smithery.ai) | Smithery (Henry Mao) | URL (gateway-proxied) or MCPB bundle | metadata-extraction scan, bypassable with `server-card.json`; post-publication "verification checklist"; no human security review described | not documented; `security` field null in every sample | yes, hosts ("over 3,000" hosted per GitGuardian) | 13,978 (191 "verified") |
| [Glama](https://glama.ai/mcp/servers) | Glama (Frank Fiegel) | auto-indexing from GitHub + claim through OAuth | build in a Firecracker microVM with syscall and network observation against the declared capability set; "Malicious" findings → internal review → maintainer contact or de-listing; rules unpublished | de-listing; no figures ("over one million such scans") | builds and runs | 85,656 |
| [PulseMCP](https://www.pulsemcp.com/servers) | PulseMCP (Antanavicius, Coughlin, Patel; its founder maintains the official registry) | submissions paused; scraping + integration with the official registry | "manual curation" over automated scraping; enrichment with unspecified "security analyses" | not documented | no | 21,940 (6,258 "official providers") |
| [mcp.so](https://mcp.so) | chatmcp | GitHub issue (free) or USD 39 "Publish immediately without review" | none on the paid path; purchasable "Verified" badge | not documented | no | n/a (~19,400 by facets) |
| [mcpservers.org](https://mcpservers.org) | not identified | — | not documented | — | no | 12,284 |
| [LobeHub](https://lobehub.com/mcp) | LobeHub | — | no policy text | — | no | 96,959 |
| [MCP Market](https://mcpmarket.com) | not identified | — | not documented | — | no | 47,477 |
| [MCP Toplist](https://mcptoplist.com) | BIFF.ai | aggregator (5 registries) | none; dedup by repo URL / package id | — | no | 126,487 |
| [Cline marketplace](https://github.com/cline/mcp-marketplace) | Cline | GitHub issue | written manual review: adoption, developer credibility (identity verification), maturity, security (extra scrutiny for finance/crypto), "within a couple of days" | — | no | 199 (2,226 open issues) |
| [Anthropic Connectors Directory](https://claude.com/docs/connectors/building/review-criteria) | Anthropic | form | automated policy scan → listed as "community"; escalation to "verified review" with a functional test of every tool; "Verified is not a security audit" | initial and ongoing review; removal for non-compliance | no | n/a |
| [Claude Code plugins](https://code.claude.com/docs/en/discover-plugins) | Anthropic | PR | official: curated at discretion; community: automated validation and safety screening, commit-SHA pinning; "Anthropic cannot verify…" | — | no | n/a |
| [OpenAI plugins / Apps](https://developers.openai.com/plugins/app-guidelines) | OpenAI | submission | curated-directory criteria: correct tool annotations (a common rejection cause), privacy policy, data minimization | post-approval removal | no | n/a |
| [Microsoft MCP server certification](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-server-certification) | Microsoft | Partner Center | the strictest documented: verified publisher, automated validation, manual per-tool testing with credentials, adversarial Responsible AI scenarios, continuous monitoring | post-certification monitoring | no | n/a |
| [Azure API Center MCP registry](https://learn.microsoft.com/en-us/azure/api-center/register-discover-mcp-server) | Microsoft (per organization) | manual registration / sync from APIM or Git | no third-party code review described | — | no | private |
| [Stacklok ToolHive catalog](https://github.com/stacklok/toolhive-catalog) | Stacklok | PR with `server.json` | written Required/Expected/Recommended rubric (open source only, SHA-pinned dependencies, no unpatched critical/high CVEs, provenance, SLSA, SBOM); an LLM reviewer agent authorized to approve and merge low/medium-risk PRs | — | no | 111 |
| [Gemini CLI extensions](https://geminicli.com/extensions/) | Google | GitHub topic | none: "Google does not vet" | — | no | 1,782 |
| [ModelScope MCP 广场](https://www.modelscope.cn/mcp) | Alibaba | — | no verification field in the API; review (审核) policy not opened | — | yes, 4,599 hosted | 12,436 |
| Tencent Cloud MCP | Tencent | closed: third parties cannot submit | operator curation | — | local and hosted modes | n/a |
| [MACH Alliance registry](https://machalliance.org/mach-alliance-mcp-registry) | MACH Alliance | Typeform | generic language (schema validation, automated checks, community reporting) | — | no | n/a |
| JFrog Universal MCP Registry | JFrog | enterprise | "blocks malicious or non-compliant servers" (press release, no policy) | — | — | n/a |
| [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | Frank Fiegel | PR | format only; fast track for PRs from automated agents; synced to Glama | — | no | 3,849 |
| Third-party review layers (not registries): [BlueRock mcp-trust](https://www.mcp-trust.com/), [Backslash Security Hub](https://www.backslash.security/blog/mcp-server-security-hub), [AgentSeal](https://agentseal.org), [PulseFeed drift](https://pulsefeed.dev/mcp/drift), Canopii index, polygraph | various | — | post-hoc scoring of public servers; AgentSeal 8,013 analysed; PulseFeed nightly diff (owner changes, install scripts added, unpublished packages) | — | — | — |

Chinese and Korean marketplaces with second-hand figures only: Baidu MCP World (~57–61k
claimed), iFLYTEK, MCP Star, AIbase, Bailian, Kakao PlayMCP (~200). No primary policy opened.

## What has been measured and what has not

Measured (sources in the sweep's appendix):

- Sizes and overlap across markets: Guo et al. (2509.25292: 6 markets, 17,630 raw → 8,060
  valid, 32.3 % listed in more than one); MCPZoo (2607.11086: 10 markets, 156,842 raw → 56,053
  distinct); Hou et al. (2503.23278: 26 collections, no dedup).
- That listing does not imply function: 2609.10962 (seeded random sample, <50 % handshake on
  npm/stdio); issue #1487 (a tenth of advertised remote endpoints do not speak MCP); MCP Queen
  (17.2 % of remote servers dead; 55.8 % of the reachable ones without auth).
- That namespace verification is never repeated: #1488, #1500 (~35 re-registrable domains),
  AIR Security (155).
- One empirical test of listing review: OX Security, a benign PoC accepted by 9 of 11 registries
  "without review" — registries not named, method in a gated eBook.
- Existing policy comparisons: Descope (4 registries), TrueFoundry (5), Zowe (10), UpGuard (4,
  moderation labels), alianga (8 Chinese platforms). Vendor or practitioner tables; they
  characterize rather than quote, omit takedowns and omit the curated catalogs.

Not measured (open field):

- No operator publishes takedown or rejection statistics; the official registry has n=1
  documented against 709 unclassified deleted entries.
- Nobody has submitted the same benign-but-flaggable server to the registries under a common
  protocol, recording outcome and latency per registry.
- Takedown propagation: Glama, PulseMCP and mcp.so ingest the official registry and "may prefer"
  to drop `deleted` entries; nobody has checked whether the 709 remain listed downstream.
- Whether documented human review (Docker, Cline, Stacklok, Anthropic, Microsoft) catches
  anything: no rejection rates, no post-listing incidents; nobody has scanned curated against
  uncurated populations with the same instrument.
- Paid listings or purchasable badges (mcp.so): no measure of quality, liveness or abuse.
- Size figures not comparable across registries or studies: no standard counting method, no
  validated cross-registry dedup.
- No academic paper examines Docker, GitHub, Microsoft, Anthropic or Stacklok; the literature
  covers community aggregators and, since 2026, the official registry.
