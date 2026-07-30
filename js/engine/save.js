// Pokéram — save.js
// Canonical player state + versioned localStorage persistence.

(function () {
  var KEY = 'pmgen3_save_v1';

  G.newGame = function (name) {
    G.player = {
      name: name || 'RAM',
      money: 1500,
      party: [],
      box: [],            // Birch's Lab storage (overflow beyond the party of 6)
      bag: { potion: 2, tameorb: 5 },
      badges: [false, false, false, false, false, false, false, false],
      dexSeen: {}, dexCaught: {},
      visited: {},        // mapId -> 1 once entered (region map shading)
      repelSteps: 0,
      playSeconds: 0,
      respawn: { mapId: 'playerhome', x: 4, y: 4 }
    };
    G.flags = {};
  };

  G.saveGame = function () {
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
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  };

  G.hasSave = function () {
    try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
  };

  G.loadGame = function () {
    var raw;
    try { raw = localStorage.getItem(KEY); } catch (e) { return false; }
    if (!raw) return false;
    var data;
    try { data = JSON.parse(raw); } catch (e) { return false; }
    if (data.ver !== 1) return false; // future: migrate(data)
    G.player = data.player;
    if (!G.player.box) G.player.box = [];          // back-compat for older saves
    if (!G.player.visited) G.player.visited = {};  // explored-map tracking
    G.flags = data.flags || {};
    if (G.applyCharacter) G.applyCharacter(G.player.charKey || 'brendan'); // restore chosen sprite
    if (data.muted && !G.audio.muted) G.audio.toggleMute();
    G.world.loadMap(data.pos.mapId, data.pos.x, data.pos.y, data.pos.dir);
    return true;
  };

  G.clearSave = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
  };

  // default state so debug/battle-test modes work without the title flow
  G.newGame();
})();
