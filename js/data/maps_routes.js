// Pokéram — maps_routes.js
// Routes 1-4 + Summit Path. Encounter tables are rarity-weighted automatically.

(function () {
  G.MAPS = G.MAPS || {};
  var pad = G.padRows;
  function blankDeco(w, h) { return G.padRows([], w, h); }

  // ------------------------------------------------------------------------
  // ROUTE 1 — Hearthvale (south) to Cobblemarch (north). Rival battle 1.
  // ------------------------------------------------------------------------
  G.MAPS.route1 = {
    id: 'route1', name: 'Route 101', w: 18, h: 24,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    // Emerald Route-101 style: the dirt path winds (center -> left -> right ->
    // center) instead of a straight corridor, threading THREE staggered tall-grass
    // patches, with a partial one-way ledge (blocks northward, funnels you through
    // the gap) about halfway. The open grass auto-decorates via decorateMap.
    ground: pad([
      'tutututupptutututu',
      'vxvxvxvxppvxvxvxvx',
      'tu......pp......tu',
      'vx.ggg..pp......vx',
      'tu.ggg..pp......tu',
      'vx.gggpppp......vx',
      'tu..f.pp........tu',
      'vx....pp........vx',
      'tu....pp........tu',
      'vx....pppp.ggg..vx',
      'tu......ppppgg..tu',
      'vx.......ppp....vx',
      'tu.lllllllpplllltu',
      'vx........pppp..vx',
      'tu.gggg.....pp..tu',
      'vx.gggg.....pp..vx',
      'tu.gggg...pppp..tu',
      'vx......pppp....vx',
      'tu......pp..f...tu',
      'vx......pp......vx',
      'tu......pp......tu',
      'vx......pp......vx',
      'tutututupptutututu',
      'vxvxvxvxppvxvxvxvx'
    ], 18, 24),
    deco: blankDeco(18, 24),
    warps: [
      { x: 8, y: 23, to: 'hearthvale', tx: 10, ty: 2, dir: 'down' },
      { x: 9, y: 23, to: 'hearthvale', tx: 11, ty: 2, dir: 'down' },
      { x: 8, y: 0, to: 'cobblemarch', tx: 10, ty: 25, dir: 'up' },
      { x: 9, y: 0, to: 'cobblemarch', tx: 11, ty: 25, dir: 'up' }
    ],
    signs: [
      { x: 10, y: 20, text: 'ROUTE 1 — South: Hearthvale. North: Cobblemarch.' }
    ],
    // Remy greets you on entry (remyGreet script) and then follows you the whole
    // way (G.updateFollower), so you can heal any time without backtracking to him.
    npcs: [],
    trainers: [
      { id: 'r1_tom', trainer: 'r1_tom', x: 5, y: 8, sprite: 'boy', dir: 'right', sight: 3, after: 'The gym in Cobblemarch is way tougher than me. Way, WAY tougher.' },
      { id: 'r1_ana', trainer: 'r1_ana', x: 12, y: 16, sprite: 'mom', dir: 'left', sight: 3, after: 'Your team has good manners. Mostly.' }
    ],
    items: [
      { x: 3, y: 7, item: 'potion', qty: 1, flag: 'itm_r1_potion' },
      { x: 14, y: 19, item: 'tameorb', qty: 2, flag: 'itm_r1_orbs' },
      { x: 9, y: 11, item: 'candyxs', qty: 1, flag: 'itm_r1_candy' }
    ],
    encounters: {
      rate: 0.10,
      table: [
        { sp: 'zigzagoon', min: 2, max: 4 },
        { sp: 'poochyena', min: 2, max: 4 },
        { sp: 'wurmple', min: 3, max: 4 },
        { sp: 'taillow', min: 3, max: 5 },
        { sp: 'seedot', min: 2, max: 4 },
        { sp: 'lotad', min: 2, max: 4 },
        { sp: 'shroomish', min: 3, max: 5 },
        { sp: 'wingull', min: 3, max: 5 },
        { sp: 'marill', min: 3, max: 5 },
        { sp: 'surskit', min: 2, max: 4 },
        { sp: 'nincada', min: 3, max: 5 },
        { sp: 'azurill', min: 2, max: 4 },
        { sp: 'whismur', min: 2, max: 4 },
        { sp: 'skitty', min: 3, max: 5, w: 8 },
        { sp: 'ralts', min: 3, max: 5, w: 8 }
      ]
    },
    scripts: [
      { x: [6, 11], y: 20, ifFlag: 'starter', once: 'remyGreetSeen', run: 'remyGreet' },
      { x: [8, 9], y: 4, once: 'ev_rival1', run: 'rival1' }
    ]
  };

  // ------------------------------------------------------------------------
  // ROUTE 2 — Cobblemarch (west) to Verdant Forest (north).
  // ------------------------------------------------------------------------
  G.MAPS.route2 = {
    id: 'route2', name: 'Route 102', w: 22, h: 26,
    music: 'route', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    // Winding route (Emerald-style): the path snakes center -> right -> left with
    // a west branch out to Cobblemarch, threading staggered grass patches and a
    // one-way ledge. North gate -> Verdant Woods. Open grass auto-decorates; all
    // warps + trainers/items kept on walkable tiles.
    ground: pad([
      'tutututupptutututututu',
      'vxvxvxvxppvxvxvxvxvxvx',
      'tu......pp..........tu',
      'vxggg...pp..........vx',
      'tuggg...pppp........tu',
      'vxggg.....pp..gggg..vx',
      'tu........pp..gggg..tu',
      'vx......pppp..gggg..vx',
      'tu....pppp..........tu',
      'pppppppppp..........vx',
      'pppppppppp..........tu',
      'vx....pppp..........vx',
      'tu....pp.....lllll..tu',
      'vx....pp............vx',
      'tu....pppp..........tu',
      'vxggg...pp..........vx',
      'tuggg...pp..........tu',
      'vxggg...pppp........vx',
      'tuggg.....pp........tu',
      'vxggg.....pp..gggg..vx',
      'tu......pppp..gggg..tu',
      'vx......pp....gggg..vx',
      'tu......pp....gggg..tu',
      'vx......pp..........vx',
      'tutututupptutututututu',
      'vxvxvxvxppvxvxvxvxvxvx'
    ], 22, 26),
    deco: blankDeco(22, 26),
    warps: [
      { x: 0, y: 9, to: 'cobblemarch', tx: 22, ty: 8, dir: 'left' },
      { x: 0, y: 10, to: 'cobblemarch', tx: 22, ty: 9, dir: 'left' },
      { x: 8, y: 0, to: 'verdantforest', tx: 13, ty: 24, dir: 'up' },
      { x: 9, y: 0, to: 'verdantforest', tx: 14, ty: 24, dir: 'up' },
      { x: 8, y: 25, to: 'cobblemarch', tx: 11, ty: 2, dir: 'down' },
      { x: 9, y: 25, to: 'cobblemarch', tx: 12, ty: 2, dir: 'down' }
    ],
    signs: [
      { x: 11, y: 8, text: 'ROUTE 2 — North: Verdant Forest. West: Cobblemarch.' }
    ],
    npcs: [],
    trainers: [
      { id: 'r2_ben', trainer: 'r2_ben', x: 13, y: 6, sprite: 'boy', dir: 'left', sight: 3, after: 'The forest north is full of bugs. Strong bugs.' },
      { id: 'r2_mia', trainer: 'r2_mia', x: 6, y: 14, sprite: 'mom', dir: 'right', sight: 3, after: 'Fluffit demands a rematch. Eventually.' },
      { id: 'r2_cliff', trainer: 'r2_cliff', x: 15, y: 20, sprite: 'prof', dir: 'left', sight: 4, after: 'Solid technique. Like a good rock.' }
    ],
    items: [
      { x: 19, y: 3, item: 'potion', qty: 2, flag: 'itm_r2_potion' },
      { x: 3, y: 22, item: 'greatorb', qty: 1, flag: 'itm_r2_greatorb' }
    ],
    encounters: {
      rate: 0.11,
      table: [
        { sp: 'zigzagoon', min: 6, max: 9 },
        { sp: 'poochyena', min: 6, max: 9 },
        { sp: 'lotad', min: 7, max: 9 },
        { sp: 'seedot', min: 7, max: 9 },
        { sp: 'taillow', min: 7, max: 9 },
        { sp: 'shroomish', min: 7, max: 9 },
        { sp: 'surskit', min: 7, max: 9 },
        { sp: 'wingull', min: 7, max: 9 },
        { sp: 'wurmple', min: 6, max: 9 },
        { sp: 'nincada', min: 7, max: 9 },
        { sp: 'marill', min: 7, max: 9 },
        { sp: 'oddish', min: 7, max: 9 },
        { sp: 'whismur', min: 6, max: 9 },
        { sp: 'abra', min: 7, max: 9, w: 12 },
        { sp: 'ralts', min: 8, max: 9, w: 10 },
        { sp: 'slakoth', min: 7, max: 9, w: 12 }
      ]
    },
    scripts: []
  };

  // ------------------------------------------------------------------------
  // ROUTE 3 — coastal stretch: Coilgate side (west, via Hollowdeep) to
  // Brinehollow (east). Slumbear set-piece. Sea to the south.
  // ------------------------------------------------------------------------
  G.MAPS.route3 = {
    id: 'route3', name: 'Route 109', w: 34, h: 18,
    music: 'route', battleBg: 'water', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      'tututututututututututututututututu',
      'vxvxvxvxvxvxvxvxvxvxvxvxvxvxvxvxvx',
      'tu..gggg................gggg....tu',
      'vx..gggg.....ggg......gggg......vx',
      'tu..ggg..........llllll.........tu',
      'vx..ggg....................*...vx',
      'tu..f......................*...tu',
      'vxnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnvx',
      'pppppppppppppppppppppppppppppppppp',
      'pppppppppppppppppppppppppppppppppp',
      'tussssssssssssssssssssssssssssssvx',
      'vx...%%%%%%%%%%%%%%%%%%%%%%%%...tu',
      'tu...%%%%%%%%%%%%%%%%%%%%%%%%...vx',
      'vx...%%%..........%%%%%.........tu',
      'tu...%%%....,.....%%%%%.....f...vx',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ], 34, 18),
    deco: blankDeco(34, 18),
    warps: [
      { x: 0, y: 8, to: 'hollowdeep1', tx: 22, ty: 16, dir: 'left' },
      { x: 0, y: 9, to: 'hollowdeep1', tx: 22, ty: 17, dir: 'left' },
      { x: 33, y: 8, to: 'brinehollow', tx: 1, ty: 10, dir: 'right' },
      { x: 33, y: 9, to: 'brinehollow', tx: 1, ty: 11, dir: 'right' }
    ],
    signs: [
      { x: 4, y: 7, text: 'ROUTE 3 — West: Hollowdeep Cave. East: Brinehollow Port.' }
    ],
    npcs: [
      { x: 16, y: 6, sprite: 'mon_spinda', obj: true, unlessFlag: 'ev_slumbear', event: 'wakeSlumbear' },
      { x: 8, y: 15, sprite: 'fx_boat', obj: true, event: 'boardBoat' }
    ],
    trainers: [
      { id: 'r3_lou', trainer: 'r3_lou', x: 8, y: 12, sprite: 'mom', dir: 'right', sight: 3, after: 'The sea is nice this time of year. Less nice for my pride.' },
      { id: 'r3_gus', trainer: 'r3_gus', x: 22, y: 5, sprite: 'prof', dir: 'down', sight: 3, after: 'Take the cave slow. The dark gets heavy.' },
      { id: 'r3_zee', trainer: 'r3_zee', x: 27, y: 12, sprite: 'boy', dir: 'left', sight: 4, after: 'Glow squad will train harder!' },
      { id: 'r3_kym', trainer: 'r3_kym', x: 13, y: 4, sprite: 'boy', dir: 'down', sight: 3, after: 'Light feet, heavy hits. Remember that.' }
    ],
    items: [
      { x: 31, y: 2, item: 'superpotion', qty: 1, flag: 'itm_r3_spot' },
      { x: 6, y: 13, item: 'cureall', qty: 1, flag: 'itm_r3_cure' }
    ],
    encounters: {
      rate: 0.11,
      table: [
        { sp: 'wingull', min: 13, max: 16 },
        { sp: 'marill', min: 13, max: 16 },
        { sp: 'lotad', min: 13, max: 16 },
        { sp: 'magikarp', min: 14, max: 16 },
        { sp: 'tentacool', min: 13, max: 15 },
        { sp: 'electrike', min: 14, max: 16 },
        { sp: 'wailmer', min: 15, max: 17 },
        { sp: 'zigzagoon', min: 13, max: 16 },
        { sp: 'taillow', min: 13, max: 16 },
        { sp: 'gulpin', min: 13, max: 16 },
        { sp: 'staryu', min: 13, max: 16 },
        { sp: 'corphish', min: 14, max: 17 },
        { sp: 'goldeen', min: 13, max: 16 },
        { sp: 'horsea', min: 14, max: 16 },
        { sp: 'carvanha', min: 14, max: 17, w: 10 },
        { sp: 'spheal', min: 14, max: 16, w: 8 }
      ]
    },
    scripts: []
  };

  // ------------------------------------------------------------------------
  // ROUTE 4 — Coilgate (south) to Aurelune (north). Badge 3 gate.
  // ------------------------------------------------------------------------
  G.MAPS.route4 = {
    id: 'route4', name: 'Route 111', w: 20, h: 28, weather: 'sand', volcano: true,
    music: 'route2', battleBg: 'meadow', base: 'grass',
    legend: G.LEG_EXT,
    // Winding sandstorm route: the path snakes between the south (Coilgate) and
    // north (Aurelune) gates, threading staggered tall-grass and a one-way ledge
    // that funnels northbound travelers. Warps + trainers/items on walkable tiles.
    ground: pad([
      'tututututupptutututu',
      'vxvxvxvxvxppvxvxvxvx',
      'tu........pp..ggg.tu',
      'vx.....ppppp......vx',
      'tuggg..pp.........tu',
      'vxggg..pp.........vx',
      'tu...pppp.....ggg.tu',
      'vx...pppp.....ggg.vx',
      'tu.....pppp.......tu',
      'vx.......pp.......vx',
      'tu.......pp.......tu',
      'vx.......pppp.....vx',
      'tu.llll..ppppllll.tu',
      'vxggg......ppp....vx',
      'tu..ggg.....pp....tu',
      'vx..........pp....vx',
      'tu.......ppppp....tu',
      'vx......pp...ggg..vx',
      'tu....pppp...ggg..tu',
      'vx...ppp.....ggg..vx',
      'tu...ppppp........tu',
      'vx......pppp......vx',
      'tu.......ppppp.gg.tu',
      'vx........pp......vx',
      'tu........pp......tu',
      'vx........pp......vx',
      'tututututupptutututu',
      'vxvxvxvxvxppvxvxvxvx'
    ], 20, 28),
    deco: blankDeco(20, 28),
    warps: [
      { x: 10, y: 27, to: 'coilgate', tx: 12, ty: 2, dir: 'down' },
      { x: 11, y: 27, to: 'coilgate', tx: 13, ty: 2, dir: 'down' },
      { x: 10, y: 0, to: 'aurelune', tx: 10, ty: 18, dir: 'up' },
      { x: 11, y: 0, to: 'aurelune', tx: 11, ty: 18, dir: 'up' }
    ],
    signs: [
      { x: 13, y: 7, text: 'ROUTE 4 — North: Aurelune City. South: Coilgate City.' }
    ],
    npcs: [],
    trainers: [
      { id: 'r4_tia', trainer: 'r4_tia', x: 6, y: 6, sprite: 'mom', dir: 'right', sight: 3, after: 'The sparkles will remember this.' },
      { id: 'r4_vin', trainer: 'r4_vin', x: 14, y: 13, sprite: 'boy', dir: 'left', sight: 4, after: 'Watch the tall grass. My team lives there. Rude of them.' },
      { id: 'r4_hank', trainer: 'r4_hank', x: 5, y: 19, sprite: 'prof', dir: 'right', sight: 3, after: 'Good roadwork beats good luck.' },
      { id: 'r4_lux', trainer: 'r4_lux', x: 15, y: 22, sprite: 'boy', dir: 'left', sight: 4, after: 'Aurelune will suit you. Dramatic lighting.' }
    ],
    items: [
      { x: 3, y: 14, item: 'hyperpotion', qty: 1, flag: 'itm_r4_hpot' },
      { x: 16, y: 20, item: 'greatorb', qty: 2, flag: 'itm_r4_orbs' }
    ],
    encounters: {
      rate: 0.11,
      table: [
        { sp: 'electrike', min: 22, max: 26 },
        { sp: 'plusle', min: 22, max: 25 },
        { sp: 'minun', min: 22, max: 26 },
        { sp: 'gulpin', min: 23, max: 26 },
        { sp: 'spoink', min: 23, max: 26 },
        { sp: 'numel', min: 24, max: 26 },
        { sp: 'zangoose', min: 25, max: 27 },
        { sp: 'seviper', min: 25, max: 27 },
        { sp: 'trapinch', min: 22, max: 26 },
        { sp: 'cacnea', min: 23, max: 26 },
        { sp: 'sandshrew', min: 22, max: 26 },
        { sp: 'baltoy', min: 23, max: 26 },
        { sp: 'slugma', min: 23, max: 26 },
        { sp: 'phanpy', min: 22, max: 25 },
        { sp: 'rhyhorn', min: 24, max: 27 },
        { sp: 'spinda', min: 22, max: 26 },
        { sp: 'torkoal', min: 24, max: 27, w: 10 }
      ]
    },
    scripts: []
  };

  // ------------------------------------------------------------------------
  // SUMMIT PATH — Aurelune (south-west) to Crown Summit (north).
  // Four-badge checkpoint; rival battle 4; late-game wilds.
  // ------------------------------------------------------------------------
  G.MAPS.summitpath = {
    id: 'summitpath', name: 'Victory Road', w: 20, h: 30,
    music: 'cave', battleBg: 'cave', base: 'grass',
    legend: G.LEG_EXT,
    ground: pad([
      '#########pp#########',
      '#########pp#########',
      '##.......pp.......##',
      '##..*....pp..ggg..##',
      '#........pp..ggg..##',
      '#...ggg..pp.......##',
      '#...ggg..pp....*..##',
      '#...ggg..pp.......##',
      '#........pp..ggg..##',
      '##.......pp..ggg..##',
      '##...*...pp.......##',
      '##.......pp...,...##',
      '###......pp......###',
      '###..ggg.pp.ggg..###',
      '###..ggg.pp.ggg..###',
      '###......pp......###',
      '##..lllllpp..*....##',
      '##.......pp.......##',
      '##..ggg..pp..ggg..##',
      '##..ggg..pp..ggg..##',
      '##.......pp.......##',
      '##...*...pp....,..##',
      '###......pp......###',
      '####.....pp.....####',
      '####..f..pp..f..####',
      '#####....pp....#####',
      '#####....pp....#####',
      'ppppppppppp#########',
      'ppppppppppp#########',
      '####################',
      '####################'
    ], 20, 30, '#'),
    deco: blankDeco(20, 30),
    warps: [
      { x: 0, y: 26, to: 'sootopolis', tx: 18, ty: 8, dir: 'left' },
      { x: 0, y: 27, to: 'sootopolis', tx: 18, ty: 8, dir: 'left' },
      { x: 10, y: 0, to: 'crownsummit', tx: 9, ty: 16, dir: 'up' },
      { x: 11, y: 0, to: 'crownsummit', tx: 10, ty: 16, dir: 'up' }
    ],
    signs: [
      { x: 12, y: 25, text: 'SUMMIT PATH — Champions only beyond this point.' }
    ],
    npcs: [
      { x: 10, y: 24, sprite: 'prof', dir: 'down', unlessFlag: 'badge8', dialog: ['Halt! Victory Road opens only to holders of all EIGHT Gym Badges.', 'Return when every Leader from Rustboro to Sootopolis has been bested.'] }
    ],
    trainers: [
      { id: 'sp_rex', trainer: 'sp_rex', x: 6, y: 20, sprite: 'boy', dir: 'right', sight: 4, after: 'Two more aces above me. Breathe between fights.' },
      { id: 'sp_isa', trainer: 'sp_isa', x: 14, y: 16, sprite: 'mom', dir: 'left', sight: 4, after: 'The wind carries you well.' },
      { id: 'sp_olm', trainer: 'sp_olm', x: 6, y: 10, sprite: 'prof', dir: 'right', sight: 4, after: 'Ninety-one times the charm.' },
      { id: 'sp_ada', trainer: 'sp_ada', x: 13, y: 5, sprite: 'boy', dir: 'left', sight: 4, after: 'Go on. Make the hall remember you.' }
    ],
    items: [
      { x: 16, y: 3, item: 'hyperpotion', qty: 2, flag: 'itm_sp_hpot' },
      { x: 3, y: 16, item: 'revivedust', qty: 1, flag: 'itm_sp_rev' }
    ],
    encounters: {
      rate: 0.12,
      table: [
        { sp: 'snorunt', min: 30, max: 33 },
        { sp: 'spheal', min: 30, max: 34 },
        { sp: 'swablu', min: 31, max: 34 },
        { sp: 'sableye', min: 30, max: 33 },
        { sp: 'bagon', min: 31, max: 34 },
        { sp: 'absol', min: 30, max: 33 },
        { sp: 'geodude', min: 32, max: 35 },
        { sp: 'golbat', min: 30, max: 34 },
        { sp: 'graveler', min: 32, max: 35 },
        { sp: 'rhyhorn', min: 30, max: 34 },
        { sp: 'lairon', min: 31, max: 34 },
        { sp: 'hariyama', min: 31, max: 35 },
        { sp: 'medicham', min: 30, max: 34 },
        { sp: 'mawile', min: 30, max: 34 },
        { sp: 'kecleon', min: 30, max: 33 },
        { sp: 'claydol', min: 32, max: 35, w: 12 },
        { sp: 'shelgon', min: 33, max: 35, w: 8 },
        { sp: 'dusclops', min: 32, max: 35, w: 10 }
      ]
    },
    scripts: [
      { x: [9, 12], y: 12, once: 'ev_rival4', run: 'rival4' }
    ]
  };
})();
