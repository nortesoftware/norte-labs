#!/bin/sh
# Starts a virtual X display inside the sandbox, waits for its socket, then
# runs the command (strace around the editor). NL_XROOT holds Xvfb and its
# libraries, unpacked from the distribution's packages; only Xvfb sees them.
# Xvfb is started from a subshell so that it is not a child of strace: strace
# waits on all its children and would not return while the display lives.
(LD_LIBRARY_PATH="$NL_XROOT/usr/lib/x86_64-linux-gnu" XKB_CONFIG_ROOT="$NL_XROOT/usr/share/X11/xkb" \
  "$NL_XROOT/usr/bin/Xvfb" "$DISPLAY" -screen 0 1280x800x24 -nolisten tcp >/tmp/xvfb.log 2>&1 &)
i=0
while [ ! -S "/tmp/.X11-unix/X${DISPLAY#:}" ] && [ $i -lt 100 ]; do sleep 0.1; i=$((i+1)); done
exec "$@"
