#!/usr/bin/env node
// AnMaCha Podcast Tycoon 3D: prüft PT.OnlineCore (Online-Quizshow) ohne Browser und ohne Netz.
// Host + 3 Clients über eine Nachrichten-Attrappe (JSON hin und zurück wie über WebRTC), virtuelle Uhr.
//   node tools/test-podcast-tycoon-online.cjs
'use strict';
const path = require('path');
const dir = path.join(__dirname, '..', 'anmacha-podcast-tycoon', 'src');
global.PT = {};
require(path.join(dir, 'core/util.js'));
require(path.join(dir, 'data/quiz.js'));
require(path.join(dir, 'party/online.js'));
const C = global.PT.OnlineCore, Q = global.PT.DATA.quiz;
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.error('FAIL ' + m); } };

// ---------- Netz-Attrappe ----------
function world(seed) {
  let now = 1000000;
  const inbox = {}, clients = {};
  const host = C.createHost({ code: 'K7QX2', seed, hostName: 'Rico', send: (to, m) => (inbox[to] = inbox[to] || []).push(JSON.stringify(m)) });
  const W = {
    host, clients, inbox, get now() { return now; }, adv(ms) { now += ms; host.tick(now); W.flush(); },
    flush() { let n = 0; for (const id of Object.keys(inbox)) { const c = clients[id]; const l = inbox[id]; inbox[id] = []; if (c) l.forEach(m => { c.apply(m, now); n++; }); } return n; },
    connect(id, name, key) { const c = clients[id] = clients[id] || C.createClient(); const r = host.receive(id, JSON.stringify(c.hello(name, key)), now); W.flush(); return r; },
    send(id, m) { const r = host.receive(id, JSON.stringify(m), now); W.flush(); return r; },
    drop(id) { host.disconnect(id, now); delete clients[id]; delete inbox[id]; W.flush(); }
  };
  clients.host = C.createClient(); host.greetHost(); W.flush();
  return W;
}
function answerFor(q, mode) {   // mode: 'right' | 'wrong'
  if (q.kind === 'mc') return mode === 'right' ? q.c : (q.c + 1) % 4;
  if (q.kind === 'tf') return mode === 'right' ? q.t : !q.t;
  return mode === 'right' ? q.v : q.min;
}

// ---------- Helfer ----------
ok(C.makeCode(() => 0.99).length === 5 && /^[A-Z2-9]+$/.test(C.makeCode()), 'Code-Format');
ok(!/[IL O01]/.test(C.CODE_CHARS), 'Code ohne Verwechsler');
ok(C.normCode(' k7q-x2 ') === 'K7QX2', 'Code normalisieren');
ok(C.cleanName('  <b>Hans\u0007  Wurst</b> ') === 'bHans Wurst/b', 'Name säubern: ' + C.cleanName('  <b>Hans\u0007  Wurst</b> '));
ok(C.cleanName('') === 'Gast' && C.cleanName('x'.repeat(40)).length === 16, 'Name leer/zu lang');
ok(C.parse('{kaputt') === null && C.parse({ v: 2, t: 'q' }) === null && C.parse({ t: 'q' }) === null && C.parse([1]) === null && C.parse('x'.repeat(40000)) === null, 'kaputte/fremde Nachrichten');
ok(C.parse({ v: 1, t: 'ready' }) !== null, 'gültige Nachricht');
// Fragenfolge
const st = { rounds: 12, mix: 'bunt', cat: 'alle' };
const qa = C.buildQuestions(42, st, Q), qb = C.buildQuestions(42, st, Q), qc = C.buildQuestions(43, st, Q);
ok(qa.length === 12 && JSON.stringify(qa) === JSON.stringify(qb), 'Fragenfolge deterministisch');
ok(JSON.stringify(qa) !== JSON.stringify(qc), 'anderer Seed, andere Fragen');
ok(new Set(qa.map(q => q.id)).size === 12, 'keine doppelten Fragen');
ok(qa.filter(q => q.kind === 'est').length === 2 && qa.filter(q => q.kind === 'tf').length === 2, 'Mix bunt: 2 Schätz, 2 Wahr/Quatsch');
for (const r of [8, 12, 16]) for (const mix of Object.keys(C.MIXES)) for (const cat of ['alle'].concat(C.CATS)) {
  const l = C.buildQuestions(7, { rounds: r, mix, cat }, Q);
  ok(l.length === r && new Set(l.map(q => q.id)).size === r, `Fragen ${r}/${mix}/${cat}`);
  if (mix === 'abcd') ok(l.every(q => q.kind === 'mc'), 'Nur A–D');
  if (cat !== 'alle') ok(l.every(q => q.cat === cat), `nur Kategorie ${cat} (${mix})`);
}
const used = new Set(qa.map(q => q.id));
ok(C.buildQuestions(99, st, Q, used).every(q => !used.has(q.id)), 'bereits gestellte Fragen nach hinten');
ok(C.board([{ pid: 'a', name: 'A', score: 5 }, { pid: 'b', name: 'B', score: 9 }, { pid: 'c', name: 'C', score: 5 }]).map(p => p.place).join() === '1,2,2', 'Rangliste mit Gleichstand');

