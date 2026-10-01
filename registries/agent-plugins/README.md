# registries/agent-plugins

Inventory of the extension and plugin marketplaces of the AI coding assistants named in the
agent-plugins question — Cursor, Windsurf, Continue, Zed — and of the registries they actually
draw from: who operates them, what review they apply before and after listing, whether the
operator builds or runs the code, and how many entries they hold. State as of 2026-09-16.
Prior-art sweep in [../../prior-art/agent-plugins.md](../../prior-art/agent-plugins.md).

Every statement about policy comes from the operator's own document, opened on the date given
in the sweep's appendix; size figures are what the site, the API or the repository showed on
2026-09-16 ([data/catalog-counts-2026-09-16.json](data/catalog-counts-2026-09-16.json), with
the endpoint or command for each).

## Inventory

| registry | operator | what is listed | submission model | review before listing | after listing / takedown | builds or runs code | entries |
|---|---|---|---|---|---|---|---|
| [Cursor Marketplace](https://cursor.com/marketplace) | Anysphere | plugins: git repositories bundling rules, skills, agents, commands, MCP servers, hooks; manifest `.cursor-plugin/plugin.json` or Agent Plugins `plugin.json` | curated partners ("a small group of trusted partners"); by 2026-07 forum staff redirected submissions to cursor.directory | "Every plugin is manually reviewed before it's listed. All plugins must be open source, and we review each update before publishing"; "No binaries are shipped" (hooks are spawned processes); identity plus code review, manual, "a week or so", no status page; Publisher Terms (2026-05-06) with a non-certification clause | "we remove it from the marketplace immediately"; no count | no; plugins auto-update after review | 330 approved plugins from 240 publishers (catalogue endpoint `ListMarketplacePlugins`, unauthenticated): all on GitHub, 324 pinned to a commit SHA, 271 declare MCP servers, 66 first-party; created 2026-02-07..09-15 at 36/48/34/24/29/25/93/41 a month; `cursor/plugins`: 15 first-party + 64 third-party |
| [cursor.directory](https://cursor.directory) | community | plugins, rules, MCP servers | open | automated scan by a Cursor SDK agent before a user submission is listed, flagged ones to an admin queue (since 2026-05-12, cursor/community-plugins); Cursor staff (2026-04-13): items "don’t go through the same review pipeline" as the Marketplace | — | no | not counted (HTTP 429) |
| Cursor VSIX gallery (`marketplace.cursorapi.com`) | Anysphere | VSIX | proxy: Open VSX (`/open-vsx-mirror/`) plus Anysphere's own rebuilds | "automated malware and supply-chain analysis using commercial security tooling" (vendor unnamed); blocklist; verification badge; optional signature verification; install cooldown | own blocklist ("updates its blocklist over time"); a mirror of Open VSX "that syncs periodically" (Cursor staff), whether Open VSX takedowns propagate not stated; one forum report of a squatted extension that Cursor installed from Open VSX and that was "removed after hundreds of installs" (2026-07-23) | rebuilds some extensions | not enumerable (`TotalCount` echoes page size) |
| [Open VSX](https://open-vsx.org) | Eclipse Foundation | VSIX | `ovsx publish` with namespace ownership | until 2026-01 "relied primarily on post-publication response"; since 2026-03-04 enforced publish-time checks (gitleaks-rule secrets, SHA-256 blocklist, malicious-zip, remote scanners: ClamAV, YARA, and Argus from 2026-04-29; namespace similarity recorded, not enforced) with quarantine; a fail-open bug under publish flooding, reproduced in testing by Koi, reported 2026-02-08 and fixed 2026-02-11, before scanning was enabled in production (2026-02-17) | git-tracked blocklist `extension-control/extensions.json`: 944 malicious entries (919 distinct identifiers; 1 → 8 → 115 → 816 → 944 entries at half-year marks 2025-01..2026-09), no version, date or reason, 9 in common with Microsoft's 283; versions immutable since 1.1.0 (2026-08-02); `version-changes` feed (317,161 events; ~2,060 REMOVED and 73 INACTIVE version events on 348 extensions since 2026-08, no reason field); Alpha-Omega monthly tallies (13/29/21/13 malwares processed Aug–Nov 2025); Yeeth (2025-12-31): its pipeline cut Open VSX extensions needing manual review "from 50-100 per day to around 3-5 high-signal alerts"; no rejection or quarantine count (admin-only dashboard, openvsx#1949); about 40 publisher complaints of versions held "under review" or inactive in 2026 (74 issues match the keywords, a third of them namespace claims) | no (the `publish-extensions` CI that builds a subset was the vector of CVE-2025-6705) | 17,884 |
| [marketplace.windsurf.com](https://marketplace.windsurf.com) | Cognition (Windsurf → Devin Desktop, 2026-06-02) | VSIX | passthrough of open-vsx.org (mirrored since v1.7.1, 2025-04-25): identical `totalSize`, newest entry and server version; downloads served from open-vsx.org | none stated | a server-driven deny list (v2.1.29, 2026-04-29); publisher allowlist by OS policy | no | 17,884 (= Open VSX) |
| Windsurf / Devin MCP plugin store; [CognitionAI/devin-marketplace](https://github.com/CognitionAI/devin-marketplace) | Cognition | since v3.2.16 (2026-06-16; hooks, MCP servers and the `.claude-plugin` fallback since 2026-07-29, Agent Plugins since 2026-08-21) git-sourced plugins of the Cursor shape: `.devin-plugin/plugin.json` (falling back to `.claude-plugin/plugin.json` and Agent Plugins `plugin.json`), bundling `hooks.json` and `.mcp.json`; plus the in-app MCP plugin store | repository created 2026-08-31; in-app store has no public listing | none stated; per-install "security notice", hooks "best effort and fail open", "we do not assume liability"; blue checkmark for "official" MCPs | none stated | no | 171 plugin directories; 97 public repositories with a root `.devin-plugin/plugin.json` on GitHub |
| [Zed extensions](https://github.com/zed-industries/extensions) | Zed Industries | WASM extensions (`extension.toml`: `provides` languages, grammars, language servers, themes, snippets, slash commands, context servers = MCP, debug adapters, agent servers) | pull request adding a git submodule and an `extensions.toml` entry | human review ("most submissions get their first feedback within a few weeks ... up to one or two months"; "not all of them make the cut"); CI compiles and packages the WASM, checks sorting and LFS, Danger lint; no malware scanner; "There isn't a formal third-party audit process yet" (a community reply in zed#10375, not Zed) | removals by pull request (30–40 since 2024-11 by three counts, all but one deprecation, dead upstream or author request, the exception an invalid ID); `remove-extension` workflow since 2026-09-14; acceptance derivable (4,898 merged vs 1,751 closed unmerged), unpublished | **yes**: builds the WASM it serves; extensions download language servers, npm packages and binaries at first use (`download_file`, `npm:install`, `process:exec`, granted with wildcard defaults) | 1,474 (221 → 431 → 663 → 909 → 1,302 → 1,474 at half-year marks 2024-07..2026-09); API caps at 1,000 |
| [ACP Registry](https://github.com/agentclientprotocol/registry) | Zed Industries and JetBrains (since 2026-01-28) | coding agents (Claude Code, Codex, Gemini, Cursor, Copilot CLI, …) as `npx` / `uvx` / binary pointers in an `agent.json`, consumed by Zed and JetBrains IDEs | pull request; "As soon as it's merged, it will be immediately available in all clients"; versions bumped hourly by cron with no human review | functional only: CI installs and launches every agent not listed in `quarantine.json` in a per-agent directory and checks the ACP handshake; a daily protocol matrix re-runs them; preview distributions "are never launched or auth-checked"; no security review stated | `quarantine.json`: 8 of 42 on 2026-09-16 ("Postinstall script", "Missing npm dependency", "Timeout after 120s waiting for initialize response", …) | **runs**: installs and starts each agent in CI | 41 published (22 npx, 19 binary, 2 uvx); 42 directories |
| Continue Hub (`hub.continue.dev`) | Continue Dev, Inc. → Cursor (acquisition announced 2026-06) | blocks (models, rules, prompts, context, docs, data, MCP servers) as `config.yaml` fragments | open ("Public: Anyone can discover and use") | none stated in the archived documentation | — | no | gone: last live Wayback capture of the root 2026-01-24, redirected to continue.dev by 2026-01-28, NXDOMAIN on 2026-09-15; repository README "no longer actively maintained and is read-only", final release 2026-06-19 |
| Adjacent: [Microsoft VS Marketplace](https://marketplace.visualstudio.com) | Microsoft | VSIX | publisher account; Microsoft Entra ID (recommended) or PAT | antivirus engines; "dynamic detection ... in a sandboxed environment (clean room VM)"; no figure | `RemovedPackages.md`: 2,021 rows 2025-02-26..2026-09-15 (1,071 impersonation, 540 malware, 260 untrustworthy, 105 spam; peak 319 in 2026-03); kill list of 283 entries (280 distinct identifiers); "reviewed 136 extensions for malicious code and removed 110" (2025-06) | runs, in the sandbox | 138,603 (VS Code target) |
| Adjacent: [Gemini CLI extensions](https://geminicli.com/extensions/) | Google | extensions (`gemini-extension.json`) | GitHub topic | "Google does not vet" | — | no | 1,856 |
| Adjacent: Claude Code plugin marketplaces | Anthropic and anyone with a `marketplace.json` | plugins | none (official: curated, at Anthropic's discretion); submission form (community); own marketplace in any repository (others) | official: curated; community: "automated validation and safety screening" | community marketplace publishes removals as pull requests with reasons (16 for user safety) | no | 2,018 marketplaces / 8,351 plugins in repositories with 10 or more stars (Hereiz et al., 2026-04); community list 2,282 |

## What has been measured and what has not

Measured (sources in the sweep's appendix):

- The Microsoft marketplace: three academic crawls (43,436, 25,402 of them with code; 48,692, 27,261
  after filtering; 52,880 extensions), one industry census (ExtensionTotal 2024: ~60,000 / ~45,000
  publishers / 1,800 verified), one CC BY dataset with concentration (2026-08: top 1 % of extensions
  hold 87.4 % of installs), a malicious-extension dataset (VSMEx, 2,202 flagged) and Microsoft's own
  removal log.
- Open VSX: the operator's headline series (2,500 → 7,000 → 10,000 → 12,000 extensions, 2023–2026;
  600 M downloads a month by 2026-06) with no stated definition; two third-party indexes nobody has
  analysed (ecosyste.ms, 2026-09-12: 20,076 packages, 13,274 maintainers, indexed since 2025-09-24;
  VSX Pulse: hourly since 2026-05-29, 18,578 extensions, 99 categories); one academic sample (top
  ~3,000 by downloads); a dense incident record.
- Zed: community directories with category counts, refreshed daily; no analysis.

Not measured (open field):

- Publisher concentration and verified-namespace share on Open VSX; growth of extensions rather
  than downloads; the Open VSX–Microsoft overlap (derivable from `nix-vscode-extensions` daily
  caches; a one-off derivation in the sweep gave 75.2 % of Open VSX identifiers also on
  Microsoft, unverified); which share of Open VSX traffic is Cursor and Windsurf (only the
  operator's logs know).
- A published composition of the Cursor Marketplace beyond what its catalogue endpoint
  returns (271 of 330 declare MCP servers; what the hooks run is uncharacterised), of the Devin
  marketplace or of the ACP registry; anything about cursor.directory.
- Rejection rates, review latency and takedown counts from Cursor, Zed, Cognition, Continue;
  quarantine and false-positive counts from Open VSX; whether Open VSX takedowns propagate to
  Cursor's proxy and Windsurf's passthrough (TigerJack stayed live on Open VSX after Microsoft
  removed it; TRAE is reported to mirror without syncing takedowns).
- Whether Cursor's manual review or Open VSX's publish-time checks catch anything: no
  rejection figure from either, and Nx Console "passes the automated verification from
  Microsoft" and lived 36 minutes on Open VSX with scanning in force.
- What any of these populations does at install or first run — see the sweep, §3.

## Corrections, 2026-09-30

- cursor.directory was said to have no review; since 2026-05-12 an automated scan runs before a
  submission is listed, and Cursor staff said its items "don’t go through the same review
  pipeline" as the Marketplace. Cursor's gallery has its own blocklist; that it inherits Open VSX
  takedowns is not stated by Cursor. The squatted extension was "removed after hundreds of
  installs".
- Open VSX: namespace similarity is recorded, not enforced; Argus joined on 2026-04-29; the
  fail-open bug was reproduced by Koi in testing and fixed before production scanning; the
  blocklist has 944 entries, 919 distinct; Yeeth's figures are of extensions needing manual
  review; the "under review" complaints are about 40, not the 74 issues the keywords match.
- Devin: hooks, MCP servers and the `.claude-plugin` fallback came on 2026-07-29 and Agent Plugins
  on 2026-08-21, after v3.2.16; the 97 are repositories with a root manifest.
- Zed: the audit sentence is a community reply; one removal was for an invalid ID; the
  `remove-extension` workflow dates from 2026-09-14. ACP: version bumps have no human review but
  are launched first; CI launches the agents not in quarantine.
- Continue Hub redirected by 2026-01-28. Microsoft: publishing by Entra ID is recommended, PAT the
  alternative; its kill list has 283 entries, 280 distinct. Claude Code's official marketplace
  takes no submissions; the community one takes a form. Hereiz et al.'s counts are over
  repositories with 10 or more stars; the community list held 2,282 on 2026-09-16.
- The academic crawls were 43,436 and 48,692 extensions, of which 25,402 and 27,261 were
  analysed; the 87.4 % is held by the top 1 % of extensions, not publishers; ecosyste.ms's counts
  are of 2026-09-12.
