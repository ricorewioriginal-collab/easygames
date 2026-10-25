#!/usr/bin/env node
// Prüft die Spielanleitungen guides/<id>.json (Handbuch, Ratgeber, Lösungsbuch) für alle Spiele aus games.js.
// Aufruf: node tools/check-guides.js [spiel-id …]   – Rückgabe 1 bei Fehlern
const fs = require('fs'), path = require('path'), R = path.join(__dirname, '..');
global.window = {}; require(path.join(R, 'games.js')); const ids = (window.EASYGAMES_GAMES || []).map(g => g.id);
const only = process.argv.slice(2), list = only.length ? only : ids; let errs = 0, warns = 0, total = 0;
const err = (id, m) => { errs++; console.log('FEHLER ' + id + ': ' + m); }, warn = (id, m) => { warns++; console.log('Hinweis ' + id + ': ' + m); };
const PARTS = { handbuch: 4, ratgeber: 3, loesung: 3 };
const txt = s => typeof s === 'string' && s.trim().length > 0 && !/<\/?[a-z][^>]*>|\*\*|^#+\s/i.test(s);
for (const id of list) {
  if (!ids.includes(id)) { err(id, 'kein Spiel in games.js'); continue; }
  const f = path.join(R, 'guides', id + '.json'); if (!fs.existsSync(f)) { err(id, 'guides/' + id + '.json fehlt'); continue; }
  let d; try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { err(id, 'kein gültiges JSON: ' + e.message); continue; }
  if (d.id !== id) err(id, '"id" muss "' + id + '" sein');
  let chars = 0;
  for (const [k, min] of Object.entries(PARTS)) {
    const a = d[k]; if (!Array.isArray(a) || a.length < min) { err(id, `"${k}" braucht mindestens ${min} Abschnitte`); continue; }
    a.forEach((s, i) => { const where = `${k}[${i}]`;
      if (!s || !txt(s.t)) return err(id, where + ': Überschrift "t" fehlt oder enthält HTML/Markdown');
      const parts = ['p', 'list', 'steps'].filter(x => s[x] !== undefined); if (!parts.length) err(id, where + ' („' + s.t + '“): ohne Inhalt (p, list oder steps)');
      parts.forEach(x => { if (!Array.isArray(s[x]) || !s[x].length || !s[x].every(txt)) err(id, `${where}.${x}: Liste aus Text ohne HTML/Markdown erwartet`); else chars += s[x].join('').length; });
      Object.keys(s).forEach(x => { if (!['t', 'p', 'list', 'steps'].includes(x)) err(id, `${where}: unbekanntes Feld "${x}"`); }); });
  }
  if (d.faq !== undefined) { if (!Array.isArray(d.faq) || !d.faq.every(q => q && txt(q.q) && txt(q.a))) err(id, '"faq": Liste aus { q, a } erwartet'); else chars += d.faq.map(q => q.q + q.a).join('').length; }
  Object.keys(d).forEach(x => { if (!['id', 'handbuch', 'ratgeber', 'loesung', 'faq', 'kurz'].includes(x)) err(id, `unbekanntes Feld "${x}"`); });
  if (chars < 3000) warn(id, `nur ${chars} Zeichen Text – wirklich vollständig?`);
  total += chars;
}
console.log(`${list.length} Anleitungen geprüft: ${errs} Fehler, ${warns} Hinweise, ${Math.round(total / 1024)} KB Text`);
process.exit(errs ? 1 : 0);
