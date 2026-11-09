#!/usr/bin/env node
// WCAG 2.x contrast from computed colours, as getComputedStyle returns them (rgb/rgba, color(srgb ...), oklch, oklab).
//   node scripts/contrast.mjs <fg> <bg> [<ancestor bg> ...]
// Backgrounds go from the nearest to the farthest; transparent layers are composited, white is assumed below all.
// Prints JSON: { ratio, fg, bg, aa, aaLarge }  (fg/bg as opaque hex after compositing).

const num = (s) => (s.endsWith('%') ? parseFloat(s) / 100 : parseFloat(s));
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const clamp = (c) => Math.min(1, Math.max(0, c));

function oklab(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => clamp(toGamma(clamp(c))));
}

// Returns { r, g, b, a } with sRGB gamma channels in 0..1.
export function parse(str) {
  const s = str.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const m = s.match(/^(rgba?|oklch|oklab|color)\((.*)\)$/);
  if (!m) throw new Error(`unsupported colour: ${str}`);
  const [body, alpha] = m[2].split('/');
  let parts = body.replace(/,/g, ' ').trim().split(/\s+/);
  let a = alpha !== undefined ? num(alpha.trim()) : 1;
  let rgb;
  if (m[1].startsWith('rgb')) {
    if (parts.length === 4) a = num(parts.pop());
    rgb = parts.map((p) => (p.endsWith('%') ? num(p) : parseFloat(p) / 255));
  } else if (m[1] === 'color') {
    if (parts.shift() !== 'srgb') throw new Error(`unsupported colour space: ${str}`);
    rgb = parts.map(num);
  } else if (m[1] === 'oklab') {
    rgb = oklab(num(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]));
  } else {
    const [L, C, H] = [num(parts[0]), parseFloat(parts[1]), (parseFloat(parts[2]) || 0) * Math.PI / 180];
    rgb = oklab(L, C * Math.cos(H), C * Math.sin(H));
  }
  if (rgb.length !== 3 || rgb.some(Number.isNaN) || Number.isNaN(a)) throw new Error(`cannot read colour: ${str}`);
  return { r: rgb[0], g: rgb[1], b: rgb[2], a };
}

const over = (top, under) => ({
  r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1,
});
const luminance = ({ r, g, b }) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
const hex = ({ r, g, b }) => '#' + [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('');

export function contrast(fg, ...bgs) {
  let bg = { r: 1, g: 1, b: 1, a: 1 };
  for (const layer of bgs.map(parse).reverse()) bg = over(layer, bg);
  const f = over(parse(fg), bg);
  const [hi, lo] = [luminance(f), luminance(bg)].sort((x, y) => y - x);
  const ratio = Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  return { ratio, fg: hex(f), bg: hex(bg), aa: ratio >= 4.5, aaLarge: ratio >= 3 };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [fg, ...bgs] = process.argv.slice(2);
  if (!fg || !bgs.length) { console.error('usage: contrast.mjs <fg> <bg> [<ancestor bg> ...]'); process.exit(1); }
  try { console.log(JSON.stringify(contrast(fg, ...bgs))); } catch (e) { console.error(e.message); process.exit(1); }
}
