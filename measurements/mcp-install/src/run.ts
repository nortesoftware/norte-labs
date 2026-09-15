// Runner: install + first-run of MCP server packages under strace, inside a
// bubblewrap sandbox whose $HOME is a fresh decoy home.
//
// Per cell (one package from sample.ndjson):
//   INSTALL   npm install <id>@<ver>  /  uv venv + uv pip install <id>==<ver>
//             under strace (file, execve, network) — what the install touches
//             under $HOME, what it executes, where it connects.
//   FIRST-RUN the server started the way a client would (its bin / console
//             script), driven through initialize → tools/list, then left idle
//             10 s — same three questions, plus the declared tool annotations.
//
// The sandbox binds the decoy home at the real $HOME path, so paths in the
// trace read as a normal developer home (~/.npmrc, ~/.ssh, ~/.aws …), all of
// them fakes. The Node toolchain and the package caches are bound back in; the
// network is NOT isolated, because egress is one of the things measured.
//
// Results are appended per cell as NDJSON; re-running skips finished cells.
//
// Usage: node run.ts <sample.ndjson> <results.ndjson> [--limit N] [--only id]

import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync, cpSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { homedir, userInfo } from 'node:os';
import { parseTraceLine, summariseHomeAccess, parseNetworkTrace, summariseNetwork, type HomeAccessSummary, type HostSummary } from './trace.ts';
import type { PopRow, ArgSpec, EnvSpec } from './population.ts';

const ROOT = '/var/tmp/nl-mcp-install';
const FH = join(ROOT, 'home');
// Verification arms (measurements/mcp-install/verification.md): NL_NO_BWRAP=1 runs the
// cell unconfined with $HOME pointed at the decoy directory instead of bind-mounting it
// over the real $HOME path; NL_IDLE_MS lengthens the post-handshake idle window.
const NO_BWRAP = process.env.NL_NO_BWRAP === '1';
// The decoy home is mounted at the real $HOME path so traced paths read like a
// developer's home; in the unconfined arm it is simply pointed at the directory.
const REAL_HOME = homedir();
const HOME = NO_BWRAP ? FH : REAL_HOME;
const USER = userInfo().username;
const IDLE_MS = process.env.NL_IDLE_MS ?? '10000';
// NL_ENV_OVERRIDES: JSON object of real values for declared env vars (credential arm).
// Values never reach the results file: only the variable names are recorded.
const ENV_OVERRIDES: Record<string, string> = process.env.NL_ENV_OVERRIDES ? JSON.parse(process.env.NL_ENV_OVERRIDES) : {};
const NODE_DIR = dirname(dirname(process.execPath)); // the Node that runs this script is the one bound into the sandbox
const TOOLBIN = join(ROOT, 'toolchain', 'bin');
const STRACE = join(TOOLBIN, 'strace');
const CACHE_NPM = join(ROOT, 'cache', 'npm');
const CACHE_UV = join(ROOT, 'cache', 'uv');
const HARNESS = join(ROOT, 'harness');
const CACHE_CAP_BYTES = 3 * 1024 ** 3;
const INSTALL_TIMEOUT_MS = 300_000;
const RUN_TIMEOUT_MS = 60_000 + Number(process.env.NL_IDLE_MS ?? '10000'); // handshake (20 s) + tools/list (15 s) + idle + kill grace
const CTOOLCHAIN = '/var/tmp/norte-toolchain/bin'; // norte-guard's unprivileged gcc 14 + sysroot with kernel headers
const PYINCLUDE = join(ROOT, 'toolchain', 'root', 'usr', 'include', 'python3.13');
const PATH = `${HOME}/.local/bin:${TOOLBIN}:${CTOOLCHAIN}:/usr/local/bin:/usr/bin:/bin`;

