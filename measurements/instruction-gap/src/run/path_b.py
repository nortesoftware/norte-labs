#!/usr/bin/env python3
"""ecosystems/npm option 1, path B: instruction-gap's lockfiles read by parsers of their own, the cells
built under instruction-gap's rules (controls C2, C4) and under crates' rules, and crates' figures.
Nothing here is taken from instruction-gap's code; YAML is read by the small reader below.

usage: path_b.py <store-dir> <population.ndjson> <registry.ndjson.gz> <out-dir>
       path_b.py --controls <controls-dir>      (C3: prints what each synthetic lockfile gives)
"""
import collections, gzip, itertools, json, math, os, re, sys

# ---- YAML, the subset lockfiles use: block mappings and sequences, flow collections, quoted scalars

class YamlError(Exception):
    pass


_ESCAPES = {'0': '\0', 'a': '\a', 'b': '\b', 't': '\t', '\t': '\t', 'n': '\n', 'v': '\v', 'f': '\f', 'r': '\r',
            'e': '\x1b', ' ': ' ', '"': '"', '/': '/', '\\': '\\', 'N': '\x85', '_': '\xa0', 'L': '\u2028', 'P': '\u2029'}


def _unquote(s):
    if s.startswith("'"):
        if not s.endswith("'") or len(s) < 2: raise YamlError(f'bad single-quoted scalar {s[:40]}')
        return s[1:-1].replace("''", "'")
    if s.startswith('"'):
        if not s.endswith('"') or len(s) < 2: raise YamlError(f'bad double-quoted scalar {s[:40]}')
        out, i, end = [], 1, len(s) - 1
        while i < end:
            c = s[i]
            if c != '\\': out.append(c); i += 1; continue
            e = s[i + 1]
            if e in _ESCAPES: out.append(_ESCAPES[e]); i += 2
            elif e in 'xuU':
                w = {'x': 2, 'u': 4, 'U': 8}[e]
                out.append(chr(int(s[i + 2:i + 2 + w], 16))); i += 2 + w
            else: raise YamlError(f'bad escape in {s[:40]}')
        return ''.join(out)
    return s


def _scan_quoted(s, i):
    q = s[i]; j = i + 1
    while j < len(s):
        if q == "'" and s[j] == "'":
            if j + 1 < len(s) and s[j + 1] == "'": j += 2; continue
            return j + 1
        if q == '"' and s[j] == '\\': j += 2; continue
        if q == '"' and s[j] == '"': return j + 1
        j += 1
    raise YamlError(f'unterminated quote in {s[:60]}')


def _flow(s, i):
    """Parses a flow collection or scalar starting at s[i]; returns (value, next index)."""
    while i < len(s) and s[i] == ' ': i += 1
    if s[i] == '{':
        out = {}; i += 1
        while True:
            while i < len(s) and s[i] in ' ,': i += 1
            if s[i] == '}': return out, i + 1
            k, i = _flow_scalar(s, i, ':')
            if s[i] != ':': raise YamlError(f'flow mapping without colon: {s[:60]}')
            i += 1
            v, i = _flow(s, i)
            out[k] = v
    if s[i] == '[':
        out = []; i += 1
        while True:
            while i < len(s) and s[i] in ' ,': i += 1
            if s[i] == ']': return out, i + 1
            v, i = _flow(s, i)
            out.append(v)
    return _flow_scalar(s, i, ',}]')


def _flow_scalar(s, i, stops):
    while i < len(s) and s[i] == ' ': i += 1
    if s[i] in '\'"':
        j = _scan_quoted(s, i)
        return _unquote(s[i:j]), j
    j = i
    while j < len(s):
        c = s[j]
        if c in ',}]' and c in stops + ',}]': break
        if c == ':' and ':' in stops and (j + 1 == len(s) or s[j + 1] in ' ,}]'): break
        j += 1
    return s[i:j].strip(), j


