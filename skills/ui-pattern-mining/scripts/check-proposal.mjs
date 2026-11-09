#!/usr/bin/env node
// Check dash-learn/proposed-rules.yaml against the rulebook format, from a checkout of this repo.
//   node check-proposal.mjs <proposed-rules.yaml> [repo-root]   (repo-root defaults to the current folder)
// Each block under `areas` must pass scripts/lib/rules.mjs checkRuleFile as if it were rules/source/<area>.yaml.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const CHANGES = new Set(['add', 'modify']);

export async function checkProposal(text, repo) {
  const lib = await import(pathToFileURL(path.join(repo, 'scripts/lib/rules.mjs')).href);
  const YAML = createRequire(path.join(repo, 'package.json'))('yaml');
  const { rules: existing } = lib.loadRules(repo);
  const known = new Set(existing.map((r) => r.id));
  const errors = [];
  for (const re of lib.PRIVATE_PATTERNS) if (re.test(text)) errors.push(`private data pattern ${re}`);
  let doc;
  try { doc = YAML.parse(text); } catch (e) { return [...errors, `YAML parse error ${e.message}`]; }
  if (!doc?.portal || typeof doc.portal !== 'string') errors.push('portal missing');
  if (lib.PORTALS.includes(doc?.portal)) errors.push(`portal "${doc.portal}" is already a reference portal`);
  if (!Array.isArray(doc?.areas) || !doc.areas.length) return [...errors, 'areas: list of {area, prefix, rules} missing'];
  for (const block of doc.areas) {
    const res = lib.checkRuleFile(`${block?.area}.yaml`, YAML.stringify(block));
    errors.push(...res.errors);
    const prefix = lib.AREAS[block?.area];
    const max = Math.max(0, ...existing.filter((r) => r.area === block?.area).map((r) => Number(r.id.slice(prefix.length + 1))));
    for (const r of res.rules) {
      if (!CHANGES.has(r.change)) errors.push(`${r.id}: change must be add or modify`);
      if (r.change === 'modify' && !known.has(r.id)) errors.push(`${r.id}: modify needs an existing id`);
      // IDs are never reused, so a new id must be above the highest one ever in the area (gaps are retired ids).
      if (r.change === 'add' && Number(r.id?.slice(prefix.length + 1)) <= max) errors.push(`${r.id}: add needs an id above ${prefix}-${String(max).padStart(3, '0')}`);
      const ne = Array.isArray(r.new_evidence) ? r.new_evidence : [];
      if (!ne.length) errors.push(`${r.id}: new_evidence missing`);
      for (const e of ne) {
        if (e?.portal !== doc.portal) errors.push(`${r.id}: new_evidence portal must be "${doc.portal}"`);
        if (!['observed', 'documented', 'absent'].includes(e?.status)) errors.push(`${r.id}: bad new_evidence status "${e?.status}"`);
        if (!e?.page_type) errors.push(`${r.id}: new_evidence page_type missing`);
      }
    }
  }
  return errors;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [file, repo = process.cwd()] = process.argv.slice(2);
  if (!file) { console.error('usage: check-proposal.mjs <proposed-rules.yaml> [repo-root]'); process.exit(2); }
  const errors = await checkProposal(fs.readFileSync(file, 'utf8'), path.resolve(repo));
  for (const e of errors) console.error(`ERROR ${e}`);
  console.log(errors.length ? `proposal: ${errors.length} error(s)` : 'proposal: ok');
  process.exit(errors.length ? 1 : 0);
}
