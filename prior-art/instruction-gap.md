# instruction-gap — prior art

Sweep of 2026-09-17. The question: a developer writes one command — `npm install`, with a
package.json that declares D direct dependencies. How many decisions does the package manager
take on the developer's behalf, and how many distinct publishers end up with code on the
machine that the developer did not choose? The planned measurement reads the lockfiles of a
declared sample of real GitHub projects, nothing installed, and counts, per project: direct
dependencies, resolved packages, distinct publishers behind them, publishers whose packages run
code at install, distinct hosts in the resolved URLs; then the ratios direct → total and direct
→ publishers, with the design effect of projects that share a framework. npm first; PyPI only
if the same instrument transfers. **Has anyone published the publisher ratio per project?**

Scale: exists / partial / not found. "Not found" means "these searches were run"; the list is in
the appendix [instruction-gap-sources.md](instruction-gap-sources.md), together with every
source opened (URL, date, verbatim figures, sample, unit of analysis, limitations).

| topic | verdict | closest published figure | what nobody has published |
|---|---|---|---|
| publishers per project | **partial** | per package: an average npm package implicitly trusts 39 maintainers (Zimmermann et al. 2019); per synthetic manifest: `npm i jest` → 259 packages, 66 publishing accounts (dep-weight, 2026-08) | the count over a declared sample of real projects' lockfiles, beside what they declare |
| direct → transitive per project | **exists** | median 11 direct / 150 transitive in production, 23 / 848 with dev, over 10,000 GitHub repositories (He, Vasilescu, Kästner 2025); 10 / 683 over 45,000+ (GitHub Octoverse 2020) | — |
| code that runs at install | partial | 2.2 % of 1.49 M packages declare an install script (Zahan et al. 2022); 22 of 3,602 lockfile entries in 11 trees (2026-09) | the publishers behind it, per real project |
| the resolver's decisions | partial | 66.72 % of 51.1 M npm dependency triples float on minor, 30.11 % pin (Rahman et al. 2025); 44.21 % of 10,000 repositories commit package-lock.json (He et al. 2025); 81.4 % of 4,859 projects commit a lockfile (Gamage et al. 2026) | the share of a resolved tree the developer fixed, per project |
| hosts in resolved URLs | **not found** per project | 0.41 % of npm packages declare an external (non-registry) dependency (Tassio et al. 2025); 10.2 % of 1,146 projects have a URL dependency (Jafari et al. 2022) | the host distribution of committed lockfiles |
| who published a version | partial | the registry's `_npmUser` and `maintainers` fields, provenance attestations, trusted-publishing identities; PyPI exposes roles, not uploaders | a dataset joining lockfiles to publishers |
| frames and design effect | partial | star and activity thresholds shift repository size by 7× and hide 73.42 % abandonment (Kaushik & Bawa 2026) | any dependency study reporting a design effect |

## 1. Publishers per project

The count of people behind a dependency tree has been measured **per package**, on the whole
registry, twice. Zimmermann, Staicu, Tenny and Pradel (USENIX Security 2019), on npm to April
2018 (676,539 packages, 199,327 maintainers): *"Installing an average npm package introduces an
implicit trust on 79 third-party packages and 39 maintainers"*; *"The average npm package
transitively relies on code published by 40 maintainers. Popular packages rely on only 20"*;
*"643 packages influenced by more than a hundred maintainers"*. Bagmar, Wedgwood, Levin and
Purtilo (arXiv 2021) replicated it on PyPI (206,296 packages, 387,867 author/maintainer
addresses): *"when a user installs one package, he/she is implicitly trusting 14 other packages
on average"*; *"As of 2019, the top 10,000 packages depends on code published by 49
maintainers"*. Both take the registry's maintainer field (publish rights) as the identity, both
resolve from the registry graph rather than from any project's lockfile, and neither reports
the ratio to what a project declares. No replication for npm after 2018 was found among the
citing works screened.

**Per project, the count exists as tools that print it for one tree at a time, and in
none of them as a measurement over a sample.** `list-maintainers` (Nick Heiner, December 2018,
after the event-stream incident): *"a newly instantiated create-react-app project has 1609
packages from 549 maintainers"*. `ls-publishers` (Jordan Harband, 2021) groups a tree by the
`_npmUser` of each resolved version. `dependency-maintainers` (2024): *"Number of maintainers:
333 / Number of packages: 462"*. `depsift` (June 2026) reads all four lockfile formats and
prints *"266 packages in the tree (3 direct deps) · 233 unique names / 135 maintainers you'd be
trusting"*. `keyholders`, `nebraska` (*"Forty-six packages, seventy-nine people"* for Express,
two levels deep) and `blast-radius` (*"101 packages · 64 accounts hold publishing rights"*)
appeared in 2026 with one worked example each. npm itself printed *"added N packages from M
contributors"* on every install from v5.7.0 (2018-02-20) until npm 7 dropped it — M counted the
`author` and `contributors` strings of the packages added, not registry accounts, and at least
8,418 GitHub issues carry the line verbatim; nobody aggregated it. For Rust,
`cargo-supply-chain` (Rust Secure Code WG, since 2020) lists every crates.io account and team
that can publish into a resolved graph, and the WG's guide states the thesis — dependency count
is not the attack surface, publish access is — with single-project figures (57 individuals and
9 teams for the tool itself; 243 for turso) and no sample.

