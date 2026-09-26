# measurements/agent-plugins

**Results: [findings.md](findings.md)** (narrative) and [results/report.md](results/report.md)
(generated figures). Runs of 2026-09-16/17, 618 cells over four whole populations, and of
2026-09-18, 600 sampled Open VSX extensions. How each figure is derived is under
[Figures](#figures), and corrections are under [Corrections](#corrections). What was reported to
whom, with the texts as sent, is in [results/reports/](results/reports/): Cursor
(security-reports@cursor.com), Qoder (its data-protection address) and the ACP registry
(private report GHSA-j23x-fp73-5x84), and zed-industries/extensions#7640.

What the plugins of the AI coding assistants do when they are installed and when they first
run: install scripts, network, telemetry, which `$HOME` paths they touch, what they download.
It is mcp-install's instrument ([../mcp-install/](../mcp-install/): `strace -f -e
trace=file,execve,network` in a bubblewrap sandbox with a decoy `$HOME`, a network trace, a
protocol handshake, ten seconds idle) over four populations that the prior-art sweep found
unmeasured ([../../prior-art/agent-plugins.md](../../prior-art/agent-plugins.md)) and to which
the instrument transfers as is, plus the one population that needed a new arm: the VSIX
extensions of Open VSX, the gallery behind Cursor and Windsurf, activated inside a
headless editor under the same trace (run of 2026-09-18, 600 sampled extensions; the arm and
its limits are described below, its prior art in the addendum of the sweep record).

In the first four the sample is the population, so every rate is a proportion of the whole
registry on the day, with a 95 % Wilson interval for the reader who wants to treat the day as a
draw; there is no design effect to report. Open VSX is a seeded random sample of its 17,944
extensions, and its rates are estimates for the registry with the same intervals.

## Populations and order

The order is the order of the run.

1. **ACP registry** (`agentclientprotocol/registry`, commit `b8978f1`, 2026-09-16): the coding
   agents that Zed and JetBrains IDEs install — 42 agent directories, 41 published, 8
   quarantined; 44 cells, one per distribution that runs on linux-x86_64 (23 npm, 19 binary, 2
   uvx). The registry's own CI installs and launches every agent and publishes the outcome
   daily (`.protocol-matrix/latest.json`: initialize and `session/new` status, auth methods;
   `quarantine.json`: why an agent is frozen). That is field truth for the same cells, kept by
   someone else, and the instrument's outcomes are compared with it: their 34 probed and their
   8 quarantined. Beside it is what a launch check cannot see (install scripts, egress,
   credential paths, what the agent downloads).
2. **Cursor Marketplace** (catalogue endpoint, 2026-09-16): 330 approved plugins from 240
   publishers, 324 pinned to a commit, 271 declaring MCP servers. One cell per plugin.
3. **Devin marketplace** (`CognitionAI/devin-marketplace`, commit `e314c2f`, 2026-09-15 UTC): 171
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
   29 MB against about a megabyte for each of the other four and are stored gzipped. Beside
   them are two further runs over cells that did something beyond the baseline:
   `results/check-natural-openvsx.ndjson.gz`, the 121 with activation left to the editor, and
   `results/check-writers-openvsx.ndjson.gz`, the 53 that wrote outside their own storage,
   taken keeping each decoy home so that what was written could be read.

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
  120 s handshake window) and every hook once, up to 12 per plugin, with a synthetic event on
  stdin and every
  spelling of the plugin-root and project variables exported (`CURSOR_PLUGIN_ROOT`,
  `CLAUDE_PLUGIN_ROOT`, `PLUGIN_ROOT`, `extensionPath` …, `CURSOR_PROJECT_DIR`), the shell
  expanding the command. Remote (`url`) and `docker` servers are recorded, not run. Variables a
  plugin asks the user to fill get inert dummies, `nl-dummy-` followed by the name; only
  `*LOG_LEVEL` is typed, as `INFO`.
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
  was refreshed during the resume, so cells started before `04:20:19Z` carry no `forced` or
  `isActiveAtEnd` field in their driver record, and the two cells whose extension the editor did
  not find have no `isActiveAtEnd`. Every cell was activated the same way.

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
  fields are not applied (every declared hook, up to 12 per plugin, runs once on the synthetic
  event), and hooks and MCP declarations are collected from the manifest, inline or from the
  files it names, and from every conventional file a plugin ships (`hooks/hooks.json`, a root
  `hooks.json`, `.cursor/hooks.json`; `mcp.json`, `.mcp.json`, `.cursor/mcp.json`) rather than
  the one Cursor loads, so a plugin that ships the same hooks for several editors is counted
  once per file; a hook with the same event and command in two files is counted once. Counts of runs are inflated by this; the plugin-level rates are not.
- Connections over IPv4-mapped IPv6 sockets are recorded with a truncated address and not
  joined to a DNS name; the names are in each cell's `dnsNames`. The parser is mcp-install's.
- Agreement with the ACP matrix: a cell agrees when it is the distribution the matrix probes
  (`npx` is the npm cell) and its `initialize` and `session/new` outcomes equal the matrix's,
  the matrix's `not_probed` counting as equal to an absent status.
- A read is a successful open for reading: `trace.ts` marks `contentAccessed` when the open
  succeeds, and `read()` is not in the strace filter.
- Ten seconds of idle after the handshake. Work scheduled later is not seen, and asynchronous
  work lands inside or outside the window by timing; gemini's `lspci` GPU probe is one such.
- Under CPU contention strace slows downloads by two orders of magnitude. junie's cell, and the
  Cursor cells that ran without a handshake between 22:11 and 22:29 UTC, were taken alone.
- The published cells are rewritten in two places: the workspace path as the agent under test
  URL-encoded or dash-joined it (grok-build, poolside, qoder), and the host's name in one stderr
  line. The registries' author e-mail addresses are stripped from the population and cell
  files. No figure reads the rewritten or stripped fields.
- Open VSX: the registry publishes one sha256 per extension record, for its default download.
  The eight platform-specific extensions were fetched at their `linux-x64` URL, whose bytes
  that digest does not cover, and are left out of the digest comparison.
- Open VSX: rates at activation are over the 472 extensions that activated without error. Five
  more opened a network connection and then failed to activate
  (`microchip.mplab-code-configurator`, `Automiflow.atlasmemory-vscode`, `svdschoot.compdb`,
  `redhat.mta-go`, `raul-shields63.java-extension-pack-jdk`); a failure after the connection
  does not undo it, so 36 of the 517 visible extensions contacted a host.
- Open VSX: the extension host is one process tree for all enabled extensions, so a declared
  dependency's activity falls inside the sampled extension's subtree and is attributed to the
  cell. Two cells are only that. `zardoy.inline-debugger`'s `pnpm root -g` and `npm root -g`,
  its `~/.npmrc` read and its one connection to `cdn.jsdelivr.net` come from
  `zardoy.ide-scripting`, which the editor activates first; the two connections of
  `redhat.vscode-extension-dashbuilder-editor` to `www.schemastore.org` and its
  `lsb_release -a` come from `redhat.vscode-yaml`, its declared dependency.
- Open VSX, activation left to the editor: an extension declaring `onStartupFinished` that was
  not active when the window closed (the workspace files opened, then ten seconds of idle, on
  one CPU) may still run at startup, so the count of those that ran is a floor.
- Open VSX: what the extensions writing inside another tool's directory left there is read from
  each kept decoy home, and the kept homes are not published; the published trace records the
  writes and their path prefixes, not what remained.
- A version measured on the day can stop being downloadable. `huydo862003.typedown-vscode`
  0.34.1 returned 404 four days later, the registry listing only 0.38.0 and 0.38.1; the cell
  stands as taken, and the source statement about it in the findings is read from 0.38.1.

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

## Figures

Each figure stated in findings.md or in this file, with the field it is computed from. Rates
carry 95 % Wilson intervals. A source marked "external" is another work, read at the moment
given; "none" is left for the figures a correction replaced and for one operational time.

| figure as published | where (file:line) | field or computation | source file | moment (as of when) |
|---|---|---|---|---|
| 618 cells over four whole populations | README.md:4 | rows of the four cells files: 44 + 330 + 171 + 73 | `results/cells-acp.ndjson`, `results/cells-cursor.ndjson`, `results/cells-devin.ndjson`, `results/cells-zed.ndjson` | cells of 2026-09-16/17 |
| 42 agents, 44 cells | findings.md:3, 15; README.md:32 | `agentDirs`; rows | `results/population-acp-stats.json`, `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| 41 published, `github-copilot` not in the index; 8 quarantined | findings.md:16; README.md:32 | agents with `fieldTruth.published` true; with `fieldTruth.quarantined` set | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| 23 npm, 2 uvx, 19 binary | findings.md:17-18; README.md:33 | `kind` of each cell | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| 34 probed; 33 of 34 initialize; 21 auth_required | findings.md:14, 70; README.md:37 | agents with `fieldTruth.matrix`; its `initialize` = success; its `sessionNew` = auth_required | `results/cells-acp.ndjson` | matrix of 2026-09-16 |
| 33/34 (97.1 % [85.1–99.5]) | findings.md:24; README.md:340 | cells of the distribution the matrix probes (`npx` = npm) whose `initialize` success and `sessionNew.status` equal the matrix's, `not_probed` equal to none | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| junie: 332 MB archive, downloaded in 14 s | findings.md:26, 27 | `install.binary.bytes` 332,348,297; `install.ms` 13,845 | `results/cells-acp.ndjson` | cell of 2026-09-17 |
| fast-agent: install 18.9 s, `initialize` in 9.7 s | findings.md:59 | `install.ms` 18,879; `firstRun.client.initializeMs` 9,682 | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| crow-cli: no `session/new` answer within 20 s; 3,729 writes under `~/.local/share`, 4,565 under `~/.cache/uv` | findings.md:61 | `sessionNew` timeout at 20,001 ms; `writes` of the two-level prefixes `~/.local/share` and `~/.cache/uv` (trace.ts records two levels) | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| mistral-vibe archive 44,314,346 bytes, sha256 as declared | findings.md:63 | `install.binary.bytes`; `sha256Match` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| three of the eight reasons name the refused version; of the five about the pin, two hold, two do not, one platform-bound | findings.md:51, 65; README.md:360 | `fieldTruth.quarantined` read against each cell's outcome; crow-cli's and qoder's reasons name another version, mistral-vibe's is dated by the registry's history | `results/cells-acp.ndjson`; external: the registry's commit history | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| fast-agent 0.9.30 to 0.10.1 while quarantined | findings.md:50 | fast-agent's pinned version in the registry's commits | external: `agentclientprotocol/registry`'s commit history | registry history to 2026-09-16 |
| 12/23 npm cells run install scripts (52.2 % [33.0–70.8]) | findings.md:73; README.md:351 | npm cells with `install.npm.installScripts` non-empty | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| 19 binaries: GitHub releases 14, vendor hosts 5 | findings.md:82-83 | host of `install.binary.archive` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| 10 of 19 declare a sha256, all 10 match; 9 declare none | findings.md:85 | `install.binary.sha256Declared`; `sha256Match` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| 44 started, 43 `initialize` | findings.md:88; README.md:351 | `firstRun.attempted`; `firstRun.client.initializeOk` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| telemetry: 10 hosts in 8 agents (9 in 7 without cline) | findings.md:92; README.md:362 | first-run host names matching `src/report.ts`'s telemetry pattern, plus `otel.cline.bot` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| cortex-code metrics: 15 s flush, not seen in the 10 s window | findings.md:94; README.md:524-526 | the cell's first run (10 s idle); the flush interval is read from the binary | `results/cells-acp.ndjson`; external: the cortex-code binary at the pinned version | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| qoder stats each top-level entry 2,300 to 2,800 times (`~/.aws` 2,746, `~/.ssh` 2,549, `~/.netrc` 2,396) | findings.md:110 | `probes` of the top-level prefixes of `firstRun.trace.home` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| opencode 1,924 writes | findings.md:117, 153 | `writes` of the `~/.config/opencode` prefix | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| 22 of 42 contact a host (52.4 % [37.7–66.6]): 8 telemetry, 8 download, install or fingerprint (cline and github-copilot in both), 7 only their own or their provider's host, minimax-code in none; 20 nothing; kimchi probes 11434, junie 11434 and 1234 | findings.md:125, 126, 127, 128, 129; README.md:353 | agents with a non-loopback host or a DNS name in any cell's `firstRun.trace.net`; classes by the DNS names each agent resolved, attributed as the text lists them (`agent.minimaxi.com` unclassed); `ports` of loopback hosts | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| ports 11434 (kimchi, junie) and 1234 (junie) | findings.md:129 | `ports` of loopback hosts | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| `~/.env` by 5 agents; three of the five quarantined | findings.md:130, 169 | `~/.env` prefix with `contentAccessed`; `fieldTruth.quarantined` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| `~/.npmrc` by kimchi, opencode, github-copilot and cline; `hostname` by dirac and cline | findings.md:139, 160 | `~/.npmrc` prefix of `firstRun.trace.home` with `contentAccessed`; `hostname` in `firstRun.trace.execBasenames` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| fast-agent 16 probes of `~/proj/.env` | findings.md:137 | `probes` of `~/proj/.env` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| claude-acp 8 tries, codex-acp 10 | findings.md:145-146; README.md:383 | `reads` (opens for reading) with `contentAccessed` false | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| codex-acp 3,617, minimax-code 568 writes | findings.md:152-153 | `writes` of `~/.codex/.tmp` and `~/.minimax/.builtin-skills` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| `git` by 11 agents; `ld` 12 times | findings.md:155, 157 | agents with `git` in `execBasenames`; mistral-vibe's `execBasenames.ld` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| `session/update` from 14 agents | findings.md:162 | agents whose `firstRun.client.serverRequests` has `notification:session/update` | `results/cells-acp.ndjson` | registry at `b8978f1`, matrix of 2026-09-16; cells of 2026-09-16/17 |
| CDN `registry.json` lists all eight quarantined agents | README.md:357 | the ids in the registry's CDN index | external: the registry's CDN `registry.json` | 2026-09-16 |
| 330 plugins, 240 publishers | findings.md:4, 180; README.md:40 | rows; distinct `publisherId` | `results/cursor-catalogue-2026-09-16.json.gz` | catalogue of 2026-09-16 |
| 324 pinned by SHA, 6 without a ref | findings.md:180-181; README.md:41 | `gitRef` of 40 hex digits; absent | `results/cursor-catalogue-2026-09-16.json.gz` | catalogue of 2026-09-16 |
| 271 declaring MCP servers | README.md:41 | catalogue entries with `mcpServers` | `results/cursor-catalogue-2026-09-16.json.gz` | catalogue of 2026-09-16 |
| 66 first-party; one of the 36 with hooks | findings.md:181, 206 | `publisher.name` = `cursor` | `results/cursor-catalogue-2026-09-16.json.gz`, `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| manifests: 306, 11, 11, one bare `.mcp.json`, one none (eight skills) | findings.md:182-185 | `plugin.manifestPath`, `plugin.how`, `plugin.inventory.skills` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 234 skills, 72 rules, 53 agents, 61 commands | findings.md:189 | `plugin.inventory.*` > 0 | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 122 scripts (37.0 % [31.9–42.3]), 72 executables (21.8 % [17.7–26.6]), one `node_modules`, no binary | findings.md:190-192 | `plugin.inventory.scripts`, `executables`, `nodeModulesShipped`, `binaries` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 230 remote (69.7 % [64.5–74.4]); 222 only remote, two thirds | findings.md:195-199; README.md:143 | plugins with a `plugin.mcpDeclared` entry of `kind` remote; all entries remote | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 296 declarations, 261 distinct; 35 remote and 4 stdio repeats, 29 and 2 of them `mcp.json` with `.mcp.json` | findings.md:196; README.md:411, 414, 529-533 | remote entries; distinct (plugin, `url`); basenames of the two `source` files of each repeated entry — remote: `.mcp.json`+`mcp.json` 29, `plugin.json`+`mcp.json` 3, two `mcp.json` 2, `.cursor-mcp.json`+`.mcp.json` 1; stdio, over (plugin, name, `command`, `args`): 2, two `mcp.json` 1, `plugin.json`+`.mcp.json` 1 | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 219 concrete hosts plus 15 plugins, 17 declarations, whose host is a user variable | findings.md:197; README.md:411-412, 527-528 | distinct hostname of `url`, port dropped; plugins and remote entries whose `url` host holds a `${…}` variable | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| `mcp.infobip.com` 12 servers in one plugin; `api.cursor.com` 5 plugins | findings.md:198 | entries and plugins by `url` host | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 49 stdio (14.8 % [11.4–19.1]); 67 declarations, 63 distinct; `npx` 32, `uvx` 19, `node` 4, twelve others | findings.md:200, 201; README.md:412 | stdio entries; distinct (plugin, name, `command`, `args`); `command` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 59 without a server (17.9 % [14.1–22.4]) | findings.md:204 | empty `plugin.mcpDeclared` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 36 with hooks (10.9 % [8.0–14.7]); 112 commands over 20 events | findings.md:204, 205; README.md:416 | `plugin.hooksDeclared` rows; distinct `event` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 45 handshakes (67.2 % [55.3–77.2]), 43 distinct, 931 tools | findings.md:212-213; README.md:413 | `plugin.mcpRuns` attempted with `client.initializeOk`; distinct (plugin, name, command); `client.tools` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 13 not on the host (12 naming 10 products, and devtools-for-agents's `npx`, which found no bin); 9 no answer | findings.md:214-217; README.md:534-536 | runs whose stderr says the executable is not found | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 31 from `registry.npmjs.org`, 14 from `pypi.org` | findings.md:223-224 | runs with that host in `trace.net.hosts` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| AWS proxy: five plugins, seven declarations | findings.md:225-226; README.md:438 | runs whose command has `mcp-proxy-for-aws` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| `~/.aws` read by seven plugins, eight servers in ten starts | findings.md:227-228; README.md:438-439 | runs with `~/.aws/credentials` and `~/.aws/config` read (`contentAccessed`): 10; distinct (plugin, server name): 8, the count `results/report.md` prints; plugins: 7 | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| telemetry in 3 of 67 starts | findings.md:240 | runs whose host or DNS names match a telemetry pattern, `mixpanel.com` left out | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 95 of 112 run; mem0 29 (9, 9, 11), cut at 12 | findings.md:243-244; README.md:416-417 | `plugin.hookRuns` rows; mem0's `hooksDeclared` by `source` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 85 exit 0, four Windows wrappers; the other ten by cause | findings.md:246-251 | `exitCode`, `signal`, `stderrTail`; monk's four `.cmd` runs executed nothing beyond `sh` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| 11 of 95 reached the network; 84 did not | findings.md:252, 280 | hook runs with `trace.net.hosts` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| killed at the 20 s limit: corridor once, monk twice | findings.md:249, 261; README.md:427-428 | hook runs ended by SIGKILL, `ms` about 20,000 | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| monk 65 MiB | findings.md:263; README.md:428-429 | curl's progress in `stderrTail` (65.1M) | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| astronomer-data installs 35 packages | findings.md:272 | `stderrTail` of the `stop` hook | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| `cat` 50, `bash` 36, `jq` 26, `python3` 22, `node` 21 | findings.md:281-282 | hook runs, of all 95, with that name in `trace.execBasenames` | `results/cells-cursor.ndjson` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| four plugins fetch a binary, three of them "latest"; two more install packages | findings.md:292-295 | hook runs with network in revyl, corridor, monk and jfrog; "latest" is read from their scripts | `results/cells-cursor.ndjson`; external: the hook scripts at the commits pinned in `results/cursor-catalogue-2026-09-16.json.gz` | catalogue of 2026-09-16; cells of 2026-09-16/17 |
| Cursor cells taken alone, 22:11 to 22:29 UTC | README.md:164 | no field marks the cells taken alone | none | 2026-09-16 |
| 171 plugins | findings.md:4, 300; README.md:42 | rows | `results/cells-devin.ndjson` | marketplace at `e314c2f` (2026-09-15 UTC); cells of 2026-09-16 |
| no hooks; 38 with skills; 4 with scripts, 2 executable; no binary | findings.md:303 | `plugin.hooksDeclared`, `plugin.inventory.*` | `results/cells-devin.ndjson` | marketplace at `e314c2f` (2026-09-15 UTC); cells of 2026-09-16 |
| 120 only remote (70.2 % [62.9–76.5]), 117 hosts, 5 URLs with a host variable | findings.md:304-305; README.md:43, 143, 449-450 | plugins whose entries are all remote; distinct `url` host; URLs with `${…}` | `results/cells-devin.ndjson` | marketplace at `e314c2f` (2026-09-15 UTC); cells of 2026-09-16 |
| 24 `docker` (14.0 % [9.6–20.0]) | findings.md:307; README.md:43 | plugins with a `docker` entry | `results/cells-devin.ndjson` | marketplace at `e314c2f` (2026-09-15 UTC); cells of 2026-09-16 |
| 27 local (15.8 % [11.1–22.0]): 15 `npx`, 11 `uvx`, 1 `pipx`; 51 a command | findings.md:308-309; README.md:43 | plugins with a stdio entry, by `command`; `mcpCommand` | `results/cells-devin.ndjson`, `results/population-devin-stats.json` | marketplace at `e314c2f` (2026-09-15 UTC); cells of 2026-09-16 |
| 18 of 27 handshakes (66.7 % [47.8–81.4]), 272 tools | findings.md:311 | `plugin.mcpRuns` with `client.initializeOk`; `client.toolsCount` | `results/cells-devin.ndjson` | marketplace at `e314c2f` (2026-09-15 UTC); cells of 2026-09-16 |
| mongodb unanswered after 120 s | findings.md:320 | the handshake window; the run's `ms` is 133,672 with the install | `results/cells-devin.ndjson` | marketplace at `e314c2f` (2026-09-15 UTC); cells of 2026-09-16 |
| 26 contact their index (`pypi.org` 11, `registry.npmjs.org` 15) | findings.md:322-323; README.md:448 | runs with that host in `trace.net.hosts` or `dnsNames` | `results/cells-devin.ndjson` | marketplace at `e314c2f` (2026-09-15 UTC); cells of 2026-09-16 |
| five of the nine failures are the run's | README.md:445-447 | a reading of the nine runs' `stderrTail` | `results/cells-devin.ndjson` | marketplace at `e314c2f` (2026-09-15 UTC); cells of 2026-09-16 |
| 73 extensions, 2,650,712 downloads | findings.md:5, 333-334; README.md:46 | rows; sum of `declared.downloadCount` | `results/cells-zed.ndjson` | extension API of 2026-09-16; cells of 2026-09-16/17 |
| 50 npm (68.5 % [57.1–78.0]), 11 GitHub releases and 1 HashiCorp, 9 unresolved, 2 not fetched | findings.md:337-342; README.md:457 | `zed.resolution.method`; `install.git.error` | `results/cells-zed.ndjson` | extension API of 2026-09-16; cells of 2026-09-16/17 |
| 9 unresolved as 3, 2, 2, 2; 5 of 73 repositories not the source | findings.md:339-340, 346; README.md:460 | the cells say only "command not recoverable from source"; the classes are a reading of the extensions' source | `results/cells-zed.ndjson`; external: each extension's source at the commit in `zed.commit` | extension API of 2026-09-16; cells of 2026-09-16/17 |
| ask-starknet-mcp 29,288 downloads | findings.md:343 | `declared.downloadCount` | `results/cells-zed.ndjson` | extension API of 2026-09-16; cells of 2026-09-16/17 |
| 50 from `registry.npmjs.org`, 49 installed; 10 of the 50 run install scripts (20.0 % [11.2–33.0]) | findings.md:350, 351 | install hosts; `install.ok`; npm cells with `install.npm.installScripts` non-empty (10 cells, all installed; 9 distinct packages: both `@azure/mcp` extensions install one) | `results/cells-zed.ndjson` | extension API of 2026-09-16; cells of 2026-09-16/17 |
| 12 release binaries, 10 with a linux-x86_64 asset | findings.md:356 | `zed.asset` among `github-release` cells | `results/cells-zed.ndjson` | extension API of 2026-09-16; cells of 2026-09-16/17 |
| 58 started, 28 handshakes (48.3 % [35.9–60.8]), 448 tools by 27 | findings.md:362-363 | `firstRun.attempted`; `client.initializeOk`; `client.toolsCount` where `toolsListOk` | `results/cells-zed.ndjson` | extension API of 2026-09-16; cells of 2026-09-16/17 |
| of the 30: 17, 2, 9, markitdown, planetscale | findings.md:363-371; README.md:455-456 | a reading of each failed cell's `stderrTail` | `results/cells-zed.ndjson` | extension API of 2026-09-16; cells of 2026-09-16/17 |
| egress in 8 of 58 | findings.md:371; README.md:464-465 | started cells with a non-loopback host or a DNS name | `results/cells-zed.ndjson` | extension API of 2026-09-16; cells of 2026-09-16/17 |
| `~/.npmrc` read by two servers | findings.md:380; README.md:465 | `~/.npmrc` with `contentAccessed` and `reads` | `results/cells-zed.ndjson` | extension API of 2026-09-16; cells of 2026-09-16/17 |
| maho-lsp: first commit of 2026-04-04 | README.md:463 | date of the first commit of `MahoCommerce/zed` | external: that repository's history | undated |
| 17,944 extensions | findings.md:394; README.md:24, 47 | `<loc>` entries; `frameExtensions` | `results/openvsx-sitemap-2026-09-18.xml.gz`, `results/population-openvsx-stats.json` | sitemap and records of 2026-09-18 |
| search API 17,941 | README.md:48 | the count Open VSX's search API reported | external: Open VSX's search API | 2026-09-18 |
| 600 sampled; 8 `linux-x64`, 592 universal; 600 with a record and a download | findings.md:397; README.md:5, 52, 53 | rows; `targetPlatform`; `declared.version`, `install.vsix` | `results/population-openvsx.ndjson`, `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18 |
| three baseline cells | README.md:55 | `declared.baseline` | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 13,365,196 downloads, median 1,690; 377 verified | findings.md:396 | sum and median of `declared.downloadCount`; `declared.verified` | `results/population-openvsx.ndjson` | sitemap and records of 2026-09-18 |
| 599 fetched, all installed | findings.md:397 | `install.vsix.sha256Actual`; `install.ok` | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| neither 78 of 599 (13.0 % [10.6–16.0]); `main` 496 (82.8 % [79.6–85.6]); both 23; `browser` 2 | findings.md:400, 402 | `install.manifest.main`, `browser` | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 521 with an entry point, 517 visible, 472 activated (91.3 % [88.6–93.4]) | findings.md:403, 404; README.md:172 | `firstRun.attempted`; `driver.found`; `driver.activated` | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 45 failures: 20 timeouts, 15 threw, 8 module, 2 dependency | findings.md:404-406 | `driver.error` matched against "timeout after", "Cannot find module", "depends on" | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| activation median 968.5 ms, p90 2,726 ms | findings.md:407 | `driver.activateMs` of the 472: mean of the two middle values (968, 969); p90 the value at index ⌊0.9 n⌋ | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 225 of 599 at every start (37.6 % [33.8–41.5]); 51.8 % by downloads | findings.md:409, 410 | `activationEvents` with `*` or `onStartupFinished`; their share of `downloadCount` | `results/cells-openvsx.ndjson.gz`, `results/population-openvsx.ndjson` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 77 without events; of the rest 116 language, 47 workspace file, 16 both; 61 command, view or URI (10.2 % [8.0–12.9]) | findings.md:411, 413, 414 | entry point and no `activationEvents`; any `onLanguage`, any `workspaceContains`, neither with `*` or `onStartupFinished` (125 and 56 with them); every event `onCommand`, `onView`, `onUri` or `onWebviewPanel` | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 42 of 599 leave more than one extension (7.0 % [5.2–9.3]) | findings.md:418 | `install.extensionsInstalled` longer than one; install hosts | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 591 of 591 universal downloads match; 8 platform-specific | findings.md:420; README.md:170, 471 | `install.vsix.sha256Match` where `targetPlatform` is not `linux-x64` | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 31 of 472 (6.6 % [4.7–9.2]); 5 more; 36 of 517 | findings.md:423-425; README.md:176 | `extHost.net.hosts` not loopback and not in the baseline cells' hosts, over activated and over failed cells | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| eight loopback only | findings.md:425 | activated cells with a loopback host in `extHost.net.hosts` (14) and no host beyond the baseline cells' (8; the other 6 are among the 31) | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| one cell with telemetry hosts, `ZencoderAI.zencoder` (Amplitude, RudderStack) | findings.md:426 | `extHost` host names matching `src/report.ts`'s telemetry pattern (1 cell), whose Visual Studio term, `dc\.services\.visualstudio\.com`, leaves out `marketplace.visualstudio.com`, the VS Marketplace | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 17 read a credential or configuration (3.6 % [2.3–5.7]): 5, 3, one each; profiles 4, 3, 1 | findings.md:427-431 | `extHost.home` prefixes on `src/report.ts`'s credential list with `contentAccessed` and `reads` | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 55 system programs (11.7 % [9.1–14.9]), `sh` 39, `git` 19; 37 their own (7.8 % [5.7–10.6]) | findings.md:431, 432 | `extHost.execs[].origin` system and extension | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 16 workspace writes (3.4 % [2.1–5.4]); 7 read `.env` | findings.md:433 | `~/proj` prefixes with `writes` or `mutations`; `~/proj/.env` read | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 121 cells; 77 at every start, 55 active, 22 not, 8 failed when forced, 14 | findings.md:436-440; README.md:58 | rows; `driver.isActiveAtEnd`; the forced cell's `driver.activated` | `results/check-natural-openvsx.ndjson.gz`, `results/cells-openvsx.ndjson.gz` | cells of 2026-09-18 and the run of 2026-09-22 |
| 43 others with a record: 38 name a language, a file or a command, 5 declare none; 11 of the 38 activated | findings.md:442, 443 | cells of the run not declaring `*` or `onStartupFinished` with a driver record; empty `driver.declared.activationEvents`; `isActiveAtEnd` | `results/check-natural-openvsx.ndjson.gz`, `results/cells-openvsx.ndjson.gz` | cells of 2026-09-18 and the run of 2026-09-22 |
| same host again in 11 of 15 | findings.md:446 | cells that contacted a host when forced (activated or not) and were active at the end: a forced host among the run's `extHost` hosts | `results/check-natural-openvsx.ndjson.gz`, `results/cells-openvsx.ndjson.gz` | cells of 2026-09-18 and the run of 2026-09-22 |
| 53 wrote outside their own storage | findings.md:450; README.md:59 | rows | `results/check-writers-openvsx.ndjson.gz` | run of 2026-09-22 |
| 3,002 and 5,758 downloads | findings.md:466, 470 | `declared.downloadCount` | `results/population-openvsx.ndjson` | sitemap and records of 2026-09-18 |
| ten assistants; 85 engines | findings.md:487, 509 | the readme in quickdb 1.2.13's VSIX | external: that VSIX, whose URL and sha256 are in `results/population-openvsx.ndjson` | sitemap and records of 2026-09-18 |
| quickdb: an open for writing against each of three files, no rename | findings.md:502 | `writes` and `mutations` of those prefixes | `results/check-writers-openvsx.ndjson.gz` | run of 2026-09-22 |
| typedown 0.34.1, gone four days later, 0.38.0 and 0.38.1 listed | findings.md:557; README.md:191 | `subjectVersion`; the registry's later listing | `results/cells-openvsx.ndjson.gz`; external: Open VSX's listing | 2026-09-18; 2026-09-22 |
| power lost after 107 cells; driver fields absent before 04:20:19Z | README.md:112, 114 | cells (with the baseline) started before the largest `startedAt` gap; driver records without `forced`: 99, the last started at 04:19:32.671Z, the first with it at 04:20:19.693Z | `results/cells-openvsx.ndjson.gz` | sitemap and records of 2026-09-18; cells of 2026-09-18 |
| 29 MB against about a megabyte | README.md:56 | bytes of the decompressed file (29,214,807); the other four cells files | `results/cells-openvsx.ndjson.gz`, `results/cells-acp.ndjson`, `results/cells-cursor.ndjson`, `results/cells-devin.ndjson`, `results/cells-zed.ndjson` | files as published |
| four e-mail addresses redacted: two, one, one | README.md:494-497 | occurrences of `[redacted]` | `results/cells-cursor.ndjson`, `results/cells-devin.ndjson`, `results/population-openvsx.ndjson` | files as published |
| the figures a correction replaced | README.md:347-350, 357, 375, 399-400, 411, 416, 426, 432, 438-439, 471, 474, 485, 499-570 | figures as the text stated them before the correction; where `results/report.md` prints the same number (`onLanguage` 125, `workspaceContains` 56, any loopback host 14, hooks run 95, `~/.aws/credentials` 8), it counts the set the correction names, not the one the text gave | `results/report.md` for those five; none for the others | before the correction |

## Corrections

Figures and wordings corrected in findings.md, each with the reason the data required it.

### ACP

- Agreement is 33/34 with cline and junie in the file: 34 agents comparable with the matrix, 33
  agree, cortex-code the one disagreement.
- sigit's binary was said to match the matrix. The matrix probes sigit by `npx`, so its binary
  is not compared; goose's is the binary compared like for like.
- cortex-code's disagreement was called an environment difference. It is an archive and
  extractor interaction: `tarfile.extractall(filter="data")` refuses the archive's absolute
  symlink, GNU tar does not.
- cline's first-run `ETARGET` was called a transient registry inconsistency at the pinned
  version, gone an hour later. It was a publish-ordering race inside one monorepo release,
  reached through floating transitive ranges: `@ai-sdk/anthropic@4.0.56` was published at
  21:39:10Z, the install started at 21:38:51Z, and the version was served twenty seconds later.
- With cline and junie in the file the totals are 44 cells, 44 started, 43 `initialize`; 12/23
  npm cells run install scripts, cline's `postinstall.mjs` and protobufjs's being the two those
  cells add; 22/42 agents contact a non-loopback host before a prompt. cline contacts
  `otel.cline.bot`, an OpenTelemetry collector counted as telemetry, and `registry.npmjs.org`,
  counted under installs at start; junie contacts `junie.jetbrains.com` and
  `resources.jetbrains.com` and probes the LM Studio (1234) and Ollama (11434) ports.
- The CDN `registry.json` of 2026-09-16 was said to list seven of the quarantined agents; it
  lists all eight. Quarantine skips the probe and freezes the pin, it does not delist.
- crow-cli's, qoder's and mistral-vibe's quarantine reasons were "not reproduced". They are
  untestable at the pin: each names a version other than the pinned one. Five reasons are
  about the pinned version and three about a refused update.
- Telemetry is 9 hosts in 7 agents without cline, whose `otel.cline.bot` makes it 10 in 8.
  `47.116.170.246` (minimax-code) is not among them, and it is not "a bare address with no DNS
  name": it is `agent.minimaxi.com`, MiniMax's cn-region host, serving API, login and
  observability endpoints alike.
- `sg-pum.alibabachengdun.com` (qoder) was called a download. It is a device-fingerprint
  report: the string sits in the embedded ELF next to the `repPc.json` endpoints and
  `dmidecode`, and the report obtains a `machineToken`.
- The "own API" bullet listed `api.workos.com` (factory-droid), `openrouter.ai` (dirac) and
  `models.dev` (kilo) as the agents' own APIs. The first is Factory's identity provider, the
  other two are third-party services. `unleash.codeium.com` (devin) is feature flags, not
  telemetry, and is listed as such.
- `github.com` in codex-acp is a download (`git fetch` of `openai/plugins`), listed under
  *Downloads*; it also accounts for the `~/.netrc` reads through libcurl.
- The count "13 contact only their own API or nothing" was arithmetic on the wrong sets; the
  classes and their members are listed instead.
- "A read is a read of the file's content" became "a read is a successful open for reading":
  `trace.ts` counts opens, and `read()` is not in the strace filter.
- The five agents that open `~/.env` reach it by walking up from the workspace, which is a
  child of `$HOME` in the decoy layout; "in the home directory, not the project's" described
  the layout, not an agent choice.
- "Reads … 8 times" became "tries to open … 8 times; nothing is read" for claude-acp's
  `~/.claude/.credentials.json` (8) and codex-acp's `~/.codex/auth.json` (10): both are failed
  opens (`enoent`, `contentAccessed: false`), and the files do not exist in the decoy home.
- Only grok-build probes `~/.claude/plugins` (ENOENT); devin and kimchi do not, and kimchi does
  not read `~/.claude/settings.json`.
- minimax-code's `~/.bashrc` append is `Rka` in `chunks/chunk-CSEMCTUO.js`, not
  `chunk-V265NCK2.js`. minimax-code does not spawn a login shell (codebuddy-code and dimcode
  do), and dimcode reads `~/.profile`, not `~/.bashrc`.
- mistral-vibe was said to compile something on first start; it compiles nothing. `gcc`, `ld`
  and `ldconfig` are `ctypes.util.find_library` probes for macOS frameworks, requested by the
  bundled `keyring` backend.
- "Writes outside their own directory" lists minimax-code, qoder and, through `gh`,
  github-copilot-cli. codex-acp, opencode and claude-acp were listed and are not: those paths
  are their own directories.
- "Every agent above … passed the registry's check" does not hold: mistral-vibe, crow-cli,
  qoder and vtcode are quarantined and not probed at all. The check covers the 34 and skips
  the 8.
- cortex-code's Datadog metrics client was said to fall outside the 10 s window. It is "not
  seen at 10 s nor at 60 s".
- A baseboard serial read "through `dmidecode`" was stated and not seen. The qoder binary's
  strings name `dmidecode`, and `dmidecode` does not appear among the executed programs in the
  cell. Run alone under strace on 2026-09-17, with its endpoints pointed at a local listener,
  the binary opened
  `/sys/class/dmi/id/{bios_vendor,bios_version,bios_date,board_vendor,product_name,sys_vendor}`,
  tried `/sys/class/net/wlan0/address` and `/dev/sda`, and posted to `/repPc.json` as plain
  HTTP/1.0 on port 443 with an encrypted body.

### Cursor

- It was "296 servers on 232 hosts"; it is 296 declarations, 261 distinct, on 219 concrete
  hosts plus 15 user-variable hosts. It was "67 servers"; it is 67 declarations, 63 distinct.
  The 45 handshakes are 43 distinct servers, two AWS plugins having run their proxy twice.
  Declarations are counted per manifest file: 35 remote and 4 stdio entries are the same
  server read from `mcp.json` and `.mcp.json`. The plugin-level rates are unaffected.
- Hooks: it was 95 declared; it is 112 declared, 95 run. mem0 declares 29 across three
  editors' files, not 15. The instrument collects every hooks file and ignores `matcher`
  fields. revyl's `beforeShellExecution` is matched to commands containing `revyl`, prisma's
  to `^git commit`, jfrog's `preToolUse` to `Read`, vercel's `SessionStart` to
  `startup|resume|clear|compact`, so revyl's hook does not run "before every shell command";
  jfrog's `beforeSubmitPrompt` has no matcher and the phrase holds for it.
- What the four downloading hooks fetch, from their scripts: revyl pins by tag and sha256 and
  caches; corridor pipes `install.sh` from `app.corridor.dev` into `sh`, version from a URL,
  and also edits the shell profile's PATH; monk fetches `-latest` and re-checks it every
  session start (the artefact behind the URL changed within hours of the run); jfrog runs `npx
  --yes @jfrog/agent-guard` (unpinned, a 35 MB static ELF), not "the JFrog CLI", and its
  `agents-conf.json` is written by the `sessionStart` hook. monk's "killed at 20 s" runs had
  finished their script; the detached `monk-agent serve` kept the traced tree alive. "65 MB" is
  65 MiB.
- mem0's hooks grep the shell profiles for `MEM0_API_KEY=`; they do not source them. prisma's
  `afterFileEdit` failed inside `npx` (`prisma@8.0.0-rc.15`, npm's `edgesOut` error), not on
  the dummy project. paper never started (it is among the 12 "not on host"); the tenth silent
  start was devtools-for-agents, whose repository is the unbuilt `chrome-devtools-mcp` package
  that `npx` resolved locally. supermemory's manifest works; the failed entry was the
  developer's `.cursor/mcp.json`, which the instrument should not have collected as the
  plugin's. `mixpanel.com` is an OAuth page, not telemetry; `@azure/mcp`'s Application Insights
  ingestion was missed by the host join (IPv4-mapped connects) and is in `dnsNames`.
- The AWS proxy is five plugins (seven entries). `~/.aws/credentials` is read by seven plugins,
  eight server starts, opensearch-agent-skills declaring two AWS servers; it was "eight
  plugins", and it is not seven servers. The rate sentence says seven. Two different snyk
  plugins were conflated; opensearch's AWS server also reads `~/.netrc`.

### Devin

- aws-agent-toolkit's failure is the instrument's: the plugin's `${VAR:-}` empty default was
  replaced by a dummy profile name (the runner honours `:-` defaults). dbt, metabase and
  unleash reject dummy values, so five of the nine failures are the run's, not the plugins'.
- 26 of 27 contacted their index; google-analytics's source is a git URL. netlify's "two bare
  Cloudflare addresses" are `registry.npmjs.org` unjoined. The interval for 120/171 is
  [62.9–76.5]. `awslabs.lambda-mcp-server` is uninstallable as declared because every release
  is yanked, not "at all". aws-dynamodb writes a log under `~/.aws`.

### Zed

- The source heuristic mis-resolved 9 extensions: wrong package for gem, wrong entry for polar,
  missing `--mcp` for repomix, missing `server start` for azmcp, literal relay URLs it did not
  carry. terraform downloads from `releases.hashicorp.com`, where the linux archive exists;
  axiom's binary was plainly named. "Could not be identified" became "the harness did not
  identify".
- 5 of 73 declared repositories are not the extension's source. maho-lsp's declared repository
  (`mahocommerce/maho-zed`) was said to have moved; it never existed under that name. GitHub
  redirects renamed repositories and returns no redirect for this one, and the extension's
  first commit in `MahoCommerce/zed` (2026-04-04) already declared the other name.
- The two `@azure/mcp` cells send to Application Insights and probe the instance-metadata
  address, so egress is 8 of 58. `~/.npmrc` is read by two servers. mysql answered
  `initialize` but not `tools/list`. zeroheight launches an OAuth flow through `xdg-open` at
  first start.

### Open VSX

- The VSIX digest comparison was "591 matching, 8 mismatching"; it is 591/591 over the
  universal downloads. The eight were platform-specific downloads compared against the default
  download's digest.
- Extensions that write inside another tool's home directory were ten; they are twelve. Ten is
  the count from the path prefixes the trace records. It missed three directories the prefix
  list did not name (`~/.copilot`, `~/.cline`, `~/.trae-cn`) and counted two that were entered
  but left no file (`claudine.claudine` in `~/.claude/ide`,
  `gauravmehta13.ag-multi-account-switchboard`'s lock directory under
  `~/.gemini/antigravity-ide`), which are stated separately. Twelve is counted from the files
  present in each kept decoy home. Eleven of the twelve write at every editor start;
  `quickdb.quickdb` declares no `activationEvents` and is activated implicitly.
- `Varterm.varterm-cursor`, `ZencoderAI.zencoder` and `swarmify.swarm-ext` write under another
  tool's directory and say so in their own readme or changelog; they are counted in the ten and
  are not undisclosed behaviour.
- It was "Nothing in its description mentions registering itself with four assistants",
  written from `quickdb.quickdb`'s one-line description. The readme documents the behaviour,
  and the extension does not register itself with assistants that have not already registered
  it: the routine rewrites a stale path in an entry that is already there. The commit message
  of 482d31e carries the same error.
- The one connection to `cdn.jsdelivr.net` and the npm execs recorded for
  `zardoy.inline-debugger`, and the `www.schemastore.org` fetches recorded for
  `redhat.vscode-extension-dashbuilder-editor`, are a dependency extension's, not the sampled
  extension's.
- Four third-party personal e-mail addresses were redacted from the published cells after the
  run: two in `cells-cursor.ndjson`, one in `cells-devin.ndjson` (all three an address npm
  itself prints in a deprecation warning) and one in `population-openvsx.ndjson`, the `bugs`
  field of a declared manifest. Each is replaced by `[redacted]`. No figure reads these fields.

### 2026-09-25

- ACP: it was "`session/update` notifications from 13 agents"; it is 14. The field lists 14
  agents with `notification:session/update`, junie among them.
- It was "8 with telemetry, 8 with a download, install or fingerprint, 8 only their own or
  their provider's host, two in more than one class"; it is 8, 8 (cline and github-copilot in
  both), 7 with only their own or their provider's host, and minimax-code in none of the three.
  factory-droid, counted among the eight "only", also sends telemetry. junie was placed among
  the 20 that contact nothing beyond localhost; it is among the 22.
- It was "`~/.npmrc` by kimchi, opencode and github-copilot" and "`hostname` by dirac"; cline,
  whose first start runs `npm`, also reads `~/.npmrc` and runs `hostname`.
- It was "3,729 writes under `~/.local/share/uv`"; the 3,729 are every write under the
  two-level prefix `~/.local/share`.
- agoragentic-acp's `authMethods: [{type: "terminal", …}]` was withdrawn: no file in the
  repository produces it; the cell records only each method's `id` and `name`, both absent, so
  the method's type is not measured.
- The times of cline's failed first install (21:38:51 UTC against `@ai-sdk/anthropic@4.0.56`
  published at 21:39:10 UTC, "nineteen" and "twenty seconds") and the "104 s" of a later
  install were withdrawn: no file in the repository produces them; the failed install, when it
  ran against that release, and the later install's duration are not in the published data.
