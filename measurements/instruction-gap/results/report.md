# instruction-gap — generated report

Generated 2026-09-17T17:10:32.801Z from `results/population.ndjson` and `results/cells.ndjson`. Shares carry 95 % Wilson intervals; means carry a cluster-robust interval (framework clusters).

## Frame and sample

Frame: 38,791 repositories. Drawn: 1200. Read: 892.

| status | n |
|---|---|
| ok | 892 |
| no-package-json | 182 |
| no-lockfile | 120 |
| binary-lockfile | 6 |

Projects with a root package.json: 1018/1200 = 84.8 % [82.7 %–86.8 %]. Of those, with a lockfile at the root: 898/1018 = 88.2 % [86.1 %–90.1 %].

| lockfile | n | share of projects with a lockfile |
|---|---|---|
| package-lock.json | 492 | 492/898 = 54.8 % [51.5 %–58.0 %] |
| pnpm-lock.yaml | 246 | 246/898 = 27.4 % [24.6 %–30.4 %] |
| yarn.lock | 104 | 104/898 = 11.6 % [9.7 %–13.8 %] |
| bun.lock | 50 | 50/898 = 5.6 % [4.2 %–7.3 %] |
| bun.lockb | 6 | 6/898 = 0.7 % [0.3 %–1.5 %] |

Projects committing more than one lockfile: 42/898 = 4.7 % [3.5 %–6.3 %].

## Per project: declared, resolved, published by whom

| per project | p10 | p25 | median | p75 | p90 | mean |
|---|---|---|---|---|---|---|
| direct dependencies declared | 5.1 | 13.0 | **26.0** | 56.3 | 104.0 | 44.0 |
| resolved (name, version) pairs | 112.0 | 292.8 | **604.0** | 1074.0 | 1653.0 | 775.8 |
| resolved distinct names | 111.1 | 272.8 | **543.0** | 927.0 | 1411.8 | 669.2 |
| distinct publishers | 40.0 | 93.8 | **165.0** | 259.0 | 378.9 | 194.2 |
| distinct maintainer accounts | 106.1 | 238.8 | **401.0** | 628.0 | 925.7 | 473.7 |
| ratio resolved / direct | 8.7 | 12.9 | **19.1** | 27.7 | 45.4 | 25.8 |
| ratio publishers / direct | 2.4 | 3.5 | **5.3** | 7.7 | 12.7 | 7.0 |
| ratio maintainers / direct | 6.0 | 8.6 | **12.9** | 19.9 | 30.8 | 17.6 |
| publishers behind a direct dependency | 5.0 | 10.0 | **18.0** | 36.0 | 64.0 | 28.6 |
| publishers behind no direct dependency | 34.0 | 80.8 | **143.0** | 227.3 | 329.7 | 165.6 |
| share of publishers the developer never named | 0.8 | 0.8 | **0.9** | 0.9 | 0.9 | 0.8 |
| publishers that are not automation (name heuristic) | 30.0 | 74.0 | **130.0** | 213.0 | 316.6 | 156.9 |
| ratio non-automation publishers / direct | 1.8 | 2.6 | **4.3** | 6.4 | 10.6 | 5.8 |

Production only (the 461 npm lockfiles mark dev dependencies; dev ones excluded):

| per project (npm lockfiles) | p10 | p25 | median | p75 | p90 | mean |
|---|---|---|---|---|---|---|
| direct dependencies in `dependencies` | 0.0 | 1.0 | **5.0** | 18.0 | 38.0 | 14.4 |
| resolved versions not marked dev | 0.0 | 1.0 | **53.0** | 200.0 | 473.0 | 172.0 |
| publishers behind them | 0.0 | 1.0 | **20.0** | 69.0 | 146.0 | 51.8 |
| ratio publishers / direct, production | 0.0 | 0.9 | **2.5** | 4.8 | 10.0 | 4.7 |

Publisher kinds, summed over projects (a publisher counts once per project):

