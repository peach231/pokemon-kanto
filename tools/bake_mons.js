// Pokéram — tools/bake_mons.js
// Renders tools/recipes.js through spritegen and writes the baked grids into
// js/data/sprites_mons_*.js (six files, split by dex order). Run after any
// recipe change:  node tools/bake_mons.js

'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { Grid } = require('./spritegen');
const recipes = require('./recipes');

const ROOT = path.join(__dirname, '..');

// load util + palettes + species (for dex order) under a shim
global.window = global;
global.window.addEventListener = function () {};
for (const f of ['js/core/util.js', 'js/data/palettes.js', 'js/data/types.js', 'js/data/moves.js', 'js/data/species_a.js', 'js/data/species_b.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
}
const G = global.G;

const GROUPS = 'abcdef';
const PER_GROUP = Math.ceil(G.DEX_ORDER.length / GROUPS.length); // ~17

// ---------------------------------------------------------------------------
// Post-shade pass: classic "sel-out" — every fill pixel that touches the
// outline on its bottom or right gets a darker shade of itself (snapped to
// the master palette). This is the defining Gen 1/2 sprite shading trick.
// ---------------------------------------------------------------------------
const MASTER = Object.values(G.C).map(hexToRgb);
function hexToRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function rgbToHex(c) { return '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function nearestMaster(rgb) {
  let best = null, bd = 1e9;
  for (const m of MASTER) {
    const d = (m[0] - rgb[0]) ** 2 + (m[1] - rgb[1]) ** 2 + (m[2] - rgb[2]) ** 2;
    if (d < bd) { bd = d; best = m; }
  }
  return rgbToHex(best);
}
const SHADE_POOL = '!@&{}<>?;:^"|`'.split('');

function postShade(rows, pal) {
  const h = rows.length, w = rows[0].length;
  const grid = rows.map(r => r.split(''));
  const shadeChar = {};
  let poolIdx = 0;
  const newPal = Object.assign({}, pal);

  function shadeFor(ch) {
    if (ch in shadeChar) return shadeChar[ch];
    const hex = pal[ch];
    if (!hex) return (shadeChar[ch] = null);
    const rgb = hexToRgb(hex);
    const lum = 0.3 * rgb[0] + 0.6 * rgb[1] + 0.1 * rgb[2];
    if (lum < 70 || lum > 235) return (shadeChar[ch] = null); // too dark/white-shine
    const darker = nearestMaster(rgb.map(v => v * 0.7));
    if (darker === hex || darker === pal.o) return (shadeChar[ch] = null);
    while (poolIdx < SHADE_POOL.length && newPal[SHADE_POOL[poolIdx]]) poolIdx++;
    if (poolIdx >= SHADE_POOL.length) return (shadeChar[ch] = null);
    const sc = SHADE_POOL[poolIdx++];
    newPal[sc] = darker;
    shadeChar[ch] = sc;
    return sc;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === 'o' || ch === 'K' || ch === 'W') continue;
      const below = y + 1 < h ? rows[y + 1][x] : '.';
      const right = x + 1 < w ? rows[y][x + 1] : '.';
      if (below === 'o' || right === 'o') {
        const sc = shadeFor(ch);
        if (sc) grid[y][x] = sc;
      }
    }
  }
  return { rows: grid.map(r => r.join('')), pal: newPal };
}

