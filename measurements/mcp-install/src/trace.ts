// Parsing and classification of strace output for the MCP install / first-run
// measurement.
//
// The filesystem half is norte-guard's install-trace parser, carried over
// unchanged so the two measurements classify $HOME access the same way
// (norte-guard src/install-trace.ts: syscall classes, access modes, outcomes,
// two-level policy prefix). The network half is new: connect() targets and the
// DNS queries/answers that name them.
//
// Input is `strace -f -qq -y -e trace=file,execve,network`. File syscalls carry
// path arguments only. Network syscalls carry payloads for send*/recv*; the only
// payloads decoded are DNS messages on port 53, and the raw trace is deleted by
// the runner once parsed. The processes traced run in a sandbox whose $HOME
// holds decoy credentials, never real ones.

export type SyscallClass = 'open' | 'probe' | 'mutate' | 'exec' | 'traverse';
export type AccessMode = 'read' | 'write' | 'readwrite' | 'directory' | 'path' | 'none';
export type Outcome = 'ok' | 'enoent' | 'eacces' | 'eexist' | 'other-error';

export interface TraceEvent {
  pid: number;
  syscall: string;
  klass: SyscallClass;
  path: string;
  mode: AccessMode;
  outcome: Outcome;
  errno?: string;
  viaOpenFd: boolean;
}

const TWO_PATH_SYSCALLS = new Set([
  'rename', 'renameat', 'renameat2', 'link', 'linkat', 'symlink', 'symlinkat',
]);
const PROBE_SYSCALLS = new Set([
  'stat', 'lstat', 'fstatat', 'newfstatat', 'statx', 'access', 'faccessat',
  'faccessat2', 'readlink', 'readlinkat', 'statfs', 'getxattr', 'lgetxattr',
  'listxattr', 'llistxattr',
]);
const MUTATE_SYSCALLS = new Set([
  'mkdir', 'mkdirat', 'rmdir', 'unlink', 'unlinkat', 'rename', 'renameat',
  'renameat2', 'link', 'linkat', 'symlink', 'symlinkat', 'chmod', 'fchmodat',
  'chown', 'lchown', 'fchownat', 'truncate', 'utimensat', 'utimes', 'mknod',
  'mknodat', 'setxattr', 'lsetxattr', 'removexattr',
]);
const OPEN_SYSCALLS = new Set(['open', 'openat', 'openat2', 'creat']);
const NETWORK_SYSCALLS = new Set([
  'connect', 'sendto', 'sendmsg', 'sendmmsg', 'recvfrom', 'recvmsg', 'recvmmsg',
  'socket', 'bind', 'listen', 'accept', 'accept4', 'getsockname', 'getpeername',
  'setsockopt', 'getsockopt', 'shutdown', 'socketpair',
]);

export function classifySyscall(name: string): SyscallClass {
  if (OPEN_SYSCALLS.has(name)) return 'open';
  if (name === 'execve' || name === 'execveat') return 'exec';
  if (MUTATE_SYSCALLS.has(name)) return 'mutate';
  if (PROBE_SYSCALLS.has(name)) return 'probe';
  if (name === 'chdir' || name === 'fchdir') return 'traverse';
  return 'probe';
}

export function classifyMode(flags: string, klass: SyscallClass): AccessMode {
  if (klass === 'mutate') return 'write';
  if (klass !== 'open') return 'none';
  if (/\bO_PATH\b/.test(flags)) return 'path';
  if (/\bO_DIRECTORY\b/.test(flags)) return 'directory';
  if (/\bO_RDWR\b/.test(flags)) return 'readwrite';
  if (/\bO_WRONLY\b/.test(flags)) return 'write';
  if (/\bO_CREAT\b|\bO_TRUNC\b|\bO_APPEND\b/.test(flags)) return 'write';
  return 'read';
}

