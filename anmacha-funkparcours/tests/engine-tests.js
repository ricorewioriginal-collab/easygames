/* Tests für Physik, Hindernisse, Parcours (machbar? – ein Planer-Bot läuft alle Strecken) und Wertung (node tests/engine-tests.js) */
import { Sim, COURSES, JUMP_V, G, RUN, PW, PH, DT, movePos, swingBall, rank, pointsFor, fmtTime, WALLRUN_MIN } from '../engine.js';
import { runBot } from '../bot.js';
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
const mk = (o, startX = 2) => { const c = { name: 't', o, finish: o.find(x => x.k === 'finish'), length: 99 }; const s = new Sim(c); s.x = startX; return s; };
const run = (s, inp, sec) => { for (let i = 0; i < sec / DT && !s.dead && !s.finished; i++) s.step(typeof inp === 'function' ? inp(s) : inp); return s; };
const P = (x, w, y = 1) => ({ k: 'plat', x, y, w });
// Grundbewegung
{ const s = mk([P(0, 40)]); run(s, { r: 1 }, 2); ok(s.onGround && Math.abs(s.vx - RUN) < 0.01 && s.x > 8, 'Rennen: Höchstgeschwindigkeit ' + RUN + ' m/s, bleibt auf der Plattform'); run(s, {}, 1); ok(s.vx === 0 && s.onGround, 'Loslassen: Reibung bremst bis zum Stillstand'); }
{ const s = mk([P(0, 40)]); let apex = 0; run(s, s2 => { apex = Math.max(apex, s2.y - 1); return { j: 1 }; }, 1.2); ok(Math.abs(apex - JUMP_V * JUMP_V / (2 * G)) < 0.08, `Sprunghöhe ≈ ${(JUMP_V * JUMP_V / (2 * G)).toFixed(2)} m (gemessen ${apex.toFixed(2)})`); }
{ const s = mk([P(0, 40)]); let apex = 0; let n = 0; run(s, s2 => { apex = Math.max(apex, s2.y - 1); return { j: n++ < 2 ? 1 : 0 }; }, 1.2); ok(apex < 0.8 && apex > 0.1, `Kurzer Tipp = kleiner Sprung (${apex.toFixed(2)} m)`); }
{ const s = mk([P(0, 40)]); s.step({ j: 1 }); s.step({}); ok(s.vy > 0 || s.y > 1, 'Sprungpuffer: Sprung wird auch beim kurzen Tippen ausgelöst'); }
{ const s = mk([P(0, 5)]); run(s, { r: 1 }, 2); ok(s.dead === 'water', 'Vom Rand laufen: Sturz ins Wasser'); }
{ const s = mk([P(0, 5)], 4.9); s.vx = 0; run(s, { r: 1 }, 0.2); ok(!s.dead, 'Coyote-Time: kurz nach dem Rand ist ein Sprung noch möglich'); let cnt = 0; run(s, () => ({ r: 1, j: 1 }), 0.06); ok(s.vy > 0 || s.y > 1, 'Sprung knapp hinter dem Rand klappt (Coyote)'); }
// Lücke mit Sprung
{ const s = mk([P(0, 6), P(9, 4)]); run(s, st => ({ r: st.x < 10 ? 1 : 0, j: st.x > 5.4 && st.x < 7.4 && (st.onGround || st.vy > 0.5) ? 1 : 0 }), 2.2); ok(!s.dead && s.onGround && s.x > 9, 'Lücke 3 m: Sprung vom Rand landet auf der nächsten Plattform'); }
{ const s = mk([P(0, 6), P(11, 4)]); run(s, st => ({ r: 1, j: st.x > 5.4 && (st.onGround || st.vy > 0.5) ? 1 : 0 }), 3); ok(s.dead === 'water', 'Lücke 5 m: zu weit → Sturz'); }
// Plattform mit Kopf/Seite
{ const s = mk([P(0, 20), { k: 'plat', x: 8, y: 2.4, w: 4 }]); run(s, { r: 1 }, 3); ok(s.x < 8 && !s.dead, 'Hohe Plattform blockiert seitlich (kein Durchlaufen)'); }
{ const s = mk([P(0, 20), { k: 'plat', x: 3, y: 3.4, w: 4 }], 4); run(s, { j: 1 }, 0.4); ok(s.y + PH <= 2.9 + 0.06 && !s.dead, 'Kopfstoß: unter einer Plattform kein Durchspringen'); }
// Absinkende Plattform
{ const s = mk([P(0, 4), { k: 'sink', x: 4, y: 1, w: 3, delay: 0.5 }, P(8, 4)], 5); run(s, {}, 0.3); ok(s.onGround && !s.dead, 'Absinkende Plattform hält zuerst'); run(s, {}, 2.5); ok(s.dead === 'water', 'Absinkende Plattform bricht nach dem Betreten weg → Sturz'); }
// Bewegte Plattform trägt
{ const mv = { k: 'move', x: 6, y: 1, w: 3, ax: 2, ay: 0, period: 4, phase: 0 }; const s = mk([P(0, 3), mv], 6.5); s.y = 1; run(s, {}, 0.05); const x0 = s.x; run(s, {}, 1); ok(s.onGround && Math.abs((s.x - x0) - (movePos(mv, 1.05).x - movePos(mv, 0.05).x)) < 0.15, 'Bewegte Plattform nimmt den Spieler mit'); }
{ const mv = { k: 'move', x: 6, y: 1, w: 3, ax: 0, ay: 1, period: 4, phase: 0 }; const s = mk([mv], 7); s.y = 1; let on = 0, n = 0; run(s, p => { n++; if (p.onGround) on++; return {}; }, 4); ok(!s.dead && on / n > 0.9, `Vertikal bewegte Plattform: Spieler bleibt oben (${Math.round(100 * on / n)} % der Zeit auf der Plattform)`); }
// Pendel
{ const sw = { k: 'swing', px: 10, py: 6.2, len: 3.6, amp: 0.95, period: 3, phase: 0, r: 0.55 }; let hit = 0; for (let t = 0; t < 3; t += 0.1) { const s = mk([P(0, 40), sw]); s.x = 10; s.t = t; s.step({}); hit += s.hits; } ok(hit > 0 && hit < 30, `Pendel trifft nur zeitweise (${hit} von 30 Zeitpunkten)`); const b0 = swingBall(sw, 0), b1 = swingBall(sw, 0.75); ok(Math.abs(b0.x - 10) < 0.01 && b1.x > 12, 'Pendel schwingt um den Aufhängepunkt'); const s = mk([P(0, 40), sw]); s.x = 10; s.t = 0; s.step({}); ok(s.stun > 0 && s.vy > 0, 'Treffer: Spieler wird zurückgeworfen und kurz betäubt'); }
// Stangen
{ const O = [P(0, 4), { k: 'bars', x1: 5, x2: 11, y: 3.3 }, P(12, 4)]; const s = mk(O, 3.5); let st = 0; run(s, p => ({ r: 1, j: p.onGround && p.x > 3.7 && p.x < 4 ? 1 : 0, g: !p.onGround && p.x > 4.8 ? 1 : 0, r: p.x < 14 ? 1 : 0 }), 3.4); ok(!s.dead && s.onGround && s.x > 12, 'Stangen: Greifen, Hangeln, Landen auf der anderen Seite'); }
{ const O = [P(0, 4), { k: 'bars', x1: 5, x2: 11, y: 3.3 }, P(12, 4)]; const s = mk(O, 3.5); run(s, p => ({ r: 1, j: p.onGround && p.x > 3.7 && p.x < 4 ? 1 : 0 }), 4); ok(s.dead === 'water', 'Ohne Greifen fällt man in die Lücke'); }
{ const O = [P(0, 4), { k: 'bars', x1: 5, x2: 11, y: 3.3 }, P(12, 4)]; const s = mk(O, 3.5); let hung = false; run(s, p => { hung = hung || !!p.hang; return { r: 1, j: p.onGround && p.x > 3.7 && p.x < 4 ? 1 : 0, g: !p.onGround && p.x > 4.8 && p.t < 1.6 ? 1 : 0 }; }, 4); ok(hung && s.dead === 'water', 'Loslassen der Greifen-Taste lässt fallen'); }
// Wand
{ const O = [P(0, 20), { k: 'wall', x: 14, y: 1, h: 4.2, w: 0.6 }, { k: 'plat', x: 14, y: 5.2, w: 4 }, { k: 'finish', x: 15.6, y: 5.2 }]; const fast = mk(O, 2); run(fast, p => ({ r: 1, j: p.x > 11.8 && p.onGround && p.vx >= WALLRUN_MIN ? 1 : 0 }), 6); ok(fast.finished, 'Wand: mit Tempo anlaufen + springen → Wandlauf bis ins Ziel'); const early = mk(O, 2); run(early, p => ({ r: p.x < 12.9 ? 1 : 0, j: p.x > 8 && p.x < 8.4 && p.onGround ? 1 : 0 }), 3); ok(!early.finished && !early.dead && early.y < 3, 'Wand: zu früh abgesprungen → normaler Sprung, kein Wandlauf'); const stand = mk(O, 12.6); run(stand, p => ({ j: 1 }), 2); ok(!stand.finished && stand.y < 3, 'Wand: aus dem Stand hochkommen geht nicht'); }
// Ziel
{ const O = [P(0, 20), { k: 'finish', x: 10, y: 1 }]; const s = mk(O); run(s, { r: 1 }, 5); ok(s.finished && s.t > 1 && s.t < 3, 'Ziel: Buzzer beim Erreichen der Ziellinie'); }
// Wertung
ok(JSON.stringify(rank([{ finished: true, time: 40, dist: 100 }, { finished: false, dist: 60 }, { finished: true, time: 35, dist: 100 }, { finished: false, dist: 80 }])) === '[2,0,3,1]', 'Rangliste: erst Zieleinläufer nach Zeit, dann Sturz nach Strecke');
ok(JSON.stringify(rank([{ finished: true, time: 40 }, { finished: true, time: 40 }])) === '[0,1]' && pointsFor(0, 4) === 4 && pointsFor(3, 4) === 1, 'Gleiche Zeit: Reihenfolge bleibt; Punkte 4–1');
ok(fmtTime(65.432) === '1:05.43' && fmtTime(9.5) === '0:09.50', 'Zeitformat m:ss.cc');
// Parcours
for (const c of COURSES) {
  const plats = c.o.filter(o => o.k === 'plat'); let maxGap = 0; for (let i = 1; i < plats.length; i++) { const g = plats[i].x - (plats[i - 1].x + plats[i - 1].w); if (g > 0 && plats[i].x < c.wallX) maxGap = Math.max(maxGap, g); }
  ok(c.finish && c.length > 80 && c.o[0].x === 0, `Parcours „${c.name}": Länge ${c.length.toFixed(0)} m, ${c.o.length} Elemente`);
  const r = runBot(c, { maxT: 120 }); ok(r.finished && r.time > 15 && r.time < 60, `„${c.name}" ist machbar: Planer-Bot im Ziel nach ${r.time.toFixed(1)} s (Treffer: ${r.hits})`);
  const r2 = runBot(c, { maxT: 120 }); ok(r2.finished && Math.abs(r2.time - r.time) < 1e-9, `„${c.name}": Simulation ist deterministisch`);
}
ok(COURSES.length === 3 && COURSES[0].length < COURSES[1].length && COURSES[1].length < COURSES[2].length, 'Drei Parcours mit steigender Länge');
console.log(fails ? `\n${fails} Fehler` : '\nAlle Parcours-Tests bestanden'); process.exit(fails ? 1 : 0);
