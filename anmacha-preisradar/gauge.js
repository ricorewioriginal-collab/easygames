/* Preisradar – Frequenz-Skala (Canvas 2D): Halbkreis-Anzeige mit Nadeln der Spieler und dem echten Preis. */
export const PCOL = ['#00E5FF', '#FF2D95', '#FFD24A', '#00FF88'];
export function drawGauge(cv, spec, marks, price, live) {
  const dpr = Math.min(devicePixelRatio || 1, 2), W = cv.clientWidth || 320, H = Math.round(W * 0.58); cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H - 18, R = Math.min(W / 2 - 18, H - 40), ang = v => Math.PI + (Math.min(spec.max, Math.max(spec.min, v)) - spec.min) / (spec.max - spec.min) * Math.PI;
  const gr = g.createLinearGradient(0, cy - R, 0, cy); gr.addColorStop(0, '#1a2a6a'); gr.addColorStop(1, '#0a0c24'); g.fillStyle = gr; g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, Math.PI, 2 * Math.PI); g.lineTo(cx, cy); g.closePath(); g.fill(); g.stroke();
  for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI, big = i % 5 === 0; g.strokeStyle = big ? '#fff' : 'rgba(255,255,255,.4)'; g.lineWidth = big ? 2.5 : 1.5; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R - (big ? 16 : 9)), cy + Math.sin(a) * (R - (big ? 16 : 9))); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '700 12px sans-serif'; g.textAlign = 'left'; g.fillText(fmt(spec.min), 6, cy + 14); g.textAlign = 'right'; g.fillText(fmt(spec.max), W - 6, cy + 14);
  const needle = (v, col, len, w, label) => { const a = ang(v); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R * len, cy + Math.sin(a) * R * len); g.stroke(); if (label) { g.fillStyle = col; g.font = '800 12px sans-serif'; g.textAlign = 'center'; g.fillText(label, cx + Math.cos(a) * (R * len + 12), cy + Math.sin(a) * (R * len + 12)); } };
  (marks || []).forEach((m, i) => needle(m.v, m.color || PCOL[i % 4], 0.78 - (i % 4) * 0.06, 3, m.label)); if (live != null) needle(live, '#fff', 0.85, 4);
  if (price != null) { needle(price, '#00FF88', 0.97, 5); g.fillStyle = '#00FF88'; g.beginPath(); g.arc(cx + Math.cos(ang(price)) * R * 0.97, cy + Math.sin(ang(price)) * R * 0.97, 7, 0, 7); g.fill(); }
  g.fillStyle = '#ff2d95'; g.beginPath(); g.arc(cx, cy, 9, 0, 7); g.fill();
}
const fmt = n => n.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';
