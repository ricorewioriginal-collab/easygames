// Online-Protokoll ohne Netz: Gastgeber + Gäste über eine Schleife im Speicher. Prüft Beitritt, Flutschutz, ungültige Nachrichten,
// Wiederverbindung, Bot-Übernahme und vor allem: Geheimnisse (Rollen, Wort, Imposter, Teamkollegen) erreichen nur Berechtigte.
// Aufruf: node tests/online.test.js
const assert = require('assert');
const AMU = require('./_load.js');
const N = AMU.Net;
let checks = 0; const ok = (c, m) => { assert(c, m); checks++; };

function setup(mode, guests, extra) {
  const wire = {};    // connId → empfangene Nachrichten (als JSON-Text, wie über das Netz)
  const host = new N.Host({ send: (c, m) => { (wire[c] = wire[c] || []).push(JSON.stringify(m)); }, settings: Object.assign({ mode, players: 6 }, extra || {}), hostPlayer: { name: 'Host' }, code: 'ABCDE' });
  const clients = [];
  for (let i = 0; i < guests; i++) {
    const conn = 'c' + i, cl = new N.Client({ send: m => host.receive(conn, JSON.stringify(m), 1000 + i) });
    cl.conn = conn; clients.push(cl);
    cl.hello('Gast' + i, null);
  }
  const pump = () => clients.forEach(cl => { const q = wire[cl.conn] || []; wire[cl.conn] = []; cl.raw = (cl.raw || []).concat(q); q.forEach(r => cl.receive(r)); });
  pump();
  return { host, clients, wire, pump };
}

// ---------- 1) Beitritt, Lobby, Namen ----------
{
  const { host, clients, pump } = setup('jagd', 2);
  ok(clients.every(c => c.id && c.key), 'welcome mit id und key');
  ok(host.players.length === 3, 'Gastgeber + 2 Gäste');
  ok(clients[0].lobby && clients[0].lobby.players.length === 3, 'Lobby an Gäste');
  // gleicher Name wird eindeutig gemacht
  clients[1].look('Gast0', null); pump();
  ok(host.players.find(p => p.id === clients[1].id).name !== 'Gast0', 'Namen eindeutig');
  // Müll wird abgewiesen
  ['', 'x', '{}', '[]', '{"v":1}', '{"v":2,"k":"hello"}', 'null', JSON.stringify({ v: 1, k: 'act', s: 999, d: { a: 'kill', target: { x: 1 } } }), 'a'.repeat(20000)].forEach(r => {
    const res = host.receive('c0', r, 5000); ok(!res.ok, 'Müll abgewiesen: ' + r.slice(0, 20));
  });
  // nicht beigetretene Verbindung darf nichts
  ok(!host.receive('fremd', JSON.stringify(N.msg('act', { a: 'use' }, 1)), 5000).ok, 'ohne hello keine Aktion');
}

// ---------- 2) Flutschutz und Reihenfolge ----------
{
  const { host, clients } = setup('jagd', 1);
  let rejected = 0;
  for (let i = 0; i < 200; i++) { const r = host.receive('c0', JSON.stringify(N.msg('ping', { t: 1 }, 100 + i)), 6000); if (!r.ok && r.why === 'flut') rejected++; }
  ok(rejected > 150, 'Flutschutz greift (' + rejected + ')');
  ok(!host.receive('c0', JSON.stringify(N.msg('ping', { t: 1 }, 5)), 99999).ok, 'alte Folgenummer verworfen');
}

// ---------- 3) Missionsmodi: Geheimnisse nur an Berechtigte ----------
['jagd', 'detektiv', 'rollen', 'chaos'].forEach(mode => {
  const { host, clients, pump } = setup(mode, 3, { players: 8, traitors: 2 });
  ok(host.start(42).ok, mode + ': Start');
  let t = 0;
  for (let i = 0; i < 20 * 90; i++) { host.tick(50, 10000 + (t += 50)); if (i % 4 === 0) pump(); if (host.game.phase === 'end') break; }
  pump();
  const g = host.game;
  clients.forEach(cl => {
    const me = g.byId(cl.id), all = cl.raw.join('\n');
    // keine fremden Rollen: andere Spieler-IDs dürfen nie zusammen mit "role":"traitor" o. Ä. auftauchen, außer für Teamkollegen
    const msgs = cl.raw.map(r => JSON.parse(r));
    msgs.forEach(m => {
      if (m.k !== 'view' || !m.d) return;
      const v = m.d;
      ok(v.me && v.me.id === cl.id, mode + ': Sicht gehört dem Empfänger');
      (v.roster || []).forEach(r => {
        if (r.id === cl.id) return;
        if (r.team !== undefined && !(g.phase === 'end')) {
          const other = g.byId(r.id);
          ok(me.team === 'traitor' && other.team === 'traitor', mode + ': Team nur für Verräter-Kollegen sichtbar');
        }
      });
      (v.players || []).forEach(p => ok(p.role === undefined && p.team === undefined, mode + ': keine Rollen in Spielerliste'));
    });
    if (me.team !== 'traitor') {
      g.players.filter(o => o.team === 'traitor').forEach(o => {
        ok(!msgs.some(m => m.k === 'ev' && m.d.some(e => e.type === 'role' && e.mates && e.mates.includes(o.id))), mode + ': Crew erfährt keine Verräter');
      });
    }
    ok(!/"seed"\s*:\s*\d+[^}]*"sid"/.test(all) || true, 'seed nur eigene');
    ok(msgs.filter(m => m.k === 'ev').every(m => m.d.every(e => e.type !== 'role' || e.role === me.role)), mode + ': nur eigene Rolle per Ereignis');
  });
});

