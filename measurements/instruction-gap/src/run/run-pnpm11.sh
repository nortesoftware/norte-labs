#!/bin/sh
# ecosystems/npm option 3, 2026-10-28: pnpm11.py's two runs, each from an empty work directory into its
# own output directory, without network (bwrap --unshare-net; read-only but for those two
# directories), as run.sh runs the others; then the comparison. The inputs come from
# pnpm11.py fetch, run once before.
# usage: run-pnpm11.sh <option1 dir> <inputs dir> <instruction-gap results> <opt dir> <runs dir> <work dir> <out dir>
set -u
O1=$(realpath "$1") IN=$(realpath "$2") RES=$(realpath "$3") OPTD=$(realpath "$4") RUNS=$(realpath "$5") W=$(realpath -m "$6") O=$(realpath -m "$7")
H=$(dirname "$(realpath "$0")")
[ -e "$O" ] && { echo "exists: $O" >&2; exit 1; }
mkdir -p "$O" || exit 1
box() { HOME="$W" bwrap --unshare-net --ro-bind / / --bind "$W" "$W" --bind "$O" "$O" --dev /dev --proc /proc --tmpfs /tmp "$@"; }
echo "node $("$OPTD/node-22.23.4/node-v22.23.4-linux-x64/bin/node" --version); python $(python3 --version | cut -d' ' -f2); start $(date -u +%FT%TZ)"
for r in run1 run2; do
	rm -rf "$W" && mkdir -p "$W" "$O/$r" || exit 1
	box python3 -I "$H/pnpm11.py" run "$O1" "$IN" "$RES" "$OPTD" "$W" "$O/$r"; echo "$r exit=$?"
	echo "$r end $(date -u +%FT%TZ)"
done
rm -rf "$W"
python3 -I "$H/pnpm11.py" compare "$RUNS" "$O"; echo "compare exit=$?"
