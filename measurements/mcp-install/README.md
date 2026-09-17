# measurements/mcp-install

**Results: [findings.md](findings.md)** (narrative) and [results/report.md](results/report.md)
(generated figures). Run of 2026-09-11, 600 cells. Additional checks and corrections in
[verification.md](verification.md).

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
2. **First start.** The binary the package installed (`node_modules/.bin/<bin>` or the venv's
   console script; failing that, `python -m <module>` from `runtimeArguments`), with the
   registry's `packageArguments` and `environmentVariables` filled with dummy values
   (`nl-dummy-<NAME>`; paths → `~/proj/data`). A minimal client sends
   `initialize` → `notifications/initialized` → `tools/list`, leaves the process **idle for 10 s**
   and terminates it. Only the server runs under strace (the client launches it). The handshake
   result, the number of tools and the annotations they declare (`readOnlyHint`,
   `destructiveHint`, `idempotentHint`, `openWorldHint`) are recorded.
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
Python headers under `/usr/include` from norte-guard's unprivileged toolchain, so that sdists
with C extensions compile as they would on a development machine. **The network is not
isolated**: egress is one of the things measured. PID/IPC/UTS are. Environment built from
scratch.

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
