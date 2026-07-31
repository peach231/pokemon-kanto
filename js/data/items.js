// pokemon-kanto — items.js
// Items as pure descriptors; one useItem() in battle/menus interprets `kind`.
//   heal   — restore `amount` HP (Infinity = full)
//   cure   — clear the listed statuses
//   revive — revive a fainted POKéMON to `frac` of max HP
//   ball   — capture device, `mod` multiplies the catch rate
//   repel  — suppress weak wild encounters for `steps` steps
//   stone  — evolution stone; G.stoneEvolution decides what it does to a mon
//   escape — leave a cave or dungeon instantly
//   key    — story item, cannot be used from the bag
//
// Gen 1's list and Gen 1's prices: no held items, no berries, no Pokéblocks.
// Kanto's progression is gated almost entirely by KEY ITEMS rather than by
// badges, which is why that section is by far the longest.

(function () {
  // The kinds the ENGINE knows how to interpret. This list exists because the
  // engine once looked for 'orb' while this file said 'ball': every Poke Ball
  // was silently filtered out of the battle bag, nothing crashed, nothing
  // logged, and the game had no catching mechanic at all. tools/check.js now
  // fails if an item declares a kind that is not in here.
  G.ITEM_KINDS = ['heal', 'cure', 'revive', 'ball', 'repel', 'escape',
                  'stone', 'tm', 'key', 'xp'];

  var I = G.ITEMS = {};
  function item(id, name, price, kind, props, desc) {
    I[id] = Object.assign({ id: id, name: name, price: price, kind: kind, desc: desc }, props);
  }

  // -------------------------------------------------------------- healing --
  item('potion',      'Potion',       300,  'heal', { amount: 20 },       'Restores 20 HP.');
  item('superpotion', 'Super Potion', 700,  'heal', { amount: 50 },       'Restores 50 HP.');
  item('hyperpotion', 'Hyper Potion', 1200, 'heal', { amount: 200 },      'Restores 200 HP.');
  item('maxpotion',   'Max Potion',   2500, 'heal', { amount: Infinity }, 'Fully restores HP.');
  item('fullrestore', 'Full Restore', 3000, 'heal',
    { amount: Infinity, statuses: ['brn', 'psn', 'tox', 'par', 'slp', 'frz'] },
    'Fully restores HP and cures any status.');

  // --------------------------------------------------------------- status --
  item('antidote',   'Antidote',     100, 'cure', { statuses: ['psn', 'tox'] }, 'Cures poisoning.');
  item('burnheal',   'Burn Heal',    250, 'cure', { statuses: ['brn'] },        'Cures a burn.');
  item('iceheal',    'Ice Heal',     250, 'cure', { statuses: ['frz'] },        'Thaws out a frozen POKéMON.');
  item('awakening',  'Awakening',    200, 'cure', { statuses: ['slp'] },        'Wakes a sleeping POKéMON.');
  item('parlyzheal', 'Paralyz Heal', 200, 'cure', { statuses: ['par'] },        'Cures paralysis.');
  item('fullheal',   'Full Heal',    600, 'cure',
    { statuses: ['brn', 'psn', 'tox', 'par', 'slp', 'frz'] }, 'Cures any status condition.');

  // -------------------------------------------------------------- revival --
  item('revive',    'Revive',     1500, 'revive', { frac: 0.5 }, 'Revives a fainted POKéMON to half HP.');
  item('maxrevive', 'Max Revive', 4000, 'revive', { frac: 1.0 }, 'Revives a fainted POKéMON to full HP.');

  // ---------------------------------------------------------------- balls --
  item('pokeball',   'Poké Ball',   200,  'ball', { mod: 1.0 }, 'A device for catching wild POKéMON.');
  item('greatball',  'Great Ball',  600,  'ball', { mod: 1.5 }, 'A good ball, with a higher catch rate.');
  item('ultraball',  'Ultra Ball',  1200, 'ball', { mod: 2.0 }, 'An excellent ball, with a high catch rate.');
  item('masterball', 'Master Ball', 0,    'ball', { mod: 255 }, 'The best ball. It never fails.');
  item('safariball', 'Safari Ball', 0,    'ball', { mod: 1.5 }, 'A special ball used only in the SAFARI ZONE.');

  // ------------------------------------------------------------ utilities --
  item('repel',      'Repel',       350, 'repel',  { steps: 100 }, 'Repels weak wild POKéMON for 100 steps.');
  item('superrepel', 'Super Repel', 500, 'repel',  { steps: 200 }, 'Repels weak wild POKéMON for 200 steps.');
  item('maxrepel',   'Max Repel',   700, 'repel',  { steps: 250 }, 'Repels weak wild POKéMON for 250 steps.');
  item('escaperope', 'Escape Rope', 550, 'escape', {},             'Escapes instantly from a cave or dungeon.');
  // One level, instantly. Gen 1 hid these in the places nobody sensible
  // goes, which is the only reason a single level ever felt like a reward.
  item('rarecandy',  'Rare Candy',    0, 'xp',     { amount: 0, levels: 1 },
    'Raises a POKéMON by exactly one level.');

  // The rooftop vending machines. Worthless as healing and worth a TM each
  // to the child standing next to them, which is the strangest exchange rate
  // in Gen 1 and is kept exactly as it was.
  item('freshwater', 'Fresh Water', 200, 'heal', { amount: 50 },  'Restores 50 HP. A rooftop vending machine drink.');
  item('sodapop',    'Soda Pop',    300, 'heal', { amount: 60 },  'Restores 60 HP. Fizzy.');
  item('lemonade',   'Lemonade',    350, 'heal', { amount: 80 },  'Restores 80 HP. Sharper than it looks.');

  // ------------------------------------------------------ evolution stones --
  // Fourteen species evolve by stone. Eevee's three branches are the reason
  // species carry an `evos` ARRAY rather than a single evolution target.
  item('firestone',    'Fire Stone',   2100, 'stone', {}, 'A peculiar stone that radiates heat.');
  item('waterstone',   'Water Stone',  2100, 'stone', {}, 'A peculiar stone the colour of deep water.');
  item('thunderstone', 'Thunderstone', 2100, 'stone', {}, 'A peculiar stone with a thunderbolt pattern.');
  item('leafstone',    'Leaf Stone',   2100, 'stone', {}, 'A peculiar stone with a leaf pattern.');
  item('moonstone',    'Moon Stone',   0,    'stone', {}, 'A stone found in MT. MOON. It glows faintly.');

  // ------------------------------------------------------------ key items ---
  item('parcel',      "Oak's Parcel", 0, 'key', {}, 'A parcel from the VIRIDIAN MART, addressed to PROF. OAK.');
  item('pokedex',     'Pokédex',      0, 'key', {}, "PROF. OAK's encyclopaedia. It fills itself in as you go.");
  item('townmap',     'Town Map',     0, 'key', {}, 'A map of the whole KANTO region.');
  item('bicycle',     'Bicycle',      0, 'key', {}, 'A folding bicycle. Far faster than walking.');
  item('bikevoucher', 'Bike Voucher', 0, 'key', {}, 'Redeemable for one BICYCLE at the CERULEAN shop.');
  item('ssticket',    'S.S. Ticket',  0, 'key', {}, 'A boarding pass for the S.S. ANNE.');
  item('oldrod',      'Old Rod',      0, 'key', {}, 'A cheap fishing rod. It only ever catches MAGIKARP.');
  item('goodrod',     'Good Rod',     0, 'key', {}, 'A decent fishing rod.');
  item('superrod',    'Super Rod',    0, 'key', {}, 'The best fishing rod there is.');
  item('itemfinder',  'Item Finder',  0, 'key', {}, 'Detects items buried nearby.');
  item('cardkey',     'Card Key',     0, 'key', {}, 'A magnetic card that opens the doors in SILPH CO.');
  item('liftkey',     'Lift Key',     0, 'key', {}, "The key to the lift in TEAM ROCKET's hideout.");
  item('silphscope',  'Silph Scope',  0, 'key', {}, 'Reveals what is really inside a POKéMON TOWER ghost.');
  item('pokeflute',   'Poké Flute',   0, 'key', {}, 'Its sound wakes any POKéMON, however deeply asleep.');
  item('secretkey',   'Secret Key',   0, 'key', {}, "The key to CINNABAR ISLAND's gym.");
  item('goldteeth',   'Gold Teeth',   0, 'key', {}, 'Someone in the SAFARI ZONE is missing these.');
  item('domefossil',  'Dome Fossil',  0, 'key', {}, 'A fossilised shell. Something lived in it, once.');
  item('helixfossil', 'Helix Fossil', 0, 'key', {}, 'A fossilised spiral shell. Very, very old.');
  item('oldamber',    'Old Amber',    0, 'key', {}, 'Amber with something ancient sealed inside it.');
  item('coincase',    'Coin Case',    0, 'key', {}, 'A case for GAME CORNER coins.');

  // -------------------------------------------------------- TMs and HMs ----
  // Built from the generated TM table so the two can never drift apart. A TM
  // is consumed on use — which is why the Game Corner's TM prizes and the ones
  // lying on the floor of Silph Co. are worth crossing a city for. HMs are
  // permanent, and their price is a party slot rather than money.
  //
  // Prices follow the Gen 1 mart lists: the four TMs actually sold in Celadon's
  // department store are priced, and the rest are unsellable finds.
  var TM_PRICE = { tm09: 2000, tm10: 4000, tm11: 3000, tm17: 2000, tm18: 3000,
                   tm20: 1000, tm22: 3000, tm31: 4000, tm32: 1000, tm33: 4000,
                   tm34: 4000, tm40: 2000, tm44: 3000 };
  for (var tid in G.TM_MOVES) {
    var mv = G.MOVES[G.TM_MOVES[tid]];
    var isHm = tid.indexOf('hm') === 0;
    item(tid, tid.toUpperCase(), TM_PRICE[tid] || 0, 'tm', { move: G.TM_MOVES[tid], hm: isHm },
      (isHm ? 'HM' : 'TM') + ' — teaches ' + mv.name.toUpperCase() + '. ' +
      (isHm ? 'Reusable, and the move cannot be forgotten.' : 'It breaks after one use.'));
  }
})();
