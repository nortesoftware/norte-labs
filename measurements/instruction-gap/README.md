# measurements/instruction-gap

**Results: [findings.md](findings.md)** (narrative) and [results/report.md](results/report.md)
(generated figures). Run of 2026-09-17: 1,200 repositories drawn from a frame of 38,791, 892
lockfiles read, 88,376 package versions looked up. Corrections are at the end of this file,
[below](#corrections).

A developer writes one command, `npm install` or its equivalent, with a package.json that
declares D direct dependencies. How many decisions does the package manager take on the
developer's behalf, and how many distinct publishers end up with code on the machine that the
developer never chose? Read from lockfiles of real GitHub projects, nothing installed: no
tarballs, no sandbox. Prior art is in
[../../prior-art/instruction-gap.md](../../prior-art/instruction-gap.md); the count of packages
per project has been published several times, the count of publishers per project for a
declared sample has not.

## Frame and sample

The frame is every GitHub repository whose primary language is JavaScript or TypeScript, with
at least 100 stars, pushed within the twelve months before 2026-09-17, not a fork: 38,791
repositories (15,466 JavaScript, 23,317 TypeScript, 8 unlabelled), enumerated in full through
the search API in 59 star bands, none at the API's 1,000-result cap
(`results/frame-2026-09-17.ndjson.gz`). The sample is the first 1,200 repositories in the
order of `sha256("norte-labs instruction-gap 2026-09-17" + "\n" + fullName)`, a simple random order
anyone can reproduce from the frame file. Each is pinned to the head commit of its default
branch on the day; the root listing says whether it has a package.json and which lockfiles it
commits. 1,018 have a root package.json; of those 898 commit a lockfile; 892 could be read (six
commit only the binary `bun.lockb`). Candidates without a lockfile stay in
`results/population.ndjson` with the reason, because the share that commits one is a figure.

This frame is a population of popular open-source repositories, not of the projects developers
run `npm install` in. Libraries, tools and monorepos are over-represented against applications
and private code; the star threshold selects for maturity; the twelve-month push window selects
for maintenance. Every rate below is a rate over this frame. Projects sharing a framework share
much of a tree, so the means carry a cluster-robust interval with the framework as the cluster
and the design effect is reported.

## Instrument

Per project:

1. **Declared**: the distinct package names in `dependencies`, `devDependencies` and
   `optionalDependencies` of the root manifest and of every workspace manifest the lockfile
   embeds (npm v2+, pnpm, Yarn Berry and bun record them; for yarn v1 monorepos the workspace
   manifests are fetched from the repository), less the project's own packages: names the
   lockfile records as linked rather than resolved, and specs beginning `workspace:`, `file:`,
   `link:` or `portal:` (see the limit below). Peer dependencies are counted apart. Development
   dependencies are included: a developer's `npm install` installs them.
2. **Resolved**: the distinct (name, version) pairs the lockfile pins, read by one parser per
   format — package-lock.json v1/v2/v3, yarn.lock v1 and Berry, pnpm-lock.yaml v5/v6/v9,
   bun.lock. Aliases (`alias@npm:real@range`) resolve to the real package. A package present in
   two versions counts twice; the same version nested twice counts once. Where the lockfile
   records a URL per package (npm, yarn v1), its host is recorded; pnpm, Berry and bun resolve
   registry packages against the configured registry and record a URL only for tarball and git
   sources.
3. **Who published it**: for every resolved registry package, the version's manifest is read
   from `registry.npmjs.org/<name>/<version>` — one small request per version, cached
   (`results/registry.ndjson.gz`): the publishing account (`_npmUser`), the maintainer list,
   the install scripts (`preinstall`, `install`, `postinstall`; a `binding.gyp` counts, since
   npm builds it), the tarball host, and whether a provenance attestation exists. A version
   published through trusted publishing carries "GitHub Actions" as its user; its publisher is
   then the repository the provenance attestation names (`gha:<owner>/<repo>`), or, when the
   version has no attestation, the repository the manifest names, marked as unattested.
4. **Cells** (`results/cells.ndjson`): per project, the counts defined in `src/compute.ts`
   (the ratios are taken in `src/report.ts`): direct, resolved, names the developer never named, versions the manager
   chose (every resolved pair except those a direct dependency pins exactly), distinct
   publishers, publishers behind a direct dependency and behind none, maintainer accounts,
   packages and publishers with install-time code, hosts, and a framework cluster (the first
   of next, nuxt, angular, sveltekit, svelte, remix, astro, gatsby, vue, react, nest, express,
   fastify, hono, koa, electron, react-native, vite, webpack, typescript found in the production
   dependencies, else among the direct dependencies; peer dependencies are not searched).

Publisher accounts whose name says automation (`*bot`, `*-ci`, `release-bot`, `types`, trusted
publishing repositories …) are counted and reported apart, by a name heuristic published with
the results; the headline counts identities, not people.

### What is not measured

- Whether the install-time code runs. Since npm 12 (2026-07-08) npm blocks dependency install
  scripts unless the root manifest allows them; pnpm 10 (2025-01), Bun and Yarn Berry block
  them by default too, Bun with a built-in allowlist. The count here is of code declared to run
  at install in the resolved tree; it runs as such under yarn v1 and npm before 12, and under
  the others only where allowed.
- Platform-conditional optional dependencies (`fsevents` on macOS) are counted as resolved, and
  no figure is given without them: the cells do not list the packages each project resolves.
  The count of projects whose install-time code is entirely optional is not reported, because
  yarn v1, Berry and bun lockfiles do not mark it.
- The lockfile's `resolved` host is not always what an install contacts: npm rewrites
  `registry.npmjs.org` to the configured registry, and mirrors rewrite tarball URLs to
  themselves.
- Maintainer lists are the ones each version recorded when it was published, not the package's
  list today.
- Eight rows of the frame carry no language in the search result although the query selected
  on it; they are kept.
- 42 of the 898 repositories with a lockfile commit more than one. The one read is the one the
  `packageManager` field names, else package-lock.json, then npm-shrinkwrap.json, pnpm-lock.yaml,
  yarn.lock, bun.lock; 34 of the 892 cells carry the note. Which one the developer's install actually
  reads depends on the command; the choice is recorded per project in
  `results/population.ndjson`.
- Of the 88,376 versions looked up, 16 answer 404 (17 counted once per project, as the
  generated report sums them; versions no longer on the registry, e.g. yanked prereleases); 27
  read versions carry no `_npmUser` at all and count as unknown publisher. 156 resolved pairs
  across all projects are not registry packages (113 git, 41 tarball, and 2 of neither kind in
  one npm lockfile) and were not looked up. One registry pair, in `pithings/zigpty`, has no record and counts as a lookup
  error.
- Of the 17,498 versions published through trusted publishing, 456 have no attestation (a
  publish with provenance disabled, e.g. `@babel/*`, `storybook`, `@vercel/*`, `@swc/*`). For 419
  of them the identity is the repository the manifest's `repository` field names, marked as
  unattested; the other 37 have neither and count as unknown. The 64 versions with no publisher are 198 counted once per
  project that resolves them, as the generated report sums them.
- The automation rule, `AUTOMATION` in `src/compute.ts` (`bot$`, `^bot-`, `-bot-`, `robot`,
  `automation`, `^types$`, `release-?bot`, `^npm$`, `^github actions$`, `\bci$`, `-ci$`,
  `^ci-`, `deploy`, `publisher$`, case-insensitive, and every trusted-publishing repository),
  matches 1,938 of the 7,569 identities: 1,762 trusted-publishing repositories and 176
  accounts. Accounts named like people that are in fact shared or automated tokens are not
  caught, so the "not automation" figures are an upper bound on people.
- A workspace package that a sibling declares with a plain version range is left out of the
  direct count only where the lockfile names it as linked: npm v2 and v3 lockfiles, and bun's.
  yarn v1 lockfiles do not list workspace packages, pnpm's record the link only in the
  importer's `version`, which is not read, and Yarn Berry's workspace entries are not read as
  links. In those lockfiles such a sibling counts as a direct dependency. How many projects this
  affects is not measured.
- An npm v1 or pnpm v6 lockfile gets production figures only if it holds at least one
  development-only package; each of the 22 npm v1 and 6 pnpm v6 lockfiles here does. An npm v2
  or v3 lockfile gets them only if it resolves at least one package; 9 npm v3 lockfiles here
  resolve nothing, so the production figures cover 483 of the 492 npm lockfiles.
- PyPI. Its registry does not say who uploaded a release, only who holds a role on the
  project; the instrument transfers to "who may publish", not to "who published". Not run.

## Running it

```
node src/frame.ts    results/frame-<date>.ndjson --since <date-12 months>
node src/sample.ts   results/frame-<date>.ndjson results/population.ndjson <store> --n 1200
node src/registry.ts results/population.ndjson <store> <cache> results/registry.ndjson
node src/compute.ts  results/population.ndjson <store> results/registry.ndjson results/cells.ndjson
node src/report.ts   results/population.ndjson results/cells.ndjson results/frame-<date>.ndjson results/report.md
```

The frame and the registry records are published compressed (`results/frame-2026-09-17.ndjson.gz`,
`results/registry.ndjson.gz`) and are read decompressed. `src/report.ts` counts the frame file's
lines, so given the compressed file it prints a wrong frame size.

`gh` must be authenticated (search: 30 requests a minute; core: two per candidate, three for a yarn
v1 monorepo; files are read from raw.githubusercontent.com). The
instrument's one dependency is `yaml`, for pnpm and Yarn Berry lockfiles (`src/package.json`:
one direct dependency, one resolved version, one publisher). Temporary files live under
`/var/tmp/nl-instruction/` (repository files at the pinned commits, ~310 MB; the registry
cache, ~800 MB). Deleted when the run is done.

