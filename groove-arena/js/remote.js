/* Groove Arena – Bewegungs-Controller über WebHID: Wii-Remote (auch über die Mayflash DolphinBar im Modus 4 oder per Bluetooth)
 * und Joy-Con / Pro Controller (Switch). Die Beschleunigung geht in denselben Verlauf wie der Handy-Sensor (GASense.Motion),
 * die Wertung bleibt also gleich. Nur Chrome/Edge am PC und die Windows-App (WebHID); auf Handys bleibt Kamera bzw. Handy-Sensor.
 *   GARemote.supported()  → WebHID vorhanden?
 *   GARemote.connect()    → Auswahlfenster des Browsers (nur nach einem Klick), gekoppelte Controller verbinden
 *   GARemote.list()       → [{ name, kind, active }]; GARemote.onChange = fn
 * Zum Testen: GARemote._wii(DataView) / GARemote._joy(DataView) rechnen einen Eingabe-Bericht in m/s² (ohne Erdanziehung) um. */
(function () {
  'use strict';
  const NINTENDO = 0x057e, G = 9.81;
  const WII = [0x0306, 0x0330], JOY = { 0x2006: 'Joy-Con (L)', 0x2007: 'Joy-Con (R)', 0x2009: 'Pro Controller' };
  const devs = new Map();   // HIDDevice → { name, kind, last }
  const R = { onChange: null };
  const hid = () => (typeof navigator !== 'undefined' && navigator.hid) || null;
  R.supported = () => !!hid();

  // Wii-Remote, Bericht 0x31 (Tasten + Beschleunigung): Bytes 2–4 = X/Y/Z (8 Bit, Ruhe ≈ 0x80, ≈ 0x19 je g)
  function wii(dv) {
    if (dv.byteLength < 5) return null;
    const x = (dv.getUint8(2) - 0x80) / 0x19, y = (dv.getUint8(3) - 0x80) / 0x19, z = (dv.getUint8(4) - 0x80) / 0x19;
    return Math.abs(Math.hypot(x, y, z) - 1) * G;
  }
  // Joy-Con / Pro Controller, Bericht 0x30 (volle Rate): Bewegungsdaten ab Byte 12 (ohne Berichts-Nr.), 3 Proben à 6 × int16 (Beschl. X/Y/Z, Gyro X/Y/Z), 0,000244 g je Stufe
  function joy(dv) {
    if (dv.byteLength < 48) return null;
    let s = 0;
    for (let k = 0; k < 3; k++) { const o = 12 + k * 12, x = dv.getInt16(o, true) * 0.000244, y = dv.getInt16(o + 2, true) * 0.000244, z = dv.getInt16(o + 4, true) * 0.000244; s += Math.abs(Math.hypot(x, y, z) - 1) * G; }
    return s / 3;
  }
  R._wii = wii; R._joy = joy;

  function push(m) {
    const M = window.GASense && window.GASense.Motion; if (!M || m == null || !isFinite(m)) return;
    const t = performance.now() / 1000; M.buf.push({ t, m }); M.last = t; M.on = true; if (M.buf.length > 600) M.buf.splice(0, 200);
  }
  let joyCount = 0;
  async function joySub(d, cmd, arg) {   // Unterbefehl über Bericht 0x01 (Zähler, neutrale Vibration, Befehl, Wert)
    const b = new Uint8Array(48); b[0] = (joyCount++) & 0xf; b.set([0x00, 0x01, 0x40, 0x40, 0x00, 0x01, 0x40, 0x40], 1); b[9] = cmd; b[10] = arg;
    await d.sendReport(0x01, b);
  }
  async function setup(d) {
    if (devs.has(d)) return;
    if (!d.opened) await d.open();
    const wiiDev = WII.includes(d.productId), info = { name: wiiDev ? 'Wii-Remote' : (JOY[d.productId] || d.productName || 'Controller'), kind: wiiDev ? 'wii' : 'joy', last: 0, active: devs.size === 0 };
    devs.set(d, info);
    d.addEventListener('inputreport', e => {
      const m = info.kind === 'wii' ? (e.reportId === 0x31 ? wii(e.data) : null) : (e.reportId === 0x30 ? joy(e.data) : null);
      if (m == null) return; info.last = performance.now();
      if (info.active) push(m);   // ein Tänzer: der erste Controller zählt (weitere als Ersatz)
    });
    try {
      if (wiiDev) {
        await d.sendReport(0x11, new Uint8Array([0x10]));         // LED 1 an (zeigt: verbunden)
        await d.sendReport(0x12, new Uint8Array([0x04, 0x31]));   // Daten dauerhaft senden, Modus 0x31 (Tasten + Beschleunigung)
      } else {
        await joySub(d, 0x40, 0x01);   // Bewegungssensor an
        await joySub(d, 0x03, 0x30);   // volle Rate (Bericht 0x30)
        await joySub(d, 0x30, 0x01);   // Spieler-LED 1
      }
    } catch (e) { /* manche Nachbauten antworten nicht – Daten kommen trotzdem, sonst zeigt die Liste „keine Daten“ */ }
    if (R.onChange) R.onChange();
  }
  R.connect = async function () {
    const H = hid(); if (!H) throw new Error('nohid');
    const sel = await H.requestDevice({ filters: [{ vendorId: NINTENDO }] });
    for (const d of sel) await setup(d);
    return R.list();
  };
  // Schon einmal freigegebene Controller (z. B. DolphinBar) beim Start automatisch verbinden
  R.restore = async function () { const H = hid(); if (!H || !H.getDevices) return []; for (const d of await H.getDevices()) if (d.vendorId === NINTENDO) await setup(d).catch(() => { }); return R.list(); };
  R.list = () => [...devs.values()].map(i => ({ name: i.name, kind: i.kind, active: i.active, live: performance.now() - i.last < 1500 }));
  R.any = () => devs.size > 0;
  if (hid()) hid().addEventListener('disconnect', e => { const i = devs.get(e.device); if (!i) return; devs.delete(e.device); if (i.active) { const n = devs.values().next(); if (!n.done) n.value.active = true; } if (R.onChange) R.onChange(); });
  window.GARemote = R;
})();
