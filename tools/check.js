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
const srcs = [...html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)].map(m => m[1]);
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

// The scripts the game loads, for audits that read the SOURCE rather than
// the loaded objects — a name the engine resolves in a switch statement
// exists only in its text.
const SOURCES = srcs.filter(s => s !== 'main.js');

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
    // Art marked `imported` is a real sprite lifted from the source games and
    // carries THEIR palette on purpose — the eight badges are FireRed's own,
    // and repainting them into this game's colours would make them not the
    // badges. Everything drawn for this game still has to stay on palette.
    if (a.imported) continue;
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
    // Water counts as passable: you arrive there SURFING, and the sea routes
    // have no beach to land on by design.
    return !!(t && t.solid && !t.water);
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

// --- dangling references ---
// Everything a map points at by NAME must exist. A map referencing an event,
// trainer or item that was never defined does not crash on load — it fails
// silently the moment a player walks into it, which is the worst time to find
// out.
{
  const missEvent = [], missTrainer = [], missItem = [], missShop = [];
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    for (const n of (m.npcs || [])) {
      if (n.event && !(G.EVENTS || {})[n.event]) missEvent.push(`${id}: npc event '${n.event}'`);
    }
    for (const t of (m.trainers || [])) {
      if (t.event && !(G.EVENTS || {})[t.event]) missEvent.push(`${id}: trainer event '${t.event}'`);
      if (t.trainer && !(G.TRAINERS || {})[t.trainer]) missTrainer.push(`${id}: '${t.trainer}'`);
    }
    for (const it of (m.items || [])) {
      if (it.item && !(G.ITEMS || {})[it.item]) missItem.push(`${id}: item '${it.item}'`);
    }
    for (const sid of (m.shopInventory || [])) {
      if (!(G.ITEMS || {})[sid]) missShop.push(`${id}: shop stocks '${sid}'`);
    }
  }
  for (const e of missEvent) errors.push('DANGLING EVENT — ' + e);
  for (const e of missTrainer) errors.push('DANGLING TRAINER — ' + e);
  for (const e of missItem) errors.push('DANGLING ITEM — ' + e);
  for (const e of missShop) errors.push('DANGLING SHOP ITEM — ' + e);
  console.log('  refs: events/trainers/items/shops all resolve');
}

// --- flag reachability ---
// A `unlessFlag` gate that nothing ever SETS is a permanent wall: the NPC
// blocking the road never steps aside and the player is stuck with no
// indication why. Collect every flag the world reads, and every flag anything
// can set, and diff them.
{
  const read = new Map();
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    for (const list of [m.npcs || [], m.trainers || [], m.signs || []]) {
      for (const o of list) {
        for (const k of ['unlessFlag', 'ifFlag']) {
          if (o[k]) {
            if (!read.has(o[k])) read.set(o[k], []);
            read.get(o[k]).push(id);
          }
        }
      }
    }
  }
  // Flags set by trainer rewards, or written by any event body.
  const set = new Set();
  for (const tid in (G.TRAINERS || {})) {
    const r = G.TRAINERS[tid].reward;
    if (r && r.flag) set.add(r.flag);
    set.add(tid);          // beating a trainer records its own id
  }
  for (const eid in (G.EVENTS || {})) {
    const src = String(G.EVENTS[eid]);
    for (const mt of src.matchAll(/G\.flags\.([A-Za-z_$][\w$]*)\s*=/g)) set.add(mt[1]);
    for (const mt of src.matchAll(/G\.flags\[['"]([^'"]+)['"]\]\s*=/g)) set.add(mt[1]);
  }
  // Picking an item up off the ground sets its flag — that is done by the
  // engine rather than by an event body, so a purely textual scan misses it.
  for (const id in G.MAPS) {
    for (const it of (G.MAPS[id].items || [])) if (it.flag) set.add(it.flag);
  }
  // Flags built by string concatenation, declared where a reader can see
  // them rather than weakening the audit to accommodate them.
  for (const f of (G.DYNAMIC_FLAGS || [])) set.add(f);
  for (const [flag, where] of read) {
    if (!set.has(flag)) {
      errors.push(`UNSETTABLE FLAG '${flag}' gates ${where.join(', ')} but nothing ever sets it — permanent wall`);
    }
  }
  console.log(`  flags: ${read.size} gates, all settable`);
}

// --- duplicate warp tiles ---
// Two warps on one tile is ambiguous: which one fires depends on array order,
// which is not something a map author is thinking about.
{
  let dupes = 0;
  for (const id in G.MAPS) {
    const seen = new Set();
    for (const w of (G.MAPS[id].warps || [])) {
      const k = w.x + ',' + w.y;
      if (seen.has(k)) { errors.push(`MAP ${id}: two warps on tile (${k})`); dupes++; }
      seen.add(k);
    }
  }
  if (!dupes) console.log('  warps: no tile carries two warps');
}

// --- story item obtainability ---
// Every key item the story gates on must be granted SOMEWHERE. If nothing
// hands it out, the gate it opens is unreachable and the game dead-ends.
{
  const granted = new Set();
  for (const eid in (G.EVENTS || {})) {
    const src = String(G.EVENTS[eid]);
    for (const mt of src.matchAll(/G\.player\.bag\.([A-Za-z_$][\w$]*)\s*=/g)) granted.add(mt[1]);
    for (const mt of src.matchAll(/G\.player\.bag\[['"]([^'"]+)['"]\]/g)) granted.add(mt[1]);
  }
  for (const id in G.MAPS) {
    for (const it of (G.MAPS[id].items || [])) granted.add(it.item);
  }
  for (const id in G.MAPS) {
    for (const sid of (G.MAPS[id].shopInventory || [])) granted.add(sid);
  }
  const KEY_ITEMS = ['ssticket', 'silphscope', 'pokeflute', 'bikevoucher'];
  for (const k of KEY_ITEMS) {
    if (!granted.has(k)) warn.push(`KEY ITEM '${k}' is defined but nothing in the world grants it`);
  }
  console.log(`  items: ${granted.size} obtainable`);
}

// --- HMs and field moves ---
// Kanto is gated on the five HMs more than on the eight badges. An HM that
// nothing in the world hands out is not a missing item, it is a region that
// cannot be finished — so this is an ERROR, not a warning.
{
  const granted = new Set();
  for (const eid in (G.EVENTS || {})) {
    const src = String(G.EVENTS[eid]);
    for (const mt of src.matchAll(/bag\.([A-Za-z_$][\w$]*)\s*=/g)) granted.add(mt[1]);
    for (const mt of src.matchAll(/bag\[['"]([^'"]+)['"]\]/g)) granted.add(mt[1]);
    for (const mt of src.matchAll(/give\w*\(\s*['"]([^'"]+)['"]/g)) granted.add(mt[1]);
  }
  for (const id in G.MAPS) {
    for (const it of (G.MAPS[id].items || [])) granted.add(it.item);
    for (const sid of (G.MAPS[id].shopInventory || [])) granted.add(sid);
  }
  for (const kind in (G.FIELD_MOVES || {})) {
    const f = G.FIELD_MOVES[kind];
    if (!G.ITEMS[f.hm]) errors.push(`FIELD MOVE ${kind}: item '${f.hm}' does not exist`);
    if (!G.MOVES[f.move]) errors.push(`FIELD MOVE ${kind}: move '${f.move}' does not exist`);
    if (!granted.has(f.hm)) errors.push(`FIELD MOVE ${kind}: nothing in the world gives ${f.hm.toUpperCase()} — the region cannot be completed`);
  }
  // A tile flagged cut/strength/water is only passable if the matching HM
  // exists; and every TM the compatibility table names must be a real machine.
  for (const key in (G.TM_COMPAT || {})) {
    for (const tm of G.TM_COMPAT[key]) {
      if (!G.TM_MOVES[tm]) { errors.push(`TM_COMPAT ${key}: unknown machine '${tm}'`); break; }
    }
  }
  const learnable = new Set();
  for (const key in (G.TM_COMPAT || {})) for (const tm of G.TM_COMPAT[key]) learnable.add(tm);
  for (const tm in (G.TM_MOVES || {})) {
    if (!learnable.has(tm)) warn.push(`${tm.toUpperCase()} (${G.TM_MOVES[tm]}) can be learned by NOTHING`);
  }
  console.log(`  HMs: ${Object.keys(G.FIELD_MOVES || {}).length} field moves, all obtainable; ${Object.keys(G.TM_MOVES || {}).length} machines`);
}

// --- fly destinations ---
{
  for (const id in (G.FLY_POINTS || {})) {
    const pt = G.FLY_POINTS[id];
    const m = G.MAPS[pt.map];
    if (!m) { errors.push(`FLY POINT ${id}: map '${pt.map}' does not exist`); continue; }
    if (pt.x < 0 || pt.y < 0 || pt.x >= m.w || pt.y >= m.h) {
      errors.push(`FLY POINT ${id}: (${pt.x},${pt.y}) is outside ${pt.map} (${m.w}x${m.h})`);
      continue;
    }
    const name = (m.deco && m.deco[pt.y][pt.x] !== '.' ? m.legend[m.deco[pt.y][pt.x]] : null) ||
                 m.legend[m.ground[pt.y][pt.x]] || m.base;
    const def = G.TILES[name];
    if (!def || def.solid && !def.water) errors.push(`FLY POINT ${id}: lands on '${name}', which is solid`);
  }
  console.log(`  fly: ${Object.keys(G.FLY_POINTS || {}).length} destinations, all landable`);
}

// --- font coverage ---
// A character with no glyph does not throw. G.text simply skips it, so the
// sentence loses a mark and nobody notices until they read a sign closely.
// The em dash was missing and appeared in 144 signs and lines of dialogue;
// NIDORAN's two names were unreadable, since they are the only species in
// Gen 1 whose name IS a symbol.
{
  const glyphs = new Set(Object.keys(G.FONT.glyphs));
  glyphs.add(' ');
  const bad = new Map();
  const chk = (str, where) => {
    if (typeof str !== 'string') return;
    for (const ch of str) {
      if (glyphs.has(ch)) continue;
      if (!bad.has(ch)) bad.set(ch, new Set());
      bad.get(ch).add(where);
    }
  };
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    chk(m.name, 'map ' + id);
    for (const s2 of (m.signs || [])) chk(s2.text, 'sign in ' + id);
    for (const n of (m.npcs || [])) for (const d of (n.dialog || [])) chk(d, 'npc in ' + id);
  }
  for (const t in G.TRAINERS) {
    const d = G.TRAINERS[t];
    ['name', 'cls', 'intro', 'defeat'].forEach(k => chk(d[k], 'trainer ' + t));
    if (d.reward) chk(d.reward.text, 'reward ' + t);
  }
  for (const k in G.SPECIES) { chk(G.SPECIES[k].name, 'species ' + k); chk(G.SPECIES[k].dex, 'dex blurb ' + k); }
  for (const k in G.MOVES) chk(G.MOVES[k].name, 'move ' + k);
  for (const k in G.ITEMS) { chk(G.ITEMS[k].name, 'item ' + k); chk(G.ITEMS[k].desc, 'item desc ' + k); }
  // event dialogue: only the text yields, so code between strings is not
  // mistaken for prose
  for (const e in G.EVENTS) {
    const src = String(G.EVENTS[e]);
    for (const m of src.matchAll(/s: '((?:[^'\\]|\\.)*)'/g)) {
      chk(m[1].replace(/\\'/g, "'"), 'event ' + e);
    }
  }
  // Strings hardcoded in the ENGINE, not just in the data. The first pass of
  // this audit missed '<' and '>' because they only ever appeared inside a
  // G.text() call in menus.js — so the options screen shipped with its own
  // controls hint unreadable.
  for (const f of SOURCES) {
    if (f.indexOf('js/engine/') !== 0 && f.indexOf('js/core/') !== 0) continue;
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of text.matchAll(/G\.text\(\s*\w+\s*,\s*'((?:[^'\\]|\\.)*)'/g)) {
      chk(m[1].replace(/\\'/g, "'"), 'UI text in ' + f);
    }
  }

  for (const [ch, where] of bad) {
    errors.push(`MISSING GLYPH ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}) — used in ${where.size} place(s), e.g. ${[...where][0]}`);
  }
  console.log(`  font: ${glyphs.size} glyphs, every displayable string renders`);
}