export function classifyOutcome(tail: string): { outcome: Outcome; errno?: string } {
  const m = /=\s*-?\d+\s+([A-Z][A-Z0-9_]+)\b/.exec(tail);
  if (!m) return { outcome: 'ok' };
  const errno = m[1];
  if (errno === 'ENOENT') return { outcome: 'enoent', errno };
  if (errno === 'EACCES' || errno === 'EPERM') return { outcome: 'eacces', errno };
  if (errno === 'EEXIST') return { outcome: 'eexist', errno };
  return { outcome: 'other-error', errno };
}

/** Quoted strings, honouring backslash escapes, in argument order. Escapes are
 *  decoded (\n, \t, \\, \", octal \NNN, hex \xNN) so DNS payloads come back as
 *  the bytes strace saw, one char per byte. */
export function quotedArgs(args: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < args.length) {
    if (args[i] === '"') {
      let j = i + 1;
      let buf = '';
      while (j < args.length && args[j] !== '"') {
        if (args[j] === '\\' && j + 1 < args.length) {
          const c = args[j + 1];
          if (c >= '0' && c <= '7') {
            let k = j + 1; let oct = '';
            while (k < args.length && oct.length < 3 && args[k] >= '0' && args[k] <= '7') { oct += args[k]; k++; }
            buf += String.fromCharCode(parseInt(oct, 8)); j = k;
          } else if (c === 'x') {
            const hex = args.slice(j + 2, j + 4);
            buf += String.fromCharCode(parseInt(hex, 16)); j += 4;
          } else {
            buf += c === 'n' ? '\n' : c === 't' ? '\t' : c === 'r' ? '\r' : c === 'f' ? '\f' : c === 'v' ? '\v' : c === 'a' ? '\x07' : c === 'b' ? '\b' : c;
            j += 2;
          }
        } else { buf += args[j]; j++; }
      }
      out.push(buf);
      i = j + 1;
    } else i++;
  }
  return out;
}

export function dirfdPath(args: string): string | null {
  const m = /^\s*(?:AT_FDCWD|\d+)<((?:[^<>]|<[^>]*>)*)>/.exec(args);
  return m ? m[1] : null;
}

