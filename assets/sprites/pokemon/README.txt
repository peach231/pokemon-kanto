CREATURE SPRITES — drop your Gen 3 sprite image files here.
============================================================

This game ships with NO creature art. At boot it loads a sprite image for every
species by its NATIONAL DEX NUMBER, and falls back to a numbered placeholder for
any image it can't fetch.

BY DEFAULT it loads Gen 3 (Emerald) sprites from a public sprite database (PokeAPI
via the jsDelivr CDN) at runtime — so the real creatures show up with no files
here. To use your OWN files instead, drop them in the folders below and either set
`preferRemote: false` (local first, remote fallback) or `remoteBase: ''` (local
only) in js/data/sprites_config.js.

NAMING (default — set in js/data/sprites_config.js)
---------------------------------------------------
  front/<dex>.png   front sprite  (battlers are ~64x64; any size is fit into the box)
  back/<dex>.png    back sprite   (OPTIONAL — if absent, the front is auto-flipped)
  icon/<dex>.png    party/menu icon (OPTIONAL, not required)

<dex> is the national dex number (unpadded by default; set `pad: 3` in the config
to use 001-style names). Examples:
  front/252.png  -> Treecko        front/255.png  -> Torchic
  front/258.png  -> Mudkip         front/384.png  -> Rayquaza

To see which number is which species, open the game at  index.html#gallery  — every
slot shows its dex number and name.

The roster uses national dex numbers: 252-386 (the Hoenn set), plus a handful of
earlier-gen species found in Hoenn: 66-68, 72-76, 81-82, 100-101, 118-119, 129-130,
183-184, 202.

DEDICATED BACK SPRITES
----------------------
If you add a back/<dex>.png, also add an entry in js/data/sprite_manifest.js so the
loader knows to fetch it, e.g.:   252: { back: true },
(Front sprites are loaded automatically without any manifest entry.)

LOADING FROM A REMOTE SOURCE INSTEAD
------------------------------------
Prefer not to download files? In js/data/sprites_config.js set:
  remoteBase: 'https://your-sprite-host/path/',   preferRemote: true
The loader will request <remoteBase>front/<dex>.png etc. Use a host you have the
right to use; sourcing the artwork is up to you. (A CORS-friendly host is needed
for the browser to load cross-origin images.)
