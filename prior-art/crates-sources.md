# prior-art/crates — sources and searches

Appendix to [crates.md](crates.md). Sweep of 2026-09-25 over four modalities: 140 source
entries, 210 recorded searches. Every source listed here was opened unless the entry says otherwise.

On 2026-10-01 every quotation and figure in these 140 entries was matched against its source.
54 entries were read again against their sources: every one where something did not match at
once, and those behind the sentences of crates.md. In the other 86 only the quotations and
figures were matched.


## academic

23 sources.

- **Structure and Evolution of Package Dependency Networks** — MSR 2017 (IEEE/ACM); Riivo Kikas, Georgios Gousios, Marlon Dumas, Dietmar Pfahl
  <https://gousios.org/pub/ecosystems-evolution.pdf> (DOI 10.1109/MSR.2017.55)
  2017 · Q3 · partial
  Measured: Population: "We used the GHTorrent [27] database of March 2016 to select projects whose repository language identified by GitHub was either Rust, JavaScript or Ruby, were not forks"; for Rust "we cloned all projects listed in GHTorrent" that have `Cargo.toml`. "The final dataset comprises 7978 … projects for Rust". Table II, mean (median) per release, Rust: transitive dependencies 9.3 (5); transitive dependents 7.4 (0); direct dependencies 3.0 (2); direct dependents 1.6 (0). Method: own resolver at commit time. "For Rust, we kept all dependencies we could match among the projects as we did not use official package repository data", so transitive counts are lower bounds.
  Not measured: no maintainers, owners or publishers of any kind. No `Cargo.lock` read. The sample is all GHTorrent Rust repositories, not a star-filtered random sample. No per-project lockfile medians.

- **An empirical comparison of dependency network evolution in seven software packaging ecosystems** — Empirical Software Engineering 24 (2019), arXiv 1710.04936; Alexandre Decan, Tom Mens, Philippe Grosjean
  <https://arxiv.org/abs/1710.04936>
  2019 (arXiv 2017) · Q3 · partial
  Measured: Population: libraries.io data. Cargo had "9k" packages, "48k" releases and "150k" dependencies on 1 April 2017. "half of the dependent packages in Cargo, npm and NuGet have at least 41, 21 and 27 transitive dependencies, respectively, where their median number of direct dependencies is only 2". "more than 50% of the top-level Cargo packages have a dependency tree depth of at least 6". The transitive/direct ratio "is even from 2 to 3 times higher for Cargo, npm and NuGet than for the other ecosystems" (Jan 2017).
  Not measured: registry packages only, no GitHub projects and no lockfiles. No people, owners or publishers.

- **Präzi: from package-based to call-based dependency networks** — Empirical Software Engineering 27:102 (2022); Joseph Hejderup, Moritz Beller, Konstantinos Triantafyllou, Georgios Gousios
  <https://repository.tudelft.nl/record/uuid:73cfca17-023c-4b17-92f8-39cef1ebf527> (Springer page blocked; TU Delft PDF read)
  2022 · Q3 · partial
  Measured: Population: the crates.io index at revision 6c550c8 (14 February 2020), "containing 35,896 packages, 208,023 releases"; call graphs for 142,301 releases. "The median number of dependencies for a package grew from two to three between 2015-2020". "The average dependency tree of resolved packages has nearly grown thrice (5 to 17 transitive dependencies) in 5 years". "packages call only 40% of their resolved dependencies".
  Not measured: registry packages, not applications or lockfiles. No owners or publishers.

- **How Deep Does Your Dependency Tree Go? An Empirical Study of Dependency Amplification Across 10 Package Ecosystems** — arXiv 2512.14739v1 (unrefereed); Jahidul Arafat (Auburn University)
  <https://arxiv.org/abs/2512.14739>
  2025 · Q3 · partial
  Measured: Population: "We collected 50 projects from each ecosystem totaling 500 projects". For Cargo, "we sampled crates from crates.io's most-downloaded crates including async runtimes, serialization libraries, and web frameworks". Purposive sample, n = 50. Method: `Cargo.toml` parsed, then native resolution. "For Cargo crates, we resolved normal dependencies, development dependencies, and build dependencies." Table 3, Cargo: direct 13.7 ± 15.0, transitive 15.1 ± 29.7, total 28.8 ± 40.5, amplification 0.97×. Table 5: median 0.75, P95 2.3, max 3.9; "0% for Cargo" of projects exceed 10×.
  Not measured: library crates rather than GitHub applications, and no committed lockfiles. No owners or publishers. No random sample and no design effect. The amplification definition (transitive/direct, dev dependencies included) differs from resolved/direct.

- **The Grand Software Supply Chain of AI Systems** — arXiv 2604.27781v1; Carmine Cesarano, Martin Monperrus (KTH)
  <https://arxiv.org/abs/2604.27781>
  2026 · Q3 · adjacent
  Measured: "a reference stack of 48 production-grade open-source projects, which declares 4,664 direct dependencies, resolves to 11,508 transitive packages, and totals roughly 392M lines of code". The graphs come from native package-manager resolution across six ecosystems, Cargo included.
  Not measured: no Cargo-specific or per-project distribution; the closure is deduplicated across the stack. No owners or publishers. The sample is purposive AI infrastructure.

- **The Design Space of Lockfiles Across Package Managers** — Empirical Software Engineering (2026, DOI 10.1007/s10664-025-10789-w), arXiv 2505.04834v3; Yogya Gamage, Deepika Tiwari, Martin Monperrus, Benoit Baudry
  <https://arxiv.org/abs/2505.04834>
  2025/2026 · Q3 Q4 · adjacent
  Measured: Frame: GitHub repositories "created between September 30, 2019, and September 30, 2024, that have at least 42 stars, 10 contributors, and 300 commits", updated within three months, with `Cargo.toml` at the root. Table 6, Cargo: 1,089 projects; 54.7 % (596) committed `Cargo.lock` within six months; 70.9 % (772) "as of now", March 28, 2025. Also 15 developer interviews, two of them Cargo users who commit lockfiles.
  Not measured: no dependency counts, publishers or owners. It gives the lockfile-availability rate that bounds a GitHub frame of this kind.

- **Mind the Gap: How SBOM Specification Ambiguities Lead to Divergent Software Bills of Materials. An Empirical Tool Study** — arXiv 2609.19920v1 (cs.CR); Alan Prado, Olivier Zendra, Philippe Boinot (ANSSI), Olivier Barais
  <https://arxiv.org/abs/2609.19920>
  2026 · Q3 Q4 · adjacent
  Measured: Frame: GitHub search sorted by stars, "with a lower bound of 1,000 stars", and at least one declared dependency. "We collected 1,361 Rust projects … we performed a fresh cargo fetch for each project to generate a new Cargo.lock … 1,276 projects had a successfully generated Cargo.lock". Compares cdxgen, Syft and Trivy against a lockfile baseline.
  Not measured: no per-project direct or resolved counts reported, and no publishers or owners. Committed lockfiles deliberately not used.

- **Evolving collaboration, dependencies, and use in the Rust Open Source Software ecosystem** — Scientific Data 9:703 (2022), arXiv 2205.03597v2; William Schueller, Johannes Wachs, Vito D. P. Servedio, Stefan Thurner, Vittorio Loreto
  <https://arxiv.org/abs/2205.03597> (nature.com redirected to a login; arXiv v2 read)
  2022 · Q2 Q4 · adjacent
  Measured: A dataset, not a measurement of Q1/Q2: "over five million distinct contributions of over 72 thousand developers, contributing to over 74 thousand libraries over eight years". "out of 91,437 packages, 74,829 were linked to a repository … and 68,239 of these were successfully cloned". 5,656,407 commits. From crates.io it imports "package names and creation dates, their versions, a list of dependencies for each version with the semantic versioning (semver) syntax associated to them, and the daily downloads".
  Not measured: Table 1 lists 40 tables, among them `packages`, `package_versions`, `package_dependencies`, `users`, `identities` and `org_memberships`. None holds crates.io `crate_owners`, `teams` or `versions.published_by`. `users` means git or GitHub identities of commit authors. No application lockfiles. The pipeline repository was last pushed 2023-05-19, and the last dated dataset folder is `rust_repos_2022_09_07`.

- **Modeling interconnected social and technical risks in open source software ecosystems** — Collective Intelligence (2024), arXiv 2205.04268v2; William Schueller, Johannes Wachs
  <https://arxiv.org/abs/2205.04268>
  2024 (arXiv 2022) · Q2 · adjacent
  Measured: A failure-cascade model over the Rust dependency network plus developers. Developers are "all developers making any contribution to a library in the year preceding a chosen reference time, weighing them by their share of contributions". "Among the top 1,000 Rust libraries by count of their downstream dependencies, our measure … is moderately correlated with how many direct (Spearman's ρ ≈ .56) and transitive dependencies (Spearman's ρ ≈ .54) it has."
  Not measured: people are git contributors, not publish-rights holders or version publishers. The unit is the library, not the project lockfile. No count of people behind a project's graph.

- **Trusting code in the wild: A social network-based centrality rating for developers in the Rust ecosystem** — arXiv 2306.00240v1; Nasif Imtiaz, Preya Shabrina, Laurie Williams
  <https://arxiv.org/abs/2306.00240>
  2023 · Q2 · adjacent
  Measured: "a social network of 6,949 developers across the collaboration activity from 1,644 Rust packages". "97.7% of the developers from the studied packages are interconnected". Survey N = 206: respondents do not differentiate between developers "60.2% of the time".
  Not measured: developers are commit authors and reviewers, not crates.io owners or publishers. No per-project counts.

- **Trusting Code in the Wild: Exploring Contributor Reputation Measures to Review Dependencies in the Rust Ecosystem** — IEEE Transactions on Software Engineering (2025), arXiv 2406.10317v1; Sivana Hamer, Nasif Imtiaz, Mahzabin Tamanna, Preya Shabrina, Laurie Williams
  <https://arxiv.org/abs/2406.10317>
  2025 (arXiv 2024) · Q2 · adjacent
  Measured: From the official dump (Oct 2022–Mar 2023, "Crates.io hosted 92,231 packages"): "We chose the most 1,000 downloaded packages and all their dependency packages, which resulted in 1,724 packages". GitHub repositories were found for 1,644, giving 6,949 developers and a survey of 285. "only 24% of respondents often review dependencies"; "51% of respondents often consider contributor reputation".
  Not measured: no owners or publishers from the registry, no projects and no lockfiles.

- **Core Developer Turnover in the Rust Package Ecosystem: Prevalence, Impact, and Awareness** — Proceedings of the ACM on Software Engineering 2 (FSE 2025); Meng Fan, Yuxia Zhang, Klaas-Jan Stol, Hui Liu
  <https://dl.acm.org/doi/10.1145/3729392> (ACM returns 403; abstract read via OpenAlex; artifact <https://doi.org/10.5281/zenodo.8380307> read)
  2025 · Q2 · adjacent
  Measured: "the turnover of core developers is quite common in the whole Rust ecosystem with 36,991 packages"; "a vast majority of Rust packages only have a single core developer". Artifact: data "exported from crate.io" plus `commit.csv` "from previous literature".
  Not measured: core developers come from commits. No publisher or owner counts per project graph. Full text not read.

- **An Empirical Study on Downstream Dependency Package Groups in Software Packaging Ecosystems** — IET Software (2024); Qing Qi, Jian Cao
  <https://doi.org/10.1049/2024/4488412> (Wiley returns 403; abstract via OpenAlex and repository <https://github.com/onion616/DDG> read)
  2024 · Q2 · adjacent
  Measured: downstream dependency groups of focal packages in Cargo, CPAN and RubyGems, and "collaborative" groups "which requires shared contributors". Group sizes follow a power law.
  Not measured: reverse-dependency groups at registry level. Contributors, not publishers. No project lockfiles. Full text not read.

- **Analysing socio-technical congruence in the package dependency network of Cargo** — ESEC/FSE 2019 Student Research Competition; Mehdi Golzadeh
  <https://orbi.umons.ac.be/bitstream/20.500.12907/39102/1/FSE2019SRC-GolzadehMehdi.pdf>
  2019 · Q2 · adjacent
  Measured: preliminary longitudinal data on Cargo packages and their GitHub social activity, such as comments before a package starts to depend on another.
  Not measured: no owner or publisher counts and no project graphs.

