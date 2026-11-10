// Check the per-platform plugin manifests against .claude-plugin/plugin.json: same name, version and description; every ./path exists.
import fs from 'node:fs';
import path from 'node:path';

export const PLUGINS = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json', 'gemini-extension.json'];
export const MARKETPLACES = ['.claude-plugin/marketplace.json', '.cursor-plugin/marketplace.json', '.agents/plugins/marketplace.json'];

// Every string value that starts with ./ is a path relative to the repo root.
const paths = (v) => typeof v === 'string' ? (v.startsWith('./') ? [v] : [])
  : v && typeof v === 'object' ? Object.values(v).flatMap(paths) : [];

export function checkManifests(root) {
  const errors = [];
  const read = (rel) => {
    try { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); }
    catch (e) { errors.push(`${rel}: ${e.code === 'ENOENT' ? 'missing' : `not JSON (${e.message})`}`); return null; }
  };
  const ref = read(PLUGINS[0]);
  if (!ref) return errors;
  const same = (rel, field, got, want) => { if (got !== want) errors.push(`${rel}: ${field} "${got}" must equal "${want}" (${PLUGINS[0]})`); };
  const exist = (rel, m) => { for (const p of paths(m)) if (!fs.existsSync(path.join(root, p))) errors.push(`${rel}: path ${p} does not exist`); };

  for (const rel of PLUGINS.slice(1)) {
    const m = read(rel);
    if (!m) continue;
    for (const f of ['name', 'version', 'description']) same(rel, f, m[f], ref[f]);
    exist(rel, m);
  }
  const codex = read(PLUGINS[1])?.interface;
  if (codex) {
    for (const [f, max] of [['displayName', 30], ['shortDescription', 30], ['longDescription', 4000], ['developerName', 80]])
      if (typeof codex[f] !== 'string' || !codex[f] || codex[f].length > max) errors.push(`${PLUGINS[1]}: interface.${f} must be 1-${max} chars`);
    for (const f of ['category', 'logo', 'composerIcon']) if (!codex[f]) errors.push(`${PLUGINS[1]}: interface.${f} missing`);
    if (!Array.isArray(codex.capabilities)) errors.push(`${PLUGINS[1]}: interface.capabilities must be an array`);
    const prompts = [codex.defaultPrompt ?? []].flat();
    if (prompts.length > 3 || prompts.some((p) => p.length > 128)) errors.push(`${PLUGINS[1]}: interface.defaultPrompt max 3 prompts of 128 chars`);
  }
  for (const rel of MARKETPLACES) {
    const m = read(rel);
    if (!m) continue;
    same(rel, 'metadata.version', m.metadata?.version, ref.version);
    const entry = m.plugins?.find((p) => p.name === ref.name);
    if (!entry) { errors.push(`${rel}: no plugin entry named ${ref.name}`); continue; }
    same(rel, `plugins.${ref.name}.description`, entry.description, ref.description);
    // Codex docs: "Always include policy.installation, policy.authentication, and category on each plugin entry".
    if (rel.startsWith('.agents/') && !(entry.policy?.installation && entry.policy?.authentication && entry.category))
      errors.push(`${rel}: plugins.${ref.name} needs policy.installation, policy.authentication and category`);
    exist(rel, m);
  }
  return errors;
}
