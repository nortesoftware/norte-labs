// One cell per project: what the developer declared, what the lockfile
// resolves, who published it, who may publish it, what runs at install, and
// where it all comes from. Joins the lockfile (lockfile.ts) to the registry
// records (registry.ts). No network.
//
// Definitions used throughout the report:
//   direct      = distinct package names declared in dependencies,
//                 devDependencies or optionalDependencies of the root and of
//                 every workspace manifest the lockfile embeds (peers counted
//                 apart: managers differ on installing them)
//   resolved    = distinct (name, version) pairs the lockfile pins; a package
//                 present in two versions counts twice, a copy of the same
//                 version nested twice counts once
//   chosen      = resolved pairs whose version the developer fixed by an exact
//                 spec on a direct dependency; every other pair is a decision
//                 the manager made
//   publisher   = the npm account that published the resolved version, or the
//                 GitHub repository named by the provenance of a version
//                 published through trusted publishing
//   maintainer  = an account on the package's maintainer list at read time
//
// Usage: node compute.ts <population.ndjson> <store-dir> <registry.ndjson> <cells.ndjson>

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseLockfile, isExactSpec, type Declared, type Lock } from './lockfile.ts';
import type { VersionRecord } from './registry.ts';

const [popFile, store, regFile, out] = process.argv.slice(2, 6);

const FRAMEWORKS: Array<[string, RegExp]> = [
  ['next', /^next$/], ['nuxt', /^nuxt$/], ['angular', /^@angular\/core$/], ['sveltekit', /^@sveltejs\/kit$/], ['svelte', /^svelte$/],
  ['remix', /^@remix-run\/react$/], ['astro', /^astro$/], ['gatsby', /^gatsby$/], ['vue', /^vue$/], ['react', /^react$/],
  ['nest', /^@nestjs\/core$/], ['express', /^express$/], ['fastify', /^fastify$/], ['hono', /^hono$/], ['koa', /^koa$/],
  ['electron', /^electron$/], ['react-native', /^react-native$/], ['vite-only', /^vite$/], ['webpack-only', /^webpack$/], ['typescript-only', /^typescript$/],
];

// Accounts whose name says they are automation rather than a person; the list is
// a heuristic and is published with the results.
export const AUTOMATION = /bot$|^bot-|-bot-|robot|automation|^types$|release-?bot|^npm$|^github actions$|\bci$|-ci$|^ci-|deploy|publisher$|^gha:/i;

export interface Cell {
  fullName: string; sha: string; stars: number; language: string; pushedAt: string;
  manager: string; lockfileVersion: string; workspaces: number;
  framework: string;
  declared: { direct: number; byField: Record<string, number>; peer: number; exact: number; specsTotal: number; source: 'lockfile' | 'manifests' };
  resolved: { nodes: number; versions: number; names: number; byKind: Record<string, number>; hosts: Record<string, number>; devOnlyVersions: number | null; duplicatedNames: number };
  lookup: { registryVersions: number; ok: number; missing: number; error: number; nonRegistry: number };
  decisions: { versionsByManager: number; namesNeverNamed: number };
  publishers: { total: number; users: number; trustedPublishing: number; automation: number; unknownVersions: number; behindDirect: number; notChosen: number; withInstallScript: number; ids: string[] };
  prod: { versions: number; publishers: number } | null; // npm lockfiles only: nodes not marked dev
  maintainers: { total: number; withInstallScript: number };
  install: { versions: number; names: number; direct: number; publishers: number; gypOnly: number };
  tarballHosts: Record<string, number>;
  provenance: { versionsWithAttestation: number };
  notes: string[];
}

function declaredFromManifests(dir: string, files: string[]): Declared[] {
  const out: Declared[] = [];
  for (const f of files) {
    let m: any = {};
    try { m = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { continue; }
    for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'] as const) {
      const d = m?.[field];
      if (d && typeof d === 'object') for (const [name, spec] of Object.entries(d)) out.push({ name, spec: String(spec), field, where: f });
    }
  }
  return out;
}

