// Is the difficulty curve right?
//
// Every audit in check.js asks whether the game is CORRECT. None of them asks
// whether it is any good to play. This one runs the real battle engine — real
// damage, real type chart, real Gen 1 crit rates, real AI on both sides — over
// thousands of fights, and reports how often a plausible team actually beats
// each gym and each route.
//
// The player team is built from what a player could really have caught by that
// point, not from a hand-picked squad, and at a level a player would plausibly
// be. Both sides are driven by the same move-choosing AI, so the number is a
// measure of the MATCHUP rather than of anybody's skill.
//
// Run: node tools/balance.js [runsPerCase]
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
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

const RUNS = parseInt(process.argv[2] || '120', 10);

// ---------------------------------------------------------------------------
// What a player can have caught by each stage. Kanto's order is fixed, so this
// is a list rather than a solver — and being explicit means the yardstick can
// be argued with, which a derived number cannot.
const STAGES = [
  { gym: 'brock',   badge: 1, maps: ['route1', 'route2', 'viridianforest', 'route22'] },
  { gym: 'misty',   badge: 2, maps: ['route3', 'mtmoon1f', 'mtmoonb1f', 'route4', 'route24', 'route25'] },
  { gym: 'surge',   badge: 3, maps: ['route5', 'route6', 'route11', 'diglettscave'] },
  { gym: 'erika',   badge: 4, maps: ['route7', 'route8', 'route9', 'route10', 'rocktunnel1f',
                                     'pokemontower3f', 'pokemontower4f', 'pokemontower5f'] },
  { gym: 'koga',    badge: 5, maps: ['route12', 'route13', 'route14', 'route15', 'route16',
                                     'route17', 'route18', 'safarizonecenter', 'safarizoneeast'] },
  { gym: 'sabrina', badge: 6, maps: ['route6', 'route7', 'route8'] },
  { gym: 'blaine',  badge: 7, maps: ['route19', 'route20', 'route21', 'mansion1f', 'mansionb1f',
                                     'seafoam1f', 'seafoamb1f'] },
  { gym: 'giovanni_viridian', badge: 8, maps: ['victoryroad1f', 'route23', 'powerplant'] }
];

// species available by the end of each stage, closed under evolution
function poolThrough(k) {
  const pool = new Set();
  for (let i = 0; i <= k; i++) {
    for (const id of STAGES[i].maps) {
      const m = G.MAPS[id];
      if (!m || !m.encounters) continue;
      for (const t of (m.encounters.table || [])) pool.add(t.sp);
      if (m.encounters.water) for (const t of (m.encounters.water.table || [])) pool.add(t.sp);
    }
  }
  // plus the starters, which everybody has one of
  ['bulbasaur', 'charmander', 'squirtle'].forEach(s => pool.add(s));
  // and anything those evolve into
  let grew = true;
  while (grew) {
    grew = false;
    for (const key of [...pool]) {
      for (const e of ((G.SPECIES[key] || {}).evos || [])) {
        if (!pool.has(e.into)) { pool.add(e.into); grew = true; }
      }
    }
  }
  return [...pool].filter(s => G.SPECIES[s]);
}

// The level a player would plausibly be: a little above the strongest thing
// they have been walking past.
function wildCeiling(k) {
  let top = 5;
  for (let i = 0; i <= k; i++) {
    for (const id of STAGES[i].maps) {
      const m = G.MAPS[id];
      if (!m || !m.encounters) continue;
      for (const t of (m.encounters.table || [])) top = Math.max(top, t.max || 0);
    }
  }
  return top;
}

// ---------------------------------------------------------------------------
function playerAction(battle) {
  const mon = battle.active('p');
  const usable = [], damaging = [];
  for (let i = 0; i < mon.moves.length; i++) {
    if (mon.moves[i].pp > 0) {
      usable.push(i);
      if (G.MOVES[mon.moves[i].id].power > 0) damaging.push(i);
    }
  }
  if (!usable.length) return { type: 'move', slot: -1 };
  let best = -1, bestDmg = -1;
  for (const s of damaging) {
    const mv = G.MOVES[mon.moves[s].id];
    const e = battle.calcDamage('p', mv, { avg: true }).dmg * (mv.acc / 100);
    if (e > bestDmg) { bestDmg = e; best = s; }
  }
  // a little slack, so this is a competent player rather than a perfect one
  if (best !== -1 && G.rand() < 0.85) return { type: 'move', slot: best };
  return { type: 'move', slot: usable[Math.floor(G.rand() * usable.length)] };
}

function fight(party, foes, trainerDef) {
  const b = new G.Battle({ party: party, foes: foes, trainer: trainerDef || { name: 'Sim', ai: 'smart', money: 0 } });
  G.debug.pump(b.intro(), [], false, b);
  let t = 0;
  while (!b.over && t++ < 300) G.debug.pump(b.turn(playerAction(party, b)), [], false, b);
  return b.result;
}

const STARTERS = ['bulbasaur', 'charmander', 'squirtle'];

function makeTeam(pool, level, size) {
  const team = [];
  for (let i = 0; i < size; i++) {
    // Slot one is always the starter. Everybody has one, it is the most
    // trained thing they own, and a team drawn purely at random from the wild
    // tables is five Raticates and a Golbat — which is not a party anybody has
    // ever walked into a gym with, and made every leader look harder than they
    // are.
    const sp = i === 0
      ? STARTERS[Math.floor(G.rand() * STARTERS.length)]
      : pool[Math.floor(G.rand() * pool.length)];
    const mon = G.makeMon(sp, level);
    // Grow it up. Picking uniformly from the wild tables and stopping there
    // hands the player a level 39 CATERPIE, which does not exist in any real
    // playthrough — anything caught that early is a BUTTERFREE long before
    // Saffron. Left unevolved the whole simulation reads as far harder than
    // the game is.
    for (let guard = 0; guard < 4; guard++) {
      const into = G.evolutionDue(mon);
      if (!into) break;
      G.evolveMon(mon, into);
    }
    team.push(mon);
  }
  return team;
}

