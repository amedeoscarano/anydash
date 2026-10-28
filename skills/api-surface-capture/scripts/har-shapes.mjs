#!/usr/bin/env node
// Reduce a HAR to an API surface: endpoints and JSON shapes with types only, never values.
// Usage: node har-shapes.mjs <file.har> [--origin <origin>] [--enum-labels] > api-surface.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/;
const URL_RE = /^(https?:\/\/|\/\/)\S+$/i;
// Label-like enum value: lowercase token such as "paid" or "in_transit". Anything else is treated as possible user data.
const LABEL = /^[a-z][a-z0-9]*([_-][a-z0-9]+)*$/;
const ENUM_MAX = 8;
const ENUM_LEN = 24;

// A path segment or object key that carries an identifier or user data instead of a name.
export function isIdLike(s) {
  return /^\d+$/.test(s) || UUID.test(s) || EMAIL.test(s) || DATE.test(s) || /^[0-9a-f]{12,}$/i.test(s)
    || (s.length >= 5 && /\d/.test(s) && /[a-z]/i.test(s) && !/^[a-z]+\d{1,2}$/i.test(s))
    || /^[A-Za-z0-9+/=_-]{20,}$/.test(s);
}

export function stringFormat(s) {
  if (UUID.test(s)) return 'string:uuid';
  if (EMAIL.test(s)) return 'string:email';
  if (DATETIME.test(s)) return 'string:date-time';
  if (DATE.test(s)) return 'string:date';
  if (URL_RE.test(s)) return 'string:url';
  return null;
}

export function templatePath(pathname) {
  return pathname.split('/').map((seg) => (seg && isIdLike(decodeURIComponent(seg)) ? '{id}' : seg)).join('/');
}

// Second pass: a segment that varies between otherwise equal paths is a parameter when more segments
// follow it (/stores/acme/orders) or when it takes 8+ values. shortcut: a last-segment slug with fewer
// than 8 values stays literal; review the output for names before sharing it.
export function mergeVarying(paths) {
  const out = new Map(paths.map((p) => [p, p]));
  const groups = new Map();
  for (const p of paths) {
    const segs = p.split('/');
    segs.forEach((_, i) => {
      if (segs[i] === '{id}' || !segs[i]) return;
      const key = `${segs.length}|${i}|${segs.map((s, j) => (j === i ? '*' : s)).join('/')}`;
      if (!groups.has(key)) groups.set(key, new Set());
      groups.get(key).add(p);
    });
  }
  for (const [key, set] of groups) {
    const [len, i] = key.split('|').map(Number);
    if (set.size < 2 || (i === len - 1 && set.size < ENUM_MAX)) continue;
    for (const p of set) { const segs = out.get(p).split('/'); segs[i] = '{id}'; out.set(p, segs.join('/')); }
  }
  return out;
}

// A JSON key or query name that reads as a developer-chosen name. Dots, dashes and spaces suggest a value
// (store slug, email local part, person name), so such keys are collapsed. shortcut: a single plain word used
// as a key (a store called "acme") still passes; the manual review in SKILL.md step 5 catches it.
export const isNameLike = (k) => /^[A-Za-z_$][\w$]*(\[[\w$]*\])*$/.test(k) && !isIdLike(k);

// Shape node: { types:Set, n, obj?:Map<key,node>, keyN?:Map<key,count>, objN, arr?:node, strings?:Map<value,count> }
const node = () => ({ types: new Set(), n: 0 });