function main() {
  const reg = new Map<string, VersionRecord>();
  for (const l of readFileSync(regFile, 'utf8').split('\n')) if (l) { const r = JSON.parse(l); reg.set(`${r.name}@${r.version}`, r); }
  const pop = readFileSync(popFile, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).filter((r: any) => r.status === 'ok');
  const cells: Cell[] = [];
  for (const r of pop) {
    const dir = join(store, r.fullName.replace('/', '__'));
    let lock: Lock;
    try { lock = parseLockfile(r.lockfile, readFileSync(join(dir, r.lockfile), 'utf8')); } catch (e) { process.stderr.write(`${r.fullName}: ${String(e).split('\n')[0]}\n`); continue; }
    const notes: string[] = [];
    if (r.note) notes.push(r.note);
    // declared: from the lockfile when it embeds manifests, else from package.json + workspace manifests
    let declared = lock.declared;
    let source: Cell['declared']['source'] = 'lockfile';
    if (!declared) { declared = declaredFromManifests(dir, ['package.json', ...(r.workspaceManifests || []).map((p: string) => join('ws', p))]); source = 'manifests'; }
    const wsNames = new Set<string>();
    for (const n of lock.nodes) if (n.kind === 'link') wsNames.add(n.name);
    const byField: Record<string, number> = {};
    const directNames = new Set<string>();
    const exactNames = new Map<string, string>();
    let peer = 0, specsTotal = 0, exact = 0;
    for (const d of declared) {
      if (d.field === 'peerDependencies') { peer++; continue; }
      if (wsNames.has(d.name) || /^(workspace|file|link|portal):/.test(d.spec)) continue; // a workspace referencing a sibling
      byField[d.field] = (byField[d.field] || 0) + 1;
      directNames.add(d.name);
      specsTotal++;
      if (isExactSpec(d.spec)) { exact++; exactNames.set(d.name, d.spec.replace(/^npm:.*@/, '')); }
    }
    // resolved
    const versions = new Map<string, typeof lock.nodes[0]>();
    const names = new Map<string, Set<string>>();
    const byKind: Record<string, number> = {};
    const hosts: Record<string, number> = {};
    let devOnly = 0; let devKnown = false;
    for (const n of lock.nodes) {
      if (n.kind === 'link') continue;
      const k = `${n.name}@${n.version}`;
      if (!versions.has(k)) {
        versions.set(k, n);
        byKind[n.kind] = (byKind[n.kind] || 0) + 1;
        const h = n.host || 'none';
        hosts[h] = (hosts[h] || 0) + 1;
        if (!names.has(n.name)) names.set(n.name, new Set());
        names.get(n.name)!.add(n.version);
        if (n.dev !== null) devKnown = true;
        if (n.dev) devOnly++;
      }
    }
    const duplicatedNames = [...names.values()].filter(s => s.size > 1).length;
    // registry join
    let ok = 0, missing = 0, error = 0, nonRegistry = 0, attest = 0;
    const pubs = new Map<string, { kind: string; direct: boolean; install: boolean }>();
    const maint = new Map<string, boolean>();
    let unknownVersions = 0;
    const installVersions = new Set<string>(); const installNames = new Set<string>(); let installDirect = 0; let gypOnly = 0;
    const tarballHosts: Record<string, number> = {};
    const prodPubs = new Set<string>(); let prodVersions = 0;
    for (const [k, n] of versions) {
      if (n.kind !== 'registry') { nonRegistry++; continue; }
      const v = reg.get(k);
      if (!v) { error++; continue; }
      if (v.status === 'missing') { missing++; continue; }
      if (v.status !== 'ok') { error++; continue; }
      ok++;
      if (devKnown && !n.dev) { prodVersions++; if (v.publisher) prodPubs.add(v.publisher); }
      if (v.provenance?.present) attest++;
      if (v.tarballHost) tarballHosts[v.tarballHost] = (tarballHosts[v.tarballHost] || 0) + 1;
      const isDirect = directNames.has(n.name);
      if (v.hasInstallScript) {
        installVersions.add(k); installNames.add(n.name); if (isDirect) installDirect++;
        if (!v.install.preinstall && !v.install.install && !v.install.postinstall && v.gypfile) gypOnly++;
      }
      if (v.publisher) {
        const p = pubs.get(v.publisher) || { kind: v.publisherKind || 'unknown', direct: false, install: false };
        if (isDirect) p.direct = true;
        if (v.hasInstallScript) p.install = true;
        pubs.set(v.publisher, p);
      } else unknownVersions++;
      for (const m of v.maintainers) maint.set(m, (maint.get(m) || false) || !!v.hasInstallScript);
    }
    // decisions: every resolved version except those the developer pinned exactly and that resolved to that version
    let chosen = 0;
    for (const [name, spec] of exactNames) if (versions.has(`${name}@${spec}`)) chosen++;
    // the framework cluster: the first match in production dependencies, else in any declared field
    const prodNames = new Set(declared.filter(d => d.field === 'dependencies').map(d => d.name));
    const framework = FRAMEWORKS.find(([, re]) => [...prodNames].some(n => re.test(n)))?.[0]
      ?? FRAMEWORKS.find(([, re]) => [...directNames].some(n => re.test(n)))?.[0] ?? 'none';
    const pubList = [...pubs.entries()];
    cells.push({
      fullName: r.fullName, sha: r.sha, stars: r.stars, language: r.language, pushedAt: r.pushedAt,
      manager: lock.manager, lockfileVersion: lock.lockfileVersion, workspaces: lock.workspaces.length,
      framework,
      declared: { direct: directNames.size, byField, peer, exact, specsTotal, source },
      resolved: { nodes: lock.nodes.length, versions: versions.size, names: names.size, byKind, hosts, devOnlyVersions: devKnown ? devOnly : null, duplicatedNames },
      lookup: { registryVersions: ok + missing + error, ok, missing, error, nonRegistry },
      decisions: { versionsByManager: versions.size - chosen, namesNeverNamed: [...names.keys()].filter(n => !directNames.has(n)).length },
      publishers: {
        total: pubs.size, users: pubList.filter(([, p]) => p.kind === 'user').length, trustedPublishing: pubList.filter(([, p]) => p.kind === 'trusted-publishing').length,
        automation: pubList.filter(([id]) => AUTOMATION.test(id)).length,
        unknownVersions, behindDirect: pubList.filter(([, p]) => p.direct).length, notChosen: pubList.filter(([, p]) => !p.direct).length,
        withInstallScript: pubList.filter(([, p]) => p.install).length, ids: pubList.map(([id]) => id).sort(),
      },
      prod: devKnown ? { versions: prodVersions, publishers: prodPubs.size } : null,
      maintainers: { total: maint.size, withInstallScript: [...maint.values()].filter(Boolean).length },
      install: { versions: installVersions.size, names: installNames.size, direct: installDirect, publishers: pubList.filter(([, p]) => p.install).length, gypOnly },
      tarballHosts,
      provenance: { versionsWithAttestation: attest },
      notes,
    });
  }
  writeFileSync(out, cells.map(c => JSON.stringify(c)).join('\n') + '\n');
  process.stderr.write(`${cells.length} cells → ${out}\n`);
}

main();
