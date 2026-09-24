# Gate or report: the inventory classified, 2026-09-24

Each of the 64 tools in [inventory.ndjson](inventory.ndjson), classified by what its own documentation says it does: whether the tool itself stops something, or produces something for someone else to act on. The inventory has 65 rows because Harden-Runner is listed twice, under two categories. Every classification rests on a passage of the tool's documentation, quoted verbatim in [gate-or-report-2026-09-24.ndjson](gate-or-report-2026-09-24.ndjson) and linked below at a pinned commit.

The next target audited in this directory is drawn at random from the tools classified *gates*, excluding the four already audited and cplt, nono and pmg from the earlier sandbox survey. This file was published before that draw. The one drawn case so far, [capslock/](capslock/), was examined in its reporting mode; the question left by [absent-fails-open.md](absent-fails-open.md) is whether the pattern appears where a tool claims to enforce something.

## The rule

A tool **gates** if its documentation describes a mode in which the tool itself stops something: it denies an access at runtime, blocks an install, a fetch, a merge, an admission or a deployment, puts back a setting it was told to hold, or exits non-zero on a finding so that the command or build it runs in fails. It **reports** if what it produces is a finding, a score, an inventory, an attestation or a proposed change for someone or something else to act on, and its documentation describes no mode in which it stops anything itself.

Decided in advance:

- A mode that is off by default still counts. Whether any documented part of the tool stops something without a switch being set is recorded separately, as *on by default*. Supplying what the tool enforces, a policy or an allowlist, is not a switch; choosing between audit and enforce is.
- An exit status that is non-zero only on a crash, a parse error or a usage error does not count. It has to follow from what the tool checks.
- A verifier that exits non-zero when verification fails gates. Its caller acts on the status.
- If a separate program reads the tool's results and fails the build, the tool reports, unless its own project ships that failing mode as part of the tool.
- A tool that rewrites files on request does not gate by that alone. A check mode that exits non-zero on a finding does.
- A tool that says it is not a security boundary but confines a process still gates.
- A tool with several parts gates if any documented part stops something.
- The classification is of what the documentation says, not of whether the tool does it.

## Result

**57 gate and 7 report.** Of the 57, 46 stop something without a switch being set and 11 only once a flag, setting or label turns enforcement on.

### Report

