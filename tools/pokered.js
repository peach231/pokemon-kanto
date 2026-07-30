// pokemon-kanto — tools/pokered.js
// Fetches and parses the Red/Blue disassembly (pret/pokered) into plain JS
// objects. Nothing here is game code — it runs once, offline, to produce the
// files in js/data/. The point is that base stats, learnsets, evolutions, move
// data and wild encounter tables are the ACTUAL ROM values rather than my
// recollection of them.
//
// Raw .asm files are cached under tools/cache/ so re-runs are instant and the
// generator stays usable without a network connection.

'use strict';

const fs = require('fs');
const path = require('path');

const BASE = 'https://raw.githubusercontent.com/pret/pokered/master';
const CACHE = path.join(__dirname, 'cache');

// --------------------------------------------------------------- fetching --

async function raw(rel) {
  const file = path.join(CACHE, rel.replace(/[\/]/g, '__'));
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  const res = await fetch(BASE + '/' + rel);
  if (!res.ok) throw new Error(`fetch ${rel}: HTTP ${res.status}`);
  const text = await res.text();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(file, text);
  return text;
}

// Fetch many paths with a small concurrency cap — GitHub raw is happy with this
// and 151 sequential round-trips is needlessly slow.
async function rawAll(rels, conc = 12) {
  const out = {};
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(conc, rels.length) }, async () => {
    while (i < rels.length) {
      const rel = rels[i++];
      out[rel] = await raw(rel);
    }
  }));
  return out;
}

// ---------------------------------------------------------------- helpers --

// Strip ; comments and blank lines, trim each line.
function lines(text) {
  return text.split('\n')
    .map(l => l.replace(/;.*$/, '').trim())
    .filter(Boolean);
}

// pokered writes PSYCHIC_TYPE because PSYCHIC is the move. Normalise types to
// the lowercase ids the engine uses.
function typeId(t) {
  return t.replace(/_TYPE$/, '').toLowerCase();
}

// RHYDON -> rhydon, NIDORAN♂ -> nidoranm, MR_MIME -> mrmime, FARFETCH_D -> farfetchd
function monKey(name) {
  return name.toLowerCase()
    .replace(/♂/g, 'm').replace(/♀/g, 'f')
    .replace(/[^a-z0-9]/g, '');
}

function moveKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Move names are all-caps in the ROM. Title-case each hyphen/space separated
// word, with overrides for the run-together compounds Game Freak later
// re-spaced (DOUBLESLAP is DoubleSlap, not Doubleslap).
const MOVE_CASE = {
  doubleslap: 'DoubleSlap', thunderpunch: 'ThunderPunch', thundershock: 'ThunderShock',
  vicegrip: 'ViceGrip', bubblebeam: 'BubbleBeam', solarbeam: 'SolarBeam',
  poisonpowder: 'PoisonPowder', selfdestruct: 'Selfdestruct', softboiled: 'Softboiled'
};

function prettyMove(raw, key) {
  if (MOVE_CASE[key]) return MOVE_CASE[key];
  return raw.split(/([ -])/)
    .map(p => /[ -]/.test(p) ? p : p.charAt(0) + p.slice(1).toLowerCase())
    .join('');
}

// ------------------------------------------------------------- name lists --

// `dname "RHYDON"` / `li "POUND"` style tables.
function parseNameTable(text, macro) {
  const re = new RegExp('^' + macro + '\\s+"([^"]*)"');
  const out = [];
  for (const l of lines(text)) {
    const m = l.match(re);
    if (m) out.push(m[1]);
  }
  return out;
}

// ----------------------------------------------------------------- moves ---

// `move POUND, NO_ADDITIONAL_EFFECT, 40, NORMAL, 100, 35`
async function parseMoves() {
  const [dataText, nameText] = await Promise.all([
    raw('data/moves/moves.asm'),
    raw('data/moves/names.asm')
  ]);
  const names = parseNameTable(nameText, 'li');
  const out = [];
  for (const l of lines(dataText)) {
    const m = l.match(/^move\s+(.+)$/);
    if (!m) continue;
    const f = m[1].split(',').map(s => s.trim());
    if (f.length < 6) continue;
    const i = out.length;
    const rawName = names[i] || f[0];
    const key = moveKey(rawName);
    out.push({
      index: i + 1,                       // 1-based move id, matches ROM
      const: f[0],
      name: prettyMove(rawName, key),
      key: key,
      effect: f[1],
      power: parseInt(f[2], 10),
      type: typeId(f[3]),
      acc: parseInt(f[4].replace(/\s*percent$/, ''), 10),
      pp: parseInt(f[5], 10)
    });
  }
  return out;
}

// ------------------------------------------------------------ type chart ---

