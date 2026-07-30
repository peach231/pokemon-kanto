// pokemon-kanto — maps_kanto_int.js
// Building interiors, plus the story events that live in them.
//
// Pokemon Centres and Marts are stamped from factories: every town's Centre is
// the same room, so a player never has to re-learn where the nurse stands. The
// factories also register the respawn point, which is what "you scurried back
// to the last Centre" uses after a white-out.

(function () {
  G.MAPS = G.MAPS || {};
  G.EVENTS = G.EVENTS || {};
  var pad = G.padRows;
  function blank(w, h) { return pad([], w, h); }

  // ======================================================= Pokemon Centre ===
  // 13x8. Heal machines and the storage PC along the back wall, nurse in front
  // of them, seating in the middle, doors at x=4,5. Entry lands at (4,6).
  function healCentre(id, townName, exit) {
    G.MAPS[id] = {
      id: id, name: townName + ' POKéMON CENTER', w: 13, h: 8,
      music: 'center', battleBg: 'indoor', base: 'ifloor',
      legend: G.LEG_INT,
      ground: pad([
        'IIIIIIIIIIIII',
        'I.EEE...H..PI',
        'I...........I',
        'I...........I',
        'Io.o.....o.oI',
        'I...........I',
        'I...........I',
        'IIII..IIIIIII'
      ], 13, 8),
      deco: blank(13, 8),
      warps: [
        { x: 4, y: 7, to: exit.map, tx: exit.x, ty: exit.y, dir: 'down' },
        { x: 5, y: 7, to: exit.map, tx: exit.x, ty: exit.y, dir: 'down' }
      ],
      respawnPoint: { mapId: id, x: 4, y: 6 },
      signs: [
        { x: 11, y: 2, text: 'A storage PC hums quietly. Deposit or withdraw POKéMON here.' }
      ],
      npcs: [
        { x: 3, y: 2, sprite: 'nurse', dir: 'down', event: 'nurseHeal' },
        { x: 8, y: 2, sprite: 'gentleman', dir: 'down',
          dialog: ['The PC in the corner is linked to BILL\'s storage system.',
                   'He built it himself, apparently. Clever man.'] }
      ]
    };
  }

  // ============================================================ Poke Mart ===
  // 11x8. Shelves along the back, clerk in the open (deliberately NOT behind a
  // counter — you cannot talk through a solid tile). Entry lands at (4,6).
  function pokeMart(id, townName, exit, inventory) {
    G.MAPS[id] = {
      id: id, name: townName + ' POKéMON MART', w: 11, h: 8,
      music: 'center', battleBg: 'indoor', base: 'ifloor',
      legend: G.LEG_INT,
      ground: pad([
        'IIIIIIIIIII',
        'I.BBB.BBB.I',
        'I.........I',
        'I.........I',
        'I.........I',
        'I.........I',
        'I.........I',
        'IIII..IIIII'
      ], 11, 8),
      deco: blank(11, 8),
      warps: [
        { x: 4, y: 7, to: exit.map, tx: exit.x, ty: exit.y, dir: 'down' },
        { x: 5, y: 7, to: exit.map, tx: exit.x, ty: exit.y, dir: 'down' }
      ],
      shopInventory: inventory,
      npcs: [
        { x: 3, y: 2, sprite: 'clerk', dir: 'down', event: 'shopBuy' },
        { x: 8, y: 4, sprite: 'youngster', dir: 'left',
          dialog: ['POTIONs are cheap and they save runs.', 'Buy more than you think you need. Trust me.'] }
      ]
    };
  }

  // ============================================================ PALLET TOWN =
  G.MAPS.playerhome = {
    id: 'playerhome', name: 'Home', w: 10, h: 9,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'I(.T....PI',
      'I)..B....I',
      'I........I',
      'I..H.....I',
      'I........I',
      'I....o...I',
      'I........I',
      'IIII..IIII'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 8, to: 'pallet', tx: 5, ty: 6, dir: 'down' },
      { x: 5, y: 8, to: 'pallet', tx: 5, ty: 6, dir: 'down' }
    ],
    respawnPoint: { mapId: 'playerhome', x: 4, y: 7 },
    signs: [
      { x: 3, y: 5, text: 'A television. There is a film on about four boys walking along a railway line.' },
      { x: 3, y: 4, text: 'Your PC. Nothing in it yet but a note to yourself.' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'mom', dir: 'down', event: 'momTalk' }
    ]
  };

  G.MAPS.rivalhome = {
    id: 'rivalhome', name: "Blue's House", w: 10, h: 9,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'IP..TT..PI',
      'I........I',
      'I.B......I',
      'I........I',
      'I...o.o..I',
      'I........I',
      'I........I',
      'IIII..IIII'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 8, to: 'pallet', tx: 15, ty: 9, dir: 'down' },
      { x: 5, y: 8, to: 'pallet', tx: 15, ty: 9, dir: 'down' }
    ],
    signs: [
      { x: 2, y: 4, text: "A bookshelf of POKéMON journals, every one of them annotated in a boy's handwriting." }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'daisy', dir: 'down',
        dialog: ["Hi! My brother's out — he practically lives at Grandpa's lab.",
                 "He's been unbearable since he heard about the starters. Good luck out there."] }
    ]
  };

  // Oak's lab. Three balls on the bench; you take one and the road opens.
  G.MAPS.oakslab = {
    id: 'oakslab', name: "Prof. Oak's Lab", w: 14, h: 13,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIIIII',
      'I.BBBB..BBBB.I',
      'I............I',
      'I..HH....HH..I',
      'I............I',
      'I............I',
      'I...TTTTT....I',
      'I............I',
      'I............I',
      'I..T......T..I',
      'I............I',
      'I............I',
      'IIIIII..IIIIII'
    ], 14, 13),
    deco: blank(14, 13),
    warps: [
      { x: 6, y: 12, to: 'pallet', tx: 6, ty: 15, dir: 'down' },
      { x: 7, y: 12, to: 'pallet', tx: 7, ty: 15, dir: 'down' }
    ],
    signs: [
      { x: 2, y: 2, text: 'Shelves of research journals. Most of the spines read OAK.' },
      { x: 10, y: 4, text: 'A machine covered in dials. You decide not to touch any of them.' }
    ],
    npcs: [
      { x: 9, y: 5, sprite: 'oak', dir: 'down', event: 'oakTalk' },
      { x: 3, y: 8, sprite: 'youngster', dir: 'right',
        dialog: ["I'm Grandpa's aide. Those three balls on the bench?",
                 "One of them is going to be yours. Take your time choosing."] },
      // the three starters
      { x: 5, y: 7, sprite: 'orb_stand', obj: true, event: 'pick_bulbasaur' },
      { x: 6, y: 7, sprite: 'orb_stand', obj: true, event: 'pick_charmander' },
      { x: 7, y: 7, sprite: 'orb_stand', obj: true, event: 'pick_squirtle' }
    ]
  };

  // ========================================================= VIRIDIAN CITY ==
  healCentre('viridiancentre', 'VIRIDIAN', { map: 'viridian', x: 6, y: 6 });
  pokeMart('viridianmart', 'VIRIDIAN', { map: 'viridian', x: 20, y: 6 },
    ['potion', 'antidote', 'parlyzheal', 'awakening', 'pokeball', 'escaperope']);

  G.MAPS.viridianhouse = {
    id: 'viridianhouse', name: 'Viridian House', w: 10, h: 9,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'IP..TT..PI',
      'I........I',
      'I.B....B.I',
      'I........I',
      'I..o..o..I',
      'I........I',
      'I........I',
      'IIII..IIII'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 8, to: 'viridian', tx: 7, ty: 12, dir: 'down' },
      { x: 5, y: 8, to: 'viridian', tx: 7, ty: 12, dir: 'down' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'oldwoman', dir: 'down',
        dialog: ['My husband keeps saying he saw a GHOST in LAVENDER TOWN.',
                 "I keep saying he'd seen four drinks. We have agreed to disagree."] }
    ]
  };

  G.MAPS.viridianschool = {
    id: 'viridianschool', name: 'Trainer School', w: 11, h: 8,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIII',
      'I.BBBBBBB.I',
      'I.........I',
      'I.TT.TT.TT.'.slice(0, 10) + 'I',
      'I.oo.oo.oo.'.slice(0, 10) + 'I',
      'I.........I',
      'I.........I',
      'IIII..IIIII'
    ], 11, 8),
    deco: blank(11, 8),
    warps: [
      { x: 4, y: 7, to: 'viridian', tx: 19, ty: 12, dir: 'down' },
      { x: 5, y: 7, to: 'viridian', tx: 19, ty: 12, dir: 'down' }
    ],
    signs: [
      { x: 5, y: 2, text: 'A blackboard. TYPE MATCHUPS is written across the top and underlined twice.' }
    ],
    npcs: [
      { x: 3, y: 5, sprite: 'littleboy', dir: 'down',
        dialog: ['Teacher says a POKéMON with two types takes damage from BOTH.',
                 'So a bug that is also poison has a really bad day against psychics.'] },
      { x: 7, y: 5, sprite: 'woman2', dir: 'down',
        dialog: ['Status moves win more battles than big attacks do.',
                 'Put something to sleep and the fight is already yours.'] }
    ]
  };

  // Shuttered. Its leader is the last one you will meet, and the game does not
  // tell you that yet.
  G.MAPS.viridiangym = {
    id: 'viridiangym', name: 'Viridian Gym', w: 12, h: 10,
    music: 'gym', battleBg: 'indoor', base: 'gfloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIII',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IIIII..IIIII'
    ], 12, 10),
    deco: blank(12, 10),
    warps: [
      { x: 5, y: 9, to: 'viridian', tx: 6, ty: 20, dir: 'down' },
      { x: 6, y: 9, to: 'viridian', tx: 6, ty: 20, dir: 'down' }
    ],
    signs: [
      { x: 5, y: 4, text: 'A notice, taped up and curling at the corners: GYM CLOSED UNTIL FURTHER NOTICE.' }
    ],
    npcs: [
      { x: 8, y: 6, sprite: 'gymguy', dir: 'left',
        dialog: ['Empty, see? Has been for months.',
                 "Whoever the LEADER is, he's got business elsewhere.",
                 "...I've said too much."] }
    ]
  };

  // ============================================================== EVENTS ====

  G.EVENTS.nurseHeal = function* () {
    yield { t: 'text', s: 'Nurse: Welcome to our POKéMON CENTER! Shall I heal your POKéMON?' };
    yield {
      t: 'fn',
      fn: function () {
        for (var i = 0; i < G.player.party.length; i++) G.healMon(G.player.party[i]);
        if (G.world.map.respawnPoint) G.player.respawn = G.world.map.respawnPoint;
        G.audio.playJingle('jingle_heal');
      }
    };
    yield { t: 'wait', frames: 30 };
    yield { t: 'text', s: 'Nurse: Your POKéMON are fighting fit. We hope to see you again!' };
  };

  G.EVENTS.momTalk = function* () {
    if (!G.flags.starter) {
      yield { t: 'text', s: "Mum: Right! All boys leave home some day. It said so on TV." };
      yield { t: 'text', s: 'Mum: PROF. OAK next door is looking for you — something about POKéMON.' };
      return;
    }
    yield { t: 'text', s: 'Mum: Oh, you look tired. Take a rest.' };
    yield {
      t: 'fn',
      fn: function () {
        for (var i = 0; i < G.player.party.length; i++) G.healMon(G.player.party[i]);
        G.audio.playJingle('jingle_heal');
      }
    };
    yield { t: 'wait', frames: 30 };
    yield { t: 'text', s: 'Mum: There, all better. Now go on — and do call sometimes.' };
  };

  // Oak physically stops you leaving Pallet unarmed. In Gen 1 this is the
  // game's one hard tutorial gate, and it is the right one: the very next tile
  // north is tall grass.
  G.EVENTS.oakStopsYou = function* () {
    yield { t: 'text', s: 'PROF. OAK: Hold it right there!' };
    yield { t: 'text', s: "OAK: It's dangerous to go into the tall grass alone." };
    yield { t: 'text', s: 'OAK: Wild POKéMON live out there, and without one of your own you have nothing to answer them with.' };
    yield { t: 'text', s: 'OAK: Come to my lab. I have something for you.' };
  };

  G.EVENTS.oakTalk = function* () {
    if (!G.flags.starter) {
      yield { t: 'text', s: 'OAK: Ah, there you are. I have been expecting you.' };
      yield { t: 'text', s: 'OAK: On that bench are three POKéMON. I raised each of them myself.' };
      yield { t: 'text', s: 'OAK: You may have ONE. Choose carefully — it will be with you a long time.' };
      return;
    }
    yield { t: 'text', s: 'OAK: How is your ' + G.SPECIES[G.flags.starter].name + '? Treat it well and it will surprise you.' };
    yield { t: 'text', s: 'OAK: Take the POKéDEX north and fill it. That is the real work.' };
  };

  // Picking a starter. The preview scene lets you look before committing, so a
  // misclick never costs you the whole run.
  function starterEvent(key, blurb) {
    return function* () {
      if (G.flags.starter) {
        yield { t: 'text', s: 'The other two balls have already gone back to the shelf.' };
        return;
      }
      yield { t: 'text', s: blurb };
      var answer = { v: 1 };
      yield {
        t: 'custom',
        run: function (done) {
          G.pushScene(G.StarterPreviewScene(key, function (takeIt) {
            answer.v = takeIt ? 0 : 1;
            done();
          }));
        }
      };
      if (answer.v !== 0) {
        yield { t: 'text', s: 'You set the ball back down.' };
        return;
      }
      yield {
        t: 'fn',
        fn: function () {
          var mon = G.makeMon(key, 5);
          G.flags.starter = key;
          G.player.party.push(mon);
          G.player.dexSeen[key] = 1;
          G.player.dexCaught[key] = 1;
        }
      };
      yield { t: 'sfx', id: 'catchClick' };
      yield { t: 'text', s: 'You received a ' + G.SPECIES[key].name + '!' };
      yield { t: 'text', s: 'OAK: That one? A fine choice. It suits you.' };
      yield { t: 'text', s: 'OAK: Take this too — my POKéDEX. It records every POKéMON you meet.' };
      yield { t: 'text', s: 'OAK: There are 151 of them out there. Nobody has ever catalogued them all.' };
      yield { t: 'text', s: 'OAK: That is my life\'s work, and I am handing it to you. Off you go.' };
      yield { t: 'fn', fn: function () { G.flags.gotDex = 1; } };
    };
  }
  G.EVENTS.pick_bulbasaur = starterEvent('bulbasaur',
    'The ball holds BULBASAUR, the seed POKéMON. Steady, patient, and quietly very hard to knock over.');
  G.EVENTS.pick_charmander = starterEvent('charmander',
    'The ball holds CHARMANDER, the lizard POKéMON. All nerve and no armour — the hard road, and the fun one.');
  G.EVENTS.pick_squirtle = starterEvent('squirtle',
    'The ball holds SQUIRTLE, the tiny turtle POKéMON. Level-headed, well-armoured, and never in a hurry.');

  // ============================================================ PEWTER CITY =
  healCentre('pewtercentre', 'PEWTER', { map: 'pewter', x: 16, y: 11 });
  pokeMart('pewtermart', 'PEWTER', { map: 'pewter', x: 16, y: 17 },
    ['potion', 'antidote', 'parlyzheal', 'awakening', 'burnheal', 'pokeball', 'escaperope']);

  G.MAPS.pewterhouse = {
    id: 'pewterhouse', name: 'Pewter House', w: 10, h: 9,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'IP..TT..PI',
      'I........I',
      'I.B......I',
      'I........I',
      'I..o..o..I',
      'I........I',
      'I........I',
      'IIII..IIII'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 8, to: 'pewter', tx: 7, ty: 17, dir: 'down' },
      { x: 5, y: 8, to: 'pewter', tx: 7, ty: 17, dir: 'down' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'man', dir: 'down',
        dialog: ['BROCK trains here because the ground is stone all the way down.',
                 'His POKéMON have never known soft footing. It shows.'] }
    ]
  };

  // The museum. Its two fossils are the ones you will be offered a choice
  // between inside Mt. Moon, so seeing them here first is deliberate setup.
  G.MAPS.pewtermuseum = {
    id: 'pewtermuseum', name: 'Pewter Museum', w: 14, h: 11,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIIIII',
      'I.U........U.I',
      'I............I',
      'I..T......T..I',
      'I............I',
      'I..B......B..I',
      'I............I',
      'I.U........U.I',
      'I............I',
      'I............I',
      'IIIIII..IIIIII'
    ], 14, 11),
    deco: blank(14, 11),
    warps: [
      { x: 6, y: 10, to: 'pewter', tx: 8, ty: 5, dir: 'down' },
      { x: 7, y: 10, to: 'pewter', tx: 9, ty: 5, dir: 'down' }
    ],
    signs: [
      { x: 3, y: 4, text: 'A DOME FOSSIL, behind glass. The plaque says it is over three hundred million years old.' },
      { x: 10, y: 4, text: 'A HELIX FOSSIL. Spiral-shelled, and far better preserved than the other one.' },
      { x: 3, y: 6, text: 'A slab of AMBER with an insect sealed inside. And something larger.' }
    ],
    npcs: [
      { x: 5, y: 8, sprite: 'scientist', dir: 'down',
        dialog: ['These came out of MT. MOON. There are more still in the rock.',
                 'If you find one, bring it to the LAB on CINNABAR. They can revive them now.',
                 '...Revive them. Yes. I know how that sounds.'] },
      { x: 9, y: 2, sprite: 'gentleman', dir: 'down',
        dialog: ['A space rock fell on MT. MOON. That is what the MOON STONE is, they say.',
                 'Certain POKéMON change shape when they touch one. Nobody knows why.'] }
    ]
  };

  // ------------------------------------------------------------ PEWTER GYM --
  // Boulders on the floor, because the room should tell you the type before
  // anyone says a word.
  G.MAPS.pewtergym = {
    id: 'pewtergym', name: 'Pewter Gym', w: 12, h: 14,
    music: 'gym', battleBg: 'indoor', base: 'gfloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIII',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGUGGGGUGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGUGGGGUGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IIIII..IIIII'
    ], 12, 14),
    deco: blank(12, 14),
    warps: [
      { x: 5, y: 13, to: 'pewter', tx: 5, ty: 11, dir: 'down' },
      { x: 6, y: 13, to: 'pewter', tx: 6, ty: 11, dir: 'down' }
    ],
    npcs: [
      { x: 8, y: 11, sprite: 'gymguy', dir: 'left', event: 'pewterGymGuide' }
    ],
    trainers: [
      { x: 5, y: 2, sprite: 'brock', dir: 'down', trainer: 'brock', sight: 0 },
      { x: 3, y: 7, sprite: 'youngster', dir: 'right', trainer: 'pg_liam', sight: 4 }
    ]
  };

  G.EVENTS.pewterGymGuide = function* () {
    if (G.flags.badge1) {
      yield { t: 'text', s: 'Guide: You beat BROCK! Head east through ROUTE 3 to MT. MOON.' };
      return;
    }
    yield { t: 'text', s: "Guide: Hey! You're a new face. BROCK is the real deal." };
    yield { t: 'text', s: 'Guide: His POKéMON are ROCK type — NORMAL and FLYING moves barely dent them.' };
    yield { t: 'text', s: 'Guide: If you took BULBASAUR or SQUIRTLE, you already have the answer. If you took CHARMANDER... good luck.' };
    yield { t: 'text', s: 'Guide: Catch a MANKEY on ROUTE 22, west of VIRIDIAN. FIGHTING moves crack rock wide open.' };
  };
})();
