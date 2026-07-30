// Pokéram — tools/check.js
// Headless sanity harness: loads every game script in index.html order under
// Node (with a tiny window shim), then lints art grids and (once they exist)
// gameplay data tables. Run:  node tools/check.js
// This never ships to the browser; it exists so art/data typos surface
// immediately instead of as subtle rendering bugs.

'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

// --- window/document shims (enough for data+logic files; gfx init is never called) ---
global.window = global;
global.window.addEventListener = function () {};
global.performance = global.performance || { now: () => Date.now() };
global.requestAnimationFrame = function () {};
global.location = { hash: '' };
global.document = {
  createElement: () => ({ getContext: () => null, style: {} }),
  getElementById: () => ({ getContext: () => null, style: {} })
};

// --- load scripts in index.html order ---
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
let loaded = 0;
for (const src of srcs) {
  if (src === 'main.js') continue; // boots the game; skip under Node
  const file = path.join(ROOT, src);
  const code = fs.readFileSync(file, 'utf8');
  try {
    vm.runInThisContext(code, { filename: src });
    loaded++;
  } catch (e) {
    console.error(`LOAD FAIL ${src}: ${e.message}`);
    process.exit(1);
  }
}

const G = global.G;
const errors = [];
const warn = [];

// --- master palette membership ---
const masterColors = new Set(Object.values(G.C || {}));

// --- art lint ---
let artCount = 0;
for (const name in G.ART) {
  const a = G.ART[name];
  artCount++;
  if (a.base) {
    if (!G.ART[a.base]) errors.push(`ART ${name}: base '${a.base}' missing`);
    continue;
  }
  if (!a.px || !a.pal) { errors.push(`ART ${name}: missing px or pal`); continue; }
  if (a.px.length !== a.h) errors.push(`ART ${name}: ${a.px.length} rows, expected h=${a.h}`);
  for (let y = 0; y < a.px.length; y++) {
    const row = a.px[y];
    if (row.length !== a.w) errors.push(`ART ${name} row ${y}: ${row.length} chars, expected w=${a.w}`);
    for (const ch of row) {
      if (ch !== '.' && ch !== ' ' && !a.pal[ch]) {
        errors.push(`ART ${name} row ${y}: char '${ch}' not in palette`);
        break;
      }
    }
  }
  for (const key in a.pal) {
    if (!masterColors.has(a.pal[key])) warn.push(`ART ${name}: color ${a.pal[key]} ('${key}') not in master palette`);
  }
}

// --- font lint ---
let glyphs = 0;
for (const ch in (G.FONT ? G.FONT.glyphs : {})) {
  glyphs++;
  const rows = G.FONT.glyphs[ch];
  if (rows.length > G.FONT.height) errors.push(`FONT '${ch}': ${rows.length} rows > height ${G.FONT.height}`);
  for (const r of rows) for (const c of r) {
    if (c !== '.' && c !== '#') { errors.push(`FONT '${ch}': bad char '${c}'`); break; }
  }
}

