import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { analyze, parseNdjson, loadThresholds, parseArgs, compare, extractFrames, DEFAULTS } from './analyze.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, 'analyze.mjs');
const read = (f) => parseNdjson(fs.readFileSync(path.join(here, 'fixtures', f), 'utf8'));
const meta = (events) => ({ schema: 1, version: '0.2.0', mode: 'script', url: 'http://127.0.0.1:3198/', startMs: 0, durationMs: events.at(-1).t, stopReason: 'script-done', success: null, video: [], trace: null });
const load = (name) => {
  const events = read(`${name}.ndjson`);
  const net = path.join(here, 'fixtures', `${name}.network.ndjson`);
  return { events, network: fs.existsSync(net) ? read(`${name}.network.ndjson`) : [], meta: meta(events) };
};
const run = (name, th) => analyze(load(name), th);
const types = (r) => r.steps.flatMap((s) => s.signals.map((x) => x.type));
const only = (r, type) => r.steps.flatMap((s) => s.signals.filter((x) => x.type === type).map((x) => ({ ...x, step: s.i })));

const tmpDirs = [];
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }); });

// Writes a fixture as a recording folder (meta.json written last, as the recorder does).
function recDir(name) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `friction-${name}-`));
  tmpDirs.push(dir);
  const { events, network, meta: m } = load(name);
  fs.writeFileSync(path.join(dir, 'events.ndjson'), events.map((e) => JSON.stringify(e)).join('\n') + '\n');
  fs.writeFileSync(path.join(dir, 'network.ndjson'), network.map((e) => JSON.stringify(e)).join('\n'));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(m));
  return dir;
}
const cli = (args, env = {}) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });

test('rage click: 3 clicks in 1 s within 30 px, extra clicks out of the baseline', () => {
  const r = run('rage');
  assert.deepEqual(types(r), ['rage']);
  assert.equal(only(r, 'rage')[0].t, 1000);
  assert.equal(r.steps[0].baselineS, 2.55);
  assert.deepEqual(types(run('rage', { ...DEFAULTS, rageClicks: 4 })), []);
});

test('dead click: no mutation or navigation within 1 s; a reacting button is not dead', () => {
  const r = run('dead');
  assert.deepEqual(only(r, 'dead').map((s) => s.t), [1000]);
  assert.match(only(r, 'dead')[0].detail, /Package weight.*not interactive/);
  assert.equal(r.steps.length, 1, 'the dead click is not a goal action');
  assert.equal(r.steps[0].baselineS, 2.55, 'the dead click is out of the baseline');
});

test('back-navigation: a URL left less than 30 s ago', () => {
  const r = run('back');
  assert.deepEqual(only(r, 'back').map((s) => [s.t, s.step]), [[6000, 3]]);
  assert.deepEqual(types(run('back', { ...DEFAULTS, backWindowMs: 2000 })), []);
});

test('pointer wandering over the nav region; a straight path is not wandering', () => {
  const r = run('wander');
  const w = only(r, 'wander');
  assert.equal(w.length, 1);
  assert.equal(w[0].step, 1);
  assert.match(w[0].detail, /^1093 px/);
});

test('field corrections: deletion burst and coming back to an edited field', () => {
  const r = run('correction');
  assert.deepEqual(only(r, 'correction').map((s) => [s.t, s.detail]), [[1800, 'deletion burst in "Default weight"'], [3500, 'returned to "Default weight"']]);
  // Final lengths 2 and 1: two fields typed, no click on them.
  assert.deepEqual(r.steps[0].operators, { M: 1, P: 1, B: 1, H: 2, K: 3 });
});

test('validation error proxy: the same form sent again after edits; click + submit is one action', () => {
  const r = run('validation');
  assert.equal(r.steps.length, 2);
  assert.deepEqual(only(r, 'validation').map((s) => [s.t, s.step]), [[4000, 2]]);
});

test('validation error from aria-invalid/alert after a goal action; the resubmit proxy does not double count', () => {
  const rec = load('validation');
  const v = { tab: 0, type: 'validation', invalid: 1, alerts: 0, fields: ['Default weight'] };
  rec.events.push({ t: 2300, ...v }, { t: 7000, ...v }); // second one is 3 s after the last goal: not caused by it
  const r = analyze(rec);
  assert.deepEqual(only(r, 'validation').map((s) => [s.t, s.step]), [[2300, 2]]);
  assert.match(only(r, 'validation')[0].detail, /1 invalid field\(s\) \(Default weight\), 0 alert\(s\) after "Save"/);
});

test('search-scroll: long scroll then reverse', () => {
  const r = run('search-scroll');
  assert.deepEqual(only(r, 'search-scroll').map((s) => [s.t, s.detail]), [[2700, 'scrolled 1900 px, then back 500 px']]);
  assert.deepEqual(types(r), ['search-scroll'], 'scrolling counts as the first action, so no long-wait');
});

