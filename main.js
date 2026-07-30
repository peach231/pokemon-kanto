// Pokéram — main.js
// Boot + the game loop: rAF with a fixed-timestep accumulator. Logic runs at
// exactly 60 steps/sec; rendering happens once per animation frame.

(function () {
  var STEP_MS = 1000 / 60;

  G.frame = 0; // global frame counter (drives tile animation, cursors, etc.)

  var STARTERS = ['treecko', 'torchic', 'mudkip'];

  function boot() {
    G.gfx.init();
    G.input.init();
    G.gfx.decodeAll();         // world/UI art (synchronous)
    if (G.audio.init) G.audio.init();

    // tiny mute button, top-right (synced with the M key)
    var muteBtn = document.getElementById('mutebtn');
    function syncMuteBtn() {
      if (muteBtn) muteBtn.innerHTML = G.audio.muted ? '&#128263;' : '&#128266;';
    }
    G.syncMuteBtn = syncMuteBtn;
    if (muteBtn) {
      muteBtn.addEventListener('click', function () {
        G.audio.unlock();
        G.audio.toggleMute();
        syncMuteBtn();
        muteBtn.blur(); // give the keyboard back to the game
      });
    }

    // Creature sprites load asynchronously (real image files). Paint a loading
    // frame, then start the game once every front/back has settled.
    var loadInfo = { done: 0, total: 1 };
    drawLoading(loadInfo);
    G.gfx.loadMonSprites(
      function (done, total) { loadInfo.done = done; loadInfo.total = total; drawLoading(loadInfo); },
      startGame
    );
    // Optional real trainer/player sprites — non-blocking; baked art is the
    // fallback, so this is a no-op until a source is configured (sprites_config).
    if (G.gfx.loadTrainerSprites) G.gfx.loadTrainerSprites();
    // Optional real overworld walking sprites for NPC classes (sliced from sheets).
    if (G.gfx.loadOverworldSprites) G.gfx.loadOverworldSprites();
    // Default player character (overridden by the new-game select or a save).
    if (G.applyCharacter) G.applyCharacter((G.player && G.player.charKey) || 'brendan');
  }

  function drawLoading(info) {
    var ctx = G.ctx;
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, G.SCREEN_W, G.SCREEN_H);
    G.text(ctx, 'LOADING…', 92, 70, G.C.white, G.C.ink);
    var pct = info.total ? Math.round(100 * info.done / info.total) : 0;
    var bw = 120, bx = (G.SCREEN_W - bw) / 2, by = 86;
    ctx.fillStyle = G.C.dgry || '#333';
    ctx.fillRect(bx - 1, by - 1, bw + 2, 6);
    ctx.fillStyle = G.C.leaf2 || '#5ac54f';
    ctx.fillRect(bx, by, Math.round(bw * pct / 100), 4);
  }

  function startGame() {
    if (location.hash === '#debug' && G.debug && G.debug.init) G.debug.init();

    var hashIs = function (tag) { return location.hash.indexOf('#' + tag) === 0; };
    var mapMatch = location.hash.match(/#map=(\w+),(\d+),(\d+)/);
    if (mapMatch) {
      G.player.party = [G.makeMon('treecko', 20)];
      G.flags.starter = 'treecko';
      var chId = (location.hash.match(/char=(\w+)/) || [])[1];
      if (chId && G.applyCharacter) { G.player.charKey = chId; G.applyCharacter(chId); }
      G.world.loadMap(mapMatch[1], parseInt(mapMatch[2], 10), parseInt(mapMatch[3], 10), (location.hash.match(/dir=(\w+)/) || [])[1] || 'down');
      G.pushScene(G.overworldScene);
    } else if (hashIs('gallery') && G.debug && G.debug.GalleryScene) {
      G.pushScene(G.debug.GalleryScene());
    } else if (hashIs('sheet') && G.debug && G.debug.SheetScene) {
      G.pushScene(G.debug.SheetScene());
    } else if (hashIs('regionmap') && G.RegionMapScene) {
      G.player.party = [G.makeMon('treecko', 5)];
      ['hearthvale', 'route1', 'cobblemarch', 'route2', 'verdantforest', 'brinehollow', 'route3', 'hollowdeep1', 'coilgate', 'route4', 'aurelune', 'route5', 'petalburg', 'route6', 'fortree', 'route7', 'mossdeep', 'route8', 'sootopolis', 'summitpath', 'crownsummit'].forEach(function (m) { G.player.visited[m] = 1; });
      G.world.loadMap('hearthvale', 5, 6, 'down');
      G.pushScene(G.overworldScene);
      G.pushScene(G.RegionMapScene());
    } else if (hashIs('battle') || hashIs('wild')) {
      // battle-UI test harness
      G.player.party = [G.makeMon('mudkip', 10), G.makeMon('torchic', 8)];
      if (G.MAPS && G.MAPS.route1) G.world.loadMap('route1', 8, 14, 'down');
      G.pushScene(G.overworldScene);
      var auto = location.hash.indexOf('auto') !== -1;
      if (hashIs('battle')) {
        var t = G.TRAINERS[(location.hash.match(/tr=(\w+)/) || [])[1]] || G.TRAINERS.rival1 || G.TRAINERS[Object.keys(G.TRAINERS)[0]];
        G.pushScene(G.BattleScene(new G.Battle({ party: G.player.party, foes: G.trainerParty(t), trainer: t }), { bg: 'meadow', autoPlay: auto }));
      } else {
        var wildKey = G.SPECIES.poochyena ? 'poochyena' : G.DEX_ORDER[0];
        G.pushScene(G.BattleScene(new G.Battle({ party: G.player.party, foes: [G.makeMon(wildKey, 7)], wild: true }), { bg: 'meadow', autoPlay: auto }));
      }
    } else if (hashIs('charsel') && G.CharSelectScene) {
      G.pushScene(G.CharSelectScene(function () {}));
    } else if (G.TitleScene) {
      G.pushScene(G.TitleScene());
    } else if (G.MAPS && G.MAPS.hearthvale) {
      G.world.loadMap('hearthvale', 5, 6, 'down');
      G.pushScene(G.overworldScene);
    } else {
      G.pushScene(testCard());
    }

    // test-harness fast-forward: #wild&ff=300 steps the game synchronously
    var ffMatch = location.hash.match(/ff=(\d+)/);
    if (ffMatch) {
      var n = Math.min(3000, parseInt(ffMatch[1], 10));
      for (var i = 0; i < n; i++) {
        G.input.step();
        G.updateScenes();
        G.frame++;
      }
    }

    var last = performance.now();
    var acc = 0;
    function frame(now) {
      var dt = Math.min(100, now - last); // clamp: survive tab switches
      last = now;
      acc += dt;
      while (acc >= STEP_MS) {
        G.input.step();
        if (G.input.justPressed('mute')) {
          G.audio.toggleMute();
          if (G.syncMuteBtn) G.syncMuteBtn();
        }
        G.updateScenes();
        G.frame++;
        acc -= STEP_MS;
      }
      G.ctx.fillStyle = '#08080c';
      G.ctx.fillRect(0, 0, G.SCREEN_W, G.SCREEN_H);
      G.drawScenes(G.ctx);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  G.STARTERS = STARTERS;

  // Phase-1 smoke test scene: moving square + font sample. Replaced by the
  // title screen once G.TitleScene exists.
  function testCard() {
    var x = 112, y = 72;
    return {
      opaque: true,
      update: function () {
        var d = G.input.heldDir();
        if (d) { x += G.DIRS[d].dx * 2; y += G.DIRS[d].dy * 2; }
        x = G.clamp(x, 0, G.SCREEN_W - 16);
        y = G.clamp(y, 0, G.SCREEN_H - 16);
      },
      draw: function (ctx) {
        ctx.fillStyle = G.C.leaf1;
        ctx.fillRect(0, 0, G.SCREEN_W, G.SCREEN_H);
        ctx.fillStyle = G.C.red2;
        ctx.fillRect(x, y, 16, 16);
        G.text(ctx, 'POKÉRAM shell OK — arrows move, Z/X/Enter', 8, 8, G.UI.text, G.UI.textShadow);
        G.text(ctx, 'abcdefghijklmnopqrstuvwxyz 0123456789', 8, 22, G.C.white, '#3a5a3a');
        G.text(ctx, 'Wild SPROUTLE appeared! ★★★ ▼', 8, 36, G.C.white, '#3a5a3a');
      }
    };
  }

  window.addEventListener('load', boot);
})();

