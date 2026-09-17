// Runner: install + first run of agent plugins under strace, inside a bubblewrap
// sandbox whose $HOME is a fresh decoy home. mcp-install's instrument
// (measurements/mcp-install/src/run.ts) over four new populations; the sandbox,
// the decoys, the trace parser and the cell shape are carried over unchanged so
// that rates are comparable.
//
// Cell kinds (results/population-<arm>.ndjson, built by populations.ts):
//   npm            npm install <pkg>@<ver> under strace, then the package's bin
//                  driven through the protocol handshake (acp or mcp), idle 10 s.
//   uvx            uv venv + uv pip install <pkg>==<ver>, then the console script.
//   binary         curl the release archive, check the declared sha256, extract —
//                  all under strace — then run the declared command.
//   git-plugin     fetch the plugin repository at the pinned commit (git runs no
//                  plugin code; not traced), inventory what the plugin ships, then
//                  run every stdio MCP server it declares (its command, e.g.
//                  `npx -y …`, installs and starts under one trace) and every hook
//                  once with a synthetic event on stdin.
//   zed-extension  fetch the extension repository, recover from its Rust source
//                  what the WASM would install and run (npm package, GitHub
//                  release binary, or a literal command), then run that as an
//                  npm / binary / command cell. Heuristic; the resolution and its
//                  evidence are recorded per cell.
//
// Results are appended per cell as NDJSON; re-running skips finished cells.
//
// Usage: node run.ts <population.ndjson> <results.ndjson> [--limit N] [--only id]

import { spawn, execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync, cpSync, openSync, readSync, closeSync } from 'node:fs';
import { join, basename, dirname, resolve, relative } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { parseTraceLine, summariseHomeAccess, parseNetworkTrace, summariseNetwork, type HomeAccessSummary, type HostSummary } from './trace.ts';
import type { Spec } from './populations.ts';

const ROOT = '/var/tmp/nl-agent-plugins';
const FH = join(ROOT, `home-${process.pid}`); // one decoy home per runner process, so smoke tests can run beside a batch
const NO_BWRAP = process.env.NL_NO_BWRAP === '1';
const REAL_HOME = homedir();
const HOME = NO_BWRAP ? FH : REAL_HOME;
const USER = 'user'; // the sandbox's login name; the decoy home is bound at the real $HOME path, rewritten to /home/user in the published cells
const IDLE_MS = process.env.NL_IDLE_MS ?? '10000';
const NODE_DIR = dirname(dirname(process.execPath));
const TOOLBIN = join(ROOT, 'toolchain', 'bin');
const STRACE = join(TOOLBIN, 'strace');
const CACHE_NPM = join(ROOT, 'cache', 'npm');
const CACHE_UV = join(ROOT, 'cache', 'uv');
const CACHE_GIT = join(ROOT, 'cache', 'git');
const HARNESS = join(ROOT, 'harness');
const CACHE_CAP_BYTES = 3 * 1024 ** 3;
const INSTALL_TIMEOUT_MS = 300_000;
const BINARY_INSTALL_TIMEOUT_MS = 1_200_000; // release archives reach 300 MB and GitHub can serve them slowly
const RUN_TIMEOUT_MS = 60_000 + Number(IDLE_MS);
const HOOK_TIMEOUT_MS = 20_000;
const CTOOLCHAIN = '/var/tmp/norte-toolchain/bin';
const PYINCLUDE = join(ROOT, 'toolchain', 'root', 'usr', 'include', 'python3.13');
const PATH = `${HOME}/.local/bin:${TOOLBIN}:${CTOOLCHAIN}:/usr/local/bin:/usr/bin:/bin`;

// The same decoys as mcp-install, plus the config files of the editors whose
// plugins are being measured.
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
  '.config/zed/settings.json': '{"theme": "One Dark"}\n',
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
  'proj/README.md': '# nl-proj\n',
};

function makeHome(): void {
  rmSync(FH, { recursive: true, force: true });
  for (const [rel, body] of Object.entries(DECOYS)) {
    const p = join(FH, rel);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, body);
  }
  for (const d of ['Desktop', 'Downloads', '.npm', '.cache/uv', '.local/bin', '.local/share', '.config', 'proj/data', 'proj/.cursor']) mkdirSync(join(FH, d), { recursive: true });
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
    '--ro-bind', join(ROOT, 'toolchain', 'include'), '/usr/include',
    '--unshare-pid', '--unshare-ipc', '--unshare-uts', '--hostname', 'sandbox', '--die-with-parent', '--new-session', '--clearenv',
    '--setenv', 'HOME', HOME, '--setenv', 'PATH', PATH, '--setenv', 'USER', USER, '--setenv', 'LOGNAME', USER,
    '--setenv', 'LANG', 'C.UTF-8', '--setenv', 'TERM', 'dumb', '--setenv', 'SHELL', '/bin/bash',
    '--setenv', 'XDG_CONFIG_HOME', join(HOME, '.config'), '--setenv', 'XDG_CACHE_HOME', join(HOME, '.cache'),
    '--setenv', 'CC', 'gcc', '--setenv', 'CXX', 'g++', '--setenv', 'CFLAGS', `-I${PYINCLUDE} -I/usr/include`, '--setenv', 'CPPFLAGS', `-I${PYINCLUDE} -I/usr/include`,
  ];
  for (const [k, v] of Object.entries(env)) a.push('--setenv', k, v);
  a.push('--chdir', cwd, '--', ...cmd);
  return a;
}

