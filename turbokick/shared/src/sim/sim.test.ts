import { describe, expect, it } from 'vitest';
import { Rng } from '../rng';
import { arenaDistance } from './arena';
import { ARENA, BALL_RADIUS, type CarInput, type SimEvent } from './types';
import { Sim, createSimState } from './sim';
import { FACE_X, makeSim, run, skipCountdown, speed } from './testkit';

/*
 * Abgestimmte Werte (Headless-Messung, siehe CAR_TUNING / BALL_TUNING):
 *  - Auto 0 → ~13,2 m/s nach 1,5 s (Ziel 12–15), Supersonic mit Boost nach ~1,2 s (Ziel < 3 s)
 *  - Sprung mit Halten ~2,5 m, Doppelsprung ~4,7 m, Dodge ~+5 m/s horizontal
 *  - Ball aus 10 m: Scheitel 4,0 → 2,0 → 1,3 → 1,05 (Restitution 0,6)
 */

function randomInput(rng: Rng): Partial<CarInput> {
  return {
    throttle: rng.float(-1, 1),
    steer: rng.float(-1, 1),
    pitch: rng.float(-1, 1),
    yaw: rng.float(-1, 1),
    roll: rng.float(-1, 1),
    jump: rng.chance(0.08),
    boost: rng.chance(0.5),
    handbrake: rng.chance(0.1),
  };
}

describe('Auto: Fahrmodell', () => {
  it('beschleunigt in 1,5 s auf 12–15 m/s', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [0, 0.19, -20] });
    run(sim, 90, { throttle: 1 });
    const v = speed(sim.state.cars[0]!.vel);
    expect(v).toBeGreaterThan(12);
    expect(v).toBeLessThan(15);
  });

  it('erreicht mit Boost Supersonic in < 3 s und verbraucht Nitro', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [0, 0.19, -45], boost: 100 });
    const c = sim.state.cars[0]!;
    let t = -1;
    for (let i = 0; i < 180 && t < 0; i++) {
      sim.step([{ throttle: 1, boost: true }]);
      if (c.supersonic) t = i / 60;
    }
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThan(3);
    expect(c.boost).toBeLessThan(100);
  });

  it('Boost ohne Nitro (0) gibt keinen Schub', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [0, 0.19, -20], boost: 0 });
    run(sim, 180, { throttle: 1, boost: true });
    expect(speed(sim.state.cars[0]!.vel)).toBeLessThan(14.5);
  });

  it('bleibt beim Geradeausfahren am Boden (y stabil)', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [0, 0.19, -40] });
    const c = sim.state.cars[0]!;
    let minY = 9;
    let maxY = 0;
    for (let i = 0; i < 300; i++) {
      sim.step([{ throttle: 1 }]);
      if (i > 30) {
        minY = Math.min(minY, c.pos[1]);
        maxY = Math.max(maxY, c.pos[1]);
      }
      if (c.pos[2] > 40) break;
    }
    expect(minY).toBeGreaterThan(0.17);
    expect(maxY).toBeLessThan(0.2);
    expect(c.wheelsOnSurface).toBe(4);
  });

  it('Lenkung erzeugt eine Kurve mit sinnvollem Radius (rechts = −x bei Blick +z)', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [0, 0.19, 0] });
    const c = sim.state.cars[0]!;
    run(sim, 60, { throttle: 1 });
    // Winkelgeschwindigkeit der Fahrtrichtung messen
    const h0 = Math.atan2(c.vel[0], c.vel[2]);
    const v = speed(c.vel);
    run(sim, 30, { throttle: 1, steer: 1 });
    let dh = Math.atan2(c.vel[0], c.vel[2]) - h0;
    while (dh > Math.PI) dh -= 2 * Math.PI;
    while (dh < -Math.PI) dh += 2 * Math.PI;
    const rate = Math.abs(dh) / 0.5;
    const radius = v / rate;
    expect(radius).toBeGreaterThan(4);
    expect(radius).toBeLessThan(25);
    expect(dh).toBeLessThan(0); // nach rechts (−x)
    expect(c.pos[0]).toBeLessThan(-0.5);
  });

  it('Wandfahren: mit 15 m/s auf die Seitenwand zu → fährt hoch und bleibt eine Weile an der Wand', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [10, 0.19, 0], quat: FACE_X, vel: [15, 0, 0] });
    const c = sim.state.cars[0]!;
    let maxY = 0;
    let onWall = 0;
    for (let i = 0; i < 480; i++) {
      sim.step([{ throttle: 1 }]);
      maxY = Math.max(maxY, c.pos[1]);
      if (c.pos[1] > 7 && c.wheelsOnSurface >= 3) onWall++;
    }
    expect(maxY).toBeGreaterThan(7);
    expect(onWall).toBeGreaterThan(20); // > 0,3 s mit Rädern an der Wand
  });
});

