import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { harShapes, templatePath, mergeVarying, isIdLike } from './har-shapes.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(dir, 'fixtures', 'synthetic.har.json');
const har = JSON.parse(fs.readFileSync(fixture, 'utf8'));
const out = harShapes(har);
const text = JSON.stringify(out);
const ep = (method, p) => out.endpoints.find((e) => e.method === method && e.path === p);

test('no fake value from the fixture reaches the output', () => {
  const values = [
    'Acme', 'Fakeperson', 'Zed Fakename', 'Quill', 'jane.fake', 'example.com', 'example.org', 'example.net', '@',
    '1001', '1002', '9999', '#1001', '129.9', '555 0100', 'Leave at the blue door', 'Ring twice',
    'FAKE-SESSION-COOKIE', 'FAKE-BEARER-TOKEN', 'FAKE-QUERY-TOKEN', 'FAKE-ANALYTICS-UID', 'FAKETRACK123',
    'a1b2c3d4', 'Y3Vyc29y', 'zz-fake-shop', 'qq-other-shop', 'Zz Fake Shop', 'Europe/Rome', 'EUR', 'in_transit',
    '2026-01-02', '127.0.0.1', 'thirdparty', 'query GetShop', 'Bearer', 'Cookie',
  ];
  // "paid" is both an enum value and a field name, so only in_transit proves enum values are dropped.
  for (const v of values) assert.ok(!text.includes(v), `value leaked: ${v}`);
  // The fixture really contains them, so the check is meaningful.
  const raw = fs.readFileSync(fixture, 'utf8');
  for (const v of ['Acme Fakeperson', 'jane.fake@example.com', 'FAKE-QUERY-TOKEN-xx55', 'zz-fake-shop']) assert.ok(raw.includes(v));
});

test('ids, emails and varying slugs become {id}', () => {
  assert.equal(templatePath('/api/orders/1001'), '/api/orders/{id}');
  assert.equal(templatePath('/api/orders/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d/items'), '/api/orders/{id}/items');
  assert.equal(templatePath('/api/v2/settings/line1'), '/api/v2/settings/line1');
  assert.ok(ep('GET', '/api/orders/{id}'));
  assert.ok(ep('GET', '/api/customers/by-email/{id}'));
  assert.ok(ep('GET', '/api/stores/{id}/settings'));
  const m = mergeVarying(['/api/settings/general', '/api/settings/billing']);
  assert.equal(m.get('/api/settings/billing'), '/api/settings/billing', 'few last-segment names stay literal');
  assert.ok(!isIdLike('orders') && !isIdLike('shipping-methods') && isIdLike('ord_8f3k2j9x'));
});

test('endpoints: methods, query names, status codes, origin filter', () => {
  const list = ep('GET', '/api/orders');
  assert.deepEqual(list.query, ['page', 'q', 'token']);
  assert.deepEqual(ep('GET', '/api/orders/{id}').status, [200, 404]);
  assert.equal(ep('GET', '/api/orders/{id}').calls, 3);
  assert.ok(ep('PATCH', '/api/orders/{id}'));
  assert.deepEqual(out.skipped, { nonApi: 2, otherOrigin: 1, badUrl: 0 });
  assert.ok(!out.endpoints.some((e) => e.path.includes('collect') || e.path.includes('_next')));
  assert.equal(out.endpoints.find((e) => e.path === '/graphql').operation, 'GetShop');
});

test('shapes: types, formats, arrays collapsed, optional keys, maps, errors apart', () => {
  const item = ep('GET', '/api/orders').response.shape.data[0];
  assert.equal(item.id, 'integer');
  assert.equal(item.total, 'number');
  assert.equal(item.paid, 'boolean');
  assert.equal(item.created_at, 'string:date-time');
  assert.equal(item.ship_date, 'string:date');
  assert.equal(item.tracking_url, 'string:url');
  assert.equal(item.external_ref, 'string:uuid');
  assert.equal(item.customer.email, 'string:email');
  assert.equal(item.customer.name, 'string');
  assert.equal(item['note?'], 'string');
  assert.equal(item.status, 'string:enum(2)');
  const detail = ep('GET', '/api/orders/{id}');
  assert.equal(detail.response.shape.id, 'integer', 'a 404 body does not make success fields optional');
  assert.deepEqual(detail.error, { error: 'string' });
  assert.deepEqual(ep('GET', '/api/stats').response.shape, { by_customer: { '{key}': { orders: 'integer' } }, by_day: { '{key}': 'integer' } });
  assert.deepEqual(ep('PUT', '/api/settings/general').request.shape, { contact: 'string', timezone: 'string' });
  assert.equal(ep('GET', '/api/orders/{id}').response.contentType.length, 1, 'base64 body decoded, charset dropped');
});

test('--enum-labels keeps only label-like enum values', () => {
  const labelled = harShapes(har, { enumLabels: true });
  const item = labelled.endpoints.find((e) => e.path === '/api/orders').response.shape.data[0];
  assert.equal(item.status, 'string:enum(in_transit,paid)');
  const free = harShapes({ log: { entries: [1, 2].map(() => ({ request: { method: 'GET', url: 'http://127.0.0.1/api/x' }, response: { status: 200, content: { mimeType: 'application/json', text: '{"city":"Old Town"}' } } })).concat([{ request: { method: 'GET', url: 'http://127.0.0.1/api/x' }, response: { status: 200, content: { mimeType: 'application/json', text: '{"city":"New Town"}' } } }]) } }, { enumLabels: true });
  assert.equal(free.endpoints[0].response.shape.city, 'string:enum(2)');
});

test('slug keys, dotted query names and short slug segments are not written', () => {
  const mk = (u, b) => ({ request: { method: 'GET', url: `http://127.0.0.1${u}` }, response: { status: 200, content: { mimeType: 'application/json', text: JSON.stringify(b) } } });
  const o = harShapes({ log: { entries: [
    mk('/api/x?jane.doe=1&page[size]=2', { by_store: { 'zz-fake-shop': 1, 'qq-other-shop': 2 }, total: 3 }),
    mk('/api/reports/acme-q3', { a: 1 }),
  ] } });
  const t = JSON.stringify(o);
  for (const v of ['zz-fake-shop', 'qq-other-shop', 'jane.doe', 'acme-q3']) assert.ok(!t.includes(v), `value leaked: ${v}`);
  const x = o.endpoints.find((e) => e.path === '/api/x');
  assert.deepEqual(x.query, ['page[size]', '{key}']);
  assert.deepEqual(x.response.shape, { by_store: { '{key}': 'integer' }, total: 'integer' });
  assert.ok(o.endpoints.some((e) => e.path === '/api/reports/{id}'));
});

test('CLI writes JSON to stdout and rejects a non-HAR file', () => {
  const cli = path.join(dir, 'har-shapes.mjs');
  assert.deepEqual(JSON.parse(execFileSync('node', [cli, fixture], { encoding: 'utf8' })), out);
  assert.throws(() => execFileSync('node', [cli, path.join(dir, 'har-shapes.mjs')], { stdio: 'pipe' }));
});
