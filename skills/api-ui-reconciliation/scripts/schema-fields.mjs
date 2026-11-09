#!/usr/bin/env node
// Flatten an API description into one row per field, and diff it against our own field list.
// Usage:
//   node schema-fields.mjs flat <openapi.json|.yaml|api-surface.json> [--op "GET /orders/{id}"]
//   node schema-fields.mjs diff <theirs-fields.json> <ours-fields.json>
// A row: { op, dir: "query"|"request"|"response", path: "items[].sku", type, format?, enum?, enumCount?, required? }
// Our field list uses the same row shape (op and dir optional). Values are never read, only types and enum labels.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

export async function load(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (/\.ya?ml$/i.test(file)) {
    let YAML;
    try { YAML = (await import('yaml')).default; } catch { throw new Error('YAML input needs the "yaml" package; convert the file to JSON instead'); }
    return YAML.parse(text);
  }
  return JSON.parse(text);
}

// ---- OpenAPI 3 ----
function deref(doc, node, seen = new Set()) {
  if (!node || typeof node !== 'object' || !node.$ref) return node;
  if (seen.has(node.$ref)) return { type: 'object', circular: node.$ref };
  if (!node.$ref.startsWith('#/')) return { type: 'unknown', ref: node.$ref }; // shortcut: external $ref not followed, resolve by hand if a spec uses them
  seen.add(node.$ref);
  const target = node.$ref.slice(2).split('/').reduce((o, k) => o?.[k.replace(/~1/g, '/').replace(/~0/g, '~')], doc);
  return deref(doc, target, seen);
}

function walkSchema(doc, schema, prefix, base, rows, required = false, depth = 0) {
  const s = deref(doc, schema);
  if (!s || depth > 12) return;
  if (s.allOf) {
    const merged = { type: 'object', properties: {}, required: [] };
    for (const part of s.allOf.map((p) => deref(doc, p))) {
      Object.assign(merged.properties, part?.properties);
      merged.required.push(...(part?.required || []));
    }
    return walkSchema(doc, merged, prefix, base, rows, required, depth + 1);
  }
  const union = s.oneOf || s.anyOf;
  if (union) return walkSchema(doc, { ...deref(doc, union[0]), union: union.length }, prefix, base, rows, required, depth + 1);
  const type = s.type || (s.properties ? 'object' : s.items ? 'array' : 'unknown');
  if (type === 'object' && s.properties) {
    for (const [k, v] of Object.entries(s.properties))
      walkSchema(doc, v, prefix ? `${prefix}.${k}` : k, base, rows, (s.required || []).includes(k), depth + 1);
    return;
  }
  if (type === 'array') return walkSchema(doc, s.items, `${prefix}[]`, base, rows, required, depth + 1);
  const row = { ...base, path: prefix || '(body)', type: Array.isArray(type) ? type.filter((t) => t !== 'null').join('|') : type };
  if (s.format) row.format = s.format;
  if (s.enum) row.enum = s.enum.filter((e) => e !== null);
  if (s.nullable || (Array.isArray(type) && type.includes('null'))) row.nullable = true;
  if (s.union) row.union = s.union;
  row.required = required;
  rows.push(row);
}

function fromOpenApi(doc) {
  const rows = [];
  for (const [p, item] of Object.entries(doc.paths || {})) {
    for (const m of METHODS) {
      const op = item[m];
      if (!op) continue;
      const name = `${m.toUpperCase()} ${p}`;
      for (const prm of [...(item.parameters || []), ...(op.parameters || [])].map((x) => deref(doc, x)))
        if (prm?.in === 'query') walkSchema(doc, prm.schema || {}, prm.name, { op: name, dir: 'query' }, rows, !!prm.required);
      const reqBody = deref(doc, op.requestBody)?.content?.['application/json']?.schema;
      if (reqBody) walkSchema(doc, reqBody, '', { op: name, dir: 'request' }, rows);
      const ok = Object.keys(op.responses || {}).filter((c) => /^2/.test(c)).sort()[0];
      const resBody = ok && deref(doc, op.responses[ok])?.content?.['application/json']?.schema;
      if (resBody) walkSchema(doc, resBody, '', { op: name, dir: 'response' }, rows);
    }
  }
  return rows;
}

// ---- api-surface.json (value-free shapes from api-surface-capture) ----
// A leaf is a type string ("string", "string:email", "integer") or a node whose keys are all type metadata.
const LEAF_KEYS = new Set(['type', 'format', 'enum', 'enumCount', 'nullable', 'optional']);
const isLeafNode = (v) => v && typeof v === 'object' && !Array.isArray(v) && typeof v.type === 'string' && Object.keys(v).every((k) => LEAF_KEYS.has(k));

