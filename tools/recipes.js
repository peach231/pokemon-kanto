// Pokéram — tools/recipes.js
// Hand-written shape recipes for every creature sprite. Each recipe draws
// onto a Grid (see spritegen.js): fills first, outline once, then features
// (eyes, mouths, markings) on top. Char 'K' is reserved for eye shine.
// Palettes reference master palette names resolved at bake time.

'use strict';

// pal values are master-palette keys (resolved against G.C at bake time)
const R = {};

// ============================================================ SPROUTLE ====
// Squirtle formula, grass type: upright biped — big wide head, shell
// WRAPPING the torso (cream plastron framed by brown rim on the front),
// green arms in front of the shell, splayed stubby legs, leaf tail.
R.sproutle = {
    pal: {
      o: 'ink',
      g: 'leaf2', h: 'leaf3', e: 'leaf1', d: 'leaf0', // skin greens
      s: 'brn2', u: 'brn3', t: 'brn1',                // shell browns
      w: 'tan1', v: 'tan0',                           // plastron cream
      f: 'grn2', F: 'grn3',                           // crown leaf
      K: 'white'
    },
    draw(g) {
      // --- splayed feet (drawn first, sit under the shell) ---
      g.ellipse(16, 43, 4, 3, 'g');
      g.ellipse(30, 43, 4, 3, 'g');
      g.set(13, 44, 'd'); g.set(14, 44, 'd');   // toe shadow hints
      g.set(33, 44, 'd'); g.set(34, 44, 'd');
      // --- curly tail: rooted inside the shell, tight chunky curl ---
      g.line(32, 40, 38, 41, 'g', 4);            // base inside body
      g.line(38, 41, 41, 38, 'g', 3);            // tight curl up
      g.set(41, 36, 'h'); g.set(40, 35, 'h');    // chunky 2px tip
      // --- shell torso: one solid brown mass; head fuses on top of it ---
      g.ball(23, 35, 12, 10, 's', 'u', 't');
      g.ring(23, 35, 12, 10, 'w', 0.2, 16, 164);
      g.ellipse(21, 36, 7, 7, 'w');
      g.line(17, 38, 26, 38, 'v', 1);            // plastron belly seam
      // --- big round head fused directly onto the shell (overlap so no gap) ---
      g.ball(19, 18, 11, 10, 'g', 'h', 'e');
      g.ellipse(9, 22, 3, 3, 'g');
      g.ellipse(28, 22, 3, 3, 'e');
      // --- stubby arms IN FRONT of the shell, thick rounded strokes ---
      g.line(15, 31, 11, 37, 'h', 4);            // near arm (lighter to pop)
      g.line(31, 32, 35, 36, 'e', 4);            // far arm (short stub)
      g.ellipse(35, 37, 2, 2, 'e');              // far hand
      // --- one leaf resting on the crown: short stem + rounded blade ---
      g.line(21, 11, 24, 7, 'e', 2);
      g.ellipse(27, 6, 5, 3, 'f');
      g.set(31, 4, 'f'); g.set(32, 4, 'F');
      g.line(23, 7, 30, 5, 'F', 1);
      g.outline('o');
      g.seam(['w', 'v'], ['s', 't', 'u'], 'o');
      g.seam(['g', 'h', 'e'], ['s', 't', 'u', 'w'], 'o');
      g.seam(['h', 'e'], ['w', 'v'], 'o');
      g.seam(['f', 'F'], ['g', 'h', 'e'], 'o');
      // --- SMALL cute eyes, nostrils, grin ---
      g.eye(11, 14, 4, 4);
      g.eye(21, 14, 4, 4);
      g.set(15, 19, 'o'); g.set(17, 19, 'o');
      g.line(13, 22, 19, 22, 'o', 1);
      g.set(12, 21, 'o'); g.set(20, 21, 'o');
    },
    back(g) {
      g.ellipse(22, 38, 4, 3, 'g');
      g.ellipse(34, 38, 4, 3, 'g');
      g.line(40, 34, 45, 35, 'g', 3);
      g.line(45, 35, 47, 31, 'g', 2);
      g.set(47, 30, 'h');
      g.ball(28, 27, 14, 12, 's', 'u', 't');
      g.ring(28, 28, 11, 9, 't', 0.18);
      g.ring(28, 28, 6, 5, 't', 0.3);
      g.ellipse(13, 28, 3, 4, 'g');
      g.ellipse(43, 28, 3, 4, 'e');
      g.ball(28, 13, 11, 9, 'g', 'h', 'e');
      g.line(26, 7, 29, 3, 'e', 2);
      g.ellipse(32, 2, 5, 3, 'f');
      g.set(36, 1, 'F');
      g.outline('o');
      g.seam(['g', 'h', 'e'], ['s', 't', 'u'], 'o');
      g.seam(['f', 'F'], ['g', 'h', 'e'], 'o');
    }
  };

// ============================================================ AQUILET =====
// Baby EAGLE, not penguin: hooked raptor beak, fierce almond brow, folded
// wing with stepped primary feathers, layered tail feathers, nape fluff
// breaking the silhouette, yellow talons with claws. Forward lean.
R.aquilet = {
    pal: {
      o: 'ink', b: 'blu1', d: 'blu0', l: 'blu2', h: 'blu3',
      w: 'white', p: 'pale', i: 'ice2', I: 'ice3',
      y: 'org2', Y: 'org3', A: 'yel2', t: 'yel1', K: 'white'
    },
    draw(g) {
      // baby river eaglet — small, downy, fierce-eyed
      // --- tail: small layered wedge, set low ---
      g.tri(29, 37, 40, 41, 30, 45, 'd');
      g.line(32, 39, 38, 42, 'l', 1);

      // --- body ---
      g.ball(23, 31, 11, 11, 'b', 'l', 'd');

      // --- head on the chest, slight forward lean ---
      g.ball(16, 15, 10, 9, 'b', 'l', 'd');
      // single short crest tuft swept up-back
      g.line(19, 9, 24, 6, 'd', 3); g.set(25, 6, 'd');
      g.line(19, 8, 23, 6, 'l', 1);

      // --- white throat + chest bib ---
      g.ellipse(15, 28, 6, 8, 'w');
      g.ellipse(13, 19, 4, 4, 'w');
      g.tri(11, 33, 15, 33, 12, 38, 'w');
      g.tri(16, 33, 20, 33, 17, 38, 'w');
      g.set(15, 26, 'i'); g.set(16, 26, 'i'); g.set(15, 27, 'i');

      // --- folded wing ---
      g.ellipse(28, 28, 4, 7, 'd');
      g.ellipse(28, 25, 3, 3, 'b');
      g.line(25, 23, 30, 22, 'l', 1);
      g.line(25, 32, 31, 29, 'l', 1);
      g.line(26, 37, 31, 34, 'l', 1);
      g.set(30, 40, 'd'); g.set(29, 41, 'd');

      // --- legs + talons ---
      g.line(14, 41, 14, 44, 'd', 3);
      g.line(24, 42, 24, 45, 'd', 3);
      g.rect(11, 44, 7, 2, 'y');
      g.rect(21, 45, 7, 2, 'y');
      g.set(11, 46, 'Y'); g.set(14, 46, 'Y'); g.set(17, 46, 'Y');
      g.set(21, 47, 'Y'); g.set(24, 47, 'Y'); g.set(27, 47, 'Y');

      // --- hooked beak ---
      g.tri(4, 13, 12, 11, 12, 17, 'y');
      g.set(4, 15, 'Y'); g.set(5, 16, 'Y'); g.set(6, 16, 'y');

      g.outline('o');
      g.seam(['d'], ['b', 'l'], 'o');
      g.seam(['w'], ['b', 'l', 'd'], 'd');
      g.seam(['y', 'Y'], ['w', 'b', 'l'], 'o');

      // --- UNMISTAKABLE eye: big WHITE eyeball + bold black pupil + brow ---
      g.ellipse(11, 13, 4, 3.6, 'o');           // ink socket
      g.ellipse(11, 13, 3, 2.8, 'w');           // WHITE eyeball (pops on navy)
      g.ellipse(10, 13.5, 1.7, 1.8, 'o');       // big black pupil
      g.set(12, 11, 'A'); g.set(13, 12, 'A');   // amber eagle fleck
      g.line(6, 9, 15, 9, 'o', 1);              // heavy fierce brow
      g.set(15, 10, 'o');
    },
    back(g) {
      g.ball(27, 24, 14, 14, 'b', 'l', 'd');
      g.ellipse(27, 9, 4, 3, 'd');
      g.ellipse(25, 6, 2, 2, 'l');
      g.ellipse(15, 28, 5, 8, 'd');
      g.ellipse(39, 28, 5, 8, 'd');
      g.tri(22, 36, 28, 36, 24, 44, 'd');
      g.tri(28, 36, 34, 36, 31, 44, 'b');
      g.outline('o');
      g.seam(['d'], ['b', 'l'], 'o');
      g.line(13, 24, 17, 28, 'b', 1);
      g.line(37, 24, 41, 28, 'b', 1);
    }
  };

// ================================================= EMBERPAW (panther cub) ==
R.emberynx = {
  pal: { o: 'ink', b: 'dgry', l: 'gry', s: 'stn0', e: 'org2', f: 'yel2', m: 'stn2', K: 'yel2' },
  draw(g) {
    // long panther tail curling up, ember tip
    g.line(35, 34, 42, 27, 'b', 2);
    g.line(42, 27, 40, 21, 'b', 2);
    g.ellipse(40, 17, 3, 4, 'f');
    g.set(40, 18, 'e'); g.set(39, 19, 'e');
    // sleek sitting body
    g.ball(26, 33, 11, 10, 'b', 'l', 's');
    // small rounded panther ears, ember inner
    g.ellipse(11, 9, 4, 4, 'b');
    g.ellipse(25, 8, 4, 4, 'b');
    g.set(11, 9, 'e'); g.set(12, 9, 'e');
    g.set(25, 8, 'e'); g.set(26, 8, 'e');
    // head
    g.ball(17, 17, 10, 9, 'b', 'l', 's');
    // pale gray muzzle + ember chest patch
    g.ellipse(13, 22, 5, 4, 'm');
    g.ellipse(21, 30, 3, 3, 'e');
    g.set(21, 29, 'f');
    // forepaws, embers smoldering at the toes
    g.line(17, 36, 17, 42, 'b', 3);
    g.line(23, 37, 23, 43, 'b', 3);
    g.set(16, 43, 'e'); g.set(17, 43, 'e');
    g.set(22, 44, 'e'); g.set(23, 44, 'e');
    g.outline('o');
    g.seam(['m'], ['b', 'l', 's'], 's');
    // amber panther eyes
    g.eyeAlmond(10, 14, 6, 4);
    g.eyeAlmond(19, 14, 6, 4);
    g.set(12, 21, 'o'); g.set(13, 21, 'o'); // nose
    g.line(12, 24, 15, 25, 'o', 1);
  },
  back(g) {
    // rear view: dark haunches, round ears, ember tail tip curling up
    g.line(44, 24, 48, 14, 'b', 2);
    g.ellipse(48, 10, 3, 4, 'f');
    g.ball(28, 28, 15, 12, 'b', 'l', 's');
    g.ellipse(18, 8, 4, 4, 'b');
    g.ellipse(34, 7, 4, 4, 'b');
    g.set(18, 8, 'e'); g.set(34, 7, 'e');
    g.ball(27, 16, 12, 10, 'b', 'l', 's');
    g.outline('o');
    g.line(24, 30, 29, 30, 's', 1);
    g.line(26, 34, 30, 34, 's', 1);
  }
};

// =========================================================== PEBBLAMB =====
R.pebblamb = {
  pal: { o: 'ink', w: 'pale', l: 'lgry', s: 'skn2', t: 'skn1', n: 'brn2', p: 'stn2', K: 'white' },
  draw(g) {
    // legs first (so wool overlaps their tops)
    g.rect(14, 35, 5, 9, 'n');
    g.rect(21, 36, 5, 9, 'n');
    g.rect(29, 36, 5, 9, 'n');
    g.rect(35, 35, 5, 8, 'n');
    // wool cloud: main ball + scallop bumps
    g.ball(25, 24, 15, 13, 'w', null, 'l');
    g.ellipse(12, 17, 5, 5, 'w');
    g.ellipse(22, 12, 6, 5, 'w');
    g.ellipse(33, 14, 5, 5, 'w');
    g.ellipse(39, 23, 4, 5, 'w');
    g.ellipse(37, 33, 5, 4, 'l');
    g.ellipse(13, 33, 5, 4, 'l');
    // horn nubs nestled in the wool
    g.ellipse(10, 16, 3, 3, 'n');
    g.ellipse(24, 10, 3, 3, 'n');
    // face window
    g.ball(16, 24, 7, 6, 's', null, 't');
    g.outline('o');
    g.seam(['s', 't'], ['w', 'l'], 'o');
    g.seam(['n'], ['w', 'l'], 'o');
    // sleepy closed eyes + tiny mouth
    g.line(11, 23, 14, 23, 'o', 1);
    g.line(18, 23, 21, 23, 'o', 1);
    g.set(11, 22, 'o'); g.set(14, 22, 'o');
    g.set(18, 22, 'o'); g.set(21, 22, 'o');
    g.line(14, 27, 16, 28, 'o', 1);
    // pebbles in the wool
    g.rect(30, 19, 2, 2, 'p');
    g.rect(20, 15, 2, 2, 'p');
    g.rect(34, 27, 2, 2, 'p');
  },
  back(g) {
    // rear view: wool cloud with horn nubs poking up, hooves below
    g.rect(16, 30, 5, 9, 'n');
    g.rect(35, 30, 5, 9, 'n');
    g.ball(28, 20, 17, 14, 'w', null, 'l');
    g.ellipse(15, 10, 5, 4, 'w');
    g.ellipse(28, 7, 6, 4, 'w');
    g.ellipse(41, 10, 5, 4, 'w');
    g.ellipse(18, 6, 3, 3, 'n');
    g.ellipse(38, 5, 3, 3, 'n');
    g.outline('o');
    g.seam(['n'], ['w', 'l'], 'o');
    g.rect(24, 16, 2, 2, 'p');
    g.rect(33, 24, 2, 2, 'p');
  }
};

// ===================================================== STARTER STAGE 2/3 ===

R.verdoise = {
    pal: {
      o: 'ink',
      g: 'leaf1', h: 'leaf2', e: 'leaf0', d: 'grn0', // deeper greens
      s: 'brn1', u: 'brn2', t: 'brn0',                // darker shell
      w: 'tan0', v: 'brn3',                           // plastron
      f: 'grn1', F: 'grn2', L: 'grn3',                // leaf crown
      K: 'white'
    },
    draw(g) {
      g.ellipse(14, 44, 5, 3, 'g');
      g.ellipse(33, 44, 5, 3, 'g');
      g.set(10, 45, 'd'); g.set(11, 45, 'd'); g.set(12, 45, 'd');
      g.set(36, 45, 'd'); g.set(37, 45, 'd'); g.set(38, 45, 'd');
      g.line(34, 42, 41, 43, 'g', 4);
      g.line(41, 43, 45, 40, 'g', 3);
      g.set(45, 38, 'h'); g.set(44, 37, 'h');
      g.ball(24, 35, 14, 12, 's', 'u', 't');
      g.ring(24, 35, 14, 12, 'w', 0.18, 14, 166);
      g.ellipse(22, 37, 8, 8, 'w');
      g.line(16, 40, 27, 40, 'v', 1);
      g.line(17, 43, 26, 43, 'v', 1);
      g.ball(20, 18, 12, 11, 'g', 'h', 'e');
      g.ellipse(9, 22, 3, 4, 'g');
      g.ellipse(30, 22, 3, 4, 'e');
      g.line(14, 31, 9, 38, 'h', 4);
      g.line(33, 32, 38, 37, 'e', 4);
      g.ellipse(38, 38, 2, 2, 'e');
      g.set(8, 39, 'o'); g.set(9, 39, 'o');
      g.line(20, 12, 23, 8, 'e', 2);
      g.ellipse(26, 6, 5, 3, 'f');
      g.set(30, 4, 'f'); g.set(31, 4, 'F');
      g.ellipse(30, 9, 4, 2, 'f');
      g.set(33, 8, 'F');
      g.line(22, 7, 29, 5, 'L', 1);
      g.outline('o');
      g.seam(['w', 'v'], ['s', 't', 'u'], 'o');
      g.seam(['g', 'h', 'e'], ['s', 't', 'u', 'w'], 'o');
      g.seam(['h', 'e'], ['w', 'v'], 'o');
      g.seam(['f', 'F', 'L'], ['g', 'h', 'e'], 'o');
      g.eye(11, 14, 4, 5);
      g.eye(22, 14, 4, 5);
      g.line(10, 13, 14, 12, 'o', 1);
      g.line(21, 12, 25, 13, 'o', 1);
      g.set(16, 20, 'o'); g.set(18, 20, 'o');
      g.line(14, 23, 20, 23, 'o', 1);
    },
    back(g) {
      g.ball(28, 28, 16, 13, 's', 'u', 't');
      g.ring(28, 28, 11, 9, 't', 0.3);
      g.ball(28, 13, 12, 10, 'g', 'h', 'e');
      g.ellipse(26, 4, 5, 3, 'f'); g.ellipse(32, 6, 4, 2, 'F');
      g.ellipse(13, 31, 3, 4, 'g'); g.ellipse(43, 31, 3, 4, 'g');
      g.ellipse(18, 42, 5, 3, 'g'); g.ellipse(38, 42, 5, 3, 'g');
      g.line(44, 35, 48, 31, 'g', 3);
      g.outline('o');
      g.seam(['g', 'h', 'e'], ['s', 't', 'u'], 'o');
      g.seam(['f', 'F'], ['g', 'h', 'e'], 'o');
    }
  };

