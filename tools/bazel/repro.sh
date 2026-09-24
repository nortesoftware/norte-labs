#!/bin/bash
# Reproduces the Bazel sandbox results against a released Bazel, via bazelisk, on Linux.
# Each access result is printed next to the control that shows the probe could see the difference.
#
#   USE_BAZEL_VERSION=9.2.0 ./repro.sh
#
# Needs bazelisk (as `bazel`), bwrap for section 7, and network access for section 2.
# The probe lives under /var/tmp, not /tmp: linux-sandbox gives each action a private /tmp,
# so a probe there would be invisible for a reason unrelated to the test.
set -u
export USE_BAZEL_VERSION=${USE_BAZEL_VERSION:-9.2.0}
W=${WORK:-/var/tmp/nl-bazel-repro}
WS=$W/ws; P=$W/probe/secret; OUT=$W/out
mkdir -p "$WS" "$W/probe" "$W/cases"
: > "$WS/MODULE.bazel"
cat > "$WS/BUILD.bazel" <<'EOF'
# genrule commands run under `set -euo pipefail`; set +e keeps a failed read from aborting the report
READ = """
set +e
p="$$NL_PROBE"
{ if [ -e "$$p" ]; then echo exists=yes; else echo exists=no; fi
  out=$$(cat "$$p" 2>&1); echo "cat_rc=$$? $$out"; } > $@
"""

genrule(name = "probe", outs = ["probe.txt"], cmd = READ)

# A marks that it has started, waits for the host to signal, then reads again.
# B depends on A, so B's sandbox is set up only after A has finished.
genrule(
    name = "a",
    outs = ["a.txt"],
    cmd = """
set +e
p="$$NL_PROBE"
# mounts at the probe path, as the action's own mount namespace lists them
mounts() { grep -c " $$p " /proc/self/mountinfo; }
early=$$(cat "$$p" 2>&1); echo "early cat_rc=$$? $$early mounts=$$(mounts)" > $@
touch $(@D)/started-a
for i in $$(seq 1 300); do [ -e "$$p.go" ] && break; sleep 0.2; done
late=$$(cat "$$p" 2>&1); echo "late  cat_rc=$$? $$late mounts=$$(mounts)" >> $@
""",
)

genrule(name = "b", srcs = [":a"], outs = ["b.txt"], cmd = READ)

NET = """
set +e
timeout 5 bash -c 'exec 3<>/dev/tcp/1.1.1.1/443'; echo "connect_rc=$$?" > $@
"""

genrule(name = "net", outs = ["net.txt"], cmd = NET)

genrule(name = "net_block", outs = ["net_block.txt"], cmd = NET, tags = ["block-network"])
EOF

# build <case> <wrapper or -> <target> [flags...]: fresh output root per case, so nothing is cached
build() {
  local c=$1 wrap=$2 t=$3; shift 3
  local d=$W/cases/$c; rm -rf "$OUT" "$d"; mkdir -p "$d"
  local w=""
  [ "$wrap" = nouserns ] && w="bwrap --unshare-user --disable-userns --bind / / --dev-bind /dev /dev --bind /proc /proc --"
  [ "$wrap" = userns ] && w="bwrap --unshare-user --bind / / --dev-bind /dev /dev --bind /proc /proc --"
  ( cd "$WS" && $w bazel --batch --output_user_root="$OUT" build "$t" --color=no --curses=no \
      --symlink_prefix=/ --action_env=NL_PROBE="$P" "$@" > "$d/console.txt" 2>&1 )
  echo $? > "$d/rc"
  local f; for f in probe a b net net_block; do
    local o; o=$(find "$OUT" -path "*/bin/$f.txt" -print -quit 2>/dev/null); [ -n "$o" ] && cp "$o" "$d/$f.txt"
  done
  rm -rf "$OUT"
}
show() { # show <case> <file>; if the action never ran, show why
  local f=$W/cases/$1/$2 s
  if [ -f "$f" ]; then s=$(tr '\n' ' ' < "$f")
  else s="(no action report) $(grep -m1 -E 'Mount target|ERROR' "$W/cases/$1/console.txt")"; fi
  printf '    %-4s bazel exit %s  %s\n' "$1" "$(cat "$W/cases/$1/rc")" "$(echo "$s" | sed "s#$P#<probe>#g; s#$W#<work>#g")"
}
runner() { grep -o 'processes: .*' "$W/cases/$1/console.txt" | head -1; }
# console lines that differ between two cases, once timings, PIDs, hashes and progress are removed
differ() {
  local n='s/^[0-9]\{10\}\.[0-9]\{9\}: //; s/PID [0-9]*/PID N/g; s/pid=[0-9]*/pid=N/g;
    s/[0-9a-f]\{32,64\}/H/g; s/[0-9]*\.[0-9]*s/Ns/g; /^Analyzing:/d; /^Loading:/d; /^INFO: Analyzed/d;
    /^\[/d; /^Computing/d; /^Extracting/d'
  # sorted: debug lines from the sandbox's two processes interleave differently from run to run
  diff <(sed "$n" "$W/cases/$1/console.txt" | sort) <(sed "$n" "$W/cases/$2/console.txt" | sort) | grep -c '^[<>]'
}
named() { grep -c -E "(bind mount|remount ro|-m)[: ].*$P" "$W/cases/$1/console.txt"; } # lines naming the probe as a mount
present() { printf 'SECRET' > "$P"; rm -f "$P.go"; }
absent() { rm -f "$P" "$P.go"; }
# while action A runs: wait for its marker, change the probe as asked, then let A read again
host_side() {
  local mode=$1 i
  for i in $(seq 1 3000); do
    if find "$OUT" -name started-a -print -quit 2>/dev/null | grep -q .; then
      case $mode in
        create)   printf 'SECRET' > "$P" ;;
        rename)   printf 'REPLACED' > "$P.new" && mv -f "$P.new" "$P" ;;
        recreate) rm -f "$P" && printf 'REPLACED' > "$P" ;;
        inplace)  printf 'REPLACED' > "$P" ;;
      esac
      touch "$P.go"; return
    fi
    sleep 0.1
  done
}
midbuild() { # midbuild <case> <mode> [flags...]
  local c=$1 mode=$2; shift 2
  host_side "$mode" & local h=$!
  build "$c" - //:b --spawn_strategy=linux-sandbox "$@"; wait $h
}

