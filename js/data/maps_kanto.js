// pokemon-kanto — maps_kanto.js
// Kanto exteriors: towns, cities and routes, as char grids over the shared
// legends below.
//
// Map IDs are load-bearing — every warp, respawn point and encounter table
// keys on them, so do not rename one once it exists. Display names live in
// `name` and are free to change.
//
// Geography follows the real Kanto: Pallet at the bottom of the map with the
// sea to its south, Route 1 running north to Viridian, Route 2 north through
// Viridian Forest to Pewter, and so on clockwise around the region.

(function () {
  G.MAPS = G.MAPS || {};

  // ---------------------------------------------------------------- legends --
  // EXTERIOR. Kept deliberately mnemonic: lowercase for ground and nature,
  // digits and symbols for buildings, and one letter block per roof colour so
  // a glance at the grid tells you which building you are looking at.
  G.LEG_EXT = {
    // ground
    '.': 'grass', ',': 'grass2', 'f': 'flower', 'g': 'tallgrass',
    'p': 'path', 'n': 'path_n', 's': 'path_s', 'e': 'path_e', 'w': 'path_w',
    '%': 'sand',
    '~': 'water', '=': 'deepwater',
    '[': 'shore_w', ']': 'shore_e', '^': 'shore_n', '_': 'shore_s',
    // nature
    't': 'tree_tl', 'u': 'tree_tr', 'v': 'tree_bl', 'x': 'tree_br',
    'X': 'cuttree', 'O': 'boulder', 'l': 'ledge', '*': 'rock', '#': 'cliff',
    'y': 'deco_flowerY', 'o': 'deco_pebble', 'Q': 'deco_bush',
    'V': 'deco_stump', 'J': 'deco_fern',
    'F': 'fence', 'S': 'sign',
    // house — terracotta roof
    '1': 'roof_tl', '2': 'roof_tm', '3': 'roof_tr',
    '4': 'roof_bl', '5': 'roof_bm', '6': 'roof_br', '0': 'roofx',
    // Pokemon Centre — RED roof
    '7': 'hroof_tl', '8': 'hroof_tm', '9': 'hroof_tr',
    'd': 'hroof_bl', 'm': 'hroof_bm', 'h': 'hroof_br', '!': 'hroofx',
    '+': 'healsign',
    // Poke Mart — BLUE roof
    'q': 'sroof_tl', 'r': 'sroof_tm', 'z': 'sroof_tr',
    'i': 'sroof_bl', 'j': 'sroof_bm', 'k': 'sroof_br', '@': 'sroofx',
    '$': 'shopsign',
    // gym — SLATE roof
    'A': 'groof_tl', 'B': 'groof_tm', 'C': 'groof_tr',
    'a': 'groof_bl', 'b': 'groof_bm', 'c': 'groof_br', '&': 'groofx',
    // labs and civic buildings — BRICK roof
    'G': 'lroof_tl', 'H': 'lroof_tm', 'I': 'lroof_tr',
    'K': 'lroof_bl', 'L': 'lroof_bm', 'M': 'lroof_br', '?': 'lroofx',
    // walls and doors
    'W': 'wall', 'N': 'window', 'D': 'door', 'E': 'gdoor', 'Y': 'gymdoor'
  };

  // INTERIOR — a separate namespace, so letters may repeat.
  G.LEG_INT = {
    '.': 'ifloor', 'I': 'iwall', 'm': 'imat', 'T': 'itable', 'B': 'ibook',
    'H': 'imach', '(': 'ibed_t', ')': 'ibed_b', 'P': 'iplant', 'o': 'istool',
    'C': 'icounter', 'E': 'ihealm', 'G': 'gfloor', 'R': 'redcarpet',
    'U': 'statue', '>': 'stairs'
  };

  // CAVE — Mt. Moon, Rock Tunnel, Victory Road, Cerulean Cave.
  G.LEG_CAVE = {
    '.': 'cavefloor', '#': 'cavewall', 'O': 'boulder', '*': 'rock',
    '>': 'stairs', '~': 'water', 'g': 'tallgrass',
    ':': 'darkfloor', '%': 'darkwall',
    'i': 'icefloor', 'I': 'icewall'
  };

  // Row padding: short rows fill out with the map's base tile so layout edits
  // stay safe. tools/check.js still validates every row against the legend.
  G.padRows = function (rows, w, h, fill) {
    fill = fill || '.';
    var out = [];
    for (var y = 0; y < h; y++) {
      var r = rows[y] || '';
      while (r.length < w) r += fill;
      out.push(r.slice(0, w));
    }
    return out;
  };
  var pad = G.padRows;
  function blank(w, h) { return pad([], w, h); }

  // Routes are framed by a two-tile tree border, which is a 2x2 canopy — so
  // even rows open with the canopy TOP pair and odd rows with the BOTTOM pair.
  // row(y, interior) assembles a bordered row and keeps the parity honest.
  function row(y, interior) {
    var L = (y % 2 === 0) ? 'tu' : 'vx';
    return L + interior + L;
  }
  function rows(list, from) {
    return list.map(function (s, i) { return row((from || 0) + i, s); });
  }

  // ==========================================================================
  // PALLET TOWN — where it starts. Two houses, Oak's lab, and the sea to the
  // south. Deliberately tiny and quiet: the whole point of Pallet is that
  // nothing happens here, so the first step onto Route 1 lands harder.
  // ==========================================================================
  G.MAPS.pallet = {
    id: 'pallet', name: 'Pallet Town', w: 20, h: 18,
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututu..tutututu',
      'vxvxvxvxvx..vxvxvxvx',
      'tu........pp......tu',
      'vx.1223...pp......vx',
      'tu.4556...pp......tu',
      'vx.WNDW...pp......vx',
      'tu........pp.1223.tu',
      'vx...f....pp.4556.vx',
      'tu........pp.WNDW.tu',
      'vx........pp......vx',
      'tu..y.....pp....f.tu',
      'vx........pp......vx',
      'tu..GHHHI.pp......tu',
      'vx..KLLLM.pp......vx',
      'tu..WNEEW.pp......tu',
      'vx....pppppp......vx',
      '^^^^^^^^^^^^^^^^^^^^',
      '~~~~~~~~~~~~~~~~~~~~'
    ], 20, 18),
    deco: blank(20, 18),
    warps: [
      { x: 10, y: 1, to: 'route1', tx: 10, ty: 30, dir: 'up' },
      { x: 11, y: 1, to: 'route1', tx: 11, ty: 30, dir: 'up' },
      { x: 5, y: 5, to: 'playerhome', tx: 4, ty: 7, dir: 'up' },
      { x: 15, y: 8, to: 'rivalhome', tx: 4, ty: 7, dir: 'up' },
      { x: 6, y: 14, to: 'oakslab', tx: 6, ty: 11, dir: 'up' },
      { x: 7, y: 14, to: 'oakslab', tx: 7, ty: 11, dir: 'up' }
    ],
    signs: [
      { x: 4, y: 6, text: 'PALLET TOWN — A quiet place with clean air.' },
      { x: 5, y: 15, text: "PROF. OAK'S POKéMON RESEARCH LAB" },
      { x: 14, y: 9, text: "BLUE'S HOUSE" }
    ],
    npcs: [
      { x: 13, y: 12, sprite: 'man', dir: 'down',
        dialog: ['Technology is incredible!', 'You can now store and recall items and POKéMON as data via PC.'] },
      { x: 3, y: 11, sprite: 'littlegirl', dir: 'down',
        dialog: ['I hear PROF. OAK keeps three POKéMON in his lab.', 'THREE! And one of them is going to be yours!'] },
      // Oak blocks the north road until you have a partner — walking into the
      // tall grass unarmed is the one thing Gen 1 will not let you do.
      { x: 10, y: 2, sprite: 'oak', dir: 'down', unlessFlag: 'starter', event: 'oakStopsYou' }
    ]
  };

  // ==========================================================================
  // ROUTE 1 — the first road. Pidgey and Rattata at levels 2-5, ledges you can
  // only hop southward, and two ledge-fenced grass pockets so a player learns
  // the one-way rule somewhere it cannot cost them anything.
  // ==========================================================================
  G.MAPS.route1 = {
    id: 'route1', name: 'Route 1', w: 20, h: 32,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututu..tutututu',
      'vxvxvxvxvx..vxvxvxvx'
    ].concat(rows([
      '........pp......',   // 2
      '........pp......',
      '..ggg...pp......',
      '..ggg...pp..ggg.',
      '..ggg...pp..ggg.',
      '........pp..ggg.',
      '........pp......',
      '.lllll..pp.lllll',   // 9
      '........pp......',
      '....y...pp......',
      '........pp......',
      '..ggggg.pp......',
      '..ggggg.pp.ggggg',
      '..ggggg.pp.ggggg',
      '........pp.ggggg',
      '.lllll..pp.lllll',   // 17
      '........pp......',
      '......Q.pp....V.',
      '........pp......',
      '..ggg...pp......',
      '..ggg...pp..ggg.',
      '........pp..ggg.',
      '........pp......',
      '.lllll..pp.lllll',   // 25
      '........pp......',
      '...J....pp...o..',
      '........pp......',
      '........pp......',
      '........pp......',
      '........pp......'    // 31
    ], 2)), 20, 32),
    deco: blank(20, 32),
    encounters: (G.ENCOUNTERS || {}).route1,
    warps: [
      { x: 10, y: 0, to: 'viridian', tx: 12, ty: 22, dir: 'up' },
      { x: 11, y: 0, to: 'viridian', tx: 13, ty: 22, dir: 'up' },
      { x: 10, y: 31, to: 'pallet', tx: 10, ty: 2, dir: 'down' },
      { x: 11, y: 31, to: 'pallet', tx: 11, ty: 2, dir: 'down' }
    ],
    signs: [
      { x: 9, y: 28, text: 'ROUTE 1 — PALLET TOWN to the south, VIRIDIAN CITY to the north.' },
      { x: 9, y: 8, text: 'Ledges can be hopped DOWN, never climbed. Mind which way you are going.' }
    ],
    npcs: [
      { x: 13, y: 11, sprite: 'youngster', dir: 'down',
        dialog: ["See those ledges? You can jump down them, but you can't climb back up.", "Saves a lot of walking on the way home."] }
    ],
    items: [
      { x: 4, y: 20, item: 'potion', once: 'r1potion' }
    ]
  };

  // ==========================================================================
  // VIRIDIAN CITY — first real city. Centre and Mart on the north street, two
  // houses on the middle street, and the gym in the south, shuttered: its
  // leader is away, and you will not learn who he is until very much later.
  // ==========================================================================
  G.MAPS.viridian = {
    id: 'viridian', name: 'Viridian City', w: 26, h: 24,
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    gymEmblem: { x: 5, y: 17, type: 'ground' },
    ground: pad([
      'tutututututu..tutututututu',
      'vxvxvxvxvxvx..vxvxvxvxvxvx'
    ].concat(rows([
      '..........pp..........',   // 2
      '..7889....pp....qrrz..',
      '..d+mh....pp....i$jk..',
      '..WNEW....pp....WNEW..',
      '..........pp..........',
      'pppppppppppppppppppppp',   // 7  north street
      '..........pp..........',
      '...1223...pp...1223...',
      '...4556...pp...4556...',
      '...WNDW...pp...WNDW...',
      '..........pp..........',
      '..f.......pp.......f..',
      '..........pp..........',
      'pppppppppppppppppppppp',   // 15 south street
      '..........pp..........',
      '...ABBC...pp..........',
      '...abbc...pp....Q..V..',
      '...WYYW...pp..........',
      '..........pp..........',
      '...S......pp.......Q..',
      '..........pp..........',
      '..........pp..........'    // 23
    ], 2)), 26, 24),
    deco: blank(26, 24),
    warps: [
      { x: 12, y: 23, to: 'route1', tx: 10, ty: 1, dir: 'down' },
      { x: 13, y: 23, to: 'route1', tx: 11, ty: 1, dir: 'down' },
      { x: 6, y: 5, to: 'viridiancentre', tx: 4, ty: 6, dir: 'up' },
      { x: 20, y: 5, to: 'viridianmart', tx: 4, ty: 6, dir: 'up' },
      { x: 7, y: 11, to: 'viridianhouse', tx: 4, ty: 7, dir: 'up' },
      { x: 19, y: 11, to: 'viridianschool', tx: 4, ty: 6, dir: 'up' },
      { x: 6, y: 19, to: 'viridiangym', tx: 5, ty: 8, dir: 'up' },
      { x: 7, y: 19, to: 'viridiangym', tx: 5, ty: 8, dir: 'up' }
    ],
    signs: [
      { x: 12, y: 21, text: 'VIRIDIAN CITY — The Eternally Green Paradise.' },
      { x: 5, y: 6, text: 'POKéMON CENTER — Heal your POKéMON, free of charge.' },
      { x: 19, y: 6, text: 'POKéMON MART — Supplies for your journey.' },
      { x: 5, y: 20, text: 'VIRIDIAN CITY POKéMON GYM — LEADER: ?????' }
    ],
    npcs: [
      { x: 9, y: 18, sprite: 'oldman', dir: 'down',
        dialog: ["This GYM has been shut for as long as anyone can remember.", "Nobody in town will tell me who the LEADER is. Nobody."] },
      { x: 16, y: 8, sprite: 'woman', dir: 'down',
        dialog: ['The POKéMON MART just got a shipment of POTIONs in.', 'You should stock up before you head north.'] },
      { x: 4, y: 13, sprite: 'fatman', dir: 'down',
        dialog: ["VIRIDIAN FOREST is north of here, and it's a maze.", "Bring something that isn't weak to BUG POKéMON."] },
      { x: 21, y: 16, sprite: 'littleboy', dir: 'left',
        dialog: ['I saw a shooting star fall on MT. MOON last night!', 'Maybe there are still bits of it up there.'] }
    ]
  };
})();
