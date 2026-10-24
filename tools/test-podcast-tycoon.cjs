#!/usr/bin/env node
// AnMaCha Podcast Tycoon 3D: Selbsttest der Simulation ohne Browser.
// Prüft Daten, Bauen (Regeln, Rückgängig), Wirtschaft, Produktion, Determinismus, Anti-Softlock und
// spielt mit einem Bot alle 60 Hauptmissionen (drei Schwierigkeitsstufen) plus eine Endloswoche durch.
//   node tools/test-podcast-tycoon.cjs [--verbose]
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
const optional = ['storage/save.js', 'sim/radio.js'];
optional.forEach(f => { if (fs.existsSync(path.join(dir, f))) load(f); });
const P = global.PT, D = P.DATA, S = P.Sim, B = P.Build, MG = P.MG;
const VERBOSE = process.argv.includes('--verbose');
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.error('FAIL ' + m); } };
const log = (...a) => { if (VERBOSE) console.log(...a); };

// ── 1. Daten ────────────────────────────────────────────────
ok(D.rubrics.length === 6, '6 Rubriken');
ok(D.topics.length === 60, '60 Themen');
ok(new Set(D.topics.map(t => t.id)).size === 60, 'Themen-IDs eindeutig');
D.topics.forEach(t => ok(D.rubrics.find(r => r.id === t.rubric) && D.audiences[t.aud], 'Thema ' + t.id + ' Rubrik/Publikum'));
D.rubrics.forEach(r => ok(D.topics.filter(t => t.rubric === r.id).length === 10, '10 Themen je Rubrik ' + r.id));
ok(D.objects.length >= 70, '≥ 70 Objekte (' + D.objects.length + ')');
ok(Object.keys(D.objectCats).length === 12, '12 Kategorien');
Object.keys(D.objectCats).forEach(c => ok(D.objects.some(o => o.cat === c), 'Kategorie ' + c + ' hat Objekte'));
ok(new Set(D.objects.map(o => o.id)).size === D.objects.length, 'Objekt-IDs eindeutig');
D.objects.forEach(o => ok(['floor', 'top', 'wall', 'ceil'].includes(o.layer) && o.m && o.m.length, 'Objekt ' + o.id + ' Ebene/Modell'));
ok(D.npcs.length >= 12, '≥ 12 NPCs');
ok(Object.keys(D.guestArchetypes).length >= 10, '≥ 10 Gast-Typen');
D.guests.forEach(g => ok(D.guestArchetypes[g.arche], 'Gast ' + g.id + ' Typ'));
ok(D.missions.length === 60, '60 Hauptmissionen');
ok(D.sideMissions.length >= 24, '≥ 24 Nebenmissionen');
for (let c = 1; c <= 6; c++) ok(D.missions.filter(m => m.ch === c).length === 10, 'Kapitel ' + c + ' hat 10 Missionen');
const people = new Set(D.npcs.map(n => n.id).concat(D.hosts.map(h => h.id)));
const OBJ_TYPES = ['talk', 'visit', 'build', 'room', 'publish', 'fans', 'money', 'rep', 'listeners', 'hire', 'minigame', 'repair', 'sponsor', 'train', 'teaser', 'archive', 'unlock', 'event', 'party', 'reliab', 'guests', 'editscore'];
D.missions.concat(D.sideMissions).forEach(m => {
  ok(people.has(m.actor), m.id + ': Figur ' + m.actor);
  ok(D.districts.find(d => d.id === m.loc), m.id + ': Bezirk ' + m.loc);
  m.obj.forEach(o => {
    ok(OBJ_TYPES.includes(o.type), m.id + ': Zieltyp ' + o.type);
    if (o.type === 'minigame' && o.id) ok(MG.get(o.id), m.id + ': Minispiel ' + o.id);
    if (o.type === 'room') ok(D.roomFns[o.fn] || !o.fn, m.id + ': Raum ' + o.fn);
    if (o.type === 'build') ok(o.obj ? D.objectById[o.obj] : D.objectCats[o.cat], m.id + ': Bauziel');
    if (o.type === 'talk') ok(people.has(o.npc), m.id + ': Gesprächspartner ' + o.npc);
    if (o.guest && typeof o.guest === 'string') ok(D.guests.find(g => g.id === o.guest), m.id + ': Gast');
  });
  ok(m.say && m.say.length && m.done && m.done.length, m.id + ': Dialoge');
});
D.jobs.forEach(j => ok(MG.get(j.mg) && D.districts.find(d => d.id === j.dist), 'Job ' + j.id));
D.events.forEach(e => e.choices.forEach(c => ok(!c.mg || MG.get(c.mg), 'Ereignis ' + e.id + ' Minispiel')));
ok(D.quiz.mc.length + D.quiz.tf.length + D.quiz.est.length >= 120, '≥ 120 Quizfragen');
ok(D.sounds.length >= 20, '≥ 20 Geräusche');
ok(D.districts.length === 8, '8 Bezirke');
Object.keys(D.roomFns).forEach(k => Object.keys(D.roomFns[k].req).forEach(r => ok(D.objectCats[r] || D.objectById[r] || ['seats', 'energy', 'music', 'storage', 'shop', 'surfaceWork', 'onair'].includes(r), 'Raum ' + k + ' Anforderung ' + r)));
ok(MG.list().length === 24, '24 Minispiele geladen (' + MG.list().length + ')');

