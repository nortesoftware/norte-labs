// Runner for the Open VSX arm: one VS Code extension per cell, installed with
// the editor's own command line and then activated in a headless editor, both
// under strace, inside the same bubblewrap sandbox and decoy home as run.ts.
//
// A VSIX carries no install-time code — the editor unpacks it — so the install
// trace records what the editor does with a new extension (it fetches declared
// extension dependencies from the gallery). The first run is the editor started
// on a small workspace with a driver extension (src/driver) loaded through
// --extensionDevelopmentPath: the driver activates the extension under test by
// id, opens the workspace files its activation events name, idles, and quits.
// The trace covers the whole editor; the driver records the extension host's
// pid, and the clone lines let the parser attribute to the extension host and
// its children (language servers, tools it spawns) apart from the editor.
// Baseline cells (--baseline N) run the driver with no target and every sample
// file open; what they touch is the editor's own footprint.
//
// Results are appended per cell as NDJSON; re-running skips finished cells.
// --natural leaves activation to the editor (the driver opens the files and
// records whether the extension's own events activated it); NL_KEEP_HOME=<dir>
// keeps a copy of each cell's decoy home, minus the editor's own directories,
// so that what an extension wrote can be read afterwards.
//
// Usage: node vsix.ts <population.ndjson> <results.ndjson> [--limit N] [--only id] [--baseline N] [--natural]

import { spawn, execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync, cpSync } from 'node:fs';
import { join, basename, dirname, relative } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { parseTraceLine, summariseHomeAccess, parseNetworkTrace, summariseNetwork, parseProcessTree, subtreePids, joinResumed, quotedArgs, type HomeAccessSummary, type HostSummary, type TraceEvent } from './trace.ts';
import { DECOYS, magicOf } from './run.ts';
import type { Spec } from './populations.ts';

const ROOT = '/var/tmp/nl-vsix';
const FH = join(ROOT, `home-${process.pid}`);
const REAL_HOME = homedir();
const HOME = REAL_HOME; // the decoy home is bound at the real $HOME path, rewritten to /home/user in the published cells
const USER = 'user';
const IDLE_MS = process.env.NL_IDLE_MS ?? '10000';
const ACTIVATE_MS = process.env.NL_ACTIVATE_MS ?? '60000';
const NODE_DIR = dirname(dirname(process.execPath));
const TOOL = join(ROOT, 'toolchain');
const XROOT = join(TOOL, 'root');
const CODIUM = join(TOOL, 'codium');
const STRACE = join(XROOT, 'usr', 'bin', 'strace');
const HARNESS = join(ROOT, 'harness');
const UNPACK = join(ROOT, `unpack-${process.pid}`);
const DISPLAY = ':99';
const DOWNLOAD_TIMEOUT_MS = 600_000;
const INSTALL_TIMEOUT_MS = 180_000;
const RUN_TIMEOUT_MS = 300_000; // editor start, activation (≤ NL_ACTIVATE_MS), the files, the idle window and the quit, all under strace
const PATH = `${HOME}/.local/bin:/usr/local/bin:/usr/bin:/bin`;
const EXT_DIR = join(HOME, '.vscode-oss', 'extensions');
const USER_DATA = join(HOME, '.config', 'VSCodium');

// The editor's own settings in the decoy home: no update check, no telemetry,
// no recommendations, no schema downloads, so that what the trace shows the
// editor doing on its own is as small as the settings allow.
const SETTINGS = {
  'update.mode': 'none', 'telemetry.telemetryLevel': 'off', 'extensions.autoUpdate': false, 'extensions.autoCheckUpdates': false,
  'extensions.ignoreRecommendations': true, 'security.workspace.trust.enabled': false, 'workbench.startupEditor': 'none',
  'workbench.enableExperiments': false, 'workbench.settings.enableNaturalLanguageSearch': false, 'git.enabled': false,
  'npm.fetchOnlinePackageInfo': false, 'typescript.disableAutomaticTypeAcquisition': true, 'json.schemaDownload.enable': false,
  'window.restoreWindows': 'none', 'files.hotExit': 'off',
};

