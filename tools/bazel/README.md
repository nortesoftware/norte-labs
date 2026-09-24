# bazelbuild/bazel — under linux-sandbox, a running action reads a blocked path that appears, or is replaced, after its sandbox was set up

The fifth target was not chosen. It was drawn at random from the tools classified as gating in
[../gate-or-report-2026-09-24.md](../gate-or-report-2026-09-24.md), less the four already audited
and cplt, nono and pmg. That file reached GitHub at 11:09:08 UTC on 2026-09-24 (push event
22037394009). Bazel was first named in public as the target more than ten hours later, in the issues below.
The record of the draw is not published.

The draw chose the target, not the mechanism. I asked Bazel the questions I ask every target, and
the one about absent paths led to `--sandbox_block_path`. A skip for a missing path was asked for in
public in 2018 (#4963) and shipped in 7.3.0. What the draw adds is narrower: the pattern in
[../absent-fails-open.md](../absent-fails-open.md) turned up when the same questions were put to a
target nobody picked for its shape. [../capslock/](../capslock/) is the other drawn case. There it did
not turn up in the mode I examined, the default one; its gating mode was not examined.

**Result.** Under linux-sandbox, `--sandbox_block_path` skips a path that does not exist when an
action's sandbox is set up. Nothing says so at any verbosity I tried. If the path appears while
that action runs, the action reads it. A block that was applied is also lost, for the action
already running, when a process outside the sandbox renames a new file over the path or deletes
and recreates it. I reported this as documentation, not as a vulnerability, in
[#31318](https://github.com/bazelbuild/bazel/issues/31318). Beside it I filed
[#31316](https://github.com/bazelbuild/bazel/issues/31316), on a stale paragraph in `build.mdx`,
and [#31317](https://github.com/bazelbuild/bazel/issues/31317), on sandbox pages that contradict
each other.

I measured on Linux only, Debian 13 with kernel 6.12. The main runs used Bazel 9.2.0 as released.
I used 7.2.1 and 7.3.0 for the history and 8.8.0 for the 8.x line. On 9.1.1 a second probe blocked
a directory as well as a file. I ran nothing on macOS or Windows, and
I did not measure the opt-in hermetic sandbox.

## What it promises

The flag's help, at 9.2.0 and at `7a5be08`: "For sandboxed actions, disallow access to this path."
No page of the documentation says more about it.

`docs/docs/sandboxing.mdx` says: "Sandboxing doesn't hide the host environment in any way.
Processes can freely access all files on the file system." Two other pages say the opposite. In
`docs/run/build.mdx`, sandboxes "guarantee that actions run hermetically and correctly". In
`docs/basics/artifact-based-builds.mdx`, actions "are unable to read any files they don’t
declare", and sandboxes "restrict actions from communicating via the network". The first matches
what I measured. By default an action read a file it had not declared, and another opened a
connection to 1.1.1.1:443. With the file blocked the read got `Permission denied`. With
`block-network` the connection failed. That is #31317.

Further down, `build.mdx` promises a warning when sandboxing is unsupported, and a flag to silence
it, `--ignore_unsupported_sandboxing`. 0c613be removed the warning in 2017. The flag was a
no-op until e887cfbfd641 deleted it for 9.0.0, in a change whose title says it removed "documentation
referencing it". `build.mdx` was not part of that change. 9.2.0 rejects the flag with
`Unrecognized option`. That is #31316.

## What it does

In `LinuxSandboxedSpawnRunner`, each blocked path that exists is hidden by bind mounting an
inaccessible file or directory over it. One that does not exist is skipped, and nothing is logged:

```java
if (!inaccessiblePath.exists()) {
  // No need to make non-existent paths inaccessible (this would make the bind mount fail).
  continue;
}
```

This runs when each action's sandbox is set up, not once per build. processwrapper-sandbox has no
code for blocked paths or for the network.

A bind mount hangs on the directory entry that existed when it was made. Since Linux 3.18 the
kernel detaches it when that entry is unlinked, or renamed over, from another mount namespace
(`mount_namespaces(7)`; torvalds/linux 8ed936b). A host that replaces a file by renaming over it,
or by deleting and recreating it, does that. Rewriting the file in place does not.

## Measured

Each case ran from a fresh output base. The 9.2.0 cases ran twice, from two workspaces built from
nothing, with the same result each time. A first run of them is not counted: my probe aborted on
its first failed read, because genrule commands run under `set -e`. Per-case records, with the
console comparisons and the control for each, are in [results/cells.ndjson](results/cells.ndjson).
The 7.2.1 replacement results and the mount-table readings on 9.2.0 and 7.2.1 come from one run of
`repro.sh` on each version, in [results/](results/); the flag test on 9.2.0 also ran once.

| what | result | control |
|---|---|---|
| absent path, flag set, against no flag (9.2.0, 8.8.0, 7.3.0) | 0 differing console lines; exit 0 | — |
| the same at `--sandbox_debug -s` (9.2.0; 9.1.1, blocked directory) | no line names the path as a mount; nothing else differs on 9.2.0, and on 9.1.1 one debug line prints at another position | a present, blocked path is named there three times |
| absent path, flag set, 7.2.1 | build fails: `Mount target '…' does not exist` | present and blocked: `Permission denied`; absent, no flag: builds |
| path created while action A runs; B set up after (9.2.0, 8.8.0; 9.1.1, directory) | **A reads it**; B gets `Permission denied` | present from the start: both denied; no flag: both read |
| blocked file renamed over, or deleted and recreated, while A runs (9.2.0, 7.2.1; 9.1.1, a file renamed over and a directory recreated) | **A reads the new file**; B denied | 9.2.0 and 7.2.1: rewritten in place, or untouched, A stays denied; no flag, A reads |
| A's own `/proc/self/mountinfo` at the path, before and after (9.2.0, 7.2.1, file; 9.1.1, directory) | a mount before the replacement, none after | rewritten in place, or untouched: the mount is still there |
| processwrapper-sandbox, file present, flag set (9.2.0) | reads it; 0 differing console lines against no flag | linux-sandbox with the flag: denied |

## The four questions

**Degraded mode.** When linux-sandbox is unavailable, `sandboxed` falls back to
processwrapper-sandbox. I made it unavailable by running Bazel inside
`bwrap --unshare-user --disable-userns`. The blocked file was read, and a `block-network` action
connected out, with exit 0. In the console the only sign was the process summary, which named
`processwrapper-sandbox` instead of `linux-sandbox`. The server's `java.log` had one
warning-level line. With the same wrapper and user namespaces available, both were denied.
`sandboxing.mdx` documents the fallback, and #13995 tracks it as a problem. No page says that it
drops `--sandbox_block_path` and `block-network` with it. The help of
`--sandbox_default_allow_network` does warn that it "may not work with all sandboxing
implementations". Under processwrapper-sandbox it did not.

**What the control cannot see, and what it says about it.** It cannot see a path that is absent
when an action's sandbox is set up, or a path replaced after that. It says nothing about either.
The console with the flag and an absent path is the one Bazel prints without the flag.

**Across platforms.** Not measured. On macOS Bazel hands the blocked paths to `sandbox-exec`, and a
2019 reading of the code in #4963 found the failure on an absent path to be Linux-only. I don't
know what macOS does with a replaced path.

**Absent paths.** The finding above. A user asked for the skip in #4963, wanting the flag "to
prevent likely cases of loss of hermeticity", and b6bb800 made it so for 7.3.0. The same
thread asked for the flag's description to "document what this is". The help did not change, and
no release note mentions it.

## Prior art

Bazel's tracker already has most of what I ran into. The silent fallback is #6957, #13995 and
#18071. Absent paths per flag are #4963 and #14226. Weaker network denial on macOS is #11325. In
#14895 a maintainer states that the sandbox is not a security boundary. I found no report that an
action already running reads a blocked path that appears, or is replaced, after its sandbox was
set up. #24514 is a different limit of the same flag, symlink resolution.

The replacement is not new as a mechanism. The kernel documents it, and a 2018 unix.stackexchange
question (418304) reproduces it with a plain bind mount. anthropics/sandbox-runtime also hides
paths with bind mounts, and wrote it down when it changed its cleanup (#184). I found it nowhere in
Bazel's help or tracker, and #31318 says both.

## What was not done

I did not run macOS or Windows. I did not measure the hermetic sandbox. Under
`--experimental_use_hermetic_linux_sandbox` the genrule never started: by its help that mode mounts
only what `--sandbox_add_mount_pair` provides, and I gave it no mount pairs. Every action I ran was
a local genrule. I tried neither persistent workers nor `bazel test`. I replaced the path with a
script, by renaming over it or deleting and recreating it, not with a tool that manages the file.

## Reproduce

On Linux, [repro.sh](repro.sh) runs the rows above that use a blocked file, against a released Bazel
through bazelisk. Each access result is printed next to its control. Run it as
`USE_BAZEL_VERSION=9.2.0 ./repro.sh`, and with `USE_BAZEL_VERSION=7.2.1` for the old error. It also
reads A's mount table. It does not repeat the 9.1.1 cases. It needs `bwrap` for the fallback and
network access for the connection test. Its output on both versions is in [results/](results/).
