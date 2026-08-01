// pokemon-kanto — mon.js
// Creature instances: creation, stat math, exp/levels, learnsets, evolution.
//
// This is Gen 1's system, which differs from later generations in ways that
// are load-bearing for how the game feels:
//
//  * DVs, not IVs. Four of them (Attack, Defence, Speed, Special), each 0-15.
//    The HP DV is not rolled — it is assembled from the parity of the other
//    four, so a mon with all-odd DVs gets HP 15 and an all-even one gets HP 0.
//  * The stat formula DOUBLES the DV as well as the base stat, so a 15 DV is
//    worth a flat +30 base. DVs matter far more here than IVs do in modern games.
//  * ONE Special stat. species_base.js mirrors it into spa and spd, and
//    monStats keeps them locked together, so Amnesia raises offence and
//    defence at once — which is exactly why Amnesia was broken in 1996.
//  * No natures, no abilities, no held items, no EVs, no breeding. None of
//    those existed. There are no eggs in this game.

(function () {
  // Gen 1 has four growth groups. (SLIGHTLY_FAST and SLIGHTLY_SLOW exist as
  // constants in the ROM but no species uses them.)
  G.EXP_GROUPS = {
    fast:       function (n) { return Math.floor(0.8 * n * n * n); },
    mediumFast: function (n) { return n * n * n; },
    mediumSlow: function (n) { return Math.max(0, Math.floor(1.2 * n * n * n - 15 * n * n + 100 * n - 140)); },
    slow:       function (n) { return Math.floor(1.25 * n * n * n); }
  };

  // Pacing dial. Red/Blue's curve assumes you will grind; this game does not.
  // Battle exp is multiplied by this so a natural team clears the Elite Four
  // without deliberate level farming. 1.0 would be exact ROM pacing.
  G.EXP_RATE = 1.5;

  // Cumulative exp for level L in a given growth group.
  G.expForLevel = function (L, group) {
    if (L <= 1) return 0;
    var fn = G.EXP_GROUPS[group] || G.EXP_GROUPS.mediumFast;
    return Math.max(0, fn(L));
  };

  G.monExpForLevel = function (mon, L) {
    return G.expForLevel(L, (G.SPECIES[mon.sp] || {}).growth);
  };

  // ----- DVs ----------------------------------------------------------------
  // Four rolled values; HP is derived from their low bits, as in the ROM.
  function hpDv(d) {
    return ((d.atk & 1) << 3) | ((d.def & 1) << 2) | ((d.spe & 1) << 1) | (d.spc & 1);
  }

  function rollDvs() {
    var d = { atk: G.irand(16), def: G.irand(16), spe: G.irand(16), spc: G.irand(16) };
    d.hp = hpDv(d);
    return d;
  }

  // Accepts a partial DV set (tests and scripted encounters supply one) and
  // fills in the rest, keeping the HP derivation honest.
  G.makeDvs = function (partial) {
    var d = {
      atk: partial && partial.atk != null ? partial.atk : G.irand(16),
      def: partial && partial.def != null ? partial.def : G.irand(16),
      spe: partial && partial.spe != null ? partial.spe : G.irand(16),
      spc: partial && partial.spc != null ? partial.spc : G.irand(16)
    };
    d.hp = hpDv(d);
    return d;
  };

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

  G.makeMon = function (spKey, level, opts) {
    opts = opts || {};
    var mon = {
      sp: spKey,
      nick: null,
      level: level,
      // The career record. Stamped at creation because that is the one moment
      // every POKéMON passes through — caught, gifted, revived from a fossil
      // or handed over by OAK. Wild and enemy mons get one too and nobody ever
      // reads it, which is a much smaller price than threading a "you now own
      // this" call through every gift event in the region.
      met: { map: (G.world && G.world.mapId) || null, level: level },
      friendship: G.FRIEND_START,
      steps: 0, wins: 0, kos: 0,
      exp: G.expForLevel(level, (G.SPECIES[spKey] || {}).growth),
      dvs: opts.dvs ? G.makeDvs(opts.dvs) : rollDvs(),
      shiny: opts.shiny !== undefined ? opts.shiny : (G.rand() < 1 / 600),
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

  // ----- stats --------------------------------------------------------------
  // Gen 1: floor((base + DV) * 2 * L / 100) + 5, and HP gets + L + 10 instead
  // of the flat + 5. Note both the base AND the DV are doubled.
  G.monStats = function (mon) {
    var sp = G.SPECIES[mon.sp];
    var L = mon.level, d = mon.dvs;
    function stat(base, dv) { return Math.floor((base + dv) * 2 * L / 100) + 5; }
    var spc = stat(sp.spc != null ? sp.spc : sp.base.spa, d.spc);
    return {
      hp:  Math.floor((sp.base.hp + d.hp) * 2 * L / 100) + L + 10,
      atk: stat(sp.base.atk, d.atk),
      def: stat(sp.base.def, d.def),
      spe: stat(sp.base.spe, d.spe),
      // One Special, reported through both modern slots so the rest of the
      // engine and the summary screen need no special case.
      spa: spc,
      spd: spc
    };
  };

  // ----- critical hits ------------------------------------------------------
  // Gen 1 ties crit rate to the attacker's SPECIES BASE SPEED, not a flat 1/16.
  // Persian (base 115) crits about 22% of the time; Slowpoke (base 15) about 3%.
  // High-crit moves multiply that by eight, which is why Slash crits nearly
  // every turn on a fast mon. This is authentic and deliberately kept.
  //
  // Focus Energy is the one correction: in Red/Blue it QUARTERED your crit rate
  // instead of raising it, which is plainly a sign error. Here it is x4.
  G.critChance = function (mon, move, focused) {
    var sp = G.SPECIES[mon.sp];
    var r = (sp.base.spe / 2) / 256;
    var eff = move && move.effect;
    if (eff && (eff.kind === 'highCrit' || eff.highCrit)) r *= 8;
    if (focused) r *= 4;
    return Math.min(255 / 256, r);
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

  // ------------------------------------------------------------ friendship --
  // Gen 1 has no friendship at all; this is a Gen 2 idea, borrowed because the
  // thing Gen 1 does worst is give you any reason to keep a particular
  // POKéMON rather than the next one you catch at the right level.
  //
  // It is deliberately slow to earn and quick to lose. 0-255, starting at 70,
  // like Gen 2 — the numbers are not shown anywhere, only the word for them.
  G.FRIEND_MAX = 255;
  G.FRIEND_START = 70;

  G.friendship = function (mon) {
    return mon.friendship == null ? G.FRIEND_START : mon.friendship;
  };
  G.addFriendship = function (mon, n) {
    if (!mon) return;
    mon.friendship = Math.max(0, Math.min(G.FRIEND_MAX, G.friendship(mon) + n));
  };
  // The word, not the number. Five bands, because a bar of 255 tells a player
  // nothing and "It would take a hit for you" tells them everything.
  G.FRIEND_BANDS = [
    [230, 'Inseparable', '#f06292'],
    [180, 'Devoted', '#e8907c'],
    [120, 'Warming to you', '#e8c038'],
    [60, 'Getting used to you', '#9aa4c0'],
    [0, 'Wary of you', '#6a7290']
  ];
  G.friendshipBand = function (mon) {
    var f = G.friendship(mon);
    for (var i = 0; i < G.FRIEND_BANDS.length; i++) {
      if (f >= G.FRIEND_BANDS[i][0]) return G.FRIEND_BANDS[i];
    }
    return G.FRIEND_BANDS[G.FRIEND_BANDS.length - 1];
  };

  G.knowsMove = function (mon, moveId) {
    for (var i = 0; i < mon.moves.length; i++) if (mon.moves[i].id === moveId) return true;
    return false;
  };

  // Moves the creature COULD know now but doesn't — what the Move Relearner
  // in Fuchsia offers.
  G.teachableMoves = function (mon) {
    if (!mon) return [];
    var sp = G.SPECIES[mon.sp];
    if (!sp) return [];
    var out = [], seen = {};
    for (var i = 0; i < sp.learnset.length; i++) {
      var lv = sp.learnset[i][0], id = sp.learnset[i][1];
      if (lv <= mon.level && !seen[id] && !G.knowsMove(mon, id)) { out.push(id); seen[id] = 1; }
    }
    return out;
  };

  // ----- evolution ----------------------------------------------------------
  // Species carry an `evos` array so Eevee's three stone branches and the
  // level lines can share one code path.
  //
  //   { how: 'level', level, into }   checked after every level-up
  //   { how: 'stone', item,  into }   checked when a stone is used on the mon

  // null = no level-up evolution due, else the target species key.
  G.evolutionDue = function (mon) {
    var sp = G.SPECIES[mon.sp];
    var evos = sp.evos || [];
    for (var i = 0; i < evos.length; i++) {
      if (evos[i].how === 'level' && mon.level >= evos[i].level) return evos[i].into;
    }
    return null;
  };

  // What this stone would turn the mon into, or null if it does nothing.
  G.stoneEvolution = function (mon, itemId) {
    var sp = G.SPECIES[mon.sp];
    var evos = sp.evos || [];
    for (var i = 0; i < evos.length; i++) {
      if (evos[i].how === 'stone' && evos[i].item === itemId) return evos[i].into;
    }
    return null;
  };

  // `into` is optional — level evolutions can infer it.
  G.evolveMon = function (mon, into) {
    var to = into || G.evolutionDue(mon);
    if (!to || !G.SPECIES[to]) return;
    var hpLost = G.monStats(mon).hp - mon.curHp;
    mon.sp = to;
    mon.curHp = Math.max(1, G.monStats(mon).hp - hpLost);
    // Top up empty move slots with the evolved form's level-appropriate moves,
    // so a late evolution (Magikarp -> Gyarados at 20) isn't stuck on Splash.
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
