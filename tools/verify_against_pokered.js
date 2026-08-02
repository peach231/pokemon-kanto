// Re-derive the species data straight from the cached pokered .asm files and
// diff it against what the game actually loaded.
//
// This is deliberately NOT a rerun of tools/gen_data.js. That is the pipeline
// under suspicion; asking it a second time would only tell us it is consistent
// with itself. This parses the disassembly independently — its own reader, its
// own TM ordering, its own idea of what a species record contains — so a
// mistake in the generator shows up as a disagreement rather than as agreement.
//
// Run: node tools/verify_against_pokered.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const CACHE = path.join(__dirname, 'cache');

// ---------------------------------------------------------------- the game --
global.window = global;
global.window.addEventListener = function () {};
global.performance = { now: () => 0 };
global.requestAnimationFrame = function () {};
global.location = { hash: '' };
global.document = {
  createElement: () => ({ getContext: () => null, style: {} }),
  getElementById: () => ({ getContext: () => null, style: {} })
};
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const m of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)) {
  if (m[1] === 'main.js') continue;
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, m[1]), 'utf8'), { filename: m[1] });
}
const G = global.G;

// ------------------------------------------------------------- the source --
const read = f => fs.readFileSync(path.join(CACHE, f), 'utf8');

// TM/HM order, from the macro list that defines the item ids themselves.
const items = read('constants__item_constants.asm');
const HM_ORDER = [...items.matchAll(/^\s*add_hm\s+([A-Z_0-9]+)/gm)].map(m => m[1]);
const TM_ORDER = [...items.matchAll(/^\s*add_tm\s+([A-Z_0-9]+)/gm)].map(m => m[1]);
if (TM_ORDER.length !== 50 || HM_ORDER.length !== 5) {
  console.error(`expected 50 TMs and 5 HMs, read ${TM_ORDER.length} and ${HM_ORDER.length}`);
  process.exit(1);
}
// machine id for a move constant, e.g. CUT -> hm01, SWORDS_DANCE -> tm03
const machineOf = {};
TM_ORDER.forEach((mv, i) => { machineOf[mv] = 'tm' + String(i + 1).padStart(2, '0'); });
HM_ORDER.forEach((mv, i) => { machineOf[mv] = 'hm' + String(i + 1).padStart(2, '0'); });

const TYPE = {
  NORMAL: 'normal', FIGHTING: 'fighting', FLYING: 'flying', POISON: 'poison',
  GROUND: 'ground', ROCK: 'rock', BUG: 'bug', GHOST: 'ghost', FIRE: 'fire',
  WATER: 'water', GRASS: 'grass', ELECTRIC: 'electric', PSYCHIC_TYPE: 'psychic',
  ICE: 'ice', DRAGON: 'dragon'
};

