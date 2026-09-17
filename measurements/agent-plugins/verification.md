# Verification before any report

Adversarial pass over [findings.md](findings.md), 2026-09-16/17. Each concern below was given
its own measurement or its own reading of the source; the corrections were written into
findings.md before anything was published. The first pass covered the ACP section, where the
instrument is compared with someone else's measurement; the second the other three arms.

## 1. ACP: the agreement count and the two cells that needed a second run

Recomputed from `results/cells-acp.ndjson` joined to the registry's `latest.json` and
`quarantine.json`, independently of the section's draft.

- Agreement rule: same distribution as the matrix probe (`npx` → our npm cell), `initialize`
  equal, `session/new` equal, the matrix's `not_probed` counted equal to our absent status. On
  the first file (42 cells) 32 agents were comparable: 31 agree, 1 disagrees (cortex-code).
  `cline` and `junie` were not comparable until their own runs.
- The first section had written "33/34" ahead of those two runs. It also said sigit's binary
  "matched": the matrix probes sigit by `npx`, so only goose's binary is a like-for-like match.
  Corrected.
- cortex-code: `latest.json` says `initialize.message = "Extraction failed"`, `commandPreview
  null`, `processExitCode null` — never launched. The registry's `verify_agents.py` extracts
  with `tarfile.extractall(filter="data")`; the linux-amd64 archive contains the absolute
  symlink `reladiff-venv/bin/python3.12 -> /usr/bin/python3.12`, which the `data` filter
  refuses. Our harness extracted with GNU tar and the binary ran. The first draft called this
  "an environment difference"; it is an archive/extractor interaction, and findings.md now says
  so.
- cline's `ETARGET`: `npm view` gives `@ai-sdk/anthropic@4.0.56` published
  2026-09-16T21:39:10Z; our install started 21:38:51Z; `ai@6.0.284` and
  `@ai-sdk/gateway@3.0.195`, which request it, were published 21:38:07–21:38:40Z;
  `cline@3.0.61` (published 2026-09-02) has no direct dependency on `@ai-sdk/anthropic`. A
  publish-ordering race inside one monorepo release, reached through floating transitive ranges
  — not, as first written, "a transient registry inconsistency at the pinned version", and the
  version was served twenty seconds later, not "an hour later". The second run installed in 104
  s and produced no `node_modules/.bin/cline`; reproduced outside the sandbox (npm 10.9.8 links
  `jiti`, `nanoid`, `semver` … and not `cline`, whose `bin/cline` exists in the tarball). The
  harness now runs the package's declared bin path when the link is absent and records it in
  `notes`; the third run of cline agrees with the matrix.
- junie: the 332 MB archive downloaded at ~236 KB/s under strace while the Cursor batch shared
  the single CPU (curl timed out at 240 s and at 1,000 s); the same URL fetched in 8.7 s
  outside the sandbox. Re-run alone at the end. The instrument's ptrace overhead under CPU
  contention is a limit, recorded in findings.md; every other cell of the Cursor batch that ran
  without a handshake in that window (22:11–22:29 UTC) was re-run alone as well.

## 2. ACP: the quarantine table

- `quarantine.json` is read by `update_versions.py` and `verify_agents.py` (skip) and not by
  `build_registry.py`: quarantine freezes the pin and skips the probe, and does not delist. The
  CDN `registry.json` of 2026-09-16 lists all eight quarantined agents; the first draft said
  seven. Corrected.
- Three reasons name a version other than the pin: crow-cli "0.1.25" (pinned 0.1.24), qoder
  "0.2.15/0.2.16" (pinned 0.2.14), mistral-vibe's inaccessible URL was the updater's, not
  2.24.1's (git log: "Quarantine crow-cli 0.1.25 auto-update", "Quarantine qoder auto-update",
  mistral-vibe pinned 2026-08-11 and quarantined 2026-08-18). At the pin these are untestable
  by construction; the first draft counted them as "not reproduced". The table now separates
  the five reasons about the pinned version (two hold, two do not, one is platform-bound) from
  the three about a refused update.
- fast-agent's pin moved 0.9.30 → 0.10.1 (commit 7aeedb1, 2026-08-14) while quarantined:
  quarantine does not stop manual bumps. Added.
- agoragentic's `postinstall.js` (npm pack, read): `console.log` of a banner, nothing else. Its
  `initialize` answers `authMethods: [{type: "terminal", description: …}]` without `id` or
  `name`; the harness normalised it to `[{}]`. Added as a schema-invalid entry.

## 3. ACP: every host, read from the source

