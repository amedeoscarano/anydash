#!/usr/bin/env node
// Session recorder: records a human (or a scripted run) doing one workflow in the user's own app.
//
//   node scripts/record.mjs <url> [outdir] [--success "<css selector>|url:<substring>"] [--script steps.json]
//                            [--profile <dir>] [--keep-video] [--readonly]
//
// Writes <outdir>/events.ndjson, network.ndjson, video/*.webm, trace.zip and meta.json (schema in
// references/events.md). Allowed hosts: localhost, 127.0.0.1, [::1], *.localhost, *.test, or DASH_ALLOW_HOST.
// --readonly allows any host for watching a human in a third-party portal; it disables --script.
// Input values are never written to the NDJSON files: only the field label and the value length.
// The video and trace.zip DO show typed values and page content; they stay on this machine.
// Exit 0 when the recording ends normally; exit 1 on setup errors or a failed script step.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const VERSION = '0.2.0';
export const SCHEMA = 1;

// Same allow-list as browser-adapter/scripts/ownapp.mjs (copied: skills install one folder at a time).
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

// Beyond the brief's list: auth, OAuth code, OTP, signatures, JWTs. Over-blanking a harmless param costs nothing.
const SENSITIVE = /token|key|secret|session|passw|pwd|email|auth|code|otp|sig|jwt|credential/i;