The nearest measurements are from the last two months and use **synthetic manifests**.
dep-weight (Dmitriy Semenkevich, 2026-08-18, Zenodo 10.5281/zenodo.22128854) resolves 14
hand-built npm stacks from registry metadata, month by month over two years, and counts per
stack the resolved packages, *"the distinct npm accounts that published the resolved versions"*
(`_npmUser`), the maintainer set, the install-script packages and the accounts behind them:
*"jest | 259 | 14 | 11"* (packages, install scripts, distinct accounts); *"`npm i jest` runs
install-time code belonging to eleven separate accounts, almost all of them three or four hops
from anything you named"*; express + cors + body-parser resolved 71 packages from 16 accounts,
webpack 68 from 26. Runtime dependencies only, no lockfiles, no real repositories; its own
prior-work section found no earlier account count over time. Its companion `install-graph`
(2026-08-27) walks the `node_modules` of five real projects — three Angular front ends of one
client and two of the author's tools — and reports installed-per-direct ratios of 30.2, 27.6,
24.7, 23.5 and 2.0 and, over the union, *"1,598 distinct names arrive from 852 distinct
publishing accounts"*, with the three sibling projects named as a threat to independence.
RelayShield's `rsscan --deps` (2026-08-13) reads a package-lock.json and counts accounts
(maintainers plus `_npmUser`, deduplicated by e-mail) for six generated manifests: *"You get 433
packages. Behind those 433 packages are 275 distinct accounts that can publish code into them,
and 126 of those accounts are on consumer webmail."* A weekly column (2026-09-16) counted one
17-line manifest three ways: *"17 direct / 383 packages / 285 accounts"*. `bus-factor`
(2026-08-02) reads the lockfiles of the author's own thirteen projects and reports packages
against the union of maintainer lists (884 packages, 529 publishers for the largest), with no
direct-dependency column and no selection criterion.

Verdict: **partial**. The per-package figure is nine years old and per package; the per-project
figure exists for 14 synthetic stacks, six generated manifests, five and thirteen convenience
projects, and in tools. Over a declared sample of real projects, beside the developer's own
declarations, with the install-script publishers and the clustering: not published.

## 2. Direct to transitive, per project

This half is done, several times, with declared samples, and counts packages only. He,
Vasilescu and Kästner ("Pinning Is Futile", FSE 2025) resolved 10,000 GitHub repositories
(World of Code, ≥ 14 stars, > 84 commits, > 13 active months, active in the last two years)
with npm's own resolver: *"A median GitHub project has 11 direct dependencies and 150
transitive dependencies in production (23 direct and 848 transitive if we include development
dependencies)"*, and 44.21 % of them commit a package-lock.json. GitHub's Octoverse security
report (December 2020), over *"over 45,000 repositories"* active every month for two years,
gives JavaScript medians of 10 direct dependencies and, for repositories with a lockfile, 683.
Latendresse, Mujahid, Costa and Shihab (ASE 2022), on 100 projects drawn from 11,860 with ≥ 100
stars that build with webpack or rollup, count 2,098 direct against 51,307 transitive installed
dependencies in 49 projects and find that *"less than 1% of the installed dependencies are
released to production"*. Alfadel et al. (2020, 2023) study 6,673 and 6,546 Node.js
applications for vulnerabilities; Jafari et al. (TSE 2022) 1,146 projects with a median of 15
runtime dependencies; Arafat (2025) 50 popular packages per ecosystem (npm mean 30.9 direct,
52.8 transitive, amplification 4.32×); Cesarano and Monperrus (2026) 48 AI-stack projects that
*"declare 4,664 direct dependencies, resolve to 11,508 transitive packages"*. Industry reports
add per-application totals without a declared frame (Black Duck 2026: a mean of 1,180
components per codebase, 64 % transitive). None counts people. Verdict: **exists** for packages;
the measurement's package figures are a replication on a new frame, not a result.

## 3. Code that runs at install