- **On Good Authority: Release-Authority Measurement for Registry-Mediated Package Ecosystems** — arXiv 2606.22593v2; Igor Santos-Grueiro (International University of La Rioja)
  <https://arxiv.org/abs/2606.22593>
  2026 · Q1 Q4 · adjacent (closest to Q1 on identity, wrong unit)
  Measured: A "predecessor-aware release-authority record" (publisher, repository, workflow, provenance, signing, mediation) per release, compared with the previous release. Cohort: "45,812 releases, 43,100 eligible predecessor comparisons, and 942 package coordinates", April 2024–June 2026. crates.io: 135 packages, 1,739 eligible comparisons, 25 triggers. The paper says it "contributes crate owner, publisher, checksum, repository, and trusted-publishing evidence where available" and is "publisher/checksum-visible with emerging trusted publishing". Its Table 2: "Current owner fields can be retro-spective".
  Not measured: the unit is a package's release history. No project, no lockfile, no count of distinct publishers behind a graph, no split into declared and undeclared. The sample is purposive.

- **Cargo Sherlock: An SMT-Based Checker for Software Trust Costs** — FormaliSE '26 (ACM, DOI 10.1145/3793656.3793687), arXiv 2512.12553v2; Muhammad Hassnain, Anirudh Basu, Ethan Ng, Caleb Stanford
  <https://arxiv.org/abs/2512.12553>
  2026 · Q2 · adjacent
  Measured: A per-crate "trust cost". "From crates.io, it collects information about the author(s), download counts, dependencies, and GitHub repository stars and forks", and uses a default list of trusted developers. Evaluation on typosquats of the "top 100 most frequently downloaded" crates, 592 RustSec crates, and 1,000 random crates for performance.
  Not measured: no count of publishers or owners per project graph, and no sample of applications.

- **Auditing Rust Crates Effectively** — LNCS (2026, DOI 10.1007/978-3-032-22723-2_15), arXiv 2602.06466v1; Lydia Zoghbi, David Thien, Ranjit Jhala, Deian Stefan, Caleb Stanford
  <https://arxiv.org/abs/2602.06466>
  2026 · Q3 · adjacent
  Measured: Cargo Scan effects analysis. For hyper, "160K lines of code that spans the 30 packages". "classify ∼3.5K of the top 10K crates on crates.io as safe". Discusses cargo-vet "marking authors as trusted".
  Not measured: no publisher or owner counts and no project sample.

