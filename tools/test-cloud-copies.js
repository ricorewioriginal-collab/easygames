#!/usr/bin/env node
// Alle Exemplare von anmacha-cloud.js im Repo müssen mit cloud/anmacha-cloud.js übereinstimmen (sonst fehlt z. B. die App-Erkennung
// und die Google-Anmeldung scheitert in der App nur in einzelnen Spielen). Aufruf: node tools/test-cloud-copies.js
'use strict';
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const master = fs.readFileSync(path.join(root, 'cloud', 'anmacha-cloud.js'), 'utf8');
const copies = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules' || e.name === 'dist') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/^anmacha-cloud.*\.js$/.test(e.name) && p !== path.join(root, 'cloud', e.name)) copies.push(p);
  }
})(root);
let bad = 0;
for (const f of copies) {
  const same = fs.readFileSync(f, 'utf8') === master;
  console.log((same ? 'OK    ' : 'FEHLER') + ' ' + path.relative(root, f) + (same ? '' : '  weicht von cloud/anmacha-cloud.js ab – kopieren: cp cloud/anmacha-cloud.js ' + path.relative(root, f)));
  if (!same) bad++;
}
if (!copies.length) console.log('Keine weiteren Exemplare.');
process.exit(bad ? 1 : 0);
