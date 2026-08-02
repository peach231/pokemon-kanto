// pokemon-kanto — tools/gen_ow_frames.js
// Writes tools/frlg_overworld_frames.json: the SOURCE FRAME SIZE of every
// object-event sheet in pret/pokefirered, keyed by the path the engine uses in
// G.OVERWORLD_CFG.sheets ('people/biker', 'pokemon/snorlax', ...).
//
// Why this exists: the loader assumed every sheet was a 16x32 frame grid. Most
// are. The BIKER is not — FireRed draws the rider and the motorcycle together
// in a 32x32 frame — so slicing it on the 16px grid returned the LEFT HALF of a
// person, for the three trainer classes that share that sheet, forever. The
// image itself never complained: 320/16 is a whole number too.
//
// Nothing here runs in the game. Re-run it only when the sheet list changes:
//     node tools/gen_ow_frames.js
// tools/check.js reads the JSON and fails if a declaration and the real
// artwork disagree in either direction.

'use strict';

const fs = require('fs');
const path = require('path');

const BASE = 'https://raw.githubusercontent.com/pret/pokefirered/master';
const CACHE = path.join(__dirname, 'cache');

async function raw(rel) {
  const file = path.join(CACHE, 'pokefirered__' + path.basename(rel));
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  const res = await fetch(BASE + '/' + rel);
  if (!res.ok) throw new Error(`fetch ${rel}: HTTP ${res.status}`);
  const text = await res.text();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(file, text);
  return text;
}

(async function main() {
  // gObjectEventPic_<Name> -> 'people/biker'
  const gfx = await raw('src/data/object_events/object_event_graphics.h');
  const picPath = {};
  for (const m of gfx.matchAll(
    /gObjectEventPic_(\w+)\[\]\s*=\s*INCBIN_U\d+\("graphics\/object_events\/pics\/([\w\/]+)\.4bpp"\)/g)) {
    picPath[m[1]] = m[2];
  }

  // overworld_frame(gObjectEventPic_<Name>, wTiles, hTiles, index) — the frame
  // size is right there in the table, in 8px tiles, which beats guessing it
  // from the image width (320 divides by both 16 and 32).
  const tables = await raw('src/data/object_events/object_event_pic_tables.h');
  const out = {};
  const conflict = [];
  for (const m of tables.matchAll(/overworld_frame\(gObjectEventPic_(\w+),\s*(\d+),\s*(\d+),/g)) {
    const p = picPath[m[1]];
    if (!p) continue;
    const size = { frameW: +m[2] * 8, frameH: +m[3] * 8 };
    const prev = out[p];
    if (prev && !prev.ambiguous && (prev.frameW !== size.frameW || prev.frameH !== size.frameH)) {
      // A few sheets really are read at two sizes by two different object
      // events — the fishing rod pics hold both a 16-wide standing frame and a
      // 32-wide cast. Those cannot be sliced one way, so they are recorded as
      // ambiguous rather than guessed at, and check.js refuses to let the
      // engine reference one without saying which size it means.
      const seen = `${prev.frameW}x${prev.frameH}`, now = `${size.frameW}x${size.frameH}`;
      if (conflict.indexOf(p) === -1) conflict.push(p);
      out[p] = { ambiguous: [seen, now].sort() };
      continue;
    }
    if (!prev || !prev.ambiguous) out[p] = size;
  }

  // A handful of pics ship in the repo but no object event ever references
  // them — FireRed marks them "Unused" — so there is no frame table to read a
  // size off. RICH_BOY is one, and this game does use it. Those are recorded as
  // unused rather than guessed at, so check.js can say out loud that they fall
  // back to the default slice instead of pretending to have verified them.
  for (const name in picPath) {
    const p = picPath[name];
    if (out[p]) continue;
    out[p] = { unused: true };
  }

  const dest = path.join(__dirname, 'frlg_overworld_frames.json');
  const keys = Object.keys(out).sort();
  const sorted = {};
  keys.forEach(k => { sorted[k] = out[k]; });
  fs.writeFileSync(dest, JSON.stringify(sorted, null, 1) + '\n');

  const wide = keys.filter(k => out[k].frameW && (out[k].frameW !== 16 || out[k].frameH !== 32));
  const unused = keys.filter(k => out[k].unused);
  if (unused.length) console.log(`${unused.length} pics FireRed never used (no frame table): ${unused.join(', ')}`);
  console.log(`wrote ${keys.length} sheets to ${path.relative(process.cwd(), dest)}`);
  console.log(`${wide.length} are NOT the standard 16x32:`);
  wide.forEach(k => console.log(`  ${k}  ${out[k].frameW}x${out[k].frameH}`));
  if (conflict.length) console.log(`${conflict.length} ambiguous (drawn at two sizes): ${conflict.join(', ')}`);
})();
