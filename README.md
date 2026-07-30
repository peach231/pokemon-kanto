# Pokémon — Kanto

A Generation 1 monster-catching RPG in vanilla JavaScript and Canvas. No build
step, no frameworks, no dependencies.

**To play: open `index.html`.** Any modern browser. Art streams from public
CDNs, so the first load wants a connection.

---

## Controls

| Key | Action |
|---|---|
| Arrow keys / WASD | Move, navigate menus |
| Z (or Space) | A — confirm, talk, interact |
| X (or Esc) | B — cancel, back |
| Enter | Start — Dex / Party / Bag / Map / Save |
| Shift (hold) | Run |
| M | Mute · F | Fullscreen |

---

## The game

The whole of **Kanto**, Pallet Town to the Indigo Plateau: 132 maps, 8 badges,
the Elite Four, and all 151 species with their real Red/Blue numbers.

Pick **Bulbasaur**, **Charmander** or **Squirtle** from Oak's lab. Your rival
takes the one that beats yours, and keeps taking it for the rest of the game.

The route is Kanto's own — Viridian Forest, Mt. Moon, Cerulean, the S.S. Anne,
Rock Tunnel, the Pokémon Tower, the Rocket Hideout under the Celadon Game
Corner, Silph Co., Koga's maze, the Safari Zone, Cycling Road, the sea crossing
to Cinnabar, the burnt-out Pokémon Mansion, and Victory Road.

### What is actually Gen 1 about it

Not a re-skin. The mechanics are the 1996 ones, generated from the
[pret/pokered](https://github.com/pret/pokered) disassembly:

- **One Special stat.** Not the modern Sp. Atk / Sp. Def split — one number,
  which is why Amnesia is absurd and Alakazam is unkillable.
- **DVs, not IVs or EVs.** Four values rolled per creature, HP derived from
  their low bits, and the stat formula doubles them exactly as the ROM does.
- **Speed-based critical hits.** Crit rate is base Speed ÷ 512, so Persian
  crits constantly and Snorlax never does. High-crit moves multiply it by 8.
- **The 15-type chart**, including Bug and Poison hitting each other for double.
- **165 moves** with the ROM's own effect table — Bide, Rage, Mirror Move,
  Substitute, Transform, Conversion, Mimic, Counter, and the one-hit KOs.
- **No held items, no abilities, no natures, no breeding.** None of it existed.

The one deliberate change: **Ghost → Psychic is 2×**, not the ROM's 0×. That
matchup is a straight data error — it is why Gengar learns no Ghost move worth
using and why Psychic went unchecked for a whole generation.

### The five HMs

Kanto is not gated by badges, it is gated by HMs. Three quarters of the exits
in this region are a tree, a boulder, a stretch of water or a dark room, and
each one opens when you find the right machine *and* the badge that licenses
using it.

| HM | Move | Needs | Found |
|---|---|---|---|
| HM01 | Cut | Cascade Badge | The S.S. Anne's captain |
| HM02 | Fly | Thunder Badge | A house on Route 16 |
| HM03 | Surf | Soul Badge | The Secret House, Safari Zone west |
| HM04 | Strength | Rainbow Badge | The Warden, for his teeth |
| HM05 | Flash | Boulder Badge | Oak's aide, at ten species caught |

TMs are **single use**, as they were in Gen 1 — which is the whole reason a TM
felt like treasure rather than a menu entry. HM moves cannot be forgotten, so
the fifth party slot has a real cost.

### The legendaries

Catchable **throughout the game**, not after the credits. Each is a fixed
encounter you can see from across the room, and each is gone once you beat it:
there is one of each in Kanto and no second chance.

| | Where | Needs |
|---|---|---|
| Zapdos | The Power Plant, across the lake off Route 10 | Surf |
| Articuno | Seafoam Islands B1F | Surf + Strength |
| Moltres | Victory Road 3F, over the road every challenger walks | 8 badges |
| Mewtwo | Cerulean Cave | 7 badges |
| Mew | Under the lorry at the Vermilion dock | Strength |

The last one is the oldest rumour in the game. It was never true. It is now,
and it costs exactly what the playground said it would.

### The ending

The Indigo Plateau is **one building and you walk through all of it**. The
lobby has a Centre and a shop, and then a single red carpet running north into
five sealed chambers.

Once you are on the carpet: no healing, no saving, no leaving. Lose to Lance
and you start again at Lorelei with whatever you have left. The five rooms are
one fight with four intermissions.

Then the **Hall of Fame**, then home to Pallet — and then the **Hall of
Champions**, which is not in Red/Blue. The Elite Four are the end of the
challenge; this is the end of the game, and those should not be the same room.
Four champions before you, each holding one of the things Kanto only has one
of. The fifth plinth has no name on it and the brass is polished anyway.

---

## Project layout

```
index.html          load order is load-bearing: core → data → engine → main
main.js             boot, the frame loop, debug hashes
js/core/            util, input, gfx, audio, scene stack
js/data/            generated tables + hand-authored art, maps and text
js/engine/          mon, battle, battle_ui, overworld, field, menus, title
tools/              the generator and the validator
```

### Generated vs authored

Everything with `GENERATED by tools/gen_data.js` at the top comes from the
Red/Blue disassembly and **must not be hand-edited** — edit the generator and
re-run it:

```
node tools/gen_data.js
```

That writes `types.js`, `moves.js`, `species_*.js`, `kanto_dex.js`, `tms.js`
and `encounters.js`. Dex blurbs live in `tools/blurbs.js` and are original
writing; the generator refuses to emit a species file if any of the 151 is
missing, so filler cannot ship.

### The validator

```
node tools/check.js
```

Loads every script in `index.html` order under a small DOM shim and runs
fourteen audits. It exists because this project's characteristic bug is the
**silent** one — the shop clerk whose event was deleted five commits ago and
now does nothing, the map row that was quietly truncated at load and took a
warp with it, the NPC whose sprite has no sheet and renders as an invisible
wall you can talk to.

It currently checks: art grids, palette membership, glyph coverage, Gen 1 type
assertions, dangling event/trainer/item/shop references, flag reachability,
duplicate warps, key-item obtainability, HM obtainability, Fly destinations,
overworld sprite coverage, trainer portrait coverage, map grid overflow, move
effect coverage, and world connectivity from Pallet.

Every one of those was added the day a bug of that kind cost real time. None
of them are hypothetical.

### Debug hashes

| Hash | What |
|---|---|
| `#map=fuchsia,13,9` | Drop into any map at any tile |
| `#regionmap` | The town map |
| `#gallery` / `#sheet` | Art viewers |
| `#battle` / `#wild` | Battle test harness |
| `#debug` | Overlays and test vectors |

---

## Art and audio

Nothing is bundled. Creature battlers are animated sprites from Pokémon
Showdown, trainer portraits are the FireRed-era `-gen3` set, overworld walking
sheets come from `pret/pokefirered`, and cries stream from Showdown. Tiles, the
font, and every UI element are hand-authored pixel art in `js/data/`, drawn as
character grids over a fixed palette.

Music is eight original chiptune loops written for this project.

---

## Legal

A non-commercial fan project, built for learning. Pokémon is © Nintendo,
Creatures Inc. and GAME FREAK. No ROM data, sprites or audio from the official
games is redistributed in this repository — the data tables are generated at
build time from a publicly available disassembly, and all art streams from
third-party hosts.
