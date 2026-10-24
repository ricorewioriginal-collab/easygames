#!/usr/bin/env node
// AnMaCha Podcast Tycoon 3D: Selbsttest der Spaß-Schicht (src/sim/fun.js) ohne Browser.
// Prüft Sprüche, Studio-Momente, Tagesziele, Studio-Stufe, Sende-Serie, Moderations-Boni, alte Spielstände und Determinismus.
//   node tools/test-podcast-tycoon-fun.cjs
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'anmacha-podcast-tycoon', 'src');
global.PT = {};
const load = f => { require(path.join(dir, f)); };
load('core/util.js');
fs.readdirSync(path.join(dir, 'data')).filter(f => f.endsWith('.js')).sort().forEach(f => load('data/' + f));
load('minigames/registry.js');
fs.readdirSync(path.join(dir, 'minigames')).filter(f => /^[a-z]\d\d-.*\.js$/.test(f)).sort().forEach(f => load('minigames/' + f));
load('sim/build.js'); load('sim/sim.js'); load('sim/fun.js');
const P = global.PT, D = P.DATA, S = P.Sim, F = P.Fun, MG = P.MG;
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.error('FAIL ' + m); } };

// ── Daten ───────────────────────────────────────────────────
Object.keys(D.banter).forEach(k => D.banter[k].forEach(s => { const L = F.parse(s, { name: 'X', n: 1, lvl: 2, title: 'T', q: 50 }); ok(L.length >= 1 && L.every(l => (l[0] === 'marco' || l[0] === 'andrew') && l[1].length > 2 && !/\{\w+\}/.test(l[1])), 'Spruch ' + k + ': ' + s); }));
ok(D.studioEvents.length >= 10 && D.studioEvents.length <= 20, '10–20 Studio-Momente (' + D.studioEvents.length + ')');
ok(new Set(D.events.map(e => e.id)).size === D.events.length, 'Ereignis-IDs eindeutig');
const FX = ['money', 'fans', 'rep', 'reliab', 'condition', 'energy', 'mood', 'story', 'hmood', 'creat'];
D.studioEvents.forEach(e => {
  ok(D.events.includes(e), e.id + ' in D.events');
  ok(e.when === 'studio' && e.choices.length >= 2 && e.choices.length <= 3, e.id + ': 2–3 Entscheidungen');
  e.choices.forEach(c => {
    ok(!c.mg || (MG.get(c.mg) && c.win && c.lose), e.id + ': Minispiel ' + c.mg);
    [c.effect, c.win, c.lose].filter(Boolean).forEach(fx => Object.keys(fx).forEach(k => ok(FX.includes(k), e.id + ': Wirkung ' + k)));
    ok(c.say && F.parse(c.say).length, e.id + ': Reaktion');
  });
});
D.funGoals.forEach(g => ok(g.need >= 1 && g.rew && g.icon && g.label, 'Ziel ' + g.id));
['marco', 'andrew', 'both'].forEach(id => ok(D.funLeads[id] && D.funLeads[id].short, 'Moderation ' + id));

// ── Hilfen ──────────────────────────────────────────────────
function produce(st, lead, topicId) {
  st.pending.length = 0;
  let r = S.prodStart(st); if (!r.ok) return r;
  const t = topicId ? D.topics.find(x => x.id === topicId) : D.topics[0];
  const segs = [t.rubric, t.rubric === 'wenig' ? 'feelgood' : 'wenig'];
  r = S.prodPlan(st, { topic: t.id, segments: segs, format: 'normal', slot: 'abend', lead }); if (!r.ok) return r;
  S.prodResearch(st, 1, 50); S.prodTeam(st, 0); S.prodTech(st); S.prodTechResolve(st, 'pay');
  if (st.prod.event) S.eventChoose(st, st.prod.event, D.events.find(e => e.id === st.prod.event).choices.findIndex(c => !c.mg));
  S.prodRecord(st, { score: 70, choices: [0, 0, 0] }); S.prodEdit(st, { score: 70 }); S.prodPackage(st, { cover: 'klassik', teaser: 'none' });
  if (st.prod.event) { const ev = D.events.find(e => e.id === st.prod.event); const i = ev.choices.findIndex(c => !c.mg); S.eventChoose(st, ev.id, i >= 0 ? i : 0, { won: false }); }
  r = S.prodPublish(st); if (!r.ok) return r;
  const rep = r.report; S.prodFinish(st); return { ok: true, rep };
}
const morning = st => S.advance(st, (1440 - st.time.min) + 8 * 60);

