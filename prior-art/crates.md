# Has anyone counted who publishes what one Cargo.lock resolves?

Sweep of 2026-09-25. Four modalities — academic, code and data, industry, community and press —
140 source entries and 210 recorded searches; sources and searches in
[crates-sources.md](crates-sources.md).

The same question as [instruction-gap.md](instruction-gap.md) for npm and
[go-supply-chain.md](go-supply-chain.md) for Go, asked of Rust: over a sample of real projects,
how many distinct accounts published the crate versions a project's `Cargo.lock` resolves, and
how many of them are behind nothing the project declared.

## Q1 — distinct publishers per project, and the share never named — **not found**

Not found in any modality. Nobody was found resolving the versions in a sample of real
projects' lockfiles to the account that published each one, and the share of publishers behind
no declared crate was not found for Rust in any form.

The closest:

- *On Good Authority* (Santos-Grueiro, arXiv 2606.22593, 2026) reads crates.io's publisher and
  trusted-publishing evidence release by release, per package: 135 crates, 1,739 comparisons. It
  never looks at a project's graph.
- cargo-vet's `imports.lock` records the publishing account per version, but only for the crates its
  trust or audit entries need: 100 entries against 262 registry packages in cargo-vet's own lockfile
  at `fb5cc28` (2026-09-25). Its trust entries use the same identity counted here, `published_by` or
  else the trusted-publishing repository.
- A 2021 users.rust-lang.org thread attributes by hand the owners of the nine crates one `rand`
  dependency pulls in.

## Q2 — owners, users and teams, behind one project's graph — **partial**

The instrument is old and public. `cargo supply-chain publishers` (Rust Secure Code WG, since
2020) lists the current owners of a project's graph; `cargo crev verify --recursive` prints owner
totals per subtree. Every published figure is one project:

| project | individuals | teams |
|---|---|---|
| cargo-supply-chain on itself, 2021 (79 crates) | 57 | 9 |
| the same, a 2021 gist | 64 | 12 |
| an unnamed project in the WG's guide, 2023 | 139 | 35 |
| rudder-relayd, 2023 (240 dependencies) | 139 | 34 |
| a hobby project, 2025 | 117 | 37 |

Nobody has run it over a declared sample or reported a median. The metric is not new; a
distribution over a frame is.

## Q3 — direct against resolved, over real projects — **partial**

- Kikas et al. (MSR 2017): 7,978 GitHub Rust repositories from 2016, per release a median of 2
  direct and 5 transitive dependencies, resolved from `Cargo.toml` and keeping only dependencies
  found among the collected repositories, so the transitive count is low.
- Arafat (arXiv 2512.14739, 2025): 50 crates sampled from crates.io's most downloaded, mean 13.7
  direct and 15.1 transitive.
- Registry packages, not projects: Decan et al. (EMSE 2019), Präzi (EMSE 2022), Li et al.
  (ICSE 2024).
- Samples that read real lockfiles and report no counts: Gamage et al., 70.9 % of 1,089 Rust
  projects commit `Cargo.lock`; Prado et al. (arXiv 2609.19920), 1,276 projects with at least
  1,000 stars.
- Anecdotes: a handful of single projects in blogs, from 6 direct and 141 total to about 400 in
  Firefox.

Not found: lockfile medians over a random sample of Rust repositories, or a design effect.

## Q4 — what makes the count possible, and what it cannot see — **exists, with limits**

- The crates.io database dump publishes `versions.published_by`, current non-deleted owners,
  teams and users. It keeps `versions.trustpub_data` private: a version published through
  trusted publishing has no `published_by`, and the repository that published it comes only from
  the per-version API.
- `published_by` was added by a migration dated November 2018, with no backfill, and crates.io
  began filling it with a change merged on 2019-02-22 (rust-lang/crates.io#1621, which took in
  #1561, "Record who published crate versions"). Versions published before then have no
  recorded publisher.
- Owners in a dump are those of its day. GitHub team membership cannot be listed.
- The `users` table changed on 2026-09-14 to hold every user, and crates.io identities are being
  separated from GitHub logins.
- Only the latest dump can be downloaded.
- deps.dev has no identity fields; ecosyste.ms leaves out team owners; Libraries.io stopped in
  2020 and carries no people; Schueller et al. (2022) count git contributors, not registry
  accounts.

Trusted publishing on crates.io launched in July 2025. The only adoption figure found is "over
770 packages" configured, in September 2025.

## Coverage

Reddit returned 403 and was not searched. DBLP was blocked and Semantic Scholar rate-limited;
OpenAlex and the arXiv API stood in. Part of the web queries could not be run, and those were
taken through GitHub search, Hacker News, the Rust forums' search and the Wayback Machine. The JFrog
2025 report returned 403; the full texts of Fan et al. (FSE 2025) and Qi & Cao (IET Software 2024)
were blocked and are judged on their abstracts and artifacts. One paper found by title was not
opened: "Claim vs. Capability: A Comparative Analysis of the SBOM Generation Tools for Rust
Projects" (SAC 2025).

## Corrections, 2026-10-01

- The sweep was given as 140 source entries for 130 sources; the 130 had no rule behind it, and the
  count is the 140 entries.
- The start of crates.io's publisher records is now dated from crates.io: a change merged on
  2019-02-22, after the migration of November 2018.
