import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedHost, isAllowedUrl, validateStep, validateSteps, parseViewport, STEP_TYPES } from './ownapp.mjs';

test('local and test hosts are allowed', () => {
  for (const h of ['localhost', '127.0.0.1', '[::1]', 'app.localhost', 'admin.acme.test', 'LOCALHOST'])
    assert.equal(isAllowedHost(h), true, h);
  assert.equal(isAllowedUrl('http://127.0.0.1:3100/orders'), true);
  assert.equal(isAllowedUrl('http://[::1]:3000/'), true);
});

test('production and look-alike hosts are refused', () => {
  for (const h of ['example.com', 'localhost.example.com', 'test', 'mytest', '127.0.0.2', 'admin.shopify.com', ''])
    assert.equal(isAllowedHost(h), false, h);
  assert.equal(isAllowedUrl('https://example.com'), false);
  assert.equal(isAllowedUrl('file:///etc/passwd'), false);
  assert.equal(isAllowedUrl('not a url'), false);
});

test('DASH_ALLOW_HOST allows exactly one named host', () => {
  assert.equal(isAllowedHost('staging.acme.dev', 'staging.acme.dev'), true);
  assert.equal(isAllowedHost('acme.dev', 'staging.acme.dev'), false);
  assert.equal(isAllowedHost('x.staging.acme.dev', 'staging.acme.dev'), false);
});

test('viewport parsing', () => {
  assert.deepEqual(parseViewport('1440x900'), { width: 1440, height: 900 });
  assert.equal(parseViewport('1440'), null);
  assert.equal(parseViewport('wide'), null);
});

test('every documented step type validates', () => {
  const good = [
    { goto: '/orders' }, { viewport: '390x844' }, { click: { role: 'button', name: 'Save' } },
    { fill: { label: 'Name', value: '' } }, { check: { label: 'Archive fulfilled orders' } }, { press: 'Tab' },
    { wait: 500 }, { snapshot: 'orders' }, { screenshot: 'orders-1440' },
    { styles: { selector: 'button', props: ['color', 'padding-top'] } }, { focused: true }, { block: '**/api/**' },
    { unblock: true }, { exists: { role: 'button', name: 'Save' } }, { text: 'h1' }, { responsive: 'orders' },
  ];
  assert.equal(good.length, Object.keys(STEP_TYPES).length);
  for (const s of good) assert.equal(validateStep(s), null, JSON.stringify(s));
  assert.deepEqual(validateSteps(good), []);
});

test('bad steps are rejected with a reason', () => {
  for (const s of [null, [], {}, { goto: '/a', wait: 1 }, { hover: 'x' }, { wait: -1 }, { wait: '5' },
    { click: { role: 'button' } }, { fill: { label: 'Name' } }, { snapshot: '../escape' }, { screenshot: 'a/b' },
    { styles: { selector: 'a', props: [] } }, { focused: 1 }, { viewport: 'big' }])
    assert.ok(validateStep(s), JSON.stringify(s));
  assert.deepEqual(validateSteps({}), ['steps.json must be a JSON array']);
  assert.match(validateSteps([{ wait: 1 }, { nope: 1 }])[0], /^step 1: unknown step "nope"/);
});
