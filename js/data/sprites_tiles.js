// Pokéram — sprites_tiles.js
// 16x16 map tiles, authored as palette-indexed grids (see palettes.js for the
// style contract). Also defines G.TILES — the gameplay property table that
// maps tile names to art + behavior (solid / encounter grass / ledge / etc).

(function () {
  var C = G.C;

  function T(name, pal, rows) { G.ART[name] = { w: 16, h: 16, pal: pal, px: rows }; }

  // ---------------------------------------------------------------- grass --
  var GR = { a: C.leaf1, b: C.leaf2, c: C.leaf3 };

  // base grass: a calm leaf2 field stippled with small blades — a light tip (c)
  // over a shadowed base (a) — so a tiled field reads as textured turf, not a
  // flat slab, while staying quiet enough not to fight sprites/deco on top.
  T('t_grass', GR, [
    'bbbbbbbbbbbbbbbb',
    'bbcbbbbbbbcbbbbb',
    'bbabbbbbbbabbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbcbbbbbbbbb',
    'bbbbbbabbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbcbb',
    'bbbbbbbbbbbbbabb',
    'bbbbbbbbbbbbbbbb',
    'bbbbcbbbbbbbbbbb',
    'bbbbabbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbcbbbb',
    'bbbbbbbbbbbabbbb'
  ]);

  // grass variant — same blades in different spots so adjacent tiles vary.
  T('t_grass2', GR, [
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbcbbbbbbbcbb',
    'bbbbbabbbbbbbabb',
    'bbbbbbbbbbbbbbbb',
    'bcbbbbbbbbbbbbbb',
    'babbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbcbbbbbb',
    'bbbbbbbbbabbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbcbbbbbbbbbbbb',
    'bbbabbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb'
  ]);

  // tall grass (wild encounters) — lit blade clumps, not a flat dark block.
  // Light upper-left: each tuft is lit (e/c) on its left edge, shadowed (b/a) on
  // the right; tips break the top edge (transparent gaps show the grass underneath).
  T('t_tallgrass', { a: C.grn0, b: C.grn1, c: C.grn2, e: C.grn3 }, [
    '.e....e.....e...',
    '.ec..cec...cec..',
    'eec..cecb.eceb..',
    'cecb.cecb.cecbe.',
    'cecb.cecbececbce',
    'cecbbcecbbcecbce',
    'becbacecbacecbac',
    'becababcbabcbbac',
    'bbcaabbbaabbcaab',
    'bbaaabbaaabbaaab',
    'abaaababaaababaa',
    'aababaaababaabab',
    'aaabaaaaabaaaaba',
    'aaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaa',
    '.aaa..aaa..aaa..'
  ]);

  // flowers (2-frame animation on grass)
  var FL = { a: C.leaf1, b: C.leaf2, c: C.leaf3, r: C.red2, y: C.yel1 };
  T('t_flower1', FL, [
    'bbbbbbbbbbbbbbbb',
    'bbbabbbbbbbbbbbb',
    'bbbbbbbbbbcbbbbb',
    'bbbrbbbbbbbbbbab',
    'bbryrbbbbbbbbbbb',
    'bbbrbbbbbbbbbbbb',
    'babbbbbbbbbbcbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbrbbbb',
    'bbcbbbbbbbryrbbb',
    'bbbbbbbbbbbrbbbb',
    'bbbbabbbbbbbbbab',
    'bbbbbbbbbbbbbbbb',
    'babbbbcbbbbbbbbb',
    'bbbbbbbbbbabbbbb',
    'bbbbbbbbbbbbbbbb'
  ]);
  T('t_flower2', FL, [
    'bbbbbbbbbbbbbbbb',
    'bbbabbbbbbbbbbbb',
    'bbbbbbbbbbcbbbbb',
    'bbrbrbbbbbbbbbab',
    'bbbybbbbbbbbbbbb',
    'bbrbrbbbbbbbbbbb',
    'babbbbbbbbbbcbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbrbrbbb',
    'bbcbbbbbbbbybbbb',
    'bbbbbbbbbbrbrbbb',
    'bbbbabbbbbbbbbab',
    'bbbbbbbbbbbbbbbb',
    'babbbbcbbbbbbbbb',
    'bbbbbbbbbbabbbbb',
    'bbbbbbbbbbbbbbbb'
  ]);

  // overlay decorations (transparent bg; scattered onto grass by decorateMap)
  T('t_deco_flowerY', { y: C.yel1, w: C.white }, [
    '................',
    '................',
    '.....y..........',
    '....ywy.........',
    '.....y......y...',
    '...........ywy..',
    '............y...',
    '................',
    '................',
    '..y.............',
    '.ywy........y...',
    '..y........ywy..',
    '............y...',
    '................',
    '.......y........',
    '......ywy.......'
  ]);
  T('t_deco_pebble', { d: C.dgry, l: C.lgry }, [
    '................',
    '................',
    '................',
    '.........dd.....',
    '........dlld....',
    '.........dd.....',
    '................',
    '...dd...........',
    '..dlld..........',
    '...dd...........',
    '................',
    '............dd..',
    '...........dlld.',
    '............dd..',
    '................',
    '................'
  ]);
  T('t_deco_bush', { a: C.leaf1, b: C.leaf2, c: C.leaf3 }, [
    '................',
    '................',
    '................',
    '................',
    '......ccc.......',
    '.....cbbbc......',
    '....cbbabbc.....',
    '....cbaabbc.....',
    '.....cbbbc......',
    '......ccc.......',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................'
  ]);

  // island + volcano overlay decorations (transparent bg)
  T('t_deco_palm', { b: C.leaf2, c: C.leaf3, t: C.brn2 }, [
    '................',
    '................',
    '.....bbb........',
    '...bbcbcbb......',
    '..bc..t..cb.....',
    '......t.........',
    '......t.........',
    '......t.........',
    '......t.........',
    '......t.........',
    '.....ttt........',
    '................',
    '................',
    '................',
    '................',
    '................'
  ]);
  T('t_deco_shell', { o: C.org2, p: C.white }, [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '......oo........',
    '.....opppo......',
    '.....opppo......',
    '......oo........',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................'
  ]);
  T('t_deco_cinder', { r: C.red2, y: C.yel1, o: C.org2 }, [
    '................',
    '................',
    '....y...........',
    '...yoy.....y....',
    '....y.....yoy...',
    '..........y.....',
    '................',
    '................',
    '................',
    '......y.........',
    '.....yoy........',
    '......y.........',
    '................',
    '...........y....',
    '..........yoy...',
    '...........y....'
  ]);
  // molten lava — a solid, impassable floor for the Magma Chamber (the path is
  // the raised cave floor; everything lower is this).
  T('t_lava', { o: C.org0, b: C.red1, r: C.org1, R: C.org2, y: C.yel1 }, [
    'RRRoooRRRRRRbbRR',
    'RRoRRRoRRRRoRRbR',
    'RoRyyRRoRRoRyyRo',
    'RoRyRRRRbRRRyRRo',
    'RRoRRRRoRRoRRRRo',
    'RRRooooRRRRoooRR',
    'bRRRRRRRRyRRRRRb',
    'RRRyyRRRRRRRRyRR',
    'RoooRRRoooRRRRoR',
    'oRRRoRoRRRoRRroR',
    'oRyRRoRyyRoRyRRo',
    'RRRRRoRRRRoRRRRo',
    'RRoooRRRRRRooobR',
    'bRRRRyRRRyRRRRRR',
    'RRRRRRoooRRRRyRR',
    'RRyRRRRRRRRoRRRR'
  ]);

  // ===== Marine Cavern (Kyogre lair) tiles ==============================
  // seabed: pale blue-grey sand floor with cyan ripples (walkable lane)
  T('t_seabed', { s: C.stn2, d: C.stn1, l: C.stn3, w: C.ice1 }, [
    'ssssssssssssssss',
    'ssssssssswssssss',
    'ssdsssssssssssss',
    'ssssssssssssssss',
    'sssswssssssssdss',
    'ssssssssssssssss',
    'sssssssssslsssss',
    'swssssssssssssss',
    'ssssssssssssssss',
    'sssssssssswsssss',
    'sssdssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssslss',
    'sssssswsssssssss',
    'ssssssssdsssssss',
    'ssssssssssssssss'
  ]);
  // kelp: swaying seaweed fronds — the encounter zones (2 frames)
  T('t_kelp1', { s: C.stn2, d: C.stn1, g: C.grn1, G: C.grn2, h: C.grn3, t: C.ice2 }, [
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssdsssssssssssss',
    'shtsssshthtsdsss',
    'shgsssshghgsssss',
    'sghssssghghsssss',
    'ssGsssssGsGsssss',
    'sssGsssssGsGssss',
    'sssGgssssGgGgsss',
    'ssssGsssGsssGsss',
    'sssgGssgGssgGsss',
    'ssssGsssGsssGsss',
    'ssssGgssGgssGgss',
    'ssssGssdGsssGsss',
    'sssGsssGsssGssss',
    'ssgGssgGssgGssss'
  ]);
  T('t_kelp2', { s: C.stn2, d: C.stn1, g: C.grn1, G: C.grn2, h: C.grn3, t: C.ice2 }, [
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssdsssssssssssss',
    'ssshthtsssshtsss',
    'ssshghgsssshgsss',
    'sssghghssssghsss',
    'ssssGsGsssssGsss',
    'sssssGsGsssssGss',
    'sssssGgGgssssGgs',
    'ssssGsssGsssGsss',
    'sssgGssgGssgGsss',
    'ssssGsssGsssGsss',
    'ssssGgssGgssGgss',
    'ssssGssdGsssGsss',
    'sssGsssGsssGssss',
    'ssgGssgGssgGssss'
  ]);
  // coral: solid fan coral on a deep-water field (blends with deepwater walls)
  T('t_coral', { B: C.blu0, o: C.ink, r: C.red2, R: C.red3, y: C.org2, w: C.ice2 }, [
    'BBBBBBBBBBBBBBBB',
    'BBBBBBByyBBBBBBB',
    'BBBBByyRRyyBBBBB',
    'BBBBoRRrrRRoBBBB',
    'BBBoRrrwrrrRoBBB',
    'BBoRrrrrrrrRRoBB',
    'BBoRrwrrrwrrRoBB',
    'BBoRRrrrrrrRRoBB',
    'BBBoRrrrrrrRoBBB',
    'BBBBoRRrrRRoBBBB',
    'BBBBBoRrrRoBBBBB',
    'BBBBBBoRRoBBBBBB',
    'BBBBBBBrrBBBBBBB',
    'BBBBBBBrrBBBBBBB',
    'BBBBBBorroBBBBBB',
    'BBBBBBooooBBBBBB'
  ]);
  // bubbles: rising air bubbles over seabed (walkable accent, 3 frames)
  T('t_bubbles1', { s: C.stn2, d: C.stn1, o: C.ice1, w: C.ice3 }, [
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssds',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'sdssssssssssssss',
    'ssssssssssswosss',
    'sssssssssssoosss',
    'sssswossssssssss',
    'ssssoossswosssss',
    'sssssssssoosssss',
    'ssssssssssssssss'
  ]);
  T('t_bubbles2', { s: C.stn2, d: C.stn1, o: C.ice1, w: C.ice3 }, [
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssds',
    'ssssssssssswosss',
    'sssssssssssoosss',
    'sssswossssssssss',
    'sdssoossswosssss',
    'sssssssssoosssss',
    'sssssswossssssss',
    'ssssssoossssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss'
  ]);
  T('t_bubbles3', { s: C.stn2, d: C.stn1, o: C.ice1, w: C.ice3 }, [
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssswosss',
    'sssssssssssoosss',
    'sssswossssssssss',
    'ssssoossswosssds',
    'sssssssssoosssss',
    'sssssswossssssss',
    'ssssssoossssssss',
    'sdssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'ssssssssssssssss'
  ]);

  // ===== Magma Chamber (Groudon lair) tiles =============================
  // basalt: dark volcanic causeway floor (walkable lane)
  T('t_basalt', { s: C.stn1, t: C.stn2, k: C.stn0, o: C.org1 }, [
    'ssssstssssssssss',
    'ssssssssssstssss',
    'sstsssssssssssss',
    'ssskkssstsssssts',
    'sssssssssoksssss',
    'sssstsssssssssss',
    'sssssssssstsssss',
    'sssssskossssssss',
    'stssssssssssssss',
    'ssssssstssssksss',
    'ssssssssssssstss',
    'sskossssssssssss',
    'ssstssssssssssss',
    'sssssssskkssssss',
    'sssssstsssssskss',
    'sssssssssssstsss'
  ]);
  // emberfloor: cracked ground with glowing magma veins — encounter zones (2 frames)
  T('t_emberfloor1', { d: C.stn0, k: C.ink, o: C.org1, r: C.org2, y: C.yel1 }, [
    'dddddddddddddddd',
    'dddddddddddddddd',
    'dddddddddddddddd',
    'droddddddddddddd',
    'dkkooddddddddddd',
    'dddkkooddooddddd',
    'ddddokkyokkooddd',
    'ddddkddkkdokkrdd',
    'ddddrdddddkddkdd',
    'dddokdddddrddddd',
    'dddkorddddkddddd',
    'ddddkkoodddddddd',
    'ddddddkkrodddddd',
    'ddddddddkkordddd',
    'ddddddddddkkdddd',
    'dddddddddddddddd'
  ]);
  T('t_emberfloor2', { d: C.stn0, k: C.ink, o: C.org1, r: C.org2, y: C.yel1 }, [
    'dddddddddddddddd',
    'dddddddddddddddd',
    'dddddddddddddddd',
    'dyrddddddddddddd',
    'dkkrrddddddddddd',
    'dddkkrrddrrddddd',
    'ddddrkkyrkkrrddd',
    'ddddkddkkdrkkydd',
    'ddddydddddkddkdd',
    'dddrkdddddyddddd',
    'dddkryddddkddddd',
    'ddddkkrrdddddddd',
    'ddddddkkyrdddddd',
    'ddddddddkkrydddd',
    'ddddddddddkkdddd',
    'dddddddddddddddd'
  ]);
  // obsidian: black glassy faceted pillar with a molten reflection (solid accent)
  T('t_obsidian', { d: C.stn0, o: C.ink, p: C.pur1, h: C.pur3, q: C.pur2, r: C.org1 }, [
    'ddoooooooooooooo',
    'dopppppppphpppoo',
    'doppphpppphpppoo',
    'doppphpppphpppoo',
    'doppphpppphpppoo',
    'dopqqqqqqqqqqpoo',
    'doppphpppphpppoo',
    'doppphpppphpppoo',
    'doppphprpphpppoo',
    'doppphpprphpppoo',
    'doppphpppphpppoo',
    'doppphrppphpppoo',
    'doppphpppphpppoo',
    'doppphppppppppoo',
    'doppppppppppppoo',
    'dooooooooooooooo'
  ]);

  // small boat drawn under the player while sailing (see overworld _drawActor)
  T('fx_boat', { w: C.brn2, d: C.brn3, l: C.tan0 }, [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '...wwwwwwwwww...',
    '..wllllllllllw..',
    '..wllllllllllw..',
    '...dwwwwwwwwd...',
    '....dddddddd....'
  ]);

  // ----------------------------------------------------------------- path --
  var PA = { d: C.tan0, e: C.brn3, f: C.tan1 };
  T('t_path', PA, [
    'dddddddddddddddd',
    'ddddedddddddfddd',
    'ddfddddddedddddd',
    'dddddddddddddddd',
    'dedddddfdddddddd',
    'ddddddddddddeddd',
    'dddddedddddddddf',
    'fddddddddddddddd',
    'dddddddddedddddd',
    'ddedddfddddddddd',
    'dddddddddddddedd',
    'dfdddddddddddddd',
    'ddddddeddddfdddd',
    'dddddddddddddddd',
    'dedddddddedddddf',
    'dddddddddddddddd'
  ]);

  // path edges: side that meets grass gets a grass band + dark rim
  var PE = { d: C.tan0, e: C.brn3, f: C.tan1, b: C.leaf2, g: C.brn2 };
  T('t_path_n', PE, [
    'bbbbbbbbbbbbbbbb',
    'gggggggggggggggg',
    'ffddddddfddddddf',
    'dddddddddddddddd',
    'dedddddfdddddddd',
    'ddddddddddddeddd',
    'dddddedddddddddf',
    'fddddddddddddddd',
    'dddddddddedddddd',
    'ddedddfddddddddd',
    'dddddddddddddedd',
    'dfdddddddddddddd',
    'ddddddeddddfdddd',
    'dddddddddddddddd',
    'dedddddddedddddf',
    'dddddddddddddddd'
  ]);
  T('t_path_s', PE, [
    'dddddddddddddddd',
    'ddddedddddddfddd',
    'ddfddddddedddddd',
    'dddddddddddddddd',
    'dedddddfdddddddd',
    'ddddddddddddeddd',
    'dddddedddddddddf',
    'fddddddddddddddd',
    'dddddddddedddddd',
    'ddedddfddddddddd',
    'dddddddddddddedd',
    'dfdddddddddddddd',
    'ddddddeddddfdddd',
    'dddddddddddddddd',
    'gggggggggggggggg',
    'bbbbbbbbbbbbbbbb'
  ]);
  T('t_path_w', PE, [
    'bgdddddddddddddd',
    'bgddedddddddfddd',
    'bgfddddddddddddd',
    'bgdddddddddddddd',
    'bgdddddfdddddddd',
    'bgddddddddddeddd',
    'bgdddedddddddddf',
    'bgdddddddddddddd',
    'bgddddddddeddddd',
    'bgedddfddddddddd',
    'bgdddddddddddedd',
    'bgfddddddddddddd',
    'bgddddeddddfdddd',
    'bgdddddddddddddd',
    'bgddddddddeddddf',
    'bgdddddddddddddd'
  ]);
  T('t_path_e', PE, [
    'ddddddddddddddgb',
    'ddddeddddddddfgb',
    'ddfddddddeddddgb',
    'ddddddddddddddgb',
    'dedddddfddddddgb',
    'dddddddddddeddgb',
    'dddddeddddddddgb',
    'fdddddddddddddgb',
    'dddddddddeddddgb',
    'ddedddfdddddddgb',
    'dddddddddddddegb',
    'dfddddddddddddgb',
    'ddddddedddfdddgb',
    'ddddddddddddddgb',
    'dedddddddeddddgb',
    'ddddddddddddddgb'
  ]);

  // ----------------------------------------------------------------- tree --
  // One big 32x32 tree split into 4 tiles. Tops go on the overhead layer
  // (player walks behind them), bottoms are solid deco. Transparent bg.
  // flatter, dustier GBA canopy: 2 muted greens (dark edge/dither + main fill)
  // instead of a smooth 4-green gradient. 'b' specks read as dither shading.
  var TR = { o: C.ink, a: C.grn1, b: C.grn0, c: C.grn2, d: C.grn3, t: C.brn1, u: C.brn2 };

  T('t_tree_tl', TR, [
    '................',
    '................',
    '................',
    '................',
    '...........ooooo',
    '..........oddddd',
    '........oodddddc',
    '.......odddccccc',
    '......odddcccccc',
    '.....odddccccccc',
    '....oddcccccbbcc',
    '....odccccccbbcc',
    '...odccccccccccc',
    '...odccccbbccccc',
    '..occcccbbcccccc',
    '..occccccccccccc'
  ]);
  T('t_tree_tr', TR, [
    '................',
    '................',
    '................',
    '................',
    'ooooo...........',
    'ccccbo..........',
    'cccccboo........',
    'ccccccbbo.......',
    'cccccccbbo......',
    'ccccccccbbo.....',
    'ccbbccccccbo....',
    'ccbbcccccccbo...',
    'ccccccccccccbo..',
    'cbbcccccccccbo..',
    'ccccbbccccccbo..',
    'ccccccccccccco..'
  ]);
  T('t_tree_bl', TR, [
    '..occccbbccccccc',
    '..occccbbccccccb',
    '...obccccccccccb',
    '...obcccccbbcccb',
    '....obccccbbcccb',
    '.....obcccccbbbb',
    '......obbccccbbb',
    '.......obbcccbbb',
    '........oobbbbbb',
    '..........oobbbb',
    '............oooo',
    '.............ouu',
    '.............ouu',
    '.............out',
    '.............ouu',
    '............oouu'
  ]);
  T('t_tree_br', TR, [
    'bbccccccbbbbbo..',
    'bccccbbbbbabbo..',
    'ccccbbbbbbbbo...',
    'cbbccccbbbabo...',
    'cccbbcccbbbo....',
    'bbbcccbbbbo.....',
    'bbbbccbbbo......',
    'abbbbbbao.......',
    'bbbbbboo........',
    'bbbboo..........',
    'oooo............',
    'tto.............',
    'tto.............',
    'tuo.............',
    'tto.............',
    'ttoo............'
  ]);

  // ---------------------------------------------------------------- ledge --
  // ledge: turf above, a clearly 3D drop you hop down (a sun-lit top lip, a
  // tan→brown vertical face), then a cast shadow on the grass you land on.
  T('t_ledge', { a: C.leaf1, b: C.leaf2, c: C.leaf3, g: C.brn2, h: C.brn1, d: C.tan0 }, [
    'bbbbbbbbbbbbbbbb',
    'bbbabbbbbbcbbbbb',
    'bbbbbbcbbbbbbbbb',
    'abbbbbbbbbbbbabb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbcbbbbab',
    'bbcbbbbbbbbbbbbb',
    'cccccccccccccccc',
    'dddddddddddddddd',
    'ddgddddgdddddgdd',
    'gggggggggggggggg',
    'hhhhhhhhhhhhhhhh',
    'aaaaaaaaaaaaaaaa',
    'babbbbbbbcbbbbbb',
    'bbbbabbbbbbbabbb',
    'bbbbbbbbbbbbbbbb'
  ]);

  // ---------------------------------------------------------------- fence --
  T('t_fence', { o: C.ink, r: C.brn3, s: C.brn2, t: C.brn1 }, [
    '................',
    '................',
    '................',
    '..ooo.......ooo.',
    '..oro.......oro.',
    '..oro.......oro.',
    'oooooooooooooooo',
    'rrrrrrrrrrrrrrrr',
    'ssssssssssssssss',
    'oooooooooooooooo',
    '..oto.......oto.',
    '..oto.......oto.',
    '..ooo.......ooo.',
    '................',
    '................',
    '................'
  ]);

  // ----------------------------------------------------------------- sign --
  T('t_sign', { o: C.ink, r: C.brn3, s: C.brn2, t: C.brn1, f: C.tan1 }, [
    '................',
    '..oooooooooooo..',
    '.orffffffffffro.',
    '.orfrrrrrrrrfro.',
    '.orffffffffffro.',
    '.orfrrrrrffffro.',
    '.orffffffffffro.',
    '.orfrrrrrrrffro.',
    '.orffffffffffro.',
    '..oooooooooooo..',
    '......otto......',
    '......otto......',
    '......otto......',
    '......osto......',
    '....oosssoo.....',
    '................'
  ]);

  // ---------------------------------------------------------------- house --
  // red-roof cottage; the lab reuses these grids with a blue/stone palette
  // shingled roof: lit ridge (q) at the top, staggered shingle seams (r), course
  // shadow lines, and a dark overhanging eave (s) on the bottom row so the building
  // front reads as sticking out instead of a flat slab.
  var RF = { o: C.ink, q: C.red3, R: C.red2, r: C.red1, s: C.red0 };
  T('t_roof_tl', RF, [
    '....oooooooooooo',
    '..ooqqqqqqqqqqqq',
    '.oqRRRRRRRRRRRRR',
    'oqRRRRRRRRRRRRRR',
    'oqRRrRRRRrRRRRrR',
    'oqrrrrrrrrrrrrrr',
    'oqRRRRRRRRRRRRRR',
    'oqRRRRrRRRRrRRRR',
    'oqrrrrrrrrrrrrrr',
    'oqRRRRRRRRRRRRRR',
    'oqRRrRRRRrRRRRrR',
    'oqrrrrrrrrrrrrrr',
    'oqRRRRRRRRRRRRRR',
    'oqRRRRrRRRRrRRRR',
    'oqrrrrrrrrrrrrrr',
    'oqRRRRRRRRRRRRRR'
  ]);
  T('t_roof_tm', RF, [
    'oooooooooooooooo',
    'qqqqqqqqqqqqqqqq',
    'RRRRRRRRRRRRRRRR',
    'RRrRRRRrRRRRrRRR',
    'rrrrrrrrrrrrrrrr',
    'RRRRRRRRRRRRRRRR',
    'RRRRrRRRRrRRRRrR',
    'rrrrrrrrrrrrrrrr',
    'RRRRRRRRRRRRRRRR',
    'RRrRRRRrRRRRrRRR',
    'rrrrrrrrrrrrrrrr',
    'RRRRRRRRRRRRRRRR',
    'RRRRrRRRRrRRRRrR',
    'rrrrrrrrrrrrrrrr',
    'RRRRRRRRRRRRRRRR',
    'RRrRRRRrRRRRrRRR'
  ]);
  T('t_roof_tr', RF, [
    'oooooooooooo....',
    'qqqqqqqqqqqqoo..',
    'RRRRRRRRRRRRRqo.',
    'RRRRRRRRRRRRRRqo',
    'RrRRRRrRRRRrRRqo',
    'rrrrrrrrrrrrrrqo',
    'RRRRRRRRRRRRRRqo',
    'RRRRrRRRRrRRRRqo',
    'rrrrrrrrrrrrrrqo',
    'RRRRRRRRRRRRRRqo',
    'RRrRRRRrRRRRrRqo',
    'rrrrrrrrrrrrrrqo',
    'RRRRRRRRRRRRRRqo',
    'RRRRrRRRRrRRRRqo',
    'rrrrrrrrrrrrrrqo',
    'RRRRRRRRRRRRRRqo'
  ]);
  T('t_roof_bl', RF, [
    'oqRRRRRRRRRRRRRR',
    'oqrrrrrrrrrrrrrr',
    'oqRRRRRRRRRRRRRR',
    'oqRRRRrRRRRrRRRR',
    'oqrrrrrrrrrrrrrr',
    'oqRRRRRRRRRRRRRR',
    'oqRRrRRRRrRRRRrR',
    'oqrrrrrrrrrrrrrr',
    'oqRRRRRRRRRRRRRR',
    'oqRRRRrRRRRrRRRR',
    'oqrrrrrrrrrrrrrr',
    'oqRRRRRRRRRRRRRR',
    'oqrrrrrrrrrrrrrr',
    'osssssssssssssss',
    'osssssssssssssss',
    'oooooooooooooooo'
  ]);
  T('t_roof_bm', RF, [
    'RRRRRRRRRRRRRRRR',
    'rrrrrrrrrrrrrrrr',
    'RRRRRRRRRRRRRRRR',
    'RRRRrRRRRrRRRRrR',
    'rrrrrrrrrrrrrrrr',
    'RRRRRRRRRRRRRRRR',
    'RRrRRRRrRRRRrRRR',
    'rrrrrrrrrrrrrrrr',
    'RRRRRRRRRRRRRRRR',
    'RRRRrRRRRrRRRRrR',
    'rrrrrrrrrrrrrrrr',
    'RRRRRRRRRRRRRRRR',
    'rrrrrrrrrrrrrrrr',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'oooooooooooooooo'
  ]);
  T('t_roof_br', RF, [
    'RRRRRRRRRRRRRRro',
    'rrrrrrrrrrrrrrro',
    'RRRRRRRRRRRRRRro',
    'RRRRrRRRRrRRRRro',
    'rrrrrrrrrrrrrrro',
    'RRRRRRRRRRRRRRro',
    'RRrRRRRrRRRRrRro',
    'rrrrrrrrrrrrrrro',
    'RRRRRRRRRRRRRRro',
    'RRRRrRRRRrRRRRro',
    'rrrrrrrrrrrrrrro',
    'RRRRRRRRRRRRRRro',
    'rrrrrrrrrrrrrrro',
    'ssssssssssssssro',
    'ssssssssssssssso',
    'oooooooooooooooo'
  ]);

  // wall: a shadow band at the top (cast by the roof eave overhang), horizontal
  // clapboard courses, and a base shadow where it meets the ground.
  var WA = { o: C.ink, w: C.pale, l: C.lgry, g: C.gry };
  T('t_wall', WA, [
    'gggggggggggggggg',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'gggggggggggggggg',
    'oooooooooooooooo'
  ]);
  T('t_window', { o: C.ink, w: C.pale, l: C.lgry, g: C.blu2, G: C.blu3, s: C.gry }, [
    'ssssssssssssssss',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'lllloooooooollll',
    'wwwwoGGggggowwww',
    'wwwwoGgggggowwww',
    'wwwwoggggggowwww',
    'lllloggggggollll',
    'wwwwoggggggowwww',
    'wwwwoggggggowwww',
    'wwwwoooooooowwww',
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'ssssssssssssssss',
    'oooooooooooooooo'
  ]);
  // House / generic wooden door: brown panelled door with a gold knob.
  T('t_door', { o: C.ink, w: C.pale, l: C.lgry, D: C.brn2, d: C.brn1, k: C.yel1, s: C.gry }, [
    'ssssssssssssssss',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwoooooooooowww',
    'wwwoDDDDDDDDowww',
    'wwwoDddddddDowww',
    'wwwoDdDDDDdDowww',
    'wwwoDdDDDDdDowww',
    'wwwoDdDDDDdDowww',
    'wwwoDddddddDowww',
    'wwwoDDDDDDkDowww',
    'wwwoDDDDDDDDowww',
    'wwwoDDDDDDDDowww',
    'wwwoDDDDDDDDowww',
    'lllooooooooollll',
    'oooooooooooooooo'
  ]);
  // Automatic glass double-door (Center / Mart / shop entrance): twin light-
  // blue glass panels split by a central stile in a dark frame over a step.
  T('t_gdoor', { o: C.ink, w: C.pale, l: C.lgry, g: C.blu3, G: C.ice2, s: C.gry }, [
    'ssssssssssssssss',
    'wwwwwwwwwwwwwwww',
    'wwooooooooooooww',
    'wwoGgggooGgggoww',
    'wwoggggooggggoww',
    'wwoGgggooGgggoww',
    'wwoggggooggggoww',
    'wwoGgggooGgggoww',
    'wwoggggooggggoww',
    'wwoGgggooGgggoww',
    'wwoggggooggggoww',
    'wwoGgggooGgggoww',
    'wwooooooooooooww',
    'wwllllllllllllww',
    'llllllllllllllll',
    'oooooooooooooooo'
  ]);

  // gym / lab building = sturdy stone-gray roof (gold trim via lroofx), stone
  // walls — distinct from the red homes/center and the blue Mart.
  var LRF = { o: C.ink, q: C.stn3, R: C.stn2, r: C.stn1, s: C.stn0 };
  G.ART.t_lroof_tl = { base: 't_roof_tl', pal: LRF };
  G.ART.t_lroof_tm = { base: 't_roof_tm', pal: LRF };
  G.ART.t_lroof_tr = { base: 't_roof_tr', pal: LRF };
  G.ART.t_lroof_bl = { base: 't_roof_bl', pal: LRF };
  G.ART.t_lroof_bm = { base: 't_roof_bm', pal: LRF };
  G.ART.t_lroof_br = { base: 't_roof_br', pal: LRF };
  // Devon Corp roof — teal/cyan, distinct from the stone gym/lab. Devon uses pale
  // walls (W/N/D), so the building reads as a sleek corporate HQ, not a gym.
  var DRF = { o: C.ink, q: C.ice2, R: C.ice1, r: C.ice0, s: C.blu0 };
  G.ART.t_droof_tl = { base: 't_roof_tl', pal: DRF };
  G.ART.t_droof_tm = { base: 't_roof_tm', pal: DRF };
  G.ART.t_droof_tr = { base: 't_roof_tr', pal: DRF };
  G.ART.t_droof_bl = { base: 't_roof_bl', pal: DRF };
  G.ART.t_droof_bm = { base: 't_roof_bm', pal: DRF };
  G.ART.t_droof_br = { base: 't_roof_br', pal: DRF };
  G.ART.t_lwall = { base: 't_wall', pal: { o: C.ink, w: C.stn3, l: C.stn2, g: C.stn1 } };
  G.ART.t_lwindow = { base: 't_window', pal: { o: C.ink, w: C.stn3, l: C.stn2, g: C.blu2, G: C.blu3, s: C.stn1 } };
  T('t_ldoor', { o: C.ink, w: C.stn3, l: C.stn2, g: C.blu3, G: C.ice3, s: C.stn1 }, [
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'wwooooooooooooww',
    'wwosggggggggsoww',
    'wwosgGGgggggsoww',
    'wwosgGggggggsoww',
    'wwosggggggggsoww',
    'wwosggggggggsoww',
    'wwosggggggggsoww',
    'wwosgggssgggsoww',
    'wwosgggssgggsoww',
    'wwosgggssgggsoww',
    'wwosgggssgggsoww',
    'wwosgggssgggsoww',
    'wwosgggssgggsoww',
    'oooooooooooooooo'
  ]);

  // ------------------------------------------------------------- interior --
  T('t_ifloor', { f: C.tan1, d: C.tan0 }, [
    'ffffffffdfffffff',
    'ffffffffdfffffff',
    'ffffffffdfffffff',
    'dddddddddddddddd',
    'fdffffffffffffff',
    'fdffffffffffffff',
    'fdffffffffffffff',
    'dddddddddddddddd',
    'ffffffffffffdfff',
    'ffffffffffffdfff',
    'ffffffffffffdfff',
    'dddddddddddddddd',
    'ffffdfffffffffff',
    'ffffdfffffffffff',
    'ffffdfffffffffff',
    'dddddddddddddddd'
  ]);
  T('t_iwall', { o: C.ink, w: C.pale, l: C.lgry, n: C.brn2, m: C.brn1 }, [
    'oooooooooooooooo',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'llllllllllllllll',
    'oooooooooooooooo',
    'nnnnnnnnnnnnnnnn',
    'nmnnnnnmnnnnnmnn',
    'nnnnnnnnnnnnnnnn',
    'mmmmmmmmmmmmmmmm',
    'oooooooooooooooo'
  ]);
  T('t_imat', { a: C.leaf1, b: C.leaf2, c: C.leaf3 }, [
    'aaaaaaaaaaaaaaaa',
    'abbbbbbbbbbbbbba',
    'abccccccccccccba',
    'abcbbbbbbbbbbcba',
    'abcbbbbbbbbbbcba',
    'abcbbbbbbbbbbcba',
    'abcbbbbbbbbbbcba',
    'abcbbbbbbbbbbcba',
    'abcbbbbbbbbbbcba',
    'abcbbbbbbbbbbcba',
    'abcbbbbbbbbbbcba',
    'abcbbbbbbbbbbcba',
    'abcbbbbbbbbbbcba',
    'abccccccccccccba',
    'abbbbbbbbbbbbbba',
    'aaaaaaaaaaaaaaaa'
  ]);
  T('t_itable', { o: C.ink, r: C.brn3, s: C.brn2, t: C.brn1, f: C.tan1 }, [
    '................',
    '................',
    '.oooooooooooooo.',
    'offffffffffffffo',
    'offrrrrrrrrrrffo',
    'offffffffffffffo',
    'oooooooooooooooo',
    'osssssssssssssso',
    'osssssssssssssso',
    'oossssssssssssoo',
    '.otto......otto.',
    '.otto......otto.',
    '.otto......otto.',
    '.otto......otto.',
    '.oooo......oooo.',
    '................'
  ]);
  T('t_ibook', { o: C.ink, t: C.brn1, s: C.brn2, r: C.red2, g: C.grn2, b: C.blu2, y: C.yel1, w: C.pale }, [
    'oooooooooooooooo',
    'otttttttttttttto',
    'otrgbyrwbgryrbto',
    'otrgbyrwbgryrbto',
    'otrgbyrwbgryrbto',
    'otrgbyrwbgryrbto',
    'otooooooooooooto',
    'otbrygwbryggwbto',
    'otbrygwbryggwbto',
    'otbrygwbryggwbto',
    'otbrygwbryggwbto',
    'otooooooooooooto',
    'otywbgrwygbrrgto',
    'otywbgrwygbrrgto',
    'otttttttttttttto',
    'oooooooooooooooo'
  ]);
  T('t_imach', { o: C.ink, s: C.stn1, u: C.stn2, v: C.stn3, r: C.red2, g: C.grn3, b: C.blu3 }, [
    'oooooooooooooooo',
    'ouuuuuuuuuuuuuuo',
    'ouvvvvvvvvvvvvuo',
    'ouvbbbbbbbbbbvuo',
    'ouvbgbgbbbbbbvuo',
    'ouvbbbbbgbbbbvuo',
    'ouvbbbbbbbbbbvuo',
    'ouvvvvvvvvvvvvuo',
    'ouuuuuuuuuuuuuuo',
    'ousrsugsusrsusuo',
    'ouuuuuuuuuuuuuuo',
    'ousgsusrsusgsuso',
    'ouuuuuuuuuuuuuuo',
    'osssssssssssssso',
    'osssssssssssssso',
    'oooooooooooooooo'
  ]);
  T('t_ibed_t', { o: C.ink, t: C.brn1, s: C.brn2, w: C.white, l: C.lgry }, [
    '.oooooooooooooo.',
    'osssssssssssssso',
    'osttttttttttttso',
    'osssssssssssssso',
    'oooooooooooooooo',
    'owwwwwwwwwwwwwwo',
    'owwwwwwwwwwwwllo',
    'owwwwwwwwwwwwllo',
    'owllllllllllllwo',
    'oooooooooooooooo',
    'owwwwwwwwwwwwwwo',
    'owwwwwwwwwwwwwwo',
    'owwwwwwwwwwwwwwo',
    'owwwwwwwwwwwwwwo',
    'owwwwwwwwwwwwwwo',
    'owwwwwwwwwwwwwwo'
  ]);
  T('t_ibed_b', { o: C.ink, r: C.red2, q: C.red1, t: C.brn1, s: C.brn2 }, [
    'orrrrrrrrrrrrrro',
    'orrrrrrrrrrrrrro',
    'oqqqqqqqqqqqqqqo',
    'orrrrrrrrrrrrrro',
    'orrrrrrrrrrrrrro',
    'orrrrrrrrrrrrrro',
    'orrrrrrrrrrrrrro',
    'orrrrrrrrrrrrrro',
    'orrrrrrrrrrrrrro',
    'oqqqqqqqqqqqqqqo',
    'orrrrrrrrrrrrrro',
    'oooooooooooooooo',
    'osssssssssssssso',
    'osttttttttttttso',
    '.oosssssssssoo..',
    '................'
  ]);
  T('t_iplant', { o: C.ink, p: C.brn2, q: C.brn1, g: C.grn2, h: C.grn3, a: C.grn1 }, [
    '................',
    '.....ooooo......',
    '....ohghhgo.....',
    '...ohgghhghgo...',
    '...oghahgahgo...',
    '...ohgghaghgo...',
    '....ogahgago....',
    '.....oogoo......',
    '.....opqpo......',
    '....opqppqo.....',
    '....opppppo.....',
    '.....opppo......',
    '.....ooooo......',
    '................',
    '................',
    '................'
  ]);
  T('t_istool', { o: C.ink, r: C.brn3, t: C.brn1 }, [
    '................',
    '................',
    '................',
    '................',
    '....oooooooo....',
    '...orrrrrrrro...',
    '...orrrrrrrro...',
    '...oooooooooo...',
    '...ot......to...',
    '...ot......to...',
    '...ot......to...',
    '...oo......oo...',
    '................',
    '................',
    '................',
    '................'
  ]);

  // ---------------------------------------------------------------- water --
  var WT = { a: C.blu1, b: C.blu2, c: C.blu3 };
  T('t_water1', WT, [
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbccbbbbbbbbbbbb',
    'bbbbbbbbbbcccbbb',
    'bbbbbbbbbbbbbbbb',
    'babbbbbbbbbbbbbb',
    'bbbbbbbabbbbbbbb',
    'bbbbbbbbbbbbbbcb',
    'bbbbbbbbbbbbbbbb',
    'bbbccbbbbbabbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbccbb',
    'babbbbbbbbbbbbbb',
    'bbbbbbcbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbabbbbb'
  ]);
  T('t_water2', WT, [
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbccbbbbbbbbbbb',
    'bbbbbbbbbbbcccbb',
    'bbbbbbbbbbbbbbbb',
    'bbabbbbbbbbbbbbb',
    'bbbbbbbbabbbbbbb',
    'bbbbbbbbbbbbbbbc',
    'bbbbbbbbbbbbbbbb',
    'bbbbccbbbbbabbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbccb',
    'bbabbbbbbbbbbbbb',
    'bbbbbbbcbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbabbbb'
  ]);
  T('t_water3', WT, [
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbccbbbbbbbbbb',
    'bbbbbbbbbbbbcccb',
    'bbbbbbbbbbbbbbbb',
    'bbbabbbbbbbbbbbb',
    'bbbbbbbbbabbbbbb',
    'cbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbccbbbbbabbb',
    'bbbbbbbbbbbbbbbb',
    'cbbbbbbbbbbbbbcc',
    'bbbabbbbbbbbbbbb',
    'bbbbbbbbcbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbabbb'
  ]);
  G.ART.t_water4 = { base: 't_water2', pal: WT };
  // deep water — same churn, darker; SOLID and NOT swimmable (maze barriers)
  var DEEP = { a: C.blu0, b: C.blu1, c: C.blu2 };
  G.ART.t_deepwater1 = { base: 't_water1', pal: DEEP };
  G.ART.t_deepwater2 = { base: 't_water2', pal: DEEP };
  G.ART.t_deepwater3 = { base: 't_water3', pal: DEEP };
  G.ART.t_deepwater4 = { base: 't_water2', pal: DEEP };

  // shores: water with a grass bank on one side
  var SH = { a: C.blu1, b: C.blu2, c: C.blu3, g: C.leaf2, e: C.leaf1 };
  T('t_shore_n', SH, [
    'gggggggggggggggg',
    'eeeeeeeeeeeeeeee',
    'cbcbbcbbbcbbabcb'.replace('a', 'b'),
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'babbbbbbbbbbbbbb',
    'bbbbbbbabbbbbbbb',
    'bbbbbbbbbbbbbbcb',
    'bbbbbbbbbbbbbbbb',
    'bbbccbbbbbabbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbccbb',
    'babbbbbbbbbbbbbb',
    'bbbbbbcbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbabbbbb'
  ]);
  T('t_shore_s', SH, [
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbccbbbbbbbbbbbb',
    'bbbbbbbbbbcccbbb',
    'bbbbbbbbbbbbbbbb',
    'babbbbbbbbbbbbbb',
    'bbbbbbbabbbbbbbb',
    'bbbbbbbbbbbbbbcb',
    'bbbbbbbbbbbbbbbb',
    'bbbccbbbbbabbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbccbb',
    'babbbbbbbbbbbbbb',
    'bbbbbbcbbbbbbbbb',
    'eeeeeeeeeeeeeeee',
    'gggggggggggggggg'
  ]);
  T('t_shore_w', SH, [
    'gebbbbbbbbbbbbbb',
    'gebbbbbbbbbbbbbb',
    'gebbccbbbbbbbbbb',
    'gebbbbbbbbcccbbb',
    'gebbbbbbbbbbbbbb',
    'gebbbbbbbbbbbbbb',
    'gebbbbbabbbbbbbb',
    'gebbbbbbbbbbbbcb',
    'gebbbbbbbbbbbbbb',
    'gebbccbbbbabbbbb',
    'gebbbbbbbbbbbbbb',
    'gebbbbbbbbbbccbb',
    'gebbbbbbbbbbbbbb',
    'gebbbbcbbbbbbbbb',
    'gebbbbbbbbbbbbbb',
    'gebbbbbbbbabbbbb'
  ]);
  T('t_shore_e', SH, [
    'bbbbbbbbbbbbbbeg',
    'bbbbbbbbbbbbbbeg',
    'bbccbbbbbbbbbbeg',
    'bbbbbbbbbcccbbeg',
    'bbbbbbbbbbbbbbeg',
    'babbbbbbbbbbbbeg',
    'bbbbbbbabbbbbbeg',
    'bbbbbbbbbbbbbbeg',
    'bbbbbbbbbbbbbbeg',
    'bbbccbbbbbabbbeg',
    'bbbbbbbbbbbbbbeg',
    'bbbbbbbbbbccbbeg',
    'babbbbbbbbbbbbeg',
    'bbbbbbcbbbbbbbeg',
    'bbbbbbbbbbbbbbeg',
    'bbbbbbbbbbabbbeg'
  ]);

  // ----------------------------------------------------------------- sand --
  T('t_sand', { d: C.tan1, e: C.tan0, f: C.brn3 }, [
    'dddddddddddddddd',
    'ddddeddddddddddd',
    'dddddddddddeddddd'.slice(0, 16),
    'dddddddddddddddd',
    'ddfddddddddddddd',
    'dddddddddeddddddd'.slice(0, 16),
    'dddddddddddddddd',
    'dddddedddddddfdd',
    'dddddddddddddddd',
    'dedddddddddddddd',
    'ddddddddddedddddd'.slice(0, 16),
    'dddddddddddddddd',
    'dddfddddddddeddd',
    'dddddddddddddddd',
    'ddddddedddddddddd'.slice(0, 16),
    'dddddddddddddddd'
  ]);

  // ----------------------------------------------------------------- cliff --
  T('t_cliff', { s: C.stn1, t: C.stn0, u: C.stn2 }, [
    'uuuuuuuuuuuuuuuu',
    'ssssssssssssssss',
    'ssssssssssssssss',
    'sstssssssstsssss',
    'ssssssssssssssss',
    'tttsssssssssttts',
    'ssssssssssssssss',
    'ssssssstssssssss',
    'ssssssssssssssss',
    'stsssssssssstsss',
    'ssssssssssssssss',
    'ssstttsssssssstt',
    'ssssssssssssssss',
    'sssssssssstsssss',
    'tsssssssssssssss',
    'tttttttttttttttt'
  ]);
  T('t_rock', { o: C.ink, s: C.stn2, t: C.stn1, u: C.stn3 }, [
    '................',
    '................',
    '................',
    '.....oooooo.....',
    '...oouuuuusoo...',
    '..ouuuuussssso..',
    '..ouuussssssso..',
    '.ouusssssssstto.'.replace('tt', 'ts'),
    '.ousssssssstssо.'.replace('о', 'o'),
    '.ossssstsssssto.',
    '.osstssssssssto.',
    '..ossssssttsto..',
    '..otssssssstto..',
    '...oottssttoo...',
    '.....oooooo.....',
    '................'
  ]);

  // ------------------------------------------------------------------ cave --
  T('t_cavefloor', { s: C.stn1, t: C.stn0, u: C.stn2 }, [
    'ssssssssssssssss',
    'ssssusssssssssss',
    'ssssssssssstssss',
    'ssssssssssssssss',
    'sstsssssusssssss',
    'ssssssssssssssss',
    'ssssssstssssssss',
    'sussssssssssssts',
    'ssssssssssssssss',
    'ssssstssssssssss',
    'ssssssssssussses'.replace('e', 's'),
    'stssssssssssssss',
    'ssssssssstssssss',
    'ssssssssssssssss',
    'ssussssssssstsss',
    'ssssssssssssssss'
  ]);
  T('t_cavewall', { o: C.ink, s: C.stn0, t: C.stn1, u: C.stn2 }, [
    'tttttttttttttttt',
    'tutttttttutttttt',
    'tttttttttttttttt',
    'ttttttuttttttutt',
    'tttttttttttttttt',
    'oooooooooooooooo',
    'sssssssssssssss s'.slice(0, 16),
    'ssosssssossssoss',
    'ssssssssssssssss',
    'sossssossssossss',
    'ssssssssssssssss',
    'ssssossssossssos',
    'ssssssssssssssss',
    'sossssssosssssss',
    'ssssssssssssssss',
    'ssssssssssssssss'
  ]);
  T('t_crystal', { o: C.ink, c: C.ice2, i: C.ice3, p: C.pur2, s: C.stn1 }, [
    '................',
    '......o.........',
    '.....oco........',
    '.....ocio..oo...',
    '....ocico.oco...',
    '....ocico.oco...',
    '...ociicооico...'.replace('оо', 'oo'),
    '...ociico.oico..',
    '...ociico.oico..',
    '..ociiicоoiico..'.replace('о', 'o'),
    '..ociiiicоiicо..'.replace(/о/g, 'o'),
    '..oiiciicоiico..'.replace('о', 'o'),
    '..ooooooooooo...',
    '..osssssssssо...'.replace('о', 'o'),
    '...ooooooooo....',
    '................'
  ]);
  T('t_stairs', { o: C.ink, s: C.stn1, t: C.stn0, u: C.stn2 }, [
    'oooooooooooooooo',
    'ouuuuuuuuuuuuuuо'.replace('о', 'o'),
    'osssssssssssssso',
    'otttttttttttttto',
    'oooooooooooooooo',
    'ouuuuuuuuuuuuuuо'.replace('о', 'o'),
    'osssssssssssssso',
    'otttttttttttttto',
    'oooooooooooooooo',
    'ouuuuuuuuuuuuuuо'.replace('о', 'o'),
    'osssssssssssssso',
    'otttttttttttttto',
    'oooooooooooooooo',
    'ouuuuuuuuuuuuuuо'.replace('о', 'o'),
    'osssssssssssssso',
    'oooooooooooooooo'
  ]);

  // ------------------------------ rooftop markers (heal / shop / gym) -------
  // Center rooftop placard: a proper Poké Ball — bright-red top half, white
  // bottom, ink equator with a white release button — reading clearly against
  // the deep-red Center roof.
  T('t_hroofx', { o: C.ink, R: C.red1, q: C.red3, w: C.white }, [
    'RRRRRRRRRRRRRRRR',
    'RRRRRooooooRRRRR',
    'RRRooqqqqqqooRRR',
    'RRoqqqqqqqqqqoRR',
    'RRoqqqqqqqqqqoRR',
    'RRoqqqqqqqqqqoRR',
    'RRooooooooooooRR',
    'RRoooowwwwooooRR',
    'RRoooowwwwooooRR',
    'RRooooooooooooRR',
    'RRowwwwwwwwwwoRR',
    'RRowwwwwwwwwwoRR',
    'RRoowwwwwwwwooRR',
    'RRRoowwwwwwooRRR',
    'RRRRRooooooRRRRR',
    'RRRRRRRRRRRRRRRR'
  ]);
  T('t_sroofx', { o: C.ink, R: C.blu1, r: C.blu0, y: C.yel1, Y: C.yel2 }, [
    'RRRRRRRRRRRRRRRR',
    'RRRRRRRRRRRRRRRR',
    'RRRRRooooooRRRRR',
    'RRRooyyyyyyooRRR',
    'RRoyyYYyyyyyyoRR',
    'RRoyYyyyyooyyoRR',
    'RRoyYyyyoyyyyoRR',
    'RRoyyyyoyyyyyoRR',
    'RRoyyyoyyyyYyoRR',
    'RRoyyoyyyyyYyoRR',
    'RRoyyyyyyYYyyoRR',
    'RRRooyyyyyyooRRR',
    'RRRRRooooooRRRRR',
    'rrrrrrrrrrrrrrrr',
    'RRRRRRRRRRRRRRRR',
    'RRRRRRRRRRRRRRRR'
  ]);
  T('t_lroofx', { o: C.ink, R: C.stn2, r: C.stn1, y: C.yel1, Y: C.yel2 }, [
    'RRRRRRRRRRRRRRRR',
    'RRRRRRRRRRRRRRRR',
    'RRRRRRRooRRRRRRR',
    'RRRRRRoYYoRRRRRR',
    'RRRRRoYYYYoRRRRR',
    'RRRRoYYyyYYoRRRR',
    'RRRoYYyyyyYYoRRR',
    'RRoYYyyyyyyYYoRR',
    'RRoyYyyyyyyYyoRR',
    'RRRoyYyyyyYyoRRR',
    'RRRRoyYyyYyoRRRR',
    'RRRRRoyyyyoRRRRR',
    'RRRRRRoyyoRRRRRR',
    'RRRRRRRooRRRRRRR',
    'rrrrrrrrrrrrrrrr',
    'RRRRRRRRRRRRRRRR'
  ]);

  // ------------------------------------- heal / shop / gym facade pieces ----
  // Pokémon-Center red roof (classic look) + Poké Mart blue roof.
  var HR = { o: C.ink, q: C.red2, R: C.red1, r: C.red0, s: C.red0 };
  var SR = { o: C.ink, q: C.blu2, R: C.blu1, r: C.blu0, s: C.blu0 };
  G.ART.t_hroof_tl = { base: 't_roof_tl', pal: HR };
  G.ART.t_hroof_tm = { base: 't_roof_tm', pal: HR };
  G.ART.t_hroof_tr = { base: 't_roof_tr', pal: HR };
  G.ART.t_hroof_bl = { base: 't_roof_bl', pal: HR };
  G.ART.t_hroof_bm = { base: 't_roof_bm', pal: HR };
  G.ART.t_hroof_br = { base: 't_roof_br', pal: HR };
  G.ART.t_sroof_tl = { base: 't_roof_tl', pal: SR };
  G.ART.t_sroof_tm = { base: 't_roof_tm', pal: SR };
  G.ART.t_sroof_tr = { base: 't_roof_tr', pal: SR };
  G.ART.t_sroof_bl = { base: 't_roof_bl', pal: SR };
  G.ART.t_sroof_bm = { base: 't_roof_bm', pal: SR };
  G.ART.t_sroof_br = { base: 't_roof_br', pal: SR };

  // Center placard: a red-and-white capture-ball emblem.
  T('t_healsign', { o: C.ink, w: C.pale, l: C.lgry, R: C.red2 }, [
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'wwooooooooooooww',
    'wwowwwwwwwwwwoww',
    'wwowwoooooowwoww',
    'wwowoRRRRRRowoww',
    'wwowoRRRRRRowoww',
    'wwowoRRRRRRowoww',
    'wwowooowwooowoww',
    'wwowowwwwwwowoww',
    'wwowowwwwwwowoww',
    'wwowwoooooowwoww',
    'wwooooooooooooww',
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'oooooooooooooooo'
  ]);
  // Mart placard: a blue shopping bag.
  T('t_shopsign', { o: C.ink, w: C.pale, l: C.lgry, b: C.blu2, B: C.blu1 }, [
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'wwooooooooooooww',
    'wwowwoowwoowwoww',
    'wwowoooooooowoww',
    'wwoobbbbbbbbooww',
    'wwoobBBBBBBbooww',
    'wwoobbbbbbbbooww',
    'wwoobBBBBBBbooww',
    'wwoobbbbbbbbooww',
    'wwoobBBBBBBbooww',
    'wwowoooooooowoww',
    'wwooooooooooooww',
    'llllllllllllllll',
    'wwwwwwwwwwwwwwww',
    'oooooooooooooooo'
  ]);
  // Grand gym entrance: tall stone double-doors split by a central stile, with
  // gold accent bands — reads as a civic landmark, not a house door.
  T('t_gymdoor', { o: C.ink, w: C.stn3, l: C.stn2, s: C.stn1, y: C.yel1 }, [
    'llllllllllllllll',
    'wwooooooooooooww',
    'wwossssoossssoww',
    'wwosyysoosyysoww',
    'wwossssoossssoww',
    'wwossssoossssoww',
    'wwosyysoosyysoww',
    'wwossssoossssoww',
    'wwossssoossssoww',
    'wwosyysoosyysoww',
    'wwossssoossssoww',
    'wwossssoossssoww',
    'wwosyysoosyysoww',
    'wwossssoossssoww',
    'wwooooooooooooww',
    'oooooooooooooooo'
  ]);

  // ----------------------------------------------- more interior pieces ----
  T('t_icounter', { o: C.ink, r: C.brn3, s: C.brn2, t: C.brn1, f: C.tan1 }, [
    'oooooooooooooooo',
    'offffffffffffffо'.replace('о', 'o'),
    'offrrrrrrrrrrffo',
    'offffffffffffffо'.replace('о', 'o'),
    'oooooooooooooooo',
    'osssssssssssssso',
    'ossttssttssttsso',
    'osssssssssssssso',
    'ossttssttssttsso',
    'osssssssssssssso',
    'ossttssttssttsso',
    'osssssssssssssso',
    'osssssssssssssso',
    'otttttttttttttto',
    'oooooooooooooooo',
    '................'
  ]);
  T('t_ihealm', { o: C.ink, s: C.stn1, u: C.stn2, v: C.stn3, r: C.red2, g: C.grn3, w: C.white }, [
    'oooooooooooooooo',
    'ouuuuuuuuuuuuuuo',
    'ouvvvvvvvvvvvvuo',
    'ouvwwwwwwwwwwvuo',
    'ouvwrgrgrgrgwvuo',
    'ouvwwwwwwwwwwvuo',
    'ouvvvvvvvvvvvvuo',
    'ouuuuuuuuuuuuuuo',
    'ousosososososuuo',
    'ouuuuuuuuuuuuuuo',
    'ousususususususo',
    'ouuuuuuuuuuuuuuo',
    'osssssssssssssso',
    'osssssssssssssso',
    'oooooooooooooooo',
    '................'
  ]);
  T('t_gfloor', { s: C.stn3, t: C.stn2, u: C.pale }, [
    'ssssssssssssssss',
    'stttttttttttttts',
    'stssssssssssssts',
    'stsusssssssussts',
    'stssssssssssssts',
    'stssssssssssssts',
    'stsssssttsssssts',
    'stsssstuutssssts',
    'stsssstuutssssts',
    'stsssssttsssssts',
    'stssssssssssssts',
    'stssssssssssssts',
    'stsusssssssussts',
    'stssssssssssssts',
    'stttttttttttttts',
    'ssssssssssssssss'
  ]);
  T('t_redcarpet', { r: C.red1, q: C.red2, y: C.yel1 }, [
    'yqqqqqqqqqqqqqqy',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'qrrrrrrrrrrrrrrq',
    'yqqqqqqqqqqqqqqy'
  ]);
  T('t_statue', { o: C.ink, s: C.stn2, t: C.stn1, u: C.stn3 }, [
    '................',
    '.....oooo.......',
    '....ouuuso......',
    '....oussso......',
    '.....ossо.......'.replace('о', 'o'),
    '....ouusso......',
    '...ouusssso.....',
    '...oussssto.....',
    '...oussssto.....',
    '....osssto......',
    '....ossstо......'.replace('о', 'o'),
    '...oossssoo.....',
    '..ouussssstо....'.replace('о', 'o'),
    '..ousssssssto...',
    '..ooooooooooo...',
    '................'
  ]);

  // ==========================================================================
  // G.TILES — gameplay properties. img/anim reference G.ART names.
  // solid blocks walking; grass rolls wild encounters; ledge hops one way.
  // ==========================================================================
  G.TILES = {
    grass:     { img: 't_grass' },
    grass2:    { img: 't_grass2' },
    tallgrass: { img: 't_tallgrass', grass: true },
    flower:    { anim: ['t_flower1', 't_flower2'], animSpeed: 32 },
    deco_flowerY: { img: 't_deco_flowerY' },
    deco_pebble:  { img: 't_deco_pebble' },
    deco_bush:    { img: 't_deco_bush' },
    deco_palm:    { img: 't_deco_palm' },
    deco_shell:   { img: 't_deco_shell' },
    deco_cinder:  { img: 't_deco_cinder' },
    lava:      { img: 't_lava', solid: true },
    // ---- endgame lair tiles ----
    seabed:    { img: 't_seabed' },
    kelp:      { anim: ['t_kelp1', 't_kelp2'], animSpeed: 30, grass: true },
    coral:     { img: 't_coral', solid: true },
    bubbles:   { anim: ['t_bubbles1', 't_bubbles2', 't_bubbles3'], animSpeed: 20 },
    basalt:    { img: 't_basalt' },
    emberfloor:{ anim: ['t_emberfloor1', 't_emberfloor2'], animSpeed: 26, cave: true },
    obsidian:  { img: 't_obsidian', solid: true },
    path:      { img: 't_path' },
    path_n:    { img: 't_path_n' },
    path_s:    { img: 't_path_s' },
    path_e:    { img: 't_path_e' },
    path_w:    { img: 't_path_w' },
    tree_tl:   { img: 't_tree_tl', solid: true },
    tree_tr:   { img: 't_tree_tr', solid: true },
    tree_bl:   { img: 't_tree_bl', solid: true },
    tree_br:   { img: 't_tree_br', solid: true },
    ledge:     { img: 't_ledge', ledge: 'down' },
    fence:     { img: 't_fence', solid: true },
    sign:      { img: 't_sign', solid: true },

    roof_tl: { img: 't_roof_tl', solid: true }, roof_tm: { img: 't_roof_tm', solid: true },
    roof_tr: { img: 't_roof_tr', solid: true }, roof_bl: { img: 't_roof_bl', solid: true },
    roof_bm: { img: 't_roof_bm', solid: true }, roof_br: { img: 't_roof_br', solid: true },
    wall:    { img: 't_wall', solid: true },    window: { img: 't_window', solid: true },
    door:    { img: 't_door', door: true },
    gdoor:   { img: 't_gdoor', door: true },

    lroof_tl: { img: 't_lroof_tl', solid: true }, lroof_tm: { img: 't_lroof_tm', solid: true },
    lroof_tr: { img: 't_lroof_tr', solid: true }, lroof_bl: { img: 't_lroof_bl', solid: true },
    lroof_bm: { img: 't_lroof_bm', solid: true }, lroof_br: { img: 't_lroof_br', solid: true },
    droof_tl: { img: 't_droof_tl', solid: true }, droof_tm: { img: 't_droof_tm', solid: true },
    droof_tr: { img: 't_droof_tr', solid: true }, droof_bl: { img: 't_droof_bl', solid: true },
    droof_bm: { img: 't_droof_bm', solid: true }, droof_br: { img: 't_droof_br', solid: true },
    lwall:    { img: 't_lwall', solid: true },    lwindow: { img: 't_lwindow', solid: true },
    ldoor:    { img: 't_ldoor', door: true },

    ifloor: { img: 't_ifloor' },
    iwall:  { img: 't_iwall', solid: true },
    imat:   { img: 't_imat' },
    itable: { img: 't_itable', solid: true },
    ibook:  { img: 't_ibook', solid: true },
    imach:  { img: 't_imach', solid: true },
    ibed_t: { img: 't_ibed_t', solid: true },
    ibed_b: { img: 't_ibed_b', solid: true },
    iplant: { img: 't_iplant', solid: true },
    istool: { img: 't_istool', solid: true },

    water:   { anim: ['t_water1', 't_water2', 't_water3', 't_water4'], animSpeed: 24, solid: true, water: true },
    deepwater: { anim: ['t_deepwater1', 't_deepwater2', 't_deepwater3', 't_deepwater4'], animSpeed: 24, solid: true },
    // beaches are walkable so you can wade from the sand into the sea and swim
    shore_n: { img: 't_shore_n' },
    shore_s: { img: 't_shore_s' },
    shore_w: { img: 't_shore_w' },
    shore_e: { img: 't_shore_e' },
    sand:    { img: 't_sand' },
    cliff:   { img: 't_cliff', solid: true },
    rock:    { img: 't_rock', solid: true },

    cavefloor: { img: 't_cavefloor', cave: true },
    cavewall:  { img: 't_cavewall', solid: true },
    crystal:   { img: 't_crystal', solid: true },
    stairs:    { img: 't_stairs' },

    hroof_tl: { img: 't_hroof_tl', solid: true }, hroof_tm: { img: 't_hroof_tm', solid: true },
    hroof_tr: { img: 't_hroof_tr', solid: true }, hroof_bl: { img: 't_hroof_bl', solid: true },
    hroof_bm: { img: 't_hroof_bm', solid: true }, hroof_br: { img: 't_hroof_br', solid: true },
    sroof_tl: { img: 't_sroof_tl', solid: true }, sroof_tm: { img: 't_sroof_tm', solid: true },
    sroof_tr: { img: 't_sroof_tr', solid: true }, sroof_bl: { img: 't_sroof_bl', solid: true },
    sroof_bm: { img: 't_sroof_bm', solid: true }, sroof_br: { img: 't_sroof_br', solid: true },
    healsign: { img: 't_healsign', solid: true },
    hroofx: { img: 't_hroofx', solid: true },
    sroofx: { img: 't_sroofx', solid: true },
    lroofx: { img: 't_lroofx', solid: true },
    shopsign: { img: 't_shopsign', solid: true },
    gymdoor:  { img: 't_gymdoor', door: true },

    icounter: { img: 't_icounter', solid: true },
    ihealm:   { img: 't_ihealm', solid: true },
    gfloor:   { img: 't_gfloor' },
    redcarpet:{ img: 't_redcarpet' },
    statue:   { img: 't_statue', solid: true }
  };
})();


