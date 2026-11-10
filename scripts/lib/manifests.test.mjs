import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkManifests, PLUGINS, MARKETPLACES } from './manifests.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Copy the real manifests and the paths they reference into a temp root.
function copy() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'manifests-'));
  for (const rel of [...PLUGINS, ...MARKETPLACES, 'assets/logo.svg']) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.copyFileSync(path.join(repo, rel), path.join(root, rel));
  }
  fs.mkdirSync(path.join(root, 'skills'));
  return root;
}
const edit = (root, rel, fn) => {
  const f = path.join(root, rel);
  const m = JSON.parse(fs.readFileSync(f, 'utf8'));
  fn(m);
  fs.writeFileSync(f, JSON.stringify(m));
};

test('the repo manifests are in sync', () => {
  assert.deepEqual(checkManifests(repo), []);
});

test('version drift, a missing path, bad JSON and a missing file are reported', () => {
  const root = copy();
  edit(root, '.cursor-plugin/plugin.json', (m) => { m.version = '9.9.9'; });
  edit(root, '.claude-plugin/marketplace.json', (m) => { m.metadata.version = '0.0.1'; });
  fs.rmSync(path.join(root, 'assets/logo.svg'));
  fs.writeFileSync(path.join(root, 'gemini-extension.json'), '{');
  fs.rmSync(path.join(root, '.cursor-plugin/marketplace.json'));
  const errs = checkManifests(root).join('\n');
  assert.match(errs, /\.cursor-plugin\/plugin\.json: version "9\.9\.9"/);
  assert.match(errs, /marketplace\.json: metadata\.version "0\.0\.1"/);
  assert.match(errs, /\.codex-plugin\/plugin\.json: path \.\/assets\/logo\.svg does not exist/);
  assert.match(errs, /gemini-extension\.json: not JSON/);
  assert.match(errs, /\.cursor-plugin\/marketplace\.json: missing/);
});

test('codex interface limits and name/description drift', () => {
  const root = copy();
  edit(root, '.codex-plugin/plugin.json', (m) => { m.name = 'other'; m.interface.shortDescription = 'x'.repeat(31); m.interface.defaultPrompt = ['a', 'b', 'c', 'd']; });
  const errs = checkManifests(root).join('\n');
  assert.match(errs, /name "other" must equal "dash"/);
  assert.match(errs, /interface\.shortDescription must be 1-30 chars/);
  assert.match(errs, /defaultPrompt max 3/);
});

test('the native Codex catalog entry needs policy and category', () => {
  const root = copy();
  edit(root, '.agents/plugins/marketplace.json', (m) => { delete m.plugins[0].policy; });
  assert.match(checkManifests(root).join('\n'), /\.agents\/plugins\/marketplace\.json: plugins\.dash needs policy/);
});
