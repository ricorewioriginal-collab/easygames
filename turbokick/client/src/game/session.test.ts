import { describe, expect, it } from 'vitest';
import { NEUTRAL_CAR_INPUT, type CarInput } from '@shared/sim/types';
import type { StartMessage, StartPlayer } from '@shared/net/p2p';
import type { Link } from '../net/p2pLink';
import type { HostPlan } from '../net/p2pRoom';
import { GuestMatch, HostMatch, LocalMatch } from './session';

/** Gestellte Verbindung mit fester Laufzeit (in Bildern) in beide Richtungen, ohne Netzwerk */
class FakeEnd {
  state: 'open' | 'closed' = 'open';
  peer!: FakeEnd;
  private msg: Array<(m: unknown) => void> = [];
  private fast: Array<(d: string | ArrayBuffer) => void> = [];
  private closeCb: Array<() => void> = [];
  inbox: Array<{ at: number; kind: 'm' | 'f'; data: unknown }> = [];
  constructor(private readonly clock: { n: number }, private readonly latency: number) {}
  onMessage(cb: (m: unknown) => void): void { this.msg.push(cb); }
  onFast(cb: (d: string | ArrayBuffer) => void): void { this.fast.push(cb); }
  onClose(cb: () => void): void { this.closeCb.push(cb); }
  send(m: unknown): void { this.peer.inbox.push({ at: this.clock.n + this.latency, kind: 'm', data: JSON.parse(JSON.stringify(m)) }); }
  sendFast(d: string | Uint8Array): void {
    const data = typeof d === 'string' ? d : (d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength) as ArrayBuffer);
    this.peer.inbox.push({ at: this.clock.n + this.latency, kind: 'f', data });
  }
  close(): void { this.state = 'closed'; for (const c of this.closeCb) c(); }
  pump(): void {
    const due = this.inbox.filter((x) => x.at <= this.clock.n);
    this.inbox = this.inbox.filter((x) => x.at > this.clock.n);
    for (const x of due) for (const cb of (x.kind === 'm' ? this.msg : this.fast)) (cb as (v: unknown) => void)(x.data);
  }
}

function link(latency: number): { clock: { n: number }; host: FakeEnd; guest: FakeEnd } {
  const clock = { n: 0 };
  const host = new FakeEnd(clock, latency);
  const guest = new FakeEnd(clock, latency);
  host.peer = guest;
  guest.peer = host;
  return { clock, host, guest };
}

const players: StartPlayer[] = [
  { carId: 0, name: 'Host', team: 0, kind: 'human', difficulty: 'normal', look: { body: 'flitzer', decal: 'keins', accent: '' } },
  { carId: 1, name: 'Gast', team: 1, kind: 'human', difficulty: 'normal', look: { body: 'pfeil', decal: 'keins', accent: '' } },
];

describe('Sitzungen', () => {
  it('lokale Partie: Eingabe bewegt das Auto, Bots spielen mit, Ereignisse kommen zurück', () => {
    const m = new LocalMatch({ players: [players[0] as StartPlayer, { ...(players[1] as StartPlayer), kind: 'bot' }], seed: 5, matchSeconds: 60, arena: 'neon', nitro: true, localCars: [0] });
    const go: CarInput = { ...NEUTRAL_CAR_INPUT, throttle: 1, boost: true };
    for (let i = 0; i < 60 * 8; i++) m.advance(1 / 60, [go]);
    const c = m.state.cars[0];
    expect(Math.hypot(c?.vel[0] ?? 0, c?.vel[2] ?? 0)).toBeGreaterThan(5);
    expect(m.state.phase === 'playing' || m.state.phase === 'goal').toBe(true);
    const bot = m.state.cars[1];
    expect(Math.hypot((bot?.pos[0] ?? 0) - 0, (bot?.pos[2] ?? 0) - 0)).toBeGreaterThan(0);
    m.dispose();
  });

  it('Gast und Gastgeber bleiben bei 100 ms Laufzeit zusammen (Vorhersage + Abgleich)', () => {
    const lk = link(3); // 3 Bilder ≈ 50 ms je Richtung
    const plan: HostPlan = { seed: 11, matchSeconds: 120, arena: 'neon', nitro: true, players, hostCar: 0, guests: new Map([[1, lk.host as unknown as Link]]) };
    const host = new HostMatch(plan);
    let guest: GuestMatch | null = null;
    lk.guest.onMessage((raw) => {
      const m = raw as { t: string; msg?: StartMessage };
      if (m.t === 'start' && m.msg && !guest) guest = new GuestMatch(lk.guest as unknown as Link, m.msg);
    });
    const hostIn: CarInput = { ...NEUTRAL_CAR_INPUT, throttle: 1 };
    const guestIn: CarInput = { ...NEUTRAL_CAR_INPUT, throttle: 1, boost: true };
    let maxErr = 0;
    for (let f = 0; f < 60 * 12; f++) {
      lk.clock.n = f;
      lk.guest.pump();
      lk.host.pump();
      host.advance(1 / 60, [hostIn]);
      guest?.advance(1 / 60, [f > 240 ? { ...guestIn, steer: Math.sin(f / 30) } : guestIn]);
      lk.host.pump();
      lk.guest.pump();
      if (guest && f > 400) {
        const g = (guest as GuestMatch).state.cars[1];
        const h = host.state.cars[1];
        if (g && h) maxErr = Math.max(maxErr, Math.hypot(g.pos[0] - h.pos[0], g.pos[1] - h.pos[1], g.pos[2] - h.pos[2]));
      }
    }
    expect(guest).not.toBeNull();
    // Das Gast-Auto hat sich auch beim Gastgeber bewegt (Eingaben kommen an)
    const hc = host.state.cars[1];
    expect(Math.hypot(hc?.pos[0] ?? 0, hc?.pos[2] ?? 0)).toBeGreaterThan(5);
    // Der Gast sieht sein Auto nahe an der Wahrheit des Gastgebers (Laufzeit ≈ 100 ms bei bis zu 23 m/s → wenige Meter)
    expect(maxErr).toBeLessThan(6);
    expect((guest as unknown as GuestMatch).state.phase).toBe(host.state.phase);
    expect((guest as unknown as GuestMatch).pingMs).toBeGreaterThanOrEqual(0);
    host.dispose();
    (guest as unknown as GuestMatch).dispose();
  });

  it('Gastgeber ersetzt einen getrennten Gast durch einen Bot', () => {
    const lk = link(1);
    const plan: HostPlan = { seed: 3, matchSeconds: 60, arena: 'eis', nitro: false, players, hostCar: 0, guests: new Map([[1, lk.host as unknown as Link]]) };
    const host = new HostMatch(plan);
    const notes: string[] = [];
    host.onNotice((t) => notes.push(t));
    for (let f = 0; f < 600; f++) host.advance(1 / 60, [{ ...NEUTRAL_CAR_INPUT }]);
    const before = host.state.cars[1]?.pos.slice();
    lk.guest.close();
    lk.host.close();
    for (let f = 0; f < 60 * 6; f++) host.advance(1 / 60, [{ ...NEUTRAL_CAR_INPUT }]);
    expect(notes.some((n) => /Bot übernimmt/.test(n))).toBe(true);
    expect(host.state.cars[1]?.pos).not.toEqual(before);
    host.dispose();
  });
});
