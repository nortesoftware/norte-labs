# ecosystems/crates — generated report

## Sample

- drawn 1000; ok 660; no-Cargo.lock 235; no-Cargo.toml 105
- with a root Cargo.toml, commit a root Cargo.lock: 660/895 = 73.7 % [70.8–76.5]
- cells computed: 660

## Per project

- declared: median 30 [15.8–50.5]
- resolved crates.io versions: median 319 [174.8–559]
- distinct publishers: median 113.5 [65.8–181]; users 102 [58–166]; trusted-publishing repositories 7.5 [2–16]
- without automation accounts and repositories (instruction-gap's pattern, unchanged): median 102 [58–164.5]
- publishers behind a declared crate: median 21 [11–35]
- publishers behind no declared crate, share of the project's publishers: 79.0 % [p10 63.4 %, p90 90.0 %] (over the 658 projects with at least one publisher)
- owners with permission to publish (users and teams): median 183 [108–283]; teams 33 [19.8–48]
- resolved versions with no recorded publisher: 3623 of 257307; not on crates.io any more: 0
- other sources, versions: git 2598
- projects with no crates.io dependency: 2

## The design effect

- clusters: 17. Publisher-set overlap (Jaccard) within a cluster 0.271, across 0.228.
- publishers per project: intra-class correlation 0.445, design effect 35.9 (mean 129.8), a ratio of the cluster-robust to the independent variance of the mean over 17 clusters; leaving out one of the five largest clusters gives 26.6 to 43.3.
- With this many clusters the medians and the per-cluster figures are the citable ones.

| cluster | n | median declared | median publishers | median never named |
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

