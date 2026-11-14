// ZEITSPRUNG – eine Steuerung für alle Geräte. Erkennt automatisch, womit gerade gespielt wird:
// Touch/Maus, Tastatur, Gamepads (Xbox, PlayStation, Switch, Windows-App), Buzz!-Buzzer (USB/HID, bis zu 4 je Empfänger)
// und PlayStation Move (USB/HID). Alles mündet in dieselben Befehle: nav, ok, back, answer(0–3), play, swap, menu.
// Jeder Controller kann einem Spielerplatz zugeordnet werden (Buzzer-Runden: nur der Spieler am Zug antwortet).

const BUZZ_IDS = [{ vendorId: 0x054c, productId: 0x0002 }, { vendorId: 0x054c, productId: 0x1000 }];
const MOVE_IDS = [{ vendorId: 0x054c, productId: 0x03d5 }, { vendorId: 0x054c, productId: 0x0c5e }];
// Buzz!-Knöpfe je Buzzer: Rot (Buzzer), Gelb, Grün, Orange, Blau. Antworten von oben nach unten: Blau=A, Orange=B, Grün=C, Gelb=D
const BUZZ_ANSWER = { 4: 0, 3: 1, 2: 2, 1: 3 };

export function createInput({ onCommand, onKind = () => {}, onDevices = () => {} }) {
  let kind = matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse';
  const devices = new Map(); // key -> { key, type, label, player, leds? }
  const setKind = k => { if (k !== kind) { kind = k; onKind(k); } };
  const emit = (cmd, arg, dev) => onCommand(cmd, arg, dev ? devices.get(dev) || { key: dev } : null);
  const changed = () => onDevices([...devices.values()]);
  const ensure = (key, type, label) => { if (!devices.has(key)) { devices.set(key, { key, type, label, player: -1 }); changed(); } return devices.get(key); };

  // ---------- Tastatur, Maus, Touch ----------
  function keydown(e, fromShow = false) {
    if (e.target?.closest?.('input,textarea,select') && !['Escape', 'Enter'].includes(e.key)) return;
    setKind('keyboard');
    const k = e.key;
    const dir = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[k];
    if (dir) { if (!fromShow || !e.defaultPrevented) { emit('nav', dir, 'kbd'); e.preventDefault(); } return; }
    if (k === 'Escape' || k === 'Backspace') { emit('back', null, 'kbd'); e.preventDefault(); return; }
    if ((k === 'Enter' || k === ' ') && !fromShow) { if (!e.target?.closest?.('button,a,input,select')) { emit('ok', null, 'kbd'); e.preventDefault(); } return; }
    if (fromShow) return; // Buchstaben/Zahlen verarbeitet die Ausgabe selbst
    const i = 'abcd'.indexOf(k.toLowerCase()); if (i >= 0) { emit('answer', i, 'kbd'); return; }
    const n = '1234'.indexOf(k); if (n >= 0) emit('answer', n, 'kbd');
    if (k.toLowerCase() === 'm') emit('menu', null, 'kbd');
  }
  addEventListener('keydown', e => keydown(e));
  addEventListener('pointerdown', e => setKind(e.pointerType === 'touch' || e.pointerType === 'pen' ? 'touch' : 'mouse'), { capture: true, passive: true });
  function attachFrame(win) { try { win.addEventListener('keydown', e => keydown(e, true)); win.addEventListener('pointerdown', e => setKind(e.pointerType === 'touch' ? 'touch' : 'mouse'), { capture: true, passive: true }); } catch (_) {} }

  // ---------- Gamepads (Standard-Layout dank gamepad.js) ----------
  const prev = new Map(), repeat = new Map();
  const isBuzzPad = p => /buzz|054c.*(0002|1000)|vendor: 054c product: (0002|1000)/i.test(p.id);
  function pollPads(now) {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    for (const p of pads) {
      const key = 'pad' + p.index;
      if (isBuzzPad(p)) { pollBuzzPad(p); continue; }
      const b = p.buttons.map(x => x.pressed || x.value > .5);
      const ax = p.axes;
      const last = prev.get(key) || [];
      const down = i => b[i] && !last[i];
      const any = b.some(Boolean) || Math.abs(ax[0] || 0) > .6 || Math.abs(ax[1] || 0) > .6;
      if (any) { const d = ensure(key, 'pad', padLabel(p.id)); setKind(d.label.startsWith('PlayStation') ? 'playstation' : 'gamepad'); }
      if (down(0)) emit('ok', null, key);
      if (down(1)) emit('back', null, key);
      if (down(2)) emit('play', null, key);
      if (down(3)) emit('swap', null, key);
      if (down(9)) emit('menu', null, key);
      if (down(8)) emit('pair', null, key);
      if (down(4)) emit('prev', null, key);
      if (down(5)) emit('next', null, key);
      const dirs = { up: b[12] || ax[1] < -.6, down: b[13] || ax[1] > .6, left: b[14] || ax[0] < -.6, right: b[15] || ax[0] > .6 };
      for (const [d, on] of Object.entries(dirs)) {
        const rk = key + d, r = repeat.get(rk);
        if (on && !r) { emit('nav', d, key); repeat.set(rk, now + 380); }
        else if (on && now > r) { emit('nav', d, key); repeat.set(rk, now + 120); }
        else if (!on) repeat.delete(rk);
      }
      prev.set(key, b);
    }
  }
  // Buzz!-Empfänger, die sich als Gamepad melden: 20 Knöpfe, je Buzzer 5 (Rot, Gelb, Grün, Orange, Blau)
  function pollBuzzPad(p) {
    const key = 'buzzpad' + p.index, b = p.buttons.map(x => x.pressed), last = prev.get(key) || [];
    for (let i = 0; i < Math.min(20, b.length); i++) if (b[i] && !last[i]) buzzPress(`${key}:${Math.floor(i / 5)}`, i % 5, Math.floor(i / 5));
    prev.set(key, b);
  }
  function padLabel(id) {
    if (/054c|playstation|dualsense|dualshock|wireless controller/i.test(id)) return 'PlayStation-Controller';
    if (/045e|xbox|xinput/i.test(id)) return 'Xbox-Controller';
    if (/057e|switch|joy-con|pro controller/i.test(id)) return 'Switch-Controller';
    return 'Gamepad';
  }

  // ---------- Buzz! über WebHID ----------
  const hidDevices = new Set();
  function buzzPress(key, button, unit) {
    const d = ensure(key, 'buzz', `Buzzer ${unit + 1}`); setKind('buzz');
    if (button === 0) emit('buzzer', null, key);
    else emit('answer', BUZZ_ANSWER[button], key);
    flash(d);
  }
  function openBuzz(dev) {
    if (hidDevices.has(dev)) return; hidDevices.add(dev);
    const base = 'buzz' + [...hidDevices].indexOf(dev);
    let last = 0;
    dev.addEventListener('inputreport', e => {
      const v = e.data; if (v.byteLength < 5) return;
      const bits = v.getUint8(2) | (v.getUint8(3) << 8) | ((v.getUint8(4) & 0x0f) << 16);
      const pressed = bits & ~last; last = bits;
      for (let i = 0; i < 20; i++) if (pressed & (1 << i)) buzzPress(`${base}:${Math.floor(i / 5)}`, i % 5, Math.floor(i / 5));
    });
    for (let u = 0; u < 4; u++) { const d = ensure(`${base}:${u}`, 'buzz', `Buzzer ${u + 1}`); d.hid = dev; d.unit = u; }
    setKind('buzz'); setLights(dev, [1, 1, 1, 1]); setTimeout(() => setLights(dev, [0, 0, 0, 0]), 700);
  }
  const lightState = new WeakMap();
  function setLights(dev, on) { lightState.set(dev, on); try { dev.sendReport(0, new Uint8Array([0, on[0] ? 0xff : 0, on[1] ? 0xff : 0, on[2] ? 0xff : 0, on[3] ? 0xff : 0, 0, 0])); } catch (_) {} }
  function flash(d) { if (!d?.hid || d.type !== 'buzz') return; const s = [...(lightState.get(d.hid) || [0, 0, 0, 0])]; s[d.unit] = 1; setLights(d.hid, s); setTimeout(() => { s[d.unit] = 0; setLights(d.hid, s); }, 250); }

  // ---------- PlayStation Move über WebHID ----------
  function openMove(dev) {
    if (hidDevices.has(dev)) return; hidDevices.add(dev);
    const key = 'move' + [...hidDevices].indexOf(dev); const d = ensure(key, 'move', 'PS Move'); d.hid = dev;
    let last = 0;
    dev.addEventListener('inputreport', e => {
      const v = e.data; if (v.byteLength < 4) return;
      const bits = v.getUint8(0) | (v.getUint8(1) << 8) | (v.getUint8(2) << 16);
      const trig = v.byteLength > 4 ? v.getUint8(4) : 0;
      const now = bits | (trig > 160 ? 1 << 24 : 0), down = now & ~last; last = now;
      if (!down) return; setKind('move');
      // Bericht ohne ID (Protokoll wie psmoveapi): Byte 0 Select/Start, Byte 1 Dreieck 0x10, Kreis 0x20, Kreuz 0x40, Quadrat 0x80, Byte 2 PS 0x01, Move 0x08, T 0x10, Byte 4 Trigger analog
      if (down & (1 << 15)) emit('answer', 0, key);
      if (down & (1 << 12)) emit('answer', 1, key);
      if (down & (1 << 13)) emit('answer', 2, key);
      if (down & (1 << 14)) emit('answer', 3, key);
      if (down & (1 << 19)) emit('buzzer', null, key);
      if (down & ((1 << 20) | (1 << 24))) emit('play', null, key);
      if (down & ((1 << 16) | (1 << 3))) emit('menu', null, key);
    });
    setMoveColor(d, '#ffcf6e');
  }
  function setMoveColor(d, hex) {
    if (!d?.hid || d.type !== 'move') return;
    const n = parseInt(hex.slice(1), 16);
    d.color = hex; const r = new Uint8Array(48); r.set([0, (n >> 16) & 255, (n >> 8) & 255, n & 255]);
    try { d.hid.sendReport(6, r); } catch (_) {}
  }

  async function connectHid(which) {
    if (!navigator.hid) return { ok: false, reason: 'Dieser Browser kann keine USB-HID-Geräte öffnen. Bitte Chrome oder Edge am PC verwenden.' };
    try {
      const filters = which === 'move' ? MOVE_IDS : BUZZ_IDS;
      const list = await navigator.hid.requestDevice({ filters });
      for (const dev of list) { if (!dev.opened) await dev.open(); which === 'move' ? openMove(dev) : openBuzz(dev); }
      changed();
      return { ok: list.length > 0, reason: list.length ? '' : 'Kein Gerät ausgewählt.' };
    } catch (err) { return { ok: false, reason: String(err.message || err) }; }
  }
  // Bereits freigegebene Buzzer/Move automatisch wieder öffnen
  navigator.hid?.getDevices().then(async list => { for (const dev of list) { try { if (!dev.opened) await dev.open(); MOVE_IDS.some(f => f.productId === dev.productId) ? openMove(dev) : openBuzz(dev); } catch (_) {} } changed(); }).catch(() => {});
  navigator.hid?.addEventListener?.('disconnect', e => { for (const [k, d] of devices) if (d.hid === e.device) devices.delete(k); hidDevices.delete(e.device); changed(); });
  addEventListener('gamepaddisconnected', e => { devices.delete('pad' + e.gamepad.index); changed(); });

  // Die Move-Kugel geht ohne Auffrischung nach ein paar Sekunden aus
  setInterval(() => devices.forEach(d => { if (d.type === 'move' && d.color) setMoveColor(d, d.color); }), 3500);
  function loop(now) { pollPads(now); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);

  return {
    kind: () => kind,
    devices: () => [...devices.values()],
    assign(key, player) { const d = devices.get(key); if (d) { d.player = player; changed(); } },
    unassignAll() { devices.forEach(d => d.player = -1); changed(); },
    connectHid,
    attachFrame,
    hidSupported: () => !!navigator.hid,
    lights(player) { // Buzzer des Spielers am Zug leuchtet, Move-Kugel in Spielerfarbe
      const byHid = new Map();
      devices.forEach(d => { if (d.type === 'buzz' && d.hid) { const s = byHid.get(d.hid) || [0, 0, 0, 0]; s[d.unit] = d.player === player ? 1 : 0; byHid.set(d.hid, s); } });
      byHid.forEach((s, dev) => setLights(dev, s));
    },
    moveColor(key, hex) { setMoveColor(devices.get(key), hex); }
  };
}
