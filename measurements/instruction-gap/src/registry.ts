// For every registry package a sampled lockfile resolves, read the version's
// manifest from the npm registry: who published it (`_npmUser`), who may
// publish it (`maintainers`), whether it runs code at install (`scripts`), and
// where its tarball lives. Versions published through trusted publishing carry
// "GitHub Actions" as the user; for those the provenance attestation names the
// repository and workflow that did the publishing, and that pair is the
// publisher. One small request per (name, version), cached on disk; nothing is
// installed.
//
// Usage: node registry.ts <population.ndjson> <store-dir> <cache-dir> <out.ndjson> [--concurrency 12]

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseLockfile } from './lockfile.ts';

const [popFile, store, cache, out] = process.argv.slice(2, 6);
const argv = process.argv.slice(6);
const opt = (k: string, d: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const CONC = Number(opt('--concurrency', '12'));
const REG = 'https://registry.npmjs.org';

export interface VersionRecord {
  name: string; version: string;
  status: 'ok' | 'missing' | 'error';
  publisher: string | null;          // npm account that published, or 'gha:<owner>/<repo>' for trusted publishing
  publisherKind: 'user' | 'trusted-publishing' | 'unknown' | null;
  publishedAt: string | null;        // not in the version document; left null (the packument has it, not fetched)
  maintainers: string[];             // accounts that may publish, at read time
  install: { preinstall: boolean; install: boolean; postinstall: boolean };
  hasInstallScript: boolean;
  tarballHost: string | null;
  provenance: { present: boolean; repository: string | null; workflow: string | null } | null;
  repositorySource: 'attestation' | 'manifest' | null; // where a trusted-publishing identity came from
  deprecated: boolean;
  gypfile: boolean;                  // native build declared (node-gyp runs at install without a script)
  binary: boolean;                   // `binary` field (node-pre-gyp / prebuild download at install)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function get(url: string): Promise<{ status: number; text: string }> {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'norte-labs instruction-gap (lockfile reader)' } });
      if (r.status === 429 || r.status >= 500) { if (attempt < 6) { await sleep(2000 * (attempt + 1)); continue; } }
      return { status: r.status, text: await r.text() };
    } catch (e) {
      if (attempt < 6) { await sleep(2000 * (attempt + 1)); continue; }
      return { status: 0, text: String(e) };
    }
  }
}

function cachePath(name: string, version: string, kind: 'v' | 'a'): string {
  const safe = name.replace('/', '__');
  return join(cache, kind, safe, `${version}.json`);
}

async function cached(url: string, path: string): Promise<{ status: number; body: any }> {
  if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8'));
  const r = await get(url);
  let body: any = null;
  try { body = JSON.parse(r.text); } catch { body = null; }
  const rec = { status: r.status, body };
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, JSON.stringify(rec));
  return rec;
}

function provenanceRepo(bundle: any): { repository: string | null; workflow: string | null } {
  try {
    for (const a of bundle.attestations || []) {
      if (!/slsa\.dev\/provenance/.test(a.predicateType)) continue;
      const payload = JSON.parse(Buffer.from(a.bundle.dsseEnvelope.payload, 'base64').toString('utf8'));
      const ep = payload.predicate?.buildDefinition?.externalParameters?.workflow;
      if (ep) return { repository: ep.repository ?? null, workflow: ep.path ?? null };
      const inv = payload.predicate?.invocation?.configSource; // SLSA v0.2 shape
      if (inv) return { repository: (inv.uri || '').replace(/^git\+/, '').replace(/@.*$/, '') || null, workflow: inv.entryPoint ?? null };
    }
  } catch { /* unreadable bundle */ }
  return { repository: null, workflow: null };
}

