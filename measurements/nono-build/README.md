# measurements/nono-build — who published the code nono is built from

nono is a sandbox. The case for running `npm install` inside it is that npm's dependency tree is
too large to audit. This counts, the same way [instruction-gap](../instruction-gap/) counted npm,
who published the crates nono itself is built from. It is one project, not a sample, and is
published because a note cites it. No prior-art sweep of its own was run: it applies
instruction-gap's count, whose sweep is [../../prior-art/instruction-gap.md](../../prior-art/instruction-gap.md),
to one lockfile.

**The lockfile.** nono's `Cargo.lock` at commit `121bf37`
(`https://github.com/nolabs-ai/nono/blob/121bf3726855136b8ee5191b28e0bc540733ba1d/Cargo.lock`),
on its main branch on 2026-09-21, 17 commits after the `v0.78.0` tag; its published crates are
still versioned 0.78.0 there. [results/Cargo.lock](results/Cargo.lock) is that file, git blob
`e0e7d499ceadcc8a2d3f5715b2090528442f2e02`. It lists 548 registry versions of 501 crates. Like
instruction-gap, this counts everything the lockfile resolves, dev-dependencies and other
platforms' dependencies included.

## Publishers

crates.io records who published 545 of the 548 versions: an account
(`published_by`) or, under trusted publishing, a CI run in a GitHub repository
(`trustpub_data`). instruction-gap counts a trusted-publishing repository as the publisher, and so
does this.

| | nono | a median npm project (instruction-gap) |
|---|---|---|
| versions published by an account | 483 | — |
| versions published by trusted publishing | 62 | — |
| versions with no publisher recorded | 3 (2017–2018, before crates.io recorded it) | — |
| distinct publishers, accounts and repositories | **184** (158 accounts, 26 repositories) | **165** [94–259] |
| without automation accounts and repositories | **157** | **130** |

The automation pattern is instruction-gap's, unchanged; here it matches one account,
`aws-sdk-rust-ci`. The npm brackets are the middle half of 892 projects. nono sits above the npm
median and inside its middle half.

## Owners

A different question: who owns a crate now, from crates.io's owners endpoint, on
2026-09-24. **278 owners**, 227 of them user accounts and 51 GitHub teams, where a team is any
number of people. 220 of the 501 crates, 44 %, have exactly one owner. instruction-gap has no npm
figure for the same question: its 401 counts the maintainers each version recorded when it was
published. 16 of the 158
publishing accounts are not among the 278 owners at all, and 75 versions were published by an
account that is no longer an owner of that crate.

## Controls and reproduction

Controls, run before the counts and required to pass: `serde 1.0.229` must come back published by
`dtolnay`, `aws-config 1.12.0` by an account the automation pattern matches (`aws-sdk-rust-ci`),
and `chacha20 0.10.2` by the repository `RustCrypto/stream-ciphers` under trusted publishing. For
owners, `serde` must return `dtolnay` and `github:serde-rs:publish`. All passed.

The publisher counts come from [src/publishers.py](src/publishers.py), whose own run is in
[results/publishers-run.txt](results/publishers-run.txt): controls, counts, and a seeded sample
of 30 versions fetched again, which must match. The owner counts come from
[src/owners.py](src/owners.py). When it was run, a seeded sample of 30 crates fetched again with an
empty cache matched 30 of 30; that check is not part of `owners.py`.

## What this does not say

It is one lockfile of one project. A lockfile resolves every platform's dependencies, and a build
on one machine compiles fewer. Owners are as of 2026-09-24; publishers are as recorded for each
version when it was published. Nothing was built or run. Whether nono's tree is larger or smaller
than a typical Rust tool's was not measured.

## Corrections, 2026-09-25

- *Owners* set nono's owners against instruction-gap's 401 as the same question. The 401 counts
  the maintainers each version recorded when it was published, not who may publish now, and the
  comparison is gone.

## Corrections, 2026-09-30

- *The lockfile* said nono's own crates are versioned 0.78.0 at `121bf37`. Only the three it
  publishes are, `nono`, `nono-cli` and `nono-proxy`; by their Cargo.toml, `nono-ffi` and
  `nono-test-support` are 0.1.0 with `publish = false`. It now says its published crates.
- *Publishers* said crates.io records who published each of the 548 versions. The table's third row
  counts three whose crates.io record has `published_by` and `trustpub_data` null and no audit
  action. It now says 545 of the 548.
- *Owners*, like this measurement's entries in README.md and measurements/README.md, said who may
  publish a crate now; all now say who owns one. crates.io asks owner rights, teams included, only
  of accounts, not of trusted publishing, and bars accounts from `trustpub_only` crates (`chacha20`).
- *Owners* said npm has no figure for the same question. npm's `npm owner` page says `ls` lists "all
  the users who have access to modify a package and push new versions". It now says instruction-gap
  has none: its 401 counts maintainers as each version recorded them.

## Corrections, 2026-10-02

- `src/owners.py` sent the User-Agent `norte-labs audit (chris@nortesoftware.dev)`; every other
  script here sends `norte-labs measurement (chris@nortesoftware.dev)`, and now it does too. The
  owners in `results/owners.json` were fetched on 2026-09-24 with the old string.
