# Additional checks and corrections

Checks run on the same 600 cells after the run, 2026-09-12, and the figures in
[findings.md](findings.md) they changed.

## Design effect

Measured over `results/cells.ndjson`, with publisher key = owner of the GitHub/GitLab repository
where there is one, else the registry namespace.

- 600 cells → **519 namespaces, 488 GitHub owners, 520 publisher keys**. 110 cells share a
  namespace with another; 52 are in namespaces with ≥5 cells.
- Largest cluster: `io.github.CSOAI-ORG`, **21 cells (3.5 %), all PyPI, none starts: 19 broken
  by `mcp` 2.x and 2 by other errors**. Then `cyanheads` 8, `codespar` 7, `chrischall` 6,
  `malamutemayhem` 5, `com.mcparmory` 5.
- Eligible population (11,484): 7,741 namespaces; the three largest add up to 5.2 %. The
  registry's farms (`sadri-dridi` 1,798, `pipeworx-io` 1,321, `mcp-dir` 1,113) **are not in the
  eligible population**: they publish remote-only entries. The largest farm with packages is
  CSOAI-ORG (354, all but one PyPI).
- Templates: of 343 servers with `tools/list`, 341 distinct sets of tool names; 2 identical
  pairs (`brave-mcp` and `@async23/chrome-devtools-mcp` are forks of Google's
  `chrome-devtools-mcp`; two servers by `@ellul-estate`). The "95 packages" tree size in 144 npm
  cells is the SDK's dependency tree, not a template.

Intervals with cluster-robust (publisher) variance against iid Wilson:

| rate | k/n | Wilson | cluster-robust | DEFF |
|---|---|---|---|---|
| npm: tree with an install script | 51/404 | [9.7–16.2] | [9.3–16.0] | 1.06 |
| first start: handshake ok | 347/579 | [55.9–63.8] | [54.3–65.5] | 1.97 |
| **PyPI: broken by `mcp` 2.x** | 53/175 | [24.0–37.5] | **[15.9–44.7]** | **4.49** |
| PyPI: `pypi.org` at start (fastmcp) | 21/175 | [8.0–17.6] | [5.0–19.0] | 2.13 |
| first start: any egress | 47/579 | [6.2–10.6] | [5.4–10.8] | 1.47 |
| telemetry | 4/579 | [0.3–1.8] | [0.0–1.4] | 1.01 |
| decoy opened | 18/579 | [2.0–4.9] | [1.7–4.5] | 1.02 |
| `~/.env` read | 9/579 | [0.8–2.9] | [0.5–2.6] | 1.01 |
| writes state outside caches | 30/579 | [3.7–7.3] | [3.3–7.0] | 1.04 |

The design effect matters only for the 30 % headline: **19 of the 53 broken cells are one
operator.** Without CSOAI-ORG: 34/154 = 22.1 %. At publisher level: 34 of 143 PyPI publishers
(23.8 %) have at least one broken server; mean of publisher means 23.0 %. The other rates have
DEFF ≈ 1.

## Sample representativeness

The ordering is `sha256(seed + type::identifier)`: independent of any attribute, equivalent to
simple random sampling without replacement within each type. Checked over 11 observable
covariates of the eligible population (`io.github` namespace, repo, website, declared
environment variables, arguments, `runtimeHint`, multiple entries, publication month,
placeholder version, npm scope): **every sample–population difference has |z| < 2** on npm and
on PyPI. Share of cells from namespaces with ≥50 packages: npm 4.5 % population / 5.2 % sample;
PyPI 13.9 % / 16.7 %. The distribution by publication month matches point by point (±3 points).
No ordering bias.

## placeroot and the HTTP download

Minimal reproducer, outside the harness (a clean venv, `placeroot==0.10.0`, duckdb 1.5.5, and
the two statements `placeroot/db.py:106` runs: `INSTALL httpfs; LOAD httpfs;`, under
`strace -e trace=network,file`).