- npm user accounts: 147576; trusted-publishing repositories: 25615; of all of these, 33215 carry an automation name; versions whose publisher could not be read: 198.
- share of a project's publishers that are trusted-publishing repositories: median 12.6 %, mean 14.4 %.
- projects with at least one trusted-publishing publisher: 653/892 = 73.2 % [70.2 %–76.0 %]; versions with a provenance attestation: 103416 of 691842 read.
- registry lookups: 691842 read, 17 versions no longer on the registry, 1 errors; 156 resolved pairs are not registry packages (git, tarball).

## Decisions the manager made

| per project | p10 | p25 | median | p75 | p90 | mean |
|---|---|---|---|---|---|---|
| versions the manager chose | 112.0 | 291.8 | **601.5** | 1063.3 | 1646.3 | 767.7 |
| packages the developer never named | 102.3 | 259.0 | **514.5** | 860.0 | 1320.0 | 625.8 |
| share of direct specs pinned exactly | 0.0 | 0.0 | **0.0** | 0.1 | 0.5 | 0.1 |
| packages present in more than one version | 1.0 | 14.0 | **44.5** | 109.0 | 190.8 | 80.1 |

Projects pinning at least one direct dependency exactly: 471/892 = 52.8 % [49.5 %–56.1 %]; projects pinning all of them: 28/892 = 3.1 % [2.2 %–4.5 %].

## Code that runs at install

Projects resolving at least one package with an install script (preinstall, install, postinstall, or a native build): 781/892 = 87.6 % [85.2 %–89.6 %].

| per project | p10 | p25 | median | p75 | p90 | mean |
|---|---|---|---|---|---|---|
| packages with install-time code | 0.0 | 1.0 | **3.0** | 5.0 | 8.0 | 3.6 |
| of which direct dependencies | 0.0 | 0.0 | **0.0** | 1.0 | 3.0 | 1.0 |
| publishers with install-time code | 0.0 | 1.0 | **3.0** | 5.0 | 7.0 | 3.4 |
| maintainer accounts behind install-time code | 0.0 | 2.0 | **5.0** | 9.0 | 17.9 | 7.4 |

Projects where install-time code comes from a package the developer never named: 740/892 = 83.0 % [80.4 %–85.3 %].

## Hosts

Only npm and yarn v1 lockfiles record a URL per package (572 projects); pnpm, Yarn Berry and bun resolve registry packages against the configured registry and record a URL only for tarball and git sources. Figures below are over the 572.

| per project | p10 | p25 | median | p75 | p90 | mean |
|---|---|---|---|---|---|---|
| distinct hosts in resolved URLs | 1.0 | 1.0 | **1.0** | 1.0 | 2.0 | 1.1 |

| host in resolved URLs | projects |
|---|---|
| registry.npmjs.org | 496/572 = 86.7 % [83.7 %–89.3 %] |
| registry.yarnpkg.com | 77/572 = 13.5 % [10.9 %–16.5 %] |
| github.com | 33/572 = 5.8 % [4.1 %–8.0 %] |
| registry.npmmirror.com | 24/572 = 4.2 % [2.8 %–6.2 %] |
| codeload.github.com | 6/572 = 1.0 % [0.5 %–2.3 %] |
| gitlab.gnome.org | 1/572 = 0.2 % [0.0 %–1.0 %] |
| npm.flatt.tech | 1/572 = 0.2 % [0.0 %–1.0 %] |
| npm.pkg.github.com | 1/572 = 0.2 % [0.0 %–1.0 %] |
| cdn.sheetjs.com | 1/572 = 0.2 % [0.0 %–1.0 %] |
| na.artifactory.swg-devops.com | 1/572 = 0.2 % [0.0 %–1.0 %] |
| gitpkg.vercel.app | 1/572 = 0.2 % [0.0 %–1.0 %] |

Projects with at least one resolved URL outside registry.npmjs.org and its yarn alias: 67/572 = 11.7 % [9.3 %–14.6 %].
Over all 892 projects, those resolving at least one git or tarball dependency: 68/892 = 7.6 % [6.1 %–9.6 %].

Tarball hosts recorded by the registry for the resolved versions: registry.npmjs.org 691842.

## Who is in every tree: publisher concentration

Distinct publishers across all projects: 7569. In one project only: 3256/7569 = 43.0 % [41.9 %–44.1 %]. In half the projects or more: 79.

