import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Lobby, type Socket } from '../server/src/lobby';
import { loadConfig } from '../server/src/config';
import { PROTOCOL_VERSION } from '../shared/src/constants';
import { decodeFrame, encodeInputs } from '../shared/src/protocol';
import { sharedTerrain } from './helpers';

interface Fake extends Socket {
  out: (string | ArrayBuffer)[];
  closed: boolean;
  json(t: string): Record<string, unknown>[];
}

function fake(): Fake {
  const s: Fake = {
    out: [],
    closed: false,
    send(d) {
      s.out.push(d);
    },
    close() {
      s.closed = true;
    },
    buffered: () => 0,
    json(t) {
      return s.out.filter((x): x is string => typeof x === 'string').map((x) => JSON.parse(x) as Record<string, unknown>).filter((m) => m.t === t);
    },
  };
  return s;
}

const id = (n: number): string => n.toString(16).padStart(24, '0');

function setup(): { lobby: Lobby; tick: (sec: number) => void } {
  sharedTerrain();
  const cfg = { ...loadConfig({}), queueWait: 0, publicSize: 12, minHumans: 1, maxMatches: 4, snapshotEvery: 2 };
  const lobby = new Lobby(cfg, null);
  // Takt von Hand
  const tick = (sec: number): void => {
    for (let i = 0; i < sec * 30; i++) for (const r of lobby.rooms) r.step();
    (lobby as unknown as { everySecond: () => void }).everySecond();
  };
  return { lobby, tick };
}

function join(lobby: Lobby, n: number, name: string): { s: Fake; c: ReturnType<Lobby['connect']> } {
  const s = fake();
  const c = lobby.connect(s);
  lobby.onText(c, JSON.stringify({ t: 'hello', v: PROTOCOL_VERSION, id: id(n), name, cos: { outfit: 3 }, level: 5 }));
  return { s, c };
}

test('Server: Anmeldung prüft Version und ID', () => {
  const { lobby } = setup();
  const s = fake();
  const c = lobby.connect(s);
  lobby.onText(c, JSON.stringify({ t: 'hello', v: 1, id: id(1) }));
  assert.ok(s.closed);
  const s2 = fake();
  const c2 = lobby.connect(s2);
  lobby.onText(c2, JSON.stringify({ t: 'hello', v: PROTOCOL_VERSION, id: 'kaputt' }));
  assert.ok(s2.closed);
  const a = join(lobby, 3, 'Alex<script>');
  assert.equal(a.s.json('welcome').length, 1);
  assert.equal(a.c.name, 'Alexscript');
});

test('Server: Gruppe bilden, bereit melden, gemeinsam ins Duo-Match', () => {
  const { lobby, tick } = setup();
  const a = join(lobby, 10, 'Anna');
  const b = join(lobby, 11, 'Ben');
  lobby.onText(a.c, JSON.stringify({ t: 'party.create' }));
  const code = a.s.json('party')[0]!.code as string;
  assert.match(code, /^[A-Z2-9]{5}$/);
  lobby.onText(b.c, JSON.stringify({ t: 'party.join', code }));
  assert.equal((b.s.json('party').at(-1)!.members as unknown[]).length, 2);
  // Nicht bereit → Fehler
  lobby.onText(a.c, JSON.stringify({ t: 'queue', teamSize: 2, build: true }));
  assert.ok(a.s.json('error').length > 0);
  lobby.onText(b.c, JSON.stringify({ t: 'party.ready', ready: true }));
  lobby.onText(a.c, JSON.stringify({ t: 'queue', teamSize: 2, build: true }));
  tick(1);
  assert.equal(lobby.rooms.size, 1);
  const room = [...lobby.rooms][0]!;
  assert.equal(room.match.players.length, 12);
  const pa = room.playerFor(id(10))!,
    pb = room.playerFor(id(11))!;
  assert.equal(pa.team, pb.team, 'Gruppe nicht im selben Team');
  assert.equal(a.s.json('start').length, 1);
  assert.equal(b.s.json('sync').length, 1);
  // Frames kommen binär an
  tick(1);
  const frames = a.s.out.filter((x): x is ArrayBuffer => typeof x !== 'string');
  assert.ok(frames.length > 0);
  const f = decodeFrame(frames.at(-1)!)!;
  assert.ok(f.self);
  assert.ok(f.players.some((p) => p.id === pb.id), 'Teamkamerad fehlt im Zustand');
});

test('Server: Verbindungsabbruch – KI übernimmt, Wiederverbindung übernimmt die Figur wieder', () => {
  const { lobby, tick } = setup();
  const a = join(lobby, 20, 'Cleo');
  lobby.onText(a.c, JSON.stringify({ t: 'queue', teamSize: 1, build: false }));
  tick(1);
  const room = [...lobby.rooms][0]!;
  assert.equal(room.match.cfg.build, false);
  const p = room.playerFor(id(20))!;
  lobby.disconnect(a.c);
  assert.equal(p.bot, true);
  tick(2);
  const a2 = join(lobby, 20, 'Cleo');
  assert.equal(a2.s.json('welcome')[0]!.reconnect, room.id);
  assert.equal(a2.s.json('matchFound').length, 1);
  assert.equal(p.bot, false);
  // Eingaben werden angenommen
  lobby.onBinary(a2.c, encodeInputs([{ seq: p.lastSeq + 1, mx: 0, mz: 1, yaw: 0, pitch: 0, buttons: 0, actions: [], viewTick: 0 }]));
  tick(0.2);
  assert.ok(p.lastSeq >= 1);
});

test('Server: private Lobby mit Code, Host startet', () => {
  const { lobby } = setup();
  const h = join(lobby, 30, 'Host');
  const g = join(lobby, 31, 'Gast');
  lobby.onText(h.c, JSON.stringify({ t: 'private.create', cfg: { teamSize: 4, build: true, maxPlayers: 8, fillBots: true, botSkill: 2 } }));
  const code = (h.s.json('private')[0]!.lobby as { code: string }).code;
  lobby.onText(g.c, JSON.stringify({ t: 'private.join', code }));
  lobby.onText(g.c, JSON.stringify({ t: 'private.start' })); // Gast darf nicht starten
  assert.equal(lobby.rooms.size, 0);
  lobby.onText(h.c, JSON.stringify({ t: 'private.start' }));
  assert.equal(lobby.rooms.size, 1);
  const room = [...lobby.rooms][0]!;
  assert.equal(room.match.cfg.teamSize, 4);
  assert.equal(room.match.players.length, 8);
  assert.equal(room.match.cfg.botSkill, 2);
});

test('Server: Ratenbegrenzung und kaputte Nachrichten', () => {
  const { lobby } = setup();
  const a = join(lobby, 40, 'Dora');
  for (let i = 0; i < 100; i++) lobby.onText(a.c, JSON.stringify({ t: 'party.create' }));
  assert.ok(a.s.json('party').length <= 30);
  lobby.onText(a.c, '{kaputt');
  lobby.onText(a.c, 'x'.repeat(10000));
  lobby.onBinary(a.c, new ArrayBuffer(5));
  assert.ok(true);
});