describe('Auto: Sprung, Doppelsprung, Dodge', () => {
  function jumpApex(script: (i: number) => Partial<CarInput>, ticks = 150): number {
    const sim = makeSim();
    sim.setCar(0, { pos: [0, 0.19, -20] });
    const c = sim.state.cars[0]!;
    let maxY = 0;
    for (let i = 0; i < ticks; i++) {
      sim.step([script(i)]);
      maxY = Math.max(maxY, c.pos[1]);
    }
    return maxY - 0.18;
  }

  it('Sprung mit Halten erreicht 2–3,2 m, Antippen deutlich weniger', () => {
    const held = jumpApex((i) => ({ jump: i < 15 }));
    const tap = jumpApex((i) => ({ jump: i < 2 }));
    expect(held).toBeGreaterThan(2);
    expect(held).toBeLessThan(3.2);
    expect(tap).toBeLessThan(held - 1);
  });

  it('Doppelsprung ist höher als der einfache Sprung', () => {
    const single = jumpApex((i) => ({ jump: i < 15 }));
    const dbl = jumpApex((i) => ({ jump: i < 15 || (i >= 25 && i < 30) }));
    expect(dbl).toBeGreaterThan(single + 1);
  });

  it('Dodge (zweiter Sprung mit Gas) gibt Horizontalimpuls und Flip', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [0, 0.19, -20] });
    const c = sim.state.cars[0]!;
    const events: SimEvent[] = [];
    let vBefore = 0;
    for (let i = 0; i < 40; i++) {
      if (i === 24) vBefore = c.vel[2];
      events.push(...sim.step([{ jump: i < 5 || (i >= 25 && i < 30), throttle: i >= 24 ? 1 : 0 }]));
    }
    const kinds = events.filter((e) => e.t === 'jump').map((e) => (e as { kind: string }).kind);
    expect(kinds).toEqual(['jump', 'dodge']);
    expect(c.vel[2] - vBefore).toBeGreaterThan(4);
    expect(c.canDodge).toBe(false);
  });

  it('kein zweiter Dodge bis zur Landung', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [0, 0.19, -20] });
    const ev: SimEvent[] = [];
    for (let i = 0; i < 60; i++) {
      const press = i < 5 || (i >= 25 && i < 28) || (i >= 40 && i < 43);
      ev.push(...sim.step([{ jump: press, throttle: 1 }]));
    }
    expect(ev.filter((e) => e.t === 'jump' && e.kind === 'dodge').length).toBe(1);
  });

  it('landet nach dem Flip wieder auf den Rädern (Landung = am Boden)', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [0, 0.19, -20] });
    const c = sim.state.cars[0]!;
    for (let i = 0; i < 200; i++) sim.step([{ jump: i < 5 || (i >= 25 && i < 28), throttle: 1 }]);
    expect(c.wheelsOnSurface).toBeGreaterThanOrEqual(3);
    expect(c.pos[1]).toBeLessThan(0.3);
  });
});

