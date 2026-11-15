import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS, DEFAULT_KEYS, keyBinds, rebind, actionOf, keyName } from '../src/controls.js';
import { PB, readPad, deadzone, padStyle, padLabel, padBinds, padRebind, DEFAULT_PAD, PAD_ACTIONS, navPick, rumble, confirmBtn, backBtn } from '../src/gamepad.js';

test('Tastenbelegung: Standard, Prüfung gespeicherter Werte, Tausch bei doppelter Taste', () => {
  assert.equal(new Set(Object.values(DEFAULT_KEYS)).size, ACTIONS.length);
  assert.deepEqual(keyBinds(null), DEFAULT_KEYS);
  const b = keyBinds({ fwd: 'KeyI', map: 'Escape', inv: 'Digit3', foo: 'KeyX', hook: 42, jump: 'KeyI' });
  assert.equal(b.fwd, 'KeyI'); assert.equal(b.map, 'KeyM'); assert.equal(b.inv, 'KeyE'); assert.equal(b.hook, 'KeyQ');
  assert.equal(b.jump, 'Space'); // doppelte Taste fällt auf den Standard zurück
  assert.equal(new Set(Object.values(keyBinds({ fwd: 'KeyE', inv: 'KeyW' }))).size, ACTIONS.length);
  const r = rebind(DEFAULT_KEYS, 'fwd', 'KeyE');
  assert.equal(r.fwd, 'KeyE'); assert.equal(r.inv, 'KeyW'); // getauscht
  assert.equal(DEFAULT_KEYS.fwd, 'KeyW'); // Original unverändert
  assert.equal(rebind(DEFAULT_KEYS, 'fwd', 'Escape'), null);
  assert.equal(rebind(DEFAULT_KEYS, 'nix', 'KeyK'), null);
  assert.equal(actionOf(r, 'KeyE'), 'fwd'); assert.equal(actionOf(r, 'KeyK'), null);
  assert.equal(keyName('KeyW'), 'W'); assert.equal(keyName('Space'), 'Leertaste'); assert.equal(keyName('F5'), 'F5');
});

test('Controller: Totzone, Sticks, gehaltene und frisch gedrückte Aktionen', () => {
  assert.equal(deadzone(0.1), 0); assert.equal(deadzone(1), 1); assert.ok(deadzone(-0.6) < -0.4); assert.equal(deadzone(0.25, 0.3), 0);
  const btns = n => Array.from({ length: 17 }, (_, i) => ({ pressed: n.includes(i), value: n.includes(i) ? 1 : 0 }));
  const pad = { axes: [0.05, -1, 0.5, 0], buttons: btns([PB.S, PB.N, PB.RT]) };
  const a = readPad(pad, []);
  assert.equal(a.r, 0); assert.equal(a.f, 1); assert.ok(a.lx > 0.3);
  assert.ok(a.held.jump && a.hit.inv && a.held.break && !a.held.place && !a.hit.pause);
  const b = readPad(pad, a.buttons);
  assert.ok(b.held.jump && !b.hit.inv); // gehalten: Sprung ja, Inventar nur einmal
  const c = readPad(pad, [], padRebind(DEFAULT_PAD, 'jump', PB.N)); // Sprung auf die obere Taste gelegt, Inventar bekommt die untere
  assert.ok(c.held.jump && c.held.inv && c.held.sneak === false); // Inventar liegt nach dem Tausch unten
});

