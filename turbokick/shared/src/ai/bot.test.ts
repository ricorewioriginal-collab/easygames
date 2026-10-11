import { describe, expect, it } from 'vitest';
import { Rng } from '../rng';
import { Sim, cloneState, clampInput, hashState, type CarInput, type SimEvent } from '../sim';
import { Bot, shotSpeed, type Difficulty } from './bot';

/*
 * Gemessene Werte (Headless, Node; siehe tools/ai-demo.mjs):
 *  - 1v1 gegen untätigen Gegner, 90 s: pro ≈ 4,2 Tore, hard ≈ 2, normal ≈ 1,5
 *  - 1v1 hard gegen easy, 90 s: ≈ 163 : 69 Tore über 300 Spiele
 *  - act(): ≈ 3 µs pro Aufruf (Grenze 150 µs)
 */

type Team = 0 | 1;

interface Slot {
  team: Team;
  /** undefined = untätig (neutrale Eingabe) */
  level?: Difficulty;
}

interface Game {
  sim: Sim;
  bots: Array<Bot | undefined>;
}

function makeGame(slots: Slot[], seed: number, matchSeconds = 120): Game {
  const sim = new Sim({ cars: slots.map((s) => ({ team: s.team })), seed, matchSeconds });
  const bots = slots.map((s, i) => (s.level ? new Bot(s.level, seed * 31 + i * 7 + 1) : undefined));
  return { sim, bots };
}

/** Ein Tick: alle Bots entscheiden, Sim schreitet fort */
function tick(g: Game): { inputs: CarInput[]; events: SimEvent[] } {
  const inputs: CarInput[] = g.bots.map((b, i) =>
    b
      ? b.act(g.sim.state, i)
      : {
          throttle: 0,
          steer: 0,
          pitch: 0,
          yaw: 0,
          roll: 0,
          jump: false,
          boost: false,
          handbrake: false,
        },
  );
  return { inputs, events: g.sim.step(inputs) };
}

/** Spielt Ticks, zählt Tore je Team */
function playGoals(g: Game, ticks: number): [number, number] {
  const goals: [number, number] = [0, 0];
  for (let t = 0; t < ticks; t++) {
    for (const e of tick(g).events) if (e.t === 'goal') goals[e.team]++;
  }
  return goals;
}

