# Pokémon Gen 3 — Improvement Plan (for an implementing AI agent)

You are improving a Gen-3 (Hoenn) monster-catching RPG built in vanilla JS + Canvas.
The **engine, data tables, and battle system are solid and should NOT be rewritten.**
The weakest link — by a wide margin — is the **overworld art and map design**, which
currently reads as a prototype ("templated rectangles on a green field") instead of a
designed, commercial-quality GBA world. Most of the value in this plan is in **P0**.

Work top-down: **P0 → P1 → P2 → P3.** Each task is self-contained with file
references, a concrete fix, and a "Done when" acceptance test. Do not start a lower
tier until the tier above is visually verified.

---

## How to work in this repo (read first)

- **No build step.** Open `index.html` in a browser to play.
- **Validate after every data/map change:** `node tools/check.js`. It loads all
  scripts under Node and checks art grids, map dimensions, warp targets, legend
  resolution, encounter/trainer legality, and runs headless battle tests. It must
  pass before you consider a task done.
- **Visual verification is mandatory** for any art/map task. Capture a headless
  screenshot and actually look at it:
  ```
  & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu \
    --screenshot=tools\shot.png --window-size=960,640 --virtual-time-budget=6000 \
    "file:///<abs-path>/index.html#HASH"
  ```
  Useful hashes: `#map=<id>,<x>,<y>` (spawn anywhere), `#wild&ff=400` (wild battle),
  `#battle&auto` (autoplay trainer battle), `#gallery&p=N` (sprite gallery).
- **Baked art pipeline:** creature/trainer art is generated from `tools/recipes.js`
  via `node tools/bake_mons.js` into `js/data/sprites_*.js`. **Never hand-edit baked
  files.** World/UI tiles live in `js/data/sprites_tiles.js`, `sprites_chars.js`,
  `sprites_ui.js` and ARE hand-authored as palette-indexed grids (`{w,h,pal,px}`).
- **Logical resolution is 240×160** (`G.SCREEN_W/H`), tiles are **16×16**. Design to
  that grid; the canvas integer-upscales to the window.
- **Reference, don't copy.** Use the `pret/pokeemerald` decomp for exact constants
  (frame counts, formulas, tile composition ideas) — it's open source, not a ROM.

### Quality bar (the standard every visual task is held to)
Side-by-side with a real Ruby/Sapphire/Emerald screenshot, a stranger should not be
able to instantly tell which one is the clone. If a tile or map reads as "a colored
rectangle," it fails. Depth, shadow, edge transitions, and irregular silhouettes are
what separate "real" from "vibecoded."

---

# REFERENCE — How Pokémon Emerald is actually built (researched)

**Every art and map task below must be designed to match real Ruby/Sapphire/Emerald,
not invented from scratch.** Before building anything, open real references and copy
the conventions:

- **Primary visual references** (look at these while working):
  - Full Emerald exterior + interior tilesets: The Spriters Resource
    (`spriters-resource.com/game_boy_advance/pokemonemerald/`).
  - Real route/town maps: VGMaps Emerald set, and the BLaDoM interactive Hoenn map
    (`bladom.github.io/Hoenn`).
  - Map-editing conventions: porymap manual (`huderlem.github.io/porymap`).
  - For exact behavior/constants: the `pret/pokeemerald` decomp (open source, not a ROM).
- The `pret/pokeemerald` map data (`data/maps/*/map.bin`) and tilesets are the ground
  truth for layout and metatile composition — reference them when in doubt.

## A. Tile & metatile system (this is WHY Emerald has depth)
- Tiles are **16×16 px**. Emerald composes the world from **metatiles**: each 16×16
  metatile is built from a **bottom layer and a top layer**, and each layer is a 2×2
  grid of 8×8 sub-tiles. (This is why "the average Gen-3 tree is four tiles.")
- **The top layer is an overhang that draws ABOVE the player.** In Emerald, tile
  priority is null for everything *except* "the tops of trees and the backs/tops of
  houses, which the player can walk behind." This single mechanic — objects whose upper
  portion occludes the player — is most of what makes the world feel 3-D instead of
  flat. **Our engine already supports this** via the `over` layer (see
  `overworld.js` `_drawLayer` drawing `over` after actors). Use it.
- **Metatile behavior** drives gameplay per tile (tall-grass encounters, ledge jump
  direction, water/surf, animated tiles, warps). We model this with `G.TILES[name]`
  flags (`solid`, `ledge`, `grass`, `water`, `anim`) — keep that mapping faithful.

## B. Building anatomy (Emerald, replace the flat slabs with this)
A real Emerald building is **never a one-row roof on a one-row wall.** Vertical
composition, top to bottom:
1. **Roof: 2 metatile rows**, with a lit ridge near the top (light is upper-left) and a
   darker course toward the eaves. Roofs are colored by building type (Center = red,
   Mart = blue, houses = varied) but always shaded, never flat-filled.