// ── 2. Bauen ────────────────────────────────────────────────
{
  const st = S.create({ seed: 5 });
  const studio = S.studio(st);
  ok(studio.best.aufnahme && studio.best.aufnahme.valid, 'Startstudio hat gültigen Aufnahmeraum');
  ok(S.canProduce(st).ok, 'Startstudio kann produzieren');
  const lot = st.lots.studio, hist = { undo: [], redo: [] }, m0 = st.money;
  const r1 = S.build(st, 'studio', { t: 'place', o: { id: 'pf_palme', x: 3, z: 10, r: 0 } }, hist);
  ok(r1.ok && st.money === m0 - D.objectById.pf_palme.cost, 'Platzieren bucht Kosten');
  ok(!S.build(st, 'studio', { t: 'place', o: { id: 'pf_palme', x: 3, z: 10, r: 0 } }, hist).ok, 'Doppelt belegen verboten');
  ok(!S.build(st, 'studio', { t: 'place', o: { id: 'pf_palme', x: 0, z: 0, r: 0 } }, hist).ok, 'Ohne Boden verboten');
  ok(!S.build(st, 'studio', { t: 'place', o: { id: 'hp_billig', x: 10, z: 10, r: 0 } }, hist).ok, 'Gerät ohne Ablage verboten');
  ok(S.build(st, 'studio', { t: 'place', o: { id: 'hp_billig', x: 4, z: 6, r: 0 } }, hist).ok, 'Kopfhörer auf dem Tisch erlaubt');
  ok(!S.build(st, 'studio', { t: 'place', o: { id: 'pf_palme', x: 11, z: 11, r: 0 } }, hist).ok, 'Feld vor der Tür bleibt frei');
  ok(!S.build(st, 'studio', { t: 'place', o: { id: 'ab_schaum', x: 5, z: 9, r: 0 } }, hist).ok, 'Wandobjekt ohne Wand verboten');
  ok(S.build(st, 'studio', { t: 'place', o: { id: 'ab_schaum', x: 3, z: 2, r: 0 } }, hist).ok, 'Wandobjekt an Wand erlaubt');
  ok(!S.build(st, 'studio', { t: 'remove', u: 's0' }, hist).ok, 'Tisch mit Geräten nicht entfernbar');
  const before = JSON.stringify(lot.objs), money = st.money;
  ok(S.undo(st, hist).ok && S.undo(st, hist).ok, 'Rückgängig zweimal');
  ok(lot.objs.length === JSON.parse(before).length - 2, 'Rückgängig entfernt Objekte');
  ok(S.undo(st, hist, true).ok && S.undo(st, hist, true).ok && JSON.stringify(lot.objs) === before && st.money === money, 'Wiederholen stellt Zustand und Geld wieder her');
  // Wand, die einen Raum abschließt, ist verboten; mit Tür erlaubt
  const w = S.build(st, 'studio', { t: 'wall', k: 'v:8,6', to: 'wall' }, hist);
  ok(!w.ok, 'Wand ohne Tür (Raum unerreichbar) verboten');
  ok(S.build(st, 'studio', { t: 'roomfn', x: 10, z: 5, fn: 'kueche' }, hist).ok && S.hasRoom(st, 'kueche'), 'Raumfunktion Kaffeeküche');
  ok(S.undo(st, hist).ok && !S.hasRoom(st, 'kueche'), 'Raumfunktion rückgängig');
  ok(B.pathCheck(lot).ok, 'Wegeprüfung im Startstudio');
}

