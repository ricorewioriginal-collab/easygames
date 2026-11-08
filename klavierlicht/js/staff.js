/* Klavierlicht – Notenzeile (Klaviersystem: Violin- und Bassschlüssel) für „Klavier lernen“: die nächsten Noten laufen von rechts
 * zur Spiellinie. Schwarze Tasten als Kreuz (#). Farben wie die fallenden Balken (Reihenfolge), getroffen grün, verpasst rot. */
(function (root) {
  'use strict';
  const LET = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6], SHARP = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
  const dia = p => Math.floor(p / 12) * 7 + LET[((p % 12) + 12) % 12];   // diatonische Stufe (C0 = 0)
  const E4 = dia(64), A3 = dia(57);   // unterste Linie Violinschlüssel / oberste Linie Bassschlüssel
  // x0..x0+w, y0..y0+h; notes: [{t,p,d,hit,hand}], t: Liedzeit, span: Sekunden sichtbar, colorOf(n) → Farbe oder null
  function draw(cx, x0, y0, w, h, notes, t, span, colorOf, from) {
    const s = h / 13, gap = s * 2.2, yT = y0 + s * 5.5, yB = yT + gap + s * 4, px = x0 + w * 0.16, pps = (w * 0.8) / span;   // yT = unterste Violin-Linie
    cx.fillStyle = 'rgba(20,0,50,.55)'; cx.beginPath(); cx.roundRect(x0, y0, w, h, 12); cx.fill();
    cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const a = yT - i * s, b = yB - i * s; cx.beginPath(); cx.moveTo(x0 + 8, a); cx.lineTo(x0 + w - 8, a); cx.moveTo(x0 + 8, b); cx.lineTo(x0 + w - 8, b); cx.stroke(); }
    cx.fillStyle = '#fff'; cx.textAlign = 'left'; cx.font = Math.round(s * 4.6) + 'px serif'; cx.fillText('𝄞', x0 + 10, yT + s * 0.9); cx.font = Math.round(s * 3.3) + 'px serif'; cx.fillText('𝄢', x0 + 12, yB - s * 2.6);
    cx.fillStyle = 'rgba(255,255,255,.85)'; cx.fillRect(px - 1, yT - s * 5, 2, yB - yT + s * 6);
    const yOf = (p, bass) => bass ? yB - (dia(p) - A3) * s / 2 - s * 4 : yT - (dia(p) - E4) * s / 2;
    for (let i = from || 0; i < notes.length; i++) {
      const n = notes[i], x = px + (n.t - t) * pps; if (x > x0 + w - 10) break; if (x < x0 + 40) continue;
      const bass = n.hand ? n.hand === 'L' : n.p < 60, y = yOf(n.p, bass), col = n.hit === 'miss' ? '#ff5a78' : n.hit ? '#3dff8f' : colorOf(n) || '#fff';
      // Hilfslinien
      cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = 1;
      const top = bass ? yB - s * 4 : yT - s * 4, bot = bass ? yB : yT;
      for (let ly = bot + s; ly <= y + 0.1; ly += s) { cx.beginPath(); cx.moveTo(x - s, ly); cx.lineTo(x + s, ly); cx.stroke(); }
      for (let ly = top - s; ly >= y - 0.1; ly -= s) { cx.beginPath(); cx.moveTo(x - s, ly); cx.lineTo(x + s, ly); cx.stroke(); }
      cx.fillStyle = col; cx.beginPath(); cx.ellipse(x, y, s * 0.62, s * 0.45, -0.35, 0, 7); if (n.d >= 0.9 * (span / 4)) { cx.strokeStyle = col; cx.lineWidth = 2; cx.stroke(); } else cx.fill();
      cx.strokeStyle = col; cx.lineWidth = 1.5; cx.beginPath(); const up = y > (bass ? yB - s * 2 : yT - s * 2); cx.moveTo(x + (up ? s * 0.58 : -s * 0.58), y); cx.lineTo(x + (up ? s * 0.58 : -s * 0.58), y + (up ? -s * 3.2 : s * 3.2)); cx.stroke();
      if (SHARP[((n.p % 12) + 12) % 12]) { cx.fillStyle = col; cx.font = '700 ' + Math.round(s * 1.5) + 'px system-ui'; cx.textAlign = 'center'; cx.fillText('♯', x - s * 1.5, y + s * 0.5); }
    }
  }
  const API = { draw, dia };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.KLStaff = API;
})(typeof window !== 'undefined' ? window : globalThis);