const LINE = /^(?:\[pid\s+(\d+)\]\s*|(\d+)\s+)?([a-z][a-z0-9_]*)\((.*)$/;

export interface ParseOptions { home: string; fallbackCwd: string }

export function parseTraceLine(line: string, opts: ParseOptions): TraceEvent[] {
  const m = LINE.exec(line);
  if (!m) return [];
  const pid = Number(m[1] ?? m[2] ?? 0);
  const syscall = m[3];
  const rest = m[4];
  if (NETWORK_SYSCALLS.has(syscall)) return [];
  if (/<unfinished \.\.\.>\s*$/.test(rest)) return [];
  const klass = classifySyscall(syscall);
  if (klass === 'traverse') return [];
  const args = quotedArgs(rest);
  if (args.length === 0) return [];
  const base = dirfdPath(rest) ?? opts.fallbackCwd;
  const { outcome, errno } = classifyOutcome(rest);
  const flagsPart = rest.slice(rest.indexOf('"') + 1);
  const flags = flagsPart.slice(flagsPart.indexOf('"') + 1);
  // symlink's first argument is the link's target string, not a path the
  // process accesses; resolving it against cwd produced phantom prefixes.
  const wanted = syscall.startsWith('symlink') ? args.slice(1, 2) : TWO_PATH_SYSCALLS.has(syscall) ? args.slice(0, 2) : args.slice(0, 1);
  const events: TraceEvent[] = [];
  for (const raw of wanted) {
    const viaOpenFd = raw === '';
    const abs = viaOpenFd ? (dirfdPath(rest) ?? '') : raw.startsWith('/') ? raw : joinPath(base, raw);
    if (!abs) continue;
    events.push({ pid, syscall, klass, path: normalisePath(abs), mode: classifyMode(flags, klass), outcome, errno, viaOpenFd });
  }
  return events;
}

export function joinPath(base: string, rel: string): string {
  if (rel === '.') return base;
  return `${base.replace(/\/+$/, '')}/${rel}`;
}

export function normalisePath(p: string): string {
  const parts: string[] = [];
  for (const seg of p.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop(); else parts.push(seg);
  }
  return '/' + parts.join('/');
}

/** Two-level $HOME prefix, as in norte-guard: ~/.npm/_cacache is one policy
 *  decision, not four thousand. */
export function policyPrefix(path: string, home: string): string | null {
  if (path === home) return '~';
  if (!path.startsWith(home + '/')) return null;
  const rel = path.slice(home.length + 1);
  const parts = rel.split('/');
  if (parts.length === 1) return `~/${parts[0]}`;
  return `~/${parts[0]}/${parts[1]}`;
}

export interface HomeAccessSummary {
  prefix: string;
  reads: number; writes: number; probes: number; mutations: number; execs: number;
  ok: number; enoent: number; denied: number;
  distinctPaths: number;
  contentAccessed: boolean;
  /** Distinct paths under the prefix that were content-opened successfully,
   *  capped at 12 — enough to name a decoy that was read. */
  samplePaths: string[];
}

export function summariseHomeAccess(events: Iterable<TraceEvent>, home: string): HomeAccessSummary[] {
  const acc = new Map<string, HomeAccessSummary & { paths: Set<string>; opened: Set<string> }>();
  for (const e of events) {
    if (e.viaOpenFd) continue;
    const prefix = policyPrefix(e.path, home);
    if (!prefix) continue;
    let s = acc.get(prefix);
    if (!s) {
      s = { prefix, reads: 0, writes: 0, probes: 0, mutations: 0, execs: 0, ok: 0, enoent: 0, denied: 0,
        distinctPaths: 0, contentAccessed: false, samplePaths: [], paths: new Set(), opened: new Set() };
      acc.set(prefix, s);
    }
    s.paths.add(e.path);
    if (e.outcome === 'ok') s.ok++; else if (e.outcome === 'enoent') s.enoent++; else if (e.outcome === 'eacces') s.denied++;
    if (e.klass === 'open') {
      if (e.mode === 'read') s.reads++;
      else if (e.mode === 'write' || e.mode === 'readwrite') s.writes++;
      else s.probes++;
      if (e.outcome === 'ok' && (e.mode === 'read' || e.mode === 'write' || e.mode === 'readwrite')) {
        s.contentAccessed = true;
        if (s.opened.size < 12) s.opened.add(e.path);
      }
    } else if (e.klass === 'probe') s.probes++;
    else if (e.klass === 'mutate') s.mutations++;
    else if (e.klass === 'exec') s.execs++;
  }
  return [...acc.values()]
    .map(({ paths, opened, ...rest }) => ({ ...rest, distinctPaths: paths.size, samplePaths: [...opened].map((p) => p.replace(home, '~')) }))
    .sort((a, b) => (b.reads + b.writes + b.mutations) - (a.reads + a.writes + a.mutations));
}

export interface ConnectEvent { pid: number; family: 'inet' | 'inet6'; ip: string; port: number; outcome: Outcome }
export interface DnsQuery { pid: number; name: string; qtype: number }
export interface DnsAnswer { name: string; ip: string }

export interface NetworkTrace {
  connects: ConnectEvent[];
  queries: DnsQuery[];
  answers: DnsAnswer[];
  /** execve argv[0] per pid, for attributing a connect to a program. */
  execs: Map<number, string>;
}

/** Canonical IPv6 text: eight groups, no leading zeros, no `::`. strace prints
 *  the compressed form and the DNS decoder the expanded one; both map here. */
export function canonV6(ip: string): string {
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.split('::');
  const h = head ? head.split(':') : []; const t = tail ? tail.split(':') : [];
  const groups = ip.includes('::') ? [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t] : h;
  return groups.map((g) => (parseInt(g || '0', 16) || 0).toString(16)).join(':');
}

const CONNECT4 = /sa_family=AF_INET,\s*sin_port=htons\((\d+)\),\s*sin_addr=inet_addr\("([^"]+)"\)/;
const CONNECT6 = /sa_family=AF_INET6,\s*sin6_port=htons\((\d+)\),.*?inet_pton\(AF_INET6,\s*"([^"]+)"/;

