// Pokéram — tools/spritegen.js
// Offline pixel-art rasterizer used to BAKE creature sprite grids. Each
// creature has a hand-written shape recipe (tools/recipes_*.js); this renders
// the recipe to a palette-indexed grid with clean 1px outlines and consistent
// upper-left lighting, and the result is committed as plain data in
// js/data/sprites_mons_*.js. Art iteration loop: edit recipe -> bake ->
// gallery screenshot -> tweak.

'use strict';

function Grid(w, h) {
  this.w = w; this.h = h;
  this.c = new Array(w * h).fill(null);
}

Grid.prototype.set = function (x, y, ch) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
  this.c[y * this.w + x] = ch;
};

Grid.prototype.get = function (x, y) {
  if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
  return this.c[y * this.w + x];
};

// filled ellipse, flat color
Grid.prototype.ellipse = function (cx, cy, rx, ry, ch) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) this.set(x, y, ch);
    }
  }
};

// filled ellipse with 3-tone shading, light from upper-left:
// crescent highlight toward the light, core shadow away from it
Grid.prototype.ball = function (cx, cy, rx, ry, base, lite, dark, opts) {
  opts = opts || {};
  const lx = opts.lx !== undefined ? opts.lx : -0.6, ly = opts.ly !== undefined ? opts.ly : -0.8;
  const liteCut = opts.liteCut !== undefined ? opts.liteCut : 0.38;
  const darkCut = opts.darkCut !== undefined ? opts.darkCut : 0.45;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      const d2 = dx * dx + dy * dy;
      if (d2 > 1) continue;
      const dot = dx * lx + dy * ly; // >0 → toward the light corner
      let ch = base;
      if (lite && dot > liteCut && d2 > 0.12) ch = lite;
      if (dark && dot < -darkCut && d2 > 0.2) ch = dark;
      this.set(x, y, ch);
    }
  }
};

// triangle fill (ears, beaks, leaves, spikes)
Grid.prototype.tri = function (x0, y0, x1, y1, x2, y2, ch) {
  const minX = Math.floor(Math.min(x0, x1, x2)), maxX = Math.ceil(Math.max(x0, x1, x2));
  const minY = Math.floor(Math.min(y0, y1, y2)), maxY = Math.ceil(Math.max(y0, y1, y2));
  const area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
  if (area === 0) return;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const w0 = ((x1 - x) * (y2 - y) - (x2 - x) * (y1 - y)) / area;
      const w1 = ((x2 - x) * (y0 - y) - (x0 - x) * (y2 - y)) / area;
      const w2 = 1 - w0 - w1;
      if (w0 >= -0.001 && w1 >= -0.001 && w2 >= -0.001) this.set(x, y, ch);
    }
  }
};

// thick line (limbs, tails, stems)
Grid.prototype.line = function (x0, y0, x1, y1, ch, thick) {
  thick = thick || 1;
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    if (thick <= 1) this.set(x, y, ch);
    else this.ellipse(x, y, thick / 2, thick / 2, ch);
  }
};

Grid.prototype.rect = function (x0, y0, w, h, ch) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set(x, y, ch);
};

// elliptical ring (horns, open mouths, collars). thickness in normalized units.
Grid.prototype.ring = function (cx, cy, rx, ry, ch, thickness, fromDeg, toDeg) {
  thickness = thickness || 0.4;
  const a0 = (fromDeg === undefined ? 0 : fromDeg) * Math.PI / 180;
  const a1 = (toDeg === undefined ? 360 : toDeg) * Math.PI / 180;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      const d2 = dx * dx + dy * dy;
      if (d2 > 1 || d2 < (1 - thickness) * (1 - thickness)) continue;
      let ang = Math.atan2(dy, dx);
      if (ang < 0) ang += Math.PI * 2;
      if (a1 >= a0 ? (ang >= a0 && ang <= a1) : (ang >= a0 || ang <= a1)) this.set(x, y, ch);
    }
  }
};

// 1px outline: filled cells that touch empty (4-neighborhood) become `ch`
Grid.prototype.outline = function (ch) {
  ch = ch || 'o';
  const marks = [];
  for (let y = 0; y < this.h; y++) {
    for (let x = 0; x < this.w; x++) {
      const v = this.get(x, y);
      if (v === null || v === ch) continue;
      if (this.get(x - 1, y) === null || this.get(x + 1, y) === null ||
          this.get(x, y - 1) === null || this.get(x, y + 1) === null) {
        marks.push([x, y]);
      }
    }
  }
  for (const [x, y] of marks) this.set(x, y, ch);
};

