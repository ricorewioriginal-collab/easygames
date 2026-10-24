/* Speichern: 3 Plätze + Autosave, Rundlauf ohne Verlust, Export/Import, kaputte Daten, laufende Schlacht, Offline-Fortschritt, Kampagne. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const PW = require('./load.js');
const G = PW.Game, SV = PW.Save;

function memStore() { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: k => { m.delete(k); }, _m: m }; }
function run(S, sec) { for (let t = 0; t < sec; t += PW.TICK) G.tick(S, PW.TICK); }

test('Drei eigene Plätze und ein automatischer', () => {
  assert.deepEqual(SV.SLOTS, ['auto', 'slot1', 'slot2', 'slot3']);
});

test('Rundlauf: gespeicherter Stand läuft nach dem Laden genauso weiter', () => {
  SV.store = memStore();
  const S = G.newGame({ mode: 'free', seed: 'rund', bots: 4 }); run(S, 1800);
  assert.ok(SV.save(S, 'slot2') > 0);
  assert.equal(SV.index().slot2.day, PW.dayNo(S));
  const L = SV.load('slot2'); G.refresh(L);
  assert.equal(L.time, S.time); assert.deepEqual(L.res, S.res); assert.equal(L.city.b.length, S.city.b.length);
  run(S, 600); run(L, 600);
  assert.equal(Math.round(L.time), Math.round(S.time));
  PW.RES.forEach(k => assert.ok(Math.abs(L.res[k] - S.res[k]) < 1e-6 * Math.max(1, S.res[k]) + 1, k + ': ' + L.res[k] + ' / ' + S.res[k]));
  SV.remove('slot2'); assert.equal(SV.load('slot2'), null);
  SV.store = null;
});

test('Export/Import als Text, kaputte und fremde Daten werden abgelehnt', () => {
  const S = G.newGame({ mode: 'free', seed: 'export', bots: 3 }); run(S, 300);
  const txt = SV.exportText(S), I = SV.importText(txt);
  assert.equal(I.seed, S.seed); assert.equal(I.factions.length, S.factions.length);
  assert.throws(() => SV.importText('{kaputt'));
  assert.throws(() => SV.importText('{"hallo":1}'), /Pestwacht/);
  const neu = JSON.parse(txt); neu.v = PW.SCHEMA + 5;
  assert.throws(() => SV.importText(JSON.stringify(neu)), /neueren/);
});

test('Laden während einer beobachteten Schlacht: der Kampf wird neu ausgetragen statt hängenzubleiben', () => {
  const S = G.newGame({ mode: 'free', seed: 'kampf-laden', bots: 3 });
  const m = { id: 99, owner: 'P', state: 'kampf', work: 1e9, path: [S.world.caps[0], S.world.caps[0]], back: [], seg: 1, prog: 0, units: { spear: 5 }, heroes: [], mission: 'scout', target: S.world.caps[0] };
  S.marches.push(m);
  const L = SV.importText(SV.exportText(S)), a = L.marches.find(x => x.id === 99);
  assert.equal(a.state, 'go'); assert.equal(a.work, 0);
});

test('Offline-Fortschritt: nur Produktion, begrenzt, keine Angriffe', () => {
  const S = G.newGame({ mode: 'free', seed: 'offline', bots: 3 }); run(S, 120); G.refresh(S);
  const wood = S.res.wood, waves = S.waves.n;
  const r = G.offline(S, 6 * 3600);
  assert.ok(r && r.seconds > 0 && r.seconds <= 6 * 3600);
  assert.ok(S.res.wood >= wood, 'Holz wurde produziert oder blieb gleich');
  assert.equal(S.waves.n, waves, 'offline kommt keine Welle');
  assert.equal(S.waves.active, null);
});

test('Erfolge werden im easygames-Format geschrieben', () => {
  SV.store = memStore();
  const S = G.newGame({ mode: 'free', seed: 'erfolge', bots: 3 }); S.ach.heil1 = Date.now(); SV.save(S, 'auto');
  const o = JSON.parse(SV.store.getItem('anmacha-gameach.pestwacht'));
  assert.ok(o.t && Array.isArray(o.d) && o.d.length >= 10 && o.u.heil1);
  const best = JSON.parse(SV.store.getItem('easygames.pestwacht.best'));
  assert.ok(best && typeof best.pop === 'number');
  SV.store = null;
});

test('Kampagne: 5 Kapitel, der Start setzt Missionsziele', () => {
  const S = G.newGame({ mode: 'campaign' });
  assert.ok(S.campaign, 'Kampagnenzustand vorhanden');
  assert.equal(PW.Campaign.CHAPTERS.length, 5);
  assert.ok(PW.Campaign.all().length >= 10, 'mehrere Missionen je Kapitel');
  const m = PW.Campaign.mission(S); assert.ok(m && m.goals.length > 0);
});