// The workspace: one small file per common language, so that an extension's
// onLanguage and workspaceContains events have something to match. The driver
// carries the same names with their language ids.
const SAMPLE_FILES: Record<string, string> = {
  'app.ts': 'export const answer: number = 42;\nconsole.log(answer);\n',
  'index.js': "const answer = 42;\nconsole.log(answer);\n",
  'main.py': 'def main():\n    print(42)\n\nif __name__ == "__main__":\n    main()\n',
  'main.go': 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println(42)\n}\n',
  'main.rs': 'fn main() {\n    println!("{}", 42);\n}\n',
  'index.html': '<!doctype html>\n<html><head><title>nl</title><link rel="stylesheet" href="style.css"></head><body><p>42</p></body></html>\n',
  'style.css': 'body { margin: 0; color: #333; }\n',
  'data.json': '{"answer": 42, "items": [1, 2, 3]}\n',
  'config.yaml': 'name: nl-proj\nversion: 1\nitems:\n  - a\n  - b\n',
  'Dockerfile': 'FROM debian:stable-slim\nCOPY . /app\nCMD ["sh", "-c", "echo 42"]\n',
  'run.sh': '#!/bin/sh\necho 42\n',
  'main.c': '#include <stdio.h>\nint main(void) { printf("%d\\n", 42); return 0; }\n',
  'main.cpp': '#include <iostream>\nint main() { std::cout << 42 << std::endl; return 0; }\n',
  'Main.java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println(42);\n    }\n}\n',
  'pom.xml': '<?xml version="1.0"?>\n<project><modelVersion>4.0.0</modelVersion><groupId>nl</groupId><artifactId>proj</artifactId><version>1</version></project>\n',
  'schema.sql': 'CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT);\nSELECT * FROM items;\n',
  'Cargo.toml': '[package]\nname = "nl-proj"\nversion = "0.1.0"\nedition = "2021"\n',
  'main.tf': 'resource "null_resource" "nl" {}\n',
  'index.php': '<?php\necho 42;\n',
  'app.rb': 'puts 42\n',
  'Program.cs': 'System.Console.WriteLine(42);\n',
  'main.kt': 'fun main() {\n    println(42)\n}\n',
  'App.vue': '<template>\n  <p>{{ answer }}</p>\n</template>\n<script>\nexport default { data() { return { answer: 42 } } }\n</script>\n',
  'main.dart': 'void main() {\n  print(42);\n}\n',
  'Makefile': 'all:\n\techo 42\n',
  'notes.txt': 'nl sample workspace\n',
  '.env': 'APP_SECRET=NLCANARY-app-secret\n',
  'main.lua': 'print(42)\n',
  'script.ps1': 'Write-Output 42\n',
};

function makeHome(): void {
  rmSync(FH, { recursive: true, force: true });
  for (const [rel, body] of Object.entries(DECOYS)) {
    const p = join(FH, rel);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, body);
  }
  for (const [name, body] of Object.entries(SAMPLE_FILES)) writeFileSync(join(FH, 'proj', name), body, { mode: name.endsWith('.sh') ? 0o755 : 0o644 });
  mkdirSync(join(FH, '.config', 'VSCodium', 'User'), { recursive: true });
  writeFileSync(join(FH, '.config', 'VSCodium', 'User', 'settings.json'), JSON.stringify(SETTINGS, null, 2) + '\n');
  for (const d of ['Desktop', 'Downloads', '.local/bin', '.local/share', '.cache', '.vscode-oss/extensions', 'proj/data']) mkdirSync(join(FH, d), { recursive: true });
  for (const b of ['node', 'npm', 'npx', 'corepack']) symlinkSync(join(NODE_DIR, 'bin', b), join(FH, '.local/bin', b));
}

