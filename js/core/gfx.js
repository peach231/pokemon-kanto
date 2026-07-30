// Pokéram — gfx.js
// Logical 240x160 canvas with integer CSS upscaling, the palette-indexed
// sprite-grid decoder (all game art flows through here), bitmap-font text
// rendering, and 9-slice frames.

(function () {
  var W = 240, H = 160;

  G.SCREEN_W = W;
  G.SCREEN_H = H;
  G.IMG = {};   // name -> decoded offscreen canvas
  G.ART = {};   // name -> {w,h,pal,px} source grids (data files fill this)

  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function hexToRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }

  // Decode one {w,h,pal,px} grid into a canvas. '.' (and ' ') = transparent.
  function decodeGrid(art) {
    var w = art.w, h = art.h;
    var c = makeCanvas(w, h);
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(w, h);
    var data = img.data;
    var rgbCache = {};
    for (var key in art.pal) rgbCache[key] = hexToRgb(art.pal[key]);
    for (var y = 0; y < h; y++) {
      var row = art.px[y] || '';
      for (var x = 0; x < w; x++) {
        var ch = row[x];
        if (ch === undefined || ch === '.' || ch === ' ') continue;
        var rgb = rgbCache[ch];
        if (!rgb) continue;
        var i = (y * w + x) * 4;
        data[i] = rgb[0]; data[i + 1] = rgb[1]; data[i + 2] = rgb[2]; data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  function flipped(canvas) {
    var c = makeCanvas(canvas.width, canvas.height);
    var ctx = c.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, 0, 0);
    return c;
  }

  G.gfx = {
    makeCanvas: makeCanvas,
    flipped: flipped,

    init: function () {
      var canvas = document.getElementById('screen');
      G.screen = canvas;
      G.ctx = canvas.getContext('2d');
      G.ctx.imageSmoothingEnabled = false;

      function resize() {
        // fill the window exactly: the game takes 100% of the limiting
        // dimension (aspect preserved, nearest-neighbor keeps pixels crisp)
        var scale = Math.max(1, Math.min(window.innerWidth / W, window.innerHeight / H));
        canvas.style.width = Math.floor(W * scale) + 'px';
        canvas.style.height = Math.floor(H * scale) + 'px';
      }
      window.addEventListener('resize', resize);
      document.addEventListener('fullscreenchange', resize);
      resize();
    },

    // Decode every G.ART entry into G.IMG. Entries may use:
    //   base: 'otherName'  — reuse another entry's px grid (palette swap)
    //   mirror: true       — also produce IMG[name + '_flip']
    decodeAll: function () {
      var name, art;
      // Two passes so palette swaps can reference entries declared later.
      for (name in G.ART) {
        art = G.ART[name];
        if (!art.base) G.IMG[name] = decodeGrid(art);
      }
      for (name in G.ART) {
        art = G.ART[name];
        if (art.base) {
          var src = G.ART[art.base];
          G.IMG[name] = decodeGrid({ w: src.w, h: src.h, px: src.px, pal: art.pal });
        }
      }
      for (name in G.ART) {
        if (G.ART[name].mirror) G.IMG[name + '_flip'] = flipped(G.IMG[name]);
      }
      // NOTE: creature fronts/backs are NOT decoded here — they load as real
      // image files (see loadMonSprites), which is async, so boot waits on them
      // separately (main.js). World/UI art above is still baked synchronously.
      G.gfx.buildFont();
      G.gfx.makeEggSprite();
    },

    // A creature egg shown in the party/summary while it incubates: a white egg
    // with blue + orange blotches and a highlight (original art).
    makeEggSprite: function () {
      var w = 44, h = 54, c = makeCanvas(w, h), x = c.getContext('2d');
      var cx = w / 2, cy = h / 2 + 2, rx = 17, ry = 24, TAU = Math.PI * 2;
      function eggPath() {
        x.beginPath();
        x.moveTo(cx, cy - ry);
        x.bezierCurveTo(cx + rx * 1.05, cy - ry * 0.55, cx + rx, cy + ry * 0.7, cx, cy + ry);
        x.bezierCurveTo(cx - rx, cy + ry * 0.7, cx - rx * 1.05, cy - ry * 0.55, cx, cy - ry);
        x.closePath();
      }
      x.fillStyle = 'rgba(18,20,34,0.22)';
      x.beginPath(); x.ellipse(cx, cy + ry - 1, rx * 0.85, 4, 0, 0, TAU); x.fill();
      x.fillStyle = G.C.ink || '#1a1c2c'; eggPath(); x.fill();
      x.save(); eggPath(); x.clip();
      x.fillStyle = '#fbfbf6'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#e2e2ea'; x.beginPath(); x.ellipse(cx + 3, cy + ry - 6, rx, ry * 0.6, 0, 0, TAU); x.fill();
      x.fillStyle = '#9ad7e6'; x.beginPath(); x.ellipse(cx - 7, cy + 7, 7, 8, 0, 0, TAU); x.fill();
      x.fillStyle = '#79bcd0'; x.beginPath(); x.ellipse(cx - 7, cy + 9, 5, 5, 0, 0, TAU); x.fill();
      x.fillStyle = '#9ad7e6'; x.beginPath(); x.ellipse(cx + 6, cy - 9, 5, 6, 0, 0, TAU); x.fill();
      x.fillStyle = '#f0a85c'; x.beginPath(); x.ellipse(cx + 8, cy + 8, 5, 6, 0, 0, TAU); x.fill();
      x.fillStyle = '#d6843c'; x.beginPath(); x.ellipse(cx + 8, cy + 9, 3, 3, 0, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.ellipse(cx - 5, cy - 12, 4, 7, -0.3, 0, TAU); x.fill();
      x.restore();
      G.IMG.mon_egg = c;
    },

    // -----------------------------------------------------------------------
    // Creature sprites load as real IMAGE files (you supply them; see
    // sprites_config.js), keyed by national dex number. Each side is fit into a
    // `box`x`box` canvas so the battle/gallery layout is consistent regardless
    // of the source resolution. Missing files -> a clean numbered placeholder.
    // -----------------------------------------------------------------------

    // Fallback sprite: soft rounded body + dex number in palette colors, so the
    // game is fully playable before any creature art is supplied.
    makePlaceholder: function (dexId) {
      var box = (G.SPRITE_CFG && G.SPRITE_CFG.box) || 64;
      var c = makeCanvas(box, box);
      var ctx = c.getContext('2d');
      var cx = box / 2, body = Math.round(box * 0.6), top = box - body - 5;
      // ground shadow
      ctx.fillStyle = G.C.dgry || '#3a3a4a';
      ctx.beginPath();
      ctx.ellipse(cx, box - 4, body * 0.5, body * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      var r = Math.round(body * 0.3), x0 = Math.round(cx - body / 2), y0 = top;
      function rrect(x, y, w, h, rad, col) {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(x + rad, y);
        ctx.arcTo(x + w, y, x + w, y + h, rad);
        ctx.arcTo(x + w, y + h, x, y + h, rad);
        ctx.arcTo(x, y + h, x, y, rad);
        ctx.arcTo(x, y, x + w, y, rad);
        ctx.fill();
      }
      rrect(x0, y0, body, body, r, G.C.ink || '#26233a');
      rrect(x0 + 2, y0 + 2, body - 4, body - 4, r - 1, G.C.lgry || '#8a8aa0');
      var q = String(dexId);
      var qw = G.textWidth ? G.textWidth(q) : q.length * 4;
      if (G.text) {
        G.text(ctx, q, Math.round(cx - qw / 2), Math.round(top + body / 2 - 3), G.C.white || '#fff', G.C.ink || '#26233a');
      }
      return c;
    },

    // Fit src (Image or canvas) into a box-sized canvas: trim transparent
    // margins so the creature stands ON the platform (no floating), then
    // bottom-center anchor it. Trimming reads pixels via getImageData; if the
    // source is a tainted cross-origin image it falls back to the full frame.
    _fitToBox: function (src, box, flip) {
      var sw = src.width || box, sh = src.height || box;
      var tmp = makeCanvas(sw, sh);
      var tctx = tmp.getContext('2d');
      tctx.drawImage(src, 0, 0);
      var minX = 0, minY = 0, maxX = sw - 1, maxY = sh - 1;
      try {
        var data = tctx.getImageData(0, 0, sw, sh).data;
        var found = false; minX = sw; minY = sh; maxX = 0; maxY = 0;
        for (var y = 0; y < sh; y++) {
          for (var x = 0; x < sw; x++) {
            if (data[(y * sw + x) * 4 + 3] > 8) {
              found = true;
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;
            }
          }
        }
        if (!found) { minX = 0; minY = 0; maxX = sw - 1; maxY = sh - 1; }
      } catch (e) { minX = 0; minY = 0; maxX = sw - 1; maxY = sh - 1; }
      var cw = maxX - minX + 1, ch = maxY - minY + 1;
      var scale = Math.min(box / cw, box / ch, 1); // fit, never upscale
      var dw = Math.round(cw * scale), dh = Math.round(ch * scale);
      var dx = Math.round((box - dw) / 2), dy = box - dh; // bottom-center anchored
      var c = makeCanvas(box, box);
      var ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      if (flip) {
        ctx.translate(box, 0); ctx.scale(-1, 1);
        ctx.drawImage(tmp, minX, minY, cw, ch, box - dx - dw, dy, dw, dh);
      } else {
        ctx.drawImage(tmp, minX, minY, cw, ch, dx, dy, dw, dh);
      }
      return c;
    },

    // Lazily fetch a shiny sprite the first time a shiny creature appears
    // (shinies are 1/600, so loading all of them up front would be wasteful).
    // Falls back to the normal sprite if the shiny variant can't be fetched.
    ensureShiny: function (key, dexId) {
      var reqKey = 'mon_' + key + '_shiny';
      if (G.IMG[reqKey] || G.gfx._shinyReq[key]) return;
      G.gfx._shinyReq[key] = true;
      var box = (G.SPRITE_CFG && G.SPRITE_CFG.box) || 64;
      var urls = G.spriteUrl('shiny', dexId);
      (function attempt(i) {
        if (i >= urls.length) { // give up -> show the normal sprite
          if (G.IMG['mon_' + key]) {
            G.IMG[reqKey] = G.IMG['mon_' + key];
            G.IMG[reqKey + '_back'] = G.IMG['mon_' + key + '_back'];
          }
          return;
        }
        var img = new Image();
        if (G.SPRITE_CFG.remoteBase && G.SPRITE_CFG.crossOrigin) img.crossOrigin = G.SPRITE_CFG.crossOrigin;
        img.onload = function () {
          G.IMG[reqKey] = G.gfx._fitToBox(img, box, false);
          G.IMG[reqKey + '_back'] = G.gfx._fitToBox(img, box, true);
        };
        img.onerror = function () { attempt(i + 1); };
        img.src = urls[i];
      })(0);
    },
    _shinyReq: {},

    // Load front (+ optional dedicated back) for every species; calls onDone
    // once all requests settle. Robust to missing files and slow networks.
    loadMonSprites: function (onProgress, onDone) {
      var box = (G.SPRITE_CFG && G.SPRITE_CFG.box) || 64;
      var keys = [];
      for (var k in (G.SPECIES || {})) keys.push(k);
      var pending = 0, settled = 0, finished = false;
      var total = keys.length;
      if (!total) { if (onDone) onDone(); return; }

      function done() {
        if (finished) return;
        finished = true;
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i], sp = G.SPECIES[key];
          if (!G.IMG['mon_' + key]) G.IMG['mon_' + key] = G.gfx.makePlaceholder(sp.id);
          if (!G.IMG['mon_' + key + '_back']) G.IMG['mon_' + key + '_back'] = G.gfx._fitToBox(G.IMG['mon_' + key], box, true);
        }
        if (onDone) onDone();
      }

      function tick() {
        settled++;
        if (onProgress) onProgress(settled, pending);
        if (settled >= pending) done();
      }

      // Try candidate URLs in order; cb(img) on first success, cb(null) if none.
      function loadFirst(urls, cb) {
        var i = 0;
        (function attempt() {
          if (i >= urls.length) { cb(null); return; }
          var img = new Image();
          if (G.SPRITE_CFG.remoteBase && G.SPRITE_CFG.crossOrigin) img.crossOrigin = G.SPRITE_CFG.crossOrigin;
          img.onload = function () { cb(img); };
          img.onerror = function () { i++; attempt(); };
          img.src = urls[i];
        })();
      }

      keys.forEach(function (key) {
        var sp = G.SPECIES[key];
        var override = G.SPRITE_MANIFEST && G.SPRITE_MANIFEST[sp.id];
        var hasBack = override && override.back;

        pending++; // front
        loadFirst(G.spriteUrl('front', sp.id), function (img) {
          G.IMG['mon_' + key] = img ? G.gfx._fitToBox(img, box, false) : G.gfx.makePlaceholder(sp.id);
          tick();
        });

        if (hasBack) {
          pending++; // dedicated back
          loadFirst(G.spriteUrl('back', sp.id), function (img) {
            if (img) G.IMG['mon_' + key + '_back'] = G.gfx._fitToBox(img, box, false);
            tick();
          });
        }
      });

      setTimeout(done, 9000); // never hang boot on a slow/dead source
    },

    // Optional: overlay real TRAINER/player battle sprites at runtime. The baked
    // art is already in G.IMG (from decodeAll) and stays the fallback — this only
    // REPLACES a key if its image loads. Non-blocking: sprites swap in when ready.
    loadTrainerSprites: function () {
      if (!G.TRAINER_CFG) return;
      var cfg = G.TRAINER_CFG, box = cfg.box || 64;
      var keys = [];
      for (var name in G.ART) {
        if (name.indexOf('trainer_') === 0) keys.push(name);
      }
      keys.forEach(function (key) {
        var urls = G.trainerSpriteUrl(key);
        var i = 0;
        (function attempt() {
          if (i >= urls.length) return;            // none loaded -> keep baked art
          var img = new Image();
          if (cfg.remoteBase && cfg.crossOrigin) img.crossOrigin = cfg.crossOrigin;
          img.onload = function () { G.IMG[key] = G.gfx._fitToBox(img, box, false); };
          img.onerror = function () { i++; attempt(); };
          img.src = urls[i];
        })();
      });
    },

    // --- shared helpers for real-sprite slicing (overworld + characters) -----
    _flipCanvas: function (src) {
      var c = makeCanvas(src.width, src.height), x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.translate(src.width, 0); x.scale(-1, 1);
      x.drawImage(src, 0, 0);
      return c;
    },

    // Build a recolor lookup {packedSrcRGB: [r,g,b]} from a {'#rrggbb':'#rrggbb'} map.
    _recolorLUT: function (recolor) {
      if (!recolor) return null;
      var lut = {};
      for (var k in recolor) {
        var d = parseInt(recolor[k].slice(1), 16);
        lut[parseInt(k.slice(1), 16)] = [(d >> 16) & 255, (d >> 8) & 255, d & 255];
      }
      return lut;
    },

    // Slice a 9-frame (144x32) walk sheet into ch_<sprName>_{d0,d1,u0,u1,s0,s1,
    // d2,u2,s2} (+ _flip variants). Optional recolor LUT remaps exact palette
    // colors (e.g. skin/outfit) so one sheet yields several distinct characters.
    _sliceWalkSheet: function (img, sprName, lut) {
      var cfg = G.OVERWORLD_CFG || {};
      var fw = cfg.frameW || 16, bw = cfg.boxW || 16, bh = cfg.boxH || 24;
      // Sheet frame order: idle [S,N,W] then walk PAIRS per direction —
      // South=3,4  North=5,6  West=7,8. Map to engine keys so each direction's
      // frames all face that direction (no apparent turning while moving).
      var FRAMES = { d0: 0, u0: 1, s0: 2, d1: 3, d2: 4, u1: 5, u2: 6, s1: 7, s2: 8 };
      var FLIP = ['d1', 'u1', 's0', 's1', 's2'];
      var sw = img.width, sh = img.height;
      var off = makeCanvas(sw, sh), octx = off.getContext('2d');
      octx.drawImage(img, 0, 0);
      var data;
      try { data = octx.getImageData(0, 0, sw, sh).data; }
      catch (e) { return; } // tainted (no CORS) -> keep baked art
      var bgKeyed = data[3] >= 8, bgR = data[0], bgG = data[1], bgB = data[2];
      function isBg(i) {
        if (data[i + 3] < 8) return true;
        return bgKeyed && Math.abs(data[i] - bgR) < 10 && Math.abs(data[i + 1] - bgG) < 10 && Math.abs(data[i + 2] - bgB) < 10;
      }
      var minY = sh, maxY = -1;
      for (var y = 0; y < sh; y++) {
        for (var x = 0; x < sw; x++) {
          if (!isBg((y * sw + x) * 4)) { if (y < minY) minY = y; if (y > maxY) maxY = y; break; }
        }
      }
      if (maxY < 0) return;
      var srcH = maxY - minY + 1, base = 'ch_' + sprName + '_', self = this;
      Object.keys(FRAMES).forEach(function (k) {
        var fi = FRAMES[k];
        if ((fi + 1) * fw > sw) return;
        var tmp = makeCanvas(fw, srcH), tctx = tmp.getContext('2d');
        var id = tctx.createImageData(fw, srcH);
        for (var y = 0; y < srcH; y++) {
          for (var x = 0; x < fw; x++) {
            var si = ((minY + y) * sw + (fi * fw + x)) * 4, di = (y * fw + x) * 4;
            if (isBg(si)) { id.data[di + 3] = 0; continue; }
            var r = data[si], g = data[si + 1], b = data[si + 2];
            if (lut) { var m = lut[(r << 16) | (g << 8) | b]; if (m) { r = m[0]; g = m[1]; b = m[2]; } }
            id.data[di] = r; id.data[di + 1] = g; id.data[di + 2] = b; id.data[di + 3] = 255;
          }
        }
        tctx.putImageData(id, 0, 0);
        var c = makeCanvas(bw, bh), rctx = c.getContext('2d');
        rctx.imageSmoothingEnabled = false;
        var scale = Math.min(1, bh / srcH), dw = Math.round(fw * scale), dh = Math.round(srcH * scale);
        rctx.drawImage(tmp, 0, 0, fw, srcH, Math.round((bw - dw) / 2), bh - dh, dw, dh);
        G.IMG[base + k] = c;
      });
      FLIP.forEach(function (k) { if (G.IMG[base + k]) G.IMG[base + k + '_flip'] = self._flipCanvas(G.IMG[base + k]); });
    },

    // Load + slice a walk sheet (by path under OVERWORLD_CFG.remoteBase) into
    // ch_<sprName>_*, with an optional recolor map. Baked art stays the fallback.
    loadWalkSheet: function (sheetPath, sprName, recolor, cb) {
      var cfg = G.OVERWORLD_CFG;
      if (!cfg || !cfg.remoteBase) { if (cb) cb(); return; }
      var lut = this._recolorLUT(recolor), self = this;
      var img = new Image();
      if (cfg.crossOrigin) img.crossOrigin = cfg.crossOrigin;
      img.onload = function () { self._sliceWalkSheet(img, sprName, lut); if (cb) cb(); };
      img.onerror = function () { if (cb) cb(); };
      img.src = cfg.remoteBase + sheetPath + '.png';
    },

    // Optional: real OVERWORLD walking sprites for the configured NPC classes.
    loadOverworldSprites: function () {
      var cfg = G.OVERWORLD_CFG;
      if (!cfg || !cfg.remoteBase || !cfg.sheets) return;
      var self = this;
      Object.keys(cfg.sheets).forEach(function (sprName) {
        self.loadWalkSheet(cfg.sheets[sprName], sprName, null);
      });
    },

    // Extract frame 0 of a battle back-pic sheet, color-keyed + optionally recolored.
    _extractBackFrame: function (img, lut) {
      var cfg = G.PLAYER_BACK_CFG || {};
      var fw = cfg.frameW || 64, fh = cfg.frameH || 64;
      var sw = img.width;
      var off = makeCanvas(sw, img.height), octx = off.getContext('2d');
      octx.drawImage(img, 0, 0);
      var data;
      try { data = octx.getImageData(0, 0, sw, img.height).data; }
      catch (e) { return null; }
      var bgKeyed = data[3] >= 8, bgR = data[0], bgG = data[1], bgB = data[2];
      function isBg(i) {
        if (data[i + 3] < 8) return true;
        return bgKeyed && Math.abs(data[i] - bgR) < 10 && Math.abs(data[i + 1] - bgG) < 10 && Math.abs(data[i + 2] - bgB) < 10;
      }
      var c = makeCanvas(fw, fh), cx = c.getContext('2d');
      var id = cx.createImageData(fw, fh);
      for (var y = 0; y < fh; y++) {
        for (var x = 0; x < fw; x++) {
          var si = (y * sw + x) * 4, di = (y * fw + x) * 4;
          if (isBg(si)) { id.data[di + 3] = 0; continue; }
          var r = data[si], g = data[si + 1], b = data[si + 2];
          if (lut) { var m = lut[(r << 16) | (g << 8) | b]; if (m) { r = m[0]; g = m[1]; b = m[2]; } }
          id.data[di] = r; id.data[di + 1] = g; id.data[di + 2] = b; id.data[di + 3] = 255;
        }
      }
      cx.putImageData(id, 0, 0);
      return G.gfx._fitToBox(c, fh, false); // trim + bottom-anchor
    },

    // Load a battle back-pic (by name under PLAYER_BACK_CFG.backBase) into
    // G.IMG.trainer_player_back, with an optional recolor map.
    loadBackPic: function (backName, recolor) {
      var cfg = G.PLAYER_BACK_CFG;
      if (!cfg || !cfg.backBase || !backName) return;
      var lut = this._recolorLUT(recolor), self = this;
      var img = new Image();
      if (cfg.crossOrigin) img.crossOrigin = cfg.crossOrigin;
      img.onload = function () { var c = self._extractBackFrame(img, lut); if (c) G.IMG.trainer_player_back = c; };
      img.onerror = function () {};
      img.src = cfg.backBase + backName + '.png';
    },

    // Apply a chosen character: overworld walker (ch_player_*) + battle back sprite.
    loadCharacter: function (charDef) {
      if (!charDef) return;
      this.loadWalkSheet(charDef.sheet, 'player', charDef.recolor);
      this.loadBackPic(charDef.back, charDef.recolor);
    },

    // Load a character's walker under a preview key (ch_csel_<key>_*) for the
    // character-select screen.
    loadCharacterPreview: function (charDef) {
      if (charDef) this.loadWalkSheet(charDef.sheet, 'csel_' + charDef.key, charDef.recolor);
    },

    // -----------------------------------------------------------------------
    // Bitmap font. G.FONT.glyphs[char] = array of rows of '.'/'#'.
    // Pre-rendered per color on demand; '#' pixels take the requested color.
    // -----------------------------------------------------------------------
    _fontCache: {},   // color -> char -> canvas
    _glyphW: {},      // char -> advance width

    buildFont: function () {
      for (var ch in G.FONT.glyphs) {
        var rows = G.FONT.glyphs[ch];
        var w = 0;
        for (var i = 0; i < rows.length; i++) w = Math.max(w, rows[i].length);
        G.gfx._glyphW[ch] = w + 1; // +1px letter spacing
      }
      G.gfx._glyphW[' '] = 3;
    },

    _glyph: function (ch, color) {
      var cache = G.gfx._fontCache[color];
      if (!cache) cache = G.gfx._fontCache[color] = {};
      if (cache[ch]) return cache[ch];
      var rows = G.FONT.glyphs[ch];
      if (!rows) return null;
      var w = G.gfx._glyphW[ch] - 1;
      var c = makeCanvas(Math.max(1, w), G.FONT.height);
      var ctx = c.getContext('2d');
      ctx.fillStyle = color;
      for (var y = 0; y < rows.length; y++) {
        for (var x = 0; x < rows[y].length; x++) {
          if (rows[y][x] === '#') ctx.fillRect(x, y, 1, 1);
        }
      }
      cache[ch] = c;
      return c;
    }
  };

  // Draw text; returns end x. shadow: optional second color drawn at +1,+1
  // (the GBA text look is dark text with a light drop shadow).
  G.text = function (ctx, str, x, y, color, shadow) {
    str = String(str);
    var cx = x;
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === ' ') { cx += G.gfx._glyphW[' ']; continue; }
      var img = G.gfx._glyph(ch, color);
      if (!img) { cx += 4; continue; }
      if (shadow) {
        var sh = G.gfx._glyph(ch, shadow);
        ctx.drawImage(sh, cx + 1, y + 1);
      }
      ctx.drawImage(img, cx, y);
      cx += G.gfx._glyphW[ch];
    }
    return cx;
  };

  G.textWidth = function (str) {
    str = String(str);
    var w = 0;
    for (var i = 0; i < str.length; i++) w += G.gfx._glyphW[str[i]] || 4;
    return w;
  };

  // Word-wrap to maxWidth px; returns array of lines.
  G.textWrap = function (str, maxWidth) {
    var words = String(str).split(' ');
    var lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var probe = line ? line + ' ' + words[i] : words[i];
      if (G.textWidth(probe) > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = probe;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  // 9-slice: img divided into a 3x3 grid of `c`-sized corners; edges/center tile.
  G.nineSlice = function (ctx, img, x, y, w, h, c) {
    var iw = img.width, ih = img.height;
    var ew = iw - c * 2, eh = ih - c * 2; // source edge strip sizes
    // corners
    ctx.drawImage(img, 0, 0, c, c, x, y, c, c);
    ctx.drawImage(img, iw - c, 0, c, c, x + w - c, y, c, c);
    ctx.drawImage(img, 0, ih - c, c, c, x, y + h - c, c, c);
    ctx.drawImage(img, iw - c, ih - c, c, c, x + w - c, y + h - c, c, c);
    // edges
    ctx.drawImage(img, c, 0, ew, c, x + c, y, w - c * 2, c);
    ctx.drawImage(img, c, ih - c, ew, c, x + c, y + h - c, w - c * 2, c);
    ctx.drawImage(img, 0, c, c, eh, x, y + c, c, h - c * 2);
    ctx.drawImage(img, iw - c, c, c, eh, x + w - c, y + c, c, h - c * 2);
    // center
    ctx.drawImage(img, c, c, ew, eh, x + c, y + c, w - c * 2, h - c * 2);
  };
})();
