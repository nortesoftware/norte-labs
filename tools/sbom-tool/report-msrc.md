# Report to MSRC — microsoft/sbom-tool

Sent 2026-09-22 22:29 UTC. MSRC **VULN-229761**, classified Security Feature Bypass.

---

**Type of issue:** a validation command reports failure on its output and exits 0, so a pipeline
that gates on the exit status accepts every SBOM.

**Product:** `microsoft/sbom-tool`, the `ValidateFormat` action. The line is present in both
copies of the service, the standalone `sbom-tool` and the `Microsoft.Sbom.DotNetTool` global
tool; the reproduction below is against the standalone binary.

**Affected source:**

- `src/Microsoft.Sbom.Tool/FormatValidationService.cs`
- `src/Microsoft.Sbom.DotNetTool/FormatValidationService.cs`

on `main`. The line has been present since 2024-05-20 and is in the current release, v4.1.5,
which is what the reproduction below uses. The line:

```csharp
Environment.ExitCode = true ? (int)ExitCode.Success : (int)ExitCode.ValidationError;
```

The ternary's condition is the literal `true`, so `ExitCode.ValidationError` cannot be reached.
The validation outcome is printed by `MultilineSummary()` and never reaches the exit code. The
only non-zero assignment is `GeneralError` in the `catch`, which is why a path that cannot be
opened exits 1 while an SBOM that fails validation exits 0.

**Configuration required:** none.

**Steps to reproduce**, against the published `sbom-tool-linux-x64` from release v4.1.5, with
the release's own `linux-x64-manifest.spdx.json` as the valid input:

```
curl -sSLO https://github.com/microsoft/sbom-tool/releases/download/v4.1.5/sbom-tool-linux-x64
curl -sSLO https://github.com/microsoft/sbom-tool/releases/download/v4.1.5/linux-x64-manifest.spdx.json
chmod +x sbom-tool-linux-x64
python3 -c "import json;d=json.load(open('linux-x64-manifest.spdx.json'));d.pop('spdxVersion');json.dump(d,open('bad.json','w'))"

./sbom-tool-linux-x64 ValidateFormat -sp bad.json; echo "exit=$?"
```

Observed:

```
SBOM format validation failed. Please see the following errors:
------------------------------
Error deserializing SBOM with SPDX 2.2: JSON deserialization for type
'Microsoft.Sbom.Parsers.Spdx22SbomParser.Entities.FormatEnforcedSPDX2' was missing required
properties including: 'spdxVersion'.
------------------------------
exit=0
```

The same exit code follows from `spdxVersion` set to an unrecognised value, from a package with
its required `name` removed, and from a file that is not JSON at all. A path that does not exist
exits 1.

Read the status from the command itself rather than through a pipe; after `… | head` the status
is `head`'s and every case reads as 0.

**Impact.** The action's purpose is to answer whether an SBOM is well formed, and its exit status
is the form of that answer a build step can act on. Any pipeline that runs `ValidateFormat` and
branches on the exit code treats a malformed, truncated or substituted SBOM as valid; the
difference is visible only to someone reading the log text. Where the SBOM is the artifact a
downstream control consumes, the check that was meant to stop a bad one passes it.

Two things bound this. `ValidateFormat` is not listed in `--help` or in
`docs/sbom-tool-arguments.md`, so it is reached by fewer callers than the documented `Validate`.
And the failure is loud on stdout — an operator reading output sees it; only the automated
reading is wrong.

**How it arose**, offered because it suggests the fix is a one-line change rather than a design
question: the line enters in PR #577 (2024-05-20), titled as adding the verb "with placeholder
for future validation". PR #580 (2024-05-21) added the validation the placeholder stood in for
and left the line as context. PR #617 (2024-07-17), "Make the process exit with the correct exit
code", added `Environment.Exit(Environment.ExitCode);` to this same file, which made the
placeholder's value the process's status.

**Suggested fix:** derive the exit code from the validation result that `MultilineSummary()`
already reports, in both copies of the file.

**Disclosure:** reported privately per `SECURITY.md`. No public issue has been filed and none
will be before MSRC has had the standard period. If MSRC triages this as a functional defect
rather than a vulnerability, confirmation that a public issue is the right venue is welcome and
it will be filed there instead.