- The sizes of cline's platform binary (151 MB), qoder's bundle (38 MB), the `@github/copilot`
  CLI (~300 MB), jfrog's platform dependency (35 MB) and oh-my-commit's provider (5 MB), and the
  description of jfrog's dependency as "a static ELF", were withdrawn: no file in the repository
  produces them. Those sizes, and the file type of what jfrog's hook runs, are not measured; the
  cell records that it runs `agent-guard`.
- cortex-code's metrics client "not seen … at 60 s" was withdrawn: no file in the repository
  produces it; nothing after the 10 s window is in the published data. The 15 s flush is read
  from the binary.
- Cursor: it was "15 user-variable hosts"; it is 17 declarations, in 15 plugins, whose host is
  a user variable. The count was of plugins.
- It was "35 are the same server read from two manifest files, `mcp.json` and `.mcp.json`",
  and the same of the 4 stdio repeats; 29 of the 35 remote and 2 of the 4 stdio repeats are that
  pair. The other remote ones pair `plugin.json` with `mcp.json` (3), two `mcp.json` files (2)
  and `.cursor-mcp.json` with `.mcp.json` (1); the other stdio ones, two `mcp.json` files and
  `plugin.json` with `.mcp.json`.
- Cursor: it was "12 could not start … 10 started and did not answer", with devtools-for-agents
  counted among the silent starts. Its `npx` found no bin, so it is 13 whose command is not on
  the host and 9 that started and did not answer.
