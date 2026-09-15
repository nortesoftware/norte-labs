// Aggregate cells.ndjson into report.md. Rates carry Wilson 95 % intervals;
// the denominator is always stated.
//
// Usage: node report.ts <cells.ndjson> <report.md>

import { readFileSync, writeFileSync } from 'node:fs';

type Cell = any;

function wilson(k: number, n: number): { p: number; lo: number; hi: number } {
  if (n === 0) return { p: 0, lo: 0, hi: 0 };
  const z = 1.96; const p = k / n; const d = 1 + z * z / n;
  const c = (p + z * z / (2 * n)) / d; const h = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
  return { p, lo: Math.max(0, c - h), hi: Math.min(1, c + h) };
}
const pct = (x: number) => `${(100 * x).toFixed(1)} %`;
const rate = (k: number, n: number) => { const w = wilson(k, n); return `${k}/${n} = ${pct(w.p)} [${pct(w.lo)}–${pct(w.hi)}]`; };

const TELEMETRY = ['posthog.com', 'sentry.io', 'segment.io', 'segment.com', 'mixpanel.com', 'amplitude.com', 'google-analytics.com', 'analytics.google.com', 'googletagmanager.com', 'datadoghq.com', 'honeycomb.io', 'newrelic.com', 'nr-data.net', 'launchdarkly.com', 'statsig.com', 'bugsnag.com', 'rollbar.com', 'logrocket.com', 'plausible.io', 'scarf.sh', 'rudderstack.com', 'heap.io', 'intercom.io', 'telemetry.docker.com', 'app.amplitude.com', 'browser-intake-datadoghq.com', 'o.sentry.io', 'sentry-cdn.com', 'crashlytics.com', 'firebaseio.com', 'clarity.ms', 'hotjar.com', 'umami.is', 'aptabase.com', 'eu.posthog.com', 'us.i.posthog.com', 'events.data.microsoft.com', 'play.googleapis.com', 'app-measurement.com', 'firebase-settings.crashlytics.com'];
const REGISTRIES = ['registry.npmjs.org', 'registry.yarnpkg.com', 'pypi.org', 'files.pythonhosted.org', 'npm.pkg.github.com', 'registry.npmmirror.com'];
const CODE_HOSTS = ['github.com', 'githubusercontent.com', 'gitlab.com', 'bitbucket.org', 'ghcr.io'];
const AI_APIS = ['api.openai.com', 'api.anthropic.com', 'generativelanguage.googleapis.com', 'api.mistral.ai', 'api.cohere.ai', 'openrouter.ai', 'api.groq.com', 'huggingface.co', 'api.together.xyz', 'api.deepseek.com', 'api.x.ai', 'aiplatform.googleapis.com'];

const suffixOf = (host: string, list: string[]) => list.some((s) => host === s || host.endsWith('.' + s));
function registrable(host: string): string { const p = host.split('.'); return p.length <= 2 ? host : p.slice(-2).join('.'); }
function vendorDomains(c: Cell): string[] {
  const out: string[] = [];
  for (const u of [c.websiteUrl, c.repositoryUrl]) {
    try { const h = new URL(u).hostname.toLowerCase(); if (!suffixOf(h, CODE_HOSTS)) out.push(registrable(h)); } catch { /* */ }
  }
  return out;
}
export function classifyHost(host: string, c: Cell): string {
  if (/^(\d+\.){3}\d+$/.test(host) || host.includes(':')) {
    if (host === '169.254.169.254') return 'cloud-metadata';
    if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fe80:)/.test(host)) return 'local';
    return 'ip-unresolved';
  }
  if (host === 'localhost') return 'local';
  if (suffixOf(host, TELEMETRY) || /^(telemetry|analytics|metrics|events|stats|collector|ingest|rum|usage|beacon)\./.test(host)) return 'telemetry';
  if (suffixOf(host, REGISTRIES)) return 'package-registry';
  if (suffixOf(host, CODE_HOSTS)) return 'code-host';
  if (suffixOf(host, AI_APIS)) return 'ai-api';
  const vd = vendorDomains(c);
  if (vd.some((d) => host === d || host.endsWith('.' + d))) return 'vendor-own';
  return 'other';
}

