// pokemon-gen3 — audio_config.js
// OPTIONAL external music source. By default the game uses its own built-in
// synthesized chiptune (no files, no downloads, nothing shipped). If you have
// audio you hold the rights to (your own recordings, freely-licensed tracks,
// etc.), point `base` at the folder/URL that holds the files named below and
// each one streams in for the matching context. Tracks loop; sound effects stay
// synthesized. With base = null nothing streams and the synth plays as before.
//
// The game asks for a track id when it enters a place (the keys on the left);
// each maps to one audio file (the value on the right, minus the extension):
//   title    -> the title screen
//   town     -> towns, your house, shops, heal houses
//   route    -> overland routes / fields
//   forest   -> wooded areas (Verdant Forest)
//   cave     -> caves, tunnels, the deep titan lairs
//   battle   -> wild battles and ordinary trainer battles
//   gym      -> gym-leader battles
//   champion -> Elite Four, Champion, and the legendary titans
//   evolve   -> the evolution ceremony
// e.g. with base 'assets/audio/' and ext 'mp3', the route theme is
//   assets/audio/route.mp3
(function () {
  G.AUDIO_CFG = {
    base: null,        // e.g. 'assets/audio/' or 'https://your-host/audio/'
    ext: 'mp3',
    volume: 0.6,       // 0..1, applied to streamed music (synth has its own mix)
    music: {
      title: 'title',
      town: 'town',
      route: 'route',
      forest: 'forest',
      cave: 'cave',
      battle: 'battle',
      gym: 'gym',
      champion: 'champion',
      evolve: 'evolve'
    }
  };
})();