Registry-wide prevalence is measured: Zahan, Zimmermann, Godefroid, Murphy, Maddila and Williams
(ICSE-SEIP 2022), on 1,494,105 package.json files of June 2021: *"2.2% (33,249) of packages use
install scripts"*, 362 of 14,892 popular packages; the August 2026 npm registry census
(Semenkevich): *"1.74% run code when you install them, which is 74,664 packages"*, and *"84.9%
of npm packages list exactly one maintainer"*, *"1,056,758 distinct publishing accounts, and
the two largest are not people"* (npm and GitHub Actions). Per tree, only on synthetic
manifests: 22 of 3,602 lockfile entries (0.61 %) across 11 trees, 13 without `fsevents`, median
2 per tree (jagatjeet.com, 2026-09-06); four packages that run on every clean install of one
Next.js repository — sharp, esbuild twice, unrs-resolver — after 61 of 65 flagged entries turn
out to be `prepare` scripts (devops-daily, 2026-06); dep-weight's install-script accounts above.

The policy changed while the question was being asked. npm 12.0.0 (2026-07-08): *"Dependency
lifecycle scripts are now blocked by default unless allowed by the root package's `allowScripts`
policy"*; `allow-git` and `allow-remote` default to `none`; implicit `node-gyp` builds are
blocked too, after the Miasma worm of 2026-06-03 compromised 57 packages through a 157-byte
`binding.gyp` with no lifecycle script at all. pnpm 10 (January 2025) blocks dependency
scripts behind `onlyBuiltDependencies`; Bun runs only a built-in allowlist (367 names on
2026-09-17, esbuild and fsevents among them); Yarn Berry documents `enableScripts` false as its
default; yarn v1 and npm before 12 run everything. JFrog attributes *"approximately 53% of
malicious npm attacks"* of the past year to the three vectors npm 12 closed. So "code that runs
at install" is, from mid-2026, "code declared to run at install, run by the managers and
versions that still run it" — a distinction the measurement has to carry. Verdict: **partial**;
the publishers behind the install-time code of real projects are not published.

## 4. The resolver's decisions and the lockfile

How much of a tree the developer fixed is measured at ecosystem level: Rahman, Marley, Enck and
Williams (ASE 2025), over 51.1 M npm (package, version, dependency) triples: floating-minor
66.72 %, pinning 30.11 %, floating-patch 2.15 %, floating-major 0.79 %; Decan and Mens (TSE
2019) on semver compliance; Jafari et al.: 52.2 % of 1,146 projects pin at least one dependency,
26.5 % commit no package-lock.json. Lockfile adoption per project: Gamage, Tiwari, Monperrus and
Baudry (EMSE 2026), 4,859 GitHub projects across seven managers: *"As of March 28, 2025, 81.4% of
these projects have committed lockfiles"*, 43.4 % a package-lock.json and 18 % a pnpm lockfile
within six months of creation. He et al. count a median of 65 floating edges and a mean of
22.38 duplicated versions per resolved graph. deps.dev states the size of the choice — one
package's constraints admit on the order of 10^81 valid resolutions — and that npm, yarn and
pnpm produce different trees from one manifest; PacSolve (ICSE 2023) shrinks 21 % of the top
1,000 packages' trees against npm's choice. pnpm has added decisions of its own: a minimum
release age of 1,440 minutes by default since v11, and a trust policy that refuses downgrades.
Verdict: **partial**; per project, the share of the resolved tree that the developer fixed is
not reported.

## 5. Hosts, mirrors and non-registry sources

