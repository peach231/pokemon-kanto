// Pokéram — mon.js
// Creature instances: creation, stat math, exp/levels, learnsets, evolution.
// Stat formulas (IVs 0-15, no EVs):
//   hp    = floor((2*base + iv) * L / 100) + L + 10
//   other = floor((2*base + iv) * L / 100) + 5
// Exp curve (all species): medium-slow, 1.2L^3 - 15L^2 + 100L - 140 —
// the canon starter curve: early levels cost very little (L5->6 is 44 exp
// vs 91 on pure L^3), then the 1.2L^3 term dominates and growth slows.

(function () {
  // The six Gen 3 experience growth groups: cumulative exp required to be at
  // level L. Each species declares its group via SPECIES[key].growth.
  G.EXP_GROUPS = {
    fast:       function (n) { return Math.floor(0.8 * n * n * n); },
    mediumFast: function (n) { return n * n * n; },
    mediumSlow: function (n) { return Math.max(0, Math.floor(1.2 * n * n * n - 15 * n * n + 100 * n - 140)); },
    slow:       function (n) { return Math.floor(1.25 * n * n * n); },
    erratic:    function (n) {
      var c = n * n * n;
      if (n < 50) return Math.floor(c * (100 - n) / 50);
      if (n < 68) return Math.floor(c * (150 - n) / 100);
      if (n < 98) return Math.floor(c * Math.floor((1911 - 10 * n) / 3) / 500);
      return Math.floor(c * (160 - n) / 100);
    },
    fluctuating: function (n) {
      var c = n * n * n;
      if (n < 15) return Math.floor(c * (Math.floor((n + 1) / 3) + 24) / 50);
      if (n < 36) return Math.floor(c * (n + 14) / 50);
      return Math.floor(c * (Math.floor(n / 2) + 32) / 50);
    }
  };

  // Cumulative exp for level L in a given growth group (default medium-slow).
  G.expForLevel = function (L, group) {
    if (L <= 1) return 0;
    var fn = G.EXP_GROUPS[group] || G.EXP_GROUPS.mediumSlow;
    return Math.max(0, fn(L));
  };

  // Per-mon convenience: uses the species' own growth group.
  G.monExpForLevel = function (mon, L) {
    return G.expForLevel(L, (G.SPECIES[mon.sp] || {}).growth);
  };

  function rollIvs() {
    return {
      hp: G.irand(16), atk: G.irand(16), def: G.irand(16),
      spa: G.irand(16), spd: G.irand(16), spe: G.irand(16)
    };
  }

  // The (up to) 4 most recent learnset moves at a level.
  G.movesAtLevel = function (spKey, level) {
    var ls = G.SPECIES[spKey].learnset;
    var known = [];
    for (var i = 0; i < ls.length; i++) {
      if (ls[i][0] <= level && known.indexOf(ls[i][1]) === -1) known.push(ls[i][1]);
    }
    return known.slice(-4).map(function (id) {
      return { id: id, pp: G.MOVES[id].pp, maxPp: G.MOVES[id].pp };
    });
  };

  // ----- natures ----------------------------------------------------------
  // The 25 Gen-3 natures. Each raises one stat 10% and lowers another 10%
  // (HP is never touched); five are neutral. Stored on a mon as an index 0-24.
  G.NATURES = [
    { name: 'Hardy' },                                  // 0  (neutral)
    { name: 'Lonely',  up: 'atk', down: 'def' },        // 1
    { name: 'Brave',   up: 'atk', down: 'spe' },        // 2
    { name: 'Adamant', up: 'atk', down: 'spa' },        // 3
    { name: 'Naughty', up: 'atk', down: 'spd' },        // 4
    { name: 'Bold',    up: 'def', down: 'atk' },        // 5
    { name: 'Docile' },                                 // 6  (neutral)
    { name: 'Relaxed', up: 'def', down: 'spe' },        // 7
    { name: 'Impish',  up: 'def', down: 'spa' },        // 8
    { name: 'Lax',     up: 'def', down: 'spd' },        // 9
    { name: 'Timid',   up: 'spe', down: 'atk' },        // 10
    { name: 'Hasty',   up: 'spe', down: 'def' },        // 11
    { name: 'Serious' },                                // 12 (neutral)
    { name: 'Jolly',   up: 'spe', down: 'spa' },        // 13
    { name: 'Naive',   up: 'spe', down: 'spd' },        // 14
    { name: 'Modest',  up: 'spa', down: 'atk' },        // 15
    { name: 'Mild',    up: 'spa', down: 'def' },        // 16
    { name: 'Quiet',   up: 'spa', down: 'spe' },        // 17
    { name: 'Bashful' },                                // 18 (neutral)
    { name: 'Rash',    up: 'spa', down: 'spd' },        // 19
    { name: 'Calm',    up: 'spd', down: 'atk' },        // 20
    { name: 'Gentle',  up: 'spd', down: 'def' },        // 21
    { name: 'Sassy',   up: 'spd', down: 'spe' },        // 22
    { name: 'Careful', up: 'spd', down: 'spa' },        // 23
    { name: 'Quirky' }                                  // 24 (neutral)
  ];
  G.natureOf = function (mon) { return G.NATURES[mon && mon.nature || 0] || G.NATURES[0]; };

  G.makeMon = function (spKey, level, opts) {
    opts = opts || {};
    var mon = {
      sp: spKey,
      nick: null,
      level: level,
      exp: G.expForLevel(level, (G.SPECIES[spKey] || {}).growth),
      ivs: opts.ivs || rollIvs(),
      nature: opts.nature !== undefined ? opts.nature : G.irand(25),
      shiny: opts.shiny !== undefined ? opts.shiny : (G.rand() < 1 / 600), // 1-in-600, no quota
      status: null,
      slpTurns: 0,
      curHp: 0,
      moves: opts.moves
        ? opts.moves.map(function (id) { return { id: id, pp: G.MOVES[id].pp, maxPp: G.MOVES[id].pp }; })
        : G.movesAtLevel(spKey, level)
    };
    mon.curHp = G.monStats(mon).hp;
    return mon;
  };

  // ----- eggs -------------------------------------------------------------
  // An egg is a fully-formed level-5 creature kept hidden until it hatches:
  // `egg` true + `hatch` steps remaining. It can't battle and shows as "EGG".
  G.EGG_STEPS = 1200; // a long incubation — eggs are a rare prize, not a quick pull
  // Deliberately rare/cool species you won't just bump into in the grass:
  // pseudo-legendary lines, Eevee, Feebas->Milotic, and the egg-iconic Togepi.
  G.EGG_POOL = ['beldum', 'bagon', 'feebas', 'chimecho', 'lileep', 'anorith', 'wynaut'];

  G.randomEggSpecies = function () {
    var pool = G.EGG_POOL.filter(function (k) { return G.SPECIES[k]; });
    return pool.length ? pool[G.irand(pool.length)] : 'eevee';
  };

  // Hatchlings come out at your team's current level so they're useful right
  // away (matches what your starter / other team members are around).
  G.eggHatchLevel = function () {
    var L = 5, p = (G.player && G.player.party) || [];
    for (var i = 0; i < p.length; i++) if (!p[i].egg && p[i].level > L) L = p[i].level;
    return Math.min(100, L);
  };

  G.makeEgg = function (spKey, steps) {
    var mon = G.makeMon(spKey || G.randomEggSpecies(), 5);
    mon.egg = true;
    mon.hatch = steps || G.EGG_STEPS;
    mon.hatchTotal = mon.hatch;   // for progress display
    mon.nick = null;
    return mon;
  };

  // Reveal the creature inside: clear the egg flag, level it to the team's level
  // (fresh moves/stats for that level), top it off, log the dex.
  G.hatchEgg = function (mon) {
    mon.egg = false;
    mon.hatch = 0;
    var L = G.eggHatchLevel();
    mon.level = L;
    mon.exp = G.expForLevel(L, (G.SPECIES[mon.sp] || {}).growth);
    mon.moves = G.movesAtLevel(mon.sp, L);
    G.healMon(mon);
    if (G.player) { G.player.dexSeen[mon.sp] = 1; G.player.dexCaught[mon.sp] = 1; }
  };

  G.monStats = function (mon) {
    var sp = G.SPECIES[mon.sp];
    var L = mon.level, iv = mon.ivs;
    function stat(b, i) { return Math.floor((2 * b + i) * L / 100) + 5; }
    var out = {
      hp: Math.floor((2 * sp.base.hp + iv.hp) * L / 100) + L + 10,
      atk: stat(sp.base.atk, iv.atk),
      def: stat(sp.base.def, iv.def),
      spa: stat(sp.base.spa, iv.spa),
      spd: stat(sp.base.spd, iv.spd),
      spe: stat(sp.base.spe, iv.spe)
    };
    // nature: +10% to one stat, -10% to another (never HP)
    var nat = G.NATURES[mon.nature || 0];
    if (nat && nat.up && nat.up !== nat.down) {
      out[nat.up] = Math.floor(out[nat.up] * 1.1);
      out[nat.down] = Math.floor(out[nat.down] * 0.9);
    }
    return out;
  };

  G.monName = function (mon) { return mon.nick || G.SPECIES[mon.sp].name; };

  G.healMon = function (mon) {
    mon.curHp = G.monStats(mon).hp;
    mon.status = null;
    mon.slpTurns = 0;
    for (var i = 0; i < mon.moves.length; i++) mon.moves[i].pp = mon.moves[i].maxPp;
  };

  // Add exp; returns events: [{type:'level', level} | {type:'learn', moveId, level}]
  // Caller resolves 'learn' (may need a forget prompt) and evolution checks.
  G.gainExp = function (mon, amount) {
    var events = [];
    if (mon.level >= 100) return events;
    mon.exp += amount;
    var sp = G.SPECIES[mon.sp];
    while (mon.level < 100 && mon.exp >= G.expForLevel(mon.level + 1, sp.growth)) {
      var oldMax = G.monStats(mon).hp;
      mon.level++;
      var newMax = G.monStats(mon).hp;
      mon.curHp = Math.min(newMax, mon.curHp + (newMax - oldMax)); // keep damage offset
      events.push({ type: 'level', level: mon.level });
      for (var i = 0; i < sp.learnset.length; i++) {
        if (sp.learnset[i][0] === mon.level) {
          events.push({ type: 'learn', moveId: sp.learnset[i][1], level: mon.level });
        }
      }
    }
    return events;
  };

  G.knowsMove = function (mon, moveId) {
    for (var i = 0; i < mon.moves.length; i++) if (mon.moves[i].id === moveId) return true;
    return false;
  };

  // Moves the creature COULD know now (in its current species' level-up list at
  // or below its level) but doesn't — what a Move Tutor / Reminder can teach.
  G.teachableMoves = function (mon) {
    if (!mon || mon.egg) return [];
    var sp = G.SPECIES[mon.sp];
    if (!sp) return [];
    var out = [], seen = {};
    for (var i = 0; i < sp.learnset.length; i++) {
      var lv = sp.learnset[i][0], id = sp.learnset[i][1];
      if (lv <= mon.level && !seen[id] && !G.knowsMove(mon, id)) { out.push(id); seen[id] = 1; }
    }
    return out;
  };

  // null = no evolution due, else the target species key
  G.evolutionDue = function (mon) {
    var sp = G.SPECIES[mon.sp];
    if (sp.evolvesTo && mon.level >= sp.evolveLevel) return sp.evolvesTo;
    return null;
  };

  G.evolveMon = function (mon) {
    var to = G.SPECIES[mon.sp].evolvesTo;
    if (!to) return;
    var hpLost = G.monStats(mon).hp - mon.curHp;
    mon.sp = to;
    mon.curHp = Math.max(1, G.monStats(mon).hp - hpLost);
    // Top up empty move slots with the evolved form's level-appropriate moves,
    // so a late evolution (e.g. Magikarp -> Gyarados) isn't stuck on one move.
    if (mon.moves.length < 4) {
      var pool = G.movesAtLevel(to, mon.level);
      for (var i = 0; i < pool.length && mon.moves.length < 4; i++) {
        if (!G.knowsMove(mon, pool[i].id)) mon.moves.push(pool[i]);
      }
    }
    if (G.player) {
      G.player.dexSeen[to] = 1;
      G.player.dexCaught[to] = 1;
    }
  };
})();
