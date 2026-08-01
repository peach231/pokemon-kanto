// Pokéram — overworld.js
// Tile-map world: grid movement with pixel interpolation, collision, warps,
// NPC/sign interaction, ledge hops, tall-grass hooks, camera, layered render.

(function () {
  var TILE = 16;

  G.flags = {}; // global progression flags (persisted by save.js)

  // Hooks other systems plug into (battle wires these up in later phases).
  G.hooks = {
    grassStep: null,   // function(map) called after stepping onto tall grass
    stepDone: null,    // function(x, y) called after every completed step
    interact: null     // function(npc) -> true if it consumed the interaction
  };

  function makeActor(sprite, x, y, dir) {
    return {
      sprite: sprite, x: x, y: y, dir: dir || 'down',
      moving: false, step: 0, stride: false,
      hop: 0,        // >0 while ledge-hopping (frames remaining)
      hopTotal: 0,
      fromX: x, fromY: y,
      obj: false
    };
  }

  // A tag-along follower (Mom in the home town, Remy on Route 1): it trails one
  // tile behind the player and is talkable (its onTalkEvent runs heal/guidance).
  // G.updateFollower decides who follows on each map load.
  G.attachFollower = function (sprite, eventId, name) {
    var p = G.world.player;
    var bd = G.DIRS[G.OPPOSITE_DIR[p.dir] || 'down'];   // start one tile behind the player
    var bx = p.x + bd.dx, by = p.y + bd.dy;
    if (G.world.isBlocked(bx, by)) { bx = p.x; by = p.y; }
    var f = makeActor(sprite, bx, by, p.dir);
    f.onTalkEvent = eventId; f.name = name;
    G.world.follower = f;
  };
  G.clearFollower = function () { G.world.follower = null; };
  G.updateFollower = function () {
    G.world.follower = null;
    var id = G.world.mapId;
    // Kanto has no tag-along companion. Mum walks with you around Pallet until
    // you take the Pokedex, and that is the whole system.
    if (id === 'pallet' && !G.flags.gotDex) G.attachFollower('mom', 'momTalk', 'Mum');
  };

  // -------------------------------------------------------------------------
  // Procedural scenery: scatter non-colliding decorations (flowers, tufts,
  // pebbles, bushes) over PLAIN grass so outdoor maps read as designed places
  // rather than bare fields. Deterministic per map (seeded by id) and run once.
  // Skips paths, tall grass (keeps encounters), solids, and any gameplay tile
  // (warps/signs/items/npcs/trainers) so it can never block or hide anything.
  // -------------------------------------------------------------------------
  function strHash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }


  // ------------------------------------------------------ dressing shops --
  // Every shopfront in Kanto was a flat wall with a door in it, so a Centre, a
  // Mart and a house differed only by the colour of the roof. This walks the
  // grid AFTER the scatter and hangs the right trimmings on each frontage,
  // reading the ROOF above a window to decide what kind of building it is:
  //
  //   Mart / Centre  -> a striped awning, and a lamp beside the door
  //   house          -> a window box
  //   gym / civic    -> a hanging sign
  //
  // Doing it here rather than in the map data means 20 towns get it without a
  // single grid being re-typed, and a new town gets it for free.
  function dressBuildings(map, deco) {
    var nameAt = function (x, y) {
      if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
      return map.legend[map.ground[y][x]] || null;
    };
    var free = function (x, y) {
      return y >= 0 && y < map.h && x >= 0 && x < map.w && (deco[y][x] || '.') === '.';
    };
    // deco is a char grid over the SAME legend, so the trimmings need letters
    // in it. These are added to the map's own legend rather than the shared
    // one, so they cannot collide with a character a route already uses.
    var SLOTS = { awning: '\u00E1', windowbox: '\u00E2', hangsign: '\u00E3', doormat: '\u00E4', lamp: '\u00E5' };
    for (var k in SLOTS) map.legend[SLOTS[k]] = k;

    for (var y = 0; y < map.h; y++) {
      for (var x = 0; x < map.w; x++) {
        var here = nameAt(x, y);

        // a window -> trim by whatever building it belongs to. The roof is not
        // always DIRECTLY above: a Centre carries its cross and a Mart its
        // sign on the row between, so walk up past those.
        if (here === 'window') {
          // GROUND FLOOR ONLY. A four-storey Silph Co. with a hanging sign on
          // every window of every floor reads as bunting, not as signage.
          var under = nameAt(x, y + 1) || '';
          if (/^wall$|^window$|door/.test(under)) continue;
          var above = '';
          for (var up = 1; up <= 3; up++) {
            var n2 = nameAt(x, y - up) || '';
            if (/roof/.test(n2)) { above = n2; break; }
            if (!/sign|wall|window/.test(n2)) break;
          }
          var kind = /^sroof|^hroof/.test(above) ? 'awning'
                   : /^roof/.test(above) ? 'windowbox'
                   : /^groof|^lroof/.test(above) ? 'hangsign' : null;
          if (kind && free(x, y)) deco[y][x] = SLOTS[kind];
          continue;
        }

        // a door -> a mat on the ground in front of it, and for the shops a
        // lamp on the wall beside it
        if (here === 'door' || here === 'gdoor') {
          if (free(x, y + 1) && !/roof/.test(nameAt(x, y + 1) || '')) deco[y + 1][x] = SLOTS.doormat;
          var roofAbove = '';
          for (var u2 = 1; u2 <= 3; u2++) {
            var n3 = nameAt(x, y - u2) || '';
            if (/roof/.test(n3)) { roofAbove = n3; break; }
            if (!/sign|wall|window/.test(n3)) break;
          }
          if (/^sroof|^hroof/.test(roofAbove)) {
            if (nameAt(x - 1, y) === 'wall' && free(x - 1, y)) deco[y][x - 1] = SLOTS.lamp;
            else if (nameAt(x + 1, y) === 'wall' && free(x + 1, y)) deco[y][x + 1] = SLOTS.lamp;
          }
        }
      }
    }
  }

  G.decorateMap = function (map) {
    if (!map || map._decorated) return;
    map._decorated = true;
    if (!map.deco || !map.ground || map.indoors) return;
    var isOutdoor = map.legend === G.LEG_EXT ||
      Object.keys(map.legend).some(function (c) { return map.legend[c] === 'door'; });
    if (!isOutdoor) return;
    var avoid = {};
    function mark(a) { (a || []).forEach(function (o) { avoid[o.x + ',' + o.y] = 1; }); }
    mark(map.warps); mark(map.signs); mark(map.items); mark(map.npcs); mark(map.trainers);
    // Kanto is TEMPERATE woodland, so the scatter is ferns, bracken, cut stumps
    // and loose stones -- no palms, no seashells, no volcanic cinders. Density
    // is moderate: enough that a route reads as a lived-in place, not so much
    // that it fights the tall grass for attention.
    var bg = map.battleBg || 'meadow';
    var palette = bg === 'cave' ? [['o', 0.07], ['Q', 0.03]]
      : bg === 'indoor' ? [['f', 0.05], ['y', 0.04], [',', 0.06]]
      : [['f', 0.05], ['y', 0.04], [',', 0.06], ['Q', 0.03], ['J', 0.03], ['V', 0.012], ['o', 0.02]];
    var rng = mulberry32(strHash(map.id));
    var deco = map.deco.map(function (r) { return r.split(''); });
    for (var y = 0; y < map.h; y++) {
      for (var x = 0; x < map.w; x++) {
        if (avoid[x + ',' + y]) continue;
        if ((deco[y][x] || '.') !== '.') continue;               // keep authored deco
        if (map.legend[map.ground[y][x]] !== 'grass') continue;  // only plain grass
        var r = rng(), acc = 0, ch = null;
        for (var p = 0; p < palette.length; p++) { acc += palette[p][1]; if (r < acc) { ch = palette[p][0]; break; } }
        if (ch) deco[y][x] = ch;
      }
    }
    dressBuildings(map, deco);
    map.deco = deco.map(function (r) { return r.join(''); });
  };

  // A bobbing yellow arrow drawn over map-edge exit warps so the way to the next
  // route/town is unmistakable. Points outward (toward the map edge).
  function drawExitArrow(ctx, cx, cy, dir) {
    var d = G.DIRS[dir];
    var bob = Math.round(Math.sin(G.frame * 0.16) * 2);
    var ox = Math.round(cx + d.dx * (5 + bob)), oy = Math.round(cy + d.dy * (5 + bob));
    var s = 5, px = -d.dy, py = d.dx; // perpendicular
    var tipx = ox + d.dx * s, tipy = oy + d.dy * s;
    var b1x = ox + px * s - d.dx * s, b1y = oy + py * s - d.dy * s;
    var b2x = ox - px * s - d.dx * s, b2y = oy - py * s - d.dy * s;
    ctx.beginPath();
    ctx.moveTo(tipx, tipy); ctx.lineTo(b1x, b1y); ctx.lineTo(b2x, b2y); ctx.closePath();
    ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeStyle = G.C.ink || '#1a1c2c'; ctx.stroke();
    ctx.fillStyle = '#f8e878'; ctx.fill();
  }

  // Overworld weather overlay — understated, drawn over the world but under HUD.
  // Maps opt in with a `weather` field; the default (no field) is plain sunny.

  // --------------------------------------------------------- weather -------
  // Three more, for the three places in Kanto with a climate of their own.
  function drawExtraWeather(ctx, kind) {
    // Wind was 11 pixels a frame, which is 660 a second across the whole
    // screen. Halved at source and then scaled by the motion dial.
    var ms = G.motionSpeed();
    var f = G.frame * ms * 0.5, W = G.SCREEN_W, H = G.SCREEN_H, i;
    if (kind === 'wind') {
      // CYCLING ROAD. Horizontal streaks, fast, low opacity — the road is a
      // hill you cannot stop on and it should feel like it.
      ctx.fillStyle = 'rgba(236,244,255,0.30)';
      for (i = 0; i < 26; i++) {
        var wx = (i * 71 + f * 11) % (W + 60) - 30;
        var wy = (i * 43 + (i & 1) * 7) % H;
        ctx.fillRect(wx, wy, 10 + (i % 3) * 6, 1);
      }
    } else if (kind === 'spray') {
      // OPEN SEA. Slow motes drifting up off the swell, and a faint blue cast.
      ctx.fillStyle = 'rgba(140,196,240,0.10)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (i = 0; i < 22; i++) {
        var sx2 = (i * 97 + f * 2) % (W + 20) - 10;
        var sy2 = H - ((i * 61 + f * 3) % (H + 30));
        ctx.fillRect(sx2, sy2, 1, 1);
      }
    } else if (kind === 'ash') {
      // CINNABAR. The volcano has not gone off in living memory. It smokes
      // every single day, and the town has stopped mentioning it.
      ctx.fillStyle = 'rgba(60,48,44,0.12)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(210,200,192,0.55)';
      for (i = 0; i < 30; i++) {
        var ax = (i * 83 + f) % (W + 16) - 8 + Math.sin((f + i * 17) * 0.03) * 3;
        var ay = (i * 47 + f * 2) % (H + 16) - 8;
        ctx.fillRect(ax | 0, ay | 0, 1 + (i % 3 === 0 ? 1 : 0), 1);
      }
    }
  }

  // ---------------------------------------------------- interior light -----
  // Every interior was lit flat, which is why a Pokémon Centre and a Rocket
  // hideout felt like the same room in different wallpaper. This lays a tinted
  // vignette over indoor maps and pools warm light under the fittings that
  // would actually emit it — the heal machine, a lamp — so a Centre reads as
  // somewhere you are safe before a single line of dialogue says so.
  var LIGHT = {
    center:  { tint: 'rgba(255,206,128,0.13)', edge: 'rgba(60,34,10,0.30)' },
    town:    { tint: 'rgba(255,224,170,0.08)', edge: 'rgba(40,30,20,0.26)' },
    cave:    { tint: 'rgba(120,150,200,0.10)', edge: 'rgba(6,10,22,0.46)' },
    gym:     { tint: 'rgba(255,255,255,0.04)', edge: 'rgba(16,16,28,0.34)' }
  };
  function drawInteriorLight(ctx, map, cam) {
    if (!map.indoors) return;
    var L = LIGHT[map.music] || LIGHT.town;
    ctx.fillStyle = L.tint;
    ctx.fillRect(0, 0, G.SCREEN_W, G.SCREEN_H);
    // a blocky vignette: four bands, darkest at the frame
    var W2 = G.SCREEN_W, H2 = G.SCREEN_H;
    for (var b = 0; b < 3; b++) {
      ctx.fillStyle = L.edge;
      var t = 6 + b * 5;
      ctx.fillRect(0, b * 5, W2, 5);
      ctx.fillRect(0, H2 - (b + 1) * 5, W2, 5);
      ctx.fillRect(b * 5, 0, 5, H2);
      ctx.fillRect(W2 - (b + 1) * 5, 0, 5, H2);
    }
    // pools of light under things that glow
    var rows = map.ground;
    if (!rows) return;
    var x0 = Math.max(0, Math.floor(cam.x / 16) - 1), y0 = Math.max(0, Math.floor(cam.y / 16) - 1);
    var x1 = Math.min(map.w - 1, x0 + 17), y1 = Math.min(map.h - 1, y0 + 12);
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        var nm = map.legend[rows[y][x]];
        if (nm !== 'ihealm' && nm !== 'lamp' && nm !== 'imach') continue;
        var px = x * 16 - cam.x + 8, py = y * 16 - cam.y + 12;
        for (var r = 3; r >= 1; r--) {
          ctx.fillStyle = 'rgba(255,220,150,' + (0.05 * r).toFixed(2) + ')';
          ctx.fillRect(px - r * 8, py - r * 6, r * 16, r * 12);
        }
      }
    }
  }


  // ------------------------------------------------------- town cards ------
  // The plaque that slides in when you walk into a town. It is pure
  // atmosphere and it is the cheapest atmosphere in the medium: arriving
  // somewhere should be an event, and until now Pallet and Saffron announced
  // themselves identically, which is to say not at all.
  //
  // It shows once per town per visit, never on a route, never indoors, and
  // never twice in a row — walking in and out of a Centre should not re-announce
  // the town you are standing in.
  var townCard = null;
  var lastCardMap = null;

  G.SLOGANS = {
    pallet: 'A quiet place with clean air',
    viridian: 'The eternally green paradise',
    pewter: 'A stone grey city',
    cerulean: 'A mysterious blue aura surrounds it',
    vermilion: 'The port of exquisite sunsets',
    lavender: 'The noble purple town',
    celadon: 'The city of rainbow dreams',
    saffron: 'Shining, golden land of commerce',
    fuchsia: 'Behold! It is passion and pride',
    cinnabar: 'The fiery town of burning desire',
    indigo: 'The final stop'
  };

  G.showTownCard = function (map) {
    if (!map || map.indoors || map.music !== 'town') { return; }
    if (lastCardMap === map.id) return;
    lastCardMap = map.id;
    townCard = { t: 0, name: map.name, sub: G.SLOGANS[map.id] || '' };
  };

  function drawTownCard(ctx) {
    if (!townCard) return;
    var IN = 16, HOLD = 96, OUT = 20;
    var t = townCard.t++;
    if (t > IN + HOLD + OUT) { townCard = null; return; }
    // slide in from the left, hold, slide out — eased so it settles rather
    // than snapping
    var k = t < IN ? t / IN : t < IN + HOLD ? 1 : 1 - (t - IN - HOLD) / OUT;
    var ease = 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
    var w = 4 + G.textWidth(townCard.name) + 14;
    var sub = townCard.sub;
    if (sub) w = Math.max(w, G.textWidth(sub) + 18);
    var h = sub ? 30 : 20;
    var x = Math.round(-w + (w + 8) * ease), y = 12;

    ctx.fillStyle = 'rgba(20,22,38,0.86)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#f8e878';
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x + w - 1, y, 1, h);
    G.text(ctx, townCard.name.toUpperCase(), x + 8, y + 5, G.C.white, '#1a1c2c');
    if (sub) G.text(ctx, sub, x + 8, y + 17, '#c2c2d6', '#1a1c2c');
  }


  // How much ambient motion the world is allowed. Everything that moves on its
  // own — grass, water, weather, parallax, foam — multiplies its rate by this,
  // so one setting calms the whole game rather than the player hunting through
  // a list of toggles.
  //
  //   Full     1.0   as authored
  //   Calm     0.45  everything at roughly half speed
  //   Still    0     nothing ambient animates at all; the world holds a pose
  //
  // The default is taken from the operating system's own reduced-motion
  // preference the first time the game runs, because somebody who has already
  // told their computer they get motion sick should not have to tell us too.
  var MOTION_RATE = { Full: 1, Calm: 0.45, Still: 0 };

  G.motionSetting = function () {
    var o = (G.player && G.player.options) || {};
    if (o.motion) return o.motion;
    var reduced = false;
    try {
      reduced = typeof window !== 'undefined' && window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { reduced = false; }
    return reduced ? 'Calm' : 'Full';
  };

  // Multiplier for anything measured in FRAMES PER STEP: bigger is slower, so
  // a rate of 0 means "never advance".
  G.motionScale = function () {
    var r = MOTION_RATE[G.motionSetting()];
    return r === 0 ? 0 : 1 / r;
  };

  // Multiplier for anything measured in PIXELS PER FRAME: smaller is slower.
  G.motionSpeed = function () { return MOTION_RATE[G.motionSetting()]; };

  function drawMapWeather(ctx, kind) {
    var ms = G.motionSpeed();
    var f = G.frame * ms * 0.55, W = G.SCREEN_W, H = G.SCREEN_H, i;
    if (kind === 'sun') {
      ctx.fillStyle = 'rgba(255,224,140,0.10)';
      ctx.fillRect(0, 0, W, H);
    } else if (kind === 'rain') {
      ctx.fillStyle = 'rgba(34,52,98,0.16)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(176,202,255,0.5)';
      for (i = 0; i < 48; i++) {
        var rx = (i * 53 + f * 7) % (W + 20) - 10;
        var ry = (i * 37 + f * 13) % (H + 20) - 10;
        ctx.fillRect(rx, ry, 1, 4);
      }
    } else if (kind === 'sand') {
      ctx.fillStyle = 'rgba(196,160,90,0.18)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(150,118,70,0.45)';
      for (i = 0; i < 60; i++) {
        var sx = (i * 71 + f * 10) % (W + 16) - 8;
        var sy = (i * 29 + ((i & 1) ? f * 2 : 0)) % H;
        ctx.fillRect(sx, sy, 2, 1);
      }
    }
  }

  // A type-colored gym badge: a colored disc (with a highlight + dark rim) that
  // marks a gym by its specialty type. Small floating ones sit over town gym
  // doors; a big one with the type name sits on the gym's battle floor.
  // A gym announces itself with a SIGNBOARD, not with a floating bubble.
  //
  // The old marker was an anti-aliased circle with a specular highlight,
  // hovering in the air over the door. Two things were wrong with it: circles
  // drawn with arc() are the only smooth edges in a game made entirely of
  // 16x16 pixel tiles, so it read as a cursor from a different program; and a
  // marker that floats is a HUD element, while a gym should be a building you
  // can see is a gym.
  //
  // This is a board on two brackets, bolted to the wall above the door: ink
  // outline, the specialty type as the field colour, a pale plate across the
  // middle for the lettering, and a bolt at each corner. Every edge is a
  // fillRect on a whole pixel.
  // A six-pixel mark per specialty, so a gym sign says WHICH gym from across
  // the street. Eight gyms, eight marks: a letter would collide (Fire and
  // Fighting, Grass and Ground, Poison and Psychic all share an initial) and a
  // colour alone is not enough for anyone who cannot separate the greens.
  var TYPE_GLYPH = {
    rock:     ['..xx..', '.xxxx.', 'xxxxxx', 'xxxxxx', '.xxxx.', '......'],
    water:    ['..xx..', '..xx..', '.xxxx.', 'xxxxxx', 'xxxxxx', '.xxxx.'],
    electric: ['...xx.', '..xx..', '.xxxx.', '..xx..', '.xx...', 'xx....'],
    grass:    ['....xx', '..xxxx', '.xxxx.', 'xxxx..', '.xx...', '.x....'],
    poison:   ['.xxxx.', 'xxxxxx', 'xx..xx', 'xxxxxx', '.xxxx.', '..xx..'],
    psychic:  ['.xxxx.', 'xx..xx', 'x.xx.x', 'x.xx.x', 'xx..xx', '.xxxx.'],
    fire:     ['...x..', '..xx..', '.xxxx.', 'xxxxxx', 'xxxxxx', '.xxxx.'],
    ground:   ['......', 'xxxxxx', 'xxxxxx', '..xx..', '.xxxx.', 'xxxxxx'],
    fighting: ['xxxxx.', 'xxxxxx', 'xxxxxx', '.xxxx.', '..xx..', '..xx..'],
    ice:      ['x.xx.x', '.xxxx.', 'xxxxxx', 'xxxxxx', '.xxxx.', 'x.xx.x']
  };
  function drawTypeGlyph(ctx, gx, gy, type, ink) {
    var rows = TYPE_GLYPH[type];
    if (!rows) return;
    ctx.fillStyle = ink;
    for (var r = 0; r < rows.length; r++) {
      for (var c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === 'x') ctx.fillRect(Math.round(gx) + c, Math.round(gy) + r, 1, 1);
      }
    }
  }

  function drawTypeBadge(ctx, cx, cy, type, big) {
    var col = (G.TYPE_COLORS && G.TYPE_COLORS[type]) || '#cccccc';
    var ink = G.C.ink || '#1a1c2c';
    var px = function (x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

    if (!big) {
      // Wider, and it says GYM. A coloured board with a symbol on it asks the
      // player to learn a code; a board with the word on it does not. The type
      // mark stays, to the left of the text, so the colour and the glyph both
      // still say WHICH gym — but nobody has to work out that the board means
      // "gym" in the first place.
      var lbl = 'GYM';
      var tw = G.textWidth(lbl);
      var bw = tw + 20, bh = 15, bx = cx - bw / 2, by = cy - bh / 2 - 4;
      px(bx + 6, by - 3, 2, 3, ink);            // brackets
      px(bx + bw - 8, by - 3, 2, 3, ink);
      px(bx - 1, by - 1, bw + 2, bh + 2, ink);  // outline
      px(bx, by, bw, bh, col);                  // the type is the colour
      px(bx, by, bw, 2, 'rgba(255,255,255,0.34)');       // lit top edge
      px(bx, by + bh - 2, bw, 2, 'rgba(0,0,0,0.28)');    // shaded lower edge
      px(bx + 2, by + 4, bw - 4, 8, 'rgba(20,22,38,0.62)');  // dark plate
      drawTypeGlyph(ctx, bx + 4, by + 5, type, G.C.white || '#f4f4f4');
      G.text(ctx, lbl, Math.round(bx + 12), Math.round(by + 4), G.C.white, ink);
      // four bolts
      px(bx + 1, by + 1, 1, 1, ink); px(bx + bw - 2, by + 1, 1, 1, ink);
      px(bx + 1, by + bh - 2, 1, 1, ink); px(bx + bw - 2, by + bh - 2, 1, 1, ink);
      return;
    }

    // The gym battle floor gets the same board, larger, with the type named.
    var lbl = type.toUpperCase();
    var lw = G.textWidth(lbl);
    var w2 = Math.max(46, lw + 14), h2 = 22;
    var x2 = cx - w2 / 2, y2 = cy - h2 / 2;
    px(x2 - 1, y2 - 1, w2 + 2, h2 + 2, ink);
    px(x2, y2, w2, h2, col);
    px(x2, y2, w2, 3, 'rgba(255,255,255,0.30)');
    px(x2, y2 + h2 - 3, w2, 3, 'rgba(0,0,0,0.26)');
    px(x2 + 3, y2 + 3, w2 - 6, h2 - 6, 'rgba(20,22,38,0.55)');
    G.text(ctx, lbl, Math.round(cx - lw / 2), Math.round(cy - 4), G.C.white, ink);
  }

  // Buildings cast a shadow onto the tile below their footing. Without it a
  // town is a flat pattern of coloured rectangles; with it the walls read as
  // standing UP off the ground, which is most of what makes a Game Boy town
  // look like a place rather than a floor plan.

  // Where the sea meets anything solid, it breaks. Without this a coast is a
  // hard edge between a blue region and a green one — the single clearest tell
  // that a map is a grid of tiles rather than a place. The foam is drawn per
  // EDGE rather than per tile, so a diagonal coastline gets a ragged line
  // instead of a staircase of identical sprites, and it advances on a slow
  // cycle so the sea looks like it is working.
  function drawShoreFoam(ctx, map, x0, y0, x1, y1, cam) {
    if (!map.ground) return;
    var isWater = function (x, y) {
      if (x < 0 || y < 0 || x >= map.w || y >= map.h) return false;
      var t = G.TILES[map.legend[map.ground[y][x]]];
      return !!(t && t.water);
    };
    var solidLand = function (x, y) {
      if (x < 0 || y < 0 || x >= map.w || y >= map.h) return false;
      var t = G.TILES[map.legend[map.ground[y][x]]];
      return !!t && !t.water;
    };
    var ms = G.motionSpeed();
    var phase = ms ? ((G.frame * ms) >> 4) % 4 : 0;
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        if (!isWater(x, y)) continue;
        var sx = x * 16 - cam.x, sy = y * 16 - cam.y;
        var seed = (x * 7 + y * 13) & 3;
        var lit = ((seed + phase) & 3) < 2;
        // Solid white and two pixels thick. The water tile is already heavily
        // speckled, so a thin translucent line vanished into its own texture —
        // the foam has to be the brightest thing on the tile to read as a
        // breaking edge rather than as more sparkle.
        var pale = lit ? '#ffffff' : '#d8eeff';
        var dim = lit ? '#bcdcf4' : '#a8cbe8';
        if (solidLand(x, y - 1)) {
          ctx.fillStyle = pale; ctx.fillRect(sx, sy, 16, 2);
          ctx.fillStyle = dim;  ctx.fillRect(sx + 2, sy + 2, 5, 1); ctx.fillRect(sx + 10, sy + 2, 4, 1);
        }
        if (solidLand(x, y + 1)) {
          ctx.fillStyle = pale; ctx.fillRect(sx, sy + 14, 16, 2);
          ctx.fillStyle = dim;  ctx.fillRect(sx + 3, sy + 13, 4, 1); ctx.fillRect(sx + 9, sy + 13, 5, 1);
        }
        if (solidLand(x - 1, y)) {
          ctx.fillStyle = pale; ctx.fillRect(sx, sy, 2, 16);
          ctx.fillStyle = dim;  ctx.fillRect(sx + 2, sy + 3, 1, 4); ctx.fillRect(sx + 2, sy + 10, 1, 4);
        }
        if (solidLand(x + 1, y)) {
          ctx.fillStyle = pale; ctx.fillRect(sx + 14, sy, 2, 16);
          ctx.fillStyle = dim;  ctx.fillRect(sx + 13, sy + 2, 1, 5); ctx.fillRect(sx + 13, sy + 9, 1, 4);
        }
      }
    }
  }

  function drawBuildingShadows(ctx, map, x0, y0, x1, y1, cam) {
    if (map.indoors || !map.ground) return;
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        var nm = map.legend[map.ground[y][x]];
        if (nm !== 'wall' && nm !== 'window' && nm !== 'door' && nm !== 'gdoor' && nm !== 'gymdoor') continue;
        if (y + 1 >= map.h) continue;
        var below = map.legend[map.ground[y + 1][x]];
        var bt = G.TILES[below];
        if (!bt || bt.solid) continue;          // only onto open ground
        var sx = x * 16 - cam.x, sy = (y + 1) * 16 - cam.y;
        ctx.fillStyle = 'rgba(24,28,44,0.26)';
        ctx.fillRect(sx, sy, 16, 4);
        ctx.fillStyle = 'rgba(24,28,44,0.13)';
        ctx.fillRect(sx, sy + 4, 16, 3);
      }
    }
  }

  // Tile-blocky cave darkness. `radius` is in TILES: 1 without FLASH, 3 with.
  // Drawn as full-alpha black outside the lit ring and a single dim band on
  // its edge, so the boundary is a visible staircase of squares.
  function drawDarkness(ctx, cam, radius) {
    var TILEPX = 16;
    var p = G.world.player;
    var px = G.world.pixelPos(p);
    var cx = Math.floor((px.x + 8) / TILEPX), cy = Math.floor((px.y + 8) / TILEPX);
    var x0 = Math.floor(cam.x / TILEPX) - 1, y0 = Math.floor(cam.y / TILEPX) - 1;
    var x1 = x0 + Math.ceil(G.SCREEN_W / TILEPX) + 2, y1 = y0 + Math.ceil(G.SCREEN_H / TILEPX) + 2;
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        var dx = Math.abs(x - cx), dy = Math.abs(y - cy);
        // A diamond rather than a square, which is the shape Gen 1's cave
        // lantern actually was, and softened over two rings instead of
        // stopping dead at one — a hard square edge reads as a bug.
        var d = Math.max(Math.max(dx, dy), Math.round((dx + dy) * 0.72));
        if (d <= radius - 1) continue;
        ctx.fillStyle = (d === radius) ? 'rgba(8,8,16,0.45)'
          : (d === radius + 1) ? 'rgba(6,6,12,0.82)' : '#06060c';
        ctx.fillRect(x * TILEPX - cam.x, y * TILEPX - cam.y, TILEPX, TILEPX);
      }
    }
  }

  // Walking is 1, running is 2, and the BICYCLE is 3 — which is the whole
  // reason the CYCLING ROAD questline exists and the reason a Kanto player
  // will cross the entire region to redeem one voucher. The inherited code
  // checked `bag.skates`, which is Hoenn's Mach Bike and which nothing in this
  // game ever grants, so the bicycle did nothing at all.
  G.moveSpeed = function () {
    if (!G.player) return 1;
    var bag = G.player.bag || {};
    if (G.player.onBike && bag.bicycle) return 3;
    // Running is something you are GIVEN, so that the first time you hold
    // shift there is a moment attached to it rather than a control you
    // happened to discover.
    return 1 + (G.input.held.run && bag.runningshoes ? 1 : 0);
  };

  // Footfall dust, drawn under the player. Kept in world space so it stays
  // put on the ground while the camera moves.
  G.dust = [];

  // --------------------------------------------------------- the follower --
  // Your POKéMON walking a tile behind you. Off by default, because it is not
  // a Gen 1 behaviour and this project is otherwise strict about that — but
  // available, because it is the best thing HeartGold ever added and the
  // battler sprites are already streaming for every species.
  //
  // The engine already had a follower for a story NPC ("Mom walks you to the
  // lab"), so this reuses that slot rather than adding a second system: it is
  // the same trailing actor with a creature sprite on it.
  G.followerSpecies = function () {
    var o = (G.player && G.player.options) || {};
    var party = (G.player && G.player.party) || [];
    if (o.follower !== 'Lead' && o.follower !== 'Choose') return null;
    var idx = o.follower === 'Choose' ? (o.followIdx || 0) : 0;
    var mon = party[idx] || party[0];
    if (!mon || mon.egg) return null;
    return mon;
  };

  G.refreshFollower = function () {
    var w = G.world;
    if (!w || !w.map) return;
    var mon = G.followerSpecies();
    // A story follower (Mom, a rival) always wins the slot.
    if (w.follower && w.follower.story) return;
    if (!mon || w.map.indoors) { if (w.follower && !w.follower.story) w.follower = null; return; }
    var p = w.player;
    if (!w.follower || w.follower.monKey !== mon.sp) {
      w.follower = makeActor('mon_' + mon.sp, p.x, p.y, p.dir);
      w.follower.monKey = mon.sp;
      // Every species has a follower sheet, so this is unconditional.
      if (!G.IMG['ch_mon_' + mon.sp + '_d0'] && G.gfx.loadFollowerSheet) {
        G.gfx.loadFollowerSheet(mon.sp);
      }
      w.follower.isMon = true;
      w.follower.obj = false;
      w.follower.onTalkEvent = 'followerTalk';
    }
  };

  G.world = {
    mapId: null, map: null,
    player: makeActor('player', 0, 0, 'down'),
    npcs: [],
    follower: null,

    loadMap: function (id, x, y, dir) {
      var map = G.MAPS[id];
      G.decorateMap(map);   // lazily scatter scenery (once per map)
      this.mapId = id;
      this.map = map;
      if (G.player) { // region-map exploration tracking
        if (!G.player.visited) G.player.visited = {};
        G.player.visited[id] = 1;
      }
      this.player.x = x; this.player.y = y;
      this.player.dir = dir || this.player.dir;
      this.player.moving = false; this.player.step = 0; this.player.hop = 0;
      // Arriving on a water tile means you arrived SURFING — the sea routes
      // have no beach to land on, so clearing the vehicle unconditionally
      // (which is what the inherited code did) dropped you into the ocean on
      // foot and wedged you there.
      var arriveDef = this.tileDefAt(x, y);
      this.player.vehicle = (arriveDef && arriveDef.water) ? 'swim' : null;
      this.npcs = [];
      var defs = (map.npcs || []).concat(map.trainers || []);
      for (var i = 0; i < defs.length; i++) {
        var d = defs[i];
        if (d.ifFlag && !G.flags[d.ifFlag]) continue;
        if (d.unlessFlag && G.flags[d.unlessFlag]) continue;
        var a = makeActor(d.sprite, d.x, d.y, d.dir || 'down');
        a.def = d;
        a.obj = !!d.obj;
        this.npcs.push(a);
      }
      if (map.music) G.audio.playMusic(map.music);
      if (G.updateFollower) G.updateFollower();
      if (G.refreshFollower) G.refreshFollower();
      if (G.showTownCard) G.showTownCard(map);

      // FLASH is the one HM with nothing to walk into. CUT has a tree, SURF
      // has water, STRENGTH has a boulder and FLY has the town map — so each
      // of those is reachable by doing the obvious thing at the obstacle. A
      // dark cave is not an obstacle you can face, and G.tryFlash was written
      // and then never called by anything, which left ROCK TUNNEL, all three
      // floors of VICTORY ROAD and CERULEAN CAVE pitch dark for good.
      //
      // The cave asks. Once you can answer yes, it stops asking.
      if (map.dark && !G.flags.flashOn && G.tryFlash && G.fieldUser) {
        var lamp = G.fieldUser('flash');
        if (!lamp.blocked) {
          G.ask('It is pitch dark in here. Use FLASH?', function () { G.tryFlash(); });
        } else {
          G.pushScene(G.Textbox('It is pitch dark — you can barely see a step ahead. ' +
            'A POKéMON that knows FLASH would help.'));
        }
      }
    },

    tileNameAt: function (layer, x, y) {
      var map = this.map;
      if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
      // HM edits (a felled tree, a shoved boulder) sit on top of the map data
      // rather than in it — see field.js for why. An edited tile replaces the
      // GROUND and clears whatever decoration was standing on it, so cutting a
      // tree does not leave its canopy hanging in the air.
      if (G.tileEditAt) {
        var edit = G.tileEditAt(this.mapId, x, y);
        if (edit) return layer === 'ground' ? edit : null;
      }
      var rows = map[layer];
      if (!rows) return null;
      var ch = rows[y][x];
      if (ch === '.' && layer !== 'ground') return null;
      var name = map.legend[ch];
      return name || null;
    },

    tileDefAt: function (x, y) {
      // deco overrides ground for gameplay properties
      var name = this.tileNameAt('deco', x, y) || this.tileNameAt('ground', x, y);
      return name ? G.TILES[name] : null;
    },

    // Called after an HM changes the map. The renderer reads the grid every
    // frame, so there is no cache to bust — but callers should not have to
    // know that, and a decorated map may need its scenery re-scattered.
    refreshTiles: function () {
      if (this.map && G.decorateMap) G.decorateMap(this.map);
    },

    npcAt: function (x, y) {
      for (var i = 0; i < this.npcs.length; i++) {
        var n = this.npcs[i];
        if (n.x === x && n.y === y) return n;
      }
      return null;
    },

    isBlocked: function (x, y) {
      var map = this.map;
      if (x < 0 || y < 0 || x >= map.w || y >= map.h) return true;
      var def = this.tileDefAt(x, y);
      if (!def || def.solid) return true;
      if (def.ledge) return true; // ledges only crossed by hopping
      if (this.npcAt(x, y)) return true;
      if (this.itemAt(x, y)) return true;
      if (this.player.x === x && this.player.y === y) return true;
      return false;
    },

    warpAt: function (x, y) {
      var warps = this.map.warps || [];
      for (var i = 0; i < warps.length; i++) {
        if (warps[i].x === x && warps[i].y === y) return warps[i];
      }
      return null;
    },

    signAt: function (x, y) {
      var signs = this.map.signs || [];
      for (var i = 0; i < signs.length; i++) {
        if (signs[i].x === x && signs[i].y === y) return signs[i];
      }
      return null;
    },

    itemAt: function (x, y) {
      var items = this.map.items || [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.x === x && it.y === y && !G.flags[it.flag]) return it;
      }
      return null;
    },

    // A warp can require a flag. This is how the LEAGUE's doors work and how
    // CERULEAN CAVE stays shut: the tile is walkable, you can stand on it and
    // put your hand on the door, and it simply does not open. A wall would be
    // a level-design decision; a door that will not open is a statement.
    warpBlocked: function (w) {
      if (!w.needFlag) return false;
      var need = Array.isArray(w.needFlag) ? w.needFlag : [w.needFlag];
      var missing = need.filter(function (f) { return !G.flags[f]; });
      if (!missing.length) return false;
      G.audio.sfx('bump');
      G.pushScene(G.Textbox(w.deniedText ||
        'The door will not open. Whoever is in this room is still standing.'));
      return true;
    },

    warpTo: function (warp) {
      var self = this;
      var go = function () {
        G.pushScene(G.FadeScene(function () {
          self.loadMap(warp.to, warp.tx, warp.ty, warp.dir || self.player.dir);
        }));
      };
      // stepping through an actual door plays the open beat first; route/cave
      // edges just fade.
      var here = this.tileDefAt(this.player.x, this.player.y);
      if (here && here.door && G.DoorOpenScene) {
        G.audio.sfx('doorOpen');
        G.pushScene(G.DoorOpenScene(this.player.x, this.player.y, go));
      } else {
        go();
      }
    },

    pixelPos: function (a) {
      var px = a.x * TILE, py = a.y * TILE;
      if (a.moving) {
        var t = a.step / 16;
        px = G.lerp(a.fromX * TILE, a.x * TILE, t);
        py = G.lerp(a.fromY * TILE, a.y * TILE, t);
      } else if (a.hop > 0) {
        var ht = 1 - a.hop / a.hopTotal;
        px = G.lerp(a.fromX * TILE, a.x * TILE, ht);
        py = G.lerp(a.fromY * TILE, a.y * TILE, ht) - Math.sin(ht * Math.PI) * 10;
      }
      return { x: px, y: py };
    },

    camera: function () {
      var p = this.pixelPos(this.player);
      var mw = this.map.w * TILE, mh = this.map.h * TILE;
      var cx = Math.round(p.x) + 8 - G.SCREEN_W / 2;
      var cy = Math.round(p.y) + 8 - G.SCREEN_H / 2;
      cx = mw <= G.SCREEN_W ? (mw - G.SCREEN_W) / 2 : G.clamp(cx, 0, mw - G.SCREEN_W);
      cy = mh <= G.SCREEN_H ? (mh - G.SCREEN_H) / 2 : G.clamp(cy, 0, mh - G.SCREEN_H);
      return { x: Math.round(cx), y: Math.round(cy) };
    }
  };

  // ---------------------------------------------------------------------
  // The overworld scene (a singleton — pushed once, battles/menus stack over).
  // ---------------------------------------------------------------------
  G.overworldScene = {
    opaque: true,

    update: function () {
      var w = G.world, p = w.player;
      this._advanceFollower();

      if (p.hop > 0) {
        p.hop--;
        if (p.hop === 0) this._stepDone();
        return;
      }

      if (p.moving) {
        // base 1; +1 holding Shift (run); +1 if carrying Skates (auto-fast)
        var spd = G.moveSpeed();
        p.step += spd;
        if (p.step >= 16) {
          p.moving = false;
          p.step = 0;
          this._stepDone();
        }
        return;
      }
      if (p.bumpCool > 0) p.bumpCool--;

      // idle: interactions first
      if (G.input.justPressed('A')) { this._interact(); return; }
      if (G.input.justPressed('start') && G.StartMenu) {
        G.audio.sfx('confirm');
        G.pushScene(G.StartMenu());
        return;
      }

      var dir = G.input.heldDir();
      if (!dir) { p.turnLock = 0; return; }

      if (dir !== p.dir) {
        p.dir = dir;
        p.turnLock = 2; // brief face-first beat; keep holding to step
        return;
      }
      if (p.turnLock > 0) { p.turnLock--; return; }

      var d = G.DIRS[dir];
      var nx = p.x + d.dx, ny = p.y + d.dy;
      var destDef = w.tileDefAt(nx, ny);

      // ledge hop: only in the ledge's hop direction
      if (destDef && destDef.ledge === dir) {
        p.fromX = p.x; p.fromY = p.y;
        p.x = nx + d.dx; p.y = ny + d.dy;
        p.hopTotal = p.hop = 22;
        p.stride = !p.stride;
        G.audio.sfx('ledgeHop');
        this._followerStepTo(p.fromX, p.fromY);
        return;
      }

      // water: on land you can't walk in (press Z to swim — a hint is shown);
      // while swimming/sailing, water is passable and reaching land disembarks.
      var destWater = !!(destDef && destDef.water);
      if (destWater && !p.vehicle) return;
      var blocked = (p.vehicle && destWater)
        ? ((nx < 0 || ny < 0 || nx >= w.map.w || ny >= w.map.h) || !!w.npcAt(nx, ny) || !!w.itemAt(nx, ny))
        : w.isBlocked(nx, ny);
      // Walking into a boulder with STRENGTH switched on shoves it one tile
      // and you follow it in — one press, one push, the way Gen 1 does it.
      if (blocked && destDef && destDef.strength && G.pushBoulder &&
          G.pushBoulder(nx, ny, d.dx, d.dy)) {
        blocked = false;
      }
      if (blocked) {
        if (!p.bumpCool) {
          G.audio.sfx('bump');
          p.bumpCool = 16;
        }
        return;
      }

      p.fromX = p.x; p.fromY = p.y;
      p.x = nx; p.y = ny;
      p.moving = true;
      p.step = 0;
      p.stride = !p.stride;
      this._followerStepTo(p.fromX, p.fromY);
    },

    // follower trails one tile behind: when the player vacates a tile, the
    // follower walks into it, animated in step with the player.
    _advanceFollower: function () {
      var f = G.world.follower;
      if (!f || !f.moving) return;
      var spd = G.moveSpeed();
      f.step += spd;
      if (f.step >= 16) { f.moving = false; f.step = 0; }
    },
    _followerStepTo: function (tx, ty) {
      var f = G.world.follower;
      if (!f || (f.x === tx && f.y === ty)) return;
      f.fromX = f.x; f.fromY = f.y;
      f.dir = tx > f.x ? 'right' : tx < f.x ? 'left' : ty > f.y ? 'down' : 'up';
      f.x = tx; f.y = ty;
      f.moving = true; f.step = 0; f.stride = !f.stride;
    },

    _stepDone: function () {
      var w = G.world, p = w.player;

      // swimming/sailing: stepping onto solid ground gets you out of the water
      if (p.vehicle) {
        var hd = w.tileDefAt(p.x, p.y);
        if (!(hd && hd.water)) p.vehicle = null;
      }

      // The SAFARI ZONE clock. It runs on STEPS, not on time, and it does not
      // run while you are indoors or talking — which is why the rest house in
      // the middle of the preserve matters and why everyone works that out at
      // about four hundred steps.
      if (w.map.safari && G.flags.safari_active) {
        G.player.safariSteps = Math.max(0, (G.player.safariSteps || 0) - 1);
        var left = G.player.safariSteps;
        if (left === 100 || left === 50 || left === 20) {
          G.pushScene(G.Textbox('A voice over the tannoy: "' + left + ' steps remaining!"'));
        }
        if (left === 0) {
          G.runEvent('safariTimeUp');
          return;
        }
      }

      // Stepping into tall grass rustles it. The encounter roll happens on
      // this same step, so the rustle is also the tell: something moved before
      // the screen did.
      // Five motes on EVERY step through a field is a continuous spray while
      // you cross it. Three, and only when the motion dial allows any.
      var gdef = w.tileDefAt(p.x, p.y);
      if (gdef && gdef.grass && !w.map.indoors && G.motionSpeed() > 0) {
        for (var gr = 0; gr < 3; gr++) {
          G.dust.push({
            x: p.x * 16 + 3 + gr * 3, y: p.y * 16 + 12 - (gr % 2) * 3,
            vy: -0.32 - (gr % 3) * 0.06, life: 12 + gr, max: 12 + gr, leaf: true
          });
        }
      }
      // The same tell everywhere else that can ambush you: cave floors, the
      // TOWER, the POWER PLANT, the MANSION. Ground that rolls an encounter
      // should say so underfoot, but in what it is actually made of — grit
      // scuffed loose, low and grey and settling, not leaves springing back.
      if (gdef && gdef.wild && !gdef.grass && G.motionSpeed() > 0) {
        for (var cg = 0; cg < 3; cg++) {
          G.dust.push({
            x: p.x * 16 + 4 + cg * 4, y: p.y * 16 + 14 - (cg % 2),
            vy: -0.12 - (cg % 3) * 0.04, life: 9 + cg, max: 9 + cg, grit: true
          });
        }
      }

      // Dust. Walking leaves none; running kicks up a little, the bicycle a
      // lot. It is the cheapest possible way to make speed READ rather than
      // merely be true.
      var spd = G.moveSpeed();
      if (spd > 1 && !w.map.indoors && !p.vehicle) {
        var def0 = w.tileDefAt(p.x, p.y);
        if (def0 && !def0.water) {
          for (var du = 0; du < (spd > 2 ? 3 : 2); du++) {
            G.dust.push({
              x: p.x * 16 + 8 + (du - 1) * 3, y: p.y * 16 + 15,
              vy: -0.18 - du * 0.05, life: 14 + du * 2, max: 14 + du * 2
            });
          }
        }
      }

      // Walking together. Every party member counts the step, and every so
      // often the distance turns into a little more trust — which is also the
      // number the career page reports as "walked with you".
      for (var wi = 0; wi < G.player.party.length; wi++) {
        var wm = G.player.party[wi];
        if (!wm || wm.egg) continue;
        wm.steps = (wm.steps || 0) + 1;
        if (wm.steps % 256 === 0 && G.addFriendship) G.addFriendship(wm, 1);
      }

      // repel ticks on every step, like the real thing
      if (G.player.repelSteps > 0) {
        G.player.repelSteps--;
        if (G.player.repelSteps === 0) {
          G.pushScene(G.Textbox('The Repel Mist wore off!'));
        }
      }

      // (Gen 1 has no breeding, so nothing warms as you walk. The step hook
      // stays because poison damage and the Safari step counter hang off it.)
      if (G.player.daycare && G.player.daycare.hatch > 0) G.player.daycare.hatch--;

      var warp = w.warpAt(p.x, p.y);
      if (warp) {
        if (w.warpBlocked(warp)) return;
        w.warpTo(warp);
        return;
      }

      // script triggers (event system arrives with the region build)
      var scripts = w.map.scripts || [];
      for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];
        var xs = Array.isArray(s.x) ? s.x : [s.x, s.x];
        if (p.x >= xs[0] && p.x <= xs[1] && p.y === s.y) {
          if (s.once && G.flags[s.once]) continue;
          if (s.ifFlag && !G.flags[s.ifFlag]) continue;
          // The trigger object goes with it. A script tile can then carry its
          // own parameters — ROUTE 23's checkpoints each hold the badge count
          // they enforce — instead of the event keeping a private table of
          // coordinates that has to be kept in step with the map by hand.
          if (G.EVENTS && G.EVENTS[s.run]) { G.runEvent(s.run, s); return; }
        }
      }

      if (this._trainerScan()) return;

      var def = w.tileDefAt(p.x, p.y);
      // tall grass rustles AND cave floors both roll wild encounters
      // `cavecalm` is the reason this reads `wild` and not the material. It
      // exists to be the one cave tile that does NOT ambush you — entrance
      // chambers, junctions, the tile you stand on to read a sign — and while
      // this asked whether the ground was cave-shaped, it ambushed you there
      // too, which is the exact opposite of what it was added for.
      if (def && def.wild && G.hooks.grassStep) {
        if (G.hooks.grassStep(w.map)) return;
      }
      // swimming through deep water can turn up water-types
      if (p.vehicle && def && def.water && G.hooks.waterStep) {
        if (G.hooks.waterStep(w.map)) return;
      }
      if (G.hooks.stepDone) G.hooks.stepDone(p.x, p.y);
    },

    // trainer line-of-sight scan: any undefeated trainer looking at the
    // player kicks off an engagement cutscene.
    _trainerScan: function () {
      var w = G.world, p = w.player;
      for (var i = 0; i < w.npcs.length; i++) {
        var n = w.npcs[i];
        var def = n.def;
        if (!def || !def.trainer || G.flags[def.trainer]) continue;
        var sight = def.sight || 4;
        var d = G.DIRS[n.dir];
        var dx = p.x - n.x, dy = p.y - n.y;
        if (d.dx !== 0) {
          if (dy !== 0 || dx * d.dx <= 0 || Math.abs(dx) > sight) continue;
        } else {
          if (dx !== 0 || dy * d.dy <= 0 || Math.abs(dy) > sight) continue;
        }
        // clear path between (exclusive)
        var blocked = false;
        var steps = Math.abs(dx + dy) - 1;
        for (var s = 1; s <= steps; s++) {
          var tx = n.x + d.dx * s, ty = n.y + d.dy * s;
          var tdef = w.tileDefAt(tx, ty);
          if (!tdef || tdef.solid || (w.npcAt(tx, ty) && w.npcAt(tx, ty) !== n)) { blocked = true; break; }
        }
        if (blocked) continue;
        G.runEventGen(this._engageGen(n, def));
        return true;
      }
      return false;
    },

    _engageGen: function (npcActor, def) {
      var trDef = G.TRAINERS[def.trainer];
      return function* () {
        yield { t: 'sfx', id: 'confirm' };
        yield { t: 'balloon', npc: npcActor };
        yield { t: 'npcApproach', npc: npcActor };
        yield { t: 'text', s: trDef.name + ': ' + trDef.intro };
        var result = { v: null };
        yield {
          t: 'custom',
          run: function (done) {
            G.startTrainerBattle(def.trainer, {
              onEnd: function (r) { result.v = r; done(); }
            });
          }
        };
        if (result.v === 'win' && def.after) {
          yield { t: 'text', s: trDef.name + ': ' + def.after };
        }
        // a trainer can fire a follow-up event on defeat (e.g. Champion -> HoF)
        if (result.v === 'win' && def.onWin && G.EVENTS && G.EVENTS[def.onWin]) {
          yield* G.EVENTS[def.onWin]();
        }
      };
    },

    _interact: function () {
      var w = G.world, p = w.player, self = this;
      var d = G.DIRS[p.dir];
      var fx = p.x + d.dx, fy = p.y + d.dy;

      // a tag-along follower (Mom / Remy): talk to them by turning to face them
      if (w.follower && fx === w.follower.x && fy === w.follower.y && w.follower.onTalkEvent) {
        w.follower.dir = G.OPPOSITE_DIR[p.dir];
        G.runEvent(w.follower.onTalkEvent);
        return;
      }

      // What talking to somebody does, wherever we found them.
      function talkTo(npc) {
        if (!npc.obj) npc.dir = G.OPPOSITE_DIR[p.dir]; // face the player
        if (G.hooks.interact && G.hooks.interact(npc)) return true;
        if (npc.def.trainer) {
          if (!G.flags[npc.def.trainer]) {
            G.runEventGen(self._engageGen(npc, npc.def));
          } else {
            G.audio.sfx('confirm');
            G.pushScene(G.Textbox(npc.def.beaten || G.TRAINERS[npc.def.trainer].defeat || '...'));
          }
          return true;
        }
        if (npc.def.event && G.EVENTS && G.EVENTS[npc.def.event]) { G.runEvent(npc.def.event); return true; }
        if (npc.def.dialog) {
          G.audio.sfx('confirm');
          G.pushScene(G.Textbox(npc.def.dialog));
          return true;
        }
        return true;
      }

      // Somebody on the tile you are actually facing, first and always.
      var faced = w.npcAt(fx, fy);
      if (faced && talkTo(faced)) return;

      // talk across counters: nurse/clerk stand one tile beyond the desk
      var facedName = w.tileNameAt('deco', fx, fy) || w.tileNameAt('ground', fx, fy);
      if (facedName === 'icounter') {
        var over = w.npcAt(fx + d.dx, fy + d.dy);
        if (over && talkTo(over)) return;
      }

      var item = w.itemAt(fx, fy);
      if (item) {
        G.flags[item.flag] = 1;
        G.player.bag[item.item] = (G.player.bag[item.item] || 0) + (item.qty || 1);
        G.audio.sfx('catchClick');
        var itemName = G.ITEMS[item.item].name + ((item.qty || 1) > 1 ? ' x' + item.qty : '');
        G.pushScene(G.Textbox('You found a ' + itemName + '!'));
        return;
      }

      var sign = w.signAt(fx, fy);
      if (sign) {
        G.audio.sfx('confirm');
        // A sign can be a thing you USE rather than a thing you read — the
        // storage PC on the Centre's back wall is one. The dry-run audit has
        // always looked for `event` on signs; nothing here ever dispatched it,
        // so the PC was a paragraph of text about a PC.
        if (sign.event && G.EVENTS && G.EVENTS[sign.event]) {
          G.runEvent(sign.event, sign);
          return;
        }
        G.pushScene(G.Textbox(sign.text));
        return;
      }

      // ---- HM obstacles ----
      // Facing one of these is the whole gating system of Kanto: a tree, a
      // boulder or a stretch of water is a locked door, and the key is an HM
      // plus the badge that licenses it.
      var fdef = w.tileDefAt(fx, fy);

      // Talking is forgiving: if the tile you are facing holds nothing at all,
      // anybody standing beside you will do, and you turn to them.
      //
      // This used to run BEFORE the item, sign and obstacle checks above, and
      // that made it greedy rather than forgiving — in ROCK TUNNEL, with a
      // beaten trainer to the north and an item ball to the west, facing the
      // ball and pressing A turned you round and replayed the trainer's
      // parting line. Every time. The ball could not be picked up at all.
      //
      // Nothing you are deliberately facing may lose to something you merely
      // happen to be standing next to.
      var facingSomething = (fdef && (fdef.story || fdef.cut || fdef.strength || fdef.water));
      if (!facingSomething) {
        var dirs = ['down', 'up', 'left', 'right'];
        for (var di = 0; di < dirs.length; di++) {
          var dd = G.DIRS[dirs[di]];
          var cand = w.npcAt(p.x + dd.dx, p.y + dd.dy);
          if (cand) {
            p.dir = dirs[di];                  // turn toward them
            if (talkTo(cand)) return;
            break;
          }
        }
      }
      // Some tiles ARE the interaction — BLAINE's quiz shutters answer to
      // being talked to, which is why walking up to one feels like being
      // asked a question rather than meeting a quizmaster.
      if (fdef && fdef.story && G.TILE_EVENTS) {
        var tname = w.tileNameAt('deco', fx, fy) || w.tileNameAt('ground', fx, fy);
        var ev = G.TILE_EVENTS[tname];
        if (ev && G.EVENTS[ev]) { G.runEvent(ev); return; }
      }
      if (fdef && fdef.cut && G.tryCut) { G.tryCut(fx, fy); return; }
      if (fdef && fdef.strength && G.tryStrength) { G.tryStrength(fx, fy); return; }

      // water's edge: SURF across it, or fish from the bank with a rod.
      // (No fishing while already surfing — you must cast from shore.)
      if (fdef && fdef.water && !p.vehicle) {
        var rods = ['superrod', 'goodrod', 'oldrod'].filter(function (r) {
          return G.player.bag && G.player.bag[r];
        });
        if (rods.length) {
          G.pushScene(G.Chooser({
            items: ['Surf', 'Fish', 'Cancel'], cancelIndex: 2,
            onPick: function (i) {
              if (i === 0) G.trySurf(fx, fy);
              else if (i === 1) G.fish(w.map, rods[0]);
            }
          }));
        } else {
          G.trySurf(fx, fy);
        }
        return;
      }

      // Forgiving follower chat: if there's nothing to interact with in the way
      // you're facing but your tag-along (Mom / Remy) is right beside you, turn
      // and talk to them. This means you never have to line up on a moving
      // follower — just press A while they're adjacent.
      if (w.follower && w.follower.onTalkEvent) {
        var fol = w.follower;
        if (Math.abs(fol.x - p.x) + Math.abs(fol.y - p.y) === 1) {
          p.dir = fol.x > p.x ? 'right' : fol.x < p.x ? 'left' : fol.y > p.y ? 'down' : 'up';
          fol.dir = G.OPPOSITE_DIR[p.dir];
          G.runEvent(w.follower.onTalkEvent);
          return;
        }
      }
    },

    draw: function (ctx) {
      var w = G.world, map = w.map;
      if (!map) return;
      var cam = w.camera();

      var x0 = Math.max(0, Math.floor(cam.x / TILE));
      var y0 = Math.max(0, Math.floor(cam.y / TILE));
      var x1 = Math.min(map.w - 1, Math.ceil((cam.x + G.SCREEN_W) / TILE));
      var y1 = Math.min(map.h - 1, Math.ceil((cam.y + G.SCREEN_H) / TILE));

      this._drawLayer(ctx, 'ground', x0, y0, x1, y1, cam);
      drawShoreFoam(ctx, map, x0, y0, x1, y1, cam);
      drawBuildingShadows(ctx, map, x0, y0, x1, y1, cam);
      this._drawLayer(ctx, 'deco', x0, y0, x1, y1, cam);

      // gym interiors are tinted their specialty type's color
      if (map.gymTint) {
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = map.gymTint;
        ctx.fillRect(0, 0, G.SCREEN_W, G.SCREEN_H);
        ctx.globalAlpha = 1;
      }

      // ground items (capture orbs lying around)
      var items = w.map.items || [];
      for (var ii = 0; ii < items.length; ii++) {
        if (G.flags[items[ii].flag]) continue;
        ctx.drawImage(G.IMG.orb_stand, items[ii].x * TILE - cam.x, items[ii].y * TILE - cam.y);
      }

      // dust first, so the player treads on top of it
      for (var dz = G.dust.length - 1; dz >= 0; dz--) {
        var dp = G.dust[dz];
        dp.y += dp.vy; dp.life--;
        if (dp.life <= 0) { G.dust.splice(dz, 1); continue; }
        var da = dp.life / dp.max;
        ctx.fillStyle = dp.leaf
          ? 'rgba(96,168,72,' + (da * 0.85).toFixed(2) + ')'
          // Cave grit: the colour of the rock it came off, and dimmer than
          // road dust, because underground there is nothing lighting it.
          : dp.grit
            ? 'rgba(150,142,158,' + (da * 0.6).toFixed(2) + ')'
            : 'rgba(226,214,186,' + (da * 0.7).toFixed(2) + ')';
        // Grit is chipped stone — it stays small instead of blooming.
        var dsz = dp.grit ? 1 : 1 + Math.round(da * 2);
        ctx.fillRect(Math.round(dp.x - cam.x), Math.round(dp.y - cam.y), dsz, dsz);
      }

      // entities, y-sorted
      var ents = [w.player].concat(w.npcs);
      if (w.follower) ents.push(w.follower);
      var self = this;
      ents.sort(function (a, b) { return w.pixelPos(a).y - w.pixelPos(b).y; });
      for (var i = 0; i < ents.length; i++) self._drawActor(ctx, ents[i], cam);

      this._drawLayer(ctx, 'over', x0, y0, x1, y1, cam);

      // Unlit caves. Without FLASH you see one tile around you and nothing
      // else, which is exactly as miserable as ROCK TUNNEL was in 1996 and
      // exactly as memorable. The mask is drawn in hard tile-sized blocks
      // rather than a soft radial gradient, because a smooth falloff reads as
      // a modern lighting effect and this should read as a Game Boy.
      // A radius of 1 lit the tile you were standing on and nothing else, so
      // ROCK TUNNEL was a 28x18 maze navigated by braille — you could not see
      // a wall until you had walked into it, let alone find the far exit. Two
      // is still oppressive and still makes FLASH the thing you want; it is
      // just possible to play without it.
      if (map.dark && !G.flags.flashOn) drawDarkness(ctx, cam, 2);
      else if (map.dark) drawDarkness(ctx, cam, 4);

      // interior lighting, then weather — both over the world, under the HUD
      drawInteriorLight(ctx, map, cam);
      if (map.weather) { drawMapWeather(ctx, map.weather); drawExtraWeather(ctx, map.weather); }

      // exit arrows over map-edge warps (route/town entrances), so the way
      // onward is obvious. Building doors are interior, so they're skipped.
      var warps = map.warps || [], seenW = {};
      for (var wi = 0; wi < warps.length; wi++) {
        var wp = warps[wi];
        var onEdge = wp.x === 0 || wp.y === 0 || wp.x === map.w - 1 || wp.y === map.h - 1;
        if (!onEdge) continue;
        var wk = wp.x + ',' + wp.y;
        if (seenW[wk]) continue; seenW[wk] = 1;
        var outDir = wp.x === 0 ? 'left' : wp.x === map.w - 1 ? 'right' : wp.y === 0 ? 'up' : 'down';
        drawExitArrow(ctx, wp.x * TILE - cam.x + 8, wp.y * TILE - cam.y + 8, outDir);
      }

      // gym type badge (over a town gym door, or big on the gym battle floor)
      if (map.gymEmblem) {
        var ge = map.gymEmblem;
        // No bob. A sign bolted to a wall does not bounce, and the bobbing
        // was what made the old marker read as a collectable.
        drawTypeBadge(ctx, ge.x * TILE - cam.x + 8, ge.y * TILE - cam.y + 8, ge.type, ge.big);
      }

      // swim hint: standing on land, facing deep water
      var pl = w.player;
      if (!pl.vehicle && !pl.moving) {
        var pd = G.DIRS[pl.dir];
        var wfx = pl.x + pd.dx, wfy = pl.y + pd.dy;
        var wfd = w.tileDefAt(wfx, wfy);
        if (wfd && wfd.water) {
          var hasRod = G.player.bag && (G.player.bag.oldrod || G.player.bag.goodrod || G.player.bag.superrod);
          var label = hasRod ? 'Z: Surf / Fish' : 'Z: Surf';
          var lw = G.textWidth(label) + 6;
          var lx = Math.round(wfx * TILE - cam.x + 8 - lw / 2);
          var ly = wfy * TILE - cam.y - 11;
          ctx.fillStyle = 'rgba(26,28,44,0.82)'; ctx.fillRect(lx, ly, lw, 11);
          G.text(ctx, label, lx + 3, ly + 2, '#7fdfff');
        }
      }

      drawTownCard(ctx);

      // The control hints used to live here, pinned to the corner for the
      // whole playthrough. They are in the menu under HELP now, and the field
      // is the world and nothing else.
    },

    _drawLayer: function (ctx, layer, x0, y0, x1, y1, cam) {
      var map = G.world.map;
      var rows = map[layer];
      if (!rows) return;
      var baseImg = (layer === 'ground' && map.base) ? G.IMG[G.TILES[map.base].img] : null;
      for (var y = y0; y <= y1; y++) {
        for (var x = x0; x <= x1; x++) {
          var ch = rows[y][x];
          if (ch === '.' && layer !== 'ground') continue;
          var name = map.legend[ch];
          if (!name) continue;
          var def = G.TILES[name];
          if (!def) continue;
          // base tile under everything so art with transparency sits on
          // grass/floor instead of the void
          if (baseImg && name !== map.base) ctx.drawImage(baseImg, x * TILE - cam.x, y * TILE - cam.y);
          // Per-tile phase. Offsetting each tile by a hash of its position
          // turns a field that PULSES into a field that SHIMMERS: the same
          // number of pixels change per second, but they stop changing all at
          // once, and the eye reads it as texture instead of as a heartbeat.
          var img;
          if (def.anim) {
            var sp = def.animSpeed * (G.motionScale ? G.motionScale() : 1);
            if (sp <= 0) {
              img = G.IMG[def.anim[0]];                 // motion off: frame 0
            } else {
              var phase = ((x * 5 + y * 11) % def.anim.length) * (sp / def.anim.length);
              img = G.IMG[def.anim[(((G.frame + phase) / sp) | 0) % def.anim.length]];
            }
          } else {
            img = G.IMG[def.img];
          }
          ctx.drawImage(img, x * TILE - cam.x, y * TILE - cam.y);
        }
      }
    },

    _drawActor: function (ctx, a, cam) {
      var w = G.world;
      var pos = w.pixelPos(a);
      var sx = Math.round(pos.x) - cam.x, sy = Math.round(pos.y) - cam.y;

      var img;
      if (a.obj) {
        img = G.IMG[a.sprite];
        if (img) ctx.drawImage(img, sx, sy);
        return;
      }

      // A creature follower has no walk sheet — it uses its battler art,
      // shrunk to the tile and bobbing as it walks, which reads correctly at
      // this size and costs nothing extra to stream.
      if (a.isMon) {
        // The three complaints about the old follower were all the same bug:
        // it squashed a 96px battler into 18px (so no species was
        // recognisable), never flipped (so it always faced the same way), and
        // had no shadow or step (so it hovered).
        //
        // A real overworld sheet fixes all three at once, at native
        // resolution, facing the way it walks.
        var mbase = 'ch_mon_' + a.monKey + '_';
        if (G.IMG[mbase + 'd0']) {
          // Two frames per facing, alternating on the stride — the same walk
          // logic a person uses, so the creature steps rather than slides.
          var striding = a.moving && a.step < 8;
          var row = a.dir === 'up' ? 'u' : a.dir === 'down' ? 'd' : 's';
          var key = row + (striding && a.stride ? '1' : '0');
          var mimg = (a.dir === 'right' && G.IMG[mbase + key + '_flip'])
            ? G.IMG[mbase + key + '_flip'] : (G.IMG[mbase + key] || G.IMG[mbase + row + '0']);
          ctx.fillStyle = 'rgba(24,28,44,0.24)';
          ctx.fillRect(sx + 3, sy + 13, 10, 3);
          // 32px frames sit half a tile out on each side and stand on the
          // tile's floor rather than its top edge.
          ctx.drawImage(mimg, sx + Math.round((16 - mimg.width) / 2),
                        sy + 16 - mimg.height);
          return;
        }
        // No sheet ever drawn for this species: the battler, but half again as
        // big so its silhouette reads, flipped to face its direction of
        // travel, and standing on a shadow so it has weight.
        var mi = G.IMG['mon_' + a.monKey];
        if (mi) {
          var mb = (a.moving && (a.step >> 2) % 2) ? 1 : 0;
          var S = 24;
          ctx.fillStyle = 'rgba(24,28,44,0.24)';
          ctx.fillRect(sx + 2, sy + 13, 12, 3);
          if (a.dir === 'right') {
            ctx.save();
            ctx.translate(sx * 2 + S - 8, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(mi, sx - 4, sy - 5 - mb, S, S);
            ctx.restore();
          } else {
            ctx.drawImage(mi, sx - 4, sy - 5 - mb, S, S);
          }
          return;
        }
      }

      img = this._actorImage(a);

      // SWIMMING: body submerged — only head shows, arms stroke, legs kick.
      if (a === w.player && a.vehicle === 'swim') {
        // FireRed's surf sheet draws the rider AND the mount together in a
        // 32px frame, so it is offset half a tile left and up to sit centred
        // on the tile the player occupies.
        if (G.IMG.ch_playersurf_d0 && img) {
          ctx.drawImage(img, sx - 8, sy - 8);
          return;
        }
        this._drawSwimmer(ctx, img, sx, sy);
        return;
      }
      if (a === w.player && G.player && G.player.onBike && G.IMG.ch_playerbike_d0 && img) {
        ctx.drawImage(img, sx - 8, sy - 8);
        return;
      }

      var yoff = -8; // 8px head overhang
      if (a === w.player && a.vehicle === 'boat') {
        var bob = Math.round(Math.sin(G.frame * 0.22));
        if (G.IMG.fx_boat) ctx.drawImage(G.IMG.fx_boat, sx, sy + bob);
        yoff = -8 + bob; // sit in the boat
      }
      // water reflection: when water sits directly south, mirror the actor down
      // into it — vertically flipped with feet at the shoreline, translucent so
      // the water tints it, and gently swaying like the GBA reflections.
      var below = w.tileDefAt(a.x, a.y + 1);
      if (img && a.hop === 0 && below && below.water) {
        var sway = Math.sin(G.frame * 0.06 + a.x) * 1.1;
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.translate(0, 2 * (sy + 16));
        ctx.scale(1, -1);
        ctx.drawImage(img, sx + sway, sy + yoff);
        ctx.restore();
      }

      if (img) ctx.drawImage(img, sx, sy + yoff);

      // ledge-hop landing dust: a little tan puff kicked up at the touch-down
      // tile over the last few frames of the hop (the Emerald hop-land beat).
      if (a.hop > 0 && a.hop <= 9) {
        var dt = (9 - a.hop) / 9;                       // 0 -> 1 as you settle
        var dxp = a.x * TILE - cam.x + 8, dyp = a.y * TILE - cam.y + 15;
        var sp = 2 + dt * 6;
        ctx.fillStyle = 'rgba(236,228,196,' + (0.55 * (1 - dt)).toFixed(2) + ')';
        ctx.fillRect(Math.round(dxp - sp), dyp, 2, 1);
        ctx.fillRect(Math.round(dxp + sp - 2), dyp, 2, 1);
        ctx.fillRect(Math.round(dxp - sp * 0.5), dyp - 1, 1, 1);
        ctx.fillRect(Math.round(dxp + sp * 0.5 - 1), dyp - 1, 1, 1);
      }

      // grass rustle over feet
      var def = w.tileDefAt(a.x, a.y);
      if (def && def.grass && !a.moving && a.hop === 0) {
        ctx.drawImage(G.IMG.fx_rustle, a.x * TILE - cam.x, a.y * TILE - cam.y);
      }
    },

    // Surfing: the player rides on a rounded blue Water-type that bobs on the
    // swell with a wake trailing behind — rather than swimming submerged.
    _drawSwimmer: function (ctx, img, sx, sy) {
      var bob = Math.round(Math.sin(G.frame * 0.12) * 1.2);
      var cx = sx + 8, my = sy + 10 + bob;
      function el(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
      // trailing wake ripple
      var rt = (G.frame % 30) / 30;
      ctx.strokeStyle = 'rgba(240,248,255,' + (0.45 * (1 - rt)).toFixed(2) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, my + 5, 7 + rt * 6, 2.5 + rt * 2, 0, 0, Math.PI * 2); ctx.stroke();
      // the mount — ink outline, blue body, a lighter crest and a cyan glint
      ctx.fillStyle = G.C.ink;  el(cx, my, 10.5, 6.5);
      ctx.fillStyle = G.C.blu1; el(cx, my, 9.5, 5.5);
      ctx.fillStyle = G.C.blu2; el(cx - 1, my - 1.5, 7, 3);
      ctx.fillStyle = G.C.ice2; el(cx - 3.5, my - 2, 2.5, 1.3);
      // the rider: head + torso seated on the mount, legs tucked behind its body
      if (img) {
        ctx.save();
        ctx.beginPath(); ctx.rect(sx - 4, sy - 12, 24, (my - 3) - (sy - 12)); ctx.clip();
        ctx.drawImage(img, sx, sy - 9 + bob);
        ctx.restore();
      }
    },

    _actorImage: function (a) {
      var base = 'ch_' + a.sprite + '_';
      // The player has three sheets. Fall back to the walk sheet if a vehicle
      // sheet has not finished streaming, so a slow connection shows the
      // character walking on water rather than showing nothing at all.
      if (a === G.world.player) {
        if (a.vehicle === 'swim' && G.IMG.ch_playersurf_d0) base = 'ch_playersurf_';
        else if (G.player && G.player.onBike && G.player.bag && G.player.bag.bicycle
                 && G.IMG.ch_playerbike_d0) base = 'ch_playerbike_';
      }
      var striding = (a.moving && a.step < 8) || (a.hop > 0 && a.hop > a.hopTotal / 2);
      // Animation is LOCKED to the facing direction — front/back are never mirrored
      // (mirroring an asymmetric sprite makes it look like it turns each step).
      // A true 3-pose walk uses the real second stride (d2/u2/s2) when present;
      // otherwise it cycles stand <-> first stride. Right reuses the left frames
      // flipped, since for side-on movement the flip IS the facing direction.
      var has = function (k) { return !!G.IMG[base + k]; };
      var name;
      if (a.dir === 'down') name = !striding ? 'd0' : (a.stride ? 'd1' : (has('d2') ? 'd2' : 'd1'));
      else if (a.dir === 'up') name = !striding ? 'u0' : (a.stride ? 'u1' : (has('u2') ? 'u2' : 'u1'));
      else if (a.dir === 'left') name = !striding ? 's0' : (a.stride ? 's1' : (has('s2') ? 's2' : 's1'));
      else name = !striding ? 's0_flipped' : (a.stride ? 's1_flipped' : (has('s2') ? 's2_flipped' : 's1_flipped'));

      // resolve, falling back to standing frame for sprites without strides
      return this._resolve(base, name);
    },

    _resolve: function (base, name) {
      var flip = /_flipped$/.test(name);
      var plain = name.replace('_flipped', '');
      var key = base + plain + (flip ? '_flip' : '');
      if (G.IMG[key]) return G.IMG[key];
      key = base + plain;
      if (G.IMG[key]) return G.IMG[key];
      // stride frame missing -> standing frame of same direction
      var standKey = base + plain[0] + '0';
      if (flip && G.IMG[standKey + '_flip']) return G.IMG[standKey + '_flip'];
      return G.IMG[standKey];
    }
  };

  // -------------------------------------------------------------------------
  // Wild encounters + battle outcomes (glue between overworld and battle).
  // -------------------------------------------------------------------------
  var RARITY_W = { common: 100, uncommon: 40, rare: 12, elusive: 2, legendary: 0, starter: 0 };

  G.hooks.grassStep = function (map) {
    var enc = map.encounters;
    if (!enc || !G.player.party.length) return false;

    if (!G.chance(enc.rate || 0.1)) return false;

    var weighted = enc.table.map(function (e) {
      return { e: e, w: e.w || RARITY_W[G.SPECIES[e.sp].rarity] || 50 };
    });
    var pick = G.pickWeighted(weighted).e;
    var level = G.irandIn(pick.min, pick.max);

    // repel: suppress wilds at or below the lead's level
    var lead = null;
    for (var i = 0; i < G.player.party.length; i++) {
      if (G.player.party[i].curHp > 0) { lead = G.player.party[i]; break; }
    }
    if (G.player.repelSteps > 0 && lead && level <= lead.level) return false;

    var wild = G.makeMon(pick.sp, level);
    G.player.dexSeen[pick.sp] = 1;
    G.startBattle(
      { party: G.player.party, foes: [wild], wild: true, safari: !!map.safari },
      { bg: map.battleBg || 'meadow', onEnd: G.afterBattle }
    );
    return true;
  };

  // ---------------------------------------------------------------- water --
  // Gen 1 has three rods and they are three different items, not one item that
  // gets better. The OLD ROD catches Magikarp and nothing else, forever — it is
  // a joke the game plays on you, and the joke only works if it is never
  // quietly upgraded. The GOOD ROD is a real but narrow pool. Only the SUPER
  // ROD reaches the interesting water.
  var ROD_POOLS = {
    oldrod:  { lv: [5, 5],   pool: ['magikarp'] },
    goodrod: { lv: [10, 10], pool: ['poliwag', 'goldeen'] },
    superrod: null   // uses the area's own surf table, below
  };

  // The Super Rod's own tables per region band. Kanto's ROM keeps these per
  // map; this is the same set of species, grouped by where in the region you
  // are, which reads identically in play and is a fraction of the data.
  var SUPER_ROD = {
    fresh: ['poliwag', 'poliwhirl', 'goldeen', 'seaking', 'psyduck', 'slowpoke', 'krabby', 'kingler'],
    sea:   ['tentacool', 'tentacruel', 'staryu', 'horsea', 'shellder', 'krabby', 'goldeen', 'magikarp'],
    deep:  ['seadra', 'seaking', 'kingler', 'gyarados', 'dewgong', 'cloyster']
  };
  var SEA_MAPS = /^(route19|route20|route21|cinnabar|seafoam|fuchsia|vermilion|pallet)/;

  function waterBand(map) {
    if (SEA_MAPS.test(map.id || '')) return 'sea';
    return 'fresh';
  }

  function areaLevel(map, lo, hi) {
    var t = map.encounters && map.encounters.table;
    if (t && t.length) {
      return G.irandIn(
        Math.min.apply(null, t.map(function (e) { return e.min; })),
        Math.max.apply(null, t.map(function (e) { return e.max; }))
      );
    }
    var b = (G.player.badges || []).filter(Boolean).length;
    return G.irandIn(lo != null ? lo : 5 + b * 4, hi != null ? hi : 9 + b * 4);
  }

  G.fish = function (map, rodId) {
    rodId = rodId || 'oldrod';
    if (!G.player.party.length) { G.pushScene(G.Textbox('You need a POKéMON with you to fish.')); return; }
    G.audio.sfx('confirm');
    // Better rods bite more often. The Old Rod's low rate is the other half of
    // its joke: you wait, and then it is a Magikarp anyway.
    var biteChance = rodId === 'superrod' ? 0.75 : rodId === 'goodrod' ? 0.6 : 0.45;
    if (!G.chance(biteChance)) { G.pushScene(G.Textbox('... Not even a nibble.')); return; }

    var key, lv;
    if (rodId === 'superrod') {
      var band = waterBand(map);
      var pool = SUPER_ROD[band].filter(function (k) { return G.SPECIES[k]; });
      if (G.chance(0.08)) pool = SUPER_ROD.deep.filter(function (k) { return G.SPECIES[k]; });
      key = G.pick(pool);
      lv = areaLevel(map, 15, 35);
    } else {
      var cfg = ROD_POOLS[rodId] || ROD_POOLS.oldrod;
      key = G.pick(cfg.pool.filter(function (k) { return G.SPECIES[k]; }));
      lv = G.irandIn(cfg.lv[0], cfg.lv[1]);
    }
    if (!key) { G.pushScene(G.Textbox('... Not even a nibble.')); return; }

    var wild = G.makeMon(key, lv);
    G.player.dexSeen[key] = 1;
    G.pushScene(G.Textbox('Oh! A bite!', { onDone: function () {
      G.startBattle(
        { party: G.player.party, foes: [wild], wild: true },
        { bg: 'water', onEnd: G.afterBattle }
      );
    } }));
  };

  // SURF encounters. Every water map in the ROM carries its own surf table, and
  // the generator emitted them as `encounters.water` — so this uses the real
  // numbers wherever they exist and only falls back to a generic sea pool for
  // the odd pond nobody tabulated.
  G.hooks.waterStep = function (map) {
    if (!G.player.party.length || G.player.repelSteps > 0) return false;
    var tbl = map.encounters && map.encounters.water;
    if (!tbl) tbl = (G.ENCOUNTERS.searoutes || {}).water;
    if (!tbl || !tbl.table || !tbl.table.length) return false;
    if (!G.chance(tbl.rate || 0.05)) return false;

    var weighted = tbl.table.map(function (e) { return { e: e, w: e.w || 50 }; });
    var pick = G.pickWeighted(weighted).e;
    var level = G.irandIn(pick.min, pick.max);

    var lead = null;
    for (var i = 0; i < G.player.party.length; i++) {
      if (G.player.party[i].curHp > 0) { lead = G.player.party[i]; break; }
    }
    if (G.player.repelSteps > 0 && lead && level <= lead.level) return false;

    var wild = G.makeMon(pick.sp, level);
    G.player.dexSeen[pick.sp] = 1;
    G.startBattle(
      { party: G.player.party, foes: [wild], wild: true },
      { bg: 'water', onEnd: G.afterBattle }
    );
    return true;
  };

  // shared post-battle handling (wild + trainer)
  G.afterBattle = function (result, battle) {
    if (G.world.map && G.world.map.music) G.audio.playMusic(G.world.map.music);

    if (result === 'caught' && battle.caughtMon) {
      var mon = battle.caughtMon;
      var firstCatch = !G.player.dexCaught[mon.sp];
      G.player.dexCaught[mon.sp] = 1;
      var nm = G.monName(mon);
      // A catch always succeeds, even with a full party. Afterward a screen asks
      // where it should go: into the party (swapping a member to the Lab if the
      // party is already 6), or straight to the storage PC. Party stays capped at 6.
      var toLab = function () { G.player.box.push(mon); G.pushScene(G.Textbox(nm + " was sent to the storage PC.")); };
      var toParty = function () {
        if (G.player.party.length < 6) {
          G.player.party.push(mon);
          G.pushScene(G.Textbox(nm + ' joined your party!'));
        } else {
          G.pushScene(G.PartyScene({
            pickMode: true, prompt: 'Party is full — send which one to the Lab?',
            onPick: function (idx) {
              if (idx < 0) { askWhere(); return; } // backed out — re-ask
              var out = G.player.party[idx];
              G.player.party[idx] = mon;
              G.player.box.push(out);
              G.pushScene(G.Textbox(G.monName(out) + " was sent to the Lab, and " + nm + ' joined the party!'));
            }
          }));
        }
      };
      var askWhere = function () {
        G.pushScene(G.Textbox('Where should ' + nm + ' go?', { onDone: function () {
          G.pushScene(G.Chooser({
            items: ['Add to party', "the storage PC"], cancelIndex: 1,
            onPick: function (i) { if (i === 0) toParty(); else toLab(); }
          }));
        } }));
      };
      askWhere();
      if (firstCatch && G.CaughtScene) G.pushScene(G.CaughtScene(mon)); // shows first
    }

    if (result === 'win' && battle.pendingEvolutions.length && G.EvolutionScene) {
      G.pushScene(G.EvolutionScene(battle.pendingEvolutions));
      return;
    }

    if (result === 'lose') {
      var lost = Math.floor(G.player.money / 2);
      G.player.money -= lost;
      for (var i = 0; i < G.player.party.length; i++) G.healMon(G.player.party[i]);
      var r = G.player.respawn;

      // Losing anywhere inside the LEAGUE puts the whole gauntlet back. You do
      // not get to bank LORELEI and come back for BRUNO tomorrow — the five
      // rooms are one fight with four intermissions, and that is the only
      // reason the ending has any weight to it at all.
      if (G.world.map && G.world.map.league) {
        ['e4_lorelei', 'e4_bruno', 'e4_agatha', 'e4_lance', 'e4_champion',
         'lorelei', 'bruno', 'agatha', 'lance', 'blue_champion'].forEach(function (f) {
          delete G.flags[f];
        });
        r = { mapId: 'indigo', x: 9, y: 16 };
      }
      G.pushScene(G.Textbox(
        ['You whited out!' + (lost ? ' You dropped $' + lost + ' in the panic...' : ''),
         'You scurried back to safety.'],
        { onDone: function () {
          G.pushScene(G.FadeScene(function () {
            G.world.loadMap(r.mapId, r.x, r.y, 'down');
          }));
        } }
      ));
    }
  };

  // Minimal event runner: generators yield {t:...} descriptors. The region
  // build (Phase 6) extends the descriptor set; this base handles text,
  // movement-free beats and battles wired in later.
  G.EVENTS = G.EVENTS || {};
  G.runEvent = function (id, ctx) {
    G.runEventGen(G.EVENTS[id], ctx);
  };
  G.runEventGen = function (genFn, ctx) {
    G.pushScene(G.EventScene(genFn(ctx)));
  };

  G.EventScene = function (gen) {
    var waiting = false;
    var balloon = null;   // {npc, t}
    var approach = null;  // {npc}
    return {
      opaque: false,
      update: function () {
        if (balloon) {
          balloon.t--;
          if (balloon.t <= 0) { balloon = null; waiting = false; }
          return;
        }
        if (approach) {
          var n = approach.npc, p = G.world.player;
          if (n.moving) {
            n.step++;
            if (n.step >= 16) { n.moving = false; n.step = 0; }
            return;
          }
          var dx = p.x - n.x, dy = p.y - n.y;
          if (Math.abs(dx) + Math.abs(dy) <= 1) {
            // face each other
            n.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
            p.dir = G.OPPOSITE_DIR[n.dir];
            approach = null;
            waiting = false;
            return;
          }
          var d = Math.abs(dx) > 0 && dy === 0
            ? (dx > 0 ? 'right' : 'left')
            : (dy > 0 ? 'down' : 'up');
          n.dir = d;
          n.fromX = n.x; n.fromY = n.y;
          n.x += G.DIRS[d].dx; n.y += G.DIRS[d].dy;
          n.moving = true; n.step = 0; n.stride = !n.stride;
          return;
        }
        if (waiting) return;
        var r = gen.next();
        if (r.done) { G.popScene(); return; }
        var step = r.value;
        if (!step) return;
        if (step.t === 'text') {
          waiting = true;
          G.pushScene(G.Textbox(step.s, { onDone: function () { waiting = false; } }));
        } else if (step.t === 'fn') {
          step.fn();
        } else if (step.t === 'balloon') {
          waiting = true;
          balloon = { npc: step.npc, t: 36 };
        } else if (step.t === 'npcApproach') {
          waiting = true;
          approach = { npc: step.npc };
        } else if (step.t === 'sfx') {
          G.audio.sfx(step.id);
        } else if (step.t === 'wait') {
          waiting = true;
          var nframes = step.frames;
          var timer = {
            opaque: false,
            update: function () { if (--nframes <= 0) { G.popScene(); waiting = false; } },
            draw: function () {}
          };
          G.pushScene(timer);
        } else if (step.t === 'custom') {
          waiting = true;
          step.run(function () { waiting = false; });
        }
      },
      draw: function (ctx) {
        if (balloon) {
          var cam = G.world.camera();
          var pos = G.world.pixelPos(balloon.npc);
          ctx.drawImage(G.IMG.ui_balloon, Math.round(pos.x) - cam.x, Math.round(pos.y) - cam.y - 24);
        }
      }
    };
  };
})();

