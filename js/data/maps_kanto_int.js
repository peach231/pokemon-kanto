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

  // Buying. The clerk offers whatever the map's `shopInventory` lists, priced
  // from items.js, and the loop keeps running until you pick Done — so stocking
  // up does not mean re-opening the menu once per Potion.
  G.EVENTS.shopBuy = function* () {
    var inv = (G.world.map.shopInventory || []).filter(function (id) { return G.ITEMS[id]; });
    if (!inv.length) {
      yield { t: 'text', s: 'Clerk: Sorry, we are waiting on a delivery.' };
      return;
    }
    yield { t: 'text', s: 'Clerk: Welcome! How can I help you?' };

    var done = { v: false };
    while (!done.v) {
      var choice = { i: -1 };
      yield {
        t: 'custom',
        run: function (resume) {
          var labels = inv.map(function (id) {
            return G.ITEMS[id].name + '  $' + G.ITEMS[id].price;
          });
          labels.push('Done');
          G.pushScene(G.Chooser({
            items: labels, cols: 2, x: 6, y: 8,
            cancelIndex: labels.length - 1,
            onPick: function (i) { choice.i = i; resume(); }
          }));
        }
      };

      if (choice.i < 0 || choice.i >= inv.length) { done.v = true; break; }

      var item = G.ITEMS[inv[choice.i]];
      if (G.player.money < item.price) {
        yield { t: 'text', s: 'Clerk: You do not have enough money for that.' };
        continue;
      }
      yield {
        t: 'fn',
        fn: function () {
          G.player.money -= item.price;
          G.player.bag[item.id] = (G.player.bag[item.id] || 0) + 1;
        }
      };
      yield { t: 'sfx', id: 'confirm' };
      yield { t: 'text', s: 'You bought a ' + item.name + '.  ($' + G.player.money + ' left)' };
    }
    yield { t: 'text', s: 'Clerk: Please come again!' };
  };

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

  // ========================================================== CERULEAN CITY =
  healCentre('ceruleancentre', 'CERULEAN', { map: 'cerulean', x: 20, y: 6 });
  pokeMart('ceruleanmart', 'CERULEAN', { map: 'cerulean', x: 20, y: 18 },
    ['potion', 'superpotion', 'antidote', 'parlyzheal', 'awakening', 'burnheal',
     'pokeball', 'greatball', 'repel', 'escaperope']);

  G.MAPS.ceruleanhouse = {
    id: 'ceruleanhouse', name: 'Cerulean House', w: 10, h: 9,
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
      { x: 4, y: 8, to: 'cerulean', tx: 20, ty: 12, dir: 'down' },
      { x: 5, y: 8, to: 'cerulean', tx: 20, ty: 12, dir: 'down' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'woman3', dir: 'down',
        dialog: ['MISTY is the youngest of four sisters and the only one who battles.',
                 'The other three do a water ballet. She finds this excruciating.'] }
    ]
  };

  // The burgled house. You can walk in through the hole they left.
  G.MAPS.robbedhouse = {
    id: 'robbedhouse', name: 'Ransacked House', w: 10, h: 9,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'I..T...PII',
      'I........I',
      'I.B......I',
      'I........I',
      'I..o.....I',
      'I........I',
      'I........I',
      'IIII..IIII'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 8, to: 'cerulean', tx: 7, ty: 18, dir: 'down' },
      { x: 5, y: 8, to: 'cerulean', tx: 7, ty: 18, dir: 'down' }
    ],
    signs: [
      { x: 8, y: 2, text: 'The back wall has a hole in it roughly the size of a person. It was not made from the inside.' }
    ],
    npcs: [
      { x: 3, y: 4, sprite: 'baldingman', dir: 'down', event: 'robbedTalk' }
    ]
  };

  // ---------------------------------------------------------- CERULEAN GYM --
  // Pools rather than a plain floor: the room should say WATER before Misty
  // opens her mouth.
  G.MAPS.ceruleangym = {
    id: 'ceruleangym', name: 'Cerulean Gym', w: 12, h: 14,
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
      'IGGGGGGGGGGI',
      'IGGUGGGGUGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IIIII..IIIII'
    ], 12, 14),
    deco: blank(12, 14),
    warps: [
      { x: 5, y: 13, to: 'cerulean', tx: 5, ty: 12, dir: 'down' },
      { x: 6, y: 13, to: 'cerulean', tx: 6, ty: 12, dir: 'down' }
    ],
    npcs: [
      { x: 8, y: 11, sprite: 'gymguy', dir: 'left', event: 'ceruleanGymGuide' }
    ],
    trainers: [
      { x: 5, y: 2, sprite: 'misty', dir: 'down', trainer: 'misty', sight: 0 },
      { x: 3, y: 6, sprite: 'swimmerf', dir: 'right', trainer: 'cg_diana', sight: 4 },
      { x: 8, y: 8, sprite: 'swimmer', dir: 'left', trainer: 'cg_luis', sight: 4 }
    ]
  };

  G.EVENTS.ceruleanGymGuide = function* () {
    if (G.flags.badge2) {
      yield { t: 'text', s: 'Guide: The CASCADEBADGE! Nice. South out of town for VERMILION.' };
      return;
    }
    yield { t: 'text', s: "Guide: MISTY's STARMIE is the problem, not her STARYU." };
    yield { t: 'text', s: 'Guide: It is fast, it hits hard on the SPECIAL side, and it will out-speed almost anything you have.' };
    yield { t: 'text', s: 'Guide: ELECTRIC or GRASS. A PIKACHU from VIRIDIAN FOREST would do it in one.' };
  };

  G.EVENTS.robbedTalk = function* () {
    yield { t: 'text', s: 'Man: They came through the wall. THROUGH IT.' };
    yield { t: 'text', s: 'Man: Black uniforms. A red R on the front. They took a TM and went out the back.' };
    yield { t: 'text', s: 'Man: The police say they went south. Nobody has seen them since.' };
    if (!G.flags.rocketSeen) {
      yield { t: 'fn', fn: function () { G.flags.rocketSeen = 1; } };
    }
  };

  // ------------------------------------------------------- the two fossils --
  // Mt. Moon's set piece. You take ONE, and the one you leave is gone for good
  // — which is the point. It is the first irreversible choice in the game, and
  // both fossils were on display in the Pewter museum so it is an informed one.
  function fossilEvent(item, other, blurb) {
    return function* () {
      if (G.flags.fossil) {
        yield { t: 'text', s: 'The other fossil is gone. Someone took it while you were deciding.' };
        return;
      }
      yield { t: 'text', s: blurb };
      yield { t: 'text', s: 'There is only time to carry one out.' };
      yield {
        t: 'fn',
        fn: function () {
          G.flags.fossil = item;
          G.player.bag[item] = (G.player.bag[item] || 0) + 1;
        }
      };
      yield { t: 'sfx', id: 'catchClick' };
      yield { t: 'text', s: 'You took the ' + G.ITEMS[item].name + '!' };
      yield { t: 'text', s: 'The ' + G.ITEMS[other].name + ' stays where it is. You will not get another chance at it.' };
      yield { t: 'text', s: 'They can revive these on CINNABAR ISLAND, apparently. A long way from here.' };
    };
  }
  G.EVENTS.mtmoonFossil = fossilEvent('domefossil', 'helixfossil',
    'A DOME FOSSIL, half out of the rock. Whatever it was had a shell like a shield.');
  G.EVENTS.mtmoonFossil2 = fossilEvent('helixfossil', 'domefossil',
    'A HELIX FOSSIL, spiralled and almost intact. It is heavier than it looks.');

  // ============================================================ BILL'S HOUSE =
  G.MAPS.billshouse = {
    id: 'billshouse', name: "Bill's House", w: 12, h: 10,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIII',
      'I.BB..HH..PI',
      'I..........I',
      'I..T....T..I',
      'I..........I',
      'I...o..o...I',
      'I..........I',
      'I..........I',
      'I..........I',
      'IIIII..IIIII'
    ], 12, 10),
    deco: blank(12, 10),
    warps: [
      { x: 5, y: 9, to: 'route25', tx: 24, ty: 7, dir: 'down' },
      { x: 6, y: 9, to: 'route25', tx: 24, ty: 7, dir: 'down' }
    ],
    signs: [
      { x: 7, y: 2, text: 'A wall of humming machinery. A label reads: STORAGE SYSTEM — PROTOTYPE 3.' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'bill', dir: 'down', event: 'billTalk' }
    ]
  };

  G.EVENTS.billTalk = function* () {
    if (G.flags.ssticket) {
      yield { t: 'text', s: 'Bill: Off to the S.S. ANNE? Say hello to the captain. He is a martyr about that boat.' };
      return;
    }
    yield { t: 'text', s: 'Bill: Ah — a visitor! Do not touch anything, most of it is live.' };
    yield { t: 'text', s: 'Bill: I built the POKéMON storage system. Every PC in every CENTER runs on it.' };
    yield { t: 'text', s: 'Bill: You have been using it all along, so in a small way we have already met.' };
    yield { t: 'text', s: 'Bill: Here. I have no use for this and you clearly travel.' };
    yield {
      t: 'fn',
      fn: function () {
        G.flags.ssticket = 1;
        G.player.bag.ssticket = 1;
      }
    };
    yield { t: 'sfx', id: 'catchClick' };
    yield { t: 'text', s: 'You received the S.S. TICKET!' };
    yield { t: 'text', s: 'Bill: The S.S. ANNE is docked at VERMILION. Go before it sails.' };
  };

  // ======================================================= UNDERGROUND PATH ==
  // A long, dull, straight tunnel — which is the point. It is the detour you
  // take because Saffron is shut, and it should feel like one.
  G.MAPS.undergroundpath = {
    id: 'undergroundpath', name: 'Underground Path', w: 7, h: 23,
    music: 'cave', battleBg: 'indoor', base: 'metalfloor',
    legend: { '.': 'metalfloor', '#': 'metalwall' },
    ground: pad([
      '#######',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '#######'
    ], 7, 23),
    deco: blank(7, 23),
    warps: [
      { x: 3, y: 1, to: 'route5', tx: 8, ty: 12, dir: 'up' },
      { x: 3, y: 21, to: 'route6', tx: 8, ty: 5, dir: 'down' }
    ],
    items: [
      { x: 2, y: 11, item: 'superpotion', once: 'up_potion' }
    ],
    npcs: [
      { x: 4, y: 16, sprite: 'oldman', dir: 'up',
        dialog: ['They dug this when SAFFRON started charging tolls at the gates.',
                 'Now the gates are shut entirely and this is the only way through.',
                 'Longest walk in KANTO. I do it twice a day.'] }
    ]
  };

  // ========================================================= VERMILION CITY ==
  healCentre('vermilioncentre', 'VERMILION', { map: 'vermilion', x: 6, y: 6 });
  pokeMart('vermilionmart', 'VERMILION', { map: 'vermilion', x: 20, y: 6 },
    ['potion', 'superpotion', 'antidote', 'parlyzheal', 'awakening', 'burnheal',
     'iceheal', 'pokeball', 'greatball', 'repel', 'escaperope']);

  G.MAPS.vermilionhouse = {
    id: 'vermilionhouse', name: 'Vermilion House', w: 10, h: 9,
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
      { x: 4, y: 8, to: 'vermilion', tx: 7, ty: 12, dir: 'down' },
      { x: 5, y: 8, to: 'vermilion', tx: 7, ty: 12, dir: 'down' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'fisher', dir: 'down',
        dialog: ['My MAGIKARP is useless. Utterly useless.',
                 'They keep telling me it evolves. Twenty levels, they say.',
                 'I have had it eleven years.'] }
    ]
  };

  // The Pokemon Fan Club. Its chairman talks for a very long time and then
  // hands you a Bike Voucher, which is the only reason anyone ever visits.
  G.MAPS.vermilionfanclub = {
    id: 'vermilionfanclub', name: 'Pokémon Fan Club', w: 10, h: 9,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'IP..TT..PI',
      'I........I',
      'I.o....o.I',
      'I........I',
      'I.o....o.I',
      'I........I',
      'I........I',
      'IIII..IIII'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 8, to: 'vermilion', tx: 19, ty: 12, dir: 'down' },
      { x: 5, y: 8, to: 'vermilion', tx: 19, ty: 12, dir: 'down' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'gentleman', dir: 'down', event: 'fanClubChairman' },
      { x: 3, y: 5, sprite: 'beauty', dir: 'right',
        dialog: ['The chairman will talk about his RAPIDASH for as long as you let him.',
                 'Let him. It is worth it.'] }
    ]
  };

  G.EVENTS.fanClubChairman = function* () {
    if (G.flags.bikevoucher) {
      yield { t: 'text', s: 'Chairman: Have I told you about my RAPIDASH? I believe I have.' };
      return;
    }
    yield { t: 'text', s: 'Chairman: Ah, a fellow enthusiast! Sit, sit.' };
    yield { t: 'text', s: 'Chairman: Let me tell you about my RAPIDASH. Her name is Sunburst.' };
    yield { t: 'text', s: 'Chairman: Her mane. Her gait. The way she looks at me over breakfast.' };
    yield { t: 'text', s: '...This goes on for some time.' };
    yield { t: 'text', s: 'Chairman: — and THAT is why she is the finest POKéMON in KANTO.' };
    yield { t: 'text', s: 'Chairman: You listened to all of it. Nobody listens to all of it.' };
    yield {
      t: 'fn',
      fn: function () {
        G.flags.bikevoucher = 1;
        G.player.bag.bikevoucher = 1;
      }
    };
    yield { t: 'sfx', id: 'catchClick' };
    yield { t: 'text', s: 'You received a BIKE VOUCHER!' };
    yield { t: 'text', s: 'Chairman: Redeem it at the CERULEAN shop. A bicycle is faster than walking, and you walk a great deal.' };
  };

  // ----------------------------------------------------------- SURGE'S GYM --
  G.MAPS.vermiliongym = {
    id: 'vermiliongym', name: 'Vermilion Gym', w: 12, h: 14,
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
      'IGGGGGGGGGGI',
      'IGGUGGGGUGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IIIII..IIIII'
    ], 12, 14),
    deco: blank(12, 14),
    warps: [
      { x: 5, y: 13, to: 'vermilion', tx: 5, ty: 18, dir: 'down' },
      { x: 6, y: 13, to: 'vermilion', tx: 6, ty: 18, dir: 'down' }
    ],
    npcs: [
      { x: 8, y: 11, sprite: 'gymguy', dir: 'left', event: 'vermilionGymGuide' }
    ],
    trainers: [
      { x: 5, y: 2, sprite: 'surge', dir: 'down', trainer: 'surge', sight: 0 },
      { x: 3, y: 6, sprite: 'sailor', dir: 'right', trainer: 'vg_dwayne', sight: 4 },
      { x: 8, y: 8, sprite: 'rocker', dir: 'left', trainer: 'vg_luca', sight: 4 }
    ]
  };

  G.EVENTS.vermilionGymGuide = function* () {
    if (G.flags.badge3) {
      yield { t: 'text', s: 'Guide: THUNDERBADGE! That one lets your POKéMON use FLY outside of battle.' };
      return;
    }
    yield { t: 'text', s: 'Guide: LT. SURGE fought in a war. He is not gentle about any of this.' };
    yield { t: 'text', s: 'Guide: His RAICHU out-speeds most things and paralyses what it does not knock out.' };
    yield { t: 'text', s: 'Guide: GROUND types take NOTHING from ELECTRIC. Not reduced — nothing.' };
    yield { t: 'text', s: 'Guide: There is a DIGLETT tunnel just west of town. Go and get one.' };
  };

  // The captain is seasick, and curing him is what gets you HM01 CUT -- which
  // is the item that unblocks about a third of Kanto. Gen 1 hides its most
  // important progression item behind a favour for a man being sick in a boat,
  // and that is genuinely the correct amount of ceremony for it.
  G.EVENTS.ssanneCaptain = function* () {
    if (G.flags.hm_cut) {
      yield { t: 'text', s: 'Captain: Much better, thank you. Do not tell the crew.' };
      return;
    }
    if (!G.flags.blue_ssanne) {
      yield { t: 'text', s: 'Captain: Ohh... I feel terrible...' };
      yield { t: 'text', s: 'Captain: Please. Someone. Anyone. My back.' };
      yield { t: 'text', s: '(He is in no state to talk. Perhaps deal with whoever is blocking the corridor first.)' };
      return;
    }
    yield { t: 'text', s: 'Captain: Ohh... I feel terrible...' };
    yield { t: 'text', s: 'Captain: Would you... would you rub my back? Just once?' };
    yield { t: 'wait', frames: 24 };
    yield { t: 'text', s: "You rub the CAPTAIN's back." };
    yield { t: 'sfx', id: 'confirm' };
    yield { t: 'text', s: 'Captain: ...Ah. AH. That is it. That is the spot.' };
    yield { t: 'text', s: 'Captain: Thank you! I am myself again. Sorry you had to see that.' };
    yield { t: 'text', s: 'Captain: Here — for your trouble. It is a HIDDEN MACHINE.' };
    yield {
      t: 'fn',
      fn: function () {
        G.flags.hm_cut = 1;
        G.player.bag.hm01 = 1;
      }
    };
    yield { t: 'sfx', id: 'catchClick' };
    yield { t: 'text', s: 'You received HM01 — CUT!' };
    yield { t: 'text', s: 'Captain: Teach it to a POKéMON and it will clear the small trees that block the roads.' };
    yield { t: 'text', s: 'Captain: You will find one across your path within the hour. They are everywhere once you can see them.' };
  };

  // Blue is aboard, in the corridor, and will not move until you beat him.
  G.EVENTS.ssanneRival = function* () {
    yield { t: 'text', s: 'Blue: Bonjour! Fancy meeting you on a boat.' };
    yield { t: 'text', s: 'Blue: I already found the captain. He is useless. Let us settle this instead.' };
    yield {
      t: 'custom',
      run: function (resume) { G.startTrainerBattle('blue_ssanne', { onDone: resume }); }
    };
    if (!G.flags.blue_ssanne) return;
    yield { t: 'text', s: 'Blue: Fine! Go and be nice to the sick man. See what it gets you.' };
    yield { t: 'text', s: 'Blue: I am off to LAVENDER. Something is happening at that tower.' };
  };

  // ========================================================== LAVENDER TOWN =
  healCentre('lavendercentre', 'LAVENDER', { map: 'lavender', x: 6, y: 6 });
  pokeMart('lavendermart', 'LAVENDER', { map: 'lavender', x: 7, y: 18 },
    ['potion', 'superpotion', 'antidote', 'parlyzheal', 'awakening', 'burnheal',
     'iceheal', 'revive', 'pokeball', 'greatball', 'escaperope']);

  G.MAPS.lavenderhouse = {
    id: 'lavenderhouse', name: 'Lavender House', w: 10, h: 9,
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
      { x: 4, y: 8, to: 'lavender', tx: 7, ty: 12, dir: 'down' },
      { x: 5, y: 8, to: 'lavender', tx: 7, ty: 12, dir: 'down' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'oldman', dir: 'down',
        dialog: ['My CUBONE will not stop crying.',
                 'Its mother is up in that tower. TEAM ROCKET put her there.'] }
    ]
  };

  G.MAPS.mrfujihouse = {
    id: 'mrfujihouse', name: "Mr. Fuji's House", w: 12, h: 10,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIII',
      'IP..TTTT..PI',
      'I..........I',
      'I.B......B.I',
      'I..........I',
      'I..o....o..I',
      'I..........I',
      'I..........I',
      'I..........I',
      'IIIII..IIIII'
    ], 12, 10),
    deco: blank(12, 10),
    warps: [
      { x: 5, y: 9, to: 'lavender', tx: 19, ty: 12, dir: 'down' },
      { x: 6, y: 9, to: 'lavender', tx: 19, ty: 12, dir: 'down' }
    ],
    signs: [
      { x: 3, y: 4, text: 'Shelves of records: names, dates, and which POKéMON is buried where.' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'mrfuji', dir: 'down', event: 'fujiTalk' }
    ]
  };

  G.EVENTS.fujiTalk = function* () {
    if (G.flags.silphscope) {
      yield { t: 'text', s: 'Mr. Fuji: Go carefully up there. And be kind to whatever you find.' };
      return;
    }
    yield { t: 'text', s: 'Mr. Fuji: I look after the tower. Or I did, until they came.' };
    yield { t: 'text', s: 'Mr. Fuji: TEAM ROCKET killed a MAROWAK on the top floor. A mother, defending her child.' };
    yield { t: 'text', s: 'Mr. Fuji: Her spirit has not settled, and now nobody can get past the third floor.' };
    yield { t: 'text', s: 'Mr. Fuji: You cannot fight a ghost you cannot see. You would need a SILPH SCOPE.' };
    yield { t: 'text', s: 'Mr. Fuji: ROCKET have them. They have a hideout under the GAME CORNER in CELADON.' };
  };


  // ========================================================= POKEMON TOWER ==
  // Seven floors of graves. Stamped from one plan because the sameness IS the
  // effect: you climb, the room does not change, and the only thing that does
  // change is how many channelers turn to look at you.
  function towerFloor(n, opts) {
    var id = 'pokemontower' + n + 'f';
    G.MAPS[id] = {
      id: id, name: 'Pokémon Tower ' + n + 'F', w: 20, h: 16,
      music: 'cave', battleBg: 'indoor', base: 'towerfloor',
      legend: { '.': 'towerfloor', '#': 'towerwall', 'g': 'grave', '>': 'stairs' },
      ground: pad([
        '####################',
        '#..................#',
        '#..g.g..g.g..g.g...#',
        '#..................#',
        '#..................#',
        '#..g.g..g.g..g.g...#',
        '#..................#',
        '#..................#',
        '#..g.g..g.g..g.g...#',
        '#..................#',
        '#..................#',
        '#..g.g..g.g..g.g...#',
        '#..................#',
        '#..................#',
        '#..................#',
        '####################'
      ], 20, 16),
      deco: blank(20, 16),
      encounters: (G.ENCOUNTERS || {})[id],
      warps: opts.warps,
      signs: opts.signs || [],
      npcs: opts.npcs || [],
      trainers: opts.trainers || [],
      items: opts.items || []
    };
  }

  // 1F is the entrance hall: no graves, no encounters, somewhere to breathe
  // before the climb.
  G.MAPS.pokemontower1f = {
    id: 'pokemontower1f', name: 'Pokémon Tower 1F', w: 20, h: 16,
    music: 'cave', battleBg: 'indoor', base: 'towerfloor',
    legend: { '.': 'towerfloor', '#': 'towerwall', 'g': 'grave', '>': 'stairs' },
    ground: pad([
      '####################',
      '#.................>#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#..................#',
      '#########..#########',
      '####################'
    ], 20, 16),
    deco: blank(20, 16),
    warps: [
      { x: 9, y: 14, to: 'lavender', tx: 20, ty: 6, dir: 'down' },
      { x: 10, y: 14, to: 'lavender', tx: 21, ty: 6, dir: 'down' },
      { x: 18, y: 1, to: 'pokemontower2f', tx: 18, ty: 2, dir: 'up' }
    ],
    signs: [
      { x: 5, y: 3, text: 'A board of names. Some of the ink is very old and some of it is very new.' }
    ],
    npcs: [
      { x: 6, y: 8, sprite: 'channeler', dir: 'down',
        dialog: ['Be quiet on the upper floors. They can hear you.',
                 '...I am not being poetic.'] },
      { x: 13, y: 10, sprite: 'oldwoman', dir: 'left',
        dialog: ['I come every week. My GROWLITHE is on the fifth floor.',
                 'I have not been able to reach her since the men in black arrived.'] }
    ]
  };

  towerFloor(2, {
    warps: [
      { x: 18, y: 2, to: 'pokemontower1f', tx: 17, ty: 1, dir: 'down' },
      { x: 1, y: 14, to: 'pokemontower3f', tx: 2, ty: 14, dir: 'up' }
    ],
    npcs: [
      { x: 10, y: 7, sprite: 'blue', dir: 'down', unlessFlag: 'blue_tower', event: 'towerRival' }
    ]
  });

  towerFloor(3, {
    warps: [
      { x: 2, y: 14, to: 'pokemontower2f', tx: 2, ty: 13, dir: 'down' },
      { x: 18, y: 1, to: 'pokemontower4f', tx: 18, ty: 2, dir: 'up' }
    ],
    trainers: [
      { x: 7, y: 6, sprite: 'channeler', dir: 'down', trainer: 'pt_hope', sight: 3 },
      { x: 14, y: 10, sprite: 'channeler', dir: 'left', trainer: 'pt_patricia', sight: 3 }
    ]
  });

  towerFloor(4, {
    warps: [
      { x: 18, y: 2, to: 'pokemontower3f', tx: 17, ty: 1, dir: 'down' },
      { x: 1, y: 14, to: 'pokemontower5f', tx: 2, ty: 14, dir: 'up' }
    ],
    trainers: [
      { x: 6, y: 9, sprite: 'channeler', dir: 'right', trainer: 'pt_carly', sight: 3 },
      { x: 15, y: 4, sprite: 'channeler', dir: 'down', trainer: 'pt_laurel', sight: 3 }
    ],
    items: [{ x: 3, y: 12, item: 'escaperope', once: 'pt_rope' }]
  });

  towerFloor(5, {
    warps: [
      { x: 2, y: 14, to: 'pokemontower4f', tx: 2, ty: 13, dir: 'down' },
      { x: 18, y: 1, to: 'pokemontower6f', tx: 18, ty: 2, dir: 'up' }
    ],
    trainers: [
      { x: 9, y: 6, sprite: 'channeler', dir: 'down', trainer: 'pt_jody', sight: 3 }
    ],
    items: [{ x: 16, y: 12, item: 'revive', once: 'pt_revive' }]
  });

  towerFloor(6, {
    warps: [
      { x: 18, y: 2, to: 'pokemontower5f', tx: 17, ty: 1, dir: 'down' },
      { x: 1, y: 14, to: 'pokemontower7f', tx: 2, ty: 14, dir: 'up' }
    ],
    trainers: [
      { x: 7, y: 4, sprite: 'channeler', dir: 'down', trainer: 'pt_tammy', sight: 3 },
      { x: 13, y: 9, sprite: 'channeler', dir: 'left', trainer: 'pt_karina', sight: 3 }
    ],
    npcs: [
      { x: 10, y: 12, sprite: 'orb_stand', obj: true, event: 'towerGhost' }
    ]
  });

  // 7F: the Rockets, and Mr. Fuji.
  towerFloor(7, {
    warps: [
      { x: 2, y: 14, to: 'pokemontower6f', tx: 2, ty: 13, dir: 'down' }
    ],
    signs: [
      { x: 5, y: 3, text: 'The topmost floor. It is very cold and there is no draught to explain it.' }
    ],
    trainers: [
      { x: 7, y: 8, sprite: 'rocket', dir: 'down', trainer: 'pt_rocket1', sight: 4 },
      { x: 13, y: 6, sprite: 'rocket', dir: 'left', trainer: 'pt_rocket2', sight: 4 },
      { x: 10, y: 4, sprite: 'rocket', dir: 'down', trainer: 'pt_rocket3', sight: 4 }
    ],
    npcs: [
      { x: 10, y: 1, sprite: 'mrfuji', dir: 'down', event: 'towerFujiRescue' }
    ]
  });

  // The restless MAROWAK. Without the SILPH SCOPE you cannot see it, and you
  // cannot fight what you cannot see, which is the entire justification for
  // that item existing.
  G.EVENTS.towerGhost = function* () {
    if (G.flags.marowakLaid) {
      yield { t: 'text', s: 'The air here is ordinary now. Just a room.' };
      return;
    }
    if (!G.flags.silphscope) {
      yield { t: 'text', s: 'Something is here. The temperature drops.' };
      yield { t: 'sfx', id: 'lowHp' };
      yield { t: 'text', s: 'GHOST: Get out. GET OUT.' };
      yield { t: 'text', s: 'You cannot make out a shape. There is nothing to aim at.' };
      yield { t: 'text', s: '(A SILPH SCOPE would show you what this is.)' };
      return;
    }
    yield { t: 'text', s: 'You raise the SILPH SCOPE.' };
    yield { t: 'wait', frames: 20 };
    yield { t: 'text', s: 'The shape resolves. It is a MAROWAK, and she is standing between you and the stairs.' };
    yield { t: 'sfx', id: 'lowHp' };
    yield {
      t: 'custom',
      run: function (resume) {
        G.startBattle({ party: G.player.party, foes: [G.makeMon('marowak', 30)], wild: true },
          { bg: 'indoor', onDone: resume });
      }
    };
    yield { t: 'fn', fn: function () { G.flags.marowakLaid = 1; } };
    yield { t: 'text', s: 'MAROWAK looks at you for a long moment, and then she is not there any more.' };
    yield { t: 'text', s: 'The cold goes with her.' };
  };

  G.EVENTS.towerRival = function* () {
    yield { t: 'text', s: 'Blue: You again. Of course.' };
    yield { t: 'text', s: 'Blue: I came to see whether the ghost story was true. It is, by the way.' };
    yield {
      t: 'custom',
      run: function (resume) { G.startTrainerBattle('blue_tower', { onDone: resume }); }
    };
    if (!G.flags.blue_tower) return;
    yield { t: 'text', s: 'Blue: ...Fine. You are getting good at this.' };
    yield { t: 'text', s: 'Blue: Whatever is up there is not frightened of me. Watch yourself.' };
  };

  G.EVENTS.towerFujiRescue = function* () {
    if (G.flags.pokeflute) {
      yield { t: 'text', s: 'Mr. Fuji: The tower is quiet again. Thank you.' };
      return;
    }
    yield { t: 'text', s: 'Mr. Fuji: You came all the way up. For a stranger.' };
    yield { t: 'text', s: 'Mr. Fuji: They wanted the graves. Something about bones being worth money.' };
    yield { t: 'text', s: 'Mr. Fuji: She is at rest now, and so is her child. That is your doing.' };
    yield { t: 'text', s: 'Mr. Fuji: Take this. It was made to be heard by POKéMON who do not wish to wake.' };
    yield {
      t: 'fn',
      fn: function () {
        G.flags.pokeflute = 1;
        G.player.bag.pokeflute = 1;
      }
    };
    yield { t: 'sfx', id: 'catchClick' };
    yield { t: 'text', s: 'You received the POKé FLUTE!' };
    yield { t: 'text', s: 'Mr. Fuji: There is a SNORLAX asleep across the road south of CELADON.' };
    yield { t: 'text', s: 'Mr. Fuji: It has been there for years. Play it something.' };
  };

  // The dock. You cannot board without a ticket, and Bill has the ticket.
  G.EVENTS.ssanneDock = function* () {
    if (!G.flags.ssticket) {
      yield { t: 'text', s: 'Sailor: Sorry. The S.S. ANNE is invitation only.' };
      yield { t: 'text', s: 'Sailor: No ticket, no gangway. I do not make the rules, I just stand on them.' };
      return;
    }
    yield { t: 'text', s: 'Sailor: A ticket! Welcome aboard the S.S. ANNE.' };
    yield { t: 'text', s: '...The gangway is still being lowered. Come back shortly.' };
  };

  // =========================================================== CELADON CITY ==
  healCentre('celadoncentre', 'CELADON', { map: 'celadon', x: 18, y: 6 });

  // The department store stands in for the Mart, with the deepest stock in the
  // game -- which is the reward for having come this far around the loop.
  G.MAPS.celadonstore = {
    id: 'celadonstore', name: 'Celadon Dept. Store', w: 14, h: 12,
    music: 'center', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIIIII',
      'I.BBB..BBB..PI',
      'I............I',
      'I............I',
      'I.BBB..BBB...I',
      'I............I',
      'I............I',
      'I.BBB..BBB...I',
      'I............I',
      'I............I',
      'I............I',
      'IIIIII..IIIIII'
    ], 14, 12),
    deco: blank(14, 12),
    warps: [
      { x: 6, y: 11, to: 'celadon', tx: 6, ty: 6, dir: 'down' },
      { x: 7, y: 11, to: 'celadon', tx: 7, ty: 6, dir: 'down' }
    ],
    shopInventory: [
      'potion', 'superpotion', 'hyperpotion', 'maxpotion', 'fullrestore',
      'antidote', 'burnheal', 'iceheal', 'awakening', 'parlyzheal', 'fullheal',
      'revive', 'pokeball', 'greatball', 'ultraball',
      'repel', 'superrepel', 'maxrepel', 'escaperope',
      'firestone', 'waterstone', 'thunderstone', 'leafstone'
    ],
    npcs: [
      { x: 4, y: 3, sprite: 'clerk', dir: 'down', event: 'shopBuy' },
      { x: 10, y: 6, sprite: 'woman2', dir: 'left',
        dialog: ['Fourth floor sells EVOLUTION STONES. Real ones.',
                 'A THUNDERSTONE on a PIKACHU, a WATER STONE on an EEVEE. Life-changing, for them.'] },
      { x: 3, y: 9, sprite: 'richboy', dir: 'right',
        dialog: ['Daddy buys me whatever I want here.', 'I mostly want the lift.'] }
    ]
  };

  G.MAPS.celadonhouse = {
    id: 'celadonhouse', name: 'Celadon House', w: 10, h: 9,
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
      { x: 4, y: 8, to: 'celadon', tx: 19, ty: 12, dir: 'down' },
      { x: 5, y: 8, to: 'celadon', tx: 19, ty: 12, dir: 'down' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'gentleman', dir: 'down',
        dialog: ['My grandson goes to that GAME CORNER every day and never comes home richer.',
                 'I have started to wonder what he is actually doing in there.'] }
    ]
  };

  // ------------------------------------------------------------ ERIKA'S GYM -
  G.MAPS.celadongym = {
    id: 'celadongym', name: 'Celadon Gym', w: 12, h: 14,
    music: 'gym', battleBg: 'indoor', base: 'gfloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIII',
      'IGGGGGGGGGGI',
      'IGGPGGGGPGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGPGGGGPGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGPGGGGPGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IIIII..IIIII'
    ], 12, 14),
    deco: blank(12, 14),
    warps: [
      { x: 5, y: 13, to: 'celadon', tx: 6, ty: 18, dir: 'down' },
      { x: 6, y: 13, to: 'celadon', tx: 6, ty: 18, dir: 'down' }
    ],
    npcs: [
      { x: 8, y: 11, sprite: 'gymguy', dir: 'left', event: 'celadonGymGuide' }
    ],
    trainers: [
      { x: 5, y: 1, sprite: 'erika', dir: 'down', trainer: 'erika', sight: 0 },
      { x: 3, y: 6, sprite: 'beauty', dir: 'right', trainer: 'cg_tamia', sight: 4 },
      { x: 8, y: 9, sprite: 'picnicker', dir: 'left', trainer: 'cg_lynn', sight: 4 }
    ]
  };

  G.EVENTS.celadonGymGuide = function* () {
    if (G.flags.badge4) {
      yield { t: 'text', s: 'Guide: The RAINBOWBADGE. Your POKéMON can use STRENGTH outside battle now.' };
      return;
    }
    yield { t: 'text', s: 'Guide: ERIKA looks half asleep. Do not read anything into it.' };
    yield { t: 'text', s: 'Guide: GRASS types, and every one of them carries SLEEP POWDER or STUN SPORE.' };
    yield { t: 'text', s: 'Guide: If your lead goes down, you lose the tempo and the fight. Bring an AWAKENING.' };
    yield { t: 'text', s: 'Guide: FIRE or FLYING ends it fast. A CHARMELEON walks this gym.' };
  };

  // ------------------------------------------------------------ GAME CORNER -
  // Per the design brief there is no slot minigame: the Corner exists for its
  // story beat, which is the poster nobody is allowed to stand near.
  G.MAPS.gamecorner = {
    id: 'gamecorner', name: 'Rocket Game Corner', w: 18, h: 14,
    music: 'town', battleBg: 'indoor', base: 'ifloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIIIIIIIII',
      'I.HHH.HHH.HHH...PI',
      'I................I',
      'I.HHH.HHH.HHH....I',
      'I................I',
      'I.HHH.HHH.HHH....I',
      'I................I',
      'I.HHH.HHH.HHH....I',
      'I................I',
      'I................I',
      'I................I',
      'I................I',
      'IIIIIIII..IIIIIIII',
      'IIIIIIIIIIIIIIIIII'
    ], 18, 14),
    deco: blank(18, 14),
    warps: [
      { x: 8, y: 12, to: 'celadon', tx: 6, ty: 12, dir: 'down' },
      { x: 9, y: 12, to: 'celadon', tx: 7, ty: 12, dir: 'down' },
      { x: 15, y: 9, to: 'rockethideout1', tx: 2, ty: 1, dir: 'down' }
    ],
    signs: [
      { x: 4, y: 2, text: 'A slot machine. The reels are worn smooth. It has not paid out in a very long time.' }
    ],
    npcs: [
      { x: 14, y: 9, sprite: 'rocket', dir: 'left', event: 'gameCornerPoster' },
      { x: 5, y: 10, sprite: 'gambler', dir: 'down',
        dialog: ['Been here eleven hours. Down four thousand.',
                 'The machines are fine. It is me. It must be me.'] },
      { x: 11, y: 10, sprite: 'beauty', dir: 'down',
        dialog: ['That man by the back poster has not played a single game all day.',
                 'He just stands there. Watching the wall.'] }
    ]
  };

  G.EVENTS.gameCornerPoster = function* () {
    if (G.flags.hideoutOpen) {
      yield { t: 'text', s: 'The poster hangs open on its hinge. Stairs lead down into the dark.' };
      return;
    }
    yield { t: 'text', s: 'Rocket: Beat it, kid. Nothing back here.' };
    yield { t: 'text', s: 'He is standing in front of a poster. Not playing. Not moving.' };
    yield { t: 'text', s: 'You look at the poster. You look at him. He stops smiling.' };
    yield { t: 'text', s: 'Rocket: ...You saw nothing. Understand?' };
    yield {
      t: 'custom',
      run: function (resume) { G.startTrainerBattle('gc_rocket', { onDone: resume }); }
    };
    if (!G.flags.gc_rocket) return;
    yield { t: 'fn', fn: function () { G.flags.hideoutOpen = 1; } };
    yield { t: 'sfx', id: 'doorOpen' };
    yield { t: 'text', s: 'The grunt bolts. The poster swings loose behind him.' };
    yield { t: 'text', s: 'There is a staircase behind it, going down.' };
  };

  // --------------------------------------------------------- ROCKET HIDEOUT -
  function hideoutFloor(n, opts) {
    var id = 'rockethideout' + n;
    G.MAPS[id] = {
      id: id, name: 'Rocket Hideout B' + n + 'F', w: 20, h: 16,
      music: 'cave', battleBg: 'indoor', base: 'metalfloor',
      legend: { '.': 'metalfloor', '#': 'metalwall', '>': 'stairs' },
      ground: pad([
        '####################',
        '#..................#',
        '#..####....####....#',
        '#..#..........#....#',
        '#..#..####....#....#',
        '#.....#..#.........#',
        '#..####..####..#####',
        '#..............#...#',
        '#..#####..####.#...#',
        '#......#..#........#',
        '#..###.#..#..####..#',
        '#....#.#..#..#.....#',
        '#....#....#..#..####',
        '#....######..#.....#',
        '#..................#',
        '####################'
      ], 20, 16),
      deco: blank(20, 16),
      warps: opts.warps,
      signs: opts.signs || [],
      npcs: opts.npcs || [],
      trainers: opts.trainers || [],
      items: opts.items || []
    };
  }

  hideoutFloor(1, {
    warps: [
      { x: 2, y: 1, to: 'gamecorner', tx: 15, ty: 8, dir: 'up' },
      { x: 17, y: 14, to: 'rockethideout2', tx: 2, ty: 1, dir: 'down' }
    ],
    trainers: [
      { x: 9, y: 1, sprite: 'rocket', dir: 'down', trainer: 'rh_grunt1', sight: 4 },
      { x: 12, y: 7, sprite: 'rocket', dir: 'left', trainer: 'rh_grunt2', sight: 3 }
    ],
    items: [{ x: 5, y: 14, item: 'superpotion', once: 'rh_potion' }]
  });

  hideoutFloor(2, {
    warps: [
      { x: 2, y: 1, to: 'rockethideout1', tx: 17, ty: 13, dir: 'up' }
    ],
    signs: [
      { x: 6, y: 14, text: 'A steel door, badly dented. Someone has tried to get through it from this side.' }
    ],
    trainers: [
      { x: 9, y: 7, sprite: 'rocket', dir: 'down', trainer: 'rh_grunt3', sight: 4 },
      { x: 16, y: 11, sprite: 'rocket', dir: 'left', trainer: 'rh_grunt4', sight: 3 }
    ],
    npcs: [
      { x: 9, y: 14, sprite: 'giovanni', dir: 'down', unlessFlag: 'rh_giovanni', event: 'hideoutBoss' },
      { x: 14, y: 1, sprite: 'orb_stand', obj: true, event: 'hideoutScope' }
    ]
  });

  G.EVENTS.hideoutBoss = function* () {
    yield { t: 'text', s: '???: You are a very long way from anywhere you should be.' };
    yield { t: 'text', s: '???: I am GIOVANNI. This is my operation, and you are standing in it.' };
    yield { t: 'text', s: 'Giovanni: A casino launders money. A tower supplies bone. It is all inventory.' };
    yield {
      t: 'custom',
      run: function (resume) { G.startTrainerBattle('giovanni_hideout', { onDone: resume }); }
    };
    if (!G.flags.rh_giovanni) return;
    yield { t: 'text', s: 'Giovanni: ...Hm. You are better than the reports said.' };
    yield { t: 'text', s: 'Giovanni: Keep the building. I have another one.' };
    yield { t: 'text', s: 'He walks out past you, unhurried, and nobody stops him.' };
  };

  G.EVENTS.hideoutScope = function* () {
    if (G.flags.silphscope) {
      yield { t: 'text', s: 'An empty case on a bench.' };
      return;
    }
    if (!G.flags.rh_giovanni) {
      yield { t: 'text', s: 'A case on a bench, locked. The man at the far end of the room is watching you.' };
      return;
    }
    yield { t: 'text', s: 'The case is open now. Inside is a lens on a handle.' };
    yield {
      t: 'fn',
      fn: function () {
        G.flags.silphscope = 1;
        G.player.bag.silphscope = 1;
      }
    };
    yield { t: 'sfx', id: 'catchClick' };
    yield { t: 'text', s: 'You received the SILPH SCOPE!' };
    yield { t: 'text', s: 'It shows you what is really there. The TOWER in LAVENDER has something that needs seeing.' };
  };


  // The EAST-WEST Underground Path: Route 8 to Route 7, under Saffron. Kanto
  // seals one city and digs around it twice, and this is the second tunnel.
  G.MAPS.undergroundpath2 = {
    id: 'undergroundpath2', name: 'Underground Path', w: 25, h: 5,
    music: 'cave', battleBg: 'indoor', base: 'metalfloor',
    legend: { '.': 'metalfloor', '#': 'metalwall' },
    ground: pad([
      '#########################',
      '###.#################.###',
      '#.......................#',
      '#.......................#',
      '#########################'
    ], 25, 5),
    deco: blank(25, 5),
    warps: [
      { x: 3, y: 1, to: 'route8', tx: 6, ty: 6, dir: 'down' },
      { x: 21, y: 1, to: 'route7', tx: 11, ty: 6, dir: 'down' }
    ],
    items: [
      { x: 12, y: 3, item: 'fullheal', once: 'up2_fullheal' }
    ],
    npcs: [
      { x: 8, y: 2, sprite: 'oldman', dir: 'right',
        dialog: ['Two tunnels under one city. Somebody in SAFFRON is very good at annoying people.'] }
    ]
  };


  // ============================================================ SAFFRON CITY =
  healCentre('saffroncentre', 'SAFFRON', { map: 'saffron', x: 18, y: 6 });
  pokeMart('saffronmart', 'SAFFRON', { map: 'saffron', x: 18, y: 12 },
    ['potion', 'superpotion', 'hyperpotion', 'maxpotion', 'fullrestore',
     'antidote', 'parlyzheal', 'awakening', 'fullheal', 'revive',
     'pokeball', 'greatball', 'ultraball', 'repel', 'escaperope']);

  G.MAPS.saffronhouse = {
    id: 'saffronhouse', name: 'Saffron House', w: 10, h: 9,
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
      { x: 4, y: 8, to: 'saffron', tx: 17, ty: 18, dir: 'down' },
      { x: 5, y: 8, to: 'saffron', tx: 17, ty: 18, dir: 'down' }
    ],
    npcs: [
      { x: 6, y: 3, sprite: 'woman3', dir: 'down',
        dialog: ['We stayed indoors for three weeks.',
                 'You get used to it. That is the frightening bit.'] }
    ]
  };

  // The Fighting Dojo. Beat the master and he gives up one of his two prizes,
  // and the one you leave is gone -- the second irreversible choice in the game
  // after the fossils.
  G.MAPS.fightingdojo = {
    id: 'fightingdojo', name: 'Fighting Dojo', w: 14, h: 12,
    music: 'gym', battleBg: 'indoor', base: 'gfloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIIIII',
      'IGGGGGGGGGGGGI',
      'IGGGGGGGGGGGGI',
      'IGGGGGGGGGGGGI',
      'IGGGGGGGGGGGGI',
      'IGGGGGGGGGGGGI',
      'IGGGGGGGGGGGGI',
      'IGGGGGGGGGGGGI',
      'IGGGGGGGGGGGGI',
      'IGGGGGGGGGGGGI',
      'IGGGGGGGGGGGGI',
      'IIIIII..IIIIII'
    ], 14, 12),
    deco: blank(14, 12),
    warps: [
      { x: 6, y: 11, to: 'saffron', tx: 6, ty: 13, dir: 'down' },
      { x: 7, y: 11, to: 'saffron', tx: 7, ty: 13, dir: 'down' }
    ],
    trainers: [
      { x: 6, y: 1, sprite: 'blackbelt', dir: 'down', trainer: 'dojo_master', sight: 0 },
      { x: 3, y: 5, sprite: 'blackbelt', dir: 'right', trainer: 'dojo_hideki', sight: 4 },
      { x: 10, y: 8, sprite: 'blackbelt', dir: 'left', trainer: 'dojo_mike', sight: 4 }
    ],
    npcs: [
      { x: 5, y: 3, sprite: 'orb_stand', obj: true, event: 'dojoHitmonlee' },
      { x: 8, y: 3, sprite: 'orb_stand', obj: true, event: 'dojoHitmonchan' }
    ]
  };

  function dojoPrize(key, other, blurb) {
    return function* () {
      if (!G.flags.dojo_master) {
        yield { t: 'text', s: 'The two balls sit behind the master. He has not moved.' };
        return;
      }
      if (G.flags.dojoPrize) {
        yield { t: 'text', s: 'The other ball is gone. The master took it back the moment you chose.' };
        return;
      }
      yield { t: 'text', s: blurb };
      yield { t: 'text', s: 'Master: One. Not both. Choose.' };
      yield {
        t: 'fn',
        fn: function () {
          var mon = G.makeMon(key, 25);
          G.flags.dojoPrize = key;
          if (G.player.party.length < 6) G.player.party.push(mon);
          else G.player.box.push(mon);
          G.player.dexSeen[key] = 1;
          G.player.dexCaught[key] = 1;
        }
      };
      yield { t: 'sfx', id: 'catchClick' };
      yield { t: 'text', s: 'You received ' + G.SPECIES[key].name + '!' };
      yield { t: 'text', s: 'Master: Then the ' + G.SPECIES[other].name + ' stays with me. Train it well.' };
    };
  }
  G.EVENTS.dojoHitmonlee = dojoPrize('hitmonlee', 'hitmonchan',
    'A ball marked with a foot. Inside is HITMONLEE, all legs and reach.');
  G.EVENTS.dojoHitmonchan = dojoPrize('hitmonchan', 'hitmonlee',
    'A ball marked with a fist. Inside is HITMONCHAN, all guard and timing.');

  // ---------------------------------------------------------- SABRINA'S GYM -
  G.MAPS.saffrongym = {
    id: 'saffrongym', name: 'Saffron Gym', w: 12, h: 14,
    music: 'gym', battleBg: 'indoor', base: 'gfloor',
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIII',
      'IGGGGGGGGGGI',
      'IGGUGGGGUGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGUGGGGUGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IGGUGGGGUGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IIIII..IIIII'
    ], 12, 14),
    deco: blank(12, 14),
    warps: [
      { x: 5, y: 13, to: 'saffron', tx: 5, ty: 18, dir: 'down' },
      { x: 6, y: 13, to: 'saffron', tx: 6, ty: 18, dir: 'down' }
    ],
    npcs: [
      { x: 8, y: 12, sprite: 'gymguy', dir: 'left', event: 'saffronGymGuide' }
    ],
    trainers: [
      { x: 5, y: 1, sprite: 'sabrina', dir: 'down', trainer: 'sabrina', sight: 0 },
      { x: 3, y: 5, sprite: 'psychicm', dir: 'right', trainer: 'sg_johan', sight: 4 },
      { x: 8, y: 9, sprite: 'channeler', dir: 'left', trainer: 'sg_tyron', sight: 4 }
    ]
  };

  G.EVENTS.saffronGymGuide = function* () {
    if (G.flags.badge6) {
      yield { t: 'text', s: 'Guide: The MARSHBADGE. Nothing you catch will ever disobey you now.' };
      return;
    }
    yield { t: 'text', s: 'Guide: I will be honest with you. This one is unfair.' };
    yield { t: 'text', s: 'Guide: PSYCHIC has almost no counters this generation. It resists FIGHTING, it is immune to nothing, and it hits like a truck.' };
    yield { t: 'text', s: 'Guide: BUG moves are the answer, and the only good one is PIN MISSILE.' };
    yield { t: 'text', s: 'Guide: Otherwise just out-level her. That is what everyone does.' };
  };

  // ------------------------------------------------------------- SILPH CO. --
  // Eleven floors in the original. Three here, because what matters is the
  // shape: a lobby nobody is manning, a floor of grunts, and the boardroom.
  function silphFloor(n, opts) {
    var id = 'silphco' + n + 'f';
    G.MAPS[id] = {
      id: id, name: 'Silph Co. ' + n + 'F', w: 22, h: 18,
      music: 'cave', battleBg: 'indoor', base: 'metalfloor',
      legend: { '.': 'metalfloor', '#': 'metalwall', '>': 'stairs' },
      ground: pad([
        '######################',
        '#....................#',
        '#..####..####..####..#',
        '#..#........#.....#..#',
        '#..#..####..#..##.#..#',
        '#.....#..#.....#..#..#',
        '#..####..####..#..#..#',
        '#..............#..#..#',
        '#..#####..#######..#.#',
        '#......#..#..........#',
        '#..###.#..#..#####..##',
        '#....#.#..#..#.......#',
        '#....#....#..#..######',
        '#....######..#.......#',
        '#............#....#..#',
        '#..#########......#..#',
        '#....................#',
        '######################'
      ], 22, 18),
      deco: blank(22, 18),
      warps: opts.warps,
      signs: opts.signs || [],
      npcs: opts.npcs || [],
      trainers: opts.trainers || [],
      items: opts.items || []
    };
  }

  silphFloor(1, {
    warps: [
      { x: 10, y: 16, to: 'saffron', tx: 6, ty: 6, dir: 'down' },
      { x: 11, y: 16, to: 'saffron', tx: 7, ty: 6, dir: 'down' },
      { x: 20, y: 1, to: 'silphco2f', tx: 20, ty: 16, dir: 'up' }
    ],
    signs: [
      { x: 5, y: 1, text: 'A reception desk. Nobody behind it. A half-drunk cup of tea, long cold.' }
    ],
    trainers: [
      { x: 9, y: 9, sprite: 'rocket', dir: 'down', trainer: 'silph_g1', sight: 4 }
    ],
    npcs: [
      { x: 4, y: 16, sprite: 'workerm', dir: 'up',
        dialog: ['They came in through the front door at nine in the morning.',
                 'Told us to keep working. Most of us did.'] }
    ]
  });

  silphFloor(2, {
    warps: [
      { x: 20, y: 16, to: 'silphco1f', tx: 20, ty: 2, dir: 'down' },
      { x: 1, y: 1, to: 'silphco3f', tx: 1, ty: 16, dir: 'up' }
    ],
    trainers: [
      { x: 12, y: 5, sprite: 'rocket', dir: 'left', trainer: 'silph_g2', sight: 4 },
      { x: 6, y: 12, sprite: 'rocket', dir: 'down', trainer: 'silph_g3', sight: 4 }
    ],
    items: [{ x: 19, y: 9, item: 'fullheal', once: 'silph_heal' }]
  });

  silphFloor(3, {
    warps: [
      { x: 1, y: 16, to: 'silphco2f', tx: 1, ty: 2, dir: 'down' }
    ],
    signs: [
      { x: 5, y: 1, text: 'The boardroom. The long table has been pushed against a wall.' }
    ],
    trainers: [
      { x: 8, y: 9, sprite: 'rocket', dir: 'down', trainer: 'silph_g4', sight: 4 },
      { x: 15, y: 12, sprite: 'blue', dir: 'left', trainer: 'blue_silph', sight: 3 }
    ],
    npcs: [
      { x: 11, y: 1, sprite: 'giovanni', dir: 'down', unlessFlag: 'silph_giovanni', event: 'silphBoss' },
      { x: 5, y: 16, sprite: 'gentleman', dir: 'up', event: 'silphPresident' }
    ]
  });

  G.EVENTS.silphBoss = function* () {
    yield { t: 'text', s: 'Giovanni: Twice now. You are becoming a scheduling problem.' };
    yield { t: 'text', s: 'Giovanni: SILPH makes a device that makes catching trivial. Do you understand what that is worth?' };
    yield { t: 'text', s: 'Giovanni: Every trainer in the world, obsolete. And I would own the reason.' };
    yield {
      t: 'custom',
      run: function (resume) { G.startTrainerBattle('giovanni_silph', { onDone: resume }); }
    };
    if (!G.flags.silph_giovanni) return;
    yield { t: 'text', s: 'Giovanni: ...Enough. TEAM ROCKET withdraws. All of it. Everywhere.' };
    yield { t: 'text', s: 'Giovanni: I will go and think about what I have been doing with my life.' };
    yield { t: 'text', s: 'He leaves. The building exhales.' };
    yield { t: 'fn', fn: function () { G.flags.saffronFreed = 1; } };
  };

  G.EVENTS.silphPresident = function* () {
    if (!G.flags.silph_giovanni) {
      yield { t: 'text', s: 'President: Not now. Please. Whatever it is, not now.' };
      return;
    }
    if (G.flags.masterball) {
      yield { t: 'text', s: 'President: Use it on something that matters.' };
      return;
    }
    yield { t: 'text', s: 'President: They are gone? They are actually gone.' };
    yield { t: 'text', s: 'President: We were building this when they arrived. It is the only one.' };
    yield {
      t: 'fn',
      fn: function () {
        G.flags.masterball = 1;
        G.player.bag.masterball = (G.player.bag.masterball || 0) + 1;
      }
    };
    yield { t: 'sfx', id: 'catchClick' };
    yield { t: 'text', s: 'You received the MASTER BALL!' };
    yield { t: 'text', s: 'President: It cannot fail. Not once, not ever. So think carefully about what you spend it on.' };
  };


  // Saffron's gates. Rocket holds them until the Celadon hideout falls, at
  // which point they have to pull everyone back to Silph and the roads open.
  // The city is not unlocked by an errand -- it is unlocked because you cost
  // them the manpower to keep it shut.
  G.EVENTS.saffronGate = function* () {
    yield { t: 'text', s: 'Rocket: SAFFRON is closed. Company orders.' };
    yield { t: 'text', s: 'Rocket: Which company? Does not matter. Turn around.' };
  };

})();