function decodeName(buf: string, off: number, depth = 0): { name: string; next: number } | null {
  const labels: string[] = [];
  let i = off; let next = -1;
  while (i < buf.length) {
    const len = buf.charCodeAt(i);
    if (len === 0) { i++; break; }
    if ((len & 0xc0) === 0xc0) {
      if (i + 1 >= buf.length || depth > 5) return null;
      const ptr = ((len & 0x3f) << 8) | buf.charCodeAt(i + 1);
      const r = decodeName(buf, ptr, depth + 1);
      if (!r) return null;
      labels.push(r.name);
      if (next < 0) next = i + 2;
      i = -1; break;
    }
    if (i + 1 + len > buf.length) return null;
    labels.push(buf.slice(i + 1, i + 1 + len));
    i += 1 + len;
  }
  if (i === -1) return { name: labels.join('.'), next };
  return { name: labels.join('.'), next: i };
}

/** Decode a DNS message into its question names and A/AAAA answers. Returns
 *  null if the bytes do not parse as DNS. */
export function decodeDns(buf: string): { queries: { name: string; qtype: number }[]; answers: DnsAnswer[] } | null {
  if (buf.length < 12) return null;
  const qd = (buf.charCodeAt(4) << 8) | buf.charCodeAt(5);
  const an = (buf.charCodeAt(6) << 8) | buf.charCodeAt(7);
  if (qd === 0 || qd > 4) return null;
  let off = 12;
  const queries: { name: string; qtype: number }[] = [];
  for (let q = 0; q < qd; q++) {
    const r = decodeName(buf, off);
    if (!r || r.next + 4 > buf.length) return null;
    const qtype = (buf.charCodeAt(r.next) << 8) | buf.charCodeAt(r.next + 1);
    if (!/^[A-Za-z0-9._-]+$/.test(r.name)) return null;
    queries.push({ name: r.name.toLowerCase(), qtype });
    off = r.next + 4;
  }
  const answers: DnsAnswer[] = [];
  for (let a = 0; a < an && a < 32; a++) {
    const r = decodeName(buf, off);
    if (!r || r.next + 10 > buf.length) break;
    const type = (buf.charCodeAt(r.next) << 8) | buf.charCodeAt(r.next + 1);
    const rdlen = (buf.charCodeAt(r.next + 8) << 8) | buf.charCodeAt(r.next + 9);
    const rd = r.next + 10;
    if (rd + rdlen > buf.length) break;
    if (type === 1 && rdlen === 4) {
      answers.push({ name: r.name.toLowerCase(), ip: [0, 1, 2, 3].map((k) => buf.charCodeAt(rd + k)).join('.') });
    } else if (type === 28 && rdlen === 16) {
      const h: string[] = [];
      for (let k = 0; k < 16; k += 2) h.push(((buf.charCodeAt(rd + k) << 8) | buf.charCodeAt(rd + k + 1)).toString(16));
      answers.push({ name: r.name.toLowerCase(), ip: canonV6(h.join(':')) });
    } else if (type === 5) {
      // CNAME: keep the alias chain so an A record for the target can be
      // attributed back to the queried name.
      const c = decodeName(buf, rd);
      if (c) answers.push({ name: r.name.toLowerCase(), ip: 'cname:' + c.name.toLowerCase() });
    }
    off = rd + rdlen;
  }
  return { queries, answers };
}

