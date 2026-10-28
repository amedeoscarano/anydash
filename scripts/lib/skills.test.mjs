import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkSkill } from './skills.mjs';

const skill = (name, body) => {
  const dir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'skill-')), name);
  fs.mkdirSync(path.join(dir, 'references'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'references', 'rules.md'), 'x');
  fs.writeFileSync(path.join(dir, 'SKILL.md'), body);
  return dir;
};

test('a valid skill passes', () => {
  assert.deepEqual(checkSkill(skill('good-one', '---\nname: good-one\ndescription: Does a thing.\nuser-invocable: false\n---\nSee `references/rules.md`.\n')), []);
});

test('name, description, keys and links are checked', () => {
  const errs = checkSkill(skill('bad', `---\nname: other\ndescription: ${'x'.repeat(1025)}\nfoo: 1\n---\nSee \`references/nope.md\`.\n`));
  assert.equal(errs.length, 4);
  assert.match(errs.join('\n'), /unknown frontmatter key foo/);
  assert.match(errs.join('\n'), /must equal the folder name/);
  assert.match(errs.join('\n'), /1025 chars/);
  assert.match(errs.join('\n'), /links missing references\/nope.md/);
});

test('cited rule IDs must exist', () => {
  const dir = skill('ids', '---\nname: ids\ndescription: D.\n---\nApply NAV-001 and NAV-999.\n');
  assert.deepEqual(checkSkill(dir, new Set(['NAV-001'])), ['skills/ids/SKILL.md: unknown rule NAV-999']);
});
