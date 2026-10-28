// Lint skills/<name>/SKILL.md against the Agent Skills format and this repo's limits.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { AREAS } from './rules.mjs';

// Keys this repo uses; other tools ignore the Claude Code ones.
const KEYS = new Set(['name', 'description', 'license', 'metadata', 'allowed-tools', 'disable-model-invocation', 'user-invocable', 'argument-hint', 'context']);

export function checkSkill(dir, ids = null) {
  const name = path.basename(dir);
  const file = path.join(dir, 'SKILL.md');
  if (!fs.existsSync(file)) return [`skills/${name}: SKILL.md missing`];
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return [`skills/${name}: no frontmatter`];
  const errors = [];
  let fm;
  try { fm = YAML.parse(m[1]) ?? {}; } catch (e) { return [`skills/${name}: frontmatter is not YAML (${e.message})`]; }
  for (const k of Object.keys(fm)) if (!KEYS.has(k)) errors.push(`skills/${name}: unknown frontmatter key ${k}`);
  if (fm.name !== name) errors.push(`skills/${name}: name "${fm.name}" must equal the folder name`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > 64) errors.push(`skills/${name}: name must be lowercase-hyphenated, max 64`);
  if (typeof fm.description !== 'string' || !fm.description.trim()) errors.push(`skills/${name}: description missing`);
  else if (fm.description.length > 1024) errors.push(`skills/${name}: description ${fm.description.length} chars, max 1024`);
  const lines = text.split('\n').length;
  if (lines >= 500) errors.push(`skills/${name}: SKILL.md has ${lines} lines, max 499`);
  // Every backticked references/, scripts/ or assets/ path must exist inside the skill.
  for (const [, rel] of text.matchAll(/`((?:references|scripts|assets)\/[^`\s*]+)`/g))
    if (!fs.existsSync(path.join(dir, rel))) errors.push(`skills/${name}: links missing ${rel}`);
  // Hand-written files (generated ones carry the header) must cite existing rule IDs.
  if (ids) for (const f of handWritten(dir)) {
    for (const [id] of fs.readFileSync(f, 'utf8').matchAll(RULE_ID))
      if (!ids.has(id)) errors.push(`skills/${name}/${path.relative(dir, f)}: unknown rule ${id}`);
  }
  return errors;
}

const RULE_ID = new RegExp(`\\b(?:${Object.values(AREAS).join('|')})-\\d{3}\\b`, 'g');
const handWritten = (dir) => fs.readdirSync(dir, { recursive: true }).map((f) => path.join(dir, f))
  .filter((f) => f.endsWith('.md') && !fs.readFileSync(f, 'utf8').startsWith('<!-- Generated'));

export function checkSkills(root, ids = null) {
  const dir = path.join(root, 'skills');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).flatMap((e) => checkSkill(path.join(dir, e.name), ids));
}