describe('Ball', () => {
  it('fällt aus 10 m und springt mehrfach mit abnehmender Höhe', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [30, 0.19, 0] });
    sim.setBall([0, 10, 0]);
    let prevVy = 0;
    const apex: number[] = [];
    for (let i = 0; i < 600; i++) {
      sim.step([]);
      const vy = sim.state.ball.vel[1];
      if (prevVy > 0 && vy <= 0) apex.push(sim.state.ball.pos[1]);
      prevVy = vy;
    }
    expect(apex.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < apex.length; i++) expect(apex[i]).toBeLessThan(apex[i - 1]!);
    expect(apex[0]).toBeGreaterThan(3);
  });

  it('bleibt bei 10 000 zufälligen Schüssen im Innenraum (außer im Tor)', () => {
    const sim = makeSim();
    sim.setCar(0, { pos: [0, 0.19, -45] });
    const rng = new Rng(777);
    const d = { dist: 0, nx: 0, ny: 0, nz: 0 };
    let worst = 1e9;
    for (let n = 0; n < 10000; n++) {
      sim.setBall(
        [rng.float(-30, 30), rng.float(1, 18), rng.float(-40, 40)],
        [rng.float(-60, 60), rng.float(-40, 40), rng.float(-60, 60)],
        [rng.float(-6, 6), rng.float(-6, 6), rng.float(-6, 6)],
      );
      for (let i = 0; i < 30; i++) {
        sim.step([]);
        if (i % 5 === 4) {
          arenaDistance(sim.state.ball.pos, d);
          worst = Math.min(worst, d.dist);
        }
      }
      expect(Number.isFinite(sim.state.ball.pos[0])).toBe(true);
    }
    // Penetration höchstens wenige cm
    expect(worst).toBeGreaterThan(BALL_RADIUS - 0.1);
  });

  it('frontaler Treffer: Ball wird schneller als das Auto', () => {
    for (const v0 of [8, 14, 22]) {
      const sim = makeSim();
      sim.setCar(0, { pos: [0, 0.19, -15], vel: [0, 0, v0] });
      sim.setBall([0, BALL_RADIUS, -9]);
      const ev: SimEvent[] = [];
      for (let i = 0; i < 40; i++) ev.push(...sim.step([{ throttle: 1 }]));
      const b = sim.state.ball;
      expect(ev.some((e) => e.t === 'touch')).toBe(true);
      expect(speed(b.vel)).toBeGreaterThan(v0 * 1.3);
      expect(b.vel[2]).toBeGreaterThan(v0);
      expect(sim.state.lastTouch).toBe(0);
    }
  });
});