const TOOLCHAIN_PREFIX = (p: string) => p.startsWith('~/.local/lib') || p === '~/.local/bin' || p.startsWith('~/.local/bin/') || p === '~/.local' || p === '~';
const PROJECT_PREFIX = (p: string) => p === '~/proj' || p.startsWith('~/proj/');
const PM_CACHE_PREFIX = (p: string) => p.startsWith('~/.npm') || p.startsWith('~/.cache/uv') || p === '~/.cache';
const DECOY_FILES = ['~/.npmrc', '~/.ssh', '~/.aws', '~/.config/gh', '~/.config/gcloud', '~/.gitconfig', '~/.git-credentials', '~/.docker', '~/.kube', '~/.netrc', '~/.pypirc', '~/.cargo', '~/.env', '~/.claude.json', '~/.claude', '~/.cursor', '~/.codex', '~/.gemini', '~/.config/Claude', '~/.config/Code', '~/.bash_history', '~/.bashrc', '~/.profile', '~/.zshrc', '~/Documents'];
const decoyOf = (prefix: string) => DECOY_FILES.find((d) => prefix === d || prefix.startsWith(d + '/'));

function main(): void {
  const [cellsPath, outPath] = process.argv.slice(2);
  const cells: Cell[] = readFileSync(cellsPath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const L: string[] = [];
  const H = (s: string) => L.push('', s, '');
  const npm = cells.filter((c) => c.registryType === 'npm'); const pypi = cells.filter((c) => c.registryType === 'pypi');
  L.push(`# MCP: install and first start — results`, '', `Cells: ${cells.length} (npm ${npm.length}, PyPI ${pypi.length}). Generated ${new Date().toISOString().slice(0, 16)}Z. Rates with 95 % Wilson intervals.`);

  // ---------------------------------------------------------- install ----
  H('## Install');
  for (const [name, set] of [['npm', npm], ['PyPI', pypi]] as const) {
    const ok = set.filter((c) => c.install.ok);
    L.push(`- ${name}: install completed ${rate(ok.length, set.length)}; median ${median(set.map((c) => c.install.ms)) / 1000 | 0} s.`);
    const fails = set.filter((c) => !c.install.ok);
    const reasons: Record<string, number> = {};
    for (const c of fails) { const r = failReason(c); reasons[r] = (reasons[r] ?? 0) + 1; }
    if (fails.length) L.push(`  - failures: ${Object.entries(reasons).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  }
  const npmOk = npm.filter((c) => c.install.ok && c.install.npm);
  if (npmOk.length) {
    const anyScript = npmOk.filter((c) => c.install.npm.installScripts.length > 0);
    const selfScript = npmOk.filter((c) => c.install.npm.installScripts.some((s: any) => s.pkg === c.identifier));
    const native = npmOk.filter((c) => c.install.npm.nativeNodeFiles > 0);
    const gyp = npmOk.filter((c) => Object.keys(c.install.trace?.execBasenames ?? {}).some((b) => /node-gyp|prebuild-install|make|gcc|g\+\+|cc1|cmake/.test(b)));
    L.push('', `### npm (${npmOk.length} completed installs)`, '',
      `- tree with some \`preinstall\`/\`install\`/\`postinstall\`: ${rate(anyScript.length, npmOk.length)}`,
      `- the package itself declares one: ${rate(selfScript.length, npmOk.length)}`,
      `- native \`.node\` binaries present after install: ${rate(native.length, npmOk.length)}`,
      `- compiler or node-gyp/prebuild-install executed during install: ${rate(gyp.length, npmOk.length)}`,
      `- packages per tree: median ${median(npmOk.map((c) => c.install.npm.packagesInstalled))}, max ${Math.max(...npmOk.map((c) => c.install.npm.packagesInstalled))}`);
    const scriptPkgs: Record<string, number> = {};
    for (const c of npmOk) for (const s of new Set(c.install.npm.installScripts.map((s: any) => `${s.pkg} (${s.hook})`))) scriptPkgs[s as string] = (scriptPkgs[s as string] ?? 0) + 1;
    const top = Object.entries(scriptPkgs).sort((a, b) => b[1] - a[1]).slice(0, 20);
    if (top.length) L.push('', 'Packages with an install script, by number of trees they appear in:', '', ...top.map(([k, v]) => `- ${k}: ${v}`));
    const selfList = selfScript.map((c) => `- \`${c.identifier}@${c.version}\`: ${c.install.npm.installScripts.filter((s: any) => s.pkg === c.identifier).map((s: any) => `${s.hook}: \`${s.script.slice(0, 120)}\``).join('; ')}`);
    if (selfList.length) L.push('', 'Servers that declare their own install script:', '', ...selfList);
  }
  const pyOk = pypi.filter((c) => c.install.ok && c.install.pypi);
  if (pyOk.length) {
    const built = pyOk.filter((c) => c.install.pypi.builtFromSource.length > 0);
    const so = pyOk.filter((c) => c.install.pypi.soFiles > 0);
    const gcc = pyOk.filter((c) => Object.keys(c.install.trace?.execBasenames ?? {}).some((b) => /^(gcc|g\+\+|cc1|cc1plus|make|cmake|rustc|cargo)/.test(b)));
    L.push('', `### PyPI (${pyOk.length} completed installs)`, '',
      `- some distribution built from sdist (build code executed): ${rate(built.length, pyOk.length)}`,
      `- compiler executed during install: ${rate(gcc.length, pyOk.length)}`,
      `- compiled extensions (\`.so\`) in the venv: ${rate(so.length, pyOk.length)}`,
      `- distributions per venv: median ${median(pyOk.map((c) => c.install.pypi.distsInstalled))}, max ${Math.max(...pyOk.map((c) => c.install.pypi.distsInstalled))}`);
    const b: Record<string, number> = {};
    for (const c of built) for (const d of new Set(c.install.pypi.builtFromSource as string[])) b[d] = (b[d] ?? 0) + 1;
    const top = Object.entries(b).sort((x, y) => y[1] - x[1]).slice(0, 20);
    if (top.length) L.push('', 'Built from sdist:', '', ...top.map(([k, v]) => `- ${k}: ${v}`));
  }
  // network at install
  H('### Network during install');
  netSection(L, cells.filter((c) => c.install.trace), (c) => c.install.trace, 'install');
  H('### `$HOME` during install');
  homeSection(L, cells.filter((c) => c.install.trace), (c) => c.install.trace, true);

  // --------------------------------------------------------- first run ----
  H('## First start');
  const attempted = cells.filter((c) => c.firstRun.attempted);
  const withClient = attempted.filter((c) => c.firstRun.client);
  const init = withClient.filter((c) => c.firstRun.client.initializeOk);
  const tl = withClient.filter((c) => c.firstRun.client.toolsListOk);
  L.push(`- attempted: ${rate(attempted.length, cells.length)} (not attempted: ${Object.entries(count(cells.filter((c) => !c.firstRun.attempted).map((c) => c.firstRun.reason ?? '?'))).map(([k, v]) => `${k} ${v}`).join(', ') || '—'})`,
    `- \`initialize\` handshake ok: ${rate(init.length, attempted.length)} of attempted; \`tools/list\`: ${rate(tl.length, attempted.length)}`);
  for (const [name, set] of [['npm', attempted.filter((c) => c.registryType === 'npm')], ['PyPI', attempted.filter((c) => c.registryType === 'pypi')]] as const) {
    L.push(`  - ${name}: handshake ${rate(set.filter((c) => c.firstRun.client?.initializeOk).length, set.length)}`);
  }
  const noInit = withClient.filter((c) => !c.firstRun.client.initializeOk);
  const why: Record<string, number> = {};
  for (const c of noInit) { const r = noHandshakeReason(c); why[r] = (why[r] ?? 0) + 1; }
  if (noInit.length) L.push(`- no handshake (${noInit.length}): ${Object.entries(why).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  if (tl.length) {
    const tools = tl.map((c) => c.firstRun.client.toolsCount as number);
    const ann = tl.filter((c) => c.firstRun.client.annotationSummary?.withAny > 0);
    const allAnn = tl.filter((c) => c.firstRun.client.annotationSummary?.withAny === c.firstRun.client.toolsCount && c.firstRun.client.toolsCount > 0);
    const totTools = tools.reduce((a, b) => a + b, 0);
    const totAnn = tl.reduce((a, c) => a + (c.firstRun.client.annotationSummary?.withAny ?? 0), 0);
    const ro = tl.reduce((a, c) => a + (c.firstRun.client.annotationSummary?.readOnlyTrue ?? 0), 0);
    const dTrue = tl.reduce((a, c) => a + (c.firstRun.client.annotationSummary?.destructiveTrue ?? 0), 0);
    const dFalse = tl.reduce((a, c) => a + (c.firstRun.client.annotationSummary?.destructiveFalse ?? 0), 0);
    L.push('', `### Declared tools (${tl.length} servers with \`tools/list\`)`, '',
      `- tools per server: median ${median(tools)}, max ${Math.max(...tools)}; total ${totTools}`,
      `- servers with at least one annotated tool: ${rate(ann.length, tl.length)}; with all annotated: ${rate(allAnn.length, tl.length)}`,
      `- tools with some annotation: ${rate(totAnn, totTools)}; \`readOnlyHint: true\` ${ro}; \`destructiveHint: true\` ${dTrue}; \`destructiveHint: false\` ${dFalse}`);
  }
  H('### Network at first start');
  netSection(L, attempted.filter((c) => c.firstRun.trace), (c) => c.firstRun.trace, 'first start');
  H('### `$HOME` at first start');
  homeSection(L, attempted.filter((c) => c.firstRun.trace), (c) => c.firstRun.trace, false);

  // ------------------------------------------------ cluster-robust intervals ----
  // Publisher = GitHub/GitLab owner from repositoryUrl, else the registry namespace.
  // Cells from one publisher are not independent (same template, same SDK pin),
  // so the headline rates are repeated with a cluster-robust variance and the
  // design effect (robust variance / iid variance). See verification.md §1.
  H('## Cluster-robust intervals by publisher');
  L.push('| rate | k/n | Wilson (iid) | cluster-robust | DEFF | clusters |', '|---|---|---|---|---|---|');
  const TEL = new Set(['us.i.posthog.com', 'play.googleapis.com', 'mobile.events.data.microsoft.com', 'usage.gistrec.cloud']);
  const fh = (c: Cell) => (c.firstRun.trace?.net.hosts ?? []) as any[];
  const fhome = (c: Cell) => (c.firstRun.trace?.home ?? []) as any[];
  const pyAtt = attempted.filter((c) => c.registryType === 'pypi');
  const rows: [string, Cell[], (c: Cell) => boolean][] = [
    ['npm: tree with an install script', npmOk, (c) => c.install.npm.installScripts.length > 0],
    ['first start: handshake ok', attempted, (c) => Boolean(c.firstRun.client?.initializeOk)],
    ['PyPI: broken by mcp 2.x', pyAtt, (c) => /mcp\.server\.fastmcp|this is mcp 2\.x/i.test(c.firstRun.client?.stderrTail ?? '')],
    ['PyPI: pypi.org at start (fastmcp)', pyAtt, (c) => fh(c).some((h) => h.host === 'pypi.org')],
    ['first start: any egress', attempted, (c) => fh(c).length > 0],
    ['first start: telemetry', attempted, (c) => fh(c).some((h) => TEL.has(h.host))],
    ['first start: decoy opened', attempted, (c) => fhome(c).some((h) => h.contentAccessed && decoyOf(h.prefix))],
    ['first start: ~/.env read', attempted, (c) => fhome(c).some((h) => h.prefix === '~/.env' && h.contentAccessed)],
  ];
  for (const [name, set, f] of rows) {
    if (!set.length) continue;
    const r = clusterRobust(set.map((c) => [publisherKey(c), f(c) ? 1 : 0]));
    L.push(`| ${name} | ${r.k}/${r.n} | ${pct(r.p)} [${pct(wilson(r.k, r.n).lo)}–${pct(wilson(r.k, r.n).hi)}] | [${pct(Math.max(0, r.p - 1.96 * r.se))}–${pct(Math.min(1, r.p + 1.96 * r.se))}] | ${r.deff.toFixed(2)} | ${r.clusters} |`);
  }

  writeFileSync(outPath, L.join('\n') + '\n');
  console.log(`wrote ${outPath}: ${cells.length} cells`);
}