// `db WATER, FIRE, SUPER_EFFECTIVE`
async function parseTypeChart() {
  const text = await raw('data/types/type_matchups.asm');
  const MULT = { SUPER_EFFECTIVE: 2, NOT_VERY_EFFECTIVE: 0.5, NO_EFFECT: 0 };
  const chart = {};
  for (const l of lines(text)) {
    const m = l.match(/^db\s+([A-Z_]+),\s*([A-Z_]+),\s*([A-Z_]+)$/);
    if (!m || !(m[3] in MULT)) continue;
    const [, atk, def, eff] = m;
    const a = typeId(atk), d = typeId(def);
    (chart[a] || (chart[a] = {}))[d] = MULT[eff];
  }
  return chart;
}

// ----------------------------------------------------------- base stats ----

// One file per species. Gen 1's stat order is HP ATK DEF SPEED SPECIAL.
function parseBaseStats(text, fileKey) {
  const ls = lines(text);
  const out = { key: fileKey, tms: [] };
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i];
    let m;
    if ((m = l.match(/^db\s+DEX_([A-Z0-9_♂♀]+)$/))) { out.dexConst = 'DEX_' + m[1]; continue; }
    if ((m = l.match(/^db\s+(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)$/))) {
      out.hp = +m[1]; out.atk = +m[2]; out.def = +m[3]; out.spe = +m[4]; out.spc = +m[5];
      continue;
    }
    // The LEVEL-1 learnset lives here, not in evos_moves.asm — that file only
    // lists moves learned above level 1. Four move constants, NO_MOVE padding
    // for unused slots. Missing this is why every species came out with an
    // empty starting moveset.
    if ((m = l.match(/^db\s+([A-Z0-9_]+),\s*([A-Z0-9_]+),\s*([A-Z0-9_]+),\s*([A-Z0-9_]+)$/))) {
      out.startMoves = [m[1], m[2], m[3], m[4]].filter(function (k) { return k !== 'NO_MOVE'; });
      continue;
    }
    if ((m = l.match(/^db\s+([A-Z_]+),\s*([A-Z_]+)$/)) && !out.types) {
      const t1 = typeId(m[1]), t2 = typeId(m[2]);
      out.types = t1 === t2 ? [t1] : [t1, t2];
      continue;
    }
    if ((m = l.match(/^db\s+(\d+)$/))) {
      if (out.catchRate == null) out.catchRate = +m[1];
      else if (out.baseExp == null) out.baseExp = +m[1];
      continue;
    }
    if ((m = l.match(/^db\s+GROWTH_([A-Z_]+)$/))) { out.growth = m[1]; continue; }
    if (/^tmhm\b/.test(l)) {
      // tmhm entries continue across backslash-terminated lines
      let buf = l.replace(/^tmhm\s*/, '');
      let j = i;
      while (buf.endsWith('\\')) { buf = buf.slice(0, -1) + ' ' + ls[++j]; }
      i = j;
      out.tms = buf.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return out;
}

// -------------------------------------------------------- evos + learnsets -

// The file is one labelled block per species: evolutions, a 0, then the
// level-up learnset, then a 0.
function parseEvosMoves(text, moveByConst) {
  const ls = lines(text);
  const blocks = {};
  let cur = null, phase = 'evo';
  for (const l of ls) {
    let m;
    if ((m = l.match(/^([A-Za-z0-9_]+)EvosMoves:$/))) {
      cur = { evos: [], learnset: [] };
      blocks[monKey(m[1])] = cur;
      phase = 'evo';
      continue;
    }
    if (!cur) continue;
    if (/^db\s+0$/.test(l)) { phase = phase === 'evo' ? 'moves' : 'done'; continue; }
    if (phase === 'evo') {
      if ((m = l.match(/^db\s+EVOLVE_LEVEL,\s*(\d+),\s*([A-Z0-9_♂♀]+)$/))) {
        cur.evos.push({ how: 'level', level: +m[1], into: monKey(m[2]) });
      } else if ((m = l.match(/^db\s+EVOLVE_ITEM,\s*([A-Z0-9_]+),\s*(\d+),\s*([A-Z0-9_♂♀]+)$/))) {
        cur.evos.push({ how: 'item', item: m[1], level: +m[2], into: monKey(m[3]) });
      } else if ((m = l.match(/^db\s+EVOLVE_TRADE,\s*(\d+),\s*([A-Z0-9_♂♀]+)$/))) {
        cur.evos.push({ how: 'trade', level: +m[1], into: monKey(m[2]) });
      }
    } else if (phase === 'moves') {
      if ((m = l.match(/^db\s+(\d+),\s*([A-Z0-9_]+)$/))) {
        const mv = moveByConst[m[2]];
        if (mv) cur.learnset.push([+m[1], mv.key]);
      }
    }
  }
  return blocks;
}

// ----------------------------------------------------------- encounters ----

