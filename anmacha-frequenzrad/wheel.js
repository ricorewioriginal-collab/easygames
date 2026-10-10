/* Frequenzrad – das Rad (Canvas 2D): zeichnen und auf ein vorbestimmtes Feld drehen. Zeiger oben. */
const COLORS = ['#00b8d9', '#ff2d95', '#8b5cf6', '#ff9a1f', '#00c46a', '#2a78e8'];
export function createWheel(cv, segs) {
  const g = cv.getContext('2d'), N = segs.length, D = Math.PI * 2 / N; let rot = 0, size = 300, dpr = 1, spinning = false, hl = -1;
  const fit = () => { dpr = Math.min(devicePixelRatio || 1, 2); size = Math.max(160, Math.round(cv.clientWidth || 300)); cv.width = cv.height = size * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); };
  const segAt = r => ((Math.floor(-r / D) % N) + N) % N;   // Feld unter dem Zeiger
  function draw() {
    const c = size / 2, R = c - 10; g.clearRect(0, 0, size, size);
    g.save(); g.translate(c, c); g.shadowColor = 'rgba(0,229,255,.55)'; g.shadowBlur = 18; g.fillStyle = '#10143a'; g.beginPath(); g.arc(0, 0, R + 6, 0, 7); g.fill(); g.shadowBlur = 0;
    segs.forEach((s, i) => {
      const a0 = rot + i * D - Math.PI / 2, a1 = a0 + D; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, a0, a1); g.closePath();
      g.fillStyle = s.t === 'bank' ? '#2a0f1f' : s.t === 'skip' ? '#5a6478' : s.t === 'free' ? '#ffd24a' : COLORS[i % COLORS.length]; g.fill(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; g.stroke();
      if (i === hl) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); }
      g.save(); g.rotate(a0 + D / 2); g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillStyle = s.t === 'free' ? '#3a2a00' : '#fff';
      if (s.t === 'val') { g.font = `900 ${Math.round(R * 0.13)}px Inter,system-ui,sans-serif`; g.fillText(s.v, R - 10, 0); }
      else { g.font = `900 ${Math.round(R * 0.075)}px Inter,system-ui,sans-serif`; g.fillText(s.t === 'bank' ? '💣 BANKROTT' : s.t === 'skip' ? '⏸ AUSSETZEN' : '🎁 GRATIS-VOKAL', R - 8, 0); }
      g.restore();
    });
    g.fillStyle = '#0a0c24'; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, R * 0.16, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#ff2d95'; g.font = `900 ${Math.round(R * 0.12)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('📻', 0, 2);
    g.restore();
    // Zeiger
    g.fillStyle = '#ffd24a'; g.strokeStyle = '#1b1200'; g.lineWidth = 3; g.beginPath(); g.moveTo(c - 13, 2); g.lineTo(c + 13, 2); g.lineTo(c, 30); g.closePath(); g.fill(); g.stroke();
  }
  /** Dreht so, dass Feld idx unter dem Zeiger liegt. onTick(feldIndex) bei jedem überstrichenen Feld. Gibt ein Promise zurück. */
  function spinTo(idx, ms, onTick, rnd) {
    return new Promise(resolve => {
      spinning = true; hl = -1; const jitter = ((rnd ? rnd() : Math.random()) - 0.5) * 0.6 * D, base = -(idx + 0.5) * D + jitter; let target = base; while (target < rot + Math.PI * 8) target += Math.PI * 2;
      const r0 = rot, t0 = performance.now(); let last = segAt(rot);
      (function f(now) { const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 4); rot = r0 + (target - r0) * e; const s = segAt(rot); if (s !== last) { last = s; onTick && onTick(s); } draw(); if (k < 1) requestAnimationFrame(f); else { spinning = false; rot = target; hl = idx; draw(); resolve(); } })(t0);
    });
  }
  addEventListener('resize', fit); fit();
  return { draw, fit, spinTo, setHighlight: i => { hl = i; draw(); }, get spinning() { return spinning; } };
}
