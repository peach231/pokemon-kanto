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
const png = require('./png');

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

async function rawBinary(rel) {
  const file = path.join(CACHE, 'pokefirered__' + path.basename(rel));
  if (fs.existsSync(file)) return file;
  const res = await fetch(BASE + '/' + rel);
  if (!res.ok) throw new Error(`fetch ${rel}: HTTP ${res.status}`);
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

// Group a sheet's frames into facings from the pixels alone. Returns the engine
// frame map, or { unreadable } with a reason rather than a guess.
function surfLayout(file) {
  const img = png.read(file);
  const FW = 32;
  const all = png.frames(img, FW);
  // The rider frames are the big ones; the tail of the sheet is the float with
  // nobody on it, which has far fewer pixels.
  const busiest = Math.max(...all.map(f => f.count));
  const rider = all.filter(f => f.count > busiest * 0.6);
  if (rider.length < 6) return { unreadable: `only ${rider.length} frames carry a rider; expected 6` };

  // Pair each frame with its closest match. Two poses of one facing look far
  // more like each other than like any other facing.
  const pairs = [];
  const taken = new Set();
  for (let a = 0; a < 6; a++) {
    if (taken.has(a)) continue;
    let best = -1, bestScore = -1;
    for (let b = 0; b < 6; b++) {
      if (b === a || taken.has(b)) continue;
      const s = png.similarity(rider[a], rider[b], false);
      if (s > bestScore) { bestScore = s; best = b; }
    }
    if (best < 0) return { unreadable: `frame ${a} has no partner` };
    taken.add(a); taken.add(best);
    pairs.push([a, best]);
  }
  if (pairs.length !== 3) return { unreadable: `frames grouped into ${pairs.length} facings, expected 3` };

  // Front and back are near-mirror-symmetric; the side view is not. Exactly one
  // pair must be the sideways one, and FireRed always orders south, north, west
  // — so the symmetric pairs, in sheet order, are south then north.
  const sideways = pairs.filter(([a]) => png.symmetry(rider[a]) < 0.6);
  if (sideways.length !== 1) {
    return { unreadable: `${sideways.length} of the three facings look sideways; expected exactly 1` };
  }
  const side = sideways[0];
  const facing = pairs.filter(p => p !== side);
  if (facing.length !== 2) return { unreadable: 'could not separate the two head-on facings' };

  const [d, u] = facing;                                  // sheet order: south, north
  return {
    d0: d[0], d1: d[1],
    u0: u[0], u1: u[1],
    s0: side[0], s1: side[1],
    note: 'derived from the artwork, not from a frame table — see tools/gen_ow_frames.js'
  };
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

  // The SURF sheet's layout, read off the artwork.
  //
  // Every other sheet here is a walk cycle: three facings, then their strides.
  // people/red_surf.png is not, and nothing in pokefirered says so, because
  // nothing in pokefirered uses that file. Read it the ordinary way and 'north'
  // lands on south's second pose while 'west' lands on north — which is exactly
  // what shipped, and what it looked like: a rider facing north while sailing
  // west.
  //
  // So it is derived instead of assumed. A front or back view is very nearly
  // its own mirror image and a side view is not, which sorts the facings; each
  // frame's closest match in the sheet is its own second pose, which pairs
  // them; and FireRed orders facings south, north, west everywhere, which names
  // them. If those three things ever stop agreeing, this refuses to guess.
  out['@surf'] = surfLayout(await rawBinary('graphics/object_events/pics/people/red_surf.png'));

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