R.gaiadome = {
    pal: {
      o: 'ink',
      g: 'leaf1', h: 'leaf2', e: 'leaf0', d: 'grn0', // greens (= Verdoise)
      s: 'brn1', u: 'brn2', t: 'brn0',                // shell
      w: 'tan0', v: 'brn3',                           // plastron
      k: 'stn1', z: 'stn0',                           // earth / rock
      f: 'grn1', F: 'grn2', L: 'grn3',                // leaf crown
      K: 'white'
    },
    draw(g) {
      // --- Verdoise build: feet, tail, shell, plastron, head, arms, crown ---
      g.ellipse(14, 44, 5, 3, 'g');
      g.ellipse(33, 44, 5, 3, 'g');
      g.set(10, 45, 'd'); g.set(11, 45, 'd'); g.set(12, 45, 'd');
      g.set(36, 45, 'd'); g.set(37, 45, 'd'); g.set(38, 45, 'd');
      g.line(34, 42, 41, 43, 'g', 4);
      g.line(41, 43, 45, 40, 'g', 3);
      g.set(45, 38, 'h'); g.set(44, 37, 'h');
      g.ball(24, 35, 14, 12, 's', 'u', 't');
      g.ring(24, 35, 14, 12, 'w', 0.18, 14, 166);
      g.ellipse(22, 37, 8, 8, 'w');
      g.line(16, 40, 27, 40, 'v', 1);
      g.line(17, 43, 26, 43, 'v', 1);
      // EARTH on the shell: rock studs embedded in the carapace
      g.ball(31, 30, 3, 2, 'k', null, 'z');
      g.ball(19, 31, 2, 2, 'k', null, 'z');
      g.ball(34, 39, 2, 2, 'k', null, 'z');
      g.ball(27, 41, 2, 2, 'k', null, 'z');
      // head
      g.ball(20, 18, 12, 11, 'g', 'h', 'e');
      g.ellipse(9, 22, 3, 4, 'g');
      g.ellipse(30, 22, 3, 4, 'e');
      // EARTH on the face: craggy rock brow ridges + a jaw stone
      g.ellipse(10, 12, 3, 2, 'k');
      g.ellipse(25, 12, 3, 2, 'k');
      g.ball(29, 22, 2, 2, 'k', null, 'z');
      // arms
      g.line(14, 31, 9, 38, 'h', 4);
      g.line(33, 32, 38, 37, 'e', 4);
      g.ellipse(38, 38, 2, 2, 'e');
      g.set(8, 39, 'o'); g.set(9, 39, 'o');
      // leaf crown (double leaf, as Verdoise)
      g.line(20, 12, 23, 8, 'e', 2);
      g.ellipse(26, 6, 5, 3, 'f');
      g.set(30, 4, 'f'); g.set(31, 4, 'F');
      g.ellipse(30, 9, 4, 2, 'f');
      g.set(33, 8, 'F');
      g.line(22, 7, 29, 5, 'L', 1);
      g.outline('o');
      g.seam(['w', 'v'], ['s', 't', 'u'], 'o');
      g.seam(['k', 'z'], ['s', 't', 'u'], 'o');
      g.seam(['g', 'h', 'e'], ['s', 't', 'u', 'w', 'k', 'z'], 'o');
      g.seam(['k', 'z'], ['g', 'h', 'e'], 'o');     // face rocks read
      g.seam(['h', 'e'], ['w', 'v'], 'o');
      g.seam(['f', 'F', 'L'], ['g', 'h', 'e'], 'o');
      // --- SCARIER face: angry V brows, hard eyes, wide tusked grimace ---
      g.eye(11, 15, 4, 4);
      g.eye(22, 15, 4, 4);
      g.line(8, 13, 14, 15, 'o', 1);                // left brow down to center
      g.line(19, 15, 25, 13, 'o', 1);               // right brow down to center
      g.set(16, 20, 'o'); g.set(18, 20, 'o');       // nostrils
      g.line(13, 24, 21, 24, 'o', 1);               // wide grimace
      g.set(12, 23, 'o'); g.set(22, 23, 'o');       // raised snarl corners
      g.set(15, 25, 'w'); g.set(19, 25, 'w');       // small tusks
    },
    back(g) {
      g.ball(28, 28, 16, 13, 's', 'u', 't');
      g.ring(28, 28, 11, 9, 't', 0.3);
      g.ball(31, 22, 3, 2, 'k', null, 'z');         // rock stud
      g.ball(24, 24, 2, 2, 'k', null, 'z');
      g.ball(28, 13, 12, 10, 'g', 'h', 'e');
      g.ellipse(26, 4, 5, 3, 'f'); g.ellipse(32, 6, 4, 2, 'F');
      g.ellipse(13, 31, 3, 4, 'g'); g.ellipse(43, 31, 3, 4, 'g');
      g.ellipse(18, 42, 5, 3, 'g'); g.ellipse(38, 42, 5, 3, 'g');
      g.line(44, 35, 48, 31, 'g', 3);
      g.outline('o');
      g.seam(['k', 'z'], ['s', 't', 'u'], 'o');
      g.seam(['g', 'h', 'e'], ['s', 't', 'u'], 'o');
      g.seam(['f', 'F'], ['g', 'h', 'e'], 'o');
    }
  };

R.streagle = {
    pal: {
      o: 'ink', b: 'blu1', d: 'blu0', l: 'blu2', h: 'blu3',
      w: 'white', p: 'pale', i: 'ice2', I: 'ice3',
      y: 'org2', Y: 'org3', A: 'yel2', t: 'yel1', K: 'white'
    },
    draw(g) {
      // leaner, faster "stream-eagle": forked crest, long streamer tail, white brow
      // --- streamer tail: layered base + a LONG central streamer ---
      g.tri(30, 37, 40, 41, 31, 46, 'd');        // tail base fan
      g.line(37, 39, 48, 45, 'd', 3);            // long streamer
      g.line(46, 43, 53, 48, 'd', 2);            // streamer taper
      g.set(53, 48, 'l');
      g.line(38, 40, 47, 45, 'l', 1);            // streamer highlight

      // --- leaner, taller body ---
      g.ball(24, 31, 11, 13, 'b', 'l', 'd');

      // --- head ---
      g.ball(17, 14, 10, 9, 'b', 'l', 'd');
      // forked crest: two swept plumes
      g.line(20, 7, 28, 3, 'd', 3); g.set(29, 3, 'd'); g.set(30, 4, 'd');
      g.line(21, 9, 27, 6, 'd', 2); g.set(28, 6, 'd');
      g.line(20, 6, 27, 3, 'l', 1);

      // --- white bib ---
      g.ellipse(15, 29, 7, 9, 'w');
      g.ellipse(12, 19, 4, 4, 'w');
      g.tri(9, 35, 14, 35, 11, 41, 'w');
      g.tri(15, 35, 20, 35, 17, 41, 'w');
      g.set(15, 26, 'i'); g.set(16, 26, 'i'); g.set(15, 27, 'i'); g.set(16, 27, 'i');

      // --- folded wing: 3 stepped primaries ---
      g.ellipse(30, 29, 5, 9, 'd');
      g.ellipse(30, 24, 4, 4, 'b');
      g.line(26, 21, 33, 20, 'l', 1);
      g.line(26, 30, 34, 27, 'l', 1);
      g.line(27, 34, 34, 31, 'l', 1);
      g.line(28, 38, 34, 35, 'l', 1);
      g.set(33, 41, 'd'); g.set(32, 42, 'd');

      // --- bigger hooked beak ---
      g.tri(3, 12, 12, 10, 12, 18, 'y');
      g.set(3, 15, 'Y'); g.set(4, 16, 'Y'); g.set(5, 17, 'Y'); g.set(6, 16, 'y');

      // --- legs + talons ---
      g.line(14, 42, 14, 45, 'd', 3);
      g.line(25, 43, 25, 46, 'd', 3);
      g.rect(11, 45, 8, 2, 'y');
      g.rect(22, 46, 8, 2, 'y');
      g.set(11, 47, 'Y'); g.set(15, 47, 'Y'); g.set(18, 47, 'Y');
      g.set(22, 48, 'Y'); g.set(26, 48, 'Y'); g.set(29, 48, 'Y');

      g.outline('o');
      g.seam(['d'], ['b', 'l'], 'o');
      g.seam(['w'], ['b', 'l', 'd'], 'd');
      g.seam(['y', 'Y'], ['w', 'b', 'l'], 'o');

      // --- UNMISTAKABLE eye: big WHITE eyeball + bold black pupil + brow ---
      g.ellipse(11, 12, 4, 3.6, 'o');           // ink socket
      g.ellipse(11, 12, 3, 2.8, 'w');           // WHITE eyeball
      g.ellipse(10, 12.5, 1.7, 1.8, 'o');       // big black pupil
      g.set(12, 10, 'A'); g.set(13, 11, 'A');   // amber eagle fleck
      g.line(6, 8, 15, 8, 'o', 1);              // heavy fierce brow
      g.set(15, 9, 'o');
    },
    back(g) {
      g.ball(28, 24, 16, 15, 'b', 'l', 'd');
      g.ellipse(28, 8, 4, 3, 'd');
      g.ellipse(26, 4, 2, 2, 'l');
      g.ellipse(14, 27, 5, 10, 'd');
      g.ellipse(42, 27, 5, 10, 'd');
      g.tri(22, 37, 28, 37, 24, 46, 'd');
      g.line(28, 39, 36, 48, 'd', 2);            // streamer on the back too
      g.outline('o');
      g.seam(['d'], ['b', 'l'], 'o');
      g.line(12, 23, 16, 28, 'b', 1);
      g.line(40, 23, 44, 28, 'b', 1);
    }
  };

R.torrentalon = {
    w: 56, h: 56,
    pal: {
      o: 'ink', b: 'blu0', d: 'blu0', l: 'blu1', h: 'blu2',
      w: 'white', p: 'pale', i: 'ice2', I: 'ice3',
      y: 'org2', Y: 'org3', A: 'yel2', t: 'yel1', K: 'white'
    },
    draw(g) {
      // FLYING adult: bald-eagle white head, crown crest, neck ruff, wings wide.
      // --- left wing (up-out) ---
      g.tri(22, 24, 3, 18, 7, 32, 'l'); g.tri(7, 32, 22, 24, 22, 34, 'l');
      g.tri(3, 18, 7, 32, 14, 38, 'd'); g.tri(7, 32, 14, 38, 22, 34, 'd');
      g.line(8, 24, 20, 28, 'h', 1); g.line(6, 30, 17, 33, 'h', 1); g.line(9, 34, 18, 36, 'h', 1);
      // --- right wing (mirror) ---
      g.tri(34, 24, 53, 18, 49, 32, 'l'); g.tri(49, 32, 34, 24, 34, 34, 'l');
      g.tri(53, 18, 49, 32, 42, 38, 'd'); g.tri(49, 32, 42, 38, 34, 34, 'd');
      g.line(36, 28, 48, 24, 'h', 1); g.line(39, 33, 49, 30, 'h', 1); g.line(38, 36, 46, 34, 'h', 1);

      // --- tail plume (long, layered) ---
      g.tri(22, 45, 34, 45, 28, 55, 'd');
      g.line(26, 47, 26, 54, 'b', 1); g.line(30, 47, 30, 54, 'b', 1);
      g.line(28, 47, 28, 55, 'l', 1);

      // --- body ---
      g.ball(28, 33, 12, 13, 'b', 'l', 'd');

      // --- white chest bib ---
      g.ellipse(28, 33, 7, 10, 'w'); g.ellipse(28, 22, 5, 4, 'w');
      g.tri(23, 41, 28, 41, 25, 47, 'w'); g.tri(28, 41, 33, 41, 31, 47, 'w');
      g.set(27, 30, 'i'); g.set(28, 30, 'i'); g.set(29, 30, 'i'); g.set(28, 31, 'i');

      // --- neck ruff: scalloped navy feather collar where head meets chest ---
      g.ellipse(23, 25, 3, 2, 'd'); g.ellipse(28, 26, 3, 2, 'd'); g.ellipse(33, 25, 3, 2, 'd');

      // --- head (navy crown) ---
      g.ball(28, 15, 11, 10, 'b', 'l', 'd');
      // bald-eagle WHITE head/face over the front
      g.ellipse(25, 16, 7, 7, 'w');
      g.ellipse(21, 18, 3, 3, 'w');
      // crown crest: 3 swept feathers from the navy back-crown
      g.line(33, 8, 41, 4, 'd', 3); g.set(42, 4, 'd'); g.set(43, 5, 'd');
      g.line(34, 10, 42, 7, 'd', 2); g.set(43, 7, 'd');
      g.line(33, 11, 40, 10, 'd', 2); g.set(41, 10, 'd');
      g.line(33, 7, 40, 4, 'l', 1);

      // --- hooked beak from the white face ---
      g.tri(13, 15, 23, 13, 23, 20, 'y');
      g.set(13, 17, 'Y'); g.set(14, 18, 'Y'); g.set(15, 17, 'y');

      // --- legs + talons gripping ---
      g.line(24, 44, 24, 50, 'd', 4); g.line(33, 44, 33, 50, 'd', 4);
      g.rect(20, 50, 8, 2, 'y'); g.rect(30, 50, 8, 2, 'y');
      g.set(20, 52, 'Y'); g.set(24, 52, 'Y'); g.set(27, 52, 'Y');
      g.set(30, 52, 'Y'); g.set(34, 52, 'Y'); g.set(37, 52, 'Y');

      g.outline('o');
      g.seam(['d'], ['l', 'b'], 'd');
      g.seam(['l'], ['b'], 'd');
      g.seam(['w'], ['b', 'l', 'd'], 'd');
      g.seam(['y', 'Y'], ['w', 'b', 'l'], 'o');

      // --- bold eye on the white face: amber iris + big black pupil + brow ---
      g.ellipse(21, 15, 3.6, 3.2, 'o');         // ink socket
      g.ellipse(21, 15, 2.6, 2.4, 'A');         // amber iris (reads on white face)
      g.ellipse(20, 15.5, 1.7, 1.8, 'o');       // big black pupil
      g.set(22, 13, 'K');                        // glint
      g.line(16, 13, 24, 11, 'o', 1);           // heavy fierce brow
      g.set(24, 11, 'o');
    },
    back(g) {
      g.ball(28, 26, 16, 15, 'b', 'l', 'd');
      g.tri(20, 16, 4, 28, 18, 34, 'd');
      g.tri(36, 16, 52, 28, 38, 34, 'd');
      g.ellipse(28, 9, 4, 3, 'd');
      g.tri(22, 38, 28, 38, 24, 48, 'd');
      g.tri(28, 38, 34, 38, 31, 48, 'b');
      g.outline('o');
      g.seam(['d'], ['b', 'l'], 'o');
      g.line(10, 26, 18, 30, 'b', 1);
      g.line(38, 26, 46, 30, 'b', 1);
    }
  };

R.pyranther = {
    pal: {
      o: 'ink', b: 'dgry', l: 'gry', s: 'stn0', e: 'org2', f: 'yel2',
      m: 'stn2', E: 'org1', K: 'yel2'
    },
    draw(g) {
      // --- FLAME MANE down the neck/back (signature of the evolution). Drawn
      // first so the head + body overlap the bases, leaving flame tips rising. ---
      g.ellipse(23, 14, 3, 4, 'e'); g.ellipse(23, 11, 2, 3, 'f'); g.set(23, 8, 'f');
      g.ellipse(28, 17, 3, 4, 'e'); g.ellipse(28, 14, 2, 3, 'f'); g.set(28, 11, 'f');
      g.ellipse(32, 22, 3, 4, 'e'); g.ellipse(32, 19, 2, 2, 'f'); g.set(32, 17, 'f');
      g.ellipse(35, 28, 3, 3, 'e'); g.ellipse(35, 26, 2, 2, 'f');

      // --- bigger FLAME TAIL ---
      g.line(36, 34, 43, 27, 'b', 2);
      g.ellipse(46, 20, 5, 7, 'e'); g.ellipse(46, 18, 3, 5, 'f');
      g.set(46, 12, 'f'); g.set(47, 15, 'f'); g.set(44, 17, 'E');

      // --- lean standing body ---
      g.ball(27, 32, 12, 9, 'b', 'l', 's');

      // --- legs, ember paws ---
      g.line(18, 37, 18, 44, 'b', 3);
      g.line(26, 38, 26, 45, 'b', 3);
      g.line(34, 37, 34, 44, 's', 3);
      g.set(17, 45, 'e'); g.set(18, 45, 'e');
      g.set(25, 46, 'e'); g.set(26, 46, 'e');

      // --- FIRE CREST on the crown (drawn before ears/head so flames rise) ---
      g.ellipse(16, 6, 3, 4, 'e'); g.ellipse(16, 3, 2, 3, 'f'); g.set(16, 0, 'f');
      g.set(13, 5, 'e'); g.set(19, 5, 'e'); g.set(19, 3, 'f'); g.set(13, 3, 'f');
      // --- rounded ears (kept, as the panther line was approved), with fire tufts ---
      g.ellipse(10, 8, 4, 4, 'b'); g.ellipse(23, 7, 4, 4, 'b');
      g.set(10, 8, 'e'); g.set(11, 8, 'e'); g.set(23, 7, 'e'); g.set(24, 7, 'e');
      g.set(9, 4, 'e'); g.set(9, 2, 'f');           // left ear fire tuft
      g.set(24, 3, 'e'); g.set(24, 1, 'f');         // right ear fire tuft

      // --- head, low and forward ---
      g.ball(16, 16, 10, 9, 'b', 'l', 's');
      g.ellipse(12, 21, 5, 4, 'm');                 // pale muzzle

      g.outline('o');
      g.seam(['m'], ['b', 'l', 's'], 's');
      g.seam(['e', 'f', 'E'], ['b', 'l', 's'], 'o'); // flames read against the fur

      // --- fierce amber eyes under a sharp brow ---
      g.line(8, 11, 14, 11, 'o', 1);
      g.eyeAlmond(9, 12, 6, 4);
      g.eyeAlmond(18, 12, 6, 4);
      g.set(11, 20, 'o'); g.set(12, 20, 'o');       // nose
      g.line(11, 24, 14, 25, 'o', 1);

      // --- ember stripe markings on the flank ---
      g.line(24, 30, 27, 30, 'e', 1);
      g.line(28, 34, 32, 34, 'e', 1);
      g.set(22, 36, 'f');
    },
    back(g) {
      g.line(42, 22, 47, 12, 'b', 2);
      g.ellipse(47, 8, 4, 5, 'e'); g.ellipse(47, 7, 2, 3, 'f');
      // flame mane along the back ridge
      g.ellipse(24, 13, 3, 3, 'e'); g.set(24, 10, 'f');
      g.ellipse(30, 15, 3, 3, 'e'); g.set(30, 12, 'f');
      g.ball(28, 26, 14, 11, 'b', 'l', 's');
      g.ellipse(17, 6, 4, 4, 'b'); g.ellipse(34, 5, 4, 4, 'b');
      g.set(17, 6, 'e'); g.set(34, 5, 'e');
      g.ball(26, 14, 11, 9, 'b', 'l', 's');
      g.outline('o');
      g.seam(['e', 'f'], ['b', 'l', 's'], 'o');
      g.set(23, 28, 'e'); g.set(24, 28, 'e');
      g.set(27, 32, 'e'); g.set(28, 32, 'e');
    }
  };

R.umbranther = {
    w: 56, h: 56,
    pal: {
      o: 'ink', c: 'dgry', d: 'stn0', e: 'gry', m: 'stn2',
      f: 'yel2', g: 'org2', G: 'org1',     // fire
      s: 'pur1', S: 'pur2',                 // shadow smoke
      K: 'yel2'
    },
    draw(g) {
      // --- big flame tail whip ---
      g.line(48, 32, 53, 21, 'c', 3);
      g.ellipse(53, 14, 5, 7, 'g'); g.ellipse(53, 12, 3, 5, 'f');
      g.set(53, 7, 'f'); g.set(54, 10, 'f'); g.set(51, 13, 'G');
      // --- crouched body ---
      g.ball(32, 33, 18, 13, 'c', 'e', 'd');
      // --- HIND legs (were missing) ---
      g.line(40, 44, 40, 53, 'c', 4);
      g.line(47, 43, 47, 52, 'd', 4);
      // --- FORE legs ---
      g.line(16, 43, 14, 52, 'c', 4);
      g.line(27, 45, 27, 53, 'd', 4);
      // --- fire-shadow MANE: purple smoke wreath shot through with flame licks ---
      g.ellipse(24, 15, 8, 6, 's'); g.ellipse(31, 19, 8, 6, 's'); g.ellipse(20, 22, 7, 5, 'S');
      g.ellipse(28, 12, 4, 4, 'g'); g.set(28, 9, 'f');       // flame lick
      g.ellipse(34, 17, 4, 4, 'g'); g.set(35, 14, 'f');      // flame lick
      g.ellipse(22, 11, 3, 3, 'g'); g.set(22, 9, 'f');       // flame lick
      // --- ears with flame tips ---
      g.tri(6, 14, 8, 3, 15, 10, 'c');
      g.tri(18, 10, 24, 2, 27, 13, 'c');
      g.ellipse(9, 5, 2, 3, 'g'); g.set(9, 2, 'f');          // left ear flame
      g.ellipse(23, 4, 2, 3, 'g'); g.set(23, 1, 'f');        // right ear flame
      // --- head low and forward ---
      g.ball(15, 19, 11, 10, 'c', 'e', 'd');
      g.ellipse(10, 25, 5, 4, 'm');                          // pale muzzle
      g.outline('o');
      g.seam(['m'], ['c', 'e', 'd'], 'd');
      g.seam(['s', 'S'], ['c', 'e', 'd'], 'o');
      g.seam(['g', 'f', 'G'], ['c', 'e', 'd', 's', 'S'], 'o'); // flames read everywhere
      // --- blazing fierce eyes (flame-yellow), heavy brow ---
      g.line(7, 14, 13, 14, 'o', 1);
      g.eyeAlmond(7, 15, 6, 4, 'f');
      g.eyeAlmond(16, 15, 6, 4, 'f');
      g.set(9, 24, 'o'); g.set(10, 24, 'o');                 // nose
      g.line(9, 28, 13, 29, 'o', 1);                         // snarl
      g.set(13, 28, 'o');
      // --- ember stripe markings across the flank ---
      g.line(34, 31, 39, 31, 'g', 1);
      g.line(38, 37, 43, 37, 'g', 1);
      g.line(30, 41, 34, 41, 'g', 1);
      g.set(40, 34, 'f'); g.set(36, 39, 'f');
    },
    back(g) {
      g.line(46, 28, 52, 16, 'c', 3);
      g.ellipse(52, 11, 5, 6, 'g'); g.ellipse(52, 9, 3, 4, 'f');
      g.ball(30, 34, 17, 13, 'c', 'e', 'd');
      g.line(22, 44, 22, 52, 'c', 4); g.line(38, 44, 38, 52, 'd', 4);
      g.ellipse(26, 18, 8, 6, 's'); g.ellipse(36, 22, 8, 6, 's');
      g.ellipse(30, 15, 3, 3, 'g'); g.set(30, 12, 'f');
      g.tri(12, 12, 14, 2, 21, 10, 'c'); g.tri(28, 10, 34, 2, 37, 12, 'c');
      g.ellipse(15, 5, 2, 3, 'g'); g.ellipse(32, 4, 2, 3, 'g');
      g.ball(25, 17, 12, 10, 'c', 'e', 'd');
      g.outline('o');
      g.seam(['s', 'S'], ['c', 'e', 'd'], 'o');
      g.seam(['g', 'f'], ['c', 'e', 'd', 's', 'S'], 'o');
      g.line(24, 31, 29, 31, 'g', 1); g.line(32, 37, 37, 37, 'g', 1);
    }
  };

