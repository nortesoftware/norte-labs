// Aggregate results/cells-<arm>.ndjson into results/report.md.
//
// Every rate is n/N with a 95 % Wilson interval; N is the population (the run
// covers whole registries), so the interval is for the reader who treats the
// day as a draw. Hosts are attributed by DNS answer; paths under $HOME by
// two-level prefix (trace.ts). The npm client's own reads (~/.npmrc, ~/.npm,
// the Node runtime under ~/.local/lib) and git's (~/.gitconfig) are baseline,
// not attributable to the package, and are listed apart.
//
// Usage: node report.ts <results-dir> <out.md>

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { gunzipSync } from 'node:zlib';

const [dir, out] = process.argv.slice(2);
const ARMS = ['acp', 'cursor', 'devin', 'zed', 'openvsx'] as const;
type Cell = any;

function wilson(k: number, n: number): string {
  if (n === 0) return '—';
  const z = 1.959964; const p = k / n;
  const den = 1 + z * z / n; const c = p + z * z / (2 * n); const h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return `${(100 * p).toFixed(1)} % [${(100 * (c - h) / den).toFixed(1)}–${(100 * (c + h) / den).toFixed(1)}]`;
}
const rate = (k: number, n: number) => `${k}/${n} = ${wilson(k, n)}`;

// Paths the tooling touches on its own: npm's config, cache and update check;
// node's module resolution walking up to $HOME; git's repository discovery
// walking up; curl's rc file; the Node runtime bound under ~/.local/lib.
const BASELINE_PREFIXES = new Set(['~/.npmrc', '~/.npm', '~/.npm/_cacache', '~/.npm/_logs', '~/.npm/_npx', '~/.npm/_update-notifier-last-checked', '~/.local', '~/.local/lib', '~/.local/bin', '~/.local/share', '~/.cache/uv', '~/.gitconfig', '~/.config/git', '~/.git', '~/proj/.git', '~/.curlrc', '~/package.json', '~/node_modules', '~/.node_modules', '~/.node_libraries', '~', '~/proj', '~/proj/node_modules', '~/proj/package.json', '~/proj/package-lock.json', '~/proj/npm-shrinkwrap.json', '~/proj/yarn.lock', '~/proj/.npmrc', '~/proj/.venv', '~/proj/agent', '~/proj/plugin', '~/proj/data', '~/.cache', '~/.cache/bun', '~/.bun', '~/.config', '~/.jq', '~/jq', '~/jq/main.jq', '~/.config/uv', '~/uv.toml', '~/proj/uv.toml', '~/pyproject.toml', '~/proj/pyproject.toml', '~/.npm/node_modules', '~/node_modules/.bin', '~/.cursor/plugin-data']);
const CREDENTIAL_PREFIXES = ['~/.ssh', '~/.aws', '~/.config/gh', '~/.netrc', '~/.git-credentials', '~/.env', '~/.docker', '~/.kube', '~/.pypirc', '~/.cargo', '~/.config/gcloud', '~/.claude', '~/.claude.json', '~/.cursor', '~/.codex', '~/.gemini', '~/.config/Claude', '~/.config/anthropic', '~/.bash_history', '~/Documents', '~/.zshrc', '~/.bashrc', '~/.profile'];
const AGENT_CONFIG_PREFIXES = ['~/.claude', '~/.claude.json', '~/.cursor', '~/.codex', '~/.gemini', '~/.config/Claude', '~/.config/zed', '~/.config/Code'];
const TELEMETRY_HOSTS = /posthog|segment\.io|sentry\.io|ingest\.sentry|mixpanel|amplitude|google-analytics|googletagmanager|clearcut|play\.googleapis|datadoghq|bugsnag|statsig|launchdarkly|unleash|telemetry|analytics|honeycomb|newrelic|logrocket|hotjar|intercom|vercel-insights|plausible|umami|rudderstack|\.rum\.|rum\.aliyuncs|dc\.services\.visualstudio\.com|applicationinsights|\bingest\./i;

const isProductEndpoint = (h: string) => /^mcp\./.test(h);
const isCredPath = (p: string) => CREDENTIAL_PREFIXES.some((c) => p === c || p.startsWith(c + '/'));
const isAgentConfig = (p: string) => AGENT_CONFIG_PREFIXES.some((c) => p === c || p.startsWith(c + '/'));