def _split_key(line):
    """'key: value' -> (key, rest); the key may be quoted; rest may be ''."""
    if line[0] in '\'"':
        j = _scan_quoted(line, 0)
        key = _unquote(line[:j])
        rest = line[j:]
        if not rest.startswith(':'): raise YamlError(f'quoted key without colon: {line[:60]}')
        return key, rest[1:].strip()
    j = 0
    while j < len(line):
        if line[j] == ':' and (j + 1 == len(line) or line[j + 1] == ' '):
            return line[:j].strip(), line[j + 1:].strip()
        j += 1
    raise YamlError(f'no key in line: {line[:60]}')


def _value(rest):
    if rest == '': return None
    if rest[0] in '{[':
        v, j = _flow(rest, 0)
        if rest[j:].strip(): raise YamlError(f'trailing text after flow value: {rest[:60]}')
        return v
    if rest[0] in '\'"':
        j = _scan_quoted(rest, 0)
        return _unquote(rest[:j])
    if rest[0] in '|>&*!': raise YamlError(f'unsupported YAML: {rest[:40]}')
    return re.sub(r'\s+#.*$', '', rest)


def yaml_load(text):
    """Every document, merged in order: later top-level keys override earlier ones."""
    out = {}
    docs, cur = [], []
    for raw in text.split('\n'):
        if raw.rstrip() == '---' or raw.startswith('--- '): docs.append(cur); cur = []
        elif raw.rstrip() == '...': continue
        else: cur.append(raw)
    docs.append(cur)
    for lines in docs:
        d = _block(lines)
        if isinstance(d, dict): out.update(d)
    return out


_BLOCK_SCALAR = re.compile(r'^([|>])([-+]?)([1-9]?)\s*(#.*)?$')


def _depth(s):
    """Open flow brackets left at the end of s, quoted scalars skipped."""
    d, i, prev = 0, 0, ''
    while i < len(s):
        c = s[i]
        if c in '\'"' and prev in ('', '{', '[', ',', ':'):
            try: i = _scan_quoted(s, i)
            except YamlError: return d + 1    # the quote closes on a later line
            prev = 'q'; continue
        if c in '{[': d += 1
        elif c in '}]': d -= 1
        if c != ' ': prev = c
        i += 1
    return d


def _tokens(lines):
    """(indent, text, preset) for each node line: a flow collection or a quoted or plain scalar that
    spans lines is joined onto its first line; a block scalar is read whole and given as preset."""
    items, i, n = [], 0, len(lines)
    while i < n:
        raw = lines[i].rstrip(); i += 1
        if not raw.strip() or raw.lstrip().startswith('#'): continue
        if '\t' in raw[:len(raw) - len(raw.lstrip())]: raise YamlError('tab indentation')
        ind = len(raw) - len(raw.lstrip(' ')); txt = raw.lstrip(' ')
        if txt.startswith('? '):
            # an explicit key: "? key" here, ": value" on the next line at the same indent
            nxt = lines[i].rstrip() if i < n else ''
            if len(nxt) - len(nxt.lstrip(' ')) != ind or not (nxt.lstrip(' ') + ' ').startswith(': '):
                raise YamlError(f'explicit key without its value: {txt[:60]}')
            i += 1
            key, val = txt[2:].strip(), nxt.lstrip(' ')[2:].strip()
            if val and re.match(r'^(?:[^\'"{\[|>][^:]*|\'[^\']*\'|"[^"]*"):( |$)', val):
                items.append([ind, key + ':', None]); items.append([ind + 2, val, None])
            else:
                items.append([ind, (key + ': ' + val).strip(), None])
            continue
        if txt.startswith(('{', '[')):
            head, rest = '', txt
        elif txt.startswith('- ') or txt == '-':
            items.append([ind, txt, None]); continue
        else:
            try:
                _split_key(txt)
            except YamlError:
                # a plain scalar continued from the line before
                if items and ind > items[-1][0] and items[-1][2] is None:
                    items[-1][1] += ' ' + txt; continue
                raise
            j = len(txt) - len(_split_key(txt)[1])
            head, rest = txt[:j], txt[j:]
        m = _BLOCK_SCALAR.match(rest)
        if m and head:
            body = []
            while i < n and (not lines[i].strip() or len(lines[i]) - len(lines[i].lstrip(' ')) > ind):
                body.append(lines[i].rstrip()); i += 1
            trail = 0
            while body and not body[-1].strip(): body.pop(); trail += 1
            bi = ind + int(m.group(3)) if m.group(3) else min((len(l) - len(l.lstrip(' ')) for l in body if l.strip()), default=ind + 1)
            text_lines = [l[bi:] for l in body]
            if m.group(1) == '|': text = '\n'.join(text_lines)
            else: text = re.sub(r'(?<!\n)\n(?!\n)', ' ', '\n'.join(text_lines))
            if m.group(2) == '+': text += '\n' * (1 + trail)
            elif m.group(2) == '': text += '\n' if body else ''
            items.append([ind, head.rstrip(), ('value', text)]); continue
        if rest[:1] in ('{', '[', "'", '"') and _depth(rest) > 0:
            while i < n and _depth(rest) > 0:
                rest += ' ' + lines[i].strip(); i += 1
            if _depth(rest) > 0: raise YamlError(f'unclosed flow or quote: {rest[:60]}')
        items.append([ind, (head + ' ' + rest).strip() if head else rest, None])
    return items