async function readVersion(name: string, version: string): Promise<VersionRecord> {
  const rec: VersionRecord = { name, version, status: 'error', publisher: null, publisherKind: null, publishedAt: null, maintainers: [], install: { preinstall: false, install: false, postinstall: false }, hasInstallScript: false, tarballHost: null, provenance: null, repositorySource: null, deprecated: false, gypfile: false, binary: false };
  const v = await cached(`${REG}/${name.replace('/', '%2F')}/${encodeURIComponent(version)}`, cachePath(name, version, 'v'));
  if (v.status === 404) { rec.status = 'missing'; return rec; }
  if (v.status !== 200 || !v.body) return rec;
  const b = v.body;
  rec.status = 'ok';
  const user = b._npmUser?.name ?? null;
  rec.maintainers = (b.maintainers || []).map((m: any) => m?.name).filter(Boolean);
  const s = b.scripts || {};
  rec.install = { preinstall: !!s.preinstall, install: !!s.install, postinstall: !!s.postinstall };
  rec.gypfile = !!b.gypfile;
  rec.binary = !!b.binary;
  rec.hasInstallScript = rec.install.preinstall || rec.install.install || rec.install.postinstall || rec.gypfile;
  rec.tarballHost = (b.dist?.tarball || '').match(/^https?:\/\/([^/]+)/)?.[1] ?? null;
  rec.deprecated = typeof b.deprecated === 'string';
  const att = b.dist?.attestations;
  const trusted = b._npmUser?.trustedPublisher;
  if (user === 'GitHub Actions' || trusted || (att && user === null)) {
    const a = await cached(`${REG}/-/npm/v1/attestations/${name.replace('/', '%2F')}@${encodeURIComponent(version)}`, cachePath(name, version, 'a'));
    const p = a.status === 200 && a.body ? provenanceRepo(a.body) : { repository: null, workflow: null };
    rec.provenance = { present: a.status === 200, ...p };
    let repo = p.repository ? p.repository.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '') : null;
    // Trusted publishing without an attestation: the manifest's repository field
    // names the repository the publishing configuration is bound to; it is the
    // package's own claim, not a verified one, and is marked as such.
    if (!repo) {
      const r = b.repository; const url = typeof r === 'string' ? r : r?.url;
      const m = String(url || '').match(/github\.com[/:]([^/]+\/[^/#]+?)(?:\.git)?(?:[#/].*)?$/);
      if (m) { repo = m[1]; rec.repositorySource = 'manifest'; }
    } else rec.repositorySource = 'attestation';
    rec.publisher = repo ? `gha:${repo}` : null;
    rec.publisherKind = 'trusted-publishing';
  } else {
    rec.provenance = att ? { present: true, repository: null, workflow: null } : null;
    rec.publisher = user;
    rec.publisherKind = user ? 'user' : 'unknown';
  }
  return rec;
}

async function main() {
  const pop = readFileSync(popFile, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).filter((r: any) => r.status === 'ok');
  const want = new Map<string, [string, string]>();
  for (const r of pop) {
    const dir = join(store, r.fullName.replace('/', '__'));
    let lock;
    try { lock = parseLockfile(r.lockfile, readFileSync(join(dir, r.lockfile), 'utf8')); } catch (e) { process.stderr.write(`${r.fullName}: ${String(e).split('\n')[0]}\n`); continue; }
    for (const n of lock.nodes) if (n.kind === 'registry' && n.name && n.version && /^\d/.test(n.version)) want.set(`${n.name}@${n.version}`, [n.name, n.version]);
  }
  const done = new Set<string>();
  if (existsSync(out)) {
    for (const l of readFileSync(out, 'utf8').split('\n')) if (l) { const j = JSON.parse(l); done.add(`${j.name}@${j.version}`); }
  } else writeFileSync(out, '');
  const todo = [...want.entries()].filter(([k]) => !done.has(k));
  process.stderr.write(`${want.size} versions across ${pop.length} projects; ${todo.length} to read\n`);
  let i = 0;
  const worker = async () => {
    while (todo.length) {
      const [, [name, version]] = todo.shift()!;
      const rec = await readVersion(name, version);
      appendFileSync(out, JSON.stringify(rec) + '\n');
      if (++i % 500 === 0) process.stderr.write(`${i} read\n`);
    }
  };
  await Promise.all(Array.from({ length: CONC }, worker));
  process.stderr.write(`done: ${i} read\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
