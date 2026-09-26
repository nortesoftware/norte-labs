# MCP: install and first start — results

Cells: 600 (npm 420, PyPI 180). Generated 2026-09-26T04:07Z. Rates with 95 % Wilson intervals.

## Install

- npm: install completed 404/420 = 96.2 % [93.9 %–97.6 %]; median 7 s.
  - failures: version missing from the package registry 6 · package does not exist (404) 3 · the package supports another platform 3 · a dependency is missing from the package registry 1 · install script failed 1 · other 1 · timeout 1
- PyPI: install completed 175/180 = 97.2 % [93.7 %–98.8 %]; median 2 s.
  - failures: build failure (sdist) 2 · a dependency is missing from the package registry 1 · Python version 1 · version missing from the package registry 1

### npm (404 completed installs)

- tree with some `preinstall`/`install`/`postinstall`: 51/404 = 12.6 % [9.7 %–16.2 %]
- the package itself declares one: 15/404 = 3.7 % [2.3 %–6.0 %]
- native `.node` binaries present after install: 30/404 = 7.4 % [5.3 %–10.4 %]
- compiler or node-gyp/prebuild-install executed during install: 21/404 = 5.2 % [3.4 %–7.8 %]
- packages per tree: median 95, max 554

Packages with an install script, by number of trees they appear in:

- better-sqlite3 (install): 15
- protobufjs (postinstall): 11
- sharp (install): 5
- cpu-features (install): 4
- ssh2 (install): 4
- tree-sitter-python (install): 4
- bufferutil (install): 4
- utf-8-validate (install): 4
- tree-sitter-javascript (install): 3
- tree-sitter-typescript (install): 3
- onnxruntime-node (postinstall): 3
- tree-sitter-go (install): 2
- tree-sitter-rust (install): 2
- keytar (install): 2
- core-js-pure (postinstall): 2
- esbuild (postinstall): 2
- @google/genai (preinstall): 2
- argon2 (install): 1
- @cheppulabs/sonde (postinstall): 1
- @samoradc/tetrad (postinstall): 1

Servers that declare their own install script:

- `@cheppulabs/sonde@0.4.4`: postinstall: `node scripts/fetch-grammars.mjs`
- `@samoradc/tetrad@0.1.12`: postinstall: `node scripts/install.js`
- `engramx@4.5.0`: postinstall: `node scripts/postinstall.mjs`
- `@dinglebear/cortex@3.13.2`: postinstall: `node scripts/install.js`
- `@tickory/mcp@0.3.0`: postinstall: `node ./scripts/postinstall.js`
- `warp-agent-mcp@0.19.6`: postinstall: `node scripts/postinstall.mjs`
- `@ooples/token-optimizer-mcp@5.1.1`: postinstall: `node scripts/postinstall.cjs`
- `@standardbeagle/mcp-debug@1.1.6`: postinstall: `node install.js`
- `@munhq/cloud-tools@0.2.0`: postinstall: `node bin/postinstall.js`
- `@hpp-io/x402-mcp-bridge@0.1.18`: postinstall: `patch-package || true`
- `@zenfun510/codex-mcp-go@0.2.1`: postinstall: `node install.js`
- `@algiras/debugium@0.1.2`: postinstall: `node npm/install.js`
- `grok-faf-mcp@1.10.0`: postinstall: `node scripts/postinstall.js`
- `delimit-cli@3.10.4`: postinstall: `echo '\nRun: npx delimit-cli setup\n'`
- `claude-code-conversation-search-mcp@1.1.3`: postinstall: `echo 'Thanks for installing claude-code-conversation-search-mcp! See examples/ for usage.'`

### PyPI (175 completed installs)

- some distribution built from sdist (build code executed): 0/175 = 0.0 % [0.0 %–2.1 %]
- compiler executed during install: 0/175 = 0.0 % [0.0 %–2.1 %]
- compiled extensions (`.so`) in the venv: 159/175 = 90.9 % [85.7 %–94.3 %]
- distributions per venv: median 35, max 237

### Network during install

- cells with at least one outbound connection (DNS excluded) at install: 600/600 = 100.0 % [99.4 %–100.0 %]

| category | cells | rate |
|---|---|---|
| package-registry | 600 | 600/600 = 100.0 % [99.4 %–100.0 %] |
| code-host | 16 | 16/600 = 2.7 % [1.6 %–4.3 %] |
| other | 9 | 9/600 = 1.5 % [0.8 %–2.8 %] |

