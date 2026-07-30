// Pokéram — title.js
// Title screen: chunky pixel logo, the Starwyrm overhead, New Game / Continue.

(function () {
  var W = 240, H = 160;

  function makeLogo() {
    // render at 1x, blit at 3x for a chunky pixel logo
    var txt = 'POKÉMON';
    var w = G.textWidth(txt);
    var c = G.gfx.makeCanvas(w + 2, 12);
    var ctx = c.getContext('2d');
    G.text(ctx, txt, 1, 1, '#f8e878');
    G.text(ctx, txt, 0, 0, '#f4f4f4');
    return c;
  }

  function fillCircle(ctx, cx, cy, r) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }

  function drawCloud(ctx, x, y) {
    ctx.fillStyle = 'rgba(248,252,255,0.85)';
    ctx.fillRect(x | 0, y, 24, 5); ctx.fillRect((x + 5) | 0, y - 3, 14, 4); ctx.fillRect((x + 3) | 0, y + 4, 20, 3);
  }

  // One full-screen, animated scene per intro line. Each fills the whole 240x160
  // so the horizontal scroll transition never shows a gap. Animation is driven
  // purely from `f` (G.frame) so it works even while a scene is mid-scroll.
  function drawIntroBg(ctx, name, f) {
    var mid = W >> 1, img, i, x, y;
    if (name === 'space') {
      ctx.fillStyle = '#0a0820'; ctx.fillRect(0, 0, W, 58);
      ctx.fillStyle = '#161038'; ctx.fillRect(0, 58, W, 52);
      ctx.fillStyle = '#241a4e'; ctx.fillRect(0, 110, W, 50);
      ctx.fillStyle = '#f0e8c8'; fillCircle(ctx, 44, 30, 11);
      ctx.fillStyle = '#161038'; fillCircle(ctx, 38, 26, 10); // crescent cut
      for (i = 0; i < 90; i++) {
        x = (i * 47 + 11) % W; y = (i * 71 + 5) % 150;
        var big = i % 13 === 0, on = (((f >> 4) + i) % 6) !== 0;
        ctx.fillStyle = on ? (big ? '#f8e878' : '#c8c8e8') : '#33335a';
        ctx.fillRect(x, y, big ? 2 : 1, big ? 2 : 1);
      }
      img = G.IMG.mon_rayquaza;
      if (img) {
        var rcx = mid + Math.sin(f * 0.02) * 40, ry = 40 + Math.sin(f * 0.035) * 10;
        for (i = 0; i < 8; i++) { ctx.fillStyle = ((f >> 2) + i) % 2 ? '#a0e0c0' : '#f4f4f4'; ctx.fillRect((rcx - 8 - i * 3) | 0, (ry + 34 + Math.sin((f - i * 5) * 0.12) * 3) | 0, 1, 1); }
        ctx.drawImage(img, (rcx - 32) | 0, ry | 0, 64, 64);
      }
    } else if (name === 'ocean') {
      ctx.fillStyle = '#7ec8f0'; ctx.fillRect(0, 0, W, 52);
      ctx.fillStyle = '#a8dcf8'; ctx.fillRect(0, 44, W, 10);
      ctx.fillStyle = 'rgba(248,236,160,0.85)'; fillCircle(ctx, 200, 22, 12);
      drawCloud(ctx, ((f * 0.2) % (W + 64)) - 32, 14);
      drawCloud(ctx, ((f * 0.13 + 130) % (W + 64)) - 32, 30);
      ctx.fillStyle = '#2a70d0'; ctx.fillRect(0, 52, W, 60);
      ctx.fillStyle = '#1a4a9a'; ctx.fillRect(0, 112, W, H - 112);
      ctx.fillStyle = '#7ec0f0';
      for (i = 0; i < 6; i++) { y = 58 + i * 10; var o = (((f >> 1) + i * 6) % 16); for (x = -16 + o; x < W; x += 16) ctx.fillRect(x, y, 8, 1); }
      img = G.IMG.mon_wingull; if (img) { x = ((f * 1.1) % (W + 50)) - 25; y = 16 + Math.sin(f * 0.08) * 4; ctx.drawImage(img, x | 0, y | 0, 22, 22); }
      img = G.IMG.mon_kyogre; if (img) { y = 40 + Math.sin(f * 0.05) * 7; ctx.drawImage(img, (mid - 34) | 0, y | 0, 68, 68); }
      for (i = 0; i < 12; i++) { y = 112 - ((f * 0.8 + i * 13) % 62); x = mid - 22 + i * 4 + Math.sin((f + i * 10) * 0.1) * 2; ctx.fillStyle = '#bfe8f0'; ctx.fillRect(x | 0, y | 0, 1 + (i % 2), 1 + (i % 2)); }
    } else if (name === 'land') {
      ctx.fillStyle = '#3a2244'; ctx.fillRect(0, 0, W, 26);
      ctx.fillStyle = '#7a2f44'; ctx.fillRect(0, 26, W, 20);
      ctx.fillStyle = '#c85a3a'; ctx.fillRect(0, 46, W, 14);
      ctx.fillStyle = '#f0983a'; ctx.fillRect(0, 60, W, 8);
      ctx.fillStyle = 'rgba(248,204,112,0.9)'; fillCircle(ctx, 204, 60, 14);
      ctx.fillStyle = '#2a1c30';
      var peaks = [-6, 44, 96, 150, 208, 246];
      for (i = 0; i < peaks.length; i++) { var pk = peaks[i], ph = 30 + ((i * 11) % 20); ctx.beginPath(); ctx.moveTo(pk - 42, 88); ctx.lineTo(pk, 88 - ph); ctx.lineTo(pk + 42, 88); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#2e2036'; ctx.fillRect(0, 86, W, H - 86);
      var lg = (0.4 + 0.4 * (0.5 + 0.5 * Math.sin(f * 0.08))).toFixed(2);
      ctx.fillStyle = 'rgba(240,120,50,' + lg + ')';
      for (x = 0; x < W; x += 24) { ctx.fillRect(x + ((f >> 2) % 12), 122, 10, 2); ctx.fillRect(x + 6, 140, 8, 2); }
      img = G.IMG.mon_groudon; if (img) { y = 38 + Math.sin(f * 0.045) * 2; ctx.drawImage(img, (mid - 34) | 0, y | 0, 68, 68); }
      for (i = 0; i < 16; i++) { y = 132 - ((f * 0.6 + i * 17) % 92); x = 28 + i * 13 + Math.sin((f + i * 20) * 0.08) * 4; ctx.fillStyle = ((f >> 3) + i) % 2 ? '#f09838' : '#d04a48'; ctx.fillRect(x | 0, y | 0, 1, 1); }
    } else if (name === 'meadow') {
      ctx.fillStyle = '#8fd0f4'; ctx.fillRect(0, 0, W, 86);
      ctx.fillStyle = '#b8e4f8'; ctx.fillRect(0, 74, W, 12);
      ctx.fillStyle = 'rgba(248,236,160,0.85)'; fillCircle(ctx, 38, 26, 12);
      drawCloud(ctx, ((f * 0.15) % (W + 64)) - 32, 18);
      drawCloud(ctx, ((f * 0.1 + 150) % (W + 64)) - 32, 40);
      ctx.fillStyle = '#3fa757'; ctx.fillRect(0, 86, W, H - 86);
      ctx.fillStyle = '#2f8f47'; for (i = 0; i < 70; i++) { x = (i * 37 + (f >> 3)) % W; y = 92 + (i * 53) % 62; ctx.fillRect(x, y, 1, 2); }
      for (i = 0; i < 10; i++) { x = (i * 47 + 20) % W; y = 104 + (i * 29) % 46; ctx.fillStyle = ['#f8e878', '#f08060', '#f4f4f4'][i % 3]; ctx.fillRect(x, y, 2, 2); }
      img = G.IMG.mon_taillow; if (img) { x = ((f * 1.3) % (W + 40)) - 20; y = 28 + Math.sin(f * 0.1) * 6; ctx.drawImage(img, x | 0, y | 0, 22, 22); }
      img = G.IMG.mon_zigzagoon; if (img) { x = 40 + ((f * 0.5) % 60); y = 100 - Math.abs(Math.sin(f * 0.15)) * 7; ctx.drawImage(img, x | 0, y | 0, 30, 30); }
      img = G.IMG.mon_poochyena; if (img) { x = 160 - ((f * 0.4) % 52); y = 104 - Math.abs(Math.sin(f * 0.13 + 1)) * 6; ctx.drawImage(img, x | 0, y | 0, 28, 28); }
    } else { // 'dawn' — sunrise + the three starters
      ctx.fillStyle = '#4a2a6a'; ctx.fillRect(0, 0, W, 20);
      ctx.fillStyle = '#a84a6a'; ctx.fillRect(0, 20, W, 18);
      ctx.fillStyle = '#f0983a'; ctx.fillRect(0, 38, W, 16);
      ctx.fillStyle = '#f8cc70'; ctx.fillRect(0, 54, W, 26);
      ctx.fillStyle = 'rgba(248,240,180,0.95)'; fillCircle(ctx, mid, 80, 22);
      ctx.fillStyle = '#3c7e4c'; ctx.fillRect(0, 84, W, H - 84);
      ctx.fillStyle = '#2f6b3c'; ctx.fillRect(0, 84, W, 3);
      var starters = ['mon_treecko', 'mon_torchic', 'mon_mudkip'];
      for (i = 0; i < 3; i++) { img = G.IMG[starters[i]]; if (!img) continue; x = 50 + i * 58; y = 54 + Math.sin(f * 0.08 + i * 1.1) * 3; ctx.drawImage(img, x | 0, y | 0, 46, 46); }
      for (i = 0; i < 14; i++) { if (((f >> 3) + i) % 4 === 0) { x = (i * 53 + f) % W; y = (i * 31 + (f >> 1)) % 80; ctx.fillStyle = '#f8e878'; ctx.fillRect(x, y, 1, 1); } }
    }
  }

  // Prof. Birch's opening cinematic: one scrolling scene per line of narration.
  // Owns both the animated backdrop and the text so they advance together — the
  // scene slides left and the next slides in whenever the dialogue changes.
  G.IntroCinematic = function (onDone) {
    var slides = [
      { bg: 'space', text: "Welcome! I'm Professor Birch. Our world is watched over by wonders — like the great dragon that weaves between the stars." },
      { bg: 'ocean', text: 'Far below the waves slumbers a titan whose stirring once swelled the endless oceans.' },
      { bg: 'land', text: 'And beneath the mountains rests another, whose waking heaved up the very land.' },
      { bg: 'meadow', text: "But most Pokémon you'll meet are friends in the tall grass — partners waiting to walk beside you." },
      { bg: 'dawn', text: 'And now YOUR story begins, at the break of a new dawn. But first... tell me a little about yourself!' }
    ];
    var idx = 0, phase = 'type', shown = 0, hold = 0, scrollT = 0;
    var SCROLL = 22, AUTO = 140;
    function cur() { return slides[idx].text; }
    return {
      opaque: true,
      enter: function () { G.audio.playMusic('title'); },
      update: function () {
        if (phase === 'type') {
          shown += 2;
          if (G.input.justPressed('A') || G.input.justPressed('B')) shown = cur().length;
          if (shown >= cur().length) { shown = cur().length; phase = 'hold'; hold = 0; }
          return;
        }
        if (phase === 'hold') {
          hold++;
          if (G.input.justPressed('A') || G.input.justPressed('B') || hold > AUTO) {
            if (idx >= slides.length - 1) { G.popScene(); if (onDone) onDone(); return; }
            phase = 'scroll'; scrollT = 0; G.audio.sfx('menuMove');
          }
          return;
        }
        // scroll
        scrollT++;
        if (scrollT >= SCROLL) { idx++; phase = 'type'; shown = 0; }
      },
      draw: function (ctx) {
        var f = G.frame;
        ctx.imageSmoothingEnabled = false;
        if (phase === 'scroll') {
          var dx = Math.round((scrollT / SCROLL) * W);
          ctx.save(); ctx.translate(-dx, 0); drawIntroBg(ctx, slides[idx].bg, f); ctx.restore();
          ctx.save(); ctx.translate(W - dx, 0); drawIntroBg(ctx, slides[idx + 1].bg, f); ctx.restore();
          return;
        }
        drawIntroBg(ctx, slides[idx].bg, f);
        // narration box
        G.nineSlice(ctx, G.IMG.ui_box_dark, 0, 116, W, 44, 4);
        var lines = G.textWrap(cur().slice(0, shown), 216);
        for (var i = 0; i < Math.min(2, lines.length); i++) G.text(ctx, lines[i], 12, 124 + i * 14, G.C.white, '#3a3a4a');
        if (phase === 'hold' && (f >> 3) % 2 === 0) { // blinking advance caret
          ctx.fillStyle = '#f4f4f4'; ctx.fillRect(226, 150, 5, 1); ctx.fillRect(227, 151, 3, 1); ctx.fillRect(228, 152, 1, 1);
        }
      }
    };
  };

  G.TitleScene = function () {
    var logo = null;
    var phase = 'press'; // press | menu
    var sel = 0;
    return {
      opaque: true,
      enter: function () {
        logo = makeLogo();
        G.audio.playMusic('title');
      },
      update: function () {
        if (phase === 'press') {
          if (G.input.justPressed('start') || G.input.justPressed('A')) {
            G.audio.sfx('confirm');
            phase = 'menu';
            sel = 0; // first item: CONTINUE if a save exists, else NEW GAME
          }
          return;
        }
        var items = this._items();
        if (sel >= items.length) sel = 0;
        if (G.input.repeat('up')) { sel = (sel + items.length - 1) % items.length; G.audio.sfx('menuMove'); }
        if (G.input.repeat('down')) { sel = (sel + 1) % items.length; G.audio.sfx('menuMove'); }
        if (G.input.justPressed('B')) { phase = 'press'; G.audio.sfx('cancel'); return; }
        if (G.input.justPressed('A') || G.input.justPressed('start')) {
          G.audio.sfx('confirm');
          var pick = items[sel];
          if (pick === 'CONTINUE') {
            if (G.loadGame()) {
              G.replaceScene(G.overworldScene);
            } else {
              G.pushScene(G.Textbox('The save data could not be read...'));
            }
          } else if (pick === 'NEW GAME') {
            G.newGame();
            var startGame = function () {
              G.world.loadMap('playerhome', 4, 4, 'down');
              G.replaceScene(G.overworldScene);
              G.pushScene(G.Textbox([
                'A bright Hoenn morning, ' + (G.player.name || 'friend') + '! Prof. Birch is expecting you at his lab in Littleroot Town!',
                '(Arrows to move, Z to talk and confirm, X to cancel, Enter for the menu. M mutes.)'
              ]));
            };
            var toChar = function () {
              if (G.CharSelectScene) G.replaceScene(G.CharSelectScene(startGame));
              else startGame();
            };
            // Prof. Birch's welcome — a scrolling cinematic, one animated scene
            // per line — then you choose your trainer and name.
            G.replaceScene(G.IntroCinematic(toChar));
          }
        }
      },
      _items: function () {
        return G.hasSave() ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME'];
      },
      draw: function (ctx) {
        // night-sky gradient bands
        ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 0, W, 60);
        ctx.fillStyle = '#2a1a40'; ctx.fillRect(0, 60, W, 40);
        ctx.fillStyle = '#4a2a6a'; ctx.fillRect(0, 100, W, 24);
        ctx.fillStyle = '#1f6e44'; ctx.fillRect(0, 124, W, H - 124);
        // stars
        for (var i = 0; i < 24; i++) {
          var sx = (i * 53 + 17) % W, sy = (i * 37 + 11) % 95;
          ctx.fillStyle = (i + (G.frame >> 5)) % 5 === 0 ? '#f8e878' : '#8a8aa4';
          ctx.fillRect(sx, sy, 1, 1);
        }
        // the weather trio: Rayquaza in the sky, Groudon & Kyogre at the horizon
        var ray = G.IMG.mon_rayquaza, gro = G.IMG.mon_groudon, kyo = G.IMG.mon_kyogre;
        if (ray) ctx.drawImage(ray, 150, 6);
        if (gro) ctx.drawImage(gro, 2, 78, 52, 52);
        if (kyo) ctx.drawImage(kyo, 186, 78, 52, 52);
        // starters on the ridge, between the two giants
        var starters = ['mon_treecko', 'mon_torchic', 'mon_mudkip'];
        for (var s = 0; s < starters.length; s++) {
          var img = G.IMG[starters[s]];
          if (img) ctx.drawImage(img, 62 + s * 42, 84, 40, 40);
        }
        // logo at 3x
        if (logo) {
          ctx.imageSmoothingEnabled = false;
          var lw = logo.width * 3, lh = logo.height * 3;
          ctx.drawImage(logo, (W - lw) / 2, 30, lw, lh);
        }
        G.text(ctx, 'A Hoenn region adventure', 68, 68, '#c2c2d6', '#1a1c2c');

        if (phase === 'press') {
          if ((G.frame >> 5) % 2 === 0) {
            G.text(ctx, 'PRESS ENTER', 88, 138, G.C.white, '#1a1c2c');
          }
        } else {
          var items = this._items();
          G.nineSlice(ctx, G.IMG.ui_box, 76, 128, 88, items.length * 15 + 10, 4);
          for (var m = 0; m < items.length; m++) {
            G.text(ctx, items[m], 96, 134 + m * 15, G.UI.text, G.UI.textShadow);
            if (m === sel) ctx.drawImage(G.IMG.ui_cursor, 85, 135 + m * 15);
          }
        }
      }
    };
  };
})();
