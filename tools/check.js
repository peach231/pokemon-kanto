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