// Navigation URL: keeps path, hash and param names; drops values of sensitive params and any user:pass@.
export function scrubUrl(url) {
  let u;
  try { u = new URL(url); } catch { return String(url).split(/[?#]/)[0]; }
  u.username = ''; u.password = '';
  const scrub = (params) => { for (const k of [...params.keys()]) if (SENSITIVE.test(k)) params.set(k, ''); return params; };
  scrub(u.searchParams);
  // OAuth-style fragments (#access_token=...) carry secrets too.
  if (u.hash.includes('=')) {
    const h = u.hash.slice(1);
    const qi = h.indexOf('?');
    u.hash = h.slice(0, qi + 1) + scrub(new URLSearchParams(h.slice(qi + 1)));
  }
  return u.href;
}

// Network URL: host and path only, the query is dropped whole.
export function stripQuery(url) {
  try { const u = new URL(url); return { host: u.host, path: u.pathname }; } catch { return { host: '', path: String(url).split(/[?#]/)[0] }; }
}

// Error text from Playwright quotes full URLs (query included); scrub them before they reach meta.json or the terminal.
export function scrubMessage(msg) {
  return String(msg ?? '').split('\n')[0].replace(/\b(?:https?|wss?):\/\/[^\s"'<>]+/g, (m) => scrubUrl(m));
}

// The only shape an input value takes in events.ndjson. Runs in the page too (serialized), so stays self-contained.
export function maskInput(label, value) {
  return { field: String(label || '').trim().replace(/\s+/g, ' ').slice(0, 80), length: value == null ? 0 : String(value).length };
}

// "url:/done" waits for a URL containing "/done"; anything else is a CSS selector that must become visible.
export function parseSuccess(s) {
  if (typeof s !== 'string' || !s.trim()) return null;
  const t = s.trim();
  if (t.startsWith('url:')) return t.length > 4 ? { kind: 'url', value: t.slice(4) } : null;
  return { kind: 'selector', value: t };
}

// Step format of browser-adapter/scripts/ownapp.mjs, interaction subset, plus clickText and back
// (needed to reproduce dead clicks on plain text and back-navigation).
const STR = (v) => typeof v === 'string' && v.length > 0;
export const STEP_TYPES = {
  goto: STR,
  click: (v) => v && typeof v === 'object' && STR(v.role) && typeof v.name === 'string',
  clickText: STR,
  fill: (v) => v && typeof v === 'object' && STR(v.label) && typeof v.value === 'string',
  check: (v) => v && typeof v === 'object' && STR(v.label),
  press: STR,
  wait: (v) => Number.isInteger(v) && v >= 0 && v <= 60000,
  viewport: (v) => typeof v === 'string' && /^\d{2,5}x\d{2,5}$/.test(v),
  back: (v) => v === true,
};

export function validateSteps(steps) {
  if (!Array.isArray(steps)) return ['steps.json must be a JSON array'];
  return steps.map((s, i) => {
    if (!s || typeof s !== 'object' || Array.isArray(s) || Object.keys(s).length !== 1) return `step ${i}: must be an object with exactly one key`;
    const [k] = Object.keys(s);
    if (!STEP_TYPES[k]) return `step ${i}: "${k}" is not supported by the recorder (${Object.keys(STEP_TYPES).join(', ')})`;
    return STEP_TYPES[k](s[k]) ? null : `step ${i}: bad value for "${k}": ${JSON.stringify(s[k])}`;
  }).filter(Boolean);
}

export function parseArgs(argv) {
  const o = { keepVideo: true, readonly: false };
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--readonly') o.readonly = true;
    else if (a === '--keep-video') o.keepVideo = true;
    else if (['--success', '--script', '--profile'].includes(a)) {
      if (i + 1 >= argv.length) return { error: `${a} needs a value` };
      o[a.slice(2)] = argv[++i];
    } else if (a.startsWith('--')) return { error: `unknown option ${a}` };
    else pos.push(a);
  }
  [o.url, o.outdir] = pos;
  if (!o.url || pos.length > 2) return { error: 'usage: node scripts/record.mjs <url> [outdir] [--success "<css>|url:<substring>"] [--script steps.json] [--profile <dir>] [--keep-video] [--readonly]' };
  if (o.readonly && o.script) return { error: '--script is disabled in --readonly mode: a third-party portal is never driven by a script' };
  if (o.success !== undefined && !parseSuccess(o.success)) return { error: `bad --success "${o.success}"` };
  return o;
}

// Injected into every main frame with context.addInitScript. Sends events through the __dashRec binding.
function pageLogger(maskInput) {
  if (window !== window.top || window.__dashRecOn) return;
  window.__dashRecOn = true;
  const queue = [];
  let waiting = false;
  const flush = () => {
    if (typeof window.__dashRec !== 'function') { if (!waiting) { waiting = true; setTimeout(() => { waiting = false; flush(); }, 50); } return; }
    while (queue.length) window.__dashRec(queue.shift());
  };
  const send = (ev) => { ev.ts = Date.now(); queue.push(ev); flush(); };

  const IMPLICIT = {
    A: (e) => (e.hasAttribute('href') ? 'link' : null), BUTTON: () => 'button', SELECT: () => 'combobox',
    TEXTAREA: () => 'textbox', SUMMARY: () => 'button', OPTION: () => 'option', DIALOG: () => 'dialog',
    INPUT: (e) => ({ checkbox: 'checkbox', radio: 'radio', button: 'button', submit: 'button', reset: 'button', range: 'slider', search: 'searchbox', number: 'spinbutton', hidden: null })[e.type] ?? 'textbox',
  };
  const INTERACTIVE = new Set(['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'combobox', 'textbox', 'searchbox', 'slider', 'spinbutton', 'treeitem']);
  const clean = (s) => String(s || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  const roleOf = (e) => e.getAttribute('role') || (IMPLICIT[e.tagName] ? IMPLICIT[e.tagName](e) : null);
  const byIds = (e) => (e.getAttribute('aria-labelledby') || '').split(/\s+/).map((id) => document.getElementById(id)?.innerText).filter(Boolean).join(' ');
  const isField = (e) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.tagName) || e.isContentEditable;
  const fieldLabel = (e) => clean(e.getAttribute('aria-label') || byIds(e) || e.labels?.[0]?.innerText || e.getAttribute('placeholder') || e.getAttribute('name') || e.id);
  // A field's name is its label, never its content.
  const nameOf = (e) => clean(isField(e) ? fieldLabel(e) : e.getAttribute('aria-label') || byIds(e) || e.innerText || e.getAttribute('title') || e.getAttribute('alt'));
  const selectorOf = (e) => {
    const parts = [];
    for (let n = e; n && n.nodeType === 1 && parts.length < 4; n = n.parentElement) {
      if (n.id) { parts.unshift(`${n.tagName.toLowerCase()}#${CSS.escape(n.id)}`); break; }
      let p = n.tagName.toLowerCase() + [...n.classList].slice(0, 2).map((c) => `.${CSS.escape(c)}`).join('');
      const sib = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName) : [];
      if (sib.length > 1) p += `:nth-of-type(${sib.indexOf(n) + 1})`;
      parts.unshift(p);
      if (n === document.body) break;
    }
    return parts.join(' > ');
  };
  const desc = (e) => ({ tag: e.tagName.toLowerCase(), role: roleOf(e), name: nameOf(e), selector: selectorOf(e) });
  const control = (e) => {
    for (let n = e; n && n !== document.body && n.nodeType === 1; n = n.parentElement) {
      const r = roleOf(n);
      if (r && INTERACTIVE.has(r)) return n;
      if (n.tagName === 'LABEL' && n.control) return n.control;
      if (n.isContentEditable) return n;
    }
    return null;
  };
  const el = (t) => (t && t.nodeType === 1 ? t : t?.parentElement || null);

  addEventListener('click', (ev) => {
    const t = el(ev.target);
    if (!t) return;
    const c = control(t);
    send({ type: 'click', x: Math.round(ev.clientX), y: Math.round(ev.clientY), button: ev.button, target: desc(t), control: c ? desc(c) : null });
  }, true);

  let lastMove = 0;
  addEventListener('pointermove', (ev) => {
    const now = Date.now();
    if (now - lastMove < 100) return;
    lastMove = now;
    send({ type: 'move', x: Math.round(ev.clientX), y: Math.round(ev.clientY) });
  }, true);

  // Leading and trailing throttle, so the final scroll position is always logged.
  let lastScroll = 0; let scrollTimer = null;
  addEventListener('scroll', (ev) => {
    const t = ev.target === document ? null : el(ev.target);
    const emit = () => { lastScroll = Date.now(); send(t ? { type: 'scroll', target: selectorOf(t), x: Math.round(t.scrollLeft), y: Math.round(t.scrollTop) } : { type: 'scroll', target: 'window', x: Math.round(scrollX), y: Math.round(scrollY) }); };
    clearTimeout(scrollTimer);
    if (Date.now() - lastScroll >= 200) emit(); else scrollTimer = setTimeout(emit, 200);
  }, true);

  addEventListener('focusin', (ev) => { const t = el(ev.target); if (t) send({ type: 'focus', target: desc(t) }); }, true);
  addEventListener('focusout', (ev) => { const t = el(ev.target); if (t) send({ type: 'blur', target: desc(t) }); }, true);

  addEventListener('input', (ev) => {
    const t = el(ev.target);
    if (!t || (t.tagName === 'INPUT' && ['checkbox', 'radio'].includes(t.type)) || t.tagName === 'SELECT') return;
    // A password's length is a secret too: log it as 0.
    const m = maskInput(fieldLabel(t), t.type === 'password' ? null : t.isContentEditable ? t.innerText : t.value);
    send({ type: 'input', field: m.field, length: m.length, inputType: ev.inputType || null, selector: selectorOf(t) });
  }, true);
  addEventListener('change', (ev) => {
    const t = el(ev.target);
    if (!t) return;
    if (t.tagName === 'INPUT' && ['checkbox', 'radio'].includes(t.type)) send({ type: 'change', field: fieldLabel(t), checked: t.checked, selector: selectorOf(t) });
    else if (t.tagName === 'SELECT') send({ type: 'change', field: fieldLabel(t), selectedIndex: t.selectedIndex, selector: selectorOf(t) });
  }, true);
  addEventListener('submit', (ev) => { const f = el(ev.target); if (f) send({ type: 'submit', name: clean(f.getAttribute('aria-label') || f.getAttribute('name') || f.id), selector: selectorOf(f) }); }, true);

  const KEYS = new Set(['Enter', 'Escape', 'Tab', 'Backspace']);
  addEventListener('keydown', (ev) => {
    if (!KEYS.has(ev.key)) return;
    const t = el(ev.target);
    send({ type: 'key', key: ev.key, shift: ev.shiftKey, target: t && t !== document.body ? desc(t) : null });
  }, true);

  // Mutation heartbeat: one line per 250 ms window that had mutations. No line = no change.
  let count = 0, lastInvalid = 0, lastAlerts = 0;
  const open = new Map();
  const visible = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  const tick = () => {
    if (!count) return;
    send({ type: 'mutations', count });
    count = 0;
    const now = new Set([...document.querySelectorAll('[role=dialog],[role=alertdialog],dialog[open]')].filter(visible));
    for (const d of now) if (!open.has(d)) { const info = desc(d); open.set(d, info); send({ type: 'dialog_open', target: info }); }
    for (const [d, info] of open) if (!now.has(d)) { open.delete(d); send({ type: 'dialog_close', target: info }); }
    // Validation state: counts only, never the alert text (it can quote what was typed).
    const invalid = [...document.querySelectorAll('[aria-invalid=true]')].filter(visible);
    const alerts = [...document.querySelectorAll('[role=alert]')].filter((a) => visible(a) && a.innerText.trim()).length;
    if (invalid.length > lastInvalid || alerts > lastAlerts) send({ type: 'validation', invalid: invalid.length, alerts, fields: invalid.slice(0, 5).map((e) => fieldLabel(e)) });
    lastInvalid = invalid.length; lastAlerts = alerts;
  };
  new MutationObserver((recs) => { count += recs.length; }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  setInterval(tick, 250);
}

function die(msg) { console.error(msg); process.exit(1); }

async function loadChromium() {
  let m;
  try { m = await import('playwright-core'); } catch {
    m = await import(pathToFileURL(createRequire(path.join(process.cwd(), 'noop.js')).resolve('playwright-core')).href);
  }
  return m.chromium ?? m.default.chromium;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Fixed delays (not random) so scripted recordings are repeatable and timing stays human-scale.
const THINK_MS = 700, TYPE_MS = 90;

async function moveTo(page, loc) {
  await loc.scrollIntoViewIfNeeded({ timeout: 5000 });
  const b = await loc.boundingBox();
  if (b) await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await sleep(150);
}

async function runStep(page, k, v, base, allowHost) {
  switch (k) {
    case 'goto': {
      const to = new URL(v, base).href;
      if (!isAllowedUrl(to, allowHost)) throw new Error(`refused host ${new URL(to).host}`);
      await page.goto(to, { waitUntil: 'domcontentloaded' });
      return;
    }
    case 'click': case 'clickText': {
      const loc = (k === 'click' ? page.getByRole(v.role, { name: v.name, exact: true }) : page.getByText(v, { exact: true })).first();
      await moveTo(page, loc);
      await loc.click({ timeout: 5000 });
      return;
    }
    case 'fill': {
      const loc = page.getByLabel(v.label, { exact: true }).first();
      await moveTo(page, loc);
      await loc.click({ timeout: 5000 });
      await loc.fill('');
      await loc.pressSequentially(v.value, { delay: TYPE_MS });
      return;
    }
    case 'check': { const loc = page.getByLabel(v.label, { exact: true }).first(); await moveTo(page, loc); await loc.check({ timeout: 5000 }); return; }
    case 'press': await page.keyboard.press(v); return;
    case 'wait': await sleep(v); return;
    case 'viewport': { const [width, height] = v.split('x').map(Number); await page.setViewportSize({ width, height }); return; }
    case 'back': await page.goBack({ waitUntil: 'domcontentloaded' }); return;
  }
}

// A real browser profile holds the user's cookies and passwords; the recorder never opens one.
function looksLikeUserProfile(dir) {
  return /Google\/Chrome|google-chrome|Chromium|BraveSoftware|Microsoft Edge/i.test(dir);
}

async function record(o) {
  const allowHost = process.env.DASH_ALLOW_HOST || '';
  let u;
  try { u = new URL(o.url); } catch { die(`bad url ${o.url}`); }
  if (!['http:', 'https:'].includes(u.protocol)) die(`refused: ${o.url} is not http(s)`);
  if (!o.readonly && !isAllowedUrl(o.url, allowHost)) die(`refused: ${u.host} is not a local host. Use --readonly to watch a third-party portal, or DASH_ALLOW_HOST=<host> for a staging host the user named; never production.`);
  let steps = null;
  if (o.script) {
    try { steps = JSON.parse(fs.readFileSync(o.script, 'utf8')); } catch (e) { die(`cannot read ${o.script}: ${e.message}`); }
    const errs = validateSteps(steps);
    if (errs.length) die(errs.join('\n'));
  }
  const profile = path.resolve(o.profile || path.join(os.homedir(), '.dash', 'recorder-profile'));
  if (looksLikeUserProfile(profile)) die(`refused profile ${profile}: use a dedicated recorder profile, never your normal browser profile`);
  const outdir = path.resolve(o.outdir || path.join('recordings', new Date().toISOString().replace(/[:.]/g, '-')));
  fs.mkdirSync(path.join(outdir, 'video'), { recursive: true });
  fs.mkdirSync(profile, { recursive: true });
  const success = o.success ? parseSuccess(o.success) : null;
  const files = { events: path.join(outdir, 'events.ndjson'), network: path.join(outdir, 'network.ndjson'), meta: path.join(outdir, 'meta.json'), trace: path.join(outdir, 'trace.zip') };
  fs.writeFileSync(files.events, '');
  fs.writeFileSync(files.network, '');

  if (o.readonly) console.error([
    'READ-ONLY MODE: this is a third-party portal. While recording:',
    '- only navigate: links, tabs, menus, buttons that open a view, Cancel, Esc, Close;',
    '- never Save, Create, Delete, Connect, Install or Buy; type only in global search;',
    '- do not open pages that show API keys or tokens. The video and trace stay on this machine.',
  ].join('\n'));

  const chromium = await loadChromium().catch((e) => die(`playwright-core not found (npm i -D playwright-core@1.62.1): ${e.message.split('\n')[0]}`));
  const viewport = { width: 1440, height: 900 };
  const startMs = Date.now();
  let ctx;
  const opts = { headless: false, viewport, recordVideo: { dir: path.join(outdir, 'video'), size: viewport } };
  try { ctx = await chromium.launchPersistentContext(profile, { ...opts, channel: 'chrome' }); } catch (e) {
    if (!process.env.CHROME_PATH) die(`cannot launch Chrome (needs Google Chrome or CHROME_PATH; close other windows using ${profile}): ${e.message.split('\n')[0]}`);
    ctx = await chromium.launchPersistentContext(profile, { ...opts, executablePath: process.env.CHROME_PATH });
  }
  const t = () => Date.now() - startMs;
  const write = (file, obj) => fs.appendFileSync(file, JSON.stringify(obj) + '\n');
  const tabs = [];
  const tabOf = (p) => { let i = tabs.indexOf(p); if (i < 0) { tabs.push(p); i = tabs.length - 1; } return i; };

  let stopReason = null, stopError = null, matchedAt = null;
  let wake;
  const stopped = new Promise((r) => { wake = r; });
  const stop = (reason, err) => { if (!stopReason) { stopReason = reason; stopError = err || null; wake(); } };

  await ctx.tracing.start({ screenshots: true, snapshots: true });
  await ctx.exposeBinding('__dashRec', ({ page }, ev) => {
    if (!ev || typeof ev !== 'object' || typeof ev.type !== 'string') return;
    const { ts, ...rest } = ev;
    write(files.events, { t: (Number(ts) || Date.now()) - startMs, tab: tabOf(page), ...rest });
  });
  await ctx.addInitScript({ content: `(${pageLogger})(${maskInput});` });

  const pending = new Map();
  let reqId = 0;
  const watch = (p) => {
    const tab = tabOf(p);
    p.on('framenavigated', (f) => {
      if (f !== p.mainFrame()) return;
      write(files.events, { t: t(), tab, type: 'navigation', url: scrubUrl(f.url()) });
      if (success?.kind === 'url' && f.url().includes(success.value)) { matchedAt = t(); stop('success'); }
      if (!o.readonly && f.url() !== 'about:blank' && !isAllowedUrl(f.url(), allowHost)) stop('left-allowed-hosts');
    });
    p.on('request', (r) => pending.set(r, { id: ++reqId, start: t() }));
    const done = (r, failed) => {
      const s = pending.get(r);
      if (!s) return;
      pending.delete(r);
      const res = failed ? null : r.response();
      Promise.resolve(res).then((resp) => write(files.network, {
        id: s.id, tab, start: s.start, end: t(), ms: t() - s.start, method: r.method(), type: r.resourceType(),
        status: resp ? resp.status() : null, failed: !!failed, ...stripQuery(r.url()),
      })).catch(() => {});
    };
    p.on('requestfinished', (r) => done(r, false));
    p.on('requestfailed', (r) => done(r, true));
    // Native alert/confirm: logged by type only (the text can hold data) and dismissed, the safe default.
    p.on('dialog', (d) => { write(files.events, { t: t(), tab, type: 'native_dialog', dialogType: d.type() }); d.dismiss().catch(() => {}); });
    p.on('close', () => { if (ctx.pages().length === 0) stop('closed'); });
  };
  ctx.on('page', watch);
  for (const p of ctx.pages()) watch(p);
  ctx.on('close', () => stop('closed'));
  const page = ctx.pages()[0] || (await ctx.newPage());

  const onSignal = () => stop('signal');
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
  let rl = null;
  if (!steps) {
    rl = readline.createInterface({ input: process.stdin });
    rl.on('line', () => stop('enter'));
    console.error(`Recording ${u.host}. Do the workflow in the Chrome window, then press Enter here.${success ? ' It also stops when the success condition matches.' : ''}`);
  }
  let poll = null;
  if (success?.kind === 'selector') poll = setInterval(async () => {
    for (const p of ctx.pages()) if (await p.locator(success.value).first().isVisible().catch(() => false)) { matchedAt ??= t(); stop('success'); }
  }, 250);

  const drive = async () => {
    try { await page.goto(o.url, { waitUntil: 'domcontentloaded' }); } catch (e) { return stop('script-error', `opening ${scrubUrl(o.url)}: ${scrubMessage(e.message)}`); }
    if (!steps) return;
    for (let i = 0; i < steps.length && !stopReason; i++) {
      const [[k, v]] = Object.entries(steps[i]);
      await sleep(THINK_MS);
      // Only the step index and kind: a fill value would leak through this line.
      write(files.events, { t: t(), tab: 0, type: 'script_step', i, action: k });
      try { await runStep(page, k, v, o.url, allowHost); } catch (e) { return stop('script-error', `step ${i} (${k}): ${scrubMessage(e.message)}`); }
    }
    await sleep(THINK_MS);
    stop('script-done');
  };
  drive();
  await stopped;

  clearInterval(poll);
  rl?.close();
  process.off('SIGINT', onSignal);
  process.off('SIGTERM', onSignal);
  // Let the last heartbeat and bindings land before closing.
  await sleep(400);
  const endMs = Date.now();
  for (const [r, s] of pending) write(files.network, { id: s.id, tab: 0, start: s.start, end: null, ms: null, method: r.method(), type: r.resourceType(), status: null, failed: false, ...stripQuery(r.url()) });
  const vp = page.isClosed() ? viewport : page.viewportSize() || viewport;
  await ctx.tracing.stop({ path: files.trace }).catch(() => {});
  await ctx.close().catch(() => {});
  const video = fs.readdirSync(path.join(outdir, 'video')).filter((f) => f.endsWith('.webm')).sort().map((f) => `video/${f}`);
  const meta = {
    schema: SCHEMA, version: VERSION, mode: o.readonly ? 'readonly' : steps ? 'script' : 'own-app',
    url: scrubUrl(o.url), start: new Date(startMs).toISOString(), startMs, end: new Date(endMs).toISOString(), endMs,
    durationMs: endMs - startMs, viewport: vp,
    success: success ? { condition: o.success, kind: success.kind, matched: matchedAt !== null, t: matchedAt } : null,
    stopReason, error: stopError, video, trace: fs.existsSync(files.trace) ? 'trace.zip' : null,
  };
  fs.writeFileSync(files.meta, JSON.stringify(meta, null, 2) + '\n');
  console.log(`wrote ${outdir} (${stopReason}${stopError ? `: ${stopError}` : ''})`);
  console.error('Keep recordings out of git (recordings/ is gitignored here). The video and trace.zip show typed values: delete them after analysis.');
  if (stopReason === 'script-error') process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const o = parseArgs(process.argv.slice(2));
  if (o.error) die(o.error);
  await record(o);
  // Chrome child handles can keep the loop alive after close.
  process.exit(process.exitCode ?? 0);
}
