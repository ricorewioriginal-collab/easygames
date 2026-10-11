import test from 'node:test';
import assert from 'node:assert/strict';
import { World, B } from '../src/world.js';
import { encodeEdits, decodeEdits } from '../src/storage.js';
import { NetHost, NetGuest, MAX_GUESTS, PROTO, splitText, parseMsg, cleanName } from '../src/net.js';

// Host und Gäste im selben Prozess, Nachrichten laufen über eine Warteschlange (wie ein DataChannel, nur sofort)
function setup(mode = 'survival') {
  const hw = new World(4242, null, 2), q = [];
  hw.ensure(0, 0); hw.ensure(-1, 0); hw.ensure(0, -1); hw.ensure(-1, -1);
  let clock = 1000;
  const host = new NetHost({
    world: hw, now: () => clock,
    info: () => ({ seed: 4242, gen: 2, mode, time: 0.3, edits: encodeEdits(hw.edits), pos: { x: 2, y: 40, z: 2 }, name: 'Host' }),
    onPlant() {}, onHit: () => [[1003, 1]], onJoin() {}, onLeave() {}
  });
  hw.onSet = (x, y, z, t) => host.queueBlock(x, y, z, t);
  const guest = name => {
    const g = { name, world: null, players: new Map(), rejected: [], bye: null, mobs: null, drops: null };
    let peer;
    g.net = new NetGuest({
      onWelcome: i => { g.world = new World(i.seed, decodeEdits(i.edits), i.gen); g.world.ensure(0, 0); g.info = i; },
      onBlocks: l => { for (const [x, y, z, t] of l) g.world.setBlock(x, y, z, t); },
      onPlayer: (id, p) => g.players.set(id, p), onLeft: id => g.players.delete(id),
      onMobs: l => { g.mobs = l; }, onHurt: m => { g.hurt = m; }, onDrops: l => { g.drops = l; }, onTime: t => { g.time = t; },
      onReject: c => g.rejected.push(...c), onBye: w => { g.bye = w; }
    }, text => q.push(() => host.receive(peer, text)), name);
    peer = host.addPeer(text => q.push(() => g.net.receive(text)));
    g.peer = peer;
    return g;
  };
  const pump = () => { for (let i = 0; i < 1e5 && q.length; i++) q.shift()(); };
  return { hw, host, guest, pump, q, tick: ms => { clock += ms; } };
}

test('Hilfsfunktionen: Teilen, Parsen, Namen', () => {
  assert.equal(splitText('x'.repeat(40000), 16000).length, 3);
  assert.deepEqual(splitText(''), ['']);
  assert.equal(parseMsg('kein json'), null);
  assert.equal(parseMsg('{"a":1}'), null);
  assert.equal(parseMsg('{"k":"pos"}').k, 'pos');
  assert.equal(cleanName('<b>Rico</b>!!'), 'bRicob');
  assert.equal(cleanName(''), 'Gast');
  assert.equal(cleanName('x'.repeat(40)).length, 16);
});

test('Beitreten: Gast bekommt dieselbe Welt mit allen Änderungen', () => {
  const s = setup();
  s.hw.setBlock(3, 50, 3, B.MARBLE); s.hw.setBlock(4, 50, 3, B.LAMP);
  s.hw.edits.get([...s.hw.edits.keys()][0]); // vorhanden
  const big = s.hw.getChunk(0, 0); for (let i = 0; i < 6000; i++) s.hw.setBlock(i % 16, 60 + (i >> 8) % 20, (i >> 4) % 16, B.GLASS); // große Weltdaten → mehrere Teile
  const g = s.guest('Lea'); g.net.hello(); s.pump();
  assert.ok(g.world, 'Welt angekommen');
  assert.equal(g.info.mode, 'survival');
  assert.ok(g.net.token && g.net.id === 1);
  for (const [x, y, z] of [[3, 50, 3], [4, 50, 3], [5, 61, 5], [0, 40, 0]]) assert.equal(g.world.getBlock(x, y, z), s.hw.getBlock(x, y, z));
  assert.ok(g.players.has(0), 'Host sichtbar');
  assert.ok(big);
});

test('Falsche Version und volle Welt werden abgewiesen', () => {
  const s = setup();
  const g = s.guest('X'); g.net.send(JSON.stringify({ k: 'hello', v: PROTO + 1, name: 'X' })); s.pump();
  assert.match(g.bye, /version/i);
  const list = [];
  for (let i = 0; i <= MAX_GUESTS; i++) { const h = s.guest('G' + i); h.net.hello(); list.push(h); }
  s.pump();
  assert.equal(s.host.peers.size, MAX_GUESTS);
  assert.match(list[MAX_GUESTS].bye, /voll/);
});