function bwrapArgv(env: Record<string, string>, cwd: string, cmd: string[]): string[] {
  const a = [
    'bwrap', '--ro-bind', '/', '/', '--dev', '/dev', '--proc', '/proc', '--tmpfs', '/tmp', '--tmpfs', '/run',
    '--bind', FH, HOME,
    '--ro-bind', NODE_DIR, NODE_DIR,
    '--unshare-pid', '--unshare-ipc', '--unshare-uts', '--hostname', 'sandbox', '--die-with-parent', '--new-session', '--clearenv',
    '--setenv', 'HOME', HOME, '--setenv', 'PATH', PATH, '--setenv', 'USER', USER, '--setenv', 'LOGNAME', USER,
    '--setenv', 'LANG', 'C.UTF-8', '--setenv', 'TERM', 'dumb', '--setenv', 'SHELL', '/bin/bash',
    '--setenv', 'XDG_CONFIG_HOME', join(HOME, '.config'), '--setenv', 'XDG_CACHE_HOME', join(HOME, '.cache'), '--setenv', 'XDG_DATA_HOME', join(HOME, '.local', 'share'),
  ];
  for (const [k, v] of Object.entries(env)) a.push('--setenv', k, v);
  a.push('--chdir', cwd, '--', ...cmd);
  return a;
}

