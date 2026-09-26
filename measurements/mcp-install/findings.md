# MCP: install and first start — findings

Run from 2026-09-11 19:35 UTC to 2026-09-12 00:06 UTC, 600 cells (420 npm, 180 PyPI), a seeded
random sample of the 11,484 npm/PyPI-stdio packages in the official registry. Full figures with
Wilson and cluster-robust intervals in [results/report.md](results/report.md); method, limits,
the derivation of each figure and the corrections in [README.md](README.md); cell by cell in
`results/cells.ndjson`.

## What install shows

**Almost everything installs.** npm 404/420 (96.2 %), PyPI 175/180 (97.2 %). Of the 21
failures, 10 are the registry's: it lists 7 versions and 3 packages that the package registry
does not have. The other 11: 3 macOS-only packages, 2 that depend on a package that does not
exist (`ldk-node` on PyPI, `@bbb/common` on npm), 2 builds from sdist that stopped on a Python
header the sandbox did not mount, 1 package that requires Python 3.14, 1 install script that
calls a file the package does not ship, 1 timeout and 1 failure with no message.

**Code at install, npm: 12.6 % of trees [9.7–16.2] run some `preinstall`/`install`/`postinstall`;
the server itself declares one in 3.7 % [2.3–6.0].** In 31 of the 51 trees a dependency's script
builds or fetches a native module: `better-sqlite3` (15 trees), `sharp` (5), `tree-sitter-*`,
`ssh2`, `keytar`, `onnxruntime-node`. In 7 more the server's own `postinstall` downloads a release
asset from GitHub. `protobufjs` (11) only runs a version check. 7.4 % of installs leave a `.node` binary behind; in 5.2 % `node-gyp`,
`prebuild-install` or a compiler runs. Hence the network beyond the registries: `github.com` +
`release-assets.githubusercontent.com` (16 cells: 9 dependency prebuilds, 7 the server's own
`postinstall`), `nodejs.org` (5, headers for
node-gyp), `api.nuget.org` (3, `onnxruntime-node` fetching runtimes), `opencollective.com` (1,
`devdocs-mcp-server`'s donation message). Every host an install contacted is a package registry,
a code forge or a source of binaries and headers, except `opencollective.com`.

**Code at install, PyPI: none in the 175 that installed.** 0/175 builds from sdist, no compiler
executed, although 90.9 % of the venvs contain compiled extensions — all of them arrive as
wheels. Two of the five that did not install had to compile a dependency from sdist (`evdev`,
`pyswisseph`); `gcc` ran and stopped on `pyconfig.h`, a Python header the sandbox did not
mount. (Caveat: `uv pip install -q` silences the `Built …` lines, so `builtFromSource` is
unreliable; the evidence is the absence of `gcc`/`cc1` in `execve`.)

**`$HOME` at install.** npm reads `~/.npmrc` and `~/.gitconfig` in 420/420 cells: that is npm,
not the package, and it is the baseline norte-guard already measured. Beyond that, in 600
installs:

- `saturnzap@1.3.2`: a read of `~/.netrc` — a git dependency in the tree makes `git` (libcurl)
  read `.netrc`. Attributable to the package, benign.
- `warp-agent-mcp@0.19.6`: its `postinstall` **writes `~/.config/Claude/claude_desktop_config.json`**
  — it registers itself in Claude Desktop at install, without anyone asking.
- `@munhq/cloud-tools@0.2.0`: its `postinstall` drops a binary into `~/.cache/cloud-tools/bin/`.
- 8 cells write `~/.npm/_prebuilds` and 9 more only read from it; 5 write `~/.cache/node-gyp`
  (standard mechanism).

## What first start shows

**60 % start.** `initialize` succeeded in 347/579 attempts (59.9 % [55.9–63.8]); npm 69.8 %,
**PyPI 37.1 % [30.3–44.5]**. Of the 232 attempts without a handshake, 231 left a client record;
by cause:

| cause | cells |
|---|---|
| **broken by the rename in `mcp` 2.0**: the error is the rename's own, `No module named 'mcp.server.fastmcp'` (the SDK renamed `FastMCP` in 2.0.0, released 2026-07-28; the package does not pin `mcp<2`), not any import failure that names `mcp` | **52** — 29.7 % of the 175 PyPI installs; **19 of the 52 are one publisher** (`io.github.CSOAI-ORG`: 21 sampled, none starts, 19 with this error and 2 with others), so the cluster-robust interval is [14.1–45.3] (DEFF 5.3); without that publisher 33/154 = 21.4 %; by publisher, 32 of 142 (22.5 %) have at least one broken |
| exception at start | 42 |
| the installed binary could not be executed (not found 4, `Exec format error` 13) | 17 |
| exits with code 1 and no classifiable message | 21 |
| the message names a variable, a key, a token or a required value (4 of the 28 stop on something else: an `AttributeError`, a `SyntaxError`, a help text, a missing `mcp` package) | 28 |
| prints a usage text | 21 |
| exits with code 0 without speaking MCP | 21 |
| module not found (2 of them a module name taken from the identifier, for a package with no console script) | 15 |
| alive, no JSON-RPC within 20 s | 7 |
| other exit codes (127, 2, 3) | 5 |
| fails to connect to a service | 2 |

The first row is the finding: six weeks after a major-version change in the official SDK,
**between a fifth and a third** of the PyPI servers in the official registry — depending on
whether one counts by package or by publisher — do not start on a clean install because of the
rename's own error. It is not all that 2.0 broke. Ten more, all with a floor and no ceiling on
`mcp`, stop at a `list_tools()` decorator with `AttributeError: 'Server' object has no attribute
'list_tools'` (9 of them among the exceptions at start, 1 under the credential rule): 2.0 removed
that decorator from the low-level `Server`, which takes `on_list_tools=` in its constructor
instead. So at least 62 of 175 (35.4 %) are broken by 2.0, from at least 41 of 142 publishers;
the other 48 PyPI attempts without a handshake were not examined for a 2.0 cause. The registry's
`status` field shows them as `active`, which is its default value at publish time and not a
claim that they work (the registry says explicitly that it does not verify that). The precedent
is python-sdk#3309 (2026-08-14), an affected author describing the mechanism without
quantifying it (2609.10962 measured "fewer than half complete the handshake" on npm/stdio; here
the largest cause on PyPI is identified).

What the 175 declare in their PyPI metadata (`Requires-Dist` of the installed version;
[results/pypi-mcp-requirements.json](results/pypi-mcp-requirements.json)):

| constraint on `mcp` | packages | broken by the rename | start | other failure |
|---|---|---|---|---|
| lower bound only `>=1.x`, no ceiling | 71 | 51 | **0** | 20 |
| ceiling below 2 (`<2`, `==1.x`) | 26 | 0 | 22 | 4 |
| requires 2.x (`>=2`, `==2.0.0`, `>=2.1,<3`) | 13 | 0 | 9 | 4 |
| accepts 1.x and 2.x, below 3 (`>=1.x,<3`) | 4 | 0 | 4 | 0 |
| `mcp` unconstrained | 5 | 0 | 5 | 0 |
| no direct dependency, through `fastmcp` | 24 | 1 | 17 | 6 |
| no direct dependency, other route | 32 | 0 | 8 | 24 |

119 of 175 declare `mcp` directly; **26 (15 % of the installed, 22 % of those that declare it)
bound it below 2**. Of the 71 with a floor and no ceiling, none starts. CSOAI-ORG's 19 are all in
that row (`>=1.0.0`, `>=1.3.0`, `>=1.28.0`). Of the 20 other failures in that row, 10 are the
`list_tools` error above; no package in another row hits it. 16 of the 21 that print usage have no package
arguments in the registry; the other 5 have some and print usage anyway. A subcommand named in
the usage text (`mcp`, `serve`, `server`, `start`, `stdio`, `run`) was tried in 5 cells that had
printed usage: 1 started, and 2 still print usage and are among the 21.

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
  PyPI servers [8.0–17.6]; cluster-robust [4.8–19.2] — without the server deciding it.
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
  (`extensions.duckdb.org:80`) at start. It is the default repository compiled into DuckDB, whose
  code checks the file's signature before writing it and on every load; an altered file was not
  tried in the published run. DuckDB's design, not the server's; not a finding of this measurement.
- 6 cells contact their own vendor's API, 2 of them with the dummy value of the key the registry
  declares. 5 connect to `127.0.0.1` (ports 5432, 7331, 8080, 8973, 12345) without being given an
  address: the registry declares no variable for any of them.

**`$HOME` at first start.** 59/579 (10.2 % [8.0–12.9]) open content outside the project, the
toolchain and the package-manager caches; what they write includes `~/.terradev`,
`~/.openemis-mcp/auth.db`, `~/.cp-memory/memory.db`, `~/.token-optimizer/*.db`, `~/.neo/daemon`
and `~/hoshin-data`. How many of them write state of their own was not counted.
**18 (3.1 % [2.0–4.9]) touch a decoy**:

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

1. **Self-registration in the agent.** 3/600 (0.5 % [0.2–1.5]) write into an AI client's
   configuration without being asked: one in `postinstall` (`warp-agent-mcp` → Claude Desktop),
   two at start (`state-memory-mcp` → Cursor, Gemini and Claude Desktop at once; `neo-mcp` →
   Claude Code skills). A fourth, `claude-code-conversation-search-mcp`, keeps its own database
   in `~/.claude`. A `postinstall` that edits `claude_desktop_config.json` is exactly the
   primitive of Deadbugz and SANDWORM_MODE (prior-art §3), here in packages that are not
   malicious.
2. **Network that does not go to the service the server wraps.** 21 `fastmcp` version checks
   against PyPI, 3 servers' own update checks against npm, 4 telemetry streams to
   PostHog/Google/Microsoft/own, 3 remote configuration downloads, 1 signed-extension download
   over HTTP: 30/579 = 5.2 % [3.7–7.3] of the attempts, 30/347 = 8.6 % [6.1–12.1] of the servers
   that completed the handshake.
3. **Silent breakage by the SDK.** 52/175 PyPI cells stop on the rename's error (19 from one
   publisher; 32 of 142 publishers affected), and 10 more on another change of 2.0: at least 62
   of 175 do not start since 2026-07-28. The `status` field does not reflect it
   because it is not designed to.

