// pokemon-kanto — field.js
// The five HM field moves, and the tile edits they make.
//
// Kanto is gated almost entirely by these. A Gen 1 map is not a corridor with
// a locked door at the end — it is an open region where three quarters of the
// exits are a tree, a boulder, a stretch of water or a dark room, and each one
// opens the moment you find the right HM AND the badge that licenses it.
// That is why the world map feels like it unfolds rather than unrolls.
//
// Every edit an HM makes to the map (a felled tree, a shoved boulder) lives in
// G.player.tileEdits, keyed by map and coordinate, NOT in the map data itself.
// The map objects are module-level singletons shared by every save slot; if we
// mutated them, starting a new game would begin with the previous game's trees
// already cut. The overlay is consulted by world.tileNameAt and dies with the
// save file it belongs to.

(function () {
  // ---------------------------------------------------------------- edits --
  G.tileEditKey = function (mapId, x, y) { return mapId + ':' + x + ',' + y; };

  G.tileEditAt = function (mapId, x, y) {
    var e = G.player && G.player.tileEdits;
    return (e && e[G.tileEditKey(mapId, x, y)]) || null;
  };

  G.setTileEdit = function (mapId, x, y, tileName) {
    if (!G.player.tileEdits) G.player.tileEdits = {};
    G.player.tileEdits[G.tileEditKey(mapId, x, y)] = tileName;
  };

  // ------------------------------------------------------------ usability --
  // Returns { mon } if the move can be used right now, or { blocked } saying
  // exactly why not. "You have the HM but not the badge" and "you have both
  // but nothing in the party knows it" are completely different problems for
  // the player, so they get completely different messages.
  G.fieldUser = function (kind) {
    var f = (G.FIELD_MOVES || {})[kind];
    if (!f) return { blocked: 'nohm', f: null };
    if (!(G.player.bag && G.player.bag[f.hm])) return { blocked: 'nohm', f: f };
    if (!G.flags[f.badge]) return { blocked: 'nobadge', f: f };
    var party = G.player.party || [];
    for (var i = 0; i < party.length; i++) {
      if (!party[i].egg && G.knowsMove(party[i], f.move)) return { mon: party[i], f: f };
    }
    return { blocked: 'nomon', f: f };
  };

  // The prompt shown when you walk into an obstacle you cannot yet clear.
  // Deliberately never says "you need HM01" — Gen 1 tells you what you are
  // looking at and lets you work out the rest.
  var FLAVOUR = {
    cut:      'A thin, spindly tree blocks the way. It looks like it could be CUT down.',
    surf:     'The water is deep and blue. Something could carry you across it.',
    strength: 'A boulder sits square in the path. It would take real STRENGTH to shift.',
    flash:    'It is pitch black in here.',
    // FLY is the only one of the five with no obstacle to walk into — it is
    // used from the TOWN MAP — so it had no line here and nothing ever asked
    // for one. The moment the map started explaining its refusals, every
    // message began with the word "undefined".
    fly:      'It is a long way, and the sky is open.'
  };

  // Which gym hands over which badge. Only used to finish the sentence below:
  // "you need the THUNDER BADGE" is a fact, and "LT. SURGE has it, in
  // VERMILION CITY" is directions, and the second is what a stuck player
  // actually needs.
  var BADGE_FROM = {
    badge1: 'BROCK, at the GYM in PEWTER CITY',
    badge2: 'MISTY, at the GYM in CERULEAN CITY',
    badge3: 'LT. SURGE, at the GYM in VERMILION CITY',
    badge4: 'ERIKA, at the GYM in CELADON CITY',
    badge5: 'KOGA, at the GYM in FUCHSIA CITY',
    badge6: 'SABRINA, at the GYM in SAFFRON CITY',
    badge7: 'BLAINE, at the GYM on CINNABAR ISLAND',
    badge8: 'GIOVANNI, at the GYM in VIRIDIAN CITY'
  };

  G.fieldBlockedText = function (kind, use) {
    var f = use.f;
    var lead = FLAVOUR[kind] || '';
    var join = lead ? lead + ' ' : '';
    if (use.blocked === 'nohm') return lead || 'Nothing happens.';
    if (use.blocked === 'nobadge') {
      var from = BADGE_FROM[f.badge];
      return join + 'You have the HM — but nobody will let you use it without the ' +
        f.badgeName + (from ? '. That one is ' + from + '.' : '.');
    }
    return join + 'None of your POKéMON knows ' + G.MOVES[f.move].name.toUpperCase() + '.';
  };

  // --------------------------------------------------------------- CUT ----
  // Fells the faced tree and leaves bare ground. The stump does not grow back,
  // because a shortcut you have to re-earn every time you walk through it is
  // not a shortcut.
  G.tryCut = function (fx, fy) {
    var w = G.world;
    var use = G.fieldUser('cut');
    if (use.blocked) { G.pushScene(G.Textbox(G.fieldBlockedText('cut', use))); return true; }
    var mon = use.mon;
    G.runEventGen((function* () {
      yield { t: 'text', s: 'This tree can be CUT down!' };
      yield { t: 'text', s: G.monName(mon) + ' used CUT!' };
      yield { t: 'sfx', id: 'confirm' };
      yield { t: 'fn', fn: function () {
        G.setTileEdit(w.mapId, fx, fy, w.map.base || 'grass');
        w.refreshTiles();
      } };
      yield { t: 'wait', frames: 10 };
    })());
    return true;
  };

  // ----------------------------------------------------------- STRENGTH ---
  // Gen 1 asks permission once and then lets you shove boulders for the rest
  // of the game, which is the right call: the confirmation is flavour the
  // first time and friction every time after.
  G.tryStrength = function (fx, fy) {
    var w = G.world, p = w.player;
    var use = G.fieldUser('strength');
    if (use.blocked) { G.pushScene(G.Textbox(G.fieldBlockedText('strength', use))); return true; }

    if (!G.flags.strengthOn) {
      var mon = use.mon;
      G.runEventGen((function* () {
        yield { t: 'text', s: 'A boulder. It might be moved with STRENGTH.' };
        yield { t: 'text', s: G.monName(mon) + ' used STRENGTH!' };
        yield { t: 'sfx', id: 'confirm' };
        yield { t: 'fn', fn: function () { G.flags.strengthOn = 1; } };
        yield { t: 'text', s: G.monName(mon) + ' can move boulders now. Walk into one to push it.' };
      })());
      return true;
    }
    // Already switched on: pushing happens through movement, not through A.
    G.pushScene(G.Textbox('The boulder will move if you push against it.'));
    return true;
  };

  // Called from the movement code when the player walks into a boulder.
  // Returns true if the boulder moved (and the player should follow it in).
  G.pushBoulder = function (bx, by, dx, dy) {
    var w = G.world;
    if (!G.flags.strengthOn) return false;
    var tx = bx + dx, ty = by + dy;
    if (tx < 0 || ty < 0 || tx >= w.map.w || ty >= w.map.h) return false;
    var dest = w.tileDefAt(tx, ty);
    if (!dest || dest.solid || dest.ledge || dest.water) return false;
    if (w.npcAt(tx, ty) || w.itemAt(tx, ty)) return false;
    // Boulders land ON the destination and leave the map's own floor behind.
    var under = w.tileNameAt('ground', tx, ty) || w.map.base;
    G.setTileEdit(w.mapId, bx, by, w.map.base || 'cavefloor');
    G.setTileEdit(w.mapId, tx, ty, 'boulder');
    if (!G.player.boulderUnder) G.player.boulderUnder = {};
    G.player.boulderUnder[G.tileEditKey(w.mapId, tx, ty)] = under;
    w.refreshTiles();
    G.audio.sfx('bump');
    return true;
  };

  // ---------------------------------------------------------------- SURF ---
  G.trySurf = function (fx, fy) {
    var w = G.world, p = w.player;
    var use = G.fieldUser('surf');
    if (use.blocked) { G.pushScene(G.Textbox(G.fieldBlockedText('surf', use))); return true; }
    var mon = use.mon;
    G.runEventGen((function* () {
      yield { t: 'text', s: 'The water is calm here. Would you like to SURF?' };
      yield { t: 'text', s: G.monName(mon) + ' used SURF!' };
      yield { t: 'sfx', id: 'confirm' };
      yield { t: 'fn', fn: function () {
        p.vehicle = 'swim';
        p.fromX = p.x; p.fromY = p.y; p.x = fx; p.y = fy;
        p.moving = true; p.step = 0; p.stride = !p.stride;
      } };
    })());
    return true;
  };

  // --------------------------------------------------------------- FLASH ---
  // Rock Tunnel and Victory Road are `dark: true`. Without FLASH you see one
  // tile in every direction, which is exactly as miserable as it was in 1996
  // and exactly as memorable.
  G.tryFlash = function () {
    var use = G.fieldUser('flash');
    if (use.blocked) { G.pushScene(G.Textbox(G.fieldBlockedText('flash', use))); return true; }
    if (G.flags.flashOn) { G.pushScene(G.Textbox('It is already bright in here.')); return true; }
    var mon = use.mon;
    G.runEventGen((function* () {
      yield { t: 'text', s: G.monName(mon) + ' used FLASH!' };
      yield { t: 'sfx', id: 'confirm' };
      yield { t: 'fn', fn: function () { G.flags.flashOn = 1; } };
      yield { t: 'text', s: 'The cave lit up around you.' };
    })());
    return true;
  };

  // ----------------------------------------------------------------- FLY ---
  // Destinations are the towns you have actually stood in. Flying to a place
  // you have only read about on the map would give away the geography.
  G.FLY_POINTS = {
    pallet:    { map: 'pallet',    x: 10, y: 15, label: 'Pallet Town' },
    viridian:  { map: 'viridian',  x: 12, y: 19, label: 'Viridian City' },
    pewter:    { map: 'pewter',    x: 12, y: 17, label: 'Pewter City' },
    cerulean:  { map: 'cerulean',  x: 13, y: 15, label: 'Cerulean City' },
    lavender:  { map: 'lavender',  x: 11, y: 13, label: 'Lavender Town' },
    vermilion: { map: 'vermilion', x: 12, y: 13, label: 'Vermilion City' },
    celadon:   { map: 'celadon',   x: 13, y: 13, label: 'Celadon City' },
    saffron:   { map: 'saffron',   x: 14, y: 8,  label: 'Saffron City' },
    fuchsia:   { map: 'fuchsia',   x: 13, y: 13, label: 'Fuchsia City' },
    cinnabar:  { map: 'cinnabar',  x: 11, y: 11, label: 'Cinnabar Island' },
    indigo:    { map: 'indigo',    x: 11, y: 17, label: 'Indigo Plateau' }
  };

  G.canFly = function () { return !G.fieldUser('fly').blocked; };

  G.flyTo = function (townId) {
    var pt = G.FLY_POINTS[townId];
    if (!pt) return false;
    var use = G.fieldUser('fly');
    if (use.blocked) return false;
    G.audio.sfx('confirm');
    G.popToOverworld();
    // The map swap happens at the top of the arc, behind the sky, so the world
    // changes while there is nothing on screen but weather. Without the
    // animation it is still just a load — the scene is the only thing that
    // makes FLY feel like crossing a region rather than a menu action.
    if (G.FlyScene) {
      G.pushScene(G.FlyScene(use.mon, pt.label, function () {
        G.world.loadMap(pt.map, pt.x, pt.y, 'down');
      }, function () {
        G.pushScene(G.Textbox(G.monName(use.mon) + ' flew you to ' + pt.label + '.'));
      }));
    } else {
      G.world.loadMap(pt.map, pt.x, pt.y, 'down');
      G.pushScene(G.Textbox(G.monName(use.mon) + ' flew you to ' + pt.label + '.'));
    }
    return true;
  };

  // ------------------------------------------------------- TM / HM usage ---
  // Teaching is its own scene chain: pick a target, then (if it already knows
  // four moves) pick what it forgets. A TM is destroyed on use; an HM is not.
  G.teachMachine = function (itemId) {
    var moveId = (G.TM_MOVES || {})[itemId];
    if (!moveId) return;
    var move = G.MOVES[moveId];
    var isHm = itemId.indexOf('hm') === 0;

    G.pushScene(G.PartyScene({
      pickMode: true,
      onPick: function (idx) {
        if (idx < 0) return;
        var mon = G.player.party[idx];
        if (mon.egg) { G.pushScene(G.Textbox('An EGG cannot learn anything.')); return; }
        if (!G.canLearnTm(mon, itemId)) {
          G.pushScene(G.Textbox(G.monName(mon) + ' is not compatible with ' + itemId.toUpperCase() + '.'));
          return;
        }
        if (G.knowsMove(mon, moveId)) {
          G.pushScene(G.Textbox(G.monName(mon) + ' already knows ' + move.name.toUpperCase() + '.'));
          return;
        }
        var consume = function () {
          if (!isHm) G.player.bag[itemId] = Math.max(0, (G.player.bag[itemId] || 1) - 1);
          if (!G.player.bag[itemId]) delete G.player.bag[itemId];
        };
        if (mon.moves.length < 4) {
          mon.moves.push({ id: moveId, pp: move.pp, maxPp: move.pp });
          if (isHm) { if (!mon.hmMoves) mon.hmMoves = {}; mon.hmMoves[moveId] = 1; }
          consume();
          G.audio.sfx('levelUp');
          G.pushScene(G.Textbox(G.monName(mon) + ' learned ' + move.name.toUpperCase() + '!'));
          return;
        }
        // Four moves already: something has to go. HMs cannot be the sacrifice.
        var names = mon.moves.map(function (m) {
          var locked = mon.hmMoves && mon.hmMoves[m.id];
          return G.MOVES[m.id].name + (locked ? ' *' : '');
        });
        names.push('Cancel');
        G.pushScene(G.Chooser({
          items: names, cancelIndex: names.length - 1,
          title: G.monName(mon) + ' — forget which move?',
          onPick: function (mi) {
            if (mi < 0 || mi >= mon.moves.length) return;
            var old = mon.moves[mi];
            if (mon.hmMoves && mon.hmMoves[old.id]) {
              G.pushScene(G.Textbox('HM moves cannot be forgotten.'));
              return;
            }
            var oldName = G.MOVES[old.id].name.toUpperCase();
            mon.moves[mi] = { id: moveId, pp: move.pp, maxPp: move.pp };
            if (isHm) { if (!mon.hmMoves) mon.hmMoves = {}; mon.hmMoves[moveId] = 1; }
            consume();
            G.audio.sfx('levelUp');
            G.pushScene(G.Textbox(G.monName(mon) + ' forgot ' + oldName +
              ' and learned ' + move.name.toUpperCase() + '!'));
          }
        }));
      }
    }));
  };
})();
