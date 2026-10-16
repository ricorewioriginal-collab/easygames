/// <reference lib="webworker" />
// Offline-Server im Browser: führt das Match mit Bots in einem eigenen Thread aus.
import { TICK_RATE } from '../../../shared/src/constants';
import { MatchRoom, type RoomClient } from '../../../shared/src/room';
import { Terrain, decodeHeights, setTerrain } from '../../../shared/src/terrain';
import type { Cosmetics, MatchConfig } from '../../../shared/src/types';
import { Lobby, type Conn, type LobbyConfig } from '../../../server/src/lobby';

declare const self: DedicatedWorkerGlobalScope;

let room: MatchRoom | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let paused = false;

interface CreateMsg {
  type: 'create';
  cfg: MatchConfig;
  name: string;
  cos: Cosmetics;
  heights: ArrayBuffer | null;
}

// ---- Spiel ohne Server: dieses Gerät ist der Server (gleiche Lobby wie server/src), Verbindungen kommen über p2p.ts ----
type HostMsg =
  | { type: 'host'; heights: ArrayBuffer | null; cfg: LobbyConfig }
  | { type: 'hopen'; id: number }
  | { type: 'hdata'; id: number; data: string | ArrayBuffer }
  | { type: 'hgone'; id: number };
let lobby: Lobby | null = null;
const conns = new Map<number, Conn>();

function onHost(msg: HostMsg): void {
  if (msg.type === 'host') {
    if (msg.heights) setTerrain(new Terrain(decodeHeights(new Uint16Array(msg.heights))));
    lobby = new Lobby(msg.cfg, null);
    lobby.start();
    return;
  }
  if (!lobby) return;
  if (msg.type === 'hopen') {
    const id = msg.id;
    conns.set(
      id,
      lobby.connect({
        // Kein Transfer: dasselbe Paket geht oft an mehrere Spieler
        send: (d) => self.postMessage({ type: 'hsend', id, data: d }),
        close: (code, reason) => self.postMessage({ type: 'hclose', id, code, reason }),
        buffered: () => 0, // Überlastschutz macht p2p.ts direkt am Datenkanal
      }),
    );
  } else if (msg.type === 'hdata') {
    const c = conns.get(msg.id);
    if (!c) return;
    if (typeof msg.data === 'string') lobby.onText(c, msg.data);
    else lobby.onBinary(c, msg.data);
  } else if (msg.type === 'hgone') {
    const c = conns.get(msg.id);
    conns.delete(msg.id);
    if (c) lobby.disconnect(c);
  }
}

self.onmessage = (ev: MessageEvent) => {
  const msg = ev.data as CreateMsg | HostMsg | { type: 'input'; data: ArrayBuffer } | { type: 'pause'; paused: boolean } | { type: 'leave' };
  if (msg.type === 'host' || msg.type === 'hopen' || msg.type === 'hdata' || msg.type === 'hgone') return onHost(msg);
  if (msg.type === 'create') {
    if (msg.heights) setTerrain(new Terrain(decodeHeights(new Uint16Array(msg.heights))));
    room = new MatchRoom('lokal', msg.cfg, [{ key: 'me', name: msg.name, cos: msg.cos, party: 'me' }], 1);
    const client: RoomClient = {
      send: (d) => {
        if (typeof d === 'string') self.postMessage(d);
        else self.postMessage(d, [d]);
      },
      playerId: 0,
      spectate: 0,
      connected: true,
      rate: 0,
      rateT: 0,
    };
    room.attach('me', client, false);
    start();
  } else if (msg.type === 'input') {
    if (room) {
      const c = [...room.clients.keys()][0];
      if (c !== undefined) room.onBinary(c, msg.data);
    }
  } else if (msg.type === 'pause') {
    paused = msg.paused;
  } else if (msg.type === 'leave') {
    lobby?.stop();
    lobby = null;
    if (timer) clearInterval(timer);
    timer = null;
    room = null;
    self.close();
  }
};

function start(): void {
  const step = 1000 / TICK_RATE;
  let acc = 0;
  let last = performance.now();
  timer = setInterval(() => {
    const now = performance.now();
    acc += Math.min(250, now - last);
    last = now;
    if (paused || !room) {
      acc = 0;
      return;
    }
    let n = 0;
    while (acc >= step && n < 4) {
      room.step();
      acc -= step;
      n++;
      // Nach Matchende noch etwas weiterlaufen lassen (Zuschauen), dann stoppen
      if (room.ended && room.match.time - room.endedAt > 30) {
        if (timer) clearInterval(timer);
        timer = null;
        return;
      }
    }
    if (n === 4) acc = 0;
  }, step / 2);
}