Hosts outside the package registries (cells, category, ports, program):

- github.com — 16 · code-host · 443 · prebuild-install,node
- release-assets.githubusercontent.com — 16 · code-host · 443 · prebuild-install,node
- nodejs.org — 5 · other · 443 · node,node-gyp
- api.nuget.org — 3 · other · 443 · node
- opencollective.com — 1 · other · 443 · opencollective

Package registries: registry.npmjs.org 420 · pypi.org 180

### `$HOME` during install

- cells that open content under `$HOME` outside the project, the toolchain and the package-manager cache: 421/600 = 70.2 % [66.4 %–73.7 %]
- cells that read or write a decoy file (credentials, agent configs, shell): 421/600 = 70.2 % [66.4 %–73.7 %]
  - note: the package manager reads `~/.npmrc` and `~/.gitconfig` by itself (norte-guard baseline); at install that read cannot be attributed to the package.

| prefix | content opened (cells) | written (cells) | probed (cells) | examples |
|---|---|---|---|---|
| `~/.npm/_logs` | 420 | 420 | 420 | `~/.npm/_logs/2026-09-11T19_35_51_406Z-debug-0.log` `~/.npm/_logs/2026-09-11T19_36_40_651Z-debug-0.log` `~/.npm/_logs/2026-09-11T19_37_07_300Z-debug-0.log` |
| `~/.npm/_cacache` | 417 | 417 | 420 | `~/.npm/_cacache/index-v5/1c/67/ca361e3a3245f0ac50912245ef1e31fd39c3249812d20778650f0e73a21a` `~/.npm/_cacache/tmp/9605ad76` `~/.npm/_cacache/content-v2/sha512/75/44/dc224a184d0478126ccbf3a2139328f37b31aecbd0868648c58b6f89eb0c5d068ae15f98822632e32728efe40f51efa3882ad7aba1956d64539d1821afe2` |
| `~/.npmrc` | 420 | 0 | 420 | `~/.npmrc` |
| `~/.npm` | 0 | 420 | 420 |  |
| `~/.gitconfig` | 420 | 0 | 420 | `~/.gitconfig` |
| `~/.cache/uv` | 180 | 180 | 180 | `~/.cache/uv/sdists-v9/.git` `~/.cache/uv/.lock` `~/.cache/uv/interpreter-v4/8f827a7903df6ff4/91a207cc42b8022e.msgpack` |
| `~/.npm/_prebuilds` | 17 | 8 | 17 | `~/.npm/_prebuilds/5f9657-better-sqlite3-v11.10.0-node-v127-linux-x64.tar.gz.18-c70d4221fc856.tmp` `~/.npm/_prebuilds/5f9657-better-sqlite3-v11.10.0-node-v127-linux-x64.tar.gz` `~/.npm/_prebuilds/f74951-better-sqlite3-v12.11.1-node-v127-linux-x64.tar.gz.18-3d19fad3d8c9e.tmp` |
| `~/.cache/node-gyp` | 5 | 5 | 5 | `~/.cache/node-gyp/22.23.2/include/node/common.gypi` `~/.cache/node-gyp/22.23.2/include/node/config.gypi` `~/.cache/node-gyp/22.23.2/include/node/cppgc/allocation.h` |
| `~/.npm/_update-notifier-last-checked` | 2 | 2 | 420 | `~/.npm/_update-notifier-last-checked` |
| `~/.local/share` | 1 | 1 | 180 | `~/.local/share/uv/credentials/.tmp0itTh4` |
| `~/.npm/_libvips` | 1 | 1 | 1 | `~/.npm/_libvips/libvips-8.14.5-linux-x64.tar.br` |
| `~/.config/Claude` | 1 | 1 | 1 | `~/.config/Claude/claude_desktop_config.json` |
| `~/.cache/cloud-tools` | 1 | 1 | 1 | `~/.cache/cloud-tools/bin/cloud-tools-0.2.0.tmp-18` |
| `~/.netrc` | 1 | 0 | 1 | `~/.netrc` |

