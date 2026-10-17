// Bahnhofshalt mit Haltassistent: Spieler fährt Vollgas, der Assistent hält am Bahnsteig, der Halt wird gezählt und bewertet.
import { it, expect } from 'vitest';
import { routeNet } from '../src/data/routes';
import { Session, type Scenario } from '../src/modes/session';
import { LINES, nextDeparture } from '../src/data/services';
import { Network } from '../src/railway/network';

it('Haltassistent: Vollgas-Fahrt hält am ersten Bahnsteig und bekommt Haltepunkte', async () => {
  const def = routeNet('d1');
  const L = LINES.d1.find((l) => l.id === 'd1-re')!;
  const dep = nextDeparture(new Network(structuredClone(def)), L, false, 8 * 3600).stops[0].dep!;
  const sc = { id: 'svc', cat: 'pax', title: 't', route: 'd1', desc: '', time: 0, weather: { kind: 'clear', season: 'summer', wind: 0 }, difficulty: 1, traffic: 1, player: { kind: 'none' }, goals: [{ t: 'nospad' }], xp: 40 } as unknown as Scenario;
  const s = new Session({ def, routeId: 'd1', time: dep - 60, weather: sc.weather, assist: 'easy', traffic: 1, player: { kind: 'service', line: 'd1-re', back: false, dep }, scenario: sc });
  await s.prerun(5);
  const p = s.spawnPlayer()!, w = s.world, plan = w.plans.get(p.id)!;
  for (let i = 0; i < 50 * 60 * 20 && plan.arrived.length < 2; i++) {
    const c = p.ctl; c.reverser = 1; c.panto = true; c.mainSwitch = true; c.parking = false;
    const go = plan.state === 'run' && w.time >= dep;
    c.throttle = go ? 1 : 0; c.brake = go ? 0 : 1;
    if (go) c.openL = c.openR = c.releaseL = c.releaseR = false;
    s.update(0.02);
  }
  expect(plan.arrived.length).toBe(2);
  expect(w.score.spad).toBe(0);
  expect(s.stopCount).toBe(1);
  expect(s.stopErrors[0]).toBeLessThan(10);
  expect(s.stopPts).toBeGreaterThan(0);
}, 120000);

it('Bremsassistent: Vollgas vor der Abfahrt überfährt das rote Ausfahrsignal nicht', async () => {
  const def = routeNet('d1');
  const L = LINES.d1.find((l) => l.id === 'd1-re')!;
  const dep = nextDeparture(new Network(structuredClone(def)), L, false, 8 * 3600).stops[0].dep!;
  const sc = { id: 'svc', cat: 'pax', title: 't', route: 'd1', desc: '', time: 0, weather: { kind: 'clear', season: 'summer', wind: 0 }, difficulty: 1, traffic: 1, player: { kind: 'none' }, goals: [{ t: 'nospad' }], xp: 40 } as unknown as Scenario;
  const s = new Session({ def, routeId: 'd1', time: dep - 120, weather: sc.weather, assist: 'easy', traffic: 1, player: { kind: 'service', line: 'd1-re', back: false, dep }, scenario: sc });
  await s.prerun(5);
  const p = s.spawnPlayer()!, w = s.world;
  for (let i = 0; i < 50 * 100; i++) { // 100 s vor der Abfahrt mit Vollgas
    const c = p.ctl; c.reverser = 1; c.panto = true; c.mainSwitch = true; c.parking = false; c.throttle = 1; c.brake = 0;
    c.openL = c.openR = c.releaseL = c.releaseR = false;
    s.update(0.02);
  }
  expect(w.score.spad).toBe(0);
  expect(p.forcedBrake).toBeNull();
}, 120000);
