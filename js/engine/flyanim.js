// Pokéram — flyanim.js
// The FLY sequence: climb out, cross Kanto, come down somewhere else.
//
// Fly used to be a map load and a line of text, which is a strange thing for
// the most dramatic verb in the game. It is the one moment where the region
// stops being a grid of tiles and becomes a place with weather over it, and
// that is worth about a second and a half.
//
// Everything here is drawn with fillRect. No new art, no image loads — the
// whole thing is a gradient, some blocky clouds and a sprite that already
// exists, which also means it cannot fail to load.

(function () {
  var W = 240, H = 160;

  // Deep blue overhead down to a warm haze at the horizon. Banded rather than
  // smoothly interpolated, because a GBA screen has no business with a smooth
  // gradient and the banding is the look.
  var SKY = [
    [0.00, '#16357a'], [0.09, '#1c3f8a'], [0.18, '#244d9b'], [0.27, '#2a5aa8'],
    [0.36, '#3269b6'], [0.45, '#3b78c4'], [0.54, '#4a8bce'], [0.62, '#5c9bd8'],
    [0.70, '#74aee0'], [0.77, '#8fc0e6'], [0.84, '#a9cee9'], [0.91, '#c2ddec'],
    [0.96, '#dbe6de'], [1.00, '#f0e4c4']
  ];

  function skyAt(f) {
    for (var i = 1; i < SKY.length; i++) {
      if (f <= SKY[i][0]) return SKY[i - 1][1];
    }
    return SKY[SKY.length - 1][1];
  }

  // Chunky pixel cloud: a row of blocks with a lighter top edge, so it reads
  // as lit from above rather than as a grey smear.
  function cloud(ctx, x, y, w, h, alpha) {
    var CELL = 4;
    ctx.globalAlpha = alpha;
    for (var gy = 0; gy < h; gy += CELL) {
      var inset = Math.abs(gy - h / 2) / (h / 2);          // rounded ends
      var pad = Math.round(inset * inset * w * 0.42 / CELL) * CELL;
      var x0 = x + pad, x1 = x + w - pad;
      ctx.fillStyle = gy < CELL ? '#ffffff' : (gy < h * 0.55 ? '#eef4fb' : '#c9d8e8');
      for (var gx = x0; gx < x1; gx += CELL) {
        ctx.fillRect(Math.round(gx), Math.round(y + gy), CELL, CELL);
      }
    }
    ctx.globalAlpha = 1;
  }

  function seeded(n) {
    return function () {
      n = (n * 1664525 + 1013904223) >>> 0;
      return n / 4294967296;
    };
  }

  // ---------------------------------------------------------------------------
  // onMid() runs at the top of the arc, hidden behind the sky — that is where
  // the map swap happens, so the world changes while nobody can see it.
  G.FlyScene = function (mon, label, onMid, onDone) {
    var CLIMB = 26, CRUISE = 46, DIVE = 26;
    var TOTAL = CLIMB + CRUISE + DIVE;
    // The motion setting flattens the drift and the bobbing rather than
    // shortening the scene — the pacing is the point, the movement is not.
    var motion = (G.motionScale ? G.motionScale() : 1);

    var rnd = seeded(1337);
    var layers = [[], [], []];
    for (var L = 0; L < 3; L++) {
      var count = 3 + L * 2;
      for (var i = 0; i < count; i++) {
        layers[L].push({
          x: rnd() * (W + 120) - 60,
          y: 8 + rnd() * (H * 0.62),
          w: (18 + rnd() * 34) * (0.6 + L * 0.35),
          h: 8 + rnd() * 8 + L * 3
        });
      }
    }
    // A few landmarks passing underneath, so the ground is somewhere rather
    // than a green band: fields, a river, a stretch of coast.
    var land = [];
    for (var j = 0; j < 14; j++) {
      land.push({ x: rnd() * (W + 200) - 100, w: 14 + rnd() * 40, kind: rnd() });
    }

    var t = 0;
    var mid = false;

    return {
      opaque: true,
      update: function () {
        t++;
        if (!mid && t >= CLIMB + CRUISE * 0.45) { mid = true; if (onMid) onMid(); }
        if (t >= TOTAL) {
          G.popScene();
          if (onDone) onDone();
        }
      },
      draw: function (ctx) {
        // altitude, 0 on the ground and 1 at cruise, eased at both ends
        var alt;
        if (t < CLIMB) alt = t / CLIMB;
        else if (t < CLIMB + CRUISE) alt = 1;
        else alt = 1 - (t - CLIMB - CRUISE) / DIVE;
        alt = alt < 0 ? 0 : alt > 1 ? 1 : alt;
        var ease = alt * alt * (3 - 2 * alt);

        // ---- sky ----
        for (var y = 0; y < H; y++) {
          ctx.fillStyle = skyAt(y / H);
          ctx.fillRect(0, y, W, 1);
        }

        // ---- sun, with a soft halo ----
        // Drawn as discs. Concentric fillRects made a visible square box in
        // the corner of the sky, which is the one thing a halo must not be.
        var sx = 196, sy = 26;
        for (var r = 30; r >= 6; r -= 4) {
          ctx.fillStyle = 'rgba(255,246,206,' + (0.045 * (34 - r) / 28 + 0.02).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fff6d2';
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();

        // ---- the ground, far below ----
        // The horizon sits low while climbing and settles high at cruise, so
        // the world drops away underneath rather than the camera panning.
        // Low down you see a lot of ground; at height it is a strip near the
        // horizon. This was the wrong way round and the land nearly vanished
        // at both ends of the flight, which is exactly when it should fill the
        // screen — so the take-off and the landing had nothing to land on.
        var horizon = Math.round(H * 0.70 - (1 - ease) * 44);
        if (horizon < H) {
          // Haze at the horizon, deepening toward the bottom of the screen —
          // land seen from height is pale far away and saturated underneath.
          var bands = H - horizon;
          for (var by = 0; by < bands; by++) {
            var d = by / Math.max(1, bands);
            ctx.fillStyle = d < 0.15 ? '#9dc38c' : d < 0.4 ? '#87b573' : d < 0.7 ? '#78ab66' : '#6ba05a';
            ctx.fillRect(0, horizon + by, W, 1);
          }
          ctx.fillStyle = 'rgba(230,240,246,0.5)';
          ctx.fillRect(0, horizon, W, 2);

          var drift = (t * (1.9 + ease * 1.6) * (0.35 + motion * 0.65));
          // A river, drawn as one continuous seam rather than another bar, so
          // the ground has a line running through it and reads as country
          // instead of a shelf of floating rectangles.
          ctx.fillStyle = '#4a93cc';
          for (var rx = 0; rx < W; rx += 4) {
            var ry = horizon + 14 + Math.sin((rx + drift * 0.35) / 26) * 6 + Math.sin((rx + drift * 0.35) / 9) * 1.5;
            if (ry > H - 3 || ry < horizon + 2) continue;
            ctx.fillRect(rx, Math.round(ry), 4, 3);
          }
          for (var q = 0; q < land.length; q++) {
            var p = land[q];
            var lx = ((p.x - drift) % (W + 200) + (W + 200)) % (W + 200) - 100;
            var ly = horizon + 3 + (q % 5) * 6;
            if (ly > H - 3) continue;
            var lw = Math.max(4, Math.round(p.w * (1.25 - ease * 0.5)));
            var lh = Math.max(2, Math.round(4 + (q % 3)));
            var far = (ly - horizon) / Math.max(1, bands);      // haze with distance
            ctx.globalAlpha = 0.45 + far * 0.55;
            ctx.fillStyle = p.kind < 0.28 ? '#ded093'          // a cut field
              : p.kind < 0.48 ? '#4f8443'                       // woodland
                : p.kind < 0.62 ? '#c9b478'                     // ploughed earth
                  : p.kind < 0.80 ? '#7ba469'                   // pasture
                    : '#98b382';                                // scrub
            ctx.fillRect(Math.round(lx), Math.round(ly), lw, lh);
            // a hedgerow along one edge, which is what makes fields read as fields
            ctx.fillStyle = 'rgba(48,84,44,0.35)';
            ctx.fillRect(Math.round(lx), Math.round(ly + lh - 1), lw, 1);
            ctx.globalAlpha = 1;
          }
          // the shadow of whatever is carrying you, crossing the fields
          var shx = 104 - drift * 0.06;
          ctx.fillStyle = 'rgba(30,50,30,0.22)';
          ctx.fillRect(Math.round(((shx % W) + W) % W), horizon + 10, 14, 4);
        }

        // ---- clouds, three speeds ----
        for (var Li = 0; Li < 3; Li++) {
          var spd = (0.35 + Li * 0.85) * (1 + ease * 1.4) * (0.3 + motion * 0.7);
          var alpha = 0.45 + Li * 0.22;
          for (var ci = 0; ci < layers[Li].length; ci++) {
            var c = layers[Li][ci];
            var cx = ((c.x - t * spd) % (W + 160) + (W + 160)) % (W + 160) - 80;
            cloud(ctx, cx, c.y, c.w, c.h, alpha);
          }
        }

        // ---- wind ----
        if (ease > 0.5) {
          ctx.fillStyle = 'rgba(255,255,255,0.30)';
          for (var wi = 0; wi < 7; wi++) {
            var wy = 18 + ((wi * 37 + t * 9 * (0.3 + motion * 0.7)) % (H - 50));
            var ww = 10 + (wi % 3) * 9;
            var wx = W - ((t * (6 + wi) * (0.3 + motion * 0.7)) % (W + 60));
            ctx.fillRect(Math.round(wx), Math.round(wy), ww, 1);
          }
        }

        // ---- the flier ----
        var img = mon && G.IMG['mon_' + mon.sp];
        var bob = Math.sin(t / 5) * 3 * (0.25 + motion * 0.75);
        // rises up the screen while climbing, holds, then sinks away
        var fy = H * 0.62 - ease * (H * 0.22) + bob;
        var fx = W / 2 - 24 + Math.sin(t / 17) * 5 * motion;
        if (img) {
          var s = 46;
          // Tilted into the wind. These are battle sprites — every one of them
          // is standing on the ground with its feet under it — so drawn square
          // to the screen the flier looks like it is hovering upright rather
          // than going anywhere. A few degrees of nose-down and a smear of
          // motion behind it does the whole job.
          var tilt = (-0.16 + Math.sin(t / 5) * 0.03) * (0.3 + motion * 0.7);
          ctx.save();
          ctx.translate(fx + s / 2, fy);
          ctx.rotate(tilt);
          // The trail goes BEHIND. Everything else on screen drifts left, so
          // the flier is travelling right, and ghosts drawn ahead of it read
          // as a rendering fault rather than as speed.
          if (ease > 0.4) {
            ctx.globalAlpha = 0.13;
            ctx.drawImage(img, -s / 2 - 6, -s / 2, s, s);
            ctx.globalAlpha = 0.07;
            ctx.drawImage(img, -s / 2 - 12, -s / 2, s, s);
            ctx.globalAlpha = 1;
          }
          ctx.drawImage(img, -s / 2, -s / 2, s, s);
          ctx.restore();
        }

        // ---- the name of where you are going ----
        if (t > CLIMB + 6 && label) {
          var a = Math.min(1, (t - CLIMB - 6) / 10) * Math.min(1, (TOTAL - t) / 12);
          ctx.globalAlpha = Math.max(0, a);
          var tw = G.textWidth(label);
          ctx.fillStyle = 'rgba(20,28,52,0.55)';
          ctx.fillRect((W - tw) / 2 - 6, 12, tw + 12, 14);
          G.text(ctx, label, Math.round((W - tw) / 2), 16, '#ffffff', '#1a2340');
          ctx.globalAlpha = 1;
        }

        // ---- a wipe to white at the very ends, so it starts and stops clean --
        var fade = t < 6 ? 1 - t / 6 : (t > TOTAL - 7 ? 1 - (TOTAL - t) / 7 : 0);
        if (fade > 0) {
          ctx.fillStyle = 'rgba(244,248,255,' + fade.toFixed(3) + ')';
          ctx.fillRect(0, 0, W, H);
        }
      }
    };
  };
})();
