# src/run

The code of the installs in [whether-it-runs.md](../../whether-it-runs.md), as it ran. Its comments
use these names:

- **option 3**: the installs, every file here but the two below.
- **option 1**: `fetch_store.py`, which builds a store of instruction-gap's lockfiles as they stood
  at the pinned commits, and `path_b.py`, which reads them with parsers apart from instruction-gap's
  own, [`src/lockfile.ts`](../lockfile.ts). Option 3 takes from them that store, each project's
  install-code versions (`pairs.py`) and a YAML reader. `<option1 dir>` in the usage lines is this
  directory. `path_b.py` is option 1's path B; its path A is `src/lockfile.ts`.
- **path A**: `rules.py`, the table of what each release reads, applied to each project's
  configuration; no manager runs.
- **path B**: `replicas.py`, the managers themselves, each installing a replica of the project from
  stand-ins served by a local registry, without network. Both paths must give the same scripts and
  the same exit for every project (`compare.py`).
- **the plan**: the document that fixes which release installs a project under each rule
  (`pins.py`), what each release reads (`rules.py`), the files fetched, the controls and when a run
  stops. The plan and its amendments are not published.
