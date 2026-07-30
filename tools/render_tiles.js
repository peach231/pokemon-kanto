// pokemon-kanto — tools/render_tiles.js
// Renders every 16x16 tile in G.ART to a single contact-sheet PNG so the art
// can actually be LOOKED at without booting a browser. Node has no canvas, so
// this writes the PNG by hand (zlib is built in).
//
//   node tools/render_tiles.js [out.png] [scale]
//
// Also renders a few composed scenes — a stretch of route, a town block, a
// cave mouth — because tiles that look fine in isolation often tile badly.

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---------------------------------------------------------------- load art --
const G = { ART: {}, C: {} };
const D = path.join(__dirname, '..', 'js', 'data');
for (const f of ['palettes.js', 'sprites_tiles.js']) {
  new Function('G', fs.readFileSync(path.join(D, f), 'utf8'))(G);
}

// ------------------------------------------------------------- PNG writer ---
function crc32(buf) {
  let c, table = crc32.t;
  if (!table) {
    table = crc32.t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

// rgba: Uint8Array of w*h*4
function encodePng(w, h, rgba) {
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;                       // filter: none
    rgba.copy
      ? rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
      : Buffer.from(rgba.subarray(y * w * 4, (y + 1) * w * 4)).copy(raw, y * (w * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;  // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// -------------------------------------------------------------- surface -----
function surface(w, h, bg) {
  const px = Buffer.alloc(w * h * 4);
  if (bg) for (let i = 0; i < w * h; i++) {
    px[i * 4] = bg[0]; px[i * 4 + 1] = bg[1]; px[i * 4 + 2] = bg[2]; px[i * 4 + 3] = 255;
  }
  return { w, h, px };
}

const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

function blitTile(surf, name, dx, dy, scale) {
  const a = G.ART[name];
  if (!a) return false;
  for (let y = 0; y < a.h; y++) {
    for (let x = 0; x < a.w; x++) {
      const col = a.pal[a.px[y][x]];
      if (!col) continue;
      const [r, g, b] = hex(col);
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = dx + x * scale + sx, py = dy + y * scale + sy;
          if (px < 0 || py < 0 || px >= surf.w || py >= surf.h) continue;
          const i = (py * surf.w + px) * 4;
          surf.px[i] = r; surf.px[i + 1] = g; surf.px[i + 2] = b; surf.px[i + 3] = 255;
        }
      }
    }
  }
  return true;
}

// ------------------------------------------------------------ contact sheet -
const SCALE = parseInt(process.argv[3], 10) || 3;
const OUT = process.argv[2] || path.join(__dirname, 'tiles.png');

const names = Object.keys(G.ART).filter(n => G.ART[n].w === 16 && G.ART[n].h === 16).sort();
const COLS = 16, GAP = 2;
const cell = 16 * SCALE + GAP;

// --- composed scenes, laid out under the sheet ---------------------------
// Tiles that read fine alone can tile badly, so check them in context.
const SCENES = [
  ['route', [
    'tttttuuuttttuuut'.split(''),  // placeholder row replaced below
  ]],
];

// Build the scenes as explicit tile-name grids.
const route = [
  ['t_tree_tl', 't_tree_tr', 't_tree_tl', 't_tree_tr', 't_grass', 't_grass2', 't_grass', 't_tallgrass', 't_tallgrass', 't_grass', 't_tree_tl', 't_tree_tr'],
  ['t_tree_bl', 't_tree_br', 't_tree_bl', 't_tree_br', 't_grass2', 't_deco_bush', 't_grass', 't_tallgrass', 't_tallgrass', 't_grass2', 't_tree_bl', 't_tree_br'],
  ['t_grass', 't_grass2', 't_grass', 't_path_n', 't_path_n', 't_path_n', 't_path_n', 't_path_n', 't_path_n', 't_grass', 't_deco_fern', 't_grass'],
  ['t_grass2', 't_deco_flowerY', 't_grass', 't_path', 't_path', 't_path', 't_path', 't_path', 't_path', 't_grass2', 't_grass', 't_deco_stump'],
  ['t_grass', 't_grass', 't_grass2', 't_path_s', 't_path_s', 't_path_s', 't_path_s', 't_path_s', 't_path_s', 't_grass', 't_grass2', 't_grass'],
  ['t_ledge', 't_ledge', 't_ledge', 't_ledge', 't_ledge', 't_ledge', 't_ledge', 't_ledge', 't_ledge', 't_ledge', 't_ledge', 't_ledge'],
  ['t_grass', 't_deco_pebble', 't_grass2', 't_grass', 't_cuttree', 't_grass', 't_grass2', 't_rock', 't_grass', 't_grass', 't_grass2', 't_grass'],
  ['t_shore_n', 't_shore_n', 't_shore_n', 't_shore_n', 't_shore_n', 't_shore_n', 't_shore_n', 't_shore_n', 't_shore_n', 't_shore_n', 't_shore_n', 't_shore_n'],
  ['t_water1', 't_water1', 't_water1', 't_water1', 't_water1', 't_water1', 't_water1', 't_water1', 't_water1', 't_water1', 't_water1', 't_water1']
];

// A town block: Centre (red), Mart (blue), gym (slate), house (terracotta).
const town = [
  ['t_grass', 't_hroof_tl', 't_hroofx', 't_hroof_tm', 't_hroof_tr', 't_grass', 't_sroof_tl', 't_sroofx', 't_sroof_tm', 't_sroof_tr', 't_grass', 't_grass'],
  ['t_grass', 't_hroof_bl', 't_healsign', 't_hroof_bm', 't_hroof_br', 't_grass', 't_sroof_bl', 't_shopsign', 't_sroof_bm', 't_sroof_br', 't_grass', 't_grass'],
  ['t_grass', 't_wall', 't_window', 't_gdoor', 't_wall', 't_grass', 't_wall', 't_window', 't_gdoor', 't_wall', 't_grass', 't_grass'],
  ['t_path', 't_path', 't_path', 't_path', 't_path', 't_path', 't_path', 't_path', 't_path', 't_path', 't_path', 't_path'],
  ['t_grass', 't_groof_tl', 't_groof_tm', 't_groof_tr', 't_grass', 't_roof_tl', 't_roof_tm', 't_roof_tr', 't_grass', 't_fence', 't_fence', 't_sign'],
  ['t_grass', 't_groof_bl', 't_groof_bm', 't_groof_br', 't_grass', 't_roof_bl', 't_roof_bm', 't_roof_br', 't_grass', 't_grass', 't_grass', 't_grass'],
  ['t_grass', 't_wall', 't_gymdoor', 't_wall', 't_grass', 't_wall', 't_door', 't_window', 't_grass', 't_grass', 't_deco_bush', 't_grass']
];

// Cave, tower, steel and marble, side by side.
const inter = [
  ['t_cavewall', 't_cavewall', 't_cavewall', 't_towerwall', 't_towerwall', 't_towerwall', 't_metalwall', 't_metalwall', 't_metalwall', 't_marblewall', 't_marblewall', 't_marblewall'],
  ['t_cavefloor', 't_boulder', 't_cavefloor', 't_towerfloor', 't_grave', 't_towerfloor', 't_metalfloor', 't_metalfloor', 't_metalfloor', 't_marble', 't_marble', 't_marble'],
  ['t_cavefloor', 't_cavefloor', 't_cavefloor', 't_towerfloor', 't_towerfloor', 't_towerfloor', 't_metalfloor', 't_metalfloor', 't_metalfloor', 't_marble', 't_redcarpet', 't_marble'],
  ['t_darkwall', 't_darkwall', 't_darkwall', 't_icewall', 't_icewall', 't_icewall', 't_iwall', 't_iwall', 't_iwall', 't_gfloor', 't_gfloor', 't_gfloor'],
  ['t_darkfloor', 't_darkfloor', 't_darkfloor', 't_icefloor', 't_icefloor', 't_icefloor', 't_ifloor', 't_itable', 't_ifloor', 't_gfloor', 't_statue', 't_gfloor'],
  ['t_darkfloor', 't_darkfloor', 't_darkfloor', 't_icefloor', 't_icefloor', 't_icefloor', 't_ibook', 't_imach', 't_icounter', 't_gfloor', 't_gfloor', 't_gfloor']
];

// Object tiles are transparent-backed so the ground layer shows through them.
// The scene composer therefore has to underlay a base tile, exactly as the
// overworld renderer does — otherwise every tree and boulder reads as a hole.
const scenes = [
  { grid: route, under: 't_grass' },
  { grid: town,  under: 't_grass' },
  { grid: inter, under: null }
];
const sheetRows = Math.ceil(names.length / COLS);
const sheetH = sheetRows * cell;
const sceneH = scenes.reduce((a, s) => a + s.grid.length * 16 * SCALE + 10, 0);

const W = COLS * cell;
const H = sheetH + 14 + sceneH;
const surf = surface(W, H, [24, 24, 32]);

names.forEach((n, i) => {
  blitTile(surf, n, (i % COLS) * cell, Math.floor(i / COLS) * cell, SCALE);
});

let y = sheetH + 14;
for (const scene of scenes) {
  scene.grid.forEach((row, ry) => {
    row.forEach((n, rx) => {
      const dx = rx * 16 * SCALE, dy = y + ry * 16 * SCALE;
      if (scene.under) blitTile(surf, scene.under, dx, dy, SCALE);
      blitTile(surf, n, dx, dy, SCALE);
    });
  });
  y += scene.grid.length * 16 * SCALE + 10;
}

fs.writeFileSync(OUT, encodePng(W, H, surf.px));
console.log(`wrote ${OUT}  ${W}x${H}  (${names.length} tiles @ ${SCALE}x, ${scenes.length} composed scenes)`);
console.log('\ntile order, row by row:');
for (let r = 0; r < sheetRows; r++) {
  console.log('  ' + names.slice(r * COLS, (r + 1) * COLS).map(s => s.replace(/^t_/, '')).join(' '));
}
