# netblue30/firejail — what a control that did not apply reports about itself

Two findings in the same tool, both about the distance between what firejail was told to do and
what it tells the operator it did. Reproduced against firejail 0.9.74 as packaged by Debian 13;
both code paths are identical in 0.9.74 and at `ccdf4ea` (2026-09-20), so the version the
maintainers support carries them unchanged.

`repro.sh` runs everything below and cleans up after itself.

## 1. A blacklist for a path that does not exist is skipped, and nothing says so

`disable_file()` (`src/firejail/fs.c`) resolves the path first:

```c
char* rpath = realpath(filename, NULL);
if (rpath == NULL && errno != EACCES) {
    return 1;
}
```

`realpath` fails with `ENOENT` for a path that is not there, so the function returns before any
print and before `fs_logger2()`. The caller at `fs.c:291` discards the return. `GLOB_NOCHECK`
upstream, at `fs.c:254`, is what puts the literal pattern into the loop in the first place —
its comment says profiles blacklist files that may not exist and that this "makes that okay".

`arg_debug_blacklists`, the flag behind `--debug-blacklists`, is read in exactly one place,
`fs.c:154`, inside the branch that ran. So the flag whose documented purpose is debugging
blacklists lists the entries that applied and is silent about the ones that did not.

Observed, with a profile holding one blacklist of a file that exists and one of a file that does
not:

| | `--debug-blacklists` | full `--debug` |
|---|---|---|
| `present.txt`, exists | `Disable /home/…/present.txt` | 1 line |
| `absent.txt`, missing | — | 0 lines |

The entry that applied does block: `cat present.txt` inside the sandbox returns
`Permission denied`. The entry that did not leaves the path it named writable and readable —
a process in the sandbox creates `absent.txt` during the session and reads it straight back.

That last behaviour is documented, and this write-up should have said so from the start.
`firejail.1.in` states it: "This pattern is matched at firejail start, and is NOT UPDATED at
runtime. Files matching a blacklist, but created after firejail start will be accessible within
the jail." The finding here is the missing diagnostic, not the behaviour — a rule that did
nothing and a rule that worked are indistinguishable at every verbosity — and it is narrowed to
that. Found while running [mold 1](../molds/01-complement-firejail.md).

The same condition is reported elsewhere in the same program. `fs_whitelist.c:668` handles a
`realpath` that returns NULL by printing, under `--debug` or `--debug-whitelists`:

```
Removed path: whitelist ${HOME}/…/absent.txt
	new_name: /home/…/absent.txt
	realpath: (null)
	No such file or directory
```

So firejail implements "the path is not there at setup" twice and reports it once. A blacklist
line with a typo in it, and one that is doing its job, are indistinguishable at every verbosity
the tool offers.

## 2. A seccomp filter that fails to install is warned about once and then reported as installed

`seccomp_install_filters()` (`src/firejail/seccomp.c:64`) walks the filter list and installs each
one. On failure:

```c
if (rv == -1) {
    if (!err_printed)
        fwarning("seccomp disabled, it requires a Linux kernel version 3.5 or newer.\n");
    err_printed = 1;
    r = 1;
}
```

It warns once however many filters failed, attributes every failure to the kernel version
whatever the errno was, and returns 1. All three callers in `src/firejail/sandbox.c` — at 547,
581 and 633 on `main`, 544, 580 and 632 in 0.9.74 — discard that return and go straight to:

```c
seccomp_install_filters();

if (set_sandbox_status)
    *set_sandbox_status = SANDBOX_DONE;
execvp(arg[0], arg);
```

`SANDBOX_DONE` is what `join.c:241` reads to decide the sandbox is ready to be joined.

The one warning does not survive `--quiet`: `fwarning()` (`util.c:335`) returns immediately when
`arg_quiet` is set.

The operator-facing way to check is `--seccomp.print`, and it does not answer the question.
`seccomp_print_filter()` (`seccomp.c:461`) opens `RUN_SECCOMP_LIST` and prints the contents of
each filter **file firejail wrote to disk**. It never asks the kernel what the process is running
under. Against a live sandbox it prints five files; the kernel's own account of the same process
is in `/proc/<pid>/status`:

```
inside sandbox : Seccomp: 2   Seccomp_filters: 5
this shell     : Seccomp: 0   Seccomp_filters: 0
```

Those two fields are the ground truth, they agree with the file list when the install succeeded,
and `Seccomp_filters` is the count that would drop if one did not. Neither string occurs anywhere
in firejail's source.

**What is read and what is run.** The reporting half above is reproduced: every operator-visible
surface — the warning, `--quiet`, the exit status, `--seccomp.print` — reports what firejail
intended rather than what the kernel accepted, and the kernel's answer is available and unused.
The failing install itself was not induced. On this host, kernel 6.12, `prctl(PR_SET_SECCOMP)`
does not fail for an unprivileged caller, and three attempts to force it failed honestly: an
oversized syscall list on the command line is refused by `MAX_ARG_LEN` (4128), the same list in a
profile is refused by the profile line limit at about 2,000 entries, and repeated `seccomp.drop`
directives do not accumulate — the last one wins. The finding is therefore that a failure has no
path to the operator, not a demonstration of the failure.

## Prior art

**Finding 1: partial.** That a blacklist of a missing path does nothing is noted in passing in
old issues. Discussion [#5263](https://github.com/netblue30/firejail/discussions/5263), which the
title suggests would cover it, is about `noblacklist` matching semantics and a maintainer
reframes it as a configuration misunderstanding; it does not mention the diagnostic. Not found:
that `--debug-blacklists` omits skipped entries, and the asymmetry with the whitelist path.

**Finding 2: not found.** firejail's CVE history is substantial and is about local privilege
escalation through mount and namespace handling — CVE-2022-31214 is the landmark. Searches for
the install-failure path surface `fseccomp` warnings about syscalls unavailable on the platform,
which are a different message from a different stage.

## Reported

Sent 2026-09-23 to `netblue30@protonmail.com`, the address in `SECURITY.md`, which also states
that only 0.9.80 is supported. Text as sent: [report.md](report.md). No reply yet.
