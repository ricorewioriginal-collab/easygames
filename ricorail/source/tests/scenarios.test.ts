// Szenarien: jedes Szenario startet fehlerfrei (Spielerzug, Weg zum Ziel, Abfahrt bald), kurze Simulation ohne Rotfahrt;
// dazu je ein vollständiger Durchlauf für Personen-, Güter- und Stellwerksszenario (KI fährt den Spielerzug).
import { describe, it, expect } from 'vitest';
import { routeNet } from '../src/data/routes';
import { SCENARIOS, SCENARIO } from '../src/data/scenarios';
import { Session, type Scenario } from '../src/modes/session';
import type { NetworkDef } from '../src/railway/schema';

const defs = new Map<string, NetworkDef>();
const def = (id: string) => { if (!defs.has(id)) defs.set(id, routeNet(id)); return structuredClone(defs.get(id)!); };

async function start(sc: Scenario, pre = 30) {
  const s = new Session({ def: def(sc.route), routeId: sc.route, time: sc.time, weather: sc.weather, assist: 'easy', traffic: sc.traffic, player: sc.player, scenario: sc });
  await s.prerun(pre);
  const p = s.spawnPlayer();
  return { s, p };
}

/** KI fährt den Spielerzug; Spieleraktionen (Laden, Entladen) werden wie von Hand ausgelöst */
function drive(s: Session, maxMin: number) {
  const p = s.player!, w = s.world;
  const loadG = s.sc?.goals.find((g) => g.t === 'load') as { n: number } | undefined;
  p.ai = true;
  if (loadG) w.plans.get(p.id)!.state = 'hold';
  for (let i = 0; i < 50 * 60 * maxMin && !s.finished; i++) {
    s.update(0.02);
    if (i % 50 === 0 && Math.abs(p.v) < 0.05) {
      s.cargo('load'); s.cargo('unload');
      const pl = w.plans.get(p.id)!;
      if (loadG && pl.state === 'hold' && s.loaded >= loadG.n) { pl.state = 'run'; w.planNext(p); }
      // ungesicherte Weichen (Gleisanschluss) stellt der Spieler im Gleisplan selbst
      const hi = pl.path.findIndex((x) => x.t === p.head.t);
      if (pl.state === 'run' && hi >= 0) for (const x of w.net.switchSettings(pl.path.slice(hi))) if (w.net.switches.get(x.sw)!.state !== x.state && !w.il.swLock(x.sw)) w.net.setSwitch(x.sw, x.state);
    }
  }
}

describe('Szenarien', () => {
  it('64 Szenarien, eindeutige IDs', () => {
    expect(SCENARIOS.length).toBe(64);
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(64);
  });

  for (const sc of SCENARIOS) {
    it(`${sc.id} startet und läuft 60 s fehlerfrei`, async () => {
      const { s, p } = await start(sc);
      const w = s.world;
      // Bezüge im Szenario existieren
      for (const g of sc.goals) {
        if (g.t === 'reach' && g.st) expect(w.stations.has(g.st), `${sc.id}: Station ${g.st}`).toBe(true);
        if (g.t === 'deliver') expect(s.industry(g.to), `${sc.id}: ${g.to}`).toBeTruthy();
        if (g.t === 'load' || g.t === 'park') expect(s.industry(g.at), `${sc.id}: ${g.at}`).toBeTruthy();
      }
      if (sc.player.kind === 'box' || sc.player.kind === 'none') expect(p).toBeNull();
      else {
        expect(p, `${sc.id}: Spielerzug`).toBeTruthy();
        const plan = w.plans.get(p!.id)!;
        if (sc.player.kind === 'service') {
          // Abfahrt spätestens 15 min nach Szenariobeginn, Weg zum nächsten Halt bekannt
          expect((plan.svc!.stops[0].dep ?? 0) - sc.time, `${sc.id}: Wartezeit bis Abfahrt`).toBeLessThan(15 * 60);
          expect(plan.path.length, `${sc.id}: Weg zum nächsten Halt`).toBeGreaterThan(0);
        } else if (sc.player.dest && sc.cat !== 'shunt') expect(plan.path.length, `${sc.id}: Weg zum Ziel ohne Wenden`).toBeGreaterThan(0);
        if (sc.cat !== 'shunt') p!.ai = true;
      }
      for (let i = 0; i < 50 * 60; i++) s.update(0.02);
      expect(w.score.spad, `${sc.id}: Rotfahrt`).toBe(0);
      expect(w.score.collisions, `${sc.id}: Zusammenstoß`).toBe(0);
      expect(s.finished?.ok === false ? s.finished.reason : null).toBeNull();
    });
  }

  it('p06 S-Bahn vollständig: pünktlich, Halt genau, Türen', async () => {
    const { s } = await start(SCENARIO.get('p06')!, 600);
    drive(s, 40);
    expect(s.finished?.reason ?? null).toBeNull();
    expect(s.finished?.ok).toBe(true);
  }, 60_000);

  it('g01 Güterzug vollständig: Containerterminal anfahren und entladen', async () => {
    const { s } = await start(SCENARIO.get('g01')!, 600);
    drive(s, 45);
    expect(s.finished?.ok).toBe(true);
    expect(s.delivered).toBeGreaterThanOrEqual(12);
  }, 60_000);

  it('b01 Stellwerk: automatischer Fahrdienstleiter bringt 5 Züge pünktlich durch', async () => {
    const { s } = await start(SCENARIO.get('b01')!, 900);
    s.world.manual.clear();
    for (let i = 0; i < 50 * 60 * 90 && !s.finished; i++) s.update(0.02);
    expect(s.finished?.reason ?? null).toBeNull();
    expect(s.finished?.ok).toBe(true);
  }, 60_000);

  it('g04 Ladestelle: beladen, ohne Wenden nach Bremen', async () => {
    const { s } = await start(SCENARIO.get('g04')!, 900);
    drive(s, 90);
    expect(s.finished?.ok).toBe(true);
  }, 60_000);
});
