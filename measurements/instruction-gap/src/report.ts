// Aggregate the cells into the figures the findings quote. Shares carry 95 %
// Wilson intervals; means carry a cluster-robust interval with the framework
// as the cluster, because projects on the same framework resolve much of the
// same tree and are not independent draws.
//
// Usage: node report.ts <population.ndjson> <cells.ndjson> <frame.ndjson> <out.md>

import { readFileSync, writeFileSync } from 'node:fs';
import type { Cell } from './compute.ts';

const [popFile, cellsFile, frameFile, out] = process.argv.slice(2, 6);

function wilson(k: number, n: number): { p: number; lo: number; hi: number } {
  if (n === 0) return { p: 0, lo: 0, hi: 0 };
  const z = 1.96; const p = k / n; const d = 1 + z * z / n;
  const c = (p + z * z / (2 * n)) / d; const h = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
  return { p, lo: Math.max(0, c - h), hi: Math.min(1, c + h) };
}
const pct = (x: number) => `${(100 * x).toFixed(1)} %`;
const share = (k: number, n: number) => { const w = wilson(k, n); return `${k}/${n} = ${pct(w.p)} [${pct(w.lo)}–${pct(w.hi)}]`; };
const q = (xs: number[], p: number) => { const s = [...xs].sort((a, b) => a - b); if (!s.length) return NaN; const i = (s.length - 1) * p; const lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const f1 = (x: number) => Number.isFinite(x) ? x.toFixed(1) : '–';

// Mean with a cluster-robust standard error (sandwich over cluster sums) and
// the design effect against the iid variance; ICC from a one-way decomposition.
function clusterMean(rows: [string, number][]) {
  const n = rows.length; const m = mean(rows.map(r => r[1]));
  const cl = new Map<string, number[]>();
  for (const [k, y] of rows) { if (!cl.has(k)) cl.set(k, []); cl.get(k)!.push(y); }
  let vr = 0; for (const ys of cl.values()) { const s = ys.reduce((a, y) => a + (y - m), 0); vr += s * s; } vr /= n * n;
  const vi = rows.reduce((a, [, y]) => a + (y - m) ** 2, 0) / (n - 1) / n;
  // ICC: between-cluster over total variance (ANOVA estimator)
  const k = cl.size; const mbar = n / k;
  const ssb = [...cl.values()].reduce((a, ys) => a + ys.length * (mean(ys) - m) ** 2, 0);
  const ssw = [...cl.values()].reduce((a, ys) => a + ys.reduce((b, y) => b + (y - mean(ys)) ** 2, 0), 0);
  const msb = ssb / Math.max(1, k - 1), msw = ssw / Math.max(1, n - k);
  const icc = Math.max(0, (msb - msw) / (msb + (mbar - 1) * msw));
  return { mean: m, se: Math.sqrt(vr), seIid: Math.sqrt(vi), deff: vi > 0 ? vr / vi : NaN, icc, clusters: k, mbar };
}

function jaccard(a: Set<string>, b: Set<string>): number { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); }