## Figures

Each figure stated in findings.md or in this file, with the field it is computed from. Quantiles
interpolate linearly between order statistics; a ratio's denominator is at least 1; shares
carry 95 % Wilson intervals.

| figure as published | where (file:line) | field or computation | source file | moment (as of when) |
|---|---|---|---|---|
| 1,200 repositories drawn | findings.md:3, 98; README.md:4 | rows | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| frame of 38,791 | findings.md:4-5; README.md:4, 20 | rows | `results/frame-2026-09-17.ndjson.gz` | search of 2026-09-17 |
| 892 lockfiles read | findings.md:3, 46, 139; README.md:4 | rows | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 88,376 package versions looked up | findings.md:93; README.md:5, 100 | rows | `results/registry.ndjson.gz` | registry records of the 2026-09-17 run |
| 15,466 JavaScript | README.md:21 | rows with `language` JavaScript | `results/frame-2026-09-17.ndjson.gz` | search of 2026-09-17 |
| 23,317 TypeScript | README.md:21 | rows with `language` TypeScript | `results/frame-2026-09-17.ndjson.gz` | search of 2026-09-17 |
| 8 unlabelled | README.md:21, 93 | rows with `language` null | `results/frame-2026-09-17.ndjson.gz` | search of 2026-09-17 |
| 59 star bands, none at the 1,000-result cap; 26 JavaScript and 33 TypeScript | README.md:22, 346 | distinct `band`, by the language before the colon; the largest band holds 999 rows | `results/frame-2026-09-17.ndjson.gz` | search of 2026-09-17 |
| the first 1,200 in the order of `sha256(seed + "\n" + fullName)` | README.md:23-24 | frame rows sorted by that hash; the first 1,200 `fullName`s, in order, are the population's | `results/frame-2026-09-17.ndjson.gz`, `results/population.ndjson` | search of 2026-09-17 |
| 1,018 have a root package.json; 84.8 % [82.7–86.8] | findings.md:98; README.md:27 | `hasPackageJson` true, of 1,200 | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| 898 commit a lockfile; 88.2 % [86.1–90.1] | findings.md:98-99; README.md:27 | `lockfile` not null, of 1,018 | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| 892 could be read | README.md:27 | `status` ok | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| six commit only `bun.lockb`; 0.7 % | findings.md:101; README.md:27 | `status` binary-lockfile; `lockfile` bun.lockb, of 898 | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| package-lock.json 54.8 % [51.5–58.0] | findings.md:99 | `lockfile` package-lock.json, of 898 | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| pnpm-lock.yaml 27.4 % [24.6–30.4] | findings.md:99-100 | `lockfile` pnpm-lock.yaml, of 898 | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| yarn.lock 11.6 % [9.7–13.8] | findings.md:100 | `lockfile` yarn.lock, of 898 | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| 80 v1, 24 Berry | findings.md:100 | `manager` yarn and yarn-berry | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| bun.lock 5.6 % | findings.md:100 | `lockfile` bun.lock, of 898 | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| 42 of the 898 commit more than one; 4.7 % | findings.md:101; README.md:95 | `lockfiles` longer than one, of 898 | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| 34 of the 892 cells carry the note | README.md:97 | `notes` with an entry beginning "several lockfiles" | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 243 of the 892 read declare a `packageManager` field (173 pnpm, 36 yarn, 16 bun, 16 npm, one `nub`, one `^npm`) | findings.md:101-102; README.md:334 | `packageManager` not null among the 892 with `status` ok, by name before `@` | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| 247 of the 1,200 declare it; the four managers named sum to 241 | README.md:335 | `packageManager` not null among all 1,200 (174 pnpm, 37 yarn, 17 bun, 17 npm, one `nub`, one `^npm`); 173 + 36 + 16 + 16 | `results/population.ndjson` | default-branch heads of 2026-09-17 |
| 26 direct dependencies [13–56] | findings.md:12, 40; README.md:291 | median [p25–p75] of `declared.direct` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 604 package versions [293–1,074] | findings.md:13, 40; README.md:291 | median [p25–p75] of `resolved.versions` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 543 distinct names | findings.md:13 | median of `resolved.names` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 19.1 per declared dependency [13.0–27.8] | findings.md:13-14; README.md:294 | median [p25–p75] of `resolved.versions` / `declared.direct` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 165 publishing identities [94–259] | findings.md:14-15; README.md:291 | median [p25–p75] of `publishers.total` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 5.3 per direct dependency [3.5–7.7] | findings.md:15 | median [p25–p75] of `publishers.total` / `declared.direct` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 401 maintainer accounts [239–628] | findings.md:17; README.md:284, 291 | median [p25–p75] of `maintainers.total` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; maintainer lists as each version recorded them when published |
| 12.9 per direct dependency | findings.md:17 | median of `maintainers.total` / `declared.direct` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; maintainer lists as each version recorded them when published |
| 87 % [p10 76 %, p90 94 %], over the 881 projects with at least one publisher | findings.md:19-20; README.md:309-310 | median, p10, p90 of `publishers.notChosen` / `publishers.total`, over the 881 projects with `publishers.total` > 0, as printed in `results/report.md` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 11 lockfiles that resolve nothing; over all 892, p10 75.0 % and automation 18.3 % | README.md:311-312 | projects with `resolved.versions` 0 (all 11 have `publishers.total` 0); the same p10 and automation median over 892 with those 11 as 0 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| a median of 18 publishers behind the packages named | findings.md:20 | median of `publishers.behindDirect`, over all 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| a median of 143 behind none | findings.md:21 | median of `publishers.notChosen`, over all 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 18 and 143 sum to 161 | README.md:306-307 | 18 + 143, against the median of `publishers.total`, 165 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 99.9 % in the median project | findings.md:22; README.md:324 | median over the 892 of `decisions.versionsByManager` / `resolved.versions` (0 for the 11 that resolve nothing; 99.9 % over the 881 as well) | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 99.0 % over everything resolved | README.md:325 | sum of `decisions.versionsByManager` over sum of `resolved.versions` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 52.6 % [49.3–55.8] pin at least one | findings.md:22; README.md:293 | `declared.exact` > 0, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 3.1 % [2.2–4.5] pin all | findings.md:23 | `declared.specsTotal` > 0 and `declared.exact` = `declared.specsTotal`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 44.5 packages in more than one version | findings.md:24; README.md:327 | median of `resolved.duplicatedNames` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 18.6 % automation, over the 881 | findings.md:29-30; README.md:310 | median of `publishers.automation` / `publishers.total`, over the 881 projects with `publishers.total` > 0, as printed in `results/report.md` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 130 publishers without automation | findings.md:30-31 | median of `publishers.total` − `publishers.automation`, over all 892, as printed in `results/report.md` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 4.3 per direct dependency [2.7–6.4] | findings.md:31; README.md:295 | median [p25–p75] of (`publishers.total` − `publishers.automation`) / `declared.direct`, over all 892, as printed in `results/report.md` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 1,762 of the 7,569 identities are trusted-publishing repositories, 23.3 % | findings.md:31-32; README.md:330 | identities in `publishers.ids` beginning `gha:`, of the 7,569; the same 1,762 are the identities whose registry records have `publisherKind` trusted-publishing | `results/cells.ndjson`, `results/registry.ndjson.gz` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 25,615 of 173,191 project-publisher pairs, 14.8 % | README.md:328-329 | sum over projects of `publishers.trustedPublishing` / sum of `publishers.users` + `publishers.trustedPublishing` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 73.2 % [70.2–76.0] | findings.md:32 | `publishers.trustedPublishing` > 0, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 489 lockfiles (483 npm, 6 pnpm v6) | findings.md:36; README.md:292, 303 | `prod` not null; by `manager` and `lockfileVersion` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| each of the 22 npm v1 and 6 pnpm v6 lockfiles holds a development-only package; 9 npm v3 lockfiles that resolve nothing get no production figures, so 483 of the 492 npm lockfiles have them | README.md:124-126 | cells with `manager` npm and `lockfileVersion` 1 (22) and with `manager` pnpm and `lockfileVersion` 6.0 (6), every one with `resolved.devOnlyVersions` > 0 and `prod` not null; `manager` npm and `prod` null (9, all `lockfileVersion` 3 and `resolved.versions` 0) | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| a median of 5 packages declared in `dependencies` | findings.md:37 | median of `declared.byField.dependencies`, same 489 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 53 versions | findings.md:37 | median of `prod.versions` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 20 publishers (2.6 per direct dependency) | findings.md:37; README.md:292-293 | medians of `prod.publishers` and of `prod.publishers` / `declared.byField.dependencies` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 7,569 distinct publishing identities | findings.md:32, 46; README.md:114, 330 | distinct values in `publishers.ids` over the 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 43.0 % [41.9–44.1] in one project only | findings.md:46 | identities in exactly one project's `publishers.ids`, of 7,569 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 79 (1.0 % of identities) in half the projects or more | findings.md:47 | identities in ≥ 446 projects' `publishers.ids` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| a third of a median project's publishers (33.3 %) | findings.md:48 | median over projects of the share of `publishers.ids` among those 79 (33.3 % over the 881 or the 892) | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| four accounts in nine projects of ten | findings.md:48 | identities in ≥ 90 % of projects' `publishers.ids` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `types` 92.5 % [90.6–94.0] | findings.md:49 | projects whose `publishers.ids` hold `types`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `isaacs` 91.9 % | findings.md:50 | projects whose `publishers.ids` hold `isaacs`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `sindresorhus` 91.5 % | findings.md:50 | projects whose `publishers.ids` hold `sindresorhus`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `qix` 90.1 % | findings.md:50 | projects whose `publishers.ids` hold `qix`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `styfle` 86.8 % | findings.md:50 | projects whose `publishers.ids` hold `styfle`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `typescript-bot` 85.2 % | findings.md:51 | projects whose `publishers.ids` hold `typescript-bot`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `ljharb` 83.7 % | findings.md:51 | projects whose `publishers.ids` hold `ljharb`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `juliangruber` 83.4 % | findings.md:51 | projects whose `publishers.ids` hold `juliangruber`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `phated` 83.4 % | findings.md:51 | projects whose `publishers.ids` hold `phated`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `jonschlinkert` 83.1 % | findings.md:51-52 | projects whose `publishers.ids` hold `jonschlinkert`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `matteo.collina` 82.1 % | findings.md:52 | projects whose `publishers.ids` hold `matteo.collina`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `alexeyraspopov` 81.5 % | findings.md:52 | projects whose `publishers.ids` hold `alexeyraspopov`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `kevva` 81.3 % | findings.md:52 | projects whose `publishers.ids` hold `kevva`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `lukeed` 81.2 % | findings.md:52 | projects whose `publishers.ids` hold `lukeed`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `npm/node-semver` 53.7 % | findings.md:53 | projects whose `publishers.ids` hold `gha:npm/node-semver`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `SuperchupuDev/tinyglobby` 48.7 % | findings.md:54 | projects whose `publishers.ids` hold `gha:SuperchupuDev/tinyglobby`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `babel/babel` 47.3 % | findings.md:54 | projects whose `publishers.ids` hold `gha:babel/babel`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `nodejs/undici` 44.2 % | findings.md:54 | projects whose `publishers.ids` hold `gha:nodejs/undici`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `browserslist/caniuse-lite` 41.0 % | findings.md:55 | projects whose `publishers.ids` hold `gha:browserslist/caniuse-lite`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `lovell/detect-libc` 40.8 % | findings.md:55 | projects whose `publishers.ids` hold `gha:lovell/detect-libc`, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 87.6 % [85.2–89.6] with install-time code | findings.md:63 | `install.versions` > 0, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| a median of 3 such packages from 3 publishers, 0 direct | findings.md:64-65 | medians of `install.names`, `install.publishers`, `install.direct` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 85.3 % [82.8–87.5] from a package never named | findings.md:65; README.md:315 | `install.versions` > `install.direct`, of 892: some install-time version belongs to a name the developer did not declare (`install.direct` counts versions) | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 83.0 % [80.4–85.3] before; 761 of 892 now; 21 projects left out by the earlier rule | README.md:314-318 | `install.names` > `install.direct`, of 892 (740, the earlier rule); `install.versions` > `install.direct`, of 892 (761); 761 − 740 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 409 of the 781 | findings.md:66 | `install.direct` = 0 among the 781 with `install.versions` > 0 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 305 distinct packages carry it | findings.md:67 | distinct `name` among records with `status` ok and `hasInstallScript` | `results/registry.ndjson.gz` | registry records of the 2026-09-17 run |
| from 280 identities | findings.md:67-68 | distinct non-null `publisher` among records with `status` ok and `hasInstallScript` (two such records have none) | `results/registry.ndjson.gz` | registry records of the 2026-09-17 run |
| `pipobscure`, whose only package here is `fsevents`, reaches 696 projects | findings.md:68-69 | projects whose `publishers.ids` hold `pipobscure`; its 11 records are all `fsevents`, all with `hasInstallScript` | `results/cells.ndjson`, `results/registry.ndjson.gz` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 572 projects record a URL per package | findings.md:82 | `manager` npm or yarn | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| a median project resolves from one host | findings.md:83 | median count of `resolved.hosts` keys other than none and registry, over the 572 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 11.7 % [9.3–14.6] with another host | findings.md:83 | a `resolved.hosts` key other than registry.npmjs.org, registry.yarnpkg.com, registry, none; of 572 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| registry.yarnpkg.com 13.5 % | findings.md:84 | `resolved.hosts` holds the host, of 572 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| `github.com` 5.8 % | findings.md:84 | as above | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| `registry.npmmirror.com` 4.2 % (24 projects) | findings.md:85 | as above | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| `codeload.github.com` 1.0 % | findings.md:88 | as above | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| one project each on six hosts | findings.md:88 | hosts in exactly one project's `resolved.hosts` among the 572 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| `pkg.pr.new` in one bun and `npm.jsr.io` in one pnpm lockfile, outside the 572 | findings.md:90; README.md:331 | `resolved.hosts` over the 892, with `manager` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 7.6 % [6.1–9.6] with a git or tarball dependency | findings.md:91 | `resolved.byKind.git` + `resolved.byKind.tarball` > 0, of 892 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| 156 resolved pairs not from the registry, 154 of them git or tarball | findings.md:92; README.md:102-103, 322-323 | sum of `lookup.nonRegistry`; sums of `resolved.byKind` git 113, tarball 41, other 2 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| every version looked up has its tarball on registry.npmjs.org | findings.md:92 | `tarballHost` of the 88,360 records with `status` ok | `results/registry.ndjson.gz` | registry records of the 2026-09-17 run |
| 16 no longer on the registry; 17 per project | findings.md:93-94; README.md:100 | `status` missing; the report's 17 is the sum of `lookup.missing` | `results/registry.ndjson.gz`, `results/cells.ndjson` | registry records of the 2026-09-17 run |
| one registry pair in `pithings/zigpty` has no record | README.md:104, 347 | `lookup.error` > 0: one cell, one pair | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 27 carry no `_npmUser` | README.md:101 | `publisherKind` unknown | `results/registry.ndjson.gz` | registry records of the 2026-09-17 run |
| 17,498 through trusted publishing | README.md:106 | `publisherKind` trusted-publishing, `status` ok | `results/registry.ndjson.gz` | registry records of the 2026-09-17 run |
| 456 with no attestation, 419 of them named by the manifest | README.md:106-108 | same, `provenance.present` false (456); of those, `repositorySource` manifest and `publisher` set (419) | `results/registry.ndjson.gz` | registry records of the 2026-09-17 run |
| 37 with neither | README.md:109 | same, `publisher` null | `results/registry.ndjson.gz` | registry records of the 2026-09-17 run |
| 64 versions with no publisher, 198 per project | README.md:108-109 | `status` ok and `publisher` null; sum of `publishers.unknownVersions` | `results/registry.ndjson.gz`, `results/cells.ndjson` | registry records of the 2026-09-17 run |
| 1,938 of 7,569 match the automation rule: 1,762 repositories, 176 accounts; 16 repositories only through unattested versions | README.md:114, 342-343 | identities in `publishers.ids` matching `AUTOMATION` in `src/compute.ts`; each cell's `publishers.automation` equals the count of its ids that match; repositories with no record carrying `provenance.present` | `results/cells.ndjson`, `results/registry.ndjson.gz` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| pnpm: median 46.5 direct, 875 versions, 216.5 publishers | findings.md:103; README.md:337 | medians of `declared.direct`, `resolved.versions`, `publishers.total`, `manager` pnpm (246) | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| npm: 19, 445, 132 | findings.md:103-104 | same, `manager` npm (492) | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| publishers per direct: 5.8 npm, 5.7 yarn v1, 4.5 pnpm, 3.8 bun, 5.3 Berry | findings.md:104-105; README.md:296 | median of `publishers.total` / `declared.direct` by `manager` | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 219 monorepos: 201 by the lockfile, 18 yarn v1 | findings.md:105-106; README.md:319-321 | `workspaces` > 1 (always 1 for yarn v1), plus yarn v1 cells whose `workspaceManifests` is not empty | `results/cells.ndjson`, `results/population.ndjson` | lockfiles at the 2026-09-17 heads |
| Jaccard 0.212 same framework | findings.md:112 | mean Jaccard of `publishers.ids` over the 50,053 pairs with the same `framework` other than `none`; the 9,180 pairs within `none` count with the other group | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 0.168 different or no framework | findings.md:112 | same, the other 347,333 pairs | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 21 clusters, mean size 42.5 | findings.md:113 | distinct `framework`; 892 / 21 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads |
| ICC 0.081 | findings.md:114 | one-way ANOVA ICC of `publishers.total` / `declared.direct`, `framework` as cluster, mean cluster size in place of n0 | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| design effect 11.4 | findings.md:114-115 | variance of the mean from cluster sums over the iid variance, same ratio | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| mean ratio 7.0, iid [6.5–7.6], cluster-robust [5.2–8.8] | findings.md:115-116; README.md:297 | mean ± 1.96 × iid and cluster-robust standard errors, same ratio | `results/cells.ndjson` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| ICC 0.29 and design effect 36.5, distinct publishers; 0.26 and 33.5, resolved versions | findings.md:116-117; README.md:338 | same ICC and design effect, of `publishers.total` and `resolved.versions` | `results/cells.ndjson`; printed in `results/report.md` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| 41.1, the design effect of log10 publishers | README.md:339 | same design effect, of log10 `publishers.total` | `results/cells.ndjson`; printed in `results/report.md` | lockfiles at the 2026-09-17 heads; registry records of the 2026-09-17 run |
| `src/package.json`: one direct dependency, one resolved version, one publisher | README.md:147 | `dependencies` of `src/package.json`; `packages` of `src/package-lock.json`; `publisher` of yaml 2.8.1 | `src/package-lock.json`, `results/registry.ndjson.gz` | the instrument as published |
| 30 projects, 133 names | README.md:289 | projects whose `declared.direct` fell from the first file to the current one, and the fall summed | `results/cells.ndjson` as first published (commit 8d9bbb2), `results/cells.ndjson` | before and after the fix |
| before the fix: 461; 2.5; 52.8 % [49.5–56.1]; [12.9–27.7]; [2.6–6.4]; 5.7; [6.5–7.5] | README.md:292, 293, 294, 295, 296, 297 | the computations of the rows above for 489, 2.6, 52.6 %, 19.1, 4.3, the npm ratio and the mean ratio, on the first file | `results/cells.ndjson` as first published (commit 8d9bbb2) | before the fix |
| four GitLab trusted-publishing records | README.md:300 | `publisher` beginning `gha:https://gitlab.com/` | `results/registry.ndjson.gz` | registry records of the 2026-09-17 run |

