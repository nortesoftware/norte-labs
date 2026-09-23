# Draft issue for npm/cli

Filed 2026-09-23 as https://github.com/npm/cli/issues/10018

---

**Title:** `npm audit signatures` does not report how many packages it skipped for want of registry keys

### Current behaviour

When a registry does not publish signing keys, `audit signatures` skips the packages installed
from it. That part is intended — #5479 asked for `E400` to be treated like `E404` for exactly
this reason, and the summary counts only what was checked, through `auditedWithKeysCount`.

What the summary does not say is how much was skipped. In a tree where some dependencies resolve
from a registry with keys and some from a registry without, the output and the exit code are
indistinguishable from a tree that was fully verified.

Reproduced on npm 10.9.8 with a local registry that answers `404` on `/-/npm/v1/keys`:

```
$ cat package.json
{ "name":"mixed-test","version":"1.0.0",
  "dependencies":{ "@nl/nokeys-dep":"1.0.0", "lodash":"4.17.21" } }
$ cat .npmrc
@nl:registry=http://127.0.0.1:8899

$ npm audit signatures
audited 1 package in 0s

1 package has a verified registry signature
$ echo $?
0
```

`@nl/nokeys-dep` is in the tree and carries no signature. It is not in the audited count, not
under `missing`, not under `invalid`. Nothing in the output indicates it exists.

When *nothing* can be audited the command already does the right thing:

```
$ npm audit signatures
npm error found no dependencies to audit that were installed from a supported registry
$ echo $?
1
```

### Why it matters

A pipeline that runs `npm audit signatures` and branches on the exit code is asking "is this tree
verified". In the mixed case it is told yes, when the honest answer is "the part of it that could
be checked". The configuration where this arises — part of the tree resolving through an internal
mirror, a proxy or a third-party registry that does not publish keys — is a common one, and
arguably the one where the gate matters most.

The tree's total is not printed next to the audited count, so the two cannot be compared without
counting the lockfile separately.

### Suggested change

Report the skipped count. Something like:

```
audited 1 package in 0s
1 package skipped: no signing keys published by http://127.0.0.1:8899

1 package has a verified registry signature
```

The information is already in hand at that point — the edges walked, the registries resolved and
`auditedWithKeysCount` — so this is a reporting change rather than a behavioural one. Whether a
skipped package should also affect the exit code is a separate decision, and a flag along the
lines of `--require-signatures` would leave the current default alone.

I am not suggesting the skip itself should change.
