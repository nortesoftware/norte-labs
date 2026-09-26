# measurements/mcp-install

**Results: [findings.md](findings.md)** (narrative) and [results/report.md](results/report.md)
(generated figures). Run of 2026-09-11, 600 cells. The derivation of each figure is under
[Figures](#figures), the corrections under [Corrections](#corrections).

What an MCP server does when it is installed and when it starts for the first time: install
scripts, network on first start, telemetry, and which `$HOME` paths it touches. It is
norte-guard's method (`install-trace`: `strace -f -e trace=file,execve`, two-level prefix
classification under `$HOME`) applied to the population of MCP servers that install as a
package, with two additions: a network trace (`connect` + DNS) and a second arm, the first start
with an MCP handshake.

Prior art: [prior-art/mcp.md](../../prior-art/mcp.md) §2 — not found for this measurement
("nobody has traced install-time and first-start behaviour for a corpus"; Canopii counts 260
servers with install scripts, statically).

## Population and sample

Source: the official MCP registry, `GET /v0/servers?limit=100&version=latest`, 310 pages
paginated on 2026-09-11 (30,945 entries; 30,611 active).

| | entries |
|---|---|
| active with `packages[]` | 13,150 |
| active remote-only (out of scope: nothing to install) | 17,058 |
| distinct packages (registry type, identifier) | 13,708 |
| — npm / PyPI / OCI / MCPB / NuGet / cargo | 8,070 / 3,519 / 886 / 1,077 / 108 / 48 |
| **eligible**: npm or PyPI with stdio transport | **11,484** (7,987 npm + 3,497 PyPI) |

OCI is out because the measurement host has no container runtime; MCPB (Claude Desktop
bundles) is a different install path and is not included in this run. Both are in
`results/population.ndjson.gz` for a second one.

Sample: deterministic pseudo-random order (`sha256(seed + type::identifier)`, seed
`norte-labs-mcp-install-2026-09-11`), the first 420 npm and 180 PyPI in that order (70/30, the
proportion of the eligible population). A partial cut of the sample is still a random sample.
Every rate is reported with a 95 % Wilson interval; where cells share a publisher, with a
cluster-robust interval and the design effect too.

## Instrument

Per cell (one package):

