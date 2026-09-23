# prior-art/go-supply-chain — sources and searches

Appendix to [go-supply-chain.md](go-supply-chain.md). Sweep of 2026-09-23 over four
modalities: 96 sources, 143 recorded searches. Every source listed here was opened unless the
entry says otherwise.


## academic

14 sources.

- **An Empirical Study of CGO Usage in Go Projects -- Distribution, Purposes, Patterns and Critical Issues** — Journal of Systems and Software, Volume 231 (Elsevier); arXiv preprint 2508.09875v1
  <https://arxiv.org/abs/2508.09875>
  2026 (JSS January 2026 issue; arXiv submitted 13 August 2025) · Q2 · partial
  Measured: Population: the top 1,000 most-starred Go repositories on GitHub (star range 2,159 to 90,488), retrieved via the GitHub API and deduplicated to 1,000 unique repositories, then filtered to remove archived, educational and stale repositories (last updated before January 2020), leaving 920 cloned repositories. Method: CGOAnalyzer, a purpose-built static analyzer, plus manual qualitative labelling by two authors using open card sorting. Results: 104 of 920 projects (11.3%) use CGO; 33 of 920 (3.2%) exceed 100 CGO function call sites; 60.58% of CGO projects have between 10 and 1,000 call sites and 5.8% exceed 1,000; most use CGO within a single package and fewer than 10 files. Separately, a manual labelling pass over all 101 files containing CGO code inside the top 20 most-starred CGO repositories produced 15 usage patterns in 6 categories, including the build-directive patterns LDFLAG 31.68% (32/101 files), CFLAG 12.87% (13/101), CPPFLAG 3.96% (4/101), PkgConfig 3.96% (4/101) and CXXFLAG 2.97% (3/101). Also: 10 of the 104 CGO projects (9.6%) use automated binding-generation tools; 4 of 56 modules cite performance as the stated reason for CGO. Denominators verified by extracting the PDF text and checking the arithmetic against the paper's own worked example (CType 'appears in 63 files, resulting in a frequency of 62.38%' -> n=101).
  Not measured: It analyzes only each project's own source: 'we excluded folders named vendor or test, as well as packages in Go projects whose names end with _test'. No transitive module dependencies are analyzed, so it cannot say what fraction of a real module graph invokes the C toolchain. It classifies which #cgo directive kinds appear but reports no distribution of flag VALUES — nothing about which -L, -l, -I, -D or linker arguments dependencies actually pass. It never frames flags as a supply-chain surface and does not mention CGO_ENABLED, assembly (.s files), //go:generate, or the CVE-2023-29404 class of LDFLAGS injection. The directive frequencies are file-level over 20 repositories, not project-level over 920, and must not be quoted as the latter.

