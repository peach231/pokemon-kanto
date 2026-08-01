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
    assert(G.typeEff('ghost', ['psychic']) === 2, 'ghost->psychic should be 2 (our un-bugging)');
    assert(G.typeEff('fire', ['grass', 'bug']) === 4, 'fire->grass/bug should be 4');
    assert(G.typeEff('fighting', ['ghost']) === 0, 'fighting->ghost should be 0');
    assert(G.typeEff('water', ['water', 'dragon']) === 0.25, 'water->water/dragon should be 0.25');
    assert(G.typeEff('bug', ['poison']) === 2, 'gen1: bug and poison are mutually 2x');
    assert(G.typeEff('ice', ['fire']) === 1, 'gen1: ice is neutral on fire');
    assert(G.TYPE_ORDER.length === 15, 'gen1: exactly 15 types');
    assert(G.isPhysical('ghost') && !G.isPhysical('psychic'), 'gen1 split by type: ghost physical, psychic special');

    // level curve boundaries (medium-slow: 1.2L^3 - 15L^2 + 100L - 140)
    assert(G.expForLevel(10, 'mediumSlow') === 560, 'mediumSlow exp(10)=560, got ' + G.expForLevel(10, 'mediumSlow'));
    assert(G.expForLevel(6, 'mediumSlow') - G.expForLevel(5, 'mediumSlow') === 44, 'mediumSlow L5->6 gap should be 44');
    // medium-fast curve: exp(10) === 1000
    assert(G.expForLevel(10, 'mediumFast') === 1000, 'mediumFast exp(10)=1000');
    var m = G.makeMon('bulbasaur', 9); // bulbasaur is medium-slow
    G.gainExp(m, G.expForLevel(10, 'mediumSlow') - G.expForLevel(9, 'mediumSlow'));
    assert(m.level === 10, 'gainExp boundary -> level 10, got ' + m.level);

    // stat formula known answer
    // Gen 1 doubles the DV as well as the base stat, and the HP DV is derived
    // from the parity of the other four rather than rolled.
    var probe = G.makeMon('raichu', 50, { dvs: { atk: 11, def: 11, spc: 11, spe: 11 } });
    var st = G.monStats(probe);
    assert(probe.dvs.hp === 15, 'all-odd DVs must give HP DV 15, got ' + probe.dvs.hp);
    var expectHp = Math.floor((G.SPECIES.raichu.base.hp + 15) * 2 * 50 / 100) + 50 + 10;
    assert(st.hp === expectHp, 'hp formula mismatch: ' + st.hp + ' vs ' + expectHp);
    assert(st.spa === st.spd, 'gen1 has ONE Special stat, mirrored into both slots');

    // damage range check: 200 samples fall within [min, max] closed form
    G.seedRng(1234);
    var atk = G.makeMon('geodude', 12, { dvs: { atk: 8, def: 8, spc: 8, spe: 8 }, moves: ['rockthrow'] });
    var def = G.makeMon('rattata', 12, { dvs: { atk: 8, def: 8, spc: 8, spe: 8 } });
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
    var wild = G.makeMon('pidgey', 5);
    wild.curHp = 1;
    var cb = new G.Battle({ party: [G.makeMon('bulbasaur', 5)], foes: [wild], wild: true });
    var caught = 0, N = 4000;
    for (var c = 0; c < N; c++) {
      wild.curHp = 1;
      cb.over = false; cb.result = null;
      var gen = cb.doOrb('pokeball');
      var r = gen.next();
      while (!r.done) r = gen.next();
      if (cb.result === 'caught') caught++;
    }
    var stats = G.monStats(wild);
    // The analytic expectation has to include G.CATCH_EASE, or this test
    // silently pins the formula to Red/Blue's exact rate and fails the moment
    // that deliberate deviation is tuned. It is read from the constant rather
    // than hard-coded so the two can never disagree.
    var a = Math.floor((3 * stats.hp - 2 * 1) * G.SPECIES.pidgey.catchRate * 1.0 / (3 * stats.hp)) * G.CATCH_EASE;
    var p = a >= 255 ? 1 : Math.pow(Math.min(1, Math.floor(65536 / Math.pow(255 / a, 0.25)) / 65536), 4);
    var observed = caught / N;
    assert(Math.abs(observed - p) < 0.03, 'catch rate ' + observed.toFixed(3) + ' vs analytic ' + p.toFixed(3));
    assert(G.CATCH_EASE >= 1 && G.CATCH_EASE <= 2,
      'CATCH_EASE ' + G.CATCH_EASE + ' is outside the range this game was balanced in');

    // wild grass encounters: stepping in tall grass must start battles at
    // roughly the map's encounter rate, picking species from its table
    (function () {
      var realStart = G.startBattle;
      var realPlayer = G.player;
      G.player = { party: [G.makeMon('bulbasaur', 8)], repelSteps: 0, dexSeen: {}, dexCaught: {} };
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
      // Route 1's ROM table is Pidgey and Rattata and nothing else, so two is
      // the correct answer here -- an assertion of 3+ was a Hoenn assumption.
      assert(Object.keys(lastSpecies).length >= 2, 'encounter variety too low: ' + Object.keys(lastSpecies).join(','));
      assert(!lastSpecies.caterpie, 'Route 1 must not spawn Viridian Forest species');
    })();

    // END-TO-END CAPTURE. The catch-rate maths above was correct for the whole
    // life of this project while the mechanic itself was dead: items.js said
    // `kind: 'ball'` and the battle bag filtered for `kind: 'orb'`, so no ball
    // ever reached the menu. A formula test cannot see that. This drives a
    // real battle turn with a real ball id and asserts a capture comes out.
    (function () {
      var realPlayer = G.player;
      var caught = 0, tries = 200;
      for (var ci = 0; ci < tries; ci++) {
        G.player = {
          party: [G.makeMon('pidgeot', 50)], box: [], bag: { pokeball: 99 },
          dexSeen: {}, dexCaught: {}, money: 0, badges: []
        };
        var wild = G.makeMon('rattata', 3);
        wild.curHp = 1;
        var b = new G.Battle({ party: G.player.party, foes: [wild], wild: true });
        var gen = b.turn({ type: 'ball', id: 'pokeball' });
        var step = gen.next();
        while (!step.done) step = gen.next();
        if (b.caughtMon) caught++;
      }
      G.player = realPlayer;
      assert(caught > tries * 0.5,
        'ball throws captured ' + caught + '/' + tries + ' — the capture path is broken');
      // and the item id the battle bag filters on must be a kind items.js uses
      assert((G.ITEM_KINDS || []).indexOf('ball') !== -1, 'ITEM_KINDS is missing ball');
      assert(G.ITEMS.pokeball.kind === 'ball', 'pokeball is not kind ball');
    })();

    // END-TO-END BAG USE. Same shape of failure as the capture bug above, and
    // the same reason a data test could not see it: the ESCAPE ROPE and the
    // evolution STONES both had correct entries in items.js and no branch in
    // the bag, so both fell through to the party picker. The rope asked which
    // POKéMON you wanted to use a length of rope on; the stones asked properly
    // and then said "It had no effect..." to all ten of their evolutions.
    //
    // So this opens the real BagScene, selects the real item and presses A,
    // and asserts something happened in the world.
    (function () {
      if (!G.BagScene || !G.world || !G.world.loadMap) return;
      var realPlayer = G.player, realScenes = G.scenes.slice();

      // the rope, underground: it should move you, and not ask a question
      G.player = {
        party: [G.makeMon('pidgeot', 30)], box: [], bag: { escaperope: 2 },
        dexSeen: {}, dexCaught: {}, money: 0, badges: [],
        respawn: { mapId: 'pewter', x: 5, y: 12 }
      };
      G.world.loadMap('mtmoon1f', 14, 20, 'down');
      assert(G.world.map.id === 'mtmoon1f', 'could not reach MT. MOON to test the rope');
      // Something UNDER the overworld, which is what a real playthrough leaves
      // behind: the title flow replaces its way through a cinematic, a
      // character select and the tutorial prompt before the world is pushed.
      // Both this and FLY used to pop to a stack DEPTH of one, which assumes
      // the field is the bottom scene — so an ESCAPE ROPE put you on the TITLE
      // SCREEN, asking for a new game, instead of outside the cave.
      var basement = { update: function () {}, draw: function () {} };
      G.scenes = [basement, G.overworldScene];
      var bag = G.BagScene();
      G.pushScene(bag);
      // press A on the only item in the bag
      var realInput = G.input;
      G.input = {
        held: {},
        justPressed: function (b) { return b === 'A'; },
        repeat: function () { return false; },
        heldDir: function () { return null; }
      };
      try { bag.update(); } finally { G.input = realInput; }
      assert(G.world.map.id === 'pewter',
        'the ESCAPE ROPE left you in ' + G.world.map.id + ' — it should climb out to the last CENTRE');
      assert(!G.player.bag.escaperope || G.player.bag.escaperope === 1,
        'the ESCAPE ROPE was not consumed');
      assert(G.scenes.indexOf(G.overworldScene) !== -1,
        'the ESCAPE ROPE popped the field off the scene stack — you would land on the TITLE SCREEN');
      assert(G.scenes.indexOf(bag) === -1, 'the ESCAPE ROPE left the bag open');

      // and a stone, which must resolve to a real evolution
      G.player = {
        party: [G.makeMon('pikachu', 25)], box: [], bag: { thunderstone: 1 },
        dexSeen: {}, dexCaught: {}, money: 0, badges: [], respawn: null
      };
      assert(G.stoneEvolution(G.player.party[0], 'thunderstone') === 'raichu',
        'a THUNDERSTONE no longer turns PIKACHU into RAICHU');
      assert(G.stoneEvolution(G.player.party[0], 'firestone') === null,
        'a FIRE STONE should do nothing to PIKACHU');

      G.scenes = realScenes;
      G.player = realPlayer;
    })();

    // WHAT YOU ARE FACING WINS. Talking is forgiving — anybody standing beside
    // you will do if the tile ahead is empty — but that fallback used to run
    // BEFORE the item and sign checks, which made it greedy rather than
    // forgiving. In ROCK TUNNEL, with a beaten trainer north and an item ball
    // west, facing the ball and pressing A turned you round and replayed the
    // trainer's parting line, every time, and the ball could not be picked up
    // at all.
    (function () {
      function noop2() {}
      var scene = G.overworldScene;
      if (!scene || !scene._interact || !G.MAPS.rocktunnel1f) return;
      var realPlayer = G.player, realTB = G.Textbox;
      var realPush = G.pushScene, realPop = G.popScene, realFlags = G.flags;
      var realMap = G.world.mapId, realX = G.world.player.x, realY = G.world.player.y;

      G.flags = {}; G.flags.rt_lenny = 1;                    // trainer already beaten
      G.player = { party: [G.makeMon('pidgeot', 20)], box: [], bag: {},
                   dexSeen: {}, dexCaught: {}, money: 0, badges: [] };
      G.world.loadMap('rocktunnel1f', 5, 16, 'down');
      G.world.npcs.push({ x: 5, y: 15, dir: 'down', obj: false,
        def: { trainer: 'rt_lenny', beaten: 'Still standing?' } });
      var said = [];
      G.Textbox = function (t) { said.push(String(t)); return { update: noop2, draw: noop2 }; };
      G.pushScene = noop2; G.popScene = noop2;

      var p = G.world.player;
      p.x = 5; p.y = 16; p.dir = 'left';                     // facing the ball at (4,16)
      scene._interact();
      assert(G.player.bag.escaperope === 1,
        'facing an item ball and pressing A did not pick it up — the beaten trainer beside you spoke instead');
      assert(p.dir === 'left', 'picking up an item turned the player away from it');

      // and the forgiving talk still works when there IS nothing ahead
      said.length = 0;
      p.x = 5; p.y = 16; p.dir = 'right';
      scene._interact();
      assert(said.length === 1 && p.dir === 'up',
        'talking to somebody beside you stopped working');

      G.Textbox = realTB; G.pushScene = realPush; G.popScene = realPop;
      G.flags = realFlags; G.player = realPlayer;
      G.world.loadMap(realMap, realX, realY, 'down');
    })();

    // THE EXP SHARE. The whole point of it is that it pays the bench WITHOUT
    // taxing the fighter — Gen 1's own EXP. ALL halved the fighter's share to
    // fund the rest, which is exactly why nobody ever carried one. If that
    // ever regresses, the item silently becomes a punishment for using it.
    (function () {
      var realPlayer = G.player;
      function earned(withShare) {
        G.player = {
          party: ['pidgeot', 'rattata', 'pikachu'].map(function (s) { return G.makeMon(s, 20); }),
          box: [], bag: withShare ? { expshare: 1 } : {},
          dexSeen: {}, dexCaught: {}, money: 0, badges: []
        };
        var before = G.player.party.map(function (m) { return m.exp; });
        var foe = G.makeMon('geodude', 15);
        foe.curHp = 0;
        var b = new G.Battle({ party: G.player.party, foes: [foe], wild: true });
        var gen = b.awardExp(foe), s = gen.next();
        while (!s.done) s = gen.next();
        return G.player.party.map(function (m, i) { return m.exp - before[i]; });
      }
      var without = earned(false), with_ = earned(true);
      assert(without[1] === 0 && without[2] === 0,
        'the bench earned EXP with no EXP SHARE in the bag');
      assert(with_[0] === without[0],
        'the EXP SHARE cost the fighter ' + (without[0] - with_[0]) + ' EXP — it must cost it nothing');
      assert(with_[1] > 0 && with_[1] === Math.floor(without[0] / 2),
        'the EXP SHARE paid the bench ' + with_[1] + ', expected half of ' + without[0]);
      G.player = realPlayer;
    })();

    // FRIENDSHIP and the career record, which are what make a POKéMON yours
    // rather than merely the right level.
    (function () {
      if (!G.friendship) return;
      var m = G.makeMon('pikachu', 10);
      assert(G.friendship(m) === G.FRIEND_START, 'a new POKéMON did not start at the base friendship');
      assert(m.met && m.met.level === 10, 'a new POKéMON recorded no meeting level');
      G.addFriendship(m, 1000);
      assert(G.friendship(m) === G.FRIEND_MAX, 'friendship went past its ceiling');
      G.addFriendship(m, -1000);
      assert(G.friendship(m) === 0, 'friendship went below zero');
      var bands = {};
      for (var f = 0; f <= G.FRIEND_MAX; f += 5) { m.friendship = f; bands[G.friendshipBand(m)[1]] = 1; }
      assert(Object.keys(bands).length === G.FRIEND_BANDS.length,
        'some friendship band can never be reached');
    })();

    // BILL'S PC. G.PCScene was written in full — two columns, transfers both
    // ways, party floor of one and ceiling of six — and nothing in Kanto ever
    // opened it. Anything caught on a full party went into a box with no door.
    // Driven here through the EVENT, so the sign, the event and the scene are
    // all on the hook rather than just the scene.
    (function () {
      if (!G.PCScene || !G.EVENTS || !G.EVENTS.pcStorage) return;
      var realPlayer = G.player, realScenes = G.scenes.slice(), realInput = G.input;
      G.player = {
        party: ['pidgeot', 'rattata', 'pikachu', 'geodude', 'oddish', 'abra']
          .map(function (s) { return G.makeMon(s, 20); }),
        box: [G.makeMon('clefairy', 12)],
        bag: {}, dexSeen: {}, dexCaught: {}, money: 0, badges: []
      };
      G.input = { held: {}, justPressed: function () { return false; },
                  repeat: function () { return false; }, heldDir: function () { return null; } };
      G.runEvent('pcStorage');
      G.topScene().update();                        // let the custom step run
      var pc = G.topScene();
      assert(typeof pc._list === 'function', "the PC sign did not open BILL's storage");

      G.input = { held: {}, justPressed: function (b) { return b === 'A'; },
                  repeat: function () { return false; }, heldDir: function () { return null; } };
      pc.col = 1; pc.bSel = 0;
      pc.update();
      assert(G.player.party.length === 6 && G.player.box.length === 1,
        'the PC let a seventh POKéMON into a full party');
      G.player.party.pop();
      pc.update();
      assert(G.player.party.length === 6 && G.player.box.length === 0,
        'withdrawing from the PC did not move anything');
      pc.col = 0; pc.pSel = 0;
      pc.update();
      assert(G.player.box.length === 1, 'depositing into the PC did not move anything');

      G.input = realInput; G.scenes = realScenes; G.player = realPlayer;
    })();

    // THE SAFARI ZONE is a different game for one battle: no moves, no foe
    // turn, and two levers that pull the catch rate in opposite directions.
    // Driven end to end here because the menu that exposes it is the only
    // place those actions are ever constructed.
    (function () {
      var realPlayer = G.player;
      G.player = { party: [G.makeMon('pidgeot', 40)], box: [], bag: { safariball: 99 },
                   dexSeen: {}, dexCaught: {}, money: 0, badges: [] };
      function drive(action, seed) {
        G.seedRng(seed);
        var wild = G.makeMon('nidoran-m' in G.SPECIES ? 'nidoran-m' : 'kangaskhan', 25);
        var b = new G.Battle({ party: G.player.party, foes: [wild], wild: true, safari: true });
        var hpBefore = G.player.party[0].curHp;
        var gen = b.turn(action), st = gen.next();
        while (!st.done) st = gen.next();
        return { b: b, hurt: G.player.party[0].curHp < hpBefore };
      }
      var r1 = drive({ type: 'bait' }, 11);
      assert(!r1.hurt, 'a SAFARI creature attacked the player');
      assert(r1.b.safariCatchMod < 1, 'BAIT did not make the catch harder');
      var r2 = drive({ type: 'rock' }, 12);
      assert(!r2.hurt, 'a SAFARI creature attacked the player after a ROCK');
      assert(r2.b.safariCatchMod > 1, 'a ROCK did not make the catch easier');

      // and a ball still resolves to a real capture inside a safari battle
      var caught = 0;
      for (var si = 0; si < 120; si++) {
        G.seedRng(500 + si);
        var wild2 = G.makeMon('kangaskhan', 5);
        var b2 = new G.Battle({ party: G.player.party, foes: [wild2], wild: true, safari: true });
        b2.safariCatchMod = 2;
        var g2 = b2.turn({ type: 'ball', id: 'safariball' }), s2 = g2.next();
        while (!s2.done) s2 = g2.next();
        if (b2.caughtMon) caught++;
      }
      G.player = realPlayer;
      assert(caught > 0, 'no SAFARI BALL ever caught anything in 120 throws');
    })();

    // THE OPENING. Every other test in this file exercises a battle, which is
    // the part of the game a player reaches SECOND. The first screens — pick a
    // trainer, type a name — had never been driven at all, and shipped with a
    // crash that froze the game before anyone could take a step.
    //
    // This drives that chain the way a player does: choose, type, submit.
    (function () {
      var realInput = G.input, realAudio = G.audio, realScenes = G.scenes.slice();
      var realPlayer = G.player;
      var pressed = null;
      G.input = { held: {}, justPressed: function (b) { return b === pressed; },
                  repeat: function () { return false; }, step: function () {} };
      G.audio = { sfx: function () {}, playMusic: function () {}, playJingle: function () {},
                  toggleMute: function () {} };
      var realLoadPrev = G.gfx.loadCharacterPreview, realLoadChar = G.gfx.loadCharacter;
      G.gfx.loadCharacterPreview = function () {}; G.gfx.loadCharacter = function () {};

      G.newGame('TEST');
      G.scenes.length = 0;
      var chosen = null;
      G.pushScene(G.CharSelectScene(function (c) { chosen = c; }));
      function press(b) { pressed = b; G.updateScenes(); pressed = null; }

      var err = null;
      try {
        press('A');                                   // pick the trainer
        assert(G.scenes.length === 2, 'choosing a trainer did not open name entry');
        press('A'); press('A'); press('A');           // type
        press('start');                               // submit
      } catch (e) { err = e; }

      G.input = realInput; G.audio = realAudio;
      G.gfx.loadCharacterPreview = realLoadPrev; G.gfx.loadCharacter = realLoadChar;
      G.scenes.length = 0;
      for (var si = 0; si < realScenes.length; si++) G.scenes.push(realScenes[si]);
      var gotName = G.player && G.player.name;
      G.player = realPlayer;

      assert(!err, 'the opening threw: ' + (err && err.message));
      assert(chosen, 'the trainer select never handed back');
      assert(gotName && gotName.length, 'name entry produced no name');
    })();

    // determinism: same seed -> same battle log
    var log1 = G.debug.simBattle('charmander', 'bulbasaur', { n: 1, seed: 42, level: 10, verbose: true }).log.join('|');
    var log2 = G.debug.simBattle('charmander', 'bulbasaur', { n: 1, seed: 42, level: 10, verbose: true }).log.join('|');
    assert(log1 === log2, 'seeded battles should be deterministic');

    // full-battle smoke: strong endpoints can finish a battle
    var pairs = [['venusaur', 'charizard'], ['blastoise', 'alakazam'], ['dragonite', 'snorlax']];
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

