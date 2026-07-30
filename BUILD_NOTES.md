# pokemon-kanto — build notes

A Generation 1 / Kanto monster-catching RPG. Vanilla JS + Canvas, logical
240×160 integer-scaled, global `G`, **no build step** — open `index.html`.

Forked from `../pokemon-gen3` (itself the `pokeram` engine). The engine layer is
inherited; the data, art sources, world and story are being replaced.

## Status

| Phase | State |
|---|---|
| Engine fork + scaffold | done |
| Gen 1 data layer (151 species, 165 moves, type chart) | done — generated from `pret/pokered` |
| Gen 1 mechanics (DVs, single Special, speed crits, stones) | done |
| Art pipeline (animated battlers, FRLG portraits + overworld, cries) | done — all 122 URLs verified |
| Kanto tileset | done — 110 tiles, rendered and reviewed |
| Kanto maps | Pallet -> Lavender done (59 maps). Celadon, the Rocket Hideout and Saffron are next |
| Encounter tables | done — all 56 wild maps generated from the ROM |
| Region map screen | done — Kanto, landmass derived from the node graph |
| Gen 1 move effects in battle.js | done — all 35 effect kinds handled, guarded by check.js |
| Intro sequence | legendaries re-cast (Zapdos/Articuno/Moltres/Mewtwo/Mew); Oak's speech + demo battle still to do |
| Story, trainers, gyms, endgame | not started |

**`node tools/check.js` passes**, battle-core tests included, and the game
BOOTS AND RENDERS. Playable from the start through to the Pokemon Tower: Pallet -> Viridian ->
Viridian Forest -> Pewter (Brock) -> Mt. Moon -> Cerulean (Misty) -> Nugget
Bridge -> Bill -> Underground Path -> Vermilion (Lt. Surge) -> S.S. Anne (Cut)
-> Route 9 -> Rock Tunnel -> Lavender -> Pokemon Tower. The Tower's ghost is
gated on the SILPH SCOPE, which lives in Celadon and is not built yet.

check.js now also walks the WARP GRAPH from Pallet and fails on any warp that
lands on a solid tile or out of bounds (arriving stuck inside a wall) and warns
on any map no chain of warps can reach. Neither is visible by reading a map
file, and both are the classic way this engine breaks.

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

- The region stops at Lavender. Route 11 and Route 8 run out onto nothing.
- The Pokemon Tower is completable only once Celadon exists (SILPH SCOPE).
- Saffron is deliberately sealed (its gates are solid tree on Route 5). The
  Underground Path is the intended way south, exactly as in Gen 1.
- Object tiles (trees, rocks, boulders, decorations, signs, fences) are
  transparent-backed on purpose so they can sit on any ground. Do NOT bake a
  grass surround back into them — that was the original Hoenn bug and it made
  boulders show green fringes inside caves.