| publisher | projects reached |
|---|---|
| types | 825/892 = 92.5 % [90.6 %–94.0 %] |
| isaacs | 820/892 = 91.9 % [90.0 %–93.5 %] |
| sindresorhus | 816/892 = 91.5 % [89.5 %–93.1 %] |
| qix | 804/892 = 90.1 % [88.0 %–91.9 %] |
| styfle | 774/892 = 86.8 % [84.4 %–88.8 %] |
| typescript-bot | 760/892 = 85.2 % [82.7 %–87.4 %] |
| ljharb | 747/892 = 83.7 % [81.2 %–86.0 %] |
| juliangruber | 744/892 = 83.4 % [80.8 %–85.7 %] |
| phated | 744/892 = 83.4 % [80.8 %–85.7 %] |
| jonschlinkert | 741/892 = 83.1 % [80.5 %–85.4 %] |
| matteo.collina | 732/892 = 82.1 % [79.4 %–84.4 %] |
| alexeyraspopov | 727/892 = 81.5 % [78.8 %–83.9 %] |
| kevva | 725/892 = 81.3 % [78.6 %–83.7 %] |
| lukeed | 724/892 = 81.2 % [78.5 %–83.6 %] |
| satazor | 723/892 = 81.1 % [78.4 %–83.5 %] |
| mathias | 719/892 = 80.6 % [77.9 %–83.1 %] |
| feross | 710/892 = 79.6 % [76.8 %–82.1 %] |
| pipobscure | 696/892 = 78.0 % [75.2 %–80.6 %] |
| jridgewell | 691/892 = 77.5 % [74.6 %–80.1 %] |
| vitaly | 691/892 = 77.5 % [74.6 %–80.1 %] |
| dfcreative | 690/892 = 77.4 % [74.5 %–80.0 %] |
| esp | 678/892 = 76.0 % [73.1 %–78.7 %] |
| marijn | 674/892 = 75.6 % [72.6 %–78.3 %] |
| tootallnate | 674/892 = 75.6 % [72.6 %–78.3 %] |
| lydell | 670/892 = 75.1 % [72.2 %–77.8 %] |
| jdalton | 668/892 = 74.9 % [71.9 %–77.6 %] |
| doowb | 667/892 = 74.8 % [71.8 %–77.5 %] |
| substack | 667/892 = 74.8 % [71.8 %–77.5 %] |
| google-wombot | 663/892 = 74.3 % [71.4 %–77.1 %] |
| webreflection | 661/892 = 74.1 % [71.1 %–76.9 %] |

Share of a project's publishers that are in the common core (present in ≥ 50 % of projects): median 33.3 %, mean 34.6 %.

## Design effect: projects on the same framework

| framework cluster | projects |
|---|---|
| react | 223 |
| typescript-only | 178 |
| none | 136 |
| next | 110 |
| express | 48 |
| vite-only | 41 |
| vue | 36 |
| webpack-only | 35 |
| angular | 16 |
| svelte | 13 |
| astro | 12 |
| electron | 10 |
| hono | 7 |
| koa | 7 |
| sveltekit | 6 |
| nest | 4 |
| nuxt | 3 |
| gatsby | 3 |
| remix | 2 |
| fastify | 1 |
| react-native | 1 |

| mean of | mean | iid 95 % | cluster-robust 95 % | DEFF | ICC | clusters (mean size) |
|---|---|---|---|---|---|---|
| resolved / direct | 25.8 | [23.5–28.1] | [19.9–31.7] | 6.5 | 0.037 | 21 (42.5) |
| publishers / direct | 7.0 | [6.5–7.5] | [5.2–8.8] | 11.4 | 0.081 | 21 (42.5) |
| maintainers / direct | 17.6 | [16.2–19.0] | [13.1–22.1] | 10.4 | 0.072 | 21 (42.5) |
| distinct publishers | 194.2 | [184.6–203.8] | [136.2–252.2] | 36.5 | 0.286 | 21 (42.5) |
| resolved versions | 775.8 | [730.2–821.4] | [512.0–1039.6] | 33.5 | 0.261 | 21 (42.5) |
| log10 publishers | 2.1 | [2.1–2.1] | [1.9–2.3] | 41.1 | 0.311 | 21 (42.5) |

