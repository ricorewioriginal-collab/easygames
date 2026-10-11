import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS, DEFAULT_KEYS, keyBinds, rebind, actionOf, keyName, readPad, deadzone, PAD } from '../src/controls.js';

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

test('Gamepad: Totzone, Sticks und Tastenflanken', () => {
  assert.equal(deadzone(0.1), 0); assert.equal(deadzone(1), 1); assert.ok(deadzone(-0.6) < -0.4);
  const btns = n => Array.from({ length: 17 }, (_, i) => ({ pressed: n.includes(i), value: n.includes(i) ? 1 : 0 }));
  const pad = { axes: [0.05, -1, 0.5, 0], buttons: btns([PAD.A, PAD.Y, PAD.RT]) };
  const a = readPad(pad, []);
  assert.equal(a.r, 0); assert.equal(a.f, 1); assert.ok(a.lx > 0.3);
  assert.ok(a.jump && a.inv && a.breakHeld && !a.placeHeld && !a.pause);
  const b = readPad(pad, a.buttons);
  assert.ok(b.jump && !b.inv); // gehalten: Sprung ja, Inventar nur einmal
});