// ------------------------------------------------------------ sandbox home --
const DECOYS: Record<string, string> = {
  '.npmrc': '//registry.npmjs.org/:_authToken=NLCANARY-npm-token\n',
  '.ssh/id_rsa': 'NLCANARY not a key\n',
  '.ssh/id_ed25519': 'NLCANARY not a key\n',
  '.ssh/config': 'Host *\n  ServerAliveInterval 60\n',
  '.ssh/known_hosts': 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl\n',
  '.aws/credentials': '[default]\naws_access_key_id = NLCANARY-aws-key-id\naws_secret_access_key = NLCANARYsecret\n',
  '.aws/config': '[default]\nregion = eu-west-1\n',
  '.config/gh/hosts.yml': 'github.com:\n    oauth_token: NLCANARY-gh-oauth\n    user: dev\n',
  '.config/gcloud/application_default_credentials.json': '{"client_id":"nlcanary","refresh_token":"NLCANARY","type":"authorized_user"}\n',
  '.config/Code/User/settings.json': '{"editor.fontSize": 14}\n',
  '.config/Claude/claude_desktop_config.json': '{"mcpServers":{}}\n',
  '.gitconfig': '[user]\n\tname = dev\n\temail = dev@example.invalid\n',
  '.git-credentials': 'https://dev:NLCANARY-gh-token@github.com\n',
  '.bashrc': '# nl decoy\nexport EDITOR=vi\n',
  '.profile': '# nl decoy\n',
  '.zshrc': '# nl decoy\n',
  '.bash_history': 'ls\ncd proj\n',
  '.docker/config.json': '{"auths":{"https://index.docker.io/v1/":{"auth":"TkxDQU5BUlk="}}}\n',
  '.kube/config': 'apiVersion: v1\nkind: Config\nusers:\n- name: nl\n  user:\n    token: NLCANARY\n',
  '.netrc': 'machine api.github.com login dev password NLCANARY-gh-token\n',
  '.pypirc': '[pypi]\nusername = __token__\npassword = pypi-NLCANARY\n',
  '.cargo/credentials.toml': '[registry]\ntoken = "cio-NLCANARY"\n',
  '.env': 'OPENAI_API_KEY=NLCANARY-openai\nANTHROPIC_API_KEY=NLCANARY-anthropic\n',
  '.claude.json': '{"numStartups": 3}\n',
  '.claude/settings.json': '{"permissions":{}}\n',
  '.cursor/mcp.json': '{"mcpServers":{}}\n',
  '.codex/config.toml': 'model = "o3"\n',
  '.gemini/settings.json': '{}\n',
  'Documents/notes.txt': 'nl decoy document\n',
  'proj/package.json': '{"name":"nl-proj","version":"0.0.0","private":true}\n',
};

function makeHome(): void {
  rmSync(FH, { recursive: true, force: true });
  for (const [rel, body] of Object.entries(DECOYS)) {
    const p = join(FH, rel);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, body);
  }
  for (const d of ['Desktop', 'Downloads', '.npm', '.cache/uv', '.local/bin', '.local/share', '.config', 'proj/data']) mkdirSync(join(FH, d), { recursive: true });
  for (const b of ['node', 'npm', 'npx', 'corepack']) symlinkSync(join(NODE_DIR, 'bin', b), join(FH, '.local/bin', b));
  mkdirSync(CACHE_NPM, { recursive: true });
  mkdirSync(CACHE_UV, { recursive: true });
  if (NO_BWRAP) { rmSync(join(FH, '.npm'), { recursive: true, force: true }); symlinkSync(CACHE_NPM, join(FH, '.npm')); rmSync(join(FH, '.cache', 'uv'), { recursive: true, force: true }); symlinkSync(CACHE_UV, join(FH, '.cache', 'uv')); }
}

