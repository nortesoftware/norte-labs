# measurements/keyless-registries — which registries in real lockfiles serve npm's signing keys

`npm audit signatures` checks each package against the signing keys of the registry its
configuration names for it: for `registry.npmjs.org`, the keys Sigstore's TUF repository holds; for
any other registry, the keys it serves at `/-/npm/v1/keys`. A registry with no keys gives the check
nothing to check against. If its document for a package carries signatures all the same, npm stops
with `EMISSINGSIGNATUREKEY`; if it carries neither signatures nor attestations, the package is
skipped, and the summary does not count it
([../../tools/npm-audit-signatures/](../../tools/npm-audit-signatures/)). This counts how many of
[instruction-gap](../instruction-gap/)'s lockfiles resolve packages through a registry that serves
no keys, which registries those are, and what an audit does with them.

Prior art: [../../prior-art/keyless-registries.md](../../prior-art/keyless-registries.md). Nobody
was found counting the projects that resolve through registries without keys, or probing which
registries serve them. What is on record covers one product at a time, mostly in bug reports.

## Population

instruction-gap's 892 lockfiles, from its random sample of GitHub repositories in JavaScript or
TypeScript, read at their heads of 2026-09-17. npm and yarn v1 lockfiles record, for each package,
the tarball URL its registry gave; the 572 written by npm (492) or yarn v1 (80) are the ones
counted. The other 320 are left out. pnpm and Yarn Berry lockfiles record no host for a package from
the registry they were configured with, and bun's record one only for a registry other than npmjs.
Among them, one bun lockfile names `registry.npmmirror.com`, for 867 packages; one pnpm lockfile
names `npm.jsr.io`, which was not probed, and another `npm.pkg.github.com`. instruction-gap's caveat
holds: this is popular open source, not what people build at work.

A lockfile's hosts are instruction-gap's `resolved.hosts`: every distinct (name, version) it pins,
counted under the host of its first entry. For every host other than `registry.npmjs.org`, the
first lockfile by project name that records it was read at its commit, to tell registry tarballs
from other sources and to find the registry's base path ([src/hosts.py](src/hosts.py),
[results/hosts.json](results/hosts.json)).