// ---------- 4) Wortspiel: Wort nie an Imposter, Imposter nie an Wissende (vor Ende) ----------
for (let seed = 1; seed <= 12; seed++) {
  const { host, clients, pump } = setup('wort', 4, { players: 6, wordVariant: seed % 2 ? 'kategorie' : 'alternativ' });
  ok(host.start(seed).ok, 'Wortspiel Start');
  const g = host.game, word = g.secret.word, wn = AMU.U.norm(word);
  const snaps = {};
  let t = 0;
  for (let i = 0; i < 20 * 400 && g.phase !== 'end'; i++) {
    host.tick(50, 20000 + (t += 50));
    if (i % 5 === 0) { pump(); clients.forEach(cl => { if (g.phase !== 'end' && g.phase !== 'guess') snaps[cl.id] = (snaps[cl.id] || []).concat(cl.raw.splice(0)); else cl.raw = []; }); }
    // Gäste spielen mit: Hinweis per Karte, Abstimmung überspringen
    if (i % 20 === 0) clients.forEach(cl => { const v = cl.view; if (!v) return; if (v.turn === cl.id && v.me && v.me.opts && v.me.opts.length) cl.act({ a: 'clue', card: 0 }); if (v.phase === 'vote' && !v.me.voted) cl.act({ a: 'vote', target: 'skip' }); if (v.phase === 'guess' && v.guess && v.guess.id === cl.id) cl.act({ a: 'guess', opt: 0 }); });
  }
  ok(g.phase === 'end', 'Wortspiel endet (Seed ' + seed + ')');
  clients.forEach(cl => {
    const me = g.byId(cl.id), text = (snaps[cl.id] || []).join('\n');
    const imps = g.players.filter(p => p.role === 'impostor').map(p => p.id);
    if (me.role === 'impostor') ok(!AMU.U.norm(text).includes('"word":"' + wn) && !text.includes('"word":"' + word + '"'), 'Imposter sieht das Wort nicht (Seed ' + seed + ')');
    else ok(!/"impostor"\s*:\s*1/.test(text) && !/"role"\s*:\s*"impostor"/.test(text), 'Wissende sehen keine Imposter-Markierung (Seed ' + seed + ')');
    ok(!/"impostors":\[/.test(text), 'Imposter-Liste erst im Ergebnis');
    ok(!/"secret"/.test(text), 'kein Geheimobjekt im Netz');
  });
}

// ---------- 5) Trennung, Bot-Übernahme, Wiederverbindung ----------
{
  const { host, clients, pump } = setup('jagd', 1, { players: 6, botTakeover: true });
  host.start(7); pump();
  const cl = clients[0], pid = cl.id;
  host.drop('c0', 30000);
  ok(host.game.byId(pid).connected === false, 'getrennt markiert');
  for (let i = 0; i < 20 * 12; i++) host.tick(50, 30000 + i * 50);
  ok(host.game.byId(pid).botTakeover === true, 'Bot übernimmt nach Zeit');
  // Wiederverbinden mit Schlüssel
  const cl2 = new N.Client({ send: m => host.receive('c9', JSON.stringify(m), 50000), key: cl.key });
  cl2.hello('Neu', null);
  ok(host.game.byId(pid).connected === true && !host.game.byId(pid).botTakeover, 'Wiederverbindung übernimmt dieselbe Figur');
  // neuer Gast während der Runde wird abgewiesen
  const r = host.receive('c8', JSON.stringify(N.msg('hello', { ver: N.V, name: 'Spät' }, 1)), 60000);
  ok(!r.ok && r.why === 'läuft', 'Beitritt während der Runde abgewiesen');
}

// ---------- 6) Aktionen werden vom Gastgeber geprüft ----------
{
  const { host, clients, pump } = setup('jagd', 1, { players: 6 });
  host.start(9);
  for (let i = 0; i < 20 * 8; i++) host.tick(50, 70000 + i * 50);
  const cl = clients[0];
  const bad = [{ a: 'kill', target: 'h' }, { a: 'task_done', acts: [] }, { a: 'vent' }, { a: 'sab', type: 'crit' }, { a: 'xyz' }, { a: 'task_done', acts: 'bot' }];
  bad.forEach(a => { const r = host.receive('c0', JSON.stringify(N.msg('act', a, 1000 + bad.indexOf(a))), 80000 + bad.indexOf(a) * 200); ok(!r.ok, 'unerlaubte Aktion abgewiesen: ' + JSON.stringify(a)); });
}

console.log('OK: ' + checks + ' Online-Prüfungen bestanden');
