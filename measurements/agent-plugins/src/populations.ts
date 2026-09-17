// Build the four populations. Each is the whole registry, not a sample.
//
//   acp     the ACP registry (agentclientprotocol/registry): every agent directory
//           (published and quarantined), one cell per distribution that runs on
//           linux-x86_64 (npx, uvx, binary). Field truth carried along: the
//           registry's quarantine.json and its daily protocol matrix.
//   cursor  the Cursor Marketplace catalogue (unauthenticated endpoint): one cell
//           per approved plugin, pinned to the commit the catalogue names.
//   devin   the Devin marketplace repository (CognitionAI/devin-marketplace) at a
//           pinned commit: one cell per plugin directory.
//   zed     the Zed extension registry, extensions that provide context servers
//           (api.zed.dev/extensions?provides=context-servers): one cell per
//           extension; the command is recovered from the extension's source at
//           run time.
//
// Usage: node populations.ts <arm> <out-dir> [--acp-clone <dir>] [--devin-clone <dir>]

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type Arm = 'acp' | 'cursor' | 'devin' | 'zed';
export type Kind = 'npm' | 'uvx' | 'binary' | 'git-plugin' | 'zed-extension';

export interface Spec {
  arm: Arm;
  id: string;                 // unique cell id
  subject: string;            // agent id / plugin name / extension id
  subjectVersion: string | null;
  source: string | null;      // repository URL
  kind: Kind;
  protocol: 'acp' | 'mcp';
  // npm / uvx
  package?: string;
  version?: string;
  args?: string[];
  env?: Record<string, string>;
  // binary
  archive?: string;
  cmd?: string;
  sha256?: string | null;
  // git-plugin / zed-extension
  gitUrl?: string;
  gitRef?: string;
  subdir?: string;
  marketplace?: 'cursor' | 'devin';
  declared?: unknown;         // what the registry/catalogue itself says about the cell
  fieldTruth?: unknown;       // acp: quarantine reason and protocol-matrix outcome
  notes: string[];
}

const linesOf = (rows: unknown[]) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';

