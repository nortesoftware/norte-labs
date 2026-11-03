#!/bin/sh
# ecosystems/npm option 3: two runs, each from an empty work directory into its own output directory,
# all without network (bwrap --unshare-net; read-only but for those two directories): C1 (pairs.py),
# the controls, path A (rules.py) and path B (replicas.py); then compare.py.
# The inputs come from fetch_inputs.py, run once before.
# usage: run.sh <opt-dir> <inputs-dir> <instruction-gap results> <option1 dir> <work-dir> <out-dir>
set -u
OPTD=$(realpath "$1") IN=$(realpath "$2") RES=$(realpath "$3") O1=$(realpath "$4") W=$(realpath -m "$5") O=$(realpath -m "$6")
H=$(dirname "$(realpath "$0")")
[ -e "$O" ] && { echo "exists: $O" >&2; exit 1; }
mkdir -p "$O" || exit 1
box() { HOME="$W" bwrap --unshare-net --ro-bind / / --bind "$W" "$W" --bind "$O" "$O" --dev /dev --proc /proc --tmpfs /tmp "$@"; }
echo "node $("$OPTD/node-22.23.4/node-v22.23.4-linux-x64/bin/node" --version); python $(python3 --version | cut -d' ' -f2); start $(date -u +%FT%TZ)"
for r in run1 run2; do
	rm -rf "$W" && mkdir -p "$W" "$O/$r/pairs" || exit 1
	box python3 -I "$H/pairs.py" "$O1" "$IN/store" "$RES" "$O/$r/pairs"; echo "$r C1 exit=$?"
	box python3 -I "$H/replicas.py" --controls "$H/controls" "$OPTD" "$W" "$O/$r/controls.ndjson"; echo "$r controls exit=$?"
	box python3 -I "$H/rules.py" "$O1" "$IN" "$RES" "$O/$r/pairs/pairs.ndjson" "$O/$r/decisions-a.ndjson"; echo "$r path A exit=$?"
	box python3 -I "$H/replicas.py" "$IN" "$RES" "$O/$r/pairs/pairs.ndjson" "$OPTD" "$W" "$O/$r/decisions-b.ndjson"; echo "$r path B exit=$?"
	echo "$r end $(date -u +%FT%TZ)"
done
rm -rf "$W"
python3 -I "$H/compare.py" "$O1" "$IN" "$RES" "$O"; echo "compare exit=$?"
