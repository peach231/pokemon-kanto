// Pokéram — debug.js
// #debug tooling: headless battle simulator, boot-time test vectors, and
// (later phases) warp/level/item cheats + sprite gallery + jukebox.
// Everything here also runs under Node via tools/check.js.

(function () {
  G.debug = {};

  // ---------------------------------------------------------------- simBattle
  // Runs full battles with both sides driven by AI, rendering discarded.
  // opts: { n: runs, seed, level, verbose }
  G.debug.simBattle = function (aKey, bKey, opts) {
    opts = opts || {};
    var n = opts.n || 1;
    var level = opts.level || 20;
    var winsA = 0, winsB = 0, turns = 0;
    var log = [];

    for (var run = 0; run < n; run++) {
      if (opts.seed !== undefined) G.seedRng(opts.seed + run);
      var a = G.makeMon(aKey, level);
      var b = G.makeMon(bKey, level);
      var battle = new G.Battle({ party: [a], foes: [b], wild: false, trainer: { name: 'Sim', ai: 'smart', money: 0 } });

      pump(battle.intro(), log, opts.verbose, battle);
      var t = 0;
      while (!battle.over && t < 200) {
        t++;
        // drive the player side with the same AI by flipping perspective
        var pAction = choosePlayerAction(battle);
        pump(battle.turn(pAction), log, opts.verbose, battle);
      }
      turns += t;
      if (battle.result === 'win') winsA++;
      else if (battle.result === 'lose') winsB++;
    }
    var summary = aKey + ' vs ' + bKey + ' (lv ' + level + ', n=' + n + '): ' +
      winsA + '-' + winsB + ' avg turns ' + (turns / n).toFixed(1);
    if (opts.verbose) return { summary: summary, log: log };
    return summary;
  };

  // mirror of the foe AI for the player side, using a perspective shim
  function choosePlayerAction(battle) {
    var mon = battle.active('p');
    var usable = [], damaging = [];
    for (var i = 0; i < mon.moves.length; i++) {
      if (mon.moves[i].pp > 0) {
        usable.push(i);
        if (G.MOVES[mon.moves[i].id].power > 0) damaging.push(i);
      }
    }
    if (!usable.length) return { type: 'move', slot: -1 };
    var best = -1, bestDmg = -1;
    for (var j = 0; j < damaging.length; j++) {
      var m = G.MOVES[mon.moves[damaging[j]].id];
      var e = battle.calcDamage('p', m, { avg: true }).dmg * (m.acc / 100);
      if (e > bestDmg) { bestDmg = e; best = damaging[j]; }
    }
    if (best !== -1 && G.chance(0.85)) return { type: 'move', slot: best };
    return { type: 'move', slot: G.pick(usable) };
  }

  function pump(gen, log, verbose, battle) {
    var input;
    while (true) {
      var r = gen.next(input);
      input = undefined;
      if (r.done) return;
      var step = r.value;
      if (!step) continue;
      if (step.t === 'text') {
        log.push(step.s);
        if (verbose === 'print') console.log('  ' + step.s);
      } else if (step.t === 'choose') {
        if (step.kind === 'shift') {
          input = -1; // stay in
        } else if (step.kind === 'switch' && battle) {
          // forced switch: first ALIVE benched creature
          input = 0;
          for (var i = 0; i < battle.party.length; i++) {
            if (battle.party[i].curHp > 0 && i !== battle.activeP) { input = i; break; }
          }
        } else {
          input = 0; // forget first move, etc.
        }
      }
    }
  }
  G.debug.pump = pump;

  // -------------------------------------------------------------- test vectors
  // Boot-time assertions; throw on failure so regressions are loud.
  G.debug.runTests = function () {
    var fails = [];
    function assert(cond, msg) { if (!cond) fails.push(msg); }

    // type chart spot checks (Gen 3, 17 types)
    assert(G.typeEff('electric', ['ground']) === 0, 'electric->ground should be 0');
    assert(G.typeEff('dark', ['psychic']) === 2, 'dark->psychic should be 2');
    assert(G.typeEff('fire', ['grass', 'steel']) === 4, 'fire->grass/steel should be 4');
    assert(G.typeEff('fighting', ['ghost']) === 0, 'fighting->ghost should be 0');
    assert(G.typeEff('water', ['water', 'dragon']) === 0.25, 'water->water/dragon should be 0.25');
    assert(G.typeEff('ghost', ['steel']) === 0.5, 'gen3: steel resists ghost');
    assert(G.typeEff('dark', ['steel']) === 0.5, 'gen3: steel resists dark');
    assert(G.TYPE_ORDER.indexOf('fairy') === -1, 'gen3: no fairy type');
    assert(G.isPhysical('ghost') && !G.isPhysical('dark'), 'gen3 split: ghost phys, dark special');

    // level curve boundaries (medium-slow: 1.2L^3 - 15L^2 + 100L - 140)
    assert(G.expForLevel(10) === 560, 'exp(10)=560, got ' + G.expForLevel(10));
    assert(G.expForLevel(6) - G.expForLevel(5) === 44, 'L5->6 gap should be 44');
    // medium-fast curve: exp(10) === 1000
    assert(G.expForLevel(10, 'mediumFast') === 1000, 'mediumFast exp(10)=1000');
    var m = G.makeMon('treecko', 9); // treecko is medium-slow (default curve)
    G.gainExp(m, G.expForLevel(10) - G.expForLevel(9));
    assert(m.level === 10, 'gainExp boundary -> level 10, got ' + m.level);

    // stat formula known answer
    var probe = G.makeMon('manectric', 50, { ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 } });
    var st = G.monStats(probe);
    var expectHp = Math.floor((2 * G.SPECIES.manectric.base.hp + 10) * 50 / 100) + 50 + 10;
    assert(st.hp === expectHp, 'hp formula mismatch: ' + st.hp + ' vs ' + expectHp);

    // damage range check: 200 samples fall within [min, max] closed form
    G.seedRng(1234);
    var atk = G.makeMon('geodude', 12, { ivs: { hp: 8, atk: 8, def: 8, spa: 8, spd: 8, spe: 8 }, moves: ['rockthrow'] });
    var def = G.makeMon('zigzagoon', 12, { ivs: { hp: 8, atk: 8, def: 8, spa: 8, spd: 8, spe: 8 } });
    var battle = new G.Battle({ party: [atk], foes: [def], wild: true });
    var A = G.monStats(atk).atk, D = G.monStats(def).def;
    var base = Math.floor(Math.floor(Math.floor((2 * 12 / 5 + 2) * 50 * A / D) / 50) + 2);
    var lo = Math.floor(base * 0.85 * 1.5), hi = Math.floor(base * 1.0 * 1.5 * 2); // STAB, up to crit
    for (var i = 0; i < 200; i++) {
      var d = battle.calcDamage('p', G.MOVES.rockthrow).dmg;
      assert(d >= Math.max(1, lo - 1) && d <= hi + 1, 'damage ' + d + ' outside [' + lo + ',' + hi + ']');
      if (fails.length > 5) break;
    }

    // catch distribution: known a -> probability within tolerance (whismur catchRate 190)
    G.seedRng(99);
    var wild = G.makeMon('whismur', 5);
    wild.curHp = 1;
    var cb = new G.Battle({ party: [G.makeMon('treecko', 5)], foes: [wild], wild: true });
    var caught = 0, N = 4000;
    for (var c = 0; c < N; c++) {
      wild.curHp = 1;
      cb.over = false; cb.result = null;
      var gen = cb.doOrb('tameorb');
      var r = gen.next();
      while (!r.done) r = gen.next();
      if (cb.result === 'caught') caught++;
    }
    var stats = G.monStats(wild);
    var a = Math.floor((3 * stats.hp - 2 * 1) * 190 * 1.0 / (3 * stats.hp));
    var p = a >= 255 ? 1 : Math.pow(Math.floor(65536 / Math.pow(255 / a, 0.25)) / 65536, 4);
    var observed = caught / N;
    assert(Math.abs(observed - p) < 0.03, 'catch rate ' + observed.toFixed(3) + ' vs analytic ' + p.toFixed(3));

    // wild grass encounters: stepping in tall grass must start battles at
    // roughly the map's encounter rate, picking species from its table
    (function () {
      var realStart = G.startBattle;
      var realPlayer = G.player;
      G.player = { party: [G.makeMon('treecko', 8)], repelSteps: 0, dexSeen: {}, dexCaught: {} };
      var started = 0, lastSpecies = {};
      G.startBattle = function (bo) {
        started++;
        lastSpecies[bo.foes[0].sp] = 1;
        return {};
      };
      G.seedRng(777);
      for (var gi = 0; gi < 2000; gi++) G.hooks.grassStep(G.MAPS.route1);
      G.startBattle = realStart;
      G.player = realPlayer;
      var rate = started / 2000;
      assert(rate > 0.06 && rate < 0.15, 'grass encounter rate ' + rate.toFixed(3) + ' outside ~10%');
      var tableOk = true;
      for (var spk in lastSpecies) {
        if (!G.MAPS.route1.encounters.table.some(function (e) { return e.sp === spk; })) tableOk = false;
      }
      assert(tableOk, 'encounter produced species not in the map table');
      assert(Object.keys(lastSpecies).length >= 3, 'encounter variety too low: ' + Object.keys(lastSpecies).join(','));
    })();

    // determinism: same seed -> same battle log
    var log1 = G.debug.simBattle('torchic', 'treecko', { n: 1, seed: 42, level: 10, verbose: true }).log.join('|');
    var log2 = G.debug.simBattle('torchic', 'treecko', { n: 1, seed: 42, level: 10, verbose: true }).log.join('|');
    assert(log1 === log2, 'seeded battles should be deterministic');

    // full-battle smoke: strong endpoints can finish a battle
    var pairs = [['sceptile', 'blaziken'], ['swampert', 'metagross'], ['salamence', 'aggron']];
    for (var pi = 0; pi < pairs.length; pi++) {
      var s = G.debug.simBattle(pairs[pi][0], pairs[pi][1], { n: 4, seed: 7 + pi, level: 50 });
      if (typeof s !== 'string') fails.push('sim failed for ' + pairs[pi][0]);
    }

    if (fails.length) {
      console.error('DEBUG TESTS FAILED:');
      for (var f = 0; f < fails.length; f++) console.error('  ✗ ' + fails[f]);
      if (typeof process !== 'undefined') process.exitCode = 1;
      return false;
    }
    console.log('debug.runTests: all battle-core tests pass');
    return true;
  };

  // ---------------------------------------------------------------- gallery
  // #gallery — review creature sprites at native res (fronts + backs).
  G.debug.GalleryScene = function () {
    var keys = [];
    for (var k in G.SPECIES) {
      if (G.IMG['mon_' + k]) keys.push(k);
    }
    var pm = location.hash.match(/p=(\d+)/);
    var page = pm ? parseInt(pm[1], 10) - 1 : 0;
    var PER = 4;
    return {
      opaque: true,
      update: function () {
        if (G.input.repeat('right') || G.input.repeat('down')) page = Math.min(Math.floor((keys.length - 1) / PER), page + 1);
        if (G.input.repeat('left') || G.input.repeat('up')) page = Math.max(0, page - 1);
      },
      draw: function (ctx) {
        ctx.fillStyle = '#30343c';
        ctx.fillRect(0, 0, 240, 160);
        for (var i = 0; i < PER; i++) {
          var idx = page * PER + i;
          if (idx >= keys.length) break;
          var key = keys[idx];
          var x = 8 + i * 58;
          ctx.fillStyle = '#494f5c';
          ctx.fillRect(x - 2, 18, 52, 52);
          ctx.drawImage(G.IMG['mon_' + key], x, 20);
          var back = G.IMG['mon_' + key + '_back'];
          if (back) {
            ctx.fillStyle = '#494f5c';
            ctx.fillRect(x - 2, 78, 60, 44);
            ctx.drawImage(back, x, 80);
          }
          G.text(ctx, G.SPECIES[key].name, x, 130, G.C.white, '#1a1c2c');
        }
        G.text(ctx, 'GALLERY ' + (page + 1) + '/' + Math.ceil(keys.length / PER) + '  (arrows)', 8, 4, G.C.white, '#1a1c2c');
      }
    };
  };

  // ---- contact sheet: 15 fronts per page for fast art triage (#sheet&p=N)
  G.debug.SheetScene = function () {
    var keys = G.DEX_ORDER.filter(function (k) { return G.IMG['mon_' + k]; });
    var pm = location.hash.match(/p=(\d+)/);
    var page = pm ? parseInt(pm[1], 10) - 1 : 0;
    var PER = 15;
    return {
      opaque: true,
      update: function () {
        if (G.input.repeat('right')) page = Math.min(Math.floor((keys.length - 1) / PER), page + 1);
        if (G.input.repeat('left')) page = Math.max(0, page - 1);
      },
      draw: function (ctx) {
        ctx.fillStyle = '#30343c';
        ctx.fillRect(0, 0, 240, 160);
        for (var i = 0; i < PER; i++) {
          var idx = page * PER + i;
          if (idx >= keys.length) break;
          var img = G.IMG['mon_' + keys[idx]];
          var x = 0 + (i % 5) * 48, y = 8 + Math.floor(i / 5) * 50;
          ctx.fillStyle = (i % 2) ? '#3a4150' : '#454d5e';
          ctx.fillRect(x, y, 48, 50);
          ctx.drawImage(img, x + 24 - img.width / 2, y + 49 - img.height);
          G.text(ctx, String(idx + 1), x + 2, y + 1, G.C.white, '#1a1c2c');
        }
        G.text(ctx, 'SHEET ' + (page + 1) + '/' + Math.ceil(keys.length / PER), 180, 0, G.C.white, '#1a1c2c');
      }
    };
  };

  // browser #debug bootstrapping (cheat menus arrive in later phases)
  G.debug.init = function () {
    G.debug.runTests();
    window.PKDBG = G.debug;
  };
})();

