import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrast, parse } from './contrast.mjs';

test('black on white is 21:1, same colour is 1:1', () => {
  assert.equal(contrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)').ratio, 21);
  assert.equal(contrast('rgb(120, 120, 120)', 'rgb(120, 120, 120)').ratio, 1);
});

test('known pair: #767676 on white passes AA at 4.54', () => {
  const r = contrast('rgb(118, 118, 118)', 'rgb(255, 255, 255)');
  assert.equal(r.ratio, 4.54);
  assert.equal(r.aa, true);
});

test('transparent backgrounds composite down to the ancestor', () => {
  const r = contrast('rgb(255, 255, 255)', 'rgba(0, 0, 0, 0)', 'rgb(0, 0, 0)');
  assert.equal(r.ratio, 21);
  assert.equal(r.bg, '#000000');
});

test('semi-transparent text is blended before measuring', () => {
  assert.equal(contrast('rgba(0, 0, 0, 0.5)', 'rgb(255, 255, 255)').fg, '#808080');
});

test('oklch and color(srgb) parse to sRGB', () => {
  assert.equal(contrast('oklch(0 0 0)', 'oklch(1 0 0)').ratio, 21);
  assert.equal(contrast('color(srgb 0 0 0)', 'color(srgb 1 1 1 / 1)').ratio, 21);
  const p = parse('oklch(0.627955 0.257683 29.2339)'); // CSS red
  assert.ok(p.r > 0.99 && p.g < 0.01 && p.b < 0.01);
});

test('unknown formats throw instead of guessing', () => {
  assert.throws(() => parse('lab(50 20 30)'));
  assert.throws(() => parse('hsl(0 0% 0%)'));
});
