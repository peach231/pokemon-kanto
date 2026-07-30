// Pokéram — textbox.js
// Dialogue box scene (letter-by-letter text, paged), plus the list chooser
// used for yes/no prompts, move selection, etc. Both push onto the scene
// stack over whatever is showing.

(function () {
  var BOX_X = 2, BOX_Y = 114, BOX_W = 236, BOX_H = 44;
  var TEXT_X = BOX_X + 10, TEXT_Y = BOX_Y + 9, TEXT_W = BOX_W - 20;
  var LINE_H = 14, LINES_PER_PAGE = 2;
  var CHARS_PER_FRAME = 2;

  // text: string or array of strings (each entry = its own page group)
  // opts: { onDone }
  G.Textbox = function (text, opts) {
    opts = opts || {};
    var paragraphs = Array.isArray(text) ? text : [text];
    var pages = [];
    for (var p = 0; p < paragraphs.length; p++) {
      var lines = G.textWrap(paragraphs[p], TEXT_W);
      for (var i = 0; i < lines.length; i += LINES_PER_PAGE) {
        pages.push(lines.slice(i, i + LINES_PER_PAGE));
      }
    }
    if (!pages.length) pages = [['']];

    return {
      opaque: false,
      page: 0,
      shown: 0, // characters revealed on current page
      update: function () {
        var total = this._pageLen();
        if (this.shown < total) {
          this.shown = Math.min(total, this.shown + CHARS_PER_FRAME);
          if (G.input.justPressed('A') || G.input.justPressed('B')) this.shown = total;
          return;
        }
        if (G.input.justPressed('A') || G.input.justPressed('B')) {
          G.audio.sfx('confirm');
          if (this.page < pages.length - 1) {
            this.page++;
            this.shown = 0;
          } else {
            G.popScene();
            if (opts.onDone) opts.onDone();
          }
        }
      },
      _pageLen: function () {
        var n = 0;
        for (var i = 0; i < pages[this.page].length; i++) n += pages[this.page][i].length;
        return n;
      },
      draw: function (ctx) {
        G.nineSlice(ctx, G.IMG.ui_box, BOX_X, BOX_Y, BOX_W, BOX_H, 4);
        var remaining = this.shown;
        var lines = pages[this.page];
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          var n = Math.min(line.length, Math.max(0, remaining));
          remaining -= line.length;
          G.text(ctx, line.slice(0, n), TEXT_X, TEXT_Y + i * LINE_H, G.UI.text, G.UI.textShadow);
        }
        // continue arrow
        if (this.shown >= this._pageLen() && (G.frame >> 4) % 2 === 0) {
          G.text(ctx, '▼', BOX_X + BOX_W - 16, BOX_Y + BOX_H - 14, G.UI.text);
        }
      }
    };
  };

  // Vertical list chooser in a compact box. opts:
  //   items: ['Yes','No']           labels
  //   x, y                          top-left (defaults: above textbox, right)
  //   onPick(index), onCancel()     cancel = B (defaults to last item)
  //   cancelIndex: index B maps to (default items.length-1; -1 = call onCancel)
  G.Chooser = function (opts) {
    var items = opts.items;
    var n = items.length;
    var cols = opts.cols || 1;                 // opt-in grid (shops pass cols: 2)
    var rows = Math.ceil(n / cols);
    var w = 0;
    for (var i = 0; i < items.length; i++) w = Math.max(w, G.textWidth(items[i]));
    var colW = w + 18;
    var boxW = colW * cols + 12, boxH = rows * 14 + 12;
    var x = (opts.x !== undefined) ? opts.x : 240 - boxW - 4;
    var y = (opts.y !== undefined) ? opts.y : 114 - boxH - 2;
    x = Math.max(2, Math.min(x, 240 - boxW - 2));  // stay on-screen when wide/tall
    y = Math.max(2, Math.min(y, 160 - boxH - 2));
    return {
      opaque: false,
      sel: opts.initial || 0,
      update: function () {
        if (G.input.repeat('left')) { this.sel = (this.sel + n - 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.repeat('right')) { this.sel = (this.sel + 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.repeat('up')) { if (this.sel - cols >= 0) { this.sel -= cols; G.audio.sfx('menuMove'); } }
        if (G.input.repeat('down')) { if (this.sel + cols < n) { this.sel += cols; G.audio.sfx('menuMove'); } }
        if (G.input.justPressed('A')) {
          G.audio.sfx('confirm');
          var pick = this.sel;
          G.popScene();
          if (opts.onPick) opts.onPick(pick);
        } else if (G.input.justPressed('B')) {
          G.audio.sfx('cancel');
          G.popScene();
          var ci = (opts.cancelIndex !== undefined) ? opts.cancelIndex : items.length - 1;
          if (ci === -1) { if (opts.onCancel) opts.onCancel(); }
          else if (opts.onPick) opts.onPick(ci);
        }
      },
      draw: function (ctx) {
        G.nineSlice(ctx, G.IMG.ui_box, x, y, boxW, boxH, 4);
        for (var i = 0; i < items.length; i++) {
          var col = i % cols, row = Math.floor(i / cols);
          var ix = x + 16 + col * colW, iy = y + 7 + row * 14;
          G.text(ctx, items[i], ix, iy, G.UI.text, G.UI.textShadow);
          if (i === this.sel) ctx.drawImage(G.IMG.ui_cursor, ix - 10, iy + 1);
        }
      }
    };
  };

  // Convenience: ask a yes/no question through a textbox + chooser.
  G.ask = function (question, onYes, onNo) {
    G.pushScene(G.Textbox(question, {
      onDone: function () {
        G.pushScene(G.Chooser({
          items: ['Yes', 'No'],
          onPick: function (i) { if (i === 0) { if (onYes) onYes(); } else { if (onNo) onNo(); } }
        }));
      }
    }));
  };
})();