## Corrections

The corrections, one of them a retraction, are in [README.md](README.md#corrections).

## Caveats

- Sample: 600 of 11,484, simple random with a seed; 519 distinct publishers; how the sample
  compares with the population on covariates is not reported. Small rates have
  wide intervals (a telemetry rate of 0.7 % is [0.3–1.8]). Cells from one publisher are not
  independent: the design effect is 5.3 for the rate of the rename's error, 2.25 for the handshake rate, 2.2
  for `pypi.org` at start, 1.5 for egress at first start and about 1 for the other rates in the
  cluster table. The full run is resumable (`node src/run.ts` over a filtered
  `population.ndjson`) and would take about 80 h at this pace.
- First start with dummy credentials and 10 s of idle. Unobserved: the first start of the 25
  servers of the cause "requires a variable/credential" that exited, of the 42 with an exception
  and of the 17 whose binary never executed (for them the first start never happened); anything
  on a timer after the idle window; the first tool invocation; and whether a longer idle window,
  real values for the declared variables or a run outside the sandbox change what a server does
  at first start. First-start rates
  are given over the 579 attempts; over the 347 that started, the network and `$HOME` rates go
  up ~1.7×.
- One host, Debian 13, Node 22.23, Python 3.13, uv 0.12.13, npm 10.9.8. The `mcp` 2.x start
  failures depend on the resolver picking the latest version, which is what a clean install does
  today.
- The install is `<id>==<ver>` alone and does not apply a registry entry's `runtimeArguments`:
  11 PyPI entries carry them, 7 adding the package's `[mcp]` extra, and none of the 11 started.
  None of the 52 broken by the rename carries them.
- IP-to-name attribution comes from the DNS answers in the same trace; IPv6 connections to `::1`
  in 2 cells stayed unnamed by construction (no DNS query).
- OCI (886) and MCPB (1,077) are not measured.
