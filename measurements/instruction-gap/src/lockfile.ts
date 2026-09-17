// Read a lockfile into one flat list of resolved nodes, whatever the manager.
//
// Supported: package-lock.json / npm-shrinkwrap.json (v1, v2, v3), yarn.lock
// (v1 and Berry), pnpm-lock.yaml (v5, v6, v9), bun.lock (text). Each node is a
// resolved package (name, version) with where it comes from: the registry, a
// tarball URL, a git URL, a workspace link or a local path. Nothing is
// installed; the file is read as the manager would read it.
//
// The direct dependencies come from the manifests the lockfile embeds (npm,
// pnpm, Berry, bun record every workspace's declarations) or, for yarn v1,
// from the package.json files passed in by the caller.

import { parseAllDocuments } from 'yaml';

// A lockfile may hold more than one YAML document (pnpm 12 writes its own
// package-manager block first); later documents override earlier keys.
function parseYaml(text: string): Record<string, any> {
  const out: Record<string, any> = {};
  for (const d of parseAllDocuments(text, { maxAliasCount: -1 })) {
    const j = d.toJS();
    if (j && typeof j === 'object') Object.assign(out, j);
  }
  return out;
}

// The name of a package is everything before the first '@' that is not a scope marker.
function splitAt(key: string): [string, string] {
  const i = key.indexOf('@', 1);
  return i > 0 ? [key.slice(0, i), key.slice(i + 1)] : [key, ''];
}

// An alias (`alias@npm:real@range`) installs the real package under another
// name; the registry tarball path or the `npm:` locator names the real one.
function realName(name: string, spec: string, resolved: string | null): string {
  const m = resolved?.match(/\/((?:@[^/]+\/)?[^/@]+)\/-\/[^/]+\.tgz/);
  if (m) return m[1];
  if (spec.startsWith('npm:')) { const rest = spec.slice(4); const i = rest.indexOf('@', 1); if (i > 0) return rest.slice(0, i); }
  return name;
}

export type Kind = 'registry' | 'tarball' | 'git' | 'link' | 'file' | 'other';

export interface Node {
  name: string;
  version: string;
  kind: Kind;
  resolved: string | null;   // URL when the lockfile records one
  host: string | null;       // host of `resolved`, or 'registry' when the manager resolves against its configured registry
  integrity: string | null;
  dev: boolean | null;       // npm lockfiles record it; the others do not
  optional: boolean | null;
  hasInstallScript: boolean | null; // npm v2+ records it; used as a cross-check, not as the source
}

export interface Declared { name: string; spec: string; field: 'dependencies' | 'devDependencies' | 'optionalDependencies' | 'peerDependencies'; where: string }

export interface Lock {
  manager: 'npm' | 'yarn' | 'yarn-berry' | 'pnpm' | 'bun';
  lockfileVersion: string;
  nodes: Node[];
  declared: Declared[] | null; // null when the lockfile does not embed manifests (yarn v1)
  workspaces: string[];        // workspace paths the lockfile knows about
}

const FIELDS: Declared['field'][] = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];

function hostOf(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/^(?:git\+)?(?:[a-z]+):\/\/(?:[^@/]+@)?([^/:]+)/i);
  if (m) return m[1].toLowerCase();
  const s = url.match(/^git@([^:]+):/);
  return s ? s[1].toLowerCase() : null;
}

