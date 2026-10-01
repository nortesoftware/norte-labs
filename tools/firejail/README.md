# netblue30/firejail — what a control that did not apply reports about itself

Two findings in the same tool, both about the distance between what firejail was told to do and
what it tells the operator it did. Reproduced against firejail 0.9.74 as packaged by Debian 13;
both code paths behave as in 0.9.74 in both versions the maintainers support, release 0.9.80 and
the development version, whose code and line numbers at `ccdf4ea` (2026-09-20) are quoted below.

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
that.

The same sentence covers a blacklisted file that the host replaces while a jail runs, by renaming
a new file over it or by deleting and recreating it: the new file is created after firejail start.
Firejail blacklists with bind mounts, and since Linux 3.18 the kernel detaches such a mount when
its path is replaced from outside, which [../bazel/](../bazel/) measured in Bazel. I did not
measure it in firejail.

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
and `Seccomp_filters` is the count that would drop if one did not. It occurs nowhere in firejail's
source, and of its programs only `firemon --seccomp` and `jailcheck` read `Seccomp`, the mode.

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

**Finding 1: partial.** Open issue #3357 (2020) asks for a warning when a path does not exist; a
collaborator answers that `disable-*.inc` blacklists paths that need not exist and points to
`--debug-blacklists`. Discussion [#5263](https://github.com/netblue30/firejail/discussions/5263),
on how `whitelist`, `blacklist` and `noblacklist` interact, does not mention the diagnostic. Not
found: that `--debug-blacklists` omits skipped entries, and the asymmetry with the whitelist path.

**Finding 2: not found.** firejail's CVEs are mostly local privilege escalation and sandbox
escape, many through mount and namespace handling — CVE-2022-31214 is the landmark; none of the
three on seccomp is a filter that failed to install. The install-failure warning appears in user
logs in ten issues, discussed only in #448 (a kernel without `CONFIG_SECCOMP_FILTER`).

## Reported

Sent 2026-09-23 to `netblue30@protonmail.com`, the address in `SECURITY.md`, which limits support
to 0.9.80 and the development version. Text as sent: [report.md](report.md). No reply yet.

## Corrections, 2026-09-30

- The opening called the code paths identical in 0.9.74 and at `ccdf4ea`; it now says they behave
  as in 0.9.74 and that the code below is `ccdf4ea`'s. In 0.9.74 `disable_file()` returns `void`,
  and the lines are `fs.c:137`, `231`, `268`, `util.c:331`. report.md, as sent, says "unchanged".
- The opening spoke of one supported version, and *Reported* said `SECURITY.md` states that only
  0.9.80 is supported. Both now name 0.9.80 and the development version; `SECURITY.md` limits
  support to "the latest released version (and the current development version)".
- Section 2 said neither `Seccomp` nor `Seccomp_filters` occurs anywhere in firejail's source. It
  now says so of `Seccomp_filters` only; `firemon --seccomp` and `jailcheck` read `Seccomp:` from
  `/proc/<pid>/status`. report.md, as sent, keeps the old claim.
- *Prior art* said old issues mention, as an aside, that a blacklist of a missing path does
  nothing. It now cites open issue #3357 (2020), which asks for a warning when a path does not
  exist; *partial* stands, as #3357 does not say that `--debug-blacklists` omits skipped entries.
- *Prior art* said discussion #5263 is about `noblacklist` matching and that a maintainer reframes
  it. It now says the discussion is on how `whitelist`, `blacklist` and `noblacklist` interact, as
  its opening post shows, and omits the reply, a collaborator's answer to a second poster.
- *Prior art* said firejail's CVEs are about privilege escalation through mount and namespace
  handling. It now says mostly privilege escalation and sandbox escape (8 and 3 of NVD's 18), and
  that none of the three on seccomp (CVE-2016-10123, 2017-5206, 2019-12589) is a failed install.
- *Prior art* cited only `fseccomp` warnings about unavailable syscalls, a different message. It
  now says the install-failure warning appears in user logs in ten issues, discussed only in #448,
  where the cause was a kernel without `CONFIG_SECCOMP_FILTER`, not the version the warning names.
