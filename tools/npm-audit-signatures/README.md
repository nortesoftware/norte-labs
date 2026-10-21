# npm `audit signatures` — a partially verified tree reports like a fully verified one

`npm audit signatures` verifies registry signatures and attestations for the installed tree. A
package whose registry, the one the configuration names when the audit runs, publishes no signing
keys is skipped when that registry's document for it carries neither signatures nor attestations;
when it carries signatures, the command stops with `EMISSINGSIGNATUREKEY`. The skip is intentional.
What the command does not do is say how many packages it skipped, so a tree where some
dependencies come from such a registry produces the same output shape and the same exit code as one
where every dependency was checked.

Audited against npm 10.9.8, and run again on 12.1.0. Filed as a public issue,
[npm/cli#10018](https://github.com/npm/cli/issues/10018), and deliberately not as a vulnerability
— see *Verdict*.

## What it does

`lib/utils/verify-signatures.js` resolves each registry's keys before verifying. The lookup gives
up in two steps, quietly on 10.9.8; from 11.2.0 the first logs a warning (below).
`TUF_FIND_TARGET_ERROR` from the Sigstore TUF lookup returns `null`, and the lookup falls back to
the registry's own `/-/npm/v1/keys`, where `E404` or `E400` returns `null` as well. A package is
counted as `missing` a signature only inside `else if (keys.length)`, so with no keys for its
registry a package whose document carries neither signatures nor attestations is neither verified
nor missing. One whose document carries signatures makes pacote throw `EMISSINGSIGNATUREKEY`, and
the command stops with exit 1; a mirror that copies npmjs's signatures, as npmmirror does for some
versions, does that ([../../measurements/keyless-registries/](../../measurements/keyless-registries/)).
`auditedWithKeysCount` counts only the packages that were checked against keys, and the summary is
built from it.

On 10.9.8 npm handles the total case correctly. If *nothing* in the tree could be audited:

```js
if (!this.auditedWithKeysCount) {
  throw new Error('found no dependencies to audit that were installed from ' +
                  'a supported registry')
}
```

From 11.11.0 ([npm/cli#9026](https://github.com/npm/cli/pull/9026)) the condition is
`!this.auditedWithKeysCount && !this.verifiedAttestationCount`, and a keyless Sigstore attestation,
which carries its own certificate, is verified without registry keys. In `repro-attestation.sh` a
local registry that publishes no keys serves semver 7.8.5 with no signatures and, as its only
attestation, the SLSA provenance from npmjs's, and a package with neither signatures nor
attestations. 12.1.0 printed `audited 0 package` and `1 package has a verified attestation` and
exited 0, with the second package counted nowhere; 10.9.8 stopped with `EMISSINGSIGNATUREKEY`.
Without the attestation both gave "found no dependencies to audit" and exit 1. Other trees were not
measured.

## Reproduced

A local registry that serves a scoped package and answers `404` on `/-/npm/v1/keys`, against
`registry.npmjs.org`, which answers `200`. `repro.sh` builds both trees.

| tree | output | exit |
|---|---|---|
| one dep from the keyless registry only | `npm error found no dependencies to audit that were installed from a supported registry` | 1 |
| one dep from each — `lodash` and the keyless one | `audited 1 package in 0s` / `1 package has a verified registry signature` | **0** |

In the mixed tree the dependency from the keyless registry appears nowhere: not in the audited
count, not under `missing`, not under `invalid`. The line a reader takes away is
`1 package has a verified registry signature`, and the exit code a pipeline gates on is 0. The
tree's total dependency count is not printed beside the audited count, so the two cannot be
compared without counting the lockfile separately.

From npm 11.2.0 ([npm/cli#8080](https://github.com/npm/cli/pull/8080)) each registry whose keys
are not in Sigstore's trust root gets one line before
the summary: `npm warn Fetching verification keys using TUF failed.  Fetching directly from
<registry>.` On 12.1.0 both trees above print it for the keyless registry, and the summaries and
exit codes are unchanged. A third tree, `lodash` and a package from a local registry that serves
a key and signs, prints the same line word for word, and its package verifies. The warning
names the registry. It does not say whether that registry's packages were checked.

Measure the exit status from the command and not through a pipe; after `npm audit signatures |
head` the status is `head`'s and both rows read as 0.

## Scope

`registry.npmjs.org` serves keys, so a tree the configuration sends entirely to it is fully covered
and the gap does not arise. A registry without keys as the only one configured makes the audit fail,
with "found no dependencies to audit" where its documents carry neither signatures nor attestations
and `EMISSINGSIGNATUREKEY` where they carry signatures, except, from 11.11.0, in the attestation
case above. Otherwise the gap needs one configuration with both kinds of registry, a scope sent to
one and the rest to the other, and documents with neither signatures nor attestations on the side
without keys. With npmmirror as the default and a scope on npmjs, 12.1.0 refused the install with
its default settings (`EALLOWREMOTE`); installed with `--replace-registry-host=never` or
`--allow-remote=all`, or by 10.9.8, the tree passed on 12.1.0 with npmmirror's package counted
nowhere, as it does with the scope on npmmirror and the default on npmjs. How often such a
configuration occurs was not measured; in the lockfiles of 572 GitHub projects none shows it
([../../measurements/keyless-registries/](../../measurements/keyless-registries/)).

## Prior art

- **Is the checked-versus-could-not-check gap reported?** Not as an issue: none in `npm/cli`
  discusses the coverage figure, and `auditedWithKeysCount` appears in none.
  [npm/rfcs#550](https://github.com/npm/rfcs/pull/550), opened 2022-03-10 and accepted
  2026-05-29, anticipates it: a mirror or proxy that omits signatures, and "The best we can do
  for now in this case is warn users that some packages don't have signatres [sic]."
- **Is the key lookup returning `null` on `E404`/`E400` reported?** Yes, and it is the intended
  behaviour rather than a defect. [npm/cli#5479](https://github.com/npm/cli/issues/5479) (opened
  2022-09-07, closed 2022-09-21) is a third party asking for its `E400` case: their Nexus registry
  answered `E400` where npm only expected `E404`, and the request was to treat both as a sign
  "that the third-party registry does not return signing keys" so that the audit skips those
  dependencies instead of failing. It states the behaviour plainly — "npm audit signatures skips
  audit on dependencies when registry does not return signing keys".
- **Documented as intentional anywhere else?** Not in the documentation. The `npm-audit` page's
  *Audit Signatures* section describes what a registry must provide for signatures to be
  verifiable and says nothing about what happens when a registry provides nothing, nor that
  coverage may be partial. That issue, code comments and npm/cli#4827's review record the intent.
- **Has anyone measured the fraction of the ecosystem in this state?** Not found, and the
  population is awkward: npmjs itself serves keys, so the quantity that matters is the share of
  real-world installs resolving through registries that do not, which is not enumerable from the
  public registry. It would have to be measured over configurations rather than over packages.
  Measured since over the lockfiles of a sample of GitHub projects:
  [../../measurements/keyless-registries/](../../measurements/keyless-registries/).

## Verdict

**Do not spend a bounty submission on this, and do not file it as a vulnerability.**

The skip is by design, and its 400 case was requested; the all-keyless case errors on 10.9.8; and
what remains is that the mixed case reports no coverage figure. Submitted as a vulnerability it
would very likely close as by-design, and under [GitHub's programme as restructured on
2026-07-27](https://github.blog/security/next-chapter-restructuring-githubs-bug-bounty-program/) a
reporter below HackerOne's signal threshold has up to four initial submissions — a bad trade for a
report whose own prior art shows the core behaviour is intended.

`npm/cli`'s `SECURITY.md` routes bounty-eligible reports through HackerOne and everything else to
`opensource-security@github.com`; the second does not consume a bounty submission. Neither is the
right venue here. The right venue is a public issue: `audit signatures` should report the number
of packages it skipped for want of registry keys, so that a partially verified tree cannot be
mistaken for a fully verified one. Filed 2026-09-23 as
[npm/cli#10018](https://github.com/npm/cli/issues/10018); text as filed: [issue.md](issue.md).

## Figures

Each figure, where it comes from. The table's runs on npm 10.9.8 are the audit's, and their output
is kept only where [issue.md](issue.md) quotes it; those figures carry the day it was filed,
2026-09-23. A figure no dated record names carries the day it was published.

| figure | field or computation | source | as of |
|---|---|---|---|
| exit 1 and "found no dependencies to audit" for the keyless tree; exit 0, `audited 1 package in 0s` and `1 package has a verified registry signature` for the mixed tree | `npm audit signatures` over the two trees `repro.sh` builds, its exit status read from the command itself | npm 10.9.8; a local registry that answers 404 on `/-/npm/v1/keys`; `registry.npmjs.org`, which answers 200 | 2026-09-23 |
| 0 in both rows through a pipe | `$?` after `npm audit signatures \| head` | same | not recorded; published 2026-09-24 |
| on 12.1.0 the same summaries and exit codes, and one `npm warn Fetching verification keys using TUF failed` line for the keyless registry; the same line for a local registry that serves a key, whose package verifies | the same two trees, and a third with `lodash` and that registry's package | npm 12.1.0 | 2026-09-25, 18:01–18:03 UTC |
| 12.1.0: `audited 0 package`, `1 package has a verified attestation`, exit 0; 10.9.8: `EMISSINGSIGNATUREKEY`; without the attestation, "found no dependencies to audit" and exit 1 on both | `npm audit signatures` over the tree `repro-attestation.sh` builds | npm 10.9.8 and 12.1.0; npmjs's attestations for semver 7.8.5 | 2026-10-08 |
| `EMISSINGSIGNATUREKEY` and exit 1 where the keyless registry's document carries signatures; the registry the configuration names is the one that counts; `EALLOWREMOTE` with npmmirror as the default and a scope on npmjs, and the tree passing once installed otherwise | as set out in [../../measurements/keyless-registries/](../../measurements/keyless-registries/) | its `audit-cases/` and `npm-config/` | 2026-10-08, 01:47 and 01:48 UTC |
| 572 lockfiles, none with that configuration | as set out there | its `scopes.json` and `rcfiles.json`; instruction-gap's `cells.ndjson` | lockfiles at the 2026-09-17 heads; read 2026-10-07 |
| 11.2.0; 11.11.0 | the first release with #8080's warning; the first with #9026's condition | npm/cli's source and release notes | read 2026-09-25; read 2026-10-08 |
| npm/rfcs#550 opened 2022-03-10, accepted 2026-05-29 | the pull request's creation and merge dates | GitHub | read 2026-09-25 |
| npm/cli#5479 opened 2022-09-07, closed 2022-09-21 | the issue's dates | GitHub | not recorded; published 2026-09-24 |
| up to four initial submissions; reports from 2026-07-27; announced 2026-07-22 | GitHub's post on its bug bounty programme | github.blog | read 2026-10-08 |

## Corrections, 2026-09-25

- The output was described as giving no sign of the skipped packages. That holds on 10.9.8,
  where it was reproduced. From 11.2.0 a warning names each registry outside Sigstore's trust
  root; on 12.1.0 it reads the same for a registry whose packages were verified.
- *Prior art* said no discussion of the gap was found. npm/rfcs#550, opened 2022-03-10,
  anticipates it.

## Corrections, 2026-09-30

- *What it does* said the key lookup gives up quietly in two places, on `TUF_FIND_TARGET_ERROR` and
  on `E404` or `E400`. They are two steps, and the paragraph now says so: the code falls back from
  TUF to `/-/npm/v1/keys`, and a registry is left with no keys when that answers `E404` or `E400`.
- The quotation from npm/rfcs#550 read "don't have signatures". Every version of the RFC reads
  "don't have signatres", and the quotation now keeps that spelling, marked [sic].
- The #5479 entry quoted "this registry does not publish keys", which is in neither the issue nor
  its fix, #5480. It now quotes the issue, which asks npm to take `E400`, as well as `E404`, "to
  indicate that the third-party registry does not return signing keys".
- *Prior art* said the intent is recorded only in #5479. The entry now adds two code comments and
  the review of npm/cli#4827, the pull request that added the command; there its author chose to
  "just not count these cases in the 'audited x packages' count", and a maintainer agreed.

## Corrections, 2026-10-08

- The first paragraph and *What it does* said that the packages from a registry that publishes no
  keys are skipped. That holds when the registry's document for the package carries neither
  signatures nor attestations. When it carries signatures, as npmmirror's documents do for some
  versions, the command stops with `EMISSINGSIGNATUREKEY` and exits 1. The registry that counts is
  the one the configuration names when the audit runs, not the one the package was installed from.
- *What it does* said the key lookup gives up quietly. It does on 10.9.8; from 11.2.0 its first
  step logs a warning.
- *What it does* said npm handles the total case correctly, and *Verdict* that the all-keyless case
  already errors. Both hold on 10.9.8. From 11.11.0 a keyless attestation is verified without
  registry keys, and in the tree of `repro-attestation.sh` that passed a registry without keys, with
  its other package counted nowhere; other trees were not measured.
- *Scope* spoke of a tree resolved entirely from npmjs, where what counts is the registry the
  configuration names. It also said the gap arises with a third-party registry, an internal mirror
  or proxy, or an artifact server, and that this is where a pipeline most likely gates on the
  command. A registry without keys as the only one configured makes the audit fail, outside the
  attestation case; the gap needs a scope sent to one kind of registry and the rest to the other,
  with documents that carry neither signatures nor attestations on the side without keys. How often
  that occurs was not measured; the paragraph now says what was run on both versions and that none
  of 572 lockfiles shows it.
- *Verdict* gave the four-submission limit with no source. It is GitHub's announcement of
  2026-07-22, for reports from 2026-07-27, and the sentence now cites it and says more precisely
  whom the limit is for.
- *Prior art* now points to the measurement made since.

## Corrections, 2026-10-21

- *Verdict* said the skip was requested and that the report's own prior art shows the core
  behaviour was asked for. It now says the skip's 400 case was requested and that the prior art
  shows the behaviour is intended: [npm/cli#5479](https://github.com/npm/cli/issues/5479) lists
  the skip on `E404` under "Current Behavior" and asks for the same on `E400`.
- *Prior art* said npm/cli#5479 asks for exactly the lookup's `null` on `E404` and `E400`. It now
  says the issue asks for its `E400` case, as *Verdict* does.
