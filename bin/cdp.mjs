#!/usr/bin/env node
// Read-only driver for the dedicated research Chrome (CDP on 127.0.0.1 only).
// Every command addresses one tab by CDP target id, so parallel agents never share an "active tab".
//
//   bin/cdp.mjs list
//   bin/cdp.mjs info       <target>
//   bin/cdp.mjs snapshot   <target> [out.yaml]        ARIA snapshot (roles + names)
//   bin/cdp.mjs screenshot <target> <out.png>         viewport only
//   bin/cdp.mjs goto       <target> <url>             same-origin only, rate limited
//   bin/cdp.mjs click      <target> <role> <name...>  guarded by safe-click
//   bin/cdp.mjs key        <target> Escape
//   bin/cdp.mjs viewport   <target> <W>x<H>
//   bin/cdp.mjs responsive <target> <prefix> [--no-png]   ARIA + PNG at 1440/1024/768/390
//   bin/cdp.mjs ask        <target> <composer name> <out.yaml> <question?>   AI panel only, lead use
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { check } from './safe-click.mjs';

const ENDPOINT = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9333';
const RATE_DIR = path.join(os.homedir(), 'dash-research', '.rate');
const MIN_GAP_MS = 5000;

if (!/^https?:\/\/127\.0\.0\.1:\d+$/.test(ENDPOINT)) die('CDP_ENDPOINT must be http://127.0.0.1:<port>');

function die(msg) { console.error(msg); process.exit(1); }

// shortcut: rate limit is a file timestamp per tab; fine for a handful of agents, not for concurrency races.
async function pace(target) {
  fs.mkdirSync(RATE_DIR, { recursive: true });
  const f = path.join(RATE_DIR, target);
  const last = fs.existsSync(f) ? Number(fs.readFileSync(f, 'utf8')) : 0;
  const wait = last + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  fs.writeFileSync(f, String(Date.now()));
}

async function pageFor(browser, target) {
  for (const ctx of browser.contexts()) {
    for (const p of ctx.pages()) {
      const s = await ctx.newCDPSession(p);
      const { targetInfo } = await s.send('Target.getTargetInfo');
      await s.detach();
      if (targetInfo.targetId === target) return p;
    }
  }
  die(`target ${target} not found`);
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

const [cmd, target, ...args] = process.argv.slice(2);
if (!cmd) die('usage: see header of bin/cdp.mjs');

// An agent that owns one tab sets DASH_TARGET, so a shared helper script can never drive another agent's tab.
if (process.env.DASH_TARGET && cmd !== 'list' && target !== process.env.DASH_TARGET) die(`target ${target} is not DASH_TARGET`);

const browser = await chromium.connectOverCDP(ENDPOINT);
try {
  if (cmd === 'list') {
    for (const ctx of browser.contexts()) for (const p of ctx.pages()) {
      const s = await ctx.newCDPSession(p);
      const { targetInfo } = await s.send('Target.getTargetInfo');
      await s.detach();
      console.log(`${targetInfo.targetId}\t${await p.title()}\t${p.url()}`);
    }
  } else {
    const page = await pageFor(browser, target);
    // Never accept a native alert/confirm: dismissing is the only safe default on production accounts.
    page.on('dialog', (d) => { console.error(`dialog dismissed: ${d.type()} "${d.message()}"`); d.dismiss().catch(() => {}); });

    if (cmd === 'info') {
      console.log(JSON.stringify({ title: await page.title(), url: page.url() }));
    } else if (cmd === 'snapshot') {
      const yaml = await page.locator('body').ariaSnapshot({ timeout: 15000 });
      if (args[0]) fs.writeFileSync(args[0], yaml); else console.log(yaml);
    } else if (cmd === 'screenshot') {
      if (!args[0]) die('screenshot needs an output path');
      await page.screenshot({ path: args[0] });
    } else if (cmd === 'goto') {
      const to = new URL(args[0]);
      if (to.origin !== new URL(page.url()).origin) die(`refusing cross-origin goto ${to.origin}`);
      if (/log-?out|sign-?out|delete|remove|cancel|unsubscribe/i.test(to.pathname)) die(`refusing unsafe path ${to.pathname}`);
      await pace(target);
      await page.goto(to.href);
      await settle(page);
      console.log(JSON.stringify({ title: await page.title(), url: page.url() }));
    } else if (cmd === 'click') {
      const [role, ...nameParts] = args;
      const name = nameParts.join(' ');
      const verdict = check(role, name);
      if (!verdict.ok) die(`DENY ${role} "${name}": ${verdict.reason}`);
      const loc = page.getByRole(role, { name, exact: true });
      const n = await loc.count();
      if (n !== 1) die(`expected 1 ${role} "${name}", found ${n}`);
      await pace(target);
      await loc.click();
      await settle(page);
      console.log(JSON.stringify({ title: await page.title(), url: page.url() }));
    } else if (cmd === 'key') {
      if (args[0] !== 'Escape') die('only Escape is allowed');
      await page.keyboard.press('Escape');
    } else if (cmd === 'ask') {
      // The one typing exception besides global search: an informational question to the portal's AI panel.
      const [box, outPath, ...q] = args;
      const text = q.join(' ');
      if (!/sidekick|ask|ai\b|cloudy|tag a resource|prompt|chat|message/i.test(box || '')) die(`"${box}" is not an AI composer`);
      if (!/\?$/.test(text)) die('a question must end with "?"');
      const loc = page.getByRole('textbox', { name: box, exact: true });
      if ((await loc.count()) !== 1) die(`expected 1 textbox "${box}"`);
      await pace(target);
      await loc.fill(text);
      await loc.press('Enter');
      await page.waitForTimeout(30000);
      fs.writeFileSync(outPath, await page.locator('body').ariaSnapshot({ timeout: 15000 }));
      console.log(`answer snapshot written to ${outPath}`);
    } else if (cmd === 'responsive') {
      // Emulation dies with the CDP connection, so all widths run in this one process.
      const prefix = args[0];
      if (!prefix) die('responsive needs an output prefix');
      const shots = args.includes('--no-png') ? false : true;
      for (const w of [1440, 1024, 768, 390]) {
        await page.setViewportSize({ width: w, height: w === 390 ? 844 : 900 });
        await settle(page);
        fs.writeFileSync(`${prefix}-${w}.aria.yaml`, await page.locator('body').ariaSnapshot({ timeout: 15000 }));
        if (shots) await page.screenshot({ path: `${prefix}-${w}.png` });
      }
      const s = await page.context().newCDPSession(page);
      await s.send('Emulation.clearDeviceMetricsOverride');
      await s.detach();
      console.log(`wrote ${prefix}-{1440,1024,768,390}`);
    } else if (cmd === 'viewport') {
      const [w, h] = (args[0] || '').split('x').map(Number);
      if (!w || !h) die('viewport needs WxH');
      await page.setViewportSize({ width: w, height: h });
      await settle(page);
    } else die(`unknown command ${cmd}`);
  }
} finally {
  // Detach only: closing would kill the user's Chrome.
  await browser.close().catch(() => {});
}
