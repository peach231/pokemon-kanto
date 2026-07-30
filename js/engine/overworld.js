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
    if (id === 'hearthvale') G.attachFollower('mom', 'momTalk', 'Mom');
    else if (id === 'route1' && G.flags.starter && !G.flags.friendGone && G.flags.remyGreetSeen) G.attachFollower('boy', 'friendHeal', 'Remy');
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

  G.decorateMap = function (map) {
    if (!map || map._decorated) return;
    map._decorated = true;
    if (map.legend !== G.LEG_EXT || !map.deco || !map.ground) return; // outdoor only
    var avoid = {};
    function mark(a) { (a || []).forEach(function (o) { avoid[o.x + ',' + o.y] = 1; }); }
    mark(map.warps); mark(map.signs); mark(map.items); mark(map.npcs); mark(map.trainers);
    // tropical region: palms everywhere, heavier on the coast; cinders at the volcano
    var bg = map.battleBg || 'meadow';
    // moderate density so towns/routes read as lived-in places, not bare fields
    var palette = map.volcano ? [['Z', 0.08], ['o', 0.05], ['Q', 0.02]]
      : bg === 'water' ? [['P', 0.07], ['H', 0.04], ['Q', 0.03], [',', 0.05]]
      : bg === 'cave' ? [['o', 0.07], ['Q', 0.03]]
      : bg === 'indoor' ? [['f', 0.06], ['y', 0.05], [',', 0.06]]
      : [['P', 0.03], ['f', 0.06], ['y', 0.045], [',', 0.06], ['Q', 0.03]]; // meadow/forest
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
  function drawMapWeather(ctx, kind) {
    var f = G.frame, W = G.SCREEN_W, H = G.SCREEN_H, i;
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
  function drawTypeBadge(ctx, cx, cy, type, big) {
    var col = (G.TYPE_COLORS && G.TYPE_COLORS[type]) || '#cccccc';
    var r = big ? 15 : 7;
    ctx.fillStyle = G.C.ink || '#1a1c2c';
    ctx.beginPath(); ctx.arc(cx, cy, r + 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(cx - r * 0.32, cy - r * 0.32, r * 0.42, 0, Math.PI * 2); ctx.fill();
    if (big) {
      var lbl = type.toUpperCase();
      var lw = G.textWidth(lbl);
      G.text(ctx, lbl, Math.round(cx - lw / 2), Math.round(cy + r + 4), G.C.white, G.C.ink);
    }
  }

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
      this.player.vehicle = null; // never start a new map mid-swim
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
    },

    tileNameAt: function (layer, x, y) {
      var map = this.map;
      if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
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
        var spd = 1 + (G.input.held.run ? 1 : 0) + ((G.player && G.player.bag && G.player.bag.skates) ? 1 : 0);
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
      var spd = 1 + (G.input.held.run ? 1 : 0) + ((G.player && G.player.bag && G.player.bag.skates) ? 1 : 0);
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

      // repel ticks on every step, like the real thing
      if (G.player.repelSteps > 0) {
        G.player.repelSteps--;
        if (G.player.repelSteps === 0) {
          G.pushScene(G.Textbox('The Repel Mist wore off!'));
        }
      }

      // eggs warm as you walk — a party egg hatches when its timer runs out;
      // an egg left with the Nursery just counts down for later collection.
      var party = G.player.party || [];
      for (var ei = 0; ei < party.length; ei++) {
        var egg = party[ei];
        if (egg.egg && egg.hatch > 0) {
          egg.hatch--;
          if (egg.hatch <= 0) {
            G.hatchEgg(egg);
            if (G.audio.playJingle) G.audio.playJingle('jingle_heal');
            G.pushScene(G.Textbox(['Huh? One of your EGGs is hatching!', 'It hatched into ' + G.monName(egg) + '!']));
            return;
          }
        }
      }
      if (G.player.daycare && G.player.daycare.hatch > 0) G.player.daycare.hatch--;

      var warp = w.warpAt(p.x, p.y);
      if (warp) { w.warpTo(warp); return; }

      // script triggers (event system arrives with the region build)
      var scripts = w.map.scripts || [];
      for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];
        var xs = Array.isArray(s.x) ? s.x : [s.x, s.x];
        if (p.x >= xs[0] && p.x <= xs[1] && p.y === s.y) {
          if (s.once && G.flags[s.once]) continue;
          if (s.ifFlag && !G.flags[s.ifFlag]) continue;
          if (G.EVENTS && G.EVENTS[s.run]) { G.runEvent(s.run); return; }
        }
      }

      if (this._trainerScan()) return;

      var def = w.tileDefAt(p.x, p.y);
      // tall grass rustles AND cave floors both roll wild encounters
      if (def && (def.grass || def.cave) && G.hooks.grassStep) {
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
      var w = G.world, p = w.player;
      var d = G.DIRS[p.dir];
      var fx = p.x + d.dx, fy = p.y + d.dy;

      // a tag-along follower (Mom / Remy): talk to them by turning to face them
      if (w.follower && fx === w.follower.x && fy === w.follower.y && w.follower.onTalkEvent) {
        w.follower.dir = G.OPPOSITE_DIR[p.dir];
        G.runEvent(w.follower.onTalkEvent);
        return;
      }

      // talking is forgiving: the faced tile first, then any adjacent side
      var npc = w.npcAt(fx, fy);
      if (!npc) {
        var dirs = ['down', 'up', 'left', 'right'];
        for (var di = 0; di < dirs.length; di++) {
          var dd = G.DIRS[dirs[di]];
          var cand = w.npcAt(p.x + dd.dx, p.y + dd.dy);
          if (cand) {
            npc = cand;
            p.dir = dirs[di]; // turn toward them
            break;
          }
        }
      }
      // talk across counters: nurse/clerk stand one tile beyond the desk
      if (!npc) {
        var facedName = w.tileNameAt('deco', fx, fy) || w.tileNameAt('ground', fx, fy);
        if (facedName === 'icounter') {
          npc = w.npcAt(fx + d.dx, fy + d.dy);
        }
      }
      if (npc) {
        if (!npc.obj) npc.dir = G.OPPOSITE_DIR[p.dir]; // face the player
        if (G.hooks.interact && G.hooks.interact(npc)) return;
        if (npc.def.trainer) {
          if (!G.flags[npc.def.trainer]) {
            G.runEventGen(this._engageGen(npc, npc.def));
          } else {
            G.audio.sfx('confirm');
            G.pushScene(G.Textbox(npc.def.beaten || G.TRAINERS[npc.def.trainer].defeat || '...'));
          }
          return;
        }
        if (npc.def.event && G.EVENTS && G.EVENTS[npc.def.event]) { G.runEvent(npc.def.event); return; }
        if (npc.def.dialog) {
          G.audio.sfx('confirm');
          G.pushScene(G.Textbox(npc.def.dialog));
        }
        return;
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
        G.pushScene(G.Textbox(sign.text));
        return;
      }

      // water's edge: from the BEACH you can swim out, or fish with a rod.
      // (No fishing while already swimming — you must cast from shore.)
      var fdef = w.tileDefAt(fx, fy);
      if (fdef && fdef.water && !p.vehicle) {
        var rod = G.player.bag && G.player.bag.fishingrod;
        var dive = function () {
          p.vehicle = 'swim';
          p.fromX = p.x; p.fromY = p.y; p.x = fx; p.y = fy;
          p.moving = true; p.step = 0; p.stride = !p.stride;
          G.audio.sfx('confirm');
        };
        if (rod) {
          G.pushScene(G.Chooser({
            items: ['Swim', 'Fish', 'Cancel'], cancelIndex: 2,
            onPick: function (i) { if (i === 0) dive(); else if (i === 1) G.fish(w.map); }
          }));
        } else {
          dive();
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

      // entities, y-sorted
      var ents = [w.player].concat(w.npcs);
      if (w.follower) ents.push(w.follower);
      var self = this;
      ents.sort(function (a, b) { return w.pixelPos(a).y - w.pixelPos(b).y; });
      for (var i = 0; i < ents.length; i++) self._drawActor(ctx, ents[i], cam);

      this._drawLayer(ctx, 'over', x0, y0, x1, y1, cam);

      // weather overlay (rain / sandstorm / harsh sun) — over the world, under HUD
      if (map.weather) drawMapWeather(ctx, map.weather);

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
        var gbob = ge.big ? 0 : Math.round(Math.sin(G.frame * 0.14) * 1);
        drawTypeBadge(ctx, ge.x * TILE - cam.x + 8, ge.y * TILE - cam.y + 8 + gbob, ge.type, ge.big);
      }

      // swim hint: standing on land, facing deep water
      var pl = w.player;
      if (!pl.vehicle && !pl.moving) {
        var pd = G.DIRS[pl.dir];
        var wfx = pl.x + pd.dx, wfy = pl.y + pd.dy;
        var wfd = w.tileDefAt(wfx, wfy);
        if (wfd && wfd.water) {
          var label = (G.player.bag && G.player.bag.fishingrod) ? 'Z: Swim / Fish' : 'Z: Swim';
          var lw = G.textWidth(label) + 6;
          var lx = Math.round(wfx * TILE - cam.x + 8 - lw / 2);
          var ly = wfy * TILE - cam.y - 11;
          ctx.fillStyle = 'rgba(26,28,44,0.82)'; ctx.fillRect(lx, ly, lw, 11);
          G.text(ctx, label, lx + 3, ly + 2, '#7fdfff');
        }
      }

      // controls hint — small + discreet, two tucked lines in the corner
      var hl1 = 'Z/Space talk  Shift run', hl2 = 'Del back  Enter menu';
      var hw = Math.max(G.textWidth(hl1), G.textWidth(hl2)) + 6;
      ctx.fillStyle = 'rgba(20,22,38,0.4)';
      ctx.fillRect(0, G.SCREEN_H - 19, hw, 19);
      G.text(ctx, hl1, 3, G.SCREEN_H - 17, G.C.lgry);
      G.text(ctx, hl2, 3, G.SCREEN_H - 8, G.C.lgry);
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
          var img = def.anim
            ? G.IMG[def.anim[(G.frame / def.animSpeed | 0) % def.anim.length]]
            : G.IMG[def.img];
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

      img = this._actorImage(a);

      // SWIMMING: body submerged — only head shows, arms stroke, legs kick.
      if (a === w.player && a.vehicle === 'swim') { this._drawSwimmer(ctx, img, sx, sy); return; }

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
      { party: G.player.party, foes: [wild], wild: true, weather: map.weather || null },
      { bg: map.battleBg || 'meadow', onEnd: G.afterBattle }
    );
    return true;
  };

  // Fishing: face water with the Fishing Rod to reel up a water-type wild. The
  // water pool is filtered to whatever's in the dex, so it scales as the dex grows.
  var WATER_POOL = ['magikarp', 'tentacool', 'wingull', 'marill', 'lotad', 'barboach', 'carvanha', 'wailmer',
    'corphish', 'goldeen', 'poliwag', 'horsea', 'staryu', 'remoraid', 'chinchou', 'psyduck', 'krabby',
    'shellder', 'qwilfish', 'wooper', 'slowpoke', 'tentacruel', 'seaking'];
  var WATER_RARE = ['gyarados', 'sharpedo', 'lanturn', 'huntail', 'gorebyss', 'kingdra', 'lapras', 'milotic'];

  G.fish = function (map) {
    if (!G.player.party.length) { G.pushScene(G.Textbox('You need a Pokémon with you to fish.')); return; }
    G.audio.sfx('confirm');
    if (!G.chance(0.72)) { G.pushScene(G.Textbox('... Not even a nibble.')); return; }
    var pool = WATER_POOL.filter(function (k) { return G.SPECIES[k]; });
    var rare = WATER_RARE.filter(function (k) { return G.SPECIES[k]; });
    if (!pool.length) { G.pushScene(G.Textbox('... Not even a nibble.')); return; }
    var key = (rare.length && G.chance(0.06)) ? G.pick(rare) : G.pick(pool);
    var lv;
    var t = map.encounters && map.encounters.table;
    if (t && t.length) {
      var lo = Math.min.apply(null, t.map(function (e) { return e.min; }));
      var hi = Math.max.apply(null, t.map(function (e) { return e.max; }));
      lv = G.irandIn(lo, hi);
    } else {
      var b = (G.player.badges || []).filter(Boolean).length;
      lv = G.irandIn(5 + b * 4, 9 + b * 4);
    }
    var wild = G.makeMon(key, lv);
    G.player.dexSeen[key] = 1;
    G.pushScene(G.Textbox('Oh! A bite!', { onDone: function () {
      G.startBattle(
        { party: G.player.party, foes: [wild], wild: true, weather: map.weather || null },
        { bg: 'water', onEnd: G.afterBattle }
      );
    } }));
  };

  // Swimming through deep water can turn up water-types (like surfing). Uses the
  // same water pool as fishing, scaled to the area's level band.
  G.hooks.waterStep = function (map) {
    if (!G.player.party.length || G.player.repelSteps > 0) return false;
    if (!G.chance(0.09)) return false;
    var pool = WATER_POOL.filter(function (k) { return G.SPECIES[k]; });
    var rare = WATER_RARE.filter(function (k) { return G.SPECIES[k]; });
    if (!pool.length) return false;
    var key = (rare.length && G.chance(0.05)) ? G.pick(rare) : G.pick(pool);
    var lv;
    var t = map.encounters && map.encounters.table;
    if (t && t.length) {
      var lo = Math.min.apply(null, t.map(function (e) { return e.min; }));
      var hi = Math.max.apply(null, t.map(function (e) { return e.max; }));
      lv = G.irandIn(lo, hi);
    } else {
      var b = (G.player.badges || []).filter(Boolean).length;
      lv = G.irandIn(5 + b * 4, 9 + b * 4);
    }
    var wild = G.makeMon(key, lv);
    G.player.dexSeen[key] = 1;
    G.startBattle(
      { party: G.player.party, foes: [wild], wild: true, weather: map.weather || null },
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
      // party is already 6), or straight to Birch's Lab. Party stays capped at 6.
      var toLab = function () { G.player.box.push(mon); G.pushScene(G.Textbox(nm + " was sent to Birch's Lab.")); };
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
            items: ['Add to party', "Birch's Lab"], cancelIndex: 1,
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
  G.runEvent = function (id) {
    G.runEventGen(G.EVENTS[id]);
  };
  G.runEventGen = function (genFn) {
    G.pushScene(G.EventScene(genFn()));
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

