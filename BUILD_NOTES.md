# Pokéram — build notes (for development continuity)

GBA-style monster-catching RPG. Vanilla JS + Canvas, no build step — double-click
`index.html`. Plan: `~/.claude/plans/make-a-pok-mon-clone-glowing-bear.md`.

## Workflows (CRITICAL)

- **Validate everything**: `node tools/check.js` — loads all scripts in index.html
  order under Node, lints art grids / maps / species / moves, runs nothing visual.
- **Battle logic tests**: loaded scripts expose `G.debug.runTests()` (run by check
  via #debug in browser; under node: see how tools/check.js loads, then call it).
- **Sel-out shading** is applied automatically at bake time (postShade in bake_mons.js): fill pixels touching the outline below/right get a darker master-palette shade. Don't hand-shade rims in recipes.
- **Creature art pipeline**: recipes in `tools/recipes.js` (shape grammar from
  `tools/spritegen.js`: ball/ellipse/tri/line/rect/ring/eye/outline/seam) →
  `node tools/bake_mons.js` → bakes palette-indexed grids into
  `js/data/sprites_mons_a..f.js` + `js/data/sprites_trainers.js`. NEVER hand-edit
  baked files. Char 'K' = eye shine. Light always upper-left. Outline char 'o'.
- **Visual review**: headless Edge screenshots:
  `& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless
  --disable-gpu --screenshot=tools\shot.png --window-size=1000,700
  --virtual-time-budget=6000 "file:///...index.html#HASH"` then Read the png.
  Hash modes: `#gallery&p=N` (sprite gallery page N), `#wild&ff=400` (wild battle,
  fast-forward 400 frames), `#battle&auto&ff=N` (autoplay trainer battle),
  `#debug` (runs tests + cheats). `ff=N` steps N logic frames synchronously at boot.

## Architecture snapshot

- Global namespace `G`; script order in index.html (core → data → engine → main).
- Scene stack `G.scenes` (opaque flag controls draw-down). Transitions are scenes.
- Battle: `G.Battle` (js/engine/battle.js) yields descriptor objects from
  generators; `G.BattleScene` (battle_ui.js) animates them; `G.debug.simBattle`
  pumps headless. Descriptors: text/sfx/anim/hp/expbar/sendOut/recall/status/
  shake/catch/choose/end. `choose` is interactive — UI passes pick into gen.next().
- Overworld: `G.world` + `G.overworldScene` (movement FSM, warps, signs, npcs,
  events). Events = generators in `G.EVENTS` yielding text/fn/wait/custom.
  Wild grass → `G.hooks.grassStep` (wired in overworld.js bottom).
  `G.startTrainerBattle(id, opts)`, `G.afterBattle` handle outcomes/white-out.
- Maps: char-grid layers (ground/deco/over) + legend + base tile; `G.LEG_EXT` /
  `G.LEG_INT` shared legends in maps_towns.js.
- Player state: `G.player` + `G.flags` (save.js; localStorage `pokeram_save_v1`).
- `G.trainerParty(def)` resolves `_starter`/`_starter2`/`_starter3` placeholders
  to the rival's counter-starter line (COUNTER cycle in trainers.js).

## Status: ALL PHASES COMPLETE

1-5 ✅ shell, world, battle core+UI, catch & growth.
6 ✅ Region: 35 maps (Hearthvale→Crown Summit), all 100 creature sprites baked,
   9 trainer portraits via makeHuman() in recipes, ~30 trainers + 4 leaders +
   rival ×4 + champion, LOS engagement, badge gates, item pickups, shops/heals
   (factory-stamped per town), Slumbear set-piece, post-game legendaries.
7 ✅ Menus: StartMenu (Enter), Party (+reorder), Summary, Bag (+repel),
   Dex (seen/caught + rarity stars), Save via localStorage, Title screen.
8 ✅ Audio: 4-channel WebAudio tracker (square/square/triangle/noise),
   8 songs + 4 jingles in music.js, full synthesized SFX bank, M-mute.
9 ✅ Polish: balance sims at gym levels (type-advantage sweeps, same-type
   walls, champion ace ~50/50 vs final starter), README, this file.

## Known rough edges (future passes)

- Fire starter line = black panthers (Emberpaw/Pyranther/Umbranther; species key 'emberynx' kept for save compat). Type is 'dark' (renamed from shadow).
- Battles resolve fast (2-5 turns) with damage-max AI; real play with items/
  switching is longer. A turn-economy pass could raise HP ~15%.
- Auto-back sprites are weakest for face-forward designs; authored backs exist
  for the 12 starters only.
- Houses are 1 wall-row tall (squat); cavewall reads as recessed band.
- No PC storage — catches blocked at party of 6 (by design, plan §risks).
- Shop has no sell flow. No nicknames. Evolution move-learning at the evolve
  level itself is skipped (only level-up learns).
- Audio not yet human-audited (composed blind; tracker patterns may want
  rebalancing after a listen — channel gains in audio.js CHAN_VOL).


