# prior-art/keyless-registries — sources and searches

Appendix to [keyless-registries.md](keyless-registries.md). Sweep of 2026-09-25: 48 source
entries. Every source listed here was opened unless the entry says otherwise. Scale: answers,
partial, adjacent, no.

In the entries, quotations, figures and dates are as their sources gave them on 2026-10-07, and an
open or closed thread is as it stood that day.

## Q3: npm itself

- **npm-audit, section "Audit Signatures"** — npm documentation (npm/cli `docs/lib/content/commands/npm-audit.md`)
  <https://docs.npmjs.com/cli/v11/commands/npm-audit> · <https://github.com/npm/cli/blob/latest/docs/lib/content/commands/npm-audit.md>
  Q3 · partial
  Says: "To ensure the integrity of packages you download from the public npm registry, or any
  registry that supports signatures, you can verify the registry signatures" and "The npm CLI
  supports registry signatures and signing keys provided by any registry if the following
  conventions are followed", then the shape of `dist.signatures` and of
  `registry-host.tld/-/npm/v1/keys`.
  Not measured: what happens with a registry that does not follow the conventions. Nothing on
  skipping or on partial coverage.

- **About ECDSA registry signatures; Verifying ECDSA registry signatures** — npm documentation
  <https://docs.npmjs.com/about-registry-signatures> · <https://docs.npmjs.com/verifying-registry-signatures>
  Q3 · partial
  Says, on the first: "Signing and verifying published packages protects against an attacker
  controlling a registry mirror or proxy where they attempt to intercept and tamper with the package
  tarball content." Its section "Supporting signatures on third-party registries" begins "The npm
  CLI supports registry signatures and signing keys provided by any registry if the following
  conventions are followed". On the second, under "Troubleshooting" and "Some packages are missing
  registry signatures": "The CLI will error if packages don't have signatures _and_ if the package
  registry supports signatures. This could mean an attacker might be trying to circumvent signature
  verification. You can check if the registry supports signatures by requesting the public signing
  keys from `registry-host.tld/-/npm/v1/keys`."
  Not measured: the pages name a mirror or proxy as the threat and do not say that a mirror
  without keys is skipped.

- **`lib/utils/verify-signatures.js`** — npm/cli source, at v12.1.0
  <https://github.com/npm/cli/blob/v12.1.0/lib/utils/verify-signatures.js>
  Q3 · answers, for the behaviour
  Reads: a registry's keys come from the Sigstore TUF target `<host><path>/keys.json`; on
  `TUF_FIND_TARGET_ERROR` npm fetches `/-/npm/v1/keys`, and `E404` or `E400` there leaves the
  registry with no keys. A package counts in `auditedWithKeysCount` only if its registry has keys.
  `missing` is recorded only `else if (keys.length)`, under the comment "Currently we only care
  about missing signatures on registries that provide a public key" and "We could make this
  configurable in the future with a strict/paranoid mode". The command fails only when nothing was
  audited against keys and no attestation was verified. A package's registry comes from
  `npmFetch.pickRegistry(spec, this.npm.flatOptions)`: the configuration, not the lockfile.