export function parseNetworkTrace(text: string): NetworkTrace {
  const connects: ConnectEvent[] = [];
  const queries: DnsQuery[] = [];
  const answers: DnsAnswer[] = [];
  const execs = new Map<number, string>();
  const dnsFd = new Set<string>(); // `${pid}:${fd}` sockets connected to port 53
  for (const line of text.split('\n')) {
    const m = LINE.exec(line);
    if (!m) continue;
    const pid = Number(m[1] ?? m[2] ?? 0);
    const syscall = m[3];
    const rest = m[4];
    if (syscall === 'execve') {
      const a = quotedArgs(rest);
      if (a[0] && !execs.has(pid)) execs.set(pid, a[0]);
      continue;
    }
    if (!NETWORK_SYSCALLS.has(syscall)) continue;
    const fdm = /^(\d+)</.exec(rest);
    const fd = fdm ? fdm[1] : '?';
    if (syscall === 'connect') {
      const m4 = CONNECT4.exec(rest);
      const m6 = m4 ? null : CONNECT6.exec(rest);
      if (!m4 && !m6) continue;
      const port = Number((m4 ?? m6)![1]);
      const ip = (m4 ?? m6)![2];
      const { outcome } = classifyOutcome(rest);
      if (port === 53) dnsFd.add(`${pid}:${fd}`);
      connects.push({ pid, family: m4 ? 'inet' : 'inet6', ip: m4 ? ip : canonV6(ip), port, outcome: outcome === 'other-error' && /EINPROGRESS/.test(rest) ? 'ok' : outcome });
      continue;
    }
    const isSend = syscall.startsWith('send');
    const isRecv = syscall.startsWith('recv');
    if (!isSend && !isRecv) continue;
    const toDns = dnsFd.has(`${pid}:${fd}`) || /htons\(53\)/.test(rest);
    if (!toDns) continue;
    for (const buf of quotedArgs(rest)) {
      const d = decodeDns(buf);
      if (!d) continue;
      if (isSend) for (const q of d.queries) queries.push({ pid, ...q });
      else answers.push(...d.answers);
    }
  }
  return { connects, queries, answers, execs };
}

export interface HostSummary {
  host: string;           // DNS name, or the bare IP when no name resolved it
  ips: string[];
  ports: number[];
  connects: number;
  programs: string[];     // argv[0] of the pids that connected
}

/** Join connects to the names that resolved to their IPs. Port-0 connects are
 *  glibc's address-ordering probes, not traffic, and port-53 connects are the
 *  resolver; both are dropped. */
export function summariseNetwork(t: NetworkTrace): { hosts: HostSummary[]; dnsNames: string[] } {
  const ipToName = new Map<string, string>();
  const cname = new Map<string, string>();
  for (const a of t.answers) if (a.ip.startsWith('cname:')) cname.set(a.ip.slice(6), a.name);
  const canonical = (n: string): string => { let x = n; for (let i = 0; i < 8 && cname.has(x); i++) x = cname.get(x)!; return x; };
  for (const a of t.answers) if (!a.ip.startsWith('cname:') && !ipToName.has(a.ip)) ipToName.set(a.ip, canonical(a.name));
  const acc = new Map<string, HostSummary & { ipset: Set<string>; portset: Set<number>; progs: Set<string> }>();
  for (const c of t.connects) {
    if (c.port === 0 || c.port === 53) continue;
    const host = ipToName.get(c.ip) ?? c.ip;
    let s = acc.get(host);
    if (!s) { s = { host, ips: [], ports: [], connects: 0, programs: [], ipset: new Set(), portset: new Set(), progs: new Set() }; acc.set(host, s); }
    s.connects++; s.ipset.add(c.ip); s.portset.add(c.port);
    const p = t.execs.get(c.pid); if (p) s.progs.add(p.split('/').pop()!);
  }
  const hosts = [...acc.values()].map(({ ipset, portset, progs, ...r }) => ({ ...r, ips: [...ipset], ports: [...portset].sort((a, b) => a - b), programs: [...progs] }))
    .sort((a, b) => b.connects - a.connects);
  const dnsNames = [...new Set(t.queries.map((q) => q.name))].sort();
  return { hosts, dnsNames };
}
