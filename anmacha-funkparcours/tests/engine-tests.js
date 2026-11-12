/* Titanparcours – Tests für Physik, Hindernisse, Parcours (machbar? – ein Planer-Bot läuft alle Strecken) und Wertung (node tests/engine-tests.js) */
import { Sim, COURSES, JUMP_V, G, RUN, PW, PH, PH_DUCK, CRAWL, DT, movePos, swingBall, ropeAt, rungY, rank, pointsFor, fmtTime, WALLRUN_MIN, LADDER_HOP } from '../engine.js';
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
{ const O = [P(0, 4), { k: 'bars', x1: 5, x2: 11, y: 3.3 }, P(12, 4)]; const s = mk(O, 3.5); let hung = false; run(s, p => { hung = hung || !!p.hang; return { r: p.x < 14 ? 1 : 0, j: p.onGround && p.x > 3.7 && p.x < 4 ? 1 : 0 }; }, 4); ok(hung && !s.dead && s.onGround && s.x > 12, 'Stangen ohne Greifen-Taste: automatisch greifen, am Ende abschwingen und landen'); }
{ const O = [P(0, 4), { k: 'bars', x1: 5, x2: 11, y: 3.3 }, P(12, 4)]; const s = mk(O, 3.5); let hung = false; run(s, p => { hung = hung || !!p.hang; return { r: hung ? 0 : 1, l: hung ? 1 : 0, j: p.onGround && p.x > 3.7 && p.x < 4 ? 1 : 0 }; }, 4); ok(hung && s.dead === 'water', 'Zurückhangeln über den Anfang hinaus lässt los → Sturz'); }
{ const s = mk([P(0, 6), P(9.6, 4, 1.5)]); run(s, st => ({ r: st.x < 11 ? 1 : 0, j: st.x > 5.75 && st.x < 9 ? 1 : 0 }), 2.5); ok(!s.dead && s.onGround && s.x > 9.3, 'Kantenhilfe: knapp zu kurzer Sprung auf eine höhere Plattform wird noch hochgezogen'); }
// Wand
{ const O = [P(0, 20), { k: 'wall', x: 14, y: 1, h: 4.2, w: 0.6 }, { k: 'plat', x: 14, y: 5.2, w: 4 }, { k: 'finish', x: 15.6, y: 5.2 }]; const fast = mk(O, 2); run(fast, p => ({ r: 1, j: p.x > 11.8 && p.onGround && p.vx >= WALLRUN_MIN ? 1 : 0 }), 6); ok(fast.finished, 'Wand: mit Tempo anlaufen + springen → Wandlauf bis ins Ziel'); const early = mk(O, 2); run(early, p => ({ r: p.x < 12.9 ? 1 : 0, j: p.x > 8 && p.x < 8.4 && p.onGround ? 1 : 0 }), 3); ok(!early.finished && !early.dead && early.y < 3, 'Wand: zu früh abgesprungen → normaler Sprung, kein Wandlauf'); const stand = mk(O, 12.6); run(stand, p => ({ j: 1 }), 2); ok(!stand.finished && stand.y < 3, 'Wand: aus dem Stand hochkommen geht nicht'); }
// Drehwalze, Trampolin, Seilschwung, Sandsack, drei Versuche an der Steilwand
{ const s = mk([{ k: 'roll', x: 0, w: 6, y: 1, r: 0.8, v: -1.5 }], 4); run(s, {}, 1); ok(s.onGround && Math.abs(s.x - 2.5) < 0.1, `Drehwalze schiebt den stehenden Läufer zurück (${(4 - s.x).toFixed(2)} m in 1 s)`); }
// Drehwalzen in allen Runden: normal weiterlaufen klappt immer (Sprung vor der ersten und von der letzten Walze, beliebig lang gedrückt)
for (const c of COURSES) { const sec = c.secs.find(q => q.n === 'Drehwalzen'), rolls = c.o.filter(o => o.k === 'roll'), end = rolls[rolls.length - 1].x + rolls[rolls.length - 1].w + 2;
  let bad = 0, tot = 0; for (let d = 0.1; d <= 0.8; d += 0.1) for (const N of [3, 6, 10, 16, 30]) { tot++; const s = new Sim(c); s.x = sec.x - 1.5; s.y = c.o.find(o => o.k !== 'roll' && o.x <= sec.x - 1.5 && o.x + (o.w || 0) >= sec.x - 1.5).y; let hold = 0;
    for (let i = 0; i < 600 && !s.dead && s.x < end; i++) { let j = 0; if (hold > 0) { j = 1; hold--; } else if (s.onGround && s.ground && (c.o[s.ground.i].k !== 'roll' || c.o[s.ground.i] === rolls[rolls.length - 1]) && s.ground.x1 - s.x < d) { hold = N - 1; j = 1; } s.step({ r: 1, j }); }
    if (s.dead || s.x < end) bad++; }
  ok(bad === 0, `„${c.name}": Drehwalzen laufend schaffbar (${tot - bad}/${tot} Varianten)`); }
{ const s = mk([P(0, 3), { k: 'tramp', x: 4, y: 0.7, w: 2.4, bounce: 12.5 }, P(7, 3)], 1); let top = 0; run(s, p => { top = Math.max(top, p.y); return { r: p.x < 4.8 ? 1 : 0, j: p.onGround && p.x > 2.4 && p.x < 3.2 ? 1 : 0 }; }, 2.5); ok(s.bounces >= 1 && top > 3.4, `Trampolin federt ohne Sprungtaste hoch (${top.toFixed(2)} m)`); }
{ let miss = 0; for (let h = 0.3; h < 0.9; h += 0.004) { const s = mk([{ k: 'tramp', x: 0, y: 0.7, w: 4, bounce: 12.5 }], 2); s.y = 0.7 + h; s.vy = 0; s.onGround = false; run(s, p => p.bounces ? (p.dead = 'ok', {}) : {}, 1); if (!s.bounces) miss++; } ok(miss === 0, `Trampolin federt bei jeder Landehöhe (${miss} Aussetzer)`); }
{ const rp = { k: 'rope', px: 8.5, py: 7, len: 3.9, amp: 0.6, period: 2.6, phase: -3.5 }, O = [P(0, 6), rp, P(11, 4)]; const s = mk(O, 3); let grabbed = false;
  run(s, p => { grabbed = grabbed || !!p.rope; return { r: p.x < 12 ? 1 : 0, j: p.x > 11 && p.onGround ? 0 : p.rope ? (p.rope.a > 0.2 && p.rope.da > 0 ? 1 : 0) : p.onGround && p.x > 5.4 ? 1 : !p.onGround && p.vy > 0.5 ? 1 : 0 }; }, 5);
  ok(grabbed && !s.dead && s.onGround && s.x > 11, 'Seilschwung: Läufer greift das Seil, schwingt mit und springt auf die nächste Plattform');
  const s2 = mk(O, 3); run(s2, p => ({ r: 1, j: p.onGround && p.x > 5.4 ? 1 : !p.onGround && !p.rope && p.vy > 0.5 ? 1 : 0 }), 5); ok(!!s2.rope && !s2.dead, 'Ohne Sprung bleibt der Läufer am Seil hängen');
  const q = Object.assign({}, rp, { phase: 0 }), r0 = ropeAt(q, 0), r1 = ropeAt(q, 0.65); ok(Math.abs(r0.a) < 1e-9 && Math.abs(r1.a - 0.6) < 0.01, 'Seil schwingt mit fester Weite und Dauer'); }
{ const sw = { k: 'swing', px: 10, py: 6.2, len: 3.6, amp: 0.95, period: 3, phase: 0, r: 0.42, h: 1.1 }; const s = mk([P(0, 40), sw], 10); s.step({}); ok(s.hits === 1 && s.stun > 0, 'Sandsack trifft einen Läufer darunter'); }
{ const O = [P(0, 20), { k: 'wall', x: 14, y: 1, h: 4.25, w: 0.6 }, { k: 'plat', x: 14, y: 5.25, w: 4 }, { k: 'finish', x: 15.6, y: 5.25 }]; const s = mk(O, 13.2); let tries = [];
  run(s, p => { if (tries[tries.length - 1] !== p.wallTries) tries.push(p.wallTries); return { r: 1, j: p.onGround && p.vx < 3 ? 1 : 0 }; }, 8);
  ok(s.dead === 'wall' && s.wallTries === 3 && tries.join() === '0,1,2,3', `Steilwand: nach drei Fehlversuchen ist der Lauf vorbei (${tries.join(' → ')})`); }