def _block(lines):
    items = _tokens(lines)
    if not items: return None

    # recursive descent over [indent, text, preset] items
    def parse_node(idx, indent):
        """Parses the node whose first item is items[idx] at the given indent; returns (value, next idx)."""
        ind, txt, _ = items[idx]
        if txt.startswith(('{', '[')):
            return _value(txt), idx + 1
        if txt.startswith('- ') or txt == '-':
            seq = []
            while idx < len(items) and items[idx][0] == indent and (items[idx][1].startswith('- ') or items[idx][1] == '-'):
                body = items[idx][1][2:].strip() if items[idx][1] != '-' else ''
                if body == '':
                    if idx + 1 < len(items) and items[idx + 1][0] > indent:
                        v, idx = parse_node(idx + 1, items[idx + 1][0])
                    else:
                        v, idx = None, idx + 1
                    seq.append(v); continue
                if re.match(r'^(?:[^\'"{\[][^:]*|\'[^\']*\'|"[^"]*"):( |$)', body):
                    # "- key: value" opens a mapping inside the item
                    sub_indent = indent + 2
                    items[idx] = [sub_indent, body, None]
                    v, idx = parse_map(idx, sub_indent)
                    seq.append(v); continue
                seq.append(_value(body)); idx += 1
            return seq, idx
        return parse_map(idx, indent)

    def parse_map(idx, indent):
        m = {}
        while idx < len(items):
            ind, txt, preset = items[idx]
            if ind < indent: break
            if ind > indent: raise YamlError(f'unexpected indentation at {txt[:60]}')
            if txt.startswith('- '): break
            key, rest = _split_key(txt)
            idx += 1
            if preset is not None:
                v = preset[1]
            elif rest == '':
                if idx < len(items) and items[idx][0] > indent:
                    v, idx = parse_node(idx, items[idx][0])
                elif idx < len(items) and items[idx][0] == indent and items[idx][1].startswith('- '):
                    v, idx = parse_node(idx, indent)
                else:
                    v = None
            else:
                v = _value(rest)
            m[key] = v
        return m, idx

    value, idx = parse_node(0, items[0][0])
    if idx != len(items): raise YamlError(f'unparsed text at {items[idx][1][:60]}')
    return value


# ---- what each package source is

REGISTRY_HOSTS = ('registry.npmjs.org', 'registry.yarnpkg.com', 'registry.npmmirror.com')


def source_kind(url):
    """git, link, registry or tarball, for a URL or spec as a lockfile records it."""
    s = url or ''
    gitlike = (s.startswith(('git+', 'git:', 'git@')) or re.search(r'\.git(#|$)', s) or '#commit=' in s
               or 'codeload.github.com' in s or re.search(r'github\.com/[^/]+/[^/]+/tar\.gz', s)
               or re.search(r'#[0-9a-fA-F]{7,40}$', s))
    if gitlike and '/-/' not in s: return 'git'
    if re.match(r'^(github|gitlab|bitbucket|gist):', s): return 'git'
    if re.match(r'^(file|link|portal|workspace):', s): return 'link'
    if re.match(r'^https?://', s):
        if re.search(r'/-/[^/]+\.tgz(\?|$)', s) or any(h in s for h in REGISTRY_HOSTS): return 'registry'
        return 'tarball'
    return 'registry'