// ── 3. Bot-Werkzeuge ───────────────────────────────────────
const GARDEN = [[15, 0, 20, 3], [15, 3, 20, 6], [15, 6, 20, 9], [15, 9, 20, 12], [15, 12, 20, 14]];
const CAMPUS = [[3, 3, 9, 8], [10, 3, 16, 8], [17, 3, 23, 8], [3, 10, 9, 15], [10, 10, 16, 15]];
const ROOM_KIT = {
  redaktion: ['mo_schreib', 'mo_buero', 'bs_laptop', 'mo_regal'], lounge: ['mo_sofa', 'mo_sofa', 'pf_palme', 'mo_kuehl'],
  tvbuehne: ['cam_web', 'cam_web', 'li_softbox', 'li_softbox', 'li_steh', 'ab_vorhang'], musik: ['rq_gitarre', 'rq_synth', 'mx_dj'],
  regie: ['mo_schreib', 'bs_monitor', 'mx_podcast', 'mo_stuhl'], social: ['mo_schreib', 'bs_social', 'mo_stuhl'], werkstatt: ['mo_werkbank', 'if_patch'],
  lager: ['rq_kisten', 'mo_regal'], shop: ['mo_tresen', 'rq_merch']
};
function unlockedOk(st, id) { const d = D.objectById[id]; return st.mode !== 'career' || d.unlock <= (st.chapter || 1); }
function placeIn(st, lotId, id, rect) {
  const lot = st.lots[lotId]; if (!unlockedOk(st, id) || !S.canAfford(st, D.objectById[id].cost)) return false;
  for (let r = 0; r < 4; r++) for (let z = rect[1]; z < rect[3]; z++) for (let x = rect[0]; x < rect[2]; x++) {
    const o = { id, x, z, r };
    if (!B.canPlace(lot, o).ok) continue;
    const res = S.build(st, lotId, { t: 'place', o });
    if (res.ok) return true;
  }
  return false;
}
function buildRoom(st, lotId, rect, fn) {
  const lot = st.lots[lotId], [x0, z0, x1, z1] = rect;
  for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) if (!lot.floor[B.idx(lot, x, z)]) S.build(st, lotId, { t: 'floor', x, z, to: fn === 'tvbuehne' || fn === 'musik' ? 2 : 1 });
  const door = 'v:' + x0 + ',' + (z0 + 1);
  if (lot.walls[door] !== 'door') S.build(st, lotId, { t: 'wall', k: door, to: 'door' });
  const edges = [];
  for (let x = x0; x < x1; x++) edges.push('h:' + x + ',' + z0, 'h:' + x + ',' + z1);
  for (let z = z0; z < z1; z++) edges.push('v:' + x0 + ',' + z, 'v:' + x1 + ',' + z);
  edges.forEach(k => { if (!lot.walls[k]) S.build(st, lotId, { t: 'wall', k, to: 'wall' }); });
  (ROOM_KIT[fn] || []).forEach(id => placeIn(st, lotId, id, [x0, z0, x1, z1]));
  const res = S.build(st, lotId, { t: 'roomfn', x: x0 + 1, z: z0 + 1, fn });
  return res.ok;
}
function ensureRoom(st, fn, lotId) {
  lotId = lotId || 'studio';
  const has = S.studio(st).rooms.find(r => r.fn === fn && (!lotId || r.lot === lotId));
  if (has && has.valid) return true;
  if (fn === 'kueche' && lotId === 'studio') { S.build(st, 'studio', { t: 'roomfn', x: 10, z: 5, fn: 'kueche' }); return S.hasRoom(st, 'kueche'); }
  const slots = lotId === 'campus' ? CAMPUS : GARDEN, lot = st.lots[lotId];
  // vorhandenen (unfertigen) Raum dieser Funktion nachrüsten, sonst freien Platz nehmen
  const used = slots.find(s => lot.rooms.find(a => a.fn === fn && a.x === s[0] + 1 && a.z === s[1] + 1));
  const slot = used || slots.find(s => !lot.floor[B.idx(lot, s[0] + 1, s[1] + 1)] || (lotId === 'campus' && !lot.rooms.find(a => a.x === s[0] + 1 && a.z === s[1] + 1)));
  if (!slot) return false;
  buildRoom(st, lotId, slot, fn);
  return !!S.studio(st).rooms.find(r => r.fn === fn && r.lot === lotId && r.valid);
}
const AUF = [2, 2, 8, 12];
function upgrade(st) {
  // Aufnahmeraum Schritt für Schritt verbessern, wenn Geld übrig ist
  const plan = ['ab_paneel', 'ab_paneel', 'hp_studio', 'if_2', 'ab_paneel', 'ab_paneel', 'mic_dyn', 'mic_dyn', 'ab_bass', 'ab_bass', 'mx_podcast', 'mic_kond', 'mic_kond', 'ad_teppich', 'ab_decke', 'ab_decke', 'if_dsp'];
  const have = {}; st.lots.studio.objs.forEach(o => { have[o.id] = (have[o.id] || 0) + 1; });
  const want = {};
  for (const id of plan) {
    want[id] = (want[id] || 0) + 1;
    if ((have[id] || 0) >= want[id]) continue;
    if (st.money < D.objectById[id].cost + 2500 || !unlockedOk(st, id)) return;
    if (!placeIn(st, 'studio', id, AUF)) continue;
    return;
  }
  if (S.hasRoom(st, 'regie') === false && st.money > 4000 && st.chapter >= 2) ensureRoom(st, 'regie');
}
const NEXT_MORNING = st => { const r = S.advance(st, (1440 - st.time.min) + 8 * 60); return r; };
function resolvePending(st) {
  while (st.pending.length) {
    const ev = D.events.find(e => e.id === st.pending[0]);
    const idx = ev.choices.findIndex(c => c.mg) >= 0 ? ev.choices.findIndex(c => c.mg) : 0;
    const c = ev.choices[idx];
    S.eventChoose(st, ev.id, idx, c.mg ? playMG(st, c.mg, { event: true }) : null);
  }
}
const mgCache = {};
const BOT = { record: 72, edit: 70, weak: false };
function playMG(st, id, ctx, goal) {
  goal = goal || 'win';
  const k = id + goal + st.diff;
  if (!mgCache[k]) { const r = MG.simulate(id, { difficulty: st.diff, seed: 77 }, goal); mgCache[k] = { id, won: r.result.won, score: r.result.score }; }
  const res = mgCache[k];
  if (ctx) S.minigameDone(st, res, ctx);
  return res;
}
function doJob(st) {
  const jobs = D.jobs.filter(j => st.unlocks.districts[j.dist] && !j.event);
  const j = jobs.sort((a, b) => b.pay - a.pay)[0];
  playMG(st, j.mg, { job: j.id });
}
function pickTopic(st, want) {
  let list = S.topicsFor(st).filter(t => (!want.rubric || t.rubric === want.rubric) && (!want.tag || t.tags.includes(want.tag)));
  if (!list.length) list = S.topicsFor(st).filter(t => !want.rubric || t.rubric === want.rubric);
  const score = t => S.trend(st, t).value * D.rubrics.find(r => r.id === t.rubric).pop * (st.hostSkill.marco[t.rubric] + st.hostSkill.andrew[t.rubric]) / (t.research * 0.4 + 6);
  return list.sort((a, b) => score(b) - score(a))[0];
}
function pickGuest(st, want, topic) {
  const avail = D.guests.filter(g => S.guestAvailable(st, g).ok && S.canAfford(st, S.guestFee(st, g) + 300));
  if (typeof want.guest === 'string') return avail.find(g => g.id === want.guest) || null;
  if (want.guestArche) return avail.find(g => g.arche === want.guestArche) || null;
  if (want.tag === 'camping' || want.tag === 'bahn') { const g = avail.find(x => x.arche === (want.tag === 'camping' ? 'camper' : 'bahnexpertin')); if (g) return g; }
  const fit = avail.filter(g => g.fit.includes(topic.rubric)).sort((a, b) => b.fame - a.fame);
  if (want.guest || (st.money > 3000 && fit.length)) return fit[0] || avail[0] || null;
  return null;
}
/** Eine Folge komplett produzieren. want: { rubric, guest, guestArche, video, format, tag, teaser, edit } */
function produce(st, want) {
  want = want || {};
  resolvePending(st);
  if (st.hosts.marco.energy + st.hosts.andrew.energy < 2 * 45 || st.time.min > 17 * 60) NEXT_MORNING(st);
  resolvePending(st);
  let r = S.prodStart(st); if (!r.ok) { NEXT_MORNING(st); r = S.prodStart(st); if (!r.ok) return { ok: false, err: r.err }; }
  const sp = st.sponsors.active && D.sponsors.find(s => s.id === st.sponsors.active.id);
  if (sp && !want.rubric && !want.tag && !want.guestArche && !want.guest) { if (sp.goal.rubric) want = Object.assign({}, want, { rubric: sp.goal.rubric }); if (sp.goal.tag) want = Object.assign({}, want, { tag: sp.goal.tag }); if (sp.goal.video && S.hasRoom(st, 'tvbuehne')) want = Object.assign({}, want, { video: true }); }
  const topic = pickTopic(st, want), g = pickGuest(st, want, topic);
  const format = want.format || (st.money < 300 ? 'kurz' : 'normal');
  const fdef = S.formatById(format);
  const segs = [topic.rubric]; D.rubrics.forEach(x => { if (segs.length < Math.max(fdef.segments[0], 3) && segs.length < fdef.segments[1] && !segs.includes(x.id)) segs.push(x.id); });
  const lead = st.hostSkill.marco[topic.rubric] >= st.hostSkill.andrew[topic.rubric] ? 'marco' : 'andrew';
  r = S.prodPlan(st, { topic: topic.id, segments: segs, guest: g ? g.id : null, format, slot: 'abend', video: !!(want.video || (S.hasRoom(st, 'tvbuehne') && st.money > 2500)), lead });
  if (!r.ok) { S.prodCancel(st); return { ok: false, err: 'Plan: ' + r.err }; }
  r = S.prodResearch(st, st.hosts.marco.energy > 50 ? 2 : 1, 60); if (!r.ok) return { ok: false, err: r.err };
  r = S.prodTeam(st, g ? 70 : 0); if (!r.ok) { S.prodDropGuest(st); r = S.prodTeam(st, 0); }
  const T = S.prodTech(st).tech;
  if (T.fault) S.prodTechResolve(st, st.money > 600 ? 'pay' : 'minigame', st.money > 600 ? false : playMG(st, 'P04', null).won); else S.prodTechResolve(st);
  if (st.prod.event) { const ev = D.events.find(e => e.id === st.prod.event); const i = Math.max(0, ev.choices.findIndex(c => c.mg)); S.eventChoose(st, ev.id, i, ev.choices[i].mg ? playMG(st, ev.choices[i].mg, { event: true }) : null); }
  const beats = S.recordBeats(st), choices = beats.map(b => b.o.reduce((bi, o, i) => o.fx > b.o[bi].fx ? i : bi, 0));
  r = S.prodRecord(st, { score: BOT.record, choices: BOT.weak ? [1, 1, 1] : choices }); if (!r.ok) return { ok: false, err: 'Aufnahme: ' + r.err };
  r = S.prodEdit(st, want.edit ? { score: want.edit, detail: 'Bot' } : { score: BOT.edit, detail: 'Bot' }); if (!r.ok) return { ok: false, err: r.err };
  const teaser = want.teaser ? 'clip' : (st.money > 1500 ? (S.studio(st).cats.kamera ? 'video' : 'clip') : 'none');
  r = S.prodPackage(st, { cover: st.money > 400 ? 'foto' : 'klassik', teaser, title: '' });
  if (!r.ok) r = S.prodPackage(st, { cover: 'klassik', teaser: 'none' });
  if (!r.ok) return { ok: false, err: 'Paket: ' + r.err };
  if (st.prod.event) { const ev = D.events.find(e => e.id === st.prod.event); const i = Math.max(0, ev.choices.findIndex(c => c.mg)); S.eventChoose(st, ev.id, i, ev.choices[i].mg ? playMG(st, ev.choices[i].mg, { event: true }) : null); }
  r = S.prodPublish(st); if (!r.ok) return { ok: false, err: 'Publish: ' + r.err };
  const rep = r.report; S.prodFinish(st);
  log('    Folge ' + rep.ep.n + ' Tag ' + rep.ep.day + ' ' + rep.ep.rubric + ' Q' + rep.ep.q + ' ' + JSON.stringify(rep.q) + ' Hörer ' + rep.listeners + ' Fans+' + rep.fansGain + ' Geld ' + Math.round(st.money));
  return { ok: true, ep: rep.ep };
}
function maintain(st) {
  resolvePending(st);
  if (st.reliab < 55) { if (!S.repair(st, true).ok) S.repair(st, false); }
  if (st.condition < 45) S.renovate(st);
  while (st.money < 400 && st.stats.jobsToday < 3) doJob(st);
  if (st.mode === 'career' && st.unlocks.sponsors && !st.sponsors.active && st.sponsors.offers.length) {
    const best = st.sponsors.offers.map(id => D.sponsors.find(s => s.id === id)).sort((a, b) => (a.goal.video ? 1 : 0) - (b.goal.video ? 1 : 0))[0];
    if (!best.goal.video || S.hasRoom(st, 'tvbuehne')) S.sponsorAccept(st, best.id);
  }
  upgrade(st);
}
const hireOrder = ['redaktion', 'technik', 'schnitt', 'social', 'booking', 'kamera', 'reparatur', 'event'];
function hireOne(st) {
  S.refreshApplicants(st);
  const a = st.applicants.slice().sort((x, y) => hireOrder.indexOf(x.role) - hireOrder.indexOf(y.role) || x.salary - y.salary).find(x => !st.staff.find(s => s.role === x.role)) || st.applicants[0];
  if (!a) return false;
  const res = S.hire(st, a.id);
  if (res.ok) { const stn = D.roles[a.role].station.find(id => unlockedOk(st, id)); if (stn && !st.staff.find(s => s.id === a.id).station) { const rect = GARDEN.find(s => st.lots.studio.rooms.find(q => q.fn === 'redaktion' && q.x === s[0] + 1)) || [8, 2, 14, 12]; placeIn(st, 'studio', stn, rect) || placeIn(st, 'studio', stn, [8, 2, 14, 12]); S.assignStations(st); } }
  return res.ok;
}
/** Versucht das nächste offene Ziel zu erfüllen. Gibt Text zurück, was getan wurde. */
function act(st, o, prog, i) {
  const s = S.objectiveState(st, o, prog, i); if (s.have >= s.need) return 'done';
  switch (o.type) {
    case 'talk': S.talk(st, o.npc); return 'talk';
    case 'visit': S.visit(st, o.dist); return 'visit';
    case 'build': {
      const ids = o.obj ? [o.obj] : D.objects.filter(d => d.cat === o.cat && unlockedOk(st, d.id)).sort((a, b) => a.cost - b.cost).map(d => d.id);
      const rect = o.cat === 'kamera' || o.cat === 'licht' ? (GARDEN.find(sl => st.lots.studio.rooms.find(q => q.fn === 'tvbuehne' && q.x === sl[0] + 1)) || AUF) : AUF;
      for (const id of ids) { if (placeIn(st, 'studio', id, rect) || placeIn(st, 'studio', id, [0, 0, 20, 14])) return 'build ' + id; }
      if (o.obj === 'if_recorder' || o.obj === 'rq_pokal') { if (placeIn(st, 'studio', 'mo_tisch', [8, 2, 14, 12]) && placeIn(st, 'studio', o.obj, [8, 2, 14, 12])) return 'build'; }
      if (st.money < 2000) { doJob(st); return 'job for build'; }
      return 'build failed';
    }
    case 'room': {
      if (o.lot === 'campus') { const need = ['regie', 'social', 'lounge']; for (const fn of need) { if (!S.studio(st).rooms.find(r => r.fn === fn && r.lot === 'campus' && r.valid)) { ensureRoom(st, fn, 'campus'); return 'campus room ' + fn; } } return 'campus?'; }
      if (st.money < 1500) { doJob(st); return 'job for room'; }
      return ensureRoom(st, o.fn) ? 'room ' + o.fn : 'room failed ' + o.fn;
    }
    case 'publish': case 'listeners': case 'editscore': {
      if (o.video || (o.type === 'publish' && o.rubric === 'tv' && o.video)) ensureRoom(st, 'tvbuehne');
      if (o.rubric === 'musik') ensureRoom(st, 'musik');
      if (o.guestArche || o.guest) ensureRoom(st, 'lounge');
      const want = o.type === 'publish' ? { rubric: o.rubric, guest: o.guest, guestArche: o.guestArche, video: o.video, format: o.format, tag: o.tag } : o.type === 'editscore' ? { edit: Math.max(70, o.n + 5) } : {};
      const r = produce(st, want); return r.ok ? 'publish ' + r.ep.q + '% ' + r.ep.listeners : 'publish failed: ' + r.err;
    }
    case 'fans': case 'archive': case 'rep': { const r = produce(st, {}); return r.ok ? 'episode ' + r.ep.q : 'ep failed ' + r.err; }
    case 'money': { doJob(st); if (st.stats.jobsToday > 3) produce(st, {}); return 'job'; }
    case 'hire': return hireOne(st) ? 'hire' : (doJob(st), 'job for hire');
    case 'minigame': {
      const id = o.id || MG.list().filter(d => d.group === o.group)[(prog[i] || 0) % 4].id;
      const res = playMG(st, id, {}, o.win || o.minScore ? 'win' : 'win');
      return 'mg ' + id + ' ' + res.won + ' ' + res.score;
    }
    case 'repair': { if (!S.repair(st, true).ok) { st.reliab = Math.min(st.reliab, 30); S.repair(st, false); } return 'repair'; }
    case 'sponsor': {
      if (o.state === 'accept') { if (!st.sponsors.offers.length) S.refreshSponsors(st); const id = st.sponsors.offers[0]; if (id) S.sponsorAccept(st, id); else produce(st, {}); return 'sponsor accept'; }
      if (!st.sponsors.active) { if (!st.sponsors.offers.length) S.refreshSponsors(st); const id = st.sponsors.offers.find(x => !D.sponsors.find(s => s.id === x).goal.video); if (id) S.sponsorAccept(st, id); else NEXT_MORNING(st); return 'sponsor wait'; }
      const r = produce(st, {}); return 'sponsor ep ' + (r.ok ? r.ep.q : r.err);
    }
    case 'train': { if (!st.staff.length) hireOne(st); const s2 = st.staff.find(x => !x.training && x.skill < 10); if (s2 && S.train(st, s2.id).ok) return 'train'; doJob(st); return 'job for train'; }
    case 'teaser': { const r = produce(st, { teaser: true }); return 'teaser ' + r.ok; }
    case 'unlock': { if (S.buyLot(st, o.lot).ok) return 'lot'; doJob(st); if (st.stats.jobsToday > 3) produce(st, {}); return 'save for lot'; }
    case 'event': {
      if (o.kind === 'quizshow') { playMG(st, 'Q02', { job: 'j_quizshow' }); return 'quizshow'; }
      if (o.kind === 'liveshow') { ensureRoom(st, 'tvbuehne'); if (S.liveshowAvailable(st).ok) { playMG(st, 'Y01', { liveshow: true }); return 'liveshow'; } return 'no stage'; }
      return 'event?';
    }
    case 'party': { const res = playMG(st, 'Q02', null); S.minigameDone(st, res, { party: 2 }); return 'party'; }
    default: return 'unknown ' + o.type;
  }
}
function runCareer(diff, seed, maxDays) {
  const st = S.create({ seed, difficulty: diff });
  let minMoney = st.money, steps = 0, stuck = 0, lastDone = 0;
  const trace = [];
  while (st.missions.cur && st.time.day <= maxDays && steps < 6000) {
    steps++;
    maintain(st);
    const m = S.currentMission(st);
    if (st.missions.curState === 'offer') { S.talk(st, m.actor); if (st.pendingChoice) S.storyChoice(st, st.pendingChoice, 2); continue; }
    const prog = st.missions.prog;
    const idx = m.obj.findIndex((o, i) => { const s = S.objectiveState(st, o, prog, i); return s.have < s.need; });
    if (idx < 0) { S.checkMissions(st); continue; }
    const what = act(st, m.obj[idx], prog, idx);
    trace.push(st.time.day + ' ' + m.id + ' ' + what);
    if (st.time.min > 21 * 60) NEXT_MORNING(st);
    minMoney = Math.min(minMoney, st.money);
    if (st.missions.done.length !== lastDone) { lastDone = st.missions.done.length; stuck = 0; log('  Tag ' + st.time.day + ' ✓ ' + D.missions[lastDone - 1].id + ' ' + JSON.stringify(S.summary(st))); }
    else if (++stuck > 400) break;
  }
  return { st, minMoney, steps, trace };
}

