# agent-plugins — findings

Run of 2026-09-16/17. Four populations, each run whole: the 42 agents of the ACP registry (44
cells), the 330 plugins of the Cursor Marketplace, the 171 plugins of the Devin marketplace,
the 73 context-server extensions of Zed. Instrument, sandbox and what is not measured in
[README.md](README.md); per-cell records in `results/cells-<arm>.ndjson`; generated figures in
[results/report.md](results/report.md). Every rate is n/N over the population with a 95 %
Wilson interval in brackets.

## 1. ACP agents: the instrument against the registry's own CI

The ACP registry installs and launches every agent in CI and publishes the outcome
(`.protocol-matrix/latest.json` of 2026-09-16: 34 agents probed, `initialize` and `session/new`
status each — its own summary: 33 of 34 initialize, 21 answer `session/new` with auth_required;
`quarantine.json`: 8 agents frozen, with a reason). The run covered the same 42 agents — the 41
the index publishes plus `github-copilot`, which the build excludes from the default index but
which sits in the repository and in the matrix — on linux-x86_64, one cell per distribution: 23
npm, 2 uvx, 19 binary. Same handshake (`initialize` with the probe's client capabilities, then
`session/new`), same outcome classes.

### Agreement

For the agents the matrix probed, on the same distribution, the instrument's `initialize` and
`session/new` outcomes matched theirs in **33/34** (97.1 % [85.1–99.5]) after two harness
corrections (the extractor did not handle `.tar.bz2` archives or bare executables; goose's
binary then matched — sigit's binary is not compared, the matrix probes its npm distribution).
Two cells needed a run of their own: `junie`, whose 332 MB archive would not finish downloading
under strace while another batch shared the one CPU; run alone at the end, it downloaded in
14 s, started, and agrees with the matrix (`initialize`, `session/new` success) — and `cline`,
below.

The one disagreement is an archive, not an agent: `cortex-code` (Snowflake) is `process_error`
in their matrix with the message "Extraction failed" — the registry's `verify_agents.py`
extracts with Python's `tarfile` under the `data` filter, which refuses the absolute symlink
`reladiff-venv/bin/python3.12 -> /usr/bin/python3.12` inside the archive, so the binary was
never launched; GNU `tar` extracts it and it starts, and what it does once started is below.

`cline@3.0.61` failed to install at 21:38:51 UTC with `ETARGET` on `@ai-sdk/anthropic@4.0.56`.
That version was published at 21:39:10 UTC, nineteen seconds later, by the same release that
had just published `ai@6.0.284` and `@ai-sdk/gateway@3.0.195`; `cline` pins none of that chain,
so a "pinned" registry entry resolves through floating transitive dependencies to whatever the
ai-sdk monorepo is publishing at that minute. Installed a second time, it succeeded in 104 s —
and npm created no `node_modules/.bin/cline` link for the package's declared bin (reproduced
outside the sandbox); the registry's `npx` launch does not depend on the link, the instrument's
did, and the cell was run a third time with the bin path itself; it then agrees with the matrix
(`initialize`, then auth_required).

### The eight quarantines