- **Plain HTTP: yes.** `GET /v1.5.5/linux_amd64/httpfs.duckdb_extension.gz HTTP/1.1` to
  `extensions.duckdb.org` port 80. It is the default repository **compiled into DuckDB**
  (`CORE_REPOSITORY_URL = "http://extensions.duckdb.org"`,
  `src/include/duckdb/main/extension_install_info.hpp:91`); placeroot neither configures a
  repository nor touches `allow_unsigned_extensions` (stays `false`).
- **Executed: yes**, it is a shared library loaded into the process (`LOAD`).
- **Signature: yes.** DuckDB checks an RSA/SHA-256 signature against built-in keys before
  writing the file (`extension_install.cpp:228`) and on every `LOAD`. Test: alter one byte of
  the downloaded file → `LOAD httpfs` fails with "signature is either missing or invalid". The
  HTTP channel protects neither confidentiality (which extension and version whom installs) nor
  against a downgrade to another signed version, but it does protect integrity.
- **Normal path, not a fallback:** `server.main()` → `_warm_metadata_async()` (daemon thread at
  start) → `overture.warm_metadata` → `db.shared_conn()` → `_configure()` → `INSTALL`.
- **Prior art:** documented DuckDB design ("DuckDB extensions are checked on every load using the
  signature of the binaries"; the security guide only advises against *unsigned* extensions over
  HTTP). On GitHub, duckdb/duckdb#22295 (closed 2026-04-27) touches the `IsHTTP()` logic on that
  path.

Not a finding about placeroot or about MCP. Not reported to anyone.

## The registry's `status` field and python-sdk#3309

- The registry is maintained by the *Registry Working Group* (README): Radoslav Dimitrov
  (Stacklok, lead), Tadas Antanavicius (PulseMCP), Bob Dickinson (TeamSpark), Preeti Dewani
  (Ravenmail). The Python SDK is maintained by modelcontextprotocol/python-sdk.
- Channel: FAQ, "If you encounter any issues, please report them on GitHub (issues)";
  discussions; Discord `#registry-dev`. The moderation policy lists **"Non-functioning
  servers"** among what they do remove.
- `active` is the default value of the `status` field at publish time; the other values are
  `deprecated` (set by the publisher) and `deleted` (publisher or admin). The registry does not
  claim that a server works — on the contrary, "consumers should assume minimal-to-no
  moderation".