## Corrections

### 2026-09-25

- The 401 maintainer accounts were described as the accounts that may publish, read at lookup
  time. They are the maintainers each resolved version recorded when it was published, which
  can include accounts that have since lost access and leaves out any added since. How many of
  them can publish today is not measured.
- A workspace package declared by a sibling with a plain version range counted as a direct
  dependency in npm v2 and v3 lockfiles (30 projects, 133 names), and an npm v2 or v3 lockfile
  with no development-only package got no production figures. With both fixed in `src/lockfile.ts` and `src/compute.ts`, the medians
  of 26 direct dependencies, 604 versions, 165 publishers and 401 maintainers stand. The
  production table covers 489 lockfiles, not 461, and its publishers per direct dependency are
  2.6, not 2.5; 52.6 % [49.3–55.8] of projects pin a direct dependency exactly, not 52.8 %
  [49.5–56.1]; the quartiles of resolved versions per direct dependency are [13.0–27.8], not
  [12.9–27.7], and of non-automation publishers per direct dependency [2.7–6.4], not
  [2.6–6.4]; npm's median publishers per direct dependency is 5.8, not 5.7; the mean ratio's
  iid interval is [6.5–7.6], not [6.5–7.5].
- The README gave the sample order as `sha256(seed + fullName)`; the code joins them with a
  newline, and so does the population.
