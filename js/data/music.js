// Pokéram — music.js
// Songs as tracker pattern strings: 'NOTE:steps' at 16 steps per bar.
// Channels: pulse1 (lead), pulse2 (harmony), bass (triangle), perc (k/s/h).
// All patterns are 8 bars (128 steps) unless noted; loopBar = bar to loop from.

(function () {
  var S = G.SONGS = {};

  // ---------------------------------------------------------------- title --
  S.title = {
    bpm: 112, loopBar: 0,
    pulse1: 'A4:4 C5:4 E5:4 A5:4 G5:6 E5:2 G5:8 F5:4 A5:4 C6:4 A5:4 G5:12 E5:4 ' +
            'A5:4 G5:2 E5:2 D5:4 C5:4 D5:6 E5:2 D5:8 C5:4 E5:4 D5:4 B4:4 A4:16',
    pulse2: 'E4:8 A4:8 C4:8 E4:8 F4:8 A4:8 E4:8 B4:8 C5:8 A4:8 F4:8 A4:8 E4:8 G4:8 E4:8 E4:8',
    bass: 'A2:8 A2:8 C3:8 C3:8 F2:8 F2:8 G2:8 G2:8 A2:8 A2:8 F2:8 F2:8 G2:8 E2:8 A2:8 A2:8',
    perc: 'k:4 h:2 h:2 s:4 h:2 h:2 k:4 h:2 h:2 s:4 h:2 h:2 k:4 h:2 h:2 s:4 h:2 h:2 k:4 h:2 h:2 s:4 h:2 h:2 ' +
          'k:4 h:2 h:2 s:4 h:2 h:2 k:4 h:2 h:2 s:4 h:2 h:2 k:4 h:2 h:2 s:4 h:2 h:2 k:4 h:2 h:2 s:4 s:2 s:2'
  };

  // ----------------------------------------------------------------- town --
  S.town = {
    bpm: 100, loopBar: 0,
    pulse1: 'E5:4 G5:4 C5:6 -:2 D5:4 E5:4 G4:8 A4:4 C5:4 E5:6 -:2 D5:12 -:4 ' +
            'E5:4 G5:4 A5:6 -:2 G5:4 E5:4 D5:8 C5:4 D5:4 E5:4 D5:4 C5:12 -:4',
    pulse2: 'C4:8 E4:8 B3:8 D4:8 A3:8 C4:8 B3:8 B3:8 C4:8 E4:8 C4:8 E4:8 F4:8 D4:8 C4:8 C4:8',
    bass: 'C3:8 G2:8 G2:8 G2:8 A2:8 E2:8 G2:8 G2:8 C3:8 G2:8 A2:8 E2:8 F2:8 G2:8 C3:8 C3:8',
    perc: 'k:8 s:8 k:8 s:8 k:8 s:8 k:8 s:8 k:8 s:8 k:8 s:8 k:8 s:8 k:8 s:4 s:4'
  };

  // ---------------------------------------------------------------- route --
  S.route = {
    bpm: 132, loopBar: 0,
    pulse1: 'D5:2 -:2 F#5:2 -:2 A5:4 F#5:4 G5:2 A5:2 B5:4 A5:8 D5:2 -:2 F#5:2 -:2 A5:4 B5:4 A5:12 -:4 ' +
            'B5:4 A5:2 F#5:2 G5:4 E5:4 F#5:2 G5:2 A5:4 F#5:8 E5:4 F#5:2 G5:2 F#5:4 E5:4 D5:12 -:4',
    pulse2: 'F#4:8 A4:8 G4:8 B4:8 F#4:8 A4:8 F#4:8 D4:8 G4:8 B4:8 E4:8 A4:8 A4:8 G4:8 F#4:8 F#4:8',
    bass: 'D3:4 D3:4 A2:4 A2:4 B2:4 B2:4 F#2:4 F#2:4 D3:4 D3:4 A2:4 A2:4 D3:4 A2:4 D3:4 D3:4 ' +
          'G2:4 G2:4 D3:4 D3:4 B2:4 B2:4 F#2:4 F#2:4 A2:4 A2:4 E2:4 E2:4 D3:4 A2:4 D3:4 D3:4',
    perc: 'k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 ' +
          'k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 s:4 k:4 s:4'
  };

  // --------------------------------------------------------------- battle --
  S.battle = {
    bpm: 152, loopBar: 0,
    pulse1: 'E5:2 -:2 E5:2 G5:2 E5:2 D5:2 B4:4 C5:2 -:2 C5:2 E5:2 D5:2 C5:2 B4:2 A4:2 ' +
            'E5:2 -:2 E5:2 G5:2 A5:2 G5:2 E5:4 D5:2 E5:2 G5:2 E5:2 D5:8 ' +
            'G5:2 -:2 G5:2 B5:2 G5:2 F#5:2 D5:4 E5:2 -:2 E5:2 G5:2 F#5:2 E5:2 D5:2 B4:2 ' +
            'C5:2 D5:2 E5:2 G5:2 A5:2 B5:2 C6:4 B5:4 A5:2 G5:2 E5:8',
    pulse2: 'B4:8 G4:8 A4:8 E4:8 B4:8 C5:8 B4:8 B4:8 D5:8 B4:8 C5:8 B4:8 A4:8 C5:8 B4:8 G4:8',
    bass: 'E2:2 E2:2 E2:2 E2:2 E2:2 E2:2 G2:2 A2:2 A2:2 A2:2 A2:2 A2:2 A2:2 A2:2 C3:2 B2:2 ' +
          'E2:2 E2:2 E2:2 E2:2 E2:2 E2:2 G2:2 A2:2 B2:2 B2:2 B2:2 B2:2 B2:2 B2:2 D3:2 B2:2 ' +
          'G2:2 G2:2 G2:2 G2:2 G2:2 G2:2 B2:2 C3:2 C3:2 C3:2 C3:2 C3:2 C3:2 C3:2 E3:2 D3:2 ' +
          'A2:2 A2:2 A2:2 A2:2 C3:2 C3:2 D3:2 D3:2 E3:2 E3:2 B2:2 B2:2 E2:2 E2:2 E2:2 E2:2',
    perc: 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 ' +
          'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 ' +
          'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 ' +
          'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 k:2 h:2 s:2 h:2 s:2 s:2 s:2 s:2'
  };

  // ------------------------------------------------------------------ gym --
  S.gym = {
    bpm: 140, loopBar: 0,
    pulse1: 'C5:2 -:2 D#5:2 -:2 G5:4 D#5:2 C5:2 D5:2 -:2 F5:2 -:2 G#4:4 G4:4 ' +
            'C5:2 -:2 D#5:2 -:2 G5:4 G#5:2 G5:2 F5:2 D#5:2 D5:2 F5:2 D#5:8 ' +
            'G#5:4 G5:4 F5:4 D#5:4 D5:2 D#5:2 F5:4 D5:4 C5:2 D5:2 ' +
            'D#5:4 F5:4 G5:4 G#5:4 G5:8 C5:8',
    pulse2: 'G4:8 G4:8 F4:8 F4:8 G4:8 G#4:8 G4:8 G4:8 C5:8 G#4:8 F4:8 G4:8 G#4:8 G#4:8 G4:8 G4:8',
    bass: 'C3:2 C3:2 G2:2 C3:2 C3:2 C3:2 G2:2 C3:2 G#2:2 G#2:2 D#2:2 G#2:2 G2:2 G2:2 D2:2 G2:2 ' +
          'C3:2 C3:2 G2:2 C3:2 C3:2 C3:2 G2:2 C3:2 G#2:2 G#2:2 G2:2 G2:2 D#3:2 D3:2 C3:2 C3:2 ' +
          'G#2:4 G#2:4 F2:4 F2:4 D2:4 D2:4 G2:4 G2:4 D#3:4 D#3:4 G2:4 G2:4 C3:4 G2:4 C3:4 C3:4',
    perc: 'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 ' +
          'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 ' +
          'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 s:2 s:2 s:2'
  };

  // ------------------------------------------------------------- champion --
  S.champion = {
    bpm: 148, loopBar: 0,
    pulse1: 'A5:2 -:2 A5:2 B5:2 C6:4 B5:2 A5:2 G5:2 -:2 G5:2 A5:2 B5:8 ' +
            'A5:2 -:2 A5:2 B5:2 C6:4 D6:2 C6:2 B5:2 A5:2 G5:2 A5:2 B5:8 ' +
            'F5:4 A5:4 C6:4 A5:4 G5:4 B5:4 D6:4 B5:4 ' +
            'C6:4 B5:2 A5:2 G5:4 E5:4 A5:2 B5:2 C6:2 B5:2 A5:8',
    pulse2: 'E5:8 E5:8 E5:8 D5:8 E5:8 F5:8 E5:8 E5:8 C5:8 F5:8 D5:8 G5:8 E5:8 C5:8 E5:8 E5:8',
    bass: 'A2:2 A2:2 E2:2 A2:2 A2:2 A2:2 E2:2 A2:2 G2:2 G2:2 D2:2 G2:2 G2:2 G2:2 B2:2 G2:2 ' +
          'A2:2 A2:2 E2:2 A2:2 A2:2 A2:2 E2:2 A2:2 G2:2 G2:2 D2:2 G2:2 G2:2 G2:2 B2:2 G2:2 ' +
          'F2:4 F2:4 C3:4 C3:4 G2:4 G2:4 D3:4 D3:4 F2:4 G2:4 A2:4 E2:4 A2:4 A2:4 A2:4 A2:4',
    perc: 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 ' +
          'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 ' +
          'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 k:2 s:2 k:2 s:2 s:2 s:2 s:2 s:2'
  };

  // ----------------------------------------------------------------- cave --
  S.cave = {
    bpm: 88, loopBar: 0,
    pulse1: 'D5:8 -:8 F5:6 E5:2 D5:8 -:8 A4:12 -:4 ' +
            'D5:8 -:8 G5:6 F5:2 E5:8 -:8 D5:12 -:4',
    pulse2: '-:8 A4:4 -:4 -:16 -:8 F4:4 -:4 -:16 -:8 A#4:4 -:4 -:16 -:8 E4:4 -:4 -:16',
    bass: 'D2:16 D2:16 A#1:16 A1:16 D2:16 G1:16 A1:16 D2:16',
    perc: '-:8 h:2 -:6 -:16 -:8 h:2 -:6 -:16 -:8 h:2 -:6 -:16 -:8 h:2 -:6 -:14 h:2'
  };

  // ---------------------------------------------------------------- forest --
  // Gentle and a little mysterious — a flowing E-minor melody over a soft walking
  // bass and light hats, for wooded areas (Verdant Forest). Distinct from the
  // brighter overland 'route' and the sparse 'cave'.
  S.forest = {
    bpm: 118, loopBar: 0,
    pulse1: 'E5:4 G5:4 B5:4 A5:4 G5:6 E5:2 F#5:8 D5:4 E5:4 G5:4 A5:4 B5:8 -:8 ' +
            'A5:4 B5:4 C6:4 B5:4 A5:6 F#5:2 G5:8 E5:4 D5:4 E5:4 G5:4 E5:8 -:8',
    pulse2: 'E4:8 G4:8 A4:8 B4:8 C5:8 A4:8 B4:8 G4:8 A4:8 B4:8 C5:8 B4:8 A4:8 G4:8 E4:8 E4:8',
    bass: 'E2:8 E2:8 G2:8 G2:8 A2:8 A2:8 B2:8 B2:8 C3:8 C3:8 A2:8 A2:8 G2:8 G2:8 E2:8 E2:8',
    perc: 'k:4 h:4 h:4 h:4 k:4 h:4 h:4 h:4 k:4 h:4 h:4 h:4 k:4 h:4 h:4 h:4 ' +
          'k:4 h:4 h:4 h:4 k:4 h:4 h:4 h:4 k:4 h:4 h:4 h:4 k:4 h:4 s:4 h:4'
  };

  // --------------------------------------------------------------- evolve --
  S.evolve = {
    bpm: 130, loopBar: 0,
    pulse1: 'C5:2 E5:2 G5:2 C6:2 G5:2 E5:2 C5:2 E5:2 D5:2 F5:2 A5:2 D6:2 A5:2 F5:2 D5:2 F5:2 ' +
            'E5:2 G5:2 B5:2 E6:2 B5:2 G5:2 E5:2 G5:2 F5:2 A5:2 C6:2 F6:2 C6:4 B5:2 G5:2',
    pulse2: 'C4:16 D4:16 E4:16 F4:8 G4:8',
    bass: 'C3:16 D3:16 E3:16 F3:8 G3:8',
    perc: 'h:4 h:4 h:4 h:4 h:4 h:4 h:4 h:4 h:4 h:4 h:4 h:4 h:4 h:4 h:4 h:4'
  };

  // --------------------------------------------------------------- seaside --
  // Bright, breezy F-major lilt for coastal towns (Brinehollow, Mossdeep,
  // Sootopolis) — softer and airier than the brisk inland 'town' theme.
  S.seaside = {
    bpm: 96, loopBar: 0,
    pulse1: 'F5:4 A5:4 C6:6 -:2 A5:4 G5:4 F5:8 G5:4 A5:4 C6:6 -:2 D6:8 C6:4 ' +
            'A5:4 C6:4 D6:6 -:2 C6:4 A5:4 G5:8 F5:4 G5:4 A5:4 G5:4 F5:12 -:4',
    pulse2: 'A4:8 C5:8 G4:8 A4:8 F4:8 A4:8 C5:8 C5:8 F4:8 A4:8 C5:8 A4:8 G4:8 C5:8 A4:8 A4:8',
    bass: 'F2:8 C3:8 G2:8 G2:8 D2:8 A2:8 F2:8 C3:8 F2:8 C3:8 A2:8 F2:8 G2:8 C3:8 F2:8 F2:8',
    perc: 'k:8 s:8 k:8 s:8 k:8 s:8 k:8 s:8 k:8 s:8 k:8 s:8 k:8 s:8 k:8 s:4 h:4'
  };

  // ------------------------------------------------------------------ city --
  // Peppy, busy G-major bounce for the big city (Coilgate).
  S.city = {
    bpm: 124, loopBar: 0,
    pulse1: 'G5:2 -:2 B5:2 G5:2 D5:2 G5:2 B5:4 A5:2 -:2 D6:2 B5:2 G5:2 A5:2 B5:4 ' +
            'C6:2 -:2 C6:2 B5:2 A5:2 G5:2 E5:4 D5:2 E5:2 G5:2 A5:2 B5:8 ' +
            'G5:2 -:2 B5:2 D6:2 B5:2 A5:2 G5:4 D5:2 G5:2 B5:2 A5:2 G5:2 D5:2 B4:2 ' +
            'C5:2 D5:2 E5:2 G5:2 A5:2 B5:2 D6:4 B5:4 A5:2 G5:2 G5:8',
    pulse2: 'D4:8 G4:8 B3:8 D4:8 C4:8 E4:8 D4:8 D4:8 E4:8 G4:8 D4:8 G4:8 A4:8 D4:8 G4:8 G4:8',
    bass: 'G2:4 G2:4 D2:4 D2:4 C3:4 C3:4 G2:4 G2:4 E2:4 E2:4 D3:4 D3:4 G2:4 D2:4 G2:4 G2:4 ' +
          'C3:4 C3:4 G2:4 G2:4 A2:4 A2:4 E2:4 E2:4 D3:4 D3:4 G2:4 G2:4 G2:4 D2:4 G2:4 G2:4',
    perc: 'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 ' +
          'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 s:2 k:2 s:2'
  };

  // --------------------------------------------------------------- volcano --
  // Warm, faintly tense A-minor theme for the volcano town (Aurelune).
  S.volcano = {
    bpm: 108, loopBar: 0,
    pulse1: 'A4:4 C5:4 E5:6 -:2 D5:4 C5:4 A4:8 E5:4 G5:4 A5:6 -:2 G5:4 E5:4 D5:8 ' +
            'F5:4 E5:4 D5:6 -:2 C5:4 A4:4 G4:8 A4:4 C5:4 E5:4 D5:4 A4:12 -:4',
    pulse2: 'A3:8 E4:8 C4:8 E4:8 D4:8 A3:8 A3:8 E4:8 C4:8 E4:8 A3:8 C4:8 D4:8 E4:8 A3:8 A3:8',
    bass: 'A2:8 A2:8 E2:8 E2:8 D2:8 D2:8 A2:8 E2:8 F2:8 F2:8 C2:8 C2:8 D2:8 E2:8 A2:8 A2:8',
    perc: 'k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 ' +
          'k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 s:4 s:4 s:4'
  };

  // -------------------------------------------------------------- route 2 --
  // A brighter, marchier G-major route theme for the later overland routes.
  S.route2 = {
    bpm: 138, loopBar: 0,
    pulse1: 'G5:2 A5:2 B5:4 D6:2 B5:2 A5:4 G5:2 A5:2 B5:4 A5:2 G5:2 E5:4 ' +
            'D5:2 E5:2 G5:4 A5:2 B5:2 D6:4 B5:2 A5:2 G5:4 A5:2 B5:2 G5:8 ' +
            'B5:2 D6:2 G6:4 D6:2 B5:2 A5:4 G5:2 B5:2 D6:4 B5:2 G5:2 A5:4 ' +
            'B5:2 A5:2 G5:4 E5:2 D5:2 E5:4 G5:2 A5:2 B5:4 A5:2 G5:2 G5:8',
    pulse2: 'D4:8 G4:8 D4:8 B3:8 C4:8 E4:8 D4:8 G4:8 B3:8 D4:8 G4:8 D4:8 E4:8 D4:8 G4:8 G4:8',
    bass: 'G2:4 D3:4 G2:4 D3:4 C3:4 G2:4 C3:4 G2:4 E2:4 B2:4 E2:4 B2:4 D3:4 D2:4 G2:4 G2:4 ' +
          'G2:4 D3:4 G2:4 D3:4 C3:4 G2:4 C3:4 G2:4 E2:4 B2:4 D3:4 D2:4 G2:4 D3:4 G2:4 G2:4',
    perc: 'k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 ' +
          'k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 s:4 k:4 s:4'
  };

  // -------------------------------------------------------------- jingles --
  S.jingle_catch = { bpm: 140, pulse1: 'G5:2 G5:2 A5:2 B5:2 C6:10' };
  S.jingle_level = { bpm: 150, pulse1: 'C5:2 E5:2 G5:2 C6:8' };
  S.jingle_badge = { bpm: 140, pulse1: 'C5:2 E5:2 G5:2 C6:4 G5:2 C6:4 E6:10' };
  S.jingle_heal = { bpm: 150, pulse1: 'C6:2 G5:2 E5:2 G5:2 C6:8' };
})();
