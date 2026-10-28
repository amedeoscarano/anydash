import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkProposal } from './check-proposal.mjs';
import { loadRules } from '../../../scripts/lib/rules.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const nav = loadRules(repo).rules.filter((r) => r.area === 'navigation');
const next = `NAV-${String(Math.max(...nav.map((r) => Number(r.id.slice(4)))) + 1).padStart(3, '0')}`;

const rule = (id, change, extra = '') => `
      - id: ${id}
        change: ${change}
        title: Pinned views in the sidebar
        rule: Let users pin a saved view of an index page as a sidebar sub-item.
        why: Frequent filtered lists become one click away.
        source: observed
        evidence:
          - {portal: shopify, status: absent, page_type: global}
          - {portal: dhl, status: absent, page_type: global}
          - {portal: cloudflare, status: absent, page_type: global}
        new_evidence:
          - {portal: newportal, status: observed, page_type: global, record: rec-004}
        confidence: low
        applies_when: Index pages with saved views.
        exceptions: Products with fewer than three saved views per user.
        do: Orders > Unfulfilled pinned under Orders.
        dont: Pinned views mixed into the top-level menu.
        check_static: Find saved-view code and the nav config; confirm pinned views render as sub-items.
        check_live: Pin a view, reload, confirm it shows under its parent item.${extra}`;
const doc = (rules) => `portal: newportal\ndate: 2026-10-28\nareas:\n  - area: navigation\n    prefix: NAV\n    rules:${rules}\n`;

test('valid add and modify pass', async () => {
  assert.deepEqual(await checkProposal(doc(rule(next, 'add') + rule('NAV-001', 'modify')), repo), []);
});

test('add reusing an existing or retired id fails', async () => {
  const errs = await checkProposal(doc(rule('NAV-002', 'add')), repo);
  assert.ok(errs.some((e) => e.includes('add needs an id above')), errs.join('\n'));
});

test('confidence above the evidence fails', async () => {
  const errs = await checkProposal(doc(rule(next, 'add').replace('confidence: low', 'confidence: high')), repo);
  assert.ok(errs.some((e) => e.includes('exceeds evidence')), errs.join('\n'));
});

test('missing new_evidence, unknown change and private data fail', async () => {
  const bad = rule('NAV-001', 'rewrite').replace(/\n *new_evidence:\n.*/, '') + '\n        notes: seen for ops@' + 'acme-shop.com';
  const errs = await checkProposal(doc(bad), repo);
  for (const m of ['change must be', 'new_evidence missing', 'private data']) assert.ok(errs.some((e) => e.includes(m)), `${m}\n${errs.join('\n')}`);
});
