// Scene fuzz: build every scene the game can show and hammer it with input.
//
// The name-entry freeze shipped because the first two screens a player touches
// had never been driven once. This drives all of them — menus, bag, party,
// summary, dex, region map, the PC, the slots, the Hall of Fame — with random
// button presses, and reports anything that throws.
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');

global.window = global;
global.window.addEventListener = function () {};
global.performance = { now: () => 0 };
global.requestAnimationFrame = function () {};
global.location = { hash: '' };

// A canvas context that accepts everything and draws nothing.
const CTX = new Proxy({}, {
  get(_t, k) {
    if (k === 'canvas') return { width: 240, height: 160 };
    if (k === 'measureText') return () => ({ width: 8 });
    if (k === 'createImageData') return (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h });
    if (k === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h });
    return () => {};
  },
  set() { return true; }
});
const CANVAS = { getContext: () => CTX, style: {}, width: 240, height: 160 };
global.document = { createElement: () => CANVAS, getElementById: () => CANVAS };

const srcs = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]).filter(s => s !== 'main.js');
for (const f of srcs) vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });

// every image the drawing code asks for resolves to a dummy
const IMG = new Proxy({}, { get: (t, k) => (k in t ? t[k] : CANVAS), set: (t, k, v) => (t[k] = v, true) });
G.IMG = IMG;

const BTNS = ['up', 'down', 'left', 'right', 'A', 'B', 'start', 'run'];
let pressed = null, repeat = null;
const DIRS = ['up', 'down', 'left', 'right'];
G.input = {
  held: {},
  justPressed: b => b === pressed,
  repeat: b => b === repeat || b === pressed,
  heldDir: () => (DIRS.indexOf(pressed) !== -1 ? pressed : null),
  step() {}
};
G.audio = { sfx() {}, playMusic() {}, playJingle() {}, toggleMute() {}, cry() {}, muted: false };
G.gfx.loadCharacter = () => {}; G.gfx.loadCharacterPreview = () => {};
G.gfx.loadWalkSheet = () => {}; G.gfx.loadBackPic = () => {};

function freshPlayer() {
  G.newGame('FUZZ');
  G.player.party = [G.makeMon('bulbasaur', 20), G.makeMon('pidgey', 14), G.makeMon('geodude', 12)];
  G.player.box = [G.makeMon('rattata', 5), G.makeMon('caterpie', 4)];
  G.player.bag = { potion: 3, pokeball: 5, hm01: 1, tm06: 1, firestone: 1, coincase: 1, escaperope: 1, rarecandy: 1 };
  G.player.coins = 500;
  G.player.money = 5000;
  for (const k of G.DEX_ORDER.slice(0, 40)) { G.player.dexSeen[k] = 1; if (Math.random() < 0.6) G.player.dexCaught[k] = 1; }
  G.world.loadMap('pallet', 10, 10, 'down');
}

const SEEDS = {
  BagScene:        () => G.BagScene(),
  PartyScene:      () => G.PartyScene({}),
  PartyPick:       () => G.PartyScene({ pickMode: true, onPick() {} }),
  SummaryScene:    () => G.SummaryScene(G.player.party[0]),
  DexScene:        () => G.DexScene(),
  RegionMapScene:  () => G.RegionMapScene(),
  PCScene:         () => G.PCScene && G.PCScene(),
  SlotScene:       () => G.SlotScene(),
  CharSelectScene: () => G.CharSelectScene(function () {}),
  NameEntryScene:  () => G.NameEntryScene('Red', function () {}),
  TitleScene:      () => G.TitleScene(),
  DemoBattleScene: () => G.DemoBattleScene(),
  HallOfFameScene: () => G.HallOfFameScene(function () {}),
  CaughtScene:     () => G.CaughtScene(G.makeMon('pikachu', 10)),
  StarterPreview:  () => G.StarterPreviewScene && G.StarterPreviewScene('bulbasaur', function () {}),
  Textbox:         () => G.Textbox(['A line of text.', 'And a second one that is quite a lot longer than the first, to push the wrapper.']),
  Chooser:         () => G.Chooser({ items: ['One', 'Two', 'Three'], onPick() {} }),
  EvolutionScene:  () => G.EvolutionScene([{ mon: G.player.party[0], to: 'ivysaur' }]),
  BattleWild:      () => G.BattleScene(new G.Battle({ party: G.player.party, foes: [G.makeMon('rattata', 8)], wild: true }), { bg: 'meadow' }),
  BattleSafari:    () => G.BattleScene(new G.Battle({ party: G.player.party, foes: [G.makeMon('kangaskhan', 20)], wild: true, safari: true }), { bg: 'meadow' }),
  BattleTrainer:   () => G.BattleScene(new G.Battle({ party: G.player.party, foes: G.trainerParty(G.TRAINERS.brock), trainer: G.TRAINERS.brock }), { bg: 'indoor' }),
  Overworld:       () => G.overworldScene
};

let rngState = 12345;
function rnd() { rngState = (rngState * 1103515245 + 12345) & 0x7fffffff; return rngState / 0x7fffffff; }

const failures = [];
for (const [name, make] of Object.entries(SEEDS)) {
  for (let trial = 0; trial < 3; trial++) {
    freshPlayer();
    G.scenes.length = 0;
    let scene;
    try { scene = make(); } catch (e) { failures.push(`${name}: constructor threw — ${e.message}`); continue; }
    if (!scene) continue;
    try { G.pushScene(scene); } catch (e) { failures.push(`${name}: enter() threw — ${e.message}`); continue; }
    for (let f = 0; f < 240; f++) {
      pressed = rnd() < 0.35 ? BTNS[Math.floor(rnd() * BTNS.length)] : null;
      repeat = rnd() < 0.2 ? BTNS[Math.floor(rnd() * BTNS.length)] : null;
      try { G.updateScenes(); } catch (e) {
        failures.push(`${name}: update threw on frame ${f} after '${pressed}' — ${e.message}`);
        break;
      }
      try { G.drawScenes(CTX); } catch (e) {
        failures.push(`${name}: draw threw on frame ${f} — ${e.message}`);
        break;
      }
      G.frame++;
      if (!G.scenes.length) break;   // scene closed itself; that is fine
    }
  }
}

if (failures.length) {
  console.error(failures.join(String.fromCharCode(10)));
  process.exit(1);
}
console.log('scene fuzz: ' + Object.keys(SEEDS).length + ' scenes x 3 runs x 240 frames of random input, no crashes');