function bwrapArgv(env: Record<string, string>, cwd: string, cmd: string[]): string[] {
  if (NO_BWRAP) {
    const base: Record<string, string> = { HOME, PATH, USER, LOGNAME: USER, LANG: 'C.UTF-8', TERM: 'dumb', SHELL: '/bin/bash', XDG_CONFIG_HOME: join(HOME, '.config'), XDG_CACHE_HOME: join(HOME, '.cache'), ...env };
    return ['env', '-i', `-C${cwd}`, ...Object.entries(base).map(([k, v]) => `${k}=${v}`), ...cmd];
  }
  const a = [
    'bwrap', '--ro-bind', '/', '/', '--dev', '/dev', '--proc', '/proc', '--tmpfs', '/tmp', '--tmpfs', '/run',
    '--bind', FH, HOME,
    '--ro-bind', NODE_DIR, NODE_DIR,
    '--bind', CACHE_NPM, join(HOME, '.npm'),
    '--bind', CACHE_UV, join(HOME, '.cache', 'uv'),
    // A dev box has kernel and Python headers under /usr/include; this host does
    // not (libc6-dev / libpython3-dev are not installed), so the toolchain's
    // sysroot copies are bound there. Source builds otherwise fail on the host,
    // not on the package.
    '--ro-bind', join(ROOT, 'toolchain', 'include'), '/usr/include',
    '--unshare-pid', '--unshare-ipc', '--unshare-uts', '--die-with-parent', '--new-session', '--clearenv',
    '--setenv', 'HOME', HOME, '--setenv', 'PATH', PATH, '--setenv', 'USER', USER, '--setenv', 'LOGNAME', USER,
    '--setenv', 'LANG', 'C.UTF-8', '--setenv', 'TERM', 'dumb', '--setenv', 'SHELL', '/bin/bash',
    '--setenv', 'XDG_CONFIG_HOME', join(HOME, '.config'), '--setenv', 'XDG_CACHE_HOME', join(HOME, '.cache'),
    // Source builds: without these, every sdist with a C extension fails for
    // want of a compiler or Python.h and the install-time code never runs.
    '--setenv', 'CC', 'gcc', '--setenv', 'CXX', 'g++', '--setenv', 'CFLAGS', `-I${PYINCLUDE}`, '--setenv', 'CPPFLAGS', `-I${PYINCLUDE}`,
  ];
  for (const [k, v] of Object.entries(env)) a.push('--setenv', k, v);
  a.push('--chdir', cwd, '--', ...cmd);
  return a;
}

function run(argv: string[], timeoutMs: number): Promise<{ code: number | null; signal: string | null; stdout: string; stderr: string; ms: number }> {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(argv[0], argv.slice(1), { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', (d) => { if (stdout.length < 200_000) stdout += d.toString(); });
    child.stderr.on('data', (d) => { if (stderr.length < 200_000) stderr += d.toString(); });
    const t = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('close', (code, signal) => { clearTimeout(t); resolve({ code, signal, stdout, stderr, ms: Date.now() - started }); });
    child.on('error', () => { clearTimeout(t); resolve({ code: null, signal: 'SPAWN_ERROR', stdout, stderr, ms: Date.now() - started }); });
  });
}

const tail = (s: string, n = 1500) => { const t = s.trim(); return t.length <= n ? t : '…' + t.slice(-n); };

// ------------------------------------------------------------- trace parse --
interface TraceSummary {
  traceLines: number;
  home: HomeAccessSummary[];
  net: { hosts: HostSummary[]; dnsNames: string[] };
  execBasenames: Record<string, number>;
}
function summariseTrace(path: string, cwd: string): TraceSummary | null {
  if (!existsSync(path)) return null;
  const text = readFileSync(path, 'utf8');
  const events = []; let lines = 0;
  const execBasenames: Record<string, number> = {};
  for (const line of text.split('\n')) {
    if (!line) continue; lines++;
    for (const e of parseTraceLine(line, { home: HOME, fallbackCwd: cwd })) {
      events.push(e);
      if (e.klass === 'exec' && e.outcome === 'ok') { const b = basename(e.path); execBasenames[b] = (execBasenames[b] ?? 0) + 1; }
    }
  }
  const nt = parseNetworkTrace(text);
  return { traceLines: lines, home: summariseHomeAccess(events, HOME), net: summariseNetwork(nt), execBasenames };
}

