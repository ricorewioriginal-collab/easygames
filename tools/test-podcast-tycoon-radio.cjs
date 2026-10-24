#!/usr/bin/env node
// AnMaCha Podcast Tycoon 3D: Radio (src/sim/radio.js) ohne Browser – Radiostudio, Sendungen, Werbung für die nächste Folge,
// alte Spielstände ohne st.radio, Radio bleibt klar kleiner als der Podcast. Dazu der Radio-Player mit Attrappen (kein Netz).
//   node tools/test-podcast-tycoon-radio.cjs
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'anmacha-podcast-tycoon', 'src');
global.PT = {};
const load = f => { require(path.join(dir, f)); };
load('core/util.js');
fs.readdirSync(path.join(dir, 'data')).filter(f => f.endsWith('.js')).sort().forEach(f => load('data/' + f));
load('minigames/registry.js');
fs.readdirSync(path.join(dir, 'minigames')).filter(f => /^[a-z]\d\d-.*\.js$/.test(f)).sort().forEach(f => load('minigames/' + f));
load('sim/build.js'); load('sim/sim.js'); load('sim/radio.js'); load('storage/save.js');
const P = global.PT, D = P.DATA, S = P.Sim, B = P.Build, R = P.Radio;
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.error('FAIL ' + m); } };

// ── Daten ──
ok(D.roomFns.radio && D.roomFns.radio.icon === '📻' && D.roomFns.radio.name === 'Radiostudio', 'Raumfunktion Radiostudio');
['rd_pult', 'rd_onair', 'rd_boxen', 'rd_tel', 'rd_jingle', 'rd_uhr'].forEach(id => ok(D.objectById[id] && D.objectById[id].m.length && D.objectCats[D.objectById[id].cat], 'Objekt ' + id));
ok(D.objectById.rd_pult.surface && D.objectById.rd_tel.layer === 'top' && D.objectById.rd_onair.layer === 'wall', 'Ebenen der Radio-Objekte');
ok(!/^mx_/.test('rd_pult'), 'Sendepult ersetzt nicht das Produktionspult');
ok(R.STATIONS.length === 12 && R.STATIONS[0].slug === 'anmacha24', '12 Sender, AnMaCha24 zuerst');
ok(new Set(R.STATIONS.map(s => s.slug)).size === 12, 'Sender eindeutig');
R.SHOWS.forEach(s => ok(P.MG.get(s.mg) && s.hours.length === 2 && s.promo > 0, 'Sendung ' + s.id));

// ── Startstudio: Radiostudio neben dem Aufnahmeraum ──
const st = S.create({ seed: 11 });
const studio = S.studio(st);
ok(studio.best.aufnahme && studio.best.aufnahme.valid, 'Aufnahmeraum weiterhin gültig');
ok(studio.best.radio && studio.best.radio.valid, 'Start-Radiostudio gültig');
ok(B.pathCheck(st.lots.studio).ok, 'Startstudio: alle Wege frei');
ok(B.canPlace(st.lots.studio, { id: 'rd_tel', x: 13, z: 6, r: 0 }).ok, 'Hörertelefon passt aufs Sendepult');

// ── Raumregeln ──
{
  const t = S.create({ seed: 3 }); const lot = t.lots.studio;
  const mic = lot.objs.find(o => o.id === 'mic_alt' && o.x === 12);
  ok(S.build(t, 'studio', { t: 'remove', u: mic.u }).ok, 'Mikro entfernen');
  const r = S.studio(t).rooms.find(x => x.fn === 'radio');
  ok(r && !r.valid && r.miss.some(m => m.k === 'mikro'), 'ohne Mikro ungültig');
  ok(!R.canRun(t, 'morning').ok, 'ohne Radiostudio keine Sendung');
  const on = lot.objs.find(o => o.id === 'rq_onair' && o.x === 13);
  S.build(t, 'studio', { t: 'remove', u: on.u });
  ok(S.studio(t).rooms.find(x => x.fn === 'radio').miss.some(m => m.k === 'onair'), 'ON-AIR-Licht ist Pflicht');
  ok(B.missText({ k: 'onair', need: 1, have: 0 }).includes('ON-AIR'), 'Fehlertext ON-AIR');
}