def name_at(spec):
    """'@scope/name@x' -> ('@scope/name', 'x'): the name ends at the first '@' after the first character."""
    i = spec.find('@', 1)
    return (spec[:i], spec[i + 1:]) if i > 0 else (spec, '')


def tarball_name(url):
    m = re.search(r'/((?:@[^/]+/)?[^/@]+)/-/[^/]+\.tgz', url or '')
    return m.group(1) if m else None


def aliased(name, spec, url):
    """The package an alias installs: the registry tarball path names it, or the npm: locator."""
    t = tarball_name(url)
    if t: return t
    if spec.startswith('npm:'):
        real, rest = name_at(spec[4:])
        if rest: return real
    return name


FIELDS = ('dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies')


def manifest_decls(m, where):
    out = []
    if not isinstance(m, dict): return out
    for f in FIELDS:
        d = m.get(f)
        if isinstance(d, dict):
            for n, spec in d.items():
                out.append((n, spec if isinstance(spec, str) else json.dumps(spec), f, where))
    return out


Node = collections.namedtuple('Node', 'name version kind')


def parse_package_lock(text):
    j = json.loads(text)
    nodes, decls, links = [], [], []
    if isinstance(j.get('packages'), dict):
        for path, p in j['packages'].items():
            if path == '' or 'node_modules/' not in path:
                decls += manifest_decls(p, path or '.')
                continue
            tail = path.rsplit('node_modules/', 1)[1]
            if p.get('link'):
                links.append(p.get('name') or tail); continue
            name = p.get('name') or tail
            url = p.get('resolved')
            ver = p.get('version')
            if url: kind = source_kind(url)
            elif isinstance(ver, str) and re.match(r'^(file|link):', ver): kind = 'link'
            elif ver: kind = 'registry'
            else: kind = 'other'
            nodes.append(Node(name, str(ver if ver is not None else ''), kind))
        return {'manager': 'npm', 'version': str(j.get('lockfileVersion', 1)), 'nodes': nodes,
                'decls': decls, 'links': links}

    def walk(deps):
        for name, p in (deps or {}).items():
            url = p.get('resolved')
            ver = str(p.get('version', ''))
            if url: kind = source_kind(url)
            elif re.match(r'^(file|link):', ver): kind = 'link'
            else: kind = 'registry'
            nodes.append(Node(name, ver, kind))
            walk(p.get('dependencies'))
    walk(j.get('dependencies'))
    return {'manager': 'npm', 'version': str(j.get('lockfileVersion', 1)), 'nodes': nodes, 'decls': None, 'links': []}


def parse_yarn_v1(text):
    nodes = []
    entry = None

    def done(e):
        if not e or 'version' not in e: return
        first = e['keys'][0]
        alias, spec = name_at(first)
        url = e.get('resolved')
        if url: url = re.sub(r'#[0-9a-f]{40}$', '', url)
        kind = source_kind(url) if url else source_kind(spec)
        nodes.append(Node(aliased(alias, spec, url), e['version'], kind))

    for raw in text.split('\n'):
        if not raw.strip() or raw.startswith('#'): continue
        if not raw.startswith(' '):
            done(entry)
            head = raw.rstrip()
            if head.endswith(':'): head = head[:-1]
            keys = [k.strip() for k in head.split(',')]
            keys = [k[1:-1] if len(k) >= 2 and k[0] == '"' and k[-1] == '"' else k for k in keys]
            entry = {'keys': keys}
            continue
        if entry is None: continue
        m = re.match(r'^  (version|resolved|integrity) "?([^"]*)"?\s*$', raw)
        if m: entry[m.group(1)] = m.group(2)
    done(entry)
    return {'manager': 'yarn', 'version': '1', 'nodes': nodes, 'decls': None, 'links': []}