// ── Alte Spielstände ────────────────────────────────────────
{
  const st = S.create({ seed: 11 }); delete st.fun;
  const old = JSON.parse(JSON.stringify(st));
  const f = F.ensure(old);
  ok(f.lvl === 1 && f.xp === 0 && f.streak === 0 && Array.isArray(f.q) && Array.isArray(f.goals), 'alter Spielstand bekommt Vorgaben');
  old.fun = { lvl: 'kaputt', q: null, goals: 5 }; F.ensure(old);
  ok(old.fun.lvl === 1 && Array.isArray(old.fun.q) && Array.isArray(old.fun.goals), 'kaputte Werte werden repariert');
  ok(F.goals(old).length === 3, 'drei Tagesziele');
  ok(F.goals(old).filter(g => D.funGoals.find(x => x.id === g.id).pub).length === 1, 'genau ein Veröffentlichungsziel');
  const ids = F.goals(old).map(g => g.id).join();
  ok(F.goals(old).map(g => g.id).join() === ids, 'Tagesziele bleiben am selben Tag gleich');
  ok(!F.goals(old).some(g => D.funGoals.find(x => x.id === g.id).cond === 'episode'), 'ohne Folge keine Folge-Bedingungsziele');
  ok(!F.goals(old).some(g => g.id === 'moment'), 'Studio-Moment-Ziel erst nach dem Einstieg');
}

// ── Nicht-Karriere: keine Ziele/Stufen, aber keine Fehler ───
{
  const st = S.create({ seed: 3, mode: 'creative' });
  ok(F.addXp(st, 999) === 0 && F.goals(st).length === 0, 'Kreativmodus ohne Stufen/Ziele');
  ok(F.rollMoment(st) === null, 'Kreativmodus ohne Studio-Momente');
  const r = produce(st, 'marco'); ok(r.ok, 'Kreativmodus produziert mit Spaß-Hüllen: ' + (r.err || ''));
}

// ── Stufe ───────────────────────────────────────────────────
{
  const st = S.create({ seed: 21 }); const m0 = st.money, f0 = st.fans;
  ok(F.addXp(st, F.need(1) - 1) === 0 && st.fun.lvl === 1, 'knapp unter der Grenze bleibt Stufe 1');
  ok(F.addXp(st, 1) === 1 && st.fun.lvl === 2 && st.fun.xp === 0, 'Stufenaufstieg');
  ok(st.money > m0 && st.fans > f0, 'Stufenbelohnung');
  const q = F.take(st); ok(q.some(x => x.t === 'level' && x.lvl === 2 && x.title) && q.some(x => x.t === 'say'), 'Stufen-Popup und Spruch in der Warteschlange');
  ok(st.fun.q.length === 0, 'Warteschlange geleert');
  for (let i = 0; i < 40; i++) F.sayText(st, 'M:Test ' + i);
  ok(st.fun.q.length <= F.Q_MAX, 'Warteschlange begrenzt');
  ok(F.progress(st).need === F.need(2), 'Fortschritt');
}

// ── Folge, Serie, Ziele, Moderation ─────────────────────────
{
  const st = S.create({ seed: 31 });
  S.talk(st, 'marco'); // Mission 1 annehmen und erledigen
  F.take(st);
  const tec = D.topics.find(t => t.rubric === 'tec');
  S.prodStart(st); S.prodPlan(st, { topic: tec.id, segments: ['tec', 'wenig'], format: 'normal', slot: 'abend', lead: 'marco' });
  ok(st.prod.funLead && st.prod.funLead.q === 3 && st.prod.qualityDelta >= 3, 'Marco moderiert TEC: +3 Qualität');
  S.prodCancel(st);
  st.fun.goals = [{ id: 'pub1', icon: '🎙️', label: 'x', need: 1, have: 0, done: false, rew: { money: 150, fans: 0, xp: 30 } }, { id: 'build2', icon: '🔨', label: 'y', need: 2, have: 0, done: false, rew: { money: 120, fans: 0, xp: 20 } }, { id: 'mg1', icon: '🕹️', label: 'z', need: 1, have: 0, done: false, rew: { money: 100, fans: 0, xp: 20 } }];
  st.fun.goalDay = st.time.day;
  const xp0 = st.fun.xp + st.fun.lvl * 1000;
  const r = produce(st, 'andrew'); ok(r.ok, 'Folge produziert: ' + (r.err || ''));
  ok(st.fun.goals[0].done, 'Ziel „Folge“ erfüllt');
  ok(st.fun.streak === 1 && st.fun.lastEp === st.time.day, 'Serie startet mit 1');
  ok(st.fun.xp + st.fun.lvl * 1000 > xp0, 'XP für die Folge');
  ok(r.rep.fun && r.rep.fun.some(l => /Andrew/.test(l)), 'Bericht nennt Andrew-Bonus');
  const q = F.take(st); ok(q.some(x => x.t === 'goal') && q.some(x => x.t === 'say' && /pub/.test(x.key || '')), 'Ziel-Meldung und Reaktion auf die Folge');
  // Bauen zählt
  const lot = st.lots.studio; let placed = 0;
  for (let z = 2; z < lot.d - 2 && placed < 2; z++) for (let x = 2; x < lot.w - 2 && placed < 2; x++) if (S.build(st, 'studio', { t: 'place', o: { id: 'pf_palme', x, z, r: 0 } }, null).ok) placed++;
  ok(placed === 2 && st.fun.goals[1].done, 'Ziel „2 Objekte platzieren“ erfüllt');
  S.minigameDone(st, { id: 'Q01', won: true, score: 80 }, {});
  ok(st.fun.goals[2].done && st.fun.allDone, 'alle Tagesziele → Bonus');
  ok(F.take(st).some(x => x.t === 'allgoals'), 'Bonus-Meldung');
  // Nächster Tag: neue Ziele, Serie 2
  morning(st);
  ok(st.fun.goalDay === st.time.day && st.fun.goals.every(g => !g.done), 'neue Tagesziele am nächsten Morgen');
  ok(F.take(st).some(x => x.t === 'say' && x.key === 'morning'), 'Morgen-Spruch');
  const fans0 = st.fans; const r2 = produce(st, 'both'); ok(r2.ok, 'zweite Folge');
  ok(st.fun.streak === 2 && F.streakNow(st) === 2, 'Serie 2 Tage');
  ok(r2.rep.fun.some(l => /Serie/.test(l)) && st.fans > fans0, 'Serien-Bonus');
  morning(st); morning(st);
  ok(F.streakNow(st) === 0, 'Serie reißt nach einem Tag ohne Folge');
}

