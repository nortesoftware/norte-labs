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

## A case nobody selected, found while looking at something else

[golang/go#79070](https://github.com/golang/go/issues/79070) (2026) came out of the Go ecosystem
prior-art sweep, not out of any search for this shape. The go command verifies a module against
the checksum database; the report states the defect in one sentence:

> "If, however, the checksum database returns a successful response that contains no entry for
> the module, the go command incorrectly permitted validation to succeed."

A successful response with no entry is precisely "I could not tell you about this module". It was
read as "nothing is wrong with this module". The report frames the consequence for the path Go
turns on by default: "a malicious module proxy can serve altered versions of the Go toolchain"
when one is selected via `GOTOOLCHAIN`.

This matters to the argument above in a way the five audited cases cannot. It was not drawn and
it was not chosen — it surfaced while sweeping prior art for a different question entirely — so
it is not subject to the selection bias that the rest of this note is hedged against. It is also
a gate rather than a reporter, which is the distinction the fifth draw left open and the sixth is
meant to test.

It does not settle anything by itself. One unselected case is one case, and it was found inside a
search whose subject matter was adjacent. But it is the first instance here that was not
selected for its shape, and it should be counted separately from the five that were.

## What would test it

This is the kind of claim that gets more interesting when someone tries to break it, so the tests
worth running are the ones that could:

- A control with no degraded mode at all — one that aborts rather than continuing — would not fit
  and would bound the pattern. `nsjail` looks like this from reading: every seccomp failure path
  in `sandbox.cc` logs and returns false. It is on the list for that reason as much as any other.
- A tool that reports achievement rather than intent would be the counterexample. None of the
  four above does, but the sample is four, every one of them picked because it looked like this.
  Picking a target without that in mind is the honest next step, and has not been done.
- The asymmetry argument only works while the two code paths really are symmetric. If a
  maintainer answers that whitelist and blacklist differ for a reason — and there may be one —
  that half of the firejail case goes, and the diagnostic gap stands on its own.

Two instances of the narrow pattern and four of the wider one, all from a deliberately biased
sample. Enough to write down and look for; not enough to call it how these controls are written.

## The drawn case, and what it settles

The bias was then tested the only way it could be: a fifth target was drawn at random from the
inventory of 59 remaining candidates, under a seed fixed and committed before the draw ran, and
audited the same way whatever it turned out to be. Nobody picked it for its shape. It came out
**google/capslock**, which the inventory had already rated a poor fit. The record of the draw is
not published; what it establishes — that this target was not chosen for convenience — is.

**The pattern did not appear** ([capslock/](capslock/)). On every leg the tool does the opposite
of what the pattern describes. It aborts with exit 2 when any package fails to load, rather than
reporting on a partial graph. Everything its analysis cannot follow — reflection, cgo, assembly,
`unsafe`, `go:linkname`, `os/exec`, `plugin` — is emitted as a capability of its own rather than
dropped, and `docs/caveats.md` gives that as the reason: "so that capabilities are not missed
without any indication to the user". Its one unsurfaced blind spot, data races on interface and
slice types, is documented as unsurfaced. It errs towards over-reporting.

So this note stays what it was: an observation about four cases selected for their form, plus one
drawn case where the form is absent. It is not a claim about how these controls are written in
general, and the draw is the reason it cannot be upgraded into one on the evidence here.

What the drawn case does add is a negative worth having. Capslock is the one tool of the five
that states the principle explicitly as a design goal, in a document about its own limits. That
is a cheap thing for any of the others to have done and none of them did — which is a remark
about documentation practice, not about a defect, and is as far as five cases will carry it.

One asymmetry to keep in view: Capslock is a reporting tool and makes a weaker claim than the
four before it. A tool that promises less has less to misreport. Whether the pattern is about how
controls are written or about what happens when a tool's promise outruns its mechanism is not
settled by five cases either, and the second reading is the one a sixth draw should be aimed at.