// ── 4. Karriere-Durchlauf (alle 60 Missionen) ──────────────
const LIMIT = { 0: 140, 1: 170, 2: 220 };
const careerStates = {};
for (const diff of [0, 1, 2]) {
  const t0 = Date.now();
  const r = runCareer(diff, 20261017 + diff, LIMIT[diff]);
  careerStates[diff] = r.st;
  const done = r.st.missions.done.length, st = r.st;
  const avgQ = st.episodes.length ? Math.round(st.episodes.reduce((t, e) => t + e.q, 0) / st.episodes.length) : 0;
  console.log('Karriere ' + D.rules.difficulty[diff].name + ': ' + done + '/60 Missionen, Tag ' + st.time.day + ', ' + st.episodes.length + ' Folgen (Ø ' + avgQ + ' %), Geld ' + Math.round(st.money) + ' (min ' + Math.round(r.minMoney) + '), Fans ' + st.fans + ', Ruf ' + st.rep + ', Ende ' + st.story.ending + ', ' + (Date.now() - t0) + ' ms');
  ok(done === 60, D.rules.difficulty[diff].name + ': alle 60 Missionen geschafft (' + done + ', hängt bei ' + st.missions.cur + ')');
  if (done < 60) console.error(r.trace.slice(-25).join('\n'));
  ok(st.story.ending && D.endings[st.story.ending], D.rules.difficulty[diff].name + ': Ende erreicht');
  ok(st.endless && st.endless.goals.length === 3, D.rules.difficulty[diff].name + ': Endlosmodus startet');
  ok(Number.isFinite(st.money) && Number.isFinite(st.fans) && st.fans >= 0, 'Werte endlich');
  ok(st.ledger.every(L => Number.isFinite(L.money)), 'Buchhaltung endlich');
}
// Schwacher Spieler (niedrige Aufnahme- und Schnittwerte) schafft die Story trotzdem
{
  Object.assign(BOT, { record: 38, edit: 35, weak: true });
  const r = runCareer(1, 777, 260); const st = r.st;
  const avgQ = st.episodes.length ? Math.round(st.episodes.reduce((t, e) => t + e.q, 0) / st.episodes.length) : 0;
  console.log('Karriere schwacher Spieler: ' + st.missions.done.length + '/60, Tag ' + st.time.day + ', ' + st.episodes.length + ' Folgen (Ø ' + avgQ + ' %), Geld ' + Math.round(st.money) + ' (min ' + Math.round(r.minMoney) + ')');
  ok(st.missions.done.length === 60, 'Schwacher Spieler: alle Missionen (hängt bei ' + st.missions.cur + ')');
  if (st.missions.done.length < 60) console.error(r.trace.slice(-15).join('\n'));
  Object.assign(BOT, { record: 72, edit: 70, weak: false });
}
// Endloswoche: weiterspielen
{
  const st = careerStates[1]; const day0 = st.time.day, week0 = st.endless.week;
  for (let i = 0; i < 30 && st.time.day < day0 + 8; i++) { maintain(st); produce(st, {}); if (i % 3 === 0) playMG(st, 'Q01', {}); }
  ok(st.endless.week > week0, 'Endlosmodus: neue Woche (' + st.endless.week + ')');
  ok(st.endless.done > 0, 'Endlosmodus: Wochenziele erreicht (' + st.endless.done + ')');
}

