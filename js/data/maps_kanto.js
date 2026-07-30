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
    '.': 'cavefloor', ',': 'cavecalm', '#': 'cavewall', 'O': 'boulder',
    '*': 'rock', '>': 'stairs', '~': 'water',
    ':': 'darkfloor', '%': 'darkwall',
    'i': 'icefloor', 'I': 'icewall'
  };

  // Row padding: short rows fill out with the map's base tile so layout edits
  // stay safe. tools/check.js still validates every row against the legend.
  //
  // The truncation is the dangerous half. Supplying MORE rows than `h` silently
  // drops them off the bottom of the map, taking any warp that lived there with
  // it, and nothing in the source looks wrong. That has cost real debugging
  // time, so overflow is now recorded and reported by check.js instead of
  // vanishing. Same for rows wider than `w`.
  G.MAP_WARN = G.MAP_WARN || [];
  G.padRows = function (rows, w, h, fill) {
    fill = fill || '.';
    if (rows.length > h) {
      G.MAP_WARN.push('padRows: given ' + rows.length + ' rows for a map of height ' +
        h + ' — the last ' + (rows.length - h) + ' were DROPPED');
    }
    var out = [];
    for (var y = 0; y < h; y++) {
      var r = rows[y] || '';
      if (r.length > w) {
        G.MAP_WARN.push('padRows: row ' + y + ' is ' + r.length + ' cols for a map of width ' + w);
      }
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
      { x: 12, y: 0, to: 'route2', tx: 10, ty: 32, dir: 'up' },
      { x: 13, y: 0, to: 'route2', tx: 11, ty: 32, dir: 'up' },
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

  // ==========================================================================
  // ROUTE 2 — Viridian to Pewter, but not directly. A band of impassable
  // woodland across the middle means the ONLY way north is through Viridian
  // Forest, which is exactly how Gen 1 forces you into the maze.
  // ==========================================================================
  G.MAPS.route2 = {
    id: 'route2', name: 'Route 2', w: 20, h: 34,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututu..tutututu',
      'vxvxvxvxvx..vxvxvxvx'
    ].concat(rows([
      '........pp......',   // 2
      '..GHI...pp......',   // 3  Diglett's Cave — the long way round to Vermilion
      '..KLM...pp..ggg.',
      '..WEW...pp..ggg.',
      '........pp......',
      '....S...pp......',
      '........pp......',
      '........pp......',
      '........pp......',   // 10 — the forest's north exit lands here
      'tutututututututu',   // 12 — the impassable band. No way around the
      'vxvxvxvxvxvxvxvx',   //      forest, only through it.
      'tutututututututu',
      'vxvxvxvxvxvxvxvx',
      'tutututututututu',
      'vxvxvxvxvxvxvxvx',
      'tutututututututu',
      'vxvxvxvxvxvxvxvx',
      '........pp......',   // 20
      '........pp......',
      '.......GHI......',   // 22 — the forest gate
      '.......KLM......',
      '.......WEW......',   // 24 — door at x=10
      '........pp......',
      '..ggg...pp..ggg.',
      '..ggg...pp..ggg.',
      '........pp......',
      '.lllll..pp.lllll',   // 29
      '........pp......',
      '....y...pp....o.',
      '........pp......',
      '........pp......',
      '........pp......'    // 33
    ], 2)), 20, 34),
    deco: blank(20, 34),
    encounters: (G.ENCOUNTERS || {}).route2,
    warps: [
      { x: 10, y: 0, to: 'pewter', tx: 12, ty: 20, dir: 'up' },
      { x: 11, y: 0, to: 'pewter', tx: 13, ty: 20, dir: 'up' },
      { x: 10, y: 33, to: 'viridian', tx: 12, ty: 1, dir: 'down' },
      { x: 11, y: 33, to: 'viridian', tx: 13, ty: 1, dir: 'down' },
      { x: 10, y: 23, to: 'viridianforest', tx: 11, ty: 26, dir: 'up' },
      { x: 5, y: 5, to: 'diglettscave', tx: 4, ty: 2, dir: 'up' }
    ],
    signs: [
      { x: 9, y: 7, text: 'ROUTE 2 — VIRIDIAN FOREST ahead. Watch out for wild POKéMON in the tall grass.' },
      { x: 9, y: 21, text: 'VIRIDIAN FOREST — Entrance. Trainers welcome. Bring repellent.' }
    ],
    npcs: [
      { x: 13, y: 25, sprite: 'oldman', dir: 'left',
        dialog: ['The forest is the only road north, and it is full of BUG POKéMON.',
                 'A FLYING or FIRE type makes short work of them.'] }
    ]
  };

  // ==========================================================================
  // VIRIDIAN FOREST — wall-to-wall tall grass with tree clumps breaking it up.
  // Deliberately generous with corridors: Gen 1's forest is remembered as a
  // maze, but an actually confusing maze this early is just an exit-hunt. The
  // density of ENCOUNTERS is what should make it feel long, not the geometry.
  // ==========================================================================
  G.MAPS.viridianforest = {
    id: 'viridianforest', name: 'Viridian Forest', w: 24, h: 28,
    music: 'route', battleBg: 'forest', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tutututututu..tutututututu',
      'vxvxvxvxvxvx..vxvxvxvxvxvx'
    ].map(function (r) { return r.slice(0, 24); }).concat(rows([
      '.........pp.........',   // 2
      'ggggg....pp....ggggg',
      'ggggg.tu.pp.tu.ggggg',
      'ggggg.vx.pp.vx.ggggg',
      'ggggg....pp....ggggg',
      '....gggggggggggg....',   // 7
      '.tu.gggggggggggg.tu.',
      '.vx.gggggggggggg.vx.',
      '....gggggggggggg....',
      'gggggggg....gggggggg',   // 11
      'gggggggg.tu.gggggggg',
      'gggggggg.vx.gggggggg',
      'gggggggg....gggggggg',
      '....gggggggggggg....',   // 15
      '.tu.gggggggggggg.tu.',
      '.vx.gggggggggggg.vx.',
      '....gggggggggggg....',
      'ggggg....pp....ggggg',   // 19
      'ggggg.tu.pp.tu.ggggg',
      'ggggg.vx.pp.vx.ggggg',
      'ggggg....pp....ggggg',
      '.........pp.........',   // 23
      '....gggg.pp.gggg....',
      '....gggg.pp.gggg....',
      '.........pp.........',
      '.........pp.........'    // 27
    ], 2)), 24, 28),
    deco: blank(24, 28),
    encounters: (G.ENCOUNTERS || {}).viridianforest,
    warps: [
      { x: 11, y: 0, to: 'route2', tx: 10, ty: 10, dir: 'up' },
      { x: 12, y: 0, to: 'route2', tx: 11, ty: 10, dir: 'up' },
      { x: 11, y: 27, to: 'route2', tx: 10, ty: 24, dir: 'down' },
      { x: 12, y: 27, to: 'route2', tx: 10, ty: 24, dir: 'down' }
    ],
    signs: [
      { x: 10, y: 24, text: 'LEAVING VIRIDIAN FOREST — PEWTER CITY is to the north.' }
    ],
    trainers: [
      { x: 7, y: 9, sprite: 'bugcatcher', dir: 'right', trainer: 'vf_rick', sight: 4 },
      { x: 16, y: 16, sprite: 'bugcatcher', dir: 'left', trainer: 'vf_doug', sight: 4 },
      { x: 11, y: 5, sprite: 'bugcatcher', dir: 'down', trainer: 'vf_sammy', sight: 3 }
    ],
    items: [
      { x: 4, y: 12, item: 'potion', once: 'vf_potion' },
      { x: 19, y: 20, item: 'antidote', once: 'vf_antidote' }
    ]
  };

  // ==========================================================================
  // PEWTER CITY — grey stone, a museum full of fossils, and the first gym.
  // ==========================================================================
  G.MAPS.pewter = {
    id: 'pewter', name: 'Pewter City', w: 24, h: 22,
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    gymEmblem: { x: 5, y: 8, type: 'rock' },
    ground: pad([
      'tutututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvx'
    ].concat(rows([
      '....GHHHI...........',   // 2  museum
      '....KLLLM...........',
      '....WNEEW...........',
      '....................',
      'pppppppppppppppppppp',   // 6  north street -- and the road east
      '....................',
      '..ABBC......7889....',   // 8  gym            Centre
      '..abbc......d+mh....',
      '..WYYW......WNEW....',
      '....................',
      'pppppppppppppppppppp',   // 12 south street
      '....................',
      '...1223.....qrrz....',   // 14 house          Mart
      '...4556.....i$jk....',
      '...WNDW.....WNEW....',
      '....................',
      '..S.......pp......Q.',
      '..........pp........',
      '..........pp........',
      '..........pp........'    // 21
    ], 2))
      // The north street runs straight out of town onto Route 3, so its east
      // tree border is replaced by road.
      .map(function (r, i) { return i === 6 ? r.slice(0, 22) + 'pp' : r; }),
      24, 22),
    deco: blank(24, 22),
    warps: [
      { x: 12, y: 21, to: 'route2', tx: 10, ty: 1, dir: 'down' },
      { x: 13, y: 21, to: 'route2', tx: 11, ty: 1, dir: 'down' },
      { x: 23, y: 6, to: 'route3', tx: 1, ty: 5, dir: 'right' },
      { x: 8, y: 4, to: 'pewtermuseum', tx: 6, ty: 10, dir: 'up' },
      { x: 9, y: 4, to: 'pewtermuseum', tx: 7, ty: 10, dir: 'up' },
      { x: 5, y: 10, to: 'pewtergym', tx: 5, ty: 12, dir: 'up' },
      { x: 6, y: 10, to: 'pewtergym', tx: 6, ty: 12, dir: 'up' },
      { x: 16, y: 10, to: 'pewtercentre', tx: 4, ty: 6, dir: 'up' },
      { x: 7, y: 16, to: 'pewterhouse', tx: 4, ty: 7, dir: 'up' },
      { x: 16, y: 16, to: 'pewtermart', tx: 4, ty: 6, dir: 'up' }
    ],
    signs: [
      { x: 4, y: 19, text: 'PEWTER CITY — A Stone Grey City.' },
      { x: 7, y: 5, text: 'PEWTER MUSEUM OF SCIENCE' },
      { x: 4, y: 11, text: 'PEWTER CITY POKéMON GYM — LEADER: BROCK. The Rock-Solid POKéMON Trainer!' }
    ],
    npcs: [
      { x: 10, y: 7, sprite: 'gymguy', dir: 'down',
        dialog: ["BROCK's POKéMON are ROCK-hard. Normal moves barely scratch them.",
                 'GRASS and WATER types are what you want. Or a lot of patience.'] },
      { x: 18, y: 13, sprite: 'baldingman', dir: 'left',
        dialog: ['They dug a fossil out of MT. MOON and put it in the museum.',
                 'Nobody can agree what it was.'] },
      { x: 15, y: 19, sprite: 'littlegirl', dir: 'down',
        dialog: ['MT. MOON is east of here, past ROUTE 3.', "It's dark inside. Really dark."] }
    ]
  };

  // Horizontal routes are framed top and bottom instead of left and right, so
  // they get their own border rows rather than the row() helper.
  function hband(w, even) {
    var pair = even ? 'tu' : 'vx', r = '';
    while (r.length < w) r += pair;
    return r.slice(0, w);
  }

  // ==========================================================================
  // ROUTE 3 — the climb east out of Pewter. Gen 1 packs this route with more
  // trainers than anywhere else so far, and the ledges let you fall back west
  // toward the Centre without re-fighting any of them.
  // ==========================================================================
  G.MAPS.route3 = {
    id: 'route3', name: 'Route 3', w: 36, h: 12,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      hband(36, true),
      hband(36, false),
      '....................................',
      '..ggggg......ggggg.......ggggg......',
      '..ggggg......ggggg.......ggggg......',
      'pppppppppppppppppppppppppppppppppppp',
      'pppppppppppppppppppppppppppppppppppp',
      '.....llllll........llllll...........',
      '..........................ggggg.....',
      '..........................ggggg.....',
      hband(36, true),
      hband(36, false)
    ], 36, 12),
    deco: blank(36, 12),
    encounters: (G.ENCOUNTERS || {}).route3,
    warps: [
      { x: 0, y: 5, to: 'pewter', tx: 22, ty: 6, dir: 'left' },
      { x: 0, y: 6, to: 'pewter', tx: 22, ty: 6, dir: 'left' },
      { x: 35, y: 5, to: 'mtmoon1f', tx: 2, ty: 15, dir: 'right' },
      { x: 35, y: 6, to: 'mtmoon1f', tx: 2, ty: 15, dir: 'right' }
    ],
    signs: [
      { x: 33, y: 4, text: 'MT. MOON — Cave entrance. A light source is strongly advised.' }
    ],
    trainers: [
      { x: 8, y: 4, sprite: 'youngster', dir: 'down', trainer: 'r3_calvin', sight: 3 },
      { x: 19, y: 8, sprite: 'lass', dir: 'up', trainer: 'r3_janice', sight: 3 },
      { x: 28, y: 3, sprite: 'bugcatcher', dir: 'down', trainer: 'r3_colton', sight: 3 }
    ],
    items: [
      { x: 3, y: 9, item: 'potion', once: 'r3_potion' }
    ],
    npcs: [
      { x: 31, y: 7, sprite: 'hiker', dir: 'left',
        dialog: ['MT. MOON has three levels and no lights in any of them.',
                 'Take ESCAPE ROPEs. Take more than you think.'] }
    ]
  };

  // ==========================================================================
  // MT. MOON 1F — the first cave. Every floor tile is an encounter tile (see
  // the note in sprites_tiles.js), so the route through is a running battle;
  // the entrance chamber and the junctions use the quiet variant so it never
  // becomes unplayable.
  // ==========================================================================
  G.MAPS.mtmoon1f = {
    id: 'mtmoon1f', name: 'Mt. Moon', w: 28, h: 18,
    music: 'cave', battleBg: 'cave', base: 'cavefloor',
    legend: G.LEG_CAVE,
    ground: pad([
      '############################',
      '#.........#........#.......#',
      '#..*......#....O...#...*...#',
      '#.................#....O...#',
      '#.........####.....#.......#',
      '####.####....#.....#####.###',
      '#..............*.......,>,.#',
      '#....O.........#...........#',
      '#..............#....*......#',
      '####.......#####...........#',
      '#..........#...............#',
      '#....*.....#....O..........#',
      '#..........#...............#',
      '#..........#####.......#####',
      '#..............#...........#',
      '#,,....*.......#....O......#',
      '#,,............#...........#',
      '############################'
    ], 28, 18),
    deco: blank(28, 18),
    encounters: (G.ENCOUNTERS || {}).mtmoon1f,
    warps: [
      { x: 1, y: 15, to: 'route3', tx: 34, ty: 5, dir: 'left' },
      { x: 1, y: 16, to: 'route3', tx: 34, ty: 6, dir: 'left' },
      { x: 24, y: 6, to: 'mtmoonb1f', tx: 3, ty: 3, dir: 'down' }
    ],
    signs: [
      { x: 2, y: 14, text: 'MT. MOON 1F — The way out is west. The way on is somewhere in the dark.' }
    ],
    trainers: [
      { x: 13, y: 3, sprite: 'bugcatcher', dir: 'down', trainer: 'mm_kent', sight: 3 },
      { x: 20, y: 11, sprite: 'hiker', dir: 'left', trainer: 'mm_marcos', sight: 3 }
    ],
    items: [
      { x: 5, y: 2, item: 'potion', once: 'mm_potion' },
      { x: 22, y: 15, item: 'escaperope', once: 'mm_rope' }
    ]
  };

  // ==========================================================================
  // MT. MOON B1F — the bottom. Team Rocket are down here arguing over the two
  // fossils, and whichever one you take is the one you can revive on Cinnabar.
  // ==========================================================================
  G.MAPS.mtmoonb1f = {
    id: 'mtmoonb1f', name: 'Mt. Moon B1F', w: 28, h: 18,
    music: 'cave', battleBg: 'cave', base: 'cavefloor',
    legend: G.LEG_CAVE,
    ground: pad([
      '############################',
      '#..,,......#...............#',
      '#..,,......#....*......O...#',
      '#..,>,.....#...............#',
      '#..........#####.....#######',
      '#....O..............#......#',
      '####.....####.......#......#',
      '#........#..........#..*...#',
      '#...*....#..........#......#',
      '#........#....O.....#......#',
      '#........####.......####.###',
      '#...................#......#',
      '#####.####..........#..,,..#',
      '#........#.....*....#..,,..#',
      '#........#..........#.,,,,.#',
      '#...O....#..........#.,,,,.#',
      '#........#..........#..,>,.#',
      '############################'
    ], 28, 18),
    deco: blank(28, 18),
    encounters: (G.ENCOUNTERS || {}).mtmoonb1f,
    warps: [
      { x: 4, y: 3, to: 'mtmoon1f', tx: 24, ty: 7, dir: 'up' },
      { x: 24, y: 16, to: 'route4', tx: 1, ty: 6, dir: 'right' }
    ],
    signs: [
      { x: 23, y: 14, text: 'A hand-painted board: TO ROUTE 4 AND CERULEAN. Someone has added, in pen: FINALLY.' }
    ],
    trainers: [
      { x: 14, y: 5, sprite: 'rocket', dir: 'down', trainer: 'mm_rocket1', sight: 4 },
      { x: 22, y: 8, sprite: 'rocket', dir: 'left', trainer: 'mm_rocket2', sight: 3 },
      { x: 6, y: 13, sprite: 'scientist', dir: 'right', trainer: 'mm_miguel', sight: 3 }
    ],
    npcs: [
      { x: 15, y: 13, sprite: 'orb_stand', obj: true, event: 'mtmoonFossil' },
      { x: 16, y: 13, sprite: 'orb_stand', obj: true, event: 'mtmoonFossil2' }
    ],
    items: [
      { x: 3, y: 8, item: 'moonstone', once: 'mm_moonstone' }
    ]
  };

  // ==========================================================================
  // ROUTE 4 — a short ledge-strewn shelf down into Cerulean. In Gen 1 this is
  // where the map opens up: the first water you cannot cross yet is right here.
  // ==========================================================================
  G.MAPS.route4 = {
    id: 'route4', name: 'Route 4', w: 32, h: 14,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      hband(32, true),
      hband(32, false),
      '................................',
      '..ggggg...............ggggg.....',
      '..ggggg...............ggggg.....',
      'pppppppppppppppppppppppppppppppp',
      'pppppppppppppppppppppppppppppppp',
      '.......llllllll.................',
      '................................',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      hband(32, true),
      hband(32, false)
    ], 32, 14),
    deco: blank(32, 14),
    encounters: (G.ENCOUNTERS || {}).route4,
    warps: [
      { x: 0, y: 5, to: 'mtmoonb1f', tx: 23, ty: 16, dir: 'left' },
      { x: 0, y: 6, to: 'mtmoonb1f', tx: 23, ty: 16, dir: 'left' },
      { x: 31, y: 5, to: 'cerulean', tx: 2, ty: 13, dir: 'right' },
      { x: 31, y: 6, to: 'cerulean', tx: 2, ty: 13, dir: 'right' }
    ],
    signs: [
      { x: 12, y: 8, text: 'ROUTE 4 — CERULEAN CITY to the east. Deep water beyond the shelf; SURF only.' }
    ],
    npcs: [
      { x: 20, y: 8, sprite: 'fisher', dir: 'down',
        dialog: ['I have been casting off this shelf for thirty years.',
                 'MAGIKARP. Every single time. Thirty years of MAGIKARP.'] }
    ]
  };

  // ==========================================================================
  // CERULEAN CITY — a lake town. Misty's gym, and the house Team Rocket
  // burgled, which is where the story turns from "collect badges" to "somebody
  // is doing something."
  // ==========================================================================
  G.MAPS.cerulean = {
    id: 'cerulean', name: 'Cerulean City', w: 26, h: 24,
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    gymEmblem: { x: 6, y: 8, type: 'water' },
    ground: pad([
      'tutututututu..tutututututu',
      'vxvxvxvxvxvx..vxvxvxvxvxvx'
    ].concat(rows([
      '..........pp..........',   // 2
      '~~~~~~....pp....7889..',
      '~~~~~~....pp....d+mh..',
      '~~~~~~....pp....WNEW..',
      '..........pp..........',
      'pppppppppppppppppppppp',   // 7
      '..........pp..........',
      '..ABBC....pp....1223..',   // 9  gym            house
      '..abbc....pp....4556..',
      '..WYYW....pp....WNDW..',
      '..........pp..........',
      'pppppppppppppppppppppp',   // 13
      '..........pp..........',
      '...1223...pp....qrrz..',   // 15 robbed house   Mart
      '...4556...pp....i$jk..',
      '...WNDW...pp....WNEW..',
      '..........pp..........',
      '..S.......pp.......Q..',
      '..........pp..........',
      '..........pp..........',
      '..........pp..........'    // 23
    ], 2))
      // The south street runs west onto Route 4 and east onto Route 9.
      .map(function (r, i) { return i === 13 ? 'pp' + r.slice(2, 24) + 'pp' : r; }),
      26, 24),
    deco: blank(26, 24),
    warps: [
      { x: 12, y: 0, to: 'route24', tx: 10, ty: 18, dir: 'up' },
      { x: 13, y: 0, to: 'route24', tx: 11, ty: 18, dir: 'up' },
      { x: 12, y: 23, to: 'route5', tx: 10, ty: 1, dir: 'down' },
      { x: 13, y: 23, to: 'route5', tx: 11, ty: 1, dir: 'down' },
      { x: 0, y: 13, to: 'route4', tx: 30, ty: 6, dir: 'left' },
      { x: 25, y: 13, to: 'route9', tx: 1, ty: 5, dir: 'right' },
      { x: 1, y: 13, to: 'route4', tx: 30, ty: 6, dir: 'left' },
      { x: 5, y: 11, to: 'ceruleangym', tx: 5, ty: 12, dir: 'up' },
      { x: 6, y: 11, to: 'ceruleangym', tx: 6, ty: 12, dir: 'up' },
      { x: 20, y: 5, to: 'ceruleancentre', tx: 4, ty: 6, dir: 'up' },
      { x: 20, y: 17, to: 'ceruleanmart', tx: 4, ty: 6, dir: 'up' },
      { x: 20, y: 11, to: 'ceruleanhouse', tx: 4, ty: 7, dir: 'up' },
      { x: 7, y: 17, to: 'robbedhouse', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 4, y: 19, text: 'CERULEAN CITY — A Mysterious, Blue Aura Surrounds It.' },
      { x: 5, y: 12, text: 'CERULEAN CITY POKéMON GYM — LEADER: MISTY. The Tomboyish Mermaid!' }
    ],
    npcs: [
      { x: 10, y: 8, sprite: 'gymguy', dir: 'right',
        dialog: ['MISTY uses WATER POKéMON, and her STARMIE is fast and hits hard.',
                 'ELECTRIC or GRASS moves. Anything else and you are just chipping at it.'] },
      { x: 9, y: 18, sprite: 'policeman', dir: 'down',
        dialog: ['A house was broken into last night. Went straight through the back wall.',
                 'Black uniforms, red R on the chest. Nobody will say the name out loud.'] },
      { x: 17, y: 20, sprite: 'oldman', dir: 'left',
        dialog: ['BILL lives north of here, up ROUTE 25.',
                 'Brilliant man. Bit odd. Ask him about the storage system.'] }
    ]
  };

  // ==========================================================================
  // ROUTE 24 — NUGGET BRIDGE. Five trainers in a line across a bridge, one
  // after another with no way off, and a Rocket recruiter waiting at the far
  // end. It is the first place the game tests a whole TEAM rather than a lead.
  // ==========================================================================
  G.MAPS.route24 = {
    id: 'route24', name: 'Route 24', w: 20, h: 20,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututu..tutututu',
      'vxvxvxvxvx..vxvxvxvx'
    ].concat(rows([
      '........pp......',   // 2
      '........pp......',
      '~~~~~~~pppp~~~~~',   // 4  the bridge
      '~~~~~~~pppp~~~~~',
      '~~~~~~~pppp~~~~~',
      '~~~~~~~pppp~~~~~',
      '~~~~~~~pppp~~~~~',
      '~~~~~~~pppp~~~~~',
      '~~~~~~~pppp~~~~~',
      '~~~~~~~pppp~~~~~',   // 11
      '........pp......',
      '..ggg...pp..ggg.',
      '..ggg...pp..ggg.',
      '........pp......',
      '........pp......',
      '........pp......',
      '........pp......'    // 19
    ], 2)), 20, 20),
    deco: blank(20, 20),
    encounters: (G.ENCOUNTERS || {}).route24,
    warps: [
      { x: 10, y: 0, to: 'route25', tx: 1, ty: 6, dir: 'up' },
      { x: 11, y: 0, to: 'route25', tx: 1, ty: 6, dir: 'up' },
      { x: 10, y: 19, to: 'cerulean', tx: 12, ty: 1, dir: 'down' },
      { x: 11, y: 19, to: 'cerulean', tx: 13, ty: 1, dir: 'down' }
    ],
    signs: [
      { x: 8, y: 12, text: 'NUGGET BRIDGE — Beat five trainers in a row and the prize is yours.' }
    ],
    trainers: [
      { x: 9, y: 10, sprite: 'bugcatcher', dir: 'down', trainer: 'nb_1', sight: 1 },
      { x: 12, y: 9, sprite: 'lass', dir: 'down', trainer: 'nb_2', sight: 1 },
      { x: 9, y: 8, sprite: 'youngster', dir: 'down', trainer: 'nb_3', sight: 1 },
      { x: 12, y: 7, sprite: 'lass', dir: 'down', trainer: 'nb_4', sight: 1 },
      { x: 9, y: 6, sprite: 'cooltrainerm', dir: 'down', trainer: 'nb_5', sight: 1 },
      { x: 10, y: 3, sprite: 'rocket', dir: 'down', trainer: 'nb_rocket', sight: 2 }
    ],
    npcs: [
      { x: 13, y: 13, sprite: 'littleboy', dir: 'left',
        dialog: ['Five trainers, one bridge, no way off.',
                 'Bring POTIONs. Everybody forgets the POTIONs.'] }
    ]
  };

  // ==========================================================================
  // ROUTE 25 — the cape above the bridge, ending at Bill's cottage.
  // ==========================================================================
  G.MAPS.route25 = {
    id: 'route25', name: 'Route 25', w: 32, h: 12,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      hband(32, true),
      hband(32, false),
      '................................',
      '..ggggg.......ggggg.............',
      '..ggggg.......ggggg....GHI......',
      'pppppppppppppppppppppppKLM......',
      'pppppppppppppppppppppppWEW......',
      '.....llllll.....................',
      '..........................ggg...',
      '..........................ggg...',
      hband(32, true),
      hband(32, false)
    ], 32, 12),
    deco: blank(32, 12),
    encounters: (G.ENCOUNTERS || {}).route25,
    warps: [
      { x: 0, y: 5, to: 'route24', tx: 10, ty: 1, dir: 'left' },
      { x: 0, y: 6, to: 'route24', tx: 10, ty: 1, dir: 'left' },
      { x: 24, y: 6, to: 'billshouse', tx: 5, ty: 8, dir: 'up' }
    ],
    signs: [
      { x: 22, y: 7, text: "BILL'S HOUSE — Inventor. Please knock. (The knocker is broken.)" }
    ],
    trainers: [
      { x: 8, y: 3, sprite: 'hiker', dir: 'down', trainer: 'r25_franklin', sight: 3 },
      { x: 17, y: 8, sprite: 'lass', dir: 'up', trainer: 'r25_ali', sight: 3 }
    ]
  };

  // ==========================================================================
  // ROUTE 5 — Cerulean down toward Saffron. The city gates are shut, so the
  // only way south is the UNDERGROUND PATH, which is exactly the detour Gen 1
  // uses to keep Saffron sealed until much later without a locked door.
  // ==========================================================================
  G.MAPS.route5 = {
    id: 'route5', name: 'Route 5', w: 20, h: 18,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututu..tutututu',
      'vxvxvxvxvx..vxvxvxvx'
    ].concat(rows([
      '........pp......',   // 2
      '..ggg...pp......',
      '..ggg...pp..ggg.',
      '........pp..ggg.',
      '........pp......',
      '.lllll..pp......',
      '........pp......',
      '.....GHI........',   // 9  underground path entrance
      '.....KLM........',
      '.....WEW........',   // 11
      '........pp......',
      '........pp......',
      'tutututututututu',   // 14 — Saffron's shut gates. No road through.
      'vxvxvxvxvxvxvxvx',
      'tutututututututu',
      'vxvxvxvxvxvxvxvx'
    ], 2)), 20, 18),
    deco: blank(20, 18),
    encounters: (G.ENCOUNTERS || {}).route5,
    warps: [
      { x: 10, y: 0, to: 'cerulean', tx: 12, ty: 22, dir: 'up' },
      { x: 11, y: 0, to: 'cerulean', tx: 13, ty: 22, dir: 'up' },
      { x: 8, y: 11, to: 'undergroundpath', tx: 3, ty: 2, dir: 'down' }
    ],
    signs: [
      { x: 11, y: 12, text: 'SAFFRON CITY is south, but the gates are shut. The UNDERGROUND PATH runs beneath.' }
    ],
    npcs: [
      { x: 12, y: 6, sprite: 'gentleman', dir: 'left',
        dialog: ['SAFFRON has closed its gates. All four of them.',
                 'Something is going on in there and nobody will say what.',
                 'Use the UNDERGROUND PATH. It comes out on ROUTE 6.'] }
    ]
  };

  // ==========================================================================
  // ROUTE 6 — the last stretch down into Vermilion.
  // ==========================================================================
  G.MAPS.route6 = {
    id: 'route6', name: 'Route 6', w: 20, h: 18,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'vxvxvxvxvxvxvxvxvxvx',
      'tutututututututututu'
    ].concat(rows([
      '.....GHI........',   // 2  underground path exit
      '.....KLM........',
      '.....WEW........',
      '........pp......',
      '..ggg...pp......',
      '..ggg...pp..ggg.',
      '........pp..ggg.',
      '.lllll..pp......',
      '........pp......',
      '........pp......',
      '....y...pp....o.',
      '........pp......',
      '........pp......',
      '........pp......',
      '........pp......',
      '........pp......'    // 17
    ], 2)), 20, 18),
    deco: blank(20, 18),
    encounters: (G.ENCOUNTERS || {}).route6,
    warps: [
      { x: 8, y: 4, to: 'undergroundpath', tx: 3, ty: 20, dir: 'down' },
      { x: 10, y: 17, to: 'vermilion', tx: 12, ty: 1, dir: 'down' },
      { x: 11, y: 17, to: 'vermilion', tx: 13, ty: 1, dir: 'down' }
    ],
    signs: [
      { x: 11, y: 11, text: 'ROUTE 6 — VERMILION CITY to the south. Mind the ledges.' }
    ],
    trainers: [
      { x: 13, y: 8, sprite: 'camper', dir: 'left', trainer: 'r6_ethan', sight: 3 },
      { x: 6, y: 13, sprite: 'picnicker', dir: 'right', trainer: 'r6_nancy', sight: 3 }
    ]
  };

  // ==========================================================================
  // VERMILION CITY — the port. Lt. Surge's gym, and the S.S. Anne at the dock,
  // which will not let you aboard without a ticket.
  // ==========================================================================
  G.MAPS.vermilion = {
    id: 'vermilion', name: 'Vermilion City', w: 26, h: 24,
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    gymEmblem: { x: 6, y: 15, type: 'electric' },
    ground: pad([
      'tutututututu..tutututututu',
      'vxvxvxvxvxvx..vxvxvxvxvxvx'
    ].concat(rows([
      '..........pp..........',   // 2
      '..7889....pp....qrrz..',
      '..d+mh....pp....i$jk..',
      '..WNEW....pp....WNEW..',
      '..........pp..........',
      'pppppppppppppppppppppp',   // 7  north street -- and the road east
      '..........pp..........',
      '...1223...pp...1223...',
      '...4556...pp...4556...',
      '...WNDW...pp...WNDW...',
      '..........pp..........',
      'pppppppppppppppppppppp',   // 13
      '..........pp..........',
      '..ABBC....pp..........',   // 15 gym
      '..abbc....pp....S.....',
      '..WYYW....pp..........',
      '..........pp..........',
      '..........pp..........',
      '%%%%%%%%%%pp%%%%%%%%%%',   // 20 the quay
      '^^^^^^^^^^pp^^^^^^^^^^',
      '~~~~~~~~~~pp~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~'    // 23
    ], 2))
      // The north street runs east out of town onto Route 11.
      .map(function (r, i) { return i === 7 ? r.slice(0, 24) + 'pp' : r; }),
      26, 24),
    deco: blank(26, 24),
    warps: [
      { x: 23, y: 7, to: 'route11', tx: 1, ty: 5, dir: 'right' },
      { x: 12, y: 20, to: 'ssanne', tx: 12, ty: 14, dir: 'down' },
      { x: 13, y: 20, to: 'ssanne', tx: 13, ty: 14, dir: 'down' },
      { x: 12, y: 0, to: 'route6', tx: 10, ty: 16, dir: 'up' },
      { x: 13, y: 0, to: 'route6', tx: 11, ty: 16, dir: 'up' },
      { x: 5, y: 17, to: 'vermiliongym', tx: 5, ty: 12, dir: 'up' },
      { x: 6, y: 17, to: 'vermiliongym', tx: 6, ty: 12, dir: 'up' },
      { x: 6, y: 5, to: 'vermilioncentre', tx: 4, ty: 6, dir: 'up' },
      { x: 20, y: 5, to: 'vermilionmart', tx: 4, ty: 6, dir: 'up' },
      { x: 7, y: 11, to: 'vermilionhouse', tx: 4, ty: 7, dir: 'up' },
      { x: 19, y: 11, to: 'vermilionfanclub', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 18, y: 18, text: 'VERMILION CITY — The Port of Exquisite Sunsets.' },
      { x: 5, y: 18, text: 'VERMILION CITY POKéMON GYM — LEADER: LT. SURGE. The Lightning American!' }
    ],
    npcs: [
      { x: 10, y: 14, sprite: 'gymguy', dir: 'right',
        dialog: ["LT. SURGE is ex-military and he fights like it. His RAICHU is fast.",
                 'GROUND types are completely immune to ELECTRIC. A DIGLETT would walk it.'] },
      { x: 12, y: 19, sprite: 'sailor', dir: 'down', unlessFlag: 'ssticket', event: 'ssanneDock' },
      { x: 13, y: 19, sprite: 'sailor', dir: 'down', unlessFlag: 'ssticket', event: 'ssanneDock' },
      { x: 17, y: 8, sprite: 'woman', dir: 'down',
        dialog: ['The S.S. ANNE is in port. Invitation only, of course.',
                 'It sails in a few days and then it is gone for a year.'] },
      { x: 4, y: 19, sprite: 'workerm', dir: 'up',
        dialog: ['There is a DIGLETT tunnel west of town that runs all the way to ROUTE 2.',
                 'Full of them. Nothing but DIGLETT, top to bottom.'] }
    ]
  };

  // ==========================================================================
  // DIGLETT'S CAVE — a long tunnel under the mountains, and the answer to
  // Lt. Surge. Ground-types take NOTHING from Electric, and this is where the
  // game quietly puts one within reach right before you need it.
  // ==========================================================================
  G.MAPS.diglettscave = {
    id: 'diglettscave', name: "Diglett's Cave", w: 9, h: 26,
    music: 'cave', battleBg: 'cave', base: 'cavefloor',
    legend: G.LEG_CAVE,
    ground: pad([
      '#########',
      '##,,,,,##',
      '##,,,,,##',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '###...###',
      '##,,,,,##',
      '##,,,,,##',
      '#########'
    ], 9, 26),
    deco: blank(9, 26),
    encounters: (G.ENCOUNTERS || {}).diglettscave,
    warps: [
      { x: 4, y: 1, to: 'route2', tx: 5, ty: 6, dir: 'down' },
      { x: 4, y: 24, to: 'route11', tx: 1, ty: 6, dir: 'down' }
    ],
    signs: [
      { x: 3, y: 2, text: "DIGLETT'S CAVE — Dug by POKéMON, not by people. Nobody is sure how far it goes." }
    ],
    npcs: [
      { x: 5, y: 23, sprite: 'workerm', dir: 'up',
        dialog: ['DIGLETT dug all of this. Every metre of it.',
                 'We just put the lights in and pretended it was ours.'] }
    ]
  };

  // ==========================================================================
  // ROUTE 11 — east out of Vermilion, under the Diglett tunnel's south mouth.
  // ==========================================================================
  G.MAPS.route11 = {
    id: 'route11', name: 'Route 11', w: 32, h: 12,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      hband(32, true),
      hband(32, false),
      '................................',
      '..ggggg.........ggggg...........',
      '..ggggg.........ggggg...........',
      'pppppppppppppppppppppppppppppppp',
      'pppppppppppppppppppppppppppppppp',
      '......llllll....................',
      '.....................ggggg......',
      '.....................ggggg......',
      hband(32, true),
      hband(32, false)
    ], 32, 12),
    deco: blank(32, 12),
    encounters: (G.ENCOUNTERS || {}).route11,
    warps: [
      { x: 0, y: 5, to: 'vermilion', tx: 23, ty: 7, dir: 'left' },
      { x: 0, y: 6, to: 'vermilion', tx: 23, ty: 7, dir: 'left' },
      { x: 1, y: 2, to: 'diglettscave', tx: 4, ty: 23, dir: 'up' }
    ],
    signs: [
      { x: 3, y: 3, text: "DIGLETT'S CAVE — north entrance. Comes out on ROUTE 2, near PEWTER." }
    ],
    trainers: [
      { x: 11, y: 8, sprite: 'youngster', dir: 'up', trainer: 'r11_eddie', sight: 3 },
      { x: 24, y: 3, sprite: 'gambler', dir: 'down', trainer: 'r11_hugo', sight: 3 }
    ]
  };

  // ==========================================================================
  // S.S. ANNE — the cruise liner. Blue is aboard, the captain is seasick, and
  // curing him is what gets you HM01 CUT, which is what unblocks half of Kanto.
  // ==========================================================================
  G.MAPS.ssanne = {
    id: 'ssanne', name: 'S.S. Anne', w: 24, h: 16,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIIIIIIIIIIIIIII',
      'I......II........II....I',
      'I.(..).II..TTTT..II.PP.I',
      'I......II........II....I',
      'I..o...II..o..o..II....I',
      'IIII.IIIIIII.IIIIIII.III',   // cabin doors at x=4, 12, 20
      'I......................I',
      'I......................I',   // the corridor
      'I......................I',
      'IIII.IIIIIII.IIIIIII.III',
      'I......II........II....I',
      'I.(..).II..TT....II.oo.I',
      'I......II........II....I',
      'I..o...II...o....II....I',
      'I......II........II....I',
      'IIIIIIIIIIII..IIIIIIIIII'
    ], 24, 16),
    deco: blank(24, 16),
    warps: [
      { x: 12, y: 15, to: 'vermilion', tx: 12, ty: 20, dir: 'down' },
      { x: 13, y: 15, to: 'vermilion', tx: 12, ty: 20, dir: 'down' }
    ],
    signs: [
      { x: 4, y: 3, text: 'A guest cabin. Somebody has left a half-finished postcard on the bunk.' },
      { x: 20, y: 3, text: 'The dining room. The buffet has been picked clean.' }
    ],
    npcs: [
      { x: 12, y: 7, sprite: 'captain', dir: 'down', event: 'ssanneCaptain' },
      { x: 4, y: 7, sprite: 'blue', dir: 'right', unlessFlag: 'blue_ssanne', event: 'ssanneRival' },
      { x: 19, y: 12, sprite: 'gentleman', dir: 'down',
        dialog: ['The S.S. ANNE sails tomorrow and does not come back for a year.',
                 'Whatever you came aboard for, do it now.'] },
      { x: 6, y: 13, sprite: 'beauty', dir: 'down',
        dialog: ['The CAPTAIN has been green since we left port.',
                 'A captain! Seasick! He would die before he admitted it to the crew.'] }
    ],
    trainers: [
      { x: 13, y: 11, sprite: 'sailor', dir: 'left', trainer: 'ss_dylan', sight: 3 },
      { x: 20, y: 4, sprite: 'gentleman', dir: 'left', trainer: 'ss_arthur', sight: 3 }
    ],
    items: [
      { x: 22, y: 11, item: 'maxpotion', once: 'ss_maxpotion' }
    ]
  };

  // ==========================================================================
  // ROUTE 9 — east out of Cerulean toward the Rock Tunnel. A small tree blocks
  // the way until you have CUT, which is what the S.S. Anne was for.
  // ==========================================================================
  G.MAPS.route9 = {
    id: 'route9', name: 'Route 9', w: 32, h: 12,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      hband(32, true),
      hband(32, false),
      '................................',
      '..ggggg.......ggggg.............',
      '..ggggg.......ggggg....ggggg....',
      'ppppppppppppXppppppppppppppppppp',
      'pppppppppppppppppppppppppppppppp',
      '.....llllll.....................',
      '..........................ggg...',
      '..........................ggg...',
      hband(32, true),
      hband(32, false)
    ], 32, 12),
    deco: blank(32, 12),
    encounters: (G.ENCOUNTERS || {}).route9,
    warps: [
      { x: 0, y: 5, to: 'cerulean', tx: 23, ty: 13, dir: 'left' },
      { x: 0, y: 6, to: 'cerulean', tx: 23, ty: 13, dir: 'left' },
      { x: 31, y: 5, to: 'rocktunnel1f', tx: 2, ty: 2, dir: 'right' },
      { x: 31, y: 6, to: 'rocktunnel1f', tx: 2, ty: 2, dir: 'right' }
    ],
    signs: [
      { x: 10, y: 4, text: 'A young tree has grown across the upper road. Something with CUT could clear it.' },
      { x: 29, y: 7, text: 'ROCK TUNNEL ahead — no lights. Bring a POKéMON that knows FLASH.' }
    ],
    trainers: [
      { x: 17, y: 3, sprite: 'hiker', dir: 'down', trainer: 'r9_dudley', sight: 3 },
      { x: 22, y: 8, sprite: 'cooltrainerf', dir: 'up', trainer: 'r9_wanda', sight: 3 }
    ]
  };

  // ==========================================================================
  // ROCK TUNNEL — pitch dark without FLASH, and the only road to Lavender.
  // The layout is deliberately branching: in the dark, a corridor you can see
  // one tile of should feel like it might be the wrong one.
  // ==========================================================================
  G.MAPS.rocktunnel1f = {
    id: 'rocktunnel1f', name: 'Rock Tunnel', w: 28, h: 18,
    music: 'cave', battleBg: 'cave', base: 'cavefloor',
    legend: G.LEG_CAVE,
    dark: true,
    ground: pad([
      '############################',
      '#,,........#...............#',
      '#,,...*....#....O......*...#',
      '#####.######.####.#########',
      '#.....#......#....#........#',
      '#..O..#..*...#....#...O....#',
      '#.....#......#....#........#',
      '#.#####......#....#####.####',
      '#.....#......#.........#...#',
      '#..*..#......#...*.....#...#',
      '#.....########.........#...#',
      '#.....#........#########...#',
      '#######...O....#.......#...#',
      '#..............#...*...#...#',
      '#....*.........#.......#...#',
      '#..............#########,,,#',
      '#..........................#',
      '############################'
    ], 28, 18),
    deco: blank(28, 18),
    encounters: (G.ENCOUNTERS || {}).rocktunnel1f,
    warps: [
      { x: 1, y: 1, to: 'route9', tx: 30, ty: 5, dir: 'left' },
      { x: 2, y: 1, to: 'route9', tx: 30, ty: 6, dir: 'left' },
      { x: 25, y: 15, to: 'route10', tx: 10, ty: 2, dir: 'down' }
    ],
    signs: [
      { x: 3, y: 2, text: 'ROCK TUNNEL — Unlit. Turn back or bring a light.' }
    ],
    trainers: [
      { x: 8, y: 8, sprite: 'hiker', dir: 'right', trainer: 'rt_lenny', sight: 2 },
      { x: 20, y: 5, sprite: 'pokemaniac', dir: 'left', trainer: 'rt_ashton', sight: 2 },
      { x: 12, y: 13, sprite: 'hiker', dir: 'down', trainer: 'rt_oliver', sight: 2 }
    ],
    items: [
      { x: 4, y: 16, item: 'escaperope', once: 'rt_rope' }
    ]
  };

  // ==========================================================================
  // ROUTE 10 — the short drop from the tunnel's south mouth into Lavender.
  // ==========================================================================
  G.MAPS.route10 = {
    id: 'route10', name: 'Route 10', w: 20, h: 16,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututu..tutututu',
      'vxvxvxvxvx..vxvxvxvx'
    ].concat(rows([
      '........pp......',   // 2
      '..ggg...pp......',
      '..ggg...pp..ggg.',
      '........pp..ggg.',
      '.lllll..pp......',
      '........pp......',
      '........pp......',
      '....y...pp....o.',
      '........pp......',
      '..ggg...pp......',
      '..ggg...pp..ggg.',
      '........pp......',
      '........pp......',
      '........pp......'    // 15
    ], 2)), 20, 16),
    deco: blank(20, 16),
    encounters: (G.ENCOUNTERS || {}).route10,
    warps: [
      { x: 10, y: 0, to: 'rocktunnel1f', tx: 25, ty: 14, dir: 'up' },
      { x: 11, y: 0, to: 'rocktunnel1f', tx: 25, ty: 14, dir: 'up' },
      { x: 10, y: 15, to: 'lavender', tx: 12, ty: 1, dir: 'down' },
      { x: 11, y: 15, to: 'lavender', tx: 13, ty: 1, dir: 'down' }
    ],
    signs: [
      { x: 9, y: 12, text: 'ROUTE 10 — LAVENDER TOWN to the south.' }
    ],
    trainers: [
      { x: 13, y: 7, sprite: 'picnicker', dir: 'left', trainer: 'r10_carol', sight: 3 }
    ]
  };

  // ==========================================================================
  // LAVENDER TOWN — no gym, no shop worth the name, and a tower full of
  // graves. It is the only town in Kanto with nothing to sell you, which is
  // exactly why it is the one people remember.
  // ==========================================================================
  G.MAPS.lavender = {
    id: 'lavender', name: 'Lavender Town', w: 26, h: 20,
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tutututututu..tutututututu',
      'vxvxvxvxvxvx..vxvxvxvxvxvx'
    ].concat(rows([
      '..........pp..........',   // 2
      '..7889....pp....GHHHI.',   // Centre                 the TOWER
      '..d+mh....pp....KLLLM.',
      '..WNEW....pp....WNEEW.',
      '..........pp..........',
      'pppppppppppppppppppppp',   // 7
      '..........pp..........',
      '...1223...pp...1223...',
      '...4556...pp...4556...',
      '...WNDW...pp...WNDW...',
      '..........pp..........',
      '..S.......pp.......Q..',
      '..........pp..........',
      '...qrrz...pp..........',   // 15 Mart
      '...i$jk...pp....V.....',
      '...WNEW...pp..........',
      '..........pp..........',
      '..........pp..........'    // 19
    ], 2))
      // The main street runs west out of town onto Route 8.
      .map(function (r, i) { return i === 7 ? 'pp' + r.slice(2) : r; }),
      26, 20),
    deco: blank(26, 20),
    warps: [
      { x: 0, y: 7, to: 'route8', tx: 30, ty: 5, dir: 'left' },
      { x: 1, y: 7, to: 'route8', tx: 30, ty: 6, dir: 'left' },
      { x: 12, y: 0, to: 'route10', tx: 10, ty: 14, dir: 'up' },
      { x: 13, y: 0, to: 'route10', tx: 11, ty: 14, dir: 'up' },
      { x: 6, y: 5, to: 'lavendercentre', tx: 4, ty: 6, dir: 'up' },
      { x: 20, y: 5, to: 'pokemontower1f', tx: 9, ty: 13, dir: 'up' },
      { x: 21, y: 5, to: 'pokemontower1f', tx: 10, ty: 13, dir: 'up' },
      { x: 7, y: 11, to: 'lavenderhouse', tx: 4, ty: 7, dir: 'up' },
      { x: 19, y: 11, to: 'mrfujihouse', tx: 4, ty: 7, dir: 'up' },
      { x: 7, y: 17, to: 'lavendermart', tx: 4, ty: 6, dir: 'up' }
    ],
    signs: [
      { x: 4, y: 13, text: 'LAVENDER TOWN — The Noble Purple Town.' },
      { x: 19, y: 6, text: 'POKéMON TOWER — Please be respectful. People are grieving here.' }
    ],
    npcs: [
      { x: 10, y: 8, sprite: 'oldwoman', dir: 'right',
        dialog: ['They put a POKéMON TOWER here because the ground is quiet.',
                 'It has not been quiet for weeks.'] },
      { x: 16, y: 13, sprite: 'channeler', dir: 'down',
        dialog: ['Something is up there that should not be.',
                 'It will not let anyone past the third floor. It is angry, and it is grieving.',
                 'You cannot fight what you cannot see.'] },
      { x: 14, y: 18, sprite: 'man', dir: 'down',
        dialog: ['Men in black uniforms have been going in and out of that tower.',
                 'Nobody stops them. Nobody dares.'] }
    ]
  };

  // ==========================================================================
  // ROUTE 8 — Lavender west toward Saffron. Saffron's east gate is shut like
  // all the others, so the road onward is the second UNDERGROUND PATH: the
  // east-west one, mirroring the north-south tunnel that got you to Vermilion.
  // Kanto seals a whole city and then quietly digs around it twice.
  // ==========================================================================
  G.MAPS.route8 = {
    id: 'route8', name: 'Route 8', w: 32, h: 12,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      hband(32, true),
      hband(32, false),
      '................................',
      '.....GHI........ggggg...........',
      '.....KLM........ggggg...........',
      'pppppWEWpppppppppppppppppppppppp',
      'pppppppppppppppppppppppppppppppp',
      '..........llllll................',
      '.......................ggg......',
      '.......................ggg......',
      hband(32, true),
      hband(32, false)
    ], 32, 12),
    deco: blank(32, 12),
    encounters: (G.ENCOUNTERS || {}).route8,
    warps: [
      { x: 31, y: 5, to: 'lavender', tx: 2, ty: 7, dir: 'right' },
      { x: 31, y: 6, to: 'lavender', tx: 2, ty: 7, dir: 'right' },
      { x: 6, y: 5, to: 'undergroundpath2', tx: 3, ty: 1, dir: 'down' }
    ],
    signs: [
      { x: 10, y: 4, text: 'SAFFRON CITY — east gate. CLOSED. Use the UNDERGROUND PATH.' }
    ],
    trainers: [
      { x: 18, y: 8, sprite: 'gambler', dir: 'up', trainer: 'r8_stan', sight: 3 },
      { x: 26, y: 3, sprite: 'cooltrainerm', dir: 'down', trainer: 'r8_hector', sight: 3 }
    ],
    npcs: [
      { x: 12, y: 7, sprite: 'policeman', dir: 'up',
        dialog: ['All four SAFFRON gates are shut and the guards will not say why.',
                 'Word is SILPH CO. has visitors it did not invite.'] }
    ]
  };

  // ==========================================================================
  // ROUTE 7 — the short hop from the tunnel's west mouth into Celadon.
  // ==========================================================================
  G.MAPS.route7 = {
    id: 'route7', name: 'Route 7', w: 20, h: 12,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      hband(20, true),
      hband(20, false),
      '....................',
      '..ggg.....GHI.......',
      '..ggg.....KLM.......',
      'pppppppppppppppppppp',
      'pppppppppppppppppppp',
      '.....lllll..........',
      '................ggg.',
      '................ggg.',
      hband(20, true),
      hband(20, false)
    ], 20, 12),
    deco: blank(20, 12),
    encounters: (G.ENCOUNTERS || {}).route7,
    warps: [
      { x: 0, y: 5, to: 'celadon', tx: 25, ty: 13, dir: 'left' },
      { x: 0, y: 6, to: 'celadon', tx: 25, ty: 13, dir: 'left' },
      { x: 11, y: 5, to: 'undergroundpath2', tx: 21, ty: 1, dir: 'down' }
    ],
    signs: [
      { x: 14, y: 4, text: 'SAFFRON CITY — west gate. CLOSED. UNDERGROUND PATH to LAVENDER below.' }
    ]
  };

  // ==========================================================================
  // CELADON CITY — the biggest city in Kanto. A department store, a gym behind
  // its own hedge, and a Game Corner that is very obviously a front.
  // ==========================================================================
  G.MAPS.celadon = {
    id: 'celadon', name: 'Celadon City', w: 28, h: 24,
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    gymEmblem: { x: 6, y: 16, type: 'grass' },
    ground: pad([
      'tutututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tu......................pptu',
      'vx..GHHHI.......7889....ppvx',
      'tu..KLLLM.......d+mh....pptu',
      'vx..WNEEW.......WNEW....ppvx',
      'tu......................pptu',
      'vxppppppppppppppppppppppppvx',
      'tu......................pptu',
      'vx..GHHHI.......1223....ppvx',
      'tu..KLLLM.......4556....pptu',
      'vx..WNEEW.......WNDW....ppvx',
      'tu......................pptu',
      'vxpppppppppppppppppppppppppp',
      'tu......................pptu',
      'vx..ABBC......f.........ppvx',
      'tu..abbc................pptu',
      'vx..WYYW.........Q......ppvx',
      'tu......................pptu',
      'vx..S...................ppvx',
      'tu......................pptu',
      'vx......................ppvx',
      'tu......................pptu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvxvx'
    ], 28, 24),
    deco: blank(28, 24),
    warps: [
      { x: 25, y: 13, to: 'route7', tx: 1, ty: 5, dir: 'right' },
      { x: 6, y: 5, to: 'celadonstore', tx: 6, ty: 10, dir: 'up' },
      { x: 7, y: 5, to: 'celadonstore', tx: 7, ty: 10, dir: 'up' },
      { x: 18, y: 5, to: 'celadoncentre', tx: 4, ty: 6, dir: 'up' },
      { x: 6, y: 11, to: 'gamecorner', tx: 8, ty: 12, dir: 'up' },
      { x: 7, y: 11, to: 'gamecorner', tx: 9, ty: 12, dir: 'up' },
      { x: 18, y: 11, to: 'celadonhouse', tx: 4, ty: 7, dir: 'up' },
      { x: 5, y: 17, to: 'celadongym', tx: 5, ty: 12, dir: 'up' },
      { x: 6, y: 17, to: 'celadongym', tx: 6, ty: 12, dir: 'up' }
    ],
    signs: [
      { x: 4, y: 20, text: 'CELADON CITY — The City of Rainbow Dreams.' },
      { x: 5, y: 6, text: 'CELADON DEPARTMENT STORE — Six floors. Everything you could want.' },
      { x: 5, y: 12, text: 'ROCKET GAME CORNER — The playground where everyone plays!' },
      { x: 5, y: 18, text: 'CELADON CITY POKéMON GYM — LEADER: ERIKA. The Nature-Loving Princess!' }
    ],
    npcs: [
      { x: 10, y: 15, sprite: 'gymguy', dir: 'right',
        dialog: ["ERIKA's POKéMON are GRASS types, and they will put you to sleep.",
                 'FIRE, ICE, FLYING or PSYCHIC. Anything else and you are in for a long afternoon.'] },
      { x: 20, y: 8, sprite: 'beauty', dir: 'down',
        dialog: ['The GAME CORNER has been here for years and I have never once seen anyone win.',
                 'Odd, that. For a casino.'] },
      { x: 14, y: 19, sprite: 'oldman', dir: 'down',
        dialog: ['A SNORLAX has been asleep across ROUTE 16 for as long as I can remember.',
                 'Nothing wakes it. People have tried everything short of music.'] }
    ]
  };

})();
