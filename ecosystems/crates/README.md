# ecosystems/crates — who publishes what one Cargo.lock resolves

[instruction-gap](../../measurements/instruction-gap/) counted, for npm, the accounts that published
the package versions a project's lockfile resolves, and how many of them stand behind nothing the
project asked for. [ecosystems/go](../go/) did the same for Go with repository owners, since Go has
no publishers. This is the npm count again, over Rust: for each project, the crate versions its
`Cargo.lock` resolves from crates.io, who published each one, and how many of those publishers are
behind no crate the project declared.

Prior art: [../../prior-art/crates.md](../../prior-art/crates.md). Nobody was found counting
publishers per project over a sample. The owners behind one project's graph have been printed
before, one project at a time, with `cargo supply-chain`.

## Frame and sample

The frame is every GitHub repository whose primary language is Rust, with at least 100 stars, pushed
on or after 2025-09-25 and not a fork: 9,372 repositories, listed on 2026-09-25 through the search
API in 14 star bands, none of them at the API's cap of 1,000 results
(`results/frame-2026-09-25.ndjson.gz`, `results/frame-2026-09-25-bands.json`). The sample is the
first 1,000 in the order of `sha256("norte-labs ecosystems/crates 2026-09-25" + "\n" + fullName)`,
each pinned to the head of its default branch that day.

895 of the 1,000 have a `Cargo.toml` at the root, and 660 of those commit a `Cargo.lock` next to it,
73.7 % [70.8–76.5]. Only the root is read, as instruction-gap read only the root `package.json`; the
other 340 stay in `results/population.ndjson` with the reason they were left out. Of the 105 with no
root `Cargo.toml`, 81 keep a `Cargo.lock` deeper in the tree, 31 of them in a `src-tauri/` directory
and 30 of those at the top of the repository, so a Tauri application laid out the usual way is not
in the figures.

The caveat npm and Go carry holds here too. This is popular open source, not what people build at
work: libraries and tools outweigh applications, private code is absent, and whether a library
commits its lockfile is something its maintainers decide either way. Every figure is over this
frame.

## Instrument

Each project's root `Cargo.lock` is parsed as it stood at the pinned commit; 591 are in format 4, 67
in format 3 and 2 in format 1.

- **local**: `[[package]]` entries with no `source`, that is, workspace members and path
  dependencies. They are the project's own code and never count as a dependency or a publisher. The
  median project has 3.
- **declared**: the distinct names that local packages depend on and that are not local themselves.
  `Cargo.lock` records normal, dev and build dependencies for every target, the counterpart of npm's
  `dependencies`, `devDependencies` and `optionalDependencies` together. A `[patch]` entry that
  points at a path swaps a crate for a local copy, which the lockfile records with no source, so
  that crate is neither declared nor published. The root manifests hold 135 such entries in 26
  projects, 101 of them replacing crates from crates.io, in 24 projects.
- **resolved**: the distinct (name, version) pairs whose source is crates.io. Git sources are kept
  apart; 142 projects resolve at least one crate from git, and none resolves from another registry.
