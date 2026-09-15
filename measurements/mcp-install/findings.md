# MCP: install and first start — findings

Run from 2026-09-11 19:35 UTC to 2026-09-12 00:06 UTC, 600 cells (420 npm, 180 PyPI), a seeded
random sample of the 11,484 npm/PyPI-stdio packages in the official registry. Full figures with
Wilson and cluster-robust intervals in [results/report.md](results/report.md); method in
[README.md](README.md); adversarial pass and corrections in [verification.md](verification.md);
cell by cell in `results/cells.ndjson`.

## What install shows

**Almost everything installs.** npm 404/420 (96.2 %), PyPI 175/180 (97.2 %). The failures are
the registry's, not the package's: 9 versions the registry lists and the package registry does
not have, 4 nonexistent packages (404), 1 timeout, 7 other.

**Code at install, npm: 12.6 % of trees [9.7–16.2] run some `preinstall`/`install`/`postinstall`;
the server itself declares one in 3.7 % [2.3–6.0].** Almost all of it is native:
`better-sqlite3` (15 trees), `protobufjs` (11), `sharp` (5), `tree-sitter-*`, `ssh2`, `keytar`,
`onnxruntime-node`. 7.4 % of installs leave a `.node` binary behind; in 5.2 % `node-gyp`,
`prebuild-install` or a compiler runs. Hence the network beyond the registries: `github.com` +
`release-assets.githubusercontent.com` (16 cells, prebuilds), `nodejs.org` (5, headers for
node-gyp), `api.nuget.org` (3, `onnxruntime-node` fetching runtimes), `opencollective.com` (1,
`devdocs-mcp-server`'s donation message). No install contacted a host that was not a registry,
a code forge or a binary CDN.

**Code at install, PyPI: zero.** 0/175 builds from sdist, no compiler executed, although 90.9 %
of the venvs contain compiled extensions — all of them arrive as wheels. With Python 3.13 and the
headers mounted, no package in the sample needed to run code to install. (Caveat:
`uv pip install -q` silences the `Built …` lines, so `builtFromSource` is unreliable; the
evidence is the absence of `gcc`/`cc1` in `execve`.)

**`$HOME` at install.** npm reads `~/.npmrc` and `~/.gitconfig` in 420/420 cells: that is npm,
not the package, and it is the baseline norte-guard already measured. Beyond that, in 600
installs:

- `saturnzap@1.3.2`: a read of `~/.netrc` — a git dependency in the tree makes `git` (libcurl)
  read `.netrc`. Attributable to the package, benign.
- `warp-agent-mcp@0.19.6`: its `postinstall` **writes `~/.config/Claude/claude_desktop_config.json`**
  — it registers itself in Claude Desktop at install, without anyone asking.
- `@munhq/cloud-tools@0.2.0`: its `postinstall` drops a binary into `~/.cache/cloud-tools/bin/`.
- 17 cells write `~/.npm/_prebuilds` and 5 `~/.cache/node-gyp` (standard mechanism).

## What first start shows

**60 % start.** `initialize` succeeded in 347/579 attempts (59.9 % [55.9–63.8]); npm 69.8 %,
**PyPI 37.1 % [30.3–44.5]**. The 231 cells without a handshake, by cause:

| cause | cells |
|---|---|
| **broken by `mcp` 2.x** (`No module named 'mcp.server.fastmcp'`: the SDK renamed `FastMCP` in 2.0.0, released 2026-07-28; the package does not pin `mcp<2`) | **53** — 30.3 % of the 175 PyPI installs; **19 of the 53 are one publisher** (`io.github.CSOAI-ORG`: 21 sampled, none starts, 19 with this error and 2 with others), so the cluster-robust interval is [15.9–44.7] (DEFF 4.5); without that publisher 34/154 = 22.1 %; by publisher, 34 of 143 (23.8 %) have at least one broken |
| exception at start | 42 |
| exits with code 1 and no classifiable message | 38 |
| demands a credential or a value from a list the registry does not document | 28 |
| prints usage: the binary expects a subcommand the registry does not declare | 21 |
| exits with code 0 without speaking MCP | 21 |
| module not found | 14 |
| alive, no JSON-RPC within 20 s | 7 |
| other exit codes | 7 |

The first row is the finding: six weeks after a major-version change in the official SDK,
**between a fifth and a third** of the PyPI servers in the official registry — depending on
whether one counts by package or by publisher — do not start on a clean install. The registry's
`status` field shows them as `active`, which is its default value at publish time and not a
claim that they work (the registry says explicitly that it does not verify that). The precedent
is python-sdk#3309 (2026-08-14), an affected author describing the mechanism without
quantifying it (2609.10962 measured "fewer than half complete the handshake" on npm/stdio; here
the majority cause on PyPI is identified).

What the 175 declare in their PyPI metadata (`Requires-Dist`, read afterwards, no reinstall;
[results/pypi-mcp-requirements.json](results/pypi-mcp-requirements.json)):

| constraint on `mcp` | packages | broken by 2.x | start | other failure |
|---|---|---|---|---|
| lower bound only `>=1.x`, no ceiling | 71 | 51 | **0** | 20 |
| ceiling below 2 (`<2`, `==1.x`) | 26 | 0 | 22 | 4 |
| requires 2.x (`>=2`, `==2.0.0`, `>=2.1,<3`) | 17 | 0 | 13 | 4 |
| `mcp` unconstrained | 5 | 0 | 5 | 0 |
| no direct dependency, through `fastmcp` | 24 | 1 | 17 | 6 |
| no direct dependency, other route | 32 | 1 | 8 | 23 |

119 of 175 declare `mcp` directly; **26 (15 % of the installed, 22 % of those that declare it)
bound it below 2**. Of the 71 with a floor and no ceiling, none starts. CSOAI-ORG's 19 are all in
that row (`>=1.0.0`, `>=1.3.0`, `>=1.28.0`). The 21 "prints usage" cells are incomplete registry
metadata: the harness retried once with a subcommand taken from the usage text (`mcp`, `serve`,
`server`, `start`, `stdio`, `run`) in 5 cases and recovered 1.

**Declared tools** (344 servers with `tools/list`, 6,485 tools): median 8 per server, maximum
803. 117/344 servers (34.0 %) annotate at least one tool; 106 annotate all of them. 2,849/6,485
tools (43.9 %) carry some annotation: `readOnlyHint: true` 2,120, `destructiveHint: true` 203,
`destructiveHint: false` 1,013. That is the declared side, on the same sample, for the next
measurement.

**Network at first start: 47/579 (8.1 % [6.2–10.6]).** With dummy credentials, most connect to
nothing. Those that do:

- **21 PyPI cells contact `pypi.org` at start**: it is `fastmcp`'s version check (jlowin;
  `check_for_updates="stable"` by default, `GET pypi.org/pypi/fastmcp/json`, writes
  `~/.local/share/fastmcp/version_cache.json`; opt-out `FASTMCP_CHECK_FOR_UPDATES=off`). A library
  that makes a network request at the start of any server that uses it — 12 % of the installed
  PyPI servers [8.0–17.6]; cluster-robust [5.0–19.0] — without the server deciding it.