test('modal opened and closed with no action; a modal with a change in it is fine', () => {
  const r = run('modal');
  assert.deepEqual(only(r, 'modal-no-action').map((s) => [s.t, s.detail]), [[3250, '"Filters" opened and closed with no action']]);
});

test('slow network: only document/fetch/xhr over 1 s with no user action while pending', () => {
  const r = run('slow-network');
  assert.deepEqual(only(r, 'slow-network').map((s) => [s.step, s.detail]), [[2, 'GET /api/orders took 2490 ms']]);
});

test('wait before the first action on a new screen, and a large DOM change starts a screen', () => {
  const r = run('wait');
  assert.deepEqual(r.screens.map((s) => [s.label, s.waitMs]), [['/settings', 4900], ['/settings/packages', 900], ['/settings/packages (view 2)', null]]);
  assert.deepEqual(only(r, 'long-wait').map((s) => s.step), [1]);
  assert.equal(r.steps[0].waitMs, 4900);
});

test('search used as a fallback after dead clicks and a back-navigation', () => {
  const r = run('detour');
  assert.deepEqual(only(r, 'search-fallback').map((s) => [s.t, s.step]), [[10000, 2]]);
  // The clean flow uses no search and has no signals.
  assert.deepEqual(types(run('after')), []);
});

test('KLM math: operators per action and baseline from the published constants', () => {
  const r = run('klm');
  assert.deepEqual(types(r), [], 'clean flow: no signal');
  assert.equal(r.steps.length, 1);
  // textbox click MPB, 3 chars H+3K, Tab K, select click MPB + option PB, checkbox MPB, Save MPB.
  assert.deepEqual(r.steps[0].operators, { M: 4, P: 5, B: 5, H: 1, K: 4 });
  assert.equal(r.steps[0].baselineS, 12.6);
  assert.equal(r.steps[0].actualS, 4.9);
  assert.equal(r.steps[0].delayS, -7.7);
  const custom = run('klm', { ...DEFAULTS, klm: { K: 0.28, P: 1.1, B: 0.1, H: 0.4, M: 1.35 } });
  assert.equal(custom.steps[0].baselineS, 12.92);
});

test('ranking: the detour step is the top bottleneck, sorted by delay, rule-linked', () => {
  const r = run('detour');
  const [top] = r.bottlenecks;
  assert.equal(top.step, 2);
  assert.equal(top.label, 'Click link "Default package weight"');
  assert.equal(top.delayS, 3.8);
  assert.equal(top.frameT, 4000, 'frame at the first signal of the step');
  assert.deepEqual(top.suggestion.signals, ['dead', 'back']);
  assert.deepEqual(top.suggestion.rules, ['SET-010', 'NAV-002', 'MCP-007']);
  assert.equal(top.suggestion.savedS, 3.8);
  const d = r.bottlenecks.map((b) => b.delayS);
  assert.deepEqual(d, [...d].sort((a, b) => b - a));
  assert.ok(r.bottlenecks.every((b) => b.delayS > 0));
});

test('determinism: same files give the same bytes; line order does not matter', () => {
  const dir = recDir('detour');
  assert.equal(cli([dir]).status, 0);
  const first = ['friction.json', 'friction.md'].map((f) => fs.readFileSync(path.join(dir, f), 'utf8'));
  assert.equal(cli([dir]).status, 0);
  assert.deepEqual(['friction.json', 'friction.md'].map((f) => fs.readFileSync(path.join(dir, f), 'utf8')), first);
  const shuffled = load('detour');
  shuffled.events = [...shuffled.events].reverse();
  assert.deepEqual(analyze(shuffled), run('detour'));
  assert.match(first[1], /\| 2 \| Click link "Default package weight" \| \/ \| 10\.50 \| 6\.70 \| 3\.80 \|/);
  assert.match(first[1], /SET-010, NAV-002, MCP-007/);
});

test('--compare: before/after totals, signals and steps matched by label', () => {
  const c = compare(run('detour'), run('after'));
  assert.deepEqual(c.totals.delayS, { a: 3.8, b: 0, change: -3.8 });
  assert.deepEqual(c.signals.find((s) => s.type === 'dead'), { type: 'dead', a: 2, b: 0 });
  assert.deepEqual(c.steps.find((s) => s.label === 'Click button "Save"'), { label: 'Click button "Save"', a: 2.5, b: 3.5, change: 1 });
  assert.ok(c.steps.some((s) => s.label === 'Click link "Packages"' && s.a === null));
  const a = recDir('detour');
  const b = recDir('after');
  const res = cli(['--compare', a, b]);
  assert.equal(res.status, 0, res.stderr);
  assert.match(fs.readFileSync(path.join(b, 'friction-compare.md'), 'utf8'), /\| dead \| 2 \| 0 \|/);
});