- **publisher**: the account crates.io's database dump records in `versions.published_by`, from the
  dump of 2026-09-25. Where the dump has none, the version's API record is read: a version published
  through trusted publishing counts as `gha:<owner>/<repo>`, the name instruction-gap gave such
  publishers, and the one version published from GitLab as `gitlab:<project>`. A version with
  neither has no known publisher and is not counted: 400 of the 25,539 distinct versions resolved,
  spread over 559 of the 660 projects, all published between 2015-04-03 and 2019-02-20, before
  crates.io began recording who publishes (rust-lang/crates.io#1621, merged on 2019-02-22). The
  publisher counts are therefore floors. Were every one of those versions a publisher of its own,
  the median would rise to 118.5 at most.
- **named**: a publisher counts as named if it published any resolved version of a crate whose name
  the project declares, instruction-gap's rule. The rest were never named.
- **owners**: the users and teams the same dump lists as owners of each resolved crate, as of that
  dump. A GitHub team counts once, whatever its size; the dump does not list team members.
- **automation**: instruction-gap's name pattern, unchanged.
- **cluster**: the first of these the project declares, otherwise `none`: bevy, tauri, dioxus,
  leptos, yew, egui/eframe, iced, gtk/gtk4, actix-web, axum, rocket, warp, poem,
  solana-program/anchor-lang, alloy/ethers, wasm-bindgen, tokio, async-std, clap.

Nothing is built. `Cargo.lock` resolves every platform and every combination of features the project
allows, and one build on one machine compiles fewer.

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

The share is over the 658 projects that resolve at least one crate from crates.io; the other two
resolve none. Leaving out the accounts and repositories the automation pattern matches gives a
median of 102 publishers [58–164.5]. The pattern misses a few accounts that look automated, the most
common being `rust-lang-owner`, in 637 projects; dropping it as well moves the median to 101. 548 of
the 660 projects, 83.0 % [80.0–85.7], resolve at least one version published through trusted
publishing.

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
publisher; its column counts the owner of the repository each module comes from
([../go/README.md](../go/README.md)), leaving out the project itself. Owners have no npm
counterpart: instruction-gap's maintainer figure counts the maintainers each version listed when it
was published, not who may publish now.

Each share is over the projects with at least one dependency: 881 of npm's 892, which resolve a
registry version; 658 of the 660 here, which resolve a crate from crates.io; and 341 of Go's 360,
which have a module besides their own. A median Rust project declares 30 crates and resolves
versions from 113.5 publishers, of whom it names 21; the median share it never named is 79.0 %,
against 86.7 % for npm and between 79.5 and 82.8 % for Go. Go's is a range because its count leaves
out the project's own owner, and its cells do not record whether that owner also owns a dependency,
so the owner may have to stay in or come out. npm and crates count only the publishers of registry
versions, which never include the project's own code, so their share is one number.

## The design effect

17 clusters. Publisher sets overlap more inside a cluster than across clusters, a mean Jaccard of
0.271 against 0.228. The intra-class correlation of publishers per project is 0.445, and the design
effect, the cluster-robust variance of the mean over the independent one, is 35.9; leaving out any
one of the five largest clusters puts it between 26.6 and 43.3. With 17 clusters it is not stable
enough to quote as a number. The medians and the per-cluster figures are the ones to cite, and the
means are not 660 independent draws. The three measurements use different estimators and clusters,
so their design effects are not compared.

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

Each figure, where it comes from. `results/` holds every input named here except the root manifests,
which are at their commits.

| figure | field or computation | source | as of |
|---|---|---|---|
| 9,372 in the frame, 14 bands, none at 1,000 | rows of the frame file; each band's `total` | `frame-2026-09-25.ndjson.gz`, `frame-2026-09-25-bands.json`, GitHub search API | 2026-09-25 |
| 1,000 drawn; 895 with a root `Cargo.toml`; 660 with a root `Cargo.lock`; 340 left out | `status` | `population.ndjson`, root listing at each commit | the pinned commits, 2026-09-25 |
| 73.7 % [70.8–76.5] | 660 of 895, Wilson 95 % | `population.ndjson` | same |
| 81 of 105; 31 in a `src-tauri/` directory, 30 of them at the top | `Cargo.lock` paths in each tree; paths containing `src-tauri/`, and those starting with it | `no-root-manifest.json`, GitHub trees API | the pinned commits |
| 591 in format 4, 67 in format 3, 2 in format 1; local median 3 | `lockVersion`; `local` | `cells.ndjson` | the pinned commits |
| 135 path patches in 26 projects, 101 over crates.io crates in 24 | entries with a `path` in the `[patch.*]` tables of each root `Cargo.toml`, by table key | root `Cargo.toml` at each pinned commit | the pinned commits |
| 142 projects resolving from git; none from another registry | `otherSources` | `cells.ndjson` | the pinned commits |
| declared 30, resolved 319 | `declared`, `resolved` | `cells.ndjson`, from each root `Cargo.lock` | the pinned commits |
| 113.5 publishers | `publishers.total`: distinct `versions.published_by` logins, else the `gha:` or `gitlab:` trusted-publishing source | `cells.ndjson`; crates.io database dump (sha256 `bb4454ea72c2677bbdff6701d0cf69358051a5e825c74c05286bea75f1b3c00f`) and per-version API | dump of 2026-09-25 02:00 UTC; API read 2026-09-25 |
| 7.5 trusted-publishing repositories | `publishers.trustedPublishing` | same | same |
| 21 named; 79.0 % never named, over 658 | `publishers.behindDeclared`; `(total − behindDeclared) / total` over the cells with `resolved` > 0, which are the cells with a publisher | same | same |
| 400 of 25,539 versions with no publisher, in 559 projects | `lookup.unknownPublisher`; distinct pairs with neither a login nor a trusted-publishing source | `cells.ndjson` | same |
| all published between 2015-04-03 and 2019-02-20 | `createdAt` of each of the 400 | `unknown-publishers.json`, crates.io API | read 2026-10-01 |
| recording from 2019-02-22 | merge date of rust-lang/crates.io#1621 | GitHub | read 2026-10-01 |
| at most 118.5 | median of `publishers.total + lookup.unknownPublisher` | `cells.ndjson` | same |
| 151 user owners, 33 teams | `owners.users`, `owners.teams`: owners of each resolved crate in the dump | `cells.ndjson`, `crate_owners` in the dump | dump of 2026-09-25 |
| 102 without automation | `publishers.total − publishers.automation` | `cells.ndjson`, instruction-gap's name pattern | same |
| `rust-lang-owner` in 637 projects; 101 without it | cells whose `publishers.ids` hold it; the median above, less that account where present | `cells.ndjson` | same |
| 548 of 660, 83.0 % [80.0–85.7] | cells with `publishers.trustedPublishing` > 0, Wilson 95 % | `cells.ndjson` | same |
| npm: 892, 26, 604, 165, 18; 86.7 % over 881 | `declared.direct`, `resolved.versions`, `publishers.total`, `publishers.behindDirect`; `notChosen / total` over the cells with `lookup.registryVersions` > 0 | instruction-gap `results/cells.ndjson` | 2026-09-17 |
| Go: 360, 9, 81, 40 to 41, 7 to 8; 79.5 to 82.8 % over 341 | without the project itself; the share over the cells with `modules` > 1, its range from not knowing whether the project's owner also owns a dependency | ecosystems/go `results/cells.ndjson` and README | 2026-09-23 |
| 17 clusters; Jaccard 0.271 and 0.228 | first declared framework marker; mean overlap of publisher sets over all pairs, within and across clusters | `cells.ndjson` | same |
| ICC 0.445; design effect 35.9, 26.6 to 43.3 | one-way ANOVA ICC(1); cluster-robust over independent variance of the mean, and the same with each of the five largest clusters left out | `cells.ndjson`, `src/report.py` | same |
| per-cluster n and medians | `cluster`; per cluster, the medians of `declared`, `publishers.total` and the never-named share | `cells.ndjson` | same |
| every line of `results/report.md` | printed by `src/report.py` from `population.ndjson` and `cells.ndjson` | those files | same |

Medians and quartiles are interpolated between order statistics, as instruction-gap's are.

## Files

- `results/frame-2026-09-25.ndjson.gz`, `results/frame-2026-09-25-bands.json`: the frame.
- `results/population.ndjson`: the 1,000 drawn, each with its commit and status.
- `results/cells.ndjson`: one cell per project, with its publishers and owners listed.
- `results/report.md`: the generated figures.
- `results/controls.txt`: the control cases the count ran first. Its line on the declared set
  compares the dependencies of every local package with the root manifest;
  `results/declared-check.txt` compares the root package alone with its own `Cargo.toml`, for the
  roots that are a single package.
- `results/no-root-manifest.json`: the 105 with no root `Cargo.toml`, listed again at their commits,
  with every `Cargo.lock` in their trees.
- `results/unknown-publishers.json`: the 400 versions with no recorded publisher, each with the
  `created_at` the API gave on 2026-10-01.
- `src/`: `frame.py`, `sample.py`, `index_dump.py`, `compute.py`, `report.py`, `refetch.py`,
  `declared_check.py`, `relist.py`, `unknown_dates.py`.

## Corrections

### 2026-10-01

- Of the projects that keep a `Cargo.lock` below the root, 31 were said to keep it in `src-tauri/`.
  One of them has it in `deploy/src-tauri/`; 30 have it at the top of the repository.
- The comparison with npm and Go gave the three shares without what each is over, or why Go's is a
  range and the others are not. It now gives both.