// --- map lint (legends resolve, layer dims, warp targets) ---
let mapCount = 0;
for (const id in (G.MAPS || {})) {
  mapCount++;
  const m = G.MAPS[id];
  for (const layer of ['ground', 'deco', 'over']) {
    const rows = m[layer];
    if (!rows) continue;
    if (rows.length !== m.h) errors.push(`MAP ${id}.${layer}: ${rows.length} rows, expected ${m.h}`);
    for (let y = 0; y < rows.length; y++) {
      if (rows[y].length !== m.w) errors.push(`MAP ${id}.${layer} row ${y}: ${rows[y].length} chars, expected ${m.w}`);
      for (const ch of rows[y]) {
        if (ch === '.' && layer !== 'ground') continue;
        const tile = m.legend[ch];
        if (tile === undefined) { errors.push(`MAP ${id}.${layer} row ${y}: char '${ch}' not in legend`); break; }
        if (tile && G.TILES && !G.TILES[tile]) { errors.push(`MAP ${id}: legend '${ch}' -> unknown tile '${tile}'`); break; }
      }
    }
  }
  for (const wp of (m.warps || [])) {
    if (!G.MAPS[wp.to]) errors.push(`MAP ${id}: warp to unknown map '${wp.to}'`);
  }
  // every door tile must have a warp on it (broken doors are silent otherwise)
  const DOORS = ['door', 'ldoor', 'gymdoor'];
  if (m.ground && G.TILES) {
    for (let y = 0; y < m.h; y++) {
      for (let x = 0; x < m.w; x++) {
        const tname = m.legend[m.ground[y][x]];
        if (!DOORS.includes(tname)) continue;
        const locked = (m.signs || []).some(s => s.x === x && s.y === y); // sign = locked-door flavor
        if (!locked && !(m.warps || []).some(wp => wp.x === x && wp.y === y)) {
          errors.push(`MAP ${id}: ${tname} at (${x},${y}) has no warp — door won't open`);
        }
      }
    }
  }
  for (const npc of (m.npcs || [])) {
    // creature sprites (mon_*) load as IMAGE files at runtime, not baked art
    if (npc.sprite && npc.sprite.indexOf('mon_') === 0) continue;
    // Overworld characters stream from pret/pokefirered at runtime (see
    // OVERWORLD_CFG.sheets), so baked art is only the fallback. Flag a sprite
    // ONLY when neither source can supply it -- that is a real missing NPC.
    const streamed = G.OVERWORLD_CFG && G.OVERWORLD_CFG.sheets && G.OVERWORLD_CFG.sheets[npc.sprite];
    if (npc.sprite && !streamed && G.ART && !G.ART['ch_' + npc.sprite + '_d0'] && !G.ART[npc.sprite]) {
      errors.push(`MAP ${id}: npc sprite '${npc.sprite}' has no art AND no stream source`);
    }
  }
  // encounter-table species must be in the roster
  if (m.encounters && m.encounters.table) {
    for (const e of m.encounters.table) {
      if (!G.SPECIES[e.sp]) errors.push(`MAP ${id}: encounter species '${e.sp}' not in roster`);
    }
  }
  // soft-lock guard: trainers/items shouldn't sit on solid tiles, and warps
  // shouldn't drop the player onto one.
  const solidAt = (map, x, y) => {
    const nm = (layer) => {
      const r = map[layer]; if (!r || y < 0 || y >= map.h) return null;
      const row = r[y] || ''; if (x < 0 || x >= row.length) return null;
      const ch = row[x]; if (ch === '.' && layer !== 'ground') return null;
      return map.legend[ch] || null;
    };
    const name = nm('deco') || nm('ground');
    const t = (name && G.TILES) ? G.TILES[name] : null;
    return !!(t && t.solid);
  };
  for (const tr of (m.trainers || [])) if (solidAt(m, tr.x, tr.y)) warn.push(`MAP ${id}: trainer at (${tr.x},${tr.y}) on a solid tile`);
  for (const it of (m.items || [])) if (solidAt(m, it.x, it.y)) warn.push(`MAP ${id}: item at (${it.x},${it.y}) on a solid tile`);
  for (const wp of (m.warps || [])) { const dest = G.MAPS[wp.to]; if (dest && solidAt(dest, wp.tx, wp.ty)) warn.push(`MAP ${id}: warp to ${wp.to} arrives on a solid tile (${wp.tx},${wp.ty})`); }
}

// --- tile lint (tile imgs exist) ---
for (const tname in (G.TILES || {})) {
  const t = G.TILES[tname];
  const imgs = t.anim || [t.img];
  for (const img of imgs) {
    if (!G.ART[img]) errors.push(`TILE ${tname}: art '${img}' missing`);
  }
}

// --- species / move / type lint (active once data files land) ---
let spCount = 0, mvCount = 0;
if (G.SPECIES) {
  for (const id in G.SPECIES) {
    spCount++;
    const s = G.SPECIES[id];
    for (const t of s.types) if (!G.TYPE_ORDER || !G.TYPE_ORDER.includes(t)) errors.push(`SPECIES ${id}: bad type '${t}'`);
    if (s.evolvesTo && !G.SPECIES[s.evolvesTo]) errors.push(`SPECIES ${id}: evolvesTo '${s.evolvesTo}' missing`);
    for (const [lvl, mv] of s.learnset) {
      if (!G.MOVES[mv]) errors.push(`SPECIES ${id}: learnset move '${mv}' missing`);
    }
    if (!s.learnset.some(e => e[0] === 1)) errors.push(`SPECIES ${id}: no level-1 move`);
    if (s.growth && G.EXP_GROUPS && !G.EXP_GROUPS[s.growth]) errors.push(`SPECIES ${id}: unknown growth group '${s.growth}'`);
    const bst = Object.values(s.base).reduce((a, b) => a + b, 0);
    const bands = { common: [140, 540], uncommon: [180, 560], rare: [200, 680], elusive: [200, 620], legendary: [560, 780], starter: [290, 540] };
    const band = bands[s.rarity];
    if (band && (bst < band[0] || bst > band[1])) warn.push(`SPECIES ${id}: BST ${bst} outside ${s.rarity} band [${band}]`);
  }
}

