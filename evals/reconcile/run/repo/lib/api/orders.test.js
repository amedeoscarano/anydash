import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ordersApi, ApiError } from './orders.js';
import { toOurs, toTheirs } from './orders-mapper.js';

// Synthetic fixtures only.
const full = { id: 7, number: 'ord_test_7', customer: 'Test Person', email: 'test@example.test', date: '2030-01-02T03:04:05.000Z',
  status: 'shipped', total: 1234, note: 'fake note', updatedAt: '2030-01-03T00:00:00.000Z', items: [], history: [] };

function fakeFetch(status, body) {
  const calls = [];
  const f = async (url, init) => { calls.push({ url, ...init }); return { ok: status < 400, status, json: async () => body }; };
  return { f, calls };
}

test('toOurs maps a full fixture with money and date transforms', () => {
  const o = toOurs(full);
  assert.equal(o.orderNumber, 'ord_test_7');
  assert.equal(o.customerEmail, 'test@example.test');
  assert.equal(o.totalAmount, 12.34);
  assert.equal(o.placedAt.toISOString(), full.date);
  assert.equal(o.version, full.updatedAt);
});

test('toOurs handles missing optional fields', () => {
  const o = toOurs({ id: 1, number: 'ord_test_1', status: 'pending', total: 0 });
  assert.equal(o.customerName, '');
  assert.equal(o.placedAt, null);
  assert.equal(o.note, '');
});

test('unknown enum value is kept as is', () => {
  const o = toOurs({ ...full, status: 'returned' });
  assert.equal(o.status, 'returned');
  assert.equal(o.statusKnown, false);
  assert.deepEqual(toTheirs({ ...o, note: 'x' }, o), { note: 'x' });
});

test('toTheirs sends only changed writable fields, never read-only ones', () => {
  const o = toOurs(full);
  assert.deepEqual(toTheirs({ ...o, status: 'delivered', totalAmount: 99, customerName: 'x' }, o), { status: 'delivered' });
  assert.deepEqual(toTheirs(o, o), {});
});

test('toTheirs refuses a status the API rejects', () => {
  const o = toOurs(full);
  assert.throws(() => toTheirs({ ...o, status: 'on_hold' }, o), /not accepted/);
});

test('adapter builds method, path, query and If-Match', async () => {
  const { f, calls } = fakeFetch(200, { orders: [], counts: {} });
  const api = ordersApi({ baseUrl: 'http://127.0.0.1:9', fetch: f });
  await api.listOrders({ status: 'pending', q: '', page: 2 });
  await api.getOrder(7);
  await api.patchOrder(7, { note: 'x' }, 'v1');
  assert.equal(calls[0].url, 'http://127.0.0.1:9/api/orders?status=pending&page=2');
  assert.equal(calls[1].method, 'GET');
  assert.equal(calls[1].url, 'http://127.0.0.1:9/api/orders/7');
  assert.equal(calls[2].method, 'PATCH');
  assert.equal(calls[2].headers['if-match'], 'v1');
  assert.equal(calls[2].body, '{"note":"x"}');
});

test('adapter raises a typed error on 4xx and 5xx', async () => {
  for (const status of [404, 422, 500]) {
    const api = ordersApi({ baseUrl: 'http://127.0.0.1:9', fetch: fakeFetch(status, { error: 'fake' }).f });
    await assert.rejects(api.getOrder(1), (e) => e instanceof ApiError && e.status === status);
  }
});

test('adapter needs a base URL from config or environment', () => {
  const saved = process.env.ORDERS_API_BASE_URL;
  delete process.env.ORDERS_API_BASE_URL;
  try { assert.throws(() => ordersApi(), /ORDERS_API_BASE_URL/); } finally { if (saved !== undefined) process.env.ORDERS_API_BASE_URL = saved; }
});