Probed only (stat/ENOENT, no content), ≥3 cells: `~/package.json` 420 · `~/.cache` 185 · `~/pyproject.toml` 180 · `~/uv.toml` 180 · `~/.config/uv` 180 · `~/node_modules/.bin` 52 · `~/.config/prebuild-install` 17 · `~/.prebuild-install/config` 17 · `~/.prebuild-installrc` 17 · `~/.pydistutils.cfg` 6 · `~/.gyp` 5

Decoys with content opened, by cells:

- `~/.npmrc`: 420
- `~/.gitconfig`: 420
- `~/.netrc`: 1 (saturnzap@1.3.2)
- `~/.config/Claude`: 1 (warp-agent-mcp@0.19.6)

## First start

- attempted: 579/600 = 96.5 % [94.7 %–97.7 %] (not attempted: install failed 21)
- `initialize` handshake ok: 347/579 = 59.9 % [55.9 %–63.8 %] of attempted; `tools/list`: 344/579 = 59.4 % [55.4 %–63.3 %]
  - npm: handshake 282/404 = 69.8 % [65.2 %–74.1 %]
  - PyPI: handshake 65/175 = 37.1 % [30.3 %–44.5 %]
- no handshake (231): broken by the FastMCP rename in mcp 2.0 (dependency unpinned) 52 · exception at start 42 · requires a variable/credential 28 · prints usage 21 · exited without speaking MCP 21 · exited with code 1 21 · module not found 15 · the binary could not be executed 13 · no response (alive, no JSON-RPC) 7 · the binary was not found 4 · exited with code 127 2 · fails to connect to a service 2 · exited with code 2 2 · exited with code 3 1

### Declared tools (344 servers with `tools/list`)

- tools per server: median 8, max 803; total 6485
- servers with at least one annotated tool: 117/344 = 34.0 % [29.2 %–39.2 %]; with all annotated: 106/344 = 30.8 % [26.2 %–35.9 %]
- tools with some annotation: 2849/6485 = 43.9 % [42.7 %–45.1 %]; `readOnlyHint: true` 2120; `destructiveHint: true` 203; `destructiveHint: false` 1013

### Network at first start

- cells with at least one outbound connection (DNS excluded) at first start: 47/579 = 8.1 % [6.2 %–10.6 %]

| category | cells | rate |
|---|---|---|
| package-registry | 24 | 24/579 = 4.1 % [2.8 %–6.1 %] |
| code-host | 2 | 2/579 = 0.3 % [0.1 %–1.3 %] |
| vendor-own | 6 | 6/579 = 1.0 % [0.5 %–2.2 %] |
| ai-api | 1 | 1/579 = 0.2 % [0.0 %–1.0 %] |
| telemetry | 4 | 4/579 = 0.7 % [0.3 %–1.8 %] |
| local | 5 | 5/579 = 0.9 % [0.4 %–2.0 %] |
| other | 11 | 11/579 = 1.9 % [1.1 %–3.4 %] |
| ip-unresolved | 2 | 2/579 = 0.3 % [0.1 %–1.3 %] |

Hosts outside the package registries (cells, category, ports, program):

- 127.0.0.1 — 5 · local · 5432,8080,7331,12345,8973 · node,b280-olca-mcp,debugium
- 0:0:0:0:0:0:0:1 — 2 · ip-unresolved · 5432,8080 · node,b280-olca-mcp
- raw.githubusercontent.com — 2 · code-host · 443 · email-guard-mcp,llm-advisor-mcp
- services.onehome.com — 1 · other · 443 · onehome-mcp
- api.aetherwealth.ai — 1 · vendor-own · 443 · aether-wealth-mcp
- quantrisk-mcp.quantrisk.workers.dev — 1 · other · 443 · quantrisk-mcp
- inspector.gridinsoft.com — 1 · other · 443 · mcp-inspector
- mcp.hasdata.com — 1 · vendor-own · 443 · python
- parfica.com — 1 · other · 443 · mcp-server-parfica
- us.i.posthog.com — 1 · telemetry · 443 · lokka
- play.googleapis.com — 1 · telemetry · 443 · node
- api.atlassian.com — 1 · other · 443 · confluence-cloud-mcp
- overturemaps-us-west-2.s3.amazonaws.com — 1 · other · 443 · 
- overturemaps-us-west-2.s3.us-west-2.amazonaws.com — 1 · other · 443 · 
- extensions.duckdb.org — 1 · other · 80 · 
- mcp.voris.ai — 1 · vendor-own · 443 · voris-mcp
- yzapi.yazio.com — 1 · other · 443 · yazio-mcp
- agent-firewall-seven.vercel.app — 1 · other · 443 · email-guard-mcp
- openrouter.ai — 1 · ai-api · 443 · llm-advisor-mcp
- arena.ai — 1 · other · 443 · llm-advisor-mcp
- cdn.opencompass.org.cn — 1 · other · 443 · llm-advisor-mcp
- mintqa.dev — 1 · other · 443 · mintqa-mcp
- api.x402tools.xyz — 1 · vendor-own · 443 · x402tools-mcp
- usage.gistrec.cloud — 1 · telemetry · 443 · mcp-google-business
- mobile.events.data.microsoft.com — 1 · telemetry · 443 · 
- mcp.clean.tools — 1 · vendor-own · 443 · clean-tools-mcp
- api.osf-master-server.com — 1 · other · 443 · osf-data-marketplace
- modelpricewatch.com — 1 · vendor-own · 443 · modelpricewatch-mcp