- Four registry records, for `libphonenumber-js`, name a GitLab trusted-publishing repository as
  `gha:https://gitlab.com/catamphetamine/libphonenumber-js`: `src/registry.ts` strips only
  GitHub's prefix. No count changes.
- Six rows of the production table are pnpm v6 lockfiles, which mark development dependencies as
  npm's do; the table, and the limits in findings.md, called them all npm lockfiles.
- The developer was said to have asked for 26 packages from 18 publishers and received code from
  143 more, as if in one project. 18 and 143 are medians of separate counts,
  `publishers.behindDirect` and `publishers.notChosen`; they sum to 161, not to the median of
  165.
- The median shares of a project's publishers behind no named package (87 % [p10 76 %,
  p90 94 %]) and with an automation name (18.6 %) are over the 881 projects with at least one
  publisher; the text gave no denominator. `src/report.ts` took the first share over all 892,
  with the 11 lockfiles that resolve nothing counted as 0 (p10 75.0 %), and printed no
  automation share (taken the same way it is 18.3 %). It now prints both over the 881.
- It was 83.0 % [80.4–85.3] of projects whose install-time code comes from a package the
  developer never named; it is 85.3 % [82.8–87.5], 761 of 892. `src/report.ts` compared the
  number of install-time package names with `install.direct`, which counts versions, and left
  out 21 projects that hold install-time code from a package never named; it now compares
  versions with versions.
