// pokemon-kanto — tools/png.js
// A minimal PNG reader, for the offline tools only. Nothing in the game uses
// this: the browser decodes its own images.
//
// It exists because sprite-sheet bugs are invisible from the outside. A sheet
// sliced at the wrong frame width, or read as a walk cycle when its frames are
// paired by facing, produces perfectly valid-looking output — half a person, or
// a rider who faces north while travelling west — and no amount of checking the
// CODE finds it. The only ground truth is the pixels.

'use strict';

const fs = require('fs');
const zlib = require('zlib');

// Returns { w, h, at(x, y) -> palette index or -1 for background }.
// Indexed and truecolour PNGs both work; the background is whatever the
// top-left pixel is, which is how these sheets are keyed.
function read(file) {
  const b = fs.readFileSync(file);
  let p = 8, w = 0, h = 0, bd = 0, ct = 0, pal = null, trns = null;
  const idat = [];
  while (p < b.length) {
    const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8);
    const data = b.slice(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; }
    else if (type === 'PLTE') pal = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (!w) throw new Error(`${file}: no IHDR`);
  if (bd > 8) throw new Error(`${file}: ${bd}-bit channels are not supported`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const chan = ct === 6 ? 4 : ct === 2 ? 3 : ct === 4 ? 2 : 1;
  const bpp = Math.max(1, (chan * bd) / 8);
  const stride = Math.ceil((w * chan * bd) / 8);
  const out = Buffer.alloc(h * stride);
  let o = 0;
  for (let y = 0; y < h; y++) {
    const ft = raw[o++], line = raw.slice(o, o + stride);
    o += stride;
    const cur = out.slice(y * stride, (y + 1) * stride);
    const prev = y ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, up = prev[i], ul = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (ft === 1) v += a;
      else if (ft === 2) v += up;
      else if (ft === 3) v += (a + up) >> 1;
      else if (ft === 4) {
        const est = a + up - ul;
        const da = Math.abs(est - a), du = Math.abs(est - up), dl = Math.abs(est - ul);
        v += (da <= du && da <= dl) ? a : (du <= dl ? up : ul);
      }
      cur[i] = v & 255;
    }
  }

  // One number per pixel, so frames can be compared exactly. Indexed images use
  // the palette index; anything else is packed rgb.
  const value = (x, y) => {
    if (ct === 3) {
      if (bd === 8) return out[y * stride + x];
      const per = 8 / bd, shift = 8 - bd * ((x % per) + 1);
      return (out[y * stride + Math.floor(x / per)] >> shift) & ((1 << bd) - 1);
    }
    const i = y * stride + x * chan;
    if (ct === 6) return out[i + 3] < 8 ? -1 : ((out[i] << 16) | (out[i + 1] << 8) | out[i + 2]);
    if (ct === 2) return (out[i] << 16) | (out[i + 1] << 8) | out[i + 2];
    return (out[i] << 16) | (out[i] << 8) | out[i];
  };
  const bgIndex = value(0, 0);
  const bgClear = ct === 3 && trns && bgIndex < trns.length && trns[bgIndex] < 8;
  return {
    w, h,
    at(x, y) {
      const v = value(x, y);
      if (v === -1) return -1;
      if (v === bgIndex && (bgClear || ct !== 3)) return -1;
      return v === bgIndex ? -1 : v;
    }
  };
}

// Split a single-row sheet into frames and describe each one, so a caller can
// work out what the frames MEAN rather than assuming a layout.
function frames(img, fw) {
  const out = [];
  for (let f = 0; f * fw < img.w; f++) {
    const g = [];
    let n = 0;
    for (let y = 0; y < img.h; y++) {
      const row = [];
      for (let x = 0; x < fw; x++) {
        const v = img.at(f * fw + x, y);
        row.push(v);
        if (v !== -1) n++;
      }
      g.push(row);
    }
    out.push({ px: g, count: n });
  }
  return out;
}

// How much of one frame matches another, ignoring pixels both leave empty.
function similarity(a, b, mirrored) {
  const h = a.px.length, w = a.px[0].length;
  let same = 0, total = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = a.px[y][x], q = mirrored ? b.px[y][w - 1 - x] : b.px[y][x];
      if (p === -1 && q === -1) continue;
      total++;
      if (p === q) same++;
    }
  }
  return total ? same / total : 0;
}

// A front or back view is very nearly its own mirror image. A side view is not.
// This is the only reliable way to tell which frames on a sheet face sideways
// without looking at it.
function symmetry(frame) { return similarity(frame, frame, true); }

module.exports = { read, frames, similarity, symmetry };