function run(argv: string[], timeoutMs: number): Promise<{ code: number | null; signal: string | null; stdout: string; stderr: string; ms: number }> {
  return new Promise((resolvePromise) => {
    const started = Date.now();
    const child = spawn(argv[0], argv.slice(1), { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', (d) => { if (stdout.length < 200_000) stdout += d.toString(); });
    child.stderr.on('data', (d) => { if (stderr.length < 200_000) stderr += d.toString(); });
    const t = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('close', (code, signal) => { clearTimeout(t); resolvePromise({ code, signal, stdout, stderr, ms: Date.now() - started }); });
    child.on('error', () => { clearTimeout(t); resolvePromise({ code: null, signal: 'SPAWN_ERROR', stdout, stderr, ms: Date.now() - started }); });
  });
}
const tail = (s: string, n = 1500) => { const t = s.trim(); return t.length <= n ? t : '…' + t.slice(-n); };
// clone lines are traced too: they are what the process tree is built from
const straceArgv = (out: string, cmd: string[]) => [STRACE, '-f', '-qq', '-y', '-s', '512', '-e', 'trace=file,execve,network,clone,clone3,fork,vfork', '-o', out, '--', ...cmd];
// the editor's launcher script, minus the launcher: the same exec it performs
const codiumArgv = (...args: string[]) => [join(CODIUM, 'codium'), join(CODIUM, 'resources', 'app', 'out', 'cli.js'), ...args];

// Programs executed, by where they come from: the extension's own directory
// (a language server or binary it ships, or the editor's node running one of
// its scripts), the editor's installation, or the system.
type ExecOrigin = 'extension' | 'editor' | 'system';
interface ExecRecord { origin: ExecOrigin; argv: string[] }
const EXEC_LINE = /^(?:\[pid\s+(\d+)\]\s*|(\d+)\s+)?execve\((.*)\)\s*=\s*0\s*$/;
function execOrigin(argv: string[]): ExecOrigin {
  if (argv.slice(0, 4).some((a) => a.includes('/.vscode-oss/extensions/'))) return 'extension';
  if (argv[0].startsWith(CODIUM + '/') || argv[0] === '/proc/self/exe') return 'editor';
  return 'system';
}
interface TraceSummary { traceLines: number; home: HomeAccessSummary[]; net: { hosts: HostSummary[]; dnsNames: string[] }; execBasenames: Record<string, number>; execs: ExecRecord[]; execsByOrigin: Record<ExecOrigin, number> }
function summarise(text: string, cwd: string, pids: Set<number> | null): TraceSummary {
  const events: TraceEvent[] = []; let lines = 0;
  const execBasenames: Record<string, number> = {};
  const execs: ExecRecord[] = []; const execsByOrigin: Record<ExecOrigin, number> = { extension: 0, editor: 0, system: 0 };
  for (const line of text.split('\n')) {
    if (!line) continue; lines++;
    for (const e of parseTraceLine(line, { home: HOME, fallbackCwd: cwd })) {
      if (pids && !pids.has(e.pid)) continue;
      events.push(e);
      if (e.klass === 'exec' && e.outcome === 'ok') { const b = basename(e.path); execBasenames[b] = (execBasenames[b] ?? 0) + 1; }
    }
    const x = EXEC_LINE.exec(line);
    if (x && (!pids || pids.has(Number(x[1] ?? x[2] ?? 0)))) {
      const args = quotedArgs(x[3]); // the path, then argv
      const argv = args.slice(1).filter((a) => a !== '...');
      if (argv.length) { const origin = execOrigin([args[0], ...argv.slice(1)]); execsByOrigin[origin]++; if (execs.length < 60) execs.push({ origin, argv: argv.slice(0, 5).map((a) => a.slice(0, 200)) }); }
    }
  }
  const nt = parseNetworkTrace(text);
  if (pids) { nt.connects = nt.connects.filter((c) => pids.has(c.pid)); nt.queries = nt.queries.filter((q) => pids.has(q.pid)); }
  return { traceLines: lines, home: summariseHomeAccess(events, HOME), net: summariseNetwork(nt), execBasenames, execs, execsByOrigin };
}
// Whole-tree summary and, for the activation run, the summary of the extension
// host and its descendants alone. The extension host is the process that wrote
// the driver's summary file: what the driver's own process.pid reports is not
// the pid the tracer sees (the editor's utility process numbers it otherwise),
// so the trace is asked instead.
function takeTrace(name: string, cwd: string, driverOut: string | null): { trace: TraceSummary | null; extHost: TraceSummary | null; extHostPid: number | null; extHostProcesses: number | null } {
  const p = join(FH, name);
  if (!existsSync(p)) return { trace: null, extHost: null, extHostPid: null, extHostProcesses: null };
  const raw = readFileSync(p, 'utf8');
  if (process.env.NL_KEEP_TRACE) cpSync(p, join(process.env.NL_KEEP_TRACE, name));
  rmSync(p, { force: true });
  const text = joinResumed(raw).join('\n'); // an editor is many processes: most of its execve lines come split
  const trace = summarise(text, cwd, null);
  if (!driverOut) return { trace, extHost: null, extHostPid: null, extHostProcesses: null };
  const tree = parseProcessTree(text);
  const w = new RegExp(`^(?:\\[pid\\s+(\\d+)\\]\\s*|(\\d+)\\s+)openat\\(.*"${driverOut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}", O_WRONLY`, 'm').exec(text);
  if (!w) return { trace, extHost: null, extHostPid: null, extHostProcesses: null };
  const tid = Number(w[1] ?? w[2]);
  const extHostPid = tree.processOf.get(tid) ?? tid;
  const pids = subtreePids(tree, extHostPid);
  const processes = new Set([...pids].map((x) => tree.processOf.get(x) ?? x)).size;
  return { trace, extHost: summarise(text, cwd, pids), extHostPid, extHostProcesses: processes };
}

// What the VSIX ships, by file magic and name, and what its manifest declares.
interface VsixInventory { files: number; bytes: number; binaries: { path: string; magic: string; bytes: number }[]; nativeNodeFiles: number; wasmFiles: number; executables: number; scripts: Record<string, number>; nodeModulesShipped: boolean; packagesBundled: number; topLevel: string[] }
interface VsixManifest { name: string | null; publisher: string | null; version: string | null; main: string | null; browser: string | null; activationEvents: string[] | null; extensionKind: string[] | null; extensionDependencies: string[] | null; extensionPack: string[] | null; contributes: string[]; capabilities: unknown; enabledApiProposals: string[] | null; engines: unknown; dependencies: number; hasNodeMain: boolean }
function inventoryVsix(vsix: string): { inventory: VsixInventory; manifest: VsixManifest | null; error?: string } {
  rmSync(UNPACK, { recursive: true, force: true }); mkdirSync(UNPACK, { recursive: true });
  const inv: VsixInventory = { files: 0, bytes: 0, binaries: [], nativeNodeFiles: 0, wasmFiles: 0, executables: 0, scripts: {}, nodeModulesShipped: false, packagesBundled: 0, topLevel: [] };
  try { execFileSync('unzip', ['-q', '-o', vsix, '-d', UNPACK], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 300_000, maxBuffer: 50_000_000 }); } catch (e: any) {
    if (!existsSync(join(UNPACK, 'extension', 'package.json'))) return { inventory: inv, manifest: null, error: `unzip: ${String(e?.stderr ?? e).slice(0, 300)}` };
  }
  const ext = join(UNPACK, 'extension');
  try { inv.topLevel = readdirSync(ext).slice(0, 40); } catch { /* */ }
  const walk = (d: string, depth: number): void => {
    if (depth > 14) return;
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, ent.name); const rel = relative(ext, p);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules') inv.nodeModulesShipped = true;
        if (existsSync(join(p, 'package.json')) && /(^|\/)node_modules\//.test(rel + '/')) inv.packagesBundled++;
        walk(p, depth + 1); continue;
      }
      if (!ent.isFile()) continue;
      inv.files++;
      let st; try { st = statSync(p); } catch { continue; }
      inv.bytes += st.size;
      if (st.mode & 0o111) inv.executables++;
      const e = ent.name.includes('.') ? ent.name.split('.').pop()!.toLowerCase() : '';
      if (e === 'node') inv.nativeNodeFiles++;
      if (e === 'wasm') inv.wasmFiles++;
      if (['sh', 'bash', 'zsh', 'py', 'rb', 'pl', 'ps1', 'bat', 'cmd'].includes(e)) inv.scripts[e] = (inv.scripts[e] ?? 0) + 1;
      const magic = st.size >= 4 ? magicOf(p) : null;
      if (magic && inv.binaries.length < 100) inv.binaries.push({ path: rel, magic, bytes: st.size });
    }
  };
  try { walk(ext, 0); } catch { /* */ }
  let manifest: VsixManifest | null = null;
  try {
    const j = JSON.parse(readFileSync(join(ext, 'package.json'), 'utf8'));
    manifest = {
      name: j.name ?? null, publisher: j.publisher ?? null, version: j.version ?? null, main: j.main ?? null, browser: j.browser ?? null,
      activationEvents: Array.isArray(j.activationEvents) ? j.activationEvents : null, extensionKind: Array.isArray(j.extensionKind) ? j.extensionKind : typeof j.extensionKind === 'string' ? [j.extensionKind] : null,
      extensionDependencies: Array.isArray(j.extensionDependencies) ? j.extensionDependencies : null, extensionPack: Array.isArray(j.extensionPack) ? j.extensionPack : null,
      contributes: Object.keys(j.contributes ?? {}), capabilities: j.capabilities ?? null, enabledApiProposals: Array.isArray(j.enabledApiProposals) ? j.enabledApiProposals : null, engines: j.engines ?? null,
      dependencies: Object.keys(j.dependencies ?? {}).length, hasNodeMain: Boolean(j.main),
    };
  } catch { /* no readable manifest */ }
  rmSync(UNPACK, { recursive: true, force: true });
  return { inventory: inv, manifest };
}

