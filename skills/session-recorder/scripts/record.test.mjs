import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedHost, isAllowedUrl, scrubUrl, scrubMessage, stripQuery, maskInput, parseSuccess, parseArgs, validateSteps } from './record.mjs';

test('host allow-list matches ownapp', () => {
  for (const h of ['localhost', '127.0.0.1', '[::1]', 'app.localhost', 'admin.acme.test']) assert.equal(isAllowedHost(h), true, h);
  for (const h of ['example.com', 'localhost.example.com', 'test', '127.0.0.2', '']) assert.equal(isAllowedHost(h), false, h);
  assert.equal(isAllowedHost('staging.acme.dev', 'staging.acme.dev'), true);
  assert.equal(isAllowedHost('x.staging.acme.dev', 'staging.acme.dev'), false);
  assert.equal(isAllowedUrl('http://127.0.0.1:3198/'), true);
  assert.equal(isAllowedUrl('file:///etc/passwd'), false);
});

test('scrubUrl drops values of sensitive params and credentials, keeps the rest', () => {
  const s = scrubUrl('https://user:pw@app.example.test/orders?page=2&api_key=abc&Session_ID=x&userEmail=a%40b.c&q=box#/x');
  assert.ok(!/abc|a%40b|Session_ID=x|user:pw@/.test(s), s);
  assert.match(s, /page=2/);
  assert.match(s, /q=box/);
  assert.match(s, /api_key=&/);
  assert.match(s, /#\/x$/);
  assert.equal(scrubUrl('http://localhost/cb#access_token=zzz&state=1'), 'http://localhost/cb#access_token=&state=1');
  assert.equal(scrubUrl('http://localhost/#/settings?token=zz'), 'http://localhost/#/settings?token=');
  assert.equal(scrubUrl('http://localhost/#/settings'), 'http://localhost/#/settings');
  assert.equal(scrubUrl('http://localhost/cb?code=c0de&auth=a&otp=1&page=3'), 'http://localhost/cb?code=&auth=&otp=&page=3');
});

test('scrubMessage scrubs URLs quoted in error text', () => {
  const m = scrubMessage('page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:9/x?token=abc&q=1\nCall log: ...');
  assert.equal(m, 'page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:9/x?token=&q=1');
});

test('stripQuery keeps host and path only', () => {
  assert.deepEqual(stripQuery('http://127.0.0.1:3198/api/rates?token=x#y'), { host: '127.0.0.1:3198', path: '/api/rates' });
});

test('maskInput never returns the value', () => {
  const m = maskInput('  Email\n address ', 'secret@example.com');
  assert.deepEqual(m, { field: 'Email address', length: 18 });
  assert.ok(!JSON.stringify(m).includes('secret'));
  assert.deepEqual(maskInput('', null), { field: '', length: 0 });
  // It is serialized into the page, so it must not depend on module scope.
  assert.deepEqual(new Function(`return (${maskInput})`)()('A', 'xy'), { field: 'A', length: 2 });
});

test('success condition parser', () => {
  assert.deepEqual(parseSuccess('url:/done'), { kind: 'url', value: '/done' });
  assert.deepEqual(parseSuccess(' [role=status] '), { kind: 'selector', value: '[role=status]' });
  assert.equal(parseSuccess('url:'), null);
  assert.equal(parseSuccess(''), null);
});

test('args: readonly disables script, outdir optional', () => {
  assert.match(parseArgs(['https://x.com', '--readonly', '--script', 's.json']).error, /disabled/);
  const o = parseArgs(['http://localhost:3000', '--success', 'url:/ok']);
  assert.equal(o.outdir, undefined);
  assert.equal(o.keepVideo, true);
  assert.match(parseArgs(['http://localhost', '--success', 'url:']).error, /bad --success/);
  assert.match(parseArgs([]).error, /usage/);
});

test('steps: ownapp interaction subset plus clickText and back', () => {
  assert.deepEqual(validateSteps([{ goto: '/' }, { click: { role: 'link', name: 'Settings' } }, { clickText: 'Weight' }, { back: true }, { fill: { label: 'Search', value: 'weight' } }, { press: 'Enter' }, { wait: 500 }]), []);
  assert.equal(validateSteps([{ snapshot: 'x' }]).length, 1);
  assert.equal(validateSteps([{ goto: '/', wait: 1 }]).length, 1);
  assert.deepEqual(validateSteps({}), ['steps.json must be a JSON array']);
});
