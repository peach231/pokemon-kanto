// Pokéram — palettes.js
// THE master region palette. Every sprite in the game picks its colors from
// here (sprite files reference G.C by name, so membership is guaranteed by
// construction). GBA-style 4-step ramps, dark → light.
//
// Style contract for all pixel art:
//   • outline: G.C.ink for every creature/character silhouette
//   • interior shading: sel-out (darker step of the local ramp), never pure black
//   • light source: upper-left, always
//   • per-sprite palettes: 8–12 colors max
//   • shadows are drawn by renderers, never baked into sprites

(function () {
  G.C = {
    // ink + neutrals
    ink:   '#1a1c2c',
    dgry:  '#3a3a4a',
    gry:   '#6e6e84',
    lgry:  '#a8a8bc',
    pale:  '#d8d8e4',
    white: '#f4f4f4',

    // ---- KANTO is temperate, not tropical -------------------------------
    // The inherited Hoenn ramps were warm and saturated — jungle greens, red
    // earth, bleached sand. Kanto is deciduous woodland and grey stone, so the
    // greens are cooler and deeper, the browns are loam rather than clay, and
    // the stone loses its blue cast. Every sprite in the game reads from these
    // names, so shifting them here re-tints the whole world at once; the tile
    // art on top of it is drawn fresh.

    // foliage greens (trees, deep plants) — cooler, bluer, less lime
    grn0: '#123526', grn1: '#1c5c3c', grn2: '#2f8c50', grn3: '#5fb873',

    // ground greens (grass fields) — muted meadow, not tropical
    leaf0: '#356b45', leaf1: '#4c9152', leaf2: '#6cb062', leaf3: '#92cc80',

    // water blues
    blu0: '#16345f', blu1: '#2458ac', blu2: '#4386d2', blu3: '#86c2ec',

    // sky
    sky0: '#6cb0e4', sky1: '#a8d8f8',

    // earth browns — damp loam and bark, not red clay
    brn0: '#33251c', brn1: '#5e4630', brn2: '#8a6a4a', brn3: '#b8946c',

    // warm tans (dirt paths, beach sand)
    tan0: '#d8bc92', tan1: '#eedcb4',

    // stone — neutral grey for cliffs, caves, Mt. Moon, Indigo marble
    stn0: '#2c2c33', stn1: '#54545e', stn2: '#8b8b96', stn3: '#c4c4cc',

    // ---- Kanto-specific building colours --------------------------------
    // Gen 1's towns are read at a glance by roof colour: Centres are red,
    // Marts are blue, gyms are slate, houses are terracotta.
    ctr0: '#7a1f24', ctr1: '#bc3038', ctr2: '#e0585c',   // Pokemon Centre roof
    mrt0: '#173f74', mrt1: '#2a6cb4', mrt2: '#4e9ada',   // Poke Mart roof
    gym0: '#3a3f4c', gym1: '#5c6474', gym2: '#8892a4',   // gym slate roof
    hse0: '#8a3a22', hse1: '#c05e34', hse2: '#e08a54',   // house terracotta
    brk0: '#6a3a30', brk1: '#9c5c48', brk2: '#c08468',   // brick / Pewter stone
    twr0: '#2a1c38', twr1: '#4a3660', twr2: '#6e548a',   // Pokemon Tower stone

    // reds
    red0: '#5a1a28', red1: '#9e2a3a', red2: '#d04a48', red3: '#f08060',

    // fire oranges
    org0: '#8e3a1a', org1: '#d06028', org2: '#f09838', org3: '#f8cc70',

    // yellows
    yel0: '#b08818', yel1: '#e8c038', yel2: '#f8e878',

    // purples (psychic/ghost/shadow)
    pur0: '#2a1a40', pur1: '#4a2a6a', pur2: '#7a4aa8', pur3: '#b080d8',

    // pinks (fairy)
    pnk0: '#a04068', pnk1: '#d878a0', pnk2: '#f0b0c8',

    // skin tones
    skn0: '#8a4a30', skn1: '#d08858', skn2: '#f0b888', skn3: '#fce0c0',

    // ice cyans
    ice0: '#2a6a8e', ice1: '#5cb4cc', ice2: '#a0e0e8', ice3: '#e0f8f8',

    // ---- special interiors -----------------------------------------------
    // Silph Co. / Power Plant / Rocket Hideout: industrial steel plate.
    mtl0: '#1e222b', mtl1: '#333a47', mtl2: '#4a5464', mtl3: '#66738a', mtl4: '#8a97ad',
    // Indigo Plateau marble. The end of the road should look expensive.
    mrb0: '#5a5468', mrb1: '#8d879e', mrb2: '#b8b2c6', mrb3: '#d9d5e2',
    // Mt. Moon limestone (warm) and Victory Road granite (cold).
    lim0: '#241a14', lim1: '#3d2c20', lim2: '#584134', lim3: '#75594a', lim4: '#8f7160',
    gra0: '#141420', gra1: '#242436', gra2: '#38384e', gra3: '#4e4e68', gra4: '#6a6a86',
    // Indoor floorboards and plaster.
    wud0: '#9a7a54', wud1: '#b8946c', wud2: '#cfae86',
    // Pokemon Mansion — charred timber. Warm enough to have been a house,
    // dark enough that it plainly is not one any more.
    brn0: '#1c1410', brn1: '#30231a', brn2: '#463228', brn3: '#5e4436', brn4: '#7a5a46',
    pls0: '#5c6a86', pls1: '#7d8aa6', pls2: '#9daac4',
    // Gym floor.
    gfl0: '#4a5568', gfl1: '#5f6d84', gfl2: '#77879e'
  };

  // UI text colors (GBA convention: dark gray text, light gray drop shadow).
  G.UI = {
    text:       G.C.dgry,
    textShadow: G.C.lgry,
    textLight:  G.C.white,
    textLightShadow: '#5a5a6e',
    hpGreen:  '#58c048',
    hpYellow: '#e8b830',
    hpRed:    '#d84848',
    expBlue:  '#48a0d8'
  };

  // Type display colors (battle UI chips, dex).
  G.TYPE_COLORS = {
    normal: '#9a9a7c', fire: '#e0682c', water: '#3878d8', grass: '#58a838',
    electric: '#e8c020', ice: '#7cc8c8', fighting: '#b03028', poison: '#9040a0',
    ground: '#d0a850', flying: '#8898e8', psychic: '#e85888', bug: '#a0b020',
    rock: '#b09848', ghost: '#6858a0', dragon: '#6038e8', dark: '#504058',
    steel: '#a8a8c0', fairy: '#e898e0'
  };
})();

