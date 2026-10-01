# MCP — prior art

Sweep of 2026-09-11. The question: an MCP server is an npm/PyPI package (or an OCI image, or a
remote endpoint) that is handed access to tools, files and credentials — more privilege than an
ordinary dependency. The ecosystem is 22 months old (MCP was published on 2024-11-25).
**Has anyone already measured it?**

Scale: exists / partial / not found. "Not found" means "these searches were run"; the list is in
the appendix [mcp-sources.md](mcp-sources.md), together with every verified source (URL, date,
verbatim figures, sample, limitations).

## Summary

| topic | verdict | in one line |
|---|---|---|
| census | **exists** | several times over, almost all grey literature from Jun–Sep 2026 (MCP Toplist, Major Labs, MCPZoo; Guo et al. from Sep 2025); missing: the individual/organization split and the curve from Nov 2024 |
| declared vs actual privilege | **partial** | both sides are measured separately, at scale; nobody has joined them: no study with n>1 compares `readOnlyHint`/`destructiveHint` with what the server does at runtime |
| incidents | **partial** | ~52 distinct incidents verified at primary sources; no maintained inventory covers them (vulnerablemcp.info stops at Feb 2026; the most recent, Digital Applied's ledger, froze on 2026-08-24) |
| scanners | **exists**, narrowly | dozens of description and code scanners, four maintained; the runtime declared-vs-observed comparison was built twice (Glama, closed; Connor, public code) with no open maintained tool and no population rate |
| registries | **partial** | written policies from ~12 operators, from "assume minimal-to-no moderation" to Microsoft's certification; no systematic comparison, no operator publishes takedowns |
| vendors | **exists** | Snyk measures (telemetry from ~10,000 environments, AI-BOM over 3,044 accounts); Anthropic, Socket and Koi publish policy, incidents and product; Aikido only worm write-ups that list MCP packages among the victims, and product pages; Phylum/Veracode nothing |

## Is it taken?

**The census, yes.** Counting MCP servers is a small industry by now: at least twelve
independent labs, three datasets with a DOI or on HF, and four arXiv papers publish counts with a
method. One more census adds nothing; the remaining holes (individual vs organization, the curve
from launch, validated cross-registry dedup, a concentration index corrected for farms) are real
but they are data cleaning, not new measurement.

**Description and code scanners, also.** Eight tools, static and dynamic, compared on MCPZoo at a
mean precision of 45.5 % and a Jaccard agreement of 15.7 %: saturated and low quality, but occupied.

**What is not taken** is precisely the privilege question, in its concrete form:

1. **Declared vs observed at runtime, at scale, with the protocol's annotations as the
   declaration.** The declared side is measured (44,172 tools over 35 crawls of the official
   registry: 83.8 % declare at least one effect hint, 59.3 % remain bound to an unmutated contract,
   description and schemas) and the actual side is measured statically (19,200 description-code
   pairs, 9.93 % inconsistent, of which 24.8 % are undeclared side effects; 296 servers: 79.6 % read
   environment variables, 49.3 % write to disk — according to the code). The only published dynamic
   cross-check is SandScope: 33 repositories, network egress only, "declared" = descriptions, not
   annotations. Glama does it in production ("over one million such scans" in Firecracker microVMs
   against "the declared capability set") and publishes no rate.
2. **Install-time and first-start behaviour of MCP distributions** (npm postinstall, PyPI
   setup, network on first run, telemetry): nobody has traced it for a corpus. Canopii counts 260
   servers with install scripts, statically. It is norte-guard's method applied to the MCP
   population.
3. **OAuth scopes requested vs exercised** by remote servers: no measurement at all.
4. On registries: a controlled submission test against named registries; takedown statistics;
   propagation of deletions to aggregators; whether documented human review catches anything.

**Window.** Four actors are one step away: Glama has the data and publishes no aggregate of it;
Stacklok stated in April 2026 that verifying annotations against the code is "the natural next
step"; Connor (Fudan) has public code and its own evaluation (F1 94.6 % on 134 malicious servers,
114 of them built by the authors, and 130 benign ones); Zenity showed an "Agent Detonation Chamber"
at Black Hat USA 2026 that makes exactly this comparison, for *skills*, with a stated plan to extend
it "to additional components of the AI supply chain", MCP servers among them. The Bharti & Agnihotri
preprint (2026-09-07) lists "Staleness is not falsity" first among its limits: they point at the
missing step themselves.