describe('Regeln', () => {
  it('Tor auf beiden Seiten', () => {
    for (const side of [1, -1]) {
      const sim = makeSim([0, 1], { training: false });
      sim.setBall([0, 2, 44 * side], [0, 0, 30 * side]);
      const ev: SimEvent[] = [];
      for (let i = 0; i < 60; i++) ev.push(...sim.step([]));
      const goals = ev.filter((e) => e.t === 'goal');
      expect(goals.length).toBe(1);
      const g = goals[0] as Extract<SimEvent, { t: 'goal' }>;
      expect(g.team).toBe(side === 1 ? 0 : 1);
      expect(g.scorer).toBe(-1); // niemand hat den Ball berührt
      expect(sim.state.score[g.team]).toBe(1);
      expect(sim.state.phase).toBe('goal');
      // Ball bleibt im Tor
      for (let i = 0; i < 100; i++) sim.step([]);
      expect(Math.abs(sim.state.ball.pos[2])).toBeGreaterThan(ARENA.halfLength - 0.01);
    }
  });

  it('Eigentor zählt für den Gegner; Torschütze und Vorlage', () => {
    const sim = makeSim([0, 0, 1], { training: false });
    const s = sim.state;
    s.lastTouch = 1;
    s.prevTouch = 0;
    sim.setBall([0, 2, 44], [0, 0, 30]);
    let g: Extract<SimEvent, { t: 'goal' }> | undefined;
    for (let i = 0; i < 40 && !g; i++) g = sim.step([]).find((e) => e.t === 'goal') as typeof g;
    expect(g?.team).toBe(0);
    expect(g?.scorer).toBe(1);
    expect(g?.assist).toBe(0);
    // Eigentor: Auto 2 (Team 1) berührt zuletzt den Ball ins Tor bei +z → Team 0 punktet, kein Schütze
    const sim2 = makeSim([0, 0, 1], { training: false });
    sim2.state.lastTouch = 2;
    sim2.setBall([0, 2, 44], [0, 0, 30]);
    let g2: Extract<SimEvent, { t: 'goal' }> | undefined;
    for (let i = 0; i < 40 && !g2; i++) g2 = sim2.step([]).find((e) => e.t === 'goal') as typeof g2;
    expect(g2?.team).toBe(0);
    expect(g2?.scorer).toBe(-1);
  });

  it('Ablauf: Countdown 3,2,1 → Anstoß → Tor → Feier → neuer Anstoß', () => {
    const sim = new Sim({ cars: [{ team: 0 }, { team: 1 }], seed: 3 });
    const ev: SimEvent[] = [];
    const tickOf = (pred: (e: SimEvent) => boolean, list: SimEvent[][]): number =>
      list.findIndex((l) => l.some(pred));
    const per: SimEvent[][] = [];
    for (let i = 0; i < 200; i++) {
      const e = sim.step([]);
      per.push(e);
      ev.push(...e);
    }
    expect(ev.filter((e) => e.t === 'countdown').map((e) => (e as { n: number }).n)).toEqual([3, 2, 1]);
    const k = tickOf((e) => e.t === 'kickoff', per);
    expect(k).toBeGreaterThanOrEqual(178);
    expect(k).toBeLessThanOrEqual(180);
    expect(sim.state.phase).toBe('playing');
    // Tor erzwingen
    sim.setBall([0, 2, 44], [0, 0, 30]);
    run2(sim, 20);
    expect(sim.state.phase).toBe('goal');
    run2(sim, 4 * 60 + 2);
    expect(sim.state.phase).toBe('countdown');
    expect(Math.abs(sim.state.ball.pos[2])).toBeLessThan(0.01);
    expect(sim.state.cars[0]!.boost).toBe(33);
    run2(sim, 185);
    expect(sim.state.phase).toBe('playing');
    expect(sim.state.score).toEqual([1, 0]);
  });

  it('Uhr 0 mit Führung → ended mit Sieger', () => {
    const sim = new Sim({ cars: [{ team: 0 }, { team: 1 }], seed: 3, matchSeconds: 2 });
    const ev: SimEvent[] = [];
    for (let i = 0; i < 181; i++) sim.step([]);
    sim.state.score[1] = 1;
    for (let i = 0; i < 200; i++) ev.push(...sim.step([]));
    expect(sim.state.phase).toBe('ended');
    expect(sim.state.winner).toBe(1);
    expect(ev.filter((e) => e.t === 'end')).toEqual([{ t: 'end', winner: 1 }]);
  });

  it('Gleichstand → Verlängerung → Golden Goal', () => {
    const sim = new Sim({ cars: [{ team: 0 }, { team: 1 }], seed: 3, matchSeconds: 2 });
    const ev: SimEvent[] = [];
    for (let i = 0; i < 181 + 130; i++) ev.push(...sim.step([]));
    expect(ev.filter((e) => e.t === 'overtime').length).toBe(1);
    expect(sim.state.overtime).toBe(true);
    expect(sim.state.phase).toBe('countdown');
    for (let i = 0; i < 185; i++) sim.step([]);
    expect(sim.state.phase).toBe('playing');
    sim.setBall([0, 2, -44], [0, 0, -30]);
    for (let i = 0; i < 4 * 60 + 20; i++) ev.push(...sim.step([]));
    expect(sim.state.phase).toBe('ended');
    expect(sim.state.winner).toBe(1);
    expect(ev.filter((e) => e.t === 'end')).toEqual([{ t: 'end', winner: 1 }]);
  });

  it('Training: keine Uhr, Tor setzt nur den Ball zurück', () => {
    const sim = makeSim([0], { training: true });
    sim.setBall([0, 2, 44], [0, 0, 30]);
    for (let i = 0; i < 30; i++) sim.step([]);
    expect(sim.state.phase).toBe('playing');
    expect(sim.state.score[0]).toBe(1);
    expect(Math.abs(sim.state.ball.pos[2])).toBeLessThan(1);
    for (let i = 0; i < 6000; i++) sim.step([]);
    expect(sim.state.phase).toBe('playing');
  });
});

