/* Hörerwahl – Studio-Hintergrund: Scheinwerfer und Publikum (Canvas 2D, bewusst schlank). */
export function initStudio(cv) {
  const g = cv.getContext('2d'); let W = 0, H = 0, dpr = 1, energy = 0.2, t = 0, raf = 0, heads = [], conf = [];
  function resize() { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); heads = []; const rows = 3, per = Math.ceil(W / 46); for (let r = 0; r < rows; r++) for (let i = 0; i < per + 1; i++) heads.push({ x: i * 46 + (r % 2) * 23 + Math.random() * 8, y: H - 18 - r * 22, r: 15 - r * 1.5, ph: Math.random() * 6.28, col: ['#1b2748', '#2a1b48', '#102a3a', '#3a1b30'][(i + r) % 4], arm: Math.random() < 0.5 }); }
  function draw(ms) {
    t = ms / 1000; g.clearRect(0, 0, W, H); const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0a0c24'); gr.addColorStop(0.6, '#120b3a'); gr.addColorStop(1, '#2a0f45'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // Scheinwerfer
    for (let k = 0; k < 4; k++) { const x = W * (0.12 + k * 0.25) + Math.sin(t * 0.6 + k) * W * 0.08, hue = [190, 320, 270, 40][k]; const b = g.createLinearGradient(x, 0, x + Math.sin(t + k) * 80, H * 0.9); b.addColorStop(0, `hsla(${hue},100%,70%,.28)`); b.addColorStop(1, `hsla(${hue},100%,60%,0)`); g.fillStyle = b; g.beginPath(); g.moveTo(x - 6, 0); g.lineTo(x + 6, 0); g.lineTo(x + 140 + Math.sin(t * 0.8 + k) * 60, H * 0.9); g.lineTo(x - 140 + Math.sin(t * 0.8 + k) * 60, H * 0.9); g.closePath(); g.fill(); }
    // Publikum
    heads.forEach(h => { const bob = Math.sin(t * (2 + energy * 5) + h.ph) * (2 + energy * 7); g.fillStyle = h.col; g.beginPath(); g.arc(h.x, h.y + bob, h.r, 0, 7); g.fill(); g.fillRect(h.x - h.r * 0.9, h.y + bob + h.r * 0.5, h.r * 1.8, h.r * 2); if (h.arm && energy > 0.5) { g.fillRect(h.x + h.r * 0.7, h.y + bob - h.r * 1.4 - Math.sin(t * 8 + h.ph) * 4, 4, h.r * 1.8); } });
    // Konfetti
    conf.forEach(c => { c.y += c.vy; c.x += c.vx + Math.sin(t * 3 + c.ph) * 0.6; c.vy += 0.05; g.save(); g.translate(c.x, c.y); g.rotate(c.ph + t * 4); g.fillStyle = c.col; g.fillRect(-3, -2, 6, 4); g.restore(); }); conf = conf.filter(c => c.y < H + 20);
    energy = Math.max(0.15, energy - 0.004); raf = requestAnimationFrame(draw);
  }
  addEventListener('resize', resize); resize(); raf = requestAnimationFrame(draw);
  return { cheer(a = 0.8) { energy = Math.min(1, Math.max(energy, a)); }, confetti(n = 120) { for (let i = 0; i < n; i++) conf.push({ x: Math.random() * W, y: -10 - Math.random() * 120, vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 2, ph: Math.random() * 6, col: ['#00E5FF', '#FF2D95', '#FFD24A', '#00FF88', '#8B5CF6'][i % 5] }); if (conf.length > 400) conf.splice(0, conf.length - 400); }, pause(v) { cancelAnimationFrame(raf); if (!v) raf = requestAnimationFrame(draw); } };
}
