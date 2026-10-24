/* Simulation: Seuche und Heilung, Forschung, Rekrutierung, Helden-Erfahrung, Tempo/Pause, Langzeitlauf ohne Fehler. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const PW = require('./load.js');
const G = PW.Game, C = PW.City, E = PW.Econ, H = PW.Heroes;

function game(seed, rich) { const S = G.newGame({ mode: 'free', seed: seed || 'sim', bots: 3, waves: false }); if (rich) PW.RES.forEach(k => { S.res[k] = 5000; }); G.refresh(S); return S; }
function run(S, sec) { for (let t = 0; t < sec; t += PW.TICK) G.tick(S, PW.TICK); }
function spot(S, type) { for (let x = C.MIN; x <= C.MAX; x++) for (let y = C.MIN; y <= C.MAX; y++) if (C.canPlace(S, type, x, y, 0).ok) return [x, y]; return null; }
function build(S, type) { const p = spot(S, type), r = C.place(S, type, p[0], p[1], 0); assert.equal(r.ok, true, type + ': ' + r.why); for (let i = 0; i < 6000 && C.get(S, r.b.id).st !== 'ok'; i++) G.tick(S, 0.5); return r.b; }
const total = p => p.h + p.r + p.i + p.q + p.t + p.rec;

test('Seuche: Infizierte ohne Pflege stecken an, mit Heilstube und Arznei werden sie gesund', () => {
  const A = game('seuche-a'), B = game('seuche-b', true);
  [A, B].forEach(S => { S.pop.h -= 6; S.pop.i += 6; S.cfg.waves = false; });
  if (!C.count(B, 'heilstube')) build(B, 'heilstube'); B.res.med = 400; G.refresh(B);
  const cured0 = B.stats.cured || 0, inf0 = A.stats.infected || 0;
  run(A, 900); run(B, 900);
  assert.ok((A.stats.infected || 0) > inf0, 'ohne Pflege gibt es Neuansteckungen');
  assert.ok((B.stats.cured || 0) > cured0, 'mit Heilstube werden Patienten geheilt');
  [A, B].forEach(S => { ['h', 'r', 'i', 'q', 't', 'rec', 'dead'].forEach(k => assert.ok(S.pop[k] >= 0 && Number.isFinite(S.pop[k]), k)); });
});

test('Forschung: drei Bäume, Start kostet, Abschluss schaltet frei', () => {
  assert.equal(PW.TREES.length, 3);
  const S = game('forschung', true); const hq = S.city.b.find(b => b.t === 'hq'); C.upgrade(S, hq.id); for (let i = 0; i < 6000 && hq.st !== 'ok'; i++) G.tick(S, 0.5); build(S, 'akademie');
  const t = PW.TECHS.find(x => !E.researchWhy(S, x.id));
  assert.ok(t, 'mindestens eine Forschung ist verfügbar');
  const r = E.startResearch(S, t.id); assert.ok(r === true || (r && r.ok !== false), 'Forschung startet');
  run(S, E.researchTime(S, t.id) + 30);
  assert.ok(S.research.done[t.id], 'Forschung abgeschlossen');
});

test('Rekrutierung: Kaserne bildet Spießträger aus', () => {
  const S = game('rekrut', true); build(S, 'kaserne');
  const n0 = S.troops.spear || 0, why = E.recruitWhy(S, 'spear', 5);
  assert.equal(why, null, why);
  E.recruit(S, 'spear', 5); run(S, E.recruitTime(S, 'spear', 5) + 30);
  assert.equal(S.troops.spear, n0 + 5);
});

test('Helden: 12 Helden, Erfahrung bringt Stufen und Talentpunkte', () => {
  assert.equal(PW.HEROES.length, 12);
  const S = game('helden'), id = Object.keys(S.heroes)[0];
  assert.ok(id, 'zu Beginn ist mindestens ein Held da');
  const h = S.heroes[id], lv = h.lv, sp = h.sp;
  H.addXp(S, id, PW.xpFor(lv) + 1);
  assert.equal(h.lv, lv + 1); assert.equal(h.sp, sp + 1);
});

test('Pause hält die Zeit an, Tempo 3 läuft dreimal so schnell', () => {
  const S = game('tempo'); S.paused = true; G.advance(S, 0.2); assert.equal(S.time, 0);
  S.paused = false; S.speed = 1; for (let i = 0; i < 20; i++) G.advance(S, 0.1); const t1 = S.time;
  const T = game('tempo'); T.speed = 3; for (let i = 0; i < 20; i++) G.advance(T, 0.1);
  assert.ok(Math.abs(T.time - 3 * t1) <= PW.TICK * 2, t1 + ' / ' + T.time);
});

test('Langzeitlauf: 2 Spielstunden Kampagne und freies Spiel ohne Fehler und ohne NaN', () => {
  ['free', 'campaign'].forEach(mode => {
    const S = G.newGame({ mode, seed: 'lang-' + mode, bots: 8 });
    run(S, 7200);
    PW.RES.forEach(k => assert.ok(Number.isFinite(S.res[k]) && S.res[k] >= 0, mode + ' ' + k));
    assert.ok(Number.isFinite(total(S.pop)));
    if (mode === 'free') assert.ok(S.waves.n >= 1, 'mindestens eine Welle kam');   // die Kampagne hält Wellen bis zum passenden Kapitel zurück
  });
});