function run(argv: string[], timeoutMs: number, stdin?: string): Promise<{ code: number | null; signal: string | null; stdout: string; stderr: string; ms: number }> {
  return new Promise((resolvePromise) => {
    const started = Date.now();
    const child = spawn(argv[0], argv.slice(1), { stdio: [stdin === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', (d) => { if (stdout.length < 200_000) stdout += d.toString(); });
    child.stderr.on('data', (d) => { if (stderr.length < 200_000) stderr += d.toString(); });
    if (stdin !== undefined) { try { child.stdin.write(stdin); child.stdin.end(); } catch { /* */ } }
    const t = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('close', (code, signal) => { clearTimeout(t); resolvePromise({ code, signal, stdout, stderr, ms: Date.now() - started }); });
    child.on('error', () => { clearTimeout(t); resolvePromise({ code: null, signal: 'SPAWN_ERROR', stdout, stderr, ms: Date.now() - started }); });
  });
}
const tail = (s: string, n = 1500) => { const t = s.trim(); return t.length <= n ? t : '…' + t.slice(-n); };
const head = (s: string, n = 600) => { const t = s.trim(); return t.length <= n ? t : t.slice(0, n) + '…'; };
const straceArgv = (out: string, cmd: string[]) => [STRACE, '-f', '-qq', '-y', '-s', '512', '-e', 'trace=file,execve,network', '-o', out, '--', ...cmd];

interface TraceSummary { traceLines: number; home: HomeAccessSummary[]; net: { hosts: HostSummary[]; dnsNames: string[] }; execBasenames: Record<string, number> }
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
function takeTrace(name: string, cwd: string): TraceSummary | null {
  const p = join(FH, name);
  const s = summariseTrace(p, cwd);
  rmSync(p, { force: true });
  return s;
}

interface NpmScan { packagesInstalled: number; installScripts: { pkg: string; version: string; hook: string; script: string }[]; nativeNodeFiles: number; bin: { name: string; path: string } | null; bins: string[]; hasMain: boolean }
function scanNodeModules(proj: string, id: string): NpmScan {
  const nm = join(proj, 'node_modules');
  const out: NpmScan = { packagesInstalled: 0, installScripts: [], nativeNodeFiles: 0, bin: null, bins: [], hasMain: false };
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
      if (typeof j.bin === 'string') { out.bin = { name: short, path: j.bin }; out.bins = [short]; }
      else if (j.bin && typeof j.bin === 'object') {
        const keys = Object.keys(j.bin); out.bins = keys;
        const k = keys.includes(short) ? short : keys[0];
        if (k) out.bin = { name: k, path: String(j.bin[k]) };
      }
    } catch { /* */ }
  }
  return out;
}

interface PypiScan { distsInstalled: number; soFiles: number; consoleScripts: string[]; builtFromSource: string[] }
function scanVenv(proj: string, id: string, installStderr: string): PypiScan {
  const out: PypiScan = { distsInstalled: 0, soFiles: 0, consoleScripts: [], builtFromSource: [] };
  const lib = join(proj, '.venv', 'lib');
  if (!existsSync(lib)) return out;
  const py = readdirSync(lib).find((d) => d.startsWith('python'));
  if (!py) return out;
  const sp = join(lib, py, 'site-packages');
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

// What a plugin repository ships: components, scripts, binaries. Tests the
// vendor's "No binaries are shipped" the cheap way — by file magic.
interface PluginInventory { files: number; bytes: number; skills: number; agents: number; commands: number; rules: number; scripts: { path: string; kind: string }[]; executables: number; binaries: { path: string; magic: string; bytes: number }[]; nodeModulesShipped: boolean; manifestKeys: string[] }
function inventoryPlugin(dir: string, manifest: any): PluginInventory {
  const inv: PluginInventory = { files: 0, bytes: 0, skills: 0, agents: 0, commands: 0, rules: 0, scripts: [], executables: 0, binaries: [], nodeModulesShipped: false, manifestKeys: Object.keys(manifest ?? {}) };
  const magicOf = (p: string): string | null => {
    let fd: number | null = null;
    try {
      fd = openSync(p, 'r'); const b = Buffer.alloc(4); const n = readSync(fd, b, 0, 4, 0);
      if (n < 4) return null;
      if (b[0] === 0x7f && b[1] === 0x45 && b[2] === 0x4c && b[3] === 0x46) return 'ELF';
      if (b[0] === 0x4d && b[1] === 0x5a) return 'PE';
      const u = b.readUInt32BE(0);
      if ([0xfeedface, 0xfeedfacf, 0xcefaedfe, 0xcffaedfe, 0xcafebabe].includes(u)) return 'Mach-O';
      if (b[0] === 0x00 && b[1] === 0x61 && b[2] === 0x73 && b[3] === 0x6d) return 'WASM';
      return null;
    } catch { return null; } finally { if (fd !== null) closeSync(fd); }
  };
  const walk = (d: string, depth: number): void => {
    if (depth > 10) return;
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      if (ent.name === '.git') continue;
      const p = join(d, ent.name); const rel = relative(dir, p);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules') inv.nodeModulesShipped = true;
        if (/^skills?$/i.test(ent.name)) inv.skills += readdirSync(p).length;
        if (/^agents?$/i.test(ent.name)) inv.agents += readdirSync(p).length;
        if (/^commands?$/i.test(ent.name)) inv.commands += readdirSync(p).length;
        if (/^rules?$/i.test(ent.name)) inv.rules += readdirSync(p).length;
        walk(p, depth + 1); continue;
      }
      if (!ent.isFile()) continue;
      inv.files++;
      let st; try { st = statSync(p); } catch { continue; }
      inv.bytes += st.size;
      if (st.mode & 0o111) inv.executables++;
      const ext = ent.name.split('.').pop()?.toLowerCase() ?? '';
      if (['sh', 'bash', 'zsh', 'py', 'js', 'mjs', 'cjs', 'ts', 'rb', 'pl', 'ps1'].includes(ext) && inv.scripts.length < 200) inv.scripts.push({ path: rel, kind: ext });
      const magic = st.size >= 4 ? magicOf(p) : null;
      if (magic && inv.binaries.length < 100) inv.binaries.push({ path: rel, magic, bytes: st.size });
    }
  };
  try { walk(dir, 0); } catch { /* */ }
  return inv;
}

function fetchAtRef(url: string, ref: string, dest: string): { ok: boolean; commit: string | null; ms: number; error?: string } {
  const t0 = Date.now();
  try {
    mkdirSync(dest, { recursive: true });
    execFileSync('git', ['init', '-q'], { cwd: dest });
    execFileSync('git', ['remote', 'add', 'origin', url], { cwd: dest });
    const env = { ...process.env, GIT_TERMINAL_PROMPT: '0' };
    let fetched = false;
    if (/^[0-9a-f]{40}$/.test(ref)) {
      try { execFileSync('git', ['fetch', '-q', '--depth', '1', 'origin', ref], { cwd: dest, env, timeout: 180_000, stdio: ['ignore', 'pipe', 'pipe'] }); fetched = true; } catch { /* server may refuse SHA fetch */ }
    }
    if (!fetched) {
      execFileSync('git', ['fetch', '-q', '--depth', '1', 'origin', ref || 'HEAD'], { cwd: dest, env, timeout: 180_000, stdio: ['ignore', 'pipe', 'pipe'] });
    }
    execFileSync('git', ['checkout', '-q', 'FETCH_HEAD'], { cwd: dest, env });
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dest, encoding: 'utf8' }).trim();
    return { ok: true, commit, ms: Date.now() - t0 };
  } catch (e: any) {
    return { ok: false, commit: null, ms: Date.now() - t0, error: String(e?.stderr ?? e).slice(0, 300) };
  }
}
function cachedClone(url: string, ref: string): { dir: string; commit: string | null; error?: string } {
  const key = createHash('sha256').update(`${url}@${ref}`).digest('hex').slice(0, 16);
  const dir = join(CACHE_GIT, key);
  if (existsSync(join(dir, '.git'))) return { dir, commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim() };
  const r = fetchAtRef(url, ref, dir);
  if (!r.ok) { rmSync(dir, { recursive: true, force: true }); return { dir, commit: null, error: r.error }; }
  return { dir, commit: r.commit };
}