// ── Sendung: Geld, Fans, Werbung ──
{
  const t = S.create({ seed: 7 }); t.time.min = 8 * 60;
  ok(!R.canRun(t, 'morning').ok, 'Karriere: erst mit Marco sprechen'); t.missions.done.push('m01');
  const pv = R.preview(t, 'morning', 1);
  ok(pv.prime && pv.listeners > 0 && pv.promo.pct > 0, 'Vorschau Morningshow zur Primetime');
  ok(!R.canRun(t, 'nacht').ok, 'Podcastnacht braucht eine Folge');
  ok(!R.canRun(t, 'festival').ok, 'Festival braucht Freischaltung');
  const m0 = t.money, f0 = t.fans;
  const out = R.runShow(t, 'morning', 0.8);
  ok(out.ok && t.money === m0 + out.money && out.money > 0, 'Sendung bringt Geld');
  ok(t.fans === f0 + out.fans, 'Sendung bringt Fans');
  ok(t.today.inc.radio === out.money, 'Einnahmen unter „Radio“ gebucht');
  ok(R.promo(t) && R.promoReach(t) === out.promo.pct, 'Werbung aktiv');
  ok(t.time.min === 9 * 60, 'Sendung dauert eine Stunde');
  ok(!R.canRun(t, 'wunsch').ok, 'nur eine Sendung pro Tag');
  ok(R.runShow(t, 'wunsch', 1).ok === false, 'zweite Sendung abgelehnt');
  // Werbung läuft ab
  const u = JSON.parse(JSON.stringify(t)); u.time.day += R.PROMO_DAYS + 1;
  ok(R.promo(u) === null && R.promoReach(u) === 0, 'Werbung läuft nach ' + R.PROMO_DAYS + ' Tagen ab');
  // Radio bleibt klein: höchstens 25 % Reichweite, Erlös je Hörer deutlich unter dem Podcast
  const big = S.create({ seed: 1 }); big.fans = 20000; big.rep = 100; big.time.min = 8 * 60;
  const pb = R.preview(big, 'festival', 1);
  ok(pb.promo.pct <= 0.25, 'Reichweiten-Bonus gedeckelt');
  ok(pb.money / pb.listeners < D.rules.revenuePerListener / 2, 'Radio-Erlös je Hörer < halber Podcast-Erlös');
}

// ── Verknüpfung mit dem Podcast: nächste Folge bekommt Bonus ──
function publish(st) {
  let r = S.prodStart(st); if (!r.ok) return r;
  const topic = D.topics[0], segs = [topic.rubric]; D.rubrics.forEach(x => { if (segs.length < 3 && !segs.includes(x.id)) segs.push(x.id); });
  const ev = () => { if (!st.prod.event) return; const e = D.events.find(x => x.id === st.prod.event), i = Math.max(0, e.choices.findIndex(c => !c.mg)); S.eventChoose(st, e.id, i, e.choices[i].mg ? { won: true, score: 80 } : null); };
  r = S.prodPlan(st, { topic: topic.id, segments: segs, guest: null, format: 'normal', slot: 'abend', video: false, lead: 'marco' }); if (!r.ok) return r;
  S.prodResearch(st, 1, 60); S.prodTeam(st, 0);
  const T = S.prodTech(st).tech; if (T && T.fault) S.prodTechResolve(st, 'pay', false); else S.prodTechResolve(st);
  ev();
  const beats = S.recordBeats(st);
  r = S.prodRecord(st, { score: 80, choices: beats.map(() => 0) }); if (!r.ok) return r;
  r = S.prodEdit(st, { score: 80, detail: 'Test' }); if (!r.ok) return r;
  r = S.prodPackage(st, { cover: 'klassik', teaser: 'none', title: '' }); if (!r.ok) return r;
  ev();
  return S.prodPublish(st);
}
{
  const a = S.create({ seed: 21, mode: 'creative' }); a.time.min = 9 * 60;
  R.state(a);
  const b = JSON.parse(JSON.stringify(a));
  b.radio.promo = { pct: 0.12, fans: 40, show: 'morning', day: b.time.day, until: b.time.day + 3 };
  const ra = publish(a), rb = publish(b);
  ok(ra.ok && rb.ok, 'Folgen veröffentlicht' + (ra.err || rb.err ? ' (' + (ra.err || rb.err) + ')' : ''));
  if (ra.ok && rb.ok) {
    ok(!ra.report.radio, 'ohne Radio kein Radio-Bonus im Bericht');
    ok(rb.report.radio && rb.report.radio.pct === 0.12 && rb.report.radio.fans === 40, 'Radio-Bonus im Bericht');
    ok(rb.report.listeners > ra.report.listeners, 'Radio-Werbung: mehr Hörer (' + ra.report.listeners + ' → ' + rb.report.listeners + ')');
    ok(PT.round(rb.report.reach - ra.report.reach, 2) === 0.12, 'Reichweite +12 %');
    ok(b.fans - a.fans >= 40, 'Radiohörer werden Podcast-Fans');
    ok(b.radio.promo === null && b.radio.convFans === 40, 'Werbung verbraucht');
    ok(rb.report.ep.radio === 0.12, 'Folge merkt sich den Radio-Bonus');
    // Podcastnacht nach der ersten Folge
    b.time.day++; b.time.min = 23 * 60;
    ok(R.canRun(b, 'nacht').ok, 'Podcastnacht nach der ersten Folge');
    const pn = R.preview(b, 'nacht', 0.7), pm = R.preview(b, 'morning', 0.7);
    ok(pn.prime && pn.promo.pct > pm.promo.pct * 0.99, 'Podcastnacht wirbt am stärksten');
    // Podcast bleibt das Highlight: eine Folge bringt viel mehr als eine Sendung
    ok(rb.report.revenue > pn.money * 3 && rb.report.listeners > pn.listeners, 'Podcast-Folge > Radiosendung');
  }
}

