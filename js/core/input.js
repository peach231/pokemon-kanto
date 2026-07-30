// Pokéram — input.js
// Keyboard state with per-logic-step edge detection and shared menu key-repeat.
// Z = A button, X = B button, Enter = Start, arrows = D-pad, M = mute.

(function () {
  var KEYMAP = {
    arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    z: 'A', x: 'B', enter: 'start', m: 'mute',
    ' ': 'A', escape: 'B', backspace: 'B', delete: 'B', shift: 'run'
  };

  var held = {};          // button -> true while physically down
  var pressedQueue = {};  // buttons that went down since last logic step
  var just = {};          // snapshot for the current logic step
  var heldFrames = {};    // button -> frames held (for menu repeat)

  G.input = {
    held: held,

    init: function () {
      window.addEventListener('keydown', function (e) {
        // F toggles fullscreen (must run inside the gesture handler)
        if (e.key.toLowerCase() === 'f') {
          e.preventDefault();
          if (document.fullscreenElement) document.exitFullscreen();
          else document.getElementById('wrap').requestFullscreen().catch(function () {});
          return;
        }
        var b = KEYMAP[e.key.toLowerCase()];
        if (!b) return;
        e.preventDefault();
        if (!held[b]) pressedQueue[b] = true;
        held[b] = true;
        if (G.audio && G.audio.unlock) G.audio.unlock();
      });
      window.addEventListener('keyup', function (e) {
        var b = KEYMAP[e.key.toLowerCase()];
        if (!b) return;
        held[b] = false;
        heldFrames[b] = 0;
      });
      window.addEventListener('blur', function () {
        for (var k in held) held[k] = false;
        for (var k2 in heldFrames) heldFrames[k2] = 0;
      });
    },

    // Called once at the top of every logic step.
    step: function () {
      just = pressedQueue;
      pressedQueue = {};
      for (var b in held) {
        if (held[b]) heldFrames[b] = (heldFrames[b] || 0) + 1;
      }
    },

    justPressed: function (b) { return !!just[b]; },

    // True on first press, again after 15 frames, then every 5 — the standard
    // menu-scroll feel, shared by every menu in the game.
    repeat: function (b) {
      if (just[b]) return true;
      var f = heldFrames[b] || 0;
      return f >= 15 && (f - 15) % 5 === 0;
    },

    // First currently-held direction, for overworld movement.
    heldDir: function () {
      if (held.up) return 'up';
      if (held.down) return 'down';
      if (held.left) return 'left';
      if (held.right) return 'right';
      return null;
    }
  };
})();
