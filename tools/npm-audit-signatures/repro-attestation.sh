#!/bin/bash
# The total case with a keyless attestation: one registry that publishes no keys, serving
# semver@7.8.5 with npmjs's tarball and only the attestation of npmjs's whose signature has no
# keyid (the SLSA provenance, verified through its own certificate), and a package of its own with
# neither signatures nor attestations. The control serves semver without attestations.
# usage: repro-attestation.sh <npm dir> <out dir>, with NODE_BIN the directory holding node 22.
# Exit statuses are read from the commands, not through a pipe.
set -u
NPMDIR=$1; OUT=$2
export PATH=$NPMDIR/bin:${NODE_BIN:?directory holding node 22}:$PATH
UA='norte-labs measurement (chris@nortesoftware.dev)'
export npm_config_user_agent="$UA" npm_config_update_notifier=false
mkdir -p "$OUT"; cd "$OUT"
curl -s -f -A "$UA" -o semver-7.8.5.tgz https://registry.npmjs.org/semver/-/semver-7.8.5.tgz || exit 2
curl -s -f -A "$UA" -o attestations.json 'https://registry.npmjs.org/-/npm/v1/attestations/semver@7.8.5' || exit 2
cat > reg.py <<'PY'
import base64, hashlib, http.server, io, json, sys, tarfile
port, with_att = int(sys.argv[1]), sys.argv[2] == 'with'
base = f'http://127.0.0.1:{port}'
semver = open('semver-7.8.5.tgz', 'rb').read()
keyless = [a for a in json.load(open('attestations.json'))['attestations']
           if not a['bundle']['dsseEnvelope']['signatures'][0].get('keyid')]
buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as t:
    d = json.dumps({'name': 'unsigned-dep', 'version': '1.0.0', 'main': 'index.js'}).encode()
    ti = tarfile.TarInfo('package/package.json'); ti.size = len(d); t.addfile(ti, io.BytesIO(d))
    i = b'module.exports=1;\n'; t2 = tarfile.TarInfo('package/index.js'); t2.size = len(i); t.addfile(t2, io.BytesIO(i))
unsigned = buf.getvalue()
sri = lambda b: 'sha512-' + base64.b64encode(hashlib.sha512(b).digest()).decode()
def doc(name, tgz, dist_extra):
    dist = {'tarball': f'{base}/{name}/-/{name}-{v[name]}.tgz', 'integrity': sri(tgz), **dist_extra}
    return {'name': name, 'dist-tags': {'latest': v[name]}, 'versions': {v[name]: {'name': name, 'version': v[name], 'dist': dist}}}
v = {'semver': '7.8.5', 'unsigned-dep': '1.0.0'}
att = {'attestations': {'url': f'{base}/-/npm/v1/attestations/semver@7.8.5',
                        'provenance': {'predicateType': 'https://slsa.dev/provenance/v1'}}} if with_att else {}
routes = {'/semver': json.dumps(doc('semver', semver, att)).encode(),
          '/unsigned-dep': json.dumps(doc('unsigned-dep', unsigned, {})).encode(),
          '/semver/-/semver-7.8.5.tgz': semver, '/unsigned-dep/-/unsigned-dep-1.0.0.tgz': unsigned}
if with_att:
    routes['/-/npm/v1/attestations/semver@7.8.5'] = json.dumps({'attestations': keyless}).encode()
class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        b = routes.get(self.path.split('?')[0])
        self.send_response(200 if b is not None else 404)
        self.send_header('Content-Length', str(len(b or b'{}'))); self.end_headers()
        self.wfile.write(b or b'{}')
http.server.HTTPServer(('127.0.0.1', port), H).serve_forever()
PY
for kind in control with; do
  port=$([ $kind = with ] && echo 8897 || echo 8896)
  python3 reg.py $port $([ $kind = with ] && echo with || echo without) & pid=$!
  sleep 1
  d=$OUT/$kind; mkdir -p "$d"; : > "$d/userconfig"; : > "$d/globalconfig"; cd "$d"
  printf 'registry=http://127.0.0.1:%s/\n' $port > .npmrc
  echo '{"name":"t","version":"1.0.0","dependencies":{"semver":"7.8.5","unsigned-dep":"1.0.0"}}' > package.json
  export npm_config_cache=$d/cache npm_config_userconfig=$d/userconfig npm_config_globalconfig=$d/globalconfig
  npm install --no-audit --no-fund > install.txt 2>&1; echo $? > install.exit
  # an audit of a tree that did not install says nothing about attestations
  if [ "$(cat install.exit)" != 0 ] || [ ! -d node_modules/semver ] || [ ! -d node_modules/unsigned-dep ]; then
    echo "=== $kind: install failed, nothing audited"; kill $pid; exit 3
  fi
  npm audit signatures > audit.txt 2>&1; echo $? > audit.exit
  sed -i "s#$d#<out>#g" install.txt audit.txt
  echo "=== $kind ($(npm --version)): install $(cat install.exit), audit $(cat audit.exit)"
  grep -v '^$' audit.txt | grep -v 'complete log' | sed 's/^/    /'
  kill $pid; wait $pid 2>/dev/null; cd "$OUT"
done
