# google/capslock — audited because it was drawn, and the pattern is not there

The fourth target was not chosen. It was drawn at random from the inventory of remaining
candidates, under a seed fixed and committed before the draw ran, precisely so that the pattern in
[../absent-fails-open.md](../absent-fails-open.md) would face a case nobody selected for its
shape. There is no selection bias to discount here, and that is the whole point of the exercise:
the inventory had already rated Capslock a poor fit and `enforces_or_detects: report only`, and it
was audited anyway. The record of the draw is not published; what matters publicly is that this
target was not picked for its convenience.

**Result: no finding.** Audited at `a295785` (2026-09-22). The reasons are set out below because
a negative result is only worth anything if it says what was looked for and where.

## What it promises

"A capability analysis CLI for Go packages that informs users of which privileged operations a
given package can access. This works by classifying the **capabilities** of Go packages by
following transitive calls to privileged standard library operations."

It does not claim to be a gate. The README places it "in conjunction with other security signals
to indicate which code requires additional scrutiny", which is a weaker and more accurate claim
than any of the three tools audited before it made.

## The four questions, and why each fails to bite

**Degraded mode — what happens when it cannot do the analysis.** It aborts. `cmd/capslock/capslock.go:209`:

```go
if printErrors(pkgs) {
    return fmt.Errorf("Some packages had errors. Aborting analysis.")
}
```

`printErrors` walks every loaded package and every module, collects each error into a buffer,
writes the buffer to stderr and returns whether there were any; a truncated list is reported as
`(N more errors)` rather than dropped. `run()` returning an error reaches `main()`'s `default`
branch, which logs it and exits 2. There is no path that analyses a partially loaded graph and
prints capabilities from it.

**What the control cannot see, and what it says about it.** This is where the tool inverts the
pattern rather than exhibiting it. Everything a Go call-graph analysis cannot follow is surfaced
*as a capability of its own* rather than omitted: `CAPABILITY_REFLECT`, `CAPABILITY_CGO`,
`CAPABILITY_UNSAFE_POINTER`, and `CAPABILITY_ARBITRARY_EXECUTION` for assembly and for functions
reached through `//go:linkname`. `os/exec` and `plugin` are likewise reported as capabilities
because the analysis cannot know what the loaded program will do. `docs/caveats.md` states the
principle in the tool's own words, about reflection:

> "Otherwise, the tool treats the use of reflect as another capability and informs the user of
> it, so that capabilities are not missed without any indication to the user."

That sentence is the inverse of the finding this programme has been looking for.

**Across platforms.** The analysis covers the files `go build` would, and the assumption is
explicit and adjustable: `-buildtags`, `-goos` and `-goarch`, documented under *Build
Constraints*. A file excluded by a build constraint is out of scope by the same rule the compiler
uses, and the flag to change that is named.

**Absent — a blind spot the tool does not surface.** There is exactly one, and it is disclosed:

> "Data races on variables of interface and slice type can produce arbitrary behavior … The tool
> does **not** inform users of writes to interfaces and slices that may cause a data race."

Documented rather than hidden. It is also the one place where the tool's design principle and its
behaviour diverge, and it says so itself.

The `docs/caveats.md` document also opens on false positives — static analysis assumes every
branch may execute, so a capability can be reported for a path that never runs. The tool errs
towards over-reporting, which is the opposite direction from the one these audits look for.

## Prior art

No published finding that Capslock reports fewer capabilities than it can see without saying so.
The nearest work is [GoLeash](https://arxiv.org/pdf/2505.11016), which argues for runtime policy
enforcement for Go on the ground that static capability analysis cannot observe what a program
actually does — an argument about the method's limits, made from the limits the tool documents,
not a report that the tool misstates them. Third-party integrations exist that do turn it into a
gate ([capcheck](https://github.com/git-pkgs/capcheck), Capslock analysis on deps.dev); whether
those integrations preserve the exit-code semantics is a question about them, not about Capslock.

## What was not done

Capslock was not run. There is no Go toolchain on this host, and this was established before
anything was claimed rather than after. The degraded-mode conclusion rests on reading a short and
unambiguous path — one `if` whose body returns an error that `main` turns into `os.Exit(2)` — and
the rest rests on documentation that states the design principle and on the capability list that
implements it. Running it would add confirmation, not change the reading.

## Channel

`google-capslock-team@googlegroups.com`, per `SECURITY.md`, acknowledging within three working
days on a 90-day disclosure timeline. Nothing was reported: there is nothing to report.
