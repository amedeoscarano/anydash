// Run scripts/install.sh against a temp HOME with fake agent config dirs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(root, 'scripts', 'install.sh');
const skills = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);

function home(...dirs) {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), 'anydash-install-'));
  for (const d of dirs) fs.mkdirSync(path.join(h, d), { recursive: true });
  return h;
}
// Minimal PATH so a real claude/codex/cursor/gemini on this machine is not detected.
const run = (h, ...args) => spawnSync('bash', [script, ...args], { encoding: 'utf8', env: { HOME: h, PATH: '/usr/bin:/bin' } });
const fm = (file) => fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n/)[1];

test('dry-run changes nothing', () => {
  const h = home('.codex', '.gemini');
  const r = run(h, '--dry-run');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /would: write .*dash-build\/SKILL\.md/);
  assert.deepEqual(fs.readdirSync(h).sort(), ['.codex', '.gemini']);
});

test('installs per detected tool, rewrites name, strips Claude Code keys', () => {
  const h = home('.codex', '.gemini');
  assert.equal(run(h).status, 0);
  for (const dir of ['.agents/skills', '.gemini/skills']) {
    assert.deepEqual(fs.readdirSync(path.join(h, dir)).sort(), skills.map((s) => `dash-${s}`).sort());
    const f = fm(path.join(h, dir, 'dash-review-live', 'SKILL.md'));
    assert.match(f, /^name: dash-review-live$/m);
    assert.doesNotMatch(f, /^(disable-model-invocation|argument-hint|context|user-invocable):/m);
  }
  assert.ok(fs.existsSync(path.join(h, '.agents/skills/dash-build/references')));
  assert.match(fs.readFileSync(path.join(h, '.agents/skills/dash-visual-audit/SKILL.md'), 'utf8'), /\.\.\/dash-browser-adapter\/SKILL\.md/);
  assert.ok(!fs.existsSync(path.join(h, '.claude')));
});

test('claude keeps its keys; --link symlinks resources; cursor keeps disable-model-invocation', () => {
  const h = home();
  assert.equal(run(h, '--tool', 'claude', '--tool', 'cursor', '--link').status, 0);
  const c = path.join(h, '.claude/skills/dash-build');
  assert.match(fm(path.join(c, 'SKILL.md')), /^disable-model-invocation: true$/m);
  assert.ok(fs.lstatSync(path.join(c, 'references')).isSymbolicLink());
  const cur = fm(path.join(h, '.cursor/skills/dash-review-live/SKILL.md'));
  assert.match(cur, /^disable-model-invocation: true$/m);
  assert.doesNotMatch(cur, /^(argument-hint|context):/m);
});

test('uninstall removes only what it installed', () => {
  const h = home('.codex');
  assert.equal(run(h).status, 0);
  fs.mkdirSync(path.join(h, '.agents/skills/dash-build-mine'));
  fs.mkdirSync(path.join(h, '.agents/skills/other'));
  const r = run(h, '--uninstall');
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(fs.readdirSync(path.join(h, '.agents/skills')).sort(), ['dash-build-mine', 'other']);
});

test('refuses to overwrite a foreign dash-<name> folder', () => {
  const h = home('.gemini');
  fs.mkdirSync(path.join(h, '.gemini/skills/dash-build'), { recursive: true });
  const r = run(h);
  assert.match(r.stderr, /not installed by anydash/);
  assert.deepEqual(fs.readdirSync(path.join(h, '.gemini/skills/dash-build')), []);
});

test('no tool detected exits 1', () => {
  assert.equal(run(home()).status, 1);
});
