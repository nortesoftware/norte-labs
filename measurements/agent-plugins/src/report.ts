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

const [dir, out] = process.argv.slice(2);
const ARMS = ['acp', 'cursor', 'devin', 'zed'] as const;
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
const TELEMETRY_HOSTS = /posthog|segment\.io|sentry\.io|ingest\.sentry|mixpanel|amplitude|google-analytics|googletagmanager|clearcut|play\.googleapis|datadoghq|bugsnag|statsig|launchdarkly|unleash|telemetry|analytics|honeycomb|newrelic|logrocket|hotjar|intercom|vercel-insights|plausible|umami|rudderstack|\.rum\.|rum\.aliyuncs|visualstudio\.com|applicationinsights|\bingest\./i;

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

function load(arm: string): Cell[] {
  const p = join(dir, `cells-${arm}.ndjson`);
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

const L: string[] = [];
L.push('# agent-plugins — generated report', '', `Generated ${new Date().toISOString()} from \`results/cells-<arm>.ndjson\`. Rates are n/N with 95 % Wilson intervals; N is the population.`, '');

for (const arm of ARMS) {
  const cells = load(arm);
  if (!cells.length) continue;
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
