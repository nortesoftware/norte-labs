#!/bin/bash
# Reproduces the exit code of ValidateFormat against the published binary.
# The exit status is read from the command directly: through a pipe, $? is the
# last stage's status and every case reads as 0.
set -u
D=${1:-/var/tmp/nl-sbom}
mkdir -p "$D"; cd "$D"
V=v4.1.5
[ -x sbom-tool ] || { curl -sSL -o sbom-tool "https://github.com/microsoft/sbom-tool/releases/download/$V/sbom-tool-linux-x64"; chmod +x sbom-tool; }
[ -f valid.spdx.json ] || curl -sSL -o valid.spdx.json "https://github.com/microsoft/sbom-tool/releases/download/$V/linux-x64-manifest.spdx.json"
python3 - <<'PY'
import json
d=json.load(open('valid.spdx.json'))
a=dict(d); a.pop('spdxVersion',None); json.dump(a,open('bad-noversion.json','w'))
b=dict(d); b['spdxVersion']='SPDX-9.9'; json.dump(b,open('bad-badversion.json','w'))
c=json.loads(json.dumps(d))
if c.get('packages'): c['packages'][0].pop('name',None)
json.dump(c,open('bad-pkgnoname.json','w'))
open('bad-notjson.json','w').write('not json at all')
PY
for f in valid.spdx.json bad-noversion.json bad-badversion.json bad-pkgnoname.json bad-notjson.json /nonexistent.json; do
  out=$(./sbom-tool ValidateFormat -sp "$f" 2>&1); rc=$?
  printf '%-24s rc=%-3s %s\n' "$(basename "$f")" "$rc" "$(printf '%s' "$out" | head -1)"
done
