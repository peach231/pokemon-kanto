// Pokéram — menus.js
// Start menu + party / summary / bag / dex / save screens.

(function () {
  var W = 240, H = 160;

  function panel(ctx, x, y, w, h) { G.nineSlice(ctx, G.IMG.ui_box, x, y, w, h, 4); }

  function hpBar(ctx, x, y, w, frac) {
    ctx.fillStyle = G.C.dgry; ctx.fillRect(x - 1, y - 1, w + 2, 5);
    ctx.fillStyle = '#585868'; ctx.fillRect(x, y, w, 3);
    var fw = Math.round(w * G.clamp(frac, 0, 1));
    if (frac > 0 && fw === 0) fw = 1;
    ctx.fillStyle = frac > 0.5 ? G.UI.hpGreen : frac > 0.2 ? G.UI.hpYellow : G.UI.hpRed;
    ctx.fillRect(x, y, fw, 3);
  }

  // ------------------------------------------------- starter preview screen --
  // Full preview before committing: sprite, types, stat bars, dex entry.
  // onChoice(true) = take it, onChoice(false) = put it back.
  G.StarterPreviewScene = function (spKey, onChoice) {
    var sp = G.SPECIES[spKey];
    var maxBase = 130; // bar scale
    return {
      opaque: true,
      enter: function () {
        var self = this;
        G.pushScene(G.Chooser({
          items: ['Take it!', 'Leave it'],
          x: 150, y: 112,
          onPick: function (i) {
            G.popScene(); // pop the preview itself
            onChoice(i === 0);
          }
        }));
      },
      update: function () {},
      draw: function (ctx) {
        ctx.fillStyle = '#2a3040';
        ctx.fillRect(0, 0, W, H);
        // left: the creature on a soft pedestal
        panel(ctx, 6, 6, 104, 116);
        ctx.fillStyle = '#3a4150';
        ctx.beginPath();
        ctx.ellipse(58, 96, 36, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        var img = G.IMG['mon_' + spKey];
        if (img) ctx.drawImage(img, 58 - img.width / 2, 98 - img.height);
        G.text(ctx, sp.name, 14, 12, G.UI.text, G.UI.textShadow);
        for (var t = 0; t < sp.types.length; t++) {
          ctx.fillStyle = G.TYPE_COLORS[sp.types[t]];
          ctx.fillRect(14 + t * 44, 24, 40, 11);
          G.text(ctx, sp.types[t].toUpperCase().slice(0, 8), 17 + t * 44, 26, G.C.white);
        }
        // right: base stat bars
        panel(ctx, 116, 6, 120, 84);
        var rows = [['HP', sp.base.hp], ['Attack', sp.base.atk], ['Defense', sp.base.def],
                    ['Sp. Atk', sp.base.spa], ['Sp. Def', sp.base.spd], ['Speed', sp.base.spe]];
        for (var i = 0; i < rows.length; i++) {
          var y = 13 + i * 12;
          G.text(ctx, rows[i][0], 122, y, G.UI.text, G.UI.textShadow);
          var bw = Math.round(56 * Math.min(1, rows[i][1] / maxBase));
          ctx.fillStyle = G.C.dgry;
          ctx.fillRect(172, y + 1, 58, 6);
          ctx.fillStyle = rows[i][1] >= 100 ? G.UI.hpGreen : rows[i][1] >= 60 ? G.UI.expBlue : G.UI.hpYellow;
          ctx.fillRect(173, y + 2, bw, 4);
        }
        // dex flavor
        var lines = G.textWrap(sp.dex, 222);
        for (var d = 0; d < Math.min(2, lines.length); d++) {
          G.text(ctx, lines[d], 10, 128 + d * 11, G.C.white, '#1a1c2c');
        }
      }
    };
  };

  // ----------------------------------------------- caught: dex registration --
  // Shown after a successful catch: clean canvas, the creature, its data.
  G.CaughtScene = function (mon) {
    var sp = G.SPECIES[mon.sp];
    var t = 0;
    return {
      opaque: true,
      update: function () {
        t++;
        if (t > 20 && (G.input.justPressed('A') || G.input.justPressed('B') || G.input.justPressed('start'))) {
          G.audio.sfx('confirm');
          G.popScene();
        }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#f0ead8';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#d8d0b8';
        ctx.fillRect(0, 0, W, 18);
        ctx.fillRect(0, H - 14, W, 14);
        G.text(ctx, sp.name + "'s data was added to the Creature Dex!", 10, 5, G.UI.text, '#f0ead8');
        // creature on a pedestal, fading in
        ctx.fillStyle = '#d8d0b8';
        ctx.beginPath();
        ctx.ellipse(62, 102, 38, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        var img = G.IMG['mon_' + mon.sp];
        if (img && t > 6) ctx.drawImage(img, 62 - img.width / 2, 104 - img.height);
        // identity
        G.text(ctx, 'No.' + (sp.id < 10 ? '00' : sp.id < 100 ? '0' : '') + sp.id + '  ' + sp.name, 116, 26, G.UI.text, '#d8d0b8');
        for (var ty = 0; ty < sp.types.length; ty++) {
          ctx.fillStyle = G.TYPE_COLORS[sp.types[ty]];
          ctx.fillRect(116 + ty * 44, 38, 40, 11);
          G.text(ctx, sp.types[ty].toUpperCase().slice(0, 8), 119 + ty * 44, 40, G.C.white);
        }
        // stat bars
        var rows = [['HP', sp.base.hp], ['Atk', sp.base.atk], ['Def', sp.base.def], ['SpA', sp.base.spa], ['SpD', sp.base.spd], ['Spe', sp.base.spe]];
        for (var i = 0; i < rows.length; i++) {
          var y = 54 + i * 10;
          G.text(ctx, rows[i][0], 116, y, G.UI.text, '#d8d0b8');
          ctx.fillStyle = '#c8c0a8';
          ctx.fillRect(142, y + 1, 80, 6);
          ctx.fillStyle = rows[i][1] >= 100 ? G.UI.hpGreen : rows[i][1] >= 60 ? G.UI.expBlue : G.UI.hpYellow;
          ctx.fillRect(143, y + 2, Math.round(78 * Math.min(1, rows[i][1] / 130)), 4);
        }
        // dex flavor
        var lines = G.textWrap(sp.dex, 120);
        for (var d = 0; d < Math.min(3, lines.length); d++) {
          G.text(ctx, lines[d], 116, 118 + d * 10, G.UI.text, '#d8d0b8');
        }
        if ((G.frame >> 4) % 2 === 0) G.text(ctx, 'Z: continue', 92, H - 12, G.UI.text);
      }
    };
  };

  // ------------------------------------------------------------ start menu --
  // ------------------------------------------------ character select screen --
  // Shown once on a new game: pick one of four playable trainers (the walker +
  // battle back sprite for the rest of the run). onChosen(charDef) continues.
  G.CharSelectScene = function (onChosen) {
    var chars = G.CHARACTERS || [];
    var sel = 0;
    for (var i = 0; i < chars.length; i++) if (G.gfx.loadCharacterPreview) G.gfx.loadCharacterPreview(chars[i]);

    function ctext(ctx, s, cx, y, col, sh) { G.text(ctx, s, Math.round(cx - G.textWidth(s) / 2), y, col, sh); }
    function preview(c) {
      var f = ['d0', 'd1', 'd0', 'd2'][(G.frame >> 3) % 4];
      return G.IMG['ch_csel_' + c.key + '_' + f] || G.IMG['ch_csel_' + c.key + '_d0'] || G.IMG.ch_player_d0;
    }
    return {
      opaque: true,
      update: function () {
        if (!chars.length) { if (onChosen) onChosen(null); return; }
        if (G.input.repeat('left')) { sel = (sel + chars.length - 1) % chars.length; G.audio.sfx('menuMove'); }
        if (G.input.repeat('right')) { sel = (sel + 1) % chars.length; G.audio.sfx('menuMove'); }
        if (G.input.justPressed('A') || G.input.justPressed('start')) {
          G.audio.sfx('confirm');
          var c = chars[sel];
          G.player.charKey = c.key;
          if (G.gfx.loadCharacter) G.gfx.loadCharacter(c);
          // now name the trainer, then continue
          G.pushScene(G.NameEntryScene(c.name, function (nm) {
            G.player.name = nm;
            if (onChosen) onChosen(c);
          }));
        }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#bfe3f5'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#9fd6c4'; ctx.fillRect(0, H - 42, W, 42);
        ctx.fillStyle = '#8fcab6'; ctx.fillRect(0, H - 42, W, 2);
        ctext(ctx, 'CHOOSE YOUR TRAINER', W / 2, 7, G.UI.text, G.UI.textShadow);

        var n = chars.length, slotW = 52, gap = Math.floor((W - n * slotW) / (n + 1));
        for (var i = 0; i < n; i++) {
          var sx = gap + i * (slotW + gap), sy = 24, on = i === sel;
          panel(ctx, sx, sy, slotW, 74);
          if (on) { ctx.fillStyle = 'rgba(255,236,120,0.30)'; ctx.fillRect(sx + 2, sy + 2, slotW - 4, 70); }
          var img = preview(chars[i]);
          if (img) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, sx + Math.round(slotW / 2 - img.width), sy + 54 - img.height * 2, img.width * 2, img.height * 2);
          }
          ctext(ctx, chars[i].kind, sx + slotW / 2, sy + 58, G.UI.text, G.UI.textShadow);
          if (on) {
            var bob = (G.frame >> 3) % 2;
            ctx.drawImage(G.IMG.ui_cursor, sx + Math.round(slotW / 2) - 4, sy - 7 + bob);
          }
        }
        ctext(ctx, chars[sel].blurb, W / 2, H - 33, G.UI.text, G.UI.textShadow);
        ctext(ctx, 'Arrows: pick    Z: choose', W / 2, H - 14, G.C.ink);
      }
    };
  };

  // ----------------------------------------------------- name entry screen --
  // On-screen keyboard (arrows + Z), so it works without raw text input. B
  // deletes, Enter/OK submits. Blank submit falls back to `defaultName`.
  G.NameEntryScene = function (defaultName, onDone) {
    var MAX = 8, name = '';
    var LET = ['ABCDEFGHIJ', 'KLMNOPQRST', 'UVWXYZ', 'abcdefghij', 'klmnopqrst', 'uvwxyz'];
    var ACT = ['SPACE', 'DEL', 'OK'], ACTX = [14, 96, 168];
    var r = 0, c = 0, nrows = LET.length + 1;
    function rowLen(rr) { return rr < LET.length ? LET[rr].length : ACT.length; }
    function ctext(ctx, s, cx, y, col, sh) { G.text(ctx, s, Math.round(cx - G.textWidth(s) / 2), y, col, sh); }
    function submit() {
      var nm = name.replace(/\s+$/, '') || defaultName || 'RAM';
      G.audio.sfx('confirm'); G.popScene(); if (onDone) onDone(nm);
    }
    function add(ch) { if (name.length < MAX) { name += ch; G.audio.sfx('menuMove'); } }
    return {
      opaque: true,
      update: function () {
        if (G.input.repeat('up')) { r = (r + nrows - 1) % nrows; c = Math.min(c, rowLen(r) - 1); G.audio.sfx('menuMove'); }
        if (G.input.repeat('down')) { r = (r + 1) % nrows; c = Math.min(c, rowLen(r) - 1); G.audio.sfx('menuMove'); }
        if (G.input.repeat('left')) { c = (c + rowLen(r) - 1) % rowLen(r); G.audio.sfx('menuMove'); }
        if (G.input.repeat('right')) { c = (c + 1) % rowLen(r); G.audio.sfx('menuMove'); }
        if (G.input.justPressed('B')) { if (name) { name = name.slice(0, -1); G.audio.sfx('cancel'); } return; }
        if (G.input.justPressed('start')) { submit(); return; }
        if (G.input.justPressed('A')) {
          if (r < LET.length) { add(LET[r][c]); }
          else if (ACT[c] === 'SPACE') { add(' '); }
          else if (ACT[c] === 'DEL') { if (name) { name = name.slice(0, -1); G.audio.sfx('cancel'); } }
          else { submit(); }
        }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#bfe3f5'; ctx.fillRect(0, 0, W, H);
        ctext(ctx, 'YOUR NAME?', W / 2, 6, G.UI.text, G.UI.textShadow);
        panel(ctx, 58, 16, 124, 18);
        var caret = (G.frame >> 4) % 2 ? '_' : ' ';
        G.text(ctx, name + caret, 66, 22, G.UI.text, G.UI.textShadow);
        var gx = 14, gy = 44, cw = 21, rh = 14;
        for (var rr = 0; rr < LET.length; rr++) {
          for (var cc = 0; cc < LET[rr].length; cc++) {
            var x = gx + cc * cw, y = gy + rr * rh;
            if (rr === r && cc === c) { ctx.fillStyle = 'rgba(255,236,120,0.55)'; ctx.fillRect(x - 3, y - 2, 12, 12); }
            G.text(ctx, LET[rr][cc], x, y, G.C.ink);
          }
        }
        var ay = gy + LET.length * rh + 4;
        for (var a = 0; a < ACT.length; a++) {
          if (r === LET.length && c === a) { ctx.fillStyle = 'rgba(255,236,120,0.55)'; ctx.fillRect(ACTX[a] - 3, ay - 2, G.textWidth(ACT[a]) + 6, 12); }
          G.text(ctx, ACT[a], ACTX[a], ay, G.C.ink);
        }
        ctext(ctx, 'Z: select   X: delete   Enter: done', W / 2, H - 9, G.C.gry);
      }
    };
  };

  G.StartMenu = function () {
    var items = ['DEX', 'MAP', 'PARTY', 'BAG', 'SAVE', 'EXIT'];
    return {
      opaque: false,
      sel: 0,
      update: function () {
        if (G.input.repeat('up')) { this.sel = (this.sel + items.length - 1) % items.length; G.audio.sfx('menuMove'); }
        if (G.input.repeat('down')) { this.sel = (this.sel + 1) % items.length; G.audio.sfx('menuMove'); }
        if (G.input.justPressed('B') || G.input.justPressed('start')) { G.audio.sfx('cancel'); G.popScene(); return; }
        if (G.input.justPressed('A')) {
          G.audio.sfx('confirm');
          var pick = items[this.sel];
          if (pick === 'EXIT') { G.popScene(); return; }
          if (pick === 'DEX') G.pushScene(G.DexScene());
          if (pick === 'MAP') G.pushScene(G.RegionMapScene());
          if (pick === 'PARTY') G.pushScene(G.PartyScene());
          if (pick === 'BAG') G.pushScene(G.BagScene());
          if (pick === 'SAVE') {
            G.ask('Save your progress?', function () {
              var ok = G.saveGame();
              G.pushScene(G.Textbox(ok ? 'Progress saved!' : 'Save failed...'));
              if (ok) G.audio.sfx('heal');
            });
          }
        }
      },
      draw: function (ctx) {
        var x = W - 70, y = 6;
        panel(ctx, x, y, 64, items.length * 15 + 12);
        for (var i = 0; i < items.length; i++) {
          G.text(ctx, items[i], x + 20, y + 8 + i * 15, G.UI.text, G.UI.textShadow);
          if (i === this.sel) ctx.drawImage(G.IMG.ui_cursor, x + 9, y + 9 + i * 15);
        }
        // trainer chip: name + money
        panel(ctx, 4, 6, 92, 34);
        G.text(ctx, G.player.name || 'RAM', 12, 13, G.UI.text, G.UI.textShadow);
        G.text(ctx, '$' + G.player.money, 12, 25, G.UI.text, G.UI.textShadow);
      }
    };
  };

  // ------------------------------------------------------------ party screen --
  // opts: { pickMode, onPick(index) } — pickMode = choosing an item target
  G.PartyScene = function (opts) {
    opts = opts || {};
    return {
      opaque: true,
      sel: 0,
      update: function () {
        var n = G.player.party.length;
        if (!n) { G.popScene(); return; }
        if (G.input.repeat('up')) { this.sel = (this.sel + n - 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.repeat('down')) { this.sel = (this.sel + 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.justPressed('B')) { G.audio.sfx('cancel'); G.popScene(); if (opts.onPick) opts.onPick(-1); return; }
        if (G.input.justPressed('A')) {
          G.audio.sfx('confirm');
          var idx = this.sel;
          if (opts.pickMode) {
            G.popScene();
            if (opts.onPick) opts.onPick(idx);
            return;
          }
          var self = this;
          var isEgg = !!G.player.party[idx].egg;
          G.pushScene(G.Chooser({
            items: isEgg ? ['Move up', 'Back'] : ['Summary', 'Move up', 'Back'],
            onPick: function (i) {
              var moveI = isEgg ? 0 : 1;
              if (!isEgg && i === 0) G.pushScene(G.SummaryScene(G.player.party[idx]));
              if (i === moveI && idx > 0) {
                var p = G.player.party;
                var tmp = p[idx - 1]; p[idx - 1] = p[idx]; p[idx] = tmp;
                self.sel = idx - 1;
              }
            }
          }));
        }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#2a3040';
        ctx.fillRect(0, 0, W, H);
        G.text(ctx, opts.prompt || (opts.pickMode ? 'Use on which creature?' : 'PARTY'), 10, 6, G.C.white, '#1a1c2c');
        var party = G.player.party;
        for (var i = 0; i < party.length; i++) {
          var mon = party[i];
          var y = 20 + i * 22;
          panel(ctx, 8, y, 136, 22);
          if (mon.egg) {
            G.text(ctx, 'EGG', 16, y + 7, G.UI.text, G.UI.textShadow);
            G.text(ctx, mon.hatch > 0 ? mon.hatch + ' steps' : 'ready!', 70, y + 7, G.C.lgry);
          } else {
            G.text(ctx, (mon.shiny ? '★' : '') + G.monName(mon), 16, y + 7, G.UI.text, G.UI.textShadow);
            G.text(ctx, 'Lv' + mon.level, 78, y + 7, G.UI.text, G.UI.textShadow);
            var stats = G.monStats(mon);
            hpBar(ctx, 104, y + 10, 32, mon.curHp / stats.hp);
            if (mon.curHp <= 0) G.text(ctx, 'FNT', 104, y + 1, G.UI.hpRed);
            else if (mon.status) G.text(ctx, mon.status.toUpperCase(), 104, y + 1, '#9040a0');
          }
          if (i === this.sel) ctx.drawImage(G.IMG.ui_cursor, 2, y + 8);
        }
        // selected mon portrait
        var cur = party[this.sel];
        if (cur) {
          panel(ctx, 152, 20, 84, 92);
          if (cur.egg) {
            var eimg = G.IMG.mon_egg;
            if (eimg) ctx.drawImage(eimg, 194 - eimg.width / 2, 92 - eimg.height);
            G.text(ctx, 'A mystery EGG.', 158, 26, G.UI.text, G.UI.textShadow);
            var tot = cur.hatchTotal || G.EGG_STEPS || 1;
            var prog = G.clamp((tot - cur.hatch) / tot, 0, 1);
            ctx.fillStyle = G.C.dgry; ctx.fillRect(158, 94, 72, 6);
            ctx.fillStyle = G.UI.expBlue || '#4a90e0'; ctx.fillRect(158, 94, Math.round(72 * prog), 6);
            G.text(ctx, Math.round(prog * 100) + '% warmed', 158, 103, G.C.lgry);
          } else {
            var img = G.IMG['mon_' + cur.sp];
            if (img) ctx.drawImage(img, 194 - img.width / 2, 96 - img.height);
            var sp = G.SPECIES[cur.sp];
            for (var t = 0; t < sp.types.length; t++) {
              ctx.fillStyle = G.TYPE_COLORS[sp.types[t]];
              ctx.fillRect(158 + t * 40, 98, 36, 10);
              G.text(ctx, sp.types[t].toUpperCase().slice(0, 8), 160 + t * 40, 100, G.C.white);
            }
            var stats2 = G.monStats(cur);
            G.text(ctx, cur.curHp + '/' + stats2.hp + ' HP', 158, 26, G.UI.text, G.UI.textShadow);
          }
        }
        G.text(ctx, 'Z: select   X: back', 10, H - 12, G.C.lgry);
      }
    };
  };

  // ----------------------------------------------------------- summary screen --
  G.SummaryScene = function (mon) {
    return {
      opaque: true,
      update: function () {
        if (G.input.justPressed('B') || G.input.justPressed('A')) { G.audio.sfx('cancel'); G.popScene(); }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#2a3040';
        ctx.fillRect(0, 0, W, H);
        var sp = G.SPECIES[mon.sp];
        var nat = G.natureOf(mon);
        // left: sprite + identity
        panel(ctx, 6, 6, 96, 104);
        var img = G.IMG['mon_' + mon.sp];
        if (img) ctx.drawImage(img, 54 - img.width / 2, 72 - img.height);
        G.text(ctx, (mon.shiny ? '★' : '') + G.monName(mon), 14, 12, G.UI.text, G.UI.textShadow);
        G.text(ctx, 'Lv' + mon.level, 74, 12, G.UI.text, G.UI.textShadow);
        for (var t = 0; t < sp.types.length; t++) {
          ctx.fillStyle = G.TYPE_COLORS[sp.types[t]];
          ctx.fillRect(14 + t * 42, 78, 38, 10);
          G.text(ctx, sp.types[t].toUpperCase().slice(0, 8), 16 + t * 42, 80, G.C.white);
        }
        G.text(ctx, 'No.' + (sp.id < 10 ? '00' : sp.id < 100 ? '0' : '') + sp.id, 14, 94, G.UI.text, G.UI.textShadow);
        G.text(ctx, nat.name + ' nature', 14, 102, '#e8c038', G.UI.textShadow);
        // right: stats — the nature's raised stat shows red, its lowered stat blue
        panel(ctx, 108, 6, 126, 70);
        var stats = G.monStats(mon);
        var natKeys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
        var rows = [['HP', mon.curHp + '/' + stats.hp], ['Attack', stats.atk], ['Defense', stats.def], ['Sp. Atk', stats.spa], ['Sp. Def', stats.spd], ['Speed', stats.spe]];
        for (var i = 0; i < rows.length; i++) {
          var sc = natKeys[i] === nat.up ? '#d04a48' : natKeys[i] === nat.down ? '#4a90e0' : G.UI.text;
          G.text(ctx, rows[i][0], 116, 12 + i * 10, sc, G.UI.textShadow);
          G.text(ctx, String(rows[i][1]), 196, 12 + i * 10, sc, G.UI.textShadow);
        }
        // moves
        panel(ctx, 108, 80, 126, 56);
        for (var m = 0; m < mon.moves.length; m++) {
          var ms = mon.moves[m];
          var mv = G.MOVES[ms.id];
          G.text(ctx, mv.name, 116, 86 + m * 12, G.UI.text, G.UI.textShadow);
          G.text(ctx, ms.pp + '/' + ms.maxPp, 204, 86 + m * 12, G.UI.text, G.UI.textShadow);
        }
        // dex line
        var lines = G.textWrap(sp.dex, 220);
        for (var d = 0; d < Math.min(2, lines.length); d++) {
          G.text(ctx, lines[d], 10, 116 + d * 11, G.C.white, '#1a1c2c');
        }
        G.text(ctx, 'Z/X: back', 10, H - 12, G.C.lgry);
      }
    };
  };

  // -------------------------------------------------------------- bag screen --
  G.BagScene = function () {
    function usable() {
      var list = [];
      for (var id in G.player.bag) {
        if (G.player.bag[id] > 0) list.push(id);
      }
      return list;
    }
    return {
      opaque: true,
      sel: 0,
      update: function () {
        var ids = usable();
        if (!ids.length) { G.popScene(); G.pushScene(G.Textbox('The bag is empty!')); return; }
        var n = ids.length;
        this.sel = G.clamp(this.sel, 0, n - 1);
        if (G.input.repeat('up')) { this.sel = (this.sel + n - 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.repeat('down')) { this.sel = (this.sel + 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.justPressed('B')) { G.audio.sfx('cancel'); G.popScene(); return; }
        if (G.input.justPressed('A')) {
          G.audio.sfx('confirm');
          var id = ids[this.sel];
          var item = G.ITEMS[id];
          if (item.kind === 'orb') {
            G.pushScene(G.Textbox('Better saved for a wild battle!'));
          } else if (item.kind === 'repel') {
            G.player.bag[id]--;
            G.player.repelSteps = item.steps;
            G.audio.sfx('heal');
            G.pushScene(G.Textbox('You spritzed the Repel Mist. Weak wild creatures will keep away!'));
          } else {
            G.pushScene(G.PartyScene({
              pickMode: true,
              onPick: function (idx) {
                if (idx < 0) return;
                var mon = G.player.party[idx];
                var stats = G.monStats(mon);
                var msg = 'It had no effect...';
                if (item.kind === 'heal' && mon.curHp > 0 && mon.curHp < stats.hp) {
                  var from = mon.curHp;
                  mon.curHp = Math.min(stats.hp, mon.curHp + item.amount);
                  msg = G.monName(mon) + ' recovered ' + (mon.curHp - from) + ' HP!';
                  G.player.bag[id]--;
                  G.audio.sfx('heal');
                } else if (item.kind === 'cure' && mon.status && item.statuses.indexOf(mon.status) !== -1) {
                  mon.status = null; mon.slpTurns = 0;
                  msg = G.monName(mon) + ' is back to normal!';
                  G.player.bag[id]--;
                  G.audio.sfx('heal');
                } else if (item.kind === 'revive' && mon.curHp <= 0) {
                  mon.curHp = Math.max(1, Math.floor(stats.hp * item.frac));
                  msg = G.monName(mon) + ' came back to its senses!';
                  G.player.bag[id]--;
                  G.audio.sfx('heal');
                } else if (item.kind === 'xp') {
                  if (mon.egg) { msg = 'The EGG cannot use that.'; }
                  else if (mon.level >= 100) { msg = G.monName(mon) + ' is already at the top level!'; }
                  else {
                    var startLvl = mon.level;
                    var events = G.gainExp(mon, item.amount);
                    G.player.bag[id]--;
                    G.audio.sfx('levelUp');
                    msg = G.monName(mon) + ' gained ' + item.amount + ' EXP!';
                    if (mon.level > startLvl) msg += ' It grew to Lv' + mon.level + '!';
                    var learned = [];
                    for (var e = 0; e < events.length; e++) {
                      if (events[e].type === 'learn' && mon.moves.length < 4 && !G.knowsMove(mon, events[e].moveId)) {
                        var mv = events[e].moveId;
                        mon.moves.push({ id: mv, pp: G.MOVES[mv].pp, maxPp: G.MOVES[mv].pp });
                        learned.push(G.MOVES[mv].name);
                      }
                    }
                    if (learned.length) msg += ' Learned ' + learned.join(', ') + '!';
                    var evo = G.evolutionDue(mon);
                    if (evo && G.EvolutionScene) G.pushScene(G.EvolutionScene([{ mon: mon, to: evo }]));
                  }
                }
                G.pushScene(G.Textbox(msg));
              }
            }));
          }
        }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#2a3040';
        ctx.fillRect(0, 0, W, H);
        G.text(ctx, 'BAG', 10, 6, G.C.white, '#1a1c2c');
        var ids = usable();
        var top = Math.max(0, Math.min(this.sel - 3, ids.length - 7));
        for (var i = top; i < Math.min(ids.length, top + 7); i++) {
          var y = 20 + (i - top) * 16;
          var item = G.ITEMS[ids[i]];
          panel(ctx, 8, y, 130, 17);
          G.text(ctx, item.name, 16, y + 5, G.UI.text, G.UI.textShadow);
          G.text(ctx, 'x' + G.player.bag[ids[i]], 112, y + 5, G.UI.text, G.UI.textShadow);
          if (i === this.sel) ctx.drawImage(G.IMG.ui_cursor, 2, y + 6);
        }
        var cur = G.ITEMS[ids[this.sel]];
        if (cur) {
          panel(ctx, 144, 20, 92, 60);
          var lines = G.textWrap(cur.desc, 76);
          for (var d = 0; d < Math.min(4, lines.length); d++) {
            G.text(ctx, lines[d], 151, 27 + d * 11, G.UI.text, G.UI.textShadow);
          }
        }
        G.text(ctx, '$' + G.player.money, 150, 90, G.C.white, '#1a1c2c');
        G.text(ctx, 'Z: use   X: back', 10, H - 12, G.C.lgry);
      }
    };
  };

  // --------------------------------------------------- Birch's Lab storage PC --
  // Two columns: PARTY (left, max 6) and LAB box (right, scrollable). Z transfers
  // the highlighted creature across; the party can never drop below 1 or exceed 6.
  G.PCScene = function () {
    var VIS = 7; // visible box rows
    return {
      opaque: true,
      col: 0,        // 0 = party, 1 = box
      pSel: 0, bSel: 0, bTop: 0,
      msg: 'Move creatures between your party and the Lab.',
      _list: function () { return this.col === 0 ? G.player.party : G.player.box; },
      _sel: function () { return this.col === 0 ? this.pSel : this.bSel; },
      _setSel: function (v) { if (this.col === 0) this.pSel = v; else this.bSel = v; },
      update: function () {
        var party = G.player.party, box = G.player.box;
        if (G.input.justPressed('B')) { G.audio.sfx('cancel'); G.popScene(); return; }
        if (G.input.justPressed('left') && this.col !== 0) { this.col = 0; G.audio.sfx('menuMove'); }
        if (G.input.justPressed('right') && box.length) { this.col = 1; this.bSel = Math.min(this.bSel, box.length - 1); G.audio.sfx('menuMove'); }
        var n = this._list().length;
        if (n) {
          if (G.input.repeat('up')) { this._setSel((this._sel() + n - 1) % n); G.audio.sfx('menuMove'); }
          if (G.input.repeat('down')) { this._setSel((this._sel() + 1) % n); G.audio.sfx('menuMove'); }
        }
        // keep box scroll window around the selection
        if (this.bSel < this.bTop) this.bTop = this.bSel;
        if (this.bSel >= this.bTop + VIS) this.bTop = this.bSel - VIS + 1;
        if (G.input.justPressed('A')) {
          if (this.col === 0) {
            if (!party.length) return;
            if (party.length <= 1) { this.msg = "You can't store your last creature!"; G.audio.sfx('cancel'); return; }
            var m = party.splice(this.pSel, 1)[0];
            box.push(m);
            this.pSel = Math.min(this.pSel, party.length - 1);
            this.msg = G.monName(m) + ' was stored in the Lab.';
            G.audio.sfx('confirm');
          } else {
            if (!box.length) return;
            if (party.length >= 6) { this.msg = 'Your party is full (6).'; G.audio.sfx('cancel'); return; }
            var m2 = box.splice(this.bSel, 1)[0];
            party.push(m2);
            if (this.bSel >= box.length) this.bSel = Math.max(0, box.length - 1);
            if (!box.length) this.col = 0;
            this.msg = G.monName(m2) + ' was added to your party!';
            G.audio.sfx('confirm');
          }
        }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#2a3040'; ctx.fillRect(0, 0, W, H);
        var party = G.player.party, box = G.player.box;
        G.text(ctx, "BIRCH'S LAB  —  STORAGE PC", 10, 4, G.C.white, '#1a1c2c');

        // PARTY column
        G.text(ctx, 'PARTY ' + party.length + '/6', 12, 16, this.col === 0 ? '#f8e878' : G.C.lgry, '#1a1c2c');
        for (var i = 0; i < 6; i++) {
          var y = 26 + i * 16;
          panel(ctx, 8, y, 104, 15);
          var mon = party[i];
          if (mon) {
            G.text(ctx, G.monName(mon), 16, y + 4, G.UI.text, G.UI.textShadow);
            G.text(ctx, 'Lv' + mon.level, 82, y + 4, G.UI.text, G.UI.textShadow);
          } else {
            G.text(ctx, '—', 16, y + 4, G.C.gry);
          }
          if (this.col === 0 && i === this.pSel) ctx.drawImage(G.IMG.ui_cursor, 1, y + 4);
        }

        // LAB box column (scrollable)
        G.text(ctx, 'LAB ' + box.length, 126, 16, this.col === 1 ? '#f8e878' : G.C.lgry, '#1a1c2c');
        panel(ctx, 120, 24, 116, VIS * 13 + 8);
        if (!box.length) {
          G.text(ctx, 'Empty.', 128, 30, G.C.gry);
        } else {
          for (var b = this.bTop; b < Math.min(box.length, this.bTop + VIS); b++) {
            var by = 30 + (b - this.bTop) * 13;
            var bm = box[b];
            G.text(ctx, G.monName(bm), 134, by, G.UI.text, G.UI.textShadow);
            G.text(ctx, 'Lv' + bm.level, 204, by, G.UI.text, G.UI.textShadow);
            if (this.col === 1 && b === this.bSel) ctx.drawImage(G.IMG.ui_cursor, 124, by);
          }
        }

        // selected creature preview
        var cur = this._list()[this._sel()];
        if (cur) {
          var img = G.IMG['mon_' + cur.sp];
          if (img) ctx.drawImage(img, 178 - img.width / 2, 150 - img.height);
        }
        panel(ctx, 2, H - 26, 170, 22);
        var ml = G.textWrap(this.msg, 158);
        G.text(ctx, ml[0] || '', 8, H - 21, G.UI.text, G.UI.textShadow);
        G.text(ctx, 'Z: move   <>: switch   X: exit', 8, H - 11, G.C.lgry);
      }
    };
  };

  // -------------------------------------------------------------- dex screen --
  // ------------------------------------------------ Hall of Fame induction ---
  // Plays after the Champion falls: a starlit parade of your team, then a
  // closing line. onDone() continues the post-game (the legend fork).
  G.HallOfFameScene = function (onDone) {
    var party = (G.player.party || []).filter(function (m) { return !m.egg; });
    var t = 0, finished = false;
    function ct(ctx, s, cx, y, c, sh) { G.text(ctx, s, Math.round(cx - G.textWidth(s) / 2), y, c, sh); }
    function finish() { if (finished) return; finished = true; G.popScene(); if (onDone) onDone(); }
    return {
      opaque: true,
      enter: function () { if (G.audio.playMusic) G.audio.playMusic('champion'); },
      update: function () {
        t++;
        var total = 60 + party.length * 45 + 200;
        if (t >= total || (t > 90 && (G.input.justPressed('A') || G.input.justPressed('start') || G.input.justPressed('B')))) finish();
      },
      draw: function (ctx) {
        ctx.fillStyle = '#191335'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#241a4a'; ctx.fillRect(0, 44, W, 70);
        for (var i = 0; i < 40; i++) {
          var sx = (i * 53 + t * 0.6) % W, sy = (i * 29 + t * 0.3) % H, tw = (t + i * 7) % 40;
          ctx.fillStyle = tw < 20 ? 'rgba(255,236,150,0.8)' : 'rgba(255,236,150,0.25)';
          ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
        }
        ct(ctx, '★ HALL OF FAME ★', W / 2, 8, '#f8e878', '#5a3a10');
        var shown = Math.min(party.length, Math.floor((t - 55) / 45) + 1);
        var cols = Math.max(1, party.length), slotW = Math.floor(W / cols);
        for (var k = 0; k < shown; k++) {
          var m = party[k];
          var img = G.IMG['mon_' + m.sp + (m.shiny && G.IMG['mon_' + m.sp + '_shiny'] ? '_shiny' : '')];
          var cx = Math.round(slotW * k + slotW / 2);
          var appear = G.clamp((t - 55 - k * 45) / 12, 0, 1);
          if (img) {
            var dw = Math.round(img.width * 0.5), dh = Math.round(img.height * 0.5);
            ctx.globalAlpha = appear; ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, Math.round(cx - dw / 2), Math.round(86 - dh - appear * 2), dw, dh);
            ctx.globalAlpha = 1;
            if (appear >= 1) {
              ct(ctx, G.monName(m), cx, 88, G.C.white, '#1a1c2c');
              ct(ctx, 'Lv' + m.level, cx, 98, G.C.lgry, '#1a1c2c');
            }
          }
        }
        if (shown >= party.length) {
          ct(ctx, (G.player.name || 'You') + ' and partners', W / 2, 118, G.C.white, '#1a1c2c');
          ct(ctx, 'are now LEGENDS of Hoenn!', W / 2, 130, '#f8e878', '#5a3a10');
          ct(ctx, 'Z: continue', W / 2, 150, G.C.lgry);
        }
      }
    };
  };

  G.DexScene = function () {
    var RARITY_STARS = { common: '★', uncommon: '★★', rare: '★★★', elusive: '★★★★', legendary: '★★★★★' };
    // Hoenn regional dex first (Treecko -> Deoxys), then any kept extras.
    var ORDER = (G.HOENN_DEX || G.DEX_ORDER).concat(
      G.DEX_ORDER.filter(function (k) { return !(G.HOENN_NO && G.HOENN_NO[k]); }));
    return {
      opaque: true,
      sel: 0,
      update: function () {
        var n = ORDER.length;
        if (G.input.repeat('up')) { this.sel = (this.sel + n - 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.repeat('down')) { this.sel = (this.sel + 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.repeat('left')) { this.sel = Math.max(0, this.sel - 10); G.audio.sfx('menuMove'); }
        if (G.input.repeat('right')) { this.sel = Math.min(n - 1, this.sel + 10); G.audio.sfx('menuMove'); }
        if (G.input.justPressed('B')) { G.audio.sfx('cancel'); G.popScene(); }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#222838';
        ctx.fillRect(0, 0, W, H);
        var seen = 0, caught = 0;
        for (var k in G.player.dexSeen) seen++;
        for (var c in G.player.dexCaught) caught++;
        G.text(ctx, 'CREATURE DEX', 10, 5, G.C.white, '#1a1c2c');
        G.text(ctx, 'Seen ' + seen + '  Caught ' + caught, 130, 5, G.C.white, '#1a1c2c');

        var top = G.clamp(this.sel - 4, 0, Math.max(0, ORDER.length - 9));
        for (var i = top; i < Math.min(ORDER.length, top + 9); i++) {
          var key = ORDER[i];
          var sp = G.SPECIES[key];
          var y = 18 + (i - top) * 14;
          var isSeen = G.player.dexSeen[key], isCaught = G.player.dexCaught[key];
          var hno = G.HOENN_NO && G.HOENN_NO[key], num = hno || sp.id;
          var label = (hno ? '#' : 'No.') + (num < 10 ? '00' : num < 100 ? '0' : '') + num + '  ' + (isSeen ? sp.name : '-----');
          // caught = bright, seen-only = grayed, unseen = darkest
          var color = isCaught ? G.C.white : isSeen ? G.C.gry : '#3a3f4e';
          if (i === this.sel) color = isCaught ? '#f8e878' : G.C.lgry;
          G.text(ctx, label, 12, y, color, '#1a1c2c');
          if (isCaught) G.text(ctx, '★', 2, y, G.UI.hpGreen);
          if (i === this.sel) ctx.drawImage(G.IMG.ui_cursor, 110, y + 1);
        }
        // detail panel
        var curKey = ORDER[this.sel];
        var curSp = G.SPECIES[curKey];
        panel(ctx, 124, 16, 112, 120);
        if (G.player.dexCaught[curKey]) {
          var img = G.IMG['mon_' + curKey];
          if (img) ctx.drawImage(img, 168 - img.width / 2, 72 - img.height);
          G.text(ctx, curSp.name, 132, 22, G.UI.text, G.UI.textShadow);
          G.text(ctx, RARITY_STARS[curSp.rarity] || '', 196, 22, '#b08818');
          // base stats, compact
          var sRows = [['HP', curSp.base.hp], ['Atk', curSp.base.atk], ['Def', curSp.base.def], ['SpA', curSp.base.spa], ['SpD', curSp.base.spd], ['Spe', curSp.base.spe]];
          for (var si = 0; si < sRows.length; si++) {
            var sx = 132 + (si % 2) * 52, sy = 76 + Math.floor(si / 2) * 10;
            G.text(ctx, sRows[si][0], sx, sy, G.UI.text, G.UI.textShadow);
            G.text(ctx, String(sRows[si][1]), sx + 26, sy, '#2a6a8e', G.UI.textShadow);
          }
          var lines = G.textWrap(curSp.dex, 96);
          for (var d = 0; d < Math.min(3, lines.length); d++) {
            G.text(ctx, lines[d], 132, 108 + d * 10, G.UI.text, G.UI.textShadow);
          }
        } else if (G.player.dexSeen[curKey]) {
          G.text(ctx, curSp.name, 132, 22, G.UI.text, G.UI.textShadow);
          G.text(ctx, '? ? ?', 168, 60, G.UI.text, G.UI.textShadow);
          G.text(ctx, 'Catch one to record', 132, 92, G.UI.text, G.UI.textShadow);
          G.text(ctx, 'its dex entry.', 132, 102, G.UI.text, G.UI.textShadow);
        } else {
          G.text(ctx, 'Unknown', 132, 22, G.UI.text, G.UI.textShadow);
        }
        G.text(ctx, 'X: back', 10, H - 12, G.C.lgry);
      }
    };
  };

  // ------------------------------------------------------------ region map --
  // Hoenn (western/southern half) overworld map. Areas the player has entered
  // light up; unexplored areas stay dim. Cursor inspects each; current area is
  // ringed. Node ids are the internal map ids so visited[] lines up directly.
  G.RegionMapScene = function () {
    // full western/southern Hoenn route, 8 gym towns, laid out as a serpentine
    // an archipelago: a big mainland (west+center), the south Dewford island,
    // and the eastern isles — sea routes (109/121/124) run over open water.
    var NODES = [
      // --- mainland (the big volcano landmass) ---
      { id: 'hearthvale',    label: 'Littleroot Town',  kind: 'town',   x: 30,  y: 96 },
      { id: 'route1',        label: 'Route 101',        kind: 'route',  x: 30,  y: 78 },
      { id: 'cobblemarch',   label: 'Rustboro City',    kind: 'gym', type: 'rock',     x: 26, y: 56 },
      { id: 'route2',        label: 'Route 102',        kind: 'route',  x: 48,  y: 42 },
      { id: 'verdantforest', label: 'Petalburg Woods',  kind: 'forest', x: 72,  y: 36 },
      // --- Dewford island (south) ---
      { id: 'brinehollow',   label: 'Dewford Town',     kind: 'gym', type: 'fighting', x: 32, y: 119 },
      { id: 'route3',        label: 'Route 109',        kind: 'route',  x: 56,  y: 122 },
      { id: 'hollowdeep1',   label: 'Granite Cave',     kind: 'cave',   x: 80,  y: 119 },
      // --- mainland (center / volcano) ---
      { id: 'coilgate',      label: 'Mauville City',    kind: 'gym', type: 'electric', x: 124, y: 48 },
      { id: 'route4',        label: 'Route 111',        kind: 'route',  x: 126, y: 70 },
      { id: 'aurelune',      label: 'Lavaridge Town',   kind: 'gym', type: 'fire',     x: 102, y: 64 },
      { id: 'route5',        label: 'Route 117',        kind: 'route',  x: 82,  y: 74 },
      { id: 'petalburg',     label: 'Petalburg City',   kind: 'gym', type: 'normal',   x: 58, y: 84 },
      { id: 'route6',        label: 'Route 119',        kind: 'route',  x: 90,  y: 96 },
      { id: 'fortree',       label: 'Fortree City',     kind: 'gym', type: 'flying',    x: 122, y: 92 },
      // --- eastern isles ---
      { id: 'route7',        label: 'Route 121',        kind: 'route',  x: 144, y: 80 },
      { id: 'mossdeep',      label: 'Mossdeep City',    kind: 'gym', type: 'psychic',  x: 164, y: 70 },
      { id: 'route8',        label: 'Route 124',        kind: 'route',  x: 186, y: 72 },
      { id: 'sootopolis',    label: 'Sootopolis City',  kind: 'gym', type: 'water',    x: 208, y: 74 },
      { id: 'summitpath',    label: 'Victory Road',     kind: 'cave',   x: 214, y: 48 },
      { id: 'crownsummit',   label: 'Pokémon League',   kind: 'league', x: 214, y: 28 }
    ];
    var visited = G.player.visited || {};
    function isSeen(id) { return !!visited[id]; }
    var mid = (G.world && G.world.mapId) || '';
    var cur = -1;
    for (var i = 0; i < NODES.length; i++) {
      if (NODES[i].id === mid || mid.indexOf(NODES[i].id) !== -1) { cur = i; break; }
    }
    var seenCount = 0;
    for (var v = 0; v < NODES.length; v++) if (isSeen(NODES[v].id)) seenCount++;

    return {
      opaque: true,
      sel: cur >= 0 ? cur : 0,
      update: function () {
        if (G.input.justPressed('B') || G.input.justPressed('start')) { G.audio.sfx('cancel'); G.popScene(); return; }
        if (G.input.repeat('right') || G.input.repeat('down')) { this.sel = (this.sel + 1) % NODES.length; G.audio.sfx('menuMove'); }
        if (G.input.repeat('left') || G.input.repeat('up')) { this.sel = (this.sel + NODES.length - 1) % NODES.length; G.audio.sfx('menuMove'); }
      },
      draw: function (ctx) {
        // ---- pixel-art helpers (crisp fillRect blocks, no anti-aliasing) ----
        var CELL = 4; // chunky, low-res blocks (coarse GBA-map coastline)
        function pxHash(gx, gy) { var h = (gx * 374761 ^ gy * 668265) >>> 0; h = (h ^ (h >>> 13)) >>> 0; return (h % 1000) / 1000; }
        function blob(cx, cy, rx, ry, color) {            // grid-quantized island w/ jagged coast
          ctx.fillStyle = color;
          var x0 = Math.floor((cx - rx) / CELL) * CELL, x1 = Math.ceil((cx + rx) / CELL) * CELL;
          var y0 = Math.floor((cy - ry) / CELL) * CELL, y1 = Math.ceil((cy + ry) / CELL) * CELL;
          for (var gy = y0; gy < y1; gy += CELL) {
            for (var gx = x0; gx < x1; gx += CELL) {
              var dx = (gx + 1.5 - cx) / rx, dy = (gy + 1.5 - cy) / ry;
              if (dx * dx + dy * dy <= 0.84 + (pxHash(gx, gy) - 0.5) * 0.5) ctx.fillRect(gx, gy, CELL, CELL);
            }
          }
        }
        function isle(cx, cy, rx, ry) { blob(cx, cy, rx + 3, ry + 3, '#e3d39a'); blob(cx, cy, rx, ry, '#3f8a3f'); }
        function trail(x0, y0, x1, y1) {                  // dotted route path
          ctx.fillStyle = '#efe3b0';
          var dx = x1 - x0, dy = y1 - y0, len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          for (var t = 0; t <= len; t += 3) ctx.fillRect(Math.round(x0 + dx * t / len) - 1, Math.round(y0 + dy * t / len) - 1, 2, 2);
        }

        // pixel sea + wave dashes
        ctx.fillStyle = '#2a73b8'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#3a86c8';
        for (var wy = 5; wy < H; wy += 7) for (var wx = (wy & 8) ? 0 : 8; wx < W; wx += 16) ctx.fillRect(wx, wy, 5, 2);

        // BIG MAINLAND (volcano landmass): sand under all lobes, then green over all
        blob(70, 60, 63, 41, '#e3d39a'); blob(112, 82, 33, 27, '#e3d39a'); blob(32, 84, 27, 27, '#e3d39a');
        blob(70, 60, 60, 38, '#3f8a3f'); blob(112, 82, 30, 24, '#3f8a3f'); blob(32, 84, 24, 24, '#3f8a3f');
        blob(66, 54, 40, 22, '#54a354'); // inland highlight
        // separate islands
        isle(54, 121, 36, 10);                 // Dewford
        isle(164, 70, 18, 15);                 // Mossdeep
        isle(208, 74, 18, 15); blob(208, 74, 8, 5, '#7fd0e0'); // Sootopolis + crater lake
        isle(214, 36, 17, 20);                 // Ever Grande / League

        // volcano on the mainland (Lavaridge)
        var volc = NODES[10];
        blob(volc.x, volc.y + 2, 10, 7, '#9a5538');
        ctx.fillStyle = '#5a2e20'; ctx.fillRect(volc.x - 2, volc.y - 6, 5, 7);
        ctx.fillStyle = '#e0682c'; ctx.fillRect(volc.x - 1, volc.y - 7, 3, 2);
        ctx.fillStyle = '#d8d8d8'; ctx.fillRect(volc.x, volc.y - 12, 2, 5); // smoke

        G.text(ctx, 'HOENN — REGION MAP', 8, 5, G.C.white, '#1a1c2c');

        // route trails (sea segments look the same — they cross open water)
        for (var e = 0; e < NODES.length - 1; e++) trail(NODES[e].x, NODES[e].y, NODES[e + 1].x, NODES[e + 1].y);

        // detailed per-area markers
        for (var i = 0; i < NODES.length; i++) {
          var n = NODES[i], seen = isSeen(n.id), here = (i === cur), x = n.x, y = n.y;
          if (here && (G.frame >> 4) % 2 === 0) { // blinking "you are here" arrow above the town
            ctx.fillStyle = '#f8e878';
            ctx.fillRect(x - 3, y - 12, 6, 2); ctx.fillRect(x - 2, y - 10, 4, 1); ctx.fillRect(x - 1, y - 9, 2, 1);
          }
          if (!seen) {
            ctx.fillStyle = '#34465f'; ctx.fillRect(x - 2, y - 2, 4, 4);
            ctx.fillStyle = '#26354c'; ctx.fillRect(x - 1, y - 1, 2, 2);
          } else {
            var px = function (a, b, c, d, col) { ctx.fillStyle = col; ctx.fillRect(x + a, y + b, c, d); };
            if (n.kind === 'gym') {
              var gc = (G.TYPE_COLORS && G.TYPE_COLORS[n.type]) || '#cccccc';
              px(-4, -4, 8, 8, G.C.ink); px(-3, -3, 6, 6, gc); px(-3, -3, 2, 2, '#ffffff');
            } else if (n.kind === 'town') {
              px(-4, -2, 8, 1, '#b83a3a'); px(-3, -3, 6, 1, '#b83a3a'); px(-2, -4, 4, 1, '#b83a3a'); // roof
              px(-3, -1, 6, 4, '#ece6d4'); px(-1, 0, 2, 3, '#7a5230');                                // wall + door
            } else if (n.kind === 'forest') {
              px(-1, 1, 2, 3, '#6b4a2a'); px(-3, -4, 6, 5, '#2f7a35'); px(-2, -6, 4, 2, '#2f7a35');
            } else if (n.kind === 'cave') {
              px(-4, -3, 8, 6, '#6d6b78'); px(-2, 0, 4, 3, '#15171f');
            } else if (n.kind === 'league') {
              px(-4, -2, 8, 5, '#9a7cc0'); px(-4, -4, 2, 2, '#9a7cc0'); px(-1, -4, 2, 2, '#9a7cc0'); px(2, -4, 2, 2, '#9a7cc0');
              px(3, -8, 1, 4, '#7a4a3a'); px(4, -8, 3, 2, '#e0682c'); // flagpole + flag
            } else { // route
              px(-2, -2, 4, 4, '#efe6bf'); px(-1, -1, 2, 2, '#c8b97a');
            }
          }
          if (i === this.sel) { ctx.fillStyle = '#f8e878'; var b = 7; ctx.fillRect(x - b, y - b, b * 2, 1); ctx.fillRect(x - b, y + b - 1, b * 2, 1); ctx.fillRect(x - b, y - b, 1, b * 2); ctx.fillRect(x + b - 1, y - b, 1, b * 2); }
        }

        // footer: selected area name + explored count
        panel(ctx, 2, H - 28, W - 4, 24);
        var sNode = NODES[this.sel], seenSel = isSeen(sNode.id);
        G.text(ctx, seenSel ? sNode.label : '? ? ? (unexplored)', 8, H - 23, seenSel ? G.UI.text : G.C.gry, G.UI.textShadow);
        if (this.sel === cur) G.text(ctx, 'You are here.', 150, H - 23, G.UI.hpGreen, G.UI.textShadow);
        G.text(ctx, 'Explored ' + seenCount + '/' + NODES.length, 8, H - 12, G.C.lgry);
        G.text(ctx, '<>: move   X: back', W - 110, H - 12, G.C.lgry);
      }
    };
  };
})();
