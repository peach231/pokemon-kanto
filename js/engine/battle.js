// Pokéram — battle.js
// Headless battle core. All sequencing is expressed as generators yielding
// plain descriptors; battle_ui.js pumps them with animation, the debug sim
// pumps them discarding everything but text. Descriptor vocabulary:
//   {t:'text', s}                       message
//   {t:'sfx', id}                       sound cue
//   {t:'anim', kind, side}              attack/hit/faint/orbthrow animation cue
//   {t:'hp', side, from, to}            HP bar animates from->to
//   {t:'sendOut', side, mon}            sprite appears
//   {t:'recall', side}                  sprite withdrawn
//   {t:'status', side, status}          status tag updates
//   {t:'shake', n}                      orb shake number n (1-3)
//   {t:'catch', success}                orb resolves
//   {t:'expbar', mon, exp}              exp bar animates (player active only)
//   {t:'choose', kind, ...}             interactive: gen.next(answerIndex)
//        kind:'forget'  options[5] (4 moves + give up), moveId, mon
//        kind:'switch'  forced switch after faint (answer = party index)
//   {t:'end', result:'win'|'lose'|'run'|'caught'}
// Side: 'p' (player) or 'f' (foe).

(function () {
  function stageMul(s) { return s >= 0 ? (2 + s) / 2 : 2 / (2 - s); }
  function accMul(s) { return s >= 0 ? (3 + s) / 3 : 3 / (3 - s); }

  // Gen 1 has ONE Special stage, not separate Sp.Atk and Sp.Def. That is the
  // whole reason Amnesia was broken in 1996: raising it doubled your special
  // offence AND defence at once. Stages track `spc`; effStat maps both modern
  // slots onto it.
  function freshStages() { return { atk: 0, def: 0, spc: 0, spe: 0, acc: 0, eva: 0 }; }

  var STAT_NAMES = { atk: 'Attack', def: 'Defense', spc: 'Special', spe: 'Speed', acc: 'accuracy', eva: 'evasion' };
  var STATUS_NAMES = {
    brn: 'burned', psn: 'poisoned', tox: 'badly poisoned',
    par: 'paralyzed', slp: 'fast asleep', frz: 'frozen solid'
  };

  // opts: { party:[mons], foes:[mons], wild:bool, trainer:trainerDef|null, bag, dexSeen }
  G.Battle = function (opts) {
    this.party = opts.party;
    this.foes = opts.foes;
    this.wild = !!opts.wild;
    this.trainer = opts.trainer || null;
    this.activeP = firstAlive(this.party);
    this.activeF = 0;
    this.stages = { p: freshStages(), f: freshStages() };
    this.flinch = { p: false, f: false };
    this.turnsOut = { p: 0, f: 0 };
    this.aiSwitched = {};       // smart AI: one switch per mon
    this.participants = {};     // party indexes owed exp for current foe
    this.participants[this.activeP] = true;
    this.runAttempts = 0;
    this.over = false;
    this.result = null;
    this.caughtMon = null;
    this.pendingEvolutions = [];
    // weather: null | 'rain' | 'sun' | 'sand'. weatherTurns -1 = permanent
    // (ambient/route weather), >0 = remaining turns (move-induced).
    this.weather = opts.weather || null;
    this.weatherTurns = opts.weather ? -1 : 0;
  };

  var WEATHER_NAMES = { rain: 'rain', sun: 'harsh sunlight', sand: 'a sandstorm' };
  // creatures unaffected by sandstorm chip damage
  function sandImmune(types) {
    return types.indexOf('rock') !== -1 || types.indexOf('ground') !== -1 || types.indexOf('steel') !== -1;
  }

  function firstAlive(party) {
    for (var i = 0; i < party.length; i++) if (party[i].curHp > 0 && !party[i].egg) return i;
    return 0;
  }

  G.Battle.prototype.active = function (side) {
    return side === 'p' ? this.party[this.activeP] : this.foes[this.activeF];
  };

  G.Battle.prototype.effStat = function (side, stat) {
    var mon = this.active(side);
    // spa and spd are the same underlying stat in Gen 1, and share one stage.
    var stageKey = (stat === 'spa' || stat === 'spd') ? 'spc' : stat;
    var v = G.monStats(mon)[stat] * stageMul(this.stages[side][stageKey]);
    if (stat === 'spe' && mon.status === 'par') v *= 0.25;
    if (stat === 'atk' && mon.status === 'brn') v *= 0.5;
    // Reflect / Light Screen double the relevant defence while they last.
    var scr = this.screens && this.screens[side];
    if (scr) {
      if (stat === 'def' && scr.reflect > 0) v *= 2;
      if (stat === 'spd' && scr.lightscreen > 0) v *= 2;
    }
    return Math.max(1, Math.floor(v));
  };

  G.Battle.prototype.anyAlive = function (side) {
    var arr = side === 'p' ? this.party : this.foes;
    for (var i = 0; i < arr.length; i++) if (arr[i].curHp > 0 && !arr[i].egg) return true;
    return false;
  };

  // ------------------------------------------------------------------ damage
  // Returns {dmg, crit, eff}. opts.avg = expected-value mode (AI planning).
  G.Battle.prototype.calcDamage = function (atkSide, move, opts) {
    opts = opts || {};
    var defSide = atkSide === 'p' ? 'f' : 'p';
    var attacker = this.active(atkSide), defender = this.active(defSide);
    var physical = G.isPhysical(move.type);
    var A = this.effStat(atkSide, physical ? 'atk' : 'spa');
    var D = this.effStat(defSide, physical ? 'def' : 'spd');
    var eff = G.typeEff(move.type, G.SPECIES[defender.sp].types);
    if (eff === 0) return { dmg: 0, crit: false, eff: 0 };

    // Gen 1 crit rate is the attacker's SPECIES BASE SPEED / 512, x8 on
    // high-crit moves. Persian crits ~22% of the time and Slowpoke ~3%; a fast
    // mon using Slash crits nearly every turn. That is authentic and kept.
    var crit = false;
    if (!opts.avg) {
      crit = G.rand() < G.critChance(attacker, move, this.focus && this.focus[atkSide]);
    }
    var base = Math.floor(Math.floor(Math.floor((2 * attacker.level / 5 + 2) * move.power * A / D) / 50) + 2);
    var mult = (crit ? 2 : 1) * (opts.avg ? 0.925 : (0.85 + G.rand() * 0.15));
    if (G.SPECIES[attacker.sp].types.indexOf(move.type) !== -1) mult *= 1.5; // STAB
    mult *= eff;
    // No weather in Gen 1 — it did not exist. Burn's attack cut is applied in
    // effStat rather than here, so it also affects the AI's damage estimates.
    var dmg = Math.max(1, Math.floor(base * mult));
    return { dmg: dmg, crit: crit, eff: eff };
  };

  // --------------------------------------------------------------------- AI
  G.Battle.prototype.chooseFoeAction = function () {
    var mon = this.active('f');
    var tier = this.trainer ? (this.trainer.ai || 'basic') : 'wild';
    var usable = [];
    for (var i = 0; i < mon.moves.length; i++) {
      if (mon.moves[i].pp > 0) usable.push(i);
    }
    if (!usable.length) return { type: 'move', slot: -1 }; // struggle

    var damaging = [], statusy = [];
    for (var j = 0; j < usable.length; j++) {
      var mv = G.MOVES[mon.moves[usable[j]].id];
      (mv.power > 0 ? damaging : statusy).push(usable[j]);
    }

    if (tier === 'wild') {
      if (statusy.length && G.chance(0.2)) return { type: 'move', slot: G.pick(statusy) };
      return { type: 'move', slot: damaging.length ? G.pick(damaging) : G.pick(usable) };
    }

    // expected damage for each damaging move
    var best = -1, bestDmg = -1;
    var expected = {};
    for (var k = 0; k < damaging.length; k++) {
      var slot = damaging[k];
      var m = G.MOVES[mon.moves[slot].id];
      var e = this.calcDamage('f', m, { avg: true }).dmg * (m.acc / 100);
      expected[slot] = e;
      if (e > bestDmg) { bestDmg = e; best = slot; }
    }

    if (tier === 'basic') {
      if (best === -1) return { type: 'move', slot: G.pick(usable) };
      if (G.chance(0.8)) return { type: 'move', slot: best };
      return { type: 'move', slot: G.pick(damaging) };
    }

    // smart: KO if possible
    var target = this.active('p');
    if (best !== -1 && bestDmg >= target.curHp) return { type: 'move', slot: best };

    // switch if hard-walled and bench answers (once per mon)
    if (best !== -1 && !this.aiSwitched[this.activeF]) {
      var allWeak = true;
      for (var d = 0; d < damaging.length; d++) {
        var mvd = G.MOVES[mon.moves[damaging[d]].id];
        if (G.typeEff(mvd.type, G.SPECIES[target.sp].types) > 0.5) { allWeak = false; break; }
      }
      if (allWeak) {
        for (var f = 0; f < this.foes.length; f++) {
          if (f === this.activeF || this.foes[f].curHp <= 0) continue;
          var bench = this.foes[f];
          for (var bm = 0; bm < bench.moves.length; bm++) {
            var bmv = G.MOVES[bench.moves[bm].id];
            if (bmv.power > 0 && G.typeEff(bmv.type, G.SPECIES[target.sp].types) >= 2) {
              this.aiSwitched[this.activeF] = true;
              return { type: 'switch', index: f };
            }
          }
        }
      }
    }

    // opener status move 50% if foe is clean
    if (statusy.length && this.turnsOut.f === 0 && !target.status && G.chance(0.5)) {
      return { type: 'move', slot: G.pick(statusy) };
    }
    if (best !== -1) return { type: 'move', slot: best };
    return { type: 'move', slot: G.pick(usable) };
  };

  // ------------------------------------------------------------------- turn
  // pAction: {type:'move', slot} | {type:'switch', index} | {type:'item', id, target}
  //        | {type:'orb', id} | {type:'run'}
  G.Battle.prototype.turn = function* (pAction) {
    var fAction = this.chooseFoeAction();
    var order = this.orderActions(pAction, fAction);
    // bind each action to the creature that chose it: if it faints (or is
    // replaced) before acting, its action is cancelled — the fresh switch-in
    // never inherits a dead teammate's move, and next turn reorders by speed
    for (var b = 0; b < order.length; b++) order[b].actor = this.active(order[b].side);

    for (var i = 0; i < order.length; i++) {
      if (this.over) return;
      var side = order[i].side, action = order[i].action;
      if (this.active(side) !== order[i].actor) continue; // actor was replaced
      if (this.active(side).curHp <= 0) continue;          // fainted before acting
      yield* this.doAction(side, action);
    }
    if (this.over) return;
    yield* this.endOfTurn();
    this.turnsOut.p++;
    this.turnsOut.f++;
  };

  G.Battle.prototype.orderActions = function (pAction, fAction) {
    var pPri = actionPriority(pAction, this, 'p');
    var fPri = actionPriority(fAction, this, 'f');
    if (pPri !== fPri) {
      return pPri > fPri
        ? [{ side: 'p', action: pAction }, { side: 'f', action: fAction }]
        : [{ side: 'f', action: fAction }, { side: 'p', action: pAction }];
    }
    var pSpe = this.effStat('p', 'spe'), fSpe = this.effStat('f', 'spe');
    var pFirst = pSpe === fSpe ? G.chance(0.5) : pSpe > fSpe;
    return pFirst
      ? [{ side: 'p', action: pAction }, { side: 'f', action: fAction }]
      : [{ side: 'f', action: fAction }, { side: 'p', action: pAction }];
  };

  function actionPriority(action, battle, side) {
    if (action.type === 'switch') return 100;
    if (action.type === 'item' || action.type === 'orb') return 90;
    if (action.type === 'run') return 80;
    var mon = battle.active(side);
    var move = action.slot === -1 ? G.MOVES.struggle : G.MOVES[mon.moves[action.slot].id];
    return move.priority;
  }

  G.Battle.prototype.doAction = function* (side, action) {
    if (action.type === 'switch') {
      yield* this.doSwitch(side, action.index);
    } else if (action.type === 'item') {
      yield* this.doItem(action);
    } else if (action.type === 'orb') {
      yield* this.doOrb(action.id);
    } else if (action.type === 'run') {
      yield* this.doRun();
    } else {
      yield* this.useMove(side, action.slot);
    }
  };

  // Healing/cure/revive items are FREE actions: applied on the spot, the
  // foe does not get a move, and the player still picks a real action for
  // the turn. (Orbs still consume the turn — catching is a gamble.)
  G.Battle.prototype.freeAction = function* (pAction) {
    yield* this.doItem(pAction);
  };

  G.Battle.prototype.doSwitch = function* (side, index) {
    var name = G.monName(this.active(side));
    if (side === 'p') {
      yield { t: 'text', s: 'Come back, ' + name + '!' };
      yield { t: 'recall', side: 'p' };
      this.activeP = index;
      this.stages.p = freshStages();
      this.flinch.p = false;
      this.turnsOut.p = 0;
      this.participants[index] = true;
      var mon = this.party[index];
      yield { t: 'text', s: 'Go, ' + G.monName(mon) + '!' };
      yield { t: 'sendOut', side: 'p', mon: mon };
    } else {
      yield { t: 'text', s: (this.trainer ? this.trainer.name : 'The foe') + ' recalled ' + name + '!' };
      yield { t: 'recall', side: 'f' };
      this.activeF = index;
      this.stages.f = freshStages();
      this.flinch.f = false;
      this.turnsOut.f = 0;
      this.participants = {};
      this.participants[this.activeP] = true;
      var fmon = this.foes[index];
      yield { t: 'text', s: (this.trainer ? this.trainer.name : 'The foe') + ' sent out ' + G.monName(fmon) + '!' };
      yield { t: 'sendOut', side: 'f', mon: fmon };
    }
  };

  G.Battle.prototype.doItem = function* (action) {
    var item = G.ITEMS[action.id];
    var target = this.party[action.target !== undefined ? action.target : this.activeP];
    var stats = G.monStats(target);
    yield { t: 'text', s: 'You used a ' + item.name + '!' };
    if (item.kind === 'heal') {
      var from = target.curHp;
      target.curHp = Math.min(stats.hp, target.curHp + item.amount);
      yield { t: 'sfx', id: 'heal' };
      if (action.target === undefined || action.target === this.activeP) {
        yield { t: 'hp', side: 'p', from: from, to: target.curHp };
      }
      yield { t: 'text', s: G.monName(target) + ' recovered ' + (target.curHp - from) + ' HP!' };
    } else if (item.kind === 'cure') {
      if (target.status && item.statuses.indexOf(target.status) !== -1) {
        target.status = null;
        target.slpTurns = 0;
        yield { t: 'sfx', id: 'heal' };
        yield { t: 'status', side: 'p', status: null };
        yield { t: 'text', s: G.monName(target) + ' is back to normal!' };
      } else {
        yield { t: 'text', s: 'It had no effect...' };
      }
    } else if (item.kind === 'revive') {
      if (target.curHp <= 0) {
        target.curHp = Math.max(1, Math.floor(stats.hp * item.frac));
        yield { t: 'sfx', id: 'heal' };
        yield { t: 'text', s: G.monName(target) + ' came back to its senses!' };
      } else {
        yield { t: 'text', s: 'It had no effect...' };
      }
    }
  };

  // Gen-3-style catch math, 4 shake checks.
  G.Battle.prototype.doOrb = function* (orbId) {
    var orb = G.ITEMS[orbId];
    var mon = this.active('f');
    var stats = G.monStats(mon);
    var sp = G.SPECIES[mon.sp];
    yield { t: 'text', s: 'You threw a ' + orb.name + '!' };
    yield { t: 'anim', kind: 'orbThrow', side: 'f' };
    yield { t: 'sfx', id: 'orbShake' };

    if (!this.wild) { // shouldn't happen (UI blocks), but stay safe
      yield { t: 'text', s: "You can't catch another trainer's creature!" };
      return;
    }

    // ball modifier — some are conditional (Gen 3 style)
    var mod = orb.mod || 1;
    if (orb.special === 'net') {
      mod = (sp.types.indexOf('water') !== -1 || sp.types.indexOf('bug') !== -1) ? 3.5 : 1.0;
    } else if (orb.special === 'dive') {
      mod = (G.world && G.world.player && G.world.player.vehicle) ? 3.5 : 1.0;
    } else if (orb.special === 'nest') {
      mod = Math.max(1, Math.min(4, (41 - mon.level) / 10)); // better on low-level wilds
    } else if (orb.special === 'timer') {
      mod = Math.min(4, 1 + this.turnsOut.p / 5); // grows as the battle drags on
    }
    var statusMod = mon.status === 'slp' ? 2 : (mon.status ? 1.5 : 1);
    var a = Math.floor((3 * stats.hp - 2 * mon.curHp) * sp.catchRate * mod / (3 * stats.hp)) * statusMod;

    var shakes = 0;
    if (a >= 255) {
      shakes = 4;
    } else {
      var b = Math.floor(65536 / Math.pow(255 / a, 0.25));
      for (var i = 0; i < 4; i++) {
        if (G.irand(65536) < b) shakes++;
        else break;
      }
    }

    for (var s = 1; s <= Math.min(3, shakes); s++) {
      yield { t: 'shake', n: s };
      yield { t: 'sfx', id: 'orbShake' };
    }

    if (shakes === 4) {
      yield { t: 'catch', success: true };
      yield { t: 'sfx', id: 'catchClick' };
      yield { t: 'text', s: 'Gotcha! ' + G.monName(mon) + ' was caught!' };
      this.caughtMon = mon;
      this.over = true;
      this.result = 'caught';
      yield { t: 'end', result: 'caught' };
    } else {
      yield { t: 'catch', success: false };
      var lines = ['Oh no! It broke free!', 'Aww! So close!', 'Argh! Almost had it!', 'Shoot! It was caught for a moment!'];
      yield { t: 'text', s: lines[Math.min(3, shakes)] };
    }
  };

  G.Battle.prototype.doRun = function* () {
    if (!this.wild) {
      yield { t: 'text', s: "There's no running from a trainer battle!" };
      return;
    }
    this.runAttempts++;
    var pSpe = G.monStats(this.active('p')).spe;
    var fSpe = Math.max(1, G.monStats(this.active('f')).spe);
    var F = (Math.floor(pSpe * 128 / fSpe) + 30 * this.runAttempts) % 256;
    if (G.irand(256) < F) {
      yield { t: 'sfx', id: 'run' };
      yield { t: 'text', s: 'Got away safely!' };
      this.over = true;
      this.result = 'run';
      yield { t: 'end', result: 'run' };
    } else {
      yield { t: 'text', s: "Can't escape!" };
    }
  };

  // ------------------------------------------------------------------ moves
  G.Battle.prototype.useMove = function* (side, slot) {
    var battle = this;
    var other = side === 'p' ? 'f' : 'p';
    var mon = this.active(side);
    var name = (side === 'f' ? 'Foe ' : '') + G.monName(mon);

    // sleep
    if (mon.status === 'slp') {
      if (mon.slpTurns > 0) {
        mon.slpTurns--;
        yield { t: 'text', s: name + ' is fast asleep.' };
        return;
      }
      mon.status = null;
      yield { t: 'status', side: side, status: null };
      yield { t: 'text', s: name + ' woke up!' };
    }
    // flinch
    if (this.flinch[side]) {
      this.flinch[side] = false;
      yield { t: 'text', s: name + ' flinched!' };
      return;
    }
    // paralysis
    if (mon.status === 'par' && G.chance(0.25)) {
      yield { t: 'text', s: name + " is paralyzed! It can't move!" };
      return;
    }

    var move, moveSlot = null;
    if (slot === -1) {
      move = G.MOVES.struggle;
    } else {
      moveSlot = mon.moves[slot];
      move = G.MOVES[moveSlot.id];
      moveSlot.pp--;
    }

    yield { t: 'text', s: name + ' used ' + move.name + '!' };
    var physical = move.power > 0 && G.isPhysical(move.type);
    if (physical) yield { t: 'anim', kind: 'attack', side: side }; // contact lunge

    // accuracy
    var hitChance = move.acc * accMul(this.stages[side].acc - this.stages[other].eva);
    if (G.rand() * 100 >= hitChance) {
      yield { t: 'text', s: 'The attack missed!' };
      // Jump Kick / Hi Jump Kick: missing means hitting the floor instead.
      if (move.effect && move.effect.kind === 'crash') {
        var crashDmg = Math.max(1, Math.floor(G.monStats(mon).hp * move.effect.frac));
        var cFrom = mon.curHp;
        mon.curHp = Math.max(0, mon.curHp - crashDmg);
        yield { t: 'hp', side: side, from: cFrom, to: mon.curHp };
        yield { t: 'text', s: name + ' kept going and crashed!' };
        yield* this.checkFaints();
      }
      return;
    }

    if (move.power === 0) {
      // a type-themed aura for the status/buff move, then apply it
      var fxCat = (move.effect && move.effect.kind === 'stages' && move.effect.target === 'self') ? 'buff'
        : (move.effect && move.effect.kind === 'weather') ? 'buff' : 'debuff';
      yield { t: 'anim', kind: 'moveFx', side: side, type: move.type, category: fxCat };
      yield* this.applyEffect(side, other, move.effect, true);
      return;
    }

    // damaging move — a type-themed projectile (special) or impact (physical),
    // or a per-move signature animation when the move defines `anim`.
    yield { t: 'anim', kind: 'moveFx', side: side, type: move.type, category: physical ? 'phys' : 'spec', anim: move.anim };
    var foe = this.active(other);
    var hits = 1;
    if (move.effect && move.effect.kind === 'multiHit') {
      var r8 = G.irand(8); // 2-5 hits, weighted toward 2-3 like the classics
      hits = r8 < 3 ? 2 : r8 < 6 ? 3 : r8 < 7 ? 4 : 5;
    }
    // --- damage shapes that ignore the normal formula -------------------
    var ek0 = move.effect && move.effect.kind;

    if (ek0 === 'ohko') {
      // Gen 1 one-hit KOs fail outright against anything faster than you.
      if (this.effStat(other, 'spe') > this.effStat(side, 'spe')) {
        yield { t: 'text', s: 'But it failed!' };
        return;
      }
      var oFrom = foe.curHp;
      foe.curHp = 0;
      yield { t: 'sfx', id: 'superEff' };
      yield { t: 'hp', side: other, from: oFrom, to: 0 };
      yield { t: 'text', s: "It's a one-hit KO!" };
      yield* this.checkFaints();
      return;
    }

    if (ek0 === 'fixed') {
      var fd;
      if (move.effect.mode === 'level') fd = mon.level;
      else if (move.effect.mode === 'const') fd = move.effect.value;
      else if (move.effect.mode === 'half') fd = Math.max(1, Math.floor(foe.curHp / 2));
      else fd = Math.max(1, Math.floor(mon.level * (0.5 + G.rand())));  // Psywave
      var xFrom = foe.curHp;
      foe.curHp = Math.max(0, foe.curHp - fd);
      yield { t: 'sfx', id: 'hit' };
      yield { t: 'anim', kind: 'hit', side: other };
      yield { t: 'hp', side: other, from: xFrom, to: foe.curHp };
      yield* this.checkFaints();
      return;
    }

    var totalDealt = 0;
    var eff = 1;
    for (var h = 0; h < hits && foe.curHp > 0; h++) {
      var res = this.calcDamage(side, move);
      eff = res.eff;
      if (res.eff === 0) {
        yield { t: 'text', s: "It doesn't affect " + G.monName(foe) + '...' };
        return;
      }
      var from = foe.curHp;
      foe.curHp = Math.max(0, foe.curHp - res.dmg);
      totalDealt += from - foe.curHp;
      yield { t: 'sfx', id: res.eff > 1 ? 'superEff' : res.eff < 1 ? 'notVery' : 'hit' };
      yield { t: 'anim', kind: 'hit', side: other };
      yield { t: 'hp', side: other, from: from, to: foe.curHp };
      if (res.crit) yield { t: 'text', s: 'A critical hit!' };
    }
    if (hits > 1) yield { t: 'text', s: 'Hit ' + hits + ' time(s)!' };
    if (eff > 1) yield { t: 'text', s: "It's super effective!" };
    if (eff < 1 && eff > 0) yield { t: 'text', s: "It's not very effective..." };

    // secondary effects
    if (move.effect && foe.curHp > 0) {
      var ek = move.effect.kind;
      if (ek === 'status' || ek === 'stages') {
        var chance = move.effect.chance === undefined ? 100 : move.effect.chance;
        if (G.rand() * 100 < chance) yield* this.applyEffect(side, other, move.effect, false);
      } else if (ek === 'flinch') {
        if (G.rand() * 100 < move.effect.chance) this.flinch[other] = true;
      }
    }
    if (move.effect && move.effect.kind === 'drain' && totalDealt > 0) {
      var heal = Math.max(1, Math.floor(totalDealt * move.effect.frac));
      var mFrom = mon.curHp;
      mon.curHp = Math.min(G.monStats(mon).hp, mon.curHp + heal);
      if (mon.curHp !== mFrom) {
        yield { t: 'hp', side: side, from: mFrom, to: mon.curHp };
        yield { t: 'text', s: name + ' drained energy!' };
      }
    }
    // Pay Day scatters coins you pick up after the battle.
    if (move.effect && move.effect.kind === 'payday') {
      this.payDay = (this.payDay || 0) + mon.level * 2;
      yield { t: 'text', s: 'Coins scattered everywhere!' };
    }

    // Selfdestruct / Explosion: the user faints, always.
    if (move.effect && move.effect.kind === 'explode') {
      var eFrom = mon.curHp;
      mon.curHp = 0;
      yield { t: 'hp', side: side, from: eFrom, to: 0 };
      yield { t: 'text', s: name + ' fainted from the blast!' };
      yield* this.checkFaints();
      return;
    }

    // Hyper Beam has to recharge; Jump Kick hurts you if it misses (handled
    // in the miss branch) — here it is the successful case, so nothing to do.
    if (move.effect && move.effect.kind === 'recharge') {
      this.recharge = this.recharge || {};
      this.recharge[side] = true;
      yield { t: 'text', s: name + ' must recharge!' };
    }

    if (move.effect && move.effect.kind === 'recoil' && totalDealt > 0) {
      var rec = Math.max(1, Math.floor(totalDealt * move.effect.frac));
      var rFrom = mon.curHp;
      mon.curHp = Math.max(0, mon.curHp - rec);
      yield { t: 'hp', side: side, from: rFrom, to: mon.curHp };
      yield { t: 'text', s: name + ' was hurt by recoil!' };
    }

    yield* this.checkFaints();
  };

  // effect application (status moves + secondary procs)
  G.Battle.prototype.applyEffect = function* (side, other, effect, isPrimary) {
    if (!effect) { yield { t: 'text', s: 'But nothing happened...' }; return; }
    if (effect.kind === 'status') {
      var foe = this.active(other);
      var foeName = (other === 'f' ? 'Foe ' : '') + G.monName(foe);
      var types = G.SPECIES[foe.sp].types;
      // Gen 1 immunities only. There is no Steel type, and ELECTRIC-types can
      // absolutely still be paralysed — that immunity did not arrive until
      // Gen 6, and Thunder Wave beating a Pikachu is period-correct.
      var immune =
        (effect.status === 'brn' && types.indexOf('fire') !== -1) ||
        ((effect.status === 'psn' || effect.status === 'tox') && types.indexOf('poison') !== -1) ||
        (effect.status === 'frz' && types.indexOf('ice') !== -1);
      if (foe.status || immune) {
        if (isPrimary) yield { t: 'text', s: 'But it failed!' };
        return;
      }
      foe.status = effect.status;
      if (effect.status === 'slp') foe.slpTurns = 1 + G.irand(3);
      yield { t: 'sfx', id: 'statusHit' };
      yield { t: 'status', side: other, status: effect.status };
      yield { t: 'text', s: foeName + ' is ' + STATUS_NAMES[effect.status] + '!' };
    } else if (effect.kind === 'stages') {
      var tgtSide = effect.target === 'self' ? side : other;
      var mon = this.active(tgtSide);
      var monName = (tgtSide === 'f' ? 'Foe ' : '') + G.monName(mon);
      var st = this.stages[tgtSide];
      var cur = st[effect.stat];
      var next = G.clamp(cur + effect.delta, -6, 6);
      if (next === cur) {
        if (isPrimary) yield { t: 'text', s: monName + "'s " + STAT_NAMES[effect.stat] + " won't go any " + (effect.delta > 0 ? 'higher!' : 'lower!') };
        return;
      }
      st[effect.stat] = next;
      var amount = Math.abs(next - cur) >= 2 ? 'sharply ' : '';
      yield { t: 'sfx', id: effect.delta > 0 ? 'statUp' : 'statDown' };
      yield { t: 'text', s: monName + "'s " + STAT_NAMES[effect.stat] + ' ' + (effect.delta > 0 ? amount + 'rose!' : amount + 'fell!') };
    } else {
      yield* this.applyGen1Effect(side, other, effect, isPrimary);
    }
  };

  // ---------------------------------------------------------------------------
  // The rest of Gen 1's effect vocabulary.
  //
  // Some of these are genuinely multi-turn — Wrap holding you still, Bide
  // storing damage, Transform copying a moveset. Rather than let them fall
  // through the switch and silently do NOTHING, which is what an unrecognised
  // effect kind does, each resolves to a faithful single-turn equivalent with
  // the right message. A player should never watch a move visibly accomplish
  // nothing and be unable to tell whether that was the design.
  // ---------------------------------------------------------------------------
  G.Battle.prototype.applyGen1Effect = function* (side, other, effect, isPrimary) {
    var mon = this.active(side);
    var foe = this.active(other);
    var name = (side === 'f' ? 'Foe ' : '') + G.monName(mon);
    var foeName = (other === 'f' ? 'Foe ' : '') + G.monName(foe);
    var k = effect.kind;

    this.screens = this.screens || { p: { reflect: 0, lightscreen: 0 }, f: { reflect: 0, lightscreen: 0 } };
    this.focus = this.focus || {};
    this.mist = this.mist || {};

    if (k === 'confuse') {
      if (foe.confused) { if (isPrimary) yield { t: 'text', s: 'But it failed!' }; return; }
      foe.confused = 2 + G.irand(4);
      yield { t: 'sfx', id: 'statusHit' };
      yield { t: 'text', s: foeName + ' became confused!' };

    } else if (k === 'heal' || k === 'rest') {
      var max = G.monStats(mon).hp;
      if (mon.curHp >= max && k === 'heal') { yield { t: 'text', s: 'But it failed!' }; return; }
      var hFrom = mon.curHp;
      mon.curHp = k === 'rest' ? max : Math.min(max, mon.curHp + Math.floor(max * 0.5));
      if (k === 'rest') {
        mon.status = 'slp';           // Rest cures everything by knocking you out
        mon.slpTurns = 2;
        yield { t: 'status', side: side, status: 'slp' };
        yield { t: 'text', s: name + ' went to sleep and became healthy!' };
      } else {
        yield { t: 'text', s: name + ' regained health!' };
      }
      yield { t: 'hp', side: side, from: hFrom, to: mon.curHp };

    } else if (k === 'haze') {
      this.stages.p = { atk: 0, def: 0, spc: 0, spe: 0, acc: 0, eva: 0 };
      this.stages.f = { atk: 0, def: 0, spc: 0, spe: 0, acc: 0, eva: 0 };
      this.focus.p = this.focus.f = false;
      yield { t: 'sfx', id: 'statusHit' };
      yield { t: 'text', s: 'All stat changes were eliminated!' };

    } else if (k === 'focusenergy') {
      if (this.focus[side]) { yield { t: 'text', s: 'But it failed!' }; return; }
      this.focus[side] = true;
      yield { t: 'text', s: name + ' is getting pumped!' };

    } else if (k === 'screen') {
      var scr = this.screens[side];
      if (scr[effect.which] > 0) { yield { t: 'text', s: 'But it failed!' }; return; }
      scr[effect.which] = 5;
      yield { t: 'sfx', id: 'statUp' };
      yield { t: 'text', s: effect.which === 'reflect'
        ? name + ' is shielded against physical moves!'
        : name + ' is shielded against special moves!' };

    } else if (k === 'mist') {
      this.mist[side] = true;
      yield { t: 'text', s: name + ' is shrouded in mist!' };

    } else if (k === 'leechseed') {
      if (G.SPECIES[foe.sp].types.indexOf('grass') !== -1) {
        yield { t: 'text', s: "It doesn't affect " + foeName + '...' };
        return;
      }
      if (foe.seeded) { yield { t: 'text', s: 'But it failed!' }; return; }
      foe.seeded = true;
      yield { t: 'text', s: foeName + ' was seeded!' };

    } else if (k === 'trap') {
      // Wrap / Bind / Fire Spin / Clamp. Chip damage plus a lost turn is the
      // felt effect of Gen 1's partial-trapping lock, without reproducing the
      // turn-skipping bug that made it genuinely unfair.
      var tDmg = Math.max(1, Math.floor(G.monStats(foe).hp / 16));
      var tFrom = foe.curHp;
      foe.curHp = Math.max(0, foe.curHp - tDmg);
      this.flinch[other] = true;
      yield { t: 'hp', side: other, from: tFrom, to: foe.curHp };
      yield { t: 'text', s: foeName + ' was trapped and cannot move!' };
      yield* this.checkFaints();

    } else if (k === 'switchout') {
      if (this.wild && other === 'f') {
        yield { t: 'text', s: foeName + ' fled!' };
        this.over = true; this.result = 'fled';
      } else {
        yield { t: 'text', s: 'But it failed!' };
      }

    } else if (k === 'splash') {
      yield { t: 'text', s: 'But nothing happened!' };

    } else if (k === 'disable') {
      var usable = foe.moves.filter(function (m) { return m.pp > 0; });
      if (!usable.length) { yield { t: 'text', s: 'But it failed!' }; return; }
      var dm = usable[G.irand(usable.length)];
      dm.pp = 0;
      yield { t: 'text', s: foeName + "'s " + G.MOVES[dm.id].name + ' was disabled!' };

    } else if (k === 'substitute') {
      var cost = Math.floor(G.monStats(mon).hp / 4);
      if (mon.curHp <= cost) { yield { t: 'text', s: 'It was too weak to make a substitute!' }; return; }
      var sFrom = mon.curHp;
      mon.curHp -= cost;
      this.stages[side].def = G.clamp(this.stages[side].def + 2, -6, 6);
      yield { t: 'hp', side: side, from: sFrom, to: mon.curHp };
      yield { t: 'text', s: name + ' put up a substitute!' };

    } else if (k === 'metronome' || k === 'mirrormove') {
      // Pick a real move and actually resolve it, rather than shrugging.
      var pool = k === 'mirrormove'
        ? foe.moves.map(function (m) { return m.id; })
        : Object.keys(G.MOVES).filter(function (id) {
            var e = G.MOVES[id].effect;
            return id !== 'struggle'
              && !(e && (e.kind === 'metronome' || e.kind === 'mirrormove'));
          });
      if (!pool.length) { yield { t: 'text', s: 'But it failed!' }; return; }
      var pick = G.MOVES[pool[G.irand(pool.length)]];
      yield { t: 'text', s: name + ' used ' + pick.name + '!' };
      if (pick.power > 0) {
        var res = this.calcDamage(side, pick);
        var pFrom = foe.curHp;
        foe.curHp = Math.max(0, foe.curHp - res.dmg);
        yield { t: 'sfx', id: res.eff > 1 ? 'superEff' : res.eff < 1 ? 'notVery' : 'hit' };
        yield { t: 'anim', kind: 'hit', side: other };
        yield { t: 'hp', side: other, from: pFrom, to: foe.curHp };
        yield* this.checkFaints();
      } else if (pick.effect) {
        yield* this.applyEffect(side, other, pick.effect, true);
      }

    } else if (k === 'conversion') {
      mon.overrideTypes = G.SPECIES[foe.sp].types.slice();
      yield { t: 'text', s: name + ' changed type to match ' + foeName + '!' };

    } else if (k === 'transform') {
      mon.overrideTypes = G.SPECIES[foe.sp].types.slice();
      mon.moves = foe.moves.map(function (m) { return { id: m.id, pp: 5, maxPp: 5 }; });
      yield { t: 'text', s: name + ' transformed into ' + G.SPECIES[foe.sp].name + '!' };

    } else if (k === 'mimic') {
      var fresh = foe.moves.filter(function (m) { return !G.knowsMove(mon, m.id); });
      if (!fresh.length) { yield { t: 'text', s: 'But it failed!' }; return; }
      var learned = fresh[G.irand(fresh.length)];
      mon.moves[G.irand(mon.moves.length)] = { id: learned.id, pp: 5, maxPp: 5 };
      yield { t: 'text', s: name + ' learned ' + G.MOVES[learned.id].name + '!' };

    } else if (k === 'bide' || k === 'rage') {
      // Both are "take it and hit back harder". An attack boost is the part a
      // player actually feels.
      this.stages[side].atk = G.clamp(this.stages[side].atk + 1, -6, 6);
      yield { t: 'text', s: name + (k === 'bide' ? ' is storing energy!' : "'s RAGE is building!") };

    } else if (k === 'charge') {
      yield { t: 'text', s: name + ' gathered itself!' };

    } else if (isPrimary) {
      yield { t: 'text', s: 'But nothing happened...' };
    }
  };

  // ------------------------------------------------------------- faints/exp
  G.Battle.prototype.checkFaints = function* () {
    var foe = this.active('f');
    var player = this.active('p');

    if (foe.curHp <= 0) {
      yield { t: 'anim', kind: 'faint', side: 'f' };
      yield { t: 'sfx', id: 'faint' };
      yield { t: 'text', s: (this.trainer ? 'Foe ' : 'Wild ') + G.monName(foe) + ' fainted!' };
      yield* this.awardExp(foe);
      if (this.over) return;

      var next = -1;
      for (var i = 0; i < this.foes.length; i++) {
        if (this.foes[i].curHp > 0) { next = i; break; }
      }
      if (next === -1) {
        yield* this.winBattle();
        return;
      }
      // shift mode: offer a free switch while the trainer readies their next
      if (this.trainer && this.active('p').curHp > 0) {
        var benched = 0;
        for (var bi = 0; bi < this.party.length; bi++) {
          if (this.party[bi].curHp > 0 && !this.party[bi].egg && bi !== this.activeP) benched++;
        }
        if (benched > 0) {
          var pick = yield { t: 'choose', kind: 'shift', incoming: this.foes[next] };
          if (pick >= 0) yield* this.doSwitch('p', pick);
        }
      }
      yield* this.doSwitch('f', next);
    }

    if (!this.over && player.curHp <= 0) {
      yield { t: 'anim', kind: 'faint', side: 'p' };
      yield { t: 'sfx', id: 'faint' };
      yield { t: 'text', s: G.monName(player) + ' fainted!' };
      delete this.participants[this.activeP];
      if (!this.anyAlive('p')) {
        this.over = true;
        this.result = 'lose';
        yield { t: 'end', result: 'lose' };
        return;
      }
      var pick = yield { t: 'choose', kind: 'switch' };
      yield* this.doSwitch('p', pick);
    }
  };

  G.Battle.prototype.winBattle = function* () {
    this.over = true;
    this.result = 'win';
    if (this.trainer) {
      yield { t: 'text', s: 'You defeated ' + this.trainer.name + '!' };
      if (this.trainer.defeat) yield { t: 'text', s: this.trainer.name + ': ' + this.trainer.defeat };
      if (this.trainer.money) {
        yield { t: 'sfx', id: 'money' };
        yield { t: 'text', s: 'You got $' + this.trainer.money + ' for winning!' };
      }
    }
    yield { t: 'end', result: 'win' };
  };

  G.Battle.prototype.awardExp = function* (faintedFoe) {
    var sp = G.SPECIES[faintedFoe.sp];
    var amount = Math.floor(sp.expYield * faintedFoe.level / 6);
    if (this.trainer) amount = Math.floor(amount * 1.5);

    for (var idx in this.participants) {
      var mon = this.party[idx];
      if (!mon || mon.curHp <= 0) continue;
      yield { t: 'text', s: G.monName(mon) + ' gained ' + amount + ' EXP!' };
      if (Number(idx) === this.activeP) yield { t: 'expbar', mon: mon, exp: mon.exp + amount };
      var before = G.monStats(mon);          // snapshot to diff stat growth
      var events = G.gainExp(mon, amount);
      var learns = [], leveled = false;
      for (var e = 0; e < events.length; e++) {
        var ev = events[e];
        if (ev.type === 'level') {
          leveled = true;
          yield { t: 'sfx', id: 'levelUp' };
          yield { t: 'text', s: G.monName(mon) + ' grew to level ' + ev.level + '!' };
        } else if (ev.type === 'learn') {
          learns.push(ev.moveId); // deferred so the stat panel shows first
        }
      }
      if (leveled) yield { t: 'levelstats', mon: mon, before: before, after: G.monStats(mon) };
      for (var li = 0; li < learns.length; li++) yield* this.learnMove(mon, learns[li]);
      var evo = G.evolutionDue(mon);
      if (evo && !this.pendingEvolutions.some(function (p) { return p.mon === mon; })) {
        this.pendingEvolutions.push({ mon: mon, to: evo });
      }
    }
    // reset participation for the next foe
    this.participants = {};
    this.participants[this.activeP] = true;
  };

  G.Battle.prototype.learnMove = function* (mon, moveId) {
    if (G.knowsMove(mon, moveId)) return;
    var move = G.MOVES[moveId];
    if (mon.moves.length < 4) {
      mon.moves.push({ id: moveId, pp: move.pp, maxPp: move.pp });
      yield { t: 'sfx', id: 'levelUp' };
      yield { t: 'text', s: G.monName(mon) + ' learned ' + move.name + '!' };
      return;
    }
    yield { t: 'text', s: G.monName(mon) + ' wants to learn ' + move.name + ', but it already knows 4 moves!' };
    var pick = yield { t: 'choose', kind: 'forget', mon: mon, moveId: moveId };
    if (pick >= 0 && pick < 4) {
      var old = G.MOVES[mon.moves[pick].id].name;
      mon.moves[pick] = { id: moveId, pp: move.pp, maxPp: move.pp };
      yield { t: 'text', s: '1, 2, and... poof! ' + G.monName(mon) + ' forgot ' + old + ' and learned ' + move.name + '!' };
    } else {
      yield { t: 'text', s: G.monName(mon) + ' did not learn ' + move.name + '.' };
    }
  };

  // ------------------------------------------------------------ end of turn
  G.Battle.prototype.endOfTurn = function* () {
    var sides = this.effStat('p', 'spe') >= this.effStat('f', 'spe') ? ['p', 'f'] : ['f', 'p'];
    for (var i = 0; i < sides.length; i++) {
      if (this.over) return;
      var side = sides[i];
      var mon = this.active(side);
      if (mon.curHp <= 0) continue;
      if (mon.status === 'brn' || mon.status === 'psn') {
        var tick = Math.max(1, Math.floor(G.monStats(mon).hp / 8));
        var from = mon.curHp;
        mon.curHp = Math.max(0, mon.curHp - tick);
        var name = (side === 'f' ? 'Foe ' : '') + G.monName(mon);
        yield { t: 'hp', side: side, from: from, to: mon.curHp };
        yield { t: 'text', s: name + ' is hurt by its ' + (mon.status === 'brn' ? 'burn!' : 'poison!') };
        yield* this.checkFaints();
      }
      if (this.over) return;
      // sandstorm chip
      if (this.weather === 'sand' && mon.curHp > 0 && !sandImmune(G.SPECIES[mon.sp].types)) {
        var sTick = Math.max(1, Math.floor(G.monStats(mon).hp / 16));
        var sFrom = mon.curHp;
        mon.curHp = Math.max(0, mon.curHp - sTick);
        var sName = (side === 'f' ? 'Foe ' : '') + G.monName(mon);
        yield { t: 'hp', side: side, from: sFrom, to: mon.curHp };
        yield { t: 'text', s: sName + ' is buffeted by the sandstorm!' };
        yield* this.checkFaints();
      }
    }
    // weather countdown (permanent ambient weather has weatherTurns === -1)
    if (this.weather && this.weatherTurns > 0) {
      this.weatherTurns--;
      if (this.weatherTurns === 0) {
        var cleared = this.weather === 'rain' ? 'The rain stopped.'
          : this.weather === 'sun' ? 'The sunlight faded.'
          : 'The sandstorm subsided.';
        this.weather = null;
        yield { t: 'weather', weather: null };
        yield { t: 'text', s: cleared };
      }
    }
    this.flinch.p = false;
    this.flinch.f = false;
  };

  // Battle intro sequence (UI pumps this before the first turn).
  G.Battle.prototype.intro = function* () {
    var foe = this.active('f');
    if (this.wild) {
      yield { t: 'sendOut', side: 'f', mon: foe };
      yield { t: 'text', s: (foe.shiny ? 'A shiny ' + G.monName(foe) + ' appeared! ★' : 'Wild ' + G.monName(foe) + ' appeared!') };
    } else {
      yield { t: 'text', s: this.trainer.name + ' wants to battle!' };
      yield { t: 'sendOut', side: 'f', mon: foe };
      yield { t: 'text', s: this.trainer.name + ' sent out ' + G.monName(foe) + '!' };
    }
    var mine = this.active('p');
    yield { t: 'text', s: 'Go, ' + G.monName(mine) + '!' };
    yield { t: 'sendOut', side: 'p', mon: mine };
  };
})();