- Precedent: python-sdk#3309 (2026-08-14, label v2, open, 6 comments): an author of two listed
  servers describes exactly the mechanism ("the day 2.0.0 shipped, fresh installs of our
  published servers started resolving mcp==2.0.0 and crashed at import") and asks for guidance
  on supporting 1.x and 2.x at once. Nobody had quantified how many servers it affects. No issue
  about it on the registry.

The quantification was posted on python-sdk#3309, with the publisher-level figure and the
CSOAI-ORG caveat ([results/python-sdk-3309-comment.md](results/python-sdk-3309-comment.md)).
The list of non-functioning servers has not gone to the Registry Working Group.

## Dummy credentials

A disposable read-only token (created and revocable by the repository owner; only the variable
name reaches the results, checked by grep; local copy destroyed). The four servers with
`GITHUB_TOKEN` (`standupbot-mcp`, `github-issue-mcp`, `hotin`, `@barissozudogru/gha-intel-mcp`),
30 s idle, dummy vs real: **4/4 identical** — handshake, same number of tools, zero connections,
zero `$HOME` accesses on both. The token is only used when tools are invoked. n=4 and a single
provider: the test rules out that the dummy credential *suppresses* start-up activity in servers
that start; it says nothing about those that abort.

Bound without a test: 28 cells aborted the start on credential validation and 42 on an
exception; for them the first start *was not observed*. First-start network and `$HOME` rates
are given over the 347 servers that started as well as over 579.

## Idle window

Design: 40 servers (the 10 with non-trivial egress + 30 at random with a successful handshake),
same harness with the outer process's cap scaled to the idle window (fixed at 90 s in the run),
**120 s** idle. The set of hosts is compared against the original run.

Result: **40/40 handshake; 39/40 with the same set of hosts** as at 10 s; the only change is
`placeroot`, which keeps downloading from the same Overture S3 bucket (additional IPs of the
same bucket) and writes `~/.cache/placeroot`. None of the 10 servers with non-trivial egress
(telemetry, remote config, version checks) contacted a new host between 10 s and 120 s. Not
covered: timers longer than 120 s.

## Sandbox

Design: 20 random servers with a successful handshake, **without bubblewrap** (`env -i`, `$HOME`
pointed at the decoy directory, same trace). Hosts and `$HOME` prefixes compared. Caveat: without
bwrap the headers are not mounted under `/usr/include`, so this does not apply to source builds
(none in the PyPI sample, 5.2 % in npm).

Result: **20/20 identical**: handshake, number of tools, set of hosts and `$HOME` prefixes with
content opened match between bubblewrap and unconfined execution. No evidence of sandbox
detection in the sample; a server detecting `ptrace` would change in both arms alike, and that
is not covered.

## What the 175 declare about `mcp`

Read from PyPI metadata (`Requires-Dist` of each installed `name==version`), no reinstall. 119 of
175 declare `mcp` as a direct dependency. Forms: 71 with a lower bound `>=1.x` only (none of them
starts: 51 broken by 2.x, 20 with another failure); 26 with a ceiling below 2 (22 start, 0
broken); 17 require 2.x (13 start); 5 unconstrained (5 start, already on the 2.x API); 56 with
no direct dependency (24 through `fastmcp`). That is, 15 % of the installed pin `mcp<2`, and all
the damage sits in the 41 % that set a floor and no ceiling. Cell by cell, CSOAI-ORG is 19 of
the 53 with this error, not 21; all 21 sampled fail, 2 with other errors. Table in
[findings.md](findings.md), data in `results/pypi-mcp-requirements.json`.

## Corrections

Each entry: the statement as it stands in [findings.md](findings.md), and why the data required
it.

- **"Between a fifth and a third" of the PyPI servers in the official registry do not start,
  depending on whether one counts by package or by publisher; one operator contributes 19 of
  53** — in place of "a third". 53/175 = 30.3 % by cell, but 19 of the 53 are
  `io.github.CSOAI-ORG`: the cluster-robust interval is [15.9–44.7] with DEFF 4.49 against
  Wilson [24.0–37.5]; without that publisher 34/154 = 22.1 %; by publisher 34/143 = 23.8 %.
- **CSOAI-ORG is 19 of the 53, not 21.** 21 of its cells were sampled and none starts, but 2
  fail with other errors; the cell-by-cell cross-check of `Requires-Dist` against the start error
  separates them. The comment on python-sdk#3309 had said "21 of the 53" and "all 21 I sampled
  failed the same way"; the correction went out as a follow-up comment
  ([results/python-sdk-3309-comment-2.md](results/python-sdk-3309-comment-2.md)), not as an
  edit.
- **The registry's `status` field shows them as `active`, which is its default value at publish
  time and not a claim that they work** — in place of "the registry keeps listing them as
  active". `active` is the default of `status`, and the registry says "consumers should assume
  minimal-to-no moderation"; "lists them as active" read the field as a claim the registry does
  not make.
- **placeroot: "HTTP download from DuckDB's default repository, signature verified", withdrawn
  as a finding** — in place of "executable code, no TLS". The repository is compiled into DuckDB
  (`CORE_REPOSITORY_URL = "http://extensions.duckdb.org"`), placeroot neither configures it nor
  touches `allow_unsigned_extensions`, and DuckDB rejects a file with one altered byte. Not
  reported to anyone.
- **First-start network and `$HOME` rates carry both denominators, 579 attempts and 347
  started.** 28 cells aborted on credential validation and 42 on an exception, so their first
  start was not observed.

Unchanged: fastmcp queries PyPI at start, 21/175, attributed to `check_for_updates="stable"`
with a documented opt-out, cluster-robust [5.0–19.0]; telemetry 4, `~/.env` 9, decoys 18,
self-registration 4, install scripts 12.6 %, all with DEFF ≈ 1; 10 s of idle holds up to 120 s
(39/40); dummy credentials do not suppress activity in servers that start (4/4), and those that
abort remain unobserved; the sandbox does not change what is observed (20/20); the sample is
simple random, with no detectable bias on 11 covariates.