describe('Bot: Determinismus und Gültigkeit', () => {
  it('gleiche Seeds → gleiche Eingaben (2v2, alle Stufen)', () => {
    const slots: Slot[] = [
      { team: 0, level: 'easy' },
      { team: 0, level: 'hard' },
      { team: 1, level: 'normal' },
      { team: 1, level: 'pro' },
    ];
    const run = (seed: number): string => {
      const g = makeGame(slots, 5);
      let h = 2166136261;
      for (let t = 0; t < 3000; t++) {
        const { inputs } = tick(g);
        void seed;
        for (const inp of inputs) {
          const s = JSON.stringify(inp);
          for (let k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 16777619);
        }
      }
      return `${h >>> 0}:${g.sim.hash()}`;
    };
    expect(run(1)).toBe(run(1));
    // andere Bot-Seeds ändern (wegen Zielrauschen) mindestens eine Eingabe
    const a = new Bot('easy', 1);
    const b = new Bot('easy', 2);
    const g = makeGame([{ team: 0 }, { team: 1 }], 9);
    let differs = false;
    for (let t = 0; t < 1500 && !differs; t++) {
      g.sim.step([]);
      const ia = a.act(g.sim.state, 0);
      const ib = b.act(g.sim.state, 0);
      if (JSON.stringify(ia) !== JSON.stringify(ib)) differs = true;
    }
    expect(differs).toBe(true);
  });

  it('Eingaben immer gültig (clampInput ändert nichts, kein NaN) – 3v3, 5000 Ticks, zufällige Anstöße', () => {
    const levels: Difficulty[] = ['easy', 'normal', 'hard', 'pro', 'hard', 'normal'];
    const slots: Slot[] = levels.map((level, i) => ({ team: (i < 3 ? 0 : 1) as Team, level }));
    const g = makeGame(slots, 21);
    const rng = new Rng(77);
    for (let t = 0; t < 5000; t++) {
      if (t % 150 === 100) {
        // zufälliger Anstoß: Ball irgendwohin, Autos in zufällige Lagen mit zufälliger Geschwindigkeit
        g.sim.setBall(
          [rng.float(-30, 30), rng.float(1, 12), rng.float(-40, 40)],
          [rng.float(-25, 25), rng.float(-10, 15), rng.float(-30, 30)],
        );
        const id = rng.int(slots.length);
        g.sim.setCar(id, {
          pos: [rng.float(-30, 30), rng.float(0.3, 10), rng.float(-40, 40)],
          quat: [rng.float(-1, 1), rng.float(-1, 1), rng.float(-1, 1), rng.float(-1, 1)],
          vel: [rng.float(-20, 20), rng.float(-10, 10), rng.float(-20, 20)],
          angVel: [rng.float(-5, 5), rng.float(-5, 5), rng.float(-5, 5)],
          boost: rng.float(0, 100),
        });
      }
      const { inputs } = tick(g);
      for (const inp of inputs) {
        expect(clampInput(inp)).toEqual(inp);
        for (const v of [inp.throttle, inp.steer, inp.pitch, inp.yaw, inp.roll]) expect(Number.isFinite(v)).toBe(true);
      }
    }
  });

  it('Bots nutzen keine versteckten Informationen: rngState ändert nichts, act() verändert den Zustand nicht', () => {
    const slots: Slot[] = [
      { team: 0, level: 'pro' },
      { team: 0, level: 'normal' },
      { team: 1, level: 'hard' },
      { team: 1, level: 'easy' },
    ];
    const g = makeGame(slots, 3);
    const botsA = slots.map((s, i) => new Bot(s.level as Difficulty, 100 + i));
    const botsB = slots.map((s, i) => new Bot(s.level as Difficulty, 100 + i));
    const rng = new Rng(5);
    for (let t = 0; t < 2500; t++) {
      const st = g.sim.state;
      const hashBefore = hashState(st);
      const manipulated = cloneState(st);
      manipulated.rngState = (rng.next() * 4294967296) >>> 0;
      const inputs: CarInput[] = [];
      for (let i = 0; i < slots.length; i++) {
        const a = (botsA[i] as Bot).act(st, i);
        const b = (botsB[i] as Bot).act(manipulated, i);
        expect(b).toEqual(a);
        inputs.push(a);
      }
      expect(hashState(st)).toBe(hashBefore);
      g.sim.step(inputs);
    }
  });
});

describe('Bot: Spielstärke', () => {
  it("1v1 gegen untätigen Gegner: 'pro' ≥ 2 Tore, 'normal' ≥ 1 Tor in 2 Minuten", () => {
    for (const team of [0, 1] as const) {
      const pro = makeGame([{ team, level: 'pro' }, { team: (1 - team) as Team }], 11 + team);
      expect(playGoals(pro, 7300)[team]).toBeGreaterThanOrEqual(2);
      const normal = makeGame([{ team, level: 'normal' }, { team: (1 - team) as Team }], 13 + team);
      expect(playGoals(normal, 7300)[team]).toBeGreaterThanOrEqual(1);
    }
  });

  it("Rangfolge: 'hard' schlägt 'easy' im Mittel (1v1, je 90 s, mit Seitenwechsel)", () => {
    let hard = 0;
    let easy = 0;
    for (let k = 0; k < 40; k++) {
      const hardTeam = (k % 2) as Team;
      const g = makeGame(
        [
          { team: hardTeam, level: 'hard' },
          { team: (1 - hardTeam) as Team, level: 'easy' },
        ],
        300 + k,
        90,
      );
      const goals = playGoals(g, 5400 + 600);
      hard += goals[hardTeam];
      easy += goals[(1 - hardTeam) as Team];
    }
    expect(hard).toBeGreaterThan(easy);
  });
});

