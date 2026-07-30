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

    // foliage greens (trees, deep plants)
    grn0: '#14402e', grn1: '#1f6e44', grn2: '#3fa757', grn3: '#7ed27d',

    // ground greens (grass fields — lighter, warmer)
    leaf0: '#3c7e4c', leaf1: '#58aa5c', leaf2: '#7cc86c', leaf3: '#a0e08c',

    // water blues
    blu0: '#1a3a6e', blu1: '#2860c0', blu2: '#4a90e0', blu3: '#8cc8f0',

    // sky
    sky0: '#6cb0e4', sky1: '#a8d8f8',

    // earth browns
    brn0: '#3c2a20', brn1: '#6e4a30', brn2: '#9c6e48', brn3: '#c89868',

    // warm tans (paths, sand)
    tan0: '#e8c898', tan1: '#f4e0b8',

    // stone (bluish grays for cliffs/caves/steel)
    stn0: '#2e2e3e', stn1: '#54546c', stn2: '#8a8aa4', stn3: '#c2c2d6',

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
    ice0: '#2a6a8e', ice1: '#5cb4cc', ice2: '#a0e0e8', ice3: '#e0f8f8'
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