function main() {
  const pop = readFileSync(popFile, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  const cells: Cell[] = readFileSync(cellsFile, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  const frame = readFileSync(frameFile, 'utf8').split('\n').filter(Boolean).length;
  const L: string[] = [];
  const H = (s: string) => L.push('', s, '');
  L.push('# instruction-gap — generated report', '');
  L.push(`Generated ${new Date().toISOString()} from \`results/population.ndjson\` and \`results/cells.ndjson\`. Shares carry 95 % Wilson intervals; means carry a cluster-robust interval (framework clusters).`);

  H('## Frame and sample');
  const byStatus = new Map<string, number>();
  for (const r of pop) byStatus.set(r.status, (byStatus.get(r.status) || 0) + 1);
  L.push(`Frame: ${frame.toLocaleString('en-US')} repositories. Drawn: ${pop.length}. Read: ${cells.length}.`, '');
  L.push('| status | n |', '|---|---|');
  for (const [s, n] of [...byStatus.entries()].sort((a, b) => b[1] - a[1])) L.push(`| ${s} | ${n} |`);
  const withPkg = pop.filter(r => r.hasPackageJson);
  const withLock = withPkg.filter(r => r.lockfile);
  L.push('', `Projects with a root package.json: ${share(withPkg.length, pop.length)}. Of those, with a lockfile at the root: ${share(withLock.length, withPkg.length)}.`, '');
  const byLock = new Map<string, number>();
  for (const r of withLock) byLock.set(r.lockfile, (byLock.get(r.lockfile) || 0) + 1);
  L.push('| lockfile | n | share of projects with a lockfile |', '|---|---|---|');
  for (const [k, n] of [...byLock.entries()].sort((a, b) => b[1] - a[1])) L.push(`| ${k} | ${n} | ${share(n, withLock.length)} |`);
  const multi = withLock.filter(r => r.lockfiles.length > 1).length;
  L.push('', `Projects committing more than one lockfile: ${share(multi, withLock.length)}.`);
  const byManager = new Map<string, Cell[]>();
  for (const c of cells) { if (!byManager.has(c.manager)) byManager.set(c.manager, []); byManager.get(c.manager)!.push(c); }

  H('## Per project: declared, resolved, published by whom');
  const D = cells.map(c => c.declared.direct), V = cells.map(c => c.resolved.versions), Nn = cells.map(c => c.resolved.names);
  const P = cells.map(c => c.publishers.total), M = cells.map(c => c.maintainers.total);
  const rv = cells.map(c => c.resolved.versions / Math.max(1, c.declared.direct));
  const rp = cells.map(c => c.publishers.total / Math.max(1, c.declared.direct));
  const rm = cells.map(c => c.maintainers.total / Math.max(1, c.declared.direct));
  const row = (name: string, xs: number[]) => `| ${name} | ${f1(q(xs, 0.1))} | ${f1(q(xs, 0.25))} | **${f1(q(xs, 0.5))}** | ${f1(q(xs, 0.75))} | ${f1(q(xs, 0.9))} | ${f1(mean(xs))} |`;
  L.push('| per project | p10 | p25 | median | p75 | p90 | mean |', '|---|---|---|---|---|---|---|');
  L.push(row('direct dependencies declared', D));
  L.push(row('resolved (name, version) pairs', V));
  L.push(row('resolved distinct names', Nn));
  L.push(row('distinct publishers', P));
  L.push(row('distinct maintainer accounts', M));
  L.push(row('ratio resolved / direct', rv));
  L.push(row('ratio publishers / direct', rp));
  L.push(row('ratio maintainers / direct', rm));
  const notChosen = cells.map(c => c.publishers.notChosen), behind = cells.map(c => c.publishers.behindDirect);
  L.push(row('publishers behind a direct dependency', behind));
  L.push(row('publishers behind no direct dependency', notChosen));
  // A share has no value for a project with no publisher; those are left out, as ecosystems/go
  // leaves out the projects with no dependency.
  const withPub = cells.filter(c => c.publishers.total > 0);
  const shareNotChosen = withPub.map(c => c.publishers.notChosen / c.publishers.total);
  const shareAutomation = withPub.map(c => c.publishers.automation / c.publishers.total);
  L.push(row(`share of publishers the developer never named (the ${withPub.length} with a publisher)`, shareNotChosen));
  L.push(row('publishers that are not automation (name heuristic)', cells.map(c => c.publishers.total - c.publishers.automation)));
  L.push(row('ratio non-automation publishers / direct', cells.map(c => (c.publishers.total - c.publishers.automation) / Math.max(1, c.declared.direct))));
  L.push('', `Over the ${withPub.length} projects with at least one publisher: never named, median ${pct(q(shareNotChosen, 0.5))} [p10 ${pct(q(shareNotChosen, 0.1))}, p90 ${pct(q(shareNotChosen, 0.9))}]; automation name, median ${pct(q(shareAutomation, 0.5))}.`);
  const npmCells = cells.filter(c => c.prod);
  const prodByManager = [...npmCells.reduce((m, c) => m.set(c.manager, (m.get(c.manager) || 0) + 1), new Map<string, number>())].map(([k, n]) => `${n} ${k}`).join(', ');
  L.push('', `Production only (the ${npmCells.length} lockfiles that mark dev dependencies, ${prodByManager}; dev ones excluded):`, '');
  L.push('| per project (lockfiles that mark dev dependencies) | p10 | p25 | median | p75 | p90 | mean |', '|---|---|---|---|---|---|---|');
  L.push(row('direct dependencies in `dependencies`', npmCells.map(c => c.declared.byField.dependencies || 0)));
  L.push(row('resolved versions not marked dev', npmCells.map(c => c.prod!.versions)));
  L.push(row('publishers behind them', npmCells.map(c => c.prod!.publishers)));
  L.push(row('ratio publishers / direct, production', npmCells.map(c => c.prod!.publishers / Math.max(1, c.declared.byField.dependencies || 0))));
  L.push('', 'Publisher kinds, summed over projects (a publisher counts once per project):', '');
  const users = cells.reduce((a, c) => a + c.publishers.users, 0), gha = cells.reduce((a, c) => a + c.publishers.trustedPublishing, 0), auto = cells.reduce((a, c) => a + c.publishers.automation, 0);
  L.push(`- npm user accounts: ${users}; trusted-publishing repositories: ${gha}; of all of these, ${auto} carry an automation name; versions whose publisher could not be read: ${cells.reduce((a, c) => a + c.publishers.unknownVersions, 0)}.`);
  const ghaShare = cells.map(c => c.publishers.total ? c.publishers.trustedPublishing / c.publishers.total : 0);
  L.push(`- share of a project's publishers that are trusted-publishing repositories: median ${pct(q(ghaShare, 0.5))}, mean ${pct(mean(ghaShare))}.`);
  const withGha = cells.filter(c => c.publishers.trustedPublishing > 0).length;
  L.push(`- projects with at least one trusted-publishing publisher: ${share(withGha, cells.length)}; versions with a provenance attestation: ${cells.reduce((a, c) => a + c.provenance.versionsWithAttestation, 0)} of ${cells.reduce((a, c) => a + c.lookup.ok, 0)} read.`);
  const lookupOk = cells.reduce((a, c) => a + c.lookup.ok, 0), lookupMissing = cells.reduce((a, c) => a + c.lookup.missing, 0), lookupErr = cells.reduce((a, c) => a + c.lookup.error, 0), nonReg = cells.reduce((a, c) => a + c.lookup.nonRegistry, 0);
  L.push(`- registry lookups: ${lookupOk} read, ${lookupMissing} versions no longer on the registry, ${lookupErr} errors; ${nonReg} resolved pairs are not registry packages (git, tarball or another source).`);

  H('## Decisions the manager made');
  const dec = cells.map(c => c.decisions.versionsByManager), never = cells.map(c => c.decisions.namesNeverNamed);
  const exactShare = cells.map(c => c.declared.specsTotal ? c.declared.exact / c.declared.specsTotal : 0);
  L.push('| per project | p10 | p25 | median | p75 | p90 | mean |', '|---|---|---|---|---|---|---|');
  L.push(row('versions the manager chose', dec));
  L.push(row('packages the developer never named', never));
  L.push(row('share of direct specs pinned exactly', exactShare));
  L.push(row('packages present in more than one version', cells.map(c => c.resolved.duplicatedNames)));
  const anyExact = cells.filter(c => c.declared.exact > 0).length;
  L.push('', `Projects pinning at least one direct dependency exactly: ${share(anyExact, cells.length)}; projects pinning all of them: ${share(cells.filter(c => c.declared.specsTotal > 0 && c.declared.exact === c.declared.specsTotal).length, cells.length)}.`);

  H('## Code that runs at install');
  const anyInstall = cells.filter(c => c.install.versions > 0).length;
  L.push(`Projects resolving at least one package with an install script (preinstall, install, postinstall, or a native build): ${share(anyInstall, cells.length)}.`, '');
  L.push('| per project | p10 | p25 | median | p75 | p90 | mean |', '|---|---|---|---|---|---|---|');
  L.push(row('packages with install-time code', cells.map(c => c.install.names)));
  L.push(row('of which direct dependencies', cells.map(c => c.install.direct)));
  L.push(row('publishers with install-time code', cells.map(c => c.install.publishers)));
  L.push(row('maintainer accounts behind install-time code', cells.map(c => c.maintainers.withInstallScript)));
  // install.direct counts versions, so the comparison is with install.versions: a project counts
  // when some install-time version belongs to a name the developer did not declare.
  const instNotDirect = cells.filter(c => c.install.versions > c.install.direct).length;
  L.push('', `Projects where install-time code comes from a package the developer never named: ${share(instNotDirect, cells.length)}.`);

  H('## Hosts');
  const urlCells = cells.filter(c => c.manager === 'npm' || c.manager === 'yarn');
  const hostsPerProject = urlCells.map(c => Object.keys(c.resolved.hosts).filter(h => h !== 'none' && h !== 'registry').length);
  const hostAll = new Map<string, number>();
  for (const c of urlCells) for (const h of Object.keys(c.resolved.hosts)) if (h !== 'none' && h !== 'registry') hostAll.set(h, (hostAll.get(h) || 0) + 1);
  L.push(`Only npm and yarn v1 lockfiles record a URL per package (${urlCells.length} projects); pnpm, Yarn Berry and bun resolve registry packages against the configured registry and record a URL only for tarball and git sources. Figures below are over the ${urlCells.length}.`, '');
  L.push('| per project | p10 | p25 | median | p75 | p90 | mean |', '|---|---|---|---|---|---|---|');
  L.push(row('distinct hosts in resolved URLs', hostsPerProject));
  L.push('', '| host in resolved URLs | projects |', '|---|---|');
  for (const [h, n] of [...hostAll.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) L.push(`| ${h} | ${share(n, urlCells.length)} |`);
  const nonRegistryHost = urlCells.filter(c => Object.keys(c.resolved.hosts).some(h => !/^(registry|registry\.npmjs\.org|registry\.yarnpkg\.com|none)$/.test(h))).length;
  L.push('', `Projects with at least one resolved URL outside registry.npmjs.org and its yarn alias: ${share(nonRegistryHost, urlCells.length)}.`);
  const otherKinds = cells.filter(c => (c.resolved.byKind.git || 0) + (c.resolved.byKind.tarball || 0) > 0).length;
  L.push(`Over all ${cells.length} projects, those resolving at least one git or tarball dependency: ${share(otherKinds, cells.length)}.`);
  const tb = new Map<string, number>();
  for (const c of cells) for (const [h, n] of Object.entries(c.tarballHosts)) tb.set(h, (tb.get(h) || 0) + n);
  L.push('', `Tarball hosts recorded by the registry for the resolved versions, summed over projects: ${[...tb.entries()].map(([h, n]) => `${h} ${n}`).join(', ')}.`);

  H('## Who is in every tree: publisher concentration');
  const reach = new Map<string, number>();
  for (const c of cells) for (const id of c.publishers.ids) reach.set(id, (reach.get(id) || 0) + 1);
  const ranked = [...reach.entries()].sort((a, b) => b[1] - a[1]);
  L.push(`Distinct publishers across all projects: ${reach.size}. In one project only: ${share(ranked.filter(r => r[1] === 1).length, reach.size)}. In half the projects or more: ${ranked.filter(r => r[1] >= cells.length / 2).length}.`, '');
  L.push('| publisher | projects reached |', '|---|---|');
  for (const [id, n] of ranked.slice(0, 30)) L.push(`| ${id} | ${share(n, cells.length)} |`);
  const core = new Set(ranked.filter(r => r[1] >= cells.length / 2).map(r => r[0]));
  const coreShare = cells.map(c => c.publishers.total ? c.publishers.ids.filter(id => core.has(id)).length / c.publishers.total : 0);
  L.push('', `Share of a project's publishers that are in the common core (present in ≥ 50 % of projects): median ${pct(q(coreShare, 0.5))}, mean ${pct(mean(coreShare))}.`);

  H('## Design effect: projects on the same framework');
  const byFw = new Map<string, number>();
  for (const c of cells) byFw.set(c.framework, (byFw.get(c.framework) || 0) + 1);
  L.push('| framework cluster | projects |', '|---|---|');
  for (const [k, n] of [...byFw.entries()].sort((a, b) => b[1] - a[1])) L.push(`| ${k} | ${n} |`);
  L.push('', '| mean of | mean | iid 95 % | cluster-robust 95 % | DEFF | ICC | clusters (mean size) |', '|---|---|---|---|---|---|---|');
  const cm = (name: string, xs: number[]) => {
    const r = clusterMean(cells.map((c, i) => [c.framework, xs[i]] as [string, number]));
    L.push(`| ${name} | ${f1(r.mean)} | [${f1(r.mean - 1.96 * r.seIid)}–${f1(r.mean + 1.96 * r.seIid)}] | [${f1(r.mean - 1.96 * r.se)}–${f1(r.mean + 1.96 * r.se)}] | ${f1(r.deff)} | ${r.icc.toFixed(3)} | ${r.clusters} (${f1(r.mbar)}) |`);
  };
  cm('resolved / direct', rv); cm('publishers / direct', rp); cm('maintainers / direct', rm); cm('distinct publishers', P); cm('resolved versions', V); cm('log10 publishers', P.map(x => Math.log10(Math.max(1, x))));
  // overlap of publisher sets within and between clusters
  const sets = cells.map(c => new Set(c.publishers.ids));
  let win = 0, wn = 0, btw = 0, bn = 0;
  for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) {
    const jj = jaccard(sets[i], sets[j]);
    if (cells[i].framework === cells[j].framework && cells[i].framework !== 'none') { win += jj; wn++; } else { btw += jj; bn++; }
  }
  L.push('', `Publisher-set overlap (Jaccard) between pairs of projects: same framework ${wn ? (win / wn).toFixed(3) : '–'} (${wn} pairs), different or no framework ${bn ? (btw / bn).toFixed(3) : '–'} (${bn} pairs).`);

  H('## By manager');
  L.push('| manager | projects | median direct | median resolved | median publishers | median publishers/direct | lockfile records URLs |', '|---|---|---|---|---|---|---|');
  for (const [m, cs] of [...byManager.entries()].sort((a, b) => b[1].length - a[1].length)) {
    L.push(`| ${m} | ${cs.length} | ${f1(q(cs.map(c => c.declared.direct), 0.5))} | ${f1(q(cs.map(c => c.resolved.versions), 0.5))} | ${f1(q(cs.map(c => c.publishers.total), 0.5))} | ${f1(q(cs.map(c => c.publishers.total / Math.max(1, c.declared.direct)), 0.5))} | ${m === 'npm' || m === 'yarn' ? 'yes' : 'no'} |`);
  }

  H('## Notes recorded per project');
  const noted = cells.filter(c => c.notes.length);
  L.push(`${noted.length} projects carry a note (several lockfiles, truncated tree, unreadable manifest):`, '');
  for (const c of noted.slice(0, 60)) L.push(`- ${c.fullName}: ${c.notes.join('; ')}`);

  writeFileSync(out, L.join('\n') + '\n');
  process.stderr.write(`wrote ${out}\n`);
}

main();
