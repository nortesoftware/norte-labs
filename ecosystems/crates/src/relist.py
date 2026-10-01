#!/usr/bin/env python3
"""For every drawn project recorded as having no root Cargo.toml: the root listing at its
pinned commit again, and every Cargo.lock anywhere in the tree at that commit.

usage: relist.py <population.ndjson> <out.json>
"""
import json, subprocess, sys

POP, OUT = sys.argv[1], sys.argv[2]

def gh(path, jq):
    r = subprocess.run(['gh', 'api', path, '--jq', jq], capture_output=True, text=True)
    return json.loads(r.stdout) if r.returncode == 0 else {'error': r.stderr.strip()[:200]}

out = []
for line in open(POP):
    p = json.loads(line)
    if p['status'] != 'no-Cargo.toml': continue
    root = gh(f"repos/{p['fullName']}/contents?ref={p['sha']}", '[.[] | select(.type=="file") | .name]')
    tree = gh(f"repos/{p['fullName']}/git/trees/{p['sha']}?recursive=1",
              '{truncated: .truncated, locks: [.tree[].path | select(endswith("Cargo.lock"))]}')
    out.append({'fullName': p['fullName'], 'sha': p['sha'],
                'rootCargoToml': 'Cargo.toml' in root if isinstance(root, list) else root,
                'truncated': tree.get('truncated'), 'cargoLocks': tree.get('locks', tree)})
json.dump(out, open(OUT, 'w'), indent=1, sort_keys=True)
locks = [o for o in out if isinstance(o['cargoLocks'], list) and o['cargoLocks']]
print(f"{len(out)} without a root Cargo.toml; root Cargo.toml found again: "
      f"{sum(o['rootCargoToml'] is True for o in out)}; errors: {sum(isinstance(o['rootCargoToml'], dict) for o in out)}; "
      f"truncated trees: {sum(bool(o['truncated']) for o in out)}; with a Cargo.lock below the root: {len(locks)}, "
      f"in src-tauri/: {sum(any('src-tauri/' in l for l in o['cargoLocks']) for o in locks)}")