- 3 npm servers run their own update check against `registry.npmjs.org` (`brave-mcp`,
  `@async23/chrome-devtools-mcp`, `@aetherwealth/mcp`), two of them reading `~/.npmrc` for it.
- **Telemetry, 4 cells (0.7 % [0.3–1.8])**: `@merill/lokka` → `us.i.posthog.com`
  (+ `~/.lokka/telemetry-id`); `@async23/chrome-devtools-mcp` → `play.googleapis.com` (Clearcut;
  `~/.local/share/chrome-devtools-mcp/telemetry_state.json`); `photographi-mcp` →
  `mobile.events.data.microsoft.com` (+ `~/.photographi/telemetry.json`); `mcp-google-business`
  → `usage.gistrec.cloud` (+ `~/.config/mcp-google-business/instance-id`). None of the four
  registry entries mentions it.
- **Remote configuration at start**: `email-guard-mcp` downloads rules from
  `raw.githubusercontent.com` and `agent-firewall-seven.vercel.app`; `llm-advisor-mcp` from
  `raw.githubusercontent.com`, `openrouter.ai`, `arena.ai` and `cdn.opencompass.org.cn`;
  `@gridinsoft/mcp-inspector` from `inspector.gridinsoft.com`. What the server does depends on
  what those hosts serve that day.
