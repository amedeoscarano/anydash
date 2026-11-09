#!/usr/bin/env node
// Friction analysis: turns a session-recorder folder into <dir>/friction.json and <dir>/friction.md.
//
//   node scripts/analyze.mjs <recording dir> [--thresholds thresholds.json] [--frames]
//   node scripts/analyze.mjs --compare <dirA> <dirB> [--thresholds thresholds.json]
//
// Input: events.ndjson, network.ndjson (optional) and meta.json, schema 1 (session-recorder references/events.md).
// Steps end at goal actions (a live click on a button, link, menu item or tab; a form submit). Each step gets
// its time, a KLM baseline (K 0.2, P 1.1, B 0.1, H 0.4, M 1.35 s), delay = actual - baseline, and friction signals.
// Deterministic: no clock, no randomness, stable sorts; same files in, same bytes out.
// --frames runs ffmpeg (FFMPEG env or PATH) for one PNG per top bottleneck; without ffmpeg or the video it notes why and goes on.
// --compare writes <dirB>/friction-compare.json and .md (A = before, B = after).
// Exit 0 on success, 1 on bad arguments or an unreadable recording.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const VERSION = '0.2.0';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULTS = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'references', 'thresholds.json'), 'utf8'));
const USAGE = 'usage: node scripts/analyze.mjs <recording dir> [--thresholds file.json] [--frames]\n       node scripts/analyze.mjs --compare <dirA> <dirB> [--thresholds file.json]';