// ------------------------------------------------------------ static scans --
interface NpmScan { packagesInstalled: number; installScripts: { pkg: string; version: string; hook: string; script: string }[]; nativeNodeFiles: number; bin: { name: string; path: string } | null; hasMain: boolean }
function scanNodeModules(proj: string, id: string): NpmScan {
  const nm = join(proj, 'node_modules');
  const out: NpmScan = { packagesInstalled: 0, installScripts: [], nativeNodeFiles: 0, bin: null, hasMain: false };
  const walk = (dir: string, depth: number): void => {
    if (depth > 12 || !existsSync(dir)) return;
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      if (ent.name === '.bin' || ent.name === '.cache') continue;
      const p = join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name.startsWith('@')) { walk(p, depth); continue; }
        const pj = join(p, 'package.json');
        if (existsSync(pj)) {
          out.packagesInstalled++;
          try {
            const j = JSON.parse(readFileSync(pj, 'utf8'));
            for (const hook of ['preinstall', 'install', 'postinstall']) {
              if (j.scripts?.[hook]) out.installScripts.push({ pkg: String(j.name ?? ent.name), version: String(j.version ?? ''), hook, script: String(j.scripts[hook]).slice(0, 200) });
            }
          } catch { /* unreadable package.json */ }
          const inner = join(p, 'node_modules');
          if (existsSync(inner)) walk(inner, depth + 1);
        }
        try { for (const f of readdirSync(join(p, 'build', 'Release'))) if (f.endsWith('.node')) out.nativeNodeFiles++; } catch { /* none */ }
        for (const sub of ['prebuilds', 'bin', 'lib', 'native']) { try { for (const f of readdirSync(join(p, sub))) if (f.endsWith('.node')) out.nativeNodeFiles++; } catch { /* none */ } }
      }
    }
  };
  walk(nm, 0);
  const pj = join(nm, ...id.split('/'), 'package.json');
  if (existsSync(pj)) {
    try {
      const j = JSON.parse(readFileSync(pj, 'utf8'));
      out.hasMain = Boolean(j.main || j.exports);
      const short = id.split('/').pop()!;
      if (typeof j.bin === 'string') out.bin = { name: short, path: j.bin };
      else if (j.bin && typeof j.bin === 'object') {
        const keys = Object.keys(j.bin);
        const k = keys.includes(short) ? short : keys[0];
        if (k) out.bin = { name: k, path: String(j.bin[k]) };
      }
    } catch { /* */ }
  }
  return out;
}

interface PypiScan { distsInstalled: number; soFiles: number; consoleScripts: string[]; builtFromSource: string[]; sitePackages: string | null }
function scanVenv(proj: string, id: string, installStderr: string): PypiScan {
  const out: PypiScan = { distsInstalled: 0, soFiles: 0, consoleScripts: [], builtFromSource: [], sitePackages: null };
  const lib = join(proj, '.venv', 'lib');
  if (!existsSync(lib)) return out;
  const py = readdirSync(lib).find((d) => d.startsWith('python'));
  if (!py) return out;
  const sp = join(lib, py, 'site-packages'); out.sitePackages = sp;
  const norm = (s: string) => s.toLowerCase().replace(/[-_.]+/g, '-');
  const walkSo = (dir: string, depth: number): void => {
    if (depth > 6) return;
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) walkSo(p, depth + 1); else if (ent.name.endsWith('.so') || /\.so\.\d/.test(ent.name)) out.soFiles++;
    }
  };
  try { walkSo(sp, 0); } catch { /* */ }
  for (const d of readdirSync(sp)) {
    if (!d.endsWith('.dist-info')) continue;
    out.distsInstalled++;
    const distName = norm(d.replace(/-[^-]+\.dist-info$/, ''));
    if (distName === norm(id)) {
      const ep = join(sp, d, 'entry_points.txt');
      if (existsSync(ep)) {
        const txt = readFileSync(ep, 'utf8');
        const m = /\[console_scripts\]([\s\S]*?)(?:\n\[|$)/.exec(txt);
        if (m) for (const line of m[1].split('\n')) { const k = line.split('=')[0].trim(); if (k) out.consoleScripts.push(k); }
      }
    }
  }
  for (const m of installStderr.matchAll(/^\s*Built (\S+)/gm)) out.builtFromSource.push(m[1]);
  return out;
}