// --- world connectivity ---
// Walk the warp graph out from the start map. Two failure modes matter and
// neither is visible by reading a map file: a warp whose LANDING tile is solid
// or out of bounds (you arrive stuck inside a wall), and a map that no chain of
// warps can reach (content that exists but nobody can ever see).
{
  const START = 'pallet';
  const seen = new Set();
  const queue = [START];
  if (!G.MAPS[START]) errors.push(`WORLD: start map '${START}' does not exist`);
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    const m = G.MAPS[id];
    if (!m) continue;
    for (const w of (m.warps || [])) {
      const t = G.MAPS[w.to];
      if (!t) { errors.push(`WARP ${id} -> '${w.to}': no such map`); continue; }
      const row = t.ground[w.ty];
      const ch = row && row[w.tx];
      const tile = ch != null ? G.TILES[t.legend[ch]] : null;
      if (!tile) errors.push(`WARP ${id} -> ${w.to}: lands out of bounds at (${w.tx},${w.ty})`);
      else if (tile.solid) errors.push(`WARP ${id} -> ${w.to}: lands on SOLID '${t.legend[ch]}' at (${w.tx},${w.ty}) — soft-lock`);
      queue.push(w.to);
    }
  }
  for (const id of Object.keys(G.MAPS)) {
    if (!seen.has(id)) warn.push(`WORLD: map '${id}' is unreachable from ${START}`);
  }
  console.log(`  world: ${seen.size}/${Object.keys(G.MAPS).length} maps reachable from ${START}`);
}

// --- Gen 1 type-chart sanity ---
// Fifteen types. Dark, Steel and Fairy do not exist. The two mutual Bug/Poison
// matchups and Psychic's near-invulnerability are the signature of the era, so
// they are asserted rather than merely tolerated.
if (G.TYPE_ORDER) {
  if (G.TYPE_ORDER.length !== 15) errors.push(`TYPES: expected 15 types, got ${G.TYPE_ORDER.length}`);
  for (const gone of ['dark', 'steel', 'fairy']) {
    if (G.TYPE_ORDER.includes(gone)) errors.push(`TYPES: ${gone} must not exist in Gen 1`);
  }
  if (G.typeEff('bug', ['poison']) !== 2) errors.push('TYPES: Bug should be 2x on Poison in Gen 1');
  if (G.typeEff('poison', ['bug']) !== 2) errors.push('TYPES: Poison should be 2x on Bug in Gen 1');
  if (G.typeEff('ice', ['fire']) !== 1) errors.push('TYPES: Ice is NEUTRAL against Fire in Gen 1');
  // Deliberately un-bugged: the ROM shipped this as 0x.
  if (G.typeEff('ghost', ['psychic']) !== 2) errors.push('TYPES: Ghost -> Psychic should be 2x (our fix)');
}

// --- trainer integrity (resolve _starter*; party species + moves valid) ---
// Blue's party placeholders resolve at battle time to the line that counters
// the player's starter; for validation any concrete stage will do.
function resolveStarter(key) {
  if (key === '_starter') return 'charmander';
  if (key === '_starter2') return 'charmeleon';
  if (key === '_starter3') return 'charizard';
  return key;
}
for (const tid in (G.TRAINERS || {})) {
  const t = G.TRAINERS[tid];
  for (const p of (t.party || [])) {
    const key = resolveStarter(p.sp);
    if (!G.SPECIES[key]) { errors.push(`TRAINER ${tid}: party species '${p.sp}' not in roster`); continue; }
    if (G.movesAtLevel && G.movesAtLevel(key, p.level).length === 0) errors.push(`TRAINER ${tid}: ${key} has no usable moves at L${p.level}`);
  }
}

// --- sprite manifest coverage (informational) ---
if (G.SPECIES && G.SPRITE_MANIFEST) {
  let missing = 0;
  for (const id in G.SPECIES) { if (!G.SPRITE_MANIFEST[G.SPECIES[id].id]) missing++; }
  if (missing) warn.push(`SPRITES: ${missing}/${spCount} species have no confirmed sprite file yet (placeholder will render)`);
}
if (G.MOVES) for (const id in G.MOVES) mvCount++;

console.log(`loaded ${loaded} scripts | art: ${artCount} | glyphs: ${glyphs} | maps: ${mapCount} | species: ${spCount} | moves: ${mvCount}`);
for (const w of warn) console.log('  warn:', w);
if (errors.length) {
  for (const e of errors.slice(0, 40)) console.error('  ERROR:', e);
  if (errors.length > 40) console.error(`  ...and ${errors.length - 40} more`);
  process.exit(1);
}

// --- battle-core test vectors (deterministic; no rendering) ---
if (G.debug && G.debug.runTests) {
  const ok = G.debug.runTests();
  if (!ok) { console.error('  ERROR: battle-core tests failed'); process.exit(1); }
}
console.log('ALL CHECKS PASS');