// ---------------------------------------------------------------- Ducken, Rutschen, neue Hindernisse
{ const s = mk([P(0, 40)]); run(s, { r: 1 }, 1); run(s, { r: 1, d: 1 }, 0.05); ok(s.duck && s.slide && s.h === PH_DUCK, 'Ducken aus dem Lauf = Rutschen (Körper nur ' + PH_DUCK + ' m hoch)'); run(s, { r: 1, d: 1 }, 1.5); ok(s.duck && !s.slide && Math.abs(s.vx - CRAWL) < 0.01, 'Nach der Rutsche geduckt weiter mit ' + CRAWL + ' m/s'); run(s, { r: 1 }, 0.1); ok(!s.duck && s.h === PH, 'Loslassen: Läufer richtet sich auf'); }
{ const s = mk([P(0, 40)]); run(s, { d: 1 }, 0.2); ok(s.duck && !s.slide && s.vx === 0, 'Ducken im Stand: kein Rutschen'); run(s, { d: 1, j: 1 }, 0.3); ok(s.y > 1.3, 'Aus dem Ducken springen geht (mit Platz darüber)'); }
{ const gate = { k: 'gate', x: 6, w: 1.3, y: 1, gap: 1.15, h: 3.6 }, O = [P(0, 20), gate];
  const a = mk(O); run(a, { r: 1 }, 2.5); ok(a.x < 6 && !a.dead, 'Rutschtunnel: aufrecht kommt man nicht unter dem Tor durch');
  const b = mk(O); run(b, p => ({ r: 1, d: p.x > 3.5 ? 1 : 0 }), 2.5); ok(b.x > 8, 'Rutschtunnel: aus dem Lauf durchrutschen klappt');
  const c = mk(O, 4.5); run(c, p => ({ r: p.x < 6.6 ? 1 : 0, d: p.x < 6.6 ? 1 : 0 }), 3); ok(c.duck && c.x > 6 && c.x < 7.3, 'Unter dem Tor kann man nicht aufstehen (bleibt geduckt)');
  const d = mk(O, 6.6); d.duck = true; run(d, { j: 1, d: 1 }, 0.3); run(d, { j: 1 }, 0.4); ok(d.y + d.h <= 1 + 1.15 + 0.01, 'Kein Sprung durchs Tor nach oben (Kopfstoß)'); }
{ const lg = { k: 'log', px: 10, py: 1 + 1.36 + 3.2, len: 3.2, amp: 1.0, period: 2.8, phase: 0 };
  let hitStand = 0, hitDuck = 0; for (let t = 0; t < 2.8; t += 0.1) { const s = mk([P(0, 20), lg], 10); s.t = t; s.step({}); hitStand += s.hits; const q = mk([P(0, 20), lg], 10); q.t = t; q.duck = true; q.step({ d: 1 }); hitDuck += q.hits; }
  ok(hitStand > 0 && hitStand < 28, `Pendelbalken trifft aufrecht nur zeitweise (${hitStand} von 28 Zeitpunkten)`); ok(hitDuck === 0, 'Pendelbalken: geduckt immer sicher darunter');
  const s = mk([P(0, 20), lg], 10); s.step({}); ok(s.hits === 1 && s.stun > 0 && Math.abs(s.vx) > 4, 'Pendelbalken-Treffer wirft den Läufer weg'); }
{ const O = [P(0, 4), { k: 'bars', ledge: true, x1: 5, x2: 7.4, y: 3.4 }, { k: 'bars', ledge: true, x1: 8.4, x2: 10.6, y: 3.4 }, P(11.5, 4)];
  const a = mk(O, 3.4); run(a, p => ({ r: 1, j: p.onGround && p.x > 3.6 ? 1 : 0 }), 4); ok(a.hang && Math.abs(a.x - 7.35) < 0.02 && !a.dead, 'Klippenhänger: am Leistenende festhalten (ohne Sprung kein Absturz)');
  run(a, { r: 1, j: 1 }, 0.6); ok(a.hang && a.c.o[a.hang.bar].x1 === 8.4, 'Klippenhänger: Hechtsprung zur nächsten Leiste'); run(a, { r: 1 }, 1.5); run(a, p => ({ r: p.x < 13 ? 1 : 0, j: 1 }), 1.2); ok(!a.dead && a.onGround && a.x > 11.5, 'Klippenhänger: von der letzten Leiste auf die Plattform'); }
{ const lo = { k: 'ladder', x: 5, y0: 1 + 2.8, n: 5, gap: 0.55 }, O = [P(0, 3.5), lo, P(5.75, 3, rungY(lo, 4) - 0.9)];
  const climb = early => { const s = mk(O, 3.0); let k = 0, last = -9; run(s, p => { if (!p.ladder) return p.y > 4 ? {} : { r: p.y < 3 && p.x < 4.6, j: (p.onGround && p.x > 3.0) || (!p.onGround && p.vy > 0) ? 1 : 0 }; k++; const gapT = early ? 0.12 : LADDER_HOP + 0.02; if (p.t - last >= gapT) { last = p.t; return { j: 1 }; } return { j: 0 }; }, 6); return s; };
  const a = climb(false); ok(a.onGround && Math.abs(a.y - (rungY(lo, 4) - 0.9)) < 0.01 && !a.dead, 'Lachsleiter: im Takt drücken = Sprosse für Sprosse hoch und oben auf die Plattform');
  const b = climb(true); ok(b.dead === 'water', 'Lachsleiter: zu hastig gedrückt = abrutschen und ins Wasser'); }
{ let bad = 0; for (let t = 0; t < 2.2; t += 0.275) { const c = COURSES[1], sec = c.secs.find(q => q.n === 'Ringschwung'), nx = c.secs[c.secs.indexOf(sec) + 1].x; const r = runBot(c, { startX: sec.x - 1.2, t0: t, untilX: nx, maxT: t + 25 }); if (!r.passed) bad++; } ok(bad === 0, `Ringschwung: von Ring zu Ring für jeden Startzeitpunkt (${bad} Fehlversuche)`); }
// Jedes Hindernis jedes Parcours einzeln: der Planer-Bot schafft es aus jedem Startzeitpunkt (verschiedene Phasen der beweglichen Teile)
for (const c of COURSES) { const fails2 = []; let n = 0;
  const onPlat = x => c.o.some(o => o.k === 'plat' && o.x <= x && o.x + o.w >= x);
  c.secs.forEach((sec, k) => { const nx = k + 1 < c.secs.length ? c.secs[k + 1].x : Infinity; let j = k; while (j > 0 && !onPlat(c.secs[j].x - 1.2)) j--;   // Start auf fester Plattform davor
    for (const t0 of [0, 0.9, 1.7]) { n++; const r = runBot(c, { startX: c.secs[j].x - 1.2, t0, untilX: nx, maxT: t0 + 40 }); if (!r.passed) fails2.push(`${sec.n}@${t0}`); } });
  ok(!fails2.length, `„${c.name}": jedes Hindernis einzeln schaffbar (${n - fails2.length}/${n}${fails2.length ? ': ' + fails2.join(', ') : ''})`); }
