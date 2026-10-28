// Load and check rules/source/*.yaml against the format in rules/README.md.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export const AREAS = {
  navigation: 'NAV', settings: 'SET', controls: 'CTL', 'save-model': 'SAV', 'help-text': 'HLP', layout: 'LAY',
  home: 'HOM', index: 'IDX', detail: 'DET', 'global-chrome': 'CHR', 'ai-assistant': 'AI', onboarding: 'ONB',
  integrations: 'INT', branding: 'BRD', states: 'STA', feedback: 'FDB', microcopy: 'MCP', visual: 'VIS',
};
export const PORTALS = ['shopify', 'dhl', 'cloudflare'];
const STATUS = new Set(['observed', 'documented', 'absent']);
const SOURCE = new Set(['observed', 'documented', 'inferred']);
const PAGE_TYPES = new Set(['home', 'index', 'detail', 'form', 'settings_index', 'settings_page', 'wizard', 'integration', 'branding', 'other', 'global']);
const RANK = { low: 0, medium: 1, high: 2 };
const REQUIRED = ['id', 'title', 'rule', 'why', 'source', 'evidence', 'confidence', 'applies_when', 'exceptions', 'do', 'dont', 'check_static', 'check_live'];
// Generic shapes that must never reach the public repo; exact private terms come from the gitignored .private-terms.
// Emails on RFC 2606 example domains are allowed in examples.
export const PRIVATE_PATTERNS = [/\b[0-9a-f]{32}\b/i, /[\w.+-]+@(?![\w.-]*\bexample\b)[\w-]+\.[a-z]{2,}/i];

// Highest confidence allowed: high = 3/3 or published guidance (source documented), medium = 2/3, low otherwise.
export function maxConfidence(evidence, source) {
  const supported = evidence.filter((e) => e.status !== 'absent');
  if (supported.length === 3 || (source === 'documented' && supported.length > 0)) return 'high';
  return supported.length === 2 ? 'medium' : 'low';
}

export function checkRuleFile(file, text) {
  const errors = [];
  const err = (m) => errors.push(`${path.basename(file)}: ${m}`);
  let doc;
  try { doc = YAML.parse(text); } catch (e) { return { errors: [`${path.basename(file)}: YAML parse error ${e.message}`], rules: [] }; }
  const area = path.basename(file, '.yaml');
  if (!(area in AREAS)) err(`unknown area file "${area}"`);
  if (doc?.area !== area) err(`area "${doc?.area}" does not match file name`);
  if (doc?.prefix !== AREAS[area]) err(`prefix "${doc?.prefix}" should be ${AREAS[area]}`);
  const rules = Array.isArray(doc?.rules) ? doc.rules : [];
  if (!rules.length) err('no rules');
  for (const r of rules) {
    const id = r?.id ?? '?';
    for (const k of REQUIRED) if (r?.[k] === undefined || r[k] === null || r[k] === '') err(`${id}: missing ${k}`);
    if (!new RegExp(`^${AREAS[area]}-\\d{3}$`).test(id)) err(`${id}: id must be ${AREAS[area]}-NNN`);
    if (r?.source && !SOURCE.has(r.source)) err(`${id}: bad source "${r.source}"`);
    if (!RANK.hasOwnProperty(r?.confidence)) err(`${id}: bad confidence "${r?.confidence}"`);
    const ev = Array.isArray(r?.evidence) ? r.evidence : [];
    const portals = ev.map((e) => e?.portal).sort();
    if (portals.join() !== [...PORTALS].sort().join()) err(`${id}: evidence must list each of ${PORTALS.join(', ')} once`);
    for (const e of ev) {
      if (!STATUS.has(e?.status)) err(`${id}: bad evidence status "${e?.status}"`);
      if (!PAGE_TYPES.has(e?.page_type)) err(`${id}: bad page_type "${e?.page_type}"`);
    }
    if (ev.length && RANK[r?.confidence] > RANK[maxConfidence(ev, r.source)]) err(`${id}: confidence ${r.confidence} exceeds evidence (max ${maxConfidence(ev, r.source)})`);
  }
  return { errors, rules: rules.map((r) => ({ ...r, area })) };
}

export function loadRules(root) {
  const dir = path.join(root, 'rules', 'source');
  const errors = [];
  const rules = [];
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    const res = checkRuleFile(path.join(dir, f), fs.readFileSync(path.join(dir, f), 'utf8'));
    errors.push(...res.errors);
    rules.push(...res.rules);
  }
  const seen = new Set();
  for (const r of rules) {
    if (seen.has(r.id)) errors.push(`duplicate id ${r.id}`);
    seen.add(r.id);
  }
  return { rules, errors };
}

export function scanPrivate(root, rel, extraTerms = []) {
  const hits = [];
  const scanFile = (full) => {
    fs.readFileSync(full, 'utf8').split('\n').forEach((line, i) => {
      if (PRIVATE_PATTERNS.some((re) => re.test(line)) || extraTerms.some((t) => line.toLowerCase().includes(t.toLowerCase())))
        hits.push(`${path.relative(root, full)}:${i + 1}`);
    });
  };
  const walk = (p) => {
    if (!fs.statSync(p).isDirectory()) return scanFile(p);
    for (const e of fs.readdirSync(p, { withFileTypes: true }))
      if (!['node_modules', '.git', '.next'].includes(e.name)) walk(path.join(p, e.name));
  };
  for (const r of rel) if (fs.existsSync(path.join(root, r))) walk(path.join(root, r));
  return hits;
}

export function frameworkRefs(root, ids) {
  const dir = path.join(root, 'rules', 'frameworks');
  const errors = [];
  if (!fs.existsSync(dir)) return errors;
  const prefixes = Object.values(AREAS).join('|');
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of text.matchAll(new RegExp(`\\b(?:${prefixes})-\\d{3}\\b`, 'g')))
      if (!ids.has(m[0])) errors.push(`frameworks/${f}: unknown rule ${m[0]}`);
  }
  return errors;
}