interface TraceAgg { hosts: Map<string, Set<string>>; telemetryHosts: Map<string, Set<string>>; credReads: Map<string, Set<string>>; agentWrites: Map<string, Set<string>>; execs: Map<string, Set<string>>; otherHome: Map<string, Set<string>> }
const newAgg = (): TraceAgg => ({ hosts: new Map(), telemetryHosts: new Map(), credReads: new Map(), agentWrites: new Map(), execs: new Map(), otherHome: new Map() });
function add(m: Map<string, Set<string>>, k: string, id: string): void { if (!m.has(k)) m.set(k, new Set()); m.get(k)!.add(id); }
function aggregate(agg: TraceAgg, trace: any, id: string, execIgnore: Set<string>): void {
  if (!trace) return;
  for (const h of trace.net?.hosts ?? []) {
    const name = h.host ?? h.ip ?? '?';
    add(agg.hosts, name, id);
    if (TELEMETRY_HOSTS.test(name) && !isProductEndpoint(name)) add(agg.telemetryHosts, name, id);
  }
  for (const h of trace.home ?? []) {
    const p = h.prefix;
    const reads = (h.reads ?? 0) + (h.opens ?? 0);
    if (isCredPath(p) && reads > 0) add(agg.credReads, p, id);
    if (isAgentConfig(p) && (h.writes ?? 0) > 0) add(agg.agentWrites, p, id);
    if (!BASELINE_PREFIXES.has(p) && !isCredPath(p) && !isAgentConfig(p)) add(agg.otherHome, p, id);
  }
  for (const [b, n] of Object.entries<number>(trace.execBasenames ?? {})) if (!execIgnore.has(b)) add(agg.execs, b, id);
}
const top = (m: Map<string, Set<string>>, n = 25) => [...m.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, n).map(([k, v]) => `${k} (${v.size}: ${[...v].slice(0, 6).join(', ')}${v.size > 6 ? ', …' : ''})`);