def parse_berry(text):
    y = yaml_load(text)
    nodes, decls = [], []
    meta = y.get('__metadata') or {}
    for key, p in y.items():
        if key == '__metadata' or not isinstance(p, dict): continue
        alias, loc = name_at(str(p.get('resolution') or ''))
        name = aliased(alias, loc, None)
        if loc.startswith('workspace:'):
            decls += manifest_decls(p, loc[len('workspace:'):]); continue
        if loc.startswith('npm:') or loc.startswith('patch:'): kind = 'registry'
        elif re.match(r'^https?:', loc): kind = source_kind(loc)
        elif re.match(r'^(git|github|gitlab|bitbucket)', loc) or re.search(r'\.git#', loc): kind = 'git'
        elif re.match(r'^(file|portal|link|exec):', loc): kind = 'link'
        else: kind = 'other'
        nodes.append(Node(name, str(p.get('version') if p.get('version') is not None else ''), kind))
    return {'manager': 'yarn-berry', 'version': str(meta.get('version', '')), 'nodes': nodes, 'decls': decls, 'links': []}


def parse_pnpm(text):
    y = yaml_load(text)
    v = str(y.get('lockfileVersion', ''))
    nodes, decls = [], []
    importers = y.get('importers') if isinstance(y.get('importers'), dict) else {'.': y}
    for path, imp in importers.items():
        if not isinstance(imp, dict): continue
        for f in FIELDS:
            d = imp.get(f)
            if isinstance(d, dict):
                for n, val in d.items():
                    spec = (val.get('specifier') or '') if isinstance(val, dict) else (val if val is not None else '')
                    decls.append((n, str(spec), f, path))
    major = int(re.match(r'\d*', v).group() or 0)
    for key, p in (y.get('packages') or {}).items():
        p = p if isinstance(p, dict) else {}
        k = re.sub(r'\(.*$', '', key.lstrip('/'))
        if major >= 6: name, ver = name_at(k)
        else:
            i = k.rfind('/'); name, ver = k[:i], k[i + 1:]
        r = p.get('resolution') if isinstance(p.get('resolution'), dict) else {}
        if r.get('tarball'): kind = source_kind(r['tarball'])
        elif r.get('type') == 'git': kind = 'git'
        elif r.get('type') == 'directory' or str(p.get('version') or '').startswith('link:'): kind = 'link'
        else: kind = 'registry'
        nodes.append(Node(p.get('name') or name, str(p.get('version') or ver), kind))
    return {'manager': 'pnpm', 'version': v, 'nodes': nodes, 'decls': decls, 'links': []}


def parse_bun(text):
    j = json.loads(re.sub(r',(\s*[}\]])', r'\1', text))
    nodes, decls = [], []
    for path, w in (j.get('workspaces') or {}).items():
        decls += manifest_decls(w, path or '.')
    for key, entry in (j.get('packages') or {}).items():
        if not isinstance(entry, list): continue
        alias, loc = name_at(str(entry[0]))
        name = aliased(alias, loc, None)
        ver = loc
        if re.match(r'^(github|git\+|git:|gitlab|bitbucket)', loc): kind, ver = 'git', ''
        elif re.match(r'^https?:', loc): kind, ver = source_kind(loc), ''
        elif re.match(r'^(file|link|workspace):', loc): kind, ver = 'link', ''
        else:
            kind = 'registry'
            if loc.startswith('npm:'): ver = re.sub(r'^npm:.*@', '', loc)
        nodes.append(Node(name, ver, kind))
    return {'manager': 'bun', 'version': str(j.get('lockfileVersion', '')), 'nodes': nodes, 'decls': decls, 'links': []}


def parse(filename, text):
    base = os.path.basename(filename)
    if base in ('package-lock.json', 'npm-shrinkwrap.json'): return parse_package_lock(text)
    if base == 'pnpm-lock.yaml': return parse_pnpm(text)
    if base == 'bun.lock': return parse_bun(text)
    if base == 'yarn.lock':
        return parse_berry(text) if re.search(r'^__metadata:', text, re.M) else parse_yarn_v1(text)
    raise ValueError(f'unknown lockfile {filename}')