## Method and limits

Six topics × four search modalities (academic: the arXiv API and the 2026 proceedings of USENIX
Security, S&P, CCS, NDSS, ICSE, FSE, MSR, ASE; industry: vendor blogs, talks, newsletters; code:
GitHub, registry docs, datasets; advisories: NVD, GHSA, OSV, press, HN). Every source was opened
and marked confirmed / partially confirmed / refuted / unreachable; each topic was then searched
again for what was missing (2026 venues, sources in Chinese/Japanese/Korean/German/Spanish,
standards bodies, adjacent framings: agent skills, A2A, plugins) and those finds were opened the
same way. Result: 312 verified supporting sources (refuted and unreachable ones are listed as
"not used" in the appendix), 687 recorded searches. The code and advisory modalities ran in full
only for registries and incidents respectively; the second search covered them for the other
topics.

Limits: ACM DL and IEEE Xplore returned 403 (metadata verified through Crossref); Semantic
Scholar 429; DBLP behind an anti-bot wall; Koi Security's primary posts redirect (Palo Alto) and
were read through the Wayback Machine; OX Security's eBook with the 11 registries tested is behind
a signup; Salesforce AgentExchange, Baidu MCP World, ModelScope and Kakao PlayMCP could not be
opened at the primary source. Web search hit its cap of 200 queries and the rest went through
direct APIs.

---

## 1. Ecosystem census

**Question.** Does a census exist? How many servers, who publishes them, since when?

**Verdict: exists.** With stated method and sample, several times, but as grey literature.

What exists:

