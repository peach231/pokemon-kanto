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
      { x: 7, y: 14, to: 'oakslab', tx: 7, ty: 11, dir: 'up' },
      { x: 10, y: 17, to: 'route21', tx: 8, ty: 1, dir: 'down' },
      { x: 11, y: 17, to: 'route21', tx: 9, ty: 1, dir: 'down' }
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
    ], 2))
      // The south street runs WEST out of town onto ROUTE 22 and the League
      // road. Without this the border tree stayed put and the warp sat inside
      // it — present in the warp graph, unreachable on foot.
      .map(function (r, i) { return i === 15 ? 'pp' + r.slice(2) : r; }),
      26, 24),
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
      { x: 0, y: 15, to: 'route22', tx: 20, ty: 5, dir: 'left' },
      { x: 1, y: 15, to: 'route22', tx: 20, ty: 6, dir: 'left' },
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
      '.......GHI......',
      '....S..KLM......',
      '.......WEW......',
      '........pp......',
      '........pp......',   // 10
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
      // The NORTH gate, which was never built. Red and Blue put a gate house
      // at each end of VIRIDIAN FOREST; with only the southern one the forest
      // was a one-way door, and since the tree band across the middle of this
      // route is the only other thing joining its two halves, PEWTER was a
      // one-way trip. Getting home meant DIGLETT'S CAVE and a lap of Kanto.
      { x: 10, y: 8, to: 'viridianforest', tx: 12, ty: 1, dir: 'down' },
      { x: 5, y: 5, to: 'diglettscave', tx: 4, ty: 2, dir: 'up' }
    ],
    signs: [
      { x: 9, y: 7, text: 'ROUTE 2 — VIRIDIAN FOREST ahead. Watch out for wild POKéMON in the tall grass.' },
      { x: 9, y: 21, text: 'VIRIDIAN FOREST — Entrance. Trainers welcome. Bring repellent.' }
    ],
    npcs: [
      { x: 13, y: 25, sprite: 'oldman', dir: 'left',
        dialog: ['The forest is the only road north, and it is full of BUG POKéMON.',
                 'A FLYING or FIRE type makes short work of them.'] },
      { x: 6, y: 8, sprite: 'scientist', dir: 'down', event: 'oaksAideFlash' }
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
      { x: 13, y: 0, to: 'route2', tx: 11, ty: 9, dir: 'up' },
      { x: 12, y: 0, to: 'route2', tx: 10, ty: 9, dir: 'up' },
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
      { x: 5, y: 10, to: 'pewtergym', tx: 5, ty: 10, dir: 'up' },
      { x: 6, y: 10, to: 'pewtergym', tx: 6, ty: 10, dir: 'up' },
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
      '#..........................#',
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
      'E~~~~~....pp....7889..',   // 3  the cave door, across the water
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
      '..........pp..1223....',
      '..........pp..4556....',
      '..........pp..WNDW....'    // 23
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
      { x: 5, y: 11, to: 'ceruleangym', tx: 5, ty: 10, dir: 'up' },
      { x: 6, y: 11, to: 'ceruleangym', tx: 6, ty: 10, dir: 'up' },
      { x: 20, y: 5, to: 'ceruleancentre', tx: 4, ty: 6, dir: 'up' },
      { x: 20, y: 17, to: 'ceruleanmart', tx: 4, ty: 6, dir: 'up' },

      { x: 20, y: 11, to: 'ceruleanhouse', tx: 4, ty: 7, dir: 'up' },
      { x: 18, y: 22, to: 'bikeshop', tx: 4, ty: 7, dir: 'up' },
      { x: 7, y: 17, to: 'robbedhouse', tx: 4, ty: 7, dir: 'up' },
      { x: 2, y: 3, to: 'ceruleancave1f', tx: 1, ty: 15, dir: 'up', needFlag: 'badge7',
        deniedText: 'A steel shutter, with a notice bolted to it: UNSTABLE. LEAGUE PERSONNEL ONLY. Seven BADGES is what the LEAGUE counts as personnel.' }
    ],
    signs: [
      { x: 4, y: 19, text: 'CERULEAN CITY — A Mysterious, Blue Aura Surrounds It.' },
      { x: 5, y: 12, text: 'CERULEAN CITY POKéMON GYM — LEADER: MISTY. The Tomboyish Mermaid!' },
      { x: 3, y: 6, text: 'Across the water: UNKNOWN DUNGEON. Closed by order of the POKéMON LEAGUE.' }
    ],
    npcs: [
      { x: 10, y: 8, sprite: 'gymguy', dir: 'right',
        dialog: ['MISTY uses WATER POKéMON, and her STARMIE is fast and hits hard.',
                 'ELECTRIC or GRASS moves. Anything else and you are just chipping at it.'] },
      { x: 9, y: 18, sprite: 'policeman', dir: 'down',
        dialog: ['A house was broken into last night. Went straight through the back wall.',
                 'Black uniforms, red R on the chest. Nobody will say the name out loud.'] },
      { x: 17, y: 19, sprite: 'oldman', dir: 'left',
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
      { x: 5, y: 17, to: 'vermiliongym', tx: 5, ty: 10, dir: 'up' },
      { x: 6, y: 17, to: 'vermiliongym', tx: 6, ty: 10, dir: 'up' },
      { x: 6, y: 5, to: 'vermilioncentre', tx: 4, ty: 6, dir: 'up' },
      { x: 20, y: 5, to: 'vermilionmart', tx: 4, ty: 6, dir: 'up' },
      { x: 7, y: 11, to: 'vermilionhouse', tx: 4, ty: 7, dir: 'up' },
      { x: 19, y: 11, to: 'vermilionfanclub', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 18, y: 18, text: 'VERMILION CITY — The Port of Exquisite Sunsets.' },
      { x: 20, y: 16, text: 'A lorry, parked by the dock. No plates, no markings, and no record of it in the harbour office.' },
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
      { x: 1, y: 2, to: 'diglettscave', tx: 4, ty: 23, dir: 'up' },
      { x: 31, y: 5, to: 'route12', tx: 1, ty: 24, dir: 'right' },
      { x: 31, y: 6, to: 'route12', tx: 1, ty: 24, dir: 'right' }
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
      '#,,...*.........O......*...#',
      '#####.######.####.##########',
      '#.....#......#....#........#',
      '#..O..#..*...#....#...O....#',
      '#.....#......#....#........#',
      '#.#####......#....#####.####',
      '#.....#......#.............#',
      '#..*..#......#...*.....#...#',
      '#.....########.........#...#',
      '#.....#........#########...#',
      '#######...O....#.......#...#',
      '#..................*...#...#',
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
      '........pp......',   //  2
      '..ggg...pp......',
      '..ggg...pp......',
      '........pp.[~~~~',   //  5  the lake. The POWER PLANT is on the far bank
      '.lllll..pp.[~~~~',   //      and there is no bridge, because the plant
      '........pp.[~~~E',   //  8  the door is on the FAR bank. No bridge was
      '........pp.[~~~E',   //  9  ever built; the plant closed before one was.
      '....y...pp.[~~~~',
      '........pp.[~~~~',
      '..ggg...pp.[~~~~',
      '..ggg...pp.[~~~~',
      '........pp.[~~~~',
      '........pp......',
      '........pp......'    // 15
    ], 2)), 20, 16),
    deco: blank(20, 16),
    encounters: (G.ENCOUNTERS || {}).route10,
    warps: [
      { x: 10, y: 0, to: 'rocktunnel1f', tx: 25, ty: 14, dir: 'up' },
      { x: 11, y: 0, to: 'rocktunnel1f', tx: 25, ty: 14, dir: 'up' },
      { x: 10, y: 15, to: 'lavender', tx: 12, ty: 1, dir: 'down' },
      { x: 11, y: 15, to: 'lavender', tx: 13, ty: 1, dir: 'down' },
      { x: 17, y: 8, to: 'powerplant', tx: 19, ty: 15, dir: 'right' },
      { x: 17, y: 9, to: 'powerplant', tx: 19, ty: 15, dir: 'right' }
    ],
    signs: [
      { x: 9, y: 12, text: 'ROUTE 10 — LAVENDER TOWN to the south.' },
      { x: 9, y: 5, text: 'POWER PLANT — DECOMMISSIONED. No access. (Across the water, and nobody built a bridge.)' }
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
      { x: 7, y: 17, to: 'lavendermart', tx: 4, ty: 6, dir: 'up' },
      { x: 12, y: 19, to: 'route12', tx: 10, ty: 1, dir: 'down' },
      { x: 13, y: 19, to: 'route12', tx: 11, ty: 1, dir: 'down' }
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
      { x: 6, y: 5, to: 'undergroundpath2', tx: 3, ty: 1, dir: 'down' },
      { x: 0, y: 5, to: 'saffron', tx: 25, ty: 7, dir: 'left' },
      { x: 0, y: 6, to: 'saffron', tx: 25, ty: 7, dir: 'left' }
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
                 'Word is SILPH CO. has visitors it did not invite.'] },
      { x: 1, y: 5, sprite: 'rocket', dir: 'right', unlessFlag: 'rh_giovanni', event: 'saffronGate' },
      { x: 1, y: 6, sprite: 'rocket', dir: 'right', unlessFlag: 'rh_giovanni', event: 'saffronGate' }
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
      { x: 19, y: 5, to: 'saffron', tx: 2, ty: 7, dir: 'right' },
      { x: 19, y: 6, to: 'saffron', tx: 2, ty: 7, dir: 'right' },
      { x: 11, y: 5, to: 'undergroundpath2', tx: 21, ty: 1, dir: 'down' }
    ],
    signs: [
      { x: 14, y: 4, text: 'SAFFRON CITY — west gate. UNDERGROUND PATH to LAVENDER below.' }
    ],
    npcs: [
      { x: 18, y: 5, sprite: 'rocket', dir: 'left', unlessFlag: 'rh_giovanni', event: 'saffronGate' },
      { x: 18, y: 6, sprite: 'rocket', dir: 'left', unlessFlag: 'rh_giovanni', event: 'saffronGate' }
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
      'tu..GHHHI...............pptu',   // the DEPARTMENT STORE — six floors,
      'vx..KLLLM.......7889....ppvx',   // and it should look like six floors
      'tu..WNNNW.......d+mh....pptu',   // from the street
      'vx..WNNNW.......WNEW....ppvx',
      'tu..WNEEW...............pptu',
      'vxppppppppppppppppppppppppvx',
      'tu......................pptu',
      'vx..GHHHI.......1223....ppvx',
      'tu..KLLLM.......4556....pptu',
      'vx..WNEEW.......WNDW....ppvx',
      'tu......................pptu',
      'pppppppppppppppppppppppppppp',
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
      { x: 0, y: 13, to: 'route16', tx: 24, ty: 6, dir: 'left' },
      { x: 1, y: 13, to: 'route16', tx: 24, ty: 7, dir: 'left' },
      { x: 6, y: 6, to: 'celadonstore1', tx: 6, ty: 9, dir: 'up' },
      { x: 7, y: 6, to: 'celadonstore1', tx: 7, ty: 9, dir: 'up' },
      { x: 18, y: 5, to: 'celadoncentre', tx: 4, ty: 6, dir: 'up' },
      { x: 6, y: 11, to: 'gamecorner', tx: 8, ty: 12, dir: 'up' },
      { x: 7, y: 11, to: 'gamecorner', tx: 9, ty: 12, dir: 'up' },
      { x: 18, y: 11, to: 'celadonhouse', tx: 4, ty: 7, dir: 'up' },
      { x: 5, y: 17, to: 'celadongym', tx: 5, ty: 10, dir: 'up' },
      { x: 6, y: 17, to: 'celadongym', tx: 6, ty: 10, dir: 'up' }
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


  // ==========================================================================
  // SAFFRON CITY — sealed for the whole midgame, and this is where it opens.
  // Team Rocket took SILPH CO. and closed the gates from the inside; losing the
  // Celadon hideout is what forces them to consolidate here, so beating
  // Giovanni underground is what lets you through the doors.
  //
  // The city is full of Rockets standing in the street. Nobody else is out.
  // ==========================================================================
  G.MAPS.saffron = {
    id: 'saffron', name: 'Saffron City', w: 28, h: 24,
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    gymEmblem: { x: 6, y: 16, type: 'psychic' },
    ground: pad([
      'tutututututututututututututu',
      'vx..GHHHI...vxvxvxvxvxvxvxvx',   // SILPH CO. — the tallest building in
      'tu..KLLLM..............pptu.'.slice(0, 28),   // KANTO, and it should
      'vx..WNNNW.......7889....ppvx',   // block the skyline from the street
      'tu..WNNNW.......d+mh....pptu',
      'vx..WNNNW.......WNEW....ppvx',
      'tu..WNEEW...............pptu',
      'pppppppppppppppppppppppppppp',
      'tu......................pptu',
      'vx..............qrrz....ppvx',
      'tu..GHHHI.......i$jk....pptu',
      'vx..KLLLM.......WNEW....ppvx',
      'tu..WNEEW...............pptu',
      'pppppppppppppppppppppppppppp',
      'tu......................pptu',
      'vx..ABBC.......1223.....ppvx',
      'tu..abbc.......4556.....pptu',
      'vx..WYYW.......WNDW.....ppvx',
      'tu......................pptu',
      'vx..S...................ppvx',
      'tu......................pptu',
      'vx......................ppvx',
      'tu......................pptu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvxvx'
    ], 28, 24),
    deco: blank(28, 24),
    warps: [
      { x: 0, y: 7, to: 'route7', tx: 18, ty: 5, dir: 'left' },
      { x: 1, y: 7, to: 'route7', tx: 18, ty: 5, dir: 'left' },
      { x: 27, y: 7, to: 'route8', tx: 1, ty: 5, dir: 'right' },
      { x: 26, y: 7, to: 'route8', tx: 1, ty: 5, dir: 'right' },
      { x: 6, y: 6, to: 'silphco1f', tx: 10, ty: 16, dir: 'up' },
      { x: 7, y: 6, to: 'silphco1f', tx: 11, ty: 16, dir: 'up' },
      { x: 18, y: 5, to: 'saffroncentre', tx: 4, ty: 6, dir: 'up' },
      { x: 18, y: 11, to: 'saffronmart', tx: 4, ty: 6, dir: 'up' },
      { x: 6, y: 12, to: 'fightingdojo', tx: 6, ty: 11, dir: 'up' },
      { x: 7, y: 12, to: 'fightingdojo', tx: 7, ty: 11, dir: 'up' },
      { x: 5, y: 17, to: 'saffrongym', tx: 5, ty: 10, dir: 'up' },
      { x: 6, y: 17, to: 'saffrongym', tx: 6, ty: 10, dir: 'up' },
      { x: 17, y: 17, to: 'saffronhouse', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 4, y: 20, text: 'SAFFRON CITY — Shining, Golden Land of Commerce.' },
      { x: 5, y: 6, text: 'SILPH CO. — HEAD OFFICE. Visitors report to reception. (Reception is empty.)' },
      { x: 5, y: 18, text: 'SAFFRON CITY POKéMON GYM — LEADER: SABRINA. The Master of Psychic POKéMON!' },
      { x: 5, y: 13, text: 'FIGHTING DOJO — Karate master within. Challengers welcome.' }
    ],
    npcs: [
      { x: 12, y: 8, sprite: 'rocket', dir: 'down',
        dialog: ['Nothing to see. Move along.',
                 'The whole city is ours until the BOSS says otherwise.'] },
      { x: 20, y: 14, sprite: 'rocket', dir: 'left',
        dialog: ['SILPH is making something worth more than this entire town.',
                 'We are just here to collect it.'] },
      { x: 10, y: 19, sprite: 'gymguy', dir: 'right',
        dialog: ["SABRINA bent a spoon with her mind when she was a child, and it frightened her.",
                 'PSYCHIC has almost no counters this generation. BUG moves, and not much else.'] },
      { x: 22, y: 20, sprite: 'oldwoman', dir: 'down',
        dialog: ['They shut the gates for weeks. Nobody in, nobody out.',
                 'And every one of us just... waited. That is the part I cannot forgive.'] }
    ]
  };


  // ==========================================================================
  // ROUTE 12 — the long coastal road south out of LAVENDER, sea down its whole
  // east flank. A SNORLAX is asleep across the middle of it and has been for
  // years; nothing shifts it, and the town has given up trying.
  //
  // This is where Kanto stops being a corridor. The road forks, the water is
  // fishable end to end, and once you have SURF you can leave the path
  // entirely and strike east into open sea.
  // ==========================================================================
  G.MAPS.route12 = {
    id: 'route12', name: 'Route 12', w: 20, h: 32,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututupptutututu',
      'vxvxvxvxvxppvxvxvxvx',
      'tu........pp......tu',
      'vx........pp......vx',
      'tu..ggg...pp.[~~~~tu',
      'vx..ggg...pp.[~~~~vx',
      'tu........pp.[~~~~tu',
      'vx....S...pp.[~~~~vx',
      'tu........pp.[~~~~tu',
      'vx........pp.[~~~~vx',
      'tu........pp.[~~~~tu',
      'vx........OO.[~~~~vx',
      'tu........pp.[~~~~tu',
      'vx........pp.[~~~~vx',
      'tu..ggggg.pp.[~~~~tu',
      'vx..ggggg.pp.[~~~~vx',
      'tu........pp.[~~~~tu',
      'vx.lllllllpp.[~~~~vx',
      'tu........pp.[~~~~tu',
      'vx........pp.[~~~~vx',
      'tu..GHI...pp.[~~~~tu',
      'vx..KLM...pp.[~~~~vx',
      'tu..WEW...pp.[~~~~tu',
      'vx........pp.[~~~~vx',
      'pppppppppppp.[~~~~tu',
      'vx........pp.[~~~~vx',
      'tu..ggg...pp.[~~~~tu',
      'vx..ggg...pp.[~~~~vx',
      'tu........pp.[~~~~tu',
      'vx........pp.[~~~~vx',
      'tututututupptutututu',
      'vxvxvxvxvxppvxvxvxvx'
    ], 20, 32),
    deco: blank(20, 32),
    encounters: (G.ENCOUNTERS || {}).route12,
    warps: [
      { x: 10, y: 0, to: 'lavender', tx: 12, ty: 18, dir: 'up' },
      { x: 11, y: 0, to: 'lavender', tx: 13, ty: 18, dir: 'up' },
      { x: 0, y: 24, to: 'route11', tx: 30, ty: 5, dir: 'left' },
      { x: 1, y: 24, to: 'route11', tx: 30, ty: 6, dir: 'left' },
      { x: 10, y: 31, to: 'route13', tx: 2, ty: 2, dir: 'down' },
      { x: 11, y: 31, to: 'route13', tx: 3, ty: 2, dir: 'down' },
      { x: 5, y: 22, to: 'fishinghut', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 6, y: 7, text: 'ROUTE 12 — SILENCE BRIDGE. Fishing from the rail is permitted.' }
    ],
    npcs: [
      { x: 10, y: 11, sprite: 'snorlax', obj: true, dir: 'down', unlessFlag: 'snorlax12', event: 'snorlaxWake' },
      { x: 11, y: 11, sprite: 'snorlax', obj: true, dir: 'down', unlessFlag: 'snorlax12', event: 'snorlaxWake' },
      { x: 9, y: 10, sprite: 'oldman', dir: 'right', unlessFlag: 'snorlax12',
        dialog: ['That is a SNORLAX. It has been asleep across this road since before I was born.',
                 'Shouting does nothing. Shoving does nothing. It just breathes.',
                 'They say one sound in the world will wake it, and nobody has it.'] },
      { x: 16, y: 6, sprite: 'fisher', dir: 'left',
        dialog: ['This water runs all the way down to FUCHSIA and out to sea.',
                 'A SUPER ROD gets you things an OLD ROD never will.'] }
    ],
    trainers: [
      { x: 6, y: 14, sprite: 'fisher', dir: 'right', trainer: 'r12_martin', sight: 3 },
      { x: 8, y: 19, sprite: 'fisher', dir: 'right', trainer: 'r12_stephen', sight: 3 },
      { x: 5, y: 27, sprite: 'birdkeeper', dir: 'right', trainer: 'r12_perry', sight: 3 }
    ]
  };

  // ==========================================================================
  // ROUTE 13 — the turn west. Open ground, almost no cover, and a line of
  // trainers who can all see a long way. Kanto's south-east is where the
  // difficulty stops being about the type chart and starts being about
  // attrition: nothing here counters you, there is just a lot of it.
  // ==========================================================================
  G.MAPS.route13 = {
    id: 'route13', name: 'Route 13', w: 30, h: 14,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tupptututututututututututututu',
      'vxppvxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tu..pp......................tu',
      'vx..pp......................vx',
      'tu..pp....ggggg.......ggggg.tu',
      'vx..pp....ggggg.......ggggg.vx',
      'pppppppppppppppppppppppppppptu',
      'ppppppppppppppppppppppppppppvx',
      'tu........llllll............tu',
      'vx..............ggggg.......vx',
      'tu..............ggggg.......tu',
      'vx..........................vx',
      'tututututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvxvxvx'
    ], 30, 14),
    deco: blank(30, 14),
    encounters: (G.ENCOUNTERS || {}).route13,
    warps: [
      { x: 2, y: 0, to: 'route12', tx: 10, ty: 30, dir: 'up' },
      { x: 3, y: 0, to: 'route12', tx: 11, ty: 30, dir: 'up' },
      { x: 0, y: 6, to: 'route14', tx: 21, ty: 2, dir: 'left' },
      { x: 0, y: 7, to: 'route14', tx: 21, ty: 3, dir: 'left' }
    ],
    signs: [
      { x: 5, y: 5, text: 'ROUTE 13 — FUCHSIA CITY, west. LAVENDER TOWN, north.' }
    ],
    trainers: [
      { x: 10, y: 4, sprite: 'birdkeeper', dir: 'down', trainer: 'r13_perry', sight: 4 },
      { x: 16, y: 9, sprite: 'beauty', dir: 'up', trainer: 'r13_lola', sight: 4 },
      { x: 22, y: 4, sprite: 'cooltrainerf', dir: 'down', trainer: 'r13_naomi', sight: 4 },
      { x: 26, y: 10, sprite: 'juggler', dir: 'up', trainer: 'r13_irwin', sight: 4 }
    ]
  };

  // ==========================================================================
  // ROUTE 14 — bikers. The gang that owns CYCLING ROAD ranges this far east,
  // so you meet them here, on foot, before you ever see the road itself.
  // ==========================================================================
  G.MAPS.route14 = {
    id: 'route14', name: 'Route 14', w: 24, h: 18,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tutututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvx',
      'tu.................ppptu',
      'vx.................pppvx',
      'tu......ggggg......pp.tu',
      'vx......ggggg......pp.vx',
      'tu.................pp.tu',
      'vxppppppppppppppppppppvx',
      'tupppppppppppppppppppptu',
      'vx.........lllll......vx',
      'tu..ggggg.............tu',
      'vx..ggggg.............vx',
      'tu....................tu',
      'pppppppppppppp........vx',
      'tu....................tu',
      'vx....................vx',
      'tutututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvx'
    ], 24, 18),
    deco: blank(24, 18),
    encounters: (G.ENCOUNTERS || {}).route14,
    warps: [
      { x: 21, y: 2, to: 'route13', tx: 1, ty: 6, dir: 'right' },
      { x: 21, y: 3, to: 'route13', tx: 1, ty: 7, dir: 'right' },
      { x: 0, y: 13, to: 'route15', tx: 30, ty: 5, dir: 'left' },
      { x: 1, y: 13, to: 'route15', tx: 30, ty: 6, dir: 'left' }
    ],
    signs: [
      { x: 4, y: 12, text: 'ROUTE 14 — Beware of bicycles at speed.' }
    ],
    trainers: [
      { x: 8, y: 4, sprite: 'biker', dir: 'down', trainer: 'r14_lukas', sight: 4 },
      { x: 14, y: 10, sprite: 'biker', dir: 'left', trainer: 'r14_isaac', sight: 4 },
      { x: 5, y: 15, sprite: 'birdkeeper', dir: 'right', trainer: 'r14_bryce', sight: 4 },
      { x: 18, y: 11, sprite: 'biker', dir: 'up', trainer: 'r14_hideo', sight: 4 }
    ],
    npcs: [
      { x: 11, y: 14, sprite: 'biker', dir: 'down',
        dialog: ['We ride CYCLING ROAD. Down the hill, west of here, all the way to FUCHSIA.',
                 'No pedalling. It is downhill the whole way and you cannot stop.'] }
    ]
  };

  // ==========================================================================
  // ROUTE 15 — the last stretch into FUCHSIA, running underneath CYCLING
  // ROAD's southern end. The two-storey gate is how the road above crosses the
  // road below without either of them noticing the other.
  // ==========================================================================
  G.MAPS.route15 = {
    id: 'route15', name: 'Route 15', w: 32, h: 12,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tutututututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tuGHI.....ggggg...............tu',
      'vxKLM.....ggggg...............vx',
      'tuWEW.........................tu',
      'pppppppppppppppppppppppppppppppp',
      'pppppppppppppppppppppppppppppppp',
      'vx.......lllllll..............vx',
      'tu...................ggggg....tu',
      'vx...................ggggg....vx',
      'tutututututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvxvxvxvx'
    ], 32, 12),
    deco: blank(32, 12),
    encounters: (G.ENCOUNTERS || {}).route15,
    warps: [
      { x: 31, y: 5, to: 'route14', tx: 1, ty: 13, dir: 'right' },
      { x: 31, y: 6, to: 'route14', tx: 1, ty: 13, dir: 'right' },
      { x: 0, y: 5, to: 'fuchsia', tx: 28, ty: 9, dir: 'left' },
      { x: 0, y: 6, to: 'fuchsia', tx: 28, ty: 9, dir: 'left' },
      { x: 3, y: 4, to: 'superrodhut', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 6, y: 4, text: 'ROUTE 15 — FUCHSIA CITY, west. LAVENDER TOWN, a very long way north.' }
    ],
    trainers: [
      { x: 12, y: 3, sprite: 'birdkeeper', dir: 'down', trainer: 'r15_chester', sight: 3 },
      { x: 20, y: 8, sprite: 'cooltrainerm', dir: 'up', trainer: 'r15_dalton', sight: 3 },
      { x: 26, y: 3, sprite: 'beauty', dir: 'down', trainer: 'r15_grace', sight: 3 }
    ]
  };

  // ==========================================================================
  // FUCHSIA CITY — a town built around a wildlife preserve, which makes it the
  // strangest place in Kanto: half quiet fishing town, half a fence with
  // something enormous breathing on the other side.
  //
  // KOGA's gym is here and so is the SAFARI ZONE gate, and the Safari Zone is
  // where SURF and STRENGTH come from. That makes Fuchsia the hinge the entire
  // back half of the region turns on — every route you have not walked yet is
  // on the far side of water or a boulder, and both keys are in there.
  // ==========================================================================
  G.MAPS.fuchsia = {
    id: 'fuchsia', name: 'Fuchsia City', w: 30, h: 22,
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    gymEmblem: { x: 6, y: 16, type: 'poison' },
    ground: pad([
      'tututututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tu........GHHHI.............tu',
      'vx........KLLLM.............vx',
      'tu........WNEEW.............tu',
      'vx..........pp..............vx',
      'tu..7889....pp....qrrz......tu',
      'vx..d+mh....pp....i$jk......vx',
      'tu..WNEW....pp....WNEW......tu',
      'pppppppppppppppppppppppppppppp',
      'tu..........pp..............tu',
      'vx..FFFFF...pp...FFFFF......vx',
      'tu..F...F...pp...F...F......tu',
      'vx..F.Q.F...pp...F.Q.F......vx',
      'tu..FFFFF...pp...FFFFF......tu',
      'vx..........pp..............vx',
      'tu..ABBC....pp....1223......tu',
      'vx..abbc....pp....4556......vx',
      'tu..WYYW....pp....WNDW......tu',
      'vx..S.......pp..............vx',
      'tu..........pp..............tu',
      'vxvxvxvxvxvx..vxvxvxvxvxvxvxvx'
    ], 30, 22),
    deco: blank(30, 22),
    warps: [
      { x: 0, y: 9, to: 'route18', tx: 24, ty: 6, dir: 'left' },
      { x: 1, y: 9, to: 'route18', tx: 24, ty: 7, dir: 'left' },
      { x: 29, y: 9, to: 'route15', tx: 1, ty: 5, dir: 'right' },
      { x: 28, y: 9, to: 'route15', tx: 1, ty: 5, dir: 'right' },
      { x: 12, y: 21, to: 'route19', tx: 8, ty: 1, dir: 'down' },
      { x: 13, y: 21, to: 'route19', tx: 9, ty: 1, dir: 'down' },
      { x: 12, y: 4, to: 'safarigate', tx: 4, ty: 7, dir: 'up' },
      { x: 13, y: 4, to: 'safarigate', tx: 5, ty: 7, dir: 'up' },
      { x: 6, y: 8, to: 'fuchsiacentre', tx: 4, ty: 6, dir: 'up' },
      { x: 20, y: 8, to: 'fuchsiamart', tx: 4, ty: 6, dir: 'up' },
      { x: 5, y: 18, to: 'fuchsiagym', tx: 1, ty: 15, dir: 'up' },
      { x: 6, y: 18, to: 'fuchsiagym', tx: 1, ty: 15, dir: 'up' },
      { x: 20, y: 18, to: 'wardenhouse', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 4, y: 19, text: 'FUCHSIA CITY — Behold! It is passion and pride!' },
      { x: 5, y: 5, text: 'SAFARI ZONE — Entrance gate. ₽500 for 30 SAFARI BALLs and 600 steps.' },
      { x: 5, y: 15, text: 'FUCHSIA CITY POKéMON GYM — LEADER: KOGA. The Poisonous Ninja Master!' }
    ],
    npcs: [
      { x: 10, y: 12, sprite: 'oldman', dir: 'right',
        dialog: ['These enclosures are the old zoo. We keep them because the children like them.',
                 'The real animals are through the gate, and they are not behind anything.'] },
      { x: 18, y: 13, sprite: 'gymguy', dir: 'left',
        dialog: ['KOGA fights like a ninja, which mostly means he fights like a coward.',
                 'TOXIC, then DOUBLE TEAM, then he waits you out. Bring an ANTIDOTE and something that hits hard and fast.',
                 'PSYCHIC ends him. PSYCHIC ends most things, this generation.'] },
      { x: 22, y: 20, sprite: 'fisher', dir: 'down',
        dialog: ['South of town is open water all the way to CINNABAR.',
                 'Nobody walks it. You SURF it, or you do not go.'] },
      { x: 16, y: 10, sprite: 'littlegirl', dir: 'down',
        dialog: ['The WARDEN lost his teeth somewhere in the SAFARI ZONE.',
                 'He cannot say a word without them. It is very sad and a little bit funny.'] }
    ]
  };

  // ==========================================================================
  // THE SAFARI ZONE — four connected preserves. No trainers, no visible
  // fences, and a step counter running the entire time you are inside.
  //
  // Everything the back half of Kanto needs is in here, and both halves of it
  // are as far from the gate as the preserve can put them: SURF in the SECRET
  // HOUSE at the far west, and the WARDEN's GOLD TEETH out in the east marsh,
  // which is what buys you STRENGTH. The step limit is the puzzle — you cannot
  // fetch both in one visit unless you know exactly where you are going.
  // ==========================================================================
  function safariArea(id, name, rowsIn, opts) {
    G.MAPS[id] = {
      id: id, name: name, w: 26, h: 20,
      music: 'route', battleBg: 'meadow', base: 'grass',
      legend: G.LEG_EXT, safari: true,
      ground: pad(rowsIn, 26, 20),
      deco: blank(26, 20),
      encounters: (G.ENCOUNTERS || {})[id],
      warps: opts.warps,
      signs: opts.signs || [],
      npcs: opts.npcs || [],
      items: opts.items || []
    };
  }

  safariArea('safarizonecenter', 'Safari Zone — Centre', [
      'tutututututu..tutututututu',
      'vxvxvxvxvxvx..vxvxvxvxvxvx',
      'tu......................tu',
      'vx..ggggg......ggggg....vx',
      'tu..ggggg......ggggg....tu',
      'vx......................vx',
      'tu...~~~~~..............tu',
      'vx...~~~~~....GHHHI.....vx',
      'tu...~~~~~....KLLLM.....tu',
      'vx............WNEEW.....vx',
      'pp......................pp',
      'vx......................vx',
      'tu..ggggg......ggggg....tu',
      'vx..ggggg......ggggg....vx',
      'tu.....O................tu',
      'vx......................vx',
      'tu..ggggg......ggggg....tu',
      'vx..ggggg......ggggg....vx',
      'tu..........pp..........tu',
      'vxvxvxvxvxvx..vxvxvxvxvxvx'
    ], {
    warps: [
      { x: 12, y: 19, to: 'safarigate', tx: 5, ty: 5, dir: 'down' },
      { x: 13, y: 19, to: 'safarigate', tx: 6, ty: 5, dir: 'down' },
      { x: 12, y: 0, to: 'safarizonenorth', tx: 12, ty: 18, dir: 'up' },
      { x: 13, y: 0, to: 'safarizonenorth', tx: 13, ty: 18, dir: 'up' },
      { x: 0, y: 10, to: 'safarizonewest', tx: 24, ty: 10, dir: 'left' },
      { x: 1, y: 10, to: 'safarizonewest', tx: 24, ty: 10, dir: 'left' },
      { x: 25, y: 10, to: 'safarizoneeast', tx: 1, ty: 10, dir: 'right' },
      { x: 24, y: 10, to: 'safarizoneeast', tx: 1, ty: 10, dir: 'right' },
      { x: 16, y: 9, to: 'safarirest', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 8, y: 14, text: 'SAFARI ZONE — CENTRE. West: the old ranges. East: the marsh. North: the plain.' }
    ],
    npcs: [
      { x: 18, y: 14, sprite: 'scientist', dir: 'left',
        dialog: ['Nothing in here has ever met a trainer, so nothing in here plays by trainer rules.',
                 'You have SAFARI BALLs, you have bait and you have rocks. That is the whole toolkit.'] }
    ]
  });

  safariArea('safarizonewest', 'Safari Zone — West', [
      'tututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tu......................tu',
      'vx...GHHHI..............vx',
      'tu...KLLLM....ggggg.....tu',
      'vx...WNEEW....ggggg.....vx',
      'tu......................tu',
      'vx....~~~~~~~~..........vx',
      'tu....~~~~~~~~..........tu',
      'vx....~~~~~~~~..........vx',
      'tu......................pp',
      'vx......................vx',
      'tu..ggggg......ggggg....tu',
      'vx..ggggg......ggggg....vx',
      'tu......................tu',
      'vx.......O..............vx',
      'tu..ggggg......ggggg....tu',
      'vx..ggggg......ggggg....vx',
      'tu......................tu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvx'
    ], {
    warps: [
      { x: 25, y: 10, to: 'safarizonecenter', tx: 1, ty: 10, dir: 'right' },
      { x: 24, y: 10, to: 'safarizonecenter', tx: 1, ty: 10, dir: 'right' },
      { x: 8, y: 5, to: 'secrethouse', tx: 5, ty: 7, dir: 'up' },
      { x: 7, y: 5, to: 'secrethouse', tx: 6, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 12, y: 3, text: 'A hut. No path leads to it and nobody will say who built it.' }
    ],
    items: [
      { x: 20, y: 16, item: 'goldteeth', flag: 'got_goldteeth' }
    ]
  });

  safariArea('safarizoneeast', 'Safari Zone — East', [
      'tututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tu......................tu',
      'vx..ggggg......ggggg....vx',
      'tu..ggggg......ggggg....tu',
      'vx......................vx',
      'tu.......~~~~~~~........tu',
      'vx.......~~~~~~~........vx',
      'tu.......~~~~~~~........tu',
      'vx.......~~~~~~~........vx',
      'pp......................tu',
      'vx......................vx',
      'tu..ggggg......ggggg....tu',
      'vx..ggggg......ggggg....vx',
      'tu......O...............tu',
      'vx......................vx',
      'tu..ggggg......ggggg....tu',
      'vx..ggggg......ggggg....vx',
      'tu......................tu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvx'
    ], {
    warps: [
      { x: 0, y: 10, to: 'safarizonecenter', tx: 24, ty: 10, dir: 'left' },
      { x: 1, y: 10, to: 'safarizonecenter', tx: 24, ty: 10, dir: 'left' }
    ],
    signs: [
      { x: 12, y: 14, text: 'SAFARI ZONE — EAST MARSH. Ground is soft. Mind your footing.' }
    ],
    items: [
      { x: 4, y: 4, item: 'maxpotion', flag: 'safari_maxpotion' }
    ],
    npcs: [
      { x: 15, y: 12, sprite: 'workerm', dir: 'down',
        dialog: ['Half of what lives out here has never been catalogued.',
                 'We stopped trying. It kept eating the clipboards.'] }
    ]
  });

  safariArea('safarizonenorth', 'Safari Zone — North', [
      'tututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tu......................tu',
      'vx..ggggg......ggggg....vx',
      'tu..ggggg......ggggg....tu',
      'vx......................vx',
      'tu..............O.......tu',
      'vx..ggggg...............vx',
      'tu..ggggg......ggggg....tu',
      'vx.............ggggg....vx',
      'tu......................tu',
      'vx....~~~~~~............vx',
      'tu....~~~~~~............tu',
      'vx....~~~~~~............vx',
      'tu......................tu',
      'vx..ggggg......ggggg....vx',
      'tu..ggggg......ggggg....tu',
      'vx......................vx',
      'tu..........pp..........tu',
      'vxvxvxvxvxvx..vxvxvxvxvxvx'
    ], {
    warps: [
      { x: 12, y: 19, to: 'safarizonecenter', tx: 12, ty: 1, dir: 'down' },
      { x: 13, y: 19, to: 'safarizonecenter', tx: 13, ty: 1, dir: 'down' }
    ],
    signs: [
      { x: 10, y: 6, text: 'SAFARI ZONE — NORTH PLAIN. The rarest residents keep to the far end.' },
      { x: 18, y: 10, text: 'Tracks. Very large, very deep, and the stride is longer than a person.' }
    ],
    items: [
      { x: 20, y: 4, item: 'ultraball', flag: 'safari_ultraball' }
    ]
  });

  // ==========================================================================
  // ROUTE 16 — west out of CELADON, and the second SNORLAX. One flute, two
  // roads: this is why the POKé FLUTE is worth a whole tower of ghosts.
  //
  // The gate at the far end is the top of CYCLING ROAD, and you cannot reach
  // it until the sleeper moves.
  // ==========================================================================
  G.MAPS.route16 = {
    id: 'route16', name: 'Route 16', w: 26, h: 14,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tu......................tu',
      'vx..GHI.......1223......vx',
      'tu..KLM.......4556......tu',
      'vx..WEW.......WNDW......vx',
      'tupppppppppppppppppppppppp',
      'vxpppppppp**pppppppppppppp',
      'tu......................tu',
      'vx.......llllll.........vx',
      'tu.....ggggg............tu',
      'vx.....ggggg............vx',
      'tututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvx'
    ], 26, 14),
    deco: blank(26, 14),
    encounters: (G.ENCOUNTERS || {}).route16,
    warps: [
      { x: 25, y: 6, to: 'celadon', tx: 1, ty: 13, dir: 'right' },
      { x: 25, y: 7, to: 'celadon', tx: 1, ty: 13, dir: 'right' },
      { x: 5, y: 5, to: 'cyclegate', tx: 4, ty: 7, dir: 'up' },
      { x: 16, y: 5, to: 'flyhouse', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 8, y: 8, text: 'CYCLING ROAD — through the gate. BICYCLES ONLY. No pedestrians.' }
    ],
    npcs: [
      { x: 10, y: 6, sprite: 'snorlax', obj: true, dir: 'down', unlessFlag: 'snorlax16', event: 'snorlaxWake' },
      { x: 11, y: 6, sprite: 'snorlax', obj: true, dir: 'down', unlessFlag: 'snorlax16', event: 'snorlaxWake' },
      { x: 13, y: 7, sprite: 'oldwoman', dir: 'left', unlessFlag: 'snorlax16',
        dialog: ['Another one. There are two in KANTO and both of them chose a road.',
                 'The council voted to build around it. Twice.'] }
    ],
    trainers: [
      { x: 19, y: 9, sprite: 'biker', dir: 'up', trainer: 'r16_alex', sight: 3 },
      { x: 21, y: 3, sprite: 'biker', dir: 'down', trainer: 'r16_dwayne', sight: 3 }
    ]
  };

  // ==========================================================================
  // CYCLING ROAD — thirty-four tiles of downhill with a ledge across the full
  // width every six. You cannot walk back up, which is the whole idea: it is
  // the only road in KANTO that only goes one way, and the bikers who live on
  // it treat that as a personality.
  // ==========================================================================
  G.MAPS.route17 = {
    id: 'route17', name: 'Cycling Road', w: 20, h: 36,
    music: 'route', battleBg: 'meadow', base: 'grass', weather: 'wind',
    legend: G.LEG_EXT,
    ground: pad([
      'tutututupppptutututu',
      'vxvxvxvxppppvxvxvxvx',
      'tuggg...pppp...gggtu',
      'vxggg...pppp...gggvx',
      'tuggg...pppp...gggtu',
      'vx..*...pppp...*..vx',
      'tu......pppp......tu',
      'vxllllllppppllllllvx',
      'tuggg...pppp...gggtu',
      'vxggg...pppp...gggvx',
      'tuggg...pppp...gggtu',
      'vx..*...pppp...*..vx',
      'tu......pppp......tu',
      'vxllllllppppllllllvx',
      'tuggg...pppp...gggtu',
      'vxggg...pppp...gggvx',
      'tuggg...pppp...gggtu',
      'vx..*...pppp...*..vx',
      'tu......pppp......tu',
      'vxllllllppppllllllvx',
      'tuggg...pppp...gggtu',
      'vxggg...pppp...gggvx',
      'tuggg...pppp...gggtu',
      'vx..*...pppp...*..vx',
      'tu......pppp......tu',
      'vxllllllppppllllllvx',
      'tuggg...pppp...gggtu',
      'vxggg...pppp...gggvx',
      'tuggg...pppp...gggtu',
      'vx..*...pppp...*..vx',
      'tu......pppp......tu',
      'vxllllllppppllllllvx',
      'tuggg...pppp...gggtu',
      'vxggg...pppp...gggvx',
      'tutututupppptutututu',
      'vxvxvxvxppppvxvxvxvx'
    ], 20, 36),
    deco: blank(20, 36),
    encounters: (G.ENCOUNTERS || {}).route17,
    warps: [
      { x: 8, y: 0, to: 'cyclegate', tx: 4, ty: 2, dir: 'up' },
      { x: 9, y: 0, to: 'cyclegate', tx: 5, ty: 2, dir: 'up' },
      { x: 10, y: 0, to: 'cyclegate', tx: 5, ty: 2, dir: 'up' },
      { x: 11, y: 0, to: 'cyclegate', tx: 5, ty: 2, dir: 'up' },
      { x: 8, y: 35, to: 'route18', tx: 5, ty: 5, dir: 'down' },
      { x: 9, y: 35, to: 'route18', tx: 5, ty: 5, dir: 'down' },
      { x: 10, y: 35, to: 'route18', tx: 5, ty: 6, dir: 'down' },
      { x: 11, y: 35, to: 'route18', tx: 5, ty: 6, dir: 'down' }
    ],
    signs: [
      { x: 6, y: 3, text: 'CYCLING ROAD — Downhill only. Do not attempt on foot.' }
    ],
    trainers: [
      { x: 7, y: 7, sprite: 'biker', dir: 'right', trainer: 'cr_charles', sight: 4 },
      { x: 12, y: 12, sprite: 'biker', dir: 'left', trainer: 'cr_riley', sight: 4 },
      { x: 7, y: 18, sprite: 'biker', dir: 'right', trainer: 'cr_joel', sight: 4 },
      { x: 12, y: 24, sprite: 'biker', dir: 'left', trainer: 'cr_glenn', sight: 4 },
      { x: 7, y: 30, sprite: 'cueball', dir: 'right', trainer: 'cr_jaren', sight: 4 }
    ]
  };

  // ==========================================================================
  // ROUTE 18 — the flat run east into FUCHSIA at the bottom of the hill.
  // ==========================================================================
  G.MAPS.route18 = {
    id: 'route18', name: 'Route 18', w: 26, h: 12,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tu......................tu',
      'vx..GHI.................vx',
      'tu..KLM....ggggg........tu',
      'vx..WEW....ggggg........vx',
      'tupppppppppppppppppppppppp',
      'vxpppppppppppppppppppppppp',
      'tu........lllll.........tu',
      'vx......................vx',
      'tututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvx'
    ], 26, 12),
    deco: blank(26, 12),
    encounters: (G.ENCOUNTERS || {}).route18,
    warps: [
      { x: 25, y: 6, to: 'fuchsia', tx: 1, ty: 9, dir: 'right' },
      { x: 25, y: 7, to: 'fuchsia', tx: 1, ty: 9, dir: 'right' },
      { x: 5, y: 5, to: 'route18gate', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 8, y: 8, text: 'ROUTE 18 — FUCHSIA CITY, east. CYCLING ROAD, through the gate.' }
    ],
    trainers: [
      { x: 14, y: 3, sprite: 'birdkeeper', dir: 'down', trainer: 'r18_jacob', sight: 3 },
      { x: 20, y: 9, sprite: 'birdkeeper', dir: 'up', trainer: 'r18_wilton', sight: 3 }
    ]
  };

  // ==========================================================================
  // ROUTES 19-21 — open water. No path, no ledge, no gate: the sea IS the
  // obstacle, and SURF is the only thing that turns it into a road. This is the
  // biggest single change in the shape of the region, and it happens the
  // moment you walk out of the SECRET HOUSE with an HM in your bag.
  // ==========================================================================
  G.MAPS.route19 = {
    id: 'route19', name: 'Route 19', w: 16, h: 22,
    music: 'route', battleBg: 'water', base: 'water', weather: 'spray',
    legend: G.LEG_EXT,
    ground: pad([
      '%%%%%%%%%%%%%%%%',
      '%%%%%%%%%%%%%%%%',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~%%%%%~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~%%%%%~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~'
    ], 16, 22),
    deco: blank(16, 22),
    encounters: (G.ENCOUNTERS || {}).route19,
    warps: [
      { x: 8, y: 0, to: 'fuchsia', tx: 12, ty: 20, dir: 'up' },
      { x: 9, y: 0, to: 'fuchsia', tx: 13, ty: 20, dir: 'up' },
      { x: 8, y: 21, to: 'route20', tx: 32, ty: 6, dir: 'down' },
      { x: 9, y: 21, to: 'route20', tx: 32, ty: 7, dir: 'down' }
    ],
    signs: [
      { x: 6, y: 7, text: 'A weather buoy. SEAFOAM ISLANDS, west. CINNABAR ISLAND, west again and keep going.' }
    ],
    trainers: [
      { x: 4, y: 5, sprite: 'swimmer', dir: 'right', trainer: 'r19_douglas', sight: 3 },
      { x: 11, y: 11, sprite: 'swimmerf', dir: 'left', trainer: 'r19_denise', sight: 3 },
      { x: 5, y: 17, sprite: 'swimmer', dir: 'right', trainer: 'r19_matthew', sight: 3 }
    ]
  };

  G.MAPS.route20 = {
    id: 'route20', name: 'Route 20', w: 34, h: 14,
    music: 'route', battleBg: 'water', base: 'water', weather: 'spray',
    legend: G.LEG_EXT,
    ground: pad([
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~%%%%%%~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~%%##%%~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~%%##%%~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~%%%%%%~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~%%%%~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ], 34, 14),
    deco: blank(34, 14),
    encounters: (G.ENCOUNTERS || {}).route20,
    warps: [
      { x: 33, y: 6, to: 'route19', tx: 8, ty: 20, dir: 'right' },
      { x: 33, y: 7, to: 'route19', tx: 9, ty: 20, dir: 'right' },
      { x: 0, y: 6, to: 'cinnabar', tx: 20, ty: 8, dir: 'left' },
      { x: 0, y: 7, to: 'cinnabar', tx: 20, ty: 9, dir: 'left' },
      { x: 14, y: 4, to: 'seafoam1f', tx: 5, ty: 13, dir: 'up' },
      { x: 15, y: 4, to: 'seafoam1f', tx: 5, ty: 13, dir: 'up' }
    ],
    signs: [
      { x: 13, y: 7, text: 'SEAFOAM ISLANDS — Sea currents run right through the caves. Do not enter without a plan.' }
    ],
    trainers: [
      { x: 6, y: 3, sprite: 'swimmerf', dir: 'down', trainer: 'r20_nicole', sight: 3 },
      { x: 22, y: 10, sprite: 'swimmer', dir: 'up', trainer: 'r20_briana', sight: 3 },
      { x: 27, y: 3, sprite: 'swimmer', dir: 'down', trainer: 'r20_axle', sight: 3 }
    ]
  };

  G.MAPS.route21 = {
    id: 'route21', name: 'Route 21', w: 16, h: 24,
    music: 'route', battleBg: 'water', base: 'water', weather: 'spray',
    legend: G.LEG_EXT,
    ground: pad([
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~%%%%%%%%~~~~',
      '~~~~%%%%%%%%~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~%%%%%%%%~~~~',
      '~~~~%%%%%%%%~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~'
    ], 16, 24),
    deco: blank(16, 24),
    encounters: (G.ENCOUNTERS || {}).route21,
    warps: [
      { x: 8, y: 0, to: 'pallet', tx: 10, ty: 16, dir: 'up' },
      { x: 9, y: 0, to: 'pallet', tx: 11, ty: 16, dir: 'up' },
      { x: 8, y: 23, to: 'cinnabar', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 23, to: 'cinnabar', tx: 11, ty: 1, dir: 'down' }
    ],
    signs: [
      { x: 6, y: 6, text: 'A fishing marker. PALLET TOWN is north. You can see the roof of the lab from here.' }
    ],
    trainers: [
      { x: 5, y: 8, sprite: 'swimmer', dir: 'right', trainer: 'r21_barry', sight: 3 },
      { x: 10, y: 15, sprite: 'fisher', dir: 'left', trainer: 'r21_ronald', sight: 3 }
    ]
  };

  // ==========================================================================
  // CINNABAR ISLAND — a volcano with a research lab on it, and the only town
  // in KANTO you cannot walk to. Everything here is about what the LAB did:
  // the fossils it revives, the mansion it abandoned, and the thing it made
  // in the basement and then stopped writing about.
  // ==========================================================================
  G.MAPS.cinnabar = {
    id: 'cinnabar', name: 'Cinnabar Island', w: 22, h: 18,
    music: 'town', battleBg: 'meadow', base: 'sand', weather: 'ash',
    // Its own legend, so '.' is SAND rather than grass. CINNABAR is a volcano
    // with a laboratory on it; grass lawns and scattered wildflowers are the
    // wrong island entirely, and the shared exterior legend was giving it both.
    legend: (function () {
      var L = {}; for (var k in G.LEG_EXT) L[k] = G.LEG_EXT[k];
      L['.'] = 'sand'; L[','] = 'sand';
      return L;
    })(),
    gymEmblem: { x: 6, y: 12, type: 'fire' },
    ground: pad([
      '~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~',
      '~~%%%%%%%%%%%%%%%%%%~~',
      '~~%..GHHHI...7889..%~~',
      '~~%..KLLLM...d+mh..%~~',
      '~~%..WNEEW...WNEW..%~~',
      '~~%................%~~',
      '~~%................%~~',
      '~~%...GHHHHHHI.....%~~',
      '~~%...KLLLLLLM.....%~~',
      '~~%...WNEEWNNW.....%~~',
      '~~%................%~~',
      '~~%..ABBC....qrrz..%~~',
      '~~%..abbc....i$jk..%~~',
      '~~%..WYYW....WNEW..%~~',
      '~~%..S.............%~~',
      '~~%%%%%%%%%%%%%%%%%%~~',
      '~~~~~~~~~~~~~~~~~~~~~~'
    ], 22, 18),
    deco: blank(22, 18),
    warps: [
      { x: 10, y: 0, to: 'route21', tx: 8, ty: 22, dir: 'up' },
      { x: 11, y: 0, to: 'route21', tx: 9, ty: 22, dir: 'up' },
      { x: 21, y: 8, to: 'route20', tx: 1, ty: 6, dir: 'right' },
      { x: 21, y: 9, to: 'route20', tx: 1, ty: 7, dir: 'right' },
      { x: 7, y: 5, to: 'cinnabarlab', tx: 5, ty: 11, dir: 'up' },
      { x: 8, y: 5, to: 'cinnabarlab', tx: 6, ty: 11, dir: 'up' },
      { x: 15, y: 5, to: 'cinnabarcentre', tx: 4, ty: 6, dir: 'up' },
      { x: 8, y: 10, to: 'mansion1f', tx: 9, ty: 17, dir: 'up' },
      { x: 9, y: 10, to: 'mansion1f', tx: 9, ty: 17, dir: 'up' },
      { x: 6, y: 14, to: 'cinnabargym', tx: 5, ty: 16, dir: 'up' },
      { x: 7, y: 14, to: 'cinnabargym', tx: 6, ty: 16, dir: 'up' },
      { x: 15, y: 14, to: 'cinnabarmart', tx: 4, ty: 6, dir: 'up' }
    ],
    signs: [
      { x: 5, y: 15, text: 'CINNABAR ISLAND — The Fiery Town of Burning Desire.' },
      { x: 6, y: 6, text: 'POKéMON LAB — Fossil restoration. Bring us something old enough.' },
      { x: 10, y: 11, text: 'POKéMON MANSION — CONDEMNED. Structurally unsound. Do not enter.' }
    ],
    npcs: [
      { x: 13, y: 7, sprite: 'scientist', dir: 'left',
        dialog: ['The LAB can bring back a POKéMON that has been extinct for a hundred million years.',
                 'That is the single most impressive thing anyone in KANTO has ever done, and nobody talks about it.',
                 'They talk about the MANSION instead.'] },
      { x: 12, y: 13, sprite: 'oldman', dir: 'down', unlessFlag: 'got_secretkey',
        dialog: ['The GYM is locked and BLAINE has the only key.',
                 'BLAINE has not been seen in town for three weeks. His house is the burnt one.'] },
      { x: 17, y: 11, sprite: 'fisher', dir: 'left',
        dialog: ['The volcano has not gone off in my lifetime.',
                 'It smokes, though. Every single day, it smokes.'] }
    ]
  };

  // ==========================================================================
  // THE POWER PLANT — abandoned, and still live. Nothing here has been
  // maintained in years, half the residents are indistinguishable from the
  // equipment, and there is a bird in the back room that has been sitting in
  // the switchgear long enough that the building has started to sound like it.
  // ==========================================================================
  G.MAPS.powerplant = {
    id: 'powerplant', name: 'Power Plant', w: 22, h: 17,
    music: 'cave', battleBg: 'indoor', base: 'metalfloor', indoors: true,
    legend: { '.': 'metalfloor', '#': 'metalwall' },
    ground: pad([
      '######################',
      '#.....#...#...#.....##',
      '#.........#.....#.#.##',
      '#.........#.....#.#.##',
      '#.........#....##.#.##',
      '#.......#.#.......#.##',
      '####...##.#.#######.##',
      '#.........#.#.....#.##',
      '#.###.#######.#.#.#.##',
      '#.....#.......#...#.##',
      '#.###.#....####.###.##',
      '#.#...........#.#...##',
      '#.###.##....#.#.#.#.##',
      '#...#...#...#.#.#.#.##',
      '###.###.#.###.#.###.##',
      '#.......#...#.......##',
      '######################'
    ], 22, 17),
    deco: blank(22, 17),
    encounters: (G.ENCOUNTERS || {}).powerplant,
    warps: [
      { x: 19, y: 14, to: 'route10', tx: 16, ty: 8, dir: 'right' }
    ],
    signs: [
      { x: 9, y: 1, text: 'A safety notice, sun-bleached to nothing. Only the word DANGER survives.' },
      { x: 1, y: 1, text: 'The floor here is warm. The hum is coming up through your boots.' }
    ],
    items: [
      { x: 1, y: 15, item: 'tm25', flag: 'pp_tm25' },
      { x: 11, y: 7, item: 'maxrepel', flag: 'pp_maxrepel' },
      { x: 7, y: 4, item: 'ultraball', flag: 'pp_ultraball' }
    ],
    npcs: [
      { x: 2, y: 5, sprite: 'zapdos', obj: true, dir: 'down', unlessFlag: 'zapdos_caught', event: 'zapdosEncounter' }
    ]
  };

  // ==========================================================================
  // ROUTE 22 — west out of VIRIDIAN, and the road you were turned away from on
  // day one. BLUE is here again, because he has been ahead of you the entire
  // game and this is the last time that is true.
  // ==========================================================================
  G.MAPS.route22 = {
    id: 'route22', name: 'Route 22', w: 22, h: 13,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvx',
      'tu..................tu',
      'vx..ggggg...........vx',
      'tu..ggggg...........tu',
      'pppppppppppppppppppppp',
      'pppppppppppppppppppppp',
      'vx......llllll......vx',
      'tu..........ggggg...tu',
      'vx..........ggggg...vx',
      'tu..................tu',
      'vxvxvxvxvxvxvxvxvxvxvx',
      'tututututututututututu'
    ], 22, 13),
    deco: blank(22, 13),
    encounters: (G.ENCOUNTERS || {}).route22,
    warps: [
      { x: 21, y: 5, to: 'viridian', tx: 2, ty: 15, dir: 'right' },
      { x: 21, y: 6, to: 'viridian', tx: 2, ty: 15, dir: 'right' },
      { x: 0, y: 5, to: 'route23', tx: 9, ty: 32, dir: 'left' },
      { x: 0, y: 6, to: 'route23', tx: 10, ty: 32, dir: 'left' }
    ],
    signs: [
      { x: 8, y: 4, text: 'ROUTE 22 — POKéMON LEAGUE reception gate ahead. BADGES REQUIRED.' }
    ],
    npcs: [
      { x: 5, y: 8, sprite: 'blue', dir: 'right', ifFlag: 'badge8',
        unlessFlag: 'blue_route22b', event: 'blueRoute22Final' }
    ]
  };

  // ==========================================================================
  // ROUTE 23 — the badge road. Seven checkpoints between VIRIDIAN and VICTORY
  // ROAD, each one a gate that reads your case and does not argue about it.
  // Nothing else in KANTO checks your credentials; this road checks them seven
  // times in a row, and that is the point.
  // ==========================================================================
  G.MAPS.route23 = {
    id: 'route23', name: 'Route 23', w: 20, h: 34,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tutututupppptutututu',
      'vxvxvxvxppppvxvxvxvx',
      'tu................tu',
      'vx................vx',
      'tu................tu',
      'vx###...####...###vx',
      'tu................tu',
      'vx..~~~....~~~~...vx',
      'tu................tu',
      'vx###...####...###vx',
      'tu................tu',
      'vx................vx',
      'tu................tu',
      'vx###...####...###vx',
      'tu................tu',
      'vx..~~~....~~~~...vx',
      'tu................tu',
      'vx###...####...###vx',
      'tu................tu',
      'vx................vx',
      'tu................tu',
      'vx###...####...###vx',
      'tu................tu',
      'vx..~~~....~~~~...vx',
      'tu................tu',
      'vx###...####...###vx',
      'tu................tu',
      'vx................vx',
      'tu................tu',
      'vx###...####...###vx',
      'tu................tu',
      'vx................vx',
      'tutututupppptutututu',
      'vxvxvxvxppppvxvxvxvx'
    ], 20, 34),
    deco: blank(20, 34),
    encounters: (G.ENCOUNTERS || {}).route23,
    warps: [
      { x: 9, y: 33, to: 'route22', tx: 1, ty: 5, dir: 'down' },
      { x: 10, y: 33, to: 'route22', tx: 1, ty: 6, dir: 'down' },
      { x: 9, y: 0, to: 'victoryroad1f', tx: 9, ty: 17, dir: 'up',
        needFlag: ['badge1', 'badge2', 'badge3', 'badge4', 'badge5', 'badge6', 'badge7', 'badge8'],
        deniedText: 'The final gate reads your BADGE CASE, finds a gap in it, and does not open. VICTORY ROAD takes all eight or none.' },
      { x: 10, y: 0, to: 'victoryroad1f', tx: 9, ty: 17, dir: 'up',
        needFlag: ['badge1', 'badge2', 'badge3', 'badge4', 'badge5', 'badge6', 'badge7', 'badge8'],
        deniedText: 'The final gate reads your BADGE CASE, finds a gap in it, and does not open. VICTORY ROAD takes all eight or none.' }
    ],
    signs: [
      { x: 8, y: 30, text: 'BADGE CHECK GATE 1 — VICTORY ROAD lies beyond. Present all eight BADGES.' }
    ],
    npcs: [
      { x: 4, y: 30, sprite: 'gymguy', dir: 'right', event: 'badgeCheck' },
      { x: 4, y: 26, sprite: 'gymguy', dir: 'right', event: 'badgeCheck' },
      { x: 4, y: 22, sprite: 'gymguy', dir: 'right', event: 'badgeCheck' },
      { x: 4, y: 18, sprite: 'gymguy', dir: 'right', event: 'badgeCheck' },
      { x: 4, y: 14, sprite: 'gymguy', dir: 'right', event: 'badgeCheck' },
      { x: 4, y: 10, sprite: 'gymguy', dir: 'right', event: 'badgeCheck' },
      { x: 4, y: 6, sprite: 'gymguy', dir: 'right', event: 'badgeCheck' }
    ],
    // The gate itself. Seven checkpoints, one badge more at each, and they
    // stop you rather than talk at you — the previous version put the
    // guards inside the cliff face, so ROUTE 23 was walkable from VIRIDIAN
    // with no badges at all and the first thing you met was a level 47
    // ARCANINE.
    scripts: [
      { x: [3, 16], y: 29, run: 'badgeGate', needBadges: 7 },
      { x: [3, 16], y: 25, run: 'badgeGate', needBadges: 7 },
      { x: [3, 16], y: 21, run: 'badgeGate', needBadges: 8 },
      { x: [3, 16], y: 17, run: 'badgeGate', needBadges: 8 },
      { x: [3, 16], y: 13, run: 'badgeGate', needBadges: 8 },
      { x: [3, 16], y: 9, run: 'badgeGate', needBadges: 8 },
      { x: [3, 16], y: 5, run: 'badgeGate', needBadges: 8 }
    ]
  };

  // ==========================================================================
  // VICTORY ROAD — three floors of boulder work. Every staircase is behind
  // something you have to shove, which makes it the only genuinely mechanical
  // puzzle in KANTO and the last thing the region asks of you before it stops
  // asking. MOLTRES is on the top floor and has been for some time.
  // ==========================================================================
  function victoryFloor(id, name, rowsIn, opts) {
    G.MAPS[id] = {
      id: id, name: name, w: 20, h: opts.h,
      music: 'cave', battleBg: 'cave', base: 'darkfloor', indoors: true,
      legend: G.LEG_CAVE, dark: true,
      ground: pad(rowsIn, 20, opts.h),
      deco: blank(20, opts.h),
      encounters: (G.ENCOUNTERS || {})[id],
      warps: opts.warps,
      signs: opts.signs || [],
      npcs: opts.npcs || [],
      items: opts.items || [],
      trainers: opts.trainers || []
    };
  }

  victoryFloor('victoryroad1f', 'Victory Road 1F', [
      '####################',
      '#...#.............##',
      '###.#.#####.#.#.#.##',
      '#.....#.....#.....##',
      '#.#####.#.#######.##',
      '#.....#.#.#...#...##',
      '#####.#.#.#....##.##',
      '#.....#...#.....#.##',
      '#.#####.##......#.##',
      '#.#...#.......#.#.##',
      '#.###.#.#.....#.#.##',
      '#.......#.....#.#.##',
      '###.##########....##',
      '#.#.......#.......##',
      '#.##...##.#.##....##',
      '#.......#...#.....##',
      '#.##....#.#.#.###.##',
      '#...#.......#.....##',
      '####################',
      '####################'
    ], {
    h: 20,
    warps: [
      { x: 10, y: 17, to: 'route23', tx: 9, ty: 1, dir: 'down' },
      { x: 5, y: 1, to: 'route23', tx: 10, ty: 1, dir: 'down' },
      { x: 10, y: 1, to: 'victoryroad2f', tx: 9, ty: 15, dir: 'up' }
    ],
    signs: [
      { x: 2, y: 3, text: 'VICTORY ROAD. Someone has scratched a tally into the wall. It stops at forty-one.' }
    ],
    items: [
      { x: 13, y: 3, item: 'tm05', flag: 'vr_tm05' }
    ],
    trainers: [
      { x: 16, y: 1, sprite: 'cooltrainerm', dir: 'down', trainer: 'vr_naoko', sight: 3 },
      { x: 9, y: 5, sprite: 'cooltrainerf', dir: 'left', trainer: 'vr_george', sight: 3 }
    ]
  });

  victoryFloor('victoryroad2f', 'Victory Road 2F', [
      '####################',
      '#...#...#.....#...##',
      '###.#.#.....#.#.#.##',
      '#.#...#.....#.#.#.##',
      '#.#####.....#.###.##',
      '#.....#.....#.#...##',
      '#.##.......##.#.####',
      '#.......#.#...#...##',
      '###....##.#.#.#.#.##',
      '#.#.......#.#.....##',
      '#.###.###.#.#####.##',
      '#...#...#.......#.##',
      '#.#.#.#....####.#.##',
      '#...#.#.........#.##',
      '#.#.#.#.....#.#.#.##',
      '#.#...#.......#...##',
      '####################'
    ], {
    h: 17,
    warps: [
      { x: 10, y: 15, to: 'victoryroad1f', tx: 9, ty: 17, dir: 'down' },
      { x: 15, y: 3, to: 'victoryroad3f', tx: 9, ty: 17, dir: 'up' }
    ],
    signs: [
      { x: 1, y: 1, text: 'A boulder, seated in a socket worn smooth. It has been pushed into place many times.' }
    ],
    items: [
      { x: 1, y: 9, item: 'maxrevive', flag: 'vr_maxrevive' },
      { x: 4, y: 3, item: 'fullrestore', flag: 'vr_full' }
    ],
    trainers: [
      { x: 17, y: 7, sprite: 'cooltrainerm', dir: 'right', trainer: 'vr_daisuke', sight: 3 },
      { x: 1, y: 15, sprite: 'pokemaniac', dir: 'left', trainer: 'vr_dawson', sight: 3 }
    ]
  });

  victoryFloor('victoryroad3f', 'Victory Road 3F', [
      '####################',
      '#.#.....#.....#...##',
      '#.#.###.#.##....#.##',
      '#...#...#.......#.##',
      '#####.###......##.##',
      '#...#.#.........#.##',
      '###.#........####.##',
      '#...........#.....##',
      '#.####....###.....##',
      '#.....#...........##',
      '#.###.########...###',
      '#.#.............#.##',
      '#.#.#####.###.#.#.##',
      '#...#...#...#.#...##',
      '###.###.###.###.#.##',
      '#.#.#...#.#.....#.##',
      '#.#.#.#.#.#######.##',
      '#.....#...........##',
      '####################'
    ], {
    h: 19,
    warps: [
      { x: 10, y: 17, to: 'victoryroad2f', tx: 9, ty: 15, dir: 'down' },
      { x: 1, y: 1, to: 'indigo', tx: 9, ty: 18, dir: 'up' },
      { x: 12, y: 1, to: 'indigo', tx: 10, ty: 18, dir: 'up' }
    ],
    signs: [
      { x: 6, y: 1, text: 'Light from above. The exit is close, and it is the last piece of KANTO you will walk through as a challenger.' }
    ],
    items: [
      { x: 15, y: 5, item: 'tm47', flag: 'vr_tm47' }
    ],
    trainers: [
      { x: 7, y: 5, sprite: 'cooltrainerf', dir: 'right', trainer: 'vr_caroline', sight: 3 }
    ],
    npcs: [
      { x: 11, y: 6, sprite: 'moltres', obj: true, dir: 'down',
        unlessFlag: 'moltres_caught', event: 'moltresEncounter' }
    ]
  });

  // ==========================================================================
  // CERULEAN CAVE — the one door in KANTO that stays shut until the region
  // decides you are finished. Seven badges gets you past the guard; the eighth
  // is not the point. MEWTWO is on the second floor, at level 70, and it is
  // the only encounter in the game that was not designed to be fair.
  // ==========================================================================
  G.MAPS.ceruleancave1f = {
    id: 'ceruleancave1f', name: 'Cerulean Cave 1F', w: 20, h: 17,
    music: 'cave', battleBg: 'cave', base: 'darkfloor', indoors: true, dark: true,
    legend: G.LEG_CAVE,
    ground: pad([
      '####################',
      '#...#.#.........#.##',
      '#.....#.###.#.#.#.##',
      '#.......#.....#.#.##',
      '#.....###.###.#.#.##',
      '#.#.........#.#...##',
      '#.#.#########.#.#.##',
      '#.#...#.....#...#.##',
      '#.####...##.....#.##',
      '#.........#.......##',
      '#.#.#.....##...##.##',
      '#.#...#...........##',
      '#.###.#........##.##',
      '#.#...#...........##',
      '#.#.###....#...#####',
      '#...#...#.........##',
      '####################'
    ], 20, 17),
    deco: blank(20, 17),
    encounters: (G.ENCOUNTERS || {}).ceruleancave1f,
    warps: [
      { x: 2, y: 15, to: 'cerulean', tx: 3, ty: 3, dir: 'down' },
      { x: 17, y: 1, to: 'ceruleancave2f', tx: 9, ty: 13, dir: 'down' }
    ],
    signs: [
      { x: 17, y: 6, text: 'The rock here is scored in long parallel lines, at a height nothing native to this cave could reach.' }
    ],
    items: [
      { x: 13, y: 2, item: 'fullrestore', flag: 'cc_full' }
    ]
  };

  G.MAPS.ceruleancave2f = {
    id: 'ceruleancave2f', name: 'Cerulean Cave B1F', w: 20, h: 15,
    music: 'cave', battleBg: 'cave', base: 'darkfloor', indoors: true, dark: true,
    legend: G.LEG_CAVE,
    ground: pad([
      '####################',
      '#.#...#.......#...##',
      '#.#.....#####.#.#.##',
      '#.#.....#...#.....##',
      '#.#....####.......##',
      '#.....#...........##',
      '#.###.....#......###',
      '#.........#.#.....##',
      '###.##...##.#.#.#.##',
      '#.......#...#.#.#.##',
      '#.#.###.###.#.###.##',
      '#...#.#...#.#...#.##',
      '#.###.###.#####.#.##',
      '#.......#.........##',
      '####################'
    ], 20, 15),
    deco: blank(20, 15),
    encounters: (G.ENCOUNTERS || {}).ceruleancaveb1f,
    warps: [
      { x: 10, y: 13, to: 'ceruleancave1f', tx: 1, ty: 15, dir: 'up' }
    ],
    signs: [
      { x: 16, y: 1, text: 'The water in here does not move. Not with the current, not with your footsteps. Not at all.' }
    ],
    items: [
      { x: 11, y: 1, item: 'maxrevive', flag: 'cc_maxrevive' }
    ],
    npcs: [
      { x: 7, y: 13, sprite: 'mewtwo', obj: true, dir: 'down',
        unlessFlag: 'mewtwo_caught', event: 'mewtwoEncounter' }
    ]
  };

  // ==========================================================================
  // INDIGO PLATEAU — one building, and you walk through all of it. The lobby
  // has a CENTRE and a shop, and then a single red carpet running north into
  // five sealed chambers with no way back out.
  //
  // Once you step onto the carpet the doors behind you close. There is no
  // healing, no saving, and no leaving between the ELITE FOUR — lose to Lance
  // and you start again at LORELEI, with whatever you have left. That is the
  // whole shape of the ending, and it is the reason the lobby matters: it is
  // the last place you can change your mind.
  // ==========================================================================
  G.MAPS.indigo = {
    id: 'indigo', name: 'Indigo Plateau', w: 20, h: 20,
    music: 'gym', battleBg: 'indoor', base: 'marble', indoors: true,
    legend: { '#': 'marblewall', '.': 'marble', 'R': 'redcarpet',
              'E': 'ihealm', 'C': 'icounter' },
    ground: pad([
      '####################',
      '#..................#',
      '#....##########....#',
      '#....#........#....#',
      '#....#.RRRRRR.#....#',
      '#....#.RRRRRR.#....#',
      '#....#.RRRRRR.#....#',
      '#....##.RRRR.##....#',
      '#.....#.RRRR.#.....#',
      '#.....#.RRRR.#.....#',
      '#.EEE.#.RRRR.#.CCC.#',
      '#.....#.RRRR.#.....#',
      '#.....#.RRRR.#.....#',
      '#.....#.RRRR.#.....#',
      '#.....#.RRRR.#.....#',
      '#.....#.RRRR.#.....#',
      '#.....##RRRR##.....#',
      '#......RRRRRR......#',
      '#..................#',
      '#########..#########'
    ], 20, 20),
    deco: blank(20, 20),
    warps: [
      { x: 9, y: 19, to: 'victoryroad3f', tx: 9, ty: 17, dir: 'down' },
      { x: 10, y: 19, to: 'victoryroad3f', tx: 9, ty: 17, dir: 'down' },
      { x: 9, y: 1, to: 'e4lorelei', tx: 9, ty: 11, dir: 'up' },
      { x: 10, y: 1, to: 'e4lorelei', tx: 10, ty: 11, dir: 'up' }
    ],
    respawnPoint: { mapId: 'indigo', x: 9, y: 16 },
    signs: [
      { x: 6, y: 17, text: 'INDIGO PLATEAU — POKéMON LEAGUE HEADQUARTERS. Beyond this hall, the doors only open one way.' }
    ],
    npcs: [
      { x: 2, y: 11, sprite: 'nurse', dir: 'right', event: 'nurseHeal' },
      { x: 17, y: 11, sprite: 'clerk', dir: 'left', event: 'shopBuy' },
      { x: 8, y: 17, sprite: 'gymguy', dir: 'right', event: 'leagueWarning' },
      { x: 12, y: 8, sprite: 'gentleman', dir: 'left',
        dialog: ['Heal here. Buy here. Think here.',
                 'Past the carpet there is none of the three.'] },
      { x: 6, y: 4, sprite: 'oak', dir: 'down', ifFlag: 'champion', event: 'hallOfChampionsDoor' }
    ],
    shopInventory: ['fullrestore', 'maxpotion', 'fullheal', 'maxrevive', 'ultraball', 'hyperpotion']
  };

  // The five chambers. The architecture is deliberately identical every time —
  // same room, same doors, same walk — because what changes is the person
  // standing in it, and making the ROOMS escalate would do that work for them.
  function leagueChamber(id, name, rowsIn, opts) {
    G.MAPS[id] = {
      id: id, name: name, w: 20, h: 14,
      music: 'gym', battleBg: 'indoor', base: opts.floor || 'marble', indoors: true,
      gymTint: opts.tint,
      legend: { '#': 'marblewall', '.': opts.floor || 'marble',
                'L': 'leaguedoor', 'O': 'boulder', 'U': 'statue' },
      ground: pad(rowsIn, 20, 14),
      deco: blank(20, 14),
      warps: opts.warps,
      trainers: opts.trainers,
      npcs: opts.npcs || [],
      signs: opts.signs || [],
      league: true
    };
  }

  leagueChamber('e4lorelei', 'Lorelei', [
      '####################',
      '#..................#',
      '#........LL........#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#........LL........#',
      '####################'
    ], {
    floor: 'icefloor', tint: '#78c8f0',
    warps: [
      { x: 9, y: 2, to: 'e4bruno', tx: 9, ty: 11, dir: 'up', needFlag: 'e4_lorelei' },
      { x: 10, y: 2, to: 'e4bruno', tx: 10, ty: 11, dir: 'up', needFlag: 'e4_lorelei' }
    ],
    trainers: [
      { x: 9, y: 4, sprite: 'lorelei', dir: 'down', trainer: 'lorelei', sight: 0 }
    ],
    signs: [
      { x: 4, y: 12, text: 'The door you came through has closed. There is no handle on this side.' }
    ]
  });

  leagueChamber('e4bruno', 'Bruno', [
      '####################',
      '#..................#',
      '#........LL........#',
      '#..................#',
      '#....OO......OO....#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#........LL........#',
      '####################'
    ], {
    floor: 'cavefloor', tint: '#c07038',
    warps: [
      { x: 9, y: 2, to: 'e4agatha', tx: 9, ty: 11, dir: 'up', needFlag: 'e4_bruno' },
      { x: 10, y: 2, to: 'e4agatha', tx: 10, ty: 11, dir: 'up', needFlag: 'e4_bruno' }
    ],
    trainers: [
      { x: 9, y: 4, sprite: 'bruno', dir: 'down', trainer: 'bruno', sight: 0 }
    ]
  });

  leagueChamber('e4agatha', 'Agatha', [
      '####################',
      '#..................#',
      '#........LL........#',
      '#..................#',
      '#....UU......UU....#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#........LL........#',
      '####################'
    ], {
    floor: 'towerfloor', tint: '#7040a0',
    warps: [
      { x: 9, y: 2, to: 'e4lance', tx: 9, ty: 11, dir: 'up', needFlag: 'e4_agatha' },
      { x: 10, y: 2, to: 'e4lance', tx: 10, ty: 11, dir: 'up', needFlag: 'e4_agatha' }
    ],
    trainers: [
      { x: 9, y: 4, sprite: 'agatha', dir: 'down', trainer: 'agatha', sight: 0 }
    ]
  });

  leagueChamber('e4lance', 'Lance', [
      '####################',
      '#..................#',
      '#........LL........#',
      '#..................#',
      '#....UU......UU....#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#........LL........#',
      '####################'
    ], {
    floor: 'marble', tint: '#5060c0',
    warps: [
      { x: 9, y: 2, to: 'e4champion', tx: 9, ty: 11, dir: 'up', needFlag: 'e4_lance' },
      { x: 10, y: 2, to: 'e4champion', tx: 10, ty: 11, dir: 'up', needFlag: 'e4_lance' }
    ],
    trainers: [
      { x: 9, y: 4, sprite: 'lance', dir: 'down', trainer: 'lance', sight: 0 }
    ]
  });

  leagueChamber('e4champion', 'Champion', [
      '####################',
      '#..................#',
      '#........LL........#',
      '#..................#',
      '#....UU......UU....#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#........LL........#',
      '####################'
    ], {
    floor: 'redcarpet', tint: '#d0b040',
    warps: [
      { x: 9, y: 2, to: 'halloffame', tx: 9, ty: 12, dir: 'up', needFlag: 'e4_champion' },
      { x: 10, y: 2, to: 'halloffame', tx: 10, ty: 12, dir: 'up', needFlag: 'e4_champion' }
    ],
    trainers: [
      { x: 9, y: 4, sprite: 'blue', dir: 'down', trainer: 'blue_champion', sight: 0 }
    ],
    signs: [
      { x: 4, y: 12, text: 'A trophy plinth, and the trophy is not on it yet. Somebody was extremely confident about the timing.' }
    ]
  });

  // ==========================================================================
  // THE HALL OF FAME — the room the whole game points at. Nothing happens here
  // except that a machine writes down the names of six POKéMON, and that is
  // the correct amount of ceremony: the walk was the achievement.
  // ==========================================================================
  G.MAPS.halloffame = {
    id: 'halloffame', name: 'Hall of Fame', w: 20, h: 14,
    music: 'gym', battleBg: 'indoor', base: 'marble', indoors: true,
    legend: { '#': 'marblewall', '.': 'marble', 'R': 'redcarpet', 'U': 'statue' },
    ground: pad([
      '####################',
      '#..................#',
      '#..UU..........UU..#',
      '#..................#',
      '#....RRRRRRRRRR....#',
      '#....RRRRRRRRRR....#',
      '#....RRRRRRRRRR....#',
      '#....RRRRRRRRRR....#',
      '#..UU.RRRRRRRR.UU..#',
      '#.....RRRRRRRR.....#',
      '#.....RRRRRRRR.....#',
      '#.......RRRR.......#',
      '#........RR........#',
      '####################'
    ], 20, 14),
    deco: blank(20, 14),
    warps: [],
    scripts: [
      { x: [8, 11], y: 8, run: 'hallOfFameCeremony', once: 'champion' }
    ],
    npcs: [
      { x: 8, y: 5, sprite: 'oak', dir: 'down', ifFlag: 'champion', event: 'oakHallTalk' }
    ]
  };

  // ==========================================================================
  // THE HALL OF CHAMPIONS — five plinths down a long hall, and the people on
  // them are not statues.
  //
  // This does not exist in Red/Blue. It exists here because the ELITE FOUR are
  // the end of the CHALLENGE and this is the end of the GAME, and those should
  // not be the same room. Every champion before you kept the title for a
  // while, and every one of them found something in KANTO that nobody has
  // found since — which is where the legendaries went.
  //
  // The fifth plinth is empty until the other four are done.
  // ==========================================================================
  G.MAPS.hallofchampions = {
    id: 'hallofchampions', name: 'Hall of Champions', w: 20, h: 20,
    music: 'gymleader', battleBg: 'indoor', base: 'marble', indoors: true,
    legend: { '#': 'marblewall', '.': 'marble', 'R': 'redcarpet', 'U': 'statue' },
    ground: pad([
      '####################',
      '#..................#',
      '#..UU..........UU..#',
      '#........RR........#',
      '#........RR........#',
      '#..UU....RR....UU..#',
      '#........RR........#',
      '#........RR........#',
      '#..UU....RR....UU..#',
      '#........RR........#',
      '#........RR........#',
      '#..UU....RR....UU..#',
      '#........RR........#',
      '#........RR........#',
      '#..UU....RR....UU..#',
      '#........RR........#',
      '#........RR........#',
      '#........RR........#',
      '#..................#',
      '####################'
    ], 20, 20),
    deco: blank(20, 20),
    warps: [
      { x: 9, y: 18, to: 'indigo', tx: 9, ty: 4, dir: 'down' },
      { x: 10, y: 18, to: 'indigo', tx: 10, ty: 4, dir: 'down' }
    ],
    trainers: [
      { x: 9, y: 15, sprite: 'cooltrainerf', dir: 'down', trainer: 'champ_wren', sight: 0 },
      { x: 10, y: 12, sprite: 'hiker', dir: 'down', trainer: 'champ_halden', sight: 0 },
      { x: 9, y: 9, sprite: 'psychicf', dir: 'down', trainer: 'champ_ines', sight: 0 },
      { x: 10, y: 6, sprite: 'cooltrainerm', dir: 'down', trainer: 'champ_corvo', sight: 0 },
      { x: 9, y: 3, sprite: 'red', dir: 'down', trainer: 'champ_red', sight: 0,
        ifFlag: 'champ_corvo' }
    ],
    signs: [
      { x: 4, y: 15, text: 'PLINTH I — WREN. Champion for six years. Retired the day she lost, and never said to whom.' },
      { x: 15, y: 12, text: 'PLINTH II — HALDEN. Champion for two. Came up out of the MT. MOON tunnels and went back down them.' },
      { x: 4, y: 9, text: 'PLINTH III — INES. Champion for nine. The longest anyone has held it, and nobody can name a single battle she lost.' },
      { x: 15, y: 6, text: 'PLINTH IV — CORVO. Champion for one afternoon. The shortest reign on record, and he has never once explained it.' },
      { x: 4, y: 3, text: 'PLINTH V — no name, no dates. The brass is polished anyway.' }
    ]
  };
})();