Each host contacted at first start was looked up in the agent's own package or binary (`npm
pack`, the vendor's release archive, `strings`) or its vendor documentation. Changes:

- `47.116.170.246` (minimax-code) is not "a bare address with no DNS name": the cell's
  `dnsNames` holds `agent.minimaxi.com`, which resolves to that address (the harness did not
  join the lookup to the connect); it is MiniMax's cn-region host, default when `MAVIS_REGION`
  is unset, serving API, login and observability endpoints alike. Moved out of the telemetry
  list with that caveat; the count became 9 hosts in 7 agents.
- `sg-pum.alibabachengdun.com` (qoder) is not a download. The string is absent from qoder's
  JavaScript (a 30,487-entry obfuscated string table) and present in an x86-64 ELF embedded as
  base64 in `bundle/qodercli.js` (652,488 bytes decoded; an aarch64 twin), together with
  `us-pum.alibabachengdun.com/repPc.json`, `pum.m.taobao.com/repPc.json`, `dmidecode`, `sgsdk
  returned empty token` — Alibaba's UMID / SecurityGuard device-fingerprint report, run at
  first start to obtain a `machineToken`. Given its own paragraph.
- `unleash.codeium.com` (devin) fetches `client/features` only — feature flags, not telemetry;
  kept in the list under that name. `api.workos.com` (factory-droid) is WorkOS AuthKit,
  Factory's identity provider (`workosBaseUrl`, hard-coded client ids in `bin/droid`);
  `openrouter.ai` (dirac) and `models.dev` (kilo) are third-party services. The "own API"
  bullet now says so.
- `github.com` in codex-acp is `git ls-remote` / `git fetch` of `openai/plugins` — the Codex
  CLI syncs OpenAI's curated plugin marketplace at startup (`core-plugins/src/startup_sync.rs`
  in rust-v0.154.0; fallback `chatgpt.com/backend-api/plugins/export/curated`). Moved to
  *Downloads*; it also explains the `~/.netrc` reads: libcurl inside `git-remote-https`
  (`CURL_NETRC_OPTIONAL`), twice per process, reproduced under strace.
- `release-assets.githubusercontent.com` in github-copilot-cli is a self-update
  (`/repos/github/copilot-cli/releases/latest`, asset into `~/.cache/copilot/pkg`);
  `registry.npmjs.org` in github-copilot is `discoverCLI` installing `@github/copilot` by
  `npx`; in opencode and kilo it is a background `npm install` of `@opencode-ai/plugin` into
  every config directory. `lspci` in gemini is `ClearcutLogger.refreshGpuInfo()`. cortex-code
  also initialises Datadog metrics with a 15 s flush, outside the 10 s window. All added.
- The bullet "13 contact only their own API or nothing" was arithmetic on the wrong sets.
  Rewritten with explicit classes and members.

## 4. ACP: what "reads" means, and the dotenv walk

`trace.ts` counts an open for reading and marks `contentAccessed` on success; `read()` is not
in the strace filter. For every file named in the section the source confirms it is parsed, so
the sentence "a read is a successful open for reading; the sources confirm each is parsed"
replaced "a read is a read of the file's content".

- `~/.env` by five agents: all five probe `~/proj/.env` first (ENOENT) and reach `~/.env` by
  walking up from the workspace — python-dotenv's `find_dotenv` (crow-cli), dotenvy's `Finder`
  (vtcode), gemini-cli's `findEnvFile` (gemini, qoder), qwen-code's `findEnvFiles`; gemini,
  qoder and qwen-code also fall back to `~/.env` explicitly. The workspace is a child of
  `$HOME` here, so "in the home directory, not the project's" described the decoy layout, not
  an agent choice; rewritten. What they do with it, from the source: crow-cli, vtcode, qoder
  and qwen-code put every key into the agent's environment; gemini in an untrusted folder keeps
  only `GEMINI_`/`GOOGLE_` keys. fast-agent probes `~/proj/.env` 16 times and never `~/.env`.
- `~/.claude/.credentials.json` (claude-acp, 8) and `~/.codex/auth.json` (codex-acp, 10) are
  failed opens (`enoent`, `contentAccessed: false`): the files do not exist in the decoy home.
  "reads … 8 times" became "tries to open … 8 times; nothing is read".
- `~/.claude/plugins`: probed by grok-build only, ENOENT; devin and kimchi never touch it, and
  kimchi does not read `~/.claude/settings.json`. The sentence was corrected to what each of
  the three reads.
- `~/.config/gh` (github-copilot-cli): `gh` is spawned twice; with gh 2.46.0 and a `hosts.yml`
  in the old format, `gh auth token` rewrites `hosts.yml` into the multi-account format and
  creates `config.yml` — 4 reads, 2 writes, reproduced. Added to the writes bullet.
- minimax-code's `~/.bashrc`: the write is in the trace; the function is `Rka` in
  `chunks/chunk-CSEMCTUO.js` (not `chunk-V265NCK2.js` as first written), appending `# Added by
  MiniMax Code` and `export PATH="<data dir>/bin:$PATH"` once, guarded by the marker.
  codebuddy-code and dimcode spawn a login shell; minimax-code does not (it reads the file to
  append to it); dimcode reads `~/.profile`, not `~/.bashrc`. Corrected.
- mistral-vibe's `gcc`/`ld`/`ldconfig`: `ctypes.util.find_library` probing for the macOS
  frameworks Security, CoreServices and Foundation, requested at import by the `keyring` macOS
  backend bundled into the Linux binary — `ldconfig -p`, `gcc -Wl,-t … -l<name>`, `ld -t -o
  /dev/null -l<name>`, reproduced under strace; nothing is compiled. "compiles something on
  first start" was wrong and is gone.
- "Writes outside their own directory" had listed codex-acp, opencode and claude-acp; those are
  their own directories. Only minimax-code, qoder and, through `gh`, github-copilot-cli write
  outside.
- "Every agent above … passed the registry's check": four of them (mistral-vibe, crow-cli,
  qoder, vtcode) are quarantined and not probed at all, so they did not pass anything. The
  paragraph now says what the check covers for the 34 and what it skips for the 8.

## 5. Numbers restated after the two late cells

With cline (third run) and junie (run alone) in the file: 44 cells, 44 started, 43 `initialize`
(minion-code the exception); 34 comparable with the matrix, 33 agree, cortex-code the one
disagreement; 12/23 npm cells run install scripts (cline's `postinstall.mjs` and protobufjs's
were the additions); 22/42 agents contact a non-loopback host before a prompt — cline, on its
third run, added `otel.cline.bot` (an OpenTelemetry collector) to the telemetry list and
`registry.npmjs.org` to the installs-at-start list; junie added `junie.jetbrains.com`,
`resources.jetbrains.com` and probes of the LM Studio (1234) and Ollama (11434) ports. Two
entries in junie's `net.hosts` are IPv4-mapped IPv6 addresses that `trace.ts` records truncated
(`0:0:0:0:0:0:ffff:3`) and does not join to a DNS name; the names are in `dnsNames`. The parser
is mcp-install's, kept unchanged for comparability; the limit is recorded in findings.md.

## 6. Does the sandbox change what an agent does?

Four ACP cells re-run unconfined (`NL_NO_BWRAP=1`: the real host, `$HOME` pointed at the decoy
directory, no namespaces): cortex-code, gemini, devin, qoder — chosen for telemetry, the
fingerprint and the reads of other agents' configuration. Handshake outcome, hosts contacted,
decoy files opened and programs executed were identical in all four
(`/var/tmp/nl-agent-plugins/cells-acp-unconfined.ndjson`, not published). One difference:
gemini's `lspci` did not fire in the unconfined run — the GPU probe is asynchronous and lands
inside or outside the window by timing.

## 7. Is ten seconds enough?

Five ACP cells re-run with a 60 s idle window (`NL_IDLE_MS=60000`): cortex-code, claude-acp and
three that had contacted nothing (kimi, harn, amp-acp). No new host in any of the five; the
three silent ones stayed silent; claude-acp only wrote more `~/.claude.json.tmp.*` files.
cortex-code's Datadog metrics client, which the binary configures with a 15 s flush, did not
appear at 60 s either — the findings text was softened from "fell outside the 10 s window" to
"not seen at 10 s nor at 60 s". Ten seconds is short; on this sample it did not hide anything
that a minute would have shown.

## 8. Cursor, Devin, Zed: the second pass

The same exercise over sections 2–4: every number recomputed from the cells, every named hook
read in its repository at the pinned commit, every Zed resolution read against the extension's
Rust, Devin's failures read against the manifests. What changed:

- Declarations were counted per manifest file, not per server: 35 remote and 4 stdio entries
  are the same server read from `mcp.json` and `.mcp.json`. "296 servers on 232 hosts" became
  296 declarations, 261 distinct, on 219 concrete hosts plus 15 user-variable hosts; "67
  servers" became 67 declarations, 63 distinct; 45 handshakes are 43 distinct servers; two AWS
  plugins ran their proxy twice. The plugin-level rates are unaffected.
- Hooks: 112 declared, 95 run (the draft had 95 declared); mem0 declares 29 across three
  editors' files, not 15. The instrument collects every hooks file and ignores `matcher` fields
  — revyl's `beforeShellExecution` is matched to commands containing `revyl`, prisma's to `^git
  commit`, jfrog's `preToolUse` to `Read`, vercel's `SessionStart` to
  `startup|resume|clear|compact` — so "before every shell command" (revyl) was wrong and is
  gone; jfrog's `beforeSubmitPrompt` has no matcher and the phrase stands for it.
- What the four downloading hooks fetch, from their scripts: revyl pins by tag and sha256 and
  caches; corridor pipes `install.sh` from `app.corridor.dev` into `sh`, version from a URL,
  and also edits the shell profile's PATH; monk fetches `-latest` and re-checks it every
  session start (the artefact behind the URL changed within hours of the run); jfrog runs `npx
  --yes @jfrog/agent-guard` (unpinned, a 35 MB static ELF) — not "the JFrog CLI", and its
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
- The AWS proxy is five plugins (seven entries), and `~/.aws/credentials` is read by eight
  plugins, not seven servers; two different snyk plugins were conflated; opensearch's AWS
  server also reads `~/.netrc`.
- Devin: aws-agent-toolkit's failure is the instrument's — the plugin's `${VAR:-}` empty
  default was replaced by a dummy profile name (the runner now honours `:-` defaults); dbt,
  metabase and unleash reject dummy values, so five of the nine failures are the run's, not the
  plugins'; 26 of 27 contacted their index (google-analytics's source is a git URL); netlify's
  "two bare Cloudflare addresses" are `registry.npmjs.org` unjoined; the interval for 120/171
  is [62.9–76.5]; `awslabs.lambda-mcp-server` is uninstallable as declared because every
  release is yanked, not "at all"; aws-dynamodb writes a log under `~/.aws`.
- Zed: the source heuristic mis-resolved 9 extensions (wrong package for gem, wrong entry for
  polar, missing `--mcp` for repomix, missing `server start` for azmcp, literal relay URLs it
  did not carry); terraform downloads from `releases.hashicorp.com`, where the linux archive
  exists; axiom's binary was plainly named; 5 of 73 declared repositories are not the
  extension's source; the two `@azure/mcp` cells send to Application Insights and probe the
  instance-metadata address, so egress is 8 of 58; `~/.npmrc` is read by two servers; mysql
  answered `initialize` but not `tools/list`; zeroheight launches an OAuth flow through
  `xdg-open` at first start. The section now says "the harness did not identify" where it said
  "could not be identified".
- Hygiene: three cells carried the workspace path URL-encoded or dash-joined by the agent under
  test (grok-build, poolside, qoder) and one stderr line carried the host's name; both are
  rewritten in the published cells and the runner now rewrites the encoded forms and sets the
  sandbox hostname. The registries' author e-mail addresses were stripped from the population
  and cell files; nothing in the findings depends on them.

Two instrument gaps stay as limits rather than re-runs: hook `matcher` fields are ignored, and
the Cursor hooks and MCP declarations are collected from every file a plugin ships rather than
the one Cursor loads. Both inflate counts of runs, not the plugin-level rates.
## 9. Wordings corrected while preparing the reports

- Cursor: "eight plugins" read `~/.aws/credentials` was eight server starts across seven
  plugins; opensearch-agent-skills declares two AWS servers. The rate sentence now says seven.
- Zed: maho-lsp's declared repository (`mahocommerce/maho-zed`) was described as "moved". GitHub
  redirects renamed repositories and returns no redirect for this one, and the extension's first
  commit in `MahoCommerce/zed` (2026-04-04) already declared the other name; it never existed
  under that name. The sentence now says so.
- ACP: the fingerprint sentence said the qoder binary reads the baseboard serial "through
  `dmidecode`". That is what its strings say; `dmidecode` does not appear among the executed
  programs in the cell, and the binary run alone under strace on 2026-09-17 (endpoints pointed
  at a local listener) opened `/sys/class/dmi/id/{bios_vendor,bios_version,bios_date,
  board_vendor,product_name,sys_vendor}`, tried `/sys/class/net/wlan0/address` and `/dev/sda`,
  and posted to `/repPc.json` as plain HTTP/1.0 on port 443 with an encrypted body. The sentence
  now separates what the strings name from what was seen.