function add(nd, v) {
  nd.n++;
  if (v === null) return nd.types.add('null');
  if (Array.isArray(v)) {
    nd.types.add('array');
    nd.arr ??= node();
    for (const x of v) add(nd.arr, x);
    return;
  }
  if (typeof v === 'object') {
    nd.types.add('object');
    nd.obj ??= new Map(); nd.keyN ??= new Map(); nd.objN = (nd.objN || 0) + 1;
    const keys = Object.keys(v);
    // An object keyed by ids or emails is a map: collapse its keys so none is written.
    const isMap = keys.some((k) => !isNameLike(k));
    for (const k of keys) {
      const name = isMap ? '{key}' : k;
      if (!nd.obj.has(name)) nd.obj.set(name, node());
      add(nd.obj.get(name), v[k]);
    }
    for (const k of new Set(keys.map((k) => (isMap ? '{key}' : k)))) nd.keyN.set(k, (nd.keyN.get(k) || 0) + 1);
    return;
  }
  if (typeof v === 'number') return nd.types.add(Number.isInteger(v) ? 'integer' : 'number');
  if (typeof v === 'boolean') return nd.types.add('boolean');
  const fmt = stringFormat(v);
  if (fmt) return nd.types.add(fmt);
  nd.types.add('string');
  nd.strings ??= new Map();
  if (nd.strings.size <= ENUM_MAX) nd.strings.set(v, (nd.strings.get(v) || 0) + 1);
}

// Render a node as plain JSON: objects stay objects (optional keys end in "?"), arrays become [shape],
// leaves become a type string such as "string:email" or "integer|null".
function render(nd, opts) {
  const parts = [];
  for (const t of [...nd.types].sort()) {
    if (t === 'object' || t === 'array') continue;
    if (t === 'string' && nd.strings) {
      const vals = [...nd.strings.keys()];
      const seen = [...nd.strings.values()].reduce((a, b) => a + b, 0);
      // Enum candidate: few distinct short values that repeat. One-off strings are free text.
      if (vals.length >= 2 && vals.length < ENUM_MAX && seen > vals.length && vals.every((s) => s.length <= ENUM_LEN)) {
        parts.push(opts.enumLabels && vals.every((s) => LABEL.test(s)) ? `string:enum(${vals.sort().join(',')})` : `string:enum(${vals.length})`);
        continue;
      }
    }
    parts.push(t);
  }
  // integer and number together read as number.
  const leaf = (parts.includes('number') ? parts.filter((t) => t !== 'integer') : parts).join('|');
  let structured;
  if (nd.types.has('object')) {
    structured = {};
    for (const k of [...nd.obj.keys()].sort()) {
      const optional = nd.keyN.get(k) < nd.objN;
      structured[optional ? `${k}?` : k] = render(nd.obj.get(k), opts);
    }
  } else if (nd.types.has('array')) {
    structured = nd.arr.n ? [render(nd.arr, opts)] : [];
  }
  if (structured === undefined) return leaf || 'unknown';
  // Mixed object/array with primitives (rare): keep both.
  return leaf ? { oneOf: [leaf, structured] } : structured;
}

function bodyText(content) {
  if (!content?.text) return null;
  return content.encoding === 'base64' ? Buffer.from(content.text, 'base64').toString('utf8') : content.text;
}

