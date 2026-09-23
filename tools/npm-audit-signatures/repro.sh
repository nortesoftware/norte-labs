#!/bin/bash
# Two trees against a registry that publishes no signing keys: one resolved
# entirely from it, one mixed with npmjs. Read the exit status from the command
# and not through a pipe, or $? is the pipe's last stage and both read as 0.
set -u
D=${1:-/var/tmp/nl-npmaudit}
mkdir -p "$D"; cd "$D"
cat > reg.py <<'PY'
import http.server, json, io, tarfile, hashlib, base64
buf=io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as t:
    d=json.dumps({"name":"@nl/nokeys-dep","version":"1.0.0","main":"index.js"}).encode()
    ti=tarfile.TarInfo('package/package.json'); ti.size=len(d); t.addfile(ti, io.BytesIO(d))
    i=b"module.exports=1;\n"; t2=tarfile.TarInfo('package/index.js'); t2.size=len(i); t.addfile(t2, io.BytesIO(i))
tar=buf.getvalue()
integ='sha512-'+base64.b64encode(hashlib.sha512(tar).digest()).decode()
PACK={"name":"@nl/nokeys-dep","dist-tags":{"latest":"1.0.0"},"versions":{"1.0.0":{
  "name":"@nl/nokeys-dep","version":"1.0.0","dist":{
  "tarball":"http://127.0.0.1:8899/@nl/nokeys-dep/-/nokeys-dep-1.0.0.tgz","integrity":integ}}}}
class H(http.server.BaseHTTPRequestHandler):
    def log_message(self,*a): pass
    def do_GET(self):
        p=self.path
        if p.startswith('/-/npm/v1/keys'):
            self.send_response(404); self.end_headers(); self.wfile.write(b'{}'); return
        if p.lower() in ('/@nl/nokeys-dep','/@nl%2fnokeys-dep'):
            b=json.dumps(PACK).encode(); self.send_response(200)
            self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(b)))
            self.end_headers(); self.wfile.write(b); return
        if p.endswith('.tgz'):
            self.send_response(200); self.send_header('Content-Length',str(len(tar)))
            self.end_headers(); self.wfile.write(tar); return
        self.send_response(404); self.end_headers()
http.server.HTTPServer(('127.0.0.1',8899),H).serve_forever()
PY
setsid nohup python3 reg.py >/dev/null 2>&1 < /dev/null & disown
sleep 2
for kind in keyless-only mixed; do
  rm -rf "$kind"; mkdir "$kind"; cd "$kind"
  printf '@nl:registry=http://127.0.0.1:8899\n' > .npmrc
  if [ "$kind" = mixed ]; then
    printf '{"name":"t","version":"1.0.0","dependencies":{"@nl/nokeys-dep":"1.0.0","lodash":"4.17.21"}}\n' > package.json
  else
    printf '{"name":"t","version":"1.0.0","dependencies":{"@nl/nokeys-dep":"1.0.0"}}\n' > package.json
  fi
  npm install --silent --no-audit --no-fund >/dev/null 2>&1
  out=$(npm audit signatures 2>&1); rc=$?
  echo "=== $kind (deps in lockfile: $(node -e "console.log(Object.keys(require('./package-lock.json').packages).length-1)"))"
  echo "$out" | head -4 | sed 's/^/    /'
  echo "    EXIT=$rc"
  cd ..
done
pkill -f 'r[e]g.py' 2>/dev/null || true