Publisher-set overlap (Jaccard) between pairs of projects: same framework 0.212 (50053 pairs), different or no framework 0.168 (347333 pairs).

## By manager

| manager | projects | median direct | median resolved | median publishers | median publishers/direct | lockfile records URLs |
|---|---|---|---|---|---|---|
| npm | 492 | 19.0 | 445.0 | 132.0 | 5.7 | yes |
| pnpm | 246 | 46.5 | 875.0 | 216.5 | 4.5 | no |
| yarn | 80 | 33.5 | 850.5 | 208.0 | 5.7 | yes |
| bun | 50 | 33.5 | 638.5 | 170.0 | 3.8 | no |
| yarn-berry | 24 | 39.0 | 1112.0 | 259.0 | 5.3 | no |

## Notes recorded per project

36 projects carry a note (several lockfiles, truncated tree, unreadable manifest):

- pocketnetteam/pocketnet.gui: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- tdegrunt/jsonschema: several lockfiles (package-lock.json, yarn.lock); package-lock.json taken
- Winedays/KCouper: several lockfiles (package-lock.json, bun.lockb); package-lock.json taken
- PAIR-code/umap-js: several lockfiles (package-lock.json, yarn.lock); package-lock.json taken
- jwangkun/Prompt-Tools: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- frostmute/make-it-rain: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- Bluefissure/pal-conf: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- flowagi-eu/nyno: several lockfiles (package-lock.json, bun.lock); package-lock.json taken
- 0xbigshaq/firepwn-tool: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- engageintellect/cook: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- Signal-Execution-Labs/forex-trading-ai-agent: package.json is not JSON
- ct-js/ct-js: several lockfiles (package-lock.json, bun.lock); package-lock.json taken
- xiaodoudou/PlexIPTV: several lockfiles (package-lock.json, yarn.lock); package-lock.json taken
- jaroslaw-weber/algo-lens: several lockfiles (package-lock.json, bun.lockb); package-lock.json taken
- josephgoksu/prime-nestjs: several lockfiles (package-lock.json, bun.lock); package-lock.json taken
- gregjacobs/Autolinker.js: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- darrenhinde/OpenAgentsControl: several lockfiles (package-lock.json, bun.lock); package-lock.json taken
- sediman-agent/OpenSkynet: several lockfiles (package-lock.json, bun.lock); package-lock.json taken
- kazelad/prediction-market-trade-sdk: package.json is not JSON
- Yeachan-Heo/oh-my-codex: several lockfiles (package-lock.json, bun.lock); package-lock.json taken
- KirankumarAmbati/I-can-not-REACT: several lockfiles (package-lock.json, yarn.lock); package-lock.json taken
- Zizzamia/perfume.js: several lockfiles (package-lock.json, yarn.lock); package-lock.json taken
- trustwallet/trust-web3-provider: several lockfiles (yarn.lock, bun.lockb); yarn.lock taken
- butterbase-ai/butterbase: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- joelwmale/webhook-action: several lockfiles (package-lock.json, yarn.lock); package-lock.json taken
- ConardLi/easy-dataset: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- googlecreativelab/morse-learn: several lockfiles (package-lock.json, yarn.lock); package-lock.json taken
- tinacms/tinasaurus: several lockfiles (package-lock.json, yarn.lock, pnpm-lock.yaml); package-lock.json taken
- LiteFarmOrg/LiteFarm: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- GoogleChromeLabs/react-shrine: several lockfiles (package-lock.json, yarn.lock); package-lock.json taken
- not-matthias/apollo: several lockfiles (package-lock.json, bun.lock); package-lock.json taken
- cncf/svg-autocrop: several lockfiles (package-lock.json, npm-shrinkwrap.json, yarn.lock); package-lock.json taken
- dgflash/oops-framework: several lockfiles (package-lock.json, yarn.lock); package-lock.json taken
- yzua/sqlite-online: several lockfiles (package-lock.json, bun.lock); package-lock.json taken
- superdesigndev/superdesign: several lockfiles (package-lock.json, pnpm-lock.yaml); package-lock.json taken
- memvid/design-memory: several lockfiles (package-lock.json, bun.lock); package-lock.json taken