function netSection(L: string[], cells: Cell[], get: (c: Cell) => any, label: string): void {
  const withNet = cells.filter((c) => get(c).net.hosts.length > 0);
  L.push(`- cells with at least one outbound connection (DNS excluded) at ${label}: ${rate(withNet.length, cells.length)}`);
  const cat: Record<string, Set<string>> = {};
  const hostCells: Record<string, { n: number; cat: string; ports: Set<number>; progs: Set<string> }> = {};
  for (const c of cells) for (const h of get(c).net.hosts) {
    const k = classifyHost(h.host, c);
    (cat[k] ??= new Set()).add(c.id);
    const e = (hostCells[h.host] ??= { n: 0, cat: k, ports: new Set(), progs: new Set() });
    e.n++; for (const p of h.ports) e.ports.add(p); for (const p of h.programs ?? []) e.progs.add(p);
  }
  const order = ['package-registry', 'code-host', 'vendor-own', 'ai-api', 'telemetry', 'cloud-metadata', 'local', 'other', 'ip-unresolved'];
  L.push('', '| category | cells | rate |', '|---|---|---|');
  for (const k of order) if (cat[k]) L.push(`| ${k} | ${cat[k].size} | ${rate(cat[k].size, cells.length)} |`);
  const hosts = Object.entries(hostCells).sort((a, b) => b[1].n - a[1].n);
  const interesting = hosts.filter(([, v]) => v.cat !== 'package-registry');
  if (interesting.length) {
    L.push('', 'Hosts outside the package registries (cells, category, ports, program):', '');
    for (const [h, v] of interesting.slice(0, 80)) L.push(`- ${h} — ${v.n} · ${v.cat} · ${[...v.ports].join(',')} · ${[...v.progs].slice(0, 3).join(',')}`);
    if (interesting.length > 80) L.push(`- … ${interesting.length - 80} more`);
  }
  const reg = hosts.filter(([, v]) => v.cat === 'package-registry');
  if (reg.length) L.push('', `Package registries: ${reg.map(([h, v]) => `${h} ${v.n}`).join(' · ')}`);
}