interface InstallResult { method: string; command?: string[]; ok: boolean; exitCode: number | null; signal: string | null; ms: number; stderrTail: string; trace: TraceSummary | null; vsix?: { url: string; targetPlatform: string | null; bytes: number | null; sha256Declared: string | null; sha256Actual: string | null; sha256Match: boolean | null; downloadMs: number; error?: string }; inventory?: VsixInventory | null; manifest?: VsixManifest | null; extensionsInstalled?: string[] }
interface RunResult { attempted: boolean; reason?: string; forced?: boolean; command?: string[]; envNames?: string[]; cwd?: string; ms?: number; exitCode?: number | null; signal?: string | null; stderrTail?: string; driver?: any; trace?: TraceSummary | null; extHost?: TraceSummary | null; extHostPid?: number | null; extHostProcesses?: number | null }
interface Cell {
  id: string; arm: string; kind: string; subject: string; subjectVersion: string | null; source: string | null; protocol: string;
  startedAt: string; declared: unknown;
  install: InstallResult; firstRun: RunResult; notes: string[]; cacheBytes: number;
}
const emptyInstall = (method: string): InstallResult => ({ method, ok: false, exitCode: null, signal: null, ms: 0, stderrTail: '', trace: null });

function sha256File(p: string): string | null {
  try { return createHash('sha256').update(readFileSync(p)).digest('hex'); } catch { return null; }
}