function run2(sim: Sim, n: number): void {
  for (let i = 0; i < n; i++) sim.step([]);
}

describe('Boost-Pads und Demolition', () => {
  it('Pad-Aufnahme und Respawn (groß 10 s, klein 4 s)', () => {
    const sim = makeSim([0], { pads: true, training: false });
    const s = sim.state;
    const big = s.pads.findIndex((p) => p.big);
    const small = s.pads.findIndex((p) => !p.big);
    expect(s.pads.filter((p) => p.big).length).toBe(6);
    expect(s.pads.filter((p) => !p.big).length).toBe(28);
    sim.setCar(0, { pos: [s.pads[big]!.pos[0], 0.19, s.pads[big]!.pos[2]], boost: 20 });
    const ev = sim.step([]);
    expect(ev.some((e) => e.t === 'pad' && e.big)).toBe(true);
    expect(s.cars[0]!.boost).toBe(100);
    expect(s.pads[big]!.active).toBe(false);
    sim.setCar(0, { pos: [0, 0.19, -20] });
    run2(sim, 9 * 60);
    expect(s.pads[big]!.active).toBe(false);
    run2(sim, 70);
    expect(s.pads[big]!.active).toBe(true);
    sim.setCar(0, { pos: [s.pads[small]!.pos[0], 0.19, s.pads[small]!.pos[2]], vel: [0, 0, 0], boost: 20 });
    sim.step([]);
    expect(s.cars[0]!.boost).toBeCloseTo(32, 5);
    sim.setCar(0, { pos: [0, 0.19, -20] }); // weg vom Pad, sonst würde es sofort wieder aufgenommen
    run2(sim, 3 * 60);
    expect(s.pads[small]!.active).toBe(false);
    run2(sim, 70);
    expect(s.pads[small]!.active).toBe(true);
  });

  it('Pads sind symmetrisch (Spiegelung an x und z)', () => {
    const s = createSimState({ cars: [], seed: 1 });
    for (const p of s.pads) {
      for (const [mx, mz] of [
        [-1, 1],
        [1, -1],
        [-1, -1],
      ] as const) {
        expect(
          s.pads.some(
            (q) =>
              q.big === p.big &&
              Math.abs(q.pos[0] - p.pos[0] * mx) < 1e-9 &&
              Math.abs(q.pos[2] - p.pos[2] * mz) < 1e-9,
          ),
        ).toBe(true);
      }
    }
  });

  it('Supersonic-Rammen zerstört den Gegner, Respawn nach 3 s mit Boost 33', () => {
    const sim = makeSim([0, 1]);
    sim.setCar(0, { pos: [0, 0.19, -25], vel: [0, 0, 23], boost: 100 });
    sim.setCar(1, { pos: [0, 0.19, -12], quat: [0, 1, 0, 0] });
    const ev: SimEvent[] = [];
    let demoTick = -1;
    for (let i = 0; i < 60 && demoTick < 0; i++) {
      const e = sim.step([{ throttle: 1, boost: true }, {}]);
      ev.push(...e);
      if (e.some((x) => x.t === 'demo')) demoTick = i;
    }
    expect(ev).toContainEqual({ t: 'demo', victim: 1, attacker: 0 });
    const v = sim.state.cars[1]!;
    expect(v.demolished).toBeGreaterThan(2.9);
    let respawned = -1;
    for (let i = 1; i < 240 && respawned < 0; i++) {
      const e = sim.step([{}, {}]);
      if (e.some((x) => x.t === 'respawn' && x.car === 1)) respawned = i;
    }
    expect(respawned).toBeGreaterThan(170);
    expect(respawned).toBeLessThan(185);
    expect(v.demolished).toBe(0);
    expect(v.boost).toBe(33);
    expect(v.pos[2]).toBeGreaterThan(25); // Anstoßpunkt von Team 1
  });

  it('langsames Rammen zerstört nicht', () => {
    const sim = makeSim([0, 1]);
    sim.setCar(0, { pos: [0, 0.19, -25], vel: [0, 0, 10] });
    sim.setCar(1, { pos: [0, 0.19, -20], quat: [0, 1, 0, 0] });
    const ev: SimEvent[] = [];
    for (let i = 0; i < 60; i++) ev.push(...sim.step([{ throttle: 1 }, {}]));
    expect(ev.some((e) => e.t === 'demo')).toBe(false);
    expect(sim.state.cars[1]!.demolished).toBe(0);
  });
});

