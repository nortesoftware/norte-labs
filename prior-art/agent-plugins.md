# Agent plugins — prior art

Sweep of 2026-09-15/16. The question: the AI coding assistants ship their own extension and
plugin marketplaces — Cursor's plugin Marketplace and its VSIX gallery, Windsurf's, Continue's
Hub, Zed's extension registry — and a plugin there is handed the same privilege as the editor
and the agent: hooks that run as processes, MCP servers started on the developer's behalf,
language servers downloaded at first use, extension code in the host process. norte-labs
already traced what 600 MCP server packages do at install and first start
([../measurements/mcp-install/](../measurements/mcp-install/)). **Has anyone already done that
for these populations?**

Scale: exists / partial / not found. "Not found" means "these searches were run"; the list is in
the appendix [agent-plugins-sources.md](agent-plugins-sources.md), together with every verified
source (URL, date, verbatim figures, sample, limitations).

## Population, corrected

Three of the four names in the question do not denote what they did when the question was
written. Established by direct probes on 2026-09-15/16 (details and counts in
[../registries/agent-plugins/](../registries/agent-plugins/)):

- **Cursor** has two marketplaces. The plugin *Marketplace* (cursor.com/marketplace, launched
  2026-02-17): a plugin is a git repository bundling rules, skills, agents, commands, MCP servers
  and hooks, with a manifest `.cursor-plugin/plugin.json` or the "Agent Plugins" standard's root
  `plugin.json`. An unauthenticated catalogue endpoint returns the whole marketplace: 330
  approved plugins from 240 publishers on 2026-09-16, all on GitHub, 324 pinned to a commit
  SHA, 271 declaring MCP servers (320 entries), 66 first-party; created 2026-02-07..09-15 at
  36 / 48 / 34 / 24 / 29 / 25 / 93 / 41 a month. Curated and manually reviewed. Separately, the
  VSIX gallery behind `marketplace.cursorapi.com` proxies Open VSX (asset paths under
  `/open-vsx-mirror/`) plus Anysphere's own rebuilds, "with automated malware and supply-chain
  analysis using commercial security tooling"; it is not enumerable. Cursor is a paying customer
  of Eclipse's managed Open VSX registry.
- **Windsurf** was renamed Devin Desktop by Cognition on 2026-06-02. `marketplace.windsurf.com`
  is a passthrough of open-vsx.org (mirrored since v1.7.1, 2025-04-25): identical `totalSize`
  (17,884), identical newest entry, same server version, download URLs on open-vsx.org; the
  only extension control on top of it is a server-driven deny list (v2.1.29, 2026-04-29). In
  June 2026 (v3.2.16) it gained a plugin system of the Cursor shape — git repositories with a
  `.devin-plugin/plugin.json` (falling back to `.claude-plugin/plugin.json` and the Agent
  Plugins root `plugin.json`), bundling `hooks.json` and `.mcp.json`, hooks "best effort and
  fail open" — with a marketplace repository `CognitionAI/devin-marketplace` (created
  2026-08-31, 171 plugin directories) and no review statement. The MCP plugin store has no
  public listing.
- **Continue** was acquired by Cursor (announced 2026-06); the repository's README reads "no
  longer actively maintained and is read-only", the final release was 2026-06-19,
  `hub.continue.dev` redirected to continue.dev on 2026-01-30 and no longer resolves. The
  population is historical only.
- **Zed**: `zed-industries/extensions`, 1,474 entries in `extensions.toml` on 2026-09-16;
  extensions are WASM added by pull request as git submodules, compiled by Zed's CI; among the
  1,000 the API exposes, 58 are context servers (MCP) and 259 language servers, which the
  extension downloads at first use. Zed and JetBrains also share the **ACP Registry**
  (`agentclientprotocol/registry`, since 2026-01-28): 41 coding agents distributed as `npx`,
  `uvx` or binary pointers (22 / 2 / 19), versions bumped hourly by a cron job with no human
  review, each agent launched by CI in a per-agent directory and quarantined on failure — eight
  on 2026-09-16, one of them for "Postinstall script". A registry-run install check, exactly
  the shape of the measurement, and itself unmeasured.
- **Open VSX** (Eclipse Foundation, 17,884 extensions) is therefore the VSIX population of both
  Cursor and Windsurf, and the population most of the prior art below is about. VS Code 1.113+
  itself installs Agent Plugins-standard and Claude-format plugins from arbitrary git
  marketplaces behind a caution, so the plugin population now has four unvetted consumers.

## Summary

| topic | verdict | in one line |
|---|---|---|
| registries | **partial** | every operator documents its own policy; no inventory or comparison puts them side by side; only Microsoft and Eclipse publish takedown data |
| census | **partial** | Microsoft's marketplace counted three times for security papers; Open VSX by its operator's headlines and two third-party indexes; Zed by community directories; Cursor plugins only through their own catalogue endpoint; concentration, growth and overlap nowhere |
| install-time and first-run behaviour | **partial** for VS Code extensions (one 2023-snapshot study, network-level, hand-driven, prefiltered subset); **not found** for Open VSX as a population, Cursor plugins, Windsurf, Zed, Continue |
| declared vs actual | **partial** | the declared side is documented by the vendors themselves (VS Code and Cursor plugins have no permission model; Zed has one, user-granted with wildcard defaults); nobody joins a declaration to a runtime trace for these populations |
| incidents | **exists** for Open VSX and the Microsoft marketplace, richly; **not found** for Cursor plugins, Zed, Continue Hub, the Windsurf store; no cross-marketplace inventory records vector, downloads or takedown latency |
| scanners | **exists** for VS Code / Open VSX, crowded and static; no published precision for any of them; nothing covers Cursor plugins or Zed |
| vendors | **partial** | Microsoft publishes a removal log and one review count; Eclipse publishes incidents, its scanner configuration and a blocklist; Cursor, Cognition, Zed and Continue publish policy text and no figure |

## Is it taken?