// def_grass_wildmons <rate> then ten `db <level>, <SPECIES>` slots.
function parseWild(text) {
  const ls = lines(text);
  const out = { grass: null, water: null };
  let cur = null, which = null;
  for (const l of ls) {
    let m;
    if ((m = l.match(/^def_(grass|water)_wildmons\s+(\d+)$/))) {
      which = m[1];
      cur = { rate: +m[2], slots: [] };
      continue;
    }
    if (/^end_(grass|water)_wildmons$/.test(l)) {
      if (cur && cur.rate > 0 && cur.slots.length) out[which] = cur;
      cur = null; which = null;
      continue;
    }
    if (cur && (m = l.match(/^db\s+(\d+),\s*([A-Z0-9_♂♀]+)$/))) {
      cur.slots.push({ level: +m[1], key: monKey(m[2]) });
    }
  }
  return out;
}

// ------------------------------------------------------------------ main ---

// National dex order. pokered stores mons in an internal order and maps them to
// dex numbers via DEX_ constants; this reads that mapping rather than assuming.
async function parseDexOrder() {
  const text = await raw('constants/pokedex_constants.asm');
  const out = [];
  for (const l of lines(text)) {
    const m = l.match(/^const\s+DEX_([A-Z0-9_♂♀]+)$/);
    if (m) out.push(monKey(m[1]));
  }
  return out;
}

// pokered stores names in SCREAMING CASE because the Game Boy font had no
// lowercase. Restore normal casing, with overrides for the compounds that
// aren't just Title Case.
const NAME_CASE = {
  nidoranm: 'Nidoran♂', nidoranf: 'Nidoran♀', mrmime: 'Mr. Mime', farfetchd: "Farfetch'd"
};

function prettyName(raw, key) {
  if (NAME_CASE[key]) return NAME_CASE[key];
  return raw.charAt(0) + raw.slice(1).toLowerCase();
}

async function parseMonNames() {
  const text = await raw('data/pokemon/names.asm');
  const out = {};
  for (const raw_ of parseNameTable(text, 'dname')) {
    const key = monKey(raw_);
    if (key && !out[key]) out[key] = prettyName(raw_, key);
  }
  return out;
}

async function load() {
  const [moves, chart, dexOrder, monNames] = await Promise.all([
    parseMoves(), parseTypeChart(), parseDexOrder(), parseMonNames()
  ]);

  const moveByConst = {};
  for (const mv of moves) moveByConst[mv.const] = mv;

  // Every base_stats file. Filenames are the species key already.
  const statFiles = dexOrder.map(k => `data/pokemon/base_stats/${k}.asm`);
  const statTexts = await rawAll(statFiles);
  const species = {};
  dexOrder.forEach((key, i) => {
    const s = parseBaseStats(statTexts[`data/pokemon/base_stats/${key}.asm`], key);
    s.dex = i + 1;
    s.name = monNames[key];
    if (!s.name) throw new Error(`no display name for ${key}`);
    species[key] = s;
  });

  const evos = parseEvosMoves(await raw('data/pokemon/evos_moves.asm'), moveByConst);
  for (const key of dexOrder) {
    const e = evos[key] || { evos: [], learnset: [] };
    const s = species[key];
    s.evos = e.evos;
    // Level-1 moves from base_stats first, then the level-up list.
    const start = (s.startMoves || [])
      .map(c => moveByConst[c])
      .filter(Boolean)
      .map(mv => [1, mv.key]);
    s.learnset = start.concat(e.learnset);
    if (!s.learnset.length) throw new Error(`${key} has no moves at all`);
  }

  return { moves, chart, dexOrder, species, moveByConst };
}

async function loadWild(names) {
  const rels = names.map(n => `data/wild/maps/${n}.asm`);
  const texts = await rawAll(rels);
  const out = {};
  names.forEach(n => { out[n] = parseWild(texts[`data/wild/maps/${n}.asm`]); });
  return out;
}

module.exports = { load, loadWild, raw, rawAll, monKey, moveKey, lines, typeId };

// Run directly for a quick sanity dump.
if (require.main === module) {
  load().then(d => {
    console.log(`moves      : ${d.moves.length}`);
    console.log(`species    : ${d.dexOrder.length}`);
    console.log(`chart rows : ${Object.keys(d.chart).length}`);
    const b = d.species.bulbasaur;
    console.log('\nbulbasaur  :', JSON.stringify({
      dex: b.dex, types: b.types, stats: [b.hp, b.atk, b.def, b.spe, b.spc],
      catchRate: b.catchRate, baseExp: b.baseExp, growth: b.growth,
      evos: b.evos, learnset: b.learnset.slice(0, 4), tms: b.tms.length
    }, null, 0));
    const g = d.species.gengar;
    console.log('\ngengar     :', JSON.stringify({
      dex: g.dex, types: g.types, stats: [g.hp, g.atk, g.def, g.spe, g.spc], evos: g.evos
    }));
    const mag = d.species.magnemite;
    console.log('magnemite  :', JSON.stringify({ types: mag.types }), '(Gen 1: pure Electric)');
    console.log('\nghost->psychic in ROM:', d.chart.ghost && d.chart.ghost.psychic);
  }).catch(e => { console.error(e); process.exit(1); });
}