2. **Eave / overhang: a thin band** at the roof's bottom that slightly overhangs the
   wall and casts a shadow on it — **put this on the `over` layer** so it reads as the
   building front sticking out.
3. **Wall: 2 metatile rows**, with visible siding/brick texture, a base trim course,
   and **framed windows** (recessed, with sill + highlight) — not a flat colored square.
4. **Door: 1 metatile**, framed, with a step/mat, and it is the warp tile.
5. **Ground contact shadow:** a semi-transparent shadow on the grass/path tiles along
   the building's bottom and right edges (light upper-left), so it sits ON the ground.
- **Footprints (approx., from real maps):** a house ≈ **4 wide × 4 tall** metatiles;
  the **Pokémon Center and Poké Mart are larger, separate buildings** (≈ 5–6 wide,
  4–5 tall) — they are NOT combined into one building. Gyms are larger landmark
  structures with a distinct roof.

## C. Route design rules (what makes a Hoenn route feel designed)
From Hoenn Routes 101/104/110:
- **Routes are sectioned**, not one open field. Route 104 splits into a south half and
  a north half (divided by Petalburg Woods); each half has its own terrain identity.
- **Terrain variety within one route:** tall-grass patches, **sandy beach with a pier
  and stairs**, **water/ponds crossed by a bridge** (the bridge even jogs sideways
  mid-span), **soft-soil berry beds**, puddles, flowers, trees. A route should change
  what's under your feet several times.
- **Ledges create one-way flow.** Impassable ledges force you to **zig-zag through the
  grass** and make backtracking take a different path — they are a core routing tool,
  not decoration. Use them deliberately.
- **The path branches.** Route 104 north forks west (flower shop) and east (pond +
  bridge). Offer optional pockets that hold items/trainers off the main line.
- **Surf/HM-gated side areas.** Route 110 has a "small grass island accessible only via
  Surf"; Route 104 has ledge-gated corners. Reward exploration with areas you can't
  reach on the first pass.
- **Verticality / layering.** Route 110's Seaside Cycling Road is a **raised bike track
  over the sea with the grassy road beneath it** — overpasses and elevation make routes
  read as places. (Use the `over` layer + collision to fake raised paths.)
- **Trainer spacing:** **~4–7 trainers per route** with "consistent challenge spacing"
  and lines of sight aimed across the path. Not clustered, not absent.
- **Items reward off-path exploration:** a mix of **visible pickups** in grass/corners
  and **hidden items** buried in beach sand or empty patches — placed specifically to
  pull you off the straight line.
- **Structures dot the routes:** Mr. Briney's cottage, the Pretty Petal flower shop,
  the Trick House, cave mouths, secret-base spots. A route usually has at least one
  building or landmark, not just terrain.

## D. Town design rules
- **Pokémon Center (red roof) and Poké Mart (blue roof) are separate buildings.** Each
  town has a **central landmark** — usually the Gym — plus residential houses (some
  named/owned, e.g. "Wally's house next to the Gym").