interface McpDecl { name: string; kind: 'stdio' | 'remote' | 'docker' | 'unknown'; command?: string; args?: string[]; envNames?: string[]; url?: string; source: string }
interface HookDecl { event: string; command: string; source: string }
function readJson(p: string): any | null { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } }
function locatePluginDir(repo: string, name: string, catalogueSourcePaths: string[], subdir?: string): { dir: string; how: string } | null {
  if (subdir) return existsSync(join(repo, subdir)) ? { dir: join(repo, subdir), how: 'subdir' } : null;
  const rootMf = readJson(join(repo, '.cursor-plugin', 'plugin.json')) ?? readJson(join(repo, 'plugin.json'));
  if (rootMf && (String(rootMf.name ?? '') === name || catalogueSourcePaths.every((p) => !p.includes('/')))) return { dir: repo, how: rootMf.name === name ? 'root manifest name' : 'root manifest' };
  const mk = readJson(join(repo, '.cursor-plugin', 'marketplace.json'));
  const entry = mk?.plugins?.find((p: any) => p?.name === name);
  if (entry?.source && typeof entry.source === 'string' && existsSync(join(repo, entry.source))) return { dir: join(repo, entry.source), how: 'marketplace.json source' };
  for (const sp of catalogueSourcePaths) {
    const d = join(repo, dirname(sp));
    if (existsSync(d) && sp.includes('/')) return { dir: d, how: 'catalogue sourcePath' };
  }
  const stack = [repo]; let depth = 0;
  while (stack.length && depth < 400) {
    const d = stack.shift()!; depth++;
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      if (!ent.isDirectory() || ent.name === '.git' || ent.name === 'node_modules') continue;
      const p = join(d, ent.name);
      if (ent.name === '.cursor-plugin') { const j = readJson(join(p, 'plugin.json')); if (j?.name === name) return { dir: d, how: 'manifest search' }; }
      if (p.split('/').length - repo.split('/').length < 4) stack.push(p);
    }
  }
  if (rootMf) return { dir: repo, how: 'root manifest (name differs)' };
  // Other vendors' manifests or a bare mcp.json at the root: Cursor accepts them.
  const anyMf = readdirSync(repo).find((n) => /^\..*-plugin$/.test(n) && existsSync(join(repo, n, 'plugin.json')));
  if (anyMf) return { dir: repo, how: `root ${anyMf}/plugin.json` };
  if (['.mcp.json', 'mcp.json', 'plugin.json'].some((f) => existsSync(join(repo, f)))) return { dir: repo, how: 'root mcp.json' };
  return null;
}
function parseMcpEntries(obj: any, source: string, out: McpDecl[]): void {
  const servers = obj?.mcpServers && typeof obj.mcpServers === 'object' ? obj.mcpServers : (obj && typeof obj === 'object' && !obj.command && !obj.url ? obj : null);
  if (!servers) return;
  for (const [name, v] of Object.entries<any>(servers)) {
    if (!v || typeof v !== 'object') { out.push({ name, kind: 'unknown', source }); continue; }
    if (typeof v.url === 'string') { out.push({ name, kind: 'remote', url: v.url, source }); continue; }
    if (typeof v.command === 'string') {
      const kind = v.command === 'docker' || v.command === 'podman' ? 'docker' : 'stdio';
      out.push({ name, kind, command: v.command, args: Array.isArray(v.args) ? v.args.map(String) : [], envNames: v.env && typeof v.env === 'object' ? Object.keys(v.env) : [], source });
      continue;
    }
    out.push({ name, kind: 'unknown', source });
  }
}
function collectPlugin(dir: string, marketplace: 'cursor' | 'devin'): { manifest: any; manifestPath: string | null; mcp: McpDecl[]; hooks: HookDecl[]; notes: string[] } {
  const notes: string[] = [];
  let manifestPath: string | null = null; let manifest: any = null;
  const candidates = marketplace === 'devin' ? ['.devin-plugin/plugin.json', '.claude-plugin/plugin.json', 'plugin.json'] : ['.cursor-plugin/plugin.json', 'plugin.json', '.claude-plugin/plugin.json'];
  try { for (const n of readdirSync(dir)) if (/^\..*-plugin$/.test(n) && !candidates.includes(`${n}/plugin.json`)) candidates.push(`${n}/plugin.json`); } catch { /* */ }
  for (const c of candidates) {
    if (existsSync(join(dir, c))) { manifestPath = c; manifest = readJson(join(dir, c)); break; }
  }
  const mcp: McpDecl[] = []; const hooks: HookDecl[] = [];
  const seenFiles = new Set<string>();
  const mcpFrom = (spec: any, label: string): void => {
    if (typeof spec === 'string') {
      const p = join(dir, spec); if (seenFiles.has(p)) return; seenFiles.add(p);
      const j = readJson(p); if (j) parseMcpEntries(j, spec, mcp); else notes.push(`mcp file unreadable: ${spec}`);
    } else if (Array.isArray(spec)) spec.forEach((s, i) => mcpFrom(s, `${label}[${i}]`));
    else if (spec && typeof spec === 'object') parseMcpEntries({ mcpServers: spec }, label, mcp);
  };
  if (manifest?.mcpServers !== undefined) mcpFrom(manifest.mcpServers, manifestPath ?? 'manifest');
  // conventional files even when the manifest does not point at them
  for (const f of ['mcp.json', '.mcp.json', '.cursor/mcp.json']) { const p = join(dir, f); if (existsSync(p) && !seenFiles.has(p)) { seenFiles.add(p); const j = readJson(p); if (j) parseMcpEntries(j, f, mcp); } }
  const hooksFrom = (spec: any, label: string): void => {
    let j: any = spec; let src = label;
    if (typeof spec === 'string') { src = spec; j = readJson(join(dir, spec)); if (!j) { notes.push(`hooks file unreadable: ${spec}`); return; } }
    const h = j?.hooks && typeof j.hooks === 'object' ? j.hooks : j;
    if (!h || typeof h !== 'object') return;
    for (const [event, arr] of Object.entries<any>(h)) {
      const list = Array.isArray(arr) ? arr : [arr];
      for (const e of list) {
        const cmd = typeof e === 'string' ? e : e?.command ?? e?.cmd;
        if (typeof cmd === 'string') hooks.push({ event, command: cmd, source: src });
        else if (Array.isArray(e?.hooks)) for (const hh of e.hooks) if (typeof hh?.command === 'string') hooks.push({ event, command: hh.command, source: src });
      }
    }
  };
  if (manifest?.hooks !== undefined) hooksFrom(manifest.hooks, manifestPath ?? 'manifest');
  for (const f of ['hooks.json', 'hooks/hooks.json', '.cursor/hooks.json']) { const p = join(dir, f); if (existsSync(p) && !(typeof manifest?.hooks === 'string' && join(dir, manifest.hooks) === p)) { hooksFrom(f, f); } }
  const key = new Set<string>(); const dh: HookDecl[] = [];
  for (const h of hooks) { const k = `${h.event}|${h.command}`; if (!key.has(k)) { key.add(k); dh.push(h); } }
  return { manifest, manifestPath, mcp, hooks: dh, notes };
}

