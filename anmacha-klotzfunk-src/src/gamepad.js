// Controller: Erkennung (Xbox, PlayStation, Switch), Tastennamen, frei belegbare Tasten, Menü-Navigation und Vibration.
// Alle Controller kommen über das Standard-Layout der Gamepad-API: Tasten sind nach ihrer Lage nummeriert (0 = unten, 1 = rechts …).
export const PB = { S: 0, E: 1, W: 2, N: 3, LB: 4, RB: 5, LT: 6, RT: 7, SEL: 8, START: 9, L3: 10, R3: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15, HOME: 16 };
export const PAD_BUTTONS = 16; // 0..15 belegbar, die Home-Taste (16) gehört dem System

export function padStyle(id = '') {
  const s = String(id).toLowerCase();
  if (/054c|playstation|dualsense|dualshock|ps[345]\b|ps[345] controller/.test(s)) return 'ps';
  if (/057e|nintendo|switch|pro controller|joy-?con/.test(s)) return 'switch';
  if (/045e|xbox|xinput|x-box/.test(s)) return 'xbox';
  return 'generic';
}
// Beschriftung je Lage. Switch: unten B, rechts A (wie auf dem Controller aufgedruckt)
const LABELS = {
  xbox: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Ansicht', 'Menü', 'LS', 'RS', '✚↑', '✚↓', '✚←', '✚→', 'Xbox'],
  ps: ['✕', '○', '□', '△', 'L1', 'R1', 'L2', 'R2', 'Create', 'Options', 'L3', 'R3', '✚↑', '✚↓', '✚←', '✚→', 'PS'],
  switch: ['B', 'A', 'Y', 'X', 'L', 'R', 'ZL', 'ZR', '−', '+', 'LS', 'RS', '✚↑', '✚↓', '✚←', '✚→', 'Home']
};
LABELS.generic = LABELS.xbox;
export const STYLE_NAMES = { xbox: 'Xbox-Controller', ps: 'PlayStation-Controller', switch: 'Switch-Controller', generic: 'Controller' };
export const padLabel = (style, i) => (LABELS[style] || LABELS.xbox)[i] ?? 'Taste ' + i;
// Menüs: bestätigen/zurück. Bei Nintendo bestätigt man mit A (rechts), sonst mit der unteren Taste
export const confirmBtn = style => style === 'switch' ? PB.E : PB.S;
export const backBtn = style => style === 'switch' ? PB.S : PB.E;

// Belegbare Aktionen im Spiel: [Id, Name, Standard-Taste]
export const PAD_ACTIONS = [
  ['jump', 'Springen / Hoch', PB.S], ['sneak', 'Schleichen / Runter', PB.E], ['hook', 'Seilhaken', PB.W], ['inv', 'Inventar', PB.N],
  ['prev', 'Hotbar links', PB.LB], ['next', 'Hotbar rechts', PB.RB], ['place', 'Setzen / Benutzen', PB.LT], ['break', 'Abbauen / Angreifen', PB.RT],
  ['map', 'Weltkarte', PB.SEL], ['pause', 'Pause', PB.START], ['sprint', 'Rennen', PB.L3], ['undo', 'Rückgängig (Kreativ)', PB.R3],
  ['fly', 'Fliegen (Kreativ)', PB.UP], ['wp', 'Wegpunkt', PB.DOWN], ['build', 'Bauform', PB.LEFT], ['quests', 'Aufträge ein/aus', PB.RIGHT]
];
export const DEFAULT_PAD = Object.fromEntries(PAD_ACTIONS.map(a => [a[0], a[2]]));

// Gespeicherte Belegung prüfen: ungültige oder doppelte Tasten fallen auf den Standard zurück
export function padBinds(saved) {
  const out = { ...DEFAULT_PAD };
  if (!saved || typeof saved !== 'object') return out;
  for (const [a] of PAD_ACTIONS) { const v = saved[a]; if (Number.isInteger(v) && v >= 0 && v < PAD_BUTTONS) out[a] = v; }
  const seen = new Set();
  for (const [a] of PAD_ACTIONS) { if (seen.has(out[a])) out[a] = DEFAULT_PAD[a]; seen.add(out[a]); }
  return new Set(Object.values(out)).size === PAD_ACTIONS.length ? out : { ...DEFAULT_PAD };
}
// Neue Taste für eine Aktion; die Aktion, die sie vorher hatte, bekommt die alte Taste (Tausch)
export function padRebind(binds, action, btn) {
  if (!(action in binds) || !Number.isInteger(btn) || btn < 0 || btn >= PAD_BUTTONS) return null;
  const out = { ...binds }, other = Object.keys(out).find(a => out[a] === btn);
  if (other && other !== action) out[other] = out[action];
  out[action] = btn;
  return out;
}

