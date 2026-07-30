// Pokéram — maps_towns.js
// Town exteriors + shared legends. pad() normalizes row widths (short rows
// fill with grass) so layout edits stay safe; the validator still checks all.

(function () {
  G.MAPS = G.MAPS || {};

  // shared exterior legend
  G.LEG_EXT = {
    '.': 'grass', ',': 'grass2', 'f': 'flower', 'g': 'tallgrass',
    'y': 'deco_flowerY', 'o': 'deco_pebble', 'Q': 'deco_bush',
    'P': 'deco_palm', 'H': 'deco_shell', 'Z': 'deco_cinder',
    'p': 'path', 'n': 'path_n', 's': 'path_s', 'e': 'path_e', 'w': 'path_w',
    't': 'tree_tl', 'u': 'tree_tr', 'v': 'tree_bl', 'x': 'tree_br',
    'F': 'fence', 'S': 'sign', 'l': 'ledge',
    '1': 'roof_tl', '2': 'roof_tm', '3': 'roof_tr',
    '4': 'roof_bl', '5': 'roof_bm', '6': 'roof_br',
    'W': 'wall', 'N': 'window', 'D': 'door', 'E': 'gdoor',
    'A': 'lroof_tl', 'B': 'lroof_tm', 'C': 'lroof_tr',
    'a': 'lroof_bl', 'b': 'lroof_bm', 'c': 'lroof_br',
    'L': 'lwall', 'M': 'lwindow', 'O': 'ldoor',
    'G': 'droof_tl', 'I': 'droof_tm', 'J': 'droof_tr',
    'K': 'droof_bl', 'R': 'droof_bm', 'T': 'droof_br',
    '7': 'hroof_tl', '8': 'hroof_tm', '9': 'hroof_tr',
    'd': 'hroof_bl', 'm': 'hroof_bm', 'h': 'hroof_br', '+': 'healsign',
    'q': 'sroof_tl', 'r': 'sroof_tm', 'z': 'sroof_tr',
    'i': 'sroof_bl', 'j': 'sroof_bm', 'k': 'sroof_br', '$': 'shopsign',
    'Y': 'gymdoor', '~': 'water',
    '[': 'shore_w', ']': 'shore_e', '^': 'shore_n', '_': 'shore_s',
    '%': 'sand', '#': 'cliff', '*': 'rock',
    '!': 'hroofx', '@': 'sroofx', '&': 'lroofx'
  };

  // shared interior legend
  G.LEG_INT = {
    '.': 'ifloor', 'I': 'iwall', 'm': 'imat', 'T': 'itable', 'B': 'ibook',
    'H': 'imach', '(': 'ibed_t', ')': 'ibed_b', 'P': 'iplant', 'o': 'istool',
    'C': 'icounter', 'E': 'ihealm', 'G': 'gfloor', 'R': 'redcarpet', 'U': 'statue'
  };

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

  function blankDeco(w, h) { return pad([], w, h); }

  // ------------------------------------------------------------------------
  // HEARTHVALE — home town.
  // ------------------------------------------------------------------------
  G.MAPS.hearthvale = {
    id: 'hearthvale', name: 'Littleroot Town', w: 22, h: 20,
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    // Littleroot-style: two homes (NW/NE) with flower beds, Prof. Birch's lab a
    // big emblemed building across the south, a path network wrapping around it,
    // and organic tree clumps. Plain grass auto-decorates via decorateMap.
    ground: pad([
      'tututututupptututututu',
      'vxvxvxvxvxppvxvxvxvxvx',
      'tu........pp........tu',
      'vx.1223...pp...1223.vx',
      'tu.4556...pp...4556.tu',
      'vx.WNDW...pp...WNDW.vx',
      'tu..f.f...pp....f.f.tu',
      'vx...ppp..pp..ppp...vx',
      'tu........pp........tu',
      'vx..tu....pp........vx',
      'tu..vx....pp........tu',
      'vx........pp........vx',
      'tu....ABBB&BBBBC....tu',
      'vx....abbbbbbbbc....vx',
      'tu....LMMMOOMMML....tu',
      'vx......pppppp......vx',
      'tu...f..........f...tu',
      'vx..................vx',
      'tututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvx'
    ], 22, 20),
    deco: blankDeco(22, 20),
    warps: [
      { x: 10, y: 1, to: 'route1', tx: 8, ty: 22, dir: 'up' },
      { x: 11, y: 1, to: 'route1', tx: 9, ty: 22, dir: 'up' },
      { x: 5, y: 5, to: 'playerhome', tx: 4, ty: 6, dir: 'up' },
      { x: 10, y: 14, to: 'lab', tx: 5, ty: 8, dir: 'up' },
      { x: 11, y: 14, to: 'lab', tx: 6, ty: 8, dir: 'up' }
    ],
    signs: [
      { x: 12, y: 2, text: 'HEARTHVALE — Where every journey takes its first step.' },
      { x: 7, y: 15, text: "PROF. BIRCH'S LAB" },
      { x: 17, y: 5, text: "It's locked. The neighbors must be out on the routes." }
    ],
    npcs: [
      { x: 16, y: 9, sprite: 'boy', dir: 'down', dialog: ['Prof. Birch keeps three creatures in his lab.', 'THREE! And one of them gets to be yours. So unfair!'] },
      { x: 13, y: 9, sprite: 'prof', dir: 'down', event: 'giftCandy' },
      // your friend Remy + a neighbor block the north gate until you have a
      // partner of your own; both step aside once `starter` is set.
      { x: 10, y: 2, sprite: 'boy', dir: 'down', unlessFlag: 'starter', event: 'friendBlock' },
      { x: 11, y: 2, sprite: 'boy', dir: 'down', unlessFlag: 'starter', dialog: ['The tall grass out there is full of wild Pokémon.', "Best not to wander out without a partner of your own!"] }
    ],
    // Mom tags along with you in town (see G.updateFollower) — talk to her to heal
    // and, before you have a starter, to be pointed at Prof. Birch's lab.
    scripts: []
  };

  // ------------------------------------------------------------------------
  // COBBLEMARCH — first city. Rock gym NW, heal + shop, Route 1 south,
  // Route 2 east (gate guard until badge 1).
  // ------------------------------------------------------------------------
  G.MAPS.cobblemarch = {
    id: 'cobblemarch', name: 'Rustboro City', w: 24, h: 28, gymEmblem: { x: 5, y: 4, type: 'rock' },
    music: 'town', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    // North half = the original old-town core (gym NW, Center + Mart, a house);
    // south half = the modern district added below: Devon Corp HQ (big stone
    // building, left) and the Trainers' School (right) flanking a plaza street,
    // with the main avenue running down to the Route 1 gate.
    ground: pad([
      'tutututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvx',
      'tu....................tu',
      'vx.AB&BBC.............vx',
      'tu.abbbbc...7!89.q@rz.tu',
      'vx.LMYYML...dmmh.ijjk.vx',
      'tu..........W+EW.W$EW.tu',
      'vxnnnnnnnnnnnnnnnnnnnnvx',
      'tussssssssppsssssssssspp',
      'vx........pp..........pp',
      'tu...1223.pp.,........tu',
      'vx...4556.pp........f.vx',
      'tu...WNDW.pp..f.......tu',
      'vx........pp..........vx',
      'tu...f....pp.....,....tu',
      'vx........pp..........vx',
      'tu........pp..........tu',
      'vx........pp..........vx',
      'tu..pppppppppppppppp..tu',
      'vx.GIIIIIJ....12223...vx',
      'tu.KRRRRRT....45556...tu',
      'vx.WNNDDNW....WNDNW...vx',
      'tu..pppppppppppppppp..tu',
      'vx........pp..........vx',
      'tu...f....pp......,...tu',
      'vx........pp..........vx',
      'tututututupptutututututu',
      'vxvxvxvxvxppvxvxvxvxvxvx'
    ], 24, 28),
    deco: blankDeco(24, 28),
    warps: [
      { x: 10, y: 27, to: 'route1', tx: 8, ty: 1, dir: 'down' },
      { x: 11, y: 27, to: 'route1', tx: 9, ty: 1, dir: 'down' },
      { x: 23, y: 8, to: 'route2', tx: 1, ty: 9, dir: 'right' },
      { x: 23, y: 9, to: 'route2', tx: 1, ty: 10, dir: 'right' },
      { x: 5, y: 5, to: 'gym1', tx: 5, ty: 10, dir: 'up' },
      { x: 6, y: 5, to: 'gym1', tx: 5, ty: 10, dir: 'up' },
      { x: 14, y: 6, to: 'heal_cobblemarch', tx: 4, ty: 7, dir: 'up' },
      { x: 19, y: 6, to: 'shop_cobblemarch', tx: 4, ty: 7, dir: 'up' },
      { x: 7, y: 12, to: 'house_cobble', tx: 4, ty: 6, dir: 'up' },
      { x: 6, y: 21, to: 'devonhq', tx: 4, ty: 7, dir: 'up' },
      { x: 7, y: 21, to: 'devonhq', tx: 4, ty: 7, dir: 'up' },
      { x: 16, y: 21, to: 'trainerschool_cobble', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 13, y: 7, text: 'COBBLEMARCH — Old stones, new beginnings.' },
      { x: 8, y: 5, text: "COBBLEMARCH GYM — Leader Bram. 'Steady as bedrock.'" },
      { x: 5, y: 22, text: 'DEVON CORPORATION — Makers of Poké Balls and fine devices.' },
      { x: 15, y: 22, text: "TRAINERS' SCHOOL — Lessons daily. New trainers welcome!" }
    ],
    npcs: [
      { x: 21, y: 8, sprite: 'boy', dir: 'left', dialog: ['Route 2 east leads to Petalburg Woods.', "But the port town beyond is closed off until you've got the Bedrock Badge."] },
      { x: 13, y: 10, sprite: 'mom', dir: 'down', dialog: ['The heal house has the pink roof — they patch up creatures free of charge.', 'The shop has the green roof. Stock up on orbs, dear.'] },
      { x: 9, y: 22, sprite: 'prof', dir: 'right', dialog: ['Welcome to the modern district! Devon HQ employs half the city.', 'They say Devon is developing a device that maps the whole region.'] }
    ],
    // your friend Remy catches up the first time you walk in, then heads off
    // on their own journey (which retires their Route 1 healing for good).
    scripts: [
      { x: [10, 11], y: 16, once: 'friendFarewellSeen', run: 'friendFarewell' }
    ]
  };

  // ------------------------------------------------------------------------
  // BRINEHOLLOW PORT — water gym. Forest east, Route 3 west, sea south.
  // ------------------------------------------------------------------------
  G.MAPS.brinehollow = {
    id: 'brinehollow', name: 'Dewford Town', w: 26, h: 20, gymEmblem: { x: 5, y: 10, type: 'fighting' },
    music: 'seaside', battleBg: 'water', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tu......7!89.q@rz.......tu',
      'vx......dmmh.ijjk.......vx',
      'tu......W+EW.W$EW.......tu',
      'vx........p....p........vx',
      'tu.......pppppppp.......tu',
      'vx.......pppppppp.......vx',
      'tu..pppppppppppppppppp..tu',
      'vx.AB&BBC..pp..........ppp',
      'pppabbbbc..pp...........pp',
      'pppLMYYML..pp..1223.....tu',
      'tu...pppppppp..4556.FFF.vx',
      'vx....f....pp..WNDW.FyF.tu',
      'tu..P......ppppppp...P..vx',
      'vx%%%%%%%%%%%%%%%%%%%%%%tu',
      'tu%%%%%%%%%%%%%%%%%%%%%%vx',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ], 26, 20),
    deco: blankDeco(26, 20),
    warps: [
      { x: 25, y: 9, to: 'verdantforest', tx: 1, ty: 12, dir: 'right' },
      { x: 25, y: 10, to: 'verdantforest', tx: 1, ty: 13, dir: 'right' },
      { x: 0, y: 10, to: 'route3', tx: 32, ty: 8, dir: 'left' },
      { x: 0, y: 11, to: 'route3', tx: 32, ty: 9, dir: 'left' },
      { x: 5, y: 11, to: 'gym2', tx: 5, ty: 10, dir: 'up' },
      { x: 6, y: 11, to: 'gym2', tx: 5, ty: 10, dir: 'up' },
      { x: 10, y: 4, to: 'heal_brinehollow', tx: 4, ty: 7, dir: 'up' },
      { x: 15, y: 4, to: 'shop_brinehollow', tx: 4, ty: 7, dir: 'up' },
      { x: 17, y: 13, to: 'house_brine', tx: 4, ty: 6, dir: 'up' }
    ],
    signs: [
      { x: 3, y: 14, text: 'BRINEHOLLOW PORT — The sea remembers every sailor.' },
      { x: 2, y: 12, text: "BRINEHOLLOW GYM — Leader Maris. 'Flow like the tide.'" }
    ],
    npcs: [
      { x: 6, y: 8, sprite: 'prof', dir: 'down', dialog: ['Old sailor wisdom: Water creatures fear Electric and Grass moves.', 'Maris herself? Swears by raw power. Bring bandages.'] },
      { x: 20, y: 9, sprite: 'boy', dir: 'down', dialog: ['I saw a ghost ship figurehead drift past the pier last night!', 'Nobody believes me. You believe me, right?'] },
      { id: 'aqua_grunt1', trainer: 'aqua_grunt1', x: 14, y: 8, sprite: 'aqua', dir: 'down', sight: 4, after: 'Team Aqua marks every port. We will be back for this one.' },
      { id: 'aqua_grunt2', trainer: 'aqua_grunt2', x: 9, y: 14, sprite: 'aqua', dir: 'up', sight: 4, after: 'Enjoy your dry little town... while it lasts.' },
      { x: 12, y: 17, sprite: 'fx_boat', obj: true, event: 'boardBoat' }
    ],
    scripts: []
  };

  // ------------------------------------------------------------------------
  // COILGATE CITY — electric gym. Cave east, Route 4 north (badge 3 gate).
  // ------------------------------------------------------------------------
  G.MAPS.coilgate = {
    id: 'coilgate', name: 'Mauville City', w: 26, h: 20, gymEmblem: { x: 5, y: 4, type: 'electric' },
    music: 'city', battleBg: 'indoor', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tutututututuppvxtututututu',
      'vxvxvxvxvxvxppvxvxvxvxvxvx',
      'tu..........pp..........tu',
      'vx.AB&BBC...pp...7!89...vx',
      'tu.abbbbc...pp...dmmh...tu',
      'vx.LMYYML...pp...W+EW...vx',
      'tu...pp.....pp.....p....tu',
      'vx...ppppppppppppppp....vx',
      'tu...ppppppppppppppp....tu',
      'vx..........pp....pppppppp',
      'tu...q@rz...pp..1223....pp',
      'vx...ijjk...pp..4556....tu',
      'tu...W$EW...pp..WNDW....vx',
      'vx..........pp..........tu',
      'tuFFF.......pp.......FFFvx',
      'vxFyF.......pp.......FyFtu',
      'tu..........pp..........vx',
      'vx..........pp..........tu',
      'tutututututuppvxtutututtuu',
      'vxvxvxvxvxvxppvxvxvxvxvxvx'
    ], 26, 20),
    deco: blankDeco(26, 20),
    warps: [
      { x: 12, y: 19, to: 'hollowdeep1', tx: 3, ty: 4, dir: 'down' },
      { x: 13, y: 19, to: 'hollowdeep1', tx: 4, ty: 4, dir: 'down' },
      { x: 12, y: 0, to: 'route4', tx: 10, ty: 25, dir: 'up' },
      { x: 13, y: 0, to: 'route4', tx: 11, ty: 25, dir: 'up' },
      { x: 25, y: 9, to: 'route3', tx: 1, ty: 8, dir: 'right' },
      { x: 25, y: 10, to: 'route3', tx: 1, ty: 9, dir: 'right' },
      { x: 5, y: 5, to: 'gym3', tx: 5, ty: 10, dir: 'up' },
      { x: 6, y: 5, to: 'gym3', tx: 5, ty: 10, dir: 'up' },
      { x: 19, y: 5, to: 'heal_coilgate', tx: 4, ty: 7, dir: 'up' },
      { x: 7, y: 12, to: 'shop_coilgate', tx: 4, ty: 7, dir: 'up' },
      { x: 18, y: 12, to: 'house_coil', tx: 4, ty: 6, dir: 'up' }
    ],
    signs: [
      { x: 15, y: 9, text: 'COILGATE CITY — Powered by ambition (and several thousand Voltail).' },
      { x: 8, y: 6, text: "COILGATE GYM — Leader Tess. 'Keep up with the current.'" }
    ],
    npcs: [
      { x: 14, y: 2, sprite: 'boy', dir: 'down', unlessFlag: 'badge3', dialog: ['Route 4 is storm-locked until you hold the Dynamo Badge.', 'Tess keeps the gate key. Well. Metaphorically.'] },
      { x: 10, y: 14, sprite: 'mom', dir: 'down', dialog: ['The tunnel south leads back through Hollowdeep to the coast.', 'Ground-type creatures shrug off electricity. Just saying.'] }
    ],
    scripts: [
      { x: [11, 14], y: 16, once: 'ev_rival3', run: 'rival3' }
    ]
  };

  // ------------------------------------------------------------------------
  // AURELUNE CITY — psychic gym. Route 4 south, Summit Path east.
  // ------------------------------------------------------------------------
  G.MAPS.aurelune = {
    id: 'aurelune', name: 'Lavaridge Town', w: 24, h: 20, volcano: true, gymEmblem: { x: 14, y: 4, type: 'fire' },
    music: 'volcano', battleBg: 'indoor', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tutututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvx',
      'tu.....,..........f...tu',
      'vx..7!89....AB&BBC....vx',
      'tu..dmmh....abbbbc....tu',
      'vx..W+EW....LMYYML....vx',
      'tu....p...pp..pp......tu',
      'vx....pppppppppp......vx',
      'tu....pppppppppppppppppp',
      'vx........pp....pppppppp',
      'tu..q@rz..pp..1223....tu',
      'vx..ijjk..pp..4556....vx',
      'tu..W$EW..pp..WNDW....tu',
      'vx........pp....,.....vx',
      'tuFFF.....pp.......FFFtu',
      'vxFyF.....pp.......FyFvx',
      'tu........pp..........tu',
      'vx........pp..........vx',
      'tutututuvxppvxtututututu',
      'vxvxvxvxvxppvxvxvxvxvxvx'
    ], 24, 20),
    deco: blankDeco(24, 20),
    warps: [
      { x: 10, y: 19, to: 'route4', tx: 10, ty: 2, dir: 'down' },
      { x: 11, y: 19, to: 'route4', tx: 11, ty: 2, dir: 'down' },
      { x: 23, y: 8, to: 'route5', tx: 1, ty: 5, dir: 'right' },
      { x: 23, y: 9, to: 'route5', tx: 1, ty: 6, dir: 'right' },
      { x: 14, y: 5, to: 'gym4', tx: 5, ty: 10, dir: 'up' },
      { x: 15, y: 5, to: 'gym4', tx: 5, ty: 10, dir: 'up' },
      { x: 6, y: 5, to: 'heal_aurelune', tx: 4, ty: 7, dir: 'up' },
      { x: 6, y: 12, to: 'shop_aurelune', tx: 4, ty: 7, dir: 'up' },
      { x: 16, y: 12, to: 'house_aure', tx: 4, ty: 6, dir: 'up' }
    ],
    signs: [
      { x: 12, y: 9, text: 'AURELUNE CITY — The moon lingers here a little longer.' },
      { x: 16, y: 6, text: "AURELUNE GYM — Leader Vesper. 'I dreamed you would read this.'" }
    ],
    npcs: [
      { x: 21, y: 10, sprite: 'prof', dir: 'left', unlessFlag: 'badge4', dialog: ['Summit Path demands all four badges.', 'Vesper holds the last one. Sleep well before you face her.'] },
      { x: 8, y: 14, sprite: 'boy', dir: 'down', dialog: ['Shadow and Bug moves cut right through Psychic creatures.', "Vesper knows that you know. She's planned for it. Probably."] }
    ],
    scripts: []
  };

  // ------------------------------------------------------------------------
  // CROWN SUMMIT — the peak. Champion hall + post-game Astradrax.
  // ------------------------------------------------------------------------
  G.MAPS.crownsummit = {
    id: 'crownsummit', name: 'Pokémon League', w: 20, h: 18,
    music: 'cave', battleBg: 'cave', base: 'cliff',
    legend: G.LEG_EXT,
    ground: pad([
      '####################',
      '####################',
      '##.......**......###',
      '##..*............###',
      '#......AB&BBC......#',
      '#......abbbbc......#',
      '#......LMYYML......#',
      '#..................#',
      '#...*...pppp...*...#',
      '#.......pppp.......#',
      '#..7!89.pppp.q@rz..#',
      '#..dmmh.pppp.ijjk..#',
      '#..W+EW.pppp.W$EW..#',
      '#.......pppp.......#',
      '#.......pppp...*...#',
      '#..*....pppp.......#',
      '########pppp########',
      '########pppp########'
    ], 20, 18, '#'),
    deco: blankDeco(20, 18),
    warps: [
      { x: 8, y: 17, to: 'summitpath', tx: 9, ty: 1, dir: 'down' },
      { x: 9, y: 17, to: 'summitpath', tx: 10, ty: 1, dir: 'down' },
      { x: 10, y: 17, to: 'summitpath', tx: 10, ty: 1, dir: 'down' },
      { x: 11, y: 17, to: 'summitpath', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 6, to: 'championhall', tx: 4, ty: 12, dir: 'up' },
      { x: 10, y: 6, to: 'championhall', tx: 5, ty: 12, dir: 'up' },
      { x: 5, y: 12, to: 'heal_summit', tx: 4, ty: 7, dir: 'up' },
      { x: 15, y: 12, to: 'shop_summit', tx: 4, ty: 7, dir: 'up' }
    ],
    signs: [
      { x: 12, y: 8, text: 'CROWN SUMMIT — Beyond this hall sits the Champion of Solyn.' }
    ],
    npcs: [
      { x: 9, y: 3, sprite: 'prof', dir: 'down', dialog: ['Beyond the Champion, they say, the very titans of Hoenn stir...', 'Sea, land, and sky — a Champion may yet be called to face them.'] }
    ],
    scripts: []
  };
})();


