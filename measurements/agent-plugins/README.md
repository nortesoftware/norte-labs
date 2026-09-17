# measurements/agent-plugins

**Results: [findings.md](findings.md)** (narrative) and [results/report.md](results/report.md)
(generated figures). Run of 2026-09-16/17, 618 cells over four whole populations. Adversarial
verification pass and corrections in [verification.md](verification.md). What was reported to
whom, with the texts as sent, is in [results/reports/](results/reports/): Cursor
(security-reports@cursor.com), Qoder (its data-protection address) and the ACP registry
(private report GHSA-j23x-fp73-5x84), and zed-industries/extensions#7640.

What the plugins of the AI coding assistants do when they are installed and when they first
run: install scripts, network, telemetry, which `$HOME` paths they touch, what they download.
It is mcp-install's instrument ([../mcp-install/](../mcp-install/): `strace -f -e
trace=file,execve,network` in a bubblewrap sandbox with a decoy `$HOME`, a network trace, a
protocol handshake, ten seconds idle) over four populations that the prior-art sweep found
unmeasured ([../../prior-art/agent-plugins.md](../../prior-art/agent-plugins.md)). No new arm:
the populations were chosen because the instrument transfers to them as is. The VSIX extensions
of Open VSX, which would need an extension-host arm, are not here.

In all four the sample is the population, so every rate is a proportion of the whole registry
on the day, with a 95 % Wilson interval for the reader who wants to treat the day as a draw;
there is no design effect to report.

## Populations and order

The order is the order of the run, and the reason for it is the first population.

1. **ACP registry** (`agentclientprotocol/registry`, commit `b8978f1`, 2026-09-16): the coding
   agents that Zed and JetBrains IDEs install — 42 agent directories, 41 published, 8
   quarantined; 44 cells, one per distribution that runs on linux-x86_64 (23 npm, 19 binary, 2
   uvx). The registry's own CI installs and launches every agent and publishes the outcome
   daily (`.protocol-matrix/latest.json`: initialize and `session/new` status, auth methods;
   `quarantine.json`: why an agent is frozen). That is someone else's field truth for the same
   cells, so this population validates the instrument before the others rely on it: do we agree
   with their 34 probed and their 8 quarantined; what do we see that a launch check cannot
   (install scripts, egress, credential paths, what the agent downloads); do we flag anything
   they passed.
2. **Cursor Marketplace** (catalogue endpoint, 2026-09-16): 330 approved plugins from 240
   publishers, 324 pinned to a commit, 271 declaring MCP servers. One cell per plugin.
3. **Devin marketplace** (`CognitionAI/devin-marketplace`, commit `e314c2f`, 2026-09-14): 171
   plugins; 120 declare only remote MCP servers, 51 a command (24 `docker`, 15 `npx`, 11 `uvx`,
   1 `pipx`); none declares hooks. One cell per plugin.
4. **Zed context-server extensions** (`api.zed.dev/extensions?provides=context-servers`,
   2026-09-16): 73 extensions. One cell per extension.

## Instrument

Per cell, by kind:

- **npm / uvx** (ACP agents; Zed extensions that `npm_install_package`): `npm install
  <pkg>@<ver>` or `uv venv && uv pip install <pkg>==<ver>` under strace; static scan of the
  installed tree (`preinstall`/`install`/`postinstall` scripts, native modules, console
  scripts); then the package's bin with the registry's arguments, driven through the protocol
  handshake, idle 10 s, under strace.
- **binary** (ACP agents; Zed extensions that `download_file` a GitHub release): `curl` the
  archive, `sha256sum`, extract — under strace; the declared sha256 is checked against the
  file; then the declared command.
- **git-plugin** (Cursor, Devin): fetch the repository at the pinned commit (git runs no plugin
  code; not traced), locate the plugin directory (root manifest, the monorepo's
  `marketplace.json`, or the catalogue's `sourcePath`), inventory what it ships (components,
  scripts, executables, files by magic: ELF, PE, Mach-O, WASM), then run every stdio MCP server
  it declares the way the editor would (`npx -y …` installs and starts under one trace, with a
  120 s handshake window) and every hook once, with a synthetic event on stdin and every
  spelling of the plugin-root and project variables exported (`CURSOR_PLUGIN_ROOT`,
  `CLAUDE_PLUGIN_ROOT`, `PLUGIN_ROOT`, `extensionPath` …, `CURSOR_PROJECT_DIR`), the shell
  expanding the command. Remote (`url`) and `docker` servers are recorded, not run. Variables a
  plugin asks the user to fill get inert dummies, typed where the name gives the type away
  (`*LOG_LEVEL` → `INFO`, `*REGION`, `*PORT`).
- **zed-extension**: fetch the extension source, recover from the Rust what the WASM would do
  at first use — `npm_install_package(<pkg>)`, `latest_github_release(<repo>)` plus the asset
  and binary names, or a literal `Command` — and run that as an npm, binary or command cell.
  Heuristic; the resolution and its evidence are recorded per cell, and unresolved extensions
  are counted as such.

Handshakes: ACP agents get `initialize` (protocol version 1, the registry probe's client
capabilities) and `session/new`; MCP servers get `initialize`, `notifications/initialized`,
`tools/list`. Requests the agent sends back (fs, terminal, permission) are recorded and
refused. Outcomes are classified with the ACP registry's own rules (success, auth_required,
method_not_found, error, timeout) so the comparison is like for like.

Sandbox, decoys and parsing as in mcp-install; the login name inside the sandbox is `user` and
the decoy home is bound at the real `$HOME` path, which reads `/home/user` in the published
cells. Two decoys added: `~/.config/zed/settings.json` and `~/proj/README.md`. `bun` is in the
toolchain because first-party Cursor hooks run on it.

### What is not measured

- VSIX extensions (Open VSX, the gallery of Cursor and Windsurf): a different arm.
- Remote MCP servers (`url`): 120 of Devin's 171 plugins and most of Cursor's declare only
  these; nothing installs, nothing runs locally. Counted, not probed.
- `docker` MCP servers: no container runtime on the host.
- Skills, rules, agents and commands: prose for the model; inventoried, not executed.
- What a hook does on a real event or what an agent does after authentication. Hook `matcher`
  fields are not applied (every declared hook runs once on the synthetic event), and hooks and
  MCP declarations are collected from every file a plugin ships (`hooks/hooks.json`, a root
  `hooks.json`, `.cursor/hooks.json`; `mcp.json`, `.mcp.json`, `.cursor/mcp.json`) rather than
  the one Cursor loads, so a plugin that ships the same hooks for several editors is counted
  once per file. Counts of runs are inflated by this; the plugin-level rates are not.
- Connections over IPv4-mapped IPv6 sockets are recorded with a truncated address and not
  joined to a DNS name; the names are in each cell's `dnsNames`. The parser is mcp-install's.

## Running it

```
node src/populations.ts acp    results --acp-clone   /var/tmp/nl-agent-plugins/src/acp-registry
node src/populations.ts cursor results
node src/populations.ts devin  results --devin-clone /var/tmp/nl-agent-plugins/src/devin-marketplace
node src/populations.ts zed    results
node src/run.ts results/population-<arm>.ndjson results/cells-<arm>.ndjson   # resumable
node src/report.ts results results/report.md
```

Temporary files live under `/var/tmp/nl-agent-plugins/` (strace 6.13, uv, bun obtained without
privileges; the include forest; caches; one decoy home per runner process). Deleted when the
run is done.