// Editor-provided placeholders resolve to the plugin and workspace directories;
// anything else is a variable the user would fill, which gets a dummy value.
const PLUGIN_ROOT_VARS = new Set(['PLUGIN_ROOT', 'CURSOR_PLUGIN_ROOT', 'CLAUDE_PLUGIN_ROOT', 'CURSOR_PLUGIN_DIR', 'pluginRoot', 'extensionPath']);
const WORKSPACE_VARS = new Set(['workspaceFolder', 'workspaceRoot', 'CURSOR_PROJECT_DIR', 'CLAUDE_PROJECT_DIR', 'cwd', 'projectDir', 'workspace']);
let PLACEHOLDER_PLUGIN_DIR = ''; let PLACEHOLDER_PROJECT_DIR = '';
function fillPlaceholders(s: string, envNames: Set<string>): string {
  const sub = (v: string, dflt?: string): string => {
    if (PLUGIN_ROOT_VARS.has(v)) return PLACEHOLDER_PLUGIN_DIR;
    if (WORKSPACE_VARS.has(v)) return PLACEHOLDER_PROJECT_DIR;
    if (v === 'userHome' || v === 'HOME') return HOME;
    if (dflt !== undefined) return dflt; // ${VAR:-default}: the plugin's own default, possibly empty
    envNames.add(v); return `nl-dummy-${v}`;
  };
  return s.replace(/\$\{(?:env:)?([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}/g, (_m, v, d) => sub(v, d))
    .replace(/\$([A-Z_][A-Z0-9_]{2,})\b/g, (_m, v) => sub(v));
}
function dummyEnv(names: Iterable<string>, declared: Record<string, string> = {}): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(declared)) if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) env[k] = fillPlaceholders(String(v), new Set());
  // Typed dummies where the name gives the type away; anything else is an inert string.
  const typed = (n: string): string => /LOG_?LEVEL/i.test(n) ? 'INFO' : /path|dir|file|root/i.test(n) ? join(HOME, 'proj', 'data') : /region/i.test(n) ? 'us-east-1' : /\bport\b|_PORT$/i.test(n) ? '9' : /timeout|retries|limit|max_|_count$/i.test(n) ? '30' : /^(debug|verbose|enable|disable)/i.test(n) ? 'false' : `nl-dummy-${n}`;
  for (const n of names) if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(n) && !(n in env)) env[n] = typed(n);
  for (const [k, v] of Object.entries(env)) if (v.startsWith('nl-dummy-') && /LOG_?LEVEL/i.test(k)) env[k] = 'INFO';
  return env;
}

// Synthetic hook input: the common fields every Cursor hook receives plus what
// the event names.
function hookInput(event: string, projectDir: string): string {
  const base: Record<string, unknown> = { conversation_id: 'nl-conv-0001', generation_id: 'nl-gen-0001', hook_event_name: event, workspace_roots: [projectDir], cursor_version: '2.5.0', model: 'nl-dummy-model' };
  const e = event.toLowerCase();
  if (e.includes('shell')) Object.assign(base, { command: 'ls -la', cwd: projectDir, output: 'total 0', duration: 12 });
  if (e.includes('mcp')) Object.assign(base, { tool_name: 'nl_tool', tool_input: { q: 'nl' }, url: 'http://127.0.0.1:9/', result: {} });
  if (e.includes('file') || e.includes('read') || e.includes('edit')) Object.assign(base, { file_path: join(projectDir, 'README.md'), edits: [{ old_string: '# nl-proj', new_string: '# nl-proj\n' }], content: '# nl-proj\n' });
  if (e.includes('prompt')) Object.assign(base, { prompt: 'hello', attachments: [] });
  if (e.includes('response')) Object.assign(base, { text: 'ok' });
  if (e === 'stop' || e.includes('stop')) Object.assign(base, { status: 'completed', loop_count: 0 });
  if (e.includes('session')) Object.assign(base, { source: 'startup' });
  if (e.includes('tool')) Object.assign(base, { tool_name: 'Shell', tool_input: { command: 'ls' }, tool_use_id: 'nl-tu-0001', tool_result: 'ok' });
  return JSON.stringify(base) + '\n';
}