// -------------------------------------------------------------------- acp --
export function buildAcp(cloneDir: string): { rows: Spec[]; stats: Record<string, unknown> } {
  const commit = execFileSync('git', ['-C', cloneDir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const date = execFileSync('git', ['-C', cloneDir, 'log', '-1', '--format=%cI'], { encoding: 'utf8' }).trim();
  const quarantine: Record<string, string> = JSON.parse(readFileSync(join(cloneDir, 'quarantine.json'), 'utf8'));
  let matrix: any = null;
  try { matrix = JSON.parse(readFileSync(join(cloneDir, '.protocol-matrix', 'latest.json'), 'utf8')); } catch { /* absent */ }
  const matrixBy = new Map<string, any>();
  for (const a of matrix?.agents ?? []) matrixBy.set(a.id, a);
  let published: Set<string> | null = null;
  try {
    const reg = JSON.parse(execFileSync('curl', ['-sS', 'https://cdn.agentclientprotocol.com/registry/v1/latest/registry.json'], { encoding: 'utf8', maxBuffer: 50_000_000 }));
    published = new Set((reg.agents ?? []).map((a: any) => a.id));
  } catch { /* offline */ }

  const rows: Spec[] = [];
  const stats = { commit, date, agentDirs: 0, quarantined: Object.keys(quarantine).length, matrixProbed: matrix?.summary?.agentsProbed ?? null, matrixDate: matrix?.date ?? null, published: published?.size ?? null, byKind: {} as Record<string, number>, noLinuxDistribution: [] as string[] };
  for (const dir of readdirSync(cloneDir, { withFileTypes: true })) {
    if (!dir.isDirectory() || dir.name.startsWith('.')) continue;
    const mf = join(cloneDir, dir.name, 'agent.json');
    if (!existsSync(mf)) continue;
    stats.agentDirs++;
    const a = JSON.parse(readFileSync(mf, 'utf8'));
    const m = matrixBy.get(a.id);
    const fieldTruth = {
      quarantined: a.id in quarantine ? quarantine[a.id] : null,
      published: published ? published.has(a.id) : null,
      matrix: m ? { distribution: m.distribution, initialize: m.initialize?.status, sessionNew: m.sessionNew?.status, authMethods: m.authMethods, registryVersion: m.registryVersion } : null,
    };
    const dist = a.distribution ?? {};
    let any = false;
    const base = { arm: 'acp' as const, subject: String(a.id), subjectVersion: a.version ? String(a.version) : null, source: a.repository ?? null, protocol: 'acp' as const, fieldTruth, declared: { name: a.name, license: a.license, authors: a.authors, distributions: Object.keys(dist) } };
    if (dist.npx?.package) {
      const p = String(dist.npx.package); const at = p.lastIndexOf('@');
      const [pkg, ver] = at > 0 ? [p.slice(0, at), p.slice(at + 1)] : [p, 'latest'];
      rows.push({ ...base, id: `acp::${a.id}::npx`, kind: 'npm', package: pkg, version: ver, args: dist.npx.args ?? [], env: dist.npx.env ?? {}, notes: [] }); any = true;
    }
    if (dist.uvx?.package) {
      const p = String(dist.uvx.package); const m2 = /^(.+?)(?:==|@)(.+)$/.exec(p);
      rows.push({ ...base, id: `acp::${a.id}::uvx`, kind: 'uvx', package: m2 ? m2[1] : p, version: m2 ? m2[2] : 'latest', args: dist.uvx.args ?? [], env: dist.uvx.env ?? {}, notes: [] }); any = true;
    }
    if (dist.binary?.['linux-x86_64']?.archive) {
      const b = dist.binary['linux-x86_64'];
      rows.push({ ...base, id: `acp::${a.id}::binary`, kind: 'binary', archive: String(b.archive), cmd: String(b.cmd ?? ''), args: b.args ?? [], env: b.env ?? {}, sha256: b.sha256 ?? null, notes: [] }); any = true;
    }
    if (!any) stats.noLinuxDistribution.push(a.id);
  }
  for (const r of rows) stats.byKind[r.kind] = (stats.byKind[r.kind] ?? 0) + 1;
  return { rows, stats };
}

// ----------------------------------------------------------------- cursor --
export function buildCursor(outDir: string): { rows: Spec[]; stats: Record<string, unknown> } {
  const raw = execFileSync('curl', ['-sS', '-X', 'POST', 'https://api2.cursor.sh/aiserver.v1.DashboardService/ListMarketplacePlugins', '-H', 'Content-Type: application/json', '-d', '{}'], { encoding: 'utf8', maxBuffer: 50_000_000 });
  const fetchedAt = new Date().toISOString();
  writeFileSync(join(outDir, `cursor-catalogue-${fetchedAt.slice(0, 10)}.json`), raw); // the raw catalogue, gzipped before publication
  const d = JSON.parse(raw);
  const plugins: any[] = Object.values(d).find((v) => Array.isArray(v)) as any[];
  const rows: Spec[] = [];
  const stats = { fetchedAt, plugins: plugins.length, approved: 0, publishers: new Set<string>().size, shaPinned: 0, withMcpServers: 0, mcpEntries: 0, withVariables: 0 };
  const pubs = new Set<string>();
  for (const p of plugins) {
    if (p.status === 'PLUGIN_STATUS_APPROVED') stats.approved++;
    pubs.add(String(p.publisherId ?? p.publisher?.id));
    const ref = String(p.gitRef ?? '');
    const pinned = /^[0-9a-f]{40}$/.test(ref);
    if (pinned) stats.shaPinned++;
    const mcp = Array.isArray(p.mcpServers) ? p.mcpServers : [];
    if (mcp.length) { stats.withMcpServers++; stats.mcpEntries += mcp.length; }
    const vars = p.variables?.properties ? Object.keys(p.variables.properties) : [];
    if (vars.length) stats.withVariables++;
    rows.push({
      arm: 'cursor', id: `cursor::${p.name}`, subject: String(p.name), subjectVersion: ref.slice(0, 12) || null, source: p.repositoryUrl ?? p.gitUrl ?? null,
      kind: 'git-plugin', protocol: 'mcp', gitUrl: String(p.gitUrl ?? p.repositoryUrl), gitRef: ref, marketplace: 'cursor',
      declared: { displayName: p.displayName, publisher: p.publisher?.name ?? p.publisherId, isUserOwned: p.publisher?.isUserOwned ?? null, createdAt: p.createdAt, mcpServers: mcp.map((m: any) => ({ name: m.name, sourcePath: m.sourcePath ?? null })), variables: vars, requiredVariables: p.variables?.required ?? [] },
      notes: pinned ? [] : ['gitRef is not a commit SHA'],
    });
  }
  (stats as any).publishers = pubs.size;
  return { rows, stats };
}

// ------------------------------------------------------------------ devin --
export function buildDevin(cloneDir: string): { rows: Spec[]; stats: Record<string, unknown> } {
  const commit = execFileSync('git', ['-C', cloneDir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const date = execFileSync('git', ['-C', cloneDir, 'log', '-1', '--format=%cI'], { encoding: 'utf8' }).trim();
  const rows: Spec[] = [];
  const stats = { commit, date, plugins: 0, mcpUrl: 0, mcpCommand: 0, commands: {} as Record<string, number>, withSkills: 0 };
  for (const dir of readdirSync(join(cloneDir, 'plugins'), { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const mf = join(cloneDir, 'plugins', dir.name, '.devin-plugin', 'plugin.json');
    if (!existsSync(mf)) continue;
    stats.plugins++;
    const j = JSON.parse(readFileSync(mf, 'utf8'));
    const servers = Object.entries(j.mcpServers ?? {}).map(([name, v]: [string, any]) => {
      if (v?.url) { stats.mcpUrl++; return { name, url: String(v.url) }; }
      if (v?.command) { stats.mcpCommand++; stats.commands[v.command] = (stats.commands[v.command] ?? 0) + 1; return { name, command: String(v.command), args: v.args ?? [], env: v.env ?? {} }; }
      return { name, other: Object.keys(v ?? {}) };
    });
    if (existsSync(join(cloneDir, 'plugins', dir.name, 'skills'))) stats.withSkills++;
    rows.push({
      arm: 'devin', id: `devin::${dir.name}`, subject: dir.name, subjectVersion: commit.slice(0, 12), source: j.repository ?? null,
      kind: 'git-plugin', protocol: 'mcp', gitUrl: 'https://github.com/CognitionAI/devin-marketplace', gitRef: commit, subdir: `plugins/${dir.name}`, marketplace: 'devin',
      declared: { displayName: j.displayName, homepage: j.homepage, keywords: j.keywords, mcpServers: servers },
      notes: [],
    });
  }
  return { rows, stats };
}

// -------------------------------------------------------------------- zed --
export function buildZed(): { rows: Spec[]; stats: Record<string, unknown> } {
  const raw = execFileSync('curl', ['-sS', 'https://api.zed.dev/extensions?provides=context-servers&max_schema_version=1'], { encoding: 'utf8', maxBuffer: 50_000_000 });
  const fetchedAt = new Date().toISOString();
  const d = JSON.parse(raw);
  const rows: Spec[] = [];
  const stats = { fetchedAt, extensions: d.data.length, totalDownloads: 0 };
  for (const e of d.data) {
    stats.totalDownloads += Number(e.download_count ?? 0);
    rows.push({
      arm: 'zed', id: `zed::${e.id}`, subject: String(e.id), subjectVersion: String(e.version ?? ''), source: e.repository ?? null,
      kind: 'zed-extension', protocol: 'mcp', gitUrl: String(e.repository ?? ''), gitRef: '',
      declared: { name: e.name, provides: e.provides, wasmApiVersion: e.wasm_api_version, publishedAt: e.published_at, downloadCount: e.download_count, authors: e.authors },
      notes: [],
    });
  }
  return { rows, stats };
}

// ------------------------------------------------------------------- main --
if (process.argv[1] && process.argv[1].endsWith('populations.ts')) {
  const [arm, outDir, ...rest] = process.argv.slice(2);
  const optOf = (k: string) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : undefined; };
  mkdirSync(outDir, { recursive: true });
  let r: { rows: Spec[]; stats: Record<string, unknown> };
  if (arm === 'acp') r = buildAcp(optOf('--acp-clone')!);
  else if (arm === 'cursor') r = buildCursor(outDir);
  else if (arm === 'devin') r = buildDevin(optOf('--devin-clone')!);
  else if (arm === 'zed') r = buildZed();
  else throw new Error(`unknown arm ${arm}`);
  writeFileSync(join(outDir, `population-${arm}.ndjson`), linesOf(r.rows));
  writeFileSync(join(outDir, `population-${arm}-stats.json`), JSON.stringify(r.stats, null, 2) + '\n');
  console.log(`${arm}: ${r.rows.length} cells`, JSON.stringify(r.stats));
}