- **Demystifying Compiler Unstable Feature Usage and Impacts in the Rust Ecosystem** — ICSE 2024 (extended in TSE 2025), arXiv 2310.17186; Chenghao Li, Yifei Wu, Wenbo Shen, Zichen Zhao, Rui Chang, Chengwei Liu, et al. (with the tool repository <https://github.com/ZJU-SEC/Cargo-Ecosystem-Monitor>)
  <https://arxiv.org/abs/2310.17186>
  2024 · Q3 Q4 · adjacent
  Measured: "resolve 592,183 package versions to get 139,525,225 direct and transitive dependencies", an ecosystem dependency graph with raw data as of 2022-08-11. The repository's `OtherTools.md` pastes `cargo supply-chain publishers` output and lists "Untrusted maintainer" as future work.
  Not measured: per package version, not per project. No owners or publishers. The "untrusted maintainer" direction was never pursued, and the repository is archived.

- **CHRONO-RESOLUTION: A Dependency Resolution Dataset at Release Points for npm, PyPI, and crates.io Packages** — arXiv 2607.15315v1; Imranur Rahman, Jill Marley, Ranindya Paramitha, Laurie Williams
  <https://arxiv.org/abs/2607.15315>
  2026 · Q4 · adjacent
  Measured: "15,690 crates.io packages with … 158,849 crates.io <package, dependency> relationships", resolved at release points. "the dataset cannot be rebuilt via public deps.dev API, and it will require special access from Google".
  Not measured: packages, not projects. No publishers or owners.

- **Are Your Dependencies Code Reviewed?: Measuring Code Review Coverage in Dependency Updates** — IEEE TSE (2023), arXiv 2206.09422v2; Nasif Imtiaz, Laurie Williams
  <https://arxiv.org/abs/2206.09422>
  2023 · Q2 · adjacent
  Measured: Depdive over "the latest ten updates of the most downloaded 1000 packages" in crates.io, npm, PyPI and RubyGems. "20.1% of the analyzed updates had at least one phantom file"; "only 9.0% of the packages had all their updates … fully code-reviewed".
  Not measured: per package update, not who published it. No project graphs.

- **Cargo Ecosystem Dependency-Vulnerability Knowledge Graph Construction and Vulnerability Propagation Study** — arXiv 2210.07482v1; Peiyang Jia, Chengwei Liu, Hongyu Sun, Chengyi Sun, Mianxue Gu, Yang Liu, Gaofei Wu, He Wang, Yuqing Zhang
  <https://arxiv.org/abs/2210.07482>
  2022 · Q3 · no
  Measured: a knowledge graph of library, version and CVE for crates.io. "The number of versions affected by the propagation of the vulnerabilities is 19.78% in the entire Cargo ecosystem"; "28.61%" of libraries affected.
  Not measured: the graph has no owner or publisher nodes (Table IV), and no projects.

- **A Closer Look at the Security Risks in the Rust Ecosystem** — ACM TOSEM 33(2) (2023), arXiv 2308.15046; Xiaoye Zheng, Zhiyuan Wan, Yun Zhang, Rui Chang, David Lo
  <https://arxiv.org/abs/2308.15046>
  2023 · — · no
  Measured: RustSec vulnerability types and their disclosure and fix durations ("median: 693" days to disclosure).
  Not measured: nothing on owners, publishers or dependency counts per project.

- **A Comprehensive Study on the Impact of Vulnerable Dependencies on Open-Source Software** — ISSRE 2024, arXiv 2512.03868v1; Shree Hari Bittugondanahalli Indra Kumar, Lília Rodrigues Sampaio, André Martin, Andrey Brito, Christof Fetzer
  <https://arxiv.org/abs/2512.03868>
  2024 · Q3 · no
  Measured: "1042 public open-source repositories … 49055 releases", SBOMs through the VODA tool, Rust about 20 % of repositories.
  Not measured: the depth analysis covers "Java, Go, PHP, JavaScript, and Python", and Rust is excluded. No publishers.

### Searches run

- `web search :: crates.io publishers per project Cargo.lock distinct maintainers empirical study`
- `web search :: Schueller Wachs "Evolving collaboration, dependencies, and use in the Rust Open Source Software ecosystem" Scientific Data`
- `web search :: "crates.io" owners transitive dependencies implicitly trusted maintainers Rust arXiv`
- `web search :: "Trusting code in the wild" social network centrality rating developers Rust ecosystem`
- `web search :: Kikas Gousios Dumas Pfahl "Structure and evolution of package dependency networks" Rust transitive`
- `web search :: "A Closer Look at the Security Risks in the Rust Ecosystem" TOSEM Zheng Wan Lo`
- `web search :: Rust GitHub projects Cargo.lock direct dependencies transitive dependencies median empirical study`
- `web search :: "Core Developer Turnover in the Rust Package Ecosystem" Prevalence Impact Awareness arXiv`
- `web search :: "An Empirical Study on Downstream Dependency Package Groups in Software Packaging Ecosystems" IET Software`
- `web search :: crates.io owners publishers dependency graph Rust empirical study maintainers "per project" [restricted to dl.acm.org, ieeexplore.ieee.org, link.springer.com, arxiv.org, usenix.org, ndss-symposium.org]`
- `web search :: Rust crates maintainers bus factor crates.io owners single maintainer study`
- `web search :: "cargo-supply-chain" OR "cargo supply-chain" publishers study Rust projects sample`
- `OpenAlex :: crates.io [title and abstract]`
- `OpenAlex :: "crates.io" maintainers [title and abstract]`
- `OpenAlex :: cargo rust dependency network [title and abstract]`
- `OpenAlex :: rust ecosystem dependencies [title and abstract]`
- `OpenAlex :: rust supply chain security [title and abstract]`
- `OpenAlex :: Cargo.lock [title and abstract]`
- `OpenAlex :: dependency amplification [title and abstract]`
- `OpenAlex :: transitive dependencies maintainers trust package [title and abstract]`
- `OpenAlex :: implicitly trusted maintainers [title and abstract]`
- `OpenAlex :: publish rights package registry [title and abstract]`
- `OpenAlex :: crate owners rust [title and abstract]`
- `OpenAlex :: trusted publishing registry [title and abstract]`
- `OpenAlex :: maintainers per project dependency tree [title and abstract]`
- `OpenAlex :: cargo-vet OR cargo-crev OR cargo-supply-chain [title and abstract]`
- `OpenAlex :: rust dependencies developers review [title and abstract]`
- `OpenAlex :: package maintainers accounts ecosystem npm pypi cargo [title and abstract]`
- `OpenAlex :: lockfile github projects dependencies [title and abstract]`
- `OpenAlex :: software supply chain rust crates [title and abstract]`
- `OpenAlex :: rust dependency bloat [title and abstract]`
- `OpenAlex :: rust unused dependencies cargo [title and abstract]`
- `OpenAlex :: cargo features dependencies rust empirical [title and abstract]`
- `OpenAlex :: rust projects github dependencies empirical [title and abstract]`
- `OpenAlex :: crates.io account takeover [title and abstract]`
- `OpenAlex :: rust ecosystem maintainers owners [title and abstract]`
- `OpenAlex :: "cargo supply-chain" [full text]`
- `OpenAlex :: "cargo-supply-chain" [full text]`
- `OpenAlex :: "crate_owners" [full text]`
- `OpenAlex :: "published_by" crates.io [full text]`
- `OpenAlex :: "cargo vet" publishers [full text]`
- `OpenAlex :: "crates.io" "publish rights" [full text]`
- `OpenAlex :: "cargo-crev" [full text]`
- `OpenAlex :: "crates.io" "owners" "transitive" [full text]`
- `OpenAlex :: technical lag dependencies major package managers [title]`
- `OpenAlex :: works citing Schueller et al. 2022 [citation graph]`
- `OpenAlex :: works citing Kikas et al. 2017 [citation graph]`
- `OpenAlex :: works citing Decan et al., EMSE [citation graph]`
- `OpenAlex :: works citing Präzi [citation graph]`
- `OpenAlex :: works citing Imtiaz & Williams, TSE 2023 [citation graph]`
- `OpenAlex :: works citing Hamer et al., TSE 2025 [citation graph]`
- `OpenAlex :: works citing Fan et al., FSE 2025 [citation graph]`
- `OpenAlex :: works citing Zheng et al., TOSEM 2023 [citation graph]`
- `OpenAlex :: works citing Li et al., TSE 2022, on yanked releases [citation graph]`
- `OpenAlex :: works citing Zimmermann et al. 2019 (W2915997584), titles filtered for rust|cargo|crate|maintainer|publisher|owner|trust [citation graph]`
- `OpenAlex :: works citing Zimmermann et al. 2019 (W2965940576), same title filter [citation graph]`
- `OpenAlex :: works citing Zahan et al. 2022, weak links (W4226410005), same title filter [citation graph]`
- `OpenAlex :: works by Laurie Williams (A5028171895, A5004848209) since 2024 [author]`
- `arXiv API :: all:"crates.io"`
- `arXiv API :: abs:rust AND abs:ecosystem AND abs:dependencies`
- `arXiv API :: abs:cargo AND abs:rust AND abs:supply`
- `arXiv API :: abs:crates AND abs:maintainers`
- `arXiv API :: abs:"trusted publishing"`
- `arXiv API :: abs:maintainers AND abs:"transitive dependencies"`
- `arXiv API :: ti:"Cargo Sherlock"`
- `arXiv API :: abs:"dependency amplification"`


## code-and-data

25 sources.

- **crates.io database dump configuration (`dump-db.toml`) and tarball README** — rust-lang/crates.io (crates/crates_io_database_dump); crates.io team
  <https://github.com/rust-lang/crates.io/blob/main/crates/crates_io_database_dump/src/dump-db.toml>
  read 2026-09-25 (last change 2026-09-17) · Q1 Q2 Q4 · answers (instrument)
  Measured: the column visibility of the public daily dump. Public: `versions.published_by`; `crate_owners.{crate_id, owner_id, created_at, created_by, owner_kind}` with `filter = "NOT deleted"`; `teams.{id, login, github_id, name, avatar, org_id}`; `users.{id, gh_login, name, gh_id, username, created_at}`; `crates.trustpub_only`; `dependencies.*`. Private: `versions.trustpub_data` ("private for now, until we can guarantee a stable data schema"); `trustpub_configs_github`, `trustpub_configs_gitlab`; `crate_owner_invitations`; `version_owner_actions`; `versions_published_by.email`. README: "`crate_owners.owner_kind` - if `0`, the crate owner is a user; if `1`, the crate owner is a team"; "`teams.login` - this will look something like `github:foo:bar`".
  Not measured: nothing. It is a schema. It shows that trusted-publisher identity is missing from the dump, and that owners are current rather than historical.

- **crates.io data-access page, and the sparse index** — rust-lang/crates.io (svelte/src/routes/data-access/+page.svelte); index.crates.io
  <https://crates.io/data-access> (single-page app; text read from <https://github.com/rust-lang/crates.io/blob/main/svelte/src/routes/data-access/+page.svelte>)
  read 2026-09-25 · Q4 · answers (access policy)
  Measured: The dump "contain[s] all information available through the crates.io API in a single download. They are updated every 24 hours." API: "A maximum of 1 request per second", with an identifying user-agent. Sparse index: "No rate limits". An index entry (tokio) holds `cksum, deps, features, features2, name, pubtime, rust_version, v, vers, yanked`.
  Not measured: the index has no owner or publisher. The "all information" claim is false for `trustpub_data` (see the dump entry). No historical dumps are offered.

- **crates.io publish path and version API: `publish.rs`, `TrustpubData`, migration `2018-11-01-223239_add_published_by_to_versions`, live version objects** — rust-lang/crates.io; crates.io API
  <https://github.com/rust-lang/crates.io/blob/main/src/controllers/krate/publish.rs>
  read 2026-09-25 · Q1 Q4 · answers (semantics)
  Measured: `AuthType::TrustPub(_) => None` for the user, so `published_by` is null under trusted publishing, and `.maybe_trustpub_data(...)` stores the claims. `TrustpubData` is `GitHub {repository, run_id, sha}` or `GitLab {project_path, job_id, sha}`. The migration is `ALTER TABLE versions ADD COLUMN published_by integer;` with no backfill. Live API: `tokio/1.40.0` has `published_by` "Darksonn", `audit_actions` with `[{"action":"publish",…}]`, and `trustpub_data` null; `ambient-id 0.0.11` and `zizmor 1.30.1` have `published_by` null and `trustpub_data` of the form `{"provider":"github","repository":"astral-sh/ambient-id",…}`.
  Not measured: no counts. It fixes how Q1's publisher identity has to be read: `published_by` where present, `trustpub_data` from the API otherwise, and unknown for pre-2018 versions.

- **database_dump: Include all users in database dumps (#14636)** — rust-lang/crates.io pull request, merged 2026-09-14
  <https://github.com/rust-lang/crates.io/pull/14636>
  2026 · Q4 · answers (data change)
  Measured: before the merge, "The user filter only includes current crate owners and publishers of existing versions". After it, all users are exported, and "Email addresses, authentication tokens, and other private fields remain excluded".
  Not measured: nothing. It matters because dumps before and after 2026-09-14 differ in `users`.

- **RFC 3691: Security Improvements for CI Publishing to crates.io (trusted publishing)** — rust-lang/rfcs
  <https://github.com/rust-lang/rfcs/blob/master/text/3691-trusted-publishing-cratesio.md>
  2024 (start date 2024-09-10) · Q1 Q4 · adjacent
  Measured: "A _Trusted Publisher Configuration_ can only be created after an initial manual publishing of a crate"; "A Trusted Publisher Configuration will be _owned_ by the associated crate."
  Not measured: nothing on adoption. Every trusted-published crate therefore has at least one earlier version with a human `published_by`, unless that version predates 2019-02-22, when crates.io began recording publishers (rust-lang/crates.io#1621).

- **crates.io: development update (July 2026)** — Rust Blog; Tobias Bieniek (crates.io team)
  <https://github.com/rust-lang/blog.rust-lang.org/blob/main/content/crates-io-development-update-2026-07/index.md>
  2026-07-13 · Q4 · adjacent
  Measured: RFC #3946 was accepted and "introduces usernames that are native to crates.io and independent of linked GitHub accounts".
  Not measured: gives no trusted-publishing adoption numbers. It bears on which key identifies a publisher over time.

- **cargo-supply-chain** — rust-secure-code (Rust Secure Code WG); sample output by Sergey "Shnatsel" Davidoff
  <https://github.com/rust-secure-code/cargo-supply-chain> (gist <https://gist.github.com/Shnatsel/3b7f7d331d944bb75b2f363d4b5fb43d>)
  2020– (created 2020-10-02; last push 2026-02-05; 357 stars) · Q2 · partial (instrument, one project at a time)
  Measured: `publishers` subcommand: "List all crates.io publishers in the depedency graph". "By default the supply chain is listed for **all targets** and **default features only**." Code: `publisher_users` and `publisher_teams` read `crate_owners` (owner_kind 0 and 1) or the API `owner_user` and `owner_team`. A `versions` and `published_by` cache is loaded but not used for output. The gist (2021-05-23) run on itself: 64 individuals, 12 teams.
  Not measured: it lists current owners, not version publishers, so it answers Q2, not Q1. It has never been run over a sample. It has no declared-versus-undeclared split, although the "via crates" lists would allow one.

- **Rust Supply Chain Security Guide: Manage dependencies** — rust-secure-code/rust-supply-chain-security
  <https://github.com/rust-secure-code/rust-supply-chain-security/blob/main/src/dependencies.md>
  2023 (authored 2023-02-10, committed 2023-07-16) · Q2 · adjacent
  Measured: "the number of dependencies is not always a good measurement of the attack surface (several crates maintained by the same team don't really multiply the risk)". One unnamed project: "139. zrzka via crates: anes" and "35. "github:tower-rs:publish"". Also: "Github teams are black boxes."
  Not measured: one project, no sample.

- **Supply Chain Security in the Rust Ecosystem: A case study** — Pass the SALT 2023 slides; Alexis Mousset (Rudder)
  <https://archives.pass-the-salt.org/Pass%20the%20SALT/2023/slides/PTS2023-Talk-11-rust-supply-chain-security.pdf>
  2023 · Q2 · adjacent
  Measured: rudder-relayd, "240 dependencies", "139 individuals and 34 GitHub teams". This is plausibly the same project as the guide's example, which has the same 139 individuals and 35 teams; not confirmed.
  Not measured: n = 1.

- **Maybe We Can Have Nice Things** — Noncombatant blog; Chris Palmer
  <https://github.com/noncombatant/noncombatant.github.io/blob/main/2021/02/16/maybe-we-can-have-nice-things/index.html>
  2021-02-16 · Q2 · adjacent
  Measured: `cargo supply-chain publishers` on cargo-supply-chain: 79 crates fetched, 57 individuals, 9 teams.
  Not measured: n = 1.

- **dedicated-server-availability-watcher README, §Supply-chain** — GitHub user nipil
  <https://github.com/nipil/dedicated-server-availability-watcher>
  about 2025-04 (last push 2025-04-28) · Q2 · adjacent
  Measured: `cargo supply-chain publishers` output ending at "117. zesterer via crates: chumsky" and at team "37. "github:uuid-rs:uuid"".
  Not measured: n = 1. GitHub code search returns only 6 files containing the tool's output line.

- **supply_chain: a wrapper around cargo-supply-chain** — trailofbits (Samuel Moelius et al.)
  <https://github.com/trailofbits/supply_chain>
  2026 (created 2026-08-05) · Q2 · adjacent (instrument)
  Measured: runs `cargo supply-chain json --no-dev` in tests and snapshots it, so that "changes to the publishers in a Rust project's dependency graph" become visible in review. Committed snapshots `supply_chain.json` sit in 9 files on GitHub, mostly Trail of Bits and smoelius repositories.
  Not measured: no aggregation.

- **cargo-vet: Trusting Publishers, and `imports.lock` publisher entries** — mozilla/cargo-vet
  <https://github.com/mozilla/cargo-vet/blob/main/book/src/trusting-publishers.md>
  read 2026-09-25 · Q1 Q4 · partial (per-version publisher recorded for a subset)
  Measured: "cargo vet also supports trusting releases of a given crate by a specific publisher". `imports.lock` entries `[[publisher.<crate>]] version, when, user-id, user-login, user-name`. `src/format.rs` also serialises a `trusted-publisher` source (`CratesTrustpubSignature`). cargo-vet's own repository has 100 `[[publisher.*]]` entries against 262 registry packages in its `Cargo.lock`. GitHub code search: 355 `imports.lock` files contain `[[publisher.`.
  Not measured: only crates relevant to trust or audit entries get publisher rows, and nobody has aggregated these files. Projects that adopt cargo-vet are a self-selected, non-random frame.

- **cargo-crev: `crev crate verify` owner column** — crev-dev/cargo-crev
  <https://github.com/crev-dev/cargo-crev/blob/main/cargo-crev/src/doc/getting_started.md>
  read 2026-09-25 · Q2 · partial (instrument)
  Measured: "In recursive mode: Total number of owners from crates.io; Total number of owner groups ignoring subsets", per dependency subtree.
  Not measured: no published sample runs.

- **cargo-aprz (Microsoft Oxidizer ox-tools)** — microsoft/ox-tools
  <https://github.com/microsoft/ox-tools/tree/main/crates/cargo-aprz>
  2026 (repository created 2026-03-10) · Q2 Q3 · adjacent (instrument)
  Measured: per-crate metrics, including `crate.owners` ("List of owner usernames") and `code.transitive_dependencies`, over a crate list or "the full transitive set".
  Not measured: no aggregate across projects, and no `published_by`.

- **deps.dev BigQuery dataset and API v3** — Google Open Source Insights
  <https://docs.deps.dev/bigquery/v1/> and <https://api.deps.dev/v3/systems/cargo/packages/tokio/versions/1.40.0:dependencies>
  read 2026-09-25 · Q3 Q4 · adjacent
  Measured: "Dependency graphs are only available for npm, Go, Maven, PyPI and Cargo", computed "on a generic 64-bit Linux system, with no other dependencies present". Tables include `CargoRequirements`, `Dependencies`, `DependencyGraphEdges`, `PackageVersions` (attestations) and `PackageVersionToProject`. tokio 1.40.0: 22 DIRECT and 109 INDIRECT nodes. The version object carries no publisher field.
  Not measured: there is no table or field for who published or owns a version. Graphs are per package version, not per repository lockfile.

- **ecosyste.ms: packages and repos APIs** — ecosyste.ms (Andrew Nesbitt)
  <https://packages.ecosyste.ms/api/v1/registries/crates.io/packages/tokio> and <https://repos.ecosyste.ms/api/v1/hosts/GitHub/repositories/BurntSushi%2Fripgrep/manifests>
  read 2026-09-25 · Q4 · partial
  Measured: `maintainers` for tokio are carllerche and Darksonn, while crates.io owners also include team `github:tokio-rs:core`. Teams are dropped. Version metadata keys include `published_by` and `audit_actions` but no trusted-publishing field: ambient-id 0.0.11 has `published_by` null and no repository. repos.ecosyste.ms parses `Cargo.lock` per repository (ripgrep: `Cargo.lock` "lockfile", 56 deps). The OpenAPI exposes `/critical/sole_maintainers`.
  Not measured: no per-project publisher aggregation. It would miss teams and trusted publishers.

- **Libraries.io Open Source Repository and Dependency Metadata 1.6.0** — Zenodo (Tidelift)
  <https://zenodo.org/records/3626071>
  2020-01-12 · Q3 Q4 · adjacent
  Measured: seven CSVs, including "Repository dependencies", which covers dependencies "listed in a lockfile that has been automatically generated by a package manager and committed".
  Not measured: "You will not find any information about the individuals who create and maintain these projects". Stale since 2020.

- **lib.rs statistics** — lib.rs (Kornel Lesiński)
  <https://lib.rs/stats> (live page behind a Cloudflare challenge; Wayback snapshot 20260507102927 read)
  2026-05 · Q2 Q3 · adjacent
  Measured: "There are 63,833 users or teams that have a crate on crates.io. The number of owners is growing at a rate of 1.3× per year. Lib.rs has indexed 263778 crates." Also a histogram of direct dependencies per crate ("Includes dev, build-time and optional dependencies").
  Not measured: ecosystem totals, not per project. No transitive-owner count.

- **The state of the Rust dependency ecosystem** — 00f.net; Frank Denis
  <https://00f.net/2025/10/17/state-of-the-rust-ecosystem/>
  2025-10-17 · Q3 · adjacent
  Measured: "200,650 crates from crates.io as of October 2025"; "Dependency graph analysis of the 1,000 most downloaded crates"; "All data came from the crates.io API". "Among the top 1,000 most downloaded crates, I found 249 abandoned dependencies". "Author-level insights from 3,663 developers".
  Not measured: no owner or publisher counts per graph, and no projects or lockfiles.

- **siso-foundry `pipelines/crates/load_publisher_signal.py`** — sisodias/siso-foundry (0 stars, created 2026-08-03)
  <https://github.com/sisodias/siso-foundry/blob/main/pipelines/crates/load_publisher_signal.py>
  2026-09 · Q1 Q4 · adjacent (unverified)
  Measured: a code comment claims "versions.csv carries published_by on 92% of rows (33,826 distinct publishers in a 400k sample)" and "Ownership is a permission; publishing is an ACT".
  Not measured: no method, no per-project unit. The figure is unverified.

- **db-dump** — dtolnay/db-dump (David Tolnay)
  <https://github.com/dtolnay/db-dump>
  2021– (last push 2026-08-19) · Q4 · adjacent (instrument)
  Measured: a "Library for scripting analyses against crates.io's database dumps". Example `user-dependencies` "Computes the percentage of crates.io which depends directly on at least one crate by the specified user".
  Not measured: no per-project publisher analysis.

- **Painter** — rustfoundation/painter (Rust Foundation)
  <https://github.com/rustfoundation/painter>
  2023– (last push 2025-05-05) · Q3 Q4 · adjacent (instrument)
  Measured: "a graph database of dependencies and invocations between all crates within the crates.io ecosystem", from the index or the SQL dump.
  Not measured: no identities and no projects.

- **GitHub dependency-graph SBOM export** — GitHub REST `GET /repos/{owner}/{repo}/dependency-graph/sbom`
  <https://api.github.com/repos/BurntSushi/ripgrep/dependency-graph/sbom>
  read 2026-09-25 · Q3 Q4 · adjacent (instrument)
  Measured: ripgrep has 115 SPDX packages, 111 with `pkg:cargo/` purls, resolved from the repository's lockfiles, including `fuzz/Cargo.lock`.
  Not measured: no identities. It mixes nested lockfiles, which is a caution for "root Cargo.lock" counting.

- **repo_datasets (pipeline for Schueller et al.)** — wschuell/repo_datasets
  <https://github.com/wschuell/repo_datasets>
  2022–2023 (last push 2023-05-19) · Q4 · adjacent
  Measured: fillers for commits, forks and GitHub repository ownership (`RepoCommitOwnershipFiller`); dated folders `rust_repos_2022_03_14` and `rust_repos_2022_09_07`.
  Not measured: code search in the repository finds no `crate_owners` or `published_by`. It holds registry-side dependencies only.

### Searches run

- `web search :: libraries.io open data 1.6.0 zenodo repository dependencies Cargo columns`
- `GitHub repository search :: crates.io publishers`
- `GitHub repository search :: cargo supply-chain publishers`
- `GitHub repository search :: crates.io owners dependency graph`
- `GitHub repository search :: published_by crates.io`
- `GitHub repository search :: crates.io maintainers analysis`
- `GitHub repository search :: Cargo.lock publishers`
- `GitHub repository search :: rust supply chain trust publishers`
- `GitHub repository search :: crates.io db-dump analysis`
- `GitHub repository search :: cargo lock owners`
- `GitHub repository search :: cargo supply chain`
- `GitHub repository search :: crates.io owners`
- `GitHub repository search :: crates.io dump`
- `GitHub repository search :: cargo trust`
- `GitHub repository search :: crate owners`
- `GitHub repository search :: cargo vet`
- `GitHub repository search :: cargo crev`
- `GitHub repository search :: rust dependency trust`
- `GitHub repository search :: crates maintainers`
- `GitHub repository search :: cargo publishers`
- `GitHub repository search :: crates.io analysis`
- `GitHub repository search :: crates-io ecosystem study`
- `GitHub repository search :: cargo publishers dependency`
- `GitHub repository search :: supply chain publishers crates`
- `GitHub repository search :: crates.io maintainers transitive`
- `GitHub repository search :: rust dependency trust publishers`
- `GitHub repository search :: cargo owners audit`
- `GitHub repository search :: crates.io trusted publishing adoption`
- `GitHub repository search :: cargo-supply-chain`
- `GitHub repository search :: supply-chain [language Rust, sorted by stars]`
- `GitHub code search :: "dump-db.toml" [in rust-lang/crates.io]`
- `GitHub code search :: "trustpub_data" [in rust-lang/crates.io]`
- `GitHub code search :: "db-dump.tar.gz" [in rust-lang/crates.io]`
- `GitHub code search :: "enum TrustpubData" [in rust-lang/crates.io]`
- `GitHub code search :: database dump [in rust-lang/crates.io]`
- `GitHub code search :: data-access [in rust-lang/crates.io]`
- `GitHub code search :: "[[publisher." filename:imports.lock`
- `GitHub code search :: "can publish updates for your dependencies"`
- `GitHub code search :: "individuals can publish updates"`
- `GitHub code search :: owner_team crates.io "api/v1/crates"`
- `GitHub code search :: "owner_user" "owner_team" language:Rust`
- `GitHub code search :: "owner_user" language:Python crates.io`
- `GitHub code search :: crate_owners.csv`
- `GitHub code search :: "Cargo.lock" "published_by"`
- `GitHub code search :: "publishing rights" Cargo.lock`
- `GitHub code search :: "publish rights" crates.io dependencies`
- `GitHub code search :: "trusted_publishing" OR "trustpub_data" Cargo.lock`
- `GitHub code search :: "distinct publishers" crates`
- `GitHub code search :: "crates.io accounts" dependencies`
- `GitHub code search :: filename:supply_chain.json "publishers"`
- `GitHub code search :: "cargo supply-chain" "publishers" path:.github/workflows`
- `GitHub code search :: owner [in crev-dev/cargo-crev]`
- `GitHub code search :: publisher [in mozilla/cargo-vet]`
- `GitHub code search :: published_by [in mozilla/cargo-vet]`
- `GitHub code search :: trustpub [in mozilla/cargo-vet]`
- `GitHub code search :: trusted_publisher [in mozilla/cargo-vet]`
- `GitHub code search :: load_versions [in rust-secure-code/cargo-supply-chain]`
- `GitHub code search :: published_by [in rust-secure-code/cargo-supply-chain]`
- `GitHub code search :: owner [in wschuell/repo_datasets]`
- `GitHub code search :: published_by [in wschuell/repo_datasets]`
- `GitHub code search :: published_by [in andrew/nesbitt.io]`
- `GitHub code search :: crates.io maintainers [in andrew/nesbitt.io]`
- `GitHub code search :: crate_owners OR published_by OR "cargo supply-chain" [in andrew/nesbitt.io]`
- `GitHub code search :: Cargo.lock maintainers [in andrew/nesbitt.io]`
- `crates.io search :: supply chain`
- `crates.io search :: owners dependencies`
- `crates.io search :: publishers`
- `crates.io search :: crate owners`
- `crates.io search :: maintainers dependencies`
- `crates.io search :: trusted publishing`


## industry

46 sources.

- **cargo-supply-chain** — rust-secure-code (Rust Secure Code WG); Sergey "Shnatsel" Davidoff and contributors
  <https://github.com/rust-secure-code/cargo-supply-chain>
  2020–2026 (repo created 2020-10-02; v0.3.7 on 2026-02-05) · Q2, Q1 · partial
  Measured: A tool, not a study. "Gather author, contributor and publisher data on crates in your dependency graph". Its use cases include "An analysis of all the contributors you implicitly trust by building their software." `publishers` calls `fetch_owners_of_crates` (src/subcommands/publishers.rs) and prints "The following individuals can publish updates for your dependencies:" and "All members of the following teams can publish updates for your dependencies:". The graph comes from `cargo metadata`, over "all targets and default features only" by default. v0.3.6 (2026-01-22) stopped counting "transitive optional dependencies that are disabled by features". The only numbers it publishes are the sample outputs from running it on itself. The `publishers` gist <https://gist.github.com/Shnatsel/3b7f7d331d944bb75b2f363d4b5fb43d> lists 64 individuals (alexcrichton via 22 crates, dtolnay via 11, …) and 12 teams, and notes "there may be outstanding publisher invitations" and "Github teams are black boxes".
  Not measured: it counts current *owners* (publish rights), not the per-version `published_by` account or the trusted-publishing repository. No sample, no medians, no direct/transitive split of owners. Nothing on owners behind crates the project did not declare. The graph comes from `cargo metadata` (all targets), not a verbatim read of the root `Cargo.lock`.

- **Rust Supply Chain Security Guide — "Manage dependencies"** — rust-secure-code; Alexis Mousset (initial commit)
  <https://github.com/rust-secure-code/rust-supply-chain-security/blob/HEAD/src/dependencies.md> (book: <https://rust-secure-code.github.io/rust-supply-chain-security/>)
  2023 · Q2, Q4 · partial
  Measured: An excerpt of `cargo supply-chain` output for an unnamed project, ending in " 139. zrzka via crates: anes" and " 35. "github:tower-rs:publish" … via crates: tower-service". That is 139 individuals and 35 teams. The guide says "the number of dependencies is not always a good measurement of the attack surface (several crates maintained by the same team don't really multiply the risk)". It recommends `cargo supply-chain` to "get an overview of people and organizations with publish access to your dependencies."
  Not measured: the project is not named. n=1. No direct/resolved counts. Owners, not publishers. No sample.

- **cargo-vet — trusted-publisher entries keyed on `published_by` / `trustpub_data`** — Mozilla; cargo-vet maintainers
  <https://mozilla.github.io/cargo-vet/trusting-publishers.html> ; source <https://github.com/mozilla/cargo-vet/blob/main/src/storage.rs>, <https://github.com/mozilla/cargo-vet/blob/main/src/format.rs>
  2023 (trusted entries, commit 2023-04-20) and 2025 (trusted-publisher support, commit 2025-09-25) · Q1, Q4 · adjacent
  Measured: No statistics. It is a design precedent: per version, cargo-vet records `api_version.published_by` as `CratesSourceId::User { user_id }`, "or else" `CratesSourceId::TrustedPublisher { trusted_publisher: api_version.trustpub_data?.as_signature()? }` (storage.rs). The docs say "Trust entries are fundamentally a heuristic. The trusted publisher is not consulted and may or may not have personally authored or reviewed all the code." Mozilla's published `audits.toml` (<https://raw.githubusercontent.com/mozilla/supply-chain/main/audits.toml>) contained, on 2026-09-25, 1,526 `[[audits.*]]` entries and 229 `[[trusted.*]]` entries, covering 162 crates and 23 distinct crates.io user-ids. Google's feed has 2,197 audits and 0 trusted entries.
  Not measured: it never counts publishers per project or over any sample. It keys on the same identity as the publisher count in the note, which supports that method. It is not prior measurement.

- **Securing our Rust supply chain with cargo-vet** — firefox-dev mailing list (Mozilla); Bobby Holley
  <https://groups.google.com/a/mozilla.org/g/firefox-dev/c/e9Fm1yXL0uk>
  2022 (2022-06-08) · Q3, Q4 · adjacent
  Measured: "Our dependency tree has steadily grown to almost four hundred third-party crates".
  Not measured: one project. No publishers or owners.

- **crates.io: development update (Trusted Publishing launch)** — Rust Blog; crates.io team (Tobias Bieniek)
  <https://blog.rust-lang.org/2025/07/11/crates-io-development-update-2025-07/>
  2025 · Q4 · adjacent
  Measured: launch announcement. "Trusted Publishing eliminates the need for GitHub Actions secrets when publishing crates from your CI/CD pipeline." It is limited to GitHub Actions at launch.
  Not measured: no adoption figures, and no statement about what `published_by` records for trusted-publishing versions.

- **crates.io: development update** — Rust Blog; crates.io team
  <https://blog.rust-lang.org/2026/01/21/crates-io-development-update>
  2026 (2026-01-21) · Q4 · adjacent
  Measured: "Trusted Publishing now supports GitLab CI/CD … this currently only works with GitLab.com". There is an enforcement mode where "traditional API token-based publishing is disabled, and only Trusted Publishing can be used". The `pull_request_target` and `workflow_run` triggers are blocked.
  Not measured: no adoption numbers.

- **crates.io: development update** — Rust Blog; crates.io team
  <https://blog.rust-lang.org/2025/02/05/crates-io-development-update/>
  2025 (2025-02-05) · Q4 · adjacent
  Measured: RFC 3691 accepted. "API tokens created on crates.io now expire after 90 days by default". Deletion rules.
  Not measured: no publisher or owner statistics.

- **crates.io: development update** — Rust Blog; crates.io team
  <https://blog.rust-lang.org/2026/07/13/crates-io-development-update/>
  2026 (2026-07-13) · Q4 · no
  Measured: source viewer, the untangling of crates.io accounts from GitHub (RFC #3946), and security and maintenance warnings.
  Not measured: nothing on trusted-publishing adoption, `published_by` or owners.

- **RFC 3691: Trusted Publishing for crates.io** — Rust RFC Book; Mark Tropea (mdtro) and others
  <https://rust-lang.github.io/rfcs/3691-trusted-publishing-cratesio.html>
  2024 · Q4 · adjacent
  Measured: rationale (tokens "can be used from any source without restriction"). Provenance verification of published crates, for example through Sigstore, is listed as out of scope. "Any owners of the crate can create, delete, or edit these configurations." Cites PyPI "over 13,000 projects".
  Not measured: no crates.io data. Nothing on how the publisher is displayed.

- **Record who published a version of a crate (issue #1478)** — rust-lang/crates.io; opened by kornelski
  <https://github.com/rust-lang/crates.io/issues/1478>
  2018 (opened 2018-08-20; closed) · Q1, Q4 · adjacent
  Measured: the origin of `published_by`. "When a crate has multiple owners it's not possible to establish who published what." Motivations: knowing "whose credentials were stolen or misused", and research into finding trusted users from the relationships between crates. Implemented as a nullable `published_by` column.
  Not measured: no statistics.

- **crates.io database dump — column visibility (`dump-db.toml`)** — rust-lang/crates.io; crates.io team
  <https://github.com/rust-lang/crates.io/blob/main/crates/crates_io_database_dump/src/dump-db.toml>
  2026 (latest commits 2026-09-14 "Include all users in database dumps (#14636)" and 2026-09-17) · Q1, Q2, Q4 · adjacent (method-relevant)
  Measured: No statistics. The configuration sets `versions.published_by = "public"`; `crate_owners` (`owner_id`, `owner_kind`, `created_by`) is public, and so is `crates.trustpub_only`. `versions.trustpub_data = "private"` ("private for now, until we can guarantee a stable data schema"), and every `trustpub_configs_github` / `trustpub_configs_gitlab` column is private. The crates.io /data-access page is rendered client-side and returns no text.
  Not measured: the trusted-publishing repository behind a version is not in the dump and must come from the per-version API (which cargo-vet uses). The owners and `published_by` user are in the dump.

- **Trusted Publishing on crates.io: Rust Foundation Boosts Supply Chain Security** — Alpha-Omega blog; Tobias Bieniek (Rust Foundation)
  <https://alpha-omega.dev/blog/trusted-publishing-secure-rust-package-deployment-without-secrets/>
  2025 (2025-09-30) · Q4 · partial (the only adoption number found)
  Measured: "Over 770 packages have configured trusted publishing, including high-profile projects like pyo3 and the cc crate" (since the July 2025 rollout). For comparison: "PyPI has seen over 39,000 projects adopt trusted publishing".
  Not measured: configured crates, not versions published. No share of downloads or of any dependency graph. No later figure.

- **Alpha-Omega engagement monthly updates — Rust / Rust Foundation** — OpenSSF Alpha-Omega (GitHub); Rust Foundation staff
  <https://github.com/ossf/alpha-omega/tree/main/alpha/engagements/2025/Rust> ; <https://github.com/ossf/alpha-omega/tree/main/alpha/engagements/2026/Rust%20Foundation>
  2025–2026 (monthly through 2026-08) · Q4 · adjacent
  Measured: 2025-07: "Trusted publishing is live and being used in production". 2025-09: configurations can be managed with API tokens. 2025-11: GitLab beta, an enforcement flag, and IaC for Rust Project crates; "Walter has implemented crate and log analytics within DataDog. He is looking for anomalies across the top 500 crates" (a crate task from an IP address not normally used for it). 2026-04: Adam scanned the repositories of "the top 5000 crates (as measured by downloads in the last 90 days)" for the compromised Trivy action and found one that used the compromised action, pinned to specific commits. 2026-08: publish-time malware scanning and quarantine after arrayref, and two docs.rs crates moved to trusted publishing.
  Not measured: no adoption counts. No publisher or owner statistics per crate or per project.

- **Security Initiative Report, February 2024** — Rust Foundation; Joel Marcey, Walter Pearce, Adam Harvey, Tobias Bieniek, Jan David Nose
  <https://rustfoundation.org/wp-content/uploads/2024/06/security-initiative-report-february-2024.pdf>
  2024 · Q4 · adjacent
  Measured: Threat models, Typomania ("capable of finding crates that may be trying to pretend to be another"), and Sandpit ("has already found several malicious crates"). Painter "creates a complete call graph across the entire crates ecosystem"; "At the time of this report, Painter covers over 85% of the crate ecosystem." Funding: "$1.42M in total financial contributions to date".
  Not measured: no statistics on publishers, owners or tokens, and none per project.

- **Rust Foundation Technology Report 2025** — Rust Foundation
  <https://rustfoundation.org/wp-content/uploads/2025/08/technology-report-2025.pdf> (press page <https://rustfoundation.org/media/rust-foundations-2025-technology-report-showcases-year-of-rust-security-advancements-ecosystem-resilience-strategic-partnerships/>)
  2025 (2025-08-05) · Q4 · adjacent
  Measured: "Trusted Publishing fully launched." "In 2024, crates.io delivered 50.2 billion downloads, and in just the first six months of 2025, there have already been 47 billion downloads". "recover over 500 reserved package names". "Crate provenance tracking continued with repo verification now being run across the entirety of the crates.io corpus". Walter Pearce's talk "Dude Where's My C?" used Painter data on "externally-linked code across the crates ecosystem". A build.rs usage study was initiated.
  Not measured: no trusted-publishing adoption number, and no publisher or owner statistics.

- **Rust Foundation 2025 Year in Review** — Rust Foundation
  <https://rustfoundation.org/2025/>
  2025 · Q4 · adjacent
  Measured: "Assisted the crates.io team in responding to 18 different malicious or suspicious crate files in the ecosystem". "Delivered Trusted Publishing for GitHub Actions and GitLab CI".
  Not measured: no adoption or publisher figures.

- **Infrastructure Team 2025 Q4 Recap and Q1 2026 Plan** — Inside Rust Blog; Rust Infrastructure Team
  <https://blog.rust-lang.org/inside-rust/2026/01/13/infrastructure-team-q4-2025-recap-and-q1-2026-plan/>
  2026 · Q4 · adjacent
  Measured: "All crates owned by the Rust Project that use crates.io trusted publishing now configure it as IaC via the `team` repo."
  Not measured: no count of Rust Project crates on trusted publishing.

- **Infrastructure Team 2026 Q2 Recap and Q3 Plan** — Inside Rust Blog; Rust Infrastructure Team
  <https://blog.rust-lang.org/inside-rust/2026/07/15/infrastructure-team-q2-recap-and-q3-plan/>
  2026 · Q4 · no
  Measured: only a Datadog Code Security experiment with crates.io.
  Not measured: nothing on publishers or trusted publishing.

- **Supply chain attack on arrayref** — Rust Blog; Rust Security Response WG and crates.io team
  <https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/>
  2026 (2026-08-20) · Q4 · adjacent
  Measured: "On 2026-08-20 at 7:15 UTC we got a report that the `proc-macro1` crate was malicious". It "had a build script that was downloading a malicious payload". Six crates were deleted (proc-macro1, proc-macro-en, aovine, arone, aronenao, tinymember). Three legitimate crates had malicious versions: append-only-vec 0.1.9 (107 min), arrayref 0.3.10 (86 min) and internment 0.8.7 (90 min). "their computer or credentials are likely compromised".
  Not measured: it does not say whether the versions were token-published or trusted-published, or what `published_by` showed. No count of downstream projects.

- **Be alert: targeted attacks on prominent Rustaceans** — Rust Blog; Rust Project
  <https://blog.rust-lang.org/2026/09/17/targeted-attacks/>
  2026 (2026-09-17) · Q4 · adjacent
  Measured: targets are "rust-lang members and owners of popular crates". Goal: "attempting to compromise devices and accounts in order to use them to publish malware". Vector: fake job or contract video calls.
  Not measured: no victim counts.

- **crates.io phishing campaign** — Rust Blog; Rust Security Response WG and crates.io team
  <https://blog.rust-lang.org/2025/09/12/crates-io-phishing-campaign/>
  2025 (2025-09-12) · Q4 · adjacent
  Measured: phishing "targeting crates.io users (from the `rustfoundation.dev` domain name)". "We have no evidence of a compromise of the crates.io infrastructure".
  Not measured: no counts.

- **crates.io: an update to the malicious crate notification policy** — Rust Blog; crates.io team
  <https://blog.rust-lang.org/2026/02/13/crates.io-malicious-crate-update/>
  2026 (2026-02-13) · Q4 · adjacent
  Measured: blog posts are now reserved for crates with "real usage or exploitation". The post lists five malicious crates removed since the previous such post.
  Not measured: nothing on publishers of legitimate crates.

- **GitHub Actions leaking secrets when Miri output is cached** — Rust Blog; Rust Project
  <https://blog.rust-lang.org/2026/09/21/github-actions-leaking-secrets-when-miri-output-is-cached/>
  2026 (2026-09-21) · Q4 · adjacent
  Measured: "Miri stores all environment variables to `target/`". The scan found "1 repository with this issue and 7 repositories that do not appear to be vulnerable".
  Not measured: it does not say whether crates.io tokens were exposed. No publisher data.

- **2025 State of Rust Survey Results** — Rust Blog; Rust Survey Team
  <https://blog.rust-lang.org/2026/03/02/2025-State-Of-Rust-Survey-results/>
  2026 · Q3, Q4 · no
  Measured: nothing in the text on dependencies or the supply chain. Results shown only in charts were not read.
  Not measured: no dependency-count or trust questions in the text.

- **What we heard about Rust's challenges** — Rust Blog; Vision Doc team
  <https://blog.rust-lang.org/2026/03/20/rust-challenges/>
  2026 · Q4 · no
  Measured: about 70 interviews. Users need to know "which crates can they trust".
  Not measured: no numbers on dependencies or publishers.

- **crates.io Postmortem: User Uploaded Malware** — Inside Rust Blog; Adam Harvey for the crates.io team
  <https://blog.rust-lang.org/inside-rust/2023/09/01/crates-io-malware-postmortem/>
  2023 · Q4 · adjacent
  Measured: 9 typosquatting crates from one user were removed on 2023-08-18 and 1 account was locked. "We have no evidence that any of these crates were downloaded by an actual user" (per user-agent analysis of download logs).
  Not measured: nothing on publishers or owners of legitimate crates, and no dependency graphs.

- **Q3 2023 Evolution of Software Supply Chain Security Report** — Phylum (now Veracode); Phylum Research Team
  <https://blog.phylum.io/q3-2023-evolution-of-software-supply-chain-security-report/> (read through the Wayback snapshot of 2026-02-08; the live host has a TLS error)
  2023 · Q4 · adjacent
  Measured: "Phylum analyzed 203M files across 3M total packages" across seven ecosystems including Crates.io. "On August 16, Phylum identified nine crates intending to typosquat several popular Rust packages." Those crates were yanked and the account locked.
  Not measured: no crates.io-specific volume. No publishers or owners of legitimate crates. No dependency graphs.

- **Rust Malware Staged on Crates.io** — Veracode (formerly Phylum); Veracode Threat Research
  <https://www.veracode.com/blog/rust-malware-staged-on-crates-io/>
  2023 (2023-08-24) · Q4 · adjacent
  Measured: 7 packages from user `amaperf`, which used `build.rs` exfiltration through Telegram.
  Not measured: no ecosystem statistics.

- **Two Malicious Rust Crates Impersonate Popular Logger to Steal Wallet Keys** — Socket; Socket Threat Research Team (Kush Pandya)
  <https://socket.dev/blog/two-malicious-rust-crates-impersonate-popular-logger-to-steal-wallet-keys>
  2025 · Q4 · adjacent
  Measured: `faster_log` and `async_println`, published by `rustguruman` and `dumbnbased` on 2025-05-25, had 8,424 downloads combined. "The crates had no downstream dependents on crates.io".
  Not measured: nothing on legitimate publishers or dependency graphs.

- **Crates.io Implements Trusted Publishing Support** — Socket; Sarah Gooding
  <https://socket.dev/blog/crates-launches-trusted-publishing>
  2025 (2025-07-16) · Q4 · adjacent
  Measured: more than 189,000 crates and over 151 billion downloads; PyPI has over 16,000 projects on trusted publishing, and 86 of the top 360 most-downloaded PyPI packages were uploaded with attestations.
  Not measured: no crates.io adoption figure.

- **Rust Crates arrayref & append-only-vec Compromised** — Semgrep; Diptendu Kar
  <https://semgrep.dev/blog/2026/rust-crates-arrayref-append-only-vec-compromised-proc-macro1/>
  2026 (2026-08-20) · Q4 · adjacent
  Measured: arrayref "244M downloads", append-only-vec "4M downloads". `proc-macro-en` was published under a spoofed "daveroundy" name. Any build of a dependent "triggers the infection".
  Not measured: token versus trusted publishing. No graph reach.

- **Rust Supply Chain Attack on arrayref: Significant Overlap with DPRK Campaigns** — Wiz; Rami McCarthy, Benjamin Read
  <https://www.wiz.io/blog/rust-supply-chain-attack-on-arrayref-significant-overlap-with-dprk-campaigns>
  2026 (2026-08-20) · Q4 · adjacent
  Measured: arrayref "can be found in over 35% of all environments" and is "used in ¾ of all environments where Rust is present". This is Wiz telemetry with no disclosed denominator.
  Not measured: publishing mechanism. No per-project graph statistics.

- **Rust Supply-Chain Attack: arrayref, internment, and append-only-vec Poisoned…** — StepSecurity; Sai Likhith
  <https://www.stepsecurity.io/blog/arrayref-rust-crate-supply-chain-attack>
  2026 (2026-08-20) · Q4 · adjacent
  Measured: arrayref has 245M all-time and 53.7M 90-day downloads, and 406 dependent crate versions. Exposure was 86–107 min.
  Not measured: publishing mechanism. Transitive reach.

- **2026 State of the Software Supply Chain Report** — Sonatype
  <https://www.sonatype.com/state-of-the-software-supply-chain/introduction>
  2026 · Q4 · no
  Measured: 9.8 trillion downloads "across Maven Central, PyPI, npm and NuGet".
  Not measured: crates.io is not covered.

- **State of the Software Supply Chain 2024 (10th annual)** — Sonatype
  <https://www.sonatype.com/hubfs/SSCR-2024/SSCR_2024-FINAL-10-10-24.pdf>
  2024 · Q3, Q4 · no
  Measured: the full text never mentions the Rust ecosystem: the only matches for crates, rust or cargo are the words "rusty", "rust over time" and "trust".
  Not measured: nothing on the Rust ecosystem.

- **ReversingLabs 2026 Software Supply Chain Security Report (press release)** — ReversingLabs
  <https://www.reversinglabs.com/press-releases/reversinglabs-2026-software-supply-chain-security-report-identifies-73-increase-in-malicious-open-source-packages>
  2026 · Q4 · no
  Measured: open-source malware detections rose 73%, and npm accounts for "nearly 90%".
  Not measured: crates.io is not mentioned in the release. The full report is gated.

- **Rust progress: New threat modeling, tools bolster programming language** — ReversingLabs blog; John P. Mello Jr.
  <https://www.reversinglabs.com/blog/rust-programming-language-progress-report-supply-chain-security>
  2023 (2023-08-01) · Q4 · adjacent
  Measured: relays the first RF Security Initiative report. "The team has not identified any actively malicious crates thus far", while leaked credentials were found and owners contacted.
  Not measured: no numbers.

- **Software Supply Chain State of the Union (landing pages)** — JFrog
  <https://jfrog.com/software-supply-chain-state-of-union-old/> ; <https://jfrog.com/artifact-state-of-union/> (the live pages return an empty body; Wayback captures of 2026-06-11 and 2023-02-07 read)
  2023–2026 · Q4 · adjacent
  Measured: the 2023 report's page, as captured on 2023-02-07, says "The number of Rust (Cargo) repositories has increased 30 percent from January 2022 to October 2022", counting repositories in JFrog's own platform, and ranks Rust (Cargo) 27th by repositories. The capture of the newer page has no mention of Rust. The 2025 report PDF returned HTTP 403.
  Not measured: repositories in one vendor's platform, not crates, publishers or projects.

- **State of Dependency Management 2022** — Endor Labs; Henrik Plate
  <https://www.endorlabs.com/learn/state-of-dependency-management>
  2022 · Q3 · no
  Measured: "Of 254 Maven packages analyzed, there was an average of 14 dependencies per package", and "95% of the vulnerable dependencies are transitive".
  Not measured: Java/Maven only, with no Rust.

- **Dependency Management Report 2024** — Endor Labs
  <https://www.endorlabs.com/lp/dependency-management-report>
  2024 · Q3 · no
  Measured: phantom dependencies and breaking changes across npm, Maven, PyPI, Go, RubyGems and NuGet.
  Not measured: Cargo is not among the analysed ecosystems.

- **Introduction to Chainguard Libraries** — Chainguard Academy; Chainguard
  <https://edu.chainguard.dev/chainguard/libraries/introduction/>
  2026 · Q4 · no
  Measured: supports Java, JavaScript and Python.
  Not measured: no Rust or crates.io offering, and no Rust data.

- **Open sourcing our Rust crate audits** — Google Open Source Blog; David Koloski, George Burgess
  <https://opensource.googleblog.com/2023/05/open-sourcing-our-rust-crate-audits.html>
  2023 (2023-05-23) · Q4 · adjacent
  Measured: ChromeOS and Fuchsia publish cargo-vet audits. No totals given. Google's current `audits.toml` had 2,197 audit entries and no `trusted` entries on 2026-09-25.
  Not measured: no dependency or publisher statistics for any project.

- **New Guide for Package Repositories to Adopt Trusted Publishers** — OpenSSF blog; Securing Software Repositories WG
  <https://openssf.org/blog/2024/08/05/new-guide-for-package-repositories-to-adopt-trusted-publishers/>
  2024 (2024-08-05) · Q4 · adjacent
  Measured: trusted publishers "allow binding verifiable metadata like the source repository URL to a published artifact". PyPI has "over 14,000 projects".
  Not measured: nothing on crates.io.

- **GitHub brings supply chain security features to the Rust community** — The GitHub Blog; Courtney Claessens
  <https://github.blog/2022-06-06-github-brings-supply-chain-security-features-to-the-rust-community/>
  2022 (2022-06-06) · Q3, Q4 · adjacent
  Measured: "over 400 existing Rust vulnerabilities" published. The dependency graph reads `Cargo.toml` and `Cargo.lock`.
  Not measured: no dependency-count statistics across repositories. No publisher data.

- **supply_chain** — Trail of Bits; Samuel Moelius
  <https://github.com/trailofbits/supply_chain>
  2026 (created 2026-08-05) · Q2 · adjacent
  Measured: "a test helper for snapshotting the output of `cargo-supply-chain`" so that changes in publishers become visible in code review. It notes Cargo issue #10801 false positives.
  Not measured: no counts.

- **Rust Engineering Practices — ch. 6 Dependency Management and Supply Chain Security** — Microsoft (RustTraining)
  <https://microsoft.github.io/RustTraining/engineering-book/ch06-dependency-management-and-supply-chain-s.html>
  undated · Q4 · no
  Measured: guidance on cargo-audit, cargo-deny and cargo-vet.
  Not measured: no numbers.

### Searches run

- `web search :: crates.io trusted publishing adoption statistics percentage of crates`
- `web search :: Rust Foundation Security Initiative report crates.io`
- `web search :: blog.rust-lang.org crates.io development update trusted publishing 2026`
- `web search :: Google open sourcing Rust crate audits cargo vet security blog`
- `web search :: Sonatype State of the Software Supply Chain crates.io Rust 2025`
- `web search :: Endor Labs State of Dependency Management transitive dependencies Rust Cargo`
- `web search :: Socket.dev crates.io Rust malicious crates report 2025`
- `web search :: Phylum Rust crates.io supply chain ecosystem analysis`
- `web search :: ReversingLabs software supply chain security report 2026 crates.io`
- `web search :: JFrog Software Supply Chain State of the Union Cargo Rust packages`
- `web search :: Mozilla Firefox cargo vet audits number of crates third-party Rust dependencies statistics`
- `web search :: OpenSSF trusted publishers crates.io blog adoption`
- `web search :: arrayref proc-macro1 crates.io compromise 2026 Rust blog`
- `web search :: crates.io phishing campaign rustfoundation.dev 2025 blog`
- `web search :: "published_by" crates.io versions trusted publishing trustpub_data API`
- `web search :: "trusted publishing" crates.io "crates" configured number 2026 adoption dashboard`
- `web search :: deps.dev Open Source Insights blog Cargo dependencies transitive per package statistics`
- `web search :: Checkmarx OR Chainguard crates.io Rust supply chain research dependencies`
- `web search :: Tidelift OR Snyk report Rust crates dependencies maintainers`
- `web search :: Rust Foundation annual report 2025 trusted publishing crates.io number of crates configured security initiative`
- `web search :: Rust Foundation "Crates Ecosystem Threat Model" github`
- `web search :: Sonatype 2026 state of software supply chain "crates.io" OR "Cargo" downloads growth malicious`
- `web search :: Phylum "Evolution of Software Supply Chain Security" report 2023 crates.io packages published`
- `web search :: Chainguard Rust crates rebuilt from source OR "Chainguard Libraries" Rust cargo`
- `web search :: crates.io trusted publishing "crates" adoption 2026 number Tobias Bieniek talk RustConf`
- `web search :: "Cargo.lock" "trusted publishing" percentage of dependencies published via trusted publishing`
- `web search :: crates.io top crates trusted publishing share "top 100" OR "top 1000" crates published with trusted publishing`


## community-and-press

46 sources.

- **Maybe We Can Have Nice Things** — noncombatant.org (personal blog); Chris Palmer
  <https://noncombatant.org/2021/02/16/maybe-we-can-have-nice-things/>
  2021 · Q2 · partial
  Measured: one run of `cargo supply-chain publishers` on cargo-supply-chain itself: "Fetching data for "xattr" (78/79)" (79 crates), 57 individuals and 9 GitHub teams. Author: "that's a lot of dependencies by a lot of publishers whom I don't know." He adds that many are "well-established members of the Rust development team".
  Not measured: n=1 (a tool's own graph). Owners, not `published_by`. No direct/transitive split. No share not named by the manifest.

- **Cargo-Ecosystem-Monitor — OtherTools.md** — ZJU-SEC (Zhejiang University security group; GitHub org also "Rust-Hell")
  <https://github.com/ZJU-SEC/Cargo-Ecosystem-Monitor/blob/HEAD/OtherTools.md>
  2022–2025 · Q2 · adjacent
  Measured: tool-evaluation notes pasting partial `cargo supply-chain publishers` output for one project (kdy1's swc crates, denoland engineering team), "This shows members that can influence this project by dependencies as individuals or team members." No totals.
  Not measured: no counts, no sample. These are research-group notes, not a result.

- **Aren't there any efforts to bring Rust's dependency number down?** — users.rust-lang.org thread; bjorn3, BurntSushi and others
  <https://users.rust-lang.org/t/arent-there-any-efforts-to-bring-rusts-dependency-number-down/57898>
  2021 · Q1, Q2, Q3 · adjacent
  Measured: bjorn3 lists the 9 crates in `Cargo.lock` for a project depending only on `rand`: cfg-if, getrandom, libc, ppv-lite86, rand, rand_chacha, rand_core, rand_hc and wasi. He attributes their maintainers by hand: getrandom and the rand crates to the rust-random team, libc to the Rust project, cfg-if to alexcrichton, ppv-lite86 to kazcw, and wasi to alexcrichton and sunfishcode. BurntSushi: "ripgrep is not simple and it has fewer than 100 dependencies."
  Not measured: one toy project, attributed by hand. Maintainers, not `published_by`. No sample.

- **Rust has a HUGE supply chain security problem** — kerkour.com; Sylvain Kerkour
  <https://kerkour.com/rust-supply-chain-security-standard-library>
  2024 (2024-07-02) · Q2, Q3, Q4 · adjacent
  Measured: Counts come from linked lockfiles: "cargo imports over 400 crates", "crates.io has over 500 transitive dependencies", and "libsignal … uses 500 third-party packages". Asserts "Rust developers need to import 300+ packages from 200+ authors to call or run an HTTP server or hash a buffer." No method or data is given for the author count.
  Not measured: the "200+ authors" is unsourced. It does not say whether that means owners or publishers. No sample.

- **Supply chain nightmare: How Rust will be attacked…** and **Fixing Rust's supply chain security: The good, the bad and the ugly** — kerkour.com; Sylvain Kerkour
  <https://kerkour.com/rust-supply-chain-nightmare> ; <https://kerkour.com/fixing-rust-supply-chain-security>
  2026 (2026-04-08; 2026-08-26) · Q4, Q2 · adjacent
  Measured: No new data. Cites Adam Harvey's "999 most popular crates … around 17%" mismatch. "an anemic standard library leads to the explosion of transitive dependencies and of the package authors you need to trust". "Secure by Design means reducing … the number of people who can commit code in your own codebase (via your dependencies)". Says the arrayref incident's "9 backdoored packages were removed" within "~110 minutes". Recommends CI-only publishing: "Another way to keep tokens out of your machine is to only release and publish new versions of your packages from CI pipelines".
  Not measured: no count of people, publishers or owners for any project.

- **Dealing with Dependencies in Rust** — Tweede golf; Marc (Marc Schoolderman)
  <https://tweedegolf.nl/en/blog/104/dealing-with-dependencies-in-rust/>
  2023 (2023-10-30) · Q3 · partial
  Measured: a 300-line experimental tool had 6 direct and "141 dependencies" via `cargo tree`. sudo-rs has only 4 dependencies. It notes that Debian packages more than 2000 crates.
  Not measured: n=1 plus one named project. No sample. No owners or publishers.

- **How to deal with Rust dependencies** — notgull.net; John Nunley
  <https://notgull.net/rust-dependencies/>
  2025 (2025-06-01) · Q3 · partial
  Measured: `cargo tree -e no-dev --prefix none | … | sort -u | wc -l` gives ripgrep 33 and miniserve (with `--no-default-features`) "two hundred and eighty one", duplicates included.
  Not measured: two named projects. Total only, no direct count reported. No owners.

- **Build It Yourself** — lucumr.pocoo.org; Armin Ronacher
  <https://lucumr.pocoo.org/2025/1/24/build-it-yourself/>
  2025 (2025-01-24) · Q3 · partial
  Measured: "A brand new Tokio project drags in 28 crates", "a new Rocket project balloons that to 172", MiniJinja "can exist with just a single dependency" while "its CLI variant slurps up 142", and the new sha1 crate brings "10 dependencies".
  Not measured: templates and single crates, not a sample. Totals only. No owners or publishers.

- **Build It Yourself (HN discussion)** — Hacker News; various
  <https://news.ycombinator.com/item?id=42812641>
  2025 · Q3 · adjacent
  Measured: palata: "In C++ I had 8 dependencies. In Rust, 186." the_mitsuhiko: "sha1-smol … only has 40 dependents vs. >600 for sha1".
  Not measured: one anecdote. No owners or publishers.

- **Improving my Rust projects' supply chain security** — Ortham's Software Notes; Ortham (Oliver Hamlet)
  <https://blog.ortham.net/posts/2025-10-02-rust-supply-chain-security/>
  2025 (2025-10-02, updated 2026-04-03) · Q3, Q4 · partial
  Measured: esplugin: "5k significant lines", 7 direct and 76 total dependencies; cargo vet reports 57 of them fully audited and 19 exempted. 206 imported audits (Google 153, Mozilla 22, Bytecode Alliance 21, ISRG 10). Three crate/publisher trust entries: libc (rust-lang-owner), and windows-link and windows-sys (kennykerr).
  Not measured: n=1. No publisher or owner count across the graph (only three trust entries). No sample.

- **Managing Rust Dependencies for Supply Chain Security** — marvin.damschen.net; Marvin Damschen
  <https://marvin.damschen.net/post/managing-dependencies-in-rust/>
  2025 (2025-08-06) · Q3 · adjacent
  Measured: simple-ssg-rs went from 35 dependencies plus 7 dev dependencies to 26 plus 5 after pruning. clap_derive accounts for 6.
  Not measured: n=1. No owners or publishers.

- **Rust Dependencies Scare Me** — vincents.dev; Vincent (vsgherzi)
  <https://vincents.dev/blog/rust-dependencies-scare-me/>
  2025 · Q3 · adjacent
  Measured: a web service with 9 declared dependencies (axum, reqwest, ripunzip, serde, serde_json, tokio, tower-http, tracing, tracing-subscriber). Vendored, it is 3.6M lines of Rust by tokei, against ~1,000 lines of the author's own code.
  Not measured: no resolved crate count, no owners or publishers, n=1.

- **Rust Dependencies Scare Me (HN discussion)** — Hacker News; various
  <https://news.ycombinator.com/item?id=43930640>
  2025 · Q3 · no
  Measured: no comment gives concrete dependency counts or publisher counts. vsgherzi: "a single crate like Tokio is spread among 20-30 crates".
  Not measured: no data.

- **Rust's dependencies are starting to worry me (HN discussion)** — Hacker News; various
  <https://news.ycombinator.com/item?id=43935067>
  2025 (2025-05-09; 424 points, 570 comments) · Q3 · no
  Measured: only "several hundred crates brought in by just the rust lang repo" (galangalalgol).
  Not measured: no project-level data, no publishers.

- **Let's Be Real About Dependencies** — wiki.alopex.li; icefox (Simon Heath)
  <https://wiki.alopex.li/LetsBeRealAboutDependencies> (read through the Wayback snapshot of 2026-06-29; the live site sits behind an anti-bot wall)
  ~2020 · Q3 · adjacent
  Measured: counts *C/C++* programs' system-library and apt dependencies (rviz: "133 libs"; vlc, lighttpd, debfoster at ~40 libraries) to argue that Rust's "300 crates" complaint is not unique. The archived copy is truncated before the conclusions.
  Not measured: no Rust `Cargo.lock` counts in the captured text. No owners.

- **Vetting the cargo** — LWN.net; Jonathan Corbet
  <https://lwn.net/Articles/897435/>
  2022 (2022-06-10) · Q3, Q4 · adjacent
  Measured: Firefox depends on "almost four hundred third-party crates". It notes "there is no way to independently verify that an audit was performed faithfully and adequately".
  Not measured: one project. No direct/resolved split. No publishers.

- **Rust Supply Chain Security — Managing crates.io Risk in an Enterprise Codebase** — SoftwareSeni; James A. Wondrasek
  <https://www.softwareseni.com/rust-supply-chain-security-managing-crates-io-risk-in-an-enterprise-codebase/>
  2026 (2026-04-29) · Q3, Q4 · adjacent
  Measured: second-hand only. ClickHouse has "almost 700" Rust dependencies against "156 dependent C++ libraries", attributed to Alexey Milovidov without a link. It gives "roughly 160,000 crates".
  Not measured: no original data. No trusted-publishing figure.

- **Why 90% of Rust Crates Have Supply Chain Risks—and How to Avoid Them** — Markaicode; "Mark"
  <https://markaicode.com/rust-crate-supply-chain-security/>
  2025 (2025-03-18) · Q2, Q3 · no (unsourced)
  Measured: asserts "62% of popular crates have only one maintainer", "The average Rust web application has 120+ total dependencies" and "73% of these are transitive", *with no sources*.
  Not measured: no method, no sample, no denominators.

- **State of the Rust/Cargo crates ecosystem (lib.rs/stats)** — lib.rs; Kornel Lesiński
  <https://lib.rs/stats> (read through the Wayback snapshot of 2026-05-07; the live page returns a Cloudflare challenge)
  2026 · Q3, Q4 · adjacent
  Measured: "There are 63,833 users or teams that have a crate on crates.io. The number of owners is growing at a rate of 1.3× per year." "Lib.rs has indexed 263778 crates." Histogram "Number of direct dependencies": "Number of libraries explicitly used by each crate. Includes dev, build-time and optional dependencies." The zero bin has 35,746 crates, the one bin 19,988, and so on. Also "Number of transitive reverse dependencies (popularity)" and "Number of crates per user" ("How many crates a single account (user or team) owns").
  Not measured: per-crate, over crates.io libraries, not over GitHub applications. Direct only, with no resolved/transitive count per crate. No owners behind a graph. No `published_by`.

- **The state of the Rust dependency ecosystem** — 00f.net; Frank Denis
  <https://00f.net/2025/10/17/state-of-the-rust-ecosystem/>
  2025 (2025-10-17) · Q3, Q4 · adjacent
  Measured: "200,650 crates from crates.io as of October 2025", through "the crates.io API". "45.2%" had no update in 2+ years and "41.5%" are one-shot crates. "3,663 developers" were analysed for activity patterns, and kdy1 has "36,043 versions across 111 crates". Dependency analysis of "the 1,000 most downloaded crates" found "249 abandoned dependencies".
  Not measured: no GitHub projects, no `Cargo.lock`, no per-project direct/resolved medians, no owners or publishers behind any graph, no trusted publishing.

- **How Safe is the Rust Ecosystem? A Deep Dive into crates.io** — mr-leshiy blog; Alex Pozhylenkov
  <https://mr-leshiy-blog.web.app/blog/crates_io_analysis/>
  2026 (2026-01-07, updated 2026-01-18) · Q3 · adjacent
  Measured: 196,923 crates (crates.io-index snapshot of 2026-01-15), run through cargo-deny advisories. Libraries were freshly resolved and binaries locked ("equivalent to `cargo install <crate> --locked`"). 32.485% of crates (66,991 of 196,923) failed on vulnerability or unsound advisories. Spearman correlation of dependency count with vulnerability risk is 0.6073. `direct_deps` and `all_deps` columns exist.
  Not measured: no distribution of direct or all dependencies is reported. crates.io packages, not GitHub repositories. No owners, publishers or trusted publishing.

- **A look at cargo-vet in 2026** — Light Squares
  <https://www.lightsquares.dev/blog/cargo-vet-in-2026>
  2026 (2026-08-12) · Q3, Q4 · adjacent
  Measured: Method: "We scraped GitHub for repositories that contain a `supply-chain/` directory … In total we found 408 repositories". They "cloned the 150 most-starred projects for their full `Cargo.lock` history". Findings: "median project carries 131 exemptions", and "median weekly audit workload is 8.7k changed lines". "9 big registries whose 7k audits cover 1.9k crates" give audit coverage of 100% of the top 100 crates, 90% of the top 500 and 71% of the top 1000. "median lag between a crates.io release and its audit is 29 days".
  Not measured: a population selected on cargo-vet adoption, not a random sample. It reports no per-project dependency counts (direct or resolved), no owners or publishers, and no use of cargo-vet's `trusted` entries. It is the only study found in these modalities that reads many GitHub projects' `Cargo.lock` files.

- **Hackers poison popular Rust crates to steal developers' credentials** — The Register; Carly Page
  <https://www.theregister.com/security/2026/08/21/hackers-poison-popular-rust-crates-to-steal-developers-credentials/5291075>
  2026 (2026-08-21) · Q4 · adjacent
  Measured: relays the Rust team and Aikido figures (arrayref ~245M lifetime downloads, append-only-vec >4M).
  Not measured: how many downloaded the bad versions. No publisher data.

- **Supply chain attack on arrayref (Rust blog)** — LWN.net; LWN staff and readers
  <https://lwn.net/Articles/1089720/>
  2026 · Q4 · no
  Measured: relay of the Rust blog.
  Not measured: none.

- **crates.io trusted publishing with Tobias Bieniek** — Open Source Security podcast; Josh Bressers, Tobias Bieniek
  <https://opensourcesecurity.io/2025/2025-08-cratesio-trusted-publishing-tobias/>
  2025 · Q4 · no
  Measured: "we've been basically doubling our traffic every year".
  Not measured: no adoption numbers in the transcript.

- **Rust package registry adds security tools and metrics to crates.io** — Help Net Security
  <https://www.helpnetsecurity.com/2026/01/21/rust-crates-io-security-update/>
  2026 (2026-01-21) · Q4 · no
  Measured: relays the Jan 2026 dev update (Security tab, GitLab trusted publishing, and a crate index that now records when each version was published).
  Not measured: no adoption numbers.

- **Who authors the most popular crates on crates.io?** — steveklabnik.com; Steve Klabnik
  <https://steveklabnik.com/writing/who-authors-the-most-popular-crates-on-crates-io> (read through the Wayback snapshot of 2022-11-07)
  2018 (2018-10-04) · Q4, Q2 · adjacent
  Measured: 264 crates over "the 100k download mark". He took the first owner from `/api/v1/crates/{name}/owners`: `json["users"][0]["login"]`. Results: alexcrichton 61, carllerche 20, SimonSapin 16, BurntSushi 13, …
  Not measured: first owner only, not all owners or publishers. The top crates of 2018, not any project's graph.

- **Rust: Does the published crate match the upstream source?** — codeandbitters.com; Eric Seppanen
  <https://codeandbitters.com/published-crate-analysis/>
  2021 (2021-10-03) · Q4 · adjacent
  Measured: "the most popular 500 crates, ranked by number of downloads". 319/500 (64%) were a "gold star" match, 53/500 lacked `.cargo_vcs_info.json`, and 5/500 had files absent upstream.
  Not measured: nothing on publishers, owners or project graphs.

- **999 crates of Rust on the wall** — lawngno.me; Adam Harvey (Rust Foundation)
  <https://lawngno.me/blog/2024/06/10/divine-provenance.html>
  2024 (2024-06-10) · Q4 · adjacent
  Measured: the top 999 crates by 90-day downloads. 826 matched upstream exactly, 74 had revisions not found, and 73 lacked VCS info. Across the 33,085 versions those crates published, only 8 did not match upstream, and none of them was malicious.
  Not measured: publisher identity, ownership verification and trusted publishing are not examined. No project graphs.

- **Package Management at FOSDEM 2026** — nesbitt.io; Andrew Nesbitt
  <https://nesbitt.io/2026/02/04/package-management-at-fosdem-2026.html>
  2026 · Q4 · adjacent
  Measured: summarises Adam Harvey's "A phishy case study" (crates.io phishing, where TOTP was bypassed) and Zach Steindler on attestations.
  Not measured: no Rust publisher or owner numbers.

- **FOSDEM 2026 — Adam Harvey (speaker page)** — FOSDEM
  <https://archive.fosdem.org/2026/schedule/speaker/adam_harvey/>
  2026 · Q4 · no
  Measured: talks "A phishy case study" (Package Management) and "Using Capslock analysis to develop seccomp filters for Rust" (Security). No abstracts.
  Not measured: none.

- **Crate security in 2025 (Rust Forge 2025)** — pretalx / Rust Forge; Adam Harvey
  <https://pretalx.com/rust-forge-2025/talk/BBBS8G/>
  2025 (2025-08-30) · Q4 · no
  Measured: an abstract only, on tools for understanding dependencies "from security and sustainability perspectives".
  Not measured: no data in the abstract.

- **Why npm Dependency Trees Are So Big** — nesbitt.io; Andrew Nesbitt
  <https://nesbitt.io/2026/07/28/why-npm-dependency-trees-are-so-big.html>
  2026 (2026-07-28) · Q2, Q3 · adjacent
  Measured: npm: "trusting 79 other packages and 39 maintainers" (Zimmermann et al. 2019). Rust anecdotes: the Tweede golf demo "came to 141 crates", and Ronacher's Rocket project "172 crates".
  Not measured: no Rust maintainers or publishers per tree.

- **What's new in git-pkgs** — nesbitt.io; Andrew Nesbitt
  <https://nesbitt.io/2026/09/08/whats-new-in-git-pkgs.html>
  2026 (2026-09-08) · Q2, Q4 · adjacent
  Measured: `git pkgs maintainers` "reports maintainer counts and names". `git pkgs provenance` reports "trusted-publishing status for npm, PyPI, and RubyGems".
  Not measured: the provenance report does not list Cargo. No published per-project counts.

- **A GitHub for maintainers** — nesbitt.io; Andrew Nesbitt
  <https://nesbitt.io/2026/05/02/a-github-for-maintainers.html>
  2026 · Q4 · no
  Measured / Not measured: no quantitative content on Cargo.

- **crates.io: Trusted Publishing (linkblog)** — simonwillison.net; Simon Willison
  <https://simonwillison.net/2025/Jul/12/cratesio-trusted-publishing/>
  2025 (2025-07-12) · Q4 · no
  Measured: notes crates.io requires a manual first publish, unlike PyPI's pending publishers.
  Not measured: no data.

- **Yet another npm supply-chain attack. Is Cargo any safer?** — users.rust-lang.org; various
  <https://users.rust-lang.org/t/yet-another-npm-supply-chain-attack-is-cargo-any-safer/133766>
  2025 (2025-09-09) · Q4 · no
  Measured: qualitative only. cargo-vet uptake is "low" and cargo-crev adoption "somewhat disappointing", with no figures.
  Not measured: no counts.

- **About supply-chain attacks** — internals.rust-lang.org; kornel, PoignardAzur, bjorn3 and others
  <https://internals.rust-lang.org/t/about-supply-chain-attacks/14038>
  2021 (2021-02-12) · Q4 · no
  Measured: kornel on "~/.cargo/credentials sits unprotected in plain text" and credential-driven ecosystem infection.
  Not measured: no dependency or publisher counts.

- **Separating fetching from building for better security** — internals.rust-lang.org; grothesque and others
  <https://internals.rust-lang.org/t/separating-fetching-from-building-for-better-security/24390>
  2026 (2026-06-11) · Q4 · adjacent
  Measured: proposes `cargo fetch` with network access and a networkless `cargo build --locked` sandbox, plus a `--fetch-only` flag. This concerns the trust surface of a cargo build.
  Not measured: no prevalence statistics.

- **Easily inspect dependencies** — internals.rust-lang.org; Rudxain, kornel, bjorn3, epage
  <https://internals.rust-lang.org/t/easily-inspect-dependencies/24200>
  2026 (2026-04-25) · Q4 · no
  Measured / Not measured: ergonomics of reading cached crate sources. No numbers.

- **How safe is crates.io?** — users.rust-lang.org; jbe, 2e71828, kornel and others
  <https://users.rust-lang.org/t/how-safe-is-crates-io/91290>
  2023 · Q4 · no
  Measured: jbe: the only way to be safe is to audit and pin every dependency, or to rely only on code from owners one trusts.
  Not measured: no counts.

- **cargo-dephell** — GitHub; David Wong (mimoo)
  <https://github.com/mimoo/cargo-dephell>
  ~2020 · Q3 · no
  Measured: an HTML report per dependency (guppy transitive deps, geiger unsafe, LOC), "heavily biased towards the libra codebase".
  Not measured: no published results, no owners.

- **Rust-Hell (GitHub organisation)** — ZJU research tooling
  <https://github.com/Rust-Hell>
  2024–2025 · Q3 · no
  Measured: repositories for ecosystem-scale dependency resolution and RUF research. No stats in the org description.
  Not measured: nothing on owners or publishers.

- **rust-digger** — Code Maven; Gábor Szabó
  <https://github.com/szabgab/rust-digger> ; site <https://rust-digger.code-maven.com/>
  2023–2026 · Q4 · no
  Measured: analyses crates from the db-dump and their VCS. The site says "The rust-digger.code-maven.com site is off-line."
  Not measured: no retrievable statistics.

- **Item 25: Manage your dependency graph (Effective Rust)** — effective-rust.com; David Drysdale
  <https://effective-rust.com/dep-graph.html>
  2024 · Q4 · no
  Measured: guidance only (account hijacking and typosquatting, build-time code execution).
  Not measured: no numbers.

- **crates.io crate graph** — Huon on the internet; Huon Wilson
  <https://huonw.github.io/blog/2015/01/crates.io-crate-graph/>
  2015 · Q3 · no
  Measured: "only 681 crates exist on crates.io" in Jan 2015, with the dependency graph visualised.
  Not measured: no owners, no project graphs.

### Searches run

- `web search :: cargo supply-chain publishers dependency graph how many people trust`
- `web search :: "how many dependencies" Rust project average transitive Cargo.lock analysis`
- `web search :: "cargo supply-chain" publishers output example ripgrep "publishers"`
- `web search :: Rust dependencies scare me Hacker News`
- `web search :: crates.io owners transitive dependencies "people" publish rights analysis blog`
- `web search :: lib.rs stats crates owners dependencies histogram`
- `web search :: "592,183" crates dependencies transitive`
- `web search :: reddit r/rust analyzed dependencies GitHub Rust projects Cargo.lock median number of crates`
- `web search :: "single maintainer" OR "single owner" crates.io transitive dependencies popular Rust projects analysis`
- `web search :: users.rust-lang.org how many crates.io accounts do I trust dependency tree owners count`
- `web search :: internals.rust-lang.org supply chain number of publishers owners dependencies trust`
- `web search :: LWN Rust crates.io supply chain dependencies article`
- `web search :: FOSDEM Rust supply chain crates.io talk publishers trust dependency graph`
- `web search :: RustConf OR EuroRust talk supply chain security dependencies crates.io 2024 2025`
- `web search :: "cargo tree" count dependencies popular Rust projects comparison blog ripgrep alacritty zed number of crates`
- `web search :: "who owns" your Rust dependencies crates.io owners analysis`
- `web search :: Kerkour Rust supply chain dependencies crates.io problem`
- `web search :: kerkour.com "Rust has a HUGE supply chain security problem"`
- `web search :: "The following individuals can publish updates for your dependencies"`
- `web search :: reddit rust "cargo-supply-chain" publishers my project how many people can publish`
- `web search :: "dependency amplification" Cargo crates direct transitive ratio projects`
- `web search :: top Rust GitHub repositories dependencies analysis "Cargo.lock" study median dependencies blog 2025 OR 2026`
- `web search :: reddit.com/r/rust how many people can publish code into my binary dependencies owners`
- `web search :: reddit r/rust "cargo-supply-chain" announcement Shnatsel`
- `web search :: "This Week in Rust" dependencies publishers supply chain analysis 2026`
- `web search :: FOSDEM 2026 Rust devroom supply chain crates talk`
- `web search :: nesbitt.io maintainers behind dependency tree count trusted publishing adoption registries`
- `web search :: nesbitt.io crates.io Cargo dependency tree maintainers Rust`
- `web search :: Armin Ronacher lucumr "Build It Yourself" dependencies Rust crates count`
- `web search :: "Rust" "dependencies" blog "unique authors" OR "unique maintainers" OR "distinct owners" cargo tree crates.io my project`
- `web search :: "crates.io" "published by" account analysis versions who publishes crates concentration top publishers`
- `Hacker News search :: cargo supply-chain`
- `Hacker News search :: crates.io trusted publishing`
- `Hacker News search :: rust dependencies publishers`
- `Hacker News search :: crates.io owners dependencies`
- `Hacker News search :: cargo-vet`
- `Hacker News search :: rust dependency count`
- `users.rust-lang.org search :: cargo supply-chain`
- `users.rust-lang.org search :: publishers dependencies`
- `users.rust-lang.org search :: trusted publishing adoption`
- `users.rust-lang.org search :: how many dependencies`
- `users.rust-lang.org search :: crate owners trust`
- `internals.rust-lang.org search :: cargo supply-chain`
- `internals.rust-lang.org search :: publishers dependencies`
- `internals.rust-lang.org search :: trusted publishing adoption`
- `internals.rust-lang.org search :: how many dependencies`
- `internals.rust-lang.org search :: crate owners trust`


## Coverage

r/rust was not searched: Reddit's JSON search returned an empty or non-JSON body for five queries, and old.reddit.com answered HTTP 403. DBLP was blocked by a bot challenge, through its API and its site. The Semantic Scholar API returned HTTP 429 on all six queries sent to it. DuckDuckGo's HTML search returned a bot page for four queries. OpenAlex and the arXiv API stood in for DBLP and Semantic Scholar; Google Scholar, IEEE Xplore and the ACM Digital Library were reached only through domain-restricted web search and OpenAlex metadata. OpenAlex citation coverage is incomplete.

Web search was unavailable for the later part of both halves of the sweep. Four queries were not run: `"Small World with High Risks" replication Cargo OR crates.io maintainers implicitly trusted Rust`; `crates.io trusted publishing adoption measurement study 2026 crates published via GitHub Actions share`; `"Claim vs. Capability" SBOM generation tools Rust projects dependencies sample`; `Google security blog Rust third-party crates Chromium Android review unsafe dependencies number of crates vendored`.

Four pages were read only through the Wayback Machine: lib.rs/stats (snapshot of 2026-05-07; the live page returns a Cloudflare challenge), wiki.alopex.li (2026-06-29; anti-bot wall, and the snapshot is truncated), blog.phylum.io (2026-02-08; TLS error on the live host) and Steve Klabnik's post (2022-11-07; the original domain is gone).

Full texts not available: Fan et al. (FSE 2025), where ACM returned 403 and the entry rests on the OpenAlex abstract and the Zenodo artifact; Qi & Cao (IET Software 2024), where Wiley returned 403 and the entry rests on the OpenAlex abstract and the authors' repository. Präzi was read from the TU Delft repository because the Springer page was blocked, and Schueller et al. (Scientific Data) from arXiv v2 because nature.com redirected to a login. The JFrog 2025 report PDF returned HTTP 403 and no archived copy could be retrieved. The full ReversingLabs 2026 report is gated; only the press release was read. crates.io/data-access renders client-side, so its text was read from the page's source in the crates.io repository; libraries.io/data is a marketing page, so the Libraries.io dataset was read from Zenodo.

One paper was found by title and not opened: "Claim vs. Capability", on SBOM generation tools for Rust projects (SAC 2025, DOI 10.1145/3672608.3707940).

## Corrections, 2026-10-01

Five entries said something their source does not. A quotation dropped "direct and" without
marking the cut; another joined two sentences with an ellipsis; one entry dated the start of
crates.io's publisher records to November 2018, when they start with a change merged on
2019-02-22; one said a
vendor's pages never mention Rust, when an archived capture of one does; one carried figures
from a search-engine snippet that could not be opened, now removed. Each now says what the
source says.
