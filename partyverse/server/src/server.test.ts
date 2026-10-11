import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client, Room } from 'colyseus.js';
import { createGameServer } from './index';
import { GameCore } from '@shared/core/core';
import { decide } from '@shared/core/ai';
import type { Action, GameState } from '@shared/core/types';
import type { GameStartMessage, GameUpdateMessage, ClientMessage } from '@shared/net/protocol';
import { getMiniGame } from '@shared/minigames/registry';
import { runBot } from '@shared/minigames/simulate';
import { Rng } from '@shared/rng';

let srv: ReturnType<typeof createGameServer>;
let url: string;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const until = async (cond: () => boolean, ms = 8000, what = 'Bedingung') => {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > ms) throw new Error('Zeitüberschreitung: ' + what);
    await sleep(15);
  }
};
const send = (room: Room, m: ClientMessage) => room.send('msg', m);

/** Ein Test-Mitspieler: hört auf Updates und spielt mit denselben Regeln wie ein Mensch (über das Netz). */
class Agent {
  id = '';
  state: GameState | null = null;
  start: GameStartMessage | null = null;
  errors: string[] = [];
  notices: string[] = [];
  updates = 0;
  private mirror: GameCore | null = null;
  private rng = new Rng(5);
  autoplay = true;
  constructor(readonly room: Room<any>) {
    room.onMessage('start', (m: GameStartMessage) => {
      this.start = m;
      this.id = m.you;
      this.mirror = new GameCore({ layoutId: m.layoutId, rounds: m.rounds, players: m.players }, 1);
    });
    room.onMessage('update', (m: GameUpdateMessage) => {
      if (this.state && m.seq < (this as unknown as { lastSeq: number }).lastSeq) return;
      (this as unknown as { lastSeq: number }).lastSeq = m.seq;
      this.state = m.state;
      this.updates++;
      if (this.mirror) this.mirror.state = JSON.parse(JSON.stringify(m.state));
      if (this.autoplay) this.act();
    });
    room.onMessage('error', (m: { message: string }) => this.errors.push(m.message));
    room.onMessage('notice', (m: { text: string }) => this.notices.push(m.text));
  }
  act(): void {
    const core = this.mirror;
    const s = this.state;
    if (!core || !s || s.phase === 'ended') return;
    if (!core.pendingActors().includes(this.id)) return;
    let a: Action | null;
    if (s.phase === 'minigame' && s.minigame) {
      if (s.minigame.stage === 'intro') a = { type: 'minigameReady' };
      else {
        const g = getMiniGame(s.minigame.gameId);
        a = { type: 'minigameSubmit', log: runBot(g, s.minigame.seed, { playerIndex: s.order.indexOf(this.id), players: s.order.length }, 0.6, 3).log };
      }
    } else a = decide(core, this.id, this.rng) ?? core.fallbackAction(this.id);
    if (a) send(this.room, { type: 'game:action', action: a });
  }
}

beforeAll(async () => {
  srv = createGameServer({ timing: 'fast' });
  const port = 22000 + Math.floor(Math.random() * 3000);
  await srv.listen(port);
  url = `ws://localhost:${port}`;
});
afterAll(async () => {
  await srv.stop();
});