// Every base_stats file in the cache is one species.
const files = fs.readdirSync(CACHE).filter(f => f.startsWith('data__pokemon__base_stats__'));
const src = {};
for (const f of files) {
  const key = f.replace('data__pokemon__base_stats__', '').replace('.asm', '');
  const text = read(f);
  const rec = { key };

  // stats line: hp atk def spd spc  (Gen 1 has ONE special stat — this is the
  // single clearest proof the cache is Red/Blue and not a later game)
  let m = text.match(/^\s*db\s+(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*$/m);
  if (m) rec.base = { hp: +m[1], atk: +m[2], def: +m[3], spe: +m[4], spc: +m[5] };

  m = text.match(/^\s*db\s+([A-Z_]+),\s*([A-Z_]+)\s*;\s*type/m);
  if (m) {
    const a = TYPE[m[1]] || m[1].toLowerCase(), b = TYPE[m[2]] || m[2].toLowerCase();
    rec.types = a === b ? [a] : [a, b];
  }
  m = text.match(/^\s*db\s+(\d+)\s*;\s*catch rate/m);
  if (m) rec.catchRate = +m[1];
  m = text.match(/^\s*db\s+(\d+)\s*;\s*base exp/m);
  if (m) rec.baseExp = +m[1];

  // tmhm, which continues over backslash-terminated lines
  m = text.match(/tmhm\s+([\s\S]*?)\n\s*;\s*end/);
  if (m) {
    rec.tms = m[1].replace(/\\\s*\n/g, ' ')
      .split(',').map(s => s.trim()).filter(Boolean);
  } else {
    rec.tms = [];
  }
  src[key] = rec;
}

// the game keys a couple of species differently from the file names
const RENAME = { nidoran_f: 'nidoranf', nidoran_m: 'nidoranm', mr_mime: 'mrmime',
                 farfetch_d: 'farfetchd' };
const gameKey = k => RENAME[k] || k;

// ----------------------------------------------- FireRed's table as well --
// Not the arbiter — Red/Blue is — but the licence for every entry this game
// has that Red/Blue does not.
const frlgAllows = {};
const machineMove = {};
{
  const norm = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  for (const id in G.TM_MOVES) {
    const mv = G.MOVES[G.TM_MOVES[id]];
    if (mv) machineMove[id] = norm(mv.name);
  }
  let text = '';
  try { text = read('pokefirered__tmhm_learnsets.h'); } catch (e) { /* optional */ }
  for (const m of text.matchAll(/\[SPECIES_([A-Z0-9_]+)\]\s*=\s*TMHM_LEARNSET\(([\s\S]*?)\),\n/g)) {
    const key = m[1].toLowerCase().replace(/_/g, '');
    const set = new Set();
    for (const t of m[2].matchAll(/TMHM\((?:TM|HM)\d+_([A-Z0-9_]+)\)/g)) set.add(norm(t[1]));
    frlgAllows[key] = set;
  }
}

// -------------------------------------------------------------- the diff --
const problems = [];
let checked = 0;

for (const k in src) {
  const s = src[k];
  const gk = gameKey(k);
  const g = G.SPECIES[gk];
  if (!g) { problems.push(`${gk}: in pokered, missing from the game`); continue; }
  checked++;

  if (s.types && s.types.join(' ') !== (g.types || []).join(' ')) {
    problems.push(`${gk} types: game '${(g.types || []).join(' ')}', pokered '${s.types.join(' ')}'`);
  }
  if (s.catchRate != null && s.catchRate !== g.catchRate) {
    problems.push(`${gk} catch rate: game ${g.catchRate}, pokered ${s.catchRate}`);
  }
  if (s.baseExp != null && s.baseExp !== g.expYield) {
    problems.push(`${gk} exp yield: game ${g.expYield}, pokered ${s.baseExp}`);
  }
  if (s.base) {
    for (const stat of ['hp', 'atk', 'def', 'spe']) {
      if (s.base[stat] !== (g.base || {})[stat]) {
        problems.push(`${gk} base ${stat}: game ${(g.base || {})[stat]}, pokered ${s.base[stat]}`);
      }
    }
    if (s.base.spc !== g.spc) {
      problems.push(`${gk} special: game ${g.spc}, pokered ${s.base.spc}`);
    }
  }

  // the machines
  const wantSet = new Set();
  for (const mv of s.tms) {
    // MEW's list ends with UNUSED — padding for the last bit of the bitfield,
    // not a machine. It is the only species long enough to reach it.
    if (mv === 'UNUSED') continue;
    const id = machineOf[mv];
    if (!id) { problems.push(`${gk}: pokered lists '${mv}', which is not a TM or HM`); continue; }
    wantSet.add(id);
  }
  const got = new Set(G.TM_COMPAT[gk] || []);
  const order = id => (id[0] === 'h' ? 100 : 0) + parseInt(id.slice(2), 10);
  // Compatibility is Red/Blue's table WIDENED by FireRed's, because this game
  // wears FireRed's clothes and a player will have FireRed's rules in mind —
  // ODDISH learns FLASH there and not in Red/Blue. So the test is one-sided:
  // nothing Red/Blue allowed may go missing, and every addition has to be
  // something FireRed actually allows. See tools/merge_frlg_tmhm.js.
  const short = [...wantSet].filter(x => !got.has(x)).sort((a, b) => order(a) - order(b));
  if (short.length) problems.push(`${gk} machines: pokered allows ${short.join(' ')} that the game does not`);
  const extra = [...got].filter(x => !wantSet.has(x)).sort((a, b) => order(a) - order(b));
  // A third licence: a HOUSE RULE, declared in js/data/tms_house.js with a
  // reason. Those are departures from both source games ON PURPOSE, and the
  // only thing separating one from a mistake is that somebody wrote it down.
  const house = (G.TM_HOUSE_RULES && G.TM_HOUSE_RULES[gk] && G.TM_HOUSE_RULES[gk].add) || [];
  const unjustified = extra.filter(id =>
    !(frlgAllows[gk] && frlgAllows[gk].has(machineMove[id])) && house.indexOf(id) === -1);
  if (unjustified.length) {
    problems.push(`${gk} machines: game allows ${unjustified.join(' ')}, which neither pokered nor FireRed does`);
  }
  for (const id of house) {
    if (!G.TM_MOVES[id]) problems.push(`${gk}: house rule names ${id}, which is not a machine`);
    else if (!got.has(id)) problems.push(`${gk}: house rule adds ${id} but the table does not have it — tms_house.js did not run`);
  }
}

// ------------------------------------------------- moves, from the source --
// power / type / accuracy / pp for all 165, read out of the move table.
{
  const text = read('data__moves__moves.asm');
  const nameText = read('data__moves__names.asm');
  const moveKeys = [...nameText.matchAll(/^\s*li\s+"([^"]+)"/gm)].map(m => m[1]);
  const rows = [...text.matchAll(/^\s*move\s+([A-Z_0-9]+),\s*([A-Z_0-9]+),\s*(\d+),\s*([A-Z_0-9]+),\s*(\d+),\s*(\d+)/gm)];
  if (!rows.length) {
    problems.push('moves: could not read the move table out of the cache');
  }
  // match the game's move records up by NAME, since the keys are ours
  const byName = {};
  for (const id in G.MOVES) byName[G.MOVES[id].name.toUpperCase().replace(/[^A-Z0-9]/g, '')] = G.MOVES[id];
  let seen = 0;
  rows.forEach((r, i) => {
    const konst = r[1], power = +r[3], type = TYPE[r[4]] || r[4].toLowerCase(),
          acc = +r[5], pp = +r[6];
    const nm = (moveKeys[i] || konst).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const g = byName[nm];
    if (!g) return;                       // named differently here; not a data bug
    seen++;
    if (g.power !== power) problems.push(`move ${nm} power: game ${g.power}, pokered ${power}`);
    if (g.type !== type) problems.push(`move ${nm} type: game ${g.type}, pokered ${type}`);
    if (g.acc !== acc) problems.push(`move ${nm} accuracy: game ${g.acc}, pokered ${acc}`);
    if (g.pp !== pp) problems.push(`move ${nm} pp: game ${g.pp}, pokered ${pp}`);
  });
  console.log(`  moves: ${seen} matched by name and compared on power, type, accuracy and PP`);
}

// -------------------------------------- level-up learnsets and evolutions --
{
  const text = read('data__pokemon__evos_moves.asm');
  const moveConstToName = {};
  {
    const nameText = read('data__moves__names.asm');
    const names = [...nameText.matchAll(/^\s*li\s+"([^"]+)"/gm)].map(m => m[1]);
    const movesText = read('data__moves__moves.asm');
    const konsts = [...movesText.matchAll(/^\s*move\s+([A-Z_0-9]+),/gm)].map(m => m[1]);
    konsts.forEach((k, i) => { if (names[i]) moveConstToName[k] = names[i]; });
  }
  const norm = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Line by line rather than by regex block: the file interleaves a pointer
  // table with the records, and both mention the same labels.
  let cur = null, phase = 'evo';
  const learn = {};
  for (const raw of text.split('\n')) {
    const l = raw.replace(/;.*$/, '').trim();
    let m;
    if ((m = raw.match(/^([A-Za-z0-9_]+)EvosMoves:\s*$/))) {
      cur = gameKey(m[1].toLowerCase());
      learn[cur] = []; phase = 'evo';
      continue;
    }
    if (!cur) continue;
    if (/^db\s+0$/.test(l)) { phase = phase === 'evo' ? 'moves' : 'done'; continue; }
    if (phase !== 'moves') continue;
    if ((m = l.match(/^db\s+(\d+),\s*([A-Z_0-9]+)$/))) {
      learn[cur].push([+m[1], norm(moveConstToName[m[2]] || m[2])]);
    }
  }
  let compared = 0;
  for (const gk in learn) {
    const g = G.SPECIES[gk];
    if (!g || !learn[gk].length) continue;
    compared++;
    const gameSet = new Set((g.learnset || [])
      .map(l => l[0] + ':' + norm((G.MOVES[l[1]] || {}).name || l[1])));
    for (const [lvl, mv] of learn[gk]) {
      if (!gameSet.has(lvl + ':' + mv)) {
        problems.push(`${gk} learnset: pokered teaches ${mv} at L${lvl}, the game does not`);
      }
    }
  }
  console.log(`  learnsets: ${compared} species' level-up moves compared level by level`);
}

// Two places this game deliberately does not match the ROM. Both are engine
// conventions rather than data, and both are listed here so that "no
// disagreements" keeps meaning something.
const DELIBERATE = [
  ['move SWIFT accuracy: game 101, pokered 100',
   'SWIFT never misses in Gen 1; accuracy above 100 is how this engine says so'],
  ['move STRUGGLE pp: game 99, pokered 10',
   'STRUGGLE is what you are left with when everything else is empty, so it must not run out itself']
];
for (const [text, why] of DELIBERATE) {
  const at = problems.indexOf(text);
  if (at >= 0) { problems.splice(at, 1); console.log(`  deliberate: ${text.split(':')[0]} — ${why}`); }
}

// -------------------------------------------------------------- the report --
console.log(`checked ${checked} species against the cached pokered disassembly`);
console.log(`  fields: types, base stats, special, catch rate, exp yield, TM/HM compatibility`);
if (!problems.length) {
  console.log('  no disagreements — the generated data matches the source exactly');
  process.exit(0);
}
for (const p of problems) console.log('  MISMATCH: ' + p);
console.log(`${problems.length} disagreement(s)`);
process.exit(1);
