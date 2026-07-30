// Pokéram — sprites_ui.js
// UI furniture: textbox 9-slice frame, menu cursor, '!' balloon, grass rustle.

(function () {
  var C = G.C;

  // GBA-style textbox frame: ink outline, blue ring, white fill. 9-sliced
  // with 4px corners.
  G.ART.ui_box = {
    w: 24, h: 24,
    pal: { o: C.ink, b: C.blu2, w: C.white },
    px: [
      '....oooooooooooooooo....',
      '..oobbbbbbbbbbbbbbbboo..',
      '.obbwwwwwwwwwwwwwwwwbbo.',
      '.obwwwwwwwwwwwwwwwwwwbo.',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      'obwwwwwwwwwwwwwwwwwwwwbo',
      '.obwwwwwwwwwwwwwwwwwwbo.',
      '.obbwwwwwwwwwwwwwwwwbbo.',
      '..oobbbbbbbbbbbbbbbboo..',
      '....oooooooooooooooo....'
    ]
  };

  // Dark panel variant (used by battle/menu chrome later).
  G.ART.ui_box_dark = {
    base: 'ui_box',
    pal: { o: C.ink, b: C.stn1, w: C.stn3 }
  };

  G.ART.ui_cursor = {
    w: 6, h: 7,
    pal: { o: C.dgry },
    px: [
      'o.....',
      'oo....',
      'oooo..',
      'oooooo',
      'oooo..',
      'oo....',
      'o.....'
    ]
  };

  G.ART.ui_balloon = {
    w: 16, h: 16,
    pal: { o: C.ink, w: C.white, r: C.red2 },
    px: [
      '..oooooooooo....',
      '.owwwwwwwwwwo...',
      '.owwwwrrwwwwo...',
      '.owwwwrrwwwwo...',
      '.owwwwrrwwwwo...',
      '.owwwwrrwwwwo...',
      '.owwwwrrwwwwo...',
      '.owwwwwwwwwwo...',
      '.owwwwrrwwwwo...',
      '.owwwwrrwwwwo...',
      '.owwwwwwwwwwo...',
      '..oooowwoooo....',
      '.....owwo.......',
      '......owo.......',
      '.......o........',
      '................'
    ]
  };

  // grass rustle overlay drawn at an actor's feet while in tall grass
  G.ART.fx_rustle = {
    w: 16, h: 16,
    pal: { a: C.grn1, c: C.grn2 },
    px: [
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
      '...a........a...',
      '..aca......aca..',
      '.accca....accca.',
      '.accca....accca.',
      'aacccaa..aacccaa',
      'aaacaaa..aaacaaa'
    ]
  };
})();
