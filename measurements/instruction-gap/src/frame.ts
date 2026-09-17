// Enumerate the sampling frame: every GitHub repository whose primary language
// is JavaScript or TypeScript, with at least 100 stars, pushed within the last
// twelve months. The search API returns at most 1,000 results per query, so the
// frame is walked in star bands narrow enough to stay under that cap; each band
// is paged in full. The output is one row per repository, and the frame is
// what the sample is drawn from (sample.ts).
//
// Usage: node frame.ts <out.ndjson> [--since YYYY-MM-DD] [--min-stars 100] [--lang JavaScript,TypeScript]
//
// Needs `gh` authenticated (search: 30 requests/min).

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const out = process.argv[2];
const argv = process.argv.slice(3);
const opt = (k: string, d: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const since = opt('--since', new Date(Date.now() - 365 * 86400e3).toISOString().slice(0, 10));
const minStars = Number(opt('--min-stars', '100'));
const LANGS = opt('--lang', 'JavaScript,TypeScript').split(',');

export interface FrameRow {
  fullName: string; language: string; stars: number; pushedAt: string; createdAt: string;
  defaultBranch: string; fork: boolean; archived: boolean; size: number; band: string;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function gh(path: string, params: Record<string, string>): any {
  const args = ['api', '-X', 'GET', path];
  for (const [k, v] of Object.entries(params)) args.push('-f', `${k}=${v}`);
  for (let attempt = 0; ; attempt++) {
    try {
      return JSON.parse(execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 << 20 }));
    } catch (e: any) {
      const msg = String(e.stderr || e.message);
      if (attempt < 6 && /rate limit|403|502|503|abuse/i.test(msg)) {
        const wait = /secondary|abuse/i.test(msg) ? 90e3 : 65e3;
        process.stderr.write(`gh: ${msg.trim().split('\n')[0]} — waiting ${wait / 1e3}s\n`);
        execFileSync('sleep', [String(wait / 1e3)]);
        continue;
      }
      throw e;
    }
  }
}

function query(lang: string, lo: number, hi: number | null): string {
  const stars = hi === null ? `stars:>=${lo}` : `stars:${lo}..${hi}`;
  return `language:${lang} ${stars} pushed:>=${since} fork:false`;
}

// A search that times out inside GitHub answers with `incomplete_results` and
// a smaller total; such a count is not a count.
function count(lang: string, lo: number, hi: number | null): number {
  for (let attempt = 0; ; attempt++) {
    execFileSync('sleep', ['2.1']); // 30 searches per minute
    const r = gh('search/repositories', { q: query(lang, lo, hi), per_page: '1' });
    if (!r.incomplete_results || attempt >= 5) return r.total_count;
  }
}

// Split [lo, hi] until every band holds at most 1,000 repositories; the top
// band is open-ended and split by trying a cut point until the count fits.
function bands(lang: string, lo: number, hi: number | null): Array<[number, number | null, number]> {
  const n = count(lang, lo, hi);
  if (n <= 1000) return [[lo, hi, n]];
  if (hi === null) {
    // find a cut: double from lo until the tail (cut..) is under 1,000
    let cut = lo * 2;
    while (count(lang, cut, null) > 1000) cut *= 2;
    return [...bands(lang, lo, cut - 1), [cut, null, count(lang, cut, null)]];
  }
  if (hi === lo) return [[lo, hi, n]]; // a single star value with >1,000 repos: page what the API gives
  const mid = Math.floor((lo + hi) / 2);
  return [...bands(lang, lo, mid), ...bands(lang, mid + 1, hi)];
}

async function main() {
  const seen = new Set<string>();
  if (existsSync(out)) {
    for (const l of readFileSync(out, 'utf8').split('\n')) if (l) seen.add(JSON.parse(l).fullName);
  } else writeFileSync(out, '');
  let total = 0;
  for (const lang of LANGS) {
    const bs = bands(lang, minStars, null);
    process.stderr.write(`${lang}: ${bs.length} bands, ${bs.reduce((a, b) => a + b[2], 0)} repositories\n`);
    for (const [lo, hi, n] of bs) {
      const band = `${lang}:${lo}..${hi ?? ''}`;
      if (n > 1000) process.stderr.write(`band ${band} holds ${n} > 1000; only the first 1,000 are reachable\n`);
      for (let page = 1; page <= Math.min(10, Math.ceil(n / 100)); page++) {
        let res = gh('search/repositories', { q: query(lang, lo, hi), per_page: '100', page: String(page), sort: 'updated' });
        for (let attempt = 0; res.incomplete_results && attempt < 5; attempt++) { await sleep(2100); res = gh('search/repositories', { q: query(lang, lo, hi), per_page: '100', page: String(page), sort: 'updated' }); }
        if (res.total_count > 1000 && n <= 1000) process.stderr.write(`band ${band}: the page count says ${res.total_count}, the band count said ${n}\n`);
        for (const r of res.items) {
          if (seen.has(r.full_name)) continue;
          seen.add(r.full_name);
          const row: FrameRow = {
            fullName: r.full_name, language: r.language, stars: r.stargazers_count, pushedAt: r.pushed_at, createdAt: r.created_at,
            defaultBranch: r.default_branch, fork: r.fork, archived: r.archived, size: r.size, band,
          };
          appendFileSync(out, JSON.stringify(row) + '\n');
          total++;
        }
        if (res.items.length < 100) break;
        await sleep(2100); // 30 searches per minute
      }
    }
  }
  process.stderr.write(`frame: ${seen.size} repositories (${total} new) → ${out}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