function winRate(pool, level, size, foesFn, def, runs) {
  let wins = 0, turns = 0;
  for (let i = 0; i < runs; i++) {
    const party = makeTeam(pool, level, size);
    const b = new G.Battle({ party: party, foes: foesFn(), trainer: def });
    G.debug.pump(b.intro(), [], false, b);
    let t = 0;
    while (!b.over && t++ < 300) {
      G.debug.pump(b.turn(playerAction(b)), [], false, b);
    }
    turns += t;
    if (b.result === 'win') wins++;
  }
  return { rate: wins / runs, turns: turns / runs };
}

function bar(r) {
  const n = Math.round(r * 20);
  return '[' + '#'.repeat(n) + '.'.repeat(20 - n) + ']';
}
function verdict(r) {
  if (r >= 0.95) return 'walkover';
  if (r >= 0.80) return 'comfortable';
  if (r >= 0.55) return 'a real fight';
  if (r >= 0.30) return 'HARD';
  return 'BRUTAL';
}

console.log(`battle simulator — ${RUNS} fights per case, real engine both sides\n`);

// --------------------------------------------------------------- the gyms --
console.log('GYM LEADERS  (a full party of six, caught from what is available by then)\n');
console.log('  leader        their team   your level   win rate                    verdict');
const gymRows = [];
for (let k = 0; k < STAGES.length; k++) {
  const st = STAGES[k];
  const def = G.TRAINERS[st.gym];
  if (!def) continue;
  const pool = poolThrough(k);
  const lead = Math.round(def.party.reduce((a, p) => a + p.level, 0) / def.party.length);
  const ceil = wildCeiling(k);
  // A party the size a player would actually have. Six at BROCK is nobody's
  // first gym, and handing the simulation six flatters the early game and
  // libels the late one.
  const size = k <= 1 ? 3 : k <= 3 ? 4 : k <= 5 ? 5 : 6;
  for (const at of [lead - 3, lead, lead + 3]) {
    G.seedRng(1000 + k * 17 + at);
    const r = winRate(pool, Math.max(5, at), size, () => G.trainerParty(def), def, RUNS);
    gymRows.push({ gym: st.gym, lead, at, r: r.rate, ceil });
    console.log('  ' + (at === lead ? st.gym : '').padEnd(14) +
      (('Lv' + lead) + ' x' + def.party.length).padEnd(13) +
      (('Lv' + at) + ' x' + size).padEnd(13) +
      bar(r.rate) + ' ' + (r.rate * 100).toFixed(0).padStart(3) + '%   ' +
      (at === lead ? verdict(r.rate) : ''));
  }
  console.log('');
}

// ------------------------------------------------------------- the routes --
console.log('\nROUTE TRAINERS  (three of yours, at the level the route\'s own wilds reach)\n');
console.log('  route          wilds     trainers    your level   win rate');
const ROUTE_ORDER = [];
for (let k = 0; k < STAGES.length; k++) for (const id of STAGES[k].maps) {
  if (!ROUTE_ORDER.includes(id) && /^route/.test(id)) ROUTE_ORDER.push(id);
}
for (const id of ROUTE_ORDER) {
  const m = G.MAPS[id];
  if (!m || !(m.trainers || []).length) continue;
  const stage = STAGES.findIndex(s => s.maps.includes(id));
  const pool = poolThrough(Math.max(0, stage));
  let wildTop = 0;
  for (const t of ((m.encounters || {}).table || [])) wildTop = Math.max(wildTop, t.max || 0);
  const defs = (m.trainers || []).map(t => G.TRAINERS[t.trainer]).filter(d => d && d.party);
  if (!defs.length) continue;
  const trTop = Math.max(...defs.map(d => Math.max(...d.party.map(p => p.level))));
  const at = Math.max(5, wildTop || trTop);
  let total = 0;
  for (const d of defs) {
    G.seedRng(id.length * 31 + at);
    total += winRate(pool, at, 3, () => G.trainerParty(d), d, Math.max(20, Math.floor(RUNS / 3))).rate;
  }
  const rate = total / defs.length;
  console.log('  ' + id.padEnd(15) + ('Lv' + (wildTop || '-')).padEnd(10) +
    ('Lv' + trTop).padEnd(12) + ('Lv' + at).padEnd(13) +
    bar(rate) + ' ' + (rate * 100).toFixed(0).padStart(3) + '%  ' + verdict(rate));
}

// ---------------------------------------------------------------- summary --
console.log('\nSUMMARY');
const atLevel = gymRows.filter(r => r.at === r.lead);
const soft = atLevel.filter(r => r.r >= 0.95).map(r => r.gym);
const hard = atLevel.filter(r => r.r < 0.30).map(r => r.gym);
console.log('  fighting a leader with a team at their own level:');
console.log('    median win rate ' +
  (atLevel.map(r => r.r).sort((a, b) => a - b)[Math.floor(atLevel.length / 2)] * 100).toFixed(0) + '%');
if (soft.length) console.log('    walkovers: ' + soft.join(', '));
if (hard.length) console.log('    brutal:    ' + hard.join(', '));
if (!soft.length && !hard.length) console.log('    every gym is a real fight at level');