R.bouldram = {
    pal: { o: 'ink', w: 'pale', l: 'lgry', s: 'skn2', t: 'skn1', n: 'brn2', m: 'brn1', p: 'stn2', q: 'stn1', K: 'white' },
    draw(g) {
      // sturdy legs
      g.rect(12, 34, 6, 11, 'n'); g.rect(20, 36, 6, 10, 'n');
      g.rect(29, 36, 6, 10, 'n'); g.rect(36, 34, 6, 11, 'n');
      // rocky wool mass
      g.ball(25, 22, 17, 15, 'w', null, 'l');
      g.ellipse(11, 14, 6, 5, 'w'); g.ellipse(24, 9, 7, 5, 'w');
      g.ellipse(37, 12, 6, 5, 'w'); g.ellipse(41, 24, 5, 6, 'l');
      // BIGGER curled horns (more intense)
      g.ring(10, 16, 8, 8, 'q', 0.5, 245, 165);
      g.ring(31, 10, 8, 7, 'q', 0.5, 275, 185);
      // face
      g.ball(15, 24, 8, 7, 's', null, 't');
      g.outline('o');
      g.seam(['s', 't'], ['w', 'l'], 'o'); g.seam(['q'], ['w', 'l'], 'o'); g.seam(['n'], ['w', 'l'], 'o');
      // ANGRY V brows + hard open eyes (was sleepy/soft)
      g.line(8, 20, 13, 22, 'o', 1); g.set(8, 19, 'o');
      g.line(16, 22, 21, 20, 'o', 1); g.set(21, 19, 'o');
      g.eye(9, 22, 4, 4); g.eye(16, 22, 4, 4);
      // stern frown mouth
      g.line(13, 28, 16, 28, 'o', 1); g.set(12, 29, 'o'); g.set(17, 29, 'o');
      // more embedded rocks (battle-worn)
      g.rect(28, 16, 3, 3, 'p'); g.rect(20, 13, 2, 2, 'p'); g.rect(33, 24, 3, 3, 'p');
      g.rect(16, 31, 2, 2, 'p'); g.rect(35, 29, 3, 3, 'p'); g.set(26, 18, 'p');
    },
    back(g) {
      g.rect(15, 30, 6, 9, 'n'); g.rect(34, 30, 6, 9, 'n');
      g.ball(28, 20, 18, 15, 'w', null, 'l');
      g.ellipse(14, 9, 6, 5, 'w'); g.ellipse(29, 6, 7, 5, 'w'); g.ellipse(42, 10, 6, 5, 'w');
      g.ring(13, 8, 8, 7, 'q', 0.5, 245, 165); g.ring(40, 7, 8, 7, 'q', 0.5, 275, 185);
      g.outline('o');
      g.seam(['q'], ['w', 'l'], 'o');
      g.rect(25, 14, 3, 3, 'p'); g.rect(34, 22, 3, 3, 'p'); g.rect(20, 24, 2, 2, 'p');
    }
  };

R.ferrobex = {
    w: 56, h: 56,
    pal: { o: 'ink', w: 'pale', l: 'lgry', s: 'skn2', t: 'skn1', n: 'brn1', p: 'stn2', q: 'stn3', i: 'stn1', K: 'white' },
    draw(g) {
      // legs with metal hooves
      g.rect(13, 38, 7, 13, 'n'); g.rect(23, 41, 7, 11, 'n');
      g.rect(33, 41, 7, 11, 'n'); g.rect(42, 38, 7, 13, 'n');
      g.rect(13, 48, 7, 4, 'i'); g.rect(42, 48, 7, 4, 'i');
      // massive body
      g.ball(29, 26, 20, 17, 'w', null, 'l');
      g.ellipse(12, 16, 7, 6, 'w'); g.ellipse(28, 10, 8, 6, 'w'); g.ellipse(44, 14, 7, 6, 'w');
      // MORE armor plates
      g.ellipse(36, 16, 8, 5, 'q'); g.ellipse(44, 24, 6, 5, 'q'); g.ellipse(28, 12, 6, 4, 'q');
      g.ellipse(40, 32, 6, 4, 'q'); g.ellipse(20, 14, 5, 4, 'q');
      // BIGGER, meaner steel horns
      g.ring(11, 18, 12, 11, 'q', 0.42, 238, 172);
      g.ring(33, 9, 12, 10, 'q', 0.42, 268, 196);
      g.ring(12, 17, 7, 6, 'i', 0.5, 238, 162);
      // face
      g.ball(16, 28, 10, 8, 's', null, 't');
      g.outline('o');
      g.seam(['s', 't'], ['w', 'l'], 'o'); g.seam(['q', 'i'], ['w', 'l'], 'o'); g.seam(['n'], ['w', 'l'], 'o');
      // FIERCE heavy angled brows + hard eyes
      g.line(8, 22, 14, 25, 'o', 1); g.set(8, 21, 'o'); g.set(9, 22, 'o');
      g.line(17, 25, 23, 22, 'o', 1); g.set(23, 21, 'o'); g.set(22, 22, 'o');
      g.eye(10, 25, 4, 4); g.eye(18, 25, 4, 4);
      // SNARL mouth with tusks
      g.line(13, 34, 19, 34, 'o', 1); g.set(12, 33, 'o'); g.set(20, 33, 'o');
      g.set(14, 35, 'w'); g.set(18, 35, 'w');
      // battle scars
      g.line(20, 30, 24, 33, 't', 1); g.line(33, 20, 36, 23, 't', 1);
    },
    back(g) {
      g.rect(16, 32, 7, 11, 'n'); g.rect(38, 32, 7, 11, 'n');
      g.ball(29, 22, 19, 16, 'w', null, 'l');
      g.ellipse(14, 10, 7, 6, 'w'); g.ellipse(30, 6, 8, 6, 'w'); g.ellipse(44, 10, 7, 6, 'w');
      g.ellipse(30, 16, 9, 6, 'q');
      g.ring(12, 9, 12, 10, 'q', 0.42, 238, 172); g.ring(44, 8, 12, 10, 'q', 0.42, 268, 200);
      g.outline('o');
      g.seam(['q'], ['w', 'l'], 'o');
      g.line(26, 18, 30, 21, 't', 1);
    }
  };

// ======================================================== EARLY ROUTES =====

R.cheepit = {
  pal: { o: 'ink', b: 'brn3', d: 'brn2', w: 'tan1', y: 'org2', K: 'white' },
  draw(g) {
    g.ball(24, 28, 11, 12, 'b', 'w', 'd');
    g.ellipse(31, 29, 4, 6, 'd');               // wing
    g.tri(33, 36, 41, 40, 32, 42, 'd');         // tail
    g.ellipse(20, 33, 6, 6, 'w');               // belly
    g.tri(11, 24, 17, 21, 17, 27, 'y');         // beak
    g.ellipse(24, 14, 3, 4, 'd');               // head tuft
    g.outline('o');
    g.seam(['w'], ['b', 'd'], 'd');
    g.eye(16, 19, 4, 5);
    g.eye(24, 19, 4, 5);
    g.line(19, 41, 19, 44, 'y', 2);
    g.line(27, 41, 27, 44, 'y', 2);
    g.rect(17, 44, 5, 1, 'o');
    g.rect(25, 44, 5, 1, 'o');
  }
};

R.swiftrel = {
  pal: { o: 'ink', b: 'brn3', d: 'brn2', w: 'tan1', y: 'org2', K: 'white' },
  draw(g) {
    g.tri(30, 20, 44, 14, 38, 32, 'd');         // swept wing
    g.ball(23, 26, 11, 13, 'b', 'w', 'd');
    g.tri(30, 36, 43, 42, 29, 44, 'd');         // long tail
    g.ellipse(19, 31, 6, 7, 'w');
    g.tri(9, 21, 16, 18, 16, 25, 'y');
    g.tri(20, 12, 26, 6, 28, 14, 'd');          // crest
    g.outline('o');
    g.seam(['w'], ['b', 'd'], 'd');
    g.line(14, 16, 19, 16, 'o', 1);
    g.eye(15, 17, 4, 5);
    g.eye(23, 17, 4, 5);
    g.line(19, 40, 19, 43, 'y', 2);
    g.line(25, 41, 25, 44, 'y', 2);
    g.rect(17, 43, 5, 1, 'o');
    g.rect(23, 44, 5, 1, 'o');
  }
};

R.falconade = {
  pal: { o: 'ink', b: 'brn2', d: 'brn1', w: 'tan1', y: 'org2', r: 'red2', K: 'white' },
  draw(g) {
    g.tri(28, 14, 46, 8, 38, 34, 'd');          // big wing
    g.tri(30, 16, 43, 12, 37, 30, 'b');
    g.ball(22, 26, 12, 16, 'b', 'w', 'd');
    g.tri(28, 40, 42, 46, 27, 48, 'd');         // tail fan
    g.tri(28, 38, 36, 47, 25, 47, 'b');
    g.ellipse(18, 32, 7, 9, 'w');
    g.tri(6, 18, 14, 14, 14, 23, 'y');          // hooked beak
    g.set(6, 19, 'o'); g.set(7, 20, 'o');
    g.tri(16, 10, 22, 2, 25, 11, 'r');          // red crest
    g.outline('o');
    g.seam(['w'], ['b', 'd'], 'd');
    g.seam(['r'], ['b', 'd'], 'o');
    g.line(11, 12, 18, 12, 'o', 1);
    g.eye(12, 13, 4, 5);
    g.eye(20, 13, 4, 5);
    g.rect(16, 42, 4, 3, 'y');
    g.rect(24, 43, 4, 2, 'y');
    g.rect(15, 44, 6, 1, 'o');
    g.rect(23, 44, 6, 1, 'o');
  }
};

R.nibbit = {
  pal: { o: 'ink', b: 'stn2', d: 'stn1', w: 'pale', p: 'pnk1', K: 'white' },
  draw(g) {
    g.line(33, 34, 41, 28, 'd', 2);             // curly tail
    g.line(41, 28, 40, 23, 'd', 2);
    g.ball(24, 30, 11, 11, 'b', 'w', 'd');
    g.ellipse(13, 16, 5, 6, 'b');               // ears
    g.ellipse(30, 14, 5, 6, 'b');
    g.ellipse(13, 17, 2, 3, 'p');
    g.ellipse(30, 15, 2, 3, 'p');
    g.ball(21, 22, 9, 8, 'b', 'w', 'd');        // head
    g.ellipse(18, 36, 6, 5, 'w');               // belly
    g.outline('o');
    g.seam(['w'], ['b', 'd'], 'd');
    g.eye(15, 19, 4, 5);
    g.eye(23, 19, 4, 5);
    g.rect(19, 26, 4, 3, 'w');                  // incisors
    g.set(19, 26, 'o'); g.set(22, 26, 'o'); g.set(20, 28, 'o'); g.set(21, 28, 'o');
    g.ellipse(14, 39, 3, 2, 'b');
    g.ellipse(27, 40, 3, 2, 'b');
  }
};

R.gnawdger = {
  pal: { o: 'ink', b: 'brn2', d: 'brn1', w: 'tan1', s: 'stn3', K: 'white' },
  draw(g) {
    g.ball(26, 28, 15, 14, 'b', null, 'd');
    g.ellipse(12, 12, 5, 6, 'b');
    g.ellipse(34, 10, 5, 6, 'b');
    g.ball(22, 18, 11, 10, 'b', 'w', 'd');      // head
    g.line(8, 14, 30, 14, 'd', 1);              // brow stripe
    g.ellipse(22, 36, 9, 7, 'w');               // belly
    g.outline('o');
    g.seam(['w'], ['b', 'd'], 'd');
    g.line(10, 14, 16, 14, 'o', 1);
    g.line(20, 14, 26, 14, 'o', 1);
    g.eye(11, 15, 4, 4);
    g.eye(20, 15, 4, 4);
    g.rect(17, 24, 6, 4, 's');                  // big incisors
    g.set(17, 24, 'o'); g.set(22, 24, 'o'); g.set(19, 27, 'o'); g.set(20, 27, 'o');
    // claws
    g.ellipse(12, 40, 4, 3, 'w');
    g.ellipse(36, 40, 4, 3, 'w');
    g.set(10, 42, 'o'); g.set(13, 42, 'o');
    g.set(34, 42, 'o'); g.set(37, 42, 'o');
  }
};

R.silklit = {
  pal: { o: 'ink', g: 'leaf2', h: 'leaf3', e: 'leaf1', y: 'yel1', K: 'white' },
  draw(g) {
    g.ball(33, 36, 8, 7, 'g', 'h', 'e');        // rear segment
    g.ball(26, 33, 8, 8, 'g', 'h', 'e');
    g.ball(17, 28, 10, 10, 'g', 'h', 'e');      // head
    g.line(12, 18, 9, 12, 'e', 1);              // antennae
    g.line(20, 17, 22, 11, 'e', 1);
    g.ellipse(9, 12, 2, 2, 'y');
    g.ellipse(22, 10, 2, 2, 'y');
    g.outline('o');
    g.eye(11, 24, 4, 6);
    g.eye(19, 24, 4, 6);
    g.line(13, 33, 16, 34, 'o', 1);
    g.set(28, 30, 'e'); g.set(34, 33, 'e');     // segment dots
  }
};

R.cocoonix = {
  pal: { o: 'ink', g: 'grn2', d: 'grn1', l: 'lgry', K: 'white' },
  draw(g) {
    g.ball(24, 26, 11, 16, 'g', null, 'd');
    g.tri(20, 9, 24, 2, 28, 10, 'd');           // hanging point
    g.line(14, 20, 33, 16, 'l', 1);             // silk bands
    g.line(14, 28, 34, 24, 'l', 1);
    g.line(15, 36, 33, 32, 'l', 1);
    g.outline('o');
    g.line(18, 22, 23, 22, 'o', 1);             // sleepy eye
    g.eye(18, 23, 4, 3);
  }
};

R.mothrall = {
  pal: { o: 'ink', p: 'pur2', q: 'pur1', l: 'pur3', f: 'tan1', y: 'yel1', K: 'white' },
  draw(g) {
    // wings
    g.tri(20, 22, 2, 8, 8, 30, 'p');
    g.tri(28, 22, 46, 8, 40, 30, 'p');
    g.tri(20, 26, 6, 38, 16, 40, 'q');
    g.tri(28, 26, 42, 38, 32, 40, 'q');
    // eyespots
    g.ring(11, 19, 4, 4, 'l', 0.6);
    g.ring(37, 19, 4, 4, 'l', 0.6);
    g.set(11, 19, 'y'); g.set(37, 19, 'y');
    // fuzzy body
    g.ball(24, 27, 6, 9, 'f', null, null);
    g.ball(24, 16, 8, 7, 'f', null, null);
    g.line(20, 10, 16, 4, 'q', 1);
    g.line(28, 10, 32, 4, 'q', 1);
    g.ellipse(16, 4, 2, 2, 'q');
    g.ellipse(32, 4, 2, 2, 'q');
    g.outline('o');
    g.seam(['f'], ['p', 'q', 'l'], 'o');
    g.eye(19, 15, 4, 4);
    g.eye(26, 15, 4, 4);
    g.line(21, 32, 27, 32, 'q', 1);
    g.line(21, 36, 27, 36, 'q', 1);
  }
};

R.fernfawn = {
  pal: { o: 'ink', b: 'brn3', d: 'brn2', w: 'tan1', f: 'leaf2', h: 'leaf3', K: 'white' },
  draw(g) {
    g.ball(27, 30, 12, 9, 'b', 'w', 'd');       // body
    g.line(18, 37, 18, 44, 'b', 3);             // legs
    g.line(25, 38, 25, 45, 'b', 3);
    g.line(32, 38, 32, 45, 'd', 3);
    g.line(37, 37, 37, 44, 'd', 3);
    g.ball(16, 18, 9, 8, 'b', 'w', 'd');        // head
    g.ellipse(8, 12, 3, 4, 'b');                // ears
    g.ellipse(24, 11, 3, 4, 'b');
    // fern sprigs
    g.tri(13, 9, 9, 2, 16, 6, 'f');
    g.tri(18, 8, 22, 1, 24, 7, 'h');
    // spots
    g.set(28, 26, 'w'); g.set(29, 26, 'w');
    g.set(33, 30, 'w'); g.set(34, 30, 'w');
    g.set(25, 33, 'w');
    g.outline('o');
    g.seam(['f', 'h'], ['b', 'd', 'w'], 'o');
    g.eye(11, 16, 4, 5);
    g.eye(19, 16, 4, 5);
    g.line(11, 23, 14, 24, 'o', 1);
  }
};

R.thornbuck = {
  pal: { o: 'ink', b: 'brn2', d: 'brn1', w: 'tan1', f: 'grn1', h: 'grn2', K: 'white' },
  draw(g) {
    // thorned antlers
    g.line(12, 14, 8, 4, 'f', 2);
    g.line(8, 8, 4, 6, 'f', 1);
    g.line(10, 11, 13, 7, 'f', 1);
    g.line(22, 13, 27, 3, 'f', 2);
    g.line(26, 7, 30, 5, 'f', 1);
    g.line(24, 10, 21, 6, 'f', 1);
    g.ball(28, 30, 13, 10, 'b', 'w', 'd');
    g.line(19, 38, 19, 46, 'b', 3);
    g.line(26, 39, 26, 47, 'b', 3);
    g.line(33, 39, 33, 47, 'd', 3);
    g.line(38, 38, 38, 46, 'd', 3);
    g.ball(16, 20, 9, 8, 'b', 'w', 'd');
    g.ellipse(8, 15, 3, 4, 'b');
    g.ellipse(25, 13, 3, 4, 'b');
    g.outline('o');
    g.seam(['f', 'h'], ['b', 'd', 'w'], 'o');
    g.line(9, 17, 14, 17, 'o', 1);
    g.eye(10, 18, 4, 5);
    g.eye(18, 18, 4, 5);
    g.line(10, 25, 13, 26, 'o', 1);
  }
};