- `placeroot` (PyPI) downloads DuckDB's `httpfs` extension over plain HTTP
  (`extensions.duckdb.org:80`) at start. Checked by hand ([verification.md](verification.md)
  §3): it is the default repository compiled into DuckDB, and DuckDB verifies the file's RSA
  signature before writing it and on every load (one altered byte → rejected). DuckDB's design,
  not the server's; not a finding of this measurement.
- 6 cells contact their own vendor's API with the dummy key; 5 try `127.0.0.1` (Postgres, a
  local port) because the dummy URL points there.

**`$HOME` at first start.** 59/579 (10.2 % [8.0–12.9]) open content outside the project, the
toolchain and the package-manager caches; 30 write state of their own (`~/.terradev`,
`~/.openemis-mcp/auth.db`, `~/.cp-memory/memory.db`, `~/.token-optimizer/*.db`, `~/.neo/daemon`,
`~/hoshin-data`, …). **18 (3.1 % [2.0–4.9]) touch a decoy**:

| decoy | cells | who |
|---|---|---|
| `~/.env` | 9 | `agentic-wallet-guardian-mcp`, `huawei-app-gallery-mcp`, `gauntlex-ai`, `haiku-rag`, `mcp-trendpulse`, `gds-agent`, `mcp-msdefenderkql`, `itu-mcp`, `mcp-aichat` — they load a `.env` from the *home*, not from the project, and with it whatever keys are there |
| `~/.npmrc` | 2 | `brave-mcp`, `@async23/chrome-devtools-mcp` (update check) |
| `~/.claude` | 2 | `neo-mcp` **writes `~/.claude/skills/neo.md`**; `claude-code-conversation-search-mcp` creates `~/.claude/conversation-search.db` |
| `~/.gemini`, `~/.config/Claude`, `~/.cursorrules` | 1 | `@putervision/state-memory-mcp` **writes `~/.cursorrules`, `~/.gemini/GEMINI.md`, `~/.gemini/config/skills/…/SKILL.md` and `~/.config/Claude/claude_desktop_config.json`** at start |
| `~/.aws` | 1 | `@infoinlet/mcp-s3` (its function) |
| `~/.kube` | 1 | `mcp-alertmanager` (its function) |
| `~/.netrc` | 1 | `b280-olca-mcp` |
| `~/.gitconfig` | 1 | `terravision` |

No cell read `~/.ssh`, `~/.git-credentials`, `~/.config/gh`, `~/.docker`, `~/.pypirc` or
`~/.bash_history` at first start.

## The three classes that were not measured before

1. **Self-registration in the agent.** 4/600 (0.7 % [0.3–1.7]) write into an AI client's
   configuration without being asked: one in `postinstall` (`warp-agent-mcp` → Claude Desktop),
   three at start (`state-memory-mcp` → Cursor, Gemini and Claude Desktop at once; `neo-mcp` →
   Claude Code skills; `claude-code-conversation-search-mcp` → `~/.claude`). A `postinstall` that
   edits `claude_desktop_config.json` is exactly the primitive of Deadbugz and SANDWORM_MODE
   (prior-art §3), here in packages that are not malicious.
