# measurements/instruction-gap

**Results: [findings.md](findings.md)** (narrative) and [results/report.md](results/report.md)
(generated figures). Run of 2026-09-17: 1,200 repositories drawn from a frame of 38,791, 892
lockfiles read, 88,376 package versions looked up. Additional checks and corrections in
[verification.md](verification.md).

A developer writes one command, `npm install` or its equivalent, with a package.json that
declares D direct dependencies. How many decisions does the package manager take on the
developer's behalf, and how many distinct publishers end up with code on the machine that the
developer never chose? Read from lockfiles of real GitHub projects, nothing installed: no
tarballs, no sandbox. The prior-art sweep is in
[../../prior-art/instruction-gap.md](../../prior-art/instruction-gap.md); the count of packages
per project has been published several times, the count of publishers per project for a
declared sample has not.

## Frame and sample

The frame is every GitHub repository whose primary language is JavaScript or TypeScript, with
at least 100 stars, pushed within the twelve months before 2026-09-17, not a fork: 38,791
repositories (15,466 JavaScript, 23,317 TypeScript, 8 unlabelled), enumerated in full through
the search API in 59 star bands, none at the API's 1,000-result cap
(`results/frame-2026-09-17.ndjson.gz`). The sample is the first 1,200 repositories in the
order of `sha256("norte-labs instruction-gap 2026-09-17" + fullName)`, a simple random order
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
   manifests are fetched from the repository). Peer dependencies are counted apart. Development
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
4. **Cells** (`results/cells.ndjson`): per project, the counts and ratios defined in
   `src/compute.ts`: direct, resolved, names the developer never named, versions the manager
   chose (every resolved pair except those a direct dependency pins exactly), distinct
   publishers, publishers behind a direct dependency and behind none, maintainer accounts,
   packages and publishers with install-time code, hosts, and a framework cluster (the first
   of next, nuxt, angular, sveltekit, svelte, remix, astro, gatsby, vue, react, nest, express,
   fastify, hono, koa, electron, react-native, vite, webpack, typescript found in the production
   dependencies, else in any field).

Publisher accounts whose name says automation (`*bot`, `*-ci`, `release-bot`, `types`, trusted
publishing repositories …) are counted and reported apart, by a name heuristic published with
the results; the headline counts identities, not people.

### What is not measured

- Whether the install-time code runs. Since npm 12 (2026-07-08) npm blocks dependency install
  scripts unless the root manifest allows them; pnpm 10 (2025-01), Bun and Yarn Berry block
  them by default too, Bun with a built-in allowlist. The count here is of code declared to run
  at install in the resolved tree; it runs as such under yarn v1 and npm before 12, and under
  the others only where allowed.
- Platform-conditional optional dependencies (`fsevents` on macOS) are counted as resolved;
  figures without `fsevents` are given beside them.
- The lockfile's `resolved` host is not always what an install contacts: npm rewrites
  `registry.npmjs.org` to the configured registry, and mirrors rewrite tarball URLs to
  themselves.
- Maintainer lists are read at lookup time, not at publish time.
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

`gh` must be authenticated (search: 30 requests a minute; core: three per candidate). The
instrument's one dependency is `yaml`, for pnpm and Yarn Berry lockfiles (`src/package.json`:
one direct dependency, one resolved version, one publisher). Temporary files live under
`/var/tmp/nl-instruction/` (repository files at the pinned commits, ~310 MB; the registry
cache, ~800 MB). Deleted when the run is done.