function parseJson(text, mime) {
  if (text == null) return undefined;
  if (mime && !/json/i.test(mime) && !/^\s*[[{]/.test(text)) return undefined;
  try { return JSON.parse(text); } catch { return undefined; }
}

export function harShapes(har, opts = {}) {
  const entries = har?.log?.entries;
  if (!Array.isArray(entries)) throw new Error('not a HAR file: log.entries missing');
  const isApi = (e) => {
    const mime = e.response?.content?.mimeType || '';
    const rt = e._resourceType;
    return /json/i.test(mime) || /json/i.test(e.request?.postData?.mimeType || '') || rt === 'xhr' || rt === 'fetch';
  };
  const parsed = [];
  const skipped = { nonApi: 0, otherOrigin: 0, badUrl: 0 };
  let origin = opts.origin;
  if (!origin) {
    // Default origin: the first page's URL, else the most frequent origin among API calls.
    try { origin = new URL(har.log.pages?.[0]?.title).origin; } catch { origin = null; }
    if (!origin) {
      const count = new Map();
      for (const e of entries) if (isApi(e)) { try { const o = new URL(e.request.url).origin; count.set(o, (count.get(o) || 0) + 1); } catch {} }
      origin = [...count].sort((a, b) => b[1] - a[1])[0]?.[0];
    }
  }
  for (const e of entries) {
    let u;
    try { u = new URL(e.request.url); } catch { skipped.badUrl++; continue; }
    if (!isApi(e)) { skipped.nonApi++; continue; }
    if (origin && u.origin !== origin) { skipped.otherOrigin++; continue; }
    parsed.push({ e, u, tpl: templatePath(u.pathname) });
  }
  const merged = mergeVarying([...new Set(parsed.map((p) => p.tpl))]);
  const eps = new Map();
  for (const { e, u, tpl } of parsed) {
    const reqMime = e.request.postData?.mimeType || '';
    const reqText = e.request.postData?.text;
    let reqBody = parseJson(reqText, reqMime);
    if (reqBody === undefined && /x-www-form-urlencoded/i.test(reqMime) && reqText)
      reqBody = Object.fromEntries([...new URLSearchParams(reqText).keys()].map((k) => [k, '']));
    // GraphQL operation names are chosen by the developer, not the user, so they are kept.
    const operation = reqBody && typeof reqBody.operationName === 'string' && LABEL.test(reqBody.operationName.toLowerCase()) ? reqBody.operationName : undefined;
    const method = e.request.method.toUpperCase();
    const p = merged.get(tpl);
    const key = `${method} ${p}${operation ? ` ${operation}` : ''}`;
    if (!eps.has(key)) eps.set(key, { method, path: p, operation, count: 0, query: new Set(), status: new Set(), req: node(), res: node(), err: node(), reqTypes: new Set(), resTypes: new Set() });
    const ep = eps.get(key);
    ep.count++;
    for (const k of u.searchParams.keys()) ep.query.add(isNameLike(k) ? k : '{key}');
    if (e.response?.status) ep.status.add(e.response.status);
    if (reqMime) ep.reqTypes.add(reqMime.split(';')[0].trim());
    const resMime = e.response?.content?.mimeType || '';
    if (resMime) ep.resTypes.add(resMime.split(';')[0].trim());
    if (reqBody !== undefined) add(ep.req, reqBody);
    const resBody = parseJson(bodyText(e.response?.content), resMime);
    // Error bodies (status >= 400) get their own shape so they do not make every success field optional.
    if (resBody !== undefined) add(e.response.status >= 400 ? ep.err : ep.res, resBody);
  }
  const endpoints = [...eps.values()]
    .sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method) || (a.operation || '').localeCompare(b.operation || ''))
    .map((ep) => ({
      method: ep.method,
      path: ep.path,
      ...(ep.operation ? { operation: ep.operation } : {}),
      calls: ep.count,
      query: [...ep.query].sort(),
      status: [...ep.status].sort((a, b) => a - b),
      request: ep.req.n ? { contentType: [...ep.reqTypes].sort(), shape: render(ep.req, opts) } : null,
      response: ep.res.n ? { contentType: [...ep.resTypes].sort(), shape: render(ep.res, opts) } : (ep.resTypes.size ? { contentType: [...ep.resTypes].sort(), shape: null } : null),
      error: ep.err.n ? render(ep.err, opts) : null,
    }));
  // The origin itself is never written: it can name a tenant.
  return { format: 'anydash-api-surface/1', source: 'har', entries: entries.length, skipped, endpoints };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const file = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--origin');
  if (!file) { console.error('usage: node har-shapes.mjs <file.har> [--origin <origin>] [--enum-labels] > api-surface.json'); process.exit(2); }
  const oi = args.indexOf('--origin');
  try {
    const har = JSON.parse(fs.readFileSync(file, 'utf8'));
    const out = harShapes(har, { origin: oi >= 0 ? args[oi + 1] : undefined, enumLabels: args.includes('--enum-labels') });
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  } catch (err) { console.error(`har-shapes: ${err.message}`); process.exit(1); }
}