// ---------- Ganze Show ----------
const W = world(1234), H = W.host;
ok(W.clients.host.v.me === 'p1' && W.clients.host.v.phase === 'lobby', 'Host ist Spieler p1 in der Lobby');
ok(W.connect('a', 'Anna', 'keyAnna00001').ok, 'Anna tritt bei');
ok(W.connect('b', 'Anna', 'keyBert00001').ok, 'zweite „Anna“ tritt bei');
ok(W.connect('c', 'Cem', 'keyCem000001').ok, 'Cem tritt bei');
ok(W.clients.b.v.name === 'Anna 2', 'doppelter Name aufgelöst: ' + W.clients.b.v.name);
ok(W.clients.c.v.players.length === 4 && W.clients.a.v.phase === 'lobby', 'alle sehen 4 Spieler');
ok(!W.send('a', W.clients.a.cmd('start')).ok && H.rejects.pop().why === 'not-host', 'Client darf nicht starten');
ok(!W.send('a', W.clients.a.set({ rounds: 16 })).ok, 'Client darf nichts einstellen');
ok(W.send('host', W.clients.host.set({ rounds: 8 })).ok && W.send('host', W.clients.host.set({ mix: 'bunt', cat: 'alle' })).ok, 'Host stellt ein');
ok(!W.send('host', W.clients.host.set({ rounds: 9 })).ok && !W.send('host', W.clients.host.set({ cat: 'Quatsch' })).ok, 'ungültige Einstellungen abgewiesen');
ok(W.clients.c.v.settings.rounds === 8, 'Einstellung kommt bei Clients an');
ok(!W.send('host', W.clients.host.cmd('start')).ok, 'Start erst, wenn alle bereit');
['a', 'b'].forEach(id => W.send(id, W.clients[id].ready(true)));
ok(/Cem/.test(H.canStart()), 'Wartet auf Cem');
W.send('c', W.clients.c.ready(true));
ok(H.canStart() === '' && W.send('host', W.clients.host.cmd('start')).ok, 'Start, wenn alle bereit');
ok(W.clients.a.v.phase === 'question' && W.clients.a.v.qi === 0, 'Frage 1 bei Anna');

