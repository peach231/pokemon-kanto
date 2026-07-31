# pokemon-kanto — build notes

A Generation 1 / Kanto monster-catching RPG. Vanilla JS + Canvas, logical
240×160 integer-scaled, global `G`, **no build step** — open `index.html`.

Forked from `../pokemon-gen3` (itself the `pokeram` engine). The engine layer is
inherited; the data, art sources, world and story are being replaced.

## Status

**The region is complete.** Pallet Town to the Indigo Plateau, 133 maps, 8
badges, the Elite Four, the Hall of Fame and the Hall of Champions.
`node tools/check.js` passes all fourteen audits and the battle-core tests.

| Phase | State |
|---|---|
| Engine fork + scaffold | done |
| Gen 1 data layer (151 species, 165 moves, type chart, 55 TM/HMs) | done — generated from `pret/pokered` |
| Gen 1 mechanics (DVs, single Special, speed crits, stones) | done |
| Art pipeline (animated battlers, FRLG portraits + overworld, cries) | done — all URLs verified, all sprites audited |
| Kanto tileset | done — 113 tiles |
| Kanto maps | **done — 133 maps, all reachable from Pallet** |
| Encounter tables | done — all 56 wild maps generated from the ROM |
| Region map screen | done — real edge list, Fly from any visited town |
| Gen 1 move effects in battle.js | done — all 35 effect kinds, guarded by check.js |
| HM field moves (Cut / Fly / Surf / Strength / Flash) | done |
| Intro (title, demo battle, Oak's speech, name entry) | done |
| Story, trainers, gyms, endgame | done |

### The critical path, end to end

Pallet → Viridian → Viridian Forest → **Pewter (Brock)** → Mt. Moon →
**Cerulean (Misty)** → Nugget Bridge → Bill → Underground Path →
**Vermilion (Lt. Surge)** → S.S. Anne (**HM01 Cut**) → Rock Tunnel → Lavender →
Pokémon Tower (Silph Scope → Poké Flute) → **Celadon (Erika)** → Game Corner →
Rocket Hideout → **Saffron (Sabrina)** → Silph Co. → Routes 11-15 →
**Fuchsia (Koga)** → Safari Zone (**HM03 Surf**, Gold Teeth → **HM04
Strength**) → the sea → **Cinnabar (Blaine)** → Pokémon Mansion (Secret Key) →
**Viridian (Giovanni)** → Route 22 → Route 23 → Victory Road → **the League**.

### What is deliberately NOT Gen 1

- **Ghost → Psychic is 2×.** The ROM's 0× is a straight data error.
- **Koga's gym is a real maze**, not invisible walls — a spanning tree with
  exactly one route to him, so it is a puzzle of geometry rather than of bad
  information.
- *(closed)* The Safari Zone now has its own battle mode: no moves, no foe
  turn, and BAIT and ROCK pulling the catch rate in opposite directions.
- **The Hall of Champions does not exist in Red/Blue.** It is the ending this
  project wanted: the Elite Four end the challenge, and this ends the game.

## The seam (read this before changing any data file)

This project is an **inherited engine** plus a **rewritten data layer**. The
engine came from `pokemon-gen3` and was largely left alone; `items.js`,
`music.js`, the maps and the species tables were all written fresh for Gen 1.

**Every expensive bug in this project has lived on the seam between those two
halves**, and every one has the same shape: the data names something with a
string, the engine looks that string up, and the two names do not match.
Nothing crashes. Nothing logs. A whole mechanic simply stops existing.

  * `pokemon-gen3` called capture devices "orbs" — `kind: 'orb'`, Tame Orb,
    Great Orb. Rewriting `items.js` for Gen 1 gave them their real names and
    `kind: 'ball'`, and left the four places in the engine that read `'orb'`
    untouched. **Nothing in the game could be caught**, and the catch-rate
    unit test passed the entire time, because the formula was right and
    nobody called it.
  * The event runner calls `step.fn()`. Twenty-one events written in one
    session yielded `{t:'fn', f: …}`. Each stopped silently halfway through;
    two HMs became unobtainable.
  * Maps and trainers asked for the songs `gymleader` and `center`.
    `music.js` defined neither, so the eight most important battles in the
    game and every Pokémon Centre played silence.

So the rule is: **when you rename or rewrite a data file, the contract is the
strings, not the file.** `tools/check.js` now audits every one of them in a
single pass — songs, sound effects, battle backgrounds, item kinds, evolution
methods, battle action types, species rarities and growth curves — by asking
the data what it references and the engine what it can resolve. Adding a new
kind of name to the data means adding it to that audit in the same commit.

## Lessons this codebase has actually paid for

Every audit in `check.js` was added the day a bug of that kind cost real time.
The pattern is always the same — **the failure is silent**:

1. `shopBuy` was deleted with the Hoenn interiors. Six Poké Marts had clerks
   who did nothing. Nothing crashed; the event lookup returned `undefined`.
2. `padRows` silently TRUNCATED. Rows added past a map's declared height
   vanished, taking their warps with them, and the source looked fine.
3. Twenty-one events yielded `{t:'fn', f: …}` when the runner calls
   `step.fn()`. Every one stopped halfway through, silently. Two HMs became
   unobtainable and half the region was cut off — with all checks passing,
   because it was correct data calling one wrong field name.
6. `items.js` said `kind: 'ball'`; the battle bag filtered for `kind: 'orb'`.
   No ball ever reached the menu, so **nothing in the game could be caught**
   — and the catch-rate unit test passed the whole time, because the formula
   was right and nobody called it.
7. Eleven dungeon interiors had their staircase, item or legendary sealed
   inside a room with no door. A 20x20 grid typed by hand looks connected
   and is not.
4. Nine trainer classes had no overworld sheet and rendered as *nothing*:
   solid, talkable, invisible.
5. Roof tiles baked a grass background, so every building on sand or marble
   wore a green fringe.

The rule this produces: **when a bug is found, do not fix the instance — add
the audit that finds every instance, then fix what it reports.**

## Workflows (CRITICAL)

- **Regenerate data**: `node tools/gen_data.js`. NEVER hand-edit
  `js/data/{types,moves,species_*,kanto_dex}.js` — they carry a generated
  header. Edit `tools/gen_data.js` or `tools/blurbs.js` and re-run.
- **Validate**: `node tools/check.js` — loads every script in `index.html`
  order under Node, lints art grids / maps / species / moves, runs the battle
  tests. Run after EVERY map or data edit.
- **Look at the art**: `node tools/render_tiles.js tools/tiles.png 4` writes a
  contact sheet of every tile PLUS three composed scenes (route, town block,
  interiors) and does not need a browser. Tiles that look fine alone often tile
  badly, so always check the scenes. Object tiles are transparent-backed, so the
  scene composer underlays a ground tile the way the overworld renderer does.
- **Visual review in-engine**: headless Edge screenshots. Use `--headless=new` AND a
  unique `--user-data-dir` per invocation — the default profile locks and
  silently writes no PNG.

      msedge --headless=new --disable-gpu --user-data-dir=<unique tmp>
             --screenshot=tools\shot.png --window-size=1000,700
             --virtual-time-budget=9000 "file:///.../index.html#HASH"

  Hashes: `#gallery&p=N`, `#wild&ff=400`, `#battle&auto&ff=N`, `#debug`,
  `#map=<id>,<x>,<y>`.

## Architecture

- Global `G`; script order in `index.html` (core → data → engine → main).
- Scene stack `G.scenes`; transitions are themselves scenes.
- Battle: `G.Battle` (battle.js) yields descriptor objects from generators;
  `G.BattleScene` (battle_ui.js) animates them. Descriptors: text/sfx/anim/hp/
  expbar/sendOut/recall/status/shake/catch/choose/end. `choose` is interactive.
- Overworld: `G.world` + `G.overworldScene`. Events are generators in `G.EVENTS`
  yielding text/fn/wait/custom.
- Maps: char-grid layers (ground/deco/over) + a legend + a base tile.
- Player state: `G.player` + `G.flags` (save.js, localStorage).

## Decisions locked with Eric

- **Literal Kanto** — Pallet → Viridian → Pewter → … → Indigo Plateau, real
  geography, real routes 1–25.
- **Animated Gen-5 battlers.** They are GIFs, so gfx keeps them LIVE and
  re-blits each frame (`gfx.tickLive`, called from `main.js`). Do not route
  them through `_fitToBox` — it bakes to a canvas and freezes frame 0.
- **Overworld sprites stream** from `pret/pokefirered`; that set is complete for
  Kanto so nothing renders blank. The hand-authored alternative was BUILT and
  COMPARED (`node tools/compare_chars.js`, samples in `tools/sample_chars.js`):
  the streamed set is clearly better pixel art — interior shading, readable
  faces at 16x24, confident silhouettes — and the hand-drawn samples read flat
  beside it. Recommendation is to keep streaming. Awaiting Eric's call; do not
  switch unless he says so.
- **Tileset is hand-authored**, a full new temperate Kanto set (not a retint).
- **Music**: keep the inherited 8 tracker songs for now. Eric initially asked
  for real Gen 1 transcriptions; that was walked back because they would be
  guessed melodies and a copyright liability in a public repo.
- **Player**: choose Red or Leaf. **Rival**: always Blue, no name entry.
- **Intro**: full sequence — legendary cinematic → parade title → Oak's welcome
  → Nidorino vs Gengar demo → name entry.
- **Elite Four**: Gen-1-accurate sealed gauntlet. Centre + shop at the entrance,
  then five sealed chambers, no healing, no saving, no exit. Lose anywhere and
  you restart from Lorelei. Rooms themed to their master.
- **Pacing**: real levels and encounters, `G.EXP_RATE = 1.5` so no grinding.
- **Side systems**: TMs (50, single-use) and fossils + Cinnabar Lab are IN.
  Safari Zone, Game Corner and Rocket Hideout exist as full maps with their
  story beats and items (Surf, Silph Scope) but WITHOUT the minigames — no step
  counter, no bait/rock, no slot machine.
- **Legendaries**: static, gated by HM/badge reachability, findable mid-journey.
  Birds during the game; Cerulean Cave (Mewtwo) and Mew stay endgame.
- **Hall of Champions**: invented predecessor champions each holding one legend,
  then Red with Mewtwo as the secret final boss.
- **Mechanics**: Gen 1 feel, game-breakers fixed (see the `types.js` header).

## Known rough edges

- **When adding rows to an existing map, update its `h`.** `padRows` TRUNCATES
  to the declared height, so extra rows are silently dropped off the bottom —
  including any warp that lived there. This bit once on Route 2 and was only
  caught because the connectivity check noticed the exit had vanished. Derive
  door coordinates by loading the map and searching the grid, not by counting
  characters in the source.

- Multi-turn move effects (Wrap, Bide, Thrash, Transform, charge moves) resolve
  as faithful SINGLE-TURN equivalents rather than holding state across turns.
  Each has the right message and a real effect; none silently does nothing.
  Upgrading them needs turn-loop state in `battle.js`.

- The region stops at Saffron. Route 11's east end, Route 12-15 south, and
  Route 16 (Snorlax) are not built yet.
- Saffron is deliberately sealed (its gates are solid tree on Route 5). The
  Underground Path is the intended way south, exactly as in Gen 1.
- Object tiles (trees, rocks, boulders, decorations, signs, fences) are
  transparent-backed on purpose so they can sit on any ground. Do NOT bake a
  grass surround back into them — that was the original Hoenn bug and it made
  boulders show green fringes inside caves.
