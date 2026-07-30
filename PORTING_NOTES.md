# Porting notes — generation-agnostic summary of all edits

A single paragraph describing every change made this session, written so the same
transformations can be applied to a Pokémon clone of *any* generation by swapping
the generation-specific constants (dex range, type chart, sprite source, region
layout) while keeping the architecture identical.

---

Build the game on a dependency-free engine (logical low-res canvas integer-scaled
up for crisp pixels) where **creature art is never bundled**: every species loads
its sprite at runtime by **national-dex number** from a configurable image source
(a local folder and/or a CDN mirror), with a generated numbered placeholder when a
file is missing — so porting to another generation is just pointing the loader at
that generation's sprite set and changing which dex IDs are in the roster. Keep all
*data* as factual tables (per-species base stats, types, level-up learnsets,
evolution lines, catch rate, exp-growth group) authored from the target
generation's values, and implement that generation's exact mechanics: its type
chart (type count and relationships, e.g. no Fairy and Steel-resists-Ghost/Dark in
Gen 3), its physical/special model (decided by move *type* in Gen 3, by move in
later gens), the standard damage/critical/catch formulas, per-species experience
growth curves, and simple weather (rain/sun/sandstorm modifiers and chip damage).
Render battlers by trimming each loaded sprite's transparent margins and
bottom-anchoring it so creatures stand on the platform instead of floating. Add a
**storage/PC system**: cap the active party at six but never block catching — after
any capture let the player choose to add the catch to the party or send it to
remote storage, and when the party is full still offer to *keep it* by swapping a
party member into storage (or send the new one to storage), with deposit/withdraw
UI available at every heal point. Add **shiny variants** rolled once at creature
creation at a fixed probability (1/600, no quota) that lazily fetch an alternate
sprite (the source's `shiny/{dex}` path) and surface a star/“a shiny … appeared!”
indicator in battle and menus. Scatter **procedural, deterministic, non-colliding
decoration** (flowers, tufts, pebbles, bushes) over plain-grass tiles of outdoor
maps — seeded per map id, biome-varied, and skipping paths, encounter grass, and
any gameplay tile — so routes read as designed places rather than bare fields. Give
the menu a **region map** that lights up areas the player has entered (record each
map id on load) and dims the unexplored, with a “you are here” marker. Add field
gear sold in shops: a **fishing tool** that, when facing water, starts a wild battle
from a water-species pool scaled to the area's level band, and a **speed item**
(skates/bike) that auto-increases overworld movement speed while carried. Make the
world **larger and harder**: build towns and routes from small factories so new gym
towns and connecting routes are consistent and warp-correct, raise wild-encounter
level bands every route so power climbs steadily, slot in additional gyms with a
rising leader curve and rebalance the Elite Four/Champion above the final gym, and
**cap evolution thresholds** so every line (including pseudo-legendaries) can be
fully evolved by the last one-to-three gyms. Complete the dex by authoring the rest
of the generation's national-dex species the same factory way (the dex-keyed sprite
loader covers their art automatically) and widen early-route encounter tables for
variety. Gate the **cover/box legendaries** behind full badge completion as
flag-conditioned set-piece encounters that only appear deep in progression. Finally,
keep a headless **validation harness** that loads every script under Node and checks
art/font/map dimensions, legend resolution, that every warp target exists, that
trainer/encounter species are in the roster with legal moves, that learnsets include
a level-1 move and reference real moves, that evolution targets exist, and that no
trainer/item/warp lands on a solid tile (soft-lock guard) — run it after every data
change so large content additions stay correct.