- **GoSurf: Identifying Software Supply Chain Attack Vectors in Go** — SCORED '24 — Proceedings of the 2024 Workshop on Software Supply Chain Offensive Research and Ecosystem Defenses, co-located with ACM CCS 2024 (DOI 10.1145/3689944.3696166); authors Carmine Cesarano, Vivi Andersson, Roberto Natella, Martin Monperrus
  <https://arxiv.org/abs/2407.04442>
  2024 · Q2, Q4 · partial
  Measured: A taxonomy of 12 Go-specific attack vectors across three lifecycle phases — P1 static code generation (//go:generate), P2 testing functions, I1 global variable initialization, I2 initialization hooks, E1 constructor methods, E2 reflection, E3 interface polymorphism, E4 unsafe pointers, E5 CGO static code linking, E6 assembly static code linking, E7 dynamic library linking, E8 dynamic external execution — implemented as a static analyzer over the Go AST. Evaluation: 11 hand-picked popular modules selected by number of dependents, with per-vector occurrence counts (kubernetes E5=803, E6=1,495, P1=119, E8=230; go-ethereum E5=21, E6=12, P1=34; terraform E5=0, E6=0, P1=38, E8=17; ginkgo E5=2; vault, prometheus, coredns, testify, logrus, cobra, go-textseg all E5=0 and E6=0), plus a bias-check run over 'the top 500 most imported packages' by dependent count, sourced from libraries.io, which 'obtain[ed] the same findings'. States the mechanism directly for P1: 'Generators can execute arbitrary shell commands, allowing attackers to insert malicious code into the directive to be directly executed.'
  Not measured: Counts occurrences of language constructs inside one module at a time; it does not aggregate attack surface across a build's transitive module graph, and the per-vector breakdown for the 500-module sample is not reported. It does not analyze #cgo CFLAGS/LDFLAGS or any compiler or linker flag, does not distinguish a construct that is merely present from one that causes the C toolchain to run at build time, and never mentions GOTOOLCHAIN or the go.mod toolchain directive. It is an attack-surface taxonomy, not an ecosystem census.

- **Uncovering the Hidden Dangers: Finding Unsafe Go Code in the Wild** — TrustCom 2020 — 19th IEEE International Conference on Trust, Security and Privacy in Computing and Communications; authors Johannes Lauinger, Lars Baumgaertner, Anna-Katharina Wickert, Mira Mezini (TU Darmstadt)
  <https://arxiv.org/abs/2010.11242>
  2020 · Q2 · adjacent
  Measured: Population: the top 500 most-starred open-source Go projects on GitHub, filtered to the 343 that support Go modules. Method: 'we used the Go tool chain to identify the root module of each project. This is the module defined by the top-level go.mod file in the project. Then we enumerated the dependencies of the project, and built the dependency tree.' Results: 131 of 343 projects (38.19%) have at least one unsafe usage within the project code itself, while 312 of 343 (90.96%) have at least one non-standard-library dependency with unsafe usage somewhere in the dependency tree. 1,400 code samples manually analyzed. This is the methodological template Q2 needs — own-code prevalence beside transitive-graph prevalence, resolved with the real Go toolchain — applied to the wrong construct.
  Not measured: Measures the unsafe package, not cgo. cgo appears only once, as a category label in the taxonomy of why unsafe is used ('The foreign function interface (FFI) class contains interoperability with C code (CGo)'), and CGO prevalence, #cgo directives, flags and build-time C compilation are never measured. Predates Go 1.21 by three years, so it says nothing about Q3. Reports no module owner or publisher counts.

- **How Deep Does Your Dependency Tree Go? An Empirical Study of Dependency Amplification Across 10 Package Ecosystems** — arXiv preprint 2512.14739 (cs.SE), no venue; single author Jahidul Arafat
  <https://arxiv.org/abs/2512.14739>
  2025 (submitted 12 December 2025) · Q1, Q4 · adjacent
  Measured: Population: 'We collected 50 projects from each ecosystem totaling 500 projects', across Maven Central, npm, crates.io, PyPI, NuGet, RubyGems, Go Modules, Packagist, CocoaPods and Pub; 'Projects were sampled from popular packages to ensure relevance and representativeness.' Measures dependency amplification, 'the ratio of transitive to direct dependencies'. Go row: direct 7.7 +/- 13.7, transitive 27.3 +/- 41.8, total 34.9 +/- 49.3, amplification 4.48x — against Maven 24.70x, npm 4.32x and CocoaPods 0.32x. Definition applied to all ecosystems: 'Direct dependencies are packages explicitly declared in the project's manifest file. Transitive dependencies are all packages recursively required by direct dependencies, resolved using native package manager tooling.' For Go, direct means entries in go.mod.
  Not measured: Counts no publishers, maintainers, owners or organizations anywhere — the actor behind a dependency is simply not a unit in this paper, which is precisely what Q1 asks for. The Go resolution method is stated only as 'For Go Modules, we parsed go.mod files', with no indication that MVS was run (as `go list -m all` would), so the transitive figure may be recursive manifest parsing rather than a resolved build list; 50 projects per ecosystem with a large standard deviation relative to the mean (27.3 +/- 41.8) makes the Go estimate unstable. The threats-to-validity section names no Go-specific limitation. Single-author preprint with no peer review.

- **On Good Authority: Release-Authority Measurement for Registry-Mediated Package Ecosystems** — arXiv preprint 2606.22593 (cs.SE), no venue; author Igor Santos-Grueiro
  <https://arxiv.org/abs/2606.22593>
  2026 (submitted 21 June 2026, revised 30 June 2026) · Q1, Q4 · adjacent
  Measured: Defines release authority as the path by which code reaches users — publisher account, repository, workflow, provenance, signing keys, publication mediation — and measures how that path changes between a release and its immediate predecessor while downstream exposure stays constant. Main corpus: 45,812 releases across npm, PyPI, Maven Central, crates.io and RubyGems, April 2024 to June 2026, with 43,100 eligible predecessor comparisons over 942 package coordinates. Go is handled separately: 'We report Go separately as a VCS/proxy/checksum-log boundary adapter' and 'The Go boundary adapter adds 7,123 releases and 6,653 eligible comparisons. Keeping Go separate keeps the main denominator aligned with registry-publisher semantics.' For Go the evidence recorded is module path, VCS tag, proxy and sumdb — 'Go uses VCS origin, module-proxy observation, and checksum-log evidence under a different authority regime.' This is the only paper found that treats Go's lack of publisher accounts as a first-class measurement problem.
  Not measured: Measures authority CHANGE per release against a predecessor, not a count of distinct owners behind any project's dependency graph, and not the fraction of them absent from go.mod. It does not state how a Go module's owner would be derived from host and path, and reports no per-project or per-graph owner count. Go is deliberately excluded from the main denominator, so no Go figure is comparable to the five-registry results. Preprint, no venue.

- **Beyond Takedown: Measuring Malicious Go Module Persistence in the Wild** — arXiv preprint 2606.26291 (cs.CR); authors Minjae Bae, Carter Yagemann
  <https://arxiv.org/abs/2606.26291>
  2026 (submitted 24 June 2026) · Q4, Q1 · exists
  Measured: An automation-driven supply-chain campaign in which attackers 'repackage legitimate Go modules under attacker-controlled owners, and embed them with obfuscated code for an import-triggered downloader'. Two populations: a manual GitHub search and stargazer pivot over 2,113 repositories (March-June 2025), and a large-scale scan of index.golang.org — 12,304,230 raw records collected July 2024 through mid-July 2025, deduplicated to 573,113 unique items and narrowed to 60,232 suspicious candidates — using GOAST, a custom deobfuscating AST scanner. The index was chosen deliberately: 'turning to this public registry allowed us to circumvent the heavy restrictions of the GitHub API while ensuring our data remains fully reproducible.' Results: 2,289 malicious module versions identified; 684 malicious repositories removed by GitHub after disclosure; 1,377 module versions remediated by the Go team; and the headline persistence figure, '1,577 of these 1,586 artifacts (99.4%) were proxy-retrievable in July' among artifacts that had become GitHub-unobservable, with '74 out of 74 (100%)' in the manually confirmed subset. Explains the mechanism: 'Once a module version of a malicious variant is published and cached, its immutability, which guarantees reproducibility, can make it persist over time.' Also derives module owners from repository paths and characterizes them for automation fingerprinting: '84.7% contain 11-13 lowercase characters'. Notes the build-execution premise: 'In Go, package-level variable initializers execute implicitly and in declaration order when a package is imported'.
  Not measured: Does not discuss typosquatting — the campaign is repackaging under different owner accounts, not name confusion. Says nothing about cgo, //go:generate, the C toolchain or GOTOOLCHAIN. The owner derivation is applied to attacker accounts for fingerprinting, never to count how many distinct owners a legitimate build trusts, and no per-project owner count appears. Does not measure checksum-database coverage, GOPRIVATE/GONOSUMDB, retraction, or vanity import paths. The authors note the footprint is a temporal snapshot, not an exhaustive campaign inventory. Preprint, no venue.

- **A Large-Scale Empirical Study on Semantic Versioning in Golang Ecosystem** — ASE 2023 — 38th IEEE/ACM International Conference on Automated Software Engineering (DOI 10.1109/ASE56229.2023.00140); authors Wenke Li, Feng Wu, Cai Fu, Fan Zhou
  <https://arxiv.org/abs/2309.02894>
  2023 · Q4, Q1 · adjacent
  Measured: Builds 'the first large-scale Go dataset with a dependency graph from GitHub'. Collection, verbatim: 'We use official Search API published by GitHub to crawl Go repositories. For repositories with more than 100 stars, keyword Star is used to order the query response during pagination. Otherwise... we add another keyword CreateTime to order the query response', and 'Finally, we only reserve repositories with stars greater than five.' Window September 2018 (Go 1.11, the module system's launch) to April 2023. 102,420 repositories collected, 29,095 valid after cleaning, yielding 5,604 third-party library repositories with 124,532 versions and 23,929 client repositories with 532,832 versions. Graph extraction: 'we parse the go.mod file of each repository, analyze the module field and the require field.' This is the census and dependency-graph dataset that the Q1 owner derivation would be built on.
  Not measured: Reports no count of distinct GitHub owners or organizations, and no per-project direct-versus-transitive dependency statistics — the module path is parsed as a string, never resolved to a controlling party. Does not touch the module proxy, the checksum database, GOPRIVATE, module deletion or vanity import paths. Its subject is SemVer compliance, not supply chain. GitHub-only, stars-above-five frame, which excludes non-GitHub hosts and the long tail; predates Go 1.21, so it cannot bear on Q3.

- **Empirical Analysis of Vulnerabilities Life Cycle in Golang Ecosystem** — ICSE 2024 — 46th IEEE/ACM International Conference on Software Engineering (DOI 10.1145/3597503.3639230); authors Jinchang Hu, Lyuye Zhang, Chengwei Liu, Sen Yang, Song Huang, Yang Liu and others
  <https://arxiv.org/abs/2401.00515>
  2024 · Q4 · exists
  Measured: The vulnerability life cycle across the Go module ecosystem, built by 'gathering data from diverse sources'. Headline: '66.10% of modules in the Golang ecosystem were affected by vulnerabilities', with two distinct kinds of lag identified that impede the propagation of vulnerability fixes. Frames the structural point that matters for this sweep: Go 'employs a decentralized mechanism for managing dependencies, whereby dependencies are upheld and distributed in separate repositories' — which is exactly why Go has no publisher accounts and why Q1's owner derivation is needed at all.
  Not measured: The abstract page does not disclose the dataset size, the collection route (index, proxy or GitHub crawl) or the filtering, so the population and sample could not be confirmed from what I opened. Does not measure the module proxy or the checksum database as infrastructure, does not count module owners or publishers, and says nothing about cgo, build-time execution or the toolchain directive. Published four months after Go 1.21, but predates any toolchain-directive adoption worth measuring.

- **Hero: On the Chaos When PATH Meets Modules** — ICSE 2021 — IEEE/ACM International Conference on Software Engineering; authors Ying Wang, Liang Qiao, Chang Xu, Yepang Liu, Shing-Chi Cheung, Na Meng, Hai Yu, Zhiliang Zhu
  <https://arxiv.org/abs/2102.12105>
  2021 · Q4 · adjacent
  Measured: The consequences of Go's two coexisting library-referencing modes, GOPATH and Go modules: 'The heterogeneous use of library-referencing modes across Golang projects has caused numerous dependency management issues, incurring reference inconsistencies and even build failures.' Population 19,000 popular Go projects, of which 2,356 had confirmed dependency-management issues; the Hero tool achieved 98.5% detection on their benchmark and surfaced 2,422 newly identified issues, of which 280 were reported, 181 confirmed (64.6%) and 160 fixed or under fix (88.4%). The one ecosystem-scale empirical study of how Go actually resolves what it builds.
  Not measured: Concerns resolution correctness and build failure, not trust: no owner or publisher counts, no proxy or checksum-database measurement, no cgo or build-time execution, no typosquatting or deletion. Predates Go 1.21 by more than two years, so it cannot bear on Q3, and predates module graph pruning (Go 1.17), so its resolution findings describe an older go command.

- **GoLeash: Mitigating Golang Software Supply Chain Attacks with Runtime Policy Enforcement** — arXiv preprint 2505.11016 (cs.CR); authors Carmine Cesarano, Martin Monperrus, Roberto Natella
  <https://arxiv.org/abs/2505.11016>
  2025 (submitted 16 May 2025) · Q2, Q4 · adjacent
  Measured: Not a measurement of the ecosystem. Proposes runtime least-privilege enforcement at package granularity inside a Go process, detecting malicious packages more precisely than container or process sandboxing and remaining effective under code obfuscation, with stated acceptable runtime overhead. Relevant here only as evidence of where the Go supply-chain research community has put its effort: on runtime containment of imported package behaviour.
  Not measured: Enforces at runtime, not build time — cgo, //go:generate, assembly and C toolchain invocation are outside its model, as is GOTOOLCHAIN. Reports no ecosystem population, no module counts, no publisher or owner statistics. Preprint, no venue.

- **Small World with High Risks: A Study of Security Threats in the npm Ecosystem** — USENIX Security Symposium 2019; authors Markus Zimmermann, Cristian-Alexandru Staicu, Cam Tenny, Michael Pradel
  <https://arxiv.org/abs/1902.09217>
  2019 · Q1 · adjacent
  Measured: The npm analogue Q1 names, over npm to April 2018 (676,539 packages, 199,327 maintainers): 'Installing an average npm package introduces an implicit trust on 79 third-party packages and 39 maintainers'; 'The average npm package transitively relies on code published by 40 maintainers. Popular packages rely on only 20'; and that roughly 20 maintainers can reach more than half the ecosystem. Establishes the unit of analysis — the party who can push code, not the package — that Q1 asks be carried to Go.
  Not measured: npm only, with no Go replication found among the citing works screened. Counts per package resolved from the registry graph, not per real project from a committed manifest or lockfile, and never reports the ratio to what a project itself declares. Takes the registry maintainer field as identity, which has no Go equivalent — Go has no publisher accounts — so the method does not transfer without the host-and-path owner derivation that Q1 describes and that nobody has published.

- **Beyond Typosquatting: An In-depth Look at Package Confusion** — USENIX Security Symposium 2023 (32nd); authors Shradha Neupane (WPI), Grant Holmes, Elizabeth Wyss, Drew Davidson (Kansas), Lorenzo De Carli (Calgary)
  <https://www.usenix.org/system/files/usenixsecurity23-neupane.pdf>
  2023 · Q4 · adjacent
  Measured: 'the first comprehensive categorization of the mechanisms used to induce confusion': 13 rigorously defined categories of confusion mechanism derived by qualitative analysis from a dataset of 1,200+ documented attacks, showing that attackers work at semantic rather than merely syntactic level. Detectors for each category were then evaluated on the entire npm package set, validated by an online survey (77% of matches marked potentially or highly confusing, 18% highly confusing; about 1 warning per 100M+ package pairs). The reference point for what a Go typosquatting measurement would have to look like.
  Not measured: Does not cover Go. I extracted the PDF text and grepped it: zero occurrences of 'Go modules', 'Golang', 'go.mod' or 'goproxy', and the ecosystem mentions are npm (47), PyPI (18), RubyGems (11) and Cargo (2). Detectors are evaluated on npm alone. So the Go typosquatting sub-question of Q4 has no academic prior art, and this paper is the evidence that the leading work in the area deliberately did not reach Go.

- **Signing in Four Public Software Package Registries: Quantity, Quality, and Influencing Factors** — IEEE Symposium on Security and Privacy (S&P) 2024; lead author Taylor R. Schorlemmer et al.
  <https://arxiv.org/abs/2401.14635>
  2024 · Q4 · adjacent
  Measured: Longitudinal analysis of 475,000 packages from 2015 to 2023 across four registries — Maven Central, PyPI, DockerHub and Hugging Face — on signature quantity and quality. Findings: registry mandates are the primary driver of adoption, dedicated tooling drives signature validity, and starting is the hard part. Identifies a quality gap in PGP-based systems from public-key discovery failures.
  Not measured: Go is not one of the four registries, so Go's checksum database and transparency log are outside the study entirely. This is the nearest thing to an academic measurement of package-authentication infrastructure, and it skips the one ecosystem where authentication is mandatory by default — which is why Q4's sumdb-coverage sub-question has no answer.

- **Mutating the "Immutable": A Large-Scale Study of Git Tag Alterations** — ACM Conference on Reproducibility and Replicability (ACM REP) 2026, July 2026, Delft; authors Solal Rapaport, Laurent Pautet, Samuel Tardieu, Stefano Zacchiroli, Theo Zimmermann (IP Paris, LTCI)
  <https://arxiv.org/abs/2606.31354>
  2026 · Q4 · adjacent
  Measured: 'Git tags are commonly viewed as immutable references in software development, marking releases and specific repository states that underpin build reproducibility and software supply-chain integrity.' Population: 328.4 million repositories in Software Heritage, in which 10.2 million tag alterations were identified across 189,000 unique repositories, cross-validated against Nixpkgs (32 packages referencing altered tags, 7 confirmed build failures). Bears on Q4's module-deletion sub-question because a Go module version is a VCS tag, and an altered tag is what produces a go.sum mismatch against a proxy-cached copy.
  Not measured: Not Go-specific: the abstract and metadata I opened contain no mention of Go modules, the module proxy, go.sum or checksum mismatch, and quantify no Go module versions affected. A search snippet attributed the google/go-containerregistry v0.20.4 delete-and-recreate incident to this paper; I could not confirm that from the abstract page and am not carrying the claim. It measures tag mutation upstream of any ecosystem, so it cannot say what the Go proxy did in response.

### Searches run

- `web search :: empirical study Go module ecosystem dependency graph MSR mining software repositories`
- `web search :: Go modules implicit trust maintainers transitive dependencies measurement arXiv`
- `web search :: cgo CFLAGS LDFLAGS security empirical study Go build C toolchain`
- `web search :: GOTOOLCHAIN Go 1.21 toolchain download supply chain security`
- `web search :: Go module proxy checksum database transparency log empirical measurement GONOSUMDB GOPRIVATE`
- `web search :: "go.mod" toolchain directive measurement modules study empirical 2025 OR 2026`
- `web search :: Go module typosquatting malicious packages measurement study USENIX OR NDSS OR CCS`
- `web search :: "vanity import path" OR "custom import path" Go modules security measurement domain expiration`
- `web search :: arXiv Go modules "implicitly trusted" OR "trusted maintainers" OR "module owners" dependency graph count`
- `web search :: dblp Go modules supply chain empirical study MSR 2024 2025 dependency`
- `web search :: "Go" ecosystem study "sum.golang.org" OR "checksum database" academic paper measurement coverage`
- `web search :: GoSurf attack surface Go packages static analysis taxonomy 12 attack vectors`
- `web search :: arXiv "toolchain" go.mod "GOTOOLCHAIN" empirical OR measurement OR analysis paper`
- `web search :: compiler toolchain distribution supply chain attack rustup nvm GOTOOLCHAIN academic study code delivery path`
- `web search :: "go:generate" OR "cgo" supply chain attack vector build time code execution measurement study`
- `web search :: deps.dev Google Open Source Insights Go modules dependency graph research paper measurement`
- `web search :: Go modules "repository owner" OR "GitHub organization" concentration dependency ecosystem empirical study`
- `web search :: Go module index census pkg.go.dev number of modules measurement study dataset`
- `web search :: arxiv 2026 Go module ecosystem measurement proxy.golang.org index.golang.org study modules published`
- `web search :: Go module retraction deletion "module proxy" immutability empirical study left-pad equivalent`
- `web search :: Semantic Scholar Go programming language package ecosystem security measurement 2026 modules`
- `web search :: Schorlemmer signing public software package registries quantity quality influencing factors Go modules sigstore`
- `web search :: arxiv listing "Go modules" OR "Golang" software engineering 2026 dependency study cs.SE`
- `web search :: "dependency confusion" OR "module hijacking" Go modules abandoned domain takeover measurement academic paper`
- `web search :: how many distinct maintainers behind Go build transitive trust count study "go.mod" publishers`
- `web search :: scholar.google GOTOOLCHAIN OR "toolchain directive" Go research paper security analysis 2024 2025 2026`
- `web search :: "GOPRIVATE" OR "GONOSUMDB" OR "GOFLAGS" measurement study configuration disable verification Go empirical`
- `web search :: Go module owner concentration "top publishers" OR "organizations" control fraction ecosystem paper`
- `web search :: GOTOOLCHAIN [restricted to arxiv.org, dl.acm.org, ieeexplore.ieee.org, usenix.org, semanticscholar.org, dblp.org]`
- `web search :: Go modules owner entity resolution host path github.com organization dependency trust surface measurement [restricted to arxiv.org, dl.acm.org, ieeexplore.ieee.org, usenix.org, semanticscholar.org, dblp.org]`
- `web search :: Go modules vendor directory reproducible builds SBOM empirical study measurement ecosystem [restricted to arxiv.org, dl.acm.org, ieeexplore.ieee.org, usenix.org]`
- `web search :: "cgo" OR "CGO_ENABLED" prevalence dependencies ecosystem-wide scan modules percentage build C [restricted to arxiv.org, dl.acm.org, ieeexplore.ieee.org, usenix.org, semanticscholar.org]`
- `web search :: measure transitive dependencies cgo usage Go module graph "go list" all dependencies C compiler invoked build`
- `web search :: Go module ecosystem growth number of modules published per year academic measurement index.golang.org census`
- `web search :: "forward compatibility" Go toolchain switching measurement modules "toolchain line" go.mod prevalence`
- `web search :: "repojacking" Go proxy zombie modules deleted GitHub accounts 63386 measurement VulnCheck academic`
- `web search :: "Go" modules study number of distinct repositories hosts "github.com" fraction dependency graph ecosystem 2025 mining [restricted to arxiv.org, dl.acm.org, ieeexplore.ieee.org]`


## industry

25 sources.

- **Go Toolchains (language reference)** — The Go Programming Language (go.dev), Google / Go team — primary source
  <https://go.dev/doc/toolchain>
  current, documents behaviour since Go 1.21 (2023) · Q3, and Q4 for the GOPRIVATE/GONOSUMDB interaction · adjacent
  Measured: Not a measurement. Normative specification of toolchain selection and download.
  Not measured: Gives no counts of modules naming a toolchain, no download volumes, no failure statistics. Read verbatim: toolchains are 'packaged as special modules with module path golang.org/toolchain and version v0.0.1-goVERSION.GOOS-GOARCH'; 'toolchain downloads fail for lack of verification if GOSUMDB=off. GOPRIVATE and GONOSUMDB patterns do not apply to the toolchain downloads'; '$GOROOT/go.env file sets the default GOTOOLCHAIN=auto'; '<name>+path disables the download fallback'.

- **Forward Compatibility and Toolchain Management in Go 1.21** — The Go Blog — Russ Cox
  <https://go.dev/blog/toolchain>
  2023-08-14 · Q3 · adjacent
  Measured: Not a measurement. Announcement and rationale.
  Not measured: Contains no adoption numbers and no version-distribution data. On security it says only that toolchains are downloaded 'as Go modules, inheriting all the security and privacy benefits of modules'; it does not itself spell out the checksum-database path or state that GOTOOLCHAIN=auto is the shipped default.

- **Proposal: Extended forwards compatibility in Go (design/57001-gotoolchain.md)** — golang/proposal — Russ Cox
  <https://go.googlesource.com/proposal/+/master/design/57001-gotoolchain.md>
  December 2022 (predates Go 1.21's August 2023 release) · Q3 · adjacent
  Measured: Not a measurement. Design document; the earliest primary artifact for Q3.
  Not measured: No ecosystem statistics. States the verification intent — 'Each Go release would be treated as a set of module versions, downloaded like any module, and checked against the checksum database before being used' — and the defaults: releases default to GOTOOLCHAIN=auto, development toolchains from make.bash default to GOTOOLCHAIN=local. Does not enumerate failure behaviour when a download is unavailable.

- **Go Telemetry — published charts (gopls/gotoolchain counter)** — Google / Go team — live aggregate telemetry
  <https://telemetry.go.dev/>
  read for week 2026-09-21 · Q3, and Q4 as an example of what the Go team does and does not instrument · partial
  Measured: Population: systems that have opted in to Go telemetry and run gopls. Sample: one week's uploaded reports. Method: approved event counters, weekly aggregation. Result read off the page for week 2026-09-21: gopls/gotoolchain auto 4050, local 114, other 63, path 0. For context on the same page, gopls/goversion for that week runs 1.16 through 1.30 with 1.26 (1667) and 1.27 (1133) dominant.
  Not measured: Measures the GOTOOLCHAIN setting among gopls users, not modules that name a toolchain, not toolchain downloads, not where they are fetched from or how they verify. The chart index confirms cmd/go has no toolchain counter at all — its counters are go/invocations, go/build/flag, go/build/flag/buildmode, go/vcs, go/goexperiment, go/platform/host/darwin/major-version, go/platform/target/port, plus GOOS/GOARCH/GoVersion — and there is no module-download or cgo counter anywhere.

- **Go Toolchain Distribution Security: How go.mod Pins Your Compiler** — Safeguard.sh Inc. — vendor blog, author listed as Shadab Khan, Security Engineer
  <https://safeguard.sh/resources/blog/go-toolchain-distribution-security>
  2026-03-06 · Q3 · adjacent
  Measured: Nothing. No population, no sample, no percentages anywhere in the article; it is an explainer attached to a product pitch.
  Not measured: Does not measure adoption of the toolchain directive. It also contradicts the primary source: it claims 'If GOSUMDB is set to off, or if GONOSUMCHECK is non-empty, the toolchain download is fetched without checksum verification', whereas go.dev/doc/toolchain says such downloads fail for lack of verification when GOSUMDB=off, and GONOSUMCHECK is a pre-1.13 vestige. Its correct observations (toolchain module path golang.org/toolchain, unpacked under $GOPATH/pkg/mod, GOTOOLCHAIN default auto) are restatements of the Go docs.

- **How Go Mitigates Supply Chain Attacks** — The Go Blog — Filippo Valsorda
  <https://go.dev/blog/supply-chain>
  31 March 2022 as listed on the go.dev blog index · Q2, Q4 · adjacent
  Measured: Nothing. No sample, no corpus, no figures.
  Not measured: This is the canonical statement of the design goal Q2 interrogates — 'It is an explicit security design goal of the Go toolchain that neither fetching nor building code will let that code execute, even if it is untrusted and malicious' — and it is silent on cgo, //go:generate, the build cache, GOPRIVATE and the proxy. It notes that 'any package that contributes to a build can define an init function' and that 'modules that don't contribute code to a specific build have no security impact on it', and describes the checksum database as 'a global append-only cryptographically-verifiable list of go.sum entries'.

- **Go fixes its 7th code execution bug in the same feature** — Mattermost — Juho Forsen
  <https://mattermost.com/blog/go-fixes-its-7th-code-execution-bug-in-the-same-feature/>
  2024-05-08 · Q2 · adjacent
  Measured: Measures the mechanism, not the ecosystem. Method: review of the go command's cgo flag allowlist and its vulnerability history. Figures: the allowlist 'has since grown to 172 entries in Go 1.22.3', touched by 25 commits, up from an original 41 entries. Enumerates seven arbitrary-code-execution CVEs in cgo CFLAGS/LDFLAGS handling: CVE-2018-6574, CVE-2020-28366, CVE-2020-28367, CVE-2023-29404, CVE-2023-29405, CVE-2023-39323, CVE-2024-24787.
  Not measured: No corpus of modules is analysed. It does not count how many modules use cgo, what flags they pass, or how much of any real dependency graph invokes the C toolchain. It also argues the practical exposure is narrow — 'you're only vulnerable if you build code from untrusted sources without intending to ever execute it' — which is an argument, not a measurement.

- **Bringing Capslock analysis to deps.dev** — Open Source Insights (deps.dev) blog, Google Open Source Security Team — Jess McClintock and John Dethridge
  <https://blog.deps.dev/capslock/>
  2024-07-09 · Q2, Q4 · adjacent
  Measured: Two ecosystem-scale claims with no stated population or sample: 'Our analysis found that less than 2% of version updates for packages will introduce a new capability requirement', and 'Interestingly, a whopping 9% of Go packages have a transitive dependency using os/exec!'. Method described only as running Capslock centrally over Go packages on deps.dev, with results split by whether the standard library was called directly or via a transitive dependency.
  Not measured: States no N, no corpus definition and no date range, so it is a product claim rather than a measurement by the rules of this sweep. Publishes nothing about CGO despite Capslock computing CAPABILITY_CGO per version, nothing about build-time toolchain invocation, and nothing about compiler or linker flags. Also caveats that 'the analysis results are build specific', so OS-conditional code may not appear.

- **Capslock capability list (docs/capabilities.md)** — google/capslock — Google, tool documentation
  <https://raw.githubusercontent.com/google/capslock/main/docs/capabilities.md>
  current (tool launched 2023) · Q2 · adjacent
  Measured: Not a measurement. Defines the capability taxonomy, including CAPABILITY_CGO ('Identifies calls that execute native code via Go's Cgo mechanism'), CAPABILITY_EXEC, CAPABILITY_UNSAFE_POINTER and CAPABILITY_ARBITRARY_EXECUTION.
  Not measured: Establishes that the per-package-version CGO signal is computed for the Go corpus on deps.dev and could be aggregated; no aggregate has been published. Also note CAPABILITY_CGO is about calling into native code at runtime, not about whether a build shells out to the C toolchain, so even the unpublished aggregate would not fully answer Q2.

- **Capslock: What is your code really capable of?** — Google Online Security Blog — Jess McClintock, John Dethridge (Google Open Source Security Team) and Damien Miller (Enterprise Infrastructure Protection Team)
  <https://security.googleblog.com/2023/09/capslock-what-is-your-code-really.html>
  2023-09-15 · Q2 · adjacent
  Measured: Nothing. Launch announcement for the alpha; contains no figures, no corpus and no sample.
  Not measured: States the intent to 'apply Capslock at scale and make capability information for open source packages broadly available in various community tools like deps.dev', which is the plan the July 2024 deps.dev post delivers on. No cgo, unsafe or exec statistics of any kind.

- **Don't Go with the flaw** — Boost Security Labs — Garance de la Brosse (work from her M.Eng thesis with the team)
  <https://labs.boostsecurity.io/articles/dont-go-with-the-flaw/>
  2025-12-03 · Q1, Q4 · partial
  Measured: Population: the entirety of the Go Proxy index, retrieved and dumped. Sample: full index, analysis run early November 2025 with domain checks as of 18 November 2025. Method: derive the GitHub account from each module path, test whether the account is deleted and whether the namespace is registrable; intersect with uhub/awesome-go and with OpenSSF Criticality Score >= 0.2 from the OSSF BigQuery database; query the GitHub API for public go.mod files referencing each package; cross-reference pkg.go.dev 'Imported By' counts; separately dump all hosting domains and check WHOIS status. Figures verbatim: '34845 deleted GitHub accounts among which 24339 GitHub accounts transferred their repositories to another account before deleting'; '63386 potentially hijackable Go packages still cached in the Go Proxy'; awesome-go intersection '3 go packages owned by 3 deleted GitHub accounts, among which 2 are registrable'; criticality-score list '51 packages belonging to 50 deleted GitHub accounts'; 'a frightening 8 452 hijackable repositories are currently sitting in public go.mod files'; '1 602 zombie packages that are still actively imported'; 'nearly 9 571 hijackable GitHub repositories that are currently dependencies for public Go projects'; top registrable package had '124 public GitHub projects depending on it'; '6 expired domains, among which 2 are registrable, 3 are in Redemption Period... and 1 is frozen'; '13 domains about to expire in the next 15 days (as of November 18th 2025)'; gopkg.in 'set to expire on March 5, 2026' with '326k on GitHub' dependents.
  Not measured: This is the closest any industry source comes to Q1's derivation step — owner inferred from host and path, at full-index scale — but it counts owners that are hijackable, never how many distinct owners a given build transitively trusts, and never the fraction absent from a project's own go.mod. For Q4 it is a genuine measurement of deleted-account caching and of vanity/custom-domain control. It also records a useful negative: 'Since the Go Proxy does not share stats about Go packages usage, we had to craft measurements to determine a package's popularity.' Its framing that cached packages are 'available forever and cannot be altered or deleted' overstates the operator's own position (see proxy.golang.org).

- **Hijackable Go Module Repositories** — VulnCheck — Jacob Baines
  <https://www.vulncheck.com/blog/go-repojacking>
  2023-12-04 · Q1, Q4 · partial
  Measured: Population: 'more than 20 million Go module-versions' tracked by VulnCheck. Method: 'infer the repository URL from the module name', then classify by HTTP response (301 redirect / 404 / 200), confirming that the repository name was unchanged but the username had changed, or that the original account no longer existed. Figures: 'more than 9,000 Go module GitHub repositories are vulnerable to repojacking due to a username change'; roughly 6,000 more due to account deletion, 'affecting nearly 300,000 module-versions'; combined '15,000 repositories... support more than 800,000 Go module-versions'. Also records GitHub's popular-repository namespace retirement threshold of more than 100 clones in the week before rename or deletion.
  Not measured: Does not state which index or feed enumerated the module-versions. Counts owners at risk, not owners trusted per project, and says nothing about the direct-versus-indirect split. On Q4 it asserts 'Once published, a Go module is available via proxy.golang.org. This ensures that modules can't be deleted' — stronger than the proxy's own FAQ.

- **The most popular Go dependency is…** — Thibaut Rousseau, independent practitioner blog (code at github.com/Thiht/go-stats)
  <https://blog.thibaut-rousseau.com/blog/the-most-popular-go-dependency-is/>
  2026-01-05 · Q1, Q4 · partial
  Measured: Population: every module version published since the Go proxy index began, 2019-04-10T19:08:52.997264Z. Sample: the complete index, downloaded locally as an immutable cache. Method: iterate every module, fetch its go.mod, extract dependencies, load into Neo4j as Module nodes and DEPENDS_ON relationships; nodes enriched with 'version timestamp, latest version, semantic version splitting (major, minor, patch, label), host, organisation, and more'. Results: 'roughly 40 million nodes, and 400 million relationships'; 'Go modules have 10 direct dependencies on average'; top direct-dependent counts over latest versions — stretchr/testify 259,237, google/uuid 104,877, golang.org/x/crypto 100,633, grpc 97,228, spf13/cobra 93,062, pkg/errors 92,491, golang.org/x/net 76,722, protobuf 74,971, sirupsen/logrus 71,730, spf13/viper 64,174. The full graph is published as a downloadable Neo4j dump (go-stats-neo4j-dump-20260105.tar, 11.21 GiB).
  Not measured: This is the single most important Q1 source precisely because of what it withholds: every module node carries an 'organisation' property, and no owner-level statistic is published — not owners per build, not owners per project, not the direct/indirect owner split. Dependencies are read from go.mod rather than resolved by MVS, so 'transitively trusts' in the build sense is not what the graph encodes. The one aggregate offered, 10 direct dependencies on average, is per module across the ecosystem, not a per-project transitive figure.

- **deps.dev BigQuery dataset schema** — Open Source Insights (deps.dev), Google — public dataset documentation
  <https://docs.deps.dev/bigquery/v1/>
  current · Q1, Q2, Q4 · adjacent
  Measured: Not a measurement. Documents the tables that would make the Q1 count possible: GoRequirements (DirectDependencies, IndirectDependencies, Excludes, Replaces, sourced from go.mod) and GoRequirementsLatest; Dependencies ('both direct and indirect dependencies'); DependencyGraphEdges, which carries full dependency graphs for npm, Go, Maven, PyPI and Cargo; Dependents; and Projects, typed GITHUB / GITLAB / BITBUCKET.
  Not measured: There is no owner or organisation column — the owner still has to be derived from the repository path, exactly as Q1 anticipates. The schema documentation states no coverage figures. Capslock capability results are served on the deps.dev site but do not appear as a documented BigQuery table, so the corpus-wide CGO aggregate is not even queryable from the public dataset.

- **2026 State of the Software Supply Chain Report — Methodology** — Sonatype — annual industry report
  <https://www.sonatype.com/state-of-the-software-supply-chain/2026/methodology>
  2026 · Q1, Q4 · adjacent
  Measured: Populations and samples for Sonatype's 2026 analyses: four ecosystems (Maven, npm, PyPI, NuGet) for the AI agents chapter, with Maven Central as 'a primary lens'; ~37,000 components from enterprise applications scanned June–August 2025; 1,718 open-source-relevant CVE records for calendar 2025; more than 3,000 enterprise SBOMs and a database of over 11 million package versions with end-of-life status; malware findings from 'aggregated telemetry across major open source ecosystems'.
  Not measured: Go is absent from the stated ecosystem coverage. This matters for Q1 specifically: the report series is the nearest industry analogue to the npm publisher-count work, and it simply does not look at Go. Treat as a negative result for industry census coverage of Go, not as evidence about Go.

- **The State of Software Supply Chain Security 2025 (blog summary)** — JFrog — annual industry report, blog summary
  <https://jfrog.com/blog/state-of-software-supply-chain-security-2025/>
  2025 · Q1, Q4 · adjacent
  Measured: Nothing Go-specific in the page I opened. Discusses CVE counts per package type and reports that organisations use 7+ languages; Go appears in JFrog Artifactory's list of popular technologies but with no accompanying measurement.
  Not measured: No Go module counts, no malicious-Go-package counts, no dependency or publisher figures. I opened only the blog summary and not the full downloadable report, so this is a partial check rather than a definitive negative for JFrog.

- **gobelin — Go Repojacking Vulnerability Detector** — Boost Security (boost-rnd) — open-source tool accompanying 'Don't Go with the flaw'
  <https://github.com/boost-rnd/gobelin>
  2025 · Q1 · adjacent
  Measured: Not a measurement. A CLI that, per the README, 'Extracts GitHub-hosted packages from the dependency list' and 'Checks each unique GitHub account owner via the GitHub API'.
  Not measured: Publishes no counts, sample sizes or population statistics. Its significance for Q1 is that the owner-derivation step — module path to host to account — is packaged and runnable per project, and yet no aggregate distinct-owner count per project has been published by anyone using it.

- **Go module proxy / Go modules services (front page and FAQ)** — Google / Go team — service operator documentation, primary source
  <https://proxy.golang.org/>
  current (services launched 2019; default since Go 1.13) · Q4, and Q3 for the fetch path · exists
  Measured: Not a measurement. Operator statements that bear directly on Q4. Verbatim: 'Since Go 1.13, the go command by default downloads and authenticates modules using the Go module mirror and Go checksum database.' On deletion: 'Whenever possible, the mirror aims to cache content in order to avoid breaking builds for people that depend on your package, so this bad release may still be available in the mirror even if it is not available at the origin. The same situation applies if you delete your entire repository.' On the limit of that: 'proxy.golang.org does not save all modules forever. There are a number of reasons for this, but one reason is if proxy.golang.org is not able to detect a suitable license. In this case, only a temporarily cached copy of the module will be made available... The checksums will still remain in the checksum database regardless of whether or not they have become unavailable in the mirror.' Also documents retract as the remedy, the /cached-only endpoint, and index.golang.org's feed with include=all returning 'all module versions proxy.golang.org or sum.golang.org ever served'.
  Not measured: Publishes no statistics whatsoever — no request volumes, no module counts, no coverage fractions, no takedown counts. This is the operator's stated policy, and it is the source that corrects the 'cached forever, unconditionally' claim repeated by several vendor reports.

- **Proposal: Secure the Public Go Module Ecosystem (design/25530-sumdb.md)** — golang/proposal — Russ Cox
  <https://go.googlesource.com/proposal/+/master/design/25530-sumdb.md>
  2019 design document · Q4, and Q3 for the verification path reused by toolchain downloads · adjacent
  Measured: Not a measurement. The design rationale for the checksum database: it authenticates that a download matches 'the same code everyone else downloads' while explicitly not attributing 'specific archives to specific authors'. GONOSUMDB names 'module path prefixes... that should not be looked up using the database', and 'GONOSUMDB must not imply GONOPROXY' and vice versa. Notes that with an up-to-date go.sum 'the database is never contacted'.
  Not measured: Gives no coverage fraction and no measurement of how often lookups are skipped or disabled. The 'integrity, not attribution' design choice is the root reason Q1 is hard in Go: there is no publisher record to count, only a path to derive an owner from.

- **Module Mirror and Checksum Database Launched** — The Go Blog — Katie Hockman
  <https://go.dev/blog/module-mirror-launch>
  2019-08-29 · Q4 · adjacent
  Measured: Not a measurement. Launch announcement for proxy.golang.org, index.golang.org and sum.golang.org, describing the checksum database as a Trillian-backed transparent log (Merkle tree) and the index as 'a public feed of new module versions that become available through proxy.golang.org'.
  Not measured: No adoption, coverage or volume figures at launch or since. Predates Go 1.21 and so cannot bear on Q3.

- **Go Supply Chain Attack: Malicious Package Exploits Go Module Proxy Caching for Persistence** — Socket — Kirill Boychenko
  <https://socket.dev/blog/malicious-package-exploits-go-module-proxy-caching-for-persistence>
  2025-02-04 · Q4 · adjacent
  Measured: A single incident, not a census: github.com/boltdb-go/bolt v1.3.1, a typosquat of github.com/boltdb/bolt. Method: analysis of one package plus its git history. Figures: 8,367 packages depend on the legitimate BoltDB; the backdoor persisted 'over three years'. Mechanism: the malicious version was cached by the module mirror, after which 'the threat actor modified the Git tags in the source repository, redirecting them to a benign, legitimate version' while 'the Go Module Proxy continued serving the cached malicious version'. Socket reported it to GitHub and Google on 30 January 2025.
  Not measured: No population and no scan — one package, with a second typosquat (bolt-db/bolt) noted in passing. It does not explain the role of go.sum or the checksum database in this case, which is the obvious question given the tag rewrite. Useful as the canonical demonstration of proxy-caching persistence; useless as a census.

- **Do not pass GO — Malicious Package Alert** — Snyk — Vandana Verma Sehgal
  <https://snyk.io/blog/go-malicious-package-alert/>
  2025-02-12 · Q4 · adjacent
  Measured: The same single incident (github.com/boltdb-go/bolt v1.3.1), reported second-hand. Figures: malicious version released November 2021, discovered 30 January 2025, 'impacted thousands of organizations for over three years'.
  Not measured: No population, no sample, no method of its own; 'thousands of organizations' is asserted with no basis given. Makes no mention of go.sum or the checksum database. Confirms that the named vendors' Go output is incident reporting rather than ecosystem measurement.

- **GoSurf: Identifying Software Supply Chain Attack Vectors in Go** — ACM SCORED '24 workshop (Salt Lake City, Oct 2024) — Carmine Cesarano, Vivi Andersson, Roberto Natella, Martin Monperrus. ACADEMIC, outside this modality; flagged because it is the nearest thing to a Q2 measurement.
  <https://arxiv.org/abs/2407.04442>
  2024 · Q2 · partial
  Measured: Population: Go modules sourced from libraries.io. Sample: 'the top 500 most imported packages', selected by number of dependents. Method: static analysis (go/token, go/parser, go/ast) with 12 analyzers, one per attack vector in their taxonomy; Figure 3 reports total occurrences of each vector across the 500 modules. Vectors include E5 CGO static code linking, E6 assembly, E7 plugins, E8 dynamic external execution, P2 testing functions, E1 constructors, E3 interfaces, E4 unsafe, plus a go:generate analyzer keyed on '//go:generate' comments. A second experiment tracks vector counts across Kubernetes v1.26–v1.30 (Table 1: e.g. E5 820, 792, 795, 797, 803; E6 ~1,495 per release; E7 1).
  Not measured: Reports occurrence counts, not the fraction of modules affected, and not what share of a resolved module graph invokes the C toolchain during a build. It records no CFLAGS/LDFLAGS values. It explicitly notes that 'go generate is not part of go build'. It also observes that Google's Capslock covers four of its twelve vectors including CGO, which corroborates the unpublished-aggregate point.

- **Beyond Takedown: Measuring Malicious Go Module Persistence in the Wild** — arXiv preprint — Minjae Bae, Carter Yagemann. ACADEMIC, outside this modality; flagged because it is the census Q4 asks for and industry did not produce.
  <https://arxiv.org/abs/2606.26291>
  submitted 2026-06-24 · Q4 · exists
  Measured: Population: the Go module index. Sample: 2,113 GitHub repositories found by manual search plus an automated scan over 12.3 million index entries. Method: a deobfuscating AST scanner (GOAST) plus proxy-based measurement of the gap between takedown and remediation. Findings: 2,289 malicious versions of legitimate Go modules; 'at least 99.4% remained retrievable via Go proxy' after GitHub removal; after disclosure GitHub removed 684 malicious repositories and Google's Go team remediated 1,377 module versions; 'purely GitHub-centric searches fail to identify the full extent of the compromise'.
  Not measured: Not an industry source; I opened the abstract page only, not the full paper, so the method details above are as stated in the abstract. Bears on malicious-module census and on proxy caching of removed modules; says nothing about Q1, Q2 or Q3.

- **On Good Authority: Release-Authority Measurement for Registry-Mediated Package Ecosystems** — arXiv preprint — Igor Santos-Grueiro. ACADEMIC, outside this modality; flagged because its subject is release authority, which is Q1-adjacent.
  <https://arxiv.org/abs/2606.22593>
  submitted 2026-06-21, revised 2026-06-30 · Q1 · adjacent
  Measured: 45,812 releases, 43,100 eligible predecessor comparisons and 942 package coordinates across npm, PyPI, Maven Central, crates.io and RubyGems, detecting release-path discontinuities. Go is handled separately: 'We report Go separately as a VCS/proxy/checksum-log boundary adapter.'
  Not measured: Does not count distinct owners per project or per build, in Go or anywhere else; it compares each release against its predecessor rather than aggregating ownership. Go is a boundary case precisely because it has no publisher accounts. I opened the abstract page only. Does not close Q1.

### Searches run

- `web search :: Go module ecosystem measurement transitive dependencies study`
- `web search :: Go module mirror checksum database blog go.dev proxy.golang.org sum.golang.org (restricted to go.dev, golang.org, blog.golang.org)`
- `web search :: GOTOOLCHAIN go.mod toolchain line Go 1.21 downloads toolchain module proxy`
- `web search :: "GOTOOLCHAIN" supply chain security risk attack toolchain download 2025`
- `web search :: Socket malicious Go module typosquat BoltDB module proxy cached indefinitely`
- `web search :: Sonatype State of the Software Supply Chain Go modules Golang count percentage`
- `web search :: deps.dev Go modules dataset BigQuery open source insights coverage`
- `web search :: Go has no install scripts npm postinstall comparison supply chain cgo attack surface`
- `web search :: percentage of Go modules use cgo statistics prevalence measurement`
- `web search :: Go security release cgo LDFLAGS arbitrary code execution CVE-2023-29404 go get`
- `web search :: Go modules dependency owners concentration analysis how many GitHub organizations trusted build`
- `web search :: Endor Labs OR Snyk OR Chainguard Go modules report transitive dependencies maintainers`
- `web search :: boostsecurity.io "Don't Go with the Flaw" Go modules supply chain repojacking`
- `web search :: Go vanity import path hijack expired domain takeover module supply chain`
- `web search :: VulnCheck thousands of Go modules repojacking GitHub username change measurement`
- `web search :: go.dev blog module proxy statistics requests served modules served telemetry Go Developer Survey modules (restricted to go.dev, blog.golang.org, golang.org)`
- `web search :: Go telemetry gotelemetry go.dev blog 2024 what is measured opt-in (restricted to go.dev, blog.golang.org, telemetry.go.dev)`
- `web search :: Socket.dev Go modules scanning malicious Go packages count 2025 2026 ecosystem support`
- `web search :: "toolchain" directive go.mod how many modules declare statistics survey index.golang.org analysis`
- `web search :: Go build time code execution malicious module cgo go:generate attack research blog`
- `web search :: GOPRIVATE GONOSUMDB GONOSUMCHECK GOFLAGS disable checksum database how common enterprise Go proxy`
- `web search :: Google security blog Capslock Go capability analysis measurement ecosystem`
- `web search :: JFrog software supply chain state of the union report Go modules Golang packages statistics`
- `web search :: "go.mod" analysis "indirect" dependencies fraction organizations owners per project measured study Go supply chain`
- `web search :: golang proposal 57001 toolchain switching data how many modules go.mod go directive version distribution Russ Cox`
- `web search :: GOTOOLCHAIN=local hermetic build CI security recommendation pin Go toolchain supply chain vendor guidance`
- `web search :: Datadog State of DevSecOps report Go language libraries coverage percentage services scanned`
- `web search :: "Go modules" OR "Golang" malicious packages count 2025 Checkmarx Phylum Snyk ecosystem census how many`
- `web search :: OpenSSF Alpha-Omega Sigstore Go modules signing provenance checksum database transparency log 2025`
- `web search :: Go Developer Survey results modules dependencies supply chain security questions go.dev blog 2025 2026 (restricted to go.dev, blog.golang.org)`
- `web search :: "toolchain directive" adoption percentage repositories go.mod GitHub code search 2025 analysis`
- `web search :: direct fetches (not searches): go.dev/doc/toolchain; go.dev/blog/toolchain; go.dev/blog/supply-chain; go.dev/blog/all; go.googlesource.com/proposal/+/master/design/57001-gotoolchain.md; go.googlesource.com/proposal/+/master/design/25530-sumdb.md; proxy.golang.org; telemetry.go.dev; telemetry.go.dev/config; blog.deps.dev/capslock/; docs.deps.dev/bigquery/v1/; security.googleblog.com/2023/09/capslock-what-is-your-code-really.html; raw.githubusercontent.com/google/capslock/main/docs/capabilities.md; labs.boostsecurity.io/articles/dont-go-with-the-flaw/; github.com/boost-rnd/gobelin; vulncheck.com/blog/go-repojacking; socket.dev/blog/malicious-package-exploits-go-module-proxy-caching-for-persistence; snyk.io/blog/go-malicious-package-alert/; sonatype.com/state-of-the-software-supply-chain/2026/methodology; jfrog.com/blog/state-of-software-supply-chain-security-2025/; mattermost.com/blog/go-fixes-its-7th-code-execution-bug-in-the-same-feature/; safeguard.sh/resources/blog/go-toolchain-distribution-security; blog.thibaut-rousseau.com/blog/the-most-popular-go-dependency-is/; arxiv.org/pdf/2407.04442 (via pdftotext); arxiv.org/abs/2606.22593; arxiv.org/abs/2606.26291`


## code-and-data

23 sources.

- **The Shape of Go** — Luís Sousa, personal blog; code at github.com/LuisLSousa/shape-of-go
  <https://luislsousa.com/blog/the-shape-of-go/>
  2026 · Q4 (primary), Q1, Q3 · exists
  Measured: Population: the whole public Go module index, snapshot 6 Aug 2026. Method: sync index.golang.org (51,458,393 entries), resolve the latest version of each path, fetch and parse its go.mod, join declared requires into one graph. Results: 2,638,112 distinct module paths, 9,443,537 direct-require edges, 2,643,159 nodes including ~11,000 ghost modules the proxy can no longer serve, 4,917 modules the proxy refuses with 'may be dangerous to execute', 93.2% of modules never imported, largest connected component 1,239,152 (46.9%). PageRank for load-bearing, ForceAtlas2 for layout. Code and data reproducible from the repo (cmd/indexsync, cmd/fetchmods, cmd/buildgraph, cmd/analyze).
  Not measured: Counts no owners, organizations or accounts — the only org mention is incidental ('three of the top 25 belong to Kubernetes'). Edges are direct requires only, not the transitive closure. Explicitly DROPS golang.org/toolchain entries before counting, so it is direct evidence that toolchain module-versions sit in the index uncounted. No cgo, no assembly, no build-time execution.

- **Beyond Takedown: Measuring Malicious Go Module Persistence in the Wild** — Minjae Bae and Carter Yagemann, The Ohio State University; arXiv 2606.26291v1
  <https://arxiv.org/abs/2606.26291>
  2026 · Q4 · exists
  Measured: Two-stage. Stage 1: manual GitHub discovery Mar–Jun 2025, 2,113 repositories. Stage 2: index.golang.org feed Jul 2024–Jul 2025, >12.3M entries, scanned with GOAST, a deobfuscating AST scanner they built. Result: 2,289 malicious module versions repackaging legitimate modules under attacker-controlled owners with import-triggered downloaders. Takedown-remediation gap measured by matching proxy retrieval logs against GitHub snapshots: of artifacts later found GitHub-unobservable, at least 99.4% remained retrievable via the Go proxy. Disclosure outcome: GitHub removed 684 repositories, the Go team remediated 1,377 module versions.
  Not measured: No GOTOOLCHAIN or toolchain directive anywhere in it. Does not count owners per build — 'attacker-controlled owners' is a property of the campaign, not a trust-breadth measurement. No cgo or build-execution analysis. No released tool or dataset URL found in the paper.

- **Don't Go with the flaw** — Garance de la Brosse, BoostSecurity Labs
  <https://labs.boostsecurity.io/articles/dont-go-with-the-flaw/>
  2025 · Q4 (primary), Q1 (owner derivation) · exists
  Measured: Population: the entire Go Proxy index. Method: derive the hosting account from each module path, query the GitHub API for account registration status, cross-reference against awesome-go and the OSSF criticality score database (threshold 0.2), check pkg.go.dev 'Imported By' counts, search public go.mod files. Results: 34,845 deleted GitHub accounts hosting Go packages, 63,386 potentially hijackable packages still cached in the proxy, 9,571 zombie packages actively imported by public GitHub projects, 54 packages with criticality >=0.2, 6 expired vanity-path domains of which 2 registrable. Also covers dependency confusion, gopkg.in typosquatting, dangling commits and pseudo-versions.
  Not measured: Derives owners from module paths at ecosystem scale but counts abandonment, never trust breadth: no per-project count of distinct owners behind a build, no direct-vs-transitive split. Does not cover module deletion mechanics, cgo, //go:generate or the toolchain directive.

- **Hijackable Go Module Repositories** — Jacob Baines, VulnCheck
  <https://www.vulncheck.com/blog/go-repojacking>
  2023 · Q4, Q1 (owner derivation) · exists
  Measured: Population: >20 million Go module-versions tracked by VulnCheck. Method: infer repository URL from module name, connect to each, classify by HTTP status (301 renamed, 404 deleted, 200 live), validate against pkg.go.dev. Results: ~15,000 hijackable repositories covering ~800,000 module-versions; 9,000+ repos vulnerable via username change (500,000+ versions) and 6,000+ via account deletion (~300,000 versions).
  Not measured: Does not state whether the enumeration came from index.golang.org or proxy.golang.org. No code or dataset released. Same owner derivation as BoostSecurity, same limitation for Q1: it is a hijackability census, not a count of owners a build trusts.

- **GoSurf: Identifying Software Supply Chain Attack Vectors in Go** — Cesarano, Andersson, Natella, Monperrus; ACM SCORED '24 (Workshop on Software Supply Chain Offensive Research and Ecosystem Defenses), Salt Lake City, Oct 2024; tool at github.com/chains-project/GoSurf
  <https://arxiv.org/abs/2407.04442>
  2024 · Q2 (primary) · partial
  Measured: Population: the top 500 most-imported Go modules, sourced from libraries.io, selected by dependent count. Method: static analysis (AST + call-graph invocation inspection; regex over .s files for package-level assembly) against a 12-vector taxonomy that includes E5 CGO Static Code Linking, E6 Assembly Static Code Linking, P1 //go:generate, E4 unsafe pointers, E7 plugins, E8 dynamic external execution. Reports per-vector occurrence counts across the 500 modules (Figure 3 / Table 3); P2 testing functions, E1 constructors, E3 interfaces and E4 unsafe dominate, with cross-language C and assembly 'widespread'. Second experiment: differential attack-surface analysis across Kubernetes 1.26–1.30. Tool released.
  Not measured: Corpus is 500 top modules, not a resolved transitive closure of any real build, so it cannot answer 'how much of a module graph invokes the C toolchain'. Counts occurrences of cgo/assembly, never reads #cgo CFLAGS/LDFLAGS values. Publishes vector-count figures but not a headline percentage of modules using cgo. No toolchain-directive vector in the taxonomy.

- **An Empirical Study of CGO Usage in Go Projects — Distribution, Purposes, Patterns and Critical Issues** — Jinbao Chen, Boyao Ding, Yu Zhang, Qingwei Li, Fugen Tang; Journal of Systems and Software vol. 231 (Jan 2026), art. 112601; arXiv Aug 2025
  <https://arxiv.org/abs/2508.09875>
  2025/2026 · Q2 · partial
  Measured: Population: 920 open-source Go projects. Method: CGOAnalyzer, a purpose-built tool to identify and quantify CGO-related features. Results: 11.3% of projects use CGO; usage concentrated in a few files/packages; 4 primary purposes; 15 distinct usage patterns; 19 types of CGO-related issues including one critical unnecessary-pointer-check class; 56 modules document CGO as a performance optimisation.
  Not measured: Selection method for the 920 projects is not stated in the abstract or arXiv page. Population is top-level projects, not a build's transitive dependency closure, so it does not answer 'how much of a real module graph invokes the C toolchain'. No analysis of #cgo CFLAGS/LDFLAGS flag values that dependencies pass to the compiler and linker. No assembly, no //go:generate.

- **Uncovering the Hidden Dangers: Finding Unsafe Go Code in the Wild** — Lauinger, Baumgärtner, Wickert, Mezini (TU Darmstadt); IEEE (TrustCom 2020); data at github.com/stg-tud/unsafe_go_study_results and Zenodo 3987400
  <https://arxiv.org/abs/2010.11242>
  2020 · Q2 (adjacent) · adjacent
  Measured: Population: the top 500 most popular open-source Go projects on GitHub, of which 343 top-starred analysed, plus their dependencies — 62,025 individual packages in total. Method: go-geiger, a released tool, plus manual analysis of 1,400 code samples. Results: 38% of projects use unsafe in their own application code; 91% contain unsafe usages in first-party or imported third-party libraries. Dataset and replication scripts released.
  Not measured: Measures the `unsafe` package, not cgo, not assembly, not #cgo flags, not the C toolchain. It is the right population shape for Q2 (project + full dependency closure, 62k packages, tool and data released) applied to a different feature — the template exists, the cgo instantiation of it does not.

- **Bringing Capslock analysis to deps.dev** — Jess McClintock and John Dethridge, Google Open Source Security Team (Open Source Insights blog)
  <https://blog.deps.dev/capslock/>
  2024 · Q2 · adjacent
  Measured: Not a measurement. Announces that Capslock capability results are shown for Go package versions on deps.dev. Asserts two numbers with no stated population, sample or method: 'less than 2% of version updates for packages will introduce a new capability requirement' and 'a whopping 9% of Go packages have a transitive dependency using os/exec'.
  Not measured: No population, no sample, no method — adjacent by the sweep's own rule. Does not report CGO at all, despite Capslock defining CAPABILITY_CGO. I verified the underlying data is not bulk-available: the deps.dev BigQuery dataset has 31 tables and no Capabilities table, and the live v3alpha version endpoint returns only versionKey/purl/licenses/links/relatedProjects/upstreamIdentifiers with no capability field. So the cgo-across-the-graph count is not sitting in a published dataset either.

- **Capslock capability documentation (CAPABILITY_CGO)** — Google (google/capslock)
  <https://github.com/google/capslock/blob/main/docs/capabilities.md>
  2026 (current docs) · Q2 · adjacent
  Measured: Not a measurement — the instrument. Defines CAPABILITY_CGO: 'Identifies calls that execute native code via Go's Cgo mechanism. Capslock cannot analyze beyond this boundary.' Also CAPABILITY_UNSAFE_POINTER, CAPABILITY_REFLECT, CAPABILITY_EXEC. No plugin capability.
  Not measured: Ships no ecosystem-wide run and no corpus. The stated cgo boundary ('cannot analyze beyond') is itself the reason a flags-level measurement would have to be done outside Capslock.

- **Go Toolchains (go.dev/doc/toolchain)** — The Go Programming Language / Google
  <https://go.dev/doc/toolchain>
  2023 onwards (Go 1.21+) · Q3 (primary) · adjacent
  Measured: Not a measurement — the mechanism, read in full. Toolchains ship as the module golang.org/toolchain at version v0.0.1-go<VERSION>.<GOOS>-<GOARCH>; downloaded like any module so GOPROXY applies; checksums checked by the Go checksum database; 'it is not practical to write toolchain module checksums to go.sum. Instead, toolchain downloads fail for lack of verification if GOSUMDB=off'; 'GOPRIVATE and GONOSUMDB patterns do not apply to the toolchain downloads'. PATH is searched for e.g. go1.21.3 before downloading; GOTOOLCHAIN=<name>+path disables the download fallback; switching happens for build/test/run and go get, and go get also writes a toolchain line; go install/run pkg@version print a switching message each time. Candidate selection is minimal-version-selection over up to three candidates.
  Not measured: Documents behaviour, counts nothing. No figure for how many modules name a toolchain, no fetch statistics, no failure rates.

- **cmd/go/internal/modfetch/sumdb.go useSumDB() and toolchain/select.go (go1.24.4 source, read locally at /usr/lib/go-1.24/src)** — golang/go (installed go1.24.4 linux/amd64)
  <https://github.com/golang/go/blob/master/src/cmd/go/internal/modfetch/sumdb.go>
  2025 (go1.24.4) · Q3 · adjacent
  Measured: Not a measurement — primary-source verification of the Q3 mechanism. useSumDB() special-cases mod.Path == "golang.org/toolchain" and sets must=true, forcing a checksum-database lookup 'even if GOSUMDB=off or GONOSUMDB matches the pattern', with exactly two escapes in the code: a single file:// GOPROXY (distpack testing) and GIT_HTTP_USER_AGENT containing 'proxy.golang.org' (the proxy cannot check itself). A code comment rejects a GOPROXY=direct exception on the grounds it would reduce toolchain security to HTTPS alone. Failure paths in toolchain/select.go: base.Fatalf on 'download %s for %s/%s: toolchain not available', 'too many toolchain switches' (maxSwitch), 'invalid toolchain %q in %s', 'cannot find %q in PATH'; there is a telemetry counter go/errors:invalid-toolchain-in-file.
  Not measured: Source, not data. Establishes what happens; says nothing about how often it happens in the wild. Directly contradicts the safeguard.sh claim that GOSUMDB=off leaves toolchain downloads unverified — worth recording as a correction if this arm is built.

- **Go Toolchain Distribution Security: How go.mod Pins Your Compiler** — Shadab Khan, Safeguard.sh blog
  <https://safeguard.sh/resources/blog/go-toolchain-distribution-security>
  2026 · Q3 · adjacent
  Measured: Nothing. No numbers with a stated sample or population anywhere in the post — no adoption rate, no module counts. Asserts 'If GOSUMDB is set to off, or if GONOSUMCHECK is non-empty, the toolchain download is fetched without checksum verification' and 'if your environment has GOSUMDB=off ... the proxy is the root of trust'.
  Not measured: Not a measurement by this sweep's rule, and the central verification claim is wrong: useSumDB() in go1.24.4 forces the sumdb lookup for golang.org/toolchain regardless of GOSUMDB=off/GONOSUMDB. Recorded as adjacent and as a correction target, not as prior art.

- **CVE-2023-39320 / GHSA-rxv8-v965-v333 — go.mod toolchain directive arbitrary code execution** — GitHub Advisory Database / Go security team
  <https://github.com/advisories/GHSA-rxv8-v965-v333>
  2023 · Q3 · adjacent
  Measured: Not a measurement. Records that the go.mod toolchain directive introduced in Go 1.21 could be leveraged to execute scripts and binaries relative to the module root when the go command ran within the module, for modules fetched from the proxy or directly via VCS. Fixed in Go 1.21.1.
  Not measured: No population, no counts, no exploitation-in-the-wild figures. Establishes that the toolchain directive is an execution surface; measures nothing about it.

- **CVE-2023-29404 / GO-2023-1841 — improper sanitization of #cgo LDFLAGS (golang/go#60305)** — Go vulnerability database / golang/go issue 60305
  <https://pkg.go.dev/vuln/GO-2023-1841>
  2023 · Q2 · adjacent
  Measured: Not a measurement. Arguments for certain non-optional #cgo LDFLAGS flags were treated as optional, letting disallowed flags be smuggled past sanitisation, giving arbitrary code execution at build time on `go get` of a malicious module or any build of untrusted code. Affects gc and gccgo; fixed in go1.19.10 / go1.20.5.
  Not measured: No corpus of what flags real dependencies actually pass. It is the reason the Q2 flags question matters and simultaneously evidence that nobody has enumerated the flag population.

- **deps.dev BigQuery dataset schema (Open Source Insights)** — Google / Open Source Insights, Google Cloud Public Dataset Program
  <https://docs.deps.dev/bigquery/v1/>
  2026 (current schema) · Q1 (primary), Q2 · adjacent
  Measured: Not a measurement — the dataset that makes Q1 possible. 31 tables including GoRequirements/GoRequirementsLatest (go.mod requirements), DependencyGraphEdges/…Latest (one row per dependency-graph edge, full transitive graph per version), Dependencies, PackageVersions (Links records labelled SOURCE_REPO, UpstreamIdentifiers), PackageVersionToProject, Projects (Type GITHUB/GITLAB/BITBUCKET, Name). Live v3alpha API confirms the same shape for a Go version: links[{label SOURCE_REPO}], relatedProjects[{projectKey, relationProvenance GO_ORIGIN}], upstreamIdentifiers[{source GO_MODULE_PROXY}].
  Not measured: No owner, publisher, maintainer or account field for Go anywhere in the schema — owner can only be derived from Projects.Name ('owner/repo') via PackageVersionToProject. No Capabilities table, so the Capslock/CGO results announced on the deps.dev blog are not in the public dataset. This is the cleanest evidence for the Q1 verdict: the count is made possible and has not been published.

- **ecosyste.ms Packages — proxy.golang.org registry (live API)** — Andrew Nesbitt / Ecosyste.ms
  <https://packages.ecosyste.ms/api/v1/registries/proxy.golang.org>
  2026 (probed 2026-09-23) · Q1 (primary), Q4 · adjacent
  Measured: Live registry-level counts, probed directly: packages_count 2,455,046, versions_count 26,046,441, maintainers_count 0, namespaces_count 848,330, funded_packages_count 97,644, updated_at 2026-09-23. Per-package records carry repo_metadata.owner (e.g. 'gorilla') sourced from the repository host, and a namespace field.
  Not measured: maintainers endpoint returns [] — there are no publisher accounts for Go and ecosyste.ms records none. The namespace derivation is path-minus-last-segment, not host+owner: the namespace listing returns 'github.com/gmlewis/go-fonts/fonts' alongside 'github.com/hashicorp', so 848,330 is not an owner count. No per-project transitive owner analysis is published anywhere on the service.

- **On Good Authority: Release-Authority Measurement for Registry-Mediated Package Ecosystems** — Igor Santos-Grueiro; arXiv 2606.22593v2
  <https://arxiv.org/abs/2606.22593>
  2026 · Q1 · adjacent
  Measured: Measures the number of distinct entities with authority to release package versions, and release-authority transitions, over a Jun 2024 – Jun 2026 corpus across five ecosystems it calls registry-mediated: npm, PyPI, Maven Central, crates.io, RubyGems. Go is 'reported separately because its public authority path centers on' VCS/proxy/checksum-log rather than registry publisher accounts; the Go boundary adapter contributes 7,123 releases and 6,653 eligible comparisons, using VCS origin, module proxy, checksum-log and tag evidence. Correction ledger of 17 audited row-level findings.
  Not measured: The closest framing of the publisher question in the literature, and it explicitly declines to give Go a publisher count — Go is kept out of the main cohort precisely because Go has no registry publisher semantics. Measures release-authority transitions per package, never how many distinct owners a build transitively trusts, and never the fraction absent from go.mod.

- **How Deep Does Your Dependency Tree Go? An Empirical Study of Dependency Amplification Across 10 Package Ecosystems** — Jahidul Arafat, Auburn University; arXiv 2512.14739
  <https://arxiv.org/abs/2512.14739>
  2025 · Q1 · adjacent
  Measured: Population: 500 projects, 50 per ecosystem, sampled from popular/most-downloaded packages in each. Method: parse the manifest (go.mod for Go), resolve the full tree with native tooling, compute direct/transitive/total sets. Go results: 4.48x amplification, mean total deps 34.9, max 263, 95th-percentile and max figures reported, 6% of Go projects exceed 10x amplification, 36.0% of Go projects have zero dependencies. Defines 'attack surface A of a project p' as the total number of packages installed.
  Not measured: Attack surface is measured in PACKAGES, explicitly ('Attack surface measured as total packages installed'). No owners, maintainers, publishers, organizations or namespaces anywhere. 50 hand-picked Go projects, selection described only as 'popular'. This is the package-granularity analogue of Q1, not Q1.

- **Small World with High Risks: A Study of Security Threats in the npm Ecosystem** — Zimmermann, Staicu, Tenny, Pradel; USENIX Security 2019
  <https://www.usenix.org/conference/usenixsecurity19/presentation/zimmerman>
  2019 · Q1 · adjacent
  Measured: The npm analogue Q1 names. Population: 5,386,239 package versions, 199,327 maintainers, 609 known security issues. Result: installing an average npm package implicitly trusts ~80 other packages and code published by ~40 maintainers; 391 highly influential maintainers each affect >10,000 packages; ~140 maintainers could halve the risk from compromised maintainers.
  Not measured: npm only. No Go, and no replication of it for Go found in this sweep. The method depends on registry maintainer accounts, which Go does not have — which is exactly why the Go version requires the owner-from-path derivation and why it has not been done.

- **sum.golang.org signed checkpoint (live) and index.golang.org feed (live)** — Google / the Go team
  <https://sum.golang.org/latest>
  2026 (probed 2026-09-23) · Q4, Q3 · adjacent
  Measured: Primary data, probed directly: sum.golang.org tree size 64,722,927 entries as of 2026-09-23, signed checkpoint. index.golang.org/index?since=…&limit=… returns the raw Path/Version/Timestamp feed and is openly queryable — the feed both 'Beyond Takedown' (12.3M entries) and 'The Shape of Go' (51.4M entries) were built from.
  Not measured: A checkpoint is a size, not a coverage measurement. No published analysis of what fraction of real-world fetches the sumdb covers, nor of how often GOPRIVATE/GONOSUMDB/GONOSUMCHECK/GOFLAGS take modules out of it — the one open gap inside Q4.

- **Some flexibility with Go's sumdb** — William Woodruff (yossarian), ENOSUCHBLOG
  <https://blog.yossarian.net/2025/12/29/Some-flexibility-with-Go-s-sumdb>
  2025 · Q4 · adjacent
  Measured: A demonstration, not a census: module path case variants produce distinct sumdb log entries with different content hashes for identical content. Concrete instances: three distinct log entries (IDs 22152757, 22198707, 48547565) for uuid@v1.6.0; a 14-letter path admits 2^14 = 16,384 case variants. Argues sumdb monitoring is not as simple as watching one representation, and that case-only changes resemble typosquatting while reading as innocuous diffs.
  Not measured: No population of how many case-variant entries actually exist in the 64.7M-entry log. No GONOSUMDB/GOPRIVATE/GOFLAGS/toolchain discussion at all.

- **A Large-Scale Empirical Study on Semantic Versioning in Golang Ecosystem** — IEEE/ACM ASE 2023 (38th International Conference on Automated Software Engineering)
  <https://arxiv.org/abs/2309.02894>
  2023 · Q4 · adjacent
  Measured: Population: a GitHub-crawled Go dependency graph of 124K third-party libraries and 532K client programs, filtered to repositories with go.mod. Measures semver compliance and breaking-change propagation across the Go module ecosystem.
  Not measured: Corpus is GitHub-crawled, not the module index or proxy, so it is not a census of the ecosystem. No owners, no cgo, no toolchain (predates Go 1.21 in any case for Q3 purposes). Relevant to Q4 only as prior census-adjacent work on the Go graph.

- **GoLeash: Mitigating Golang Software Supply Chain Attacks with Runtime Policy Enforcement** — arXiv 2505.11016
  <https://arxiv.org/abs/2505.11016>
  2025 · Q2 · adjacent
  Measured: Runtime policy enforcement (eBPF-based) for Go supply chain attacks, evaluated on five applications: Kubernetes, etcd, CoreDNS, frp, Go-Ethereum. Performance overhead benchmarks. Artifact referenced.
  Not measured: Five applications is not a population. No prevalence measurement of cgo, assembly or //go:generate across a module graph. Defence mechanism, not a census — recorded so it is not mistaken for Q2 prior art.

### Searches run

- `web search :: Go module ecosystem transitive dependency measurement study go.mod`
- `web search :: deps.dev BigQuery dataset Go modules dependency graph public dataset`
- `web search :: cgo usage prevalence measurement Go modules study how many packages use cgo`
- `web search :: GOTOOLCHAIN go.mod toolchain directive download supply chain security measurement`
- `web search :: Go module proxy checksum database sum.golang.org coverage measurement GOPRIVATE GONOSUMDB study`
- `web search :: typosquatting malicious Go modules measurement study module proxy deleted modules`
- `web search :: "Small World with High Risks" npm maintainers study Go ecosystem replication trusted maintainers count`
- `web search :: Go module ecosystem "attack surface" maintainers owners GitHub organizations concentration analysis dependency graph 2024 2025`
- `web search :: "#cgo LDFLAGS" arbitrary code execution CVE-2023-29404 go command linker flags dependency measurement across modules`
- `web search :: ecosyste.ms Go modules registry owner field coverage index.golang.org census number of modules`
- `web search :: vanity import paths Go measurement study who controls domain go-import meta tag expired domains`
- `web search :: large-scale analysis Go modules corpus assembly files cgo fraction proxy.golang.org download all modules`
- `web search :: golang/go issue GOTOOLCHAIN security concern automatic toolchain download trust proposal discussion`
- `web search :: Go checksum database transparency log size number of entries sum.golang.org measurement coverage study 2025`
- `web search :: "Uncovering the Hidden Dangers" unsafe Go code in the wild large-scale study number of packages measured`
- `web search :: Go dependencies "distinct organizations" OR "distinct owners" transitive trust count per project supply chain report Endor Socket Chainguard`
- `web search :: Capslock capability analysis run across Go ecosystem published results CGO capability fraction of packages`
- `web search :: Software Heritage Go module archival coverage golang proxy ingestion measurement`
- `web search :: empirical study Go ecosystem GitHub organizations own modules concentration "namespace" packages per owner distribution measurement`
- `web search :: "toolchain" directive adoption percentage go.mod repositories GitHub analysis 2025 2026 statistics`
- `web search :: VulnCheck repojacking Go modules 15000 repositories 800000 module versions December 2023`
- `web search :: Go build transitively trusts N repositories owners per project measurement "go.mod" indirect dependencies owner count study`
- `web search :: API probe: GET https://packages.ecosyste.ms/api/v1/registries/proxy.golang.org`
- `web search :: API probe: GET https://packages.ecosyste.ms/api/v1/registries/proxy.golang.org/namespaces?per_page=5`
- `web search :: API probe: GET https://packages.ecosyste.ms/api/v1/registries/proxy.golang.org/maintainers?per_page=3 (returned [])`
- `web search :: API probe: GET https://api.deps.dev/v3alpha/systems/go/packages/github.com%2Fgorilla%2Fmux/versions/v1.8.1`
- `web search :: API probe: GET https://api.deps.dev/v3alpha/systems/go/packages/github.com%2Fmattn%2Fgo-sqlite3/versions/v1.14.28 (field list) and .../v1.14.28:getCapabilities (no such method)`
- `web search :: API probe: GET https://sum.golang.org/latest (live checkpoint)`
- `web search :: API probe: GET https://index.golang.org/index?since=2026-09-20T00:00:00Z&limit=3`
- `web search :: API probe: GET https://api.github.com/repos/LuisLSousa/shape-of-go/git/trees/HEAD?recursive=1`
- `web search :: source read: grep -rn "golang.org/toolchain" /usr/lib/go-1.24/src/cmd/go/internal/ ; read modfetch/sumdb.go useSumDB ; read modfetch/fetch.go:222 ; grep failure paths in toolchain/select.go (go1.24.4)`


## community-and-press

34 sources.

- **The Shape of Go** — Luís Sousa (personal blog)
  <https://luislsousa.com/blog/the-shape-of-go/>
  2026 · Q4 (primary), Q1, Q3 · exists
  Measured: Population: every module version ever served by proxy.golang.org, via the public append-only index, snapshot 2026-08-06. Method: resolve the latest version of each path, fetch and parse its go.mod from the proxy, join declared requires into one graph; ForceAtlas2 embedding of the connected component; pipeline run on one laptop. Figures: 51,458,393 index entries; 2,638,112 distinct module paths after dropping golang.org/toolchain; 4,954 unfetchable, 999 unparseable, 2,632,159 parsed, plus 11,000 ghost modules = 2,643,159 nodes; 9,443,537 edges; 1,239,152-node connected component; 93.2% (2,463,065) never imported; testify 346,205 direct dependents; pkg/errors 109,156; k8s.io/apimachinery 67,827, client-go 60,488, api 55,201; new module paths by year 2019 90,655 / 2020 196,506 / 2021 274,242 / 2022 194,530 / 2023 213,826 / 2024 867,456 / 2025 450,788 / 2026-to-Aug-6 350,110, with never-imported shares 67.4 / 88.5 / 92.7 / 89.7 / 89.8 / 97.5 / 96.0 / 95.6 percent; of 2024's 867,456 newcomers, 845,491 have zero dependents. Hand-sampled 30 modules from the 2024 cohort to test the AI-publishing-wave explanation and reports the index cannot settle it.
  Not measured: No breakdown by host (github.com vs other) and no owner or organization aggregation at all — the only owner-shaped passage is an anecdote about gmlewis/go-fonts (1,275 dependents, 1,274 of them the author's own sub-modules) and a remark that 'families of single-owner sub-modules appear all over the rim'. No cgo counts. Explicitly discards the golang.org/toolchain index entries rather than analysing them, so the one census with the toolchain data in hand does not report on it. 'Imported' means direct requires of latest versions only.

- **The most popular Go dependency is…** — Thibaut Rousseau (personal blog)
  <https://blog.thibaut-rousseau.com/blog/the-most-popular-go-dependency-is/>
  2026 · Q4 (primary), Q1 · exists
  Measured: Population: the whole Go module ecosystem since the proxy opened 2019-04-10. Method: download the full index from index.golang.org, fetch each module's go.mod via proxy.golang.org, build a directed graph in Neo4j (~40M nodes, ~400M relationships), query with indexed Cypher. Figures: testify 259,237 direct dependents among latest versions; google/uuid 104,877; 'Go modules have 10 direct dependencies on average'. Publishes an 11.21 GiB Neo4j dump via BitTorrent for independent verification.
  Not measured: No counts of distinct owners or organizations, no transitive publisher counts per project, no per-project aggregation of any kind — the unit is the module, not the project's build. No toolchain or cgo analysis.

- **How Go Mitigates Supply Chain Attacks** — The Go Blog (Filippo Valsorda)
  <https://go.dev/blog/supply-chain>
  2022 · Q2 (primary), Q4 · adjacent
  Measured: Not a measurement. Full text pulled with curl and grepped. States the design claim verbatim: 'It is an explicit security design goal of the Go toolchain that neither fetching nor building code will let that code execute, even if it is untrusted and malicious.' Also: 'There is no security boundary within a build: any package that contributes to a build can define an init function'; 'The version of every dependency contributing to any Go build is fully determined by the go.mod file of the main module'; describes the sumdb as 'a global append-only cryptographically-verifiable list of go.sum entries'; and closes on Go's culture of small dependency trees ('it's possible to build rich, complex applications with just a handful of dependencies').
  Not measured: Contains no occurrence of the string 'cgo' anywhere (verified by grep over the extracted text), no mention of //go:generate, no mention of assembly, and no statistics of any kind. The build-time execution caveat it does give is about init functions, not about the C toolchain. This is the unqualified claim Q2 is testing.

- **cmd/go: arbitrary code execution during "go get" (CVE-2018-6574)** — golang/go issue tracker
  <https://github.com/golang/go/issues/23672>
  2018 · Q2 · adjacent
  Measured: Not a measurement; a vulnerability report. Filed by rsc 2018-02-02, reported by Christopher Brown of Mattermost. Mechanism: a malicious repository ships a compiler plugin plus a Go source file whose #cgo directives pass -fplugin=attack.so, giving unrestricted code execution at build. Fix: go build restricts #cgo directive flags to an allowlist excluding -fplugin= and variants; $CGO_CFLAGS from the environment stays unrestricted because only the user sets it; CGO_CFLAGS_ALLOW / CGO_CFLAGS_DISALLOW added as regexp escape hatches; //go:cgo... directives disallowed outside the standard library. Shipped in Go 1.8.7 (44821583bc16), 1.9.4 (867fb18b6d5b), 1.10rc2 (1dcb5836ad2c).
  Not measured: No discussion anywhere in the thread of how many modules use cgo, what flags they pass, or how much of any module graph reaches the C toolchain.

- **Go Wiki: InvalidFlag** — go.dev wiki
  <https://go.dev/wiki/InvalidFlag>
  n/a (living page, post-2018) · Q2 · adjacent
  Measured: Not a measurement. Documents that 'a safelist of compiler/linker options that are permitted during go get, go build, and friends' exists, that violating it produces 'invalid flag in #cgo CFLAGS', and that CGO_CFLAGS_ALLOW (and CGO_LDFLAGS_ALLOW, CGO_CXXFLAGS_ALLOW) take a regexp to override the restriction.
  Not measured: Does not enumerate which flags are on the allowlist, does not distinguish environment-variable flags from #cgo directives explicitly, and gives no prevalence data.

- **cmd/go: improper sanitization of LDFLAGS (CVE-2023-29404 and CVE-2023-29405)** — golang/go issue tracker
  <https://github.com/golang/go/issues/60305>
  2023 · Q2 · adjacent
  Measured: Not a measurement; two vulnerability reports on the same mechanism. CVE-2023-29404: arguments of a number of non-optional flags are incorrectly treated as optional, letting disallowed flags be smuggled through LDFLAGS sanitization (gc and gccgo). CVE-2023-29405 (issue #60306): flags containing embedded spaces are mishandled, so the sanitizer sees one permitted flag with an argument while the shell re-splits on the spaces and executes the smuggled flags (gccgo only). Both trigger via a '#cgo LDFLAGS' directive on 'go get' of a malicious module or any build of untrusted code. Fixed in Go 1.19.10 and 1.20.5.
  Not measured: No counts of affected modules, no corpus scan, no flag-distribution data. Establishes that the Q2 mechanism is live and that the allowlist has been bypassed twice since 2018, nothing about prevalence.

- **Forward Compatibility and Toolchain Management in Go 1.21** — The Go Blog (Russ Cox)
  <https://go.dev/blog/toolchain>
  2023 · Q3 · adjacent
  Measured: Not a measurement; the announcement of the mechanism, 2023-08-14. 'The Go 1.21.0 go command will notice that you need Go 1.21.1, download it, and re-invoke that version's go command to finish the build.' On the security framing: when the go command downloads and runs other toolchains it 'downloads them as Go modules, inheriting all the security and privacy benefits of modules' and runs them from the module cache without installing to PATH. Documents GOTOOLCHAIN=go1.20.4 and the version+auto form.
  Not measured: Does not name the module path, does not describe checksum verification concretely, does not say what happens when the request cannot be satisfied, and gives no adoption estimate. Postdates nothing relevant — this is the origin of the feature, so Q3 prior art cannot be older.

- **Go Toolchains (reference)** — go.dev documentation
  <https://go.dev/doc/toolchain>
  n/a (living, Go 1.21+) · Q3 · adjacent
  Measured: Not a measurement; the authoritative mechanism. Toolchains are modules at path golang.org/toolchain, version v0.0.1-goVERSION.GOOS-GOARCH (e.g. golang.org/toolchain@v0.0.1-go1.21.3.linux-amd64). GOTOOLCHAIN values: local, <name>, <name>+auto, <name>+path, auto (= local+auto, downloads enabled, the default), path (= local+path, PATH only). Selection first searches $PATH for a program named e.g. go1.21.3 and only then downloads. Verbatim: 'Toolchains are downloaded like any other module, meaning that toolchain downloads can be proxied by setting GOPROXY and have their checksums checked by the Go checksum database. Because the specific toolchain used depends on the system's own default toolchain as well as the local operating system and architecture (GOOS and GOARCH), it is not practical to write toolchain module checksums to go.sum. Instead, toolchain downloads fail for lack of verification if GOSUMDB=off.' And: 'GOPRIVATE and GONOSUMDB patterns do not apply to the toolchain downloads.'
  Not measured: No counts: how many published modules name a toolchain, which versions, how often the download path is taken, or how often it fails. Documentation, not measurement.

- **Proposal: Extended forwards compatibility in Go (57001-gotoolchain)** — golang/proposal (Russ Cox)
  <https://go.googlesource.com/proposal/+/master/design/57001-gotoolchain.md>
  2022 · Q3 · adjacent
  Measured: Not a measurement; the design. 'Each Go release would be treated as a set of module versions, downloaded like any module, and checked against the checksum database before being used.' Acknowledges the dependency-triggered case: 'The Go toolchain will refuse to build a dependency that needs newer Go semantics than the current toolchain', and argues it 'should normally not happen' because go get updates the work module's toolchain line. Cites Cloud Native Buildpacks and GitHub Actions as systems that misread the go line.
  Not measured: No estimate of how many modules would specify a toolchain, no Go-version adoption distribution, no discussion of GOSUMDB requirements or GOPRIVATE non-applicability (those appear only later in the reference docs). Predates Go 1.21 by design — it is the proposal, not prior art on the shipped behaviour.

- **Bug#1040507: golang-1.21-go: downloads and runs binaries from the Internet without permission** — Debian BTS
  <https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=1040507>
  2023 (open through 2025) · Q3 · adjacent
  Measured: Not a measurement; a distro-level objection. Filed by brian m. carlson 2023-07-06: 'Go 1.21 provides the GOTOOLCHAIN environment variable and associated functionality. As part of this code, if go.mod indicates that a newer version of Go is required than the current toolchain supports, it proceeds by default to attempt to download a toolchain from the Internet and runs it without prompting the user', with concern about what cryptographic verification is performed when GOPROXY/GOSUMDB are disabled for privacy. Maintainer Tianon Gravi proposed changing the Debian default from auto to path, plus versioned goX.Y symlinks; still open as of Sept 2025, with the argument that automatic downloads should require explicit user configuration rather than being activated implicitly by a third party's go.mod.
  Not measured: No counting of any kind — no figure for how many modules request toolchains, how often Debian builds would trigger a download, or how many packages are affected.

- **go-1.21+ will silently download alternate toolchains by default (void-packages #44578)** — void-linux/void-packages issue tracker
  <https://github.com/void-linux/void-packages/issues/44578>
  2023 · Q3 · adjacent
  Measured: Not a measurement; a second distro raising the same objection independently. Filed by atweiden 2023-06-23, recommending export GOTOOLCHAIN=local to stop automatic downloads, motivated by reproducible package builds without unexpected network fetches.
  Not measured: No stated resolution in the issue text, and no count of affected packages. Corroborates that the concern is distro-wide, adds no numbers.

- **Go automatically downloads a newer toolchain if needed (HN discussion)** — Hacker News
  <https://news.ycombinator.com/item?id=41298116>
  2024 · Q3 · adjacent
  Measured: Not a measurement; community discussion dated 2024-08-20 on a kokada.dev post. Criticisms: 'That doesn't sound like a good reason to automatically download binaries and run them'; 'Should've been opt in behaviour by default not enforced'; and an operational account of losing 'half a day learning about and then unwinding "toolchain" being accidentally set across all our microservices' after a well-used OSS library set toolchain to 1.22 in what was billed as a patch release. Defences cite reproducible toolchain builds and publication in a transparency log, and the triviality of GOTOOLCHAIN=local.
  Not measured: No quantified data anywhere in the thread on how often the switch fires, how many modules carry a toolchain line, or how many builds are affected. The 'library set toolchain in a patch release' complaint is exactly the phenomenon Q3 asks to be counted, reported as an anecdote.

- **Go Telemetry dashboard and chart config** — The Go team (telemetry.go.dev)
  <https://telemetry.go.dev/config>
  2026 (window 2026-09-15 to 2026-09-21 on the dashboard) · Q3 (primary), Q2 · adjacent
  Measured: The vendor's own published counter set, opt-in. cmd/go counters: go/invocations, go/build/flag:{buildmode}, go/build/flag/buildmode:{archive,c-archive,c-shared,default,exe,pie,shared,plugin}, go/platform/host/darwin/major-version:{20..28}, go/vcs:{mod,git,hg,svn,fossil}, go/platform/target/port:{...}, go/goexperiment:{...}. cmd/compile: compile/invocations only. The only toolchain-mode counter in the whole config is gopls/gotoolchain:{auto,path,local,other}, under golang.org/x/tools/gopls.
  Not measured: No GOTOOLCHAIN counter under cmd/go at all — nothing on toolchain switching, toolchain downloads, or the toolchain line. No cgo or CGO_ENABLED counter. The dashboard does not state how many installations report. This is the strongest available evidence that even the vendor has not published this measurement, for either Q2 or Q3.

- **cmd/go: malicious module proxy can bypass checksum database (CVE-2026-42501)** — golang/go issue tracker
  <https://github.com/golang/go/issues/79070>
  2026 · Q3 (primary), Q4 · adjacent
  Measured: Not a measurement; an incident on the Q3 path. Reported by Mundur (github.com/M0nd0R). Verbatim: 'If, however, the checksum database returns a successful response that contains no entry for the module, the go command incorrectly permitted validation to succeed.' Explicitly framed for toolchains: 'A malicious module proxy can serve altered versions of the Go toolchain' when a different toolchain is selected via GOTOOLCHAIN or a go.work/go.mod toolchain line. Notes that 'setting GOTOOLCHAIN to a fixed version is not sufficient' — the base toolchain must be upgraded. Fix: the go command now checks that the expected module signature is present, not merely that any present signature matches.
  Not measured: No prevalence data — no statement of how many modules name a toolchain, how many users run untrusted proxies, or how often the path is exercised.

- **[security] Go 1.26.3 and Go 1.25.10 are released** — golang-announce mailing list
  <https://groups.google.com/g/golang-announce/c/qcCIEXso47M>
  2026 · Q3, Q4 · adjacent
  Measured: Not a measurement; the release announcement dated 2026-05-07 that dates and scopes CVE-2026-42501 ('A malicious module proxy could exploit a flaw in the go command's validation of module checksums to bypass checksum database validation'), alongside CVE-2026-39819 (cmd/go symlink in 'go bug'), CVE-2026-39817 (cmd/go unsanitized paths in 'go tool pack') and several net/http, net/mail and html/template issues. Fixed in Go 1.26.3 and 1.25.10.
  Not measured: No figures on exposure, adoption or module counts.

- **cmd/go: go.mod toolchain directive allows arbitrary execution (CVE-2023-39320)** — golang/go issue tracker
  <https://github.com/golang/go/issues/62198>
  2023 · Q3 · adjacent
  Measured: Not a measurement; the first incident on the Q3 path, within weeks of the feature shipping. Reported by Juho Nurminen of Mattermost. Verbatim: 'The go.mod toolchain directive, introduced in Go 1.21, could be leveraged to execute scripts and binaries relative to the root of the module when the go command was executed within the module.' Release-blocker for Go 1.22.
  Not measured: No prevalence figures. Relevant because it shows the toolchain line was a code-execution primitive from the outset, which is the framing Q3 asks about; it does not count anything.

- **cmd/go, x/mod/sumdb/tlog: fix transparency log tile verification bypass (CVE-2026-56865)** — golang/go issue tracker
  <https://github.com/golang/go/issues/80744>
  2026 · Q4 · adjacent
  Measured: Not a measurement; a second sumdb-integrity incident. Reported by Filippo Valsorda (Geomys), 2026-08-05. A malicious GOPROXY could forge up to two sumdb tiles, letting a requested module bypass the GOSUMDB check and persist attacker-controlled content in the local module cache, because not all tiles were verified against their parent tiles. Remediation advice: rm -r go.sum go.work.sum vendor/ && go mod tidy. Fixed in Go 1.27.
  Not measured: No corpus, no counts, no coverage figure for how much real traffic is actually sumdb-verified.

- **Go module proxy (policy page)** — Google / the Go team
  <https://proxy.golang.org/>
  n/a (living) · Q4 · adjacent
  Measured: Not a measurement; the operator's own statement of what the mirror does and does not guarantee. Verbatim: 'Whenever possible, the mirror aims to cache content in order to avoid breaking builds for people that depend on your package, so this bad release may still be available in the mirror even if it is not available at the origin' — including when the whole repository is deleted. 'If you would like to hide versions of a module from the go command, as well as pkg.go.dev, you should retract them', via a retract directive plus a new version. 'proxy.golang.org does not save all modules forever'; modules may become unavailable if unlicensed or removed from source and stale, but 'checksums will still remain in the checksum database regardless of whether or not they have become unavailable in the mirror'. GOPRIVATE glob patterns keep private modules off the public services; otherwise module paths and versions are sent to the remote server.
  Not measured: Publishes no statistics at all — no request volume, no cache-hit rate, no count of modules served, deleted or retracted, and no figure for what fraction of fetches are sumdb-covered.

- **Go Supply Chain Attack: Malicious Package Exploits Go Module Proxy Caching for Persistence** — Socket (Kirill Boychenko)
  <https://socket.dev/blog/malicious-package-exploits-go-module-proxy-caching-for-persistence>
  2025 · Q4 · exists
  Measured: Single-case write-up, 2025-02-04, not a corpus scan. github.com/boltdb-go/bolt, a typosquat of github.com/boltdb/bolt, published November 2021 with a backdoor giving remote code execution via C2 at 49.12.198.231:20022; the attacker let the module mirror cache the malicious v1.3.1, then rewrote the GitHub tag to point at clean code, so the repository looked legitimate while the proxy kept serving the backdoor. Resident over three years. Legitimate BoltDB has '8,367 other packages depending on it'. One further typosquat variant found (github.com/bolt-db/bolt, no malicious code). Reported to GitHub and Google 2025-01-30.
  Not measured: No population, no sample, no method beyond the single case plus one variant — explicitly not a census of typosquats or of cached-but-deleted modules. The 8,367 figure is the legitimate module's dependent count, not exposure to the malicious one.

- **Poisoned Go programming language package lay undetected for 3 years** — The Register (Connor Jones)
  <https://www.theregister.com/2025/02/04/golang_supply_chain_attack/>
  2025 · Q4 · adjacent
  Measured: Press coverage, 2025-02-04, of the Socket boltdb-go case. Records that 'the malicious version is still searchable on the Go Module Proxy and has been left undetected for three years'; that this is 'among the first documented instances of a malicious actor exploiting the Go Module Mirror's indefinite caching of modules'; Google's subsequent confirmation that the module was removed from both the Go module proxy and GitHub and added to Go's vulnerability database; and that only two known imports occurred, both by a single small cryptocurrency project.
  Not measured: No independent measurement — downstream reporting of one vendor's single case. Useful for dating the Go team's takedown response and for the 'only two known imports' correction to the alarm level, nothing more.

- **New Type of Supply Chain Attack Could Put Popular Admin Tools at Risk (ChainJacking)** — Intezer (Joakim Kennedy), disclosed with Alik Koldobsky of Checkmarx
  <https://intezer.com/blog/chainjacking-supply-chain-attack-puts-popular-admin-tools-at-risk/>
  2021 · Q4 · adjacent
  Measured: Mechanism write-up, 2021-11-16, not a measurement. 'After changing your username, your old username becomes available for anyone else to claim' — so an attacker claiming a released GitHub username can serve code to anyone still importing github.com/olduser/repo via go get, since Go resolves module identity from the repository path. Uses Logrus as a hypothetical illustration.
  Not measured: States only 'We have identified a number of open-source Go packages that are susceptible to ChainJacking' — no number, no sample size, no statement of what population was scanned or how. By this sweep's rule, adjacent rather than exists: an assertion without a stated sample is not a measurement.

- **SourceHut will (not) blacklist the Go module mirror** — SourceHut (Drew DeVault)
  <https://sourcehut.org/blog/2023-01-09-gomodulemirror/>
  2023 · Q4 · adjacent
  Measured: Observational figures from one forge's own logs, 2023-01-09, on the mirror's refresh traffic: '~2,500 per hour' requests in batches of 'up to a dozen clones at once'; 'a single git repository can be fetched over 100 times per hour'; 'about 70% of all outgoing network traffic from git.sr.ht'; 'A single module can produce as much as 4 GiB of daily traffic'. Originally reported to the Go team 2021-02-24.
  Not measured: No stated methodology, one vantage point, no denominator for the ecosystem. Measures the mirror's outbound fetch behaviour against one host, not proxy coverage of user fetches, and nothing about sumdb coverage or GOPRIVATE.

- **Cursed Bundler: Using go get to install Ruby Gems** — Andrew Nesbitt (personal blog)
  <https://nesbitt.io/2025/12/25/cursed-bundler-using-go-get-to-install-ruby-gems.html>
  2025 · Q4 · adjacent
  Measured: Proof of concept, 2025-12-25, not a measurement. Adds a go.mod to Ruby repositories and uses go get as transport, showing the proxy and sumdb will ingest and permanently log arbitrary non-Go content. Verbatim: 'What does the proxy actually check? Not much. It would like a go.mod file in the repo, but versions come from git tags'; the sumdb 'hashes whatever zip file it receives'; 'People already abuse this. You'll find protobuf definitions hosted as Go modules, with no Go code at all.' Notes that namespace control still derives from owning the GitHub account or domain in the import path.
  Not measured: No counts of how much non-Go content is in the index, no sample, no method. Bears on Q4's 'who controls module paths and what the proxy accepts' as mechanism only.

- **Go sumdb fixes reopen who anchors module trust** — freenode (segfault)
  <https://freenode.net/article/go-sumdb-fixes-reopen-who-anchors-module-trust>
  2026 · Q4 · adjacent
  Measured: Commentary, 2026-08-20, on CVE-2026-56865 and CVE-2026-56864, fixed across Go 1.26.6, 1.25.13, 1.27rc3 and x/mod v0.40.0. Argument: a hostile proxy alone could forge 'up to two sumdb tiles', and a coordinated proxy plus sumdb operator could serve unauthenticated hashes, so 'malicious module content could land in a developer's local cache without the transparency log catching it'; where an organization runs its own GOPROXY and GOSUMDB, the checksum database becomes 'just another config knob on the same trust root' rather than an independent verification layer.
  Not measured: No population, sample or method — explicitly analysis, not research. Frames the sumdb-coverage question this sweep finds unmeasured, without measuring it.

- **Combining dependencies with commit information** — Open Source Insights blog, Google (Baqiao Liu)
  <https://blog.deps.dev/combining-dependencies-with-commits/>
  2023 · Q1 · adjacent
  Measured: The closest published attempt in this modality at joining people to a Go dependency graph, 2023-11-29 (an internship project). Method: take deps.dev dependency edges, add authorship from commit history, insert bidirectional edges among all pairs of repositories that share authors, run weighted PageRank in Python (script published alongside). Population: 'a sub-ecosystem of our open source usage (a graph of ~500 nodes and ~10k edges)'. Output: relative rank shifts for four packages — golang/protobuf 1→2, josharian/intern 2→1, google/go-cmp 4→3, numpy/numpy 3→4 — with the observation that intern and go-cmp 'have fewer contributors than the other two packages'.
  Not measured: Does not count distinct owners or organizations per project, does not report what fraction of the people behind a build never appear in the project's own manifest, and the demonstration graph is ~500 nodes rather than a real project's transitive closure. Ranks packages by criticality; does not answer the publisher question.

- **Go Supply Chain Security: Introducing unisupply** — UniDoc (Asif Ahmed)
  <https://unidoc.io/post/go-supply-chain-security-unisupply/>
  2026 · Q1 · adjacent
  Measured: Tool announcement, 2026-06-07, not a measurement. unisupply walks a Go project's dependency tree and 'scores the supply chain risk of every module in it, direct and transitive, in one pass' across nine scanners including maintainer analysis and typosquat detection; an optional Trust Index can identify maintainer organizations. Frames the problem qualitatively: 'A typical Go service declares a handful of direct dependencies and then inherits dozens more transitively', and 'for most teams, the go.sum file lists modules maintained by people they will never meet'.
  Not measured: Publishes no run of the tool over any sample — no distinct-owner counts, no distribution across projects, no population or method. This is the clearest case of 'somebody built the thing that would let you measure this' without the measurement, which is exactly the distinction Q1 asks for.

- **Results from the 2025 Go Developer Survey** — The Go Blog
  <https://go.dev/blog/survey2025>
  2026 (fielded Sept 2025, published 2026-01-21) · Q1 · adjacent
  Measured: A real survey measurement with population and method, but of developers rather than of builds. n=5,379 respondents; 87% self-identified as professional developers; 91% satisfied with Go. Relevant figure: the third-largest frustration is 'Finding trustworthy Go modules and packages' (26% of respondents). Open-text analysis reports that respondents' trust signals include 'project activity, code quality, recent adoption trends, or the specific organizations that support or rely upon the module', and that 'many 3rd-party modules [are] of marginal quality'.
  Not measured: Full text pulled with curl and grepped: no question about cgo, no question about GOTOOLCHAIN or the toolchain directive, no question about GOPRIVATE or the proxy, and no count of dependencies, publishers or owners. Measures the felt problem behind Q1, not the quantity Q1 asks for.

- **The Go Ecosystem in 2025: Key Trends in Frameworks, Tools, and Developer Practices** — JetBrains blog
  <https://blog.jetbrains.com/go/2025/11/10/go-language-trends-ecosystem-2025/>
  2025 · Q1, Q4 · adjacent
  Measured: Vendor summary of the State of Developer Ecosystem Report 2025; AI-tools data 'collected between April and June 2025'. Headline figure quoted: '2.2 million professional developers use Go as their primary programming language – twice as many as five years ago'; 'more than 70% of Go developers report using at least one AI assistant'.
  Not measured: Does not disclose sample size or respondent count in the article itself, and covers none of this sweep's subjects: no cgo usage, no GOTOOLCHAIN or toolchain-directive adoption, no dependency counts, no module-proxy or supply-chain-trust questions. Recorded to close the 'maybe the vendor surveys asked' line of inquiry.

- **Go Toolchain Distribution Security: How go.mod Pins Your Compiler** — Safeguard (Shadab Khan)
  <https://safeguard.sh/resources/blog/go-toolchain-distribution-security>
  2026 · Q3 · adjacent
  Measured: Nothing. Explainer published 2026-03-06. Describes the mechanics of the toolchain directive and its supply-chain implications and recommends practices. The nearest thing to data is anecdotal: 'Most teams I work with discover gaps in at least two of those four when they first look.'
  Not measured: No numbers on how many modules declare a toolchain, no adoption rate, no sample, no method. Listed because it is the highest-ranking search result that looks like Q3 prior art and is not: a blog asserting a shape with no stated sample is adjacent, not exists.

- **Perfectly Reproducible, Verified Go Toolchains** — The Go Blog (Russ Cox)
  <https://go.dev/blog/rebuild>
  2023 · Q3 · adjacent
  Measured: Not a measurement of the ecosystem; 2023-08-28. Go 1.21.0 is 'the first Go toolchain with perfectly reproducible builds'. Introduces golang.org/x/build/cmd/gorebuild, which 'will start with the source code in our Git repository and rebuild the current Go versions, checking that they match the archives posted on go.dev/dl', run nightly with results at go.dev/rebuild, and reproducible by anyone. Demonstrates rebuilding Ubuntu's golang-1.21 binaries bit-for-bit from upstream source.
  Not measured: Does not discuss the golang.org/toolchain modules, proxy distribution of toolchains, or the checksum database's role in verifying a downloaded toolchain — it verifies the published archives, which is a different link in the chain from the one GOTOOLCHAIN=auto uses. No adoption or success-rate figures.

- **GoSurf: Identifying Software Supply Chain Attack Vectors in Go** — arXiv (Cesarano, Andersson, Natella, Monperrus) — ACADEMIC MODALITY, flagged not claimed
  <https://arxiv.org/html/2407.04442v1>
  2024 · Q2 · adjacent
  Measured: Enumerates 12 attack vectors over three phases: pre-build P1 //go:generate and P2 test/fuzz/benchmark/example functions; initialization I1 global variable init and I2 init() hooks; execution E1 constructors, E2 reflection, E3 interface polymorphism, E4 unsafe pointers, E5 CGO static linking, E6 assembly static linking, E7 dynamic library linking, E8 dynamic external execution. Analyses 10 Go projects in detail plus a stated sample of the top 500 most-imported packages. CGO (E5) occurrences: Kubernetes 803, Go-Ethereum 21.
  Not measured: Counts call sites and occurrences within projects, not whether a build invokes the C toolchain and not what flags dependencies pass to the compiler and linker. Detailed statistics are given for the 10-project sample rather than the full 500. Does not traverse a transitive module graph. Belongs to the academic sweep; recorded here so the arm does not miss it.

- **An Empirical Study of CGO Usage in Go Projects — Distribution, Purposes, Patterns and Critical Issues** — Journal of Systems and Software vol. 231 (Chen, Ding, Zhang, Li, Tang) — ACADEMIC MODALITY, flagged not claimed
  <https://arxiv.org/abs/2508.09875>
  2026 (Jan 2026 issue; arXiv Aug 2025) · Q2 · adjacent
  Measured: Population: 920 open-source Go projects. Method: a purpose-built CGOAnalyzer identifying CGO features. Headline: '11.3% of analyzed Go projects utilize CGO, with usage concentrated in a subset of projects'; 60.58% of CGO projects have 10–1000 CGO call sites, 5.8% exceed 1000; 19 types of CGO-related issue and 15 usage patterns catalogued.
  Not measured: Top-level projects only, not a transitive module graph, so it cannot say how much of a real build's dependency closure reaches the C toolchain. No analysis of #cgo CFLAGS/LDFLAGS content — what flags dependencies actually pass is untouched. Selection methodology for the 920 not stated in the abstract. The nearest thing to Q2 that exists, and still not Q2.

- **Beyond Takedown: Measuring Malicious Go Module Persistence in the Wild** — arXiv cs.CR (Minjae Bae, Carter Yagemann) — ACADEMIC MODALITY, flagged not claimed
  <https://arxiv.org/abs/2606.26291>
  2026 · Q4 · exists
  Measured: The only corpus-scale measurement of malicious Go modules found in this sweep, submitted 2026-06-24. Method: manual GitHub search across 2,113 repositories plus a large-scale scan of 12.3 million index entries with GOAST, a custom deobfuscating AST scanner; collection July 2024 to mid-July 2025, 12,304,230 raw records, 60,232 suspicious candidates after restricting to first-seen on or after 2025-03-01. Findings: 2,289 malicious module versions identified; 684 malicious repositories removed by GitHub post-disclosure; 1,377 module versions remediated by the Go team; 99.4% of artifacts removed from GitHub remained accessible via the Go proxy — a quantified 'takedown-remediation gap'.
  Not measured: Does not touch GOTOOLCHAIN, cgo, or module owner counts. Scoped to one campaign shape (repackaged modules with obfuscated downloader code), so it is not a general malicious-module census. Belongs to the academic sweep; recorded here because it is the figure the press ('1,377 remediated, 684 removed') is quoting without attribution.

- **Supply Chain Security in Go: fsnotify Access Changes** — dasroot.net
  <https://dasroot.net/posts/2026/05/supply-chain-security-go-fsnotify-access-changes/>
  2026 · Q1, Q4 · adjacent
  Measured: Commentary on a single governance incident, May 2026. Yasuhiro Matsumoto (mattn) removed from the fsnotify GitHub organization by maintainer Martin Tournoij, who said the removed accounts 'held commit rights for historical reasons but had never functioned as active maintainers'. Scale cited: 'over 321,000 dependent projects' and 10,700 stars. Concerns raised by contributors at Grafana, Docker and Socket; Kubernetes contributors opened discussions about forking. No release was found compromised; v1.10.0 and v1.10.1 followed.
  Not measured: One incident, no population, no sample, no method. Illustrates that who can push to a module in a Go build is opaque and consequential — the premise of Q1 — without counting anything.

### Searches run

- `web search :: GOTOOLCHAIN security toolchain download supply chain Go 1.21`
- `web search :: Go modules transitive dependencies how many maintainers trust measurement go.mod`
- `web search :: cgo #cgo LDFLAGS security dependency arbitrary compiler flags Go build`
- `web search :: malicious Go modules typosquatting module proxy incident report`
- `web search :: GopherCon talk Go module supply chain security measurement checksum database`
- `web search :: "toolchain" directive go.mod how many modules percentage survey count`
- `web search :: Go module ecosystem census number of modules index.golang.org statistics deps.dev`
- `web search :: blog measured how many Go modules use cgo percentage of module graph C compiler`
- `web search :: "go:generate" OR cgo supply chain talk DEF CON Black Hat Go build arbitrary code execution`
- `web search :: golang security release cgo LDFLAGS smuggling CVE-2023-29404 CVE-2023-29405 arbitrary code execution`
- `web search :: golang/go issue GOTOOLCHAIN security concern download toolchain untrusted go.mod proposal`
- `web search :: Go module deletion proxy cache retraction "GOPRIVATE" OR "GONOSUMDB" fraction of fetches sumdb coverage measurement`
- `web search :: vanity import path hijack expired domain Go module takeover incident`
- `web search :: Chainjacking Go repository username change hijack Intezer 2022 popular repository namespace retirement`
- `web search :: "go.mod" blog how many indirect dependencies organizations behind a Go binary count distinct GitHub orgs`
- `web search :: Go module mirror proxy.golang.org usage statistics requests per day Go team blog`
- `web search :: Socket OR Snyk OR Checkmarx scan Go modules "#cgo" directive malicious flags corpus`
- `web search :: Go telemetry telemetry.go.dev charts gotoolchain counter cmd/go toolchain switch`
- `web search :: "who can push code to your build" OR "how many maintainers" Go dependency trust bus factor blog analysis`
- `web search :: Go module index scan "golang.org/toolchain" versions published count mirror`
- `web search :: Socket malicious Go modules 2025 disk wiper campaign how many modules found count`
- `web search :: Go module proxy cannot delete module version "deleted" cached forever policy golang issue removing module`
- `web search :: deps.dev Open Source Insights Go modules blog analysis dependency graph publishers`
- `web search :: "CGO_ENABLED" how many popular Go libraries require cgo analysis pure Go percentage`
- `web search :: Go supply chain "how many different people" OR "how many organizations" can ship code into your Go program`
- `web search :: Hacker News GOTOOLCHAIN auto downloads compiler discussion criticism go.mod toolchain line`
- `web search :: golang-nuts mailing list GOTOOLCHAIN auto disable air-gapped enterprise policy toolchain download`
- `web search :: deps.dev blog "Combining dependencies with commit information" authors PageRank packages Go`
- `web search :: "go.mod" security research scanning module corpus "toolchain" line prevalence 2025 2026`
- `web search :: Go module ecosystem count distinct GitHub owners organizations module paths host breakdown analysis`
- `web search :: "#cgo LDFLAGS" OR "#cgo CFLAGS" survey what flags Go dependencies pass linker audit build`
- `web search :: The Register OR InfoWorld Go modules checksum database sumdb coverage private modules never verified`
- `web search :: FOSDEM talk Go modules supply chain proxy sumdb transparency log 2024 2025 2026`
- `web search :: Go project dependency audit blog "distinct organizations" OR "distinct owners" OR "unique maintainers" transitive go.sum count`
- `web search :: "go generate" not run by go build security misconception measurement Go modules that ship generate directives`
- `web search :: Go 1.21 toolchain line adoption how many repositories added toolchain directive GitHub search`
- `web search :: Go Developer Survey 2025 results go.dev blog toolchain cgo dependencies security supply chain question`
- `web search :: "module proxy" Go GOPROXY direct fraction of developers corporate proxy Athens JFrog measurement how many bypass`
- `web search :: "Go module" ownership derived from path host "owner" analysis who controls module paths concentration measurement`
- `web search :: Go supply chain security tool counts maintainers per dependency tree "go.sum" report blog 2026`
- `web search :: Go modules assembly .s files prevalence measurement corpus how many packages contain assembly`
- `web search :: Go module proxy takedown malicious modules removed count Google response how many removed 2025`
- `web search :: fsnotify maintainer access incident 2026 Go module supply chain`

