// pokemon-kanto — sprites_config.js
// WHERE the engine loads art from. Nothing copyrighted is committed to this
// repo; every sprite streams at runtime from a public CDN, and every source
// degrades to something sensible if it can't be reached.
//
//   battlers   PokeAPI's Gen-5 ANIMATED set (jsDelivr)   -> numbered placeholder
//   portraits  Pokemon Showdown's trainer library         -> hand-drawn baked art
//   overworld  pret/pokefirered object-event sheets       -> hand-drawn baked art
//
// Local files under assets/sprites/ always win if you drop them in.

(function () {
  // ----------------------------------------------------------------------
  // CREATURE BATTLERS, keyed by national dex number.
  //
  // The Gen-5 (Black/White) animated set is the best-looking option that
  // covers all 151 — the creatures idle, breathe and bob rather than standing
  // as flat cutouts. They are GIFs, so gfx.js keeps them as LIVE images and
  // re-blits them each frame (see _fitLive); anything baked to a canvas would
  // freeze on frame 0.
  //
  // Two documented alternatives, if you want a different look — swap the block
  // wholesale, they are drop-in:
  //
  //   FireRed/LeafGreen (static, GBA-era, period-correct for Kanto):
  //     remoteBase: '.../versions/generation-iii/firered-leafgreen/',
  //     remoteFront: '{dex}.png', remoteBack: 'back/{dex}.png', box: 64
  //
  //   Red/Blue (static, original Game Boy, 2-bit and off-model):
  //     remoteBase: '.../versions/generation-i/red-blue/',
  //     remoteFront: 'transparent/{dex}.png', remoteBack: 'back/{dex}.png', box: 56
  var CDN = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/';

  G.SPRITE_CFG = {
    // --- your own local files (optional, and preferred if preferRemote is off) ---
    localBase:  'assets/sprites/pokemon/',
    localFront: 'front/{dex}.png',
    localBack:  'back/{dex}.png',
    localIcon:  'icon/{dex}.png',
    localShiny: 'shiny/{dex}.png',

    // --- Gen-5 animated set ---
    remoteBase:  CDN + 'versions/generation-v/black-white/animated/',
    remoteFront: '{dex}.gif',
    remoteBack:  'back/{dex}.gif',        // genuine rear views, not mirrored fronts
    remoteIcon:  '{dex}.gif',
    remoteShiny: 'shiny/{dex}.gif',       // lazy-loaded the first time a shiny shows

    preferRemote: true,
    pad: 0,                // PokeAPI uses unpadded ids
    box: 80,               // Gen-5 battlers are up to 96px; 80 keeps them in frame
    crossOrigin: 'anonymous'   // jsDelivr sends CORS headers
  };

  // Candidate URLs for a creature sprite (front|back|icon|shiny), in priority order.
  G.spriteUrl = function (which, dexId) {
    var cfg = G.SPRITE_CFG;
    var dex = String(dexId);
    if (cfg.pad > 0) while (dex.length < cfg.pad) dex = '0' + dex;
    var cap = which.charAt(0).toUpperCase() + which.slice(1);
    var localTpl = cfg['local' + cap] || cfg.localFront;
    var remoteTpl = cfg['remote' + cap] || cfg.remoteFront;
    var urls = [];
    function add(base, tpl) { if (base && tpl) urls.push(base + tpl.replace('{dex}', dex)); }
    if (cfg.preferRemote) { add(cfg.remoteBase, remoteTpl); add(cfg.localBase, localTpl); }
    else { add(cfg.localBase, localTpl); add(cfg.remoteBase, remoteTpl); }
    return urls;
  };

  // ----------------------------------------------------------------------
  // TRAINER BATTLE PORTRAITS. Showdown hosts the FireRed/LeafGreen trainer set,
  // which is the right era for Kanto. Keys are the G.ART names battle.js uses.
  //
  // This host does not send CORS headers, so crossOrigin is deliberately left
  // off: the images still load and draw, only the optional transparent-margin
  // trim is skipped — and Showdown's sprites are already tightly framed.
  G.TRAINER_CFG = {
    localBase:  'assets/sprites/trainers/',
    localFile:  '{key}.png',
    remoteBase: 'https://play.pokemonshowdown.com/sprites/trainers/',
    remoteFile: '{name}.png',
    preferRemote: true,
    // Every entry is the '-gen3' variant where one exists — that is Showdown's
    // FireRed/LeafGreen art, the same era and pixel style as the overworld
    // sheets below, so portraits and map sprites read as one consistent set.
    // Every name here is verified to resolve; a typo would silently fall back
    // to the engine's hand-drawn Hoenn art, which is worse than a placeholder.
    keyMap: {
      // --- the cast ---
      trainer_oak:       'oak-gen3',
      trainer_blue:      'blue-gen3',
      trainer_blue_champ:'blue-gen3champion',
      trainer_red:       'red-gen3',
      trainer_leaf:      'leaf-gen3',
      trainer_giovanni:  'giovanni-gen3',
      trainer_rocket:    'rocketgrunt',
      trainer_rocket_f:  'rocketgruntf',

      // --- gym leaders, in badge order ---
      trainer_brock:     'brock-gen3',
      trainer_misty:     'misty-gen3',
      trainer_surge:     'ltsurge-gen3',
      trainer_erika:     'erika-gen3',
      trainer_koga:      'koga-gen3',
      trainer_sabrina:   'sabrina-gen3',
      trainer_blaine:    'blaine-gen3',

      // --- Elite Four ---
      trainer_lorelei:   'lorelei-gen3',
      trainer_bruno:     'bruno-gen3',
      trainer_agatha:    'agatha-gen3',
      trainer_lance:     'lance-gen3',

      // --- Gen 1 trainer classes ---
      trainer_youngster:   'youngster-gen3',
      trainer_bugcatcher:  'bugcatcher-gen3',
      trainer_lass:        'lass-gen3',
      trainer_hiker:       'hiker-gen3',
      trainer_fisher:      'fisherman-gen3',
      trainer_sailor:      'sailor-gen3',
      trainer_gambler:     'gambler',
      trainer_biker:       'biker-gen3',
      trainer_burglar:     'burglar-gen3',
      trainer_engineer:    'engineer-gen3',
      trainer_juggler:     'juggler-gen3',
      trainer_swimmer:     'swimmerm-gen3',
      trainer_swimmerf:    'swimmerf-gen3',
      trainer_beauty:      'beauty-gen3',
      trainer_scientist:   'scientist-gen3',
      trainer_blackbelt:   'blackbelt-gen3',
      trainer_channeler:   'channeler-gen3',
      trainer_psychicm:    'psychic-gen3',
      trainer_psychicf:    'psychicf-gen3',
      trainer_rocker:      'rocker-gen3',
      trainer_cueball:     'cueball-gen3',
      trainer_tamer:       'tamer-gen3',
      trainer_birdkeeper:  'birdkeeper-gen3',
      trainer_pokemaniac:  'pokemaniac-gen3',
      trainer_supernerd:   'supernerd-gen3',
      trainer_camper:      'camper-gen3',
      trainer_picnicker:   'picnicker-gen3',
      trainer_cooltrainerm:'acetrainer-gen3',
      trainer_cooltrainerf:'acetrainerf-gen3',
      trainer_gentleman:   'gentleman-gen3'
    },
    box: 64,
    crossOrigin: ''
  };

  G.trainerSpriteUrl = function (key) {
    var cfg = G.TRAINER_CFG, urls = [];
    var name = (cfg.keyMap && cfg.keyMap[key]) || null;
    function addRemote() { if (cfg.remoteBase && name) urls.push(cfg.remoteBase + (cfg.remoteFile || '{name}.png').replace('{name}', name)); }
    function addLocal() { if (cfg.localBase) urls.push(cfg.localBase + (cfg.localFile || '{key}.png').replace('{key}', key)); }
    if (cfg.preferRemote) { addRemote(); addLocal(); } else { addLocal(); addRemote(); }
    return urls;
  };

  // ----------------------------------------------------------------------
  // OVERWORLD WALKING SPRITES — the little map characters.
  //
  // Source is pret/pokefirered's object-event sheets, which is the complete
  // Kanto cast: Oak, all eight leaders, the Elite Four, Rocket grunts, Bill,
  // Mr. Fuji, and every Gen 1 NPC class. Because that set is complete, NOTHING
  // here renders as a blank placeholder.
  //
  // Sheet layout is 144x32 — nine 16x32 frames: idle [down, up, left], then two
  // walk strides per direction. Stationary characters (gym leaders, Oak) ship
  // only the three idle frames at 48x32; gfx.js fills their stride slots from
  // the matching idle rather than leaving holes.
  //
  // Left-hand keys are the engine's ch_<name>_* sprite names used by maps.
  G.OVERWORLD_CFG = {
    remoteBase: 'https://cdn.jsdelivr.net/gh/pret/pokefirered@master/graphics/object_events/pics/people/',
    sheets: {
      // --- story characters ---
      oak:        'prof_oak',
      blue:       'blue',
      mom:        'mom',
      bill:       'bill',
      daisy:      'daisy',
      mrfuji:     'mr_fuji',
      giovanni:   'giovanni',
      rocket:     'rocket_m',
      rocketf:    'rocket_f',

      // --- gym leaders ---
      brock:      'brock',
      misty:      'misty',
      surge:      'lt_surge',
      erika:      'erika',
      koga:       'koga',
      sabrina:    'sabrina',
      blaine:     'blaine',

      // --- Elite Four ---
      lorelei:    'lorelei',
      bruno:      'bruno',
      agatha:     'agatha',
      lance:      'lance',

      // --- trainer / townsfolk classes ---
      youngster:  'youngster',
      bugcatcher: 'bug_catcher',
      lass:       'lass',
      hiker:      'hiker',
      fisher:     'fisher',
      sailor:     'sailor',
      scientist:  'scientist',
      channeler:  'channeler',
      blackbelt:  'black_belt',
      biker:      'biker',
      rocker:     'rocker',
      camper:     'camper',
      picnicker:  'picnicker',
      pokemaniac: 'poke_maniac',
      swimmer:    'swimmer_m_land',
      swimmerf:   'swimmer_f_land',
      cooltrainerm: 'cooltrainer_m',
      cooltrainerf: 'cooltrainer_f',
      beauty:     'beauty',
      gentleman:  'gentleman',
      // No gambler sheet exists in pokefirered; the gentleman reads correctly
      // for a man in a waistcoat losing money in a casino.
      gambler:    'gentleman',
      richboy:    'rich_boy',
      policeman:  'policeman',
      clerk:      'clerk',
      nurse:      'nurse',
      gymguy:     'gym_guy',
      chef:       'chef',
      captain:    'captain',
      workerm:    'worker_m',
      workerf:    'worker_f',
      littleboy:  'little_boy',
      littlegirl: 'little_girl',
      oldman:     'old_man_1',
      oldwoman:   'old_woman',
      fatman:     'fat_man',
      baldingman: 'balding_man',
      man:        'man',
      woman:      'woman_1',
      woman2:     'woman_2',
      woman3:     'woman_3',
      boy:        'boy',
      tuberf:     'tuber_f'
    },
    frameW: 16, frameH: 32,       // source frame size on the sheet
    boxW: 16, boxH: 24,           // the engine's overworld slot
    crossOrigin: 'anonymous'
  };

  // The player's BATTLE back sprite. FireRed's back pics are 64x320 — five
  // 64x64 throw frames; we use frame 0.
  G.PLAYER_BACK_CFG = {
    backBase: 'https://cdn.jsdelivr.net/gh/pret/pokefirered@master/graphics/trainers/back_pics/',
    frameW: 64, frameH: 64,
    crossOrigin: 'anonymous'
  };

  // ----------------------------------------------------------------------
  // Playable characters. Gen 1 shipped one protagonist; FireRed added Leaf.
  // Both are the real FireRed designs — no recolours, so each is its own
  // artwork rather than a palette swap of the other.
  G.CHARACTERS = [
    { key: 'red',  name: 'Red',  kind: 'Boy',  blurb: 'The cap, the jacket, and a very long walk ahead.',
      sheet: 'red_normal',   back: 'red_back_pic',  recolor: null },
    { key: 'leaf', name: 'Leaf', kind: 'Girl', blurb: 'Sun hat on, and already halfway out the door.',
      sheet: 'green_normal', back: 'leaf_back_pic', recolor: null }
  ];

  G.applyCharacter = function (key) {
    var c = null, list = G.CHARACTERS || [];
    for (var i = 0; i < list.length; i++) if (list[i].key === key) { c = list[i]; break; }
    if (!c) c = list[0];
    if (c && G.gfx && G.gfx.loadCharacter) G.gfx.loadCharacter(c);
  };

  // ----------------------------------------------------------------------
  // CRIES. Showdown hosts one mp3 per species, keyed by lowercase name.
  // Played on send-out and on faint; silently skipped if the fetch fails.
  G.CRY_CFG = {
    base: 'https://play.pokemonshowdown.com/audio/cries/',
    ext: '.mp3',
    volume: 0.35
  };

  G.cryUrl = function (speciesKey) {
    if (!G.CRY_CFG.base) return null;
    // Showdown uses plain lowercase names: nidoranm -> nidoranm, mrmime -> mrmime.
    return G.CRY_CFG.base + speciesKey + G.CRY_CFG.ext;
  };
})();
