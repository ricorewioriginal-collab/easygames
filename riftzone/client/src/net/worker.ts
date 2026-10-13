/// <reference lib="webworker" />
// Offline-Server im Browser: führt das Match mit Bots in einem eigenen Thread aus.
import { TICK_RATE } from '../../../shared/src/constants';
import { MatchRoom, type RoomClient } from '../../../shared/src/room';
import { Terrain, decodeHeights, setTerrain } from '../../../shared/src/terrain';
import type { Cosmetics, MatchConfig } from '../../../shared/src/types';

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

self.onmessage = (ev: MessageEvent) => {
  const msg = ev.data as CreateMsg | { type: 'input'; data: ArrayBuffer } | { type: 'pause'; paused: boolean } | { type: 'leave' };
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