1. **Install.** `npm install --no-audit --no-fund <id>@<ver>` in an empty project, or
   `uv venv --python /usr/bin/python3 && uv pip install <id>==<ver>`. Under
   `strace -f -qq -y -s 512 -e trace=file,execve,network`. Then a static scan of
   `node_modules/**/package.json` (`preinstall`/`install`/`postinstall`, which npm runs by
   default) or of the venv (`*.dist-info`, `entry_points.txt`, `.so` extensions, packages built
   from sdist according to uv's output).
2. **First start.** The binary the package installed (`node_modules/.bin/<bin>`, or
   `node node_modules/<id>` for a package without a bin; the venv's console script, failing that
   `python -m <module>` from `runtimeArguments`, failing that `python -m` with the identifier as
   module name, `-` read as `_`), with the registry's `packageArguments` and
   `environmentVariables`: a value, default or first choice the registry gives is used as is;
   otherwise a variable gets a dummy value (`nl-dummy-<NAME>`; `1`, `false` or `~/proj/data` for
   the formats number, boolean and filepath) and a required argument gets `nl-dummy` (or a path,
   URL, port, number or boolean by its hint). A minimal client sends
   `initialize` → `notifications/initialized` → `tools/list`, leaves the process **idle for 10 s**
   and terminates it. Only the server runs under strace (the client launches it). The handshake
   result, the number of tools and the annotations they declare (`readOnlyHint`,
   `destructiveHint`, `idempotentHint`, `openWorldHint`) are recorded. When the registry gives
   no arguments and the server answers with a usage text that names `mcp`, `serve`, `server`,
   `start`, `stdio` or `run`, it is started once more with that subcommand
   (`firstRun.retriedWith`).
3. **Parsing.** From the trace: accesses under `$HOME` by two-level prefix (reads, writes,
   probes, mutations, ok/ENOENT/EACCES outcome, whether content was opened, up to 12 sample
   paths); `execve` by binary name; `connect()` to IPv4/IPv6 with port, and the DNS queries and
   answers decoded from port 53 to attribute each IP to a name. The raw trace is deleted after
   parsing; only the aggregates are kept.

### Sandbox

Everything runs in `bubblewrap` with a **decoy** `$HOME` mounted at the real `$HOME` path (so
that traced paths read like a developer's; in the published data that path appears as
`/home/user`): `~/.npmrc` with a canary token, `~/.ssh/*`, `~/.aws/credentials`,
`~/.config/gh/hosts.yml`, `~/.gitconfig`, `~/.git-credentials`, `~/.docker/config.json`,
`~/.kube/config`, `~/.netrc`, `~/.pypirc`, `~/.env`, `~/.claude*`, `~/.cursor/mcp.json`,
`~/.codex`, `~/.gemini`, `~/Documents`, `~/.bash_history`. None of it is real; the values are
inert strings that match no secret-scanner pattern. Bound back inside: the host's Node
(read-only), the npm and uv caches (persistent across cells, capped at 3 GB), and kernel and
Python headers under `/usr/include` from norte-guard's unprivileged toolchain, for sdists with C
extensions to compile. The architecture-specific `x86_64-linux-gnu/python3.13/pyconfig.h` was
not among them, and the 2 builds from sdist in the sample that ran a compiler stopped on it.
**The network is not isolated**: egress is one of the things measured. PID/IPC/UTS are.
Environment built from scratch.

This departs from norte-guard, which traced installs unconfined in the real `$HOME`: there it
was 31 chosen packages; here it is hundreds of arbitrary packages from an unreviewed registry
that includes documented malware.

### What is not measured

- File contents or network payloads, except DNS. `trace=file` records path arguments;
  `send*`/`recv*` that do not go to port 53 are discarded at parse time.
- Behaviour after the first `tools/list`: no tool is invoked. What a server does when a tool
  runs is the next measurement (declared vs observed).
- Servers whose start requires a real resource (a database, a device, an API with a valid
  key): with dummy values they fail to start, or start and fail to connect. The failure and
  where they tried to connect are recorded; it is a result, not a loss.
- The first start of the 25 cells of the cause "requires a variable/credential" that exited (the
  other 3 stayed alive), of the 42 that aborted on an exception and of the 17 whose binary never
  executed (not found 4, `Exec format error` 13): it was not observed. First-start network and `$HOME` rates are
  given over the 347 servers that started as well as over the 579 attempts.
- Anything a server does on a timer after the 10 s idle window.
- Whether a longer idle window, real values for the declared variables or a run outside
  bubblewrap change what a server does at first start: `src/run.ts` has those arms, and no run
  of them is published.
- A registry entry's `runtimeArguments` at install: the install is `<id>==<ver>` alone. 11 PyPI
  entries carry `runtimeArguments`, and none of the 11 started. 7 add the package's `[mcp]` extra
  (`darwin-memo`, `semahash`, `terravision`, `servonaut`, `scout-security`, `forgejudge`,
  `model-ledger`), and `tokeven` adds `mcp>=2.0,<3.0` itself. `darwin-memo`, `semahash` and
  `terravision` are among the 15 "module not found", with `No module named 'mcp'`. None of the 52
  carries `runtimeArguments`.
- A server that detects the tracer (`ptrace`) and behaves differently under it.
- OCI and MCPB packages.

## Running it

```
node src/population.ts <registry-pages-dir> results        # population + sample
node src/run.ts results/sample.ndjson results/cells.ndjson  # resumable
node src/report.ts results/cells.ndjson results/report.md
```

Temporary files live under `/var/tmp/nl-mcp-install/` (toolchain: strace 6.13 and uv obtained
without privileges; caches; the decoy home, rebuilt per cell). Deleted when the run is done.
Additional arms: `NL_IDLE_MS` (longer idle), `NL_NO_BWRAP=1` (unconfined), `NL_ENV_OVERRIDES`
(real values for declared variables; only the names reach the results).

## Figures

One row per figure that findings.md and this README state. Rates carry 95 % Wilson intervals.
Cluster-robust intervals take one cluster per publisher key: the GitHub or GitLab owner in
`repositoryUrl`, else the registry namespace, with an `io.github.<owner>` namespace read as that
GitHub owner. Their variance is the sandwich estimator without small-sample correction, and DEFF
is that variance over the binomial one (`publisherKey` and `clusterRobust` in `src/report.ts`).
*Outside* is a `$HOME`
prefix outside `~/proj`, the toolchain (`~/.local`, `~/.local/lib`, `~/.local/bin`) and the
package-manager caches (`~/.npm*`, `~/.cache/uv`, `~/.cache`). A *decoy* prefix is one under a
path of `DECOY_FILES` in `src/report.ts`. A cell *wrote* a prefix when its `writes` or
`mutations` are above 0.

| figure as published | where (file:line) | field or computation | source file | moment (as of when) |
|---|---|---|---|---|
| 2026-09-11 19:35 UTC to 2026-09-12 00:06 UTC | findings.md:3 | earliest `startedAt`; latest `startedAt` + `install.ms` + `firstRun.ms` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 600 cells (420 npm, 180 PyPI) | findings.md:3; README.md:4 | cells by `registryType` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 11,484 (7,987 npm + 3,497 PyPI); 600 of 11,484 | findings.md:4, 185; README.md:29 | rows with `registryType` npm or pypi and `transport` = `stdio` | `results/population.ndjson.gz` | registry, paginated 2026-09-11 |
| 310 pages | README.md:20 | not carried by any published file | none in `results/` | registry, paginated 2026-09-11 |
| 30,945 entries; 30,611 active | README.md:21 | `entries`, `active` (stored totals; the pages they count are not published) | `results/population-stats.json` | registry, paginated 2026-09-11 |
| 13,150 active with `packages[]`; 17,058 remote-only | README.md:25, 26 | `withPackages`, `remoteOnly` (stored totals) | `results/population-stats.json` | registry, paginated 2026-09-11 |
| 13,708 distinct packages | README.md:27 | rows, one per (`registryType`, `identifier`) | `results/population.ndjson.gz` | registry, paginated 2026-09-11 |
| 8,070 / 3,519 / 886 / 1,077 / 108 / 48; OCI (886), MCPB (1,077) | README.md:28; findings.md:208 | rows by `registryType` | `results/population.ndjson.gz` | registry, paginated 2026-09-11 |
| first 420 npm and 180 PyPI; 70/30 | README.md:36 | eligible rows sorted by sha256(seed + "\n" + type::identifier), first 420 npm and 180 pypi; 7,987/11,484 = 69.5 % | `results/population.ndjson.gz` + `results/sample.ndjson` | registry, paginated 2026-09-11 |
| 519 distinct publishers | findings.md:185 | distinct `publisherKey` values (`src/report.ts`, as above) over the 600 cells | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| npm 404/420 (96.2 %), PyPI 175/180 (97.2 %) | findings.md:11 | `install.ok`, by `registryType` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 21 failures: 10 the registry's (7 versions, 3 packages); 3 macOS-only, 2 missing dependencies, 2 sdist builds without `pyconfig.h`, 1 Python 3.14, 1 install script, 1 timeout, 1 no message | findings.md:11-16 | `install.stderrTail` of the cells with `install.ok` false: npm `ETARGET` (6) or uv "there is no version of" the package (1); npm `E404` on the package itself (3); `EBADPLATFORM` (3); a dependency not in its registry (`ldk-node`, `@bbb/common`); `pyconfig.h: No such file or directory` (2); "depends on Python>=3.14" (1); `MODULE_NOT_FOUND` from an install script (1); `install.signal` = SIGKILL (1); no error line (1). `failReason` in `src/report.ts` puts the same 21 in the same buckets (the two "failures" lines of `results/report.md`): version missing 7 (npm 6, PyPI 1), package does not exist 3, another platform 3, a dependency missing 2, build failure (sdist) 2, Python version 1, install script failed 1, timeout 1, other 1 | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 12.6 % [9.7–16.2] of npm trees run an install script | findings.md:18 | npm cells with `install.ok` and a non-empty `install.npm.installScripts`, over 404 | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| the server itself declares one: 3.7 % [2.3–6.0] | findings.md:19 | an `installScripts[].pkg` equal to the cell's `identifier`, over 404 | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| better-sqlite3 15 trees, protobufjs 11, sharp 5 | findings.md:20, 22 | npm trees whose `installScripts[].pkg` include the package | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 31 of the 51 trees: a dependency's script builds or fetches a native module | findings.md:19-22 | npm trees with an `installScripts[].pkg` other than the cell's `identifier` among `better-sqlite3`, `sharp`, `tree-sitter-*`, `ssh2`, `cpu-features`, `keytar`, `onnxruntime-node`, `bufferutil`, `utf-8-validate`, `argon2`, `decibri`, `esbuild`, `workerd`; which packages build or fetch a native module is a reading of each package's script, not a rule of `src/report.ts` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 7 more: the server's own `postinstall` downloads a release asset; of the 16 cells at `release-assets.githubusercontent.com`, 9 dependency prebuilds and 7 the server's own `postinstall` | findings.md:21-22, 24-25 | of the other 20 trees, those whose only install script is the server's own (`installScripts[].pkg` = `identifier`) and whose `install.trace.net.hosts` include `release-assets.githubusercontent.com` (7); the other 9 cells with that host carry a dependency script from the list above | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 7.4 % leave a `.node` binary | findings.md:22 | `install.npm.nativeNodeFiles` > 0, over 404 | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 5.2 %: node-gyp, prebuild-install or a compiler runs | findings.md:22-23 | a key of `install.trace.execBasenames` matching `node-gyp\|prebuild-install\|make\|gcc\|g\+\+\|cc1\|cmake`, over 404 | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| github.com + release-assets 16 cells (9 dependency prebuilds, 7 the server's own `postinstall`), nodejs.org 5, api.nuget.org 3, opencollective.com 1; no other host but the two registries | findings.md:23-28 | cells with the host in `install.trace.net.hosts[].host`; over the 600 installs the distinct hosts are these five, `registry.npmjs.org` and `pypi.org` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 0/175 builds from sdist; no compiler executed | findings.md:30-31 | PyPI cells with `install.ok`: non-empty `install.pypi.builtFromSource`; an `execBasenames` key starting with gcc, g++, cc1, make, cmake, rustc or cargo | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 2 of the 5 failed PyPI installs compile from sdist (`evdev`, `pyswisseph`) and stop on `pyconfig.h` | findings.md:32-34; README.md:83, 84 | PyPI cells with `install.ok` false and an `execBasenames` key `gcc` or `cc1`; their `install.stderrTail` has `fatal error: x86_64-linux-gnu/python3.13/pyconfig.h: No such file or directory` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 90.9 % contain compiled extensions | findings.md:31 | `install.pypi.soFiles` > 0, over 175 | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 420/420 cells read `~/.npmrc` and `~/.gitconfig` | findings.md:37 | npm cells whose `install.trace.home` has prefix `~/.npmrc` and prefix `~/.gitconfig` with `contentAccessed` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 8 cells write `~/.npm/_prebuilds`, 9 more only read it; 5 write `~/.cache/node-gyp` | findings.md:46 | cells whose `install.trace.home` has that prefix with `writes` or `mutations` > 0 (write), or with `contentAccessed` and neither (only read) | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 60 %; 347/579 (59.9 % [55.9–63.8]) | findings.md:51 | `firstRun.client.initializeOk`, over cells with `firstRun.attempted` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| npm 69.8 %, PyPI 37.1 % [30.3–44.5] | findings.md:51, 52 | the same, by `registryType` (404 and 175 attempted) | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 232 attempts without a handshake; 231 with a client record | findings.md:52 | attempted cells without `firstRun.client.initializeOk`; of those, cells with a `firstRun.client` record. The one without is `@starreel/mcp` (`EPIPE`) | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 52, 29.7 % of the 175 PyPI installs; Wilson [23.4–36.9] | findings.md:57, 174; README.md:261-262 | PyPI attempted cells whose `firstRun.client.stderrTail` carries the rename's own error, `No module named 'mcp.server.fastmcp'` (`RENAMED` in `src/report.ts`: that message or `this is mcp 2.x`); a message that names the module while `mcp` itself is missing is not counted. No cell outside the 52 carries the message in any field | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| CSOAI-ORG: 21 sampled, none starts, 19 of the 52, 2 other | findings.md:57; README.md:269, 270 | cells with `namespace` = `io.github.CSOAI-ORG` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| cluster-robust [14.1–45.3], DEFF 5.3 (5.30) | findings.md:57, 188 | cluster-robust over the 175 by publisher key (as above), 142 clusters, `io.github.CSOAI-ORG` one of them (all 21 keyed `github.com/csoai-org`: 18 from `repositoryUrl`, 3 with no `repositoryUrl` from the `io.github.CSOAI-ORG` namespace), over the 52 above | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| without that publisher 33/154 = 21.4 % | findings.md:57; README.md:270 | the 175 less the 21 `io.github.CSOAI-ORG` cells | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| by publisher, 32 of 142 (22.5 %) | findings.md:57, 174-176 | publisher keys (as above) among the 175 with at least one broken cell | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| between a fifth and a third | findings.md:70 | 21.4 % and 22.5 % (the two rows above) to 29.7 %, the rate of the rename's error | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| six weeks after 2.0.0, released 2026-07-28 | findings.md:57, 69, 176 | run date less the release date of `mcp` 2.0.0 on PyPI; the release date is not carried by any published file | none in `results/` | external |
| 42 / 17 (4 + 13) / 21 / 28 / 21 / 21 / 15 / 7 / 5 / 2 | findings.md:58-67 | first matching rule of `noHandshakeReason` (`src/report.ts`) on the client's and the run's `stderrTail` and the first stdout line, over the 231 with a client record; the 17 are the causes "the binary was not found" (4, `strace: Cannot stat`) and "the binary could not be executed" (13, `Exec format error`), which the function tests before any rule on the message; "exits with code 1" is "exited with code 1" (21); "other exit codes" is exit codes 127 (2), 2 (2) and 3 (1); "fails to connect to a service" is a rule of its own (2); 2 of the 15 "module not found" ran `python -m` with the identifier as module name (`firstRun.argNotes` "module guessed from identifier": `token-economy-intel`, `precision-desktop`) | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| python-sdk#3309 (2026-08-14); 2609.10962 "fewer than half" | findings.md:80, 81 | cited, not measured | none in `results/` | external |
| row `>=1.x`, no ceiling: 71 / 51 / 0 / 20 | findings.md:89 | `mcp_spec` with a 1.x floor and no upper bound; outcome of the same `identifier`@`version` in the cells: broken (rule above), start (`initializeOk`), other | `results/pypi-mcp-requirements.json` + `results/cells.ndjson` | PyPI metadata read 2026-09-12; run |
| 10 stop on `'Server' object has no attribute 'list_tools'`, all in the first row; 9 under "exception at start", 1 under the credential rule | findings.md:72-75, 99-100; README.md:273-276 | PyPI attempted cells whose `firstRun.client.stderrTail` carries that message; their `mcp_spec` row; their cause under `noHandshakeReason` | `results/cells.ndjson` + `results/pypi-mcp-requirements.json` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| at least 62 of 175 (35.4 %) broken by 2.0, from at least 41 of 142 publishers; 48 not examined | findings.md:76-77, 175-176; README.md:276-278 | the 52 and the 10 above; their publisher keys (as above); PyPI attempted cells without `initializeOk` (110) less those 62 | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 2.0 removed `Server.list_tools()`; the constructor takes `on_list_tools=` | findings.md:75-76; README.md:275-276 | `src/mcp/server/lowlevel/server.py` of modelcontextprotocol/python-sdk at `v1.28.0` (`def list_tools`) and at `v2.0.0` (`on_list_tools`), cited, not measured | none in `results/` | external |
| row ceiling below 2: 26 / 0 / 22 / 4 | findings.md:90 | `mcp_spec` with an upper bound at or below 2.0.0, or `==1.x` | `results/pypi-mcp-requirements.json` + `results/cells.ndjson` | PyPI metadata read 2026-09-12; run |
| row requires 2.x: 13 / 0 / 9 / 4 | findings.md:91 | `mcp_spec` with a floor at or above 2, or `==2.x` | `results/pypi-mcp-requirements.json` + `results/cells.ndjson` | PyPI metadata read 2026-09-12; run |
| row accepts 1.x and 2.x: 4 / 0 / 4 / 0 | findings.md:92 | `mcp_spec` with a 1.x floor and `<3` | `results/pypi-mcp-requirements.json` + `results/cells.ndjson` | PyPI metadata read 2026-09-12; run |
| row unconstrained: 5 / 0 / 5 / 0 | findings.md:93 | `mcp_spec` = empty string | `results/pypi-mcp-requirements.json` + `results/cells.ndjson` | PyPI metadata read 2026-09-12; run |
| row through fastmcp: 24 / 1 / 17 / 6 | findings.md:94 | `mcp_spec` null, `fastmcp_spec` not null | `results/pypi-mcp-requirements.json` + `results/cells.ndjson` | PyPI metadata read 2026-09-12; run |
| row other route: 32 / 0 / 8 / 24 | findings.md:95 | `mcp_spec` and `fastmcp_spec` null | `results/pypi-mcp-requirements.json` + `results/cells.ndjson` | PyPI metadata read 2026-09-12; run |
| 119 of 175 declare `mcp`; 26 (15 %, 22 %) bound it below 2; the 19 in the first row | findings.md:97-99 | `mcp_spec` not null; the ceiling row over 175 and over 119; `mcp_spec` of the 19 CSOAI-ORG cells | `results/pypi-mcp-requirements.json` + `results/cells.ndjson` | PyPI metadata read 2026-09-12; run |
| 21 print a usage text; 16 without package arguments; a subcommand tried in 5, started 1, 2 of them among the 21 | findings.md:62, 99-103 | cause "prints usage"; empty `packageArguments` of the same `identifier`@`version`; cells with `firstRun.retriedWith` (all 5 print usage in `firstRun.firstAttempt`); of those, `initializeOk`, and cause "prints usage" after the retry | `results/cells.ndjson` + `results/sample.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 344 servers, 6,485 tools; median 8, maximum 803 | findings.md:105-106 | attempted cells with `toolsListOk`; sum, median (both middle values are 8) and maximum of `toolsCount` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 117/344 (34.0 %) annotate one tool; 106 all | findings.md:106 | servers with a tool carrying one of the four hint keys; servers where all do | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 2,849/6,485 (43.9 %); `readOnlyHint: true` 2,120, `destructiveHint: true` 203, `false` 1,013 | findings.md:106-108 | tools carrying a hint key; hint values. `tools[]` keeps 200 per server, so the two servers above that (245 and 803 tools) count from `annotationSummary` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 47/579 (8.1 % [6.2–10.6]) | findings.md:111 | non-empty `firstRun.trace.net.hosts` (DNS on port 53 is not a host) | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 21 PyPI cells contact `pypi.org`; 12 % [8.0–17.6]; cluster-robust [4.8–19.2] | findings.md:114, 117-118 | host `pypi.org` in `firstRun.trace.net.hosts`, over the 175 PyPI attempted; publisher key as above; all 21 write `~/.local/share/fastmcp/version_cache.json` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 3 npm servers query `registry.npmjs.org`; two read `~/.npmrc` | findings.md:119-120 | host `registry.npmjs.org` at first start; prefix `~/.npmrc` with `contentAccessed` at first start | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| telemetry, 4 cells (0.7 % [0.3–1.8]) | findings.md:121, 187 | a host among `us.i.posthog.com`, `play.googleapis.com`, `mobile.events.data.microsoft.com`, `usage.gistrec.cloud` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| `placeroot` over plain HTTP, `extensions.duckdb.org:80` | findings.md:132-133 | host `extensions.duckdb.org` with port 80 in the cell's `firstRun.trace.net.hosts` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| DuckDB checks the file's signature before writing it and on every load | findings.md:133-135 | read from DuckDB's code (`CORE_REPOSITORY_URL`; the check at install and at `LOAD`), not measured; an altered file was not tried in the published run | none in `results/` | external |
| 6 cells contact their own vendor's API, 2 with a declared key; 5 connect to `127.0.0.1` (5432, 7331, 8080, 8973, 12345), none with a declared variable | findings.md:136-138 | a host under the registrable domain of `websiteUrl` or `repositoryUrl` (code hosts excluded), as `classifyHost` in `src/report.ts`; host `127.0.0.1` and its ports; `environmentVariables` and `packageArguments` of the same `identifier`@`version` (`HASDATA_API_KEY`, `VORIS_API_KEY`; none for the 5) | `results/cells.ndjson` + `results/sample.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 59/579 (10.2 % [8.0–12.9]) open content outside | findings.md:140 | a `firstRun.trace.home` prefix outside, with `contentAccessed` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 18 (3.1 % [2.0–4.9]) touch a decoy | findings.md:144 | a decoy prefix with `contentAccessed` in `firstRun.trace.home` | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| decoys: `~/.env` 9, `~/.npmrc` 2, `~/.claude` 2, 1 each for the rest | findings.md:148-155 | cells per decoy path; `~/.cursorrules` is not a decoy path and appears through the same cell | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| no read of `~/.ssh`, `~/.git-credentials`, `~/.config/gh`, `~/.docker`, `~/.pypirc`, `~/.bash_history` | findings.md:157-158 | those prefixes with `contentAccessed` at first start: 0 (no access of any kind either) | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 3/600 (0.5 % [0.2–1.5]) write an AI client's configuration: 1 at install, 2 at start; a fourth writes its own database under `~/.claude` | findings.md:162-166 | cells that wrote under `~/.config/Claude`, `~/.claude`, `~/.cursor*`, `~/.gemini` or `~/.codex`, at install or first start (4 of 600), less `claude-code-conversation-search-mcp`, whose writes there are `~/.claude/conversation-search.db` and its journal | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 21 + 3 version and update checks, 4 telemetry, 3 remote configuration, 1 HTTP download: 30/579 = 5.2 % [3.7–7.3]; 30/347 = 8.6 % [6.1–12.1] | findings.md:169-173 | union of the cells with `pypi.org`, `registry.npmjs.org`, a telemetry host, one of the three remote-configuration servers named above, or `extensions.duckdb.org:80`; two cells are in two groups; all 30 completed the handshake | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| design effect 5.3 (the rename), 2.25 (handshake), 2.2 (`pypi.org` at start), 1.5 (egress at first start), about 1 for the rest | findings.md:188-190 | the DEFF column of the cluster table in `results/report.md`, publisher key as above: 5.30, 2.25, 2.22, 1.49; install script 1.06, telemetry 1.01, decoy 1.02, `~/.env` 1.02 | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| about 80 h for the full run | findings.md:191 | (last end − first start) / 600 × (11,484 − 600) = 82 h | `results/cells.ndjson` + `results/population.ndjson.gz` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 28 whose message names a variable, a key, a token or a required value (25 exited, 4 stop on something else), 42 on an exception, 17 never executed | findings.md:61, 192-194; README.md:101-103, 250-251 | causes "requires a variable/credential" (the rule `environment variable|env var|api[_ ]key|token|missing required|is required|not set` on the stderr), "exception at start", and "the binary was not found" plus "the binary could not be executed"; of the 28, `firstRun.client.exitedEarly` in 25. The 4 are `token-compressor-mcp` (`AttributeError`, `token` in its path), `shutterbox` (`SyntaxError: Invalid or unexpected token`), `skilldb` (a help text) and `tokeven` (`The 'mcp' package is required`). In 11, the variable named is in the entry's `environmentVariables` | `results/cells.ndjson` + `results/sample.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 579 attempts, 347 started, ~1.7× | findings.md:196-199; README.md:103-104, 250 | 579 / 347 = 1.67 | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| 11 PyPI entries with `runtimeArguments`, none started; 7 add the `[mcp]` extra; `tokeven` adds `mcp>=2.0,<3.0`; none of the 52 | findings.md:203-205; README.md:109-114 | PyPI cells whose entry in `results/sample.ndjson` has a non-empty `runtimeArguments`; `initializeOk` of each; the values naming `<id>[mcp` or `mcp>=` | `results/cells.ndjson` + `results/sample.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| IPv6 connections to `::1` in 2 cells, unnamed | findings.md:206-207 | host `0:0:0:0:0:0:0:1` in `firstRun.trace.net.hosts`: 2 cells, 9 `connect()` calls | `results/cells.ndjson` | run, 2026-09-11 19:35 to 09-12 00:06 UTC |
| Canopii: 260 servers with install scripts | README.md:15 | cited from prior-art/mcp.md, not measured | none in `results/` | external |
| norte-guard: 31 chosen packages | README.md:89 | cited from norte-guard, not measured | none in `results/` | external |

## Corrections

### 2026-09-12

- **PyPI servers that `mcp` 2.x breaks.** It was "a third of the PyPI servers listed in the
  official registry do not start". It is "between a fifth and a third, depending on whether one
  counts by package or by publisher". The code computed 53/175 = 30.3 % by cell, Wilson
  [24.0–37.5]; the sentence gave that cell rate as a rate of servers. 19 of the 53 are one
  publisher, `io.github.CSOAI-ORG`, and the cluster-robust interval is [15.9–44.7] with DEFF 4.49.
  Without that publisher it is 34/154 = 22.1 %; by publisher, 34/143 = 23.8 %.
- **CSOAI-ORG's share.** It was "21 of the 53" and "all 21 I sampled failed the same way", in the
  comment on python-sdk#3309. It is 19 of the 53: 21 of its cells were sampled and none starts,
  but 2 fail with other errors. The correction went out on python-sdk#3309 as a follow-up comment
  ([results/python-sdk-3309-comment-2.md](results/python-sdk-3309-comment-2.md)), not as an edit.
- **The registry's `status` field.** It was "the registry keeps listing them as active". It is
  "the registry's `status` field shows them as `active`, which is its default value at publish
  time and not a claim that they work". `active` is the default of `status`, and the registry
  says "consumers should assume minimal-to-no moderation". The sentence read the field as a claim
  the registry does not make.
- **placeroot, retracted.** It was "`placeroot` downloads a DuckDB extension over plain HTTP
  (`extensions.duckdb.org:80`) and drops it in `~/.duckdb/extensions/`: executable code, no TLS,
  at first start." It is an HTTP download from DuckDB's default repository, signature verified,
  and not a finding. The repository is compiled into DuckDB
  (`CORE_REPOSITORY_URL = "http://extensions.duckdb.org"`), placeroot neither configures it nor
  touches `allow_unsigned_extensions`, and DuckDB checks the file's RSA signature before writing
  it and on every load: one altered byte and `LOAD` rejects it. The HTTP channel protects neither
  confidentiality (which extension and version is installed) nor against a downgrade to another
  signed version; it protects integrity. It was presented as a security finding about an MCP
  server and it is not one. It has not been reported to anyone.
- **First-start denominators.** First-start network and `$HOME` rates carry both denominators,
  579 attempts and 347 started. 28 cells aborted on credential validation and 42 on an
  exception, so their first start was not observed.

### 2026-09-24

- One third-party personal e-mail address was redacted from `results/cells.ndjson`, in the
  startup banner a server prints on stderr. It is replaced by `[redacted]`, padded so the
  banner's box rule still aligns. No figure reads it.

### 2026-09-25

- **Broken by the rename.** It was 53/175 = 30.3 % [24.0–37.5]; it is 52/175 = 29.7 %
  [23.4–36.9]. The count is of the packages whose error is the rename's own, `No module named
  'mcp.server.fastmcp'`, not of any import failure that names `mcp`. `darwin-memo` 0.7.1 was
  counted because its message names `mcp.server.fastmcp`; its error is `No module named 'mcp'`:
  `mcp` is an optional extra of that package and was not installed (its registry entry adds it
  with `--with darwin-memo[mcp]`, which the install does not apply). It is now among the causes
  "module not found" (15, not 14), the "other route" row of the `mcp` constraints is 32 / 0 / 8 /
  24, and its `outcome` in `results/pypi-mcp-requirements.json`, which carried the old rule, is
  `other-failure`. No cell outside the 52 carries the rename's message. 19 of the 52 are
  CSOAI-ORG's, and without that publisher it is 33/154 = 21.4 % (it was 34/154 = 22.1 %). The
  corrections to the two comments on python-sdk#3309 are in one comment for that issue,
  [results/python-sdk-3309-comment-3.md](results/python-sdk-3309-comment-3.md).
- **What 2.0 broke.** The 52 were given as the servers broken by `mcp` 2.x; they are those that
  stop on the rename's error. Ten more, all with a floor and no ceiling on `mcp`, stop at a
  `list_tools()` decorator with `AttributeError: 'Server' object has no attribute 'list_tools'`:
  2.0 removed that decorator from the low-level `Server`. At least 62 of 175 (35.4 %) are broken
  by 2.0, from at least 41 of 142 publishers; the other 48 PyPI attempts without a handshake were
  not examined for a 2.0 cause.
- **Publisher clusters.** It was [15.9–44.7] (DEFF 4.5) for the `mcp` 2.x rate and 34 of 143
  publishers with a broken server; it is [14.1–45.3] (DEFF 5.3) and 32 of 142 (22.5 %). The
  code's publisher key split `io.github.CSOAI-ORG` into its GitHub owner (18 cells) and its
  namespace (3), and the sentence counted it as one publisher; `publisherKey` now reads an
  `io.github.<owner>` namespace as that GitHub owner. The rest of the change is the 52 above. As
  one publisher, `pypi.org` at start goes from [5.0–19.0] to [4.8–19.2], and the sample from 520
  publishers to 519.
- **Design effects.** It was "the only rate with a relevant design effect is the `mcp` 2.x one
  (DEFF 4.5)". It is 5.3 for that rate, 2.25 for the handshake rate, 2.2 for `pypi.org` at
  start, and 1.5 for egress at first start. The cluster table carried the other three; the
  sentence left them out.
- **Install scripts.** It was "almost all of it is native". In 31 of the 51 trees with an
  install script a dependency builds or fetches a native module; in 7 the server's own
  `postinstall` downloads a release asset; `protobufjs`, listed as native, runs a version check.
  The 16 cells that reached `release-assets.githubusercontent.com` were all called prebuilds; 7
  are the server's own `postinstall`.
- **Exit code 1.** It was 38 attempts that exit with code 1 and no classifiable message. In 17
  of them the server never executed: its binary was not found (4) or could not be executed
  (`Exec format error`, 13). 21 exited with code 1.
- **Install failures.** It was "the failures are the registry's, not the package's: 9 versions
  the registry lists and the package registry does not have, 4 nonexistent packages (404), 1
  timeout, 7 other". It is 10 of the 21 the registry's (7 versions, 3 packages); the other 11
  are 3 macOS-only packages, 2 missing dependencies, 2 sdist builds without a Python header, 1
  package that requires Python 3.14, 1 install script calling a missing file, 1 timeout and 1
  failure with no message. The code bucketed `install.stderrTail` by pattern: its 9 missing
  versions included a missing dependency (`ldk-node`) and the Python 3.14 requirement, its 4
  missing packages a missing dependency (`@bbb/common`), and its 7 "other" the rest; the
  sentence read every bucket as the registry's. `failReason` now tells the package's own name
  from a dependency's and has buckets for the platform, the Python version, the sdist build and
  the install script.
- **Hosts at install.** It was "no install contacted a host that was not a registry, a code
  forge or a binary CDN". It is every host but `opencollective.com` (1 cell), which the same
  paragraph lists.
- **PyPI, code at install.** It was "no package in the sample needed to run code to install",
  and in this README, headers mounted "so that sdists with C extensions compile as they would on
  a development machine". It is none of the 175 that installed; 2 of the 5 that did not install
  had to compile from sdist, and `gcc` stopped on the architecture-specific `pyconfig.h`, which
  the mounted headers lack. The code computed 0/175 over completed installs; the sentence spoke
  of the whole sample.
- **`~/.npm/_prebuilds`.** It was "17 cells write"; it is 8 that write and 9 that only read. The
  code counted cells that opened content under the prefix, reads included.
- **Attempts without a handshake.** It was "the 231 cells without a handshake"; it is 232
  attempts without one, 231 of them with a client record and a cause. The code counts causes
  over cells with a client record.
- **Other exit codes.** It was 7; it is 5 (127 twice, 2 twice, 3 once). The other 2 are the
  code's cause "fails to connect to a service", now a row of its own.
- **`mcp` constraint rows.** It was one row, "requires 2.x", 17 / 0 / 13 / 4. It is 13 / 0 / 9 /
  4 that require 2.x and 4 / 0 / 4 / 0 that accept 1.x and 2.x (`>=1.x,<3`), which the row's
  rule counted among those that require 2.x.
- **"Prints usage".** It was "the binary expects a subcommand the registry does not declare" and
  "the 21 are incomplete registry metadata"; 5 of the 21 have package arguments in the registry.
  The 5 retried with a subcommand read as part of the 21; 2 of them are, 1 started and 2 ended in
  other causes.
- **Vendor API and `127.0.0.1`.** It was 6 cells "with the dummy key" and 5 "because the dummy
  URL points there". It is 2 of the 6 with a dummy key the registry declares, and none of the 5
  given an address: the registry declares no variable for them. The code classifies the host;
  the sentence gave a cause the cells do not carry.
- **Self-registration.** It was 4/600 (0.7 % [0.3–1.7]) writing into an AI client's
  configuration; it is 3/600 (0.5 % [0.2–1.5]). The count took every cell that wrote under an AI
  client's directory; one of the four, `claude-code-conversation-search-mcp`, writes its own
  database there.
- **Network outside the wrapped service.** It was headed "network the server does not decide"
  and given as 30/579 "of the servers started". The 30 include 3 servers' own update checks, and
  579 are attempts. It is "network that does not go to the service the server wraps", 30/579 of
  the attempts and 30/347 of the servers that started.
- **`::1`.** It was "2 IPv6 connections"; it is 2 cells (9 `connect()` calls).
- **State of their own.** "30 write state of their own" was withdrawn: no file in the repository
  produces it; how many servers write state of their own at first start is unmeasured.
- **Checks of 2026-09-12.** 120 s of idle adding no hosts (39 of 40 servers), a real
  `GITHUB_TOKEN` changing nothing at start (4 of 4), the same behaviour without bubblewrap (20 of
  20) and the sample matching the population on 11 covariates (|z| < 2 on all) were withdrawn:
  no file in the repository carries those runs, and no computation in it produces the
  comparison. Whether a longer idle window, real credentials or a run outside the sandbox change
  what a server does at first start is not measured, and how the sample compares with the
  population on those covariates is not reported.
- **Variable or credential cause.** It was "demands a credential or a value from a list the
  registry does not document" and 28 servers "that abort on credential validation". The 28 are
  the code's rule on the message (a variable, a key, `token`, `is required`, `not set`): 4 of them
  stop on something else (an `AttributeError`, a `SyntaxError`, a help text, a missing `mcp`
  package), 3 stayed alive, and in 11 the variable is one the registry declares, filled with a
  dummy value. The sentence read the rule's name as a cause.
- It was "the majority cause on PyPI"; the rename is 52 of the 110 PyPI attempts without a
  handshake, the largest cause and not a majority.
- **placeroot's altered file.** The test that altered one byte of placeroot's DuckDB extension
  and saw `LOAD` reject it was withdrawn: no file in the repository carries that run. That
  DuckDB checks the file's signature before writing it and on every load is read from DuckDB's
  code, not measured here.
