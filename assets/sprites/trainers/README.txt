TRAINER / PLAYER SPRITES — drop your own battle sprite images here (optional).
=============================================================================

The game ships with hand-drawn baked trainer art, which is ALWAYS the fallback.
By DEFAULT it also loads real trainer sprites at runtime from a public library
(Pokémon Showdown's trainer set at play.pokemonshowdown.com) — so real sprites
show up with no files here. NO trainer art is committed to this repo.

HOW IT WORKS
------------
At boot, for each art key the engine tries, in order:
    <remoteBase><mappedName>.png   (the Showdown CDN; mapping in sprites_config.js)
    assets/sprites/trainers/<key>.png   (your own local files, if present)
On success it replaces that sprite; on failure (or 404) it keeps the baked art.
A loaded image is trimmed and fit, bottom-anchored, into a 64px box, so any
source size works.

TO USE YOUR OWN FILES instead of the CDN: drop <key>.png here and set
`preferRemote: false` (local first) or `remoteBase: ''` (local only) in
js/data/sprites_config.js. Local files are NOT committed, so they only show when
you run the game locally — for the live (Vercel) site, either keep the CDN
default or point `remoteBase` at a host you control.

KEYS (local filename = <key>.png; remote name is mapped in sprites_config.js)
----------------------------------------------------------------------------
Generic classes (shared by many route/dungeon trainers — class-based):
    trainer_youngster  -> youngster      trainer_lass    -> lass
    trainer_hiker      -> hiker          trainer_ace     -> acetrainer

Gym leaders:
    trainer_bram -> roxanne   trainer_maris  -> brawly    trainer_tess  -> wattson
    trainer_vesper -> flannery  trainer_norman -> norman   trainer_winona -> winona
    trainer_tate -> tate       trainer_wallace -> wallace

Elite Four & Champion:
    trainer_sidney -> sidney  trainer_phoebe -> phoebe-gen3
    trainer_glacia -> glacia  trainer_drake  -> drake-gen3   trainer_steven -> steven

Others:
    trainer_kai    -> brendan      (rival)
    trainer_aqua   -> aquagrunt    (Team Aqua grunts / admin)
    trainer_archie -> archie-gen6  (Team Aqua boss)
    trainer_player_back            (player's back sprite — baked only, no remote)