describe('Online-Mehrspieler (Colyseus)', () => {
  it('Lobby: Raumcode, Beitritt, Host-Rechte, Bots, Bereitschaft und Start', async () => {
    const a = new Client(url);
    const ra = await a.create<any>('partyverse', { name: 'Ada', character: 'pip' });
    const code = ra.roomId;
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{4}$/);
    const rb = await new Client(url).joinById<any>(code, { name: 'Ben', character: 'pip' });
    await until(() => ra.state.slots.size === 2, 3000, 'zwei Plätze');
    const slots = () => [...(ra.state.slots as Map<string, any>).values()];
    expect(slots().find((s) => s.name === 'Ada').host).toBe(true);
    expect(slots().find((s) => s.name === 'Ben').host).toBe(false);
    expect(slots().find((s) => s.name === 'Ben').character).not.toBe('pip'); // Figur schon vergeben → andere
    const ag = new Agent(rb);
    const errsA: string[] = [];
    ra.onMessage('error', (m: { message: string }) => errsA.push(m.message));
    // Nicht-Host darf nichts ändern
    send(rb, { type: 'lobby:config', rounds: 3 });
    send(rb, { type: 'lobby:addBot', difficulty: 'hard' });
    send(rb, { type: 'lobby:start' });
    await until(() => ag.errors.length >= 3, 3000, 'Fehlermeldungen für Nicht-Host');
    expect(ra.state.rounds).not.toBe(3);
    // Ungültige Nachrichten
    rb.send('msg', { type: 'boom' });
    rb.send('msg', 'kaputt');
    await until(() => ag.errors.length >= 5, 3000, 'ungültige Nachrichten');
    // Host konfiguriert, Bot hinzufügen, Start erst wenn alle bereit
    send(ra, { type: 'lobby:config', layoutId: 'nova-nexus-02', rounds: 2 });
    send(ra, { type: 'lobby:addBot', difficulty: 'normal' });
    await until(() => ra.state.slots.size === 3 && ra.state.layoutId === 'nova-nexus-02' && ra.state.rounds === 2, 3000, 'Konfiguration');
    const agA = new Agent(ra);
    send(ra, { type: 'lobby:start' });
    await until(() => errsA.length >= 1, 3000, 'Start ohne Bereitschaft abgelehnt');
    expect(ra.state.phase).toBe('lobby');
    send(rb, { type: 'lobby:ready', ready: true });
    await until(() => (slots().find((s) => s.name === 'Ben') ?? {}).ready === true, 3000, 'Ben bereit');
    send(ra, { type: 'lobby:start' });
    await until(() => ra.state.phase === 'playing', 3000, 'Spiel läuft');
    await until(() => !!agA.start && !!ag.start, 3000, 'Startnachricht');
    expect(agA.id).not.toBe(ag.id);
    expect(agA.start!.players.length).toBe(3);
    // Spiel durchspielen (beide Menschen automatisch über das Netz, Bot macht der Server)
    await until(() => agA.state?.phase === 'ended' && ag.state?.phase === 'ended', 60000, 'Spielende');
    expect(agA.state!.finale!.ranking).toEqual(ag.state!.finale!.ranking);
    expect(agA.state!.round).toBe(2);
    expect(agA.errors.filter((e) => !/Nicht alle Spieler sind bereit|Kein Minispiel|läuft kein Spiel|nicht am Zug/.test(e))).toEqual([]); // nur harmlose Wettläufe mit Server-Zeitgebern
    expect(ag.errors.filter((e) => !/Du bist nicht am Zug|nicht|Aktion/.test(e)).length).toBeLessThanOrEqual(5);
    await until(() => ra.state.phase === 'ended', 3000, 'Lobby-Phase ended');
    ra.leave();
    rb.leave();
  }, 90000);

  it('Server entscheidet: fremde Züge, manipulierte Protokolle und doppelte Aktionen werden abgelehnt', async () => {
    const ra = await new Client(url).create<any>('partyverse', { name: 'Eva' });
    const rb = await new Client(url).joinById<any>(ra.roomId, { name: 'Max' });
    await until(() => ra.state.slots.size === 2);
    const A = new Agent(ra);
    const B = new Agent(rb);
    A.autoplay = B.autoplay = false;
    send(rb, { type: 'lobby:ready', ready: true });
    send(ra, { type: 'lobby:config', rounds: 1 });
    await sleep(100);
    send(ra, { type: 'lobby:start' });
    await until(() => !!A.state && !!B.state, 5000, 'Zustand');
    const cur = A.state!.current;
    const [me, other] = cur === A.id ? [A, B] : [B, A];
    send(other.room, { type: 'game:action', action: { type: 'roll' } });
    await until(() => other.errors.length === 1, 3000, 'Fremdzug abgelehnt');
    expect(other.errors[0]).toMatch(/nicht am Zug/);
    const before = me.state!.version;
    send(me.room, { type: 'game:action', action: { type: 'roll' } });
    await until(() => me.state!.version > before, 3000, 'Zug ausgeführt');
    expect(me.state!.lastDice?.player).toBe(cur);
    expect(me.state!.lastDice!.total).toBeGreaterThanOrEqual(1);
    // Stand ist bei beiden identisch
    await sleep(100);
    expect(A.state!.version).toBe(B.state!.version);
    // Manipuliertes Minispiel-Ergebnis (falsches Protokoll) wird abgelehnt
    send(me.room, { type: 'game:action', action: { type: 'minigameSubmit', log: [0, 500, 0, 0, 0, 0] } });
    await until(() => me.errors.length >= 1, 3000, 'Minispiel-Manipulation abgelehnt');
    A.autoplay = B.autoplay = true;
    A.act();
    B.act();
    await until(() => A.state?.phase === 'ended', 60000, 'Ende');
    ra.leave();
    rb.leave();
  }, 90000);

  it('Wiederverbindung: Spieler kehrt nach Verbindungsabbruch zurück; sonst übernimmt ein Bot', async () => {
    const ra = await new Client(url).create<any>('partyverse', { name: 'Uli' });
    const rb = await new Client(url).joinById<any>(ra.roomId, { name: 'Tom' });
    await until(() => ra.state.slots.size === 2);
    const A = new Agent(ra);
    const B = new Agent(rb);
    A.autoplay = false;
    B.autoplay = false;
    send(rb, { type: 'lobby:ready', ready: true });
    send(ra, { type: 'lobby:config', rounds: 3 });
    await sleep(80);
    send(ra, { type: 'lobby:start' });
    await until(() => !!B.state && !!A.state, 5000, 'Start');
    const token = rb.reconnectionToken;
    const tomId = B.id;
    (rb as unknown as { connection: { close: () => void } }).connection.close(); // Verbindungsabbruch ohne Abmelden
    await until(() => [...(ra.state.slots as Map<string, any>).values()].find((s) => s.id === tomId)?.connected === false, 4000, 'getrennt erkannt');
    expect(A.notices.some((n) => /Verbindung verloren/.test(n))).toBe(true);
    const rb2 = await new Client(url).reconnect(token);
    const B2 = new Agent(rb2);
    B2.autoplay = false;
    await until(() => !!B2.state && !!B2.start, 4000, 'volle Synchronisierung nach Wiederverbindung');
    expect(B2.id).toBe(tomId);
    expect(B2.state!.version).toBe(A.state!.version);
    await until(() => [...(ra.state.slots as Map<string, any>).values()].find((s) => s.id === tomId)?.connected === true, 4000, 'wieder verbunden');
    // Zweiter Abbruch ohne Rückkehr: nach Ablauf übernimmt ein Bot
    (rb2 as unknown as { connection: { close: () => void } }).connection.close();
    await until(() => [...(ra.state.slots as Map<string, any>).values()].find((s) => s.id === tomId)?.kind === 'bot', 8000, 'Bot übernimmt');
    A.autoplay = true;
    A.act();
    await until(() => A.state?.phase === 'ended', 60000, 'Spiel endet auch ohne zweiten Menschen');
    ra.leave();
  }, 90000);

  it('Raum voll, Spiel läuft schon, öffentliche Räume und unbekannte Codes', async () => {
    const host = await new Client(url).create<any>('partyverse', { name: 'H', public: true });
    const list = await new Client(url).getAvailableRooms('partyverse');
    expect(list.some((r: any) => r.roomId === host.roomId && r.metadata.public === true)).toBe(true);
    const joined = [host];
    for (const n of ['B', 'C', 'D']) joined.push(await new Client(url).joinById<any>(host.roomId, { name: n }));
    await expect(new Client(url).joinById<any>(host.roomId, { name: 'E' })).rejects.toThrow(/voll|locked|gesperrt/i);
    await expect(new Client(url).joinById<any>('ZZZZ', { name: 'X' })).rejects.toThrow();
    const agents = joined.map((r) => new Agent(r));
    agents.forEach((a) => (a.autoplay = false));
    for (const r of joined.slice(1)) send(r, { type: 'lobby:ready', ready: true });
    send(host, { type: 'lobby:config', rounds: 1 });
    await sleep(120);
    send(host, { type: 'lobby:start' });
    await until(() => host.state.phase === 'playing', 4000, 'läuft');
    const priv = await new Client(url).create<any>('partyverse', { name: 'P' }); // privater Raum: nicht in der Liste
    const list2 = await new Client(url).getAvailableRooms('partyverse');
    expect(list2.some((r: any) => r.roomId === priv.roomId)).toBe(false);
    expect(list2.some((r: any) => r.roomId === host.roomId)).toBe(false); // gesperrt, weil Spiel läuft
    await expect(new Client(url).joinById<any>(host.roomId, { name: 'Spät' })).rejects.toThrow();
    joined.forEach((r) => r.leave());
    priv.leave();
  }, 60000);
});
