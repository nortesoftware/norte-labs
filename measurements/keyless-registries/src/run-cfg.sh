#!/bin/bash
# Does audit signatures take the registry from the configuration or from the lockfile?
# One package, real hosts. Exit status read from the command, not through a pipe.
set -u
NPMDIR=$1; OUT=$2
export PATH=$NPMDIR/bin:${NODE_BIN:?directory holding node 22}:$PATH
export npm_config_cache=$OUT/cache npm_config_update_notifier=false
export npm_config_userconfig=$OUT/userconfig npm_config_globalconfig=$OUT/globalconfig
export npm_config_user_agent='norte-labs measurement (chris@nortesoftware.dev)'
MIRROR=https://registry.npmmirror.com
mkdir -p "$OUT"; cd "$OUT"; : > userconfig; : > globalconfig
echo "npm $(npm --version), node $(node --version), $(date -u +%Y-%m-%dT%H:%M:%SZ)" > versions.txt
pj='{"name":"t","version":"1.0.0","dependencies":{"lodash":"4.17.21"}}'
mkdir from-npmjs from-mirror
cd "$OUT/from-npmjs"; echo "$pj" > package.json
npm install --no-audit --no-fund > install.txt 2>&1; echo $? > install.exit
grep -o '"resolved": "[^"]*"' package-lock.json > resolved.txt
npm audit signatures > ../control.txt 2>&1; echo $? > ../control.exit
npm audit signatures --registry=$MIRROR > ../A.txt 2>&1; echo $? > ../A.exit
cd "$OUT/from-mirror"; echo "$pj" > package.json
npm install --no-audit --no-fund --registry=$MIRROR --replace-registry-host=never > install.txt 2>&1; echo $? > install.exit
grep -o '"resolved": "[^"]*"' package-lock.json > resolved.txt
npm audit signatures > ../B.txt 2>&1; echo $? > ../B.exit