interface ZedResolution { method: 'npm' | 'github-release' | 'command' | 'unresolved'; evidence: string[]; package?: string; version?: string; repo?: string; binaryName?: string; assetHint?: string; command?: string; args?: string[]; confidence: 'high' | 'medium' | 'low' }
function resolveZed(dir: string): ZedResolution {
  const evidence: string[] = [];
  let src = '';
  const walk = (d: string, depth: number): void => { if (depth > 4) return; for (const ent of readdirSync(d, { withFileTypes: true })) { const p = join(d, ent.name); if (ent.isDirectory() && ent.name !== '.git' && ent.name !== 'target') walk(p, depth + 1); else if (ent.isFile() && ent.name.endsWith('.rs')) src += `\n// ${relative(dir, p)}\n` + readFileSync(p, 'utf8'); } };
  try { walk(dir, 0); } catch { /* */ }
  const consts = new Map<string, string>();
  for (const m of src.matchAll(/const\s+([A-Z_][A-Z0-9_]*)\s*:\s*&str\s*=\s*"([^"]+)"/g)) consts.set(m[1], m[2]);
  const lit = (x: string): string | null => { const t = x.trim(); if (/^"/.test(t)) return t.slice(1, -1); return consts.get(t) ?? null; };
  const npm = /npm_install_package\s*\(\s*([^,]+),/.exec(src);
  if (npm) {
    const pkg = lit(npm[1]);
    if (pkg) {
      evidence.push(`npm_install_package(${npm[1].trim()})`);
      const cmdM = /command:\s*([^,\n]+),\s*args:\s*vec!\[([^\]]*)\]/s.exec(src.slice(src.indexOf('fn context_server_command') >= 0 ? src.indexOf('fn context_server_command') : 0));
      const args = cmdM ? [...cmdM[2].matchAll(/"([^"]*)"|([A-Za-z_][A-Za-z0-9_]*)/g)].map((a) => a[1] ?? `<${a[2]}>`) : [];
      return { method: 'npm', evidence, package: pkg, version: 'latest', args, confidence: 'high' };
    }
  }
  const gh = /latest_github_release\s*\(\s*([^,]+),/.exec(src);
  if (gh) {
    const repo = lit(gh[1]);
    if (repo) {
      evidence.push(`latest_github_release(${gh[1].trim()})`);
      const bn = consts.get('BINARY_NAME') ?? null;
      const asset = /asset_name\s*=\s*format!\(\s*"([^"]+)"/.exec(src);
      const argsM = /Command\s*\{[^}]*?args:\s*vec!\[([^\]]*)\]/s.exec(src);
      const args = argsM ? [...argsM[1].matchAll(/"([^"]*)"/g)].map((a) => a[1]) : [];
      if (argsM) evidence.push(`args: vec![${argsM[1].trim().slice(0, 80)}]`);
      return { method: 'github-release', evidence, repo, binaryName: bn ?? undefined, assetHint: asset?.[1], args, confidence: bn ? 'medium' : 'low' };
    }
  }
  const cmd = /Command\s*\{\s*command:\s*([^,\n]+),\s*args:\s*vec!\[([^\]]*)\]/s.exec(src);
  if (cmd) {
    const c = lit(cmd[1]);
    if (c && !/node_modules|binary_path|\.into\(\)/.test(cmd[1])) {
      evidence.push(`Command { command: ${cmd[1].trim()} }`);
      const args = [...cmd[2].matchAll(/"([^"]*)"/g)].map((a) => a[1]);
      return { method: 'command', evidence, command: c, args, confidence: args.length ? 'medium' : 'low' };
    }
  }
  if (/download_file\s*\(/.test(src)) evidence.push('download_file(…) with a non-literal URL');
  return { method: 'unresolved', evidence, confidence: 'low' };
}
function githubReleaseAsset(repo: string, hint?: string): { url: string; name: string; tag: string } | null {
  try {
    const j = JSON.parse(execFileSync('curl', ['-sS', '-H', 'Accept: application/vnd.github+json', `https://api.github.com/repos/${repo}/releases/latest`], { encoding: 'utf8', maxBuffer: 20_000_000 }));
    const assets: any[] = j.assets ?? [];
    const score = (n: string): number => { const s = n.toLowerCase(); let k = 0; if (/linux/.test(s)) k += 4; if (/x86_64|amd64|x64/.test(s)) k += 3; if (/\.(tar\.gz|tgz|zip|tar\.xz)$/.test(s)) k += 1; if (/musl/.test(s)) k -= 1; if (/arm|aarch|darwin|mac|win|\.deb|\.rpm|\.sha|\.sig|\.txt|sbom|\.json/.test(s)) k -= 10; return k; };
    const best = assets.map((a) => ({ a, s: score(String(a.name)) })).sort((x, y) => y.s - x.s)[0];
    if (!best || best.s < 4) return null;
    return { url: String(best.a.browser_download_url), name: String(best.a.name), tag: String(j.tag_name ?? '') };
  } catch { return null; }
}

interface RunResult { attempted: boolean; reason?: string; command?: string[]; envNames?: string[]; cwd?: string; installsAtRun?: boolean; ms?: number; exitCode?: number | null; signal?: string | null; client?: any; trace?: TraceSummary | null; stderrTail?: string; retriedWith?: string; firstAttempt?: { client: any; trace: TraceSummary | null } }
interface InstallResult { method: string; command?: string[]; ok: boolean; exitCode: number | null; signal: string | null; ms: number; stderrTail: string; trace: TraceSummary | null; npm?: NpmScan; pypi?: PypiScan; binary?: { archive: string; bytes: number | null; sha256Declared: string | null; sha256Actual: string | null; sha256Match: boolean | null; extracted: string[] }; git?: { commit: string | null; error?: string } }
interface Cell {
  id: string; arm: string; kind: string; subject: string; subjectVersion: string | null; source: string | null; protocol: string;
  startedAt: string;
  declared: unknown; fieldTruth?: unknown;
  install: InstallResult;
  firstRun: RunResult;
  plugin?: { dir: string; how: string; manifestPath: string | null; inventory: PluginInventory; mcpDeclared: McpDecl[]; hooksDeclared: HookDecl[]; mcpRuns: ({ name: string; kind: string; url?: string; command?: string } & Partial<RunResult>)[]; hookRuns: { event: string; command: string; ms: number; exitCode: number | null; signal: string | null; stdoutHead: string; stderrTail: string; trace: TraceSummary | null }[]; notes: string[] };
  zed?: { commit: string | null; resolution: ZedResolution; asset?: { url: string; name: string; tag: string } | null };
  notes: string[];
  cacheBytes: number;
}

function dirBytes(p: string): number {
  let n = 0;
  const walk = (d: string): void => { for (const e of readdirSync(d, { withFileTypes: true })) { const q = join(d, e.name); if (e.isDirectory()) walk(q); else if (e.isFile()) { try { n += statSync(q).size; } catch { /* */ } } } };
  try { walk(p); } catch { /* */ }
  return n;
}
const emptyInstall = (method: string): InstallResult => ({ method, ok: false, exitCode: null, signal: null, ms: 0, stderrTail: '', trace: null });

async function installNpm(cell: Cell, pkg: string, ver: string): Promise<void> {
  const cmd = ['npm', 'install', '--no-audit', '--no-fund', '--loglevel=error', `${pkg}@${ver}`];
  cell.install = { ...emptyInstall('npm install'), command: cmd };
  const r = await run(bwrapArgv({}, join(HOME, 'proj'), straceArgv(join(HOME, 'trace-install.txt'), cmd)), INSTALL_TIMEOUT_MS);
  Object.assign(cell.install, { ok: r.code === 0, exitCode: r.code, signal: r.signal, ms: r.ms, stderrTail: tail(r.stderr) });
  cell.install.trace = takeTrace('trace-install.txt', join(HOME, 'proj'));
  cell.install.npm = scanNodeModules(join(FH, 'proj'), pkg);
}
async function installUvx(cell: Cell, pkg: string, ver: string): Promise<void> {
  const spec = ver && ver !== 'latest' ? `${pkg}==${ver}` : pkg;
  const cmd = ['sh', '-c', `uv venv --python /usr/bin/python3 -q .venv && uv pip install --python .venv/bin/python -q "${spec}"`];
  cell.install = { ...emptyInstall('uv pip install'), command: cmd };
  const r = await run(bwrapArgv({}, join(HOME, 'proj'), straceArgv(join(HOME, 'trace-install.txt'), cmd)), INSTALL_TIMEOUT_MS);
  Object.assign(cell.install, { ok: r.code === 0, exitCode: r.code, signal: r.signal, ms: r.ms, stderrTail: tail(r.stderr) });
  cell.install.trace = takeTrace('trace-install.txt', join(HOME, 'proj'));
  cell.install.pypi = scanVenv(join(FH, 'proj'), pkg, r.stderr + r.stdout);
}
async function installBinary(cell: Cell, archive: string, sha256: string | null): Promise<string> {
  const dest = join(HOME, 'proj', 'agent');
  const low = archive.toLowerCase();
  const base = basename(new URL(archive).pathname).replace(/[^A-Za-z0-9._-]/g, '_');
  // A release may be an archive or the bare executable; bare ones keep their name.
  const extract = low.endsWith('.zip') ? 'unzip -q -o archive.bin -d .' : low.endsWith('.tar.xz') || low.endsWith('.txz') ? 'tar -xJf archive.bin' : low.endsWith('.tar.bz2') || low.endsWith('.tbz2') || low.endsWith('.tbz') ? 'tar -xjf archive.bin' : low.endsWith('.tar.zst') ? 'tar --zstd -xf archive.bin' : low.endsWith('.tar.gz') || low.endsWith('.tgz') || low.endsWith('.tar') ? 'tar -xzf archive.bin' : low.endsWith('.gz') ? `gunzip -c archive.bin > "${base.replace(/\.gz$/, '')}" && chmod +x "${base.replace(/\.gz$/, '')}"` : `mv archive.bin "${base}" && chmod +x "${base}"`;
  const cmd = ['sh', '-c', `mkdir -p agent && cd agent && curl -sSL --max-time 1000 -o archive.bin "${archive}" && sha256sum archive.bin > .sha256 && (${extract})`];
  cell.install = { ...emptyInstall('curl + extract'), command: cmd, binary: { archive, bytes: null, sha256Declared: sha256, sha256Actual: null, sha256Match: null, extracted: [] } };
  const r = await run(bwrapArgv({}, join(HOME, 'proj'), straceArgv(join(HOME, 'trace-install.txt'), cmd)), BINARY_INSTALL_TIMEOUT_MS);
  Object.assign(cell.install, { ok: r.code === 0, exitCode: r.code, signal: r.signal, ms: r.ms, stderrTail: tail(r.stderr) });
  cell.install.trace = takeTrace('trace-install.txt', join(HOME, 'proj'));
  const b = cell.install.binary!;
  try { b.bytes = statSync(join(FH, 'proj', 'agent', 'archive.bin')).size; } catch { /* */ }
  try { b.sha256Actual = readFileSync(join(FH, 'proj', 'agent', '.sha256'), 'utf8').split(/\s+/)[0]; } catch { /* */ }
  b.sha256Match = sha256 && b.sha256Actual ? sha256.toLowerCase() === b.sha256Actual.toLowerCase() : null;
  try { b.extracted = readdirSync(join(FH, 'proj', 'agent')).filter((f) => f !== 'archive.bin' && f !== '.sha256').slice(0, 30); } catch { /* */ }
  return dest;
}

// Commands that fetch and install their package as part of starting (the way an
// editor runs `npx -y …`): the handshake window covers the install.
const INSTALLS_AT_RUN = new Set(['npx', 'uvx', 'pipx', 'bunx', 'deno', 'dlx', 'pnpx']);
async function firstRun(cell: Cell, cmd: string[], env: Record<string, string>, cwd: string, protocol: string): Promise<RunResult> {
  const out: RunResult = { attempted: true, command: cmd, envNames: Object.keys(env), cwd };
  const installsAtRun = INSTALLS_AT_RUN.has(basename(cmd[0]));
  const handshakeMs = installsAtRun ? 120_000 : 20_000;
  out.installsAtRun = installsAtRun;
  const clientArgv = ['node', join(HARNESS, 'client.ts'), '--protocol', protocol, '--strace', STRACE, '--trace', join(HOME, 'trace-run.txt'), '--out', join(HOME, 'client.json'), '--handshake-ms', String(handshakeMs), '--idle-ms', IDLE_MS, '--cwd', cwd, '--', ...cmd];
  const rr = await run(bwrapArgv(env, cwd, clientArgv), RUN_TIMEOUT_MS + (installsAtRun ? 120_000 : 0));
  out.ms = rr.ms; out.exitCode = rr.code; out.signal = rr.signal; out.stderrTail = tail(rr.stderr, 600);
  try { out.client = JSON.parse(readFileSync(join(FH, 'client.json'), 'utf8')); } catch { out.client = null; }
  rmSync(join(FH, 'client.json'), { force: true });
  out.trace = takeTrace('trace-run.txt', cwd);
  return out;
}

// mcp-install's rule: the binary answered with a usage text naming an
// MCP-looking subcommand and no arguments were given — retry once with it.
async function firstRunWithRetry(cell: Cell, cmd: string[], env: Record<string, string>, cwd: string, protocol: string, argsGiven: boolean): Promise<RunResult> {
  const r = await firstRun(cell, cmd, env, cwd, protocol);
  const cl = r.client;
  if (cl && !cl.initializeOk && !argsGiven) {
    const text = `${cl.firstStdoutLine ?? ''}\n${cl.stderrTail ?? ''}`;
    const m = /usage|commands?:/i.test(text) ? /(?:^|\s)(mcp|serve|server|start|stdio|run)(?=\s|$)/m.exec(text) : null;
    if (m) {
      const r2 = await firstRun(cell, [...cmd, m[1]], env, cwd, protocol);
      if (r2.client) { r2.retriedWith = m[1]; r2.firstAttempt = { client: cl, trace: r.trace ?? null }; return r2; }
    }
  }
  return r;
}

async function runCell(spec: Spec): Promise<Cell> {
  makeHome();
  const cell: Cell = {
    id: spec.id, arm: spec.arm, kind: spec.kind, subject: spec.subject, subjectVersion: spec.subjectVersion, source: spec.source, protocol: spec.protocol,
    startedAt: new Date().toISOString(), declared: spec.declared, fieldTruth: spec.fieldTruth,
    install: emptyInstall('none'), firstRun: { attempted: false }, notes: [...(spec.notes ?? [])], cacheBytes: 0,
  };
  const proj = join(HOME, 'proj');

  if (spec.kind === 'npm' || spec.kind === 'uvx') {
    if (spec.kind === 'npm') await installNpm(cell, spec.package!, spec.version!); else await installUvx(cell, spec.package!, spec.version!);
    let cmd: string[] | null = null; let reason: string | undefined;
    if (!cell.install.ok) reason = 'install failed';
    else if (spec.kind === 'npm') {
      const b = cell.install.npm!.bin;
      if (b) {
        // npm sometimes installs a package without linking its bin (cline@3.0.61,
        // reproduced unsandboxed); the package's own bin path is then run directly.
        const link = join(FH, 'proj', 'node_modules', '.bin', b.name);
        const direct = join(FH, 'proj', 'node_modules', ...spec.package!.split('/'), b.path);
        if (existsSync(link)) cmd = [join(proj, 'node_modules', '.bin', b.name), ...(spec.args ?? [])];
        else if (existsSync(direct)) { cmd = [join(proj, 'node_modules', ...spec.package!.split('/'), b.path), ...(spec.args ?? [])]; cell.notes.push(`npm created no .bin link for ${b.name}; ran ${b.path} directly`); try { execFileSync('chmod', ['+x', direct]); } catch { /* */ } }
        else reason = `bin ${b.path} not present after install`;
      }
      else if (cell.install.npm!.hasMain) cmd = ['node', join(proj, 'node_modules', ...spec.package!.split('/')), ...(spec.args ?? [])];
      else reason = 'no bin and no main';
    } else {
      const s = cell.install.pypi!;
      const norm = (x: string) => x.toLowerCase().replace(/[-_.]+/g, '-');
      const script = s.consoleScripts.find((c) => norm(c) === norm(spec.package!)) ?? s.consoleScripts[0];
      if (script) cmd = [join(proj, '.venv', 'bin', script), ...(spec.args ?? [])];
      else reason = 'no console script';
    }
    if (cmd) cell.firstRun = await firstRunWithRetry(cell, cmd, dummyEnv([], spec.env), proj, spec.protocol, (spec.args ?? []).length > 0);
    else cell.firstRun = { attempted: false, reason };
  }

  else if (spec.kind === 'binary') {
    const dest = await installBinary(cell, spec.archive!, spec.sha256 ?? null);
    if (!cell.install.ok) cell.firstRun = { attempted: false, reason: 'download or extract failed' };
    else {
      let c = spec.cmd || '';
      if (!c) { const ex = cell.install.binary!.extracted; c = ex.length === 1 ? `./${ex[0]}` : ''; }
      if (!c) cell.firstRun = { attempted: false, reason: 'no command declared and archive has several files' };
      else {
        const c0 = c.startsWith('./') || c.startsWith('/') ? c : `./${c}`;
        // the declared cmd may live in a subdirectory of the archive
        let exe = join(dest, c0);
        if (!existsSync(join(FH, 'proj', 'agent', c0))) {
          const found = (function find(d: string, depth: number): string | null { if (depth > 3) return null; for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isFile() && e.name === basename(c0)) return p; if (e.isDirectory()) { const r = find(p, depth + 1); if (r) return r; } } return null; })(join(FH, 'proj', 'agent'), 0);
          if (found) { exe = join(dest, relative(join(FH, 'proj', 'agent'), found)); cell.notes.push(`command found at ${relative(join(FH, 'proj', 'agent'), found)}`); }
        }
        try { execFileSync('chmod', ['+x', join(FH, relative(HOME, exe))]); } catch { /* */ }
        cell.firstRun = await firstRunWithRetry(cell, [exe, ...(spec.args ?? [])], dummyEnv([], spec.env), dest, spec.protocol, (spec.args ?? []).length > 0);
      }
    }
  }

  else if (spec.kind === 'git-plugin') {
    const t0 = Date.now();
    const clone = cachedClone(spec.gitUrl!, spec.gitRef!);
    cell.install = { ...emptyInstall('git fetch at pinned commit (not traced: git runs no plugin code)'), ok: clone.commit !== null, ms: Date.now() - t0, git: { commit: clone.commit, error: clone.error } };
    if (clone.commit) {
      const catalogueSourcePaths = ((spec.declared as any)?.mcpServers ?? []).map((m: any) => String(m.sourcePath ?? '')).filter(Boolean);
      const loc = locatePluginDir(clone.dir, spec.subject, catalogueSourcePaths, spec.subdir);
      if (!loc) { cell.notes.push('plugin directory not located in repository'); cell.firstRun = { attempted: false, reason: 'plugin directory not located' }; }
      else {
        const pluginDir = join(proj, 'plugin');
        PLACEHOLDER_PLUGIN_DIR = pluginDir; PLACEHOLDER_PROJECT_DIR = proj;
        cpSync(loc.dir, join(FH, 'proj', 'plugin'), { recursive: true, filter: (s) => !s.includes('/.git/') && !s.endsWith('/.git') });
        const col = collectPlugin(join(FH, 'proj', 'plugin'), spec.marketplace!);
        const inv = inventoryPlugin(join(FH, 'proj', 'plugin'), col.manifest);
        cell.plugin = { dir: relative(clone.dir, loc.dir) || '.', how: loc.how, manifestPath: col.manifestPath, inventory: inv, mcpDeclared: col.mcp, hooksDeclared: col.hooks, mcpRuns: [], hookRuns: [], notes: col.notes };
        // MCP servers: every stdio one is started the way the editor would start it
        for (const m of col.mcp) {
          if (m.kind !== 'stdio') { cell.plugin.mcpRuns.push({ name: m.name, kind: m.kind, url: m.url, command: m.command }); continue; }
          const envNames = new Set<string>(m.envNames ?? []);
          const args = (m.args ?? []).map((a) => fillPlaceholders(a, envNames));
          const cmd0 = fillPlaceholders(m.command!, envNames);
          const declaredEnv: Record<string, string> = {};
          for (const n of envNames) declaredEnv[n] = `nl-dummy-${n}`;
          const env = dummyEnv(envNames, declaredEnv);
          const cmd = [cmd0.startsWith('./') ? join(pluginDir, cmd0) : cmd0, ...args];
          const r = await firstRun(cell, cmd, env, pluginDir, 'mcp');
          cell.plugin.mcpRuns.push({ name: m.name, kind: m.kind, command: m.command, ...r });
          rmSync(join(FH, 'proj', 'plugin', 'node_modules'), { recursive: true, force: true });
        }
        for (const h of col.hooks.slice(0, 12)) {
          // The variables plugins actually use for their own directory, in either
          // spelling; the editor substitutes some (${extensionPath}) and exports others.
          const dataDir = join(HOME, '.cursor', 'plugin-data', spec.subject);
          mkdirSync(join(FH, '.cursor', 'plugin-data', spec.subject), { recursive: true });
          const env = { CURSOR_PROJECT_DIR: proj, CLAUDE_PROJECT_DIR: proj, workspaceFolder: proj, CURSOR_PLUGIN_ROOT: pluginDir, CURSOR_PLUGIN_DIR: pluginDir, CLAUDE_PLUGIN_ROOT: pluginDir, PLUGIN_ROOT: pluginDir, GROK_PLUGIN_ROOT: pluginDir, CODEX_PLUGIN_ROOT: pluginDir, extensionPath: pluginDir, CLAUDE_PLUGIN_DATA: dataDir, CURSOR_HOOK_EVENT: h.event };
          // Every spelling is exported and the shell expands the command itself, so
          // ${VAR}, $VAR, ${VAR:-default} and nested defaults all resolve.
          const cmd = ['sh', '-c', h.command];
          const r = await run(bwrapArgv(env, pluginDir, straceArgv(join(HOME, 'trace-hook.txt'), cmd)), HOOK_TIMEOUT_MS, hookInput(h.event, proj));
          cell.plugin.hookRuns.push({ event: h.event, command: h.command, ms: r.ms, exitCode: r.code, signal: r.signal, stdoutHead: head(r.stdout), stderrTail: tail(r.stderr, 400), trace: takeTrace('trace-hook.txt', pluginDir) });
        }
        if (col.hooks.length > 12) cell.notes.push(`${col.hooks.length - 12} further hooks not run`);
        cell.firstRun = { attempted: col.mcp.some((m) => m.kind === 'stdio') || col.hooks.length > 0, reason: col.mcp.length === 0 && col.hooks.length === 0 ? 'plugin declares no MCP server and no hook' : col.mcp.every((m) => m.kind !== 'stdio') && col.hooks.length === 0 ? 'only remote or docker MCP servers' : undefined };
      }
    } else cell.firstRun = { attempted: false, reason: 'fetch failed' };
  }

  else if (spec.kind === 'zed-extension') {
    const t0 = Date.now();
    const clone = cachedClone(spec.gitUrl!, spec.gitRef || 'HEAD');
    cell.install = { ...emptyInstall('git fetch of the extension source (not traced)'), ok: clone.commit !== null, ms: Date.now() - t0, git: { commit: clone.commit, error: clone.error } };
    if (!clone.commit) { cell.firstRun = { attempted: false, reason: 'fetch failed' }; }
    else {
      const res = resolveZed(clone.dir);
      cell.zed = { commit: clone.commit, resolution: res };
      if (res.method === 'npm') {
        await installNpm(cell, res.package!, res.version ?? 'latest');
        cell.install.method = 'npm install (what the extension would npm_install_package)';
        if (cell.install.ok) {
          const b = cell.install.npm!.bin;
          const args = (res.args ?? []).filter((a) => !a.startsWith('<'));
          const linkOk = b && existsSync(join(FH, 'proj', 'node_modules', '.bin', b.name));
          const cmd = b && linkOk ? [join(proj, 'node_modules', '.bin', b.name), ...args] : b && existsSync(join(FH, 'proj', 'node_modules', ...res.package!.split('/'), b.path)) ? [join(proj, 'node_modules', ...res.package!.split('/'), b.path), ...args] : cell.install.npm!.hasMain ? ['node', join(proj, 'node_modules', ...res.package!.split('/')), ...args] : null;
          if (b && !linkOk && cmd) cell.notes.push(`npm created no .bin link for ${b.name}; ran ${b.path} directly`);
          cell.firstRun = cmd ? await firstRunWithRetry(cell, cmd, dummyEnv([]), proj, 'mcp', args.length > 0) : { attempted: false, reason: 'no bin and no main' };
        } else cell.firstRun = { attempted: false, reason: 'install failed' };
      } else if (res.method === 'github-release') {
        const asset = githubReleaseAsset(res.repo!, res.assetHint);
        cell.zed.asset = asset;
        if (!asset) cell.firstRun = { attempted: false, reason: 'no linux x86_64 asset in the latest release' };
        else {
          const dest = await installBinary(cell, asset.url, null);
          cell.install.method = 'curl + extract (what the extension would download_file)';
          if (!cell.install.ok) cell.firstRun = { attempted: false, reason: 'download or extract failed' };
          else {
            const ex = cell.install.binary!.extracted;
            const bn = res.binaryName;
            const pick = bn && ex.includes(bn) ? bn : ex.length === 1 ? ex[0] : null;
            if (!pick) cell.firstRun = { attempted: false, reason: `binary not identified among ${ex.length} extracted files` };
            else { try { execFileSync('chmod', ['+x', join(FH, 'proj', 'agent', pick)]); } catch { /* */ } cell.firstRun = await firstRunWithRetry(cell, [join(dest, pick), ...(res.args ?? [])], dummyEnv([]), dest, 'mcp', (res.args ?? []).length > 0); }
          }
        }
      } else if (res.method === 'command') {
        cell.firstRun = await firstRunWithRetry(cell, [res.command!, ...(res.args ?? [])], dummyEnv([]), proj, 'mcp', (res.args ?? []).length > 0);
      } else cell.firstRun = { attempted: false, reason: 'command not recoverable from source' };
    }
  }

  rmSync(FH, { recursive: true, force: true });
  cell.cacheBytes = dirBytes(CACHE_NPM) + dirBytes(CACHE_UV) + dirBytes(CACHE_GIT);
  if (cell.cacheBytes > CACHE_CAP_BYTES) { rmSync(CACHE_NPM, { recursive: true, force: true }); rmSync(CACHE_UV, { recursive: true, force: true }); rmSync(CACHE_GIT, { recursive: true, force: true }); }
  return cell;
}

