// pokemon-kanto — tools/compare_chars.js
// Renders HAND-AUTHORED overworld sprites next to the STREAMED pret/pokefirered
// ones, so the art-source decision can be made by looking rather than arguing.
//
//   node tools/compare_chars.js [out.png] [scale]
//
// Left column of each pair: the streamed sheet's down-idle frame, sliced from
// the real 16x32 sheet and fitted to the engine's 16x24 slot exactly as
// gfx._sliceWalkSheet does it.
// Right column: the hand-authored grid from tools/sample_chars.js.

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = process.argv[2] || path.join(__dirname, 'chars.png');
const SCALE = parseInt(process.argv[3], 10) || 6;

// ------------------------------------------------------------- the palette --
const G = { C: {} };
new Function('G', fs.readFileSync(path.join(__dirname, '..', 'js', 'data', 'palettes.js'), 'utf8'))(G);
const HAND = require('./sample_chars.js')(G.C);

// Which pokefirered sheet each sample is being compared against.
const PAIRS = [
  ['red', 'red_normal'],
  ['oak', 'prof_oak'],
  ['brock', 'brock'],
  ['bugcatcher', 'bug_catcher']
];
const SHEET_BASE = 'https://cdn.jsdelivr.net/gh/pret/pokefirered@master/graphics/object_events/pics/people/';

// ------------------------------------------------------------ PNG decoding --
// Enough of the spec to read the indexed/RGB sheets pret ships: inflate the
// IDAT, undo the per-scanline filter, expand the palette.
function decodePng(buf) {
  let pos = 8, w = 0, h = 0, depth = 0, type = 0, pal = null, trns = null;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const tag = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (tag === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      depth = data[8]; type = data[9];
    } else if (tag === 'PLTE') pal = data;
    else if (tag === 'tRNS') trns = data;
    else if (tag === 'IDAT') idat.push(data);
    else if (tag === 'IEND') break;
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
  const bpp = Math.max(1, (channels * depth) >> 3);
  const rowBytes = Math.ceil(channels * depth * w / 8);
  const out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(rowBytes);

  for (let y = 0; y < h; y++) {
    const filter = raw[y * (rowBytes + 1)];
    const line = Buffer.from(raw.slice(y * (rowBytes + 1) + 1, (y + 1) * (rowBytes + 1)));
    for (let i = 0; i < rowBytes; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      if (filter === 1) line[i] = (line[i] + a) & 255;
      else if (filter === 2) line[i] = (line[i] + b) & 255;
      else if (filter === 3) line[i] = (line[i] + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        line[i] = (line[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (type === 3) {
        let idx;
        if (depth === 8) idx = line[x];
        else if (depth === 4) idx = (line[x >> 1] >> (x & 1 ? 0 : 4)) & 15;
        else idx = (line[x >> 3] >> (7 - (x & 7))) & 1;
        out[o] = pal[idx * 3]; out[o + 1] = pal[idx * 3 + 1]; out[o + 2] = pal[idx * 3 + 2];
        out[o + 3] = (trns && idx < trns.length) ? trns[idx] : 255;
      } else if (type === 2) {
        out[o] = line[x * 3]; out[o + 1] = line[x * 3 + 1]; out[o + 2] = line[x * 3 + 2]; out[o + 3] = 255;
      } else if (type === 6) {
        out[o] = line[x * 4]; out[o + 1] = line[x * 4 + 1];
        out[o + 2] = line[x * 4 + 2]; out[o + 3] = line[x * 4 + 3];
      }
    }
    prev = line;
  }
  return { w, h, px: out };
}

// ------------------------------------------------------------ PNG encoding --
function crc32(buf) {
  let c, t = crc32.t;
  if (!t) { t = crc32.t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(tag, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(tag, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePng(w, h, rgba) {
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
  ]);
}

// ------------------------------------------------------------------ canvas --
const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
function surface(w, h, bg) {
  const px = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) { px[i * 4] = bg[0]; px[i * 4 + 1] = bg[1]; px[i * 4 + 2] = bg[2]; px[i * 4 + 3] = 255; }
  return { w, h, px };
}
function put(s, x, y, r, g, b, scale) {
  for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) {
    const px = x * scale + sx, py = y * scale + sy;
    if (px < 0 || py < 0 || px >= s.w || py >= s.h) continue;
    const i = (py * s.w + px) * 4;
    s.px[i] = r; s.px[i + 1] = g; s.px[i + 2] = b;
  }
}

async function main() {
  // Fetch and slice the streamed sheets. Frame 0 of a 16x32 strip is the
  // down-facing idle; the engine trims the sheet's vertical dead space and
  // bottom-anchors into 16x24, so do the same here for a fair comparison.
  const streamed = {};
  for (const [, sheet] of PAIRS) {
    const res = await fetch(SHEET_BASE + sheet + '.png');
    if (!res.ok) { console.log('  MISS ' + sheet); continue; }
    const img = decodePng(Buffer.from(await res.arrayBuffer()));
    // vertical trim over the whole sheet, matching _sliceWalkSheet
    const bgR = img.px[0], bgG = img.px[1], bgB = img.px[2], bgKeyed = img.px[3] >= 8;
    const isBg = (i) => img.px[i + 3] < 8 ||
      (bgKeyed && Math.abs(img.px[i] - bgR) < 10 && Math.abs(img.px[i + 1] - bgG) < 10 && Math.abs(img.px[i + 2] - bgB) < 10);
    let minY = img.h, maxY = -1;
    for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
      if (!isBg((y * img.w + x) * 4)) { if (y < minY) minY = y; if (y > maxY) maxY = y; break; }
    }
    streamed[sheet] = { img, minY, srcH: maxY - minY + 1, isBg };
  }

  const CW = 16, CH = 24, GAPX = 6, GAPY = 8;
  const cellW = (CW * 2 + GAPX);
  const W = (cellW + 10) * PAIRS.length * SCALE;
  const H = (CH + GAPY) * SCALE + 2;
  const surf = surface(W, H, [26, 26, 36]);

  PAIRS.forEach(([key, sheet], idx) => {
    const ox = idx * (cellW + 10);

    // --- streamed (left of the pair) ---
    const st = streamed[sheet];
    if (st) {
      const scaleY = Math.min(1, CH / st.srcH);
      const dh = Math.round(st.srcH * scaleY);
      for (let y = 0; y < dh; y++) {
        for (let x = 0; x < CW; x++) {
          const sy = st.minY + Math.floor(y / scaleY);
          const i = (sy * st.img.w + x) * 4;
          if (i >= st.img.px.length || st.isBg(i)) continue;
          put(surf, ox + x, (CH - dh) + y, st.img.px[i], st.img.px[i + 1], st.img.px[i + 2], SCALE);
        }
      }
    }

    // --- hand-authored (right of the pair) ---
    const hc = HAND[key];
    if (hc) {
      for (let y = 0; y < CH; y++) {
        const row = hc.px[y] || '';
        for (let x = 0; x < CW; x++) {
          const col = hc.pal[row[x]];
          if (!col) continue;
          const [r, g, b] = hex(col);
          put(surf, ox + CW + GAPX + x, y, r, g, b, SCALE);
        }
      }
    }
  });

  fs.writeFileSync(OUT, encodePng(W, H, surf.px));
  console.log(`wrote ${OUT}  ${W}x${H}  @${SCALE}x`);
  console.log('each pair is  STREAMED (left)  |  HAND-AUTHORED (right):');
  PAIRS.forEach(([k]) => console.log('  - ' + HAND[k].label));
}

main().catch(e => { console.error(e); process.exit(1); });
