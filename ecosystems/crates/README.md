# ecosystems/crates — who publishes what one Cargo.lock resolves

The count [instruction-gap](../../measurements/instruction-gap/) made for npm and
[ecosystems/go](../go/) made for Go, over Rust. For each project: the crate versions its
`Cargo.lock` resolves from crates.io, the accounts that published them, and how many of those
accounts are behind nothing the project declared.

Prior art: [../../prior-art/crates.md](../../prior-art/crates.md). Publishers per project over a
sample: not found. Owners behind one project's graph: partial; a tool computes them
(`cargo supply-chain`), and every published figure is one project.

## Frame and sample

The frame is every GitHub repository whose primary language is Rust, with at least 100 stars,
pushed on or after 2025-09-25, not a fork: 9,372 repositories, enumerated on 2026-09-25 through
the search API in 14 star bands, none at the API's 1,000-result cap
(`results/frame-2026-09-25.ndjson.gz`, bands in `results/frame-2026-09-25-bands.json`). The
sample is the first 1,000 in the order of `sha256("norte-labs ecosystems/crates 2026-09-25" +
"\n" + fullName)`. Each is pinned to the head commit of its default branch on the day.

895 of the 1,000 have a root `Cargo.toml`. 660 of those commit a root `Cargo.lock`,
73.7 % [70.8–76.5]. Only the root is read, as npm read the root `package.json`. The 340 without
one stay in `results/population.ndjson` with the reason. 81 of the 105 with no root `Cargo.toml`
commit a `Cargo.lock` further down, 31 of them in `src-tauri/`, so a Tauri app laid out the
standard way is not in the figures.

Same caveat as npm and Go: this is popular open source, not the projects people build.
Libraries and tools are over-represented against applications and private code, and a library
that commits its lockfile is a choice some make and others do not. Every figure is over this
frame.

## Instrument

Per project, from the root `Cargo.lock` (591 are format 4, 67 format 3, 2 format 1):

- **local**: `[[package]]` entries with no `source`, workspace members and path dependencies. The
  project's own code; never a dependency, never a publisher. Median 3 per project.
- **declared**: distinct names in the dependencies of local packages that are not themselves
  local. `Cargo.lock` records normal, dev and build dependencies of every target, which is npm's
  `dependencies`, `devDependencies` and `optionalDependencies` together. A `[patch]` entry that
  points at a path replaces a crate with a local copy, which the lockfile records with no source:
  that crate is then neither declared nor published. The root manifests carry 135 such entries in
  26 projects, 101 of them over crates.io crates, in 24. For the 242 roots that are a single
  package, the root package's crates in `Cargo.lock` are the ones its `Cargo.toml` names in 239;
  two of the other three patch a crate to a local path, and one lockfile lacks a crate its
  manifest names.
- **resolved**: distinct (name, version) pairs whose source is crates.io. Git sources are counted
  apart: 142 projects resolve at least one crate from git. No project resolves from another
  registry.
- **publisher**: the account in crates.io's `versions.published_by`, from the database dump of
  2026-09-25 (dump timestamp 2026-09-25T02:00:10Z, sha256
  `bb4454ea72c2677bbdff6701d0cf69358051a5e825c74c05286bea75f1b3c00f`). Where the dump has
  none, the version's API record: a trusted-publishing repository counts as `gha:<owner>/<repo>`,
  as instruction-gap named them; the one published from GitLab keeps its prefix,
  `gitlab:<project>`. With neither, the version's publisher is unknown and is not counted: 400 of
  the 25,539 distinct versions resolved, in 559 of the 660 projects, all published between
  2015-04-03 and 2019-02-20. No login counted maps to more than one user id in the dump. The
  publisher counts are floors; counting each unknown version as one more publisher would put the
  median at 118.5 at most.
- **named**: a publisher is behind a declared crate if it published any resolved version of a
  crate whose name is declared, instruction-gap's rule. Never named is the rest.
- **owners**: the users and teams the same dump lists as owners of each resolved crate, as of
  that dump. A GitHub team counts once, whatever its size; the dump does not list team members.
- **automation**: instruction-gap's name pattern, unchanged.
- **cluster**: the first of these the project declares, else `none`: bevy, tauri, dioxus, leptos,
  yew, egui/eframe, iced, gtk/gtk4, actix-web, axum, rocket, warp, poem, solana-program/anchor-lang,
  alloy/ethers, wasm-bindgen, tokio, async-std, clap.

Nothing is built. `Cargo.lock` resolves every platform and every feature combination the project
allows; one build on one machine compiles fewer.

## Result