// ── Studio-Momente ──────────────────────────────────────────
{
  const st = S.create({ seed: 41 }); st.pending.length = 0;
  const ev = F.rollMoment(st); ok(ev && st.pending[0] === ev.id && ev.when === 'studio', 'Studio-Moment liegt in pending');
  ok(F.rollMoment(st) === null, 'kein zweiter Moment, solange einer offen ist');
  ok(!ev.needEpisode, 'ohne Folge nur passende Momente');
  st.fun.goals = [{ id: 'moment', icon: '⚡', label: 'm', need: 1, have: 0, done: false, rew: { money: 100, fans: 3, xp: 20 } }]; st.fun.goalDay = st.time.day;
  F.take(st);
  const i = ev.choices.findIndex(c => !c.mg);
  S.eventChoose(st, ev.id, i);
  ok(!st.pending.length, 'Moment erledigt');
  ok(st.fun.moments === 1 && st.fun.goals[0].done, 'Ziel „Studio-Moment“');
  ok(F.take(st).some(x => x.t === 'say'), 'Reaktion von Marco/Andrew');
  const fe = D.studioEvents.find(e => e.id === 'fe_pizza'); const mood0 = st.hosts.marco.mood, en0 = st.hosts.marco.energy;
  st.pending.push('fe_pizza'); S.eventChoose(st, 'fe_pizza', 0);
  ok(st.hosts.marco.mood > mood0 || st.hosts.marco.mood === 100, 'hmood hebt die Laune');
  ok(st.hosts.marco.energy >= en0, 'Energie-Wirkung');
  ok(fe.choices[0].effect.hmood > 0, 'Daten fe_pizza');
  // mit Minispiel
  st.pending.push('fe_mic'); const rel0 = st.reliab; S.eventChoose(st, 'fe_mic', 1, { won: true });
  ok(st.reliab > rel0 || st.reliab === 100, 'Minispiel-Entscheidung gewonnen');
  // keine Wiederholung binnen 4 Tagen, solange andere da sind
  const seen = {}; for (let k = 0; k < 6; k++) { st.pending.length = 0; const e = F.rollMoment(st); seen[e.id] = (seen[e.id] || 0) + 1; }
  ok(Object.values(seen).every(n => n === 1), 'Momente wiederholen sich nicht sofort');
}

// ── Tipps und Hosts ─────────────────────────────────────────
{
  const st = S.create({ seed: 51 });
  const t = F.tip(st); ok(Array.isArray(t) && (t[0] === 'marco' || t[0] === 'andrew') && t[1].length > 5, 'Tipp');
  st.money = -50; ok(/Minus/.test(F.tip(st)[1]), 'Tipp bei Minus');
  const hs = F.hostState(st); ok(hs.marco.icon && hs.andrew.energy >= 0, 'Host-Anzeige');
}

// ── Determinismus ───────────────────────────────────────────
{
  const run = () => { const st = S.create({ seed: 77 }); S.talk(st, 'marco'); for (let d = 0; d < 3; d++) { produce(st, d % 2 ? 'andrew' : 'marco'); st.pending.length = 0; F.rollMoment(st); morning(st); } return JSON.stringify({ f: st.fun, m: st.money, fans: st.fans, seed: st.seed }); };
  ok(run() === run(), 'gleicher Seed → gleicher Spaß-Zustand');
}

console.log((fails ? 'FEHLER: ' : 'OK: ') + passes + ' Prüfungen bestanden, ' + fails + ' fehlgeschlagen');
process.exit(fails ? 1 : 0);