// Kollisionen: zufällige Eingaben auf allen Strecken – der Läufer steckt nie in einer festen Fläche
{ let seed = 7, viol = 0, steps = 0; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const c of COURSES) for (let k = 0; k < 120; k++) { const s = new Sim(c), x = 1 + rnd() * (c.length - 10), p = c.o.find(o => o.k === 'plat' && o.x <= x && o.x + o.w >= x); if (!p) continue; s.x = x; s.y = p.y; s.t = rnd() * 5; s.collect(); let inp = {};
    for (let i = 0; i < 500 && !s.dead && !s.finished; i++) { if (i % 8 === 0) inp = { l: rnd() < 0.15, r: rnd() < 0.75, j: rnd() < 0.35, d: rnd() < 0.2 }; s.step(inp); steps++; if (s.wall) continue;
      for (const q of s.solids) if (Math.min(s.x + PW / 2, q.x1) - Math.max(s.x - PW / 2, q.x0) > 0.04 && Math.min(s.y + s.h, q.top) - Math.max(s.y, q.bot) > 0.04) viol++; } }
  ok(viol === 0, `Kollisionen: ${steps} Zufallsschritte ohne Stecken in Plattform, Wand oder Tor (${viol} Verstöße)`); }
// Ziel
{ const O = [P(0, 20), { k: 'finish', x: 10, y: 1 }]; const s = mk(O); run(s, { r: 1 }, 5); ok(s.finished && s.t > 1 && s.t < 3, 'Ziel: Buzzer beim Erreichen der Ziellinie'); }
// Wertung
ok(JSON.stringify(rank([{ finished: true, time: 40, dist: 100 }, { finished: false, dist: 60 }, { finished: true, time: 35, dist: 100 }, { finished: false, dist: 80 }])) === '[2,0,3,1]', 'Rangliste: erst Zieleinläufer nach Zeit, dann Sturz nach Strecke');
ok(JSON.stringify(rank([{ finished: true, time: 40 }, { finished: true, time: 40 }])) === '[0,1]' && pointsFor(0, 4) === 4 && pointsFor(3, 4) === 1, 'Gleiche Zeit: Reihenfolge bleibt; Punkte 4–1');
ok(fmtTime(65.432) === '1:05.43' && fmtTime(9.5) === '0:09.50', 'Zeitformat m:ss.cc');
// Parcours
for (const c of COURSES) {
  const plats = c.o.filter(o => o.k === 'plat'); let maxGap = 0; for (let i = 1; i < plats.length; i++) { const g = plats[i].x - (plats[i - 1].x + plats[i - 1].w); if (g > 0 && plats[i].x < c.wallX) maxGap = Math.max(maxGap, g); }
  const obst = c.secs.length; ok(c.finish && c.length > 100 && c.o[0].x === 0 && obst >= 8, `Parcours „${c.name}": Länge ${c.length.toFixed(0)} m, ${obst} Hindernisse`);
  const r = runBot(c, { maxT: 150 }); ok(r.finished && r.time > 20 && r.time < 60, `„${c.name}" ist machbar: Planer-Bot im Ziel nach ${r.time.toFixed(1)} s (Treffer: ${r.hits})`);
  const r2 = runBot(c, { maxT: 150 }); ok(r2.finished && Math.abs(r2.time - r.time) < 1e-9, `„${c.name}": Simulation ist deterministisch`);
}
ok(COURSES.length === 3 && COURSES[0].length < COURSES[1].length && COURSES[1].length < COURSES[2].length, 'Drei Parcours mit steigender Länge');
console.log(fails ? `\n${fails} Fehler` : '\nAlle Parcours-Tests bestanden'); process.exit(fails ? 1 : 0);
