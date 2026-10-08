# Has anyone counted the projects that resolve npm packages through a registry with no signing keys?

Sweep of 2026-09-25, for [measurements/keyless-registries](../measurements/keyless-registries/):
papers, the trackers and code of npm, pnpm, Yarn, corepack and the registries, the registries'
documentation, and industry reports. 48 source entries; sources and searches in
[keyless-registries-sources.md](keyless-registries-sources.md).

`npm audit signatures` checks a package against its registry's keys. A package from a registry with
none is skipped, unless that registry's document for it carries signatures, which stops the command.
The question is how many real projects resolve packages through such a registry, and which
registries serve keys.

## Q1 — the share of real projects that resolve through a registry, mirror or proxy other than npmjs — **not found**

Nobody was found counting, over a sample of projects or lockfiles, the packages or the projects
that resolve through npmmirror, registry.yarnpkg.com, Artifactory, Nexus, Verdaccio, GitHub
Packages, CodeArtifact, Azure Artifacts, Cloudsmith, Gemfury or any other registry.

The closest:

- One project at a time. A pull request counts its own `bun.lock`: 803 of its 1,543 entries come
  from `registry.npmmirror.com` (p-i-e-r-c-i-n-g-s/Rin#10, 2026-09-17). An automated lead reports an
  internal Artifactory host in one public `package-lock.json` (riteshekbote/n26-hunt#51).
- Mirrors studied for what they serve, not for who uses them: Gu et al. (IEEE S&P 2023), six
  registries and seventeen mirrors, read in its abstract; IntelliRadar, 1,981 malicious packages on
  PyPI mirrors; OSCAR, on Ant Group's npm and PyPI mirrors.
- Lockfile studies that do not read hosts: Kabir et al. (SecDev 2022), whether 841 applications
  lock their versions; Gamage et al. (EMSE 2026), lockfiles across seven package managers, and
  interviews with 15 developers.
- The landing pages of JFrog's and Sonatype's 2026 reports give no figure on traffic through
  proxies or repository managers.

## Q2 — which registries serve keys at `/-/npm/v1/keys`, and signatures in their documents — **not found as a survey; partial, one product at a time**

Nobody was found probing a list of registries. What is on record comes product by product, most of
it from users of corepack and Dependabot:

| product | on record | source |
|---|---|---|
| JFrog Artifactory | supports `audit signatures` from 7.83.1; a local repository signs when ECDSA signing is enabled; a remote one gives the upstream's signatures | JFrog's documentation |
| JFrog Artifactory | keeps `dist.signatures` in the full package document and strips them from the per-version one | nodejs/corepack#725, #808 and its fix #870; dependabot/dependabot-core#14612 |
| Sonatype Nexus OSS 3.33.0-01 | answered 400 on `/-/npm/v1/keys` | npm/cli#5479, 2022 |
| Cloudsmith | re-signs packages with its own key, and serves keys under the repository's path, behind authentication | dependabot/dependabot-core#15567, nodejs/corepack#884 |
| Chainguard | no registry keys; Sigstore attestations | npm/cli#9026 |
| Verdaccio | no signing; a feature request of 2025-12-18 | verdaccio discussion #5514 |
| GitLab | its npm conformance catalogue names neither `/-/npm/v1/keys` nor `dist.signatures` | gitlab-org/gitlab#591953 |
| GitHub Packages, CodeArtifact, Azure Artifacts, Gemfury, Google Artifact Registry, Nexus, npmmirror | documentation silent on registry signatures and the keys endpoint | their documentation |
| Sigstore's TUF repository | holds keys for `registry.npmjs.org` and no other registry | sigstore/root-signing |

No probe of `registry.yarnpkg.com`, `registry.npmmirror.com` or any other public mirror was found.

## Q3 — what a registry without keys gets — **exists**

- The skip is intended, and was asked for. npm/cli#5479 (2022), from a Nexus user: "`npm audit
  signatures` skips audit on dependencies when registry does not return signing keys", and the
  request that a 400 count like a 404; fixed in #5480. In npm's source: "Currently we only care about
  missing signatures on registries that provide a public key".
- It was foreseen. RFC 0051 (npm/rfcs#550, opened 2022-03-10, ratified 2026-05-29): "A potential
  attack scenario would be a malicious mirror/third-party registry omitting `signatures` from the
  packument and tricking validation into thinking no signature verification is needed", and "The
  npm CLI could warn users if they are validating packages that don't have signatures in the
  packument, and the registry/mirror doesn't have keys available". npm 12.1.0 has no such warning.
  The one npm prints from 11.2.0 (npm/cli#8080) names each registry whose keys are not in Sigstore's
  TUF repository, whether it serves keys or not.
- npm's documentation covers "the public npm registry, or any registry that supports signatures"
  and says what a registry has to serve, not what happens to one that serves nothing.
- pnpm 11.1 (2026-05-11) took the same design: "registries that don't publish signing keys are
  skipped".
- In 2020 the question was put of signatures in general, "How many packages today lack a signature,
  and how often are those versions downloaded?" (isaacs, npm/rfcs#76). No answer is on record.

What `npm audit signatures` prints when part of a tree comes from a registry without keys is in
[../tools/npm-audit-signatures/](../tools/npm-audit-signatures/).

## Coverage

General web search answered eleven queries and refused the rest. Of the HTML search engines tried
after it, Brave answered seven queries and then blocked; the others gave no usable result. The sweep
went on through GitHub's issues, pull requests, discussions and code, GitLab, the arXiv and OpenAlex
APIs, Hacker News and pages fetched directly. The blogs of Socket, Snyk and Chainguard could not be
searched; only pages whose address was known were read. Gu et al. is closed access and is judged on
its abstract. JFrog's 2026 report is gated, and only its landing page was read.