test('Blockänderungen: geprüft, verteilt, Doppel-Ernte verhindert', () => {
  const s = setup();
  const a = s.guest('A'), b = s.guest('B'); a.net.hello(); b.net.hello(); s.pump();
  const y = 45;
  s.hw.setBlock(2, y, 2, B.STONE); s.host.tick(0.016, { x: 0, y: 0, z: 0, yaw: 0 }, 0.3, []); s.pump();
  assert.equal(a.world.getBlock(2, y, 2), B.STONE);
  a.net.pos({ x: 2.5, y: y - 1, z: 4, yaw: 0, pitch: 0 }); b.net.pos({ x: 2.5, y: y - 1, z: 4, yaw: 0, pitch: 0 }); s.pump();
  // beide bauen denselben Block gleichzeitig ab (lokal schon passiert)
  a.world.setBlock(2, y, 2, B.AIR); a.net.local(2, y, 2, B.STONE, B.AIR); a.net.flush();
  b.world.setBlock(2, y, 2, B.AIR); b.net.local(2, y, 2, B.STONE, B.AIR); b.net.flush();
  s.pump(); s.host.tick(0.016, { x: 0, y: 0, z: 0, yaw: 0 }, 0.3, []); s.pump();
  assert.equal(s.hw.getBlock(2, y, 2), B.AIR);
  assert.equal(a.rejected.length, 0, 'erster gewinnt');
  assert.equal(b.rejected.length, 1, 'zweiter wird abgelehnt (keine doppelte Beute)');
  assert.deepEqual(b.rejected[0].slice(3), [B.STONE, B.AIR, B.AIR]);
  // Gast A setzt einen Block, B sieht ihn
  a.world.setBlock(3, y, 2, B.PLANKS); a.net.local(3, y, 2, B.AIR, B.PLANKS); a.net.flush();
  s.pump(); s.host.tick(0.016, { x: 0, y: 0, z: 0, yaw: 0 }, 0.3, []); s.pump();
  assert.equal(b.world.getBlock(3, y, 2), B.PLANKS);
  assert.equal(s.hw.getBlock(3, y, 2), B.PLANKS);
});

test('Manipulation: Reichweite, Token, Wasser bauen, Tempo, Position', () => {
  const s = setup();
  const a = s.guest('A'); a.net.hello(); s.pump();
  a.net.pos({ x: 2.5, y: 44, z: 4, yaw: 0, pitch: 0 }); s.pump();
  a.net.local(2, 44, 40, s.hw.getBlock(2, 44, 40), B.PLANKS); a.net.flush(); s.pump(); // zu weit weg
  assert.equal(a.rejected.length, 1);
  a.net.local(2, 46, 3, s.hw.getBlock(2, 46, 3), B.WATER); a.net.flush(); s.pump(); // kein Inventar-Block
  assert.equal(a.rejected.length, 2);
  const before = s.hw.getBlock(2, 46, 3);
  s.host.receive(a.peer, JSON.stringify({ k: 'sets', r: 99, list: [[2, 46, 3, before, B.PLANKS]], tk: 'falsch' })); // fremdes Token
  assert.equal(s.hw.getBlock(2, 46, 3), before);
  // Teleport über 500 Blöcke wird nicht übernommen
  s.tick(100); a.net.pos({ x: 600, y: 44, z: 4, yaw: 0, pitch: 0 }); s.pump();
  assert.equal(a.peer.pos.x, 2.5);
  // Rate: höchstens 64 auf einmal im Überleben
  const list = [];
  for (let i = 0; i < 100; i++) { const x = (i % 8), z = 1 + (i >> 3) % 6, y = 47 + (i >> 6); list.push([x, y, z, s.hw.getBlock(x, y, z), B.PLANKS]); }
  for (const c of list) a.net.local(...c);
  a.net.flush(); s.pump();
  assert.ok(a.rejected.length >= 2 + 30, 'Rate begrenzt: ' + a.rejected.length);
});

test('Tiere, Treffer, Beute, Schaden, Uhrzeit, Verlassen', () => {
  const s = setup();
  const a = s.guest('A'), b = s.guest('B'); a.net.hello(); b.net.hello(); s.pump();
  const mobs = [{ id: 7, type: 2, x: 3, y: 40, z: 3, yaw: 0, hurtT: 0, moving: true }, { id: 8, type: 6, x: 300, y: 40, z: 3, yaw: 0, hurtT: 0, npc: true, role: 'bauer', name: 'Frieda' }];
  for (let i = 0; i < 12; i++) s.host.tick(0.1, { x: 1, y: 40, z: 1, yaw: 0 }, 0.42, mobs);
  s.pump();
  assert.equal(a.mobs.length, 1, 'nur Tiere in der Nähe');
  assert.equal(a.mobs[0][0], 7);
  assert.equal(a.time, 0.42);
  a.net.hit(7, 3); s.pump();
  assert.deepEqual(a.drops, [[1003, 1]]);
  s.host.hurt(a.net.id, 2, 'Rauschling', [1, 40, 1]); s.pump();
  assert.equal(a.hurt.dmg, 2);
  assert.ok(b.players.has(a.net.id));
  s.host.close(a.peer); s.pump();
  assert.ok(!b.players.has(a.net.id), 'Gast verschwindet bei den anderen');
  assert.equal(s.host.peers.size, 1);
});

test('Verbindungs-Codes: packen und entpacken, fremde Codes werden erkannt', async () => {
  const { pack, unpack } = await import('../src/rtc.js');
  const sdp = 'v=0\r\n' + 'a=candidate:1 1 udp 2113937151 192.0.2.2 48119 typ host\r\n'.repeat(20);
  const code = await pack({ t: 'o', sdp });
  assert.ok(code.startsWith('KF1.'));
  assert.ok(code.length < sdp.length, 'gepackt kürzer: ' + code.length);
  assert.deepEqual(await unpack(' ' + code.slice(0, 30) + '\n' + code.slice(30) + ' '), { t: 'o', sdp }, 'Zeilenumbrüche beim Kopieren schaden nicht');
  await assert.rejects(unpack('hallo'), /kein KlotzFunk-Code/);
});
