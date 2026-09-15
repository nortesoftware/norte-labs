// Minimal MCP stdio client for the first-run arm. Runs INSIDE the sandbox.
//
// Spawns the server under strace, performs initialize → notifications/initialized
// → tools/list, then idles for a fixed window so anything the server does after
// start-up (update checks, telemetry, credential probing) lands in the trace.
// Writes a JSON summary to --out and exits; the runner parses the trace.
//
// Usage: node client.ts --strace <bin> --trace <file> --out <file>
//          [--handshake-ms 20000] [--idle-ms 10000] -- <server argv...>

import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const sep = argv.indexOf('--');
const opts = argv.slice(0, sep);
const serverArgv = argv.slice(sep + 1);
const opt = (k: string, d: string) => { const i = opts.indexOf(k); return i >= 0 ? opts[i + 1] : d; };
const stracePath = opt('--strace', 'strace');
const traceOut = opt('--trace', '/tmp/trace.txt');
const outPath = opt('--out', '/tmp/client.json');
const handshakeMs = Number(opt('--handshake-ms', '20000'));
const idleMs = Number(opt('--idle-ms', '10000'));

interface ToolInfo { name: string; annotations?: Record<string, unknown>; description?: string; inputSchema?: unknown }
interface Result {
  serverArgv: string[];
  spawned: boolean;
  spawnError?: string;
  initializeOk: boolean;
  initializeMs?: number;
  protocolVersion?: string;
  serverInfo?: { name?: string; version?: string };
  capabilities?: string[];
  toolsListOk: boolean;
  toolsCount?: number;
  tools?: { name: string; annotations: Record<string, unknown> | null; descriptionLength: number }[];
  annotationSummary?: { withAny: number; readOnlyHint: number; destructiveHint: number; idempotentHint: number; openWorldHint: number; readOnlyTrue: number; destructiveTrue: number; destructiveFalse: number; openWorldTrue: number };
  exitedEarly: boolean;
  exitCode: number | null;
  signal: string | null;
  stderrTail: string;
  stdoutNonJsonLines: number;
  firstStdoutLine?: string;
  totalMs: number;
}

const started = Date.now();
const res: Result = { serverArgv, spawned: false, initializeOk: false, toolsListOk: false, exitedEarly: false, exitCode: null, signal: null, stderrTail: '', stdoutNonJsonLines: 0, totalMs: 0 };

const child = spawn(stracePath, ['-f', '-qq', '-y', '-s', '512', '-e', 'trace=file,execve,network', '-o', traceOut, '--', ...serverArgv], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env,
});
let stderr = '';
let stdoutBuf = '';
const pending = new Map<number, (msg: any) => void>();
let exited = false;

child.on('error', (e) => { res.spawnError = String(e); finish(); });
child.on('spawn', () => { res.spawned = true; });
child.stderr.on('data', (d) => { if (stderr.length < 100_000) stderr += d.toString(); });
child.stdout.on('data', (d) => {
  stdoutBuf += d.toString();
  let nl: number;
  while ((nl = stdoutBuf.indexOf('\n')) >= 0) {
    const line = stdoutBuf.slice(0, nl).trim();
    stdoutBuf = stdoutBuf.slice(nl + 1);
    if (!line) continue;
    if (res.firstStdoutLine === undefined) res.firstStdoutLine = line.slice(0, 200);
    try {
      const msg = JSON.parse(line);
      if (msg && typeof msg.id === 'number' && pending.has(msg.id)) { pending.get(msg.id)!(msg); pending.delete(msg.id); }
    } catch { res.stdoutNonJsonLines++; }
  }
});
child.on('exit', (code, signal) => { exited = true; res.exitCode = code; res.signal = signal; });

function send(obj: unknown): void {
  try { child.stdin.write(JSON.stringify(obj) + '\n'); } catch { /* server gone */ }
}
function request(id: number, method: string, params: unknown, timeoutMs: number): Promise<any | null> {
  return new Promise((resolve) => {
    const t = setTimeout(() => { pending.delete(id); resolve(null); }, timeoutMs);
    pending.set(id, (m) => { clearTimeout(t); resolve(m); });
    send({ jsonrpc: '2.0', id, method, params });
  });
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main(): Promise<void> {
  await sleep(300);
  const t0 = Date.now();
  const init = await request(1, 'initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'norte-labs-mcp-install', version: '0.1.0' },
  }, handshakeMs);
  if (init && init.result) {
    res.initializeOk = true;
    res.initializeMs = Date.now() - t0;
    res.protocolVersion = init.result.protocolVersion;
    res.serverInfo = init.result.serverInfo;
    res.capabilities = Object.keys(init.result.capabilities ?? {});
    send({ jsonrpc: '2.0', method: 'notifications/initialized' });
    const tl = await request(2, 'tools/list', {}, Math.min(handshakeMs, 15000));
    if (tl && tl.result && Array.isArray(tl.result.tools)) {
      res.toolsListOk = true;
      const tools: ToolInfo[] = tl.result.tools;
      res.toolsCount = tools.length;
      res.tools = tools.slice(0, 200).map((t) => ({ name: String(t.name), annotations: t.annotations ?? null, descriptionLength: String(t.description ?? '').length }));
      const a = { withAny: 0, readOnlyHint: 0, destructiveHint: 0, idempotentHint: 0, openWorldHint: 0, readOnlyTrue: 0, destructiveTrue: 0, destructiveFalse: 0, openWorldTrue: 0 };
      for (const t of tools) {
        const an = t.annotations ?? {};
        const keys = ['readOnlyHint', 'destructiveHint', 'idempotentHint', 'openWorldHint'].filter((k) => k in an);
        if (keys.length) a.withAny++;
        for (const k of keys) (a as any)[k]++;
        if (an.readOnlyHint === true) a.readOnlyTrue++;
        if (an.destructiveHint === true) a.destructiveTrue++;
        if (an.destructiveHint === false) a.destructiveFalse++;
        if (an.openWorldHint === true) a.openWorldTrue++;
      }
      res.annotationSummary = a;
    }
  }
  // Idle window: whatever the server does on its own after start-up.
  const idleStart = Date.now();
  while (Date.now() - idleStart < idleMs && !exited) await sleep(200);
  res.exitedEarly = exited;
  finish();
}

let finished = false;
function finish(): void {
  if (finished) return; finished = true;
  try { child.stdin.end(); } catch { /* */ }
  const t = setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* */ } }, 3000);
  try { child.kill('SIGTERM'); } catch { /* */ }
  child.on('exit', () => { clearTimeout(t); write(); });
  if (exited) { clearTimeout(t); write(); }
  setTimeout(write, 5000); // belt and braces: strace may linger on a stuck child
}
function write(): void {
  res.totalMs = Date.now() - started;
  res.stderrTail = stderr.trim().slice(-1500);
  writeFileSync(outPath, JSON.stringify(res));
  process.exit(0);
}

main().catch(() => finish());
