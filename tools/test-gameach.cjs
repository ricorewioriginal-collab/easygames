#!/usr/bin/env node
// Prüft cloud/anmacha-gameach.js (eigene Erfolge der Spiele) ohne Browser: Registry, Robustheit gegen Müll, Standard-Schlüssel, Katalog/Kategorien.  Aufruf: node tools/test-gameach.cjs
const assert = require('node:assert/strict'), fs = require('fs'), path = require('path');
const store = {}; global.window = { localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, get length() { return Object.keys(store).length; }, key: i => Object.keys(store)[i] } };
const G = require('../cloud/anmacha-gameach.js'), A = require('../cloud/anmacha-ach.js'), ok = t => console.log('PASS ' + t);
const ids = Object.keys(G.REG);
assert(ids.length >= 9, 'Registry gefüllt'); 

ids.forEach(id => {
  const e = G.REG[id];
  assert(e.title && e.keys.length && typeof e.read === 'function' && e.defs.length, id + ' vollständig');
  assert.equal(new Set(e.defs.map(d => d.id)).size, e.defs.length, id + ': eindeutige Erfolgs-IDs');
  e.defs.forEach(d => assert(d.id && d.icon && d.title && d.desc, id + '/' + d.id + ': Icon, Titel und Text'));
  e.keys.forEach(k => ['', 'x', 'null', '[]', '{}', '0', '{"a":', '"s"'].forEach(raw => {
    Object.keys(store).forEach(x => delete store[x]); store[k] = raw;
    let r; assert.doesNotThrow(() => { r = G.collectOne(id); }, id + ' wirft bei "' + raw + '"');
    assert.equal(r.done, 0, id + ': Müll schaltet nichts frei (' + raw + ')'); assert.equal(r.total, e.defs.length);
  }));
});
Object.keys(store).forEach(x => delete store[x]);
ok('Registry: ' + ids.length + ' Spiele, ' + ids.reduce((t, i) => t + G.REG[i].defs.length, 0) + ' Erfolge, Müll-Eingaben schalten nichts frei');

// Wobbel: Spielstand mit Erfolgen
store.wobbelSave1 = JSON.stringify({ ach: { first: 1700000000000, ten: true, unbekannt: 5 } });
let r = G.collectOne('wobbel');
assert.equal(r.done, 2); assert.equal(r.unlocked.first, 1700000000000); assert.equal(r.unlocked.ten, 1); assert(!('unbekannt' in r.unlocked), 'nur definierte Erfolge zählen');
assert.deepEqual(Object.keys(G.collect()).sort(), ids.slice().sort(), 'collect: alle Registry-Spiele (auch ohne Fortschritt, damit die Liste vollständig ist)');
ok('Wobbel: Zeiten und Flaggen aus dem Spielstand, unbekannte IDs ignoriert');

// Standard für neue Spiele
store['anmacha-gameach.neu'] = JSON.stringify({ t: 'Neues Spiel', d: [{ id: 'a', icon: '🎈', title: 'Ballon', desc: 'Platze einen.' }, { id: 'a', title: 'doppelt' }, { id: 'b', title: 'Zwei' }, { nope: 1 }], u: { a: 1800000000000, zzz: 1 } });
r = G.collect().neu;
assert(r && r.title === 'Neues Spiel' && r.total === 2 && r.done === 1 && r.unlocked.a === 1800000000000, JSON.stringify(r));
store['anmacha-gameach.kaputt'] = '{'; store['anmacha-gameach.leer'] = JSON.stringify({ d: [] });
assert.deepEqual(Object.keys(G.collect()).sort(), ids.concat('neu').sort());
ok('Standard anmacha-gameach.<id>: Definitionen bereinigt, Freischaltungen gezählt, kaputte Einträge ignoriert');

// Zusammenspiel mit anmacha-ach: eigene Erfolge zählen für ownach/allgame, Profilwerte (gu) werden vereinigt
const own = G.collect(), ex = (() => { const gu = {}; Object.keys(own).forEach(g => Object.keys(own[g].unlocked).forEach(i => { gu[g + ':' + i] = 5; })); return gu; })();
const s = A.statsOf({ games: [], state: { gu: ex }, own });
assert.equal(s.ownach, 3); assert.equal(s.allgame, 0);
ok('Zusammenspiel: Spiel-Erfolge zählen für die Gesamt-Erfolge');

// Alle Katalogspiele mit Cloud-ID stehen in einer Kategorie
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sync', 'catalog.json'), 'utf8')), list = Array.isArray(cat) ? cat : cat.games || [];
const miss = list.filter(g => g.cloud && g.cloud.game && !A.GENRE_OF[g.cloud.game]).map(g => g.cloud.game);
assert.deepEqual(miss, [], 'Spiele ohne Kategorie in anmacha-ach.js: ' + miss.join(', '));
const unknown = ids.filter(i => !A.GENRE_OF[i]); assert.deepEqual(unknown, [], 'Registry-Spiele ohne Kategorie');
ok('Katalog: alle ' + list.filter(g => g.cloud && g.cloud.game).length + ' Spiele mit Cloud-ID haben eine Kategorie');
