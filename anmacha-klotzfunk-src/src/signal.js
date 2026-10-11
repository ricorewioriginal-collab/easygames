// Funknetz und Signale ohne Grafik (testbar).
// Schalter (an) speisen Leitungen; eine gespeiste Leitung schaltet angrenzende Funksender ein und
// angrenzende Maschinen (Signallampe, Funktor). Ein aktiver Sender erreicht Relais und Empfänger im Umkreis von 24 Blöcken,
// Relais geben das Signal genauso weiter. Ein erreichter Empfänger speist wiederum angrenzende Leitungen und Maschinen.
// Berechnet wird nur bei Änderungen, mit festem Rechenlimit; Ergebnis sind die Blöcke, die „an“ sein sollen.
import { B } from './blocks.js';

export const RADIO_RANGE = 24;
export const MAX_NODES = 4096;
const KIND = {
  [B.SWITCH]: 'switch', [B.SWITCH_ON]: 'switch', [B.WIRE]: 'wire', [B.SENDER]: 'sender', [B.RELAY]: 'relay',
  [B.RECEIVER]: 'receiver', [B.RECEIVER_ON]: 'receiver', [B.SIGLAMP]: 'machine', [B.SIGLAMP_ON]: 'machine', [B.GATE]: 'machine', [B.GATE_OPEN]: 'machine'
};
export const SIG_BLOCKS = new Set(Object.keys(KIND).map(Number));
export const kindOf = t => KIND[t];
// Grundblock -> eingeschaltete Fassung und zurück
export const ON_ID = { [B.RECEIVER]: B.RECEIVER_ON, [B.SIGLAMP]: B.SIGLAMP_ON, [B.GATE]: B.GATE_OPEN };
export const OFF_ID = { [B.RECEIVER_ON]: B.RECEIVER, [B.SIGLAMP_ON]: B.SIGLAMP, [B.GATE_OPEN]: B.GATE };
export const sigKey = (x, y, z) => x + ',' + y + ',' + z;
const NB = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

// nodes: Map key -> [x, y, z, typ]. Rückgabe: { on: Set(keys), receivers, machines, senders, reach, capped }
export function solve(nodes) {
  const on = new Set(), powered = new Set(), active = new Set(), root = new Map(), queue = [];
  const radio = [];
  for (const [k, n] of nodes) {
    const kind = KIND[n[3]];
    if (kind === 'relay' || kind === 'receiver') radio.push(k);
    if (n[3] === B.SWITCH_ON) { powered.add(k); queue.push(k); }
  }
  let steps = 0, reach = 0, receivers = 0, machines = 0, senders = 0;
  const R2 = RADIO_RANGE * RADIO_RANGE;
  let head = 0;
  while (head < queue.length) {
    if (++steps > MAX_NODES) break;
    const k = queue[head++], n = nodes.get(k), kind = KIND[n[3]];
    if (kind === 'sender' || kind === 'relay') { // funken
      const r = root.get(k);
      for (const rk of radio) {
        if (rk === k) continue;
        const m = nodes.get(rk), dx = m[0] - n[0], dy = m[1] - n[1], dz = m[2] - n[2];
        if (dx * dx + dy * dy + dz * dz > R2) continue;
        const mk = KIND[m[3]];
        if (mk === 'relay' && !active.has(rk)) { active.add(rk); root.set(rk, r); queue.push(rk); }
        else if (mk === 'receiver' && !powered.has(rk)) {
          powered.add(rk); on.add(rk); receivers++; queue.push(rk);
          reach = Math.max(reach, Math.hypot(m[0] - r[0], m[1] - r[1], m[2] - r[2]));
        }
      }
      continue;
    }
    // Leitung, Schalter oder Empfänger: angrenzende Blöcke speisen
    for (const [ax, ay, az] of NB) {
      const nk = sigKey(n[0] + ax, n[1] + ay, n[2] + az), m = nodes.get(nk);
      if (!m) continue;
      const mk = KIND[m[3]];
      if (mk === 'wire' && !powered.has(nk)) { powered.add(nk); queue.push(nk); }
      else if (mk === 'sender' && !active.has(nk)) { active.add(nk); root.set(nk, m); senders++; queue.push(nk); }
      else if (mk === 'machine' && !on.has(nk)) { on.add(nk); machines++; }
    }
  }
  return { on, receivers, machines, senders, reach, capped: steps > MAX_NODES };
}
