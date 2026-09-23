# What is not there fails open, and quietly

A note on a recurrence, written after the second instance rather than the first, and kept to what
has actually been observed.

## The narrow pattern, twice

A control is configured to cover a path. At setup the path does not exist. The control skips it —
correctly, there is nothing there to restrict — and emits nothing. Later the path exists, and
nothing covers it. The operator has no way to tell a rule that is working from a rule that never
applied.

**nono** ([nolabs-ai/nono#1796](https://github.com/nolabs-ai/nono/issues/1796), open since
2026-09-06). Permission grants for paths that are not present are dropped "silently without any
diagnostic message at any verbosity level". The same report records the session summary printing
`No path denials were observed during this session` across 32 runs the sandbox itself broke.

**firejail** ([tools/firejail/](firejail/)). `disable_file()` returns as soon as `realpath()`
fails with `ENOENT`, before any print and before the filesystem log. `--debug-blacklists`, the
flag whose purpose is debugging blacklists, is read only inside the branch where the blacklist
was applied. A blacklist entry for a missing path produces no line at any verbosity, and the path
it named is writable and readable inside the sandbox.

Two instances is a recurrence, not a law. What makes it worth writing down is the second half of
the firejail case: the same program implements the same condition twice and reports it once. The
whitelist path prints `Removed path … realpath: (null) … No such file or directory` under its own
debug flag. So this is not a considered decision about noise, taken consistently; it is an
omission on one of two symmetric code paths, in a tool that had already written the diagnostic
for the other.

## The wider one, of which this is a case

The narrow pattern is one way of arriving at a more general failure, which every audit in this
directory has hit so far:

**the report describes what the control was asked to do, not what it achieved.**

- firejail, seccomp: `seccomp_install_filters()` returns failure, three callers discard it, the
  sandbox is marked `SANDBOX_DONE`, and `--seccomp.print` prints the filter files that were
  written rather than the filters the kernel accepted. The kernel publishes the answer in
  `/proc/<pid>/status` as `Seccomp` and `Seccomp_filters`; neither name is in the source.
- microsoft/sbom-tool ([tools/sbom-tool/](sbom-tool/)): the exit code is assigned from a ternary
  whose condition is the literal `true`, so it reports the validation it set out to do and never
  the result.
- npm `audit signatures`, read but not yet audited: a package counts as `missing` only when the
  registry returned keys, and the key lookup returns `null` on a TUF error or a 404, so with no
  keys an unsigned package is neither verified nor missing.
- pmg, from the earlier survey: a network allowlist present in fifteen of seventeen shipped
  profiles and installed by nothing, with `profiles/go.yml` saying so — "They are NOT
  kernel-enforced."

In each, the intended state is available and gets reported; the achieved state is available too,
and is not consulted. `Seccomp_filters` is one `open()` away. The validation result is already
computed and printed on the line above the exit code. The key count is already in scope.

## What would test it

This is the kind of claim that gets more interesting when someone tries to break it, so the tests
worth running are the ones that could:

- A control with no degraded mode at all — one that aborts rather than continuing — would not fit
  and would bound the pattern. `nsjail` looks like this from reading: every seccomp failure path
  in `sandbox.cc` logs and returns false. It is on the list for that reason as much as any other.
- A tool that reports achievement rather than intent would be the counterexample. None of the
  four above does, but the sample is four, all chosen for a mold that selects for this. Picking a
  target *without* the mold in mind is the honest next step, and has not been done.
- The asymmetry argument only works while the two code paths really are symmetric. If a
  maintainer answers that whitelist and blacklist differ for a reason — and there may be one —
  that half of the firejail case goes, and the diagnostic gap stands on its own.

Two instances of the narrow pattern and four of the wider one, all from a deliberately biased
sample. Enough to write down and look for; not enough to call it how these controls are written.
