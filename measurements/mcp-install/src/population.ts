// Build the population and the sample from a paginated dump of the official
// MCP registry (`/v0/servers?limit=100&version=latest`, gzipped pages).
//
// Population = one row per distinct (registryType, identifier) among active,
// latest-version entries that ship a package on npm or PyPI with stdio
// transport. Remote-only entries (55 % of the registry) have no install step
// and are out of scope; OCI and MCPB packages are recorded but not sampled —
// no container runtime on the measurement host, and MCPB bundles are a
// different install path.
//
// Usage: node population.ts <pages-dir> <out-dir> [seed] [nNpm] [nPypi]

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export interface ArgSpec {
  type: 'positional' | 'named';
  name?: string;
  value?: string;
  default?: string;
  isRequired?: boolean;
  isRepeated?: boolean;
  valueHint?: string;
  format?: string;
  choices?: string[];
}
export interface EnvSpec { name: string; default?: string; isRequired?: boolean; isSecret?: boolean; format?: string; choices?: string[] }

export interface PopRow {
  serverName: string;
  registryType: 'npm' | 'pypi' | 'oci' | 'mcpb' | 'nuget' | 'cargo' | string;
  identifier: string;
  version: string;
  runtimeHint: string | null;
  runtimeArguments: ArgSpec[];
  packageArguments: ArgSpec[];
  environmentVariables: EnvSpec[];
  transport: string | null;
  repositoryUrl: string | null;
  websiteUrl: string | null;
  publishedAt: string | null;
  namespace: string;
  /** Other registry entries that reference the same package. */
  aliases: number;
}

function loadPages(dir: string): any[] {
  const servers: any[] = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json.gz')).sort()) {
    const d = JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString('utf8'));
    for (const s of d.servers ?? []) servers.push(s);
  }
  return servers;
}

export function buildPopulation(pagesDir: string): { rows: PopRow[]; stats: Record<string, number> } {
  const servers = loadPages(pagesDir);
  const META = 'io.modelcontextprotocol.registry/official';
  const byKey = new Map<string, PopRow>();
  const stats: Record<string, number> = { entries: servers.length, active: 0, withPackages: 0, remoteOnly: 0, neither: 0 };
  const byType: Record<string, number> = {};
  for (const e of servers) {
    const s = e.server ?? {};
    const status = e._meta?.[META]?.status ?? 'active';
    if (status !== 'active') continue;
    stats.active++;
    const pk: any[] = s.packages ?? [];
    const rm: any[] = s.remotes ?? [];
    if (pk.length === 0 && rm.length > 0) { stats.remoteOnly++; continue; }
    if (pk.length === 0) { stats.neither++; continue; }
    stats.withPackages++;
    for (const p of pk) {
      const rt = String(p.registryType ?? 'unknown').toLowerCase();
      byType[rt] = (byType[rt] ?? 0) + 1;
      const key = `${rt}::${p.identifier}`;
      const prev = byKey.get(key);
      if (prev) { prev.aliases++; continue; }
      byKey.set(key, {
        serverName: s.name,
        registryType: rt,
        identifier: String(p.identifier),
        version: String(p.version ?? ''),
        runtimeHint: p.runtimeHint ?? null,
        runtimeArguments: p.runtimeArguments ?? [],
        packageArguments: p.packageArguments ?? [],
        environmentVariables: p.environmentVariables ?? [],
        transport: p.transport?.type ?? null,
        repositoryUrl: s.repository?.url ?? null,
        websiteUrl: s.websiteUrl ?? null,
        publishedAt: e._meta?.[META]?.publishedAt ?? null,
        namespace: String(s.name ?? '').split('/')[0],
        aliases: 0,
      });
    }
  }
  for (const [k, v] of Object.entries(byType)) stats[`packages_${k}`] = v;
  const rows = [...byKey.values()];
  stats.distinctPackages = rows.length;
  for (const rt of ['npm', 'pypi', 'oci', 'mcpb', 'nuget', 'cargo']) {
    stats[`distinct_${rt}`] = rows.filter((r) => r.registryType === rt).length;
    stats[`distinct_${rt}_stdio`] = rows.filter((r) => r.registryType === rt && (r.transport === 'stdio' || r.transport === null)).length;
  }
  return { rows, stats };
}

/** Deterministic shuffle: sort by sha256(seed + key). Anyone with the pages
 *  and the seed reproduces the same order, so the sample is the first n of it. */
export function seededOrder(rows: PopRow[], seed: string): PopRow[] {
  const h = (r: PopRow) => createHash('sha256').update(`${seed}\n${r.registryType}::${r.identifier}`).digest('hex');
  return rows.map((r) => ({ r, k: h(r) })).sort((a, b) => (a.k < b.k ? -1 : a.k > b.k ? 1 : 0)).map((x) => x.r);
}

if (process.argv[1] && process.argv[1].endsWith('population.ts')) {
  const [pagesDir, outDir, seed = 'norte-labs-mcp-install-2026-09-11', nNpm = '420', nPypi = '180'] = process.argv.slice(2);
  mkdirSync(outDir, { recursive: true });
  const { rows, stats } = buildPopulation(pagesDir);
  writeFileSync(join(outDir, 'population.ndjson'), rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const eligible = rows.filter((r) => (r.registryType === 'npm' || r.registryType === 'pypi') && (r.transport === 'stdio' || r.transport === null));
  const ordered = seededOrder(eligible, seed);
  const npm = ordered.filter((r) => r.registryType === 'npm').slice(0, Number(nNpm));
  const pypi = ordered.filter((r) => r.registryType === 'pypi').slice(0, Number(nPypi));
  // Interleave in seeded order so a partial run is still a random sample of both.
  const sample = ordered.filter((r) => npm.includes(r) || pypi.includes(r));
  writeFileSync(join(outDir, 'sample.ndjson'), sample.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const out = { ...stats, eligible: eligible.length, eligible_npm: eligible.filter((r) => r.registryType === 'npm').length, eligible_pypi: eligible.filter((r) => r.registryType === 'pypi').length, seed, sample: sample.length, sample_npm: npm.length, sample_pypi: pypi.length };
  writeFileSync(join(outDir, 'population-stats.json'), JSON.stringify(out, null, 1) + '\n');
  console.log(JSON.stringify(out, null, 1));
}
