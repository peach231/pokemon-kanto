// pokemon-gen3 — sprite_manifest.js
// Declares which national-dex sprite slots have CONFIRMED art on disk. The loader
// always tries to load every rostered species by dex number regardless; this
// manifest is what tools/check.js uses to report coverage (which species will
// render real art vs. fall back to a numbered placeholder).
//
//   - true            : front art confirmed present
//   - { back:true }   : a dedicated back sprite is also present (else auto-flipped)
//   - a string        : explicit filename override (relative to localBase, no front/ prefix)
//
// Add an entry per dex id once you drop its PNG into assets/sprites/pokemon/.
// Example after adding Treecko/Torchic/Mudkip fronts:
//   252: true, 255: true, 258: true,

(function () {
  G.SPRITE_MANIFEST = {
    // (empty until sprite files are added — game runs on placeholders meanwhile)
  };
})();