const baked = {};
let count = 0;
for (const key of G.DEX_ORDER) {
  const r = recipes[key];
  if (!r) continue;
  const variants = { front: r };
  if (r.back) variants.back = { pal: r.pal, draw: r.back, w: r.backW || 56, h: r.backH || 40 };
  for (const variant in variants) {
    const rec = variants[variant];
    const w = rec.w || 48, h = rec.h || 48;
    const g = new Grid(w, h);
    rec.draw(new Proxy(g, {})); // plain grid; proxy reserved for future hooks
    let rows = g.render();
    // resolve palette names -> hex
    let pal = {};
    for (const ch in r.pal) {
      const hex = G.C[r.pal[ch]];
      if (!hex) throw new Error(`${key}: palette key '${r.pal[ch]}' not in master palette`);
      pal[ch] = hex;
    }
    // auto-provide sclera/glint whites for the eye primitives
    if (!pal.W && rows.some(rr => rr.includes('W'))) pal.W = '#f4f4f4';
    if (!pal.K && rows.some(rr => rr.includes('K'))) pal.K = '#f4f4f4';
    // Gen-style sel-out shading pass
    const shaded = postShade(rows, pal);
    rows = shaded.rows;
    pal = shaded.pal;
    const name = variant === 'front' ? `mon_${key}` : `mon_${key}_back`;
    baked[key] = baked[key] || {};
    baked[key][name] = { w, h, pal, rows };
    count++;
  }
}

// write group files
for (let gi = 0; gi < GROUPS.length; gi++) {
  const keys = G.DEX_ORDER.slice(gi * PER_GROUP, (gi + 1) * PER_GROUP);
  let out = `// Pokéram — sprites_mons_${GROUPS[gi]}.js\n`;
  out += `// BAKED creature sprite grids (dex ${gi * PER_GROUP + 1}–${Math.min(G.DEX_ORDER.length, (gi + 1) * PER_GROUP)}).\n`;
  out += `// Generated from tools/recipes.js via tools/bake_mons.js — edit recipes, not this file.\n\n`;
  out += `(function () {\n`;
  let any = false;
  for (const key of keys) {
    if (!baked[key]) continue;
    for (const name in baked[key]) {
      const a = baked[key][name];
      any = true;
      out += `  G.ART.${name} = {\n    w: ${a.w}, h: ${a.h},\n    pal: ${JSON.stringify(a.pal)},\n    px: [\n`;
      for (const row of a.rows) out += `      '${row}',\n`;
      out = out.slice(0, -2) + `\n    ]\n  };\n`;
    }
  }
  if (!any) out += `  // (no sprites baked for this range yet)\n`;
  out += `})();\n`;
  fs.writeFileSync(path.join(ROOT, `js/data/sprites_mons_${GROUPS[gi]}.js`), out);
}

// trainer art (player back, portraits) -> sprites_trainers.js
if (recipes.__trainers) {
  let out = `// Pokéram — sprites_trainers.js\n// BAKED trainer battle art. Generated via tools/bake_mons.js — edit tools/recipes.js.\n\n(function () {\n`;
  for (const name in recipes.__trainers) {
    const rec = recipes.__trainers[name];
    const w = rec.w || 48, h = rec.h || 48;
    const g = new Grid(w, h);
    rec.draw(g);
    let rows = g.render();
    let pal = {};
    for (const ch in rec.pal) {
      const hex = G.C[rec.pal[ch]];
      if (!hex) throw new Error(`${name}: palette key '${rec.pal[ch]}' not in master palette`);
      pal[ch] = hex;
    }
    const shadedT = postShade(rows, pal);
    rows = shadedT.rows;
    pal = shadedT.pal;
    out += `  G.ART.${name} = {\n    w: ${w}, h: ${h},\n    pal: ${JSON.stringify(pal)},\n    px: [\n`;
    for (const row of rows) out += `      '${row}',\n`;
    out = out.slice(0, -2) + `\n    ]\n  };\n`;
    count++;
  }
  out += `})();\n`;
  fs.writeFileSync(path.join(ROOT, 'js/data/sprites_trainers.js'), out);
}

const have = Object.keys(baked).length;
console.log(`baked ${count} sprite grids for ${have}/${G.DEX_ORDER.length} species (+trainers)`);
const missing = G.DEX_ORDER.filter(k => !baked[k]);
if (missing.length) console.log('missing recipes: ' + missing.slice(0, 12).join(', ') + (missing.length > 12 ? ` ... +${missing.length - 12}` : ''));