// ── Alte Spielstände ohne st.radio ──
{
  const t = S.create({ seed: 4 }); delete t.radio;
  const repo = P.Save.create({ _m: {}, getItem(k) { return k in this._m ? this._m[k] : null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } });
  ok(repo.save('slot1', t).ok, 'alter Stand speichern');
  const back = repo.load('slot1'); ok(back.ok, 'alter Stand laden');
  ok(R.promoReach(back.state) === 0 && back.state.radio.shows === 0, 'st.radio wird sicher angelegt');
  back.state.radio = { promo: 'kaputt', log: 5 }; R.state(back.state);
  ok(back.state.radio.promo === null && Array.isArray(back.state.radio.log), 'kaputte Radiodaten werden repariert');
  const t2 = S.create({ seed: 4 }); t2.time.min = 8 * 60; t2.missions.done.push('m01'); R.runShow(t2, 'morning', 0.5);
  ok(repo.save('slot2', t2).ok && repo.load('slot2').state.radio.shows === 1, 'Radio-Zustand wird gespeichert');
}

// ── Radio-Player mit Attrappen ──
{
  const calls = []; let lastEl = null, fetches = 0;
  class FakeAudio {
    constructor() { this.ls = {}; this.attrs = {}; lastEl = this; this.paused = true; }
    addEventListener(n, f) { (this.ls[n] = this.ls[n] || []).push(f); }
    fire(n) { (this.ls[n] || []).forEach(f => f()); }
    set src(v) { this.attrs.src = v; } get src() { return this.attrs.src || ''; }
    getAttribute(k) { return this.attrs[k] || null; } removeAttribute(k) { delete this.attrs[k]; }
    play() { calls.push('play:' + this.attrs.src); this.paused = false; return Promise.resolve(); } pause() { this.paused = true; calls.push('pause'); } load() {}
  }
  global.Audio = FakeAudio; global.fetch = () => { fetches++; return Promise.resolve({ ok: true, json: () => Promise.resolve({ title: 'Song', artist: { name: 'Band' } }) }); };
  let duck = null; P.Audio = { duck: v => { duck = v; } };
  load('radio/player.js');
  const RP = P.RadioPlayer;
  ok(RP.slug === 'anmacha24' && !RP.active(), 'Player startet aus, AnMaCha24 vorgewählt');
  ok(!lastEl && fetches === 0, 'kein Stream und kein Abruf ohne Klick');
  RP.play();
  ok(lastEl && lastEl.src === 'https://stream.laut.fm/anmacha24' && lastEl.preload === 'none', 'Stream AnMaCha24 über laut.fm');
  ok(RP.loading && !RP.playing, 'verbindet …');
  lastEl.fire('playing');
  ok(RP.playing && duck === true && fetches === 1, 'läuft: Spielmusik stumm, Jetzt-läuft abgefragt');
  RP.setVolume(0.3); ok(lastEl.volume === 0.3, 'Lautstärke');
  RP.stop(); ok(!RP.active() && duck === false && !lastEl.getAttribute('src'), 'Stopp: Stream frei, Musik zurück');
  RP.play('clubradio24'); ok(lastEl.src === 'https://stream.laut.fm/clubradio24', 'Senderwechsel');
  lastEl.fire('error'); ok(!RP.active() && /nicht erreichbar/.test(RP.err) && duck === false, 'Fehlermeldung bei Netzfehler');
  RP.stop();
  setTimeout(() => {
    console.log((fails ? 'FEHLER' : 'OK') + ': ' + passes + ' Prüfungen bestanden, ' + fails + ' fehlgeschlagen');
    process.exit(fails ? 1 : 0);
  }, 50);
}