# ---- one project

AUTOMATION = re.compile(r'bot$|^bot-|-bot-|robot|automation|^types$|release-?bot|^npm$|^github actions$|\bci$|-ci$|^ci-|deploy|publisher$|^gha:', re.I)
FRAMEWORKS = [('next', r'^next$'), ('nuxt', r'^nuxt$'), ('angular', r'^@angular/core$'), ('sveltekit', r'^@sveltejs/kit$'),
              ('svelte', r'^svelte$'), ('remix', r'^@remix-run/react$'), ('astro', r'^astro$'), ('gatsby', r'^gatsby$'),
              ('vue', r'^vue$'), ('react', r'^react$'), ('nest', r'^@nestjs/core$'), ('express', r'^express$'),
              ('fastify', r'^fastify$'), ('hono', r'^hono$'), ('koa', r'^koa$'), ('electron', r'^electron$'),
              ('react-native', r'^react-native$'), ('vite-only', r'^vite$'), ('webpack-only', r'^webpack$'),
              ('typescript-only', r'^typescript$')]


def declared_sets(lock, manifest_decls_list):
    decls = lock['decls'] if lock['decls'] is not None else manifest_decls_list
    own = set(lock['links']) | {n.name for n in lock['nodes'] if n.kind == 'link'}
    direct = set()
    for name, spec, field, _ in decls:
        if field == 'peerDependencies': continue
        if name in own or re.match(r'^(workspace|file|link|portal):', spec): continue
        direct.add(name)
    return direct, decls


def cell(lock, decls_from_manifests, reg):
    direct, decls = declared_sets(lock, decls_from_manifests)
    first_kind, any_registry, other = {}, set(), collections.Counter()
    for n in lock['nodes']:
        if n.kind == 'link': continue
        k = (n.name, n.version)
        first_kind.setdefault(k, n.kind)
        if n.kind == 'registry': any_registry.add(k)
    for k, kind in first_kind.items():
        if k not in any_registry: other[kind] += 1

    def join(pairs):
        pubs, kinds = {}, {}
        ok = missing = error = unknown = 0
        for name, ver in sorted(pairs):
            r = reg.get(f'{name}@{ver}')
            if r is None: error += 1; continue
            if r['status'] == 'missing': missing += 1; continue
            if r['status'] != 'ok': error += 1; continue
            ok += 1
            who = r.get('publisher')
            if not who: unknown += 1; continue
            pubs[who] = pubs.get(who, False) or name in direct
            kinds[who] = r.get('publisherKind') or 'unknown'
        return pubs, kinds, ok, missing, error, unknown

    # instruction-gap's rules: a pair's kind is the one it was first seen with
    ig_reg = [k for k, kind in first_kind.items() if kind == 'registry']
    pubs, kinds, ok, missing, error, unknown = join(ig_reg)
    ig = {'direct': len(direct), 'resolvedVersions': len(first_kind), 'registryVersions': ok + missing + error,
          'publishers': len(pubs), 'behindDirect': sum(pubs.values())}
    # crates' rules
    pubs, kinds, ok, missing, error, unknown = join(any_registry)
    cluster = next((c for c, rx in FRAMEWORKS if any(re.search(rx, d) for d in direct)), 'none')
    cr = {'declared': len(direct), 'resolved': len(any_registry), 'otherSources': dict(sorted(other.items())),
          'lookup': {'ok': ok, 'missing': missing, 'error': error, 'unknownPublisher': unknown},
          'publishers': {'total': len(pubs), 'users': sum(1 for k in kinds.values() if k == 'user'),
                         'trustedPublishing': sum(1 for k in kinds.values() if k == 'trusted-publishing'),
                         'automation': sum(1 for p in pubs if AUTOMATION.search(p) or kinds[p] == 'trusted-publishing'),
                         'behindDeclared': sum(pubs.values()), 'ids': sorted(pubs)},
          'cluster': cluster}
    return ig, cr


# ---- crates' statistics (ecosystems/crates/src/report.py)

