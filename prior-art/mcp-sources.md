# MCP — verified sources and searches run

Appendix to [mcp.md](mcp.md), generated from the per-topic write-ups of the 2026-09-11 sweep. Every listed source was opened and its figures compared with the text (status `confirmed` or `partially_confirmed`); figures are quoted as they appear in the source. The "not used" sections are sources found during the search that could not be opened or whose figures did not survive the comparison. The list of searches is the absence record: it backs every "partial" and "not found".

## Ecosystem census

**Verdict:** exists · 44 supporting sources · 13 not used · 94 searches

### Supporting sources

1. **MCP Ecosystem Dataset (mcptoplist.com) / MCP Toplist** — BIFF-AI / MCP Toplist (BIFF.ai), Hugging Face, CC BY 4.0 — dataset created 2026-09-02; version 2026-09-11 (generated 2026-09-11T04:17Z); site page 'As of Sep 11, 2026, 03:48 PM UTC'  
   <https://huggingface.co/datasets/BIFF-AI/mcptoplist>  
   The largest cross-registry census with a stated deduplication rule, per-registry membership flags, first_seen dates and a daily per-registry growth series; companion site https://mcptoplist.com/ states the live total and an 'Organizations' count.
   - Figures: “'servers.parquet — 125,905 rows, one per canonical server'” · “'registry_daily.parquet — 695 rows, one per source × day' (columns source, date, listed_servers); first rows glama_ai 2026-04-25 0; 2026-04-26 19,434; 2026-04-27 19,843” · “Site (2026-09-11): '126,487 MCP servers tracked ▲ + 20,928 in the last 30 days'; '78,962 Organizations'; '5 Registries'” · “Dedup: 'Repository-URL and package-identifier resolution, plus rename tracking'; sources Official MCP Registry, Glama, Smithery, mcp.so, PulseMCP; cadence 'Daily (~04:30 UTC...)'; each registry synced 'twice daily'”
   - Sample/method: Daily aggregation of five public registries, cross-registry dedup by repo URL / package id / rename tracking; 125,905 canonical rows as of 2026-09-11; growth series only since 2026-04-25.
   - Limitations: Vendor directory operator; 125,905 is far above any other census and includes Glama's auto-index and unverified mcp.so/PulseMCP free-form listings, so the quality of 'canonical' dedup is unverified; no owner/publisher column ('Organizations' is a listing-owner count, not an individual-vs-company split); no peer review.

2. **State of MCP: A Longitudinal Measurement Dataset of the Model Context Protocol Ecosystem (v2026-Q3)** — Charlie Major / Major Labs (Major Matters Research Ltd), Zenodo DOI 10.5281/zenodo.22674847, CC BY 4.0 — 2026-09-09 (v1); live page https://majorlabs.co/data latest scan 2026-09-07, 113 scan passes  
   <https://zenodo.org/records/22674847>  
   A DOI-archived multi-source census (union of four discovery sources deduplicated by repository) with per-source funnel, weekly aggregate series, per-repo owner names and a GitHub-topic count series; the live page gives the cross-source totals.
   - Figures: “Description: 'a census of 3,227 open-source MCP server repositories with population metadata; 112 discovery-run provenance records; a weekly aggregate time series'; '18 weekly scans' May-Sept 2026” · “majorlabs.co/data: 'Advertised across all sources ~ 82,666 distinct repos'; '+7,634 remote-only servers'; 'In the official registry 28,481'; by source (listed / with repo / remote-only): GitHub deep-scan 3,219; Glama 74,277 / 74,277 / 0; Official MCP registry 28,481 / 21,659 / 6,822; Smithery '(reports 11,882; API exposes 812)' 812 / 0 / 812” · “'We deep-scanned firsthand 3,219'; 'Maintained (pushed < 180d) 2,449'; 'Genuinely evaluable ~ 1,200'; '78.8% carry an OSI license'; '45.4% expose a remote HTTP surface'” · “discovery-runs.csv total_count: topic:mcp-server 16,150 (2026-05-26) -> 27,998 (2026-09-08); topic:model-context-protocol 10,979 (2026-05-26) -> 27,631 (2026-09-08)” · “aggregate-history.csv (7 rows, cataloged): 2026-06-18 1,934; 2026-07-11 2,130; 2026-07-26 2,174; 2026-08-08 2,189; 2026-08-15 2,262; 2026-08-23 2,381; 2026-08-29 2,408” · “Recomputed in the source check from mcp-servers.csv (not stated by the source): 3,227 rows; 2,729 distinct owners; top owners modelcontextprotocol 45, vinkius-labs 15, cyanheads 14, bsmi021 14; created_at by month 2024-11 29, 2024-12 101, 2025-03 288 (peak), 2026-02 225, 2026-03 256” · “'83M monthly downloads (tracked)'; '11,081 packaged servers tracked'; '77M npm / month (6,942 pkgs)'; '6.2M pypi / month (2,480 pkgs)'” · “'The headline counts everyone repeats are inflated; the useful signal is the gap between what registries advertise and what is actually maintained.'”
   - Sample/method: README: 'Discovery unions four sources (GitHub topic/org search, the official MCP registry, Glama, Smithery), deduped by repository. Analysis is read-only static inspection of public source; no server is ever run or probed.' Weekly scans since June 2026 ('the series cannot be backfilled'); 3,227 repos deep-catalogued; security analysis on 2,408.
   - Limitations: Per-repo CSV covers only a 3,227-repo deep-scan subset (vs 27,998 GitHub topic hits), and includes non-server repos (first row n8n-io/n8n); aggregate-history.csv holds 7 rows not 18 and 'maintained' is empty; owner names present but no owner-type field; vendor (security-scanner company) with live figures that change per scan; 'advertised' total dominated by Glama's 74,277 auto-index.

3. **A Measurement Study of Model Context Protocol Ecosystem** — arXiv cs.CY — Hechuan Guo, Yongle Hao, Yue Zhang, Minghui Xu, Peizhuo Lv, Jiezhi Chen, Xiuzhen Cheng — v1 2025-09-29; v2 2025-10-18; v3 2025-11-15 (crawl 26 Jul-12 Sep 2025)  
   <https://arxiv.org/abs/2509.25292>  
   The most complete academic multi-market census: daily crawl of six third-party markets with raw vs valid counts per market, cross-market overlap, language shares, maintenance activity and per-market growth within the crawl window.
   - Figures: “'Over a 14-day campaign, MCPCrawler aggregated 17,630 raw entries, of which 8,401 valid projects (8,060 servers and 341 clients) were analyzed'” · “Per-market raw / valid servers: MCP.so 16,646 / 7,223; PulseMCP 6,013 / 3,576; MCP Market 14,280 / 3,765; Smithery 6,751 / 2,588; Cursor.directory 1,600 / 1,197; MCP Servers 2,136 / 997; Total 16,950 / 8,060” · “'8,890 entries (52.4%) out of 16,950 servers were discarded due to patterns such as placeholder repositories, inactive forks, or projects without executable code'” · “'32.3% appearing in more than one platform... only 5.5% of projects are indexed broadly (in four or more markets)'” · “'JavaScript (55.0%, 4,433 servers) and Python (38.3%, 3,087 servers)... Go (4.1%, 331 servers) and Rust (0.9%, 76 servers)'” · “'40.9% of servers were updated within 90 days, but 21.9% had been inactive for over a year'” · “'While MCP.so remains largely saturated with a stable number of entries, MCP Market shows a steady upward trend'”
   - Sample/method: MCPCrawler daily crawl of MCP.so, MCP Market, PulseMCP, Smithery, MCP Servers, cursor.directory 'for each day between July 26 and September 12, 2025' (text also says '14-day campaign'); rule-based noise removal; dedup across markets by project.
   - Limitations: Third-party directories only (official registry launched Sept 2025, not included); inconsistent crawl-window statement (14 days vs ~48 days); growth only within the window; no publisher/ownership analysis; rule-based dedup.

4. **MCP Registry Census** — Ashish Sinha (Ashsinha1 on Hugging Face; github.com/ashishsinha1602/dataset-integrity-audit), MIT — created and last modified 2026-08-28T17:44Z  
   <https://huggingface.co/datasets/Ashsinha1/mcp-registry-census>  
   The clearest published publisher-concentration measurement of the official registry (publisher = namespace), with an explicit version-vs-server dedup warning.
   - Figures: “'84,241 version records → 25,423 distinct servers'” · “'15,709 publishers, of which 14,063 have registered exactly one server'” · “'Ten largest publishers hold 15.5% of the registry' (csv top10_share_pct 15.48)” · “'394 servers declare no way to reach them — no endpoint, no package'; '268 deprecated servers still listed'; csv no_repository 5,755” · “'The mean is 3.3 versions per server; the maximum observed is 1,175 versions of a single server'” · “'Between an earlier measurement the same day and this baseline, distinct servers rose from 25,125 to 25,423.'” · “'The registry endpoint returns one record per published version, not per server. Filter on _isLatest to get distinct servers. Failing to do so changes conclusions by roughly 20x'”
   - Sample/method: Full pull of the official registry API on 2026-08-28; dedup on isLatest; publisher = namespace prefix; no endpoints contacted.
   - Limitations: Single registry; one snapshot despite the card's 'updated daily' (census-history.csv has one row, no update since 2026-08-28); namespace concentration only, no individual-vs-organization split; individual author, no peer review.

5. **MCP Ecosystem 2026: What the Adoption Numbers Actually Show** — Effloow (byline 'Effloow Editorial') — page metadata 2026-04-12 (datePublished and dateModified) but the body reports a registry census run on 2026-08-19 — inconsistent  
   <https://effloow.com/articles/mcp-ecosystem-growth-100-million-installs-2026>  
   A scripted census of the official registry with deployment and package-type split, namespace concentration, and a fact-check matrix of circulating marketing figures.
   - Figures: “'# 227 pages, 22,658 latest-version entries returned'; 'Active (registry status active) 22,408 100%'; remote endpoint 11,861 (52.9%); remote-only 10,678 (47.7%); package-only 10,180 (45.4%); both 1,183 (5.3%); neither 367 (1.6%)” · “'A single publisher, io.github.pipeworx-io, accounts for 1,312 entries — 5.9% of the entire registry on its own. The top fifteen namespaces together hold 14.9%.'” · “'22,408 active against 10,000 reported in December 2025 is 2.2x in about eight months'” · “npm 7,427 (60.0%); PyPI 3,250 (26.3%); mcpb 839 (6.8%); OCI 726 (5.9%); NuGet 99 (0.8%); Cargo 29 (0.2%); streamable-http 11,262 (91.6%); sse 1,034 (8.4%)” · “Claim matrix: '97M monthly SDK downloads' 'Verified, but dated Dec 2025 — not 2026'; '$10.4B MCP server market by 2026' and '80% of Fortune 500 running AI agents' each 'No primary source found'”
   - Sample/method: Paged the official MCP Registry read API on 2026-08-19 with scripts/mcp-registry-census.py, keeping the latest version per server: 227 pages, 22,658 entries, 22,408 active.
   - Limitations: Editorial blog, not peer reviewed; single (official) registry; namespace concentration only; individual-vs-enterprise adoption discussed qualitatively only; page date metadata contradicts the measurement date; script repository not verified.

6. **Registry Descriptions Go Stale Unevenly: An 89-Day Measurement of Model Context Protocol Drift, and Why Drift-Ranked Re-Auditing Under-Covers It** — arXiv cs.SE preprint — Gautam Bharti, Independent Researcher (disclosed commercial interest: mcpindex.ai) — arXiv:2608.00997v2, 04 Aug 2026 (window 2026-04-30 to 2026-07-28)  
   <https://arxiv.org/html/2608.00997>  
   A longitudinal panel of the official registry giving a growth series, namespace split and publisher counts/concentration of change events.
   - Figures: “'120 revisions from 2026-04-30 to 2026-07-28 (88.6 days, up to six observations per day), during which the corpus grew from 3,510 to 18,966 active servers; 19,099 distinct server names appear'” · “'every name takes the form namespace/name - 71.8% of them under io.github.*, which the registry binds to the corresponding GitHub account, the rest under DNS-verified domains'” · “'the top ten publishers account for 17.7% of events (the single busiest, 5.5%); 3,054 of 11,900 publishers ever produced a change event'” · “'Concentration of the 15,805 change events: top 1% of servers = 26.7%, top 5% = 61.2%, top 10% = 78.7%, top 20% = 94.3%'” · “'only 5.0% of the population has any prior description-change history at all, against 16.4% for descriptors' (v2; the 8.6%/24.8% pair first attributed to it is absent from v2)”
   - Sample/method: Replay of 120 committed CI snapshots of registry.modelcontextprotocol.io (2026-04-30 to 2026-07-28) into a delta-encoded panel; publisher-level figures from an internal named panel.
   - Limitations: Official registry only; single-author preprint with disclosed commercial interest; the 3,510 starting count reflects the registry's early state rather than ecosystem size; 'publisher' = namespace, no owner-type classification; v2 'corrects five claims in v1'.

7. **RoninForge/state-of-mcp — State of MCP: every registry server checked** — RoninForge.org (GitHub organization); data CC BY 4.0, tooling MIT; report page https://roninforge.org/data/state-of-mcp/ — repo created 2026-07-07; censuses 2026-07-02, 2026-07-22, 2026-08-03, 2026-09-09; pushed 2026-09-10  
   <https://github.com/RoninForge/state-of-mcp>  
   Four dated full-registry censuses with per-server probe records (records.jsonl + summary.json), giving an official-registry growth series for July-September 2026 plus a health/conformance breakdown.
   - Figures: “README series: 2026-07-02 baseline 14,559 servers; 2026-07-22 18,032; 2026-08-03 19,804; 2026-09-09 29,522 ('+49.1% in thirty-seven days')” · “2026-09-09 report: 23,538 healthy (79.7%); 4,664 degraded (15.8%); 1,162 dead (3.9%); 158 unknown (0.5%)” · “'14,481 package entrypoints' probed across npm/PyPI/OCI, ~1% (186) broken; 3,612 GitHub repositories rotted = 16.0% of repository-bearing servers (3,388 gone + 224 archived of 22,642 declared); 1,923 of 17,860 declared remote endpoints down (10.8%)” · “Probes: 'the official registry, the public GitHub API, npm, PyPI, anonymous Docker Hub, and a capability-only MCP initialize/tools/list exchange'”
   - Sample/method: Every server in the official MCP registry on each census date; keyless probes of packages, GitHub repos, remote endpoints and MCP initialize/tools/list (probe engine 'akashi').
   - Limitations: Official registry only; four irregular points; version-dedup approach not stated in README summary; health census, not a publisher/authorship census; small independent organization.

8. **What a Random Draw from the MCP Registry Contains, and What Tool-Use Benchmarks Contain Instead** — arXiv cs.SE preprint — Haseeb Mohammed Afsar, Independent researcher — arXiv:2609.10962v1, 10 Sep 2026 (sweeps 2026-07-14 and 2026-08-22)  
   <https://arxiv.org/html/2609.10962>  
   Two complete cursor-pagination sweeps of the official registry giving count, net growth and a deployment-model split, plus a seeded probability sample probed over the wire.
   - Figures: “'The population grew from 16,548 to 24,135 unique servers between 2026-07-14 and 2026-08-22, about 195 net new servers per day, and both sweeps completed'” · “Table 4: Package-only 8,340 (50.4%) -> 10,530 (43.6%); Remote-only 7,057 (42.6%) -> 12,004 (49.7%); Both 852 (5.1%) -> 1,224 (5.1%); Neither 299 (1.8%) -> 377 (1.6%)” · “'Remote-only overtook package-only in this window, growing 70.1% against 26.3%'” · “'npm / stdio candidate frame 7,258; Seeded probability draw 400 servers... seed 20260819'; 'Only 48.8% complete an initialize handshake, against 66.7% for a hand-curated frame... servers that never start at all (37.5%)'” · “'Two snapshots cannot establish a trend and we claim none'”
   - Sample/method: Full sweep of https://registry.modelcontextprotocol.io/v0/servers by cursor pagination, two snapshots 39 days apart; behavioral tier: seeded probability sample of 400 from a 7,258-server npm/stdio frame.
   - Limitations: Official registry only; author disclaims trend; single independent author; no publisher analysis ('publisher' does not occur).

9. **MCP Registry Audit 2026: 15,329 Servers Probed, 140,284 Tool Descriptions Read** — Fetchgate (data CC BY 4.0) — 2026-08-28, update 2026-08-30  
   <https://fetchgate.dev/blog/mcp-registry-audit-2026>  
   Operator-level concentration of live remote servers in the official registry (operator = registrable domain) and a liveness split.
   - Figures: “'25,289 servers' in the official registry; '15,329 of them are remote URLs'” · “Answered tools/list 8,235 (53.7%); demanded auth 3,617 (23.6%); dead/broken/not MCP 3,477 (22.7%); '609 URLs no longer resolve at all'” · “'2,357 of the 8,235 live servers — 28.6% — belong to two operators'; pipeworx.io 1,266; mcp.ai 1,091; '39% of every tool in the registry'” · “'~3,900 registrable domains' as distinct operators” · “'140,284 tools'; median 7 tools per server; max 1,076” · “Update 2026-08-30: two big operators answer at 97.7%; everyone else 45.5%”
   - Sample/method: One read-only initialize/tools/list session per remote URL in the official registry (15,329 URLs), late Aug 2026; operators = registrable domains.
   - Limitations: Remote servers only (packaged servers excluded); single registry; operator = domain, not individual vs company; vendor blog.

10. **State of the MCP Registry — an independent, measured snapshot of the official Model Context Protocol registry** — operatorsheets (anonymous GitHub organization, repo created 2026-08-17) — census 2026-07-30 to 2026-08-02; corrections 2026-08-03/04, 2026-08-24, 2026-09-08  
   <https://operatorsheets.github.io/state-of-mcp/>  
   Endpoint-vs-host census of active remote endpoints in the official registry with a per-host correction showing how one gateway distorts headline rates, plus hosting-provider and protocol-version breakdowns.
   - Figures: “'46% of the 7,676 distinct operators behind 10,716 active remote endpoints answer an anonymous MCP handshake (43% counting endpoints but excluding the single largest host)'” · “'Correction, 2026-08-24. This headline read 50% until today, counted per endpoint... the 10,716 of them are only 7,676 hosts, and gateway.pipeworx.io alone is 1,286 of them'” · “Endpoints: answers anonymously 5,346 49.9%; auth-gated 2,643 24.7%; genuinely broken 2,039 19.0%; other 688 6.4%” · “'8,639 tools across a random sample of 476 live servers (≈194,480+ ecosystem-wide). Only 18% declare an output contract'” · “Protocol version sample: 2025-06-18 411 (86%); 2024-11-05 46 (10%); 2025-03-26 14 (3%); 2025-11-25 5 (1%)”
   - Sample/method: Live probe of 10,716 active remote endpoints in the official registry, 2026-07-30..08-02, with daily re-probing; tool surface from a random sample of 476 live servers; data files census-2026-07-30.csv/json published.
   - Limitations: Remote endpoints only; single registry; anonymous operator; corrected its own headline once; no individual-vs-company split; the 'April 2026 study' it rebuts is not named.

11. **MCP Server Directory: 21,930+ updated daily \| PulseMCP (with /statistics methodology page)** — PulseMCP — 2026-09-11 (live page); https://www.pulsemcp.com/statistics undated  
   <https://www.pulsemcp.com/servers>  
   A registry operator's live count with the only publisher-class split found anywhere (Official Providers vs Community), plus a statistics page describing how the count is computed.
   - Figures: “Title: 'MCP Server Directory: 21,930+ updated daily \| PulseMCP'; heading '21,940 Servers'” · “?classification=official-providers: '6,258 Servers'; ?classification=community: '15,647 Servers'; ?other=remote: '5,833 Servers'” · “/statistics: 'This count is representative of PulseMCP's scraped database of meaningful MCP servers. We intentionally omit low quality implementations that we don't think would ever be used by someone besides the creator.'; 'kept dynamically up-to-date by our internal data warehouse, updated daily'” · “/statistics: estimated downloads are a 'blend of registry download counters, social signals, web traffic, and more'”
   - Sample/method: PulseMCP's scraped, editorially filtered database, updated daily; classification taxonomy (Anthropic References / Official Providers / Community) is PulseMCP's own.
   - Limitations: Single registry with subjective inclusion rules; no historical series retrievable (charts embedded, Wayback fetches refused); counts drift daily; curl blocked by Cloudflare.

12. **I analyzed 1400 MCP servers - here's what I learned** — Bloomberry (Henley Wing Chiu) — 2026-02-24 (last updated 2026-03-27)  
   <https://bloomberry.com/blog/we-analyzed-1400-mcp-servers-heres-what-we-learned/>  
   A census of company-hosted remote MCP endpoints discovered by DNS scanning, with the only monthly growth series and company-size/B2B split of publishers found in the sweep.
   - Figures: “'DNS scanning of mcp.* subdomains across our tracked domain database. Infrastructure detection via CNAME resolution and IP range matching. Server fingerprinting via unauthenticated MCP initialize requests to paths /, /mcp, and /sse.'; 2 million companies tracked” · “425 servers (Aug 2025) -> 1,412 servers (Feb 2026); '232% increase in 6 months'; monthly additions 56 (Sep), 100 (Oct), 138 (Nov), 181 (Dec), 211 (Jan), 301 (Feb)” · “'81% of companies running MCP servers have fewer than 200 employees'” · “'70% of the MCP servers were created by B2B companies'” · “'38.7% of MCP servers had no authentication'; mean 13.4 tools per server, median 5”
   - Sample/method: DNS scan of mcp.* subdomains over ~2M company domains + CNAME/IP-range infra detection + unauthenticated MCP initialize probes; series Aug 2025-Feb 2026; n=1,412.
   - Limitations: Only vendor-hosted remote endpoints on an mcp.* subdomain of a tracked company domain; misses stdio/package servers, non-standard hostnames and companies outside the 2M-domain database; vendor blog; company size from Bloomberry's own firmographics.

13. **Evaluating Tool Cloning in Agentic-AI Ecosystems** — arXiv cs.SE — Taein Kim, David Jiang, Yuepeng Hu, Yuqi Jia, Neil Gong (Duke University) — arXiv:2605.09817v2, 17 May 2026 (no crawl dates stated)  
   <https://arxiv.org/html/2605.09817v2>  
   The only academic developer-concentration figure across multiple directories (MCP.so, MCP Servers, MCP Market), computed over extracted tools with entries merged by GitHub repository URL.
   - Figures: “'7,508 Model Context Protocol (MCP) repositories with 87,564 extracted tools and 1,353 Skills repositories with 12,447 tools, for a total of 8,861 repositories and 100,011 tool entries'” · “'In the MCP ecosystem, the top 10 developers account for 27.6% of extracted tools while owning only 2.6% of repositories; the top 50 developers account for 39.3% of tools and 4.1% of repositories'” · “'MCP Market enforces rate limits; therefore, our dataset includes a partial but representative subset of servers'” · “'Entries from multiple sources are merged based on GitHub repository URLs'”
   - Sample/method: Scrape of MCP.so, mcpservers.org, MCP Market (partial) plus SkillsMP API; merged by GitHub URL; 7,508 MCP repos; developer = GitHub account.
   - Limitations: Three third-party directories, one partially crawled; no collection dates; concentration by tool count not server count; no org/individual classification.

14. **MCP ecosystem report · The MCP Census** — The MCP Census (mcpcensus.com; operator not named; commercial) — report snapshot 2026-07-07; /coverage projection 2026-09-10; API generated 2026-09-11  
   <https://mcpcensus.pages.dev/report>  
   A registry-centric census with method line, deployment/install split, problem-rate, license/language tables, a live coverage page and an API exposing a publisher count.
   - Figures: “'15,382 servers · 47% remote'; '7,203 hosted endpoints'; install type npm 5,578, pypi 2,500, oci 538, mcpb 326, nuget 76” · “'16% have a verified problem': GitHub repo gone 1,880; no repo push in 6+ months 299; npm package deprecated 218; registry_deprecated 166” · “'127 over 1k stars · 9,207 under 10'; '61 repos declared by 5+ servers (max 126)'; '45 names used by 5+ servers' (mcp 638, mcpserver 314)” · “'method Registry crawl 2026-07-07. GitHub GraphQL (10,989 repos), npm, PyPI. Unknown stays unknown.'” · “/coverage (2026-09-10): Census servers 31,441; healthy 14,838; GitHub linked 12,923; DNS verified 10,459; GitHub verified 20,581; Awesome MCP 2,118; Glama 13,054; Smithery 282” · “API /v1/coverage 2026-09-11: census total 31,457; has_publisher 31,037; publishers 13,242”
   - Sample/method: Official registry crawl 2026-07-07 enriched with GitHub GraphQL (10,989 repos), npm and PyPI; daily projection thereafter; identity from registry namespace verification (DNS / GitHub).
   - Limitations: Commercial product, anonymous operator; report frozen at 2026-07-07 while coverage/API counts move; star table shows noise (generic 'mcp-server' names); publisher count only in API with no methodology; no owner-type split.

15. **MCPZoo: A Large-Scale Dataset of Runnable Model Context Protocol Servers for AI Agent (and its Jul 2026 update in arXiv 2607.11086)** — arXiv cs.CR — Fudan University authors; update: Pei Chen et al., 'Rethinking MCP Security' https://arxiv.org/abs/2607.11086 — arXiv:2512.15144v3, 26 Dec 2025 (data cut 2025-12-25); update submitted 13 Jul 2026  
   <https://arxiv.org/html/2512.15144>  
   An eight-source aggregate with a stated deduplication method (URL normalization + textual-similarity clustering) and per-source listing shares; the July 2026 paper reports the updated unique count.
   - Figures: “'Up to December 25th, 2025, MCPZoo contains 129,059 MCP servers, corresponding to 56,053 distinct servers after de-duplication. Among them, 16,356 servers are verified to be runnable.'” · “Table I (Dec. 2025): MCP Store 39,632 (30.71%); MCP World 31,048 (24.05%); MCP Market 16,105 (12.48%); MCP Repository 14,341 (11.11%); AIbase MCP 11,120 (8.62%); Pulse MCP 6,884 (5.33%); MCP.so 6,772 (5.25%); Smithery 3,157 (2.45%); Total 129,059; Total (Distinct) 56,053” · “2607.11086 abstract: 'MCPZoo contains 64,611 unique MCP servers (113,927 in total), with more than 37,288 supporting dynamic analysis'” · “2607.11086: 'existing scanners report that 96.89% of servers are risky... manual validation shows that less than 50% of sampled alerts are true positives'”
   - Sample/method: Crawl of eight public directories through 2025-12-25; dedup via URL normalization then vectorized config/code clustering; 16,356 verified runnable; update figures from abstract only.
   - Limitations: Third-party directories only (official registry absent); semantic clustering may merge distinct forks; raw total fell (129,059 -> 113,927) while unique count rose; MCP.so count (6,772) suggests a partial crawl; no publisher or growth analysis.

16. **Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions** — arXiv cs.CR v3 — Xinyi Hou, Yanjie Zhao, Shenao Wang, Haoyu Wang (HUST); TOSEM DOI 10.1145/3796519 (Crossref 2026-02-16); FSE 2026 journal-first — v1 2025-03-30; v3 07 Oct 2025 (table 'As of Sept. 2025')  
   <https://arxiv.org/html/2503.23278v3>  
   A 26-collection headcount table of self-reported or hand-counted registry totals as of Sept 2025 — the widest registry-level inventory, without deduplication.
   - Figures: “'This collection process yielded a consolidated dataset encompassing 26 major MCP collections'” · “Table 2 (As of Sept. 2025): MCPWorld (Baidu) 26,404; MCP.so 16,592; MCP Servers Repository 13,596; AIbase MCP 12,448; Glama 9,415; Smithery 6,888; PulseMCP 6,072; ModelScope 5,441; Awesome MCP Servers (wong2) 2,402; Cursor Directory 1,800; Official Collection (Anthropic) 1,204; AiMCP 907; Dockmaster 516; ... Higress 50; Toolbase 24; mkinf 23; Awesome Crypto MCP Servers 12” · “Table 4 (Sept. 2025): Smithery CLI 7,437 servers; mcp.run 242; mcp-get 59; Toolbase 24”
   - Sample/method: Self-reported registry totals cross-checked against listings, or manual counts from catalog pages, Sept 2025; no dedup across collections.
   - Limitations: Heavy double counting across collections; no growth curve; no publisher analysis.

17. **A First Look at the Security Issues in the Model Context Protocol Ecosystem** — arXiv cs.CR — Xiaofan Li, Xing Gao (University of Delaware); 'Accepted to DSN 2026' — v2 27 Apr 2026 (v1 Oct 2025); data late June-early July 2025  
   <https://arxiv.org/html/2510.16558>  
   A mid-2025 aggregate across five registries plus npm (SDK-dependency filter) with hosting and language shares.
   - Figures: “'We collect data between late June and early July 2025, resulting in a total of 67,057 MCP servers from all registries'” · “'We select 5 registries out of the 27 listed on mastra: four decentralized registries (mcp.so, MCP Market, MCP Store, Pulse MCP), and a centralized registry Smithery' plus npm” · “'MCP Store contributing the largest number (more than 20,000 servers)... centralized registries host substantially fewer servers, each containing fewer than 8,000'” · “'52,102 out of 52,539 (99.16%) are hosted on GitHub public repositories'” · “'Python, JavaScript, and TypeScript dominate the entire MCP ecosystem, together accounting for more than 70% of all servers'”
   - Sample/method: Crawl of index+detail pages of 4 decentralized registries, Smithery API, npm keyword 'mcp' via all-the-package-names filtered by MCP SDK dependency; 67,057 servers.
   - Limitations: 67,057 is a sum across registries, not stated as deduplicated; security focus; no publisher or growth analysis.

18. **MCP Registry API v0 /servers (full pagination on 2026-09-11)** — Model Context Protocol Registry (official) — verification run by this sweep, not published prior art — 2026-09-11 ~16:10 UTC  
   <https://registry.modelcontextprotocol.io/v0/servers?limit=100&version=latest>  
   Reproduces the grey-literature registry figures within hours of drift and adds a namespace-concentration and monthly publishedAt series; included as corroboration that the published censuses are reproducible, not as prior art.
   - Figures: “310 pages; 30,913 latest-version entries; status active 30,579, deprecated 334” · “remotes 18,618; packages 13,389; registryType npm 8,713, pypi 3,702, mcpb 1,167, oci 904, nuget 112, cargo 49” · “18,414 distinct namespaces; io.github.* 10,534 namespaces / 20,818 servers = 67.3%” · “top-15 namespaces = 20.0% of active; io.github.sadri-dridi 1,798; io.github.pipeworx-io 1,321; io.github.mcp-dir 1,113; io.github.Evozim 375; io.github.CSOAI-ORG 354; ai.smithery 213” · “publishedAt (latest version) by month: 2025-09 350; 2025-10 232; 2025-11 144; 2025-12 214; 2026-01 297; 2026-02 916; 2026-03 1,590; 2026-04 1,940; 2026-05 2,480; 2026-06 3,353; 2026-07 4,707; 2026-08 7,885; 2026-09 (partial) 6,805”
   - Sample/method: Full cursor pagination of GET /v0/servers?limit=100&version=latest; counts over all latest-version entries; monthly series uses _meta.publishedAt of the latest version (not first-publish).
   - Limitations: Single registry; publishedAt conflates new servers with re-publishes; io.github.* is only a proxy for individuals and includes orgs and farms; a live query, not a published measurement.

19. **The State of MCP in 2025: Who's Building What and Why It Matters** — Glama (punkpeye / Frank; disclosed conflict: 'Glama operates in several categories discussed below') — 2025-12-07  
   <https://glama.ai/blog/2025-12-07-the-state-of-mcp-in-2025>  
   A registry operator's 2025 year-in-review with a quality-filtered annual registration count, contributor count, download totals and company/VC tallies.
   - Figures: “'Total of 11,415 MCP servers were registered in 2025. NOTE December numbers are incomplete. NOTE Glama filters out servers that do not meet quality threshold to be included, e.g., empty projects, exact clones of other projects, forks, etc.'” · “'We tracked a total of 85k GitHub commits in 2025, with the most contributions observed in September peaking at 22k. These were made by a total of 15,294 GitHub users.'” · “'MCP servers and devtools (excluding frameworks to avoid double counting), are receiveing 31M weekly downloads'; @playwright/mcp 951,444 weekly” · “'There are 81 companies on that list. As I am writing this article, at least half of those websites are now taking to dead domains or they have pivoted.'; 'At least $73 million were raised by companies building directly in the MCP ecosystem.'”
   - Sample/method: Glama's own quality-filtered registry, GitHub commit tracking, npm weekly download totals; no formal method beyond the stated filter.
   - Limitations: Registry operator with disclosed conflict; single registry; December incomplete; no publisher-type breakdown; monthly chart values not enumerated in text.

20. **Open-Source MCP Servers – 85,656 in the Glama Registry (with /mcp/methodology page)** — Glama — 2026-09-11 ('Updated 2026-09-11 16:00'); methodology page undated  
   <https://glama.ai/mcp/servers>  
   A registry operator's live count that is 4x PulseMCP's and 15x Glama's own June-2025 figure, plus a methodology page describing clone/build/introspection indexing.
   - Figures: “'85,656 servers. Updated 2026-09-11 16:00'” · “Methodology: 'For every listed server, Glama clones and continuously syncs the complete Git history from GitHub.'; 'If the AI-inferred Dockerfile fails to produce a working build, the server's profile page is preserved but distribution is withheld'” · “Methodology cites 'a study of 856 tools across 103 servers and a broader survey of 10,831 MCP servers' (unnamed, unlinked); 'In the twelve months preceding this writing, Glama has performed over one million such scans'”
   - Sample/method: Glama registry index; inclusion rules for the headline count not stated; pipeline = GitHub clone + Dockerfile build + MCP introspection.
   - Limitations: No counting methodology for the total; likely includes forks/duplicates (Major Labs reads Glama at 74,277 repos); the 10,831-server survey is not reproducible from the page; no publisher or timeline data.

21. **Repository liveness behind indexed MCP servers — a dated census (2026-07)** — lastseen.dev (Nerq); Zenodo 10.5281/zenodo.22146735 (concept 10.5281/zenodo.21869879); HF lastseen-dev/mcp-mortality, CC BY 4.0 — census as of 2026-07-22; Zenodo version 2026-08-28; homepage latest observation 2026-09-10  
   <https://lastseen.dev/reports/mcp-mortality-2026-07/>  
   A liveness census of 28,824 GitHub repositories behind indexed MCP servers with an owner count for the not-maintained subset.
   - Figures: “'As of 2026-07-22, over n=28,824 distinct public GitHub repositories linked from indexed Model Context Protocol (MCP) servers'” · “alive 20,390 (70.7%); dormant 2,259 (7.8%); abandoned 2,686 (9.3%); deleted 3,448 (12.0%); not maintained 6,134 (21.3%)” · “'62.1% of the 28,824 were not distributable — no importable manifest, or a name-collision cluster where the identifier doesn't resolve'” · “Homepage: 'MCP servers 28,824 the full MCP census (2026)'; '9,264 not-maintained entities (deleted, abandoned, or dormant) across 7,686 owners'”
   - Sample/method: 28,824 GitHub repos seeded from an unnamed 'public census'; each read via commits.atom and HTTP status as of 2026-07-22, re-read daily since 2026-07-29; thresholds ≤180 d alive, 180-365 dormant, >365 abandoned.
   - Limitations: Population provenance undisclosed; owner count only for the not-maintained subset; commercial site; no owner-type field.

22. **MCP joins the Agentic AI Foundation (and the project's other official counts: 2025-11-25 anniversary post, 2026-07-28 spec post)** — Model Context Protocol Blog (David Soria Parra; core maintainers) — 2025-12-09; anniversary post 2025-11-25 (https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/); spec post 2026-07-28 (https://blog.modelcontextprotocol.io/posts/2026-07-28/)  
   <https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/>  
   The protocol maintainers' own headline figures — the only official server count found, without a stated method, plus registry entry counts at launch and SDK download milestones.
   - Figures: “AAIF post: 'over 97 million monthly SDK downloads'; '10,000 active servers'” · “Anniversary post: active servers went from 'a few experimental ones to thousands'; 'The MCP Registry now has close to two thousand entries since its announcement in September' — '407% growth from the initial batch of servers we onboarded that same month'; '58 maintainers supporting the 9 core/lead maintainers'” · “2026-07-28 post: Tier 1 SDKs 'close to half-a-billion downloads a month'; TypeScript and Python SDKs 'crossing the 1 billion total downloads threshold'; Manufact 'host thousands of MCP servers'”
   - Sample/method: n/a — no counting method or definition of 'active' stated.
   - Limitations: Round marketing-style figures; registry entry counts cover only self-submitted servers; downloads are not servers.

23. **MCP Statistics** — mcpevals.io (Sidra Arif) — secondary — 2025-06-13  
   <https://www.mcpevals.io/blog/mcp-statistics>  
   The only trace found of the early (Nov 2024-May 2025) growth curve, read off PulseMCP's embedded chart, plus Glama's June-2025 count.
   - Figures: “'the total number of MCP servers (as of June 2025) is over 5000 — 5,867, to be precise' (Glama)” · “'the total number of MCP servers has increased from approximately 100 in November 2024 to over 4000 by May 2025' (PulseMCP)” · “'the estimated number of total MCP server downloads was just under 100,000 in November 2024. This number increased to 8 million by April 2025' (PulseMCP)”
   - Sample/method: Secondary; figures read from Glama's directory and PulseMCP's statistics charts.
   - Limitations: Underlying PulseMCP chart values not independently verifiable (Wayback fetches of PulseMCP refused); Glama's counting rules have since changed (5,867 -> 85,656).

24. **Model Context Protocol (MCP) at First Glance: Studying the Security and Maintainability of MCP Servers** — arXiv cs.SE v5 (TOSEM, DOI 10.1145/3814959, Crossref 2026-05-12) — Mohammed Mehedi Hasan et al. (Queen's University) — v1 2025-06-16; v5 13 Apr 2026; data cutoff Mar 19-20, 2025  
   <https://arxiv.org/html/2506.13538>  
   The earliest dated academic snapshot (March 2025) with an official/community/mined split and health metrics versus traditional OSS.
   - Figures: “'88 official and 255 community integrations listed in Anthropic's repository on Mar 19, 2025'; '1,556 MCP servers mined from open-source repositories hosted on GitHub'; cut-off Mar 20, 2025” · “'we exclude MCP server repositories with fewer than ten stars, resulting in a collection of 583 MCP servers'; Table 1 total: Official 61, Community 184, Mined 338” · “'5.5 commits/week (vs. traditional software 2.5 commits/week)... median contributor count (2.0 vs. 2.0)'” · “'7.2% of servers contain general vulnerabilities and 5.5% exhibit MCP-specific tool poisoning'”
   - Sample/method: Anthropic curated list + GitHub code search for SDK imports, cutoff 2025-03-20; 1,899 servers; 583 with ≥10 stars analyzed.
   - Limitations: Early, GitHub-only, star-filtered; no ownership or growth analysis.

25. **A Large-Scale Dataset of MCP Implementations on GitHub** — arXiv cs.SE — Toeppe, Barrak, Ksontini; MSR '26 Data and Tool Showcase (Crossref 10.1145/3793302.3793311, 2026-04-13) — arXiv v1 11 Jul 2026; repos created or updated Jan 2024-Oct 2025  
   <https://arxiv.org/html/2607.10123v1>  
   A validated GitHub-only dataset with server/client/gateway role classification and language split.
   - Figures: “'3,238 candidate repositories were discovered'; '3,058 remained'; 'confirmed MCP-related code artifacts in 2,387 repositories'; 'final dataset of 2,297 validated MCP projects'” · “'overall precision of 83% at a 95% confidence level'” · “'1,962 Servers, 1,462 Clients, and 80 Gateways... 36 could not be' classified; Table 2 Server: Python (785), TypeScript (597), JavaScript (177)”
   - Sample/method: Five GitHub search queries via REST/GraphQL, Jan 2024-Oct 2025 window, multi-stage verification and manual validation.
   - Limitations: GitHub keyword search only; small relative to registry counts; no owner-type split or creation-date curve.

26. **A Large-Scale Evolvable Dataset for Model Context Protocol Ecosystem and Security Analysis (MCPCorpus)** — arXiv — Zhiwei Lin, Bonan Ruan, Jiahao Liu, Weibo Zhao; dataset https://github.com/Snakinya/MCPCorpus — 2025-06-30 (data as of 3 June 2025)  
   <https://arxiv.org/html/2506.23474>  
   A single-registry (MCP.so) snapshot enriched with GitHub metadata that could support growth analysis but does not perform it.
   - Figures: “'As of 3 June 2025, MCP.so hosts over 14,000 MCP servers and 300 client implementations'” · “'The MCPCorpus dataset consists of around 14K MCP artifacts, including 13,875 servers and 300 clients. Each artifact is represented as a JSON object with up to 26 structured attributes'” · “'fields like created_at, updated_at, and stargazers_count provide temporal insights into growth dynamics'”
   - Sample/method: Snapshot of MCP.so listings (13,875 servers, 300 clients) as of 3 June 2025 enriched with GitHub metadata.
   - Limitations: One registry; no validity filtering; no ownership or growth analysis in the paper.

27. **Exposed by Design: A Dynamic Security Assessment of Internet-Facing MCP Servers at Scale** — arXiv cs.CR — Nicolás Padilla, CobaltoSec / Independent Security Researcher — arXiv:2608.00150v1, 31 Jul 2026; runs Jul 15/18/21/24 2026  
   <https://arxiv.org/html/2608.00150v1>  
   An internet-facing endpoint census from eleven sources with a Censys instance estimate and churn measurement.
   - Figures: “'over 21,000 server instances detectable on the public internet' (Censys query services.service_name="mcp", executed 2026-05-01, 'Available upon request')” · “'eleven data sources (crt.sh, HuggingFace, GitHub, npm, Smithery, PyPI, Censys, FOFA, Shodan, glama.ai, and pulsemcp.com)'” · “'we process up to 4,110 candidate URLs per run, confirm 640 unique production MCP deployments via protocol-level fingerprinting, and subject 414 to active behavioral testing'” · “'41.6% of confirmed servers disappear within three days between consecutive measurement runs'”
   - Sample/method: Passive discovery from 11 sources, four runs in July 2026, protocol-level fingerprinting; Corvus framework for dynamic tests.
   - Limitations: Counts internet-facing endpoints, not packages; Censys figure not independently verifiable; no operator breakdown.

28. **State of MCP Server Security 2025: Research Report** — Astrix Security (Tal Skverer) — 2025-10-15  
   <https://astrix.security/learn/blog/state-of-mcp-server-security-2025/>  
   A GitHub-repo sample with an explicit estimate of the total GitHub MCP-server population (~20,000) as of Oct 2025.
   - Figures: “5,205 distinct GitHub repositories analyzed ('over 5,200 unique, open-source ... MCP server implementations')” · “'approximately 20,000' MCP server implementations on GitHub; sample 'roughly 19%'” · “88% require credentials; 53% static API keys/PATs; 8.5% OAuth”
   - Sample/method: GitHub API search (Python/TypeScript filters, claude_desktop_config.json, SDK imports), top 1,000 by stars per query; n=5,205 READMEs, LLM categorization.
   - Limitations: Star-ordered sampling; derivation of the 20,000 estimate not detailed; GitHub only; vendor report; no publisher-type or growth breakdown.

29. **Hunt Them All: An AI-Powered Vulnerability Sweep of 19,000 MCP Servers** — Trend Micro / TrendAI Research (Alfredo Oliveira, David Fiser) — 2026-05-27  
   <https://www.trendaisecurity.com/en-us/resources-insights/deep-research/hunt-them-all-an-ai-powered-vulnerability-sweep-of-19-000-mcp-servers>  
   A >19,000-repository GitHub corpus (population size only; vulnerability-focused).
   - Figures: “'we analyzed over 19,000 open-source MCP server repositories'” · “'8.3% of Model Context Protocol (MCP) server repositories showing AI bot activity based on contributor metadata'; source-code analysis suggests at least 20%” · “Stage 1: 17,558 flagged; 2,287 randomly sampled; 93 manually confirmed (4.1%); 'we estimate between 600 and 1,650 contain exploitable vulnerabilities (3.1% – 8.6%)'”
   - Sample/method: GitHub corpus of >19,000 MCP server repos; GH Archive metadata; multi-stage LLM pipeline with random sample of 2,287.
   - Limitations: Repo-collection method and exact count not stated on the EN page; no publisher breakdown; DE version not verified.

30. **The State of MCP Security — July 2026 (32,820 MCP Servers Classified)** — PolicyLayer; HF dataset PolicyLayer/mcp-server-catalogue (CC BY 4.0) — snapshot 1 July 2026, updated monthly  
   <https://policylayer.com/research/state-of-mcp-2026>  
   A four-source harvest (official registry, npm, Smithery, Glama) counting servers with parseable tool lists; shows month-to-month method instability.
   - Figures: “'517,973 tools across 32,820 working servers'; '+1516%' from the June edition's 2,031 servers” · “'43.28%' of servers expose a destructive or execute tool; median 7 tools, mean 15.8” · “Sources: official registry, npm, Smithery, Glama; extraction via npm tarball static analysis, README parsing, sandboxed live execution; 76.1% high-confidence, 0.3% verified” · “Footer: '46,500+' servers and '515,000+' tools; HF card: '2,031 servers · 31,000 tools · classified June 2026'”
   - Sample/method: Harvest of official registry + npm + Smithery + Glama, snapshot 2026-07-01; counts only servers with a parsed tool list.
   - Limitations: Vendor report; 'working' means tool list parsed; 16x jump between editions; HF dataset not updated; no publisher/growth analysis.

31. **State of the MCP Ecosystem — July 2026** — MCP Queen (Health AI) — 2026-07-28  
   <https://mcpqueen.com/reports/state-of-mcp-2026-07>  
   An official-registry count with remote share and live-probe reachability of every remote endpoint.
   - Figures: “'18,849 servers in the official MCP registry (18,650 marked active)'” · “'9,312 (49.9%) advertise a remote endpoint. The other 9,338 are local-install only (npx/uvx/docker)'” · “'43,320 live probes of 9,326 remote servers'; '7,723 (82.8%) are reachable right now. 1,603 (17.2%) are dead'” · “'102,013 tools from 5,241 servers (about 19 tools per server)'”
   - Sample/method: Registry metadata for the full corpus plus deterministic protocol probes of 9,326 remote servers; CSV of 9,326 rows published.
   - Limitations: Vendor report; single registry; single snapshot; no publisher or growth analysis.

32. **CANOPII State of MCP Security 2026 — Annual Report** — Canopii — July 2026 (scan June 2026)  
   <https://www.canopii.dev/State%20of%20MCP%20Security%202026.pdf>  
   A June-2026 official-registry scan scoring 11,524 servers (population size only; security-focused).
   - Figures: “'11,524 servers scored'; 'Canopii scanned the MCP registry in June 2026 and scored 11,524 servers on their latest version via static analysis, supply-chain checks, live endpoint probes, and AI-assisted review'” · “Grades: 'A · 43.5%  B · 45.5%  C 3.8  D 5.0  F 2.2%'; '78% of checked servers don't pin their dependencies (8,735 of 11,141)'; '7 packages confirmed as typosquats'; '0 signed releases verified across nearly 11,700 servers checked'”
   - Sample/method: Official MCP registry scan June 2026; 11,524 servers scored on latest version.
   - Limitations: Vendor marketing PDF; single registry; 11,524 is far below contemporaneous registry counts with no exclusion rule stated; no publisher or timeline data.

33. **MCP Ecosystem H1 2026 Retrospective: Adoption Data Points** — Digital Applied (consulting blog) — secondary — 2026-05-15  
   <https://www.digitalapplied.com/blog/mcp-ecosystem-h1-2026-retrospective-adoption-data-points>  
   A directional combined count and the only explicit (qualitative) statement about the shift from independent developers to first-party vendor servers.
   - Figures: “'PulseMCP, registry.modelcontextprotocol.io, Smithery, and mcp.so tracked ~9,400 distinct MCP servers by mid-April 2026, up from ~6,800 at year-end 2025 — roughly +38% growth in four months.'” · “'The same server can appear under multiple namespaces... so any single number is a directional estimate.'” · “'Through 2025, most SaaS connectors were authored by independent developers or the agent vendors themselves; through H1 2026, the underlying SaaS vendors increasingly shipped their own first-party MCP servers'” · “'no public registry (PulseMCP, registry.modelcontextprotocol.io, Smithery, mcp.so) publishes this five-bucket category split'”
   - Sample/method: Combined registry counts (4 registries + npm keyword) as of mid-April 2026; no dedup method; category split from an undisclosed internal snapshot.
   - Limitations: No raw data or per-registry numbers; the ~9,400 total is far below PulseMCP's own directory; Smithery monthly figures attributed to it are not on the page.

34. **We Scanned 1,808 MCP Servers. 66% Had Security Findings.** — AgentSeal — 2026-03-14  
   <https://agentseal.org/blog/mcp-server-security-findings>  
   An unsourced ecosystem growth claim (714 in Jan 2025 -> 16,000+) attached to a 1,808-server scan.
   - Figures: “'There are now over 16,000 MCP servers in the ecosystem, up from 714 in January 2025.' (no citation)” · “'The scan covered 1,808 MCP servers discovered through GitHub repositories, npm and PyPI packages implementing the MCP protocol, public MCP registries including Smithery and MCP.run, and community directories.'” · “'1,196 servers (66%) had at least one security finding'; '16,840 tools analyzed'”
   - Sample/method: n=1,808 from mixed sources, Feb-Mar 2026; growth claim has no method.
   - Limitations: Growth figure unsourced; sample selection unexplained; vendor blog.

35. **MCP Servers: What We Found When We Actually Looked** — Clutch Security (Ofir Har-Chen) — 2025-12-04  
   <https://www.clutch.security/blog/mcp-servers-what-we-found-when-we-actually-looked>  
   A vendor growth claim (3 -> 6,878 published implementations, Oct 2024-Nov 2025) and a modelled 'unofficial' share, without disclosed data source.
   - Figures: “'Between October 2024 and November 2025, Model Context Protocol servers went from 3 published implementations to 6,878. That's 2,200% growth in 13 months.'” · “'Of these, 38% (1,161 servers) are unofficial implementations from unknown authors.' (inside a hypothetical 10,000-person organization model)” · “86% local architecture; 95% on employee endpoints; 3% of published servers contain valid hardcoded credentials”
   - Sample/method: Undisclosed on page (refers to a 'full paper').
   - Limitations: No method; 'published implementations' undefined; the 38% figure is model-derived; the Oct 2024 baseline predates MCP's Nov 2024 release.

36. **The Mother of All AI Supply Chains: Critical, Systemic Vulnerability at the Core of Anthropic's MCP** — OX Security — 2026-04-15  
   <https://www.ox.security/blog/the-mother-of-all-ai-supply-chains-critical-systemic-vulnerability-at-the-core-of-the-mcp/>  
   Vendor advisory citing headline counts of public servers and registries without method.
   - Figures: “'7,000+ publicly accessible servers'” · “'up to 200,000 vulnerable instances in total'” · “'9 out of 11 MCP registries were successfully "poisoned"'” · “'150M+ downloads'”
   - Sample/method: n/a (not disclosed).
   - Limitations: Vulnerability advisory; figures undocumented.

37. **Knostic's AI Security Research Unveiled: 1,862 exposed MCP servers lack essential security measures** — Knostic (via PRWeb) — 2025-07-24  
   <https://www.prweb.com/releases/knostics-ai-security-research-unveiled-1-862-exposed-mcp-servers-lack-essential-security-measures-302512722.html>  
   The earliest dated internet-exposure count found (Shodan-based).
   - Figures: “'1,862 MCP servers' exposed; Shodan + custom Python tools; 119 manually sampled, all 'allowed access to internal tool listings without authentication'”
   - Sample/method: Shodan scan + custom fingerprinting; n=1,862; manual sample 119; mid-2025.
   - Limitations: Press release; exposure count not an ecosystem census.

38. **Q2 2026 MCP Ecosystem Health (NothingHumanSearch index)** — 8bitconcepts / NothingHumanSearch — datePublished 2026-04-17; dateModified 2026-08-24  
   <https://8bitconcepts.com/research/q2-2026-mcp-ecosystem-health.html>  
   A company-website census of live /mcp endpoints, with the explicit claim that directory counts overstate live servers by an order of magnitude.
   - Figures: “'As of 2026-08-24, 5,197 agent-ready sites are indexed on NothingHumanSearch, but only 673 (12.9%) survive a real JSON-RPC handshake to their /mcp endpoint'” · “'directories claiming 10,000+ MCP servers when the actual live count is smaller by an order of magnitude'” · “Developer tools 1,578 (30.4%); AI-native tools 1,112 (21.4%); Data/analytics 489 (9.4%)” · “HN title only (2026-04-27): 'We tested 7,039 sites for MCP support; 5.8% passed a live handshake'”
   - Sample/method: Web crawl of sites with agent-discovery signals, then a live initialize handshake to /mcp; index 5,197 sites as of 2026-08-24.
   - Limitations: Measures company websites, not packages; 673 has been static since April 2026; the 7,039/5.8% figures exist only in the HN title.

39. **agent-vitals — A daily census of the AI agent tooling ecosystem on GitHub** — Keremozdemirra (GitHub user), MIT — repo created 2026-09-04; README as of 2026-09-11  
   <https://github.com/Keremozdemirra/agent-vitals>  
   A GitHub-topic daily census with an mcp tier and maintenance/licence breakdowns.
   - Figures: “'37,950 repositories across 13 topic queries in 2 tiers: mcp (16,865, 2+ stars), agents (21,085, 10+ stars)'” · “'47.8% pushed in the last 30 days'; '6,454 (17.0%) have no licence file at all'; '+242 new, -42 gone' since previous run” · “'the GitHub REST search API, public repository metadata only. Nothing is cloned, downloaded or executed.'”
   - Sample/method: GitHub topic search (13 queries), star floors 2+ (mcp) / 10+ (agents), daily since 2026-09-04.
   - Limitations: One-week-old individual project; self-declared topics; star floor excludes long tail; no registry cross-reference; no owner-type split.

40. **MCP Ecosystem - sample of 20 servers and 20 consumers** — MCP Research Alliance (Hugging Face organization), CC BY 4.0 — created 2026-07-31; last modified 2026-08-03  
   <https://huggingface.co/datasets/mcp-research-alliance/mcp-ecosystem-sample>  
   Evidence that a capture-recapture population estimate across discovery channels is being prepared but not yet published.
   - Figures: “'20 MCP servers and 20 repositories that use MCP'; '6,053 rows across 19 tables'” · “'discovery_source' overlaps 'support capture-recapture population estimates in the full dataset'” · “'Schema is identical to the full dataset'; 'Not representative... purposive sample'”
   - Sample/method: Purposive sample of 20+20 projects; multi-channel discovery; live probe for tools; full dataset not public as of 2026-09-11.
   - Limitations: Preview only; no population figures; organization identity unverified.

41. **npm registry search API: keywords:mcp** — npm (registry API) — live query by this sweep — 2026-09-11T16:10Z  
   <https://registry.npmjs.org/-/v1/search?text=keywords:mcp&size=1>  
   A package-registry-side proxy count that no published census has yet turned into a server census.
   - Figures: “keywords:mcp total = 71,737” · “keywords:modelcontextprotocol total = 2,781” · “@modelcontextprotocol/sdk v1.30.0: monthly downloads 188,117,149; dependents 69,318”
   - Sample/method: npm /-/v1/search total field for a keyword filter; live.
   - Limitations: Keyword self-tagging includes SDKs, clients, tooling and spam and misses untagged servers; no publisher or timeline data.

42. **Smithery registry API /servers (pagination metadata)** — Smithery (registry operator API) — live query by this sweep — 2026-09-11  
   <https://registry.smithery.ai/servers?pageSize=1>  
   Smithery's own total, which conflicts with what third parties can enumerate from the same API.
   - Figures: “pagination: totalCount 14,029; totalPages 500 (pageSize 1)” · “Major Labs reads the same registry as '(reports 11,882; API exposes 812)'”
   - Sample/method: Single API call; pagination is capped at 500 pages so the full list cannot be enumerated.
   - Limitations: Operator-reported total with no inclusion rule; not independently enumerable.

43. **fronalabs/mcp-registry-database — daily GitHub-enriched snapshots of the official MCP registry** — fronalabs (GitHub) — release sync-20260911T031317Z (2026-09-11T03:13Z); daily releases  
   <https://github.com/fronalabs/mcp-registry-database>  
   A daily, reproducible snapshot series of the packaged (npm/PyPI) subset of the official registry with GitHub enrichment.
   - Figures: “metadata.json 2026-09-11: total_servers 11,891; active 11,669; deprecated 222; with_github_repo 11,891; enriched_with_github 10,383; by_registry_type pypi 3,623, npm 8,373” · “README: 'the package registry is npm or pypi (oci, nuget, and mcpb are dropped)'; 'Remote-only servers (those with no packages[]) are dropped entirely.'; 'A GitHub Action runs daily and creates a new release only when' content changes”
   - Sample/method: Paginated sync of the official registry filtered to npm/PyPI-packaged servers with a GitHub repo, enriched via GitHub GraphQL (stars, forks, license, language, topics); daily release.
   - Limitations: Excludes remote-only, OCI, NuGet and mcpb servers by design; no publisher or growth analysis published (only per-release snapshots).

44. **LobeHub MCP Marketplace** — LobeHub — 2026-09-11 (live page)  
   <https://lobehub.com/mcp>  
   Another registry operator's headline count, illustrating the 6x spread between directories on the same day.
   - Figures: “'Explore 97,128 MCP Servers'”
   - Sample/method: Live page text; no method stated.
   - Limitations: Count without method; likely includes auto-indexed forks/duplicates.

### Not used

- <https://blog.csdn.net/weixin_53961451/article/details/164812851> — Chinese article 'MCP-06_MCP 生态现状：近万服务器的官方 Registry' (2026-09-10) surfaced by CSDN search API; page serves a JS challenge and Wayback has no capture — not opened.
- <https://blog.csdn.net/LDZKKJ/article/details/162528142> — Chinese article 'MCP 生态 12 个月观察：从协议诞生到企业接入 GA 的完整复盘' (2026-07-02); JS challenge, no Wayback capture — not opened.
- <https://web.archive.org/web/2026/https://www.pulsemcp.com/servers> — CDX listed 17 monthly snapshots (2024-12-19 to 2026-06-28) but every snapshot fetch was refused (curl 000, fetch blocked); historical PulseMCP counts not recovered.
- <https://hub.docker.com/mcp> — Docker MCP Catalog page and /v2/mcp/catalogs API returned 404/JS shell; no server count retrievable (docker/mcp-registry repo has 328 server entries but is not a census).
- <https://github.com/mcp> — GitHub MCP Registry is a JS shell with no count in the HTML.
- <https://mcp.so> — Homepage exposes no server count in HTML (JS-rendered); count only available second-hand via papers.
- <https://mcpmarket.com> — Homepage exposes no server count in HTML.
- <https://mcpservers.org> — Cloudflare challenge; not fetchable.
- <https://api.semanticscholar.org/graph/v1/paper/search> — HTTP 429 rate-limited on every attempt; scholarly cross-check of June-Sept 2026 venue papers not possible this run.
- <https://dblp.org/search/publ/api> — Bot challenge (Anubis) returned instead of JSON.
- <https://old.reddit.com/r/mcp/search.json> — Blocked (HTML login page); r/mcp discussions referenced by fetchgate not readable.
- <https://packages.ecosyste.ms/api/v1/keywords/mcp> — HTTP 402 Payment Required; ecosyste.ms keyword census unavailable.
- <https://www.pulsemcp.com/statistics> — Reachable and methodology text confirmed, but the numeric totals live in embedded charts and could not be extracted; usable only for the counting-rule description (folded into the PulseMCP entry).

### Open questions from the sweep

- arXiv 2602.14878 reportedly gives a 23/103 official-vs-community split; 2606.02314 reportedly counts 62,739 indexed MCP entries; 2605.22333 measures 7,973 live remote servers; 2603.10194 and 2608.28497 (Claude Code plugin marketplaces) were surfaced but not opened — a later check should verify whether any contains a publisher-type classification or a dedup rule.
- IEEE S&P 2026 'Parasites in the Toolchain: A Large-Scale Analysis of Attacks on the MCP Ecosystem' (Shuli Zhao et al.) and the DSN 2026 camera-ready of Li & Gao were not opened; the S&P paper may carry its own ecosystem count.
- The USENIX Security '26 skills-registry census (98,380 skills from two registries, 157 malicious) is adjacent framing and was not opened; check whether its authors also measured MCP servers.
- Hugging Face datasets csoai/mcp-census, crackedvibe/mcp-registry-probe-2026-09, automatelab/mcp-servers-catalog, Vinkius/mcp-registry (5,561 servers) and RenatoMarinho/mcp-registry (5,033+) were listed but not verified; csoai/mcp-census in particular may be a census by a mass-publisher (CSOAI-ORG appears as a top-15 namespace).
- GitHub repos kelanth/mcpanalysis (harvests official registry, MCPMarket, mcp.so, PulseMCP, Smithery, mcpservers.org), Ahmad-Faraj/mcp-conformance ('Does Your MCP Server Actually Follow the Protocol?'), radixia/mcp-census, rahman41i/Patch-Bay (Kaggle report PDF) and dit4e/toolprint-watch were seen only via README; any accompanying paper was not found on arXiv/OpenAlex.
- Zenodo preprint 'MCP Servers in Agentic AI' (record 22305899, 2026-09-02) was fetched as a record but the PDF was not read.
- mcp-research-alliance's full dataset and the capture-recapture population estimate its card promises are not yet public; the organization's identity is unverified.
- The 'April 2026 study of a broader, wild-crawled population' that operatorsheets says the 'half of MCP is dead' claim traces to was not identified.
- Two Chinese-language articles (CSDN 164812851 on the official registry 'near ten thousand servers', 2026-09-10; CSDN 162528142 '12-month observation', 2026-07-02) could not be opened; Korean and German searches were impossible (bot-blocked); Japanese coverage checked only via Qiita.
- Talks at AGNTCon+MCPCon Europe (2026-09-17/18, Amsterdam) and MCP Dev Summit NA may present operator statistics; schedules are Sessionize embeds not retrievable by curl.
- PulseMCP's historical daily counts (17 Wayback snapshots from 2024-12-19) could not be retrieved; recovering them would give the only registry-side series back to Dec 2024.
- Registry-operator discrepancies remain unexplained: Smithery totalCount 14,029 vs Major Labs' '(reports 11,882; API exposes 812)'; Glama's jump from 5,867 (June 2025) to 85,656; Canopii's 11,524 vs ~14-15k contemporaneous registry entries; mcp.so / MCP Market / mcpservers.org / Docker catalog counts not extractable.
- Effloow's page metadata (2026-04-12) contradicts its stated census date (2026-08-19); the referenced scripts/mcp-registry-census.py repo was not located.
- Bharti 2608.00997: the 8.6%/24.8% description-rewrite pair first attributed to it is absent from v2 (v2 'corrects five claims in v1'); v1 was not diffed.
- Trend Micro: the exact 19,077 repository count and collection window (attributed to the German version) were not verified; Digital Applied's Smithery ~6,000 (Mar 2026) -> ~7,300 (May 2026) figures were not found on its page.
- Semantic Scholar (429) and DBLP (bot challenge) could not be used, so venue-published MCP papers from June-September 2026 were checked only via accepted-paper pages of USENIX Sec, NDSS, S&P, CCS, ICSE, FSE, MSR, ASE and via OpenAlex/Crossref.

### Searches run

- `arXiv API (export.arxiv.org) :: all:"model context protocol" max_results=400 (+start=400) :: 539 results; entries saved and parsed`
- `arXiv API :: all:MCP AND all:server :: 254 entries`
- `arXiv API :: all:MCP AND all:security :: 264 entries`
- `arXiv API :: all:MCP AND (registry OR marketplace OR ecosystem OR census) :: 156 entries; surfaced 2606.02314, 2605.09817, 2606.25876`
- `arXiv API :: (ti/abs "context protocol") AND (empirical OR measurement OR "large-scale" OR landscape) :: 163 entries; nothing beyond known census papers`
- `arXiv API :: "context protocol" AND (npm OR PyPI OR "package registry") :: 4 entries; no npm/PyPI dependents census`
- `arXiv API :: "context protocol" AND (Gini OR concentration OR publishers OR maintainers) :: 70 entries; no Gini/HHI over MCP publishers`
- `arXiv API :: "context protocol" AND ("official registry" OR "MCP registry" OR Smithery OR Glama OR PulseMCP) :: 6 entries; 2608.00997 and 2609.10962 only`
- `arXiv API :: "context protocol" AND (growth OR adoption OR timeline OR anniversary) AND servers :: 41 entries; no growth curve since Nov 2024`
- `arXiv API :: all:"context protocol" AND (census OR publishers OR "who publishes" OR organizations OR "individual developers"), newest first :: 40 results; nothing new`
- `arXiv API :: ti:conformance AND all:"context protocol" :: 0 results`
- `arXiv API :: all:"context protocol" AND authentication AND (ecosystem OR "large-scale") :: found 2605.22333 (7,973 live remote servers) and 2512.03775; abstracts only`
- `web search :: "Model Context Protocol" empirical study ecosystem servers measurement site:arxiv.org :: already-known papers`
- `web search :: "Model Context Protocol" servers empirical OR measurement OR "large-scale" site:dl.acm.org :: TOSEM DOIs 10.1145/3814959, 10.1145/3796519; no ACM-only census`
- `web search :: "Model Context Protocol" MCP servers ecosystem site:ieeexplore.ieee.org :: privilege-management paper (2,562 apps); no census`
- `web search :: "Model Context Protocol" OR "MCP servers" site:usenix.org :: no MCP census paper`
- `web search :: "Model Context Protocol" OR "MCP server" site:ndss-symposium.org :: none`
- `web search :: "Model Context Protocol" ecosystem measurement registry servers site:semanticscholar.org :: nothing new`
- `web search :: "Model Context Protocol" servers ecosystem empirical OR measurement OR dataset site:openreview.net :: only 'MCP for Vision Systems' (47 servers)`
- `web search :: arxiv "MCP servers" publishers concentration "individual" OR "organization" GitHub owners growth "per month" :: 2602.14878 (23/103 official vs community), 2503.23278 table; no monthly curve`
- `web search :: huggingface OR zenodo dataset "MCP servers" "Model Context Protocol" registry snapshot :: HF Vinkius/mcp-registry, RenatoMarinho/mcp-registry (not opened)`
- `web search :: "@modelcontextprotocol/sdk" dependents OR "mcp" PyPI downloads empirical study arxiv 2026 :: no academic dependents study`
- `web search :: "A Survey on Model Context Protocol: Architecture, State-of-the-art, Challenges and Future Directions" arxiv :: TechRxiv survey (Ray 2025), no counts`
- `web search :: arxiv "Model Context Protocol" "26 major MCP collections" OR "consolidated dataset" ecosystem :: confirmed Hou et al.`
- `web search :: arxiv "MCP" servers "created" "November 2024" growth timeline "GitHub" ecosystem "repositories" empirical 2026 "monthly" :: only 2607.10123, 2606.30317; no monthly series`
- `web search :: "MCP servers" census ecosystem count "how many" 2026 :: digitalapplied, effloow, tooldirectory.ai, techrt, presenc.ai, chatforest`
- `web search :: "state of MCP" report 2026 servers ecosystem :: mcpqueen, mcp.institute, hidekazu-konishi, simorconsulting`
- `web search :: "analyzed" MCP servers security vendor "we analyzed" thousands MCP servers :: Astrix, Clutch, Backslash, Enkrypt, AgentSeal, Bloomberry, arxiv 2603.10194`
- `web search :: MCP anniversary "one year" Anthropic retrospective servers ecosystem November 2025 :: official anniversary post, den.dev, sdxcentral`
- `web search :: PulseMCP server count tracker "MCP servers" growth chart weekly :: pulsemcp.com/statistics; directory title variants 16,330+/18,230+/20,260+/21,940+`
- `web search :: Glama MCP servers indexed count statistics ecosystem report :: Glama State of MCP 2025, methodology, directory, mcpevals`
- `web search :: site:blog.modelcontextprotocol.io registry servers milestone :: registry preview, 2026-07-28 spec post, anniversary post`
- `web search :: Docker MCP Catalog "servers" count milestone 2026 blog :: docker.com blog (1M pulls, '100+ MCP servers')`
- `web search :: site:blog.modelcontextprotocol.io Agentic AI Foundation "97 million" servers December 2025 :: AAIF post`
- `web search :: Smithery MCP servers count "servers" registry 2026 growth :: truefoundry ('over 7,000'); digitalapplied`
- `web search :: Knostic OR "Endor Labs" OR "Trend Micro" OR Equixly MCP servers analyzed research report count :: Trend Micro 19,000; Knostic 1,862; Endor 2,614; Nordic APIs`
- `web search :: Endor Labs "2,614" MCP implementations analysis :: endorlabs.com post 2026-01-23`
- `web search :: Trend Micro "19,000" MCP servers repositories discovered GitHub "few months" AI-generated code first study :: trendaisecurity.com; trendmicro DE`
- `web search :: "Black Hat" OR "DEF CON" 2026 talk MCP servers ecosystem scanned thousands registry analysis :: no conference census talk; BlueRock '~7,000' claim`
- `web search :: "@modelcontextprotocol/sdk" dependents npm count packages "mcp" keyword how many packages :: no aggregate; queried npm API directly`
- `web search :: Zuplo "State of MCP" report survey 2026 developers servers :: usage survey (~100 tech leaders), not a census`
- `web search :: BlueRock Security analysis "7,000" public MCP servers SSRF authentication 2026 :: no such post on bluerock.io`
- `web search :: "MCP Toplist" OR "mcp.so" servers count "101,000" OR "100,000" combined registries 2026 :: mcptoplist snippet 122,723 (2026-09-08)`
- `web search (unavailable) :: arxiv "Model Context Protocol" servers "Gini" OR "Herfindahl" OR "top 10 publishers" concentration; arxiv "registry.modelcontextprotocol.io" empirical measurement 2026; arxiv "MCP servers" npm PyPI "supply chain" empirical 2026; GitHub MCP Registry launch count; Socket/Snyk/Sonatype MCP package analysis; tl;dr sec / Risky Business MCP census; "individual developers" vs "companies" share; OWASP MCP Top 10 ecosystem count; Docker MCP Catalog Aug-Sep 2026 count; Chinese-language queries (MCP 服务器 生态 统计 数量 registry 调研 2026; 模型上下文协议 MCP 服务器 实证研究 生态系统 测量 arxiv)`
- `curl usenix.org USENIX Security '26 technical sessions :: grep MCP :: 0 MCP papers; adjacent skills-registry census (98,380 skills from two registries, 157 malicious)`
- `curl ndss-symposium.org NDSS 2026 accepted papers :: grep MCP :: 0`
- `curl sp2026.ieee-security.org accepted papers :: grep MCP :: 1 hit 'Parasites in the Toolchain: A Large-Scale Analysis of Attacks on the MCP Ecosystem' (not opened)`
- `curl sigsac.org CCS 2026 accepted papers :: grep MCP :: 0`
- `curl conf.researchr.org ICSE 2026 research + journal-first :: grep MCP :: 0`
- `curl conf.researchr.org FSE 2026 research + journal-first :: grep MCP :: Hou et al. journal-first`
- `curl 2026.msrconf.org MSR 2026 technical + data/tool showcase :: grep MCP :: Toeppe et al. dataset paper`
- `curl conf.researchr.org ASE 2026 all tracks :: grep MCP :: 0`
- `Semantic Scholar Graph API :: 'Model Context Protocol ecosystem'; 'model context protocol measurement ecosystem registry' year 2026 :: HTTP 429 (4 attempts)`
- `DBLP publ API :: q='Model Context Protocol' :: bot challenge page`
- `Crossref API :: DOIs 10.1145/3814959, 10.1145/3796519, 10.1145/3793302.3793311 :: confirmed TOSEM 2026-05-12, TOSEM 2026-02-16, MSR '26 2026-04-13`
- `OpenAlex API :: search="model context protocol" servers ecosystem, from 2026-05-01 :: 535 works; surfaced Zenodo State of MCP dataset, Zenodo 'MCP Servers in Agentic AI' preprint, arXiv 2608.28497`
- `OpenAlex API :: "agent skills" OR "skills marketplace" OR "agent cards" ecosystem measurement since 2026-01-01 :: too broad (110,153 works); nothing`
- `Zenodo records API :: q="model context protocol" servers (and AND registry/ecosystem variant) :: 6,821 noisy hits; records 22674847, 22305899, 21869879 fetched`
- `Hacker News Algolia API (7 queries) :: "MCP servers" analyzed; MCP registry servers; state of MCP; MCP ecosystem; MCP servers scanned; MCP census; search_by_date since May 2026 :: fetchgate, MCP Census, Canopii, MCPExplorer, PolicyLayer, 8bitconcepts, getvet.ai, armor1`
- `Bluesky public search API (5 queries) :: MCP servers census; how many MCP servers; MCP registry 30,000 servers; MCP servers publishers organizations individuals; state of MCP 2026 :: non-JSON responses`
- `Hugging Face Hub API :: datasets?search=mcp sorted by lastModified; datasets?author=mcp-research-alliance :: csoai/mcp-census, Ashsinha1/mcp-registry-census, mcp-research-alliance/mcp-ecosystem-sample, BIFF-AI/mcptoplist, lastseen-dev/mcp-mortality, crackedvibe/mcp-registry-probe-2026-09, automatelab/mcp-servers-catalog, PolicyLayer/mcp-server-catalogue`
- `GitHub repo search (gh api) :: mcp census; mcp registry snapshot; mcp servers dataset; mcp ecosystem analysis; model context protocol dataset :: agent-vitals, RoninForge/state-of-mcp, operatorsheets/state-of-mcp, fronalabs/mcp-registry-database, rahman41i/Patch-Bay, kelanth/mcpanalysis, Ahmad-Faraj/mcp-conformance, dit4e/toolprint-watch, radixia/mcp-census, arakawayasuaki/webmcp-shield-data`
- `DuckDuckGo HTML via curl :: MCP 服务器 生态 统计 数量 registry 调研 2026 :: 10 hits once (incl. CSDN 164812851); all later requests bot-challenged`
- `Bing RSS/HTML via curl (7 queries, EN/JA/KO/DE) :: MCP servers ecosystem census how many 2026; MCP サーバー エコシステム 調査 レジストリ 数 2026; MCP 서버 생태계 분석 레지스트리 통계 2026; MCP-Server Ökosystem Studie Anzahl Registry Analyse 2026; "MCP servers" census publishers concentration; individuals vs companies; mcpcensus 15,382 :: bot-throttled generic results, unusable`
- `Bing via curl :: "GitHub MCP Registry" launch github.blog; site:socket.dev "MCP servers"; site:snyk.io "MCP servers"; site:tldrsec.com MCP; OX Security "Mother of All AI Supply Chains" :: navigational noise; site: ignored`
- `Startpage, Yahoo, Marginalia, Mojeek via curl :: "MCP servers" census publishers :: empty/blocked`
- `Qiita API v2 :: MCP サーバー 調査 エコシステム :: 20 items, no census`
- `CSDN search API :: MCP 生态 服务器 数量 统计 报告 :: two candidate articles (2026-09-10, 2026-07-02), pages not openable`
- `Piped API (YouTube) :: MCP registry servers ecosystem state 2026 :: non-JSON`
- `OWASP GenAI site search :: ?s=MCP :: scanners and secure-development guide only`
- `CSA blog search :: ?search=MCP :: nothing`
- `curl grep MCP :: GitHub Octoverse 2025; Sonatype State of the Software Supply Chain :: zero mentions`
- `curl :: aaif.io; agenticaifoundation.org; linuxfoundation.org/research; AGNTCon+MCPCon Europe / MCP Dev Summit NA schedules :: events only; Sessionize embeds not retrievable`
- `old.reddit.com search.json r/mcp :: census OR "how many servers" OR "state of mcp" :: blocked`
- `ecosyste.ms API :: keywords/mcp :: HTTP 402`
- `npm registry API :: /-/v1/search?text=keywords:mcp and keywords:modelcontextprotocol :: 71,737 / 2,781 (2026-09-11T16:10Z)`
- `official MCP registry API :: /v0/servers?version=latest full pagination (309-310 pages, two runs 2026-09-11) :: 30,827 then 30,913 entries; namespace and publishedAt breakdown computed`
- `Smithery registry API :: /servers?pageSize=1 :: totalCount 14,029, totalPages 500 (2026-09-11, re-run for the write-up)`
- `GitHub API + release download :: fronalabs/mcp-registry-database releases/latest + metadata.json + README :: total_servers 11,891 (npm 8,373 / pypi 3,623), npm/PyPI-only by design (re-run for the write-up)`
- `curl :: lobehub.com/mcp :: 'Explore 97,128 MCP Servers' (re-run for the write-up)`
- `curl :: mcp.so, mcpservers.org, mcpmarket.com :: no counts extractable / Cloudflare`
- `curl + gh api :: hub.docker.com/mcp; docker/mcp-registry tree; github.com/mcp :: 404/JS; 328 server entries; JS shell`
- `fetch + curl :: pulsemcp.com/servers with ?classification=official-providers / community / ?other=remote :: 21,940 / 6,258 / 15,647 / 5,833`
- `curl + fetch :: web.archive.org CDX + snapshots of pulsemcp.com/servers :: 17 snapshots listed, all fetches refused`
- `curl :: majorlabs.co/data, mcp-stats.json, mcp-history.json; Zenodo README/aggregate-history.csv/discovery-runs.csv/MANIFEST.json/mcp-servers.csv :: fetched; owner names but no owner-type column`
- `curl :: mcpcensus.pages.dev /report /coverage /methodology /why; api.mcpcensus.com/v1/coverage :: fetched (/why 404)`
- `curl :: fetchgate.dev/blog/mcp-registry-audit-2026 and /tools/mcp-registry-audit :: fetched`
- `curl + gh api :: operatorsheets.github.io/state-of-mcp/ and repo contents :: fetched; census-2026-07-30.csv/json`
- `curl :: lastseen.dev homepage, /reports/mcp-mortality-2026-07/, /reports/ :: fetched; index 404`
- `curl + pdftotext :: canopii.dev State of MCP Security 2026 PDF :: 8 pages extracted`
- `curl :: policylayer.com/research/state-of-mcp-2026; HF PolicyLayer/mcp-server-catalogue :: fetched`
- `curl :: mcptoplist.com, /methodology, /growth; HF BIFF-AI/mcptoplist via API + datasets-server :: fetched (/growth 404)`
- `curl :: glama.ai/mcp/servers, /mcp/methodology, blog State of MCP 2025 :: fetched`
- `curl/fetch :: effloow, mcpqueen, bloomberry, digitalapplied, astrix, trendaisecurity (EN; DE guess failed), agentseal (UA needed), clutch, ox.security, prweb Knostic, 8bitconcepts (+HN Algolia title check), agent-vitals (+GitHub API), mcp-research-alliance (+HF API), Ashsinha1 (+HF API, census-history.csv), RoninForge (+GitHub API), official MCP blog posts :: all fetched and figures grepped`

## Privilege surface: declared vs actual

**Verdict:** partial · 38 supporting sources · 6 not used · 108 searches

### Supporting sources

1. **MCP-SandboxScan: WASM-based Secure Execution and Runtime Analysis for MCP Tools (SandScope)** — arXiv cs.CR; Zhuoran Tan, Run Hao, Jeremy Singer, Yutian Tang, Christos Anagnostopoulos (Univ. of Glasgow) — v1 2026-01-03; v2 2026-06-22  
   <https://arxiv.org/abs/2601.01241>  
   The only academic runtime declared-vs-observed comparison found: sandboxed stdio/WASI execution of unmodified MCP servers with canary sources, cross-validating declared egress semantics from tools/list metadata against observed network egress (Table 8) over 33 repositories.
   - Figures: “'We construct a 100-repository MCP corpus from star-ranked GitHub search results'” · “'SandScope resolves 91 repositories for dynamic scanning'; shallow scans completed for 35 (38.5%)” · “'recovers metadata for 1,127 tools across 71 repositories, including 886 tools with security-sensitive declared capabilities' (78.6%)” · “'Among 35 shallow-success repositories, SandScope successfully re-executes 33 and observes 60 witnesses across 12 repositories'” · “Table 8 (33 repos): declared egress risk and observed egress = 5; declared egress risk only = 14; observed egress only = 4 ('Potential metadata understatement or classifier miss'); neither declared nor observed = 10”
   - Sample/method: Top-100 star-ranked GitHub MCP repos after filtering SDKs/docs/registries/clients; dynamic stdio/WASI execution recording source-to-sink witnesses and network-intent/egress evidence; declared capabilities recovered from tools/list names/descriptions/schemas and static registrations (README used only as weak context).
   - Limitations: 33 repos in the declared-vs-observed table; popularity-biased GitHub sample; 'declared' excludes readOnlyHint/destructiveHint annotations, README permission claims, env vars and OAuth scopes; egress is the only dimension cross-tabulated; single non-destructive scan scenario; the paper states this is 'not classifier accuracy against vulnerability ground truth'.

2. **Declared vs. Observed: Measuring the Binding Gap in MCP Tool Declarations (paper) + companion dataset 'MCP Declared-Effect Coverage and Contract Binding v1' (https://doi.org/10.5281/zenodo.21778282)** — Zenodo (self-published, CC BY 4.0); Gautam Bharti (independent) and Mayur Agnihotri (StraightArc Technologies) — paper 2026-09-07; dataset 2026-08-03  
   <https://doi.org/10.5281/zenodo.22649163>  
   Ecosystem-scale longitudinal measurement of readOnlyHint/destructiveHint/idempotentHint/openWorldHint declarations on the official registry, defining bound/stale/undeclared states and a 'binding gap' between declared and still-bound annotation coverage - explicitly contract-level with no runtime observation.
   - Figures: “'Across 35 crawls of the public Model Context Protocol registry between June and August 2026, covering 44,172 tools on 2,043 servers, 83.8% of tools declare at least one canonical effect annotation, and 59.3% hold a declaration still bound to an unmutated contract. The difference, 24.5 percentage points'” · “Funnel: 4,909 registry entries attempted, 2,051 reachable, 2,043 serving tools, 44,172 tools; results.json: declaring 37,001, bound 26,197, stale 10,751, undeclared 7,171, unobserved 53; server-level binding gap 49.98 pp (1,338 declaring, 317 verified)” · “'The corpus holds 783 confirmed declaration flips at K_CORR = 2'; dataset flips_v1.csv = 1,186 per-hint rows (destructiveHint 397, openWorldHint 467, idempotentHint 284, readOnlyHint 38)” · “'86.0% of first declarations land permissive, a rate that holds between 83.4% and 94.0% under the omission of any single publisher'” · “'Over the longest uninterrupted 21-day window, 18.3% of the declaring and judgeable tools in that window (6,279 of 34,318) experienced a confirmed contract mutation'” · “'No runtime behaviour is observed and no action is ever witnessed executing'; 'Staleness is not falsity'; 'Annotations are deliberately excluded from the contract'”
   - Sample/method: 35 crawls of registry.modelcontextprotocol.io (2026-06-09 to 2026-08-01) of every reachable remote server; per-tool binding state at final observation with corroboration thresholds K_CORR=2, K_MIN=3 and a sensitivity table; 'confirmations are repeated crawls by one crawler'.
   - Limitations: Contract-level only (drift of declarations relative to tools/list description/inputSchema/outputSchema), never what the server does; remote-reachable population only (local/stdio-only servers excluded); single crawler and author group, not peer-reviewed; pseudonymised identifiers prevent re-auditing named servers; 'stale' does not mean 'wrong'.

3. **How Glama indexes the MCP ecosystem (methodology page)** — Glama (glama.ai), registry operator — undated; Wayback captures 2026-05-08, 2026-08-04, 2026-08-07 (sandbox text already present 2026-05-08)  
   <https://glama.ai/mcp/methodology>  
   Documents a registry-scale operational pipeline that builds and runs every open-source listing in a Firecracker microVM, captures annotation hints as 'the authoritative description of the server's declared capabilities', and observes the process 'at the syscall and network layers' for behaviour outside the declared set - but publishes no aggregate declared-vs-observed rates.
   - Figures: “'In the twelve months preceding this writing, Glama has performed over one million such scans'” · “Representative flagged patterns (verbatim): access to credential paths not required by the declared capability set; outbound network traffic to hosts not referenced by the server's manifest or source code; exfiltration payload signatures; process forks into unrelated binaries; filesystem writes outside the declared working directory” · “Findings classed Malicious (internal review, maintainer contact or de-listing) or Risky (surfaced on the public listing); each listing carries 'A behavioural profile from sandbox observation (open-source) or scheduled-connection observation (connectors)' and 'A change history for both schema and behaviour'” · “Only ecosystem-scale numbers are TDQS description-quality figures: 'a study of 856 tools across 103 servers and a broader survey of 10,831 MCP servers'; '97% of tools contain at least one defect, 56% lack clarity on what the tool actually does, and 89% omit usage constraints'”
   - Sample/method: Vendor pipeline description; ruleset 'non-exhaustive, and deliberately not a full disclosure'; no sample, dates or method for the behavioural findings.
   - Limitations: Vendor marketing/methodology page; no published mismatch rate, per-finding data or dataset; behavioural ruleset undisclosed; server listing pages inspected showed no behavioural section in static HTML. Establishes that declaration-relative runtime observation runs at scale, not that results exist in the public record.

4. **Description-Code Inconsistency in Real-world MCP Servers: Measurement, Detection, and Security Implications (DCIChecker)** — arXiv cs.CR; Yutao Shi, Xiaohan Zhang, Xiangjing Zhang, Xihua Shen, Hui Ouyang, Huming Qiu, Mi Zhang, Min Yang — v1 2026-06-03  
   <https://arxiv.org/abs/2606.04769>  
   Largest static measurement of tool-description claims versus implementation, with an explicit 'Undeclared Side Effects' category, across 2,214 Python MCP servers - no execution.
   - Figures: “'19,200 description-code pairs extracted from 2,214 real-world MCP servers'; Table V: valid pairs 17,030 (88.70%), DCI 1,907 (9.93% of all tools; 11.20% of valid pairs); servers with DCI 775 (35.00% of 2,214)” · “'Mismatched Functionality (Type I) ... accounts for 75.2%'; 'Undeclared Side Effects (Type II) ... 24.8%'; Fig. 4: Func-Over 35.4, Eff-RO 22.83, Eff-SM 14.64, Func-Am 13.6, Func-Un 9.15, Func-Mis 3.34, Eff-DL 1.03” · “'Table A.4 summarizes the 7,562 sensitive calls identified across 4,479 tools'” · “DRA on D_real: '96.00% precision and 97.46% recall, yielding the best F1 (96.73%) and accuracy (96.75%)'” · “'we did not execute third-party MCP tools against live systems, interact with external services, or attempt to exploit deployed systems'”
   - Sample/method: Server dataset inherited from prior work aggregating multiple marketplaces; Python only; structure-aware static analysis plus Direct-Reverse-Arbitration LLM prompting; validated on 400 annotated pairs and a mutation-based synthetic set.
   - Limitations: Static only, Python only, single snapshot; 'declared' is the natural-language tool description, not annotations, manifests, env-var or OAuth declarations; no mention of readOnlyHint/destructiveHint; LLM-judged labels.

5. **Don't believe everything you read: Understanding and Measuring MCP Behavior under Misleading Tool Descriptions (MCPDiff)** — arXiv cs.CR/cs.AI; Zhihao Li, Boyang Ma, Xuelong Dai, Minghui Xu, Yue Zhang, Biwei Yan, Kun Li — v1 2026-02-03  
   <https://arxiv.org/abs/2602.03580>  
   Static embedding-similarity measurement of description-vs-code mismatch across 10,240 marketplace servers, reporting ~13% substantial mismatch enabling 'undocumented privileged operations'.
   - Figures: “'apply it to 10,240 real-world MCP Servers across 36 categories'” · “'approximately 13% exhibit substantial mismatches that can enable undocumented privileged operations, hidden state mutations, or unauthorized financial actions'” · “Full Match 5,303; Mostly Match (80%~100%) 3,544; Partial Match (40%~80%) 1,079; Rare Match (<=40%) 314” · “Table 3: smithery Full Match '56.6% (1,899/3,357)'; mcp_world '48.8%, 2,841/5,819'; mcpmarket '50.4% (1,788/3,545)'” · “Popularity: Full Match '53.5% (4,202/7,858)' in 0-9 stars; '29.1% (25/86) in the 1000-9999 bin'; 'the Official category's Full Match rate is only about 41.5%'”
   - Sample/method: 10,240 servers from mcp_world, mcpmarket and smithery; Tree-Sitter call-chain extraction; description and code features embedded and compared by vector similarity with threshold buckets.
   - Limitations: Static heuristic with no reported ground-truth precision/recall; thresholds define 'mismatch'; no runtime; no annotation, manifest or credential comparison; per-marketplace totals (12,721) exceed 10,240 so marketplaces overlap unexplained.

6. **What a Random Draw from the MCP Registry Contains, and What Tool-Use Benchmarks Contain Instead** — arXiv; Haseeb Mohammed Afsar (single author) — v1 2026-09-10  
   <https://arxiv.org/abs/2609.10962>  
   Probability-sample measurement of readOnlyHint/destructiveHint/idempotentHint/openWorldHint presence on official-registry npm/stdio servers probed over the wire - omission rates only, no correctness.
   - Figures: “'From a 24,135-server registry census we draw 400 npm / stdio servers with a published seed'; population grew 'from 16,548 to 24,135 unique servers between 2026-07-14 and 2026-08-22'” · “Table 1: Included 195 (48.8%); handshake failed 150 (37.5%); needs credentials 53 (13.3%); package unavailable 2 (0.5%)” · “'Of the 194 included servers advertising at least one tool, 72 annotate every tool and 122 annotate none. 1,626 of 2,766 tools (58.8%) carry no annotations. The curated frame gave 41.5%. Curation therefore flatters this figure by 17.3 points'” · “'zero fatal JSON Schema violations across 2,766 advertised tools'; 'npm / stdio only, which is 30.7% of the population and falling'”
   - Sample/method: Official registry census; npm/stdio candidate frame 7,258; seeded random draw of 400 (seed 20260819); each probed once, no repair, no credentials; 195 included.
   - Limitations: Annotation presence only, explicitly not correctness; npm/stdio only; 48.8% of the draw could not be probed; single author v1; curated comparison frame n=24.

7. **Canopii - State of MCP Security 2026 (Annual Report)** — Canopii (index.canopii.dev) — July 2026 (registry scanned June 2026)  
   <https://www.canopii.dev/State%20of%20MCP%20Security%202026.pdf>  
   Vendor scan of 11,524 registry servers whose Finding 05 is the only cross-server vendor measurement of a declaration against observed behaviour (auth declared in manifest vs anonymous tool-list access, n=77), alongside static over-privilege proxies and post-publication tool-definition changes.
   - Figures: “'11,524 servers scored'; 'One in every fourteen published servers - 830 in total - carries security failures serious enough to grade D or F'; grades A 43.5% B 45.5% C 3.8 D 5.0 F 2.2%” · “'We probed live remote MCP endpoints. Of 77 servers that declare authentication in their manifest, 24 - nearly one in three - served their full tool list to anonymous callers. That's 741 tools exposed on the top 20 alone; 31%'” · “'184 versions changed their tool definitions after publication'; version pairs 'stable · 90.6% changed · 9.4%'; 'Roughly 170 distinct servers showed at least one rug pull'” · “'232 servers ship a confirmed dangerous code sink: Arbitrary code eval 141, Command injection 69, Unsafe deserialization 42; 1,625 path-traversal; 952 SSRF'” · “'81% of servers ship with no sandboxing; 1,709 bind to all network interfaces by default; 260 run install scripts; 86% have no security policy; 0 signed releases verified across nearly 11,700 servers checked; 8,735 of 11,141 don't pin dependencies'” · “AI-review advisories: 'Sensitive data access 405, Destructive scope 307, Data exfiltration 139, Hidden instructions 130, Tool poisoning 106, Prompt injection 71'” · “'1000+ ★ 18.7% high-risk vs <10 ★ 3.6%; 6 of the 15 most-starred servers in the registry grade D or F'”
   - Sample/method: 'Canopii scanned the MCP registry in June 2026 and scored 11,524 servers on their latest version via static analysis, supply-chain checks, live endpoint probes, and AI-assisted review. Percentages are of checked servers per control.'
   - Limitations: Vendor report; 'Destructive scope' advisories are LLM-judged static reads, not runtime behaviour; the only runtime probe is auth on 77 servers; readOnlyHint/destructiveHint do not appear in the PDF; scoring rubric and confidence metric not fully disclosed.

8. **The MCP Security Index (Canopii Trust Index, Live edition)** — Canopii — captured 2026-09-11 (rubric v2.9.0)  
   <https://index.canopii.dev/mcp-security-index>  
   Live continuation of the Canopii scan at 25,390 servers with per-control failed/warned/evaluated denominators, including the auth-declared-vs-anonymous probe over 4,507 live endpoints and a static 'no destructive scope' tool control.
   - Figures: “'We independently scanned 25,390 Model Context Protocol servers. 15% scored D or F, 0% ship committed secrets, and 45% declare no authentication at all'; grades A 7,980 (31%), B 11,264 (44%), C 2,240 (9%), D 2,974 (12%), F 932 (4%), 6,828 unverifiable” · “'We reached 4,507 live MCP endpoints. Of those, 2% declared that authentication was required and then served their tool surface to an anonymous caller'” · “'No over-broad / destructive tools Guard tool.no_destructive_scope 10% 2,013 failed 0 warned 19,896 evaluated'” · “'No risky post-publish tool changes (rug-pull) Guard tool.no_rug_pull 0% 14 failed 1,333 warned 6,338 evaluated'; 'No install/post-install scripts ... 360 failed 0 warned 8,166 evaluated'” · “Per-server control wording: 'No over-broad or destructive tools (arbitrary shell, bulk-delete) that warrant human approval'; 'Every consecutive version pair is diffed for new injection markers or destructive scope'”
   - Sample/method: Continuous vendor scan of registry servers; per-control denominators shown; 4,507 live endpoints probed for auth; methodology page not opened.
   - Limitations: Unfrozen figures that drift per recompute; vendor-scored; 'destructive scope' is a static/LLM judgment on tool definitions; no annotation-hint control; no runtime file/network/subprocess evidence.

9. **AgentBound: Securing Execution Boundaries of AI Agents (also FSE 2026, DOI 10.1145/3808103)** — arXiv cs.CR; Christoph Bühler, Matteo Biagiola, Luca Di Grazia, Guido Salvaneschi (Univ. of St. Gallen); PACMSE Vol. 3 Article FSE096 — v1 2025-10-24; v3 2026-04-24  
   <https://arxiv.org/abs/2510.21236>  
   Capability-manifest proposal with LLM-generated manifests from source for 296 popular servers, giving the best per-capability prevalence figures (filesystem write, env read, network) - derived from code, not runtime, and not compared with anything the server itself declares.
   - Figures: “'We selected the top 300 MCP servers with the most GitHub stars, ranging from 59 to 63,215 stars'; 'Of the 300 selected servers, we could download 296'” · “Figure 6 (percent of 296 servers): network.client 83.1, system.env.read 79.6, filesystem.read 74.1, filesystem.write 49.3, network.server 30.6, others 65.6” · “'Out of a total of 816 capabilities (17 capabilities by 48 MCP servers), AgentManifestGen's output matched the human reference in 787 capabilities. This yields an overall accuracy of 96.5%'” · “'17.7% of the manifests were explicitly accepted as correct and complete, 4.2% are still under discussion, while 4.2% were rejected as inaccurate. Overall, automatically generated manifests are 80.9% accurate and precise, while recall is 100%' (96 developer-facing GitHub issues)”
   - Sample/method: Top-300 PulseMCP servers by stars (accessed 2025-09-10), 296 cloned; LLM manifest generation from source; validation via 48 manual manifests and 96 GitHub issues to developers.
   - Limitations: Source-derived, not runtime-observed; no comparison against server-declared metadata (annotations, README, env vars); popularity-biased; 80.9% accuracy rests on a 25.9% developer response rate.

10. **ToolGuardian: Declarative Security for AI Agent-Tool Interactions** — arXiv cs.CR; Arun Ravindran (UNC Charlotte), Saurabh Deochake (SentinelOne) — v1 2026-07-23  
   <https://arxiv.org/abs/2607.21835>  
   Framework whose 'Effect Conformance' tier contrasts L0 tool descriptions (declared intent) with L2 syscall-trace/mock-execution effects and emits facts such as effect_mismatch(T, undeclared_network_access) - evaluated on 16 tools only.
   - Figures: “'We evaluate ToolGuardian on 16 MCP-style tools, including 8 malicious variants derived from real open-source tools, and 20 runtime scenarios'” · “'ASP reaches deny-class F1 of 0.86 and 88% accuracy using description, syscall, and observed-effect evidence' (P0 0.56/50%, P1 0.77/81%, P2 0.86/88%, P3 0.82/81%)” · “fact example: 'effect_mismatch ( T , undeclared_network_access )'”
   - Sample/method: Controlled corpus of 16 MCP-style tools (8 benign, 8 malicious variants); 20 runtime scenarios; ASP vs heuristic vs LLM policy realizations.
   - Limitations: Toy-scale, half synthetic-malicious; no population measurement; 'declared' is description text only.

11. **Auditing MCP Servers for Over-Privileged Tool Capabilities (mcp-sec-audit)** — arXiv; Charoes Huang, Xin Huang, Amin Milani Fard (NYIT Vancouver; repo github.com/nyit-vancouver/mcp-sec-audit) — v1 2026-03-23  
   <https://arxiv.org/abs/2603.21641>  
   Tool combining static pattern matching (Python) with Docker+eBPF sandboxed fuzzing and risk scoring - could measure declared-vs-observed but is evaluated only on tiny benchmarks with no cross-tabulation.
   - Figures: “'MCPTox benchmark for tool poisoning attack on 45 real-world MCP servers'; '367 out of 491 samples were detected, indicating a detection rate of 74.7%. 124 samples (25.3%) did not have explicit capability indicators'” · “appsecco lab (9 servers): static '100% detection (2/2) on Python-based servers but 0% detection (0/7) on JavaScript-based servers'; dynamic '100% coverage (9/9 servers)'” · “'Dynamic analysis consistently assigned higher scores than static analysis (average increase: +36.2 points)'”
   - Sample/method: Controlled vulnerable server, MCPTox (45 servers/491 samples), appsecco vulnerable-mcp-servers-lab (9 servers); static rules for Python, dynamic Docker/eBPF monitoring.
   - Limitations: No real-world ecosystem measurement; static path Python-only; no declared-vs-observed comparison; tool repo not opened.

12. **mcpindex Drift Report - Edition v1 dataset (live counterpart https://mcpindex.ai/drift-report)** — Zenodo / mcpindex.ai; Gautam Bharti (independent); CC BY 4.0; v1.1 — 2026-08-03 (corpus cut 2026-07-19); live page 2026-09-11  
   <https://doi.org/10.5281/zenodo.21778727>  
   Contract-diff census of consecutive registry snapshots counting safety-relevant tool-definition changes, including annotation flips to destructive and the share that occur without a version bump.
   - Figures: “snapshot_count 23, first 2026-06-09, last 2026-07-19, elapsed_days 40, gap 21.1 days; events_total 57517; safety_events 3058; deduped_safety_incidents 2503” · “incidents_by_kind: output-schema-changed 992, tool-removed 872, removed-param 197, annotation-flip-to-destructive 123, constraint-narrowed 117, added-required-param 88, type-changed 64, enum-values-removed 27, required-set-expanded 23” · “version_delta_split same 1561 / changed 942; silent_share_pct 62.4” · “Live page 2026-09-11: '76 snapshots across 93 days (2026-06-09 to 2026-09-10)'; deduped incidents 15,593; raw events 358,491; annotation-flip-to-destructive 653 (4.2%); 'Population: roughly 2,090 reachable remote servers'” · “'A contract diff is not a safety verdict'”
   - Sample/method: Deterministic contract diff between consecutive daily snapshots of reachable remote (streamable-http/sse) registry servers, ~2,090 servers / 44,000+ tool contracts per snapshot; one disclosed 21-day crawler outage.
   - Limitations: Contract diff only, no runtime observation; salted fingerprints hide server identities; same single crawler/author as the binding-gap paper (not independent); live figures unfrozen.

13. **Tool Annotations as Risk Vocabulary: What Hints Can and Can't Do** — Model Context Protocol blog (LF Projects); Ola Hungerford, Sam Morrow (GitHub), Luca Chang (AWS) — 2026-03-16  
   <https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/>  
   Primary source for the declared side and for the spec maintainers' own admission that annotations are unverified and unmeasured.
   - Figures: “'annotations are not guaranteed to faithfully describe tool behavior, and clients must treat them as untrusted unless they come from a trusted server'” · “'An untrusted server can lie. A server can claim readOnlyHint: true and delete your files anyway.'” · “'no MCP client lets users filter tools by annotation values, and none surface annotations as context in approval prompts'” · “'coverage is uneven. Many servers ship without them, and clients vary in how strictly they honor the pessimistic defaults'” · “'GitHub's read-only mode is the closest production analog, enabled by about 17% of users.'” · “Open question listed: 'whether any annotations should be evaluated at runtime rather than declared statically'; SEPs #1913, #1984, #1561 unsafeOutputHint, #1560 secretHint, #1487 trustedHint”
   - Sample/method: n/a (position/status post); the 17% figure has no stated source or method.
   - Limitations: No measurement; 'coverage is uneven' unquantified; 17% refers to users enabling GitHub's read-only mode, not annotation accuracy.

14. **We scanned 50+ MCP servers and found HIGH-severity bugs in Atlassian, GitHub, Cloudflare, and Microsoft - here's what we learned** — Truong Bui (MCPSafe, mcpsafe.io) on DEV Community — 2026-05-13  
   <https://dev.to/truong_bui_eaec3f963bbe21/we-scanned-50-mcp-servers-and-found-high-severity-bugs-in-atlassian-github-cloudflare-and-3a42>  
   The only concrete published readOnlyHint-mislabel finding: a single-server case (github/github-mcp-server, dynamic toolset mode) from an LLM-judge scan of 50+ repositories.
   - Figures: “'We found GitHub's official github/github-mcp-server sets readOnlyHint: true on several tools that, when called in dynamic toolset mode, can be combined to achieve write operations.'” · “'D006 GitHub ReadOnlyHint mislabeling in dynamic toolset mode 7.1 Reported'; 'AIVSS score: 7.1 \| CVSS equivalent: 7.1 (High)'” · “'Over the past three months, we've scanned 50+ MCP servers across GitHub, npm, and PyPI'; 'TL;DR: the majority receive a grade of D or lower'”
   - Sample/method: MCPSafe five-model LLM judge panel over 6 threat vectors on 50+ repositories (GitHub, npm, PyPI) over three months; no server list or selection criteria.
   - Limitations: Vendor self-promotion; static LLM-judge scanning, not runtime; one server; the 'combination of read tools' argument is not a tool that itself writes; GitHub's response undocumented; no ecosystem annotation-accuracy rate.

15. **Behavioral Scanning - cisco-ai-defense/mcp-scanner (plus announcement https://blogs.cisco.com/ai/ciscos-mcp-scanner-introduces-behavioral-code-threat-analysis, 2025-12-22)** — Cisco AI Defense (GitHub; Cisco Blogs: Amy Chang, Harish Santhanalakshmi Ganesan, Sanket Mendapara) — doc first committed with release 4.0 (4.0.1 published 2025-12-18); multi-language 2026-04-14  
   <https://github.com/cisco-ai-defense/mcp-scanner/blob/main/docs/behavioral-scanning.md>  
   Production static analyzer that detects 'behavioral mismatches between what a function claims to do (via its docstring) and what it actually does (via its implementation)' - code is never executed and no cross-server statistics are published.
   - Figures: “repo stargazers_count 1070 (GitHub API, 2026-09-11)” · “Supported languages: Python, TypeScript, JavaScript, Go, Java, Kotlin, C#, Rust, Ruby, PHP; 'Maximum depth of 3 levels' for taint and cross-file tracking” · “'package code is never executed in either mode'” · “4.0.1 changelog: 'LLM-powered alignment checking - Verifies tool implementations match their documented descriptions'” · “Blog categories: Hidden Operations, Data Exfiltration, Injection Attacks, Privilege Abuse ('Tools that perform actions beyond their stated scope')”
   - Sample/method: n/a (tool documentation and vendor announcement; no dataset).
   - Limitations: Tool not study; docstring/description is the only declared artefact compared (not annotations, scopes or env-var claims); static with depth-3 limits; LLM judgement; no published mismatch rates.

16. **Enforcing MCP Tool Annotation Policies with Cedar (and 'Tool annotations are becoming the risk vocabulary for agentic systems', https://stacklok.com/blog/tool-annotations-are-becoming-the-risk-vocabulary-for-agentic-systems-that-matters-more-than-it-might-seem/, 2026-04-02)** — Stacklok (ToolHive); second post by Craig McLuckie (CEO) — 2026-05-05 (last modified); 2026-04-02  
   <https://stacklok.com/blog/enforcing-mcp-tool-annotation-policies-with-cedar/>  
   Runtime guard that exposes readOnlyHint/destructiveHint/idempotentHint/openWorldHint as Cedar policy attributes, acknowledges servers can lie, and states an intention to 'validate annotation accuracy against source code' - no numbers published.
   - Figures: “'A server can claim readOnlyHint: true and behave otherwise'” · “'extending that process to validate annotation accuracy against source code' (stated as work in progress)” · “'A tool that claims readOnlyHint: true should be proven to not write'; 'Annotation coverage today is uneven. Many servers ship without them'”
   - Sample/method: n/a (vendor product/opinion posts).
   - Limitations: Proposal and plan only; no data; no follow-up results found through 2026-09; the 'coverage uneven' phrasing repeats the MCP blog post.

17. **We Urgently Need Privilege Management in MCP: A Measurement of API Usage in MCP Ecosystems** — arXiv; Zhihao Li, Kun Li, Boyang Ma, Minghui Xu, Yue Zhang, Xiuzhen Cheng — v1 2025-07-05  
   <https://arxiv.org/abs/2507.06250>  
   Static measurement of network/system/file/memory API usage (the 'actual' side by proxy) across 2,562 MCP applications with no declared-side comparison.
   - Figures: “'systematically examine 2,562 real-world MCP applications spanning 23 functional categories'” · “'network and system resource APIs dominate usage patterns, affecting 1,438 and 1,237 servers respectively'; '613 servers exhibit file resource threats, while only 25 servers' memory” · “'less popular plugins often contain disproportionately high-risk operations'”
   - Sample/method: Automated static analysis framework over 2,562 MCP plugins; popularity bins by stars.
   - Limitations: Static API-pattern counting only; no runtime; no declared surface; mid-2025 snapshot.

18. **Classic Vulnerabilities Meet AI Infrastructure: Why MCP Needs AppSec** — Endor Labs; Peyton Kennedy (restating Endor Labs 2025 Dependency Management Report) — 2026-01-23  
   <https://www.endorlabs.com/learn/classic-vulnerabilities-meet-ai-infrastructure-why-mcp-needs-appsec>  
   Static sensitive-API prevalence across 2,614 MCP implementations - capability presence, not misuse or mismatch.
   - Figures: “'among 2,614 MCP implementations: 82% use file system operations prone to Path Traversal (CWE-22); 67% use sensitive APIs related to Code Injection (CWE-94); 34% use sensitive APIs related to Command Injection (CWE-78)'” · “'5-7% used APIs tied to Cross-Site Scripting (CWE-79, 7%), SQL Injection (CWE-89, 6%), Open Redirect (CWE-601, 5%)'”
   - Sample/method: Static sensitive-API usage analysis of 2,614 MCP implementations per the Endor Labs 2025 Dependency Management Report; selection and date not given in this post.
   - Limitations: Secondary restatement of a vendor report (primary not opened); measures presence of API classes, not declared-vs-actual.

19. **State of MCP Server Security 2025: Research Report** — Astrix Security; Tal Skverer — 2025-10-15  
   <https://astrix.security/learn/blog/state-of-mcp-server-security-2025/>  
   Largest measurement of the declared credential surface (README-stated credential types, storage and auth method) across 5,205 open-source servers - declared side only.
   - Figures: “'Approximately 88% of servers require credentials'” · “'Over half (53%) rely on static API keys or Personal Access Tokens (PATs)'; 'Only 8.5% use OAuth'” · “'79% of API keys are passed via simple environment variables'” · “'26.4% of servers landed in the Unknown bucket'; '5,205 unique open-source implementations' of 'approximately 20,000 repositories in GitHub implementing MCP servers'”
   - Sample/method: LLM-based analyzer over README.md of 5,205 GitHub repositories; sampling from the ~20,000 estimate and collection date not stated.
   - Limitations: README-only; LLM classification with 26.4% unknown; no runtime comparison and no OAuth scopes requested-vs-used; vendor report.

20. **Beware of MCP Hardcoded Credentials: A Perfect Target for Threat Actors** — Trend Micro / Trend AI Security; Alfredo Oliveira, David Fiser — 2025-08-13  
   <https://www.trendaisecurity.com/en-us/resources-insights/research/beware-of-mcp-hardcoded-credentials-a-perfect-target-for-threat-actors>  
   Largest-N declared credential-handling measurement (recommended .env usage) over 19,402 MCP server source codes.
   - Figures: “'We collected 19,402 MCP server source codes. After analyzing the code, documentation, and usage patterns, we found that 9,294 (48%) of them recommend using the .env file to pass the secrets to the MCP server'” · “'No Role-Based Access Control (RBAC) (presents potential overprivileged use cases)'”
   - Sample/method: 19,402 source codes (source/registry unnamed); analysis of code, documentation and usage patterns; collection date not given.
   - Limitations: Declared credential-handling only; method unspecified; the '492 exposed MCP servers' figure attributed to Trend is not on this page (belongs to an earlier article not opened).

21. **Threat Research: Hundreds of MCP Servers Vulnerable to Abuse** — Backslash Security (Research Team) — 2025-06-25  
   <https://www.backslash.security/blog/hundreds-of-mcp-servers-vulnerable-to-abuse>  
   Early static scan of 'thousands' of local MCP servers for 0.0.0.0 binding and arbitrary command execution - counts only.
   - Figures: “'The Backslash team analyzed thousands of publicly available MCP servers. At the time of writing, we covered about half of what is available'” · “'The most common issue we found, with hundreds of cases observed, was MCP servers that were explicitly bound to all network interfaces (0.0.0.0)'” · “'The second most common issue, dozens of instances, MCP servers were discovered that allow arbitrary command execution on the host machine.'” · “'our analysis did not yield obviously malicious MCPs'”
   - Sample/method: Static source scan; exact N, registries and method not stated.
   - Limitations: No precise sample size or methodology; static only; 'Excessive Permissions' refers to command-execution code patterns, not declared permissions; the 'more than 7,000' figure is not on this page.

22. **We Scanned 1,000 MCP Servers: 33% Had Critical Vulnerabilities** — Enkrypt AI; Nitin Birur — 2025-10-09  
   <https://www.enkryptai.com/blog/we-scanned-1-000-mcp-servers-33-had-critical-vulnerabilities>  
   Vendor scan of the 'top 1,000' servers that names 'the gap between what a tool claims to do versus what it actually does' rhetorically but quantifies only vulnerability classes.
   - Figures: “'32% had at least one critical vulnerability'; '5.2 vulnerabilities per server on average'; '0% had security documentation'” · “'Command Injection 28%; Prompt Injection Possibilities 35%; Authorization Bypass 41%; Path Traversal 19%; Resource Exhaustion 15%; Network Security Issues 23%'” · “'Authorization gaps - Tool descriptions claim "user-scoped access" but code never validates ownership.'”
   - Sample/method: 'top 1,000' servers (criteria unstated) scanned over three months with a four-layer scanner (configuration, code, tool-level, network); static/dynamic split unspecified.
   - Limitations: Marketing post (headline 33%, body 32%); no server list, method detail or per-finding data; claims-vs-does gap not measured.

23. **We Scanned 1,808 MCP Servers. 66% Had Security Findings.** — AgentSeal Team — 2026-03-14  
   <https://agentseal.org/blog/mcp-server-security-findings>  
   Metadata-level scan (connect over stdio/SSE, enumerate tools, classify descriptions/schemas) of 1,808 servers reporting exposed capability classes - not code or runtime behaviour.
   - Figures: “'Out of 1,808 servers scanned: 1,196 servers (66%) had at least one security finding; 8,282 total findings across the ecosystem; 427 critical severity findings; 1,841 high severity findings; 16,840 tools analyzed'” · “Code Execution 909 total (40.1%); Toxic Data Flows 843 (37.2%); Data Exposure 72 (3.2%); Prompt Injection 51 (2.2%); File System Access 17 (0.7%); Other 376 (16.6%)” · “'false positive rate for high and critical severity findings was approximately 4.2%' on 120 known-benign servers”
   - Sample/method: 1,808 servers from registries 'including Smithery and MCP.run, and community directories'; four-layer pipeline (pattern signatures, all-MiniLM-L6-v2 embeddings at 0.72 cosine, Claude Opus classification, capability graph).
   - Limitations: Analyses tool metadata only; 'annotation'/'readOnlyHint' absent from the page; vendor registry; sampling frame and scan dates unspecified.

24. **From Static Findings to Working Exploits: Runtime Validation of 6 High-Profile MCP Servers** — AgentSeal Research — 2026-03-28  
   <https://agentseal.org/blog/runtime-exploitation-mcp-servers>  
   Runtime exploit confirmation on 6 servers (including one static finding corrected by execution) plus registry-wide score distribution - exploitability, not declared-vs-observed privilege.
   - Figures: “'96.4% confirmation rate (27/28) for testable critical and high severity findings under controlled runtime conditions'; Servers tested 6; Combined GitHub stars 68,305; Secrets extracted (planted test data) 17; Auth bypass success rate 4/4” · “'One finding (claude-flow terminal_execute) was corrected: the tool is a state-tracking stub, not a command executor.'” · “'As of late March 2026, the registry contains 8,013 published MCP servers with completed analysis. SAFE 80-100 3,580 44.7%; REVIEW 50-79 1,901 23.7%; RISKY 20-49 1,644 20.5%; DANGEROUS 0-19 888 11.1%'”
   - Sample/method: 6 high-adoption servers selected for testable findings; Docker builds from source with external deps mocked; 28 critical/high findings tested.
   - Limitations: n=6 selected for exploitability; no tracing of files/network/subprocesses/secrets against declarations; vendor registry scores.

25. **Rethinking MCP Security: A Large-Scale Study of Runtime MCP Servers and Security Scanner Reliability (MCPZoo)** — arXiv cs.CR; Pei Chen, Baichao An, Mengying Wu, Binwang Wan, Geng Hong, Jinsong Chen et al. (Fudan University / Shanghai Innovation Institute) — v1 2026-07-13  
   <https://arxiv.org/abs/2607.11086>  
   Largest runnable-server corpus (protocol-level runtime validation) used to measure scanner precision/consistency - shows the tooling landscape cannot yet be trusted for declared-vs-actual claims.
   - Figures: “'MCPZoo contains 64,611 unique MCP servers (113,927 in total), with more than 37,288 supporting dynamic analysis'” · “'96.89% of the 37,288 interactable MCP servers are reported as risky by at least one scanner'” · “'overall average precision is 45.53%, with substantial variation across scanners (10.40%-96.88%)'; 'scanners detect only 24.17% of known vulnerable cases'; 'average pairwise Jaccard similarity is only 15.66%'” · “Scanners: Agent-Scan (Snyk), A.I.G (Tencent Zhuque Lab), MCP-Scanner (Cisco), MCPScan (Ant Group), MCPSafetyScanner, mcp-gateway (Lasso), nova-proximity, mcp-armor”
   - Sample/method: Multi-market collection, automated Dockerfile generation, protocol verification (initialize, tools/list, sampled invocation); manual precision validation on 100 sampled servers per scanner; CVE ground truth of 10 vulnerabilities; data circa Dec 2025.
   - Limitations: No OS-level behavioural tracing; no annotation or declaration comparison; precision sample small.

26. **Exposed by Design: A Dynamic Security Assessment of Internet-Facing MCP Servers at Scale (Corvus)** — arXiv cs.CR; Nicolás Padilla, CobaltoSec — v1 2026-07-31  
   <https://arxiv.org/abs/2608.00150>  
   Largest dynamic black-box audit of remote MCP servers (July 2026) - vulnerability classes and advertised shell tools, not declared-vs-observed privilege.
   - Figures: “'Across four measurement runs spanning July 2026, we confirm 640 production MCP servers and dynamically audit 414, uncovering 68 reportable vulnerabilities'; '19 are publicly disclosed; the remaining 49 are held under a 90-day coordinated disclosure embargo'” · “'Among the 414 dynamically audited servers, 91.8% (380 of 414) lacked OAuth authentication'” · “'687 tool instances across the 640-server confirmed pool advertised tools implementing shell execution primitives'” · “'193 of 464 confirmed servers (41.6%) were no longer reachable as valid MCP endpoints' between runs 3 and 4”
   - Sample/method: Passive discovery from eleven sources, protocol fingerprinting, active black-box testing with 34 modules (13 static, 21 dynamic) over 10 MST-10 classes; runs Jul 15/18/21/24 2026.
   - Limitations: Single independent author; remote/HTTP only; shell-tool count is from advertised rosters, not observed execution; no annotation/description-vs-behaviour comparison.

27. **FlowGuard: From Signals to Evidence for MCP Security Detection** — arXiv; Baichao An, Pei Chen, Geng Hong, Yueyue Chen, Mengying Wu — v1 2026-07-16  
   <https://arxiv.org/abs/2607.14754>  
   Runtime-evidence vulnerability detector (schema-valid probes, evidence adjudication) evaluated on 1,880 benchmark cases and 326 real servers - exploitability, not privilege profiling.
   - Figures: “executable benchmark containing 1,880 MCP cases across five vulnerability categories” · “F1 scores of 0.879 and 0.942 on the execution-related Command Injection and File System Access categories” · “'In the real-world evaluation, FlowGuard reports 523 findings across 326 servers'”
   - Sample/method: Executable benchmark plus real-world evaluation of 326 servers (selection not stated in abstract); recon-guided payload narrowing.
   - Limitations: Abstract-only verification; no declared-capability comparison; benchmark construction undescribed.

28. **"What Happens Locally, Leaks Globally": Detecting Privacy Leakage Risks in MCP Servers (MCPPrivacyDetector)** — arXiv cs.CR; Biwei Yan, Minghui Xu, Yijun Yang, Boyang Ma, Xuelong Dai, Jingku Li, Yue Zhang (Shandong University) — v1 2026-06-19  
   <https://arxiv.org/abs/2606.21338>  
   Cross-language static taint analysis of secret/credential flows in 10,655 servers - the 'secrets accessed' dimension by static proxy only.
   - Figures: “'Applied to 10,655 real-world MCP servers, MCPPrivacyDetector finds leakage rates above 10%'; 'peaking at 19.1% in Java and 15.4% in Python, and 83.0% of all detected cases concentrate in three registries'” · “'MCP.io exhibits the highest leakage rate at approximately 18.1%, followed by Smithery Registry at 15.1% and Pulse MCP at 13.2%'”
   - Sample/method: 10,655 servers from GitHub API plus Smithery, Pulse MCP, Cursor Directory, Awesome MCP, Glama, Mcpmarket, modelcontextprotocol.io; six rule-based detectors plus CodeQL taint analysis.
   - Limitations: Static; 'leakage' means feasible flows; no declared surface.

29. **Model Context Protocol (MCP) at First Glance: Studying the Security and Maintainability of MCP Servers (ACM TOSEM DOI 10.1145/3814959 per Crossref, not opened)** — arXiv; Mohammed Mehedi Hasan, Hao Li, Emad Fallahzadeh, Gopi Krishnan Rajbahadur, Bram Adams, Ahmed E. Hassan — v1 2025-06-16; v5 2026-04-13  
   <https://arxiv.org/abs/2506.13538>  
   First large-scale static study of 1,899 open-source servers (vulnerabilities, tool poisoning, smells) - no privilege declaration comparison.
   - Figures: “1,899 open-source MCP servers; 7.2% contain general vulnerabilities; 5.5% exhibit MCP-specific tool poisoning; 66% exhibit code smells; 14.4% contain ten bug patterns”
   - Sample/method: SAST tooling plus an MCP-specific scanner over 1,899 open-source servers.
   - Limitations: Static; abstract-level verification; journal version not opened.

30. **A First Look at the Security Issues in the Model Context Protocol Ecosystem (MCPInspect)** — arXiv; Xiaofan Li, Xing Gao — v1 2025-10-18; v2 2026-04-27  
   <https://arxiv.org/abs/2510.16558>  
   Six-registry crawl of 67,057 servers with a static pre-integration tool detecting 'misleading tool metadata' - a metadata-honesty proxy without runtime comparison.
   - Figures: “67,057 servers across six public registries” · “identifying 833 vulnerable servers and 18 with suspicious descriptions”
   - Sample/method: Registry crawl; MCPInspect static analysis of tool metadata and code.
   - Limitations: Abstract-level verification; static; no annotation analysis.

31. **Scanning the Harness: An Empirical Study of Supply-Chain Defects in AI Coding-Agent Configurations** — arXiv; Benjamin Kapner, Carmel Soceanu, Alicia Petrunin, Hofni Gartner (Red Hat) — v1 2026-09-07  
   <https://arxiv.org/abs/2609.07360>  
   Byte-level audit of how MCP servers are declared and pre-approved in 3,171 coding-agent configuration repos - the client-side declaration surface, no observation of server behaviour.
   - Figures: “'3,171 public GitHub repositories: 2,660 setups that assemble two or more component types, and 511 published skill collections'” · “'9.8% of setups install an MCP server with no version pinned'; '3.1% pre-approve arbitrary command execution behind a scoped-looking grant such as Bash(python:*)'” · “'16.0% of setups (95% CI 14.6 to 17.4) carry a confirmed security defect'; 'No repository in the corpus exhibits a credential-to-network exfiltration path'” · “harness has 'no lockfile, no install-time check, and no vocabulary for what a component may do'”
   - Sample/method: Topic-query discovery of 3,171 GitHub repos; decidable byte-level rules; human adjudication.
   - Limitations: Configuration files only; Claude Code-centric; no observation of declared servers.

32. **docker/mcp-registry docs/configuration.md (server.yaml declaration schema)** — Docker (GitHub docker/mcp-registry) — inspected 2026-09-11 (repo pushed 2026-09-11)  
   <https://github.com/docker/mcp-registry/blob/main/docs/configuration.md>  
   A registry-level declaration format (env, secrets, volumes, disableNetwork; run.allowHosts present in entries) with no published validation of declarations against observed container behaviour.
   - Figures: “servers/ tree: 328 entries; stargazers_count 551” · “github-official server.yaml: run.allowHosts = [api.github.com:443, github.com:443, raw.githubusercontent.com:443]; secret github.personal_access_token -> env GITHUB_PERSONAL_ACCESS_TOKEN” · “configuration.md documents 'volumes', 'disableNetwork: true', 'secrets' but not run.allowHosts”
   - Sample/method: Direct inspection of raw docs, one server entry and GitHub API metadata.
   - Limitations: Single vendor's curated schema; no evidence of runtime verification; snapshot counts.

33. **Securing the Model Context Protocol: Building a safer agentic future on Windows** — Microsoft, Windows Experience Blog; David Weston — 2025-05-19  
   <https://blogs.windows.com/windowsexperience/2025/05/19/securing-the-model-context-protocol-building-a-safer-agentic-future-on-windows/>  
   Platform policy requiring registry servers to 'declare privileges they require' with proxy-mediated enforcement - a declaration model with no mechanism or data for checking declarations against behaviour.
   - Figures: “'Servers must declare privileges they require' (among registry baseline requirements incl. mandatory code signing, tool definitions immutable at runtime, package identity)” · “'All MCP client-server interactions are routed through a trusted Windows proxy, enabling centralized enforcement of policies and consent.'”
   - Sample/method: n/a (policy announcement).
   - Limitations: Intent only; no data.

34. **Panopticon - 'Local-first MCP behavior observatory: discover installed servers, run them in a decoy sandbox, and compare declared vs observed behavior.' (with sibling tools https://github.com/narko4u/mcp-evidence-validator and https://github.com/aktanazat/behavioral-abi)** — GitHub users brnyxx (PyPI panopticon-mcp 1.0.2, MIT), narko4u (Apache-2.0), aktanazat (MIT) — panopticon created 2026-08-26, v1.0.2 2026-08-31; mcp-evidence-validator created 2026-08-14, v0.2.1 2026-08-18; behavioral-abi 2026-08-21  
   <https://github.com/brnyxx/panopticon>  
   Three August-2026 open-source tools built explicitly around the declared-vs-observed framing (decoy sandbox recording files/network hosts/processes; declared-vs-observed check ledger; sandbox kill-test), all single-server, zero-star, with no corpus results.
   - Figures: “panopticon README: 'runs a selected server in a decoy-filled sandbox, and records files, network hosts, processes, and declared-versus-observed differences. It reports observation evidence; it does not make a verdict for you.'; limitations: 'An observation is one run'; declared scope from README/tool descriptions PARTIAL; remote servers file stage UNSUPPORTED; stargazers 0” · “mcp-evidence-validator README: 'A server declares tool schemas and permissions, but nothing verifies those declarations against observed runtime behaviour.'; check 'Observed outside declared scope'; 'All examples are fictional.'; stargazers 0” · “behavioral-abi REPORT.md: 'Population size: 20; Servers run: 12'; 'planner_valid_call_rate ... 7/37 sandbox-eligible tool schemas got a valid first call (18.9%, kill if <70%)'; 2 idempotency mismatches (create_record vendor_declared True observed_false; create_entities vendor_declared False observed_true); Rubric outcome: kill; stargazers 0”
   - Sample/method: Operator-run single-server sandboxes (Docker/Podman); behavioral-abi ran 12 of a frozen top-20 popularity corpus in disposable sandboxes (Stripe test mode, GitHub disposable repo, Cloudflare free tier).
   - Limitations: Tooling only; no published cross-server measurements; behavioral-abi is a self-declared failed experiment measuring idempotency not privilege; zero adoption signal.

35. **SkillScope: Toward Fine-Grained Least-Privilege Enforcement for Agent Skills (ACM CCS 2026)** — arXiv cs.CR; Jiangrong Wu, Yuhong Nan, Yixi Lin, Huaijin Wang, Yuming Xiao, Shuai Wang, Zibin Zheng — v1 2026-05-07; v3 2026-09-10  
   <https://arxiv.org/abs/2605.05868>  
   Adjacent-ecosystem (agent skills, not MCP servers) large-scale over-privilege measurement with runtime replay validation - shows the method exists at scale elsewhere.
   - Figures: “'SkillScope validates 6,590 of 68,312 valid real-world Skills as exhibiting over-privileged behaviors'; 'we crawl 110,046 skills ... 68,312 valid skill bundles'” · “'SkillScope achieves a 94.53% skill-level F1 score' (200-skill labelled set); 'reduces triggered over-privileged action-in-task instances by 88.56%'”
   - Sample/method: ClawHub and SkillsMP crawl; candidate extraction, runtime replay under graph-instantiated tasks.
   - Limitations: Skills ecosystem only; over-privilege defined relative to instantiated tasks; MCP tools appear only as fixtures.

36. **Behavioral Integrity Verification for AI Agent Skills (BIV)** — arXiv; Yuhao Wu, Tung-Ling Li, Hongliang Liu — v1 2026-05-12  
   <https://arxiv.org/abs/2605.11770>  
   Adjacent-ecosystem static declared-vs-implemented vetting of 49,943 OpenClaw skills; lists cross-registry comparison to MCP servers as future work.
   - Figures: “'On 49,943 skills from the OpenClaw registry ... 80.0% of skills deviate from declared behavior'; 'BIV surfaces 250,706 behavioral deviations'” · “'81.1% trace to developer oversight and 18.9% to adversarial intent, with 5.0% of skills carrying predicted multi-stage attack chains'” · “'BIV statically vets a third-party skill package ... before any runtime use'”
   - Sample/method: Static analyzers plus LLM extraction over (metadata, code, instructions) triples; 137-cluster deviation taxonomy.
   - Limitations: Skills not MCP; static; broad deviation definition.

37. **How Your Credentials Are Leaked by LLM Agent Skills: An Empirical Study** — arXiv cs.CR; Zhihao Chen, Ying Zhang, Yi Liu, Gelei Deng, Yuekang Li, Yanjun Zhang, Jianting Ning, Leo Yu Zhang, Lei Ma, Zhiqiang Li — v1 2026-04-03; v2 2026-06-19  
   <https://arxiv.org/abs/2604.03070>  
   Adjacent-ecosystem study that sandbox-executes skills with mock credentials while monitoring network I/O and cross-references SKILL.md declared intent - the closest methodological template to the question, applied to skills not MCP servers.
   - Figures: “'From 170,226 artifacts on SkillsMP ... we sampled 17,022 skills via stratified random sampling'” · “'520 affected skills containing 1,708 security issues'; '520 (3.1%) ... 84.0% from developer negligence'” · “'76.3% of cases require jointly analyzing natural-language descriptions and programming logic'” · “'Dynamic sandbox testing confirms 89.6% exploitability (466/520 skills)'”
   - Sample/method: Stratified 10% sample of SkillsMP (snapshot 2026-02-12); regex/AST secret extraction; sandbox (2 GB, 120 s) with mock keys; manual interaction.
   - Limitations: Skills, single marketplace; manual dynamic testing.

38. **Zenity Labs Discovers Dozens of Malicious AI Agent Skills Evading Detection, Launches AI Total** — Zenity (press release, Black Hat USA 2026) — 2026-08-03 / dateline August 6, 2026  
   <https://zenity.io/company-overview/newsroom/company-news/zenity-labs-discovers-dozens-of-malicious-ai-agent-skills-evading-detection-launches-ai-total>  
   Vendor 'Agent Detonation Chamber' that records runtime domains/packages/files and compares them to claimed behaviour - for agent skills, with MCP servers only 'planned'.
   - Figures: “'What a skill actually does, compared to what it claims to do, becomes the verdict.'” · “'More than 30% of dangerous identified skills abuse Claude Code and OpenClaw as malware droppers'” · “'One malicious skill uncovered during the research amassed more than 250,000 installs while remaining undetected for several months'” · “'Zenity Labs plans to extend AI Total to additional components of the AI supply chain.'”
   - Sample/method: Sandbox detonation of skills from public registries; no sample size or registry list on the page.
   - Limitations: Press release; skills not MCP servers; no declared-vs-observed rate; full report at labs.zenity.io not opened.

### Not used

- <https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF> — NSA/CISA CSI 'Model Context Protocol (MCP): Security Design Considerations for AI-Driven Automation' (U/OO/6030316-26, May 2026): HTTP 403 'Access Denied' from media.defense.gov, nsa.gov Portals copy and Wayback on every attempt; content known only through a secondary summary, so its least-privilege/declared-permission language is unverified. Guidance document, would not change the verdict.
- <https://ieeexplore.ieee.org/document/11394790> — 'MCP-Secure' runtime access-control layer (IEEE): page returned 202/403 to fetch, curl and archive.org; never opened. Search snippet suggests host-side read-only defaults and approval-gated elevation, no ecosystem measurement.
- <https://ieeexplore.ieee.org/document/11395848> — 'A Systematic Security Analysis of Model Context Protocol' (15 server implementations, '87% critical security flaw' per snippet): IEEE Xplore unfetchable; no arXiv preprint located; figures unverified.
- <https://doi.org/10.1145/3786160.3788471> — MCP-Scanner (ECCS 2026 workshop, 2026-04-12): dl.acm.org returned 403; only Crossref metadata (title/date) confirmed, no abstract or content, so cannot support any claim.
- <https://doi.org/10.1145/3806007.3810961> — MCP-SecLint (IWSPA 2026, 2026-06-22): dl.acm.org 403; Crossref metadata only, no abstract or content.
- <https://blackhat.com/us-26/briefings.html> — Live page 403; Wayback 2026-09-09 copy is a JS shell with no talk titles; Black Hat USA 2026 programme could not be scanned for runtime MCP observation talks.

### Open questions from the sweep

- Glama's per-server behavioural profiles (syscall/network findings relative to the declared capability set, >1M scans): neither its public API nor the operator has been queried for aggregate rates of undeclared credential access, unmanifested egress or out-of-directory writes; this is the single dataset most likely to flip the verdict to EXISTS if released.
- The NSA/CISA CSI U/OO/6030316-26 (May 2026) text is unverified (403 everywhere); its exact language on declared permissions/least privilege should be checked from a mirror or the CISA site.
- IEEE Xplore papers 11394790 (MCP-Secure) and 11395848 ('Systematic Security Analysis', 15 servers, '87%') and ACM workshop papers MCP-Scanner (ECCS 2026) and MCP-SecLint (IWSPA 2026) could not be opened; their content may include small-n runtime checks.
- The OpenReview 'Dual-Axis' MCP paper surfaced by search was bot-blocked and never read.
- Canopii's control definitions ('Destructive scope', 'No over-broad or destructive tools') are undisclosed; whether any control reads readOnlyHint/destructiveHint needs a direct request or systematic sampling of server pages.
- Black Hat USA 2026 and DEF CON 34 full programmes were unparsable; once slides/videos index, check for runtime MCP observation talks beyond Zenity's detonation chamber.
- Stacklok/ToolHive promised (2026-05-05) annotation-accuracy validation against source; toolhive-catalog / toolhive-registry-server commits and issues were not inspected for a validation job or results.
- Vendor gateway telemetry (Docker MCP Gateway interceptors, Snyk/Invariant mcp-scan proxy, ToolHive, Lasso, Noma, Pillar) was not searched for published runtime tool-call or annotation-policy statistics because web search was unavailable.
- Semantic Scholar was rate-limited (429) on all four queries; a later check should rerun them and also query CCF-ranked Chinese journals, IPSJ/CSS (Japan) and KIISC (Korea) directly rather than via web search.
- arXiv 2605.22333 (7,973 live remote servers; 40.55% expose tools without authentication, per the source check) and USENIX Security 2026 'Do Not Mention This to the User' (malicious agent skills) were surfaced but not opened/verified; neither appears to measure scope minimality or MCP declared-vs-actual, but this is unconfirmed.
- Primary sources behind two secondary figures were not opened: Endor Labs 2025 Dependency Management Report (the 2,614-implementation method) and the Backslash press release citing 'more than 7,000' servers; Trend Micro's earlier article with the '492 exposed servers' figure likewise.
- Sources opened during the search but absent from the verified set (OpenAI Apps SDK submission guidelines, Anthropic connectors submission page, MCP Tool Annotations IG charter 2026-04-20, Snyk 2026-06-23 telemetry post, Equixly 2025-03-29, Glama TDQS 2026-04-03 blog, labs.zenity.io full report) should be verified if cited; none is expected to add a declared-vs-runtime measurement.
- A2A agent cards ('declared capabilities vs runtime delegation', named as next target by mcp-evidence-validator's roadmap) and A2ABreak (arXiv 2609.10871, 2026-09-09) were not opened; adjacent framing worth one check.
- Whether SandScope's authors have released the 100-repo corpus and Table 8 raw data (which would allow extending the egress cross-check to other dimensions) was not checked.

### Searches run

- `arXiv API (export.arxiv.org): all:"model context protocol" max_results=400 (+start=400) -> 539 results; all:MCP AND all:server -> 254; all:MCP AND all:security -> 264; merged to 666 unique ids`
- `local keyword scan of 666 merged arXiv abstracts for readOnlyHint, destructiveHint, annotation, strace, eBPF, syscall, egress, environment variable, least privilege, over-privileg, declared, dynamic analysis, sandbox, secrets, credential, OAuth scope, subprocess, install script, postinstall, seccomp, gVisor, Firecracker, WASI, manifest -> readOnlyHint 0, destructiveHint 0, strace 0, seccomp/gVisor/Firecracker 0, postinstall 0, subprocess 0; eBPF 2, syscall 2, WASI 1, declared 10 -> surfaced 2601.01241, 2606.04769, 2607.21835, 2603.21641`
- `arXiv API: abs:"tool annotations" AND abs:"model context protocol" -> 0 results`
- `arXiv API: all:readOnlyHint OR all:destructiveHint -> 1 result (2606.06387 WebMCP Tool Surface Poisoning; uses readOnlyHint as attack field, not a measurement)`
- `arXiv API: abs:"least privilege" AND abs:(MCP OR "model context protocol") -> 6 results (2509.06572, 2608.18351, 2605.28914, 2601.02698, 2606.06767, 2609.07370); none measures declared-vs-actual`
- `arXiv API: abs:(over-privileged OR overprivileged OR "over privileged") AND abs:(agent OR MCP OR tool) -> 155 results; relevant only skills/agent items (2606.20023, 2605.05868, 2605.09163, 2603.22853, 2605.09721, 2512.11147, 2504.11703, 2605.11770, 2607.02357)`
- `arXiv API: abs:(sandbox OR sandboxed) AND abs:"model context protocol" -> 17 results; only 2603.21641 and 2601.01241 do sandboxed observation of MCP servers`
- `arXiv API: abs:("runtime behavior" OR "dynamic analysis" OR "system calls" OR strace OR eBPF) AND abs:(MCP OR "model context protocol") -> 6 results; MCP-relevant 2603.21641, 2607.11086, 2607.21835`
- `arXiv API: abs:"agent skills" AND abs:(malicious OR security) -> 59 results; skills-side declared-vs-actual: 2605.11770, 2604.03070, 2605.05868, 2608.07639, 2606.11671`
- `arXiv API: abs:(manifest OR "permission model" OR capabilities) AND abs:"MCP server" -> 65 results; 2510.21236, 2509.24272, 2511.05867, 2604.21477; no further declared-vs-runtime measurement`
- `arXiv API: abs:(inconsisten* OR mismatch* OR "description-code") AND abs:(MCP OR "model context protocol") AND abs:(tool OR server) -> 14 results; only 2602.03580 and 2606.04769 measure description-vs-code`
- `arXiv API: ti:"Les Dissonances" -> 2504.03111 (NDSS 2026; 66 LangChain/LlamaIndex tools, not MCP)`
- `arXiv API: abs:"model context protocol" sorted by submittedDate desc, 200 newest to 2026-09-10 -> ~20 candidate abstracts read (2609.02690, 2609.00267, 2608.23763, 2608.18351, 2608.20481, 2607.25635, 2607.25297, 2607.10123, 2607.20531, 2606.29073, 2606.05339, 2605.24248, 2605.07836, 2605.04785, 2604.21477, 2605.22333, 2605.11360, 2606.03034, 2604.16870, 2607.05743); none measures declared vs runtime privilege across servers`
- `arXiv API: abs:declared AND abs:observed AND abs:(tool OR agent) AND abs:(MCP OR "model context protocol" OR skills); abs:"capability drift" OR abs:"binding gap" OR abs:"contract drift"; abs:(Firecracker OR gVisor OR syscall) AND abs:(MCP...); abs:(eBPF OR strace OR seccomp) AND abs:(MCP...); abs:"agent skills" AND abs:(sandbox OR runtime OR dynamic) AND abs:(declared OR claim OR manifest); abs:"over-privilege" OR abs:"overprivilege" OR abs:"excess privilege" -> only known items plus skills-side papers (2609.05920, 2605.09163, 2608.16246, 2606.03024) and 2603.22853`
- `arXiv API: ti:"Binding Gap" OR ti:"Declared vs. Observed" -> no arXiv entry (paper is Zenodo-only; OpenAlex mapping to 2607.21735 is wrong)`
- `arXiv API id_list 2609.05920,2605.09163,2605.09721,2603.22853,2608.05223,2509.25292 -> abstracts read; all adjacent, not included`
- `web search: "readOnlyHint" MCP tool annotations accuracy study servers -> vendor/blog pages only (Stacklok, sunpeak, MCP blog, Medium); no academic accuracy study`
- `web search: site:arxiv.org MCP servers "over-privileged" OR "least privilege" measurement runtime declared -> 2601.01241, 2603.21641, 2510.21236, 2511.20920, 2603.28166`
- `web search: site:arxiv.org "MCP" servers dynamic analysis sandbox "system calls" OR strace OR eBPF network file access measurement -> 2603.21641, 2601.01241, 2603.28166, 2603.18063, 2503.23278; no ecosystem-scale trace study`
- `web search: site:dl.acm.org "Model Context Protocol" servers security empirical study privilege -> TOSEM 10.1145/3814959, 10.1145/3786160.3788471, 10.1145/3806007.3810961 (dl.acm.org 403; Crossref metadata only)`
- `web search: site:usenix.org "Model Context Protocol" OR "MCP servers" 2026 -> no USENIX-hosted MCP paper`
- `web search: site:ndss-symposium.org "Model Context Protocol" OR "MCP" servers -> nothing on domain`
- `web search: site:openreview.net "Model Context Protocol" servers security tool permissions -> 2509.22814, a 'Dual-Axis' MCP paper (PDF bot-blocked), Log-To-Leak; nothing on declared-vs-actual`
- `web search: site:ieeexplore.ieee.org "Model Context Protocol" servers security analysis -> 11394790 (MCP-Secure), 11395848 (Systematic Security Analysis, 15 servers), 11531012 (MCPXKIT); all unfetchable`
- `web search: site:semanticscholar.org "MCP servers" over-privileged OR "privilege" OR "capabilities" runtime -> same arXiv set`
- `web search: arxiv "readOnlyHint" OR "destructiveHint" MCP servers empirical annotations declared behavior -> no arXiv paper; vendor docs only`
- `web search: arxiv MCP servers "environment variables" secrets credentials static analysis measurement "API keys" servers study 2026 -> 2608.00150, 2606.21338, 2605.22333, 2607.11086`
- `web search: arxiv MCP server npm packages "install scripts" OR "postinstall" OR "network egress" OR "outbound connections" supply chain measurement -> nothing academic`
- `web search: "MCP-Secure" "Runtime Access Control Layer" privilege IEEE -> IEEE 11394790 + ResearchGate 400740740 (both 403)`
- `web search: "A Systematic Security Analysis of Model Context Protocol" 15 MCP server implementations 87% critical security flaw -> IEEE 11395848 only (unfetchable)`
- `curl usenix.org USENIX Security 2026 technical sessions (907 links) -> no MCP-server title; adjacent 'Do Not Mention This to the User: Detecting and Understanding Malicious Agent Skills in the Wild'`
- `fetch ndss-symposium.org/ndss2026/accepted-papers -> only 'Les Dissonances'`
- `fetch sp2026.ieee-security.org/accepted-papers.html -> only 'Parasites in the Toolchain: A Large-Scale Analysis of Attacks on the MCP Ecosystem'`
- `fetch sigsac.org CCS 2026 accepted papers -> no MCP title (first cycle)`
- `fetch ICSE 2026 research track; MSR 2026 technical papers -> no MCP title`
- `fetch FSE 2026 research papers -> 'AgentBound' and 'Evaluating Privilege Usage of Agents on Real-World Tools'`
- `fetch ASE 2026 papers -> HTTP 404`
- `api.crossref.org: 10.1145/3786160.3788471, 10.1145/3814959, 10.1145/3806007.3810961 -> metadata confirmed; no abstracts for workshop papers`
- `web search: MCP servers "readOnlyHint" annotations accuracy analysis -> Stacklok, sunpeak (Jul 2026), dev.to MCPSafe, Codex KB; no accuracy measurement`
- `web search: "over-privileged" MCP servers analysis study -> 2603.21641, 2507.06250, Knostic blog`
- `web search: MCP servers dynamic analysis sandbox runtime behavior network file access study -> 2601.01241, 2607.11086, anthropic sandbox-runtime repo`
- `web search: Equixly MCP servers command injection analysis "43%" servers -> Equixly 2025-03-29 post (opened during the search; not in verified set)`
- `web search: Backslash Security "NeighborJack" MCP servers analysis findings -> Backslash 2025-06-25 primary (opened)`
- `web search: Docker MCP Gateway Toolkit isolation MCP servers secrets environment variables blog -> design posts only, no measurement`
- `web search: Astrix Security "State of MCP" 1,808 servers report findings -> Astrix 2025-10-15 (5,205 READMEs; opened)`
- `web search: MCP server "declared" vs "actual" behavior tools permissions runtime observed -> nothing useful (Cerbos, Portkey, mcpmanager guides)`
- `web search: MCP servers strace eBPF trace network egress subprocess observed behaviour vendor research -> nothing useful`
- `web search: Snyk MCP server security research analyzed servers findings 2026 -> AppSec Santa 33-server audit, AgentSeal 1,808, the-agent-report Q3 2026`
- `web search: Invariant Labs OR Cisco "mcp-scan" OR "AI Defense" MCP servers scanned findings percentage -> scanner repos/docs; no declared-vs-actual statistics`
- `web search: Endor Labs MCP servers 2,614 implementations "82%" file operations path traversal command injection -> Endor Labs 2026-01-23 (opened)`
- `web search: Trend Micro MCP server "48%" credentials hardcoded .env research -> Trend Micro 2025-08-13 (opened)`
- `web search: "Black Hat" 2026 MCP servers talk privilege runtime analysis tools -> vendor-wave coverage; no declared-vs-actual measurement`
- `web search: "DEF CON 34" OR "DEF CON 33" MCP server talk supply chain permissions -> generic guides only`
- `web search: MCP server npm packages install scripts postinstall behaviour analysis malicious -> Snyk postmark-mcp, Microsoft dependency confusion; no MCP install-script study`
- `web search: Koi Security MCP servers research analysis behaviour -> postmark-mcp / mcp-runcommand-server case studies only`
- `web search: MCP servers "phone home" OR telemetry OR "undisclosed network" analysis observed traffic -> ARMO, Red Canary; no measurement`
- `web search: site:snyk.io MCP servers research scanned analysis findings -> Snyk 2026-06-23 telemetry post (~10,000 dev environments; opened during the search, not in verified set)`
- `web search: site:docker.com blog MCP servers "least privilege" OR "over-privileged" OR "declared" analysis catalog -> Docker 2025-07-31 (aggregates arXiv figures) and 2025-05-06 (readOnlyHint-driven read-only mounts proposal)`
- `web search: Anthropic "sandbox-runtime" OR "srt" MCP servers sandboxing blog filesystem network restrictions -> Anthropic 2025-10-20 post; no measurement`
- `web search (unavailable) :: Windows MCP registry servers "declare" capabilities OR privileges Microsoft agentic Windows security architecture MCP; "readOnlyHint" misleading OR incorrect OR "lies" MCP server tool actually writes; "MCP" "permission manifest" OR "capability manifest" OR "permissions declaration" servers proposal SEP; arxiv 2026 MCP tool "declared" capabilities "observed" runtime behaviour mismatch "tools/list"; MCP behavioural profiling Docker sandbox large-scale; "Do Not Mention This to the User" USENIX 2026; "MCP" servers "least privilege" "Docker MCP Gateway" OR "ToolHive" OR "mcp-guardian" measured actual network file access catalog servers 2026`
- `Bing RSS via curl: "readOnlyHint" MCP tool annotations misleading OR incorrect OR mismatch; MCP tool annotations accuracy analysis servers readOnlyHint destructiveHint study; MCP server tool annotations readOnlyHint accuracy audit; over-privileged MCP servers security vendor research; MCP servers runtime behaviour observed sandbox file network syscalls analysis blog -> garbage or generic intro pages`
- `gh api search/repositories: mcp readOnlyHint audit; mcp server sandbox trace behavior analysis; mcp-audit; mcp server privilege analysis; mcp scanner runtime dynamic; cosai mcp security; org:cosai-oasis -> no relevant repos (pipelock, mcp-postgres-guard only)`
- `gh search repos: readOnlyHint; mcp declared observed behavior; mcp server strace sandbox audit; mcp sandbox audit; mcp behavioral; mcp permission audit; mcp annotations lint; mcp egress; mcp syscall; mcp strace; mcp least privilege; mcp overprivileged; mcp capability manifest -> brnyxx/panopticon, aktanazat/behavioral-abi, abdulsince2008/mcp-least-privilege-auditor, akhilesharora/herkos (not opened), goutamadwant/mcp-egress-guard (not opened); none publishes cross-server data`
- `gh search issues "readOnlyHint" --repo modelcontextprotocol/modelcontextprotocol and --repo github/github-mcp-server; gh api issues #2901, #3025, #440, #2483, #2841 -> proposals (#440 action manifests, #3025 sideEffects, #2901 security capabilities declaration) and single-server annotation audits; no cross-server data`
- `GitHub API: repos narko4u/mcp-evidence-validator, brnyxx/panopticon, aktanazat/behavioral-abi (+releases, README, docs, pyproject, PyPI JSON) -> August 2026 single-server tools, 0 stars, no corpus results`
- `GitHub API + raw: docker/mcp-registry docs/configuration.md, servers/github-official/server.yaml, repo tree; code search 'allowHosts repo:docker/mcp-registry path:docs' -> no results`
- `Vendor site searches/indexes: blogs.cisco.com/?s=mcp+scanner; stacklok.com/blog pages 1-6; github.blog/?s=mcp+security; blog.trailofbits.com; ox.security/blog; enkryptai.com/company/blog; clutch.security/blog; bluerock.io/post; koi.ai/blog; socket.dev/blog; glama.ai/mcp/servers; tldrsec.com/?s=mcp; blog.gitguardian.com/?s=mcp -> Cisco 2025-12-22 and Enkrypt 1,000-server posts opened; others yielded no MCP privilege research`
- `web search (zh): MCP 服务器 权限 运行时 行为 声明 分析 研究 2026 -> Chinese how-to pages only`
- `web search (zh): MCP server "什么它声称" OR "声明的权限" OR "实际行为" MCP 工具 沙箱 动态分析 论文 -> nothing relevant`
- `web search (zh): MCP 安全 报告 2026 服务器 过度权限 测量 腾讯 OR 阿里 OR 奇安信 OR 360 OR 知道创宇 研究 -> Qianxin threat reports and product news only`
- `web search (ja): MCPサーバー セキュリティ 権限 過剰 調査 分析 ツール 2026 -> guides repeating Trend Micro/OX figures`
- `web search (ko): MCP 서버 보안 권한 과다 분석 연구 도구 실제 동작 2026 -> news/guides summarising Backslash/Invariant`
- `web search (de): MCP-Server Sicherheit Berechtigungen Studie Analyse "MCP-Server" Laufzeit Verhalten 2026 -> led to Canopii 'State of MCP Security 2026' via drweb.de`
- `web search (es): servidores MCP seguridad análisis permisos excesivos estudio herramientas comportamiento real 2026 -> guides only`
- `web search: OWASP "MCP Top 10" tool annotations readOnlyHint destructiveHint trust -> sunpeak testing guide (opened, no data), Tool Annotations IG charter (opened during the search), explainer posts`
- `web search: OWASP "MCP Top 10" official 2026 release "excessive permissions" OR "over-privileged" MCP servers percentage data -> no prevalence data (next release October 2026 per coverage)`
- `web search: Cloud Security Alliance MCP server security research declared capabilities runtime behavior 2026 -> CSA notes/best practices; NSA CSI PDF URL (blocked)`
- `web search: Black Hat USA 2026 briefings MCP servers runtime analysis sandbox privilege -> Straiker and Zenity recaps; blackhat.com 403/JS`
- `web search: "Black Hat USA 2026" briefing "MCP" servers title speakers agent tools supply chain -> vendor coverage; only runtime detonation talk is Zenity's`
- `web search + fetch aivillage.org/events/defcon-34/ -> MCP posters (MCParasite, Malicious Context Propagation, supply-chain talk); none on declared-vs-actual privilege`
- `web search + fetch (zenity newsroom/recap, straiker recap): Zenity "Promptware EOD" OR "detonation chamber" MCP servers skills behavioral analysis results -> skills only, MCP servers planned`
- `fetch https://sunpeak.ai/blogs/testing-mcp-tool-annotations/ -> how-to (2026-07-22), no measurements`
- `fetch + curl https://blackhat.com/us-26/briefings.html (+Wayback 20260909) -> 403 / JS shell`
- `curl (several UA/header variants) + fetch NSA CSI PDF (media.defense.gov, nsa.gov Portals, Wayback) -> HTTP 403 on every path; pipelab secondary summary used instead`
- `web search + fetch nsa.gov press release (403) + pipelab summary: NSA CISA "Model Context Protocol" cybersecurity information sheet June 2026 -> CSI U/OO/6030316-26 v1.0 exists; guidance, no measurement`
- `api.semanticscholar.org: 'MCP server tool annotations readOnlyHint accuracy'; 'model context protocol server runtime behavior declared capabilities'; 'MCP servers over-privileged dynamic analysis sandbox'; 'model context protocol permission manifest measurement' -> HTTP 429 rate-limited on all`
- `api.openalex.org works search (from 2025-06-01): 'model context protocol tool annotations'; 'MCP servers runtime behavior declared'; 'MCP server over-privileged'; 'model context protocol least privilege'; 'MCP tool capability manifest'; 'model context protocol sandbox dynamic analysis' -> surfaced Bharti 'Declared vs. Observed' Zenodo paper and datasets; SandScope Glasgow eprint; 2608.28497; 2608.27299 (off-topic)`
- `zenodo.org API/curl: records 22649163, 21778282, 21751273, 21798111, 21449149/21778727, 21501867/21778894, 21751498, 21728370 + paper.pdf + aggregates.json + REPORT.md + flips_v1.csv -> binding-gap paper read in full (no runtime observation), dataset row counts verified, drift aggregates verified`
- `curl + fetch https://mcpindex.ai/ and https://mcpindex.ai/drift-report -> live drift figures (76 snapshots to 2026-09-10); contract-diff only`
- `fetch + curl https://glama.ai/mcp/methodology (+Wayback 20260508, TDQS blog 2026-04-03 link, a server listing page) -> Firecracker syscall/network observation against declared capability set; >1M scans; no aggregate mismatch numbers`
- `web search: glama.ai MCP server sandbox Firecracker "behavioural profile" OR "behavioral profile" findings de-listed servers malicious egress -> only methodology page and listings`
- `web search: stacklok ToolHive registry annotation accuracy validated "readOnlyHint" source code results August 2026 -> no follow-up to May 2026 promise`
- `web search: youtube talk 2026 "MCP" servers "what they actually do" runtime sandbox observed network file access tools declared -> no talk found`
- `web search: huggingface dataset MCP servers security runtime traces tool annotations 2026 -> DeepNLP/mcp-servers listing only; no runtime-trace dataset`
- `web search: "MCP servers" strace OR "opensnoop" OR "sysdig" traced "what files" "network connections" blog experiment 2026 -> mcpsnoop (JSON-RPC proxy, Jul 2026), eunomia-bpf/MCPtrace scripts; no corpus measurement`
- `web search: Sysdig OR Falco OR Datadog MCP server runtime behavior eBPF observed "MCP servers" analysis 2026 -> product pages and eBPF explainers only`
- `web search: Wiz OR "Unit 42" OR Aikido OR JFrog research MCP servers scanned over-permissioned tools findings 2026 -> Wiz exposed-server/honeypot posts, JFrog marketing; nothing on declared vs actual`
- `web search + fetch developers.openai.com/apps-sdk/app-submission-guidelines: OpenAI Apps SDK app review readOnlyHint destructiveHint annotations "accurately" -> annotations + written justification required; rejection 'common' for wrong labels; no verification mechanism or stats (opened during the search, not in verified set)`
- `web search + fetch claude.com/docs/connectors/building/submission: Anthropic MCP directory policy connectors review tool annotations -> annotations mandatory; manual review; no data (opened during the search, not in verified set)`
- `web search + fetch theweatherreport.ai/posts/aisvs-action-class-authority/: OWASP AISVS "9.2.3" reversibility classification -> Agnihotri post 2026-06-05 proposing manifest-declared reversibility; no measurement`
- `web search + curl PDF + fetch index.canopii.dev (mcp-security-index, methodology, per-server page): Canopii "State of MCP Security 2026" 11,524 servers -> full report read; live index captured; no annotation-accuracy control`
- `fetch + curl https://techcommunity.microsoft.com/blog/microsoft-security-blog/the-state-of-mcp-security-in-2026/4531327 -> guidance; no measurements; not included`
- `fetch https://learn.microsoft.com/en-us/windows/ai/mcp/servers/mcp-containment -> declared appxmanifest capabilities enforced by containment; no measurement`
- `web search + fetch docker.com 'Enhancing Trust in the MCP Ecosystem': Docker MCP Catalog security review "we analyzed" OR "we observed" servers network egress secrets -> LLM-agent code review of catalog PRs (2025-12-03); no stats`
- `web search + fetch mcpblog.dev 2026-03-13: "MCP" servers "annotations" "readOnlyHint" mismatch OR incorrect study percent tools "we found" 2026 -sunpeak -> github-mcp-server issues and explainers; '17%' is users enabling GitHub /readonly mode`
- `web search: "Sam Morrow" GitHub MCP annotations "17%" OR "percent" tools readOnlyHint adoption talk -> no annotation-accuracy data`
- `web search: IMC 2026 accepted papers "Model Context Protocol" OR "MCP servers" measurement -> none; surfaced 2509.25292 (MCPCrawler, 8,060 servers, static; not included)`
- `web search: RAID 2026 OR ACSAC 2026 OR ESORICS 2026 OR "AsiaCCS 2026" accepted papers "Model Context Protocol" MCP servers -> no lists surfaced`

## Known incidents

**Verdict:** partial · 80 supporting sources · 11 not used · 155 searches

### Supporting sources

1. **The Vulnerable MCP Project: Comprehensive Model Context Protocol Security Database** — vulnerablemcp.info (Vineeth Sai) — undated; entries 2025-03-29 to 2026-02-04  
   <https://vulnerablemcp.info/>  
   [TRACKER status=stale] Searchable community database of MCP vulnerabilities with severity, category, discoverer, date and source per entry - the closest thing to a public MCP incident inventory, but the newest entry is 2026-02-04 (seven months old), with no update stamp or inclusion methodology.
   - Figures: “50 Vulnerabilities; 13 Critical; 32 Researchers” · “Categories: Prompt Injection 13, Input Validation 17, Auth Failures 5, Session Mgmt 2, Integrity 4, Trust Model 4”
   - Sample/method: Curated community list; no stated inclusion criteria.
   - Limitations: Mixes demos with CVEs; nothing on 2026 worm waves, Deadbugz, OX advisory or Context7 ...

2. **The MCP Security Incident Ledger: 27 Dated Entries** — Digital Applied — 2026-08-24  
   <https://www.digitalapplied.com/blog/mcp-security-incident-ledger>  
   [TRACKER status=frozen-snapshot] Most recent dated ledger found: 25 incidents plus 2 protocol revisions, 2025-04-01 to 2026-08-18, with a stated inclusion rule (date from CVE/GHSA, vendor advisory or named researcher disclosure); a single vendor snapshot with patch status frozen at 2026-08-24 and no update commitment.
   - Figures: “'27 dated entries ... 25 incidents plus 2 protocol revisions, April 2025 through August 24, 2026'; '16 of 27 entries with a confirmed fix' ...” · “Type split (25 rows): command/code injection 11; prompt injection/tool poisoning 5; confused deputy/isolation 3; rug pull 2; supply chain 2; missing auth 2”
   - Sample/method: Curated ledger; 'not an industry census'.
   - Limitations: Frozen; misattributes Figma CVE-2025-53967 to Endor Labs (Imperva is the discoverer) ...

3. **A Timeline of Model Context Protocol (MCP) Security Breaches** — AuthZed (Sohan Maheshwar) — 2025-11-25; updated April 2026 and 2026-05-30  
   <https://authzed.com/blog/timeline-mcp-breaches>  
   [TRACKER status=vendor-timeline, last update 2026-05-30] Quarter-bucketed vendor timeline of 14 entries from April 2025 (WhatsApp MCP) to April 2026 (OX design flaw) that promises to be kept updated; the only self-described timeline revised more than once, but it lags 3+ months and restates others' figures.
   - Figures: “14 entries: Jan-Apr 2026: 4; Oct-Dec 2025: 2; Jul-Sep 2025: 4; Apr-Jun 2025: 4” · “mcp-remote 'over 437,000 downloads'; Smithery token 'granted control over >3,000 apps'; nginx-ui 'CVE-2026-33032, CVSS 9.8' ...”
   - Sample/method: Curated vendor timeline.
   - Limitations: Authorization-vendor marketing; month-level dates; misses June-September 2026 ...

4. **MCP-related CVE reference (mcp-cve-project)** — mcp-security-project org; 'Maintained and curated by Vandana Verma ... — created 2026-05-07; pushed 2026-09-07  
   <https://github.com/mcp-security-project/mcp-cve-project>  
   [TRACKER status=maintained, CVE-only] The only actively maintained MCP-specific index found (pushed four days before this sweep), mapping 570 CVEs to OWASP MCP Top 10 categories; covers CVEs only - no malicious packages, data leaks, demos or registry abuse.
   - Figures: “'Coverage: 570 indexed CVEs'; 'Newly verified missing CVEs added on 2026-09-07'” · “MCP01 92; MCP02 75; MCP03 Tool Poisoning 2; MCP04 Supply Chain 37; MCP05 Command Injection 210; MCP06 13; MCP07 AuthN/AuthZ 112; MCP08 4; MCP09 22; MCP10 5”
   - Sample/method: Manual curation; 'MCP-related' criteria not stated.
   - Limitations: Small project; likely includes CVEs where MCP is incidental; one maintainer's mapping.

5. **Top MCP security resources - September 2026 (series: Jun 2025 ... Jun/Jul/Aug/Sep 2026)** — Adversa AI (Sergey Malenkovich) — 2026-09-07 (Aug 2026-08-06; Jul 2026-07-06; Jun 2026-06-04)  
   <https://adversa.ai/blog/top-mcp-security-resources-september-2026/>  
   [TRACKER status=monthly-digest] Latest edition of the longest-running periodic MCP security round-up (editions verified for June/July 2025 and June-September 2026 at adversa.ai/blog/top-mcp-security-resources-{june,july,august}-2026/) ...
   - Figures: “Sep: Deadbugz '23 pull requests ... in 74 minutes', payload 'after exactly three tool calls'; CVE-2026-73498 Atlassian MCP CVSS 7.7 fixed v0.22.0 ...” · “Aug: 'July 13 SANS ISC diary counted roughly 200 requests from 49 distinct source IPs'; Jul: Amazon Q 'CVSS 8.5 .. ...”
   - Sample/method: Secondary digest of others' work.
   - Limitations: Vendor round-up; slug naming not uniform (older 'mcp-security-digest' slugs for Aug 2025 ...

6. **MCP Security Digest - July 2025** — Adversa AI — 2025-07-03 (June 2025 edition datePublished 2025-06-11)  
   <https://adversa.ai/blog/mcp-security-digest-july-2025/>  
   [TRACKER status=monthly-digest, early edition] Documents the mid-2025 cluster: WordPress AI Engine, Anthropic SQLite reference server, Inspector CVE-2025-49596, VirusTotal census, Hasan et al., Backslash, Asana.
   - Figures: “WordPress AI Engine '100,000 WordPress Sites Affected', patched June 18, 2025; SQLite server 'forked over 5,000 times before being archived'” · “VirusTotal '17,845 GitHub repositories', 'over 8% showed signs of intentional malice'; '1,899 open-source MCP servers... over 7% ... 5.5%'”
   - Sample/method: Secondary round-up.
   - Limitations: Figures relayed without method; 100,000-site figure not on the advisory.

7. **MITRE ATLAS case studies (ATLAS.yaml v5.6.0 deprecated; current ...** — MITRE ATLAS (mitre-atlas/atlas-data) — ATLAS-2026.08 modified 2026-05-27; repo pushed 2026-09-01  
   <https://raw.githubusercontent.com/mitre-atlas/atlas-data/main/dist/ATLAS.yaml>  
   [TRACKER status=institutional, minimal] The only institutional knowledge base indexing MCP events: four MCP-centred case studies of which only AML.CS0053 (Poisoned Postmark MCP Server, reporter Koi Research) is typed 'incident'; Cato Atlassian (CS0039), Backslash NeighborJack (CS0045) and Invariant Labs (CS0054) are 'exercise' ...
   - Figures: “v5.6.0: 57 case studies, 4 mention MCP (1 incident, 3 exercise)” · “ATLAS-2026.08: 72 case studies (AML.CS0000-CS0071); same 4 MCP entries; Postmark 'reached over 1,000 downloads per week' before the 'rugpull'”
   - Sample/method: Curated case studies; regex over case-study text.
   - Limitations: Fetched v5.6.0 self-declared deprecated; TTP knowledge base not an inventory ...

8. **ModelContextProtocol-Security/vulnerability-db ('A Cloud Security Alliance community ...** — ModelContextProtocol-Security GitHub org (CSA-affiliated) — created 2025-07-10; last content commit 2025-07-16; pushed 2026-07-14  
   <https://github.com/ModelContextProtocol-Security/vulnerability-db>  
   [TRACKER status=nominal] Self-described 'Comprehensive vulnerability database for Model Context Protocol servers and implementations' that contains exactly one advisory (OSV-MCPS-2025-EB70F912, 'Claude Code reads .env files by default without user consent', 2025-07-16) - the institutional MCP vulnerability database is a scaffold.
   - Figures: “8 stars, 1 fork; 8 commits; 1 advisory file” · “Commits: 2025-07-10 init, 07-14 readme, 07-16 'Initial vulnerability', 07-16 test stub removed, 08-22 CoC, 09-23 README, 10-02 CODEOWNERS, 2026-07-14 CLAUDE.md”
   - Sample/method: Repository inspection via gh api on 2026-09-11.
   - Limitations: Shows the inventory is nominal; does not prove CSA tracks nothing elsewhere.

9. **MCPThreatHive: Automated Threat Intelligence for MCP Ecosystems (+ ...** — arXiv (Yi Ting Shen, Kentaroh Toyoda, Alex Leung; Vulcan Research) — 2026-04-15; repo 1 commit  
   <https://arxiv.org/abs/2604.13849>  
   [TRACKER status=tooling-only] Self-hosted aggregator (DuckDuckGo, RSS, NVD API, GHSA API, LLM-classified into MCP-01..38); neither paper nor repo (15 stars, 3 forks, 1 commit) publishes a dataset, timeline or ingestion counts; only incidents named are 'The GitHub MCP vulnerability (2025)' and CVE-2025-6514.
   - Figures: “Sources: 'DuckDuckGo ...; RSS feeds (ArXiv CS.CR, ArXiv CS.AI, Krebs on Security, The Hacker News, and Schneier on Security); the NIST ... NVD REST API ...” · “Repo: 'Stars 15 stars', 'Forks 3 forks', 'History 1 Commit'; 0 hits for 'dataset', 'timeline', 'seed'”
   - Sample/method: System description, no evaluation.
   - Limitations: No incident data shipped; vendor-affiliated.

10. **The State of MCP Security 2026: Incidents, Attack Patterns, and Defense Coverage** — PipeLab (Josh Waldrep) — 2026-04-12  
   <https://pipelab.org/blog/state-of-mcp-security-2026/>  
   [TRACKER status=snapshot] Vendor round-up of eight public incidents Apr 2025-early Apr 2026 (Invariant tool poisoning, WhatsApp rug-pull, GitHub MCP, MCPoison, mcp-server-git CVE-2025-68143/4/5 by Cyata, postmark-mcp, EscapeRoute, MCPJam Inspector CVE-2026-23744, mcp-remote) pointing to vulnerablemcp.info as the community tracker ...
   - Figures: “'The Vulnerable MCP Project tracks over 50 known MCP vulnerabilities ... with 13 rated critical'” · “postmark-mcp: 1,500 weekly downloads, 1,643 total; roughly 300 organizations”
   - Sample/method: Desk research from public sources only.
   - Limitations: Vendor content; cut-off early April 2026.

11. **GitHub Advisory Database search: type:malware mcp** — GitHub Advisory Database (malware from OpenSSF malicious-packages ... — 2026-09-11 live; entries 2025-06-02 to 2026-09-10  
   <https://github.com/advisories?query=type%3Amalware+mcp>  
   [TRACKER status=machine-feed, not curated] Most complete machine-readable trace of malicious MCP-named packages: 240 advisories, with July 2026 spikes (65 pip on 07-21; 70 npm on 07-27 incl. unscoped name-squats of Anthropic reference servers) and an Aug 20 repeat batch ...
   - Figures: “240 advisories (10 pages); by month 2025-06 2, 07 2, 09 5, 10 3, 11 9, 12 3, 2026-03 1, 04 2, 05 7, 06 7, 07 155, 08 30, 09 14” · “2026-07-27 npm: mcp-server-git/-github/-fetch/-figma/-notion/-postgres/-redis/-sentry/-sequential-thinking/-supabase/-everything; 2026-08-20 repeat ...”
   - Sample/method: UI search, all 10 pages fetched with curl and tallied by datetime.
   - Limitations: Free-text name match; GHSA dates lag OSSF by months (Zapier Nov 2025 -> 2026-08-14 ...

12. **GitHub Advisory Database search: mcp** — GitHub Advisory Database — 2026-09-11  
   <https://github.com/advisories?query=mcp>  
   [TRACKER status=machine-feed] Keyword query returning 783 advisories mentioning 'mcp'; page 1 (25) all published Sep 4-11, 2026 - a velocity proxy, not an inventory.
   - Figures: “'783 advisories'; 32 pages” · “GHSA-87q9-x2gp-qchr CVE-2026-78573 Critical IBM ContextForge (Sep 11); GHSA-wcjj-9m6g-2fr2 CVE-2026-59176 functype-mcp-server, EQSTLab (Sep 9) ...”
   - Sample/method: Full-text keyword query, newest first.
   - Limitations: Includes non-MCP projects (Langflow, n8n, CodeWhale, OmniRoute).

13. **NVD CVE API 2.0 keyword searches 'model context protocol' and 'mcp server'** — NIST NVD — 2026-09-11T12:57  
   <https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=model%20context%20protocol>  
   [TRACKER status=machine-feed] Union of two keyword queries = 355 unique CVEs (352 mention MCP), monthly publications rising from 6 (May 2025) to 71 (Aug 2026); confirms mcp-pinot CVE-2026-49257 CVSS 10.0, awslabs postgres-mcp-server CVE-2026-87911 (CVSS4 9.0), MCPHub CVE-2026-79743..79750, and a 2026-08-27 batch of 10.
   - Figures: “totalResults 78 + 329; union 355” · “By month: 2025-05 6, 06 2, 07 13, 08 8, 09 13, 10 8, 11 5, 12 14, 2026-01 11, 02 8, 03 24, 04 42, 05 32, 06 28, 07 56, 08 71, 09 (to 09-11) 11”
   - Sample/method: NVD API substring search, resultsPerPage=2000, local union/regex.
   - Limitations: Only CVEs whose description mentions MCP; NVD lags CNAs; several records CNA-scored only.

14. **MCP Security Statistics 2026: CVEs, Vulnerabilities & Breach Data** — Practical DevSecOps (Varun Kumar) — 2026-06-26  
   <https://www.practical-devsecops.com/mcp-security-statistics-2026-report/>  
   [TRACKER status=secondary-compilation] ~49 attributed third-party figures; its headline '30+ CVEs in a 60-day window / 43% command injection' is attributed only to 'multiple researchers' and is not in Endor Labs' post - treat as unsourced.
   - Figures: “'30+ CVEs filed against MCP servers in a single 60-day window in early 2026 (multiple researchers ...”
   - Sample/method: Compilation without method detail.
   - Limitations: Training-vendor marketing; some upstream figures describe credential ...

15. **MCP Security Crisis: Systemic Design Flaws in AI Agent Infrastructure (+ CSA ...** — Cloud Security Alliance AI Safety Initiative — 2026-05-04 (companion note 2026-04-20)  
   <https://labs.cloudsecurityalliance.org/research/csa-research-note-mcp-security-crisis-20260504-csa-styled/>  
   [TRACKER status=secondary-synthesis] CSA notes restating OX Security's April 2026 research with a seven-CVE table (CVE-2025-49596, CVE-2025-54136, CVE-2025-54994, CVE-2026-22252, CVE-2026-22688, CVE-2026-30623, CVE-2026-30615) under blanket sourcing ...
   - Figures: “'an estimated 200,000 vulnerable instances ... more than 150 million package downloads' ...”
   - Sample/method: No original measurement.
   - Limitations: Entirely secondary; discoverer credit unreadable from blanket table ...

16. **State of MCP Security 2026 (Annual Report)** — Canopii — 2026-07  
   <https://www.canopii.dev/State%20of%20MCP%20Security%202026.pdf>  
   [MEASUREMENT registry] Scan of 11,524 official-registry servers (June 2026): grade distribution, dangerous code sinks and 184 'rug pull' versions whose tool definitions changed after publication - the only registry-wide rug-pull count found ...
   - Figures: “11,524 servers scored; 830 graded D/F; 232 with a confirmed dangerous code sink”
   - Sample/method: Static + supply-chain + live probes + AI-assisted review ...
   - Limitations: Vendor report; rug pull = any definition change; unverifiable.

17. **First Malicious MCP in the Wild: The Postmark Backdoor That's Stealing Your Emails (+ ...** — Koi Security (Idan Dardikman), Wayback capture; Snyk (Liran Tal) ... — 2025-09-25 (package 1.0.0 published 2025-09-15; removed by 2025-09-25)  
   <https://web.archive.org/web/20250929094654/https://www.koi.security/blog/postmark-mcp-npm-malicious-backdoor-email-theft>  
   [INCIDENT type=malicious-package date=2025-09-15..25 component=npm postmark-mcp (impostor of Postmark's server, publisher 'phanpak') discoverer=Koi Security cve=none] From v1.0.16 every outbound email was BCC'd to phan@giftshop.club; developer deleted the package after contact; Snyk confirms versions 1.0.16-1.0.18 and 31 other packages under the same npm user.
   - Figures: “'postmark-mcp - downloaded 1,500 times every single week'; impact explicitly a 'guestimate': ~20% active use -> 'about 300 organizations' -> '3,000 to 15,000 ...” · “Snyk: 'starting from version 1.0.16 through at least 1.0.18'; 'phanpak ... owns 31 other packages on npm'; '2025-09-25: The package does not exist on npm'”
   - Sample/method: npm download counts and static analysis; no telemetry.
   - Limitations: 'First malicious MCP' is a vendor claim (OSSF auth0-mcp-server record predates it) ...

18. **OS command injection in mcp-remote (JFSA-2025-001290844 / CVE-2025-6514 ...** — JFrog Security Research (Or Peles); GitHub Advisory Database — 2025-07-09  
   <https://research.jfrog.com/vulnerabilities/mcp-remote-command-injection-rce-jfsa-2025-001290844/>  
   [INCIDENT type=vuln date=2025-07-09 component=npm mcp-remote 0.0.5-0.1.15 discoverer=JFrog (Or Peles) cve=CVE-2025-6514 cvss=9.6] Hostile remote server's crafted authorization_endpoint URL yields OS command execution on the client; patched 0.1.16 (github.com/advisories/GHSA-6xpm-ggf7-wc3p).
   - Figures: “CVSS 9.6; affected [0.0.5, 0.1.15]; patched 0.1.16; PoC file:/c:/windows/system32/calc.exe” · “'437,000 downloads' appears only in secondary coverage (Docker, Errico et al.)”
   - Sample/method: Vendor advisory.
   - Limitations: No in-the-wild exploitation reported.

19. **Critical RCE in Anthropic MCP Inspector (CVE-2025-49596)** — Oligo Security (Avi Lumelsky) — 2025-06-27 (CVE 2025-06-13)  
   <https://www.oligo.security/blog/critical-rce-vulnerability-in-anthropic-mcp-inspector-cve-2025-49596>  
   [INCIDENT type=vuln date=2025-06-13 component=@modelcontextprotocol/inspector <0.14.1 discoverer=Oligo (independent report 2025-03-26 also acknowledged) cve=CVE-2025-49596 cvss=9.4] Unauthenticated Inspector proxy (port 6277) plus browser CSRF/0.0.0.0-day/DNS rebinding gives a website RCE on developer machines; fixed 0.14.1. A second Inspector CVE-2025-58444 (XSS to command execution, 8.6, 2025-09-08) is in the GHSA API.
   - Figures: “CVSS 9.4; fixed 0.14.1; March 26, 2025 independent report; April 18 Oligo HackerOne report; June 13 CVE”
   - Sample/method: Researcher disclosure.
   - Limitations: Developer tool; no exploitation claimed.

20. **EscapeRoute: Breaking the Scope of Anthropic's Filesystem MCP Server (CVE-2025-53109 & ...** — Cymulate Research Labs (Elad Beber) — 2025 timeline (page updated 2026-03-17)  
   <https://cymulate.com/blog/cve-2025-53109-53110-escaperoute-anthropic/>  
   [INCIDENT type=vuln date=2025-07-01 component=@modelcontextprotocol/server-filesystem discoverer=Cymulate (Elad Beber) cve=CVE-2025-53109 (8.4), CVE-2025-53110 (7.3)] Prefix-match containment bypass and symlink bypass in the official reference server (access to /etc/sudoers, code execution); fixed npm 2025.7.1.
   - Figures: “Reported March 30, 2025; acknowledged May 1; patched July 1, 2025; fixed 2025.7.1”
   - Sample/method: Researcher disclosure.
   - Limitations: Page date is a republish date.

21. **Anthropic MCP Server Flaws Lead to Code Execution, Data Exposure (Cyata; mcp-server-git)** — SecurityWeek (Ionut Arghire), reporting Cyata — 2026-01-21 (CVEs 2025-12-17)  
   <https://www.securityweek.com/anthropic-mcp-server-flaws-lead-to-code-execution-data-exposure/>  
   [INCIDENT type=vuln date=2025-12-17 component=official mcp-server-git (PyPI) discoverer=Cyata cve=CVE-2025-68143, CVE-2025-68144, CVE-2025-68145] Prompt-injection-reachable RCE, file access and deletion in the Git reference server; reported June-July 2025, fixed 2025.12.18; a fourth, CVE-2026-27735 (git_add path traversal, 2026-02-26), is in the GHSA API.
   - Figures: “Fixed version 2025.12.18; survey 2608.17275 quotes CVSS 8.8 / 7.1; GHSA rates all four 'medium'”
   - Sample/method: Secondary coverage.
   - Limitations: Cyata primary not opened; severities differ across sources.

22. **Asana MCP server data exposure incident (+ UpGuard: Asana Discloses Data Exposure Bug in ...** — Nudge Security; UpGuard (Greg Pollock) ... — 2025-06-18 (UpGuard originally June 2025 per Wayback 2025-06-19; page now re-dated 2026-07-02)  
   <https://www.nudgesecurity.com/post/asana-mcp-server-data-exposure-incident>  
   [INCIDENT type=data-leak date=2025-06-04 component=Asana hosted MCP server discoverer=Asana (internal) cve=none] The only confirmed production cross-tenant data exposure in an MCP server found: bug present since the May 1 release 'potentially allowed users to access sensitive data from other organizations'; not a hack; server offline June 4, customers notified June 16; ~1,000 customers.
   - Figures: “'Asana estimates the incident affected approximately 1,000 customers'; 'limited to information accessible within the MCP user's permissions'” · “UpGuard: May 1 release, June 4 identified/offline, June 16 notified; 'This was not a result of a hack or malicious activity on our systems.'”
   - Sample/method: Relays of Asana's customer notification.
   - Limitations: Asana primary notice not located; no confirmation data was viewed.

23. **From Path Traversal to Supply Chain Compromise: Breaking MCP Server Hosting (Smithery.ai)** — GitGuardian (Gaetan Ferry) — 2025-10-22 (incident 2025-06-10..15)  
   <https://blog.gitguardian.com/breaking-mcp-server-hosting/>  
   [INCIDENT type=registry/hosting-compromise date=2025-06-10..15 component=Smithery.ai build pipeline (dockerBuildPath) discoverer=GitGuardian cve=none] Path traversal in build context exposed the builder's .docker/config.json with a Fly.io token giving access to 3,000+ hosted servers and their API keys; fixed in five days; 'no evidence of exploitation was found'.
   - Figures: “'provided access to over 3,000 hosted AI servers'; '3,243 apps' (fetch summary); demonstrated Brave API key theft from one server” · “June 10 discovery; June 13 disclosure/PoC; June 14 partial fix + rotation; June 15 complete fix”
   - Sample/method: Researcher PoC on one hosted server.
   - Limitations: 'Compromised' is rhetorical; 3,243 not grep-verified.

24. **The Mother of All AI Supply Chains (+ OX advisory; The Register 2026-04-16 ...** — OX Security (Moshe Siman Tov Bustan, Mustafa Naamnih, Nir Zadok ... — 2026-04-15 (modified 2026-07-21)  
   <https://www.ox.security/blog/the-mother-of-all-ai-supply-chains-critical-systemic-vulnerability-at-the-core-of-the-mcp/>  
   [INCIDENT type=vuln+registry-abuse date=2026-04-15 component=user input into STDIO MCP configuration across 14+ products discoverer=OX Security cve=CVE-2025-65720, CVE-2026-30623 (LiteLLM), CVE-2026-30624, CVE-2026-30618, CVE-2026-33224, CVE-2026-30617, CVE-2026-30625, CVE-2026-30615 (Windsurf), CVE-2026-26015 (DocsGPT); advisory adds CVE-2026-54449, CVE-2026-30616, CVE-2026-40933] Coordinated RCE disclosure; Anthropic 'declined to modify the protocol' calling the behaviour 'expected'; 9 of 11 registries accepted a malicious 'trial balloon' (primary page).
   - Figures: “'150M+ downloads'; '7,000+ publicly accessible servers'; 'up to 200,000 vulnerable instances'; 'over 30 responsible disclosures and 10+ High/Critical CVEs' ...” · “Register: Anthropic 'quietly released an updated security policy' (adapters 'should be used with caution') which researchers said 'didn't fix anything' ...”
   - Sample/method: Vendor research; blast-radius figures have no stated method.
   - Limitations: CVE counts differ across OX pages (9/12), THN (10), Digital Applied (16).

25. **Another Critical RCE Discovered in a Popular MCP Server (Framelink Figma MCP ...** — Imperva (Yohann Sillam); THN 2025-10-08 ... — 2025-10-07 (fix 2025-09-29)  
   <https://www.imperva.com/blog/another-critical-rce-discovered-in-a-popular-mcp-server/>  
   [INCIDENT type=vuln date=2025-09-29 component=npm figma-developer-mcp (third-party Framelink) discoverer=Imperva (Yohann Sillam) cve=CVE-2025-53967 cvss=7.5 (THN)] Command injection in fetchWithRetry curl fallback; disclosed July 8, partial fix Aug 13, complete fix v0.6.3 Sept 29, 2025.
   - Figures: “'more than 10,000 stars on GitHub and 600,000 downloads'; 'surpassing 100,000 downloads per month'”
   - Sample/method: Vendor research; unsourced popularity figures.
   - Limitations: Digital Applied misattributes to Endor Labs.

26. **MCPoison: Cursor IDE MCP trust bypass (CVE-2025-54136)** — Check Point Research (Andrey Charikov, Roman Zaikin, Oded Vanunu) — 2025-08-05  
   <https://research.checkpoint.com/2025/cursor-vulnerability-mcpoison/>  
   [INCIDENT type=vuln (client) date=2025-08-05 component=Cursor .cursor/mcp.json approval discoverer=Check Point Research cve=CVE-2025-54136 cvss=7.2 (PipeLab)] Approval bound to config name only, so later command edits ran without re-prompt (persistent RCE via shared repo); disclosed July 16, fixed Cursor 1.3 July 29, 2025.
   - Figures: “'Once an MCP is approved, future modifications to its command or arguments are trusted without any additional validation or prompt.'”
   - Sample/method: PoC research.
   - Limitations: Client-side; no exploitation.

27. **CVE-2025-54135 - Cursor writes .cursor/mcp.json without approval ('CurXecute' ...** — NVD (CNA GitHub); discoverer Aim Security per secondary ... — 2025-08-05  
   <https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2025-54135>  
   [INCIDENT type=vuln (client) date=2025-08-05 component=Cursor <1.3.9 discoverer=Aim Security (primary 403) cve=CVE-2025-54135] Indirect prompt injection creates mcp.json and can 'trigger RCE on the victim without user approval'; the Cuckoo Attack paper (arxiv.org/abs/2509.15572) records its disclosure on August 1 (CVSS 8.6) and validates mcp.json persistence attacks on nine AI-IDE pairs.
   - Figures: “CVSS 8.5 HIGH (GitHub CNA) vs 9.8 CRITICAL (NVD primary); fixed 1.3.9” · “Cuckoo: 'Arbitrary Command Execution (ACE) in all Agents except Cursor'; 'Microsoft and ByteDance confirm the vulnerability'”
   - Sample/method: CVE record; PoC paper.
   - Limitations: Aim primary unreachable; fix version 1.3 vs 1.3.9 differs.

28. **Caught in the Hook: RCE and API Token Exfiltration Through Claude Code Project Files ...** — Check Point Research (Aviv Donenfeld, Oded Vanunu) — 2026-02-25  
   <https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/>  
   [INCIDENT type=vuln (host) date=2025-10-03/2026-01-21 component=Claude Code enableAllProjectMcpServers / ANTHROPIC_BASE_URL discoverer=Check Point Research cve=CVE-2025-59536, CVE-2026-21852, GHSA-ph6w-f82w-28w6] Repo settings ran .mcp.json servers before the trust dialog; project base URL leaked the full API key.
   - Figures: “MCP bypass reported Sept 3, fixed Sept 22, CVE Oct 3, 2025; API-key exfil reported Oct 28, fixed Dec 28, CVE Jan 21, 2026”
   - Sample/method: Vulnerability research.
   - Limitations: Host-side; no exploitation.

29. **ContextCrush: The Context7 MCP Server Vulnerability Hiding in Plain Sight** — Noma Security (Eli Ainhorn); CVE via NVD/VulnCheck — 2026-03-05 (CVE-2026-75130 published 2026-08-18)  
   <https://noma.security/blog/contextcrush-context7-the-mcp-server-vulnerability-hiding-in-plain-sight>  
   [INCIDENT type=vuln date=2026-02-18..03-05 component=Upstash Context7 hosted MCP server 'Custom Rules' (through 2.1.2) discoverer=Noma cve=CVE-2026-75130 cvss=9.0 v3.1 / 6.4 v4.0] User-submitted rules served verbatim to every user querying a library; fixed Feb 23, 2026.
   - Figures: “'approximately 50,000 GitHub stars'; 'over 8 million npm downloads'” · “NVD: published 2026-08-18, source VulnCheck, CVSS 3.1 9.0 CRITICAL / 4.0 6.4 MEDIUM”
   - Sample/method: Vendor research + NVD API.
   - Limitations: Digital Applied lists it as unfixed despite Noma's Feb 23 fix.

30. **Actively Exploited nginx-ui Flaw (CVE-2026-33032, 'MCPwn') Enables Full Nginx Server ...** — The Hacker News (Ravie Lakshmanan), reporting Pluto Security / ... — 2026-04-15 (fix 2026-03-15; NVD 2026-03-30)  
   <https://thehackernews.com/2026/04/critical-nginx-ui-vulnerability-cve.html>  
   [INCIDENT type=vuln, exploited-in-the-wild date=2026-03-15 component=nginx-ui MCP integration (/mcp_message unauthenticated) discoverer=Pluto Security (Yotam Perkal) cve=CVE-2026-33032 cvss=9.8] The only MCP-integration CVE reported as actively exploited (Recorded Future's March 2026 list); fixed 2.3.4.
   - Figures: “'about 2,689 exposed instances' (Shodan); 'one of the 31 vulnerabilities that have been actively exploited by threat actors in March 2026' ...”
   - Sample/method: Secondary; Recorded Future report not opened.
   - Limitations: Exploitation details absent.

31. **CVE-2026-26118 - Server-side request forgery in Azure MCP Server** — NVD (CNA Microsoft) — 2026-03-10  
   <https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2026-26118>  
   [INCIDENT type=vuln date=2026-03-10 component=Microsoft Azure MCP Server discoverer=unnamed cve=CVE-2026-26118 cvss=8.8] Microsoft's own vendor MCP server: SSRF allowing 'an authorized attacker to elevate privileges over a network'; fix 2.0.0-beta.17 per Blueinfy.
   - Figures: “CVSS 3.1 8.8 HIGH (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H)”
   - Sample/method: CVE record.
   - Limitations: One-line description; Microsoft advisory not opened.

32. **CVE-2026-27825 / CVE-2026-27826 - mcp-atlassian arbitrary file write and unauthenticated ...** — NVD (CNA GitHub) — 2026-03-10  
   <https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2026-27825>  
   [INCIDENT type=vuln date=2026-03-10 component=mcp-atlassian <0.17.0 discoverer=unnamed cve=CVE-2026-27825 (CNA 9.0 / NVD 8.0), CVE-2026-27826 (8.2)] download_path written without boundary enforcement (/etc/cron.d/ code execution); unauthenticated outbound requests via custom headers; fixed 0.17.0. Later CVE-2026-73498 (7.7) in Adversa's Sept digest.
   - Figures: “CNA 9.0 CRITICAL vs NVD 8.0 HIGH for 27825; 27826 8.2 HIGH”
   - Sample/method: CVE records.
   - Limitations: No exploitation evidence.

33. **Amazon Q Vulnerability: Compromise via MCP Auto-Execution** — Wiz Research (Maor Dokhanian) — 2026-06-26  
   <https://www.wiz.io/blog/amazon-q-vulnerability>  
   [INCIDENT type=vuln (client) date=2026-06-26 component=Amazon Q Developer VS Code language server <1.65.0 discoverer=Wiz cve=CVE-2026-12957 (High)] Workspace .amazonq/mcp.json auto-loaded with no prompt, spawning MCP processes with cloud credentials on repo open; fixed 1.65.0.
   - Figures: “April 17 discovered; April 20 reported; May 12 fix; June 23 CVE; June 26 disclosure; Adversa quotes CVSS 8.5”
   - Sample/method: Vulnerability research.
   - Limitations: CVE-2026-12958 cited elsewhere is not on the page.

34. **CVE-2026-50548 / CVE-2026-50549 - Cursor sandbox escape ('DuneSlide' ...** — NVD (CNA GitHub); THN 2026-07-01 ... — 2026-06-25 (fix Cursor 3.0, 2026-04-02)  
   <https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2026-50548>  
   [INCIDENT type=vuln (client) date=2026-06-25 component=Cursor <3.0 sandbox discoverer=Cato Networks (primary blocked) cve=CVE-2026-50548, CVE-2026-50549 cvss=9.8 NVD / 9.3 CNA] Injection planted via a connected MCP service (THN: Cursor's threat model initially excluded 'misuse of MCP servers, even standard ones like the official Linear workspace') escapes the sandbox; reported Feb 19, rejected, reopened Feb 26, fixed Apr 2, CVEs June 5.
   - Figures: “NVD CVSS 3.1 9.8 CRITICAL and CVSS 4.0 9.3 for both; 'fixed in 3.0'”
   - Sample/method: CVE records + news.
   - Limitations: MCP linkage via THN only; Cato primary Incapsula-blocked.

35. **validatePath() does not canonicalize symlinks (chrome-devtools-mcp ...** — ChromeDevTools GitHub Security Advisory — 2026-06-16  
   <https://github.com/ChromeDevTools/chrome-devtools-mcp/security/advisories/GHSA-8qf9-62x2-82pp>  
   [INCIDENT type=vuln date=2026-06-16 component=npm chrome-devtools-mcp >=0.24.0 <=1.0.1 (Google) discoverer=enable7997 cve=CVE-2026-53766 cvss=6.1] Symlink in a workspace root passes validation -> out-of-root write/read via saveFile and upload_file; patched 1.1.0.
   - Figures: “CVSS 6.1 Moderate; patched 1.1.0”
   - Sample/method: Advisory.
   - Limitations: No Chrome DevTools MCP prompt-injection incident was found.

36. **Bug hunter tracks down three serious MCP database flaws, one left unpatched (Akamai)** — The Register (Jessica Lyons), reporting Akamai (Tomer Peled) — 2026-05-13  
   <https://www.theregister.com/security/2026/05/13/bug-hunter-tracks-down-three-serious-mcp-database-flaws-one-left-unpatched/5238916>  
   [INCIDENT type=vuln date=2025-12 (Doris fix) / 2026-05-13 component=Apache Doris MCP <0.6.1, StarTree Apache Pinot MCP <2.0.0, Alibaba RDS MCP (all versions) discoverer=Akamai cve=CVE-2025-66335] SQLi, unauthenticated HTTP transport, and missing-auth info disclosure; Alibaba called its flaw 'not applicable' for a fix and Akamai reported the inaction to CERT/CC.
   - Figures: “'CVE-2025-66335 ... Apache Doris MCP Server versions earlier than 0.6.1'; 'All versions of Alibaba RDS MCP are affected' ...”
   - Sample/method: Secondary coverage.
   - Limitations: Akamai primary not opened.

37. **Why a Classic MCP Server Vulnerability Can Undermine Your Entire AI Agent ...** — Trend Micro (Sean Park) — 2025-06-24  
   <https://www.trendmicro.com/en_us/research/25/f/why-a-classic-mcp-server-vulnerability-can-undermine-your-entire-ai-agent.html>  
   [INCIDENT type=vuln date=2025-06-24 component=Anthropic reference SQLite MCP server (archived 2025-05-29) discoverer=Trend Micro cve=none] f-string SQL injection enabling stored prompt injection; Anthropic called it 'an archived demo implementation', 'out of scope', no patch.
   - Figures: “'forked or copied more than 5000 times'; reported June 11, 2025”
   - Sample/method: Code review.
   - Limitations: Fork exposure asserted, not measured.

38. **AI Engine plugin for WordPress missing capability check on can_access_mcp ...** — GitHub Advisory Database (Wordfence/NVD) — 2025-06-19  
   <https://github.com/advisories/GHSA-gg23-wpg2-g99p>  
   [INCIDENT type=vuln date=2025-06-19 component=WordPress AI Engine 2.8.0-2.8.3 MCP endpoint discoverer=Wordfence cve=CVE-2025-5071 cvss=8.8] Subscriber-level users get 'full access to the MCP and run various commands like wp_create_user, wp_update_user and wp_update_option'.
   - Figures: “CVSS 8.8 High; '100,000 sites' figure only in Adversa's digest”
   - Sample/method: Advisory.
   - Limitations: Install base unverified.

39. **CVE-2025-53355 - MCP Server Kubernetes command injection via execSync** — NVD (CNA GitHub); GHSA-gjv4-ghm7-q58q — 2025-07-08  
   <https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2025-53355>  
   [INCIDENT type=vuln date=2025-07-08 component=mcp-server-kubernetes <2.5.0 discoverer=unnamed cve=CVE-2025-53355 cvss=7.5] CWE-77 command injection; fixed 2.5.0; CISA SSVC exploitation=poc.
   - Figures: “CVSS 3.1 7.5 HIGH (CNA, Secondary); no NVD primary score”
   - Sample/method: CVE record.
   - Limitations: References include an unrelated repo commit.

40. **From Well-Known to Well-Pwned: Common Vulnerabilities in AI Agents (OAuth Protected ...** — Obsidian Security (author unnamed) — 2025-09-30 (updated 2025-11-24)  
   <https://www.obsidiansecurity.com/blog/from-well-known-to-well-pwned-common-vulnerabilities-in-ai-agents>  
   [INCIDENT type=vuln (clients) date=2025-06..08 component=Gemini-CLI, MCP Inspector, Cherry Studio, VS Code, Windsurf, Smithery.ai, Lutra.ai, Glue.ai discoverer=Obsidian Security cve=CVE-2025-54074 + three unnamed] Malicious server abuses RFC 9728 /.well-known/oauth-protected-resource discovery so clients open attacker URLs; basis of the Black Hat Asia 2026 talk per irsdl/webhacklist.
   - Figures: “'To date, this research has led to 4 CVEs'; disclosure 'between June and August 2025'”
   - Sample/method: Manual research across ~8 clients.
   - Limitations: Three CVEs unnamed; Black Hat link unverified.

41. **Claude Desktop Extensions Vulnerable to Web-Based Prompt Injection (Koi ...** — Infosecurity Magazine (Kevin Poireault) ... — 2025-11-05 (fix verified 2025-09-19)  
   <https://www.infosecurity-magazine.com/news/claude-desktop-extensions-prompt/>  
   [INCIDENT type=vuln date=2025-09-19 component=Anthropic Chrome, iMessage, Apple Notes Claude Desktop Extensions discoverer=Koi Security cve=none (Koi CVSS 8.9)] Command injection in three official extensions; HackerOne July 3, 2025; fixed 0.1.9.
   - Figures: “CVSS 8.9 (Koi rating); fix 0.1.9”
   - Sample/method: Secondary (Koi primary JS shell).
   - Limitations: No CVE.

42. **Claude Desktop Extensions Exposes Over 10,000 Users to Remote Code Execution ...** — LayerX (Roy Paz) — 2026-02-09  
   <https://layerxsecurity.com/blog/claude-desktop-extensions-rce/>  
   [INCIDENT type=vuln (host, unfixed) date=2026-02-09 component=Claude Desktop Extensions (Calendar connector + Desktop Commander) discoverer=LayerX cve=none] Malicious calendar event triggers git pull and makefile execution without consent; 'execute without sandboxing'; Anthropic 'decided not to fix it at this time'.
   - Figures: “'over 10,000 active users'; 50 DXT extensions; CVSS 10/10 (self-rated)”
   - Sample/method: Single PoC.
   - Limitations: Self-assigned CVSS; unsourced user count.

43. **MCP fURI: SSRF to cloud metadata via Microsoft markitdown-mcp** — BlueRock (David Onwukwe) — 2026-01-20  
   <https://www.bluerock.io/post/mcp-furi-microsoft-markitdown-vulnerabilities>  
   [INCIDENT type=vuln date=2026-01-20 component=Microsoft markitdown-mcp convert_to_markdown (AWS IMDSv1) discoverer=BlueRock cve=none] Unbounded URI lets an agent be steered to 169.254.169.254; vendors offered 'workarounds'; also source of the '36.7% of 7,000+ servers' SSRF figure and the MCP Trust Registry (mcp-trust.com), a per-server risk database.
   - Figures: “'over 7,000 MCP servers, over 36.7% have potential exposed SSRF vulnerabilities'; Nov 2025 notified; Dec 2025 workarounds ...”
   - Sample/method: Static rule scan, rules undescribed.
   - Limitations: 'Potential' SSRF; no CVE.

44. **When Agentic Glue Melts: Exploiting Cloudflare Code Mode and Workers** — Check Point Research (Yarden Porat) — 2026-08-07  
   <https://research.checkpoint.com/2026/when-agentic-glue-melts/>  
   [INCIDENT type=vuln (MCP infrastructure) date=2026-08-07 component=Cloudflare workerd via Code Mode (MCP tools as TypeScript API) discoverer=Check Point cve=none] Five workerd bugs (two Critical UAFs) presented at Black Hat USA 2026; 'Cloudflare has not assigned CVEs'; fix workerd v1.20260619.1.
   - Figures: “5 vulnerabilities, 2 Critical; reported via HackerOne 2026-02-01 and 2026-03-12”
   - Sample/method: Vulnerability research.
   - Limitations: Indirect MCP framing.

45. **Azure DevOps MCP Server Vulnerability (hidden HTML comments, confused deputy)** — Manifold Security (Francisco Rosales) — 2026-09-10 (linked from Adversa 2026-08-06)  
   <https://www.manifold.security/blog/azure-devops-mcp-server-vulnerability>  
   [INCIDENT type=vuln (PoC, MSRC-triaged) date=2026-08 component=Microsoft Azure DevOps MCP server PR-description tool discoverer=Manifold cve=none] Hidden HTML comments returned verbatim to the agent (no 'spotlighting'), letting a reviewer's agent leak a confidential wiki page onto the attacker's PR.
   - Figures: “'We reported it to MSRC, who acknowledged and triaged the issue.'”
   - Sample/method: PoC.
   - Limitations: Page date conflicts with digest date.

46. **IBM ContextForge MCP Gateway default credentials (CVE-2026-78573)** — GitHub Advisory Database (NVD-sourced) — 2026-09-10/11  
   <https://github.com/advisories/GHSA-87q9-x2gp-qchr>  
   [INCIDENT type=vuln date=2026-09-10 component=IBM ContextForge MCP Gateway 1.0.0-1.0.7 cve=CVE-2026-78573 cvss=9.8] Remote admin access via default credentials (CWE-1392) - newest MCP CVE in this sweep.
   - Figures: “CVSS 9.8 Critical”
   - Sample/method: Advisory.
   - Limitations: Unreviewed; no exploitation data.

47. **excel-mcp-server path traversal (CVE-2026-85661)** — GitHub Advisory Database — 2026-09-04  
   <https://github.com/advisories/GHSA-xv88-r947-5c3v>  
   [INCIDENT type=vuln date=2026-09-04 component=excel-mcp-server 0.1.8 cve=CVE-2026-85661 cvss=9.3] No path confinement in stdio mode when EXCEL_FILES_PATH is unset -> arbitrary file read/write.
   - Figures: “CVSS 9.3 Critical; CWE-22”
   - Sample/method: Advisory.
   - Limitations: No patched version captured.

48. **GitHub Advisory Database API: advisories on official MCP SDKs ...** — GitHub Advisory Database (REST API); NVD for CVSS — queried 2026-09-11; entries 2025-06-13 to 2026-07-30  
   <https://api.github.com/advisories?ecosystem=pip&affects=mcp>  
   [INCIDENT type=vuln (official SDK stream) component=official SDKs/tooling cve=Python SDK CVE-2025-53365, CVE-2025-53366, CVE-2025-66416, CVE-2026-52869, CVE-2026-52870, CVE-2026-59950; TypeScript SDK CVE-2025-66414, CVE-2026-0621, CVE-2026-25536 (cross-client data leak, credits gh-arpeet/ahabian); Go SDK CVE-2026-27896, CVE-2026-33252, CVE-2026-34742, GHSA-q382-vc8q-7jhj; Ruby SDK CVE-2026-33946, CVE-2026-67430, CVE-2026-67431, CVE-2026-67432, CVE-2026-63118, CVE-2026-63119; FastMCP CVE-2026-32871 (10.0), CVE-2025-69196, CVE-2026-27124, CVE-2025-62800, CVE-2025-62801, CVE-2025-64340, GHSA-c2jp-c369-7pvx, GHSA-rcfx-77hg-w2wv; Inspector CVE-2025-49596, CVE-2025-58444; mcp-handler GHSA-w2fm-25vw-vh7f] 33 advisories on the official SDK/tooling layer (Python 6 high; TS 3 high; Go 4 high; Ruby 3 high/3 medium; FastMCP 1 critical/4 high/3 medium; Inspector 1 critical/1 high), of which prior round-ups itemise only CVE-2026-25536.
   - Figures: “Python: CVE-2025-53365/53366 DoS (2025-07-04, 8.7); CVE-2025-66416 DNS rebinding (2025-12-02, 7.6) ...” · “TS: CVE-2025-66414 (7.6), CVE-2026-0621 ReDoS (8.7), CVE-2026-25536 (7.1, 2026-02-04); Go: 7.0/8.2/7.1/7.6-8.1 ...”
   - Sample/method: GHSA REST API ecosystem/affects queries (URLs: ...
   - Limitations: Reviewed advisories only; SDK-level impact depends on deployer code.

49. **Update on Exposed MCP Servers: The Threat Widens to the Cloud (+ 2025 baseline ...** — Trend Micro (Alfredo Oliveira, David Fiser); baseline ... — 2026-04-28 (baseline 2025-07-16)  
   <https://www.trendaisecurity.com/en-us/resources-insights/deep-research/update-on-exposed-mcp-servers-the-threat-widens-to-the-cloud>  
   [MEASUREMENT exposure + INCIDENT type=vuln component=aws-mcp-server cve=CVE-2026-5058, CVE-2026-5059 (9.8) + ZDI-CAN-28042 Microsoft (9.8)] Unauthenticated exposed servers 'nearly tripled' from 492 (July 2025: 1,402 tools, >90% read access, ~74% on major clouds) to 1,467; two 9.8 CVEs in an unofficial AWS MCP server via ZDI; 48% of 19,000+ repos recommend insecure secret storage.
   - Figures: “'nearly tripled to 1,467'; '1,227 Legacy Server-Sent Events (SSE) servers'; 'execute_sql' on 70 hosts” · “'over 19,000 MCP server source codes ... nearly half (48%) recommend storing secrets in insecure .env files or plaintext JSON'”
   - Sample/method: Internet scan (engine/date unstated) + static review.
   - Limitations: Exposure, not incidents; method unspecified.

50. **Securing AI agents as AI tools move from reading to acting (Copilot Studio finance-agent ...** — Microsoft Defender Experts IR (with Microsoft Threat Intelligence ... — 2026-06-30  
   <https://www.microsoft.com/en-us/security/blog/2026/06/30/securing-ai-agents-ai-tools-move-from-reading-acting/>  
   [INCIDENT type=abuse (anonymised IR narrative) date=2026 component=Copilot Studio finance agent consuming poisoned MCP tool metadata discoverer=Microsoft IR cve=none] Four-phase chain (poisoned metadata -> silent re-trust -> invocation -> exfiltration of 'the last thirty unpaid invoices'); techniques 'observed in 2026 against a growing range of enterprise agents'; no victim disclosed.
   - Figures: “'reflects techniques first disclosed by Invariant Labs in April 2025 and observed in 2026'; 'not disclosing details of any specific affected organization'”
   - Sample/method: IR narrative; no counts.
   - Limitations: Composite/illustrative; curl 403.

51. **One Fake Bug Report Hijacked a $250B Company's AI Agent (Agentjacking via Sentry MCP)** — Tenet Security Threat Labs (Ron Bobrov, Barak Sternberg, Nevo Poran) — 2026-06-17  
   <https://tenetsecurity.ai/blog/agentjacking-coding-agents-with-fake-sentry-errors/>  
   [INCIDENT type=vuln/abuse (validated on real targets) date=2026-06-03 component=Sentry MCP integration in Claude Code, Cursor, Codex discoverer=Tenet cve=none; Sentry declined root fix] Public Sentry DSNs let anyone inject error events whose 'Resolution' text agents execute; 2,388 exposed orgs, 85% exploitation success; presented at DEF CON ('GhostJacking').
   - Figures: “'2,388 organizations found exposed with valid injectable DSNs'; '71 rank in the Tranco top-1M'; '100+ AI coding acted on the injected errors .. ...”
   - Sample/method: Passive recon + validation waves on ~167 orgs; 85% denominator unstated.
   - Limitations: Marketing framing; validation on real targets.

52. **Someone Is Scanning for Your MCP Servers and AI Assistant Credentials** — SANS ISC (Manuel Humberto Santander Pelaez) — 2026-07-13  
   <https://isc.sans.edu/diary/Someone+Is+Scanning+for+Your+MCP+Servers+and+AI+Assistant+Credentials/33150>  
   [INCIDENT type=abuse (in-the-wild recon) date=2026-06/07 component=MCP endpoints and client config paths discoverer=SANS ISC cve=none] Only in-the-wild telemetry of attackers hunting MCP: valid JSON-RPC initialize handshakes from 49 IPs plus probes for /.claude/mcp.json, /.cursor/mcp.json, /.vscode/mcp.json, /.mcp/config.json on one host.
   - Figures: “49 distinct source IPs; ~200 requests over 14 days of Apache/ModSecurity logs”
   - Sample/method: One small web server, 14 days.
   - Limitations: n=1; scanning, not compromise.

53. **NPM Malware Alert: @lanyer640/mcp-runcommand-server with Reverse Shell** — Checkmarx Zero (Darren Meyer; researcher Bruno Dias) — 2025-10-02  
   <https://checkmarx.com/zero-post/npm-malware-alert-lanyer640-mcp-runcommand-server-with-reverse-shell/>  
   [INCIDENT type=malicious-package date=2025-10-01 component=npm @lanyer640/mcp-runcommand-server >=1.0.6 discoverer=Checkmarx Zero cve=none] Preinstall reverse shell to 45.115.38.27:2333; 'Installation is sufficient for infection'; removed by npm.
   - Figures: “reverse shell 45.115.38.27:2333; versions from 1.0.6; identified October 1, 2025”
   - Sample/method: Single-package analysis.
   - Limitations: No download counts.

54. **3 Malicious MCP servers found on PyPI** — JFrog Security Research (Guy Korolevski) — 2025-10-19  
   <https://research.jfrog.com/post/3-malicious-mcps-pypi-reverse-shell/>  
   [INCIDENT type=malicious-package date=2025-10-19 component=PyPI mcp-runcmd-server, mcp-runcommand-server, mcp-runcommand-server2 discoverer=JFrog cve=none (XRAY-734538/734540/734539)] Reverse shell to the same IP as the @lanyer640 npm campaign (port 4433), 'a continuation of' it.
   - Figures: “'3 malicious MCP servers with a total of 1.6K downloads'; 45.115.38.27:4433”
   - Sample/method: Vendor detection; PyPI aggregate downloads.
   - Limitations: Attribution only via shared C2.

55. **Shai Hulud Launches Second Supply-Chain Attack: Zapier, ENS, AsyncAPI, PostHog ...** — Aikido Security (Charlie Eriksen); OSSF MAL-2025-190909 ... — 2025-11-24 (Aikido updated 2026-03-17; Zapier GHSA 2026-08-14)  
   <https://www.aikido.dev/blog/shai-hulud-strikes-again-hitting-zapier-ensdomains>  
   [INCIDENT type=supply-chain-worm (MCP packages as collateral) date=2025-11-24 component=@postman/postman-mcp-server 2.4.10-2.4.12, @postman/postman-mcp-cli, @postman/mcp-ui-client, @mcp-use/* family, lite-serper-mcp-server, @zapier/mcp-integration 3.0.1-3.0.3, @browserbasehq/mcp 2.1.1 discoverer=Aikido, Amazon Inspector, Google OSS security cve=none] Shai-Hulud 2.0 (492 packages) compromised vendor-published MCP servers from Postman, Zapier and Browserbase; OSSF raw records at raw.githubusercontent.com/ossf/malicious-packages/main/osv/malicious/npm/@postman/postman-mcp-server/MAL-2025-190909.json and .../@browserbasehq/mcp/MAL-2025-191195.json ...
   - Figures: “492 packages; 132 million combined monthly downloads” · “@postman/postman-mcp-server affected 2.4.10, 2.4.11, 2.4.12 (published 2025-11-24T16:31:47Z); @browserbasehq/mcp 2.1.1 (2025-11-25T00:08:13Z) ...”
   - Sample/method: Vendor malware feed; OSSF/GHSA records.
   - Limitations: MCP packages are a small subset of a broad worm; no victim counts ...

56. **Mini Shai-Hulud Strikes Again: 317 npm Packages Compromised (npm account 'atool' ...** — SafeDep; OSSF malicious-packages (credits Amazon Inspector ... — 2026-05-19  
   <https://safedep.io/mini-shai-hulud-strikes-again-314-npm-packages-compromised/>  
   [INCIDENT type=supply-chain-worm date=2026-05-19 component=@antv/mcp-server-antv 0.2.8/0.3.8, @antv/mcp-server-chart 0.10.10/0.11.10, mcp-echarts 0.8.1/0.9.1, mcp-mermaid 0.5.1/0.6.1 discoverer=SafeDep, Socket, Amazon Inspector cve=none] One compromised npm account pushed 637 malicious versions across 317 packages in 22 minutes incl. four MCP servers; payload installs a .claude/settings.json SessionStart hook and VS Code folderOpen task and harvests AWS/K8s/GitHub/npm/SSH secrets (OSSF record: ...
   - Figures: “317 packages (637 versions); 547 packages under one account; burst 01:39-01:56 UTC; 498KB obfuscated script; exfil t.m-kosche[.]com” · “OSSF record: '631 malicious versions across 314 npm packages in an automated 22-minute burst'; persistence 'Run Copilot' workflow, daemon 'kitty-monitor'”
   - Sample/method: Registry monitoring of npm publishes.
   - Limitations: Slug says 314, body 317; campaign-wide figures.

57. **MAL-2026-5129 @redhat-cloud-services/hcc-feo-mcp (Mini Shai-Hulud via compromised trusted ...** — OpenSSF malicious-packages (credit SafeDep; GHSA-vgm5-jmvr-cjgf) — 2026-06-01  
   <https://raw.githubusercontent.com/ossf/malicious-packages/main/osv/malicious/npm/@redhat-cloud-services/hcc-feo-mcp/MAL-2026-5129.json>  
   [INCIDENT type=supply-chain-worm date=2026-06-01 component=npm @redhat-cloud-services/hcc-feo-mcp 0.3.1/0.3.2/0.3.4 (+ hcc-kessel-mcp, hcc-pf-mcp per GHSA listing) discoverer=SafeDep cve=none] Red Hat's MCP packages trojanized through a compromised GitHub Actions OIDC trusted publisher shared by 32 scope packages; payload harvests credentials, escalates via Docker socket/sudoers.d, republishes Sigstore-signed tarballs, persists via .claude/settings.json and .vscode/tasks.json.
   - Figures: “'this and 31 other packages in the @redhat-cloud-services scope'; pinned Bun v1.3.13”
   - Sample/method: SafeDep analysis in OSV.
   - Limitations: No victim data.

58. **MAL-2026-11829 @servicetitan/anvil2-mcp (Shai-Hulud: Here We Go Again / ChainDrop ...** — OpenSSF (credits Aikido, Amazon Inspector, SafeDep, Socket) ... — 2026-08-04  
   <https://raw.githubusercontent.com/ossf/malicious-packages/main/osv/malicious/npm/@servicetitan/anvil2-mcp/MAL-2026-11829.json>  
   [INCIDENT type=supply-chain-worm date=2026-08-04 component=npm @servicetitan/anvil2-mcp 0.0.9-0.0.15 discoverer=Aikido/Amazon/SafeDep/Socket cve=none] Vendor MCP package trojanized by the keyv@6.0.0-origin worm (preinstall downloads Bun, runs ~728 KB stealer exfiltrating to GitHub and DNS; persistence via Claude Code SessionStart hook per Datadog); Datadog and THN name no MCP packages themselves.
   - Figures: “7 versions 0.0.9-0.0.15; '400+ packages' campaign-wide” · “Datadog: keyv@6.0.0 published 09:35:00.763 UTC; THN: SafeDep 1,684 versions/420 names, Aikido 868 packages/1,381 versions ...”
   - Sample/method: Aggregated vendor detections.
   - Limitations: Collateral of a maintainer-token worm; vendor counts inconsistent.

59. **MAL-2026-1642: Malicious code in @upstashed/context7-mcp (npm)** — OpenSSF (credits Amazon Inspector, ReversingLabs RLMA-2026-01073) — 2026-03-18  
   <https://raw.githubusercontent.com/ossf/malicious-packages/main/osv/malicious/npm/@upstashed/context7-mcp/MAL-2026-1642.json>  
   [INCIDENT type=malicious-package (scope-squat inferred) date=2026-03-18 component=npm @upstashed/context7-mcp 1.0.2 discoverer=Amazon Inspector, ReversingLabs cve=none] Scope one letter off the real @upstash/context7-mcp; record gives no payload detail and does not use the word 'typosquat'.
   - Figures: “affected ['1.0.2']”
   - Sample/method: Automated detection.
   - Limitations: Impersonation inferred.

60. **MAL-2026-12314: Malicious code in @copilot-mcp/apex (npm)** — OpenSSF (credit Amazon Inspector) — 2026-08-05  
   <https://raw.githubusercontent.com/ossf/malicious-packages/main/osv/malicious/npm/@copilot-mcp/apex/MAL-2026-12314.json>  
   [INCIDENT type=malicious-package date=2026-08-05 component=npm @copilot-mcp/apex (13 versions 1.0.0-1.0.22) discoverer=Amazon Inspector cve=none] 'Hollow lure' impersonating the @copilot-mcp scope: postinstall shows a macOS admin dialog via osascript and pipes https://update.apex-arena-router.com/loader.sh into zsh, or fetches an unsigned binary from github.com/Apex-Foundation/copilot.
   - Figures: “13 versions: 1.0.0-1.0.8, 1.0.16, 1.0.17, 1.0.21, 1.0.22; '~150 export subpaths', no src/”
   - Sample/method: Amazon Inspector analysis.
   - Limitations: No download/victim data.

61. **MAL-2025-15093: Malicious code in auth0-mcp-server (npm) (+ GHSA-hfw5-55r9-cx88 ...** — OpenSSF (credit Amazon Inspector); GitHub Advisory Database ... — 2025-08-14 (GHSA 2026-09-02)  
   <https://raw.githubusercontent.com/ossf/malicious-packages/main/osv/malicious/npm/auth0-mcp-server/MAL-2025-15093.json>  
   [INCIDENT type=malicious-package (name collision with Auth0's @auth0/auth0-mcp-server, inferred) date=2025-08-14 component=npm auth0-mcp-server (all versions) discoverer=Amazon Inspector cve=none] Earliest OSSF record of a malicious MCP-named npm package, six weeks before postmark-mcp; GHSA published only 2026-09-02 (reported by OpenSSF, CWE-506).
   - Figures: “OSSF published 2025-08-14T18:52:04Z; SEMVER introduced '0'; GHSA 'All versions (> 0)'”
   - Sample/method: Automated detection.
   - Limitations: No payload description; impersonation not stated.

62. **MAL-2026-5955: Malicious code in @mastra/mcp 1.10.1 (GHSA-wfr8-6x4q-hpr3)** — OpenSSF (sources ghsa-malware, amazon-inspector IN-MAL-2026-008304) — 2026-06-17  
   <https://raw.githubusercontent.com/ossf/malicious-packages/main/osv/malicious/npm/@mastra/mcp/MAL-2026-5955.json>  
   [INCIDENT type=malicious-package/compromise (cause undocumented) date=2026-06-17 component=npm @mastra/mcp 1.10.1 (+ @mastra/mcp-docs-server MAL-2026-5956, @mastra/mcp-registry-registry MAL-2026-6027) discoverer=Amazon Inspector cve=none] Popular agent framework's MCP package flagged 'malicious code or consuming dependency that contains malicious code'; account compromise vs poisoned dependency vs false positive not stated.
   - Figures: “affected ['1.10.1']”
   - Sample/method: Automated detection.
   - Limitations: No root cause; siblings not read.

63. **Malicious code in mcp-server-git (npm) - unscoped name-squat of Anthropic reference ...** — GitHub Advisory Database (amazon-inspector; OSSF MAL-2026-5478) ... — 2026-07-27 (repeat batch 2026-08-20)  
   <https://github.com/advisories/GHSA-hmxw-q2gh-p268>  
   [INCIDENT type=registry-abuse/name-squat date=2026-07-27 component=npm mcp-server-git 0.0.1/0.0.2 + same-day mcp-server-github/-fetch/-figma/-notion/-postgres/-redis/-sentry/-sequential-thinking/-supabase/-everything discoverer=Amazon Inspector cve=none] Unscoped npm names matching official PyPI reference servers claimed to intercept 'npx mcp-server-git' by AI agents; postinstall beacons hostname/cwd/platform to a workers.dev endpoint; classified an attack 'regardless of the author's self-described canary research framing' ...
   - Figures: “endpoint https://npx-canary-log.vulnerable-live.workers.dev/log; GHSA-prf3: 'Affected Versions >= 0', 'consider fully compromised'”
   - Sample/method: Amazon Inspector static analysis; GitHub boilerplate.
   - Limitations: Beacon-only payload; relationship between the two advisories unclear.

64. **SANDWORM_MODE: Shai-Hulud-Style npm Worm Hijacks CI Workflows and Poisons AI Toolchains** — Socket Research Team — 2026-02-20  
   <https://socket.dev/blog/sandworm-mode-npm-worm-ai-toolchain-poisoning>  
   [INCIDENT type=malicious-package (rogue MCP server injection) date=2026-02-20 component=19+ npm packages (aliases official334, javaorg) with McpInject targeting Claude Code, Claude Desktop, Cursor, Continue, Windsurf configs discoverer=Socket cve=none] First documented malware that installs its own MCP server into agent configs, with tool prompt injection to read SSH keys, AWS credentials, .npmrc, .env; 'not yet observed confirmed public propagation'.
   - Figures: “'at least 19 malicious npm packages'; targets ~/.claude/settings.json, ~/.cursor/mcp.json, ~/.continue/config.json, ~/.windsurf/mcp.json ...”
   - Sample/method: Socket malware analysis.
   - Limitations: No victims; '4 sleeper packages' claim elsewhere not on page.

65. **Mini Shai-Hulud, Miasma, and Hades Worms Target Bioinformatics and MCP Developers via ...** — Socket Threat Research (Kirill Boychenko); GitGuardian ... — 2026-06-08  
   <https://socket.dev/blog/mini-shai-hulud-miasma-and-hades-worms-target-bioinformatics-and-mcp-developers-via-malicious>  
   [INCIDENT type=malicious-package date=2026-06-08 component=PyPI langchain-core-mcp 1.4.2/1.4.3, openai-mcp 2.41.1/2.41.2, instructor-mcp 1.15.2/1.15.3, tiktoken-mcp 0.13.1/0.13.2, ray-mcp-server 0.2.1 discoverer=Socket cve=none] MCP-themed PyPI names in the Hades wave (.pth hooks, trojanized .abi3.so, Bun-run stealer with a fake prompt-injection header); the most plausible primary behind the 2026-07-21 GHSA batch of 65 pip malware advisories; GitGuardian confirms June waves 'targeting ... Model Context Protocol (MCP) libraries' without names.
   - Figures: “'23 newly identified PyPI package-version artifacts' beyond '37 malicious PyPI wheels'; GitGuardian: 'roughly 19 packages' then 'at least 29' ...”
   - Sample/method: Socket PyPI triage.
   - Limitations: Typosquats, not compromised real servers; GHSA-batch link inferred.

66. **SmartLoader Clones Oura Ring MCP to Deploy Supply Chain Attack (+ THN 2026-02-17)** — Straiker STAR Labs (Dan Regalado); THN ... — 2026-02-05  
   <https://www.straiker.ai/blog/smartloader-clones-oura-ring-mcp-to-deploy-supply-chain-attack>  
   [INCIDENT type=malicious-package + registry-abuse date=2026-02-05 component=trojanized Oura MCP server clone (github.com/SiddhiBagul/MCP-oura) listed on MCP Market discoverer=Straiker cve=none] Months-long fake-account operation (5+ accounts, primary YuzeHao2023) delivering SmartLoader -> StealC; submitted to 'legitimate MCP registries like MCP Market' and per THN 'still listed' at mcpmarket.com/server/oura-9.
   - Figures: “'Created at least 5 fake GitHub accounts' (THN: YuzeHao2023, punkpeye, dvlan26, halamji, yzhao112); 'Possible links to China' ...”
   - Sample/method: Vendor analysis; no telemetry.
   - Limitations: No victim/download counts; 'punkpeye' is also a real maintainer handle.

67. **FakeGit campaign uses 7,600 GitHub repos to push SmartLoader malware** — BleepingComputer (Bill Toulas), reporting Island — 2026-07-21  
   <https://www.bleepingcomputer.com/news/security/fakegit-campaign-uses-7-600-github-repos-to-push-smartloader-malware/>  
   [INCIDENT type=registry-abuse/malicious-repos date=2026-07-21 component=~800 GitHub repos posing as AI skills or MCP servers; 600+ listings in LobeHub, Glama, MCP.so, MCP Market discoverer=Island cve=none] Largest documented registry-abuse footprint (SmartLoader/StealC); framed as continuation of Trend Micro's 'Water Kurita', not explicitly linked to Oura.
   - Figures: “7,600 repos; 14,084,688 download events across 335 release assets; 'over 800 repositories posing as AI skills or MCP servers' ...” · “'Claude Code cloned malicious repositories ... detected suspicious indicators and stopped before execution'”
   - Sample/method: Island enumeration; method unstated.
   - Limitations: Secondary; counters may be bot-inflated.

68. **Deadbugz: Currently Active MCP Supply-Chain Campaign** — Pillar Security (Ariel Fogel) — 2026-08-12 (campaign 2026-08-10)  
   <https://www.pillar.security/blog/deadbugz-currently-active-mcp-supply-chain-campaign>  
   [INCIDENT type=abuse/supply-chain (in the wild, no victims) date=2026-08-10 component=GitHub PRs adding remote MCP server 'productivity-suite' (onrender.com) or hidden local scripts to unrelated projects' MCP configs discoverer=Pillar cve=none] Live rug-pull campaign: 23 PRs in 74 minutes by account zellkernel; server benign until the third tool call, then rewrites tools/list and prompts/get to collect SSH keys, AWS credentials, shell history, kubeconfig; none merged.
   - Figures: “'23 PRs ... 74-minute period, from 9:52 PM to 11:07 PM UTC on August 10, 2026'; '19 were closed and four remained open' ...”
   - Sample/method: Review of public PRs and the live endpoint.
   - Limitations: No confirmed compromise; page 'will be updated'.

69. **From Component Manipulation to System Compromise: Understanding and Detecting Malicious ...** — arXiv (Yiheng Huang, Zhijia Zhao, Bihuan Chen, Susheng Wu et al. ... — 2026-04-02  
   <https://arxiv.org/abs/2604.01905>  
   [INCIDENT type=malicious-package (2 in-the-wild finds) + MEASUREMENT] Detector run over 1,672 marketplace servers confirmed two malicious servers - mcp-pdftool-plus (PyPI, base64 reverse shell, removed, disclosed via OSV) and mcp-server-todo (npm, Glama-listed, prompt injection exfiltrating wallet.dat) ...
   - Figures: “114-server PoC dataset; Connor F1 94.6%; Table 9 (N=1,672): Connor 9 alerts/2 TP; MCP-Scan 212/0; AI-Infra-Guard 165/2; MCPScan 577/2”
   - Sample/method: Detector evaluation + marketplace run with manual verification.
   - Limitations: Only two finds; sample not fully described.

70. **GitHub MCP Exploited: Accessing private repositories via MCP** — Invariant Labs (Marco Milanta, Luca Beurer-Kellner) — 2025-05-26  
   <https://invariantlabs.ai/blog/mcp-github-vulnerability>  
   [POC not-incident date=2025-05-26 component=official GitHub MCP server + Claude 4 Opus discoverer=Invariant Labs cve=none] The most-cited MCP 'incident' (508 HN points; ATLAS AML.CS0054 exercise; Docker 'GitHub data heist') is a demonstration on demo repos with a test account: a malicious public issue makes the agent leak private-repo data into a public PR.
   - Figures: “GitHub MCP server 14,000 stars; leaked 'Jupiter Star, their plan to relocate to South America, and even their salary' (demo data)”
   - Sample/method: Single demo (ukend0464/pacman).
   - Limitations: Demo; vendor guardrail marketing; no CVE.

71. **Supabase MCP can leak your entire SQL database (+ Supabase 'Defense in Depth for MCP ...** — General Analysis (Rez Havaei, Rex Liu, Maximilian Li) ... — 2025-07-08  
   <https://generalanalysis.com/blog/supabase-mcp-blog>  
   [POC not-incident date=2025-07-08 component=Supabase MCP (service_role, RLS bypass) + Cursor discoverer=General Analysis cve=none] Demo on a fresh project with dummy data: injected support ticket makes the agent read integration_tokens and write them back into the ticket; Supabase's response adds read-only/project-scoped modes and states 'There has been no reported incident of any Supabase customer suffering a data leak via MCP.'
   - Figures: “Supabase: 'These approaches reduced risk but did not eliminate it'”
   - Sample/method: Single demo.
   - Limitations: Often misfiled as a breach.

72. **Cato CTRL: PoC Attack Targeting Atlassian's MCP ('Living Off AI') (Wayback ...** — Cato Networks / Cato CTRL (Guy Waizel ... — 2025-06-19  
   <https://www.catonetworks.com/blog/cato-ctrl-poc-attack-targeting-atlassians-mcp/>  
   [POC not-incident date=2025-06-19 component=Atlassian MCP + Jira Service Management discoverer=Cato CTRL cve=none] External ticket with injected instructions executes with an internal user's permissions when an MCP-driven AI action processes it; ATLAS AML.CS0039 (exercise).
   - Figures: “Infosecurity: 'The threat actor never accessed the Atlassian MCP directly. Instead, the support engineer acted as a proxy'”
   - Sample/method: PoC.
   - Limitations: Live page Incapsula-blocked; content from Wayback 2026-03-12.

73. **AgentFlayer: When a Jira Ticket Can Steal Your Secrets** — Zenity Labs (Marina Simakov) — 2025-08-01  
   <https://labs.zenity.io/post/when-a-jira-ticket-can-steal-your-secrets>  
   [POC not-incident date=2025-08-01 component=Jira MCP in Cursor auto-run discoverer=Zenity cve=none] Zendesk-synced ticket exfiltrates repo secrets and dummy ~/.aws/credentials; Cursor: 'This is a known issue. MCP servers, especially ones that connect to untrusted data sources, present a serious risk to users.'
   - Sample/method: Single PoC.
   - Limitations: Black Hat USA 2025 attribution not on page.

74. **Mitigating Taint-Style Vulnerabilities in MCP Servers via Security-Aware Tool Descriptions** — arXiv (Yang Shi, Jiaheng Fu, Yihe Huang, Ruixiang Wu et al.) — 2026-07-08  
   <https://arxiv.org/abs/2607.07461>  
   [MEASUREMENT vuln-dataset] Only academic MCP-server vulnerability census with response metrics: NVD keyword 'MCP' (Feb 2026, 116 -> 35 server-related) plus advisories/issues of 100 selected repos -> 53 vulnerabilities across 45 servers; average fix 37.3 days, unpatched exposure 92.3 days.
   - Figures: “'116 CVE entries, from which two authors identify 35'; '25 security advisories and 147 issues ... 18 additional'; '53 vulnerabilities across 45 MCP servers'” · “Command Injection 27 (50.94%), Path Traversal 9, Unauthorized Access 6, DNS Rebinding 4, SSRF 3, Code Injection 2, SQLi 2; taint-style 43/53 (81.13%)”
   - Sample/method: NVD keyword + 100 author-selected repos; two-author classification.
   - Limitations: Not itemised; preprint.

75. **VIPER-MCP: Detecting and Exploiting Taint-Style Vulnerabilities in MCP Servers** — arXiv (Pengyu Sun, Zifeng Kang, Qishu Jin, Enhao Huang et al.) — 2026-05-20  
   <https://arxiv.org/abs/2605.21392>  
   [MEASUREMENT 0-day discovery] Largest single-study disclosure batch: 106 exploit-confirmed 0-days across 39,884 open-source MCP server repos, 67 CVE IDs assigned, plus 63 reconstructed historical MCP-server CVEs; all IDs redacted as CVE-2026-XXXXX.
   - Figures: “'39,884 real-world open-source MCP server repositories ... 106 0-day vulnerabilities ... 67 CVE IDs assigned to date'” · “'146 candidate CVEs ... 63 MCP-server-relevant CVEs remained'; '52 Python, 71 TypeScript, and 7 JavaScript servers'”
   - Sample/method: Static+dynamic taint analysis; NVD+GHSA keyword ground truth.
   - Limitations: CVE IDs redacted; appendix list absent.

76. **A First Measurement Study on Authentication Security in Real-World Remote MCP Servers** — arXiv (Huijun Zhou, Xiaohan Zhang, Haozhe Zhang, Haoyang Zhang et al.) — 2026-05-21  
   <https://arxiv.org/abs/2605.22333>  
   [MEASUREMENT + INCIDENT type=vuln cve=CVE-2025-61510, CVE-2025-69898, CVE-2026-26384..26390] 7,973 live remote servers (FOFA/Shodan), 40.55% without authentication; 119 OAuth servers each flawed (325 flaws); nine CVEs incl. an unauthenticated server exposing 5,000+ enterprise records.
   - Figures: “28,715 candidates -> 7,973 live; No auth 3,233 (40.55%); OAuth 2,428; static token 2,312” · “'325 flaws ... dynamic client registration flaws affect 96.6%'; 'we obtained 9 CVE IDs'; CVE-2025-61510 'over 5,000 internal enterprise records'”
   - Sample/method: FOFA/Shodan -> active probing; 119 OAuth servers tested.
   - Limitations: HTTP-reachable only; preprint.

77. **Exposed by Design: A Dynamic Security Assessment of Internet-Facing MCP Servers at Scale** — arXiv (Nicolas Padilla, CobaltoSec) — 2026-07-31  
   <https://arxiv.org/abs/2608.00150>  
   [MEASUREMENT + disclosure batch] Four July 2026 runs: 640 confirmed production servers, 414 audited, 68 advisories (19 public, 49 embargoed); 91.8% lacked OAuth; public GHSAs: lectorium-corpus-mcp SQLi (GHSA-m8qh-p8m5-8c48), epwforge IMDS SSRF (GHSA-r9fx-qwmc-rvx3), frootai prompt-template injection (GHSA-5h8f-r9g8-5w5p).
   - Figures: “'640 production MCP servers and dynamically audit 414, uncovering 68 reportable vulnerabilities'; '19 ... publicly disclosed ... 49 remain under active embargo'” · “'91.8% (380 of 414) lacked OAuth'; '687 tool instances ... shell execution'; '41.6% churn'; runs Jul 15/18/21/24 (72; 3,485/140; 3,948/464; 4,110/296)”
   - Sample/method: Eleven discovery sources; 'Corvus' 34 test modules; HTTP/SSE only.
   - Limitations: Single author; 49 embargoed; cited '21,000' is a Censys estimate.

78. **A First Look at the Security Issues in the Model Context Protocol Ecosystem** — arXiv (Xiaofan Li, Xing Gao, Univ. of Delaware); reportedly DSN 2026 — 2025-10-18  
   <https://arxiv.org/abs/2510.16558>  
   [MEASUREMENT registry-abuse potential + data-leak] Only study quantifying registry hijack risk across 67,057 servers from six registries: 212 re-registrable maintainer accounts, 304 redirect-hijackable links; 9 GitHub tokens in mcp.so configs (5 valid); mcp.so never responded.
   - Figures: “Maintainer Hijacking: mcp.so 111, MCP Market 95, MCP Store 5, Pulse MCP 1 = 212 (15.37% of 1,379 invalid links); Redirection: 98/50/155/1 = 304” · “'9 GitHub tokens ... 5 tokens remain valid' (July 2025); '833 vulnerable servers and 18 with suspicious descriptions' ...”
   - Sample/method: Six-registry scrape mid-2025; GitHub API; gitleaks.
   - Limitations: Hijackability inferred; DSN acceptance unverified.

79. **Beyond the Protocol: Unveiling Attack Vectors in the Model Context Protocol (MCP) ...** — arXiv (Hao Song, Yiming Shen, Wenxuan Luo, Leixin Guo et al.) — 2025-05-31  
   <https://arxiv.org/abs/2506.02040>  
   [MEASUREMENT registry-abuse experiment] Researcher-controlled malicious servers accepted and kept for seven days by Smithery.ai, MCP.so and Glama without warnings (Glama labelled one 'safe to use'); 75% of 20 participants picked a malicious server.
   - Figures: “'uploads to all three platforms without warnings or rejections ... Glama explicitly labels our server as safe to use' ...” · “'15 participants (75.0%) choosing at least one malicious server'”
   - Sample/method: Upload experiment; user study n=20.
   - Limitations: Mid-2025 behaviour.

80. **When Agents Act on Web3: An Attack-Surface Survey of MCP, Skills ...** — arXiv (Rabimba Karanjai, Yang Lu, Nour Diallo, Wujie Xiong et al. ... — 2026-08-18  
   <https://arxiv.org/abs/2608.17275>  
   [TRACKER status=ad-hoc academic timeline] Table 1 anchors nine attack classes to 'Representative CVE / incident (verified)' and Figure 1 plots an 'Escalation of confirmed MCP/tool-calling security disclosures (Apr 2025-Apr 2026)' (Inspector, mcp-remote, git RCE, poisoning demo, postmark, ClawHavoc, Windsurf) - the only academic incident timeline found ...
   - Figures: “CVE-2025-6514 9.6; CVE-2025-49596 9.4; CVE-2025-53109 8.4 / 53110 7.3; CVE-2025-68143 8.8 / 68144 7.1; CVE-2025-54136 'MCPoison' 7.2 ...” · “postmark-mcp 'downloaded approximately 1,500 times before removal'; ClawHavoc 'malicious skills ... rise from 341 to 824 ... past 10,700 entries'”
   - Sample/method: Literature survey; secondary facts.
   - Limitations: Web3 framing; CVSS provenance unstated; skills items adjacent.

### Not used

- <https://www.koi.security/blog/postmark-mcp-npm-malicious-backdoor-email-theft> — Live URL 301-redirects to a paloaltonetworks.com product page (Koi acquired); content recovered only via the Wayback capture 20250929094654, which is listed under supporting ...
- <https://www.catonetworks.com/blog/duneslide-two-critical-rce-vulnerabilities/> — Incapsula bot-block (curl 200 but 212-byte challenge page); web.archive.org/web/2026/ capture is an empty shell; DuneSlide facts taken from NVD and The Hacker News instead.
- <https://www.blackhat.com/asia-26/briefings/schedule/> — Cloudflare 'Attention Required' block (5.4 KB); could not verify that 'Remote Server, Local Root. Welcome to MCP.' re-presents Obsidian Security's 2025 OAuth-metadata research (mapping ...
- <https://incidentdatabase.ai/> — AI Incident Database GraphQL API returned 'Forbidden - Invalid origin'; discover page is JS-rendered with no results ...
- <https://www.nsa.gov/> — NSA Cybersecurity Information Sheet CSI_MCP_SECURITY.PDF (media.defense.gov and nsa.gov paths, and Wayback) returned HTTP 403 / HTML placeholder on every route ...
- <https://www.aim.security/> — Aim Security's CurXecute (CVE-2025-54135) primary post returned 403/empty; exact path not recorded; incident verified via NVD and the Cuckoo Attack paper instead.
- <https://ieeexplore.ieee.org/document/11395848> — 'A Systematic Security Analysis of MCP' (15 servers pen-tested, 87%/34% figures per search snippet) not fetchable (HTTP 202 empty, REST 404); figures unverified and excluded.
- <https://dl.acm.org/doi/10.1145/3814959> — ACM DL pages (also 10.1145/3796519 for Hou et al.) returned 403; arXiv versions used instead, so TOSEM venue attribution is unverified.
- <https://opensourcemalware.com/npm/mcp-polymarket> — Page is JS-rendered (55 characters via curl); no verifiable content.
- <https://api.semanticscholar.org/graph/v1/paper/search> — HTTP 429 rate-limited on all four title lookups for IEEE MCP papers; no data obtained.
- <https://api.github.com/advisories?ecosystem=npm&keywords=mcp> — The GitHub REST advisories endpoint ignores the keywords parameter and returns unfiltered recent advisories; unusable for counting (web UI search used instead).

### Open questions from the sweep

- Koi Security's primary posts (postmark-mcp, PromptJacking, 'MCP Malware Wave Continues', ClawHavoc) are unreadable after the Palo Alto Networks redirect; postmark figures rest on one Wayback capture plus Snyk ...
- Cato Networks' DuneSlide primary (Incapsula-blocked, no Wayback) and Aim Security's CurXecute post (403) were never read; the MCP-delivery detail for CVE-2026-50548/50549 comes only from THN quoting Cato.
- Whether the NSA Cybersecurity Information Sheet on MCP (unreachable, 403) names any incidents or maintains a list.
- Whether the 2026-08-20 GHSA batch of reference-server names (mcp-server-git etc., 'all versions') is a re-publication of the 2026-07-27 canary packages or a new actor; whether the 2026-07-21 batch of 65 pip advisories corresponds to Socket's Hades wave.
- The identity of VIPER-MCP's 67 assigned CVE IDs (redacted in the anonymous preprint) and the 49 embargoed advisories from Padilla's audit - together ~116 MCP-server CVEs/GHSAs whose components are not yet public.
- Whether Auth0 or Amazon ever acknowledged the auth0-mcp-server / amazon-*-analytics-mcp-server npm packages as impersonations; the OSSF/GHSA records do not say.
- Whether the Black Hat Asia 2026 briefing 'Remote Server, Local Root. Welcome to MCP.' is indeed the Obsidian Security OAuth-metadata research and which three additional CVEs beyond CVE-2025-54074 it covers (schedule Cloudflare-blocked ...
- CVE-2026-12958 (second Amazon Q CVE cited in secondary coverage) is absent from Wiz's page; CVE-2026-81376 (VS Code Workspace Trust bypass, 9.6, 2026-09-08) may or may not have an MCP vector.
- Whether huntr.com's report index (Protect AI CNA, assigns many MCP-server CVEs such as GitHub Kanban CVE-2025-53818) constitutes a de-facto MCP CVE feed; site: search returned nothing.
- Whether the Agentic AI Foundation / Linux Foundation actually operates the 'community-driven vulnerability disclosure program' claimed in secondary coverage, and whether the modelcontextprotocol org's own /security/advisories pages (not enumerated after the ...
- Whether the IEEE paper 'A Systematic Security Analysis of MCP' (11395848; 15 servers pen-tested, 87%/34%) and the MSR 2026 'Large-Scale Dataset of MCP Implementations on GitHub' contain incident or CVE lists.
- Origin and date of the '1,862' vs '1,800+' Knostic exposure figure (July 2025) cited by CSA and Errico et al.; Knostic's primary was not opened.
- Whether Qianxin's 2026 mid-year vulnerability report or any Chinese vendor report documents an MCP incident not covered in English sources (surfaced, not opened).
- Whether the Adversa digest ran monthly without gaps between July 2025 and June 2026 (August 2025 slug 404) and whether AuthZed has updated its timeline after 2026-05-30 (page unchanged at fetch).
- The relationship between the ATLAS Postmark case-study date (2025-09-01) and Koi's disclosure (2025-09-25) / Snyk's first-publish date (2025-09-15) - ATLAS may be recording an estimated event onset.

### Searches run

- `arXiv export API (https) :: all:"model context protocol" max_results=400 (+start=400) :: 539 entries saved under /var/tmp/nl-mcp/arxiv/ (plain http ...`
- `arXiv export API :: all:MCP AND all:server, max_results=400 :: 254 entries`
- `arXiv export API :: all:MCP AND all:security, max_results=400 :: 264 entries; union of three queries = 661 unique papers ...`
- `local regex over 661 arXiv abstracts :: CVE-\|postmark\|mcp-remote\|Inspector\|Supabase\|GitHub ... :: only 2506.23260, 2512.03775, 2603.18063, 2605.22333 ...`
- `arXiv export API :: all:MCP AND all:CVE :: 10 hits; relevant 2605.22333, 2605.21392, 2506.23260 ...`
- `arXiv export API :: all:"model context protocol" AND all:malicious AND all:package :: 0 results`
- `arXiv export API :: all:"model context protocol" AND all:incident :: 6 hits; relevant 2603.18063, 2511.20920`
- `arXiv export API :: all:MCP AND all:registry AND all:server :: 17 hits; relevant 2609.10962, 2608.00997, 2510.16558 ...`
- `arXiv export API :: all:MCP AND all:"supply chain" :: 17 hits; relevant 2609.07360, 2604.21477, 2511.20920 ...`
- `arXiv export API :: all:"agent skills" AND all:malicious :: 42 hits, all skills-marketplace (ClawHub/SkillsMP) ...`
- `arXiv export API :: all:MCP AND all:npm; all:"MCP server" AND all:leak; all:"MCP servers" AND all:disclosure :: 3/3/4 hits; nothing new beyond 2609.10962, 2608.00150 ...`
- `arXiv export API :: ti:"Les Dissonances" :: 2504.03111 (LangChain/LlamaIndex tools, not MCP) - excluded`
- `web search :: site:arxiv.org "model context protocol" CVE vulnerabilities real-world MCP servers incidents :: 2511.20920, 2605.21392, 2607.05744, 2510.23673`
- `web search :: site:arxiv.org MCP server vulnerability dataset CVE GHSA empirical study 2026 :: 2607.07461 (NVD 'MCP' Feb 2026: 116 -> 35) ...`
- `web search :: site:dl.acm.org "model context protocol" security empirical study servers :: TOSEM versions 10.1145/3796519 and 10.1145/3814959 ...`
- `web search :: site:usenix.org "model context protocol" MCP security 2026 :: no USENIX-hosted MCP paper`
- `web search :: site:ieeexplore.ieee.org "model context protocol" security vulnerabilities MCP :: 11395848 'A Systematic Security Analysis of MCP', 11308830 ...`
- `web search :: site:ndss-symposium.org "model context protocol" OR "MCP servers" 2026 :: none; learned 2510.16558 accepted to DSN 2026`
- `web search :: site:semanticscholar.org "model context protocol" malicious MCP servers supply chain incidents :: only known arXiv papers`
- `web search :: site:openreview.net "model context protocol" MCP security attack servers :: Log-To-Leak, LiveMCPBench (benchmarks, no incident inventory)`
- `web search :: arxiv "CVE-2025-49596" OR "CVE-2025-53109"; arxiv "postmark-mcp" ... :: web search unavailable`
- `DuckDuckGo html/lite via curl :: same four queries :: blocked (anomaly page), 0 results`
- `Bing via curl :: same four queries :: degraded, generic results only`
- `Semantic Scholar Graph API :: title lookups for four IEEE MCP papers :: HTTP 429 on all`
- `usenix.org via curl :: grep 'Model Context Protocol\|MCP' over USENIX Security 2026 accepted/technical-sessions pages :: 0 accepted papers; one invited talk (Sangyoon Yu ...`
- `sp2026.ieee-security.org via curl :: grep IEEE S&P 2026 accepted papers :: 'Parasites in the Toolchain' (SJTU) accepted`
- `ndss-symposium.org / sigsac.org via curl :: grep NDSS 2026 and CCS 2026 accepted papers :: no MCP titles`
- `conf.researchr.org / 2026.msrconf.org via ... :: grep ICSE/FSE/MSR/ASE 2026 :: FSE 2026 journal-first Hou et al.; MSR 2026 'A Large-Scale ...`
- `fetch :: github.com/VulcanLab/MCPThreatHive :: 15 stars, 1 commit; no public incident list`
- `web search :: MCP security incidents timeline tracker "model context protocol" vulnerabilities list :: vendor guides (Red Hat, PAN, Checkmarx); no tracker`
- `web search :: mcp-remote CVE-2025-6514 JFrog :: JFrog advisory + GHSA-6xpm-ggf7-wc3p; Docker Horror Stories`
- `web search :: postmark-mcp backdoor Koi Security :: THN/CSO/DarkReading; Koi URL redirects -> Wayback used`
- `web search :: MCP Inspector CVE-2025-49596 Oligo :: Oligo primary; surfaced vulnerablemcp.info ...`
- `web search :: Cymulate filesystem MCP server CVE-2025-53109 CVE-2025-53110 :: Cymulate EscapeRoute post`
- `web search :: Invariant Labs GitHub MCP server prompt injection private repository leak :: Invariant 2025-05-26; github-mcp-server issue #844 ...`
- `web search :: Supabase MCP leak General Analysis SQL injection prompt :: General Analysis post; Willison; Supabase defense-in-depth`
- `web search :: Figma MCP CVE-2025-53967 command injection Imperva :: Imperva primary; Endor Labs write-up; vulnerablemcp entry`
- `web search :: Smithery path traversal MCP registry vulnerability :: GitGuardian primary; SC Media`
- `web search :: Asana MCP server data exposure incident June 2025 :: Nudge, BleepingComputer, Register; ~1,000 customers`
- `web search :: Chrome DevTools MCP vulnerability prompt injection exfiltration :: GHSA-8qf9-62x2-82pp only; no prompt-injection incident`
- `web search :: Atlassian MCP server "living off AI" Cato Networks Jira :: Cato CTRL PoC; Pomerium round-up series`
- `web search :: malicious MCP server npm package Socket research 2026 :: Socket SANDWORM_MODE; @squawk/mcp in Mini Shai-Hulud ...`
- `web search :: MCP vulnerability CVE August 2026 :: AuthZed timeline, vulnerablemcp.info, The Agent Report Q3 ...`
- `web search :: MCP server security incident July 2026 :: Adversa monthly series, Digital Applied ledger ...`
- `web search :: Snyk MCP vulnerability disclosure 2026 model context protocol :: no Snyk 2026 MCP disclosure; NSA CSI PDF; GitGuardian 24,008`
- `web search :: Pillar Security "Deadbugz" malicious MCP server pull requests :: Pillar primary 2026-08-12; Adversa Sep 2026`
- `web search :: Pomerium "MCP Content Round-Up" incidents 2026 :: only Jun-Sep 2025 editions; series discontinued`
- `web search :: Oura MCP clone StealC malware fake registry February 2026 :: Straiker primary; THN/SecurityAffairs`
- `web search :: site:socket.dev malicious MCP server package :: SANDWORM_MODE; no dedicated Socket MCP-malware census`
- `web search :: Aikido malicious MCP package npm PyPI "mcp" typosquat :: nothing MCP-specific; generic Shai-Hulud coverage`
- `web search :: Trend Micro exposed MCP servers internet scan no authentication 492 1,467 :: Trend Micro figures; Bitsight scan; CVE-2025-59536 lead`
- `web search :: CVE-2025-59536 Claude Code MCP consent bypass :: Check Point Research Feb 2026`
- `web search :: Black Hat USA 2026 OR "DEF CON 34" MCP "model context protocol" talk vulnerabilities :: DEF CON 34 Agentjacking (Tenet); dev.to '40+ CVEs' post ...`
- `web search :: official MCP registry security incident malicious server removed ... :: no incident at official registry`
- `web search :: Tenet Security "Agentjacking" Sentry MCP DEF CON 34 :: Forkast/CSA/DevOps.com; 85%, 2,388 orgs`
- `web search :: site:tenet.security agentjacking Sentry MCP :: primary at tenetsecurity.ai (2026-06-17)`
- `web search :: Wiz Amazon Q Developer MCP config auto-load vulnerability June 2026 :: Wiz primary; CVE-2026-12957/12958; AWS bulletin`
- `web search :: "auth0-mcp-server" npm malicious OR compromised September 2026 :: web search unavailable; GHSA page fetched instead`
- `GitHub REST API via curl :: /advisories?ecosystem=npm\|pip&keywords=mcp :: keywords parameter ignored; unusable`
- `services.nvd.nist.gov via curl :: NVD API keywordSearch=Model Context Protocol (first attempt) :: HTTP 503 / Cloudflare challenge`
- `GitHub Advisory DB web (fetch+curl) :: github.com/advisories?query=mcp :: '783 advisories'; page 1 all Sep 4-11 2026`
- `GitHub Advisory DB web via curl :: github.com/advisories?query=mcp+type:malware and ?query=type:malware+mcp (pages 1-10) :: 240 advisories; monthly tally 2025-06:2, 07:2, 09:5, 10:3 ...`
- `Wayback via curl :: web.archive.org/web/2025*/koi.security postmark post :: snapshot 20250929094654 recovered (Idan Dardikman, 2025-09-25)`
- `Wayback via curl :: web.archive.org/web/2025*/catonetworks.com Atlassian MCP post :: CDX 26 captures; 20260312112030 has full article ...`
- `curl / fetch :: nsa.gov + media.defense.gov CSI_MCP_SECURITY.pdf (+Wayback) :: 403 on all routes; NOT opened`
- `curl + python :: outbound-link extraction from adversa.ai Jun/Jul/Aug/Sep 2026 round-ups :: recovered primaries: Censys, Register (Akamai) ...`
- `services.nvd.nist.gov REST via curl :: keywordSearch="model context protocol" resultsPerPage=200/2000 :: 78 CVEs (2025-05-12 to 2026-09-09)`
- `services.nvd.nist.gov REST via curl :: keywordSearch="mcp server" (paged) :: 329 CVEs; union 355, 351-352 with MCP in description ...`
- `services.nvd.nist.gov REST via curl :: cveId lookups CVE-2025-59536, 2026-30615, 2026-23744, 2026-0755, 2026-33032, 2025-66335 ... :: all exist (e.g. CVE-2026-33032 pub 2026-03-30 CVSS 9.8 ...`
- `services.nvd.nist.gov REST via curl :: cveId lookups CVE-2026-81376, 2025-54074, 2026-10591, 2026-26118, 2026-50548, 2026-50549 ... :: all resolve; CVSS/dates recorded`
- `GitHub REST API :: gh api /advisories?keywords=mcp&per_page=100 :: keywords not honored; unusable`
- `GitHub REST API :: gh api /advisories/{GHSA} for 10 malware advisories (@browserbasehq/mcp ... :: affected versions and references retrieved`
- `GitHub REST API via curl :: /advisories?ecosystem={npm,pip,go,rubygems}&affects={@modelcontextprotocol/sdk, mcp, fastmcp ... :: 33 advisories on official SDKs/reference servers/FastMCP ...`
- `OSV web UI via curl :: osv.dev/list?q=mcp and ?q=mcp&ecosystem=npm :: turbo-frame paginated; only 16 IDs per page; no usable total`
- `GitHub git trees API :: repos/ossf/malicious-packages/git/trees/main?recursive=1 filtered 'mcp' :: 41 npm packages with 'mcp' in name (truncated tree ...`
- `raw.githubusercontent.com via curl :: raw MAL JSON for 10+ packages from ossf/malicious-packages :: three worm waves hit MCP packages: Shai-Hulud 2.0 ...`
- `HN Algolia API via curl :: 'MCP security', 'MCP vulnerability', 'MCP server malicious', 'MCP backdoor', 'MCP CVE' ... :: nbHits 606/32/34/37/101/872; top: Invariant GitHub MCP 508 ...`
- `web search :: MCP security incidents timeline tracker "Model Context Protocol" vulnerabilities list 2026 :: CSA note 2026-05-04, NSA CSI, OWASP MCP Top 10 ...`
- `web search :: "MCP" security incident August 2026 OR September 2026 malicious MCP server npm :: Digital Applied ledger, AuthZed timeline, Stacklok ...`
- `web search :: "State of MCP Security" 2026 report incidents CVEs :: pipelab.org, practical-devsecops, the-agent-report, uvcyber`
- `web search :: "Vulnerable MCP Project" MCP vulnerabilities database tracker :: vulnerablemcp.info, ...`
- `web search :: Supabase MCP leak "General Analysis" Cursor SQL injection prompt injection integration tokens :: General Analysis; Willison; Supabase response`
- `web search :: Asana MCP server data exposure June 2025 cross-tenant bug UpGuard :: UpGuard, BleepingComputer, CSO`
- `web search :: Atlassian MCP server prompt injection Cato Networks "Living off AI" Jira Service Management :: Cato blocked; Infosecurity Magazine opened; ATLAS AML.CS0039`
- `web search :: Chrome DevTools MCP vulnerability exploit prompt injection Claude Code browser :: no discrete incident; MCPSafe issue #2047 only`
- `web search :: OX Security April 2026 MCP SDK DNS rebinding "Mother of All AI Supply Chains" 16 CVEs 200,000 ... :: OX primary; CSA note; Register 2026-04-16`
- `web search :: nginx-ui MCP CVE-2026-33032 "MCPwn" Pluto Security actively exploited :: THN 2026-04-15, Rapid7, eSentire, Dark Reading`
- `web search :: MCP registry security incident 2026 official "registry.modelcontextprotocol.io" abuse ... :: none; SafeDep 'State of MCP Registries' (2025-12-20)`
- `web search :: Notion MCP OR Zapier MCP prompt injection data exfiltration vulnerability disclosed researchers :: Notion: PromptArmor (not MCP-specific) ...`
- `web search (bleepingcomputer, theregister ... :: MCP server vulnerability OR malicious 2026 :: THN GhostSplice, THN OX, SecurityWeek Cyata ...`
- `web search :: "MCP" malicious package npm PyPI August 2026 Socket OR Snyk OR Aikido OR Koi OR ReversingLabs :: THN keyv worm; GitGuardian 'Four More Supply Chain Attacks'`
- `web search :: Datadog "ChainDrop" worm npm packages MCP 2026 :: Datadog Security Labs 2026-08-04; StepSecurity`
- `web search :: gemini-mcp-tool CVE-2026-0755 command injection SentinelOne Zero Day Initiative :: ZDI-CAN-27783, CVSS 9.8, fixed 1.1.6`
- `web search :: fake Oura MCP server malware SmartLoader GitHub repository February 2026 :: THN 2026-02-17; BleepingComputer FakeGit 2026-07-21`
- `web search :: Context7 MCP prompt injection Noma Security custom rules CVE-2026-75130 Upstash :: Noma ContextCrush; CVE published 2026-08-18`
- `web search :: "mcp-server-git" npm unscoped name claimed canary "npx" intercept AI coding agents 2026 :: MAL-2026-5478 mirrors only; no researcher write-up`
- `web search :: OpenClaw exposed MCP endpoints unauthenticated 42,000 instances January 2026 leaked API keys :: secondary only; primary scan not opened`
- `web search :: reddit MCP server security incident malicious "MCP" backdoor found 2026 :: no Reddit-native incidents; Securelist PoC ...`
- `web search :: Trend Micro exposed MCP servers internet no authentication 492 servers 1,402 tools research :: Trend Micro 2025-07-16 primary`
- `web search + AIID GraphQL (curl) + discover ... :: site:incidentdatabase.ai "Model Context Protocol" OR "MCP server" :: nothing; GraphQL Forbidden; JS-rendered`
- `web search :: Oligo Security MCP Inspector CVE-2025-49596 blog :: Oligo URL opened`
- `web search :: GitGuardian "24,008" secrets MCP configuration files public GitHub State of Secrets Sprawl 2026 :: confirmed verbatim`
- `web search :: Endor Labs Framelink Figma MCP CVE-2025-53967 command injection disclosure :: discoverer is Imperva, not Endor Labs`
- `Snyk Vulnerability DB via curl :: security.snyk.io/vuln/npm?search=mcp :: 30 SNYK-JS IDs on page 1; no total`
- `en.wikipedia.org via curl :: Model_Context_Protocol wikitext grep security/CVE/incident :: one paragraph (April 2025 tool-poisoning research) ...`
- `fetch + curl :: JFrog blog for CVE-2025-6514 :: empty response; GHSA-6xpm-ggf7-wc3p and JFrog research ...`
- `web search :: MCP 安全 漏洞 事件 模型上下文协议 恶意 服务器 2026 :: Chinese hits are translations of OX/nginx-ui/Trend/Censys ...`
- `web search :: OWASP MCP Top 10 "model context protocol" 2026 incidents :: vendor explainers; Agentmelt 2026-09-09 (no incident table)`
- `web search :: "MCP" security talk Black Hat USA 2026 briefings "model context protocol" :: Arsenal tool only; Microsoft 'The state of MCP security in ...`
- `web search :: ClawHavoc OpenClaw skills malware campaign malicious skills marketplace 2026 :: Koi redirects; Unit 42 2026-06-23 (341 skills ...`
- `web search + fetch :: Backslash Security "NeighborJack" MCP servers 0.0.0.0 research :: primary 2025-06-25 opened`
- `web search + fetch :: JFrog "malicious MCP servers" PyPI reverse shell 2026 :: primary 2025-10-19 opened`
- `web search :: MCP 脆弱性 事例 インシデント Model Context Protocol 悪意 2026 :: Japanese secondary posts; leads to Kiro CVE-2026-10591 and ...`
- `web search :: site:huntr.com MCP server vulnerability report :: no huntr report pages returned`
- `web search + fetch + NVD API :: "CVE-2026-10591" Kiro mcp.json prompt injection RCE :: Cymulate opened; NVD 2026-06-02 CVSS4 8.6`
- `web search + fetch + NVD API :: Azure MCP Server SSRF vulnerability Patch Tuesday March 2026 CVE Microsoft :: CVE-2026-26118 (8.8); Blueinfy secondary`
- `web search + fetch :: "@lanyer640/mcp-runcommand-server" malicious npm :: Checkmarx Zero 2025-10-02 opened`
- `web search :: MCP 취약점 보안 사고 악성 MCP 서버 2026 Model Context Protocol :: Korean localisations; KIPS ACK2025 abstract ...`
- `web search + fetch :: Endor Labs MCP CVEs January February 2026 "43%" command injection analysis :: Endor post gives 82/67/34%, NOT '30 CVEs in 60 days' or '43%'`
- `web search + fetch :: BlueRock "MCP Trust Registry" SSRF 36.7% servers :: BlueRock 2026-01-20 opened`
- `web search + fetch :: DEF CON 34 2026 talk MCP "model context protocol" exploit agent villages schedule :: AI Village posters (MCParasite, Malicious Context ...`
- `web search + fetch :: Trail of Bits MCP blog "session hijacking" OR "ANSI" OR "insecure credential storage" MCP ... :: 2025-04-30 post opened`
- `web search + fetch :: heise MCP Sicherheitslücke "Model Context Protocol" Schwachstelle Server 2026 :: heise 2025-08-06 secondary; no German-only incident`
- `web search :: site:kb.cert.org OR site:cisa.gov "Model Context Protocol" vulnerability note advisory :: no CERT/CC or CISA MCP advisory; surfaced CSA vulnerability-db`
- `web search + fetch :: Snyk "ToxicSkills" malicious agent skills ClawHub analysis figures :: Snyk 2026-02-05 opened (adjacent)`
- `web search :: "registry.modelcontextprotocol.io" OR "official MCP registry" spam malicious server removed ... :: only docs/FAQ and SafeDep; no takedown report`
- `web search + fetch + NVD API :: Wordfence AI Engine WordPress plugin MCP privilege escalation CVE-2025-5071 :: GHSA-gg23-wpg2-g99p and NVD opened`
- `web search + fetch :: Trend Micro SQLite MCP server SQL injection Anthropic reference archived "stored prompt ... :: Trend Micro 2025-06-24 and Register 2025-06-25 opened`
- `web search + fetch :: VirusTotal blog MCP servers "17,845" GitHub repositories Code Insight analysis :: VirusTotal 2025-06-04 opened`
- `web search + fetch :: Docker "MCP Horror Stories" series parts list GitHub MCP filesystem :: at least 6 issues; dev.to Issue 1 opened`
- `web search + NVD API + curl :: Aim Labs "CurXecute" Cursor CVE-2025-54135 MCP Slack prompt injection :: NVD confirmed; aim.security 403/empty`
- `web search :: vulnerabilidad MCP "Model Context Protocol" servidor malicioso incidente seguridad 2026 :: Spanish localisations only; arXiv 2607.05744 surfaced`
- `web search :: huggingface.co datasets MCP server vulnerabilities dataset CVE malicious MCP benchmark :: no MCP incident/CVE dataset; surfaced CVE-2025-53355`
- `web search + fetch + curl + Wayback + NVD ... :: Cato "DuneSlide" Cursor CVE-2026-50548 CVE-2026-50549 sandbox escape :: SecurityWeek and THN opened; NVD confirmed ...`
- `web search :: Unit 42 Palo Alto MCP server vulnerability research "model context protocol" disclosure 2026 :: 'MCP sampling' technique post (2025-12-05), not an incident`
- `web search + fetch + Wayback :: Koi Security Claude Desktop extensions DXT connectors vulnerability RCE prompt injection ... :: Infosecurity Magazine 2025-11-05 and LayerX 2026-02-09 ...`
- `web search :: "mcp" malicious package PyPI Socket OR ReversingLabs OR Phylum report 2026 "mcp-" typosquat ... :: GitLab (2026-06-09, names no MCP packages) and Socket ...`
- `web search + fetch :: "openai-mcp" "langchain-core-mcp" OR "tiktoken-mcp" OR "ray-mcp-server" malicious PyPI Hades ... :: Socket 2026-06-08 opened`
- `web search + curl :: opensourcemalware.com MCP server malicious package entries "mcp" :: JS-rendered page; OpenClaw GHSA-mj59-h3q9-ghfh surfaced`
- `web search + curl raw ATLAS.yaml + ... :: MITRE ATLAS case study "Model Context Protocol" MCP technique AML.T incident :: 57 (v5.6.0, deprecated) / 72 (v6) case studies ...`
- `web search :: Agentic AI Foundation Linux Foundation MCP security disclosure policy vulnerability reporting ... :: LF press release (2025-12-09); no advisory feed; not opened`
- `web search :: youtube talk "MCP" security "malicious MCP server" conference 2026 BSides OR RSAC OR "Black ... :: BH Asia 2026 'Remote Server, Local Root. Welcome to MCP.' ...`
- `web search + curl raw webhacklist :: "Remote Server, Local Root" "Welcome to MCP" Black Hat Asia 2026 briefing speakers :: irsdl/webhacklist maps talk to Obsidian 2025-09-30 post`
- `web search x2 + fetch :: Zenity "AgentFlayer" Cursor Jira MCP zero-click exfiltration Black Hat 2025 / labs.zenity.io ... :: Zenity 2025-08-01 opened`
- `web search :: 腾讯 OR 阿里 OR 奇安信 OR 360 MCP 安全 研究报告 漏洞 恶意MCP 供应链 2026 白皮书 :: Qianxin 2026 mid-year report surfaced, not opened ...`
- `web search :: Glama OR Smithery OR "mcp.so" registry removed malicious MCP server listing report scanner ... :: no takedown report; UpGuard and Checkmarx learn pages opened`
- `web search + NVD API :: "VS Code" MCP CVE 2026 workspace ".vscode/mcp.json" trust bypass remote code execution ... :: MSRC CVE-2026-81376 (9.6, 2026-09-08) + ...`
- `web search + fetch :: Kaspersky OR ESET OR Bitdefender research MCP servers malware "model context protocol" ... :: Kaspersky Securelist 2025-09-15 = GERT PoC, no telemetry`
- `GitHub API + raw.githubusercontent.com :: gh api repos/ModelContextProtocol-Security/vulnerability-db (+README, tree, commits ... :: 1 advisory, 8 commits, last content 2025-07-16`
- `Bash curl :: techcommunity.microsoft.com state-of-mcp-security-in-2026 :: 2026-06-26; zero CVE/incident names`
- `Bash curl :: Wayback web.archive.org/web/2026/ koi.ai promptjacking; catonetworks.com DuneSlide :: Koi JS shell; Cato no capture`
- `web search :: "Remote Server, Local Root" MCP Black Hat Asia 2026 Obsidian :: web search unavailable ...`
- `curl :: adversa.ai slug probes mcp-security-digest-june-2025 (200), august-2025 (404) ... :: series cadence established`
- `curl :: Wayback CDX for upguard.com Asana article :: captures 20250619002302, 20250620181529 ...`
- `python3 regex :: CVE-20xx-nnnn over arXiv HTML full texts of 2605.21392, 2605.22333, 2603.18063, 2601.17548 ... :: 2605.21392 zero concrete IDs (redacted); 2605.22333 four IDs ...`

## Scanning and review tools

**Verdict:** exists · 25 supporting sources · 19 not used · 102 searches

### Supporting sources

1. **How Glama indexes the MCP ecosystem (methodology)** — Glama — undated (no date metadata on page; fetched 2026-09-11)  
   <https://glama.ai/mcp/methodology>  
   The only operational registry-side pipeline found that claims to build every listed open-source server, run it in an isolated Firecracker microVM, and observe the process at syscall and network layers against the tool schemas (including readOnlyHint/destructiveHint/idempotentHint/openWorldHint) stored as 'the authoritative description of the server's declared capabilities', classing findings Malicious or Risky and scoring descriptions with a six-dimension TDQS.
   - Figures: “'In the twelve months preceding this writing, Glama has performed over one million such scans.'” · “'stored as the authoritative description of the server's declared capabilities'” · “'During sandbox execution, the running process is observed at the syscall and network layers.'” · “'Access to credential paths not required by the declared capability set (SSH keys, cloud credential directories, browser cookie stores)'” · “'Outbound network traffic to hosts not referenced by the server's manifest or source code'” · “'Filesystem writes outside the declared working directory'” · “'Representative examples - non-exhaustive, and deliberately not a full disclosure of the ruleset:'” · “'TDQS evaluates every tool across six dimensions, each on a 1-5 scale'; 'Behavioral Transparency - does the description accurately describe side effects, idempotency, and destructiveness?'”
   - Sample/method: Self-reported: 'over one million such scans' in twelve months; no server count, no findings statistics; ruleset explicitly undisclosed.
   - Limitations: Undated vendor page; closed pipeline with no divergence rates or false-positive data; 'declared working directory' and 'manifest' are not MCP-spec terms so the comparison basis is unclear; only Glama-listed servers; no independent evaluation found.

2. **From Component Manipulation to System Compromise: Understanding and Detecting Malicious MCP Servers (Connor)** — arXiv cs.CR/cs.SE; Fudan University (Yiheng Huang, Zhijia Zhao, Bihuan Chen, Susheng Wu, Zhuotong Zhou, Yiheng Cao, Xin Hu, Xin Peng); LaTeX header says Journal: TOSEM — 2026-04-02 (v1); 2026-05-19 (v2); repo last pushed 2026-07-20  
   <https://arxiv.org/abs/2604.01905>  
   The only public-code runtime declared-vs-observed detector with a quantitative evaluation: Pre-Execution stage (Config Analyzer, Intent Inspector deriving function intent from each tool's description and argument schema) and In-Execution stage (Intent-Aligned Query Generator, Execution Tracer, Code Semantic Generator, Behavior Deviation Judger) that flags deviation between declared intent and observed execution; code at github.com/yiheng98/Connor (Apache-2.0 with research-only notice).
   - Figures: “first component-centric PoC dataset of 114 malicious MCP servers” · “Connor achieves an F1-score of 94.6%, outperforming baselines by 8.9% to 59.6%” · “Table 7: MCP-Scan (invariantlabs-ai) P 60.5% R 58.2% F1 59.3%; AI-Infra-Guard (Tencent) P 81.8% R 91.0% F1 86.2%; MCPScan (antgroup) P 75.0% R 69.4% F1 72.1%; Connor P 98.4% R 91.1% F1 94.6%” · “real-world detection of 1,672 MCP servers from marketplaces, Connor successfully identifies two malicious MCP servers” · “repo: created 2026-03-26, pushed 2026-07-20, 3 stars, Python, LICENSE.md present (Apache-2.0)”
   - Sample/method: Author-built PoC dataset of 114 malicious servers; effectiveness vs three baseline scanners; real-world run over 1,672 marketplace servers with manual verification of flagged servers.
   - Limitations: Author-constructed dataset risks overfitting to its own taxonomy; only 2 real-world detections; baselines are 2025 versions; compares to description-derived intent, not to MCP annotations; 3 stars and a single post-publication push, so 'maintained' is marginal; TOSEM acceptance stated only in the LaTeX header.

3. **MCP-SandboxScan: WASM-based Secure Execution and Runtime Analysis for MCP Tools (SandScope)** — arXiv cs.CR; University of Glasgow (Zhuoran Tan, Jeremy Singer, Yutian Tang, Christos Anagnostopoulos) and Aarhus University (Run Hao) — 2026-01-03 (v1); 2026-06-22 (v2)  
   <https://arxiv.org/abs/2601.01241>  
   Academic prototype that executes tools under WASI or drives unmodified stdio servers, records source-to-sink witnesses, recovers declared capabilities from tools/list metadata via a semantic classifier, and cross-tabulates declared egress risk against observed egress (Table 8) - the clearest published declared-vs-observed runtime table in the sweep; code only at anonymous.4open.science/r/MCP-SandboxScan-FFFB.
   - Figures: “100-repository MCP corpus; shallow dynamic scans for 35 repositories; recovers metadata for 1,127 tools across 71 repositories, including 886 tools with security-sensitive declared capabilities” · “schema-guided exploration pass over the 35 dynamically scanned repositories re-executes 33 and observes source-to-sink witnesses in 12” · “Table 8: Declared egress risk and observed egress 5 (Confirmed by runtime evidence); Declared egress risk only 14 (Declared capability was not exercised by this run); Observed egress only 4 (Potential metadata understatement or classifier miss); Neither declared nor observed 10” · “Overall: Precision = 1.000, Recall = 0.889, F1 = 0.941 (controlled runtime evaluation, 30 cases)”
   - Sample/method: 100 GitHub MCP repositories; dynamic scans on 35; controlled 30-case benchmark for P/R/F1; declared capabilities inferred from tools/list metadata by a classifier.
   - Limitations: Preprint; dynamic coverage 35 of 100 repos and 33 runs in the cross-tab; observed-only cases may be classifier misses; no persistent public repo, so not a maintained tool.

4. **ToolGuardian: Declarative Security for AI Agent-Tool Interactions** — arXiv; Arun Ravindran (UNC Charlotte) and Saurabh Deochake (SentinelOne) — 2026-07-23  
   <https://arxiv.org/abs/2607.21835>  
   Pre-admission vetting plus task-aware runtime authorization with an Answer Set Programming policy layer over facts such as capability(T, network_access), observed_http_post(T, Endpoint) and effect_mismatch(T, undeclared_network_access), with evidence from descriptions, syscall traces, mock execution and source analysis; no code released.
   - Figures: “16 MCP-style tools (8 benign, 8 malicious variants derived from real open-source tools) and 20 runtime scenarios (12 atomic, 8 composite)” · “For vetting, ASP reaches deny-class F1 of 0.86 and 88% accuracy using description, syscall, and observed-effect evidence” · “Table IX runtime accuracy: ASP 20/20 (12/12 atomic, 8/8 composite); Heuristic 20/20; LLM 20/20”
   - Sample/method: Author-built 16-tool set and 20 curated scenarios; three policy realizations (ASP, heuristic, LLM) compared.
   - Limitations: Very small evaluation; no artefact; runtime scores saturated across all realizations; preprint.

5. **Your MCP Server Says It Is Read-Only. Who Checked? (Airlock)** — dev.to (Himanshu Kumar, individual; WeMakeDevs x TrueFoundry Agent Harness Hackathon project) — 2026-08-30  
   <https://dev.to/himanshu_748/your-mcp-server-says-it-is-read-only-who-checked-2mjk>  
   Hobby prototype (MIT) that inventories declared tools/annotations, exercises them under a capped budget, compares declaration with observation (e.g. filesystem write behind readOnlyHint:true, undeclared egress, canary exfiltration), records untestable checks as not_tested, and emits a per-case enforcing proxy connector.
   - Figures: “'target dishonest fixture, controlled_fixture mode probes 24 result 7 findings of 36 checks, all five planted behaviours'” · “'The honest fixture produces zero findings across the same 36 checks.'” · “'Airlock audited a deployed ContextFirewall target over HTTPS: 6 tools 30 probes 0 tools declaring any annotation'” · “stdio inventory: 'server-filesystem 14 server-everything 13 mcp-server-git 12 server-memory 9 server-sequential-thinking 1'” · “'Under transcript_only, MCP traffic cannot reveal server-side filesystem or network activity. Airlock records those questions as untested rather than clean.'”
   - Sample/method: Two author-built six-tool fixtures (one honest, one with five planted behaviours), one external HTTPS server, five public stdio servers inventoried only.
   - Limitations: Single-author hackathon prototype evaluated only on its own fixtures; on external servers filesystem/network checks are not_tested; code not inspected in this sweep; no independent evaluation; maintenance unknown.

6. **Declared vs. Observed: Measuring the Binding Gap in MCP Tool Declarations (plus cited tool MCP Evidence Validator)** — Zenodo preprint; Gautam Bharti (independent), Mayur Agnihotri (StraightArc Technologies); tool at github.com/narko4u/mcp-evidence-validator — 2026-09-07 (paper); validator repo created 2026-08-14, pushed 2026-08-18  
   <https://doi.org/10.5281/zenodo.22649164>  
   Registry-crawl measurement of declaration staleness (annotation still bound to an unmutated schema hash) across the official MCP registry, explicitly not runtime behaviour ('No runtime behaviour is observed and no action is ever witnessed executing'); the cited MCP Evidence Validator (Apache-2.0, 0 stars, v0.2) on re-inspection only diffs a user-supplied declared JSON against a user-supplied observed-records JSON (invocation records, argument shapes, contract hashes) - 'MCP client integration (intercept tool-call records via a lightweight proxy)' is an unchecked roadmap item.
   - Figures: “35 crawls of the public Model Context Protocol registry between June and August 2026, covering 44,172 tools on 2,043 servers” · “83.8% of tools declare at least one canonical effect annotation, and 59.3% hold a declaration still bound to an unmutated contract; difference 24.5 percentage points; stable from 21.6 to 24.7 points across every corroboration and observation threshold tested” · “Over the longest uninterrupted 21-day window, 18.3% of the declaring and judgeable tools in that window saw a confirmed contract mutation” · “783 confirmed declaration changes; 86.0% of first declarations land permissive (83.4%-94.0% under omission of any single publisher)” · “stale 10,751; unobserved 53; undeclared 7,171; 10,804 of 37,001 (29.2%) stale or unobserved” · “validator README: 'Observes reality - the tool invocations, argument shapes, and contract hashes seen at runtime.'; roadmap '[ ] MCP client integration (intercept tool-call records via a lightweight proxy)'”
   - Sample/method: 35 crawls of the official MCP registry (June-August 2026), 44,172 tools / 2,043 servers; K_MIN=3 observations to judge; single crawler.
   - Limitations: Unreviewed independent preprint with a linked tool; measures staleness of declarations, not their truth or actual privilege; official registry only; the validator has no capture mechanism and 0 stars.

7. **Rethinking MCP Security: A Large-Scale Study of Runtime MCP Servers and Security Scanner Reliability** — arXiv cs.CR; Fudan University / Shanghai Innovation Institute (Pei Chen, Baichao An, Mengying Wu, Binwang Wan, Geng Hong, Jinsong Chen, Xudong Pan, Jiarun Dai, Min Yang) — 2026-07-13 (v1)  
   <https://arxiv.org/abs/2607.11086>  
   The only independent multi-scanner reliability study: eight scanners (Agent-Scan/Snyk, A.I.G static+dynamic/Tencent, MCP-Scanner/Cisco, MCPScan/Ant Group, MCPSafetyScanner, mcp-gateway/Lasso, nova-proximity/Nova Hunting, mcp-armor/Aira) run over the MCPZoo corpus with manual precision validation and pairwise agreement; public query interface at security.fudan.edu.cn/zoo/risk-monitor.
   - Figures: “MCPZoo contains 64,611 unique MCP servers (113,927 in total), with more than 37,288 supporting dynamic analysis” · “96.89% of the 37,288 interactable MCP servers are reported as risky by at least one scanner” · “overall average precision is 45.53%, with substantial variation across scanners (10.40%-96.88%)” · “the average pairwise Jaccard similarity between scanner-reported server sets is only 15.66%” · “Even the highest overlap, between A.I.G (dynamic) and MCPScan, reaches just 47.80%” · “CVE-based ground-truth dataset constructed from 10 real-world vulnerabilities”
   - Sample/method: Eight scanners in default configuration on 37,288 interactable servers; precision from manual review of sampled alerts (kappa=0.87); Jaccard over reported-risky sets; 10-CVE ground truth.
   - Limitations: Preprint; precision on sampled alerts only; evaluates description/code scanners, not any declared-vs-actual privilege tool; does not measure the privilege gap itself.

8. **FlowGuard: From Signals to Evidence for MCP Security Detection** — arXiv cs.CR; Fudan University (Baichao An, Pei Chen, Geng Hong, Yueyue Chen, Mengying Wu) — 2026-07-16  
   <https://arxiv.org/abs/2607.14754>  
   Execution-evidence detector motivated by 'Existing MCP security scanners primarily reason about suspicious semantic signals rather than real execution behaviors', benchmarked against MCPScan (Ant Group), MCP-Scanner (Cisco) and A.I.G on an executable benchmark; no code.
   - Figures: “executable benchmark containing 1,880 MCP cases across five vulnerability categories” · “F1 scores of 0.879 and 0.942 on the execution-related Command Injection and File System Access categories” · “reduces end-to-end latency by up to 2.23x” · “real-world evaluation, FlowGuard reports 523 findings across 326 servers” · “Table II F1: MCPScan CmdInj 0.6154 / ToolPoison 0.7883 / CredLeak 0.0000 / PromptInj 0.4292 / FS 0.8676; MCP-Scanner CmdInj 0.0000 / ToolPoison 0.8005 / CredLeak 0.1340 / PromptInj 0.0000 / FS 0.0197; A.I.G CmdInj 0.5633 / ToolPoison 0.7596 / CredLeak 0.7443 / PromptInj 0.8317; FlowGuard CredLeak 0.8642 / ToolPoison 0.9948 / PromptInj 0.9574”
   - Sample/method: Author-built 1,880-case executable benchmark; real-world run on 326 servers; baselines accessed 2026-05-01.
   - Limitations: Preprint; benchmark favours execution-evidence design; no released code; detects vulnerability classes, not declaration mismatch.

9. **Description-Code Inconsistency in Real-world MCP Servers: Measurement, Detection, and Security Implications (DCIChecker)** — arXiv cs.CR/cs.AI/cs.SE; Fudan University (Yutao Shi, Xiaohan Zhang, Xiangjing Zhang, Xihua Shen, Hui Ouyang, Huming Qiu, Mi Zhang, Min Yang) — 2026-06-03  
   <https://arxiv.org/abs/2606.04769>  
   Largest static measurement of the description-vs-code gap with a DCI taxonomy (Func-Under/Over/Mis/Am; Eff-RO/SM/DL) and a structure-aware static + Direct-Reverse-Arbitration LLM detector compared against MCPDiff, Agent Scan, MCP-Shield, Semgrep and Bandit; no artefact.
   - Figures: “19,200 description-code pairs extracted from 2,214 real-world MCP servers” · “9.93% of these pairs exhibiting inconsistencies” · “775 of the 2,214 MCP servers in our dataset contain at least one inconsistent tool, yielding a server-level prevalence of 35.00%” · “Mismatched Functionality (Type I) accounts for 75.2% of all identified DCI cases; Func-Over 35.40%” · “D_real DRA: Precision 96.00, Recall 97.46, F1 96.73, Accuracy 96.75” · “Table III D_real coverage (of 197): MCPDiff 90/197; DCIChecker 192/197; Agent Scan 50/197; MCP-Shield 21/197; Semgrep 5/197; Bandit 34/197”
   - Sample/method: D_large 19,200 pairs from 2,214 servers (static); D_real 400 annotated pairs; D_syn 560 mutation-based pairs.
   - Limitations: Static only, no execution; LLM judgement; MCPDiff baseline re-implemented by the authors; no code URL; preprint.

10. **Don't believe everything you read: Understanding and Measuring MCP Behavior under Misleading Tool Descriptions** — arXiv; Shandong University, Qingdao (Zhihao Li, Boyang Ma, Xuelong Dai, Minghui Xu, Yue Zhang, Biwei Yan, Kun Li) — 2026-02-03 (v1)  
   <https://arxiv.org/abs/2602.03580>  
   Static description-vs-implementation match measurement over 10,240 marketplace servers with four match levels; no code release.
   - Figures: “10,240 real-world MCP Servers across 36 categories” · “approximately 13% exhibit substantial mismatches that can enable undocumented privileged operations, hidden state mutations, or unauthorized financial actions” · “Full Match 5,303; Mostly Match 3,544; Partial Match 1,079; Rare Match 314” · “smithery Full Match approximately 56.6% (1,899/3,357); mcpmarket Full Match 50.4% (1,788/3,545), Partial 18.0% (638/3,545), Rare 4.3% (151/3,545)”
   - Sample/method: 10,240 servers from mcp_world, mcpmarket and smithery; static call-chain extraction plus LLM semantic extraction and similarity-based coverage scoring.
   - Limitations: Preprint; LLM/embedding similarity as ground truth with limited manual validation; static only; no scanner artefact.

11. **Auditing MCP Servers for Over-Privileged Tool Capabilities (mcp-sec-audit)** — arXiv cs.CR; New York Institute of Technology, Vancouver (Charoes Huang, Xin Huang et al.); repo github.com/nyit-vancouver/mcp-sec-audit — 2026-03-23 (v1); repo last push 2026-05-11  
   <https://arxiv.org/abs/2603.21641>  
   Open-source (MIT badge) rule-driven capability detector: static pattern matching (Python; JS/TS tree-sitter added later per README) plus sandboxed fuzzing/monitoring via Docker and eBPF tracepoints that promotes POTENTIAL static capabilities to CONFIRMED; neither paper nor README claims to compare descriptions/annotations against observed behaviour.
   - Figures: “The tool identified 663 capability instances with 100% detection rate across 491 samples (1.35 capabilities per sample on average)” · “367 out of 491 samples were detected, indicating a detection rate of 74.7%” · “static analyzer achieved 100% detection (2/2) on Python-based servers but 0% detection (0/7) on JavaScript-based servers due to current JavaScript/TypeScript AST parsing limitations” · “dynamic analyzer ... achieving 100% coverage (9/9 servers)” · “GitHub API: 6 stars, created 2026-01-17, pushed 2026-05-11, license field null (README badge says MIT)”
   - Sample/method: MCPTox benchmark (45 servers, 491 samples) for static detection; 9-server vulnerable lab (2 Python, 7 JS) for static vs dynamic.
   - Limitations: Tiny lab; 'detection' counts capability indicators, not exploitability; single post-paper PR; no declared-vs-observed comparison.

12. **snyk/agent-scan - Security scanner for AI agents, MCP servers and agent skills (with docs/issue-codes.md, CHANGELOG.md and the Invariant Labs launch post)** — Snyk (formerly Invariant Labs mcp-scan; invariantlabs-ai/mcp-scan 301-redirects here); launch post invariantlabs.ai/blog/introducing-mcp-scan (Luca Beurer-Kellner, Marc Fischer, 2025-04-11) — created 2025-04-07; latest release v0.6.3 2026-09-10; pushed 2026-09-11  
   <https://github.com/snyk/agent-scan>  
   The most-used open-source (Apache-2.0) MCP scanner: discovers agent configs, optionally starts stdio servers to read tool descriptions, and classifies descriptions/skills via local checks plus Snyk's hosted analysis API (issue codes E001 prompt injection, E002 tool shadowing, W015-W020 toxic-flow components, W021 hidden Unicode; v0.6 'risk indicators'); CHANGELOG shows a 0.2.1 live-call proxy, 0.3.0 toxic-flow analysis, 0.4.14/0.6.1 Agent Guard hooks for Claude Code/Cursor/Codex, 0.5.0 consent flow; no declared-vs-actual comparison anywhere in README, issue codes or changelog (also https://github.com/snyk/agent-scan/blob/main/docs/issue-codes.md, https://github.com/snyk/agent-scan/blob/main/CHANGELOG.md, https://invariantlabs.ai/blog/introducing-mcp-scan).
   - Figures: “GitHub API stars 3033 (2026-09-11), Apache-2.0, created 2025-04-07T14:31:26Z, pushed 2026-09-11” · “latest release v0.6.3 2026-09-10T08:23:04Z; releases API paginates to 122 entries incl. snapshots” · “PyPI mcp-scan: first 0.1.2 2025-04-07, last 0.4.3 2026-03-02 (84 releases); PyPI snyk-agent-scan: first 0.0.1 2026-02-26, latest 0.6.3 2026-09-10 (39 releases)” · “README: 'By default, Agent Scan requires explicit user consent (y/n) before starting each stdio MCP server during interactive runs.'” · “issue-codes: 'These issue codes apply to Agent Scan v0.5.x, which uses the `2025-09-02` analysis API. Agent Scan v0.6 and later report risk indicators instead.'” · “W019 'The MCP server grants access to tools that can modify shared infrastructure, execute arbitrary system commands, or affect other users and team resources.'” · “CHANGELOG: '0.2.1 `mcp-scan proxy` for live MCP call scanning, MCP guardrails; removed NPM support'; '0.5.9 Don't handshake (launch) stdio MCP servers by default'; '0.6.0 Introduce risk-based MCP server and skill analysis with scored findings'” · “Launch post: 'Tool Poisoning Attacks: Hidden malicious instructions embedded in MCP tool descriptions.' / 'MCP Rug Pulls: Unauthorized changes to MCP tool descriptions after initial user approval.'”
   - Sample/method: n/a (tool repository, docs and vendor announcement; no accuracy measurements)
   - Limitations: Detection logic runs in Snyk's closed analysis API so what is checked is known only from docs; v0.5.x issue codes marked deprecated; the 0.2.1 proxy scans live traffic against guardrails rather than diffing against declarations; stars are not a quality measure.

13. **cisco-ai-defense/mcp-scanner (README) and docs/behavioral-scanning.md** — Cisco AI Defense — created 2025-09-24; latest release 4.8.4 2026-08-28; last commit 2026-09-04; pushed 2026-09-11  
   <https://github.com/cisco-ai-defense/mcp-scanner>  
   Maintained open-source (Apache-2.0) Python scanner combining Cisco AI Defense inspect API, YARA rules and LLM analysis over tools/prompts/resources/server instructions, plus static 'Behavioural Code Scanning' of source (CFG, bounded taint depth 3, cross-file dataflow) with an LLM alignment step that 'compares docstring claims against actual behavior', pip-audit dependency checks, VirusTotal binary lookups and PyPI/npm package scanning in a Docker sandbox; findings mapped to Cisco AI Threat Security Taxonomy (also https://github.com/cisco-ai-defense/mcp-scanner/blob/main/docs/behavioral-scanning.md).
   - Figures: “GitHub API: stargazers 1070; license Apache-2.0; created 2025-09-24T01:02:24Z; pushed 2026-09-11T00:34:46Z” · “48 GitHub releases: first 1.0.0 2025-09-24, latest 4.8.4 2026-08-28; PyPI cisco-ai-mcp-scanner 42 versions” · “README: 'The MCP Scanner combines Cisco AI Defense inspect API, YARA rules and LLM-based analysis to detect malicious MCP tools.'” · “README: 'Supported Languages: Python, TypeScript, JavaScript, Go, Java, Kotlin, C#, Rust, Ruby, PHP'” · “behavioral doc: 'detect behavioral mismatches between what a function claims to do (via its docstring) and what it actually does (via its implementation)'” · “behavioral doc: 'Maximum depth of 3 levels to prevent memory explosion'; Limitations '1. Python Only: Currently supports Python MCP servers only ... 4. Dynamic Behavior: Cannot detect runtime-only behaviors'”
   - Sample/method: n/a (vendor README and design doc; no accuracy measurements)
   - Limitations: Vendor self-description; API analyzer needs Cisco's commercial endpoint; behavioral doc is self-contradictory on language coverage; comparison is docstring-vs-code, not MCP annotations vs runtime; independent review (AppSec Santa) found roughly 78% false positives in the pattern layer.

14. **Tencent/AI-Infra-Guard (A.I.G) - README and mcp-scan/README.md** — Tencent Zhuque Lab — repo created 2024-12-25; releases v4.5.0 2026-07-27 ... v4.6.1 2026-09-10; pushed 2026-09-11  
   <https://github.com/Tencent/AI-Infra-Guard>  
   Maintained open-source (Apache-2.0) AI-agent-driven MCP scanner: 14-pattern regex pre-scan, single-stage or three-stage LLM code audit (Info Collection -> Code Audit -> Vulnerability Review), SARIF MCP01-MCP10 plus Name Confusion/Rug Pull/Tool Shadowing rules, 15 YAML rules incl. mcp_excessive_permissions.yaml, and a dynamic mode against a remote server URL; a SKILL.md-vs-scripts intent-alignment audit exists for skills but no equivalent declared-vs-observed check for MCP tools is documented.
   - Figures: “6233 stars (GitHub API, 2026-09-11)” · “It thoroughly detects 14 major categories of security risks. The detection applies to both MCP Servers and Agent Skills.” · “vuln library expanded to 146 AI components & 2000+ CVE rules (v4.6.0, 2026-08-26)” · “Thanks to the research teams who have cited A.I.G in their academic work (19 papers)” · “v4.5.2 (2026-08-17): MCP-Scan: RCE prevention via tool whitelisting in dynamic mode” · “MCP02 Privilege Escalation & Scope Creep - Overly broad tool permission definitions” · “single-stage ~3x faster than three-stage”
   - Sample/method: n/a (tool documentation; no measured detection accuracy for mcp-scan given; SkillTrustBench 0.9848 for skill-scan only)
   - Limitations: Vendor self-description; quality depends on configured LLM; MCP02 'scope creep' is an LLM-judged code category, not a declared-vs-runtime comparison; FlowGuard and 2607.11086 report mixed precision for it.

15. **trailofbits/mcp-context-protector and blog 'We built the security layer MCP always needed'** — Trail of Bits (Cliff Smith) — blog 2025-07-28; repo created 2025-04-28; last commit 2026-02-13; pushed 2026-04-14  
   <https://github.com/trailofbits/mcp-context-protector>  
   Open-source (Apache-2.0) runtime wrapper for stdio/HTTP servers doing trust-on-first-use pinning of server instructions and tool descriptions (new/changed tools blocked, changed instructions block the server), optional guardrail-provider scanning of tool responses with quarantine, and ANSI escape sanitisation; a configuration-drift guard, not a declared-vs-observed comparator (also https://blog.trailofbits.com/2025/07/28/we-built-the-security-layer-mcp-always-needed/).
   - Figures: “GitHub API: 223 stars; Apache-2.0; created 2025-04-28T16:40:35Z; pushed 2026-04-14T12:07:30Z; 0 releases” · “last commit 2026-02-13T21:43:37Z 'Bump the actions group with 5 updates (#45)'” · “blog: 'if a new tool is introduced, or the description or parameters to a tool have been changed, that tool is blocked and never sent to the downstream LLM app. If the server's instructions change, the entire server is blocked.'” · “blog: 'replaces the escape character (a byte with the hex value 1b) with the ASCII string ESC'” · “README: 'If an attack is detected, the response will be saved in a quarantine database at `~/.mcp-context-protector/quarantine.json`.'”
   - Sample/method: n/a (vendor announcement and repo; no measurements)
   - Limitations: Beta; last substantive activity is a dependabot bump, so low maintenance; guardrail scanning depends on an external provider; no accuracy claims.

16. **We Scanned 1,808 MCP Servers. 66% Had Security Findings. (and 'From Static Findings to Working Exploits: Runtime Validation of 6 High-Profile MCP Servers')** — AgentSeal (repo github.com/getagentseal/agentseal, PyPI agentseal, FSL-1.1-Apache-2.0) — 2026-03-14 and 2026-03-28; PyPI latest 0.10.0 2026-06-11; repo pushed 2026-06-11  
   <https://agentseal.org/blog/mcp-server-security-findings>  
   Largest vendor registry-style corpus in the sweep: connects to each server, enumerates tools, runs a four-layer pipeline (regex signatures; Unicode deobfuscation; all-MiniLM-L6-v2 embeddings at 0.72 cosine; Claude Opus deep review) with cross-server toxic-flow graphs and SHA-256 schema hashes for rug-pull detection; a follow-up validates 28 static critical/high findings on 6 servers in Docker with planted credentials (also https://agentseal.org/blog/runtime-exploitation-mcp-servers). Runtime work confirms exploitability of static findings, not annotation accuracy.
   - Figures: “1,808 MCP servers; 1,196 servers (66%) had at least one security finding; 8,282 total findings; 427 critical; 1,841 high; 16,840 tools” · “Code Execution 873 high / 36 critical / 909 total / 40.1%; Toxic Data Flows 509 high / 334 critical / 843 total / 37.2%” · “The average trust score across all scanned servers is 85.7 out of 100; 590 servers have not yet received a trust score” · “Across 6 high-adoption MCP servers (68K+ combined GitHub stars), we find a 96.4% confirmation rate (27/28) for testable critical and high severity findings” · “As of late March 2026, the registry contains 8,013 published MCP servers with completed analysis; SAFE 80-100 3,580 44.7%; REVIEW 50-79 1,901 23.7%; RISKY 20-49 1,644 20.5%; DANGEROUS 0-19 888 11.1%” · “1,261 servers have deep findings from source-level analysis ... 4,513: 1,067 critical, 1,795 high, 1,240 medium, and 399 low” · “GitHub API: 371 stars, license NOASSERTION (PyPI: FSL-1.1-Apache-2.0); last push 2026-06-11”
   - Sample/method: 1,808 servers from GitHub/npm/PyPI/Smithery/MCP.run/directories over an undated window before 2026-03-14; 6 hand-picked high-star servers, 28 testable findings, Docker-from-source with planted credentials.
   - Limitations: Vendor blogs; convenience samples; no precision/recall for the static scan; runtime validation biased to testable findings and n=6; tool idle since 2026-06-11 (three months at sweep date).

17. **MCP Server Security Audit 2026** — AppSec Santa (Suphi Cankurt) — Last updated 2026-07-02 (scans April 2026)  
   <https://appsecsanta.com/research/mcp-server-security-audit-2026>  
   Only independent hands-on comparison of open-source MCP scanners found: mcp-scan v0.4.3 and Cisco mcp-scanner v4.3.0 on 33 local servers (433 tools) with manual true/false-positive labelling, later mcp-audit v0.14.1 on 10 remote servers.
   - Figures: “'I analyzed 33 local MCP servers with three scanners across three layers. Pattern matching alone flagged 27 patterns across 433 tools in 10 servers - but after review, only 6 represent genuine security concerns.'” · “'Only 6 of the 27 detections represent genuine security concerns - putting the false positive rate at roughly 78%.'” · “'Prompt Injection 8 HIGH 3 All 8 are standard MCP tool instructions, not actual injection'; 'Tool Poisoning 2 HIGH 2 Both are false positives'” · “'mcp-scan v0.4.3 (Invariant Labs) Config-drift layer 37 findings on the 33 servers ... 33 mutations (mostly benign), 2 tool-name shadows, 2 exfiltration flags'” · “'mcp-audit v0.14.1 ... caught 4 genuine no-auth remote endpoints and 2 auto-spawning project configs - but also its own false positive'”
   - Sample/method: 33 local servers from npm/GitHub (selection criteria not stated), single-reviewer labelling, April 2026.
   - Limitations: Single reviewer defines 'genuine'; small non-random corpus; scanner versions superseded; only Cisco's YARA layer evaluated; commercial tool-directory site.

18. **MCP-Scanner: Detecting Security Risks in Model Context Protocol Systems (EnCyCriS '26) and repo eSentire-Labs/mcp-scanner** — ACM/IEEE EnCyCriS workshop at ICSE 2026; Parya Abadeh, Fattane Zarrinkalam (University of Guelph); Martin Lochner, Taha Ansari (eSentire) — 2026-04-12 (Crossref); repo created 2026-01-20, last commit 2026-09-01 'sunset', archived  
   <https://doi.org/10.1145/3786160.3788471>  
   Workshop paper for a scanner covering tools, prompts and resources via keyword detection, semantic analysis and LLM evaluation for variable/tool poisoning, prompt injection, rug pulls and server impersonation; the linked repo (inferred by shared eSentire authorship) does auth/TLS/name-collision/rug-pull checks and is archived.
   - Figures: “Crossref published 2026-04-12; venue EnCyCriS '26” · “GitHub API eSentire-Labs/mcp-scanner: stars 6, archived true, pushed 2026-09-01, license null, Python” · “README: 'The eSentire-Labs project has been sunset. This repository no longer receives updates or maintenance.'”
   - Sample/method: Abstract only: custom-built vulnerable servers plus real online servers; no counts or metrics accessible.
   - Limitations: Full text unreachable (ACM DL 403); paper-to-repo link circumstantial; unmaintained; no declared-vs-actual comparison.

19. **MCP-SecLint: An Open-Source Static Analyzer for Detecting Vulnerabilities in LLM Tool Integrations (IWSPA '26; repo fonCki/mcp-security-linter)** — ACM IWSPA '26, pp. 89-100, DOI 10.1145/3806007.3810961; Alfonso Pedro Ridao, Melissa Safari, Zachary Kang, Nicola Dragoni (DTU / NUS) — 2026 (workshop 2026-06-12); repo latest release v1.6.1 2026-05-03  
   <https://orbit.dtu.dk/en/publications/mcp-seclint-an-open-source-static-analyzer-for-detecting-vulnerab/>  
   Peer-reviewed open-source (MIT badge) JS/TS taint analyser with three analyzers (dangerous command execution, token passthrough, unauthenticated endpoints); code-only.
   - Figures: “We evaluate MCP-SecLint by using it on 100 publicly available MCP server repositories found on GitHub, revealing a 5% vulnerability rate” · “GitHub: 3 stars, created 2025-11-03, pushed 2026-05-03, releases v1.6.0 and v1.6.1 both 2026-05-03”
   - Sample/method: 100 public GitHub JS/TS MCP repos; no stated ground-truth validation on the abstract page.
   - Limitations: Abstract only read; no precision/recall; JS/TS only; tiny adoption; no runtime or declaration comparison.

20. **MCP Safety Audit: LLMs with the Model Context Protocol Allow Major Security Exploits (McpSafetyScanner)** — arXiv cs.CR (Brandon Radosevich, John T. Halloran, Leidos); SPIE 2026 DOI 10.1117/12.3097390 — 2025-04-02 (v1); 2025-04-11 (v2); SPIE published 2026-06-10  
   <https://arxiv.org/abs/2504.03767>  
   Earliest MCP-specific scanner paper: 'the first agentic tool to assess the security of an arbitrary MCP server' (multi-agent LLM that proposes adversarial samples and writes a report); repo johnhalloran321/mcpSafetyScanner is MPL-2.0 and unmaintained since 2025-04-10; used as a baseline in 2607.11086.
   - Figures: “Comments: 27 pages, 21 figures, and 2 Tables” · “GitHub API: stars 178, created 2025-04-10T22:29:21Z, pushed 2025-04-10T22:38:10Z, license MPL-2.0”
   - Sample/method: Demonstrations on example servers with several LLMs; no quantitative scanner evaluation.
   - Limitations: No measured detection performance; single-day repo; SPIE version not opened.

21. **Model Context Protocol (MCP) at First Glance: Studying the Security and Maintainability of MCP Servers** — arXiv cs.SE (v5 2026-04-13; TOSEM per header); Queen's University (Mohammed Mehedi Hasan, Hao Li, Emad Fallahzadeh, et al.) — 2025-06-16 (v1); v5 2026-04-13  
   <https://arxiv.org/abs/2506.13538>  
   Early empirical use of scanners on a server corpus (SonarQube on all; Invariant mcp-scan on a sample) with an explicit call to enable 'automated security scanning within MCP registries'.
   - Figures: “1,899 open-source MCP servers: 343 MCP servers from the official MCP collection complemented by 1,556 MCP servers mined from ... GitHub” · “The cut-off date for MCP server mining is Mar 20, 2025” · “7.2% of servers contain general vulnerabilities and 5.5% exhibit MCP-specific tool poisoning” · “66% exhibit code smells, 14.4% contain ten bug patterns overlapping prior research”
   - Sample/method: 1,899 servers (cutoff 2025-03-20); SonarQube on all; mcp-scan on a sampled subset; LLM-jury clustering.
   - Limitations: Early-2025 snapshot; tool-poisoning rate depends on a single vendor scanner whose precision was later questioned; no runtime measurement.

22. **A First Look at the Security Issues in the Model Context Protocol Ecosystem (MCPInspect)** — arXiv cs.CR (v2 2026-04-27, 'Accepted to DSN 2026'); University of Delaware (Xiaofan Li, Xing Gao) — 2025-10-18 (v1); 2026-04-27 (v2)  
   <https://arxiv.org/abs/2510.16558>  
   Registry-level study across six registries with an unreleased pre-integration tool, MCPInspect, that flags misleading tool metadata and exploitable code vulnerabilities in decentralised-registry servers.
   - Figures: “We analyze 67,057 servers across six public registries” · “Using MCPInspect, we further analyze servers collected from decentralized registries and find that 833 contain exploitable vulnerabilities, while 18 include suspicious or vulnerable tool descriptions”
   - Sample/method: Crawl of mcp.so, MCP Market, MCP Store, Pulse MCP, Smithery and npm; MCPInspect on decentralised-registry servers only.
   - Limitations: No public code for MCPInspect; 'vulnerable' per authors' criteria; duplicates across registries; static.

23. **NVIDIA/SkillSpector - README, docs/B.3.1-mcp-least-privilege.md, docs/B.3.2-mcp-tool-poisoning.md** — NVIDIA (design docs by Nir Paz, 2026-03-30) — repo created 2026-03-21; releases v2.11.0 2026-08-28, v2.11.1 2026-09-07, v2.11.2 2026-09-09; pushed 2026-09-11  
   <https://github.com/NVIDIA/SkillSpector>  
   Heavily maintained static scanner whose LP1-LP4 and TP1-TP4 checks compare declared permissions/descriptions against detected code capabilities - but for agent SKILL.md manifests, not MCP server packages; never executes the target; can run as an MCP server to gate installs.
   - Figures: “16939 stars (GitHub API, 2026-09-11)” · “71 vulnerability patterns across 17 categories” · “LP1 Underdeclared Capability HIGH Code uses capabilities not listed in declared permissions” · “LP4 Overdeclared Permission LOW Permission declared but no corresponding code capability found” · “TP4 Description-Behavior Mismatch MEDIUM Declared tool description does not match actual code behavior (LLM-powered)” · “It never executes the scanned skill. All analysis is static (regex, Python AST, YARA) plus optional LLM evaluation of file contents” · “Dataset: 42,447 skills from major marketplaces; Vulnerable: 26.1% contain at least one vulnerability; High-severity: 5.2% show likely malicious intent”
   - Sample/method: Figures cited from Liu et al. 2026 'Agent Skills in the Wild' (skills dataset); no accuracy figures for SkillSpector's own detectors.
   - Limitations: Target is skills, not MCP servers; declared-vs-code logic depends on a SKILL.md 'permissions' field MCP servers lack; static only.

24. **The MCP Registry (About)** — Model Context Protocol / official MCP Registry docs — undated; 'currently in preview'  
   <https://modelcontextprotocol.io/registry/about>  
   Primary statement that the official registry performs no code scanning of MCP servers and delegates it to npm/PyPI/Docker Hub and downstream aggregators, focusing on namespace authentication and metadata hosting.
   - Figures: “'The MCP Registry delegates security scanning to: Underlying package registries - npm, PyPI, Docker Hub, and other package registries perform their own security scanning and vulnerability detection. Downstream aggregators - MCP Registry aggregators and marketplaces can implement additional security checks, ratings, or curation.'” · “'The MCP Registry focuses on namespace authentication and metadata hosting, while relying on the broader ecosystem for security scanning of actual server code.'” · “'Manual takedown - The registry maintainers can manually remove spam or malicious servers.'”
   - Sample/method: n/a (policy document)
   - Limitations: Undated preview-status policy; no takedown or listing statistics.

25. **Tool annotations are becoming the risk vocabulary for agentic systems. That matters more than it might seem.** — Stacklok (Craig McLuckie, CEO) — 2026-04-02  
   <https://stacklok.com/blog/tool-annotations-are-becoming-the-risk-vocabulary-for-agentic-systems-that-matters-more-than-it-might-seem/>  
   Vendor framing that annotation accuracy should be verified at registry curation by source inspection ('we can scrutinize the source code to confirm that the declared annotations match the actual behavior of the tools'), stated as 'the natural next step', with current vetting being provenance only.
   - Figures: “'Annotations are hints, not contracts. An untrusted server can claim readOnlyHint: true and delete your files anyway.'” · “'A tool that claims readOnlyHint: true should be proven to not write to any external state. A tool that claims openWorldHint: false should be proven to not make network calls outside its domain.'” · “'The natural next step is to extend that vetting process to include annotation accuracy.'”
   - Sample/method: n/a (opinion post; no measurement)
   - Limitations: Aspiration, not implemented practice; no method, tooling or figures; vendor CEO blog.

### Not used

- <https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF> — NSA CSI on MCP security returned 403 from media.defense.gov, nsa.gov and web.archive.org/web/2026/; only secondary summaries (ReedSmith, Equixly) readable, so whether it names scanners or annotation verification is unverified.
- <https://dl.acm.org/doi/10.1145/3786160.3788471> — Full text of the eSentire/Guelph MCP-Scanner paper is Cloudflare-blocked (fetch 403, curl challenge, Wayback 4.6 KB stub); only Crossref metadata and the researchr abstract were used, under the doi.org entry above.
- <https://www.anquanke.com/post/id/312465> — Chinese primary post on an 'AI-driven MCP security scanning system' returned HTTP 473; not opened.
- <https://digitalcommons.odu.edu/> — ODU undergraduate paper 'Behavioral Detection Methods for Automated MCP Server Vulnerability Assessment' (cited in the Tencent A.I.G README) returned 403; exact path not recorded.
- <https://github.com/orgs/modelcontextprotocol/discussions/159> — Returned 404; the registry's reported plan for 'automated code scanning ... analysis specific to MCP servers' (seen only in search snippets) could not be attributed to a primary comment.
- <https://docs.cloud.google.com/model-armor/model-armor-mcp-google-cloud-integration> — Surfaced by web search but not opened; Model Armor's MCP tool-scanning scope unverified.
- <https://arxiv.org/abs/2608.00150> — Corvus (dynamic tools/call testing of internet-facing servers) - abstract metadata retrieved via arXiv API id_list only; not verified, so excluded from the verdict.
- <https://arxiv.org/abs/2609.10854> — MCPSEC (description-only IPI detector) - abstract metadata via arXiv API only; not verified.
- <https://arxiv.org/abs/2608.23763> — TrustShiftProbe/SHIELD (runtime auditing against learned clean-window baselines) - abstract metadata via arXiv API only; not verified.
- <https://arxiv.org/abs/2608.00997> — 89-day registry-drift measurement - abstract metadata via arXiv API only; not verified.
- <https://arxiv.org/abs/2603.22853> — Agent Audit (MCP config privilege rules) - abstract metadata via arXiv API only; not verified.
- <https://arxiv.org/abs/2604.21477> — MCP Pitfall Lab / MCP-BOM - abstract metadata via arXiv API only; not verified.
- <https://arxiv.org/abs/2609.10962> — Random draw from the MCP registry (annotation omission figure) - abstract metadata via arXiv API only; not verified.
- <https://github.com/antgroup/MCPScan> — Ant Group MCPScan (Semgrep + LLM) is a baseline in three verified papers but its repo, README and maintenance state were not opened.
- <https://github.com/traceforce/mcp-xray> — MCP X-Ray (DEF CON 34 Demo Labs) surfaced but repo not opened or verified.
- <https://mcpscan.ai> — Hosted scanner surfaced via secondary comparison pages; not opened.
- <https://mcpscanner.cloud> — Hosted scanner surfaced via secondary comparison pages; not opened.
- <https://dblp.org> — DBLP API blocked by anti-bot challenge (Anubis); no bibliographic cross-check possible there.
- <https://ieeexplore.ieee.org/> — IEEE Xplore pages for MCP-Secure (OJCS 2026), MCPXKIT (TDSC) and 'The Missing S' were 403/empty; only Crossref/Semantic Scholar metadata seen.

### Open questions from the sweep

- NSA CSI 'Model Context Protocol (MCP): Security Design Considerations for AI-Driven Automation' full text (403 at media.defense.gov, nsa.gov, Wayback): does it name scanners or annotation verification?
- Corvus (arXiv 2608.00150, v1.3.2 2026-08-08, open-source), TrustShiftProbe/SHIELD (2608.23763), MCPSEC (2609.10854), registry-drift (2608.00997), Agent Audit (2603.22853), MCP Pitfall Lab/MCP-BOM (2604.21477) and the registry random-draw paper (2609.10962) were surfaced via arXiv API but not verified; a later check should open them, especially Corvus (does it compare tools/call results with declarations?) and SHIELD (baseline vs declaration).
- Ant Group MCPScan (github.com/antgroup/MCPScan), Lasso mcp-gateway, Nova-Hunting nova-proximity, Aira mcp-armor, traceforce/mcp-xray and riseandignite/mcp-shield are baselines or listicle entries in verified sources but their repos, licences and maintenance state were not opened.
- Small Aug-Sep 2026 hobby tools (mcp-fuzz/mcp-runtime-check 2026-09-05, LeonxLJX/mcpscope 2026-09-03, krishna9158/mcp-scanner 2026-07-29) were seen only via GitHub/PyPI search metadata; whether any exercises tools at runtime against readOnlyHint is unverified.
- Glama's runtime ruleset and Stacklok's annotation-vs-source verification have no published method or figures; a direct request to both vendors, or a test listing with a deliberately mislabelled tool, would settle whether the checks run at all.
- modelcontextprotocol/registry GitHub Discussions were not enumerated; the registry's reported plan for MCP-specific automated code scanning is unattributed.
- Google Model Armor MCP integration docs, Microsoft Agent 365 CLI 'a365 develop-mcp evaluate' (techcommunity post 2026-08-05), Anthropic Software Directory Policy (2026-04-15) and Docker MCP Catalog/Hub, Smithery, PulseMCP and mcp.run submission-review statements were surfaced or opened but not verified; OpenAI Apps SDK connector review policy was not searched.
- Semgrep registry API and GitHub code search for published MCP-specific Semgrep/CodeQL rule packs were not run directly (only web search).
- Black Hat USA 2026 briefings/Arsenal and MCP Dev Summit NA 2026 talk lists were not opened; only DEF CON 34 Demo Labs was verified.
- Chinese primary post anquanke.com/post/id/312465 (HTTP 473) and CSDN Tencent_SRC post on A.I.G were not opened; Japanese/Korean/German/Spanish searches yielded only secondary material.
- ODU undergraduate paper 'Behavioral Detection Methods for Automated MCP Server Vulnerability Assessment' (403) may contain a dynamic-detection method relevant to the runtime question.
- Adjacent skills-scanning work (Snyk ToxicSkills, Unit 42 'Trust No Skill', CSA SKILL.md note, USENIX Security 2026 malicious-skills paper, arXiv 2605.24248 Attested Tool-Server Admission) was surfaced but not opened; some may contain runtime declared-vs-observed methods transferable to MCP servers.
- Whether Connor (TOSEM header, DOI placeholder) and 'MCP at First Glance' (TOSEM header) were actually accepted was not confirmed; 2607.11086's public risk-monitor query interface at security.fudan.edu.cn/zoo/risk-monitor was not opened.

### Searches run

- `arXiv API (export.arxiv.org) :: all:"model context protocol" max_results=400 (+ start=400 page 2) :: 539 total, 400+139 entries saved to /var/tmp/nl-mcp/find-scanners-academic/q1_phrase*.xml`
- `arXiv API :: all:MCP AND all:server :: 254 entries`
- `arXiv API :: all:MCP AND all:security :: 264 entries`
- `arXiv API :: "model context protocol" AND (scanner OR scanning OR audit OR auditing) :: 84 entries; surfaced 2603.21641, 2607.11086, 2604.17125, 2608.00997, 2609.10854`
- `arXiv API :: "model context protocol" AND (poisoning OR "tool poisoning") :: 27 entries; MCPTox, MindGuard, MCP-ITP, ShareLock, TDP benchmark`
- `arXiv API :: "model context protocol" AND ("static analysis" OR "dynamic analysis" OR sandbox) :: 32 entries; MCP-SandboxScan, MCP-BiFlow, VIPER-MCP, MCPPrivacyDetector`
- `arXiv API :: "MCP server" AND (vulnerability OR vulnerabilities OR detection) :: 45 entries; Connor, FlowGuard, MCPGuard, Corvus`
- `arXiv API :: "model context protocol" AND (permission OR privilege OR "least privilege" OR capability) :: 218 entries; 2507.06250, AIRGuard, Task-Conditioned Least-Privilege, ACLE-MCP`
- `arXiv API :: "model context protocol" AND (guard OR guardrail OR proxy OR firewall OR gateway) :: 45 entries; MCP Guardian, MCP-Guard, MCPShield, AEGIS, ToolGuardian`
- `arXiv API :: "model context protocol" AND (annotation OR readOnlyHint OR destructiveHint OR declared OR undeclared OR over-privileged) :: 40 entries; DCIChecker, mcp-sec-audit, 2609.10962`
- `arXiv API :: ("MCP server" OR "MCP servers") AND (eBPF OR strace OR syscall OR "runtime monitoring" OR behavioral) :: 33 entries; no runtime tools beyond Connor/SandScope/mcp-sec-audit/TrustShiftProbe`
- `arXiv API :: id_list=2607.21735 :: 'What AI Red-Team Evaluations Can and Cannot Prove' - not MCP-scanner specific`
- `arXiv API :: ti:"Tracing MCP Security Vulnerabilities" :: no arXiv preprint; found via Semantic Scholar/Crossref (IEEE SPW 2026)`
- `arXiv API :: all:"Model Context Protocol" AND (annotation OR readOnlyHint OR declared OR attestation OR provenance), sortBy=submittedDate desc, max 40 :: ACLE-MCP 2609.02690, Attested Tool-Server Admission 2605.24248, Agent Audit 2603.22853, MCP Pitfall Lab 2604.21477, CASCADE 2604.17125, Random Draw 2609.10962`
- `arXiv API :: (MCP OR "Model Context Protocol") AND (scanner OR audit OR sandbox OR runtime OR eBPF OR "tool poisoning"), sortBy=submittedDate desc, max 60, filtered >= 2026-06-01 :: Corvus 2608.00150, MCPSEC 2609.10854, TrustShiftProbe 2608.23763, registry drift 2608.00997, HCP 2606.29073, Scanning the Harness 2609.07360, Labels Are Not Endpoints 2608.12880, ToolMinimize 2608.24957`
- `arXiv API :: id_list=2608.00150,2609.10854,2608.23763,2608.00997,2606.29073,2603.22853,2604.17125,2609.02690,2609.07360,2604.21477 :: abstracts/authors/dates retrieved (not verified further)`
- `web search :: site:arxiv.org "MCP" server scanner "tool poisoning" detection 2026 :: MCPTox, ShareLock, MCP-SandboxScan, MindGuard, 2603.22489`
- `web search :: site:dl.acm.org "Model Context Protocol" server security scanning :: MCP-Scanner (EnCyCriS@ICSE 2026), MCP-SecLint (IWSPA 2026), TOSEM papers`
- `web search :: site:ieeexplore.ieee.org "Model Context Protocol" MCP server vulnerability detection :: MCP-Secure, MCPXKIT, 'The Missing S', MASS 2025; IEEE pages unfetchable`
- `web search :: site:usenix.org "Model Context Protocol" MCP security 2026 :: no usenix.org hits`
- `web search :: "MCP-Scanner" Abadeh eSentire Guelph "Model Context Protocol" security risks :: eSentire-Labs/mcp-scanner (sunset), ICSE 2026 EnCyCriS session page`
- `web search :: "MCP-SecLint" static analyzer MCP vulnerabilities Dragoni DTU :: DTU Orbit record, fonCki/mcp-security-linter`
- `web search :: site:ndss-symposium.org "Model Context Protocol" OR "MCP server" :: no NDSS-hosted hits`
- `web search :: site:openreview.net "Model Context Protocol" MCP server security scanner audit :: only 2509.22814 and MCP-Radar; nothing scanner-specific`
- `web search :: ASE 2026 accepted papers MCP; site:semanticscholar.org MCP scanner; declared vs runtime behavior mismatch :: web search unavailable; covered via Semantic Scholar/OpenAlex APIs`
- `Semantic Scholar bulk API :: "Model Context Protocol" (scanner \| scanning \| audit \| auditing \| "static analysis") year 2025-2026 :: 163 hits; venue confirmations for MCP-Guard, MCP Safety Audit, Confused Deputy, Tracing MCP Vulns, InfrastructureSentinel`
- `OpenAlex API :: search="Model Context Protocol" security, sort=publication_date desc, 4 pages :: 2,730 works; Zenodo 'Declared vs. Observed' (2026-09-07), mcp-defense-bench (2026-09-08), Corvus deposit (2026-07-29), State of MCP dataset (2026-09-09)`
- `DBLP API :: Model Context Protocol :: blocked by anti-bot challenge`
- `Crossref API :: 10 DOIs (MCP-Scanner, MCP-SecLint, MCP-Secure, Missing S, ICAIC, SPW dataset, TOSEM confused deputy, ACL MCP-Guard, MASS, SPIE) :: all resolved`
- `usenix.org :: USENIX Security 2026 technical sessions (curl) :: no MCP titles; adjacent malicious-skills paper (98,380 skills)`
- `sp2026.ieee-security.org :: IEEE S&P 2026 accepted papers :: 'Parasites in the Toolchain' only MCP title`
- `ndss-symposium.org, sigsac.org :: NDSS 2026 / CCS 2026 accepted papers :: no MCP titles`
- `conf.researchr.org, 2026.msrconf.org :: ICSE 2026, FSE 2026, MSR 2026, ASE 2026 programmes :: MCP-Scanner at EnCyCriS workshop; FSE journal-first 'MCP Landscape'; MSR MCP dataset showcase; ASE pages 404`
- `GitHub REST API :: repo metadata + last commit for 13 academic-tool repos :: mcpSafetyScanner 2025-04-10, eSentire mcp-scanner archived 2026-09-01, mcp-security-linter v1.6.1 2026-05-03, nyit mcp-sec-audit 2026-05-11, Connor 2026-07-20, corvus 2026-08-13, MCPSecBench 2026-03-04, AIRGuard 2026-05-27, harness-eval 2026-09-07`
- `web search :: mcp-scan Invariant Labs Snyk Agent Scan MCP server scanner :: snyk/agent-scan, issue-codes doc, Invariant launch blog, dev.to critique, appsecsanta, decryptiondigest`
- `web search :: Cisco mcp-scanner MCP server scanner GitHub :: cisco-ai-defense/mcp-scanner repo, docs site`
- `web search :: Trail of Bits mcp-context-protector guard MCP :: ToB blog 2025-07-28, repo`
- `web search :: MCP security scanner tool 2026 static analysis tool poisoning :: Akto listicle, ACM MCP-Scanner, appsecsanta, arXiv MCP-DPT/MCP-SandboxScan/MCPXKIT`
- `web search :: Invariant "mcp-scan proxy" runtime monitoring guardrails MCP traffic :: darknet.org.uk write-up, invariantlabs-ai.github.io docs`
- `web search :: Snyk "Agent Guard" OR "Agent Monitor" evo.ai.snyk.io MCP runtime hooks announcement :: Snyk blogs 2025-12-22, 2026-03-23, docs.snyk.io`
- `web search :: Docker MCP Gateway security interceptors secrets scanning tool poisoning verification :: Docker blogs (2025-05-06, 2025-07-09), dasroot interceptors post`
- `web search :: Semgrep MCP rules ruleset "mcp" security rules tool poisoning :: no official Semgrep MCP ruleset; Semgrep guide 2025-09-29, Agent-Threat-Rule, IBM mcp-context-forge issue`
- `web search :: Endor Labs MCP server scanning "MCP" security evaluation :: only Endor's own MCP server; no MCP-specific scanner`
- `web search :: Akto MCP security scanner "MCP" tool discovery scanning runtime :: Akto marketing/docs (not opened); PipeLab comparison`
- `web search :: Enkrypt AI MCP scanner OR Inkog MCP server scanner OR "MCP Gateway" Enkrypt :: Enkrypt scanner page, secure-mcp-gateway repo; nothing for Inkog`
- `web search :: MCP server "declared" vs "actual" behavior sandbox observe syscalls network tool description mismatch runtime detection :: dev.to Airlock post, ARMO eBPF blog, arXiv 2602.03580, OWASP cheat sheet`
- `web search :: HiddenLayer MCP OR "Pillar Security" MCP scanner OR "Noma Security" MCP OR "Zenity" MCP server scanning :: vendor marketing pages only`
- `web search :: OWASP MCP Top 10 2026 OR "MCP Security Cheat Sheet" OWASP tools scanning recommendations :: OWASP/www-project-mcp-top-10, cycode/practical-devsecops guides, 'npx mcps-audit' mention, garak/PurpleLlama issues`
- `web search :: Glama MCP server security score automated scanning "glama.ai" security audit servers :: glama.ai/mcp/methodology`
- `web search :: Socket.dev MCP server malware detection OR Aikido MCP scanning "MCP servers" :: no MCP-specific Socket scanner; Aikido result is an MCP plugin; arXiv MCPGuard`
- `web search :: Black Hat USA 2026 OR "DEF CON 34" MCP server scanner talk tool poisoning :: DEF CON 34 Demo Labs 'X-Ray Your Agents' (traceforce/mcp-xray); NCC Group postcards`
- `web search :: "MCP X-Ray" scanner GitHub agent plugin supply chain active pentesting :: traceforce/mcp-xray, antgroup/MCPScan, pkgxray, Cisco blog`
- `web search :: "we analyzed" OR "we scanned" MCP servers vendor research thousands of MCP servers vulnerabilities percent 2026 :: practical-devsecops roundup, appsecsanta, Trend Micro 19,000 sweep, PipeLab report`
- `web search :: Backslash Security MCP server hub OR Knostic MCP scan OR Astrix MCP servers research findings percent :: Backslash hub blog, knostic/MCP-Scanner (Shodan), Astrix 5,200-server report`
- `web search :: Palo Alto Unit 42 MCP server scanner OR "Prisma AIRS" MCP OR Repello MCP scanner OR Lasso "MCP Gateway" security plugins :: pan-mcp-relay, Prisma AIRS MCP docs; nothing for Repello; Lasso only via GitHub`
- `web search :: GitHub MCP Registry security scanning OR "official MCP registry" moderation scanning malicious servers Anthropic registry :: modelcontextprotocol.io/registry/about, GitHub Marketplace 'MCP Security Scan' action`
- `web search :: Endor Labs "2,614" MCP OR Endor Labs MCP servers path traversal file operations research :: Endor Labs blog 2026-01-23`
- `web search :: BlueRock Security MCP servers SSRF "7,000" OR Enkrypt AI "1,000" MCP servers scanned critical vulnerabilities report :: BlueRock MCP Trust Registry, MarkItDown SSRF post; Enkrypt 1,000-server blog`
- `web search :: Equixly MCP servers command injection 43% research OR Trend Micro exposed MCP servers research :: Equixly 2025-03-29 (snippet only), Trend Micro 19,000 sweep`
- `web search :: Enkrypt AI MCP security report "1,000" MCP servers 33% critical October 2025 :: enkryptai.com blog 2025-10-09`
- `web search :: tl;dr sec newsletter MCP scanner OR "MCP security" tool roundup 2026 :: web search unavailable`
- `web search :: Microsoft MCP security "tool poisoning" scanner OR "MCP Gateway" Azure API Management MCP security scanning 2026 :: web search unavailable`
- `web search :: mcpscan.ai OR "NeuralTrust MCP Scanner" OR "Proximity" NOVA MCP scanner OR "Pipelock" MCP scanner comparison :: web search unavailable; names seen only via PipeLab secondary page`
- `web search :: Docker MCP Catalog "verified" security scanning MCP servers Docker Hub tool poisoning detection catalog review process :: web search unavailable`
- `GitHub search API :: topic:mcp-security stars:>=100 :: 32 repos; stacklok/toolhive 2158, pipelock 841, hol-guard 590, lasso-security/mcp-gateway 385, Agent-Threat-Rule 389, getagentseal/agentseal 371, MCP-Defender 257, repo-forensics 172, mcp-observatory 146, mcp-reticle 118, StackOneHQ/defender 120, OWASP/www-project-mcp-top-10 104`
- `GitHub search API :: topic:mcp-scanner stars:>=100 :: 1 irrelevant repo (7WaySecurity/ai_osint)`
- `GitHub search API :: mcp scanner security in:name,description stars:>=100 :: 13 repos; snyk/agent-scan 3032, agentshield 1163, cisco-ai-defense/mcp-scanner 1070, riseandignite/mcp-shield 555, Nova-Hunting/nova-proximity 304, HeadyZhang/agent-audit 228, repo-forensics 172, kapilduraphe/mcp-watch 136, sinewaveai/agent-security-scanner-mcp 121; NVIDIA/SkillSpector 16912`
- `api.github.com / pypi.org :: GitHub REST metadata for ~30 repos; PyPI JSON for mcp-scan, snyk-agent-scan, cisco-ai-mcp-scanner :: created_at, pushed_at, last commit, releases, stars, licence captured`
- `web search :: OWASP "MCP Top 10" 2026 tools scanning :: NVIDIA/garak issue #1639, PurpleLlama issue #186, Equixly NSA-to-OWASP mapping, microsoft/agent-governance-toolkit mapping`
- `web search :: MCP 安全 扫描 工具 服务器 检测 2026 (Chinese) :: anquanke post (HTTP 473), slowmist checklist, tinyash MCP X-Ray tutorial, AgentsID scanner`
- `web search :: Cloud Security Alliance MCP server security guidance scanning 2026 :: CSA guide (2026-03-27), CSA note (2026-05-04), ModelContextProtocol-Security/mcpserver-audit repo`
- `web search :: "mcp-audit" OR "mcp-shield" OR "mcp-guardian" MCP security tool GitHub 2026 :: P4ST4S/mcp-audit, riseandignite/mcp-shield, rudraneel93/mcp-guardian, LuciferForge/mcp-security-audit, awesome lists`
- `web search :: NSA MCP guidance "Model Context Protocol" cybersecurity information sheet 2026 :: NSA press release and CSI PDF located (403 everywhere); ReedSmith summary opened`
- `web search :: MCP サーバー セキュリティ スキャナー ツール 検査 2026 (Japanese) :: secondary Japanese coverage only; no Japanese-origin scanner`
- `web search :: "MCP" server security scanner talk Black Hat Europe OR BSides OR RSAC 2026 OR DEF CON 34 tool poisoning runtime :: badchars/mcp-security-scanner only`
- `web search :: "agent skills" OR "SKILL.md" scanner security supply chain "MCP" scanner 2026 August September :: NVIDIA/SkillSpector, CSA SKILL.md note, Unit 42 'Trust No Skill', Sentry skill-scanner, Snyk ToxicSkills (secondary)`
- `web search :: "Agentic AI Foundation" OR "Linux Foundation" MCP registry security scanning working group 2026 :: AAIF press and MCP Dev Summit NA 2026 recap; no scanning deliverable`
- `web search :: NIST "Model Context Protocol" MCP security tool verification OR "AI agent" tool declaration verification 2026 :: no NIST MCP document; CoSAI MCP Security PDF (2026-01-08), arXiv 2605.24248`
- `web search :: github.com/modelcontextprotocol discussions security scanning registry "tool annotations" enforcement verify readOnlyHint :: MCP blog on tool annotations (2026-03-16), Stacklok blog (2026-04-02), sunpeak annotation-testing post (2026-07-22), SEP-1487/1560; org discussion #159 404`
- `web search :: MCP 서버 보안 스캐너 도구 취약점 2026 (Korean) :: AI Times May 2025 coverage of AWS paper; CIO Korea vendor pieces; no Korean scanner`
- `web search :: MCP-Server Sicherheit Scanner Werkzeug Tool Poisoning Prüfung 2026 (German) :: English results only`
- `web search :: youtube MCP server security scanner talk "tool poisoning" 2026 conference presentation runtime sandbox :: nothing new`
- `web search :: huggingface dataset MCP servers security malicious benchmark scanner evaluation 2026 leaderboard :: Scale MCP-Atlas, MCP-SafetyBench, MCPSecBench (LLM-agent benchmarks); arXiv 2604.07551 MCP-DPT`
- `web search :: Stacklok ToolHive MCP server verification "tool annotations" runtime check OR "mcp-verify" OR "annotation verification" 2026 :: Stacklok annotation blog; ToolHive docs; no runtime verifier`
- `web search :: Traceforce "MCP X-Ray" github mcpxray scanner Go SARIF pentest :: traceforce/mcp-xray, DEF CON 34 Demo Labs listing, archived airblackbox/mcp-security-scanner`
- `web search :: MCP server "behavioral" verification declared annotations readOnlyHint "actually" writes sandbox test tool github August 2026 :: mcp-runtime-check (mcp-fuzz) on PyPI, github-mcp-server issue #2483, openai/codex issue #7635`
- `web search :: CodeQL OR Semgrep OR OpenGrep rules pack "MCP server" queries tool poisoning 2026 github security lab :: no published MCP rule pack; IBM/mcp-context-forge issue #2237`
- `web search :: servidores MCP seguridad escáner herramienta auditoría "tool poisoning" 2026 (Spanish) :: English results only; AgentAuditKit GitHub Action, AgentSeal figures via secondary`
- `web search :: Microsoft "agent-governance-toolkit" OR "Azure" MCP server scanning tool OR Google "Model Armor" MCP tool scanning 2026 :: Microsoft AGT launch (2026-04-02), techcommunity Agent 365 CLI MCP evaluation post (2026-08-05), Google Model Armor MCP docs (not opened)`
- `web search :: AgentSeal MCP servers scanned 1,808 findings 66% report :: AgentSeal primary posts (2026-03-14, 2026-03-28); Enkrypt 1,000-server post`
- `web search :: 腾讯 朱雀实验室 A.I.G MCP 安全 扫描 开源 (Chinese) :: Tencent/AI-Infra-Guard primary; CSDN Tencent_SRC post`
- `web search :: 蚂蚁集团 MCPScan MCP 安全扫描 开源 工具 (Chinese) :: antgroup/MCPScan (Semgrep + DeepSeek LLM); mcpscan.ai and mcpscanner.cloud (not opened)`
- `web search :: Smithery OR PulseMCP OR "mcp.run" OR Runlayer MCP server registry security scan "trust score" automated 2026 :: dev.to Bawbel scan of 100 Smithery servers (2026-04-30), mcpskills.io (not opened); no registry-operator scanning statement`
- `web search :: "MCP Defender" OR "mcp-defender" OR Obot MCP gateway scanner tool poisoning runtime 2026 open source :: vendor roundups only`
- `web search :: github.com/modelcontextprotocol/registry discussion "security scanning" OR "malicious" OR "moderation" automated scan servers 2026 :: The New Stack 'immune system' article is a false friend (GitHub scanning via the GitHub MCP Server)`
- `web search :: github.blog changelog May 2026 MCP "tool poisoning" OR "MCP server" scanning Copilot "MCP registry" security agents announcement :: GitHub changelog entries are secret scanning via the GitHub MCP Server - excluded`
- `web search :: Anthropic connectors directory OR "Claude connectors" review policy MCP server security review requirements submission 2026 :: Anthropic Software Directory Policy (support.claude.com, 2026-04-15) and sunpeak submission guide (2026-08-13) opened but not verified`
- `GitHub REST API :: search/repositories q=bawbel scanner; q=mcp annotation verify readOnlyHint; q=mcp server "declared" "actual" behavior :: bawbel/bawbel-mcp (1 star); zero results for annotation-verify; LeonxLJX/mcpscope and krishna9158/mcp-scanner (0 stars each)`
- `GitHub REST API :: search/repositories q=mcps-audit :: no such repo; AutoRedTeam-Orchestrator and mcpserver-audit`
- `GitHub REST API / PyPI JSON API :: repos + releases for ~25 candidate repos; PyPI JSON for mcp-runtime-check, agentseal, cobaltosec-corvus, agent-audit :: dates, stars, licence, latest release captured`
- `curl :: https://web.archive.org/web/2026/https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF :: 403; NSA PDF unreadable from all three locations`
- `GitHub REST API + raw README (for the write-up, 2026-09-11) :: repos/narko4u/mcp-evidence-validator; raw README.md grep for runtime/proxy/sandbox/syscall :: 0 stars, Apache-2.0, pushed 2026-08-18; validator diffs user-supplied declared vs observed JSON; 'MCP client integration (intercept tool-call records via a lightweight proxy)' is an unchecked roadmap item`

## Registries and catalogs

**Verdict:** partial · 84 supporting sources · 21 not used · 116 searches

### Supporting sources

1. **The MCP Registry Moderation Policy** — Model Context Protocol project (official registry maintainers); same text at https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/modelcontextprotocol-io/moderation-policy.mdx — undated; carries 'currently in preview' note; fetched 2026-09-11  
   <https://modelcontextprotocol.io/registry/moderation-policy>  
   The only complete written moderation and takedown policy for an open MCP registry: removes only illegal content (incl. 'hacking tools'), malware, spam and non-functioning servers; explicitly will not remove vulnerable, low-quality, duplicate or adult servers; removal sets status 'deleted' with metadata retained; appeals via GitHub issue; subregistries may have their own policies.
   - Figures: “TL;DR: The MCP Registry is quite permissive! We only remove illegal content, malware, spam, and completely broken servers.” · “The MCP Registry does not make guarantees about moderation, and consumers should assume minimal-to-no moderation.” · “We largely rely on upstream package registries (like NPM, PyPI, and Docker) or downstream subregistries (like the GitHub MCP Registry) to do more in-depth moderation.” · “We therefore won't remove: Low-quality or buggy servers; Servers with security vulnerabilities; Servers that do the same thing as other servers; Servers that provide or contain adult content” · “When we remove a server, we set the server's status to "deleted", but the server's metadata remains accessible via the MCP Registry API.” · “This policy applies to the official MCP Registry at registry.modelcontextprotocol.io. Subregistries may have their own moderation policies.”
   - Limitations: Undated, self-described as changeable; official registry only; no figures on removals or enforcement.

2. **The MCP Registry (about page)** — Model Context Protocol project — undated; fetched 2026-09-11  
   <https://modelcontextprotocol.io/registry/about>  
   States the official registry's operator model (community-owned, backed by Anthropic, GitHub, PulseMCP, Microsoft), that it hosts metadata only, that security scanning is delegated to package registries and downstream aggregators, and that spam prevention is namespace authentication plus regex/character limits plus manual takedown.
   - Figures: “official centralized metadata repository for publicly accessible MCP servers, backed by major trusted contributors to the MCP ecosystem such as Anthropic, GitHub, PulseMCP, and Microsoft” · “The MCP Registry delegates security scanning to: Underlying package registries — npm, PyPI, Docker Hub, and other package registries perform their own security scanning and vulnerability detection. Downstream aggregators — MCP Registry aggregators and marketplaces can implement additional security checks, ratings, or curation.” · “Publishers must verify ownership of their namespace through GitHub, DNS, or HTTP challenges, preventing arbitrary spam submissions.” · “Manual takedown — The registry maintainers can manually remove spam or malicious servers.” · “Future spam prevention measures under consideration include stricter rate limiting, AI-based spam detection, and community reporting capabilities.” · “The metadata hosted by the MCP Registry is deliberately unopinionated. Downstream aggregators can provide curation”
   - Sample/method: n/a (vendor documentation)
   - Limitations: Undated; describes intended design not measured practice; no counts.

3. **MCP Registry Aggregators** — Model Context Protocol project; same text at https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/modelcontextprotocol-io/registry-aggregators.mdx — undated; example timestamps reference 2025-10-23 and schema 2025-12-11; fetched 2026-09-11  
   <https://modelcontextprotocol.io/registry/registry-aggregators>  
   Documents how takedowns propagate downstream: aggregators scrape the read-only API roughly hourly, status 'deleted' signals a moderation-policy violation, and aggregators 'may prefer' (are not required) to drop such entries; subregistries may inject ratings, download counts and security-scan results via _meta.
   - Figures: “Aggregators are expected to scrape data on a regular but infrequent basis (e.g., once per hour)” · “Server metadata is generally immutable, except for the status field which may be updated to, e.g., "deprecated" or "deleted". We recommend that aggregators keep their copy of each server's status up to date.” · “The "deleted" status typically indicates that a server has violated our permissive moderation policy, suggesting the server might be spam, malware, or illegal. Aggregators may prefer to remove these servers from their index.” · “a subregistry could inject user ratings, download counts, and security scan results” · “The MCP Registry does not provide uptime or data durability guarantees”
   - Sample/method: n/a (vendor documentation)
   - Limitations: Advisory guidance; does not document what any aggregator actually does with deleted entries.

4. **Official Registry Server.json Requirements (with docs/design/proposed-enhanced-validation.md)** — modelcontextprotocol/registry (GitHub); companion design doc at https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/design/proposed-enhanced-validation.md — undated; fetched from main 2026-09-11  
   <https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/reference/server-json/official-registry-requirements.md>  
   Defines the entire publish-time validation of the official registry as namespace authentication, package-ownership verification, restricted registry base URLs and a 4KB _meta cap — no content or security review; the companion design doc admits schema validation was not enforced and proposes a non-blocking 'Linter' tier for security concerns.
   - Figures: “Namespace authentication - Servers are published under appropriate namespaces” · “Package ownership verification - Publishers actually control referenced packages” · “Restricted registry base urls - Packages are from trusted public registries (NPM: https://registry.npmjs.org only; PyPI: https://pypi.org only; NuGet: https://api.nuget.org/v3/index.json only; Cargo: https://crates.io only)” · “The publisher-provided extension is limited to 4KB (4096 bytes) of JSON” · “proposed-enhanced-validation.md: Currently, the MCP Registry project publishes a server.json schema but does not validate servers against it, allowing non-compliant servers to be published.” · “proposed-enhanced-validation.md: Linter Validation (Tertiary) - Best practice recommendations: Security concerns, style guidelines, naming conventions - Non-blocking: Warnings and suggestions, not errors”
   - Sample/method: n/a (spec and design documents)
   - Limitations: Undated; the design doc marks Stage 1 schema validation as '(Current)', so the 'does not validate' statement may be stale; 'many violate it' is unquantified.

5. **Frequently Asked Questions (MCP Registry)** — modelcontextprotocol/registry (GitHub) — undated; preview note; fetched 2026-09-11  
   <https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/modelcontextprotocol-io/faq.mdx>  
   Documents the abuse-reporting path (report to upstream package registry, then a GitHub issue titled 'Abuse report: '), publisher self-deletion via mcp-publisher, and that metadata is never permanently removed; a GitHub search shows no issue has ever used the prescribed 'Abuse report:' prefix.
   - Figures: “1. Report it as abuse to the underlying package registry (e.g. NPM, PyPI, DockerHub, etc.); and 2. Raise a GitHub issue on the registry repo with a title beginning `Abuse report: `” · “Deleted servers are hidden from default API listings but can still be retrieved with `include_deleted=true`” · “Server metadata is never permanently removed from the registry. The `deleted` status hides the server from discovery but preserves the historical record.” · “GitHub search 2026-09-11: 'Abuse report' in:title = 0 issues; 'Takedown request' in:title = 2 issues (#1558, #1563); 'Request: delete' in:title = 17; 511 issues total”
   - Sample/method: FAQ text; issue-title counts via GitHub search API on 2026-09-11
   - Limitations: GitHub search may miss issues whose titles were edited.

6. **Admin operations (moderation runbook)** — modelcontextprotocol/registry (GitHub, docs/administration) — undated file; PR #1518 updating it merged 2026-08-10T13:24:07Z  
   <https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/administration/admin-operations.md>  
   The official registry's takedown tooling: admin accounts require an @modelcontextprotocol.io email, PATCH status endpoints and tools/admin/takedown.sh set 'deleted' across all versions with a statusMessage, and content scrubbing is per-version with no bulk endpoint.
   - Figures: “All actions should be taken in line with the moderation policy” · “Admin account with @modelcontextprotocol.io email” · “-d '{"status": "deleted", "statusMessage": "Removed per moderation policy"}'” · “Content edits (e.g. scrubbing sensitive text from descriptions) have no bulk endpoint” · “PR #1518 'fix(admin): use PATCH status endpoints in takedown script and runbook' merged 2026-08-10”
   - Sample/method: n/a (runbook)
   - Limitations: Describes tooling, not frequency of use or any pre-listing review.

7. **Official MCP Registry Terms of Service** — Model Context Protocol project (modelcontextprotocol/registry) — Effective 2025-09-02; file last committed 2026-01-21T15:29:44Z  
   <https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/modelcontextprotocol-io/terms-of-service.mdx>  
   The registry's legal prohibitions (malware 'even in good faith or for research purposes', spam, false affiliation, repeated near-duplicate servers), a monitoring clause, CC0 dedication of registry data, and a statement that subregistries may perform automated security scanning; contains no explicit removal, suspension or termination clause.
   - Figures: “Share malicious or harmful content, such as malware, even in good faith or for research purposes” · “Submit data with the intent of confusing or misleading others, including but not limited to via spam, posting off-topic marketing content, posting MCP servers in a way that falsely implies affiliation with or endorsement by a third party, or repeatedly posting the same or similar MCP servers under different names” · “You understand that your use of the Registry may be monitored to ensure quality and verify your compliance with these Terms.” · “subregistries might enrich this data by adding how many stars your GitHub repository has, or perform automated security scanning on your code” · “The MCP Registry is currently in preview. Breaking changes or data resets may occur before general availability.”
   - Sample/method: n/a (legal document)
   - Limitations: Raw main-branch file; live rendering not checked.

8. **MCP Registry Design Principles (with docs/design/ecosystem-vision.md and docs/design/roadmap.md)** — modelcontextprotocol/registry (GitHub); companion docs at https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/design/ecosystem-vision.md and https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/design/roadmap.md — design-principles last committed 2026-08-10; ecosystem-vision last committed 2025-11-18; roadmap carries a note dated 2026-08-10  
   <https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/design/design-principles.md>  
   The design rationale for no curation: the official registry avoids moderation-heavy features, makes no quality judgments, delegates code security to package registries, and expects named subregistries (Smithery, PulseMCP) to add curation; the roadmap lists curation, quality rankings, tags and hosting as out of scope and records the launch (2025-09-08) and API freeze (2025-10-24).
   - Figures: “Avoid features that require constant human intervention or moderation” · “No built-in ranking, curation, or quality judgments” · “Implement rate limiting, field validation, and blacklisting to prevent abuse” · “ecosystem-vision.md: Subregistries (Smithery, PulseMCP, etc.): Add value through curation, ratings, enhanced metadata / ETL from official registry + additional annotations” · “ecosystem-vision.md: MCP registries are metaregistries. They host metadata about packages, but not the package code or binaries” · “roadmap.md: The registry launched in preview on 2025-09-08 and the v0.1 API entered a freeze on 2025-10-24, so "Go-Live" has already happened.” · “roadmap.md: Server tags or categories: Not supported, to reduce moderation burden”
   - Sample/method: n/a (design documents)
   - Limitations: Statements of intent; 'blacklisting' is not elaborated; subregistry examples are illustrative, not a formal list.

9. **Introducing the MCP Registry** — Model Context Protocol blog; authors David Soria Parra, Adam Jones, Tadas Antanavicius, Toby Padilla, Theodora Chu; source at https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/blog/content/posts/2025-09-08-mcp-registry-preview.md — 2025-09-08  
   <https://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/>  
   Launch date of the official registry (preview) and the intended community-flag-then-denylist moderation model; names collaborators (PulseMCP, Goose, GitHub, Block, Stacklok, VS Code, NuGet, Last9, Microsoft, Anthropic).
   - Figures: “Community members can submit issues to flag servers that violate the MCP moderation guidelines—such as those containing spam, malicious code, or impersonating legitimate services. Registry maintainers can then denylist these entries and retroactively remove them from public access.” · “Public subregistries like opinionated "MCP marketplaces" associated with each MCP client are free to augment and enhance data they ingest from the upstream MCP Registry.” · “breaking changes may occur before the registry is made generally available”
   - Sample/method: n/a (announcement)
   - Limitations: Intended policy, not measured practice; no counts; no GA date has been announced since.

10. **modelcontextprotocol/registry README and repository metadata** — Model Context Protocol (GitHub) — repo created 2025-02-05; API freeze note 2025-10-24; pushed 2026-09-09; metadata read 2026-09-11  
   <https://github.com/modelcontextprotocol/registry>  
   Repo-level facts: still labelled preview with possible data resets, v0.1 API frozen, auth methods GitHub OAuth/OIDC/DNS/HTTP, 7,236 stars, 511 issues; the README itself contains no moderation statement (policy lives in docs/).
   - Figures: “While the system is now more stable, this is still a preview release and breaking changes or data resets may occur.” · “The Registry API has entered an API freeze (v0.1)...the API will remain stable with no breaking changes (2025-10-24)” · “stargazers_count 7236; pushed_at 2026-09-09T23:33:38Z; license NOASSERTION; issues total_count 511; open_issues_count 161”
   - Sample/method: GitHub REST/search API on 2026-09-11
   - Limitations: README only; counts drift.

11. **A First Look at the Security Issues in the Model Context Protocol Ecosystem** — arXiv; Xiaofan Li, Xing Gao (University of Delaware); accepted to DSN 2026 — v1 2025-10-18; v2 2026-04-27  
   <https://arxiv.org/abs/2510.16558>  
   The closest academic treatment of registry vetting: Section VI 'Registry-Level Issues' (VI-A 'Lack of Server Vetting', VI-B identity inconsistency, VI-C naming) over 67,057 servers from six registries, asserting registries 'lack effective security scrutiny mechanisms' from observed outcomes (invalid links, hijackable GitHub accounts, leaked tokens).
   - Figures: “We analyze 67,057 servers across six public registries (mcp.so, MCP Market, MCP Store, Pulse MCP, Smithery, npm)” · “We collect data between late June and early July 2025” · “We select 5 registries out of the 27 listed on mastra” · “MCP registries are open platforms allowing anyone to publish servers. However, these registries lack effective security scrutiny mechanisms.” · “we detected 0.14% to 6.84% invalid server links across the four registries, totaling 1,379” · “out of 1,379 invalid links, we find 212 cases (15.37%) where the associated GitHub accounts are re-registrable” · “Table IV Maintainer Hijacking / Redirection Hijacking: mcp.so 111/98; MCP Market 95/50; MCP Store 5/155; Pulse MCP 1/1; Total 212/304” · “Among 5,659 configurations, we have identified 9 GitHub tokens ... As of July 2025, 5 tokens remain valid”
   - Sample/method: Crawl of six registries late June to early July 2025 (67,057 servers); link validity via HTTP status; hijackability via GitHub user API; gitleaks on 5,659 mcp.so configurations; MCPInspect static analysis.
   - Limitations: Single mid-2025 snapshot; excludes the official registry, Glama, Docker and GitHub registries; 'lack of vetting' inferred from outcomes, no policy documents quoted, no written comparison.

12. **Best MCP Server Directories for Developers** — Descope (Artem Oppermann) — 2026-03-16  
   <https://www.descope.com/blog/mcp-directories>  
   The closest thing found to a per-registry review-policy comparison: side-by-side tables (discoverability, quality standards, security verification, maintenance, installation, 9-criteria matrix) for GitHub MCP Registry, Glama, PulseMCP and MCP Market.
   - Figures: “The GitHub MCP Registry currently lists 87 servers as of March 2026” · “GitHub: Basic validation for server.json, limited to format and namespace uniqueness” · “Glama: A team uses automated scans and manual reviews to ensure that projects have READMEs, valid licenses (and no known vulnerabilities); 14,000+ as of Jan 9 2026” · “PulseMCP: there are no automated code or vulnerability checks. Users must consult the GitHub repository; ~7,640+/8,000” · “MCP Market: the directory provides no security checks or dependency information, and maintainer verifications are missing; ~20,000”
   - Sample/method: Descriptive vendor review; counts quoted from each directory's site at stated dates; no independent measurement.
   - Limitations: Vendor marketing; four directories only (omits official registry, Smithery, mcp.so, Docker, Anthropic/OpenAI/Microsoft catalogs); characterisations not sourced to policy documents; no takedown discussion.

13. **The Mother of All AI Supply Chains: Critical, Systemic Vulnerability at the Core of Anthropic's MCP** — OX Security (Moshe Siman Tov Bustan, Mustafa Naamnih, Nir Zadok, Roni Bar) — 2026-04-15  
   <https://www.ox.security/blog/the-mother-of-all-ai-supply-chains-critical-systemic-vulnerability-at-the-core-of-the-mcp/>  
   The only empirical cross-registry test of listing review found: a malicious 'trial balloon' was accepted by 9 of 11 MCP registries; registries are not named in the public post.
   - Figures: “Malicious Marketplace Distribution (9 out of 11 MCP registries were successfully "poisoned" with a malicious trial balloon)” · “150M+ downloads” · “7,000+ publicly accessible servers” · “up to 200,000 vulnerable instances in total” · “Only Install MCP servers from verified sources (like the official GitHub MCP Registry) to avoid potentially malicious MCP servers and typosquatting attacks.”
   - Sample/method: Vendor research; submission of a benign PoC to 11 registries; per-registry results deferred to a gated eBook.
   - Limitations: No registry names, dates or submission method in the public post; headline figures unmethodised; vendor marketing.

14. **MCP by Design: RCE Across the AI Agent Ecosystem (CSA research note on the OX findings)** — Cloud Security Alliance AI Safety Initiative; secondary coverage also at https://venturebeat.com/security/mcp-stdio-flaw-200000-ai-agent-servers-exposed-ox-security-audit (VentureBeat, Louis Columbus, 2026-05-01) — 2026-04-20 (CSA); 2026-05-01 (VentureBeat)  
   <https://labs.cloudsecurityalliance.org/research/csa-research-note-mcp-by-design-rce-ox-security-20260420-csa/>  
   Adds method detail to OX's registry test (benign PoC producing an empty file, submitted to eleven registries, nine accepted 'without review'); VentureBeat adds that the research began November 2025 with more than 30 disclosures and recommends 'registries with documented submission review'.
   - Figures: “OX researchers submitted a benign proof-of-concept MCP — one that executes only a command producing an empty file — to eleven publicly accessible MCP registries and marketplaces. Nine of the eleven accepted the submission without review” · “VentureBeat: OX submitted a benign proof-of-concept to 11 registries, and nine accepted it without security review.” · “VentureBeat: began in November 2025 and included more than 30 responsible disclosure processes” · “VentureBeat: Use registries with documented submission review”
   - Sample/method: Secondary descriptions of OX's n=11 registry test
   - Limitations: Secondary; 'without review' is CSA/VentureBeat's characterisation; no registry identities.

15. **Microsoft MCP server certification - Microsoft Copilot Studio** — Microsoft Learn; certified list at https://learn.microsoft.com/en-us/connectors/connector-reference/connector-reference-mcpserver-connectors — ms.date 2026-06-02; updated 2026-08-03 (certification page); list page ms.date 2026-03-17, updated 2026-08-14  
   <https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-server-certification>  
   The most stringent documented pre-listing review found: verified-publisher eligibility (Partner Center business verification, must own the endpoint), automated validation, manual per-tool testing with credentials, adversarial Responsible-AI scenarios, and continuous post-certification monitoring; the connector-reference list holds 75 MCP server entries.
   - Figures: “Microsoft requires that they undergo a certification process before being made available to all users.” · “After you submit your package, Microsoft performs automated validation to verify schema correctness, metadata completeness, packaging integrity, and baseline policy compliance.” · “After automated validation, Microsoft conducts a manual review to assess MCP server functionality, security, compliance, telemetry, and responsible AI readiness. Each MCP tool is tested by using the provided credentials to confirm behavior matches documentation.” · “Microsoft evaluates the MCP server by using normal, edge‑case, and adversarial scenarios to validate safety, permission handling, and adherence to content policies.” · “Microsoft continuously monitors certified MCP servers for regressions, security issues, or policy violations and might take corrective action if it detects any.” · “If you're an independent publisher who doesn't own the underlying service, you're not eligible to submit directly.” · “List page: 75 'By:' publisher attributions counted on 2026-09-11 (page does not use the word 'certified')”
   - Sample/method: Vendor policy document; list count via text-pattern count of 'By:' on 2026-09-11
   - Limitations: Vendor self-description; no rejection, turnaround or takedown metrics; applies only to Microsoft 365 Copilot/Copilot Studio surfaces; 75-entry list is not labelled certified on its own page.

16. **Pre-submission checklist — What Anthropic reviewers test (with Submitting to the Connectors Directory)** — Anthropic (claude.com docs); submission page at https://claude.com/docs/connectors/building/submission; directory at https://claude.com/connectors — undated; fetched 2026-09-11  
   <https://claude.com/docs/connectors/building/review-criteria>  
   Documents a two-tier review for Anthropic's Connectors Directory: automated policy scan then default listing as a community connector, with automatic escalation of high-value listings to 'verified review' where reviewers functionally test every tool; requires tool annotations, OAuth 2.0, privacy policy, test credentials and seven policy acknowledgments; directory showed 796 connectors.
   - Figures: “When you submit a server, it is automatically scanned for policy compliance and, by default, listed in the directory as a community connector.” · “Anthropic may then escalate listings flagged as highly useful to Claude users to verified review, which is higher touch and slower; reviewers run a functional test of each tool. This escalation is assessed automatically” · “A single tool that accepts both safe HTTP methods (GET, HEAD, OPTIONS) and unsafe methods (POST, PUT, PATCH, DELETE) is rejected.” · “Tool descriptions are rejected if they: Instruct Claude to call external software or tools the user didn't request ... Contain hidden, obfuscated, or encoded instructions” · “Missing or incomplete privacy policies result in immediate rejection.” · “Seven policy acknowledgments covering the directory guidelines, first-party API usage, financial transactions, AI media generation, prompt injection, conversation data collection, and public documentation. All seven are required.” · “Submission requires A Team or Enterprise organization; escalation mcp-review@anthropic.com; Review times vary with queue volume.” · “claude.com/connectors: 796 connectors (2026-09-11)”
   - Sample/method: n/a (vendor policy documents)
   - Limitations: Undated; closed vendor directory, not an open registry; no takedown mechanics beyond the linked policy; no rejection statistics.

17. **Connector verification — Verified, Community, Custom (with Anthropic Software Directory Policy)** — Anthropic; policy at https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy — verification page undated; Software Directory Policy effective 2026-04-15  
   <https://claude.com/docs/connectors/verification>  
   Defines the meaning of Anthropic's labels (Verified is 'not a security audit'; Community is screened but not reviewed in depth) and the directory policy's initial-plus-ongoing review with removal for non-compliance, bans on guardrail circumvention, financial transactions and AI media generation, and mandatory OAuth 2.0 for authenticated remote servers.
   - Figures: “Verification means Anthropic has reviewed the connector more closely than a Community connector, but it is not a security audit or a guarantee of how the connector will perform.” · “Anthropic screens community connectors before listing, but has not reviewed this connector in depth.” · “once connected, a community connector has the same capabilities and access as any connector you grant.” · “Policy: We conduct both initial and ongoing reviews of Software, and may require developers to address compliance issues to continue being included in our Directories.” · “Policy: Remote MCP servers that connect to a remote service and require authentication must use secure OAuth 2.0 with certificates from recognized authorities.” · “Policy effective date: April 15, 2026”
   - Sample/method: n/a (vendor policy documents)
   - Limitations: Anthropic directories only; no counts; removal criteria stated without process or transparency data.

18. **docker/mcp-registry README and CONTRIBUTING (Docker MCP Catalog submission policy)** — Docker (GitHub); raw docs at https://raw.githubusercontent.com/docker/mcp-registry/main/README.md and https://raw.githubusercontent.com/docker/mcp-registry/main/CONTRIBUTING.md; repo MIT, created 2025-06-09 — undated docs; repo state 2026-09-11  
   <https://github.com/docker/mcp-registry>  
   Documented human review for the Docker MCP Catalog: PR-based submission, CI must pass, every PR reviewed by the Docker team, license restrictions, Docker-built images get signatures/provenance/SBOM; removal by GitHub issue; 328 server entries and 3,432 merged PRs as of 2026-09-11.
   - Figures: “Every pull request requires a review from the Docker team before merging.” · “Curated Quality: All MCP servers undergo review to ensure they meet quality and security standards” · “Make sure that the license of your MCP Server allows people to consume it. (MIT or Apache 2 are great, GPL is not).” · “image will include cryptographic signatures, provenance tracking, SBOMs, and automatic security updates. Otherwise, self-built images still benefit from container isolation but won't include the enhanced security features of Docker-built images.” · “To request modifications or removal of an existing MCP Server please open an issue explaining the reason for the edit/removal.” · “Non-compliant servers will be reviewed and may be removed from the registry.” · “servers/*/server.yaml count: 328 (git tree API, 2026-09-11); PRs: is:merged 3432; is:closed is:unmerged 310; is:open 1176; 551 stars”
   - Sample/method: Doc text plus GitHub git-tree and search API counts on 2026-09-11
   - Limitations: What the Docker review checks is not specified ('security best practices' undefined); no turnaround, rejection or takedown statistics; repo count may differ from Docker Hub catalog count.

19. **Docker MCP Catalog (docs) and 'Docker MCP Catalog: Discover and Run Secure MCP Servers' (blog)** — Docker; blog at https://www.docker.com/blog/docker-mcp-catalog-secure-way-to-discover-and-run-mcp-servers/ (Cody Rigney, Nuno Coracao) — docs undated; blog 2025-07-01  
   <https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/>  
   Describes the two-tier catalog (Docker-built signed servers with SBOM, provenance and continuous vulnerability scanning versus community-built images with container isolation only), a promised 'fast, transparent review process', publication within 24 hours of PR approval, and '300+ servers'.
   - Figures: “When your pull request is reviewed and approved, your MCP server is available within 24 hours” · “All servers are versioned with full provenance and SBOM metadata” · “Docker-built servers: Locally-running servers built and digitally signed by Docker for enhanced security” · “Instead of exposing all 300+ servers in the Docker catalog” · “Blog: We control the entire build pipeline, providing cryptographic signatures, SBOMs, provenance attestations, and continuous vulnerability scanning” · “Blog: Quality MCP servers that follow our security guidelines will be published quickly” · “Blog: 1 million pulls in just weeks”
   - Sample/method: n/a (vendor docs and marketing)
   - Limitations: Review criteria not published; pull count unmethodised; blog is 14 months old.

20. **Registry Inclusion Criteria and MCP Server Inclusion Criteria (Stacklok ToolHive)** — Stacklok (stacklok/toolhive-catalog); server rubric at https://raw.githubusercontent.com/stacklok/toolhive-catalog/main/docs/server-criteria.md; older variant at https://docs.stacklok.com/toolhive/concepts/registry-criteria — registry-criteria.md last committed 2026-06-24 (#1257); server-criteria.md last committed 2026-04-15; docs site 'Last updated on Sep 8, 2026'  
   <https://raw.githubusercontent.com/stacklok/toolhive-catalog/main/docs/registry-criteria.md>  
   The most granular written inclusion rubric found among MCP registries: open-source only (AGPL/GPL/LGPL excluded), Required/Expected/Recommended security scoring (SHA-pinned dependencies, no unpatched critical/high CVEs, provenance, CI scanning, SLSA, SBOM), red/yellow flags, an anti-'manufactured traction' rule added June 2026, Official vs Community tiers, manual team review plus automated validation, and periodic re-evaluation.
   - Figures: “Required -- Pinned dependencies and GitHub Actions pinned to SHAs.” · “\| No known unpatched critical/high CVEs \| Required \|; \| Software provenance (Sigstore / GitHub Attestations) \| Expected \|; \| Automated security scanning in CI \| Expected \|; \| SLSA compliance \| Recommended \|; \| Published SBOM \| Recommended \|” · “Issue response time: issues open for more than 3 weeks without any response is a red flag.” · “Both tiers are subject to the same criteria. Community health signals (stars, active maintainers, community adoption) are evaluated during review and during periodic re-evaluation to ensure entries continue to meet the criteria over time.” · “These are weighed signals rather than hard gates, but a cluster of them alongside a single maintainer and no real adoption is grounds to decline a submission” · “commit 2026-06-24 #1257: Make the inclusion bar explicit for two patterns seen repeatedly in recent submissions” · “docs site: Must be fully open source with no exceptions; We exclude copyleft and restrictive licenses such as AGPL, GPL2, and GPL3”
   - Sample/method: n/a (policy documents); commit dates via GitHub API 2026-09-11
   - Limitations: One small registry; criteria stated without evidence of enforcement consistency; no takedown procedure; docs-site variant drifts from repo text.

21. **MCP PR Reviewer Agent (stacklok/toolhive-catalog) and repository counts** — Stacklok; repo at https://github.com/stacklok/toolhive-catalog (created 2025-08-11; pushed 2026-09-11; 22 stars) — agent file last committed 2026-02-20; repo counts 2026-09-11  
   <https://raw.githubusercontent.com/stacklok/toolhive-catalog/main/.claude/agents/mcp-pr-reviewer.md>  
   Evidence of an LLM-based reviewer (model: sonnet) authorised to approve and squash-merge low/medium-risk server.json PRs after checking permissions, secrets marking, network scope, pinned image tags and trusted image registries; the catalog holds 111 ToolHive server.json entries, 85 'official' entries and 222 skills.
   - Figures: “description: Autonomous PR reviewer for MCP server updates and additions. Reviews PRs that modify server.json files in the registry, determines compliance, and approves/merges safe changes.” · “Version Update (Low Risk): Only the packages[0].identifier tag version changed; New MCP Server (Medium Risk); Configuration Change (Medium Risk)” · “Security checks: No filesystem paths in permissions; Secrets marked with isSecret: true; Network permissions appropriately scoped; Image tag pinned (not latest)” · “Be conservative - When in doubt, skip and let a human review” · “111 server.json under registries/toolhive/servers/; 85 under registries/official/servers/; 222 skill.json; stargazers_count 22 (2026-09-11)”
   - Sample/method: Agent definition file; GitHub git-tree API counts 2026-09-11
   - Limitations: Shows intended LLM review, not invocation frequency or effectiveness; reviews metadata only, not server code or container contents.

22. **How Glama indexes the MCP ecosystem (with Glama MCP Servers listing count)** — Glama (Frank Fiegel per modelcontextprotocol/servers ADDITIONAL.md); listing at https://glama.ai/mcp/servers — methodology undated ('twelve months preceding this writing'); listing count 2026-09-11 11:15  
   <https://glama.ai/mcp/methodology>  
   Glama's self-described post-ingest review: GitHub OAuth maintainer verification, builds executed in isolated Firecracker microVMs with syscall/network monitoring, 'Malicious' findings routed to internal review then maintainer contact or de-listing, failed builds withheld from distribution, and full re-publication of the official registry; listing shows 85,540 servers with A-D grades.
   - Figures: “Glama verifies that the submitter has write or admin access to the repository” · “inside an isolated Firecracker microVM” · “The server is routed to internal review. Depending on review outcome, the maintainer is contacted or the server is de-listed from the registry.” · “distribution is withheld: the server does not appear in search results, category listings, or recommendations” · “Glama ingests and re-publishes everything in the official registry” · “In the twelve months preceding this writing, Glama has performed over one million such scans.” · “Listing: 85,540 servers. Updated 2026-09-11 11:15; facets Official 5,448; Claimed 4,486” · “API: This endpoint requires an API key ... Use of this data is governed by the API Data License, which requires visible attribution to Glama”
   - Sample/method: Vendor self-description; scan count without method; listing count is the site's own figure
   - Limitations: Undated; no de-listing counts; 'one million scans' counts re-scans; 85k includes withheld/unbuildable listings; grades opaque; independent verification absent.

23. **Publish - Smithery Documentation (with Smithery Registry API counts)** — Smithery (Henry Mao per ADDITIONAL.md); markdown variant https://smithery.ai/docs/build/publish.md; API at https://registry.smithery.ai/servers?pageSize=1 — docs undated; API queried 2026-09-11  
   <https://smithery.ai/docs/build/publish>  
   Smithery's publish flow: URL (gateway-proxied) or MCPB bundle, a metadata-extraction scan that can be bypassed with a server-card.json, and a post-publish 'official-vendor verification checklist'; no human security review described. API: 14,006 servers, 191 verified, 10,713 deployed; per-server 'security' field null on every sampled server.
   - Figures: “Smithery scans your server to extract metadata (tools, prompts, resources) for your server page.” · “Bypass scanning entirely by serving a /.well-known/mcp/server-card.json endpoint on your server.” · “Once your server is published, open the server's Settings → Verification page to complete the automatic official-vendor verification checklist.” · “Bring your own hosting — Smithery Gateway proxies to your upstream server.” · “pagination.totalCount 14006 (later 14009); verified=true 191; isDeployed=true 10713 (2026-09-11)” · “detail endpoint: "security":null (all sampled servers); registry.smithery.ai/openapi.json 404”
   - Sample/method: Docs text; direct curl of registry API with filters 2026-09-11; ~8 detail records sampled
   - Limitations: Smithery registry is closed-source; 'verified' is an official-vendor badge, not a security review; absence of a described review on this page is not proof none exists (ToS not checked).

24. **cline/mcp-marketplace README (with API and issue counts)** — Cline (GitHub); raw at https://raw.githubusercontent.com/cline/mcp-marketplace/main/README.md; API https://api.cline.bot/v1/mcp/marketplace — README undated; repo pushed 2025-06-24; counts 2026-09-11  
   <https://github.com/cline/mcp-marketplace/blob/main/README.md>  
   A written manual-review policy (community adoption, developer credibility with identity verification, project maturity, security with extra scrutiny for finance/crypto, review 'within a couple of days') alongside evidence of a backlog: 199 listed servers versus 2,416 submission issues (2,226 open) and a repo untouched since June 2025.
   - Figures: “We verify the identity and reputation of maintainers, with preference given to established organizations and developers with verifiable professional backgrounds” · “We apply increased scrutiny to projects in sensitive domains (such as financial services) and require additional verification for cryptocurrency-related tools” · “Our team aims to review submissions within a couple of days.” · “api.cline.bot/v1/mcp/marketplace: list of 199 (2026-09-11)” · “issues: 2416 total, 2226 open; label:approved 0; repo pushed_at 2025-06-24T22:35:47Z”
   - Sample/method: README text plus GitHub search API and Cline API counts 2026-09-11
   - Limitations: No takedown policy; open-issue backlog is a proxy, not proof, of review throughput; API may exclude unlisted entries.

25. **Meet the GitHub MCP Registry (launch post) with live page and GitHub Docs** — GitHub (Toby Padilla); live page https://github.com/mcp; docs source https://raw.githubusercontent.com/github/docs/main/content/copilot/concepts/context/mcp.md — blog 2025-09-16 (updated 2025-09-18); live page and docs read 2026-09-11  
   <https://github.blog/ai-and-ml/github-copilot/meet-the-github-mcp-registry-the-fastest-way-to-discover-mcp-servers/>  
   GitHub MCP Registry is a curated partner directory (Figma, Postman, HashiCorp, Dynatrace at launch) with a promised self-publish path via the official registry; the live page embeds total 252 servers versus ~30,800 upstream, and GitHub Docs describe it as 'a curated list' in public preview with no stated acceptance criteria.
   - Figures: “launches with a curated directory” · “Developers will be able to self-publish MCP servers directly to the OSS MCP Community Registry. Once published, those servers will automatically appear in the GitHub MCP Registry.” · “github.com/mcp embedded JSON: "total":252 (2026-09-11); label 'All MCP servers'” · “code.visualstudio.com/mcp 302 -> aka.ms/vscode-mcp-registry-web 301 -> github.com/mcp?utm_source=vscode-website&utm_campaign=mcp-registry-server-launch-2025” · “GitHub Docs: The GitHub MCP Registry is a curated list of MCP servers from partners and the community.” · “GitHub Docs: currently in public preview and subject to change”
   - Sample/method: Vendor announcement; curl of page HTML and redirects 2026-09-11; docs source file
   - Limitations: No published vetting criteria or scanning statement; whether the automatic-appearance path shipped is not established (252 vs ~30k suggests not); page is client-rendered.

26. **Configure an MCP registry for your organization or enterprise (with MCP server usage in your company)** — GitHub Docs; source https://raw.githubusercontent.com/github/docs/main/content/copilot/concepts/enterprise/mcp-management.md — undated; read 2026-09-11  
   <https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-mcp-usage/configure-mcp-registry>  
   GitHub's enterprise model: self-hosted or Azure API Center registries following the v0.1 spec are a public-preview allowlist mechanism that GitHub itself calls less secure and 'not prioritized for development'; the GA method is a managed-settings.json file.
   - Figures: “This feature is in public preview and is not the recommended method for restricting access to MCP servers.” · “must follow the v0.1 MCP registry specification, including the following endpoints: GET /v0.1/servers” · “Custom registry: Public preview, not prioritized for development” · “Less secure matching, based on name or ID only. Users can bypass the restriction by editing configuration files.” · “Azure API Center provides a fully managed MCP registry with automatic CORS configuration, built-in governance features”
   - Sample/method: n/a (product documentation)
   - Limitations: Enterprise client-side allow-listing, not public listing review.

27. **Takedown request: io.github.jUXTAPOSITION1/vape (reported as malware delivery, 9 August; still active)** — modelcontextprotocol/registry issue #1563 (opened by imran-siddique, closed by maintainer rdimitrov); API record at https://registry.modelcontextprotocol.io/v0/servers/io.github.jUXTAPOSITION1%2Fvape/versions?include_deleted=true; trigger report https://www.ox.security/blog/shai-hulud-outbreak-debrief-the-worm-evolves-into-mcp/ (OX Security, 2026-08-09) — opened 2026-08-21; closed 2026-09-05; API statusChangedAt 2026-09-05T21:55:42Z  
   <https://github.com/modelcontextprotocol/registry/issues/1563>  
   The only end-to-end documented moderation takedown on the official registry: entry published 2026-08-08, OX Shai-Hulud report 2026-08-09 (payload in repo .vscode/.claude settings, PyPI package clean), GitHub blocked the repo 2026-08-15, issue filed 2026-08-21, all versions marked deleted 2026-09-05; the reporter read all 735 statusMessages among 24,615 records and found none describing a moderation action; the maintainer flags that publishers can reverse moderation takedowns.
   - Figures: “published 2026-08-08T20:58:40.591925Z, currently status: active, isLatest: true” · “{"block":{"reason":"tos","created_at":"2026-08-15T00:32:55Z"}}” · “Across all 24,615 records (version=latest&include_deleted=true), 735 carry a statusMessage: 491 of 539 deleted, 244 of 253 deprecated. I read all 735. None of them describes a moderation action” · “rdimitrov 2026-09-05: Taken down: all registered versions of io.github.jUXTAPOSITION1/vape (currently 1.1.1) are now marked deleted, with a statusMessage citing the OX Security report, GitHub's repository block, and this issue.” · “rdimitrov: The distinction between publisher retirement and moderation actions deserves a separate issue, including how to prevent publishers from reversing moderation takedowns.” · “API: status deleted; statusMessage: Removed under the malware moderation policy following the OX Security report of malicious workspace configuration in the linked repository. GitHub has blocked the repository. See https://github.com/modelcontextprotocol/registry/issues/1563” · “OX: The PyPI package linked by the MCP server is completely clean to evade automated package scanners.” · “OX: this marks the first time we observed a Shai-Hulud payload being delivered directly through the official Model Context Protocol (MCP) Registry”
   - Sample/method: Issue thread and live API record; reporter's own API walk (24,615 records) and manual reading of 735 statusMessages
   - Limitations: n=1 takedown; the 27-day report-to-deletion interval is derived, not stated; reporter's audit self-reported; PyPI packages not yanked at filing.

28. **Takedown request: com.clauxel.equiblesagent/equiblesagent-mcp (remote host does not resolve; repository has no implementation)** — modelcontextprotocol/registry issue #1558 (daniel3303) — opened 2026-08-20; open with 0 comments as of 2026-09-11  
   <https://github.com/modelcontextprotocol/registry/issues/1558>  
   A second takedown request (non-functioning server, DNS record absent, docs-only repo, published 2026-05-27) with no maintainer response after 22 days, illustrating handling of the 'non-functioning' removal ground.
   - Figures: “Entry published 2026-05-27” · “no DNS record at all” · “0 stars; 0 comments; state open”
   - Sample/method: n/a (single issue)
   - Limitations: Single open issue; lack of response is weak evidence of policy.

29. **Request: delete 7 servers under network.tenzro (publisher no longer controls the verifying domain)** — modelcontextprotocol/registry issue #1500 (hilarl); comment by Nikolife2016 2026-09-02 — opened 2026-08-03; open with 1 comment as of 2026-09-11  
   <https://github.com/modelcontextprotocol/registry/issues/1500>  
   Shows a publisher unable to self-delete after losing the verifying domain, and a community RDAP/DNS sweep of all 8,193 domain-namespace entries finding about 35 domains (43 entries) re-registrable within weeks; no maintainer response after a month.
   - Figures: “8 193 entries on 6 227 unique registrable domains (the 17 992 io.github.*/com.github.*/GitLab entries are OAuth-proven and out of scope)” · “free right now 1 domain 2 entries; expired: redemption / pendingDelete 4 domains 10 entries; expired: autoRenewPeriod 30 domains 31 entries; expiring by 2026-10-02 62 domains 64 entries; clientHold 2 domains 2 entries; OK 5 786 domains 7 608 entries; ccTLDs unchecked 342 domains 476 entries” · “about 35 domains covering 43 server entries can be re-registered by anyone within weeks (one immediately)” · “dig +short mcp.tenzro.network -> 91.195.240.94 (Server: Parking/1.0)”
   - Sample/method: Commenter's read-only RDAP status + DNS check of every domain-based namespace, 2026-09-02; scripts sent privately, not published
   - Limitations: Sweep data unverifiable; no maintainer response; 342 ccTLD domains unchecked.

30. **One domain holds 75 registry entries under 75 separately-registered namespaces, and 62 of them serve text/html** — modelcontextprotocol/registry issue #1488 (siliroid); comment by ppcvote 2026-07-31; no maintainer reply — 2026-07-28  
   <https://github.com/modelcontextprotocol/registry/issues/1488>  
   Documents that DNS namespace verification is one-time and apex-wide (a single TXT record grants com.clauxel.*), with 75 entries from one domain of which 62 do not speak MCP, and a non-maintainer code search finding no periodic re-verification logic.
   - Figures: “clauxel.com has 75 endpoints in the registry, published under 75 distinct publisher namespaces” · “405 to a POST, serves text/html on GET: 62; 404: 6; 401: 4; completes an MCP initialize handshake: 3” · “Verification happens once, at token exchange (ExchangeToken → LookupTXT → hasMCPRecord) ... a code search for revalidate / reverify / recheck / periodic returns nothing” · “clauxel.com (apex) MCPv1 TXT present now? no — only SPF and a Google site-verification record” · “seven of the eight [control domains] still publish a live MCPv1 record”
   - Sample/method: Probe of all registry remotes (10,540 of 10,542 reached); DNS via two DoH resolvers; code reading of main; control arm n=8
   - Limitations: Single-domain case; re-verification absence asserted by a non-maintainer; author sells a commercial audit service.

31. **MCPJacking: 155 Hijackable MCPs Discovered Live in the Official MCP Marketplace** — AIR Security (Nadav Dadush, Eliad Mualem, Roi Snir) — 2026-08-27 (modified 2026-09-01)  
   <https://www.air.security/blog-posts/mcpjacking>  
   Exploit-backed evidence that the official registry performs no post-listing liveness or ownership re-check: 155 entries whose domains expired were re-registrable, and the authors registered one and served their own MCP under the original listing.
   - Figures: “We discovered 155 hijackable MCPs in the official worldwide marketplace used by millions of agents.” · “Each relied on an expired domain, so we simply registered them, published our own MCPs and gained full remote prompt execution on every agent that trusted them.” · “Official Registries provide no inherent protection. A registry listing is a static snapshot and does not confirm who controls the service or if it remains legitimate.” · “MCPs die. Their registry entries don't.”
   - Sample/method: Proprietary 'AIR Filter' scan of the official registry; scan date, total scanned and hijackability criteria not stated
   - Limitations: Vendor post with product pitch; 155 not substantiated in body; no disclosure or takedown timeline.

32. **Official MCP Registry API (full cursor walk, latest versions)** — registry.modelcontextprotocol.io (own measurement) — 2026-09-11  
   <https://registry.modelcontextprotocol.io/v0.1/servers?limit=100&version=latest>  
   Entry counts and composition of the official registry on the sweep date, including the hidden 'deleted' population.
   - Figures: “default walk: total 30873, active 30539, deprecated 334, 309 pages (2026-09-11)” · “include_deleted walk: total 31583, deleted 709, active 30540, deprecated 334” · “remotes 18591; statusMessage on 324 non-deleted entries” · “package registryType: npm 8707, pypi 3697, mcpb 1169, oci 903, nuget 111, cargo 49” · “namespaces: io.github 20802 of 30873; ai.smithery 213; uk.co 212; app.wishpool 125; eu.ansvar 106; io.usefulapi 98”
   - Sample/method: Own cursor walk of /v0.1/servers?limit=100&version=latest and &include_deleted=true, 625 requests, script at /var/tmp/nl-mcp/verify-registries-a1/walk.py
   - Limitations: Point-in-time; grows ~40 entries/hour; the 709 deleted entries are not classified as self-deletion vs moderation.

33. **mcp-registry-growth data/analytics.csv** — dend/mcp-registry-growth (GitHub; 10 stars; no license; created 2025-09-16) — rows 2025-09-16T20:21:46Z to 2026-09-11T08:50:30Z  
   <https://raw.githubusercontent.com/dend/mcp-registry-growth/main/data/analytics.csv>  
   The longest longitudinal count series of the official registry: 7,057 rows from 238 unique servers at launch to 30,848 unique (100,132 version records) on 2026-09-11.
   - Figures: “2025-09-16T20:21:46.692Z: total 345, unique 238” · “2025-12-01: total 2256, unique 934” · “2026-03-01: total 7318, unique 2781” · “2026-06-01: total 31472, unique 10381” · “2026-09-01: total 86929, unique 26053” · “2026-09-11T08:50:30.431Z: localCount 70212, remoteCount 40235, total 100132, unique 30848”
   - Sample/method: PowerShell pagination of /v0/servers via nextCursor several times daily; totalCount = version records; uniqueCount = distinct names
   - Limitations: Hobby project; legacy /v0 endpoint; whether deleted entries are excluded not verified.

34. **Census of the registry: 25,125 distinct servers from 82,994 version records (with MCP Registry Census dataset)** — GitHub Discussion by ashishsinha1602; daily dataset at https://huggingface.co/datasets/Ashsinha1/mcp-registry-census (MIT) — discussion 2026-08-27, corrected 2026-09-02; dataset baseline 2026-08-28, updated daily  
   <https://github.com/modelcontextprotocol/registry/discussions/1580>  
   Independent census of the official registry with publisher concentration and data-quality counts (no repository, no transport, deprecated-still-listed, template placeholders) and a daily 13-metric health series.
   - Figures: “82,994 version records over 830 pages; 25,125 distinct servers; 15,468 publishers” · “13,848 publishers (89.5%) have registered exactly one server; ten largest account for 15.7%” · “5,643 servers (22.5%) have no repository link” · “Correction (Sep 2, 2026): the unreachable count is 189, not 393” · “commenter: 1,314 servers declare a remote endpoint that is hard-unreachable (620 DNS-dead, 609 HTTP 404, 85 TLS failures), against 2,556 more that are auth-walled” · “dataset 2026-08-28: version_records 84,241; distinct_servers 25,423; publishers 15,709; deprecated 268; no_transport 394; no_repository 5,755; max_versions_one_server 1,175; dup_desc_correct_pct 3.56%”
   - Sample/method: Full crawl of GET /v0/servers by cursor, dedup by isLatest; daily automated re-fetch for the dataset
   - Limitations: Official registry only; single individual; counts drift daily; no policy content.

35. **Registry Descriptions Go Stale Unevenly: An 89-Day Measurement of Model Context Protocol Drift** — arXiv; Gautam Bharti (independent); dataset Zenodo 10.5281/zenodo.21709945 — v1 2026-08-02; v2 2026-08-04  
   <https://arxiv.org/abs/2608.00997>  
   Longitudinal measurement of the official registry (120 observations, 2026-04-30 to 2026-07-28, 19,099 servers) confirming namespace binding (71.8% io.github.*), the 100-character description cap, publishedAt rewriting, and reappearance of deleted names; notes prior audits are single-snapshot.
   - Figures: “120 observations of the official MCP registry over 88.6 days, covering 19,099 distinct servers as it grew from 3,510 to 18,966” · “71.8% of them under io.github.*, which the registry binds to the corresponding GitHub account, the rest under DNS-verified domains” · “we record 778 reappearance events across 764 distinct names, 14 of which vanished and returned more than once” · “Of the 778 reappearances, 12 (1.5%) returned with a different description hash and 43 (5.5%) with a different descriptor hash” · “the most active 5% generate 61% of all change events” · “14,096 (75.2%) recorded zero descriptor changes in the whole window”
   - Sample/method: Author's pipeline syncing the registry every four hours; SHA-256 content-hash panel
   - Limitations: Single registry; content hashes only, cannot see moderation or ownership; v2 corrected five v1 claims.

36. **What a Random Draw from the MCP Registry Contains, and What Tool-Use Benchmarks Contain Instead** — arXiv; Haseeb Mohammed Afsar (independent); code github.com/itguruhaseeb/mcp-probe — v1 2026-09-10  
   <https://arxiv.org/abs/2609.10962>  
   A seeded random-sample functional census of the official registry (24,135 entries at 2026-08-22): under half of npm/stdio servers complete a handshake, evidence that listing implies no functional check.
   - Figures: “From a 24,135-server registry census we draw 400 npm / stdio servers with a published seed” · “7,258 candidates at the 2026-08-22 snapshot” · “Included (handshake completed) 195 48.8%; Excluded: handshake failed 150 37.5%; needs credentials 53 13.3%; package unavailable 2 0.5%” · “zero fatal JSON Schema violations across 2,766 advertised tools” · “tool-level omission rate 58.8% on the random draw against 41.5% on the curated frame (n = 24)”
   - Sample/method: Full cursor-paginated census; seeded draw of 400 from 7,258 npm/stdio servers; single probe each without credentials
   - Limitations: Official registry only; tiny curated comparison frame; no moderation content.

37. **State of the MCP Ecosystem — July 2026** — MCP Queen (Health AI) — July 2026  
   <https://mcpqueen.com/reports/state-of-mcp-2026-07>  
   Vendor probe index of the official registry: 18,849 servers, 17.2% of remote servers dead, 55.8% of reachable remotes open without auth; states 'Listing is not verification'.
   - Figures: “18,849 servers in the official MCP registry (18,650 marked active).” · “9,312 (49.9%) advertise a remote endpoint. The other 9,338 are local-install only” · “43,320 live probes of 9,326 remote servers: 7,723 (82.8%) are reachable right now. 1,603 (17.2%) are dead” · “Grades: A 4,956 (53.1%), B 143 (1.5%), C 1,501 (16.1%), D 918 (9.8%), F 1,808 (19.4%)” · “5,201 servers (55.8%) are open: no auth required.” · “Listing is not verification.”
   - Sample/method: Registry metadata plus 43,320 protocol probes of 9,326 remote servers; rubric weights published; CSV and API
   - Limitations: Official registry only; operational liveness not security; vendor-published; no exact dates.

38. **The State of MCP Security: March 2026** — NimbleBrain (Mat Goldsborough) — 2026-03-11  
   <https://nimblebrain.ai/blog/state-of-mcp-security-2026/>  
   An earlier snapshot of the official registry (2026-03-04): 8,074 entries / 3,012 unique servers, 15.4% without source, plus the note that unofficial marketplaces index 'upwards of 17,000'.
   - Figures: “8,074 total entries across 3,012 unique servers” · “84.6% have source code available. The remaining 15.4% are either remote-only hosted services (10.6%) or completely opaque (4.8%).” · “8.5% of MCP servers use OAuth (attributed to Astrix Security)” · “unofficial marketplaces index upwards of 17,000 MCP servers”
   - Sample/method: Official registry API, 2026-03-04, latest version per server, metadata-field classification
   - Limitations: Single registry; metadata only; OAuth figure secondhand.

39. **Emerging Risks: Typosquatting in the MCP Ecosystem** — UpGuard (Greg Pollock) — 2026-07-02  
   <https://www.upguard.com/blog/typosquatting-in-the-mcp-ecosystem>  
   A vendor study that labels four registries by moderation level (GitHub 'Highly Moderated / Official Only'; Smithery 'Mixed Moderation'; official registry 'Emerging / Inconsistent Verification'; MCP.so 'Unmoderated / High Risk') and measures brand lookalikes across them.
   - Figures: “we analyzed 18,000 Claude Code settings files collected from public GitHub repositories” · “GitHub MCP Registry: containing only 57 official entries from established service providers” · “Smithery: over 3,500 servers ... our sample of 847 servers showed that only 8% of the servers carried this badge. The remaining 92% are unverified” · “Official MCP Registry: hosts about 1,000 servers. It currently lacks a formal "verified" property” · “MCP.so: over 17,000 servers” · “For every official brand server, we found between 3 and 15 unverified lookalikes using the same brand names.” · “lookalikes for just these brands account for 10–16% of all MCP servers across the registries we studied.”
   - Sample/method: 18,000 public Claude Code settings files; 43 brand keywords across four registries; 847-server Smithery sample; collection date not stated
   - Limitations: Vendor blog; moderation labels are the author's characterisation; 'about 1,000' official-registry figure conflicts with other snapshots; brand list unpublished.

40. **Best MCP Registries in 2026: Compared for Developers and Enterprises** — TrueFoundry (Ashish Dubey) — 2026-08-21  
   <https://www.truefoundry.com/blog/best-mcp-registries>  
   A recent vendor comparison of the official registry, Smithery, Glama, MCP Market and MCP.so with per-registry review remarks; its comparison table columns are enterprise features rather than review policy.
   - Figures: “MCP Market: No assurance of quality or security (in that all listings are community submitted, there appear to be no formal review processes in place).” · “MCP Market: No namespace verification or publisher authenticated as in the case of the official MCP registry” · “Glama: security checks rely entirely on the corresponding package repositories” · “Official registry: No built-in curation, ratings, or governance features” · “Smithery: over 7,000 available servers; MCP Market: over 10,000; MCP.so: over 19,000 servers submitted”
   - Sample/method: Descriptive vendor comparison; counts undated
   - Limitations: Promotes TrueFoundry's own registry; 'no formal review' is inference; the Glama remark contradicts Glama's own methodology page; no takedown discussion.

41. **MCP Registry Research (zowe/zowe-mcp)** — Zowe / Open Mainframe Project (Petr Plavjaník) — self-dated March 2026; last committed 2026-04-23  
   <https://raw.githubusercontent.com/zowe/zowe-mcp/main/docs/mcp-registry-research.md>  
   A practitioner's ten-registry table with a 'Security' column and the statement that the GitHub MCP Registry has no self-service submission (manual approval via partnerships@github.com); also claims official-registry metadata propagates to PulseMCP, Glama and mcp.so within hours.
   - Figures: “A curated hand-picked list of ~91 servers maintained by GitHub (March 2026) ... GitHub manually approves which servers appear here.” · “To be listed: publish to the official registry first, then email partnerships@github.com. GitHub reviews and approves. There is no self-service submission — GitHub reviews manually.” · “mcp.so \| 17,186+; PulseMCP \| 6,970+; Cursor Directory \| 1,800+; Smithery \| 3,300+ verified \| Own security model; 2025 had a breach exposing 3,000+ server configs; Glama \| 9,000+ \| Firecracker VMs, best in class; Apify \| 7,000+ \| Standard; MCPize \| 100+ \| Standard; RapidAPI MCP \| 2M+ APIs \| Standard” · “Publishing to the official registry automatically propagates metadata to PulseMCP, Glama, and mcp.so within a few hours. Smithery requires a separate publish step.”
   - Sample/method: Unsourced point-in-time readings, March 2026
   - Limitations: Internal project doc, not peer-reviewed; counts unsourced; 'Security' column mostly 'Standard'; no takedown or scan description.

42. **2026年国内MCP广场大盘点：8大平台横评** — 啊靓啊笔记 (alianga.com, handle zml2015); counts attributed to platform.iflow.cn — 2026-03-14  
   <https://alianga.com/articles/mcp-servers>  
   The only comparison of Chinese MCP marketplaces found: eight platforms with counts and one-line governance remarks (Baidu MCP World 'stricter review', Aliyun Bailian 'sandbox isolation').
   - Figures: “魔搭社区 MCP 广场（阿里云）: 上架 9227+ 款 MCP 服务; 上线时间 2025 年 4 月 15 日” · “百度 MCP World: 目前已收录 56757 个; 不足：审核流程相对严格; 通过审核的服务可免费托管在千帆平台” · “阿里云百炼: 目前已上线 184 个; 沙箱隔离，安全性高” · “腾讯云 MCP 广场: 收录 1089 个; 讯飞星辰: 收录 16318 个; MCP 星球 (mcpmarket.cn): 54,555 +; AIbase: 13784 +; 心流开放平台: 3852” · “本文的 MCP 工具数据来自该平台 (platform.iflow.cn)”
   - Sample/method: Second-hand counts from the iFlow open platform; no collection date beyond article date
   - Limitations: Blog; counts unaudited; governance remarks are impressions, not policy quotes.

43. **ModelScope MCP servers listing API** — ModelScope (Alibaba) — 2026-09-11 (live query)  
   <https://www.modelscope.cn/openapi/v1/mcp/servers>  
   Entry count for the largest verifiable Chinese marketplace: 12,436 servers, 4,599 hosted; records carry no verification or scan field.
   - Figures: “"total_count":12436 (no filter)” · “"total_count":4599 (filter is_hosted:true)” · “record fields: id, publisher, name, chinese_name, description, tags, logo_url, view_count, locales, categories”
   - Sample/method: PUT /openapi/v1/mcp/servers with page_size 2, 2026-09-11
   - Limitations: Self-reported count including mirrored entries; submission/review policy docs are JS-rendered and were not captured.

44. **腾讯云开发者 MCP 广场介绍** — Tencent Cloud — 最近更新时间 2026-08-13  
   <https://cloud.tencent.com/document/product/1212/123193>  
   A closed, operator-curated catalog: lists Tencent-official and popular third-party servers but third parties cannot currently submit or update listings; offers local and hosted modes.
   - Figures: “针对第三方 MCP 产品，目前暂不提供上架与更新服务。” · “汇集了腾讯官方和热门第三方的 MCP，致力为 AI 爱好者提供“安全可靠、简单易用”的 MCP 服务”
   - Sample/method: n/a (vendor documentation)
   - Limitations: No count, no description of review applied to the third-party servers Tencent chooses to list, no takedown policy.

45. **카카오 'PlayMCP', 오픈소스 AI 에이전트 '오픈클로' 연동 지원** — Kakao Corp (press release) — 2026-05-01  
   <https://www.kakaocorp.com/page/detail/12012>  
   Existence and approximate scale of Kakao's PlayMCP platform (~200 external servers); the reported registration-and-review step is not on this page.
   - Figures: “PlayMCP는 개발자들이 다양한 MCP 서버(도구)를 자유롭게 등록하고 실험할 수 있는 플랫폼” · “약 200여 개의 외부 MCP 서버들이 업로드 되어 있다”
   - Sample/method: n/a (press release)
   - Limitations: Review process unverified (guide pages are JS-only); count approximate.

46. **Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions** — arXiv; Xinyi Hou, Yanjie Zhao, Shenao Wang, Haoyu Wang (HUST); FSE 2026 journal-first per conference listing (TOSEM DOI not verifiable from arXiv record) — v1 2025-03-30; v3 2025-10-07  
   <https://arxiv.org/abs/2503.23278>  
   The broadest registry inventory in the literature (Table 2: 26 collections with operator, mode and count as of Sept 2025) plus two sentences on review (MCP.so lacks verification; mcp-get signs but has few verified servers) and a 300-entry MCP.so reliability sample.
   - Figures: “Table 2 (As of Sept. 2025): MCPWorld Baidu 26,404; MCP.so 16,592; MCP Servers Repository 13,596; AIbase 12,448; Glama 9,415; Smithery 6,888; PulseMCP 6,072; ModelScope 5,441; Awesome MCP Servers wong2 2,402; Cursor Directory 1,800; Official Collection Anthropic 1,204; AiMCP 907; Dockmaster 516; MCP Market 463; MCP.run 242; appcypher 217; CLine MCP Marketplace 154; Bailian 151; OpenTools 148; Awesome Remote MCP Servers 79; MCP Server Hub 71; mcp-get 59; Higress 50; Toolbase 24; mkinf 23; Awesome Crypto MCP Servers 12” · “Platforms like MCP.so host thousands of entries but lack formal security or identity verification mechanisms” · “platforms such as mcp-get implement verification and signing processes, but the number of verified servers remains very small and user adoption is limited” · “we randomly sampled 300 servers listed on MCP.so. Among them, 30 contained the term 'MCP' in the project title but did not refer to the Model Context Protocol, and 18 were in active development or unavailable” · “Table 4 (As of Sept. 2025): Smithery CLI Henry Mao 7,437 servers”
   - Sample/method: Platform-reported totals cross-checked against listings, manual counts where missing; random sample of 300 MCP.so entries
   - Limitations: Counts are platform marketing figures; review remarks are two sentences; no per-registry comparison; journal attribution unverified.

47. **A Measurement Study of Model Context Protocol Ecosystem** — arXiv; Hechuan Guo, Yongle Hao, Yue Zhang, Minghui Xu, Peizhuo Lv, Jiezhi Chen, Xiuzhen Cheng (Shandong University; NTU) — v1 2025-09-29; v3 2025-11-15  
   <https://arxiv.org/abs/2509.25292>  
   A marketplace comparison table (API/SDK, deployment, versions, server counts for six markets) and a validity crawl showing over half of raw registry entries are noise; no review or moderation analysis.
   - Figures: “Table 1: Smithery 5,625; MCP.so 15,704; Glama 7,675; MCP Market 13,830; Cursor Directory 1,560; PulseMCP 5,264” · “Over a 14-day campaign, MCPCrawler aggregated 17,630 raw entries, of which 8,401 valid projects (8,060 servers and 341 clients) were analyzed” · “in MCP.so, just 7,223 of 16,646 (43.4%) server records passed validation, while MCP Market fared even worse at 26.4% (3,765 of 14,280)” · “32.3% appearing in more than one platform ... only 5.5% of projects are indexed broadly (in four or more markets)”
   - Sample/method: MCPCrawler over six markets, days between 2025-07-26 and 2025-09-12; rule-based validity filter
   - Limitations: Zero hits for 'vetting' or 'moderat'; Table 1 attributes lightly sourced; internal count inconsistency.

48. **Rethinking MCP Security: A Large-Scale Study of Runtime MCP Servers and Security Scanner Reliability** — arXiv; Pei Chen, Baichao An, Mengying Wu et al. (Fudan University / Shanghai Innovation Institute) — v1 2026-07-13  
   <https://arxiv.org/abs/2607.11086>  
   The largest multi-market crawl (MCPZoo: 156,842 raw entries from ten markets, Dec 2025) with cross-market overlap figures; asserts markets 'differ in their listing policies' without documenting any.
   - Figures: “Table 2 Raw/Valid/Dynamic: MCP Store 39,770/28,960/14,870; MCP World 31,046/25,519/14,655; MCP Market 16,168/14,127/8,741; MCP Repository 14,341/12,263/8,066; AI Base MCP 11,120/9,275/6,154; NPM 18,560/8,295/4,759; Pulse MCP 6,885/6,248/4,415; MCP.so 6,772/5,241/3,429; PyPI 9,023/2,371/1,151; Simthery 3,157/1,628/967; Total 156,842/113,927/67,207; Unique –/64,611/37,288” · “These markets are curated independently and differ in their listing policies, update frequency, and presentation formats” · “Although an official registry has been established by the protocol proposer Anthropic, it currently indexes only part of the MCP servers compared to the wild” · “PulseMCP shows the highest, with 91% of its servers also appearing on MCP Store” · “96.89% of interactable servers are flagged as risky by at least one scanner; manual validation shows that less than 50% of sampled alerts are true positives”
   - Sample/method: Ten markets accessed 2025-12; automated deployment and protocol verification; eight scanners evaluated
   - Limitations: Policy differences asserted, not documented; npm/PyPI treated as markets; single snapshot.

49. **Model Context Protocol (MCP) at First Glance: Studying the Security and Maintainability of MCP Servers** — arXiv; Mohammed Mehedi Hasan, Hao Li, Emad Fallahzadeh, Gopi Krishnan Rajbahadur, Bram Adams, Ahmed E. Hassan (Queen's University); full text header 'Journal: TOSEM' — v1 2025-06-16; v5 2026-04-13  
   <https://arxiv.org/abs/2506.13538>  
   The only academic text that describes specific registries' review steps (Glama manual review in an isolated VM plus dependency scans; Smithery automated analysis raising Dockerfile PRs) — one sentence each, sourced to a reddit post — and argues these miss credential exposure and tool poisoning.
   - Figures: “we evaluate 1,899 open-source MCP servers (dataset as of Jun 1, 2025: 343 from the official collection plus 1,556 mined)” · “While some registries implement basic review processes (e.g., isolated manual testing or simple pull requests), these are often limited to infrastructure setup or package-level scans. For instance, Glama performs manual review in an isolated VM and scans the server for Python and NPM dependencies and Smithery performs automated analysis of the MCP server code and raises simple pull requests to create Dockerfiles or any obvious missing dependencies. However, these checks fail to capture issues like credential exposure or MCP-specific tool poisoning.” · “7.2% of servers contain general vulnerabilities and 5.5% exhibit MCP-specific tool poisoning” · “credential exposure being the most prevalent (3.6%)”
   - Sample/method: 1,899 open-source servers; SonarQube plus an MCP-specific scanner; Glama description cited to https://www.reddit.com/r/mcp/comments/1hm3g2s/glama_mcp_server_directory/
   - Limitations: Registry review coverage is two registries, one sentence each, not sourced to vendor policy; TOSEM DOI not verifiable from arXiv.

50. **Securing the Model Context Protocol (MCP): Risks, Controls, and Governance** — arXiv; Herman Errico (Vanta), Jiquan Ngiam (MintMCP), Shanita Sojan (Darktrace) — 2025-11-25  
   <https://arxiv.org/abs/2511.20920>  
   A practitioner statement that official-registry admission is ownership proof only and that listing should not be read as vetting; proposes internal vetting pipelines; documents the Postmark incident.
   - Figures: “Registry admission requires only proof of GitHub repository or domain ownership [31]: it does not require code review, security audit, or malware scanning. A server listed in the official registry is no more trustworthy than any other community package, yet users may incorrectly assume registry presence implies vetting.” · “In September 2025, an unofficial Postmark MCP server with 1,500 weekly downloads was modified to add a BCC field to its send_email function, silently copying all emails to the attacker's address” · “The 'mcp-remote' package, with over 437k downloads, was susceptible to remote code execution (CVE-2025-6514)”
   - Sample/method: Non-empirical governance paper; registry claim cites modelcontextprotocol.info (unofficial mirror)
   - Limitations: Vendor authors with commercial interest in private registries; no comparison.

51. **Evolution of AI Agent Registry Solutions: Centralized, Enterprise, and Distributed Approaches** — arXiv; Aditi Singh, Abul Ehtesham, Mahesh Lambe et al. incl. Ramesh Raskar (MIT, Northeastern, Cisco) — v1 2025-08-05; v3 2025-10-20  
   <https://arxiv.org/abs/2508.03095>  
   A qualitative architectural comparison of five agent/tool registries (MCP Registry, A2A cards, AGNTCY ADS, Entra Agent ID, NANDA) confirming the MCP Registry accepts metadata only from authenticated identities and does no package scanning.
   - Figures: “The registry only accepts metadata from authenticated GitHub identities and, for domain-scoped namespaces, from DNS-verified domains. It does not host executable code; instead it holds metadata only, inheriting code-level security from established registries (npm, PyPI, DockerHub)” · “with no package hosting or scanning to maintain” · “validation logic resides with the publisher”
   - Sample/method: n/a (qualitative comparison)
   - Limitations: Cross-protocol, not cross-MCP-catalog; describes the mid-2025 preview design; Cisco/AGNTCY authors.

52. **"MCP Does Not Stand for Misuse Cryptography Protocol": Uncovering Cryptographic Misuse in Model Context Protocol at Scale** — arXiv; Biwei Yan, Yue Zhang, Minghui Xu, Hao Wu et al. (Shandong University; Nanjing University) — 2025-12-03  
   <https://arxiv.org/abs/2512.03775>  
   Per-market breakdown of a code-quality finding across seven registries, invoking 'curation standards' as an explanatory variable without documenting them.
   - Figures: “Applying MICRYSCOPE to 9,403 MCP servers, we identified 720 with cryptographic logic, of which 19.7% exhibited misuses” · “Mcpmarket dominates the ecosystem overall (3,196 servers, more than double the next-largest Smithery Registry with 2,538), its share of misuses (37%) is slightly lower than Smithery's (42%)” · “Pulse MCP, with 1,999 servers, contributes 10% of the misuses”
   - Sample/method: 9,403 servers from GitHub and seven registries (undated); static taint analysis; manual validation of 142 flagged and 100 unflagged
   - Limitations: Curation standards never described; no per-market dedup; collection date absent.

53. **Don't believe everything you read: Understanding and Measuring MCP Behavior under Misleading Tool Descriptions** — arXiv; Zhihao Li, Boyang Ma, Xuelong Dai, Minghui Xu, Yue Zhang, Biwei Yan, Kun Li (Shandong University) — 2026-02-03  
   <https://arxiv.org/abs/2602.03580>  
   RQ4 asks whether description-code consistency differs across marketplaces 'with different governance and distribution models' and reports per-market rates, but never characterises the governance models.
   - Figures: “apply it to 10,240 real-world MCP Servers across 36 categories ... approximately 13% exhibit substantial mismatches” · “smithery Full Match approximately 56.6% (1,899/3,357); mcp_world 48.8% (2,841/5,819); mcpmarket 50.4% (1,788/3,545)” · “the 'Official' category's Full Match rate is only about 41.5%”
   - Sample/method: MCPDiFF static analysis over 10,240 servers from three marketplaces; date not stated
   - Limitations: Governance is a label, not an analysed variable.

54. **How are AI agents used? Evidence from 177,000 MCP tools** — arXiv; Merlin Stein (UK AI Security Institute, University of Oxford) — 2026-03-25  
   <https://arxiv.org/abs/2603.23802>  
   A usage study choosing Smithery over the official registry for its API and size, noting the official registry was 'an order of magnitude smaller' as of 02/2026 (later contradicted by mid-2026 counts).
   - Figures: “We chose Smithery due to its permissive registry API and size, compared to other registries. For example, the official MCP registry is an order of magnitude smaller compared to Smithery, as of 02/2026” · “we evaluated 177,436 agent tools created from 11/2024 to 02/2026” · “Smithery MCP registry (n = 2,437 in the final dataset); GitHub (n = 16,956 MCP servers)”
   - Sample/method: GitHub search, Smithery API, official servers repo list and awesome-mcp-servers
   - Limitations: No count given for the official registry; no policy analysis.

55. **Submit your project - MCP.so (with mcp.so/servers facet counts and homepage FAQ)** — MCP.so (chatmcp; repo chatmcp/mcpso Apache-2.0, 2,105 stars, pushed 2025-03-26); listing https://mcp.so/servers; homepage https://mcp.so/ — 2026-09-11  
   <https://mcp.so/submit>  
   Documents a paid submission path that explicitly skips review and sells a 'Verified' badge, alongside free submission via GitHub issue (3,489 issues, 3,214 open); category facets sum to 19,416 entries.
   - Figures: “Paid submission $39 one-time publishing fee Publish immediately without review Verified badge Featured and priority placement Dofollow project link” · “Paid submissions get a dofollow link, faster review, and featured placement” · “You can submit your MCP Server by creating a new issue in our GitHub repository.” · “Unique visitors (12 mo) 2.2M; Pageviews (12 mo) 6M; Monthly active users 266K” · “Sum of category facet counts on 2026-09-11 = 19,416 (Developer Tools 2361; Other 10559)” · “chatmcp/mcpso issues: 3489 total, 3214 open (2026-09-11)”
   - Sample/method: curl with browser UA of submit, listing and homepage; GitHub search API counts
   - Limitations: Facet sum may double-count; whether free submissions are reviewed is not stated; Verified badge is purchasable so carries no review meaning.

56. **About PulseMCP (with server directory and API pages)** — PulseMCP (Tadas Antanavicius, Mike Coughlin, Ravina Patel); directory https://www.pulsemcp.com/servers; API page https://www.pulsemcp.com/api — undated pages; directory count 2026-09-11  
   <https://www.pulsemcp.com/about>  
   PulseMCP's operator (its founder maintains the official registry), 21,940 listed servers, paused submissions, and an ingestion description ('automated scraping and crawling processes with manual curation', official-registry integration, 'security analyses' enrichment) with no written review criteria.
   - Figures: “Tadas Antanavicius: Active member of the MCP Steering Committee currently focused on building out the MCP contributor community and maintaining the official MCP Registry” · “New server submissions and listing changes are still paused while we rework how we ingest and manage listings.” · “Showing 1 - 42 of 21,940 servers (2026-09-11)” · “Manual user submissions via pulsemcp.com/submit; Automated scraping and crawling processes with manual curation; Integration with the Official MCP Registry” · “enriched, curated, quality-controlled MCP server registry; Popularity data; Security analyses; Corrections to server.json metadata” · “v0beta API: September 2026: Fully sunset (100% of requests will fail); v0.1 requires X-API-Key”
   - Sample/method: fetch of four pages (curl blocked by Cloudflare)
   - Limitations: 'Security analyses' undefined; manual curation criteria unpublished; classification 'Official Providers' vs 'Community' undocumented.

57. **LobeHub MCP Server Marketplace** — LobeHub — 2026-09-11  
   <https://lobehub.com/mcp>  
   The largest headline count of any catalog (97,030) with no review, moderation or submission policy text.
   - Figures: “Explore 97,030 MCP Servers, ranked by activity, stability, and community feedback — find trustworthy APIs”
   - Sample/method: curl with browser UA 2026-09-11
   - Limitations: Marketing count; ranking undocumented; likely GitHub-derived aggregation.

58. **Plugin guidelines (OpenAI universal directory for ChatGPT and Codex)** — OpenAI; former URL https://developers.openai.com/apps-sdk/app-submission-guidelines 301s here — undated  
   <https://developers.openai.com/plugins/app-guidelines>  
   Curated-directory review criteria for MCP-backed plugins: correct tool annotations (a common rejection cause), privacy policy, data minimisation, prohibited categories, demo credentials, and post-approval removal.
   - Figures: “The guidelines below outline the minimum standard a published plugin must meet to remain available in the universal directory shared by ChatGPT and Codex.” · “Incorrect or missing action labels are a common cause of rejection. Double-check that the readOnlyHint, openWorldHint, and destructiveHint annotations are correctly set, and provide a detailed justification for each when submitting the plugin.” · “When submitting a plugin with an authenticated MCP server, provide a login and password for a fully featured demo account that includes sample data.” · “Previously approved plugins that are later found in violation may be removed.”
   - Sample/method: n/a (vendor policy)
   - Limitations: Closed vendor directory; page rewritten (apps -> plugins); no review mechanics or counts.

59. **Discover and install prebuilt plugins through marketplaces (Claude Code)** — Anthropic — undated; fetched 2026-09-11  
   <https://code.claude.com/docs/en/discover-plugins>  
   Two-tier plugin marketplace for MCP-bundling plugins: official marketplace curated at Anthropic's discretion; community marketplace admitted after automated validation and safety screening with commit-SHA pinning; explicit disclaimer that Anthropic cannot verify bundled MCP servers.
   - Figures: “The official marketplace is curated by Anthropic, and inclusion is at Anthropic’s discretion.” · “The community marketplace at anthropics/claude-plugins-community hosts third-party plugins that have passed Anthropic’s automated validation and safety screening. Each plugin is pinned to a specific commit SHA in the catalog.” · “Anthropic doesn’t control what MCP servers, files, or other software are included in plugins and can’t verify that they work as intended.”
   - Sample/method: n/a (vendor docs)
   - Limitations: Plugin marketplace, not an MCP registry; screening content undescribed.

60. **Browse Extensions \| Gemini CLI** — Google; releasing doc https://geminicli.com/docs/extensions/releasing/ — 2026-09-11  
   <https://geminicli.com/extensions/>  
   A documented 'none' review policy: gallery auto-indexes GitHub repos tagged gemini-cli-extension daily and states Google does not vet them; 1,782 extensions.
   - Figures: “Search all 1782 extensions” · “The extensions listed here are sourced from public repositories and created by third-party developers. Google does not vet, endorse, or guarantee the functionality or security of these extensions. Please carefully inspect any extension and its source code before installing” · “releasing doc: crawls tagged repositories daily”
   - Sample/method: curl of gallery and releasing doc 2026-09-11
   - Limitations: Extensions gallery, not MCP-only; no MCP-tagged breakdown.

61. **MACH Alliance MCP Registry** — MACH Alliance — undated; fetched 2026-09-11  
   <https://machalliance.org/mach-alliance-mcp-registry>  
   A vendor-neutral metadata directory open to non-members with generic governance language (schema validation, automated checks, community reporting, optional verification) and Typeform submission; no count or launch date.
   - Figures: “The registry validates schema compatibility and applies any required governance rules or moderation checks.” · “The MACH Alliance applies a combination of automated checks, community-driven reporting, and optional verification processes to reduce risk. Enterprises are encouraged to apply their own governance on top of the registry data.” · “Certain verification or governance features may be available specifically to members, but publishing is not restricted to Alliance members.”
   - Sample/method: n/a (marketing/FAQ page)
   - Limitations: No evidence the registry is live or how many entries it holds.

62. **Inventory and Discover MCP Servers in Your API Center - Azure API Center** — Microsoft Learn — ms.date 2026-05-29; updated 2026-06-18  
   <https://learn.microsoft.com/en-us/azure/api-center/register-discover-mcp-server>  
   Private per-organisation registry model (manual registration, sync from APIM/Git, curated Microsoft partner list, v0.1 registry endpoint) with no third-party code review described.
   - Figures: “Azure API Center provides a curated list of partner MCP servers that you can add to your API inventory. This list includes MCP servers from Microsoft services such as Azure Logic Apps, GitHub, and others.” · “Registry endpoint format: https://<your-api-center-name>.data.<region>.azure-apicenter.ms/workspaces/default/v0.1/servers”
   - Sample/method: n/a (product docs)
   - Limitations: Private enterprise inventory, not a public catalog.

63. **JFrog Unveils Universal MCP Registry** — JFrog (investor relations press release) — 2026-03-18  
   <https://investors.jfrog.com/news/news-details/2026/JFrog-Unveils-Universal-MCP-Registry-Delivering-a-Secure-System-of-Record-for-the-AI-Driven-Software-Supply-Chain/default.aspx>  
   Launch of an enterprise governance registry claiming to block malicious or non-compliant servers; no curation policy text, no counts.
   - Figures: “proactively block the download and execution of malicious or non-compliant MCP servers” · “The JFrog MCP Registry is available immediately as part of JFrog AI Catalog.” · “approximately 6,600 organizations worldwide, including a majority of the Fortune 100, depend on JFrog”
   - Sample/method: n/a (press release)
   - Limitations: Marketing; 6,600 is JFrog's overall customer base; blocking mechanism undescribed.

64. **Migrate MCP extensions to use the official MCP registry instead** — Zed Industries (issue by MrSubidubi) — 2026-06-15; open, 0 comments  
   <https://github.com/zed-industries/zed/issues/59353>  
   Evidence of a client considering replacing its own reviewed extension channel with direct official-registry consumption.
   - Figures: “This will make it easier to add new MCP servers and will remove any need for someone to first create a Zed extensions before the server can be easily installed within Zed.”
   - Limitations: Proposal only; no discussion; no statement on prior vetting.

65. **awesome-mcp-servers CONTRIBUTING.md** — punkpeye / Frank Fiegel (GitHub; MIT; 94,793 stars); raw at https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/CONTRIBUTING.md — undated; repo pushed 2026-09-08  
   <https://github.com/punkpeye/awesome-mcp-servers/blob/main/CONTRIBUTING.md>  
   The most-starred list applies format-only guidelines, fast-tracks PRs from automated agents, and is synced to Glama's directory; roughly 3,866 bullet-link entries.
   - Figures: “If you are an automated agent, we have a streamlined process for merging agent PRs. Just add 🤖🤖🤖 to the end of the PR title to opt-in. Merging your PR will be fast-tracked.” · “Ensure that all information is accurate and up-to-date” · “README.md: We now have a web-based directory (https://glama.ai/mcp/servers) that is synced with the repository.” · “README bullet-link lines: 3,866 (2026-09-11)”
   - Sample/method: Doc text plus grep of README
   - Limitations: Awesome-list, not a registry; count heuristic includes non-server bullets; maintainers may still reject PRs.

66. **ADDITIONAL.md — additional community resources (modelcontextprotocol/servers)** — Model Context Protocol project — undated; main branch 2026-09-11  
   <https://raw.githubusercontent.com/modelcontextprotocol/servers/main/ADDITIONAL.md>  
   Operator attribution for 18 third-party directories (e.g., Glama/awesome list by Frank Fiegel, PulseMCP by Tadas Antanavicius, Mike Coughlin and Ravina Patel, Smithery by Henry Mao, mcp-get by Michael Latman, OpenTools, mcp.run, MCPRepository.com).
   - Figures: “PulseMCP ... by Tadas Antanavicius, Mike Coughlin, and Ravina Patel” · “Smithery - A registry of MCP servers ... by Henry Mao” · “18 directory/list entries with operators as listed”
   - Limitations: No counts, policies or dates; some operators unspecified.

67. **C10.1: Component Integrity & Supply Chain Hygiene (OWASP AISVS research chapter)** — OWASP AISVS project (CC-BY-SA-4.0); last commit Jim Manico — last committed 2026-07-14; chronology through May 2026  
   <https://raw.githubusercontent.com/OWASP/AISVS/main/1.0/research/chapters/C10-MCP-Security/C10-01-Component-Integrity.md>  
   A standards-body chronology of registry developments (JFrog, MACH, ToolHive, BlueRock, official registry ownership controls) and incidents (Smithery path traversal), relaying vendor scan figures second-hand; not a policy comparison.
   - Figures: “Official MCP Registry Ownership Controls (May 2026): ... GitHub OAuth for interactive publishing, GitHub OIDC for GitHub Actions, and DNS or HTTP challenges for domain-backed namespaces. ... an approved registry namespace can prove who is allowed to publish a server record without proving that the npm/PyPI/container artifact installed by a client was built from reviewed source.” · “Smithery Registry Path Traversal (October 2025): A path-traversal bug in the Smithery.ai build configuration exposed Docker credentials controlling 3,000+ hosted MCP servers and their API tokens.” · “BlueRock MCP Trust Registry Expansion (May 2026): ... scans of 10,000+ public MCP servers with 22+ security rules, finding 9.2% with critical vulnerabilities” · “Stacklok ToolHive Registry Update (April 13, 2026): ToolHive's Registry Server added claim-based authorization” · “MACH Alliance MCP Registry (2026): ... standardized metadata, automated verification, and governance policy enforcement”
   - Sample/method: Secondary compilation; figures relayed without independent verification
   - Limitations: Tertiary; no per-registry counts or takedown descriptions; internal inconsistency on the Smithery incident wording.

68. **Model Context Protocol (MCP): Security Design Considerations for AI-Driven Automation (NSA Cybersecurity Information Sheet)** — National Security Agency (U/OO/6030316-26, May 2026 Ver. 1.0); read via Wayback capture 20260830055740 — May 2026 (earliest Wayback capture 2026-05-20)  
   <https://web.archive.org/web/2026id_/https://www.nsa.gov/Portals/75/documents/Cybersecurity/CSI_MCP_SECURITY.pdf>  
   The only government advisory found that mentions MCP registries: warns about tool-name resolution from public registries, recommends code audit 'using the most stringent review profile' and enrolling locally deployed servers in 'the MCP Registry service' for internal use; does not assess any public registry's vetting.
   - Figures: “Some MCP orchestrators automatically resolve tool names from public registries or local modules.” · “The MCP project documentation has identified that many popular servers are no longer actively maintained.” · “If the organization has a code audit process, apply it to MCP server projects using the most stringent review profile, particularly when evaluating newer integrations.” · “When possible, deploy and maintain MCP servers or clients locally, and leverage capabilities, such as the MCP Registry service [22], to enroll them and make them available for internal use.”
   - Sample/method: n/a (guidance)
   - Limitations: Registries mentioned in passing; direct nsa.gov URL returned 403, Wayback copy used.

69. **Agentic MCP Security Best Practices Guide** — Cloud Security Alliance (Lab Space; draft white paper) — 2026-03-27  
   <https://labs.cloudsecurityalliance.org/agentic/agentic-mcp-security-best-practices-v1/>  
   Prescriptive guidance that treats public registries as unvetted by implication, requiring private approved registries with formal intake review for production; no assessment of public registries.
   - Figures: “Private MCP server registries must be used for production environments rather than direct installation from public registries.” · “Supply chain controls at Level 3 require an approved MCP server registry with formal intake review, SBOM generation for all deployments” · “Security review should include static analysis of the server package and its dependencies for known vulnerabilities, manual review of the tool definitions and permission requirements, and assessment of the server operator's security practices and disclosure history.” · “a typical target is a one-week review cycle for standard MCP servers”
   - Sample/method: n/a (prescriptive)
   - Limitations: Draft; no authors shown; does not name or evaluate public registries.

70. **MCP Security Statistics 2026: CVEs, Vulnerabilities & Breach Data** — Practical DevSecOps (Varun Kumar) — 2026-06-26  
   <https://www.practical-devsecops.com/mcp-security-statistics-2026-report/>  
   A secondary roundup that states outright that no registry publishes a percentage-audited figure and relays a May 2026 official-registry count (9,652 latest records / 28,959 version records) attributed to Digital Applied.
   - Figures: “No registry publishes a "% security audited" figure; the de-facto answer is that the vast majority are unreviewed.” · “An independent May 24, 2026, pull of the official MCP Registry API counted 9,652 latest server records and 28,959 server/version records (Digital Applied, 2026).” · “official MCP Registry (~9,652 records, May 2026), plus mcp.so, Smithery, Glama (5,867 verified servers as of June 2025), MCP Market (18,000+ listings cited in academic work)” · “CoSAI's audit scoring 17 MCP servers an average of 34/100 on security (CoSAI, 2026)”
   - Sample/method: Compilation of third-party figures; primaries not verified
   - Limitations: SEO content; '% audited' statement is assertion; 9,652 conflicts with other mid-2026 counts (likely 'latest' filter).

71. **The State of MCP Registries** — SafeDep (Kunal Singh) — 2025-12-20  
   <https://safedep.io/the-state-of-mcp-registries>  
   A vendor essay characterising official-registry authentication as namespace-only with typosquatting unresolved and calling for a curated security-first sub-registry.
   - Figures: “few authentication mechanisms, like GitHub OIDC or DNS verification for domains, but the issue of typosquatting still exists” · “for only 1691 unique underlying npm, pypi, etc. packages, there are about 64.7 Million server entries having a one-to-many relationship with 48.5 Million packages” · “the existence of a curated, security-first sub-registry will be the deciding factor in its adoption”
   - Sample/method: No method given
   - Limitations: Figures implausible (likely join artifact); vendor sells vetting tooling.

72. **From Path Traversal to Supply Chain Compromise: Breaking MCP Server Hosting** — GitGuardian (Gaetan Ferry) — 2025-10-22  
   <https://blog.gitguardian.com/breaking-mcp-server-hosting/>  
   Shows that Smithery's hosting pipeline builds and runs submitted repos (a path-traversal in dockerBuildPath exposed a fly.io token covering 'over 3,000' hosted servers), i.e., the registry executes untrusted submissions without a listing review that would catch it.
   - Figures: “compromised over 3,000 MCP servers” · “Timeline: 2025-06-10 discovery; 2025-06-13 disclosure; 2025-06-14 partial fix; 2025-06-15 complete fix; 2025-10-15 public write-up”
   - Sample/method: Single-researcher penetration test
   - Limitations: One registry, one bug; 3,000 figure unmethodised; nothing on listing review.

73. **We scanned 100 Smithery MCP servers and 22 came back with security findings** — Bawbel (dev.to, Saray Chak) — 2026-04-30 (edited 2026-05-10)  
   <https://dev.to/saray_chak_/we-scanned-100-smithery-mcp-servers-and-22-came-back-with-security-findings-2lj8>  
   A vendor scan of Smithery's top 100 listed servers as a proxy for what its listing process lets through.
   - Figures: “100 servers scanned; 22 flagged (22%); 28 findings; 4 CRITICAL, 24 HIGH” · “Tool description injection 6 servers; content type mismatch 6; tool output exfiltration encoding 4; PII exfiltration 3” · “Bawbel scanner v1.0.1; scan date April 30, 2026”
   - Sample/method: Top-100 by Smithery API ranking; vendor pattern scanner; no FP validation
   - Limitations: Promotional; top-ranked bias; pattern matches not confirmed exploits.

74. **We Scanned 1,808 MCP Servers. 66% Had Security Findings.** — AgentSeal (self-described 'MCP Security Registry') — 2026-03-14  
   <https://agentseal.org/blog/mcp-server-security-findings>  
   A vendor scan spanning GitHub, npm/PyPI, Smithery, MCP.run and directories, promoting its own scanned registry; includes an ecosystem-size figure.
   - Figures: “1,808 servers scanned; 1,196 servers (66%) had at least one security finding; 8,282 total findings; 427 critical; 1,841 high; 16,840 tools analyzed” · “over 16,000 MCP servers in the ecosystem, up from 714 in January 2025” · “false positive rate for high and critical severity findings was approximately 4.2% on 120 known-benign MCP servers”
   - Sample/method: 1,808 servers connected over stdio/SSE; four-layer detection; FP check on 120 benign servers
   - Limitations: Vendor promotion; sample not random; ecosystem figure uncited.

75. **How Safe Are MCP Servers? We Scanned Over 10,000** — MCP Marketplace (mcp-marketplace.io; operator not identified) — 2026-06-24  
   <https://mcp-marketplace.io/blog/how-safe-are-mcp-servers>  
   A marketplace stating it scans every submitted or imported server before listing and re-scans over time, with aggregate results across >10,000 entries drawn from the official registry and direct submissions.
   - Figures: “Every server submitted to or imported into MCP Marketplace runs through an automated security scan before it is listed, and gets re-scanned over time.” · “more than 10,000 scanned servers across the live catalog as of June 2026, drawn from the official MCP Registry and direct creator submissions” · “~1 in 4 scores above low risk; ~1 in 8 has at least one critical-severity finding; nearly 1 in 3 has a serious supply-chain issue; 74.9% clean scans”
   - Sample/method: Proprietary scanner over its own catalog, June 2026
   - Limitations: Anonymous operator; opaque severity definitions; no external validation.

76. **MCP Trust Registry — Security Ratings for MCP Servers** — BlueRock Security — undated (Framer build 2026-06-26/30)  
   <https://www.mcp-trust.com/>  
   A third-party post-hoc rating layer over public MCP servers (Low/Medium/High/Critical, 22-rule analysis); the page contradicts itself on sample size and rates.
   - Figures: “The MCP Trust Registry scanned 12,000+ MCP servers. Here's what we found:” · “6% of MCP servers have critical vulnerabilities (FAQ JSON-LD: over 7,100 public MCP servers ... 9.2% have critical vulnerabilities)” · “32% [also '42%' in the same block] of MCP servers have command injection flaws; 33% MCP servers are vulnerable to SSRF” · “'Search 8,000+ public MCP server builds' and 'Search 12,000+ public MCP server builds' (both on page)”
   - Sample/method: Not stated; static 22-rule analysis; source registries and dates absent
   - Limitations: Marketing page with internally inconsistent figures; not a registry with listing review.

77. **Introducing The Backslash MCP Server Security Hub** — Backslash Security (Amit Bismut) — 2025-06-16  
   <https://www.backslash.security/blog/mcp-server-security-hub>  
   An early vendor rating hub that names the existing directories (mcp.so, Awesome MCP Servers, PulseMCP, MCP Market, Docker's list, GitHub project list) and asserts most servers 'lack proper security vetting'.
   - Figures: “Today, there are more than 15,000 MCP servers available publicly.” · “Most MCP servers are not published by verified sources and lack proper security vetting” · “Until now there's been no public resource that rates MCP servers on their security posture” · “The database already includes thousands of MCPs and we are continuously adding to it.”
   - Sample/method: No method; ecosystem figure unsourced
   - Limitations: Launch post; 'first' claim self-asserted; 15 months old.

78. **MCP Drift Watch — which MCP packages turned dangerous after you trusted them** — PulseFeed (pulsefeed.dev); listed in the official registry's community-projects.md — report generated 2026-09-11; series from 2026-08-01  
   <https://pulsefeed.dev/mcp/drift>  
   A third-party nightly post-listing diff (ownership changes, install scripts added, repos removed, unpublished packages) that the official registry itself does not perform.
   - Figures: “Watching 30,519 servers across the entire MCP registry — metadata diffed daily” · “last 30 days: install script added 10; owner changed 54; repo removed/moved 209; unpublished 103; skill instructions swapped 1,139; fixed by author 12” · “series started August 1, 2026”
   - Sample/method: Nightly snapshot diff; method detail unpublished
   - Limitations: Vendor page; 'entire registry' undefined (30,519 exceeds distinct-server counts); counts unverifiable.

79. **Community Projects (MCP Registry docs)** — modelcontextprotocol/registry (GitHub) — undated; fetched 2026-09-11  
   <https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/community-projects.md>  
   The registry's own pointer to third-party review layers it does not operate (polygraph behavioural grades, PulseFeed Drift Watch, ToolSDK and ToolHive self-hostable registries), added by PR with no vetting and 'inclusion does not imply endorsement'.
   - Figures: “polygraph - Independent behavioral security grades (A–F) for MCP servers from an open, reproducible harness” · “PulseFeed MCP Drift Watch - Daily external diff of the whole registry population, recording what changed in a server after it was listed ... series runs from 2026-07-30” · “This is not an exhaustive list, and inclusion does not imply endorsement.”
   - Sample/method: n/a (link list)
   - Limitations: Self-supplied descriptions; unverified.

80. **MCP registry probe, September 2026** — Cracked (cracked.ai), Hugging Face user crackedvibe; CC BY 4.0 — probe run 2026-09-02  
   <https://huggingface.co/datasets/crackedvibe/mcp-registry-probe-2026-09>  
   A nightly keyless functional probe of open remote servers in the official registry (liveness, not review).
   - Figures: “Servers probed: 942; Answered tools/list: 921 (97.8%); Completed one keyless tools/call: 662 (70.3%); Median successful call: 468 ms”
   - Sample/method: initialize -> notifications/initialized -> tools/list -> one side-effect-free tools/call, no credentials
   - Limitations: Subset of ~13k remotes; commercial dataset; single run cited.

81. **ToxicSkills: Snyk Finds Prompt Injection in 36%, 1467 Malicious Payloads in a ToxicSkills Study of Agent Skills Supply Chain Compromise** — Snyk (Luca Beurer-Kellner et al.) — 2026-02-05  
   <https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/>  
   Adjacent-ecosystem precedent (agent-skill registries ClawHub and skills.sh) for measuring what a no-review registry admits, including confirmed malicious entries still live at publication.
   - Figures: “scanning 3,984 skills from ClawHub and skills.sh as of February 5th, 2026” · “13.4% of all skills, or 534 in total, all contain at least one critical-level security issue” · “76 malicious payloads designed for credential theft, backdoor installation, and data exfiltration” · “8 of these malicious skills remain publicly available on clawhub.ai as of publication” · “The barrier to publishing a new agent skill on ClawHub? A SKILL.md Markdown file and a GitHub account that's one week old. No code signing. No security review. No sandbox by default.”
   - Sample/method: 3,984 skills; automated scan plus human confirmation of 76
   - Limitations: Not MCP servers; headline overstates body (76 confirmed malicious, not 1,467); ClawHub policy described by Snyk.

82. **~11% of advertised remote endpoints do not speak MCP at the URL given (sampled 1,200 of 10,542)** — modelcontextprotocol/registry issue #1487 (siliroid); companion repo https://raw.githubusercontent.com/siliroid/mcp-endpoint-census/main/README.md; Fetchgate full-coverage run 2026-08-27 — 2026-07-28; comments through 2026-08-28; open, no maintainer reply  
   <https://github.com/modelcontextprotocol/registry/issues/1487>  
   Community measurements that a tenth of advertised remote endpoints in the official registry do not speak MCP, with per-host breakdowns (server.smithery.ai 88.6% broken) and a full-coverage re-run; no maintainer response.
   - Figures: “walked 60,763 entries over 608 pages. 21,346 advertise at least one remote (35.1%), resolving to 10,542 unique endpoint URLs — 2,766 of which are claimed by more than one server” · “corrected full census (2026-07-29): alive-open 5,575 59.2%; alive-gated 2,760 29.3%; not-mcp 964 10.2%; alive-wrong-transport 120 1.3%; measurable denominator 9,419” · “server.smithery.ai listed 210, broken 186, rate 88.6%, recovered 0; *.up.railway.app 293/180/61.4%; mcp.apify.com 108/51/47.2%” · “Fetchgate 2026-08-27, 15,329 unique remotes[].url: initialize + tools/list succeeded 8,235 53.7%; 401/403 3,617 23.6%; error 2,660 17.4%; not JSON-RPC 553 3.6%” · “Circadian: 60,148 records collapsed to 18,795 distinct servers on 28 July, ratio 3.2; 167.5 new servers/day in July” · “census README: clauxel.com 75 \| 75 \| 68 \| 90.7%; server.smithery.ai 217 \| 211 \| 187 \| 88.6%”
   - Sample/method: MCP initialize POST to each URL; seeded 1,200 sample then full census; Fetchgate ran initialize/tools/list on all 15,329 URLs (data CC BY 4.0)
   - Limitations: Author's numbers moved four times in 24h and the README is internally inconsistent; two corroborating commenters are self-declared AI agents; author sells an audit service; conformance not security.

83. **Provenance audit: 38/398 top-graded servers' repository URLs point at renamed or transferred repos** — modelcontextprotocol/registry issue #1484 (healthai-hq / MCP Queen); comment by UgaTheDev 2026-08-25 — 2026-07-28; open, no maintainer reply  
   <https://github.com/modelcontextprotocol/registry/issues/1484>  
   Evidence that repository links are not re-validated after listing (38 of 398 top-graded remote servers do not resolve as registered) and a claim that the repository ID field intended to detect resurrection attacks is never populated.
   - Figures: “38 entries (9.5%) of 398 highest-graded remote servers reference repos that do not resolve as registered (table: 33 GitHub 404 'MISSING', 5 rename redirects)” · “commenter quoting pkg/model/types.go: ID ... 'Should remain stable across repository renames and may be used to detect repository resurrection attacks' — asserted never populated”
   - Sample/method: repository.url of 398 vendor-graded servers checked against GitHub REST/GraphQL, 2026-07-28
   - Limitations: Body contradicts its own table ('0 hard 404s'); vendor-selected sample; field-unused claim unverified.

84. **Proposal: optional security scan metadata field (with issue #823: Add a verified field)** — modelcontextprotocol/registry issues #1273 (eeee2345, 2026-05-09) and https://github.com/modelcontextprotocol/registry/issues/823 (sebytremblay, 2025-12-07) — #823 open since 2025-12-07; #1273 open since 2026-05-09; both without maintainer reply as of 2026-09-11  
   <https://github.com/modelcontextprotocol/registry/issues/1273>  
   Two long-open feature requests establishing by absence that the official registry exposes neither a security-scan signal nor a 'verified' publisher property; #823's thread adds a measurement of missing/unreachable repositories.
   - Figures: “#823: Right now, the Central MCP Registry doesn't expose any explicit notion of "verified" publishers or servers.” · “#1273 (2026-06-29): this is still community convergence and the registry maintainers haven't given direction yet, so #1404 is a draft proposal” · “#823 comment (2026-07-27 crawl): 3,240 of 18,644 servers (17.4 percent) declare no repository at all; 2,049 of the 13,698 distinct declared repositories (15.0 percent) return NOT_FOUND”
   - Sample/method: Issue threads; the #823 measurement is a 2026-07-27 crawl (59,402 version records -> 18,644 servers) by a self-declared AI agent
   - Limitations: Feature requests; proposer of #1273 has a vendor interest; measurement by an AI agent commenter.

### Not used

- <https://mcpworld.com/> — Baidu MCP World: site is a 7 KB JavaScript shell; the '60,868 services as of 2026-04-01' and 'stricter review' claims seen only in search snippets and the alianga blog; count and policy unverified.
- <https://baike.baidu.com/> — Baidu Baike entry on MCP World returned HTTP 403; exact entry URL not captured in the record.
- <https://developer.salesforce.com/> — ISVforce guide pages 'security-review-how-it-works' and 'security-review-required-materials' (AgentExchange security review, reportedly incl. MCP endpoint inventory) returned 403/JS shells via fetch, curl and Wayback; exact paths not captured.
- <https://www.modelscope.cn/docs/mcp/> — ModelScope MCP 广场 submission/审核 documentation is JS-rendered; only the openapi count endpoint could be read.
- <https://playmcp.kakao.com/guide> — 832-byte JS shell; the '등록 및 심사 요청' review step exists only in search snippets.
- <https://tech.kakao.com/posts/734> — JS-only page; PlayMCP review policy text not retrievable.
- <https://registry.smithery.ai/openapi.json> — HTTP 404; the ServerSecurity.scanPassed schema could not be located, so Smithery's 'security' field semantics are unverified.
- <https://api.pulsemcp.com/v0beta/servers> — Returns API_SUNSET; v0.1 endpoint requires an X-API-Key; PulseMCP counts taken from the web page instead.
- <https://glama.ai/api/mcp/v1/servers?first=1> — HTTP 401, API key and attribution licence required; counts taken from the listing page instead.
- <https://mcpmarket.com/> — HTTP 429 (Vercel checkpoint); MCP Market's own count and submission policy not read at primary (only third-party figures 10,000 to 20,000).
- <https://cursor.directory/mcp> — HTTP 429; Cursor Directory count and policy not read at primary.
- <https://mcpservers.org/> — HTTP 403.
- <https://www.jfrog.com/> — HTTP 202 with empty body; the investor-relations press release was used instead, which lacks any 'Curation' policy text.
- <https://dl.acm.org/doi/10.1145/3796519> — ACM DL blocked (403/Cloudflare); the TOSEM attribution for Hou et al. could not be verified from the arXiv record either.
- <https://dl.acm.org/doi/10.1145/3814959> — ACM DL blocked; TOSEM DOI for Hasan et al. not verifiable (arXiv full text carries only a 'Journal: TOSEM' header).
- <https://api.semanticscholar.org/graph/v1/paper/search> — HTTP 429 on all three queries; no Semantic Scholar results obtained.
- <https://www.nsa.gov/Portals/75/documents/Cybersecurity/CSI_MCP_SECURITY.pdf> — Direct nsa.gov and media.defense.gov URLs returned Access Denied; content verified only via the Wayback capture listed under supporting; the claimed 2026-06-02 posting date is unverified.
- <https://github.com/OWASP/www-project-mcp-top-10> — Opened during the search phase only (MCP04 recommends approved/internal registries) but not carried into the verified record; not used for the verdict.
- <https://arxiv.org/abs/2506.23474> — MCPCorpus (with https://huggingface.co/datasets/Snak1nya/MCPCorpus): opened during search, ~14K servers from MCP.so as of 2025-06-03, no vetting content; not verified in this sweep.
- <https://cursor.com/mcp> — JS shell with no server data or policy text.
- <https://docs.windsurf.com/windsurf/cascade/mcp> — Mentions an MCP registry/marketplace page but contains no review policy.

### Open questions from the sweep

- Which 11 registries OX Security tested and which 9 accepted the trial balloon (gated eBook); whether the official registry, Glama, Smithery, mcp.so and PulseMCP were among them and what 'without review' meant per registry.
- Salesforce AgentExchange security review for externally hosted MCP servers (ISVforce 'security-review-how-it-works' / 'security-review-required-materials') — unreachable via fetch, curl and Wayback; needs a browser or the Salesforce docs JSON API.
- Baidu MCP World (mcpworld.com): the 60,868 (2026-04-01, baike) / 56,757+ (alianga) counts and the 'stricter review' claim are unverified at primary; site and baike unreadable.
- ModelScope MCP 广场 written submission/审核 policy and hosting review (modelscope.cn/docs/mcp/*, JS-rendered); Alibaba Bailian 自定义 MCP 服务 review rules; iFLYTEK 讯飞星辰, MCP Star (mcpmarket.cn), AIbase, Xinflow — none opened at primary.
- Kakao PlayMCP's '등록 및 심사 요청' (register and request review) step and private-by-default listing — seen only in search snippets; playmcp.kakao.com and tech.kakao.com/posts/734 are JS-only.
- Terms of service / content policies of Smithery, Glama, mcp.so, PulseMCP, LobeHub and MCP Market (as opposed to their publish/methodology pages) likely contain the actual removal clauses; not checked.
- Whether GitHub's promised automatic appearance of self-published official-registry servers in the GitHub MCP Registry ever shipped (252 entries vs ~30,800 upstream suggests not; Zowe doc says manual approval via partnerships@github.com).
- Maintainer position on re-verifying DNS/HTTP namespaces and on preventing publishers from reversing moderation takedowns (rdimitrov said this 'deserves a separate issue'); whether such an issue now exists.
- Classification of the 709 'deleted' official-registry entries (2026-09-11) into publisher self-deletion vs moderation; the reporter in #1563 found no moderation statusMessage among 735, but that was before the vape action and was not re-read in this sweep.
- Whether the 2608.00997 v1 figures '8.6% of servers ever rewrite a description vs 24.8% for descriptors' were among the five claims corrected in v2.
- Venue acceptance status of the 2026 registry-measurement preprints; the ACM TOSEM DOIs 10.1145/3796519 (Hou et al.) and 10.1145/3814959 (Hasan et al.) could not be verified (ACM DL 403; arXiv records carry no journal-ref).
- Primary sources for the Digital Applied official-registry pull (9,652 latest / 28,959 version records, 2026-05-24) and the CoSAI '17 servers, 34/100' audit cited by Practical DevSecOps.
- AWS Marketplace 'AI Agents and Tools' MCP listing review; Postman MCP Network verified-publisher badges; Apify Store Actor review as applied to MCP exposure; mcp.run (Dylibso) servlet publishing; Microsoft 365 Partner Center path for MCP-backed declarative agents — no primary policy pages opened.
- NCSC, BSI, ENISA, JPCERT/IPA, KISA, CAICT — no MCP-registry-specific guidance found; direct site searches not exhaustive.
- AAIF / Linux Foundation governance documents for the registry post-donation; MCPCon Europe (2026-09-17/18) and NA (2026-10-22/23) and MCP Dev Summit NA 2026 (April) programmes for registry-moderation sessions — session lists were JS/consent-gated.
- Sources opened in the search phase but not carried into the verified record and therefore not cited: Pluto Security practitioner map, Astrix 'State of MCP Server Security 2025' (2025-10-15), CoSAI MCP security guide (2026-01-20), OWASP MCP Top 10 (MCP04), Straiker Black Hat 2026 roundup, Bishop Fox ClawHub post, Enkrypt, MCPCorpus (arXiv 2506.23474); a later check should verify and decide whether any adds an inventory fact.
- Whether the Smithery detail endpoint's 'security' field is ever non-null (all ~8 sampled were null) and what the 'official-vendor verification checklist' checks.
- Whether Docker's PR review has ever rejected a server on security grounds (310 closed-unmerged PRs exist but reasons were not sampled).

### Searches run

- `export.arxiv.org/api (curl, needed -L) :: search_query=all:"model context protocol" (start=0 and 400, max_results=400) :: 539 results, all fetched and merged`
- `export.arxiv.org/api :: search_query=all:MCP+AND+all:server (max_results=400) :: 254 results; merged into 661 unique IDs`
- `export.arxiv.org/api :: search_query=all:MCP+AND+all:security (max_results=400) :: 264 results; local grep for registr\|catalog\|marketplace\|smithery\|glama\|pulsemcp\|mcp.so\|vetting\|moderat found ~25 relevant papers`
- `export.arxiv.org/api :: (abs:registry OR abs:registries OR abs:marketplace OR abs:marketplaces) AND (abs:"model context protocol" OR abs:MCP), sorted by submittedDate :: 50 results; 9 new IDs, none registry-policy relevant`
- `web search site:arxiv.org :: "MCP registry" OR "MCP registries" vetting review policy comparison Smithery Glama study :: 2603.18063, 2608.00150, 2512.03775, 2509.25292, 2511.20920, 2510.16558, 2509.24272; no paper comparing registry review policies`
- `web search site:dl.acm.org :: Model Context Protocol registry marketplace security measurement :: TOSEM records for Hou et al. (10.1145/3796519) and Hasan et al. (10.1145/3814959), MCP-Scanner workshop paper; ACM DL pages 403 for curl and fetch`
- `web search site:ieeexplore.ieee.org :: Model Context Protocol MCP servers registry security empirical study :: IEEE 11206219, 11395848, 11308830, 11394790, 11526761 — none registry-policy focused`
- `web search site:usenix.org :: Model Context Protocol MCP server registry marketplace :: nothing MCP-registry specific`
- `web search site:ndss-symposium.org :: Model Context Protocol MCP servers security :: NDSS 2026 papers on tool-selection prompt injection and cross-tool harvesting; nothing on registries`
- `web search site:semanticscholar.org :: MCP registry marketplace vetting Model Context Protocol servers curation :: arXiv papers plus two USPTO patents; no registry-policy comparison`
- `web search site:openreview.net :: Model Context Protocol MCP registry servers ecosystem :: benchmark papers only`
- `web search (arxiv, dl.acm, ieeexplore, semanticscholar) :: "registry.modelcontextprotocol.io" OR "official MCP registry" paper measurement namespace verification :: 2503.23278, 2511.20920, 2506.23474, 2510.16558; surfaced the 'Registry admission requires only proof of GitHub repository or domain ownership' quote (2511.20920)`
- `web search site:arxiv.org :: "Docker MCP Catalog" OR "GitHub MCP Registry" OR "Docker MCP Toolkit" arxiv paper security :: none; grep of all fetched full texts for 'Docker MCP'/'GitHub MCP Registry' returned 0 hits`
- `web search :: arxiv 2026 "MCP registry" moderation OR takedown OR "denylist" OR "flagged" servers measurement :: only vendor docs/blogs; academic hits 2608.00997 and 2605.22333 measure neither moderation nor takedowns`
- `web search :: arxiv 2026 Smithery Glama PulseMCP "mcp.so" registries comparison listing policy empirical :: industry blog comparisons only (TrueFoundry, Tallyfy, Agensi, RoxyAPI)`
- `web search (arxiv, semanticscholar, dl.acm, ieeexplore, openreview, researchgate, ssrn) :: "MCP" "app store" OR "marketplace" governance review policies comparison paper 2026 "Model Context Protocol" registries curated self-publish :: 2511.20920, 2503.23278, 2601.08687, 2505.02279; no registry-policy comparison`
- `api.semanticscholar.org (curl) :: paper/search 'MCP registry Model Context Protocol servers vetting' / 'Model Context Protocol marketplace measurement' / 'MCP server registry security supply chain' :: HTTP 429 on all three`
- `Conference accepted-paper lists (curl): USENIX Sec '26, IEEE S&P 2026, CCS 2026, NDSS 2026, ICSE/FSE/MSR/ASE 2026 :: titles containing 'MCP' or 'Model Context Protocol' :: S&P 2026 'Parasites in the Toolchain'; FSE 2026 journal-first Hou et al.; MSR 2026 'A Large-Scale Dataset of MCP Implementations on GitHub'; USENIX Sec '26 one adjacent agent-skill-registry paper (98,380 skills); CCS/NDSS/ICSE/ASE zero`
- `web search :: MCP registry review policy comparison security vetting Smithery Glama PulseMCP official registry :: SEO-style 'best registries' comparisons only; TrueFoundry opened`
- `web search :: official MCP registry moderation policy malware denylist "modelcontextprotocol/registry" :: found official Moderation Policy page and admin guidelines; opened`
- `web search :: OX Security MCP registry malicious server report 2026 :: OX 'Mother of All AI Supply Chains' (2026-04-15) '9 out of 11 MCP registries poisoned'; opened post, CSA note, VentureBeat`
- `web search :: "MCP registry" GA general availability 2026 modelcontextprotocol.io blog :: no GA announcement (still preview per docs 2026-09-11); JFrog MCP Registry GA surfaced`
- `web search :: GitHub MCP Registry github.com/mcp how servers are added curated review policy submission :: launch post found; no published vetting criteria`
- `web search :: Docker MCP Catalog "Built by Docker" signed images security review Docker-built vs community-built servers :: Docker docs and Jul 2025 blog found`
- `web search :: Smithery MCP server listing security scan review policy takedown malicious :: GitGuardian path-traversal writeup; Bawbel and AgentSeal scans; no Smithery review-policy doc`
- `web search :: "MCP registry" security scanning malicious servers analysis Snyk OR Socket OR "Endor Labs" OR "Unit 42" 2026 :: Snyk agent-scan / ToxicSkills; nothing on registry review policies`
- `web search :: Anthropic Claude connectors directory submission review guidelines MCP :: claude.com submission, review-criteria, verification pages and support.claude.com directory policy; all opened`
- `web search :: OpenAI Apps SDK app submission review guidelines MCP server directory ChatGPT :: developers.openai.com guidelines opened; openai.com announcement JS-walled`
- `web search :: "GitHub MCP Registry" self-publish official registry mirror August OR September 2026 :: nothing newer than the Sep 2025 launch`
- `web search :: Cline MCP marketplace submission review process security "mcp-marketplace" GitHub issue requirements :: cline/mcp-marketplace README opened`
- `web search :: Microsoft Azure API Center MCP registry private enterprise registry announcement Build 2026 :: MS Learn doc opened; Tech Community post returned empty body`
- `web search :: JFrog MCP registry GA curation "MCP" servers vetting announcement 2026 :: JFrog GA 2026-03-18; jfrog.com HTTP 202 empty; investor press release opened`
- `web search :: Black Hat USA 2026 OR "DEF CON 34" talk MCP registry supply chain malicious servers marketplace :: Straiker BH2026 roundup: one Zenity talk on rug-pulled MCP servers; no registry-policy talk; NCC Group 403`
- `web search :: Koi Security OR "Invariant Labs" OR "Trend Micro" MCP marketplace registry malicious server found removed takedown :: Postmark-mcp npm takedown coverage only; no directory-level takedown accounts`
- `web search :: "MCP registry" typosquatting OR spam OR "name squatting" incident 2026 official registry servers removed :: UpGuard 2026-07-02 typosquatting study opened; a Medium 'mcp-server-postgress' story not traceable to OX's text, discarded`
- `web search :: Glama MCP malicious server detected delisted sandbox scan findings blog 2026 :: Glama methodology page opened and quoted`
- `web search :: PulseMCP "submissions" paused listing ingestion rework OR "official" badge verification policy :: submissions-paused notice; ~22,000 servers; no written review policy`
- `web search :: docs.github.com "GitHub MCP Registry" about servers listed "official MCP registry" security scanning OR review OR curated :: official registry about page and mpak found`
- `web search :: "1,641" MCP registry servers scanned "52.8%" critical :: figure not traceable to a primary source; discarded; surfaced mcp-marketplace.io, NimbleBrain, Enkrypt`
- `web search :: Koi Security postmark-mcp malicious server listed on MCP directories Smithery Glama removed after disclosure :: no evidence on directory listings/removal of postmark-mcp`
- `web search :: tl;dr sec OR "Risky Business" MCP registry review vetting marketplaces 2026 :: no newsletter hits; Bishop Fox post (ClawHub, not MCP) opened`
- `web search :: github.blog changelog 2026 "MCP Registry" servers from official registry now appear OR self-publish OR "verified" badge :: only allowlist/BYO-registry changelogs (2026-04-16, 2026-08-06); no vetting change`
- `web search :: awesome-mcp-servers punkpeye curation rules contributing OR Cursor MCP directory "cursor.com/mcp" review OR "AWS MCP servers" awslabs registry :: awesome-mcp-servers CONTRIBUTING opened; Cursor directory 429; AWS no policy docs`
- `web search :: Smithery "verified" badge OR "official" badge policy how servers get verified security scan smithery.ai docs 2026 :: Smithery publish doc opened; checklist criteria not public`
- `web search :: Docker MCP Catalog malicious server removed OR "removed from the catalog" OR takedown 2026 :: no Docker catalog takedown incident found`
- `web search :: "MCP" registries marketplaces vetting comparison Wiz OR "Palo Alto" OR Cisco OR Aikido OR "Endor Labs" blog August 2026 :: no security-vendor registry-policy comparison`
- `web search :: "sub-registry" OR "subregistry" MCP curated security-first registry launched 2026 scanned before listing :: nothing beyond SafeDep essay and consultancy pages`
- `GitHub issues API :: repo:modelcontextprotocol/registry security scanning in:title; malware OR moderation OR takedown OR spam in:title :: takedown issues #1563 (closed 2026-09-05) and #1558 (open), runbook PR #1518, 2025 issues #92/#101`
- `registry.modelcontextprotocol.io API :: GET /v0.1/servers?limit=100&version=latest full cursor walk (two runs, with and without include_deleted=true) :: 30,830-30,873 latest entries (30,498-30,539 active, 332-334 deprecated), 709 deleted; 18,565-18,591 with remotes; io.github ~20,800 (2026-09-11)`
- `registry.modelcontextprotocol.io API :: GET /v0/servers/io.github.jUXTAPOSITION1%2Fvape/versions?include_deleted=true :: status deleted, statusChangedAt 2026-09-05T21:55:42Z, statusMessage cites malware policy, OX report, GitHub block, #1563`
- `Bash curl :: registry web pages and APIs: github.com/mcp, hub.docker.com/mcp, pulsemcp.com/servers, glama.ai/mcp/servers, lobehub.com/mcp, registry.smithery.ai/servers?pageSize=1, mcp.so/servers, mcpservers.com, mcpmarket.com, cursor.directory/mcp, mcpservers.org, composio, docker/mcp-registry git tree :: GitHub 252; PulseMCP 21,936-21,940; Glama 85,538-85,540; LobeHub 97,030; Smithery 14,006 (191 verified); mcp.so facet sum 19,416; mcpservers.com 2,227; Docker 328 server dirs; mcpmarket/cursor.directory 429; mcpservers.org 403; composio '1500+ tools'`
- `gh search issues --repo modelcontextprotocol/registry "security scanning" :: 5 hits: #1273, #292, #82, #978, #294`
- `gh search issues --repo modelcontextprotocol/registry "moderation" :: 15 hits incl. #1558/#1563, #1488, #101, #92, #98`
- `gh search issues --repo modelcontextprotocol/registry "spam" :: 15 hits; #21, #97, #180 all closed 2025`
- `gh search issues --repo modelcontextprotocol/registry denylist :: 0 results`
- `gh search issues --repo modelcontextprotocol/registry takedown :: 8 hits: #1558, #1563, #1484, #1615, #92, #182, #294`
- `gh search issues --repo modelcontextprotocol/registry flagged :: 7 hits: #1612, #823, #1133`
- `gh search issues --repo modelcontextprotocol/registry "namespace verification" :: 10 hits: #1500, #1566, #1556, #1422/#1388/#980`
- `gh search issues --repo modelcontextprotocol/registry "general availability" :: 1 irrelevant hit (#560)`
- `gh search issues --repo modelcontextprotocol/registry malware :: 5 hits; only #1563 is an actual malware takedown`
- `gh search issues --repo modelcontextprotocol/registry "security scan" :: 10 hits; #263 immutability, #96 package ownership`
- `gh api search/issues q='repo:modelcontextprotocol/registry is:issue "Abuse report" in:title' / "Takedown request" / "Request: delete" / delete :: 0 'Abuse report'; 2 'Takedown request'; 17 'Request: delete'; 32 'delete'; 511 total issues`
- `gh api graphql discussion modelcontextprotocol/registry #1580 :: census 82,994 records -> 25,125 servers, 15,468 publishers; author corrected 393 -> 189`
- `gh api repos/{modelcontextprotocol/registry, docker/mcp-registry, github/github-mcp-server, cline/mcp-marketplace, punkpeye/awesome-mcp-servers, wong2/awesome-mcp-servers, awslabs/mcp, microsoft/mcp, chatmcp/mcpso, lobehub/lobehub, smithery-ai/reference-servers, glama-ai/mcp-servers, pulsemcp/pulsemcp-server} :: metadata for 10; smithery-ai/reference-servers, glama-ai/mcp-servers, pulsemcp/pulsemcp-server 404 (closed-source registries)`
- `gh search repos "mcp registry" --sort stars :: archestra-ai/archestra 4,268*, docker/mcp-registry 551*, toolsdk-ai/toolsdk-mcp-registry 187*, dend/mcp-registry-growth, Azure-Samples/mcp-registry, GSA-TTS/fed-data-mcp-registry`
- `gh search repos "mcp servers directory OR mcp marketplace OR mcp catalog" :: empty (OR unsupported); re-ran as single terms`
- `gh search repos "mcp registries comparison" :: 0 results`
- `gh search repos "mcp registry security" :: 1 hit: nahcaru/mcp-registry-security-profiles (0 stars, 2026-09-10)`
- `gh search repos "mcp marketplace" / "mcp catalog" / "mcp directory" / "mcp servers scanner" / "mcp registry dataset" :: cline/mcp-marketplace 786*, XPack-MCP-Marketplace 172*, aiagenta2z/mcp-marketplace, obot-platform/mcp-catalog, LuciferForge/mcp-directory, Nandanhegde1/mcp-directory; 'mcp registry dataset' 0`
- `gh api search/code q='"MCP Registry" repo:github/docs path:content/copilot' :: 15 docs files; opened concepts/context/mcp.md, enterprise/mcp-management.md, change-mcp-registry.md`
- `gh search issues "Smithery Glama PulseMCP" (all repos) :: 15 hits, all 'publish my server' tasks; no comparison`
- `gh search issues "MCP registry vetting" :: 7 hits; only JarvisOSLinux/mcp-registry #20 (own private registry)`
- `gh search issues "subregistry moderation" :: 0 results`
- `gh api search/code q='"Smithery" "Glama" "PulseMCP" "mcp.so" registry review extension:md' :: 772 files, mostly per-project checklists; opened zowe/zowe-mcp docs/mcp-registry-research.md and modelcontextprotocol/servers ADDITIONAL.md`
- `gh api search/code q='"MCP registries" vetting extension:md' :: 67 files; opened OWASP/AISVS C10-01-Component-Integrity.md and a Korean translation of the launch blog`
- `huggingface.co/api/datasets?search=mcp registry \| mcp servers \| mcp security :: 11 datasets (Ashsinha1/mcp-registry-census, crackedvibe/mcp-registry-probe-2026-09, csoai/mcp-registry-self-audit, Vinkius/mcp-registry, MCPShield/mcp-security-scan-2026, automatelab/mcp-servers-catalog, DeepNLP/mcp-servers); none compares registry policies`
- `zenodo.org/api/records?q="model context protocol" registry \| "MCP servers" :: 37,262 noisy hits / 82 hits; only mcp-safeguard scanner (2026-06-02) and MCP-Benchmark artifacts`
- `packages.ecosyste.ms/api/v1/registries and /keywords/mcp :: no MCP registry indexed as a registry; keyword returns npm/PyPI packages only`
- `registry.smithery.ai/servers?pageSize=1 (&verified=true, &isDeployed=true, q=is:verified, q=is:deployed) :: 14,006-14,009; verified 191; deployed 10,713-10,716; detail 'security' null; openapi.json 404`
- `api.cline.bot/v1/mcp/marketplace :: 199 servers; repo 2,411-2,416 submission issues, 2,221-2,226 open, last push 2025-06-24`
- `api.pulsemcp.com/v0beta/servers and /v0.1/servers :: v0beta API_SUNSET; v0.1 requires X-API-Key; docs page Cloudflare-blocked to curl`
- `glama.ai/api/mcp/v1/servers?first=1 :: 401, API key and attribution licence required`
- `web search :: Stacklok ToolHive registry inclusion criteria heuristics MCP servers curated :: stacklok/toolhive-catalog repo and docs.stacklok.com registry-criteria opened`
- `web search (Chinese) :: ModelScope MCP广场 MCP服务 审核 上架 数量 魔搭 :: modelscope.cn/mcp and alianga 8-platform comparison; ModelScope docs JS-only; openapi count 12,436 (4,599 hosted)`
- `web search + raw.githubusercontent.com :: OWASP MCP Top 10 registry supply chain project :: OWASP/www-project-mcp-top-10 MCP04 recommends approved/internal registries; no comparison`
- `web search + fetch mcp-trust.com :: BlueRock MCP Trust Registry :: opened; '12,000+' with conflicting figures; source registries not stated`
- `web search (Chinese) + curl mcpworld.com :: "MCP World" 百度 MCP 广场 mcp.world 服务数量 :: 60,868 services as of 2026-04-01 per baike snippet; baike 403; mcpworld.com JS shell; unverified`
- `web search (Chinese) :: 中国信通院 MCP 安全 标准 评估 "MCP" 服务 可信 2026 :: no CAICT document specific to MCP registries`
- `web search + fetch :: Zed extensions registry "context server" MCP extension review pull request zed-industries/extensions approval :: zed issue #59353 opened; no description of prior review`
- `web search + curl geminicli.com/extensions + fetch releasing docs :: Gemini CLI extensions gallery submission review policy :: 1,782 extensions; 'Google does not vet' disclaimer; daily crawl`
- `web search :: Agentic AI Foundation Linux Foundation MCP registry governance working group 2026 :: no AAIF-level registry governance or moderation document located`
- `web search + fetch :: Astrix Security MCP registry analysis OAuth "8.5%" servers official registry report :: Astrix 'State of MCP Server Security 2025' (2025-10-15): 5,205 GitHub repos, 8.5% OAuth; no registry-vetting content; Practical DevSecOps stats page opened`
- `web search + fetch :: CoSAI Coalition for Secure AI MCP servers audit 34/100 2026 :: CoSAI MCP security guide (2026-01-20) has no registry vetting content; the '17 servers 34/100' audit not located at primary`
- `web search :: CISA OR NCSC OR BSI OR ENISA advisory guidance "Model Context Protocol" MCP servers registry 2026 :: only the NSA CSI surfaced; nothing from NCSC, BSI or ENISA`
- `web search + curl nsa.gov/media.defense.gov (403) + Wayback :: NSA cybersecurity information sheet "Model Context Protocol" June 2026 registries vetting third-party servers :: Wayback copy of CSI_MCP_SECURITY.pdf opened and grepped`
- `web search (Japanese) :: MCPレジストリ 審査 セキュリティ MCPサーバー マーケットプレイス 比較 2026 :: only secondary coverage (CData, ascii.jp, PR TIMES chaos map of 114 services); no Japanese registry with a review policy`
- `web search (Korean) :: MCP 레지스트리 서버 마켓플레이스 보안 검증 심사 2026 :: Kakao PlayMCP surfaced; kakaocorp.com press page opened; review-step wording only in snippets`
- `web search + curl sched.com + curl YouTube playlist :: MCPCon 2026 OR "MCP Dev Summit" registry talk moderation "official registry" video YouTube :: 2026 sessions not enumerable (JS/consent-gated); 2025 'MCP Registry: Designing For Server Discovery' slides opened via jsdelivr mirror — design only`
- `web search :: "USENIX Security" 2026 OR "CCS 2026" OR "NDSS 2026" OR "S&P 2026" accepted paper "Model Context Protocol" servers marketplace measurement :: no venue acceptance confirmed; SoK 2512.08290 opened (no registry comparison); MCPThreatHive 2604.13849, VIPER-MCP 2605.21392 not opened`
- `web search + fetch :: Backslash Security "MCP Server Security Hub" scanned thousands of MCP servers rating :: launch post (2025-06-16) opened`
- `web search + fetch :: MACH Alliance MCP Registry launch 2026 vetting certification :: machalliance.org page opened; no count or launch date`
- `web search + fetch code.claude.com :: Claude Code plugin marketplace OR "Agent Skills" registry review policy malicious skills scanned skills.sh 2026 :: discover-plugins doc opened; Pluto Security practitioner map opened (not carried into verified record)`
- `web search + fetch :: Socket OR Snyk OR "Endor Labs" MCP registry scanning "official MCP registry" malicious servers found August 2026 :: AIR Security 'MCPJacking' (2026-08-27) and MCP Queen July 2026 report opened`
- `web search :: mcp.run Dylibso servlet registry publish review OR Apify MCP store actors review policy :: nothing on mcp.run publishing review; Apify results not about listing review; not opened`
- `web search + fetch learn.microsoft.com + curl connector list :: Microsoft 365 Copilot agent store MCP server publish Partner Center validation review policy :: 'Microsoft MCP server certification' and 'List of all MCP servers' (75 entries) opened`
- `web search (Chinese) + fetch :: 阿里云百炼 MCP市场 提交 MCP 服务 审核 上架 流程 OR 腾讯云 MCP广场 接入 审核 :: Tencent Cloud MCP广场 doc opened (third-party listing paused); Bailian help page has no submission/review policy`
- `web search + fetch :: Snyk ToxicSkills ClawHub 3,984 skills audit February 2026 malicious :: opened (adjacent agent-skills registry)`
- `web search (German) :: MCP-Server Registry Sicherheit Prüfung Marktplatz Vergleich Smithery Glama 2026 heise OR Golem OR BSI :: no German-language sources; Towards AI 403`
- `web search + fetch/curl/Wayback developer.salesforce.com :: Salesforce AgentExchange MCP servers security review listing OR "AWS Marketplace" MCP servers category review 2026 :: Salesforce ISVforce pages exist but 403/JS via every route; concret.io secondary lacks MCP detail; AWS Marketplace 'AI Agents and Tools' not opened`
- `web search (Korean) + curl playmcp.kakao.com + fetch b.kakao.com :: PlayMCP 카카오 MCP 서버 등록 심사 가이드; "등록 및 심사 요청" PlayMCP "나에게만 공개" :: playmcp.kakao.com 2.8 KB JS shell; contest page lacks guide text`
- `web search (Spanish) :: registro oficial MCP servidores seguridad revisión marketplace Smithery Glama análisis 2026 español :: no Spanish-language sources`
- `web search + GitHub API :: "docker/mcp-community-registry" OR "Docker MCP Registry" community registry fork official registry subregistry :: docker/mcp-community-registry is a plain fork (3 stars, pushed 2026-06-04); led to official ecosystem-vision.md, terms-of-service.mdx, design-principles.md (all opened)`
- `web search + arxiv.org + huggingface.co API :: MCPCorpus dataset MCP servers clients Hugging Face arXiv "MCPCorpus" registry snapshot :: arXiv 2506.23474 and HF Snak1nya/MCPCorpus opened: ~14K servers from MCP.so as of 2025-06-03; no vetting content`
- `web search :: "MCP registry" analysis June 2026 OR July 2026 OR August 2026 "servers" spam OR "low quality" OR duplicates official registry blog post data :: MCP Queen July 2026 report opened; org discussion #159 fetch 404`
- `Bash curl :: cursor.com/mcp; docs.windsurf.com/windsurf/cascade/mcp :: Cursor page JS shell; Windsurf docs mention a registry page but no review policy`
- `GitHub trees API :: stacklok/toolhive-catalog; modelcontextprotocol/registry docs tree :: 111 ToolHive server.json (+85 'official', 222 skills); official docs tree revealed terms-of-service.mdx, design-principles.md, ecosystem-vision.md`

## Vendor publications

**Verdict:** exists · 41 supporting sources · 17 not used · 112 searches

### Supporting sources

1. **What nearly 10,000 developer environments reveal about agentic development risk (blog) / Inside the Agentic Development Supply Chain (gated report landing page)** — Snyk (Ricardo Miguel Silva; Snyk Research) — 2026-06-23  
   <https://snyk.io/blog/agentic-development-security-ai-coding-risk/>  
   Snyk's telemetry measurement of MCP prevalence and findings in developer environments; the gated report landing page https://snyk.io/lp/state-of-agentic-dev-supply-chain-report/ repeats the headline figures and adds the 4,524-configuration count.
   - Figures: “50.8% of developers already had at least one MCP server installed” · “4,524 unique server configurations across fewer than 10,000 developers” · “1 in 7 developers with MCP servers had at least one security finding in their setup” · “1 in 12 developers with MCP servers had a high or critical finding” · “392 confirmed prompt injection findings embedded in tool descriptions” · “Among developers with MCP servers installed, the top 1% run 13 or more” · “43% of developers run two or more AI coding environments; 37% were running three or more” · “22.8% of developers had at least one skill installed; 28% of skills exposed agents to uncontrolled third-party content; 98 confirmed malicious code patterns in agent skill files”
   - Sample/method: 'Anonymized telemetry from nearly 10,000 developer environments' (Snyk/ADS early-adopter users) plus agent-skill analysis across enterprise environments; no collection window stated; full report gated behind a form
   - Limitations: Sample is Snyk's own customers/early adopters; 'finding' severity and 'confirmed prompt injection' are defined by Snyk's scanner with no stated precision; 'unique server configurations' undefined; no denominator for the 392 count; landing page mixes 'surveyed' and 'scanned' wording; marketing-adjacent.

2. **2026 State of Agentic AI Adoption, Volume II (press release 'Enterprises Are Blind to Two-Thirds of Their Own AI Attack Surface' + companion PDF)** — Snyk — 2026-08-03  
   <https://snyk.io/news/snyk-2026-state-of-agentic-ai-adoption-volume-ii/>  
   AI-BOM telemetry measurement of MCP-server deployment across enterprise code; exact figures come from the PDF at res.cloudinary.com/snyk/image/upload/v1785759343/Volume_II-2026_The_State_of_Agentic_AI_Adoption_August_2026_a9jyao.pdf.
   - Figures: “33.0% of all organizations use agentic architectures (agents or MCP servers), up from 28.4% in Volume I” · “Across the 3,044 analyzed accounts, 33.0% (1,004 accounts) show evidence of agentic architecture” · “262 deploy agent frameworks only, 237 deploy MCP servers only, and 505 deploy both. That means 50.3% of agentic adopters are running the full stack” · “approximately 1.39 million code repositories” · “~164,000 packages and tools detected across the 3,044 accounts” · “AMER ~36% (671/1,856), EMEA ~30% (251/837)”
   - Sample/method: 'Anonymized and aggregated data sourced from organizations that use Snyk and successfully scanned an AI-BOM beginning May 2026'; Volume I comparison n = 500+
   - Limitations: Snyk-customer sample; press release rounds figures; Vol I vs Vol II samples differ in size and composition so the trend is not like-for-like; adoption measurement, not a vulnerability or privilege measurement.

3. **2026 State of Agentic AI Adoption: Anonymized Insights from 500+ Evo by Snyk AI Discovery Assessments (Volume I)** — Snyk — 2026-01 (PDF CreationDate 2026-02-02)  
   <https://res.cloudinary.com/snyk/image/upload/v1770063689/2026_State_of_Agentic_AI_Adoption_fa95b8.pdf>  
   First Snyk AI-BOM telemetry measurement of MCP-server deployment prevalence in customer code.
   - Figures: “28.4% of organizations use agentic architectures (either Agents or MCP Servers)” · “18.2% deploy MCP servers.” · “Body text: 19.7 % have deployed Model Context Protocol (MCP) servers (internal inconsistency with 18.2%)” · “10.1% use both, signaling platform-level agentic architectures.” · “82.4% of AI tools come from third-party packages.”
   - Sample/method: 'anonymized AI Bill of Materials (AI-BOM) telemetry data across 500+ scans of customers' AI environments in Q4 of 2025 with Evo by Snyk'
   - Limitations: Customer sample; 18.2% vs 19.7% inconsistency unexplained; 'organization' vs 'active organization' denominators unclear; no publication date printed in the PDF.

4. **MCP Security Notification: Tool Poisoning Attacks** — Invariant Labs (now Snyk) — Luca Beurer-Kellner, Marc Fischer — 2025-04-01  
   <https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks.html>  
   Research disclosure introducing Tool Poisoning Attacks, rug pulls and tool shadowing against MCP clients (demonstrated on Cursor); the reference cited by most later academic and vendor work.
   - Figures: “Zapier: 'millions of requests' through MCP endpoints (only number on page)”
   - Sample/method: Proof-of-concept demonstrations; no population
   - Limitations: No prevalence data; vendor blog promoting its own guardrails/scanner.

5. **Invariant Labs Exposes Novel Prompt Injection Attack Vulnerabilities, 'Toxic Flows,' in Agentic Systems & MCP Servers** — Invariant Labs (now Snyk) — 2025-07-29  
   <https://invariantlabs.ai/blog/toxic-flow-analysis.html>  
   Research/product post defining Toxic Flow Analysis (TFA), a hybrid static+runtime framework that scans installed MCP servers and toolsets for dangerous capability combinations; the methodological ancestor of AgentSeal's toxic-flow measurement.
   - Figures: “TFA is a hybrid security analysis framework, which can incorporate both static information about an agent system, its toolsets, and MCP servers, as well as dynamic runtime data” · “The tool automatically identifies potential toxic flows in the agent systems on your machine by scanning MCP servers and toolsets installed in your environment”
   - Sample/method: n/a (framework description; no population measured)
   - Limitations: No measurement; vendor product announcement.

6. **Introducing MCP-Scan: Protecting MCP with Invariant** — Invariant Labs (now Snyk) — 2025-04-11  
   <https://invariantlabs.ai/blog/introducing-mcp-scan.html>  
   Product launch of MCP-Scan (uvx mcp-scan@latest): scans MCP configuration files, connects to servers, retrieves tool descriptions and analyzes them locally and via the Invariant Guardrails API for tool poisoning and cross-origin (cross-server) references.
   - Figures: “The tool scans through your MCP configuration files, connecting to servers and retrieving tool descriptions, analyzing them locally and using the Invariant Guardrails API” · “Cross-Origin Violation: Tool descriptions of server {'add'} explicitly mention tools of other servers”
   - Sample/method: n/a (product)
   - Limitations: Product post; detection relies partly on a remote API; no accuracy figures.

7. **Announcing our partnership with Smithery** — Invariant Labs (now Snyk) — 2025-04-24  
   <https://invariantlabs.ai/blog/smithery-mcp-scan.html>  
   Product/registry-integration announcement: all MCP servers on the Smithery registry are scanned by MCP-Scan and results shown on each server's registry page — the earliest registry-wide scanning deployment found, but with no published aggregate results.
   - Figures: “All MCP servers on Smithery are now scanned for vulnerabilities by Invariant's MCP-Scan.” · “Smithery provides a unified interface to thousands of ready-made AI capabilities”
   - Sample/method: n/a (no aggregate figures published)
   - Limitations: No counts of scanned servers or findings; partnership announcement.

8. **WhatsApp MCP Exploited: Exfiltrating your message history via MCP** — Invariant Labs (now Snyk) — 2025-04-07  
   <https://invariantlabs.ai/blog/whatsapp-mcp-exploited.html>  
   Research demonstration of tool shadowing: a malicious MCP server's tool descriptions make the agent exfiltrate WhatsApp history via a co-installed trusted WhatsApp MCP server.
   - Figures: “The attack is purely based on the fact that the agent is connected to both MCP servers, and that the malicious MCP server's tool descriptions can manipulate the agent's behavior”
   - Sample/method: Single PoC
   - Limitations: No measurement; vendor demo.

9. **GitHub MCP Exploited: Accessing private repositories via MCP** — Invariant Labs (now Snyk) — Marco Milanta, Luca Beurer-Kellner — 2025-05-26  
   <https://invariantlabs.ai/blog/mcp-github-vulnerability.html>  
   Research demonstration of a 'toxic agent flow': a malicious GitHub issue prompt-injects an agent using the GitHub MCP server into leaking private-repo data via a public PR.
   - Figures: “GitHub MCP integration: '14k stars on GitHub'”
   - Sample/method: Single demonstration
   - Limitations: Agent-architecture issue rather than a server code flaw; no measurement; cited by the NSA CSI.

10. **Malicious MCP Server on npm postmark-mcp Harvests Emails** — Snyk — 2025-09-25  
   <https://snyk.io/blog/malicious-mcp-server-on-npm-postmark-mcp-harvests-emails/>  
   Snyk's incident write-up of postmark-mcp (hidden BCC to phan@giftshop[.]club from version 1.0.16) with a timeline and a pointer to run MCP-Scan; complements Koi's original disclosure.
   - Figures: “Current analysis suggests the behavior began around 1.0.16 and persisted in later versions.” · “Bcc: 'phan@giftshop.club' at line 177 of the listed index.js” · “Snyk customers now have access to Snyk AI-BOM and Snyk MCP-Scan in experimental preview”
   - Sample/method: Single-package analysis relying on 'community reports' and third-party analysis
   - Limitations: Incident write-up; no ecosystem numbers; partly secondary to Koi's disclosure; product upsell.

11. **snyk/agent-scan — 'Security scanner for AI agents, MCP servers and agent skills.'** — Snyk (GitHub; successor of invariantlabs-ai/mcp-scan) — created 2025-04-07; pushed 2026-09-11 (GitHub API)  
   <https://github.com/snyk/agent-scan>  
   Open-source product artifact evidencing continued maintenance of Snyk's MCP scanner (the tool evaluated as 'Agent-Scan' by Fudan 2607.11086).
   - Figures: “stargazers_count 3,033 (GitHub API, 2026-09-11)” · “created_at 2025-04-07T14:31:26Z; pushed_at 2026-09-11T09:51:54Z”
   - Sample/method: n/a (repository metadata via api.github.com/repos/snyk/agent-scan)
   - Limitations: Product, not measurement; no published detection-accuracy figures from Snyk itself.

12. **Technical Report: Exploring the Emerging Threats of the Agent Skill Ecosystem** — arXiv; six Snyk-affiliated authors (Luca Beurer-Kellner et al.) — 2026-02-05 (paper date); arXiv v1 2026-05-27  
   <https://arxiv.org/abs/2605.28588>  
   Snyk-authored measurement of agent skills (not MCP servers) using the MCP-scan engine — shows Snyk's measurement capacity but on an adjacent ecosystem.
   - Figures: “We analyzed 3,984 AI agent skills from major marketplaces and found 76 confirmed malicious payloads” · “13.4% of all skills contain at least one critical-level security issue” · “We implement our scanners using the MCP-scan scanning engine”
   - Sample/method: Automated MCP-scan (LLM judges + deterministic rules) over 3,984 skills from clawhub.ai plus top-100 skills.sh; malicious payloads manually confirmed
   - Limitations: Skills, not MCP servers; vendor self-evaluation with its own scanner; not peer-reviewed.

13. **Rethinking MCP Security: A Large-Scale Study of Runtime MCP Servers and Security Scanner Reliability** — arXiv; Fudan University / Shanghai Innovation Institute (Pei Chen et al.) — 2026-07-13  
   <https://arxiv.org/abs/2607.11086>  
   Third-party measurement that evaluates vendor scanners — including Snyk Agent-Scan, Cisco AI Defense MCP-Scanner, Ant Group MCPScan, Lasso mcp-gateway — against 64,611 unique MCP servers and finds their alerts unreliable.
   - Figures: “MCPZoo contains 64,611 unique MCP servers (113,927 in total), with more than 37,288 supporting dynamic analysis.” · “existing scanners report that 96.89% of servers are risky ... less than 50% of sampled alerts are true positives” · “Table 5: Agent-Scan (Snyk) Reported Risk 15,199 / Analyzed Servers 33,107 / 45.91%; MCP-Scanner (Cisco) 8,805 / 33,218 / 26.51%; MCPScan (Ant Group) 28,220 / 35,259 / 80.04%” · “Table 7: Agent-Scan (Snyk) Sampled 78, TP 22, Precision 28.21%; Recall 50.00%. MCP-Scanner (Cisco) 24.64% / 21.21%. MCPScan (Ant Group) 45.53% / 74.29%. mcp-gateway (Lasso) 96.88% / 0.00%. nova-proximity 52.78% / 0.00%”
   - Sample/method: MCPZoo collected to ~Dec 2025; 37,288 interactable servers scanned by eight scanners; precision from manual validation of 32–125 sampled alerts per scanner
   - Limitations: Preprint; small manual-validation samples; Agent-Scan rate-limited (HTTP 429) so coverage differs; scanner versions as of late 2025.

14. **Model Context Protocol (MCP) at First Glance: Studying the Security and Maintainability of MCP Servers** — arXiv (v1 2025-06-16, v5 2026-04-13); Queen's University (Hasan, Li, Fallahzadeh, Rajbahadur, Adams, Hassan); ACM TOSEM doi 10.1145/3814959 (2026-05-12 per Crossref) — 2025-06-16 (arXiv); 2026-05-12 (TOSEM)  
   <https://arxiv.org/abs/2506.13538>  
   Third-party empirical study of 1,899 open-source MCP servers that uses Invariant's mcp-scan as the MCP-specific scanner and states it was the only actively maintained open-source dynamic MCP scanner at the time.
   - Figures: “we evaluate 1,899 open-source MCP servers” · “7.2% of servers contain general vulnerabilities, and 5.5% exhibit MCP-specific tool poisoning” · “66% exhibit code smells, 14.4% contain ten bug patterns” · “At the time of our study, mcp-scan is the only actively maintained open-source dynamic MCP [scanner]”
   - Sample/method: 1,899 open-source servers; general static analyzer plus mcp-scan; health metrics
   - Limitations: Open-source servers only; tool-poisoning rate inherits mcp-scan's precision; dl.acm.org 403 so venue confirmed via Crossref.

15. **From Component Manipulation to System Compromise: Understanding and Detecting Malicious MCP Servers** — arXiv (v1 2026-04-02, v2 2026-05-19); Fudan University (Yiheng Huang, Bihuan Chen et al.) — 2026-04-02  
   <https://arxiv.org/abs/2604.01905>  
   Third-party detector paper that benchmarks MCP-Scan (invariantlabs-ai), AI-Infra-Guard (Tencent) and MCPScan (Ant Group) on a 114-server malicious PoC dataset and cites the postmark-mcp incident.
   - Figures: “we build the first component-centric PoC dataset of 114 malicious MCP servers” · “Connor achieves an F1-score of 94.6%, outperforming the state of the art by 8.9% to 59.6%. In real-world detection, Connor identifies two malicious servers.”
   - Sample/method: Author-built PoC dataset; three open-source baselines; one real-world detection run
   - Limitations: PoC dataset, not in-the-wild prevalence; TOSEM acceptance unverifiable (placeholder DOI); postmark cited via The Hacker News.

16. **Anthropic Software Directory Policy** — Anthropic (Claude Help Center) — last updated 2026-04-15 (lastUpdatedDate 2026-04-15T01:48:09Z)  
   <https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy>  
   Anthropic's review policy for MCP servers and skills listed in its directory: codifies anti-tool-poisoning rules (no hidden/obfuscated/encoded instructions, no dynamic pulling of behavioral instructions, no coercing Claude into calling other tools) and mandates tool annotations and OAuth 2 for remote servers.
   - Figures: “Instructional Software must not contain hidden, obfuscated, or encoded instructions.” · “Instructional Software must not direct Claude to dynamically pull behavioral instructions from external sources for Claude to execute.” · “Instructional Software must not intentionally call or coerce Claude into calling other external software, tools, databases, or resources unless requested and intended by a user.” · “MCP servers must provide all applicable annotations for their tools, in particular readOnlyHint, destructiveHint, and title.” · “Remote MCP servers that connect to a remote service and require authentication must use secure OAuth 2.” · “Local MCP servers must be built with reasonably current versions of all dependencies, including packages in node_modules.”
   - Sample/method: n/a (policy; supersedes the 'Anthropic MCP Directory Policy')
   - Limitations: Policy text only; no data on how many submissions are reviewed, rejected or removed, and no measurement of compliance.

17. **How we contain Claude across products** — Anthropic (Engineering) — 2026-05-25  
   <https://www.anthropic.com/engineering/how-we-contain-claude>  
   Anthropic's product-architecture post on containment: names MCP servers as an untrusted-content vector, describes moving local MCP servers outside the Claude Cowork VM to run like Claude Desktop's local MCPs, and reports prompt-injection robustness figures.
   - Figures: “On Gray Swan's Agent Red Teaming benchmark ... Claude Opus 4.7 holds attack success to roughly 0.1% on single attempts, and around 5–6% after 100 adaptive attempts.” · “Claude Code auto mode catches roughly 83% of overeager behaviors before they execute.” · “The result was an 84% reduction in permission prompts, and we open-sourced the runtime” · “MCP servers, third-party plugins, and web search tools all feed content into the agent's context from sources you don't control.” · “Separately, we also moved local MCP servers outside the VM.” · “A remote tool—a hosted MCP server, a cloud connector—can change behavior at any point after you've approved it; your install-time trust decision may no longer apply.”
   - Sample/method: Gray Swan Agent Red Teaming benchmark (external); internal Claude Code telemetry for the 83%/84% figures; no MCP-ecosystem sample
   - Limitations: Figures concern Claude's model/product robustness, not the MCP ecosystem; 7 MCP mentions in a broader containment essay; vendor self-report.

18. **Making Claude Code more secure and autonomous with sandboxing** — Anthropic (Engineering) — 2025-10-20  
   <https://www.anthropic.com/engineering/claude-code-sandboxing>  
   Product post announcing the open-source sandbox runtime that 'can be used to sandbox arbitrary processes, agents and MCP servers'.
   - Figures: “In our internal usage, we've found that sandboxing safely reduces permission prompts by 84%.” · “This can be used to sandbox arbitrary processes, agents and MCP servers.”
   - Sample/method: Internal usage telemetry (no sample stated)
   - Limitations: Single MCP mention; product announcement; no ecosystem data.

19. **Security Best Practices (MCP specification)** — Model Context Protocol project (modelcontextprotocol.io; Anthropic-originated, but the page carries no Anthropic byline) — served as the 2025-11-25 revision (308 redirect to /docs/2025-11-25/tutorials/security/security_best_practices)  
   <https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices>  
   Normative spec guidance enumerating confused deputy, token passthrough, SSRF, session hijacking, local MCP server compromise, OAuth URL validation, stdio proxy transport and scope minimization with MUST/SHOULD mitigations.
   - Figures: “MCP servers MUST NOT accept any tokens that were not explicitly issued for the MCP server.” · “MCP Servers MUST NOT use sessions for authentication.” · “If an MCP client supports one-click local MCP server configuration, it MUST implement proper consent mechanisms prior to executing commands.”
   - Limitations: Spec guidance, no measurement; governance attribution (Anthropic vs Agentic AI Foundation) not on the page.

20. **Tool Annotations as Risk Vocabulary: What Hints Can and Can't Do** — Model Context Protocol blog — Ola Hungerford (maintainer), Sam Morrow (GitHub), Luca Chang (AWS) — 2026-03-16  
   <https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/>  
   Project design post conceding that tool annotations are unverifiable hints and that exfiltration guarantees require network controls or sandboxing; lists SEPs #1913, #1984, #1561, #1560, #1487.
   - Figures: “An untrusted server can lie. A server can claim readOnlyHint: true and delete your files anyway.” · “If you need a guarantee that a tool can't exfiltrate data, that's a job for network controls or sandboxing, not a boolean hint.” · “GitHub's read-only mode enabled by about 17% of users”
   - Sample/method: 17% is a GitHub-reported adoption number with no stated method
   - Limitations: Not Anthropic staff; one unmethodized datapoint; design commentary.

21. **SANDWORM_MODE: Shai-Hulud-Style npm Worm Hijacks CI Workflows and Poisons AI Toolchains** — Socket (Threat Research Team) — 2026-02-20  
   <https://socket.dev/blog/sandworm-mode-npm-worm-ai-toolchain-poisoning>  
   Incident write-up: the McpInject module drops a malicious MCP server (index_project, lint_check, scan_dependencies) into Claude Code/Claude Desktop/Cursor/VS Code Continue/Windsurf configs with prompt-injecting tool descriptions that harvest SSH keys, AWS creds and npm tokens.
   - Figures: “19 malicious npm packages” · “2 npm publisher aliases (official334 and javaorg)” · “4 sleeper packages” · “9 LLM providers (OpenAI, Anthropic, Google, Groq, Together, Fireworks, Replicate, Mistral, Cohere)” · “a 48-hour base delay plus per-machine jitter of up to 48 additional hours”
   - Sample/method: Socket analysis of the packages themselves
   - Limitations: Incident, not ecosystem measurement; no victim counts for the MCP component.

22. **Mini Shai-Hulud, Miasma, and Hades Worms Target Bioinformatics and MCP Developers via Malicious PyPI Wheels** — Socket (Kirill Boychenko) — 2026-06-08  
   <https://socket.dev/blog/mini-shai-hulud-miasma-and-hades-worms-target-bioinformatics-and-mcp-developers-via-malicious>  
   Incident write-up in which MCP-named PyPI typosquats (langchain-core-mcp, instructor-mcp, openai-mcp, tiktoken-mcp, ray-mcp-server) are used as lures, including a .pth hook that runs a bundled _index.js with Bun.
   - Figures: “471 affected artifacts across npm and PyPI, comprising 411 npm artifacts across 106 packages and 60 PyPI artifacts across 37 packages” · “23 additional malicious package-version artifacts (added to 37 previously documented)”
   - Sample/method: Socket enumeration of malicious package-version artifacts
   - Limitations: MCP names are lures, not analysis of MCP servers; counts cover the whole campaign.

23. **Socket MCP Adds Org Alerts, Threat Feed Review, and Package Inspection** — Socket — 2026-06-18 (datePublished 2026-06-18T21:02:45Z)  
   <https://socket.dev/blog/socket-mcp-supply-chain-investigation>  
   Product post: Socket's own MCP server exposes org alerts, the Socket threat feed and package-file inspection to AI assistants — the only Socket MCP item beyond incident write-ups.
   - Figures: “Socket MCP now exposes the Socket threat feed through an authenticated tool.”
   - Sample/method: n/a (product)
   - Limitations: Product feature; no research or measurement of MCP servers.

24. **First Malicious MCP in the Wild: The Postmark Backdoor That's Stealing Your Emails** — Koi Security (Idan Dardikman) — 2025-09-25  
   <https://web.archive.org/web/20260410170714id_/https://www.koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft>  
   Original disclosure of postmark-mcp: 15 benign versions, then 1.0.16 added a one-line BCC to giftshop.club; flagged by Koi's risk engine.
   - Figures: “downloaded 1,500 times every single week” · “For 15 versions - FIFTEEN - the tool worked flawlessly” · “Buried on line 231, our risk engine found this gem” · “impact 'guestimate': ... maybe 20% are actively in use; about 300 organizations”
   - Sample/method: Single-package analysis; npm weekly download count; impact explicitly a 'guestimate'
   - Limitations: Incident; speculative impact; Wayback capture (koi.ai now redirects to Palo Alto Networks).

25. **MCP Malware Wave Continues: A Remote Shell in Disguise** — Koi Security (Tuval Admoni) — 2025-09-30  
   <https://web.archive.org/web/20260411025124id_/https://www.koi.ai/blog/mcp-malware-wave-continues-a-remote-shell-in-backdoor>  
   Incident write-up of @lanyer640/mcp-runcommand-server, a working MCP server weaponized from version 1.0.6 with two reverse shells to 45.115.38.27:2333.
   - Figures: “Malicious Version: 1.0.6 and later” · “First published on September 6, 2025” · “The package accumulated hundreds of installs during this period”
   - Sample/method: Single-package analysis flagged by Koi's marketplace-scanning risk engine
   - Limitations: Incident; vague install count; Wayback capture.

26. **PromptJacking: The Critical RCEs in Claude Desktop That Turn Questions Into Exploits** — Koi Security (Oren Yomtov) — 2025-11-05  
   <https://web.archive.org/web/20251212134615id_/https://www.koi.ai/blog/promptjacking-the-critical-rce-in-claude-desktop-that-turn-questions-into-exploits>  
   Vulnerability disclosure in three Anthropic-published Claude Desktop Extensions (.mcpb-packaged MCP servers: Chrome, iMessage, Apple Notes) exploitable via prompt injection; CVSS 8.9 confirmed by Anthropic, fixed in 0.1.9.
   - Figures: “Three official Claude extensions. 350,000+ downloads. All vulnerable to remote code execution” · “confirmed as high-severity (CVSS 8.9) by Anthropic” · “July 3, 2025: Vulnerabilities detected and reported by Koi; August 28, 2025: Full fixes released in version 0.1.9”
   - Sample/method: Manual vulnerability research on three extensions; download count unsourced
   - Limitations: Concerns Anthropic-authored servers, not third-party ecosystem; Wayback capture.

27. **GlassWorm Hits MCP: 5th Wave with New Delivery Techniques** — Koi Security (Lotan Sery) — 2026-03-16  
   <https://web.archive.org/web/20260327044742id_/https://www.koi.ai/blog/glassworm-hits-mcp-5th-wave-with-new-delivery-techniques>  
   Incident write-up: @iflow-mcp/watercrawl-watercrawl-mcp, a clone of the WaterCrawl MCP server with the GlassWorm invisible-Unicode loader after 26 lines of legitimate MCP setup code.
   - Figures: “Our risk engine flagged a new npm package on March 12: @iflow-mcp/watercrawl-watercrawl-mcp” · “Five versions published in a single day - 1.3.0 through 1.3.4. All of them are malicious from the very first release.” · “Open VSX - Over 72 New Malicious Extensions”
   - Sample/method: Koi risk-engine detection plus manual analysis of one package family
   - Limitations: Single incident; no download/victim counts for the MCP package; Wayback capture.

28. **Command Injection Flaw in Framelink Figma MCP Server Puts Nearly 1 Million Downloads at Risk** — Koi Security — 2025-10-10 (Wayback capture date; page dated October 10, 2025)  
   <https://web.archive.org/web/20251010131149id_/https://www.koi.ai/blog/command-injection-flaw-in-framelink-figma-mcp-server-puts-nearly-1-million-downloads-at-risk>  
   Koi's write-up of CVE-2025-53967 in figma-developer-mcp (found by Imperva), tying it to Koi's earlier local-MCP/Chrome-sandbox-escape research.
   - Figures: “Framelink's figma-developer-mcp package, with nearly 1 million downloads and over 11,000 GitHub stars, contained a flaw (CVE-2025-53967) that allowed attackers on the same network to execute arbitrary commands on the host machine.” · “This vulnerability was discovered by Imperva Threat Research in July 2025”
   - Sample/method: Single-CVE commentary; download and star counts unsourced
   - Limitations: Secondary to Imperva's discovery; no measurement; Wayback capture.

29. **Trust Me, I'm Local: Chrome Extensions, MCP, and the Sandbox Escape** — Koi Security — 2025-04-24 (page date)  
   <https://web.archive.org/web/20251005060112id_/https://www.koi.ai/blog/trust-me-im-local-chrome-extensions-mcp-and-the-sandbox-escape>  
   Earliest Koi MCP post: a PoC in which an unprivileged Chrome extension connects to a local SSE MCP server on localhost:3001 (filesystem and Slack servers) and executes privileged actions, framed as a Chrome sandbox escape via unauthenticated local MCP.
   - Figures: “Next we built a Chrome extension that runs in the background and attempts to connect to localhost:3001 - a commonly used port for local SSE-based MCP servers.” · “a simple Chrome extension, without any special permissions, can breach the sandbox, connect to a local MCP server, and execute privileged actions on behalf of the user.”
   - Sample/method: PoC triggered by Koi's detection engine flagging an extension talking to localhost
   - Limitations: PoC; no count of exposed local MCP servers; Wayback capture.

30. **State of MCP Security 2026 (Annual Report)** — Canopii (index.canopii.dev) — 2026-07 (cover July 2026; PDF CreationDate 2026-07-07)  
   <https://www.canopii.dev/State%20of%20MCP%20Security%202026.pdf>  
   Largest vendor registry-scale measurement found: 11,524 MCP registry servers scored in June 2026 for code sinks, rug pulls, install scripts, unpinned dependencies, sandboxing, auth and signing.
   - Figures: “11,524 servers scored” · “830 servers graded D or F” · “232 servers with a confirmed dangerous code sink — eval, shell injection, unsafe deserialization” · “184 versions quietly changed their tool definitions after publication; Roughly 170 distinct servers showed at least one rug pull” · “78% of checked servers don't pin their dependencies (8,735 of 11,141)” · “1,617 servers ship dependencies with known, published vulnerabilities right now” · “260 run install scripts” · “7 packages confirmed as typosquats of legitimate MCP servers”
   - Sample/method: 'Canopii scanned the MCP registry in June 2026 and scored 11,524 servers on their latest version via static analysis, supply-chain checks, live endpoint probes, and AI-assisted review. Percentages are of checked servers per control; 84% of scored servers were verified at ≥80% confidence.'
   - Limitations: Marketing report for a scoring product; varying per-control denominators; AI-assisted review with unstated false-positive rate; 'rug pull' = definition change, not proven malice; server names withheld so unreproducible; single snapshot.

31. **555 MCP Servers Have Toxic Data Flows. Here's What We Found.** — AgentSeal Research — 2026-03-20  
   <https://agentseal.org/blog/toxic-data-flows-mcp-servers>  
   Vendor measurement applying toxic-flow analysis (LLM capability tagging + pairwise flow checks) to 5,125 MCP servers, with runtime tests on 113; credits Invariant Labs for early tool-poisoning detection.
   - Figures: “After scanning 5,125 MCP servers with 53,533 total security findings, we found toxic data flows in 555 servers, including 151 out of roughly 2,100 servers scoring 70 or above.” · “We then runtime-tested 113 of these servers by actually calling their tools with adversarial inputs.” · “We validated the classifier against 100 manually reviewed flows and found 80-85% precision.”
   - Sample/method: 5,125 servers from AgentSeal's registry benchmark; Claude Opus tagging into private_data/untrusted_content/public_sink/destructive/privileged; pairwise flow analysis; 100-flow validation; 113 runtime tests
   - Limitations: Tied to a scoring product; sample source not fully specified; 15–20% false positives; runtime outcomes only partially reported; static tool pairs do not prove exploitability.

32. **State of MCP Server Security 2025: 5,200 Servers, Credential Risks, and an Open-Source Fix** — Astrix Security (Tal Skverer) — 2025-10-15  
   <https://astrix.security/learn/blog/state-of-mcp-server-security-2025/>  
   Vendor measurement of credential handling across 5,200+ open-source MCP servers found via GitHub API and classified by LLM over README files.
   - Figures: “We analyzed over 5,200 unique, open-source Model Context Protocol (MCP) server implementations” · “Approximately 88% of servers require credentials.” · “Over half (53%) rely on static API keys or Personal Access Tokens (PATs)” · “Only 8.5% use OAuth” · “79% of API keys are passed via simple environment variables.” · “26.4% of servers landed in the 'Unknown' bucket” · “we estimate that there are a total of 20,000 repositories in GitHub implementing MCP servers”
   - Sample/method: GitHub API search (star-ordered, language-specific, 1,000-result cap) -> LLM analysis of README.md for credential type and consumption method; ~30% drop from downloaded repos to real servers
   - Limitations: README-only LLM classification; skewed to highly-starred repos; GitHub only; 20,000 total is an estimate; promotes Astrix's tool.

33. **Classic Vulnerabilities Meet AI Infrastructure: Why MCP Needs AppSec** — Endor Labs (Peyton Kennedy) — 2026-01-23  
   <https://www.endorlabs.com/learn/classic-vulnerabilities-meet-ai-infrastructure-why-mcp-needs-appsec>  
   Vendor blog restating Endor Labs' 2025 Dependency Management Report measurement of sensitive-API use across 2,614 MCP implementations.
   - Figures: “among 2,614 MCP implementations” · “82% use file system operations prone to Path Traversal (CWE-22)” · “67% use sensitive APIs related to Code Injection (CWE-94)” · “34% use sensitive APIs related to Command Injection (CWE-78)” · “Cross-Site Scripting (CWE-79, 7%), SQL Injection (CWE-89, 6%), and Open Redirect (CWE-601, 5%)”
   - Sample/method: 2,614 MCP implementations; selection and analysis method not described in the article; underlying report not opened
   - Limitations: Measures potential (sensitive-API use), not confirmed vulnerabilities; no selection method, language mix or collection date; secondary to the report.

34. **Exposing the Unseen: Mapping MCP Servers Across the Internet** — Knostic (Knostic Team) — 2025-07-17  
   <https://www.knostic.ai/blog/mapping-mcp-servers-study>  
   Vendor internet-exposure measurement via Shodan fingerprinting with manual verification of a sample by read-only tools/list.
   - Figures: “We identified a total of 1,862 MCP servers exposed to the internet.” · “From this set, we manually verified a sample of 119.” · “All 119 servers granted access to internal tool listings without authentication.” · “a script that contains more than 100 Shodan filters”
   - Sample/method: Shodan (>100 filters) -> 1,862 candidates; 119 manually verified via tools/list only
   - Limitations: Only 119 verified with unstated sampling; fingerprint false-positive rate unknown; Shodan-only; short blog.

35. **Update on Exposed MCP Servers: The Threat Widens to the Cloud** — Trend Micro / TrendAI (Alfredo Oliveira, David Fiser) — 2026-04-28  
   <https://www.trendaisecurity.com/en-us/resources-insights/deep-research/update-on-exposed-mcp-servers-the-threat-widens-to-the-cloud>  
   Vendor follow-up internet-exposure scan with a two-point time series (492 in July 2025 -> 1,467 in 2026) and ZDI disclosures in community MCP servers.
   - Figures: “Our initial scan revealed 492 confirmed instances (July 2025)” · “1,467 exposed MCP servers” · “1,227 Legacy Server-Sent Events (SSE) servers” · “execute_sql tool found on 70 hosts” · “Graphiti Agent Memory found on 39 hosts” · “At least three MCP servers utilize the 'progress_note' feature to access patients' medical records” · “ZDI-CAN-27969 / CVE-2026-5059 and ZDI-CAN-27968 / CVE-2026-5058 — aws-mcp-server — CVSS 9.8; ZDI-CAN-28042 — Microsoft — CVSS 9.8”
   - Sample/method: Internet scan for MCP servers without client authentication or traffic encryption; tooling, date window and dedup not detailed
   - Limitations: Methodology undocumented; point-in-time; 'exposed' ≠ exploited; original July 2025 post not opened.

36. **We Ran a Live Handshake Against 995 MCP Servers. Only 39 Are Verified.** — MCPExplorer — 2026-07-04 (updates through 2026-07-07)  
   <https://mcpexplorer.com/blog/state-of-mcp-security>  
   Directory vendor's live-handshake measurement that classifies extracted tools by read/write/destructive — the closest published approximation of a declared privilege surface census.
   - Figures: “995 servers indexed; 277 (28%) completed a live tools/list handshake; 39 (4%) earned Verified status” · “59% of reachable servers expose at least one write tool” · “67 servers expose a tool classified as destructive” · “3,565 extracted tools: 41% read-only, 26% write, 6% destructive, 26% unclassified” · “Median 7 tools per server; maximum 622 (AdButler)” · “517 servers answered the handshake with 401/403”
   - Sample/method: Real MCP handshakes (remote over network; local/stdio in a sandbox with memory/CPU/PID limits and no secrets); deterministic rule classification of tool names/descriptions
   - Limitations: Small curated sample; percentages apply to the 277 readable servers; 26% of tools unclassified; classification by name rules, not observed behavior; 'Verified' badge product.

37. **Threat Research: Hundreds of MCP Servers Vulnerable to Abuse** — Backslash Security (Backslash Research Team) — 2025-06-25  
   <https://www.backslash.security/blog/hundreds-of-mcp-servers-vulnerable-to-abuse>  
   Early vendor code-scan of 'thousands' of public local MCP servers reporting network binding ('NeighborJack') and command-execution weaknesses; sample size given only as 'thousands'.
   - Figures: “The Backslash team conducted research across thousands of publicly available locally-executed MCPs and analyzed their code” · “The most common issue we found, with hundreds of cases observed, was MCP servers that were explicitly bound to all network interfaces (0.0.0.0)” · “The second most common issue, dozens of instances, MCP servers were discovered that allow arbitrary command execution on the host machine.”
   - Sample/method: Static code scan of thousands of publicly available locally-executed MCP servers for vulnerabilities and malicious patterns (tool poisoning, etc.); exact counts not given
   - Limitations: Only order-of-magnitude figures ('thousands', 'hundreds', 'dozens'); no methodology detail; promotes the Backslash MCP hub.

38. **MCP Servers: The New Security Nightmare** — Equixly — 2025-03-29 (datePublished 2025-03-29T09:43:17+00:00)  
   <https://equixly.com/blog/2025/03/29/mcp-server-new-security-nightmare/>  
   Earliest vendor vulnerability-rate figures for MCP servers (widely re-cited '43% command injection'), from assessments of popular implementations with no stated sample size.
   - Figures: “Command Injection Vulnerabilities: 43% of tested implementations contained command injection flaws” · “Path Traversal/Arbitrary File Read: 22% allowed accessing files outside intended directories” · “SSRF Vulnerabilities: 30% permitted unrestricted URL fetching” · “Vendor response: 30% acknowledged and released fixes; 45% claimed the security risks were 'theoretical' or 'acceptable'; 25% did not respond”
   - Sample/method: 'security assessments of some of the most popular MCP server implementations over the past month'; number of implementations not stated
   - Limitations: No sample size, selection or method; percentages unreproducible; vendor blog.

39. **The Mother of All AI Supply Chains: Critical, Systemic Vulnerability at the Core of Anthropic's MCP** — OX Security (Moshe Siman Tov Bustan, Mustafa Naamnih, Nir Zadok, Roni Bar) — 2026-04-15  
   <https://www.ox.security/blog/the-mother-of-all-ai-supply-chains-critical-systemic-vulnerability-at-the-core-of-the-mcp/>  
   Vendor disclosure campaign on StdioServerParameters-driven command execution across SDK-based apps, with large scale claims and OX's account that Anthropic deemed the behaviour by design.
   - Figures: “The vulnerability ripples through a supply chain with 150M+ downloads, 7,000+ publicly accessible servers — and up to 200,000 vulnerable instances in total.” · “Through over 30 responsible disclosures and 10+ High/Critical CVEs, OX Security has worked to patch individual projects.” · “We successfully executed commands on six live production platforms” · “Anthropic confirmed the behavior is by design and declined to modify the protocol.”
   - Sample/method: 30+ disclosures, 10+ CVEs, 6 live platforms; derivation of 7,000+/200,000 not disclosed
   - Limitations: Scale figures unmethodized; 'by design' is OX's characterization; marketing tone.

40. **Deadbugz: Currently Active MCP Supply-Chain Campaign** — Pillar Security (Ariel Fogel and co-author) — 2026-08-12  
   <https://www.pillar.security/blog/deadbugz-currently-active-mcp-supply-chain-campaign>  
   Most recent vendor incident write-up: PR-based injection of a malicious remote/local MCP server whose tools/list and prompts/get responses switch to credential-hunting instructions after three tools/call requests per client (runtime-gated metadata poisoning).
   - Figures: “23 identified campaign-related pull requests from GitHub account zellkernel; 19 were closed and four remained open” · “17 configure a remote MCP server; 4 reference a hidden local Python path; 2 are directory or listing submissions” · “an in-memory, per-client counter for tools/call requests. Once it reaches three, subsequent tools/list and prompts/get responses change.”
   - Sample/method: Incident analysis of PRs and the served endpoint; no population measurement
   - Limitations: No compromise counts; second author name not rendered; CSA secondary notes unreachable (403).

41. **Model Context Protocol (MCP): Security Design Considerations for AI-Driven Automation (CSI U/OO/6030316-26)** — U.S. National Security Agency — 2026-05 (Ver. 1.0; PDF CreationDate 2026-05-19)  
   <https://web.archive.org/web/2026id_/https://www.nsa.gov/Portals/75/documents/Cybersecurity/CSI_MCP_SECURITY.pdf>  
   Government guidance with no data, useful as an authoritative index of which vendor MCP research is cited (Invariant Labs GitHub/WhatsApp/Toxic Flows, Microsoft, Oligo CVE-2025-49596, HiddenLayer, Docker MCP Horror Stories, CoSAI-OASIS, Anthropic's MCP Registry announcement).
   - Figures: “MCP's rapid proliferation has outpaced the development of its security model.” · “(CWE) categories (CWE-77, CWE-78, CWE-94, CWE-95)” · “References [14] Invariantlabs GitHub MCP Exploited; [15] Invariantlabs WhatsApp MCP Exploited; [17] Invariantlabs Toxic Flows; [18] Microsoft; [19] Oligo CVE-2025-49596; [12] HiddenLayer; [24] Docker MCP Horror Stories; [22] David Soria Parra, Anthropic, Introducing the MCP Registry”
   - Sample/method: n/a (guidance)
   - Limitations: Not a vendor; no measurement; nsa.gov returns 403 so the Wayback PDF was used.

### Not used

- <https://www.koi.ai/blog/ (live)> — Live koi.ai now redirects to the Palo Alto Networks Cortex Agentic Endpoint Security page after the Feb 2026 acquisition; all six Koi posts were opened from web.archive.org captures instead (listed under supporting with archive URLs).
- <https://blog.phylum.io> — Direct fetch fails (connection); Wayback Jan 22 2026 snapshot shows last posts from late 2024/early 2025 with no MCP post; phylum.io redirects to veracode.com. Supports NOT_FOUND only by absence.
- <https://intel.aikido.dev/malware?search=mcp> — Feed is JS-rendered; could not verify whether Aikido Intel carries MCP-package malware entries from static HTML.
- <https://www.veracode.com/blog> — Index is JS-rendered with no post links in HTML; sitemap (1,086 URLs) has zero 'mcp' slugs; no Veracode MCP research located.
- <https://dl.acm.org/doi/10.1145/3814959> — HTTP 403; TOSEM venue/date for 2506.13538 confirmed via Crossref CSL-JSON instead.
- <akamai.com/.../new-mcp-specification-security-teams-must-prepare (path as first recorded)> — HTTP 403; not opened; title only from Hacker News.
- <labs.cloudsecurityalliance.org (CSA research notes on Deadbugz)> — HTTP 403; not opened; Pillar primary used instead.
- <https://www.blackhat.com/us-26/ (briefings)> — Direct 403; the search used a Wayback copy of sessions.json (Check Point, Zenity MCP-mentioning briefings) but that is not in the verified record and was not used for the verdict.
- <trendmicro.com en_us July 2025 'MCP Security: Network-Exposed Servers Are Backdoors to Your Private Data'> — URL returned 404; the 492-server figure is taken only from the April 2026 TrendAI update.
- <https://api.semanticscholar.org (paper/search)> — HTTP 429 on all three queries; no data.
- <https://dblp.org/search/publ/api> — Anti-bot challenge page; no data.
- <https://owasp.org/www-project-mcp-top-10> — Opened during the search (beta; next release Oct 2026) but not in the verified record and not vendor-authored; not used for the verdict.
- <OASIS press release 2026-01-27 / CoSAI MCP Security white paper> — Opened during the search but not in the verified record; github.com raw doc returned 429; standards body, not a vendor.
- <Trail of Bits blog category /categories/mcp/ (6 posts Apr–Nov 2025), Cisco MCP Scanner launch (2025-10-23), Unit 42 MCP sampling (2025-12-05), Docker MCP Horror Stories issue 1 (2025-07-31), Microsoft indirect-injection-in-MCP (2025-04-28), Snyk ToxicSkills/Leaky Skills blog posts> — Reported opened during the search but absent from the verified record; not re-opened for the write-up, so excluded from supporting and counted only as leads.
- <practical-devsecops 'MCP Security Statistics 2026', adversa.ai monthly MCP roundups (Jun/Sep 2026), the-agent-report 'Q3 2026: 14 CVEs, 200,000 exposed servers'> — Secondary aggregators found in search but not opened.
- <Bindfort (5/5 official servers with vulnerable transitive SDK 1.0.1) and Zenodo 'Major Labs State of MCP' dataset (10.5281/zenodo.22674847)> — Surfaced via HN Algolia / OpenAlex but not opened; Zenodo item is not vendor-authored.
- <CSDN / cn-sec / bex.co / ByteDive (Chinese and Korean coverage)> — Secondary coverage only; no Tencent Zhuque Lab, Ant Group, KISA or AhnLab primary located or opened.

### Open questions from the sweep

- Snyk 'Inside the Agentic Development Supply Chain' full report is gated: collection window, definition of 'unique server configuration', per-severity breakdown and validation method for the 392 prompt-injection findings could not be checked.
- Snyk Volume I prints 18.2% (summary/chart) and 19.7% (body) for MCP deployment; which denominator is intended is unresolved.
- Trend Micro's original July 2025 post (492 exposed servers) was not opened (en_us URL 404); its scan method and whether the 1,467 figure is like-for-like remain unverified.
- Backslash gives only 'thousands'/'hundreds'/'dozens'; whether an exact sample and method exist elsewhere (mcp.backslash.security hub is a JS shell) is unknown.
- Equixly's 43%/22%/30% figures have no stated n; whether a fuller methodology was ever published is unknown.
- OX Security's 7,000+ servers / 200,000 instances derivation and Anthropic's actual response text are undisclosed.
- Whether Aikido Intel's JS-rendered malware feed contains MCP-package entries (and how many) could not be determined; Aikido's NOT_FOUND rests on sitemap absence plus one advisory (AIKIDO-2026-329399) seen only in a search snippet.
- Veracode's SCA vulnerability database reportedly lists MCP packages; whether Veracode Threat Research has any unindexed MCP write-up (blog index is JS-rendered) is unresolved.
- Koi's October 2025 'The MCP Backdoor' webinar and Koi/Palo Alto Networks content after the April 2026 acquisition were not opened; whether Koi published any aggregate count of malicious MCP packages flagged by its risk engine is unknown.
- Black Hat USA 2026 (Zenity 'tens of thousands of skills', Check Point framework CVEs) and DEF CON 34 (Wiz/Google LiteLLM MCP auth bypass 'across thousands of real-world instances'; Tenet Security 'est 15,000+ organizations exposed via Cloudflare MCP alone') talks were seen only as abstracts; slides/recordings could hold measurements not captured here.
- Chinese primary sources (Tencent Zhuque Lab AI-Infra-Guard, Ant Group MCPScan write-ups, TC260 guides) were not located; they may contain registry-scale scan results given their scanners were evaluated by Fudan.
- OWASP MCP Top 10 (beta, next release Oct 2026) and the CoSAI/OASIS MCP security white paper (Jan 2026) were opened only during the search; whether either cites vendor measurements beyond those listed is unchecked.
- The Zenodo 'Major Labs State of MCP' longitudinal dataset (2026-09-09) and MSR 2026 'Large-Scale Dataset of MCP Implementations on GitHub' are non-vendor datasets that may already cover parts of the install-time census gap; not opened.
- Whether Socket's threat feed exposes an MCP-specific slice (counts of malicious MCP-named packages) via the Socket MCP product or API was not tested.

### Searches run

- `export.arxiv.org/api (curl) :: all:"model context protocol" max_results=400 + page 2, sortBy=submittedDate :: totalResults=539; saved va_phrase*.xml`
- `export.arxiv.org/api :: all:MCP AND all:server max_results=400 :: 254 entries`
- `export.arxiv.org/api :: all:MCP AND all:security max_results=400 :: 264 entries`
- `local python over va_*.xml :: dedup + regex filter, grep vendor names (anthropic\|socket\|snyk\|invariant\|phylum\|veracode\|aikido\|koi\|toxic flow\|mcp-scan\|agent scan) :: 661 unique papers, 358 MCP+security; Snyk only as baseline tool in 2605.07836; no abstract mentions Socket/Phylum/Veracode/Aikido/Koi`
- `export.arxiv.org/api :: au:Beurer-Kellner :: 13 entries incl. 2605.28588 (Snyk skills report); none MCP-specific in abstract`
- `export.arxiv.org/api :: au:Fischer_Marc AND all:agent :: 4 entries; no MCP paper`
- `export.arxiv.org/api :: all:"Invariant Labs" :: 0 entries`
- `export.arxiv.org/api :: all:snyk :: 13 entries; 2606.15762 (Snyk VulnBench JS, not MCP), 2605.07836 (third-party)`
- `export.arxiv.org/api :: all:anthropic AND all:"model context protocol" :: 17 entries, none Anthropic-authored`
- `export.arxiv.org/api :: all:"Koi Security" OR all:GlassWorm OR all:ShadyPanda :: 1 irrelevant entry`
- `export.arxiv.org/api :: all:aikido :: 1 irrelevant entry`
- `export.arxiv.org/api :: all:phylum OR all:veracode :: 18 biology entries; nothing`
- `export.arxiv.org/api :: all:"mcp-scan" OR all:"toxic flow" OR all:ToxicFlow :: 6 quant-finance entries; irrelevant`
- `export.arxiv.org/api :: all:"agent-scan" OR all:"agent scan" :: 3 irrelevant`
- `export.arxiv.org/api :: all:postmark :: 2 irrelevant`
- `export.arxiv.org/api :: all:"Claude Code" AND all:security :: 50 third-party entries; none Anthropic-authored`
- `export.arxiv.org/api :: all:Socket AND all:"malicious packages" :: 0 entries`
- `export.arxiv.org/api :: au:Carlini AND (all:agent OR all:"prompt injection") :: 30 entries; 0 MCP mentions`
- `web search :: site:arxiv.org "Model Context Protocol" security Anthropic OR Snyk OR "Invariant Labs" OR Socket OR Koi :: 8 third-party papers; MCPXKIT credits Invariant Labs`
- `web search :: site:arxiv.org "mcp-scan" OR "MCP-Scan" OR "Invariant Labs" tool poisoning MCP :: 10 third-party hits plus Invariant TPA blog`
- `web search :: site:dl.acm.org "Model Context Protocol" security servers empirical :: TOSEM 3814959, TOSEM 3796519, MCP-Scanner EnCyCriS 2026, MCP-SecLint IWSPA 2026; no vendor items`
- `web search :: site:ieeexplore.ieee.org "Model Context Protocol" security :: 5 third-party items; no vendor items`
- `web search :: site:usenix.org / ndss-symposium.org / semanticscholar.org / openreview.net "Model Context Protocol" :: web search unavailable; replaced by direct curl`
- `api.semanticscholar.org (curl) :: 3 queries :: HTTP 429; no data`
- `dblp.org publ API (curl) :: model context protocol security; MCP server :: bot challenge; no data`
- `api.crossref.org :: query.title=model context protocol security rows=40 :: ~30 items; none vendor-authored`
- `html.duckduckgo.com (curl) :: arxiv MCP security Anthropic / Snyk / Koi :: challenge page, 0 results`
- `bing.com (curl) :: arxiv "Model Context Protocol" security Snyk :: locale-degraded, unusable`
- `api.openalex.org :: search="model context protocol" security :: count=2,730; Zenodo datasets (Major Labs State of MCP, registry name custody, Declared vs Observed); no listed-vendor items`
- `api.openalex.org :: raw_affiliation_strings.search Snyk\|Anthropic\|Invariant Labs\|Socket\|Phylum\|Veracode\|Aikido\|Koi Security since 2024-11 :: only real hit Socket ICSE 2025 npm-malware LLM paper (not MCP)`
- `usenix.org (curl) :: USENIX Security 2026 technical sessions :: 1 MCP mention (AIM Intelligence invited talk); Anthropic paper not MCP`
- `ndss-symposium.org, sp2026.ieee-security.org, sigsac.org (curl) :: accepted papers :: NDSS 0; S&P 2026 1 ('Parasites in the Toolchain', SJTU/CMU); CCS 0`
- `conf.researchr.org, 2026.msrconf.org (curl) :: ICSE/FSE/MSR/ASE 2026 :: ICSE 0; FSE 1 journal-first; MSR 1 dataset paper; ASE 404`
- `api2.openreview.net :: "model context protocol" security :: 4 third-party items`
- `arxiv.org/html + grep :: vendor-name grep across 10 fetched arXiv papers :: Snyk Agent-Scan in 2607.11086; MCP-Scan baseline in 2604.01905; mcp-scan in 2506.13538; no Socket/Phylum/Veracode/Aikido mentions`
- `api.crossref.org, zenodo.org/api :: DOI lookups 10.1145/3786160.3788471, 10.1109/icse55347.2025.00146; Zenodo 22674847 :: authors/venues confirmed`
- `web search :: Anthropic MCP security best practices specification 2026 :: spec page (opened); no Anthropic measurement`
- `web search :: anthropic.com MCP registry security review "Claude connectors" OR "MCP directory" policy :: Software Directory Policy, Connectors docs found`
- `web search :: anthropic.com engineering blog MCP security "tool poisoning" OR "prompt injection" OR "sandboxing" MCP servers 2026 :: no Anthropic engineering post on MCP security; OX Security surfaced`
- `web search :: site:socket.dev MCP server malicious OR security OR "tool poisoning" :: SANDWORM_MODE, Mini Shai-Hulud, Socket MCP product; no measurement`
- `web search :: socket.dev blog "MCP" servers analyzed OR scanned OR "we found" registry npm ecosystem 2025 2026 :: no Socket measurement; 'hundreds of MCP server configs' snippet traced to third-party mcp-scan npm README`
- `web search :: socket.dev blog "postmark-mcp" OR "mcp-remote" OR "MCP servers" backdoor typosquat 2025 :: no Socket write-up of postmark-mcp`
- `web search :: site:snyk.io MCP servers research "we analyzed" OR "we scanned" OR "vulnerable" 2026 :: Snyk Labs tool-poisoning article, snyk/agent-scan`
- `web search :: Snyk "Agent Scan" MCP servers scanned findings report OR "State of" MCP security Snyk 2026 :: ToxicSkills, PipeLab, AgentsID (not opened)`
- `web search :: Snyk ToxicSkills report agent skills 3,984 scanned malicious 2026 :: ToxicSkills post (Feb 5 2026), skills only`
- `web search :: snyk.io blog MCP 2026 "MCP server" vulnerability OR malicious OR "Agent Scan" June July August 2026 :: found 'What nearly 10,000 developer environments reveal' (Jun 23 2026)`
- `web search :: veracode.com blog MCP server security OR "Model Context Protocol" research 2025 2026 :: no Veracode MCP posts`
- `web search :: site:veracode.com MCP :: OpenClaw post and SCA DB entries only`
- `web search :: Veracode "Threat Research" MCP server malicious npm OR PyPI package :: THN cites Veracode only for buildrunner-dev; MCP injection attributed to Socket`
- `web search :: Veracode MCP server announcement OR "Veracode MCP" 2026 :: community-built Veracode MCP servers only`
- `web search :: site:aikido.dev MCP :: product help docs and Intel advisory AIKIDO-2026-329399 (Ruby mcp gem); no research`
- `web search :: Aikido Security blog MCP server malicious OR "tool poisoning" OR "MCP" research Aikido Intel 2025 2026 :: zero Aikido results`
- `web search :: Koi Security blog MCP "postmark-mcp" OR "MCP server" research koi.security OR koi.ai :: secondary coverage only; koi.ai redirects to PANW`
- `web search :: Palo Alto Networks acquires Koi Security agentic endpoint security :: intent Feb 17 2026, completed Apr 14 2026 (press releases not opened)`
- `web search :: blog.modelcontextprotocol.io security registry moderation 2026 :: web search unavailable; replaced by direct fetch of blog posts pages 1-3`
- `curl :: socket.dev/blog pages 1-3 grep mcp :: 322 slugs; 2 MCP-titled posts`
- `curl :: socket.dev sitemap-0..7.xml grep mcp\|model-context\|agent\|claude\|skill :: 759 blog URLs; 8 MCP slugs, 36 AI-agent slugs; opened 7; no MCP measurement`
- `curl :: invariantlabs.ai/blog index :: 17 posts; 5 MCP posts (Apr 1, Apr 7, Apr 11, Apr 24, May 26 2025) plus Toxic Flows Jul 29 2025`
- `fetch + curl :: labs.snyk.io index + snyk.io/llms.txt :: gated report landing page located`
- `curl :: snyk.io sitemaps (blogs, articles, pages, press-releases, events, videos, podcasts) grep mcp\|toxic\|agent-scan\|invariant\|skills\|agentic :: 1,827 blog + 383 article + 66 press URLs; ~60 hits`
- `curl :: snyk.io/sitemaps/sitemap-blogs.xml grep postmark\|mcp (for the write-up) :: 5 MCP slugs; opened malicious-mcp-server-on-npm-postmark-mcp-harvests-emails (article:published_time 2025-09-25)`
- `DuckDuckGo HTML :: Snyk State of Agentic AI Adoption report January 2026 :: both PDFs found on res.cloudinary.com/snyk; pdftotext`
- `DuckDuckGo HTML :: Snyk "Agent Scan" MCP open source launch invariant :: blocked; resolved via GitHub API`
- `GitHub API :: repos/snyk/agent-scan (re-run for the write-up) :: created 2025-04-07, pushed 2026-09-11, 3,033 stars, description 'Security scanner for AI agents, MCP servers and agent skills.'`
- `curl + Wayback :: blog.phylum.io :: direct fails; Jan 2026 snapshot shows no MCP post; phylum.io -> veracode.com`
- `curl :: veracode.com/blog index :: JS-rendered; no 'mcp' string`
- `curl :: veracode.com sitemap_index.xml children grep mcp\|agent\|skill\|claude\|copilot\|llm :: 1,086 URLs; ZERO 'mcp' slugs; OpenClaw post has 1 MCP mention as package name`
- `curl :: aikido.dev/blog + sitemap.xml grep mcp\|agent\|skill\|claude\|cursor\|prompt\|llm :: 928 URLs; ZERO 'mcp' slugs; MCP only in passing in 4 agent posts`
- `curl :: intel.aikido.dev/malware?search=mcp :: JS-rendered; unverifiable`
- `Wayback :: koi.ai/blog (Jun 13 2026 snapshot) :: 55 slugs; 7 MCP-related`
- `web.archive.org CDX API :: url=koi.ai/blog/* collapse=urlkey filter mcp\|figma\|local (re-run for the write-up) :: Figma CVE-2025-53967 post (capture 2025-10-10) and 'Trust Me, I'm Local' (capture 2025-10-05) located and opened via id_ captures`
- `curl :: anthropic.com/engineering index grep mcp\|sandbox\|secur\|skill :: 25 posts; none dedicated to MCP security`
- `curl (for the write-up) :: anthropic.com/engineering/how-we-contain-claude :: opened; 'Published May 25, 2026'; 7 MCP mentions; Gray Swan 0.1%/5–6%, 83%, 84% figures verbatim`
- `curl (for the write-up) :: anthropic.com/engineering/claude-code-sandboxing :: opened; 'Published Oct 20, 2025'; 1 MCP mention; 84% figure verbatim`
- `curl (for the write-up) :: support.claude.com/en/articles/13145358-anthropic-software-directory-policy :: opened; lastUpdatedDate 2026-04-15; hidden-instruction, dynamic-pull, cross-tool coercion, readOnlyHint/destructiveHint and OAuth 2 rules verbatim`
- `curl :: anthropic.com/news/investigating-incidents-cybersecurity-evals + /research/alignment-assessment-cybersecurity-incidents :: zero MCP mentions`
- `curl :: blog.modelcontextprotocol.io/posts pages 1-3 :: 28 posts; opened registry preview, tool annotations, 2026-07-28 spec release`
- `curl (for the write-up) :: invariantlabs.ai smithery-mcp-scan / introducing-mcp-scan / toxic-flow-analysis / whatsapp-mcp-exploited :: opened; dates 2025-04-24, 2025-04-11, 2025-07-29, 2025-04-07 from page metadata`
- `curl :: endorlabs.com, knostic.ai sitemaps; backslash/astrix/pipelab/equixly/docker/trendmicro probes :: Endor, Knostic, Astrix located; Trend Micro 200 not opened`
- `curl (for the write-up) :: backslash.security/blog/hundreds-of-mcp-servers-vulnerable-to-abuse :: opened; June 25, 2025; 'thousands' scanned, 'hundreds' bound to 0.0.0.0, 'dozens' command execution`
- `curl (for the write-up) :: equixly.com/blog/2025/03/29/mcp-server-new-security-nightmare/ :: opened; datePublished 2025-03-29; 43%/22%/30%/5% figures; sample size not stated`
- `curl (for the write-up) :: socket.dev/blog/socket-mcp-supply-chain-investigation :: opened; datePublished 2026-06-18; product post`
- `Bing HTML via curl :: Anthropic MCP Directory policy :: anti-bot decoy results; unusable`
- `Google HTML via curl :: Anthropic MCP Directory policy :: JS shell; unusable`
- `SearXNG / Qwant / Marginalia / Yandex :: Anthropic MCP Directory policy :: 429/403/302/empty; unusable`
- `DuckDuckGo HTML (Lynx UA) :: Anthropic "MCP Directory policy" OR "software directory policy" connectors security requirements :: found support.claude.com article`
- `DuckDuckGo HTML :: site:koi.ai MCP :: Figma post, 'MCP Backdoor' webinar, ShadowPrompt`
- `DuckDuckGo HTML :: site:socket.dev "MCP server" malicious 2026 :: blocked; replaced by sitemap crawl`
- `HN Algolia API :: MCP security \| MCP server malicious \| MCP vulnerability \| Model Context Protocol security \| MCP supply chain \| MCP prompt injection \| MCP servers study \| MCP scanner (created_at > 2026-05-01) :: ~130 stories; NSA CSI, Canopii, MCPExplorer, Bindfort, Deadbugz coverage surfaced`
- `GitHub Advisory Database API :: affects=@modelcontextprotocol/sdk \| mcp \| mcp-remote \| @modelcontextprotocol/inspector \| @modelcontextprotocol/server-filesystem \| fastmcp :: 3 TS-SDK, 12 'mcp', 1 mcp-remote, 2 inspector, 2 server-filesystem, 8 fastmcp advisories; 8 'mcp' advisories published Jul 2026`
- `DuckDuckGo HTML :: Pillar Security Deadbugz malicious MCP server zellkernel :: Pillar primary opened; CSA notes 403`
- `DuckDuckGo HTML :: OWASP MCP Top 10 project tool poisoning :: owasp.org project page (beta; next release Oct 2026)`
- `DuckDuckGo HTML :: CoSAI OASIS "model context protocol" security agentic systems workstream :: OASIS press release 2026-01-27; github raw 429`
- `DuckDuckGo HTML :: Backslash Security MCP servers analysis NeighborJack hundreds of servers :: Backslash Jun 25 2025 post`
- `DuckDuckGo HTML :: Equixly MCP servers security nightmare command injection 43% :: Equixly Mar 29 2025 post`
- `DuckDuckGo HTML :: Trail of Bits blog MCP insecure credential storage jumping the line :: credential-storage post and /categories/mcp/ index (6 posts)`
- `DuckDuckGo HTML :: Black Hat USA 2026 briefings MCP :: blackhat.com 403; Wayback sessions.json shows Check Point and Zenity MCP-mentioning briefings`
- `DuckDuckGo HTML + defcon.org DC-34 speakers page :: DEF CON 34 2026 talk MCP servers agent security :: 3 MCP-mentioning talks (Wiz/Google LiteLLM; Tenet Security Cloudflare/Sentry MCP; JHU LaunchBreak)`
- `DuckDuckGo HTML :: MCP 安全 研究报告 MCP服务器 漏洞 分析 2026 :: secondary Chinese coverage only`
- `DuckDuckGo HTML :: MCPサーバー セキュリティ 調査 脆弱性 分析 2026 :: Trend Micro ja_jp mirror -> English TrendAI primary`
- `DuckDuckGo HTML :: MCP-Server Sicherheit Studie Schwachstellen Analyse BSI 2026 :: all-about-security.de coverage of AgentSeal -> AgentSeal primary; no BSI item`
- `DuckDuckGo HTML :: MCP 서버 보안 취약점 분석 연구 2026 :: secondary Korean blogs only`
- `DuckDuckGo HTML :: AgentSeal 5,125 MCP servers toxic flows 555 servers report :: agentseal.org post (Mar 20 2026)`
- `DuckDuckGo HTML :: Trend Micro "exposed MCP servers" research 2026 cloud :: trendmicro.com en_us 404; trendaisecurity.com primary opened`
- `DuckDuckGo HTML :: Microsoft "Protecting against indirect injection attacks in MCP" developer blog :: blocked; URL taken from NSA CSI references`
- `DuckDuckGo HTML :: Unit 42 Palo Alto MCP servers research prompt injection tool poisoning :: Unit 42 MCP sampling post (Dec 5 2025)`
- `DuckDuckGo HTML :: Cisco AI Defense MCP Scanner open source blog :: Cisco MCP Scanner launch (Oct 23 2025)`
- `DuckDuckGo HTML :: Docker blog "MCP Horror Stories" series :: issue 1 (Jul 31 2025)`
- `nsa.gov direct (403) then web.archive.org/web/2026id_/ :: CSI_MCP_SECURITY.pdf :: 17-page PDF via Wayback; references extracted`
- `canopii.dev direct :: State of MCP Security 2026 PDF :: 2.5 MB PDF; pdftotext; figures and methodology extracted`
- `akamai.com direct :: new-mcp-specification-security-teams-must-prepare :: 403`
- `labs.cloudsecurityalliance.org direct :: CSA research notes on Deadbugz :: 403`
