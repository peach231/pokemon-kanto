// pokemon-kanto — tools/export_chars.js
// Emits each comparison sprite as its own base64 PNG data URI, so the
// side-by-side can be laid out in HTML with real labels instead of being one
// flat image. Reuses the decoder and slicing rules from compare_chars.js.
//
//   node tools/export_chars.js > tools/chars.json

'use strict';

const fs = require('fs');
const path = require('path');
const { decodePng, encodePng, hex, HAND, PAIRS, SHEET_BASE } = require('./compare_chars.js');

const CW = 16, CH = 24;

function blank() {
  // Fully transparent RGBA canvas — the page supplies the background, so the
  // sprites composite onto whichever theme is showing.
  return Buffer.alloc(CW * CH * 4);
}
function set(px, x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= CW || y >= CH) return;
  const i = (y * CW + x) * 4;
  px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255;
}
const uri = px => 'data:image/png;base64,' + encodePng(CW, CH, px).toString('base64');

async function main() {
  const out = { pairs: [] };

  for (const [key, sheet] of PAIRS) {
    // --- streamed: slice frame 0, trim, bottom-anchor into 16x24 ---
    let streamedUri = null;
    const res = await fetch(SHEET_BASE + sheet + '.png');
    if (res.ok) {
      const img = decodePng(Buffer.from(await res.arrayBuffer()));
      const bgR = img.px[0], bgG = img.px[1], bgB = img.px[2], keyed = img.px[3] >= 8;
      const isBg = i => img.px[i + 3] < 8 ||
        (keyed && Math.abs(img.px[i] - bgR) < 10 && Math.abs(img.px[i + 1] - bgG) < 10 && Math.abs(img.px[i + 2] - bgB) < 10);
      let minY = img.h, maxY = -1;
      for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
        if (!isBg((y * img.w + x) * 4)) { if (y < minY) minY = y; if (y > maxY) maxY = y; break; }
      }
      const srcH = maxY - minY + 1;
      const scaleY = Math.min(1, CH / srcH);
      const dh = Math.round(srcH * scaleY);
      const px = blank();
      for (let y = 0; y < dh; y++) for (let x = 0; x < CW; x++) {
        const sy = minY + Math.floor(y / scaleY);
        const i = (sy * img.w + x) * 4;
        if (i >= img.px.length || isBg(i)) continue;
        set(px, x, (CH - dh) + y, img.px[i], img.px[i + 1], img.px[i + 2]);
      }
      streamedUri = uri(px);
    }

    // --- hand-authored: straight from the grid ---
    const hc = HAND[key];
    const hpx = blank();
    for (let y = 0; y < CH; y++) {
      const row = hc.px[y] || '';
      for (let x = 0; x < CW; x++) {
        const col = hc.pal[row[x]];
        if (!col) continue;
        const [r, g, b] = hex(col);
        set(hpx, x, y, r, g, b);
      }
    }

    out.pairs.push({ key, label: hc.label, sheet, streamed: streamedUri, hand: uri(hpx) });
  }

  fs.writeFileSync(path.join(__dirname, 'chars.json'), JSON.stringify(out));
  console.log('wrote tools/chars.json — ' + out.pairs.length + ' pairs');
}

main().catch(e => { console.error(e); process.exit(1); });