- 201 of the 892 were given as the monorepos with more than one workspace manifest. yarn v1
  lockfiles record no workspaces, so the count left out the 18 yarn v1 projects whose workspace
  manifests were fetched; with them it is 219.
- The git and tarball pairs were given as 156. 156 is every resolved pair not from the
  registry; 2 of them are of neither kind, and the git and tarball pairs are 154.
- The manager was said to have chosen the version of 99.9 % of what it installed. 99.9 % is the
  median project's share; over everything resolved it is 99.0 %.
- A median project was said to hold 44 packages in more than one version; the median of
  `resolved.duplicatedNames` is 44.5.
- Trusted publishing was given as 14.8 % of all publisher identities. 14.8 % is its share of
  project-publisher pairs (25,615 of 173,191), each publisher counted once per project it is
  in. Of the 7,569 identities, 1,762 are trusted-publishing repositories, 23.3 %.
- `pkg.pr.new` and `npm.jsr.io` were listed among the one-project hosts of the 572 npm and
  yarn v1 lockfiles. They are in one bun and one pnpm lockfile, outside the 572, which hold six
  such hosts, not eight.
- The 243 projects that declare a `packageManager` field were given under the 1,200 drawn. 243
  is of the 892 read (247 of the 1,200), and the four managers named sum to 241; the other two
  values are `nub` and `^npm`.
