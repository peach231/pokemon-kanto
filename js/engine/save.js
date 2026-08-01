// Pokéram — save.js
// Canonical player state + versioned localStorage persistence.
//
// THREE SLOTS. Red/Blue had one, because a cartridge is one cartridge, and
// this inherited that: a single key in localStorage, silently overwritten. It
// is the wrong trade on a machine where storage is free and the cost of the
// single slot is real — no second run with a different starter, no keeping a
// finished game beside a fresh one, and no way back if you save over something
// you wanted.

(function () {
  var LEGACY_KEY = 'pmkanto_save_v1';
  var KEY = 'pmkanto_save_v1_';

  G.SAVE_SLOTS = 3;
  G.currentSlot = 1;

  function slotKey(n) { return KEY + n; }

  G.newGame = function (name) {
    G.player = {
      name: name || 'RED',
      money: 3000,
      party: [],
      box: [],            // Bill's storage system (overflow beyond the party of 6)
      bag: { potion: 1 },   // Gen 1 starts you with almost nothing on purpose
      badges: [false, false, false, false, false, false, false, false],
      dexSeen: {}, dexCaught: {},
      visited: {},        // mapId -> 1 once entered (region map shading)
      repelSteps: 0,
      onBike: false,
      safariSteps: 0,
      tileEdits: {},      // felled trees and shoved boulders (see field.js)
      playSeconds: 0,
      respawn: { mapId: 'playerhome', x: 4, y: 7 }
    };
    G.flags = {};
  };

  G.saveGame = function (slot) {
    if (slot) G.currentSlot = slot;
    var w = G.world;
    var data = {
      ver: 1,
      savedAt: Date.now(),
      player: G.player,
      flags: G.flags,
      pos: { mapId: w.mapId, x: w.player.x, y: w.player.y, dir: w.player.dir },
      muted: G.audio.muted
    };
    try {
      localStorage.setItem(slotKey(G.currentSlot), JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  };

  function readSlot(n) {
    var raw;
    try { raw = localStorage.getItem(slotKey(n)); } catch (e) { return null; }
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  // Enough to describe a save WITHOUT loading it — what the slot screen reads.
  G.slotInfo = function (n) {
    var d = readSlot(n);
    if (!d || !d.player) return null;
    var p = d.player;
    var caught = 0;
    for (var k in (p.dexCaught || {})) if (p.dexCaught[k]) caught++;
    var map = G.MAPS && G.MAPS[(d.pos || {}).mapId];
    return {
      name: p.name || 'RED',
      badges: (p.badges || []).filter(Boolean).length,
      caught: caught,
      playSeconds: p.playSeconds || 0,
      lead: (p.party && p.party[0]) ? p.party[0] : null,
      where: (map && map.name) || (d.pos || {}).mapId || '',
      champion: !!(d.flags && d.flags.champion)
    };
  };

  G.anySave = function () {
    for (var n = 1; n <= G.SAVE_SLOTS; n++) if (G.slotInfo(n)) return true;
    return false;
  };

  // Kept for callers that only ask "is there anything to continue".
  G.hasSave = function (slot) {
    return slot ? !!G.slotInfo(slot) : G.anySave();
  };

  G.loadGame = function (slot) {
    var n = slot || G.currentSlot;
    var data = readSlot(n);
    if (!data) return false;
    if (data.ver !== 1) return false; // future: migrate(data)
    G.currentSlot = n;
    G.player = data.player;
    if (!G.player.box) G.player.box = [];          // back-compat for older saves
    if (!G.player.visited) G.player.visited = {};  // explored-map tracking
    if (!G.player.tileEdits) G.player.tileEdits = {}; // HM edits to the world
    if (G.player.playSeconds == null) G.player.playSeconds = 0;
    G.flags = data.flags || {};
    if (G.applyCharacter) G.applyCharacter(G.player.charKey || 'red'); // restore chosen sprite
    if (data.muted && !G.audio.muted) G.audio.toggleMute();
    G.world.loadMap(data.pos.mapId, data.pos.x, data.pos.y, data.pos.dir);
    return true;
  };

  G.clearSave = function (slot) {
    try { localStorage.removeItem(slotKey(slot || G.currentSlot)); } catch (e) {}
  };

  // h:mm, the way a POKéMON game reports it.
  G.playTimeText = function (secs) {
    secs = Math.max(0, Math.floor(secs || 0));
    var h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    return h + ':' + (m < 10 ? '0' : '') + m;
  };

  // A save written before slots existed lives under the old key. Move it into
  // slot 1 rather than stranding somebody's playthrough behind a rename.
  (function migrateLegacy() {
    try {
      var old = localStorage.getItem(LEGACY_KEY);
      if (old && !localStorage.getItem(slotKey(1))) {
        localStorage.setItem(slotKey(1), old);
        localStorage.removeItem(LEGACY_KEY);
      }
    } catch (e) {}
  })();

  // default state so debug/battle-test modes work without the title flow
  G.newGame();
})();
