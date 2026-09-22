# microsoft/sbom-tool — `ValidateFormat` exits 0 on a failed validation

`ValidateFormat` prints whether an SBOM passed or failed format validation and exits 0 either
way. The only input that produces a non-zero exit is one the tool cannot open. A pipeline that
runs the command and reads its exit status is told every SBOM is acceptable.

## What the tool promises

The repository describes an "enterprise ready tool to create SPDX 2.2 compatible SBOMs", and the
`ValidateFormat` action answers whether a given SBOM is well formed. Its own output is
unambiguous about the two outcomes: `SBOM format validation passed.` against
`SBOM format validation failed. Please see the following errors:` followed by the errors.

## What the code does

`src/Microsoft.Sbom.Tool/FormatValidationService.cs`, and identically
`src/Microsoft.Sbom.DotNetTool/FormatValidationService.cs`, on `main`:

```csharp
using (var sbomStream = new StreamReader(config.SbomPath.Value))
{
    var validatedSbom = new ValidatedSbom(sbomStream.BaseStream);
    PrintLines(await validatedSbom.MultilineSummary());
}

await recorder.FinalizeAndLogTelemetryAsync();
Environment.ExitCode = true ? (int)ExitCode.Success : (int)ExitCode.ValidationError;
```

The condition of the ternary is the literal `true`, so `ExitCode.ValidationError` is unreachable.
The validation result reaches the console through `MultilineSummary()` and never reaches the exit
code. The only other assignment is in the `catch`, which sets `GeneralError` — that is why a
missing file exits 1 and a failing SBOM does not.

## Reproduced

Against the published `sbom-tool-linux-x64` from release v4.1.5 (2025-12-15), not a local build.
The valid input is the release's own `linux-x64-manifest.spdx.json`; each invalid input is that
file with one mutation.

| input | printed | exit |
|---|---|---|
| release manifest, unmodified | `SBOM format validation passed.` | 0 |
| `spdxVersion` removed | `SBOM format validation failed.` — missing required property `spdxVersion` | **0** |
| `spdxVersion` set to `SPDX-9.9` | `SBOM format validation failed.` — not recognized as SPDX major version 2 | **0** |
| first package's `name` removed | `SBOM format validation failed.` — missing required property `name` | **0** |
| file containing `not json at all` | `SBOM format validation failed.` — invalid JSON literal | **0** |
| path that does not exist | `Encountered error while running format validation.` | 1 |

`repro.sh` runs this. Note that the exit status must be read from the command itself and not
through a pipe — reading `$?` after `sbom-tool … | head` yields `head`'s status and shows 0
everywhere, which hides the difference between the missing-file case and the rest.

Two mutations that a reader might expect to fail did not, and are not part of the finding: a
`dataLicense` of `MIT` where SPDX 2.2 requires `CC0-1.0`, and an `SPDXID` of `NotAnSpdxId`, both
reported as passed. The action checks deserialization against the format's required properties
rather than the full specification.

## How it got there

| commit | PR | date | what it did |
|---|---|---|---|
| `1d832e0` | [#577](https://github.com/microsoft/sbom-tool/pull/577) | 2024-05-20 | added the verb, "with placeholder for future validation" — the line enters in this state |
| `b005f3f` | [#580](https://github.com/microsoft/sbom-tool/pull/580) | 2024-05-21 | added the real validation; the line is untouched context in the diff |
| `91b1b41` | [#617](https://github.com/microsoft/sbom-tool/pull/617) | 2024-07-17 | "Make the process exit with the correct exit code" — added `Environment.Exit(Environment.ExitCode);` to this file |

The placeholder survived the change that added the validation it was standing in for, and then
the change whose stated purpose was correct exit codes made its value authoritative rather than
correcting it. The line dates from 2024-05-20 and is in v4.1.5 of 2025-12-15, the current release, where it was
reproduced; which intermediate releases carry it was not checked.

## Prior art

Not reported. [#615](https://github.com/microsoft/sbom-tool/issues/615) is the adjacent case —
`Generate` returns 0 when it cannot write the manifest because another process holds it — and is
about a different action and a different code path. [#468](https://github.com/microsoft/sbom-tool/issues/468)
and [#205](https://github.com/microsoft/sbom-tool/issues/205) concern the manifest `Validate`
action, not this one. Nothing in the repository documents the exit code of `ValidateFormat` as
intentional, and the commit that introduced the line calls it a placeholder.

`ValidateFormat` is absent from `--help`, which lists only `Validate`, `Generate`, `Redact` and
`Aggregate`, and from `docs/sbom-tool-arguments.md`. It is nonetheless present and functional in
the shipped binary: `sbom-tool ValidateFormat -sp <path>` runs. An undocumented verb is reached
by fewer pipelines, which bounds the blast radius and is stated in the report.

## Reported

To MSRC, per the repository's `SECURITY.md`, which asks that security issues not be filed as
public GitHub issues. Text as sent: [report-msrc.md](report-msrc.md).
