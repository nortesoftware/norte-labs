#!/usr/bin/env python3
"""Derive the owner of a Go module path, two ways.

Go has no publisher accounts. A module is named by the path the go command uses to
fetch it, so "who published this" has to be derived, and the derivation is a
judgement that changes the count. Both rules below are applied to every module and
both numbers are reported.

RULE A - "repository owner", the primary rule.
    Resolve the module path the way `go get` resolves it: request the path with
    ?go-get=1 and read the <meta name="go-import" content="prefix vcs repo-url">
    tag, then take the owner from the repository URL. This answers "whose
    repository does the go command clone", which is the account that can change
    what the build gets. github.com/<org>/<repo> gives github.com/<org>.
    Paths already on a known forge are taken directly without a fetch.

RULE B - "declared prefix", the sensitivity rule.
    Purely syntactic, no network: host plus the first path element on a known
    forge, host alone otherwise. go.uber.org/zap is go.uber.org; k8s.io/api is
    k8s.io; github.com/spf13/cobra is github.com/spf13.

The two disagree wherever a vanity host fronts a forge account. Rule A merges
k8s.io/api and github.com/kubernetes/klog into one owner; rule B keeps them apart.
Rule A is the better answer to "who can change my build" and the worse answer to
"how many names did I have to trust", which is why both are published.
"""
import json, os, re, sys, time, urllib.request, urllib.error

FORGES = ('github.com', 'gitlab.com', 'bitbucket.org', 'codeberg.org', 'gitea.com', 'sr.ht', 'git.sr.ht')
META = re.compile(rb'<meta[^>]+name=["\']go-import["\'][^>]+content=["\']([^"\']+)["\']', re.I)
META_ALT = re.compile(rb'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']go-import["\']', re.I)


def rule_b(path):
    """Declared prefix: host + first element on a forge, host alone otherwise."""
    parts = path.split('/')
    host = parts[0]
    if host in FORGES and len(parts) > 1:
        return f'{host}/{parts[1]}'
    return host


def _owner_from_repo_url(url):
    """github.com/org/repo (any scheme or suffix) -> github.com/org."""
    u = re.sub(r'^[a-z+]+://', '', url.strip())
    u = re.sub(r'^[^@/]+@', '', u).replace(':', '/', 1) if u.startswith('git@') else u
    u = u.removesuffix('.git')
    parts = [p for p in u.split('/') if p]
    if not parts:
        return None
    host = parts[0]
    if host in FORGES and len(parts) > 1:
        return f'{host}/{parts[1]}'
    return host


def rule_a(path, cache, session_delay=0.0):
    """Repository owner, via the go-import meta tag, the way `go get` resolves it.

    Returns (owner, how) where how is one of:
      forge        - path is already on a known forge, taken directly
      meta         - resolved from a go-import meta tag
      unresolved   - the host answered but published no go-import tag
      unreachable  - the host could not be reached at all
    A module whose owner cannot be determined today is itself a result and is
    reported rather than dropped.
    """
    parts = path.split('/')
    host = parts[0]
    if host in FORGES:
        return rule_b(path), 'forge'

    # the meta tag is served for a path prefix; try longest prefix first, as go does
    for n in range(min(len(parts), 4), 0, -1):
        prefix = '/'.join(parts[:n])
        if prefix in cache:
            hit = cache[prefix]
            if hit and hit.get('repo'):
                o = _owner_from_repo_url(hit['repo'])
                if o:
                    return o, 'meta'
            continue
        entry = _fetch_meta(prefix, session_delay)
        cache[prefix] = entry
        if entry and entry.get('repo'):
            o = _owner_from_repo_url(entry['repo'])
            if o:
                return o, 'meta'
        if entry is None:
            return host, 'unreachable'
    return host, 'unresolved'


def _fetch_meta(prefix, delay):
    url = f'https://{prefix}?go-get=1'
    req = urllib.request.Request(url, headers={'User-Agent': 'norte-labs-go-owner/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read(200_000)
    except urllib.error.HTTPError as e:
        try:
            body = e.read(200_000)
        except Exception:
            return {}
    except Exception:
        return None
    finally:
        if delay:
            time.sleep(delay)
    m = META.search(body) or META_ALT.search(body)
    if not m:
        return {}
    fields = m.group(1).decode('utf8', 'replace').split()
    if len(fields) >= 3:
        return {'prefix': fields[0], 'vcs': fields[1], 'repo': fields[2]}
    return {}


if __name__ == '__main__':
    cache_path = sys.argv[1] if len(sys.argv) > 1 else 'owner-cache.json'
    cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}
    for line in sys.stdin:
        p = line.strip()
        if not p:
            continue
        a, how = rule_a(p, cache)
        print(json.dumps({'module': p, 'ownerA': a, 'how': how, 'ownerB': rule_b(p)}))
    json.dump(cache, open(cache_path, 'w'))