// The openvsx cells are 29 MB of trace summaries against about a megabyte for
// each of the other arms, so they are stored compressed; either form is read.
function load(arm: string): Cell[] {
  const p = join(dir, `cells-${arm}.ndjson`);
  const gz = `${p}.gz`;
  const text = existsSync(p) ? readFileSync(p, 'utf8') : existsSync(gz) ? gunzipSync(readFileSync(gz)).toString('utf8') : null;
  if (text === null) return [];
  return text.split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

const L: string[] = [];
L.push('# agent-plugins — generated report', '', `Generated ${new Date().toISOString()} from \`results/cells-<arm>.ndjson\`. Rates are n/N with 95 % Wilson intervals; N is the population.`, '');

// The Open VSX arm is a seeded sample and its cells carry two traces (the whole
// editor and the extension host's subtree). What the editor does on its own is
// measured by the baseline cells (driver alone) and subtracted here, not assumed.
const median = (xs: number[]) => { if (!xs.length) return NaN; const a = [...xs].sort((x, y) => x - y); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const quantile = (xs: number[], q: number) => { if (!xs.length) return NaN; const a = [...xs].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(q * a.length))]; };
const hostName = (h: any) => h.host ?? h.ip ?? '?';
function reportOpenVsx(all: Cell[]): void {
  const base = all.filter((c) => c.declared?.baseline);
  const cells = all.filter((c) => !c.declared?.baseline);
  L.push(`## openvsx — ${cells.length} sampled extensions, ${base.length} baseline runs`, '');
  const baseHosts = new Set<string>(); const baseExtPrefixes = new Set<string>(); const baseAllPrefixes = new Set<string>(); const baseExecs = new Set<string>();
  for (const b of base) {
    for (const h of b.firstRun?.trace?.net?.hosts ?? []) baseHosts.add(hostName(h));
    for (const h of b.firstRun?.trace?.home ?? []) baseAllPrefixes.add(h.prefix);
    for (const h of b.firstRun?.extHost?.home ?? []) baseExtPrefixes.add(h.prefix);
    for (const e of b.firstRun?.extHost?.execs ?? []) baseExecs.add(basename(e.argv[0]));
  }
  // the workspace, the extension's own directory and node's module resolution
  // walking up to $HOME are what running an extension is, not something it does
  const isEditorPath = (p: string) => p === '~' || p.startsWith('~/proj') || p.startsWith('~/node_modules') || p.startsWith('~/.vscode-oss') || p === '~/package.json' || p === '~/driver.json' || baseExtPrefixes.has(p);
  // ripgrep (the editor's findFiles) and git look for ignore files and a
  // repository in the parents of the workspace, which here is $HOME: a probe of
  // these names with nothing read is the tool's walk, not the extension's
  const TOOL_WALK = new Set(['~/.jj', '~/.rgignore', '~/.ignore', '~/.gitignore', '~/.git', '~/.git/info', '~/.git/HEAD', '~/HEAD', '~/.config/git', '~/.svn', '~/.hg']);
  // loopback is the extension talking to a process of its own (a language
  // server, a local port), not the network
  const isLoopback = (h: string) => h === '127.0.0.1' || h === '0:0:0:0:0:0:0:1' || h === 'localhost' || h.startsWith('127.');
  L.push(`- baseline (editor with the driver alone, ${base.length} runs): hosts ${[...baseHosts].sort().join(', ') || 'none'}; \`$HOME\` prefixes touched by the extension host: ${baseExtPrefixes.size} (outside the workspace: ${[...baseExtPrefixes].filter((p) => !p.startsWith('~/proj')).sort().join(', ') || 'none'}); by the whole editor: ${baseAllPrefixes.size}; programs the extension host executed: ${[...baseExecs].sort().join(', ') || 'none'}`);
  const withApi = cells.filter((c) => c.declared?.version);
  const withUrl = cells.filter((c) => c.install?.vsix);
  const downloaded = withUrl.filter((c) => c.install.vsix.sha256Actual);
  const installOk = cells.filter((c) => c.install?.ok);
  const attempted = cells.filter((c) => c.firstRun?.attempted);
  const drv = attempted.filter((c) => c.firstRun.driver);
  const found = drv.filter((c) => c.firstRun.driver.found);
  const activated = found.filter((c) => c.firstRun.driver.activated === true);
  const actFailed = found.filter((c) => c.firstRun.driver.activated === false);
  L.push(`- sample: ${cells.length} drawn; registry record present: ${withApi.length}; with a linux-x64 or universal download: ${withUrl.length}; downloaded: ${downloaded.length}; installed by the editor: ${rate(installOk.length, downloaded.length || 1)}; activation attempted (declares \`main\` or \`browser\`): ${attempted.length}; editor ran to the end and wrote the driver record: ${rate(drv.length, attempted.length || 1)}; extension visible to the editor: ${found.length}; activated without error: ${rate(activated.length, found.length || 1)}; activation threw or timed out: ${actFailed.length}${actFailed.length ? ` (${actFailed.slice(0, 15).map((c) => `${c.subject}: ${String(c.firstRun.driver.error ?? '').split('\n')[0].slice(0, 70)}`).join('; ')})` : ''}`);
  const notAttempted = cells.filter((c) => !c.firstRun?.attempted); const reasons = new Map<string, number>(); for (const c of notAttempted) reasons.set(String(c.firstRun?.reason ?? c.install?.stderrTail ?? '?').slice(0, 60), (reasons.get(String(c.firstRun?.reason ?? c.install?.stderrTail ?? '?').slice(0, 60)) ?? 0) + 1);
  L.push(`- not run: ${[...reasons.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join('; ') || 'none'}`);
  const errs = cells.filter((c) => c.install?.signal === 'HARNESS_ERROR'); if (errs.length) L.push(`- harness errors: ${errs.length} (${errs.map((c) => c.id).join(', ')})`);
  const actMs = activated.map((c) => c.firstRun.driver.activateMs as number);
  L.push(`- activation time: median ${median(actMs)} ms, p90 ${quantile(actMs, 0.9)} ms; editor run wall time median ${median(attempted.map((c) => c.firstRun.ms as number))} ms`);
  // what the VSIX ships and declares
  const inv = downloaded.filter((c) => c.install.inventory);
  const bytes = inv.map((c) => c.install.vsix.bytes as number);
  // The registry publishes one digest per extension record, for its default
  // download. A platform-specific extension was fetched at its linux-x64 URL,
  // so its bytes are not the ones that digest covers: the comparison holds
  // only for the universal downloads and the rest are counted apart.
  const universal = downloaded.filter((c) => c.install.vsix.targetPlatform !== 'linux-x64');
  const platform = downloaded.filter((c) => c.install.vsix.targetPlatform === 'linux-x64');
  const sha = { match: universal.filter((c) => c.install.vsix.sha256Match === true).length, mismatch: universal.filter((c) => c.install.vsix.sha256Match === false).length, none: universal.filter((c) => c.install.vsix.sha256Match === null).length };
  L.push(`- VSIX: bytes median ${median(bytes)}, p90 ${quantile(bytes, 0.9)}; registry sha256 over the ${universal.length} universal downloads: matching ${sha.match}, mismatching ${sha.mismatch}, not published ${sha.none}; the ${platform.length} platform-specific downloads are not covered by the published digest and are not compared`);
  const bins = inv.filter((c) => c.install.inventory.binaries.length > 0);
  const byMagic = new Map<string, Set<string>>(); for (const c of bins) for (const b of c.install.inventory.binaries) add(byMagic, b.magic, c.subject);
  const native = inv.filter((c) => c.install.inventory.nativeNodeFiles > 0);
  const nm = inv.filter((c) => c.install.inventory.nodeModulesShipped);
  const scripts = inv.filter((c) => Object.keys(c.install.inventory.scripts).length > 0);
  L.push(`- ships a binary by magic: ${rate(bins.length, inv.length)} — ${[...byMagic.entries()].map(([k, v]) => `${k} ${v.size}`).join(', ') || 'none'}; native \`.node\` files: ${rate(native.length, inv.length)}; ships node_modules: ${rate(nm.length, inv.length)} (bundled packages median ${median(nm.map((c) => c.install.inventory.packagesBundled))}); ships shell/python/other scripts: ${rate(scripts.length, inv.length)}`);
  const man = inv.filter((c) => c.install.manifest); const m = (c: Cell) => c.install.manifest;
  const nodeOnly = man.filter((c) => m(c).main && !m(c).browser), webOnly = man.filter((c) => !m(c).main && m(c).browser), both = man.filter((c) => m(c).main && m(c).browser), neither = man.filter((c) => !m(c).main && !m(c).browser);
  L.push(`- entry points: node \`main\` only ${rate(nodeOnly.length, man.length)}; \`browser\` only (runs in the web worker host, outside the extension host's subtree) ${rate(webOnly.length, man.length)}; both ${both.length}; neither (themes, packs, snippets, keymaps) ${rate(neither.length, man.length)}`);
  const ev = (c: Cell): string[] => m(c).activationEvents ?? [];
  const star = man.filter((c) => ev(c).includes('*')), startup = man.filter((c) => ev(c).some((e: string) => e === 'onStartupFinished')), onLang = man.filter((c) => ev(c).some((e: string) => e.startsWith('onLanguage'))), wsc = man.filter((c) => ev(c).some((e: string) => e.startsWith('workspaceContains'))), cmdOnly = man.filter((c) => ev(c).length > 0 && ev(c).every((e: string) => e.startsWith('onCommand') || e.startsWith('onView') || e.startsWith('onUri') || e.startsWith('onWebviewPanel'))), none = man.filter((c) => ev(c).length === 0 && (m(c).main || m(c).browser));
  L.push(`- activation events (of ${man.length} manifests): \`*\` ${rate(star.length, man.length)}; \`onStartupFinished\` ${rate(startup.length, man.length)}; either (runs at every editor start) ${rate(new Set([...star, ...startup]).size, man.length)}; \`onLanguage\` ${rate(onLang.length, man.length)}; \`workspaceContains\` ${rate(wsc.length, man.length)}; only on a command, view or URI ${rate(cmdOnly.length, man.length)}; none declared with an entry point (implicit from \`contributes\` since VS Code 1.74) ${none.length}`);
  const deps = man.filter((c) => (m(c).extensionDependencies ?? []).length > 0), packs = man.filter((c) => (m(c).extensionPack ?? []).length > 0), kind = new Map<string, number>(); for (const c of man) { const k = (m(c).extensionKind ?? ['(not declared)']).join('+'); kind.set(k, (kind.get(k) ?? 0) + 1); }
  const proposals = man.filter((c) => (m(c).enabledApiProposals ?? []).length > 0);
  L.push(`- declares extensionDependencies: ${rate(deps.length, man.length)}; is an extension pack: ${rate(packs.length, man.length)}; extensionKind: ${[...kind.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}; enabledApiProposals: ${proposals.length}`);
  // install: the editor's own work with a new VSIX
  const fetched = installOk.filter((c) => (c.install.extensionsInstalled ?? []).length > 1);
  const ia = newAgg(); for (const c of installOk) aggregate(ia, c.install?.trace, c.subject, new Set(['codium']));
  L.push(`- install (\`codium --install-extension\`, the editor unpacks the VSIX and resolves declared dependencies from the gallery): more than one extension present afterwards ${rate(fetched.length, installOk.length || 1)}${fetched.length ? ` (${fetched.slice(0, 10).map((c) => `${c.subject} → ${c.install.extensionsInstalled.length}`).join(', ')}${fetched.length > 10 ? ', …' : ''})` : ''}; hosts contacted (cells): ${top(ia.hosts, 10).join('; ') || 'none'}; programs executed beyond the editor: ${top(ia.execs, 10).join('; ') || 'none'}`);
  // first run: the extension host's subtree, baseline subtracted
  const xa = newAgg(); const wa = newAgg();
  const sysExecs = new Map<string, Set<string>>(); const extExecs = new Map<string, Set<string>>(); const procCounts: number[] = [];
  const extHostIgnore = new Set([...baseExecs]);
  for (const c of activated) {
    const x = c.firstRun.extHost; if (!x) continue;
    aggregate(xa, x, c.subject, extHostIgnore);
    procCounts.push(c.firstRun.extHostProcesses ?? 1);
    for (const e of x.execs ?? []) {
      if (e.origin === 'system') add(sysExecs, basename(e.argv[0]), c.subject);
      if (e.origin === 'extension') add(extExecs, c.subject, e.argv.slice(0, 3).map((a: string) => basename(a)).join(' '));
    }
    aggregate(wa, c.firstRun.trace, c.subject, new Set(['codium', 'exe', 'codium-tunnel', 'rg']));
  }
  const nonBase = (mm: Map<string, Set<string>>, baseSet: Set<string>) => new Map([...mm.entries()].filter(([k]) => !baseSet.has(k) && !isLoopback(k)));
  const xHosts = nonBase(xa.hosts, baseHosts);
  const loopCells = new Set([...xa.hosts.entries()].filter(([k]) => isLoopback(k)).flatMap(([, v]) => [...v]));
  // $HOME beyond the baseline, split by whether content was read or written or
  // the path was only looked for (stat, open that failed)
  const xHome = new Map<string, Set<string>>(); const xProbe = new Map<string, Set<string>>();
  for (const c of activated) for (const h of c.firstRun.extHost?.home ?? []) {
    const p = h.prefix; if (isEditorPath(p) || isCredPath(p) || isAgentConfig(p)) continue;
    // contentAccessed is an open for reading or writing that succeeded; a
    // mutation is a mkdir, rename, unlink or chmod that the trace saw succeed
    const content = h.contentAccessed || (h.mutations ?? 0) > 0;
    if (content) add(xHome, p, c.subject); else if (!TOOL_WALK.has(p)) add(xProbe, p, c.subject);
  }
  const wsWrites = new Map<string, Set<string>>(); const envReads = new Set<string>();
  for (const c of activated) for (const h of c.firstRun.extHost?.home ?? []) {
    if (h.prefix.startsWith('~/proj') && ((h.writes ?? 0) + (h.mutations ?? 0)) > 0) add(wsWrites, h.prefix, c.subject);
    if (h.prefix === '~/proj/.env' && (h.reads ?? 0) > 0 && h.contentAccessed) envReads.add(c.subject);
  }
  const netCells = new Set([...xHosts.values()].flatMap((s) => [...s]));
  // loopback and nothing beyond the editor's own hosts
  const loopOnly = [...loopCells].filter((s) => !netCells.has(s));
  L.push(`- first run, extension host and its children (${activated.length} activated; processes in the subtree median ${median(procCounts)}, max ${Math.max(0, ...procCounts)}): contacted a host beyond the editor's own ${rate(netCells.size, activated.length || 1)}; hosts (cells): ${top(xHosts, 40).join('; ') || 'none'}; loopback and no host beyond the baseline: ${loopOnly.length} (any loopback host: ${loopCells.size})`);
  const telCells = new Set([...xa.telemetryHosts.values()].flatMap((s) => [...s]));
  L.push(`- first run: telemetry-looking hosts: ${top(xa.telemetryHosts).join('; ') || 'none'} — ${rate(telCells.size, activated.length || 1)}`);
  const credRead = new Map<string, Set<string>>(); const agentWrite = new Map<string, Set<string>>();
  for (const c of activated) for (const h of c.firstRun.extHost?.home ?? []) {
    if (isCredPath(h.prefix) && h.contentAccessed && (h.reads ?? 0) > 0) add(credRead, h.prefix, c.subject);
    if (isAgentConfig(h.prefix) && h.contentAccessed && (h.writes ?? 0) > 0) add(agentWrite, h.prefix, c.subject);
  }
  const credCells = new Set([...credRead.values()].flatMap((s) => [...s]));
  L.push(`- first run: credential or agent-config paths opened and read: ${top(credRead, 30).join('; ') || 'none'} — ${rate(credCells.size, activated.length || 1)}`);
  L.push(`- first run: agent-config paths opened for writing: ${top(agentWrite).join('; ') || 'none'}`);
  const sysCells = new Set([...sysExecs.values()].flatMap((s) => [...s]));
  L.push(`- first run: system programs executed (cells): ${top(sysExecs, 40).join('; ') || 'none'} — ${rate(sysCells.size, activated.length || 1)}; extensions that ran a program they ship: ${rate(extExecs.size, activated.length || 1)}${extExecs.size ? ` (${[...extExecs.entries()].slice(0, 25).map(([k, v]) => `${k}: ${[...v].slice(0, 2).join(' | ')}`).join('; ')}${extExecs.size > 25 ? '; …' : ''})` : ''}`);
  const homeCells = new Set([...xHome.values()].flatMap((s) => [...s]));
  L.push(`- first run: other \`$HOME\` paths read, written or created beyond the baseline and the workspace (cells): ${top(xHome, 40).join('; ') || 'none'} — ${rate(homeCells.size, activated.length || 1)}`);
  const probeCells = new Set([...xProbe.values()].flatMap((s) => [...s]));
  L.push(`- first run: \`$HOME\` paths only looked for (stat or a failed open; ripgrep's and git's walk up from the workspace excluded): ${top(xProbe, 40).join('; ') || 'none'} — ${rate(probeCells.size, activated.length || 1)}`);
  const credProbe = new Map<string, Set<string>>();
  for (const c of activated) for (const h of c.firstRun.extHost?.home ?? []) if ((isCredPath(h.prefix) || isAgentConfig(h.prefix)) && !h.contentAccessed && !(h.mutations > 0)) add(credProbe, h.prefix, c.subject);
  L.push(`- first run: credential or agent-config paths only looked for: ${top(credProbe, 30).join('; ') || 'none'}`);
  const failKinds = new Map<string, Set<string>>();
  for (const c of actFailed) { const e = String(c.firstRun.driver.error ?? ''); add(failKinds, /timeout after/.test(e) ? 'timed out (60 s)' : /Cannot find module/.test(e) ? 'missing module' : /depends on/.test(e) ? 'unmet extension dependency' : 'threw', c.subject); }
  L.push(`- activation failures by kind: ${[...failKinds.entries()].map(([k, v]) => `${k} ${v.size} (${[...v].slice(0, 8).join(', ')}${v.size > 8 ? ', …' : ''})`).join('; ') || 'none'}`);
  const wsCells = new Set([...wsWrites.values()].flatMap((s) => [...s]));
  L.push(`- first run: wrote or created files in the workspace: ${top(wsWrites, 20).join('; ') || 'none'} — ${rate(wsCells.size, activated.length || 1)}; read the workspace's \`.env\` content: ${envReads.size}${envReads.size ? ` (${[...envReads].slice(0, 20).join(', ')})` : ''}`);
  const wHosts = nonBase(wa.hosts, baseHosts); const wOnly = new Map([...wHosts.entries()].filter(([k]) => !xHosts.has(k)));
  L.push(`- first run, whole editor: hosts beyond the baseline not seen from the extension host's subtree (the web worker host, webviews and the editor's fetches on the extension's behalf): ${top(wOnly, 30).join('; ') || 'none'}`);
  // the join with the declaration
  const everyStart = new Set([...star, ...startup].map((c) => c.subject));
  const netAtStart = [...netCells].filter((s) => everyStart.has(s));
  const sysAtStart = [...sysCells].filter((s) => everyStart.has(s));
  L.push(`- declared vs observed: of the ${netCells.size} that contacted the network at activation, ${netAtStart.length} declare \`*\` or \`onStartupFinished\` (they do it at every editor start); of the ${sysCells.size} that executed a system program, ${sysAtStart.length}`);
  L.push('');
}