// Lösung nie vorab sichtbar
const seenRaw = [];
const origOut = H.out; H.out = (to, m) => { seenRaw.push({ to, m: JSON.parse(JSON.stringify(m)) }); origOut(to, m); };
const expect = { host: 0, a: 0, b: 0, c: 0 };
let forged = 0, dupRej = 0, lateRej = 0;
const cid = { host: 'host', a: 'a', b: 'b', c: 'c' };   // aktuelle Verbindung je Spieler (Anna wechselt beim Reconnect)
const cl = k => W.clients[cid[k]], snd = (k, m) => W.send(cid[k], m);
for (let i = 0; i < H.qs.length; i++) {
  const q = H.qs[i], cv = cl('a').v;
  ok(cv.q && cv.q.id === q.id && cv.phase === 'question', `Frage ${i + 1} angekommen`);
  const leak = JSON.stringify(cv.q);
  ok(!('c' in cv.q) && !('t' in cv.q) && !('v' in cv.q) && !('ex' in cv.q) && !('s' in cv.q) && (q.kind !== 'est' || leak.indexOf('"v"') < 0), `Frage ${i + 1}: keine Lösung im Client`);
  ok(seenRaw.filter(x => x.m.t === 'q' || x.m.t === 'state' || x.m.t === 'ack').every(x => !/"(c|t|v|ex|correct)":/.test(JSON.stringify(x.m.q || {})) && !('correct' in x.m)), `Frage ${i + 1}: keine Lösung im Netz`);
  // gefälschte Antwort: Bert antwortet mit Annas Spieler-ID
  const fake = Object.assign(cl('b').answer(answerFor(q, 'right')), { pid: cl('a').v.me });
  if (!snd('b', fake).ok) forged++;
  // Host nach 1 s richtig, Anna nach 5 s richtig, Bert falsch, Cem in Frage 1–3 zu spät, sonst nach 6 s richtig
  W.adv(1000); snd('host', cl('host').answer(answerFor(q, 'right')));
  if (!snd('host', cl('host').answer(answerFor(q, 'right'))).ok) dupRej++;   // doppelte Antwort
  W.adv(4000); snd('a', cl('a').answer(answerFor(q, 'right')));
  ok(cl('a').v.mine !== null, `Frage ${i + 1}: Bestätigung für Anna`);
  snd('b', cl('b').answer(answerFor(q, 'wrong')));
  ok(H.phase === 'question', `Frage ${i + 1}: wartet noch auf Cem`);
  const d = q.kind === 'est' ? C.CFG.estMs : C.CFG.qMs;
  if (i < 3) {
    W.adv(d - 5000 + C.CFG.graceMs + 1);   // Zeit um → Auflösung
    ok(H.phase === 'reveal', `Frage ${i + 1}: Auflösung nach Zeitende`);
    if (!snd('c', cl('c').answer(answerFor(q, 'right'))).ok) lateRej++;
  } else {
    W.adv(1000); snd('c', cl('c').answer(answerFor(q, 'right')));
    ok(H.phase === 'reveal', `Frage ${i + 1}: Auflösung, sobald alle geantwortet haben`);
  }
  const r = cl('c').v.reveal;
  ok(r && r.qi === i, `Frage ${i + 1}: Auflösung angekommen`);
  const right = q.kind === 'mc' ? q.c : q.kind === 'tf' ? q.t : q.v;
  ok(r.correct === right, `Frage ${i + 1}: richtige Lösung in der Auflösung`);
  const pts = {};   // erwartete Punkte nachrechnen
  if (q.kind === 'est') {
    pts.host = 1000; pts.a = 1000; pts.b = Math.round(800 * Math.max(0, 1 - 4 * Math.abs(q.min - q.v) / (q.max - q.min))); pts.c = i < 3 ? 0 : 1000;
  } else {
    pts.host = 500 + Math.round(500 * (d - 1000) / d); pts.a = 500 + Math.round(500 * (d - 5000) / d); pts.b = 0; pts.c = i < 3 ? 0 : 500 + Math.round(500 * (d - 6000) / d);
  }
  const pidOf = { host: 'p1', a: 'p2', b: 'p3', c: 'p4' };
  for (const k of Object.keys(pts)) { const x = r.res.find(y => y.pid === pidOf[k]); ok(x && x.pts === pts[k], `Frage ${i + 1} (${q.kind}): Punkte ${k} = ${x && x.pts}, erwartet ${pts[k]}`); expect[k] += pts[k]; }
  if (q.kind === 'mc') ok(r.dist.reduce((s, n) => s + n, 0) === (i < 3 ? 3 : 4) && r.dist[q.c] === (i < 3 ? 2 : 3), `Frage ${i + 1}: Verteilung`);
  ok(!snd('a', cl('a').answer(answerFor(q, 'right'))).ok, `Frage ${i + 1}: Antwort in der Auflösung abgewiesen`);
  if (i === 2) {   // Reconnect: Anna verliert die Verbindung und kommt mit gleichem Schlüssel zurück
    const before = H.players.find(p => p.pid === 'p2').score;
    W.drop('a');
    ok(H.players.find(p => p.pid === 'p2').on === false, 'Anna offline, Platz bleibt');
    ok(W.connect('a2', 'Anna', 'keyAnna00001').ok, 'Anna verbindet neu');
    ok(W.clients.a2.v.me === 'p2' && W.clients.a2.v.name === 'Anna', 'gleiche Spieler-ID nach Reconnect');
    ok(H.players.find(p => p.pid === 'p2').score === before && W.clients.a2.v.players.find(p => p.pid === 'p2').score === before, 'Punkte bleiben nach Reconnect');
    ok(W.clients.a2.v.phase === 'reveal', 'Reconnect landet in der laufenden Auflösung');
    ok(!W.send('a', W.clients.a2.answer(0)).ok && H.rejects.pop().why === 'unknown', 'alte Verbindung ist tot');
    cid.a = 'a2';
  }
  if (i % 2) snd('host', cl('host').cmd('next')); else W.adv(C.CFG.revealMs);   // Host klickt „Weiter“ oder Zeit läuft ab
}
ok(forged === H.qs.length, 'gefälschte Spieler-ID immer abgewiesen (' + forged + ')');
ok(dupRej === H.qs.length, 'doppelte Antwort immer abgewiesen');
ok(lateRej === 3, 'Antwort nach Zeitende abgewiesen');
ok(W.clients.c.v.phase === 'final', 'Siegerehrung erreicht');
const fb = W.clients.c.v.board, sc = pid => fb.find(p => p.pid === pid).score;
ok(sc('p1') === expect.host && sc('p2') === expect.a && sc('p3') === expect.b && sc('p4') === expect.c, `Endstand korrekt (${fb.map(p => p.name + ':' + p.score).join(', ')})`);
ok(fb[0].pid === 'p1' && fb[0].place === 1, 'Host (schnellster) gewinnt');
const rh = cl('host').result(), rb = cl('b').result();
ok(rh.won === true && rh.place === 1 && rh.players === 4 && rh.score === expect.host, 'Ergebnis Host');
ok(rb.won === false && rb.place === 4 && rb.score === expect.b, 'Ergebnis Bert');
// Nochmal spielen
ok(!W.send('b', W.clients.b.cmd('again')).ok, 'Client darf nicht neu starten');
ok(W.send('host', W.clients.host.cmd('again')).ok && W.clients.b.v.phase === 'lobby' && W.clients.b.v.players.every(p => p.score === 0 && (p.host || !p.ready)), 'Nochmal: Lobby mit 0 Punkten');

