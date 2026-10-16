#!/usr/bin/env node
// Prüft Krawallvögel 3D ohne Browser: alle 150 Level (Aufbau, Stabilität, Reichweite), alle Vogel-Fähigkeiten,
// alle Power-ups und – per Zielbot – die Lösbarkeit einer Auswahl von Leveln aus jeder Welt.
//   node tools/test-krawallvoegel.cjs            (Exit-Code 1 bei Fehlern)
//   node tools/test-krawallvoegel.cjs --all      Bot spielt alle 150 Level (dauert einige Minuten)
'use strict';
const K = require('../krawallvoegel/levels.js'), S = require('../krawallvoegel/sim.js'), BOT = require('./kv-bot.cjs');
let fails = 0;
const fail = m => { fails++; console.log('FEHLER ' + m); };
const ok = m => console.log('OK     ' + m);

// 1) Aufbau aller Level
const golds = new Array(K.WORLD_COUNT).fill(0);
let maxReach = 0;
for (let id = 0; id < K.LEVEL_COUNT; id++) {
  const L = K.getLevel(id), n = L.name;
  if (!L.pigs.length) fail(n + ': keine Schweine');
  if (L.birds.length < 3 || L.birds.length > 8) fail(n + ': ' + L.birds.length + ' Vögel');
  const allowed = K.birdsUnlocked(L.world, L.index);
  L.birds.forEach(b => { if (!allowed.includes(b)) fail(n + ': Vogel ' + b + ' noch nicht freigeschaltet'); });
  if (!(L.stars[0] < L.stars[1] && L.stars[1] < L.stars[2])) fail(n + ': Sterne-Schwellen nicht aufsteigend');
  if (L.gold) golds[L.world]++;
  // Jedes Schwein muss mit voller Kraft ballistisch erreichbar sein
  L.pigs.forEach(p => { if (BOT.aimFor(p.x, p.y, K.SLING.vmax, false) === null) fail(n + ': Schwein bei x=' + p.x.toFixed(1) + ' unerreichbar'); maxReach = Math.max(maxReach, p.x); });
  L.blocks.filter(b => b.m === 'gold').forEach(b => { if (BOT.aimFor(b.x, b.y, K.SLING.vmax, false) === null) fail(n + ': goldene Kiste unerreichbar'); });
  if (K.getLevel(id) !== L || JSON.stringify(K.getLevel(id)) !== JSON.stringify(L)) fail(n + ': nicht deterministisch');
}
golds.forEach((g, w) => { if (g !== 1) fail('Welt ' + (w + 1) + ': ' + g + ' goldene Kisten statt 1'); });
ok(K.LEVEL_COUNT + ' Level aufgebaut, weitestes Schwein bei x=' + maxReach.toFixed(1));

// 2) Stabilität: alles wach, 5 s rechnen – nichts darf umfallen oder kaputtgehen
let unstable = 0;
for (let id = 0; id < K.LEVEL_COUNT; id++) {
  const L = K.getLevel(id), s = S.createSim(L), start = new Map();
  s.ents.forEach(e => { if (e.body) { e.body.setAwake(true); const p = e.body.getPosition(); start.set(e, [p.x, p.y]); } });
  for (let i = 0; i < 300; i++) { s.step(); }
  let moved = 0;
  s.ents.forEach(e => { if (e.dead) { moved = 99; return; } const a = start.get(e); if (!a) return; const p = e.body.getPosition(); moved = Math.max(moved, Math.hypot(p.x - a[0], p.y - a[1])); });
  if (moved > 0.15 || s.pigsLeft !== L.pigs.length) { unstable++; fail(L.name + ': Bauwerk instabil (' + moved.toFixed(2) + ' m)'); }
}
if (!unstable) ok('Alle Bauwerke stehen stabil');

// 3) Fähigkeiten aller Vögel
const finite = s => s.ents.every(e => e.dead || !e.body || (isFinite(e.body.getPosition().x) && isFinite(e.body.getPosition().y)));
K.BIRD_ORDER.forEach(type => {
  const L = Object.assign({}, K.getLevel(60), { birds:[type, 'red'] });
  const s = S.createSim(L);
  s.launch(-2, -1.2);
  for (let i = 0; i < 40; i++) s.step();
  const used = s.ability();
  const after = s.ents.filter(e => e.kind === 'bird' && !e.dead).length;
  for (let i = 0; i < 900 && !s.canShoot() && s.state !== 'won' && s.state !== 'lost'; i++) s.step();
  const evs = s.events.map(e => e.type);
  if (!used) fail('Fähigkeit von ' + type + ' nicht auslösbar');
  else if (!finite(s)) fail('Fähigkeit von ' + type + ' erzeugt ungültige Positionen');
  else if (type === 'blue' && after < 3) fail('Blitz-Trio hat sich nicht geteilt');
  else if ((type === 'black' || type === 'white') && !evs.includes('boom')) fail(type + ' ohne Explosion');
  else if (!(s.canShoot() || s.state === 'won' || s.state === 'lost')) fail(type + ': Zug endet nicht');
});
ok('Fähigkeiten geprüft: ' + K.BIRD_ORDER.join(', '));

// 4) Power-ups
['scope', 'sling', 'seed', 'quake', 'eagle'].forEach(pw => {
  const s = S.createSim(K.getLevel(74));
  if (!s.usePower(pw)) { fail('Power-up ' + pw + ' nicht einsetzbar'); return; }
  if (pw === 'seed') s.launch(-2, -1);
  for (let i = 0; i < 600; i++) s.step();
  if (!finite(s)) fail('Power-up ' + pw + ' erzeugt ungültige Positionen');
  if (pw === 'eagle' && s.pigsLeft >= K.getLevel(74).pigs.length) fail('Mega-Adler hat kein Schwein erwischt');
  if (pw === 'sling' && !(s.vmax > K.SLING.vmax)) fail('Superschleuder ohne Wirkung');
});
ok('Power-ups geprüft');

// 5) Lösbarkeit per Zielbot (nutzt keine Fähigkeiten, zielt nur auf Schweine)
const all = process.argv.includes('--all');
const sample = all ? Array.from({ length:K.LEVEL_COUNT }, (_, i) => i) : K.WORLDS.map((_, w) => w * K.LEVELS_PER_WORLD + (w * 5 + 3) % 14);
let won = 0; const lost = [];
sample.forEach(id => { const r = BOT.solve(K.getLevel(id)); if (r.won) won++; else lost.push(K.getLevel(id).name); });
const need = Math.ceil(sample.length * 0.85);
(won >= need ? ok : fail)('Bot schafft ' + won + '/' + sample.length + ' Level' + (lost.length ? ' (nicht: ' + lost.join(', ') + ')' : ''));

console.log(fails ? fails + ' Fehler' : 'Alles in Ordnung');
process.exit(fails ? 1 : 0);
