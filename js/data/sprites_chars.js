// Pokéram — sprites_chars.js
// Overworld character sprites: 16x24, drawn with an 8px overhang above their
// tile (heads overlap the tile above). Naming: ch_<who>_<d|u|s><frame>.
// Side frames face LEFT; the decoder's mirror flag provides right-facing.
// Frame scheme: 0 = standing, 1 = stride (its mirror = the opposite stride).

(function () {
  var C = G.C;

  function S(name, pal, rows, mirror) {
    G.ART[name] = { w: 16, h: 24, pal: pal, px: rows, mirror: !!mirror };
  }

  // ------------------------------------------------------------- player ----
  // Messy brown hair, blue jacket with white zip, slate pants, red sneakers.
  var PC = {
    o: C.ink, h: C.brn1, i: C.brn2, s: C.skn2, t: C.skn1,
    j: C.blu2, k: C.blu1, w: C.white, p: C.stn1, e: C.red2
  };

  S('ch_player_d0', PC, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohhihhhhihho..',
    '..ohhhhhhhhhho..',
    '..ohshhhhhhsho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '...ojjjssjjjo...',
    '..ojjjjjjjjjjo..',
    '..ojjjjwwjjjjo..',
    '..okjjjwwjjjko..',
    '..osjjjwwjjjso..',
    '..ookjjjjjjkoo..',
    '....oppppppo....',
    '....oppooppo....',
    '....oeeooeeo....',
    '....ooo..ooo....'
  ]);

  S('ch_player_d1', PC, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohhihhhhihho..',
    '..ohhhhhhhhhho..',
    '..ohshhhhhhsho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '...ojjjssjjjo...',
    '..ojjjjjjjjjjo..',
    '..ojjjjwwjjjjo..',
    '..okjjjwwjjjko..',
    '..osjjjwwjjjso..',
    '..ookjjjjjjkoo..',
    '....oppppppo....',
    '....oeeooppo....',
    '....ooo.oeeo....',
    '........ooo.....'
  ], true);

  S('ch_player_u0', PC, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohhihhhhihho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohhihhhhihho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '...ohhhhhhhho...',
    '....oossssoo....',
    '...ojjjjjjjjo...',
    '..ojjjjjjjjjjo..',
    '..ojjjjjjjjjjo..',
    '..okjjjjjjjjko..',
    '..osjjjjjjjjso..',
    '..ookjjjjjjkoo..',
    '....oppppppo....',
    '....oppooppo....',
    '....oeeooeeo....',
    '....ooo..ooo....'
  ]);

  S('ch_player_u1', PC, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohhihhhhihho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohhihhhhihho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '...ohhhhhhhho...',
    '....oossssoo....',
    '...ojjjjjjjjo...',
    '..ojjjjjjjjjjo..',
    '..ojjjjjjjjjjo..',
    '..okjjjjjjjjko..',
    '..osjjjjjjjjso..',
    '..ookjjjjjjkoo..',
    '....oppppppo....',
    '....oeeooppo....',
    '....ooo.oeeo....',
    '........ooo.....'
  ], true);

  S('ch_player_s0', PC, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohhihhhhhhho..',
    '..ohhhhhhhhhho..',
    '..oshhhhhhhhho..',
    '..ossshhhhhhho..',
    '..osssshhhhhho..',
    '..ososssshhhho..',
    '..ossssshhhhho..',
    '...osssshhhho...',
    '....oossssoo....',
    '...ojjjjjjjjo...',
    '..ojjjjjjjjjjo..',
    '..ojjjjjjjjkko..',
    '..ojjjjjjjjkko..',
    '..osjjjjjjjkko..',
    '..ookjjjjjjkoo..',
    '.....opppppo....',
    '.....opppppo....',
    '.....oeeeeeo....',
    '.....oooooo.....'
  ], true);

  S('ch_player_s1', PC, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohhihhhhhhho..',
    '..ohhhhhhhhhho..',
    '..oshhhhhhhhho..',
    '..ossshhhhhhho..',
    '..osssshhhhhho..',
    '..ososssshhhho..',
    '..ossssshhhhho..',
    '...osssshhhho...',
    '....oossssoo....',
    '...ojjjjjjjjo...',
    '..ojjjjjjjjjjo..',
    '..ojjjjjjjjkko..',
    '..ojjjjjjjjkko..',
    '..osjjjjjjjkko..',
    '..ookjjjjjjkoo..',
    '....oppppppo....',
    '....oppooppo....',
    '...oeeo..oeeo...',
    '...ooo....ooo...'
  ], true);

  // ------------------------------------------------------ professor maple --
  // Swept gray hair, round glasses, white lab coat over dark slacks.
  var PR = {
    o: C.ink, h: C.gry, i: C.lgry, s: C.skn2, t: C.skn1,
    w: C.white, l: C.lgry, p: C.stn0, e: C.brn1
  };
  S('ch_prof_d0', PR, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohihhhhhhiho..',
    '..ohhhhhhhhhho..',
    '..ohshhhhhhsho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..osoosssoosso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '...owwwsswwwo...',
    '..owwwwwwwwwwo..',
    '..owwwwllwwwwo..',
    '..owwwwllwwwwo..',
    '..oswwwllwwwso..',
    '..oowwwwwwwwoo..',
    '..owwwwwwwwwwo..',
    '...oppoooppo....',
    '....oeeooeeo....',
    '....ooo..ooo....'
  ]);
  S('ch_prof_u0', PR, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohihhhhhhiho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohhihhhhihho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '...ohhhhhhhho...',
    '....oossssoo....',
    '...owwwwwwwwo...',
    '..owwwwwwwwwwo..',
    '..owwwwwwwwwwo..',
    '..owwwwwwwwwwo..',
    '..oswwwwwwwwso..',
    '..oowwwwwwwwoo..',
    '..owwwwwwwwwwo..',
    '...oppoooppo....',
    '....oeeooeeo....',
    '....ooo..ooo....'
  ]);
  S('ch_prof_s0', PR, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohihhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..oshhhhhhhhho..',
    '..ossshhhhhhho..',
    '..osssshhhhhho..',
    '..osoossshhhho..',
    '..ossssshhhhho..',
    '...osssshhhho...',
    '....oossssoo....',
    '...owwwwwwwwo...',
    '..owwwwwwwwllo..',
    '..owwwwwwwwllo..',
    '..owwwwwwwwllo..',
    '..oswwwwwwwllo..',
    '..oowwwwwwwwoo..',
    '..owwwwwwwwwwo..',
    '....oppopppo....',
    '.....oeeeeeo....',
    '.....oooooo.....'
  ], true);

  // ----------------------------------------------------------------- mom ----
  // Brown hair with a bun, cream blouse, long red skirt.
  var MO = {
    o: C.ink, h: C.brn1, i: C.brn2, s: C.skn2, t: C.skn1,
    w: C.tan1, r: C.red1, R: C.red2, e: C.brn1
  };
  S('ch_mom_d0', MO, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohihhhhhhiho..',
    '..ohhhhhhhhhho..',
    '..ohshhhhhhsho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '...owwwsswwwo...',
    '..owwwwwwwwwwo..',
    '..owwwwwwwwwwo..',
    '..oswwwwwwwwso..',
    '..oRRRRRRRRRRo..',
    '..oRRRRRRRRRRo..',
    '..oRRRrrrrRRRo..',
    '..oRRRRRRRRRRo..',
    '...oeeooooeeo...',
    '....oo....oo....'
  ]);
  S('ch_mom_u0', MO, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohihhhhhhiho..',
    '..ohhhoooohhho..',
    '..ohhoihhiohho..',
    '..ohhhoooohhho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '...ohhhhhhhho...',
    '....oossssoo....',
    '...owwwwwwwwo...',
    '..owwwwwwwwwwo..',
    '..owwwwwwwwwwo..',
    '..oswwwwwwwwso..',
    '..oRRRRRRRRRRo..',
    '..oRRRRRRRRRRo..',
    '..oRRRRRRRRRRo..',
    '..oRRRRRRRRRRo..',
    '...oeeooooeeo...',
    '....oo....oo....'
  ]);
  S('ch_mom_s0', MO, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohihhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..oshhhhhhhhho..',
    '..ossshhhhhhho..',
    '..osssshhhhhho..',
    '..ososssshhhho..',
    '..ossssshhhhho..',
    '...osssshhhho...',
    '....oossssoo....',
    '...owwwwwwwwo...',
    '..owwwwwwwwwwo..',
    '..owwwwwwwwwwo..',
    '..oswwwwwwwwso..',
    '..oRRRRRRRRRRo..',
    '..oRRRRRRRRRRo..',
    '..oRRRRRRRRRro..',
    '..oRRRRRRRRRRo..',
    '....oeeeeeo.....',
    '.....oooo.......'
  ], true);

  // ----------------------------------------------------------------- boy ----
  // Dark spiky hair, yellow tee, green shorts.
  var BO = {
    o: C.ink, h: C.dgry, i: C.gry, s: C.skn2, t: C.skn1,
    y: C.yel1, Y: C.yel2, g: C.grn1, e: C.blu1
  };
  S('ch_boy_d0', BO, [
    '................',
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohihhhhhhiho..',
    '..ohhhhhhhhhho..',
    '..ohshhhhhhsho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '...oyyyssyyyo...',
    '..oyyyyyyyyyyo..',
    '..oyyYYYYYYyyo..',
    '..oyyyyyyyyyyo..',
    '..osyyyyyyyyso..',
    '..ooyyyyyyyyoo..',
    '....oggggggo....',
    '....oggooggo....',
    '....oeeooeeo....',
    '....ooo..ooo....'
  ]);
  S('ch_boy_u0', BO, [
    '................',
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohihhhhhhiho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohhihhhhihho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '...ohhhhhhhho...',
    '....oossssoo....',
    '...oyyyyyyyyo...',
    '..oyyyyyyyyyyo..',
    '..oyyyyyyyyyyo..',
    '..oyyyyyyyyyyo..',
    '..osyyyyyyyyso..',
    '..ooyyyyyyyyoo..',
    '....oggggggo....',
    '....oggooggo....',
    '....oeeooeeo....',
    '....ooo..ooo....'
  ]);
  S('ch_boy_s0', BO, [
    '................',
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohihhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..oshhhhhhhhho..',
    '..ossshhhhhhho..',
    '..osssshhhhhho..',
    '..ososssshhhho..',
    '..ossssshhhhho..',
    '...osssshhhho...',
    '....oossssoo....',
    '...oyyyyyyyyo...',
    '..oyyyyyyyyyyo..',
    '..oyyyyyyyyYYo..',
    '..oyyyyyyyyyyo..',
    '..osyyyyyyyyso..',
    '..ooyyyyyyyyoo..',
    '.....ogggggo....',
    '.....ogggggo....',
    '.....oeeeeeo....',
    '.....oooooo.....'
  ], true);

  // ----------------------------------------------------------- Team Aqua ---
  // Same build as the boy walker, recolored: blue bandana + navy/teal outfit.
  var AQ = {
    o: C.ink, h: C.blu1, i: C.blu2, s: C.skn2, t: C.skn1,
    y: C.blu0, Y: C.ice0, g: C.stn0, e: '#3a3a4a'
  };
  S('ch_aqua_d0', AQ, G.ART.ch_boy_d0.px);
  S('ch_aqua_u0', AQ, G.ART.ch_boy_u0.px);
  S('ch_aqua_s0', AQ, G.ART.ch_boy_s0.px, true);

  // Nursery helper fallback: reuse the mom walker until her real sprite loads.
  S('ch_egglady_d0', MO, G.ART.ch_mom_d0.px);
  S('ch_egglady_u0', MO, G.ART.ch_mom_u0.px);
  S('ch_egglady_s0', MO, G.ART.ch_mom_s0.px, true);

  // ----------------------------------------------------- gym leaders -------
  // Eight gym leaders, each with a BESPOKE front (down) silhouette — the frame
  // the player sees them standing in on the gym floor: a hard hat, a headband,
  // spiky hair, long hair, a shirt-and-tie, a winged cape, a robed child, a
  // beret-and-cape. Their back/side frames are type-colored recolors of the
  // base walker (only shown if a leader turns, which they don't in-gym).
  function leaderBack(name, base, pal) {
    S('ch_' + name + '_u0', pal, G.ART['ch_' + base + '_u0'].px);
    S('ch_' + name + '_s0', pal, G.ART['ch_' + base + '_s0'].px, true);
  }

  // 1) BRAM — rock. Orange hard hat, stone work-coat. ----------------------
  var P_bram = { o: C.ink, h: C.brn0, i: C.brn1, s: C.skn2, t: C.skn1, w: C.stn2, l: C.stn1, p: C.stn0, e: C.brn0, H: C.org2, J: C.org1 };
  leaderBack('bram', 'prof', P_bram);
  S('ch_bram_d0', P_bram, [
    '................',
    '......HHHH......',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '..oHHHHHHHHHHo..',
    '..oJJJJJJJJJJo..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '...owwwsswwwo...',
    '..owwwwwwwwwwo..',
    '..owwwwllwwwwo..',
    '..owwwwllwwwwo..',
    '..oswwwllwwwso..',
    '..oowwwwwwwwoo..',
    '..owwwwwwwwwwo..',
    '...oppoooppo....',
    '....oeeooeeo....',
    '....ooo..ooo....'
  ]);

  // 2) MARIS — fighting. Red headband + topknot, crimson gi. ---------------
  var P_maris = { o: C.ink, h: C.dgry, i: C.gry, s: C.skn2, t: C.skn1, w: C.red3, r: C.red0, R: C.red1, e: C.brn0, b: C.red2 };
  leaderBack('maris', 'mom', P_maris);
  S('ch_maris_d0', P_maris, [
    '.......hh.......',
    '......hhhh......',
    '....hhhhhhhh....',
    '...hhhhhhhhhh...',
    '..ohhhhhhhhhho..',
    '..obbbbbbbbbbo..',
    '..ohssssssssho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '...owwwsswwwo...',
    '..owwwwwwwwwwo..',
    '..owwwwwwwwwwo..',
    '..oswwwwwwwwso..',
    '..oRRRRRRRRRRo..',
    '..oRRRRRRRRRRo..',
    '..oRRRrrrrRRRo..',
    '..oRRRRRRRRRRo..',
    '...oeeooooeeo...',
    '....oo....oo....'
  ]);

  // 3) TESS — electric. Spiky lightning hair, yellow dress. ----------------
  var P_tess = { o: C.ink, h: C.yel1, i: C.yel2, s: C.skn2, t: C.skn1, w: C.white, r: C.yel0, R: C.yel1, e: C.brn1 };
  leaderBack('tess', 'mom', P_tess);
  S('ch_tess_d0', P_tess, [
    '...o..o..o..o...',
    '..ohohohohohho..',
    '..ohhhhhhhhhho..',
    '..ohihhhhhhiho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohssssssssho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '...owwwsswwwo...',
    '..owwwwwwwwwwo..',
    '..owwwwwwwwwwo..',
    '..oswwwwwwwwso..',
    '..oRRRRRRRRRRo..',
    '..oRRRRRRRRRRo..',
    '..oRRRrrrrRRRo..',
    '..oRRRRRRRRRRo..',
    '...oeeooooeeo...',
    '....oo....oo....'
  ]);

  // 4) VESPER — fire. Long flowing hair past the shoulders, orange dress. --
  var P_vesper = { o: C.ink, h: C.org1, i: C.org2, s: C.skn2, t: C.skn1, w: C.org3, r: C.org0, R: C.org1, e: C.brn0 };
  leaderBack('vesper', 'mom', P_vesper);
  S('ch_vesper_d0', P_vesper, [
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohihhhhhhiho..',
    '..ohhhhhhhhhho..',
    '..ohshhhhhhsho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '..howwwsswwwoh..',
    '.howwwwwwwwwwoh.',
    '.howwwwwwwwwwoh.',
    '..oswwwwwwwwso..',
    '..oRRRRRRRRRRo..',
    '..oRRRRRRRRRRo..',
    '..oRRRrrrrRRRo..',
    '..oRRRRRRRRRRo..',
    '..oRRRRRRRRRRo..',
    '...oeeooooeeo...',
    '....oo....oo....'
  ]);

  // 5) NORMAN — normal. Neat hair, navy suit with a red tie. ---------------
  var P_norman = { o: C.ink, h: C.brn1, i: C.brn2, s: C.skn2, t: C.skn1, w: C.blu0, l: C.stn0, p: C.stn0, e: C.ink, T: C.red2 };
  leaderBack('norman', 'prof', P_norman);
  S('ch_norman_d0', P_norman, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '...owwwTTwwwo...',
    '..owwwwTTwwwwo..',
    '..owwwwTTwwwwo..',
    '..owwwwllwwwwo..',
    '..oswwwllwwwso..',
    '..oowwwwwwwwoo..',
    '..owwwwwwwwwwo..',
    '...oppoooppo....',
    '....oeeooeeo....',
    '....ooo..ooo....'
  ]);

  // 6) WINONA — flying. Lavender bob, sky-blue winged cape. ----------------
  var P_winona = { o: C.ink, h: C.pur2, i: C.pur3, s: C.skn2, t: C.skn1, w: C.sky1, r: C.blu1, R: C.blu2, e: C.stn0 };
  leaderBack('winona', 'mom', P_winona);
  S('ch_winona_d0', P_winona, [
    '................',
    '......oooo......',
    '....oohhhhoo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '..owwwwwwwwwwo..',
    '.owwwwwwwwwwwwo.',
    'owwwwwwwwwwwwwwo',
    'owwwwwwwwwwwwwwo',
    'owwwRRRRRRRRwwwo',
    '.owwwwwwwwwwwwo.',
    '..owwwwwwwwwwo..',
    '...orrrrrrrro...',
    '....oeeooeeo....',
    '.....o....o.....',
    '................'
  ]);

  // 7) TATE — psychic. Round mushroom hair, long purple robe (a child). ----
  var P_tate = { o: C.ink, h: C.pur1, i: C.pur2, s: C.skn2, t: C.skn1, y: C.pur2, Y: C.pur3, g: C.pur0, e: C.dgry };
  leaderBack('tate', 'boy', P_tate);
  S('ch_tate_d0', P_tate, [
    '................',
    '....oooooooo....',
    '..oohhhhhhhhoo..',
    '.ohhhhhhhhhhhho.',
    '.ohhhhhhhhhhhho.',
    '.ohhhhhhhhhhhho.',
    '..ohhhhhhhhhho..',
    '..ohshhhhhhsho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..ossossssosso..',
    '...osssssssso...',
    '....oossssoo....',
    '...oyyyssyyyo...',
    '..oyyyyyyyyyyo..',
    '..oyyyYYYYyyyo..',
    '..oyyyyyyyyyyo..',
    '..oyyyyyyyyyyo..',
    '..oyyyyyyyyyyo..',
    '..oyyyyyyyyyyo..',
    '..oyyyyyyyyyyo..',
    '..oyyyyyyyyyyo..',
    '...oeeeeeeeeo...',
    '....oo..oo......'
  ]);

  // 8) WALLACE — water. Cyan beret + long flowing cape. --------------------
  var P_wallace = { o: C.ink, h: C.ice0, i: C.ice1, s: C.skn2, t: C.skn1, w: C.ice2, l: C.ice0, p: C.blu0, e: C.ink, B: C.ice1 };
  leaderBack('wallace', 'prof', P_wallace);
  S('ch_wallace_d0', P_wallace, [
    '................',
    '.....BBBBBB.....',
    '...BBBBBBBBBo...',
    '..oBBBBBBBBBho..',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohssssssssho..',
    '..osssssssssso..',
    '..osssssssssso..',
    '..ossossssosso..',
    '..osssssssssso..',
    '...osssssssso...',
    '....oossssoo....',
    '..owwwwwwwwwwo..',
    '.owwwwwwwwwwwwo.',
    'owwwwwwwwwwwwwwo',
    'owwwwllllllwwwwo',
    'owwwwwwwwwwwwwwo',
    '.owwwwwwwwwwwwo.',
    '..owwwwwwwwwwo..',
    '...owwwwwwwwo...',
    '....oppppppo....',
    '....oeeooeeo....',
    '....ooo..ooo....'
  ]);

  // -------------------------------------------------------- starter orb -----
  // A capture orb resting on a stand (interactable in the lab).
  G.ART.orb_stand = {
    w: 16, h: 16,
    pal: { o: G.C.ink, r: G.C.red2, q: G.C.red1, w: G.C.white, l: G.C.lgry, s: G.C.stn2, v: G.C.stn3 },
    px: [
      '................',
      '.....oooooo.....',
      '....orrrrrro....',
      '...orwwrrrrro...',
      '...orwrrrrrro...',
      '...orrrrrrrro...',
      '...oooooooooo...',
      '...owwwwwwwwo...',
      '...olwwwwwwlo...',
      '....owwwwwwo....',
      '.....oooooo.....',
      '....ovvvvvvo....',
      '...ovssssssvo...',
      '...osssssssso...',
      '...oooooooooo...',
      '................'
    ]
  };
})();