No measurement of the `resolved` hosts of committed lockfiles was found. At package level,
Tassio, Wyss, Salazar-Morales, De Carli and Davidson (SCORED 2025): *"0.41% of npm packages make
use of an external dependency in their latest version"*, 89 % of the 15,186 unique external
specifications are git and 13,253 point at GitHub; per project, Jafari et al.'s 10.2 % with a
URL dependency at the manifest level. What the sweep did establish is why a host count from
lockfiles needs care: npm's documentation calls `registry.npmjs.org` in a lockfile a magic
value replaced by the configured registry at fetch time (`replace-registry-host`); Yarn Berry
omits the URL when it matches the registry pattern; pnpm 11.23 omits tarball URLs it can
reconstruct and pnpm 12 canonicalises git URLs; bun stores an empty `resolved` for
default-registry packages; a mirror such as `registry.npmmirror.com` (6.16 M packages, hundreds
of millions of downloads a day) rewrites `dist.tarball` to itself, which is how it reaches
lockfiles committed outside China (npm/cli#1431; vue-cli's `useTaobaoRegistry`). A GitHub code
search finds `registry.npmmirror.com` in 94,720 package-lock.json files against 10.8 M with
`registry.npmjs.org`. Verdict: **not found** per project; the lockfile is a partial record of
hosts and the measurement says so.

## 6. Who published a version

The data path exists and is documented. npm's per-version manifest carries `_npmUser` (the
account that published), `maintainers` (the package's maintainers when that version was published), `scripts`, `dist.tarball` and,
since 2023, provenance attestations; for versions published through trusted publishing the user
is *"GitHub Actions"* with a `trustedPublisher.oidcConfigId`, and the identity has to come from
the attestation's repository or, absent one, from the manifest. Santos-Grueiro ("On Good
Authority", 2026) measures per registry what release authority is public: for npm 100 % of
releases expose the repository and 64 % a workflow and provenance; PyPI provides *"BigQuery
release records and per-file attestations"* but no uploader per release — the same finding as
dep-weight's, which reports that the publisher count *"exists for npm alone"*. Schmid, Gaspar,
Liu, Bobadilla, Baudry and Monperrus (Dirty-Waters, 2026), on the trees of the 50 most
depended-on npm packages: *"Nearly all packages in the dependency tree exhibit the no
provenance smell (8045 packages, 99.7%)"*. ecosyste.ms exposes `_npmUser` per version;
deps.dev exposes no publisher; npm-follower archives every packument. No dataset joins
lockfiles to publishers. Verdict: **partial**.

## 7. Frames and the design effect

The frames dependency studies use are GHTorrent with activity filters (Jafari: non-fork, ≥ 10
authors, ≥ 10 commits in six months; Alfadel: non-fork, > 2 dependencies, ≥ 100 commits by > 2
contributors, packages removed by a registry lookup), star thresholds (Latendresse: ≥ 100 stars
→ 11,860 → 100 that build), World of Code with activity filters (He et al.), or GitHub's own
dependency graph (Octoverse: active every month for two years). Kalliamvakou et al. (MSR 2014)
list the perils — *"A repository is not necessarily a project"*, *"Two thirds of projects
(71.6% of repositories) are personal"*; Kaushik and Bawa (2026), on 1.57 M repositories: *"As
the popularity-based threshold increases, the project size increases substantially by 7x"*, and
the filters *"mask the true abandonment (73.42%) realities of OSS projects"*. No dependency
study reports an intra-class correlation or a design effect for projects sharing a framework;
the only acknowledgement found is install-graph's, which names its three sibling projects as a
threat. Verdict: **partial**.

## Is it taken?

No. The idea is public and the tools are public: since 2018 anyone could run one command and
read "1,609 packages from 549 maintainers". What has been published is the per-package figure of
2019, the per-package direct-to-transitive ratio many times over, and, in August and September
2026, publisher counts for synthetic stacks, generated manifests and a handful of the authors'
own projects. What has not: the number over a declared sample of real repositories, read from
what their lockfiles resolve, beside what their manifests declare, with the publishers behind
install-time code, the hosts, and the dependence between projects on the same framework
reported rather than assumed away. The measurement cites dep-weight as its nearest neighbour
and He, Vasilescu and Kästner for the package half, and carries the npm 12 change: the
install-time count is of declared code, and whether it runs is now a per-manager, per-version
fact.

## Method and limits

Seven topics × four search modalities (academic: the arXiv, OpenAlex, Crossref and Semantic
Scholar APIs, Google Scholar, and the 2019–2026 proceedings of USENIX Security, S&P, CCS, NDSS,
ICSE, FSE, MSR, ASE, ESEM, SANER, ICSME, SCORED and the EMSE/TOSEM/TSE journals; industry: vendor
research and state-of reports, conference talks, essays, newsletters; code and data: GitHub,
Zenodo, Hugging Face, the registries' own APIs and docs, tools that print maintainer counts;
community and press: Hacker News, Reddit, lobste.rs, dev.to, the npm/pnpm/yarn/bun trackers
and RFCs, incident press), each topic then searched again for what was missing (2025–2026
venues, other languages, standards bodies, other ecosystems as method precedent, SBOM supplier
studies, the registries' release notes, the actors one step from the data). Every source was
opened and marked confirmed / partially confirmed / refuted / unreachable. Result: 403 sources
(262 confirmed, 140 partially confirmed — the appendix says what differed, 1 recorded and not
opened), 2,166 recorded searches. Nothing was refuted.

Limits: web search was unavailable for the whole sweep, so discovery ran on the APIs above and on
DuckDuckGo, Brave, Bing and Mojeek when they answered, which they mostly did not (captchas and
rate limits); Semantic Scholar rate-limited most queries and OpenAlex reached its daily cap in
the follow-up, so citation chasing from Zimmermann et al. is incomplete (341 citing works
screened by title and abstract, against the ~700 Google Scholar reports); ACM DL and IEEE
Xplore were verified through Crossref and arXiv, not opened; German, Spanish, Chinese, Japanese
and Korean searches returned re-reporting of the English sources.