// ---------------------------------------------------------- args and env --
function dummyFor(spec: ArgSpec | EnvSpec): string {
  const hint = `${(spec as ArgSpec).valueHint ?? ''} ${spec.format ?? ''} ${(spec as ArgSpec).name ?? (spec as EnvSpec).name ?? ''}`.toLowerCase();
  if (spec.choices?.length) return String(spec.choices[0]);
  if (/\b(path|file|dir|directory|folder|root|workspace|vault)\b/.test(hint)) return join(HOME, 'proj', 'data');
  if (/\b(url|uri|endpoint|host)\b/.test(hint)) return 'http://127.0.0.1:9/';
  if (/\b(port)\b/.test(hint)) return '9';
  if (/\b(number|int|integer)\b/.test(hint)) return '1';
  if (/\b(bool|boolean)\b/.test(hint)) return 'false';
  return 'nl-dummy';
}
function buildArgs(specs: ArgSpec[]): { args: string[]; note: string[] } {
  const args: string[] = []; const note: string[] = [];
  for (const s of specs) {
    const fill = (v: string) => v.replace(/\{[^}]+\}/g, 'nl-dummy');
    if (s.type === 'named') {
      if (!s.name) continue;
      const v = s.value ?? s.default;
      if (v !== undefined && v !== null) { args.push(s.name, fill(String(v))); }
      else if (s.isRequired) { const d = dummyFor(s); args.push(s.name, d); note.push(`${s.name}=${d}`); }
    } else {
      const v = s.value ?? s.default;
      if (v !== undefined && v !== null) args.push(fill(String(v)));
      else if (s.isRequired) { const d = dummyFor(s); args.push(d); note.push(`positional=${d}`); }
    }
  }
  return { args, note };
}
function buildEnv(specs: EnvSpec[]): Record<string, string> {
  const env: Record<string, string> = {};
  for (const s of specs) {
    if (!s.name || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(s.name)) continue;
    const v = s.default ?? (s.choices?.length ? s.choices[0] : undefined);
    env[s.name] = v !== undefined && v !== null && String(v) !== '' ? String(v) : (s.format === 'number' ? '1' : s.format === 'boolean' ? 'false' : s.format === 'filepath' ? join(HOME, 'proj', 'data') : `nl-dummy-${s.name}`);
  }
  return env;
}

// ------------------------------------------------------------------- cell --
interface Cell {
  id: string; registryType: string; identifier: string; version: string; serverName: string; namespace: string;
  runtimeHint: string | null; repositoryUrl: string | null; websiteUrl: string | null; aliases: number;
  startedAt: string;
  install: { command: string[]; ok: boolean; exitCode: number | null; signal: string | null; ms: number; stderrTail: string; trace: TraceSummary | null; npm?: NpmScan; pypi?: PypiScan };
  firstRun: { attempted: boolean; reason?: string; command?: string[]; envNames?: string[]; argNotes?: string[]; ms?: number; exitCode?: number | null; signal?: string | null; client?: any; trace?: TraceSummary | null; stderrTail?: string; envOverridden?: string[]; retriedWith?: string; firstAttempt?: { client: any; trace: TraceSummary | null } };
  cacheBytes: number;
}

function dirBytes(p: string): number {
  let n = 0;
  const walk = (d: string): void => { for (const e of readdirSync(d, { withFileTypes: true })) { const q = join(d, e.name); if (e.isDirectory()) walk(q); else if (e.isFile()) { try { n += statSync(q).size; } catch { /* */ } } } };
  try { walk(p); } catch { /* */ }
  return n;
}

