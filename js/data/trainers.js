// pokemon-gen3 — trainers.js
// Trainer roster (Gen 3 / Hoenn-flavored). party entries: { sp, level } — moves
// come from the species learnset. Rival parties use _starter/_starter2/_starter3
// placeholders resolved at battle time to the line that counters the player's
// starter. Trainer IDs are referenced by map NPCs, so they are kept stable.

(function () {
  var T = G.TRAINERS = {};
  function tr(id, def) { def.id = id; T[id] = def; }

  // ------------------------------------------------------------- rival -----
  tr('rival1', {
    name: 'Kai', cls: 'Rival', sprite: 'trainer_kai', ai: 'basic', money: 200,
    party: [{ sp: '_starter', level: 3 }],
    intro: "Heading out already? Let's see what that starter can do!",
    defeat: 'Not bad. Mine just needs more training.', music: 'battle'
  });
  tr('rival2', {
    name: 'Kai', cls: 'Rival', sprite: 'trainer_kai', ai: 'basic', money: 500,
    party: [{ sp: 'zigzagoon', level: 10 }, { sp: '_starter', level: 12 }],
    intro: "Perfect timing. I've been itching for a rematch!",
    defeat: 'Argh, so close! Next time for sure.', music: 'battle'
  });
  tr('rival3', {
    name: 'Kai', cls: 'Rival', sprite: 'trainer_kai', ai: 'smart', money: 900,
    party: [{ sp: 'swellow', level: 22 }, { sp: 'lombre', level: 23 }, { sp: '_starter2', level: 25 }],
    intro: 'Two badges and a real team now. Show me yours!',
    defeat: 'You keep getting stronger. So will I.', music: 'battle'
  });
  tr('rival4', {
    name: 'Kai', cls: 'Rival', sprite: 'trainer_kai', ai: 'smart', money: 1800,
    party: [{ sp: 'swellow', level: 34 }, { sp: 'magneton', level: 34 }, { sp: 'ludicolo', level: 35 }, { sp: '_starter3', level: 37 }],
    intro: 'The League is just ahead. One more battle before you go!',
    defeat: '...Go on. Become Champion. I’ll be right behind you.', music: 'battle'
  });

  // ------------------------------------------------------- early routes ----
  tr('r1_tom', { name: 'Youngster Tom', sprite: 'trainer_youngster', ai: 'basic', money: 60, party: [{ sp: 'poochyena', level: 3 }], intro: 'My shorts are comfy and my team is MIGHTY!', defeat: 'Mighty-ish. Mighty-adjacent.', music: 'battle' });
  tr('r1_ana', { name: 'Lass Ana', sprite: 'trainer_lass', ai: 'basic', money: 70, party: [{ sp: 'zigzagoon', level: 3 }], intro: 'We have been practicing all week!', defeat: 'Back to practice, I suppose.', music: 'battle' });

  tr('r2_ben', { name: 'Youngster Ben', sprite: 'trainer_youngster', ai: 'basic', money: 120, party: [{ sp: 'poochyena', level: 8 }, { sp: 'taillow', level: 8 }], intro: 'This route is MY turf!', defeat: 'Turf under renovation.', music: 'battle' });
  tr('r2_mia', { name: 'Lass Mia', sprite: 'trainer_lass', ai: 'basic', money: 120, party: [{ sp: 'zigzagoon', level: 9 }], intro: "Isn't my team just adorable?", defeat: 'Still adorable. Just not the winningest.', music: 'battle' });
  tr('r2_cliff', { name: 'Hiker Cliff', sprite: 'trainer_hiker', ai: 'basic', money: 160, party: [{ sp: 'geodude', level: 9 }, { sp: 'machop', level: 10 }], intro: 'HAH! I found these rocks myself!', defeat: 'The rocks need more seasoning.', music: 'battle' });

  // ------------------------------------------------------ petalburg woods --
  tr('vf_iggy', { name: 'Bug Catcher Iggy', sprite: 'trainer_youngster', ai: 'basic', money: 150, party: [{ sp: 'wurmple', level: 10 }, { sp: 'silcoon', level: 10 }, { sp: 'cascoon', level: 11 }], intro: 'Bugs! Bugs! BUGS!', defeat: 'Bugs...', music: 'battle' });
  tr('vf_fern', { name: 'Lass Fern', sprite: 'trainer_lass', ai: 'basic', money: 150, party: [{ sp: 'shroomish', level: 12 }], intro: 'The forest shares its secrets with me.', defeat: 'It kept that one to itself.', music: 'battle' });
  tr('vf_orin', { name: 'Ace Orin', sprite: 'trainer_ace', ai: 'basic', money: 220, party: [{ sp: 'beautifly', level: 13 }], intro: 'A Beautifly raised under the old canopy. Behold.', defeat: 'Beheld and beaten. Well fought.', music: 'battle' });

  // -------------------------------------------------- GYM 1: Roxanne (Rock)
  tr('gym1_bram', {
    name: 'Roxanne', cls: 'leader', sprite: 'trainer_bram', ai: 'smart', money: 1200,
    party: [{ sp: 'geodude', level: 8 }, { sp: 'nosepass', level: 10 }],
    intro: 'I am Roxanne, the Rustboro Gym Leader. I became a Leader so I might apply what I learned.',
    defeat: 'So... I lost. My rocks crumbled. You are wonderfully strong!',
    reward: { badge: 0, flag: 'badge1', text: 'Roxanne handed over the STONE BADGE!' },
    music: 'gym'
  });

  // ------------------------------------------------------------ route 3 ----
  tr('r3_lou', { name: 'Swimmer Lou', sprite: 'trainer_lass', ai: 'basic', money: 200, party: [{ sp: 'wingull', level: 15 }, { sp: 'marill', level: 15 }], intro: 'The tide brought me a challenger!', defeat: 'And the tide takes my pride right out.', music: 'battle' });
  tr('r3_gus', { name: 'Hiker Gus', sprite: 'trainer_hiker', ai: 'basic', money: 240, party: [{ sp: 'geodude', level: 15 }, { sp: 'graveler', level: 16 }], intro: 'Coastal rocks are the chewiest!', defeat: 'Chewed up and spat out, huh.', music: 'battle' });
  tr('r3_zee', { name: 'Youngster Zee', sprite: 'trainer_youngster', ai: 'basic', money: 200, party: [{ sp: 'magnemite', level: 15 }, { sp: 'electrike', level: 15 }], intro: 'My team glows in the dark!', defeat: 'Glow now, win later.', music: 'battle' });
  tr('r3_kym', { name: 'Battle Girl Kym', sprite: 'trainer_ace', ai: 'smart', money: 320, party: [{ sp: 'machop', level: 17 }], intro: 'Footwork. It always comes down to footwork.', defeat: 'You... have better footwork.', music: 'battle' });

  // ----------------------------------------------- GYM 2: Brawly (Fighting)
  tr('gym2_maris', {
    name: 'Brawly', cls: 'leader', sprite: 'trainer_maris', ai: 'smart', money: 2000,
    party: [{ sp: 'machop', level: 16 }, { sp: 'makuhita', level: 19 }],
    intro: 'Brawly of Dewford! A big wave is coming — ride it or be swept under!',
    defeat: 'Whoah! You rode the wave better than I did!',
    reward: { badge: 1, flag: 'badge2', text: 'Brawly handed over the KNUCKLE BADGE!' },
    music: 'gym'
  });

  // ----------------------------------------------------------- cave --------
  tr('hd_rok', { name: 'Hiker Rok', sprite: 'trainer_hiker', ai: 'basic', money: 280, party: [{ sp: 'geodude', level: 17 }, { sp: 'graveler', level: 18 }], intro: 'You hear that? The cave approves of me.', defeat: 'The cave is reconsidering.', music: 'battle' });
  tr('hd_nyx', { name: 'Ace Nyx', sprite: 'trainer_ace', ai: 'basic', money: 300, party: [{ sp: 'sableye', level: 18 }, { sp: 'duskull', level: 18 }], intro: 'The dark has teeth down here.', defeat: 'And you pulled them. Impressive.', music: 'battle' });
  tr('hd_moe', { name: 'Youngster Moe', sprite: 'trainer_youngster', ai: 'basic', money: 240, party: [{ sp: 'aron', level: 17 }, { sp: 'whismur', level: 18 }], intro: 'I got lost three days ago. Fight me anyway!', defeat: 'Worth it. Which way is out?', music: 'battle' });

  // --------------------------------------------- GYM 3: Wattson (Electric)
  tr('gym3_tess', {
    name: 'Wattson', cls: 'leader', sprite: 'trainer_tess', ai: 'smart', money: 2900,
    party: [{ sp: 'electrike', level: 22 }, { sp: 'magnemite', level: 23 }, { sp: 'manectric', level: 26 }],
    intro: 'Wahahahah! I am Wattson of Mauville! My electric creatures will give you a SHOCK!',
    defeat: 'Wahahah! You zapped me good! Take this!',
    reward: { badge: 2, flag: 'badge3', text: 'Wattson handed over the DYNAMO BADGE!' },
    music: 'gym'
  });

  // ------------------------------------------------------------ route 4 ----
  tr('r4_tia', { name: 'Lass Tia', sprite: 'trainer_lass', ai: 'basic', money: 360, party: [{ sp: 'plusle', level: 23 }, { sp: 'minun', level: 24 }], intro: 'Sparkles ARE a strategy!', defeat: 'Sparkles, regroup!', music: 'battle' });
  tr('r4_vin', { name: 'Youngster Vin', sprite: 'trainer_youngster', ai: 'basic', money: 340, party: [{ sp: 'seviper', level: 23 }, { sp: 'gulpin', level: 24 }], intro: 'Careful. My team bites AND stings.', defeat: 'They also lose, apparently.', music: 'battle' });
  tr('r4_hank', { name: 'Hiker Hank', sprite: 'trainer_hiker', ai: 'basic', money: 380, party: [{ sp: 'numel', level: 25 }], intro: 'Me and Numel dug this road!', defeat: 'Back to the shovel.', music: 'battle' });
  tr('r4_lux', { name: 'Ace Lux', sprite: 'trainer_ace', ai: 'smart', money: 480, party: [{ sp: 'manectric', level: 25 }, { sp: 'linoone', level: 26 }], intro: 'Style and substance. I brought both.', defeat: 'Substance defeated. Style intact.', music: 'battle' });

  // ------------------------------------------------- GYM 4: Flannery (Fire)
  tr('gym4_vesper', {
    name: 'Flannery', cls: 'leader', sprite: 'trainer_vesper', ai: 'smart', money: 4100,
    party: [{ sp: 'numel', level: 28 }, { sp: 'torkoal', level: 31 }, { sp: 'camerupt', level: 34 }],
    intro: "I'm Flannery, Leader of Lavaridge! I'll show you the hot-blooded power I've trained up!",
    defeat: '...I tried too hard to act tough. You beat me fair and square.',
    reward: { badge: 3, flag: 'badge4', text: 'Flannery handed over the HEAT BADGE!' },
    music: 'gym'
  });

  // ----------------------------------------------- routes 117-124 trainers
  tr('r5_a', { name: 'Cooltrainer Bex', sprite: 'trainer_ace', ai: 'smart', money: 720, party: [{ sp: 'machoke', level: 31 }, { sp: 'kadabra', level: 32 }], intro: 'Past the fourth badge, everyone gets serious.', defeat: 'Serious enough for me!', music: 'battle' });
  tr('r5_b', { name: 'Picnicker Wren', sprite: 'trainer_lass', ai: 'smart', money: 700, party: [{ sp: 'linoone', level: 32 }, { sp: 'manectric', level: 33 }], intro: 'Keep your team evolving and you might keep up!', defeat: 'You sure did.', music: 'battle' });
  tr('r6_a', { name: 'Bird Keeper Sol', sprite: 'trainer_ace', ai: 'smart', money: 760, party: [{ sp: 'pelipper', level: 36 }, { sp: 'vibrava', level: 37 }], intro: 'The rain never stops on Route 119!', defeat: 'Soaked AND beaten.', music: 'battle' });
  tr('r6_b', { name: 'Ranger Tam', sprite: 'trainer_hiker', ai: 'smart', money: 800, party: [{ sp: 'tropius', level: 37 }, { sp: 'altaria', level: 38 }], intro: 'Fortree lives in the treetops. Mind the step.', defeat: 'Climb on up.', music: 'battle' });
  tr('r7_a', { name: 'Psychic Mara', sprite: 'trainer_ace', ai: 'smart', money: 840, party: [{ sp: 'kadabra', level: 40 }, { sp: 'grumpig', level: 41 }], intro: 'I foresaw this battle. I forget who wins.', defeat: 'Oh. That is how it ends.', music: 'battle' });
  tr('r7_b', { name: 'Hex Maniac Io', sprite: 'trainer_lass', ai: 'smart', money: 820, party: [{ sp: 'xatu', level: 40 }, { sp: 'kirlia', level: 41 }], intro: 'The twins of Mossdeep are unbeatable. Almost.', defeat: 'Almost!', music: 'battle' });
  tr('r8_a', { name: 'Swimmer Dale', sprite: 'trainer_ace', ai: 'smart', money: 900, party: [{ sp: 'sharpedo', level: 44 }, { sp: 'sealeo', level: 45 }], intro: 'These are deep waters, challenger.', defeat: 'Deep and cold.', music: 'battle' });
  tr('r8_b', { name: 'Sailor Cobb', sprite: 'trainer_hiker', ai: 'smart', money: 940, party: [{ sp: 'gyarados', level: 45 }, { sp: 'wailord', level: 46 }], intro: 'Sootopolis hides inside a crater wall!', defeat: 'Wallace is waiting in there.', music: 'battle' });

  // ----------------------------------------------------- GYMS 5-8 (Hoenn)
  tr('gym5_norman', {
    name: 'Norman', cls: 'leader', sprite: 'trainer_norman', ai: 'smart', money: 5000,
    party: [{ sp: 'vigoroth', level: 34 }, { sp: 'linoone', level: 34 }, { sp: 'slaking', level: 37 }],
    intro: "I'm Norman, the Petalburg Leader. I won't hold back — not even a little.",
    defeat: 'I... lost? With my full strength? You are remarkable.',
    reward: { badge: 4, flag: 'badge5', text: 'Norman handed over the STAMINA BADGE!' }, music: 'gym'
  });
  tr('gym6_winona', {
    name: 'Winona', cls: 'leader', sprite: 'trainer_winona', ai: 'smart', money: 5600,
    party: [{ sp: 'pelipper', level: 38 }, { sp: 'swellow', level: 38 }, { sp: 'skarmory', level: 40 }, { sp: 'altaria', level: 42 }],
    intro: 'I am Winona. I have become one with all flying Pokémon. Let us soar!',
    defeat: 'Never have I seen a Trainer fly so true. Take this.',
    reward: { badge: 5, flag: 'badge6', text: 'Winona handed over the FEATHER BADGE!' }, music: 'gym'
  });
  tr('gym7_tate', {
    name: 'Tate & Liza', cls: 'leader', sprite: 'trainer_tate', ai: 'smart', money: 6200,
    party: [{ sp: 'lunatone', level: 42 }, { sp: 'solrock', level: 42 }, { sp: 'xatu', level: 44 }, { sp: 'gardevoir', level: 44 }],
    intro: 'We are Tate and Liza! Two Leaders, one mind — can you keep up with both?',
    defeat: 'Our thoughts... were read. Impossible, and yet here you stand.',
    reward: { badge: 6, flag: 'badge7', text: 'The twins handed over the MIND BADGE!' }, music: 'gym'
  });
  tr('gym8_wallace', {
    name: 'Wallace', cls: 'leader', sprite: 'trainer_wallace', ai: 'smart', money: 7000,
    party: [{ sp: 'whiscash', level: 44 }, { sp: 'sealeo', level: 44 }, { sp: 'gyarados', level: 46 }, { sp: 'milotic', level: 48 }],
    intro: 'I am Wallace, the final Gym Leader. Witness the artistry of water!',
    defeat: 'Beautiful. Your bond outshone even my Milotic. Go to the League!',
    reward: { badge: 7, flag: 'badge8', text: 'Wallace handed over the RAIN BADGE!' }, music: 'gym'
  });

  // --------------------------------------- ELITE FOUR (the Summit gauntlet)
  tr('sp_rex', {
    name: 'Sidney', cls: 'Elite Four', sprite: 'trainer_sidney', ai: 'smart', money: 5600,
    party: [{ sp: 'mightyena', level: 50 }, { sp: 'cacturne', level: 50 }, { sp: 'sharpedo', level: 51 }, { sp: 'crawdaunt', level: 52 }, { sp: 'absol', level: 54 }],
    intro: "I'm Sidney of the Elite Four. I like that look you're giving me. Let's go!",
    defeat: 'Well, listen to what the loser has to say. You won fair and square.', music: 'champion'
  });
  tr('sp_isa', {
    name: 'Phoebe', cls: 'Elite Four', sprite: 'trainer_phoebe', ai: 'smart', money: 5800,
    party: [{ sp: 'sableye', level: 51 }, { sp: 'banette', level: 53 }, { sp: 'dusclops', level: 54 }, { sp: 'gengar', level: 55 }],
    intro: "I'm Phoebe of the Elite Four. My ghosts and I trained on Mt. Pyre. Ready?",
    defeat: 'Oh, darn. I lost. There must be a reason you grew so strong.', music: 'champion'
  });
  tr('sp_olm', {
    name: 'Glacia', cls: 'Elite Four', sprite: 'trainer_glacia', ai: 'smart', money: 6000,
    party: [{ sp: 'sealeo', level: 52 }, { sp: 'glalie', level: 53 }, { sp: 'lapras', level: 54 }, { sp: 'walrein', level: 56 }],
    intro: "I am Glacia of the Elite Four. Show me — burn through my icy cold with your passion!",
    defeat: 'You and your creatures... how hot your spirits burn! Wonderful.', music: 'champion'
  });
  tr('sp_ada', {
    name: 'Drake', cls: 'Elite Four', sprite: 'trainer_drake', ai: 'smart', money: 6400,
    party: [{ sp: 'altaria', level: 53 }, { sp: 'flygon', level: 55 }, { sp: 'kingdra', level: 55 }, { sp: 'salamence', level: 57 }],
    intro: 'I am Drake of the Elite Four! Do you have what it takes to command dragons? Show me!',
    defeat: 'Superb! You deserve to face the Champion now.', music: 'champion'
  });

  // ------------------------------------------------------------ champion ---
  tr('champion', {
    name: 'Champion Steven', cls: 'champion', sprite: 'trainer_steven', ai: 'smart', money: 12000,
    party: [
      { sp: 'claydol', level: 55 }, { sp: 'cradily', level: 56 },
      { sp: 'armaldo', level: 56 }, { sp: 'golem', level: 57 },
      { sp: 'aggron', level: 58 }, { sp: 'metagross', level: 60 }
    ],
    intro: "I'm Steven, the Champion. I collect rare stones... and challengers worth remembering. Come!",
    defeat: 'I, the Champion, fall in defeat... That was an excellent battle. A new Champion is born!',
    music: 'champion'
  });

  // ----------------------------------------------------------- TEAM AQUA ---
  // A sea-worshipping crew (Water/Dark teams) bent on waking Kyogre to drown the
  // land and "give it back to the ocean." Original dialogue — names as identifiers.
  tr('aqua_grunt1', {
    name: 'Aqua Grunt', cls: 'Team Aqua', sprite: 'trainer_aqua', ai: 'basic', money: 320,
    party: [{ sp: 'poochyena', level: 14 }, { sp: 'carvanha', level: 15 }],
    intro: "Team Aqua's gonna hand this dusty coast back to the sea! Outta the way!",
    defeat: 'Tch... the tide always turns on me.', music: 'battle'
  });
  tr('aqua_grunt2', {
    name: 'Aqua Grunt', cls: 'Team Aqua', sprite: 'trainer_aqua', ai: 'basic', money: 360,
    party: [{ sp: 'zubat', level: 15 }, { sp: 'carvanha', level: 16 }],
    intro: 'More water means more life. That is the Aqua creed — now scram!',
    defeat: "You can't hold back the ocean forever, kid.", music: 'battle'
  });
  tr('aqua_grunt3', {
    name: 'Aqua Grunt', cls: 'Team Aqua', sprite: 'trainer_aqua', ai: 'basic', money: 460,
    party: [{ sp: 'poochyena', level: 19 }, { sp: 'zubat', level: 19 }, { sp: 'carvanha', level: 20 }],
    intro: 'You wandered into an Aqua operation. Bold. Stupid, but bold.',
    defeat: 'Fine, fine — I never saw you, you never saw us.', music: 'battle'
  });
  tr('aqua_grunt4', {
    name: 'Aqua Grunt', cls: 'Team Aqua', sprite: 'trainer_aqua', ai: 'smart', money: 760,
    party: [{ sp: 'mightyena', level: 38 }, { sp: 'sharpedo', level: 39 }],
    intro: 'These waves belong to Team Aqua now. Turn your boat around!',
    defeat: 'Blub... beaten on my own sea.', music: 'battle'
  });
  tr('aqua_grunt5', {
    name: 'Aqua Grunt', cls: 'Team Aqua', sprite: 'trainer_aqua', ai: 'smart', money: 900,
    party: [{ sp: 'golbat', level: 43 }, { sp: 'sharpedo', level: 44 }, { sp: 'mightyena', level: 44 }],
    intro: 'The boss is about to wake the great Kyogre! You are far too late!',
    defeat: 'Then... go stop him yourself. If the sea lets you.', music: 'battle'
  });
  tr('aqua_admin', {
    name: 'Aqua Admin Reef', cls: 'Aqua Admin', sprite: 'trainer_aqua', ai: 'smart', money: 4600,
    party: [{ sp: 'mightyena', level: 45 }, { sp: 'crawdaunt', level: 46 }, { sp: 'sharpedo', level: 47 }],
    intro: "I'm Reef. The boss has no time for you — but I have all the time in the world.",
    defeat: 'Impossible... go on, then. Archie is just ahead.', music: 'battle'
  });
  tr('aqua_archie', {
    name: 'Archie', cls: 'Aqua Boss', sprite: 'trainer_archie', ai: 'smart', money: 9000,
    party: [{ sp: 'mightyena', level: 47 }, { sp: 'crobat', level: 48 }, { sp: 'wailord', level: 48 }, { sp: 'sharpedo', level: 50 }],
    intro: 'I am Archie, leader of Team Aqua! I will wake Kyogre and let the sea reclaim every shore. You cannot stop the rising tide!',
    defeat: 'Kyogre stirs... yet you stand taller than the waves. Perhaps the sea has chosen YOU.', music: 'champion'
  });

  // ----------------------------------- HALL OF FAME ARENA (post-game) ------
  // Three champions of ages past, teams stacked with legends. The final one
  // wields the titan you did NOT claim ('_otherlegend' resolves at battle time).
  tr('arena1', {
    name: 'Sage Regulus', cls: 'Hall of Fame', sprite: 'trainer_aldric', ai: 'smart', money: 12000,
    party: [{ sp: 'aggron', level: 58 }, { sp: 'claydol', level: 59 }, { sp: 'regice', level: 60 }, { sp: 'regirock', level: 61 }, { sp: 'registeel', level: 62 }, { sp: '_weathertrio', level: 64 }],
    intro: 'I am Regulus, keeper of the golems. Three titans of stone answer to me — and perhaps a fourth wonder. Show me your steel!',
    defeat: 'The golems bow. Climb higher, Champion.', music: 'champion'
  });
  tr('arena2', {
    name: 'Lady Eonia', cls: 'Hall of Fame', sprite: 'trainer_maris', ai: 'smart', money: 13000,
    party: [{ sp: 'altaria', level: 61 }, { sp: 'flygon', level: 62 }, { sp: 'kingdra', level: 63 }, { sp: 'latias', level: 64 }, { sp: 'latios', level: 65 }, { sp: 'deoxys', level: 66 }],
    intro: 'Eonia, rider of the Eon dragons. Latias and Latios fly with me — and a visitor from beyond the stars. Can your bond fly higher?',
    defeat: 'The dragons accept you. One champion yet remains.', music: 'champion'
  });
  tr('arena3', {
    name: 'Grandmaster Orin', cls: 'Hall of Fame', sprite: 'trainer_vesper', ai: 'smart', money: 16000,
    party: [{ sp: 'gardevoir', level: 64 }, { sp: 'milotic', level: 65 }, { sp: 'salamence', level: 66 }, { sp: 'metagross', level: 68 }, { sp: '_weathertrio', level: 69 }, { sp: '_otherlegend', level: 70 }],
    intro: 'I am Orin, the first Champion. I hold the titan you let slip away. Prove you were the worthier vessel!',
    defeat: 'Astonishing. Sea, land, and sky — all yours. You are the finest this Hall has ever seen.',
    onWin: 'arenaReward', music: 'champion'
  });

  // starter-counter cycle: rival takes the type-advantaged starter.
  // player grass(treecko) -> fire(torchic); fire -> water(mudkip); water -> grass(treecko)
  var COUNTER = { treecko: 'torchic', torchic: 'mudkip', mudkip: 'treecko' };
  var STAGE2 = { torchic: 'combusken', mudkip: 'marshtomp', treecko: 'grovyle' };
  var STAGE3 = { torchic: 'blaziken', mudkip: 'swampert', treecko: 'sceptile' };

  G.trainerParty = function (def) {
    var starterKey = G.flags.starter || 'treecko';
    var rivalBase = COUNTER[starterKey] || 'torchic';
    return def.party.map(function (p) {
      var key = p.sp;
      if (key === '_starter') key = rivalBase;
      if (key === '_starter2') key = STAGE2[rivalBase];
      if (key === '_starter3') key = STAGE3[rivalBase];
      // the legendary the player passed over (caught Kyogre -> they fight Groudon)
      if (key === '_otherlegend') key = G.flags.ev_kyogre ? 'groudon' : 'kyogre';
      // a ~50/50 chance the slot is a weather-trio titan, else a strong pseudo
      if (key === '_weathertrio') key = G.chance(0.5)
        ? ['kyogre', 'groudon', 'rayquaza'][G.irand(3)]
        : ['salamence', 'metagross', 'tyranitar'][G.irand(3)];
      return G.makeMon(key, p.level);
    });
  };
})();