async function main(): Promise<void> {
  const [popPath, resultsPath, ...rest] = process.argv.slice(2);
  const limit = rest.includes('--limit') ? Number(rest[rest.indexOf('--limit') + 1]) : Infinity;
  const only = rest.includes('--only') ? rest[rest.indexOf('--only') + 1] : null;
  mkdirSync(HARNESS, { recursive: true }); mkdirSync(CACHE_GIT, { recursive: true });
  cpSync(new URL('./client.ts', import.meta.url).pathname, join(HARNESS, 'client.ts'));
  const specs: Spec[] = readFileSync(popPath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const done = new Set<string>();
  if (existsSync(resultsPath)) for (const l of readFileSync(resultsPath, 'utf8').split('\n')) { if (!l.trim()) continue; try { done.add(JSON.parse(l).id); } catch { /* */ } }
  let n = 0;
  for (const spec of specs) {
    if (done.has(spec.id)) continue;
    if (only && !spec.id.includes(only)) continue;
    if (n >= limit) break;
    n++;
    const t0 = Date.now();
    process.stderr.write(`[${new Date().toISOString()}] ${spec.id} … `);
    let cell: Cell;
    try { cell = await runCell(spec); } catch (e) {
      cell = { id: spec.id, arm: spec.arm, kind: spec.kind, subject: spec.subject, subjectVersion: spec.subjectVersion, source: spec.source, protocol: spec.protocol, startedAt: new Date().toISOString(), declared: spec.declared, fieldTruth: spec.fieldTruth, install: { ...emptyInstall('harness error'), signal: 'HARNESS_ERROR', stderrTail: String(e).slice(0, 500) }, firstRun: { attempted: false, reason: 'harness error' }, notes: [], cacheBytes: 0 };
    }
    // The decoy home is bound at the real $HOME path so traces read like a
    // developer's; in the published cells that path is /home/user.
    // Agents also encode the workspace path into file names (URL-encoded, dashes).
    const published = JSON.stringify(cell).replaceAll(REAL_HOME, '/home/user').replaceAll(encodeURIComponent(REAL_HOME), encodeURIComponent('/home/user')).replaceAll(REAL_HOME.replaceAll('/', '-'), '/home/user'.replaceAll('/', '-'));
    appendFileSync(resultsPath, published + '\n');
    const fr = cell.firstRun; const cl = fr.client;
    const hs = cl ? (cl.initializeOk ? (cell.protocol === 'acp' ? `init ok, session/new=${cl.sessionNew?.status}` : `init ok, tools=${cl.toolsCount ?? '?'}`) : 'no handshake') : '';
    const pl = cell.plugin ? `mcp ${cell.plugin.mcpRuns.filter((m) => m.attempted).length}/${cell.plugin.mcpDeclared.length} hooks ${cell.plugin.hookRuns.length} bin ${cell.plugin.inventory.binaries.length}` : '';
    process.stderr.write(`install=${cell.install.ok ? 'ok' : 'FAIL'} run=${fr.attempted ? hs || 'ran' : `skipped (${fr.reason})`} ${pl} hosts(i/r)=${cell.install.trace?.net.hosts.length ?? '-'}/${fr.trace?.net.hosts.length ?? '-'} ${Math.round((Date.now() - t0) / 1000)}s\n`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