R.sylvastag = {
  pal: { o: 'ink', b: 'leaf2', d: 'leaf1', w: 'tan1', f: 'grn1', p: 'pnk2', K: 'white' },
  draw(g) {
    // grand antlers with moonlit tips
    g.line(13, 16, 8, 4, 'f', 2);
    g.line(9, 9, 3, 7, 'f', 2);
    g.line(11, 12, 15, 6, 'f', 1);
    g.ellipse(8, 3, 2, 2, 'p');
    g.ellipse(3, 6, 2, 2, 'p');
    g.line(24, 15, 30, 3, 'f', 2);
    g.line(28, 8, 34, 6, 'f', 2);
    g.line(26, 11, 22, 6, 'f', 1);
    g.ellipse(30, 2, 2, 2, 'p');
    g.ellipse(35, 5, 2, 2, 'p');
    // tall body
    g.ball(30, 30, 14, 11, 'b', 'w', 'd');
    g.line(20, 38, 20, 47, 'b', 4);
    g.line(28, 40, 28, 47, 'b', 3);
    g.line(35, 40, 35, 47, 'd', 3);
    g.line(41, 38, 41, 47, 'd', 4);
    g.ball(17, 22, 10, 9, 'b', 'w', 'd');
    g.ellipse(8, 17, 3, 4, 'b');
    g.ellipse(27, 15, 3, 4, 'b');
    g.ellipse(24, 36, 6, 6, 'w');               // chest
    g.outline('o');
    g.seam(['f'], ['b', 'd', 'w'], 'o');
    g.line(10, 19, 15, 19, 'o', 1);
    g.eye(11, 20, 4, 5);
    g.eye(19, 20, 4, 5);
    g.line(10, 27, 14, 28, 'o', 1);
    g.set(33, 25, 'p'); g.set(28, 33, 'p');     // glow dust
  }
};

R.scrapling = {
  pal: { o: 'ink', b: 'org2', d: 'org1', w: 'tan1', r: 'red2', K: 'white' },
  draw(g) {
    g.ball(24, 26, 11, 12, 'b', 'w', 'd');
    // headband
    g.rect(14, 17, 20, 3, 'r');
    g.line(33, 19, 38, 23, 'r', 2);             // band tail
    // fists
    g.ball(10, 30, 4, 4, 'b', null, 'd');
    g.ball(38, 30, 4, 4, 'b', null, 'd');
    // legs
    g.line(19, 37, 18, 44, 'b', 3);
    g.line(29, 37, 30, 44, 'd', 3);
    g.outline('o');
    g.seam(['r'], ['b', 'w', 'd'], 'o');
    g.eye(17, 21, 4, 5);
    g.eye(26, 21, 4, 5);
    g.line(20, 30, 25, 30, 'o', 1);             // determined mouth
    g.set(26, 29, 'o');
  }
};

R.brawlock = {
  pal: { o: 'ink', b: 'org1', d: 'red0', w: 'tan1', r: 'red2', s: 'stn1', K: 'white' },
  draw(g) {
    // broad torso
    g.ball(24, 24, 15, 13, 'b', 'w', 'd');
    g.rect(12, 15, 24, 4, 'r');                 // headband
    // huge fists
    g.ball(7, 32, 6, 6, 'b', 'w', 'd');
    g.ball(41, 32, 6, 6, 'b', 'w', 'd');
    g.line(12, 26, 9, 30, 'b', 4);
    g.line(36, 26, 39, 30, 'b', 4);
    // belt + legs
    g.rect(17, 36, 14, 3, 's');
    g.line(19, 39, 18, 46, 'b', 4);
    g.line(29, 39, 30, 46, 'd', 4);
    g.outline('o');
    g.seam(['r', 's'], ['b', 'w', 'd'], 'o');
    g.line(15, 19, 20, 19, 'o', 1);
    g.line(26, 19, 31, 19, 'o', 1);
    g.eye(16, 20, 4, 4);
    g.eye(26, 20, 4, 4);
    g.line(20, 28, 26, 28, 'o', 1);
    g.set(13, 24, 'w'); g.set(34, 24, 'w');     // knuckle shine
  }
};

R.shalite = {
  pal: { o: 'ink', s: 'stn2', t: 'stn1', u: 'stn3', c: 'ice2', K: 'white' },
  draw(g) {
    g.ball(24, 28, 13, 12, 's', 'u', 't');
    // crystal nub
    g.tri(28, 12, 32, 4, 36, 13, 'c');
    // rocky chips
    g.tri(12, 18, 8, 12, 16, 14, 's');
    g.tri(36, 20, 42, 15, 40, 23, 's');
    // stubby arms
    g.ellipse(10, 32, 3, 3, 't');
    g.ellipse(38, 32, 3, 3, 't');
    g.outline('o');
    g.seam(['c'], ['s', 'u', 't'], 'o');
    g.eye(16, 24, 5, 6);
    g.eye(27, 24, 5, 6);
    g.line(19, 34, 24, 34, 'o', 1);
    g.set(17, 18, 't'); g.set(30, 31, 't');     // cracks
    g.line(13, 28, 15, 30, 't', 1);
  }
};

R.boulderon = {
  pal: { o: 'ink', s: 'stn1', t: 'stn0', u: 'stn2', m: 'grn1', c: 'ice2', K: 'white' },
  draw(g) {
    g.ball(25, 30, 17, 15, 's', 'u', 't');
    g.ball(22, 14, 11, 8, 's', 'u', 't');       // head boulder
    // moss cap
    g.ellipse(20, 8, 8, 3, 'm');
    // crystal shoulder
    g.tri(38, 16, 44, 8, 46, 18, 'c');
    // heavy arms
    g.ball(7, 30, 5, 7, 's', null, 't');
    g.ball(43, 32, 5, 7, 's', null, 't');
    g.outline('o');
    g.seam(['m'], ['s', 'u', 't'], 'o');
    g.seam(['c'], ['s', 'u', 't'], 'o');
    g.line(15, 13, 20, 13, 'o', 1);
    g.line(24, 13, 29, 13, 'o', 1);
    g.eye(16, 14, 4, 4);
    g.eye(24, 14, 4, 4);
    g.line(19, 20, 24, 20, 'o', 1);
    g.line(14, 28, 17, 31, 't', 1);
    g.line(32, 34, 35, 36, 't', 1);
  }
};

R.finling = {
  pal: { o: 'ink', b: 'blu2', d: 'blu1', l: 'blu3', w: 'white', K: 'white' },
  draw(g) {
    g.ball(24, 26, 11, 13, 'b', 'l', 'd');
    g.tri(8, 24, 16, 20, 16, 28, 'l');          // nose point
    g.tri(20, 10, 26, 4, 29, 13, 'd');          // dorsal fin
    g.tri(32, 32, 42, 28, 40, 40, 'd');         // tail fin
    g.ellipse(20, 31, 6, 6, 'w');               // belly
    g.ellipse(31, 22, 3, 5, 'd');               // side fin
    g.outline('o');
    g.seam(['w'], ['b', 'l', 'd'], 'd');
    g.eye(16, 20, 4, 6);
    g.eye(24, 20, 4, 6);
    g.line(13, 28, 16, 29, 'o', 1);
  }
};

R.marlance = {
  pal: { o: 'ink', b: 'blu1', d: 'blu0', l: 'blu2', w: 'white', s: 'stn3', i: 'stn2', K: 'white' },
  draw(g) {
    // blade nose
    g.line(2, 18, 16, 21, 's', 3);
    g.line(3, 18, 9, 19, 'i', 1);
    // streamlined body
    g.ball(26, 26, 13, 14, 'b', 'l', 'd');
    g.tri(22, 8, 30, 2, 33, 12, 'd');           // dorsal blade
    g.tri(34, 34, 46, 30, 43, 44, 'd');         // tail
    g.tri(30, 36, 38, 44, 26, 42, 'l');         // lower fin
    g.ellipse(21, 32, 7, 7, 'w');
    g.outline('o');
    g.seam(['w'], ['b', 'l', 'd'], 'd');
    g.seam(['s', 'i'], ['b', 'l', 'd', 'w'], 'o');
    g.line(15, 16, 21, 15, 'o', 1);
    g.eye(16, 17, 4, 5);
    g.eye(24, 17, 4, 5);
    // armored cheek
    g.line(19, 24, 25, 26, 'i', 1);
  }
};

R.sparkit = {
  pal: { o: 'ink', y: 'yel1', Y: 'yel2', d: 'org2', w: 'white', K: 'white' },
  draw(g) {
    // zigzag tail
    g.line(34, 30, 40, 24, 'y', 2);
    g.line(40, 24, 36, 19, 'y', 2);
    g.line(36, 19, 42, 13, 'Y', 2);
    g.ball(24, 30, 11, 10, 'y', 'Y', 'd');
    // spiky cheeks + ears
    g.tri(8, 24, 13, 18, 14, 27, 'y');
    g.tri(34, 22, 40, 18, 38, 28, 'y');
    g.tri(14, 16, 16, 8, 21, 15, 'y');
    g.tri(25, 14, 30, 7, 32, 16, 'y');
    g.ball(22, 21, 10, 9, 'y', 'Y', 'd');
    g.outline('o');
    g.eye(16, 18, 4, 5);
    g.eye(25, 18, 4, 5);
    g.set(15, 25, 'd'); g.set(16, 25, 'd');     // cheek sparks
    g.set(30, 24, 'd'); g.set(31, 24, 'd');
    g.line(19, 26, 23, 27, 'o', 1);
    g.line(17, 38, 17, 43, 'y', 3);
    g.line(28, 38, 28, 43, 'y', 3);
  }
};

R.voltail = {
  pal: { o: 'ink', y: 'yel1', Y: 'yel2', d: 'org2', s: 'stn1', K: 'white' },
  draw(g) {
    // twin lightning tails
    g.line(33, 26, 40, 18, 'y', 2);
    g.line(40, 18, 37, 12, 'Y', 2);
    g.line(37, 12, 43, 5, 'Y', 2);
    g.line(35, 32, 44, 28, 'y', 2);
    g.line(44, 28, 41, 22, 'Y', 2);
    g.line(41, 22, 47, 16, 'Y', 2);
    // sleek body
    g.ball(26, 32, 12, 9, 'y', 'Y', 'd');
    g.line(18, 38, 18, 45, 'y', 3);
    g.line(25, 40, 25, 46, 'y', 3);
    g.line(33, 39, 33, 45, 'd', 3);
    // sharp ears
    g.tri(8, 14, 11, 3, 17, 11, 'y');
    g.tri(20, 11, 26, 3, 29, 14, 'y');
    g.tri(10, 9, 11, 5, 14, 9, 's');
    g.tri(23, 8, 26, 5, 27, 9, 's');
    g.ball(17, 18, 10, 9, 'y', 'Y', 'd');
    g.outline('o');
    g.line(10, 14, 15, 14, 'o', 1);
    g.eye(11, 15, 4, 5);
    g.eye(20, 15, 4, 5);
    g.set(12, 23, 'd'); g.set(13, 23, 'd');
    g.line(13, 26, 16, 27, 'o', 1);
  }
};

R.moleling = {
  pal: { o: 'ink', b: 'brn2', d: 'brn1', w: 'tan0', p: 'skn2', K: 'white' },
  draw(g) {
    // dirt mound it pops out of
    g.ellipse(24, 41, 16, 5, 'd');
    g.ellipse(24, 40, 14, 4, 'w');
    // dome body
    g.ball(24, 26, 12, 14, 'b', 'w', 'd');
    // paws out the sides
    g.ellipse(9, 33, 4, 3, 'p');
    g.ellipse(39, 33, 4, 3, 'p');
    g.outline('o');
    g.seam(['p'], ['b', 'w', 'd'], 'o');
    // big pink nose, front and center
    g.ellipse(24, 27, 4, 3, 'p');
    g.set(22, 26, 'K');
    // round dot eyes above
    g.eyeDot(18, 20, 1.5);
    g.eyeDot(30, 20, 1.5);
    g.set(8, 35, 'o'); g.set(11, 35, 'o');      // claw nicks
    g.set(37, 35, 'o'); g.set(40, 35, 'o');
  }
};

R.terradon = {
  pal: { o: 'ink', b: 'brn1', d: 'brn0', w: 'tan0', p: 'skn2', s: 'stn2', K: 'white' },
  draw(g) {
    g.ball(26, 28, 16, 15, 'b', 'w', 'd');
    // armored head plate
    g.ball(20, 14, 11, 8, 's', null, null);
    g.ellipse(20, 12, 9, 5, 's');
    // huge claws
    g.tri(4, 34, 14, 30, 12, 42, 'p');
    g.tri(44, 34, 34, 30, 36, 42, 'p');
    g.set(5, 36, 'o'); g.set(7, 39, 'o');
    g.set(43, 36, 'o'); g.set(41, 39, 'o');
    // belly plate
    g.ellipse(24, 36, 8, 6, 'w');
    g.outline('o');
    g.seam(['p'], ['b', 'w', 'd'], 'o');
    g.seam(['s'], ['b', 'w', 'd'], 'o');
    g.eye(14, 17, 4, 4);
    g.eye(23, 17, 4, 4);
    g.line(16, 24, 21, 25, 'o', 1);
  }
};

R.gloamop = {
  pal: { o: 'ink', p: 'pur2', q: 'pur1', l: 'pur3', K: 'white' },
  draw(g) {
    // smoke curl
    g.line(28, 12, 33, 7, 'q', 2);
    g.line(33, 7, 30, 3, 'l', 1);
    // wispy body with wavy bottom
    g.ball(24, 26, 12, 12, 'p', 'l', 'q');
    g.tri(13, 35, 18, 42, 21, 35, 'p');
    g.tri(21, 36, 26, 44, 30, 36, 'p');
    g.tri(29, 35, 34, 41, 36, 34, 'p');
    g.outline('o');
    g.eye(17, 22, 5, 6);
    g.eye(27, 22, 5, 6);
    g.ellipse(22, 32, 2, 3, 'o');               // open mouth
    g.set(15, 18, 'l'); g.set(30, 17, 'l');     // glints
  }
};

R.wraithorn = {
  pal: { o: 'ink', p: 'pur1', q: 'pur0', l: 'pur3', b: 'lgry', K: 'white' },
  draw(g) {
    // hollow antlers
    g.line(14, 14, 9, 4, 'b', 2);
    g.line(10, 8, 5, 7, 'b', 1);
    g.line(12, 11, 16, 6, 'b', 1);
    g.line(26, 13, 32, 3, 'b', 2);
    g.line(30, 7, 35, 6, 'b', 1);
    g.line(28, 10, 24, 5, 'b', 1);
    // spectral body, trailing away
    g.ball(28, 28, 13, 11, 'p', 'l', 'q');
    g.tri(34, 36, 44, 40, 32, 44, 'q');         // fading tail
    g.ball(18, 19, 10, 9, 'p', 'l', 'q');       // head
    g.outline('o');
    g.seam(['b'], ['p', 'q', 'l'], 'o');
    // glowing eyes
    g.eyeGlow(12, 15, 5, 5);
    g.eyeGlow(20, 15, 5, 5);
    g.line(13, 24, 16, 25, 'o', 1);
    g.set(31, 22, 'l'); g.set(25, 33, 'l');
  }
};

R.psymote = {
  pal: { o: 'ink', p: 'pnk1', q: 'pnk0', l: 'pnk2', w: 'white', K: 'white' },
  draw(g) {
    // floating orb body with inner ring
    g.ball(24, 24, 12, 12, 'p', 'l', 'q');
    g.ring(24, 24, 8, 8, 'l', 0.3);
    // tiny hands hovering
    g.ellipse(8, 28, 3, 3, 'p');
    g.ellipse(40, 28, 3, 3, 'p');
    // meditative closed eyes
    g.outline('o');
    g.line(17, 22, 21, 22, 'o', 1);
    g.line(27, 22, 31, 22, 'o', 1);
    g.set(17, 23, 'o'); g.set(21, 23, 'o');
    g.set(27, 23, 'o'); g.set(31, 23, 'o');
    g.line(22, 29, 26, 29, 'o', 1);
    // psychic motes
    g.set(10, 14, 'l'); g.set(38, 16, 'l'); g.set(24, 6, 'l');
  }
};

R.mentavis = {
  pal: { o: 'ink', p: 'pnk1', q: 'pnk0', l: 'pnk2', s: 'pur2', w: 'white', K: 'white' },
  draw(g) {
    // long ear-fins sweeping down from the crown
    g.tri(10, 14, 4, 30, 14, 22, 'q');
    g.tri(38, 14, 44, 30, 34, 22, 'q');
    // robed body, widening to the hem
    g.tri(13, 44, 24, 18, 35, 44, 's');
    g.tri(17, 44, 24, 30, 31, 44, 'q');
    // great cranium
    g.ball(24, 14, 12, 11, 'p', 'l', 'q');
    // hands folded at the chest
    g.ellipse(21, 30, 3, 2, 'p');
    g.ellipse(27, 30, 3, 2, 'p');
    g.outline('o');
    g.seam(['p', 'l'], ['s', 'q'], 'o');
    // calm knowing eyes
    g.eyeAlmond(15, 13, 6, 4);
    g.eyeAlmond(26, 13, 6, 4);
    // psychic motes
    g.set(8, 6, 'l'); g.set(40, 7, 'l'); g.set(24, 1, 'l');
  }
};

R.gloopit = {
  pal: { o: 'ink', p: 'pur2', q: 'pur1', l: 'pur3', K: 'white' },
  draw(g) {
    // droplet body
    g.ball(24, 30, 13, 11, 'p', 'l', 'q');
    g.tri(18, 22, 24, 8, 30, 22, 'p');
    // drips
    g.ellipse(12, 38, 3, 4, 'q');
    g.ellipse(37, 36, 3, 4, 'q');
    // bubbles
    g.ring(31, 24, 3, 3, 'l', 0.6);
    g.ring(17, 33, 2, 2, 'l', 0.7);
    g.outline('o');
    g.eye(16, 26, 5, 6);
    g.eye(27, 26, 5, 6);
    g.ellipse(22, 36, 3, 2, 'o');               // goopy grin
  }
};

R.sludgeon = {
  pal: { o: 'ink', p: 'pur1', q: 'pur0', l: 'pur2', s: 'stn1', t: 'brn1', K: 'white' },
  draw(g) {
    // hulking sludge mass
    g.ball(24, 26, 16, 14, 'p', 'l', 'q');
    g.tri(12, 12, 18, 4, 24, 14, 'p');
    g.tri(26, 13, 33, 6, 37, 16, 'p');
    // heavy fists
    g.ball(6, 32, 5, 6, 'p', 'l', 'q');
    g.ball(42, 32, 5, 6, 'p', 'l', 'q');
    // embedded rocks + mud
    g.rect(28, 20, 4, 3, 's');
    g.rect(15, 30, 3, 3, 's');
    g.rect(33, 32, 3, 3, 't');
    // ooze skirt
    g.tri(10, 38, 16, 45, 22, 38, 'q');
    g.tri(24, 39, 30, 46, 36, 39, 'q');
    g.outline('o');
    g.eye(15, 20, 5, 5);
    g.eye(26, 20, 5, 5);
    g.line(18, 30, 26, 30, 'o', 1);
    g.set(27, 31, 'o'); g.set(17, 31, 'o');
  }
};