function homeSection(L: string[], cells: Cell[], get: (c: Cell) => any, isInstall: boolean): void {
  const n = cells.length;
  const byPrefix: Record<string, { content: Set<string>; write: Set<string>; probe: Set<string>; samples: Set<string> }> = {};
  const decoyHits: Record<string, Set<string>> = {};
  for (const c of cells) for (const h of get(c).home as any[]) {
    const p = h.prefix;
    if (TOOLCHAIN_PREFIX(p) || PROJECT_PREFIX(p)) continue;
    const e = (byPrefix[p] ??= { content: new Set(), write: new Set(), probe: new Set(), samples: new Set() });
    if (h.contentAccessed) { e.content.add(c.id); for (const s of h.samplePaths ?? []) e.samples.add(s); }
    if (h.writes > 0 || h.mutations > 0) e.write.add(c.id);
    e.probe.add(c.id);
    const d = decoyOf(p);
    if (d && h.contentAccessed) (decoyHits[d] ??= new Set()).add(c.id);
  }
  const anyDecoy = new Set<string>(); for (const s of Object.values(decoyHits)) for (const id of s) anyDecoy.add(id);
  const anyOutside = new Set<string>();
  for (const c of cells) for (const h of get(c).home as any[]) if (h.contentAccessed && !TOOLCHAIN_PREFIX(h.prefix) && !PROJECT_PREFIX(h.prefix) && !PM_CACHE_PREFIX(h.prefix)) anyOutside.add(c.id);
  L.push(`- cells that open content under \`$HOME\` outside the project, the toolchain and the package-manager cache: ${rate(anyOutside.size, n)}`,
    `- cells that read or write a decoy file (credentials, agent configs, shell): ${rate(anyDecoy.size, n)}`);
  if (isInstall) L.push(`  - note: the package manager reads \`~/.npmrc\` and \`~/.gitconfig\` by itself (norte-guard baseline); at install that read cannot be attributed to the package.`);
  const rows = Object.entries(byPrefix).filter(([, v]) => v.content.size > 0 || v.write.size > 0).sort((a, b) => (b[1].content.size + b[1].write.size) - (a[1].content.size + a[1].write.size));
  L.push('', '| prefix | content opened (cells) | written (cells) | probed (cells) | examples |', '|---|---|---|---|---|');
  for (const [p, v] of rows.slice(0, 60)) L.push(`| \`${p}\` | ${v.content.size} | ${v.write.size} | ${v.probe.size} | ${[...v.samples].slice(0, 3).map((s) => `\`${s}\``).join(' ')} |`);
  const probedOnly = Object.entries(byPrefix).filter(([, v]) => v.content.size === 0 && v.write.size === 0 && v.probe.size >= 3).sort((a, b) => b[1].probe.size - a[1].probe.size).slice(0, 25);
  if (probedOnly.length) L.push('', `Probed only (stat/ENOENT, no content), ≥3 cells: ${probedOnly.map(([p, v]) => `\`${p}\` ${v.probe.size}`).join(' · ')}`);
  if (Object.keys(decoyHits).length) L.push('', 'Decoys with content opened, by cells:', '', ...Object.entries(decoyHits).sort((a, b) => b[1].size - a[1].size).map(([d, s]) => `- \`${d}\`: ${s.size}${s.size <= 6 ? ` (${[...s].map((x) => x.split('::')[1]).join(', ')})` : ''}`));
}

