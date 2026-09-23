#!/usr/bin/env python3
"""Order the frame by sha256(seed + fullName) and take the first n."""
import gzip, hashlib, json, sys

frame_path, out_path = sys.argv[1], sys.argv[2]
n = int(sys.argv[sys.argv.index('--n') + 1]) if '--n' in sys.argv else 400
seed = sys.argv[sys.argv.index('--seed') + 1] if '--seed' in sys.argv else 'norte-labs ecosystems-go 2026-09-23'

rows = [json.loads(l) for l in gzip.open(frame_path, 'rt') if l.strip()]
ranked = sorted(rows, key=lambda r: hashlib.sha256((seed + r['fullName']).encode()).hexdigest())
pick = ranked[:n]
with open(out_path, 'w') as f:
    for i, r in enumerate(pick):
        r['rank'] = i + 1
        f.write(json.dumps(r, sort_keys=True) + '\n')
json.dump({'seed': seed, 'frame': len(rows), 'sampled': len(pick),
           'starsMedian': sorted(r['stars'] for r in pick)[len(pick)//2]},
          open(out_path.replace('.ndjson', '-stats.json'), 'w'), indent=1)
print(f'frame {len(rows)} -> sample {len(pick)}, seed {seed!r}')
