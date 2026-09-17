# Additional checks and corrections

Checks run on the same cells after the run, 2026-09-16/17, and the figures in
[findings.md](findings.md) they changed.

## The two late cells re-run and the agreement count

The agreement count was recomputed from `results/cells-acp.ndjson` joined to the registry's
`latest.json` and `quarantine.json`. Agreement rule: same distribution as the matrix probe
(`npx` → the npm cell), `initialize` equal, `session/new` equal, the matrix's `not_probed`
counted equal to an absent status. On the first file (42 cells) 32 agents were comparable: 31
agree, 1 disagrees (cortex-code). `cline` and `junie` were not comparable until their own runs.

- cortex-code: `latest.json` says `initialize.message = "Extraction failed"`, `commandPreview
  null`, `processExitCode null` — never launched. The registry's `verify_agents.py` extracts
  with `tarfile.extractall(filter="data")`; the linux-amd64 archive contains the absolute
  symlink `reladiff-venv/bin/python3.12 -> /usr/bin/python3.12`, which the `data` filter
  refuses. The harness extracted with GNU tar and the binary ran.
- cline's `ETARGET`: `npm view` gives `@ai-sdk/anthropic@4.0.56` published
  2026-09-16T21:39:10Z; the install started 21:38:51Z; `ai@6.0.284` and
  `@ai-sdk/gateway@3.0.195`, which request it, were published 21:38:07–21:38:40Z;
  `cline@3.0.61` (published 2026-09-02) has no direct dependency on `@ai-sdk/anthropic`. A
  publish-ordering race inside one monorepo release, reached through floating transitive
  ranges; the version was served twenty seconds later. The second run installed in 104 s and
  produced no `node_modules/.bin/cline`; reproduced outside the sandbox (npm 10.9.8 links
  `jiti`, `nanoid`, `semver` … and not `cline`, whose `bin/cline` exists in the tarball). The
  harness runs the package's declared bin path when the link is absent and records it in
  `notes`; the third run of cline agrees with the matrix.
- junie: the 332 MB archive downloaded at ~236 KB/s under strace while the Cursor batch shared
  the single CPU (curl timed out at 240 s and at 1,000 s); the same URL fetched in 8.7 s
  outside the sandbox. Re-run alone at the end. The instrument's ptrace overhead under CPU
  contention is a limit, recorded in findings.md; every other cell of the Cursor batch that ran
  without a handshake in that window (22:11–22:29 UTC) was re-run alone as well.

## The quarantine table

`quarantine.json` is read by `update_versions.py` and `verify_agents.py` (skip) and not by
`build_registry.py`: quarantine freezes the pin and skips the probe, and does not delist. The
CDN `registry.json` of 2026-09-16 lists all eight quarantined agents.

- Three reasons name a version other than the pin: crow-cli "0.1.25" (pinned 0.1.24), qoder
  "0.2.15/0.2.16" (pinned 0.2.14), mistral-vibe's inaccessible URL was the updater's, not
  2.24.1's (git log: "Quarantine crow-cli 0.1.25 auto-update", "Quarantine qoder auto-update",
  mistral-vibe pinned 2026-08-11 and quarantined 2026-08-18). At the pin these are untestable
  by construction. Of the five reasons about the pinned version, two hold, two do not and one
  is platform-bound; the other three are about a refused update.
- fast-agent's pin moved 0.9.30 → 0.10.1 (commit 7aeedb1, 2026-08-14) while quarantined:
  quarantine does not stop manual bumps.
- agoragentic's `postinstall.js` (npm pack, read): `console.log` of a banner, nothing else. Its
  `initialize` answers `authMethods: [{type: "terminal", description: …}]` without `id` or
  `name`; the harness normalised it to `[{}]`. A schema-invalid entry.

## Every host read from the source