502 of the 572 lockfiles are in [norte-labs dataset v2](https://doi.org/10.5281/zenodo.23090947),
with instruction-gap's other files. For the other 70, whose repositories have no license GitHub
detects, the dataset holds each file's URL, commit and hash.

## Probe

On 2026-09-25, for each registry ([src/probe.py](src/probe.py)): `GET <base>/-/npm/v1/keys`, where
npm takes a 404 or a 400 as no keys; and the full package document `GET <base>/lodash`, the one
npm's audit reads, where `versions["4.17.21"].dist` either carries `signatures` or does not. A
registry whose package documents answer 401 or 403 cannot be observed without credentials and is
counted apart.

## Result

| registry | lockfiles | versions | keys | signatures in lodash 4.17.21's document |
|---|---|---|---|---|
| `registry.npmjs.org` | 496 | 258,371 | served | yes |
| `registry.yarnpkg.com` | 77 | 66,762 | served | yes |
| `registry.npmmirror.com` | **24** | **13,489** | **none (404)** | none |
| `npm.flatt.tech` | 1 | 30 | served | yes |
| `npm.pkg.github.com` | 1 | 6 | 404 without credentials | not observable: lodash's documents answer 403 and 404 without credentials |
| `na.artifactory.swg-devops.com`, an Artifactory instance | 1 | 74 | 401 | not observable: 401 |

**24 of the 572 lockfiles, 4.2 % [2.8–6.2], resolve at least one package through a registry that
serves no keys**, all of them through `registry.npmmirror.com`: 13,489 of the 358,194 versions the
572 resolve, 3.8 %. 19 of the 24 also resolve packages through a registry that serves keys, 17 of
them through npmjs. In the other 5, npmmirror is the only host. GitHub Packages answered 404 for its
keys as well, but its documents could not be read without credentials, and its one lockfile is
counted apart with the Artifactory instance's.

npmmirror's documents carry npmjs's signatures for some versions and not for others: none for
`@types/lodash` 4.14.120 and lodash 4.17.21, published in 2019 and 2021; npmjs's for sigstore 5.0.0,
semver 7.8.5 and `@types/lodash` 4.17.25, published in 2026, the first two with attestations beside
them ([results/documents.json](results/documents.json)). How many of the 13,489 versions carry them
was not counted.

72 lockfiles hold packages with no URL recorded, 19,364 versions: packages bundled inside another
package's tarball, and packages whose registry the lockfile does not name. 37 hold git sources and
5 plain tarballs, which `audit signatures` skips.

## The lockfile and the audit

`audit signatures` takes a package's registry from the configuration in force when it runs, not from
the lockfile: the registry set for the package's scope if there is one, otherwise the registry of
the scope npm's `scope` setting names, if it is set, otherwise the default. With `lodash@4.17.21` on
npm 10.9.8 and 12.1.0, a tree whose lockfile names npmjs, audited with npmmirror configured, had
nothing to audit and exited 1; a tree whose lockfile names npmmirror, audited with the default
registry, passed ([results/npm-config/](results/npm-config/)).

What a registry without keys does to the audit then depends on its documents and on where it sits in
the configuration ([results/audit-cases/](results/audit-cases/)). With npmmirror as the only
registry, on npm 10.9.8 and 12.1.0, a tree of lodash 4.17.21 had nothing to audit and exited 1, and
a tree of semver 7.8.5 stopped with `EMISSINGSIGNATUREKEY` and exited 1. A tree passed with packages
left unchecked when a registry with keys verified part of it and npmmirror served the rest from
documents without signatures. With the default on npmjs and `@types` sent to npmmirror, lodash
4.17.21 and `@types/lodash` 4.14.120 audited as "audited 1 package" and exited 0 on both versions,
with `@types/lodash` counted nowhere; npm 12.1.0 printed a warning naming npmmirror before it. With
`@types/lodash` 4.17.25 both stopped with `EMISSINGSIGNATUREKEY`. The other way round, npmmirror as
the default and `@sigstore` sent to npmjs, npm 10.9.8 gave the same silent result for
`@sigstore/core` and lodash 4.17.21. npm 12.1.0 refused that install with its default settings: its
`replace-registry-host` turned the npmjs URL of `@sigstore/core` into an npmmirror one, which
`allow-remote` then would not fetch for a scope on npmjs (`EALLOWREMOTE`). Installed with
`--replace-registry-host=never` or `--allow-remote=all`, or by npm 10.9.8, the same tree audited the
same way on 12.1.0, with the warning naming npmmirror. None of these documents carried attestations
without signatures. From npm 11.11.0 the command also counts keyless Sigstore attestations, which it
verifies without registry keys ([npm/cli#9026](https://github.com/npm/cli/pull/9026)), and a tree
from a registry without keys passed that way in the one case run in
[../../tools/npm-audit-signatures/](../../tools/npm-audit-signatures/); other trees were not
measured.

A lockfile shows part of the configurations it was written under. npm and yarn v1 send every
unscoped package to the default registry, unless npm's `scope` setting names a scope with a registry
of its own, so a host that resolved unscoped packages was the default, or the registry of the scope
that `scope` names, when they were fetched. npmmirror was, in all 24. In 17 of the 19 mixed
lockfiles the registry with keys resolved unscoped packages too. In the other 2, npmjs resolved only
scoped packages, but the same scopes resolved through npmmirror in the same lockfile: `@harness-mix`
4 packages through npmjs and 2 through npmmirror, `@tauri-apps` 2 and 16. One configuration sends a
scope to one registry, so none of the 24 shows one configuration with both kinds of registry. Two of
them commit an `.npmrc` at the root that sets npmmirror as the default; none maps a scope or sets
`scope` ([results/scopes.json](results/scopes.json), [results/rcfiles.json](results/rcfiles.json)).

The 24 measure how often a registry without keys sits in a project's lockfile. How often an audit
covers only part of a tree is not measured here, and lockfiles cannot measure it. A lockfile that
names npmjs can also have been installed through a mirror, since npm by default replaces
`registry.npmjs.org` in a lockfile with the configured registry
([`replace-registry-host`](https://docs.npmjs.com/cli/v12/using-npm/config#replace-registry-host)).

## Figures

Each figure, where it comes from. instruction-gap's files are in its own `results/`; the others are
in `results/` here.

| figure | field or computation | source | as of |
|---|---|---|---|
| 892 lockfiles; 572, of which 492 npm and 80 yarn v1; 320 pnpm, Yarn Berry or bun | cells by `manager`: `npm`, `yarn`; `pnpm`, `yarn-berry`, `bun` | instruction-gap `cells.ndjson` | lockfiles at the 2026-09-17 heads |
| outside the 572: a bun lockfile naming `registry.npmmirror.com` for 867 packages; a pnpm lockfile naming `npm.jsr.io`, another naming `npm.pkg.github.com` | in each bun.lock, the host of the URL that is the second element of a package's entry; for pnpm, `resolved.hosts` | `left-out.json`, `src/left_out.py`; instruction-gap `cells.ndjson` | read 2026-10-07; lockfiles at the 2026-09-17 heads |
| 502 of the 572 in the dataset, 70 not | `shipped` of each lockfile's row: a copy, or not shipped for want of a detected license | dataset v2 `npm/provenance.ndjson` | version 2 |
| lockfiles and versions per host | `resolved.hosts` of the 572: the lockfiles naming the host, and its counts summed; a version counts under the host of its first entry | instruction-gap `cells.ndjson` | lockfiles at the 2026-09-17 heads |
| each registry's base | one lockfile per host, the first by project name, its URLs on that host read at its commit | `hosts.json`, `src/hosts.py` | read 2026-10-07; the bases fixed in `src/probe.py` are the same |
| keys served or not; signatures in lodash 4.17.21's document; not observable | `GET <base>/-/npm/v1/keys`: 200 with keys, or 404 or 400; `versions["4.17.21"].dist.signatures` in `GET <base>/lodash`; a package document answering 401 or 403 | `probe.json`, `src/probe.py` | 2026-09-25, finished 06:36 UTC |
| 24 of 572, 4.2 % [2.8–6.2]; GitHub Packages counted apart | lockfiles naming a host whose `/-/npm/v1/keys` answered 404, `keysStatus` in `probe.json`, with its documents observable; Wilson 95 % | `cells.ndjson`, `probe.json` | as above |
| 13,489 of 358,194, 3.8 % | `resolved.hosts` counts summed over that host, and over every host of the 572 | same | same |
| 19 of the 24 mixed, 17 of them through npmjs; 5 with no other host | the 24 by whether they also name a host that serves keys, and `registry.npmjs.org` | same | same |
| npmmirror's documents: no signatures for `@types/lodash` 4.14.120 and lodash 4.17.21, npmjs's for sigstore 5.0.0, semver 7.8.5 and `@types/lodash` 4.17.25; attestations for the first two of those; none with attestations and no signatures | `dist.signatures` keyids in the full and the per-version document, and whether the full one names `dist.attestations`, from npmmirror and from npmjs; publication time from npmjs's `time` | `documents.json`, `src/documents.py` | read 2026-10-08 |
| 72 with no URL recorded, 19,364 versions | `resolved.hosts` keys `registry`, a package with a version and no URL (71 lockfiles, 19,362 versions), and `none`, an entry with neither (one lockfile, 2) | `cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 37 with git sources, 5 with plain tarballs | `resolved.byKind`: `git`, and `tarball` less the one lockfile whose only such URLs are GitHub Packages downloads | `cells.ndjson` | same |
| npmjs named, npmmirror configured: exit 1; npmmirror named, default registry: exit 0 | `npm audit signatures` over `lodash@4.17.21` installed from one registry and audited under another, with a control installed and audited on npmjs (exit 0), on npm 10.9.8 and 12.1.0, with empty user and global configurations | `npm-config/`, `src/run-cfg.sh` | 2026-10-08, 01:48 UTC |
| npmmirror only: exit 1 for lodash 4.17.21 and for semver 7.8.5; default npmjs and `@types` on npmmirror: exit 0 with `@types/lodash` 4.14.120, `EMISSINGSIGNATUREKEY` with 4.17.25, on both versions; npmmirror default and `@sigstore` on npmjs: exit 0 with lodash, `EMISSINGSIGNATUREKEY` with semver on npm 10.9.8, install refused on npm 12.1.0 with its default settings, exit 0 with lodash once installed with `--replace-registry-host=never`, with `--allow-remote=all` or by npm 10.9.8 | `npm install`, then `npm audit signatures`, each case a fresh project with its own `.npmrc`, cache and empty user and global configurations, with a control on npmjs (exit 0); the newest `@types/lodash` on npmjs at the time of the run | `audit-cases/`, `src/audit-cases.sh` | 2026-10-08, 01:47 UTC |
| unscoped packages through npmmirror in 24 of 24; through the registry with keys in 17 of 19; npmjs with scoped packages only in 2, their scopes on npmmirror too | distinct package names in each lockfile's registry tarball URLs, by host, with or without an `@scope/`; `scopesOnTwoHosts`, each scope's packages by host | `scopes.json`, `src/scopes.py`, the 24 lockfiles at their commits | read 2026-10-07 |
| an `.npmrc` that sets npmmirror as the default in 2 of 24; no scope mapped and no `scope` set in any; none in the 2 above | the root `.npmrc`, and for yarn v1 `.yarnrc` and `.yarnrc.yml`, at each commit: whether it exists, and its lines naming a registry or setting `scope` | `rcfiles.json`, `src/rcfiles.py` | read 2026-10-07 |

## Files

- `results/hosts.json`: for each host other than npmjs, the lockfile read, its URLs on that host,
  how many are registry tarballs, and the base.
- `results/probe.json`, `results/probe.txt`, `results/finished-at.txt`: the probe of every
  registry, and the counts over the 572. `controls` holds the cases it ran before any host: npmjs's
  keys, a missing path on npmjs that has to answer 404, and the signatures in lodash's document on
  npmjs. Its classes go by lodash 4.17.21 alone.
- `results/documents.json`: for the five versions, the keyids of their signatures, and whether the
  full document names attestations, on npmmirror and on npmjs.
- `results/npm-config/npm10/`, `results/npm-config/npm12/`: the versions of npm and node, the two
  installs with their lockfiles, and the three audits with their exit codes. npm's cache directory
  was replaced by `<cache>` after the run.
- `results/audit-cases/npm10/`, `results/audit-cases/npm12/`: for each case, its `.npmrc`, the
  URLs its lockfile recorded, and the output and exit code of the install and of the audit.
  Paths under the run's directory are written `<out>`.
- `results/scopes.json`: for each of the 24, the scoped and unscoped packages each host resolved.
- `results/rcfiles.json`: for each of the 24, whether the root `.npmrc` exists, and for yarn v1
  `.yarnrc` and `.yarnrc.yml`, with the lines that name a registry or set `scope`.
- `results/left-out.json`: for the 50 bun and 6 pnpm 6.0 lockfiles, the registry hosts their
  package entries name.
- `src/`: `hosts.py`, `probe.py`, `run-cfg.sh` and `audit-cases.sh` (which take node's directory
  from `NODE_BIN`), `documents.py`, `scopes.py`, `rcfiles.py`, `left_out.py`.