| tool | what it produces | source |
|---|---|---|
| Syft | generates SBOMs and SBOM attestations | [doc](https://github.com/anchore/syft/blob/409ac78f62a44de7cffa5edaef2f05e41708a727/README.md) |
| Dependency-Track | records policy violations for others to act on; the plugins that fail builds are community-maintained | [doc](https://github.com/DependencyTrack/docs/blob/eccef0c7bf6438285a3a0ffc0d48aeea99b0bbd6/docs/concepts/component-policies.md) |
| OpenSSF Scorecard | scores, findings, a badge and a dataset; the project names Allstar as the enforcer | [doc](https://github.com/ossf/scorecard/blob/f92023a3f77879f96e0c9c1305f289d755be4bb6/docs/ROADMAP.md) |
| protobom | library that reads and writes SPDX and CycloneDX | [doc](https://github.com/protobom/protobom/blob/22510c5720fdacf15a68653194816341431a1ae6/README.md) |
| StepSecurity secure-repo | proposes hardened workflow files as a pull request | [doc](https://github.com/step-security/secure-repo/blob/6214b1682c8d0b3085c58a14fac904b6b21732be/README.md) |
| octoscan | findings as text, JSON or SARIF; its Action uploads the SARIF and ignores the exit status | [doc](https://github.com/synacktiv/action-octoscan/blob/6b1cf2343893dfb9e5f75652388bd2dc83f456b0/README.md) |
| Tern | writes SBOM reports for container images | [doc](https://github.com/tern-tools/tern/blob/717ea47be7310d055b86fb1b80d39fb472c0ddbf/README.md) |

### Gate

| tool | on by default | what stops | source |
|---|---|---|---|
| dependency-review-action | yes | fails the job when a PR adds vulnerabilities at or above `fail-on-severity` | [doc](https://github.com/actions/dependency-review-action/blob/284c089a1c4d8e8673b7398cdb8df358a9de47ad/README.md) |
| Grype | no | `--fail-on <severity>` exits non-zero on a vulnerability at or above it | [doc](https://github.com/anchore/grype/blob/41a43d8a85c10a4980572bed94377a120587dd76/cmd/grype/cli/options/grype.go) |
| srt (Anthropic Sandbox Runtime) | yes | runs a process tree in an OS sandbox; network denied except allowed domains | [doc](https://github.com/anthropic-experimental/sandbox-runtime/blob/ddbeb74711c4097014ef3056791efa83f553116c/README.md) |
| Trivy | no | `--exit-code` sets the exit status used when issues are found | [doc](https://github.com/aquasecurity/trivy/blob/43a9d1598396d4f01ec3e32858b46c41ea81ed32/docs/guide/configuration/others.md) |
| Bazel sandboxing (linux-sandbox / darwin-sandbox / processwrapper-sandbox) | yes | sandboxed actions cannot write outside their sandbox directory; network denial is opt-in | [doc](https://github.com/bazelbuild/bazel/blob/0e7e681a1374e3f178ee377e9a9a51075ee54152/docs/docs/sandboxing.mdx) |
| poutine | no | `--fail-on-violation` exits 10 when any finding is present | [doc](https://github.com/boostsecurityio/poutine/blob/bd4c1f86fe8cfe61b456f1ea2b2106ce0cac51d6/README.md) |
| cdxgen | yes | `cdx-audit` and `cdx-validate` exit 3 on a finding at or above `--fail-severity` | [doc](https://github.com/cdxgen/cdxgen/blob/0852533016d3c4240a7ffcf0e3fe0ee1a5a7d428/README.md) |
| gh attestation verify (GitHub CLI) | yes | `gh attestation verify` exits 1 when no attestation verifies against the given policy | [doc](https://github.com/cli/cli/blob/b6770c8bc54c72e74e785c307850446b8e10be9d/pkg/cmd/root/help_topic.go) |
| bubblewrap | yes | runs a command in new namespaces exposing only the paths the caller binds | [doc](https://github.com/containers/bubblewrap/blob/f8e1e5077eb8613ca559bac0d422282a910015d6/README.md) |
| GuardDog | yes | its analysis runs in a Landlock or Seatbelt sandbox; `--exit-non-zero-on-finding` is opt-in | [doc](https://github.com/DataDog/guarddog/blob/1f4a66c064fb2087c224750507f3b65c7633deeb/README.md) |
| Deno `--allow-scripts` | yes | `deno install` does not run npm lifecycle scripts unless a package is allowed by name | [doc](https://github.com/denoland/docs/blob/0d62971ed90cfd17e2898734b46fef0f1044cc9d/runtime/reference/cli/install.md) |
| OWASP Dependency-Check | no | `--failOnCVSS` / `failBuildOnCVSS` fails the build at a CVSS threshold | [doc](https://github.com/dependency-check/DependencyCheck/blob/3fe8aa4978758f0961cd58ec95e09f22e146b522/maven/src/site/markdown/configuration.md) |
| bomber | no | `--exitcode` exits with a code for the highest severity found; marked experimental | [doc](https://github.com/devops-kung-fu/bomber/blob/6a7f05aad6e6aca3e359f87f3155936484a6dae0/README.md) |
| Gemini CLI sandbox | no | `--sandbox` runs tools under Seatbelt, in a container, or in a Windows low-integrity sandbox | [doc](https://github.com/google-gemini/gemini-cli/blob/87de0b6369f0466da37d9b3c0c9b77374bb59992/docs/cli/sandbox.md) |
| Capslock | no | `-output=compare` against a saved baseline exits 1 when capabilities differ | [doc](https://github.com/google/capslock/blob/a2957859b7c62ab391ff2370041b0d4bc76591ca/cmd/capslock/capslock.go) |
| NsJail | yes | runs a command in namespaces with resource limits and an optional seccomp policy | [doc](https://github.com/google/nsjail/blob/f100fd917c6d3ed0fd15d868528b735cb5fb1a1a/README.md) |
| OSV-Scanner | yes | exits 1 when vulnerabilities are found; its Action fails on them by default | [doc](https://github.com/google/osv-scanner/blob/46891bfc09691fe30646299688c9abe364e3cef4/docs/output.md) |
| senv | yes | installs inside a sandbox with network limited to registries; `run` denies network | [doc](https://github.com/h5i-dev/senv/blob/bcda357956fa1a6bab03a5134caebe3a939915a4/README.md) |
| Homebrew sandbox | yes | builds, post-install steps, tests and cask steps run under Seatbelt or Landlock | [doc](https://github.com/Homebrew/brew/blob/27af95f6a334817dfc67703582a4dae87cc7f614/docs/Homebrew-Security-and-Supply-Chain.md) |
| in-toto (Python reference implementation) | yes | `in-toto-verify` returns 1 when layout verification fails | [doc](https://github.com/in-toto/in-toto/blob/e352b43ad7cb8915d84c36d791aa61346152a0a3/in_toto/in_toto_verify.py) |
| witness (in-toto/witness CLI + in-toto/go-witness library) | yes | `witness verify` exits non-zero when attestations fail the signed policy | [doc](https://github.com/in-toto/witness/blob/1eaafd56616bdf6c136e80ab92a9a0944e6c0ced/docs/concepts/policy.md) |
| sbomqs | no | `sbomqs policy` exits 1 when a policy whose action is `fail` is violated | [doc](https://github.com/interlynk-io/sbomqs/blob/44ed5bb8266503e213d0fd61f6780dd1a46e7d35/docs/guides/policy.md) |
| mise sandboxing | no | `--deny-*` flags or settings confine a command with Landlock and seccomp, or Seatbelt | [doc](https://github.com/jdx/mise/blob/d292a6d8c78ad86aec5341691cda0fb272a697c3/docs/sandboxing.md) |
| Kyverno (verifyImages rules / ImageValidatingPolicy) | yes | admission webhook denies non-compliant images under `Enforce`; `kyverno apply` exits 1 on failures | [doc](https://github.com/kyverno/website/blob/99506633a6b77065e3f95ad1fbc5a10e4e02b317/src/content/docs/docs/policy-types/cluster-policy/validate.md) |
| @lavamoat/allow-scripts | yes | turns lifecycle scripts off and runs only allowlisted ones; exits 1 on a dependency with no policy | [doc](https://github.com/LavaMoat/LavaMoat/blob/8fa1e34d4a32d5f68aae469bf2453ddf2d9c98f0/packages/allow-scripts/README.md) |
| sbom-tool | yes | `validate` exits 3 when a build drop fails validation against its manifest | [doc](https://github.com/microsoft/sbom-tool/blob/4d2b44739b4317ff2655b4076292ca2522d376bf/src/Microsoft.Sbom.Api/Entities/ExitCode.cs) |
| cplt | yes | runs a command under Seatbelt, or Landlock and seccomp; denies credential paths and non-443 egress | [doc](https://github.com/navikt/cplt/blob/885242955331e740d9d3335655b687f267f0c1fa/README.md) |
| firejail | yes | confines a process tree with namespaces, seccomp and capability drops | [doc](https://github.com/netblue30/firejail/blob/ccdf4ea9943a5a57bd45cb0e40f50ea2dcdad700/src/man/firejail.1.in) |
| Nix build sandbox (NixOS/nix) | yes | builds run isolated from the host in private namespaces | [doc](https://github.com/NixOS/nix/blob/8f7ed1c1d1246bfa98cefd152c87d1ea26a3d463/src/libstore/include/nix/store/local-settings.hh) |
| nono | yes | Landlock or Seatbelt sandbox; blocks paths outside its grants and credential paths | [doc](https://github.com/nolabs-ai/nono/blob/99aeb74288c3bdd6e9e3766bfa26b35e706bd672/docs/cli/getting_started/quickstart.mdx) |
| notation (CLI) + notation-go (library) | yes | `notation verify` fails when no signature satisfies the trust policy | [doc](https://github.com/notaryproject/notation/blob/2c82269853b35a9743f6a36c1da6de7e5d367149/specs/error-handling-guideline.md) |
| npm audit signatures (npm CLI registry-signature and provenance verification) | yes | `npm audit signatures` exits 1 on an invalid or missing signature or attestation | [doc](https://github.com/npm/documentation/blob/cad0fe8b7cd89f001f433ab1216b5e454c19d4fe/content/packages-and-modules/getting-packages-from-the-registry/viewing-package-provenance.mdx) |
| Codex CLI sandbox | yes | commands the model runs are confined by bubblewrap and seccomp, Seatbelt, or a Windows sandbox | [doc](https://github.com/openai/codex/blob/c098f97e5305394c7f30a876c1393cf34a3eedca/codex-rs/linux-sandbox/README.md) |
| Allstar | no | `action: fix` puts GitHub settings back to the configured state; the default action is `log` | [doc](https://github.com/ossf/allstar/blob/0323337900ce8d6dadff5516801c17a972b50b31/README.md) |
| OSSF package-analysis | yes | each analysed package is installed and run in a gVisor sandbox | [doc](https://github.com/ossf/package-analysis/blob/c5c45008da694036d701ba76fe9567fc8a5b9675/README.md) |
| Packj | yes | installs under a syscall-interposing sandbox with a copy-on-write layer and a network list | [doc](https://github.com/ossillate-inc/packj/blob/dfd2c70c4b6dde0327888d62fa7d3df0661d0dfc/packj/sandbox/README.md) |
| OWASP dep-scan | yes | `depscan-validate` exits non-zero on an invalid VEX/VDR document; server mode refuses private-address fetches | [doc](https://github.com/owasp-dep-scan/dep-scan/blob/e1d686b226c08563f11ddffb824a0330978aafc5/documentation/docs/output/validate-command.mdx) |
| Birdcage | yes | library that spawns a child with filesystem and network denied except what is granted | [doc](https://github.com/phylum-dev/birdcage/blob/d0c625188385bbdb77bddd1a16408e7c20d22a9f/README.md) |
| Project Kennel (kennel) | yes | runs a workload under a signed policy; ungranted paths absent, egress denied by default | [doc](https://github.com/projectkennel/projectkennel/blob/90be898cb16c2d20bca189f8b5820a54e6c8f741/README.md) |
| pip-audit | yes | exits 1 when a known vulnerability is found | [doc](https://github.com/pypa/pip-audit/blob/1432d7fc6c82a3f5172f80a683c32fabe368bbef/README.md) |
| actionlint | yes | exits 1 when it finds a problem in workflow files | [doc](https://github.com/rhysd/actionlint/blob/011a6d15e749bb3f2d771eed9c7aa0e7e3e10ee7/docs/usage.md) |
| PMG (Package Manager Guard) | yes | blocks installs of known-malicious packages; an OS sandbox for installs is opt-in | [doc](https://github.com/safedep/pmg/blob/6f378f0c33c6a5917556148ab5026516cdbd4ea7/README.md) |
| ratchet | yes | `ratchet lint` exits non-zero when a reference is unpinned | [doc](https://github.com/sethvargo/ratchet/blob/a7ead07a89972fef4316ad196af18f87ac77bb97/README.md) |
| cosign | yes | `verify` commands exit non-zero when verification fails | [doc](https://github.com/sigstore/cosign/blob/0c66ecdff337f647bbcb0259efe61a81e33a76e8/doc/cosign_exit_codes.md) |
| gitsign | yes | `gitsign verify` fails when the signature, log entry or identity check fails | [doc](https://github.com/sigstore/gitsign/blob/9b9b9551732c94de7f5dd57d25bf437463164cc7/docs/cli/gitsign_verify.md) |
| policy-controller | no | admission webhook rejects images that fail a policy, in namespaces labelled for it | [doc](https://github.com/sigstore/policy-controller/blob/867334b33b9cf4e3aa0296e02d3ab9267aa3b90e/docs/api-types/index-v1alpha1.md) |
| slsa-github-generator | yes | the container builder's `verify` exits 1 on a mismatch; its download actions fail on a bad hash | [doc](https://github.com/slsa-framework/slsa-github-generator/blob/bb91a05077afa6601a3d7538c4cbbdbf0abe7ed9/internal/builders/docker/README.md) |
| slsa-verifier | yes | every `verify-*` command exits 1 when provenance verification fails | [doc](https://github.com/slsa-framework/slsa-verifier/blob/30d0be3bbab553fc51557377baba2f7572dfc212/cli/slsa-verifier/verify.go) |
| Socket Firewall Free (sfw) | yes | proxy that blocks fetches of confirmed-malicious package artifacts | [doc](https://github.com/SocketDev/sfw-free/blob/164c32dcbe3bbebcc0b091fd6a31ff93883545b2/README.md) |
| Socket CLI | yes | `socket npm`, `pnpm` and `yarn` install through Socket Firewall, which blocks known-malicious packages | [doc](https://github.com/SocketDev/socket-cli/blob/54ef056c87fe6921f3273214a4d9306ca63a584e/README.md) |
| Aura | yes | documented to exit 1 when the audit checks have not passed | [doc](https://github.com/SourceCode-AI/aura/blob/1981c139dd14db0be6306bd345e1e7113d0624a6/docs/source/running_aura.rst) |
| Connaisseur | yes | admission webhook denies images that fail signature verification; `detectionMode` only warns | [doc](https://github.com/sse-secure-systems/connaisseur/blob/ebb9bcafa0bfb7052c17d976631d34e805f5c021/README.md) |
| Harden-Runner | yes | blocks CI runner egress outside allowed endpoints; a global block list applies in audit mode too | [doc](https://github.com/step-security/harden-runner/blob/e14015d583714f6e62063499dc959a02595150a1/README.md) |
| pinact | yes | `pinact run --check` exits 1 when an action needs pinning; exits 2 on one it cannot fix | [doc](https://github.com/suzuki-shunsuke/pinact/blob/334d92718bce52e833164ed6212887aa4e3bbc47/docs/exit_codes.md) |
| zizmor | yes | exits 11 to 14 by the highest severity found | [doc](https://github.com/zizmorcore/zizmor/blob/b6684e1b1e0608b4ea887b1911a42ae04995c032/docs/usage.md) |
| landrun | yes | Landlock sandbox that denies filesystem and TCP access not granted | [doc](https://github.com/Zouuup/landrun/blob/811cfff51ceaf3d9843708aa6d22e9b84ccac8b4/README.md) |
| Fence | yes | runs a command in an OS sandbox; network and writes denied unless allowed | [doc](https://github.com/fencesandbox/fence/blob/737751a82b49f287b41f8a3e62ec62919d7b9224/README.md) |

## Borderline cases, decided

**bubblewrap** (gates). Its `SECURITY.md` says it is not a security boundary between the user and the OS and that protection depends on the arguments passed. It still confines the process it runs.

**GuardDog** (gates). The sandbox confines the scanner's own analysis, not a consumer's install. The documentation says it is required, and that the scan fails rather than run without it.

**Dependency-Track** (reports). Its documentation says a `FAIL` violation is what organisations use to break a pipeline, and lists every CI plugin that does so as community work not supported by the project.

**Capslock** (gates). The exit status is documented in the command's package comment, the text `go doc` and pkg.go.dev show; the markdown documentation describes `compare` only as identifying which capabilities changed. [capslock/](capslock/) says the tool "does not claim to be a gate". That write-up examined the default mode and the error path, not the comparison.

**Kyverno (verifyImages rules / ImageValidatingPolicy)** (gates). For ClusterPolicy admission the documented default is `Audit`, which only writes a report. `kyverno apply`, part of the same project, exits 1 on failures without a switch.

**sbom-tool** (gates). The action classified is `validate`. The defect reported in [sbom-tool/](sbom-tool/) is in `ValidateFormat`, a different one.

**Allstar** (gates). Gates by putting back a setting it was told to hold, not by refusing an action.

**OSSF package-analysis** (gates). The sandbox protects the host doing the analysis, not a consumer's install or build. It still confines a process, and the documentation says the packages are isolated, which is a claim of enforcement.

**OWASP dep-scan** (gates). The main scan does not exit on vulnerabilities. `depscan-validate` is documented at the pinned commit but was added after the latest release, 6.3.0. Server mode, which is released, refuses by default to fetch URLs that resolve to private or loopback addresses, which also gates; it protects the server.

**ratchet** (gates). `pin`, `update` and `upgrade` only rewrite files; the check mode is what gates.

**gitsign** (gates). The documentation describes `verify` as checking a commit against certificate claims and does not state an exit status.

**slsa-github-generator** (gates). Its main product is provenance for others to verify. Two documented parts of the same repository verify and fail on a mismatch.

**Aura** (gates). Exit 1 is shared with scan errors, and the documentation never says what the audit checks are. It does tie the code to the checks and offers it for CI, and the classification is of what the documentation says.

**Harden-Runner** (gates). The action's input `egress-policy` defaults to `block`, and the global block list needs no configuration; the README's own example sets `audit`. Block mode is Linux only.

**pinact** (gates). A rewriter with a check mode; the check mode is what gates.

**octoscan** (reports). The source returns exit status 2 when findings exist, but no documentation, help text or Action says so, and the official Action discards the status.

## Checks

Every quote in the `.ndjson` was fetched from its pinned URL on 2026-09-24 and compared character for character with the fetched text: 64 of 64 matched. The same comparison with one character of a quote changed did not match.

## Limits

This is what the documentation says at the pinned commits, not what the tools do. A later commit can say something else, and a tool can do less than its documentation says; the second is what an audit is for.
