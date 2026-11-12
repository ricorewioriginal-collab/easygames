// Online-Tausch und Online-Kampf (reine Logik): Prüfung empfangener Daten,
// Tausch, und ein kompletter Kampf zwischen Gastgeber und gespiegeltem Gast.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { makeMonster, maxHp } from '../src/logic/monster.js';
import { newSave, validate } from '../src/logic/save.js';
import { createBattle, runTurn, replace, replaceFoe, activeMon, playerOptions, targetsFor } from '../src/logic/battle.js';
import * as L from '../src/logic/link.js';

const rng = createRng('link');
const save = (name, ids) => { const s = newSave({ name }); s.team = ids.map(id => makeMonster(id, 20, rng)); return s; };

test('Code, Begrüßung und Aussehen werden geprüft', () => {
  const c = L.newCode();
  assert.ok(L.isCode(c) && L.isCode(L.normCode(' ' + c.toLowerCase() + '-')));
  assert.ok(!L.isCode('ABC1O') && !L.isCode('ABCD'));
  const s = save('Rico<script>', ['glutzahn']);
  const h = L.cleanHello(L.hello(s));
  assert.equal(h.name, 'Ricoscript');
  assert.equal(L.cleanHello({ t: 'x' }), null);
  const look = L.cleanLook({ skin: 2, hair: 'bob', topColor: 'rot', evil: () => 1 }, { skin: 0, hair: 'spiky', topColor: 0x112233 });
  assert.deepEqual(look, { skin: 2, hair: 'bob', topColor: 0x112233 });
});

test('Tausch: empfangenes Taschi wird geprüft, letztes Team-Taschi bleibt', () => {
  const a = save('Ana', ['glutzahn']), b = save('Ben', ['plaetscher', 'samenling']);
  const offer = b.team[1]; offer.held = 'heilbeere'; offer.nick = 'Fuchsi';
  assert.ok(!L.canOffer(a, a.team[0]).ok, 'letztes Taschi');
  assert.ok(L.canOffer(b, offer).ok);
  const got = L.unpackMon(JSON.parse(JSON.stringify(L.packMon(offer))), { ot: 'Ben' });
  assert.equal(got.id, offer.id); assert.equal(got.nick, 'Fuchsi'); assert.equal(got.held, 'heilbeere'); assert.equal(got.ot, 'Ben');
  assert.notEqual(got.uid, offer.uid); assert.equal(got.hp, maxHp(got));
  assert.equal(L.unpackMon({ id: 'gibtsnicht', lv: 5 }), null);
  const bad = L.unpackMon({ id: 'glutzahn', lv: 9999, moves: [{ id: 'hack', pp: 99 }], iv: { hp: 99 } });
  assert.ok(bad.lv <= 70 && bad.moves.every(m => m.id !== 'hack') && bad.iv.hp <= 15);
  a.team.push(makeMonster('plaetscher', 5, rng));
  const mine = a.team[1];
  const r = L.applyTrade(a, mine, got);
  assert.ok(r.ok && a.team.includes(got) && !a.team.includes(mine) && a.dex[got.id] === 2 && a.stats.trades === 1);
  const v = validate(JSON.parse(JSON.stringify(a)));
  assert.ok(v && v.team.some(m => m.ot === 'Ben'), 'Spielstand bleibt gültig, Erst-Trainer bleibt');
  // aus dem Lager tauschen
  const boxed = makeMonster('plaetscher', 7, rng); a.box.push(boxed);
  assert.ok(L.applyTrade(a, boxed, L.unpackMon(L.packMon(b.team[0]))).ok && !a.box.includes(boxed) && a.box.length === 1);
});

test('Kampfteams: beide Geräte bauen dieselben Level-50-Kopien', () => {
  const s = save('Ana', ['glutzahn', 'plaetscher', 'samenling']);
  const list = JSON.parse(JSON.stringify(s.team.map(L.packMon)));
  const here = L.unpackTeam(s.team.map(L.packMon), 'h'), there = L.unpackTeam(list, 'h');
  assert.deepEqual(here.map(m => [m.uid, m.lv, m.hp]), there.map(m => [m.uid, m.lv, m.hp]));
  assert.ok(here.every(m => m.lv === 50 && m.uid.startsWith('h')));
  assert.equal(s.team[0].lv, 20, 'Original unverändert');
  assert.equal(L.unpackTeam([{ id: 'nix' }], 'g'), null);
});