test('Controller: Erkennung und Beschriftung für Xbox, PlayStation und Switch', () => {
  assert.equal(padStyle('Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)'), 'xbox');
  assert.equal(padStyle('DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'), 'ps');
  assert.equal(padStyle('054c-09cc-Wireless Controller'), 'ps');
  assert.equal(padStyle('Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)'), 'switch');
  assert.equal(padStyle('USB Gamepad'), 'generic');
  assert.equal(padLabel('ps', PB.S), '✕'); assert.equal(padLabel('ps', PB.N), '△'); assert.equal(padLabel('ps', PB.LT), 'L2');
  assert.equal(padLabel('switch', PB.S), 'B'); assert.equal(padLabel('switch', PB.E), 'A'); assert.equal(padLabel('switch', PB.RT), 'ZR');
  assert.equal(padLabel('xbox', PB.START), 'Menü'); assert.equal(padLabel('generic', PB.W), 'X');
  assert.equal(confirmBtn('switch'), PB.E); assert.equal(backBtn('switch'), PB.S); assert.equal(confirmBtn('ps'), PB.S); assert.equal(backBtn('xbox'), PB.E);
});

test('Controller-Belegung: alle 16 Tasten belegt, Prüfung, Tausch', () => {
  assert.equal(new Set(Object.values(DEFAULT_PAD)).size, PAD_ACTIONS.length);
  assert.equal(PAD_ACTIONS.length, 16);
  assert.deepEqual(padBinds(null), DEFAULT_PAD);
  const b = padBinds({ jump: 3, inv: 0, hook: 16, map: 'x', foo: 5 });
  assert.equal(b.jump, 3); assert.equal(b.inv, 0); assert.equal(b.hook, PB.W); assert.equal(b.map, PB.SEL);
  assert.equal(padBinds({ jump: 3 }).jump, DEFAULT_PAD.jump); // doppelt mit Inventar: Standard
  const r = padRebind(DEFAULT_PAD, 'jump', PB.RT);
  assert.equal(r.jump, PB.RT); assert.equal(r.break, PB.S); // getauscht
  assert.equal(padRebind(DEFAULT_PAD, 'jump', 16), null); assert.equal(padRebind(DEFAULT_PAD, 'nix', 2), null);
  assert.equal(DEFAULT_PAD.jump, PB.S);
});

test('Menü-Navigation: räumlich nach Richtung', () => {
  // 3×2 Raster: 0 1 2 / 3 4 5
  const R = [0, 1, 2, 3, 4, 5].map(i => ({ x: (i % 3) * 100, y: Math.floor(i / 3) * 50, w: 90, h: 40 }));
  assert.equal(navPick(R, 0, 'right'), 1); assert.equal(navPick(R, 1, 'down'), 4); assert.equal(navPick(R, 4, 'left'), 3);
  assert.equal(navPick(R, 5, 'up'), 2); assert.equal(navPick(R, 2, 'right'), -1); assert.equal(navPick(R, 0, 'up'), -1);
  assert.equal(navPick(R, 9, 'down'), 0); assert.equal(navPick([], 0, 'down'), -1);
  // breiter Knopf darunter: von rechts oben nach unten trifft ihn trotzdem
  assert.equal(navPick([{ x: 0, y: 0, w: 50, h: 20 }, { x: 200, y: 0, w: 50, h: 20 }, { x: 0, y: 40, w: 300, h: 20 }], 1, 'down'), 2);
});

test('Vibration: Chrome-, Firefox-Schnittstelle und ohne', () => {
  const calls = [];
  assert.ok(rumble({ vibrationActuator: { playEffect: (t, o) => { calls.push([t, o]); return Promise.resolve(); } } }, 'hurt', 0.5));
  assert.equal(calls[0][0], 'dual-rumble'); assert.ok(calls[0][1].strongMagnitude <= 0.5 && calls[0][1].duration > 0);
  assert.ok(rumble({ hapticActuators: [{ pulse: (v, ms) => { calls.push([v, ms]); return Promise.resolve(); } }] }, 'break', 1));
  assert.equal(calls.length, 2);
  assert.equal(rumble({}, 'hurt', 1), false); assert.equal(rumble(null, 'hurt', 1), false);
  assert.equal(rumble({ vibrationActuator: { playEffect: () => calls.push(1) } }, 'hurt', 0), false); // aus
  assert.equal(calls.length, 2);
});