R.vipelash = {
  pal: { o: 'ink', p: 'pur2', q: 'pur1', y: 'yel1', w: 'white', K: 'white' },
  draw(g) {
    // coiled base
    g.ring(24, 34, 13, 8, 'p', 0.55);
    g.ring(24, 36, 8, 5, 'q', 0.6);
    // raised neck + head
    g.line(31, 30, 34, 16, 'p', 4);
    g.ball(32, 12, 8, 7, 'p', null, 'q');
    // whip tail raised left
    g.line(12, 30, 7, 20, 'q', 2);
    g.ellipse(6, 17, 2, 3, 'y');
    // belly bands
    g.line(28, 22, 36, 22, 'y', 1);
    g.line(28, 26, 36, 26, 'y', 1);
    g.outline('o');
    g.line(27, 9, 31, 9, 'o', 1);
    g.eye(28, 10, 3, 4);
    g.eye(34, 10, 3, 4);
    g.set(26, 15, 'w'); g.set(28, 16, 'w');     // fangs
  }
};

R.cobrawl = {
  pal: { o: 'ink', p: 'pur1', q: 'pur0', l: 'pur2', y: 'yel1', r: 'red2', K: 'white' },
  draw(g) {
    // coiled lower body
    g.ring(24, 38, 13, 7, 'p', 0.55);
    // upright torso
    g.line(24, 34, 24, 20, 'p', 6);
    // hood flared
    g.tri(10, 8, 24, 2, 22, 22, 'l');
    g.tri(38, 8, 24, 2, 26, 22, 'l');
    g.ball(24, 12, 8, 8, 'p', null, 'q');
    // boxing fists
    g.ball(10, 26, 5, 5, 'r', null, null);
    g.ball(38, 26, 5, 5, 'r', null, null);
    g.line(17, 24, 12, 26, 'p', 4);
    g.line(31, 24, 36, 26, 'p', 4);
    // hood eyespots
    g.set(14, 12, 'y'); g.set(15, 12, 'y');
    g.set(33, 12, 'y'); g.set(34, 12, 'y');
    g.outline('o');
    g.seam(['r'], ['p', 'q', 'l'], 'o');
    g.line(19, 9, 23, 9, 'o', 1);
    g.eye(20, 10, 3, 4);
    g.eye(26, 10, 3, 4);
    g.line(22, 17, 26, 17, 'o', 1);
  }
};

// ========================================================= MID REGION ======

R.chillip = {
  pal: { o: 'ink', i: 'ice1', j: 'ice2', k: 'ice3', g: 'grn2', K: 'white' },
  draw(g) {
    g.line(24, 36, 24, 42, 'g', 2);             // frosty stem
    g.ellipse(18, 40, 4, 2, 'g');
    g.ellipse(30, 41, 4, 2, 'g');
    // tight ice bud
    g.ball(24, 24, 9, 12, 'i', 'k', null);
    g.tri(17, 18, 24, 4, 26, 20, 'j');
    g.tri(24, 18, 31, 6, 31, 22, 'i');
    g.set(20, 12, 'k'); g.set(27, 10, 'k');
    g.outline('o');
    g.eye(19, 26, 4, 5);
    g.eye(27, 26, 4, 5);
    g.line(22, 33, 25, 33, 'o', 1);
  }
};

R.glacielle = {
  pal: { o: 'ink', i: 'ice1', j: 'ice2', k: 'ice3', w: 'white', g: 'grn2', K: 'white' },
  draw(g) {
    // ice petal ring, bases rooted under the face
    g.tri(16, 22, 24, 0, 32, 22, 'j');
    g.tri(15, 21, 0, 10, 17, 32, 'j');
    g.tri(33, 21, 48, 10, 31, 32, 'j');
    g.tri(16, 28, 4, 42, 25, 33, 'k');
    g.tri(32, 28, 44, 42, 23, 33, 'k');
    // face core
    g.ball(24, 25, 10, 10, 'i', 'k', null);
    g.line(24, 38, 24, 45, 'g', 2);
    g.outline('o');
    g.seam(['i'], ['j', 'k'], 'o');
    g.eye(18, 22, 4, 5);
    g.eye(26, 22, 4, 5);
    g.line(21, 30, 25, 30, 'o', 1);
    g.set(15, 10, 'w'); g.set(36, 14, 'w');
  }
};

R.borealisk = {
  pal: { o: 'ink', i: 'ice1', j: 'ice2', k: 'ice3', d: 'blu1', w: 'white', K: 'white' },
  draw(g) {
    // serpentine body sweeping up
    g.line(8, 42, 20, 38, 'i', 6);
    g.line(20, 38, 32, 30, 'i', 6);
    g.line(32, 30, 36, 18, 'i', 6);
    // tail fin
    g.tri(4, 44, 12, 38, 4, 36, 'j');
    // frost mane
    g.tri(26, 16, 18, 4, 32, 8, 'k');
    g.tri(32, 14, 30, 0, 42, 6, 'k');
    // head, prominent
    g.ball(36, 12, 11, 9, 'i', 'k', 'd');
    g.tri(45, 6, 53, 3, 47, 14, 'j');           // horn
    g.line(28, 16, 36, 18, 'd', 1);             // jaw line
    // belly ridges
    g.line(14, 41, 18, 40, 'w', 1);
    g.line(24, 35, 28, 33, 'w', 1);
    g.line(32, 26, 35, 23, 'w', 1);
    g.outline('o');
    g.seam(['k'], ['i', 'd'], 'o');
    g.eyeAlmond(30, 9, 6, 4);
    g.set(28, 16, 'w');                          // fang
  }
};

R.wyrmble = {
  pal: { o: 'ink', p: 'pur2', q: 'pur1', l: 'pur3', y: 'yel1', K: 'white' },
  draw(g) {
    g.ball(24, 30, 11, 11, 'p', 'l', 'q');
    // tiny wings
    g.tri(10, 22, 4, 14, 14, 18, 'q');
    g.tri(38, 22, 44, 14, 34, 18, 'q');
    // big head
    g.ball(24, 17, 10, 9, 'p', 'l', 'q');
    // horn nubs
    g.ellipse(17, 8, 2, 3, 'y');
    g.ellipse(31, 8, 2, 3, 'y');
    // belly plate
    g.ellipse(24, 34, 6, 6, 'l');
    g.outline('o');
    g.eye(18, 14, 4, 6);
    g.eye(27, 14, 4, 6);
    g.line(21, 23, 26, 23, 'o', 1);
    g.line(17, 40, 17, 44, 'p', 3);
    g.line(30, 40, 30, 44, 'p', 3);
  }
};

R.drakoil = {
  pal: { o: 'ink', p: 'pur1', q: 'pur0', l: 'pur2', y: 'yel1', K: 'white' },
  draw(g) {
    // coiled body
    g.ring(24, 32, 14, 10, 'p', 0.5);
    g.ring(24, 34, 8, 6, 'l', 0.5);
    // neck rising
    g.line(33, 26, 36, 14, 'p', 5);
    g.ball(34, 10, 8, 7, 'p', 'l', 'q');
    // back spikes
    g.tri(12, 24, 9, 17, 17, 21, 'y');
    g.tri(20, 21, 19, 13, 26, 18, 'y');
    g.tri(40, 4, 44, 0, 45, 7, 'y');
    g.outline('o');
    g.seam(['y'], ['p', 'q', 'l'], 'o');
    g.line(29, 7, 34, 7, 'o', 1);
    g.eye(30, 8, 4, 4);
    g.set(27, 13, 'K');                          // fang glint
  }
};

R.dracrown = {
  w: 56, h: 56,
  pal: { o: 'ink', p: 'pur1', q: 'pur0', l: 'pur2', s: 'pur0', y: 'yel1', Y: 'yel2', K: 'yel2' },
  draw(g) {
    // shadow wings
    g.tri(14, 18, 0, 4, 6, 28, 's');
    g.tri(42, 18, 56, 4, 50, 28, 's');
    // powerful body
    g.ball(28, 34, 16, 14, 'p', 'l', 'q');
    // tail sweep
    g.line(42, 42, 52, 38, 'p', 4);
    g.tri(50, 34, 56, 38, 51, 42, 'y');
    // legs
    g.rect(16, 44, 7, 9, 'p');
    g.rect(34, 44, 7, 9, 'q');
    // head held high
    g.ball(28, 16, 11, 10, 'p', 'l', 'q');
    // the crown of horns
    g.tri(17, 10, 14, 1, 22, 7, 'Y');
    g.tri(24, 7, 27, 0, 30, 7, 'Y');
    g.tri(34, 7, 41, 1, 38, 10, 'Y');
    // chest plate
    g.ellipse(26, 38, 8, 7, 'l');
    g.outline('o');
    g.seam(['Y', 'y'], ['p', 'q', 'l'], 'o');
    g.seam(['s'], ['p', 'q', 'l'], 'o');
    // regal burning eyes
    g.eyeAlmond(20, 13, 5, 4);
    g.eyeAlmond(31, 13, 5, 4);
    g.line(24, 22, 31, 22, 'o', 1);
    g.set(22, 24, 'K'); g.set(33, 24, 'K');     // fangs
  }
};

R.cindermite = {
  pal: { o: 'ink', c: 'org2', d: 'org1', f: 'yel2', e: 'org3', K: 'white' },
  draw(g) {
    g.ball(24, 28, 12, 10, 'c', 'e', 'd');
    // ember shell dots
    g.set(20, 24, 'f'); g.set(21, 24, 'f');
    g.set(28, 26, 'f'); g.set(29, 26, 'f');
    g.set(24, 32, 'f');
    // head
    g.ball(15, 22, 7, 6, 'c', 'e', 'd');
    g.line(11, 15, 8, 10, 'd', 1);
    g.line(17, 14, 19, 9, 'd', 1);
    g.set(8, 9, 'f'); g.set(19, 8, 'f');
    // legs
    g.line(16, 34, 13, 39, 'd', 2);
    g.line(22, 36, 20, 41, 'd', 2);
    g.line(29, 36, 30, 41, 'd', 2);
    g.line(34, 33, 37, 38, 'd', 2);
    g.outline('o');
    g.eye(11, 19, 3, 4);
    g.eye(17, 19, 3, 4);
  }
};

R.pyroach = {
  pal: { o: 'ink', c: 'org1', d: 'red0', f: 'yel2', e: 'org2', K: 'white' },
  draw(g) {
    // flame carapace
    g.ball(26, 26, 14, 12, 'c', 'e', 'd');
    g.tri(18, 16, 22, 6, 28, 14, 'e');
    g.tri(28, 14, 34, 6, 38, 16, 'f');
    g.line(22, 22, 34, 30, 'd', 1);             // wing split
    // head
    g.ball(13, 20, 7, 6, 'c', 'e', 'd');
    g.line(9, 13, 5, 7, 'd', 1);
    g.line(15, 12, 17, 6, 'd', 1);
    g.set(5, 6, 'f'); g.set(17, 5, 'f');
    // six legs
    g.line(16, 32, 11, 38, 'd', 3);
    g.line(23, 35, 20, 42, 'd', 3);
    g.line(31, 35, 33, 42, 'd', 3);
    g.line(37, 31, 42, 37, 'd', 3);
    g.outline('o');
    g.line(8, 17, 12, 17, 'o', 1);
    g.eye(9, 18, 3, 4);
    g.eye(14, 18, 3, 4);
    g.set(30, 20, 'f'); g.set(24, 24, 'f');
  }
};

R.trotling = {
  pal: { o: 'ink', b: 'org2', d: 'org1', w: 'tan1', f: 'yel2', m: 'org3', K: 'white' },
  draw(g) {
    // smoke mane along the neck
    g.ellipse(17, 9, 4, 5, 'm');
    g.ellipse(20, 14, 4, 5, 'f');
    g.ellipse(22, 20, 4, 5, 'm');
    // body
    g.ball(27, 30, 12, 9, 'b', 'w', 'd');
    // legs
    g.line(19, 37, 19, 45, 'b', 3);
    g.line(25, 38, 25, 46, 'b', 3);
    g.line(32, 38, 32, 46, 'd', 3);
    g.line(37, 37, 37, 45, 'd', 3);
    // neck + head
    g.line(19, 26, 16, 18, 'b', 5);
    g.ball(14, 15, 7, 6, 'b', 'w', 'd');
    g.ellipse(8, 17, 3, 3, 'w');                // muzzle
    g.tri(16, 8, 19, 4, 21, 9, 'b');            // ear
    // flame tail
    g.ellipse(40, 26, 3, 5, 'f');
    g.ellipse(41, 30, 3, 4, 'm');
    g.outline('o');
    g.seam(['f', 'm'], ['b', 'd', 'w'], 'o');
    g.eye(10, 13, 3, 4);
    g.set(7, 18, 'o');
  }
};

R.gallopyre = {
  pal: { o: 'ink', b: 'org1', d: 'red0', w: 'tan0', f: 'yel2', m: 'org3', e: 'org2', K: 'white' },
  draw(g) {
    // blazing mane
    g.ellipse(18, 6, 4, 6, 'f');
    g.ellipse(23, 10, 5, 6, 'm');
    g.ellipse(27, 16, 5, 5, 'f');
    g.ellipse(30, 22, 4, 5, 'm');
    // strong body
    g.ball(29, 30, 14, 10, 'b', 'e', 'd');
    // legs mid-stride
    g.line(18, 37, 16, 46, 'b', 4);
    g.line(25, 39, 25, 47, 'b', 4);
    g.line(33, 39, 34, 47, 'd', 4);
    g.line(39, 36, 42, 45, 'd', 4);
    // neck + noble head
    g.line(20, 26, 15, 16, 'b', 6);
    g.ball(13, 13, 8, 7, 'b', 'e', 'd');
    g.ellipse(6, 16, 3, 3, 'w');
    g.tri(15, 5, 18, 1, 20, 7, 'b');
    // flame tail
    g.ellipse(44, 24, 4, 7, 'f');
    g.ellipse(43, 31, 3, 5, 'm');
    g.outline('o');
    g.seam(['f', 'm'], ['b', 'd', 'e', 'w'], 'o');
    g.line(9, 10, 13, 10, 'o', 1);
    g.eye(10, 11, 3, 4);
    g.set(5, 17, 'o');
  }
};

R.puddlit = {
  pal: { o: 'ink', b: 'blu2', l: 'blu3', d: 'blu1', K: 'white' },
  draw(g) {
    // puddle base
    g.ellipse(24, 38, 16, 5, 'd');
    g.ellipse(24, 37, 14, 4, 'b');
    // soft dome rising from it
    g.ball(24, 28, 10, 10, 'b', 'l', 'd');
    // droplet on top
    g.tri(21, 17, 24, 11, 27, 17, 'l');
    g.outline('o');
    g.eye(18, 25, 4, 6);
    g.eye(26, 25, 4, 6);
    g.line(21, 33, 25, 33, 'o', 1);
    g.set(17, 38, 'l'); g.set(33, 39, 'l');     // ripple glints
  }
};

R.pondrake = {
  pal: { o: 'ink', b: 'blu2', l: 'blu3', d: 'blu1', g: 'leaf2', h: 'leaf1', y: 'org2', K: 'white' },
  draw(g) {
    g.ball(26, 30, 13, 11, 'b', 'l', 'd');
    // neck + head
    g.line(17, 24, 14, 16, 'b', 5);
    g.ball(14, 12, 8, 7, 'b', 'l', 'd');
    // bill
    g.ellipse(6, 14, 4, 3, 'y');
    // lily pad hat
    g.ellipse(15, 5, 7, 3, 'g');
    g.tri(15, 4, 20, 2, 19, 6, 'h');
    // wing
    g.ellipse(31, 28, 5, 7, 'd');
    // tail curl
    g.line(38, 34, 43, 30, 'd', 2);
    g.outline('o');
    g.seam(['g', 'h'], ['b', 'l', 'd'], 'o');
    g.seam(['y'], ['b', 'l', 'd'], 'o');
    g.eye(10, 10, 3, 4);
    g.set(5, 15, 'o');
    g.line(18, 40, 18, 44, 'y', 2);
    g.line(28, 41, 28, 45, 'y', 2);
  }
};

R.clamlet = {
  pal: { o: 'ink', s: 'blu1', t: 'blu0', u: 'blu2', w: 'white', p: 'pnk2', K: 'white' },
  draw(g) {
    // lower shell
    g.ball(24, 32, 14, 9, 's', 'u', 't');
    // upper shell, slightly open
    g.ball(24, 20, 14, 9, 's', 'u', 't');
    g.line(11, 20, 7, 16, 's', 2);              // shell horns
    g.line(37, 20, 41, 16, 's', 2);
    // shell ridges
    g.line(16, 14, 14, 20, 't', 1);
    g.line(24, 12, 24, 18, 't', 1);
    g.line(32, 14, 34, 20, 't', 1);
    // the gap with peeking eyes
    g.rect(14, 25, 20, 4, 'o');
    g.set(18, 26, 'K'); g.set(19, 26, 'K');
    g.set(27, 26, 'K'); g.set(28, 26, 'K');
    g.outline('o');
    g.set(24, 27, 'p');                          // tongue tip
  }
};

R.pearlock = {
  pal: { o: 'ink', s: 'blu1', t: 'blu0', u: 'blu2', w: 'white', p: 'pnk2', i: 'ice3', K: 'white' },
  draw(g) {
    // wide open shell
    g.ball(24, 14, 16, 9, 's', 'u', 't');       // top half
    g.ball(24, 36, 16, 9, 's', 'u', 't');       // bottom half
    g.tri(6, 14, 2, 8, 10, 10, 's');
    g.tri(42, 14, 46, 8, 38, 10, 's');
    g.line(14, 8, 12, 14, 't', 1);
    g.line(24, 5, 24, 12, 't', 1);
    g.line(34, 8, 36, 14, 't', 1);
    // mantle + glowing pearl
    g.ellipse(24, 26, 13, 6, 'p');
    g.ball(24, 25, 6, 6, 'i', 'w', null);
    g.set(22, 23, 'K'); g.set(23, 23, 'K');
    g.outline('o');
    g.seam(['p', 'i', 'w'], ['s', 'u', 't'], 'o');
    g.eye(12, 24, 3, 4);
    g.eye(33, 24, 3, 4);
  }
};

R.tidepup = {
  pal: { o: 'ink', b: 'blu2', l: 'blu3', d: 'blu1', w: 'white', K: 'white' },
  draw(g) {
    // plump seal body tapering to tail
    g.ball(22, 26, 13, 12, 'b', 'l', 'd');
    g.tri(32, 32, 44, 28, 42, 40, 'b');         // tail flipper
    g.ellipse(19, 32, 8, 7, 'w');               // belly
    // flippers
    g.tri(10, 32, 2, 38, 12, 40, 'd');
    g.tri(28, 36, 34, 44, 22, 43, 'd');
    // whisker dots + snout
    g.ellipse(15, 22, 5, 4, 'w');
    g.outline('o');
    g.seam(['w'], ['b', 'l', 'd'], 'd');
    g.eye(12, 16, 4, 5);
    g.eye(21, 16, 4, 5);
    g.set(14, 22, 'o'); g.set(15, 22, 'o');
    g.set(11, 25, 'o'); g.set(19, 25, 'o');
  }
};

R.selkrest = {
  pal: { o: 'ink', b: 'blu1', l: 'blu2', d: 'blu0', w: 'white', i: 'ice2', K: 'white' },
  draw(g) {
    // ice crest fin
    g.tri(20, 10, 26, 0, 30, 10, 'i');
    g.tri(27, 10, 34, 4, 35, 12, 'i');
    // long elegant body
    g.ball(24, 24, 12, 13, 'b', 'l', 'd');
    g.line(30, 34, 38, 40, 'b', 6);
    g.tri(36, 36, 47, 34, 44, 46, 'b');         // tail
    g.ellipse(20, 28, 7, 8, 'w');
    // flippers
    g.tri(11, 28, 3, 34, 12, 37, 'd');
    g.outline('o');
    g.seam(['w'], ['b', 'l', 'd'], 'd');
    g.seam(['i'], ['b', 'l', 'd'], 'o');
    g.line(13, 15, 18, 15, 'o', 1);
    g.eye(14, 16, 4, 5);
    g.eye(22, 16, 4, 5);
    g.set(12, 22, 'o'); g.set(13, 22, 'o');
  }
};

