// Switch-Controllerbelegung, getragene Gegenstände und Angeln.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAD_LAYOUTS, DEFAULT_PAD, ACTIONS, padButtons, migratePad, glyph } from '../src/core/input.js';
import { ITEMS, HELD_IDS, shopStock } from '../src/data/items.js';
import { createRng } from '../src/core/rng.js';
import { makeMonster, maxHp } from '../src/logic/monster.js';
import { createBattle, runTurn } from '../src/logic/battle.js';
import * as Items from '../src/logic/items.js';
import { rollFishing, judgeBite, BITE_WINDOW } from '../src/logic/encounters.js';
import { buildLayout, fishingWater, HALF } from '../src/logic/layout.js';
import { SPECIES } from '../src/data/species.js';
import { validate, newSave } from '../src/logic/save.js';

test('Switch-Layout: A rechts bestätigt, B unten zurück, X/+ Menü, Y rennt', () => {
  assert.equal(DEFAULT_PAD, PAD_LAYOUTS.switch);
  const sw = PAD_LAYOUTS.switch;
  assert.equal(glyph('nintendo', sw.confirm), 'A');
  assert.equal(glyph('nintendo', sw.back), 'B');
  assert.deepEqual(padButtons(sw.menu).map(i => glyph('nintendo', i)), ['X', '+']);
  assert.equal(glyph('nintendo', sw.run), 'Y');
  for (const layout of Object.values(PAD_LAYOUTS)) {
    const used = ACTIONS.flatMap(a => padButtons(layout[a]));
    assert.equal(new Set(used).size, used.length, 'jede Taste nur einmal belegt');
    for (const a of ['up', 'down', 'left', 'right', 'confirm', 'back', 'menu']) assert.ok(padButtons(layout[a]).length, a);
  }
});

test('alte Standardbelegung wird Switch, eigene Belegung bleibt', () => {
  assert.equal(migratePad({ pad: { ...PAD_LAYOUTS.xbox } }).padLayout, 'switch');
  const fresh = migratePad({}); assert.equal(fresh.padLayout, 'switch'); assert.equal(fresh.pad, undefined);
  const own = migratePad({ pad: { ...PAD_LAYOUTS.xbox, confirm: 3, team: 0 } });
  assert.equal(own.padLayout, 'custom'); assert.equal(own.pad.confirm, 3);
  assert.equal(migratePad({ padLayout: 'xbox', pad: { confirm: 0 } }).padLayout, 'xbox');
});

const duel = (me, foe, seed = 'held') => createBattle({ rng: createRng(seed), kind: 'wild', player: { team: [me], bag: {} }, foe: { team: [foe] }, canRun: false });

test('Tragen: geben, tauschen, abnehmen; im Laden kaufbar; Spielstand behält es', () => {
  const rng = createRng('give');
  const m = makeMonster('blitzi', 10, rng), bag = { heilbeere: 1, lernband: 1 };
  assert.ok(Items.giveHeld(bag, m, 'heilbeere').ok && m.held === 'heilbeere' && !bag.heilbeere);
  assert.ok(Items.giveHeld(bag, m, 'lernband').ok && m.held === 'lernband' && bag.heilbeere === 1);
  assert.ok(!Items.giveHeld(bag, m, 'trank').ok);
  assert.ok(Items.takeHeld(bag, m).ok && !m.held && bag.lernband === 1);
  assert.ok(HELD_IDS.length >= 5 && HELD_IDS.every(id => shopStock(16).includes(id)));
  const s = newSave({ name: 'Test' }); m.held = 'kraftband'; s.team = [m];
  const clean = validate(JSON.parse(JSON.stringify(s)));
  assert.equal(clean.team[0].held, 'kraftband');
  s.team[0].held = 'trank';
  assert.equal(validate(JSON.parse(JSON.stringify(s))).team[0].held, undefined);
});

