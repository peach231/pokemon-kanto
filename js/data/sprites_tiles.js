// pokemon-kanto — sprites_tiles.js
// 16x16 map tiles, authored as palette-indexed grids (see palettes.js for the
// style contract), plus G.TILES — the gameplay table mapping tile names to art
// and behaviour (solid / grass / ledge / door / water / cave / cut / strength).
//
// This is a Kanto set, drawn fresh rather than re-tinted from Hoenn's. The
// region is temperate woodland: deciduous canopies instead of palms, loam
// tracks instead of red clay, neutral grey stone instead of volcanic rock.
//
// Gen 1's towns are legible at a glance by ROOF COLOUR, and that is a hard rule
// here: red roof means Pokemon Centre, blue means Mart, slate means gym,
// terracotta means an ordinary house. A player should never have to walk into
// a building to find out what it is.
//
// Drawing rules (from palettes.js): light comes from the upper-left, shading
// steps down the local ramp rather than to black, and no tile carries its own
// drop shadow — renderers add those.

(function () {
  var C = G.C;

  // Every tile is exactly 16x16. Rather than trust hand-counted string widths,
  // T() normalises and records anything that was off so tools/check.js can
  // report it — a miscounted row would otherwise be an invisible seam in the
  // world rather than a loud failure.
  G.ART_WARN = G.ART_WARN || [];
  function T(name, pal, rows) {
    var px = [];
    for (var y = 0; y < 16; y++) {
      var r = rows[y] == null ? '' : String(rows[y]);
      if (r.length !== 16) G.ART_WARN.push(name + ' row ' + y + ': ' + r.length + ' cols');
      while (r.length < 16) r += r.charAt(r.length - 1) || '.';
      px.push(r.slice(0, 16));
    }
    if (rows.length !== 16) G.ART_WARN.push(name + ': ' + rows.length + ' rows');
    G.ART[name] = { w: 16, h: 16, pal: pal, px: px };
  }

  // Build a row by repeating a pattern out to 16 columns.
  function rep(pat) {
    var r = '';
    while (r.length < 16) r += pat;
    return r.slice(0, 16);
  }
  var fill = function (ch) { return rep(ch); };

  // ======================================================= GROUND: grass ====
  // A calm mid-green field stippled with blades: a light tip over a shadowed
  // base. Quiet enough not to fight the sprites standing on it, textured
  // enough that a large field doesn't read as a flat slab.
  var GR = { a: C.leaf0, b: C.leaf1, c: C.leaf2, d: C.leaf3 };

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
    'bbcbbbbbbbbbbcbb',
    'bbabbbbbbbbbbabb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb'
  ]);

  // Encounter grass. Where the wild Pokemon are is the single most important
  // piece of information on a Kanto route, so this cannot be a subtle texture
  // variation — a first pass that only stippled the field green was almost
  // invisible next to it. The BASE is a full step darker than the field and
  // the tufts are big, high-contrast and offset between the two halves so a
  // patch reads as one obviously different surface from across the screen.
  var TG = { a: C.grn0, b: C.leaf0, c: C.leaf2, d: C.leaf3 };
  T('t_tallgrass', TG, [
    'bbbbbbbbbbbbbbbb',
    'bbbcbbbbbbbcbbbb',
    'bbcacbbbbbcacbbb',
    'bbacabbbbbacabbb',
    'bacacabbbacacabb',
    'baabaabbbaabaabb',
    'bbaaabbbbbaaabbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbcbbbbbbcb',
    'bbbbbbcacbbbbcac',
    'bbbbbbacabbbbaca',
    'abbbbacacabbacac',
    'abbbbaabaabbbaba',
    'bbbbbbaaabbbbbaa',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb'
  ]);

  // Wildflowers — two frames, gently alternating.
  var FL = { a: C.leaf0, b: C.leaf1, y: C.yel2, w: C.white, r: C.red3 };
  T('t_flower1', FL, [
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbwbbbbbbbbbbbb',
    'bbwywbbbbbbrbbbb',
    'bbbwbbbbbbryrbbb',
    'bbbabbbbbbbrbbbb',
    'bbbbbbbbbbbabbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbwbbbbbbbb',
    'bbbbbbwywbbbbbbb',
    'bbbbbbbwbbbbbbbb',
    'bbbbbbbabbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb'
  ]);
  T('t_flower2', FL, [
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbwbbbbbbbrbbbb',
    'bbwywbbbbbryrbbb',
    'bbbwbbbbbbbrbbbb',
    'bbbabbbbbbbabbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbwbbbbbbbb',
    'bbbbbbwywbbbbbbb',
    'bbbbbbbwbbbbbbbb',
    'bbbbbbbabbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb'
  ]);

  // ======================================================== GROUND: path ====
  // Packed loam with grit. Kanto's routes are dirt tracks through woodland.
  var PA = { a: C.brn1, b: C.tan0, c: C.tan1, d: C.brn2, g: C.leaf1, h: C.leaf0 };

  // A large expanse of path was reading as one flat beige slab, so the grit is
  // clustered into wheel-rut bands rather than sprinkled evenly — a worn track
  // has darker compacted lines through it, and that is what breaks up the area.
  T('t_path', PA, [
    'bbbbbbbbbbbbbbbb',
    'bbcbbbbbbddbbbbb',
    'bddbbbbdbbdbbbcc',
    'bcbbbbbddbbbbbbb',
    'bbbbddbbbbccbbbb',
    'bbbbdbbbbbbbbddb',
    'ddbbbbccbbbbbbbb',
    'bbbbbbbbbbbbbccb',
    'bbccbbbbdddbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbddbbbbccbbb',
    'ccbbbbbbbbbbbbdd',
    'bbbbbbbccbbbbbdb',
    'bddbbbbbbbbbbbbb',
    'bbbbbbbbbbddbbbb',
    'bbbbccbbbbbbbbbb'
  ]);

  // Path edges: the grass verge crumbles into the track.
  T('t_path_n', PA, [
    fill('g'),
    rep('hghg'),
    rep('ahaa'),
    rep('bbab'),
    'bbbbbbbbbbbbbbbb',
    'bbbcbbbbbdbbbbbb',
    'bbbbbbbbbbbbbbcb',
    'bcbbbbbdbbbbbbbb',
    'bbbbbbbbbbbcbbbb',
    'bbbbbdbbbbbbbbbb',
    'bbbbbbbbcbbbbdbb',
    'bdbbbbbbbbbbbbbb',
    'bbbbbcbbbbbbbbbb',
    'bbbbbbbbbdbbbcbb',
    'bbbcbbbbbbbbbbbb',
    'bbbbbbbdbbbbbbbb'
  ]);
  T('t_path_s', PA, [
    'bbbbbbbdbbbbbbbb',
    'bbbcbbbbbbbbbbbb',
    'bbbbbbbbbdbbbcbb',
    'bbbbbcbbbbbbbbbb',
    'bdbbbbbbbbbbbbbb',
    'bbbbbbbbcbbbbdbb',
    'bbbbbdbbbbbbbbbb',
    'bbbbbbbbbbbcbbbb',
    'bcbbbbbdbbbbbbbb',
    'bbbbbbbbbbbbbbcb',
    'bbbcbbbbbdbbbbbb',
    'bbbbbbbbbbbbbbbb',
    rep('bbab'),
    rep('ahaa'),
    rep('hghg'),
    fill('g')
  ]);
  T('t_path_w', PA, [
    'ghabbbbbbbbbbbbb',
    'gaabbbcbbbbdbbbb',
    'hhabbbbbbbdbbbcb',
    'ghabcbbbbbbbbbbb',
    'gaabbbbdbbbbcbbb',
    'hhabbbbbbbbbbbdb',
    'ghabbbbbbcbbbbbb',
    'gaabbdbbbbbbbbbb',
    'hhabbbbbbbbcbbbb',
    'ghabbcbbbdbbbbbb',
    'gaabbbbbbbbbbbcb',
    'hhabbbbdbbbbbbbb',
    'ghabbbbbbbbcbbbb',
    'gaabcbbbbbbbbdbb',
    'hhabbbbbdbbbbbbb',
    'ghabbbbbbbbbbbbb'
  ]);
  T('t_path_e', PA, [
    'bbbbbbbbbbbbbahg',
    'bbbbdbbbbcbbbaag',
    'bcbbbbbdbbbbbahh',
    'bbbbbbbbbbbcbahg',
    'bbbcbbbbdbbbbaag',
    'bdbbbbbbbbbbbahh',
    'bbbbbbcbbbbbbahg',
    'bbbbbbbbbdbbbaag',
    'bbbcbbbbbbbbbahh',
    'bbbbbbdbbbcbbahg',
    'bcbbbbbbbbbbbaag',
    'bbbbbbbbdbbbbahh',
    'bbbbcbbbbbbbbahg',
    'bbbbbbbbbbcbbaag',
    'bdbbbbbcbbbbbahh',
    'bbbbbbbbbbbbbahg'
  ]);

  // Beach sand. It has to be unmistakable against the dirt path, which is a
  // similar tan — so sand is a step LIGHTER, and carries wind ripples rather
  // than the path's compacted ruts.
  var SA = { a: C.tan0, b: C.tan1, c: C.white, d: C.brn3 };
  T('t_sand', SA, [
    'bbbbbbbbbbbbbbbb',
    'bccbbbbbbbccbbbb',
    'bbbbbbccbbbbbbbb',
    'aabbbbbbbbbbaabb',
    'bbbbbbbbccbbbbbb',
    'bbccbbbbbbbbbbcc',
    'bbbbbbbbbbbbbbbb',
    'bbbbaabbbbbbaabb',
    'ccbbbbbbccbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbccbbbbbbccbb',
    'aabbbbbbaabbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbccbbbbbbccbbbb',
    'bbbbbbccbbbbbbbb',
    'bbbbbbbbbbbbbbbb'
  ]);

  // ======================================================= GROUND: water ====
  // Four-frame ripple, generated so the phases genuinely march rather than
  // being three hand-typos of each other.
  var WA = { a: C.blu0, b: C.blu1, c: C.blu2, d: C.blu3 };
  function water(name, off) {
    var rows = [];
    for (var y = 0; y < 16; y++) {
      var r = '';
      for (var x = 0; x < 16; x++) {
        var w = (x + off + (y >> 1) * 3) % 12;
        r += w === 0 ? 'd' : w === 1 ? 'c' : (y % 4 === 3 ? 'a' : 'b');
      }
      rows.push(r);
    }
    T(name, WA, rows);
  }
  water('t_water1', 0); water('t_water2', 3); water('t_water3', 6); water('t_water4', 9);

  var DW = { a: C.blu0, b: C.gra1, c: C.blu1, d: C.blu2 };
  function deep(name, off) {
    var rows = [];
    for (var y = 0; y < 16; y++) {
      var r = '';
      for (var x = 0; x < 16; x++) {
        var w = (x * 2 + off + (y >> 1) * 5) % 17;
        r += w === 0 ? 'd' : w === 1 ? 'c' : (y % 3 === 2 ? 'b' : 'a');
      }
      rows.push(r);
    }
    T(name, DW, rows);
  }
  deep('t_deepwater1', 0); deep('t_deepwater2', 4); deep('t_deepwater3', 8); deep('t_deepwater4', 12);

  // Shorelines — walkable, so you can wade off the sand and Surf away.
  var SH = { s: C.tan1, t: C.tan0, x: C.blu3, w: C.blu2, a: C.blu1 };
  T('t_shore_n', SH, [
    fill('s'), rep('stss'), rep('ttst'), rep('xxtx'), rep('xwxx'),
    fill('w'), rep('waww'), fill('w'), rep('awwa'), fill('w'),
    rep('wwaw'), fill('w'), rep('awww'), fill('w'), rep('wwaw'), fill('w')
  ]);
  T('t_shore_s', SH, [
    fill('w'), rep('wwaw'), fill('w'), rep('awww'), fill('w'),
    rep('wwaw'), fill('w'), rep('awwa'), fill('w'), rep('waww'),
    fill('w'), rep('xwxx'), rep('xxtx'), rep('ttst'), rep('stss'), fill('s')
  ]);
  T('t_shore_w', SH, [
    'sstxwwwawwwawwaw',
    'sttxwwawwwawwwaw',
    'stxxwwwwwwwwwwww',
    'sstxwawwawwawwwa',
    'ttxxwwwwwwwwwwww',
    'stxxwwwwawwwawww',
    'sstxwawwwwwwawww',
    'sttxwwwwwwwwwwww',
    'stxxwwawwawwwaww',
    'sstxwwwwwwwwwwww',
    'ttxxwwawwwawwaww',
    'stxxwwwwwwwwwwww',
    'sstxwwwawwwawwaw',
    'sttxwawwwwwwwwww',
    'stxxwwwwawwawwwa',
    'sstxwwwwwwwwwwww'
  ]);
  T('t_shore_e', SH, [
    'wawwawwwawwawxts',
    'wwwwwwwwwwwwxtts',
    'wwawwwawwawwxxts',
    'wwwwwwwwwwwwxtss',
    'awwawwwawwwwxxtt',
    'wwwwwwwwwwwwxxts',
    'wwwawwawwwawxtss',
    'wwwwwwwwwwwwxtts',
    'awwwwwawwawwxxts',
    'wwwwwwwwwwwwxtss',
    'wwawwawwwawwxxtt',
    'wwwwwwwwwwwwxxts',
    'wawwwawwawwwxtss',
    'wwwwwwwwwwwwxtts',
    'wwwawwwawwawxxts',
    'wwwwwwwwwwwwxtss'
  ]);

  // ========================================================= NATURE: trees ==
  // A 2x2 deciduous canopy. Kanto's woodland is oak and maple, so the crown is
  // rounded and lumpy rather than a palm's radiating fronds. Lit upper-left.
  var TR = { o: C.grn0, a: C.grn1, b: C.grn2, c: C.grn3, t: C.brn0, u: C.brn1,
             g: C.leaf1, h: C.leaf0 };

  T('t_tree_tl', TR, [
    '................',
    '.............ooo',
    '...........oobbc',
    '.........oobbccc',
    '........oobbcccb',
    '......oobbbccbbb',
    '.....oobbbcbbbba',
    '....ooabbbbbbbaa',
    '....oabbbbbbbaaa',
    '...oabbbbbbbaaaa',
    '...oabbbbbbaaaaa',
    '..oaabbbbbaaaaaa',
    '..oabbbbbaaaaaaa',
    '..oaabbbaaaaaaaa',
    '..ooaabaaaaaaaaa',
    '...ooaaaaaaaaaoo'
  ]);
  T('t_tree_tr', TR, [
    '................',
    'ooo.............',
    'bbooo...........',
    'bbbboo..........',
    'bbbbbboo........',
    'abbbbbboo.......',
    'aabbbbbboo......',
    'aaabbbbbboa.....',
    'aaaabbbbbboa....',
    'aaaaaabbbbboa...',
    'aaaaaaabbbbboa..',
    'aaaaaaaabbbboa..',
    'aaaaaaaaabbboa..',
    'aaaaaaaaaabboa..',
    'aaaaaaaaaaaboa..',
    'ooaaaaaaaaaoo...'
  ]);
  T('t_tree_bl', TR, [
    '...oooaaaaaaaooo',
    '....oooaaaaoooo.',
    '.....oooooooo...',
    '........ttu.....',
    '.......ttuu......'.slice(0, 16),
    '.......ttuu.....',
    '.......ttuu.....',
    '.......ttuu.....',
    '......tttuuu....',
    '......tttuuu....',
    '.....ttttuuuu...',
    '......tttuu.....',
    '................',
    rep('....'),
    fill('.'),
    fill('.')
  ]);
  T('t_tree_br', TR, [
    'oooaaaaaaaooo....'.slice(0, 16),
    '.ooooaaaaoooo...',
    '...oooooooo.....',
    '....utt.........',
    '....utt.........',
    '....utt.........',
    '....utt.........',
    '....utt.........',
    '....uuttt.......',
    '....uuttt.......',
    '...uuuutttt.....',
    '.....uutttt.....',
    '................',
    rep('....'),
    fill('.'),
    fill('.')
  ]);

  // A tree small enough to Cut. Deliberately unlike the 2x2 canopy — one tile,
  // paler, with a visible trunk — so the player learns to spot the obstacle.
  T('t_cuttree', TR, [
    '.....ooooo......',
    '....oobbbcoo....',
    '...obbbccccbo...',
    '..obbbccccbbbo..',
    '..obbccccbbbbbo.',
    '.obbbcccbbbbbao.',
    '.obbbbbbbbbbaao.',
    '.obbbbbbbbbaaao.',
    '.oabbbbbbbaaaao.',
    '..oabbbbbaaaao..',
    '...oaabbaaaao...',
    '....oottuoo.....',
    '.......ttu......',
    '.......ttu......',
    '................',
    '................'
  ]);

  // Strength boulder — round and pale so it stands out against cave rock.
  var BO = { o: C.stn0, a: C.stn1, b: C.stn2, c: C.stn3, g: C.leaf1 };
  T('t_boulder', BO, [
    '.....oooooo.....',
    '...oooccccooo...',
    '..oocccccccbao..',
    '.ooccccccccbbao.',
    '.occccccbbbbbbao',
    'occcccbbbbbbbbba',
    'occccbbbbbbbbbaa',
    'ocbbbbbbbbbbbaaa',
    'obbbbbbbbbbbaaaa',
    'obbbbbbbbbbaaaaa',
    'obbbbbbbbbaaaaaa',
    'oabbbbbbbaaaaaao',
    '.oaabbbbaaaaaao.',
    '..oaaaaaaaaaao..',
    '...ooaaaaaaoo...',
    '.....oooooo......'.slice(0, 16)
  ]);

  // Ledge — hop DOWN, never climb back. The lip is bright and the face dark so
  // the one-way direction reads instantly.
  var LE = { a: C.brn0, b: C.brn1, c: C.brn2, d: C.tan0, g: C.leaf1, h: C.leaf0 };
  // The face has to be tall enough to read as a DROP rather than a stripe —
  // the first pass was a thin brown line and looked like a fence. Top and
  // bottom are transparent so the ground above and below shows through, and
  // the bright lip over a darkening striated face sells the one-way direction.
  T('t_ledge', LE, [
    fill('.'),
    fill('.'),
    fill('d'),
    fill('d'),
    rep('cccb'),
    fill('c'),
    rep('cbcb'),
    fill('b'),
    rep('bbab'),
    fill('b'),
    rep('babb'),
    fill('a'),
    rep('aaba'),
    fill('a'),
    fill('.'),
    fill('.')
  ]);

  // ======================================================== NATURE: stone ===
  var ST = { o: C.stn0, a: C.stn1, b: C.stn2, c: C.stn3, g: C.leaf1 };

  T('t_rock', ST, [
    '................',
    '......ooooo......'.slice(0, 16),
    '.....occcbao....',
    '....occccbbao...',
    '...occbbbbbbao..',
    '..ocbbbbbbbbbao.',
    '.obbbbbbbbbbbbao',
    'obbbbbbbbbbbbbaa',
    'obbbbbbbbbbbbaaa',
    'oabbbbbbbbbbaaaa',
    '.oaabbbbbbbaaao.',
    '..oaaaaaaaaaao..',
    '...ooaaaaaaoo...',
    '.....oooooo......'.slice(0, 16),
    '................',
    '................'
  ]);

  // Cliff face — the wall of a plateau, blocking every route edge.
  T('t_cliff', ST, [
    fill('c'), rep('baab'), fill('a'), rep('aoaa'),
    fill('o'), fill('a'), rep('abaa'), fill('a'),
    rep('oaao'), fill('o'), fill('a'), rep('baab'),
    fill('a'), rep('aoaa'), fill('o'), fill('a')
  ]);

  // ========================================================= DECORATIONS ====
  // Scattered by the procedural decorator in overworld.js. None of them block.
  var DE = { g: C.leaf1, h: C.leaf0, y: C.yel2, w: C.white,
             s: C.stn2, t: C.stn1, b: C.grn1, c: C.grn2, u: C.brn1, v: C.brn0 };

  T('t_deco_flowerY', DE, [
    '................', '................', '................',
    '......y.........', '.....ywy........', '......y.........',
    '................', '................', '..........y......'.slice(0, 16),
    '.........ywy....', '...........y....', '................',
    '................', '................', '................',
    '................'
  ]);

  T('t_deco_pebble', DE, [
    '................', '................', '................',
    '....tt..........', '...tss..........', '....tt..........',
    '................', '................', '..........tt....',
    '.........tss....', '..........tt....', '................',
    '....t...........', '...ts...........', '................',
    '................'
  ]);

  // Low woodland shrub.
  T('t_deco_bush', DE, [
    '................',
    '................',
    '......bbb.......',
    '.....bcccb......',
    '....bcccccb.....',
    '...bccccccbb....',
    '...bcccccbbb....',
    '..bbccccbbbbb...',
    '..bbbbbbbbbbb...',
    '...bbbbbbbbb....',
    '....bbbbbbb.....',
    '.....bbbbb......',
    '................',
    '................',
    '................',
    '................'
  ]);

  // Cut stump — replaces the Hoenn palm. Old logging along the routes.
  T('t_deco_stump', DE, [
    '................', '................', '................',
    '................', '......vvvv......', '.....vuuuuv.....',
    '....vuuvvuuv....', '....vuuvvuuv....', '.....vuuuuv.....',
    '......vuuv......', '......vuuv......', '................',
    '................', '................', '................',
    '................'
  ]);

  // Bracken fern — replaces the Hoenn seashell inland.
  T('t_deco_fern', DE, [
    '................', '................', '................',
    '........b.......', '......bcb.......', '.....bcbcb......',
    '....bcbbbcb.....', '...bcbbbbbcb....', '....bbb.bbb.....',
    '.......b.........'.slice(0, 16), '.......b.........'.slice(0, 16),
    '................', '................', '................',
    '................', '................'
  ]);

  // ========================================================= TOWN: fences ===
  var FE = { o: C.brn0, a: C.brn1, b: C.brn2, c: C.brn3, g: C.leaf1 };
  T('t_fence', FE, [
    '................',
    '..o..........o..',
    '.oc..........oc.',
    '.ob..........ob.',
    fill('o'),
    fill('c'),
    fill('b'),
    '.ob..........ob.',
    '.ob..........ob.',
    fill('o'),
    fill('c'),
    fill('b'),
    '.ob..........ob.',
    '.ob..........ob.',
    '.oa..........oa.',
    '................'
  ]);

  var SG = { o: C.brn0, a: C.brn1, b: C.brn2, w: C.tan1, t: C.stn1,
             g: C.leaf1, h: C.leaf0 };
  T('t_sign', SG, [
    '................',
    '..oooooooooooo..',
    '.owwwwwwwwwwwao.',
    '.owtttwtttwtwwa.',
    '.owwwwwwwwwwwwa.',
    '.owttwttwtttwwa.',
    '.owwwwwwwwwwwwa.',
    '.owtttwtwttwwwa.',
    '.owwwwwwwwwwwwa.',
    '.oaaaaaaaaaaaaa.',
    '..oooobaboooooo.',
    '.....obab.......',
    '.....obab.......',
    '.....oaab.......',
    '................',
    '................'
  ]);

  // ========================================================= TOWN: roofs ====
  // Six-tile roofs (2 rows x 3 cols) plus a widening column. One generator,
  // five palettes — the SHAPE is shared so the town silhouette stays coherent
  // and only the colour tells you what the building is.
  function roofSet(prefix, dark, mid, light) {
    var P = { o: C.ink, a: dark, b: mid, c: light, w: C.pale };
    var g = 'g';
    var P2 = { o: C.ink, a: dark, b: mid, c: light, w: C.pale, g: C.leaf1 };

    T(prefix + '_tl', P2, [
      'gggggggggggggggg', 'gggggggggggggooo', 'ggggggggggoooccc',
      'gggggggoooccccbb', 'ggggoooccccbbbbb', 'gooocccbbbbbbbbb',
      'occcbbbbbbbbbbbb', 'obbbbbbbbbbbbbbb', 'obbbbbbbbbbbbbbb',
      'obbbbbbbbbbbbbbb', 'obbbbbbbbbbbbbbb', 'oabbbbbbbbbbbbbb',
      'oabbbbbbbbbbbbbb', 'oaabbbbbbbbbbbbb', fill('a').replace(/^./, 'o'),
      fill('o')
    ]);
    T(prefix + '_tm', P2, [
      fill('g'), fill('o'), fill('c'), fill('b'), fill('b'), fill('b'),
      fill('b'), fill('b'), fill('b'), fill('b'), fill('b'), fill('b'),
      fill('b'), fill('b'), fill('a'), fill('o')
    ]);
    T(prefix + '_tr', P2, [
      'gggggggggggggggg', 'ooogggggggggggggg'.slice(0, 16), 'cccooogggggggggg',
      'bbccccoogggggggg', 'bbbbbccccooogggg', 'bbbbbbbbbcccooog',
      'bbbbbbbbbbbbccco', 'bbbbbbbbbbbbbbbo', 'bbbbbbbbbbbbbbbo',
      'bbbbbbbbbbbbbbao', 'bbbbbbbbbbbbbbao', 'bbbbbbbbbbbbbaao',
      'bbbbbbbbbbbbbaao', 'bbbbbbbbbbbbaaao', fill('a').replace(/.$/, 'o'),
      fill('o')
    ]);
    // The wall band under the roof.
    var wallRow = 'o' + rep('w').slice(0, 15);
    T(prefix + '_bl', P, [
      wallRow, wallRow, wallRow, wallRow, wallRow, wallRow, wallRow, wallRow,
      wallRow, wallRow, wallRow, wallRow, wallRow, wallRow, wallRow, wallRow
    ]);
    T(prefix + '_bm', P, [
      fill('w'), fill('w'), fill('w'), fill('w'), fill('w'), fill('w'),
      fill('w'), fill('w'), fill('w'), fill('w'), fill('w'), fill('w'),
      fill('w'), fill('w'), fill('w'), fill('w')
    ]);
    var wallRowR = rep('w').slice(0, 15) + 'o';
    T(prefix + '_br', P, [
      wallRowR, wallRowR, wallRowR, wallRowR, wallRowR, wallRowR, wallRowR,
      wallRowR, wallRowR, wallRowR, wallRowR, wallRowR, wallRowR, wallRowR,
      wallRowR, wallRowR
    ]);
    // A wider building extends its roof with this plain middle column.
    T(prefix + 'x', P2, [
      fill('g'), fill('o'), fill('c'), fill('b'), fill('b'), fill('b'),
      fill('b'), fill('b'), fill('b'), fill('b'), fill('b'), fill('b'),
      fill('b'), fill('b'), fill('a'), fill('o')
    ]);
  }

  roofSet('t_roof',  C.hse0, C.hse1, C.hse2);   // ordinary house — terracotta
  roofSet('t_hroof', C.ctr0, C.ctr1, C.ctr2);   // Pokemon Centre — RED
  roofSet('t_sroof', C.mrt0, C.mrt1, C.mrt2);   // Poke Mart — BLUE
  roofSet('t_groof', C.gym0, C.gym1, C.gym2);   // gym — slate
  roofSet('t_lroof', C.brk0, C.brk1, C.brk2);   // labs / civic buildings

  // ========================================================= TOWN: walls ====
  var WL = { o: C.ink, a: C.stn1, b: C.pale, d: C.stn2 };
  T('t_wall', WL, [
    fill('b'), fill('b'), fill('b'), fill('b'), fill('d'), fill('b'),
    fill('b'), fill('b'), fill('b'), fill('d'), fill('b'), fill('b'),
    fill('b'), fill('b'), fill('b'), fill('a')
  ]);

  var WN = { o: C.ink, b: C.pale, s: C.sky0, t: C.sky1, a: C.stn1 };
  T('t_window', WN, [
    'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb', 'bboooooooooooobb',
    'bbottttttssssobb', 'bbottttttssssobb', 'bbottttttssssobb',
    'bbottttttssssobb', 'bboooooooooooobb', 'bbottttttssssobb',
    'bbottttttssssobb', 'bbottttttssssobb', 'bbottttttssssobb',
    'bboooooooooooobb', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb',
    fill('a')
  ]);

  var DR = { o: C.ink, a: C.brn0, b: C.brn1, c: C.brn2, d: C.yel1, w: C.pale };
  T('t_door', DR, [
    fill('w'), 'wwwoooooooooowww', 'wwwoccccccccowww',
    'wwwocbbbbbbcowww', 'wwwocbbbbbbcowww', 'wwwocbbbbbbcowww',
    'wwwocbbbbbbcowww', 'wwwocbbbbbbcowww', 'wwwocbbbdbbcowww',
    'wwwocbbbdbbcowww', 'wwwocbbbbbbcowww', 'wwwocbbbbbbcowww',
    'wwwocbbbbbbcowww', 'wwwocbbbbbbcowww', 'wwwoaaaaaaaaowww',
    'wwwoooooooooowww'
  ]);

  // Sliding glass double door — Centres, Marts and civic buildings.
  var GD = { o: C.ink, s: C.sky0, t: C.sky1, a: C.stn1, w: C.pale };
  T('t_gdoor', GD, [
    fill('w'), 'wwooooooooooooww', 'wwottssootttssow',
    'wwottssootttssow', 'wwottssootttssow', 'wwosttssootttsow',
    'wwosttssootttsow', 'wwossttsoosttssow'.slice(0, 16), 'wwossssoossssssw'.slice(0, 16),
    'wwossssoosssssow', 'wwossssoosssssow', 'wwossssoosssssow',
    'wwossssoosssssow', 'wwoaaaaooaaaaaow', 'wwooooooooooooow'.slice(0, 16),
    fill('w')
  ]);

  T('t_gymdoor', { o: C.ink, a: C.gym0, b: C.gym1, c: C.gym2, y: C.yel1, w: C.pale }, [
    fill('w'), 'wwwoooooooooowww', 'wwwocccccccccwww',
    'wwwocbbbbbbbcwww', 'wwwocbbbyybbcwww', 'wwwocbbyyyybcwww',
    'wwwocbbyaayybcww', 'wwwocbyaaaaybcww', 'wwwocbyaaaaybcww',
    'wwwocbbyaayybcww', 'wwwocbbyyyybcwww', 'wwwocbbbyybbcwww',
    'wwwocbbbbbbbcwww', 'wwwocbbbbbbbcwww', 'wwwoaaaaaaaaawww',
    'wwwoooooooooowww'
  ]);

  // Roof-mounted signage — the big red P and the blue MART board.
  T('t_healsign', { o: C.ink, r: C.ctr1, w: C.white, a: C.ctr0 }, [
    fill('a'), 'aoooooooooooooaa'.slice(0, 16), 'aowwwwwwwwwwwoaa',
    'aowwrrrrrrwwwoaa', 'aowwrwwwwrwwwoaa', 'aowwrwwwwrwwwoaa',
    'aowwrrrrrrwwwoaa', 'aowwrwwwwwwwwoaa', 'aowwrwwwwwwwwoaa',
    'aowwrwwwwwwwwoaa', 'aowwrwwwwwwwwoaa', 'aowwwwwwwwwwwoaa',
    'aoooooooooooooaa'.slice(0, 16), fill('a'), fill('a'), fill('a')
  ]);
  T('t_shopsign', { o: C.ink, b: C.mrt1, w: C.white, a: C.mrt0 }, [
    fill('a'), 'aoooooooooooooaa'.slice(0, 16), 'aowwwwwwwwwwwoaa',
    'aowbwbwbbbwbwoaa', 'aowbwbwbwbwbwoaa', 'aowbbbwbbbwbwoaa',
    'aowbwbwbwwwbwoaa', 'aowbwbwbwwwbwoaa', 'aowwwwwwwwwwwoaa',
    'aoooooooooooooaa'.slice(0, 16), fill('a'), fill('a'),
    fill('a'), fill('a'), fill('a'), fill('a')
  ]);

  // ========================================================== INTERIORS =====
  var WOOD = C.wud1;
  var IF = { a: C.wud0, b: WOOD, c: C.wud2 };
  T('t_ifloor', IF, [
    'bbbbbbbbbbbbbbbb', 'bcbbbbbbbbbbbbcb', 'bbbbbbbbbbbbbbbb',
    fill('a'), 'bbbbbbbbbbbbbbbb', 'bbbbbbcbbbbbbbbb',
    'bbbbbbbbbbbbbbbb', fill('a'), 'bbbbbbbbbbbbbbbb',
    'bcbbbbbbbbbcbbbb', 'bbbbbbbbbbbbbbbb', fill('a'),
    'bbbbbbbbbbbbbbbb', 'bbbbbbbbcbbbbbbb', 'bbbbbbbbbbbbbbbb',
    fill('a')
  ]);
  T('t_iwall', { a: C.pls0, b: C.pls1, c: C.pls2, o: C.ink }, [
    fill('c'), fill('b'), fill('b'), fill('b'), fill('a'), fill('b'),
    fill('b'), fill('b'), fill('a'), fill('b'), fill('b'), fill('b'),
    fill('a'), fill('b'), fill('b'), fill('o')
  ]);
  T('t_imat', { a: C.red1, b: C.red2, c: C.red3, o: C.brn0 }, [
    fill('o'), 'obbbbbbbbbbbbbbo', 'obcbcbcbcbcbcbbo',
    'obbbbbbbbbbbbbbo', 'obcbcbcbcbcbcbbo', 'obbbbbbbbbbbbbbo',
    'obcbcbcbcbcbcbbo', 'obbbbbbbbbbbbbbo', 'obcbcbcbcbcbcbbo',
    'obbbbbbbbbbbbbbo', 'obcbcbcbcbcbcbbo', 'obbbbbbbbbbbbbbo',
    'obcbcbcbcbcbcbbo', 'obbbbbbbbbbbbbbo', 'oaaaaaaaaaaaaaao',
    fill('o')
  ]);
  T('t_itable', { o: C.brn0, a: C.brn1, b: C.brn2, c: C.brn3, f: WOOD }, [
    fill('f'), fill('o'), 'occcccccccccccco',
    'obbbbbbbbbbbbbbo', 'obbbbbbbbbbbbbbo', 'obbbbbbbbbbbbbbo',
    'oaaaaaaaaaaaaaao', fill('o'), 'ffoaaffffffaaoff',
    'ffoaaffffffaaoff', 'ffoaaffffffaaoff', 'ffoaaffffffaaoff',
    'ffoaaffffffaaoff', 'ffoaaffffffaaoff', 'ffooofffffffooff'.slice(0, 16),
    fill('f')
  ]);
  T('t_ibook', { o: C.brn0, a: C.brn1, r: C.red2, g: C.grn2, b: C.blu2, y: C.yel1 }, [
    fill('o'), 'oaaaaaaaaaaaaaao', 'oarbgrybrgbyrgao',
    'oarbgrybrgbyrgao', 'oarbgrybrgbyrgao', 'oaaaaaaaaaaaaaao',
    'oaaaaaaaaaaaaaao', 'oagybrgbyrbgryao', 'oagybrgbyrbgryao',
    'oagybrgbyrbgryao', 'oaaaaaaaaaaaaaao', 'oaaaaaaaaaaaaaao',
    'oabrygbrygbrygao', 'oabrygbrygbrygao', 'oaaaaaaaaaaaaaao',
    fill('o')
  ]);
  // The PC / research machine.
  T('t_imach', { o: C.ink, a: C.stn1, b: C.stn2, c: C.stn3, s: C.sky0, g: C.leaf2, f: WOOD }, [
    fill('f'), fill('o'), 'occcccccccccccco',
    'oboooooooooooobo', 'obosssssssssobbo', 'obossgsssgssobbo',
    'obosssssssssobbo', 'obossgggggssobbo', 'obosssssssssobbo',
    'oboooooooooooobo', 'obbbbbbbbbbbbbbo', 'obbaaabbbaaabbbo',
    'obbbbbbbbbbbbbbo', 'obbbbbbbbbbbbbbo', 'oaaaaaaaaaaaaaao',
    fill('o')
  ]);
  T('t_ibed_t', { o: C.ink, b: C.blu2, c: C.blu3, w: C.white, f: WOOD }, [
    fill('f'), 'ooooooooooooooof', 'owwwwwwwwwwwwwof',
    'owwwwwwwwwwwwwof', 'owwwwwwwwwwwwwof', 'ooooooooooooooof',
    'occccccccccccccf'.slice(0, 16), 'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof',
    'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof',
    'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof',
    'obbbbbbbbbbbbbof'
  ]);
  T('t_ibed_b', { o: C.ink, a: C.blu1, b: C.blu2, f: WOOD }, [
    'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof',
    'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof',
    'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof', 'obbbbbbbbbbbbbof',
    'obbbbbbbbbbbbbof', 'oaaaaaaaaaaaaaof', 'ooooooooooooooof',
    'offoooooooooffof'.slice(0, 16), 'offofffffffffoof'.slice(0, 16),
    'offoffffffffffof'.slice(0, 16), fill('f')
  ]);
  T('t_iplant', { o: C.brn0, a: C.brn1, b: C.grn1, c: C.grn2, d: C.grn3, f: WOOD }, [
    fill('f'), 'ffffffbbffffffff', 'fffffbcdcbffffff',
    'ffffbcdddcbfffff', 'fffbcdddddcbffff', 'ffbcdddbdddcbfff',
    'ffbcddbbbddcbfff', 'fffbcdbbbdcbffff', 'ffffbcbbbcbfffff',
    'fffffbbbbbffffff', 'ffffffbbbfffffff', 'fffffoaaaofffff'.slice(0, 15) + 'f',
    'fffffoaaaaofffff', 'fffffoaaaaofffff', 'fffffooooooffff'.slice(0, 15) + 'f',
    fill('f')
  ]);
  T('t_istool', { o: C.brn0, a: C.brn1, b: C.brn2, f: WOOD }, [
    fill('f'), fill('f'), 'ffffooooooooffff',
    'fffobbbbbbbbofff', 'fffobbbbbbbbofff', 'fffoaaaaaaaaofff',
    'ffffoooooooofffff'.slice(0, 16), 'fffffoaaaaoffffff'.slice(0, 16),
    'fffffoaffaoffffff'.slice(0, 16), 'fffffoaffaofffff', 'fffffoaffaofffff',
    'fffffoaffaofffff', 'ffffoaffffaoffff', 'ffffoaffffaoffff',
    'ffffooffffooffff', fill('f')
  ]);
  T('t_icounter', { o: C.ink, a: C.brn0, b: C.brn1, c: C.brn3, f: WOOD }, [
    fill('f'), fill('o'), fill('c'),
    fill('b'), fill('b'), fill('a'),
    fill('o'), fill('b'), fill('b'),
    fill('b'), fill('b'), fill('b'),
    fill('b'), fill('b'), fill('a'), fill('o')
  ]);
  // The healing machine behind the Centre counter.
  T('t_ihealm', { o: C.ink, a: C.stn1, b: C.stn2, c: C.stn3, r: C.ctr1, w: C.white, f: WOOD }, [
    fill('f'), fill('o'), 'occcccccccccccco',
    'obwwwwwwwwwwwwbo', 'obwrwrwrwrwrwwbo', 'obwwwwwwwwwwwwbo',
    'obbbbbbbbbbbbbbo', 'obrrbbrrbbrrbbbo', 'obbbbbbbbbbbbbbo',
    'obbbbbbbbbbbbbbo', 'obaaabbaaabbaabo', 'obbbbbbbbbbbbbbo',
    'obbbbbbbbbbbbbbo', 'obbbbbbbbbbbbbbo', 'oaaaaaaaaaaaaaao',
    fill('o')
  ]);
  T('t_gfloor', { a: C.gfl0, b: C.gfl1, c: C.gfl2 }, [
    fill('c'), 'bbbbbbbbbbbbbbba', 'bbbbbbbbbbbbbbba',
    'bbbbbbbbbbbbbbba', 'bbbbbbbbbbbbbbba', 'bbbbbbbbbbbbbbba',
    'bbbbbbbbbbbbbbba', fill('a'), fill('c'),
    'bbbbbbbbbbbbbbba', 'bbbbbbbbbbbbbbba', 'bbbbbbbbbbbbbbba',
    'bbbbbbbbbbbbbbba', 'bbbbbbbbbbbbbbba', 'bbbbbbbbbbbbbbba',
    fill('a')
  ]);
  T('t_redcarpet', { a: C.red0, b: C.red1, c: C.red2, y: C.yel1 }, [
    fill('y'), 'ycccccccccccccay', 'ybbbbbbbbbbbbbay',
    'ybbbbbbbbbbbbbay', 'ybbbbbbbbbbbbbay', 'ybbbbbbbbbbbbbay',
    'ybbbbbbbbbbbbbay', 'ybbbbbbbbbbbbbay', 'ybbbbbbbbbbbbbay',
    'ybbbbbbbbbbbbbay', 'ybbbbbbbbbbbbbay', 'ybbbbbbbbbbbbbay',
    'ybbbbbbbbbbbbbay', 'ybbbbbbbbbbbbbay', 'yaaaaaaaaaaaaaay',
    fill('y')
  ]);
  T('t_statue', { o: C.ink, a: C.stn1, b: C.stn2, c: C.stn3, f: C.gfl2 }, [
    fill('f'), 'ffffffooooffffff', 'fffffocccbofffff',
    'fffffocbcbofffff', 'fffffobbbbofffff', 'ffffoobbbbooffff',
    'ffffocbbbbcoffff', 'ffffocbbbbcoffff', 'ffffoabbbbaoffff',
    'fffffobbbbofffff', 'fffffobbbbofffff', 'ffffoobbbboofffff'.slice(0, 16),
    'ffffocccccccoffff'.slice(0, 16), 'fffocbbbbbbbcoff', 'fffoaaaaaaaaaoff',
    'fffoooooooooooff'.slice(0, 16)
  ]);
  T('t_stairs', { o: C.ink, a: C.stn1, b: C.stn2, c: C.stn3 }, [
    fill('o'), 'occcccccccccccco', 'obbbbbbbbbbbbbbo',
    'oaaaaaaaaaaaaaao', fill('o'), 'occcccccccccccco',
    'obbbbbbbbbbbbbbo', 'oaaaaaaaaaaaaaao', fill('o'),
    'occcccccccccccco', 'obbbbbbbbbbbbbbo', 'oaaaaaaaaaaaaaao',
    fill('o'), 'occcccccccccccco', 'obbbbbbbbbbbbbbo', fill('o')
  ]);

  // ============================================================== CAVES =====
  // Mt. Moon and the Rock Tunnel — warm brown limestone, not the blue-grey
  // volcanic rock the Hoenn set used.
  function caveFloor(name, pal) {
    T(name, pal, [
      'bbbbbbbbbbbbbbbb', 'bcbbbbbbbabbbbbb', 'bbbbbabbbbbbbcbb',
      'bbbbbbbbbbbbbbbb', 'babbbbbcbbbbbbab', 'bbbbbbbbbbbbbbbb',
      'bbbbcbbbbbabbbbb', 'bbbbbbbbbbbbbbbb', 'bbabbbbbbbbbcbbb',
      'bbbbbbbabbbbbbbb', 'bcbbbbbbbbbbbbab', 'bbbbbbbbbbbbbbbb',
      'bbbbbabbbcbbbbbb', 'bbbbbbbbbbbbbbbb', 'babbbbbbbbbabbcb',
      'bbbbbbbbbbbbbbbb'
    ]);
  }
  // Walls have to be unmistakably NOT floor. The first pass shared the floor's
  // mid-tone and the two read as one surface at a glance, which is dangerous in
  // a cave where the whole game is "where can I actually walk". So the wall is
  // pushed down the ramp — dark body, a single bright cap on each course — and
  // ends up several steps darker than the floor it sits against.
  function caveWall(name, pal) {
    T(name, pal, [
      fill('d'), fill('c'), 'baabaaabaabaaaba',
      fill('a'), 'aoaaoaaoaaoaaoaa', fill('o'),
      'oooaoooaoooaooao', fill('o'),
      fill('c'), 'baabaaabaabaaaba',
      fill('a'), 'aoaaoaaoaaoaaoaa', fill('o'),
      'ooaoooaoooaoooao', fill('o'), fill('o')
    ]);
  }
  var CV  = { o: C.lim0, a: C.lim1, b: C.lim2, c: C.lim3, d: C.lim4 };
  var GRA = { o: C.gra0, a: C.gra1, b: C.gra2, c: C.gra3, d: C.gra4 };
  var IC  = { o: C.ice0, a: C.ice1, b: C.ice2, c: C.ice3, d: C.white };

  caveFloor('t_cavefloor', CV);   caveWall('t_cavewall', CV);
  // Cerulean Cave / Victory Road — darker granite, so the endgame reads harder.
  caveFloor('t_darkfloor', GRA);  caveWall('t_darkwall', GRA);
  // Seafoam Islands — ice over rock.
  caveFloor('t_icefloor', IC);    caveWall('t_icewall', IC);

  // ==================================================== SPECIAL INTERIORS ===
  // Pokemon Tower — cold violet stone. Lavender's tower should feel wrong.
  var TW = { o: C.twr0, a: C.twr1, b: C.twr2, c: C.pur3, w: C.pale };
  T('t_towerfloor', TW, [
    fill('a'), 'abaaaaaaaabaaaaa', 'aaaaaaaaaaaaaaaa',
    fill('o'), fill('a'), 'aaaabaaaaaaaabaa',
    'aaaaaaaaaaaaaaaa', fill('o'), fill('a'),
    'abaaaaaaabaaaaaa', 'aaaaaaaaaaaaaaaa', fill('o'),
    fill('a'), 'aaaaaabaaaaaaaba', 'aaaaaaaaaaaaaaaa', fill('o')
  ]);
  T('t_towerwall', TW, [
    fill('c'), 'bbbbbbbbbbbbbbba', 'bbbbbbbbbbbbbbba',
    fill('a'), fill('o'), 'bbbbbbbbbbbbbbba',
    'bbbbbbbbbbbbbbba', fill('a'), fill('o'),
    'bbbbbbbbbbbbbbba', 'bbbbbbbbbbbbbbba', fill('a'),
    fill('o'), 'bbbbbbbbbbbbbbba', 'bbbbbbbbbbbbbbba', fill('o')
  ]);
  // A grave marker in the tower.
  T('t_grave', TW, [
    fill('a'), 'aaaaaooooooaaaaa', 'aaaaowwwwwwoaaaa',
    'aaaaowwwwwwoaaaa', 'aaaaowwoowwoaaaa', 'aaaaowwwwwwoaaaa',
    'aaaaowwoowwoaaaa', 'aaaaowwwwwwoaaaa', 'aaaaowwwwwwoaaaa',
    'aaaaowwwwwwoaaaa', 'aaaaocccccccoaaa', 'aaaoooooooooaaaa',
    'aaocccccccccoaaa', 'aaocccccccccoaaa', 'aaooooooooooaaaa',
    fill('a')
  ]);

  // Silph Co. / Power Plant / Rocket Hideout — industrial steel plate.
  var MT = { o: C.mtl0, a: C.mtl1, b: C.mtl2, c: C.mtl3, d: C.mtl4 };
  T('t_metalfloor', MT, [
    fill('d'), 'dbbbbbbbdbbbbbbd', 'dbccccccdbccccbd',
    'dbcbbbbcdbcbbcbd', 'dbcbbbbcdbcbbcbd', 'dbccccccdbccccbd',
    'dbbbbbbbdbbbbbbd', fill('d'), 'dbbbbbbbdbbbbbbd',
    'dbccccccdbccccbd', 'dbcbbbbcdbcbbcbd', 'dbcbbbbcdbcbbcbd',
    'dbccccccdbccccbd', 'dbbbbbbbdbbbbbbd', fill('d'),
    'dbbbbbbbdbbbbbbd'
  ]);
  T('t_metalwall', MT, [
    fill('d'), fill('c'), 'cbbbbbbbbbbbbbba',
    'cbaaaaaaaaaaaaba', 'cbabbbbbbbbbbaba', 'cbabbbbbbbbbbaba',
    'cbaaaaaaaaaaaaba', 'cbbbbbbbbbbbbbba', fill('o'),
    fill('c'), 'cbbbbbbbbbbbbbba', 'cbaaaaaaaaaaaaba',
    'cbabbbbbbbbbbaba', 'cbaaaaaaaaaaaaba', 'cbbbbbbbbbbbbbba',
    fill('o')
  ]);

  // Indigo Plateau — pale marble. The end of the road should look expensive.
  var MB = { o: C.mrb0, a: C.mrb1, b: C.mrb2, c: C.mrb3, w: C.white };
  T('t_marble', MB, [
    fill('c'), 'cbccccccccccccbc', 'ccccccbccccccccc',
    fill('o'), fill('c'), 'ccccbccccccbcccc',
    fill('c'), fill('o'), fill('c'),
    'cbcccccccccccccc', 'ccccccccbccccccc', fill('o'),
    fill('c'), 'cccccbcccccccbcc', fill('c'), fill('o')
  ]);
  T('t_marblewall', MB, [
    fill('w'), fill('c'), 'cbbbbbbbbbbbbbbc',
    'cbbbbbbbbbbbbbbc', 'caaaaaaaaaaaaaac', fill('o'),
    fill('c'), 'cbbbbbbbbbbbbbbc', 'cbbbbbbbbbbbbbbc',
    'caaaaaaaaaaaaaac', fill('o'), fill('c'),
    'cbbbbbbbbbbbbbbc', 'cbbbbbbbbbbbbbbc', 'caaaaaaaaaaaaaac',
    fill('o')
  ]);

  // =============================================================== TILES ====
  // G.TILES — gameplay properties. img/anim reference the G.ART names above.
  G.TILES = {
    // ---- ground ----
    grass:     { img: 't_grass' },
    grass2:    { img: 't_grass2' },
    tallgrass: { img: 't_tallgrass', grass: true },
    flower:    { anim: ['t_flower1', 't_flower2'], animSpeed: 32 },
    path:      { img: 't_path' },
    path_n:    { img: 't_path_n' },
    path_s:    { img: 't_path_s' },
    path_e:    { img: 't_path_e' },
    path_w:    { img: 't_path_w' },
    sand:      { img: 't_sand' },

    // ---- decoration (scattered procedurally; never blocks) ----
    deco_flowerY: { img: 't_deco_flowerY' },
    deco_pebble:  { img: 't_deco_pebble' },
    deco_bush:    { img: 't_deco_bush' },
    deco_stump:   { img: 't_deco_stump' },
    deco_fern:    { img: 't_deco_fern' },

    // ---- water ----
    water:     { anim: ['t_water1', 't_water2', 't_water3', 't_water4'], animSpeed: 24, solid: true, water: true },
    deepwater: { anim: ['t_deepwater1', 't_deepwater2', 't_deepwater3', 't_deepwater4'], animSpeed: 24, solid: true, water: true },
    shore_n:   { img: 't_shore_n' },
    shore_s:   { img: 't_shore_s' },
    shore_w:   { img: 't_shore_w' },
    shore_e:   { img: 't_shore_e' },

    // ---- nature ----
    tree_tl:   { img: 't_tree_tl', solid: true },
    tree_tr:   { img: 't_tree_tr', solid: true },
    tree_bl:   { img: 't_tree_bl', solid: true },
    tree_br:   { img: 't_tree_br', solid: true },
    cuttree:   { img: 't_cuttree', solid: true, cut: true },
    boulder:   { img: 't_boulder', solid: true, strength: true },
    ledge:     { img: 't_ledge', ledge: 'down' },
    rock:      { img: 't_rock', solid: true },
    cliff:     { img: 't_cliff', solid: true },

    // ---- town ----
    fence:     { img: 't_fence', solid: true },
    sign:      { img: 't_sign', solid: true },
    wall:      { img: 't_wall', solid: true },
    window:    { img: 't_window', solid: true },
    door:      { img: 't_door', door: true },
    gdoor:     { img: 't_gdoor', door: true },
    gymdoor:   { img: 't_gymdoor', door: true },
    healsign:  { img: 't_healsign', solid: true },
    shopsign:  { img: 't_shopsign', solid: true },

    // ---- interiors ----
    ifloor:    { img: 't_ifloor' },
    iwall:     { img: 't_iwall', solid: true },
    imat:      { img: 't_imat' },
    itable:    { img: 't_itable', solid: true },
    ibook:     { img: 't_ibook', solid: true },
    imach:     { img: 't_imach', solid: true },
    ibed_t:    { img: 't_ibed_t', solid: true },
    ibed_b:    { img: 't_ibed_b', solid: true },
    iplant:    { img: 't_iplant', solid: true },
    istool:    { img: 't_istool', solid: true },
    icounter:  { img: 't_icounter', solid: true },
    ihealm:    { img: 't_ihealm', solid: true },
    gfloor:    { img: 't_gfloor' },
    redcarpet: { img: 't_redcarpet' },
    statue:    { img: 't_statue', solid: true },
    stairs:    { img: 't_stairs' },

    // ---- caves ----
    // Cave floors carry `grass: true` because in Gen 1 a cave has encounters on
    // EVERY tile, not in marked patches — walking through Mt. Moon is supposed
    // to be a running battle. The flag drives the encounter hook; the art is
    // still plain rock.
    cavefloor: { img: 't_cavefloor', cave: true, grass: true },
    cavewall:  { img: 't_cavewall', solid: true },
    darkfloor: { img: 't_darkfloor', cave: true, grass: true },
    darkwall:  { img: 't_darkwall', solid: true },
    icefloor:  { img: 't_icefloor', cave: true, grass: true },
    icewall:   { img: 't_icewall', solid: true },
    // A quiet cave tile for entrance chambers and junctions, where a battle
    // every other step would just be irritating.
    cavecalm:  { img: 't_cavefloor', cave: true },

    // ---- special interiors ----
    towerfloor: { img: 't_towerfloor' },
    towerwall:  { img: 't_towerwall', solid: true },
    grave:      { img: 't_grave', solid: true },
    metalfloor: { img: 't_metalfloor' },
    metalwall:  { img: 't_metalwall', solid: true },
    marble:     { img: 't_marble' },
    marblewall: { img: 't_marblewall', solid: true }
  };

  // Roof pieces are mechanical: five colour sets x seven pieces, all solid.
  // Registering them in a loop keeps the table honest — a missing piece would
  // be a silent hole in a building, so generating beats typing 35 lines.
  ['roof', 'hroof', 'sroof', 'groof', 'lroof'].forEach(function (r) {
    ['_tl', '_tm', '_tr', '_bl', '_bm', '_br', 'x'].forEach(function (p) {
      G.TILES[r + p] = { img: 't_' + r + p, solid: true };
    });
  });
})();
