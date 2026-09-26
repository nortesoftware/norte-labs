# npm `audit signatures` — a partially verified tree reports like a fully verified one

`npm audit signatures` verifies registry signatures and attestations for the installed tree. When
a registry does not publish signing keys, the packages installed from it are skipped. The skip is
intentional. What the command does not do is say how many packages it skipped, so a tree where
some dependencies came from a keyless registry produces the same output shape and the same exit
code as one where every dependency was checked.

Audited against npm 10.9.8, and run again on 12.1.0. Filed as a public issue,
[npm/cli#10018](https://github.com/npm/cli/issues/10018), and deliberately not as a vulnerability
— see *Verdict*.

## What it does

`lib/utils/verify-signatures.js` resolves each registry's keys before verifying. The lookup gives
up quietly in two places: `TUF_FIND_TARGET_ERROR` from the Sigstore TUF lookup returns `null`, and
`E404` or `E400` from the registry's own `/-/npm/v1/keys` returns `null` as well. A package is
counted as `missing` a signature only inside `else if (keys.length)`, so with no keys for its
registry a package is neither verified nor missing. `auditedWithKeysCount` counts only the
packages that were checked against keys, and the summary is built from it.

npm handles the total case correctly. If *nothing* in the tree could be audited:

```js
if (!this.auditedWithKeysCount) {
  throw new Error('found no dependencies to audit that were installed from ' +
                  'a supported registry')
}
```

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

`registry.npmjs.org` serves keys, so a tree resolved entirely from npmjs is fully covered and the
gap does not arise. It arises where part of the tree comes from a registry that does not publish
keys — a third-party registry, an internal mirror or proxy, an artifact server — which is the
configuration in which a pipeline is most likely to be running `audit signatures` as a gate in
the first place.

## Prior art

- **Is the checked-versus-could-not-check gap reported?** Not as an issue: none in `npm/cli`
  discusses the coverage figure, and `auditedWithKeysCount` appears in none.
  [npm/rfcs#550](https://github.com/npm/rfcs/pull/550), opened 2022-03-10 and accepted
  2026-05-29, anticipates it: a mirror or proxy that omits signatures, and "The best we can do
  for now in this case is warn users that some packages don't have signatures."
- **Is the key lookup returning `null` on `E404`/`E400` reported?** Yes, and it is the intended
  behaviour rather than a defect.
  [npm/cli#5479](https://github.com/npm/cli/issues/5479) (opened 2022-09-07, closed 2022-09-21)
  is a third party asking for exactly this: their Nexus registry answered `E400` where npm only
  expected `E404`, and the request was to treat both as "this registry does not publish keys" so
  that the audit skips those dependencies instead of failing. It states the behaviour plainly —
  "npm audit signatures skips audit on dependencies when registry does not return signing keys".
- **Documented as intentional anywhere else?** Not in the documentation. The `npm-audit` page's
  *Audit Signatures* section describes what a registry must provide for signatures to be
  verifiable and says nothing about what happens when a registry provides nothing, nor that
  coverage may be partial. The intent is recorded only in that issue.
- **Has anyone measured the fraction of the ecosystem in this state?** Not found, and the
  population is awkward: npmjs itself serves keys, so the quantity that matters is the share of
  real-world installs resolving through registries that do not, which is not enumerable from the
  public registry. It would have to be measured over configurations rather than over packages.

## Verdict

**Do not spend a bounty submission on this, and do not file it as a vulnerability.**

The skip is by design and was requested; the all-keyless case already errors; and what remains is
that the mixed case reports no coverage figure. Submitted as a vulnerability it would very likely
close as by-design, and GitHub's programme as restructured on 2026-07-27 limits a reporter
without standing there to four initial submissions — a bad trade for a report whose own prior art
shows the core behaviour was asked for.

`npm/cli`'s `SECURITY.md` routes bounty-eligible reports through HackerOne and everything else to
`opensource-security@github.com`; the second does not consume a bounty submission. Neither is the
right venue here. The right venue is a public issue: `audit signatures` should report the number
of packages it skipped for want of registry keys, so that a partially verified tree cannot be
mistaken for a fully verified one. Filed 2026-09-23 as
[npm/cli#10018](https://github.com/npm/cli/issues/10018); text as filed: [issue.md](issue.md).

## Corrections, 2026-09-25

- The output was described as giving no sign of the skipped packages. That holds on 10.9.8,
  where it was reproduced. From 11.2.0 a warning names each registry outside Sigstore's trust
  root; on 12.1.0 it reads the same for a registry whose packages were verified.
- *Prior art* said no discussion of the gap was found. npm/rfcs#550, opened 2022-03-10,
  anticipates it.