// Download (outside the sandbox: nothing of the extension runs), inventory,
// then the editor's own install command under strace.
async function installVsix(cell: Cell, spec: Spec): Promise<string | null> {
  const url = spec.vsixUrl!;
  const file = `${spec.subject}-${spec.subjectVersion ?? 'latest'}.vsix`.replace(/[^A-Za-z0-9._-]/g, '_');
  const local = join(FH, 'Downloads', file);
  const t0 = Date.now();
  cell.install = { ...emptyInstall('codium --install-extension'), vsix: { url, targetPlatform: spec.targetPlatform ?? null, bytes: null, sha256Declared: spec.vsixSha256 ?? null, sha256Actual: null, sha256Match: null, downloadMs: 0 } };
  const v = cell.install.vsix!;
  try {
    execFileSync('curl', ['-sSL', '--max-time', String(DOWNLOAD_TIMEOUT_MS / 1000), '-f', '-o', local, url], { stdio: ['ignore', 'pipe', 'pipe'], timeout: DOWNLOAD_TIMEOUT_MS + 10_000 });
  } catch (e: any) { v.error = `download: ${String(e?.stderr ?? e).slice(0, 300)}`; v.downloadMs = Date.now() - t0; cell.install.stderrTail = v.error; return null; }
  v.downloadMs = Date.now() - t0;
  try { v.bytes = statSync(local).size; } catch { /* */ }
  v.sha256Actual = sha256File(local);
  v.sha256Match = v.sha256Declared && v.sha256Actual ? v.sha256Declared.toLowerCase() === v.sha256Actual.toLowerCase() : null;
  const inv = inventoryVsix(local);
  cell.install.inventory = inv.inventory; cell.install.manifest = inv.manifest;
  if (inv.error) cell.notes.push(inv.error);
  const cmd = codiumArgv('--install-extension', join(HOME, 'Downloads', file), '--extensions-dir', EXT_DIR, '--user-data-dir', USER_DATA);
  cell.install.command = cmd;
  const r = await run(bwrapArgv({ ELECTRON_RUN_AS_NODE: '1' }, join(HOME, 'proj'), straceArgv(join(HOME, 'trace-install.txt'), cmd)), INSTALL_TIMEOUT_MS);
  Object.assign(cell.install, { ok: r.code === 0, exitCode: r.code, signal: r.signal, ms: r.ms, stderrTail: tail(r.stderr + (r.code !== 0 ? '\n' + r.stdout : '')) });
  cell.install.trace = takeTrace('trace-install.txt', join(HOME, 'proj'), null).trace;
  try { cell.install.extensionsInstalled = readdirSync(join(FH, '.vscode-oss', 'extensions')).filter((d) => !d.startsWith('.') && d !== 'extensions.json').slice(0, 30); } catch { cell.install.extensionsInstalled = []; }
  rmSync(local, { force: true });
  return cell.install.ok ? spec.subject : null;
}

