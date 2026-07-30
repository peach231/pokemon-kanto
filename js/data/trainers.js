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
