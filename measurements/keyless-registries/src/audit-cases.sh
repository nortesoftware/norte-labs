#!/bin/bash
# npm audit signatures under ten configurations: each case a fresh project with its own .npmrc,
# cache and empty user and global configuration, installed and then audited.
# usage: audit-cases.sh <npm dir> <out dir> [<npm dir that installs the last case>], with NODE_BIN
# the directory holding node 22.
# Exit statuses are read from the commands, not through a pipe. Paths under <out dir> are written
# <out> in the saved output.
set -u
NPMDIR=$1; OUT=$2; OTHER=${3:-}
export PATH=$NPMDIR/bin:${NODE_BIN:?directory holding node 22}:$PATH
export npm_config_update_notifier=false
export npm_config_user_agent='norte-labs measurement (chris@nortesoftware.dev)'
MIRROR='registry=https://registry.npmmirror.com/'
SCOPE='@sigstore:registry=https://registry.npmjs.org/'
TYPES='@types:registry=https://registry.npmmirror.com/'
mkdir -p "$OUT"; : > "$OUT/view-userconfig"
# the newest @types/lodash on npmjs when the cases run
NEWEST=$(npm view @types/lodash version --registry=https://registry.npmjs.org/ --userconfig="$OUT/view-userconfig" 2>/dev/null)
echo "npm $(npm --version), node $(node --version), $(date -u +%Y-%m-%dT%H:%M:%SZ), newest @types/lodash $NEWEST" > "$OUT/versions.txt"
run() {   # case name, .npmrc lines, dependencies as JSON; INSTALL_FLAGS and INSTALL_NPMDIR apply to the install
  local dir=$OUT/$1
  mkdir -p "$dir/p"; : > "$dir/userconfig"; : > "$dir/globalconfig"
  printf '%s\n' "${@:2:$#-2}" > "$dir/p/.npmrc"
  echo "{\"name\":\"t\",\"version\":\"1.0.0\",\"dependencies\":${@: -1}}" > "$dir/p/package.json"
  (cd "$dir/p" && PATH=${INSTALL_NPMDIR:-$NPMDIR}/bin:$PATH npm_config_cache=$dir/cache \
     npm_config_userconfig=$dir/userconfig npm_config_globalconfig=$dir/globalconfig \
     npm install --no-audit --no-fund ${INSTALL_FLAGS:-} > ../install.txt 2>&1; echo $? > ../install.exit)
  grep -o '"resolved": "[^"]*"' "$dir/p/package-lock.json" > "$dir/resolved.txt" 2>/dev/null
  (cd "$dir/p" && npm_config_cache=$dir/cache npm_config_userconfig=$dir/userconfig \
     npm_config_globalconfig=$dir/globalconfig \
     npm audit signatures > ../audit.txt 2>&1; echo $? > ../audit.exit)
  cp "$dir/p/.npmrc" "$dir/npmrc"
  sed -i "s#$OUT#<out>#g" "$dir/install.txt" "$dir/audit.txt"
  echo "$1: install $(cat "$dir/install.exit"), audit $(cat "$dir/audit.exit")"
}
run control '' '{"semver":"7.8.5"}'
run mirror-lodash "$MIRROR" '{"lodash":"4.17.21"}'
run mirror-semver "$MIRROR" '{"semver":"7.8.5"}'
run partial-lodash "$MIRROR" "$SCOPE" '{"@sigstore/core":"3.0.0","lodash":"4.17.21"}'
run partial-semver "$MIRROR" "$SCOPE" '{"@sigstore/core":"3.0.0","semver":"7.8.5"}'
run scope-mirror-old "$TYPES" '{"@types/lodash":"4.14.120","lodash":"4.17.21"}'
run scope-mirror-new "$TYPES" "{\"@types/lodash\":\"$NEWEST\",\"lodash\":\"4.17.21\"}"
# partial-lodash again: installed with npmjs URLs left as they are, with remote tarballs allowed,
# and by another npm than the one that audits
INSTALL_FLAGS=--replace-registry-host=never run partial-lodash-never "$MIRROR" "$SCOPE" '{"@sigstore/core":"3.0.0","lodash":"4.17.21"}'
INSTALL_FLAGS=--allow-remote=all run partial-lodash-allow "$MIRROR" "$SCOPE" '{"@sigstore/core":"3.0.0","lodash":"4.17.21"}'
[ -n "$OTHER" ] && INSTALL_NPMDIR=$OTHER run partial-lodash-other "$MIRROR" "$SCOPE" '{"@sigstore/core":"3.0.0","lodash":"4.17.21"}'