2. **Network the server does not decide.** 21 `fastmcp` version checks against PyPI and 3
   against npm, 4 telemetry streams to PostHog/Google/Microsoft/own, 3 remote configuration
   downloads, 1 signed-extension download over HTTP: 30/579 = 5.2 % [3.7–7.3] of the servers
   started generate traffic that does not go to the service the server wraps (over the 347 that
   completed the handshake: 30/347 = 8.6 % [6.1–12.1]).
3. **Silent breakage by the SDK.** 53/175 PyPI cells (19 from one publisher; 34 of 143
   publishers affected) do not start since 2026-07-28. The `status` field does not reflect it
   because it is not designed to.

## Retractions and corrections (2026-09-12)

The first version of this document (2026-09-12) said two things that verification
([verification.md](verification.md)) did not sustain. They stay written here, not deleted.

1. **Retracted:** "`placeroot` downloads a DuckDB extension over plain HTTP
   (`extensions.duckdb.org:80`) and drops it in `~/.duckdb/extensions/`: executable code, no
   TLS, at first start." The HTTP download is real, but it is the default repository compiled
   into DuckDB (`http://extensions.duckdb.org`), placeroot neither configures it nor disables
   signature verification, and DuckDB checks the file's RSA signature before writing it and on
   every load: one altered byte and `LOAD` rejects it. It was presented as a security finding
   about an MCP server and it is not one. It has not been reported to anyone.

2. **Corrected:** "a third of the PyPI servers listed in the official registry do not start"
   and "the registry keeps listing them as active". 19 of the 53 broken cells are one publisher
   (`io.github.CSOAI-ORG`; an earlier version of this correction said 21: 21 were sampled, 19
   with this error); the cluster-robust interval is [15.9–44.7] with DEFF 4.5, and at publisher
   level the rate is 34/143 = 23.8 %. The right phrase is "between a fifth and a third". And
   `active` is the default value of the `status` field at publish time; the registry does not
   claim that a server works, so "lists them as active" was our reading of the field presented
   as the registry's claim.

What was checked and holds: 120 s of idle adds no hosts (39/40); a real `GITHUB_TOKEN` does not
change the start compared with the dummy one (4/4); without bubblewrap the behaviour is the same
(20/20); the sample does not differ from the population on 11 covariates; the other rates have a
design effect ≈ 1.

## Caveats

- Sample: 600 of 11,484, simple random with a seed (checked against the population on 11
  covariates, |z| < 2 on all); 520 distinct publishers. Small rates have wide intervals (a
  telemetry rate of 0.7 % is [0.3–1.8]); the only rate with a relevant design effect is the `mcp`
  2.x one (DEFF 4.5), corrected above. The full run is resumable (`node src/run.ts` over a
  filtered `population.ndjson`) and would take about 80 h at this pace.
- First start with dummy credentials and 10 s of idle. Checked
  ([verification.md](verification.md) §5–7): with 120 s of idle, 39/40 servers show the same set
  of hosts (the other continues the same S3 download); with a real `GITHUB_TOKEN`, 4/4 behave
  as with the dummy one; without a sandbox, 20/20 the same. Still unobserved: the 28 servers
  that abort on credential validation and the 42 with an exception (for them the first start
  never happened), timers longer than 120 s, and the first tool invocation. First-start rates
  are given over the 579 attempts; over the 347 that started, the network and `$HOME` rates go
  up ~1.7×.
- One host, Debian 13, Node 22.23, Python 3.13, uv 0.12.13, npm 10.9.8. The `mcp` 2.x start
  failures depend on the resolver picking the latest version, which is what a clean install does
  today.
- IP-to-name attribution comes from the DNS answers in the same trace; 2 IPv6 connections to
  `::1` stayed unnamed by construction (no DNS query).
- OCI (886) and MCPB (1,077) are not measured.