echo "### Bazel $USE_BAZEL_VERSION, $(uname -sr)"
echo
echo "### 1. linux-sandbox, by default, lets an action read a file it did not declare"
present; build read - //:probe --spawn_strategy=linux-sandbox;                      show read probe.txt
present; build read_blocked - //:probe --spawn_strategy=linux-sandbox --sandbox_block_path="$P"
show read_blocked probe.txt; echo "    (control: the same read, with the file blocked)"
echo
echo "### 2. and reach the network"
build net - //:net --spawn_strategy=linux-sandbox;                                   show net net.txt
build net_blocked - //:net_block --spawn_strategy=linux-sandbox;                     show net_blocked net_block.txt
echo "    (control: the same connection from an action tagged block-network)"
echo
echo "### 3. the flag run/build.mdx recommends"
build ignore - //:probe --ignore_unsupported_sandboxing
echo "    bazel exit $(cat $W/cases/ignore/rc): $(grep -m1 -E 'ERROR|Unrecognized' $W/cases/ignore/console.txt || echo 'accepted, no error')"
echo
echo "### 4. --sandbox_block_path on a path that does not exist"
absent; build absent_flag - //:probe --spawn_strategy=linux-sandbox --sandbox_block_path="$P"
absent; build absent_none - //:probe --spawn_strategy=linux-sandbox
echo "    bazel exit with the flag $(cat $W/cases/absent_flag/rc), without $(cat $W/cases/absent_none/rc)$(grep -m1 -o "Mount target.*does not exist" $W/cases/absent_flag/console.txt | sed "s#$P#<probe>#; s/^/: /")"
echo "    console lines that differ, flag against no flag: $(differ absent_flag absent_none)"
absent; build absent_flag_dbg - //:probe --spawn_strategy=linux-sandbox --sandbox_block_path="$P" --sandbox_debug -s
absent; build absent_none_dbg - //:probe --spawn_strategy=linux-sandbox --sandbox_debug -s
echo "    the same at --sandbox_debug -s: $(differ absent_flag_dbg absent_none_dbg); lines naming the path as a mount: $(named absent_flag_dbg)"
present; build present_flag_dbg - //:probe --spawn_strategy=linux-sandbox --sandbox_block_path="$P" --sandbox_debug -s
echo "    (control: with the path present, lines at --sandbox_debug -s naming it as a mount: $(named present_flag_dbg))"
echo
echo "### 5. the path appears while action A runs; B is set up afterwards"
absent;  midbuild appear create --sandbox_block_path="$P";  show appear a.txt; show appear b.txt
present; midbuild appear_c none --sandbox_block_path="$P";  show appear_c a.txt; show appear_c b.txt
echo "    (control: present from the start, both blocked)"
absent;  midbuild appear_d create;                          show appear_d a.txt; show appear_d b.txt
echo "    (control: no flag, both read it)"
echo
echo "### 6. an applied block, and the host replaces the path while A runs"
for m in rename recreate inplace none; do
  present; midbuild "replace_$m" "$m" --sandbox_block_path="$P"; echo "    $m:"; show "replace_$m" a.txt; show "replace_$m" b.txt
done
echo "    (controls: inplace and none keep A blocked)"
present; midbuild replace_noflag rename --sandbox_debug; echo "    rename, no flag:"; show replace_noflag a.txt
echo
echo "### 7. processwrapper-sandbox, and the fallback to it"
present; build pw_flag - //:probe --spawn_strategy=processwrapper-sandbox --sandbox_block_path="$P"; show pw_flag probe.txt
present; build pw_none - //:probe --spawn_strategy=processwrapper-sandbox
echo "    console lines that differ, flag against no flag: $(differ pw_flag pw_none)"
if command -v bwrap >/dev/null; then
  present; build fb_block nouserns //:probe --sandbox_block_path="$P"; show fb_block probe.txt; echo "      $(runner fb_block)"
  present; build fb_block_c userns //:probe --sandbox_block_path="$P"; show fb_block_c probe.txt; echo "      $(runner fb_block_c)"
  echo "    (control: the same wrapper with user namespaces available)"
  build fb_net nouserns //:net_block;  show fb_net net_block.txt;  echo "      $(runner fb_net)"
  build fb_net_c userns //:net_block;  show fb_net_c net_block.txt; echo "      $(runner fb_net_c)"
  echo "    console lines that differ, fallback against control: $(differ fb_block fb_block_c)"
else
  echo "    bwrap not found: section skipped"
fi