R.zappling = {
  pal: { o: 'ink', s: 'stn1', t: 'stn0', y: 'yel1', Y: 'yel2', l: 'ice3', K: 'white' },
  draw(g) {
    // glowing abdomen
    g.ball(30, 32, 9, 9, 'y', 'Y', null);
    g.set(28, 30, 'Y'); g.set(31, 33, 'Y');
    // thorax + head
    g.ball(20, 24, 8, 8, 's', null, 't');
    g.ball(13, 16, 7, 6, 's', null, 't');
    // wings
    g.tri(22, 12, 30, 2, 34, 14, 'l');
    g.tri(28, 16, 38, 8, 40, 20, 'l');
    // antennae
    g.line(9, 10, 5, 4, 't', 1);
    g.line(16, 9, 18, 3, 't', 1);
    g.outline('o');
    g.seam(['y', 'Y'], ['s', 't'], 'o');
    g.seam(['l'], ['s', 't', 'y'], 'o');
    g.eye(9, 13, 3, 4);
    g.eye(15, 13, 3, 4);
    g.line(14, 32, 10, 37, 't', 2);
    g.line(20, 34, 18, 39, 't', 2);
  }
};

R.luminbolt = {
  pal: { o: 'ink', s: 'stn1', t: 'stn2', y: 'yel1', Y: 'yel2', l: 'ice3', e: 'org2', K: 'white' },
  draw(g) {
    // big glowing tail orb
    g.ball(32, 32, 11, 11, 'y', 'Y', 'e');
    g.set(29, 28, 'Y'); g.set(34, 34, 'Y');
    // body + head
    g.ball(18, 24, 9, 9, 's', 't', null);
    g.ball(11, 14, 7, 7, 's', 't', null);
    // two wing pairs
    g.tri(18, 10, 26, 0, 30, 12, 'l');
    g.tri(24, 14, 34, 4, 38, 18, 'l');
    g.tri(14, 28, 6, 38, 18, 36, 'l');
    // antennae
    g.line(7, 8, 3, 2, 's', 1);
    g.line(14, 7, 16, 1, 's', 1);
    g.outline('o');
    g.seam(['y', 'Y', 'e'], ['s'], 'o');
    g.seam(['l'], ['s', 'y'], 'o');
    g.eyeGlow(7, 11, 4, 4);
    g.eyeGlow(13, 11, 4, 4);
  }
};

R.staticub = {
  pal: { o: 'ink', y: 'yel1', Y: 'yel2', d: 'org2', w: 'tan1', K: 'white' },
  draw(g) {
    // round cub with static fur spikes
    g.ball(24, 28, 13, 12, 'y', 'Y', 'd');
    g.tri(10, 20, 4, 16, 11, 26, 'y');
    g.tri(36, 18, 43, 14, 38, 25, 'y');
    g.tri(16, 16, 13, 8, 22, 14, 'y');
    g.tri(27, 14, 33, 7, 34, 16, 'y');
    // round ears
    g.ellipse(14, 12, 4, 4, 'y');
    g.ellipse(33, 11, 4, 4, 'y');
    // muzzle
    g.ellipse(22, 30, 6, 5, 'w');
    g.outline('o');
    g.seam(['w'], ['y', 'Y', 'd'], 'd');
    g.eye(16, 22, 4, 5);
    g.eye(27, 22, 4, 5);
    g.set(21, 29, 'o'); g.set(22, 29, 'o');
    g.line(20, 33, 24, 33, 'o', 1);
    g.ellipse(14, 40, 4, 3, 'y');
    g.ellipse(32, 40, 4, 3, 'y');
  }
};

R.voltursa = {
  pal: { o: 'ink', y: 'yel1', Y: 'yel2', d: 'org1', w: 'tan1', K: 'white' },
  draw(g) {
    // towering bear, standing
    g.ball(24, 30, 14, 16, 'y', 'Y', 'd');
    // spiked shoulders
    g.tri(8, 22, 2, 14, 12, 18, 'y');
    g.tri(40, 22, 46, 14, 36, 18, 'y');
    g.tri(14, 14, 10, 5, 20, 11, 'y');
    g.tri(28, 11, 36, 4, 36, 13, 'y');
    // head
    g.ball(24, 14, 9, 8, 'y', 'Y', 'd');
    g.ellipse(15, 7, 3, 3, 'y');
    g.ellipse(33, 6, 3, 3, 'y');
    // belly bolt mark
    g.line(22, 28, 27, 32, 'w', 2);
    g.line(27, 32, 23, 37, 'w', 2);
    // paws
    g.ball(9, 36, 5, 5, 'y', null, 'd');
    g.ball(39, 36, 5, 5, 'y', null, 'd');
    g.outline('o');
    g.line(18, 11, 23, 11, 'o', 1);
    g.line(26, 11, 31, 11, 'o', 1);
    g.eye(19, 12, 4, 4);
    g.eye(27, 12, 4, 4);
    g.line(22, 19, 27, 19, 'o', 1);
  }
};

R.gravelit = {
  pal: { o: 'ink', s: 'stn2', t: 'stn1', u: 'stn3', K: 'white' },
  draw(g) {
    // angular chunk
    g.tri(10, 36, 14, 12, 38, 18, 's');
    g.tri(10, 36, 38, 18, 40, 38, 's');
    g.tri(14, 14, 24, 8, 30, 16, 'u');
    // facets
    g.line(22, 14, 18, 34, 't', 1);
    g.line(30, 18, 34, 36, 't', 1);
    // stub arms
    g.ellipse(8, 28, 3, 3, 't');
    g.ellipse(42, 30, 3, 3, 't');
    g.outline('o');
    g.eye(19, 22, 4, 5);
    g.eye(28, 23, 4, 5);
    g.line(22, 31, 26, 31, 'o', 1);
  }
};

R.cragnaw = {
  pal: { o: 'ink', s: 'stn1', t: 'stn0', u: 'stn2', w: 'white', K: 'white' },
  draw(g) {
    // massive boulder body
    g.ball(24, 24, 17, 16, 's', 'u', 't');
    // the JAW
    g.rect(10, 28, 28, 8, 'o');
    g.tri(12, 28, 16, 33, 19, 28, 'w');
    g.tri(21, 28, 24, 33, 27, 28, 'w');
    g.tri(29, 28, 32, 33, 35, 28, 'w');
    g.rect(10, 35, 28, 4, 't');                  // lower jaw
    // brow ridge
    g.line(12, 14, 20, 12, 't', 2);
    g.line(28, 12, 36, 14, 't', 2);
    // arms
    g.ball(6, 26, 4, 6, 's', null, 't');
    g.ball(42, 26, 4, 6, 's', null, 't');
    g.outline('o');
    g.eye(15, 16, 5, 5);
    g.eye(28, 16, 5, 5);
    g.line(14, 40, 17, 42, 't', 1);
  }
};

R.forgelet = {
  pal: { o: 'ink', s: 'stn1', t: 'stn0', u: 'stn2', f: 'org2', F: 'yel2', r: 'red2', K: 'white' },
  draw(g) {
    // boxy furnace body
    g.rect(12, 18, 24, 22, 's');
    g.rect(14, 14, 20, 5, 'u');
    // chimney
    g.rect(28, 6, 6, 9, 't');
    g.ellipse(31, 5, 3, 2, 'f');
    // glowing belly grate
    g.rect(17, 26, 14, 8, 'o');
    g.rect(18, 27, 12, 6, 'f');
    g.set(20, 29, 'F'); g.set(24, 28, 'F'); g.set(27, 30, 'F');
    g.line(18, 30, 29, 30, 'o', 1);
    // rivets
    g.set(14, 20, 'u'); g.set(33, 20, 'u');
    g.set(14, 36, 'u'); g.set(33, 36, 'u');
    // little legs
    g.rect(15, 40, 5, 4, 't');
    g.rect(28, 40, 5, 4, 't');
    g.outline('o');
    g.eye(17, 19, 4, 4);
    g.eye(26, 19, 4, 4);
  }
};

R.smeltitan = {
  pal: { o: 'ink', s: 'stn1', t: 'stn0', u: 'stn2', v: 'stn3', f: 'org2', F: 'yel2', K: 'white' },
  draw(g) {
    // broad furnace torso
    g.rect(8, 16, 32, 24, 's');
    g.rect(10, 12, 28, 6, 'u');
    // twin chimneys
    g.rect(10, 2, 6, 11, 't');
    g.rect(32, 2, 6, 11, 't');
    g.ellipse(13, 2, 3, 2, 'f');
    g.ellipse(35, 2, 3, 2, 'f');
    // molten core
    g.rect(15, 22, 18, 10, 'o');
    g.rect(16, 23, 16, 8, 'f');
    g.set(19, 25, 'F'); g.set(24, 24, 'F'); g.set(28, 27, 'F'); g.set(21, 28, 'F');
    g.line(16, 27, 31, 27, 'o', 1);
    // mighty arms
    g.rect(2, 18, 6, 16, 'u');
    g.rect(40, 18, 6, 16, 'u');
    g.ball(5, 36, 4, 4, 's', 'v', 't');
    g.ball(43, 36, 4, 4, 's', 'v', 't');
    // legs
    g.rect(13, 40, 8, 7, 't');
    g.rect(27, 40, 8, 7, 't');
    g.outline('o');
    g.eyeGlow(15, 15, 5, 4, 'F');
    g.eyeGlow(28, 15, 5, 4, 'F');
    g.set(11, 19, 'v'); g.set(36, 19, 'v');
  }
};

R.duneling = {
  pal: { o: 'ink', b: 'tan0', d: 'brn3', w: 'tan1', s: 'yel1', K: 'white' },
  draw(g) {
    // sand it swims through
    g.ellipse(24, 41, 18, 5, 'w');
    g.ellipse(24, 40, 16, 4, 'b');
    // breaching body, nose tipped up-left
    g.ball(21, 27, 13, 12, 'b', 'w', 'd');
    g.tri(6, 28, 14, 20, 14, 34, 'b');          // snout wedge
    // tall dorsal fin
    g.tri(22, 18, 31, 2, 34, 20, 'd');
    // pale belly toward the sand
    g.ellipse(19, 34, 9, 5, 'w');
    g.outline('o');
    g.seam(['d'], ['b'], 'o');
    // shark face: one big eye this side, gill line, mouth
    g.eye(13, 21, 5, 5);
    g.eye(25, 21, 5, 5);
    g.line(8, 31, 13, 32, 'o', 1);              // mouth
    g.line(28, 28, 28, 32, 'd', 1);             // gill
    g.set(31, 38, 'd'); g.set(14, 39, 'd');     // sand ripples
  }
};

R.scorpide = {
  pal: { o: 'ink', b: 'brn3', d: 'brn2', t: 'brn1', p: 'pur2', K: 'white' },
  draw(g) {
    // segmented tail arcing overhead
    g.ball(38, 30, 4, 4, 'b', null, 'd');
    g.ball(41, 22, 4, 4, 'b', null, 'd');
    g.ball(40, 14, 4, 4, 'b', null, 'd');
    g.tri(36, 8, 40, 2, 42, 10, 'p');           // stinger
    // body
    g.ball(24, 30, 12, 9, 'b', null, 'd');
    g.line(18, 24, 30, 24, 't', 1);
    g.line(17, 28, 31, 28, 't', 1);
    // claws
    g.ball(8, 22, 5, 5, 'b', null, 'd');
    g.ball(8, 16, 4, 3, 'b', null, 'd');
    g.set(5, 19, 'o');
    g.ball(20, 18, 5, 4, 'b', null, 'd');       // head
    // legs
    g.line(16, 36, 11, 41, 't', 2);
    g.line(23, 38, 21, 43, 't', 2);
    g.line(30, 37, 33, 42, 't', 2);
    g.outline('o');
    g.seam(['p'], ['b', 'd'], 'o');
    g.eye(17, 15, 3, 4);
    g.eye(23, 15, 3, 4);
  }
};

// ===================================================== LATE REGION =========

R.fluffit = {
  pal: { o: 'ink', w: 'white', l: 'lgry', p: 'pnk2', s: 'skn2', K: 'white' },
  draw(g) {
    g.ball(24, 26, 13, 12, 'w', null, 'l');
    g.ellipse(13, 18, 5, 5, 'w');
    g.ellipse(24, 13, 6, 5, 'w');
    g.ellipse(35, 17, 5, 5, 'w');
    g.ellipse(37, 30, 4, 5, 'l');
    g.ellipse(11, 30, 4, 5, 'l');
    g.outline('o');
    g.eye(17, 23, 4, 5);
    g.eye(26, 23, 4, 5);
    g.set(15, 30, 'p'); g.set(16, 30, 'p');     // cheeks
    g.set(30, 30, 'p'); g.set(31, 30, 'p');
    g.line(21, 31, 25, 31, 'o', 1);
    g.ellipse(17, 40, 3, 2, 's');
    g.ellipse(30, 40, 3, 2, 's');
  }
};

R.cumulfluff = {
  pal: { o: 'ink', w: 'white', l: 'lgry', p: 'pnk2', b: 'sky1', K: 'white' },
  draw(g) {
    // cloud body with winglike puffs
    g.ball(24, 26, 15, 11, 'w', null, 'l');
    g.ellipse(8, 22, 6, 5, 'w');
    g.ellipse(40, 22, 6, 5, 'w');
    g.ellipse(15, 15, 6, 5, 'w');
    g.ellipse(31, 13, 7, 5, 'w');
    g.ellipse(24, 36, 9, 4, 'b');               // rain shadow base
    g.outline('o');
    g.seam(['b'], ['w', 'l'], 'o');
    g.eye(18, 21, 4, 6);
    g.eye(28, 21, 4, 6);
    g.set(15, 28, 'p'); g.set(16, 28, 'p');
    g.set(32, 28, 'p'); g.set(33, 28, 'p');
    g.line(22, 30, 26, 30, 'o', 1);
  }
};

R.echolit = {
  pal: { o: 'ink', p: 'pur1', q: 'pur0', l: 'pur2', w: 'pale', K: 'white' },
  draw(g) {
    // big radar ears
    g.tri(8, 18, 6, 2, 20, 12, 'p');
    g.tri(28, 12, 40, 2, 40, 18, 'p');
    g.tri(10, 14, 9, 5, 17, 11, 'l');
    g.tri(31, 11, 38, 5, 38, 14, 'l');
    // round body
    g.ball(24, 26, 11, 11, 'p', 'l', 'q');
    // wing stubs
    g.tri(10, 26, 2, 34, 14, 36, 'q');
    g.tri(38, 26, 46, 34, 34, 36, 'q');
    g.outline('o');
    g.eye(17, 22, 4, 6);
    g.eye(26, 22, 4, 6);
    g.set(21, 30, 'w'); g.set(25, 30, 'w');     // fangs
    g.line(21, 29, 26, 29, 'o', 1);
  }
};

R.sonarath = {
  pal: { o: 'ink', p: 'pur1', q: 'pur0', l: 'pur2', w: 'pale', K: 'white' },
  draw(g) {
    // grand wings
    g.tri(16, 18, 0, 6, 4, 34, 'q');
    g.tri(32, 18, 48, 6, 44, 34, 'q');
    g.tri(14, 22, 4, 14, 7, 30, 'p');
    g.tri(34, 22, 44, 14, 41, 30, 'p');
    // body
    g.ball(24, 26, 10, 13, 'p', 'l', 'q');
    // ears
    g.tri(15, 12, 14, 1, 23, 9, 'p');
    g.tri(25, 9, 34, 1, 33, 12, 'p');
    // open shriek mouth
    g.ellipse(24, 31, 4, 3, 'o');
    g.set(21, 29, 'w'); g.set(27, 29, 'w');
    g.set(24, 33, 'w');
    g.outline('o');
    g.eyeGlow(17, 18, 4, 5);
    g.eyeGlow(27, 18, 4, 5);
  }
};

R.shroomp = {
  pal: { o: 'ink', c: 'red2', d: 'red1', w: 'tan1', s: 'skn3', K: 'white' },
  draw(g) {
    // cap
    g.ball(24, 18, 15, 10, 'c', null, 'd');
    g.ellipse(16, 14, 3, 2, 'w');
    g.ellipse(28, 12, 4, 3, 'w');
    g.ellipse(34, 19, 3, 2, 'w');
    // face/body under cap
    g.ball(24, 30, 9, 8, 's', null, null);
    g.ellipse(17, 38, 3, 3, 's');
    g.ellipse(31, 38, 3, 3, 's');
    g.outline('o');
    g.seam(['c', 'd', 'w'], ['s'], 'o');
    g.line(19, 28, 22, 28, 'o', 1);             // sleepy eyes
    g.line(26, 28, 29, 28, 'o', 1);
    g.line(22, 33, 26, 33, 'o', 1);
  }
};

R.mycelisk = {
  pal: { o: 'ink', c: 'red1', d: 'red0', w: 'tan1', s: 'skn3', l: 'pnk2', K: 'white' },
  draw(g) {
    // broad cap
    g.ball(24, 16, 19, 11, 'c', null, 'd');
    g.ellipse(12, 12, 4, 3, 'w');
    g.ellipse(26, 8, 5, 3, 'w');
    g.ellipse(36, 15, 4, 3, 'w');
    // gill skirt
    g.ellipse(24, 26, 14, 4, 'w');
    // stout body
    g.ball(24, 33, 10, 9, 's', null, null);
    g.ellipse(14, 41, 4, 3, 's');
    g.ellipse(34, 41, 4, 3, 's');
    // spore glow
    g.set(8, 24, 'l'); g.set(40, 26, 'l'); g.set(24, 45, 'l');
    g.outline('o');
    g.seam(['c', 'd'], ['w'], 'o');
    g.seam(['w'], ['s'], 'o');
    g.eye(18, 31, 4, 4);
    g.eye(27, 31, 4, 4);
    g.line(21, 38, 26, 38, 'o', 1);
  }
};

R.twinkit = {
  pal: { o: 'ink', p: 'pnk2', q: 'pnk1', w: 'white', y: 'yel2', K: 'white' },
  draw(g) {
    // star sparkles
    g.set(10, 10, 'y'); g.set(38, 12, 'y'); g.set(14, 38, 'y'); g.set(36, 36, 'y');
    // head with point
    g.ball(24, 18, 9, 9, 'p', 'w', 'q');
    g.tri(20, 10, 24, 2, 28, 10, 'p');
    // little dress body
    g.tri(14, 38, 24, 24, 34, 38, 'q');
    // arms
    g.ellipse(13, 28, 3, 2, 'p');
    g.ellipse(35, 28, 3, 2, 'p');
    g.outline('o');
    g.seam(['p', 'w'], ['q'], 'q');
    g.eye(19, 15, 4, 5);
    g.eye(27, 15, 4, 5);
    g.line(22, 22, 26, 22, 'o', 1);
  }
};

R.sylphette = {
  pal: { o: 'ink', p: 'pnk1', q: 'pnk0', w: 'white', l: 'pnk2', y: 'yel2', K: 'white' },
  draw(g) {
    // gossamer wings (rounded)
    g.ellipse(9, 18, 7, 10, 'l');
    g.ellipse(39, 18, 7, 10, 'l');
    // flowing gown
    g.tri(10, 44, 24, 18, 38, 44, 'p');
    g.tri(16, 44, 24, 28, 32, 44, 'q');
    // head + circlet
    g.ball(24, 14, 8, 8, 'w', null, 'l');
    g.line(18, 8, 30, 8, 'y', 1);
    // soft sleeve arms at the gown's sides
    g.ellipse(13, 27, 3, 2, 'w');
    g.ellipse(35, 27, 3, 2, 'w');
    g.outline('o');
    g.seam(['l'], ['p', 'q', 'w'], 'o');
    g.eye(20, 12, 3, 4);
    g.eye(26, 12, 3, 4);
    g.line(22, 18, 26, 18, 'o', 1);
    g.set(12, 32, 'y'); g.set(36, 30, 'y');
  }
};