**Static scanning of VS Code and Open VSX extensions, yes.** Koi/ExtensionTotal, Socket (with
Secure Annex), Aikido, ReversingLabs, VSCan, Trail of Bits, Checkmarx, Wiz and the operators'
own pipelines (Open VSX's publish-time checks since 2026-03, Microsoft's antivirus pass) all
scan the same VSIX population; three academic corpora (25,402 / 27,261 / 52,880 extensions) and
a malicious-extension dataset (VSMEx, 2,202 flagged) cover it too. Nobody publishes a precision
figure for any of these, but the angle is occupied.

**The Open VSX incident record, yes.** From the fake Solidity extensions that took USD 500k from
a Cursor user (Kaspersky, 2025-07) through the token leak (CVE-2025-6705), TigerJack, GlassWorm
waves 1–5, Trivy and Nx Console (CISA KEV) to Manifold's 77 evil twins (2026-08), every incident
is written up at a primary source, with counts and, twice, takedown latency.

**What is not taken** is the measurement in the concrete form the instrument gives it:

1. **What a plugin or extension does at install and first run, traced at the OS boundary, for
   a stated sample of a stated population.** The closest published work is Edirimannage et al.
   ([2411.07479](https://arxiv.org/abs/2411.07479), preprint): 52,880 Microsoft-marketplace
   extensions crawled Jul–Oct 2023, of which 2,698 selected by a static prefilter were run by
   hand in an instrumented VS Code 1.80 behind mitmproxy, network and VS Code API calls only;
   it found 12 unconsented binary downloads, 46 trackers, 78 extensions sending code to an LLM.
   No syscall trace, no `$HOME`, no random sample, no Open VSX, and a snapshot older than every
   incident above. Agrawal (2025) ran 25 extensions. Microsoft states that every incoming
   package "gets checked for malicious run-time behavior in a sandbox environment" and publishes
   nothing from it; Koi, Extuno and Manifold sell the observation and publish no rate.
2. **Cursor Marketplace plugins, Devin marketplace plugins, Zed extensions**: no study of any
   kind, static or dynamic, academic or industrial, measures these populations. Zero hits in
   arXiv, OpenAlex, Crossref, OpenReview and the 2025–2026 proceedings for "Cursor Marketplace",
   "Zed extensions" or the Windsurf store; in industry, policy text and n=1 incidents. For Zed,
   the two things a trace would characterise — which extensions exercise `process:exec` and
   what they download at first use — have been open user complaints since 2024 (#12589) and a
   capability-bypass bug in 2026 (#55533, n=8).
3. **Declared vs observed**, with the manifest as the declaration: Zed's `extension.toml`
   capabilities against the trace; Cursor's `plugin.json` components (and the vendor's "No
   binaries are shipped") against what the hooks spawn; VSIX `activationEvents`/`contributes`
   against the extension host. The method exists for agent skills (BIV: 49,943 skills, "80.0 %
   deviate from declared behavior"; ASE 2026: 17,022 skills in a sandbox with mock credentials)
   and has not been applied to IDE extensions or plugins.
4. On the registries: whether Cursor's manual review and Open VSX's publish-time checks catch
   anything (no rejection count from either; Open VSX's own maintainers say of the enforced
   checks that "the false positive rate is too high, it cant be really be enforced"); review
   latency; whether Open VSX takedowns propagate to Cursor's proxy and to Windsurf's
   passthrough; a census of Open VSX with publisher concentration and its overlap with the
   Microsoft marketplace. The ledgers to do it with are public and unanalysed: Open VSX's
   git-tracked blocklist, its `version-changes` feed (317,161 events walked in this sweep,
   ~2,060 REMOVED version events on 348 extensions since 2026-08, no reason field), the ACP
   registry's `quarantine.json`, Microsoft's removal log.

**Where the instrument transfers as is.** A Cursor or Devin plugin installs by `git clone` and
executes nothing until an event fires a hook or the agent starts a bundled MCP server; both are
`npx`/`uvx`/script invocations, exactly the population mcp-install traced, with the hook's
command and the MCP server's `command`/`args` taken from the manifest instead of the registry.
Cursor's catalogue pins 324 of 330 plugins to a commit, so the corpus is reproducible by
construction. The 41 ACP agents and Zed's context-server extensions start the same way. What
needs a new arm is the VSIX: install is an unzip, and the behaviour lives in activation inside
the extension host, so the sandbox must run a headless Code-OSS or Cursor with the extension
installed — the setup Edirimannage built, with strace around it.

**Window.** The TU Delft/ReversingLabs group (VSMEx, SECRYPT 2026) names "incorporating dynamic
analysis to capture runtime behaviors" as future work and holds the VSIX corpus; Purdue's
Software Dark Matter authors hold the top-3,000 Open VSX `.vsix`; Red Hat's Scanning the Harness
authors hold 3,171 Cursor/Claude Code/Windsurf configuration corpora and say the layer has "no
install-time check"; Zenity showed skill detonation at Black Hat USA 2026; Datadog ships an
extension-host instrument (IDE Shepherd) that runs in Cursor, without a corpus; Yeeth Security
wrote Open VSX's pre-publish scanners and triages "50–100" submissions a day down to "3–5"
alerts, and publishes verdicts per incident, not per population. Five groups are one step away
and none has taken it.

## Method and limits

Seven topics × four search modalities (academic: the arXiv API, OpenAlex, Crossref, OpenReview,
Google Scholar and the 2025–2026 proceedings of USENIX Security, S&P, CCS, NDSS, ICSE, FSE, MSR,
ASE, ACSAC, PETS, ESORICS, SANER, ICSME; industry: vendor research, operator blogs, talks,
newsletters; code and data: GitHub, the registries' own APIs and repositories, Zenodo, Hugging
Face, Kaggle; advisories: NVD, GHSA, OSV, press, Hacker News, the Cursor forum and the Zed and
Open VSX issue trackers). Every source was opened and marked confirmed / partially confirmed /
refuted / unreachable; each topic was then searched again for what was missing (2026 venues,
standards bodies, other languages, primary sources for second-hand figures, the operators' own
changelogs, legal texts and issue trackers, adjacent framings) and those finds were opened the
same way. Result: 485 verified supporting sources (292 confirmed, 193 partially confirmed — the
appendix says what differed — none refuted), 1 unreachable, 14 from the second search left
unopened, 2,292 recorded searches.

Limits: most modalities ran on direct APIs (arXiv, OpenAlex, Crossref, GitHub, NVD, HN Algolia,
Wayback CDX) and direct fetches rather than on a search engine; DuckDuckGo, Bing, Brave,
Startpage and Mojeek served bot challenges to this host, and the
German/Spanish/Chinese/Japanese/Korean searches produced only re-reporting of English incident
news. ACM DL and IEEE Xplore 403 (metadata through Crossref and OpenAlex; the CODASPY 2026 VSMEx
figures come from the authors' repository); Semantic Scholar 429; DBLP behind an anti-bot page;
Koi Security's posts redirect to Palo Alto Networks and were read through the Wayback Machine;
Secure Annex's posts are JS-only shells; blackhat.com, visualstudiomagazine.com, medium.com and
reddit.com 403; `marketplace.cursorapi.com` is not enumerable (its `TotalCount` echoes the page
size); `api.zed.dev/extensions` caps at 1,000 rows (the registry count comes from
`extensions.toml`); the archived Continue Hub documentation was recovered from the docs
repository's git history.

---

## 1. Registries and catalogs

**Question.** Which marketplaces exist for these assistants, who operates them, what review
happens before and after listing, does the operator build or run the code, how many entries?
Has anyone inventoried or compared them?

**Verdict: partial.** Each operator documents its own policy; the inventory had to be assembled
here ([../registries/agent-plugins/](../registries/agent-plugins/)). What the operators say, in
their words:

- **Cursor Marketplace**: "Every plugin is manually reviewed before it's listed. All plugins
  must be open source, and we review each update before publishing"; "we work with a small
  group of trusted partners"; "No binaries are shipped" — while the same documentation defines
  hooks as spawned processes and the reference layout ships hook scripts. Forum staff: the
  review is manual, took "a week or so" (2026-04), has no status page, and by 2026-07
  submissions were being redirected to the community directory cursor.directory, which is not
  reviewed. Plugins auto-update after review. No count, no rejection or removal figure.
- **Cursor's VSIX gallery**: Open VSX behind `marketplace.cursorapi.com` since the 2025-06-25
  announcement, with a blocklist, a verification badge, optional signature verification and an
  install cooldown, and "automated malware and supply-chain analysis using commercial security
  tooling" (vendor unnamed). One forum report (2026-07-23) of a namespace-squatted Open VSX
  extension delivered through the gallery's auto-transfer "after hundreds of installs"; Mazin
  Ahmed's canary extension (2025-12) was "marked safe".
- **Open VSX**: until January 2026 it "relied primarily on post-publication response"; a
  publish-time Security Check Framework (PR #1529, 2026-02-06: gitleaks-rule secret detection,
  SHA-256 blocklist, namespace similarity, malicious-zip check, remote scanners — ClamAV, YARA,
  Argus) ran in monitor mode in February and enforced from 2026-03-04 with quarantine; Koi found
  it failing open (reported 2026-02-08, fixed 02-11); versions became immutable in 1.1.0
  (2026-08-02). The operator does not build extensions (the `publish-extensions` CI that does,
  for a subset, was the vector of CVE-2025-6705). Its blocklist is public and git-tracked:
  `extension-control/extensions.json`, 944 malicious identifiers on 2026-09-16, up from 1 in
  2024-03 — an unannounced takedown series, identifiers only, no version, no date, no reason.
  No count of quarantined or rejected uploads; the "scan decision dashboard" is admin-only
  (openvsx#1949). What is public instead: the Alpha-Omega monthly reports of the Eclipse
  engagement (13 / 29 / 21 / 13 malwares processed, Aug–Nov 2025), a Hall of Fame of nine
  reporters, 74 publisher "under review" complaints in the 2026 issue tracker, and, since 1.1.0,
  an append-only `version-changes` feed meant "for security scanners" — walked in full during
  this sweep: 317,161 events, ~2,060 REMOVED version events on 348 extensions since 2026-08,
  no reason field. Before 2025, in Milinkovich's words, the model was "if you see something
  weird, let us know and we'll take it down". The two public kill lists barely overlap:
  Microsoft's 283 identifiers and Open VSX's 944 share 9.
- **marketplace.windsurf.com**: a passthrough of open-vsx.org (see above) with a server-driven
  deny list on top; Cognition publishes no review statement for it, for the MCP store or for
  the Devin plugin marketplace beyond a per-install "security notice", "best effort and fail
  open" for hooks, and a liability disclaimer; Koi, on the recommended-namespace squat:
  "Windsurf never responded".
- **ACP Registry** (Zed and JetBrains): a pull request adds an `agent.json`; "As soon as it's
  merged, it will be immediately available in all clients"; "Agent versions are automatically
  updated via a cron job that runs hourly ... and commits updates directly to `main`"; "All
  agents are verified via CI to ensure they return valid `authMethods` in the ACP handshake" —
  the verifier installs and launches every agent in a per-agent directory (`npx`, `uvx` or a
  binary download) and a daily protocol matrix re-runs them; failures go to `quarantine.json`
  (8 of 42 on 2026-09-16: "Postinstall script", "Missing npm dependency", "Timeout after 120s
  waiting for initialize response", ...). Preview distributions "are never launched or
  auth-checked". No security review is stated; the check is functional, and it is the only
  registry in the population that runs what it lists before listing it.
- **Zed**: a pull request adds a submodule and an `extensions.toml` entry; review is human
  ("most submissions get their first feedback within a few weeks ... up to one or two months";
  "not all of them make the cut"); CI compiles and packages the WASM (Zed is the only operator
  that builds the artefact it serves), checks sorting and LFS, runs a Danger lint; no malware
  scanner; "There isn't a formal third-party audit process yet". Removals are pull requests
  (30–40 since 2024-11 by three counts, all deprecation, dead upstream or author request; a `remove-extension`
  workflow since 2026-09-11); acceptance is derivable (4,898 merged against 1,751 closed
  unmerged) and unpublished.
- **Continue Hub**: "Public: Anyone can discover and use"; no review statement in the archived
  documentation; gone.
- Adjacent, for scale: the Microsoft marketplace (138,986 extensions for the VS Code target by
  `extensionquery`; a removal log since 2025-02-26 with 2,021 rows and a reason each — 1,071
  impersonation, 540 malware, 260 untrustworthy, 105 spam — and one review count, "reviewed 136
  extensions for malicious code and removed 110", 2025-06); Gemini CLI's gallery (1,852,
  "Google does not vet"); Claude Code plugin marketplaces (2,018 marketplaces / 8,351 plugins
  in Hereiz et al., [2608.28497](https://arxiv.org/abs/2608.28497)); Cline (199, issue-based
  team review); JetBrains, whose Plugin Verifier "was architected as a compatibility and
  API-usage checker rather than a dedicated data-flow or anti-malware scanner".

What does not exist: a side-by-side policy inventory (the closest are Wiz's two-column Open VSX
vs Microsoft table, 2025-10, one sentence in a CSA note, "Each marketplace operates its own
plugin review process", and an OWASP Agentic Skills Top 10 platform comparison whose Cursor row
contradicts Cursor's own documentation and cites nothing); rejection rates or review latency
from any operator; takedown counts
from Cursor, Zed, Cognition or Continue; whether Open VSX takedowns reach Cursor's proxy and
Windsurf's passthrough (TigerJack "remain[ed] fully operational in the OpenVSX marketplace" after
Microsoft removed it; TRAE is reported to mirror Open VSX without syncing takedowns); any
academic examination of Open VSX, Zed or the Cursor Marketplace as registries.

## 2. Census

**Question.** Does anyone count these populations — extensions, publishers, concentration,
growth, the overlap between Open VSX and the Microsoft marketplace, what Cursor and Windsurf
users actually install?

**Verdict: partial.**

What exists:

- The Microsoft marketplace, three times for security papers (UntrustIDE, NDSS 2024: 43,436
  crawled in 2023-01; Protect Your Secrets, SANER 2025: 48,692; Edirimannage et al.: 52,880,
  2023-07..10) and twice by industry: ExtensionTotal (2024-06: "~60,000 extensions from ~45,000
  different publishers where only 1,800 of them are verified", median 500 installs) and a
  CC BY dataset of 2026-08 (64,464 extensions / 50,446 publishers; the top 1 % hold 87.4 % of
  installs; 86.1 % of publishers have one extension; self-described as head-biased, "not a
  census").
- Open VSX, by the operator's headline series: "over 2,500 extensions from over 1,600
  different publishers" (2023-02), "more than 7,000 ... nearly 5,000 ... more than 110 million
  downloads each month" (2025-12), "more than 10,000 ... over 6,500", 300 M downloads a month
  (2026-03), "12,000+ ... 8,000+" (2026-04), 600 M a month and "nine thousand publishers"
  (2026-06). None states what an "extension" is; the API's `totalSize` on 2026-09-16 is 17,884.
  Two third-party indexes count it continuously and nobody has analysed them: ecosyste.ms
  (20,076 packages, 185,871 versions, 13,274 maintainers, 14,562 namespaces, indexed since
  2025-09-24, with a removal check) and VSX Pulse (hourly since 2026-05-29: 18,578 extensions,
  18,464 with downloads in 30 days, 99 categories). The operator's issue tracker is an
  unanalysed publisher-verification dataset (10,337 namespace claims, 8,685 granted, 347
  denied). The per-consumer breakdown that would say how much of the traffic is Cursor and
  Windsurf exists only in the operator's logs (issue #9668) and one sentence, "Cursor ... drives
  significant traffic"; the consumers named by the operator are Kiro, Cursor, Antigravity,
  Windsurf, VSCodium, Project Bob, Trae and Ona. Per-publisher statistics sit behind the admin
  `/admin/report` endpoint (issues #235, #487). Editor share, for scale: Stack Overflow 2025
  gives Cursor 17.9 %, Zed 7.3 %, Windsurf 4.9 %; the Rust survey 2025 gives Zed 18.6 %.
- The Open VSX–Microsoft overlap has never been published; the data to compute it is public
  (`nix-community/nix-vscode-extensions` caches both galleries daily; `kleinicke/ovsx-statistics`
  commits Open VSX snapshots). A one-off derivation during this sweep, unverified: 19,351 Open
  VSX identifiers, 14,553 of them also on Microsoft (75.2 %); 12.1 % of 119,861 Microsoft
  identifiers are on Open VSX.
- Zed, by community directories only (awesome-zed-extensions: "1446 extensions tracked",
  themes 672 / languages 490 / tools 133; gh-packages-zed: 1,776 tracked including 502 found by
  GitHub topic; zedext.dev "1.1k"); the registry's git history makes the growth curve trivial
  (221 → 431 → 663 → 909 → 1,302 → 1,474 at half-year marks, derived here) and nobody has drawn
  it; no publisher concentration.
- Cursor Marketplace: no published count. Launch (2026-02-17) with "a highly curated set from
  partners", "over 30 new plugins" (2026-03-11); a community capture of 2026-08-12 lists 219
  in-app plus 5 public-only. The catalogue endpoint answers the question in one call (330 /
  240 publishers / 271 with MCP servers, above) and nobody has published it; the composition
  (share with hooks, what the hooks run) is uncharacterised.
- Devin marketplace: 171 plugin directories in the repository; 97 public `.devin-plugin`
  manifests by GitHub code search; no count published.
- Continue Hub: never counted, not even at launch (2025-02-26).
- Adjacent: Claude Code marketplaces (Hereiz et al.: 2,018 / 8,351, 2026-04, "generalisation to
  Cursor remains untested"); the community `marketplace.json` lists 2,281 plugins; GitHub code
  search returns 8,432 hits for the agent-plugins.org schema, 2,388 `.cursor-plugin/plugin.json`
  and 3,280 `gemini-extension.json`; agent-skill registries have been censused four times
  (40,285; 42,447; 98,380; 238,180 skills).

What does not exist: publisher concentration and verified-namespace share on Open VSX (a one-off
reading of the API during the sweep, unverified: 68.3 % of extensions under a verified namespace,
taking 98.4 % of downloads); growth of extensions (not downloads) on Open VSX; the overlap; the
per-IDE install share; a published Cursor Marketplace composition; any snapshot dataset of Open
VSX, Zed or the Cursor Marketplace on Zenodo, Hugging Face or Kaggle (the one Hugging Face
dataset of "AI agent extensions" is gated). The gap is analysis, not data: the census of Cursor,
Zed and Open VSX is an afternoon's work from public endpoints and is a by-product of the
tracing measurement, not a contribution. The academic record alone would reach *not found* for
all four target populations.

## 3. Install-time and first-run behaviour

**Question.** Has anyone traced, for a corpus with a stated sample, what these extensions and
plugins do when installed, activated or first run — network, telemetry, `$HOME`, credentials,
install scripts, hooks, binaries downloaded, MCP servers started — dynamically rather than by
reading the code?

**Verdict: partial** for VS Code extensions in general; **not found** for Open VSX as a
population, Cursor plugins, Windsurf, Zed and Continue.

What exists, dynamic:

- Edirimannage et al., *Developers Are Victims Too* ([2411.07479](https://arxiv.org/abs/2411.07479),
  2024-11, preprint, no Crossref record): 52,880 Microsoft-marketplace extensions crawled
  2023-07-15..10-16; a static prefilter selected 2,698, executed manually in an instrumented VS
  Code 1.80 that "capture[d] all VS Code API calls", behind mitmproxy, "during both the
  installation and execution phases". Reported: "~5.6 % of the analyzed extensions have suspicious behavior"; 12 unconsented
  binary or tool downloads; 46 trackers, 28 undisclosed; 108 extensions sharing code, 78 sending
  it to an LLM; "the absence of any sort of permission in VS Code keeps developers completely in
  the dark". Network and API level, not syscalls; no file or credential dimension; not a random
  sample; artefacts partly on Google Drive.
- Agrawal (NHSJS, 2025-11): 25 trending extensions in a logging-only in-process sandbox with
  manual interaction, 377 profiled statically; 4.13 % of calls seen only dynamically; no
  per-extension network or telemetry result.
- Operators and vendors that run the observation and publish no rate: Microsoft ("dynamic
  detection ... in a sandboxed environment (clean room VM)" for every incoming package; a
  researcher evaded it by geofencing in 2025-12); Koi ("watches what extensions actually do
  during installation"; "risk engine flagged ... suspicious behavioral changes"); Extuno
  (micro-VM); Manifold ("our monitoring systems"); Socket ("scans ... for activation behavior,
  file system access, native code, network requests"); CrowdStrike (sinkhole telemetry for
  GlassWorm). Instruments without a corpus: Datadog's IDE Shepherd (hooks `http`,
  `child_process`, `fs` inside the extension host), JavaSith ([2505.21263](https://arxiv.org/abs/2505.21263),
  case studies), red-widow (per-package Node harness, "not an operating-system or VM sandbox").
- Per-incident reverse engineering: Manifold's 77 evil twins with activation-time timing;
  Socket's 73 sleeper extensions; Koi's MaliciousCorgi (n=2); the Nx Console breach (~6,000
  activations by vendor telemetry, one from Cursor).

What exists, static, at corpus scale — the population is the same VSIX that Cursor and Windsurf
serve, so it is the prior art to position against: UntrustIDE (25,402, CodeQL, 21 verified
exploitable); Protect Your Secrets (27,261; "8.5 % ... exposed to credential-related data
leakage", FP 6.98 %); Dissecting Malicious VS Code Extensions (SECRYPT 2026: 262 malicious,
"66.79 % ... not flagged by any antivirus engine on VT", random-forest F1 0.841, and "incorporating
dynamic analysis to capture runtime behaviors" as future work); VSMEx (CODASPY 2026, 2,202
flagged / 4,522 VSIX captured); ExtensionTotal 2024 (8,161 extensions with hard-coded IPs,
1,452 running unknown executables); Wiz 2025-10 (550+ secrets in 500+ extensions, 30+ of them
Open VSX access tokens, 100,000+ installs); Socket ("491 such Open VSX IDs over the previous
year, including 338 in 2026"); Software Dark Matter ([2606.13966](https://arxiv.org/abs/2606.13966),
the only academic measurement of Open VSX: top ~3,000 by downloads, 1,249 analysed, undeclared
bundled npm packages, "a conservative lower bound restricted to the observable fraction of the
registry").

What exists for the target populations: nothing that executes them. The vendors' own 2026
sandboxes (Cursor 2026-02-18, Zed 2026-08-05) confine the agent's terminal commands only; Zed
states that "LSP and MCP servers" are outside it. The ACP registry's CI installs and launches
its 41 agents and quarantines one for a "Postinstall script" — the only operator in the
population that observes an install, and it records pass/fail, not behaviour. Cursor plugins —
policy text, a staff forum reply on update mechanics, and one incident (Vercel's plugin
shipping telemetry hooks, confirmed by Cursor staff); the nearest academic item is HookPry
([2609.03884](https://arxiv.org/abs/2609.03884), 2026-09), which exploits hook updates in Claude
Code, OpenClaw, OpenHarness and Codex plugins built by the authors, and Scanning the Harness
([2609.07360](https://arxiv.org/abs/2609.07360), Red Hat, 2026-09: 3,171 GitHub repositories,
hooks in 6.8 % of setups, "decidable from bytes", static). Windsurf — Bitdefender's R extension
(2026-03, n=1). Zed — a 2024 Hacker News thread where a co-founder concedes unconsented
language-server downloads, and issue #12589, open since 2024. Continue Hub — nothing, ever.

The method itself is published, for agent skills: *Do Not Mention This to the User* (USENIX
Security 2026: 98,380 skills, static plus dynamic verification, 157 confirmed malicious, all
removed after disclosure); the ASE 2026 credential study (17,022 skills in a sandbox with mock
credentials); MalSkillBench (strace and inotifywait in Docker, 703 wild samples); SkillDetonate
(sandbox with OS-boundary taint, 97 % detection at 2 % false positives); Zenity's AI Total
(Black Hat USA 2026, "tens of thousands" of skills detonated). Different population, same
instrument shape; none has crossed to IDE extensions or plugins.

What does not exist:

- An install-time and first-run trace at the OS boundary (files, `execve`, `connect`, DNS) of a
  seeded random sample of Open VSX, of the Cursor Marketplace, of the Devin marketplace or of
  Zed's registry; nobody has run a Cursor plugin's hooks or a Zed extension's first-use
  downloads under observation and reported a rate.
- Any dynamic study newer than the 2023 snapshot, i.e. any that postdates GlassWorm, the
  Open VSX publish-time checks and the Cursor Marketplace.
- What the bundled MCP servers of plugins do at first start (mcp-install's arm two, applied to
  the plugin population).
- Telemetry and `$HOME` access as population rates for any of these; the only figures are
  incident counts.

## 4. Declared vs actual

**Question.** Has anyone compared what these artefacts declare (VSIX `activationEvents` and
`contributes`, Zed's `extension.toml` capabilities and `provides`, Cursor's `plugin.json`
components, the Agent Plugins manifest) with what they do at runtime? Is there a permission
model at all?

**Verdict: partial.** The declared side is answered by the vendors; the join is open.

The declaration models, in the vendors' own words:

- VS Code, and therefore Cursor's and Windsurf's VSIX: none. "The extension host has the same
  permissions as VS Code itself"; the request for permissions and sandboxing (microsoft/vscode
  #52116) has been open since 2018 and was last updated 2026-09-12; a 2026-05-05 proposal for
  "Mandatory capability declarations in package.json" (#314552) has no comment and no label;
  the 1.97 trusted-publishers prompt is trust in a publisher, not a capability; since 1.74 most
  activation events are implicit.
- Cursor plugins: components only; the one control is "respect your MCP allowlist and
  blocklist"; hooks are arbitrary spawned processes.
- The Agent Plugins standard: "v1.0.0 does not define a trust model, permission system, or
  sandboxing requirements for plugins".
- Zed: the one target with a capability model. `process:exec` must be declared in
  `extension.toml` and granted; `download_file` and `npm:install` are granted by user setting
  with wildcard defaults (`granted_extension_capabilities`, PR #39472, 2025-10-03). A 2026-05
  issue (#55533) documents the gate silently bypassed for every extension built against the
  0.1.x API — the closest thing to a declared-vs-enforced finding, at n=8. GitHub code search
  finds ~149 `extension.toml` declaring `process:exec`; the registry API exposes `provides` but
  not capabilities, so nobody knows how many of the 1,474 declare it, let alone exercise it.

What exists as comparison:

- For VS Code, Edirimannage et al. report extensions "performing actions well beyond their
  advertised scope" (~5.6 % suspicious) without diffing manifest against trace; Agrawal
  derived least-privilege policies from 25 extensions (static profiling "captured 95.9 % of
  permissions required"); David (2021, thesis, unretrievable) emulated a permission system on
  56 extensions.
- For Open VSX, Software Dark Matter compares declared `package.json` dependencies with
  shipped files (1,249 extensions) — dependency-level, static.
- Static manifest-versus-code checks in tools (vsix-audit: "theme with code"; ExtGuard: "what
  each manifest reveals about reach, and what the shipped code actually calls";
  extension-guard) with no population rate.
- Incident-level: Manifold's 77 Open VSX evil twins whose listings said "anonymous usage
  metrics" and "CI values never leave the machine" while 19 exfiltrated CI repository
  identifiers; TigerJack, "works as advertised but secretly runs a CoinIMP miner"; Mazin Ahmed's
  canary showing Microsoft's sandbox pinging back from a Microsoft ASN and "no security checks at
  all being performed within Open VSX".
- For agent skills, the method in full: BIV ([2605.11770](https://arxiv.org/abs/2605.11770):
  "typed set comparison between declared and actual capabilities", 49,943 OpenClaw skills,
  "80.0 % of skills deviate from declared behavior"); the ASE 2026 credential study
  ("cross-referencing developer intent against runtime behavior", 17,022 skills).

What does not exist: any corpus-scale comparison of a declaration with a runtime trace for VSIX,
Zed extensions or Cursor plugins; any dataset of runtime traces of them; how many Zed extensions
declare `process:exec` versus exercise it; whether Cursor's "No binaries are shipped" holds
against what the hooks spawn; whether Open VSX extensions' `activationEvents` bound what runs at
activation.

## 5. Known incidents

**Question.** Which incidents are documented at primary sources, with date, vector, count,
downloads, operator response and takedown latency? Is there a maintained inventory?

**Verdict: exists** for Open VSX and the Microsoft marketplace; **not found** for the Cursor
Marketplace, Zed, Continue Hub and the Windsurf store; no inventory records the fields asked.

The record, Open VSX and the marketplace it mirrors (all at primary sources, dates in the
appendix): the fake Solidity extensions targeting Cursor (Kaspersky, 2025-07: 54,000 inflated
downloads, USD 500k stolen, removed 2025-07-02) and the wider WhiteCobra campaign (16 on Open
VSX); CVE-2025-6705, the `publish-extensions` CI token (Eclipse: 65 extensions / 81 versions
audited and deactivated, none found compromised); Wiz's secrets study (30+ Open VSX tokens
among 550+ secrets); TigerJack (Koi: 11 extensions, 17,000 installs, "remain fully operational
in the OpenVSX marketplace" after Microsoft's removal); GlassWorm waves 1–5 (Koi 2025-10; Socket
and Aikido 2026-03/04 with 72- and 73-extension clusters; CrowdStrike's takedown 2026-05-26;
123 extensions with wave attribution in glassworm-hunter; Eclipse disputing the 35,800-download
figure and closing its incident 2025-10-21); the oorzc account compromise; Trivy 1.8.12
(CVE-2026-28353) and the Checkmarx extension (TeamPCP, 2026-02/03); Nx Console 18.95.0
(CVE-2026-48027, CISA KEV: 18 minutes on the Microsoft marketplace, 36 on Open VSX after its
scanning was in force, "passes the automated verification from Microsoft", ~6,000 activations
and GitHub's 3,800-repository breach downstream); Manifold's 77 evil twins (2026-08); Koi's
recommended-namespace squat across Cursor, Windsurf and Antigravity (Cursor fixed it, "Windsurf
never responded"); Pillar's Rules File Backdoor (2025-03; Cursor: "not a vulnerability");
Bitdefender's Windsurf R extension (2026-03-18, the first Windsurf incident-response primary;
registry unnamed); the Open VSX scanner failing open (2026-02); and, from Yeeth Security,
which writes Open VSX's scanners, some thirty further write-ups (28 evil twins in 2026-08;
GhostDrop, 174 accounts; PackRAT, `extensionPack` indirection, 95,073 downloads; multi-IDE
VSIX droppers naming Cursor and Windsurf). Takedown latency at a primary source exists exactly
for Nx Console (above), two Open VSX issue threads (a fake `solidity` reported 2025-11-25
23:24Z, publisher removed 14:34Z the next day; a `kilocode-ai` impostor, ~4 h), and, adjacent,
JetBrains' own report (15 malicious AI plugins from 7 accounts, ~70,000 installs, taken down in
a day, remote kill-switch).

Inventories: Microsoft's `RemovedPackages.md` (2,021 rows since 2025-02-26, date and reason,
no narrative, Microsoft only) and the editor's kill list (283 malicious identifiers); Open VSX's
`extension-control/extensions.json` (944 identifiers, no version, date or reason — it cannot
express the Trivy or Nx version-level compromises, which are absent from it); OSV's VSCode
ecosystem (21 records against 100+ GlassWorm extensions named by Koi and Socket alone); Trail
of Bits' vsix-audit blocklist (94 entries, 14 campaigns, last updated 2026-02-06);
glassworm-hunter (123); VSXSentry (2,229 = Microsoft's list + 152 curated); VSMEx (Microsoft's
lists only). Academically, the only incident inventory is VSMEx; the GlassWorm paper
([2608.02695](https://arxiv.org/abs/2608.02695)) studies the downstream GitHub force-push
campaign, not the extensions.

Not found: any malicious listing in Zed's registry (its 30–40 removal pull requests since
2024-11, by three counts, are housekeeping; its only security records are two extension-installer
CVEs, CVE-2026-27800 and CVE-2026-27976, fixed in 0.224.4 and absent from the release notes, and
a third WASI sandbox fix in 2026-08 noted only in release notes), in the ACP registry, in the
Cursor Marketplace ("we remove it from the marketplace immediately" is the whole policy; Koidex
gates 1,795 Cursor and 4,292 Windsurf report pages), in Continue Hub, or in the Windsurf store;
a cross-marketplace inventory with vector, downloads and latency per incident (CERT-EU's monthly
briefs record the figures but are general; the OWASP skills timeline carries figures — Cursor
756 / VS Code 1,089 — that are not in the Snyk primary it cites). Adjacent and dense: ClawHavoc
(341 of 2,857 ClawHub skills, 335 from one campaign; 1,184 in the academic count),
OpenSourceMalware's 386, ToxicSkills (534 of 3,984, 13.4 %), AIR's 26,000-agent fake skill;
Anthropic's community marketplace publishes its removals as pull requests with reasons (16 for
user safety, of 2,281 plugins).

## 6. Scanners and review

**Question.** Which tools scan these populations, by what method, and with what published rate?
Does any operator scan?

**Verdict: exists** for VS Code and Open VSX, all static or antivirus, no published precision;
**not found** for Cursor plugins, Zed and Continue.

Operators: Open VSX (the pipeline above — blocklist, gitleaks-rule secrets, YARA, ClamAV,
name similarity and Yeeth Security's "Argus", a multi-stage static and LLM scanner run
"against every upload", 50–100 submissions a day triaged to 3–5 alerts; production
configuration public in `EclipseFdn/open-vsx.org`; all static; a third-party audit announced
for 2026-02 has no published report; false positives acknowledged — a ClamAV SVG signature on
react-router, on JetBrains ReSharper, extensions held "under review", a five-year-old extension
removed and restored ten days later, #1320); Microsoft (antivirus engines plus the clean-room
VM; no figures; evaded by geofencing); Cursor (plugins: identity plus code review, re-index on
request, an explicit non-certification clause in the Publisher Terms of 2026-05-06; VSIX:
unnamed commercial tooling on the proxy); Windsurf (a deny list); Zed (pull-request review, no
scanner; its 2025-12 secure-by-default post concerns project settings that auto-download and
execute, not extensions); the ACP registry (functional launch check); Anthropic's community
plugin marketplace claims "automated security scanning"; JetBrains' verifier is a
compatibility checker by its own admission.

Third parties, VSIX: Koi/ExtensionTotal (static unpack, "200+ indicators", LLM summary, a
sandbox in the enterprise tier; 1,283 extensions with known malicious code across 229 M installs
in 2024; a 2026-07 lawsuit alleges its LLM platform hallucinated an attribution); Socket, with
Secure Annex acquired 2026-04-28 (Open VSX scanning since 2025-11-20; a proxy for both galleries
since 2026-06-17); Aikido (invisible-Unicode detection); ReversingLabs Spectra Assure ("over
100K risk assessments", Microsoft marketplace); VSCan (static, 1,077 analysed, community-reported
false positives); Trail of Bits vsix-audit (YARA, AST, IOCs; registries marketplace, openvsx and
`marketplace.cursorapi.com`); Checkmarx Zero; StepSecurity Dev Machine Guard (endpoint inventory
across VS Code, Cursor, Windsurf, Antigravity); Manifold (runtime monitoring in customer
environments); Wiz. Third parties, plugins and skills on the machine rather than in the
marketplace: Snyk agent-scan (installed skills and MCP servers of Cursor, Windsurf, VS Code,
Claude Code, Codex, Kiro, Antigravity), Cisco skill-scanner, harness-eval, SkillSpector.

Rates: none for any IDE-extension scanner. For skill scanners, the literature is where MCP
description scanners were a year ago: SkillScan 86.7 % precision / 82.5 % recall on 31,132
skills; Context Matters (238,180 skills: marketplace scanners flag "up to 46.8 %", 0.52 % after
repository context); ClawHub Security Signals (67,453 versions, pairwise scanner overlap
≤ 10.4 %); After the Party (human-adjudicated sensitivity 21.67–61.06 %); Cloak and Detonate
(eight scanners bypassed > 90 %; a sandboxed runtime auditor 97 % at 2 % false positives); ATR
(96,096 skills, a 57.7 % precision floor); Snyk (90–100 % recall, 0 % false positives on a
curated 100); Cisco (99.16 % precision on MaliciousSkillBench, 60.75 % precision / 7.75 % recall
on a source-disjoint split); Manifold (one enterprise scanner flagged > 40 % of 19,000 skills).
Method precedents for a marketplace-wide dynamic study exist for browser extension stores only
(Hulk, 2014; "Did I Vet You Before?", TSC 2026).

What does not exist: a scanner or a measurement of Zed's WASM extensions or of Cursor Marketplace
bundles; precision or detections-per-N for any VSIX scanner or for either operator's pipeline; a
corpus-level dynamic instrument with a published rate on any of these populations.

## 7. Vendor publications

**Question.** What do the operators publish with figures — review outcomes, removals, scan
statistics, sandboxing, incidents?

**Verdict: partial.** Per operator:

| operator | verdict | what there is |
|---|---|---|
| **Microsoft** | partial | the only removal ledger (`RemovedPackages.md`, 2,021 rows 2025-02-26..2026-09-15, monthly volume from 10 to a peak of 319 in 2026-03) and one review count (136 reviewed, 110 removed, 2025-06-11); a sandbox claim with no method or result; boilerplate press statements ("We are investigating this report") |
| **Eclipse / Open VSX** | partial | two incident write-ups with figures (CVE-2025-6705; GlassWorm wave 1); size and traffic headlines; the scanner configuration in the open; a blocklist whose git history is a takedown series; a `version-changes` feed "for security scanners" (~2,060 REMOVED and 73 INACTIVE version events since 2026-08, no reason); the Alpha-Omega monthly tallies; a Publisher Agreement with sole-discretion removal; no rejection, quarantine or false-positive count (the "scan decision dashboard" is admin-only) |
| **Cursor** | not found | policy text only, for both marketplaces (35 changelog entries, 300 status incidents, a trust center, Publisher Terms with a non-certification clause); forum staff on review latency and the redirect to cursor.directory; enterprise third-party plugin imports default off since 2026-04-02; no removal, rejection or scan figure |
| **Cognition / Windsurf** | not found | "uses the Open VSX Registry"; changelog 2025-04-25, "Updates IDE marketplace link by mirroring Open VSX"; a deny list (2026-04-29) and a publisher allowlist by OS policy; nothing on extension or plugin security, nothing on the Devin marketplace |
| **Zed** | partial | the capability model and its defaults; review-queue statements; two CVEs disclosed as GHSAs and not in release notes, a third sandbox fix in release notes without an advisory; a secure-by-default post (2025-12) about project settings, not extensions; the ACP registry's quarantine file; acceptance and removal derivable from the repositories, unpublished |
| **Continue** | not found | no Hub review or shutdown statement; the Hub vanished between the last Wayback capture (2026-01-24) and the redirect pull request (2026-01-30) without notice |

What does not exist, from every operator: rejection rates at submission, review latency, the
count of publish-time blocks, any behavioural measurement of the corpus; from Cursor, Zed,
Cognition and Continue also takedown counts. Adjacent operators are more transparent than the
four: Anthropic's community marketplace publishes removals with reasons; JetBrains published an
incident report with a takedown time. Cross-marketplace response time exists only in
third-party post-mortems (Nx Console: 18 minutes at Microsoft against 36 at Open VSX).

## What this means for the measurement

- The population that the mcp-install instrument covers without change: the hooks and the
  bundled MCP servers of Cursor Marketplace plugins (330, 271 with MCP servers, 324 pinned to
  a commit; `cursor/plugins` holds 15 first-party and 64 third-party), of the Devin marketplace
  (171) and, if wanted, of the unreviewed cursor.directory; the 41 ACP agents; the MCP servers
  of Zed's context-server extensions (58 among the 1,000 the API lists). Small populations: a
  census is one API call, and the sample can be the population. The comparison the ACP
  registry invites is direct: its CI already installs every agent and records pass/fail; the
  instrument records what the install did.
- Zed extensions proper need Zed's WASM host to observe first-use downloads; the declaration to
  compare against is `extension.toml` (`provides`, capabilities) and the registry's own
  `download_count`.
- Open VSX as a population (17,884; sample ~600 as in mcp-install, seeded from the API's
  listing) needs an extension-host arm: headless Code-OSS or Cursor under strace with the
  extension installed and activated, decoy `$HOME`, network unisolated. The declaration is
  `activationEvents`/`contributes`; the prior art to cite is Edirimannage et al.; the incidents
  to check the instrument against are in §5.
- The instrument's outputs that no source publishes for any of these: telemetry rate, `$HOME`
  credential-path access rate, first-run egress by destination, binaries downloaded at first
  use, and the join of each with the manifest.