- **`lib/registry.js`** — npm/pacote source, 22.0.0 as npm 12.1.0 bundles it
  <https://github.com/npm/pacote/blob/v22.0.0/lib/registry.js>
  Q3 · partial
  Reads: when `verifySignatures` is set, every entry of `dist.signatures` needs a matching key in
  `registryKeys`, or pacote throws `EMISSINGSIGNATUREKEY` ("has a registry signature with keyid: …
  but no corresponding public key can be found"); `dist.attestations` are fetched from the
  configured registry, and an attestation with a keyid needs a matching key too ("has attestations
  but no corresponding public key(s) can be found"), while a keyless one, which carries its
  signing certificate, does not; and `fullMetadata` is set, so the full package document is
  fetched. A registry with no keys that passes npmjs's signatures through therefore fails the
  command, and one that serves neither signatures nor attestations is skipped.

- **RFC 0051, "Improve npm signature verification"** — npm/rfcs; Philip Harrison (feelepxyz)
  <https://github.com/npm/rfcs/blob/main/implemented/0051-validate-signatures.md> · <https://github.com/npm/rfcs/pull/550>
  2022 · Q3, and Q2 by intent · answers, for the intent
  Pull request opened 2022-03-10, ratified and moved to implemented on 2026-05-29 (npm/rfcs#876 and
  #877); the command itself is npm/cli#4827, merged 2022-07-11.
  Says:
  - "A potential attack scenario would be a malicious mirror/third-party registry omitting
    `signatures` from the packument and tricking validation into thinking no signature verification
    is needed."
  - "The npm CLI could warn users if they are validating packages that don't have signatures in the
    packument, and the registry/mirror doesn't have keys available at:
    `https://registry.host/-/npm/v1/keys`."
  - "Third-party npm registries (e.g. GitHub Packages, Artifactory, Verdaccio etc) should be able to
    start signing published packages".
  - "There's currently no reliable (or is there?) way to differentiate a mirror/proxy from a
    originating third-party npm registry".
  - It proposes asking users to trust unknown keys and keeping them as `trusted-signature-keys` in
    `.npmrc`.
  - Among its open questions, "What do we do when there is no dist.npm-signature present?", answered
    "I assume we need to ignore it, as this would also be the case for packages coming from third
    party registries".
  Not measured: how many packages or installs come from registries without keys. Neither the
  warning nor the key-trust prompt is in npm: GitHub code search finds `trusted-signature-keys` and
  `trusted-signature` nowhere in npm/cli.

- **RFC 0051's discussion** — npm/rfcs#550; feelepxyz, ljharb and others
  <https://github.com/npm/rfcs/pull/550>
  2022 · Q3 · partial
  Says:
  - feelepxyz, 2022-03-11: "we can't do the same for packages fetched from third-party registries
    until they add support. Users either need to manually trust keys or be warned some packages are
    unsigned", and "we might need to resort to showing a warning when verifying installed packages
    that have 'missing' signatures".
  - ljharb, 2022-03-15: the command "could presumably be configured to fail, or ignore, packages
    that lack a signature (failing on it would probably break everyone that has an internal
    registry)".
  - feelepxyz, 2022-03-15: "Some companies run a mirror that they install packages from" and "Yarn is
    an another example where they run their own proxy in front of the npm registry."
  Not measured: "everyone that has an internal registry" is not a figure.

- **rfc: Signed Packuments** — npm/rfcs#76; retrohacker, isaacs
  <https://github.com/npm/rfcs/pull/76>
  2019–2020, open · Q3 · adjacent
  Says: the threat is mirrors: "We are looking for a way to not have to trust a mirror in order to
  pull packages from it". isaacs, 2020-03-04: "How many packages today lack a signature, and how
  often are those versions downloaded?"
  Not measured: no answer is on record.

- **[BUG] Third party registry returns E400 on /-/npm/v1/keys for `npm audit signatures`** — npm/cli#5479; juanheyns
  <https://github.com/npm/cli/issues/5479> · fix <https://github.com/npm/cli/pull/5480>, merged 2022-09-21
  2022 · Q3, Q2 · partial
  Says: "`npm audit signatures` skips audit on dependencies when registry does not return signing
  keys. The method used to determine if the repository supports signing keys is to look for a E404,
  but some third-party registries return E400 instead." The environment: "Sonatype Nexus
  Repository Manager OSS 3.33.0-01". The issue has no comments; the fix's review concerned its
  tests.
  Not measured: one registry at one version. Nothing on reporting the skip.

- **`npm audit signatures` does not report how many packages it skipped for want of registry keys** — npm/cli#10018; nortesoftware
  <https://github.com/npm/cli/issues/10018>
  2026-09-23 · Q3
  The issue this measurement follows from; not prior art.

- **fix: warn when TUF fetching of keys fails** — npm/cli#8080; wraithgar
  <https://github.com/npm/cli/pull/8080>
  merged 2025-02-03 · Q3 · partial
  Adds `log.warn(`Fetching verification keys using TUF failed.  Fetching directly from ${registry}.`)`.
  The line is in `verify-signatures.js` at v11.2.0 and v12.0.0, and not at v10.9.8 or v11.1.0.
  Not measured: it names a registry, not the packages skipped, and it prints for every registry
  outside Sigstore's TUF repository, keys or not.

- **fix: npm audit signatures for keyless attestation registries** — npm/cli#9026; ajayk
  <https://github.com/npm/cli/pull/9026>
  merged 2026-02-24 · Q3, Q2 · partial
  Says: "npm audit signatures fails when a registry only uses keyless (Sigstore/Fulcio)
  attestations and doesn't provide registry signing keys", and the change makes it so "registries
  that exclusively use Fulcio-based signing (like Chainguard) work correctly". The command now fails
  on `!this.auditedWithKeysCount && !this.verifiedAttestationCount`.
  Not measured: one registry. A registry without keys can still be verified.

- **npm audit signatures to skip signature check for internal modules** — npm/cli#8559; avula-sudheer
  <https://github.com/npm/cli/issues/8559>
  2025 · Q2, Q3 · adjacent
  Says: internal modules on JFrog Artifactory give "2 packages have missing registry signatures but
  the registry is providing signing keys": the registry served keys and its local packages were not
  signed. Closed on 2025-11-04 as "similar if not a duplicate of" #6208 and #8556; #6208 is about
  `npm audit` ignoring `overrides`.
  Not measured: one case.

- **`npm audit signatures` always fails with "no corresponding public key can be found"** — npm/cli#8066; dallmair
  <https://github.com/npm/cli/issues/8066>
  2025 · Q2, Q3 · adjacent
  Says: `EMISSINGSIGNATUREKEY`; "The package this is reported for is random and changes with every
  invocation." Closed by its author the same day: "The config erroneously lists
  registry.npmjs.**com** when it should obviously be registry.npmjs.**org**."
  Not measured: one client, whose configuration named `registry.npmjs.com`.

- **[FEATURE] True mirror registry** — npm/cli#7912; hyrious
  <https://github.com/npm/cli/issues/7912>
  2024, closed · Q1, Q3 · adjacent
  Says: the `registry` setting "affects the lockfile", and "many of them do not have an audit API
  endpoint (#4382)". wraithgar: "This would be a much larger discussion that would need to start in
  the rfcs repo".
  Not measured: no counts.

- **A new npm `audit signatures` command to verify npm package integrity** — GitHub Changelog
  <https://github.blog/changelog/2022-07-26-a-new-npm-audit-signatures-command-to-verify-npm-package-integrity/>
  2022-07-26 · Q3 · adjacent
  Says: it works with "the public npm registry, or any registry that supports signatures"; "The CLI
  will error if some packages have missing or invalid signatures."
  Not measured: nothing on other registries.

- **Sigstore's TUF repository, targets** — sigstore/root-signing
  <https://github.com/sigstore/root-signing/tree/main/targets>
  Q2, Q3 · partial
  Listed: the npm targets are `targets/registry.npmjs.org/keys.json` and
  `metadata/registry.npmjs.org.json`, for no other registry.
  Not measured: the keys endpoint of any other host.

## Q3: other clients

- **pnpm 11.1** — release notes; `deps/security/signatures`; pnpm/pnpm#11405, colinfristoe
  <https://pnpm.io/blog/releases/11.1> · <https://github.com/pnpm/pnpm/blob/main/pnpm11/deps/security/signatures/README.md> · <https://github.com/pnpm/pnpm/pull/11405>
  released 2026-05-11; #11405 merged 2026-05-01 · Q3 · answers, for pnpm
  Says: "A new `pnpm audit signatures` subcommand verifies ECDSA registry signatures for installed
  packages against keys published at `/-/npm/v1/keys`" and "Scoped registries are respected;
  registries that don't publish signing keys are skipped." The package's README: "Registries that
  do not expose signing keys are skipped."
  Not measured: no count of what was skipped.

- **`pnpm audit signatures` silently excludes packages it cannot resolve in the lockfile (fail-open, exit 0)** — pnpm/pnpm#13638; mpj
  <https://github.com/pnpm/pnpm/issues/13638>
  2026 · Q3 · adjacent
  Says: the audited count shrinks by one, "`missing` and `invalid` stay empty, and the command exits
  0". The same kind of silent undercount as npm/cli#10018, from another cause.
  Not measured: nothing about registries.

- **[Feature] audit signatures** — yarnpkg/berry#6487; kabo
  <https://github.com/yarnpkg/berry/issues/6487>
  2024, open · Q3 · adjacent
  Says: Yarn has no `audit signatures`.

## Q2: registries and proxies

- **npm Repositories: "Use npm audit signatures", "npm Client Implications for npm audit signatures", "Known Issues With npm audit signatures"** — JFrog Artifactory documentation
  <https://docs.jfrog.com/artifactory/docs/npm-repositories> · the older address <https://jfrog.com/help/r/jfrog-artifactory-documentation/known-issues-with-npm-audit-signatures>
  Q2, Q3 · answers, for Artifactory
  Says:
  - "Starting from version 7.83.1, Artifactory supports npm audit signatures, a mechanism that
    applies and verifies artifact signatures using the ECDSA Key Pairs. When ECDSA auto signing is
    enabled on a local repository, it creates a signature for each package".
  - "When running npm audit signatures from a remote repository, the signature process is up to the
    upstream registry. The official npm registry already signs using ECDSA, therefore Artifactory
    provides the signature directly from the remote repository".
  - "Running npm audit signatures on a virtual repository that includes at least one local or remote
    repository that does not have signatures enabled causes the npm client to return an error, since
    not all your packages are signed."
  Not measured: how many instances run 7.83.1 or later, or sign. Nothing on the per-version
  document below.

- **Corepack does not work with COREPACK_NPM_REGISTRY that does not return signatures (Artifactory)** — nodejs/corepack#725; dhardtke
  <https://github.com/nodejs/corepack/issues/725>
  2025, open · Q2 · partial
  Says: Artifactory's per-version document has no `signatures` in `dist`, while the full one
  "returns the dist field just like npmjs, including signatures".
  Not measured: one instance.

- **verifySignature fails when registry returns dist.signatures on package root but not on version endpoint** — nodejs/corepack#808; sahil-pf; fix nodejs/corepack#870
  <https://github.com/nodejs/corepack/issues/808> · <https://github.com/nodejs/corepack/pull/870>
  2026; #870 merged 2026-08-27 · Q2 · partial
  Says: the same on Artifactory. #870: "Some registry proxies (e.g. JFrog Artifactory) keep
  `dist.signatures` on the package-root endpoint but strip it from the per-version one."
  Not measured: one instance.

- **Corepack signature verification fails with Artifactory registry — dist.signatures stripped from version endpoint** — dependabot/dependabot-core#14612; sahil-pf
  <https://github.com/dependabot/dependabot-core/issues/14612>
  2026 · Q2 · partial
  Says: "JFrog Artifactory 7.133.6 (self-hosted) configured as npm virtual repository"; the
  per-version document has no `signatures`, the full one has keyid
  `SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U`.
  Not measured: one instance.

- **Corepack breaks when `integrity` key is missing from metadata, from artifactory** — nodejs/corepack#537; trc-mathieu
  <https://github.com/nodejs/corepack/issues/537>
  2024 · Q2 · adjacent
  Says: an Artifactory proxy served `dist` with only `tarball` and `shasum`, "missing the
  `dist/integrity` neither `dist/signatures` keys".
  Not measured: which document, and which version of Artifactory.

- **Corepack install/activate for a pinned engines.npm version has no signature-verification fallback for private/re-signing registries** — dependabot/dependabot-core#15567; broksonic21, opswithranjan
  <https://github.com/dependabot/dependabot-core/issues/15567>
  2026 · Q2 · partial
  Says (opswithranjan, 2026-07-23, "from a live repro against a private Cloudsmith registry"): "the
  keyid inside `dist.signatures` is the registry's own key", "So the registry really is re-signing
  the package with its own key", and "The `/-/npm/v1/keys` endpoint does exist. It is served
  relative to the configured registry URL", "and it requires auth. The bare host-root path returns
  404".
  Not measured: one instance. Cloudsmith's documentation does not say this (below).

- **Support signature verification against a custom COREPACK_NPM_REGISTRY** — nodejs/corepack#884; opswithranjan
  <https://github.com/nodejs/corepack/issues/884>
  2026, open · Q2 · adjacent
  Says: registries that re-sign packages, Cloudsmith named, break corepack, which trusts only the
  npm keys it carries; the proposal is to fetch `<registry>/-/npm/v1/keys`: "Merging (rather than
  replacing) keeps working for registries that proxy packages while preserving npm's original
  signatures".
  Not measured: which registries pass signatures through and which re-sign.

- **Metadata retrieval errors when using `COREPACK_NPM_REGISTRY` in combination with Sonatype Nexus** — nodejs/corepack#479; PayBas
  <https://github.com/nodejs/corepack/issues/479>
  2024–2025 · Q2 · adjacent
  Says: Nexus served version-specific metadata wrongly; the fixes went through Nexus 3.70, 3.72
  (NEXUS-43608), 3.74 (NEXUS-44175) and 3.77 (NEXUS-45088), and on 2025-02-19 a commenter found the
  last one right for scoped packages and still wrong for unscoped ones.
  Not measured: keys and signatures were not looked at.

- **downloads package managers only from npm by default** — nodejs/corepack#495; mcollina, aduh95, PayBas and others
  <https://github.com/nodejs/corepack/issues/495>
  2024, open · Q1, Q3 · adjacent
  Says: PayBas, 2024-07-23: "there are large amounts of users in corporate environments that have no
  direct access to npmjs.org and need to rely on organization-internal proxy registries provided by
  Artifactory, Nexus, ProGet, etc." aduh95: "we discussed accepting only registries with an audited
  a signature process".
  Not measured: "large amounts" is not a number.

- **Package signature** — verdaccio discussion #5514; DanielCastronovo, answered by mbtools
  <https://github.com/orgs/verdaccio/discussions/5514>
  2025-12-18 · Q2 · partial, for Verdaccio
  Says: "As a Platform Engineer, i want to have my NPM signed (GPG, Cosign, etc.), like others
  registries." The answer: "Good feature request. Feel free to help implement it." GitHub code
  search finds no `npm/v1/keys` in verdaccio/verdaccio; its pull request #3294 (2022) added
  `dist.signatures` to its TypeScript types.
  Not measured: whether Verdaccio passes an upstream's `dist.signatures` through, which decides
  whether npm fails or skips.

- **Build conformance test tool for Artifact Registry protocols (Maven, npm, OCI)** — gitlab-org/gitlab#591953
  <https://gitlab.com/gitlab-org/gitlab/-/work_items/591953>
  2026 · Q2 · partial, for GitLab
  Listed: the npm behaviours GitLab's registry is to match, among them the audit endpoint
  (`/-/npm/v1/security/advisories/bulk`) and the `time` field. Neither `/-/npm/v1/keys` nor
  `dist.signatures` is in it; its one row about signatures is Maven's PGP `.asc` files.
  Not measured: what GitLab serves.

- **Registry documentation that says nothing of npm registry signatures, `/-/npm/v1/keys` or `audit signatures`** · Q2, Q3 · no
  - Sonatype Nexus: <https://help.sonatype.com/en/npm-registry.html>, <https://help.sonatype.com/en/npm-audit.html>.
    Their only mentions of signatures are the menu entries "GPG signatures for Yum" and "Signatures
    REST API".
  - GitHub Packages: <https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry>.
  - AWS CodeArtifact: <https://docs.aws.amazon.com/codeartifact/latest/ug/npm-auth.html>,
    <https://docs.aws.amazon.com/codeartifact/latest/ug/npm-commands.html>. The second lists `audit`
    among the commands it does not support ("CodeArtifact does not currently vend security
    vulnerability data").
  - Azure Artifacts: <https://learn.microsoft.com/en-us/azure/devops/artifacts/npm/npm-audit?view=azure-devops>:
    "Azure Artifacts doesn't add audit-specific behavior because npm handles the audit operation and
    results."
  - Cloudsmith: <https://docs.cloudsmith.com/formats/npm-registry>,
    <https://docs.cloudsmith.com/supply-chain-security/signing-keys>, where npm's key type is GPG.
  - Gemfury: <https://gemfury.com/help/npm-registry/>.
  - GitLab: <https://docs.gitlab.com/user/packages/npm_registry/>.
  - Google Artifact Registry: <https://docs.cloud.google.com/artifact-registry/docs/nodejs/store-nodejs>.
  - npmmirror: <https://npmmirror.com/>, which calls itself "一个完整 npmjs.com 镜像" (a complete
    mirror of npmjs.com) and says "我们将尽量与官方服务实时同步" (we will try as far as possible to
    keep in step with the official service in real time). GitHub code search finds no `v1/keys` in cnpm/cnpmcore, the server it runs; `signatures`
    appears there only in test data copied from npmjs and in comments about TypeScript.
  - Chainguard: <https://edu.chainguard.dev/chainguard/libraries/javascript/overview/>, nothing on
    registry keys; Chainguard's behaviour is on record only in npm/cli#9026.
  Not measured: silence in documentation is not behaviour.

- **npm package signature verification: the 2026 rollout state** — Safeguard blog; Hritik Sharma
  <https://safeguard.sh/resources/blog/npm-package-signature-verification-rollout-2026>
  2026-05-14 · Q2 · no
  Says: "Registry mirrors and proxies, including Artifactory, Nexus, and Verdaccio, all handle
  signature passthrough differently; some re-sign with their own key after caching, which preserves
  availability but breaks end-to-end verification against the upstream npm signature."
  Not measured: no test, no figure, and not which product does what.

## Q1: who resolves through registries, mirrors and proxies

- **Record that bun.lock resolves half its packages from registry.npmmirror.com** — p-i-e-r-c-i-n-g-s/Rin#10
  <https://github.com/p-i-e-r-c-i-n-g-s/Rin/pull/10>
  2026-09-17 · Q1 · adjacent, one project
  Measured: one `bun.lock`: `https://registry.npmmirror.com` 803 entries, the default registry 740,
  1,543 in all. "It is **not a configuration** — there is no `.npmrc` and no `bunfig.toml` anywhere
  in the repo, so nothing here selects a registry. The URLs are baked into the lockfile, inherited
  from upstream".
  Not measured: any other project; keys or signatures.

- **[45%] Internal Artifactory Registry URL Disclosed in Public npm Lockfile** — riteshekbote/n26-hunt#51, opened by an automated workflow
  <https://github.com/riteshekbote/n26-hunt/issues/51>
  2026-09-22 · Q1 · adjacent, one project
  Measured: one public `package-lock.json` whose packages resolve through an internal Artifactory
  host that cannot be reached from outside.
  Not measured: how common it is. An internal host in a public lockfile cannot be probed at all.

- **What is the role of 'registry.yarnpkg.com'?; Consider deprecating registry.yarnpkg.com?** — yarnpkg/yarn#889, #5891
  <https://github.com/yarnpkg/yarn/issues/889> · <https://github.com/yarnpkg/yarn/issues/5891>
  2016; 2018–2019 · Q1, Q2 · adjacent
  Says: sebmck, 2016: "Right now it's just a reverse proxy to `registry.npmjs.org`." jamiebuilds,
  2018: "a lot of infrastructure now depends on it". arcanis, 2019: "strongly in favor of keeping the
  registry CNAME up".
  Not measured: how many lockfiles name it, and whether it serves `/-/npm/v1/keys`.

- **「重要通知」原淘宝 npm 域名即将停止解析** — cnpm/cnpm#361; fengmk2
  <https://github.com/cnpm/cnpm/issues/361>
  2022-02-11 · Q1 · adjacent
  Says: `registry.npm.taobao.org` stops resolving on 2022.06.30 and moves to
  `registry.npmmirror.com`, and existing lockfiles have to be rewritten ("存量应用的 lock
  文件，开发者需要自行执行 sed 等指令去替换或重新生成").
  Not measured: how many lockfiles named the old domain.

- **Investigating Package Related Security Threats in Software Registries** — IEEE S&P 2023; Yacong Gu, Lingyun Ying, Yingyuan Pu, Xiao Hu, Huajun Chai, Ruimin Wang, Xing Gao, Haixin Duan
  <https://doi.org/10.1109/SP46215.2023.10179332>
  2023 · Q1, Q2 · adjacent. Abstract only, through OpenAlex: closed access, and no open copy was
  found.
  Measured, per the abstract: "a measurement study spanning one year over six registries and
  seventeen popular mirrors, scrutinizing over 4 million packages across 53 million package
  versions", and "twelve potential attack vectors".
  Not measured: how many projects use the mirrors. The abstract does not mention signatures or
  keys.

- **IntelliRadar: A Comprehensive Platform to Pinpoint Malicious Package Information from Cyber Intelligence** — arXiv 2409.15049; Wenbo Guo, Chengwei Liu, Limin Wang, Yiran Zhang, Jiahui Wu, Zhengzi Xu, Yang Liu
  <https://arxiv.org/abs/2409.15049>
  2024 · Q1 · adjacent
  Measured: 1,981 malicious packages on PyPI mirrors: Tsinghua 781, Tencent 548, Douban 395, BFSU
  21, Huawei 132, Aliyun 104.
  Not measured: npm mirrors, who uses them, signatures.

- **Towards Robust Detection of Open Source Software Supply Chain Poisoning Attacks in Industry Environments (OSCAR)** — ASE 2024 Industry Showcase, arXiv 2409.09356; Xinyi Zheng, Chen Wei, Shenao Wang, Yanjie Zhao, Peiming Gao, Yuanchao Zhang, Kailong Wang, Haoyu Wang
  <https://arxiv.org/abs/2409.09356>
  2024 · Q1 · adjacent
  Measured: run on Ant Group's npm and PyPI mirrors from January 2023; 10,404 malicious npm and
  1,235 PyPI packages over 18 months.
  Not measured: who uses the mirrors, signatures.

- **Why Software Signing (Still) Matters: Trust Boundaries in the Software Supply Chain** — arXiv 2510.04964; Kelechi G. Kalu, James C. Davis
  <https://arxiv.org/abs/2510.04964>
  2025 · Q2, Q3 · adjacent
  Says: signing guarantees "are not automatically carried across different software distribution
  boundaries. These boundaries include mirrors, corporate proxies, re-hosting, and air-gapped
  transfers".
  Not measured: a position paper with no data.

- **Signing in Four Public Software Package Registries: Quantity, Quality, and Influencing Factors** — IEEE S&P 2024, arXiv 2401.14635; Taylor R. Schorlemmer, Kelechi G. Kalu, Luke Chigges, Kyung Myung Ko, Eman Abu Isghair, Saurabh Bagchi (spelled "Baghi" on arXiv), Santiago Torres-Arias, James C. Davis
  <https://arxiv.org/abs/2401.14635>
  2024 · Q2 · adjacent
  Measured: signing in Maven Central, PyPI, Docker Hub and Hugging Face. npm is described as the
  registry-signer model and not measured.
  Not measured: npm, mirrors, what verification covers.

- **The Design Space of Lockfiles Across Package Managers** — Empirical Software Engineering 2026, arXiv 2505.04834; Yogya Gamage, Deepika Tiwari, Martin Monperrus, Benoit Baudry
  <https://arxiv.org/abs/2505.04834>
  2025–2026 · Q1 · no
  Measured: lockfiles across seven package managers, and interviews with 15 developers.
  Not measured: the hosts in lockfiles, or any registry's share.

- **How Do Developers Follow Security-Relevant Best Practices When Using NPM Packages?** — IEEE SecDev 2022; Md Mahir Asef Kabir, Ying Wang, Danfeng (Daphne) Yao, Na Meng
  <https://doi.org/10.1109/SecDev53368.2022.00027>, abstract through OpenAlex
  2022 · Q1 · no
  Measured: 841 open-source JavaScript applications; "only 32% of the applications lock the version
  numbers of package dependencies".
  Not measured: registries or hosts.

- **Towards Measuring Supply Chain Attacks on Package Managers for Interpreted Languages** — NDSS 2021, arXiv 2002.01139; Ruian Duan, Omar Alrawi, Ranjita Pai Kasturi, Ryan Elder, Brendan Saltaformaggio, Wenke Lee
  <https://arxiv.org/abs/2002.01139>
  2021 · Q1 · no
  Measured: the registries were mirrored to collect packages for analysis.
  Not measured: who uses mirrors, signatures.

- **JFrog 2026 Software Supply Chain Security State of the Union**, landing page — JFrog
  <https://jfrog.com/software-supply-chain-state-of-union/>
  2026 · Q1 · no
  Says: the report draws on JFrog Platform data and "responses from over 1,500 Security and DevOps
  professionals across eight countries".
  Not measured: on the page, no figure on traffic through remote or proxy repositories or on npm
  signatures. The report itself is gated and was not read.

- **2026 State of the Software Supply Chain**, introduction — Sonatype
  <https://www.sonatype.com/state-of-the-software-supply-chain/introduction>
  2026 · Q1 · no
  Not measured: no figure on repository managers or proxies, nothing on npm signatures.

- **npm package manager best practices** — OpenSSF, ossf/package-manager-best-practices `published/npm.md`
  <https://github.com/ossf/package-manager-best-practices/blob/main/published/npm.md>
  Q3 · adjacent
  Says: "Signatures can be verified with the npm CLI v8.15.0 or later with the command `npm audit
  signatures`." A separate section, "Private registry configurations", is for "internal private
  registries". The two are not connected.

- **Why npm lockfiles can be a security blindspot for injecting malicious modules** — Snyk blog; Liran Tal
  <https://snyk.io/blog/why-npm-lockfiles-can-be-a-security-blindspot-for-injecting-malicious-modules/>
  2019-09-24 · Q1 · adjacent, a tool
  Says: lockfile-lint checks the hosts in a lockfile's `resolved` URLs against `--allowed-hosts`.
  Not measured: which hosts any sample of lockfiles names.

## Searches run

GitHub's REST and GraphQL APIs through `gh`. "→" gives what came back; "(0)", nothing.

### General web search

1. `Artifactory npm "audit signatures" registry signatures keys` → JFrog's npm repository documentation and its "Known Issues With npm Audit Signatures" anchor; npm/cli#8559; npm's documentation; the Safeguard post.
2. `JFrog Artifactory npm "/-/npm/v1/keys"` → JFrog pages, none about the endpoint; Mend's documentation.
3. `Sonatype Nexus npm "audit signatures" OR "dist.signatures" OR "npm/v1/keys"` → npm/cli#5479; Nexus javadoc; Sonatype's npm audit pages, about vulnerabilities only.
4. `Verdaccio "audit signatures" OR "npm/v1/keys" signatures support` → the verdaccio-audit plugin, verdaccio#689, `@verdaccio/signature`; nothing on registry signatures.
5. `Sonatype Nexus Repository npm signatures ECDSA "audit signatures" release notes` → Nexus release notes 3.82 to 3.96 and 2026; nothing on npm signatures in the two opened.
6. `GitHub Packages npm registry "audit signatures" signatures keys npm.pkg.github.com` → pnpm 11.1; npm/cli#10018; GitHub Packages' npm documentation; the 2022-07-26 changelog.
7. `AWS CodeArtifact npm "audit signatures"` → CodeArtifact's npm documentation, re:Post (ENOAUDIT); nothing on signatures.
8. `Azure Artifacts npm feed "audit signatures" OR "registry signatures"` → Azure Artifacts' npm audit page; nothing on signatures.
9. `Cloudsmith npm "audit signatures" signing keys` → Cloudsmith's signing-keys and npm registry pages.
10. `Cloudsmith changelog npm ECDSA signatures "npm audit signatures"` → Cloudsmith's changelog (Cosign for images; native signing for Docker, NuGet, Swift); nothing on npm ECDSA.
11. `empirical study package-lock.json "resolved" registry URLs third-party registries GitHub projects` → Gamage et al.; verdaccio#1300; AbsaOSS issues on `omit-lockfile-registry-resolved`; npm/npm#19578.

Not run, web search having stopped answering: `arxiv lockfile study npm yarn.lock "registry.yarnpkg.com" analysis`; `"npmmirror" OR "registry.npm.taobao.org" lockfile prevalence GitHub study`; `"lockfiles" empirical study JavaScript npm arXiv 2025 "package-lock.json" dependency resolution`.

### Brave Search

- `"npm audit signatures" artifactory` → JFrog's documentation anchors; npm/cli#8559, #9048; pnpm.io/cli/audit; pnpm#7909; semantic-release/npm#763; Stack Overflow 73765089; tutorials.
- `lockfile "resolved" registry mirror share github projects measurement npm` → npm/cli#7912, #3235, #2043, #9548; npm/feedback#544; Rin#10; AbsaOSS#103; npm/npm#19578, #20386; verdaccio#1300; bun#24245, #15448; yarn#4157.
- `"registry.npmmirror.com" lockfile share GitHub repositories count` → npm/cli#7912; cnpm/cnpm; amio/npm-mirrors (a list of mirrors from 2018, no data); npm-registry-firewall; local-npm; an unrelated post on secrets.
- `"registry.yarnpkg.com" yarn.lock percentage repositories analysis` → yarn#4157, #4645, #3755, #5854, #1756, #606, #6489, #889, #5891, #2566; Stack Overflow; blogs. No figures.
- `leaked internal npm registry URLs package-lock.json GitHub scan dependency confusion` → OWASP's npm cheat sheet; Birsan's post on dependency confusion; Snyk posts; a Microsoft post of 2026-05-29; a HackerOne post. No survey of lockfile hosts.
- `artifactory hostnames exposed "package-lock.json" research` → n26-hunt#51; npm/cli#8319; Stack Overflow 58030867, 55289329; a Sonar community thread; a Safeguard post on lockfile injection. No survey.
- `empirical study npm lockfiles resolved URL hosts registries` → Gamage et al.; AbsaOSS#103, #104; npm/cli#6896, #1941; pnpm#1827; bun#15448; a Verdaccio post of 2018; Bytesafe's documentation. No measurement.

Not run, Brave having answered with a block page from then on: `survey percentage developers use private npm registry proxy Artifactory Nexus`; `"/-/npm/v1/keys" registry support verdaccio nexus codeartifact "github packages"`; `"npm audit signatures" "private registry" skipped keys`; `"npm audit signatures" mirror proxy registry signatures missing`; `npmmirror "audit signatures"`; `"registry.yarnpkg.com" "audit signatures"`; `"registry signatures" third-party registries support comparison npm`; `"audit signatures" "found no dependencies to audit that were installed from a supported registry"`; `Gemfury npm "audit signatures"`; `CodeArtifact npm "dist.signatures"`; `Nexus Repository npm "audit signatures" support`; `GitHub Packages npm registry "registry signatures" support`; `Azure Artifacts npm "audit signatures"`; `Sonatype "State of the Software Supply Chain" repository manager npm proxy percentage`; `JFrog "Software Supply Chain" report npm remote repositories percentage`; `npm survey "private registry" percent respondents`; `lockfile analysis GitHub "registry.npmjs.org" "registry.yarnpkg.com" share of resolved URLs`; `"resolved" URLs lockfiles GitHub dataset registry hosts npmmirror taobao count`; `yarn "registry.yarnpkg.com" signing keys npm signatures Cloudflare mirror`; `"verdaccio" "audit signatures" uplink signatures keys`; `"cnpmcore" signatures keys endpoint`; `lockfile-lint allowed hosts registries yarn npm verdaccio`.

Bing returned unrelated results; Google served no results page; DuckDuckGo and Startpage answered with a captcha; Mojeek with 403; scholar.archive.org with a challenge. dblp timed out on all 14 queries (`npm mirror`, `package mirror`, `registry mirror`, `mirrors package managers`, `lockfile`, `lock file dependencies`, `npm registry signatures`, `software signing registries`, `package registry security`, `npm private registry`, `dependency confusion`, `artifact repository manager`, `npm provenance`, `npm audit`). Semantic Scholar answered 429 to all 10 (`npm mirror registry`, `package registry mirrors security empirical`, `mirror registries malicious packages npm PyPI`, `lockfile analysis npm GitHub projects`, `npm registry signatures verification`, `private package registry npm usage enterprise`, `dependency confusion npm private registry measurement`, `package-lock.json resolved field analysis`, `yarn.lock empirical analysis`, `software supply chain artifact repository manager Artifactory Nexus`); two lookups of Gu et al. went through, its record and the papers citing it, none about keys, signatures or the use of mirrors.

### GitHub issues and pull requests

npm/cli:
- `"audit signatures" registry` → #10018, #9242, #9277, #8559, #8556, #7266, #7279, #5479.
- `"audit signatures" nexus`, `… artifactory`, `… verdaccio`, `… mirror`, `… proxy`, `… github packages`, `… codeartifact`, `… yarnpkg`: (0) each.
- `"audit signatures" keys` → #10018, #9277, #5479. `"npm/v1/keys"` → #10018, #8066, #5479. `"audit signatures" skipped` → #10018.
- `"no dependencies to audit"` → #10018 and unrelated issues. `"dist.signatures"` (0).
- `"Fetching verification keys using TUF failed"` → #9277. `tuf-repo-cdn.sigstore.dev audit`, `audit signatures TUF proxy`, `… offline`, `… E401`, `… E403`: (0) each.
- `"missing registry signatures"` → #10018, #9242, #7280, #9048, #8559, #8556.

All of GitHub:
- `"audit signatures" -repo:npm/cli` → yarnpkg/berry#6487, pnpm/pnpm#13638, semantic-release/exec#412, and many projects' CI issues.
- `"npm/v1/keys" -repo:npm/cli` → nodejs/corepack#884, #620, #616, #612, #627; dependabot-core#15567; npm/documentation#1237; git-agentic/pkg-registry#34, #40; NodeSecure/npm-registry-sdk#179; oven-sh/bun#30337; others unrelated.
- `"audit signatures" artifactory` (0); `… nexus` (1, unrelated); `… verdaccio` (1, unrelated); `… mirror` (unrelated only).
- `"audit signatures" "private registry"` → poe-platform/poe-code#515, unrelated.
- `"EMISSINGSIGNATUREKEY"` → nathanswavely/patchwork#324, vaultcompasshq/conductor#36, npm/cli#8066.
- `"missing registry signatures" registry` → npm/cli#10018 and unrelated issues.
- `"no dependencies to audit that were installed from a supported registry"` → npm/cli#10018 and unrelated issues.
- `"npm.pkg.github.com" "audit signatures"`, `"codeartifact" "audit signatures"`, `"pkgs.dev.azure.com" "audit signatures"`, `"npm.fury.io" signatures`, `"cloudsmith" "audit signatures"`: (0) each.
- `"npmmirror.com/-/npm/v1/keys"`, `"yarnpkg.com/-/npm/v1/keys"`, `"npm.pkg.github.com/-/npm/v1/keys"`, `"codeartifact" "npm/v1/keys"`, `"-/npm/v1/keys" mirror`, `"npm/v1/keys" "not found"`: (0) each; `"-/npm/v1/keys" 404`, noise.
- `registry.npm.taobao.org lockfile` → users' issues (yarn, pnpm#3744, nuxt), no counts.
- `lockfile-lint allowed-hosts` → projects adopting it.
- `"resolved" registry lockfile prevalence` (0).
- `"has a registry signature with keyid"` → microsoft/reflect-metadata#166 (an expired npm key), unrelated.
- In the cnpm organisation: `npm.taobao.org package-lock` (0), `taobao lockfile domain` (0), `"registry.npm.taobao.org" 停止` (0), `npm.taobao.org 域名 停止解析` → cnpm/cnpm#361.

npm/rfcs:
- `signatures` → #76, #876, #916, #897, #860, #281, #877, #550, #488, #626, #666.
- `registry signatures` → #76, #550, #897, #626. `"v1/keys"` → #54, unrelated.
- `audit signatures`, `third-party registry signatures`, `mirror signature` → #550 and #626.

npm/documentation:
- `signatures` → #1237, #715, dependency updates. `audit signatures` (0). `v1/keys` → #1237.

Products and clients, each with `audit signatures`, `dist.signatures`, `npm/v1/keys`, `signing keys` and `ECDSA`:
- verdaccio/verdaccio → only #3294 and dependency updates.
- cnpm/cnpmcore, cnpm/cnpm, cnpm/npminstall → nothing relevant.
- yarnpkg/berry → #6487 only. yarnpkg/yarn → nothing on signatures.
- pnpm/pnpm → (0) at first; then `audit signatures` → #13733, #13638, #7909, #11405, #12663 and others.
- oven-sh/bun (0). sonatype/nexus-public (0).
- nodejs/corepack, `signature` → #884, #725, #10, #620, #495, #570, #46, #808, #616, #612, #631, #479, #537, #468 and others.

### GitHub discussions

- `"audit signatures"` → 124, release announcements or unrelated.
- `"npm/v1/keys"` (0).
- `"registry signatures" npm` → 30, among them verdaccio discussion #5514; the rest unrelated.
- `"dist.signatures"` → 2, unrelated. `npm signatures verdaccio` (0). `npm signatures artifactory` → 6, unrelated. `npm mirror signatures` → 110, unrelated.
- community/community: `npm.pkg.github.com audit signatures` → 1, unrelated. `GitHub Packages npm signatures` → 16, unrelated. `GitHub Packages npm provenance` → 33; npm's roadmap posts #208130, #196675 and #174507 opened, nothing on other registries or signatures. `npm.pkg.github.com keys` → 16, unrelated.
- npm/feedback: `signatures` (0), `mirror` (10, none on signatures), `"audit signatures"` (0).
- npm/rfcs: `signatures` → #464, #222, on PGP; `mirror` → #715, #690.

### GitHub code search

- `"/-/npm/v1/keys"`, first 100 → 27 repository and path pairs. Clients and verifiers: npm, pnpm, corepack, DataDog's go-attestations-verifier, git-pkgs/pin, NodeSecure's SDK. Registries and proxies that serve the endpoint: define42/ArtiGate (an air-gapped mirror that serves the upstream's keys), KonghaYao/npmflare, git-agentic/pkg-registry, mbianchidev/sendbox. No survey.
- `npm/v1/keys` in verdaccio/verdaccio (0) and in cnpm/cnpmcore (0). `signatures` in cnpm/cnpmcore → test data and TypeScript comments.
- `trusted-signature-keys` in npm/cli (0); `trusted-signature` (0); `paranoid` → `lib/utils/verify-signatures.js`.
- `"audit signatures" libraries.cgr.dev` (0); `"npm audit signatures"` in chainguard-dev/edu (0).
- `registry.npmmirror.com filename:bun.lock` → xxnuo/MTranServer and others.
- `registry.npmmirror.com filename:pnpm-lock.yaml` → TerryZ/SelectPage and others.

### GitLab, gitlab-org/gitlab's issues

- `audit signatures` → unrelated. `npm/v1/keys` (0).
- `npm registry signatures` → #591953; the rest unrelated.
- `npm signatures` → #591953, #404793 (Sigstore provenance for npm on GitLab CI); the rest unrelated.

### arXiv API

- `all:lockfile AND all:npm` → 2505.04834, 2609.24164.
- `all:lockfiles` → 2505.04834, 2510.00730, 2609.19920, others unrelated.
- `abs:"package-lock"` → unrelated.
- `all:npm AND all:mirror AND all:registry` → 2510.04964, 2409.15049.
- `all:npm AND all:registry AND all:signatures` → 2605.03309, 2011.02235, 2406.15596.
- `all:"registry signatures"` (0).
- `all:npm AND all:proxy AND all:registry` → 2510.04964, 2606.22593.
- `abs:"yarn.lock"` (0).
- `all:"dependency confusion"` → 2605.03309, 2511.01395, 2601.20638.
- `all:artifactory` (0).
- `all:"private registry"` → unrelated.
- `all:"package registry" AND all:mirror` (0).
- `all:"software repository" AND all:mirror AND all:security` (0).
- `all:mirrors AND all:npm` → 2409.09356, 2510.04964, 2409.15049.
- `all:"package mirror"` (0); `all:"registry mirror"` (0); `all:"mirror registry"` → 2409.15049.
- `ti:signing AND all:registries` → 2401.14635, 2510.04964, 2406.15596.
- `all:mirrors AND all:pypi` → 2309.11021, 2409.09356, 2409.15049 and others.
- `all:npm AND all:"resolved" AND all:lockfile` → 2505.04834.
- `all:"software signing" AND all:npm` → 2406.15596, 2510.04964.
- `all:"package managers" AND all:mirrors` → 2408.11631 and others, unrelated.
- `all:npm AND all:"tarball" AND all:registry` (0).
- `all:"npm audit"` → 2405.09074, 2601.20240, 2201.03981, 2203.13737.
- `ti:mirror AND abs:registry` → unrelated.
- `abs:"mirror registries"` → 2409.15049.
- `abs:"npm mirror"` (0); `abs:"registry mirrors"` (0); `abs:"package registries" AND abs:mirrors` (0); `abs:"lock files" AND abs:npm` (0).
- `abs:"lockfile" AND abs:javascript` → 2609.19920.
- `abs:"audit signatures"` → unrelated.
- `abs:"npm provenance"` (0).
- `abs:"Sigstore" AND abs:npm` → 2406.15596.

Abstracts read for 2505.04834, 2401.14635, 2510.04964, 2409.09356, 2409.15049, 2606.22593, 2605.03309 and 2601.20240; full texts for the five in the entries above, and for 2002.01139 and 2112.10165, neither of which measures mirrors or keys.

### OpenAlex

- `npm mirror registry` → 468; relevant: Duan et al. (NDSS 2021), OSCAR.
- `package registry mirrors security` → 6,910; relevant: Gu et al., Duan et al., Okafor et al. (SoK, 2022).
- `mirror registries malicious packages` → 1,111; relevant: Gu et al., Guo et al. (2023).
- `lockfile npm GitHub empirical` → 61; relevant: Gamage et al., Rahman et al. (ASE 2025, pinning against floating), a 2026 study of 400 repositories' lockfile histories, Malka et al.; none about hosts.
- `npm registry signatures` → 766, none relevant.
- `private npm registry` → 1,498, none relevant.
- `dependency confusion npm` → 1,383, none relevant.
- `package-lock.json` → 203; relevant: Kabir et al.; papers on SBOM accuracy.
- `yarn.lock`, `cnpm China npm mirror` → rate-limited.
- `Artifactory Nexus npm proxy` → 7; relevant: Kalu and Davis (2025), McCann (2026).
- `npm audit signatures` → 1,070, none relevant.
- `software signing npm registry` → 833; relevant: Zahan et al. (ICSE-SEIP 2022), Speranza (CCS 2023), Okafor et al.; none about mirrors or keys.
- `npmmirror` (0).
- By DOI: Gu et al. (closed access, no open copy), Duan et al., Zahan et al., Kabir et al., Rahman et al., "NPM architecture as an attack surface" (a 2026 review with no measurement), the 2026 lockfile-history study.

### Hacker News, through Algolia

`npm audit signatures` (8), `npm registry signatures ECDSA` (1), `npm mirror signatures` (8), `npm lockfile resolved registry` (4), `npmmirror` (52, mostly announcements of mirrors from 2013 to 2016), `npm registry mirror` (68), `private npm registry proxy signatures` (2), `Artifactory npm signatures` (2), `verdaccio signatures` (0). No measurement and no survey of registries.

### Pages read directly

npm's documentation (npm-audit, about and verifying registry signatures); GitHub's changelog of 2022-07-26; JFrog's npm repository documentation; Sonatype's npm registry and npm audit pages and its release notes for 2026 and 3.96; the npm documentation of GitHub Packages, CodeArtifact, Azure Artifacts, Cloudsmith, Gemfury, GitLab and Google Artifact Registry; npmmirror.com; Chainguard Academy; the Safeguard post; the landing pages of JFrog's and Sonatype's 2026 reports; OpenSSF's npm guide; Snyk's post on lockfile-lint. Not reachable: Yarn classic's statistics page (404), IEEE's page for Gu et al. (no content), scholar.archive.org (a challenge).
