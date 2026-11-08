// Klavierlicht – Kern-Test (Node): Notation, Längen, Lichter je Schwierigkeit, Spuren, Begleitung, Wertung, Archiv
const C = require('../js/core.js'); require('../js/songs.js'); const SRC = require('../tools/archiv-quelle.js');
const fs = require('fs'), path = require('path'); let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) fail++; };
const len = s => s.trim().split(/\s+/).reduce((a, t) => { const m = /(?:\*([\d.]+)|\/([\d.]+))$/.exec(t); return a + (m ? (m[1] ? +m[1] : 1 / +m[2]) : 1); }, 0);
ok(C.midi('C4') === 60 && C.midi('A4') === 69 && C.midi('F#5') === 78 && C.midi('Bb3') === 58, 'Notennamen → MIDI');
const all = KLSongs.list.concat(SRC);
ok(all.every(s => Math.abs(len(s.mel) - len(s.chords)) < 1e-6), 'Melodie und Akkorde gleich lang (alle ' + all.length + ' Lieder)');
ok(new Set(all.map(s => s.id)).size === all.length, 'eindeutige Lied-IDs');
ok(all.every(s => s.mel.trim().split(/\s+/).every(t => t.replace(/[*/][\d.]+$/, '') === '-' || C.midi(t.replace(/[*/][\d.]+$/, '')) != null)), 'alle Töne lesbar');
ok(all.every(s => KLSongs.CATS[s.cat]), 'jede Kategorie bekannt');
const c = C.fromNotation(KLSongs.list[0]);
ok(C.check(c) && c.mel[0][1] === 60 && c.mel[0][2] === 4 && C.duration(c) >= 35, 'Chart aus Notation, kurze Lieder wiederholt (' + C.fmt(C.duration(c)) + ')');
for (const lvl of Object.keys(C.LEVELS)) {
  const n = C.playable(C.fromNotation(KLSongs.list.find(s => s.id === 'elise')), lvl), L = C.LEVELS[lvl];
  ok(n.every(x => x.lane >= 0 && x.lane < L.lanes) && n.every((x, i) => !i || x.t - n[i - 1].t >= L.gap - 1e-9), `${L.n}: ${n.length} Lichter, Spuren 0–${L.lanes - 1}, Mindestabstand`);
}
const e = C.playable(C.fromNotation(KLSongs.list.find(s => s.id === 'ode')), 'normal');
ok(e.every((x, i) => !i || (x.p > e[i - 1].p ? x.lane >= e[i - 1].lane : x.p < e[i - 1].p ? x.lane <= e[i - 1].lane : x.lane === e[i - 1].lane)), 'Spur folgt der Melodie (höher = rechts)');
const acc = C.accompaniment(c);
ok(acc.length > 20 && acc.every(a => a[1] >= 36 && a[1] <= 72 && a[3] > 0) && acc.every((a, i) => !i || a[0] >= acc[i - 1][0]), 'Begleitung: Bass + Akkorde, sortiert, sinnvolle Lage');
ok(C.judge(0.03) === 'perfect' && C.judge(-0.12) === 'good' && C.judge(0.3) === null, 'Trefferfenster');
const st = C.newState(); for (let i = 0; i < 10; i++) C.scoreHit(st, 'perfect'); C.scoreHit(st, null); C.scoreHit(st, 'good');
ok(st.perfect === 10 && st.miss === 1 && st.good === 1 && st.combo === 1 && st.max === 10 && st.score > 1000, 'Wertung und Combo');
ok(C.stars({ perfect: 10, good: 0, miss: 0 }) === 3 && C.stars({ perfect: 5, good: 0, miss: 5 }) === 1 && C.stars({ perfect: 0, good: 0, miss: 5 }) === 0, 'Sterne');
// gebautes Archiv: jede Datei gültig und mit Rechte-Angabe, zusammen mindestens 100 Lieder
const dir = path.join(__dirname, '..', 'archiv'), idx = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json');
ok(idx.songs.length === files.length && files.every(f => { const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); return C.check(c) && c.lic && /gemeinfrei/.test(c.lic); }), 'Archiv: ' + idx.songs.length + ' Lieder, alle gültig und mit Rechte-Angabe');
ok(KLSongs.list.every(s => s.lic && /gemeinfrei/.test(s.lic)) && idx.songs.every(s => s.lic), 'jedes Lied zeigt Komponist/Herkunft und „gemeinfrei“');
ok(KLSongs.list.length + idx.songs.length >= 100, 'mindestens 100 Lieder (' + (KLSongs.list.length + idx.songs.length) + ')');
const ch = JSON.parse(fs.readFileSync(path.join(dir, 'choral-bwv140-7.json'), 'utf8')), ev = C.accompaniment(ch);
ok(ev.length === ch.acc.length && ev.every((a, i) => !i || a[0] >= ev[i - 1][0]), 'Original-Satz (Bach-Choral) als Begleitung');
ok(Object.keys(C.MODES).length >= 5 && C.dailyIndex(100, new Date(2026, 10, 8)) === C.dailyIndex(100, new Date(2026, 10, 8)) && C.dailyIndex(100, new Date(2026, 10, 8)) < 100, 'Spielmodi und Tages-Lied (fest je Datum)');
const r = C.withRate(ch, 0.5); ok(Math.abs(C.duration(r) - 2 * C.duration(ch)) < 0.01, 'Tempo halbieren verdoppelt die Dauer');
// Klaviertastatur
ok(C.MODES.lernen.view === 'keys' && C.MODES.frei.free && C.isBlack(61) && !C.isBlack(60) && C.keyName(60) === 'C4' && C.keyName(71) === 'H4', 'Klavier lernen + freies Klavier, Notennamen (C4, H4)');
const kn = [{ p: 60 }, { p: 64 }, { p: 67 }, { p: 100 }], kr = C.keyRange(kn, 24);
ok(kn[3].p === 76 && !C.isBlack(kr.lo) && !C.isBlack(kr.hi) && kr.lo < 60 && kr.hi > 76 && kr.hi - kr.lo <= 28, 'Tonbereich: Ausreißer oktaviert, Ränder auf weißen Tasten');
const lay = C.keyLayout(48, 83, 700); ok(lay.whites === 21 && lay.keys.length === 36 && C.keyAt(lay, lay.ww, 0.3) === 49 && C.keyAt(lay, lay.ww, 0.9) === 50 && C.keyAt(lay, lay.ww * 0.5, 0.3) === 48, 'Tastatur: 3 Oktaven, schwarze Tasten oben getroffen, weiße unten');
// Fortschritt, Lernpfad, MIDI
const KMeta = require('../js/meta.js'), KLes = require('../js/lessons.js'), KMid = require('../js/midi.js');
KMeta._reset(); const md = KMeta.load(); ok(KMeta.quests().length === 3 && md.gems === 0 && md.own.design.includes('klassik'), 'Fortschritt: 3 Tagesaufgaben, Start ohne Diamanten');
const nw = KMeta.report('song', { mode: 'klassisch', level: 'normal', stars: 3, crowns: 1, perfect: 20, combo: 30, key: 'b:jakob' });
ok(md.songs === 1 && md.ach.first && md.ach.crown && md.gems >= 15 && nw.some(x => x.type === 'ach'), 'Fortschritt: Lied zählt, Erfolge „Erstes Lied“ und „Erste Krone“ mit Diamanten');
KMeta.addGems(40); ok(!KMeta.buy('design', 'gold') && KMeta.buy('design', 'neon') && md.use.design === 'neon', 'Shop: zu teuer abgelehnt, bezahlbares Design gekauft');
const ws = KMeta.weekSongs(103, 2964); ok(ws.length === 5 && new Set(ws).size === 5 && JSON.stringify(ws) === JSON.stringify(KMeta.weekSongs(103, 2964)), 'Turnier: 5 verschiedene Lieder, für alle gleich');
KMeta.report('week', { week: 2964, score: 12345 }); ok(md.weekBoard === 2964 * 1e7 + 12345, 'Turnier: Wochenwert für die Rangliste');
const lc = KLes.chart(KLes.LESSONS.find(l => l.id === 'akkorde')); ok(KLes.LESSONS.length === 10 && lc.mel.filter(n => n[0] === 0).length === 3, 'Lernpfad: 10 Lektionen, Akkorde mit drei Tönen gleichzeitig');
ok(KLes.chart(KLes.LESSONS.find(l => l.id === 'beide')).lh.length === 4, 'Lernpfad: linke Hand als eigene Stimme');
const rev = [[0, 60, 0.4, 0.8], [0.25, 64, 0.2, 0.6], [0.31, 67, 1.5, 1]], dec = KMid.decode(KMid.encode(rev));
ok(dec.length === 3 && dec.every((e, i) => e[1] === rev[i][1] && Math.abs(e[0] - rev[i][0]) < 0.011), 'Aufnahme: Link-Codierung verlustarm');
ok(KMid.toChartRec(rev, 'x', 100).mel.length === 3, 'Aufnahme: schnelle Töne bleiben als Lied erhalten');
ok(C.slice(C.fromNotation(KLSongs.list.find(s => s.id === 'ode')), 0, 32, 3).mel.length === 3 * C.fromNotation(KLSongs.list.find(s => s.id === 'ode')).mel.filter(n => n[0] < 32).length, 'Fehlerstellen: Ausschnitt dreimal');
ok(idx.songs.filter(s => s.gems > 0).length === 20 && idx.songs.filter(s => s.gems).every(s => /^neu-/.test(s.id) && s.lic), 'Shop: 20 neue Lieder zum Freischalten, jedes mit Rechte-Angabe');
console.log(fail ? fail + ' Fehler' : 'Alle Kern-Tests bestanden'); process.exit(fail ? 1 : 0);