R.hexkit = {
  pal: { o: 'ink', b: 'dgry', d: 'ink', l: 'gry', p: 'pur2', K: 'yel2' },
  draw(g) {
    // bent tail
    g.line(34, 32, 41, 26, 'b', 2);
    g.line(41, 26, 39, 20, 'b', 2);
    g.ball(24, 30, 11, 10, 'b', 'l', null);
    // ears
    g.tri(10, 14, 13, 3, 19, 11, 'b');
    g.tri(22, 11, 28, 3, 31, 14, 'b');
    g.tri(12, 10, 14, 5, 17, 9, 'p');
    g.tri(25, 9, 27, 5, 29, 10, 'p');
    g.ball(19, 18, 10, 9, 'b', 'l', null);
    g.outline('o');
    // glowing yellow eyes
    g.eyeAlmond(12, 15, 6, 4);
    g.eyeAlmond(21, 15, 6, 4);
    g.line(15, 25, 18, 26, 'o', 1);
    g.line(16, 38, 16, 43, 'b', 3);
    g.line(28, 38, 28, 43, 'b', 3);
  }
};

R.maleficat = {
  pal: { o: 'ink', b: 'dgry', l: 'gry', p: 'pur2', q: 'pur1', K: 'yel2' },
  draw(g) {
    // sickle tail
    g.line(34, 30, 42, 22, 'b', 2);
    g.ring(42, 16, 5, 6, 'b', 0.5, 250, 120);
    // lean standing body
    g.ball(26, 30, 10, 13, 'b', 'l', null);
    // collar ruff
    g.tri(14, 20, 22, 14, 20, 26, 'q');
    g.tri(34, 20, 26, 14, 30, 26, 'q');
    g.ellipse(24, 19, 8, 4, 'p');
    // long ears
    g.tri(10, 10, 13, 0, 18, 8, 'b');
    g.tri(22, 8, 28, 0, 31, 10, 'b');
    g.ball(20, 12, 9, 8, 'b', 'l', null);
    // legs
    g.line(20, 41, 19, 47, 'b', 3);
    g.line(31, 41, 32, 47, 'b', 3);
    g.outline('o');
    g.seam(['p', 'q'], ['b', 'l'], 'o');
    g.eyeAlmond(13, 9, 6, 4);
    g.eyeAlmond(22, 9, 6, 4);
    g.line(17, 18, 20, 18, 'o', 1);
  }
};

R.buddle = {
  pal: { o: 'ink', g: 'leaf2', h: 'leaf3', e: 'leaf1', d: 'grn1', K: 'white' },
  draw(g) {
    // tight bud with crossed wrap leaves
    g.ball(24, 24, 12, 13, 'g', 'h', 'e');
    g.tri(12, 18, 24, 4, 26, 22, 'e');
    g.tri(36, 18, 24, 6, 23, 22, 'd');
    g.tri(20, 6, 24, 0, 28, 6, 'd');
    // feet
    g.ellipse(16, 38, 4, 3, 'e');
    g.ellipse(32, 38, 4, 3, 'e');
    g.outline('o');
    g.seam(['e', 'd'], ['g', 'h'], 'o');
    g.eye(17, 26, 4, 5);
    g.eye(27, 26, 4, 5);
    g.line(21, 33, 25, 33, 'o', 1);
  }
};

R.bloomot = {
  pal: { o: 'ink', g: 'leaf2', h: 'leaf3', e: 'leaf1', p: 'pnk1', q: 'pnk2', y: 'yel1', K: 'white' },
  draw(g) {
    // half-open petals, rooted at the core
    g.tri(24, 21, 10, 2, 27, 10, 'p');
    g.tri(24, 21, 38, 2, 21, 10, 'q');
    g.tri(19, 23, 2, 12, 10, 30, 'p');
    g.tri(29, 23, 46, 12, 38, 30, 'q');
    // face core
    g.ball(24, 22, 9, 9, 'y', null, null);
    // body + leaf arms
    g.ball(24, 35, 9, 8, 'g', 'h', 'e');
    g.tri(12, 32, 4, 28, 12, 38, 'e');
    g.tri(36, 32, 44, 28, 36, 38, 'e');
    g.outline('o');
    g.seam(['y'], ['p', 'q', 'g', 'h'], 'o');
    g.seam(['p', 'q'], ['g', 'h', 'e'], 'o');
    g.eye(20, 20, 3, 4);
    g.eye(26, 20, 3, 4);
    g.line(22, 26, 26, 26, 'o', 1);
  }
};

R.florazor = {
  pal: { o: 'ink', g: 'leaf1', h: 'leaf2', e: 'grn1', s: 'stn3', i: 'stn2', y: 'yel1', K: 'white' },
  draw(g) {
    // blade petals (steel), rooted at the core
    g.tri(24, 20, 12, 0, 28, 8, 's');
    g.tri(24, 20, 36, 0, 20, 8, 'i');
    g.tri(19, 23, 0, 10, 8, 28, 's');
    g.tri(29, 23, 48, 10, 40, 28, 'i');
    g.tri(20, 30, 4, 40, 16, 40, 's');
    g.tri(28, 30, 44, 40, 32, 40, 'i');
    // core face
    g.ball(24, 22, 8, 8, 'y', null, null);
    // armored stem body
    g.ball(24, 36, 9, 9, 'g', 'h', 'e');
    g.rect(20, 44, 3, 4, 'e');
    g.rect(26, 44, 3, 4, 'e');
    g.outline('o');
    g.seam(['y'], ['s', 'i', 'g', 'h'], 'o');
    g.seam(['s', 'i'], ['g', 'h', 'e'], 'o');
    g.eyeGlow(19, 19, 4, 4);
    g.eyeGlow(26, 19, 4, 4);
    g.line(22, 27, 26, 27, 'o', 1);
  }
};

// ====================================================== STANDALONES ========

R.petalisk = {
  pal: { o: 'ink', g: 'leaf2', e: 'leaf1', p: 'pnk1', q: 'pnk2', y: 'yel1', K: 'white' },
  draw(g) {
    // coiled serpent body
    g.ring(26, 32, 14, 9, 'g', 0.5);
    g.ring(26, 34, 8, 5, 'e', 0.55);
    // neck + head
    g.line(33, 26, 35, 14, 'g', 4);
    g.ball(34, 11, 7, 6, 'g', null, 'e');
    // petal frill around the head
    g.tri(26, 6, 22, 0, 30, 3, 'p');
    g.tri(33, 3, 36, 0, 40, 4, 'q');
    g.tri(42, 8, 47, 4, 46, 12, 'p');
    g.tri(26, 14, 21, 12, 24, 18, 'q');
    g.outline('o');
    g.seam(['p', 'q'], ['g', 'e'], 'o');
    g.line(30, 9, 34, 9, 'o', 1);
    g.eye(31, 10, 3, 4);
    g.set(29, 14, 'y');                          // pollen fleck
  }
};

R.slumbear = {
  pal: { o: 'ink', b: 'brn2', d: 'brn1', w: 'tan1', K: 'white' },
  draw(g) {
    // mountainous sleeping bear
    g.ball(24, 28, 17, 15, 'b', null, 'd');
    // belly
    g.ellipse(24, 34, 11, 8, 'w');
    // head resting on chest
    g.ball(24, 16, 11, 9, 'b', null, 'd');
    g.ellipse(15, 8, 4, 4, 'b');
    g.ellipse(33, 7, 4, 4, 'b');
    // muzzle
    g.ellipse(24, 20, 6, 4, 'w');
    g.outline('o');
    g.seam(['w'], ['b', 'd'], 'd');
    // deep-sleep eyes
    g.line(17, 14, 20, 14, 'o', 1);
    g.line(28, 14, 31, 14, 'o', 1);
    g.set(23, 19, 'o'); g.set(24, 19, 'o');
    g.line(22, 22, 26, 22, 'o', 1);
    // paws folded
    g.ellipse(12, 38, 5, 4, 'b');
    g.ellipse(36, 38, 5, 4, 'b');
  }
};

R.snowl = {
  pal: { o: 'ink', w: 'white', l: 'lgry', i: 'ice2', y: 'org2', K: 'white' },
  draw(g) {
    g.ball(24, 26, 13, 15, 'w', null, 'l');
    // ice brow tufts
    g.tri(12, 12, 8, 2, 19, 9, 'i');
    g.tri(29, 9, 40, 2, 36, 12, 'i');
    // facial disc
    g.ring(24, 20, 10, 8, 'l', 0.25);
    // wing
    g.ellipse(34, 28, 5, 9, 'l');
    // beak + talons
    g.tri(22, 24, 26, 24, 24, 28, 'y');
    g.outline('o');
    g.seam(['i'], ['w', 'l'], 'o');
    g.eye(17, 17, 5, 5);
    g.eye(27, 17, 5, 5);
    g.line(18, 41, 18, 44, 'y', 2);
    g.line(29, 41, 29, 44, 'y', 2);
    g.rect(16, 44, 5, 1, 'o');
    g.rect(27, 44, 5, 1, 'o');
  }
};

R.ashvole = {
  pal: { o: 'ink', b: 'brn2', d: 'brn1', w: 'tan0', f: 'org2', F: 'yel2', K: 'white' },
  draw(g) {
    g.ball(24, 30, 13, 11, 'b', 'w', 'd');
    // ember back stripe
    g.ellipse(28, 22, 7, 3, 'f');
    g.set(25, 21, 'F'); g.set(31, 22, 'F');
    // head
    g.ball(15, 24, 8, 7, 'b', 'w', 'd');
    g.ellipse(9, 27, 3, 2, 'w');
    g.ellipse(11, 16, 3, 3, 'b');
    g.ellipse(21, 15, 3, 3, 'b');
    g.outline('o');
    g.seam(['f', 'F'], ['b', 'd', 'w'], 'o');
    g.eye(11, 21, 3, 4);
    g.eye(18, 21, 3, 4);
    g.set(8, 28, 'o');
    // digging paws
    g.ellipse(13, 38, 4, 3, 'w');
    g.ellipse(31, 39, 4, 3, 'w');
  }
};

R.squidrift = {
  pal: { o: 'ink', p: 'pur1', q: 'pur0', l: 'pur2', b: 'blu1', K: 'white' },
  draw(g) {
    // dome mantle
    g.ball(24, 18, 13, 13, 'p', 'l', 'q');
    g.tri(14, 8, 18, 2, 22, 8, 'p');
    g.tri(27, 8, 31, 2, 35, 9, 'p');
    // tentacles
    g.line(14, 30, 10, 42, 'q', 2);
    g.line(20, 32, 18, 44, 'p', 2);
    g.line(27, 32, 29, 44, 'p', 2);
    g.line(33, 30, 38, 42, 'q', 2);
    g.line(10, 42, 7, 40, 'q', 2);
    g.line(38, 42, 41, 40, 'q', 2);
    // glow spots
    g.set(17, 13, 'b'); g.set(29, 11, 'b'); g.set(23, 22, 'b');
    g.outline('o');
    g.eye(17, 18, 4, 6);
    g.eye(27, 18, 4, 6);
  }
};

R.magnewt = {
  pal: { o: 'ink', b: 'blu2', d: 'blu1', l: 'blu3', s: 'stn3', i: 'stn2', y: 'yel1', K: 'white' },
  draw(g) {
    // magnet-coil tail
    g.ring(38, 30, 7, 7, 's', 0.45);
    g.ring(38, 30, 4, 4, 'i', 0.6);
    // low newt body
    g.ball(22, 30, 13, 9, 'b', 'l', 'd');
    // head
    g.ball(12, 24, 8, 7, 'b', 'l', 'd');
    // bolt cheeks
    g.set(8, 27, 'y'); g.set(9, 27, 'y');
    g.set(16, 27, 'y'); g.set(17, 27, 'y');
    // legs
    g.line(14, 36, 12, 42, 'b', 2);
    g.line(24, 38, 23, 44, 'b', 2);
    g.line(32, 36, 34, 42, 'd', 2);
    // back studs
    g.set(20, 24, 'i'); g.set(26, 25, 'i'); g.set(31, 27, 'i');
    g.outline('o');
    g.seam(['s', 'i'], ['b', 'l', 'd'], 'o');
    g.eye(8, 20, 3, 4);
    g.eye(14, 20, 3, 4);
  }
};

R.owlume = {
  pal: { o: 'ink', b: 'pur1', d: 'pur0', l: 'pur2', y: 'yel2', w: 'pale', K: 'yel2' },
  draw(g) {
    g.ball(24, 26, 13, 15, 'b', 'l', 'd');
    // crescent crest
    g.ring(24, 8, 7, 5, 'y', 0.45, 180, 360);
    // glowing eye rings
    g.ring(17, 19, 6, 6, 'y', 0.3);
    g.ring(31, 19, 6, 6, 'y', 0.3);
    // wing
    g.ellipse(34, 28, 5, 10, 'd');
    // chest feathers
    g.line(20, 34, 22, 38, 'l', 1);
    g.line(26, 34, 26, 38, 'l', 1);
    g.outline('o');
    g.seam(['y'], ['b', 'l', 'd'], 'o');
    g.eyeGlow(15, 17, 5, 5);
    g.eyeGlow(29, 17, 5, 5);
    g.tri(22, 24, 26, 24, 24, 27, 'w');
    g.line(18, 41, 18, 44, 'w', 2);
    g.line(29, 41, 29, 44, 'w', 2);
  }
};

R.mossquito = {
  pal: { o: 'ink', g: 'grn2', e: 'grn1', h: 'leaf3', s: 'stn1', K: 'white' },
  draw(g) {
    // leaf wings
    g.tri(20, 14, 8, 2, 12, 20, 'h');
    g.tri(28, 14, 40, 2, 36, 20, 'h');
    g.line(12, 10, 16, 16, 'e', 1);
    g.line(36, 10, 32, 16, 'e', 1);
    // thin body
    g.ball(24, 24, 7, 9, 'g', 'h', 'e');
    g.ball(24, 34, 5, 6, 'g', null, 'e');
    // head + proboscis
    g.ball(24, 13, 6, 5, 'g', 'h', 'e');
    g.line(24, 18, 24, 28, 'e', 1);
    g.line(20, 8, 17, 3, 'e', 1);
    g.line(28, 8, 31, 3, 'e', 1);
    // legs
    g.line(18, 28, 12, 34, 's', 2);
    g.line(30, 28, 36, 34, 's', 2);
    g.line(19, 33, 14, 40, 's', 2);
    g.line(29, 33, 34, 40, 's', 2);
    g.outline('o');
    g.eye(20, 11, 3, 4);
    g.eye(26, 11, 3, 4);
  }
};

R.lanternox = {
  pal: { o: 'ink', s: 'stn1', t: 'stn0', u: 'stn2', f: 'org2', F: 'yel2', p: 'pur2', K: 'white' },
  draw(g) {
    // hanging hook
    g.ring(24, 6, 4, 4, 's', 0.5, 120, 60);
    // lantern body
    g.rect(14, 12, 20, 26, 's');
    g.rect(16, 10, 16, 4, 'u');
    g.rect(16, 36, 16, 4, 'u');
    // glass window with living flame
    g.rect(17, 16, 14, 18, 'o');
    g.rect(18, 17, 12, 16, 'p');
    g.ball(24, 26, 4, 6, 'f', 'F', null);
    g.tri(22, 20, 24, 15, 26, 20, 'f');
    g.set(23, 24, 'F'); g.set(24, 23, 'F');
    // face on the flame
    g.set(22, 25, 'o'); g.set(26, 25, 'o');
    g.outline('o');
    g.set(15, 14, 'u'); g.set(32, 14, 'u');
  }
};

R.somnolux = {
  pal: { o: 'ink', p: 'pur2', q: 'pur1', l: 'pur3', w: 'pale', y: 'yel2', K: 'white' },
  draw(g) {
    // broad soft wings
    g.tri(20, 22, 2, 8, 6, 32, 'p');
    g.tri(28, 22, 46, 8, 42, 32, 'p');
    g.tri(18, 26, 6, 36, 16, 38, 'q');
    g.tri(30, 26, 42, 36, 32, 38, 'q');
    // crescent moons on wings
    g.ring(11, 18, 4, 4, 'y', 0.5, 90, 300);
    g.ring(37, 18, 4, 4, 'y', 0.5, 240, 90);
    // plump fuzzy body
    g.ball(24, 26, 7, 11, 'w', null, 'l');
    g.ball(24, 14, 7, 6, 'w', null, 'l');
    // antennae plumes
    g.line(20, 9, 15, 3, 'q', 2);
    g.line(28, 9, 33, 3, 'q', 2);
    g.outline('o');
    g.seam(['w', 'l'], ['p', 'q'], 'o');
    g.line(20, 12, 23, 12, 'o', 1);             // sleeping eyes
    g.line(25, 12, 28, 12, 'o', 1);
    g.set(13, 30, 'y'); g.set(35, 31, 'y');     // dream dust
  }
};

R.marionyx = {
  pal: { o: 'ink', w: 'pale', l: 'lgry', p: 'pur2', q: 'pur1', r: 'red2', K: 'white' },
  draw(g) {
    // cut strings
    g.line(12, 2, 12, 7, 'l', 1);
    g.line(24, 1, 24, 5, 'l', 1);
    g.line(36, 2, 36, 7, 'l', 1);
    // jointed arms
    g.ball(10, 22, 3, 3, 'w', null, 'l');
    g.line(13, 24, 16, 28, 'w', 2);
    g.ball(38, 22, 3, 3, 'w', null, 'l');
    g.line(35, 24, 32, 28, 'w', 2);
    // body
    g.ball(24, 30, 9, 9, 'p', null, 'q');
    // porcelain head
    g.ball(24, 15, 9, 9, 'w', null, 'l');
    // crack
    g.line(29, 8, 31, 14, 'q', 1);
    // jointed legs
    g.ball(18, 41, 3, 3, 'w', null, 'l');
    g.ball(30, 41, 3, 3, 'w', null, 'l');
    g.outline('o');
    g.seam(['w', 'l'], ['p', 'q'], 'o');
    // painted face
    g.eye(18, 12, 4, 5);
    g.eye(26, 12, 4, 5);
    g.set(16, 19, 'r'); g.set(31, 19, 'r');     // cheek paint
    g.line(21, 20, 27, 20, 'o', 1);
  }
};

R.kickaroo = {
  pal: { o: 'ink', b: 'brn3', d: 'brn2', w: 'tan1', r: 'red2', K: 'white' },
  draw(g) {
    // tail prop
    g.line(34, 34, 44, 42, 'd', 4);
    // body upright
    g.ball(24, 28, 11, 13, 'b', 'w', 'd');
    g.ellipse(22, 32, 6, 7, 'w');
    // boxing mitts
    g.ball(9, 24, 5, 5, 'r', null, null);
    g.ball(37, 20, 5, 5, 'r', null, null);
    g.line(15, 26, 11, 25, 'b', 3);
    g.line(33, 24, 36, 22, 'b', 3);
    // head + ears
    g.ball(22, 13, 8, 7, 'b', 'w', 'd');
    g.tri(14, 8, 13, 0, 19, 6, 'b');
    g.tri(25, 6, 30, 0, 30, 8, 'b');
    // springy feet
    g.tri(10, 42, 24, 40, 22, 46, 'b');
    g.tri(26, 42, 40, 40, 28, 46, 'd');
    g.outline('o');
    g.seam(['r'], ['b', 'd', 'w'], 'o');
    g.eye(17, 11, 3, 4);
    g.eye(24, 11, 3, 4);
    g.set(15, 16, 'o');
  }
};

