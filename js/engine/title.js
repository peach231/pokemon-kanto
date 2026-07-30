// pokemon-kanto — title.js
// Title screen, OAK's welcome, the NIDORINO vs GENGAR demo, and name entry.
//
// Red/Blue's opening is three separate pieces of theatre and they do different
// jobs, so all three are here:
//
//   1. the TITLE, with the legendary birds wheeling over the ridge
//   2. the DEMO BATTLE — GENGAR and NIDORINO lunging at each other on a black
//      field, which is the first thing anyone ever saw of this game and taught
//      a generation what a POKéMON battle looked like before they played one
//   3. OAK's welcome, which is the only place the game ever explains itself
//
// The demo runs if you sit on the title without pressing anything, exactly as
// the cartridge did. Nobody waits for an attract loop on purpose; everybody
// remembers this one.

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
      // Mewtwo hangs still among the stars; Mew streaks past behind it.
      var mewImg = G.IMG.mon_mew;
      if (mewImg) {
        var mx = ((f * 1.6) % (W + 60)) - 30, my = 18 + Math.sin(f * 0.09) * 9;
        for (i = 0; i < 10; i++) {
          ctx.fillStyle = ((f >> 1) + i) % 2 ? '#f0b0c8' : '#f4f4f4';
          ctx.fillRect((mx - i * 4) | 0, (my + 10 + Math.sin((f - i * 4) * 0.2) * 2) | 0, 1, 1);
        }
        ctx.drawImage(mewImg, mx | 0, my | 0, 22, 22);
      }
      img = G.IMG.mon_mewtwo;
      if (img) {
        var rcx = mid + Math.sin(f * 0.012) * 22, ry = 46 + Math.sin(f * 0.03) * 5;
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
      img = G.IMG.mon_pidgeotto; if (img) { x = ((f * 1.1) % (W + 50)) - 25; y = 16 + Math.sin(f * 0.08) * 4; ctx.drawImage(img, x | 0, y | 0, 22, 22); }
      img = G.IMG.mon_articuno; if (img) { y = 40 + Math.sin(f * 0.05) * 7; ctx.drawImage(img, (mid - 34) | 0, y | 0, 68, 68); }
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
      img = G.IMG.mon_moltres; if (img) { y = 38 + Math.sin(f * 0.045) * 2; ctx.drawImage(img, (mid - 34) | 0, y | 0, 68, 68); }
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
      img = G.IMG.mon_pidgey; if (img) { x = ((f * 1.3) % (W + 40)) - 20; y = 28 + Math.sin(f * 0.1) * 6; ctx.drawImage(img, x | 0, y | 0, 22, 22); }
      img = G.IMG.mon_rattata; if (img) { x = 40 + ((f * 0.5) % 60); y = 100 - Math.abs(Math.sin(f * 0.15)) * 7; ctx.drawImage(img, x | 0, y | 0, 30, 30); }
      img = G.IMG.mon_pikachu; if (img) { x = 160 - ((f * 0.4) % 52); y = 104 - Math.abs(Math.sin(f * 0.13 + 1)) * 6; ctx.drawImage(img, x | 0, y | 0, 28, 28); }
    } else { // 'dawn' — sunrise + the three starters
      ctx.fillStyle = '#4a2a6a'; ctx.fillRect(0, 0, W, 20);
      ctx.fillStyle = '#a84a6a'; ctx.fillRect(0, 20, W, 18);
      ctx.fillStyle = '#f0983a'; ctx.fillRect(0, 38, W, 16);
      ctx.fillStyle = '#f8cc70'; ctx.fillRect(0, 54, W, 26);
      ctx.fillStyle = 'rgba(248,240,180,0.95)'; fillCircle(ctx, mid, 80, 22);
      ctx.fillStyle = '#3c7e4c'; ctx.fillRect(0, 84, W, H - 84);
      ctx.fillStyle = '#2f6b3c'; ctx.fillRect(0, 84, W, 3);
      var starters = ['mon_bulbasaur', 'mon_charmander', 'mon_squirtle'];
      for (i = 0; i < 3; i++) { img = G.IMG[starters[i]]; if (!img) continue; x = 50 + i * 58; y = 54 + Math.sin(f * 0.08 + i * 1.1) * 3; ctx.drawImage(img, x | 0, y | 0, 46, 46); }
      for (i = 0; i < 14; i++) { if (((f >> 3) + i) % 4 === 0) { x = (i * 53 + f) % W; y = (i * 31 + (f >> 1)) % 80; ctx.fillStyle = '#f8e878'; ctx.fillRect(x, y, 1, 1); } }
    }
  }

  // OAK's welcome: one scrolling scene per line. Owns both the animated
  // backdrop and the text so they advance together — the scene slides left and
  // the next slides in whenever the dialogue changes.
  //
  // The speech is written rather than transcribed, but it does the same three
  // jobs Red/Blue's did, in the same order: this world is full of creatures,
  // some of them are far beyond you, and you are going out into it anyway.
  G.IntroCinematic = function (onDone) {
    var slides = [
      { bg: 'meadow', text: "Hello there! I am PROFESSOR OAK. People affectionately call me the POKéMON PROFESSOR, which I have never once discouraged." },
      { bg: 'space', text: 'This world is inhabited by creatures we call POKéMON. We study them, we live alongside them, and after fifty years I would not claim to understand them.' },
      { bg: 'ocean', text: 'A few of them are seen once in a generation, and then not again. People build towns around the places they were last sighted.' },
      { bg: 'land', text: 'One or two of them are not rare. They are singular. There is exactly one, it has been alive a very long time, and it is somewhere in KANTO right now.' },
      { bg: 'dawn', text: 'And today, one of them is going to belong to you — which is the part I have never been able to explain to anybody. First, though: what is your name?' }
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
    var idle = 0;        // frames since the last input, for the attract loop
    return {
      opaque: true,
      enter: function () {
        logo = makeLogo();
        G.audio.playMusic('title');
      },
      update: function () {
        if (phase === 'press') {
          idle++;
          if (G.input.justPressed('start') || G.input.justPressed('A')) {
            G.audio.sfx('confirm');
            idle = 0;
            phase = 'menu';
            sel = 0; // first item: CONTINUE if a save exists, else NEW GAME
            return;
          }
          // Sit on the title long enough and the cartridge shows you a battle.
          if (idle > 60 * 12 && G.DemoBattleScene) {
            idle = 0;
            G.pushScene(G.DemoBattleScene());
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
                'A bright Kanto morning, ' + (G.player.name || 'friend') + '! PROF. OAK is expecting you at his lab, just down the road.',
                '(Arrows to move, Z to talk and confirm, X to cancel, Enter for the menu. M mutes.)'
              ]));
            };
            var toName = function () {
              if (G.NameEntryScene) G.replaceScene(G.NameEntryScene(startGame));
              else startGame();
            };
            var toChar = function () {
              if (G.CharSelectScene) G.replaceScene(G.CharSelectScene(toName));
              else toName();
            };
            // OAK's welcome — a scrolling cinematic, one animated scene per
            // line — then you pick a trainer, then you are asked your name.
            // Name LAST, because being asked it once you can see who you are
            // lands differently to being asked it into an empty screen.
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
        // A low ridge, so the sky has a floor and the birds are over something
        // rather than floating in a colour field.
        ctx.fillStyle = '#221a38';
        var ridge = [-10, 30, 74, 118, 160, 206, 250];
        for (var rr = 0; rr < ridge.length; rr++) {
          ctx.beginPath();
          ctx.moveTo(ridge[rr] - 34, 126);
          ctx.lineTo(ridge[rr], 126 - (16 + ((rr * 7) % 11)));
          ctx.lineTo(ridge[rr] + 34, 126);
          ctx.closePath(); ctx.fill();
        }
        // stars
        for (var i = 0; i < 24; i++) {
          var sx = (i * 53 + 17) % W, sy = (i * 37 + 11) % 95;
          ctx.fillStyle = (i + (G.frame >> 5)) % 5 === 0 ? '#f8e878' : '#8a8aa4';
          ctx.fillRect(sx, sy, 1, 1);
        }
        // The logo owns the top third and nothing is allowed into it. The
        // previous composition flew ZAPDOS straight across the wordmark, which
        // is the kind of thing that reads as a bug even to someone who could
        // not say why.
        if (logo) {
          ctx.imageSmoothingEnabled = false;
          var lw = logo.width * 3, lh = logo.height * 3;
          ctx.drawImage(logo, Math.round((W - lw) / 2), 14, lw, lh);
        }
        var sub = 'A Kanto region adventure';
        G.text(ctx, sub, Math.round((W - G.textWidth(sub)) / 2), 52, '#c2c2d6', '#1a1c2c');

        // The three birds, and only the three birds. Nobody in KANTO has seen
        // all of them in one place; MOLTRES takes the ridge because it is the
        // one that ends up standing over the road to the LEAGUE.
        var zap = G.IMG.mon_zapdos, mol = G.IMG.mon_moltres, art = G.IMG.mon_articuno;
        // One baseline, one size, evenly spaced. Three creatures at three
        // different scales reads as a collage; three at one scale reads as a
        // decision.
        var wheel = Math.sin(G.frame * 0.045) * 3;
        if (art) ctx.drawImage(art, 6, Math.round(70 + wheel), 46, 46);
        if (mol) ctx.drawImage(mol, 97, Math.round(70 - wheel * 0.6), 46, 46);
        if (zap) ctx.drawImage(zap, 188, Math.round(70 - wheel), 46, 46);

        if (phase === 'press') {
          if ((G.frame >> 5) % 2 === 0) {
            G.text(ctx, 'PRESS ENTER', 88, 142, G.C.white, '#1a1c2c');
          }
        } else {
          var items = this._items();
          G.nineSlice(ctx, G.IMG.ui_box, 76, 126, 88, items.length * 15 + 10, 4);
          for (var m = 0; m < items.length; m++) {
            G.text(ctx, items[m], 96, 132 + m * 15, G.UI.text, G.UI.textShadow);
            if (m === sel) ctx.drawImage(G.IMG.ui_cursor, 85, 133 + m * 15);
          }
        }
      }
    };
  };

  // ==========================================================================
  // THE DEMO BATTLE — GENGAR and NIDORINO, on a black field, lunging.
  //
  // This is the first thing anybody ever saw of Red/Blue: leave the title
  // alone for a few seconds and the cartridge shows you a fight. It taught a
  // generation what a POKéMON battle looked like before they had played one,
  // and it did it with no HUD, no text and no explanation — two silhouettes
  // rushing each other on an empty screen.
  //
  // Reproduced here beat for beat: GENGAR crouches and springs, NIDORINO
  // lowers its horn and charges, they meet in the middle, and it loops. Any
  // key press drops you back to the title, which is also what the cartridge
  // did — the demo is not content, it is an invitation.
  // ==========================================================================
  G.DemoBattleScene = function () {
    var t = 0;
    var DUR = 60 * 11;          // one full pass, then back to the title
    return {
      opaque: true,
      enter: function () { G.audio.playMusic('battle'); },
      update: function () {
        t++;
        if (t > DUR || G.input.justPressed('A') || G.input.justPressed('B') ||
            G.input.justPressed('start')) {
          G.audio.playMusic('title');
          G.popScene();
        }
      },
      draw: function (ctx) {
        ctx.imageSmoothingEnabled = false;
        // Black field with a single ground line, as the original had.
        ctx.fillStyle = '#101018'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#1c1c2e'; ctx.fillRect(0, 108, W, H - 108);
        ctx.fillStyle = '#2a2a44'; ctx.fillRect(0, 108, W, 1);

        // The whole thing is one repeating six-second beat: settle, GENGAR
        // springs, settle, NIDORINO charges, they collide, reset.
        var beat = t % 360;
        var gx = 34, nx = 150, lunge = 0, who = 0;
        if (beat > 60 && beat < 130) { who = 1; lunge = Math.sin((beat - 60) / 70 * Math.PI); }
        else if (beat > 170 && beat < 240) { who = 2; lunge = Math.sin((beat - 170) / 70 * Math.PI); }
        else if (beat > 280 && beat < 330) { who = 3; lunge = Math.sin((beat - 280) / 50 * Math.PI); }

        if (who === 1) gx += lunge * 46;
        if (who === 2) nx -= lunge * 46;
        if (who === 3) { gx += lunge * 30; nx -= lunge * 30; }

        var bob = Math.sin(t * 0.08) * 2;
        var gen = G.IMG.mon_gengar, nid = G.IMG.mon_nidorino;
        if (gen) ctx.drawImage(gen, gx | 0, (52 + bob) | 0, 60, 60);
        if (nid) {
          // NIDORINO faces left; the source art faces right, so it is mirrored.
          ctx.save();
          ctx.translate((nx + 60) | 0, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(nid, 0, (52 - bob) | 0, 60, 60);
          ctx.restore();
        }

        // The impact: a hard white flash and a scatter of sparks, no easing.
        // A soft glow would read as a modern effect; this should read as a
        // Game Boy deciding to turn some pixels on.
        if (who === 3 && lunge > 0.75) {
          ctx.fillStyle = 'rgba(248,248,248,' + ((lunge - 0.75) * 3).toFixed(2) + ')';
          ctx.fillRect(0, 0, W, H);
          for (var i = 0; i < 14; i++) {
            var a = i * 0.45 + t * 0.1;
            ctx.fillStyle = i % 2 ? '#f8e878' : '#f4f4f4';
            ctx.fillRect((120 + Math.cos(a) * (12 + i * 2)) | 0,
                         (82 + Math.sin(a) * (10 + i * 2)) | 0, 2, 2);
          }
        }

        if ((t >> 4) % 2 === 0) {
          G.text(ctx, 'PRESS ANY KEY', 78, 140, '#c2c2d6', '#101018');
        }
      }
    };
  };

  // ==========================================================================
  // NAME ENTRY. Gen 1's keyboard: a grid of letters, a cursor, and a hard
  // seven-character limit that shaped every nickname anyone gave anything for
  // twenty years. Kept at seven for exactly that reason.
  //
  // The preset names are offered the way the cartridge offered them — not as a
  // shortcut, but because being handed a list of names for yourself is a
  // strange and specific thing that this series has always done.
  // ==========================================================================
  G.NameEntryScene = function (onDone) {
    var MAX = 7;
    var ROWS = [
      'ABCDEFGHI',
      'JKLMNOPQR',
      'STUVWXYZ ',
      'abcdefghi',
      'jklmnopqr',
      'stuvwxyz.'
    ];
    var PRESETS = ['RED', 'ASH', 'JACK', 'BLUE', 'SATOSHI'];
    var name = '';
    var cx = 0, cy = 0;
    var mode = 'grid';   // grid | presets
    var psel = 0;

    function commit() {
      var final = name.trim() || PRESETS[0];
      G.player.name = final;
      G.audio.sfx('confirm');
      G.popScene();
      if (onDone) onDone();
    }

    return {
      opaque: true,
      enter: function () { G.audio.playMusic('title'); },
      update: function () {
        if (mode === 'presets') {
          if (G.input.repeat('up')) { psel = (psel + PRESETS.length - 1) % PRESETS.length; G.audio.sfx('menuMove'); }
          if (G.input.repeat('down')) { psel = (psel + 1) % PRESETS.length; G.audio.sfx('menuMove'); }
          if (G.input.justPressed('A')) { name = PRESETS[psel]; commit(); return; }
          if (G.input.justPressed('B')) { mode = 'grid'; G.audio.sfx('cancel'); }
          return;
        }
        if (G.input.repeat('left')) { cx = (cx + 8) % 9; G.audio.sfx('menuMove'); }
        if (G.input.repeat('right')) { cx = (cx + 1) % 9; G.audio.sfx('menuMove'); }
        if (G.input.repeat('up')) { cy = (cy + ROWS.length - 1) % ROWS.length; G.audio.sfx('menuMove'); }
        if (G.input.repeat('down')) { cy = (cy + 1) % ROWS.length; G.audio.sfx('menuMove'); }
        if (G.input.justPressed('A')) {
          var ch = ROWS[cy][cx];
          if (name.length < MAX) { name += ch; G.audio.sfx('menuMove'); }
          else G.audio.sfx('cancel');
        }
        if (G.input.justPressed('B')) {
          if (name.length) { name = name.slice(0, -1); G.audio.sfx('cancel'); }
          else { mode = 'presets'; G.audio.sfx('menuMove'); }
        }
        if (G.input.justPressed('start')) commit();
      },
      draw: function (ctx) {
        ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#2a3050'; ctx.fillRect(0, 0, W, 30);
        G.text(ctx, 'YOUR NAME?', 10, 8, G.C.white, '#101018');

        // the name so far, on a row of underscores
        var bx = 96;
        for (var s = 0; s < MAX; s++) {
          ctx.fillStyle = '#4a5480';
          ctx.fillRect(bx + s * 16, 22, 12, 1);
          if (s < name.length) G.text(ctx, name[s], bx + s * 16 + 3, 11, '#f8e878', '#101018');
        }

        if (mode === 'presets') {
          G.nineSlice(ctx, G.IMG.ui_box, 70, 40, 100, PRESETS.length * 15 + 12, 4);
          for (var p = 0; p < PRESETS.length; p++) {
            G.text(ctx, PRESETS[p], 92, 47 + p * 15, G.UI.text, G.UI.textShadow);
            if (p === psel) ctx.drawImage(G.IMG.ui_cursor, 80, 48 + p * 15);
          }
          G.text(ctx, 'Z: choose   X: back to the keyboard', 22, H - 12, G.C.lgry);
          return;
        }

        // the keyboard
        var ox = 40, oy = 42;
        for (var r = 0; r < ROWS.length; r++) {
          for (var c = 0; c < 9; c++) {
            var here = (r === cy && c === cx);
            var gx = ox + c * 18, gy = oy + r * 15;
            if (here) {
              ctx.fillStyle = '#f8e878';
              ctx.fillRect(gx - 3, gy - 3, 15, 14);
            }
            G.text(ctx, ROWS[r][c], gx, gy, here ? '#1a1c2c' : G.C.white, here ? null : '#101018');
          }
        }
        G.text(ctx, 'Z: type   X: delete   Enter: done', 30, H - 12, G.C.lgry);
      }
    };
  };
})();
