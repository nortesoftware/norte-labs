// Draw the sample from the frame and fetch what each project declares and
// resolves, pinned to one commit.
//
// The frame (frame.ts) is ordered by sha256(seed + fullName) — a simple random
// order anyone can reproduce from the frame file — and the first N candidates
// are taken. For each candidate: the default branch's head commit is read and
// pinned; the root listing tells whether the project has a package.json and
// which lockfiles it commits; the manifest, the lockfile and, for yarn v1
// monorepos, the workspace manifests are downloaded at that commit. Nothing is
// installed. Candidates without a lockfile stay in the population file with the
// reason, because the share of projects that commit one is itself a figure.
//
// Usage: node sample.ts <frame.ndjson> <population.ndjson> <store-dir> [--seed S] [--n N]
//
// Needs `gh` authenticated (core API: 5,000 requests/h; three per candidate).

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const [frameFile, popFile, store] = process.argv.slice(2, 5);
const argv = process.argv.slice(5);
const opt = (k: string, d: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const seed = opt('--seed', 'norte-labs instruction-gap 2026-09-17');
const N = Number(opt('--n', '1200'));

const LOCKFILES = ['package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lock', 'bun.lockb'];

export interface PopRow {
  fullName: string; language: string; stars: number; pushedAt: string; createdAt: string; defaultBranch: string;
  sha: string | null; committedAt: string | null;
  hasPackageJson: boolean; lockfiles: string[]; lockfile: string | null; packageManager: string | null;
  workspaces: string[] | null;         // globs from package.json
  workspaceManifests: string[];        // paths fetched for yarn v1 monorepos
  status: 'ok' | 'no-package-json' | 'no-lockfile' | 'binary-lockfile' | 'fetch-error' | 'empty';
  note: string | null;
}

function gh(path: string): any {
  for (let attempt = 0; ; attempt++) {
    try { return JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', maxBuffer: 256 << 20 })); }
    catch (e: any) {
      const msg = String(e.stderr || e.message);
      if (/404|Not Found/.test(msg)) return null;
      if (attempt < 5 && /rate limit|403|502|503/i.test(msg)) { process.stderr.write(`gh: ${msg.trim().split('\n')[0]} — waiting\n`); execFileSync('sleep', ['70']); continue; }
      throw e;
    }
  }
}

function raw(fullName: string, sha: string, path: string): string | null {
  const url = `https://raw.githubusercontent.com/${fullName}/${sha}/${path}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return execFileSync('curl', ['-fsSL', '--max-time', '120', url], { encoding: 'utf8', maxBuffer: 512 << 20 });
    } catch (e: any) {
      if (/exit code 22/.test(String(e.message)) && /404/.test(String(e.stderr))) return null;
      execFileSync('sleep', ['5']);
    }
  }
  return null;
}

// Minimal glob for workspace patterns: `packages/*`, `apps/**`, `libs/*/`.
function globToRegex(g: string): RegExp {
  const s = g.replace(/\/$/, '').replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\0').replace(/\*/g, '[^/]*').replace(/\0/g, '.*');
  return new RegExp(`^${s}/package\\.json$`);
}

function main() {
  mkdirSync(store, { recursive: true });
  const frame = readFileSync(frameFile, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  const h = (r: any) => createHash('sha256').update(`${seed}\n${r.fullName}`).digest('hex');
  frame.sort((a, b) => h(a) < h(b) ? -1 : 1);
  const done = new Set<string>();
  if (existsSync(popFile)) {
    for (const l of readFileSync(popFile, 'utf8').split('\n')) if (l) done.add(JSON.parse(l).fullName);
  } else writeFileSync(popFile, '');
  let i = 0;
  for (const r of frame.slice(0, N)) {
    i++;
    if (done.has(r.fullName)) continue;
    const row: PopRow = { fullName: r.fullName, language: r.language, stars: r.stars, pushedAt: r.pushedAt, createdAt: r.createdAt, defaultBranch: r.defaultBranch, sha: null, committedAt: null, hasPackageJson: false, lockfiles: [], lockfile: null, packageManager: null, workspaces: null, workspaceManifests: [], status: 'fetch-error', note: null };
    try {
      const commit = gh(`repos/${r.fullName}/commits/${encodeURIComponent(r.defaultBranch)}`);
      if (!commit) { row.status = 'fetch-error'; row.note = 'branch not found'; appendFileSync(popFile, JSON.stringify(row) + '\n'); continue; }
      row.sha = commit.sha; row.committedAt = commit.commit?.committer?.date ?? null;
      const listing = gh(`repos/${r.fullName}/contents/?ref=${row.sha}`) || [];
      const names = new Set(listing.map((f: any) => f.name));
      row.hasPackageJson = names.has('package.json');
      row.lockfiles = LOCKFILES.filter(f => names.has(f));
      if (!row.hasPackageJson) { row.status = 'no-package-json'; appendFileSync(popFile, JSON.stringify(row) + '\n'); continue; }
      const dir = join(store, r.fullName.replace('/', '__'));
      mkdirSync(dir, { recursive: true });
      const pkgText = raw(r.fullName, row.sha!, 'package.json');
      if (!pkgText) { row.status = 'fetch-error'; row.note = 'package.json unreadable'; appendFileSync(popFile, JSON.stringify(row) + '\n'); continue; }
      writeFileSync(join(dir, 'package.json'), pkgText);
      let pkg: any = {};
      try { pkg = JSON.parse(pkgText); } catch { row.note = 'package.json is not JSON'; }
      row.packageManager = typeof pkg.packageManager === 'string' ? pkg.packageManager : null;
      const ws = Array.isArray(pkg.workspaces) ? pkg.workspaces : (pkg.workspaces && Array.isArray(pkg.workspaces.packages) ? pkg.workspaces.packages : null);
      row.workspaces = ws;
      // which lockfile the manager would read: the declared packageManager wins, then npm, pnpm, yarn, bun
      const pm = (row.packageManager || '').split('@')[0];
      const prefer = pm === 'pnpm' ? ['pnpm-lock.yaml'] : pm === 'yarn' ? ['yarn.lock'] : pm === 'bun' ? ['bun.lock', 'bun.lockb'] : pm === 'npm' ? ['package-lock.json', 'npm-shrinkwrap.json'] : [];
      const order = [...prefer, 'package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb'];
      row.lockfile = order.find(f => row.lockfiles.includes(f)) ?? null;
      if (!row.lockfile) { row.status = 'no-lockfile'; appendFileSync(popFile, JSON.stringify(row) + '\n'); continue; }
      if (row.lockfile === 'bun.lockb') { row.status = 'binary-lockfile'; appendFileSync(popFile, JSON.stringify(row) + '\n'); continue; }
      if (row.lockfiles.length > 1 && !prefer.length) row.note = `several lockfiles (${row.lockfiles.join(', ')}); ${row.lockfile} taken`;
      const lockText = raw(r.fullName, row.sha!, row.lockfile);
      if (!lockText) { row.status = 'fetch-error'; row.note = 'lockfile unreadable'; appendFileSync(popFile, JSON.stringify(row) + '\n'); continue; }
      writeFileSync(join(dir, row.lockfile), lockText);
      // yarn v1 keeps no manifests: fetch the workspace package.json files from the tree
      if (row.lockfile === 'yarn.lock' && !/^__metadata:/m.test(lockText) && ws && ws.length) {
        const tree = gh(`repos/${r.fullName}/git/trees/${row.sha}?recursive=1`);
        const paths: string[] = (tree?.tree || []).map((t: any) => t.path);
        if (tree?.truncated) row.note = (row.note ? row.note + '; ' : '') + 'tree truncated';
        const res = ws.map(globToRegex);
        for (const p of paths) if (res.some(re => re.test(p))) {
          const t = raw(r.fullName, row.sha!, p);
          if (t) { mkdirSync(join(dir, 'ws', p.replace(/\/package\.json$/, '')), { recursive: true }); writeFileSync(join(dir, 'ws', p), t); row.workspaceManifests.push(p); }
        }
      }
      row.status = lockText.trim().length < 20 ? 'empty' : 'ok';
    } catch (e: any) {
      row.status = 'fetch-error'; row.note = String(e.message).split('\n')[0].slice(0, 200);
    }
    appendFileSync(popFile, JSON.stringify(row) + '\n');
    if (i % 25 === 0) process.stderr.write(`${i}/${N} ${r.fullName} ${row.status}\n`);
  }
}

main();