R.bamboxer = {
  pal: { o: 'ink', w: 'pale', k: 'dgry', g: 'grn2', e: 'grn1', K: 'white' },
  draw(g) {
    // bamboo staff over shoulder
    g.line(36, 6, 44, 40, 'g', 2);
    g.line(37, 14, 41, 13, 'e', 1);
    g.line(39, 26, 43, 25, 'e', 1);
    // round panda body
    g.ball(22, 30, 13, 12, 'w', null, null);
    // black arms band
    g.ellipse(11, 26, 4, 7, 'k');
    g.ellipse(33, 26, 4, 7, 'k');
    // head
    g.ball(22, 14, 10, 9, 'w', null, null);
    g.ellipse(13, 7, 4, 4, 'k');
    g.ellipse(31, 7, 4, 4, 'k');
    // eye patches
    g.ellipse(17, 13, 3, 4, 'k');
    g.ellipse(27, 13, 3, 4, 'k');
    // legs
    g.ellipse(14, 41, 5, 4, 'k');
    g.ellipse(30, 41, 5, 4, 'k');
    g.outline('o');
    g.seam(['k'], ['w'], 'o');
    g.set(17, 13, 'K'); g.set(27, 13, 'K');
    g.set(21, 18, 'o'); g.set(22, 18, 'o');
    g.line(20, 21, 24, 21, 'o', 1);
  }
};

R.crystallith = {
  pal: { o: 'ink', s: 'stn2', t: 'stn1', u: 'stn3', c: 'pnk2', C: 'pnk1', i: 'ice3', K: 'white' },
  draw(g) {
    // faceted crystal body
    g.tri(10, 38, 16, 8, 30, 14, 's');
    g.tri(10, 38, 30, 14, 38, 40, 's');
    g.tri(16, 10, 26, 2, 32, 12, 'u');
    // crystal shards
    g.tri(4, 26, 0, 14, 12, 20, 'c');
    g.tri(38, 22, 46, 10, 46, 26, 'c');
    g.tri(20, 6, 26, 0, 30, 8, 'i');
    // faceted diamond core
    g.tri(23, 21, 17, 27, 29, 27, 'i');
    g.tri(17, 27, 29, 27, 23, 34, 'c');
    g.set(21, 25, 'K');
    // facet lines
    g.line(18, 12, 14, 34, 't', 1);
    g.line(28, 16, 33, 36, 't', 1);
    g.outline('o');
    g.seam(['c', 'C', 'i'], ['s', 'u', 't'], 'o');
    g.eye(17, 18, 4, 5);
    g.eye(26, 18, 4, 5);
  }
};

R.zephyrant = {
  pal: { o: 'ink', b: 'sky0', l: 'ice2', d: 'blu1', w: 'white', y: 'yel2', K: 'white' },
  draw(g) {
    // ribbon body waving across the frame
    g.line(6, 38, 16, 30, 'b', 4);
    g.line(16, 30, 28, 34, 'b', 4);
    g.line(28, 34, 38, 26, 'b', 4);
    g.line(38, 26, 40, 16, 'b', 5);
    // streamers
    g.line(6, 38, 2, 44, 'l', 2);
    g.line(10, 35, 6, 42, 'l', 1);
    // small wings
    g.tri(34, 14, 28, 6, 38, 10, 'l');
    g.tri(44, 12, 50, 5, 48, 14, 'l');
    // head
    g.ball(40, 12, 7, 6, 'b', 'l', 'd');
    // horns
    g.line(36, 7, 33, 3, 'y', 2);
    g.line(44, 6, 46, 2, 'y', 2);
    g.outline('o');
    g.line(36, 9, 41, 9, 'o', 1);
    g.eye(37, 10, 3, 4);
    g.set(34, 14, 'w');
  }
};

R.mimicrate = {
  pal: { o: 'ink', t: 'brn1', s: 'brn2', u: 'brn3', p: 'pur1', K: 'yel2' },
  draw(g) {
    // wooden crate
    g.rect(10, 14, 28, 26, 's');
    g.rect(10, 14, 28, 4, 'u');
    g.rect(10, 36, 28, 4, 'u');
    g.line(10, 24, 37, 24, 't', 1);
    g.line(18, 14, 18, 39, 't', 1);
    g.line(29, 14, 29, 39, 't', 1);
    // the crack, glowing within
    g.rect(13, 26, 22, 6, 'o');
    g.rect(14, 27, 20, 4, 'p');
    // eyes + grin in the dark
    g.set(18, 28, 'K'); g.set(19, 28, 'K');
    g.set(28, 28, 'K'); g.set(29, 28, 'K');
    g.set(21, 30, 'K'); g.set(23, 30, 'K'); g.set(25, 30, 'K');
    // little tongue hanging out
    g.tri(31, 32, 35, 32, 33, 37, 'p');
    g.outline('o');
    g.set(11, 16, 't'); g.set(36, 16, 't');     // nails
    g.set(11, 37, 't'); g.set(36, 37, 't');
  }
};

R.wreckraith = {
  pal: { o: 'ink', t: 'brn1', s: 'brn2', u: 'brn3', b: 'blu2', l: 'ice2', w: 'pale', K: 'white' },
  draw(g) {
    // spectral mist it rises from
    g.ellipse(22, 42, 14, 5, 'l');
    g.ellipse(34, 39, 7, 4, 'l');
    g.ellipse(11, 39, 5, 3, 'l');
    // curved prow hull, leaning like a sinking bow
    g.tri(12, 44, 20, 10, 30, 44, 's');
    g.tri(20, 14, 30, 12, 29, 44, 't');
    g.line(13, 42, 19, 12, 'u', 2);             // keel edge highlight
    // hull planks
    g.line(16, 28, 28, 26, 't', 1);
    g.line(15, 36, 29, 34, 't', 1);
    // carved maiden figurehead leaning out
    g.ball(16, 10, 7, 7, 'w', null, 'l');
    g.tri(22, 4, 31, 3, 26, 13, 'u');           // carved hair sweeping back
    g.line(11, 16, 8, 22, 'w', 2);              // carved arm on the bow
    // barnacles
    g.ellipse(17, 31, 2, 2, 'u');
    g.ellipse(25, 22, 2, 2, 'u');
    g.ellipse(20, 39, 2, 2, 'u');
    // waterline glow
    g.line(14, 41, 28, 39, 'b', 1);
    g.outline('o');
    g.seam(['w'], ['s', 't', 'u'], 'o');
    g.seam(['l'], ['s', 't'], 'o');
    g.line(11, 7, 15, 7, 'o', 1);
    g.eye(12, 8, 3, 4);
    g.eye(18, 8, 3, 4);
    g.line(14, 14, 17, 14, 'o', 1);
  }
};

R.hummingale = {
  pal: { o: 'ink', b: 'sky0', l: 'ice2', d: 'blu1', w: 'white', p: 'pnk2', y: 'org2', K: 'white' },
  draw(g) {
    // wing blur (rooted at the shoulder)
    g.tri(22, 20, 36, 2, 38, 18, 'l');
    g.tri(24, 22, 42, 12, 40, 24, 'l');
    // small body
    g.ball(22, 26, 9, 10, 'b', 'l', 'd');
    g.ellipse(19, 30, 5, 5, 'w');
    // tail streamers
    g.line(28, 33, 38, 40, 'd', 2);
    g.line(26, 35, 32, 44, 'l', 2);
    // head + long beak
    g.ball(16, 16, 6, 6, 'b', 'l', 'd');
    g.line(10, 14, 2, 11, 'y', 1);
    // throat shimmer
    g.set(14, 21, 'p'); g.set(15, 21, 'p'); g.set(16, 22, 'p');
    g.outline('o');
    g.eye(13, 13, 3, 4);
    g.eye(19, 13, 3, 4);
  }
};

// ======================================================== LEGENDARIES ======

R.astradrax = {
  w: 56, h: 56,
  pal: { o: 'ink', p: 'pur1', q: 'pur0', l: 'pur2', b: 'blu2', i: 'ice2', y: 'yel2', K: 'white' },
  draw(g) {
    // vast star-wings sweeping up from mid-body
    g.tri(26, 30, 2, 4, 10, 34, 'q');
    g.tri(28, 30, 8, 12, 14, 34, 'p');
    g.tri(38, 28, 54, 8, 52, 32, 'q');
    // serpentine body: S-curve from tail (bottom-left) to head (top-right)
    g.line(8, 50, 20, 46, 'p', 6);
    g.line(20, 46, 32, 38, 'p', 7);
    g.line(32, 38, 38, 28, 'p', 7);
    g.line(38, 28, 38, 16, 'p', 6);
    // tail star
    g.tri(2, 44, 10, 48, 2, 54, 'i');
    // belly ridges along the curve
    g.line(16, 48, 20, 47, 'b', 1);
    g.line(26, 43, 30, 40, 'b', 1);
    g.line(34, 33, 37, 29, 'b', 1);
    g.line(36, 22, 39, 20, 'b', 1);
    // head
    g.ball(38, 11, 9, 8, 'p', 'l', 'q');
    // crescent crown
    g.ring(30, 6, 5, 6, 'i', 0.45, 90, 320);
    g.ring(46, 5, 5, 6, 'i', 0.45, 220, 90);
    // snout
    g.ellipse(30, 14, 4, 3, 'l');
    g.outline('o');
    g.seam(['i'], ['p', 'q', 'l'], 'o');
    // starlight eyes
    g.eyeAlmond(32, 9, 5, 4);
    g.eyeAlmond(40, 9, 5, 4);
    // constellation along the spine + sky
    g.set(22, 42, 'y'); g.set(33, 34, 'y'); g.set(39, 22, 'y');
    g.set(8, 10, 'y'); g.set(52, 18, 'y'); g.set(18, 22, 'y'); g.set(28, 2, 'y');
  }
};

R.lumifae = {
  w: 56, h: 56,
  pal: { o: 'ink', w: 'white', l: 'pnk2', p: 'pnk1', y: 'yel2', i: 'ice3', g: 'leaf3', K: 'white' },
  draw(g) {
    // halo ring
    g.ring(28, 12, 13, 11, 'y', 0.18);
    // radiant gown
    g.tri(10, 52, 28, 16, 46, 52, 'w');
    g.tri(16, 52, 28, 28, 40, 52, 'l');
    g.tri(22, 52, 28, 38, 34, 52, 'p');
    // arms open in welcome
    g.line(18, 30, 8, 24, 'w', 3);
    g.line(38, 30, 48, 24, 'w', 3);
    g.ellipse(7, 22, 3, 3, 'w');
    g.ellipse(49, 22, 3, 3, 'w');
    // serene head
    g.ball(28, 14, 8, 8, 'w', null, 'l');
    // petal crown
    g.tri(20, 8, 18, 2, 25, 6, 'l');
    g.tri(26, 5, 28, 0, 31, 5, 'p');
    g.tri(32, 6, 38, 2, 36, 9, 'l');
    g.outline('o');
    g.seam(['y'], ['w', 'l', 'p'], 'o');
    // gentle closed eyes
    g.line(23, 13, 26, 13, 'o', 1);
    g.line(30, 13, 33, 13, 'o', 1);
    g.line(26, 18, 30, 18, 'o', 1);
    // dawn motes
    g.set(10, 36, 'y'); g.set(46, 36, 'y'); g.set(6, 12, 'i');
    g.set(50, 12, 'i'); g.set(28, 30, 'g'); g.set(16, 44, 'y'); g.set(40, 44, 'y');
  }
};

// ====================================================== TRAINER ART ========
// Battle-scene humans. makeHuman builds a standard 48x48 portrait from a
// spec; distinct silhouettes come from hair/build/prop choices.
function makeHuman(spec) {
  return {
    w: 48, h: 48,
    pal: Object.assign({
      o: 'ink', s: 'skn2', t: 'skn1', K: 'white',
      h: spec.hairColor || 'brn1', i: spec.hairLite || 'brn2',
      j: spec.top || 'blu2', k: spec.topDark || 'blu1',
      p: spec.bottom || 'stn1', e: spec.shoes || 'dgry',
      a: spec.accent || 'red2'
    }, spec.extraPal || {}),
    draw(g) {
      const hair = spec.hair || 'short';
      // head
      g.ball(24, 14, 9, 9, 's', null, 't');
      // hair styles
      if (hair === 'spiky') {
        g.tri(15, 10, 18, 1, 23, 8, 'h');
        g.tri(21, 7, 26, 0, 30, 7, 'h');
        g.tri(28, 8, 33, 2, 35, 11, 'i');
        g.tri(15, 13, 15, 7, 26, 6, 'h');
        g.tri(24, 6, 33, 7, 33, 14, 'i');
      } else if (hair === 'cap') {
        g.ball(24, 9, 10, 5, 'a', null, null);
        g.rect(14, 9, 20, 3, 'a');
        g.tri(10, 12, 24, 9, 24, 13, 'a');     // brim
        g.rect(15, 11, 18, 2, 'h');
      } else if (hair === 'long') {
        g.ball(24, 9, 10, 6, 'h', 'i', null);
        g.rect(14, 9, 4, 16, 'h');
        g.rect(30, 9, 4, 16, 'h');
        g.tri(14, 24, 18, 24, 16, 28, 'h');
        g.tri(30, 24, 34, 24, 32, 28, 'h');
      } else if (hair === 'bald') {
        g.ring(24, 10, 9, 6, 'h', 0.3, 180, 360);
      } else if (hair === 'bun') {
        g.ball(24, 8, 9, 5, 'h', 'i', null);
        g.ellipse(24, 4, 4, 3, 'h');
      } else { // short
        g.ball(24, 9, 10, 6, 'h', 'i', null);
        g.rect(15, 9, 18, 4, 'h');
      }
      // torso
      const broad = spec.build === 'broad' ? 4 : 0;
      g.rect(15 - broad / 2, 24, 18 + broad, 13, 'j');
      g.rect(23, 25, 2, 11, 'k');
      // arms
      g.rect(12 - broad / 2, 25, 3, 11, 'j');
      g.rect(33 + broad / 2, 25, 3, 11, 'k');
      g.rect(12 - broad / 2, 36, 3, 3, 's');
      g.rect(33 + broad / 2, 36, 3, 3, 's');
      // legs + shoes
      g.rect(17, 37, 6, 8, 'p');
      g.rect(25, 37, 6, 8, 'p');
      g.rect(16, 44, 7, 3, 'e');
      g.rect(25, 44, 7, 3, 'e');
      // cape for the champion
      if (spec.cape) {
        g.tri(13 - broad / 2, 25, 6, 46, 15, 44, 'a');
        g.tri(35 + broad / 2, 25, 42, 46, 33, 44, 'a');
      }
      g.outline('o');
      g.seam(['s', 't'], ['h', 'i', 'a'], 'o');
      g.seam(['j', 'k'], ['s', 'p', 'a'], 'o');
      // face
      g.rect(19, 14, 3, 3, 'o'); g.set(20, 15, 'K');
      g.rect(26, 14, 3, 3, 'o'); g.set(27, 15, 'K');
      g.line(21, 20, 26, 20, 'o', 1);
      if (spec.beard) {
        g.rect(18, 19, 12, 4, 'h');
        g.line(20, 19, 27, 19, 'o', 1);
      }
      if (spec.draw) spec.draw(g);
    }
  };
}

R.__trainers = {
  // generic classes
  trainer_youngster: makeHuman({ hair: 'cap', hairColor: 'brn1', top: 'yel1', topDark: 'org2', bottom: 'blu1', accent: 'red2' }),
  trainer_lass: makeHuman({ hair: 'long', hairColor: 'org2', hairLite: 'org3', top: 'pnk1', topDark: 'pnk0', bottom: 'pale', accent: 'pnk2' }),
  trainer_hiker: makeHuman({ hair: 'bald', hairColor: 'brn1', build: 'broad', top: 'brn2', topDark: 'brn1', bottom: 'brn1', beard: true, accent: 'brn3' }),
  trainer_ace: makeHuman({ hair: 'spiky', hairColor: 'dgry', hairLite: 'gry', top: 'stn1', topDark: 'stn0', bottom: 'stn0', accent: 'blu2' }),
  // gym leaders
  trainer_bram: makeHuman({ hair: 'bald', hairColor: 'dgry', build: 'broad', top: 'brn1', topDark: 'brn0', bottom: 'stn1', beard: true, accent: 'tan0' }),
  trainer_maris: makeHuman({ hair: 'long', hairColor: 'blu1', hairLite: 'blu2', top: 'blu2', topDark: 'blu1', bottom: 'ice2', accent: 'ice3' }),
  trainer_tess: makeHuman({ hair: 'spiky', hairColor: 'yel1', hairLite: 'yel2', top: 'yel1', topDark: 'org2', bottom: 'stn0', accent: 'yel2' }),
  trainer_vesper: makeHuman({ hair: 'bun', hairColor: 'pur1', hairLite: 'pur2', top: 'pur1', topDark: 'pur0', bottom: 'pur0', accent: 'pur3' }),
  // champion
  trainer_aldric: makeHuman({ hair: 'short', hairColor: 'lgry', hairLite: 'pale', top: 'stn0', topDark: 'ink', bottom: 'stn1', cape: true, accent: 'red1' }),
  // player seen from behind, bottom-anchored (drawn on the player platform)
  trainer_player_back: {
    w: 56, h: 40,
    pal: { o: 'ink', h: 'brn1', i: 'brn2', j: 'blu2', k: 'blu1', s: 'skn2' },
    draw(g) {
      // shoulders/torso (bottom-cropped by the canvas)
      g.ellipse(28, 38, 19, 14, 'j');
      g.rect(9, 32, 39, 8, 'j');
      // jacket shading on the right
      g.tri(38, 26, 47, 40, 33, 40, 'k');
      // neck + head with messy hair
      g.rect(25, 18, 7, 4, 's');
      g.ball(28, 11, 10, 10, 'h', 'i', null);
      g.tri(18, 6, 22, 1, 25, 7, 'h');
      g.tri(24, 5, 28, 0, 32, 5, 'h');
      g.tri(31, 7, 36, 1, 38, 8, 'h');
      g.outline('o');
      g.seam(['h', 'i'], ['j', 'k', 's'], 'o');
    }
  },

  // rival Kai: silver spikes, violet jacket, permanent smirk
  trainer_kai: {
    w: 48, h: 48,
    pal: { o: 'ink', l: 'lgry', d: 'gry', s: 'skn2', t: 'skn1', P: 'pur2', Q: 'pur1', p: 'stn1', e: 'dgry', K: 'white' },
    draw(g) {
      // hair spikes
      g.tri(15, 10, 19, 1, 24, 9, 'l');
      g.tri(21, 8, 26, 0, 30, 8, 'l');
      g.tri(28, 9, 33, 2, 36, 11, 'd');
      // head
      g.ball(24, 14, 9, 9, 's', null, 't');
      // hair fringe
      g.tri(15, 13, 15, 7, 26, 7, 'l');
      g.tri(24, 7, 33, 7, 33, 14, 'd');
      // torso jacket
      g.rect(15, 24, 18, 13, 'P');
      g.tri(15, 24, 24, 24, 15, 30, 'Q');
      g.rect(23, 25, 2, 11, 'Q');
      // arms
      g.rect(12, 25, 3, 11, 'P');
      g.rect(33, 25, 3, 11, 'Q');
      g.rect(12, 36, 3, 3, 's');
      g.rect(33, 36, 3, 3, 's');
      // legs + shoes
      g.rect(17, 37, 6, 8, 'p');
      g.rect(25, 37, 6, 8, 'p');
      g.rect(16, 44, 7, 3, 'e');
      g.rect(25, 44, 7, 3, 'e');
      g.outline('o');
      g.seam(['s', 't'], ['l', 'd'], 'o');
      g.seam(['P', 'Q'], ['s', 'p'], 'o');
      // face: narrow eyes + smirk
      g.rect(19, 14, 3, 3, 'o'); g.set(20, 15, 'K');
      g.rect(26, 14, 3, 3, 'o'); g.set(27, 15, 'K');
      g.line(20, 20, 24, 21, 'o', 1);
      g.set(25, 20, 'o');
    }
  }
};

module.exports = R;















