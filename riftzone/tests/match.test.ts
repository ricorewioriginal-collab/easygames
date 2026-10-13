import { test } from 'node:test';
import assert from 'node:assert/strict';
import { botThink } from '../shared/src/bot';
import { Match } from '../shared/src/match';
import { MatchRoom, type RoomClient } from '../shared/src/room';
import { World } from '../shared/src/world';
import { generateWorld } from '../shared/src/worldgen';
import { Mode, Phase, defaultConfig, defaultCosmetics } from '../shared/src/types';
import { decodeFrame, encodeInputs, decodeInputs } from '../shared/src/protocol';
import { computePlacement, findUnsupported, makeBuilt } from '../shared/src/building';
import { Mat } from '../shared/src/pieces';
import { flatTerrain, sharedTerrain } from './helpers';
import { ZONE_PHASES, newZone, stepZone } from '../shared/src/zone';
import { Rng } from '../shared/src/math';
import { challengesFor, levelFromXp, xpForLevel } from '../shared/src/progression';

function botMatch(teamSize: 1 | 2 | 4, players: number, seed: number): Match {
  const w = new World(sharedTerrain());
  const c = generateWorld(w);
  const m = new Match(defaultConfig({ seed, teamSize, maxPlayers: players, zoneScale: 0.4 }), w, c);
  for (let i = 0; i < players; i++) m.addPlayer('B' + i, Math.floor(i / teamSize), true, defaultCosmetics());
  m.botThink = botThink;
  m.start();
  while (m.phase !== Phase.Ended && m.tick < 30 * 900) m.step();
  return m;
}

test('Bot-Match (Solo) endet mit genau einem Sieger und eindeutigen Plätzen', () => {
  const m = botMatch(1, 30, 7);
  assert.equal(m.phase, Phase.Ended);
  const winners = m.results.filter((r) => r.won);
  assert.equal(winners.length, 1);
  const places = new Set(m.results.map((r) => r.place));
  assert.equal(places.size, 30);
  assert.ok(m.results.some((r) => r.kills > 0), 'niemand hat jemanden ausgeschaltet');
});

test('Bot-Match (Duo) wertet Teams gemeinsam', () => {
  const m = botMatch(2, 20, 11);
  assert.equal(m.phase, Phase.Ended);
  const byTeam = new Map<number, Set<number>>();
  for (const r of m.results) {
    const s = byTeam.get(r.team) ?? new Set();
    s.add(r.place);
    byTeam.set(r.team, s);
  }
  for (const s of byTeam.values()) assert.equal(s.size, 1, 'Team hat unterschiedliche Plätze');
  assert.equal(m.results.filter((r) => r.won).length, 2);
});

test('Protokoll: Eingaben und Spielzustand überstehen Kodierung', () => {
  const inp = [{ seq: 42, mx: 0.5, mz: -1, yaw: 1.25, pitch: -0.3, buttons: 9, actions: [123456], viewTick: 99.5 }];
  const back = decodeInputs(encodeInputs(inp))!;
  assert.equal(back[0]!.seq, 42);
  assert.ok(Math.abs(back[0]!.mx - 0.5) < 0.01);
  assert.equal(back[0]!.actions[0], 123456);
  assert.equal(back[0]!.viewTick, 99.5);
  // Manipulierte Daten werden abgewiesen
  assert.equal(decodeInputs(new ArrayBuffer(3)), null);
  const huge = new Uint8Array(2000);
  huge[0] = 1;
  assert.equal(decodeInputs(huge.buffer), null);
});

test('Raum: Client erhält Start, Sync und Frames; Eingaben bewegen die Figur', () => {
  const room = new MatchRoom('t', defaultConfig({ seed: 3, maxPlayers: 4, fillBots: true }), [{ key: 'me', name: 'Ich', cos: defaultCosmetics(), party: 'me' }], 1);
  const msgs: (string | ArrayBuffer)[] = [];
  const client: RoomClient = { send: (d) => msgs.push(d), playerId: 0, spectate: 0, connected: true, rate: 0, rateT: 0 };
  assert.ok(room.attach('me', client, false));
  assert.equal(JSON.parse(msgs[0] as string).t, 'start');
  assert.equal(JSON.parse(msgs[1] as string).t, 'sync');
  const me = room.playerFor('me')!;
  // Warten, bis die Fähre über der Insel ist, dann abspringen
  for (let i = 0; i < 30 * 60 && !room.match.canJump(); i++) room.step();
  room.onBinary(me.id, encodeInputs([{ seq: 1, mx: 0, mz: 0, yaw: 0, pitch: 0, buttons: 1, actions: [], viewTick: 0 }]));
  room.step();
  assert.equal(me.body.mode, Mode.Freefall);
  const f = decodeFrame(msgs[msgs.length - 1] as ArrayBuffer)!;
  assert.equal(f.self!.body.mode, Mode.Freefall);
  assert.equal(f.ack, 1);
  assert.ok(f.players.length >= 0);
});

test('Bauen: Rasterplatzierung und Einsturz ohne Halt', () => {
  const w = new World(flatTerrain(10));
  const floor = computePlacement(1, 102, 10, 102, 0, 0); // Boden vor dem Spieler (Blick -z)
  assert.equal(floor.kind, 12);
  const wallA = makeBuilt(computePlacement(0, 102, 10, 102, 0, 0), Mat.Wood, 0);
  w.add(wallA);
  // Boden auf Wandhöhe, nur von der Wand gehalten
  const top = makeBuilt({ ...floor, y: 14 - 0.15, key: 'x' }, Mat.Wood, 0);
  top.z = wallA.z - 2;
  w.add(top);
  assert.deepEqual(findUnsupported(w, 100, 100), []);
  w.remove(wallA.id);
  assert.deepEqual(findUnsupported(w, 100, 100), [top.id]);
});

test('Zone schrumpft über alle Phasen auf 0', () => {
  const z = newZone();
  const rng = new Rng(5);
  const t = sharedTerrain();
  let guard = 0;
  while (z.phase < ZONE_PHASES.length && guard++ < 30 * 2000) stepZone(z, 1 / 30, 0.2, rng, t);
  assert.equal(z.phase, ZONE_PHASES.length);
  assert.equal(z.r, 0);
});

test('Fortschritt: Stufen und Herausforderungen', () => {
  assert.equal(levelFromXp(0).level, 1);
  assert.equal(levelFromXp(xpForLevel(1)).level, 2);
  const a = challengesFor(new Date('2026-10-13T10:00:00Z')),
    b = challengesFor(new Date('2026-10-13T20:00:00Z'));
  assert.deepEqual(a.map((c) => c.id), b.map((c) => c.id));
  assert.equal(a.length, 5);
});
