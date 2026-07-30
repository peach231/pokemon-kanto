// Pokéram — items.js
// Items as pure descriptors; one useItem() in battle/menus interprets `kind`.
//   heal    — restore `amount` HP
//   cure    — clear listed statuses
//   revive  — revive fainted to frac of max HP
//   orb     — capture device, `mod` multiplies catch rate
//   repel   — suppress weak wild encounters for `steps` steps
//   key     — story item, not usable

(function () {
  var I = G.ITEMS = {};
  function item(id, name, price, kind, props, desc) {
    I[id] = Object.assign({ id: id, name: name, price: price, kind: kind, desc: desc }, props);
  }

  item('potion',     'Potion',      200,  'heal',   { amount: 20 },  'Restores 20 HP.');
  item('superpotion','Super Potion',600,  'heal',   { amount: 60 },  'Restores 60 HP.');
  item('hyperpotion','Hyper Potion',1500, 'heal',   { amount: 150 }, 'Restores 150 HP.');
  item('cureall',    'Cure-All',    400,  'cure',   { statuses: ['brn', 'psn', 'par', 'slp'] }, 'Heals any status condition.');
  item('revivedust', 'Revive Dust', 900,  'revive', { frac: 0.5 },   'Revives a fainted creature to half HP.');
  item('tameorb',    'Tame Orb',    150,  'orb',    { mod: 1.0 },    'A standard capture orb.');
  item('greatorb',   'Great Orb',   500,  'orb',    { mod: 1.5 },    'A high-grade capture orb. 1.5x catch rate.');
  item('ultraorb',   'Ultra Orb',   1200, 'orb',    { mod: 2.0 },    'A top-grade capture orb. 2x catch rate.');
  item('netorb',     'Net Orb',     800,  'orb',    { mod: 1.0, special: 'net' },  '3.5x on Water- and Bug-types.');
  item('diveorb',    'Dive Orb',    800,  'orb',    { mod: 1.0, special: 'dive' }, '3.5x while swimming on the water.');
  item('nestorb',    'Nest Orb',    700,  'orb',    { mod: 1.0, special: 'nest' }, 'Better against lower-level wild Pokémon.');
  item('timerorb',   'Timer Orb',   800,  'orb',    { mod: 1.0, special: 'timer' },'Stronger the longer the battle lasts.');
  item('mythorb',    'Myth Orb',    0,    'orb',    { mod: 255 },    'A legendary orb said never to fail.');
  item('repelmist',  'Repel Mist',  300,  'repel',  { steps: 100 },  'Repels weak wild creatures for 100 steps.');
  item('snackbar',   'Snack Bar',   100,  'heal',   { amount: 10 },  'A chewy snack. Restores 10 HP.');
  // exp candies — feed one to a chosen party creature for instant EXP
  item('candyxs',    'XS Exp Candy', 30,   'xp', { amount: 100 },   'A tiny candy. A little EXP for one creature.');
  item('candys',     'S Exp Candy',  120,  'xp', { amount: 800 },   'A small candy. Some EXP for one creature.');
  item('candym',     'M Exp Candy',  500,  'xp', { amount: 3000 },  'A candy. A good chunk of EXP for one creature.');
  item('candyl',     'L Exp Candy',  1500, 'xp', { amount: 10000 }, 'A big candy. A lot of EXP for one creature.');
  // gear — held in the bag; behavior handled in the overworld, not via "use".
  item('fishingrod', 'Fishing Rod', 1000, 'gear', { gear: 'rod' },    'Face water and press Z to fish for wild Pokémon.');
  item('skates',     'Skates',      1200, 'gear', { gear: 'skates' }, 'Roll at double speed automatically while you have these.');
})();
