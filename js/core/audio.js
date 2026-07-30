// Pokéram — audio.js
// WebAudio chiptune: a 4-channel tracker (pulse lead, pulse harmony, triangle
// bass, noise percussion) playing pattern strings from music.js, plus a bank
// of synthesized SFX. Everything routes through master gain -> lowpass so the
// squares stay soft. AudioContext unlocks on the first keypress.

(function () {
  var actx = null;
  var master = null, lowpass = null;
  var chanGain = {};
  var noiseBuf = null;

  var CHAN_VOL = { pulse1: 0.055, pulse2: 0.035, bass: 0.07, perc: 0.05 };
  var CHAN_TYPE = { pulse1: 'square', pulse2: 'square', bass: 'triangle' };

  var current = null;     // { song, step, nextTime, timer }
  var pendingMusic = null;
  var jinglePlaying = false;

  // optional external (streamed) music — see js/data/audio_config.js. When a
  // track is configured for a context the synth tracker is silenced and this
  // looping <audio> element plays instead; otherwise the synth plays as before.
  var streamEl = null, streamId = null;
  function streamSrc(id) {
    var cfg = G.AUDIO_CFG;
    if (!cfg || !cfg.base || !cfg.music || !cfg.music[id]) return null;
    return cfg.base + cfg.music[id] + '.' + (cfg.ext || 'mp3');
  }
  function streamVol() {
    var cfg = G.AUDIO_CFG;
    return G.audio.muted ? 0 : (cfg && cfg.volume != null ? cfg.volume : 0.6);
  }
  function playStream(id) {
    var src = streamSrc(id);
    if (!src) return false;
    if (!streamEl) { streamEl = new Audio(); streamEl.loop = true; }
    if (streamId !== id) { streamEl.src = src; streamId = id; }
    streamEl.volume = streamVol();
    var p = streamEl.play();
    if (p && p.catch) p.catch(function () {}); // autoplay blocked -> retried on unlock()
    return true;
  }
  function stopStream() { if (streamEl) streamEl.pause(); streamId = null; }

  var NOTE_IDX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

  function noteFreq(token) {
    var m = token.match(/^([A-G]#?)(\d)$/);
    if (!m) return null;
    var midi = NOTE_IDX[m[1]] + (parseInt(m[2], 10) + 1) * 12;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // 'E5:2 -:2 G5:4' -> [{f:freq|null|'k'|'s'|'h', steps:n}, ...]
  function parsePattern(str, isPerc) {
    var out = [];
    var toks = str.trim().split(/\s+/);
    for (var i = 0; i < toks.length; i++) {
      var parts = toks[i].split(':');
      var steps = parseInt(parts[1] || '1', 10);
      var head = parts[0];
      if (head === '-') out.push({ f: null, steps: steps });
      else if (isPerc) out.push({ f: head, steps: steps });
      else out.push({ f: noteFreq(head), steps: steps });
    }
    return out;
  }

  function ensureCtx() {
    if (actx) return true;
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return false; }
    master = actx.createGain();
    master.gain.value = 0.7;
    lowpass = actx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 7000;
    master.connect(lowpass);
    lowpass.connect(actx.destination);
    for (var c in CHAN_VOL) {
      chanGain[c] = actx.createGain();
      chanGain[c].gain.value = CHAN_VOL[c];
      chanGain[c].connect(master);
    }
    // 1s of white noise, reused by perc + sfx
    noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
    var data = noiseBuf.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return true;
  }

  // ---- voices -------------------------------------------------------------
  function playTone(chan, freq, t, dur, type) {
    var osc = actx.createOscillator();
    osc.type = type || CHAN_TYPE[chan] || 'square';
    osc.frequency.value = freq;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(1, t + 0.004);
    g.gain.linearRampToValueAtTime(0.6, t + Math.max(0.01, dur * 0.5));
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(chanGain[chan]);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function playPerc(kind, t) {
    if (kind === 'k') { // kick: pitch-dropping triangle thump
      var osc = actx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
      var g = actx.createGain();
      g.gain.setValueAtTime(1.6, t);
      g.gain.linearRampToValueAtTime(0.0001, t + 0.11);
      osc.connect(g); g.connect(chanGain.perc);
      osc.start(t); osc.stop(t + 0.12);
    } else { // 's' snare / 'h' hat: shaped noise
      var src = actx.createBufferSource();
      src.buffer = noiseBuf;
      var f = actx.createBiquadFilter();
      f.type = kind === 'h' ? 'highpass' : 'bandpass';
      f.frequency.value = kind === 'h' ? 6000 : 1800;
      var g2 = actx.createGain();
      var dur = kind === 'h' ? 0.04 : 0.09;
      g2.gain.setValueAtTime(kind === 'h' ? 0.5 : 1.0, t);
      g2.gain.linearRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g2); g2.connect(chanGain.perc);
      src.start(t, Math.random() * 0.5, dur + 0.01);
    }
  }

  // ---- tracker ------------------------------------------------------------
  function startSong(id) {
    stopSongTimer();
    var def = G.SONGS && G.SONGS[id];
    if (!def) return;
    if (!def._parsed) {
      def._parsed = {};
      for (var c in CHAN_VOL) {
        if (def[c]) def._parsed[c] = parsePattern(def[c], c === 'perc');
      }
      def._len = 0;
      for (var pc in def._parsed) {
        var n = 0;
        for (var i = 0; i < def._parsed[pc].length; i++) n += def._parsed[pc][i].steps;
        def._len = Math.max(def._len, n);
      }
    }
    var stepDur = 60 / def.bpm / 4; // 16th notes
    current = {
      id: id, def: def, stepDur: stepDur,
      pos: {}, posStep: {},
      step: 0,
      nextTime: actx.currentTime + 0.06,
      timer: setInterval(schedule, 25)
    };
  }

  function stopSongTimer() {
    if (current && current.timer) clearInterval(current.timer);
    current = null;
  }

  function schedule() {
    if (!current || jinglePlaying) return;
    var def = current.def;
    while (current.nextTime < actx.currentTime + 0.14) {
      var t = current.nextTime;
      for (var c in def._parsed) {
        var pat = def._parsed[c];
        // find event starting at this step
        var acc = 0;
        for (var i = 0; i < pat.length; i++) {
          if (acc === current.step && pat[i].f) {
            var dur = pat[i].steps * current.stepDur;
            if (c === 'perc') playPerc(pat[i].f, t);
            else playTone(c, pat[i].f, t, Math.min(dur * 0.92, dur - 0.01 > 0 ? dur - 0.01 : dur));
          }
          acc += pat[i].steps;
          if (acc > current.step) break;
        }
      }
      current.step++;
      if (current.step >= def._len) current.step = (def.loopBar || 0) * 16;
      current.nextTime += current.stepDur;
    }
  }

  // ---- public API ----------------------------------------------------------
  G.audio = {
    muted: false,
    currentSong: null,

    init: function () {},

    unlock: function () {
      var hasCtx = ensureCtx();
      if (hasCtx && actx.state === 'suspended') actx.resume();
      if (pendingMusic && !current && streamId !== pendingMusic) {
        var id = pendingMusic;
        pendingMusic = null;
        G.audio.playMusic(id);
      } else if (streamEl && streamEl.paused && streamId) {
        var p = streamEl.play(); if (p && p.catch) p.catch(function () {});
      }
    },

    toggleMute: function () {
      this.muted = !this.muted;
      if (master) master.gain.value = this.muted ? 0 : 0.7;
      if (streamEl) streamEl.volume = streamVol();
    },

    playMusic: function (id) {
      if (this.currentSong === id && (current || streamId === id)) return;
      this.currentSong = id;
      // external track configured for this context? stream it, silence the synth.
      if (streamSrc(id)) {
        stopSongTimer();
        if (!playStream(id)) pendingMusic = id;
        return;
      }
      stopStream();
      if (!actx) { pendingMusic = id; return; }
      startSong(id);
    },

    stopMusic: function () {
      this.currentSong = null;
      stopSongTimer();
      stopStream();
    },

    playJingle: function (id, onDone) {
      if (!actx || !G.SONGS || !G.SONGS[id]) { if (onDone) onDone(); return; }
      var def = G.SONGS[id];
      jinglePlaying = true;
      var pat = parsePattern(def.pulse1, false);
      var stepDur = 60 / def.bpm / 4;
      var t = actx.currentTime + 0.03;
      var total = 0;
      for (var i = 0; i < pat.length; i++) {
        if (pat[i].f) playTone('pulse1', pat[i].f, t + total * stepDur, pat[i].steps * stepDur * 0.92);
        total += pat[i].steps;
      }
      setTimeout(function () {
        jinglePlaying = false;
        if (onDone) onDone();
      }, total * stepDur * 1000 + 80);
    },

    // ---- SFX bank ----------------------------------------------------------
    sfx: function (name) {
      if (!actx || this.muted) return;
      var t = actx.currentTime + 0.005;
      switch (name) {
        case 'menuMove': sweep('square', 880, 880, 0.035, 0.35, t); break;
        case 'confirm': sweep('square', 1046, 1318, 0.07, 0.4, t); break;
        case 'cancel': sweep('square', 1318, 1046, 0.07, 0.4, t); break;
        case 'hit': burst(1800, 0.08, 0.9, t); sweep('square', 110, 90, 0.07, 0.7, t); break;
        case 'superEff': burst(2600, 0.12, 1.0, t); sweep('square', 220, 80, 0.12, 0.8, t); break;
        case 'notVery': burst(700, 0.09, 0.7, t); break;
        case 'statusHit': sweep('square', 200, 160, 0.12, 0.5, t); sweep('square', 160, 200, 0.1, 0.5, t + 0.1); break;
        case 'faint': sweep('square', 400, 70, 0.32, 0.6, t); break;
        case 'orbShake': sweep('square', 180, 170, 0.03, 0.8, t); burst(900, 0.025, 0.5, t + 0.01); break;
        case 'catchClick': sweep('square', 700, 700, 0.03, 0.6, t); sweep('square', 1100, 1100, 0.05, 0.5, t + 0.05); break;
        case 'heal': arp([523, 659, 784, 1046], 0.07, t); break;
        case 'levelUp': arp([392, 523, 659, 784, 1046], 0.06, t); break;
        case 'statUp': sweep('square', 500, 900, 0.1, 0.45, t); break;
        case 'statDown': sweep('square', 900, 500, 0.1, 0.45, t); break;
        case 'run': burst(3000, 0.12, 0.5, t); break;
        case 'money': sweep('square', 988, 988, 0.05, 0.5, t); sweep('square', 1318, 1318, 0.08, 0.5, t + 0.06); break;
        case 'doorOpen': burst(1200, 0.09, 0.4, t); break;
        case 'ledgeHop': sweep('square', 400, 700, 0.08, 0.4, t); break;
        case 'lowHp': sweep('square', 1000, 1000, 0.05, 0.4, t); break;
        case 'bump': sweep('square', 120, 90, 0.06, 0.6, t); break;
        case 'sendout': sweep('square', 300, 760, 0.06, 0.5, t); break;
      }
    },

    // ---- Pokémon cry --------------------------------------------------------
    // A short synthesized call, deterministic per species key, so every creature
    // has its own consistent "voice" (pitch / sweep / vibrato / waveform / grit)
    // the way the originals faked hundreds of cries from a tiny synth. `down`
    // gives a lower, slurred faint-cry variant.
    cry: function (key, down) {
      if (!actx || this.muted) return;
      var s = 2166136261; key = String(key);
      for (var ci = 0; ci < key.length; ci++) { s ^= key.charCodeAt(ci); s = (s * 16777619) >>> 0; }
      function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
      var t = actx.currentTime + 0.01;
      var base = (180 + rnd() * 520) * (down ? 0.6 : 1);
      var dur = (0.26 + rnd() * 0.34) * (down ? 1.4 : 1);
      var dir = down ? -1 : (rnd() < 0.5 ? -1 : 1);
      var amt = 0.25 + rnd() * 0.8;
      var vibR = 12 + rnd() * 30, vibD = base * (0.015 + rnd() * 0.06);
      var wave = ['square', 'sawtooth', 'triangle'][Math.floor(rnd() * 3)];
      var two = !down && rnd() < 0.4;          // some calls warble between two notes
      var osc = actx.createOscillator();
      osc.type = wave;
      osc.frequency.setValueAtTime(base, t);
      if (two) osc.frequency.setValueAtTime(base * (1 + dir * amt * 0.5), t + dur * 0.45);
      osc.frequency.exponentialRampToValueAtTime(Math.max(55, base * (1 + dir * amt)), t + dur);
      var lfo = actx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = vibR;
      var lg = actx.createGain(); lg.gain.value = vibD;
      lfo.connect(lg); lg.connect(osc.frequency);
      var g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.018);
      g.gain.setValueAtTime(0.11, t + dur * 0.6);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(master);
      osc.start(t); osc.stop(t + dur + 0.03);
      lfo.start(t); lfo.stop(t + dur + 0.03);
      if (rnd() < 0.45) {                       // a little noisy grit for growls
        var src = actx.createBufferSource(); src.buffer = noiseBuf;
        var nf = actx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = base * (1.5 + rnd()); nf.Q.value = 1.4;
        var ng = actx.createGain();
        ng.gain.setValueAtTime(0.035, t); ng.gain.linearRampToValueAtTime(0.0001, t + dur * 0.7);
        src.connect(nf); nf.connect(ng); ng.connect(master);
        src.start(t, Math.random() * 0.3, dur);
      }
    }
  };

  function sweep(type, f0, f1, dur, vol, t) {
    var osc = actx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    var g = actx.createGain();
    g.gain.setValueAtTime(0.12 * vol, t);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  function burst(freq, dur, vol, t) {
    var src = actx.createBufferSource();
    src.buffer = noiseBuf;
    var f = actx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = 0.8;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.16 * vol, t);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t, Math.random() * 0.4, dur + 0.02);
  }

  function arp(freqs, noteDur, t) {
    for (var i = 0; i < freqs.length; i++) {
      sweep('square', freqs[i], freqs[i], noteDur * 1.6, 0.5, t + i * noteDur);
    }
  }
})();
