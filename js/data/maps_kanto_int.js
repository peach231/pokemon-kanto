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
      // The PC is the machine on the back wall at (8,1). It was furniture: the
      // only thing describing it was a paragraph of text pinned to the floor
      // in the far corner by the pot plant, and a gentleman stood at (8,2) —
      // directly in front of it — so the machine could not even be faced.
      // Meanwhile G.PCScene had been written, in full, and nothing opened it,
      // while anything caught on a full party went into a box with no door.
      signs: [
        { x: 8, y: 1, event: 'pcStorage',
          text: 'A storage PC hums quietly. Deposit or withdraw POKéMON here.' }
      ],
      npcs: [
        { x: 3, y: 2, sprite: 'nurse', dir: 'down', event: 'nurseHeal' },
        { x: 10, y: 2, sprite: 'gentleman', dir: 'left',
          dialog: ['That PC is linked to BILL\'s storage system.',
                   'Anything you catch with a full party ends up in it.',
                   'He built the whole thing himself, apparently. Clever man.'] }
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
        // The regular. In a mart that stocks the EXP SHARE he talks about
        // that instead, because a shop list only ever shows you a name and a
        // price, and this is the one item on the shelf whose whole value is
        // in what it does rather than what it is.
        // The rundown. Two items that do the same job to different degrees,
        // and a shop list has room for a name and a price and nothing else —
        // so somebody stands here and lays out all three options, including
        // the one that costs nothing because it is what you already have.
        { x: 8, y: 4, sprite: 'youngster', dir: 'left',
          dialog: (inventory && inventory.indexOf('expshare') !== -1)
            ? ['You want the EXP talk? Three ways to do it, and the EXP from a battle is the same however you split it.',
               'CARRY NEITHER: whoever fought takes the lot. Fast for one POKéMON, slow for the other five.',
               'EXP SHARE: the fighter keeps HALF, and the rest of your party splits the other half.',
               'EXP ALL: one share each, evenly, the fighter included. Everybody moves together and nobody races ahead.',
               'Neither one makes MORE experience. They just decide who it goes to.',
               'Carrying both? Then it goes the EXP ALL way. No sense owning two.']
            : ['POTIONs are cheap and they save runs.', 'Buy more than you think you need. Trust me.'] }
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
    gymTint: '#b08040',
    signs: [
      // An empty gym is the one piece of this game that can look like a bug
      // rather than a plot, so the notice says the quiet part out loud: this
      // is the EIGHTH badge, it is meant to be last, and it is meant to be
      // shut when you first push the door open.
      { x: 5, y: 4, text: 'A notice, taped up and curling at the corners: VIRIDIAN GYM — CLOSED UNTIL FURTHER NOTICE. Underneath, in smaller print: EIGHTH BADGE. LEADER ABSENT. Somebody has torn the rest of it half off.' }
    ],
    npcs: [
      { x: 8, y: 6, sprite: 'gymguy', dir: 'left', unlessFlag: 'rh_giovanni',
        dialog: ['Empty, see? Has been for months.',
                 'This is the EIGHTH GYM — the last one. Nobody was ever meant to start here.',
                 "Whoever the LEADER is, he's got business elsewhere.",
                 "...I've said too much."] },
      { x: 9, y: 8, sprite: 'gymguy', dir: 'left', ifFlag: 'badge7', event: 'viridianGymGuide' },
      { x: 3, y: 6, sprite: 'oldman', dir: 'right', ifFlag: 'rh_giovanni', unlessFlag: 'badge7',
        dialog: ['The GYM has a light on for the first time in years.',
                 'The door is still locked. Whoever is in there is waiting for something.',
                 'Or someone with seven BADGES, I would guess.'] }
    ],
    trainers: [
      { x: 5, y: 1, sprite: 'giovanni', dir: 'down', trainer: 'giovanni_viridian', sight: 0,
        ifFlag: 'badge7' },
      { x: 2, y: 4, sprite: 'cooltrainerm', dir: 'right', trainer: 'vg_arthur', sight: 3,
        ifFlag: 'badge7' },
      { x: 9, y: 4, sprite: 'blackbelt', dir: 'left', trainer: 'vg_atsushi', sight: 3,
        ifFlag: 'badge7' },
      { x: 5, y: 6, sprite: 'cooltrainerf', dir: 'down', trainer: 'vg_samantha', sight: 3,
        ifFlag: 'badge7' }
    ]
  };

  G.EVENTS.viridianGymGuide = function* () {
    if (G.flags.badge8) {
      yield { t: 'text', s: 'Guide: Eight. That is all of them. ROUTE 22, west of town, and then the long road up.' };
      return;
    }
    yield { t: 'text', s: 'Guide: So this is where he was. The eighth GYM, sat empty in the first town you ever walked through.' };
    yield { t: 'text', s: 'Guide: GROUND types. Nothing he has can touch a WATER, GRASS or ICE move, and everything he has will flatten anything ELECTRIC.' };
    yield { t: 'text', s: 'Guide: He knows that. He has known it for years. He is here anyway.' };
  };

  // ============================================================== EVENTS ====

  // Buying. The clerk offers whatever the map's `shopInventory` lists, priced
  // from items.js, and the loop keeps running until you pick Done — so stocking
  // up does not mean re-opening the menu once per Potion.
  // BILL's storage system, which every CENTRE's back wall is a terminal for.
  G.EVENTS.pcStorage = function* () {
    yield {
      t: 'custom',
      run: function (resume) { G.pushScene(G.PCScene(resume)); }
    };
  };

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
          // One column, six lines, scrolling — a mart counter list. Two
          // columns of "Full Restore  $3000" was a wall of text that grew
          // sideways with the stock, and SAFFRON's fifteen lines were already
          // within two rows of running off the bottom of the screen.
          G.pushScene(G.Chooser({
            items: labels, cols: 1, maxRows: 6,
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
      // A shop list has room for a name and a price and nothing else, so
      // anything whose value is in what it DOES says so on the way out. Only
      // the first one — after that you know.
      if (item.kind === 'key' && !G.flags['told_' + item.id]) {
        G.flags['told_' + item.id] = 1;
        yield { t: 'text', s: 'Clerk: ' + item.desc };
      }
    }
    yield { t: 'text', s: 'Clerk: Please come again!' };
  };

  // Which gym belongs to which town, and the badge flag it sets. The nurse
  // uses this to mention the gym while it is still unbeaten — every player
  // heals in every town, so it is the one line nobody can walk past.
  var TOWN_GYM = {
    pewtercentre:    ['badge1', 'BROCK',    'ROCK'],
    ceruleancentre:  ['badge2', 'MISTY',    'WATER'],
    vermilioncentre: ['badge3', 'LT. SURGE', 'ELECTRIC'],
    celadoncentre:   ['badge4', 'ERIKA',    'GRASS'],
    fuchsiacentre:   ['badge5', 'KOGA',     'POISON'],
    saffroncentre:   ['badge6', 'SABRINA',  'PSYCHIC'],
    cinnabarcentre:  ['badge7', 'BLAINE',   'FIRE'],
    viridiancentre:  ['badge8', 'GIOVANNI', 'GROUND']
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
    // and, while the town's gym is still standing, say so
    var gym = TOWN_GYM[G.world.mapId];
    if (gym && !G.flags[gym[0]]) {
      var have = (G.player.badges || []).filter(Boolean).length;
      yield { t: 'text', s: 'Nurse: ' + gym[1] + ' is still at the GYM, if you are looking for a badge. ' +
        gym[2] + ' POKéMON.' };
      if (have === 0) {
        yield { t: 'text', s: 'Nurse: You will want that badge before you go much further — the roads out of town do not get any gentler.' };
      }
    }
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
    yield* G.giveRunningShoes('Mum');
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
    var yours = G.SPECIES[G.flags.starter];
    yield { t: 'text', s: yours
      ? 'OAK: How is your ' + yours.name + '? Treat it well and it will surprise you.'
      : 'OAK: How is the little one getting on? Treat it well and it will surprise you.' };
    yield { t: 'text', s: 'OAK: Take the POKéDEX north and fill it. That is the real work.' };
    yield* G.giveRunningShoes('OAK');
  };

  // Picking a starter. The preview scene lets you look before committing, so a
  // misclick never costs you the whole run.
  function starterEvent(key, blurb) {
    return function* () {
      // Before the League this is the first irreversible choice in the game
      // and it stays that way. After it, OAK has no reason left to keep them
      // on a shelf, and a player should not be barred for ever from the one
      // they actually wanted.
      if (G.flags.starter && !G.flags.champion) {
        yield { t: 'text', s: 'The other two balls have already gone back to the shelf.' };
        return;
      }
      if (G.flags.starter && G.player.dexCaught[key]) {
        yield { t: 'text', s: 'That ball is empty. You already have one.' };
        return;
      }
      if (G.flags.starter) {
        yield { t: 'text', s: 'OAK: They have sat on that shelf since the day you left. Nobody else ever came for them.' };
        yield { t: 'text', s: 'OAK: Go on. You have earned the right to a second opinion.' };
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
          if (!G.flags.starter) G.flags.starter = key;   // the FIRST one is the story's
          if (G.player.party.length < 6) G.player.party.push(mon);
          else G.player.box.push(mon);
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
      { x: 9, y: 8, sprite: 'scientist', dir: 'left', event: 'oldAmberGift' },
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
    id: 'pewtergym', name: 'Pewter Gym', w: 12, h: 12,
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
      'IIIII..IIIII'
    ], 12, 12),
    deco: blank(12, 12),
    warps: [
      { x: 5, y: 11, to: 'pewter', tx: 5, ty: 11, dir: 'down' },
      { x: 6, y: 11, to: 'pewter', tx: 6, ty: 11, dir: 'down' }
    ],
    npcs: [
      { x: 8, y: 10, sprite: 'gymguy', dir: 'left', event: 'pewterGymGuide' }
    ],
    trainers: [
      { x: 5, y: 3, sprite: 'brock', dir: 'down', trainer: 'brock', sight: 0 },
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
    ['expshare', 'expall', 'potion', 'superpotion', 'antidote', 'parlyzheal', 'awakening', 'burnheal',
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
                 'The other three do a water ballet. She finds this excruciating.'] },
      { x: 2, y: 4, sprite: 'beauty', dir: 'down', event: 'tradeJynx' }
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
    id: 'ceruleangym', name: 'Cerulean Gym', w: 12, h: 12,
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
      'IIIII..IIIII'
    ], 12, 12),
    deco: blank(12, 12),
    warps: [
      { x: 5, y: 11, to: 'cerulean', tx: 5, ty: 12, dir: 'down' },
      { x: 6, y: 11, to: 'cerulean', tx: 6, ty: 12, dir: 'down' }
    ],
    npcs: [
      { x: 8, y: 10, sprite: 'gymguy', dir: 'left', event: 'ceruleanGymGuide' }
    ],
    trainers: [
      { x: 5, y: 3, sprite: 'misty', dir: 'down', trainer: 'misty', sight: 0 },
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
      if (G.flags.fossil && !G.flags.champion) {
        yield { t: 'text', s: 'The other fossil is gone. Someone took it while you were deciding.' };
        return;
      }
      if (G.flags.fossil && G.player.bag[item]) {
        yield { t: 'text', s: 'You are already carrying it.' };
        return;
      }
      if (G.flags.fossil) {
        yield { t: 'text', s: 'The rock has been worked back open, and the second fossil is loose in it.' };
        yield { t: 'text', s: 'Whoever was digging here gave up long ago. Nobody has been down since you.' };
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
    ['expshare', 'expall', 'potion', 'superpotion', 'antidote', 'parlyzheal', 'awakening', 'burnheal',
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
                 'I have had it eleven years.'] },
      { x: 2, y: 4, sprite: 'gentleman', dir: 'down', event: 'tradeFarfetchd' }
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
    yield { t: 'text', s: 'Chairman: Take it to the BIKE SHOP in CERULEAN — not the MART, the shop with the bicycle on the sign, down in the south-east corner of the city.' };
    yield { t: 'text', s: 'Chairman: They will not sell you one for money. Nobody has that much money.' };
  };

  // ----------------------------------------------------------- SURGE'S GYM --
  G.MAPS.vermiliongym = {
    id: 'vermiliongym', name: 'Vermilion Gym', w: 12, h: 12,
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
      'IIIII..IIIII'
    ], 12, 12),
    deco: blank(12, 12),
    warps: [
      { x: 5, y: 11, to: 'vermilion', tx: 5, ty: 18, dir: 'down' },
      { x: 6, y: 11, to: 'vermilion', tx: 6, ty: 18, dir: 'down' }
    ],
    npcs: [
      { x: 8, y: 10, sprite: 'gymguy', dir: 'left', event: 'vermilionGymGuide' }
    ],
    trainers: [
      { x: 5, y: 3, sprite: 'surge', dir: 'down', trainer: 'surge', sight: 0 },
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
      run: function (resume) { G.startTrainerBattle('blue_ssanne', { onEnd: resume }); }
    };
    if (!G.flags.blue_ssanne) return;
    yield { t: 'text', s: 'Blue: Fine! Go and be nice to the sick man. See what it gets you.' };
    yield { t: 'text', s: 'Blue: I am off to LAVENDER. Something is happening at that tower.' };
  };

  // ========================================================== LAVENDER TOWN =
  healCentre('lavendercentre', 'LAVENDER', { map: 'lavender', x: 6, y: 6 });
  pokeMart('lavendermart', 'LAVENDER', { map: 'lavender', x: 7, y: 18 },
    ['expshare', 'expall', 'potion', 'superpotion', 'antidote', 'parlyzheal', 'awakening', 'burnheal',
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
                 'Its mother is up in that tower. TEAM ROCKET put her there.'] },
      { x: 2, y: 4, sprite: 'littleboy', dir: 'down', event: 'tradeLickitung' }
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
      items: opts.items || [],
      scripts: opts.scripts || []
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
      { x: 10, y: 12, sprite: 'orb_stand', obj: true, event: 'towerGhost', unlessFlag: 'marowakLaid' }
    ],
    // She cannot block an open room by standing in one corner of it, so the
    // approach to the stairs is the gate: walk into it without the SILPH SCOPE
    // and she turns you back. This is the whole reason to go to CELADON.
    scripts: [
      { x: [1, 18], y: 13, run: 'towerGhost' }
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
  // She is a GATE, not scenery. In Red/Blue the unidentifiable ghost is the
  // reason you go to CELADON at all — you cannot get past her to MR. FUJI
  // without the SILPH SCOPE, and the SCOPE is under the GAME CORNER. Here she
  // stood in the middle of an open room and you could simply walk round her,
  // which made the SCOPE optional, the MAROWAK fight skippable, and MR. FUJI's
  // rescue something you could stumble into with no idea why it mattered.
  //
  // Invoked two ways now: talked to, or walked into. Only the second turns you
  // back, so speaking to her is still just speaking to her.
  G.EVENTS.towerGhost = function* (ctx) {
    var asGate = !!(ctx && ctx.run);
    if (G.flags.marowakLaid) {
      if (asGate) return;                       // the way is open; say nothing
      yield { t: 'text', s: 'The air here is ordinary now. Just a room.' };
      return;
    }
    if (asGate) {
      yield { t: 'fn', fn: function () {
        var p = G.world.player;
        p.y = p.y - 1;                          // back the way you came
        p.fromX = p.x; p.fromY = p.y;
        p.moving = false; p.step = 0;
        p.dir = 'down';
        G.audio.sfx('bump');
      } };
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
          { bg: 'indoor', onEnd: resume });
      }
    };
    yield { t: 'fn', fn: function () { G.flags.marowakLaid = 1; } };
    yield { t: 'text', s: 'MAROWAK looks at you for a long moment, and then she is not there any more.' };
    yield { t: 'text', s: 'The cold goes with her.' };
  };

  G.EVENTS.towerRival = function* () {
    // Belt and braces. The map retires him the moment the flag is set, but an
    // event that can start a fight should never rely on somebody else having
    // removed the person who starts it.
    if (G.flags.blue_tower) {
      yield { t: 'text', s: 'Blue: Go on, then. The stairs are that way.' };
      return;
    }
    yield { t: 'text', s: 'Blue: You again. Of course.' };
    yield { t: 'text', s: 'Blue: I came to see whether the ghost story was true. It is, by the way.' };
    yield {
      t: 'custom',
      run: function (resume) { G.startTrainerBattle('blue_tower', { onEnd: resume }); }
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
      { x: 6, y: 3, sprite: 'gentleman', dir: 'down', event: 'coinCaseGift' },
      { x: 2, y: 5, sprite: 'orb_stand', obj: true, event: 'eeveeGift' },
      { x: 8, y: 5, sprite: 'woman3', dir: 'left',
        dialog: ['My grandson goes to that GAME CORNER every day and never comes home richer.',
                 'I have started to wonder what he is actually doing in there.'] }
    ]
  };

  // ------------------------------------------------------------ ERIKA'S GYM -
  G.MAPS.celadongym = {
    id: 'celadongym', name: 'Celadon Gym', w: 12, h: 12,
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
      'IIIII..IIIII'
    ], 12, 12),
    deco: blank(12, 12),
    warps: [
      { x: 5, y: 11, to: 'celadon', tx: 6, ty: 18, dir: 'down' },
      { x: 6, y: 11, to: 'celadon', tx: 6, ty: 18, dir: 'down' }
    ],
    npcs: [
      { x: 8, y: 10, sprite: 'gymguy', dir: 'left', event: 'celadonGymGuide' }
    ],
    trainers: [
      { x: 5, y: 3, sprite: 'erika', dir: 'down', trainer: 'erika', sight: 0 },
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
      // The poster is ON THE WALL, and the grunt stands on the floor tile in
      // front of it. It used to be nowhere: the event described a poster and a
      // staircase behind it, and the warp sat on bare carpet two tiles from
      // any wall with nothing drawn on it or near it.
      'I................@',
      // The COIN COUNTER, immediately right of the door — the first thing you
      // walk past on the way in, which is exactly where a casino puts it. The
      // room had a prize counter and no way to get coins to spend at it, so
      // the COIN CASE, the machines and the entire prize shelf were all dead.
      'I...........CCCC.I',
      'I................I',
      'IIIIIIII..IIIIIIII',
      'IIIIIIIIIIIIIIIIII'
    ], 18, 14),
    deco: blank(18, 14),
    warps: [
      { x: 8, y: 12, to: 'celadon', tx: 6, ty: 12, dir: 'down' },
      { x: 9, y: 12, to: 'celadon', tx: 7, ty: 12, dir: 'down' },
      // Behind the poster, and only once the poster has been pulled off the
      // wall. Ungated, this was a square of ordinary carpet that dropped you
      // into TEAM ROCKET's basement if you happened to tread on it.
      { x: 16, y: 9, to: 'rockethideout1', tx: 2, ty: 1, dir: 'down',
        needFlag: 'hideoutOpen' }
    ],
    signs: [
      { x: 16, y: 2, text: 'PRIZE EXCHANGE — coins only. No refunds, no exceptions, no exchanges back to cash.' },
      { x: 16, y: 10, text: 'COINS SOLD HERE — 50 for $1000, 500 for $10000. A COIN CASE is required to carry them.' }
    ],
    npcs: [
      // He is standing on the trapdoor, which is why he will not move.
      { x: 16, y: 9, sprite: 'rocket', dir: 'left', event: 'gameCornerPoster',
        unlessFlag: 'hideoutOpen' },
      { x: 15, y: 2, sprite: 'clerk', dir: 'down', event: 'prizeCounter' },
      // Behind the coin counter, so you talk to her across the desk.
      { x: 13, y: 9, sprite: 'woman', dir: 'down', event: 'coinCounter' },
      { x: 2, y: 2, sprite: 'gambler', obj: true, dir: 'down', event: 'playSlots' },
      { x: 6, y: 2, sprite: 'gambler', obj: true, dir: 'down', event: 'playSlots' },
      { x: 2, y: 6, sprite: 'gambler', obj: true, dir: 'down', event: 'playSlots' },
      { x: 6, y: 6, sprite: 'gambler', obj: true, dir: 'down', event: 'playSlots' },
      { x: 5, y: 10, sprite: 'gambler', dir: 'down',
        dialog: ['Been here eleven hours. Down four thousand.',
                 'The machines are fine. It is me. It must be me.'] },
      { x: 11, y: 10, sprite: 'beauty', dir: 'down',
        dialog: ['That man by the back poster has not played a single game all day.',
                 'He just stands there. Watching the wall.'] }
    ]
  };

  // Cutting the staircase into the floor behind the poster. Written as a tile
  // EDIT rather than into the map, because the map is a module-level singleton
  // shared by every save — see field.js — and because doing it this way means
  // a save that already opened the hideout gets its stairs back the next time
  // it loads the room, rather than being stuck with the invisible version.
  G.openHideoutStairs = function () {
    if (G.setTileEdit) G.setTileEdit('gamecorner', 16, 9, 'stairs');
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
      run: function (resume) { G.startTrainerBattle('gc_rocket', { onEnd: resume }); }
    };
    if (!G.flags.gc_rocket) return;
    yield { t: 'fn', fn: function () {
      G.flags.hideoutOpen = 1;
      // and the staircase is now a thing you can see. The warp tile sat on
      // bare arcade floor, so even once this event said "there is a staircase
      // behind it" there was nothing whatever drawn there — you had to walk
      // onto an unremarkable square of carpet and hope.
      G.openHideoutStairs();
    } };
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
      run: function (resume) { G.startTrainerBattle('giovanni_hideout', { onEnd: resume }); }
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
    ['expshare', 'expall', 'potion', 'superpotion', 'hyperpotion', 'maxpotion', 'fullrestore',
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
                 'You get used to it. That is the frightening bit.'] },
      { x: 2, y: 4, sprite: 'gentleman', dir: 'down', event: 'tradeMrMime' }
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
      // The MASTER keeps the other one — until you come back as CHAMPION,
      // at which point he has rather run out of arguments.
      if (G.flags.dojoPrize && G.flags.champion && !G.player.dexCaught[key]) {
        yield { t: 'text', s: 'Master: You again. And a CHAMPION now, they tell me.' };
        yield { t: 'text', s: 'Master: I said the other one stays with me. I have thought better of it.' };
        yield { t: 'fn', fn: function () {
          var mon = G.makeMon(key, 25);
          if (G.player.party.length < 6) G.player.party.push(mon);
          else G.player.box.push(mon);
          G.player.dexSeen[key] = 1;
          G.player.dexCaught[key] = 1;
        } };
        yield { t: 'sfx', id: 'catchClick' };
        yield { t: 'text', s: 'You received ' + G.SPECIES[key].name + '!' };
        return;
      }
      if (G.flags.dojoPrize) {
        yield { t: 'text', s: 'The other ball is gone. The master took it back the moment you chose.' };
        return;
      }
      yield { t: 'text', s: blurb };
      yield { t: 'text', s: 'Master: One. Not both. Choose.' };
      // Look before you commit. This said "choose" and then simply handed you
      // whichever ball you happened to touch — an irreversible pick of one of
      // two POKéMON, made by walking into it. The starters get a screen that
      // shows you what is inside and lets you put it back down; this is the
      // same shape of decision, so it gets the same screen.
      var take = { v: false };
      yield {
        t: 'custom',
        run: function (resume) {
          G.pushScene(G.StarterPreviewScene(key, function (yes) {
            take.v = yes;
            resume();
          }));
        }
      };
      if (!take.v) {
        yield { t: 'text', s: 'You set the ball back down. The master says nothing.' };
        return;
      }
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
    id: 'saffrongym', name: 'Saffron Gym', w: 12, h: 12,
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
      'IGGUGGGGUGGI',
      'IGGGGGGGGGGI',
      'IGGGGGGGGGGI',
      'IIIII..IIIII'
    ], 12, 12),
    deco: blank(12, 12),
    warps: [
      { x: 5, y: 11, to: 'saffron', tx: 5, ty: 18, dir: 'down' },
      { x: 6, y: 11, to: 'saffron', tx: 6, ty: 18, dir: 'down' }
    ],
    npcs: [
      { x: 8, y: 10, sprite: 'gymguy', dir: 'left', event: 'saffronGymGuide' }
    ],
    trainers: [
      { x: 5, y: 3, sprite: 'sabrina', dir: 'down', trainer: 'sabrina', sight: 0 },
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
      { x: 5, y: 16, sprite: 'gentleman', dir: 'up', event: 'silphPresident' },
      // The employee with the LAPRAS. This event was written in full — it
      // checks that GIOVANNI has been thrown out of the building, it hands
      // over a level 15 LAPRAS, it has a line for coming back afterwards —
      // and NOBODY IN KANTO RAN IT. There was no way to obtain a LAPRAS at
      // all, and the dex audit said 151/151 because it dry-runs every event in
      // the table whether or not the world can reach one.
      { x: 9, y: 16, sprite: 'scientist', dir: 'down', event: 'laprasGift' }
    ]
  });

  G.EVENTS.silphBoss = function* () {
    yield { t: 'text', s: 'Giovanni: Twice now. You are becoming a scheduling problem.' };
    yield { t: 'text', s: 'Giovanni: SILPH makes a device that makes catching trivial. Do you understand what that is worth?' };
    yield { t: 'text', s: 'Giovanni: Every trainer in the world, obsolete. And I would own the reason.' };
    yield {
      t: 'custom',
      run: function (resume) { G.startTrainerBattle('giovanni_silph', { onEnd: resume }); }
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


  // ============================================================== ROUTE 12 ==
  // The fishing hut on SILENCE BRIDGE. The man inside gives away rods to
  // anyone who asks, which is either generosity or recruitment.
  G.MAPS.fishinghut = {
    id: 'fishinghut', name: 'Fishing Hut', w: 10, h: 9,
    music: 'town', battleBg: 'indoor', base: 'ifloor', indoors: true,
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'I(.T....PI',
      'I)......oI',
      'I........I',
      'I..T.....I',
      'I..o.....I',
      'I........I',
      'IIII..IIII',
      '..........'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 7, to: 'route12', tx: 6, ty: 23, dir: 'down' },
      { x: 5, y: 7, to: 'route12', tx: 6, ty: 23, dir: 'down' }
    ],
    npcs: [
      { x: 4, y: 4, sprite: 'fisher', dir: 'down', event: 'goodRodGift' }
    ]
  };

  // ============================================================== FUCHSIA ===
  healCentre('fuchsiacentre', 'FUCHSIA', { map: 'fuchsia', x: 6, y: 9 });
  pokeMart('fuchsiamart', 'FUCHSIA', { map: 'fuchsia', x: 20, y: 9 },
    ['expshare', 'expall', 'ultraball', 'greatball', 'hyperpotion', 'superpotion', 'fullheal', 'revive', 'maxrepel']);

  // KOGA's gym. In Red/Blue this room is invisible walls — a puzzle built out
  // of bad information rather than out of geometry, and the only way through
  // is to walk into things until you have mapped it by collision. This is the
  // same idea made honest: a real maze, generated as a spanning tree so there
  // is exactly one route from the door to KOGA and no walls you cannot see.
  // Every dead end has a ninja in it who has clearly been waiting some time.
  G.MAPS.fuchsiagym = {
    id: 'fuchsiagym', name: 'Fuchsia Gym', w: 19, h: 17,
    music: 'gym', battleBg: 'indoor', base: 'marble', indoors: true,
    gymTint: '#a040a0',
    // A FLAT floor. `gfloor` is banded, and banded floor next to banded wall
    // is why this maze was invisible the first time: the walls have to be the
    // only pattern on the screen for the shape of the room to read at all.
    legend: { '.': 'marble', 'I': 'gymwall' },
    ground: pad([
      'IIIIIIIIIIIIIIIIIII',
      'I...I.....I.......I',
      'I.I.III.I.IIIII.I.I',
      'I.I.....I.....I.I.I',
      // (2,4) is an alcove cut off the entry corridor for the GYM GUIDE to
      // stand in. It is a DEAD END — it adds no route, so the maze is still
      // exactly one path — and the corridor past it is mandatory, so nobody
      // walks by without meeting him. He used to stand at (1,15): the single
      // tile between the door and the rest of the room, and the tile you land
      // on. Step off it once and he sealed the only way out.
      'I..IIIIIIIIII.III.I',
      'I.I.......I...I...I',
      'I.III.III.I.III.III',
      'I...I...I...I.....I',
      'III.III.IIIIIIIII.I',
      'I...I...I.......I.I',
      'I.III.IIIII.III.I.I',
      'I.I...I.....I.I...I',
      'I.I.III.IIIII.III.I',
      'I.I.I...I.I.....I.I',
      'I.I.I.III.I.III.I.I',
      'I.I...I.......I...I',
      'I.IIIIIIIIIIIIIIIII'
    ], 19, 17),
    deco: blank(19, 17),
    warps: [
      { x: 1, y: 16, to: 'fuchsia', tx: 5, ty: 19, dir: 'down' }
    ],
    trainers: [
      { x: 17, y: 1, sprite: 'koga', dir: 'down', trainer: 'koga', sight: 0 },
      { x: 5, y: 1, sprite: 'blackbelt', dir: 'down', trainer: 'fg_nob', sight: 0 },
      { x: 9, y: 9, sprite: 'juggler', dir: 'down', trainer: 'fg_kirk', sight: 0 },
      { x: 13, y: 11, sprite: 'juggler', dir: 'down', trainer: 'fg_shawn', sight: 0 },
      { x: 9, y: 13, sprite: 'blackbelt', dir: 'down', trainer: 'fg_rocky', sight: 0 }
    ],
    npcs: [
      { x: 2, y: 4, sprite: 'gymguy', dir: 'left', event: 'fuchsiaGymGuide' }
    ]
  };

  G.EVENTS.fuchsiaGymGuide = function* () {
    if (G.flags.badge5) {
      yield { t: 'text', s: 'Guide: The SOULBADGE. Your POKéMON will SURF for you now — the whole south of KANTO just opened up.' };
      return;
    }
    yield { t: 'text', s: 'Guide: KOGA does not beat you. He waits for you to beat yourself.' };
    yield { t: 'text', s: 'Guide: TOXIC, then DOUBLE TEAM, then nothing. Every turn you miss, the poison gets worse.' };
    yield { t: 'text', s: 'Guide: So do not settle in. Bring something fast that hits hard, and end it early.' };
    yield { t: 'text', s: 'Guide: One route through, one way back. Mind the dead ends — they are not empty.' };
  };

  // The WARDEN. He cannot speak without his teeth, which is played for a laugh
  // and then quietly stops being funny: he has been in charge of the preserve
  // for forty years and nobody in town has learned to read his gestures.
  G.MAPS.wardenhouse = {
    id: 'wardenhouse', name: "Warden's House", w: 10, h: 9,
    music: 'town', battleBg: 'indoor', base: 'ifloor', indoors: true,
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'I(.B..B.PI',
      'I)......oI',
      'I........I',
      'I...TT...I',
      'I...oo...I',
      'I........I',
      'IIII..IIII',
      '..........'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 7, to: 'fuchsia', tx: 20, ty: 19, dir: 'down' },
      { x: 5, y: 7, to: 'fuchsia', tx: 20, ty: 19, dir: 'down' }
    ],
    npcs: [
      { x: 4, y: 3, sprite: 'oldman', dir: 'down', event: 'wardenTeeth' }
    ],
    signs: [
      { x: 6, y: 1, text: 'A framed photograph: a much younger man, standing in tall grass, grinning with all his teeth.' }
    ]
  };

  G.EVENTS.wardenTeeth = function* () {
    if (G.flags.warden_paid) {
      yield { t: 'text', s: 'WARDEN: Come back any time! The ZONE is always open to you.' };
      return;
    }
    if (G.player.bag.goldteeth) {
      yield { t: 'text', s: 'WARDEN: Hnnf! Hnn hnnf!' };
      yield { t: 'text', s: 'He is pointing at your bag. At the GOLD TEETH.' };
      yield { t: 'text', s: 'You handed over the GOLD TEETH.' };
      yield { t: 'sfx', id: 'heal' };
      yield { t: 'fn', fn: function () {
        delete G.player.bag.goldteeth;
        G.player.bag.hm04 = 1;
        G.flags.warden_paid = 1;
      } };
      yield { t: 'text', s: 'WARDEN: There! Ahh, that is better. Forty years I have run that preserve and I have never once been able to say thank you properly.' };
      yield { t: 'text', s: 'WARDEN: Take this. HM04. STRENGTH.' };
      yield { t: 'text', s: 'You received HM04 STRENGTH!' };
      yield { t: 'text', s: 'WARDEN: A POKéMON that knows it will shift any boulder in KANTO. There are more of those in your way than you think.' };
      return;
    }
    yield { t: 'text', s: 'WARDEN: Hnn! Hnnf hnn hnnnf!' };
    yield { t: 'text', s: 'He is trying very hard to tell you something and you cannot understand a word of it.' };
    yield { t: 'text', s: 'He mimes something small. Then he taps his jaw, and looks embarrassed.' };
  };

  // ========================================================== SAFARI ZONE ===
  // The gate. ₽500 buys thirty SAFARI BALLs and six hundred steps, and the
  // step counter is the entire design: the two things worth having are at
  // opposite ends of the preserve and you cannot fetch both in one visit
  // unless you already know the way.
  G.MAPS.safarigate = {
    id: 'safarigate', name: 'Safari Zone Gate', w: 12, h: 10,
    music: 'center', battleBg: 'indoor', base: 'ifloor', indoors: true,
    legend: G.LEG_INT,
    ground: pad([
      'IIIIII..IIII',
      'I..........I',
      'I..........I',
      'I..CCC..CC.I',
      'I..........I',
      'I..........I',
      'I..........I',
      'I..........I',
      'IIII..IIIIII',
      '............'
    ], 12, 10),
    deco: blank(12, 10),
    warps: [
      { x: 4, y: 8, to: 'fuchsia', tx: 12, ty: 5, dir: 'down' },
      { x: 5, y: 8, to: 'fuchsia', tx: 13, ty: 5, dir: 'down' },
      { x: 6, y: 0, to: 'safarizonecenter', tx: 12, ty: 18, dir: 'up' },
      { x: 7, y: 0, to: 'safarizonecenter', tx: 13, ty: 18, dir: 'up' }
    ],
    npcs: [
      { x: 4, y: 4, sprite: 'clerk', dir: 'down', event: 'safariEnter' },
      { x: 9, y: 6, sprite: 'gentleman', dir: 'left',
        dialog: ['Six hundred steps. It sounds generous until you are four hundred in and lost.',
                 'Count your turns, not your steps. That is the trick.'] }
    ],
    signs: [
      { x: 3, y: 3, text: 'SAFARI ZONE RULES: no attacking. Throw BAIT to make them stay, throw a ROCK to make them catchable, and accept that both make them flightier.' }
    ]
  };

  G.EVENTS.safariEnter = function* () {
    if (G.flags.safari_active) {
      yield { t: 'text', s: 'ATTENDANT: You are still on the clock! ' + (G.player.safariSteps || 0) + ' steps left.' };
      return;
    }
    yield { t: 'text', s: 'ATTENDANT: Welcome to the SAFARI ZONE! ₽500 for thirty SAFARI BALLs and six hundred steps. Would you like to play?' };
    var yes = { v: false };
    yield {
      t: 'custom',
      run: function (done) {
        G.pushScene(G.Chooser({
          items: ['Yes', 'No'], cancelIndex: 1,
          onPick: function (i) { yes.v = (i === 0); done(); }
        }));
      }
    };
    if (!yes.v) {
      yield { t: 'text', s: 'ATTENDANT: Do come back!' };
      return;
    }
    if (G.player.money < 500) {
      yield { t: 'text', s: 'ATTENDANT: ...You do not have enough. I am sorry.' };
      return;
    }
    yield { t: 'fn', fn: function () {
      G.player.money -= 500;
      G.player.bag.safariball = 30;
      G.player.safariSteps = 600;
      G.flags.safari_active = 1;
    } };
    yield { t: 'sfx', id: 'confirm' };
    yield { t: 'text', s: 'You received 30 SAFARI BALLs. The counter above the gate flicks over to 600.' };
    yield { t: 'text', s: 'ATTENDANT: When it reaches zero, we come and get you. Good luck!' };
  };

  // The rest house in the middle of the preserve. Nothing here heals you —
  // that would defeat the point — but the step counter stops while you talk.
  G.MAPS.safarirest = {
    id: 'safarirest', name: 'Safari Rest House', w: 10, h: 9,
    music: 'center', battleBg: 'indoor', base: 'ifloor', indoors: true,
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'I.T....P.I',
      'I.o......I',
      'I........I',
      'I.o.o.o..I',
      'I........I',
      'I........I',
      'IIII..IIII',
      '..........'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 7, to: 'safarizonecenter', tx: 16, ty: 10, dir: 'down' },
      { x: 5, y: 7, to: 'safarizonecenter', tx: 16, ty: 10, dir: 'down' }
    ],
    npcs: [
      { x: 3, y: 4, sprite: 'workerm', dir: 'down',
        dialog: ['Sit down a minute. The clock does not run in here.',
                 'Everyone works that out eventually, usually about four hundred steps in.'] },
      { x: 7, y: 4, sprite: 'picnicker', dir: 'left',
        dialog: ['I come for the CHANSEY. I have never caught one.',
                 'I have seen four. That is four more than most people.'] }
    ]
  };

  // The SECRET HOUSE. Whoever lives here is not home, has never been home, and
  // left HM03 on the table — the single most valuable object in the region,
  // unguarded, at the far end of a preserve with a step limit.
  G.MAPS.secrethouse = {
    id: 'secrethouse', name: 'Secret House', w: 12, h: 10,
    music: 'town', battleBg: 'indoor', base: 'ifloor', indoors: true,
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIII',
      'I(.......P.I',
      'I).........I',
      'I..........I',
      'I....TT....I',
      'I....oo....I',
      'I..........I',
      'I..........I',
      'IIIII..IIIII',
      '............'
    ], 12, 10),
    deco: blank(12, 10),
    warps: [
      { x: 5, y: 8, to: 'safarizonewest', tx: 8, ty: 6, dir: 'down' },
      { x: 6, y: 8, to: 'safarizonewest', tx: 9, ty: 6, dir: 'down' }
    ],
    npcs: [
      { x: 5, y: 3, sprite: 'oldman', dir: 'down', event: 'secretHouseSurf' }
    ],
    signs: [
      { x: 9, y: 1, text: 'A logbook, open, thick with dust. The last entry is a species name nobody has ever catalogued, and a question mark.' }
    ]
  };

  G.EVENTS.secretHouseSurf = function* () {
    if (G.flags.got_surf) {
      yield { t: 'text', s: 'He nods at you, then goes back to watching the window.' };
      return;
    }
    yield { t: 'text', s: 'The old man does not seem surprised to see you. He does not seem to have been surprised by anything in a long time.' };
    yield { t: 'text', s: '???: You walked all the way out here. Past the marsh, past the ranges, on a clock.' };
    yield { t: 'text', s: '???: Most people turn back at the water. That is what the water is for.' };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'fn', fn: function () { G.player.bag.hm03 = 1; G.flags.got_surf = 1; } };
    yield { t: 'text', s: 'You received HM03 SURF!' };
    yield { t: 'text', s: '???: Now the water is a road instead of a wall. Half of KANTO is only reachable that way, and none of it is on your map yet.' };
    yield { t: 'text', s: '???: Go on. I have been waiting a very long time for someone to make the rest of it interesting.' };
  };

  // The GOOD ROD, from the man on the bridge. He gives it away because a rod
  // that only ever catches MAGIKARP is a joke you should not have to keep.
  G.EVENTS.goodRodGift = function* () {
    if (G.player.bag.goodrod) {
      yield { t: 'text', s: 'FISHING GURU: Any luck? The water under this bridge goes down further than the town does up.' };
      return;
    }
    yield { t: 'text', s: 'FISHING GURU: I am the FISHING GURU. Do you like to fish?' };
    yield { t: 'text', s: 'FISHING GURU: ...You are still using an OLD ROD. Oh, dear.' };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'fn', fn: function () { G.player.bag.goodrod = 1; } };
    yield { t: 'text', s: 'You received a GOOD ROD!' };
    yield { t: 'text', s: 'FISHING GURU: That will pull up something with a spine in it. My brother in VERMILION has a better one still, if you can find him.' };
  };

  // SNORLAX. Two of them, asleep across two roads, and the same solution to
  // both — which is why the POKé FLUTE is worth a whole tower of ghosts.
  G.EVENTS.snorlaxWake = function* () {
    var here = G.world.mapId;
    if (!G.player.bag.pokeflute) {
      yield { t: 'text', s: 'A SNORLAX is asleep across the whole road.' };
      yield { t: 'text', s: 'It is breathing. That is the only thing about it that is doing anything.' };
      yield { t: 'text', s: 'Shouting does not work. Shoving does not work. It does not even shift its weight.' };
      return;
    }
    yield { t: 'text', s: 'A SNORLAX is asleep across the whole road.' };
    yield { t: 'text', s: 'You played the POKé FLUTE.' };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'wait', frames: 30 };
    yield { t: 'text', s: 'The SNORLAX opened one eye.' };
    yield { t: 'text', s: 'It looked at you the way you look at an alarm clock.' };
    yield { t: 'fn', fn: function () {
      if (here === 'route12') G.flags.snorlax12 = 1; else G.flags.snorlax16 = 1;
    } };
    yield {
      t: 'custom',
      run: function (done) {
        var wild = G.makeMon('snorlax', 30);
        G.player.dexSeen.snorlax = 1;
        G.startBattle(
          { party: G.player.party, foes: [wild], wild: true },
          { bg: 'meadow', onEnd: function (res, b) { G.afterBattle(res, b); done(); } }
        );
      }
    };
    yield { t: 'text', s: 'The road is clear.' };
  };

  // ================================================= ROUTE 16 / 17 / 18 =====
  // Gate buildings. Both are two-storey: the road on top crosses the road
  // underneath, and the stairs between them are the only connection. That is
  // how CYCLING ROAD gets over ROUTE 18 without either road acknowledging the
  // other exists.
  function roadGate(id, name, down, up, guardText) {
    G.MAPS[id] = {
      id: id, name: name, w: 10, h: 9,
      music: 'center', battleBg: 'indoor', base: 'ifloor', indoors: true,
      legend: G.LEG_INT,
      ground: pad([
        'IIII..IIII',
        'I........I',
        'I........I',
        'I..C..C..I',
        'I........I',
        'I........I',
        'I........I',
        'IIII..IIII',
        '..........'
      ], 10, 9),
      deco: blank(10, 9),
      warps: [
        { x: 4, y: 7, to: down.map, tx: down.x, ty: down.y, dir: 'down' },
        { x: 5, y: 7, to: down.map, tx: down.x, ty: down.y, dir: 'down' },
        { x: 4, y: 0, to: up.map, tx: up.x, ty: up.y, dir: 'up' },
        { x: 5, y: 0, to: up.map, tx: up.x, ty: up.y, dir: 'up' }
      ],
      npcs: [
        { x: 3, y: 4, sprite: 'gymguy', dir: 'down', event: guardText }
      ]
    };
  }

  roadGate('cyclegate', 'Cycling Road Gate',
    { map: 'route16', x: 5, y: 6 }, { map: 'route17', x: 9, y: 1 }, 'cycleGateGuard');
  roadGate('route18gate', 'Route 18 Gate',
    { map: 'route18', x: 5, y: 6 }, { map: 'route17', x: 9, y: 34 }, 'cycleGateGuard');

  G.EVENTS.cycleGateGuard = function* () {
    if (G.player.bag.bicycle) {
      yield { t: 'text', s: 'GUARD: On you go. Mind the ledges — it is downhill the whole way and you cannot come back up.' };
      return;
    }
    yield { t: 'text', s: 'GUARD: CYCLING ROAD is for BICYCLES. It is a hill with no brakes on it, and on foot you will be flattened.' };
    yield { t: 'text', s: 'GUARD: Come back with a BICYCLE. There is a shop in CERULEAN.' };
  };

  // The house on ROUTE 16 with HM02. FLY is the only HM you are given rather
  // than made to earn, which is deliberate: by the time you can reach it, you
  // have walked every road in KANTO at least twice.
  G.MAPS.flyhouse = {
    id: 'flyhouse', name: 'A House on Route 16', w: 10, h: 9,
    music: 'town', battleBg: 'indoor', base: 'ifloor', indoors: true,
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'I(.T....PI',
      'I).....o.I',
      'I........I',
      'I..TT....I',
      'I..oo....I',
      'I........I',
      'IIII..IIII',
      '..........'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 7, to: 'route16', tx: 16, ty: 6, dir: 'down' },
      { x: 5, y: 7, to: 'route16', tx: 16, ty: 6, dir: 'down' }
    ],
    npcs: [
      { x: 4, y: 3, sprite: 'woman', dir: 'down', event: 'flyGift' }
    ]
  };

  G.EVENTS.flyGift = function* () {
    if (G.flags.got_fly) {
      yield { t: 'text', s: 'She waves at you from the window seat. Her PIDGEY is asleep on the sill.' };
      // She will say it again, because this is the one instruction in the game
      // you are most likely to be told once and need much later.
      yield { t: 'text', s: '???: Menu, then MAP, then Z on a town you have already been to.' };
      if (!G.flags.badge3) {
        yield { t: 'text', s: '???: And you still want the THUNDER BADGE first. LT. SURGE, VERMILION CITY. Without it the map will refuse you.' };
      }
      return;
    }
    yield { t: 'text', s: 'She is watching the road. There is a very old PIDGEY asleep on the windowsill beside her.' };
    yield { t: 'text', s: '???: You have walked past this window four times now. West, then east, then west again.' };
    yield { t: 'text', s: '???: Everyone does. There is only the one road and it goes one way.' };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'fn', fn: function () { G.player.bag.hm02 = 1; G.flags.got_fly = 1; } };
    yield { t: 'text', s: 'You received HM02 FLY!' };
    // Everything a player needs to actually use it, said once, here. She used
    // to describe the TOWN MAP and stop — which leaves out the badge, and
    // leaves out the button. Somebody with FLY taught to a PIDGEOT and no
    // THUNDER BADGE gets refused with no idea which of the two is missing.
    yield { t: 'text', s: '???: Teach it to something with wings. Anything that flies will take it.' };
    yield { t: 'text', s: '???: Then press ENTER for the menu, choose MAP, move the cursor onto a town, and press Z.' };
    yield { t: 'text', s: '???: One catch. Nobody will let you fly over KANTO without the THUNDER BADGE — that is LT. SURGE, at the GYM in VERMILION CITY.' };
    yield { t: 'text', s: '???: Until you have it, the map will just say no.' };
    yield { t: 'text', s: '???: And it only takes you where you have already stood. It will not take you anywhere new — that part is still yours.' };
  };

  // The SUPER ROD hut on ROUTE 15 — the third and last rod. The brothers have
  // been handing these out down the length of the region for years.
  G.MAPS.superrodhut = {
    id: 'superrodhut', name: 'Fishing Brothers', w: 10, h: 9,
    music: 'town', battleBg: 'indoor', base: 'ifloor', indoors: true,
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'I(.B..B.PI',
      'I).......I',
      'I........I',
      'I..T.....I',
      'I..o.....I',
      'I........I',
      'IIII..IIII',
      '..........'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 7, to: 'route15', tx: 3, ty: 7, dir: 'down' },
      { x: 5, y: 7, to: 'route15', tx: 3, ty: 7, dir: 'down' }
    ],
    npcs: [
      { x: 4, y: 4, sprite: 'fisher', dir: 'down', event: 'superRodGift' }
    ]
  };

  G.EVENTS.superRodGift = function* () {
    if (G.player.bag.superrod) {
      yield { t: 'text', s: 'FISHING GURU: Nothing left to give you. Go and use it.' };
      return;
    }
    if (!G.player.bag.goodrod) {
      yield { t: 'text', s: 'FISHING GURU: My brother on SILENCE BRIDGE hands out GOOD RODs. Start there.' };
      yield { t: 'text', s: 'FISHING GURU: I am not giving the best one to somebody who has not held the middle one.' };
      return;
    }
    yield { t: 'text', s: 'FISHING GURU: You have my brother\'s rod. I can tell — he files the grip down, always has.' };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'fn', fn: function () { G.player.bag.superrod = 1; } };
    yield { t: 'text', s: 'You received a SUPER ROD!' };
    yield { t: 'text', s: 'FISHING GURU: That one reaches the bottom. Everything worth catching in KANTO lives at the bottom.' };
  };

  // ============================================================= CINNABAR ===
  healCentre('cinnabarcentre', 'CINNABAR', { map: 'cinnabar', x: 15, y: 6 });
  pokeMart('cinnabarmart', 'CINNABAR', { map: 'cinnabar', x: 16, y: 15 },
    ['expshare', 'expall', 'ultraball', 'greatball', 'maxpotion', 'hyperpotion', 'fullheal', 'revive', 'maxrepel', 'escaperope']);

  // The LAB. Two rooms in one: the fossil bench at the back, and the trade
  // desk at the front. The fossil you did NOT take in MT. MOON is gone
  // forever, which is the only irreversible choice in the game besides the
  // starter and the DOJO.
  G.MAPS.cinnabarlab = {
    id: 'cinnabarlab', name: 'Pokémon Lab', w: 14, h: 14,
    music: 'center', battleBg: 'indoor', base: 'ifloor', indoors: true,
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIIIIIII',
      'I.HHH....HHH.I',
      'I............I',
      'I..T......T..I',
      'I..o......o..I',
      'I............I',
      'I.CCCCCCCCCC.I',
      'I............I',
      'I..B..B..B...I',
      'I............I',
      'I..o......o..I',
      'I............I',
      'IIIII..IIIIIII',
      '..............'
    ], 14, 14),
    deco: blank(14, 14),
    warps: [
      { x: 5, y: 12, to: 'cinnabar', tx: 7, ty: 6, dir: 'down' },
      { x: 6, y: 12, to: 'cinnabar', tx: 8, ty: 6, dir: 'down' }
    ],
    npcs: [
      { x: 4, y: 5, sprite: 'scientist', dir: 'down', event: 'fossilRevive' },
      { x: 9, y: 5, sprite: 'scientist', dir: 'down', event: 'labTrade' },
      { x: 3, y: 10, sprite: 'workerm', dir: 'right',
        dialog: ['The MANSION was ours, once. Then it was not, and nobody will say what happened in between.',
                 'The paperwork stops in the same month for every single project.'] }
    ],
    signs: [
      { x: 2, y: 1, text: 'A centrifuge, running. Whatever is in it has been spinning for a very long time.' },
      { x: 11, y: 1, text: 'A wall of specimen jars. Most are empty. The labels have not been removed.' }
    ]
  };

  // Fossil revival. AERODACTYL from the OLD AMBER, OMANYTE from the HELIX,
  // KABUTO from the DOME — the three species in the dex that cannot be caught
  // anywhere, at any level, by anyone.
  G.EVENTS.fossilRevive = function* () {
    var FOSSILS = [
      { item: 'domefossil', sp: 'kabuto', name: 'DOME FOSSIL' },
      { item: 'helixfossil', sp: 'omanyte', name: 'HELIX FOSSIL' },
      { item: 'oldamber', sp: 'aerodactyl', name: 'OLD AMBER' }
    ];
    var held = FOSSILS.filter(function (f) { return G.player.bag[f.item]; });
    if (!held.length) {
      yield { t: 'text', s: 'SCIENTIST: We can bring a POKéMON back from a fossil. We have done it four times.' };
      yield { t: 'text', s: 'SCIENTIST: Bring me something old enough and I will show you.' };
      return;
    }
    // You will normally be holding TWO — a Mt. Moon fossil and the OLD AMBER
    // from the Pewter museum — so the machine has to ask which. Picking one
    // automatically meant the other could never be revived at all.
    var f = held[0];
    if (held.length > 1) {
      var choice = { v: 0 };
      var names = held.map(function (h) { return h.name; }).concat(['Neither']);
      yield { t: 'text', s: 'SCIENTIST: You are carrying more than one. Which should I work on?' };
      yield {
        t: 'custom',
        run: function (done) {
          G.pushScene(G.Chooser({
            items: names, cancelIndex: names.length - 1,
            onPick: function (i) { choice.v = i; done(); }
          }));
        }
      };
      if (choice.v >= held.length) { yield { t: 'text', s: 'SCIENTIST: Come back when you have decided.' }; return; }
      f = held[choice.v];
    }
    yield { t: 'text', s: 'SCIENTIST: That is a ' + f.name + '. Where did you— no. Never mind. May I?' };
    yield { t: 'text', s: 'You handed over the ' + f.name + '.' };
    yield { t: 'text', s: 'SCIENTIST: Come back in a while. This is not quick and it is not always kind.' };
    yield { t: 'wait', frames: 60 };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'text', s: '...' };
    yield { t: 'text', s: 'SCIENTIST: It worked. It always works, and it never stops being the strangest thing I have ever seen.' };
    yield { t: 'fn', fn: function () {
      delete G.player.bag[f.item];
      var mon = G.makeMon(f.sp, 30);
      G.player.dexSeen[f.sp] = 1;
      G.player.dexCaught[f.sp] = 1;
      if (G.player.party.length < 6) G.player.party.push(mon);
      else G.player.box.push(mon);
      G.flags['revived_' + f.sp] = 1;
    } };
    yield { t: 'text', s: 'You received ' + G.SPECIES[f.sp].name.toUpperCase() + '!' };
    yield { t: 'text', s: 'SCIENTIST: It has been extinct for a hundred million years and it is now standing in my lab, looking at me.' };
    yield { t: 'text', s: 'SCIENTIST: Take it outside. Please.' };
  };

  G.EVENTS.labTrade = function* () {
    if (G.flags.lab_trade) {
      yield { t: 'text', s: 'SCIENTIST: My PONYTA is settling in nicely. Yours is somewhere on the other side of the sea by now.' };
      return;
    }
    var mine = null, idx = -1;
    for (var i = 0; i < G.player.party.length; i++) {
      if (G.player.party[i].sp === 'raichu') { mine = G.player.party[i]; idx = i; break; }
    }
    yield { t: 'text', s: 'SCIENTIST: I run trades. Not for money — for the look on their faces when they arrive.' };
    if (!mine) {
      yield { t: 'text', s: 'SCIENTIST: I want a RAICHU. I will give you a PONYTA for it, and the PONYTA is a good one.' };
      return;
    }
    yield { t: 'text', s: 'SCIENTIST: A RAICHU! Yes. Trade it for my PONYTA?' };
    var yes = { v: false };
    yield {
      t: 'custom',
      run: function (done) {
        G.pushScene(G.Chooser({
          items: ['Yes', 'No'], cancelIndex: 1,
          onPick: function (i) { yes.v = (i === 0); done(); }
        }));
      }
    };
    if (!yes.v) { yield { t: 'text', s: 'SCIENTIST: The offer stands.' }; return; }
    yield { t: 'fn', fn: function () {
      var lvl = G.player.party[idx].level;
      G.player.party[idx] = G.makeMon('ponyta', lvl);
      G.player.party[idx].nickname = null;
      G.player.dexCaught.ponyta = 1;
      G.player.dexSeen.ponyta = 1;
      G.flags.lab_trade = 1;
    } };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'text', s: 'You traded your RAICHU for a PONYTA!' };
    yield { t: 'text', s: 'SCIENTIST: A traded POKéMON grows faster. Nobody has ever explained why to my satisfaction.' };
  };

  // ================================================== POKéMON MANSION ======
  // Burnt out, condemned, and the only building in KANTO that is a ruin rather
  // than a room. BLAINE's SECRET KEY is in the basement, and so are the
  // journals — six lines of research log that are the entire backstory of the
  // strongest thing in the game, written by people who did not survive writing
  // them.
  function mansionFloor(id, name, rowsIn, opts) {
    G.MAPS[id] = {
      id: id, name: name, w: 20, h: 20,
      music: 'cave', battleBg: 'indoor', base: 'burntfloor', indoors: true,
      legend: { '.': 'burntfloor', '#': 'burntwall', '>': 'stairs' },
      ground: pad(rowsIn, 20, 20),
      deco: blank(20, 20),
      encounters: (G.ENCOUNTERS || {})[opts.enc || id],
      warps: opts.warps,
      signs: opts.signs || [],
      npcs: opts.npcs || [],
      items: opts.items || [],
      trainers: opts.trainers || []
    };
  }

  mansionFloor('mansion1f', 'Pokémon Mansion 1F', [
      '####################',
      '#.#.........#.#...##',
      '#.#####.#.#.#.#.#.##',
      '#.#.....#.#.....#.##',
      '#....####.#.#.###.##',
      '#...........#...#.##',
      '#.....#.#.#.#.###.##',
      '#...#.#.#...#.#...##',
      '#####.#.#.#.#.#.####',
      '#.....#.......#...##',
      '#....#...####.###.##',
      '#.........#...#...##',
      '#....#...#...##.#.##',
      '#.#.............#.##',
      '#.###.####...####.##',
      '#...#.#...........##',
      '###.###.#.....###.##',
      '#.......#.....#...##',
      '####################',
      '####################'
    ], {
    warps: [
      { x: 10, y: 17, to: 'cinnabar', tx: 8, ty: 11, dir: 'down' },
      { x: 17, y: 3, to: 'cinnabar', tx: 9, ty: 11, dir: 'down' },
      { x: 1, y: 1, to: 'mansion2f', tx: 9, ty: 17, dir: 'up' }
    ],
    signs: [
      { x: 1, y: 7, text: 'A research journal, water-damaged. "DIARY: JULY 5. GUYANA, SOUTH AMERICA. A new POKéMON was discovered deep in the jungle."' },
      { x: 7, y: 3, text: 'Scorch marks up the wall, and a handprint in the soot at shoulder height. Someone left in a hurry.' }
    ],
    items: [
      { x: 11, y: 1, item: 'escaperope', flag: 'mn_rope' },
      { x: 16, y: 7, item: 'tm14', flag: 'mn_tm14' }
    ],
    trainers: [
      { x: 3, y: 4, sprite: 'scientist', dir: 'right', trainer: 'mn_braydon', sight: 3 },
      { x: 11, y: 6, sprite: 'burglar', dir: 'left', trainer: 'mn_ramon', sight: 3 }
    ]
  });

  mansionFloor('mansion2f', 'Pokémon Mansion 2F', [
      '####################',
      '#.#.....#.....#...##',
      '#.#.##........#.####',
      '#.#...........#...##',
      '#.###....#....#.#.##',
      '#.............#...##',
      '#####.....##....#.##',
      '#.....#...#.....#.##',
      '#.#####.###.....#.##',
      '#.#.....#...#...#.##',
      '#.#.###.#.#.#.#.#.##',
      '#...#...#.........##',
      '####....#.#.#####.##',
      '#.......#.......#.##',
      '#.##...##.###.#.#.##',
      '#.#...........#...##',
      '#.#.#.#.#####.###.##',
      '#...#.......#.....##',
      '####################',
      '####################'
    ], {
    warps: [
      { x: 10, y: 17, to: 'mansion1f', tx: 9, ty: 17, dir: 'down' },
      { x: 17, y: 1, to: 'mansionb1f', tx: 9, ty: 17, dir: 'down' }
    ],
    signs: [
      { x: 1, y: 1, text: '"DIARY: JULY 10. We named the newly discovered POKéMON MEW."' },
      { x: 11, y: 1, text: '"DIARY: FEB 6. MEW gave birth. We named the new POKéMON MEWTWO."' }
    ],
    items: [
      { x: 17, y: 6, item: 'maxpotion', flag: 'mn_maxpotion' },
      { x: 1, y: 8, item: 'tm22', flag: 'mn_tm22' }
    ],
    trainers: [
      { x: 13, y: 4, sprite: 'burglar', dir: 'down', trainer: 'mn_dalton', sight: 3 },
      { x: 4, y: 3, sprite: 'scientist', dir: 'right', trainer: 'mn_ivan', sight: 3 }
    ]
  });

  mansionFloor('mansionb1f', 'Pokémon Mansion B1F', [
      '####################',
      '#...............#.##',
      '#.#######.#.#.#.#.##',
      '#.......#.#...#...##',
      '####....#.#.#####.##',
      '#.......#.#.#.....##',
      '#.##...##.#.###.####',
      '#...#.....#...#...##',
      '#.#.#....####.###.##',
      '#.#...........#.#.##',
      '#.####....#####.#.##',
      '#.......#.....#...##',
      '######...#....#.####',
      '#.............#...##',
      '#.#.#....#...##.#.##',
      '#...#.....#.....#.##',
      '###.#....##.#.###.##',
      '#...#.......#.....##',
      '####################',
      '####################'
    ], {
    warps: [
      { x: 10, y: 17, to: 'mansion2f', tx: 9, ty: 17, dir: 'up' }
    ],
    signs: [
      { x: 15, y: 3, text: '"DIARY: SEPT 1. MEWTWO is far too strong. We have failed to curb its vicious tendencies."' },
      { x: 3, y: 1, text: 'The last page is not a diary entry. It is a single word, pressed hard enough to tear the paper: RUN.' }
    ],
    items: [
      { x: 11, y: 4, item: 'secretkey', flag: 'got_secretkey' },
      { x: 8, y: 1, item: 'rarecandy', flag: 'mn_candy' },
      { x: 1, y: 5, item: 'fullrestore', flag: 'mn_full' }
    ],
    trainers: [
      { x: 16, y: 7, sprite: 'burglar', dir: 'left', trainer: 'mn_kelly', sight: 3 }
    ],
    npcs: [
      { x: 5, y: 4, sprite: 'scientist', dir: 'down',
        dialog: ['I worked here. I was twenty-four and I thought we were doing biology.',
                 'It got out through the wall. Not a door. The wall.',
                 'They tell people the fire was an accident.'] }
    ]
  });

  // ================================================== ZAPDOS ================
  // The first legendary most players find, because the POWER PLANT is the one
  // that is merely far away rather than gated behind the endgame. Level 50,
  // one of it, and if you knock it out it does not come back.
  G.EVENTS.zapdosEncounter = function* () {
    yield { t: 'text', s: 'The hum in the walls is not the building.' };
    yield { t: 'sfx', id: 'confirm' };
    yield { t: 'wait', frames: 24 };
    yield { t: 'text', s: 'ZAPDOS is sitting in the switchgear. It has been here long enough that the whole plant has started to sound like it.' };
    yield { t: 'fn', fn: function () { G.flags.zapdos_seen = 1; } };
    yield {
      t: 'custom',
      run: function (done) {
        var wild = G.makeMon('zapdos', 50);
        G.player.dexSeen.zapdos = 1;
        G.startBattle(
          { party: G.player.party, foes: [wild], wild: true },
          { bg: 'indoor', music: 'gymleader', onEnd: function (res, b) {
              if (res === 'caught' || res === 'win') G.flags.zapdos_caught = 1;
              G.afterBattle(res, b);
              done();
            } }
        );
      }
    };
  };

  // ================================================== CINNABAR GYM — BLAINE =
  // Red/Blue built this gym as a quiz. Six shutters down one corridor, each
  // with a yes/no question about POKéMON printed on it; answer right and it
  // opens, answer wrong and the trainer standing behind it comes out.
  //
  // It is the only gym in the game that tests whether you have been PAYING
  // ATTENTION rather than whether you have been grinding, and it is the best
  // idea in Gen 1's level design. Keeping it was not optional.
  G.MAPS.cinnabargym = {
    id: 'cinnabargym', name: 'Cinnabar Gym', w: 12, h: 18,
    music: 'gym', battleBg: 'indoor', base: 'marble', indoors: true,
    gymTint: '#e05030',
    legend: { '.': 'marble', 'I': 'gymwall', 'Q': 'quizdoor' },
    ground: pad([
      'IIIIIIIIIIII',
      'I..........I',
      'I..........I',
      'IIIIIQQIIIII',
      'I..........I',
      'I..........I',
      'IIIIIQQIIIII',
      'I..........I',
      'I..........I',
      'IIIIIQQIIIII',
      'I..........I',
      'I..........I',
      'IIIIIQQIIIII',
      'I..........I',
      'I..........I',
      'IIIIIQQIIIII',
      'I..........I',
      'IIIII..IIIII'
    ], 12, 18),
    deco: blank(12, 18),
    warps: [
      { x: 5, y: 17, to: 'cinnabar', tx: 6, ty: 15, dir: 'down' },
      { x: 6, y: 17, to: 'cinnabar', tx: 7, ty: 15, dir: 'down' }
    ],
    trainers: [
      { x: 5, y: 1, sprite: 'blaine', dir: 'down', trainer: 'blaine', sight: 0 },
      { x: 2, y: 13, sprite: 'supernerd', dir: 'right', trainer: 'bg_erik', sight: 0 },
      { x: 9, y: 10, sprite: 'supernerd', dir: 'left', trainer: 'bg_derek', sight: 0 },
      { x: 2, y: 7, sprite: 'burglar', dir: 'right', trainer: 'bg_ramon', sight: 0 },
      { x: 9, y: 4, sprite: 'supernerd', dir: 'left', trainer: 'bg_avery', sight: 0 }
    ],
    npcs: [
      { x: 2, y: 16, sprite: 'gymguy', dir: 'right', event: 'cinnabarGymGuide' }
    ]
  };

  G.EVENTS.cinnabarGymGuide = function* () {
    if (G.flags.badge7) {
      yield { t: 'text', s: 'Guide: The VOLCANOBADGE. There is one gym left, and everybody already knows who runs it.' };
      return;
    }
    yield { t: 'text', s: 'Guide: BLAINE puts a quiz on every shutter. Get it right, it opens. Get it wrong, it opens anyway — but you fight whoever is behind it first.' };
    yield { t: 'text', s: 'Guide: So you cannot get stuck. You can only get tired.' };
    yield { t: 'text', s: 'Guide: WATER, ROCK or GROUND. And bring a BURN HEAL, because he will burn you.' };
  };

  // The quiz. Answers are Gen 1's own, including the mean one about DVs that
  // nobody in 1996 had the vocabulary for.
  var GYM_QUIZ = [
    { q: 'CATERPIE evolves into BUTTERFREE?', a: false,
      s: 'It evolves into METAPOD first. BUTTERFREE comes after.' },
    { q: 'There are nine certified POKéMON LEAGUE BADGEs?', a: false,
      s: 'There are eight. You are collecting them.' },
    { q: 'POLIWAG evolves three times?', a: true,
      s: 'POLIWAG, POLIWHIRL, POLIWRATH. Three stages, two evolutions.' },
    { q: 'ELECTRIC moves are effective against GROUND types?', a: false,
      s: 'They do nothing at all. Not resisted — nothing.' },
    { q: 'Two POKéMON of the same kind and level are always identical?', a: false,
      s: 'They are never identical. Every one is rolled differently the moment you meet it.' }
  ];

  // Who is behind each shutter, in the same order as GYM_QUIZ — that is, the
  // trainer standing in the corridor the shutter opens onto. The fifth is
  // BLAINE, who is not a quizmaster and fights you regardless, so it is null.
  // Exported so tools/check.js can confirm that every quizmaster standing in
  // that room is actually reachable by getting a question wrong. One left out
  // of this list is a trainer who can never fight you at all.
  var QUIZ_TRAINER = G.QUIZ_TRAINER = ['bg_erik', 'bg_derek', 'bg_ramon', 'bg_avery', null];

  // Quiz shutters are a TILE with an event, not an NPC — the door itself is
  // the thing you talk to, which is why walking up to it feels like being
  // asked a question rather than meeting a quizmaster.
  G.TILE_EVENTS = G.TILE_EVENTS || {};
  G.TILE_EVENTS.quizdoor = 'blaineQuiz';

  G.EVENTS.blaineQuiz = function* () {
    var w = G.world, p = w.player, d = G.DIRS[p.dir];
    var fx = p.x + d.dx, fy = p.y + d.dy;
    // Which shutter is this? Five of them, top to bottom, so the question is
    // stable for a given door rather than random each time.
    var idx = [15, 12, 9, 6, 3].indexOf(fy);
    if (idx < 0) idx = 0;
    var quiz = GYM_QUIZ[idx];
    yield { t: 'text', s: 'A shutter, with a question stencilled across it.' };
    yield { t: 'text', s: 'BLAINE: ' + quiz.q };
    var said = { v: null };
    yield {
      t: 'custom',
      run: function (done) {
        G.pushScene(G.Chooser({
          items: ['Yes', 'No'], cancelIndex: 1,
          onPick: function (i) { said.v = (i === 0); done(); }
        }));
      }
    };
    var right = (said.v === quiz.a);
    var open = function () {
      // Both shutter tiles on this row, so the corridor is actually passable.
      // The room is marble, not gym floor. Opening a shutter onto the wrong
      // tile leaves a visible seam down the middle of the corridor.
      G.setTileEdit(w.mapId, 5, fy, 'marble');
      G.setTileEdit(w.mapId, 6, fy, 'marble');
      w.refreshTiles();
    };
    if (right) {
      yield { t: 'text', s: 'Correct! ' + quiz.s };
      yield { t: 'sfx', id: 'confirm' };
      yield { t: 'fn', fn: open };
      yield { t: 'text', s: 'The shutter rolled up.' };
      return;
    }
    yield { t: 'text', s: 'Wrong. ' + quiz.s };
    yield { t: 'text', s: 'The shutter rolled up anyway — and somebody was standing behind it.' };
    yield { t: 'sfx', id: 'cancel' };
    yield { t: 'fn', fn: open };
    // ...and then they actually come out, which is the other half of the deal
    // and never happened. The quizmasters watched the corridor instead, so
    // they fought you whatever you answered and a right answer bought nothing.
    // The last shutter has BLAINE behind it rather than a quizmaster, so a
    // wrong answer there simply opens it — he is the fight either way.
    var behind = QUIZ_TRAINER[idx];
    if (behind && !G.flags[behind]) {
      var actor = null;
      for (var i = 0; i < w.npcs.length; i++) {
        if (w.npcs[i].def && w.npcs[i].def.trainer === behind) { actor = w.npcs[i]; break; }
      }
      if (actor) {
        yield { t: 'balloon', npc: actor };
        yield { t: 'text', s: G.TRAINERS[behind].name + ': ' + G.TRAINERS[behind].intro };
        yield {
          t: 'custom',
          run: function (done) { G.startTrainerBattle(behind, { onEnd: function () { done(); } }); }
        };
      }
    }
  };

  // ================================================== SEAFOAM ISLANDS =======
  // Two floors of ice over rock with the sea running straight through them.
  // ARTICUNO is at the bottom, and the only way down is to shift a boulder
  // with STRENGTH — so the WARDEN's teeth, found in a marsh on the far side of
  // the region, are what stands between you and a legendary bird.
  function seafoamFloor(id, name, rowsIn, opts) {
    G.MAPS[id] = {
      id: id, name: name, w: 20, h: opts.h,
      music: 'cave', battleBg: 'cave', base: 'icefloor', indoors: true,
      legend: G.LEG_CAVE,
      ground: pad(rowsIn, 20, opts.h),
      deco: blank(20, opts.h),
      encounters: (G.ENCOUNTERS || {})[id],
      warps: opts.warps,
      signs: opts.signs || [],
      npcs: opts.npcs || [],
      items: opts.items || []
    };
  }

  seafoamFloor('seafoam1f', 'Seafoam Islands 1F', [
      '####################',
      '#.#...............##',
      '#.###.#######.###.##',
      '#...#.........#.#.##',
      '###.....#.##....#.##',
      '#.........#.....#.##',
      '#.##...####.....#.##',
      '#.#.#.#.....#...#.##',
      '#........##.#.#.#.##',
      '#...........#.#.#.##',
      '#....#....#####.#.##',
      '#...#...#.#.....#.##',
      '###.#####.#.#.###.##',
      '#.........#.#.....##',
      '####################'
    ], {
    h: 15,
    warps: [
      { x: 6, y: 13, to: 'route20', tx: 14, ty: 4, dir: 'down' },
      { x: 17, y: 10, to: 'route20', tx: 15, ty: 4, dir: 'down' },
      { x: 11, y: 13, to: 'seafoamb1f', tx: 7, ty: 15, dir: 'down' }
    ],
    signs: [
      { x: 17, y: 5, text: 'The current runs south through the rock. Something heavy would stop it.' }
    ],
    items: [
      { x: 16, y: 1, item: 'ultraball', flag: 'sf_ultraball' }
    ]
  });

  seafoamFloor('seafoamb1f', 'Seafoam Islands B1F', [
      '####################',
      '#.#...#.........#.##',
      '#.#....###...##.#.##',
      '#...............#.##',
      '####....##....#.#.##',
      '#...#.#...#...#.#.##',
      '#.###.#.#.###.#.#.##',
      '#.#...#.#...#.#.#.##',
      '#.#.#######.....#.##',
      '#.#.#.............##',
      '#.#.#.#.####......##',
      '#...#...#.........##',
      '#.###.###.##......##',
      '#...#...#.....#...##',
      '###.###.#.###.#.####',
      '#.......#...#.....##',
      '####################'
    ], {
    h: 17,
    warps: [
      { x: 7, y: 14, to: 'seafoam1f', tx: 5, ty: 13, dir: 'up' }
    ],
    signs: [
      { x: 7, y: 1, text: 'It is colder down here than the sea outside has any right to make it.' }
    ],
    items: [
      { x: 1, y: 1, item: 'maxrevive', flag: 'sf_maxrevive' }
    ],
    npcs: [
      { x: 17, y: 1, sprite: 'articuno', obj: true, dir: 'down',
        unlessFlag: 'articuno_caught', event: 'articunoEncounter' }
    ]
  });

  G.EVENTS.articunoEncounter = function* () {
    yield { t: 'text', s: 'The chamber is silent, and the silence has a shape.' };
    yield { t: 'sfx', id: 'confirm' };
    yield { t: 'wait', frames: 24 };
    yield { t: 'text', s: 'ARTICUNO has been sitting in the cold long enough that the cold is coming from it.' };
    yield {
      t: 'custom',
      run: function (done) {
        var wild = G.makeMon('articuno', 50);
        G.player.dexSeen.articuno = 1;
        G.startBattle(
          { party: G.player.party, foes: [wild], wild: true },
          { bg: 'cave', music: 'gymleader', onEnd: function (res, b) {
              if (res === 'caught' || res === 'win') G.flags.articuno_caught = 1;
              G.afterBattle(res, b);
              done();
            } }
        );
      }
    };
  };

  // OAK's aide on ROUTE 2 with HM05. FLASH is the only HM you are handed for
  // filling in the POKéDEX rather than for having walked somewhere, which is
  // the one time the game rewards you for the thing it keeps telling you is
  // the point.
  G.EVENTS.oaksAideFlash = function* () {
    var caught = Object.keys(G.player.dexCaught || {}).length;
    if (G.flags.got_flash) {
      yield { t: 'text', s: 'AIDE: How is the DEX coming? ' + caught + ' so far.' };
      return;
    }
    yield { t: 'text', s: "AIDE: I work for PROF. OAK. He sent me out here to wait for whoever filled in ten entries first." };
    if (caught < 10) {
      yield { t: 'text', s: 'AIDE: You have caught ' + caught + '. Come back at ten and I have something for you.' };
      yield { t: 'text', s: 'AIDE: I have been sitting on this log for four months. I am not going anywhere.' };
      return;
    }
    yield { t: 'text', s: 'AIDE: Ten! Finally. Do you know how long I have been on this log?' };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'fn', fn: function () { G.player.bag.hm05 = 1; G.flags.got_flash = 1; } };
    yield { t: 'text', s: 'You received HM05 FLASH!' };
    yield { t: 'text', s: 'AIDE: There are caves in KANTO you cannot see your own feet in. ROCK TUNNEL is one. You will know the others when the screen goes dark.' };
  };

  // ========================================================== THE LEAGUE ====

  // The badge gates on ROUTE 23. Seven of them, and each one counts.
  G.EVENTS.badgeCheck = function* () {
    var have = (G.player.badges || []).filter(Boolean).length;
    // Which gate is this? The one you are standing below.
    var GATES = [29, 25, 21, 17, 13, 9, 5];
    var y = G.world.player.y;
    var need = 1;
    for (var i = 0; i < GATES.length; i++) if (Math.abs(GATES[i] - y) <= 2) need = i + 1;
    if (have >= need) {
      yield { t: 'text', s: 'The gate reads your BADGE CASE and lets you through without looking up.' };
      return;
    }
    yield { t: 'text', s: 'GATE ' + need + ': You need ' + need + ' BADGE' + (need > 1 ? 'S' : '') +
      ' to pass. You have ' + have + '.' };
    yield { t: 'text', s: 'Nothing else in KANTO checks your credentials. This road checks them seven times.' };
  };

  G.EVENTS.leagueWarning = function* () {
    if (G.flags.champion) {
      yield { t: 'text', s: 'Guide: Back again? The doors still only open one way. They do not care who you are now.' };
      return;
    }
    yield { t: 'text', s: 'Guide: Heal here. Buy here. Think here.' };
    yield { t: 'text', s: 'Guide: Past the carpet there is none of the three. Five rooms, five doors, and every one of them locks behind you.' };
    yield { t: 'text', s: 'Guide: No healing between. No saving. No leaving. Lose to any of them and you are back out here starting at LORELEI.' };
    yield { t: 'text', s: 'Guide: So do it now. Whatever you were going to do — do it now.' };
  };

  // The five chambers, in order. Beating one opens the door at the far end;
  // losing anywhere puts you back in the lobby with all four to do again.
  // ------------------------------------------------------- HALL OF FAME ----
  G.EVENTS.hallOfFameCeremony = function* () {
    yield { t: 'fn', fn: function () { G.audio.playMusic('title'); } };
    yield { t: 'text', s: 'The machine at the end of the hall wakes up as you step onto the carpet.' };
    yield { t: 'wait', frames: 30 };
    yield { t: 'text', s: 'It records your POKéMON, one at a time, and takes its time about each of them.' };
    yield {
      t: 'custom',
      run: function (done) {
        if (G.HallOfFameScene) G.pushScene(G.HallOfFameScene(done));
        else done();
      }
    };
    yield { t: 'fn', fn: function () {
      G.flags.champion = 1;
      G.player.champion = 1;
    } };
    yield { t: 'text', s: 'OAK: I have watched a lot of people walk through that door.' };
    yield { t: 'text', s: 'OAK: Most of them came here to prove something. You came here because you kept going, which is not the same thing and is worth considerably more.' };
    yield { t: 'text', s: 'OAK: Come home. There is something in the LAB I want to show you, and it will keep until you have slept.' };
    yield { t: 'wait', frames: 20 };
    yield {
      t: 'custom',
      run: function (done) {
        G.pushScene(G.FadeScene(function () {
          G.world.loadMap('playerhome', 4, 6, 'down');
          done();
        }));
      }
    };
    yield { t: 'text', s: 'You are home. Your bed has been made, which you definitely did not do.' };
    yield { t: 'text', s: 'MOM: There you are. It is on the television. It has been on the television all afternoon.' };
    yield { t: 'text', s: '(The HALL OF CHAMPIONS at INDIGO PLATEAU is open to you now. You can FLY there whenever you like.)' };
  };

  G.EVENTS.oakHallTalk = function* () {
    yield { t: 'text', s: 'OAK: Your names are on the wall. All six of them, in the order you sent them out.' };
    yield { t: 'text', s: 'OAK: They put mine up here once. It is two floors down and behind a pillar, and I have never once minded.' };
  };

  // -------------------------------------------------- HALL OF CHAMPIONS ----
  G.EVENTS.hallOfChampionsDoor = function* () {
    if (!G.flags.champion) return;
    yield { t: 'text', s: 'OAK: There is a hall behind this one. Five plinths, four names, and the fifth brass plate polished every week by somebody who will not say why.' };
    if (!G.flags.hoc_open) {
      yield { t: 'text', s: 'OAK: Every CHAMPION before you kept the title for a while, and every one of them found something out there that nobody has found since.' };
      yield { t: 'text', s: 'OAK: They are all still here. They all still train. They have been waiting for somebody to be worth the trouble.' };
      yield { t: 'fn', fn: function () { G.flags.hoc_open = 1; } };
    }
    yield { t: 'text', s: 'OAK: Go through whenever you are ready. There is no clock on this one.' };
    var go = { v: false };
    yield {
      t: 'custom',
      run: function (done) {
        G.pushScene(G.Chooser({
          items: ['Go through', 'Not yet'], cancelIndex: 1,
          onPick: function (i) { go.v = (i === 0); done(); }
        }));
      }
    };
    if (!go.v) return;
    yield {
      t: 'custom',
      run: function (done) {
        G.pushScene(G.FadeScene(function () {
          G.world.loadMap('hallofchampions', 9, 17, 'up');
          done();
        }));
      }
    };
  };

  // ------------------------------------------------------- THE RIVAL -------
  G.EVENTS.blueRoute22Final = function* () {
    yield { t: 'text', s: 'BLUE: Stop right there.' };
    yield { t: 'text', s: 'BLUE: Eight badges. You actually did it. I did not think you would — I want to be honest about that, because I have not been honest about much.' };
    yield { t: 'text', s: 'BLUE: This is the same field where I told you to forget it. Day one. You remember.' };
    yield { t: 'text', s: 'BLUE: So we do it here, and then whoever is left walks up that road.' };
    yield { t: 'fn', fn: function () { G.flags.blue_route22b = 1; } };
    yield {
      t: 'custom',
      run: function (done) { G.startTrainerBattle('blue_route22b', { onEnd: function () { done(); } }); }
    };
  };

  // ------------------------------------------------------- LEGENDARIES -----
  // Three birds, one cat, and a thing under a lorry. Every one of them is a
  // fixed encounter you walk up to rather than a roll of the dice — a
  // legendary you can SEE from across the room is worth more than any amount
  // of text telling you it is rare.
  // A fixed legendary encounter. Not a roll of the dice — you walk up to it,
  // it is standing there, and the battle starts because you chose to start it.
  // Whether you catch it or knock it out, it is gone from the map afterwards:
  // there is one of each in KANTO and the game does not offer second chances.
  function legendary(key, level, before, bg) {
    return function* () {
      for (var i = 0; i < before.length; i++) yield { t: 'text', s: before[i] };
      yield { t: 'sfx', id: 'confirm' };
      yield { t: 'wait', frames: 24 };
      yield {
        t: 'custom',
        run: function (done) {
          var wild = G.makeMon(key, level);
          G.player.dexSeen[key] = 1;
          G.startBattle(
            { party: G.player.party, foes: [wild], wild: true },
            { bg: bg || 'cave', music: 'gymleader', onEnd: function (res, b) {
                if (res === 'caught' || res === 'win') G.flags[key + '_caught'] = 1;
                G.afterBattle(res, b);
                done();
              } }
          );
        }
      };
    };
  }

  // Declared for the flag audit in tools/check.js. The factory above writes
  // G.flags[key + '_caught'], which no static reader can follow — so rather
  // than weaken the audit (its whole value is that it catches gates nothing
  // opens), the computed names are listed here where a reader can see them.
  G.DYNAMIC_FLAGS = (G.DYNAMIC_FLAGS || []).concat([
    'articuno_caught', 'zapdos_caught', 'moltres_caught', 'mewtwo_caught', 'mew_caught'
  ]);

  G.EVENTS.moltresEncounter = legendary('moltres', 50, [
    'The air in this part of VICTORY ROAD is twenty degrees warmer than the rest of it.',
    'MOLTRES has been roosting at the top of the LEAGUE road for years. Every challenger walks past it. Almost nobody looks up.'
  ], 'cave');

  G.EVENTS.mewtwoEncounter = legendary('mewtwo', 70, [
    'The cave goes quiet in a way that caves do not.',
    'MEWTWO is sitting in the middle of the chamber with its back to you, and it has known you were coming since CERULEAN.',
    'It does not look round.'
  ], 'cave');

  // MEW, under the lorry by the VERMILION dock. This is the oldest rumour in
  // the game and it was never true — so here it is, made true, and it costs
  // exactly what the playground said it would: STRENGTH, and the patience to
  // try something stupid.
  G.EVENTS.mewTruck = function* () {
    if (G.flags.mew_caught) {
      yield { t: 'text', s: 'A lorry, parked by the dock. There is a dent in the tarmac underneath it, and nothing else.' };
      return;
    }
    if (!G.flags.strengthOn) {
      yield { t: 'text', s: 'A lorry, parked by the dock. It has been here as long as anyone can remember and nobody knows whose it is.' };
      yield { t: 'text', s: 'It is far too heavy to move.' };
      return;
    }
    yield { t: 'text', s: 'A lorry, parked by the dock. Nobody knows whose it is.' };
    yield { t: 'text', s: 'You put your shoulder against it, which is a ridiculous thing to do, and your POKéMON does the rest.' };
    yield { t: 'sfx', id: 'confirm' };
    yield { t: 'wait', frames: 30 };
    yield { t: 'text', s: 'The lorry rolls back four feet.' };
    yield { t: 'wait', frames: 20 };
    yield { t: 'text', s: 'There is something asleep underneath it.' };
    yield {
      t: 'custom',
      run: function (done) {
        var wild = G.makeMon('mew', 30);
        G.player.dexSeen.mew = 1;
        G.startBattle(
          { party: G.player.party, foes: [wild], wild: true },
          { bg: 'meadow', music: 'gymleader', onEnd: function (res, b) {
              if (res === 'caught' || res === 'win') G.flags.mew_caught = 1;
              G.afterBattle(res, b);
              done();
            } }
        );
      }
    };
  };

  // The clock runs out. You are escorted to the gate with whatever you caught,
  // and the SAFARI BALLs are taken back — which is the whole reason the step
  // limit is a puzzle rather than a nuisance: you cannot bank progress inside.
  G.EVENTS.safariTimeUp = function* () {
    yield { t: 'text', s: 'A tannoy, somewhere in the trees: "Time is up! Please return to the gate."' };
    yield { t: 'text', s: 'A warden appears at your elbow with the unhurried certainty of someone who has done this ten thousand times.' };
    yield { t: 'fn', fn: function () {
      G.flags.safari_active = 0;
      G.player.safariSteps = 0;
      delete G.player.bag.safariball;
    } };
    yield {
      t: 'custom',
      run: function (done) {
        G.pushScene(G.FadeScene(function () {
          G.world.loadMap('safarigate', 5, 5, 'down');
          done();
        }));
      }
    };
    yield { t: 'text', s: 'ATTENDANT: How did you get on? Come back any time — it is ₽500 and we reset the counter.' };
  };

  // The CERULEAN bike shop. A bicycle costs a million pounds and the voucher
  // is worth exactly a million pounds, which is a joke the original played
  // completely straight and is funnier for it.
  G.EVENTS.bikeShop = function* () {
    if (G.player.bag.bicycle) {
      yield { t: 'text', s: 'CLERK: How is the BICYCLE? Fastest thing in KANTO that is not a POKéMON.' };
      return;
    }
    if (!G.player.bag.bikevoucher) {
      yield { t: 'text', s: 'CLERK: Welcome to the CERULEAN BIKE SHOP!' };
      yield { t: 'text', s: 'CLERK: That one is ₽1,000,000.' };
      yield { t: 'text', s: '...You read it twice. It still says ₽1,000,000.' };
      yield { t: 'text', s: 'CLERK: We do accept BIKE VOUCHERS. The POKéMON FAN CLUB in VERMILION hands them out.' };
      return;
    }
    yield { t: 'text', s: 'CLERK: A BIKE VOUCHER! Yes, of course. Any one you like.' };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'fn', fn: function () {
      delete G.player.bag.bikevoucher;
      G.player.bag.bicycle = 1;
      G.flags.got_bicycle = 1;
    } };
    yield { t: 'text', s: 'You received the BICYCLE!' };
    yield { t: 'text', s: 'CLERK: CYCLING ROAD, west of CELADON. That is what people buy these for. Downhill the whole way and you cannot stop.' };
  };

  G.MAPS.bikeshop = {
    id: 'bikeshop', name: 'Cerulean Bike Shop', w: 10, h: 9,
    music: 'center', battleBg: 'indoor', base: 'ifloor', indoors: true,
    legend: G.LEG_INT,
    ground: pad([
      'IIIIIIIIII',
      'I.CCCCCC.I',
      'I........I',
      'I........I',
      'I..T..T..I',
      'I..o..o..I',
      'I........I',
      'IIII..IIII',
      '..........'
    ], 10, 9),
    deco: blank(10, 9),
    warps: [
      { x: 4, y: 7, to: 'cerulean', tx: 18, ty: 23, dir: 'down' },
      { x: 5, y: 7, to: 'cerulean', tx: 18, ty: 23, dir: 'down' }
    ],
    npcs: [
      { x: 4, y: 2, sprite: 'clerk', dir: 'down', event: 'bikeShop' }
    ],
    signs: [
      { x: 7, y: 1, text: 'A price tag: ₽1,000,000. There is no decimal point and no mistake.' }
    ]
  };

  // ========================================================= IN-GAME TRADES =
  // Gen 1's trades are the only way to get four species, and they are all the
  // same joke: somebody wants a POKéMON you can catch in the first hour, and
  // will hand you one you cannot catch at all. The traded creature also grows
  // faster, which nobody ever explained.
  //
  // The trade is irreversible and it takes the POKéMON out of your party, so
  // the confirmation names both sides plainly.
  function tradeEvent(id, wantKey, giveKey, name, lines) {
    return function* () {
      if (G.flags['trade_' + id]) {
        yield { t: 'text', s: lines.after };
        return;
      }
      yield { t: 'text', s: lines.intro };
      var idx = -1;
      for (var i = 0; i < G.player.party.length; i++) {
        if (G.player.party[i].sp === wantKey) { idx = i; break; }
      }
      if (idx === -1) {
        yield { t: 'text', s: lines.want };
        return;
      }
      yield { t: 'text', s: 'Trade your ' + G.SPECIES[wantKey].name.toUpperCase() +
        ' for ' + name + ' the ' + G.SPECIES[giveKey].name.toUpperCase() + '?' };
      var yes = { v: false };
      yield {
        t: 'custom',
        run: function (done) {
          G.pushScene(G.Chooser({
            items: ['Yes', 'No'], cancelIndex: 1,
            onPick: function (i) { yes.v = (i === 0); done(); }
          }));
        }
      };
      if (!yes.v) { yield { t: 'text', s: lines.refuse }; return; }
      yield {
        t: 'fn',
        fn: function () {
          var lvl = G.player.party[idx].level;
          var got = G.makeMon(giveKey, lvl);
          got.nickname = name;
          got.traded = true;              // traded POKéMON gain exp faster
          G.player.party[idx] = got;
          G.player.dexSeen[giveKey] = 1;
          G.player.dexCaught[giveKey] = 1;
          G.flags['trade_' + id] = 1;
        }
      };
      yield { t: 'sfx', id: 'heal' };
      yield { t: 'text', s: 'You traded your ' + G.SPECIES[wantKey].name.toUpperCase() +
        ' for ' + name + '!' };
      yield { t: 'text', s: lines.after };
    };
  }

  G.EVENTS.tradeMrMime = tradeEvent('mrmime', 'abra', 'mrmime', 'MARCEL', {
    intro: 'TRADER: I have a MR. MIME. Nobody in KANTO has a MR. MIME.',
    want: 'TRADER: I want an ABRA for it. They are all over ROUTE 24, if you can catch one before it teleports.',
    refuse: 'TRADER: Think about it. I am not going anywhere.',
    after: 'TRADER: MARCEL is happier with you. I can tell. That is not a nice thing to learn about yourself.'
  });
  G.EVENTS.tradeFarfetchd = tradeEvent('farfetchd', 'spearow', 'farfetchd', 'DUX', {
    intro: 'TRADER: Do you have a SPEAROW? I want a SPEAROW.',
    want: 'TRADER: Any SPEAROW. ROUTE 3 is full of them and they are all furious.',
    refuse: 'TRADER: Suit yourself.',
    after: "TRADER: DUX carries that stick everywhere. Do not try to take it."
  });
  G.EVENTS.tradeJynx = tradeEvent('jynx', 'poliwhirl', 'jynx', 'LOLA', {
    intro: 'TRADER: I will trade you a JYNX. She is the only one I have ever seen.',
    want: 'TRADER: I want a POLIWHIRL. Fish one up and evolve it — that is the usual way.',
    refuse: 'TRADER: The offer stands.',
    after: 'TRADER: LOLA hums constantly. I miss it, honestly.'
  });
  G.EVENTS.tradeLickitung = tradeEvent('lickitung', 'slowbro', 'lickitung', 'MARC', {
    intro: 'TRADER: Ever seen a LICKITUNG? Most people have not.',
    want: 'TRADER: Bring me a SLOWBRO and it is yours.',
    refuse: 'TRADER: No rush.',
    after: 'TRADER: Keep MARC away from anything you care about. Everything gets licked.'
  });

  // ================================================================ GIFTS ===
  // EEVEE, in the block of flats behind the CELADON store. Three stones, three
  // futures, and the game never tells you that choosing is permanent.
  G.EVENTS.eeveeGift = function* () {
    // One EEVEE is three POKéMON you cannot all have. After the League the
    // note is answered: whoever left it clearly kept breeding them.
    if (G.flags.got_eevee && !G.flags.champion) {
      yield { t: 'text', s: 'The empty ball is still on the table. Nobody has moved it.' };
      return;
    }
    if (G.flags.got_eevee) {
      yield { t: 'text', s: 'There is another ball on the table, and the same handwriting on the note.' };
      yield { t: 'text', s: '"You again. Good. This one deserves somebody who can decide, too."' };
    }
    yield { t: 'text', s: 'There is a POKé BALL on the table and a note taped to it.' };
    yield { t: 'text', s: '"Whoever finds this: it is an EEVEE. I could not decide what to make it, and it deserves somebody who can."' };
    yield { t: 'sfx', id: 'heal' };
    yield {
      t: 'fn',
      fn: function () {
        var mon = G.makeMon('eevee', 25);
        if (G.player.party.length < 6) G.player.party.push(mon);
        else G.player.box.push(mon);
        G.player.dexSeen.eevee = 1;
        G.player.dexCaught.eevee = 1;
        G.flags.got_eevee = 1;
      }
    };
    yield { t: 'text', s: 'You received an EEVEE!' };
    yield { t: 'text', s: 'A FIRE, WATER or THUNDER STONE will settle it. So will never using one.' };
  };

  // LAPRAS, from a Silph employee who was keeping it in a stairwell.
  G.EVENTS.laprasGift = function* () {
    if (G.flags.got_lapras) {
      yield { t: 'text', s: 'EMPLOYEE: Is it eating? It never ate here.' };
      return;
    }
    if (!G.flags.silph_giovanni) {
      yield { t: 'text', s: 'EMPLOYEE: Not now. Not while they are still in the building.' };
      return;
    }
    yield { t: 'text', s: 'EMPLOYEE: You got them out. Thank you. Genuinely, thank you.' };
    yield { t: 'text', s: 'EMPLOYEE: We have had this in a stairwell for four months because nobody could get it down to the sea.' };
    yield { t: 'sfx', id: 'heal' };
    yield {
      t: 'fn',
      fn: function () {
        var mon = G.makeMon('lapras', 15);
        if (G.player.party.length < 6) G.player.party.push(mon);
        else G.player.box.push(mon);
        G.player.dexSeen.lapras = 1;
        G.player.dexCaught.lapras = 1;
        G.flags.got_lapras = 1;
      }
    };
    yield { t: 'text', s: 'You received a LAPRAS!' };
    yield { t: 'text', s: 'EMPLOYEE: Take it out on the water. It has been waiting.' };
  };

  // The slots themselves. You cannot play without a COIN CASE, which is the
  // one thing the Game Corner will not sell you.
  G.EVENTS.playSlots = function* () {
    if (!G.player.bag.coincase) {
      yield { t: 'text', s: 'A slot machine, humming to itself.' };
      yield { t: 'text', s: 'You have nowhere to put any coins even if you won some. Somebody in CELADON must hand out COIN CASES.' };
      return;
    }
    yield { t: 'custom', run: function (done) { G.pushScene(G.SlotScene()); done(); } };
  };

  // The COIN CASE, from the man in the Celadon block of flats who has clearly
  // given up on it.
  G.EVENTS.coinCaseGift = function* () {
    if (G.player.bag.coincase) {
      yield { t: 'text', s: 'MAN: Keep it. I am not going back in there.' };
      return;
    }
    yield { t: 'text', s: 'MAN: Do you want my COIN CASE? I am serious. Take it.' };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'fn', fn: function () { G.player.bag.coincase = 1; G.player.coins = G.player.coins || 0; } };
    yield { t: 'text', s: 'You received the COIN CASE!' };
    yield { t: 'text', s: 'MAN: I worked out what the GAME CORNER is for about a year too late. It is not for winning.' };
  };

  // The coin counter. Coins had no source at all: PAY DAY tallied them and
  // never handed them over, the machines want three to spin, and you start
  // with none — so the COIN CASE, the slots and every prize behind them were
  // unreachable, and the only thing the game told you was "see the counter".
  // Gen 1's prices, unchanged: 50 for 1000, 500 for 10000.
  G.EVENTS.coinCounter = function* () {
    var DEALS = [
      { coins: 50,  cost: 1000,  label: '50 coins — $1000' },
      { coins: 500, cost: 10000, label: '500 coins — $10000' }
    ];
    if (!G.player.bag.coincase) {
      yield { t: 'text', s: 'ATTENDANT: I can sell you coins, but you have nowhere to put them.' };
      yield { t: 'text', s: 'ATTENDANT: They hand out COIN CASES somewhere in the flats round the corner.' };
      return;
    }
    yield { t: 'text', s: 'ATTENDANT: Coins for cash. You have ' + (G.player.coins || 0)
                          + ' coins and $' + G.player.money + '.' };
    var pick = { v: -1 };
    var items = DEALS.map(function (d) { return d.label; }).concat(['Nothing']);
    yield {
      t: 'custom',
      run: function (done) {
        G.pushScene(G.Chooser({
          items: items, cols: 1, cancelIndex: items.length - 1,
          onPick: function (i) { pick.v = i; done(); }
        }));
      }
    };
    if (pick.v < 0 || pick.v >= DEALS.length) { yield { t: 'text', s: 'ATTENDANT: Suit yourself.' }; return; }
    var deal = DEALS[pick.v];
    if (G.player.money < deal.cost) {
      yield { t: 'text', s: 'ATTENDANT: That is $' + deal.cost + '. You do not have it.' };
      return;
    }
    yield {
      t: 'fn',
      fn: function () {
        G.player.money -= deal.cost;
        G.player.coins = (G.player.coins || 0) + deal.coins;
      }
    };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'text', s: 'You bought ' + deal.coins + ' coins. You have ' + G.player.coins + ' now.' };
    yield { t: 'text', s: 'ATTENDANT: The machines are straight ahead. Good luck. You will need it.' };
  };

  // The prize counter. Two POKéMON nobody can catch, and the TMs that make
  // half the roster worth using.
  G.EVENTS.prizeCounter = function* () {
    var PRIZES = [
      { id: 'abra',      cost: 180,  kind: 'mon', label: 'ABRA — 180' },
      { id: 'dratini',   cost: 2800, kind: 'mon', label: 'DRATINI — 2800' },
      { id: 'porygon',   cost: 6500, kind: 'mon', label: 'PORYGON — 6500' },
      { id: 'tm23',      cost: 3300, kind: 'item', label: 'TM23 DRAGON RAGE — 3300' },
      { id: 'tm15',      cost: 5500, kind: 'item', label: 'TM15 HYPER BEAM — 5500' },
      { id: 'tm50',      cost: 7700, kind: 'item', label: 'TM50 SUBSTITUTE — 7700' }
    ];
    if (!G.player.bag.coincase) {
      yield { t: 'text', s: 'CLERK: Prizes are exchanged for COINS. You do not appear to have anywhere to keep any.' };
      return;
    }
    yield { t: 'text', s: 'CLERK: Welcome! You have ' + (G.player.coins || 0) + ' coins. What can I get you?' };
    var pick = { v: -1 };
    var items = PRIZES.map(function (p) { return p.label; }).concat(['Nothing']);
    yield {
      t: 'custom',
      run: function (done) {
        G.pushScene(G.Chooser({
          items: items, cols: 1, cancelIndex: items.length - 1,
          onPick: function (i) { pick.v = i; done(); }
        }));
      }
    };
    if (pick.v < 0 || pick.v >= PRIZES.length) { yield { t: 'text', s: 'CLERK: Do come back.' }; return; }
    var prize = PRIZES[pick.v];
    if ((G.player.coins || 0) < prize.cost) {
      yield { t: 'text', s: 'CLERK: You need ' + prize.cost + ' coins for that. Machines are through there.' };
      return;
    }
    yield {
      t: 'fn',
      fn: function () {
        G.player.coins -= prize.cost;
        if (prize.kind === 'mon') {
          var mon = G.makeMon(prize.id, prize.id === 'porygon' ? 26 : prize.id === 'dratini' ? 18 : 9);
          if (G.player.party.length < 6) G.player.party.push(mon);
          else G.player.box.push(mon);
          G.player.dexSeen[prize.id] = 1;
          G.player.dexCaught[prize.id] = 1;
        } else {
          G.player.bag[prize.id] = (G.player.bag[prize.id] || 0) + 1;
        }
      }
    };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'text', s: 'You received ' + prize.label.split(' —')[0] + '!' };
  };

  // OLD AMBER. Gen 1 keeps AERODACTYL behind a museum exhibit nobody thinks to
  // ask about, which is why most players never saw one.
  G.EVENTS.oldAmberGift = function* () {
    if (G.flags.got_oldamber) {
      yield { t: 'text', s: 'CURATOR: The case is empty now. It looks worse empty, honestly.' };
      return;
    }
    yield { t: 'text', s: 'CURATOR: That lump in the case? Amber. There is an insect in it, and something else besides.' };
    yield { t: 'text', s: 'CURATOR: We have had it forty years and never once been able to do anything with it.' };
    yield { t: 'text', s: 'CURATOR: The LAB on CINNABAR can, apparently. Take it. Genuinely — take it.' };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'fn', fn: function () { G.player.bag.oldamber = 1; G.flags.got_oldamber = 1; } };
    yield { t: 'text', s: 'You received the OLD AMBER!' };
  };

  // ================================================ CELADON DEPT. STORE =====
  // Six floors, and the only shop in KANTO that sells anything you cannot buy
  // in a town Mart. This is where the evolution stones live, and where the four
  // TMs Red/Blue actually put on a shelf are sold — which makes it the one
  // building a player crosses the region to reach for reasons other than a
  // badge.
  //
  // Each floor is the same room with a different counter, because a department
  // store IS that: you are not exploring, you are looking for the right floor.
  // The lift is the stairwell at the west end and it goes both ways.
  // The south wall of the ground floor needs its front doors cut into it.
  // Every upper floor stays sealed on purpose — you leave a department store
  // by the lift you came up in. 1F was sealed too, and that made the whole
  // shop a one-way trap: both doors existed in the warp table and neither
  // existed in the wall, so there was no tile you could stand on to use them.
  function doorRow(doors) {
    var row = 'IIIIIIIIIIIIII'.split('');
    (doors || []).forEach(function (x) { row[x] = '.'; });
    return row.join('');
  }

  function storeFloor(n, name, inventory, opts) {
    opts = opts || {};
    var id = 'celadonstore' + n;
    G.MAPS[id] = {
      id: id, name: 'Celadon Dept. ' + n + 'F — ' + name, w: 14, h: 11,
      music: 'center', battleBg: 'indoor', base: 'ifloor', indoors: true,
      legend: G.LEG_INT,
      ground: pad([
        'IIIIIIIIIIIIII',
        'I>...........I',
        'I............I',
        'I..CCCCCCCC..I',
        'I............I',
        'I............I',
        'I.B.B.B.B.B..I',
        'I............I',
        'I............I',
        'I............I',
        doorRow(opts.doors)
      ], 14, 11),
      deco: blank(14, 11),
      shopInventory: inventory,
      warps: opts.warps,
      npcs: (inventory && inventory.length
        ? [{ x: 5, y: 2, sprite: 'clerk', dir: 'down', event: 'shopBuy' }]
        : []).concat(opts.npcs || []),
      signs: opts.signs || []
    };
  }

  // 1F is the lobby: no counter, just the directory and the way back out.
  storeFloor(1, 'Reception', null, {
    doors: [6, 7],
    warps: [
      { x: 6, y: 10, to: 'celadon', tx: 6, ty: 6, dir: 'down' },
      { x: 7, y: 10, to: 'celadon', tx: 7, ty: 6, dir: 'down' },
      { x: 1, y: 1, to: 'celadonstore2', tx: 1, ty: 1, dir: 'up' }
    ],
    signs: [
      { x: 8, y: 3, text: 'DIRECTORY — 2F: Trainer Market. 3F: Household. 4F: Wiseman Gifts. 5F: Drugstore. 6F: Rooftop Square.' }
    ],
    npcs: [
      { x: 9, y: 5, sprite: 'clerk', dir: 'left',
        dialog: ['Welcome to CELADON DEPARTMENT STORE.',
                 'The lift is at the end. It only goes up one floor at a time, which everyone complains about.'] }
    ]
  });

  storeFloor(2, 'Trainer Market',
    ['expshare', 'expall', 'greatball', 'superpotion', 'revive', 'superrepel', 'escaperope'], {
    warps: [
      { x: 1, y: 1, to: 'celadonstore1', tx: 1, ty: 1, dir: 'down' },
      { x: 1, y: 2, to: 'celadonstore3', tx: 1, ty: 1, dir: 'up' }
    ],
    signs: [{ x: 8, y: 3, text: '2F — TRAINER MARKET. Everything a challenger needs and nothing they want.' }],
    // An item nobody understands is an item nobody buys, and this one changes
    // how the whole game feels — so somebody stands next to it and says so in
    // plain words before you have spent anything.
    npcs: [
      { x: 8, y: 5, sprite: 'gentleman', dir: 'left',
        dialog: ['Both of those on the counter do the same job by different amounts.',
                 'EXP SHARE: the POKéMON that fought keeps half, and your other five split what is left.',
                 'EXP ALL: everybody takes an equal share, the fighter included.',
                 'The EXP itself does not change. You are choosing who gets it, not how much there is.',
                 'One evens a team out. The other evens it out faster, and costs your best POKéMON more to do it.'] }
    ]
  });

  storeFloor(3, 'Household',
    ['tm09', 'tm10', 'tm11', 'tm22'], {
    warps: [
      { x: 1, y: 1, to: 'celadonstore2', tx: 1, ty: 2, dir: 'down' },
      { x: 1, y: 2, to: 'celadonstore4', tx: 1, ty: 1, dir: 'up' }
    ],
    signs: [{ x: 8, y: 3, text: '3F — TECHNICAL MACHINES. Single use. Read the label twice.' }],
    npcs: [
      { x: 10, y: 7, sprite: 'youngster', dir: 'left',
        dialog: ['A TM is gone once you use it. Gone.',
                 'I taught DIG to a MAGIKARP to see what would happen. Nothing happened. It cost me four thousand.'] }
    ]
  });

  storeFloor(4, 'Wiseman Gifts',
    ['firestone', 'waterstone', 'thunderstone', 'leafstone', 'moonstone'], {
    warps: [
      { x: 1, y: 1, to: 'celadonstore3', tx: 1, ty: 2, dir: 'down' },
      { x: 1, y: 2, to: 'celadonstore5', tx: 1, ty: 1, dir: 'up' }
    ],
    signs: [{ x: 8, y: 3, text: '4F — EVOLUTION STONES. MOON STONES held behind the counter. All sales final. All evolutions final.' }],
    npcs: [
      { x: 10, y: 7, sprite: 'oldwoman', dir: 'left',
        dialog: ['An EEVEE will become one of three things depending on which of these you hand it.',
                 'It will never become the other two. People do not think about that enough before they buy.'] }
    ]
  });

  storeFloor(5, 'Drugstore',
    ['hyperpotion', 'fullheal', 'antidote', 'parlyzheal', 'burnheal', 'iceheal', 'awakening'], {
    warps: [
      { x: 1, y: 1, to: 'celadonstore4', tx: 1, ty: 2, dir: 'down' },
      { x: 1, y: 2, to: 'celadonstore6', tx: 1, ty: 1, dir: 'up' }
    ],
    signs: [{ x: 8, y: 3, text: '5F — DRUGSTORE. Status cures, by the shelf-load.' }]
  });

  // 6F is the rooftop. In Red/Blue it is two vending machines and a child who
  // will trade you drinks for the SAFARI ZONE's most valuable gift — which is
  // the single strangest economy in the game and is kept exactly as it was.
  storeFloor(6, 'Rooftop Square',
    ['freshwater', 'sodapop', 'lemonade'], {
    warps: [
      { x: 1, y: 1, to: 'celadonstore5', tx: 1, ty: 2, dir: 'down' }
    ],
    signs: [{ x: 8, y: 3, text: '6F — ROOFTOP SQUARE. Vending machines. Mind the edge.' }],
    npcs: [
      { x: 10, y: 7, sprite: 'littlegirl', dir: 'left', event: 'rooftopDrinks' }
    ]
  });

  // The rooftop child. Three drinks, three TMs, and she will not explain the
  // exchange rate.
  G.EVENTS.rooftopDrinks = function* () {
    var SWAPS = [
      { drink: 'freshwater', tm: 'tm13', flag: 'roof_water' },
      { drink: 'sodapop',    tm: 'tm48', flag: 'roof_soda' },
      { drink: 'lemonade',   tm: 'tm49', flag: 'roof_lemon' }
    ];
    var can = SWAPS.filter(function (s) { return G.player.bag[s.drink] && !G.flags[s.flag]; });
    if (!can.length) {
      var left = SWAPS.filter(function (s) { return !G.flags[s.flag]; });
      if (!left.length) {
        yield { t: 'text', s: 'GIRL: That is all of them. Thank you! I was so thirsty.' };
        return;
      }
      yield { t: 'text', s: 'GIRL: I am thirsty. The machines are right there.' };
      yield { t: 'text', s: 'GIRL: Bring me a drink and I will give you something. I have three somethings.' };
      return;
    }
    var s0 = can[0];
    yield { t: 'text', s: 'GIRL: Ooh, is that a ' + G.ITEMS[s0.drink].name.toUpperCase() + '? Can I have it?' };
    yield { t: 'sfx', id: 'heal' };
    yield {
      t: 'fn',
      fn: function () {
        G.player.bag[s0.drink]--;
        if (!G.player.bag[s0.drink]) delete G.player.bag[s0.drink];
        G.player.bag[s0.tm] = (G.player.bag[s0.tm] || 0) + 1;
        G.flags[s0.flag] = 1;
      }
    };
    yield { t: 'text', s: 'You gave away the ' + G.ITEMS[s0.drink].name.toUpperCase() +
      ' and received ' + s0.tm.toUpperCase() + '!' };
    yield { t: 'text', s: 'GIRL: My dad works downstairs. Do not tell him where I got these.' };
  };

  // ============================================================ TM DROPS ====
  // The rest of the fifty. Gen 1 puts a TM in three places — on the floor of
  // somewhere you had to work to reach, in the hand of a gym leader, and behind
  // a shop counter — and all three are used. The leaders' TMs hang off their
  // trainer reward; the shop's are on the third floor in CELADON; these are the
  // floor drops.
  //
  // Every coordinate here was COMPUTED rather than typed: the deepest reachable
  // tile of each map that is not already occupied by a warp, a sign or a
  // person. A TM behind a wall is the same bug as a staircase behind a wall,
  // and this project has shipped that once already.
  [
    ['viridianforest', 21, 2, 'tm35'],
    ['mtmoonb1f', 19, 16, 'tm01'],
    ['ssanne', 21, 1, 'tm08'],
    ['rocktunnel1f', 7, 9, 'tm12'],
    ['pokemontower1f', 1, 3, 'tm42'],
    ['undergroundpath', 4, 11, 'tm18'],
    ['undergroundpath2', 12, 2, 'tm31'],
    ['silphco2f', 19, 5, 'tm36'],
    ['silphco3f', 19, 2, 'tm09'],
    ['rockethideout1', 18, 4, 'tm07'],
    ['diglettscave', 5, 12, 'tm28'],
    ['mansion2f', 16, 1, 'tm38'],
    ['mansionb1f', 17, 1, 'tm22'],
    ['powerplant', 9, 2, 'tm45'],
    ['seafoam1f', 17, 11, 'tm37'],
    ['seafoamb1f', 8, 1, 'tm44'],
    ['victoryroad1f', 1, 1, 'tm17'],
    ['victoryroad2f', 15, 2, 'tm43'],
    ['victoryroad3f', 1, 2, 'tm26'],
    ['ceruleancave1f', 17, 2, 'tm29'],
    ['ceruleancave2f', 15, 1, 'tm41'],
    ['safarizonewest', 2, 18, 'tm32'],
    ['safarizoneeast', 23, 18, 'tm40'],
    ['safarizonenorth', 2, 2, 'tm03'],
    ['safarizonecenter', 8, 7, 'tm30'],
    ['fightingdojo', 1, 1, 'tm19'],
    ['route12', 17, 14, 'tm39'],
    ['route13', 27, 11, 'tm20'],
    ['route15', 16, 2, 'tm02'],
    ['route17', 17, 17, 'tm04'],
    ['route25', 13, 2, 'tm16'],
    ['cinnabarlab', 7, 1, 'tm33']
  ].forEach(function (e) {
    var m = G.MAPS[e[0]];
    if (!m) return;
    (m.items = m.items || []).push({ x: e[1], y: e[2], item: e[3], flag: 'found_' + e[3] });
  });


  // ======================================== TRAINERS ON THE QUIET ROADS ====
  // Positions are COMPUTED. A trainer is a SOLID tile, so dropping one into a
  // one-wide cave corridor seals the route behind it — the first attempt at
  // this put a cooltrainer across the only path through VICTORY ROAD 3F and
  // made the League unreachable, which the progression audit caught on the
  // very next run. Placement is therefore restricted to tiles with three or
  // more open neighbours: a junction or open ground, never a corridor.
  [
    ['route23', 6, 26, 'r23_naoko', 'cooltrainerf'],
    ['route23', 7, 2, 'r23_fidel', 'cooltrainerm'],
    ['route23', 12, 2, 'r23_yuji', 'cooltrainerm'],
    ['route23', 13, 22, 'r23_warren', 'birdkeeper'],
    ['route23', 6, 18, 'r23_mary', 'cooltrainerf'],
    ['route10', 8, 2, 'r10_nob', 'hiker'],
    ['route10', 13, 2, 'r10_dana', 'picnicker'],
    ['victoryroad3f', 7, 15, 'vr_edgar', 'cooltrainerm'],
    ['victoryroad3f', 3, 17, 'vr_tanya', 'cooltrainerf'],
    ['mansionb1f', 6, 17, 'mn_stella', 'scientist']
  ].forEach(function (e) {
    var m = G.MAPS[e[0]];
    if (!m) return;
    (m.trainers = m.trainers || []).push({
      x: e[1], y: e[2], sprite: e[4], dir: 'down', trainer: e[3], sight: 3
    });
  });

  // RUNNING SHOES. Handed over by Mum on the way out of the door, and again by
  // OAK with the POKéDEX if you somehow left without talking to her — a
  // quality-of-life control should never be permanently missable.
  G.giveRunningShoes = function* (who) {
    if (G.player.bag.runningshoes) return;
    yield { t: 'text', s: who + ': Wait — take these.' };
    yield { t: 'sfx', id: 'heal' };
    yield { t: 'fn', fn: function () { G.player.bag.runningshoes = 1; } };
    yield { t: 'text', s: 'You received the RUNNING SHOES!' };
    yield { t: 'text', s: '(Hold SHIFT to run.)' };
  };

  // Talking to the POKéMON walking behind you. It has nothing to say, which is
  // the point — it reacts, and the reaction depends on how healthy it is.
  G.EVENTS.followerTalk = function* () {
    var mon = G.followerSpecies && G.followerSpecies();
    if (!mon) return;
    var nm = G.monName(mon);
    var stats = G.monStats(mon);
    var frac = mon.curHp / stats.hp;
    yield { t: 'sfx', id: 'confirm' };
    if (mon.status === 'slp') { yield { t: 'text', s: nm + ' is fast asleep and walking anyway.' }; return; }
    if (frac <= 0.25) { yield { t: 'text', s: nm + ' is hurt, and leaning on you a little.' }; return; }
    if (frac < 1) { yield { t: 'text', s: nm + ' shakes itself off and carries on.' }; return; }
    yield { t: 'text', s: nm + ' looks up at you, then at the road ahead.' };
  };

  // ======================================== THE LEADERS COME BACK ==========
  // A CHAMPION flag on each gym's leader turns them into their rematch self.
  // Rather than duplicating eight NPC entries, the existing leader trainer is
  // swapped at load: same tile, same sprite, a different fight.
  [
    ['pewtergym', 'brock'],
    ['ceruleangym', 'misty'],
    ['vermiliongym', 'surge'],
    ['celadongym', 'erika'],
    ['fuchsiagym', 'koga'],
    ['saffrongym', 'sabrina'],
    ['cinnabargym', 'blaine'],
    ['viridiangym', 'giovanni']
  ].forEach(function (e) {
    var m = G.MAPS[e[0]];
    if (!m || !m.trainers) return;
    for (var i = 0; i < m.trainers.length; i++) {
      var t = m.trainers[i];
      if (t.trainer !== e[1]) continue;
      // the original, for anyone who has not finished the game
      t.unlessFlag = 'champion';
      // and the rematch, standing on the same tile once they have
      m.trainers.push({
        x: t.x, y: t.y, sprite: t.sprite, dir: t.dir,
        trainer: e[1] + '_rematch', sight: 0, ifFlag: 'champion'
      });
      break;
    }
  });

  // ------------------------------------------------- route level signs ----
  // Generated from each route's own encounter table, so a sign cannot lie
  // about the route it is standing on. Added at load, after the maps exist.
  (function () {
    var BADGE_FOR_LEVEL = function (lv) {
      // Roughly what the gyms expect: Brock around 12, Misty 20, Surge 24,
      // Erika 30, Koga 40, Sabrina 45, Blaine 47, Giovanni 50.
      var bands = [12, 20, 24, 30, 40, 45, 47, 50];
      var n = 0;
      for (var i = 0; i < bands.length; i++) if (lv >= bands[i] - 4) n = i + 1;
      return n;
    };
    for (var id in G.MAPS) {
      if (!/^route\d+$/.test(id)) continue;
      var m = G.MAPS[id];
      var enc = m.encounters;
      if (!enc || !enc.table || !enc.table.length) continue;
      var lo = Math.min.apply(null, enc.table.map(function (e) { return e.min; }));
      var hi = Math.max.apply(null, enc.table.map(function (e) { return e.max; }));
      // find a free tile beside the route's first warp to stand the post on
      var w0 = (m.warps || [])[0];
      if (!w0) continue;
      var busy = {};
      (m.warps || []).concat(m.signs || [], m.npcs || [], m.trainers || [], m.items || [])
        .forEach(function (o) { busy[o.x + ',' + o.y] = 1; });
      var spot = null;
      for (var d = 1; d <= 3 && !spot; d++) {
        var cands = [[w0.x + d, w0.y], [w0.x - d, w0.y], [w0.x, w0.y + d], [w0.x, w0.y - d]];
        for (var ci = 0; ci < cands.length; ci++) {
          var cx = cands[ci][0], cy = cands[ci][1];
          if (cx < 1 || cy < 1 || cx >= m.w - 1 || cy >= m.h - 1) continue;
          if (busy[cx + ',' + cy]) continue;
          var t = G.TILES[m.legend[m.ground[cy][cx]]];
          if (!t || t.solid) continue;
          spot = [cx, cy]; break;
        }
      }
      if (!spot) continue;
      var need = BADGE_FOR_LEVEL(hi);
      var advice = need <= 1 ? 'Anyone may pass.'
        : 'Trainers here are about ' + need + ' BADGES along.';
      (m.signs = m.signs || []).push({
        x: spot[0], y: spot[1],
        text: m.name.toUpperCase() + ' — wild POKéMON Lv' + lo + '-' + hi + '. ' + advice
      });
    }
  })();

  // ===================================== TRAINERS ON THE MIDDLE ROUTES ====
  // Same computed placement as the others: shallowest reachable tile, four
  // steps clear of anything else, and never in a one-wide corridor.
  [
    ['route6', 7, 16, 'r6_keigo', 'camper'],
    ['route6', 9, 14, 'r6_yasu', 'picnicker'],
    ['route6', 14, 16, 'r6_dirk', 'bugcatcher'],
    ['route8', 27, 6, 'r8_lao', 'gambler'],
    ['route8', 29, 8, 'r8_tamia', 'lass'],
    ['route8', 8, 7, 'r8_shane', 'supernerd'],
    ['route9', 27, 5, 'r9_frank', 'hiker'],
    ['route9', 29, 3, 'r9_marla', 'picnicker'],
    ['route9', 5, 5, 'r9_yuki', 'bugcatcher'],
    ['route11', 4, 6, 'r11_cale', 'gambler'],
    ['route11', 2, 8, 'r11_zac', 'youngster'],
    ['route11', 27, 5, 'r11_odette', 'engineer'],
    ['route25', 4, 6, 'r25_kent', 'hiker'],
    ['route25', 2, 8, 'r25_nob', 'lass'],
    ['route25', 27, 7, 'r25_flint', 'camper'],
    ['route25', 25, 9, 'r25_ann', 'picnicker']
  ].forEach(function (e) {
    var m = G.MAPS[e[0]];
    if (!m) return;
    (m.trainers = m.trainers || []).push({
      x: e[1], y: e[2], sprite: e[4], dir: 'down', trainer: e[3], sight: 3
    });
  });

  // ROUTE 23's checkpoints. Seven of them, one badge more at each, and they
  // turn you back rather than merely comment — a guard you can walk past is
  // scenery, not a gate.
  G.EVENTS.badgeGate = function* (ctx) {
    // Seven checkpoints, but ROUTE 23 is the LEAGUE ROAD: every trainer on it
    // is level 47 or higher, because it exists to be the last stretch before
    // VICTORY ROAD. Gating the first one at a single badge — which is what
    // Red/Blue does, on a route whose trainers are twenty levels lower — meant
    // a player who turned left out of VIRIDIAN on day one met a level 47
    // ARCANINE. The gate has to match what is behind it.
    //
    // The number lives on the script tile itself rather than in a table in
    // here, so the map data, this guard and the difficulty audit cannot
    // disagree about where the road opens. They did disagree once, and the
    // result was the ARCANINE.
    var p = G.world.player;
    var need = (ctx && ctx.needBadges) || 8;
    var have = (G.player.badges || []).filter(Boolean).length;
    if (have >= need) return;                       // walk on through
    yield { t: 'fn', fn: function () {
      // step back the way you came and face south again
      p.y = p.y + 1;
      p.fromX = p.x; p.fromY = p.y;
      p.moving = false; p.step = 0;
      p.dir = 'down';
      G.audio.sfx('bump');
    } };
    yield { t: 'text', s: 'GUARD: Hold it. Nobody goes up this road without ' + need + ' BADGES.' };
    yield { t: 'text', s: 'GUARD: You are carrying ' + have + '.' };
    if (have === 0) {
      yield { t: 'text', s: 'GUARD: Everything past me is LEAGUE country — the trainers up there are twice the level of anything you have met.' };
      yield { t: 'text', s: 'GUARD: Start at PEWTER. North of VIRIDIAN, through the forest. Come back when you have the set.' };
    } else {
      yield { t: 'text', s: 'GUARD: The trainers past this point are LEAGUE standard. I would be doing you no favours.' };
    }
  };
})();
