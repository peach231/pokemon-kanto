// pokemon-gen3 — sprites_config.js
// Configures WHERE the engine loads each creature sprite from, by NATIONAL DEX
// NUMBER. No art is bundled in this repo. At boot the loader requests an image
// per species and falls back to a numbered placeholder if it can't be fetched.
//
// Two sources, tried in order (preferRemote decides which is first):
//   - LOCAL : files you drop in assets/sprites/pokemon/ (front/<dex>.png, ...)
//   - REMOTE: a public sprite database URL (default below)
//
// DEFAULT remote source: the PokeAPI sprite set (Gen 3 / Emerald front sprites)
// served via the jsDelivr CDN, keyed by national dex number. These are official,
// copyrighted creature designs hosted by the community — using them is your
// choice. To disable remote loading, set `remoteBase: ''` (then it uses your
// local files, or placeholders).

(function () {
  G.SPRITE_CFG = {
    // --- your own local files (optional) ---
    localBase:  'assets/sprites/pokemon/',
    localFront: 'front/{dex}.png',
    localBack:  'back/{dex}.png',
    localIcon:  'icon/{dex}.png',
    localShiny: 'shiny/{dex}.png',

    // --- public remote source (Gen 3 Emerald sprites via jsDelivr CDN) ---
    remoteBase:  'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/versions/generation-iii/emerald/',
    remoteFront: '{dex}.png',
    remoteBack:  '../ruby-sapphire/back/{dex}.png',   // Emerald set has no backs; borrow the same-era Ruby/Sapphire backs (real rear views, matching art generation) — jsDelivr resolves the '..'
    remoteIcon:  '{dex}.png',
    remoteShiny: 'shiny/{dex}.png',  // shiny variant (lazy-loaded on demand)

    preferRemote: true,   // true => try the remote source first, local as fallback

    pad: 0,               // zero-pad {dex} to N digits (PokeAPI uses unpadded ids, so 0)
    box: 64,              // sprite box; Gen 3 battlers are 64x64
    crossOrigin: 'anonymous'  // remote host must send CORS headers (jsDelivr does)
  };

  // ----------------------------------------------------------------------
  // TRAINER + player sprites (battle portraits). Same idea as creatures: the
  // engine ships hand-drawn baked art (always the fallback), but if you supply
  // a real image per key it is loaded at runtime and drawn instead. NO trainer
  // art is bundled here. Keys are the G.ART names the battle uses, e.g.
  // 'trainer_bram' (Roxanne), 'trainer_aqua' (Team Aqua), 'trainer_player_back'.
  // See assets/sprites/trainers/README.txt for the full key list.
  //
  // For the DEPLOYED site to show them, remoteBase must point at a CORS-enabled
  // host (your own GitHub repo via jsDelivr, an image host, etc.) — local files
  // only show when you run the game locally. There is no stable public CDN of
  // Gen-III trainer rips, so this is left empty by default (baked art shows).
  G.TRAINER_CFG = {
    localBase:  'assets/sprites/trainers/',
    localFile:  '{key}.png',
    // Public trainer-sprite library: Pokémon Showdown's set. Each art key maps to
    // a Showdown filename below; anything missing or unmapped just keeps the
    // hand-drawn baked art. To disable, set remoteBase: ''.
    // NOTE: this host doesn't send CORS headers, so crossOrigin is left off — the
    // images still load and draw; only the optional transparent-margin trim is
    // skipped (Showdown sprites are already tightly framed).
    remoteBase: 'https://play.pokemonshowdown.com/sprites/trainers/',
    remoteFile: '{name}.png',
    preferRemote: true,
    keyMap: {
      trainer_youngster: 'youngster', trainer_lass: 'lass', trainer_hiker: 'hiker',
      trainer_ace: 'acetrainer',
      trainer_bram: 'roxanne', trainer_maris: 'brawly', trainer_tess: 'wattson',
      trainer_vesper: 'flannery', trainer_norman: 'norman', trainer_winona: 'winona',
      trainer_tate: 'tate', trainer_wallace: 'wallace', trainer_steven: 'steven',
      trainer_sidney: 'sidney', trainer_phoebe: 'phoebe-gen3', trainer_glacia: 'glacia',
      trainer_drake: 'drake-gen3', trainer_kai: 'brendan',
      trainer_aqua: 'aquagrunt', trainer_archie: 'archie-gen6'
    },
    box: 64,                   // portraits fit into a 64-tall box, bottom-anchored
    crossOrigin: ''            // host has no CORS; load uncredentialed (no trim)
  };

  // Candidate URLs for a trainer/player sprite key, in priority order. Remote uses
  // the mapped Showdown name; local uses the raw key (assets/sprites/trainers/).
  G.trainerSpriteUrl = function (key) {
    var cfg = G.TRAINER_CFG, urls = [];
    var name = (cfg.keyMap && cfg.keyMap[key]) || null;
    function addRemote() { if (cfg.remoteBase && name) urls.push(cfg.remoteBase + (cfg.remoteFile || '{name}.png').replace('{name}', name)); }
    function addLocal() { if (cfg.localBase) urls.push(cfg.localBase + (cfg.localFile || '{key}.png').replace('{key}', key)); }
    if (cfg.preferRemote) { addRemote(); addLocal(); } else { addLocal(); addRemote(); }
    return urls;
  };

  // ----------------------------------------------------------------------
  // OVERWORLD walking sprites (the little map characters). Loaded at runtime
  // from real overworld animation SHEETS (the pokeemerald decompilation, served
  // via the jsDelivr CDN with CORS so the frames can be sliced). Each sheet is
  // 144x32 = nine 16x32 frames: [down, up, left] idle, then two walk strides.
  // We use the idle + first stride of each direction; the engine mirrors them
  // for right-facing and the alternate step. Baked art stays the fallback.
  // `sheets` maps an engine sprite name (ch_<name>_*) to a sheet path.
  G.OVERWORLD_CFG = {
    remoteBase: 'https://cdn.jsdelivr.net/gh/pret/pokeemerald@master/graphics/object_events/pics/people/',
    sheets: {
      // NPC classes (the player walker is set by the chosen character — see below)
      boy:     'youngster',                // youngster / bug-catcher class + boy NPCs
      mom:     'woman_1',                   // lass / picnicker class + adult-woman NPCs
      prof:    'man_1',                     // hiker class + older-man NPCs / Birch
      aqua:    'team_aqua/aqua_member_m',   // Team Aqua grunts / admin
      egglady: 'beauty'                     // Nursery helper in heal centers
    },
    frameW: 16, frameH: 32,       // source frame size on the sheet
    boxW: 16, boxH: 24,           // fit into the engine's 16x24 overworld slot
    crossOrigin: 'anonymous'
  };

  // The player's BATTLE back sprite (shown sending out the lead Pokémon). Source
  // is a back-pic sheet (64x256 = four 64x64 throw frames); we use frame 0. The
  // chosen character supplies the back-pic name; baked art is the fallback.
  G.PLAYER_BACK_CFG = {
    backBase: 'https://cdn.jsdelivr.net/gh/pret/pokeemerald@master/graphics/trainers/back_pics/',
    frameW: 64, frameH: 64,
    crossOrigin: 'anonymous'
  };

  // ----------------------------------------------------------------------
  // Playable main-character options, chosen on a new game. Two are the natural
  // designs; two are recolored (darker skin + different outfit hue) so the
  // roster is diverse. Each maps to a real walk sheet + battle back-pic, with
  // an optional exact-color recolor applied at load time. 'kind' is shown in UI.
  // Dark-skin remap covering both skin palettes the sheets use (brendan/NPC vs
  // may), so the same map works on any walker + its battle back-pic.
  var DARK_SKIN = {
    '#ffd5b4': '#cf9b6e', '#ffc594': '#a86a40', '#de9473': '#7a4a2e', // brendan / NPC skin
    '#ffdecd': '#cf9b6e', '#dea494': '#a86a40', '#cd8373': '#7a4a2e'  // may skin
  };
  // Four visually distinct designs (separate base sprites, not recolors of each
  // other): a capped boy, a bandana girl, a bare-haired boy, and a pigtailed
  // girl; the latter two also get darker skin for a diverse roster. `name` is
  // only the default if the player leaves the name blank.
  G.CHARACTERS = [
    { key: 'brendan', name: 'Brendan', kind: 'Boy',  blurb: 'Cap, satchel, and a steady stride.',
      sheet: 'brendan/walking', back: 'brendan', recolor: null },
    { key: 'may', name: 'May', kind: 'Girl', blurb: 'Bandana on, always ready to roam.',
      sheet: 'may/walking', back: 'may', recolor: null },
    { key: 'kofi', name: 'Kofi', kind: 'Boy', blurb: 'No hat, just hair and a sea breeze.',
      sheet: 'boy_1', back: 'brendan', recolor: DARK_SKIN },
    { key: 'amara', name: 'Amara', kind: 'Girl', blurb: 'Pigtails and a fearless grin.',
      sheet: 'lass', back: 'may', recolor: DARK_SKIN }
  ];

  // Apply a character by key (sets the player walker + battle back sprite).
  G.applyCharacter = function (key) {
    var c = null, list = G.CHARACTERS || [];
    for (var i = 0; i < list.length; i++) if (list[i].key === key) { c = list[i]; break; }
    if (!c) c = list[0];
    if (c && G.gfx && G.gfx.loadCharacter) G.gfx.loadCharacter(c);
  };

  // Build the ordered list of candidate URLs for a sprite (front|back|icon).
  G.spriteUrl = function (which, dexId) {
    var cfg = G.SPRITE_CFG;
    var dex = String(dexId);
    if (cfg.pad > 0) while (dex.length < cfg.pad) dex = '0' + dex;
    var cap = which.charAt(0).toUpperCase() + which.slice(1); // Front | Back | Icon
    var localTpl = cfg['local' + cap] || cfg.localFront;
    var remoteTpl = cfg['remote' + cap] || cfg.remoteFront;
    var urls = [];
    function add(base, tpl) { if (base && tpl) urls.push(base + tpl.replace('{dex}', dex)); }
    if (cfg.preferRemote) { add(cfg.remoteBase, remoteTpl); add(cfg.localBase, localTpl); }
    else { add(cfg.localBase, localTpl); add(cfg.remoteBase, remoteTpl); }
    return urls;
  };
})();
