#!/usr/bin/env node
// Own-app driver: full interaction with the user's own app on a local or named staging host.
//
//   node scripts/ownapp.mjs run <url> <steps.json> <outdir> [--headed]
//
// Allowed hosts: localhost, 127.0.0.1, [::1], *.localhost, *.test, or the one host in DASH_ALLOW_HOST
// (a staging host the user named). Anything else is refused. Never point this at production.
// Writes <outdir>/log.ndjson (one line per step), <outdir>/console.ndjson (console errors, page errors,
// failed requests, HTTP >= 400, dialogs), and snapshot/screenshot files. Exit 0 even when checks fail
// (failures are data); exit 1 only on setup errors (bad args, bad steps, refused host, no Chrome).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROLE_NAME = (v) => v && typeof v === 'object' && typeof v.role === 'string' && typeof v.name === 'string';
const STR = (v) => typeof v === 'string' && v.length > 0;

// One validator per step key; returns true when the value is well formed.
export const STEP_TYPES = {
  goto: STR,
  viewport: (v) => parseViewport(v) !== null,
  click: ROLE_NAME,
  fill: (v) => v && typeof v === 'object' && STR(v.label) && typeof v.value === 'string',
  check: (v) => v && typeof v === 'object' && STR(v.label),
  press: STR,
  wait: (v) => Number.isInteger(v) && v >= 0 && v <= 60000,
  snapshot: (v) => STR(v) && SAFE_NAME.test(v),
  screenshot: (v) => STR(v) && SAFE_NAME.test(v),
  styles: (v) => v && typeof v === 'object' && STR(v.selector) && Array.isArray(v.props) && v.props.length > 0 && v.props.every(STR),
  focused: (v) => v === true,
  block: STR,
  unblock: (v) => v === true,
  exists: ROLE_NAME,
  text: STR,
  responsive: (v) => STR(v) && SAFE_NAME.test(v),
};

// Output file names stay inside outdir.
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

export function parseViewport(v) {
  const m = typeof v === 'string' && v.match(/^(\d{2,5})x(\d{2,5})$/);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : null;
}

export function isAllowedHost(hostname, allowHost = '') {
  const h = String(hostname).toLowerCase().replace(/\.$/, '');
  if (!h) return false;
  if (['localhost', '127.0.0.1', '[::1]', '::1'].includes(h)) return true;
  if (h.endsWith('.localhost') || h.endsWith('.test')) return true;
  return !!allowHost && h === allowHost.toLowerCase().trim();
}

export function isAllowedUrl(url, allowHost = '') {
  let u;
  try { u = new URL(url); } catch { return false; }
  return (u.protocol === 'http:' || u.protocol === 'https:') && isAllowedHost(u.hostname, allowHost);
}

// Returns an error string, or null when the step is valid.
export function validateStep(step) {
  if (!step || typeof step !== 'object' || Array.isArray(step)) return 'step must be an object';
  const keys = Object.keys(step);
  if (keys.length !== 1) return `step must have exactly one key, got ${keys.length}`;
  const [k] = keys;
  if (!STEP_TYPES[k]) return `unknown step "${k}"`;
  if (!STEP_TYPES[k](step[k])) return `bad value for "${k}": ${JSON.stringify(step[k])}`;
  return null;
}

export function validateSteps(steps) {
  if (!Array.isArray(steps)) return ['steps.json must be a JSON array'];
  return steps.map((s, i) => { const e = validateStep(s); return e && `step ${i}: ${e}`; }).filter(Boolean);
}

function die(msg) { console.error(msg); process.exit(1); }

// Resolve playwright-core next to this script first, then from the project the caller runs in
// (an installed plugin folder usually has no node_modules; `npm i -D playwright-core` goes in the project).
async function loadChromium() {
  let m;
  try { m = await import('playwright-core'); } catch {
    m = await import(pathToFileURL(createRequire(path.join(process.cwd(), 'noop.js')).resolve('playwright-core')).href);
  }
  return m.chromium ?? m.default.chromium;
}

async function launch(headed) {
  const chromium = await loadChromium();
  try {
    return await chromium.launch({ channel: 'chrome', headless: !headed });
  } catch (e) {
    if (!process.env.CHROME_PATH) throw e;
    return chromium.launch({ executablePath: process.env.CHROME_PATH, headless: !headed });
  }
}