test('--frames without ffmpeg or video: report says why, exit 0', () => {
  const dir = recDir('detour');
  let res = cli([dir, '--frames'], { FFMPEG: '/nonexistent/ffmpeg' });
  assert.equal(res.status, 0, res.stderr);
  assert.match(fs.readFileSync(path.join(dir, 'friction.md'), 'utf8'), /video not found/);
  fs.mkdirSync(path.join(dir, 'video'));
  fs.writeFileSync(path.join(dir, 'video', 'page.webm'), 'x');
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ ...m, video: ['video/page.webm'] }));
  res = cli([dir, '--frames'], { FFMPEG: '/nonexistent/ffmpeg' });
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /ffmpeg not available/);
  assert.match(fs.readFileSync(path.join(dir, 'friction.md'), 'utf8'), /not extracted \(ffmpeg not available/);
  // A video path outside the folder is refused.
  const r = run('detour');
  r.recording.video = ['../../etc/passwd'];
  assert.match(extractFrames(dir, r).note, /video not found/);
});

const ffmpeg = process.env.FFMPEG || ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/usr/bin/ffmpeg'].find((p) => fs.existsSync(p));
test('--frames with ffmpeg: one PNG per bottleneck', { skip: !ffmpeg && 'ffmpeg not installed' }, () => {
  const dir = recDir('detour');
  fs.mkdirSync(path.join(dir, 'video'));
  const mk = spawnSync(ffmpeg, ['-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc=duration=16:size=64x48:rate=5', path.join(dir, 'video', 'page.webm')]);
  assert.equal(mk.status, 0, String(mk.stderr));
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ ...m, video: ['video/page.webm'] }));
  const res = cli([dir, '--frames'], { FFMPEG: ffmpeg });
  assert.equal(res.status, 0, res.stderr);
  const out = JSON.parse(fs.readFileSync(path.join(dir, 'friction.json'), 'utf8'));
  assert.equal(out.frames.extracted, out.bottlenecks.length);
  assert.ok(fs.existsSync(path.join(dir, 'frames', 'step-02.png')));
  assert.match(fs.readFileSync(path.join(dir, 'friction.md'), 'utf8'), /!\[step 2\]\(frames\/step-02\.png\)/);
});

test('arguments, thresholds and bad input', () => {
  assert.ok(parseArgs([]).error);
  assert.ok(parseArgs(['a', 'b']).error);
  assert.ok(parseArgs(['--compare', 'a']).error);
  assert.ok(parseArgs(['--compare', 'a', 'b', '--frames']).error);
  assert.ok(parseArgs(['a', '--thresholds']).error);
  assert.deepEqual(parseArgs(['a', '--frames', '--thresholds', 't.json']), { dirs: ['a'], thresholds: 't.json', frames: true, compare: false });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'friction-th-'));
  tmpDirs.push(tmp);
  const t = path.join(tmp, 't.json');
  fs.writeFileSync(t, JSON.stringify({ rageClicks: 4, navRegion: { maxX: 300 } }));
  const th = loadThresholds(t);
  assert.equal(th.rageClicks, 4);
  assert.deepEqual(th.navRegion, { maxX: 300, maxY: 64 });
  fs.writeFileSync(t, JSON.stringify({ rageClick: 4 }));
  assert.throws(() => loadThresholds(t), /unknown threshold "rageClick"/);
  fs.writeFileSync(t, JSON.stringify({ waitMs: -1 }));
  assert.throws(() => loadThresholds(t), /waitMs/);
  const res = cli([tmp]);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /no meta.json/);
  assert.throws(() => parseNdjson('{"t":1}\n{bad', 'events.ndjson'), /line 2/);
});

test('Enter in a form: the browser click at (0, 0) on Save is not a pointing action', () => {
  const r = run('enter-submit');
  assert.equal(r.steps.length, 1);
  assert.equal(r.steps[0].label, 'Click button "Save"');
  // field click MPB, 2 chars H+2K, Enter K; no second MPB for the synthetic click.
  assert.deepEqual(r.steps[0].operators, { M: 1, P: 1, B: 1, H: 1, K: 3 });
  assert.equal(r.steps[0].baselineS, 3.55);
});

test('frame time: first occurrence of the strongest signal, not the first signal', () => {
  const events = [
    { t: 100, tab: 0, type: 'navigation', url: 'http://127.0.0.1:3198/orders' },
    { t: 4000, tab: 0, type: 'click', x: 500, y: 200, button: 0, target: { tag: 'th', role: null, name: 'Status', selector: 'th' }, control: null },
    { t: 5000, tab: 0, type: 'click', x: 500, y: 200, button: 0, target: { tag: 'th', role: null, name: 'Status', selector: 'th' }, control: null },
    { t: 9000, tab: 0, type: 'click', x: 80, y: 100, button: 0, target: { tag: 'a', role: 'link', name: 'Settings', selector: 'a' }, control: { tag: 'a', role: 'link', name: 'Settings', selector: 'a' } },
    { t: 9010, tab: 0, type: 'navigation', url: 'http://127.0.0.1:3198/settings' },
  ];
  const [top] = analyze({ events, network: [], meta: meta(events) }).bottlenecks;
  assert.deepEqual(top.suggestion.signals, ['dead', 'long-wait']);
  assert.equal(top.frameT, 4000, 'the dead click, not the long-wait at the screen start (100)');
});
