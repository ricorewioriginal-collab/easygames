// Eingabe: Tastatur, Gamecontroller (Standard-Layout) und Touch – ein Satz Aktionen für alle Geräte.
// Konsolen-Schema: 4 Aktionstasten (Ollie unten, Flip links, Grab rechts, Grind oben), Schultertasten drehen,
// hintere Schultertasten Revert. Manual = Richtungsfolge Hoch→Runter (Nose Manual: Runter→Hoch).
// Aktionen: ollie, flip, grab, grind, manual (aus der Richtungsfolge), spinL, spinR, revert, pause, goals
const KEYS = {
  Space: 'ollie', Enter: 'ollie', NumpadEnter: 'ollie',
  KeyJ: 'flip', KeyK: 'grab', KeyL: 'grind',
  KeyQ: 'spinL', KeyE: 'spinR', KeyR: 'revert', ShiftLeft: 'revert', ShiftRight: 'revert', Escape: 'pause', KeyP: 'pause', Tab: 'goals', KeyG: 'goals'
};
const PAD = { 0: 'ollie', 2: 'flip', 1: 'grab', 3: 'grind', 4: 'spinL', 5: 'spinR', 6: 'revert', 7: 'revert', 9: 'pause', 8: 'goals' };
const ACTIONS = ['ollie', 'flip', 'grab', 'grind', 'manual', 'spinL', 'spinR', 'revert', 'pause', 'goals'];

export class Input {
  constructor() {
    this.keys = new Set(); this.touch = {}; this.touchStick = { x: 0, y: 0, id: null };
    this.prev = {}; this.cur = {}; this.x = 0; this.y = 0; this.rx = 0; this.ry = 0;
    this.lastDevice = 'keys'; this.enabled = false;
    this.seq = { zone: 0, since: 0, last: 0, lastEnd: -9 }; this.manualDir = 'd'; this.manualPulse = false;
    addEventListener('keydown', e => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      this.keys.add(e.code); this.lastDevice = 'keys';
      if (this.enabled && (KEYS[e.code] || /Arrow/.test(e.code))) e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => { this.keys.clear(); this.touch = {}; });
  }
  bindTouch(root) {
    // Stick: linke Bildschirmhälfte, schwebend
    const stick = root.querySelector('#tStick'), knob = root.querySelector('#tKnob');
    const zone = root.querySelector('#tZone');
    const ts = this.touchStick;
    const setKnob = () => { knob.style.transform = `translate(${ts.x * 42}px, ${-ts.y * 42}px)`; };
    zone.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      ts.id = e.pointerId; ts.cx = e.clientX; ts.cy = e.clientY; zone.setPointerCapture(e.pointerId);
      stick.style.left = (e.clientX - 60) + 'px'; stick.style.top = (e.clientY - 60) + 'px'; stick.classList.add('on');
      this.lastDevice = 'touch'; document.documentElement.classList.add('touch');
    });
    zone.addEventListener('pointermove', e => {
      if (e.pointerId !== ts.id) return;
      let dx = (e.clientX - ts.cx) / 50, dy = -(e.clientY - ts.cy) / 50; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
      ts.x = dx; ts.y = dy; setKnob();
    });
    const end = e => { if (e.pointerId !== ts.id) return; ts.id = null; ts.x = ts.y = 0; setKnob(); stick.classList.remove('on'); };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
    for (const b of root.querySelectorAll('[data-act]')) {
      const a = b.dataset.act;
      b.addEventListener('pointerdown', e => { e.preventDefault(); this.touch[a] = true; b.classList.add('down'); this.lastDevice = 'touch'; if (e.isTrusted) document.documentElement.classList.add('touch'); try { b.setPointerCapture(e.pointerId); } catch (_) {} });
      const up = () => { this.touch[a] = false; b.classList.remove('down'); };
      b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    }
  }
  pad() {
    const ps = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of ps) if (p && p.connected && p.buttons.length >= 12) return p;
    return null;
  }
  poll() {
    this.prev = this.cur; const c = {};
    for (const a of ACTIONS) c[a] = false;
    for (const k of this.keys) { const a = KEYS[k]; if (a) c[a] = true; }
    let x = 0, y = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) x -= 1;
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) x += 1;
    if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) y += 1;
    if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) y -= 1;
    for (const a in this.touch) if (this.touch[a]) c[a] = true;
    if (this.touchStick.id != null) { x += this.touchStick.x; y += this.touchStick.y; }
    this.rx = this.ry = 0;
    const p = this.pad();
    if (p) {
      const dz = v => Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82;
      const ax = dz(p.axes[0] || 0), ay = dz(p.axes[1] || 0);
      if (ax || ay) { x += ax; y -= ay; this.lastDevice = 'pad'; }
      this.rx = dz(p.axes[2] || 0); this.ry = dz(p.axes[3] || 0);
      const b = i => p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > 0.5);
      if (b(12)) y += 1; if (b(13)) y -= 1; if (b(14)) x -= 1; if (b(15)) x += 1;
      for (const i in PAD) if (b(+i)) { c[PAD[i]] = true; this.lastDevice = 'pad'; }
    }
    const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
    this.x = x; this.y = y;
    // Manual als Richtungsfolge: kurz Hoch, dann Runter (Manual) bzw. kurz Runter, dann Hoch (Nose Manual)
    const now = performance.now() / 1000, q = this.seq, z = y > 0.6 ? 1 : y < -0.6 ? -1 : 0;
    this.manualPulse = false;
    if (z !== q.zone) {
      if (q.zone !== 0) { q.last = q.zone; q.lastEnd = now; q.lastLen = now - q.since; }
      if (z !== 0 && q.last === -z && now - q.lastEnd < 0.28 && q.lastLen < 0.4) { this.manualPulse = true; this.manualDir = z < 0 ? 'd' : 'u'; q.last = 0; }
      q.zone = z; q.since = now;
    }
    c.manual = this.manualPulse;
    this.cur = c;
  }
  down(a) { return !!this.cur[a]; }
  pressed(a) { return !!this.cur[a] && !this.prev[a]; }
  released(a) { return !this.cur[a] && !!this.prev[a]; }
  clear() { this.keys.clear(); this.touch = {}; this.prev = {}; this.cur = {}; }
}
