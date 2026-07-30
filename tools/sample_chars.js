// pokemon-kanto — tools/sample_chars.js
// HAND-AUTHORED overworld character samples, for the style comparison against
// the streamed pret/pokefirered sheets. Not loaded by the game.
//
// Format matches the engine's: 16x24 palette-indexed grids, drawn with an 8px
// overhang above the character's tile so heads overlap the tile above. Down-
// facing idle frame only — that is the one you see most.
//
// Style contract (palettes.js): outline in ink, shading steps down the local
// ramp rather than to black, light from the upper-left, no baked drop shadow.

module.exports = function (C) {
  var chars = {};
  function S(name, label, pal, rows) { chars[name] = { label: label, pal: pal, px: rows }; }

  // ------------------------------------------------------------------ RED --
  // Red cap with a white front panel, brown hair, blue jacket with a white
  // flash, dark jeans, red trainers.
  S('red', 'Red (player)', {
    o: C.ink, c: '#d0322f', d: '#8f1f1e', w: C.white,
    s: C.skn2, t: C.skn1, h: C.brn1,
    j: '#2f5fa8', k: '#1d3f78', p: '#39415c', e: '#c0392b'
  }, [
    '................',
    '...oooooooo.....',
    '..occccccccо....'.replace('о', 'o'),
    '..occcccccco....',
    '..owwwwwwwwo....',
    '..oddddddddo....',
    '..ohsssssshо....'.replace('о', 'o'),
    '..oso oossoso...'.replace(' ', 'o').slice(0, 16),
    '..ossssssssso...',
    '..otttttttto....',
    '...oooooooo.....',
    '...ojjjjjjo.....',
    '..ojjjwwjjjo....',
    '..ojjjwwjjjo....',
    '..ojjjjjjjjo....',
    '..sjjjjjjjjs....',
    '..sojjjjjjos....',
    '...ojjjjjjo.....',
    '...opppppppo....',
    '...oppppppo.....',
    '...opppoppo.....',
    '...opppoppo.....',
    '...oeeoooeo.....',
    '....oo...oo.....'
  ]);

  // --------------------------------------------------------------- PROF OAK -
  // White lab coat, grey hair, brown slacks. Reads as an authority figure at a
  // glance because he is the only sprite in the cast wearing all white.
  S('oak', 'Prof. Oak', {
    o: C.ink, g: '#b8b8c4', f: '#8a8a9a', w: C.white, v: '#d8d8e4',
    s: C.skn2, t: C.skn1, p: '#6b5238', e: '#3a2a20', r: '#a03030'
  }, [
    '................',
    '...oooooooo.....',
    '..oggggggggo....',
    '..offfffffgo....',
    '..ogsssssgfo....',
    '..ossssssso.....',
    '..ossssssso.....',
    '..osoossooso....',
    '..ossssssso.....',
    '..ottttttto.....',
    '...oooooooo.....',
    '...owwwwwwo.....',
    '..owwwrwwwwo....',
    '..owvwrwwwvo....',
    '..owwwwwwwwo....',
    '..swwwwwwwws....',
    '..sowwwwwwos....',
    '...owwwwwwo.....',
    '...owwwwwwo.....',
    '...oppppppo.....',
    '...opppoppo.....',
    '...opppoppo.....',
    '...oeeoooeo.....',
    '....oo...oo.....'
  ]);

  // ------------------------------------------------------------------ BROCK -
  // Spiked brown hair, permanently-closed eyes, orange vest over green. The
  // silhouette is the identifier: nobody else in Kanto has that hair.
  S('brock', 'Brock', {
    o: C.ink, h: '#6b4a2a', i: '#8a6238', s: C.skn1, t: C.skn0,
    v: '#d4762a', k: '#a05418', g: '#3f7a4a', p: '#4a4a58', e: '#2a2a34'
  }, [
    '................',
    '..o.oo.oo.o.....',
    '..ohohhohho.....',
    '..ohhhhhhhho....',
    '..oihhhhhhio....',
    '..osssssssо....'.replace('о', 'o'),
    '..ossssssso.....',
    '..ottoottoо....'.replace('о', 'o'),
    '..ossssssso.....',
    '..otttttttо....'.replace('о', 'o'),
    '...oooooooo.....',
    '...ovvvvvvo.....',
    '..ovvgggvvo.....',
    '..ovvgggvvvo....',
    '..ovvvvvvvvo....',
    '..svvvvvvvvs....',
    '..sovvvvvvos....',
    '...okkkkkko.....',
    '...oppppppo.....',
    '...oppppppo.....',
    '...opppoppo.....',
    '...opppoppo.....',
    '...oeeoooeo.....',
    '....oo...oo.....'
  ]);

  // ------------------------------------------------------------ BUG CATCHER -
  // Straw hat, green shorts, net. The class silhouette matters more than the
  // face at this size — you should know what they are before you talk to them.
  S('bugcatcher', 'Bug Catcher', {
    o: C.ink, y: '#e0c060', z: '#b09030', s: C.skn2, t: C.skn1,
    w: C.white, g: '#4a8a3a', k: '#2f5f26', e: '#5a4030', n: '#c8c8d8'
  }, [
    '................',
    '..oooooooooo....',
    '.oyyyyyyyyyyo...',
    '.ozzzzzzzzzzo...',
    '..oooooooooo....',
    '...osssssso.....',
    '...osssssso.....',
    '...osoososo.....',
    '...osssssso.....',
    '...ottttto......',
    '....oooooo......',
    '...owwwwwwo..n..',
    '..owwwwwwwwo.n..',
    '..owwwwwwwwonno.',
    '..owwwwwwwwonno.',
    '..swwwwwwwwsnno.',
    '..sowwwwwwos.n..',
    '...oggggggo..n..',
    '...oggggggo.....',
    '...ogggoggo.....',
    '...ossso sso....'.replace(' ', 'o').slice(0, 16),
    '...osssossso....',
    '...oeeoooeeo....',
    '....oo...oo.....'
  ]);

  return chars;
};
