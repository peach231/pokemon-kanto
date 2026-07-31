// Pokéram — scene.js
// Scene stack. Scenes are objects: { enter(params), exit(), update(), draw(ctx), opaque }
// Top scene gets update()+input. Draw walks down to the first opaque scene,
// then draws upward, so translucent scenes (menus, dialogue) layer over the world.

(function () {
  G.scenes = [];

  G.pushScene = function (scene, params) {
    G.scenes.push(scene);
    if (scene.enter) scene.enter(params);
  };

  G.popScene = function () {
    var s = G.scenes.pop();
    if (s && s.exit) s.exit();
    return s;
  };

  G.replaceScene = function (scene, params) {
    G.popScene();
    G.pushScene(scene, params);
  };

  G.topScene = function () { return G.scenes[G.scenes.length - 1]; };

  G.updateScenes = function () {
    var top = G.topScene();
    if (top && top.update) top.update();
  };

  G.drawScenes = function (ctx) {
    if (!G.scenes.length) return;   // a scene may close itself on its last frame
    var start = G.scenes.length - 1;
    while (start > 0 && !G.scenes[start].opaque) start--;
    for (var i = start; i < G.scenes.length; i++) {
      if (G.scenes[i].draw) G.scenes[i].draw(ctx);
    }
  };

  // -------------------------------------------------------------------------
  // Fade transition: fades to black, runs mid() (e.g. swap maps), fades back.
  // Pushes itself over whatever is showing; pops itself when finished.
  // -------------------------------------------------------------------------
  G.FadeScene = function (mid, opts) {
    opts = opts || {};
    var DURATION = opts.frames || 12;
    return {
      opaque: false,
      t: 0,
      phase: 0, // 0 = darkening, 1 = lightening
      update: function () {
        this.t++;
        if (this.phase === 0 && this.t >= DURATION) {
          if (mid) mid();
          this.phase = 1;
          this.t = 0;
        } else if (this.phase === 1 && this.t >= DURATION) {
          G.popScene();
          if (opts.after) opts.after();
        }
      },
      draw: function (ctx) {
        var a = this.phase === 0 ? this.t / DURATION : 1 - this.t / DURATION;
        ctx.fillStyle = 'rgba(8,8,12,' + a.toFixed(3) + ')';
        ctx.fillRect(0, 0, G.SCREEN_W, G.SCREEN_H);
      }
    };
  };

  // -------------------------------------------------------------------------
  // Door entry: a short beat where the doorway darkens over the entrant (the
  // door "opens" and they step inside) before the fade swaps the map. The
  // overworld renders frozen underneath; we just shade the door tile.
  // -------------------------------------------------------------------------
  G.DoorOpenScene = function (dx, dy, onDone) {
    var DUR = 13, TILE = 16;
    return {
      opaque: false,
      t: 0,
      update: function () { this.t++; if (this.t >= DUR) { G.popScene(); onDone(); } },
      draw: function (ctx) {
        if (!G.world || !G.world.camera) return;
        var cam = G.world.camera();
        var sx = dx * TILE - cam.x, sy = dy * TILE - cam.y;
        var h = Math.round(25 * Math.min(1, this.t / DUR * 1.05)); // shade grows down over the doorway + entrant
        ctx.fillStyle = '#0a0a14';
        ctx.fillRect(sx + 2, sy - 8, 12, h);
      }
    };
  };

  // -------------------------------------------------------------------------
  // Battle intro: alternating screen flashes, then a closing spiral of black
  // tiles — the classic GBA encounter swirl. Calls onDone() at full black
  // (caller swaps in the battle scene underneath), then unwinds instantly.
  // -------------------------------------------------------------------------
  // The transition into a battle says what KIND of battle it is before a
  // single sprite is drawn. Red/Blue had a dozen of these and used them to
  // grade the encounter: a wild Rattata got one wipe, a gym leader got
  // another, and you knew which you were in for during the half-second the
  // screen took to turn black.
  //
  //   spiral   wild encounters — the inherited one, kept
  //   wipe     trainers: a hard diagonal cut across the screen
  //   shutter  gym leaders and the Elite Four: horizontal bands slamming shut
  //   burst    legendaries: white flash, then black closing from the edges
  //
  // Every variant ends the same way — the whole screen black, the scene popped,
  // onDone called — so the caller neither knows nor cares which one ran.
  G.BattleSwirlScene = function (onDone, style) {
    var TILE = 8;
    var COLS = G.SCREEN_W / TILE, ROWS = G.SCREEN_H / TILE;
    style = style || 'spiral';

    var order = [];
    var x, y;
    if (style === 'wipe') {
      // diagonal bands, top-left to bottom-right
      var cells = [];
      for (y = 0; y < ROWS; y++) for (x = 0; x < COLS; x++) cells.push([x, y]);
      cells.sort(function (a, b) { return (a[0] + a[1] * 1.6) - (b[0] + b[1] * 1.6); });
      order = cells;
    } else if (style === 'shutter') {
      // rows slam in from alternating sides, meeting in the middle
      for (var r = 0; r < ROWS; r++) {
        var rowY = (r % 2 === 0) ? (r >> 1) : (ROWS - 1 - (r >> 1));
        for (x = 0; x < COLS; x++) {
          order.push([(rowY % 2 === 0) ? x : COLS - 1 - x, rowY]);
        }
      }
    } else if (style === 'burst') {
      // closes from the frame inwards
      var all = [];
      for (y = 0; y < ROWS; y++) for (x = 0; x < COLS; x++) all.push([x, y]);
      all.sort(function (a, b) {
        var da = Math.min(a[0], COLS - 1 - a[0], a[1], ROWS - 1 - a[1]);
        var db = Math.min(b[0], COLS - 1 - b[0], b[1], ROWS - 1 - b[1]);
        return da - db;
      });
      order = all;
    } else {
      var x0 = 0, y0 = 0, x1 = COLS - 1, y1 = ROWS - 1;
      while (x0 <= x1 && y0 <= y1) {
        for (x = x0; x <= x1; x++) order.push([x, y0]);
        for (y = y0 + 1; y <= y1; y++) order.push([x1, y]);
        for (x = x1 - 1; x >= x0; x--) order.push([x, y1]);
        for (y = y1 - 1; y > y0; y--) order.push([x0, y]);
        x0++; y0++; x1--; y1--;
      }
    }

    // A leader's shutter is slower and heavier; a legendary flashes longer.
    var FLASH_FRAMES = style === 'burst' ? 34 : style === 'shutter' ? 20 : 24;
    var SPAN = style === 'shutter' ? 26 : style === 'wipe' ? 22 : 36;
    var TILES_PER_FRAME = Math.ceil(order.length / SPAN);
    return {
      opaque: false,
      t: 0,
      count: 0,
      done: false,
      update: function () {
        this.t++;
        if (this.t <= FLASH_FRAMES) return;
        this.count += TILES_PER_FRAME;
        if (this.count >= order.length && !this.done) {
          this.done = true;
          G.popScene(); // pop the swirl first so onDone can push the next scene
          if (onDone) onDone();
        }
      },
      draw: function (ctx) {
        if (this.t <= FLASH_FRAMES) {
          var on = style === 'burst'
            ? (this.t >> 1) % 2 === 0          // a legendary strobes hard
            : (this.t >> 2) % 2 === 0;
          if (on) {
            ctx.fillStyle = style === 'burst' ? 'rgba(255,255,255,0.95)' : 'rgba(244,244,244,0.85)';
            ctx.fillRect(0, 0, G.SCREEN_W, G.SCREEN_H);
          }
          return;
        }
        ctx.fillStyle = '#08080c';
        var n = Math.min(this.count, order.length);
        for (var i = 0; i < n; i++) {
          ctx.fillRect(order[i][0] * TILE, order[i][1] * TILE, TILE, TILE);
        }
      }
    };
  };
})();
