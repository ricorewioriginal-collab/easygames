// Trick-Tabellen. Richtung: 'n' neutral, 'u','d','l','r','ul','ur','dl','dr'.
// Board-Drehungen: roll = Längsachse (Flip), yaw = Hochachse (Shove-It), pitch = Querachse (Impossible).
export const FLIPS = {
  n: { name: 'Kickflip', pts: 100, dur: 0.48, roll: 1, yaw: 0, pitch: 0 },
  l: { name: 'Heelflip', pts: 100, dur: 0.48, roll: -1, yaw: 0, pitch: 0 },
  r: { name: 'Pop Shove-It', pts: 100, dur: 0.42, roll: 0, yaw: 0.5, pitch: 0 },
  u: { name: 'Impossible', pts: 175, dur: 0.55, roll: 0, yaw: 0, pitch: 1 },
  d: { name: '360 Shove-It', pts: 200, dur: 0.55, roll: 0, yaw: 1, pitch: 0 },
  ul: { name: 'Varial Kickflip', pts: 200, dur: 0.55, roll: 1, yaw: 0.5, pitch: 0 },
  ur: { name: 'Hardflip', pts: 250, dur: 0.55, roll: 1, yaw: 0, pitch: 0.5 },
  dl: { name: '360 Flip', pts: 300, dur: 0.62, roll: 1, yaw: 1, pitch: 0 },
  dr: { name: 'Varial Heelflip', pts: 250, dur: 0.58, roll: -1, yaw: -0.5, pitch: 0 }
};
// Grabs: hand = Zielpunkt der Hand am Brett (Figurraum: x längs Brett Richtung Nase, z zur Blickseite), tweak = Brett-Neigung
export const GRABS = {
  n: { name: 'Indy', pts: 120, hand: 'r', at: [-0.02, 0.12], tweak: [0.15, 0, 0] },
  u: { name: 'Nosegrab', pts: 150, hand: 'l', at: [0.32, 0], tweak: [0, 0, 0.35] },
  d: { name: 'Tailgrab', pts: 150, hand: 'r', at: [-0.36, 0], tweak: [0, 0, -0.35] },
  l: { name: 'Melon', pts: 130, hand: 'l', at: [0.0, -0.1], tweak: [-0.2, 0, 0] },
  r: { name: 'Mute', pts: 130, hand: 'l', at: [0.05, 0.12], tweak: [0.2, 0, 0] },
  ul: { name: 'Method', pts: 200, hand: 'l', at: [-0.05, -0.1], tweak: [-0.6, 0, 0.1], arch: 1 },
  ur: { name: 'Crail', pts: 180, hand: 'r', at: [0.3, 0.1], tweak: [0.1, 0, 0.3] },
  dl: { name: 'Stalefish', pts: 180, hand: 'r', at: [-0.1, -0.1], tweak: [-0.3, 0, -0.1] },
  dr: { name: 'Roastbeef', pts: 170, hand: 'r', at: [0.05, -0.08], tweak: [-0.15, 0, 0] }
};
// Grinds: yawOff = Brett quer zur Stange (Slides), pitch = Nose/Tail runter, pts = Einstieg, pps = Punkte pro Sekunde
export const GRINDS = {
  n: { name: '50-50', pts: 100, pps: 160, yawOff: 0, pitch: 0 },
  u: { name: 'Nosegrind', pts: 140, pps: 190, yawOff: 0, pitch: -0.22 },
  d: { name: '5-0', pts: 140, pps: 190, yawOff: 0, pitch: 0.22 },
  l: { name: 'Boardslide', pts: 150, pps: 200, yawOff: Math.PI / 2, pitch: 0 },
  r: { name: 'Lipslide', pts: 160, pps: 210, yawOff: -Math.PI / 2, pitch: 0 },
  ul: { name: 'Crooked', pts: 200, pps: 230, yawOff: 0.35, pitch: -0.2 },
  ur: { name: 'Overcrook', pts: 220, pps: 240, yawOff: -0.35, pitch: -0.2 },
  dl: { name: 'Smith', pts: 200, pps: 230, yawOff: -0.3, pitch: 0.2 },
  dr: { name: 'Feeble', pts: 200, pps: 230, yawOff: 0.3, pitch: 0.2 }
};
export const MANUALS = {
  d: { name: 'Manual', pts: 60, pps: 140, pitch: 0.2 },
  u: { name: 'Nose Manual', pts: 80, pps: 160, pitch: -0.2 }
};
export const DIRS = ['n', 'u', 'd', 'l', 'r', 'ul', 'ur', 'dl', 'dr'];
export function dirOf(x, y) {
  const m = Math.hypot(x, y); if (m < 0.45) return 'n';
  const a = Math.atan2(y, x) * 180 / Math.PI; // 0 = rechts, 90 = hoch
  if (a > -22.5 && a <= 22.5) return 'r'; if (a > 22.5 && a <= 67.5) return 'ur'; if (a > 67.5 && a <= 112.5) return 'u';
  if (a > 112.5 && a <= 157.5) return 'ul'; if (a > 157.5 || a <= -157.5) return 'l'; if (a > -157.5 && a <= -112.5) return 'dl';
  if (a > -112.5 && a <= -67.5) return 'd'; return 'dr';
}
export const DIR_SYM = { n: '•', u: '↑', d: '↓', l: '←', r: '→', ul: '↖', ur: '↗', dl: '↙', dr: '↘' };
// Lip-Tricks: an der Rampenkante (Coping) aus der Senkrechten, Grind + Richtung. pitch/yawOff = Brettlage
export const LIPS = {
  n: { name: 'Rock to Fakie', pts: 150, pps: 120, yawOff: Math.PI / 2, pitch: 0.35 },
  u: { name: 'Nose Stall', pts: 200, pps: 140, yawOff: 0, pitch: -0.55 },
  d: { name: 'Tail Stall', pts: 200, pps: 140, yawOff: 0, pitch: 0.55 },
  l: { name: 'Axle Stall', pts: 220, pps: 150, yawOff: Math.PI / 2, pitch: 0 },
  r: { name: 'Blunt Stall', pts: 260, pps: 160, yawOff: 0, pitch: 0.9 },
  ul: { name: 'Nose Pick', pts: 300, pps: 170, yawOff: 0.3, pitch: -0.8 },
  ur: { name: 'Disaster', pts: 300, pps: 170, yawOff: Math.PI / 2, pitch: 0.2 },
  dl: { name: 'Handplant', pts: 420, pps: 200, yawOff: 0, pitch: -1.2, hand: true },
  dr: { name: 'Eggplant', pts: 420, pps: 200, yawOff: 0.4, pitch: -1.1, hand: true }
};