function kindOf(resolved: string | null, spec?: string): Kind {
  const s = resolved || spec || '';
  if (/^git\+|^git:|^git@|\.git(#|$)|#commit=|github\.com\/[^/]+\/[^/]+\/tar\.gz|codeload\.github\.com|#[0-9a-f]{7,40}$/i.test(s) && !/\/-\//.test(s)) return 'git';
  if (/^(github|gitlab|bitbucket|gist):/.test(s)) return 'git';
  if (/^file:|^link:|^portal:|^workspace:/.test(s)) return 'link';
  if (/^https?:\/\//.test(s)) return /\/-\/[^/]+\.tgz(\?|$)|registry\.npmjs\.org|registry\.yarnpkg\.com|registry\.npmmirror\.com/.test(s) ? 'registry' : 'tarball';
  return 'registry';
}

function declaredFrom(manifest: any, where: string): Declared[] {
  const out: Declared[] = [];
  for (const f of FIELDS) {
    const m = manifest?.[f];
    if (m && typeof m === 'object') for (const [name, spec] of Object.entries(m)) out.push({ name, spec: String(spec), field: f, where });
  }
  return out;
}

// ---- npm ------------------------------------------------------------------

function parseNpm(text: string): Lock {
  const j = JSON.parse(text);
  const v = String(j.lockfileVersion ?? 1);
  const nodes: Node[] = [];
  const declared: Declared[] = [];
  const workspaces: string[] = [];
  if (j.packages) {
    for (const [path, p] of Object.entries<any>(j.packages)) {
      if (path === '' || !path.includes('node_modules/')) {
        // the root and workspace manifests
        if (path === '') workspaces.push('.'); else workspaces.push(path);
        declared.push(...declaredFrom(p, path || '.'));
        continue;
      }
      if (p.link) continue; // a symlink to a workspace package
      const name = p.name || path.replace(/^.*node_modules\//, '');
      const resolved = p.resolved ?? null;
      const kind = p.resolved ? kindOf(resolved) : (p.version && /^(file|link):/.test(p.version) ? 'link' : (resolved === null && p.version ? 'registry' : 'other'));
      nodes.push({
        name, version: String(p.version ?? ''), kind, resolved,
        host: resolved ? hostOf(resolved) : (kind === 'registry' ? 'registry' : null),
        integrity: p.integrity ?? null, dev: !!p.dev || null, optional: !!p.optional || null,
        hasInstallScript: p.hasInstallScript === true ? true : (p.hasInstallScript === false ? false : null),
      });
    }
    return { manager: 'npm', lockfileVersion: v, nodes, declared, workspaces };
  }
  // v1: nested `dependencies` trees, no manifests
  const walk = (deps: any) => {
    for (const [name, p] of Object.entries<any>(deps || {})) {
      const resolved = p.resolved ?? null;
      const kind = resolved ? kindOf(resolved) : (/^(file|link):/.test(String(p.version)) ? 'link' : 'registry');
      nodes.push({ name, version: String(p.version ?? ''), kind, resolved, host: resolved ? hostOf(resolved) : (kind === 'registry' ? 'registry' : null), integrity: p.integrity ?? null, dev: !!p.dev || null, optional: !!p.optional || null, hasInstallScript: null });
      if (p.dependencies) walk(p.dependencies);
    }
  };
  walk(j.dependencies);
  return { manager: 'npm', lockfileVersion: v, nodes, declared: null, workspaces: ['.'] };
}

// ---- yarn v1 --------------------------------------------------------------

function parseYarnV1(text: string): Lock {
  const nodes: Node[] = [];
  const lines = text.split('\n');
  let cur: { keys: string[]; version?: string; resolved?: string; integrity?: string } | null = null;
  const flush = () => {
    if (!cur || !cur.version) { cur = null; return; }
    const [alias, spec] = splitAt(cur.keys[0]);
    const resolved = cur.resolved ? cur.resolved.replace(/#[0-9a-f]{40}$/, '') : null;
    const kind = kindOf(resolved, spec);
    const name = realName(alias, spec, resolved);
    nodes.push({ name, version: cur.version, kind, resolved, host: resolved ? hostOf(resolved) : (kind === 'registry' ? 'registry' : null), integrity: cur.integrity ?? null, dev: null, optional: null, hasInstallScript: null });
    cur = null;
  };
  for (const raw of lines) {
    if (!raw.trim() || raw.startsWith('#')) continue;
    if (!raw.startsWith(' ')) {
      flush();
      const keys = raw.replace(/:\s*$/, '').split(/,\s*/).map(k => k.replace(/^"|"$/g, ''));
      cur = { keys };
      continue;
    }
    if (!cur) continue;
    const m = raw.match(/^  (version|resolved|integrity) "?([^"]*)"?\s*$/);
    if (m) (cur as any)[m[1]] = m[2];
  }
  flush();
  return { manager: 'yarn', lockfileVersion: '1', nodes, declared: null, workspaces: ['.'] };
}

// ---- yarn Berry -----------------------------------------------------------

function parseBerry(text: string): Lock {
  const y = parseYaml(text);
  const nodes: Node[] = [];
  const declared: Declared[] = [];
  const workspaces: string[] = [];
  const meta = y.__metadata || {};
  for (const [key, p] of Object.entries<any>(y)) {
    if (key === '__metadata' || !p || typeof p !== 'object') continue;
    const res: string = String(p.resolution || '');
    const [alias, locator] = splitAt(res);
    const name = realName(alias, locator, null);
    if (locator.startsWith('workspace:')) {
      workspaces.push(locator.slice('workspace:'.length));
      declared.push(...declaredFrom(p, locator.slice('workspace:'.length)));
      continue;
    }
    let kind: Kind = 'registry'; let resolved: string | null = null; let host: string | null = 'registry';
    if (locator.startsWith('npm:')) { kind = 'registry'; }
    else if (/^https?:/.test(locator)) { resolved = locator; kind = kindOf(locator); host = hostOf(locator); }
    else if (/^(git|github|gitlab|bitbucket)/.test(locator) || /\.git#/.test(locator)) { resolved = locator; kind = 'git'; host = hostOf(locator) || 'github.com'; }
    else if (/^(file|portal|link|exec):/.test(locator)) { kind = 'link'; host = null; }
    else if (locator.startsWith('patch:')) { kind = 'registry'; host = 'registry'; } // a patched registry package
    else { kind = 'other'; host = null; }
    nodes.push({ name, version: String(p.version ?? ''), kind, resolved, host, integrity: p.checksum ? String(p.checksum) : null, dev: null, optional: null, hasInstallScript: null });
  }
  return { manager: 'yarn-berry', lockfileVersion: String(meta.version ?? ''), nodes, declared, workspaces };
}

// ---- pnpm -----------------------------------------------------------------

function parsePnpm(text: string): Lock {
  const y = parseYaml(text);
  const v = String(y.lockfileVersion ?? '');
  const nodes: Node[] = [];
  const declared: Declared[] = [];
  const workspaces: string[] = [];
  const importers = y.importers || { '.': y };
  for (const [path, imp] of Object.entries<any>(importers)) {
    workspaces.push(path);
    for (const f of FIELDS) {
      const m = imp?.[f];
      if (m && typeof m === 'object') for (const [name, val] of Object.entries<any>(m)) declared.push({ name, spec: typeof val === 'object' && val ? String(val.specifier ?? '') : String(val), field: f, where: path });
    }
  }
  for (const [key, p] of Object.entries<any>(y.packages || {})) {
    // v9: 'name@1.2.3' or 'name@1.2.3(peer@x)'; v6: '/name@1.2.3(...)'; v5: '/name/1.2.3'
    const k = key.replace(/^\//, '').replace(/\(.*$/, '');
    let name: string, version: string;
    if (Number(v.split('.')[0]) >= 6) [name, version] = splitAt(k);
    else { const i = k.lastIndexOf('/'); name = k.slice(0, i); version = k.slice(i + 1); }
    const r = p?.resolution || {};
    let kind: Kind = 'registry'; let resolved: string | null = null; let host: string | null = 'registry';
    if (r.tarball) { resolved = r.tarball; kind = kindOf(r.tarball); host = hostOf(r.tarball); }
    else if (r.type === 'git') { resolved = `${r.repo}#${r.commit}`; kind = 'git'; host = hostOf(r.repo); }
    else if (r.type === 'directory' || p?.version?.startsWith?.('link:')) { kind = 'link'; host = null; }
    nodes.push({ name: p?.name || name, version: p?.version || version, kind, resolved, host, integrity: r.integrity ?? null, dev: p?.dev === true ? true : null, optional: p?.optional === true ? true : null, hasInstallScript: p?.requiresBuild === true ? true : null });
  }
  return { manager: 'pnpm', lockfileVersion: v, nodes, declared, workspaces };
}

// ---- bun ------------------------------------------------------------------

function parseBun(text: string): Lock {
  // bun.lock is JSON with trailing commas
  const j = JSON.parse(text.replace(/,(\s*[}\]])/g, '$1'));
  const nodes: Node[] = [];
  const declared: Declared[] = [];
  const workspaces: string[] = [];
  for (const [path, w] of Object.entries<any>(j.workspaces || {})) { workspaces.push(path || '.'); declared.push(...declaredFrom(w, path || '.')); }
  for (const [key, entry] of Object.entries<any>(j.packages || {})) {
    if (!Array.isArray(entry)) continue;
    const spec: string = String(entry[0]);
    const [alias, locator] = splitAt(spec);
    const name = realName(alias, locator, null);
    let kind: Kind = 'registry'; let host: string | null = 'registry'; let resolved: string | null = null; let version = locator;
    if (/^(github|git\+|git:|gitlab|bitbucket)/.test(locator)) { kind = 'git'; resolved = locator; host = hostOf(locator) || 'github.com'; version = ''; }
    else if (/^https?:/.test(locator)) { kind = kindOf(locator); resolved = locator; host = hostOf(locator); version = ''; }
    else if (/^(file|link|workspace):/.test(locator)) { kind = 'link'; host = null; version = ''; }
    else if (/^npm:/.test(locator)) { version = locator.replace(/^npm:.*@/, ''); }
    const integrity = typeof entry[entry.length - 1] === 'string' && /^sha/.test(entry[entry.length - 1]) ? entry[entry.length - 1] : null;
    nodes.push({ name, version, kind, resolved, host, integrity, dev: null, optional: null, hasInstallScript: null });
  }
  return { manager: 'bun', lockfileVersion: String(j.lockfileVersion ?? ''), nodes, declared, workspaces };
}

export function parseLockfile(filename: string, text: string): Lock {
  if (/package-lock\.json$|npm-shrinkwrap\.json$/.test(filename)) return parseNpm(text);
  if (/pnpm-lock\.yaml$/.test(filename)) return parsePnpm(text);
  if (/bun\.lock$/.test(filename)) return parseBun(text);
  if (/yarn\.lock$/.test(filename)) return /^__metadata:/m.test(text) ? parseBerry(text) : parseYarnV1(text);
  throw new Error(`unknown lockfile ${filename}`);
}

/** A spec the developer wrote that leaves the manager no choice of version. */
export function isExactSpec(spec: string): boolean {
  const s = spec.replace(/^npm:.*@/, '');
  return /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/.test(s) || /#[0-9a-f]{40}$/.test(s) || /^https?:\/\//.test(s) && /\.tgz$/.test(s);
}