| per project, median [middle half] | |
|---|---|
| declared | 30 [15.8–50.5] |
| resolved crates.io versions | 319 [174.8–559] |
| distinct publishers | **113.5** [65.8–181] |
| of them, trusted-publishing repositories | 7.5 [2–16] |
| publishers behind a declared crate | 21 [11–35] |
| **share of a project's publishers it never named** | **79.0 %** [p10 63.4 %, p90 90.0 %] |
| owners, users | 151 [88.8–237] |
| owners, teams | 33 [19.8–48] |

The share is over the 658 projects with at least one publisher. Without accounts and
repositories the automation pattern matches, the median is 102 [58–164.5]; the pattern misses a
few accounts that look automated, among them `rust-lang-owner`, in 637 projects, which moves that
median by one. 548 of the 660 projects, 83.0 % [80.0–85.7], have at least one version published
through trusted publishing.

## Against npm and Go

| | npm | Go | crates |
|---|---|---|---|
| basis | 892 lockfiles | 360 projects | 660 lockfiles |
| declared, median | 26 | 9 modules | 30 |
| resolved, median | 604 versions | 81 modules | 319 versions |
| parties, median | 165 publishers | 40 to 41 owners | **113.5 publishers** |
| named, median | 18 | 7 to 8 | **21** |
| never named, median share | 86.7 % | 79.5 to 82.8 % | **79.0 %** |

npm and crates count the same thing, the account that published each resolved version. Go has no
publisher, and its column counts the owner of the repository each module comes from
([../go/README.md](../go/README.md)); it leaves out the project itself, and its share leaves out
the 19 projects with no dependency, as npm's and crates' leave out projects with no publisher.
Owners have no npm counterpart: instruction-gap's maintainer figure counts the maintainers each
version listed when it was published, not who may publish now.

A median Rust project declares 30 crates and resolves versions from 113.5 publishers, of which it
names 21. It never named 79.0 % of them, about Go's share and below npm's.

## The design effect

17 clusters. Publisher sets overlap more within a cluster (Jaccard 0.271) than across (0.228).
The intra-class correlation of publishers per project is 0.445. The design effect, the
cluster-robust variance of the mean over the independent one, is 35.9, and 26.6 to 43.3 with any
one of the five largest clusters left out; with 17 clusters it is not stable enough to quote as a
number. The medians and the per-cluster figures are the ones to quote; the means are not 660
independent draws. The three measurements use different estimators and clusters, so their design
effects are not set side by side.

| cluster | n | declared | publishers | never named |
|---|---|---|---|---|
| tokio | 183 | 33 | 120 | 79 % |
| clap | 121 | 21 | 73 | 77 % |
| none | 109 | 10 | 49 | 79 % |
| axum | 102 | 61 | 193 | 77 % |
| wasm-bindgen | 31 | 46 | 125 | 71 % |
| tauri | 24 | 47.5 | 211.5 | 85 % |
| egui | 23 | 47 | 205 | 84 % |
| actix-web | 16 | 50 | 177.5 | 79 % |
| gtk | 12 | 35.5 | 134 | 79 % |
| bevy | 9 | 32 | 214 | 90 % |
| iced | 9 | 46 | 226 | 86 % |
| warp | 5 | 26 | 157 | 81 % |
| async-std | 4 | 44 | 128 | 80 % |
| dioxus | 4 | 71.5 | 268 | 81 % |
| leptos | 3 | 29 | 134 | 88 % |
| solana | 3 | 30 | 150 | 85 % |
| yew | 2 | 79.5 | 174.5 | 69 % |

## Figures

Each figure, where it comes from. `results/` holds every input named here.