- Multi-source censuses with a dedup rule: **MCP Toplist** (BIFF.ai; 125,905 "canonical" servers
  over the official registry + Glama + Smithery + mcp.so + PulseMCP, dedup by repo URL / package id,
  daily since 2026-04-25, CC BY dataset on HF); **Major Labs** (majorlabs.co/data at its 2026-09-07
  scan: ~82,666 distinct repos + 7,634 remote-only, weekly scans since 2026-05-31; dataset with a
  3,227-repo census at Zenodo DOI 10.5281/zenodo.22674847, 2026-09-09); **Guo et al.**
  ([2509.25292](https://arxiv.org/abs/2509.25292): six markets crawled daily Jul–Sep 2025, 17,630
  raw → 8,401 valid, 8,060 of them servers, 32.3 % listed in more than one); **MCPZoo**
  ([2512.15144](https://arxiv.org/abs/2512.15144): eight sources, 129,059 raw → 56,053 distinct, Dec
  2025; [2607.11086](https://arxiv.org/abs/2607.11086): ten sources, 156,842 raw → 64,611 unique,
  Jul 2026).
- Time series of the official registry: since launch, dend/mcp-registry-growth (7,057 rows from 238
  servers on 2025-09-16 to 30,848 on 2026-09-11); over shorter windows, RoninForge (four censuses,
  2026-07-02 to 2026-09-09), Bharti (2026-04-30 to 2026-07-28) and
  [2609.10962](https://arxiv.org/abs/2609.10962) (two sweeps, 2026-07-14 and 2026-08-22);
  company-hosted remote endpoints (Bloomberry: 425 in Aug 2025 → 1,412 in Feb 2026).
- Publisher concentration at namespace level: Ashsinha1 (25,423 servers from 15,709 publishers,
  14,063 with exactly one, top-10 = 15.5 %); fetchgate (two operators own 2,357 of 8,235 live
  remote servers = 28.6 %); Kim et al. ([2605.09817](https://arxiv.org/abs/2605.09817): top-10
  developers = 27.6 % of the tools on 2.6 % of the repos).
- This repository's own direct measurement of the official registry agrees within hours of drift:
  [registries/mcp/census-2026-09-11.md](../registries/mcp/census-2026-09-11.md).

What does not exist:

- An individual vs organization split (the proxies are `io.github.*` = 67–72 %, which mixes
  users, organizations and farms; and PulseMCP's editorial label).
- A curve from Nov 2024 outside PulseMCP: every other series starts late; PulseMCP's /statistics
  charts give a monthly count of its filtered directory from Nov 2024 (101) to Aug 2026 (3,712 in
  May 2025), which mcpevals.io repeats second-hand as ~100 → 4,000+ by May 2025.
- Cross-registry reconciliation with an error rate: on the same day, 21,940 (PulseMCP), 30,830
  (official), 85,656 (Glama), 96,959 (LobeHub), 126,487 (MCP Toplist).
- A package-registry-side census (npm `keywords:mcp` 71,629; `topic:mcp-server` 28,356 repos)
  with a server/client/tooling split and a first-publish timeline.
- The farms (`io.github.sadri-dridi` 1,798, `io.github.pipeworx-io` 1,321, `io.github.mcp-dir` 1,113
  in the official registry on 2026-09-11; `mcp.ai` 1,091 per Fetchgate): pipeworx tops three
  published censuses and mcp.ai one; nobody measures what share of the ecosystem is generated
  wrappers or who operates them.
- The academic record alone would only reach *partial*: snapshots or short windows.

## 2. Privilege surface: declared vs actual

**Question.** Has anyone compared what a server declares (`readOnlyHint` / `destructiveHint` /
`idempotentHint` / `openWorldHint` annotations, README, requested environment variables, OAuth
scopes) with what it does at runtime (files, network, subprocesses, secrets), at scale?

**Verdict: partial.**

What exists, declared side:

- Bharti & Agnihotri, *Declared vs. Observed: Measuring the Binding Gap in MCP Tool Declarations*
  (Zenodo [10.5281/zenodo.22649163](https://doi.org/10.5281/zenodo.22649163), 2026-09-07): 35
  crawls of the official registry 2026-06-09..08-01, 44,172 tools on 2,043 servers; 83.8 %
  declare at least one effect annotation, 59.3 % remain bound to an unmutated contract (a
  24.5-point gap), 783 confirmed declaration changes, 86.0 % of first declarations are
  permissive. Verbatim: *"No runtime behaviour is observed and no action is ever witnessed
  executing"*; *"Staleness is not falsity"*.
- [2609.10962](https://arxiv.org/abs/2609.10962) (2026-09-10): seeded random sample of 400
  npm/stdio servers from the registry; 58.8 % of 2,766 tools carry no annotations (presence, not
  correctness).
- Astrix (5,205 READMEs: ~88 % require credentials, 79 % of API keys via environment variables);
  Trend Micro (19,402 sources, 48 % recommend `.env`).
- The protocol maintainers themselves, 2026-03-16: *"A server can claim readOnlyHint: true and
  delete your files anyway."*

What exists, actual side (static):

- DCIChecker ([2606.04769](https://arxiv.org/abs/2606.04769), Fudan, 2026-06-03): 19,200
  description-code pairs from 2,214 Python servers; 9.93 % inconsistent (11.20 % of valid pairs),
  35.0 % of servers with at least one; 24.8 % of the inconsistencies are *Undeclared Side Effects*.
  *"we did not execute third-party MCP tools against live systems"*.
- MCPDiff ([2602.03580](https://arxiv.org/abs/2602.03580)): 10,240 marketplace servers, ~13 %
  with a substantial mismatch; no precision reported, no code.
- AgentBound ([2510.21236](https://arxiv.org/abs/2510.21236), FSE 2026): LLM-generated manifests
  from the code of 296 servers: network.client 83.1 %, env.read 79.6 %, filesystem.read 74.1 %,
  filesystem.write 49.3 %.
- Endor Labs (2,614 implementations: 82 % file-system operations, 67 % code-injection APIs);
  [2507.06250](https://arxiv.org/abs/2507.06250) (2,562 servers); Canopii (11,524 servers; 1,709
  listen on 0.0.0.0; 260 with install scripts).

What exists, dynamic cross-check:

- SandScope / MCP-SandboxScan ([2601.01241](https://arxiv.org/abs/2601.01241), Glasgow): a corpus
  of 100 repos by stars, 91 resolved, 33 re-executed; Table 8: egress declared and observed 5,
  declared only 14, observed only 4, neither 10. One non-destructive scenario; "declared"
  recovered from `tools/list`, not from annotations.
- Glama (methodology page, undated): builds and runs every listed open-source server in a
  Firecracker microVM, observes syscalls and network against "the declared capability set"
  (annotations included as "the authoritative description"); "over one million such scans"; rules
  and rates unpublished.
- Canopii (Jul 2026): of 77 remote servers that declare authentication in their manifest, 24
  serve the tool list to anonymous calls — the only vendor measurement of a declaration against
  behaviour, for a single declaration type.
- One n=1 case of a false `readOnlyHint`: github/github-mcp-server in dynamic toolset mode
  (dev.to, 2026-05-13).
- Three prototypes from August 2026 with exactly this framing (mcp-evidence-validator, panopticon,
  behavioral-abi): zero stars; two run one server at a time, and behavioral-abi ran 12 of a frozen
  20-server corpus before its own rubric stopped it.

What does not exist:

- No study with n>1 checks whether the annotations are correct by tracing writes, deletes,
  egress, subprocesses or secret reads of published servers.
- README/manifest vs actual reads of the environment, credential files or keychain: the two
  sides have only ever been measured separately.
- OAuth scopes requested vs exercised: nothing.
- Scaling SandScope's cross-check to hundreds or thousands of servers, with file, subprocess
  and secret dimensions, and with the annotations as the declaration.
- Whether Bharti's 10,751 stale-declaration tools or 783 flips are *false*: nobody has joined that
  corpus to the code or to a sandbox.
- A ground-truth benchmark of verified read-only/destructive/network behaviour; existing
  scanners average 45.5 % precision (MCPZoo).
- Install and first start of the distributions (postinstall, setup, network, telemetry) for a
  corpus.
- Populations outside Python and stdio: remote streamable-HTTP servers (55 % of the registry) have
  only been probed for liveness, authentication and their tool lists.
- Longitudinal drift of behaviour (not of the contract) across versions; every measured rug-pull
  is a `tools/list` diff.

## 3. Known incidents

**Question.** Which public incidents exist in MCP servers and infrastructure, and does anyone
maintain an inventory?

**Verdict: partial** (maintained inventory: no; incidents: plenty).

Trackers found: vulnerablemcp.info (50 entries, newest 2026-02-04, no update stamp); Digital
Applied's "MCP Security Incident Ledger" (27 entries Apr 2025–Aug 2026, explicit inclusion rule,
frozen on 2026-08-24, one misattribution); AuthZed's timeline (14 entries, last revised 2026-05-30);
mcp-cve-project (570 CVEs, pushed 2026-09-07, CVE-only, 26 stars); Adversa AI's monthly digests (Jun
2025–Sep 2026); MITRE ATLAS (four case studies with MCP as the target, only Postmark typed
"incident"); the CSA vulnerability-db (one entry, none added since 2025-07-16); MCPThreatHive (code,
no data). Machine feeds: GHSA "mcp" 783 advisories, `type:malware mcp` 240, NVD 355 CVEs by keyword,
352 naming MCP (6/month in May 2025 → 71 in Aug 2026). No CERT/CC, CISA, JPCERT, BSI, ANSSI or NCSC
advisory specific to MCP; no registry-operator or AAIF feed.

Inventory verified at primary sources (52 entries with type, date, component, discoverer and CVE
in [mcp-sources.md](mcp-sources.md#known-incidents)). Summary:

| type | count | examples |
|---|---|---|
| CVE-bearing vulnerabilities in servers, clients and SDKs | ~40 disclosures + 25 advisories on the official SDKs and Inspector | filesystem CVE-2025-53109/110 (Cymulate); Inspector CVE-2025-49596 9.4 (Oligo); mcp-remote CVE-2025-6514 9.6 (JFrog); mcp-server-git CVE-2025-68143/4/5 (Cyata); Context7 CVE-2026-75130; Azure MCP Server CVE-2026-26118; nginx-ui CVE-2026-33032 9.8, **listed as actively exploited**, as is LiteLLM's MCP endpoint CVE-2026-59822 (CISA KEV, 2026-09-02); FastMCP CVE-2026-32871 10.0; OX Security's STDIO-configuration RCE family (9–12 CVEs, 14+ products); IBM ContextForge CVE-2026-78573 9.8 (2026-09-10) |
| malicious packages / supply chain | ~20 families or waves | auth0-mcp-server (OSSF 2025-08-14); postmark-mcp (Koi, Sep 2025, BCC of every mail, ~1,500 downloads/week); @lanyer640/mcp-runcommand-server (Checkmarx) and three PyPI siblings (JFrog, Oct 2025); SANDWORM_MODE fake-MCP-server installer in 19+ packages (Socket, Feb 2026); trojanized Oura clone on MCP Market (Straiker); Shai-Hulud 2.0, Mini Shai-Hulud, ChainDrop with MCP packages as collateral (Postman, Zapier, @antv, Red Hat, ServiceTitan); the Jul 2026 GHSA batches (65 pip; 70 npm, 31 of them withdrawn on 2026-08-04; with name-squats of Anthropic's reference servers); FakeGit (800+ repos posing as skills or MCP servers; 600+ listings in registries and catalogs including LobeHub/Glama/mcp.so/MCP Market); Deadbugz (23 PRs in 74 minutes to other projects, 17 of them adding a remote server to their MCP configs) |
| production data leaks | 1 confirmed | Asana, Jun 2025, ~1,000 customers (primary not located; relays of a customer email). Smithery: a path traversal exposed a Fly.io token over 3,000+ hosted servers (GitGuardian, no evidence of exploitation) |
| abuse in the wild | 5 | nginx-ui exploitation; scanning of MCP endpoints and credential paths (SANS ISC, n=1 host); FakeGit; a tool-poisoning attack pattern in Copilot Studio (Microsoft IR; techniques "observed in 2026", no specific incident or organization described); agentjacking through Sentry validated on real organizations (Tenet) |
| registry abuse | 7 measurements and incident reports | Song et al. (3 registries accepted malicious servers); Li & Gao (212 hijackable accounts, 304 redirected links); OX (9 of 11); Straiker (one trojanized Oura server listed on MCP Market); FakeGit; Deadbugz (2 of 23 PRs were directory or listing submissions); Canopii (184 rug-pull versions) |

Not incidents, although listed as such: Invariant's demos (GitHub, WhatsApp), General Analysis on
Supabase (Supabase: "no reported incident"), Cato/Atlassian, Zenity AgentFlayer, GhostSplice; Cuckoo
and Kaspersky's PoC are demonstrations as well.

What does not exist: a victim count or telemetry for any malicious MCP package (postmark-mcp's
impact is Koi's estimate); reconciliation of the 240 malware advisories into targeted / worm
collateral / canaries / name coincidences; a honeypot study of MCP endpoints; time to detection or
to advisory (GHSA lags OSSF by up to twelve and a half months); downstream impact of the SDK
advisory stream (how many published servers pin vulnerable versions); a monthly CVE series
classified by CWE; the widely repeated statistic of 30+ CVEs in 60 days, 43 % of them command
injection, has no locatable primary.

## 4. Scanning and review tools

**Question.** Which MCP-specific tools exist, what do they check, who maintains them, and does
any of them compare declared with actual privilege?

**Verdict: exists**, in a narrow sense.

| layer | tools (maintenance as of 2026-09-11) |
|---|---|
| descriptions / configuration | **Snyk agent-scan** (ex-Invariant mcp-scan; Apache-2.0; v0.6.3 2026-09-10; 3,033 ★; detection logic in Snyk's closed API) · **Cisco mcp-scanner** (Apache-2.0; 4.8.4 2026-08-28; YARA + LLM + Cisco API, plus a static docstring-vs-code step) · **Tencent A.I.G** (Apache-2.0; v4.6.1 2026-09-10; regex + LLM agent, SARIF MCP01–10, dynamic mode against a live URL) · AgentSeal (FSL; idle since 2026-06-11; 8,013 servers analysed) · eSentire MCP-Scanner (ICSE 2026 workshop; archived 2026-09-01) · McpSafetyScanner (two commits, both 2025-04-10) |
| static code only | MCP-SecLint (MIT; JS/TS taint; v1.6.1 2026-05-03) · mcp-sec-audit (static Python and JS/TS + capability confirmation through eBPF, no comparison with a declaration) · DCIChecker, MCPInspect, MCPDiff (no public code) · **NVIDIA SkillSpector** (declared vs code, but on `SKILL.md`, not MCP) |
| runtime proxies / guards | Trail of Bits mcp-context-protector (TOFU of descriptions; last commit 2026-02-13; 0 releases) · agent-scan hooks · Lasso mcp-gateway · FlowGuard (no code) |
| registry side | official registry: delegates to npm/PyPI/Docker Hub · **Glama**: microVM + syscalls/network against declared capabilities (closed, "over one million such scans") · Stacklok: annotation verification "the natural next step", though the post's FAQ says it "has been verified against source code" for its curated registry |
| declared vs observed at runtime | Glama (production, closed, unevaluated) · **Connor** ([2604.01905](https://arxiv.org/abs/2604.01905), Apache-2.0, F1 94.6 % on its own curated set (134 malicious servers, 114 of them its own PoCs, and 130 benign), 2 real detections in 1,672 marketplace servers, 3 ★, last push 2026-07-20) · SandScope (33 repos; code at github.com/Wapiti08/MCP-SandboxScan, MIT, v0.1.0-alpha.1 of 2026-08-23) · ToolGuardian (16 tools, no artefact) · Airlock (hackathon) · mcp-evidence-validator (diff of two user-supplied JSON files, no capture) |

Independent quality: MCPZoo ([2607.11086](https://arxiv.org/abs/2607.11086)): eight scanners
over 37,288 interactable servers, mean precision 45.53 % (range 10.4–96.9 %), pairwise Jaccard
15.66 %. AppSec Santa: Cisco's pattern layer at ~78 % false positives on 33 servers. No
evaluation covers the declared-vs-observed class.

What does not exist: an open, maintained tool that runs a published package under syscall/network
sensors and compares against the annotations; a population divergence rate; a benchmark with
deliberately wrong annotations; a Semgrep/CodeQL rule pack for MCP servers; a field evaluation of
the proxies against real rug-pulls. Outside four vendors, maintenance is thin: single-push or
anonymous academic prototypes.

## 5. Registries and catalogs

**Question.** Which registries exist, who curates them, what review do they apply, how do they
take down, how many entries do they hold, and has anyone compared their policies?

**Verdict: partial.** Full inventory in [registries/mcp/README.md](../registries/mcp/README.md).

What exists: written policy documents from at least twelve operators, covering the whole range —
explicit no-review (official registry: *"consumers should assume minimal-to-no moderation"*; Gemini
CLI: *"Google does not vet"*; mcp.so: USD 39 for "Publish immediately without review" and a
purchasable "Verified" badge), ownership verification only (official registry: GitHub OAuth / DNS /
HTTP + package ownership), automated scan then listing (Anthropic community connectors, Claude Code
community plugins, Glama), and documented human review (Docker: *"every pull request requires a
review from the Docker team"*; Cline; Stacklok with a written rubric and an LLM agent authorized to
merge; Anthropic's verified review with a functional test per tool; Microsoft's certification with
manual validation and continuous monitoring). Takedown mechanics documented in detail only for the
official registry (`deleted` with metadata retained, appeal by issue, admin runbook). Comparisons:
Descope (4), TrueFoundry (5), Zowe (10), UpGuard (4), alianga (8 Chinese) — vendor or practitioner
write-ups that characterize without quoting, give takedowns at most a line and, apart from GitHub's
list, omit the curated catalogs.

Empirical evidence on review: OX Security, 9 of 11 registries "poisoned" with a "malicious trial
balloon" (registries not named; per the CSA note on it, a benign PoC accepted "without review");
official registry, one documented takedown (#1563: published 2026-08-08, reported 08-09, deleted
09-05) against 709 unclassified `deleted` entries; issues #1558, #1500, #1488, #1487, #1484 with no
maintainer reply; DNS verification is one-time and apex-wide (#1488: 75 entries from one TXT record,
62 of them serving an HTML page instead of MCP); ~35 re-registrable domains (#1500); 155 entries
hijackable through an expired domain (AIR Security). Academic literature: inventories and counts,
asserts "lack of vetting" from observed outcomes, describes Glama's and Smithery's review in a
single sentence, citing a reddit post for Glama's, and examines neither Docker, GitHub, Microsoft,
Anthropic nor Stacklok.

What does not exist: a systematic policy comparison; a submission test against named registries
under a common protocol; takedown statistics from any operator; downstream propagation of
deletions; an evaluation of whether human review catches anything; the effect of paid listings;
a standardized count.

## 6. Vendor publications

**Question.** Have Anthropic, Socket, Snyk (incl. Invariant Labs), Phylum (incl. Veracode),
Aikido and Koi Security published anything on MCP server security? Any measurement?

**Verdict: exists** (Snyk measures; the rest, incidents or nothing). Per vendor:

| vendor | verdict | what there is |
|---|---|---|
| **Snyk / Invariant** | exists | three measurements: *What nearly 10,000 developer environments reveal* and its report page (2026-06-23: 50.8 % of developers with at least one MCP server installed, 4,524 unique configurations, 392 injection findings in descriptions — customer telemetry, no window, no dataset); AI-BOM Vol. I (Jan 2026: 18.2 % of 500+ organizations deploy MCP servers) and Vol. II (2026-08-03: 3,044 accounts, 237 MCP-only + 505 both). Disclosures: tool poisoning (2025-04-01), WhatsApp (04-07), GitHub MCP (05-26), toxic flows (07-29). Product: mcp-scan → agent-scan (push 2026-09-11). Its scanner is itself measured by others: 28.21 % precision in MCPZoo |
| **Anthropic** | partial | specification (Security Best Practices, rev. 2025-11-25, published by the MCP project Anthropic started, without an Anthropic byline); directory policy (2026-04-15: no hidden instructions, `readOnlyHint`/`destructiveHint` mandatory); architecture posts (Claude Code sandboxing 2025-10-20; *How we contain Claude* 2026-05-25, local MCP servers outside the Cowork VM); the project blog on annotations (2026-03-16, ~17 % adoption of GitHub's read-only mode). No ecosystem measurement; no data on directory review or registry takedowns |
| **Socket** | partial | two incident write-ups where malware installs or impersonates MCP (SANDWORM_MODE 2026-02-20 with the McpInject module; Mini Shai-Hulud/Miasma/Hades 2026-06-08 with MCP typosquats on PyPI); one product post (Socket MCP, 2026-06-18). Sitemap of 759 URLs: no measurement of MCP servers |
| **Koi Security** | partial | six posts, all incident or disclosure (Trust Me I'm Local 2025-04-24; postmark-mcp 09-25; mcp-runcommand-server 09-30; Figma CVE-2025-53967 10-10, an Imperva finding; PromptJacking 11-05; GlassWorm hits MCP 2026-03-16). koi.ai redirects to Palo Alto Networks; everything read through Wayback |
| **Aikido** | not found | sitemap of 928 URLs: zero slugs containing "mcp"; only product docs and one Intel advisory, not verified as research |
| **Phylum / Veracode** | not found | blog.phylum.io idle since early 2025 (Wayback); phylum.io redirects to veracode.com; Veracode's sitemap (1,086 URLs): zero "mcp" |

Other vendors with confirmed measurements: Canopii (11,524 registry servers, Jun 2026; 184 rug-pull
versions, 9.4 % of comparable pairs); AgentSeal (5,125 servers, 555 with toxic data flows); Astrix
(5,200 repos, 88 % need credentials); Endor Labs (2,614 implementations); Knostic (1,862 exposed,
119/119 unauthenticated); Trend Micro (492 exposed Jul 2025 → 1,467 Apr 2026); MCPExplorer (live
handshakes against 995 servers, 277 answered; 59 % of those expose a write tool); Backslash; Equixly
(43 % command injection, sample undeclared); OX (7,000+ servers, method undeclared). Pillar's
Deadbugz (2026-08-12) is an incident write-up (23 pull requests from one account), not a
measurement. Government: the NSA CSI (May 2026) cites Invariant/Snyk, Microsoft, Oligo, HiddenLayer
and Docker.

What does not exist: an install-time privilege census of MCP packages on npm/PyPI/Docker Hub by any
vendor; an annotations-vs-runtime comparison; precision figures from a scanner vendor about its own
scanner, beyond AgentSeal's 80–85 % for its toxic-flow classifier on 100 flows (the rest are
third-party: MCPZoo measures nine scanners, Snyk's at 28.21 % and Cisco's at 24.64 %); a regular
count of malicious MCP packages in the style of Phylum's quarterly reports (2023–2024) and Socket's
2023 npm retrospective; OAuth scopes; data from Anthropic on directory review outcomes; a
reproducible dataset of description drift across versions; transitive exposure to the SDK
advisories.

## Corrections, 2026-09-30

- Censuses: Guo et al. are of Sep 2025, and their 17,630 raw entries gave 8,401 valid, 8,060 of
  them servers; MCPZoo's 56,053 distinct is the earlier paper's (2512.15144), the later one's
  64,611 unique; Major Labs' cross-source union is its live page's scan of 2026-09-07, the Zenodo
  record a 3,227-repo census; only dend's series runs from the registry's launch; the academic
  record is of snapshots or short windows, not single registries only; PulseMCP publishes its own
  monthly series from Nov 2024; the farms' counts are the official registry's, and pipeworx tops
  three published censuses, not five.
- Declared vs actual: 59.3 % remain bound to an unmutated contract, description included; the
  MCPZoo scanners are static and dynamic, description and code; DCIChecker's no-execution sentence
  ends "against live systems"; Glama runs open-source servers only, publishes per-server findings
  and no aggregate; Connor's F1 is over 134 malicious servers and 130 benign; Zenity's plan names
  the AI supply chain, not MCP; "Staleness is not falsity" opens Bharti & Agnihotri's limits;
  behavioral-abi ran 12 of a 20-server corpus; remote servers have been probed for liveness and
  tool lists too.
- Incidents: vulnerablemcp.info stops in Feb 2026 and a later ledger in Aug 2026; ATLAS's four
  are case studies; the CSA database has had commits since 2025-07-16, no entries; 352 of NVD's
  355 name MCP; the official SDKs and Inspector have 25 advisories, not 33; LiteLLM's MCP endpoint
  is in CISA KEV too; auth0-mcp-server is not the oldest MCP-named malicious record; 31 of the 70
  npm advisories of Jul 2026 were withdrawn; FakeGit's 600+ listings span registries and
  catalogs; 17 of Deadbugz's 23 PRs added a remote server, 2 were listings; Microsoft's Copilot
  Studio case is an attack pattern, not an incident; Straiker reported one server; the "no
  reported incident" is Supabase's; GHSA lags OSSF by up to twelve and a half months; the 30+
  CVEs statistic is no longer quoted.
- Scanners: McpSafetyScanner has two commits; mcp-sec-audit reads JS/TS too; agent-scan v0.6.3
  has no proxy; Glama's count is of "such" scans; Stacklok's post says annotations were verified
  for its curated registry; SandScope's code is public on GitHub.
- Registries: only the community Claude Code plugins are scanned before listing; the comparisons
  cover GitHub's list and mention takedowns; OX "poisoned" 9 of 11 registries, the "benign PoC
  … without review" being the CSA note's account; #1488's 62 serve an HTML page; Hasan et al.
  describe Glama and Smithery in one sentence.
- Vendors: Snyk's 4,524 is on its report page; the Security Best Practices page is the MCP
  project's; AgentSeal's 555 are servers with toxic flows, MCPExplorer's 59 % is of the 277 that
  answered; Deadbugz is an incident write-up; AgentSeal reports its own classifier's precision;
  Phylum's reports were quarterly and Socket's an annual npm retrospective; Aikido published worm
  write-ups that list MCP packages.