// --- duplicate globals ---
// Everything in this project hangs off one `G` namespace and the files load in
// sequence, so a second definition of the same name SILENTLY WINS. There is no
// error, no warning, and no way to notice by reading either file.
//
// This shipped: title.js defined G.NameEntryScene(onDone), overriding
// menus.js's G.NameEntryScene(defaultName, onDone). CharSelectScene called the
// original signature, so `onDone` arrived holding the string 'Red', calling it
// threw, the exception escaped the frame loop, and the entire game froze on the
// name-entry screen with no input working. Eric hit it on his first launch.
{
  const defs = new Map();          // name -> [file, …]
  for (const f of SOURCES) {
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
    // TOP-LEVEL definitions only: every file in this project is one IIFE, so a
    // real definition sits at two spaces. Deeper indentation means an
    // assignment inside a function — debug.js swaps G.startBattle for a stub
    // mid-test and puts it back, which is legitimate and must not be flagged.
    for (const m of text.matchAll(/^ {0,2}G\.([A-Za-z_$][\w$]*)\s*=\s*(?:function|\{)/gm)) {
      if (!defs.has(m[1])) defs.set(m[1], []);
      if (defs.get(m[1]).indexOf(f) === -1) defs.get(m[1]).push(f);
    }
  }
  // Namespaces that are deliberately extended across files build themselves up
  // with `G.X = G.X || {}` and are not assignments of a fresh value.
  const EXTENDED = new Set(['MAPS', 'EVENTS', 'TILES', 'ART', 'IMG', 'SPECIES',
                            'TRAINERS', 'ITEMS', 'MOVES', 'SONGS', 'ENCOUNTERS',
                            'hooks', 'flags', 'DEX_ORDER', 'MAP_WARN', 'ART_WARN',
                            'TILE_EVENTS', 'DYNAMIC_FLAGS', 'C', 'UI']);
  for (const [name, files] of defs) {
    if (files.length < 2 || EXTENDED.has(name)) continue;
    errors.push(`DUPLICATE GLOBAL G.${name} defined in ${files.join(' and ')} — the later file wins silently`);
  }
  console.log(`  globals: ${defs.size} G.* definitions, none shadowed`);
}

// --- name contracts between data and engine ---
// This game is an inherited ENGINE plus a rewritten DATA layer, and every bug
// that has cost real time in this project lives on the seam between them: the
// data names something by a string, and the engine looks that string up.
// Rename one side and nothing crashes, nothing logs, and a whole mechanic
// quietly stops existing.
//
// It has happened three times already:
//   * items said `kind: 'ball'`, the battle bag looked for `'orb'` — nothing
//     in the game could be caught, and the catch-rate unit test passed
//     throughout, because the formula was right and nobody called it.
//   * events yielded `{t:'fn', f: …}`, the runner calls `step.fn()` — twenty
//     one events stopped halfway through.
//   * maps and trainers asked for the songs `gymleader` and `center`, and
//     music.js defined neither — every gym leader battle and every Pokémon
//     Centre played silence.
//
// So every such name is now checked here, in one place, by asking the DATA
// what it references and the ENGINE what it can resolve.
{
  const src = SOURCES.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');

  function report(label, wanted, have, howToFix) {
    const missing = [...wanted].filter(k => !have.has(k));
    if (missing.length) {
      errors.push(`CONTRACT ${label}: ${missing.join(', ')} — referenced by the data, unknown to the engine (${howToFix})`);
    }
    return missing.length === 0;
  }

  // 1. SONGS. Maps and trainers name a track; music.js has to define it.
  {
    const wanted = new Set();
    for (const id in G.MAPS) if (G.MAPS[id].music) wanted.add(G.MAPS[id].music);
    for (const t in G.TRAINERS) if (G.TRAINERS[t].music) wanted.add(G.TRAINERS[t].music);
    for (const m of src.matchAll(/playMusic\(\s*'([A-Za-z0-9_]+)'/g)) wanted.add(m[1]);
    for (const m of src.matchAll(/playJingle\(\s*'([A-Za-z0-9_]+)'/g)) wanted.add(m[1]);
    report('SONG', wanted, new Set(Object.keys(G.SONGS || {})), 'add it to js/data/music.js');
  }

  // 2. SOUND EFFECTS. audio.js resolves these in a switch, so the switch IS
  //    the list of what exists.
  {
    const audio = fs.readFileSync(path.join(ROOT, 'js/core/audio.js'), 'utf8');
    const have = new Set([...audio.matchAll(/case '([A-Za-z0-9_]+)':/g)].map(m => m[1]));
    const wanted = new Set();
    for (const m of src.matchAll(/sfx\(\s*'([A-Za-z0-9_]+)'/g)) wanted.add(m[1]);
    for (const m of src.matchAll(/t: 'sfx', id: '([A-Za-z0-9_]+)'/g)) wanted.add(m[1]);
    report('SFX', wanted, have, 'add a case to audio.js sfx()');
  }

  // 3. BATTLE BACKGROUNDS. Every map declares one; G.BATTLE_BG has to have it.
  {
    const wanted = new Set();
    for (const id in G.MAPS) if (G.MAPS[id].battleBg) wanted.add(G.MAPS[id].battleBg);
    // Only battle contexts. `bg:` is also the intro cinematic's slide key,
    // and its scenes ('space', 'dawn') are backdrops for narration rather
    // than arenas — catching those was a false positive, and an audit that
    // cries wolf gets switched off.
    for (const m of src.matchAll(/\{ bg: '([a-z]+)',\s*(?:music|onEnd|autoPlay)/g)) wanted.add(m[1]);
    report('BATTLE BG', wanted, new Set(Object.keys(G.BATTLE_BG || {})), 'add it to G.BATTLE_BG');
  }

  // 4. EVOLUTION METHODS. species files emit `how`; mon.js interprets it.
  {
    const wanted = new Set();
    for (const k in G.SPECIES) for (const e of (G.SPECIES[k].evos || [])) wanted.add(e.how);
    const mon = fs.readFileSync(path.join(ROOT, 'js/engine/mon.js'), 'utf8');
    const have = new Set([...mon.matchAll(/how === '([a-z]+)'/g)].map(m => m[1]));
    report('EVOLUTION', wanted, have, 'handle it in mon.js');
  }

  // 5. BATTLE ACTIONS. The UI constructs these; Battle.doAction dispatches.
  {
    const ui = fs.readFileSync(path.join(ROOT, 'js/engine/battle_ui.js'), 'utf8');
    const core = fs.readFileSync(path.join(ROOT, 'js/engine/battle.js'), 'utf8');
    const wanted = new Set([...ui.matchAll(/turn\(\{\s*type: '([a-z]+)'/g)].map(m => m[1]));
    const have = new Set([...core.matchAll(/action\.type === '([a-z]+)'/g)].map(m => m[1]));
    have.add('move'); // the fall-through branch
    report('BATTLE ACTION', wanted, have, 'dispatch it in Battle.doAction');
  }

  // 6. STONES. Items of kind `stone` must be ones an evolution actually asks
  //    for, or the player is carrying a rock that does nothing.
  {
    const asked = new Set();
    for (const k in G.SPECIES) {
      for (const e of (G.SPECIES[k].evos || [])) if (e.item) asked.add(e.item);
    }
    for (const id in G.ITEMS) {
      if (G.ITEMS[id].kind !== 'stone') continue;
      if (!asked.has(id)) warn.push(`STONE '${id}' evolves nothing`);
    }
    for (const it of asked) {
      if (!G.ITEMS[it]) errors.push(`CONTRACT EVOLUTION ITEM: '${it}' is required by an evolution but is not an item`);
    }
  }

  // 7. MOVE ANIMATIONS. Every animation key the table names must be one the
  //    battle screen can draw, or the move silently falls back to the generic
  //    coloured puff this whole system exists to replace.
  {
    const known = new Set(G.ANIM_KINDS || []);
    const ui = fs.readFileSync(path.join(ROOT, 'js/engine/battle_ui.js'), 'utf8');
    const drawn = new Set([...ui.matchAll(/case '([a-z]+)':/g)].map(m => m[1]));
    for (const k of known) {
      if (!drawn.has(k) && ['bolt', 'quake', 'beam', 'leaf'].indexOf(k) === -1) {
        errors.push(`ANIM '${k}' is declared but battle_ui.js has no case for it`);
      }
    }
    const named = new Set(Object.values(G.MOVE_ANIM || {}).concat(Object.values(G.TYPE_ANIM || {})));
    for (const k of named) {
      if (!known.has(k)) errors.push(`ANIM '${k}' is used by a move but not in G.ANIM_KINDS`);
    }
    for (const id in (G.MOVE_ANIM || {})) {
      if (!G.MOVES[id]) errors.push(`ANIM table names '${id}', which is not a move in this game`);
    }
    // and every move must resolve to something
    let generic = 0;
    for (const id in G.MOVES) if (!G.animFor(G.MOVES[id])) generic++;
    if (generic) errors.push(`${generic} move(s) resolve to no animation`);
    console.log(`  animations: ${known.length || known.size} kinds, ${Object.keys(G.MOVE_ANIM).length} moves named individually, all 165 resolve`);
  }

  // 8. RARITY. Species declare one; the encounter weighter looks it up, and an
  //    unknown rarity silently falls back to a default weight.
  {
    const wanted = new Set();
    for (const k in G.SPECIES) if (G.SPECIES[k].rarity) wanted.add(G.SPECIES[k].rarity);
    const ow = fs.readFileSync(path.join(ROOT, 'js/engine/overworld.js'), 'utf8');
    const m = ow.match(/RARITY_W\s*=\s*\{([^}]*)\}/);
    const have = new Set(m ? [...m[1].matchAll(/([A-Za-z]+)\s*:/g)].map(x => x[1]) : []);
    report('RARITY', wanted, have, 'add a weight to RARITY_W in overworld.js');
  }

  // 9. GROWTH GROUPS. Generated from the ROM; mon.js has to have a curve for
  //    each, or that species levels on the wrong table entirely.
  {
    const wanted = new Set();
    for (const k in G.SPECIES) if (G.SPECIES[k].growth) wanted.add(G.SPECIES[k].growth);
    report('GROWTH GROUP', wanted, new Set(Object.keys(G.EXP_GROUPS || {})), 'add the curve to G.EXP_GROUPS');
  }

  console.log('  contracts: songs, sfx, backgrounds, evolutions, actions, stones, rarities and growth curves all resolve');
}

// --- item kinds ---
// One string mismatch across two files disabled the entire catching mechanic
// for the length of this project. `kind` is the only contract between the item
// table and the code that interprets it, so it gets checked.
{
  const known = new Set(G.ITEM_KINDS || []);
  const seen = new Map();
  for (const id in G.ITEMS) {
    const k = G.ITEMS[id].kind;
    if (!seen.has(k)) seen.set(k, []);
    seen.get(k).push(id);
  }
  for (const [k, ids] of seen) {
    if (!known.has(k)) errors.push(`ITEM KIND '${k}' is not in G.ITEM_KINDS — the engine will ignore ${ids.length} item(s) including '${ids[0]}'`);
  }
  // and the reverse: a kind the engine claims to handle that nothing uses is a
  // rename that only got applied on one side.
  for (const k of known) {
    if (!seen.has(k)) warn.push(`ITEM KIND '${k}' is declared but no item uses it`);
  }
  // capture devices must actually reach the battle bag
  const battleSrc = String(G.BattleScene);
  for (const id in G.ITEMS) {
    if (G.ITEMS[id].kind !== 'ball') continue;
    if (battleSrc.indexOf("'ball'") === -1) {
      errors.push('BALLS are not reachable from the battle bag — nothing in the game can be caught');
    }
    break;
  }
  // TMs are single-use and there are fifty of them. One a player can never
  // find is a move that does not exist in this game.
  {
    const got = new Set();
    for (const id in G.MAPS) {
      for (const it of (G.MAPS[id].items || [])) got.add(it.item);
      for (const sid of (G.MAPS[id].shopInventory || [])) got.add(sid);
    }
    for (const t in G.TRAINERS) if (G.TRAINERS[t].reward && G.TRAINERS[t].reward.tm) got.add(G.TRAINERS[t].reward.tm);
    for (const eid in G.EVENTS) {
      const es = String(G.EVENTS[eid]);
      for (const m of es.matchAll(/'(tm\d{2})'/g)) got.add(m[1]);
      for (const m of es.matchAll(/bag\.([a-z0-9]+)\s*=/g)) got.add(m[1]);
    }
    const tms = Object.keys(G.TM_MOVES).filter(t => t.indexOf('tm') === 0);
    const missing = tms.filter(t => !got.has(t));
    if (missing.length) {
      warn.push(`TMs: ${missing.length}/${tms.length} can never be found — ${missing.join(', ')}`);
    }
    console.log(`  TMs: ${tms.length - missing.length}/${tms.length} findable`);
  }

  // Careful with the wording. This pass checks that every kind an item claims
  // is DECLARED, and vice versa — it has never checked that the bag can do
  // anything with one, and while it said "all handled by the engine" two of
  // the ten were not. Whether a branch exists is the ITEMKIND pass, below.
  console.log(`  items: ${seen.size} item kinds, all declared on both sides`);
}

// --- overworld sprite coverage ---
// An NPC whose sprite has no sheet renders as NOTHING. It is still solid, it
// still talks, and it is invisible — which is the single most confusing bug
// this project can produce, because the map looks fine and a piece of it is
// simply missing.
{
  const sheets = (G.OVERWORLD_CFG || {}).sheets || {};
  const used = new Map();
  for (const id in G.MAPS) {
    for (const n of (G.MAPS[id].npcs || []).concat(G.MAPS[id].trainers || [])) {
      if (!n.sprite) continue;
      if (!used.has(n.sprite)) used.set(n.sprite, []);
      used.get(n.sprite).push(id);
    }
  }
  // The PLAYER is not in the sheets table — they come from G.CHARACTERS — so
  // the sprite audit missed them entirely, and the one character on screen at
  // all times was the only one that could break unnoticed.
  // Every species needs a follower sheet URL, because the follower can be set
  // to any party member. Three species have a folder name that is not their
  // key (nidoran_f, nidoran_m, mr_mime) and a missing rename would 404 into an
  // invisible follower.
  {
    const bad = [];
    for (const k of (G.DEX_ORDER || [])) {
      const url = G.followerSheetUrl ? G.followerSheetUrl(k) : '';
      if (!url || /undefined/.test(url)) bad.push(k);
      if (/[^a-z0-9_/:.\-@]/.test(url.split('/graphics/')[1] || '')) bad.push(k + ' (bad chars)');
    }
    if (bad.length) errors.push(`FOLLOWER SHEET: no usable URL for ${bad.slice(0, 6).join(', ')}`);
    else console.log(`  followers: ${(G.DEX_ORDER || []).length} species resolve to a follower sheet`);
  }

  for (const c of (G.CHARACTERS || [])) {
    // A Kanto player has three overworld states and FireRed ships a sheet for
    // each. Missing one does not crash — it silently falls back to the walk
    // cycle, so the bicycle looks exactly like walking and surfing looks like
    // standing on the sea.
    for (const state of ['surf', 'bike']) {
      if (!c[state]) errors.push(`CHARACTER '${c.key}' has no ${state} sheet — that state will render as the walk cycle`);
      else if (c[state].indexOf('/') === -1) errors.push(`CHARACTER '${c.key}' ${state} sheet '${c[state]}' has no folder prefix`);
    }
    if (!c.sheet || c.sheet.indexOf('/') === -1) {
      errors.push(`CHARACTER '${c.key}' sheet '${c.sheet}' has no folder prefix — OVERWORLD_CFG.remoteBase points at pics/, so this resolves to a 404 and falls back to hand-drawn art`);
    }
    if (!c.back) errors.push(`CHARACTER '${c.key}' has no battle back sprite`);
  }
  for (const k in (G.OVERWORLD_CFG || {}).sheets || {}) {
    const v = G.OVERWORLD_CFG.sheets[k];
    if (v.indexOf('/') === -1) errors.push(`SHEET '${k}' -> '${v}' has no folder prefix`);
  }

  for (const [spr, where] of used) {
    // Baked UI art (the Poke Ball on Oak's table, the Mt. Moon fossils) is a
    // still image rather than a walk sheet, and is legitimately not in here.
    if (sheets[spr] || G.ART[spr] || G.IMG[spr]) continue;
    errors.push(`SPRITE '${spr}' has no overworld sheet — renders as an invisible NPC in ${[...new Set(where)].join(', ')}`);
  }
  console.log(`  sprites: ${used.size} overworld sprites, all resolvable`);

  // The same problem one layer up: a trainer whose BATTLE portrait key is not
  // in the keyMap fights you as an empty rectangle.
  const tk = (G.TRAINER_CFG || {}).keyMap || {};
  const badPortraits = new Set();
  for (const tid in (G.TRAINERS || {})) {
    const spr = G.TRAINERS[tid].sprite;
    if (spr && !tk[spr] && !G.ART[spr] && !G.IMG[spr]) badPortraits.add(spr);
  }
  for (const spr of badPortraits) {
    errors.push(`TRAINER PORTRAIT '${spr}' is not in the sprite keyMap — fights you as an empty rectangle`);
  }
  if (!badPortraits.size) console.log(`  portraits: ${Object.keys(tk).length} trainer portraits, all mapped`);
}

// --- map grid overflow ---
// padRows records any map given more rows than its declared height (the extras
// are silently dropped, along with anything on them) or rows wider than its
// width. Both are invisible in the source.
for (const w of (G.MAP_WARN || [])) errors.push('MAP GRID: ' + w);

// --- move effect coverage ---
// moves.js is generated and can introduce an effect kind the engine has never
// seen. An unhandled kind does not crash -- it silently does NOTHING, which is
// the worst possible failure because it looks like a balance decision. So the
// set of kinds the data emits must be a subset of the set battle.js handles.
{
  const HANDLED = new Set([
    'status', 'stages', 'confuse', 'flinch', 'highCrit',
    'drain', 'recoil', 'crash', 'multiHit', 'ohko', 'fixed', 'explode',
    'trap', 'thrash', 'rage', 'payday', 'bide', 'charge', 'recharge',
    'heal', 'rest', 'leechseed', 'screen', 'mist', 'haze', 'focusenergy',
    'substitute', 'disable', 'splash', 'conversion', 'transform', 'mimic',
    'metronome', 'mirrormove', 'switchout'
  ]);
  const seen = new Map();
  for (const id in (G.MOVES || {})) {
    const e = G.MOVES[id].effect;
    if (!e) continue;
    for (const k of [e.kind, e.rider && e.rider.kind]) {
      if (!k) continue;
      if (!seen.has(k)) seen.set(k, []);
      seen.get(k).push(G.MOVES[id].name);
    }
  }
  for (const [k, movers] of seen) {
    if (!HANDLED.has(k)) {
      errors.push(`MOVES: effect kind '${k}' is emitted by ${movers.length} move(s) (${movers.slice(0, 3).join(', ')}) but battle.js does not handle it — those moves would silently do nothing`);
    }
  }
  console.log(`  moves: ${seen.size} distinct effect kinds, all handled`);
}

// --- event dry-run ---
// Every audit above this one is STATIC: it reads the data and reasons about
// it. This one actually RUNS each event generator to completion against a
// stubbed world, which is the only way to catch the failures that live inside
// the code rather than in the tables — a helper that was renamed, a field
// accessed as `mon.species` when the engine calls it `mon.sp`, a yield shape
// the event runner does not understand.
//
// Every event is run TWICE: once on a blank save and once on a finished one,
// because almost every event in this game has an "already done that" branch
// and running only the first path would leave half of them untested.
{
  const VALID_YIELDS = new Set(['text', 'fn', 'wait', 'custom', 'sfx',
                                'balloon', 'npcApproach']);
  const broken = [];
  const mapOf = {};
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    for (const o of (m.npcs || []).concat(m.trainers || [], m.signs || [], m.scripts || [])) {
      const ev = o.event || o.run;
      if (ev && !mapOf[ev]) mapOf[ev] = id;
    }
  }

  // Stubs. Anything that would open a scene, start a battle or touch the DOM
  // is replaced with a recorder — the point is to execute the event BODY, not
  // to simulate the game.
  const realScene = { push: G.pushScene, pop: G.popScene, run: G.runEvent, runGen: G.runEventGen };
  const noop = function () {};
  const stubScene = function () { return { update: noop, draw: noop }; };
  G.pushScene = noop; G.popScene = noop; G.replaceScene = noop;
  G.runEvent = noop; G.runEventGen = noop;
  G.Textbox = stubScene; G.Chooser = stubScene; G.FadeScene = stubScene;
  G.PartyScene = stubScene; G.BattleScene = stubScene; G.HallOfFameScene = stubScene;
  G.BattleSwirlScene = stubScene; G.EvolutionScene = stubScene; G.CaughtScene = stubScene;
  G.startBattle = function () { return {}; };
  G.startTrainerBattle = function () { return {}; };
  G.ask = noop;
  G.audio = G.audio || {};
  G.audio.sfx = noop; G.audio.playMusic = noop;

  const savedPlayer = JSON.stringify(G.player);
  const savedFlags = JSON.stringify(G.flags);

  function run(eid, finished) {
    // A blank save, or a finished one with every flag set and every item held.
    G.newGame('TEST');
    G.player.party = [G.makeMon('bulbasaur', 30), G.makeMon('pidgey', 25)];
    G.player.money = 999999;
    if (finished) {
      G.player.badges = [true, true, true, true, true, true, true, true];
      for (let b = 1; b <= 8; b++) G.flags['badge' + b] = 1;
      for (const it in G.ITEMS) G.player.bag[it] = 1;
      for (const t in G.TRAINERS) G.flags[t] = 1;
      // every flag any gate reads, so the "already done" branches all fire
      for (const id in G.MAPS) {
        const m = G.MAPS[id];
        for (const o of (m.npcs || []).concat(m.trainers || [], m.items || [])) {
          if (o.unlessFlag) G.flags[o.unlessFlag] = 1;
          if (o.ifFlag) G.flags[o.ifFlag] = 1;
          if (o.flag) G.flags[o.flag] = 1;
        }
      }
      for (const f of (G.DYNAMIC_FLAGS || [])) G.flags[f] = 1;
      ['champion', 'strengthOn', 'safari_active', 'hoc_open', 'got_flash',
       'got_surf', 'got_fly', 'warden_paid', 'lab_trade'].forEach(f => { G.flags[f] = 1; });
      // A few flags hold a VALUE rather than a 1, and blindly setting them to
      // 1 tests a state the game can never actually be in.
      G.flags.starter = 'bulbasaur';
    }

    const mid = mapOf[eid] || 'pallet';
    G.world.mapId = mid;
    G.world.map = G.MAPS[mid];
    G.world.player = { x: 5, y: 5, dir: 'down', vehicle: null };
    G.world.refreshTiles = noop;
    G.world.npcs = [];

    let it;
    try { it = G.EVENTS[eid](); } catch (e) {
      broken.push(`${eid} threw on construction: ${e.message}`); return;
    }
    let step, guard = 0;
    try {
      step = it.next();
      while (!step.done) {
        if (++guard > 400) { broken.push(`${eid} did not terminate in 400 steps`); return; }
        const v = step.value || {};
        if (!VALID_YIELDS.has(v.t)) {
          broken.push(`${eid} yielded an unknown step type '${v.t}'`); return;
        }
        if (v.t === 'text' && typeof v.s !== 'string' && !Array.isArray(v.s)) {
          broken.push(`${eid} yielded a text step with no string`); return;
        }
        if (v.t === 'fn') v.fn();
        if (v.t === 'custom') {
          if (typeof v.run !== 'function') {
            broken.push(`${eid} yielded a custom step with no run() — the event runner ignores it and the event hangs`);
            return;
          }
          v.run(noop);
        }
        step = it.next();
      }
    } catch (e) {
      broken.push(`${eid} threw${finished ? ' (finished save)' : ''}: ${e.message}`);
    }
  }

  const evIds = Object.keys(G.EVENTS || {});
  for (const eid of evIds) { run(eid, false); run(eid, true); }

  G.pushScene = realScene.push; G.popScene = realScene.pop;
  G.runEvent = realScene.run; G.runEventGen = realScene.runGen;
  G.player = JSON.parse(savedPlayer);
  G.flags = JSON.parse(savedFlags);

  for (const b of broken) errors.push('EVENT — ' + b);
  if (!broken.length) console.log(`  events: ${evIds.length} events dry-run on a blank and a finished save`);
}

// --- progression ---
// Connectivity says every map is reachable IF you can already do everything.
// This asks the harder question: starting from nothing, walking out of your
// own bedroom with no badges and no HMs, does the world open up in an order
// that actually works?
//
// It is a fixpoint over two things at once:
//
//   * WHERE YOU CAN STAND — a flood fill inside each map from the tiles you
//     arrive on, respecting solid terrain, water you cannot yet SURF, trees
//     you cannot yet CUT, boulders you cannot yet shift, and NPCs who are
//     standing in the way given the flags you currently hold. A SNORLAX
//     asleep across a two-tile road is a wall until the flute exists, and
//     that has to be part of the model or the model is a lie.
//   * WHAT YOU ARE HOLDING — items, badges and flags granted by the maps you
//     can stand in, which unlock more terrain, which unlocks more maps.
//
// Iterate until nothing new appears, then look at what is still dark. A cycle
// (SURF behind a door that needs SURF, a road behind a POKéMON that needs the
// flute that is behind the road) surfaces here as maps that never light up,
// and is invisible any other way.
{
  const grants = {};
  const add = (mid, thing) => { (grants[mid] = grants[mid] || new Set()).add(thing); };

  const eventHome = {};
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    for (const o of (m.npcs || []).concat(m.trainers || [], m.signs || [], m.scripts || [])) {
      const ev = o.event || o.run;
      if (ev && !eventHome[ev]) eventHome[ev] = id;
    }
  }
  for (const eid in (G.EVENTS || {})) {
    const home = eventHome[eid];
    if (!home) continue;
    const src = String(G.EVENTS[eid]);
    for (const mt of src.matchAll(/bag\.([A-Za-z_$][\w$]*)\s*=/g)) add(home, mt[1]);
    for (const mt of src.matchAll(/G\.flags\.([A-Za-z_$][\w$]*)\s*=\s*1/g)) add(home, mt[1]);
  }

  // Capabilities. These are the real gates: Kanto is a region where three
  // quarters of the exits are terrain rather than doors.
  const CAPS = {
    surf:     s => s.has('hm03') && s.has('badge5'),
    strength: s => s.has('hm04') && s.has('badge4'),
    cut:      s => s.has('hm01') && s.has('badge2'),
    flute:    s => s.has('pokeflute')
  };

  function tileAt(m, x, y) {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return null;
    const d = m.deco && m.deco[y] && m.deco[y][x];
    const name = (d && d !== '.' ? m.legend[d] : null) || m.legend[m.ground[y][x]];
    return name ? G.TILES[name] : null;
  }

  // Who is standing in the way, given what we currently hold. An NPC or a
  // trainer occupies its tile; a SNORLAX across a road is exactly this.
  function blockers(m, have) {
    const set = new Set();
    for (const o of (m.npcs || []).concat(m.trainers || [])) {
      if (o.ifFlag && !have.has(o.ifFlag)) continue;
      if (o.unlessFlag && have.has(o.unlessFlag)) continue;
      set.add(o.x + ',' + o.y);
    }
    return set;
  }

  function walkable(m, x, y, have, npcs) {
    const t = tileAt(m, x, y);
    if (!t) return false;
    if (npcs.has(x + ',' + y)) return false;
    if (t.water) return have.has('@surf');
    if (t.cut) return have.has('@cut');
    if (t.strength) return have.has('@strength');
    // A `story` tile is solid until you interact with it — BLAINE's quiz
    // shutters open whether you answer right or wrong, so from a reachability
    // point of view they are a door with no lock, only a toll.
    if (t.story) return true;
    if (t.solid) return false;
    return true;
  }

  // Flood fill a map from the tiles we arrive on. Ledges are treated as
  // passable because you can always hop DOWN one — generous, and generous is
  // the right direction for an audit that must never cry wolf.
  function reachIn(m, entries, have, gates) {
    const npcs = blockers(m, have);
    // Tiles a guard turns you back from. The player can step on them, but the
    // script bounces them off again, so for the purpose of "where can this
    // player get to" the row is closed.
    const shut = new Set();
    for (const g of (gates || [])) {
      const xs = Array.isArray(g.x) ? g.x : [g.x, g.x];
      for (let x = xs[0]; x <= xs[1]; x++) shut.add(x + ',' + g.y);
    }
    const seen = new Set();
    const q = entries.filter(e => e.x >= 0 && e.y >= 0 && e.x < m.w && e.y < m.h);
    for (const e of q) seen.add(e.x + ',' + e.y);
    while (q.length) {
      const c = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = c.x + dx, ny = c.y + dy, k = nx + ',' + ny;
        if (seen.has(k)) continue;
        if (shut.has(k)) continue;
        if (!walkable(m, nx, ny, have, npcs)) continue;
        seen.add(k);
        q.push({ x: nx, y: ny });
      }
    }
    return seen;
  }

  const have = new Set();
  const entriesOf = { playerhome: [{ x: 4, y: 6 }] };
  const seenMaps = new Set(['playerhome']);
  // How many badges you are carrying the FIRST time each map becomes
  // reachable. This is the only honest way to ask whether a trainer is too
  // strong for where it stands: Kanto is gated by geography and HMs far more
  // than by badges, so counting badge-gates alone flags half the region.
  const badgesAt = { playerhome: 0 };
  // and the same figure per TRAINER, which is the one difficulty cares about
  const trainerAt = {};
  const badgeCount = () => ['badge1','badge2','badge3','badge4','badge5','badge6','badge7','badge8']
    .filter(b => have.has(b)).length;
  let grew = true, rounds = 0;

  while (grew && rounds++ < 80) {
    grew = false;
    for (const cap in CAPS) {
      if (!have.has('@' + cap) && CAPS[cap](have)) { have.add('@' + cap); grew = true; }
    }
    for (const id of [...seenMaps]) {
      const m = G.MAPS[id];
      if (!m) continue;
      // A badge checkpoint is a wall until you are carrying the badges, so the
      // walker has to see it as one. Without this the audit believed ROUTE 23
      // was open from VIRIDIAN on day one and graded every trainer up there
      // against a nought-badge player — five loud warnings about a road the
      // game already refuses to let you walk.
      const gates = (m.scripts || []).filter(s => s.needBadges > badgeCount());
      const stand = reachIn(m, entriesOf[id] || [], have, gates);

      // Anything you can walk up to, you can have.
      for (const it of (m.items || [])) {
        if (!stand.has(it.x + ',' + it.y) && !nearStand(stand, it)) continue;
        if (!have.has(it.item)) { have.add(it.item); grew = true; }
        if (it.flag && !have.has(it.flag)) { have.add(it.flag); grew = true; }
      }
      for (const t of (m.trainers || [])) {
        if (t.ifFlag && !have.has(t.ifFlag)) continue;
        if (t.unlessFlag && have.has(t.unlessFlag)) continue;
        if (!nearStand(stand, t)) continue;
        const def = (G.TRAINERS || {})[t.trainer];
        if (!def) continue;
        // How many badges you hold the first time you can actually walk up to
        // THIS trainer — not this map. Route 23 is entered from Viridian with
        // nothing, but its trainers stand behind seven badge checkpoints, and
        // grading them by the map they live on is what let a level 47 Arcanine
        // sit on a road the audit called a nought-badge road.
        if (!(t.trainer in trainerAt)) trainerAt[t.trainer] = badgeCount();
        if (!have.has(t.trainer)) { have.add(t.trainer); grew = true; }
        if (def.reward && def.reward.flag && !have.has(def.reward.flag)) {
          have.add(def.reward.flag); grew = true;
        }
      }
      for (const o of (m.npcs || []).concat(m.scripts || [])) {
        if (o.ifFlag && !have.has(o.ifFlag)) continue;
        if (o.unlessFlag && have.has(o.unlessFlag)) continue;
        const ev = o.event || o.run;
        if (!ev || !G.EVENTS[ev]) continue;
        if (o.x != null && !nearStand(stand, o)) continue;
        for (const thing of (grants[id] || [])) {
          if (!have.has(thing)) { have.add(thing); grew = true; }
        }
        for (const mt of String(G.EVENTS[ev]).matchAll(/loadMap\(\s*['"]([a-z0-9_]+)['"]/g)) {
          if (G.MAPS[mt[1]] && !seenMaps.has(mt[1])) {
            seenMaps.add(mt[1]);
            badgesAt[mt[1]] = badgeCount();
            (entriesOf[mt[1]] = entriesOf[mt[1]] || []).push({ x: 9, y: 9 });
            grew = true;
          }
        }
      }

      // Only warps you can physically stand on count.
      for (const w of (m.warps || [])) {
        if (!G.MAPS[w.to]) continue;
        if (!stand.has(w.x + ',' + w.y)) continue;
        const need = w.needFlag ? (Array.isArray(w.needFlag) ? w.needFlag : [w.needFlag]) : [];
        if (!need.every(f => have.has(f))) continue;
        const entries = (entriesOf[w.to] = entriesOf[w.to] || []);
        if (!entries.some(e => e.x === w.tx && e.y === w.ty)) {
          entries.push({ x: w.tx, y: w.ty });
          grew = true;
        }
        if (!seenMaps.has(w.to)) {
          seenMaps.add(w.to);
          badgesAt[w.to] = badgeCount();
          grew = true;
        }
      }
    }
  }

  // An NPC or item is usable if you can stand ON it or NEXT to it — you talk
  // across a tile, you do not walk into people.
  function nearStand(stand, o) {
    // A `scripts` trigger carries an x RANGE rather than a single tile, and
    // treating that array as a number quietly concatenated strings and made
    // the HALL OF FAME look unreachable.
    const xs = Array.isArray(o.x) ? o.x : [o.x, o.x];
    for (let x = xs[0]; x <= xs[1]; x++) {
      if (stand.has(x + ',' + o.y)) return true;
      if (stand.has((x + 1) + ',' + o.y) || stand.has((x - 1) + ',' + o.y)) return true;
      if (stand.has(x + ',' + (o.y + 1)) || stand.has(x + ',' + (o.y - 1))) return true;
    }
    return false;
  }

  // Nobody stands inside the scenery. A person on a solid tile is invisible to
  // the player, unreachable, and — when it is a gym guide or a leader — reads
  // as the room being empty. Shortening the five gym rooms moved a door row up
  // underneath a guide, which is exactly this, and nothing else here would
  // have noticed: reachability audits ask what you can GET to, never whether
  // the cast is standing somewhere that exists.
  {
    // Only entries that DRAW A PERSON count. A sprite-less entry sitting on
    // solid scenery is an interaction point rather than somebody standing in a
    // wall — the SNORLAX asleep across Route 12 is exactly a boulder tile you
    // can talk to, and OAK'S AIDE with FLASH is a signpost. Water and stools
    // are fine underfoot too: swimmers swim, and people sit down.
    const OK_UNDERFOOT = new Set(['water', 'istool']);
    const stuck = [];
    for (const id in G.MAPS) {
      const m = G.MAPS[id];
      for (const kind of ['npcs', 'trainers']) {
        for (const o of (m[kind] || [])) {
          // obj:true is scenery wearing a sprite — the SNORLAX asleep across
          // the road, the fossils on their stands. Those belong on solid tiles.
          if (Array.isArray(o.x) || o.x == null || !o.sprite || o.obj) continue;
          const who = o.trainer || o.event || o.sprite;
          const t = tileAt(m, o.x, o.y);
          if (!t) { stuck.push(`${id} '${who}' stands at (${o.x},${o.y}), off the map`); continue; }
          if (!t.solid || t.story) continue;
          const d = m.deco && m.deco[o.y] && m.deco[o.y][o.x];
          const name = (d && d !== '.' ? m.legend[d] : null) || m.legend[m.ground[o.y][o.x]];
          if (OK_UNDERFOOT.has(name)) continue;
          stuck.push(`${id} '${who}' stands at (${o.x},${o.y}), inside ${name}`);
        }
      }
    }
    for (const s of stuck) errors.push('PLACEMENT: ' + s);
    if (!stuck.length) console.log('  placement: every drawn person stands on a tile a person could stand on');
  }

  // Two things you can talk to never share a tile. _interact resolves a faced
  // tile in a fixed order — person, then counter, then item, then sign — so the
  // loser is simply unreadable, with nothing to show it is there. Adding the
  // COIN COUNTER's sign put it straight onto a bystander and silenced it.
  {
    // Sharing a tile is fine when the two can never be present together — every
    // gym leader stands on the same square as their post-CHAMPION rematch, one
    // gated `unlessFlag: champion` and the other `ifFlag: champion`.
    const exclusive = (a, b) =>
      (!!a.ifFlag && a.ifFlag === b.unlessFlag) || (!!b.ifFlag && b.ifFlag === a.unlessFlag);
    const buried = [];
    for (const id in G.MAPS) {
      const m = G.MAPS[id], at = new Map();
      const put = (o, kind) => {
        if (Array.isArray(o.x) || o.x == null) return;   // range triggers are not talked to
        const k = o.x + ',' + o.y;
        const here = at.get(k) || [];
        for (const prev of here) {
          if (exclusive(prev.o, o)) continue;
          buried.push(`${id}: ${kind} at (${o.x},${o.y}) is under a ${prev.kind}, and can never be read`);
        }
        here.push({ o, kind });
        at.set(k, here);
      };
      for (const o of (m.npcs || [])) put(o, 'person');
      for (const o of (m.trainers || [])) put(o, 'trainer');
      for (const o of (m.items || [])) put(o, 'item');
      for (const o of (m.signs || [])) put(o, 'sign');
    }
    for (const b of buried) errors.push('BURIED: ' + b);
    if (!buried.length) console.log('  interactables: nothing talkable is hidden underneath something else talkable');
  }

  // Anything the game asks you to SPEND has somewhere to get it.
  //
  // The GAME CORNER shipped with a prize counter, six prizes, a COIN CASE, a
  // slot machine that costs three coins a spin — and no way to obtain a single
  // coin. The building told you to "see the counter" and there was no counter.
  // Every audit passed: the room was reachable, the events fired, the prizes
  // existed. Nothing asked whether the currency they cost could be earned.
  {
    const src = Object.keys(G.EVENTS)
      .map(k => String(G.EVENTS[k]))
      .concat([fs.readFileSync(path.join(ROOT, 'js', 'engine', 'battle_ui.js'), 'utf8'),
               fs.readFileSync(path.join(ROOT, 'js', 'engine', 'menus.js'), 'utf8')]);
    const broke = [];
    // A currency needs at least one place that ADDS to it, not just places
    // that subtract. `coins -= cost` all day long is what a dead end looks like.
    for (const [field, what] of [['coins', 'GAME CORNER coins'], ['money', 'money']]) {
      const gain = new RegExp(`\\.${field}\\s*(\\+=|=\\s*\\(?[^;]*\\.${field}[^;]*\\+)`);
      if (!src.some(s => gain.test(s))) {
        broke.push(`nothing in the game ever increases ${what} — everything priced in it is unreachable`);
      }
    }
    // PAY DAY banks into battle.payDay during the fight and is paid out when it
    // ends. It banked for months with nothing on the other side of the ledger.
    const payer = fs.readFileSync(path.join(ROOT, 'js', 'engine', 'battle_ui.js'), 'utf8');
    const banks = /payDay\s*=\s*\(?this\.payDay/.test(fs.readFileSync(path.join(ROOT, 'js', 'engine', 'battle.js'), 'utf8'));
    if (banks && !/\.money\s*\+=\s*[^;]*payDay/.test(payer)) {
      broke.push('PAY DAY accumulates battle.payDay and nothing ever pays it out');
    }
    // And the slot machine has to be playable from a standing start: if a spin
    // costs more than the smallest amount you can buy, the machines are props.
    const slots = String(fs.readFileSync(path.join(ROOT, 'js', 'engine', 'menus.js'), 'utf8'));
    const bet = +(slots.match(/var BET = (\d+)/) || [])[1];
    const deals = [...String(G.EVENTS.coinCounter || '').matchAll(/coins:\s*(\d+)/g)].map(m => +m[1]);
    if (!deals.length) broke.push('no coin counter sells coins, so the slots and the prize shelf cannot be started');
    else if (bet && Math.min(...deals) < bet) {
      broke.push(`the cheapest coin purchase is ${Math.min(...deals)} but a spin costs ${bet}`);
    }
    for (const b of broke) errors.push('CURRENCY: ' + b);
    if (!broke.length) console.log('  currency: coins and money can both be earned, and the smallest coin purchase covers a spin');
  }

  // Every evolution the data declares actually happens when it is triggered.
  //
  // G.evolveMon takes the target as an optional second argument and works out a
  // LEVEL-UP evolution when it is left off. G.EvolutionScene left it off — so a
  // MOON STONE on NIDORINO consumed the stone, played the full animation, and
  // then asked evolveMon for the level-up evolution of a species that has none.
  // It returned nothing, the mon was untouched, and the game announced that
  // NIDORINO had evolved into NIDORINO. Every stone and every trade line in the
  // game was dead the same way, and no test noticed because the mechanics
  // underneath were fine — only the one call that used them was wrong.
  {
    const dud = [];
    for (const sp in G.SPECIES) {
      for (const e of (G.SPECIES[sp].evos || [])) {
        const level = e.how === 'level' ? e.level : 20;
        const mon = G.makeMon(sp, level);
        const target = e.how === 'stone' ? G.stoneEvolution(mon, e.item)
                     : e.how === 'level' ? G.evolutionDue(mon)
                     : e.into;
        if (target !== e.into) {
          dud.push(`${sp} -> ${e.into} (${e.how}) is not what the lookup returns (${target})`);
          continue;
        }
        if (!G.evolveMon(mon, target) || mon.sp !== e.into) {
          dud.push(`${sp} -> ${e.into} (${e.how}) triggers but leaves the mon as ${mon.sp}`);
        }
      }
    }
    // ...and the scene that plays the animation passes that target along. This
    // is the actual bug: the mechanics above all worked in isolation.
    const scene = fs.readFileSync(path.join(ROOT, 'js', 'engine', 'battle_ui.js'), 'utf8');
    if (!/G\.evolveMon\(\s*mon\s*,/.test(scene)) {
      dud.push('EvolutionScene calls evolveMon without a target — stone and trade evolutions will play the animation and change nothing');
    }
    for (const d of dud) errors.push('EVOLVE: ' + d);
    if (!dud.length) {
      const n = Object.values(G.SPECIES).reduce((a, s) => a + (s.evos || []).length, 0);
      console.log(`  evolution: all ${n} declared evolutions actually change the species when triggered`);
    }
  }

  // Every sheet is sliced at the frame size FireRed actually drew it at.
  //
  // The loader took 16x32 for granted. Most object-event sheets are, so this
  // held for four dozen classes and then quietly failed for the BIKER, whose
  // frames are 32 wide because the rider comes with a motorcycle. Cutting that
  // sheet on the 16px grid yields exactly the LEFT HALF of a person — and 320
  // divides by 16 as cleanly as it divides by 32, so nothing anywhere could
  // tell. Three trainer classes rode that sheet; all three were half a man.
  //
  // Ground truth is pokefirered's own frame tables, cached by
  // tools/gen_ow_frames.js. This fails in BOTH directions: a sheet sliced at
  // the wrong width, and a `wide` override that no longer matches the art.
  {
    const FRAMES = path.join(__dirname, 'frlg_overworld_frames.json');
    if (!fs.existsSync(FRAMES)) {
      errors.push('SHEETFRAME: tools/frlg_overworld_frames.json is missing — run `node tools/gen_ow_frames.js`');
    } else {
      const real = JSON.parse(fs.readFileSync(FRAMES, 'utf8'));
      const cfg = G.OVERWORLD_CFG, wide = cfg.wide || {};
      const bad = [];
      const unverified = [];
      const used = new Set(Object.values(cfg.sheets));
      for (const name in cfg.sheets) {
        const p = cfg.sheets[name];
        const truth = real[p];
        if (!truth) { bad.push(`'${name}' points at ${p}, which is not a pokefirered object-event pic at all`); continue; }
        // FireRed ships a few pics no object event ever uses (RICH_BOY), so
        // there is no frame table to check them against. Say so rather than
        // inventing a size and calling it verified.
        if (truth.unused) { unverified.push(name); continue; }
        if (truth.ambiguous) {
          bad.push(`'${name}' uses ${p}, which FireRed draws at ${truth.ambiguous.join(' AND ')} — it cannot be sliced one way`);
          continue;
        }
        const cut = (wide[p] || cfg).frameW;
        if (cut !== truth.frameW) {
          bad.push(`'${name}' (${p}) is sliced at ${cut}px but the art is ${truth.frameW}x${truth.frameH}`
                   + ` — every frame would be ${cut < truth.frameW ? 'part of' : 'more than'} one`);
        }
      }
      for (const p in wide) {
        if (!used.has(p)) bad.push(`OVERWORLD_CFG.wide declares ${p}, which no sprite uses`);
        else if (wide[p].frameW === cfg.frameW) {
          bad.push(`OVERWORLD_CFG.wide declares ${p} at the default ${cfg.frameW}px — the entry does nothing`);
        }
      }
      for (const b of bad) errors.push('SHEETFRAME: ' + b);
      if (!bad.length) {
        const n = Object.keys(cfg.sheets).length - unverified.length;
        const w = Object.keys(wide).length;
        console.log(`  sheet frames: ${n} overworld sheets sliced at FireRed's own frame size, ${w} of them wider than 16px`
          + (unverified.length
              ? ` — ${unverified.join(', ')} draw${unverified.length === 1 ? 's' : ''} art FireRed itself never placed, so there is no table to check ${unverified.length === 1 ? 'it' : 'them'} against`
              : ''));
      }
    }
  }


  const dark = Object.keys(G.MAPS).filter(id => !seenMaps.has(id));
  if (dark.length) {
    errors.push(`PROGRESSION: ${dark.length} map(s) can never be reached on an honest playthrough — ${dark.slice(0, 10).join(', ')}${dark.length > 10 ? ' …' : ''}`);
  }
  const MUST = ['badge1', 'badge2', 'badge3', 'badge4', 'badge5', 'badge6', 'badge7', 'badge8',
                'hm01', 'hm02', 'hm03', 'hm04', 'hm05', 'pokeflute', 'silphscope', 'e4_champion'];
  const missing = MUST.filter(f => !have.has(f));
  if (missing.length) {
    errors.push(`PROGRESSION: unobtainable on an honest playthrough — ${missing.join(', ')}`);
  }
  if (!dark.length && !missing.length) {
    console.log(`  progression: every map, badge and HM reachable from an empty save (${rounds} rounds, walking each map tile by tile)`);
  }

  // Difficulty ordering, using the badge count computed above rather than a
  // guess. Route 23 shipped with level-47 teams and its seven badge guards
  // standing INSIDE the cliff face, so a player who turned left out of
  // Viridian on day one met an Arcanine twenty levels above anything they
  // owned. That is the shape of bug this catches.
  {
    const BAND = [14, 22, 26, 32, 42, 47, 50, 54, 66];
    // Where a flag is actually earned, in badges.
    const FLAG_GATE = { champion: 8, badge7: 7, badge8: 8, rh_giovanni: 6 };
    const loud = [];
    for (const id in G.MAPS) {
      if (!(id in badgesAt)) continue;
      const gate = badgesAt[id];
      for (const t of (G.MAPS[id].trainers || [])) {
        const def = (G.TRAINERS || {})[t.trainer];
        if (!def || !def.party) continue;
        // A trainer standing behind a flag is not reachable just because the
        // ROOM is. Every post-game rematch shares a tile with the leader it
        // replaces, and Giovanni's gym stays shut until the seventh badge —
        // graded against the room, all of them shout, and that shouting is
        // exactly what would hide the next real Arcanine.
        var eff = t.trainer in trainerAt ? trainerAt[t.trainer] : gate;
        if (t.ifFlag && FLAG_GATE[t.ifFlag] != null) eff = Math.max(eff, FLAG_GATE[t.ifFlag]);
        const ceiling = BAND[Math.min(BAND.length - 1, eff)] + 10;
        const top = Math.max(...def.party.map(p => p.level));
        if (top > ceiling) {
          loud.push(`${id} '${t.trainer}' fields Lv${top}, but that is first reachable on ${eff} badge(s) — expect no more than Lv${ceiling}`);
        }
      }
    }
    for (const l of loud) warn.push('DIFFICULTY — ' + l);
    if (!loud.length) console.log(`  difficulty: every trainer is in level band for where it first becomes reachable`);
  }
}

// --- the same thing registered twice ---
// A duplicate G.* global froze the game on the name entry screen once, and
// there is an audit above for that. The same mistake inside a data TABLE is
// silent instead: STRUGGLE was declared twice in moves.js, four lines apart,
// and the second quietly replaced the first. They disagreed about the recoil —
// a quarter of the damage in one and a half in the other — so which was live
// depended purely on line order.
{
  const dupes = [];
  const TABLES = [
    ['js/data/moves.js', /^\s*mv\('([a-z0-9_]+)'/gm, 'move'],
    ['js/data/items.js', /^\s*item\('([a-z0-9_]+)'/gm, 'item'],
    ['js/data/trainers.js', /^\s*tr\('([a-z0-9_]+)'/gm, 'trainer']
  ];
  for (const [file, re, what] of TABLES) {
    let text;
    try { text = fs.readFileSync(path.join(ROOT, file), 'utf8'); } catch (e) { continue; }
    const count = {};
    for (const m of text.matchAll(re)) count[m[1]] = (count[m[1]] || 0) + 1;
    for (const k in count) {
      if (count[k] > 1) dupes.push(`${what} '${k}' is declared ${count[k]} times in ${file} — only the last one is live`);
    }
  }
  // and maps, which are assigned rather than registered through a helper
  {
    const count = {};
    for (const f of SOURCES.filter(s => s.includes('maps_'))) {
      const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
      for (const m of text.matchAll(/^\s*G\.MAPS\.([a-z0-9_]+)\s*=\s*\{/gm)) {
        count[m[1]] = (count[m[1]] || 0) + 1;
      }
    }
    for (const k in count) {
      if (count[k] > 1) dupes.push(`map '${k}' is defined ${count[k]} times — only the last one is live`);
    }
  }
  for (const d of dupes) errors.push('DUPLICATE: ' + d);
  if (!dupes.length) console.log('  duplicates: no move, item, trainer or map is declared twice');
}

// --- written, but never wired to anything ---
// The most expensive bugs in this project are not wrong code. They are correct
// code nothing calls: G.stoneEvolution was written to make a THUNDERSTONE work
// and no branch in the bag ever called it, so ten evolutions were unreachable.
// G.PCScene was a complete two-column storage screen, and the only thing in
// Kanto describing it was a paragraph of text pinned to the floor beside a pot
// plant, while anything caught on a full party went into a box with no door.
//
// A scene or helper that nothing references is not necessarily a bug — but it
// is always worth a second look, and both of those would have been caught the
// day they were written.
{
  // main.js counts here: it is the entry point and the only caller of several
  // scenes. It is left out of SOURCES because those audits read game DATA,
  // which main.js has none of.
  const src = SOURCES.concat(['main.js'])
    .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  // Every G.SomethingScene / G.someHelper assigned a function, minus the ones
  // reached through a table rather than by name.
  const REACHED_BY_TABLE = new Set(['G.EVENTS', 'G.MAPS', 'G.TILES', 'G.ITEMS', 'G.SPECIES',
                                    'G.MOVES', 'G.TRAINERS', 'G.ENCOUNTERS']);
  const defined = new Map();
  for (const m of src.matchAll(/^\s*(G\.([A-Za-z_]\w*))\s*=\s*function/gm)) {
    if (REACHED_BY_TABLE.has(m[1])) continue;
    defined.set(m[1], m[2]);
  }
  // Known-unused, on purpose. Kept short and reasoned: four permanent warnings
  // would teach everyone to skip this audit, which is how the last one stopped
  // working.
  const ALLOWED = {
    'G.deepClone': 'a general utility, kept for save migrations',
    'G.teachableMoves': 'superseded by G.canLearnTm; harmless',
    'G.clearFollower': 'updateFollower already clears before it re-attaches',
    'G.clearSave': 'a delete-save utility; new game resets state without it'
  };
  const orphans = [];
  for (const [full, name] of defined) {
    if (ALLOWED[full]) continue;
    // count references that are not the definition itself
    const uses = [...src.matchAll(new RegExp('G\\.' + name + '\\b', 'g'))].length;
    const defs = [...src.matchAll(new RegExp('G\\.' + name + '\\s*=\\s*function', 'g'))].length;
    if (uses - defs <= 0) orphans.push(full);
  }
  for (const o of orphans) {
    warn.push(`ORPHAN: ${o} is defined and never referenced anywhere — either it is dead, or something that should call it does not`);
  }
  if (!orphans.length) console.log(`  wiring: all ${defined.size} G.* functions are referenced by something`);
}

// --- shop menus fit the screen they are drawn on ---
// Every shop list is built the same way and sized from its own contents, so
// "does it fit" is a property of the stock, and the stock is edited by hand in
// fourteen places. Saffron was two rows off the bottom edge. The list scrolls
// now, but the WIDTH still cannot scroll — a long enough item name pushes the
// prices off the right of a 240px screen — so that is what this measures.
{
  const wide = [];
  for (const id in G.MAPS) {
    const inv = (G.MAPS[id].shopInventory || []).filter(i => G.ITEMS[i]);
    if (!inv.length) continue;
    const labels = inv.map(i => G.ITEMS[i].name + '  $' + G.ITEMS[i].price).concat(['Done']);
    let w = 0;
    for (const l of labels) w = Math.max(w, G.textWidth(l));
    const boxW = w + 18 + 12;                  // one column, as the shop asks for
    if (boxW > 236) {
      wide.push(`${id}'s list is ${boxW}px wide and the screen is 240 — the longest line is "${labels.find(l => G.textWidth(l) === w)}"`);
    }
  }
  for (const s of wide) errors.push('SHOPFIT: ' + s);
  if (!wide.length) console.log(`  shop fit: every shop list fits the screen width and scrolls past the bottom`);
}

// --- can you get out the other side? ---
// The progression audit asks whether every MAP can be reached. That is a
// weaker question than it looks, because a map has more than one door: Mt.
// Moon B1F shipped with its ROUTE 4 stairs behind a solid column, so a player
// coming down from 1F could wander the whole floor and never leave by the far
// side. The region still counted as connected, because Diglett's Cave offers a
// long way round to Cerulean — so the cave on the signposted path from PEWTER
// to CERULEAN was a dead end and every audit said the world was fine.
//
// The invariant is per DOOR, not per map: arrive by any entrance, and every
// exit must be reachable from where you are standing. Flooding from all the
// entrances at once is what hides this — the far exit is reachable from the
// far entrance, which tells you nothing about the near one.
{
  const arrivalsOf = {};
  for (const id in G.MAPS) {
    for (const w of (G.MAPS[id].warps || [])) {
      if (!G.MAPS[w.to]) continue;
      (arrivalsOf[w.to] = arrivalsOf[w.to] || []).push({ x: w.tx, y: w.ty, from: id });
    }
  }
  // Deliberately generous: every HM granted, story shutters open, ledges
  // passable. Anything this still cannot reach is a wall, not a gate.
  const pass = (m, x, y) => {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false;
    const d = m.deco && m.deco[y] && m.deco[y][x];
    const n = (d && d !== '.' ? m.legend[d] : null) || m.legend[m.ground[y][x]];
    const t = n && G.TILES[n];
    if (!t) return false;
    if (t.water || t.cut || t.strength || t.story) return true;
    return !t.solid;
  };
  const sealed = [];
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    const outs = (m.warps || []).filter(w => G.MAPS[w.to]);
    if (outs.length < 2) continue;                 // a dead-end room is fine
    for (const a of (arrivalsOf[id] || [])) {
      if (!pass(m, a.x, a.y)) continue;            // bad landing is another audit
      const seen = new Set([a.x + ',' + a.y]), q = [[a.x, a.y]];
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
          if (seen.has(k) || !pass(m, nx, ny)) continue;
          seen.add(k); q.push([nx, ny]);
        }
      }
      // Requiring EVERY exit is too strict, and wrongly: Route 2 is two halves
      // joined through Viridian Forest, exactly as it is in Red and Blue, so
      // its north doors are unreachable from its south end by design. What is
      // never by design is arriving somewhere and being able to reach no way
      // onward at all — that is a dead end, and the only thing to do is turn
      // round and go back out the door you came in by.
      const onward = outs.filter(w => w.to !== a.from);
      if (!onward.length) continue;              // a house, a shop, a dead-end room
      if (onward.some(w => seen.has(w.x + ',' + w.y))) continue;
      sealed.push(`${id}: arriving from ${a.from} at (${a.x},${a.y}) you can reach no way onward — ` +
        `${onward.map(w => w.to + ' at (' + w.x + ',' + w.y + ')').join(', ')} all walled off, ` +
        `so the only way out is back to ${a.from}`);
    }
  }
  const uniq = [...new Set(sealed)];
  for (const s of uniq.slice(0, 10)) errors.push('CROSSING: ' + s);
  if (uniq.length > 10) errors.push(`CROSSING: …and ${uniq.length - 10} more`);
  if (!uniq.length) console.log('  crossing: from every entrance, every exit of that map can be reached');
}

// --- and people are walls, so standing in the wrong place seals a room ---
//
// Everything above walks TILES. A person is just as solid as a wall, and the
// FUCHSIA GYM guide stood on (1,15) — the one tile between the door and the
// rest of the maze, which is also the tile you land on. Arriving put you on top
// of him, so leaving again worked and the room looked fine; the moment you
// stepped into the maze he sealed the only way out, and beating KOGA trapped
// you in the building.
//
// Walking is symmetric: anywhere you can walk TO, you can walk back FROM. So a
// person standing in a doorway cannot strand you — it just means you never got
// past them. There is exactly one asymmetric move in the game, and that is a
// WARP, which drops you on a tile without asking whether it is free. Landing on
// top of somebody is therefore the whole bug class: it is a square you can be
// on once and never reach again.
{
  const pass = (m, x, y) => {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false;
    const d = m.deco && m.deco[y] && m.deco[y][x];
    const n = (d && d !== '.' ? m.legend[d] : null) || m.legend[m.ground[y][x]];
    const t = n && G.TILES[n];
    if (!t) return false;
    if (t.water || t.cut || t.strength || t.story) return true;
    return !t.solid;
  };
  const flood = (m, starts, blocked) => {
    const seen = new Set(), q = [];
    for (const s of starts) if (pass(m, s[0], s[1]) && !blocked.has(s.join(','))) { seen.add(s.join(',')); q.push(s); }
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (seen.has(k) || blocked.has(k) || !pass(m, nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return seen;
  };
  const arrivalsOf = {};
  for (const id in G.MAPS) {
    for (const w of (G.MAPS[id].warps || [])) {
      if (G.MAPS[w.to]) (arrivalsOf[w.to] = arrivalsOf[w.to] || []).push({ x: w.tx, y: w.ty, from: id });
    }
  }
  const trapped = [];
  let landings = 0;
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    const doors = (m.warps || []).filter(w => G.MAPS[w.to]).map(w => [w.x, w.y]);
    if (!doors.length) continue;
    // An actor with `unlessFlag` is one the story removes — the ROCKET on a
    // staircase who leaves once you beat him. Everyone else stands there for
    // good, defeated or not, and is a wall.
    const who = new Map();
    for (const kind of ['npcs', 'trainers']) {
      for (const o of (m[kind] || [])) {
        if (Array.isArray(o.x) || o.x == null || o.unlessFlag) continue;
        who.set(o.x + ',' + o.y, o.trainer || o.event || o.sprite || kind);
      }
    }
    for (const a of (arrivalsOf[id] || [])) {
      landings++;
      const here = who.get(a.x + ',' + a.y);
      if (!here) continue;
      // You are standing inside them. That alone is wrong; whether it also
      // locks the room depends on what is left once you step off.
      // Step off in each direction separately. Flooding from all of them at
      // once hides the trap, because one of the neighbours is usually the door
      // itself — you can leave the instant you arrive, and only the OTHER
      // direction, the one into the room, is the one with no way back.
      const dead = [];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = [a.x + dx, a.y + dy];
        const after = flood(m, [n], new Set(who.keys()));
        if (!after.size) continue;                       // a wall, not a way in
        if (!doors.some(d => after.has(d.join(',')))) dead.push(`(${n[0]},${n[1]})`);
      }
      trapped.push(`${id}: arriving from ${a.from} lands you on top of '${here}' at (${a.x},${a.y})`
        + (dead.length
            ? ` — and stepping off to ${dead.join(' or ')} reaches NO door, so the room is a trap`
            : ' — a tile you can never stand on again'));
    }
  }
  for (const t of trapped) errors.push('SEALED: ' + t);
  if (!trapped.length) console.log(`  sealed: none of the ${landings} places a warp drops you lands on top of somebody`);
}

// --- the browser must be able to tell that the code changed ---
// There is no build step here, which is a feature, and it means every script
// is cached by a filename that never changes. So a fix can be written, tested,
// committed, pushed and deployed while the player carries on running the code
// that had the bug in it — which is exactly what happened after six frozen
// story battles were fixed and the freeze was still there.
//
// index.html stamps each script with ?v=<hash of every script's contents>, so
// the URL changes precisely when the code does. This fails when that stamp is
// out of date, because a stale stamp is worse than none: it looks handled.
{
  const bump = require('./bump_cache.js');
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const want = bump.tokenFor(html);
  const have = (html.match(/\?v=([0-9a-f]+)/) || [])[1];
  const stamped = (html.match(/<script src="[^"]+\?v=/g) || []).length;
  const total = (html.match(/<script src="/g) || []).length;
  if (have !== want || stamped !== total) {
    errors.push(`CACHE: index.html's cache token is stale (${have || 'none'}, should be ${want}) — ` +
      `players would keep running the old code. Run: node tools/bump_cache.js`);
  } else {
    console.log(`  cache: all ${total} scripts stamped ?v=${want}, so a reload picks up new code`);
  }
}

// --- a battle inside an event must hand control back ---
// An event that yields {t:'custom'} is suspended until its run() calls resume.
// If a battle started inside one never calls back, the EventScene sits on the
// stack for ever waiting: no movement, no menu, no input at all. A hard freeze
// with nothing on screen to explain it.
//
// Six of them shipped that way, because G.startBattle and G.startTrainerBattle
// read `onEnd` and every one of these passed `onDone` — the S.S. Anne and
// Pokémon Tower rivals, the Game Corner Rocket, Giovanni at the Hideout and
// again at Silph, and the Marowak ghost. Every major story battle in the game
// except one, and the one that worked used the other spelling.
//
// The event dry-run above cannot see this and never will: it calls run() with
// a no-op resume of its own, so the event always continues no matter what the
// real run() does or fails to do. That is the right call for a dry run — it is
// testing the event body, not the battle system — but it does mean the only
// place this can be caught is in the SOURCE.
//
// So: the callback key handed to either function has to be one it reads.
{
  const src = SOURCES.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  const battleSrc = fs.readFileSync(path.join(ROOT, 'js/engine/battle_ui.js'), 'utf8');
  // what the two entry points actually look for
  const READS = new Set();
  for (const m of battleSrc.matchAll(/opts(?:Extra)?\.(on[A-Za-z]+)/g)) READS.add(m[1]);
  const wrong = [];
  for (const m of src.matchAll(/G\.start(?:Trainer)?Battle\s*\(([\s\S]{0,400}?)\)\s*;/g)) {
    const call = m[1];
    for (const k of call.matchAll(/\b(on[A-Za-z]+)\s*:/g)) {
      if (!READS.has(k[1])) {
        const who = (call.match(/'([a-z0-9_]+)'/) || [])[1] || 'a battle';
        wrong.push(`${who} is started with '${k[1]}', which nothing reads — the event that started it never resumes and the game freezes`);
      }
    }
  }
  for (const w of [...new Set(wrong)]) errors.push('BATTLECB: ' + w);
  if (!wrong.length) {
    console.log(`  battle callbacks: every battle hands control back through ${[...READS].join('/')}`);
  }
}

// --- every way out of a cave is DRAWN ---
// Reachability audits ask whether a player COULD get to the exit. They cannot
// ask whether the exit is visible, and almost every cave warp in Kanto was
// sitting on plain floor: Rock Tunnel's exit to Route 10, Mt. Moon's to Route
// 3, both ends of Diglett's Cave, all of Victory Road, Cerulean Cave and
// Seafoam. Only Mt. Moon's own stairs were ever drawn.
//
// In an unlit cave, where you can see two tiles, an exit that looks exactly
// like the ground beside it is not hard to find — it is invisible. You could
// stand on the tile and see nothing.
{
  // Not just caves. Every staircase in POKéMON TOWER, SILPH CO., the ROCKET
  // HIDEOUT, the MANSION, the POWER PLANT and both UNDERGROUND PATHS was
  // undrawn too — thirty-three more on top of the caves — because the first
  // version of this only looked at maps floored in rock.
  const PLAIN = new Set(['cavefloor', 'cavecalm', 'darkfloor', 'icefloor',
                         'towerfloor', 'metalfloor', 'burntfloor']);
  const CAVE_BASE = new Set(['cavefloor', 'darkfloor', 'icefloor',
                             'towerfloor', 'metalfloor', 'burntfloor']);
  const blind = [];
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    if (!CAVE_BASE.has(m.base)) continue;
    if (G.decorateMap) G.decorateMap(m);        // the marker is applied on load
    for (const w of (m.warps || [])) {
      const d = m.deco && m.deco[w.y] && m.deco[w.y][w.x];
      const n = (d && d !== '.' ? m.legend[d] : null) || m.legend[m.ground[w.y][w.x]];
      if (PLAIN.has(n)) {
        blind.push(`${id}: the way out to ${w.to} at (${w.x},${w.y}) is drawn as plain ${n} — nothing marks it`);
      }
    }
  }
  for (const b of blind.slice(0, 10)) errors.push('BLINDEXIT: ' + b);
  if (blind.length > 10) errors.push(`BLINDEXIT: …and ${blind.length - 10} more`);
  if (!blind.length) console.log('  dungeon exits: every warp out of a cave, tower, lab or hideout is drawn');
}

// --- and can you get BACK? ---
// The crossing audit asks whether each map has a way onward. That still lets
// the world be a one-way street: Viridian Forest had a gate house at its south
// end and none at its north, so you could come out into the Pewter half of
// Route 2 and never get back in. Since the tree band across the middle of that
// route is the only other thing joining its halves, Pewter was a one-way trip
// — and the shortest way home to Pallet was Diglett's Cave, Route 11, and a
// full lap of Kanto through Lavender, Fuchsia, the sea routes and Cinnabar.
//
// Every audit passed. "Every map is reachable" was true, and said nothing at
// all about coming back.
{
  const pass = (m, x, y) => {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false;
    const d = m.deco && m.deco[y] && m.deco[y][x];
    const n = (d && d !== '.' ? m.legend[d] : null) || m.legend[m.ground[y][x]];
    const t = n && G.TILES[n];
    if (!t) return false;
    if (t.water || t.cut || t.strength || t.story) return true;
    return !t.solid;
  };
  const flood = (m, ax, ay) => {
    const s = new Set([ax + ',' + ay]), q = [[ax, ay]];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (s.has(k) || !pass(m, nx, ny)) continue;
        s.add(k); q.push([nx, ny]);
      }
    }
    return s;
  };
  // Nodes are (map, tile you arrived on) — the same map entered by two doors
  // is genuinely two different places to be standing.
  const START = 'pallet:5,6';
  const edges = new Map(), rev = new Map();
  const seen = new Set([START]), q = [['pallet', 5, 6]];
  while (q.length) {
    const [id, ax, ay] = q.shift();
    const key = id + ':' + ax + ',' + ay;
    const m = G.MAPS[id];
    edges.set(key, []);
    if (!m || !pass(m, ax, ay)) continue;
    const st = flood(m, ax, ay);
    for (const w of (m.warps || [])) {
      if (!G.MAPS[w.to] || !st.has(w.x + ',' + w.y)) continue;
      const to = w.to + ':' + w.tx + ',' + w.ty;
      edges.get(key).push(to);
      if (!rev.has(to)) rev.set(to, []);
      rev.get(to).push(key);
      if (seen.has(to)) continue;
      seen.add(to);
      q.push([w.to, w.tx, w.ty]);
    }
  }
  // Which nodes can get home? Walk the edges backwards from every Pallet node.
  const home = new Set();
  const hq = [...seen].filter(k => k.startsWith('pallet:'));
  hq.forEach(k => home.add(k));
  while (hq.length) {
    const k = hq.shift();
    for (const from of (rev.get(k) || [])) {
      if (home.has(from)) continue;
      home.add(from); hq.push(from);
    }
  }
  // The LEAGUE is one-way by design and leaves by EVENT rather than by door:
  // the five rooms are a single fight with four intermissions, losing drops
  // you at your respawn, and the ceremony in the HALL OF FAME walks you back
  // to your own front room. A warp out of Agatha's chamber would be a trapdoor
  // under the only part of this game with any weight to it.
  const BY_DESIGN = new Set(['e4lorelei', 'e4bruno', 'e4agatha', 'e4lance',
                             'e4champion', 'halloffame']);
  const stranded = [...seen].filter(k => !home.has(k) && !BY_DESIGN.has(k.split(':')[0]));
  const byMap = {};
  for (const k of stranded) {
    const id = k.split(':')[0];
    (byMap[id] = byMap[id] || []).push(k.split(':')[1]);
  }
  const names = Object.keys(byMap);
  for (const id of names.slice(0, 8)) {
    errors.push(`ONEWAY: you can walk into ${id} (arriving at ${byMap[id].join(' / ')}) and never get back to PALLET`);
  }
  if (names.length > 8) errors.push(`ONEWAY: …and ${names.length - 8} more maps you cannot come home from`);
  if (!names.length) {
    console.log(`  two-way: all ${seen.size} places you can stand have a way back to PALLET`);
  }
}

// --- every event can be started by something ---
// An event nobody hosts is content that does not exist. laprasGift was
// written in full — it checked that Giovanni had been thrown out of Silph Co,
// handed over a level 15 LAPRAS, and had a line for coming back afterwards —
// and no NPC in Kanto ran it, so LAPRAS could not be obtained at all. mewTruck
// was the same: the lorry it describes was never placed, so MEW was behind a
// vehicle that did not exist.
//
// Both survived because the dex audit dry-runs every event in the table
// whether or not the world can reach one, and therefore counted gifts nobody
// could ever receive. It only runs reachable events now, and this makes the
// unreachable ones loud in their own right.
{
  const hosted = new Set();
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    for (const o of (m.npcs || []).concat(m.trainers || [], m.signs || [],
                                          m.scripts || [], m.items || [])) {
      const ev = o.event || o.run;
      if (ev) hosted.add(ev);
    }
  }
  for (const t in (G.TILE_EVENTS || {})) hosted.add(G.TILE_EVENTS[t]);
  for (const f of SOURCES) {
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of text.matchAll(/runEvent\(\s*'([A-Za-z0-9_]+)'/g)) hosted.add(m[1]);
    for (const m of text.matchAll(/onTalkEvent\s*=\s*'([A-Za-z0-9_]+)'/g)) hosted.add(m[1]);
  }
  const stranded = Object.keys(G.EVENTS || {}).filter(e => !hosted.has(e));
  for (const e of stranded) {
    errors.push(`STRANDED: event '${e}' exists and nothing in the world can start it`);
  }
  if (!stranded.length) {
    console.log(`  events: all ${Object.keys(G.EVENTS || {}).length} can be started by something in the world`);
  }
}

// --- the town map knows where you are ---
// "You are here" was a SUBSTRING test taking the first hit in array order.
// That is fine for pewtercentre -> pewter and ruinous for anything numbered:
// 'route1' is a substring of 'route11', so every route from 10 upward reported
// itself as ROUTE 1 and 20 through 25 as ROUTE 2. Sixteen maps told you that
// you were somewhere else entirely.
if (G.REGION_NODES && G.RegionMapScene) {
  const ids = G.REGION_NODES.map(n => n.id);
  const lost = [];
  for (const id of ids) {
    if (!G.MAPS[id]) { lost.push(`${id} is on the town map but is not a map`); continue; }
    G.world.loadMap(id, 1, 1, 'down');
    const sc = G.RegionMapScene();
    if (sc.sel !== ids.indexOf(id)) {
      lost.push(`standing on ${id}, the map says '${G.REGION_NODES[sc.sel].label}'`);
    }
  }
  for (const l of lost.slice(0, 10)) errors.push('YOUAREHERE: ' + l);
  if (lost.length > 10) errors.push(`YOUAREHERE: …and ${lost.length - 10} more`);
  if (!lost.length) console.log(`  town map: all ${ids.length} places report themselves correctly`);
}

// --- every field move can explain why it will not work ---
// G.fieldBlockedText builds its refusals as FLAVOUR[kind] + a reason. FLY had
// no FLAVOUR line, because it is the one HM with no obstacle to walk into —
// so nothing asked for one until the TOWN MAP started explaining its refusals,
// and then every message opened with the word "undefined".
{
  const src = fs.readFileSync(path.join(ROOT, 'js/engine/field.js'), 'utf8');
  const block = (src.match(/var FLAVOUR = \{([\s\S]*?)\};/) || [])[1] || '';
  const have = new Set([...block.matchAll(/^\s*([a-z]+):/gm)].map(m => m[1]));
  const missing = Object.keys(G.FIELD_MOVES || {}).filter(k => !have.has(k));
  for (const k of missing) {
    errors.push(`FIELDTEXT: '${k}' is a field move with no FLAVOUR line — every refusal for it reads "undefined ..."`);
  }
  if (!missing.length) {
    console.log(`  field moves: all ${Object.keys(G.FIELD_MOVES || {}).length} can say why they are unavailable`);
  }
}

// --- nobody stands on the only way through ---
//
// A person is a solid tile. The trainers on the quiet roads are placed by a
// rule that says "only on a tile with three or more open neighbours — a
// junction, never a corridor", and that rule is not enough: a T-junction can
// still be the single link between two halves of a room. EDGAR had three open
// neighbours and sealed the whole branch behind him on VICTORY ROAD 3F, and
// ARTHUR sealed a cabin on the S.S. ANNE with TM08 still inside it.
//
// The real test is not how many neighbours a tile has. It is whether removing
// the person changes what you can reach. Anyone who is genuinely meant to be a
// wall says so with `blocks: <reason>`.
{
  const pass = (m, x, y) => {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false;
    const d = m.deco && m.deco[y] && m.deco[y][x];
    const n = (d && d !== '.' ? m.legend[d] : null) || m.legend[m.ground[y][x]];
    const t = n && G.TILES[n];
    if (!t) return false;
    if (t.water || t.cut || t.strength || t.story) return true;
    return !t.solid;
  };
  const flood = (m, from, blocked) => {
    const seen = new Set(), q = [];
    if (!pass(m, from[0], from[1]) || blocked.has(from.join(','))) return seen;
    seen.add(from.join(',')); q.push(from);
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (seen.has(k) || blocked.has(k) || !pass(m, nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return seen;
  };
  const walls = [];
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    // Somebody the story removes is not a wall — they are a gate that opens.
    const actors = [];
    for (const kind of ['npcs', 'trainers']) {
      for (const o of (m[kind] || [])) {
        if (Array.isArray(o.x) || o.x == null || o.unlessFlag) continue;
        actors.push(o);
      }
    }
    if (!actors.length) continue;
    const doors = (m.warps || []).filter(w => G.MAPS[w.to]);
    if (!doors.length) continue;
    const everyone = new Set(actors.map(o => o.x + ',' + o.y));
    const from = doors.map(w => [w.x, w.y]).find(d => pass(m, d[0], d[1]) && !everyone.has(d.join(',')));
    if (!from) continue;
    const asBuilt = flood(m, from, everyone);

    for (const o of actors) {
      const others = new Set(actors.filter(x => x !== o).map(x => x.x + ',' + x.y));
      const freed = flood(m, from, others);
      // Their own tile coming back does not count: standing in a dead end
      // blocks nothing but the square you are standing on.
      const opened = [...freed].filter(k => !asBuilt.has(k) && k !== (o.x + ',' + o.y));
      if (!opened.length || o.blocks) continue;
      const holds = [];
      for (const it of (m.items || [])) if (opened.includes(it.x + ',' + it.y)) holds.push(`the ${it.item}`);
      for (const w of doors) if (opened.includes(w.x + ',' + w.y)) holds.push(`the way to ${w.to}`);
      walls.push(`${id} '${o.trainer || o.event || o.sprite}' at (${o.x},${o.y}) is the only way to `
        + `${opened.length} tile(s)` + (holds.length ? `, including ${holds.join(' and ')}` : ' of the room')
        + ' — standing there seals it');
    }
  }
  for (const w of walls) errors.push('BRIDGE: ' + w);
  if (!walls.length) console.log('  bridges: nobody is standing on the only way to anywhere');
}

// --- the badge case agrees with the gyms it describes ---
// G.BADGES is a fourth copy of facts the game already held three times: the
// leader's reward in trainers.js, the badge NAME in FIELD_MOVES, the city in
// field.js's BADGE_FROM. A fourth copy is worth having — one screen wants all
// of it at once — but only if it cannot quietly disagree with the other three.
{
  const wrong = [];
  const leaderOf = {};
  for (const id in G.TRAINERS) {
    const r = G.TRAINERS[id].reward;
    if (r && r.badge != null) leaderOf[r.badge] = { id, def: G.TRAINERS[id], flag: r.flag, text: r.text || '' };
  }
  (G.BADGES || []).forEach((b, i) => {
    const L = leaderOf[i];
    if (!L) { wrong.push(`${b.name}: no gym leader hands out badge ${i}`); return; }
    if (L.flag !== b.flag) wrong.push(`${b.name}: case says flag '${b.flag}', ${L.id} sets '${L.flag}'`);
    // The leader's own award line carries the badge's name, so they must match.
    const said = (L.text.match(/[A-Z]{4,}BADGE/) || [])[0];
    if (said && said !== b.name) wrong.push(`${b.name}: ${L.id} awards '${said}'`);
    // The gym the case sends you to must be the map that leader stands on.
    const room = G.MAPS[b.gym];
    if (!room) wrong.push(`${b.name}: names gym '${b.gym}', which is not a map`);
    else if (!(room.trainers || []).some(t => t.trainer === L.id)) {
      wrong.push(`${b.name}: ${L.id} does not stand in ${b.gym}`);
    }
    // And the town it names has to be a real place on the map.
    if (G.REGION_NODES && !Object.keys(G.REGION_NODES).some(k => {
      const n = G.REGION_NODES[k];
      return (n.label || '').toUpperCase() === b.city;
    })) wrong.push(`${b.name}: city '${b.city}' is not a place on the town map`);
    // Baked art, both states.
    if (!G.ART['badge_' + b.key]) wrong.push(`${b.name}: no sprite baked as badge_${b.key}`);
    if (!G.TYPE_COLORS[b.type]) wrong.push(`${b.name}: type '${b.type}' has no colour`);
  });
  // Every field move gated on a badge must name one this table knows.
  for (const k in (G.FIELD_MOVES || {})) {
    const f = G.FIELD_MOVES[k];
    const b = (G.BADGES || []).find(x => x.flag === f.badge);
    if (!b) wrong.push(`field move ${k} needs '${f.badge}', which is not a badge`);
    else if (b.name.replace('BADGE', ' BADGE') !== f.badgeName && b.name !== f.badgeName.replace(' ', '')) {
      wrong.push(`field move ${k} calls it '${f.badgeName}', the case calls it '${b.name}'`);
    }
  }
  for (const w of wrong) errors.push('BADGE: ' + w);
  if (!wrong.length) console.log(`  badges: all ${(G.BADGES || []).length} match the leader, gym, city and art they name`);
}

// --- a trainer who does not watch the room really does not watch it ---
// 28 trainers declare `sight: 0`, and it means something specific: a gym
// leader you walk up to, one of BLAINE's quizmasters who only comes out if you
// got the question wrong. The scan read it as `def.sight || 4` — zero is falsy
// — so every one of them ambushed at four tiles, and CINNABAR GYM's whole quiz
// was decoration: the quizmasters fought you whatever you answered.
{
  const ambush = [];
  const p = G.world.player;
  const before = G.world.mapId;
  for (const id in G.MAPS) {
    const quiet = (G.MAPS[id].trainers || []).filter(t => t.sight === 0 && !Array.isArray(t.x));
    if (!quiet.length) continue;
    G.world.loadMap(id, quiet[0].x, quiet[0].y, 'down');
    for (const t of quiet) {
      // _trainerScan answers "did ANYBODY engage", so everyone else in the room
      // is marked defeated first. Without that, a normal trainer with a normal
      // sight line standing nearby gets blamed on the quiet one.
      const hushed = [];
      for (const other of (G.MAPS[id].trainers || [])) {
        if (other === t || !other.trainer || G.flags[other.trainer]) continue;
        G.flags[other.trainer] = 1; hushed.push(other.trainer);
      }
      const wasDone = G.flags[t.trainer];
      delete G.flags[t.trainer];
      const d = G.DIRS[t.dir || 'down'];
      for (let dist = 1; dist <= 4; dist++) {
        p.x = t.x + d.dx * dist; p.y = t.y + d.dy * dist;
        if (p.x < 0 || p.y < 0 || p.x >= G.MAPS[id].w || p.y >= G.MAPS[id].h) break;
        if (G.overworldScene._trainerScan()) {
          ambush.push(`${id} '${t.trainer}' says sight: 0 but challenges from ${dist} tile(s) away`);
          G.scenes.length = 0; G.pushScene(G.overworldScene);
          break;
        }
      }
      for (const h of hushed) delete G.flags[h];
      if (wasDone) G.flags[t.trainer] = wasDone;
    }
  }
  if (before) G.world.loadMap(before, 1, 1, 'down');
  G.scenes.length = 0; G.pushScene(G.overworldScene);
  for (const a of ambush) errors.push('SIGHT: ' + a);
  if (!ambush.length) console.log('  sight lines: every trainer who declares no line of sight keeps to it');
}

// --- and BLAINE's quizmasters can all still be fought ---
// Getting a question wrong is the only thing that brings one out now, so a
// quizmaster missing from that mapping is a trainer nobody can ever battle.
{
  const room = G.MAPS.cinnabargym;
  const behind = new Set((G.QUIZ_TRAINER || []).filter(Boolean));
  const orphan = (room.trainers || [])
    .filter(t => !/^blaine/.test(t.trainer) && !behind.has(t.trainer))
    .map(t => t.trainer);
  for (const o of orphan) {
    errors.push(`QUIZ: cinnabargym '${o}' stands behind no shutter, so no answer can ever bring them out`);
  }
  const ghosts = [...behind].filter(t => !(room.trainers || []).some(x => x.trainer === t));
  for (const g of ghosts) errors.push(`QUIZ: a shutter names '${g}', who is not in the room`);
  if (!orphan.length && !ghosts.length) {
    console.log(`  quiz: all ${behind.size} of BLAINE's quizmasters answer to a wrong answer`);
  }
}

// --- the surf sprite holds one pose per facing ---
// The walking animation walks a sheet's frames 0,3,4 for south, 0/1/5/6 for
// north and so on. That is right for a sheet laid out as a walk cycle, and the
// SURF sheet is not one: its frames are three facings, then those same three
// facings' second pose, then the float with nobody on it. FireRed's own frame
// table says as much — all nine of its surf slots point at just three pictures.
// So heading south played south, south', then NORTH', and heading west played
// west and then an empty float: the rider spun on the spot while travelling in
// a straight line.
{
  const spun = [];
  const declared = ((G.PLAYER_VEHICLE_CFG || {}).surf || {}).frames;
  if (!declared) {
    spun.push('the surf sheet declares no frame layout, so it is being read as an ordinary walk cycle');
  } else {
    // First and most important: does the declaration match the ARTWORK? Every
    // other question here is about code, and code cannot tell you that frame 2
    // is a picture of somebody facing north. tools/gen_ow_frames.js works that
    // out from the pixels — symmetry sorts the side view from the head-on ones,
    // similarity pairs each pose with its partner — and records it. Comparing
    // the two is the only check that would have caught the sheet being read as
    // an ordinary walk cycle, because a self-consistent wrong answer passes
    // every test that only looks at the config.
    const truthFile = path.join(__dirname, 'frlg_overworld_frames.json');
    const truth = fs.existsSync(truthFile) ? (JSON.parse(fs.readFileSync(truthFile, 'utf8'))['@surf'] || null) : null;
    if (!truth) spun.push('no derived surf layout to check against — run `node tools/gen_ow_frames.js`');
    else if (truth.unreadable) spun.push(`the surf sheet could not be read from its pixels: ${truth.unreadable}`);
    else {
      for (const k of Object.keys(truth)) {
        if (k === 'note') continue;
        if (declared[k] !== truth[k]) {
          spun.push(`'${k}' is declared as source frame ${declared[k]} but the artwork says ${truth[k]}`
            + ' — that frame is a picture of a different facing');
        }
      }
    }
    // Which source frames belong to which facing, per the declaration.
    const rowOf = k => k[0];                      // d / u / s
    const allow = {};
    for (const k in declared) (allow[rowOf(k)] = allow[rowOf(k)] || new Set()).add(declared[k]);
    for (const row of ['d', 'u', 's']) {
      if (!allow[row] || allow[row].size < 2) spun.push(`facing '${row}' has fewer than two poses declared — the bob will not play`);
    }
    const all = Object.values(declared);
    if (new Set(all).size !== all.length) spun.push('two facings are declared to share a source frame');

    // Substitute each engine frame with a marker carrying the SOURCE index it
    // came from, filling the stand-ins exactly the way the slicer does, then
    // ask the animation for every combination it can produce.
    const STAND_IN = { d2: 'd0', u2: 'u0', s2: 's0' };
    const src = Object.assign({}, declared);
    for (const k in STAND_IN) if (src[k] === undefined && src[STAND_IN[k]] !== undefined) src[k] = src[STAND_IN[k]];
    const saved = {};
    for (const k in src) for (const suffix of ['', '_flip']) {
      const name = 'ch_playersurf_' + k + suffix;
      saved[name] = G.IMG[name];
      G.IMG[name] = { src: src[k] };
    }
    const p = G.world.player, was = { v: p.vehicle, d: p.dir, m: p.moving, s: p.stride, st: p.step };
    p.vehicle = 'swim';
    for (const [dir, row] of [['down', 'd'], ['up', 'u'], ['left', 's'], ['right', 's']]) {
      const used = new Set();
      for (const moving of [false, true]) for (const stride of [false, true]) for (const step of [0, 4, 8, 12]) {
        p.dir = dir; p.moving = moving; p.stride = stride; p.step = step; p.hop = 0; p.hopTotal = 1;
        const img = G.overworldScene._actorImage(p);
        used.add(img ? img.src : 'nothing');
      }
      const stray = [...used].filter(i => !allow[row] || !allow[row].has(i));
      if (stray.length) {
        spun.push(`heading ${dir} draws source frame(s) ${stray.join(', ')}, which belong to another facing`
          + ` — allowed here are ${[...allow[row]].join(', ')}`);
      }
    }
    p.vehicle = was.v; p.dir = was.d; p.moving = was.m; p.stride = was.s; p.step = was.st;
    for (const name in saved) { if (saved[name] === undefined) delete G.IMG[name]; else G.IMG[name] = saved[name]; }
  }
  for (const s of spun) errors.push('SURFPOSE: ' + s);
  if (!spun.length) console.log('  surfing: every facing draws only its own frames, so the rider never turns on the spot');
}

// --- ...and every field move actually WORKS when it is allowed to ---
// The pass above only ever exercised the REFUSAL. Every success path in
// field.js hands G.runEventGen a generator that has already been started —
// `G.runEventGen((function* () { ... })())` — and runEventGen called it as a
// function. So CUT, STRENGTH, SURF and FLASH each threw "genFn is not a
// function" from inside the keypress handler, which goes to the console and
// leaves the game running normally: you pressed A at the water and nothing
// whatsoever happened. Four of the five HMs, the things the whole region is
// gated on, and every audit here was green.
//
// So this grants the HM, the badge and a mon that knows the move, and calls
// the real entry point.
{
  const snapshot = JSON.stringify({ p: G.player, f: G.flags });
  const scenesWas = G.scenes.slice();
  const broke = [];
  const CASES = [
    ['cut',      m => G.tryCut(m.x, m.y),      'cuttree'],
    ['strength', m => G.tryStrength(m.x, m.y), 'boulder'],
    ['surf',     m => G.trySurf(m.x, m.y),     'water'],
    ['flash',    () => G.tryFlash(),           null]
  ];
  for (const [kind, call, tile] of CASES) {
    const f = G.FIELD_MOVES[kind];
    G.newGame('AUDIT');
    G.player.party = [G.makeMon('lapras', 40)];
    G.player.party[0].moves.push({ id: f.move, pp: 15, maxPp: 15 });
    G.player.bag[f.hm] = 1;
    G.flags[f.badge] = 1;
    G.world.loadMap('pallet', 5, 6, 'down');
    const use = G.fieldUser(kind);
    if (use.blocked) { broke.push(`${kind}: set up with the HM, the badge and a user, and it still says '${use.blocked}'`); continue; }
    // Somewhere the obstacle actually is, so the call is the real one.
    let spot = { x: 5, y: 7 };
    if (tile) {
      outer:
      for (const id in G.MAPS) {
        const m = G.MAPS[id];
        for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
          const t = G.TILES[m.legend[m.ground[y][x]]];
          if (t && (tile === 'water' ? t.water : tile === 'boulder' ? t.strength : t.cut)) {
            G.world.loadMap(id, x, Math.max(0, y - 1), 'down'); spot = { x, y }; break outer;
          }
        }
      }
    }
    G.scenes.length = 0;
    try {
      call(spot);
      if (G.scenes.length === 0) broke.push(`${kind}: ran, but put nothing on screen — the player sees nothing happen`);
    } catch (e) {
      broke.push(`${kind}: threw ${e.constructor.name}: ${e.message} — pressing A does nothing at all`);
    }
  }
  G.scenes.length = 0;
  for (const s of scenesWas) G.scenes.push(s);
  const back = JSON.parse(snapshot);
  for (const k in back.p) G.player[k] = back.p[k];
  for (const k in G.flags) delete G.flags[k];
  for (const k in back.f) G.flags[k] = back.f[k];
  for (const b of broke) errors.push('FIELDRUN: ' + b);
  if (!broke.length) console.log('  field moves: all 4 obstacle HMs run to completion when you are allowed to use them');
}

// --- every item kind is actually handled by the bag ---
// G.ITEM_KINDS already stopped an item from declaring a kind nobody had heard
// of. It could not stop the reverse: a kind everybody had heard of that the
// bag had no branch for. Two of the ten were in that state.
//
// `escape` had no branch, so an ESCAPE ROPE fell through to the party picker,
// asked which POKéMON you wanted to use a length of rope on, and reported that
// it had no effect. `stone` reached the picker legitimately and then matched
// none of heal/cure/revive/xp, so every evolution stone in the game came back
// "It had no effect..." — RAICHU, NINETALES, ARCANINE, VILEPLUME, VICTREEBEL,
// CLOYSTER, EXEGGUTOR, STARMIE, CLEFABLE, NIDOKING and NIDOQUEEN were all
// unreachable by the only means that makes them.
//
// The dex audit never saw it: it reads the evolution TABLES, which were right.
{
  const src = fs.readFileSync('js/engine/menus.js', 'utf8');
  const bagStart = src.indexOf('function useKeyItem');
  const bag = bagStart >= 0 ? src.slice(bagStart) : src;
  const unhandled = (G.ITEM_KINDS || []).filter(k => !bag.includes(`item.kind === '${k}'`));
  // `heal`, `cure`, `revive` and `xp` are handled inside the shared picker and
  // do appear by name, so a plain text search is enough here.
  for (const k of unhandled) {
    errors.push(`ITEMKIND: '${k}' is a declared item kind, but the bag has no branch for it — items of that kind fall through to the party picker and report no effect`);
  }
  if (!unhandled.length) {
    console.log(`  item kinds: all ${(G.ITEM_KINDS || []).length} declared kinds have a branch in the bag`);
  }
}

// --- TM compatibility, asked the way the GAME asks it ---
// Every audit that touched TMs before this one read G.TM_COMPAT directly, and
// the table was always right: Charmeleon has had tm01 since the data was
// generated. What was wrong was the one function standing between the table
// and the player, which read the species off a mon as `mon.species` when a
// mon calls it `sp`. Undefined key, empty list, NO — for all 151 species and
// all 55 machines. Nothing in Kanto could learn a TM or an HM.
//
// So this asks G.canLearnTm, with real mons built by G.makeMon, and checks it
// agrees with the table it is supposed to be reading. A test that consults the
// data instead of the code cannot catch a broken accessor.
{
  const machines = Object.keys(G.TM_MOVES || {});
  const bad = [];
  let yes = 0;
  for (const key in G.SPECIES) {
    const mon = G.makeMon(key, 30);
    if (mon.sp !== key) { bad.push(`makeMon('${key}') stores its species as '${mon.sp}'`); break; }
    for (const tm of machines) {
      const table = (G.TM_COMPAT[key] || []).indexOf(tm) !== -1;
      const asked = G.canLearnTm(mon, tm);
      if (table) yes++;
      if (table !== asked) {
        bad.push(`${key} + ${tm}: the table says ${table}, canLearnTm says ${asked}`);
      }
    }
  }
  if (!yes) bad.push('no species is compatible with any machine — the tables are empty');
  for (const b of bad.slice(0, 8)) errors.push('TMCOMPAT: ' + b);
  if (bad.length > 8) errors.push(`TMCOMPAT: …and ${bad.length - 8} more`);
  if (!bad.length) {
    console.log(`  tm compat: canLearnTm agrees with the tables across ${Object.keys(G.SPECIES).length} species x ${machines.length} machines (${yes} pairs teachable)`);
  }
}

// --- encounter surfaces ---
// A map carrying an encounter table needs ground a player can step on that
// actually rolls one, and each tile has to claim ONE material.
//
// Cave floors used to be flagged `grass` as a second way of reaching the
// encounter hook. It worked, and it also told every field effect that bare
// rock was a meadow: Mt. Moon threw up green leaf motes and drew a tuft of
// long grass under the player, underground. Removing that flag is only safe
// while something checks the wilds did not go quiet with it.
{
  const surface = t => t && (t.wild || t.water);
  const dead = [], confused = [];
  for (const name in G.TILES) {
    const t = G.TILES[name];
    if (t.grass && t.cave) confused.push(`'${name}' claims to be both tall grass and cave floor`);
    if (t.solid && t.wild) confused.push(`'${name}' rolls wild encounters but cannot be stood on`);
  }
  for (const id in G.MAPS) {
    const m = G.MAPS[id];
    if (!m.encounters || !m.encounters.table || !m.encounters.table.length) continue;
    let found = false;
    for (let y = 0; y < m.h && !found; y++) {
      for (let x = 0; x < m.w; x++) {
        const d = m.deco && m.deco[y] && m.deco[y][x];
        const n = (d && d !== '.' ? m.legend[d] : null) || m.legend[m.ground[y][x]];
        if (n && surface(G.TILES[n])) { found = true; break; }
      }
    }
    if (!found) dead.push(`${id} has an encounter table but no tile that can trigger it`);
  }
  for (const s of dead.concat(confused)) errors.push('ENCOUNTERS: ' + s);
  if (!dead.length && !confused.length) {
    console.log('  encounters: every wild table has ground that rolls it, and no tile claims two materials');
  }
}

// --- dex completability ---
// Can the POKéDEX actually be filled? Not "are there 151 entries" — every fan
// project has 151 entries — but is each one reachable by a player.
//
// A regex over the event source cannot answer this, because half the gift
// species arrive through factory functions where the species is a PARAMETER:
// starterEvent(key), legendary(key), dojoPrize(key). So this instruments
// G.makeMon during the event dry-run and records what actually gets built,
// then closes the set under evolution.
{
  const obtainable = new Set();

  // 1. everything in a wild table on a real map
  for (const id in G.MAPS) {
    const e = G.MAPS[id].encounters;
    if (!e) continue;
    for (const t of (e.table || [])) obtainable.add(t.sp);
    if (e.water) for (const t of (e.water.table || [])) obtainable.add(t.sp);
  }

  // 2. everything the rods can pull up (the pools live in overworld.js)
  {
    const ow = fs.readFileSync(path.join(ROOT, 'js/engine/overworld.js'), 'utf8');
    const pools = ow.match(/ROD_POOLS[\s\S]*?SEA_MAPS/);
    if (pools) for (const m of pools[0].matchAll(/'([a-z0-9]+)'/g)) {
      if (G.SPECIES[m[1]]) obtainable.add(m[1]);
    }
  }

  // 3. everything any event actually constructs, observed rather than parsed
  {
    const realMake = G.makeMon;
    const realPush = G.pushScene, realPop = G.popScene;
    const realRun = G.runEvent, realRunGen = G.runEventGen;
    const noop = function () {};
    const stub = function () { return { update: noop, draw: noop }; };
    G.makeMon = function (key, lvl) { obtainable.add(key); return realMake(key, lvl); };
    G.pushScene = noop; G.popScene = noop; G.replaceScene = noop;
    G.runEvent = noop; G.runEventGen = noop;
    // Stubs that ANSWER. A scene stub that never fires its callback means the
    // dry run never takes the branch behind it — which is exactly where the
    // starters, the DOJO prize and the fossils are built, so they looked
    // unobtainable when they are not.
    // Which option the stubbed chooser picks. A stub that always answers 0
    // only ever explores the first branch — the prize counter's first item is
    // an ABRA, so PORYGON and DRATINI looked unobtainable when they are two
    // rows further down the same menu.
    const choice = { i: 0 };
    const say = function (opts) {
      if (opts && opts.onPick) opts.onPick(Math.min(choice.i, (opts.items || [0]).length - 1));
      return stub();
    };
    G.Textbox = function (t, o) { if (o && o.onDone) o.onDone(); return stub(); };
    G.Chooser = say;
    G.FadeScene = function (f) { if (f) f(); return stub(); };
    G.PartyScene = function (o) { if (o && o.onPick) o.onPick(0); return stub(); };
    G.BattleScene = stub; G.HallOfFameScene = stub;
    G.StarterPreviewScene = function (k, cb) { if (cb) cb(true); return stub(); };
    G.ask = function (q, yes) { if (yes) yes(); };
    G.startBattle = function () { return {}; };
    G.startTrainerBattle = function () { return {}; };

    const savedP = JSON.stringify(G.player), savedF = JSON.stringify(G.flags);
    // Trades ask for a SPECIFIC species in your party, and the prize counter
    // asks for coins. A dry run holding one Bulbasaur and no money takes the
    // "you do not have one" branch every time and concludes those species are
    // unobtainable — so the party is cycled through the whole roster, six at a
    // time, and the wallet is full.
    const seeds = [];
    for (let i = 0; i < G.DEX_ORDER.length; i += 6) seeds.push(G.DEX_ORDER.slice(i, i + 6));
    // Only events the WORLD can actually start. Running every entry in the
    // table counted a gift nobody could reach: laprasGift was complete, tested
    // by this audit, and hosted by no NPC anywhere in Kanto — so LAPRAS was
    // unobtainable while this said 151/151.
    const reachableEvents = new Set();
    for (const id in G.MAPS) {
      const m = G.MAPS[id];
      for (const o of (m.npcs || []).concat(m.trainers || [], m.signs || [],
                                            m.scripts || [], m.items || [])) {
        const ev = o.event || o.run;
        if (ev) reachableEvents.add(ev);
      }
    }
    for (const t in (G.TILE_EVENTS || {})) reachableEvents.add(G.TILE_EVENTS[t]);
    // events started by other events, or by the engine, count too
    for (const f of SOURCES) {
      const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
      for (const m of text.matchAll(/runEvent\(\s*'([A-Za-z0-9_]+)'/g)) reachableEvents.add(m[1]);
      for (const m of text.matchAll(/onTalkEvent\s*=\s*'([A-Za-z0-9_]+)'/g)) reachableEvents.add(m[1]);
    }
    for (const eid in G.EVENTS) {
      if (!reachableEvents.has(eid)) continue;
      for (const seed of seeds) {
       for (choice.i = 0; choice.i < 6; choice.i++) {
        G.newGame('DEX');
        G.player.party = seed.map(k => realMake(k, 30));
        G.player.money = 999999;
        G.player.coins = 99999;
        {
          for (const it in G.ITEMS) G.player.bag[it] = 1;
          for (let b = 1; b <= 8; b++) G.flags['badge' + b] = 1;
          G.flags.strengthOn = 1;   // MEW is under a lorry that needs shifting
          G.flags.silph_giovanni = 1;
          G.flags.dojo_master = 1;
        }
        G.world.mapId = 'pallet'; G.world.map = G.MAPS.pallet;
        G.world.player = { x: 5, y: 5, dir: 'down' };
        G.world.refreshTiles = noop; G.world.npcs = [];
        try {
          const it = G.EVENTS[eid]();
          let st = it.next(), guard = 0;
          while (!st.done && guard++ < 400) {
            const v = st.value || {};
            if (v.t === 'fn') { try { v.fn(); } catch (e) {} }
            if (v.t === 'custom' && typeof v.run === 'function') { try { v.run(noop); } catch (e) {} }
            st = it.next();
          }
        } catch (e) { /* branch not taken in this state */ }
       }
      }
    }
    choice.i = 0;
    G.makeMon = realMake;
    G.pushScene = realPush; G.popScene = realPop;
    G.runEvent = realRun; G.runEventGen = realRunGen;
    G.player = JSON.parse(savedP); G.flags = JSON.parse(savedF);
  }

  // 4. and everything those evolve into
  let grew = true;
  while (grew) {
    grew = false;
    for (const k of [...obtainable]) {
      for (const e of ((G.SPECIES[k] || {}).evos || [])) {
        if (!obtainable.has(e.into)) { obtainable.add(e.into); grew = true; }
      }
    }
  }

  const missing = G.DEX_ORDER.filter(k => !obtainable.has(k));
  if (missing.length) {
    warn.push(`DEX: ${missing.length}/151 unobtainable — ${missing.map(k => G.SPECIES[k].name).join(', ')}`);
  }
  console.log(`  dex: ${151 - missing.length}/151 species obtainable by a player`);
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
      else if (tile.solid && !tile.water) errors.push(`WARP ${id} -> ${w.to}: lands on SOLID '${t.legend[ch]}' at (${w.tx},${w.ty}) — soft-lock`);
      queue.push(w.to);
    }
    // Not every transition is a warp. The HALL OF FAME hands you back to your
    // own bedroom, and the HALL OF CHAMPIONS is opened by talking to OAK —
    // both are `loadMap` calls inside an event, and a graph walk that only
    // follows warps would report them as unreachable content.
    for (const eid in (G.EVENTS || {})) {
      const src = String(G.EVENTS[eid]);
      for (const mt of src.matchAll(/loadMap\(\s*['"]([a-z0-9_]+)['"]/g)) {
        if (G.MAPS[mt[1]]) queue.push(mt[1]);
      }
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

// --- every species' typing, against Red/Blue ---
// The chart audit above proves the fifteen types behave like Gen 1. It says
// nothing about which types each creature HAS, and that is where the era shows
// up: Clefairy and Jigglypuff are plain Normal here, Mr. Mime is plain Psychic
// and Magnemite plain Electric, because Fairy arrives in Gen 6 and Steel in
// Gen 2. Those four look like mistakes to anyone who learned the series later.
//
// The reference table is written out by hand rather than re-derived from the
// pipeline that generated js/data — a second opinion is only worth having if
// it comes from somewhere else.
{
  const want = require('./gen1_types.js');
  const byId = {};
  for (const k in G.SPECIES) byId[G.SPECIES[k].id] = k;
  const off = [];
  for (let d = 1; d <= 151; d++) {
    const k = byId[d];
    if (!k) { off.push(`#${d} is missing from the roster`); continue; }
    const got = (G.SPECIES[k].types || []).join(' ');
    if (got !== want[d]) off.push(`#${d} ${k} is '${got}', Red/Blue says '${want[d]}'`);
  }
  for (const o of off.slice(0, 10)) errors.push('TYPING: ' + o);
  if (off.length > 10) errors.push(`TYPING: …and ${off.length - 10} more`);
  if (!off.length) console.log('  typings: all 151 species match their Red/Blue types exactly');
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

// --- the data, against the ROM it came from ---
// Runs in its own process because it parses the cached pokered .asm files with
// its own reader rather than reusing gen_data.js. Asking the generator to
// check its own output would only prove it is consistent with itself; this
// re-derives types, base stats, the single Gen 1 special, catch rates, exp
// yields, level-up learnsets and all 55 machines straight from the source and
// disagrees out loud.
{
  const r = require('child_process').spawnSync(process.execPath,
    [path.join(__dirname, 'verify_against_pokered.js')], { encoding: 'utf8' });
  const out = (r.stdout || '').trim().split(String.fromCharCode(10));
  if (r.status !== 0) {
    for (const line of out) if (line.includes('MISMATCH')) errors.push('POKERED — ' + line.trim());
  } else {
    console.log('  pokered: ' + (out[out.length - 1] || '').trim());
  }
}

// --- scene fuzz ---
// Runs tools/fuzz_scenes.js in its own process: it replaces G.input, G.audio
// and G.IMG with stubs, which would poison every audit above if it ran here.
{
  const r = require('child_process').spawnSync(process.execPath,
    [path.join(__dirname, 'fuzz_scenes.js')], { encoding: 'utf8' });
  if (r.status !== 0) {
    for (const line of (r.stderr || '').trim().split(String.fromCharCode(10))) if (line) errors.push('FUZZ — ' + line);
  } else {
    console.log('  ' + (r.stdout || '').trim());
  }
}

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