for (const arm of ARMS) {
  const cells = load(arm);
  if (!cells.length) continue;
  if (arm === 'openvsx') { reportOpenVsx(cells); continue; }
  L.push(`## ${arm} — ${cells.length} cells`, '');
  const subjects = new Set(cells.map((c) => c.subject));
  const installOk = cells.filter((c) => c.install?.ok);
  const attempted = cells.filter((c) => c.firstRun?.attempted);
  const handshake = cells.filter((c) => c.firstRun?.client?.initializeOk);
  if (arm === 'cursor' || arm === 'devin') L.push(`- subjects: ${subjects.size}; fetched at the pinned commit: ${rate(installOk.length, cells.length)}; cells with something to run (a stdio MCP server or a hook): ${attempted.length}`);
  else L.push(`- subjects: ${subjects.size}; install ok: ${rate(installOk.length, cells.length)}; first run attempted: ${attempted.length}; protocol handshake ok: ${rate(handshake.length, attempted.length || 1)} of attempted`);
  const errs = cells.filter((c) => c.install?.signal === 'HARNESS_ERROR');
  if (errs.length) L.push(`- harness errors: ${errs.length} (${errs.map((c) => c.id).join(', ')})`);

  const ia = newAgg(); const ra = newAgg();
  const execIgnoreInstall = new Set(['npm', 'node', 'sh', 'uv', 'python3', 'python', 'curl', 'tar', 'gzip', 'sha256sum', 'mkdir', 'unzip', 'chmod', 'git']);
  const execIgnoreRun = new Set(['node', 'sh']);
  const installScripts: string[] = []; const sha: { match: number; mismatch: number; none: number; cells: string[] } = { match: 0, mismatch: 0, none: 0, cells: [] };
  for (const c of cells) {
    aggregate(ia, c.install?.trace, c.subject, execIgnoreInstall);
    for (const s of c.install?.npm?.installScripts ?? []) installScripts.push(`${c.subject}: ${s.pkg}@${s.version} ${s.hook} \`${s.script}\``);
    const b = c.install?.binary;
    if (b) { if (b.sha256Match === true) sha.match++; else if (b.sha256Match === false) { sha.mismatch++; sha.cells.push(c.subject); } else sha.none++; }
    if (c.firstRun?.trace) aggregate(ra, c.firstRun.trace, c.subject, execIgnoreRun);
    for (const m of c.plugin?.mcpRuns ?? []) if (m.trace) aggregate(ra, m.trace, `${c.subject}/${m.name}`, execIgnoreRun);
    for (const h of c.plugin?.hookRuns ?? []) if (h.trace) aggregate(ra, h.trace, `${c.subject}#${h.event}`, execIgnoreRun);
  }
  const withScripts = new Set(installScripts.map((s) => s.split(':')[0]));
  L.push(`- install scripts run by npm: ${rate(withScripts.size, cells.filter((c) => c.kind === 'npm' || c.install?.npm).length)} of npm cells` + (installScripts.length ? `\n  - ${installScripts.slice(0, 40).join('\n  - ')}` : ''));
  if (sha.match + sha.mismatch + sha.none) L.push(`- binary archives: sha256 declared and matching ${sha.match}, mismatching ${sha.mismatch}${sha.cells.length ? ` (${sha.cells.join(', ')})` : ''}, not declared ${sha.none}`);
  L.push(`- install: hosts contacted (cells): ${top(ia.hosts, 20).join('; ') || 'none'}`);
  if (ia.telemetryHosts.size) L.push(`- install: telemetry-looking hosts: ${top(ia.telemetryHosts).join('; ')}`);
  if (ia.credReads.size) L.push(`- install: credential or agent-config paths read: ${top(ia.credReads).join('; ')}`);
  if (ia.agentWrites.size) L.push(`- install: agent-config paths written: ${top(ia.agentWrites).join('; ')}`);
  if (ia.execs.size) L.push(`- install: other programs executed: ${top(ia.execs, 20).join('; ')}`);
  if (ia.otherHome.size) L.push(`- install: other \`$HOME\` paths touched: ${top(ia.otherHome, 20).join('; ')}`);

  L.push(`- first run: hosts contacted (cells): ${top(ra.hosts, 30).join('; ') || 'none'}`);
  const runUnits = (arm === 'cursor' || arm === 'devin') ? cells.reduce((a, c) => a + (c.plugin?.mcpRuns ?? []).filter((m: any) => m.attempted).length + (c.plugin?.hookRuns ?? []).length, 0) : attempted.length;
  const unitName = (arm === 'cursor' || arm === 'devin') ? 'server or hook runs' : 'attempted cells';
  const telCells = new Set([...ra.telemetryHosts.values()].flatMap((s) => [...s]));
  L.push(`- first run: telemetry-looking hosts: ${top(ra.telemetryHosts).join('; ') || 'none'} — ${rate(telCells.size, runUnits || 1)} of ${unitName}`);
  const credCells = new Set([...ra.credReads.values()].flatMap((s) => [...s]));
  L.push(`- first run: credential or agent-config paths read: ${top(ra.credReads, 30).join('; ') || 'none'} — ${rate(credCells.size, runUnits || 1)} of ${unitName}`);
  L.push(`- first run: agent-config paths written: ${top(ra.agentWrites).join('; ') || 'none'}`);
  L.push(`- first run: programs executed (beyond node/sh): ${top(ra.execs, 30).join('; ') || 'none'}`);
  if (ra.otherHome.size) L.push(`- first run: other \`$HOME\` paths touched: ${top(ra.otherHome, 25).join('; ')}`);

  if (arm === 'acp') {
    L.push('', '### ACP: instrument against the registry\'s field truth', '');
    L.push('| agent | dist | quarantine | matrix init / session | this run init / session | agree | install scripts | first-run hosts | credential paths read | programs executed |', '|---|---|---|---|---|---|---|---|---|---|');
    let agree = 0, compared = 0, quarantinedRun = 0, quarantinedOk = 0;
    for (const c of cells.sort((a, b) => a.subject.localeCompare(b.subject))) {
      const ft = c.fieldTruth ?? {}; const m = ft.matrix; const cl = c.firstRun?.client;
      const oursInit = !c.install?.ok ? 'install failed' : !c.firstRun?.attempted ? `not run (${c.firstRun?.reason})` : cl?.initializeOk ? 'success' : cl?.spawned === false ? 'process_error' : 'no response';
      const oursSess = cl?.sessionNew?.status ?? '—';
      let ag = '—';
      if (m && m.distribution === c.kind.replace('npm', 'npx')) { compared++; const a = (m.initialize === oursInit) && (m.sessionNew === oursSess || (m.sessionNew === 'not_probed' && oursSess === '—')); if (a) agree++; ag = a ? 'yes' : 'NO'; }
      if (ft.quarantined) { quarantinedRun++; if (cl?.initializeOk) quarantinedOk++; }
      const scripts = (c.install?.npm?.installScripts ?? []).map((s: any) => `${s.pkg}:${s.hook}`).join(', ') || (c.install?.ok ? '—' : '');
      const hosts = (c.firstRun?.trace?.net?.hosts ?? []).map((h: any) => h.host ?? h.ip).join(', ') || '—';
      const creds = (c.firstRun?.trace?.home ?? []).filter((h: any) => isCredPath(h.prefix) && ((h.reads ?? 0) + (h.opens ?? 0)) > 0).map((h: any) => h.prefix).join(', ') || '—';
      const execs = Object.keys(c.firstRun?.trace?.execBasenames ?? {}).filter((b) => !['node', 'sh'].includes(b)).join(', ') || '—';
      L.push(`| ${c.subject} | ${c.kind} | ${ft.quarantined ?? '—'} | ${m ? `${m.initialize} / ${m.sessionNew}` : 'not probed'} | ${oursInit} / ${oursSess} | ${ag} | ${scripts} | ${hosts} | ${creds} | ${execs} |`);
    }
    L.push('', `- cells with a matrix probe of the same distribution: ${compared}; same initialize and session/new outcome: ${rate(agree, compared || 1)}`);
    L.push(`- quarantined agents run here: ${quarantinedRun} cells; of which initialize succeeded: ${quarantinedOk}`);
  }

  if (arm === 'cursor' || arm === 'devin') {
    const withPlugin = cells.filter((c) => c.plugin);
    const stdio = withPlugin.filter((c) => c.plugin.mcpDeclared.some((m: any) => m.kind === 'stdio'));
    const remote = withPlugin.filter((c) => c.plugin.mcpDeclared.some((m: any) => m.kind === 'remote'));
    const docker = withPlugin.filter((c) => c.plugin.mcpDeclared.some((m: any) => m.kind === 'docker'));
    const none = withPlugin.filter((c) => c.plugin.mcpDeclared.length === 0);
    const hooks = withPlugin.filter((c) => c.plugin.hooksDeclared.length > 0);
    const bins = withPlugin.filter((c) => c.plugin.inventory.binaries.length > 0);
    const nm = withPlugin.filter((c) => c.plugin.inventory.nodeModulesShipped);
    const execs = withPlugin.filter((c) => c.plugin.inventory.executables > 0);
    const scripts = withPlugin.filter((c) => c.plugin.inventory.scripts.length > 0);
    const notLocated = cells.filter((c) => !c.plugin && c.install?.ok);
    L.push('', `### ${arm}: what the plugins ship and declare`, '');
    L.push(`- plugin directory located: ${withPlugin.length}/${cells.length}${notLocated.length ? ` (not located: ${notLocated.map((c) => c.subject).join(', ')})` : ''}; fetch failed: ${cells.filter((c) => !c.install?.ok).length}`);
    L.push(`- MCP servers declared: stdio in ${rate(stdio.length, withPlugin.length)}; remote (url) in ${rate(remote.length, withPlugin.length)}; docker in ${rate(docker.length, withPlugin.length)}; none in ${rate(none.length, withPlugin.length)}`);
    const cmds = new Map<string, number>(); for (const c of withPlugin) for (const m of c.plugin.mcpDeclared) if (m.kind === 'stdio') cmds.set(m.command, (cmds.get(m.command) ?? 0) + 1);
    L.push(`- stdio commands: ${[...cmds.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}`);
    L.push(`- hooks declared: ${rate(hooks.length, withPlugin.length)}; events: ${[...new Set(hooks.flatMap((c) => c.plugin.hooksDeclared.map((h: any) => h.event)))].join(', ') || '—'}`);
    L.push(`- ships a binary by magic (ELF/PE/Mach-O/WASM): ${rate(bins.length, withPlugin.length)}${bins.length ? ` — ${bins.map((c) => `${c.subject} (${c.plugin.inventory.binaries.map((b: any) => `${b.path} ${b.magic}`).slice(0, 3).join(', ')})`).join('; ')}` : ''}`);
    L.push(`- ships node_modules: ${rate(nm.length, withPlugin.length)}; ships scripts (sh/py/js/ts…): ${rate(scripts.length, withPlugin.length)}; has executable files: ${rate(execs.length, withPlugin.length)}`);
    const runs = withPlugin.flatMap((c) => c.plugin.mcpRuns.filter((m: any) => m.attempted).map((m: any) => ({ c, m })));
    const hs = runs.filter(({ m }) => m.client?.initializeOk);
    const notFound = runs.filter(({ m }) => /Cannot find executable|No such file|not found/.test(String(m.client?.stderrTail ?? m.stderrTail ?? '')) && !m.client?.initializeOk);
    const noHs = runs.filter(({ m }) => !m.client?.initializeOk && !notFound.includes(({ c: undefined, m } as any)) && !notFound.some((x) => x.m === m));
    L.push(`- stdio MCP servers started: ${runs.length}; handshake ok: ${rate(hs.length, runs.length || 1)}; command not present on the host: ${notFound.length}${notFound.length ? ` (${[...new Set(notFound.map(({ m }) => basename(String((m.command ?? [])[0] ?? ''))))].join(', ')})` : ''}; started but no handshake: ${noHs.length}${noHs.length ? ` (${noHs.slice(0, 12).map(({ c, m }) => `${c.subject}/${m.name}`).join(', ')})` : ''}; tools listed: ${hs.reduce((a, { m }) => a + (m.client?.toolsCount ?? 0), 0)}`);
    const hookRuns = withPlugin.flatMap((c) => c.plugin.hookRuns.map((h: any) => ({ c, h })));
    const hookOk = hookRuns.filter(({ h }) => h.exitCode === 0);
    const hookNet = hookRuns.filter(({ h }) => (h.trace?.net?.hosts ?? []).length > 0);
    const hookCred = hookRuns.filter(({ h }) => (h.trace?.home ?? []).some((x: any) => isCredPath(x.prefix) && ((x.reads ?? 0) + (x.opens ?? 0)) > 0));
    L.push(`- hooks run: ${hookRuns.length}; exit 0: ${hookOk.length}; contacted the network: ${hookNet.length}${hookNet.length ? ` (${hookNet.map(({ c, h }) => `${c.subject}#${h.event}→${(h.trace.net.hosts as any[]).map((x) => x.host ?? x.ip).join(',')}`).join('; ')})` : ''}; read credential paths: ${hookCred.length}${hookCred.length ? ` (${hookCred.map(({ c, h }) => `${c.subject}#${h.event}`).join('; ')})` : ''}`);
    const hookExecs = new Map<string, number>(); for (const { h } of hookRuns) for (const b of Object.keys(h.trace?.execBasenames ?? {})) if (!['sh'].includes(b)) hookExecs.set(b, (hookExecs.get(b) ?? 0) + 1);
    L.push(`- programs hooks executed: ${[...hookExecs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}`);
    const hookFail = hookRuns.filter(({ h }) => h.exitCode !== 0);
    if (hookFail.length) L.push(`- hooks that did not exit 0: ${hookFail.slice(0, 30).map(({ c, h }) => `${c.subject}#${h.event} (${h.exitCode ?? h.signal}: ${String(h.stderrTail).split('\n').pop()?.slice(0, 60)})`).join('; ')}`);
  }

  if (arm === 'zed') {
    const res = new Map<string, number>(); for (const c of cells) { const m = c.zed?.resolution?.method ?? 'fetch failed'; res.set(m, (res.get(m) ?? 0) + 1); }
    L.push('', '### zed: what the extension source says it would run', '');
    L.push(`- resolution: ${[...res.entries()].map(([k, v]) => `${k} ${v}`).join(', ')}`);
    const unresolved = cells.filter((c) => c.zed?.resolution?.method === 'unresolved');
    if (unresolved.length) L.push(`- unresolved: ${unresolved.map((c) => c.subject).join(', ')}`);
    const gh = cells.filter((c) => c.zed?.resolution?.method === 'github-release');
    L.push(`- github-release extensions with a linux x86_64 asset found: ${gh.filter((c) => c.zed?.asset).length}/${gh.length}; none declares a checksum (the extension API has no field for one)`);
    const ran = cells.filter((c) => c.firstRun?.attempted);
    L.push(`- ran: ${ran.length}; handshake ok: ${rate(ran.filter((c) => c.firstRun?.client?.initializeOk).length, ran.length || 1)}; retried with a subcommand: ${ran.filter((c) => c.firstRun?.retriedWith).length}`);
  }
  L.push('');
}

writeFileSync(out, L.join('\n') + '\n');
console.log(`wrote ${out}`);