// Gastgeber rechnet, Gast spiegelt: beide müssen am Ende denselben Stand sehen
test('Online-Kampf: kompletter Kampf mit Wechsel, Ersatz und Spiegelung', () => {
  const A = save('Ana', ['glutzahn', 'plaetscher', 'samenling']), B = save('Ben', ['samenling', 'glutzahn', 'plaetscher']);
  const la = A.team.map(L.packMon), lb = B.team.map(L.packMon);
  const hb = createBattle({ rng: createRng('pvp'), kind: 'trainer', pvp: true, canRun: false, canCatch: false, starUnlocked: true,
    player: { team: L.unpackTeam(la, 'h'), bag: {}, name: 'Ana' }, foe: { team: L.unpackTeam(lb, 'g'), trainer: true, name: 'Ben' } });
  const gb = createBattle({ rng: createRng('egal'), kind: 'trainer', pvp: true, canRun: false, canCatch: false, starUnlocked: true,
    player: { team: L.unpackTeam(lb, 'g'), bag: {}, name: 'Ben' }, foe: { team: L.unpackTeam(la, 'h'), trainer: true, name: 'Ana' } });
  const pickMove = (b) => { const o = playerOptions(b, 0); const mv = o.moves.find(x => !x.disabled && x.move.power > 0) || o.moves.find(x => !x.disabled); return [{ slot: 0, type: 'move', move: mv ? mv.id : 'verzweiflung', target: targetsFor(b, 0)[0] }]; };
  let turns = 0, switched = false, mirroredEnd = null, xp = 0;
  while (!hb.result && turns++ < 200) {
    if (hb.phase === 'replace') {
      for (const slot of [...hb.needReplace]) { const side = hb.sides[0]; replace(hb, slot, side.team.findIndex((m, i) => m.hp > 0 && !side.active.includes(i))); }
      // Gast wählt seinen Ersatz selbst (aus seiner Sicht Seite 0)
      assert.deepEqual(gb.needReplace, hb.foeReplace);
      for (const slot of [...hb.foeReplace]) { const side = gb.sides[0]; const idx = side.team.findIndex((m, i) => m.hp > 0 && !side.active.includes(i)); replaceFoe(hb, slot, idx); }
    } else {
      let guest = pickMove(gb);
      if (!switched && turns === 2) { guest = [{ slot: 0, type: 'switch', to: 2 }]; switched = true; }
      if (turns === 1) guest[0].star = true;
      const ev = runTurn(hb, pickMove(hb), L.cleanChoices(hb, 1, JSON.parse(JSON.stringify(guest))));
      xp += ev.filter(e => e.t === 'xp').length;
      if (turns === 1) assert.ok(ev.some(e => e.t === 'star' && e.side === 1), 'Gast darf die Sternstufe nutzen');
      if (turns === 2) assert.ok(ev.some(e => e.t === 'switchIn' && e.side === 1));
      const mirrored = L.mirrorEvents(JSON.parse(JSON.stringify(ev)), gb, { hostName: 'Ana' });
      if (turns === 2) assert.ok(mirrored.some(e => e.t === 'switchIn' && e.side === 0 && /^Los, /.test(e.text)), 'Gast sieht seinen Wechsel als eigenen');
      mirroredEnd = mirrored.find(e => e.t === 'end') || mirroredEnd;
    }
    L.applySnapshot(gb, JSON.parse(JSON.stringify(L.snapshot(hb))), true);
    // gespiegelter Stand stimmt
    for (let s = 0; s < 2; s++) assert.deepEqual(gb.sides[s].team.map(m => m.hp), hb.sides[1 - s].team.map(m => m.hp));
    assert.deepEqual(activeMon(gb, 0, 0)?.uid, activeMon(hb, 1, 0)?.uid);
  }
  assert.ok(hb.result, 'Kampf endet');
  assert.equal(xp, 0, 'keine EP im Online-Kampf');
  const flip = { win: 'lose', lose: 'win' }[hb.result.outcome];
  assert.equal(gb.result.outcome, flip);
  assert.equal(mirroredEnd.outcome, flip);
});

test('Online-Kampf: ungültige Wahl der Gegenseite wird ersetzt', () => {
  const A = save('Ana', ['glutzahn', 'plaetscher']), B = save('Ben', ['samenling', 'glutzahn']);
  const b = createBattle({ rng: createRng('x'), kind: 'trainer', pvp: true, player: { team: L.unpackTeam(A.team.map(L.packMon), 'h'), bag: {} }, foe: { team: L.unpackTeam(B.team.map(L.packMon), 'g'), trainer: true } });
  const c = L.cleanChoices(b, 1, [{ slot: 0, type: 'move', move: 'gibtsnicht' }, { slot: 0, type: 'switch', to: 0 }, { slot: 5 }, 'quatsch']);
  assert.equal(c.length, 1);
  assert.ok(activeMon(b, 1, 0).moves.some(m => m.id === c[0].move));
  assert.deepEqual(L.cleanChoices(b, 1, [{ slot: 0, type: 'switch', to: 1 }]), [{ slot: 0, type: 'switch', to: 1 }]);
  assert.deepEqual(L.cleanChoices(b, 1, null), []);
});
