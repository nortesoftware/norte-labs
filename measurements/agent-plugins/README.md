# measurements/agent-plugins

**Results: [findings.md](findings.md)** (narrative) and [results/report.md](results/report.md)
(generated figures). Runs of 2026-09-16/17, 618 cells over four whole populations, and of
2026-09-18, 600 sampled Open VSX extensions. Additional checks and corrections in
[verification.md](verification.md). What was reported to
whom, with the texts as sent, is in [results/reports/](results/reports/): Cursor
(security-reports@cursor.com), Qoder (its data-protection address) and the ACP registry
(private report GHSA-j23x-fp73-5x84), and zed-industries/extensions#7640.

What the plugins of the AI coding assistants do when they are installed and when they first
run: install scripts, network, telemetry, which `$HOME` paths they touch, what they download.
It is mcp-install's instrument ([../mcp-install/](../mcp-install/): `strace -f -e
trace=file,execve,network` in a bubblewrap sandbox with a decoy `$HOME`, a network trace, a
protocol handshake, ten seconds idle) over four populations that the prior-art sweep found
unmeasured ([../../prior-art/agent-plugins.md](../../prior-art/agent-plugins.md)), chosen
because the instrument transfers to them as is, plus the one population that needed a new arm:
the VSIX extensions of Open VSX, the gallery behind Cursor and Windsurf, activated inside a
headless editor under the same trace (run of 2026-09-18, 600 sampled extensions; the arm and
its limits are described below, its prior art in the addendum of the sweep record).

In the first four the sample is the population, so every rate is a proportion of the whole
registry on the day, with a 95 % Wilson interval for the reader who wants to treat the day as a
draw; there is no design effect to report. Open VSX is a seeded random sample of its 17,944
extensions, and its rates are estimates for the registry with the same intervals.

## Populations and order

The order is the order of the run, and the reason for it is the first population.

1. **ACP registry** (`agentclientprotocol/registry`, commit `b8978f1`, 2026-09-16): the coding
   agents that Zed and JetBrains IDEs install — 42 agent directories, 41 published, 8
   quarantined; 44 cells, one per distribution that runs on linux-x86_64 (23 npm, 19 binary, 2
   uvx). The registry's own CI installs and launches every agent and publishes the outcome
   daily (`.protocol-matrix/latest.json`: initialize and `session/new` status, auth methods;
   `quarantine.json`: why an agent is frozen). That is someone else's field truth for the same
   cells, so this population validates the instrument before the others rely on it: whether it
   agrees with their 34 probed and their 8 quarantined; what it sees that a launch check cannot
   (install scripts, egress, credential paths, what the agent downloads); whether it flags
   anything they passed.
2. **Cursor Marketplace** (catalogue endpoint, 2026-09-16): 330 approved plugins from 240
   publishers, 324 pinned to a commit, 271 declaring MCP servers. One cell per plugin.
3. **Devin marketplace** (`CognitionAI/devin-marketplace`, commit `e314c2f`, 2026-09-14): 171
   plugins; 120 declare only remote MCP servers, 51 a command (24 `docker`, 15 `npx`, 11 `uvx`,
   1 `pipx`); none declares hooks. One cell per plugin.
4. **Zed context-server extensions** (`api.zed.dev/extensions?provides=context-servers`,
   2026-09-16): 73 extensions. One cell per extension.
5. **Open VSX** (`open-vsx.org`, sitemap of 2026-09-18: 17,944 extensions, one URL each; the
   search API reports 17,941): a sample of 600, the first 600 extensions of the frame ordered
   by `sha256(seed + "\n" + namespace.name)` with the seed `norte-labs agent-plugins openvsx
   2026-09-17`. For each, the registry record (`/api/{namespace}/{name}`: latest version,
   publisher account, verified namespace, engines, `extensionKind`, download count) and the
   VSIX for `linux-x64` when the extension is platform-specific, else `universal` (8 and 592);
   all 600 had a record and a download. Frame, sample and records are in
   `results/openvsx-sitemap-2026-09-18.xml.gz`, `results/population-openvsx.ndjson` and its
   stats file. One cell per extension, plus three baseline cells. The cells of this arm are
   29 MB against about a megabyte for each of the other four and are stored gzipped. Two
   re-runs over the cells that did something beyond the baseline are beside them:
   `results/check-natural-openvsx.ndjson.gz`, the 121 with activation left to the editor, and
   `results/check-writers-openvsx.ndjson.gz`, the 53 that wrote outside their own storage, run
   again keeping each decoy home so that what was written could be read.

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

- **vsix** (Open VSX): the VSIX is downloaded outside the sandbox (nothing of it runs) and
  inventoried by file magic and manifest (`main`, `browser`, `activationEvents`, `contributes`,
  `extensionKind`, `extensionDependencies`, `extensionPack`, bundled `node_modules`, native
  `.node` files); then, in the sandbox, VSCodium 1.135 (the Code-OSS build whose gallery is
  Open VSX) installs it with its own command line, `codium --install-extension`, under strace
  — the editor unpacks it and fetches declared dependencies from the gallery, which is the whole
  of install for this population; then the editor starts headless (Xvfb inside the sandbox) on
  a small workspace, one file per common language, with a driver extension loaded through
  `--extensionDevelopmentPath` ([src/driver/](src/driver/)): the driver activates the sampled
  extension by id, opens the workspace files its `onLanguage` and `workspaceContains` events
  name, idles 10 s, records the outcome and quits — all under one strace of the whole editor
  (`file,execve,network` plus the clone family). The clone lines give the process tree, and
  the extension host is the process that wrote the driver's record; every access is summarised
  twice, for the whole editor and for the extension host and its descendants (the extension's
  code, the language servers and tools it starts, and the built-in extensions of the editor).
  Three baseline cells run the driver alone with every workspace file open; what they touch
  — the editor's own hosts and paths — is subtracted in the report rather than assumed. The
  editor's settings in the decoy home turn off updates, telemetry, recommendations, experiments
  and schema downloads.

  The run of 2026-09-18 lost power after 107 cells and was resumed against the same results
  file, which skips the ids already written; the cells' `startedAt` shows the gap. The driver
  was refreshed during the resume, so cells before `04:19:32Z` carry no `forced` or
  `isActiveAtEnd` field in their driver record. Every cell was activated the same way.

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

- For Open VSX: activation is forced by the driver, so an extension that would wait for a
  command or a file type the workspace lacks still runs its activation code; what is measured
  is activation behaviour, and the join with `activationEvents` says which of it happens at
  every editor start. Extensions with only a `browser` entry run in the editor's web-worker
  host, outside the extension host's subtree; their network appears only in the whole-editor
  trace, and their file access not at all. Themes, packs, snippets and keymaps have nothing to
  activate and are counted as such. The editor is VSCodium, not Cursor or Windsurf: the
  extension host is the same Code-OSS code, the product's own services are not. Nothing after
  activation is exercised (no commands, no user input, no authentication), and the workspace has
  no git repository. Extensions whose activation depends on a tool the host lacks (a compiler,
  a language runtime) fail or degrade as they would on a bare machine, and the failure is
  recorded.
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
node src/populations.ts openvsx results --n 600 --seed 'norte-labs agent-plugins openvsx 2026-09-17'
node src/run.ts results/population-<arm>.ndjson results/cells-<arm>.ndjson   # resumable
node src/vsix.ts results/population-openvsx.ndjson results/cells-openvsx.ndjson --baseline 3
#   --natural leaves activation to the editor; NL_KEEP_HOME=<dir> keeps each cell's decoy home
node src/report.ts results results/report.md   # reads cells-<arm>.ndjson or its .gz
```

Temporary files live under `/var/tmp/nl-agent-plugins/` (strace 6.13, uv, bun obtained without
privileges; the include forest; caches; one decoy home per runner process) and, for the Open
VSX arm, `/var/tmp/nl-vsix/` (VSCodium 1.135.06055 from its GitHub release, Xvfb and strace
unpacked from Debian packages without privileges, the driver, one decoy home per runner
process; a cell's trace is 50–60 MB and is deleted once parsed). Deleted when the run is done.