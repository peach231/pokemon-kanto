// Pokéram — battle_ui.js
// The battle scene: pumps battle.js generators, animating each descriptor.
// Also owns the painted battle backgrounds and the in-battle menus.

(function () {
  var W = 240, H = 160;

  // sprite anchor points (bottom-center of each combatant)
  var FOE = { x: 168, y: 70 };
  var PLY = { x: 60, y: 112 };

  // ------------------------------------------------------------ backgrounds
  // Painted in code: sky band + dither + ground + platform ellipses.
  function dither(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    for (var yy = y; yy < y + h; yy++) {
      for (var xx = x + ((yy & 1) ? 1 : 0); xx < x + w; xx += 2) {
        ctx.fillRect(xx, yy, 1, 1);
      }
    }
  }

  function platform(ctx, cx, cy, rx, ry, base, dark, lite) {
    // soft drop shadow on the battlefield
    ctx.fillStyle = 'rgba(18,20,34,0.22)';
    ellipse(ctx, cx, cy + 6, rx * 1.08, ry * 0.9);
    // a raised disc: thick dark side wall, lit top surface inset above it, then
    // a sun-lit cap — the exposed rim gives the base a 3D Emerald-style edge.
    ctx.fillStyle = dark; ellipse(ctx, cx, cy + 3, rx, ry);
    ctx.fillStyle = base; ellipse(ctx, cx, cy, rx * 0.97, ry * 0.9);
    ctx.fillStyle = lite; ellipse(ctx, cx - rx * 0.15, cy - 2, rx * 0.7, ry * 0.5);
    // speckle texture (deterministic)
    ctx.fillStyle = dark;
    for (var i = 0; i < 12; i++) {
      var a = i * 2.3994;
      ctx.fillRect(Math.round(cx + Math.cos(a) * rx * 0.62), Math.round(cy + Math.sin(a) * ry * 0.5), 1, 1);
    }
  }

  function ellipse(ctx, cx, cy, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // slowly scrolling horizontal strip along the horizon — GBA-style parallax band
  function scrollBand(ctx, y, color) {
    var off = (G.frame >> 1) % 14;
    ctx.fillStyle = color;
    for (var x = -14 + off; x < W; x += 14) ctx.fillRect(x, y, 7, 2);
  }

  G.BATTLE_BG = {
    meadow: function (ctx) {
      ctx.fillStyle = G.C.sky1; ctx.fillRect(0, 0, W, 56);
      ctx.fillStyle = G.C.sky0; ctx.fillRect(0, 56, W, 18);
      dither(ctx, 0, 50, W, 6, G.C.sky0);
      ctx.fillStyle = G.C.leaf3; ctx.fillRect(0, 74, W, H - 74);
      dither(ctx, 0, 74, W, 5, G.C.sky0);
      scrollBand(ctx, 72, G.C.grn0);
      dither(ctx, 0, 96, W, 8, G.C.leaf2);
      platform(ctx, FOE.x, FOE.y + 4, 44, 11, G.C.grn1, G.C.grn0, G.C.grn2);
      platform(ctx, PLY.x, PLY.y + 2, 52, 13, G.C.grn1, G.C.grn0, G.C.grn2);
    },
    forest: function (ctx) {
      ctx.fillStyle = G.C.grn1; ctx.fillRect(0, 0, W, 64);
      dither(ctx, 0, 56, W, 8, G.C.grn0);
      ctx.fillStyle = G.C.grn2; ctx.fillRect(0, 64, W, H - 64);
      dither(ctx, 0, 64, W, 6, G.C.grn0);
      scrollBand(ctx, 62, G.C.grn0);
      dither(ctx, 0, 100, W, 8, G.C.grn1);
      platform(ctx, FOE.x, FOE.y + 4, 44, 11, G.C.grn1, G.C.grn0, G.C.grn2);
      platform(ctx, PLY.x, PLY.y + 2, 52, 13, G.C.grn1, G.C.grn0, G.C.grn2);
    },
    cave: function (ctx) {
      ctx.fillStyle = G.C.stn0; ctx.fillRect(0, 0, W, 70);
      ctx.fillStyle = G.C.stn1; ctx.fillRect(0, 70, W, H - 70);
      dither(ctx, 0, 64, W, 8, G.C.stn0);
      scrollBand(ctx, 68, G.C.stn0);
      dither(ctx, 0, 100, W, 10, G.C.stn0);
      platform(ctx, FOE.x, FOE.y + 4, 44, 11, G.C.stn2, G.C.stn1, G.C.stn3);
      platform(ctx, PLY.x, PLY.y + 2, 52, 13, G.C.stn2, G.C.stn1, G.C.stn3);
    },
    water: function (ctx) {
      ctx.fillStyle = G.C.sky1; ctx.fillRect(0, 0, W, 52);
      dither(ctx, 0, 46, W, 6, G.C.sky0);
      ctx.fillStyle = G.C.blu2; ctx.fillRect(0, 52, W, H - 52);
      dither(ctx, 0, 52, W, 6, G.C.sky0);
      scrollBand(ctx, 66, G.C.blu1);
      scrollBand(ctx, 88, G.C.blu1);
      dither(ctx, 0, 88, W, 8, G.C.blu1);
      platform(ctx, FOE.x, FOE.y + 4, 44, 11, G.C.tan0, G.C.brn3, G.C.tan1);
      platform(ctx, PLY.x, PLY.y + 2, 52, 13, G.C.tan0, G.C.brn3, G.C.tan1);
    },
    indoor: function (ctx) {
      ctx.fillStyle = G.C.pale; ctx.fillRect(0, 0, W, 64);
      dither(ctx, 0, 58, W, 6, G.C.lgry);
      scrollBand(ctx, 62, G.C.lgry);
      ctx.fillStyle = G.C.tan1; ctx.fillRect(0, 64, W, H - 64);
      dither(ctx, 0, 96, W, 8, G.C.tan0);
      platform(ctx, FOE.x, FOE.y + 4, 44, 11, G.C.stn3, G.C.stn2, G.C.pale);
      platform(ctx, PLY.x, PLY.y + 2, 52, 13, G.C.stn3, G.C.stn2, G.C.pale);
    }
  };

  // ---------------------------------------------------------------- helpers
  function hpColor(frac) {
    return frac > 0.5 ? G.UI.hpGreen : frac > 0.2 ? G.UI.hpYellow : G.UI.hpRed;
  }

  function drawHpBar(ctx, x, y, w, frac) {
    // beveled Gen-III style: dark frame, inset track, filled bar with top highlight
    ctx.fillStyle = G.C.ink;
    ctx.fillRect(x - 1, y - 1, w + 2, 6);
    ctx.fillStyle = '#40485a';
    ctx.fillRect(x, y, w, 4);
    var fw = Math.round(w * G.clamp(frac, 0, 1));
    if (frac > 0 && fw === 0) fw = 1;
    ctx.fillStyle = hpColor(frac);
    ctx.fillRect(x, y, fw, 4);
    // bevel: bright top row, shaded bottom row
    ctx.fillStyle = 'rgba(255,255,255,0.40)';
    ctx.fillRect(x, y, fw, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(x, y + 3, fw, 1);
  }

  var STATUS_TAGS = { brn: ['BRN', '#d06028'], psn: ['PSN', '#9040a0'], par: ['PAR', '#b08818'], slp: ['SLP', '#6e6e84'] };

  function drawStatusTag(ctx, x, y, status) {
    if (!status) return;
    var tag = STATUS_TAGS[status];
    ctx.fillStyle = tag[1];
    ctx.fillRect(x, y, 22, 9);
    G.text(ctx, tag[0], x + 3, y + 1, G.C.white);
  }

  // ------------------------------------------------------------ battle scene
  // opts: { onEnd(result, battle), bg }
  G.BattleScene = function (battle, opts) {
    opts = opts || {};
    var bg = G.BATTLE_BG[opts.bg || 'meadow'] || G.BATTLE_BG.meadow;

    var sprites = {
      p: { visible: false, mon: null, offX: 0, offY: 0, flicker: 0, scale: 1, dropY: 0 },
      f: { visible: false, mon: null, offX: 0, offY: 0, flicker: 0, scale: 1, dropY: 0 }
    };
    var hpShown = { p: 1, f: 1 };       // displayed HP fraction (animates)
    var hpTarget = { p: 1, f: 1 };
    var expShown = 0, expTarget = 0;
    var orb = { visible: false, x: 0, y: 0, t: 0, mode: null }; // throw/shake/rest
    var sendBall = { visible: false, side: null, t: 0 };       // send-out ball toss
    var throwLean = 0, throwSide = null;                       // thrower wind-up offset
    var particles = [];                  // {x,y,vx,vy,life,col?,size?,delay?,grav?}
    var weatherFx = battle.weather || null;  // 'rain' | 'sun' | 'sand' | null

    var gen = null;          // active generator being pumped
    var task = null;         // current animation task
    var genResume;           // value to feed into gen.next()
    var phase = 'pump';      // pump | menu | moves | done
    var menuSel = 0, moveSel = 0;
    var message = '', msgShown = 0, msgWait = 0;
    var endTimer = -1;
    var trainerShown = !!battle.trainer; // portrait on the foe platform pre-sendOut
    var playerShown = true;              // player's back sprite until they send out

    function setHpFractions() {
      var p = battle.active('p'), f = battle.active('f');
      hpShown.p = hpTarget.p = p ? p.curHp / G.monStats(p).hp : 0;
      hpShown.f = hpTarget.f = f ? f.curHp / G.monStats(f).hp : 0;
      var mon = battle.active('p');
      expShown = expTarget = expFrac(mon);
    }

    function expFrac(mon) {
      if (!mon) return 0;
      var lo = G.monExpForLevel(mon, mon.level), hi = G.monExpForLevel(mon, mon.level + 1);
      return G.clamp((mon.exp - lo) / (hi - lo), 0, 1);
    }

    function startGen(g) { gen = g; phase = 'pump'; }

    // ---- descriptor -> task -------------------------------------------------
    function beginStep(step) {
      switch (step.t) {
        case 'text':
          message = step.s;
          msgShown = 0;
          msgWait = 0;
          task = { kind: 'text' };
          break;
        case 'sfx':
          G.audio.sfx(step.id);
          task = null;
          break;
        case 'anim':
          if (step.kind === 'attack') {
            task = { kind: 'lunge', side: step.side, t: 0, frames: 16 };
          } else if (step.kind === 'hit') {
            sprites[step.side].flicker = 14;
            task = { kind: 'wait', t: 0, frames: 14 };
          } else if (step.kind === 'faint') {
            if (sprites[step.side].mon) G.audio.cry(sprites[step.side].mon.sp, true);
            task = { kind: 'faint', side: step.side, t: 0, frames: 22 };
          } else if (step.kind === 'orbThrow') {
            orb.visible = true; orb.mode = 'throw'; orb.t = 0;
            task = { kind: 'orbThrow', t: 0, frames: 26 };
          } else if (step.kind === 'moveFx') {
            spawnMoveFx(step.side, step.type, step.category, step.anim);
            var fr = step.category === 'spec' ? 34 : step.category === 'buff' ? 24 : 18;
            task = { kind: 'wait', t: 0, frames: fr };
          } else {
            task = null;
          }
          break;
        case 'hp':
          hpTarget[step.side] = step.to / G.monStats(battle.active(step.side)).hp;
          task = { kind: 'hpDrain', side: step.side };
          break;
        case 'expbar':
          expTarget = expFrac(step.mon);
          task = { kind: 'exp', mon: step.mon };
          break;
        case 'sendOut': {
          if (step.mon.shiny && G.gfx.ensureShiny) G.gfx.ensureShiny(step.mon.sp, G.SPECIES[step.mon.sp].id);
          var so = sprites[step.side];
          so.mon = step.mon;
          so.scale = 0;
          so.dropY = 0;
          so.offX = 0;
          so.flicker = 0;
          hpShown[step.side] = hpTarget[step.side] = step.mon.curHp / G.monStats(step.mon).hp;
          if (step.side === 'p') { expShown = expTarget = expFrac(step.mon); }
          // a trainer (you, or the opposing trainer) lobs the ball; wild mons
          // simply rise onto the field.
          var toss = (step.side === 'p') || (step.side === 'f' && !!battle.trainer);
          if (toss) {
            so.visible = false;                 // hidden until the ball pops
            sendBall.visible = true; sendBall.side = step.side; sendBall.t = 0;
            G.audio.sfx('confirm');
            task = { kind: 'sendOut', side: step.side, phase: 'toss', t: 0 };
          } else {
            if (step.side === 'f') trainerShown = false;
            so.visible = true;
            G.audio.cry(step.mon.sp);
            task = { kind: 'sendOut', side: step.side, phase: 'grow', t: 0 };
          }
          break;
        }
        case 'recall':
          sprites[step.side].visible = false;
          task = null;
          break;
        case 'status':
          task = null;
          break;
        case 'levelstats':
          task = { kind: 'levelstats', before: step.before, after: step.after, mon: step.mon, t: 0 };
          break;
        case 'weather':
          weatherFx = step.weather;
          task = null;
          break;
        case 'shake':
          orb.mode = 'shake'; orb.t = 0;
          task = { kind: 'wait', t: 0, frames: 26 };
          break;
        case 'catch':
          if (step.success) {
            orb.mode = 'rest';
            G.audio.playJingle('jingle_catch');
            // star burst around the orb
            for (var pi = 0; pi < 10; pi++) {
              var ang = (pi / 10) * Math.PI * 2;
              particles.push({
                x: FOE.x, y: FOE.y - 8,
                vx: Math.cos(ang) * (0.8 + (pi % 3) * 0.4),
                vy: Math.sin(ang) * (0.8 + (pi % 3) * 0.4) - 0.5,
                life: 26 + (pi % 4) * 6
              });
            }
            task = { kind: 'wait', t: 0, frames: 34 };
          } else {
            orb.visible = false;
            sprites.f.visible = true;
            sprites.f.scale = 1;
            task = { kind: 'wait', t: 0, frames: 10 };
          }
          break;
        case 'choose':
          task = { kind: 'choose' };
          openChooser(step);
          break;
        case 'end':
          task = null;
          break;
        default:
          task = null;
      }
    }

    function openChooser(step) {
      if (step.kind === 'switch') {
        var items = [], map = [];
        for (var i = 0; i < battle.party.length; i++) {
          var m = battle.party[i];
          if (m.curHp > 0 && !m.egg && i !== battle.activeP) {
            items.push(G.monName(m) + '  Lv' + m.level);
            map.push(i);
          }
        }
        G.pushScene(G.Chooser({
          items: items, x: 60, y: 30,
          cancelIndex: 0,
          onPick: function (i) { genResume = map[i]; task = null; }
        }));
      } else if (step.kind === 'forget') {
        var opts2 = step.mon.moves.map(function (ms) { return G.MOVES[ms.id].name; });
        opts2.push('Give up');
        G.pushScene(G.Chooser({
          items: opts2, x: 60, y: 20,
          onPick: function (i) { genResume = (i === 4 ? -1 : i); task = null; }
        }));
      } else if (step.kind === 'shift') {
        if (opts.autoPlay) { genResume = -1; task = null; return; }
        var who = (battle.trainer ? battle.trainer.name : 'The foe');
        G.pushScene(G.Textbox(who + ' is about to send out ' + G.monName(step.incoming) + '.', {
          onDone: function () {
            G.pushScene(G.Chooser({
              items: ['Switch', 'Stay in'],
              onPick: function (i) {
                if (i === 1) { genResume = -1; task = null; return; }
                var items3 = [], map3 = [];
                for (var pi = 0; pi < battle.party.length; pi++) {
                  var m3 = battle.party[pi];
                  if (m3.curHp > 0 && !m3.egg && pi !== battle.activeP) {
                    items3.push(G.monName(m3) + ' Lv' + m3.level);
                    map3.push(pi);
                  }
                }
                G.pushScene(G.Chooser({
                  items: items3, x: 60, y: 30,
                  cancelIndex: -1,
                  onCancel: function () { genResume = -1; task = null; },
                  onPick: function (j) { genResume = map3[j]; task = null; }
                }));
              }
            }));
          }
        }));
      }
    }

    // ---- task updates -------------------------------------------------------
    function updateTask() {
      if (!task) return true;
      switch (task.kind) {
        case 'text': {
          var full = message.length;
          if (msgShown < full) {
            msgShown = Math.min(full, msgShown + 2);
            if (G.input.justPressed('A')) msgShown = full;
            return false;
          }
          msgWait++;
          if (msgWait > 34 || G.input.justPressed('A') || G.input.justPressed('B')) return true;
          return false;
        }
        case 'wait':
          task.t++;
          return task.t >= task.frames;
        case 'lunge': {
          task.t++;
          var s = sprites[task.side];
          var half = task.frames / 2;
          var amp = task.t < half ? task.t : task.frames - task.t;
          s.offX = (task.side === 'p' ? 1 : -1) * amp * 3;   // bigger forward lunge
          if (task.t >= task.frames) { s.offX = 0; return true; }
          return false;
        }
        case 'faint': {
          task.t++;
          var sf = sprites[task.side];
          sf.dropY = task.t * 2.5;
          if (task.t >= task.frames) {
            sf.visible = false;
            sf.dropY = 0;
            return true;
          }
          return false;
        }
        case 'sendOut': {
          task.t++;
          var ss = sprites[task.side];
          if (task.phase === 'toss') {
            sendBall.t = task.t;
            // thrower winds up and leans toward the field as the ball flies
            throwSide = task.side;
            throwLean = Math.sin(Math.min(1, task.t / 16) * Math.PI) * 7;
            if (task.t >= 16) {
              // the ball lands and bursts open — thrower steps off, mon rises
              if (task.side === 'f') trainerShown = false;
              if (task.side === 'p') playerShown = false;
              sendBall.visible = false;
              throwLean = 0; throwSide = null;
              ss.visible = true;
              var anc = task.side === 'p' ? PLY : FOE;
              releaseBurst(anc.x, anc.y - 10);
              G.audio.sfx('sendout');
              G.audio.cry(ss.mon.sp);
              task.phase = 'grow'; task.t = 0;
            }
            return false;
          }
          // mon pops out of the ball with a little overshoot bounce
          var gp = task.t / 16;
          if (gp >= 1) { ss.scale = 1; return true; }
          ss.scale = gp < 0.7 ? (gp / 0.7) * 1.12 : 1.12 - ((gp - 0.7) / 0.3) * 0.12;
          return false;
        }
        case 'levelstats':
          task.t++;
          if (task.t > 10 && (G.input.justPressed('A') || G.input.justPressed('B'))) return true;
          return task.t >= 120; // auto-advance (soak/autoplay never press keys)
        case 'orbThrow':
          task.t++;
          orb.t = task.t;
          if (task.t === 18) { sprites.f.visible = false; }
          return task.t >= task.frames;
        case 'hpDrain': {
          var side = task.side;
          var d = hpTarget[side] - hpShown[side];
          if (Math.abs(d) < 0.012) { hpShown[side] = hpTarget[side]; return true; }
          hpShown[side] += (d > 0 ? 1 : -1) * 0.012;
          return false;
        }
        case 'exp': {
          var de = expTarget - expShown;
          if (expTarget < expShown) { expShown = 0; return false; } // level wrap
          if (Math.abs(de) < 0.03) { expShown = expTarget; return true; }
          expShown += 0.03;
          return false;
        }
        case 'choose':
          return false; // resolved by chooser callback (task set to null)
      }
      return true;
    }

    // ---- menus ---------------------------------------------------------------
    var MENU = ['FIGHT', 'BAG', 'PARTY', 'RUN'];

    function menuInput() {
      if (G.input.repeat('left') || G.input.repeat('right')) { menuSel ^= 1; G.audio.sfx('menuMove'); }
      if (G.input.repeat('up') || G.input.repeat('down')) { menuSel ^= 2; G.audio.sfx('menuMove'); }
      if (G.input.justPressed('A')) {
        G.audio.sfx('confirm');
        if (menuSel === 0) {
          phase = 'moves';
          // the cursor may point at a slot this creature doesn't have
          if (moveSel >= battle.active('p').moves.length) moveSel = 0;
        }
        else if (menuSel === 1) openBag();
        else if (menuSel === 2) openParty();
        else { startGen(battle.turn({ type: 'run' })); }
      }
    }

    function movesInput() {
      var mon = battle.active('p');
      var n = mon.moves.length;
      var prev = moveSel;
      if (G.input.repeat('left') || G.input.repeat('right')) moveSel ^= 1;
      if (G.input.repeat('up') || G.input.repeat('down')) moveSel ^= 2;
      if (moveSel >= n) moveSel = prev;
      if (moveSel !== prev) G.audio.sfx('menuMove');
      if (G.input.justPressed('B')) { G.audio.sfx('cancel'); phase = 'menu'; return; }
      if (G.input.justPressed('A')) {
        var slot = mon.moves[moveSel];
        if (!slot) { moveSel = 0; return; } // never act on a slot that doesn't exist
        var anyPp = mon.moves.some(function (ms) { return ms.pp > 0; });
        if (!anyPp) {
          G.audio.sfx('confirm');
          startGen(battle.turn({ type: 'move', slot: -1 }));
          return;
        }
        if (slot.pp <= 0) { G.audio.sfx('cancel'); return; }
        G.audio.sfx('confirm');
        startGen(battle.turn({ type: 'move', slot: moveSel }));
      }
    }

    function openBag() {
      var ids = [], items = [];
      for (var id in G.player.bag) {
        if (G.player.bag[id] <= 0) continue;
        var it = G.ITEMS[id];
        if (['heal', 'cure', 'revive', 'orb'].indexOf(it.kind) === -1) continue;
        ids.push(id);
        items.push(it.name + ' x' + G.player.bag[id]);
      }
      if (!ids.length) { G.pushScene(G.Textbox('The bag is empty!')); return; }
      G.pushScene(G.Chooser({
        items: items, x: 8, y: 112 - items.length * 14 - 12,
        cancelIndex: -1,
        onCancel: function () {},
        onPick: function (i) {
          var id = ids[i];
          var it = G.ITEMS[id];
          if (it.kind === 'orb') {
            if (!battle.wild) { G.pushScene(G.Textbox("You can't catch another trainer's creature!")); return; }
            // A full party no longer blocks a catch — after the catch you choose
            // whether it joins the party (swapping one out) or goes to the Lab.
            G.player.bag[id]--;
            startGen(battle.turn({ type: 'orb', id: id }));
          } else {
            // pick which creature to use it on, like the real games
            var tItems = [], tMap = [];
            for (var p = 0; p < battle.party.length; p++) {
              var pm = battle.party[p];
              tItems.push(G.monName(pm) + ' ' + pm.curHp + '/' + G.monStats(pm).hp);
              tMap.push(p);
            }
            G.pushScene(G.Chooser({
              items: tItems, x: 30, y: 112 - tItems.length * 14 - 12,
              cancelIndex: -1,
              onCancel: function () {},
              onPick: function (ti) {
                var target = tMap[ti];
                var tm = battle.party[target];
                var ok =
                  (it.kind === 'heal' && tm.curHp > 0 && tm.curHp < G.monStats(tm).hp) ||
                  (it.kind === 'cure' && tm.status && it.statuses.indexOf(tm.status) !== -1) ||
                  (it.kind === 'revive' && tm.curHp <= 0);
                if (!ok) { G.pushScene(G.Textbox('It would have no effect on ' + G.monName(tm) + '.')); return; }
                G.player.bag[id]--;
                // free action: item applies on the spot, the foe does NOT
                // move, and the command menu reopens for the real turn
                startGen(battle.freeAction({ type: 'item', id: id, target: target }));
              }
            }));
          }
        }
      }));
    }

    function openParty() {
      var items = [], map = [];
      for (var i = 0; i < battle.party.length; i++) {
        var m = battle.party[i];
        items.push(G.monName(m) + ' Lv' + m.level + ' ' + m.curHp + '/' + G.monStats(m).hp);
        map.push(i);
      }
      G.pushScene(G.Chooser({
        items: items, x: 30, y: 112 - items.length * 14 - 12,
        cancelIndex: -1,
        onCancel: function () {},
        onPick: function (i) {
          var idx = map[i];
          if (idx === battle.activeP) { G.pushScene(G.Textbox('It is already out!')); return; }
          if (battle.party[idx].curHp <= 0) { G.pushScene(G.Textbox('It has no energy left to battle!')); return; }
          startGen(battle.turn({ type: 'switch', index: idx }));
        }
      }));
    }

    // ---- drawing --------------------------------------------------------------
    // Subtle weather overlay (kept understated so it never fights the sprites).
    function drawWeather(ctx, kind) {
      var f = G.frame;
      if (kind === 'sun') {
        ctx.fillStyle = 'rgba(255,228,150,0.16)';
        ctx.fillRect(0, 0, W, H);
        return;
      }
      if (kind === 'rain') {
        ctx.fillStyle = 'rgba(40,60,110,0.18)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(180,205,255,0.55)';
        for (var i = 0; i < 60; i++) {
          var rx = (i * 53 + f * 6) % (W + 20) - 10;
          var ry = (i * 37 + f * 11) % (H + 20) - 10;
          ctx.fillRect(rx, ry, 1, 4);
        }
        return;
      }
      if (kind === 'sand') {
        ctx.fillStyle = 'rgba(196,160,90,0.20)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(150,118,70,0.5)';
        for (var j = 0; j < 70; j++) {
          var sx = (j * 71 + f * 9) % (W + 16) - 8;
          var sy = (j * 29 + ((j & 1) ? f * 2 : 0)) % H;
          ctx.fillRect(sx, sy, 2, 1);
        }
      }
    }

    function drawSprite(ctx, side) {
      var s = sprites[side];
      if (!s.visible || !s.mon) return;
      if (s.flicker > 0) {
        s.flicker--;
        if ((s.flicker >> 1) % 2 === 0) return;
      }
      var base = 'mon_' + s.mon.sp + (s.mon.shiny && G.IMG['mon_' + s.mon.sp + '_shiny'] ? '_shiny' : '');
      var img = side === 'f' ? G.IMG[base] : G.IMG[base + '_back'];
      if (!img) return;
      var anchor = side === 'f' ? FOE : PLY;
      var w = img.width * s.scale, h = img.height * s.scale;
      var y = anchor.y - h + s.dropY;
      var x = anchor.x - w / 2 + s.offX;
      if (s.dropY > 0) { // faint: clip below platform line
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, anchor.y);
        ctx.clip();
        ctx.drawImage(img, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        ctx.restore();
      } else {
        ctx.drawImage(img, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
      }
    }

    // tiny capture/poké ball: red top, white bottom, dark seam
    function drawBall(ctx, x, y) {
      x = Math.round(x); y = Math.round(y);
      ctx.fillStyle = G.C.ink; ctx.fillRect(x - 4, y - 4, 9, 9);
      ctx.fillStyle = G.C.red2; ctx.fillRect(x - 3, y - 3, 7, 3);
      ctx.fillStyle = G.C.white; ctx.fillRect(x - 3, y + 1, 7, 3);
      ctx.fillStyle = G.C.ink; ctx.fillRect(x - 3, y, 7, 1);
    }

    function drawOrb(ctx) {
      if (!orb.visible) return;
      var x = FOE.x, y = FOE.y - 8;
      if (orb.mode === 'throw') {
        var t = Math.min(1, orb.t / 18);
        x = G.lerp(PLY.x, FOE.x, t);
        y = FOE.y - 8 - Math.sin(t * Math.PI) * 46;
      } else if (orb.mode === 'shake') {
        x += Math.round(Math.sin(orb.t * 0.5) * 3);
        orb.t++;
      }
      drawBall(ctx, x, y);
    }

    // the send-out ball arcs from the thrower's hand onto their platform
    function drawSendBall(ctx) {
      if (!sendBall.visible) return;
      var anchor = sendBall.side === 'p' ? PLY : FOE;
      var start = sendBall.side === 'p' ? { x: PLY.x - 10, y: PLY.y - 22 } : { x: FOE.x + 10, y: FOE.y - 30 };
      var end = { x: anchor.x, y: anchor.y - 10 };
      var t = Math.min(1, sendBall.t / 16);
      var x = G.lerp(start.x, end.x, t);
      var y = G.lerp(start.y, end.y, t) - Math.sin(t * Math.PI) * 26;
      drawBall(ctx, x, y);
    }

    // ---- move / send-out particle spawners ----------------------------------
    function burstAt(x, y, col, n, spd, life) {
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2, s = spd * (0.7 + (i % 3) * 0.3);
        particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: life, maxLife: life, grav: false, col: col, size: 2 });
      }
    }
    function releaseBurst(x, y) {
      for (var i = 0; i < 16; i++) {
        var a = (i / 16) * Math.PI * 2;
        particles.push({ x: x, y: y, vx: Math.cos(a) * 1.8, vy: Math.sin(a) * 1.8 - 0.3, life: 16, maxLife: 16, grav: false, col: i % 2 ? G.C.white : G.C.red3, size: 3 });
      }
    }
    // a type-themed effect from attacker -> target (projectile / impact / aura)
    function spawnMoveFx(side, type, category, anim) {
      var self = side === 'p' ? PLY : FOE;
      var foe = side === 'p' ? FOE : PLY;
      var col = (G.TYPE_COLORS && G.TYPE_COLORS[type]) || G.C.white;
      var sx = self.x, sy = self.y - 20, tx = foe.x, ty = foe.y - 20;
      // ---- per-move signature animations (override the type/category FX) ----
      if (anim === 'bolt') {                          // lightning strikes down
        for (var li = 0; li <= 7; li++) {
          var lf = li / 7;
          particles.push({ x: tx + (li % 2 ? 7 : -7) * (1 - lf), y: -6 + (ty + 6) * lf, vx: 0, vy: 0, life: 13, maxLife: 13, grav: false, col: li % 2 ? G.C.yel2 : G.C.white, size: 3, delay: li * 0.7 });
        }
        burstAt(tx, ty, G.C.yel1, 14, 2, 16);
        return;
      }
      if (anim === 'quake') {                         // ground erupts under the foe
        for (var qi = 0; qi < 18; qi++) {
          particles.push({ x: tx + (qi % 9 - 4) * 6, y: ty + 14, vx: (qi % 3 - 1) * 0.35, vy: -1.3 - (qi % 4) * 0.4, life: 24, maxLife: 24, grav: true, col: qi % 2 ? G.C.brn2 : G.C.brn1, size: 3, delay: (qi % 6) * 1.6 });
        }
        burstAt(tx, ty + 8, G.C.brn1, 10, 1.4, 18);
        return;
      }
      if (anim === 'beam') {                          // a thick charged beam
        var bdx = tx - sx, bdy = ty - sy, bd = Math.max(1, Math.sqrt(bdx * bdx + bdy * bdy));
        var bux = bdx / bd, buy = bdy / bd;
        for (var bi = 0; bi < 26; bi++) {
          var bf = bi / 26;
          for (var bw = -1; bw <= 1; bw++) {
            particles.push({ x: sx + bdx * bf - buy * bw * 2, y: sy + bdy * bf + bux * bw * 2, vx: 0, vy: 0, life: 16, maxLife: 16, grav: false, col: bw ? col : G.C.white, size: 3, delay: bi * 0.5 });
          }
        }
        burstAt(tx, ty, col, 16, 2, 18);
        return;
      }
      if (anim === 'leaf') {                           // spinning leaves arc over
        var ldx = tx - sx, ldy = ty - sy, ld = Math.max(1, Math.sqrt(ldx * ldx + ldy * ldy));
        var lsp = ld / 20;
        for (var le = 0; le < 11; le++) {
          particles.push({ x: sx, y: sy, vx: ldx / ld * lsp + (le % 3 - 1) * 0.35, vy: ldy / ld * lsp - 0.35, life: 22, maxLife: 22, grav: false, col: le % 2 ? G.C.grn2 : G.C.grn3, size: 2, delay: le * 1.4 });
        }
        burstAt(tx, ty, G.C.grn2, 10, 1.5, 14);
        return;
      }
      if (category === 'spec') {
        var dx = tx - sx, dy = ty - sy, dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        var ux = dx / dist, uy = dy / dist, speed = dist / 22;   // slower so the stream reads as it crosses
        // a thick, staggered stream of blobs (water/energy) travels to the target
        for (var i = 0; i < 22; i++) {
          var spread = (i % 5 - 2);
          particles.push({ x: sx - uy * spread * 4, y: sy + ux * spread * 4, vx: ux * speed, vy: uy * speed, life: 24, maxLife: 24, grav: false, col: col, size: 3, delay: i * 1.2 });
        }
        // splash/burst when it lands
        for (var k = 0; k < 14; k++) {
          var a = (k / 14) * Math.PI * 2;
          particles.push({ x: tx, y: ty, vx: Math.cos(a) * 1.7, vy: Math.sin(a) * 1.7 - 0.4, life: 18, maxLife: 18, grav: true, col: col, size: 3, delay: 20 });
        }
      } else if (category === 'phys') {
        burstAt(tx, ty, col, 9, 1.5, 12);
        particles.push({ x: tx, y: ty, vx: 0, vy: 0, life: 8, maxLife: 8, grav: false, col: G.C.white, size: 3 });
      } else if (category === 'buff') {
        for (var b = 0; b < 9; b++) {
          particles.push({ x: sx + (b % 5 - 2) * 5, y: self.y - 2, vx: (b % 3 - 1) * 0.15, vy: -0.7 - (b % 3) * 0.25, life: 22, maxLife: 22, grav: false, col: col, size: 2 });
        }
      } else { // debuff
        burstAt(tx, ty, col, 8, 1.1, 14);
      }
    }

    // the post-level-up stat-gain window (Gen-III style)
    function drawLevelStats(ctx, t) {
      var rows = [['HP', 'hp'], ['ATTACK', 'atk'], ['DEFENSE', 'def'], ['SP.ATK', 'spa'], ['SP.DEF', 'spd'], ['SPEED', 'spe']];
      var bx = 132, by = 6, bw = 104, bh = 72;
      G.nineSlice(ctx, G.IMG.ui_box, bx, by, bw, bh, 4);
      G.text(ctx, 'LEVEL UP!', bx + 8, by + 6, '#e8c038', G.UI.textShadow);
      for (var i = 0; i < rows.length; i++) {
        var k = rows[i][1], yy = by + 18 + i * 9;
        G.text(ctx, rows[i][0], bx + 6, yy, G.UI.text, G.UI.textShadow);
        G.text(ctx, '+' + (t.after[k] - t.before[k]), bx + 56, yy, '#3fa757', G.UI.textShadow);
        G.text(ctx, '' + t.after[k], bx + 80, yy, G.UI.text, G.UI.textShadow);
      }
    }

    function drawPanels(ctx) {
      var f = battle.active('f'), p = battle.active('p');
      // foe panel
      if (sprites.f.visible || hpShown.f > 0) {
        G.nineSlice(ctx, G.IMG.ui_box, 4, 6, 104, 30, 4);
        G.text(ctx, G.monName(f), 12, 11, G.UI.text, G.UI.textShadow);
        G.text(ctx, 'Lv' + f.level, 78, 11, G.UI.text, G.UI.textShadow);
        drawHpBar(ctx, 26, 24, 64, hpShown.f);
        G.text(ctx, 'HP', 12, 20, '#d06028');
        drawStatusTag(ctx, 12, 27, f.status);
      }
      // player panel
      G.nineSlice(ctx, G.IMG.ui_box, 128, 78, 108, 36, 4);
      G.text(ctx, G.monName(p), 136, 83, G.UI.text, G.UI.textShadow);
      G.text(ctx, 'Lv' + p.level, 204, 83, G.UI.text, G.UI.textShadow);
      drawHpBar(ctx, 152, 96, 64, hpShown.p);
      G.text(ctx, 'HP', 138, 92, '#d06028');
      var stats = G.monStats(p);
      var shownHp = Math.round(hpShown.p * stats.hp);
      G.text(ctx, shownHp + '/' + stats.hp, 164, 100, G.UI.text, G.UI.textShadow);
      drawStatusTag(ctx, 136, 100, p.status);
      // exp bar
      ctx.fillStyle = G.C.dgry; ctx.fillRect(135, 109, 94, 3);
      ctx.fillStyle = G.UI.expBlue; ctx.fillRect(135, 109, Math.round(94 * expShown), 2);
    }

    function drawTextbox(ctx) {
      G.nineSlice(ctx, G.IMG.ui_box_dark, 0, 116, W, 44, 4);
      if (phase === 'pump' || phase === 'done') {
        var lines = G.textWrap(message.slice(0, msgShown), 216);
        for (var i = 0; i < Math.min(2, lines.length); i++) {
          G.text(ctx, lines[i], 12, 124 + i * 14, G.C.white, '#3a3a4a');
        }
      } else if (phase === 'menu') {
        G.text(ctx, 'What will', 10, 124, G.C.white, '#3a3a4a');
        G.text(ctx, G.monName(battle.active('p')) + ' do?', 10, 138, G.C.white, '#3a3a4a');
        G.nineSlice(ctx, G.IMG.ui_box, 116, 116, 124, 44, 4);
        for (var m = 0; m < 4; m++) {
          var mx = 132 + (m % 2) * 56, my = 124 + (m >> 1) * 16;
          G.text(ctx, MENU[m], mx, my, G.UI.text, G.UI.textShadow);
          if (menuSel === m) ctx.drawImage(G.IMG.ui_cursor, mx - 9, my + 1);
        }
      } else if (phase === 'moves') {
        var mon = battle.active('p');
        G.nineSlice(ctx, G.IMG.ui_box, 0, 116, 156, 44, 4);
        for (var s = 0; s < 4; s++) {
          var sx = 16 + (s % 2) * 72, sy = 124 + (s >> 1) * 16;
          var ms = mon.moves[s];
          G.text(ctx, ms ? G.MOVES[ms.id].name : '-', sx, sy, G.UI.text, G.UI.textShadow);
          if (moveSel === s) ctx.drawImage(G.IMG.ui_cursor, sx - 9, sy + 1);
        }
        G.nineSlice(ctx, G.IMG.ui_box, 156, 116, 84, 44, 4);
        var cur = mon.moves[moveSel];
        if (cur) {
          var mv = G.MOVES[cur.id];
          G.text(ctx, 'PP ' + cur.pp + '/' + cur.maxPp, 166, 124, G.UI.text, G.UI.textShadow);
          ctx.fillStyle = G.TYPE_COLORS[mv.type];
          ctx.fillRect(166, 138, 40, 11);
          G.text(ctx, mv.type.toUpperCase().slice(0, 8), 169, 140, G.C.white);
        }
      }
    }

    return {
      opaque: true,

      enter: function () {
        setHpFractions();
        sprites.p.visible = false;
        sprites.f.visible = false;
        G.audio.playMusic(opts.music || 'battle');
        startGen(battle.intro());
      },

      update: function () {
        // low-HP warning beep: pulses while your active Pokémon is in the red
        var lpm = battle.active('p');
        if (!battle.over && lpm && lpm.curHp > 0 && lpm.curHp <= G.monStats(lpm).hp * 0.2 && (G.frame % 48) === 0) {
          G.audio.sfx('lowHp');
        }
        if (phase === 'menu' && opts.autoPlay) {
          // debug: drive the player with the foe AI (visual soak test)
          var mon = battle.active('p');
          var best = -1, bestD = -1;
          for (var i = 0; i < mon.moves.length; i++) {
            if (mon.moves[i].pp <= 0) continue;
            var mv = G.MOVES[mon.moves[i].id];
            if (mv.power <= 0) continue;
            var d = battle.calcDamage('p', mv, { avg: true }).dmg * mv.acc / 100;
            if (d > bestD) { bestD = d; best = i; }
          }
          startGen(battle.turn({ type: 'move', slot: best }));
          return;
        }
        if (phase === 'menu') { menuInput(); return; }
        if (phase === 'moves') { movesInput(); return; }
        if (phase === 'done') {
          endTimer--;
          if (endTimer <= 0) {
            G.popScene();
            if (opts.onEnd) opts.onEnd(battle.result, battle);
          }
          return;
        }
        // pump phase
        var guard = 0;
        while (guard++ < 50) {
          if (task) {
            if (!updateTask()) return;
            task = null;
          }
          if (!gen) break;
          var r = gen.next(genResume);
          genResume = undefined;
          if (r.done) {
            gen = null;
            if (battle.over) {
              phase = 'done';
              endTimer = 20;
            } else {
              phase = 'menu';
              menuSel = 0;
            }
            return;
          }
          beginStep(r.value);
          if (task) return; // animate this step across frames
        }
      },

      draw: function (ctx) {
        bg(ctx);
        if (weatherFx) drawWeather(ctx, weatherFx);
        // opposing trainer stands on the platform until their first send-out
        if (trainerShown && battle.trainer) {
          var tImg = G.IMG[battle.trainer.sprite];
          var tlean = throwSide === 'f' ? -throwLean : 0;  // foe leans toward the field as it throws
          if (tImg) ctx.drawImage(tImg, FOE.x - tImg.width / 2 + tlean, FOE.y - tImg.height + 4);
        }
        // player's back sprite stands ready until they send out their lead
        if (playerShown) {
          var pImg = G.IMG.trainer_player_back;
          var plean = throwSide === 'p' ? throwLean : 0;   // player leans toward the field as they throw
          if (pImg) ctx.drawImage(pImg, PLY.x - pImg.width / 2 + plean, PLY.y - pImg.height + 6);
        }
        // foe drawn first (behind its panel), then player
        drawSprite(ctx, 'f');
        drawSprite(ctx, 'p');
        drawOrb(ctx);
        drawSendBall(ctx);
        // particles: catch-celebration stars (no col) + colored move/send FX
        for (var pi = particles.length - 1; pi >= 0; pi--) {
          var pt = particles[pi];
          if (pt.delay > 0) { pt.delay--; continue; }   // staggered emit (streams)
          pt.x += pt.vx; pt.y += pt.vy;
          if (pt.grav !== false) pt.vy += 0.04;
          pt.life--;
          if (pt.life <= 0) { particles.splice(pi, 1); continue; }
          var px = Math.round(pt.x), py = Math.round(pt.y);
          if (pt.col) {
            ctx.fillStyle = pt.col;
            ctx.fillRect(px, py, pt.size || 2, pt.size || 2);
            if (pt.life > (pt.maxLife || 14) * 0.55) { ctx.fillStyle = '#f4f4f4'; ctx.fillRect(px, py, 1, 1); }
          } else {
            ctx.fillStyle = (pt.life >> 2) % 2 ? '#f8e878' : '#f4f4f4';
            ctx.fillRect(px, py, 2, 2);
            if (pt.life > 16) {
              ctx.fillRect(px - 1, py, 1, 1);
              ctx.fillRect(px + 2, py, 1, 1);
            }
          }
        }
        drawPanels(ctx);
        drawTextbox(ctx);
        if (task && task.kind === 'levelstats') drawLevelStats(ctx, task);
      }
    };
  };

  // Convenience: push a battle with the swirl transition.
  // optsExtra: { bg, music, onEnd }
  G.startBattle = function (battleOpts, optsExtra) {
    optsExtra = optsExtra || {};
    var battle = new G.Battle(battleOpts);
    G.audio.playMusic(optsExtra.music || 'battle');
    G.pushScene(G.BattleSwirlScene(function () {
      G.pushScene(G.BattleScene(battle, optsExtra));
    }));
    return battle;
  };

  // Trainer battle wrapper: resolves the party, pays out, sets dex/flags.
  G.startTrainerBattle = function (trainerId, opts) {
    opts = opts || {};
    var def = G.TRAINERS[trainerId];
    var foes = G.trainerParty(def);
    for (var i = 0; i < foes.length; i++) G.player.dexSeen[foes[i].sp] = 1;
    return G.startBattle(
      { party: G.player.party, foes: foes, trainer: def },
      {
        bg: opts.bg || (G.world.map && G.world.map.battleBg) || 'meadow',
        music: def.music || 'battle',
        onEnd: function (result, battle) {
          if (result === 'win') {
            G.player.money += def.money || 0;
            G.flags[trainerId] = 1;
            if (def.reward) {
              G.player.badges[def.reward.badge] = true;
              G.flags[def.reward.flag] = 1;
              G.audio.playJingle('jingle_badge');
              G.pushScene(G.Textbox(def.reward.text));
            }
          }
          G.afterBattle(result, battle);
          if (opts.onEnd) opts.onEnd(result, battle);
        }
      }
    );
  };

  // ------------------------------------------------------------ evolution --
  // Post-battle evolution ceremony. B cancels the current evolution.
  G.EvolutionScene = function (pendings) {
    var idx = 0;
    var phase = 'announce'; // announce | flash | done-text
    var t = 0;
    var FLASH_FRAMES = 200;
    var cancelled = false;

    function cur() { return pendings[idx]; }

    function announce() {
      phase = 'announce';
      G.pushScene(G.Textbox('What? ' + G.monName(cur().mon) + ' is evolving!', {
        onDone: function () { phase = 'flash'; t = 0; cancelled = false; }
      }));
    }

    return {
      opaque: true,
      enter: function () {
        G.audio.playMusic('evolve');
        announce();
      },
      update: function () {
        if (phase !== 'flash') return;
        t++;
        if (G.input.justPressed('B')) cancelled = true;
        if (cancelled || t >= FLASH_FRAMES) {
          phase = 'done-text';
          var mon = cur().mon;
          var msg;
          if (cancelled) {
            msg = 'Huh? ' + G.monName(mon) + ' stopped evolving!';
          } else {
            var oldName = G.monName(mon);
            G.evolveMon(mon);
            G.audio.sfx('levelUp');
            msg = 'Congratulations! Your ' + oldName + ' evolved into ' + G.SPECIES[mon.sp].name + '!';
          }
          G.pushScene(G.Textbox(msg, {
            onDone: function () {
              idx++;
              if (idx < pendings.length) announce();
              else {
                G.popScene();
                if (G.world.map && G.world.map.music) G.audio.playMusic(G.world.map.music);
              }
            }
          }));
        }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#181a24';
        ctx.fillRect(0, 0, 240, 160);
        ctx.fillStyle = '#262a3a';
        for (var i = 0; i < 8; i++) {
          var a = (G.frame / 40 + i / 8) * Math.PI * 2;
          ctx.fillRect(120 + Math.cos(a) * 70 - 2, 76 + Math.sin(a) * 44 - 2, 4, 4);
        }
        var p = cur();
        if (!p) return;
        // accelerating flash between current and evolved form
        var showNew = false;
        if (phase === 'flash') {
          var period = Math.max(4, 24 - Math.floor(t / 18) * 4);
          showNew = (Math.floor(t / period) % 2) === 1;
        } else if (phase === 'done-text' && !cancelled) {
          showNew = true;
        }
        var key = showNew ? p.to : p.mon.sp;
        // after evolveMon, mon.sp already is the target
        if (phase === 'done-text' && !cancelled) key = p.mon.sp;
        var img = G.IMG['mon_' + key];
        if (img) {
          ctx.drawImage(img, 120 - img.width / 2, 90 - img.height);
        }
      }
    };
  };
})();

