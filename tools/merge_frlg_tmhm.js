// Widen TM/HM compatibility to FIRERED's, on top of Red/Blue's.
//
// This game is a Kanto remake wearing FireRed's clothes — its overworld people,
// its trainer portraits and its creature art all come from FRLG — so when the
// two generations disagree about who can learn what, FireRed is the one a
// player will have in mind. ODDISH is the case that started this: it learns
// FLASH in FireRed and does not in Red/Blue.
//
// The merge is a UNION, not a replacement, and that is deliberate. The two
// games number their machines completely differently — Gen 1's TM01 is MEGA
// PUNCH, FireRed's is FOCUS PUNCH — and FireRed dropped a lot of Gen 1's TM
// moves altogether. Replacing wholesale would take MEGA PUNCH away from
// CHARMELEON, which is a machine this game does have and FireRed does not.
//
// So compatibility is matched by MOVE rather than by machine number: for every
// machine in THIS game, if FireRed lets a species learn that MOVE from a
// machine, it can learn it here too. Nothing is ever removed.
//
// Run: node tools/merge_frlg_tmhm.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(__dirname, 'cache', 'pokefirered__tmhm_learnsets.h');

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

const norm = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');

// -------------------------------------------------------- FireRed's table --
const text = fs.readFileSync(SRC, 'utf8');
const RENAME = { nidoranf: 'nidoranf', nidoranm: 'nidoranm', mrmime: 'mrmime', farfetchd: 'farfetchd' };
const frlg = {};
// one [SPECIES_X] = TMHM_LEARNSET(...) entry per species
for (const m of text.matchAll(/\[SPECIES_([A-Z0-9_]+)\]\s*=\s*TMHM_LEARNSET\(([\s\S]*?)\),\n/g)) {
  const key = RENAME[m[1].toLowerCase().replace(/_/g, '')] || m[1].toLowerCase().replace(/_/g, '');
  const moves = new Set();
  for (const t of m[2].matchAll(/TMHM\((?:TM|HM)\d+_([A-Z0-9_]+)\)/g)) moves.add(norm(t[1]));
  frlg[key] = moves;
}

// ------------------------------------------------------------- the merge ---
// machine -> the normalised NAME of the move it teaches, in this game
const machineMove = {};
for (const id in G.TM_MOVES) {
  const mv = G.MOVES[G.TM_MOVES[id]];
  if (mv) machineMove[id] = norm(mv.name);
}

const added = {};
let addedTotal = 0, touched = 0;
const out = {};
for (const key in G.TM_COMPAT) {
  const have = new Set(G.TM_COMPAT[key]);
  const theirs = frlg[key];
  if (theirs) {
    for (const id in machineMove) {
      if (have.has(id)) continue;
      if (!theirs.has(machineMove[id])) continue;
      have.add(id);
      (added[key] = added[key] || []).push(id);
      addedTotal++;
    }
  }
  if (added[key]) touched++;
  const order = id => (id[0] === 'h' ? 100 : 0) + parseInt(id.slice(2), 10);
  out[key] = [...have].sort((a, b) => order(a) - order(b));
}

// ------------------------------------------------------------- rewrite it --
const file = path.join(ROOT, 'js/data/tms.js');
let js = fs.readFileSync(file, 'utf8');
const start = js.indexOf('  G.TM_COMPAT = {');
const end = js.indexOf('\n  };', start) + '\n  };'.length;
const body = Object.keys(out).map(k =>
  `    ${k}: [${out[k].map(x => `'${x}'`).join(', ')}]`).join(',\n');
js = js.slice(0, start) +
  '  // Red/Blue\'s table, widened by FireRed\'s — see tools/merge_frlg_tmhm.js.\n' +
  '  // Matched by MOVE, not by machine number, because the two games number\n' +
  '  // their machines differently and FireRed dropped a lot of Gen 1\'s TM\n' +
  '  // moves. Nothing Red/Blue allowed was removed.\n' +
  '  G.TM_COMPAT = {\n' + body + '\n  };' +
  js.slice(end);
fs.writeFileSync(file, js);

console.log(`widened ${touched} species by ${addedTotal} machine entries`);
const perMachine = {};
for (const k in added) for (const id of added[k]) perMachine[id] = (perMachine[id] || 0) + 1;
const keys = Object.keys(perMachine).sort((a, b) => perMachine[b] - perMachine[a]);
for (const id of keys.slice(0, 12)) {
  console.log(`  ${id} (${G.MOVES[G.TM_MOVES[id]].name}): +${perMachine[id]} species`);
}
console.log('  oddish now:', out.oddish.join(' '));
