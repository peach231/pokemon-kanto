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
    // Seven, which is Gen 1's own limit and the reason every nickname
    // anyone gave anything for twenty years was seven characters long.
    var MAX = 7, name = '';
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
    // HELP is where the field's control hints went. They used to be welded
    // to the corner of the screen for the whole game; nobody reads them
    // after the first five minutes and they never go away.
    var items = ['DEX', 'MAP', 'PARTY', 'BAG', 'HELP', 'OPTION', 'SAVE', 'EXIT'];
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
          if (pick === 'HELP') G.pushScene(G.TutorialScene());
          if (pick === 'OPTION') G.pushScene(G.OptionsScene());
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
        // Gen 1 has no natures. What actually varies between two mons of the
        // same species and level is the DV spread, so show that instead — and
        // colour it, since a 15 DV is worth a flat +30 base stat here.
        var dv = mon.dvs || {};
        var dvTot = (dv.hp || 0) + (dv.atk || 0) + (dv.def || 0) + (dv.spc || 0) + (dv.spe || 0);
        G.text(ctx, 'DV total ' + dvTot + '/75', 14, 102,
          dvTot >= 60 ? '#e8c038' : dvTot >= 40 ? G.UI.text : G.C.lgry, G.UI.textShadow);

        // right: stats. ONE Special row — that is the whole point of Gen 1.
        panel(ctx, 108, 6, 126, 70);
        var stats = G.monStats(mon);
        var rows = [
          ['HP', mon.curHp + '/' + stats.hp, dv.hp],
          ['Attack', stats.atk, dv.atk],
          ['Defense', stats.def, dv.def],
          ['Special', stats.spa, dv.spc],
          ['Speed', stats.spe, dv.spe]
        ];
        for (var i = 0; i < rows.length; i++) {
          var d = rows[i][2];
          var sc = d >= 14 ? '#d04a48' : d <= 2 ? '#4a90e0' : G.UI.text;
          G.text(ctx, rows[i][0], 116, 12 + i * 10, sc, G.UI.textShadow);
          G.text(ctx, String(rows[i][1]), 190, 12 + i * 10, sc, G.UI.textShadow);
          G.text(ctx, d == null ? '' : String(d), 218, 12 + i * 10, G.C.lgry);
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

  // Key items mostly just describe themselves, but a few DO something when
  // used from the bag. Returning a string replaces the default description.
  function useKeyItem(id) {
    if (id === 'townmap') { G.pushScene(G.RegionMapScene()); return ' '; }
    if (id === 'pokeflute') {
      // Out of battle the flute is a story object; it wakes exactly one thing.
      return 'You played the POKé FLUTE. The melody drifts away over the rooftops.';
    }
    if (id === 'itemfinder') {
      return 'The ITEM FINDER hums flatly. Nothing is buried here.';
    }
    if (id === 'coincase') {
      return 'COIN CASE: ' + (G.player.coins || 0) + ' coins.';
    }
    if (id === 'bicycle') {
      if (G.world.map && G.world.map.indoors) return 'No cycling indoors.';
      G.player.onBike = !G.player.onBike;
      return G.player.onBike ? 'You got on the BICYCLE.' : 'You folded up the BICYCLE.';
    }
    return null;
  }

  // -------------------------------------------------------------- bag screen --
  G.BagScene = function () {
    // Gen 1 had one flat bag of twenty slots, which was agony. This keeps one
    // list but ORDERS it into pockets — usables, then machines, then key items
    // — so the thing you reach for most is never buried under thirty TMs.
    var POCKET = { heal: 0, cure: 0, revive: 0, ball: 1, repel: 2, escape: 2, stone: 2, tm: 3, key: 4 };
    function usable() {
      var list = [];
      for (var id in G.player.bag) {
        if (G.player.bag[id] > 0 && G.ITEMS[id]) list.push(id);
      }
      list.sort(function (a, b) {
        var pa = POCKET[G.ITEMS[a].kind], pb = POCKET[G.ITEMS[b].kind];
        pa = pa === undefined ? 5 : pa; pb = pb === undefined ? 5 : pb;
        if (pa !== pb) return pa - pb;
        return G.ITEMS[a].name < G.ITEMS[b].name ? -1 : 1;
      });
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
          if (item.kind === 'tm') {
            G.teachMachine(id);
          } else if (item.kind === 'key') {
            G.pushScene(G.Textbox(useKeyItem(id) || item.desc));
          } else if (item.kind === 'ball') {
            G.pushScene(G.Textbox('Better saved for a wild POKéMON.'));
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
                    // A RARE CANDY is denominated in LEVELS, not experience —
                    // so it is worth exactly one level whether it is used on a
                    // level 5 or a level 60, which is the whole point of it.
                    var gain = item.levels
                      ? Math.max(1, G.monExpForLevel(mon, mon.level + item.levels) - mon.exp)
                      : item.amount;
                    var events = G.gainExp(mon, gain);
                    G.player.bag[id]--;
                    G.audio.sfx('levelUp');
                    msg = item.levels ? (G.monName(mon) + ' grew!') : (G.monName(mon) + ' gained ' + gain + ' EXP!');
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

  // ------------------------------------------------- Bill's PC storage system --
  // Two columns: PARTY (left, max 6) and LAB box (right, scrollable). Z transfers
  // the highlighted creature across; the party can never drop below 1 or exceed 6.
  G.PCScene = function () {
    var VIS = 7; // visible box rows
    return {
      opaque: true,
      col: 0,        // 0 = party, 1 = box
      pSel: 0, bSel: 0, bTop: 0,
      msg: "Move POKéMON between your party and BILL's PC.",
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
          ct(ctx, 'are now LEGENDS of KANTO!', W / 2, 130, '#f8e878', '#5a3a10');
          ct(ctx, 'Z: continue', W / 2, 150, G.C.lgry);
        }
      }
    };
  };

  G.DexScene = function () {
    var RARITY_STARS = { common: '★', uncommon: '★★', rare: '★★★', elusive: '★★★★', legendary: '★★★★★' };
    // Kanto's dex IS the national dex, #1-151, so there is no separate
    // regional numbering to reconcile.
    var ORDER = G.KANTO_DEX || G.DEX_ORDER;
    return {
      opaque: true,
      sel: 0,
      update: function () {
        var n = ORDER.length;
        if (G.input.repeat('up')) { this.sel = (this.sel + n - 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.repeat('down')) { this.sel = (this.sel + 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.repeat('left')) { this.sel = Math.max(0, this.sel - 10); G.audio.sfx('menuMove'); }
        if (G.input.repeat('right')) { this.sel = Math.min(n - 1, this.sel + 10); G.audio.sfx('menuMove'); }
        if (G.input.justPressed('B')) { G.audio.sfx('cancel'); G.popScene(); return; }
        // A dex you cannot open is just a list of names. Z opens the page.
        if (G.input.justPressed('A')) {
          var k = ORDER[this.sel];
          if (G.player.dexSeen[k]) { G.audio.sfx('confirm'); G.pushScene(G.DexEntryScene(k)); }
          else G.audio.sfx('cancel');
        }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#222838';
        ctx.fillRect(0, 0, W, H);
        var seen = 0, caught = 0;
        for (var k in G.player.dexSeen) seen++;
        for (var c in G.player.dexCaught) caught++;
        G.text(ctx, 'POKéDEX', 10, 5, G.C.white, '#1a1c2c');
        G.text(ctx, 'Seen ' + seen + '  Caught ' + caught, 130, 5, G.C.white, '#1a1c2c');

        var top = G.clamp(this.sel - 4, 0, Math.max(0, ORDER.length - 9));
        for (var i = top; i < Math.min(ORDER.length, top + 9); i++) {
          var key = ORDER[i];
          var sp = G.SPECIES[key];
          var y = 18 + (i - top) * 14;
          var isSeen = G.player.dexSeen[key], isCaught = G.player.dexCaught[key];
          var num = sp.id;
          var label = 'No.' + (num < 10 ? '00' : num < 100 ? '0' : '') + num + '  ' + (isSeen ? sp.name : '-----');
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
  // KANTO — the town map, laid out to the real geography: Pallet in the
  // south-west, the road north through Viridian and Pewter, east across
  // Mt. Moon to Cerulean, then the long loop south through Saffron and
  // Vermilion, east to Lavender, west to Celadon and Fuchsia, and out to
  // Cinnabar and the Plateau. Areas you have entered light up; the rest stay
  // dim. Node ids are the internal map ids, so visited[] lines up directly.
  G.RegionMapScene = function () {
    var NODES = [
      // --- the south-western road ---
      { id: 'pallet',         label: 'Pallet Town',      kind: 'town',   x: 38,  y: 132 },
      { id: 'route1',         label: 'Route 1',          kind: 'route',  x: 38,  y: 116 },
      { id: 'viridian',       label: 'Viridian City',    kind: 'gym', type: 'ground', x: 38, y: 100 },
      { id: 'route22',        label: 'Route 22',         kind: 'route',  x: 18,  y: 100 },
      { id: 'route2',         label: 'Route 2',          kind: 'route',  x: 38,  y: 84 },
      { id: 'viridianforest', label: 'Viridian Forest',  kind: 'forest', x: 38,  y: 70 },
      { id: 'pewter',         label: 'Pewter City',      kind: 'gym', type: 'rock', x: 38, y: 54 },
      // --- east across the mountain ---
      { id: 'route3',         label: 'Route 3',          kind: 'route',  x: 58,  y: 48 },
      { id: 'mtmoon1f',       label: 'Mt. Moon',         kind: 'cave',   x: 78,  y: 46 },
      { id: 'route4',         label: 'Route 4',          kind: 'route',  x: 98,  y: 48 },
      { id: 'cerulean',       label: 'Cerulean City',    kind: 'gym', type: 'water', x: 118, y: 48 },
      { id: 'route24',        label: 'Route 24',         kind: 'route',  x: 118, y: 32 },
      { id: 'route25',        label: 'Route 25',         kind: 'route',  x: 138, y: 24 },
      // --- the central spine ---
      { id: 'route5',         label: 'Route 5',          kind: 'route',  x: 118, y: 64 },
      { id: 'saffron',        label: 'Saffron City',     kind: 'gym', type: 'psychic', x: 118, y: 80 },
      { id: 'route6',         label: 'Route 6',          kind: 'route',  x: 118, y: 96 },
      { id: 'vermilion',      label: 'Vermilion City',   kind: 'gym', type: 'electric', x: 118, y: 112 },
      // --- the eastern arm ---
      { id: 'route9',         label: 'Route 9',          kind: 'route',  x: 142, y: 46 },
      { id: 'rocktunnel1f',   label: 'Rock Tunnel',      kind: 'cave',   x: 164, y: 48 },
      { id: 'route10',        label: 'Route 10',         kind: 'route',  x: 176, y: 60 },
      { id: 'lavender',       label: 'Lavender Town',    kind: 'town',   x: 176, y: 78 },
      { id: 'route8',         label: 'Route 8',          kind: 'route',  x: 148, y: 80 },
      { id: 'route11',        label: 'Route 11',         kind: 'route',  x: 144, y: 112 },
      // --- the west ---
      { id: 'route7',         label: 'Route 7',          kind: 'route',  x: 100, y: 80 },
      { id: 'celadon',        label: 'Celadon City',     kind: 'gym', type: 'grass', x: 82, y: 80 },
      { id: 'route16',        label: 'Route 16',         kind: 'route',  x: 82,  y: 96 },
      { id: 'route17',        label: 'Cycling Road',     kind: 'route',  x: 82,  y: 116 },
      { id: 'route18',        label: 'Route 18',         kind: 'route',  x: 100, y: 134 },
      // --- the south ---
      { id: 'route12',        label: 'Route 12',         kind: 'route',  x: 176, y: 96 },
      { id: 'route13',        label: 'Route 13',         kind: 'route',  x: 172, y: 116 },
      { id: 'route14',        label: 'Route 14',         kind: 'route',  x: 158, y: 128 },
      { id: 'route15',        label: 'Route 15',         kind: 'route',  x: 140, y: 136 },
      { id: 'fuchsia',        label: 'Fuchsia City',     kind: 'gym', type: 'poison', x: 120, y: 136 },
      { id: 'safarizonecenter', label: 'Safari Zone',    kind: 'forest', x: 120, y: 120 },
      // --- the sea and the island ---
      { id: 'route19',        label: 'Route 19',         kind: 'route',  x: 104, y: 150 },
      { id: 'route20',        label: 'Route 20',         kind: 'route',  x: 78,  y: 150 },
      { id: 'seafoam1f',      label: 'Seafoam Islands',  kind: 'cave',   x: 62,  y: 150 },
      { id: 'cinnabar',       label: 'Cinnabar Island',  kind: 'gym', type: 'fire', x: 38, y: 148 },
      { id: 'route21',        label: 'Route 21',         kind: 'route',  x: 38,  y: 140 },
      // --- the end of the road ---
      { id: 'route23',        label: 'Route 23',         kind: 'route',  x: 18,  y: 80 },
      { id: 'victoryroad1f',  label: 'Victory Road',     kind: 'cave',   x: 18,  y: 62 },
      { id: 'indigo',         label: 'Indigo Plateau',   kind: 'league', x: 18,  y: 44 }
    ];
    // The footer panel owns the bottom 28 pixels, so the landmass has to live
    // above it. These coordinates were laid out against a full-height screen
    // and put CINNABAR and the SEAFOAM ISLANDS underneath the caption box —
    // squeezing them here keeps the geography honest and the whole region
    // visible at once.
    for (var sq = 0; sq < NODES.length; sq++) {
      NODES[sq].y = Math.round(NODES[sq].y * 0.74 + 12);
    }

    // Which places actually connect to which. Kanto is a loop with two spurs
    // and an island chain, and the shape of that loop is the single most
    // useful thing this screen can tell you.
    var EDGES = [
      ['pallet', 'route1'], ['route1', 'viridian'],
      ['viridian', 'route22'], ['route22', 'route23'],
      ['route23', 'victoryroad1f'], ['victoryroad1f', 'indigo'],
      ['viridian', 'route2'], ['route2', 'viridianforest'], ['viridianforest', 'pewter'],
      ['pewter', 'route3'], ['route3', 'mtmoon1f'], ['mtmoon1f', 'route4'],
      ['route4', 'cerulean'], ['cerulean', 'route24'], ['route24', 'route25'],
      ['cerulean', 'route5'], ['route5', 'saffron'],
      ['saffron', 'route6'], ['route6', 'vermilion'],
      ['cerulean', 'route9'], ['route9', 'rocktunnel1f'],
      ['rocktunnel1f', 'route10'], ['route10', 'lavender'],
      ['lavender', 'route8'], ['route8', 'saffron'],
      ['saffron', 'route7'], ['route7', 'celadon'],
      ['celadon', 'route16'], ['route16', 'route17'], ['route17', 'route18'],
      ['route18', 'fuchsia'],
      ['lavender', 'route12'], ['route12', 'route13'], ['route13', 'route14'],
      ['route14', 'route15'], ['route15', 'fuchsia'],
      ['vermilion', 'route11'], ['route11', 'route12'],
      ['fuchsia', 'safarizonecenter'],
      ['fuchsia', 'route19'], ['route19', 'route20'],
      ['route20', 'seafoam1f'], ['route20', 'cinnabar'],
      ['cinnabar', 'route21'], ['route21', 'pallet']
    ];
    var BY_ID = {};
    for (var bi = 0; bi < NODES.length; bi++) BY_ID[NODES[bi].id] = NODES[bi];

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
        // FLY. Only to towns you have actually stood in — flying somewhere you
        // have only read about on a map would hand you the geography.
        if (G.input.justPressed('A')) {
          var node = NODES[this.sel];
          var pt = G.FLY_POINTS && G.FLY_POINTS[node.id];
          if (!pt) { G.audio.sfx('cancel'); return; }
          if (!isSeen(node.id)) { G.audio.sfx('cancel'); G.pushScene(G.Textbox('You have never been to ' + node.label + '.')); return; }
          if (!G.canFly()) { G.audio.sfx('cancel'); return; }
          if (G.world.map && G.world.map.indoors) { G.audio.sfx('cancel'); G.pushScene(G.Textbox('There is no room to FLY indoors.')); return; }
          G.ask('FLY to ' + node.label + '?', function () { G.flyTo(node.id); });
        }
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

        // The landmass is DERIVED FROM THE NODES rather than hand-drawn: a sand
        // blob then a green blob around every land node, which merge into one
        // coastline. That means the map can never disagree with where the towns
        // actually are — the previous hand-drawn silhouette was still Hoenn's
        // archipelago long after the nodes had become Kanto.
        //
        // Kanto is one contiguous mainland; only Cinnabar and the Seafoam
        // Islands sit offshore, and Routes 19-21 are open water.
        var SEA = { route19: 1, route20: 1, route21: 1 };
        var ISLAND = { cinnabar: 1, seafoam1f: 1 };
        var i2;
        for (i2 = 0; i2 < NODES.length; i2++) {
          var nd = NODES[i2];
          if (SEA[nd.id] || ISLAND[nd.id]) continue;
          blob(nd.x, nd.y, 17, 15, '#e3d39a');
        }
        for (i2 = 0; i2 < NODES.length; i2++) {
          var ng = NODES[i2];
          if (SEA[ng.id] || ISLAND[ng.id]) continue;
          blob(ng.x, ng.y, 14, 12, '#3f8a3f');
        }
        // A lighter interior so the mass is not one flat green — roughly the
        // inland belt between Cerulean, Saffron and Celadon.
        blob(100, 64, 34, 16, '#54a354');
        // The offshore pair.
        isle(38, 122, 15, 10);   // Cinnabar
        isle(62, 123, 11, 8);    // Seafoam

        G.text(ctx, 'KANTO — TOWN MAP', 8, 5, G.C.white, '#1a1c2c');

        // Route trails follow the REAL connections, not the array order. The
        // previous version joined NODES[i] to NODES[i+1], which drew a line
        // from ROUTE 25 straight across the map to ROUTE 5 — a road that does
        // not exist, on the one screen whose entire job is telling you which
        // roads do.
        for (var e = 0; e < EDGES.length; e++) {
          var a = BY_ID[EDGES[e][0]], b = BY_ID[EDGES[e][1]];
          if (a && b) trail(a.x, a.y, b.x, b.y);
        }

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
        G.text(ctx, 'Explored ' + seenCount + '/' + NODES.length, 8, H - 11, G.C.lgry);
        var flyable = G.canFly && G.canFly() && G.FLY_POINTS[sNode.id] && seenSel;
        G.text(ctx, flyable ? 'Z: FLY   X: back' : '<>: move   X: back', W - 110, H - 12,
          flyable ? '#f8e878' : G.C.lgry);
      }
    };
  };

  // ==========================================================================
  // THE SLOT MACHINE.
  //
  // Three reels, one payline, three coins a spin. Gen 1's Game Corner is the
  // only place in the game that takes something from you and gives nothing
  // back, and it is also where two POKéMON and a shelf of TMs live — which is
  // the joke, and the reason the building has to actually work rather than
  // being a room with a poster in it.
  //
  // The odds are deliberately honest and deliberately bad: a ~4% return to
  // player per spin on the top prize, which is roughly what the original paid.
  // Nobody grinds this for fun. They grind it for a PORYGON.
  G.SlotScene = function () {
    var SYM = ['7', 'B', 'C', 'K', 'S', 'P'];          // 7, bar, cherry, ...
    var NAME = { '7': 'SEVEN', 'B': 'BAR', 'C': 'CHERRY', 'K': 'CLEFAIRY', 'S': 'STAR', 'P': 'POKé BALL' };
    var PAY  = { '7': 300, 'B': 100, 'K': 50, 'S': 30, 'P': 15, 'C': 8 };
    var BET = 3;

    var reels = [0, 0, 0];
    var spin = [0, 0, 0];
    var stopped = [true, true, true];
    var phase = 'idle';   // idle | spinning | result
    var msg = 'Insert 3 coins and press Z to spin.';
    var flash = 0;

    function coins() { return G.player.coins || 0; }

    function evaluate() {
      var a = SYM[reels[0]], b = SYM[reels[1]], c = SYM[reels[2]];
      var win = 0, what = '';
      if (a === b && b === c) { win = PAY[a]; what = 'Three ' + NAME[a] + '!'; }
      else if (a === 'C' && b === 'C') { win = 4; what = 'Two CHERRY.'; }
      else if (a === 'C') { win = 2; what = 'One CHERRY.'; }
      if (win) {
        G.player.coins = coins() + win;
        msg = what + ' You won ' + win + ' coins!';
        G.audio.sfx('money');
        flash = 40;
      } else {
        msg = 'Nothing. Again?';
      }
      phase = 'idle';
    }

    return {
      opaque: true,
      enter: function () { G.audio.playMusic('town'); },
      update: function () {
        if (phase === 'spinning') {
          for (var r = 0; r < 3; r++) {
            if (stopped[r]) continue;
            spin[r]++;
            if (spin[r] % 2 === 0) reels[r] = (reels[r] + 1) % SYM.length;
            // reels stop left to right on their own, then the player can nudge
            if (spin[r] > 30 + r * 22) { stopped[r] = true; G.audio.sfx('menuMove'); }
          }
          if (G.input.justPressed('A')) {
            for (var s = 0; s < 3; s++) {
              if (!stopped[s]) { stopped[s] = true; G.audio.sfx('menuMove'); break; }
            }
          }
          if (stopped[0] && stopped[1] && stopped[2]) evaluate();
          return;
        }
        if (flash > 0) flash--;
        if (G.input.justPressed('B') || G.input.justPressed('start')) { G.audio.sfx('cancel'); G.popScene(); return; }
        if (G.input.justPressed('A')) {
          if (coins() < BET) { msg = 'Not enough coins. See the counter.'; G.audio.sfx('cancel'); return; }
          G.player.coins = coins() - BET;
          phase = 'spinning';
          stopped = [false, false, false];
          spin = [0, 0, 0];
          msg = 'Press Z to stop each reel!';
          G.audio.sfx('confirm');
        }
      },
      draw: function (ctx) {
        ctx.fillStyle = (flash > 0 && (G.frame >> 2) % 2 === 0) ? '#3a2d55' : '#241a38';
        ctx.fillRect(0, 0, W, H);
        G.text(ctx, 'ROCKET GAME CORNER', 58, 8, '#f8e878', '#1a1c2c');

        // the machine
        ctx.fillStyle = '#4a3a68'; ctx.fillRect(52, 30, 136, 66);
        ctx.fillStyle = '#1a1428'; ctx.fillRect(58, 40, 124, 46);
        for (var r = 0; r < 3; r++) {
          var x = 64 + r * 40;
          ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x, 46, 32, 34);
          ctx.fillStyle = '#c8c8dc'; ctx.fillRect(x, 46, 32, 2);
          var sym = SYM[reels[r]];
          var col = sym === '7' ? '#d84a4a' : sym === 'B' ? '#3a3a5a' : sym === 'C' ? '#d84a6a'
                  : sym === 'K' ? '#f0a0c0' : sym === 'S' ? '#f8e878' : '#e05050';
          G.text(ctx, sym, x + 13, 58, col, null);
          if (!stopped[r]) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x, 46, 32, 34); }
        }
        // payline
        ctx.fillStyle = '#f8e878'; ctx.fillRect(58, 62, 124, 1);

        G.nineSlice(ctx, G.IMG.ui_box, 4, 104, W - 8, 34, 4);
        var lines = G.textWrap(msg, W - 24);
        for (var i = 0; i < Math.min(2, lines.length); i++) {
          G.text(ctx, lines[i], 12, 111 + i * 11, G.UI.text, G.UI.textShadow);
        }
        G.text(ctx, 'COINS ' + coins(), 8, 92, '#f8e878', '#1a1c2c');
        G.text(ctx, 'Z: spin/stop   X: leave', 118, 92, G.C.lgry);
      }
    };
  };

  // ---------------------------------------------------------- dex entry ----
  // A PAGE, not a row in a list. 151 original dex blurbs were written for this
  // project and until now the only place any of them appeared was a tooltip.
  // Height, weight and the species line come straight from the ROM.
  G.DexEntryScene = function (key) {
    var sp = G.SPECIES[key];
    var meta = (G.DEX_META || {})[key] || { genus: '???', ft: 0, inch: 0, lb: 0 };
    var caught = !!G.player.dexCaught[key];
    var cried = false;
    return {
      opaque: true,
      enter: function () {
        if (caught && G.audio.cry) { G.audio.cry(key); cried = true; }
      },
      update: function () {
        if (G.input.justPressed('B') || G.input.justPressed('start')) { G.audio.sfx('cancel'); G.popScene(); return; }
        if (G.input.justPressed('A') && caught && G.audio.cry) G.audio.cry(key);
      },
      draw: function (ctx) {
        ctx.fillStyle = '#e8e4d8'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#c03028'; ctx.fillRect(0, 0, W, 14);
        ctx.fillStyle = '#8a201a'; ctx.fillRect(0, 14, W, 2);
        var num = 'No.' + (sp.id < 10 ? '00' : sp.id < 100 ? '0' : '') + sp.id;
        G.text(ctx, num + '  ' + sp.name.toUpperCase(), 6, 4, G.C.white, '#5a1410');

        // the creature, on a plate
        ctx.fillStyle = '#f8f8f4'; ctx.fillRect(6, 20, 74, 80);
        ctx.fillStyle = '#b8b4a8'; ctx.fillRect(6, 20, 74, 1); ctx.fillRect(6, 99, 74, 1);
        var img = G.IMG['mon_' + key];
        if (img) {
          var s = Math.min(66 / img.width, 74 / img.height, 1.6);
          ctx.drawImage(img, Math.round(43 - img.width * s / 2), Math.round(97 - img.height * s),
                        Math.round(img.width * s), Math.round(img.height * s));
        }

        // the stat block
        var bx = 88, by = 20;
        G.text(ctx, meta.genus.toUpperCase() + ' POKéMON', bx, by, '#2a2a34');
        G.text(ctx, 'HT  ' + meta.ft + "'" + (meta.inch < 10 ? '0' : '') + meta.inch + '"', bx, by + 12, '#2a2a34');
        G.text(ctx, 'WT  ' + meta.lb.toFixed(1) + ' lb', bx, by + 22, '#2a2a34');
        // types, as coloured chips
        var tx2 = bx;
        for (var t = 0; t < sp.types.length; t++) {
          var tn = sp.types[t].toUpperCase();
          var tw = G.textWidth(tn) + 8;
          ctx.fillStyle = (G.TYPE_COLORS && G.TYPE_COLORS[sp.types[t]]) || '#888';
          ctx.fillRect(tx2, by + 33, tw, 11);
          ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(tx2, by + 42, tw, 2);
          G.text(ctx, tn, tx2 + 4, by + 35, G.C.white, '#1a1c2c');
          tx2 += tw + 4;
        }
        // base stat bars — the shape of a creature at a glance
        var STATS = [['HP', 'hp'], ['ATK', 'atk'], ['DEF', 'def'], ['SPC', 'spa'], ['SPE', 'spe']];
        for (var s2 = 0; s2 < STATS.length; s2++) {
          var v = sp.base[STATS[s2][1]] || 0, yy = by + 46 + s2 * 8;
          G.text(ctx, STATS[s2][0], bx, yy - 1, '#5a5a68');
          ctx.fillStyle = '#c8c4b8'; ctx.fillRect(bx + 24, yy + 1, 60, 4);
          ctx.fillStyle = v > 100 ? '#3fa757' : v > 65 ? '#d8a838' : '#c05038';
          ctx.fillRect(bx + 24, yy + 1, Math.round(60 * Math.min(1, v / 140)), 4);
        }

        // the blurb
        ctx.fillStyle = '#f8f8f4'; ctx.fillRect(4, 106, W - 8, 40);
        ctx.fillStyle = '#b8b4a8'; ctx.fillRect(4, 106, W - 8, 1);
        var lines = G.textWrap(sp.dex || '', W - 20);
        for (var l = 0; l < Math.min(3, lines.length); l++) {
          G.text(ctx, lines[l], 10, 111 + l * 11, '#2a2a34');
        }
        G.text(ctx, caught ? 'Z: cry   X: back' : 'Not yet caught.   X: back', 8, H - 10, '#5a5a68');
      }
    };
  };

  // ------------------------------------------------------------- options ----
  // One screen, three settings, and the only one that matters is the first:
  // whether your lead POKéMON walks behind you. It is off by default because
  // it is not a Gen 1 behaviour, and on for anyone who wants it because it is
  // the best thing HeartGold ever added.
  G.OptionsScene = function () {
    function opts() { return (G.player.options = G.player.options || {}); }
    var ITEMS = [
      { key: 'follower', label: 'FOLLOWER',
        vals: ['Off', 'Lead', 'Choose'],
        get: function () { return opts().follower || 'Off'; },
        set: function (v) { opts().follower = v; G.refreshFollower && G.refreshFollower(); } },
      { key: 'followPick', label: '  which one',
        vals: null,   // filled from the party
        get: function () { var i = opts().followIdx || 0; var m = G.player.party[i]; return m ? G.monName(m) : '—'; },
        set: null, only: 'Choose' },
      { key: 'motion', label: 'MOTION',
        vals: ['Full', 'Calm', 'Still'],
        get: function () { return G.motionSetting(); },
        set: function (v) { opts().motion = v; } },
      { key: 'textSpeed', label: 'TEXT SPEED',
        vals: ['Slow', 'Normal', 'Fast'],
        get: function () { return opts().textSpeed || 'Normal'; },
        set: function (v) { opts().textSpeed = v; } },
      { key: 'battleFx', label: 'BATTLE FX',
        vals: ['Full', 'Reduced'],
        get: function () { return opts().battleFx || 'Full'; },
        set: function (v) { opts().battleFx = v; } }
    ];
    function visible() {
      return ITEMS.filter(function (it) { return !it.only || opts().follower === it.only; });
    }
    return {
      opaque: true,
      sel: 0,
      update: function () {
        var list = visible();
        this.sel = G.clamp(this.sel, 0, list.length - 1);
        if (G.input.justPressed('B') || G.input.justPressed('start')) { G.audio.sfx('cancel'); G.popScene(); return; }
        if (G.input.repeat('up')) { this.sel = (this.sel + list.length - 1) % list.length; G.audio.sfx('menuMove'); }
        if (G.input.repeat('down')) { this.sel = (this.sel + 1) % list.length; G.audio.sfx('menuMove'); }
        var it = list[this.sel];
        var step = G.input.repeat('right') ? 1 : G.input.repeat('left') ? -1 : 0;
        if (!step) return;
        G.audio.sfx('menuMove');
        if (it.key === 'followPick') {
          var n = Math.max(1, G.player.party.length);
          opts().followIdx = ((opts().followIdx || 0) + step + n) % n;
          G.refreshFollower && G.refreshFollower();
          return;
        }
        var cur = it.vals.indexOf(it.get());
        it.set(it.vals[(cur + step + it.vals.length) % it.vals.length]);
      },
      draw: function (ctx) {
        ctx.fillStyle = '#2a3040'; ctx.fillRect(0, 0, W, H);
        G.text(ctx, 'OPTIONS', 10, 6, G.C.white, '#1a1c2c');
        var list = visible();
        for (var i = 0; i < list.length; i++) {
          var y = 28 + i * 20, on = i === this.sel;
          panel(ctx, 10, y - 4, W - 20, 18);
          G.text(ctx, list[i].label, 20, y + 1, on ? '#f8e878' : G.UI.text, G.UI.textShadow);
          var v = list[i].get();
          G.text(ctx, '< ' + v + ' >', W - 26 - G.textWidth('< ' + v + ' >'), y + 1,
                 on ? '#f8e878' : G.UI.text, G.UI.textShadow);
        }
        var hint = list[this.sel] && list[this.sel].key === 'follower'
          ? 'Your POKéMON walks behind you.'
          : list[this.sel] && list[this.sel].key === 'battleFx'
            ? 'Reduced trims move animations.'
            : '';
        G.text(ctx, hint, 12, H - 24, G.C.lgry);
        G.text(ctx, '<> change   X: back', 12, H - 12, G.C.lgry);
      }
    };
  };

  // ==========================================================================
  // THE HELP NOTES.
  //
  // Red/Blue teaches you by scattering the lesson through the world — the
  // school in Viridian, the Mart clerk, the guide inside every gym — and never
  // prints a control hint on the field. This game had it the other way round:
  // two lines of key bindings welded to the corner of the screen for the whole
  // playthrough, which is both uglier and less useful, because after five
  // minutes you stop reading them and they never leave.
  //
  // So the hints move in here, the field is clear, and this is offered once at
  // the start and available forever from the menu. Declining costs nothing:
  // everything it says is also said by somebody in the world.
  var TUT_PAGES = [
    {
      title: 'MOVING',
      body: ['Arrow keys or WASD to walk.',
             'Hold SHIFT to run — you will want this;',
             'KANTO is bigger than it looks.'],
      keys: [['Arrows / WASD', 'walk'], ['Shift', 'run']]
    },
    {
      title: 'TALKING',
      body: ['Face someone and press Z to speak to them.',
             'Z also reads signs, opens doors, picks things',
             'up, and confirms a choice. X goes back.'],
      keys: [['Z or Space', 'talk / confirm'], ['X or Del', 'cancel / back']]
    },
    {
      title: 'THE MENU',
      body: ['Press ENTER to open it. Everything you own',
             'and everything you have caught lives in here.'],
      keys: [['Enter', 'open the menu']]
    },
    {
      title: 'IN THE MENU',
      // Two real columns rather than space-padding, because the font is
      // proportional and padded text does not line up.
      rows: [['DEX', 'every POKéMON seen and caught'],
             ['MAP', 'the TOWN MAP, and FLY once you have it'],
             ['PARTY', 'your six — HP, moves and stats'],
             ['BAG', 'items, TMs and the balls you throw'],
             ['HELP', 'these notes, any time'],
             ['OPTION', 'text speed, MOTION and the FOLLOWER'],
             ['SAVE', 'write your progress down']]
    },
    {
      title: 'TALL GRASS',
      body: ['Wild POKéMON hide in the long grass.',
             'Walk through it to find them — and weaken',
             'one before you throw a ball, or it will break',
             'out. A sleeping POKéMON is easiest of all.']
    },
    {
      title: 'BATTLES',
      body: ['FIGHT   choose one of four moves',
             'BAG     use a potion, or throw a ball',
             'PARTY   switch to another POKéMON',
             'RUN     leave a wild battle (never a trainer)',
             '',
             'Type matters more than level. WATER beats',
             'FIRE, FIRE beats GRASS, GRASS beats WATER.']
    },
    {
      title: 'TOWNS',
      body: ['The building with the RED roof and the',
             'POKé BALL sign heals your whole party, free,',
             'every time. The BLUE one sells what you need.',
             'Healing also sets where you reappear if you',
             'lose, so drop in when you pass one.']
    },
    {
      title: 'GYMS AND BADGES',
      body: ['Each city has a GYM — look for the sign on',
             'the wall with the word on it. Beating the',
             'LEADER earns a BADGE.',
             'Eight badges open the road to the LEAGUE,',
             'and each one lets you use another HM.']
    },
    {
      title: 'HMs',
      body: ['CUT, FLY, SURF, STRENGTH and FLASH are moves',
             'that work OUTSIDE battle. Teach one to a',
             'POKéMON and walk up to the tree, water or',
             'boulder in your way.',
             'Half of KANTO is behind one of these.']
    },
    {
      title: 'SAVING',
      body: ['ENTER, then SAVE. Do it often.',
             'Your progress waits on the title screen',
             'under CONTINUE.',
             '',
             'That is everything. Press Z to begin.']
    }
  ];

  G.TutorialScene = function (onDone) {
    var page = 0;
    return {
      opaque: true,
      update: function () {
        if (G.input.justPressed('A') || G.input.justPressed('right')) {
          if (page >= TUT_PAGES.length - 1) {
            G.audio.sfx('confirm');
            G.popScene();
            if (onDone) onDone();
            return;
          }
          page++; G.audio.sfx('menuMove');
        }
        if (G.input.justPressed('left') && page > 0) { page--; G.audio.sfx('menuMove'); }
        if (G.input.justPressed('B') || G.input.justPressed('start')) {
          G.audio.sfx('cancel');
          G.popScene();
          if (onDone) onDone();
        }
      },
      draw: function (ctx) {
        var p = TUT_PAGES[page];
        p.body = p.body || [];
        ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#2a3050'; ctx.fillRect(0, 0, W, 20);
        ctx.fillStyle = '#f8e878'; ctx.fillRect(0, 20, W, 1);
        G.text(ctx, p.title, 8, 6, G.C.white, '#101018');
        G.text(ctx, (page + 1) + '/' + TUT_PAGES.length, W - 30, 6, '#c2c2d6', '#101018');

        var y = 30;
        if (p.rows) {
          for (var r = 0; r < p.rows.length; r++) {
            G.text(ctx, p.rows[r][0], 12, y, '#f8e878', G.UI.textShadow);
            G.text(ctx, p.rows[r][1], 62, y, G.UI.text, G.UI.textShadow);
            y += 12;
          }
        } else {
          for (var i = 0; i < p.body.length; i++) {
            G.text(ctx, p.body[i], 12, y, G.UI.text, G.UI.textShadow);
            y += 11;
          }
        }
        // key caps, drawn as actual keys so the binding is unmistakable
        if (p.keys) {
          y += 4;
          for (var k = 0; k < p.keys.length; k++) {
            var lbl = p.keys[k][0], what = p.keys[k][1];
            var kw = G.textWidth(lbl) + 10;
            ctx.fillStyle = '#e8e8f0'; ctx.fillRect(12, y, kw, 13);
            ctx.fillStyle = '#8a8aa4'; ctx.fillRect(12, y + 11, kw, 2);
            ctx.fillStyle = '#1a1c2c'; ctx.fillRect(12, y + 13, kw, 1);
            G.text(ctx, lbl, 17, y + 3, '#1a1c2c');
            G.text(ctx, what, 20 + kw, y + 3, '#c2c2d6', '#101018');
            y += 18;
          }
        }
        G.text(ctx, page > 0 ? '< back' : '', 10, H - 11, G.C.lgry);
        G.text(ctx, page < TUT_PAGES.length - 1 ? 'Z: next    X: skip' : 'Z: start',
          W - 96, H - 11, '#f8e878');
      }
    };
  };

  // The offer. One question, before the world loads.
  G.TutorialPrompt = function (onDone) {
    var sel = 0;
    return {
      opaque: true,
      update: function () {
        if (G.input.repeat('left') || G.input.repeat('right') ||
            G.input.repeat('up') || G.input.repeat('down')) { sel ^= 1; G.audio.sfx('menuMove'); }
        if (G.input.justPressed('B')) { sel = 1; }
        if (G.input.justPressed('A') || G.input.justPressed('B') || G.input.justPressed('start')) {
          G.audio.sfx('confirm');
          G.popScene();
          if (sel === 0) G.pushScene(G.TutorialScene(onDone));
          else if (onDone) onDone();
        }
      },
      draw: function (ctx) {
        ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 0, W, H);
        var t1 = 'First time in KANTO?';
        var t2 = 'These notes cover the controls, the menu,';
        var t3 = 'battles, gyms and everything else.';
        var t4 = 'You can read them any time from the menu.';
        G.text(ctx, t1, Math.round((W - G.textWidth(t1)) / 2), 34, G.C.white, '#101018');
        G.text(ctx, t2, Math.round((W - G.textWidth(t2)) / 2), 56, '#c2c2d6', '#101018');
        G.text(ctx, t3, Math.round((W - G.textWidth(t3)) / 2), 67, '#c2c2d6', '#101018');
        G.text(ctx, t4, Math.round((W - G.textWidth(t4)) / 2), 84, '#8a8aa4', '#101018');
        var opts = ['READ THEM', 'SKIP'];
        for (var i = 0; i < 2; i++) {
          var ox = 44 + i * 88, oy = 108;
          var on = i === sel;
          ctx.fillStyle = on ? '#f8e878' : '#3a4060';
          ctx.fillRect(ox - 4, oy - 4, 84, 20);
          ctx.fillStyle = on ? '#2a3050' : '#22263c';
          ctx.fillRect(ox - 2, oy - 2, 80, 16);
          G.text(ctx, opts[i], Math.round(ox + 38 - G.textWidth(opts[i]) / 2), oy + 2,
            on ? '#f8e878' : G.C.lgry);
        }
      }
    };
  };
})();