- Cursor: it was "eight server starts" reading `~/.aws`; it is eight servers in ten starts,
  aws-data-analytics and aws-core having started their proxy once from `mcp.json` and once from
  `.mcp.json`.
- Cursor: `cat` 50, `bash` 36, `jq` 26, `python3` 22 and `node` 21 were given for the 84 hook
  runs without network; they count all 95.
- Devin: aws-agent-toolkit's failure was put down to the runner honouring `:-` defaults. The
  runner keeps only the names of a plugin's `env` entries and gives each a dummy, so the
  plugin's `${VAR:-}` empty default became a dummy profile name; `:-` defaults are honoured in a
  command and its arguments, not in a plugin's `env`.
- Zed: it was "9 of the 49 run install scripts"; it is 10 of the 50 npm cells, all 10 among the
  49 installed. The 10 are extensions and the 9 were distinct packages: the two `@azure/mcp`
  extensions install the same one.
- Open VSX: it was "a median of 968 ms"; it is 968.5 ms, the mean of the two middle values of
  the 472.
- It was "14 more spoke only to a loopback port of their own"; 14 is every activated cell with
  a loopback host, 6 of them among the 31 that contacted a host beyond the baseline's. It is
  eight that connected to loopback ports and nothing else; which process owned the port is not
  recorded.
- It was "Three contacted a host whose business is telemetry"; three cells matched the
  telemetry pattern `src/report.ts` then had, two of them only through
  `marketplace.visualstudio.com`, the VS Marketplace, which its `visualstudio\.com` term
  matched. The term is now `dc\.services\.visualstudio\.com`, and the pattern matches one cell,
  `ZencoderAI.zencoder` (Amplitude and RudderStack).
- It was "125 wait on a language, 56 on a file in the workspace"; 9 of each also declare `*` or
  `onStartupFinished` and run at every start. It is 116 and 47, 16 of them on both.
- It was "Of the 43 whose events name a language, a file or a command, 11 activated"; 5 of the
  43 declare no `activationEvents`. It is 38 of the 43 that name one, and 11 of the 38.
- `quickdb.quickdb`'s "12,620 downloads" was withdrawn: no file in the repository produces it;
  no download count is stated for it.
- "Twelve" extensions that left files inside another tool's home directory, "eleven of the
  twelve" at every editor start, their "203,667 downloads", the "two more" that left no file,
  Zencoder's "39 files" and flow-to-skill's "30 files" were withdrawn: no file in the repository
  produces them; the kept decoy homes are not published, so how many extensions left files in
  another tool's directory, and what they left, is not measured in the published data.