Package registries: pypi.org 21 · registry.npmjs.org 3

### `$HOME` at first start

- cells that open content under `$HOME` outside the project, the toolchain and the package-manager cache: 59/579 = 10.2 % [8.0 %–12.9 %]
- cells that read or write a decoy file (credentials, agent configs, shell): 18/579 = 3.1 % [2.0 %–4.9 %]

| prefix | content opened (cells) | written (cells) | probed (cells) | examples |
|---|---|---|---|---|
| `~/.local/share` | 24 | 24 | 26 | `~/.local/share/fastmcp/version_cache.json` `~/.local/share/chrome-devtools-mcp/telemetry_state.json` `~/.local/share/parecode-nodejs/sessions/ead675dd-d107-4a56-b388-bfa260a1af91.jsonl` |
| `~/.env` | 9 | 0 | 9 | `~/.env` |
| `~/.npm/_logs` | 2 | 2 | 2 | `~/.npm/_logs/2026-09-11T20_28_37_933Z-debug-0.log` `~/.npm/_logs/2026-09-11T21_08_01_988Z-debug-0.log` |
| `~/.terradev/.auth_tmp_i48b4m0m` | 1 | 1 | 1 | `~/.terradev/.auth_tmp_i48b4m0m` |
| `~/.terradev/.keyfile` | 1 | 1 | 1 | `~/.terradev/.keyfile` |
| `~/.openemis-mcp` | 1 | 1 | 1 | `~/.openemis-mcp` |
| `~/.openemis-mcp/auth.db-journal` | 1 | 1 | 1 | `~/.openemis-mcp/auth.db-journal` |
| `~/.openemis-mcp/auth.db-wal` | 1 | 1 | 1 | `~/.openemis-mcp/auth.db-wal` |
| `~/.openemis-mcp/auth.db-shm` | 1 | 1 | 1 | `~/.openemis-mcp/auth.db-shm` |
| `~/.openemis-mcp/auth.db` | 1 | 1 | 1 | `~/.openemis-mcp/auth.db` |
| `~/.servonaut/logs` | 1 | 1 | 1 | `~/.servonaut/logs/servonaut.log` |
| `~/.edgar/_tcache` | 1 | 1 | 1 | `~/.edgar/_tcache` `~/.edgar/_tcache/.locale_fix_457_applied` `~/.edgar/_tcache/.empty_response_fix_672_applied` |
| `~/.cache/brave-mcp` | 1 | 1 | 1 | `~/.cache/brave-mcp/latest.json` |
| `~/.npmrc` | 2 | 0 | 2 | `~/.npmrc` |
| `~/.npm` | 0 | 2 | 2 |  |
| `~/.neo/daemon` | 1 | 1 | 1 | `~/.neo/daemon/.standalone_deployment_id-e50wqcn8` `~/.neo/daemon/neo-mcp.log.birth` `~/.neo/daemon/neo-mcp.log` |
| `~/.claude/skills` | 1 | 1 | 1 | `~/.claude/skills/neo.md` |
| `~/.lokka/telemetry-id` | 1 | 1 | 1 | `~/.lokka/telemetry-id` |
| `~/.cache/async23-chrome-devtools-mcp` | 1 | 1 | 1 | `~/.cache/async23-chrome-devtools-mcp/latest.json` |
| `~/.cache/claude` | 1 | 1 | 1 | `~/.cache/claude/mcp-devops-practices.log` |
| `~/.duckdb/extensions` | 1 | 1 | 1 | `~/.duckdb/extensions/v1.5.5/linux_amd64/httpfs.duckdb_extension.tmp-c41e0d78-5579-4e06-88fd-122697f57805.duckdb_extension` `~/.duckdb/extensions/v1.5.5/linux_amd64/httpfs.duckdb_extension.tmp-c41e0d78-5579-4e06-88fd-122697f57805.duckdb_extension.info` `~/.duckdb/extensions/v1.5.5/linux_amd64/httpfs.duckdb_extension` |
| `~/.fetchproxy/identity` | 1 | 1 | 1 | `~/.fetchproxy/identity/compass-mcp.json` |
| `~/.astgl-client-id` | 1 | 1 | 1 | `~/.astgl-client-id` |
| `~/.cp-memory` | 1 | 1 | 1 | `~/.cp-memory` |
| `~/.cp-memory/memory.db-journal` | 1 | 1 | 1 | `~/.cp-memory/memory.db-journal` |
| `~/.cp-memory/memory.db-wal` | 1 | 1 | 1 | `~/.cp-memory/memory.db-wal` |
| `~/.cp-memory/memory.db-shm` | 1 | 1 | 1 | `~/.cp-memory/memory.db-shm` |
| `~/.cp-memory/memory.db` | 1 | 1 | 1 | `~/.cp-memory/memory.db` |
| `~/.cp-memory/.timezone-asia-shanghai-v2` | 1 | 1 | 1 | `~/.cp-memory/.timezone-asia-shanghai-v2` |
| `~/.cp-memory/.semantic-upgrade-v2` | 1 | 1 | 1 | `~/.cp-memory/.semantic-upgrade-v2` |
| `~/.cp-memory/.fts-ready-v1` | 1 | 1 | 1 | `~/.cp-memory/.fts-ready-v1` |
| `~/.cp-memory/.decision-mirror-repair-v1` | 1 | 1 | 1 | `~/.cp-memory/.decision-mirror-repair-v1` |
| `~/.cache/geocode-mcp` | 1 | 1 | 1 | `~/.cache/geocode-mcp/venv/.gitignore` `~/.cache/geocode-mcp/venv/pyvenv.cfg` |
| `~/.token-optimizer-mcp/analytics.db-journal` | 1 | 1 | 1 | `~/.token-optimizer-mcp/analytics.db-journal` |
| `~/.token-optimizer-mcp` | 1 | 1 | 1 | `~/.token-optimizer-mcp` |
| `~/.token-optimizer` | 1 | 1 | 1 | `~/.token-optimizer` |
| `~/.token-optimizer/optimization.db-journal` | 1 | 1 | 1 | `~/.token-optimizer/optimization.db-journal` |
| `~/.token-optimizer/optimization.db-wal` | 1 | 1 | 1 | `~/.token-optimizer/optimization.db-wal` |
| `~/.token-optimizer/optimization.db-shm` | 1 | 1 | 1 | `~/.token-optimizer/optimization.db-shm` |
| `~/.token-optimizer/config.json` | 1 | 1 | 1 | `~/.token-optimizer/config.json` |
| `~/.token-optimizer/sessions.json.gz.tmp` | 1 | 1 | 1 | `~/.token-optimizer/sessions.json.gz.tmp` |
| `~/.token-optimizer-mcp/analytics.db` | 1 | 1 | 1 | `~/.token-optimizer-mcp/analytics.db` |
| `~/.token-optimizer/optimization.db` | 1 | 1 | 1 | `~/.token-optimizer/optimization.db` |
| `~/.agent-guards/rules` | 1 | 1 | 1 | `~/.agent-guards/rules/state.json.12.tmp` `~/.agent-guards/rules/packages.tsv.12.tmp` `~/.agent-guards/rules/bundle.json.12.tmp` |
| `~/.cache/matplotlib` | 1 | 1 | 1 | `~/.cache/matplotlib/fontlist-v3.11.0.json.matplotlib-lock` `~/.cache/matplotlib/fontlist-v3.11.0.json` |
| `~/.gemini/config` | 1 | 1 | 1 | `~/.gemini/config/skills/state-memory-mcp/SKILL.md` |
| `~/.state-memory-mcp/projects.json.tmp.3qv2y10om05` | 1 | 1 | 1 | `~/.state-memory-mcp/projects.json.tmp.3qv2y10om05` |
| `~/.config/Claude` | 1 | 1 | 1 | `~/.config/Claude/claude_desktop_config.json` |
| `~/.state-memory-mcp-registry.json` | 1 | 1 | 1 | `~/.state-memory-mcp-registry.json` |
| `~/.cursorrules` | 1 | 1 | 1 | `~/.cursorrules` |
| `~/.gemini/GEMINI.md` | 1 | 1 | 1 | `~/.gemini/GEMINI.md` |
| `~/.debugium/debugium.log` | 1 | 1 | 1 | `~/.debugium/debugium.log` |
| `~/.config/mcp-google-business` | 1 | 1 | 1 | `~/.config/mcp-google-business/instance-id` |
| `~/hoshin-data/config.json` | 1 | 1 | 1 | `~/hoshin-data/config.json` |
| `~/hoshin-data/config.json.tmp` | 1 | 1 | 1 | `~/hoshin-data/config.json.tmp` |
| `~/hoshin-data/ideas.json.tmp` | 1 | 1 | 1 | `~/hoshin-data/ideas.json.tmp` |
| `~/hoshin-data/themes.json.tmp` | 1 | 1 | 1 | `~/hoshin-data/themes.json.tmp` |
| `~/hoshin-data/cadences.json.tmp` | 1 | 1 | 1 | `~/hoshin-data/cadences.json.tmp` |
| `~/.cache/Microsoft` | 1 | 1 | 1 | `~/.cache/Microsoft/DeveloperTools/.onnxruntime/onnxruntime.db` `~/.cache/Microsoft/DeveloperTools/.onnxruntime/onnxruntime.db-journal` `~/.cache/Microsoft/DeveloperTools/.onnxruntime` |
| `~/.photographi/telemetry.json` | 1 | 1 | 1 | `~/.photographi/telemetry.json` |

