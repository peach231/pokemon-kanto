// pokemon-kanto — badges.js
// The eight KANTO badges: who hands each one over, where, and what it lets you
// do afterwards.
//
// The facts were already in the game three times over — the leader's reward
// flag in trainers.js, the badge NAME in FIELD_MOVES, the city in field.js's
// BADGE_FROM — and never in one place a screen could read. tools/check.js
// holds this table against all three, so it cannot drift away from them.

(function () {
  G.BADGES = [
    { key: 'boulder', name: 'BOULDERBADGE', flag: 'badge1', leader: 'BROCK',
      city: 'PEWTER CITY', gym: 'pewtergym', type: 'rock',
      grants: 'Lets a POKéMON use FLASH outside battle.' },
    { key: 'cascade', name: 'CASCADEBADGE', flag: 'badge2', leader: 'MISTY',
      city: 'CERULEAN CITY', gym: 'ceruleangym', type: 'water',
      grants: 'Lets a POKéMON use CUT outside battle.' },
    { key: 'thunder', name: 'THUNDERBADGE', flag: 'badge3', leader: 'LT. SURGE',
      city: 'VERMILION CITY', gym: 'vermiliongym', type: 'electric',
      grants: 'Lets a POKéMON use FLY outside battle.' },
    { key: 'rainbow', name: 'RAINBOWBADGE', flag: 'badge4', leader: 'ERIKA',
      city: 'CELADON CITY', gym: 'celadongym', type: 'grass',
      grants: 'Lets a POKéMON use STRENGTH outside battle.' },
    { key: 'soul', name: 'SOULBADGE', flag: 'badge5', leader: 'KOGA',
      city: 'FUCHSIA CITY', gym: 'fuchsiagym', type: 'poison',
      grants: 'Lets a POKéMON use SURF outside battle.' },
    { key: 'marsh', name: 'MARSHBADGE', flag: 'badge6', leader: 'SABRINA',
      city: 'SAFFRON CITY', gym: 'saffrongym', type: 'psychic',
      grants: 'Traded POKéMON up to Lv70 will obey you.' },
    { key: 'volcano', name: 'VOLCANOBADGE', flag: 'badge7', leader: 'BLAINE',
      city: 'CINNABAR ISLAND', gym: 'cinnabargym', type: 'fire',
      grants: 'Traded POKéMON of any level will obey you.' },
    { key: 'earth', name: 'EARTHBADGE', flag: 'badge8', leader: 'GIOVANNI',
      city: 'VIRIDIAN CITY', gym: 'viridiangym', type: 'ground',
      grants: 'Opens VICTORY ROAD, and the LEAGUE beyond it.' }
  ];

  G.badgeCount = function () {
    var n = 0;
    for (var i = 0; i < G.BADGES.length; i++) if (G.hasBadge(i)) n++;
    return n;
  };

  // Two records of the same fact: the badges array the trainer card counts, and
  // the story flag everything else gates on. A leader sets both, so either
  // answers the question — but a save from before a flag existed, or a debug
  // hash that sets one and not the other, would disagree. Believe whichever
  // says yes.
  G.hasBadge = function (i) {
    var b = G.BADGES[i];
    return !!(b && ((G.player.badges && G.player.badges[i]) || G.flags[b.flag]));
  };
})();