Each host contacted at first start was looked up in the agent's own package or binary (`npm
pack`, the vendor's release archive, `strings`) or its vendor documentation.

- `47.116.170.246` (minimax-code): the cell's `dnsNames` holds `agent.minimaxi.com`, which
  resolves to that address (the harness did not join the lookup to the connect); it is
  MiniMax's cn-region host, default when `MAVIS_REGION` is unset, serving API, login and
  observability endpoints alike.
- `sg-pum.alibabachengdun.com` (qoder): the string is absent from qoder's JavaScript (a
  30,487-entry obfuscated string table) and present in an x86-64 ELF embedded as base64 in
  `bundle/qodercli.js` (652,488 bytes decoded; an aarch64 twin), together with
  `us-pum.alibabachengdun.com/repPc.json`, `pum.m.taobao.com/repPc.json`, `dmidecode`, `sgsdk
  returned empty token` — Alibaba's UMID / SecurityGuard device-fingerprint report, run at
  first start to obtain a `machineToken`.
- `unleash.codeium.com` (devin) fetches `client/features` only — feature flags, not
  telemetry. `api.workos.com` (factory-droid) is WorkOS AuthKit, Factory's identity provider
  (`workosBaseUrl`, hard-coded client ids in `bin/droid`); `openrouter.ai` (dirac) and
  `models.dev` (kilo) are third-party services.
- `github.com` in codex-acp is `git ls-remote` / `git fetch` of `openai/plugins` — the Codex
  CLI syncs OpenAI's curated plugin marketplace at startup (`core-plugins/src/startup_sync.rs`
  in rust-v0.154.0; fallback `chatgpt.com/backend-api/plugins/export/curated`). The same sync
  explains the `~/.netrc` reads: libcurl inside `git-remote-https` (`CURL_NETRC_OPTIONAL`),
  twice per process, reproduced under strace.
- `release-assets.githubusercontent.com` in github-copilot-cli is a self-update
  (`/repos/github/copilot-cli/releases/latest`, asset into `~/.cache/copilot/pkg`);
  `registry.npmjs.org` in github-copilot is `discoverCLI` installing `@github/copilot` by
  `npx`; in opencode and kilo it is a background `npm install` of `@opencode-ai/plugin` into
  every config directory. `lspci` in gemini is `ClearcutLogger.refreshGpuInfo()`. cortex-code
  also initialises Datadog metrics with a 15 s flush, outside the 10 s window.

## What "reads" means and the dotenv walk

`trace.ts` counts an open for reading and marks `contentAccessed` on success; `read()` is not
in the strace filter. For every file named in findings.md the source confirms it is parsed.

- `~/.env` by five agents: all five probe `~/proj/.env` first (ENOENT) and reach `~/.env` by
  walking up from the workspace — python-dotenv's `find_dotenv` (crow-cli), dotenvy's `Finder`
  (vtcode), gemini-cli's `findEnvFile` (gemini, qoder), qwen-code's `findEnvFiles`; gemini,
  qoder and qwen-code also fall back to `~/.env` explicitly. The workspace is a child of
  `$HOME` here. What they do with it, from the source: crow-cli, vtcode, qoder and qwen-code
  put every key into the agent's environment; gemini in an untrusted folder keeps only
  `GEMINI_`/`GOOGLE_` keys. fast-agent probes `~/proj/.env` 16 times and never `~/.env`.
- `~/.claude/.credentials.json` (claude-acp, 8) and `~/.codex/auth.json` (codex-acp, 10) are
  failed opens (`enoent`, `contentAccessed: false`): the files do not exist in the decoy home.
- `~/.claude/plugins`: probed by grok-build only, ENOENT; devin and kimchi never touch it, and
  kimchi does not read `~/.claude/settings.json`.
- `~/.config/gh` (github-copilot-cli): `gh` is spawned twice; with gh 2.46.0 and a `hosts.yml`
  in the old format, `gh auth token` rewrites `hosts.yml` into the multi-account format and
  creates `config.yml` — 4 reads, 2 writes, reproduced.
- minimax-code's `~/.bashrc`: the write is in the trace; the function is `Rka` in
  `chunks/chunk-CSEMCTUO.js`, appending `# Added by MiniMax Code` and `export PATH="<data
  dir>/bin:$PATH"` once, guarded by the marker. codebuddy-code and dimcode spawn a login shell;
  minimax-code does not (it reads the file to append to it); dimcode reads `~/.profile`, not
  `~/.bashrc`.
- mistral-vibe's `gcc`/`ld`/`ldconfig`: `ctypes.util.find_library` probing for the macOS
  frameworks Security, CoreServices and Foundation, requested at import by the `keyring` macOS
  backend bundled into the Linux binary — `ldconfig -p`, `gcc -Wl,-t … -l<name>`, `ld -t -o
  /dev/null -l<name>`, reproduced under strace; nothing is compiled.

## Numbers restated after the late cells

With cline (third run) and junie (run alone) in the file: 44 cells, 44 started, 43 `initialize`
(minion-code the exception); 34 comparable with the matrix, 33 agree, cortex-code the one
disagreement; 12/23 npm cells run install scripts (cline's `postinstall.mjs` and protobufjs's
are the two the late cells add); 22/42 agents contact a non-loopback host before a prompt —
cline's third run contacts `otel.cline.bot` (an OpenTelemetry collector), counted as telemetry,
and `registry.npmjs.org`, counted under installs-at-start; junie contacts `junie.jetbrains.com`,
`resources.jetbrains.com` and probes the LM Studio (1234) and Ollama (11434) ports. Two entries
in junie's `net.hosts` are IPv4-mapped IPv6 addresses that `trace.ts` records truncated
(`0:0:0:0:0:0:ffff:3`) and does not join to a DNS name; the names are in `dnsNames`. The parser
is mcp-install's, kept unchanged for comparability; the limit is recorded in findings.md.

