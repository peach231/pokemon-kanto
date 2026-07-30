# Pokémon — Gen 3 (fan clone)

A Gen 3 (Ruby/Sapphire/Emerald-style) monster-catching RPG in vanilla
JavaScript + Canvas. No build step, no frameworks. The engine, maps, battle
system, and game data are all here; **creature sprites load from image files
you supply** (see below).

**To play: double-click `index.html`.** (Any modern browser.)

## Controls

| Key | Action |
|---|---|
| Arrow keys / WASD | Move / navigate menus |
| Z (or Space) | A button — confirm, talk, interact |
| X (or Esc) | B button — cancel, run from menus |
| Enter | Start — open the menu (Dex / Party / Bag / Save) |
| Shift (hold) | Run |
| M | Mute · F | Fullscreen |

## The game

Start in **Littleroot Town** and pick from the three Hoenn starters —
**Treecko**, **Torchic**, or **Mudkip**. Your rival takes the one that counters
yours. Travel the western/southern half of **Hoenn**: Littleroot → Oldale →
Petalburg Woods → Rustboro → Dewford → Granite Cave → Mauville → Lavaridge →
Victory Road → the Pokémon League.

- **~150 species** (national-dex-keyed) with real Gen 3 types, base stats,
  evolutions, and level-up learnsets.
- **4 Gyms** — Roxanne (Rock), Brawly (Fighting), Wattson (Electric),
  Flannery (Fire) — then the **Elite Four** (Sidney/Phoebe/Glacia/Drake) and
  **Champion Steven**.
- Faithful Gen 3 mechanics: the 17-type chart (no Fairy; Steel resists Ghost &
  Dark), type-based physical/special split, the Gen 3 damage/crit/catch
  formulas, per-species exp growth groups, and **weather** (Rain Dance / Sunny
  Day / Sandstorm, plus an ambient sandstorm on Route 111).
- Post-game legendaries appear for the Champion: **Rayquaza** at the League
  peak and **Jirachi** in a Petalburg Woods glade.

> Not included by design (per scope): abilities, natures, double battles.

## Adding the real Gen 3 sprites

The game runs immediately with numbered placeholders. To show real artwork,
drop sprite PNGs into `assets/sprites/pokemon/front/<dex>.png` (national dex
number, zero-padded — e.g. `252.png` is Treecko). Backs and icons are optional.
Full instructions and the dex→species mapping are in
`assets/sprites/pokemon/README.txt`, and you can browse the numbers in-game at
`index.html#gallery`. You can also point `js/data/sprites_config.js` at a remote
sprite source instead. (Sourcing the artwork is up to you — the engine just
loads whatever you provide.)

## Dev / debug

- `node tools/check.js` — validates art, maps, species/move/trainer/encounter
  data, the Gen 3 type chart, and runs the headless battle-engine tests.
- Debug URL hashes: `#gallery&p=N` (sprite gallery), `#sheet&p=N` (contact
  sheet), `#wild&ff=400` / `#battle&auto` (battle harness), `#map=<id>,<x>,<y>`
  (spawn anywhere), `#debug` (run test vectors).
- See `BUILD_NOTES.md` for architecture details.
