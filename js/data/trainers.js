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
    reward: { badge: 0, flag: 'badge1', text: 'You received the BOULDERBADGE!' },
    music: 'gymleader'
  });
  tr('misty', {
    name: 'Misty', cls: 'Leader', sprite: 'trainer_misty', ai: 'smart', money: 2079,
    party: [{ sp: 'staryu', level: 18 }, { sp: 'starmie', level: 21 }],
    intro: "I'm MISTY of CERULEAN GYM. My policy is an all-out offensive with WATER POKéMON!",
    defeat: 'You are too much! All right, take the CASCADEBADGE.',
    reward: { badge: 1, flag: 'badge2', text: 'You received the CASCADEBADGE!' },
    music: 'gymleader'
  });
  tr('surge', {
    name: 'Lt. Surge', cls: 'Leader', sprite: 'trainer_surge', ai: 'smart', money: 2277,
    party: [{ sp: 'voltorb', level: 21 }, { sp: 'pikachu', level: 18 }, { sp: 'raichu', level: 24 }],
    intro: 'Hey, kid! What do you think you are doing here? You will not live long in combat!',
    defeat: 'Whoa! You are the real deal, kid! Take the THUNDERBADGE!',
    reward: { badge: 2, flag: 'badge3', text: 'You received the THUNDERBADGE!' },
    music: 'gymleader'
  });
  tr('erika', {
    name: 'Erika', cls: 'Leader', sprite: 'trainer_erika', ai: 'smart', money: 2871,
    party: [{ sp: 'victreebel', level: 29 }, { sp: 'tangela', level: 24 }, { sp: 'vileplume', level: 29 }],
    intro: "Hello. Lovely weather, is it not? I am ERIKA, of GRASS POKéMON.",
    defeat: 'Oh! I concede defeat. Please, take the RAINBOWBADGE.',
    reward: { badge: 3, flag: 'badge4', text: 'You received the RAINBOWBADGE!' },
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
    reward: { badge: 4, flag: 'badge5', text: 'You received the SOULBADGE!' },
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
    reward: { badge: 5, flag: 'badge6', text: 'You received the MARSHBADGE!' },
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
    reward: { badge: 6, flag: 'badge7', text: 'You received the VOLCANOBADGE!' },
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
})();
