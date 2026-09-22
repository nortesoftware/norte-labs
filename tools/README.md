# tools

Audits of supply-chain security tools: what the documentation promises, what the code does, and
what the tool reports when the control it names cannot reach what it claims to cover.

## The shape these audits look for

Three earlier audits found the same thing three times, and the pattern is narrower than "the
control failed".

| | what the control cannot see | what it says about it |
|---|---|---|
| `cplt` | Landlock mediates `open(2)`, not `stat(2)` or `faccessat(2)` | the kernel answers "present and readable", and a check-then-use config loader believes it, then takes `EACCES` in code that never expected it |
| `nono` | the fallback backend cannot observe denials | the log reports none |
| `pmg` | the network policy is installed on 2 of 17 shipped profiles | the other 15 carry `allow_outbound` and `deny_outbound: '*:*'` anyway |

The gap is between what a configuration declares and what the backend actually reaches, with
nothing emitted to say the gap is there. `pmg` is the sharpest case and also the most often
misremembered: the TOCTOU objection to seccomp user notification was examined and did not hold —
for npm the filter is never installed, so there is no notification to race. `profiles/go.yml`
states it in the tool's own words: *"They are NOT kernel-enforced."*

So an audit asks, in this order:

1. what the documentation promises, quoted;
2. what the code does;
3. **degraded mode** — when the control cannot be applied, does it abort, warn, or carry on
   silently, and does the report distinguish "clean" from "not checked";
4. **across platforms** — does the same command under the same words get a weaker control on one
   platform;
5. **absent paths and fields** — a path that does not exist, a manifest field that is missing, a
   signature that is absent rather than wrong, an SBOM with no entry for a component.

Absent is where these tools fail open.

## Inventory, 2026-09-22

69 tools across five categories; 11 of them already assessed in the sandbox survey that produced
the three audits above, so 58 new. Counted by category:

| category | tools | already assessed | strong fit | has a security channel | no prior audit of this shape |
|---|---|---|---|---|---|
| install-time sandboxes | 23 | 11 | 7 | 10 | 6 |
| package and dependency scanners | 12 | 0 | 5 | 11 | 7 |
| provenance and signature verifiers | 12 | 0 | 3 | 12 | 2 |
| CI gates and workflow hardening | 11 | 0 | 3 | 9 | 8 |
| SBOM generators and consumers | 11 | 0 | 4 | 10 | 7 |

Provenance is the most worked category and CI gates the least. The sandbox category has almost no
untouched population left: anyone writing an install sandbox wraps bubblewrap or Landlock, and the
behaviour worth auditing is in the substrate, not in the wrapper.

## The three, in order

Chosen for three different mechanisms in three different categories, each with a live disclosure
channel, each cheap to exercise on Linux, and each with the claim located in code before it was
picked rather than after.

### 1. `npm audit signatures` — npm/cli

The widest blast radius of anything in the inventory: it is the provenance check CI pipelines
actually run, shipped in the client everyone already has.

`lib/utils/verify-signatures.js` counts a package as `missing` only inside `else if (keys.length)`,
and the registry key lookup returns `null` on a TUF `TUF_FIND_TARGET_ERROR` and on `E404` or `E400`
from the direct fetch. With no keys, a package carrying no `_signatures` falls through both
branches: not verified, not missing. `const hasNoInvalidOrMissing = invalid.length === 0 &&
missing.length === 0` then holds, and `process.exitCode` is never set to 1. The tool distinguishes
an invalid signature from a valid one; the audit is whether it distinguishes *checked* from
*unable to check*, and what the summary line tells the operator when the second happens.

This is the `nono` shape moved from a sandbox log to a provenance report. Channel: GitHub private
reporting on `npm/cli`.

### 2. `microsoft/sbom-tool`

Picked because the defect is already unarguable and the function is load-bearing: this is the
validation step, the thing a pipeline runs to decide whether an SBOM is acceptable.

`src/Microsoft.Sbom.Tool/FormatValidationService.cs`, on `main`:

