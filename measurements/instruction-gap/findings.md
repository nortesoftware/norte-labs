# instruction-gap — findings

Run of 2026-09-17 over 892 lockfiles from a random sample of 1,200 GitHub repositories
(JavaScript or TypeScript, ≥ 100 stars, pushed within the last twelve months, not forks; frame
38,791). Method, definitions and limits in [README.md](README.md); generated figures in
[results/report.md](results/report.md); additional checks and corrections in
[verification.md](verification.md). Shares carry 95 % Wilson intervals; medians carry the
interquartile range in brackets. Prior art: [../../prior-art/instruction-gap.md](../../prior-art/instruction-gap.md).

## 1. The command and what it brings

A median project in this frame declares **26 direct dependencies** [13–56] and its lockfile
resolves **604 package versions** [293–1,074] of 543 distinct names — 19.1 resolved versions
per declared dependency [12.9–27.7]. Behind those versions stand **165 distinct publishing
identities** [94–259]: 5.3 per direct dependency [3.5–7.7]. Counting the accounts that *may*
publish rather than the ones that did, the median project's tree is reachable by **401
maintainer accounts** [239–628], 12.9 per direct dependency.

Of the median project's publishers, **87 %** [p10 76 %, p90 94 %] are behind no package the
developer named: the developer asked for 26 packages from 18 publishers and received code from
143 more. The manager chose the version of 99.9 % of what it installed: 52.8 % [49.5–56.1] of
projects pin at least one direct dependency to an exact version, 3.1 % [2.2–4.5] pin all of
them, and even an exact pin decides nothing below it. A median project holds 44 packages in
more than one version at once.

Identity is an npm account or, for versions published through trusted publishing, the GitHub
repository the provenance names; it is not a person. By a name heuristic (`*bot`, `*-ci`,
`release-bot`, `types`, trusted-publishing repositories) 18.6 % of a median project's
publishers are automation; without them the median is **130 publishers, 4.3 per direct
dependency** [2.6–6.4]. Trusted publishing accounts for 14.8 % of all publisher identities and
appears in 73.2 % [70.2–76.0] of projects.

For projects declaring 10 to 15 direct dependencies (n = 106) the median tree resolves 329
versions from 98 publishers [71–138]; for 20 to 30 (n = 140), 557 versions from 148 publishers.
By framework cluster: a Next.js or React project (49 direct at the median) resolves ~890
versions from ~220 to 230 publishers; a project with only TypeScript as a marker (18 direct)
376 versions from 118; a project with no framework marker (6 direct) 186 versions from 73
publishers, 8.2 per direct dependency — the ratio is highest where the developer asked for
least.

Production only, in the 461 npm lockfiles that mark development dependencies: a median of 5
packages declared in `dependencies` resolves to 53 versions from 20 publishers (2.5 per direct
dependency). He, Vasilescu and Kästner's 10,000 GitHub repositories, resolved with npm's own
resolver in 2025, gave 11 direct and 150 transitive in production and 23 and 848 with
development dependencies; this frame's 26 and 604 sit in the same range with a heavier
library share. GitHub's 2020 Octoverse gave medians of 10 direct and 683 for JavaScript
repositories with lockfiles.

## 2. Who is in every tree

