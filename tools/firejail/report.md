# Report to netblue30@protonmail.com — firejail

Draft. Not sent.

---

Two issues about diagnostics rather than about a bypass. Neither lets a process escape a
restriction that was applied; both concern a restriction that was *not* applied and is not
reported as such. Reproduced on 0.9.74 as packaged by Debian 13. I checked both code paths
against `ccdf4ea` (2026-09-20) before writing: they are unchanged, so this is not a report about
an unsupported version.

## 1. `--debug-blacklists` does not mention a blacklist entry it skipped

`disable_file()` in `src/firejail/fs.c` returns as soon as `realpath()` fails with anything other
than `EACCES`, which is what happens when the path is not there:

```c
char* rpath = realpath(filename, NULL);
if (rpath == NULL && errno != EACCES) {
    return 1;
}
```

This is before any `printf` and before `fs_logger2()`. `arg_debug_blacklists` is read only at
`fs.c:154`, inside the branch where the blacklist was applied.

With a profile containing two entries, one existing and one not:

```
blacklist ${HOME}/t/present.txt
blacklist ${HOME}/t/absent.txt
```

`firejail --profile=p.profile --debug-blacklists /bin/true` prints
`Disable /home/…/t/present.txt` and says nothing at all about `absent.txt`. Full `--debug` adds
nothing. The applied entry does work — `cat present.txt` in the sandbox gives
`Permission denied` — and the skipped one leaves its path usable: a process in the sandbox
creates `absent.txt` and reads it back.

The same condition is already reported on the whitelist side. `fs_whitelist.c:668` prints, under
`--debug` or `--debug-whitelists`:

```
Removed path: whitelist ${HOME}/t/absent.txt
	new_name: /home/…/t/absent.txt
	realpath: (null)
	No such file or directory
```

I am not suggesting the skip is wrong — blacklisting a path that is not there has nothing to do.
What costs the user is that a mistyped blacklist line and a working one look identical at every
verbosity, including the flag meant for debugging blacklists. A line in `disable_file()`'s
`ENOENT` return, under `arg_debug_blacklists` and matching the whitelist wording, would close it.

## 2. A seccomp filter that fails to install is reported as installed

`seccomp_install_filters()` (`src/firejail/seccomp.c:64`) returns 1 when
`prctl(PR_SET_SECCOMP, …)` fails, after one `fwarning()` guarded by `err_printed`. The three
callers in `src/firejail/sandbox.c` (544, 580, 632 in 0.9.74) discard the return and continue to
`*set_sandbox_status = SANDBOX_DONE;` and `execvp()`. `join.c:241` reads `SANDBOX_DONE` as the
sandbox being ready.

The single warning is lost under `--quiet`, since `fwarning()` (`util.c:335`) returns early on
`arg_quiet`. The exit status is the child's. And `--seccomp.print`, which is where an operator
would look, does not answer the question either: `seccomp_print_filter()` (`seccomp.c:461`) reads
`RUN_SECCOMP_LIST` and prints the filter files firejail wrote, not the filters the kernel
accepted.

The kernel does publish the answer. For a live sandbox on this machine:

```
inside sandbox : Seccomp: 2   Seccomp_filters: 5
outside        : Seccomp: 0   Seccomp_filters: 0
```

`Seccomp_filters` matches the five files `--seccomp.print` lists when every install succeeded,
and is the number that would be short if one had not. Neither field name appears in the source.

**What I did not do:** I did not induce a failing install. On kernel 6.12 as an unprivileged user
I could not make `prctl(PR_SET_SECCOMP)` fail — an oversized syscall list is refused by
`MAX_ARG_LEN`, the same list in a profile by the profile line limit, and repeated `seccomp.drop`
directives replace rather than accumulate. So I am reporting that a failure has no route to the
operator, which is reproduced, and not a failure itself, which is not. If you consider the path
unreachable in practice on supported kernels, that is a fair answer and the first issue stands on
its own.

Checking the return of `seccomp_install_filters()` at the three call sites, or comparing
`Seccomp_filters` in `/proc/self/status` against the length of the filter list before signalling
`SANDBOX_DONE`, would make the two agree.

## Disclosure

Sent privately to the address in `SECURITY.md`. Nothing public has been filed. If you would
rather these were GitHub issues — the first in particular reads as an ordinary bug — say so and I
will move them there.