export const deadzone = (v, d = 0.18) => Math.abs(v) < d ? 0 : (v - Math.sign(v) * d) / (1 - d);
// Gamepad-Zustand → Sticks, gehaltene und frisch gedrückte Aktionen (prev: Tasten des letzten Abrufs)
export function readPad(pad, prev, binds = DEFAULT_PAD, dead = 0.18) {
  const ax = i => deadzone(pad.axes[i] || 0, dead), btn = i => { const b = pad.buttons[i]; return !!b && (b.pressed || b.value > 0.5); };
  const now = pad.buttons.map((_, i) => btn(i)), held = {}, hit = {};
  for (const a in binds) { const i = binds[a]; held[a] = !!now[i]; hit[a] = !!now[i] && !prev[i]; }
  return { r: ax(0), f: -ax(1), lx: ax(2), ly: ax(3), held, hit, buttons: now };
}

// Räumliche Menü-Navigation: von Rechteck cur aus das nächste Ziel in Richtung dir (up|down|left|right); -1 = keins
export function navPick(rects, cur, dir) {
  const c = rects[cur]; if (!c) return rects.length ? 0 : -1;
  const cx = c.x + c.w / 2, cy = c.y + c.h / 2, vert = dir === 'up' || dir === 'down', sg = dir === 'down' || dir === 'right' ? 1 : -1;
  let best = -1, bs = Infinity;
  rects.forEach((r, i) => {
    if (i === cur) return;
    const rx = r.x + r.w / 2, ry = r.y + r.h / 2;
    // Abstand entlang der Richtung (Kante zu Kante) und quer dazu (Überlappung zählt als 0)
    const along = vert ? (sg > 0 ? r.y - (c.y + c.h) : c.y - (r.y + r.h)) : (sg > 0 ? r.x - (c.x + c.w) : c.x - (r.x + r.w));
    const center = vert ? (ry - cy) * sg : (rx - cx) * sg;
    if (center <= 1 || along < -Math.min(c.h, c.w) / 2) return;
    const cross = vert ? Math.max(0, Math.max(r.x, c.x) - Math.min(r.x + r.w, c.x + c.w)) : Math.max(0, Math.max(r.y, c.y) - Math.min(r.y + r.h, c.y + c.h));
    const s = Math.max(0, along) + cross * 2.5;
    if (s < bs) { bs = s; best = i; }
  });
  return best;
}

// Vibration (Rumble). Chrome/Edge: vibrationActuator, Firefox: hapticActuators. Fehlt beides, passiert nichts.
export const FEEL = {
  break: [0.2, 0.45, 55], place: [0, 0.22, 30], hurt: [0.85, 0.6, 200], deny: [0.05, 0.18, 40], done: [0.35, 0.7, 260], hook: [0.15, 0.35, 70]
};
export function rumble(pad, kind, strength = 1) {
  const f = FEEL[kind]; if (!pad || !f || !(strength > 0)) return false;
  const k = Math.min(1, strength), [s, w, ms] = f;
  try {
    const va = pad.vibrationActuator;
    if (va && va.playEffect) { const p = va.playEffect('dual-rumble', { startDelay: 0, duration: ms, strongMagnitude: s * k, weakMagnitude: w * k }); if (p && p.catch) p.catch(() => {}); return true; }
    const h = pad.hapticActuators && pad.hapticActuators[0];
    if (h && h.pulse) { const p = h.pulse(Math.max(s, w) * k, ms); if (p && p.catch) p.catch(() => {}); return true; }
  } catch (e) { /* Controller ohne Vibration */ }
  return false;
}