7,569 distinct publishing identities appear across the 892 projects. 43.0 % [41.9–44.1] of
them appear in one project only; 79 (1.0 % of identities) appear in half the projects or more
and make up a third of a median project's publishers (median 33.3 %). Four accounts are in
nine projects of ten: `types` (DefinitelyTyped's publishing account, 92.5 % [90.6–94.0]),
`isaacs` (91.9 %), `sindresorhus` (91.5 %), `qix` (90.1 %); then `styfle` 86.8 %,
`typescript-bot` 85.2 %, `ljharb` 83.7 %, `juliangruber` and `phated` 83.4 %, `jonschlinkert`
83.1 %, `matteo.collina` 82.1 %, `alexeyraspopov` 81.5 %, `kevva` 81.3 %, `lukeed` 81.2 %. The
most reached trusted-publishing repositories are `npm/node-semver` (53.7 % of projects),
`SuperchupuDev/tinyglobby` (48.7 %), `babel/babel` (47.3 %), `nodejs/undici` (44.2 %),
`browserslist/caniuse-lite` (41.0 %) and `lovell/detect-libc` (40.8 %). A single account with
publish access to what one of these publishes reaches most of the frame; the September 2025
phishing of the `qix` account, which published chalk and debug (Socket, 2025-09-08, "npm
Author Qix Compromised via Phishing Email in Major Supply Chain Attack"; 18 packages, over 2
billion weekly downloads per Aikido), was a compromise of exactly this position.

## 3. Code that runs at install

87.6 % [85.2–89.6] of projects resolve at least one package that declares install-time code
(`preinstall`, `install`, `postinstall` or a `binding.gyp`): a median of 3 such packages from 3
publishers, of which 0 are direct dependencies. In 83.0 % [80.4–85.3] of projects the
install-time code comes from a package the developer never named; in 409 of the 781 projects
with such code, none of it is behind a direct dependency. 305 distinct packages carry it:
`fsevents` in 703 projects (macOS only, an optional dependency), `esbuild` 444, `core-js` 136,
`sharp` 136, `unrs-resolver` 118, `@parcel/watcher` 114, `protobufjs` 98, `core-js-pure` 75,
`@swc/core` 72, `electron` 41, `puppeteer` 39, `workerd` 35, `better-sqlite3` 32. Without
`fsevents`, 686 projects (76.9 %) have install-time code, a median of 2 packages from 2
publishers. 280 identities publish it; `pipobscure` (fsevents) reaches 696 projects,
`esbuild`'s two identities 267 and 264, `zloirock` (core-js) 164, `devongovett` 114.

Whether that code runs depends on the manager and its version. npm 12 (2026-07-08) blocks
dependency install scripts and implicit `node-gyp` builds unless the root manifest's
`allowScripts` lists them; pnpm 10 (January 2025) blocks them behind `onlyBuiltDependencies`;
Bun runs only a built-in allowlist of 367 names, which includes `esbuild` and `fsevents`; Yarn
Berry's `enableScripts` defaults to false; yarn v1 and npm before 12 run everything. 41 of the
892 projects (4.6 %) carry an allowlist — 14 `allowScripts`, 21 pnpm `onlyBuiltDependencies`
or `allowBuilds`, 6 bun `trustedDependencies` — that is, have taken the decision back
explicitly; the other 851 leave it to whichever manager version the developer runs.

## 4. Where it comes from

Only npm and yarn v1 lockfiles record a URL per package (572 projects). A median project
resolves from one host. 11.7 % [9.3–14.6] of the 572 record at least one host other than
`registry.npmjs.org` and its yarn alias `registry.yarnpkg.com` (13.5 %): `github.com` 5.8 %
(git dependencies), `registry.npmmirror.com` 4.2 % (24 projects — the Alibaba mirror, written
into a committed lockfile by whoever installed with it configured; npm rewrites only
`registry.npmjs.org` to the configured registry, so a lockfile that records the mirror makes
every later install fetch from it), `codeload.github.com` 1.0 %, and one
project each on `npm.pkg.github.com`, `cdn.sheetjs.com`, `gitlab.gnome.org`, a corporate
Artifactory, `pkg.pr.new`, `npm.jsr.io`, `npm.flatt.tech` and `gitpkg.vercel.app`. Over all 892
projects, 7.6 % [6.1–9.6] resolve at least one git or tarball dependency (156 resolved pairs in
all). Every registry version looked up has its tarball on `registry.npmjs.org`; 16 of the 88,376
versions are no longer on the registry.

## 5. Lockfiles and managers

Of the 1,200 repositories drawn, 84.8 % [82.7–86.8] have a root package.json; of those, 88.2 %
[86.1–90.1] commit a lockfile: package-lock.json 54.8 % [51.5–58.0], pnpm-lock.yaml 27.4 %
[24.6–30.4], yarn.lock 11.6 % [9.7–13.8] (80 v1, 24 Berry), bun.lock 5.6 % and the binary
bun.lockb 0.7 %. 4.7 % commit more than one. 243 declare a `packageManager` field (173 pnpm,
36 yarn, 16 bun, 16 npm). pnpm projects declare more (median 46.5 direct) and resolve more (875
versions, 216 publishers) than npm projects (19, 445, 132); the publishers-per-direct ratio is
5.7 under npm and yarn v1, 4.5 under pnpm, 3.8 under bun, 5.3 under Berry. 201 of the 892 are
monorepos with more than one workspace manifest.

## 6. The design effect

Projects on the same framework resolve much of the same tree: the publisher-set overlap
(Jaccard) of two projects on the same framework is 0.212 against 0.168 for two projects on
different or no frameworks. With the framework as the cluster (21 clusters, mean size 42.5),
the intra-class correlation of the publishers-per-direct ratio is 0.081 and the design effect
11.4: the mean ratio is 7.0 with an iid interval of [6.5–7.5] and a cluster-robust interval of
[5.2–8.8]. For the raw counts the clustering is stronger (ICC 0.29 for distinct publishers,
0.26 for resolved versions; design effects 33 to 41), because a Next.js tree and a
TypeScript-only library differ by a factor of two to three in size. The medians and the
per-cluster figures above are the ones to quote; the means are not 892 independent draws.

## 7. What this does not say

The frame is popular open-source repositories on GitHub with a root manifest, not the
population of projects developers install: libraries and monorepos are over-represented,
private and application code under-represented, and a repository is one commit on one day.
Development dependencies are included because `npm install` installs them; the production-only
figures are given for npm lockfiles. A publisher is an account or a trusted-publishing
repository, not a person: one person can hold several accounts and a bot account is a person's
token; the automation heuristic is a name pattern and is published with the results. Maintainer
lists are as of the lookup, not as of the publish. Install-time code is counted as declared, not
as run. The `resolved` host is what the lockfile records: npm rewrites `registry.npmjs.org` to
the configured registry at fetch time and leaves other hosts as recorded, and mirrors rewrite
tarball URLs to themselves. PyPI was not run: its registry does not say who uploaded a
release.

None of this is new to the tools that print it for one project at a time — `list-maintainers`
(2018), `ls-publishers` (2021), `dependency-maintainers` (2024), `depsift` (2026),
`cargo-supply-chain` for Rust since 2020 — nor to dep-weight (August 2026), which counted
publishers and install-script accounts for 14 synthetic manifests from registry metadata. What
is new here is the sample: 892 real lockfiles from a declared frame, with the developer's own
declarations beside what the manager resolved, and the clustering reported rather than assumed
away.
