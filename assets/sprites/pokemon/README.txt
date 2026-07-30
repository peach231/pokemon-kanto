Creature sprites are NOT stored here.

Every battler streams at runtime from the PokeAPI Gen-5 ANIMATED set via
jsDelivr — see js/data/sprites_config.js. Nothing copyrighted is committed to
this repository.

This folder exists only as an OVERRIDE. If you drop files in as

    front/<dex>.png     back/<dex>.png     shiny/<dex>.png

(where <dex> is the unpadded national dex number, so 25.png is Pikachu) and
set `preferRemote: false` in sprites_config.js, the engine will load yours
instead. Anything missing falls back to the CDN, and anything the CDN cannot
supply falls back to a clean numbered placeholder, so the game is always
playable.
