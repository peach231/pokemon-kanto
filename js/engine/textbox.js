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

    // A list longer than the screen used to be drawn anyway, straight off the
    // bottom edge: the box was sized to the full contents and then clamped
    // back on-screen, so the overflow was hidden rather than handled. Nothing
    // has outgrown it yet — SAFFRON's fifteen lines is the worst of them, and
    // it fits — but "fits by two rows" is not a property anybody can keep
    // remembering while adding stock.
    //
    // So the list scrolls. Only as many rows as there is room for are drawn,
    // the window follows the cursor, and arrows say which way there is more.
    var VIS = opts.maxRows || Math.floor((160 - 16 - 12) / 14);
    var visRows = Math.min(rows, VIS);
    var boxW = colW * cols + 12, boxH = visRows * 14 + 12;
    var x = (opts.x !== undefined) ? opts.x : 240 - boxW - 4;
    var y = (opts.y !== undefined) ? opts.y : 114 - boxH - 2;
    x = Math.max(2, Math.min(x, 240 - boxW - 2));  // stay on-screen when wide/tall
    y = Math.max(2, Math.min(y, 160 - boxH - 2));
    return {
      opaque: false,
      sel: opts.initial || 0,
      top: 0,                                  // first visible ROW
      // Keep the cursor inside the window, whichever way it just moved.
      _follow: function () {
        var r = Math.floor(this.sel / cols);
        if (r < this.top) this.top = r;
        if (r >= this.top + visRows) this.top = r - visRows + 1;
        this.top = Math.max(0, Math.min(this.top, rows - visRows));
      },
      update: function () {
        if (G.input.repeat('left')) { this.sel = (this.sel + n - 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.repeat('right')) { this.sel = (this.sel + 1) % n; G.audio.sfx('menuMove'); }
        if (G.input.repeat('up')) { if (this.sel - cols >= 0) { this.sel -= cols; G.audio.sfx('menuMove'); } }
        if (G.input.repeat('down')) { if (this.sel + cols < n) { this.sel += cols; G.audio.sfx('menuMove'); } }
        this._follow();
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
          if (row < this.top || row >= this.top + visRows) continue;
          var ix = x + 16 + col * colW, iy = y + 7 + (row - this.top) * 14;
          G.text(ctx, items[i], ix, iy, G.UI.text, G.UI.textShadow);
          if (i === this.sel) ctx.drawImage(G.IMG.ui_cursor, ix - 10, iy + 1);
        }
        // More above, more below. Without these a scrolling list looks exactly
        // like a short one that happens to be missing things.
        if (rows > visRows) {
          var ax = x + boxW - 8;
          ctx.fillStyle = G.UI.text;
          if (this.top > 0) {
            ctx.fillRect(ax, y + 4, 5, 1);
            ctx.fillRect(ax + 1, y + 3, 3, 1);
            ctx.fillRect(ax + 2, y + 2, 1, 1);
          }
          if (this.top + visRows < rows) {
            var by = y + boxH - 6;
            ctx.fillRect(ax, by, 5, 1);
            ctx.fillRect(ax + 1, by + 1, 3, 1);
            ctx.fillRect(ax + 2, by + 2, 1, 1);
          }
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
