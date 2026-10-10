/* Funkhaus – Aussehen der Bewohner: wird aus dem Namen abgeleitet (gleich in 3D-Figur und 2D-Avatar). */
export const SKIN = ['#ffd9b0', '#f1c27d', '#d9a066', '#a86b45', '#7b4a2d'], HAIR = ['#2a1a12', '#6b3a1a', '#c9a227', '#b23a2a', '#141414', '#d8d8e0', '#7a3fb0', '#2a7ab8'];
export const SHIRT = ['#ff6fb0', '#00b8d9', '#ffd24a', '#8b5cf6', '#ff9a1f', '#00c46a', '#ff5252', '#4f7cff'];
const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
/** c: Bewohner aus CAST, slot: Nummer im Haus (bestimmt die Trikotfarbe, damit alle unterscheidbar sind) */
export function look(c, slot) { const h = hash(c.n); return { skin: SKIN[h % 5], hair: HAIR[(h >>> 3) % 8], style: c.g === 'm' ? (h >>> 6) % 3 : 2 + ((h >>> 6) % 3), shirt: SHIRT[slot % 8], g: c.g, n: c.n }; }   // style 0 kurz, 1 Stachel, 2 lang, 3 Dutt, 4 Pferdeschwanz
const cache = {};
export function avatar(l, size = 64) {
  const key = l.n + l.shirt + size; if (cache[key]) return cache[key];
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'), s = size / 64;
  g.fillStyle = l.shirt; g.beginPath(); g.arc(32 * s, 32 * s, 32 * s, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(32 * s, 32 * s, 31 * s, 0, 7); g.clip();
  g.fillStyle = l.shirt; g.fillRect(0, 0, size, size); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 0, size, 20 * s);
  g.fillStyle = l.hair; if (l.style === 2 || l.style === 4) { g.beginPath(); g.ellipse(32 * s, 34 * s, 19 * s, 24 * s, 0, 0, 7); g.fill(); }
  g.fillStyle = l.skin; g.beginPath(); g.ellipse(32 * s, 62 * s, 22 * s, 17 * s, 0, 0, 7); g.fill();   // Schultern/Hals
  g.fillStyle = l.skin; g.beginPath(); g.arc(32 * s, 31 * s, 15 * s, 0, 7); g.fill();
  g.fillStyle = l.hair; g.beginPath(); g.arc(32 * s, 27 * s, 16 * s, Math.PI * 1.02, Math.PI * 1.98); g.fill();
  if (l.style === 1) { for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo((32 + k * 6 - 4) * s, 17 * s); g.lineTo((32 + k * 6) * s, 6 * s); g.lineTo((32 + k * 6 + 4) * s, 17 * s); g.fill(); } }
  if (l.style === 3) { g.beginPath(); g.arc(32 * s, 9 * s, 6 * s, 0, 7); g.fill(); }
  if (l.style === 4) { g.beginPath(); g.ellipse(50 * s, 36 * s, 5 * s, 10 * s, 0.3, 0, 7); g.fill(); }
  g.fillStyle = '#1a1230'; g.beginPath(); g.arc(26 * s, 32 * s, 2.2 * s, 0, 7); g.arc(38 * s, 32 * s, 2.2 * s, 0, 7); g.fill();
  g.strokeStyle = '#7a2a3a'; g.lineWidth = 2 * s; g.beginPath(); g.arc(32 * s, 36 * s, 5 * s, 0.2, Math.PI - 0.2); g.stroke();
  g.restore(); return (cache[key] = c.toDataURL());
}
