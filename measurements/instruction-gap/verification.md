# Additional checks and corrections

Checks run on the same 892 lockfiles and the same registry records after the run, 2026-09-17,
and what they changed in [findings.md](findings.md).

## The lockfile reader against npm's own reading

Five package-lock.json files (v2 and v3, single workspace) drawn at random from the cells were
read by `npm ls --package-lock-only --all --json` (npm 10.9.8; the lockfile alone, no network,
nothing installed) and the distinct (name, version) pairs compared with the reader's.

| project | lockfile | reader: versions / names | npm ls: versions / names |
|---|---|---|---|
| TinyAGI/fractals | v3 | 39 / 39 | 39 / 39 |
| dwmkerr/wait-port | v2 | 361 / 322 | 361 / 322 |
| be5invis/Sarasa-Gothic | v3 | 154 / 143 | 154 / 143 |
| ionic-team/ionic-framework | v2 | 560 / 491 | 560 / 491 |
| floccusaddon/floccus | v3 | 1,244 / 1,079 | 1,247 / 1,082 |

The three pairs npm lists and the reader does not are aliases — `strip-ansi-cjs`,
`wrap-ansi-cjs`, `string-width-cjs` — which npm reports under the alias name and the reader
folds into the real package (`strip-ansi@6.0.1` …), already present. Identity by real package
is the definition used throughout; the counts agree once aliases are folded.

## Aliases in yarn v1 lockfiles

A first reading of yarn v1 lockfiles produced 19 registry lookups for names that do not exist
(`@typescript-eslint/parser-v2`, `eslint-plugin-react-hooks-published` …): alias keys of the
form `alias@npm:real@range`, whose real package the resolved tarball path names. The reader now
takes the name from the tarball path, or from the `npm:` locator in Berry and bun lockfiles; the
19 lookups disappeared and the 16 versions still missing from the registry are versions that
were unpublished.

## The frame

GitHub's search answers with `incomplete_results: true` and a smaller `total_count` when a query
times out inside GitHub. The first enumeration took such a count for the JavaScript band of 400
stars and up (read as under 1,000, in fact 6,108) and reached only the first 1,000 of it. The
enumerator now repeats a count until it is complete and the band was re-walked: 22 JavaScript
bands, 15,468 repositories counted, 15,466 enumerated; 33 TypeScript bands, 23,324 counted,
23,317 enumerated; 38,791 in the frame against 38,792 counted, no band at the cap. Eight rows
carry no language in the search result although the query selected on it; they are kept.

## Who published a version, when the user is "GitHub Actions"

Of the 88,376 versions looked up, 17,498 were published through trusted publishing and carry
"GitHub Actions" as their user. 17,042 have a provenance attestation whose SLSA predicate names
the repository and workflow; that repository is the identity. 419 have no attestation (a
publish with provenance disabled, e.g. `@babel/*`, `storybook`, `@vercel/*`, `@swc/*`) and
carry a `trustedPublisher.oidcConfigId` that is unique per package; for those the identity is
the repository the manifest's `repository` field names, marked as unattested. 37 have neither
and count as unknown. Before this rule the 419 + 37 were one pseudo-identity reaching 388
projects; with it the trusted-publishing identities per project changed by at most a few units
and no figure in findings.md moved by more than its rounding.

## Registry lookups

88,376 distinct (name, version) pairs; 88,360 read; 16 answer 404 (versions no longer on the
registry, e.g. yanked prereleases); 27 read versions carry no `_npmUser` at all and count as
unknown publisher. 156 resolved pairs across all projects are git or tarball sources and were
not looked up. Every read version's tarball is on `registry.npmjs.org`; 22,483 of the 88,360
(25.4 %) carry a provenance attestation.

## The automation heuristic

The name rule (`bot$`, `^bot-`, `-bot-`, `robot`, `automation`, `^types$`, `release-bot`,
`^npm$`, `ci$`, `-ci$`, `^ci-`, `deploy`, `publisher$`, and every trusted-publishing
repository) matches 1,921 of the 7,569 identities: 1,746 trusted-publishing repositories and
175 accounts. The 60 most-reached matched accounts were read by eye (`types`, `typescript-bot`,
`google-wombot`, `oss-bot`, `eslintbot`, `react-bot`, `node-fetch-bot`, `vercel-release-bot`,
`typescript-deploys`, `d2l-travis-deploy`, `npm`, `aws-sdk-bot`, `cypress-npm-publisher` …);
none is a person's handle. Accounts named like people that are in fact shared or automated
tokens are not caught, so the "not automation" figures are an upper bound on people.

## Platform-conditional install-time code

`fsevents`, macOS-only and an optional dependency, is the most resolved package with an install
script (703 of 892 projects). Every install-time figure is given with and without it in
findings.md; the reader records `optional` where the lockfile does (npm, pnpm), and the count of
projects whose install-time code is entirely optional is not reported because yarn v1, Berry
and bun lockfiles do not mark it.

## Several lockfiles in one repository

42 of the 898 repositories with a lockfile commit more than one. The one read is the one the
`packageManager` field names, else package-lock.json, then pnpm-lock.yaml, yarn.lock, bun.lock;
34 of the 892 cells carry the note. Which one the developer's install actually reads depends on
the command; the choice is recorded per project in `results/population.ndjson`.

## The instrument's own tree

`src/package.json` declares one dependency (`yaml`); its lockfile resolves one version, published
by one account (`eemeli`), with no install script.

## Corrections

None to the figures as first computed: the alias fold, the frame re-walk and the
trusted-publishing rule above were applied before the cells in `results/` were written, and the
figures in findings.md are from those cells.
