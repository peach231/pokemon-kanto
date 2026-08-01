// Stamp a cache token on every script tag in index.html.
//
// This game has no build step, which is a feature — but it means the browser
// caches js/engine/overworld.js and friends by filename, and a filename never
// changes. So a fix can be committed, pushed and deployed, and the player
// keeps running the old code until they happen to hard-reload. That has now
// cost a real debugging session: six frozen story battles were fixed and the
// freeze was still there, because the browser was still serving the file that
// had the bug in it.
//
// The token is a hash of the actual contents of every script index.html loads,
// so it changes exactly when the code changes and not otherwise — a normal
// reload picks up new code, and an unchanged deploy still caches properly.
//
// Run: node tools/bump_cache.js        (check.js warns when it is stale)
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');

function tokenFor(html) {
  const h = crypto.createHash('sha1');
  const files = [...html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)].map(m => m[1]);
  for (const f of files.sort()) {
    h.update(f);
    try { h.update(fs.readFileSync(path.join(ROOT, f))); } catch (e) { h.update('missing'); }
  }
  return h.digest('hex').slice(0, 8);
}

function stamp(html, token) {
  return html.replace(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g,
    (_, src) => `<script src="${src}?v=${token}"></script>`);
}

const html = fs.readFileSync(INDEX, 'utf8');
const token = tokenFor(html);
const out = stamp(html, token);

module.exports = { tokenFor, stamp };

if (require.main === module) {
  if (out === html) {
    console.log(`cache token already current: ${token}`);
  } else {
    fs.writeFileSync(INDEX, out);
    console.log(`cache token -> ${token} on ${(out.match(/\?v=/g) || []).length} scripts`);
  }
}
