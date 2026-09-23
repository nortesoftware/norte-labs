# ecosystems/go — generated report

400 cells, 360 resolved. Shares are n/N with 95 % Wilson intervals; medians carry p10 and p90; means carry a cluster-robust interval with the ecosystem as the cluster, and the design effect against the iid interval.

## Cells

- status: ok 360; no-go.mod 35; list-failed 5

## The graph

- modules resolved: median 82 [p10 6, p90 515]; direct: median 10 [p10 2, p90 38]

## Owners, both rules

- **Rule A (repository owner)** — owners per project: median 41 [p10 3, p90 215]; mean 79.7 ± 53.4 (cluster-robust, design effect 29.53)
  - named in the project's own go.mod: median 8 [p10 2, p90 24]
  - never named: median 35 [p10 0, p90 178], median share 78 % [p10 0 %, p90 92 %]
- **Rule B (declared prefix)** — owners per project: median 42 [p10 3, p90 217]; mean 80.5 ± 53.9 (cluster-robust, design effect 29.56)
  - named in the project's own go.mod: median 8 [p10 2, p90 24]
  - never named: median 36 [p10 0, p90 179], median share 79 % [p10 0 %, p90 93 %]

- **Sensitivity**: rule B counts 1.00x the owners of rule A at the median [p10 1.00, p90 1.03]. The gap is vanity hosts fronting forge accounts.
- rule A resolution: forge 46164 (71.0 %); meta 18732 (28.8 %); unresolved 120 (0.2 %); unreachable 34 (0.1 %)

## The design effect

- clusters: 19, mean size 18.9. Owner-set overlap (Jaccard) for two projects in the same cluster is 0.225 against 0.103 across clusters (2833 same-cluster pairs, 18707 across), which is what makes the grouping real rather than assumed.
- intra-class correlation of owners per project: 0.561
- With this many clusters the cluster-robust interval is not worth quoting as a number: the medians and the per-cluster figures below are the citable ones, and the means are not independent draws.

## By cluster

| cluster | n | median modules | median owners A | median owners B | median never-named A |
|---|---|---|---|---|---|
| kubernetes | 94 | 309 | 134 | 136 | 89 % |
| none | 52 | 4 | 2 | 2 | 0 % |
| gcp | 52 | 102 | 50 | 50 | 81 % |
| testify | 41 | 19 | 11 | 11 | 62 % |
| docker | 33 | 166 | 98 | 98 | 83 % |
| aws | 17 | 136 | 54 | 55 | 75 % |
| cobra | 17 | 39 | 23 | 24 | 71 % |
| hashicorp | 11 | 55 | 30 | 30 | 72 % |
| charm | 10 | 47 | 24 | 24 | 76 % |
| prometheus | 7 | 47 | 28 | 29 | 79 % |
| libp2p | 6 | 370 | 163 | 164 | 89 % |
| ethereum | 5 | 433 | 233 | 232 | 86 % |
| azure | 4 | 63 | 31 | 31 | 73 % |
| gin | 3 | 53 | 32 | 33 | 89 % |
| gorm | 3 | 39 | 15 | 15 | 78 % |
| etcd | 2 | 15 | 9 | 9 | 52 % |
| opentelemetry | 1 | 12 | 8 | 8 | 62 % |
| fiber | 1 | 135 | 86 | 85 | 83 % |
| cosmos | 1 | 548 | 290 | 294 | 94 % |

## The toolchain directive

- sampled projects whose own go.mod names a toolchain: 12.8 % [9.7–16.6]
- projects with at least one module in the graph naming a toolchain: 45.6 % [40.5–50.7]
- modules naming a toolchain per project: median 0 [p90 15, max 64]
- toolchain versions named across all graphs: go1.23.6 (177); go1.24.1 (153); go1.24.9 (142); go1.24.2 (129); go1.24.13 (74); go1.24.0 (74); go1.26.3 (68); go1.23.7 (63); go1.23.0 (60); go1.24.4 (59); go1.26.5 (50); go1.23.4 (47)
