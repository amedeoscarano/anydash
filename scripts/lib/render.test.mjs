import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRulebook, renderSkillRules } from './render.mjs';

const r = (id, area, confidence) => ({
  id, area, confidence, title: `T ${id}`, rule: 'Do x.', why: 'w', source: 'observed',
  evidence: [{ portal: 'shopify', status: 'observed' }, { portal: 'dhl', status: 'absent' }, { portal: 'cloudflare', status: 'observed' }],
  applies_when: 'a', exceptions: 'none', do: 'd', dont: 'n', check_static: 's', check_live: 'l',
});
const rules = [r('NAV-001', 'navigation', 'high'), r('CTL-001', 'controls', 'low')];

test('rulebook is deterministic and counts confidence', () => {
  const a = renderRulebook(rules, ['navigation', 'controls', 'home']);
  assert.equal(a, renderRulebook(rules, ['navigation', 'controls', 'home']));
  assert.match(a, /2 rules: 1 high, 0 medium, 1 low/);
  assert.match(a, /### NAV-001 — T NAV-001/);
  assert.doesNotMatch(a, /## home/); // empty areas are skipped
});

test('skill rules include only the requested areas', () => {
  const s = renderSkillRules('control-selection', rules, ['controls']);
  assert.match(s, /\| CTL-001 \| T CTL-001 \| low \|/);
  assert.doesNotMatch(s, /NAV-001/);
});
