// pokemon-gen3 — maps_expansion.js
// Second half of the journey: 4 more gym towns (Petalburg/Norman, Fortree/Winona,
// Mossdeep/Tate&Liza, Sootopolis/Wallace) and the routes between them, slotted
// after Lavaridge (gym 4) and before Victory Road. Uses small factories so all
// four towns/routes share one validated layout. Wild levels rise each route so
// the curve keeps climbing; by these gyms every line can be fully evolved.

(function () {
  G.MAPS = G.MAPS || {};
  var pad = G.padRows;
  function blank(w, h) { return pad([], w, h); }

  // standard 20x18 gym town: gym (NW), heal (NE), shop (SW), house (SE, locked),
  // west+east road exits. cfg: { name, music, bg, gymId, healId, shopId,
  // west:{to,tx,ty}, east:{to,tx,ty}, gymSign, npcs:[], extraSigns:[] }
  function town(id, cfg) {
    G.MAPS[id] = {
      id: id, name: cfg.name, w: 20, h: 18,
      music: cfg.music || 'town', battleBg: cfg.bg || 'meadow', base: 'grass', legend: G.LEG_EXT,
      gymEmblem: cfg.gymType ? { x: 5, y: 4, type: cfg.gymType } : null,
      ground: pad([
        'tutututututututututu',
        'vxvxvxvxvxvxvxvxvxvx',
        'tu...f........f...tu',
        'vxAB&BBC....7!89..vx',
        'tuabbbbc....dmmh..tu',
        'vxLMYYML....W+EW..vx',
        'tu.f........f.....tu',
        'vx....f.f......f..vx',
        'pppppppppppppppppppp',
        'vx...f......f.f...vx',
        'tu......f.........tu',
        'vxq@rz......1223..vx',
        'tuijjk......4556..tu',
        'vxW$EW......WNDW..vx',
        'tu.f........f.....tu',
        'vx....f..f.....f..vx',
        'tutututututututututu',
        'vxvxvxvxvxvxvxvxvxvx'
      ], 20, 18),
      deco: blank(20, 18),
      warps: [
        { x: 4, y: 5, to: cfg.gymId, tx: 5, ty: 11, dir: 'up' },
        { x: 5, y: 5, to: cfg.gymId, tx: 5, ty: 11, dir: 'up' },
        { x: 14, y: 5, to: cfg.healId, tx: 4, ty: 7, dir: 'up' },
        { x: 4, y: 13, to: cfg.shopId, tx: 4, ty: 7, dir: 'up' },
        { x: 0, y: 8, to: cfg.west.to, tx: cfg.west.tx, ty: cfg.west.ty, dir: 'left' },
        { x: 19, y: 8, to: cfg.east.to, tx: cfg.east.tx, ty: cfg.east.ty, dir: 'right' }
      ],
      signs: [
        { x: 5, y: 6, text: cfg.name + ' GYM — ' + cfg.gymSign },
        { x: 14, y: 13, text: "It's locked. A resident waves from the window." }
      ].concat(cfg.extraSigns || []),
      npcs: cfg.npcs || [],
      scripts: []
    };
  }

  // standard 24x12 horizontal route. cfg: { name, bg, weather, west, east,
  // encounters, trainers:[], items:[], signs:[] }
  function route(id, cfg) {
    G.MAPS[id] = {
      id: id, name: cfg.name, w: 24, h: 12,
      music: cfg.music || 'route', battleBg: cfg.bg || 'meadow', base: 'grass', legend: G.LEG_EXT,
      weather: cfg.weather,
      ground: pad([
        'tutututututututututututu',
        'vxvxvxvxvxvxvxvxvxvxvxvx',
        'tu..gggg..............tu',
        'vx..gggg.....f........vx',
        'tu..................f.tu',
        'ppppppppp...pppppppppppp',
        'ppppp...pppppppppppppppp',
        'vx........lllll.......vx',
        'tu...........gggg.....tu',
        'vx...f.......gggg.....vx',
        'tutututututututututututu',
        'vxvxvxvxvxvxvxvxvxvxvxvx'
      ], 24, 12),
      deco: blank(24, 12),
      warps: [
        { x: 0, y: 5, to: cfg.west.to, tx: cfg.west.tx, ty: cfg.west.ty, dir: 'left' },
        { x: 0, y: 6, to: cfg.west.to, tx: cfg.west.tx, ty: cfg.west.ty, dir: 'left' },
        { x: 23, y: 5, to: cfg.east.to, tx: cfg.east.tx, ty: cfg.east.ty, dir: 'right' },
        { x: 23, y: 6, to: cfg.east.to, tx: cfg.east.tx, ty: cfg.east.ty, dir: 'right' }
      ],
      signs: cfg.signs || [],
      npcs: [],
      trainers: cfg.trainers || [],
      items: cfg.items || [],
      encounters: cfg.encounters
    };
  }

  function tr(id, x, y, sprite, dir, after) { return { id: id, trainer: id, x: x, y: y, sprite: sprite, dir: dir, sight: 4, after: after }; }

  // A true sea crossing: sand docks at each edge, open water between. You swim or
  // board the docked boat to cross; water-types turn up mid-channel.
  function seaRoute(id, cfg) {
    G.MAPS[id] = {
      id: id, name: cfg.name, w: 24, h: 12,
      music: 'route', battleBg: 'water', base: 'water', legend: G.LEG_EXT, weather: cfg.weather,
      ground: pad([
        '~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~',
        '%%%~~~~~~~~~~~~~~~~~~%%%',
        '%%%~~~~~~~~~~~~~~~~~~%%%',
        '%%%~~~~~~~~~~~~~~~~~~%%%',
        '%%%~~~~~~~~~~~~~~~~~~%%%',
        '%%%~~~~~~~~~~~~~~~~~~%%%',
        '%%%~~~~~~~~~~~~~~~~~~%%%',
        '%%%~~~~~~~~~~~~~~~~~~%%%',
        '~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~'
      ], 24, 12),
      deco: blank(24, 12),
      warps: [
        { x: 0, y: 5, to: cfg.west.to, tx: cfg.west.tx, ty: cfg.west.ty, dir: 'left' },
        { x: 0, y: 6, to: cfg.west.to, tx: cfg.west.tx, ty: cfg.west.ty, dir: 'left' },
        { x: 23, y: 5, to: cfg.east.to, tx: cfg.east.tx, ty: cfg.east.ty, dir: 'right' },
        { x: 23, y: 6, to: cfg.east.to, tx: cfg.east.tx, ty: cfg.east.ty, dir: 'right' }
      ],
      signs: [{ x: 1, y: 4, text: cfg.name + ' — open sea. Swim across, or board the boat.' }],
      npcs: [
        { x: 2, y: 4, sprite: 'fx_boat', obj: true, event: 'boardBoat' },
        { x: 21, y: 7, sprite: 'fx_boat', obj: true, event: 'boardBoat' }
      ],
      items: cfg.items || [],
      encounters: cfg.encounters
    };
  }

  // ===== Route 5: Lavaridge -> Petalburg =================================
  route('route5', {
    name: 'Route 117', music: 'route2', bg: 'meadow',
    west: { to: 'aurelune', tx: 21, ty: 8 },
    east: { to: 'petalburg', tx: 1, ty: 8 },
    trainers: [tr('r5_a', 7, 3, 'boy', 'down', 'The towns ahead don\'t go easy on you.'), tr('r5_b', 16, 8, 'mom', 'left', 'Keep your team evolving!')],
    items: [{ x: 20, y: 2, item: 'hyperpotion', qty: 1, flag: 'itm_r5_hp' }],
    encounters: { rate: 0.12, table: [
      { sp: 'linoone', min: 30, max: 33 }, { sp: 'manectric', min: 30, max: 33 },
      { sp: 'breloom', min: 31, max: 34 }, { sp: 'kadabra', min: 30, max: 33 },
      { sp: 'graveler', min: 31, max: 34 }, { sp: 'swellow', min: 30, max: 33 },
      { sp: 'zangoose', min: 30, max: 33 }, { sp: 'seviper', min: 30, max: 33 },
      { sp: 'kecleon', min: 30, max: 33 }, { sp: 'vigoroth', min: 31, max: 34 },
      { sp: 'gloom', min: 30, max: 33 }, { sp: 'roselia', min: 30, max: 33 },
      { sp: 'girafarig', min: 31, max: 34 }, { sp: 'pinsir', min: 30, max: 33, w: 14 }
    ] }
  });

  town('petalburg', {
    name: 'Petalburg City', bg: 'meadow', gymId: 'gym5', healId: 'heal_petalburg', shopId: 'shop_petalburg', gymType: 'normal',
    gymSign: "Leader Norman. 'Raw, balanced strength.'",
    west: { to: 'route5', tx: 22, ty: 5 }, east: { to: 'route6', tx: 1, ty: 5 },
    npcs: [{ x: 9, y: 9, sprite: 'boy', dir: 'down', dialog: ['Norman trains pure Normal-types — nothing fancy, just power.', 'Fighting moves are the classic answer.'] }]
  });

  // ===== Route 6: Petalburg -> Fortree ==================================
  route('route6', {
    name: 'Route 119', music: 'route2', bg: 'forest', weather: 'rain',
    west: { to: 'petalburg', tx: 18, ty: 8 },
    east: { to: 'fortree', tx: 1, ty: 8 },
    trainers: [tr('r6_a', 8, 2, 'prof', 'down', 'Rain keeps the Water-types happy.'), tr('r6_b', 17, 7, 'boy', 'left', 'Fortree is up in the trees!')],
    items: [{ x: 4, y: 9, item: 'greatorb', qty: 2, flag: 'itm_r6_orbs' }],
    encounters: { rate: 0.12, table: [
      { sp: 'tropius', min: 34, max: 37 }, { sp: 'doduo', min: 34, max: 37 },
      { sp: 'altaria', min: 35, max: 38 }, { sp: 'pelipper', min: 34, max: 37 },
      { sp: 'masquerain', min: 34, max: 37 }, { sp: 'vibrava', min: 35, max: 38 },
      { sp: 'swablu', min: 34, max: 37 }, { sp: 'swellow', min: 34, max: 37 },
      { sp: 'xatu', min: 35, max: 38 }, { sp: 'kecleon', min: 34, max: 37 },
      { sp: 'gloom', min: 34, max: 37 }, { sp: 'dodrio', min: 35, max: 38 },
      { sp: 'natu', min: 34, max: 37 }, { sp: 'skarmory', min: 35, max: 38, w: 14 }
    ] }
  });

  town('fortree', {
    name: 'Fortree City', bg: 'forest', gymId: 'gym6', healId: 'heal_fortree', shopId: 'shop_fortree', gymType: 'flying',
    gymSign: "Leader Winona. 'Grace on the wind.'",
    west: { to: 'route6', tx: 22, ty: 5 }, east: { to: 'route7', tx: 1, ty: 5 },
    npcs: [{ x: 10, y: 10, sprite: 'mom', dir: 'down', dialog: ['Winona flies high — Electric, Ice and Rock moves clip her wings.'] }]
  });

  // ===== Route 121: Fortree -> Mossdeep (SEA crossing) ==================
  seaRoute('route7', {
    name: 'Route 121',
    west: { to: 'fortree', tx: 18, ty: 8 },
    east: { to: 'mossdeep', tx: 1, ty: 8 },
    encounters: { rate: 0.12, table: [
      { sp: 'tentacruel', min: 38, max: 41 }, { sp: 'wingull', min: 38, max: 41 }, { sp: 'pelipper', min: 39, max: 42 },
      { sp: 'sharpedo', min: 38, max: 41 }, { sp: 'carvanha', min: 38, max: 41 },
      { sp: 'wailmer', min: 38, max: 41 }, { sp: 'magikarp', min: 38, max: 41 },
      { sp: 'gyarados', min: 39, max: 42 }, { sp: 'horsea', min: 38, max: 41 },
      { sp: 'seadra', min: 39, max: 42 }, { sp: 'chinchou', min: 38, max: 41 },
      { sp: 'lanturn', min: 39, max: 42 }, { sp: 'clamperl', min: 39, max: 42 },
      { sp: 'luvdisc', min: 38, max: 41 }, { sp: 'corsola', min: 38, max: 41 },
      { sp: 'wailord', min: 40, max: 42, w: 6 }
    ] }
  });

  town('mossdeep', {
    name: 'Mossdeep City', music: 'seaside', bg: 'water', gymId: 'gym7', healId: 'heal_mossdeep', shopId: 'shop_mossdeep', gymType: 'psychic',
    gymSign: "Leaders Tate & Liza. 'Two minds, one will.'",
    west: { to: 'route7', tx: 22, ty: 5 }, east: { to: 'route8', tx: 1, ty: 5 },
    npcs: [
      { x: 9, y: 9, sprite: 'prof', dir: 'down', dialog: ['Tate and Liza share one mind. Dark and Ghost moves rattle Psychics.'] },
      { id: 'aqua_grunt4', trainer: 'aqua_grunt4', x: 11, y: 11, sprite: 'aqua', dir: 'left', sight: 4, after: 'The boss sailed for Sootopolis. You will never beat him there.' }
    ]
  });

  // ===== Route 124: Mossdeep -> Sootopolis (SEA crossing) ===============
  seaRoute('route8', {
    name: 'Route 124', weather: 'rain',
    west: { to: 'mossdeep', tx: 18, ty: 8 },
    east: { to: 'sootopolis', tx: 1, ty: 8 },
    encounters: { rate: 0.12, table: [
      { sp: 'sharpedo', min: 42, max: 45 }, { sp: 'wailmer', min: 43, max: 46 }, { sp: 'gyarados', min: 43, max: 46 },
      { sp: 'tentacruel', min: 42, max: 45 }, { sp: 'pelipper', min: 42, max: 45 },
      { sp: 'seadra', min: 42, max: 45 }, { sp: 'lanturn', min: 42, max: 45 },
      { sp: 'huntail', min: 43, max: 46, w: 8 }, { sp: 'barboach', min: 42, max: 45 },
      { sp: 'whiscash', min: 43, max: 46 }, { sp: 'wailord', min: 44, max: 46 },
      { sp: 'spheal', min: 42, max: 45 }, { sp: 'sealeo', min: 43, max: 46 },
      { sp: 'relicanth', min: 43, max: 46, w: 8 }, { sp: 'clamperl', min: 42, max: 45, w: 8 },
      { sp: 'kingdra', min: 44, max: 46, w: 6 }
    ] }
  });

  town('sootopolis', {
    name: 'Sootopolis City', music: 'seaside', bg: 'water', gymId: 'gym8', healId: 'heal_sootopolis', shopId: 'shop_sootopolis', gymType: 'water',
    gymSign: "Leader Wallace. 'The art of water.'",
    west: { to: 'route8', tx: 22, ty: 5 }, east: { to: 'summitpath', tx: 1, ty: 27 },
    npcs: [
      { x: 10, y: 10, sprite: 'prof', dir: 'down', dialog: ['Beyond Wallace lies Victory Road, then the League itself.', 'Grass and Electric moves wash out his Water-types.'] },
      // Team Aqua's final stand — they've seized the crater to wake Kyogre (endgame)
      { id: 'aqua_grunt5', trainer: 'aqua_grunt5', x: 6, y: 10, sprite: 'aqua', dir: 'down', sight: 4, ifFlag: 'badge8', after: 'You beat me, but the boss is already at the water...' },
      { id: 'aqua_admin', trainer: 'aqua_admin', x: 8, y: 12, sprite: 'aqua', dir: 'up', sight: 4, ifFlag: 'badge8', after: 'Reef, defeated... Archie, the tide is yours alone now.' },
      { id: 'aqua_archie', trainer: 'aqua_archie', x: 10, y: 6, sprite: 'aqua', dir: 'down', sight: 4, ifFlag: 'badge8', after: 'Maybe the sea and the land were always meant to share this world.' }
      // (Kyogre & Groudon now sleep in the Titan Crossroads, opened after the League)
    ]
  });
})();