const GOAL_ROLES = new Set(['button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'tab', 'treeitem']);
const TEXT_ROLES = new Set(['textbox', 'searchbox', 'combobox', 'spinbutton']);
const ACTIONS = new Set(['click', 'input', 'key', 'change', 'submit']);
const REACTIONS = new Set(['mutations', 'navigation', 'change', 'submit', 'dialog_open', 'native_dialog']);
const CLOSE_NAME = /close|cancel|dismiss|^x$|×|chiudi|annulla/i;
const SEARCH_NAME = /search|find|cerca/i;

// Signal -> likely rule(s). weight ranks signals inside one step (count * weight); ties keep this order.
export const ADVICE = {
  back: { weight: 3, rules: ['NAV-002', 'MCP-007'], text: 'The user returned to a page they had just left: the label they followed did not lead to the task. Name menu items after the objects inside them and use one term for the concept in menu, page title and settings.' },
  'search-fallback': { weight: 3, rules: ['SET-012', 'NAV-002'], text: 'Navigation failed and the user fell back to search. Make the item findable by name in search, then fix the menu label they missed.' },
  dead: { weight: 2, rules: ['SET-010'], text: 'Clicks landed on something that did nothing. If it was a settings value, show the current value as the live control or as a summary row with the value; anywhere else, read the frame before keeping this rule.' },
  rage: { weight: 2, rules: ['STA-003', 'SAV-002'], text: 'Repeated clicks on one spot: the control gave no visible response. Show progress in place and confirm the change.' },
  validation: { weight: 2, rules: ['FDB-003'], text: 'The same form was sent again after edits, a sign the first try was rejected. Put the error under the field and state limits before the user types.' },
  'slow-network': { weight: 2, rules: ['STA-003', 'SAV-009'], text: 'A request kept the user waiting. Show a placeholder where the result will appear; run long jobs in the background and say so.' },
  correction: { weight: 1, rules: ['CTL-007', 'FDB-003'], text: 'The user deleted and retyped, or came back to a field. Keep units outside the value, enforce min, max and step, and state the format before typing.' },
  wander: { weight: 1, rules: ['NAV-002', 'NAV-005'], text: 'The pointer searched the menu. Use short noun labels; add groups only when the menu is large.' },
  'search-scroll': { weight: 1, rules: ['SET-007'], text: 'The user scrolled a long way and back, hunting for an item. Group the page along one axis with short headings.' },
  'modal-no-action': { weight: 1, rules: ['FDB-007'], text: 'A dialog opened and closed with nothing done in it. Open a modal only for a decision that must come first.' },
  'long-wait': { weight: 1, rules: ['HLP-001', 'SET-007'], text: 'A long pause before the first action on a new screen: the way forward was not obvious. Group with headings and add a one-line description where the effect is not obvious.' },
};

const r2 = (x) => Math.round(x * 100) / 100;
const pathOf = (u) => { try { const x = new URL(u); return x.pathname + x.hash; } catch { return String(u ?? ''); } };
const nameOf = (e) => (e.control ?? e.target)?.name || (e.control ?? e.target)?.tag || '?';
const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function loadThresholds(file) {
  if (!file) return DEFAULTS;
  const user = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const k of Object.keys(user)) if (!(k in DEFAULTS)) throw new Error(`${file}: unknown threshold "${k}"`);
  const th = { ...DEFAULTS, ...user, navRegion: { ...DEFAULTS.navRegion, ...user.navRegion }, klm: { ...DEFAULTS.klm, ...user.klm } };
  for (const [k, v] of Object.entries(th)) {
    const vals = k === '_note' ? [] : typeof v === 'object' ? Object.values(v) : [v];
    if (vals.some((n) => typeof n !== 'number' || !(n >= 0))) throw new Error(`${file}: "${k}" must be a number >= 0`);
  }
  return th;
}

export function parseNdjson(text, label = 'ndjson') {
  return text.split('\n').map((l, i) => [l.trim(), i]).filter(([l]) => l).map(([l, i]) => {
    try { return JSON.parse(l); } catch { throw new Error(`${label} line ${i + 1}: not JSON`); }
  });
}

export function loadRecording(dir) {
  const f = (n) => path.join(dir, n);
  if (!fs.existsSync(f('meta.json'))) throw new Error(`${dir}: no meta.json (recording incomplete, or not a recording folder)`);
  if (!fs.existsSync(f('events.ndjson'))) throw new Error(`${dir}: no events.ndjson`);
  const meta = JSON.parse(fs.readFileSync(f('meta.json'), 'utf8'));
  if (meta.schema !== 1) throw new Error(`${dir}: meta.schema ${meta.schema} is not supported (expected 1)`);
  return {
    meta,
    events: parseNdjson(fs.readFileSync(f('events.ndjson'), 'utf8'), 'events.ndjson'),
    network: fs.existsSync(f('network.ndjson')) ? parseNdjson(fs.readFileSync(f('network.ndjson'), 'utf8'), 'network.ndjson') : [],
  };
}

export function analyze({ events, network = [], meta = {} }, th = DEFAULTS) {
  // Lines arrive out of order; sort by t, arrival order breaks ties.
  const ev = events.map((e, i) => [e, i]).sort((a, b) => a[0].t - b[0].t || a[1] - b[1]).map(([e]) => e);
  const start = ev.find((e) => e.type === 'navigation' || ACTIONS.has(e.type))?.t ?? ev[0]?.t ?? 0;
  const signals = [];
  const sig = (type, t, detail) => signals.push({ type, t, detail });
  const clicks = ev.filter((e) => e.type === 'click');
  const navs = ev.filter((e) => e.type === 'navigation');

  // Screens: each navigation, or a large DOM change away from one.
  const screens = [];
  for (const e of ev) {
    const last = screens.at(-1);
    if (e.type === 'navigation') screens.push({ start: e.t, url: e.url, view: 1 });
    else if (e.type === 'mutations' && e.count >= th.majorDomChange && last && e.t - last.start > th.deadClickMs)
      screens.push({ start: e.t, url: last.url, view: last.view + 1 });
  }
  if (!screens.length || screens[0].start > start) screens.unshift({ start, url: meta.url ?? '', view: 1 });
  screens.forEach((s, i) => {
    const end = screens[i + 1]?.start ?? Infinity;
    const first = ev.find((e) => (ACTIONS.has(e.type) || e.type === 'scroll') && e.t > s.start && e.t < end);
    s.i = i + 1;
    s.label = pathOf(s.url) + (s.view > 1 ? ` (view ${s.view})` : '');
    s.waitMs = first ? first.t - s.start : null;
    if (s.waitMs > th.waitMs) sig('long-wait', s.start, `${r2(s.waitMs / 1000)} s before the first action on ${s.label}`);
  });
  const screenAt = (t) => screens.filter((s) => s.start <= t).at(-1) ?? screens[0];

  // Rage clicks: N clicks within the window and radius of the first; the extra clicks are waste.
  const rageExtra = new Set();
  clicks.forEach((c, i) => {
    if (rageExtra.has(c)) return;
    const cluster = clicks.slice(i).filter((d) => d.t - c.t <= th.rageWindowMs && Math.hypot(d.x - c.x, d.y - c.y) <= th.rageRadiusPx);
    if (cluster.length < th.rageClicks) return;
    cluster.slice(1).forEach((d) => rageExtra.add(d));
    sig('rage', c.t, `${cluster.length} clicks on "${nameOf(c)}"`);
  });

  // Dead clicks: on nothing interactive, or on a button/link, with no DOM change, navigation or dialog within the window.
  const reactions = ev.filter((e) => REACTIONS.has(e.type));
  const dead = new Set();
  for (const c of clicks) {
    if (c.button !== 0 || (c.control && !GOAL_ROLES.has(c.control.role))) continue;
    if (reactions.some((r) => r.t > c.t && r.t <= c.t + th.deadClickMs)) continue;
    dead.add(c);
    sig('dead', c.t, `"${nameOf(c)}"${c.control ? '' : ' (not interactive)'}`);
  }

  // Back-navigation: a URL left less than backWindowMs ago, per tab.
  const leftAt = new Map();
  const current = new Map();
  for (const n of navs) {
    const cur = current.get(n.tab);
    if (cur !== undefined && cur !== n.url) {
      leftAt.set(`${n.tab} ${cur}`, n.t);
      const left = leftAt.get(`${n.tab} ${n.url}`);
      if (left !== undefined && n.t - left <= th.backWindowMs) sig('back', n.t, `back to ${pathOf(n.url)}`);
    }
    current.set(n.tab, n.url);
  }

  // Pointer wandering: runs of moves inside the nav region whose path is much longer than the straight line.
  const inNav = (m) => m.x <= th.navRegion.maxX || m.y <= th.navRegion.maxY;
  let run = [];
  const endRun = () => {
    if (run.length >= 3) {
      let len = 0;
      for (let i = 1; i < run.length; i++) len += Math.hypot(run[i].x - run[i - 1].x, run[i].y - run[i - 1].y);
      const ratio = len / Math.max(1, Math.hypot(run.at(-1).x - run[0].x, run.at(-1).y - run[0].y));
      if (len >= th.wanderMinPx && ratio >= th.wanderRatio) sig('wander', run[0].t, `${Math.round(len)} px over the nav, ${r2(ratio)}x the straight line`);
    }
    run = [];
  };
  for (const e of ev) {
    if (e.type === 'move') { if (inNav(e)) run.push(e); else endRun(); }
    else if (e.type === 'click' || e.type === 'navigation') endRun();
  }
  endRun();

  // Field corrections: deletion bursts, and coming back to a field already typed in.
  const del = new Map();
  const edited = new Set();
  let lastFocus = null;
  for (const e of ev) {
    if (e.type === 'input') {
      edited.add(e.selector);
      if (!String(e.inputType ?? '').startsWith('delete')) continue;
      const d = del.get(e.selector) ?? { t: -Infinity, n: 0 };
      d.n = e.t - d.t <= th.burstGapMs ? d.n + 1 : 1;
      d.t = e.t;
      del.set(e.selector, d);
      if (d.n === th.backspaceBurst) sig('correction', e.t, `deletion burst in "${e.field}"`);
    } else if (e.type === 'focus') {
      const s = e.target?.selector;
      if (edited.has(s) && lastFocus !== s) sig('correction', e.t, `returned to "${e.target.name}"`);
      lastFocus = s;
    }
  }

  // Goal actions end steps. A submit right after a goal click is the same action.
  const goals = [];
  const merged = new Set();
  for (const e of ev) {
    const goalClick = e.type === 'click' && e.control && GOAL_ROLES.has(e.control.role) && !dead.has(e) && !rageExtra.has(e);
    if (!goalClick && e.type !== 'submit') continue;
    if (e.type === 'submit' && goals.length && e.t - goals.at(-1).t <= th.submitMergeMs) { merged.add(e); continue; }
    goals.push(e);
  }

  // Validation errors: aria-invalid or role=alert appearing soon after a goal action (recorder 'validation' events).
  // Fallback proxy for recordings without them: the same goal sent again after edits, no navigation in between.
  const goalSet = new Set(goals);
  const sent = new Map();
  let lastGoal = null;
  const realAt = [];
  for (const e of ev) {
    if (e.type === 'validation') {
      if (lastGoal && e.t - lastGoal.t <= th.validationWindowMs) {
        realAt.push(e.t);
        sig('validation', e.t, `${e.invalid ?? 0} invalid field(s)${e.fields?.length ? ` (${e.fields.join(', ')})` : ''}, ${e.alerts ?? 0} alert(s) after "${lastGoal.type === 'submit' ? lastGoal.name || lastGoal.selector : nameOf(lastGoal)}"`);
      }
      continue;
    }
    if (goalSet.has(e)) lastGoal = e;
    if (e.type === 'navigation') sent.clear();
    else if (e.type === 'input' || e.type === 'change') for (const v of sent.values()) v.edited = true;
    else if (goalSet.has(e)) {
      const key = e.type === 'submit' ? e.selector : e.control.selector;
      const prev = sent.get(key);
      if (prev?.edited && e.t - prev.t <= th.resubmitWindowMs && !realAt.some((t) => t > prev.t && t <= e.t)) sig('validation', e.t, `"${e.type === 'submit' ? e.name || e.selector : nameOf(e)}" sent again after edits`);
      sent.set(key, { t: e.t, edited: false });
    }
  }

  // Search-scroll: a long scroll one way, then a reverse.
  const sc = new Map();
  for (const e of ev.filter((x) => x.type === 'scroll')) {
    const s = sc.get(e.target) ?? { y: 0, dir: 0, run: 0, long: 0 };
    const d = e.y - s.y;
    s.y = e.y;
    sc.set(e.target, s);
    if (!d) continue;
    const dir = Math.sign(d);
    if (dir === s.dir) s.run += Math.abs(d);
    else { s.long = s.dir && s.run >= th.longScrollPx ? s.run : 0; s.dir = dir; s.run = Math.abs(d); }
    if (s.long && s.run >= th.reverseScrollPx) { sig('search-scroll', e.t, `scrolled ${s.long} px, then back ${s.run} px`); s.long = 0; }
  }

  // Search as a fallback: a search field focused after enough dead clicks or back-navigations.
  const misses = signals.filter((s) => s.type === 'dead' || s.type === 'back');
  let since = -Infinity;
  for (const f of ev.filter((e) => e.type === 'focus' && e.target)) {
    const isSearch = f.target.role === 'searchbox' || (TEXT_ROLES.has(f.target.role) && SEARCH_NAME.test(f.target.name ?? ''));
    if (!isSearch) continue;
    const n = misses.filter((m) => m.t > since && m.t < f.t && f.t - m.t <= th.searchFallbackWindowMs).length;
    if (n >= th.searchFallbackAfter) { sig('search-fallback', f.t, `search after ${n} dead clicks or back-navigations`); since = f.t; }
  }

  // Modals opened and closed with no action (closing clicks and outside clicks do not count).
  const open = new Map();
  for (const e of ev) {
    if (e.type === 'dialog_open') open.set(e.target?.selector, { name: e.target?.name, acted: false });
    else if (e.type === 'dialog_close') {
      const d = open.get(e.target?.selector);
      if (d && !d.acted) sig('modal-no-action', e.t, `"${d.name}" opened and closed with no action`);
      open.delete(e.target?.selector);
    } else if (['input', 'change', 'submit'].includes(e.type) || (e.type === 'key' && e.key === 'Enter')
      || (e.type === 'click' && e.control && !dead.has(e) && !CLOSE_NAME.test(e.control.name ?? ''))) for (const d of open.values()) d.acted = true;
  }

  // Slow requests on the critical path: document/fetch/xhr over the limit while the user did nothing.
  const actTimes = ev.filter((e) => ACTIONS.has(e.type)).map((e) => e.t);
  const reqs = network.map((r, i) => [r, i]).sort((a, b) => a[0].start - b[0].start || a[1] - b[1]).map(([r]) => r);
  for (const r of reqs) {
    if (!['document', 'fetch', 'xhr'].includes(r.type) || r.ms == null || r.ms <= th.slowRequestMs) continue;
    if (actTimes.some((t) => t > r.start && t < r.end)) continue;
    sig('slow-network', r.start, `${r.method} ${r.path} took ${r.ms} ms`);
  }

  // Steps.
  const steps = [];
  let s0 = start;
  for (const g of goals) { steps.push({ start: s0, end: g.t, goal: g }); s0 = g.t; }
  // A tail step only when the user still acted after the last goal; reactions to that goal do not count.
  const tail = ev.filter((e) => e.t > s0 && ((ACTIONS.has(e.type) && !merged.has(e)) || e.type === 'navigation'));
  if (tail.some((e) => e.type !== 'navigation')) steps.push({ start: s0, end: tail.at(-1).t, goal: null });
  if (!steps.length) steps.push({ start, end: Math.max(start, ev.at(-1)?.t ?? start), goal: null });
  const stepIndex = (t) => { const i = steps.findIndex((s) => t <= s.end); return i < 0 ? steps.length - 1 : i; };

  // KLM operators of the productive actions only: dead clicks, rage repeats and retyped characters are delay.
  const ops = steps.map(() => ({ M: 0, P: 0, B: 0, H: 0, K: 0 }));
  const add = (i, s) => { for (const o of s) ops[i][o]++; };
  const fieldClicked = new Set();
  const fieldLen = new Map();
  let lastEnter = -Infinity;
  for (const e of ev) {
    const i = stepIndex(e.t);
    if (e.type === 'key' && e.key === 'Enter') lastEnter = e.t;
    if (e.type === 'click') {
      if (dead.has(e) || rageExtra.has(e)) continue;
      // Enter in a form makes the browser fire a click at (0, 0) on the submit button: no pointing, the K is already counted.
      if (e.x === 0 && e.y === 0 && e.t - lastEnter <= th.submitMergeMs) continue;
      if (e.control && TEXT_ROLES.has(e.control.role)) {
        const k = `${i} ${e.control.selector}`;
        if (fieldClicked.has(k)) continue;
        fieldClicked.add(k);
      }
      add(i, 'MPB');
    } else if (e.type === 'input') fieldLen.set(`${i} ${e.selector}`, [i, e.length]);
    else if (e.type === 'change' && e.selectedIndex != null) add(i, 'PB');
    else if (e.type === 'key' && ['Enter', 'Tab', 'Escape'].includes(e.key)) add(i, 'K');
  }
  // shortcut: typing counts the final length as typed from empty; replacing a prefilled value is undercounted.
  for (const [i, len] of fieldLen.values()) { ops[i].H++; ops[i].K += len; }

  for (const s of signals) s.step = stepIndex(s.t) + 1;
  signals.sort((a, b) => a.t - b.t || a.type.localeCompare(b.type));
  const out = steps.map((s, i) => {
    const sigs = signals.filter((x) => x.step === i + 1).map(({ type, t, detail }) => ({ type, t, detail }));
    const baselineS = r2(Object.entries(ops[i]).reduce((a, [k, n]) => a + n * th.klm[k], 0));
    const actualS = r2((s.end - s.start) / 1000);
    const waits = screens.filter((x) => x.start >= s.start && (x.start < s.end || i === steps.length - 1) && x.waitMs != null).map((x) => x.waitMs);
    const g = s.goal;
    return {
      i: i + 1,
      label: !g ? '(after the last goal action)' : g.type === 'submit' ? `Submit "${g.name || g.selector}"` : `Click ${g.control.role} "${g.control.name}"`,
      screen: screenAt(g ? g.t : s.end).label,
      start: s.start, end: s.end, actualS, baselineS, delayS: r2(actualS - baselineS),
      waitMs: waits.length ? Math.max(...waits) : null,
      operators: ops[i],
      signals: sigs,
    };
  });

  const bottlenecks = [...out].filter((s) => s.delayS > 0).sort((a, b) => b.delayS - a.delayS || a.i - b.i).slice(0, th.topN)
    .map((s, k) => {
      const suggestion = suggest(s);
      // Frame at the first occurrence of the strongest signal: it shows the cause, not the screen load before it.
      const frameT = s.signals.find((x) => x.type === suggestion?.signals[0])?.t ?? s.end;
      return { rank: k + 1, step: s.i, label: s.label, screen: s.screen, delayS: s.delayS, frameT, frame: null, suggestion };
    });

  const count = {};
  for (const s of signals) count[s.type] = (count[s.type] ?? 0) + 1;
  const sum = (k) => r2(out.reduce((a, s) => a + Math.max(0, s[k]), 0)); // delay total = friction only, fast steps do not cancel it
  return {
    analyzer: VERSION,
    schema: 1,
    recording: { url: meta.url ?? null, mode: meta.mode ?? null, durationMs: meta.durationMs ?? null, stopReason: meta.stopReason ?? null, success: meta.success ?? null, video: meta.video ?? [] },
    thresholds: th,
    totals: { steps: out.length, actualS: sum('actualS'), baselineS: sum('baselineS'), delayS: sum('delayS'), signals: Object.fromEntries(Object.entries(count).sort()) },
    screens: screens.map(({ i, label, start: t, waitMs }) => ({ i, label, start: t, waitMs })),
    steps: out,
    bottlenecks,
    frames: { requested: false, extracted: 0, note: null },
  };
}

// Top two signal types of a step by count * weight; their rules in order, saving bounded by the delay.
function suggest(step) {
  const n = {};
  for (const s of step.signals) n[s.type] = (n[s.type] ?? 0) + 1;
  const order = Object.keys(ADVICE);
  const top = Object.keys(n).sort((a, b) => n[b] * ADVICE[b].weight - n[a] * ADVICE[a].weight || order.indexOf(a) - order.indexOf(b)).slice(0, 2);
  if (!top.length) return null;
  return { signals: top, rules: [...new Set(top.flatMap((t) => ADVICE[t].rules))], text: top.map((t) => ADVICE[t].text).join(' '), savedS: step.delayS };
}

export function extractFrames(dir, result, ffmpeg = process.env.FFMPEG || 'ffmpeg') {
  const f = result.frames = { requested: true, extracted: 0, note: null };
  const video = result.recording.video?.[0];
  const file = video && path.resolve(dir, video);
  if (!result.bottlenecks.length) { f.note = 'no bottlenecks, no frames'; return f; }
  if (!file || !file.startsWith(path.resolve(dir) + path.sep) || !fs.existsSync(file)) { f.note = `video not found (${video ?? 'meta.video is empty'}); frames skipped`; return f; }
  const probe = spawnSync(ffmpeg, ['-version'], { stdio: 'ignore' });
  if (probe.error || probe.status !== 0) { f.note = `ffmpeg not available (${ffmpeg}); frames skipped. Install ffmpeg or set FFMPEG`; return f; }
  fs.mkdirSync(path.join(dir, 'frames'), { recursive: true });
  for (const b of result.bottlenecks) {
    const rel = `frames/step-${String(b.step).padStart(2, '0')}.png`;
    const out = path.join(dir, rel);
    fs.rmSync(out, { force: true });
    // shortcut: video 0 is taken as meta.startMs; Playwright starts it a few hundred ms later, so frames run slightly late.
    const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', (b.frameT / 1000).toFixed(2), '-i', file, '-frames:v', '1', out], { stdio: 'ignore' });
    if (r.status === 0 && fs.existsSync(out)) { b.frame = rel; f.extracted++; }
  }
  if (f.extracted < result.bottlenecks.length) f.note = `${result.bottlenecks.length - f.extracted} frame(s) failed (timestamp past the end of the video?)`;
  return f;
}

const ops = (o) => Object.entries(o).filter(([, n]) => n).map(([k, n]) => `${n}${k}`).join(' ') || '-';
const sigList = (sigs) => {
  const n = {};
  for (const s of sigs) n[s.type] = (n[s.type] ?? 0) + 1;
  return Object.entries(n).map(([k, v]) => (v > 1 ? `${k} x${v}` : k)).join(', ') || '-';
};

export function renderMarkdown(r, thresholdsLabel = 'defaults (references/thresholds.json)') {
  const rec = r.recording;
  const success = rec.success ? (rec.success.matched ? 'matched' : 'not matched') : 'not set';
  const L = [
    '# Friction report', '',
    `- Recording: ${rec.url ?? '?'} (mode ${rec.mode ?? '?'}, ${rec.durationMs != null ? r2(rec.durationMs / 1000) : '?'} s, stop: ${rec.stopReason ?? '?'}, success: ${success})`,
    `- ${r.totals.steps} steps: actual ${r.totals.actualS} s, KLM baseline ${r.totals.baselineS} s, delay ${r.totals.delayS} s (sum of the steps slower than their baseline)`,
    `- Thresholds: ${thresholdsLabel}. First-guess values: calibrate on the first real recording.`,
    '', '## Steps', '',
    '| # | Step | Screen | Actual s | Baseline s | Delay s | KLM | Signals |',
    '|---|---|---|---|---|---|---|---|',
    ...r.steps.map((s) => `| ${s.i} | ${cell(s.label)} | ${cell(s.screen)} | ${s.actualS.toFixed(2)} | ${s.baselineS.toFixed(2)} | ${s.delayS.toFixed(2)} | ${ops(s.operators)} | ${sigList(s.signals)} |`),
    '', '## Top bottlenecks', '',
  ];
  if (!r.bottlenecks.length) L.push('No step took longer than its KLM baseline.', '');
  for (const b of r.bottlenecks) {
    const step = r.steps[b.step - 1];
    L.push(`### ${b.rank}. Step ${b.step}: ${b.label} (+${b.delayS.toFixed(2)} s)`, '', `- Screen: ${b.screen}`);
    L.push(`- Signals: ${step.signals.length ? '' : 'none (slow without a logged signal: watch the frame)'}`);
    for (const s of step.signals) L.push(`  - ${(s.t / 1000).toFixed(2)} s ${s.type}: ${s.detail}`);
    L.push(b.frame ? `- Frame at ${(b.frameT / 1000).toFixed(2)} s: ![step ${b.step}](${b.frame})`
      : `- Frame at ${(b.frameT / 1000).toFixed(2)} s: ${r.frames.requested ? `not extracted (${r.frames.note})` : 'not extracted (run with --frames)'}`);
    if (b.suggestion) L.push(`- Suggestion (${b.suggestion.rules.join(', ')}): ${b.suggestion.text} Estimated saving: up to ${b.suggestion.savedS.toFixed(2)} s.`);
    L.push('');
  }
  L.push('## Notes', '',
    '- Baseline = KLM operators of the productive actions (click M+P+B, field H + n*K, select +P+B, Enter/Tab/Escape K). Dead clicks, rage repeats and retyped characters count as delay.',
    '- Estimated saving is an upper bound: the delay of the step, if the friction is removed.',
    '- Validation errors come from aria-invalid fields or role=alert appearing after a goal action; in recordings without those events, from the same form sent again after edits.', '');
  return L.join('\n');
}

export function compare(a, b) {
  const used = new Set();
  const steps = a.steps.map((sa) => {
    const j = b.steps.findIndex((sb, k) => !used.has(k) && sb.label === sa.label);
    if (j >= 0) used.add(j);
    const sb = b.steps[j];
    return { label: sa.label, a: sa.actualS, b: sb ? sb.actualS : null, change: sb ? r2(sb.actualS - sa.actualS) : null };
  });
  b.steps.forEach((sb, k) => { if (!used.has(k)) steps.push({ label: sb.label, a: null, b: sb.actualS, change: null }); });
  const types = [...new Set([...Object.keys(a.totals.signals), ...Object.keys(b.totals.signals)])].sort();
  const t = (k) => ({ a: a.totals[k], b: b.totals[k], change: r2(b.totals[k] - a.totals[k]) });
  return {
    analyzer: VERSION,
    totals: { steps: t('steps'), actualS: t('actualS'), baselineS: t('baselineS'), delayS: t('delayS') },
    signals: types.map((type) => ({ type, a: a.totals.signals[type] ?? 0, b: b.totals.signals[type] ?? 0 })),
    steps,
  };
}

export function renderCompare(c, labelA, labelB) {
  const v = (x) => (x == null ? '-' : typeof x === 'number' && !Number.isInteger(x) ? x.toFixed(2) : String(x));
  return [
    '# Friction comparison', '', `- A (before): ${labelA}`, `- B (after): ${labelB}`, '',
    '| Total | A | B | Change |', '|---|---|---|---|',
    ...Object.entries(c.totals).map(([k, x]) => `| ${k} | ${v(x.a)} | ${v(x.b)} | ${v(x.change)} |`),
    '', '| Signal | A | B |', '|---|---|---|',
    ...c.signals.map((s) => `| ${s.type} | ${s.a} | ${s.b} |`),
    '', '| Step | A s | B s | Change s |', '|---|---|---|---|',
    ...c.steps.map((s) => `| ${cell(s.label)} | ${v(s.a)} | ${v(s.b)} | ${v(s.change)} |`),
    '', 'Steps are matched by label in order; a step only in A was removed, only in B was added.', '',
  ].join('\n');
}

export function parseArgs(argv) {
  const o = { dirs: [], thresholds: null, frames: false, compare: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--frames') o.frames = true;
    else if (a === '--compare') o.compare = true;
    else if (a === '--thresholds') { if (i + 1 >= argv.length) return { error: '--thresholds needs a file' }; o.thresholds = argv[++i]; }
    else if (a.startsWith('--')) return { error: `unknown option ${a}` };
    else o.dirs.push(a);
  }
  if (o.dirs.length !== (o.compare ? 2 : 1)) return { error: USAGE };
  if (o.compare && o.frames) return { error: '--frames is not used with --compare; run each folder on its own first' };
  return o;
}

export function main(argv) {
  const o = parseArgs(argv);
  if (o.error) throw new Error(o.error);
  const th = loadThresholds(o.thresholds);
  const label = o.thresholds ? `${o.thresholds} over the defaults` : undefined;
  if (o.compare) {
    const [ra, rb] = o.dirs.map((d) => analyze(loadRecording(d), th));
    const c = compare(ra, rb);
    fs.writeFileSync(path.join(o.dirs[1], 'friction-compare.json'), JSON.stringify(c, null, 2) + '\n');
    fs.writeFileSync(path.join(o.dirs[1], 'friction-compare.md'), renderCompare(c, path.basename(path.resolve(o.dirs[0])), path.basename(path.resolve(o.dirs[1]))));
    return `delay ${c.totals.delayS.a} s -> ${c.totals.delayS.b} s; wrote ${path.join(o.dirs[1], 'friction-compare.md')}`;
  }
  const dir = o.dirs[0];
  const r = analyze(loadRecording(dir), th);
  if (o.frames) extractFrames(dir, r);
  fs.writeFileSync(path.join(dir, 'friction.json'), JSON.stringify(r, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'friction.md'), renderMarkdown(r, label));
  const top = r.bottlenecks[0];
  return `${r.totals.steps} steps, delay ${r.totals.delayS} s${top ? `, top bottleneck step ${top.step} (+${top.delayS} s)` : ''}${r.frames.note ? `; frames: ${r.frames.note}` : ''}; wrote ${path.join(dir, 'friction.md')}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  try { console.log(main(process.argv.slice(2))); } catch (e) { console.error(e.message); process.exit(1); }
}
