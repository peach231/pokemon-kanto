// pokemon-kanto — tms_house.js
// House rules layered on top of the generated TM/HM compatibility table.
//
// THIS FILE IS NOT GENERATED, and that is the whole point of it. tms.js is
// written by tools/gen_data.js and widened by tools/merge_frlg_tmhm.js, and
// carries a "do not hand-edit" banner it means — anything typed into it
// disappears the next time either tool runs. Deliberate departures from the
// source ROMs live here instead, where regeneration cannot reach them.
//
// Every entry needs a reason, and tools/verify_against_pokered.js reads this
// file so an entry is treated as a decision rather than as drift. Without that,
// the verifier would report each one as data that "neither pokered nor FireRed
// allows", which is true, and is exactly what it should say about anything in
// here that nobody chose on purpose.

(function () {
  G.TM_HOUSE_RULES = {
    // Asked for directly. It is not Gen 1 and it is not FireRed: CHARIZARD
    // learns SOLARBEAM from Diamond/Pearl onwards, and in Red/Blue, FireRed
    // and Emerald alike it does not. Red/Blue gives SOLARBEAM to 26 species
    // and FireRed to 124, and CHARIZARD is in neither list.
    charizard: { add: ['tm22'], why: 'Gen 4 onwards allows it; asked for by name.' }
  };

  // Apply, in place, on top of whatever the generator produced. Adds only —
  // taking a machine away would make a species worse than both source games,
  // and nothing here has ever wanted that.
  G.TM_HOUSE_RULES_APPLIED = [];
  for (var sp in G.TM_HOUSE_RULES) {
    if (!G.SPECIES[sp]) continue;                 // a species that no longer exists
    var rule = G.TM_HOUSE_RULES[sp];
    var list = G.TM_COMPAT[sp] || (G.TM_COMPAT[sp] = []);
    for (var i = 0; i < (rule.add || []).length; i++) {
      var id = rule.add[i];
      if (!G.TM_MOVES[id]) continue;              // a machine that does not exist
      if (list.indexOf(id) !== -1) continue;      // the source games caught up
      list.push(id);
      G.TM_HOUSE_RULES_APPLIED.push(sp + ' ' + id);
    }
    list.sort(function (a, b) {
      var rank = function (x) { return (x[0] === 'h' ? 100 : 0) + parseInt(x.slice(2), 10); };
      return rank(a) - rank(b);
    });
  }
})();