async function activateRun(cell: Cell, target: string | null, filesMode: 'match' | 'all', forced = true): Promise<RunResult> {
  const cwd = join(HOME, 'proj');
  const cmd = codiumArgv('--no-sandbox', '--disable-gpu', '--disable-workspace-trust', '--disable-crash-reporter', '--disable-updates', '--disable-telemetry',
    '--extensions-dir', EXT_DIR, '--user-data-dir', USER_DATA, `--extensionDevelopmentPath=${join(HARNESS, 'driver')}`, cwd);
  const env: Record<string, string> = { ELECTRON_RUN_AS_NODE: '1', DISPLAY, NL_XROOT: XROOT, NL_TARGET: target ?? '', NL_OUT: join(HOME, 'driver.json'), NL_WORKSPACE: cwd, NL_IDLE_MS: IDLE_MS, NL_ACTIVATE_MS: ACTIVATE_MS, NL_FILES: filesMode, NL_ACTIVATE: forced ? '1' : '0' };
  const out: RunResult = { attempted: true, forced, command: cmd, envNames: Object.keys(env).filter((k) => k.startsWith('NL_') || k === 'DISPLAY'), cwd };
  const rr = await run(bwrapArgv(env, cwd, ['sh', join(HARNESS, 'xrun.sh'), ...straceArgv(join(HOME, 'trace-run.txt'), cmd)]), RUN_TIMEOUT_MS);
  out.ms = rr.ms; out.exitCode = rr.code; out.signal = rr.signal; out.stderrTail = tail(rr.stderr, 800);
  try { out.driver = JSON.parse(readFileSync(join(FH, 'driver.json'), 'utf8')); } catch { out.driver = null; }
  rmSync(join(FH, 'driver.json'), { force: true });
  const t = takeTrace('trace-run.txt', cwd, out.driver ? env.NL_OUT : null);
  out.trace = t.trace; out.extHost = t.extHost; out.extHostPid = t.extHostPid; out.extHostProcesses = t.extHostProcesses;
  return out;
}

async function runCell(spec: Spec, forced = true): Promise<Cell> {
  makeHome();
  const cell: Cell = {
    id: spec.id, arm: spec.arm, kind: spec.kind, subject: spec.subject, subjectVersion: spec.subjectVersion, source: spec.source, protocol: spec.protocol,
    startedAt: new Date().toISOString(), declared: spec.declared,
    install: emptyInstall('none'), firstRun: { attempted: false }, notes: [...(spec.notes ?? [])], cacheBytes: 0,
  };
  if (!spec.vsixUrl) { cell.install = { ...emptyInstall('none'), stderrTail: 'no download for linux-x64 or universal' }; cell.firstRun = { attempted: false, reason: 'nothing to install' }; return cell; }
  const installed = await installVsix(cell, spec);
  if (!installed) { cell.firstRun = { attempted: false, reason: cell.install.vsix?.error ? 'download failed' : 'install failed' }; return cell; }
  const m = cell.install.manifest;
  if (m && !m.main && !m.browser) { cell.firstRun = { attempted: false, reason: 'declares no main or browser entry: nothing to activate' }; return cell; }
  cell.firstRun = await activateRun(cell, spec.subject, 'match', forced);
  return cell;
}

// The decoy home minus the editor's own state: what the extension left behind.
function keepHome(id: string): void {
  const dst = process.env.NL_KEEP_HOME; if (!dst) return;
  const skip = new Set(['.vscode-oss', '.cache', 'Downloads']);
  const to = join(dst, id.replace(/[^A-Za-z0-9._-]/g, '_'));
  rmSync(to, { recursive: true, force: true });
  cpSync(FH, to, { recursive: true, filter: (src) => { const r = relative(FH, src); return !skip.has(r.split('/')[0]) && !r.startsWith('.config/VSCodium') && !r.startsWith('.local/state'); } });
}

function baselineCell(k: number): Promise<Cell> {
  makeHome();
  const cell: Cell = {
    id: `openvsx::baseline-${k}`, arm: 'openvsx', kind: 'vsix', subject: 'baseline', subjectVersion: null, source: null, protocol: 'vscode',
    startedAt: new Date().toISOString(), declared: { baseline: true, filesMode: 'all' },
    install: { ...emptyInstall('none'), ok: true, stderrTail: 'baseline: no extension installed' }, firstRun: { attempted: false }, notes: [], cacheBytes: 0,
  };
  return activateRun(cell, null, 'all').then((r) => { cell.firstRun = r; return cell; });
}