// ---------- weitere Abwehr ----------
const X = world(77), XH = X.host;
ok(!XH.receive('z', '{"v":1,"t":"answer","pid":"p1","qi":0,"a":0}', X.now).ok, 'Antwort ohne Beitritt abgewiesen');
ok(!XH.receive('z', 'Müll', X.now).ok && !XH.receive('z', null, X.now).ok && !XH.receive('z', { v: 1, t: 'hello', name: 5 }, X.now).ok, 'Müll abgewiesen');
ok(!XH.receive('z', { v: 1, t: 'hello', name: 'Böse', key: 'kurz' }, X.now).ok, 'ungültiger Schlüssel abgewiesen');
ok(!XH.receive('z', { v: 1, t: 'hello', name: 'Dieb', key: XH.players[0].key }, X.now).ok, 'Host-Platz nicht übernehmbar');
X.connect('a', 'A', 'aaaaaaaa1111');
ok(!X.connect('a', 'A', 'aaaaaaaa1111').ok, 'doppeltes Hallo abgewiesen');
ok(!X.send('a', { v: 1, t: 'gibtsnicht', pid: 'p2' }).ok, 'unbekannter Typ abgewiesen');
ok(X.clients.a.apply('{"v":1,"t":"q","qi":"x"}', 0) === false && X.clients.a.apply({ v: 1, t: 'boom' }, 0) === false && X.clients.a.apply('[]', 0) === false, 'Client ignoriert kaputte Host-Nachrichten');
for (let i = 2; i <= 7; i++) X.connect('x' + i, 'Spieler', 'bbbbbbbb' + (1000 + i));
ok(XH.players.length === 8, '8 Spieler im Raum');
ok(!X.connect('voll', 'Neun', 'cccccccc9999').ok && X.clients.voll.v.phase === 'error', 'Raum voll → Meldung');
X.drop('x7');
ok(XH.players.length === 7, 'Lobby: Verlassen gibt Platz frei');
['a', 'x2', 'x3', 'x4', 'x5', 'x6'].forEach(id => X.clients[id] && X.send(id, X.clients[id].ready(true)));
X.send('host', X.clients.host.cmd('start'));
const q0 = XH.qs[0];
ok(!X.send('a', Object.assign(X.clients.a.answer(0), { a: q0.kind === 'mc' ? 7 : q0.kind === 'tf' ? 'ja' : q0.max + 1 })).ok, 'ungültiger Antwortwert abgewiesen');
ok(!X.send('a', Object.assign(X.clients.a.answer(answerFor(q0, 'right')), { qi: 5 })).ok, 'Antwort auf falsche Frage abgewiesen');
ok(X.connect('spaet', 'Späti', 'dddddddd4444').ok && X.clients.spaet.v.phase === 'question', 'Später Beitritt landet in der laufenden Frage');
// Host-Abbruch
XH.abort(); X.flush();
ok(['a', 'x2', 'spaet', 'host'].every(id => X.clients[id].v.phase === 'aborted' && /beendet/.test(X.clients[id].v.error)), 'Host-Abbruch bei allen gemeldet');
ok(!X.send('a', X.clients.a.answer(0)).ok, 'nach Abbruch keine Nachrichten mehr');
ok(X.clients.a.apply({ v: 1, t: 'state', phase: 'lobby', players: [], settings: {} }, 0) === false, 'nach Abbruch kein Zurückspringen');

// Alle gehen während einer Frage → Auflösung kommt trotzdem
const Y = world(5); Y.connect('a', 'A', 'eeeeeeee5555'); Y.send('a', Y.clients.a.ready(true)); Y.send('host', Y.clients.host.cmd('start'));
Y.send('host', Y.clients.host.answer(answerFor(Y.host.qs[0], 'right'))); Y.drop('a');
ok(Y.host.phase === 'reveal', 'Auflösung, wenn der letzte Wartende geht');

console.log(`${fails ? 'FEHLER' : 'OK'}: ${passes} Prüfungen bestanden, ${fails} fehlgeschlagen`);
process.exit(fails ? 1 : 0);