// ── 5. Determinismus ───────────────────────────────────────
{
  const a = runCareer(1, 4242, 40).st, b = runCareer(1, 4242, 40).st;
  ok(JSON.stringify(S.summary(a)) === JSON.stringify(S.summary(b)) && JSON.stringify(a.episodes) === JSON.stringify(b.episodes), 'Gleicher Seed → gleicher Verlauf');
}

// ── 6. Anti-Softlock: pleite ───────────────────────────────
{
  const st = S.create({ seed: 9 }); st.money = -800;
  const r = produce(st, { format: 'kurz' });
  ok(r.ok, 'Pleite: Kurzfolge ohne Geld möglich (' + (r.err || '') + ')');
  const m0 = st.money; doJob(st);
  ok(st.money > m0, 'Pleite: Nebenjob bringt Geld');
  st.reliab = 10; ok(S.repair(st, false).ok && st.reliab >= 35, 'Gratis-Grundreparatur');
  st.hosts.marco.energy = st.hosts.andrew.energy = 0; ok(!S.canProduce(st).ok, 'Erschöpfte Hosts');
  S.advance(st, 24 * 60); ok(S.canProduce(st).ok, 'Nach einer Nacht wieder fit');
  // 30 Tage ohne Aktivität: Geld sinkt, aber das Spiel bleibt spielbar
  for (let d = 0; d < 30; d++) S.advance(st, 1440);
  ok(Number.isFinite(st.money) && S.prodStart(st).ok, 'Nach 30 Tagen Leerlauf weiter spielbar');
  S.prodCancel(st);
  // Nebenjob-Deckel
  const m1 = st.money; for (let i = 0; i < 3; i++) doJob(st); const full = st.money - m1;
  const m2 = st.money; for (let i = 0; i < 3; i++) doJob(st); const capped = st.money - m2;
  ok(capped < full * 0.6, 'Nebenjobs ab dem 4. am Tag gedeckelt');
}