describe('Determinismus und Robustheit', () => {
  function play(seed: number, inputSeed: number, ticks = 3000, cars: Array<0 | 1> = [0, 0, 0, 1, 1, 1]): Sim {
    const sim = new Sim({ cars: cars.map((team) => ({ team })), seed });
    const rng = new Rng(inputSeed);
    for (let i = 0; i < ticks; i++) sim.step(cars.map(() => randomInput(rng)));
    return sim;
  }

  it('gleicher Seed + gleiche Eingaben → gleicher Hash nach 3000 Ticks; anderes → anderer Hash', () => {
    const a = play(5, 99);
    const b = play(5, 99);
    expect(a.hash()).toBe(b.hash());
    expect(play(6, 99).hash()).not.toBe(a.hash());
    expect(play(5, 100).hash()).not.toBe(a.hash());
  });

  it('6 Autos × 3000 Ticks zufällige Eingaben: nie NaN, alles im Innenraum', () => {
    const cars = [0, 0, 0, 1, 1, 1];
    const sim = new Sim({ cars: cars.map((team) => ({ team: team as 0 | 1 })), seed: 11 });
    const rng = new Rng(4);
    const d = { dist: 0, nx: 0, ny: 0, nz: 0 };
    let worstCar = 1e9;
    let worstBall = 1e9;
    for (let i = 0; i < 3000; i++) {
      sim.step(cars.map(() => randomInput(rng)));
      for (const c of sim.state.cars) {
        for (const x of [...c.pos, ...c.vel, ...c.angVel, ...c.quat, c.boost])
          expect(Number.isFinite(x)).toBe(true);
        if (c.demolished <= 0) worstCar = Math.min(worstCar, arenaDistance(c.pos, d).dist);
      }
      for (const x of [...sim.state.ball.pos, ...sim.state.ball.vel, ...sim.state.ball.angVel])
        expect(Number.isFinite(x)).toBe(true);
      worstBall = Math.min(worstBall, arenaDistance(sim.state.ball.pos, d).dist);
    }
    expect(worstCar).toBeGreaterThan(-0.3);
    expect(worstBall).toBeGreaterThan(BALL_RADIUS - 0.1);
  });

  it('ungültige Eingaben (NaN, Strings) werden neutralisiert', () => {
    const sim = makeSim();
    const bad = {
      throttle: NaN,
      steer: Infinity,
      pitch: 'x',
      jump: 1,
      boost: 'yes',
    } as unknown as Partial<CarInput>;
    for (let i = 0; i < 60; i++) sim.step([bad, undefined, null as unknown as undefined]);
    expect(speed(sim.state.cars[0]!.vel)).toBeLessThan(0.1);
  });

  it('setCar mit NaN-Zustand wird zurückgesetzt', () => {
    const sim = makeSim();
    sim.setCar(0, { vel: [NaN, 0, 0] });
    const ev = sim.step([{}]);
    expect(ev.some((e) => e.t === 'respawn')).toBe(true);
    expect(Number.isFinite(sim.state.cars[0]!.vel[0])).toBe(true);
  });

  it('Leistung: Tick mit 6 Autos < 0,4 ms im Mittel', () => {
    const cars = [0, 0, 0, 1, 1, 1];
    const sim = new Sim({ cars: cars.map((team) => ({ team: team as 0 | 1 })), seed: 2 });
    skipCountdown(sim);
    const rng = new Rng(8);
    const inputs = Array.from({ length: 500 }, () => cars.map(() => randomInput(rng)));
    for (let i = 0; i < 200; i++) sim.step(inputs[i]!);
    const t0 = performance.now();
    for (let i = 0; i < 1000; i++) sim.step(inputs[i % 500]!);
    const ms = (performance.now() - t0) / 1000;
    expect(ms).toBeLessThan(0.4);
  });
});
