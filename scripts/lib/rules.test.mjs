import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRuleFile, maxConfidence, PRIVATE_PATTERNS } from './rules.mjs';

const ev = (s, d, c) => [
  { portal: 'shopify', status: s, page_type: 'settings_page' },
  { portal: 'dhl', status: d, page_type: 'settings_page' },
  { portal: 'cloudflare', status: c, page_type: 'settings_page' },
];
const rule = (over = {}) => ({
  id: 'CTL-001', title: 't', rule: 'Do x.', why: 'w', source: 'observed', evidence: ev('observed', 'observed', 'absent'),
  confidence: 'medium', applies_when: 'a', exceptions: 'none', do: 'd', dont: 'n', check_static: 's', check_live: 'l', ...over,
});
const file = (rules) => JSON.stringify({ area: 'controls', prefix: 'CTL', rules }); // JSON is valid YAML

test('maxConfidence follows the 3/3, 2/3, documented rule', () => {
  assert.equal(maxConfidence(ev('observed', 'observed', 'observed')), 'high');
  assert.equal(maxConfidence(ev('documented', 'absent', 'absent'), 'documented'), 'high');
  assert.equal(maxConfidence(ev('observed', 'absent', 'absent'), 'documented'), 'high');
  assert.equal(maxConfidence(ev('absent', 'absent', 'absent'), 'documented'), 'low');
  assert.equal(maxConfidence(ev('documented', 'absent', 'absent'), 'observed'), 'low');
  assert.equal(maxConfidence(ev('observed', 'observed', 'absent')), 'medium');
  assert.equal(maxConfidence(ev('observed', 'absent', 'absent')), 'low');
});

test('valid rule passes', () => assert.deepEqual(checkRuleFile('/x/controls.yaml', file([rule()])).errors, []));

test('overclaimed confidence fails', () => {
  const { errors } = checkRuleFile('/x/controls.yaml', file([rule({ confidence: 'high' })]));
  assert.match(errors.join(), /exceeds evidence/);
});

test('missing portal, bad id, missing field fail', () => {
  const r = rule({ id: 'NAV-1', evidence: ev('observed', 'observed', 'observed').slice(0, 2), check_live: '' });
  const msg = checkRuleFile('/x/controls.yaml', file([r])).errors.join('\n');
  assert.match(msg, /id must be CTL-NNN/);
  assert.match(msg, /each of shopify/);
  assert.match(msg, /missing check_live/);
});

test('private patterns allow example domains only', () => {
  assert.ok(!PRIVATE_PATTERNS.some((re) => re.test('From: Store <hello@brand.example>')));
  assert.ok(!PRIVATE_PATTERNS.some((re) => re.test('ops@example.com')));
  assert.ok(PRIVATE_PATTERNS.some((re) => re.test(['owner', 'realshop.it'].join('@'))));
  assert.ok(PRIVATE_PATTERNS.some((re) => re.test('id ' + '0123456789abcdef'.repeat(2))));
});

test('wrong prefix and unparsable YAML fail', () => {
  assert.match(checkRuleFile('/x/controls.yaml', JSON.stringify({ area: 'controls', prefix: 'NAV', rules: [rule()] })).errors.join(), /prefix/);
  assert.match(checkRuleFile('/x/controls.yaml', 'a: [').errors.join(), /YAML parse error/);
});