// ── 7. Kreativ und Herausforderungen ──────────────────────
{
  const c = S.create({ mode: 'creative', seed: 3 }); const m = c.money;
  ok(placeIn(c, 'campus', 'cam_kran', [2, 2, 26, 18]) && c.money === m, 'Kreativmodus: bauen kostenlos, alles frei');
  D.challenges.forEach(ch => {
    const st = S.create({ mode: 'challenge', challenge: ch.id, seed: 11 });
    ok(st.challenge && S.challengeStatus(st).items.length > 0, 'Herausforderung ' + ch.id + ' startet');
    for (let i = 0; i < 400 && !st.challenge.done; i++) {
      maintain(st);
      if (ch.goal.minigameWins) playMG(st, ['Q01', 'Q02', 'Q03', 'Q04'][i % 4], {}); else if (ch.goal.money && i % 2) doJob(st); else produce(st, ch.goal.distinctGuests ? { guest: true } : {});
      if (st.time.min > 20 * 60 || (ch.goal.minigameWins && i % 3 === 2)) NEXT_MORNING(st);
    }
    ok(st.challenge.done, 'Herausforderung ' + ch.id + ' endet (Erfolg: ' + st.challenge.success + ')');
    if (VERBOSE) console.log('  ' + ch.id + ': ' + JSON.stringify(S.challengeStatus(st).items) + ' Tag ' + st.time.day);
  });
}