async function runCell(row: PopRow): Promise<Cell> {
  const id = `${row.registryType}::${row.identifier}@${row.version}`;
  makeHome();
  const proj = join(FH, 'proj');
  const cell: Cell = {
    id, registryType: row.registryType, identifier: row.identifier, version: row.version, serverName: row.serverName, namespace: row.namespace,
    runtimeHint: row.runtimeHint, repositoryUrl: row.repositoryUrl, websiteUrl: row.websiteUrl, aliases: row.aliases,
    startedAt: new Date().toISOString(),
    install: { command: [], ok: false, exitCode: null, signal: null, ms: 0, stderrTail: '', trace: null },
    firstRun: { attempted: false }, cacheBytes: 0,
  };
  const traceInstall = join(HOME, 'trace-install.txt');
  const straceArgv = (out: string, cmd: string[]) => [STRACE, '-f', '-qq', '-y', '-s', '512', '-e', 'trace=file,execve,network', '-o', out, '--', ...cmd];

  // ---- install arm
  let installCmd: string[];
  if (row.registryType === 'npm') {
    installCmd = ['npm', 'install', '--no-audit', '--no-fund', '--loglevel=error', `${row.identifier}@${row.version}`];
  } else {
    installCmd = ['sh', '-c', `uv venv --python /usr/bin/python3 -q .venv && uv pip install --python .venv/bin/python -q "${row.identifier}==${row.version}"`];
  }
  cell.install.command = installCmd;
  const ri = await run(bwrapArgv({}, join(HOME, 'proj'), straceArgv(traceInstall, installCmd)), INSTALL_TIMEOUT_MS);
  cell.install.ok = ri.code === 0; cell.install.exitCode = ri.code; cell.install.signal = ri.signal; cell.install.ms = ri.ms; cell.install.stderrTail = tail(ri.stderr);
  cell.install.trace = summariseTrace(join(FH, 'trace-install.txt'), join(HOME, 'proj'));
  rmSync(join(FH, 'trace-install.txt'), { force: true });
  if (row.registryType === 'npm') cell.install.npm = scanNodeModules(proj, row.identifier);
  else cell.install.pypi = scanVenv(proj, row.identifier, ri.stderr + ri.stdout);

  // ---- first-run arm
  let cmd: string[] | null = null; let reason: string | undefined;
  const { args, note } = buildArgs(row.packageArguments ?? []);
  if (!cell.install.ok) reason = 'install failed';
  else if (row.registryType === 'npm') {
    const b = cell.install.npm!.bin;
    if (b) cmd = [join(HOME, 'proj', 'node_modules', '.bin', b.name), ...args];
    else if (cell.install.npm!.hasMain) cmd = ['node', join(HOME, 'proj', 'node_modules', ...row.identifier.split('/')), ...args];
    else reason = 'no bin and no main';
  } else {
    const s = cell.install.pypi!;
    const mIdx = (row.runtimeArguments ?? []).findIndex((a) => a.value === '-m' || a.name === '-m');
    const mod = mIdx >= 0 ? (row.runtimeArguments[mIdx + 1]?.value ?? row.runtimeArguments[mIdx].default) : undefined;
    const norm = (x: string) => x.toLowerCase().replace(/[-_.]+/g, '-');
    const script = s.consoleScripts.find((c) => norm(c) === norm(row.identifier)) ?? s.consoleScripts.find((c) => norm(row.identifier).includes(norm(c)) || norm(c).includes(norm(row.identifier).replace(/^mcp-|-mcp$/g, ''))) ?? s.consoleScripts[0];
    if (script) cmd = [join(HOME, 'proj', '.venv', 'bin', script), ...args];
    else if (mod) cmd = [join(HOME, 'proj', '.venv', 'bin', 'python'), '-m', String(mod), ...args];
    else cmd = [join(HOME, 'proj', '.venv', 'bin', 'python'), '-m', row.identifier.replace(/-/g, '_'), ...args];
    if (!script && !mod) note.push('module guessed from identifier');
  }
  if (cmd) {
    const env = buildEnv(row.environmentVariables ?? []);
    for (const k of Object.keys(env)) if (k in ENV_OVERRIDES) env[k] = ENV_OVERRIDES[k];
    cell.firstRun = { attempted: true, command: cmd, envNames: Object.keys(env), argNotes: note, envOverridden: Object.keys(env).filter((k) => k in ENV_OVERRIDES) };
    const clientArgv = ['node', join(HARNESS, 'client.ts'), '--strace', STRACE, '--trace', join(HOME, 'trace-run.txt'), '--out', join(HOME, 'client.json'), '--handshake-ms', '20000', '--idle-ms', IDLE_MS, '--', ...cmd];
    const rr = await run(bwrapArgv(env, join(HOME, 'proj'), clientArgv), RUN_TIMEOUT_MS);
    cell.firstRun.ms = rr.ms; cell.firstRun.exitCode = rr.code; cell.firstRun.signal = rr.signal; cell.firstRun.stderrTail = tail(rr.stderr, 600);
    try { cell.firstRun.client = JSON.parse(readFileSync(join(FH, 'client.json'), 'utf8')); } catch { cell.firstRun.client = null; }
    cell.firstRun.trace = summariseTrace(join(FH, 'trace-run.txt'), join(HOME, 'proj'));
    // The registry entry gave no arguments and the bin answered with a usage
    // text that names an MCP-looking subcommand: retry once with it. Recorded,
    // so the metadata gap stays visible in the results.
    const cl = cell.firstRun.client;
    if (cl && !cl.initializeOk && args.length === 0) {
      const text = `${cl.firstStdoutLine ?? ''}\n${cl.stderrTail ?? ''}`;
      const m = /usage|commands?:/i.test(text) ? /(?:^|\s)(mcp|serve|server|start|stdio|run)(?=\s|$)/m.exec(text) : null;
      if (m) {
        rmSync(join(FH, 'trace-run.txt'), { force: true }); rmSync(join(FH, 'client.json'), { force: true });
        const cmd2 = [...cmd, m[1]];
        const rr2 = await run(bwrapArgv(env, join(HOME, 'proj'), [...clientArgv.slice(0, clientArgv.indexOf('--') + 1), ...cmd2]), RUN_TIMEOUT_MS);
        let cl2: any = null; try { cl2 = JSON.parse(readFileSync(join(FH, 'client.json'), 'utf8')); } catch { /* */ }
        if (cl2) {
          cell.firstRun.retriedWith = m[1]; cell.firstRun.firstAttempt = { client: cl, trace: cell.firstRun.trace };
          cell.firstRun.command = cmd2; cell.firstRun.ms = (cell.firstRun.ms ?? 0) + rr2.ms; cell.firstRun.exitCode = rr2.code; cell.firstRun.signal = rr2.signal;
          cell.firstRun.client = cl2; cell.firstRun.trace = summariseTrace(join(FH, 'trace-run.txt'), join(HOME, 'proj'));
        }
      }
    }
  } else {
    cell.firstRun = { attempted: false, reason, argNotes: note };
  }
  rmSync(FH, { recursive: true, force: true });
  cell.cacheBytes = dirBytes(CACHE_NPM) + dirBytes(CACHE_UV);
  if (cell.cacheBytes > CACHE_CAP_BYTES) { rmSync(CACHE_NPM, { recursive: true, force: true }); rmSync(CACHE_UV, { recursive: true, force: true }); }
  return cell;
}