describe('Bot: Mannschaften', () => {
  function teamRun(sizes: number, levels: Difficulty[], seed: number, seconds: number): void {
    const slots: Slot[] = [];
    for (const team of [0, 1] as const)
      for (let i = 0; i < sizes; i++) slots.push({ team, level: levels[(i + team) % levels.length] });
    const g = makeGame(slots, seed, seconds);
    const n = slots.length;
    const still = new Array<number>(n).fill(0);
    const path = new Array<number>(n).fill(0);
    const last = g.sim.state.cars.map((c) => [c.pos[0], c.pos[2]]);
    let teamIdle = 0;
    for (let t = 0; t < seconds * 60; t++) {
      tick(g);
      const s = g.sim.state;
      if (s.phase !== 'playing') {
        still.fill(0);
        teamIdle = 0;
        continue;
      }
      for (let i = 0; i < n; i++) {
        const c = s.cars[i]!;
        const l = last[i]!;
        path[i] += Math.hypot(c.pos[0] - l[0]!, c.pos[2] - l[1]!);
        l[0] = c.pos[0];
        l[1] = c.pos[2];
        const speed = Math.hypot(c.vel[0], c.vel[1], c.vel[2]);
        // „unbeabsichtigt“ = der Bot will sich bewegen, kommt aber nicht vom Fleck
        if (c.demolished > 0 || speed >= 0.8 || !(g.bots[i] as Bot).debug.wantsMove) still[i] = 0;
        else still[i]++;
        expect(still[i], `Auto ${i} steht seit ${(still[i] as number) / 60} s bei t=${t / 60}`).toBeLessThanOrEqual(300);
      }
      // Alle Bots einer Mannschaft in der eigenen Hälfte hinter dem Ball ohne Bewegung?
      let allBack = true;
      for (const c of s.cars) {
        if (c.team !== 0) continue;
        const speed = Math.hypot(c.vel[0], c.vel[2]);
        if (!(c.pos[2] < s.ball.pos[2] && c.pos[2] < 0 && speed < 1)) allBack = false;
      }
      teamIdle = allBack ? teamIdle + 1 : 0;
      expect(teamIdle).toBeLessThan(240);
    }
    for (let i = 0; i < n; i++) expect(path[i] as number).toBeGreaterThan(80);
  }

  it('2v2: keine Mannschaft bleibt stecken', () => {
    teamRun(2, ['hard', 'normal'], 41, 100);
  });

  it('3v3: keine Mannschaft bleibt stecken (gemischte Stufen)', () => {
    teamRun(3, ['pro', 'hard', 'easy'], 43, 100);
    teamRun(3, ['normal'], 44, 60);
  });

  it('Befreiung: auf dem Dach liegende Bots kommen wieder auf die Räder und fahren', () => {
    for (const level of ['easy', 'normal', 'hard', 'pro'] as Difficulty[]) {
      const sim = new Sim({ cars: [{ team: 0 }, { team: 1 }], seed: 3, training: true });
      for (let i = 0; i < 190; i++) sim.step([]);
      sim.setBall([10, 0.92, 10]);
      sim.state.lastTouch = 1;
      sim.setCar(0, { pos: [-10, 0.6, -10], quat: [1, 0, 0, 0] });
      sim.setCar(1, { pos: [30, 0.19, 40] });
      const bot = new Bot(level, 1);
      let moving = false;
      for (let t = 0; t < 60 * 8 && !moving; t++) {
        sim.step([bot.act(sim.state, 0), {}]);
        const c = sim.state.cars[0]!;
        const q = c.quat;
        const up = 1 - 2 * (q[0] * q[0] + q[2] * q[2]);
        if (up > 0.9 && c.wheelsOnSurface >= 3 && Math.hypot(c.vel[0], c.vel[2]) > 3) moving = true;
      }
      expect(moving, level).toBe(true);
    }
  });
});

describe('Bot: Rechenaufwand', () => {
  it('6 Bots × 3000 Ticks: mittlere Zeit pro act() < 0,15 ms', () => {
    const levels: Difficulty[] = ['easy', 'normal', 'hard', 'pro', 'hard', 'pro'];
    const slots: Slot[] = levels.map((level, i) => ({ team: (i % 2) as Team, level }));
    const g = makeGame(slots, 77, 300);
    let total = 0;
    let calls = 0;
    const inputs: CarInput[] = [];
    for (let t = 0; t < 3000; t++) {
      inputs.length = 0;
      const t0 = performance.now();
      for (let i = 0; i < slots.length; i++) inputs.push((g.bots[i] as Bot).act(g.sim.state, i));
      total += performance.now() - t0;
      calls += slots.length;
      g.sim.step(inputs);
    }
    const mean = total / calls;
    expect(mean).toBeLessThan(0.15);
  });
});

describe('Bot: Hilfen', () => {
  it('Schusstempo sinkt nicht mit größerer Entfernung unter das Minimum und bleibt begrenzt', () => {
    for (let d = 3; d <= 100; d += 5) {
      const v = shotSpeed(d);
      expect(v).toBeGreaterThanOrEqual(4.5);
      expect(v).toBeLessThanOrEqual(18);
    }
    // Weite Schüsse dürfen kräftiger sein als mittlere
    expect(shotSpeed(90)).toBeGreaterThan(shotSpeed(25));
  });
});
