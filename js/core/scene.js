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
  G.BattleSwirlScene = function (onDone) {
    var TILE = 8;
    var COLS = G.SCREEN_W / TILE, ROWS = G.SCREEN_H / TILE;
    // Precompute spiral order of tile coords.
    var order = [];
    var x0 = 0, y0 = 0, x1 = COLS - 1, y1 = ROWS - 1;
    while (x0 <= x1 && y0 <= y1) {
      var x, y;
      for (x = x0; x <= x1; x++) order.push([x, y0]);
      for (y = y0 + 1; y <= y1; y++) order.push([x1, y]);
      for (x = x1 - 1; x >= x0; x--) order.push([x, y1]);
      for (y = y1 - 1; y > y0; y--) order.push([x0, y]);
      x0++; y0++; x1--; y1--;
    }
    var FLASH_FRAMES = 24;
    var TILES_PER_FRAME = Math.ceil(order.length / 36);
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
          if ((this.t >> 2) % 2 === 0) {
            ctx.fillStyle = 'rgba(244,244,244,0.85)';
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
