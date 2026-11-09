import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flatten, diff } from './schema-fields.mjs';

// Synthetic OpenAPI: a shipment resource with a $ref, allOf, an enum and a query param.
const openapi = {
  openapi: '3.0.3',
  paths: {
    '/shipments/{id}': {
      get: { responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Shipment' } } } } } },
      patch: {
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { service_level: { $ref: '#/components/schemas/Level' } } } } } },
        responses: { 204: { description: 'ok' } },
      },
    },
    '/shipments': {
      get: {
        parameters: [{ in: 'query', name: 'status', schema: { type: 'string', enum: ['open', 'shipped'] } }, { in: 'path', name: 'x', schema: { type: 'string' } }],
        responses: { 200: { content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Shipment' } } } } } },
      },
    },
  },
  components: {
    schemas: {
      Level: { type: 'string', enum: ['standard', 'express', 'economy'] },
      Base: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      Shipment: {
        allOf: [
          { $ref: '#/components/schemas/Base' },
          { type: 'object', properties: { weight_kg: { type: 'number' }, service_level: { $ref: '#/components/schemas/Level' }, tags: { type: 'array', items: { type: 'string' } } } },
        ],
      },
    },
  },
};

test('flattens OpenAPI paths, refs, allOf, arrays, enums and query params', () => {
  const rows = flatten(openapi);
  const one = rows.filter((r) => r.op === 'GET /shipments/{id}');
  assert.deepEqual(one.map((r) => r.path), ['id', 'weight_kg', 'service_level', 'tags[]']);
  assert.equal(one[0].format, 'uuid');
  assert.equal(one[0].required, true);
  assert.deepEqual(one[2].enum, ['standard', 'express', 'economy']);
  assert.ok(rows.some((r) => r.op === 'PATCH /shipments/{id}' && r.dir === 'request' && r.path === 'service_level'));
  assert.ok(rows.some((r) => r.op === 'GET /shipments' && r.dir === 'query' && r.path === 'status'));
  assert.ok(!rows.some((r) => r.path === 'x'), 'path params are not fields');
  assert.ok(rows.some((r) => r.op === 'GET /shipments' && r.path === '[].weight_kg'));
});

test('flattens a value-free api-surface shape', () => {
  const surface = { endpoints: [{ method: 'get', path: '/api/orders/{id}', query: ['expand'], response: { id: 'string:uuid', email: 'string:email', status: { type: 'string', enumCount: 4 }, items: [{ sku: 'string', qty: 'integer' }] } }] };
  const rows = flatten(surface);
  assert.deepEqual(rows.map((r) => `${r.dir}:${r.path}:${r.type}`), ['query:expand:string', 'response:id:string', 'response:email:string', 'response:status:string', 'response:items[].sku:string', 'response:items[].qty:integer']);
  assert.equal(rows[2].format, 'email');
  assert.equal(rows[3].enumCount, 4);
});

test('diff matches across naming styles and reports gaps and conflicts', () => {
  const theirs = flatten(openapi).filter((r) => r.op === 'GET /shipments/{id}');
  const ours = [
    { path: 'id', type: 'string' },
    { path: 'weightKg', type: 'string' },
    { path: 'serviceLevel', type: 'string', enum: ['standard', 'express', 'same_day'] },
    { path: 'notes', type: 'string' },
  ];
  const d = diff(theirs, ours);
  assert.equal(d.matched.length, 3);
  assert.deepEqual(d.onlyTheirs, ['tags[]']);
  assert.deepEqual(d.onlyOurs, ['notes']);
  assert.deepEqual(d.typeConflicts, [{ field: 'weight_kg', theirs: 'number', ours: 'string' }]);
  assert.deepEqual(d.enumConflicts, [{ field: 'service_level', missingInOurs: ['economy'], notInTheirs: ['same_day'] }]);
});

test('reads the real har-shapes.mjs format: {contentType, shape} bodies, enum(n), enum(labels), optional keys', () => {
  const surface = { format: 'anydash-api-surface/1', endpoints: [{ method: 'GET', path: '/api/orders/{id}', query: [], request: null,
    response: { contentType: ['application/json'], shape: { id: 'integer', status: 'string:enum(4)', kind: 'string:enum(paid,refund)', 'note?': 'string', 'lines?': [{ sku: 'string' }] } },
    error: { error: 'string' } }] };
  const rows = flatten(surface);
  assert.deepEqual(rows.map((r) => r.path), ['id', 'status', 'kind', 'note', 'lines[].sku']);
  assert.equal(rows[1].enumCount, 4);
  assert.equal(rows[1].format, undefined);
  assert.deepEqual(rows[2].enum, ['paid', 'refund']);
  assert.equal(rows[3].optional, true);
  assert.equal(rows[4].optional, true);
  assert.equal(rows[0].optional, undefined);
});
