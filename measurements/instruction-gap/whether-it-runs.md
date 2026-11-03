# instruction-gap — whether the install-time code runs

Installs of 2026-10-22 and 2026-10-28 of the 781 projects in [findings.md](findings.md) whose
lockfile resolves install-time code. Method under *Instrument* below; corrections in
[README.md](README.md#corrections); code in [src/run/](src/run/), data in
[results/run/](results/run/). Shares carry 95 % Wilson intervals.

Some dependency's install-time script runs in 174 of 780 projects, 22.3 % [19.5–25.4], under the
latest release of each manager (npm 12.2.1, pnpm 12.14.0, Yarn 4.18.1, yarn 1.22.22 for v1
lockfiles, Bun 1.4.3). Each project was installed from nothing on Linux x64 on 2026-10-22, with the
configuration it commits and its install-time packages replaced by stand-ins whose scripts only
record that they ran (*Instrument*). The install fails with none run in 161, 159 under pnpm and 2
under npm, and 445 install with none run. Under the release line each project pins in
`packageManager`, and the latest release where it pins none, the three are 251, 32.2 %
[29.0–35.5], 53 and 476. The 781st project, `corrinehu/dsh-workbuddy-connect`, was not installed:
GitHub no longer serves its repository, and Software Heritage does not hold the commit read.

npm 12 runs them in 12 of the 408 npm projects, each of which allows a version it installs in
`allowScripts`. The 13th project with `allowScripts` allows only `sharp`, and the sharp it resolves,
0.35.3, declares no install-time code. npm 12 refuses to install the two npm projects that declare
macOS, or Windows and macOS, as their only platforms.

pnpm 12 runs them in 59 of the 236 pnpm projects. It stops the install in 161: in 159 with none run,
and in 2 after the builds their `allowBuilds` allows have run. In 160 of the 161 it stops with
`ERR_PNPM_IGNORED_BUILDS`, names the builds nobody allowed or denied and asks for them to be
approved with `pnpm approve-builds`; a build allowed in `allowBuilds` runs its script. The other
writes `allowBuilds` as a list, which pnpm 12 does not accept. 47 of the 161 commit only build
settings pnpm 12 does not read: pnpm 10's `onlyBuiltDependencies`, `neverBuiltDependencies` or
`ignoredBuiltDependencies`, or `allowBuilds` in package.json. pnpm 11 (2026-04-28), in 11.28.7
(2026-10-21), gives each project that pins it the scripts and the exit 12.14.0 gives. Its code, read
in 11.0.0 and 11.28.7, sets `strictDepBuilds` to true by default, ends the install with the same
error on a build nobody reviewed, decides a build by `allowBuilds` and `dangerouslyAllowAllBuilds`
alone, and has `pnpm approve-builds` write the choice into `allowBuilds` and run the builds approved
(file and line under *Instrument*).

Yarn 4.18.1's default, `enableScripts` false, decides none of the 21 Berry projects: 15 commit a
lockfile written before Yarn 4.14 and do not set it, and `yarn install` sets it to true for them;
the other six set it, four to true and two to false. Berry runs them in 17 of the 19 where
`enableScripts` is true; the other two resolve no install-time code but `fsevents`, which declares
macOS as its only platform.

yarn v1 runs them in 65 of 72; six of the other seven resolve no install-time code but `fsevents`,
and the seventh sets `--install.ignore-scripts true` in its `.yarnrc`.

Bun runs them in 21 of 43, six through their own `trustedDependencies` and 15 through its built-in
list of 367 names.

Under the pinned lines 77 more projects run them: 35 that pin pnpm 8 or 9, which build everything,
30 that pin pnpm 10, which reads `onlyBuiltDependencies`, 11 that pin npm 10 or 11, and a Bun
project that pins yarn 1. Of the 780, 13 carry `allowScripts`, 110 pnpm projects `allowBuilds`
(67) or `onlyBuiltDependencies` (50), 7 of them both, and 6 `trustedDependencies`; none sets
`built` in Yarn's `dependenciesMeta`.

## Instrument

For each project with install-time code, the configuration files it commits at the commit read
(package.json, `.npmrc`, `.yarnrc`, `.yarnrc.yml`, `pnpm-workspace.yaml`, `bunfig.toml`,
`.pnpmfile.cjs`), from raw.githubusercontent.com or else Software Heritage, each with its hash in
`results/run/config.ndjson.gz`. A replica of the project keeps that configuration, less the
settings `src/run/replicas.py` lists (registries, credentials, proxies, frozen lockfiles,
workspaces, patches, overrides, `yarnPath` and plugins), and its package.json without its
dependencies, scripts and `packageManager`. Its dependencies are every registry version with
install-time code its lockfile resolves, each a stand-in with that version's name, version, `os`,
`cpu` and `libc` whose install-time scripts only record that they ran, served from a local
registry; under Yarn 4 the replica carries the lockfile version its project commits. Each replica
is installed from nothing, without network, under two rules. Rule A: the latest release of the
lockfile's manager, npm 12.2.1, pnpm 12.14.0, Bun 1.4.3, Yarn 4.18.1 for Berry and yarn 1.22.22 for
v1 lockfiles. Latest means the version the npm registry's `latest` tag marked when the versions were
read, 2026-10-22 01:26 UTC, in the packages `npm`, `pnpm`, `bun`, `@yarnpkg/cli-dist` and `yarn`.
Rule B: the manager `packageManager` names, on the release assigned to its line: npm 10.9.9 for 10
and for 11 before 11.16, which has no `allowScripts`, 11.21.1 for later 11, 12.2.1 for 12; pnpm
9.15.9 for 8 and 9, 10.34.7 for 10, 11.28.7 for 11 (installed on 2026-10-28), 12.14.0 for 12; Yarn
4.13.0 for 2, 3 and 4 before 4.14, 4.18.1 for later 4; yarn 1.22.22; Bun 1.4.3. Of these, npm
12.2.1, pnpm 12.14.0, Yarn 4.18.1, yarn 1.22.22 and Bun 1.4.3 are rule A's; npm 11.21.1 and pnpm
9.15.9, 10.34.7 and 11.28.7 are the newest of their major version on the registry when the versions
were read; npm 10.9.9, the newest 10, is the one node v22.23.4 bundles; and Yarn 4.13.0 is the last
release before 4.14. A project whose `packageManager` is absent or names no release, as `nub@0.8.3`
and `^npm@11.0.0` do, takes rule A's. The controls are in `results/run/controls.ndjson` and
`results/run/pnpm11/controls.ndjson`; in the managers' output, `decisions-b.log.gz`, the work
directory is written as `/work`.

Read in `dist/pnpm.mjs` of pnpm 11.0.0 and of 11.28.7: `strict-dep-builds` defaults to true
(112580; 180285); a build is decided by `dangerouslyAllowAllBuilds` and `allowBuilds` alone
(124294-124324; 198084-198091); one neither allowed nor denied is skipped and recorded
(147786-147793; 206495-206501), and ends the install with `IGNORED_BUILDS` and the hint to run
`pnpm approve-builds` (157916-157921, 159522-159523; 231963-231968, 244082-244083);
`onlyBuiltDependencies` appears nowhere in 11.0.0, and in 11.28.7 no build decision reads it and
`approve-builds` deletes it (300023, 300202); `approve-builds` writes the choice into
`allowBuilds` and builds the packages approved (190138-190172; 300019-300026, 300133-300147). A
Yarn lockfile below version 9 was written before 4.14: `bin/yarn.js` of 4.13.0 writes version 8,
that of 4.14.0 version 9 (206), and from 4.14.0 `yarn install` sets `enableScripts` to true where
the lockfile is below 9 and no configuration sets it (462).

## What is not measured

- Whether install-time code runs on macOS or Windows, and whether the projects' own scripts,
  `prepare` scripts and git or tarball dependencies run: only registry dependencies'
  `preinstall`, `install` and `postinstall` on Linux x64 are counted. A stand-in records that the
  manager started its script, not what the script does. A pinned release is not itself run, only
  the release *Instrument* assigns to its line.
- Code an install can run besides those scripts, which the replicas leave out: a pnpmfile (3
  projects), Yarn plugins (3), pnpm config dependencies (1), and the Yarn release 16 projects
  commit through `yarnPath` (15 of them Berry).

## Figures

Each figure stated in this file, and each of the installs stated in findings.md or README.md, with
the field it is computed from.

| figure as published | where (file:line) | field or computation | source file | moment (as of when) |
|---|---|---|---|---|
| 780 projects whose configuration could be read | whether-it-runs.md:8, 50; findings.md:72; README.md:444 | rows whose `exit` is not `unavailable`, per rule | `results/run/decisions-b.ndjson.gz` | installs of 2026-10-22 |
| 174 of 780, 22.3 % [19.5–25.4] | whether-it-runs.md:8; findings.md:72-73 | rule A rows whose `marks` are not empty; `rules.A` | `results/run/decisions-b.ndjson.gz`, `results/run/figures.json` | installs of 2026-10-22 |
| the install fails with none run in 161, 159 under pnpm and 2 under npm; 445 with none run | whether-it-runs.md:12-13 | rule A rows with `exit` fail and no `marks`, by the `manager` in `pairs.ndjson.gz`; with `exit` 0 and no `marks` | `results/run/decisions-b.ndjson.gz`, `results/run/pairs.ndjson.gz` | installs of 2026-10-22 |
| 251, 32.2 % [29.0–35.5]; 53; 476 | whether-it-runs.md:14-15; findings.md:74 | the same over rule B rows, with the 47 projects that pin pnpm 11 taken from `pnpm11/decisions-b.ndjson.gz`, equal in `marks` and `exit`; `rules.B` | `results/run/decisions-b.ndjson.gz`, `results/run/pnpm11/decisions-b.ndjson.gz`, `results/run/figures.json` | installs of 2026-10-22 and 2026-10-28 |
| the 781st, `corrinehu/dsh-workbuddy-connect`, not installed | whether-it-runs.md:15-16 | `status` unavailable | `results/run/config.ndjson.gz` | configuration fetched 2026-10-22 |
| npm 12: 12 of 408, each allowing in `allowScripts` a version it installs | whether-it-runs.md:18-19 | rule A rows with `marks`, `manager` npm; package.json `allowScripts` names a package in the row's `marks` | `results/run/decisions-b.ndjson.gz`, `results/run/pairs.ndjson.gz`, the files in `results/run/config.ndjson.gz` | installs of 2026-10-22 |
| the 13th project with `allowScripts` allows only `sharp`; its sharp, 0.35.3, declares no install-time code | whether-it-runs.md:19-20 | `CodingTrain/thecodingtrain.com`, the npm project with `allowScripts` and no `marks`: its `allowScripts` keys; the sharp its lockfile resolves; that version's `hasInstallScript` | `results/run/allowlists.json.gz`, its lockfile in dataset v2, `results/registry.ndjson.gz` | lockfile at the 2026-09-17 head; registry records of the 2026-09-17 run |
| two npm projects refused, macOS or Windows and macOS only | whether-it-runs.md:20-21 | rule A rows with `exit` fail, `manager` npm; package.json `os`; `EBADPLATFORM` in the output | `results/run/decisions-b.ndjson.gz`, `results/run/decisions-b.log.gz` | installs of 2026-10-22 |
| pnpm 12: 59 of 236; stops in 161, 159 with none run and 2 after scripts | whether-it-runs.md:23-24 | rule A rows, `manager` pnpm: with `marks`; with `exit` fail, without and with `marks` | `results/run/decisions-b.ndjson.gz`, `results/run/pairs.ndjson.gz` | installs of 2026-10-22 |
| 160 of the 161 stop with `ERR_PNPM_IGNORED_BUILDS`; the other writes `allowBuilds` as a list | whether-it-runs.md:24-27 | failed rule A pnpm rows whose output holds `ERR_PNPM_IGNORED_BUILDS`; `allowBuilds: []` in `DimensionDev/Maskbook`'s pnpm-workspace.yaml | `results/run/decisions-b.log.gz`, the files in `results/run/config.ndjson.gz` | installs of 2026-10-22 |
| 47 of the 161 commit only build settings pnpm 12 does not read | whether-it-runs.md:27-29 | `pnpm12.onlyUnread`; none of these 47 pins pnpm 11 in `packageManager` | `results/run/allowlists.json.gz`, `results/population.ndjson` | configuration fetched 2026-10-22 |
| pnpm 11 of 2026-04-28; 11.28.7, of 2026-10-21, gives each project that pins pnpm 11 the scripts and the exit of 12.14.0 | whether-it-runs.md:29-30 | `time` of 11.0.0 and of 11.28.7; `same` 47 of `projects` 47, the projects whose `packageManager` is `pnpm@11.*`, none of them in `pnpm12.onlyUnread`: each rule B row's `marks` and `exit` against the rule A row of `results/run/decisions-b.ndjson.gz` | `https://registry.npmjs.org/pnpm`, `results/run/pnpm11/result.json`, `results/run/pnpm11/decisions-b.ndjson.gz` | registry document read 2026-10-30; installs of 2026-10-28 |
| 21 Berry projects; 15 with a lockfile before 4.14 and no `enableScripts`; six set it, four true and two false; 17 of the 19 where it is true run; the other two resolve only `fsevents`, macOS only | whether-it-runs.md:36-40; findings.md:77-78; README.md:439-440 | `manager` yarn-berry; `berryMetadata.version` below 9 and no `enableScripts` in `.yarnrc.yml`; its value where set; rule A rows with `marks`; `berry`, whose `notRunning` gives each project's `enableScripts` and `onlyFsevents`; the names in `pairs` of the two; `doc.os` of their `fsevents` | `results/run/pairs.ndjson.gz`, the files in `results/run/config.ndjson.gz`, `results/run/decisions-b.ndjson.gz`, `results/run/mechanisms.json`, `results/run/versions.ndjson.gz` | configuration fetched 2026-10-22; installs of 2026-10-22 |
| yarn v1: 65 of 72; six of the other seven resolve only `fsevents`; the seventh's `.yarnrc` | whether-it-runs.md:42-43 | rule A rows, `manager` yarn, with `marks`; the names in `pairs` of those without; `--install.ignore-scripts true` in `KelvinTegelaar/CIPP`'s `.yarnrc` | `results/run/decisions-b.ndjson.gz`, `results/run/pairs.ndjson.gz`, the files in `results/run/config.ndjson.gz` | installs of 2026-10-22 |
| Bun: 21 of 43; the six with `trustedDependencies` all run; 15 through its list of 367 names | whether-it-runs.md:45-46 | rule A rows, `manager` bun, with `marks`; package.json `trustedDependencies`; the lines of `src/install/default-trusted-dependencies.txt` at `bun-v1.4.3`, whose sha256 is in `inputs.log` | `results/run/decisions-b.ndjson.gz`, `results/run/allowlists.json.gz`, `results/run/inputs.log` | installs of 2026-10-22 |
| 77 more under the pinned lines: 35 pnpm 8 or 9, 30 pnpm 10, 11 npm 10 or 11, one Bun project pinning yarn 1 | whether-it-runs.md:48-50 | rule B rows with `marks` whose rule A row has none (`AvsB.runOnlyUnderB`), by `packageManager` | `results/run/decisions-b.ndjson.gz`, `results/run/figures.json`, `results/population.ndjson` | installs of 2026-10-22 |
| 13 `allowScripts`; 110 pnpm `allowBuilds` (67) or `onlyBuiltDependencies` (50), 7 both; 6 `trustedDependencies`; no `built` in `dependenciesMeta` | whether-it-runs.md:50-52 | `figures` and `byProject` | `results/run/allowlists.json.gz` | configuration fetched 2026-10-22 |
| a pnpmfile 3, Yarn plugins 3, pnpm config dependencies 1, `yarnPath` 16, 15 of them Berry | whether-it-runs.md:101-103 | `apart.codeNotRun`; `berry.yarnPath` | `results/run/figures.json`, `results/run/mechanisms.json` | configuration fetched 2026-10-22 |
