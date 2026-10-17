/* Y03 Spotlight: Live-Show auf der Bühne. Wer gerade spricht (Moderator läuft herum, Gäste stehen auf und wechseln
   den Platz), muss im Scheinwerferlicht stehen. Profi: zwei Sprecher gleichzeitig, zwei Scheinwerfer. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const SPEED = 420, CHAIRS = [230, 480, 730];
  const CFG = [
    { time: 45, need: 0.55, r: 75, walk: 70, guests: 1, spots: 1, active: 1, swap: 5 },
    { time: 50, need: 0.6, r: 64, walk: 100, guests: 2, spots: 1, active: 1, swap: 4 },
    { time: 55, need: 0.55, r: 58, walk: 125, guests: 2, spots: 2, active: 2, swap: 3.5 }
  ];
  const NAMES = ['Moderatorin', 'Gast 1', 'Gast 2'], SHIRT = ['#ff4d9d', '#6ef0ff', '#ffb02e'];
  const head = m => ({ x: m.x, y: m.y - (m.sit ? 52 : 78) });
  function covered(st, m) { const h = head(m); return st.spots.some(s => Math.hypot(s.x - h.x, s.y - h.y) < st.cfg.r - 12); }
  function newActive(st) {
    const c = st.cfg, n = st.ppl.length;
    if (c.active === 1) { let k; do k = PT.randInt(st, 0, n - 1); while (k === st.act[0] && n > 1); st.act = [k]; }
    else { const keep = st.act[PT.randInt(st, 0, 1)], rest = [0, 1, 2].filter(i => i !== keep && st.act.indexOf(i) < 0); st.act = [keep, PT.pick(st, rest.length ? rest : [0, 1, 2].filter(i => i !== keep))]; }
    st.swapT = c.swap * (0.8 + PT.rand(st) * 0.5); MG.fx(st, 'beep');
  }
  MG.define({
    id: 'Y03', group: 'party', name: 'Spotlight', icon: '🔦',
    short: 'Halte den Scheinwerfer auf alle, die gerade sprechen – auch wenn sie herumlaufen.',
    rules: [
      'Wer gerade spricht, trägt ein 🎤 über dem Kopf und einen gestrichelten Ring.',
      'Führe den Scheinwerfer auf seinen Kopf. Jede Sekunde im Licht zählt.',
      'Die Moderatorin läuft herum, Gäste stehen auf und setzen sich um.',
      'Profi: zwei Sprecher, zwei Scheinwerfer – mit 1/2 oder B umschalten.',
      'Gewonnen, wenn am Ende der Show genug Zeit im Licht erreicht ist.'
    ],
    controls: { key: 'Pfeile bewegen den Scheinwerfer, 1/2 oder Q wechseln (Profi)', touch: 'Scheinwerfer ziehen oder Ziel antippen', pad: 'Stick bewegen, B wechselt' },
    touch: ['left', 'right', 'up', 'down', 'b'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const d = o.difficulty | 0, c = CFG[d];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: d, cfg: c, t: 0, lit: 0, sel: 0, hold: { left: 0, right: 0, up: 0, down: 0 }, ptr: false,
        player: ((o.players || [])[o.turn | 0] || {}).name || '', act: [0, 1], spots: [{ x: 120, y: 90, gx: null, gy: 0 }] };
      if (c.spots > 1) st.spots.push({ x: 840, y: 90, gx: null, gy: 0 });
      st.ppl = [{ x: 480, y: 440, tx: 480, wait: 1, sit: false }];
      const ch = PT.shuffle(st, CHAIRS);
      for (let i = 0; i < c.guests; i++) st.ppl.push({ x: ch[i], y: 410, tx: ch[i], wait: 3 + PT.rand(st) * 4, sit: true, ph: 'sit' });
      st.act = c.active === 1 ? [0] : [0, 1]; st.swapT = c.swap;
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const c = st.cfg;
      if (a.type === 'key') {
        if (st.hold[a.key] !== undefined) { st.hold[a.key] = a.down ? 1 : 0; st.spots[st.sel].gx = null; }
        else if (a.down && c.spots > 1 && (a.key === 'b' || a.key === 'a')) { st.sel = 1 - st.sel; MG.fx(st, 'click'); }
        else if (a.down && c.spots > 1 && (a.key === '1' || a.key === '2')) st.sel = +a.key - 1;
      }
      if (a.type === 'pointer') {
        if (a.phase === 'down') {
          st.ptr = true; let bi = st.sel, bd = 1e9;
          st.spots.forEach((s, i) => { const dd = Math.hypot(s.x - a.x, s.y - a.y); if (dd < c.r && dd < bd) { bd = dd; bi = i; } });
          st.sel = bi;
        }
        if (a.phase === 'up') st.ptr = false;
        else if (st.ptr) { const s = st.spots[st.sel]; s.gx = a.x; s.gy = a.y; }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      const c = st.cfg; st.t += dt;
      st.spots.forEach((s, i) => {
        let vx = 0, vy = 0;
        if (s.gx != null) { const dx = s.gx - s.x, dy = s.gy - s.y, l = Math.hypot(dx, dy); if (l > 1) { const m = Math.min(l, SPEED * dt); vx = dx / l * m; vy = dy / l * m; } }
        else if (i === st.sel) { const hx = st.hold.right - st.hold.left, hy = st.hold.down - st.hold.up, l = Math.hypot(hx, hy); if (l) { vx = hx / l * SPEED * dt; vy = hy / l * SPEED * dt; } }
        s.x = PT.clamp(s.x + vx, 40, 920); s.y = PT.clamp(s.y + vy, 70, 500);
      });
      st.ppl.forEach((m, i) => {
        if (Math.abs(m.tx - m.x) > 1) { m.x += Math.sign(m.tx - m.x) * Math.min(Math.abs(m.tx - m.x), c.walk * (i ? 1.1 : 1) * dt); return; }
        m.wait -= dt; if (m.wait > 0) return;
        if (i === 0) { m.tx = PT.randInt(st, 120, 840); m.wait = 0.4 + PT.rand(st) * 1.6; }
        else if (m.ph === 'sit') { m.ph = 'stand'; m.sit = false; m.wait = 0.6; MG.fx(st, 'whoosh'); }
        else if (m.ph === 'stand') { const free = CHAIRS.filter(x => st.ppl.every((p, j) => j === 0 || p === m || Math.abs(p.tx - x) > 5)); m.tx = PT.pick(st, free); m.ph = 'walk'; }
        else { m.x = m.tx; m.ph = 'sit'; m.sit = true; m.wait = 4 + PT.rand(st) * 5; }
      });
      st.swapT -= dt; if (st.swapT <= 0) newActive(st);
      const hit = st.act.filter(i => covered(st, st.ppl[i])).length;
      st.lit += dt * hit / st.act.length; st.hitNow = hit;
      if (st.t >= c.time) MG.finish(st, st.lit / c.time >= c.need);
    },
    result(st) {
      const c = st.cfg, q = st.lit / Math.max(1, Math.min(st.t, c.time)), who = st.player ? st.player + ': ' : '';
      if (st.status === 'won') return { won: true, score: Math.round(PT.clamp(50 + 50 * (q - c.need) / (1 - c.need), 50, 100)), detail: who + Math.round(q * 100) + ' % der Show im richtigen Licht.' };
      return { won: false, score: Math.round(PT.clamp(49 * q / c.need, 0, 49)), detail: who + 'Nur ' + Math.round(q * 100) + ' % im Licht – die Zuschauer sahen viel Dunkelheit.' };
    },
    bot(st, goal) {
      if (goal === 'lose') return [];
      const c = st.cfg, out = [], tg = st.act.map(i => head(st.ppl[i]));
      let ctl = 0, aim = tg[0];
      if (c.spots > 1) {
        const S = st.spots, d0 = Math.hypot(S[0].x - tg[0].x, S[0].y - tg[0].y) + Math.hypot(S[1].x - tg[1].x, S[1].y - tg[1].y);
        const d1 = Math.hypot(S[0].x - tg[1].x, S[0].y - tg[1].y) + Math.hypot(S[1].x - tg[0].x, S[1].y - tg[0].y);
        ctl = Math.round(st.t * 60) % 2; aim = tg[(d0 <= d1 ? 0 : 1) ^ ctl];
        out.push({ type: 'key', key: String(ctl + 1), down: true });
      }
      const s = st.spots[ctl], dx = aim.x - s.x, dy = aim.y - s.y;
      const want = { right: dx > 6, left: dx < -6, down: dy > 6, up: dy < -6 };
      for (const k in want) out.push({ type: 'key', key: k, down: want[k] });
      return out;
    },
    draw2d(g, st) {
      const c = st.cfg;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.fillStyle = '#3a1838'; g.fillRect(0, 60, 960, 220);
      for (let x = 0; x < 960; x += 48) { g.fillStyle = x % 96 ? '#4a1f45' : '#561f4c'; g.fillRect(x, 60, 30, 220); }
      g.fillStyle = '#5a3d2a'; g.beginPath(); g.moveTo(60, 280); g.lineTo(900, 280); g.lineTo(960, 500); g.lineTo(0, 500); g.closePath(); g.fill();
      CHAIRS.forEach(x => { g.fillStyle = '#2c2c44'; g.fillRect(x - 22, 380, 44, 30); g.fillRect(x - 22, 340, 8, 70); });
      g.fillStyle = 'rgba(5,6,15,.62)'; g.fillRect(0, 60, 960, 480);
      st.ppl.forEach((m, i) => {
        const h = head(m), act = st.act.indexOf(i) >= 0;
        g.fillStyle = SHIRT[i]; g.fillRect(m.x - 16, h.y + 18, 32, m.sit ? 34 : 60);
        g.fillStyle = '#ffd9b3'; g.beginPath(); g.arc(h.x, h.y, 16, 0, 7); g.fill();
        if (act) {
          const ok = covered(st, m); g.strokeStyle = ok ? '#4be08a' : '#ffb02e'; g.lineWidth = 3; if (g.setLineDash) g.setLineDash([8, 6]);
          g.beginPath(); g.arc(h.x, h.y, 30, 0, 7); g.stroke(); if (g.setLineDash) g.setLineDash([]);
          g.font = '26px system-ui'; g.textAlign = 'center'; g.fillText('🎤', h.x, h.y - 38);
        }
      });
      const op = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter';
      st.spots.forEach(s => { const gr = g.createRadialGradient(s.x, s.y, 4, s.x, s.y, c.r); gr.addColorStop(0, 'rgba(255,240,190,.55)'); gr.addColorStop(0.8, 'rgba(255,230,160,.35)'); gr.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = gr; g.beginPath(); g.arc(s.x, s.y, c.r, 0, 7); g.fill(); });
      g.globalCompositeOperation = op || 'source-over';
      st.spots.forEach((s, i) => {
        g.strokeStyle = i === st.sel && c.spots > 1 ? '#ffb02e' : 'rgba(255,255,255,.5)'; g.lineWidth = i === st.sel && c.spots > 1 ? 4 : 2;
        g.beginPath(); g.arc(s.x, s.y, c.r, 0, 7); g.stroke();
        if (c.spots > 1) { g.fillStyle = '#ffb02e'; g.font = '700 20px system-ui'; g.textAlign = 'center'; g.fillText(String(i + 1), s.x, s.y - c.r - 6); }
      });
      g.fillStyle = 'rgba(16,20,42,.9)'; g.fillRect(0, 0, 960, 56);
      g.font = '700 22px system-ui'; g.textAlign = 'left'; g.fillStyle = c.time - st.t < 10 ? '#ff4d6d' : '#fff';
      g.fillText('⏱ ' + Math.ceil(Math.max(0, c.time - st.t)) + ' s', 18, 36);
      const q = st.lit / Math.max(1, st.t);
      g.fillStyle = q >= c.need ? '#4be08a' : '#ffc84a'; g.fillText('Im Licht: ' + Math.round(st.lit / c.time * 100) + ' % (Ziel ' + Math.round(c.need * 100) + ' %)', 130, 36);
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff';
      g.fillText((st.player ? st.player + ' · ' : '') + 'Spricht: ' + st.act.map(i => NAMES[i]).join(' + '), 942, 36);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