- pnpm projects' median publishers were given as 216; the median is 216.5.
- The design effects of the raw counts were given as 33 to 41. They are 36.5 for distinct
  publishers and 33.5 for resolved versions; 41.1 is that of log10 publishers, not a raw count.
- The automation rule was printed with `ci$` and `release-bot` and without `^github actions$`,
  and said to match 1,921 of the 7,569 identities: 1,746 trusted-publishing repositories and
  175 accounts. The rule in `src/compute.ts` has `\bci$` and `release-?bot` and matches 1,938:
  1,762 repositories, 16 of them only through unattested versions, and 176 accounts.
- verification.md, published with the first run (commit 8d9bbb2) and since removed, gave the
  frame as 22 JavaScript and 33 TypeScript star bands. The frame file
  has 26 JavaScript and 33 TypeScript, the 59 this README states.
- One resolved registry pair, in `pithings/zigpty`, has no registry record and counts as a
  lookup error; the README did not say so. No figure changes.
- The medians by number of direct dependencies (10 to 15: n = 106, 329 versions, 98
  publishers [71–138]; 20 to 30: n = 140, 557 versions, 148 publishers) were withdrawn: no
  computation in the repository produces them. The tree by number of direct dependencies is not
  reported.
- The medians by framework cluster (Next.js or React: 49 direct, ~890 versions, ~220 to 230
  publishers; TypeScript only: 18, 376, 118; no framework marker: 6, 186, 73, 8.2 per direct
  dependency), the statement that the ratio is highest where the developer asked for least, and
  the factor of two to three between a Next.js tree and a TypeScript-only library were
  withdrawn: no computation in the repository produces them. The tree by framework is not
  reported.
- The projects resolving each install-time package (`fsevents` 703, `esbuild` 444, `core-js`
  136, `sharp` 136, `unrs-resolver` 118, `@parcel/watcher` 114, `protobufjs` 98,
  `core-js-pure` 75, `@swc/core` 72, `electron` 41, `puppeteer` 39, `workerd` 35,
  `better-sqlite3` 32), the figures without `fsevents` (686 projects, 76.9 %, a median of 2
  packages from 2 publishers) and the install-time reach of `esbuild`'s two identities (267 and
  264), `zloirock` (164) and `devongovett` (114) were withdrawn: no file in the repository
  produces them. How many projects each install-time package or identity reaches is not
  measured.
- 41 of the 892 projects (4.6 %) carrying an allowlist (14 `allowScripts`, 21 pnpm
  `onlyBuiltDependencies` or `allowBuilds`, 6 bun `trustedDependencies`; the other 851) was
  withdrawn: no file in the repository produces it. How many projects carry an allowlist of
  their own is not measured.
