#!/bin/bash
# Reproduces both findings against an installed firejail. Needs a real $HOME
# path: a blacklist of a path under /var/tmp is not applied, so the control
# would read as a false positive.
set -u
D="$HOME/nl-fj-repro"
mkdir -p "$D"; cd "$D"
echo "secret-in-present" > present.txt; rm -f absent.txt
cat > p.profile <<EOF
blacklist \${HOME}/nl-fj-repro/present.txt
blacklist \${HOME}/nl-fj-repro/absent.txt
EOF

echo "### firejail $(firejail --version | head -1 | awk '{print $3}')"
echo
echo "### 1. --debug-blacklists names only the entry whose path exists"
firejail --profile=p.profile --debug-blacklists /bin/true 2>&1 | grep -c "present.txt" \
  | xargs printf '    present.txt (exists):  %s line(s)\n'
firejail --profile=p.profile --debug-blacklists /bin/true 2>&1 | grep -c "absent.txt" \
  | xargs printf '    absent.txt  (missing): %s line(s)\n'
echo
echo "### 2. full --debug says no more"
firejail --profile=p.profile --debug /bin/true 2>&1 | grep -c "absent.txt" \
  | xargs printf '    absent.txt under --debug: %s line(s)\n'
echo
echo "### 3. control: the entry that applied really does block"
firejail --quiet --profile=p.profile /bin/cat present.txt 2>&1 | tail -1 | sed 's/^/    /'
echo
echo "### 4. the path the skipped rule named is writable and readable inside"
firejail --quiet --profile=p.profile /bin/sh -c \
  'echo created-inside > ~/nl-fj-repro/absent.txt; cat ~/nl-fj-repro/absent.txt' 2>&1 | tail -1 | sed 's/^/    /'
rm -f absent.txt
echo
echo "### 5. whitelist reports the same condition under its own flag"
cat > wl.profile <<EOF
whitelist \${HOME}/nl-fj-repro/absent.txt
EOF
firejail --profile=wl.profile --debug-whitelists /bin/true 2>&1 \
  | grep -A3 "^Removed path" | sed 's/^/    /' | head -4
echo
echo "### 6. the kernel knows whether a filter is installed; firejail does not ask"
firejail --quiet --name=fjrepro --seccomp sleep 10 >/dev/null 2>&1 &
sleep 3
P=$(pgrep -f "^sleep 10" | head -1)
printf '    inside sandbox : %s\n' "$(grep -E '^Seccomp:|^Seccomp_filters:' /proc/$P/status 2>/dev/null | tr '\n' ' ')"
printf '    this shell     : %s\n' "$(grep -E '^Seccomp:|^Seccomp_filters:' /proc/self/status | tr '\n' ' ')"
echo "    --seccomp.print reads the filter files firejail wrote, not the kernel:"
timeout 15 firejail --seccomp.print=fjrepro 2>&1 | grep "^FILE:" | sed 's/^/      /'
wait 2>/dev/null
rm -rf "$D"