test('Heilbeere heilt unter halben KP und wird verbraucht', () => {
  const rng = createRng('berry');
  // Heilbeere: nach einem Treffer unter 50 % wird geheilt
  for (let k = 0; k < 20; k++) {
    const me = makeMonster('blitzi', 12, rng), foe = makeMonster('glutzahn', 14, rng);
    me.held = 'heilbeere'; me.hp = Math.floor(maxHp(me) * 0.55);
    const b = duel(me, foe, 'b' + k);
    const ev = runTurn(b, [{ type: 'move', move: me.moves[0].id, slot: 0 }]);
    const ate = ev.find(e => e.t === 'heal' && e.uid === me.uid);
    if (ate) { assert.equal(me.held, undefined); return; }
  }
  assert.fail('Heilbeere hat nie gewirkt');
});

test('Klarbeere heilt Status sofort, Haltegurt rettet bei vollen KP', () => {
  const rng = createRng('clear');
  let cured = false;
  for (let k = 0; k < 20 && !cured; k++) {
    const me = makeMonster('blitzi', 12, rng), foe = makeMonster('samenling', 12, rng);
    me.held = 'klarbeere'; foe.moves = [{ id: 'sporenwolke', pp: 15 }];
    const ev = runTurn(duel(me, foe, 'c' + k), [{ type: 'move', move: me.moves[0].id, slot: 0 }]);
    if (ev.some(e => e.t === 'status' && e.uid === me.uid)) { cured = true; assert.ok(ev.some(e => e.t === 'cure' && e.uid === me.uid)); assert.equal(me.status, null); assert.equal(me.held, undefined); }
  }
  assert.ok(cured, 'Klarbeere nie geprüft');
  const strong = makeMonster('glutzahn', 70, rng), weak = makeMonster('blitzi', 5, rng);
  let saved = false;
  for (let k = 0; k < 20 && !saved; k++) {
    weak.hp = maxHp(weak); weak.held = 'fokusband';
    const ev = runTurn(duel(weak, strong, 'f' + k), [{ type: 'move', move: weak.moves[0].id, slot: 0 }]);
    if (ev.some(e => e.t === 'text' && /Haltegurt/.test(e.text))) { saved = true; assert.equal(weak.held, undefined); }
  }
  assert.ok(saved, 'Haltegurt hat nie gewirkt');
});

test('Lernband gibt 50 % mehr EP', () => {
  const xpOf = (held) => {
    const rng = createRng('xp');
    const me = makeMonster('glutzahn', 40, rng), foe = makeMonster('blitzi', 8, rng);
    if (held) me.held = 'lernband';
    const b = duel(me, foe, 'xp');
    const ev = runTurn(b, [{ type: 'move', move: me.moves.find(x => (x.pp > 0)).id, slot: 0 }]);
    return ev.filter(e => e.t === 'xp').reduce((a, e) => a + e.amount, 0);
  };
  const plain = xpOf(false), banded = xpOf(true);
  assert.ok(plain > 0);
  assert.ok(Math.abs(banded - Math.floor(plain * 1.5)) <= 1, plain + ' → ' + banded);
});

test('Angeln: Anbiss-Zeitfenster und Wasser-Taschis', () => {
  assert.equal(judgeBite(900, 1000), 'early');
  assert.equal(judgeBite(1000 + BITE_WINDOW - 1, 1000), 'hit');
  assert.equal(judgeBite(1000 + BITE_WINDOW + 1, 1000), 'late');
  const rng = createRng('fish');
  let wet = 0, n = 0;
  for (let r = 0; r < 16; r++) for (let i = 0; i < 20; i++, n++) {
    const sp = SPECIES[rollFishing(r, rng).id];
    if (['wasser', 'eis'].includes(sp.type) || ['wasser', 'eis'].includes(sp.type2)) wet++;
  }
  assert.ok(wet / n > 0.7, 'meist Wasser-Taschis: ' + wet + '/' + n);
  let regions = 0;
  for (let r = 0; r < 16; r++) {
    const L = buildLayout(r); let hit = false;
    for (let x = -HALF; x < HALF && !hit; x += 3) for (let z = -HALF; z < HALF && !hit; z += 3) if (fishingWater(L, x, z)) hit = true;
    if (hit) regions++;
    assert.ok(!L.water.some(w => w.kind === 'lava' && fishingWater({ water: [w] }, w.pts[0][0], w.pts[0][1])), 'keine Lava');
  }
  assert.ok(regions >= 8, 'Angelplätze in ' + regions + ' Regionen');
});