function walkShape(shape, prefix, base, rows) {
  if (typeof shape === 'string' || isLeafNode(shape)) {
    const node = typeof shape === 'string' ? { type: shape } : shape;
    const [type, fmt] = node.type.split(':');
    const optional = prefix.endsWith('?') || /\?(?=[.[])/.test(prefix);
    const row = { ...base, path: (prefix || '(body)').replace(/\?(?=$|[.[])/g, ''), type };
    // har-shapes.mjs writes enums as "string:enum(4)" (count) or "string:enum(paid,shipped)" (labels)
    const en = /^enum\((.*)\)$/.exec(fmt || '');
    if (en) { if (/^\d+$/.test(en[1])) row.enumCount = +en[1]; else row.enum = en[1].split(','); }
    else if (fmt || node.format) row.format = fmt || node.format;
    if (optional || node.optional) row.optional = true;
    if (node.enum) row.enum = node.enum;
    if (node.enumCount) row.enumCount = node.enumCount;
    if (node.nullable) row.nullable = true;
    rows.push(row);
  } else if (Array.isArray(shape)) {
    walkShape(shape[0] ?? 'unknown', `${prefix}[]`, base, rows);
  } else if (shape && typeof shape === 'object') {
    for (const [k, v] of Object.entries(shape)) walkShape(v, prefix ? `${prefix}.${k}` : k, base, rows);
  }
}

function fromSurface(doc) {
  const rows = [];
  // Reads the anydash-api-surface/1 format of ../api-surface-capture/scripts/har-shapes.mjs (and older guessed key names).
  const list = Array.isArray(doc) ? doc : doc.endpoints || doc.routes || [];
  for (const e of list) {
    const name = `${String(e.method || 'GET').toUpperCase()} ${e.path || e.pathTemplate || e.template}`;
    for (const q of e.query || e.queryParams || []) rows.push({ op: name, dir: 'query', path: typeof q === 'string' ? q : q.name, type: q.type || 'string' });
    // har-shapes.mjs wraps bodies as { contentType, shape }
    const body = (b) => (b && typeof b === 'object' && !Array.isArray(b) && 'shape' in b ? b.shape : b);
    const req = body(e.request ?? e.requestShape ?? e.requestBody);
    if (req !== undefined && req !== null) walkShape(req, '', { op: name, dir: 'request' }, rows);
    let res = body(e.response ?? e.responseShape ?? e.responseBody);
    if (res === undefined && e.responses) res = body(e.responses[Object.keys(e.responses).filter((c) => /^2/.test(c)).sort()[0]]);
    if (res !== undefined && res !== null) walkShape(res, '', { op: name, dir: 'response' }, rows);
  }
  return rows;
}

export function flatten(doc) {
  if (doc.openapi || doc.swagger) {
    if (doc.swagger) throw new Error('Swagger 2 is not supported; convert to OpenAPI 3 first');
    return fromOpenApi(doc);
  }
  return fromSurface(doc);
}

// Match names across naming styles: created_at = createdAt = CreatedAt.
export const norm = (p) => p.toLowerCase().replace(/[_-]/g, '');

export function diff(theirs, ours) {
  const key = (r) => norm(r.path);
  const ourMap = new Map(ours.map((r) => [key(r), r]));
  const theirMap = new Map(theirs.map((r) => [key(r), r]));
  const out = { matched: [], onlyTheirs: [], onlyOurs: [], typeConflicts: [], enumConflicts: [] };
  for (const [k, t] of theirMap) {
    const o = ourMap.get(k);
    if (!o) { out.onlyTheirs.push(t.path); continue; }
    out.matched.push({ theirs: t.path, ours: o.path });
    if (t.type !== o.type) out.typeConflicts.push({ field: t.path, theirs: t.type, ours: o.type });
    if (t.enum && o.enum) {
      const missing = t.enum.filter((v) => !o.enum.includes(v));
      const extra = o.enum.filter((v) => !t.enum.includes(v));
      if (missing.length || extra.length) out.enumConflicts.push({ field: t.path, missingInOurs: missing, notInTheirs: extra });
    } else if (t.enum || o.enum || t.enumCount) {
      out.enumConflicts.push({ field: t.path, note: t.enum || t.enumCount ? 'their side is an enum, ours is open' : 'our side is an enum, theirs is open' });
    }
  }
  for (const [k, o] of ourMap) if (!theirMap.has(k)) out.onlyOurs.push(o.path);
  return out;
}

async function main([cmd, a, b, ...rest]) {
  if (cmd === 'flat' && a) {
    const i = [b, ...rest].indexOf('--op');
    const only = i >= 0 ? [b, ...rest][i + 1] : null;
    const rows = flatten(await load(a)).filter((r) => !only || r.op === only);
    process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
  } else if (cmd === 'diff' && a && b) {
    process.stdout.write(JSON.stringify(diff(await load(a), await load(b)), null, 2) + '\n');
  } else {
    console.error('usage: schema-fields.mjs flat <file> [--op "GET /path"] | diff <theirs.json> <ours.json>');
    process.exit(2);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