// interior 1px seam between two different fill groups (e.g. head over shell).
// chA/chB: char or array of chars; marks the A-side cell.
Grid.prototype.seam = function (chA, chB, ch) {
  const inA = Array.isArray(chA) ? (c) => chA.includes(c) : (c) => c === chA;
  const inB = Array.isArray(chB) ? (c) => chB.includes(c) : (c) => c === chB;
  const marks = [];
  for (let y = 0; y < this.h; y++) {
    for (let x = 0; x < this.w; x++) {
      if (!inA(this.get(x, y))) continue;
      if (inB(this.get(x + 1, y)) || inB(this.get(x - 1, y)) ||
          inB(this.get(x, y + 1)) || inB(this.get(x, y - 1))) {
        marks.push([x, y]);
      }
    }
  }
  for (const [x, y] of marks) this.set(x, y, ch);
};

// --------------------------------------------------------------------------
// EYE PRIMITIVES — the face library. Drawn after outline(), so each is
// self-contained. 'W' = sclera white, 'K' = glint (auto-added to palettes
// at bake time if missing).
// --------------------------------------------------------------------------

// local helper: fill an ellipse and ink its own boundary ring
Grid.prototype._eyeBall = function (cx, cy, rx, ry, fillCh) {
  const inside = (x, y) => {
    const dx = (x - cx) / rx, dy = (y - cy) / ry;
    return dx * dx + dy * dy <= 1;
  };
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      this.set(x, y, edge ? 'o' : fillCh);
    }
  }
};

// default eye: full dark rounded oval with a clean interior glint and a tiny
// lower catch-light — the classic cute-Pokémon eye (Squirtle/Chikorita style).
Grid.prototype.eye = function (x, y, w, h) {
  const rx = (w - 1) / 2 + 0.3, ry = (h - 1) / 2 + 0.3;
  const cx = x + (w - 1) / 2, cy = y + (h - 1) / 2;
  this.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 'o');
  // real-sprite doctrine: eyes are solid dark; at most ONE bright pixel
  if (w >= 4 && h >= 4) {
    this.set(Math.max(x + 1, Math.round(cx - rx * 0.3)), Math.max(y + 1, Math.round(cy - ry * 0.3)), 'K');
  }
};

// white-sclera variant: white ball, dark pupil, glint (for the few faces
// that suit it — fierce or goofy species)
Grid.prototype.eyeSclera = function (x, y, w, h, iris) {
  const rx = (w - 1) / 2, ry = (h - 1) / 2;
  const cx = x + rx, cy = y + ry;
  this._eyeBall(cx, cy, rx, ry, 'W');
  const prx = Math.max(1, rx * 0.55), pry = Math.max(1, ry * 0.5);
  this.ellipse(cx, cy + ry * 0.22, prx, pry, iris || 'o');
  this.set(Math.round(cx - prx * 0.5), Math.round(cy - pry * 0.4), 'K');
};

// tiny round dot eye (rodents, bugs, minimal faces)
Grid.prototype.eyeDot = function (cx, cy, r) {
  this.ellipse(cx, cy, r || 1.5, r || 1.5, 'o');
  this.set(cx - 1, cy - 1, 'K');
};

// almond predator eye: flat brow on top, pointed oval, bright pupil
Grid.prototype.eyeAlmond = function (x, y, w, h, pupil) {
  const rx = (w - 1) / 2, ry = (h - 1) / 2;
  const cx = x + rx, cy = y + ry;
  this.ellipse(cx, cy, rx, ry, 'o');
  this.line(x, y + 1, x + w - 1, y + 1, 'o', 1); // hard brow
  this.set(cx, cy + 0.5, pupil || 'K');
  this.set(cx + 1, cy + 0.5, pupil || 'K');
};

// glow eye: solid dark round with a luminous core (ghosts, machines)
Grid.prototype.eyeGlow = function (x, y, w, h, glow) {
  const rx = (w - 1) / 2, ry = (h - 1) / 2;
  const cx = x + rx, cy = y + ry;
  this.ellipse(cx, cy, rx, ry, 'o');
  this.ellipse(cx, cy, Math.max(1, rx * 0.45), Math.max(1, ry * 0.45), glow || 'K');
};

// sleepy closed eye: gentle down-curved lid
Grid.prototype.eyeSleepy = function (x, y, w) {
  this.line(x, y, x + w - 1, y, 'o', 1);
  this.set(x, y + 1, 'o');
  this.set(x + w - 1, y + 1, 'o');
};

Grid.prototype.render = function () {
  const rows = [];
  for (let y = 0; y < this.h; y++) {
    let row = '';
    for (let x = 0; x < this.w; x++) {
      const v = this.c[y * this.w + x];
      row += v === null ? '.' : v;
    }
    rows.push(row);
  }
  return rows;
};

// trim fully-empty top/bottom rows? (keep fixed box for alignment — no trim)

module.exports = { Grid };
