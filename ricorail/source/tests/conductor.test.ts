// Schaffner-Modus: Sitzplätze, Fahrgäste mit Fahrkarten, Kontrolle, Ein-/Ausstieg; Zug fährt dabei selbst.
import { it, expect } from 'vitest';
import { Conductor, seatLayout, walkRange, type CarInfo } from '../src/modes/conductor';
import { routeNet } from '../src/data/routes';
import { Session, type Scenario } from '../src/modes/session';
import { LINES, nextDeparture } from '../src/data/services';
import { Network } from '../src/railway/network';

const car = (idx: number, first = false, cab = false): CarInfo => ({ idx, len: 26.4, cab, first, seats: seatLayout(26.4, cab) });
const stops = ['A', 'B', 'C', 'D', 'E'].map((name) => ({ name, pass: false }));

it('Sitzreihen liegen im Gangbereich, Führerstand bleibt frei', () => {
  for (const cab of [false, true]) {
    const [a, b] = walkRange(26.4, cab);
    const seats = seatLayout(26.4, cab);
    expect(seats.length).toBeGreaterThanOrEqual(40);
    for (const s of seats) { expect(s.x).toBeGreaterThan(a - 0.5); expect(s.x).toBeLessThan(b + 0.5); }
  }
});

it('Kontrolle: richtige Entscheidungen bringen Punkte, falsche kosten Punkte', () => {
  const c = new Conductor([car(1, true), car(2)], stops, new Date(2026, 9, 17), 42);
  c.fill(1, 0.5);
  expect(c.riders.length).toBeGreaterThan(20);
  // jede Fahrkarte ist entweder in Ordnung oder hat einen genannten Grund
  for (const r of c.riders) {
    if (r.ok) { expect(r.ticket).not.toBeNull(); expect(r.ticket!.date).toBe('17.10.2026'); if (r.car === 1) expect(r.ticket!.cls).toBe(1); }
    else expect(r.why.length).toBeGreaterThan(5);
    expect(r.off).toBeGreaterThan(1);
  }
  expect(c.riders.some((r) => !r.ok)).toBe(true);
  let pts = 0;
  for (const r of c.riders.slice(0, 10)) pts += c.judge(r, r.ok).pts;
  expect(c.stats.right).toBe(10);
  expect(c.stats.pts).toBe(pts);
  const bad = c.riders.find((r) => !r.checked)!;
  const v = c.judge(bad, !bad.ok);
  expect(v.correct).toBe(false);
  expect(v.pts).toBeLessThan(0);
  expect(c.judge(bad, bad.ok).pts).toBe(0); // zweimal zählt nicht
});

it('Fahrgast in Reichweite und Ein-/Ausstieg am Halt', () => {
  const c = new Conductor([car(0)], stops, new Date(2026, 9, 17), 7);
  c.fill(0, 0.6);
  const r = c.riders[0], s = c.cars[0].seats[r.seat];
  expect(c.near(0, s.x)?.car).toBe(0);
  expect(c.near(0, 99)).toBeNull();
  const v0 = c.version;
  c.arrive(2, 0.6);
  expect(c.version).toBeGreaterThan(v0);
  expect(c.riders.every((x) => x.off > 2)).toBe(true);
  c.arrive(2, 0.6); // gleicher Halt: nichts passiert
  expect(c.riders.every((x) => x.off > 2)).toBe(true);
});

it('Schaffner-Modus: Spielerzug fährt selbst bis zum nächsten Halt und bleibt im Spiel', async () => {
  const def = routeNet('d1');
  const L = LINES.d1.find((l) => l.id === 'd1-re')!;
  const dep = nextDeparture(new Network(structuredClone(def)), L, false, 8 * 3600).stops[0].dep!;
  const sc = { id: 'svc', cat: 'pax', title: 't', route: 'd1', desc: '', time: 0, weather: { kind: 'clear', season: 'summer', wind: 0 }, difficulty: 1, traffic: 1, player: { kind: 'none' }, goals: [{ t: 'nospad' }], xp: 40 } as unknown as Scenario;
  const s = new Session({ def, routeId: 'd1', time: dep - 60, weather: sc.weather, assist: 'easy', traffic: 1, player: { kind: 'service', line: 'd1-re', back: false, dep }, scenario: sc });
  await s.prerun(5);
  const p = s.spawnPlayer()!, w = s.world, plan = w.plans.get(p.id)!;
  p.ai = true;
  let opened = false;
  for (let i = 0; i < 50 * 60 * 20 && plan.arrived.length < 3; i++) { s.update(0.02); if (plan.arrived.length >= 2 && p.doorsOpen) opened = true; }
  expect(plan.arrived.length).toBeGreaterThanOrEqual(2);
  expect(opened).toBe(true);
  expect(w.score.spad).toBe(0);
  expect(w.trains.has(p.id)).toBe(true);
}, 120000);
