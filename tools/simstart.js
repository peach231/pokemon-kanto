// tools/simstart.js — measure Route 1 win rates: Lv5 full-HP starter vs the
// actual first-route opponents (rival counter-starter, Tom's poochyena, Ana's
// zigzagoon), with the real 'basic' trainer AI. Run: node tools/simstart.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
global.window = global;
global.window.addEventListener = function () {};
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = function () {};
global.location = { hash: '' };
global.document = { createElement: () => ({ getContext: () => null, style: {} }), getElementById: () => ({ getContext: () => null, style: {} }) };
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const m of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  if (m[1] === 'main.js') continue;
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, m[1]), 'utf8'), { filename: m[1] });
}

const COUNTER = { treecko: 'torchic', torchic: 'mudkip', mudkip: 'treecko' };
const pump = G.debug.pump;

// one battle: player starter (Lv5, full HP) vs foe (species, level), 'basic' AI.
// Player plays optimally: always the highest-expected-damage move.
function simOne(starter, foeSp, foeLv, seed) {
  G.seedRng(seed);
  const p = G.makeMon(starter, 5);
  const f = G.makeMon(foeSp, foeLv);
  const battle = new G.Battle({ party: [p], foes: [f], wild: false, trainer: { name: 'Sim', ai: 'basic', money: 0 } });
  pump(battle.intro(), [], false, battle);
  let t = 0;
  while (!battle.over && t < 100) {
    t++;
    const mon = battle.active('p');
    let best = -1, bestDmg = -1, anyDmg = false;
    for (let i = 0; i < mon.moves.length; i++) {
      if (mon.moves[i].pp <= 0) continue;
      const mv = G.MOVES[mon.moves[i].id];
      if (mv.power <= 0) continue;
      anyDmg = true;
      const e = battle.calcDamage('p', mv, { avg: true }).dmg * (mv.acc / 100);
      if (e > bestDmg) { bestDmg = e; best = i; }
    }
    const action = best >= 0 ? { type: 'move', slot: best } : { type: 'move', slot: 0 };
    pump(battle.turn(action), [], false, battle);
  }
  return battle.result === 'win';
}

function rate(starter, foeSp, foeLv, n) {
  let w = 0;
  for (let i = 0; i < n; i++) if (simOne(starter, foeSp, foeLv, 1000 + i)) w++;
  return (100 * w / n).toFixed(1);
}

const N = 500;
const starters = ['treecko', 'torchic', 'mudkip'];
for (const foeLv of [4, 3, 2]) {
  console.log(`\n=== opponent level ${foeLv} (player starter Lv5, full HP, ${N} runs) ===`);
  for (const s of starters) {
    const rival = COUNTER[s];
    console.log(`  ${s.padEnd(8)} vs rival ${rival.padEnd(8)}=${rate(s, rival, foeLv, N)}%  vs poochyena=${rate(s, 'poochyena', foeLv, N)}%  vs zigzagoon=${rate(s, 'zigzagoon', foeLv, N)}%`);
  }
}