// ── 8. Speichern (falls vorhanden) ─────────────────────────
if (P.Save) {
  const mem = {}; const store = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; }, key: i => Object.keys(mem)[i], get length() { return Object.keys(mem).length; } };
  const repo = P.Save.create(store);
  const st = careerStates[1];
  ok(repo.save('slot1', st).ok, 'Speichern Slot 1');
  const back = repo.load('slot1');
  ok(back.ok && JSON.stringify(S.summary(back.state)) === JSON.stringify(S.summary(st)) && back.state.episodes.length === st.episodes.length, 'Laden gibt denselben Stand');
  ok(back.state.lots.studio.objs.length === st.lots.studio.objs.length, 'Laden: Studio gleich');
  mem[repo.key('slot1')] = '{kaputt';
  const bad = repo.load('slot1'); ok(bad.ok && bad.restored, 'Kaputter Spielstand → Sicherung (lastGood) geladen');
  delete mem[repo.key('slot1')]; delete mem[repo.key('slot1') + '.lastGood'];
  ok(!repo.load('slot1').ok, 'Leerer Slot meldet „leer“');
  const old = JSON.parse(JSON.stringify(st)); old.v = 0; delete old.stats.distinctRubrics; mem[repo.key('slot2')] = JSON.stringify({ saveSchema: 0, game: 'anmacha-podcast-tycoon', state: old });
  const mig = repo.load('slot2'); ok(mig.ok && mig.state.v === S.SCHEMA && mig.state.stats.distinctRubrics, 'Migration von altem Schema');
  ok(repo.list().length >= 1, 'Slot-Liste');
} else console.log('NOT RUN: Speichern (storage/save.js fehlt)');

console.log((fails ? 'FEHLER' : 'OK') + ': ' + passes + ' Prüfungen bestanden, ' + fails + ' fehlgeschlagen');
process.exit(fails ? 1 : 0);