export function publisherKey(c: Cell): string {
  const m = /^https?:\/\/(github\.com|gitlab\.com)\/([^/]+)\//i.exec(c.repositoryUrl ?? '');
  return m ? `${m[1].toLowerCase()}/${m[2].toLowerCase()}` : `ns:${c.namespace}`;
}
export function clusterRobust(rows: [string, number][]): { k: number; n: number; p: number; se: number; deff: number; clusters: number } {
  const n = rows.length; const k = rows.reduce((a, [, y]) => a + y, 0); const p = k / n;
  const cl = new Map<string, number>();
  for (const [key, y] of rows) cl.set(key, (cl.get(key) ?? 0) + (y - p));
  let vr = 0; for (const s of cl.values()) vr += s * s; vr /= n * n;
  const vi = p * (1 - p) / n;
  return { k, n, p, se: Math.sqrt(vr), deff: vi > 0 ? vr / vi : NaN, clusters: cl.size };
}
function failReason(c: Cell): string {
  const s = (c.install.stderrTail ?? '').toLowerCase();
  if (c.install.signal === 'SIGKILL') return 'timeout';
  if (/requires-python|requires python|python_version|no interpreter found/.test(s)) return 'Python version';
  if (/build backend|failed to build|error: subprocess-exited|build failures/.test(s)) return 'build failure (sdist)';
  if (/no solution found|not found in the package registry|no matching distribution|could not find a version|no versions/.test(s)) return 'version missing from the package registry';
  if (/404|e404|not found/.test(s)) return 'package does not exist (404)';
  if (/etarget|no matching version/.test(s)) return 'version missing from the package registry';
  if (/eresolve|peer dep/.test(s)) return 'dependency conflict';
  if (/gyp|node-gyp|prebuild/.test(s)) return 'build failure (node-gyp)';
  if (/network|enotfound|econnreset|etimedout|fetch failed/.test(s)) return 'network';
  if (/ebadengine|unsupported engine/.test(s)) return 'unsupported engine';
  return 'other';
}
function noHandshakeReason(c: Cell): string {
  const cl = c.firstRun.client; const err = ((cl.stderrTail ?? '') + ' ' + (c.firstRun.stderrTail ?? '')).toLowerCase(); const first = (cl.firstStdoutLine ?? '').toLowerCase();
  if (!cl.spawned) return 'did not start';
  if (/usage:|--help|options:|commands:/.test(first) || /usage:/.test(err)) return 'prints usage (subcommand/arguments missing)';
  if (/mcp\.server\.fastmcp|this is mcp 2\.x/.test(err)) return 'broken by mcp 2.x (FastMCP renamed; dependency unpinned)';
  if (/modulenotfounderror|cannot find module|no module named|err_module_not_found/.test(err)) return 'module not found';
  if (/environment variable|env var|api[_ ]key|token|missing required|is required|not set/.test(err)) return 'requires a variable/credential';
  if (/econnrefused|connection refused|could not connect|connect(ion)? error|getaddrinfo|enotfound/.test(err)) return 'fails to connect to a service';
  if (/syntaxerror|typeerror|traceback|error:/.test(err)) return 'exception at start';
  if (cl.exitedEarly && cl.exitCode === 0) return 'exited without speaking MCP';
  if (cl.exitedEarly) return `exited with code ${cl.exitCode ?? cl.signal}`;
  return 'no response (alive, no JSON-RPC)';
}
function median(xs: number[]): number { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }
function count(xs: string[]): Record<string, number> { const o: Record<string, number> = {}; for (const x of xs) o[x] = (o[x] ?? 0) + 1; return o; }

main();