## Sandbox versus unconfined

Four ACP cells re-run unconfined (`NL_NO_BWRAP=1`: the real host, `$HOME` pointed at the decoy
directory, no namespaces): cortex-code, gemini, devin, qoder — chosen for telemetry, the
fingerprint and the reads of other agents' configuration. Handshake outcome, hosts contacted,
decoy files opened and programs executed were identical in all four
(`/var/tmp/nl-agent-plugins/cells-acp-unconfined.ndjson`, not published). One difference:
gemini's `lspci` did not fire in the unconfined run — the GPU probe is asynchronous and lands
inside or outside the window by timing.

## The 60 s idle window

Five ACP cells re-run with a 60 s idle window (`NL_IDLE_MS=60000`): cortex-code, claude-acp and
three that had contacted nothing (kimi, harn, amp-acp). No new host in any of the five; the
three silent ones stayed silent; claude-acp only wrote more `~/.claude.json.tmp.*` files.
cortex-code's Datadog metrics client, which the binary configures with a 15 s flush, did not
appear at 60 s either. Ten seconds is short; on this sample it did not hide anything that a
minute would have shown.

## Hygiene rewrites in the published cells

Three cells carried the workspace path URL-encoded or dash-joined by the agent under test
(grok-build, poolside, qoder) and one stderr line carried the host's name; both are rewritten
in the published cells, and the runner rewrites the encoded forms and sets the sandbox
hostname. The registries' author e-mail addresses were stripped from the population and cell
files; nothing in the findings depends on them.

## Corrections

Figures and wordings corrected in findings.md, each with the reason the data required it.

### ACP

- Agreement is 33/34: 34 agents comparable with the matrix, 33 agree, cortex-code the one
  disagreement, with cline's third run and junie's run alone included.
- Only goose's binary is a like-for-like match with the matrix; sigit's binary is not "matched"
  by it: the matrix probes sigit by `npx`.
- cortex-code's disagreement is an archive/extractor interaction, not "an environment
  difference": `tarfile.extractall(filter="data")` refuses the archive's absolute symlink, GNU
  tar does not.
- cline's first-run `ETARGET` was a publish-ordering race inside one monorepo release, reached
  through floating transitive ranges, and the version was served twenty seconds later — not "a
  transient registry inconsistency at the pinned version" and not "an hour later":
  `@ai-sdk/anthropic@4.0.56` was published at 21:39:10Z, the install started at 21:38:51Z.
- Totals with the two late cells: 44 cells, 44 started, 43 `initialize`; 12/23 npm cells run
  install scripts; 22/42 agents contact a non-loopback host before a prompt. cline's third run
  and junie's run alone add the install scripts and the hosts listed above.
- The CDN `registry.json` of 2026-09-16 lists all eight quarantined agents, not seven:
  quarantine skips the probe and freezes the pin, it does not delist.
- crow-cli's, qoder's and mistral-vibe's quarantine reasons are untestable at the pin, not "not
  reproduced": each names a version other than the pinned one; five reasons are about the
  pinned version and three about a refused update.
- Telemetry: 9 hosts in 7 agents. `47.116.170.246` (minimax-code) is not among them and is not
  "a bare address with no DNS name": it is `agent.minimaxi.com`, MiniMax's cn-region host,
  serving API, login and observability endpoints alike.
- `sg-pum.alibabachengdun.com` (qoder) is a device-fingerprint report, not a download: the
  string sits in the embedded ELF next to the `repPc.json` endpoints and `dmidecode`, and the
  report obtains a `machineToken`.
- The "own API" bullet: `api.workos.com` (factory-droid) is Factory's identity provider, and
  `openrouter.ai` (dirac) and `models.dev` (kilo) are third-party services, not the agents' own
  APIs; `unleash.codeium.com` (devin) is feature flags, not telemetry, and is listed as such.
- `github.com` in codex-acp is a download (`git fetch` of `openai/plugins`), listed under
  *Downloads*; it also accounts for the `~/.netrc` reads through libcurl.
- The count "13 contact only their own API or nothing" was arithmetic on the wrong sets; the
  classes and their members are listed instead.
- "a read is a successful open for reading; the sources confirm each is parsed" replaces "a
  read is a read of the file's content": `trace.ts` counts opens, and `read()` is not in the
  strace filter.