```csharp
Environment.ExitCode = true ? (int)ExitCode.Success : (int)ExitCode.ValidationError;
```

The ternary's condition is the literal `true`, so `ValidationError` is unreachable and the only
path to a non-zero exit is the `catch`, which returns `GeneralError` for an exception — a file that
cannot be opened or parsed. An SBOM that parses and fails validation exits 0. The audit establishes
what `MultilineSummary()` prints in that case, whether any consumer reads the summary rather than
the exit code, and how far back the line goes.

Adjacent exit-code issues have been filed and closed on this repository; this line has not been
reported. Channel: MSRC, and the repository carries a SECURITY.md.

### 3. `netblue30/firejail`

The direct heir of `cplt` and `nono`, in the most-deployed unprivileged sandbox on Linux, and the
one of the three this host can exercise end to end.

Two bites, both verified in the tree and neither in the local-root CVE genre firejail is already
known for:

- **Degraded mode.** Every call to `seccomp_load` in `src/firejail/sandbox.c` discards its return
  value — the protocol filter, both memory-deny-write-execute filters and both namespace filters —
  and execution proceeds unconditionally. `src/firejail/seccomp.c` warns once when the kernel is
  too old. A sandbox whose syscall filter did not install keeps running, still called a sandbox.
- **Absent paths.** `src/firejail/fs.c` globs blacklist patterns with `GLOB_NOCHECK`, with the
  comment that profiles blacklist files that may not exist. A blacklist entry for a path absent at
  setup is a no-op; the question is what happens when the path appears afterwards, and whether any
  output distinguishes a rule that matched nothing from a rule that was applied.

Channel: mature, with a documented process and a long advisory history.

## Runners-up, and why not now

- **`actions/dependency-review-action`** — carries on and reports success when it finds no changes
  or when the API call fails. Strong fit and a real gate, but it duplicates the npm/GitHub surface
  of pick 1; it is the first reserve.
- **Trivy** and **Grype** — `case errors.Is(err, ospkgDetector.ErrUnsupportedOS): // do nothing`,
  and a nil distro yielding an empty match set. Very widely deployed, but the behaviour is already
  discussed in their trackers, so the prior-art verdict is *partial* rather than *not found*.
- **StepSecurity Harden-Runner** — the closest existing work to this programme's shape, with
  published advisories. Most worked, least open.
- **`nsjail`'s `unotify/`** — reads tracee memory with `process_vm_readv` to decode path and
  `sockaddr` arguments, and `SECCOMP_IOCTL_NOTIF_ID_VALID` does not appear in that file. The `pmg`
  shape, unclaimed. Held back only because the project has no SECURITY.md and states it is not an
  official Google product, which makes disclosure unclear.
- **`packj`'s sandbox** — promises to prevent exfiltration using a `strace` supervisor that rewrites
  syscall path arguments in the tracee's memory. The mismatch is the strongest in the inventory;
  adoption is the weakest. Worth taking if a fourth is wanted.
- **`bubblewrap`** — deliberately excluded. Its SECURITY.md says it "is not a security boundary
  between the user and the OS" and that the protection "is entirely determined by the arguments
  passed". The mold does not bite a tool that declines to promise; its callers are the target.

## What this host cannot decide

Every macOS backend in the sandbox category — `srt`, the agent CLIs, `birdcage`, Bazel's
`darwin-sandbox`, Nix on Darwin — rests on `sandbox-exec`, which Apple deprecated and never
documented. The cross-platform leg of the mold therefore cannot be *run* here, only read. A
worked example of the divergence is already in hand: `birdcage`'s macOS deny-all profile carries a
global `(allow file-read-metadata)`, acknowledged in a comment at `src/macos.rs`, while its Linux
backend implements the same library call with mount namespaces where the path is not visible at
all — so `stat()` succeeds on every path on macOS and fails on Linux, under one API. The project is
archived, which makes it a poor report target and a good citation.