- **Towns integrate nature and have a theme/identity** ("where people mingle with
  nature," coastal salt air, volcano, etc.). Ponds (often Surf-gated), shores with
  hidden items, fences forming yards/neighborhood boundaries, gardens, and signposts.
- **Asymmetric, non-grid layout.** Entrances are off-center; buildings sit at varied
  positions and rotations of footprint; no single straight road down the middle.

## E. How the game looks & performs in motion (from longplays)
Things that only show up when the game is *running* — watch any longplay in §F while
building:
- **Locked ~60 fps, never stutters.** The GBA runs at ~59.73 Hz and holds it in the
  overworld and battle. Our fixed-timestep loop matches — keep every animation
  **frame-counted, never delta-/time-based**, so nothing ever feels floaty.
- **Seamless connected maps.** Walking from a town into its adjacent route does **not**
  fade — the camera scrolls continuously across the border (town↔route↔route are
  "connected maps"). Only **doors, caves, and stairs fade**, with a short door-open
  animation first. Our engine currently fades on *every* map edge, which breaks the
  continuous-world feel (fix = P1-4). pokeemerald stores this as per-map `connections`.
- **The whole overworld is always animated.** Water shimmers and the **player and
  objects cast a rippling reflection on water** (render order: water → reflection →
  land → player); flowers and tall grass sway; sand, ash, and waterfalls animate; doors
  slide open before you step in. A still frame is never fully still.
- **Overworld "juice":** a dust puff on running-shoe steps and ledge hops, the grass
  rustle when entering tall grass, a surf wake, and the **"!" balloon + music sting**
  when a trainer spots you (then they walk up). These tiny reactions sell the world.
- **Battle pacing is deliberate, not fast.** The **HP bar drains slowly** — animated
  per HP point (≥49 HP) or per pixel (≤48 HP) — and a **low-HP beep loops** while the
  bar sits in the red. The EXP bar fills with a sound; level-up plays a jingle + stat
  card; faints slide the sprite down behind the platform; text prints at a steady tick.
  A **shiny** sends out with a **circle of sparkles** — that is Gen 3's *only* special
  send-out effect (there are **no per-species entry animations**, so don't add them).
- **Every move has its own distinct battle animation** in the real game (not a generic
  per-type effect). Our type-themed projectile/impact/aura is a fair abstraction; a
  richer per-move set would close the remaining gap (optional, P2-6).

## F. Sources
- porymap manual — metatiles, layers, behavior, prefabs:
  https://huderlem.github.io/porymap/manual/editing-map-tiles.html
- PokéCommunity tile/priority tutorial (overhang priority on tree tops / house backs):
  https://www.pokecommunity.com/threads/tile-inserting-animating-tutorial.422362/
- The Spriters Resource — Emerald exterior & interior tilesets:
  https://www.spriters-resource.com/game_boy_advance/pokemonemerald/
- Bulbapedia — Hoenn Route 104, Route 110, Petalburg City (route/town anatomy):
  https://bulbapedia.bulbagarden.net/wiki/Hoenn_Route_104 ·
  https://bulbapedia.bulbagarden.net/wiki/Hoenn_Route_110 ·
  https://bulbapedia.bulbagarden.net/wiki/Petalburg_City
- TCRF — Ruby/Sapphire early maps (design iteration on routes/towns):
  https://tcrf.net/Development:Pok%C3%A9mon_Ruby_and_Sapphire/Early_Maps
- BLaDoM interactive Hoenn map (layout reference): https://bladom.github.io/Hoenn
- pret/pokeemerald decomp (ground-truth map/tileset data + per-map `connections`):
  https://github.com/pret/pokeemerald
- **Longplays — watch these for motion/pacing/UI in action:**
  https://www.youtube.com/watch?v=-WTMktITRDA (1080p60) ·
  https://www.youtube.com/watch?v=4zPp9y1UMJE ·
  https://www.youtube.com/watch?v=2Fiw-px4OTI (100%)
- Smogon — Gen 3 HP-bar drain timing (per-HP ≥49, per-pixel ≤48):
  https://www.smogon.com/forums/threads/hp-bar-animations-and-their-effect-on-hp-precision.3667321/
- PokéCommunity — Emerald water reflections (render order water→reflection→land→player):
  https://www.pokecommunity.com/showthread.php?t=420194
- Serebii — Gen 3 entry animations (shiny sparkle only; no per-species entries):
  https://www.serebii.net/games/entryanimation.shtml

---

# P0 — Overworld art & map design (the whole "feel" problem lives here)

Evidence: `tools/audit_town.png`, `tools/audit_route.png` (capture fresh ones).
Symptoms visible right now: flat slab buildings, dark-rectangle tall grass, plus-sign
paths, straight tree-wall borders, empty green fields, an always-on controls overlay.

### P0-1 — Rebuild building tiles with real depth (kill the "squat slab" look)
- **Problem:** Houses/Center/Mart are a single flat-colored roof slab + one wall row
  (`BUILD_NOTES.md` calls this out: "Houses are 1 wall-row tall (squat)"). They look
  like colored blocks, not buildings.
- **Files:** `js/data/sprites_tiles.js` (roof/wall/window/door tiles), legends in
  `js/data/maps_towns.js` (`G.LEG_EXT`), every town/interior map that stamps a house.
- **Fix — build exactly to REFERENCE §B, copying the Emerald exterior tileset
  (Spriters Resource) tile-for-tile in structure:**
  - Compose buildings as **2 roof rows → eave/overhang band → 2 wall rows → framed
    door**, per §B. Roof has a lit ridge (upper-left light) and a darker eave course;
    walls have siding/brick texture, a base trim, and **recessed framed windows** (not
    flat squares); the door is framed with a step/mat.
  - **Put the eave overhang on the `over` layer** so the building front occludes the
    player slightly (the Emerald "walk behind the back of houses" behavior — §A).
  - Add a **ground contact shadow** on the tiles along the building's bottom + right
    edges (light upper-left).
  - Match real footprints (§B): houses ≈ 4×4; **Center and Mart are separate, larger
    buildings** (≈ 5–6 wide). Upgrade the `roof_*`/`wall`/`window`/`door` tiles in
    `sprites_tiles.js`, extend the legend, and update the town factory so every town
    benefits at once.
- **Done when:** A town screenshot is visually indistinguishable in building structure
  from a real Emerald town — readable roof→eave→wall→door, framed windows, grounding
  shadow, player can clip behind the eave; no building reads as a flat rectangle.

### P0-2 — Redesign tall-grass and ground tiles (kill the "floating rectangle" grass)
- **Problem:** Tall-grass patches render as solid dark rounded rectangles floating on
  flat grass (`audit_route.png`). Plain grass is flat green + sparse dot noise.
- **Files:** `js/data/sprites_tiles.js` (`tallgrass`, `grass`, `grass2`, `path*`).
- **Fix:**
  - **Tall grass:** individual blade clumps with a two-tone (lit tips / shadowed base),
    an irregular top silhouette, and a soft transition to the grass underneath — not a
    filled box. Make it a **2-frame animated sway** (the tile system already supports
    `anim`/`animSpeed`; see `_drawLayer` in `overworld.js`). The player's feet should
    be partially occluded when standing in it (draw an `over`-layer grass strip).
  - **Plain grass:** 2–3 low-contrast variants with a subtle organic texture and
    occasional patches, so large fields don't read as one flat color. Keep contrast
    low so it never fights sprites.
  - **Paths:** add proper **edge and corner tiles** so a path blends into grass with a
    soft dithered border instead of a hard rectangle. (Edge tiles `path_n/s/e/w`
    exist but aren't producing soft transitions — fix the art and ensure maps use the
    corner pieces.)
- **Done when:** Tall grass looks like clumps of blades and animates; a route's grass
  field has visible-but-subtle texture; paths have soft edges, not hard rectangles.

### P0-3 — Overworld shape & structure overhaul (redesign the whole world like real Hoenn)
This is the largest and most important task. **Re-author the actual map grids so the
world is shaped, paced, and sized like a real Pokémon region** — not a set of templated
rectangles. Build to REFERENCE §C (routes) and §D (towns). The goal the user wants:
*"change the entire overworld shape and structure to actually feel like Pokémon —
longer game routes, more interactions, whatever it is in Pokémon."*

- **Problem:** Routes are a straight tan cross with rectangular hedge-blobs and a
  straight tree column on one edge (`audit_route.png`); they're tiny and empty. Towns
  are a symmetric grid with a path straight down the middle (`maps_towns.js`). The whole
  region reads as programmer-art templates, and routes are far too short to feel like a
  journey.
- **Files:** `js/data/maps_routes.js`, `maps_towns.js`, `maps_dungeons.js`,
  `maps_interiors.js`, `maps_expansion.js`, `maps_endgame.js`; encounter tables and
  trainer/sign/item placement travel with each map.

- **Fix — routes (apply §C):**
  - **Make routes 2–4× longer and sectioned.** A real route changes terrain several
    times along its length. Give each route 2+ distinct sections with their own
    identity (e.g. grassy approach → beach/pier → pond + bridge), the way Route 104
    splits north/south around Petalburg Woods. Current routes are a single screen of
    grass — that is the single biggest "this isn't Pokémon" tell.
  - **Curve and branch the path.** No straight-through corridor. The main path bends
    around obstacles and forks into optional pockets holding items/trainers. Add
    dead-end nooks that reward exploration.
  - **Use ledges as a routing tool, not decoration.** Place impassable ledges so the
    player **zig-zags through grass** and so backtracking takes a different line
    (`ledge` tile + hop already work). Every meatier route should have several.
  - **Terrain variety per route:** tall-grass patches (natural shapes, not rectangles),
    sandy beach with a pier and stairs, water/ponds crossed by a **bridge that jogs
    sideways**, soft-soil/berry beds, puddles, flower beds, scattered trees and boulders.
  - **Surf/field-move-gated side areas:** corners reachable only later (a grass island
    via Surf, a ledge-walled pocket) so the world has depth on a second pass.
  - **Verticality:** at least one route with a raised path/overpass (Cycling-Road style)
    using the `over` layer + collision, so the region isn't all one flat plane.
  - **Irregular borders:** tree lines jut in and out with clearings and choke points —
    never a straight wall of `tu/vx`.

- **Fix — towns (apply §D):**
  - **Asymmetric, non-grid layouts.** Off-center entrances; buildings at varied
    positions; no single straight road down the middle. Separate Center (red) and Mart
    (blue) buildings, a Gym landmark, and several houses (some owned/named).
  - **Give every town a distinct silhouette and theme** (port, volcano, forest, etc.)
    so a single screenshot identifies the town. Add ponds (Surf-gated), shores with
    hidden items, fenced yards forming neighborhoods, gardens, crates, mailboxes, and
    signposts as focal points.
  - **Make towns bigger and denser** than the current ~20–26 wide grids where it serves
    exploration.

- **Keep it correct:** every redesign must keep `node tools/check.js` green — warps
  point at valid in-bounds tiles on both ends, no trainer/item/warp lands on a solid
  tile (soft-lock guard), encounter species stay in the roster, level bands keep
  climbing route-to-route. Re-stitch warp coordinates whenever you resize a map.
- **Done when:** Walking any route takes noticeably longer and the screen changes
  terrain/elevation several times end-to-end; no screenshot anywhere shows a symmetric
  grid or a straight path corridor; each town is individually recognizable from one
  screenshot; the validator passes.

### P0-6 — Fill the world with interactions (make it inhabited, not empty)
- **Problem:** Maps have very few NPCs/signs/items and little to do between battles;
  the world feels depopulated. Real Hoenn routes/towns are full of small interactions.
- **Files:** `maps_*.js` (npcs/signs/items/scripts arrays), `js/engine/overworld.js`
  (interaction plumbing already supports npc dialog, signs, items, events, trainers),
  `js/data/trainers.js`, `js/engine/menus.js` (for any new field interactions).
- **Fix — add the interaction density real Pokémon has:**
  - **More flavor NPCs** with real, characterful dialog (kids, hikers, fishers,
    shopkeepers, rivals' relatives) — several per town, a few per route. Some give
    one-line hints about nearby type matchups or where to go next.
  - **Hidden items** (buried in beach sand / empty patches) in addition to visible
    pickups, so exploration off the main path pays off (§C). Add a simple "found a
    hidden item!" check on the faced tile.
  - **Daily/giveaway NPCs** (a berry/candy a day), and **signposts** at route
    boundaries and in front of buildings (the route-name sign on entry is canonical).
  - **Route structures to walk into:** a cottage, a flower shop, a rest house, a cave
    mouth — at least one landmark building per major route (§C).
  - **Trainers with line-of-sight** spaced ~4–7 per route (§C), aimed across the path,
    with intro/defeat lines; the LOS engagement system already exists (`_trainerScan`).
  - **Light field-move gating** (a cuttable tree, a pushable boulder, a rock to smash)
    to create "come back later" loops — optional but very Pokémon.
- **Done when:** Every town has multiple talkable NPCs + signs + at least one optional
  building; every major route has trainers, at least one hidden item, and a landmark;
  walking through the world surfaces something to interact with every few steps.

### P0-4 — Add contact shadows + canopy overhang to world objects
- **Problem:** Trees, signs, fences, ledges, and buildings sit flat with no grounding.
- **Files:** `js/data/sprites_tiles.js`, `overworld.js` `_drawLayer`/`_drawActor`.
- **Fix:** Tree trunks cast a small ground shadow and their canopy overhangs (draws on
  the `over` layer above the tile so the player can walk "behind" the top). Signs,
  ledges, and rocks get a 1px contact shadow. (Actors already have a ground shadow —
  match that visual language for static objects.)
- **Done when:** Objects look planted, not pasted; the player can pass behind tree tops.
- **Status (DONE — shadows):** `_drawShadows` pass added in `overworld.js`; every solid
  tile (building/tree/cliff/fence/sign/counter) casts a soft south + east contact
  shadow onto open ground, indoors and out. Tree-canopy `over`-layer overhang (walk
  behind tree tops) is still TODO and folds into the P0-3 tree-tile redraw.

### P0-5 — Remove the always-on controls overlay
- **Status: DEFERRED by user.** The two-line `Z/Space talk … / Del back …` overlay is
  kept intentionally as an onboarding aid for new players. Do not remove it. (If revived
  later, the idea was to fade it out after the first minute or move it to a help menu.)

### P0-7 — Redesign the landmark buildings (Pokémon Center / Poké Mart / Gym) to Emerald spec
Make the three signature buildings — **exterior AND interior** — actually match real
Ruby/Sapphire/Emerald instead of generic stamped rooms. Build to REFERENCE §B/§D and the
sources below. These are the buildings players enter most, so accuracy here is felt.

- **Files:** `js/data/maps_interiors.js` (Center/Mart/gym interiors + factories),
  `js/data/maps_towns.js` & other map files (exterior footprints/emblems),
  `js/data/sprites_tiles.js` (Center red roof + Poké Ball logo, Mart blue roof, gym
  facade, interior tiles: counter, healing machine, PC, shelves, puzzle tiles).

- **Pokémon Center (most iconic):**
  - *Exterior:* the classic **red peaked roof with the white Poké Ball logo** sign on
    the front, sliding glass double doors, larger footprint than a house (REFERENCE §D).
  - *Interior:* ground floor = **nurse behind a healing counter with the healing machine
    + Poké Ball slots behind her**, a **PC station** in a corner, **plants** framing the
    room, a welcome mat at the door. (Gen 3 also had a 2nd floor "Cable Club" reached by
    an escalator — optional flavor; a single faithful ground floor is the priority.)
- **Poké Mart:** *Exterior:* **blue roof**, separate building. *Interior:* a **clerk
  behind a sales counter** with **stocked shelves** along the walls; buying happens at
  the counter.
- **Gym:** *Exterior:* a large distinctive building with the **type emblem** (the game
  already floats a type badge over gym doors). *Interior:* **type-themed puzzle rooms**
  with the **leader on a raised platform at the back**, not a plain room — e.g. Electric
  = floor-direction panels; Fire = heat-vent gates / lava; Psychic/Ice = warp or
  slide-once ice panels (Sootopolis); multi-room warp mazes (Mossdeep). Each gym's puzzle
  should suit its type and gate the path to the leader.

- **Status (IN PROGRESS):** **Center interior redesigned** on this branch — wider room,
  nurse + healing counter + machine, separate PC + bookshelf station, framing plants,
  welcome mat (entrance kept at (4,7) so town warps are untouched; all 9 towns inherit
  it via the `healCenter` factory). **TODO:** Center exterior (Poké Ball logo + bigger
  footprint), Poké Mart interior + exterior, all four Gym interiors (type puzzles) +
  exteriors. The bigger exterior footprints land together with the P0-3 town pass.
- **Done when:** A stranger can identify the Center, Mart, and each Gym from one
  screenshot of its exterior, and each interior matches the Emerald role (heal counter /
  sales counter / type puzzle + leader platform). `node tools/check.js` stays green.

- **Sources:** Bulbapedia Pokémon Center
  (https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Center) · PsyPokes Emerald gym
  layouts (https://www.psypokes.com/emerald/gymlayouts.php) · Serebii Emerald gyms
  (https://www.serebii.net/emerald/gym.shtml).

---

# P1 — Overworld feel & life

### P1-1 — Animate the world (water, flowers, NPC idle)
- **Problem:** Water, flowers, and NPCs are static; the world feels frozen.
- **Files:** `sprites_tiles.js` (`water`, `flower` → add `anim` frames),
  `overworld.js` (NPC update/draw).
- **Fix:** 2–3 frame animated water and a gentle flower/grass sway. Give NPCs a subtle
  idle (occasional turn or 1px bob) and let some NPCs wander a short patrol path
  (respecting collision). Keep it cheap and deterministic.
- **Done when:** A still screenshot taken 30 frames apart differs (water/grass moved);
  NPCs visibly idle.

### P1-2 — Movement cadence pass (match GBA timing)
- **Problem:** Verify walk/run cadence against real Emerald rather than guessing.
  Current: walk = 16 frames/tile, run = 8 frames/tile, turn-in-place lock = 2 frames
  (`overworld.js` `update`).
- **Fix:** Cross-check frame counts against `pokeemerald` (`MOVEMENT_ACTION_*` step
  timings). Tune walk/run/bike speeds and the turn-frame so movement feels like the
  reference. Ensure the 4-direction walk animation cadence (step→stand) matches.
- **Done when:** Side-by-side with Emerald, walking and turning feel the same, not
  floaty or stuttery.

### P1-3 — Player feet occlusion in tall grass & behind tall objects
- **Problem:** Sprites draw fully on top of tall grass; real games clip the lower body.
- **Fix:** Render an `over`-layer grass/foliage strip after the actor so feet are
  hidden in tall grass (ties into P0-2). Same for walking behind tree canopies (P0-4).
- **Done when:** Standing in tall grass hides the player's feet.

### P1-4 — Seamless connected-map scrolling (the biggest "performs like Pokémon" change)
- **Problem:** `G.world.warpTo` runs a `FadeScene` on **every** map edge
  (`overworld.js`), so the world plays as disconnected rooms. Real Hoenn scrolls
  continuously from a town into its adjacent route (REFERENCE §E); only doors/caves fade.
- **Files:** `overworld.js` (camera, `_drawLayer`/`draw`, movement across borders,
  `warpTo`, collision), all `maps_*.js` (add a `connections` field), `tools/check.js`.
- **Fix:** Add per-map **connections** (`{dir:'up'|'down'|'left'|'right', to:<mapId>,
  offset:<int>}`). When the player nears a border, render the neighboring map's tiles at
  the seam and let the **camera and collision cross the border**, transferring to the
  neighbor with **no fade** when the player steps across. Keep fades **only** for
  door/cave/stair warps (tag those `fade:true` or detect by tile type). Extend the
  validator to check that connected edges line up (matching length/offset, no gaps).
- **Note:** This is engine-level work — schedule it **after** the P0 art/layout pass so
  you're connecting good-looking maps. Highest single "feels like the real game" lever
  after the art.
- **Done when:** Walking from a town into its route scrolls continuously with no fade;
  doors/caves still fade; `node tools/check.js` passes and verifies edge alignment.

### P1-5 — Water reflections + always-on tile animation
- **Problem:** Water is static and nothing reflects in it; outdoor scenes can be fully
  still. Real Emerald reflects the player/objects in water and animates water/sand/etc.
- **Files:** `sprites_tiles.js` (animated `water`/`sand`/`waterfall` frames),
  `overworld.js` (`_drawActor`/`draw` reflection pass).
- **Fix:** Draw a vertically-flipped, wave-distorted, slightly-transparent reflection of
  the player and tall objects onto adjacent water tiles, using the **water → reflection
  → land → player** order (REFERENCE §E). Ensure water/flowers/grass animate everywhere
  via the existing `anim`/`animSpeed` tile support.
- **Done when:** Standing at a shoreline shows a rippling reflection; no outdoor screen
  is fully static across 30 frames.

---

# P2 — Battle feel & pacing

The battle screen is already the strongest part (`audit_battle.png`). These are polish.

### P2-1 — Text speed + per-character blip + a speed setting
- **Problem:** Text reveals at a flat 2 chars/frame everywhere
  (`textbox.js` `CHARS_PER_FRAME`, `battle_ui.js` `updateTask` text case) with no
  sound per character and no setting. Real Gen 3 has Slow/Mid/Fast and a text blip.
- **Fix:** Add a text-speed option (persisted in save) feeding both the textbox and the
  battle message printer. Emit a short `textBlip` sfx every ~2–3 revealed characters
  (not per frame). Default to a slightly slower, more deliberate speed than current.
- **Done when:** Text has the GBA "tick-tick-tick" cadence and respects the setting.

### P2-2 — Recall beam on switch/faint
- **Problem:** Send-out tosses a ball and bursts (good), but recall just hides the
  sprite (`battle_ui.js` `recall` case). Real games suck the mon back into the ball
  with a beam.
- **Fix:** Add a recall animation: red beam + sprite shrinking into the ball.
- **Done when:** Switching out plays a visible recall, mirroring send-out.

### P2-3 — Turn-economy / length pass
- **Problem:** Battles resolve in 2–5 turns (`BUILD_NOTES.md` known edge); damage is
  high relative to HP and the AI always max-damages.
- **Fix:** Either bump HP (~10–15%) or trim damage so average wild fights last longer
  and trainer fights have back-and-forth. Re-run the balance sims referenced in
  `BUILD_NOTES.md` Phase 9 at gym levels after tuning.
- **Done when:** Median trainer battle is noticeably longer with room for switching.

### P2-4 — Battle background depth
- **Problem:** Backgrounds are flat color bands + a dither horizon (`battle_ui.js`
  `G.BATTLE_BG`). Slightly bland and the dashed horizon line is harsh.
- **Fix:** Add a low parallax silhouette layer (distant trees/mountains/sea) per
  biome and soften the horizon. Keep it subordinate to the sprites.
- **Done when:** Each biome background has a sense of depth, no harsh dashed line.

### P2-5 — Battle pacing timing pass (slow HP drain + low-HP beep)
- **Problem:** The HP bar drains at a flat `0.012` fraction/frame regardless of damage
  (`battle_ui.js` `hpDrain`) and there's no low-HP warning. Real Gen 3 drains **slowly
  and deliberately** — per HP point (≥49 HP) / per pixel (≤48) — and loops a **low-HP
  beep** while the bar is red (REFERENCE §E).
- **Files:** `battle_ui.js` (`updateTask` `hpDrain` case, `drawPanels`), `audio.js`
  (low-HP beep sfx).
- **Fix:** Meter the drain so big hits read as a weighty slow slide (scale by HP lost,
  not a fixed fraction); loop a low-HP beep while the active mon's bar is in the red and
  stop it when it leaves the red or the message advances. Keep EXP fill + level jingle.
- **Done when:** A big hit shows a slow, weighty drain and the red-zone beep loops like
  the real game.

### P2-6 — (optional, large) Distinct per-move battle animations
- **Problem:** All moves share a generic type-themed projectile/impact/aura
  (`battle_ui.js` `spawnMoveFx`). Real Emerald gives every move its own animation.
- **Fix:** Add recognizable animations for signature moves (Tackle lunge, Ember sparks,
  Water Gun stream, Thunderbolt flash, Vine Whip, Bite, etc.), keyed by move id with the
  type-themed effect as fallback. Do this only after core feel is right.
- **Done when:** Common moves are visually distinguishable from each other in battle.

---

# P3 — Mechanics fidelity (closing the gap to "real Gen 3")

These do not change the look but make the game *behave* like Gen 3. Pick based on how
far you want to push authenticity; P3-1/P3-2 are cheap and high-value.

### P3-1 — IV range 0–31 (currently 0–15)
- **File:** `mon.js` `rollIvs` uses `G.irand(16)`. Gen 3 IVs are 0–31.
- **Fix:** `G.irand(32)` and audit any code assuming a 0–15 range. Re-check stat math.
- **Done when:** IVs span 0–31 and stats match the Gen 3 formula at known test vectors.

### P3-2 — EXP correctness (split among participants + formula)
- **File:** `battle.js` `awardExp`. Currently every participant gets the **full**
  `floor(expYield*level/6)`; Gen 3 divides by the number of participants and uses
  `floor(baseExp*level/7)`.
- **Fix:** Divide EXP by participant count and align the constant to the Gen 3 formula.
  Keep the trainer ×1.5 multiplier.
- **Done when:** Leveling pace matches Gen 3 for a known fight; check.js battle tests
  still pass.

### P3-3 — Natures (±10% to two stats)
- **Files:** `mon.js` (`makeMon`, `monStats`), summary UI in `menus.js`.
- **Fix:** Roll a nature at creation; apply the ±10%/−10% stat modifiers in `monStats`;
  surface the nature name in the summary screen. This is a defining Gen 3 system.
- **Done when:** Mons have natures that visibly shift stats and show in the summary.

### P3-4 — EVs (stat experience) — optional, larger
- **Files:** `mon.js` stat formula + `battle.js` (award EVs on KO).
- **Fix:** Track 6 EV counters per mon, award species EV yield on faint (cap 255/stat,
  510 total), add `floor(ev/4)` into the stat formula. Can be invisible-but-correct.
- **Done when:** Trained mons out-stat freshly-caught ones at equal level.

### P3-5 — Abilities — optional, largest authenticity win
- **Scope note:** Explicitly excluded in `README.md`/`PORTING_NOTES.md`. Abilities
  (Intimidate, Levitate, Static, Torrent/Blaze/Overgrow, Sturdy, Water Absorb…) are
  central to Gen 3 battle identity. This is the biggest single "feels real" lever, and
  the biggest amount of work.
- **Files:** `species_*.js` (add `ability` field), `battle.js` (hook into damage,
  status, switch-in, immunities), `battle_ui.js` (announce on switch-in).
- **Fix:** Implement a focused set first (the starter-type boosts, Intimidate,
  Levitate, Static, Sturdy, Water/Volt Absorb) behind a clean hook system, then widen.
- **Done when:** Switch-ins announce abilities and they measurably change battle math.

### P3-6 — Minor formula touch-ups
- Catch shake math in `battle.js` `doOrb` is Gen-3-style but approximate; align `b` to
  the canonical `1048560 / sqrt(sqrt(16711680 / a))` if you want exactness.
- Evolution-by-level skips moves learned *on* the evolve level (`BUILD_NOTES.md`).
- These are low priority; only do them if chasing 1:1 fidelity.
- **Non-goal:** the gameplay RNG (`util.js` mulberry32) need NOT match the Gen 3 LCG —
  it only matters for frame-perfect RNG manipulation, which is out of scope.

---

# P4 — Content & systems depth (after it looks right)

- **Bigger, denser maps:** more hidden items, more flavor NPCs, more optional trainers
  per route (`maps_*.js`, `trainers.js`).
- **Field moves / HM-style puzzles:** Cut trees, Rock Smash rocks, Strength boulders,
  Surf (you have swim already) — gate areas and add puzzle rooms.
- **PC Box UI:** the storage system exists (catch → party or Lab); give it a proper
  grid box UI for viewing/withdrawing (`menus.js`).
- **Shop sell flow & nicknames:** both noted missing in `BUILD_NOTES.md`.
- **Audio human-audit:** tracker patterns/channel gains composed blind
  (`audio.js` `CHAN_VOL`, `music.js`); listen and rebalance.

---

## Suggested order of execution
0. **Read the REFERENCE section and open the real Emerald tileset/maps first.** Every
   P0 task is "match Emerald," not "invent." Do not skip this.
1. **P0-1, P0-2** (buildings + grass tiles, built to REFERENCE §A/§B) — biggest visual
   jump for least work.
2. **P0-4, P0-5** (shadows + `over`-layer overhangs, remove overlay) — fast polish that
   compounds P0-1/2.
3. **P0-3 then P0-6** (re-shape the whole overworld → then fill it with interactions) —
   the large one. Do it once the tiles look right so you're designing with good-looking
   pieces, and design routes/towns straight from REFERENCE §C/§D (longer, sectioned,
   branching, inhabited). Validate (`node tools/check.js`) continuously.
4. **P1** (animate the world + movement feel + reflections), then **P1-4 seamless
   connected-map scrolling** — the biggest "performs like Pokémon" change after the art,
   done once maps look good so you're connecting finished-looking maps.
5. **P2** (battle polish + P2-5 pacing/HP-drain), then **P3** (fidelity) to taste, then
   **P4** (content).

After each task: `node tools/check.js` **and** a fresh screenshot you actually inspect.
