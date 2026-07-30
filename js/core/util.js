// Pokéram — util.js
// Global namespace + math/random helpers. Loaded first; every other file assigns onto G.
// Files avoid touching the DOM at load time so the data/logic layer can also run under Node
// (test harness shims `window`).

var G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});

G.clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
G.lerp = function (a, b, t) { return a + (b - a) * t; };

// ---------------------------------------------------------------------------
// Random numbers.
// G.rand() is the gameplay RNG. It is seedable so the headless battle sim can
// reproduce any fight; the live game reseeds from the clock at boot.
// ---------------------------------------------------------------------------
G._rngState = (Date.now() ^ 0x9e3779b9) >>> 0;

G.seedRng = function (seed) { G._rngState = (seed >>> 0) || 1; };

G.rand = function () { // mulberry32 — fast, decent quality, 32-bit state
  G._rngState = (G._rngState + 0x6D2B79F5) >>> 0;
  var t = G._rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

G.irand = function (n) { return Math.floor(G.rand() * n); };               // 0..n-1
G.irandIn = function (lo, hi) { return lo + G.irand(hi - lo + 1); };       // lo..hi inclusive
G.chance = function (p) { return G.rand() < p; };                          // p in 0..1
G.pick = function (arr) { return arr[G.irand(arr.length)]; };

// Weighted pick from [{w: weight, ...}, ...]
G.pickWeighted = function (arr, weightKey) {
  weightKey = weightKey || 'w';
  var total = 0, i;
  for (i = 0; i < arr.length; i++) total += arr[i][weightKey];
  var roll = G.rand() * total;
  for (i = 0; i < arr.length; i++) {
    roll -= arr[i][weightKey];
    if (roll < 0) return arr[i];
  }
  return arr[arr.length - 1];
};

G.deepClone = function (obj) { return JSON.parse(JSON.stringify(obj)); };

// Direction helpers shared by overworld actors.
G.DIRS = {
  down:  { dx: 0, dy: 1 },
  up:    { dx: 0, dy: -1 },
  left:  { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 }
};
G.OPPOSITE_DIR = { down: 'up', up: 'down', left: 'right', right: 'left' };