// ------------------------------------------------------------------- main --
async function main(): Promise<void> {
  const [samplePath, resultsPath, ...rest] = process.argv.slice(2);
  const limit = rest.includes('--limit') ? Number(rest[rest.indexOf('--limit') + 1]) : Infinity;
  const only = rest.includes('--only') ? rest[rest.indexOf('--only') + 1] : null;
  mkdirSync(HARNESS, { recursive: true });
  cpSync(new URL('./client.ts', import.meta.url).pathname, join(HARNESS, 'client.ts'));
  const rows: PopRow[] = readFileSync(samplePath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const done = new Set<string>();
  if (existsSync(resultsPath)) for (const l of readFileSync(resultsPath, 'utf8').split('\n')) { if (!l.trim()) continue; try { done.add(JSON.parse(l).id); } catch { /* */ } }
  let n = 0;
  for (const row of rows) {
    const id = `${row.registryType}::${row.identifier}@${row.version}`;
    if (done.has(id)) continue;
    if (only && !id.includes(only)) continue;
    if (n >= limit) break;
    n++;
    const t0 = Date.now();
    process.stderr.write(`[${new Date().toISOString()}] ${id} … `);
    let cell: Cell;
    try { cell = await runCell(row); } catch (e) {
      cell = { id, registryType: row.registryType, identifier: row.identifier, version: row.version, serverName: row.serverName, namespace: row.namespace, runtimeHint: row.runtimeHint, repositoryUrl: row.repositoryUrl, websiteUrl: row.websiteUrl, aliases: row.aliases, startedAt: new Date().toISOString(), install: { command: [], ok: false, exitCode: null, signal: 'HARNESS_ERROR', ms: 0, stderrTail: String(e).slice(0, 500), trace: null }, firstRun: { attempted: false, reason: 'harness error' }, cacheBytes: 0 };
    }
    appendFileSync(resultsPath, JSON.stringify(cell) + '\n');
    const fr = cell.firstRun;
    process.stderr.write(`install=${cell.install.ok ? 'ok' : 'FAIL'} run=${fr.attempted ? (fr.client?.initializeOk ? `init ok, tools=${fr.client?.toolsCount ?? '?'}` : 'no handshake') : `skipped (${fr.reason})`} hosts(i/r)=${cell.install.trace?.net.hosts.length ?? '-'}/${fr.trace?.net.hosts.length ?? '-'} ${Math.round((Date.now() - t0) / 1000)}s\n`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