Probed only (stat/ENOENT, no content), ≥3 cells: `~/node_modules` 69 · `~/.node_modules` 69 · `~/.node_libraries` 69 · `~/.git` 3 · `~/.cache` 3

Decoys with content opened, by cells:

- `~/.env`: 9
- `~/.npmrc`: 2 (brave-mcp@1.8.0, @async23/chrome-devtools-mcp@1.7.0)
- `~/.claude`: 2 (neo-mcp@0.5.5, claude-code-conversation-search-mcp@1.1.3)
- `~/.netrc`: 1 (b280-olca-mcp@1.14.0)
- `~/.gitconfig`: 1 (terravision@0.47.0)
- `~/.kube`: 1 (mcp-alertmanager@2.1.1)
- `~/.gemini`: 1 (@putervision/state-memory-mcp@1.1.1)
- `~/.config/Claude`: 1 (@putervision/state-memory-mcp@1.1.1)
- `~/.aws`: 1 (@infoinlet/mcp-s3@0.1.1)

## Cluster-robust intervals by publisher

| rate | k/n | Wilson (iid) | cluster-robust | DEFF | clusters |
|---|---|---|---|---|---|
| npm: tree with an install script | 51/404 | 12.6 % [9.7 %–16.2 %] | [9.3 %–16.0 %] | 1.06 | 359 |
| first start: handshake ok | 347/579 | 59.9 % [55.9 %–63.8 %] | [53.9 %–65.9 %] | 2.25 | 499 |
| PyPI: broken by the FastMCP rename (mcp 2.0) | 52/175 | 29.7 % [23.4 %–36.9 %] | [14.1 %–45.3 %] | 5.30 | 142 |
| PyPI: pypi.org at start (fastmcp) | 21/175 | 12.0 % [8.0 %–17.6 %] | [4.8 %–19.2 %] | 2.22 | 142 |
| first start: any egress | 47/579 | 8.1 % [6.2 %–10.6 %] | [5.4 %–10.8 %] | 1.49 | 499 |
| first start: telemetry | 4/579 | 0.7 % [0.3 %–1.8 %] | [0.0 %–1.4 %] | 1.01 | 499 |
| first start: decoy opened | 18/579 | 3.1 % [2.0 %–4.9 %] | [1.7 %–4.5 %] | 1.02 | 499 |
| first start: ~/.env read | 9/579 | 1.6 % [0.8 %–2.9 %] | [0.5 %–2.6 %] | 1.02 | 499 |