async function main(): Promise<void> {
  const [popPath, resultsPath, ...rest] = process.argv.slice(2);
  const limit = rest.includes('--limit') ? Number(rest[rest.indexOf('--limit') + 1]) : Infinity;
  const only = rest.includes('--only') ? rest[rest.indexOf('--only') + 1] : null;
  const baseline = rest.includes('--baseline') ? Number(rest[rest.indexOf('--baseline') + 1]) : 0;
  const forced = !rest.includes('--natural');
  mkdirSync(HARNESS, { recursive: true });
  cpSync(new URL('./driver', import.meta.url).pathname, join(HARNESS, 'driver'), { recursive: true });
  cpSync(new URL('./xrun.sh', import.meta.url).pathname, join(HARNESS, 'xrun.sh'));
  const done = new Set<string>();
  if (existsSync(resultsPath)) for (const l of readFileSync(resultsPath, 'utf8').split('\n')) { if (!l.trim()) continue; try { done.add(JSON.parse(l).id); } catch { /* */ } }
  const publish = (cell: Cell) => {
    // The decoy home is bound at the real $HOME path so traces read like a
    // developer's; in the published cells that path is /home/user.
    const published = JSON.stringify(cell).replaceAll(REAL_HOME, '/home/user').replaceAll(encodeURIComponent(REAL_HOME), encodeURIComponent('/home/user')).replaceAll(REAL_HOME.replaceAll('/', '-'), '/home/user'.replaceAll('/', '-'));
    appendFileSync(resultsPath, published + '\n');
  };
  const line = (cell: Cell, t0: number) => {
    const fr = cell.firstRun; const d = fr.driver;
    const act = fr.attempted ? (d ? `${d.found ? (d.forced === false ? `natural, active at end: ${d.isActiveAtEnd}` : d.activated ? `activated ${d.activateMs} ms` : 'activation failed') : 'not found'}, files ${d.filesOpened?.length ?? 0}` : `no driver output (${fr.signal ?? fr.exitCode})`) : `skipped (${fr.reason})`;
    process.stderr.write(`install=${cell.install.ok ? 'ok' : 'FAIL'} run=${act} exthost=${fr.extHostProcesses ?? '-'}p hosts(i/r/x)=${cell.install.trace?.net.hosts.length ?? '-'}/${fr.trace?.net.hosts.length ?? '-'}/${fr.extHost?.net.hosts.length ?? '-'} ${Math.round((Date.now() - t0) / 1000)}s\n`);
  };
  for (let k = 1; k <= baseline; k++) {
    const id = `openvsx::baseline-${k}`;
    if (done.has(id)) continue;
    const t0 = Date.now();
    process.stderr.write(`[${new Date().toISOString()}] ${id} … `);
    const cell = await baselineCell(k);
    publish(cell); line(cell, t0);
  }
  const specs: Spec[] = !popPath || popPath === '-' ? [] : readFileSync(popPath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  let n = 0;
  for (const spec of specs) {
    if (done.has(spec.id)) continue;
    if (only && !spec.id.includes(only)) continue;
    if (n >= limit) break;
    n++;
    const t0 = Date.now();
    process.stderr.write(`[${new Date().toISOString()}] ${spec.id} … `);
    let cell: Cell;
    try { cell = await runCell(spec, forced); } catch (e) {
      cell = { id: spec.id, arm: spec.arm, kind: spec.kind, subject: spec.subject, subjectVersion: spec.subjectVersion, source: spec.source, protocol: spec.protocol, startedAt: new Date().toISOString(), declared: spec.declared, install: { ...emptyInstall('harness error'), signal: 'HARNESS_ERROR', stderrTail: String(e).slice(0, 500) }, firstRun: { attempted: false, reason: 'harness error' }, notes: [], cacheBytes: 0 };
    }
    keepHome(spec.id);
    publish(cell); line(cell, t0);
  }
  rmSync(FH, { recursive: true, force: true });
}

main().catch((e) => { console.error(e); process.exit(1); });