def q(v, f):
    if not v: return 0.0
    s = sorted(v); x = f * (len(s) - 1); i = int(x)
    return float(s[i] if i + 1 >= len(s) else s[i] + (s[i + 1] - s[i]) * (x - i))


def wilson(k, n):
    z = 1.959964; p = k / n
    den = 1 + z * z / n; c = p + z * z / (2 * n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return {'k': k, 'n': n, 'p': 100 * p, 'lo': 100 * (c - h) / den, 'hi': 100 * (c + h) / den}


def icc(vals, clusters):
    g = collections.defaultdict(list)
    for v, c in zip(vals, clusters): g[c].append(v)
    n = sum(len(v) for v in g.values()); G = len(g)
    if G < 2 or n <= G: return 0.0
    grand = sum(sum(v) for v in g.values()) / n
    msb = sum(len(v) * (sum(v) / len(v) - grand) ** 2 for v in g.values()) / (G - 1)
    msw = sum(sum((x - sum(v) / len(v)) ** 2 for x in v) for v in g.values()) / (n - G)
    k = (n - sum(len(v) ** 2 for v in g.values()) / n) / (G - 1)
    den = msb + (k - 1) * msw
    return max(0.0, (msb - msw) / den) if den else 0.0


def deff(vals, clusters):
    n = len(vals); mean = sum(vals) / n
    iid = sum((v - mean) ** 2 for v in vals) / (n * (n - 1))
    g = collections.defaultdict(list)
    for v, c in zip(vals, clusters): g[c].append(v)
    G = len(g)
    cl = sum((sum(v - mean for v in vs)) ** 2 for vs in g.values()) * G / ((G - 1) * n * n)
    return mean, (cl / iid if iid else 1.0)


def figures(ig_cells, cr_cells):
    out = {}
    stat = lambda v: {'median': q(v, .5), 'q25': q(v, .25), 'q75': q(v, .75)}
    share = lambda v: {'median': q(v, .5), 'p10': q(v, .1), 'p90': q(v, .9), 'n': len(v)}
    out['ig'] = {'cells': len(ig_cells),
                 'direct': stat([c['direct'] for c in ig_cells]),
                 'resolvedVersions': stat([c['resolvedVersions'] for c in ig_cells]),
                 'publishers': stat([c['publishers'] for c in ig_cells]),
                 'behindDirect': stat([c['behindDirect'] for c in ig_cells]),
                 'neverNamed': share([100 * (c['publishers'] - c['behindDirect']) / c['publishers'] for c in ig_cells if c['publishers']])}
    cs = cr_cells
    pub = [c['publishers']['total'] for c in cs]
    cl = [c['cluster'] for c in cs]
    big = [k for k, _ in collections.Counter(cl).most_common(5)]
    loo = [deff([float(x) for x, c in zip(pub, cl) if c != k], [c for c in cl if c != k])[1] for k in big]
    sets = [set(c['publishers']['ids']) for c in cs]
    same, diff = [], []
    for i, j in itertools.combinations(range(len(cs)), 2):
        u = len(sets[i] | sets[j])
        if u: (same if cl[i] == cl[j] else diff).append(len(sets[i] & sets[j]) / u)
    mean_pub, d = deff([float(x) for x in pub], cl)
    by = collections.defaultdict(list)
    for c in cs: by[c['cluster']].append(c)
    other = collections.Counter()
    for c in cs: other.update(c['otherSources'])
    out['crates'] = {
        'cells': len(cs),
        'declared': stat([c['declared'] for c in cs]),
        'resolved': stat([c['resolved'] for c in cs]),
        'publishers': stat(pub),
        'users': stat([c['publishers']['users'] for c in cs]),
        'trustedPublishing': stat([c['publishers']['trustedPublishing'] for c in cs]),
        'withoutAutomation': stat([c['publishers']['total'] - c['publishers']['automation'] for c in cs]),
        'behindDeclared': stat([c['publishers']['behindDeclared'] for c in cs]),
        'neverNamed': share([100 * (c['publishers']['total'] - c['publishers']['behindDeclared']) / c['publishers']['total'] for c in cs if c['publishers']['total']]),
        'projectsWithTrustedPublishing': wilson(sum(1 for c in cs if c['publishers']['trustedPublishing'] > 0), len(cs)),
        'versions': {'resolved': sum(c['resolved'] for c in cs), 'unknownPublisher': sum(c['lookup']['unknownPublisher'] for c in cs),
                     'missing': sum(c['lookup']['missing'] for c in cs), 'error': sum(c['lookup']['error'] for c in cs)},
        'otherSources': dict(sorted(other.items())),
        'noRegistryDependency': sum(1 for c in cs if c['resolved'] == 0),
        'design': {'clusters': len(by), 'jaccardWithin': sum(same) / len(same) if same else 0.0,
                   'jaccardAcross': sum(diff) / len(diff) if diff else 0.0,
                   'icc': icc([float(x) for x in pub], cl), 'deff': d, 'meanPublishers': mean_pub,
                   'deffLeaveOneOut': [min(loo), max(loo)]},
        'byCluster': [{'cluster': k, 'n': len(v), 'declared': q([c['declared'] for c in v], .5),
                       'publishers': q([c['publishers']['total'] for c in v], .5),
                       'neverNamed': q([100 * (c['publishers']['total'] - c['publishers']['behindDeclared']) / c['publishers']['total'] for c in v if c['publishers']['total']], .5)}
                      for k, v in sorted(by.items(), key=lambda kv: (-len(kv[1]), kv[0]))],
    }
    return out


def read_manifests(d, row):
    out = []
    for rel in ['package.json'] + [os.path.join('ws', p) for p in (row.get('workspaceManifests') or [])]:
        try:
            out += manifest_decls(json.load(open(os.path.join(d, rel), encoding='utf-8')), rel)
        except (OSError, ValueError):
            continue
    return out


def main():
    if sys.argv[1] == '--controls':
        cdir = sys.argv[2]
        for rel in sorted(json.load(open(os.path.join(cdir, 'expected.json')))):
            lock = parse(rel, open(os.path.join(cdir, rel), encoding='utf-8').read())
            man = read_manifests(os.path.dirname(os.path.join(cdir, rel)), {})
            direct, _ = declared_sets(lock, man)
            first = {}
            reg = set()
            for n in lock['nodes']:
                if n.kind == 'link': continue
                first.setdefault((n.name, n.version), n.kind)
                if n.kind == 'registry': reg.add((n.name, n.version))
            other = collections.Counter(k for p, k in first.items() if p not in reg)
            print(json.dumps({rel: {'declared': sorted(direct), 'registry': sorted(f'{a}@{b}' for a, b in reg),
                                    'other': dict(sorted(other.items()))}}, sort_keys=True))
        return
    store, popf, regf, outdir = sys.argv[1:5]
    reg = {}
    with gzip.open(regf, 'rt', encoding='utf-8') as f:
        for l in f:
            if l.strip():
                r = json.loads(l); reg[f"{r['name']}@{r['version']}"] = r
    pop = [json.loads(l) for l in open(popf, encoding='utf-8') if l.strip()]
    ig_cells, cr_cells = [], []
    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, 'cells-b.ndjson'), 'w', encoding='utf-8') as out:
        for row in pop:
            if row['status'] != 'ok': continue
            d = os.path.join(store, row['fullName'].replace('/', '__'))
            lock = parse(row['lockfile'], open(os.path.join(d, row['lockfile']), encoding='utf-8').read())
            man = read_manifests(d, row) if lock['decls'] is None else []
            ig, cr = cell(lock, man, reg)
            ig_cells.append(ig); cr_cells.append(cr)
            out.write(json.dumps({'fullName': row['fullName'], 'manager': lock['manager'], 'lockfileVersion': lock['version'],
                                  'ig': ig, 'crates': cr}, sort_keys=True) + '\n')
    json.dump(figures(ig_cells, cr_cells), open(os.path.join(outdir, 'figures-b.json'), 'w'), indent=1, sort_keys=True)
    print(f'{len(cr_cells)} cells', file=sys.stderr)


if __name__ == '__main__':
    main()