`quarantine.json` is the auto-updater's freeze list: an id in it keeps its pinned version and
is skipped by the daily probe. It does not delist — all eight are in the published index — and
it does not stop manual bumps (fast-agent's pin moved from 0.9.30 to 0.10.1 while quarantined).
Three of the eight reasons name the newer version the updater refused, not the version that is
pinned and served, so at the pin they are untestable by construction.

| agent | registry's reason | at the pinned version, linux |
|---|---|---|
| agoragentic-acp 1.3.0 | Postinstall script | confirmed: `postinstall: node scripts/postinstall.js \|\| true` (plus esbuild's standard `install.js`); the script prints a marketing banner and does nothing else — no network, no file outside `node_modules`. `initialize` succeeds and answers `authMethods: [{type: "terminal", …}]` without the `id` the schema requires; `session/new` → *method not found*: it is an MCP server with an `--acp` flag |
| minion-code 0.1.44 | Python dependency issue | confirmed: the console script dies at import, `cannot import name 'AuthMethod' from 'acp.schema'` |
| deepagents 0.1.7 | Missing npm dependency | not reproduced: installs, `initialize` and `session/new` succeed |
| fast-agent 0.10.1 | Timeout after 120 s waiting for initialize | not reproduced: with the uvx install done beforehand (18.9 s), `initialize` answers in 9.7 s and `session/new` succeeds. Their timeout is the install inside the launch |
| vtcode 0.96.14 | Missing windows builds | not applicable on linux: succeeds (its `agentInfo` says version 0.96.12, title "Zed") |
| crow-cli 0.1.24 | ACP initialize fails in crow-cli 0.1.25 | about the refused update. At the pin: `initialize` succeeds; `session/new` does not answer within 20 s because the agent is, at that moment, installing Python 3.14 through `uv` (`releases.astral.sh`, `pypi.org`) — its first start is an install that leaves a Python toolchain in `$HOME` (3,729 writes under `~/.local/share/uv`, 4,565 under `~/.cache/uv`) |
| qoder 0.2.14 | ACP initialize fails in qodercli 0.2.15/0.2.16 | about the refused update. At the pin: `initialize` succeeds, `session/new` → auth_required; see the fingerprint below |
| mistral-vibe 2.24.1 | Binary archive URL not accessible | about the refused update. At the pin: the archive served (44,314,346 bytes, sha256 as declared); `initialize` succeeds, `session/new` → auth_required |

Two of the five reasons about the pinned version hold, two do not, one is platform-bound.

### What the launch check does not see

The registry's `verify_agents.py` asks one question — does the agent answer `initialize` with
valid `authMethods` — and asks it of the 34 agents it does not quarantine. The instrument
answers others, for all 42.

**At install.** 12/23 npm cells run install scripts (52.2 % [33.0–70.8]): native builds
(node-pty in auggie and gemini, `@github/keytar` in gemini — which compiled with gcc after
fetching headers from `nodejs.org` —, sharp in dirac, better-sqlite3 in minimax-code via
`prebuild-install` from GitHub releases, `@qwen-code/audio-capture` in qwen-code) and vendor
post-installs (`droid install.js`, `@xai-official/grok bin/postinstall.js`, `@kilocode/cli
postinstall.mjs`, `@minimax-ai/code verify-native-install.mjs`, cloudflared's `postinstall.mjs
&& bin install`, which fetched the cloudflared binary from GitHub during nova's install,
qoder's, which only checks for ripgrep, and cline's, which caches its 151 MB platform binary).
Install-time egress beyond the package registry: `nodejs.org` (gemini), `github.com` and
`release-assets.githubusercontent.com` (nova, minimax-code). The 19 binary distributions come
from GitHub releases (14) or the vendors' own hosts (5: `dl.google.com`,
`sfc-repo.snowflakecomputing.com`, `downloads.cursor.com`, `static.devin.ai`,
`downloads.poolside.ai`). 10 of the 19 declare a sha256 and all 10 match; 9 declare none, and
the registry format does not require one.

**At first start, before any prompt.** 44 cells started, 43 completed `initialize` (minion-code
the exception). A "read" below is a successful open for reading of a decoy file; the sources
confirm that each is parsed.

- *Telemetry, error reporting, feature flags — 10 hosts in 8 agents*: `otel.cline.bot` (cline),
  `http-intake.logs.datadoghq.com` (cortex-code; the binary also configures a Datadog *metrics*
  client with a 15 s flush, which was not seen at 10 s nor at 60 s),
  `o4507463137361920.ingest.us.sentry.io` and the feature-flag service `unleash.codeium.com`
  (devin), `telemetry.factory.ai` (factory-droid), `play.googleapis.com` (gemini's Clearcut,
  which runs `lspci` to attach the GPU model to the event),
  `copilot-telemetry.githubusercontent.com` and `dc.services.visualstudio.com`
  (github-copilot), `us.i.posthog.com` (kilo), `gb4w8c3ygj-default-sea.rum.aliyuncs.com`
  (qwen-code). minimax-code connects once to `agent.minimaxi.com` (its cn-region host, chosen
  because `MAVIS_REGION` is unset; it serves the API, login and the observability endpoints
  alike, so the purpose of the one connection cannot be told from the host).
- *A device fingerprint*: qoder unpacks an x86-64 ELF embedded as base64 in its 38 MB
  obfuscated bundle and runs it at first start; the binary's strings name the MAC address, the
  DMI vendor and product, the baseboard serial through `dmidecode` and VM detection, and
  `dmidecode` is not among the programs the trace saw it execute — what it reads is the DMI
  identifiers under `/sys/class/dmi/id` and the interface address; it reports to
  `sg-pum.alibabachengdun.com/repPc.json` — Alibaba's UMID / SecurityGuard endpoint — to obtain
  a `machineToken`. In the same ten seconds qoder `stat`s every top-level entry of
  `$HOME` between 2,300 and 2,800 times (`~/.aws` 2,746, `~/.ssh` 2,549, `~/.netrc` 2,396 …)
  without opening any of them except `~/.env` and `~/.gitconfig`.
- *Downloads and installs at first start*: codebuddy-code fetches its plugin-marketplace index
  from `download.codebuddy.cn`; crow-cli installs Python (above); github-copilot-cli checks
  `api.github.com` for a newer release and downloads it into `~/.cache/copilot`; github-copilot
  (the language server) installs the ~300 MB `@github/copilot` CLI through `npx` because ACP
  mode needs it; opencode forks a background `npm install` of `@opencode-ai/plugin` into
  `~/.config/opencode` (1,924 writes; kilo, its fork, has the same code path); codex-acp syncs
  OpenAI's curated plugin marketplace from `github.com/openai/plugins` by `git ls-remote` and
  `git fetch` before anything else; qoder contacts `download.qoder.com`; cline runs `npm`
  against `registry.npmjs.org` at start.
- *Only their own or their provider's API*: claude-acp (`api.anthropic.com`), cursor
  (`api2.cursor.sh`, a `getUserPrivacyMode` call), grok-build (`cli-chat-proxy.grok.com`),
  sigit (`sigit.si`), stakpak (`apiv2.stakpak.dev`), dirac (`openrouter.ai`, a third-party
  gateway), factory-droid also `api.workos.com` (its identity provider), junie
  `junie.jetbrains.com` and `resources.jetbrains.com`. Of the 42 agents, 22 contact some host
  before a prompt (52.4 % [37.7–66.6]) — 8 with telemetry, 8 with a download, install or
  fingerprint, 8 only their own or their provider's host, two in more than one class — and 20
  contact nothing beyond localhost (kimchi and junie probe the Ollama port, 11434; junie also
  1234, LM Studio's).
- *Credential and configuration files opened*: `~/.env` by 5 agents — a dotenv lookup that
  starts at the workspace and walks up its parents, one level here, to `$HOME` (crow-cli via
  python-dotenv, vtcode via dotenvy, gemini and qoder via gemini-cli's `findEnvFile`, qwen-code
  via `findEnvFiles`; gemini, qoder and qwen-code also fall back to `~/.env` explicitly), and
  the file's keys — here `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` — go into the agent's
  environment and so into every process it spawns (all keys in crow-cli, vtcode, qoder and
  qwen-code; only `GEMINI_`/`GOOGLE_` keys in gemini, because the folder is untrusted).
  fast-agent is the contrast: 16 probes of `~/proj/.env`, none of `~/.env`. `~/.netrc` by
  codex-acp — libcurl inside the `git-remote-https` it spawns for the plugin sync, twice per
  process. `~/.npmrc` by kimchi, opencode and github-copilot. *Other agents' configuration*:
  `~/.claude.json`, `~/.claude/settings.json` and `~/.cursor/mcp.json` by devin and grok-build
  (which then announce `_cognition.ai/mcp/serversChanged` and `_x.ai/mcp/servers_updated`);
  `~/.claude.json` and `~/.cursor/mcp.json` by kimchi; `~/.claude/settings.json` by
  cortex-code. The shell profiles: codebuddy-code and dimcode spawn a login shell (`bash`,
  `id`; `run-parts` in dimcode) to snapshot the environment and read `~/.bashrc` / `~/.profile`
  that way. claude-acp tries to open `~/.claude/.credentials.json` 8 times and codex-acp
  `~/.codex/auth.json` 10 times; neither exists in the decoy home, so nothing is read.
- *Writes outside their own directory*: minimax-code reads `~/.bashrc` and appends `# Added by
  MiniMax Code` + `export PATH="<its data dir>/bin:$PATH"` (function `Rka`,
  `chunks/chunk-CSEMCTUO.js`, guarded by the marker); qoder writes `~/.config/git/ignore` and
  `~/.config/.locale_cfg`; github-copilot-cli runs `gh` twice to pick up the GitHub CLI's
  credential, and `gh` rewrote `~/.config/gh/hosts.yml` into its multi-account format and
  created `config.yml`. Large writes in their own directories: codex-acp 3,617 under
  `~/.codex/.tmp`, opencode 1,924 under `~/.config/opencode`, minimax-code 568 under
  `~/.minimax/.builtin-skills`, crow-cli the Python toolchain above.
- *Programs executed*: `git` by 11 agents (repository discovery in the workspace; for codex-acp
  also the marketplace sync); `lspci` by gemini (telemetry, above); `lsb_release`, `getconf`
  and its own `bwrap` by codex-acp; `gcc`, `ld` (12 times) and `ldconfig` by mistral-vibe — not
  a build: `ctypes.util.find_library` probing for the macOS frameworks Security, CoreServices
  and Foundation, requested at import by the `keyring` macOS backend bundled into a Linux
  binary; `rg` by cursor and qwen-code; `hostname` by dirac; `pgrep` and the fingerprint helper
  by qoder; `uv` and `python3.14` by crow-cli.
- *Requests back to the client before any prompt*: `session/update` notifications from 13
  agents; `_auth/status_update` from claude-acp and codex-acp; the vendor notifications above.

### What the check covers and what it does not

Everything in the previous section happened in agents that the registry lists, and the
registry's check does not look at any of it: for the 34 it probes, the question is the
handshake; the 8 it quarantines — including three of the five `~/.env` readers (crow-cli,
qoder, vtcode) and the fingerprint — it does not probe at all, and lists anyway. The one
install-behaviour rule it has, "Postinstall script", is a presence rule: agoragentic's banner
and cloudflared's binary download are both a postinstall script, and only one of them is in
`quarantine.json`.

None of this is a finding of malice. It is what the population does at install and first start,
measured the same way for all 42, which is what the registry does not publish.

## 2. Cursor Marketplace plugins

330 approved plugins from the catalogue endpoint, fetched at the commit the catalogue pins (324
by SHA; 6 entries carry no ref and were fetched at the default branch), 66 of them first-party.
Every plugin directory was located (the manifest is `.cursor-plugin/plugin.json` in 306, the
Agent Plugins standard's root `plugin.json` in 11, a `.claude-plugin`, `.grok-plugin` or
`.codex-plugin` manifest that Cursor accepts in 11, a bare `.mcp.json` in one, and one plugin —
amd-skills, eight skills — has no manifest at all and is reached through its monorepo's
`marketplace.json`). Installing a plugin is a `git clone`: nothing of the plugin's runs until
an event fires a hook or the editor starts a bundled MCP server.

**What they ship.** 234 have skills, 72 rules, 53 agents, 61 commands — prose for the model.
122 (37.0 % [31.9–42.3]) ship scripts (shell, Python, JavaScript, TypeScript), 72 (21.8 %
[17.7–26.6]) executable files, one a `node_modules`. None ships a binary by file magic (0/330,
ELF, PE, Mach-O or WASM): Cursor's "No binaries are shipped" holds for the repositories. It
does not hold for what runs — see the hooks.

**What they declare.** 230 (69.7 % [64.5–74.4]) declare at least one remote MCP server — 296
declarations, 261 distinct servers (35 are the same server read from two manifest files,
`mcp.json` and `.mcp.json`), on 219 concrete hosts plus 15 plugins whose host is a user
variable (`mcp.infobip.com` 12 servers in one plugin, `api.cursor.com` 5 plugins) — and 222
declare only remote ones: for two thirds of the marketplace, installing installs nothing and
runs nothing locally, and the plugin is a pointer plus a credential. 49 (14.8 % [11.4–19.1])
declare a stdio server — 67 declarations, 63 distinct: `npx` 32, `uvx` 19, `node` 4, and twelve
commands that are products the user is expected to have installed (`pascal`, `kraken`, `dart`,
`sonar`, `toolbox`, `1password-mcp`, `semgrep`, `encore`, `zscaler-mcp-server`, a
`~/.paper/bin/paper`). 59 (17.9 % [14.1–22.4]) declare no server. 36 (10.9 % [8.0–14.7])
declare hooks — 112 hook commands over 20 event names in the two spellings Cursor accepts
(`SessionStart`/`sessionStart`, `PreToolUse`/`preToolUse` …); one of the 36 is first-party. The
instrument collects every hooks file in the plugin (`hooks/hooks.json`, a root `hooks.json`,
`.cursor/hooks.json`), so where a plugin ships the same hooks for several editors — mem0 ships
Cursor's, Antigravity's and Claude Code's — its commands are counted once per file.

**MCP servers at first start.** The 67 declared stdio servers were started the way the editor
would, with dummy values for the variables the plugin asks the user to fill. 45 completed the
handshake (67.2 % [55.3–77.2]; 43 distinct servers, 931 tools with the two duplicates counted
twice). 12 could not start because the product they wrap is not on the host (10 products); 10
started and did not answer: three `mcp-remote` relays (canva, mixpanel, zoominfo) opened an
OAuth callback port and waited for a browser; meta-vr has no linux build; prisma's `npx`
install of `prisma@8.0.0-rc.15` failed inside npm; appwrite's declared `--users` flag does not
exist; zscaler needs an `.env` the plugin does not ship; devtools-for-agents is itself the
`chrome-devtools-mcp` package, unbuilt, so `npx` resolved the local checkout and found no bin;
supermemory's plugin server answered (8 tools) and the entry that failed is the developer's own
`.cursor/mcp.json`, whose `${workspaceFolder}` the instrument resolved to its workspace — an
artefact of collecting that file; endorctl exited silently. Of the 67 starts, 31 pulled their
package from `registry.npmjs.org` and 14 from `pypi.org` at that moment — the command is the
install. Beyond the package indexes: five AWS plugins run the same `uvx mcp-proxy-for-aws` to
`aws-mcp.us-east-1.api.aws` (seven declarations, two of them duplicated), and
`~/.aws/credentials` and `~/.aws/config` are read at start by seven plugins (eight server
starts) — those five, opensearch-agent-skills' two AWS servers and aws-serverless — botocore's
credential chain;
snyk-api-web installs its server from a git URL and the `git-remote-https` inside `uvx` reads
`~/.netrc` (as does opensearch's `awslabs.aws-api-mcp-server`), while snyk-secure-development's
`npx snyk` fetches from `downloads.snyk.io`; firebase reads `~/.config/gcloud` and contacts
`developerknowledge.googleapis.com`; browser-use and appwrite read `~/.env`; browser-use also
reports to `eu.i.posthog.com` and installs Python through `releases.astral.sh`; convex to
`o1192621.ingest.sentry.io`; azure's `@azure/mcp` sends to Application Insights
(`*.in.applicationinsights.azure.com`, seen in the cell's DNS names only, the connects being
IPv4-mapped), probes the Azure instance-metadata address 169.254.169.254 and unpacks a .NET
bundle with native libraries into `~/.net/azmcp`; mongodb and phantom-connect compiled native
modules with headers from `nodejs.org`; azure and rover write a shared Microsoft device id and
an update-notifier state. Telemetry hosts in 3 of 67 server starts (browser-use, convex,
azure).

**Hooks.** 95 of the 112 hook commands ran once each with a synthetic event on stdin (mem0's 29
— 9 for Cursor, 9 for Antigravity, 11 for Claude Code — were cut at 12); hook `matcher` fields
were not applied, so a hook that fires only on shell commands matching a pattern ran here on
`ls -la`. 85 exited 0, four of them Windows batch wrappers that did nothing on Linux. The rest:
`semgrep` absent (2), two scripts committed without the execute bit (prisma, convex), prisma's
two `afterFileEdit` scripts failing because their `npx prisma` could not be installed,
1password's env-file validator, one download killed at the 20 s limit (corridor), and monk's
`SessionStart` twice — both runs completed their script and were killed because the agent
process they leave running kept the traced tree alive. What a hook does is what its script
does, and 11 of the 95 reached the network:

- *Download and run a binary*: revyl's `beforeShellExecution`, matched to shell commands
  containing `revyl`, fetches a release from GitHub — pinned by tag and sha256 in the
  repository — into `~/.cache/revyl` and `~/.revyl/bin` and launches it, and verifies the
  cached checksum on later runs; corridor's `sessionStart` pipes
  `app.corridor.dev/cli/install.sh` into `sh` (unpinned: the version comes from
  `app.corridor.dev/cli/VERSION`), which downloads the GitHub release, checks its checksum,
  installs it into `~/.corridor/bin`, appends a PATH block to the shell profile and runs it,
  then runs `corridor install --target ide-extension` on every session start (killed here at 20
  s before the download finished; the execution is from the code); monk's `SessionStart`
  downloads the 65 MiB `monk-agent-linux-latest.tar.gz` from `get.monk.io` (unpinned; the file
  behind the URL changed within hours of the run, and the script re-checks its checksum and
  re-downloads on every session start), starts `monk-agent serve` on localhost and posts to
  `us.i.posthog.com` from the plugin's own script and from the downloaded binary; jfrog's
  `beforeSubmitPrompt` — before every prompt, no matcher — runs `npx --yes @jfrog/agent-guard`
  against `releases.jfrog.io` (unpinned; its platform dependency is a 35 MB static ELF), and
  its `sessionStart` writes `~/.jfrog/agents-conf.json`.
- *Install packages*: crowdstrike-falcon-fusion's `SessionStart` builds a Python venv from
  `pypi.org`; astronomer-data's `stop` installs 35 packages with `uv` and runs them; prisma's
  two `afterFileEdit` hooks run `npx prisma format` and `npx prisma generate` on every edit.
- *Telemetry*: vercel's `SessionStart` posts to `telemetry.vercel.com` and writes
  `~/.config/vercel-plugin`; mem0's `preCompact` posts to `us.i.posthog.com` (with a key
  configured, its scripts would also post at session start, stop, every prompt and every memory
  tool use), and mem0's hooks read the shell profiles (`~/.bashrc`, `~/.zshrc`, `~/.profile`)
  on four events — not sourcing them, grepping for an `export MEM0_API_KEY=` line.

The other 84 hook runs are what the marketplace's description suggests: shell, `jq`, `cat`,
`python3` and `node` over the event's JSON (`cat` 50, `bash` 36, `jq` 26, `python3` 22, `node`
21), and nothing leaves the machine. No hook read `~/.aws`, `~/.ssh`, `~/.env`, `~/.netrc` or
another agent's configuration (`~/.npmrc` and `~/.gitconfig` were read by the `npm` and `git`
the hooks spawn); forge's `stop` writes `~/.cursor/forge-hook-state`. Two hooks are written to
edit other tools' configuration when it exists: monk's start script adds its server to
`~/.gemini/config/mcp_config.json` if that directory is present (it was not), and jfrog's
`sessionStart` is built to rewrite other installed Cursor plugins' `mcp.json` under
`~/.cursor/plugins`.

**What review sees.** Cursor's review is manual and requires open source; everything above is
in the open source. What it does not require is that the plugin's behaviour stay inside the
repository: four plugins fetch and run a binary the reviewed repository does not contain — at
session start (corridor, monk), before shell commands that match (revyl), before every prompt
(jfrog) — and three of the four fetch "latest"; two more install and run packages from an index
in a hook (crowdstrike-falcon-fusion, astronomer-data). The marketplace's "No binaries are
shipped" is true of the repositories and not of the session.

## 3. Devin marketplace plugins

171 plugins in `CognitionAI/devin-marketplace` at commit `e314c2f` (2026-09-15 03:15 UTC),
every one a `.devin-plugin/plugin.json` with an `mcpServers` map and nothing else that is run
at install or first start: no hooks (the plugin system allows them; no marketplace plugin
declares one), 38 with `skills/` directories, 4 with scripts inside them (2 with the execute
bit), none with a binary by file magic. 120 plugins (70.2 % [62.9–76.5]) declare only remote
servers (117 distinct hosts — `mcp.axiom.co`, `mcp.airtable.com`, `mcp.app-us1.com` …; 5 of the
120 URLs let the user override the host, datadog's and newrelic's among them): installing them
installs nothing and runs nothing locally. 24 (14.0 % [9.6–20.0]) declare a `docker` command,
which the host cannot run. 27 (15.8 % [11.1–22.0]) declare a local command — 15 `npx`, 11
`uvx`, 1 `pipx` — and those are the cells with something to observe.

Of the 27, 18 completed the MCP handshake (66.7 % [47.8–81.4]; 272 tools listed). The nine that
did not: `pipx` is not on the host (google-analytics); aws-sns-sqs stops because the
`AWS_PROFILE` the plugin makes the user fill does not exist (`ProfileNotFound` with the dummy
value — recorded, not a loss); aws-agent-toolkit stops because the instrument replaced the
plugin's empty default `${AWS_MCP_PROXY_PROFILES:-}` with a dummy profile name — an artefact of
the run, not of the plugin; `awslabs.lambda-mcp-server@latest` cannot be installed as declared,
every release of it having been yanked; dbt, metabase and unleash reject the dummy
configuration (a path and two URLs that do not validate); heroku crashes at start on a missing
module; mongodb's `npx` pull compiled a native module with gcc after fetching headers from
`nodejs.org` and had not answered after 120 s.

What the 27 first starts touched: 26 contact their package index (`pypi.org` 11,
`registry.npmjs.org` 15), because the plugin's command is the install (google-analytics, whose
source is a git URL, ran nothing); supabase also `supabase.com`, netlify `docs.netlify.com`. No
telemetry host. Credentials: the AWS servers read `~/.aws/credentials` and `~/.aws/config` at
start (aws-agent-toolkit, aws-dynamodb, aws-sns-sqs — the botocore credential chain), and
aws-dynamodb writes a log file under `~/.aws/aws-api-mcp`; nothing else opened a decoy. The
Devin marketplace is, at install and first start, a list of pointers to hosted servers; the
local minority behaves like the MCP packages of mcp-install.

## 4. Zed context-server extensions

73 extensions provide a context server (`api.zed.dev/extensions?provides=context-servers`,
2026-09-16; 2,650,712 downloads between them). A Zed extension is WASM; what it runs is decided
in its Rust at first use — `npm_install_package(...)` then `node`, or
`latest_github_release(...)` then `download_file` — so the command was recovered from the
source, not observed in Zed. The resolution is recorded per cell: 50 extensions install an npm
package (50/73, 68.5 % [57.1–78.0]), 11 download a GitHub release binary and 1 (terraform) a
HashiCorp release, 9 the heuristic did not resolve — 3 because the extension's declared
`repository` is the product's repository, not the extension's (serena, sonarqube, arch), 2 that
run a literal `npx` (shadcn, nextjs), 2 releases pinned by tag (kagi, bun-docs), 2 that only
wrap a binary the user installs (container-use, fff) — and 2 repositories could not be fetched:
one declares the placeholder `https://github.com/YOUR_GH/…` (ask-starknet-mcp, 29,288
downloads), one names a repository that does not exist under that name (maho-lsp declares
`mahocommerce/maho-zed`; the extension lives in `MahoCommerce/zed`, and its first commit already
declared the other name). Five of the 73 declare a repository that is not their source; the
field is author-declared and unchecked. None of the 73 declares a checksum for what it
downloads; the extension API has no field for one.

**At install.** The 50 npm packages all come from `registry.npmjs.org` (49 installed; `prisma`
failed inside npm); 9 of the 49 run install scripts — `puppeteer`'s post-install, which fetched
a browser from `storage.googleapis.com`, `@sentry/cli`'s, `@azure/mcp`'s,
`@postman/postman-mcp-server`'s pre-install, esbuild's, tldjs's, and tree-sitter's prebuild
checks in the package the heuristic picked for `gem` (its language server, not its context
server; nothing was compiled). The 12 release binaries: 10 have a linux-x86_64 asset in the
latest GitHub release; zuraffa has none; terraform fetches from `releases.hashicorp.com`, where
the linux archive exists and the harness did not look; and axiom's archive held
`mcp-server-axiom` beside a LICENSE and a README, which the harness's rule (a named constant or
a single file) did not pick.

**At first start.** 58 servers started, 28 completed the MCP handshake (48.3 % [35.9–60.8]; 448
tools listed by 27 of them — mysql answered `initialize` and not `tools/list`). Of the 30 that
did not: 17 stopped for want of a credential or a connection setting — the extension would have
passed the user's Zed settings as environment or arguments, the cell passed none — and 2
crashed on the same want (webflow, postgres); 9 were run with the wrong program or arguments by
the source heuristic (`azmcp` needs `server start`, `cem` was run as `lsp`, repomix without
`--mcp`, polar's package directory instead of its `bin/mcp-server.js`, gem's language server
instead of its context server, and four relays whose URL the heuristic did not carry — two of
them literal in the source); markitdown could not build its venv in the sandbox; planetscale's
`pscale mcp` subcommand was removed upstream. Egress before a prompt in 8 of 58:
chrome-devtools-mcp to `play.googleapis.com` (Google's Clearcut telemetry; it also writes a
telemetry state file and checks for updates) and to `registry.npmjs.org`; the two `@azure/mcp`
extensions to Application Insights (`*.in.applicationinsights.azure.com`, in the cells' DNS
names) with a probe of the Azure instance-metadata address; mui to `chat-backend.mui.com`;
svelte-mcp to `svelte.dev`; zeroheight to `auth.zeroheight.com` and `mcp.zeroheight.com` — an
OAuth flow launched through `xdg-open` without a prompt; github-activity-summarizer and
planetscale to GitHub addresses. Decoys opened: `~/.config/gh` by github-activity-summarizer
(through the `gh` CLI, which also rewrote `hosts.yml`) and `~/.kube/config` by the kubernetes
server — both the credential their product uses — and `~/.npmrc` by rover and
chrome-devtools-mcp, through an npm update check. No `~/.env`, no `~/.aws`, no other agent's
configuration; writes stay in each server's own directory, except `gh`'s rewrite, repomix's
output file in the workspace (an artefact of the missing `--mcp`), and the shared Microsoft
device id `@azure/mcp` writes under `~/.cache/Microsoft`.

Zed's registry is the only one of the four whose install and first start are, for the majority
of the population, an ordinary npm install plus an MCP server start: what mcp-install measured,
with the extension's source as the declaration of what would be installed and the registry's
`download_count` as the weight.

## 5. Open VSX extensions

The gallery behind Cursor, Windsurf and every Code-OSS build. Its sitemap of 2026-09-18 lists
17,944 extensions; the sample is 600 of them, drawn by `sha256(seed + "\n" + namespace.name)`,
and it is the only arm here whose sample is not the whole population, so the rates below are
estimates for the registry. Between them the 600 carry 13,365,196 downloads, median 1,690; 377
are in a verified namespace. All 600 had a registry record and a download; 599 were fetched (one
download failed) and the editor installed every one of them.

**What there is to activate.** 78 of 599 (13.0 % [10.6–16.0]) declare neither `main` nor
`browser` — themes, icon packs, snippets, keymaps, extension packs — and have nothing to run;
496 declare `main` alone (82.8 % [79.6–85.6]), 23 both, 2 only `browser`, which runs in the web
worker host outside the extension host's subtree. Of the 521 with an entry point the editor made
517 visible and 472 activated without error (91.3 % [88.6–93.4]). The 45 failures are 20
activations still running at the 60 s limit, 15 that threw, 8 that could not resolve a module
they ship against and 2 waiting on an extension dependency the gallery did not supply. Activation
takes a median of 968 ms, p90 2,726 ms.

**When it runs.** 225 of 599 (37.6 % [33.8–41.5]) declare `*` or `onStartupFinished`: they run at
every editor start, before any file is opened. Weighted by downloads that is 51.8 % of the
sample — the extensions that run unconditionally are the ones people install. A further 77
declare no `activationEvents` beside an entry point and are activated implicitly from what they
contribute, which is not every start; 125 wait on a language, 56 on a file in the workspace, and
only 61 (10.2 % [8.0–12.9]) wait on a command, a view or a URI.

**At install.** For this population install is the editor unpacking the archive and resolving
declared dependencies from the gallery, nothing more: no package manager, no install script, and
no program executed beyond the editor itself. 42 of 599 (7.0 % [5.2–9.3]) leave more than one
extension behind, the gallery serving the dependencies from `open-vsx.org`,
`openvsx.eclipsecontent.org` and `raw.githubusercontent.com`. Over the 591 universal downloads
the registry's published sha256 matched the bytes fetched in all 591.

**At activation.** Of the 472 that activated cleanly, 31 (6.6 % [4.7–9.2]) contacted a host that
the baseline editor does not; 5 more reached the network and then failed to activate, so 36 of
the 517 visible extensions opened a connection at all. 14 more spoke only to a loopback port of
their own. Three contacted a host whose business is telemetry. 17 (3.6 % [2.3–5.7]) opened and
read a credential or another tool's configuration — `~/.claude.json` by five of them,
`~/.cursor/mcp.json` by three, and one each of `~/.aws/credentials`, `~/.aws/config`, `~/.netrc`,
`~/.config/gh`, `~/.ssh/config`; the shell profiles `~/.profile`, `~/.bashrc` and `~/.zshrc` were
read by four, three and one. 55 (11.7 % [9.1–14.9]) executed a system program, most often `sh`
(39) and `git` (19), and 37 (7.8 % [5.7–10.6]) ran a program they ship — almost always a language
server over stdio. 16 (3.4 % [2.1–5.4]) wrote or created files in the workspace, and 7 read the
content of the workspace's `.env`.

**With activation left to the editor.** All 121 cells that did something beyond the editor's
baseline were run again with the driver forcing nothing, opening the workspace files and
recording whether the extension's own events had activated it. Of the 77 that declare `*` or
`onStartupFinished`, 55 were active when the window closed; of the 22 that were not, 8 had also
failed to activate when forced. The other 14 activate on a slower schedule than the driver's
window — files opened and ten seconds of idle on a one-CPU host — so the re-run is a floor and
not a rate: at least 55 of the 77 run without being asked. Of the 43 whose events name a
language, a file or a command, 11 activated on what the workspace happened to contain. Where an
extension contacted a host when forced and activated naturally, it contacted the same host again
in 11 cases of 15; the four that did not are `ShuvamRaghuvanshi.server-status-indicator`,
`yychuiyan.dsh-for-web`, `meanwhile-dev.meanwhile` and `imgildev.vscode-python-generator`, whose
first call is on a timer longer than the window.

**Writes into another agent's directory.** Fifty-three of the cells wrote somewhere outside
their own storage, and each was re-run keeping its decoy home, so what they left can be read
rather than inferred from the path. Twelve left files inside the home directory of a different
tool — `~/.agents`, `~/.cursor`, `~/.claude`, `~/.copilot`, `~/.cline`, `~/.trae-cn`,
`~/.config/Code/User`, `~/.config/gh` — and eleven of the twelve do it at every editor start.
They carry 203,667 downloads between them. Two more created a directory there and left no file
in it (`claudine.claudine` in `~/.claude/ide`, `gauravmehta13.ag-multi-account-switchboard` a
lock directory in `~/.gemini/antigravity-ide`).

For most of the twelve it is what the extension is for and its own documentation says so:
Varterm's readme names `~/.cursor/varterm-autoread.json` as where its on/off state lives,
Zencoder's names the Skills it installs under `~/.agents/skills` (39 files),
`toadyokai.flow-to-skill`'s readme the skill it exports there (30 files), swarmify's changelog
`~/.agents/.cache`. The rest do not.

What the kept homes hold is mostly executable. `trae-jsharness.jsharness` (3,002 downloads)
leaves `~/.trae-cn/hooks.json` and three scripts beside it — `agent-call-logger.js`,
`session-userPromptSubmit.js`, `agent-cache-flusher.js` — plus a rule file in
`~/.trae-cn/user_rules/`, and writes `AppData/Roaming/Trae CN/User/mcp.json`, a Windows path
created literally in the home directory of a Linux host. `guggit.reco-bitech-cursor` (5,758)
installs a `post-commit` and a `prepare-commit-msg` git hook into `~/.aipush/hooks/` with the
scripts they call, `post-commit-upload.cjs` among them. `mcp-feedback.mcp-feedback-enhanced`
adds its own entry to `~/.cursor/hooks.json` and a rule file to `~/.cursor/rules/`.
`ashfaqe.claude-room` leaves `~/.claude/team-usage/usage-logger.js` and points Claude Code's
`settings.json` at it, so the script runs on every status-line render; the consent prompt in its
code is reached only when some other status line is already configured, so a user who has none
is never asked. `Veverke.chatwizard` writes a global instructions file for Copilot at
`~/.copilot/instructions/chatwizard-global.instructions.md`. `intraview.intraview` writes
`~/.cursor/mcp_settings.json` and unpacks a command-line client of its own into
`~/.intraview/bin/`; its source builds the paths of Windsurf's and Roo Code's MCP configuration
beside Cursor's.
`devcoreai-coding-agent.devcoreai-coding-agent` writes Cline's own
`~/.cline/data/globalState.json` and installs a Python tool under `~/.local/share/uv/tools/`.

`quickdb.quickdb` (12,434 downloads) describes itself as "Lightweight database browser for VS
Code. Connect to databases, browse tables, and run queries." Its bundle is obfuscated behind a
string table, and inside it is a list of configuration paths — Claude Code's `~/.claude.json`,
Claude Desktop's, Cursor's `~/.cursor/mcp.json`, VS Code's own `~/.config/Code/User/mcp.json`,
with Kiro, Windsurf and Antigravity among the paths it builds — walked by a routine whose own
log strings call it `[McpVersionSync]`: it reads each file, and where its entry is stale it
rewrites it. In the kept home the file it created is `~/.config/Code/User/mcp.json`, the one of
those paths that did not already exist. In the same activation it read `~/.aws/credentials` and
`~/.aws/config` and probed the cloud instance-metadata addresses `169.254.169.254` and
`metadata.google.internal`, which is what a database driver's credential chain does. Nothing in
its description mentions registering itself with four assistants. It declares no
`activationEvents`, so this happens on implicit activation rather than at every start.

**What else the source shows.** `meanwhile-dev.meanwhile` creates `~/.deadtime/install_id`, a
persistent UUID at mode 600, and sends it to `trymeanwhile.online` with a per-session UUID, a
running count of document edits and a SHA-256 of the open workspace folder paths, polling while
the editor is open; its readme says editor activity never leaves the machine.
`kwai-fe.kwai-aicode` runs `yarn global add` for two packages at every editor start and reports
`git user.name`, the current branch and the origin remote to a Kuaishou endpoint.
`gauravmehta13.ag-multi-account-switchboard` reads the whole process table with `ps -A -ww` twice
and runs `sqlite3` against the IDE's own state database to recover an auth status and CSRF token.
`huydo862003.typedown-vscode` ships no binary and downloads its language server from the
publisher's GitHub releases on first activation, marks it executable and runs it, which neither
its readme nor any setting mentions. `oh-my-commit.oh-my-commit-vscode` copies a 5 MB bundled
provider into `~/.oh-my-commit/providers/official/` at every start and executes it from there
through a bundled module loader, and writes its merged preferences — a structure whose schema
includes an `apiKeys` map — to `~/.oh-my-commit/preference.json`. `TI.devspacesplus` obtains every
environment variable by `execSync('echo $VAR')` through `/bin/bash`, and off a Gitpod workspace
throws at module scope and never activates. `alexbeatnik.manul-engine-extension` looks for its CLI
with `bash -l -i -c`, a login *and* interactive shell, which sources the user's own rc files.

## Limits

- One host, one day, one platform (linux-x86_64). Agents that need a real credential to start
  stop at `auth_required` or fail; that is recorded, not lost. Ten seconds of idle after the
  handshake; anything slower is not seen.
- Paths, hosts and program names, never contents or payloads. A read of `~/.env` is a read;
  what is done with it is not observed.
- The decoy home is bound at the real `$HOME` path so traces read like a developer's; it holds
  no real secret.
- The ACP comparison is like for like on the handshake only; the registry probe runs on GitHub
  Actions with its own environment, so `process_error` there and success here can be an
  environment difference, not an agent change.
- Zed: the command an extension would run is recovered from its source, not observed in Zed;
  the resolution is recorded per cell and unresolved cells are counted, not guessed.
- Connections made over IPv4-mapped IPv6 sockets are recorded with a truncated address and not
  joined to a DNS name (the parser is mcp-install's, unchanged); the names are in each cell's
  `dnsNames`. Under CPU contention strace slows downloads by two orders of magnitude; the cells
  affected were re-run alone.
- Open VSX: the extension host is shared, so a declared dependency's activity is in the same
  subtree as the sampled extension's and is attributed to the cell. Two of the cells are only
  that — `zardoy.inline-debugger`'s npm execs and its one connection to `cdn.jsdelivr.net` come
  from `zardoy.ide-scripting`, which the editor activates first, and the dashbuilder editor's
  fetch of `www.schemastore.org` from `redhat.vscode-yaml`. Where the source of the sampled
  extension does not account for something the trace recorded, that is what it usually is.
- Open VSX: activation is forced by the driver, so the measure is activation behaviour and the
  join with `activationEvents` is what says how often it happens unprompted. A version measured
  on the day can stop being downloadable afterwards: `huydo862003.typedown-vscode` 0.34.1 was
  gone four days later, only 0.38.x remaining, so its source was read at the later version.