// pokemon-kanto — trainers.js
// Trainer roster. party entries are { sp, level }; moves come from the species
// learnset at that level.
//
// Blue's parties use _starter / _starter2 / _starter3 placeholders, resolved at
// battle time to the line that COUNTERS whatever the player chose — which is
// what Gen 1 does, and the reason the rival always feels aimed at you
// personally rather than generic.
//
// Gym leader parties and levels are the real Red/Blue ones.
// Trainer IDs are referenced by map NPCs, so they stay stable once used.

(function () {
  var T = G.TRAINERS = {};
  function tr(id, def) { def.id = id; T[id] = def; }

  // ================================================================ RIVAL ===
  tr('blue_lab', {
    name: 'Blue', cls: 'Rival', sprite: 'trainer_blue', ai: 'basic', money: 175,
    party: [{ sp: '_starter', level: 5 }],
    intro: "Wait! Let's check out our POKéMON!",
    defeat: 'WHAT? Unbelievable! I picked the wrong POKéMON!',
    music: 'battle'
  });
  tr('blue_route22', {
    name: 'Blue', cls: 'Rival', sprite: 'trainer_blue', ai: 'basic', money: 260,
    party: [{ sp: 'pidgey', level: 9 }, { sp: '_starter', level: 8 }],
    intro: "Hey! You're going to the POKéMON LEAGUE? Forget it, you're not good enough!",
    defeat: 'Aww! You just lucked out!',
    music: 'battle'
  });
  tr('blue_cerulean', {
    name: 'Blue', cls: 'Rival', sprite: 'trainer_blue', ai: 'smart', money: 650,
    party: [
      { sp: 'pidgeotto', level: 17 }, { sp: 'abra', level: 16 },
      { sp: 'rattata', level: 15 }, { sp: '_starter2', level: 18 }
    ],
    intro: 'Hey! What brings you here? Your POKéDEX is looking thin.',
    defeat: 'Humph! At least you are raising them properly.',
    music: 'battle'
  });
  tr('blue_ssanne', {
    name: 'Blue', cls: 'Rival', sprite: 'trainer_blue', ai: 'smart', money: 950,
    party: [
      { sp: 'pidgeotto', level: 19 }, { sp: 'raticate', level: 16 },
      { sp: 'kadabra', level: 18 }, { sp: '_starter2', level: 20 }
    ],
    intro: 'Imagine meeting here! Are you still struggling along?',
    defeat: 'Humph! You are better than I thought.',
    music: 'battle'
  });
  tr('blue_tower', {
    name: 'Blue', cls: 'Rival', sprite: 'trainer_blue', ai: 'smart', money: 1300,
    party: [
      { sp: 'pidgeotto', level: 25 }, { sp: 'gyarados', level: 23 },
      { sp: 'growlithe', level: 22 }, { sp: 'kadabra', level: 20 },
      { sp: '_starter2', level: 25 }
    ],
    intro: 'Oh, it is you. Battling in a graveyard? Grim, even for you.',
    defeat: 'What? You beat me? No way!',
    music: 'battle'
  });

  // ========================================================== GYM LEADERS ===
  tr('brock', {
    name: 'Brock', cls: 'Leader', sprite: 'trainer_brock', ai: 'smart', money: 1386,
    party: [{ sp: 'geodude', level: 12 }, { sp: 'onix', level: 14 }],
    intro: "I'm BROCK. My rock-hard willpower is evident even in my POKéMON.",
    defeat: "I took you for granted, and so I lost. Here — the BOULDERBADGE.",
    reward: { badge: 0, flag: 'badge1', text: 'You received the BOULDERBADGE!' , tm: 'tm34' },
    music: 'gymleader'
  });
  tr('misty', {
    name: 'Misty', cls: 'Leader', sprite: 'trainer_misty', ai: 'smart', money: 2079,
    party: [{ sp: 'staryu', level: 18 }, { sp: 'starmie', level: 21 }],
    intro: "I'm MISTY of CERULEAN GYM. My policy is an all-out offensive with WATER POKéMON!",
    defeat: 'You are too much! All right, take the CASCADEBADGE.',
    reward: { badge: 1, flag: 'badge2', text: 'You received the CASCADEBADGE!' , tm: 'tm11' },
    music: 'gymleader'
  });
  tr('surge', {
    name: 'Lt. Surge', cls: 'Leader', sprite: 'trainer_surge', ai: 'smart', money: 2277,
    party: [{ sp: 'voltorb', level: 21 }, { sp: 'pikachu', level: 18 }, { sp: 'raichu', level: 24 }],
    intro: 'Hey, kid! What do you think you are doing here? You will not live long in combat!',
    defeat: 'Whoa! You are the real deal, kid! Take the THUNDERBADGE!',
    reward: { badge: 2, flag: 'badge3', text: 'You received the THUNDERBADGE!' , tm: 'tm24' },
    music: 'gymleader'
  });
  tr('erika', {
    name: 'Erika', cls: 'Leader', sprite: 'trainer_erika', ai: 'smart', money: 2871,
    party: [{ sp: 'victreebel', level: 29 }, { sp: 'tangela', level: 24 }, { sp: 'vileplume', level: 29 }],
    intro: "Hello. Lovely weather, is it not? I am ERIKA, of GRASS POKéMON.",
    defeat: 'Oh! I concede defeat. Please, take the RAINBOWBADGE.',
    reward: { badge: 3, flag: 'badge4', text: 'You received the RAINBOWBADGE!' , tm: 'tm21' },
    music: 'gymleader'
  });
  tr('koga', {
    name: 'Koga', cls: 'Leader', sprite: 'trainer_koga', ai: 'smart', money: 3762,
    party: [
      { sp: 'koffing', level: 37 }, { sp: 'muk', level: 39 },
      { sp: 'koffing', level: 37 }, { sp: 'weezing', level: 43 }
    ],
    intro: 'Fwahaha! A mere child dares challenge me? I shall show you true terror as a ninja master!',
    defeat: 'Humph! You have proven your worth. Take the SOULBADGE!',
    reward: { badge: 4, flag: 'badge5', text: 'You received the SOULBADGE!' , tm: 'tm06' },
    music: 'gymleader'
  });
  tr('sabrina', {
    name: 'Sabrina', cls: 'Leader', sprite: 'trainer_sabrina', ai: 'smart', money: 4257,
    party: [
      { sp: 'kadabra', level: 38 }, { sp: 'mrmime', level: 37 },
      { sp: 'venomoth', level: 38 }, { sp: 'alakazam', level: 43 }
    ],
    intro: 'I had a vision of your arrival. I have had psychic powers since I was a child.',
    defeat: 'I am shocked. But a loss is a loss. Take the MARSHBADGE.',
    reward: { badge: 5, flag: 'badge6', text: 'You received the MARSHBADGE!' , tm: 'tm46' },
    music: 'gymleader'
  });
  tr('blaine', {
    name: 'Blaine', cls: 'Leader', sprite: 'trainer_blaine', ai: 'smart', money: 4554,
    party: [
      { sp: 'growlithe', level: 42 }, { sp: 'ponyta', level: 40 },
      { sp: 'rapidash', level: 42 }, { sp: 'arcanine', level: 47 }
    ],
    intro: 'Hah! I am BLAINE! My POKéMON are all FIRE type. Can you take the heat?',
    defeat: 'I have burnt out. You have earned the VOLCANOBADGE.',
    reward: { badge: 6, flag: 'badge7', text: 'You received the VOLCANOBADGE!' , tm: 'tm38' },
    music: 'gymleader'
  });
  tr('giovanni', {
    name: 'Giovanni', cls: 'Leader', sprite: 'trainer_giovanni', ai: 'smart', money: 4950,
    party: [
      { sp: 'rhyhorn', level: 45 }, { sp: 'dugtrio', level: 42 },
      { sp: 'nidoqueen', level: 44 }, { sp: 'nidoking', level: 45 },
      { sp: 'rhydon', level: 50 }
    ],
    intro: 'So. I must say, I am impressed you got here. I am GIOVANNI, LEADER of VIRIDIAN GYM.',
    defeat: 'Ha! A truly intense fight. You have won. Take the EARTHBADGE.',
    reward: { badge: 7, flag: 'badge8', text: 'You received the EARTHBADGE!' },
    music: 'gymleader'
  });

  // Brock's gym trainer.
  tr('pg_liam', {
    name: 'Jr. Trainer Liam', sprite: 'trainer_youngster', ai: 'basic', money: 231,
    party: [{ sp: 'diglett', level: 11 }, { sp: 'sandshrew', level: 11 }],
    intro: 'Stop right there, kid! You are still light-years from facing BROCK!',
    defeat: 'Darn! Light-years is a distance, not a time. I always get that wrong.',
    music: 'battle'
  });

  // ================================================= early-route trainers ===
  // Viridian Forest is bug catchers, as it should be.
  tr('vf_rick', {
    name: 'Bug Catcher Rick', sprite: 'trainer_bugcatcher', ai: 'basic', money: 84,
    party: [{ sp: 'weedle', level: 6 }, { sp: 'caterpie', level: 6 }],
    intro: '!!! You! You have POKéMON! Come on, let us battle!',
    defeat: 'I give up!', music: 'battle'
  });
  tr('vf_doug', {
    name: 'Bug Catcher Doug', sprite: 'trainer_bugcatcher', ai: 'basic', money: 91,
    party: [{ sp: 'weedle', level: 7 }, { sp: 'kakuna', level: 7 }, { sp: 'weedle', level: 7 }],
    intro: 'Hey! You have POKéMON! Let us battle!',
    defeat: 'No! KAKUNA could not cut it!', music: 'battle'
  });
  tr('vf_sammy', {
    name: 'Bug Catcher Sammy', sprite: 'trainer_bugcatcher', ai: 'basic', money: 133,
    party: [{ sp: 'caterpie', level: 9 }, { sp: 'metapod', level: 9 }],
    intro: 'Yo! You cannot jam out if you are a POKéMON trainer!',
    defeat: 'Down and out!', music: 'battle'
  });

  // Route 3 — the long climb up to Mt. Moon.
  tr('r3_calvin', {
    name: 'Youngster Calvin', sprite: 'trainer_youngster', ai: 'basic', money: 175,
    party: [{ sp: 'rattata', level: 10 }, { sp: 'ekans', level: 10 }],
    intro: 'I only use POKéMON I caught myself!',
    defeat: 'Caught them myself. Lost with them myself.', music: 'battle'
  });
  tr('r3_janice', {
    name: 'Lass Janice', sprite: 'trainer_lass', ai: 'basic', money: 180,
    party: [{ sp: 'pidgey', level: 9 }, { sp: 'pidgey', level: 11 }],
    intro: 'Hi! I like shiny things and strong POKéMON!',
    defeat: 'Not shiny enough, apparently.', music: 'battle'
  });

  tr('r3_colton', {
    name: 'Bug Catcher Colton', sprite: 'trainer_bugcatcher', ai: 'basic', money: 189,
    party: [{ sp: 'caterpie', level: 10 }, { sp: 'weedle', level: 10 }, { sp: 'caterpie', level: 10 }],
    intro: 'Hey! You have POKéMON! Let us battle!',
    defeat: 'Three of them and not one held up.', music: 'battle'
  });

  // Mt. Moon. The Rockets are here for the fossils, which is the first sign
  // that anyone in Kanto is doing something worse than losing a battle.
  tr('mm_kent', {
    name: 'Bug Catcher Kent', sprite: 'trainer_bugcatcher', ai: 'basic', money: 231,
    party: [{ sp: 'weedle', level: 11 }, { sp: 'kakuna', level: 11 }],
    intro: 'Are you also here for the MOON STONE?',
    defeat: 'Fine, it is all yours.', music: 'battle'
  });
  tr('mm_marcos', {
    name: 'Hiker Marcos', sprite: 'trainer_hiker', ai: 'basic', money: 462,
    party: [{ sp: 'geodude', level: 11 }, { sp: 'onix', level: 11 }],
    intro: 'I came up here for the rocks. Found POKéMON made of rock. Better!',
    defeat: 'Solid effort. Ha. Solid.', music: 'battle'
  });
  tr('mm_miguel', {
    name: 'Super Nerd Miguel', sprite: 'trainer_supernerd', ai: 'smart', money: 550,
    party: [{ sp: 'grimer', level: 12 }, { sp: 'voltorb', level: 12 }, { sp: 'koffing', level: 12 }],
    intro: 'The fossils are MINE. I found them first!',
    defeat: 'Fine! Take one. Just one!', music: 'battle'
  });
  tr('mm_rocket1', {
    name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 605,
    party: [{ sp: 'rattata', level: 13 }, { sp: 'zubat', level: 13 }],
    intro: 'You are in TEAM ROCKET business now. Bad move.',
    defeat: 'Ow! You are strong!', music: 'battle'
  });
  tr('mm_rocket2', {
    name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 660,
    party: [{ sp: 'sandshrew', level: 11 }, { sp: 'rattata', level: 11 }, { sp: 'zubat', level: 11 }],
    intro: 'Nobody gets past me. Nobody!',
    defeat: 'Somebody got past me.', music: 'battle'
  });

  // Misty's gym.
  tr('cg_diana', {
    name: 'Swimmer Diana', sprite: 'trainer_swimmerf', ai: 'basic', money: 320,
    party: [{ sp: 'goldeen', level: 16 }],
    intro: 'I am going to be the next MISTY!',
    defeat: 'Maybe the one after next.', music: 'battle'
  });
  tr('cg_luis', {
    name: 'Swimmer Luis', sprite: 'trainer_swimmer', ai: 'basic', money: 360,
    party: [{ sp: 'horsea', level: 16 }, { sp: 'shellder', level: 16 }],
    intro: 'You are gonna get soaked!',
    defeat: 'I got soaked instead.', music: 'battle'
  });

  // NUGGET BRIDGE. Five in a row with no way off the bridge, then a recruiter.
  tr('nb_1', { name: 'Bug Catcher Cale', sprite: 'trainer_bugcatcher', ai: 'basic', money: 224,
    party: [{ sp: 'weedle', level: 14 }, { sp: 'kakuna', level: 14 }],
    intro: 'One down, four to go. Think you can manage?', defeat: 'Four to go.', music: 'battle' });
  tr('nb_2', { name: 'Lass Iris', sprite: 'trainer_lass', ai: 'basic', money: 285,
    party: [{ sp: 'pidgey', level: 15 }, { sp: 'nidoranf', level: 15 }],
    intro: 'You got past Cale? Lucky.', defeat: 'Not luck, then.', music: 'battle' });
  tr('nb_3', { name: 'Youngster Josh', sprite: 'trainer_youngster', ai: 'basic', money: 285,
    party: [{ sp: 'sandshrew', level: 15 }],
    intro: 'Halfway. This is where people turn back.', defeat: 'You did not turn back.', music: 'battle' });
  tr('nb_4', { name: 'Lass Reli', sprite: 'trainer_lass', ai: 'smart', money: 304,
    party: [{ sp: 'nidoranm', level: 16 }],
    intro: 'Your POKéMON must be exhausted by now.', defeat: 'Apparently not.', music: 'battle' });
  tr('nb_5', { name: 'Jr. Trainer Ethan', sprite: 'trainer_cooltrainerm', ai: 'smart', money: 380,
    party: [{ sp: 'mankey', level: 17 }, { sp: 'oddish', level: 16 }],
    intro: 'Last one. Nobody gets past me.', defeat: 'Somebody got past me.', music: 'battle' });
  tr('nb_rocket', { name: 'Rocket Scout', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 800,
    party: [{ sp: 'ekans', level: 17 }, { sp: 'zubat', level: 17 }],
    intro: 'Impressive. TEAM ROCKET could use someone like you. Interested?',
    defeat: 'Fine. Stay a hero. See where it gets you.', music: 'battle' });

  tr('r25_franklin', { name: 'Hiker Franklin', sprite: 'trainer_hiker', ai: 'basic', money: 588,
    party: [{ sp: 'machop', level: 14 }, { sp: 'geodude', level: 14 }],
    intro: 'This cape is a nice walk. Shame about the trainers.', defeat: 'I am one of them, yes.', music: 'battle' });
  tr('r25_ali', { name: 'Lass Ali', sprite: 'trainer_lass', ai: 'basic', money: 304,
    party: [{ sp: 'oddish', level: 16 }, { sp: 'bellsprout', level: 16 }],
    intro: 'Are you going to see BILL too?', defeat: 'Say hello for me.', music: 'battle' });

  tr('r6_ethan', { name: 'Camper Ethan', sprite: 'trainer_camper', ai: 'basic', money: 380,
    party: [{ sp: 'rattata', level: 19 }, { sp: 'ekans', level: 19 }],
    intro: 'VERMILION is just down there. You still have to get past me.',
    defeat: 'Fair enough. Off you go.', music: 'battle' });
  tr('r6_nancy', { name: 'Picnicker Nancy', sprite: 'trainer_picnicker', ai: 'basic', money: 360,
    party: [{ sp: 'pidgey', level: 18 }, { sp: 'nidoranf', level: 18 }],
    intro: 'Lovely spot for a battle, is it not?', defeat: 'Still a lovely spot.', music: 'battle' });

  // Surge's gym.
  tr('vg_dwayne', { name: 'Sailor Dwayne', sprite: 'trainer_sailor', ai: 'smart', money: 462,
    party: [{ sp: 'machop', level: 20 }, { sp: 'shellder', level: 20 }],
    intro: 'You want the LIEUTENANT? Get past me first.',
    defeat: 'Go on then. He is expecting you.', music: 'battle' });
  tr('vg_luca', { name: 'Rocker Luca', sprite: 'trainer_rocker', ai: 'smart', money: 440,
    party: [{ sp: 'voltorb', level: 20 }, { sp: 'magnemite', level: 20 }],
    intro: 'ELECTRIC POKéMON are the loudest POKéMON. That is just science.',
    defeat: 'Turned down. Not off. Just down.', music: 'battle' });

  tr('r11_eddie', { name: 'Youngster Eddie', sprite: 'trainer_youngster', ai: 'basic', money: 418,
    party: [{ sp: 'sandshrew', level: 21 }],
    intro: 'This road goes all the way to LAVENDER. Not past me it does not.',
    defeat: 'It does, then.', music: 'battle' });
  tr('r11_hugo', { name: 'Gambler Hugo', sprite: 'trainer_gambler', ai: 'smart', money: 840,
    party: [{ sp: 'poliwag', level: 22 }, { sp: 'horsea', level: 22 }],
    intro: 'Care to make it interesting?',
    defeat: 'It was interesting. It was also expensive.', music: 'battle' });

  tr('ss_dylan', { name: 'Sailor Dylan', sprite: 'trainer_sailor', ai: 'smart', money: 462,
    party: [{ sp: 'machop', level: 21 }, { sp: 'shellder', level: 21 }],
    intro: 'Passengers are not supposed to be below decks.',
    defeat: 'Go on then. Nothing down here anyway.', music: 'battle' });
  tr('ss_arthur', { name: 'Gentleman Arthur', sprite: 'trainer_gentleman', ai: 'smart', money: 1274,
    party: [{ sp: 'growlithe', level: 22 }, { sp: 'ponyta', level: 22 }],
    intro: 'A battle! On a cruise! How marvellously uncivilised.',
    defeat: 'Splendidly done. Have a pleasant voyage.', music: 'battle' });

  tr('r9_dudley', { name: 'Hiker Dudley', sprite: 'trainer_hiker', ai: 'basic', money: 700,
    party: [{ sp: 'geodude', level: 21 }, { sp: 'onix', level: 21 }],
    intro: 'Heading for the tunnel? Hope you brought a light.',
    defeat: 'And a POTION, apparently.', music: 'battle' });
  tr('r9_wanda', { name: 'Jr. Trainer Wanda', sprite: 'trainer_cooltrainerf', ai: 'smart', money: 570,
    party: [{ sp: 'nidoranf', level: 22 }, { sp: 'oddish', level: 22 }],
    intro: 'Nobody goes east any more. Not since the tunnel went dark.',
    defeat: 'Go on, then. Mind your step.', music: 'battle' });

  tr('rt_lenny', { name: 'Hiker Lenny', sprite: 'trainer_hiker', ai: 'basic', money: 748,
    party: [{ sp: 'geodude', level: 22 }, { sp: 'machop', level: 22 }],
    intro: 'I live down here now. Mostly.',
    defeat: 'Fine. Fine!', music: 'battle' });
  tr('rt_ashton', { name: 'Poké Maniac Ashton', sprite: 'trainer_pokemaniac', ai: 'smart', money: 858,
    party: [{ sp: 'cubone', level: 23 }, { sp: 'slowpoke', level: 23 }],
    intro: 'Do you know how RARE a CUBONE is? Do you?',
    defeat: 'Still rare. Still mine.', music: 'battle' });
  tr('rt_oliver', { name: 'Hiker Oliver', sprite: 'trainer_hiker', ai: 'basic', money: 782,
    party: [{ sp: 'graveler', level: 23 }],
    intro: 'You are a long way in to be turning back.',
    defeat: 'Keep going. It opens out.', music: 'battle' });

  tr('r10_carol', { name: 'Picnicker Carol', sprite: 'trainer_picnicker', ai: 'basic', money: 460,
    party: [{ sp: 'oddish', level: 23 }, { sp: 'bellsprout', level: 23 }],
    intro: 'LAVENDER is just down the hill. It is a sad little place.',
    defeat: 'You will see what I mean.', music: 'battle' });

  // The tower. All channelers, because that is who is up there. They speak in
  // the possessed register and then apologise for it, which is funnier and
  // sadder than either half alone.
  tr('pt_hope', { name: 'Channeler Hope', sprite: 'trainer_channeler', ai: 'smart', money: 506,
    party: [{ sp: 'gastly', level: 23 }],
    intro: 'BE GONE... INTRUDER...',
    defeat: '...Oh. Oh, I am so sorry. Was I saying something?', music: 'battle' });
  tr('pt_patricia', { name: 'Channeler Patricia', sprite: 'trainer_channeler', ai: 'smart', money: 528,
    party: [{ sp: 'gastly', level: 24 }],
    intro: 'GIVE... ME... YOUR... SOUL...',
    defeat: 'Goodness. I do apologise. It comes over me.', music: 'battle' });
  tr('pt_carly', { name: 'Channeler Carly', sprite: 'trainer_channeler', ai: 'smart', money: 506,
    party: [{ sp: 'gastly', level: 23 }, { sp: 'gastly', level: 23 }],
    intro: 'HAUNT... HAUNT...',
    defeat: 'What time is it? Have I been here long?', music: 'battle' });
  tr('pt_laurel', { name: 'Channeler Laurel', sprite: 'trainer_channeler', ai: 'smart', money: 550,
    party: [{ sp: 'haunter', level: 25 }],
    intro: 'YOU... ARE... NOT... WELCOME...',
    defeat: 'Please do not tell my mother about this.', music: 'battle' });
  tr('pt_jody', { name: 'Channeler Jody', sprite: 'trainer_channeler', ai: 'smart', money: 572,
    party: [{ sp: 'gastly', level: 26 }],
    intro: 'LEAVE... THIS... PLACE...',
    defeat: 'I really must stop doing that.', music: 'battle' });
  tr('pt_tammy', { name: 'Channeler Tammy', sprite: 'trainer_channeler', ai: 'smart', money: 594,
    party: [{ sp: 'haunter', level: 27 }],
    intro: 'THE DEAD DO NOT REST HERE...',
    defeat: 'They do, normally. That is rather the problem.', music: 'battle' });
  tr('pt_karina', { name: 'Channeler Karina', sprite: 'trainer_channeler', ai: 'smart', money: 594,
    party: [{ sp: 'gastly', level: 27 }, { sp: 'haunter', level: 27 }],
    intro: 'SHE IS STILL ANGRY...',
    defeat: 'She has every right to be.', music: 'battle' });

  tr('pt_rocket1', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1150,
    party: [{ sp: 'zubat', level: 25 }, { sp: 'zubat', level: 25 }, { sp: 'golbat', level: 25 }],
    intro: 'This is TEAM ROCKET business. Turn around.',
    defeat: 'Ugh! You are strong!', music: 'battle' });
  tr('pt_rocket2', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1196,
    party: [{ sp: 'koffing', level: 26 }, { sp: 'drowzee', level: 26 }],
    intro: 'Nobody was supposed to get past the ghost.',
    defeat: 'How did you even SEE it?', music: 'battle' });
  tr('pt_rocket3', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1242,
    party: [{ sp: 'zubat', level: 23 }, { sp: 'rattata', level: 23 }, { sp: 'raticate', level: 23 }, { sp: 'zubat', level: 23 }],
    intro: 'The old man stays until we get what we came for.',
    defeat: 'Fine! Take him! He is not worth this.', music: 'battle' });

  tr('r8_stan', { name: 'Gambler Stan', sprite: 'trainer_gambler', ai: 'smart', money: 1040,
    party: [{ sp: 'poliwag', level: 26 }, { sp: 'horsea', level: 26 }],
    intro: 'Double or nothing?',
    defeat: 'Nothing, then. As usual.', music: 'battle' });
  tr('r8_hector', { name: 'Jr. Trainer Hector', sprite: 'trainer_cooltrainerm', ai: 'smart', money: 700,
    party: [{ sp: 'growlithe', level: 27 }, { sp: 'nidorino', level: 27 }],
    intro: 'SAFFRON is shut. You will have to go under, like everyone else.',
    defeat: 'The tunnel entrance is back west.', music: 'battle' });

  // Erika's gym.
  tr('cg_tamia', { name: 'Beauty Tamia', sprite: 'trainer_beauty', ai: 'smart', money: 800,
    party: [{ sp: 'bellsprout', level: 27 }, { sp: 'weepinbell', level: 27 }],
    intro: 'The garden is lovely at this hour. Do try not to trample it.',
    defeat: 'You trampled it.', music: 'battle' });
  tr('cg_lynn', { name: 'Picnicker Lynn', sprite: 'trainer_picnicker', ai: 'smart', money: 560,
    party: [{ sp: 'oddish', level: 28 }, { sp: 'gloom', level: 28 }],
    intro: 'Careful. Everything in here puts you to sleep.',
    defeat: 'Not quite everything, apparently.', music: 'battle' });

  // Team Rocket, Celadon operation.
  tr('gc_rocket', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1288,
    party: [{ sp: 'raticate', level: 28 }, { sp: 'zubat', level: 28 }],
    intro: 'You saw nothing. Understand?',
    defeat: 'I saw nothing either! Nothing!', music: 'battle' });
  tr('rh_grunt1', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1334,
    party: [{ sp: 'grimer', level: 29 }, { sp: 'koffing', level: 29 }],
    intro: 'Nobody comes down here by accident.',
    defeat: 'How did you even find the stairs?', music: 'battle' });
  tr('rh_grunt2', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1380,
    party: [{ sp: 'zubat', level: 30 }, { sp: 'golbat', level: 30 }],
    intro: 'The BOSS is downstairs and he does not like interruptions.',
    defeat: 'Go on then. Interrupt him. See what happens.', music: 'battle' });
  tr('rh_grunt3', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1426,
    party: [{ sp: 'drowzee', level: 30 }, { sp: 'grimer', level: 30 }, { sp: 'koffing', level: 30 }],
    intro: 'This floor is restricted. Very restricted.',
    defeat: 'Evidently not restricted enough.', music: 'battle' });
  tr('rh_grunt4', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1472,
    party: [{ sp: 'raticate', level: 31 }, { sp: 'golbat', level: 31 }],
    intro: 'Last one before the BOSS. Turn back.',
    defeat: 'I did warn you.', music: 'battle' });
  tr('giovanni_hideout', {
    name: 'Giovanni', cls: 'Team Rocket', sprite: 'trainer_giovanni', ai: 'smart', money: 3100,
    party: [{ sp: 'onix', level: 25 }, { sp: 'rhyhorn', level: 24 }, { sp: 'kangaskhan', level: 29 }],
    intro: 'You are standing in my operation.',
    defeat: 'Hm. You are better than the reports said.',
    reward: { flag: 'rh_giovanni', text: 'GIOVANNI walks out, unhurried.' },
    music: 'gymleader'
  });

  // The Fighting Dojo.
  tr('dojo_hideki', { name: 'Black Belt Hideki', sprite: 'trainer_blackbelt', ai: 'smart', money: 774,
    party: [{ sp: 'mankey', level: 31 }, { sp: 'machop', level: 31 }],
    intro: 'The DOJO does not hand out prizes to visitors.',
    defeat: 'Hm. Perhaps to you.', music: 'battle' });
  tr('dojo_mike', { name: 'Black Belt Mike', sprite: 'trainer_blackbelt', ai: 'smart', money: 800,
    party: [{ sp: 'machoke', level: 32 }],
    intro: 'Strength is not the same as force.',
    defeat: 'You had both. Fine.', music: 'battle' });
  tr('dojo_master', {
    name: 'Karate Master', cls: 'Dojo', sprite: 'trainer_blackbelt', ai: 'smart', money: 1287,
    party: [{ sp: 'hitmonlee', level: 37 }, { sp: 'hitmonchan', level: 37 }],
    intro: 'I am the KARATE MASTER. This DOJO was a GYM once. It will be again.',
    defeat: 'Then take one of them. One. Not both.',
    reward: { flag: 'dojo_master', text: 'The MASTER steps aside.' },
    music: 'gymleader'
  });

  // Sabrina's gym.
  tr('sg_johan', { name: 'Psychic Johan', sprite: 'trainer_psychicm', ai: 'smart', money: 900,
    party: [{ sp: 'kadabra', level: 31 }, { sp: 'slowpoke', level: 31 }],
    intro: 'SABRINA already knows how this ends.',
    defeat: 'She did not mention this part.', music: 'battle' });
  tr('sg_tyron', { name: 'Channeler Tyra', sprite: 'trainer_channeler', ai: 'smart', money: 682,
    party: [{ sp: 'haunter', level: 31 }, { sp: 'drowzee', level: 31 }],
    intro: 'You should not have come up here.',
    defeat: 'Go on. She is waiting.', music: 'battle' });

  // Silph Co.
  tr('silph_g1', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1518,
    party: [{ sp: 'koffing', level: 33 }, { sp: 'zubat', level: 33 }],
    intro: 'The lobby is closed. Permanently.',
    defeat: 'Fine, fine! Go up!', music: 'battle' });
  tr('silph_g2', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1564,
    party: [{ sp: 'raticate', level: 34 }, { sp: 'grimer', level: 34 }],
    intro: 'How did you even get past reception?',
    defeat: 'There was nobody ON reception!', music: 'battle' });
  tr('silph_g3', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1610,
    party: [{ sp: 'golbat', level: 34 }, { sp: 'drowzee', level: 34 }],
    intro: 'The BOSS is on the top floor and he is not to be disturbed.',
    defeat: 'You are going to disturb him, are you not.', music: 'battle' });
  tr('silph_g4', { name: 'Rocket Grunt', cls: 'Team Rocket', sprite: 'trainer_rocket', ai: 'smart', money: 1656,
    party: [{ sp: 'weezing', level: 35 }, { sp: 'muk', level: 35 }, { sp: 'golbat', level: 35 }],
    intro: 'This is the last door. I am the last man.',
    defeat: 'Then it is over, is it.', music: 'battle' });
  tr('blue_silph', {
    name: 'Blue', cls: 'Rival', sprite: 'trainer_blue', ai: 'smart', money: 1800,
    party: [
      { sp: 'pidgeot', level: 37 }, { sp: 'growlithe', level: 35 },
      { sp: 'alakazam', level: 35 }, { sp: 'exeggcute', level: 35 },
      { sp: '_starter3', level: 38 }
    ],
    intro: 'You are chasing ROCKET too? Of course you are.',
    defeat: 'Fine. He is upstairs. Try not to die.',
    music: 'battle'
  });
  tr('giovanni_silph', {
    name: 'Giovanni', cls: 'Team Rocket', sprite: 'trainer_giovanni', ai: 'smart', money: 5940,
    party: [
      { sp: 'nidorino', level: 37 }, { sp: 'kangaskhan', level: 35 },
      { sp: 'rhyhorn', level: 37 }, { sp: 'nidoqueen', level: 41 }
    ],
    intro: 'Twice now. You are becoming a scheduling problem.',
    defeat: 'Enough. TEAM ROCKET withdraws.',
    reward: { flag: 'silph_giovanni', text: 'GIOVANNI disbands TEAM ROCKET.' },
    music: 'gymleader'
  });

  // ================================================ starter counter cycle ===
  // Blue always takes the starter that BEATS yours. The whole relationship, in
  // one line of data.
  var COUNTER = { bulbasaur: 'charmander', charmander: 'squirtle', squirtle: 'bulbasaur' };
  var STAGE2 = { bulbasaur: 'ivysaur', charmander: 'charmeleon', squirtle: 'wartortle' };
  var STAGE3 = { bulbasaur: 'venusaur', charmander: 'charizard', squirtle: 'blastoise' };

  G.trainerParty = function (def) {
    var starterKey = G.flags.starter || 'bulbasaur';
    var rivalBase = COUNTER[starterKey] || 'charmander';
    return def.party.map(function (p) {
      var key = p.sp;
      if (key === '_starter') key = rivalBase;
      if (key === '_starter2') key = STAGE2[rivalBase];
      if (key === '_starter3') key = STAGE3[rivalBase];
      return G.makeMon(key, p.level);
    });
  };

  // ============================================== THE SOUTH-EAST (12-15) ===
  // Levels here run 28-34. The south-east is deliberately a grind rather than
  // a gauntlet: nothing on these routes counters you, there is just a great
  // deal of it between one Centre and the next, and the walk back is longer
  // than the walk forward.
  tr('r12_martin', {
    name: 'Martin', cls: 'Fisherman', sprite: 'trainer_fisher', ai: 'basic', money: 464,
    party: [{ sp: 'goldeen', level: 28 }, { sp: 'seaking', level: 29 }],
    intro: 'I have been on this bridge since before you were born.',
    defeat: 'The fish are not biting either.'
  });
  tr('r12_stephen', {
    name: 'Stephen', cls: 'Fisherman', sprite: 'trainer_fisher', ai: 'basic', money: 480,
    party: [{ sp: 'poliwag', level: 28 }, { sp: 'poliwhirl', level: 29 }, { sp: 'tentacool', level: 28 }],
    intro: 'Quiet! You will scare them.',
    defeat: 'Now look what you have done.'
  });
  tr('r12_perry', {
    name: 'Perry', cls: 'Bird Keeper', sprite: 'trainer_birdkeeper', ai: 'basic', money: 544,
    party: [{ sp: 'pidgeotto', level: 29 }, { sp: 'farfetchd', level: 32 }],
    intro: 'My birds range the whole coast. Yours?',
    defeat: 'Fly home, then.'
  });
  tr('r13_perry', {
    name: 'Bruce', cls: 'Bird Keeper', sprite: 'trainer_birdkeeper', ai: 'basic', money: 561,
    party: [{ sp: 'pidgey', level: 29 }, { sp: 'pidgey', level: 29 }, { sp: 'pidgeotto', level: 31 }],
    intro: 'You can see a long way out here. I saw you coming.',
    defeat: 'And I saw that coming too, honestly.'
  });
  tr('r13_lola', {
    name: 'Lola', cls: 'Beauty', sprite: 'trainer_beauty', ai: 'smart', money: 1350,
    party: [{ sp: 'seaking', level: 30 }, { sp: 'seaking', level: 30 }, { sp: 'goldeen', level: 30 }],
    intro: 'Do not get my shoes muddy.',
    defeat: 'Well. That is the afternoon ruined.'
  });
  tr('r13_naomi', {
    name: 'Naomi', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerf', ai: 'smart', money: 1584,
    party: [{ sp: 'nidorina', level: 31 }, { sp: 'nidoqueen', level: 33 }],
    intro: 'Everyone walks this route. Almost nobody finishes it.',
    defeat: 'Then finish it.'
  });
  tr('r13_irwin', {
    name: 'Irwin', cls: 'Juggler', sprite: 'trainer_juggler', ai: 'smart', money: 1024,
    party: [{ sp: 'kadabra', level: 29 }, { sp: 'mrmime', level: 31 }],
    intro: 'Keep your eye on the one that is not moving.',
    defeat: 'Ah. You did.'
  });
  tr('r14_lukas', {
    name: 'Lukas', cls: 'Biker', sprite: 'trainer_biker', ai: 'basic', money: 640,
    party: [{ sp: 'koffing', level: 31 }, { sp: 'grimer', level: 31 }, { sp: 'weezing', level: 33 }],
    intro: 'This is our road. All of it.',
    defeat: 'Take it, then.'
  });
  tr('r14_isaac', {
    name: 'Isaac', cls: 'Biker', sprite: 'trainer_biker', ai: 'basic', money: 620,
    party: [{ sp: 'voltorb', level: 30 }, { sp: 'magneton', level: 32 }],
    intro: 'Nice walk? Must be slow.',
    defeat: 'Whatever.'
  });
  tr('r14_bryce', {
    name: 'Bryce', cls: 'Bird Keeper', sprite: 'trainer_birdkeeper', ai: 'basic', money: 578,
    party: [{ sp: 'spearow', level: 31 }, { sp: 'fearow', level: 34 }],
    intro: 'FEAROW does not come back when I call. It comes back when it wants.',
    defeat: 'See? Gone again.'
  });
  tr('r14_hideo', {
    name: 'Hideo', cls: 'Biker', sprite: 'trainer_biker', ai: 'smart', money: 680,
    party: [{ sp: 'muk', level: 33 }, { sp: 'weezing', level: 33 }],
    intro: 'Everyone on this road is poison. Ask yourself why.',
    defeat: 'Because it works. Usually.'
  });
  tr('r15_chester', {
    name: 'Chester', cls: 'Bird Keeper', sprite: 'trainer_birdkeeper', ai: 'basic', money: 595,
    party: [{ sp: 'pidgeotto', level: 32 }, { sp: 'fearow', level: 33 }],
    intro: 'FUCHSIA is close. So is a very bad afternoon for you.',
    defeat: 'One of those was right.'
  });
  tr('r15_dalton', {
    name: 'Dalton', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerm', ai: 'smart', money: 1680,
    party: [{ sp: 'sandslash', level: 33 }, { sp: 'dugtrio', level: 33 }, { sp: 'nidoking', level: 35 }],
    intro: 'You are two badges off the LEAGUE and I can tell.',
    defeat: 'Better than I thought. Still not enough.'
  });
  tr('r15_grace', {
    name: 'Grace', cls: 'Beauty', sprite: 'trainer_beauty', ai: 'smart', money: 1440,
    party: [{ sp: 'bellsprout', level: 31 }, { sp: 'weepinbell', level: 32 }, { sp: 'victreebel', level: 34 }],
    intro: 'I grew all three of these myself.',
    defeat: 'They will grow back.'
  });

  // ==================================================== FUCHSIA GYM — KOGA ==
  // Every one of these is standing in a dead end. They have been there a
  // while, and the maze means you meet them one at a time, alone, which is
  // exactly how a ninja gym should work.
  tr('fg_nob', {
    name: 'Nob', cls: 'Black Belt', sprite: 'trainer_blackbelt', ai: 'basic', money: 774,
    party: [{ sp: 'hitmonlee', level: 37 }, { sp: 'hitmonchan', level: 37 }],
    intro: 'You found me. Few do.',
    defeat: 'Go on, then. He is at the end.'
  });
  tr('fg_kirk', {
    name: 'Kirk', cls: 'Juggler', sprite: 'trainer_juggler', ai: 'smart', money: 1056,
    party: [{ sp: 'drowzee', level: 33 }, { sp: 'hypno', level: 36 }],
    intro: 'Did you take a wrong turn, or the right one?',
    defeat: 'The right one, apparently.'
  });
  tr('fg_shawn', {
    name: 'Shawn', cls: 'Juggler', sprite: 'trainer_juggler', ai: 'smart', money: 1088,
    party: [{ sp: 'kadabra', level: 34 }, { sp: 'venomoth', level: 36 } ],
    intro: 'The walls here are honest. That is the only thing about this gym that is.',
    defeat: 'Straight on. You cannot miss him.'
  });
  tr('fg_rocky', {
    name: 'Rocky', cls: 'Black Belt', sprite: 'trainer_blackbelt', ai: 'basic', money: 795,
    party: [{ sp: 'machoke', level: 36 }, { sp: 'machamp', level: 38 }],
    intro: 'Dead end. Sorry.',
    defeat: 'Back the way you came.'
  });

  // ================================= CYCLING ROAD AND THE WEST (16-21) =====
  // Levels 28-38. This half of the region assumes SURF, so it assumes you have
  // been to FUCHSIA, so it can stop being polite.
  tr('r16_alex', {
    name: 'Alex', cls: 'Biker', sprite: 'trainer_biker', ai: 'basic', money: 580,
    party: [{ sp: 'koffing', level: 28 }, { sp: 'koffing', level: 28 }, { sp: 'grimer', level: 28 }],
    intro: 'You are on foot. On our road.',
    defeat: 'Fine. Walk.'
  });
  tr('r16_dwayne', {
    name: 'Dwayne', cls: 'Biker', sprite: 'trainer_biker', ai: 'basic', money: 600,
    party: [{ sp: 'voltorb', level: 29 }, { sp: 'voltorb', level: 29 }],
    intro: 'Both of these explode. Just so you know going in.',
    defeat: 'They exploded.'
  });
  tr('cr_charles', {
    name: 'Charles', cls: 'Biker', sprite: 'trainer_biker', ai: 'basic', money: 620,
    party: [{ sp: 'weezing', level: 31 }, { sp: 'muk', level: 31 }],
    intro: 'You cannot stop on this road. Neither can I. Make it quick.',
    defeat: 'Downhill. Always downhill.'
  });
  tr('cr_riley', {
    name: 'Riley', cls: 'Biker', sprite: 'trainer_biker', ai: 'basic', money: 640,
    party: [{ sp: 'raticate', level: 32 }, { sp: 'arbok', level: 33 }],
    intro: 'Everyone comes down this hill. Nobody comes back up it.',
    defeat: 'You will be back. Everyone is.'
  });
  tr('cr_joel', {
    name: 'Joel', cls: 'Biker', sprite: 'trainer_biker', ai: 'smart', money: 660,
    party: [{ sp: 'koffing', level: 31 }, { sp: 'weezing', level: 33 }, { sp: 'koffing', level: 31 }],
    intro: 'Hold your breath.',
    defeat: 'You can breathe now.'
  });
  tr('cr_glenn', {
    name: 'Glenn', cls: 'Biker', sprite: 'trainer_biker', ai: 'smart', money: 680,
    party: [{ sp: 'magneton', level: 33 }, { sp: 'electrode', level: 34 }],
    intro: 'Speed is the only thing that matters here.',
    defeat: 'Faster than me, then.'
  });
  tr('cr_jaren', {
    name: 'Jaren', cls: 'Cue Ball', sprite: 'trainer_cueball', ai: 'smart', money: 720,
    party: [{ sp: 'machoke', level: 34 }, { sp: 'primeape', level: 35 }],
    intro: 'I am the last one on the hill. That is not an accident.',
    defeat: 'Go on. FUCHSIA is at the bottom.'
  });
  tr('r18_jacob', {
    name: 'Jacob', cls: 'Bird Keeper', sprite: 'trainer_birdkeeper', ai: 'basic', money: 612,
    party: [{ sp: 'spearow', level: 33 }, { sp: 'fearow', level: 34 }],
    intro: 'Nothing to do at the bottom of the hill but wait.',
    defeat: 'Back to waiting.'
  });
  tr('r18_wilton', {
    name: 'Wilton', cls: 'Bird Keeper', sprite: 'trainer_birdkeeper', ai: 'basic', money: 630,
    party: [{ sp: 'pidgeotto', level: 34 }, { sp: 'fearow', level: 34 }, { sp: 'pidgey', level: 32 }],
    intro: 'Three birds, one road.',
    defeat: 'One road, no birds.'
  });
  tr('r19_douglas', {
    name: 'Douglas', cls: 'Swimmer', sprite: 'trainer_swimmer', ai: 'basic', money: 592,
    party: [{ sp: 'tentacool', level: 30 }, { sp: 'tentacruel', level: 32 }],
    intro: 'You SURFED all the way out here? Good. Most people do not.',
    defeat: 'Keep going west. It is worth it.'
  });
  tr('r19_denise', {
    name: 'Denise', cls: 'Swimmer', sprite: 'trainer_swimmerf', ai: 'smart', money: 608,
    party: [{ sp: 'shellder', level: 31 }, { sp: 'cloyster', level: 33 }],
    intro: 'There is no land for a very long way in any direction.',
    defeat: 'Mind the currents.'
  });
  tr('r19_matthew', {
    name: 'Matthew', cls: 'Swimmer', sprite: 'trainer_swimmer', ai: 'basic', money: 624,
    party: [{ sp: 'horsea', level: 31 }, { sp: 'seadra', level: 33 }],
    intro: 'Out here you find out how good your POKéMON actually is.',
    defeat: 'Now you know.'
  });
  tr('r20_nicole', {
    name: 'Nicole', cls: 'Swimmer', sprite: 'trainer_swimmerf', ai: 'smart', money: 656,
    party: [{ sp: 'goldeen', level: 32 }, { sp: 'seaking', level: 34 }],
    intro: 'The SEAFOAM caves are cold enough to hurt. Do not go in wet.',
    defeat: 'I did warn you.'
  });
  tr('r20_briana', {
    name: 'Briana', cls: 'Swimmer', sprite: 'trainer_swimmer', ai: 'smart', money: 672,
    party: [{ sp: 'staryu', level: 33 }, { sp: 'starmie', level: 35 }],
    intro: 'CINNABAR is west. Everything else is water.',
    defeat: 'West. Keep going west.'
  });
  tr('r20_axle', {
    name: 'Axle', cls: 'Swimmer', sprite: 'trainer_swimmer', ai: 'basic', money: 640,
    party: [{ sp: 'poliwhirl', level: 33 }, { sp: 'poliwrath', level: 35 }],
    intro: 'This far out, nobody is coming to help either of us.',
    defeat: 'Fair enough.'
  });
  tr('r21_barry', {
    name: 'Barry', cls: 'Swimmer', sprite: 'trainer_swimmer', ai: 'smart', money: 704,
    party: [{ sp: 'tentacruel', level: 35 }, { sp: 'starmie', level: 36 }],
    intro: 'PALLET TOWN is north. You can nearly see it from here.',
    defeat: 'Funny place to end up, going home the long way.'
  });
  tr('r21_ronald', {
    name: 'Ronald', cls: 'Fisherman', sprite: 'trainer_fisher', ai: 'basic', money: 688,
    party: [{ sp: 'magikarp', level: 33 }, { sp: 'gyarados', level: 37 }],
    intro: 'The first one is a joke. The second one is not.',
    defeat: 'Everyone underestimates the first one.'
  });

  // ================================================= POKéMON MANSION =======
  // Scientists who used to work here, and burglars who have worked out that
  // nobody is coming back for any of it.
  tr('mn_braydon', {
    name: 'Braydon', cls: 'Scientist', sprite: 'trainer_scientist', ai: 'smart', money: 1290,
    party: [{ sp: 'magnemite', level: 33 }, { sp: 'magneton', level: 35 }, { sp: 'voltorb', level: 33 }],
    intro: 'You should not be in here. Neither should I.',
    defeat: 'I only came back for the notes.'
  });
  tr('mn_ramon', {
    name: 'Ramon', cls: 'Burglar', sprite: 'trainer_burglar', ai: 'basic', money: 1440,
    party: [{ sp: 'growlithe', level: 34 }, { sp: 'vulpix', level: 34 }],
    intro: 'Place has been empty for years. Finders keepers.',
    defeat: 'There is nothing good left anyway.'
  });
  tr('mn_dalton', {
    name: 'Dalton', cls: 'Burglar', sprite: 'trainer_burglar', ai: 'smart', money: 1476,
    party: [{ sp: 'ponyta', level: 35 }, { sp: 'rapidash', level: 37 }],
    intro: 'Everything in here burns. Have you noticed that?',
    defeat: 'Everything in here already burned once.'
  });
  tr('mn_ivan', {
    name: 'Ivan', cls: 'Scientist', sprite: 'trainer_scientist', ai: 'smart', money: 1330,
    party: [{ sp: 'electrode', level: 35 }, { sp: 'weezing', level: 36 }],
    intro: 'Do not read the journals. I mean it kindly.',
    defeat: 'You are going to read them.'
  });
  tr('mn_kelly', {
    name: 'Kelly', cls: 'Burglar', sprite: 'trainer_burglar', ai: 'smart', money: 1512,
    party: [{ sp: 'charmeleon', level: 36 }, { sp: 'ninetales', level: 38 }],
    intro: 'The basement is the only part still worth robbing.',
    defeat: 'Take the key. I could never get it to open anything.'
  });

  // ================================================ CINNABAR GYM — BLAINE ==
  // One behind each shutter, and each of them has been standing there since
  // the last time somebody got a question wrong.
  tr('bg_erik', {
    name: 'Erik', cls: 'Super Nerd', sprite: 'trainer_supernerd', ai: 'basic', money: 1188,
    party: [{ sp: 'growlithe', level: 38 }, { sp: 'vulpix', level: 38 }],
    intro: 'Wrong! Sorry. I do not make the questions.',
    defeat: 'Next shutter.'
  });
  tr('bg_derek', {
    name: 'Derek', cls: 'Super Nerd', sprite: 'trainer_supernerd', ai: 'smart', money: 1224,
    party: [{ sp: 'ponyta', level: 39 }, { sp: 'charmeleon', level: 39 }],
    intro: 'You could have just known that.',
    defeat: 'Now you do.'
  });
  tr('bg_ramon', {
    name: 'Ramon', cls: 'Burglar', sprite: 'trainer_burglar', ai: 'smart', money: 1656,
    party: [{ sp: 'ninetales', level: 40 }],
    intro: 'I got the last one wrong as well. Twelve years ago.',
    defeat: 'Still here, though.'
  });
  tr('bg_avery', {
    name: 'Avery', cls: 'Super Nerd', sprite: 'trainer_supernerd', ai: 'smart', money: 1260,
    party: [{ sp: 'rapidash', level: 40 }, { sp: 'arcanine', level: 41 }],
    intro: 'Last shutter. He is right behind it.',
    defeat: 'Go on.'
  });

  // ======================================================= VIRIDIAN GYM =====
  // The eighth gym is the first town you ever walked through, and it has been
  // shut the whole game because its LEADER was busy running a criminal
  // organisation out of a department store basement.
  tr('vg_arthur', {
    name: 'Arthur', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerm', ai: 'smart', money: 2196,
    party: [{ sp: 'nidorino', level: 42 }, { sp: 'nidoking', level: 44 }],
    intro: 'He came back. That is all any of us know.',
    defeat: 'Ask him yourself.'
  });
  tr('vg_atsushi', {
    name: 'Atsushi', cls: 'Black Belt', sprite: 'trainer_blackbelt', ai: 'smart', money: 946,
    party: [{ sp: 'machoke', level: 42 }, { sp: 'machamp', level: 44 }],
    intro: 'The GYM reopened last week. No announcement. It was just open.',
    defeat: 'Go on through.'
  });
  tr('vg_samantha', {
    name: 'Samantha', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerf', ai: 'smart', money: 2244,
    party: [{ sp: 'rhyhorn', level: 43 }, { sp: 'dugtrio', level: 43 }, { sp: 'rhydon', level: 45 }],
    intro: 'Everybody says he is finished. Everybody says that about him.',
    defeat: 'He is behind me. He has always been behind me.'
  });
  tr('giovanni_viridian', {
    name: 'Giovanni', cls: 'Leader', sprite: 'trainer_giovanni', ai: 'smart', money: 5049,
    party: [
      { sp: 'rhyhorn', level: 45 }, { sp: 'dugtrio', level: 42 },
      { sp: 'nidoqueen', level: 44 }, { sp: 'nidoking', level: 45 },
      { sp: 'rhydon', level: 50 }
    ],
    intro: 'So. You again. Three times now — the tower, the hideout, and my own front room.',
    defeat: 'Again? And in my own GYM. ...Very well. Take the EARTHBADGE. It is the last one, and it is honestly earned.',
    reward: { badge: 7, flag: 'badge8', text: 'You received the EARTHBADGE!' , tm: 'tm27' },
    music: 'gymleader'
  });

  // ========================================================= VICTORY ROAD ===
  tr('vr_naoko', {
    name: 'Naoko', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerm', ai: 'smart', money: 2352,
    party: [{ sp: 'persian', level: 44 }, { sp: 'ninetales', level: 45 }],
    intro: 'Nobody on this road is here by accident.',
    defeat: 'Keep climbing.'
  });
  tr('vr_george', {
    name: 'George', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerf', ai: 'smart', money: 2400,
    party: [{ sp: 'exeggutor', level: 45 }, { sp: 'kingler', level: 45 }, { sp: 'arcanine', level: 46 }],
    intro: 'Third attempt. The first two do not count. That is what I tell people.',
    defeat: 'Fourth attempt, then.'
  });
  tr('vr_daisuke', {
    name: 'Daisuke', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerm', ai: 'smart', money: 2448,
    party: [{ sp: 'kingler', level: 45 }, { sp: 'tentacruel', level: 46 }, { sp: 'blastoise', level: 47 }],
    intro: 'You will want the boulders. There is no way up without them.',
    defeat: 'Push them where they will not roll back.'
  });
  tr('vr_dawson', {
    name: 'Dawson', cls: 'Poké Maniac', sprite: 'trainer_pokemaniac', ai: 'basic', money: 1908,
    party: [{ sp: 'rhyhorn', level: 45 }, { sp: 'lickitung', level: 45 }, { sp: 'rhydon', level: 47 }],
    intro: 'MOLTRES is up there. On the top floor. I have seen it twice.',
    defeat: 'Twice! And nobody believes me!'
  });
  tr('vr_caroline', {
    name: 'Caroline', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerf', ai: 'smart', money: 2496,
    party: [{ sp: 'dewgong', level: 46 }, { sp: 'exeggutor', level: 46 }, { sp: 'nidoqueen', level: 48 }],
    intro: 'Last one before the door. I have been the last one for six years.',
    defeat: 'Six years, and you are the fourth to get past me. Go on.'
  });

  // ========================================================== ELITE FOUR ====
  // Red/Blue levels, Red/Blue parties. The difficulty of the ELITE FOUR was
  // never in any one of them — it is that there are four, and then a fifth,
  // and you cannot heal between any of them.
  tr('lorelei', {
    name: 'Lorelei', cls: 'Elite Four', sprite: 'trainer_lorelei', ai: 'smart', money: 5544,
    party: [
      { sp: 'dewgong', level: 54 }, { sp: 'cloyster', level: 53 },
      { sp: 'slowbro', level: 54 }, { sp: 'jynx', level: 56 },
      { sp: 'lapras', level: 56 }
    ],
    intro: 'Welcome. No one can best me when it comes to icy POKéMON. Freezing moves are powerful — your POKéMON will be at my mercy when they are frozen solid!',
    defeat: 'You are better than I thought. Go on ahead. You only have three more to face.',
    reward: { flag: 'e4_lorelei' },
    music: 'gymleader'
  });
  tr('bruno', {
    name: 'Bruno', cls: 'Elite Four', sprite: 'trainer_bruno', ai: 'smart', money: 5643,
    party: [
      { sp: 'onix', level: 53 }, { sp: 'hitmonchan', level: 55 },
      { sp: 'hitmonlee', level: 55 }, { sp: 'onix', level: 56 },
      { sp: 'machamp', level: 58 }
    ],
    intro: 'I am BRUNO of the ELITE FOUR. Through rigorous training, people and POKéMON can become stronger without limit. We will grind you down!',
    defeat: 'Why? How could I lose? My POKéMON and I trained for this.',
    reward: { flag: 'e4_bruno' },
    music: 'gymleader'
  });
  tr('agatha', {
    name: 'Agatha', cls: 'Elite Four', sprite: 'trainer_agatha', ai: 'smart', money: 5742,
    party: [
      { sp: 'gengar', level: 56 }, { sp: 'golbat', level: 56 },
      { sp: 'haunter', level: 55 }, { sp: 'arbok', level: 58 },
      { sp: 'gengar', level: 60 }
    ],
    intro: 'I am AGATHA of the ELITE FOUR. OAK talks a great deal about you. That old duff was a good trainer once, and now he is a doting old fool.',
    defeat: 'Oh my! You are something special, child.',
    reward: { flag: 'e4_agatha' },
    music: 'gymleader'
  });
  tr('lance', {
    name: 'Lance', cls: 'Elite Four', sprite: 'trainer_lance', ai: 'smart', money: 6039,
    party: [
      { sp: 'gyarados', level: 58 }, { sp: 'dragonair', level: 56 },
      { sp: 'dragonair', level: 56 }, { sp: 'aerodactyl', level: 60 },
      { sp: 'dragonite', level: 62 }
    ],
    intro: 'I am LANCE, the DRAGON master. There are no DRAGON tamers left but me, and there is a reason for that.',
    defeat: 'That is it, then. I am beaten. But do not get too comfortable — you have one more.',
    reward: { flag: 'e4_lance' },
    music: 'gymleader'
  });
  tr('blue_champion', {
    name: 'Blue', cls: 'Champion', sprite: 'trainer_blue_champ', ai: 'smart', money: 6435,
    party: [
      { sp: 'pidgeot', level: 61 }, { sp: 'alakazam', level: 59 },
      { sp: 'rhydon', level: 61 }, { sp: 'arcanine', level: 61 },
      { sp: 'exeggutor', level: 61 }, { sp: '_starter3', level: 63 }
    ],
    intro: 'Hey. I was here first, and I have been sat in this chair for about eleven minutes.',
    defeat: 'NO! That cannot be! You beat my best. ...You beat my best.',
    reward: { flag: 'e4_champion' },
    music: 'gymleader'
  });

  // ==================================================== HALL OF CHAMPIONS ===
  // Four predecessors and one nobody will name. Each holds one of the things
  // KANTO only has one of — which is the answer to the question the dex asks
  // and never answers: where did the rest of them go.
  tr('champ_wren', {
    name: 'Wren', cls: 'Champion I', sprite: 'trainer_cooltrainerf', ai: 'smart', money: 8000,
    party: [
      { sp: 'nidoqueen', level: 65 }, { sp: 'clefable', level: 65 },
      { sp: 'starmie', level: 66 }, { sp: 'venusaur', level: 68 },
      { sp: 'articuno', level: 70 }
    ],
    intro: 'Six years I held that chair. I lost it on a Tuesday and I have never told anyone to whom.',
    defeat: 'Ah. To you, apparently. That is going to be much easier to say out loud.',
    reward: { flag: 'champ_wren' },
    music: 'gymleader'
  });
  tr('champ_halden', {
    name: 'Halden', cls: 'Champion II', sprite: 'trainer_hiker', ai: 'smart', money: 8400,
    party: [
      { sp: 'golem', level: 66 }, { sp: 'dugtrio', level: 66 },
      { sp: 'rhydon', level: 68 }, { sp: 'machamp', level: 68 },
      { sp: 'zapdos', level: 70 }
    ],
    intro: 'I came up out of the MT. MOON tunnels with a GEODUDE and no plan. Held it two years and went back down.',
    defeat: 'Still the best two years of it. Go on — INES is next, and INES is the problem.',
    reward: { flag: 'champ_halden' },
    music: 'gymleader'
  });
  tr('champ_ines', {
    name: 'Ines', cls: 'Champion III', sprite: 'trainer_psychicf', ai: 'smart', money: 8800,
    party: [
      { sp: 'alakazam', level: 68 }, { sp: 'slowbro', level: 68 },
      { sp: 'exeggutor', level: 69 }, { sp: 'gengar', level: 69 },
      { sp: 'lapras', level: 70 }, { sp: 'moltres', level: 72 }
    ],
    intro: 'Nine years. Not one recorded loss. People find that impressive; I find it tiring.',
    defeat: 'There. Now there is one. Thank you — genuinely.',
    reward: { flag: 'champ_ines' },
    music: 'gymleader'
  });
  tr('champ_corvo', {
    name: 'Corvo', cls: 'Champion IV', sprite: 'trainer_cooltrainerm', ai: 'smart', money: 9200,
    party: [
      { sp: 'dragonite', level: 70 }, { sp: 'gyarados', level: 70 },
      { sp: 'arcanine', level: 70 }, { sp: 'machamp', level: 70 },
      { sp: 'aerodactyl', level: 71 }, { sp: 'mewtwo', level: 74 }
    ],
    intro: 'One afternoon. Shortest reign on record. I have never explained it and I am not going to now.',
    defeat: 'Four hours and eleven minutes, if you must know. I have not wanted it back since.',
    reward: { flag: 'champ_corvo' },
    music: 'gymleader'
  });
  tr('champ_red', {
    name: 'Red', cls: '???', sprite: 'trainer_red', ai: 'smart', money: 10000,
    party: [
      { sp: 'pikachu', level: 78 }, { sp: 'venusaur', level: 77 },
      { sp: 'snorlax', level: 76 }, { sp: 'blastoise', level: 77 },
      { sp: 'charizard', level: 77 }, { sp: 'mew', level: 80 }
    ],
    intro: '...',
    defeat: '...',
    reward: { flag: 'champ_red' },
    music: 'gymleader'
  });

  // ============================== THE ROADS THAT WERE TOO QUIET ============
  // ROUTE 23 is the badge road — Red/Blue lines it with the hardest trainers
  // outside the League itself — and it had none at all. These fill it, plus
  // the approach to ROCK TUNNEL and the two late floors that were running on
  // one trainer each.
  tr('r23_naoko', {
    name: 'Naoko', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerf', ai: 'smart', money: 2640,
    party: [{ sp: 'nidorina', level: 45 }, { sp: 'exeggcute', level: 45 }, { sp: 'nidoqueen', level: 47 }],
    intro: "Seven gates behind you. One to go.",
    defeat: "Then go."
  });
  tr('r23_fidel', {
    name: 'Fidel', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerm', ai: 'smart', money: 2688,
    party: [{ sp: 'kingler', level: 46 }, { sp: 'tentacruel', level: 46 }, { sp: 'blastoise', level: 48 }],
    intro: "Nobody walks this road twice by choice.",
    defeat: "You will, though."
  });
  tr('r23_yuji', {
    name: 'Yuji', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerm', ai: 'smart', money: 2736,
    party: [{ sp: 'sandslash', level: 46 }, { sp: 'dugtrio', level: 46 }, { sp: 'rhydon', level: 48 }],
    intro: "The gates only check your badges. I check everything else.",
    defeat: "Cleared."
  });
  tr('r23_warren', {
    name: 'Warren', cls: 'Bird Keeper', sprite: 'trainer_birdkeeper', ai: 'smart', money: 1080,
    party: [{ sp: 'pidgeot', level: 46 }, { sp: 'fearow', level: 46 }, { sp: 'dodrio', level: 47 }],
    intro: "My birds see the PLATEAU from here. I never have.",
    defeat: "Go and look at it for me."
  });
  tr('r23_mary', {
    name: 'Mary', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerf', ai: 'smart', money: 2784,
    party: [{ sp: 'arcanine', level: 47 }, { sp: 'ninetales', level: 47 }, { sp: 'rapidash', level: 49 }],
    intro: "Last one before the caves. Make it count.",
    defeat: "It counted."
  });
  tr('r10_nob', {
    name: 'Nob', cls: 'Hiker', sprite: 'trainer_hiker', ai: 'basic', money: 792,
    party: [{ sp: 'geodude', level: 22 }, { sp: 'machop', level: 22 }, { sp: 'graveler', level: 24 }],
    intro: "ROCK TUNNEL is pitch black. Have you got FLASH?",
    defeat: "You will need it more than you needed me."
  });
  tr('r10_dana', {
    name: 'Dana', cls: 'Picnicker', sprite: 'trainer_picnicker', ai: 'basic', money: 748,
    party: [{ sp: 'nidorina', level: 23 }, { sp: 'clefairy', level: 23 }],
    intro: "I camp here because the tunnel frightens me.",
    defeat: "It still frightens me."
  });
  tr('vr_edgar', {
    name: 'Edgar', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerm', ai: 'smart', money: 2544,
    party: [{ sp: 'gengar', level: 46 }, { sp: 'golbat', level: 46 }, { sp: 'alakazam', level: 48 }],
    intro: "The exit is up there. So is something with wings.",
    defeat: "You will hear it before you see it."
  });
  tr('vr_tanya', {
    name: 'Tanya', cls: 'Cooltrainer', sprite: 'trainer_cooltrainerf', ai: 'smart', money: 2592,
    party: [{ sp: 'dewgong', level: 47 }, { sp: 'cloyster', level: 47 }, { sp: 'lapras', level: 48 }],
    intro: "I have been beaten on this floor eleven times.",
    defeat: "Twelve."
  });
  tr('mn_stella', {
    name: 'Stella', cls: 'Scientist', sprite: 'trainer_scientist', ai: 'smart', money: 1440,
    party: [{ sp: 'koffing', level: 37 }, { sp: 'weezing', level: 39 }, { sp: 'muk', level: 39 }],
    intro: "The air down here is not good. You can taste it.",
    defeat: "Take the key and go."
  });


  // ================================================ POST-GAME REMATCHES =====
  // Once you are CHAMPION the eight leaders come back at level 58-66 with the
  // fully-evolved lines they never had the budget for the first time. Each
  // keeps their type and their character — Surge is delighted, Sabrina is
  // unsettled, Giovanni is unsurprised — because a rematch that is only a
  // bigger number is not a rematch, it is a chore.
  tr('brock_rematch', {
    name: 'Brock', cls: 'Leader', sprite: 'trainer_brock', ai: 'smart', money: 9000,
    party: [{ sp: 'graveler', level: 58 }, { sp: 'rhyhorn', level: 58 }, { sp: 'omastar', level: 60 }, { sp: 'kabutops', level: 60 }, { sp: 'onix', level: 62 }, { sp: 'rhydon', level: 64 }],
    intro: "You have the badge. That was never the same as beating me at my best.",
    defeat: "It is. It really is. Come back whenever you want the rematch again.",
    reward: { flag: 'rematch_brock' },
    music: 'gymleader'
  });
  tr('misty_rematch', {
    name: 'Misty', cls: 'Leader', sprite: 'trainer_misty', ai: 'smart', money: 9000,
    party: [{ sp: 'golduck', level: 58 }, { sp: 'lapras', level: 60 }, { sp: 'cloyster', level: 60 }, { sp: 'dewgong', level: 60 }, { sp: 'gyarados', level: 62 }, { sp: 'starmie', level: 64 }],
    intro: "CERULEAN is quiet in the winter. I have had time to train.",
    defeat: "Still fast. Still not fast enough, apparently.",
    reward: { flag: 'rematch_misty' },
    music: 'gymleader'
  });
  tr('surge_rematch', {
    name: 'Lt. Surge', cls: 'Leader', sprite: 'trainer_surge', ai: 'smart', money: 9000,
    party: [{ sp: 'electrode', level: 58 }, { sp: 'magneton', level: 60 }, { sp: 'electabuzz', level: 62 }, { sp: 'jolteon', level: 62 }, { sp: 'pikachu', level: 60 }, { sp: 'raichu', level: 64 }],
    intro: "CHAMPION, huh? Good. I have been holding back on everybody else.",
    defeat: "Now THAT was a battle, kid.",
    reward: { flag: 'rematch_surge' },
    music: 'gymleader'
  });
  tr('erika_rematch', {
    name: 'Erika', cls: 'Leader', sprite: 'trainer_erika', ai: 'smart', money: 9000,
    party: [{ sp: 'tangela', level: 58 }, { sp: 'victreebel', level: 60 }, { sp: 'exeggutor', level: 62 }, { sp: 'vileplume', level: 62 }, { sp: 'parasect', level: 58 }, { sp: 'venusaur', level: 64 }],
    intro: "I hope you did not think the flowers were the whole garden.",
    defeat: "A good loss. I sleep better after those.",
    reward: { flag: 'rematch_erika' },
    music: 'gymleader'
  });
  tr('koga_rematch', {
    name: 'Koga', cls: 'Leader', sprite: 'trainer_koga', ai: 'smart', money: 9000,
    party: [{ sp: 'venomoth', level: 60 }, { sp: 'muk', level: 60 }, { sp: 'golbat', level: 60 }, { sp: 'arbok', level: 60 }, { sp: 'tentacruel', level: 62 }, { sp: 'weezing', level: 64 }],
    intro: "You beat a gym. You have not beaten a ninja.",
    defeat: "Now you have. Do not let it go to your head.",
    reward: { flag: 'rematch_koga' },
    music: 'gymleader'
  });
  tr('sabrina_rematch', {
    name: 'Sabrina', cls: 'Leader', sprite: 'trainer_sabrina', ai: 'smart', money: 9000,
    party: [{ sp: 'mrmime', level: 60 }, { sp: 'hypno', level: 60 }, { sp: 'slowbro', level: 62 }, { sp: 'exeggutor', level: 62 }, { sp: 'jynx', level: 60 }, { sp: 'alakazam', level: 65 }],
    intro: "I saw this rematch a long time ago. I did not see the result.",
    defeat: "And now I have. It is a strange feeling, being surprised.",
    reward: { flag: 'rematch_sabrina' },
    music: 'gymleader'
  });
  tr('blaine_rematch', {
    name: 'Blaine', cls: 'Leader', sprite: 'trainer_blaine', ai: 'smart', money: 9000,
    party: [{ sp: 'ninetales', level: 60 }, { sp: 'magmar', level: 60 }, { sp: 'rapidash', level: 62 }, { sp: 'charizard', level: 62 }, { sp: 'flareon', level: 60 }, { sp: 'arcanine', level: 65 }],
    intro: "No quiz this time. You have earned the right to skip to the fire.",
    defeat: "HOO! My POK\u00e9MON are ash. Worth it.",
    reward: { flag: 'rematch_blaine' },
    music: 'gymleader'
  });
  tr('giovanni_rematch', {
    name: 'Giovanni', cls: 'Leader', sprite: 'trainer_giovanni', ai: 'smart', money: 9000,
    party: [{ sp: 'dugtrio', level: 62 }, { sp: 'nidoqueen', level: 62 }, { sp: 'nidoking', level: 62 }, { sp: 'golem', level: 62 }, { sp: 'marowak', level: 60 }, { sp: 'rhydon', level: 66 }],
    intro: "I disbanded them. I did not stop training. Those are different things.",
    defeat: "Twice a leader, twice beaten. I am beginning to think it is not luck.",
    reward: { flag: 'rematch_giovanni' },
    music: 'gymleader'
  });
})();