async function runStep(page, k, v, ctx) {
  const { outdir, base } = ctx;
  const byRole = (o) => page.getByRole(o.role, { name: o.name, exact: true });
  const snap = async (name) => {
    const file = path.join(outdir, `${name}.aria.yaml`);
    fs.writeFileSync(file, await page.locator('body').ariaSnapshot({ timeout: 15000 }));
    return file;
  };
  const shot = async (name) => {
    const file = path.join(outdir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    return file;
  };
  switch (k) {
    case 'goto': {
      const to = new URL(v, base).href;
      if (!isAllowedUrl(to, ctx.allowHost)) throw new Error(`refused host ${new URL(to).host}`);
      const res = await page.goto(to, { waitUntil: 'domcontentloaded' });
      return { url: page.url(), status: res?.status() ?? null };
    }
    case 'viewport': await page.setViewportSize(parseViewport(v)); return parseViewport(v);
    case 'click': await byRole(v).click({ timeout: 5000 }); return { url: page.url() };
    case 'fill': await page.getByLabel(v.label, { exact: true }).fill(v.value, { timeout: 5000 }); return { filled: v.label };
    case 'check': await page.getByLabel(v.label, { exact: true }).check({ timeout: 5000 }); return { checked: v.label };
    case 'press': await page.keyboard.press(v); return { pressed: v };
    case 'wait': await page.waitForTimeout(v); return { waited: v };
    case 'snapshot': return { file: await snap(v) };
    case 'screenshot': return { file: await shot(v) };
    case 'styles':
      return page.$$eval(v.selector, (els, props) => els.slice(0, 20).map((el) => {
        const cs = getComputedStyle(el);
        const out = { tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().slice(0, 40) };
        for (const p of props) out[p] = cs.getPropertyValue(p);
        return out;
      }), v.props).then((matches) => ({ count: matches.length, matches }));
    case 'focused': {
      const loc = page.locator(':focus');
      if ((await loc.count()) === 0) return { focused: null };
      const aria = await loc.first().ariaSnapshot({ timeout: 5000 }).catch(() => null);
      const css = await loc.first().evaluate((el) => {
        const cs = getComputedStyle(el);
        return { tag: el.tagName.toLowerCase(), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, outlineOffset: cs.outlineOffset, boxShadow: cs.boxShadow };
      });
      return { aria: aria && aria.split('\n')[0], ...css };
    }
    case 'block': await page.route(v, (r) => r.abort()); return { blocked: v };
    case 'unblock': await page.unrouteAll({ behavior: 'ignoreErrors' }); return { unblocked: true };
    case 'exists': {
      const loc = byRole(v);
      const count = await loc.count();
      if (!count) return { count, disabled: null, visible: false };
      return { count, disabled: await loc.first().isDisabled(), visible: await loc.first().isVisible() };
    }
    case 'text': return { texts: (await page.locator(v).allInnerTexts()).slice(0, 20) };
    case 'responsive': {
      const files = [];
      for (const w of [1440, 1024, 768, 390]) {
        await page.setViewportSize({ width: w, height: w === 390 ? 844 : 900 });
        await page.waitForTimeout(300);
        files.push(await snap(`${v}-${w}`), await shot(`${v}-${w}`));
      }
      return { files };
    }
  }
}

async function run(url, stepsFile, outdir, headed) {
  const allowHost = process.env.DASH_ALLOW_HOST || '';
  if (!isAllowedUrl(url, allowHost)) die(`refused: ${url} is not a local host. Set DASH_ALLOW_HOST=<host> only for a staging host the user named; never production.`);
  let steps;
  try { steps = JSON.parse(fs.readFileSync(stepsFile, 'utf8')); } catch (e) { die(`cannot read ${stepsFile}: ${e.message}`); }
  const errs = validateSteps(steps);
  if (errs.length) die(errs.join('\n'));
  fs.mkdirSync(outdir, { recursive: true });
  const logFile = path.join(outdir, 'log.ndjson');
  const consoleFile = path.join(outdir, 'console.ndjson');
  fs.writeFileSync(logFile, '');
  fs.writeFileSync(consoleFile, '');
  const note = (o) => fs.appendFileSync(consoleFile, JSON.stringify({ ...o, url: page.url() }) + '\n');

  let browser;
  try { browser = await launch(headed); } catch (e) { die(`cannot launch Chrome (needs playwright-core 1.62.1 and Google Chrome, or CHROME_PATH): ${e.message.split('\n')[0]}`); }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') note({ kind: 'console', text: m.text() }); });
  page.on('pageerror', (e) => note({ kind: 'pageerror', text: e.message }));
  page.on('requestfailed', (r) => note({ kind: 'requestfailed', method: r.method(), request: r.url(), error: r.failure()?.errorText }));
  page.on('response', (r) => { if (r.status() >= 400) note({ kind: 'http', status: r.status(), method: r.request().method(), request: r.url() }); });
  // Dismiss is the safe default: a confirm() on a destructive action is never accepted silently.
  page.on('dialog', (d) => { note({ kind: 'dialog', type: d.type(), text: d.message() }); d.dismiss().catch(() => {}); });

  const ctx = { outdir, base: url, allowHost };
  try {
    // i = -1 is the opening navigation; i = 0.. match the indexes in steps.json.
    for (let i = -1; i < steps.length; i++) {
      const step = i < 0 ? { goto: url } : steps[i];
      const [[k, v]] = Object.entries(step);
      const t0 = Date.now();
      const line = { i, step };
      try { line.ok = true; line.result = await runStep(page, k, v, ctx); } catch (e) { line.ok = false; line.error = e.message.split('\n')[0]; }
      line.ms = Date.now() - t0;
      fs.appendFileSync(logFile, JSON.stringify(line) + '\n');
      // A click or redirect that leaves the allowed hosts ends the run before any further typing.
      if (page.url() !== 'about:blank' && !isAllowedUrl(page.url(), allowHost)) {
        fs.appendFileSync(logFile, JSON.stringify({ i, step: null, ok: false, error: `left allowed hosts: ${page.url()}; run stopped`, ms: 0 }) + '\n');
        break;
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }
  console.log(`wrote ${logFile}`);
}

// Compare real paths: a raw file:// string misses paths with spaces or symlinks and the CLI would exit 0 silently.
if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const args = process.argv.slice(2);
  const headed = args.includes('--headed');
  const [cmd, url, stepsFile, outdir] = args.filter((a) => a !== '--headed');
  if (cmd !== 'run' || !url || !stepsFile || !outdir) die('usage: node scripts/ownapp.mjs run <url> <steps.json> <outdir> [--headed]');
  await run(url, stepsFile, outdir, headed);
}