- The five agents that open `~/.env` reach it by walking up from the workspace, which is a
  child of `$HOME` in the decoy layout; "in the home directory, not the project's" described
  the layout, not an agent choice.
- "tries to open … 8 times; nothing is read" replaces "reads … 8 times" for claude-acp's
  `~/.claude/.credentials.json` (8) and codex-acp's `~/.codex/auth.json` (10): both are failed
  opens (`enoent`, `contentAccessed: false`), and the files do not exist in the decoy home.
- Only grok-build probes `~/.claude/plugins` (ENOENT); devin and kimchi do not, and kimchi does
  not read `~/.claude/settings.json`.
- minimax-code's `~/.bashrc` append is `Rka` in `chunks/chunk-CSEMCTUO.js`, not
  `chunk-V265NCK2.js`; minimax-code does not spawn a login shell (codebuddy-code and dimcode
  do), and dimcode reads `~/.profile`, not `~/.bashrc`.
- mistral-vibe compiles nothing at first start, not "compiles something on first start":
  `gcc`, `ld` and `ldconfig` are `ctypes.util.find_library` probes for macOS frameworks,
  requested by the bundled `keyring` backend.
- "Writes outside their own directory" lists minimax-code, qoder and, through `gh`,
  github-copilot-cli. codex-acp, opencode and claude-acp were listed and are not: those paths
  are their own directories.
- "Every agent above … passed the registry's check" does not hold: mistral-vibe, crow-cli,
  qoder and vtcode are quarantined and not probed at all; the check covers the 34 and skips
  the 8.
- cortex-code's Datadog metrics client is "not seen at 10 s nor at 60 s", not "fell outside the
  10 s window": the 60 s re-run did not show it either.
- The qoder binary's strings name `dmidecode`; a baseboard serial read "through `dmidecode`"
  was not seen. `dmidecode` does not appear among the executed programs in the cell, and the
  binary run alone under strace on 2026-09-17 (endpoints pointed at a local listener) opened
  `/sys/class/dmi/id/{bios_vendor,bios_version,bios_date,board_vendor,product_name,sys_vendor}`,
  tried `/sys/class/net/wlan0/address` and `/dev/sda`, and posted to `/repPc.json` as plain
  HTTP/1.0 on port 443 with an encrypted body.

### Cursor

- 296 declarations, 261 distinct, on 219 concrete hosts plus 15 user-variable hosts, not "296
  servers on 232 hosts"; 67 declarations, 63 distinct, not "67 servers"; 45 handshakes are 43
  distinct servers, two AWS plugins having run their proxy twice. Declarations were counted per
  manifest file: 35 remote and 4 stdio entries are the same server read from `mcp.json` and
  `.mcp.json`. The plugin-level rates are unaffected.
- Hooks: 112 declared, 95 run, not 95 declared; mem0 declares 29 across three editors' files,
  not 15. The instrument collects every hooks file and ignores `matcher` fields — revyl's
  `beforeShellExecution` is matched to commands containing `revyl`, prisma's to `^git commit`,
  jfrog's `preToolUse` to `Read`, vercel's `SessionStart` to `startup|resume|clear|compact` —
  so revyl's hook does not run "before every shell command"; jfrog's `beforeSubmitPrompt` has
  no matcher and the phrase holds for it.
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
- The AWS proxy is five plugins (seven entries). `~/.aws/credentials` is read by seven plugins
  — eight server starts, opensearch-agent-skills declaring two AWS servers — not "eight
  plugins" and not seven servers; the rate sentence says seven. Two different snyk plugins were
  conflated; opensearch's AWS server also reads `~/.netrc`.

Two instrument gaps stay as limits rather than re-runs: hook `matcher` fields are ignored, and
the Cursor hooks and MCP declarations are collected from every file a plugin ships rather than
the one Cursor loads. Both inflate counts of runs, not the plugin-level rates.

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
  axiom's binary was plainly named. "the harness did not identify" replaces "could not be
  identified".
- 5 of 73 declared repositories are not the extension's source. maho-lsp's declared repository
  (`mahocommerce/maho-zed`) never existed under that name; it was not "moved": GitHub redirects
  renamed repositories and returns no redirect for this one, and the extension's first commit
  in `MahoCommerce/zed` (2026-04-04) already declared the other name.
- The two `@azure/mcp` cells send to Application Insights and probe the instance-metadata
  address, so egress is 8 of 58. `~/.npmrc` is read by two servers. mysql answered
  `initialize` but not `tools/list`. zeroheight launches an OAuth flow through `xdg-open` at
  first start.
