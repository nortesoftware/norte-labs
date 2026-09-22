// Activation driver, loaded with --extensionDevelopmentPath. It activates the
// extension named in NL_TARGET, opens the workspace files that extension's
// activation events name (NL_FILES=match) or every sample file (NL_FILES=all,
// the baseline runs), idles NL_IDLE_MS, writes a summary to NL_OUT and quits.
// The runner finds the extension host in the trace by the write of NL_OUT;
// process.pid is recorded for the record only (the editor's utility process
// does not report the pid the tracer sees).
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const target = process.env.NL_TARGET || '';
const idleMs = Number(process.env.NL_IDLE_MS || '10000');
const activateTimeoutMs = Number(process.env.NL_ACTIVATE_MS || '60000');
const out = process.env.NL_OUT || '/tmp/nl-driver.json';
const ws = process.env.NL_WORKSPACE || '';
const filesMode = process.env.NL_FILES || 'match';
const maxFiles = Number(process.env.NL_MAX_FILES || '6');
// NL_ACTIVATE=0 leaves activation to the editor: the files are opened and the
// record says whether the extension's own events activated it.
const forced = (process.env.NL_ACTIVATE || '1') !== '0';

// languageId of each sample file, as the editor assigns it by extension/name
const LANGUAGE_OF = {
  'app.ts': 'typescript', 'index.js': 'javascript', 'main.py': 'python', 'main.go': 'go', 'main.rs': 'rust',
  'index.html': 'html', 'style.css': 'css', 'data.json': 'json', 'config.yaml': 'yaml', 'README.md': 'markdown',
  'Dockerfile': 'dockerfile', 'run.sh': 'shellscript', 'main.c': 'c', 'main.cpp': 'cpp', 'Main.java': 'java',
  'pom.xml': 'xml', 'schema.sql': 'sql', 'Cargo.toml': 'toml', 'main.tf': 'terraform', 'index.php': 'php',
  'app.rb': 'ruby', 'Program.cs': 'csharp', 'main.kt': 'kotlin', 'App.vue': 'vue', 'main.dart': 'dart',
  'Makefile': 'makefile', 'notes.txt': 'plaintext', '.env': 'dotenv', 'main.lua': 'lua', 'script.ps1': 'powershell',
};

function withTimeout(p, ms) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout after ${ms} ms`)), ms))]);
}

// Files to open: for onLanguage:<id> the sample file of that language; for
// workspaceContains:<glob> the files the glob's extension or name matches.
function filesFor(activationEvents, contributedLanguages) {
  const present = fs.existsSync(ws) ? fs.readdirSync(ws).filter((f) => fs.statSync(path.join(ws, f)).isFile()) : [];
  if (filesMode === 'all') return present;
  const langExt = new Map(); // languageId contributed by the extension → its file extensions
  for (const l of contributedLanguages || []) for (const e of l.extensions || []) langExt.set(String(e).replace(/^\./, ''), l.id);
  const wanted = new Set();
  for (const ev of activationEvents || []) {
    const m = /^onLanguage:(.+)$/.exec(ev);
    if (m) { for (const [f, id] of Object.entries(LANGUAGE_OF)) if (id === m[1] && present.includes(f)) wanted.add(f); continue; }
    const w = /^workspaceContains:(.+)$/.exec(ev);
    if (w) {
      const g = w[1];
      for (const f of present) {
        const ext = f.includes('.') ? f.split('.').pop() : '';
        if (g === f || g.endsWith('/' + f) || (ext && (g.endsWith('.' + ext) || g.endsWith('{' + ext) || new RegExp('[{,]' + ext + '[,}]').test(g)))) wanted.add(f);
      }
    }
  }
  return [...wanted].slice(0, maxFiles);
}

async function activate(context) {
  const t0 = Date.now();
  const summary = { target, forced, pid: process.pid, ppid: process.ppid, found: false, activated: null, activateMs: null, error: null, declared: null, filesOpened: [], extensionsPresent: [], startedAt: new Date().toISOString() };
  try {
    summary.extensionsPresent = vscode.extensions.all.filter((e) => !e.packageJSON.isBuiltin && !e.id.startsWith('vscode.')).map((e) => `${e.id}@${e.packageJSON.version}`);
    const ext = target ? vscode.extensions.all.find((e) => e.id.toLowerCase() === target.toLowerCase()) : null;
    let files = filesMode === 'all' ? filesFor([], []) : [];
    if (ext) {
      summary.found = true;
      const pj = ext.packageJSON || {};
      summary.declared = { activationEvents: pj.activationEvents || null, main: pj.main || null, browser: pj.browser || null, extensionKind: pj.extensionKind || null, extensionDependencies: pj.extensionDependencies || null, extensionPack: pj.extensionPack || null, contributes: Object.keys(pj.contributes || {}), capabilities: pj.capabilities || null, enabledApiProposals: pj.enabledApiProposals || null, engines: pj.engines || null, isActiveBefore: ext.isActive };
      files = filesFor(pj.activationEvents, (pj.contributes || {}).languages);
      if (forced) {
        const t1 = Date.now();
        try {
          await withTimeout(ext.activate(), activateTimeoutMs);
          summary.activated = true;
        } catch (e) {
          summary.activated = false;
          summary.error = String(e && e.stack ? e.stack : e).slice(0, 2000);
        }
        summary.activateMs = Date.now() - t1;
      }
      summary.isActiveAfter = ext.isActive;
    }
    for (const f of files) {
      try {
        const doc = await withTimeout(vscode.workspace.openTextDocument(path.join(ws, f)), 10000);
        await withTimeout(vscode.window.showTextDocument(doc, { preview: false }), 10000);
        summary.filesOpened.push(f);
      } catch (e) { summary.filesOpened.push(`${f}: ${String(e).slice(0, 100)}`); }
    }
    await new Promise((r) => setTimeout(r, idleMs));
    if (target && summary.found) summary.isActiveAtEnd = vscode.extensions.all.find((e) => e.id.toLowerCase() === target.toLowerCase()).isActive;
  } catch (e) {
    summary.error = (summary.error ? summary.error + '\n' : '') + String(e && e.stack ? e.stack : e).slice(0, 2000);
  }
  summary.totalMs = Date.now() - t0;
  try { fs.writeFileSync(out, JSON.stringify(summary)); } catch {}
  await vscode.commands.executeCommand('workbench.action.quit');
}
function deactivate() {}
module.exports = { activate, deactivate };