| figure | field or computation | source | as of |
|---|---|---|---|
| 9,372 in the frame, 14 bands | rows of the frame file; band totals | `frame-2026-09-25.ndjson.gz`, `…-bands.json`, GitHub search API | 2026-09-25 |
| 1,000 drawn; 895 with a root `Cargo.toml`; 660 with a root `Cargo.lock` | `status` | `population.ndjson`, root listing at each commit | the pinned commits, 2026-09-25 |
| 73.7 % [70.8–76.5] | 660 of 895, Wilson 95 % | `population.ndjson` | same |
| 81 of 105, 31 in `src-tauri/` | every `Cargo.lock` path in the tree | `no-root-manifest.json`, GitHub trees API | the pinned commits |
| declared 30, resolved 319 | `declared`, `resolved` | `cells.ndjson`, from each root `Cargo.lock` | the pinned commits |
| 113.5 publishers | `publishers.total`: distinct `versions.published_by` logins, else `gha:`/`gitlab:` trusted-publishing source | `cells.ndjson`; crates.io database dump and per-version API | dump of 2026-09-25 02:00 UTC; API read 2026-09-25 |
| 7.5 trusted-publishing repositories | `publishers.trustedPublishing` | same | same |
| 21 behind a declared crate; 79.0 % never named | `publishers.behindDeclared`; `(total − behindDeclared) / total` over the 658 with a publisher | same | same |
| 591 lockfiles in format 4, 67 in format 3, 2 in format 1; local median 3 | `lockVersion`; `local` | `cells.ndjson` | the pinned commits |
| 135 path patches in 26 projects, 101 over crates.io crates in 24 | entries with a `path` in the `[patch.*]` tables of each root `Cargo.toml`, by table key | root `Cargo.toml` at each pinned commit | the pinned commits |
| 239 of 242 single-package roots | the root package's own entries in `Cargo.lock` against the names in its `Cargo.toml`, `src/declared_check.py` | `declared-check.txt`; root `Cargo.toml` and `Cargo.lock` at each pinned commit | the pinned commits |
| 142 projects resolving from git; no other registry | `otherSources` | `cells.ndjson` | the pinned commits |
| 400 of 25,539 versions with no publisher, in 559 projects | `lookup.unknownPublisher`; distinct pairs with neither login nor trusted-publishing source | `cells.ndjson` | same |
| all published between 2015-04-03 and 2019-02-20 | `createdAt` of each of the 400 | `unknown-publishers.json`, crates.io API | read 2026-10-01 |
| no login on more than one user id | logins counted, against `users` in the dump: 0 of 2,752 | `controls.txt` (`CHECK`) | dump of 2026-09-25 |
| at most 118.5 | median of `publishers.total + lookup.unknownPublisher` | `cells.ndjson` | same |
| 102 without automation | `publishers.total − publishers.automation` | `cells.ndjson`, instruction-gap's name pattern | same |
| `rust-lang-owner` in 637 projects; 101 without it | projects whose `publishers.ids` hold it; the median above, less that account where present | `cells.ndjson` | same |
| 151 user owners, 33 teams | `owners.users`, `owners.teams`: owners of each resolved crate in the dump | `cells.ndjson`, `crate_owners` in the dump | dump of 2026-09-25 |
| 548 of 660, 83.0 % [80.0–85.7] | projects with `publishers.trustedPublishing` > 0 | `cells.ndjson` | same |
| 17 clusters; Jaccard 0.271 and 0.228 | first declared framework marker; mean overlap of publisher sets over all pairs | `cells.ndjson` | same |
| ICC 0.445; design effect 35.9, 26.6 to 43.3 | one-way ANOVA ICC(1); cluster-robust over independent variance of the mean, and the same with each of the five largest clusters left out | `cells.ndjson`, `src/report.py` | same |
| per-cluster n and medians | `cluster`; per cluster, the medians of `declared`, `publishers.total` and the never-named share | `cells.ndjson` | same |
| npm 26, 604, 165, 18, 86.7 % | `declared.direct`, `resolved.versions`, `publishers.total`, `publishers.behindDirect`, `notChosen/total` over 881 | instruction-gap `results/cells.ndjson` | 2026-09-17 |
| Go 9, 81, 40 to 41, 7 to 8, 79.5 to 82.8 % | without the project itself; share over the 341 with a dependency | ecosystems/go `results/report.md` | 2026-09-23 |

Medians and quartiles are interpolated between order statistics, as instruction-gap's are.

## Files

- `results/frame-2026-09-25.ndjson.gz`, `results/frame-2026-09-25-bands.json`: the frame.
- `results/population.ndjson`: the 1,000 drawn, each with its commit and status.
- `results/cells.ndjson`: one cell per project, publishers and owners listed.
- `results/report.md`: the generated figures. `results/controls.txt`: the control cases the
  count ran first; its line on the declared set compares every local package's dependencies with
  the root manifest, which are not the same set, and `declared-check.txt` compares the root
  package alone.
- `results/declared-check.txt`: for single-package roots, the root package's crates in
  `Cargo.lock` against its own `Cargo.toml`.
- `results/no-root-manifest.json`: the 105 with no root `Cargo.toml`, listed again at their
  commits, with every `Cargo.lock` in their trees.
- `results/unknown-publishers.json`: the 400 versions with no recorded publisher, each with the
  `created_at` the API gave on 2026-10-01.
- `src/`: `frame.py`, `sample.py`, `index_dump.py`, `compute.py`, `report.py`, `refetch.py`,
  `declared_check.py`, `relist.py`, `unknown_dates.py`.
