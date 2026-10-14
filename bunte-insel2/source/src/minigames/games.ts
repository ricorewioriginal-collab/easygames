/* Die Minispiele: jede Welt eine andere Spielart. */
import { emoji, H, Minigame, type MgInput, rr, sky, txt, W } from './base.ts';
import { makeRng } from '../core/rng.ts';

/* ---------- Parcours-Läufer (Ki-Garten, Fellretter-Sprint, Hüpfland) ---------- */
export class Runner extends Minigame {
  title = (this.o.title as string) ?? 'Ki-Parcours'; icon = (this.o.icon as string) ?? '🥋';
  howto = ['Springe über Hindernisse, sammle Energie-Kugeln ✨.', 'Doppelsprung in der Luft! Lange drücken = höher.', 'Erreiche das Ziel 🏁.'];
  controls = 'Tippen / Leertaste / A = springen';
  private y = 0; private vy = 0; private jumps = 0; private x = 0; private speed = 280; private obs: { x: number; w: number; h: number; type: string }[] = []; private orbs: { x: number; y: number; got: boolean }[] = [];
  private len = 0; private hits = 0; private inv = 0; private theme = 'ki';
  init(): void {
    const lv = this.o.level ?? 1, r = makeRng(42 + lv); this.theme = (this.o.theme as string) ?? 'ki';
    this.y = 0; this.vy = 0; this.x = 0; this.hits = 0; this.score = 0; this.speed = 260 + lv * 30; this.len = 3200 + lv * 800; this.obs = []; this.orbs = [];
    let px = 600;
    while (px < this.len - 300) { const type = r() < 0.25 ? 'hoch' : r() < 0.5 ? 'flieger' : 'stein'; this.obs.push({ x: px, w: type === 'hoch' ? 40 : 46, h: type === 'hoch' ? 90 : type === 'flieger' ? 30 : 44, type }); for (let k = 0; k < 3; k++) this.orbs.push({ x: px + 120 + k * 50, y: 60 + r() * 120, got: false }); px += 260 + r() * 260 - lv * 10; }
  }
  step(dt: number, i: MgInput): void {
    this.x += this.speed * dt; this.inv -= dt;
    if (i.tap && this.jumps < 2) { this.vy = this.jumps ? 560 : 640; this.jumps++; this.sfx(this.jumps === 2 ? 'jump2' : 'jump', 0.5); }
    this.vy -= (i.held && this.vy > 0 ? 1300 : 2100) * dt; this.y += this.vy * dt;
    if (this.y <= 0) { this.y = 0; this.vy = 0; this.jumps = 0; }
    const px = this.x + 140;
    for (const o of this.obs) {
      const oy = o.type === 'flieger' ? 70 : 0;
      if (px + 18 > o.x && px - 18 < o.x + o.w && this.y < oy + o.h && this.y + 50 > oy && this.inv <= 0) { this.hits++; this.inv = 1; this.sfx('bump'); this.score = Math.max(0, this.score - 3); }
    }
    for (const b of this.orbs) if (!b.got && Math.abs(b.x - px) < 26 && Math.abs(b.y - (this.y + 30)) < 34) { b.got = true; this.score += 2; this.sfx('pickup', 0.5); }
    if (this.x >= this.len) { this.score += Math.max(0, 20 - this.hits * 4); this.finish(this.hits <= 3, this.hits ? this.hits + ' × angestoßen' : 'Ohne Fehler!'); }
  }
  draw(c: CanvasRenderingContext2D): void {
    const th = this.theme;
    sky(c, th === 'ki' ? '#ffcf8a' : th === 'hund' ? '#8fd3ff' : '#9fe8a0', th === 'ki' ? '#ff9a6a' : '#e8f8ff');
    c.fillStyle = th === 'ki' ? 'rgba(160,90,140,.5)' : 'rgba(80,160,90,.5)';
    for (let k = 0; k < 6; k++) { const bx = ((k * 220 - this.x * 0.2) % 1320 + 1320) % 1320 - 200; c.beginPath(); c.moveTo(bx, 360); c.lineTo(bx + 120, 160 + (k % 3) * 40); c.lineTo(bx + 260, 360); c.fill(); }
    const gy = 360;
    c.fillStyle = th === 'ki' ? '#6fbf6a' : '#5fcf55'; c.fillRect(0, gy, W, H - gy);
    c.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < 20; k++) c.fillRect(((k * 60 - this.x) % 1200 + 1200) % 1200 - 100, gy + 10, 30, 6);
    for (const o of this.obs) { const sx = o.x - this.x; if (sx < -80 || sx > W + 50) continue; const oy = o.type === 'flieger' ? 70 : 0; if (o.type === 'flieger') emoji(c, '🦅', sx + o.w / 2, gy - oy - 15, 40); else { c.fillStyle = o.type === 'hoch' ? '#a0522d' : '#8a8f9a'; rr(c, sx, gy - o.h, o.w, o.h, 10); c.fill(); } }
    for (const b of this.orbs) if (!b.got) { const sx = b.x - this.x; if (sx > -20 && sx < W + 20) emoji(c, '✨', sx, gy - b.y, 26); }
    const fx = this.len - this.x + 140; if (fx < W + 50) emoji(c, '🏁', fx, gy - 40, 60);
    c.globalAlpha = this.inv > 0 && Math.floor(this.time * 20) % 2 ? 0.4 : 1;
    emoji(c, th === 'hund' ? '🐕' : th === 'dino' ? '🦕' : '🧒', 140, gy - this.y - 26, 52);
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(255,255,255,.7)'; rr(c, 200, 16, 400, 14, 7); c.fill();
    c.fillStyle = '#ffd23f'; rr(c, 200, 16, 400 * Math.min(1, this.x / this.len), 14, 7); c.fill();
  }
}

/* ---------- Flug durch Ringe (Drachenflug, Heli-Rettung, Ki-Flugprüfung) ---------- */
export class Flight extends Minigame {
  title = (this.o.title as string) ?? 'Drachenflug'; icon = (this.o.icon as string) ?? '🐉';
  howto = ['Halten = steigen, loslassen = sinken.', 'Fliege durch die goldenen Ringe ⭕ und weiche Gewitterwolken ⛈️ aus.'];
  controls = 'Halten: Tippen / Leertaste / A';
  private y = 200; private vy = 0; private x = 0; private items: { x: number; y: number; k: 'ring' | 'wolke' | 'gem'; done: boolean }[] = []; private lives = 3; private inv = 0; private passed = 0; private total = 0;
  init(): void {
    const r = makeRng(7 + (this.o.level ?? 1)); this.y = 200; this.vy = 0; this.x = 0; this.lives = 3; this.items = []; this.passed = 0; this.score = 0;
    for (let k = 0; k < 18; k++) { const px = 500 + k * 280; this.items.push({ x: px, y: 90 + r() * 270, k: 'ring', done: false }); if (k % 2) this.items.push({ x: px + 140, y: 60 + r() * 320, k: r() < 0.6 ? 'wolke' : 'gem', done: false }); }
    this.total = this.items.filter(i => i.k === 'ring').length;
  }
  step(dt: number, i: MgInput): void {
    const sp = 240 + this.time * 4;
    this.x += sp * dt; this.inv -= dt;
    this.vy += (i.held ? -900 : 700) * dt; this.vy = Math.max(-320, Math.min(320, this.vy)); this.y += this.vy * dt;
    if (this.y < 30) { this.y = 30; this.vy = 0; } if (this.y > H - 30) { this.y = H - 30; this.vy = 0; }
    const px = this.x + 160;
    for (const it of this.items) {
      if (it.done || Math.abs(it.x - px) > 30) continue;
      const d = Math.abs(it.y - this.y);
      if (it.k === 'ring' && d < 40) { it.done = true; this.passed++; this.score += 3; this.sfx('star', 0.5); }
      if (it.k === 'gem' && d < 30) { it.done = true; this.score += 2; this.sfx('pickup', 0.5); }
      if (it.k === 'wolke' && d < 42 && this.inv <= 0) { it.done = true; this.lives--; this.inv = 1.2; this.sfx('hurt'); if (this.lives <= 0) this.finish(false, 'Die Wolken waren zu viele – nochmal!'); }
    }
    const last = this.items[this.items.length - 1];
    if (px > last.x + 200) this.finish(this.passed >= this.total * 0.6, this.passed + ' von ' + this.total + ' Ringen');
  }
  draw(c: CanvasRenderingContext2D): void {
    sky(c, '#5fb0ff', '#ffe0f0');
    c.fillStyle = 'rgba(255,255,255,.7)'; for (let k = 0; k < 8; k++) { const cx = ((k * 170 - this.x * 0.3) % 1360 + 1360) % 1360 - 100; c.beginPath(); c.arc(cx, 80 + (k % 4) * 80, 40, 0, 7); c.arc(cx + 40, 70 + (k % 4) * 80, 30, 0, 7); c.fill(); }
    for (const it of this.items) {
      const sx = it.x - this.x; if (sx < -60 || sx > W + 60 || it.done) continue;
      if (it.k === 'ring') { c.strokeStyle = '#ffd23f'; c.lineWidth = 10; c.beginPath(); c.ellipse(sx, it.y, 18, 44, 0, 0, 7); c.stroke(); }
      else emoji(c, it.k === 'wolke' ? '⛈️' : '💎', sx, it.y, it.k === 'wolke' ? 64 : 34);
    }
    c.globalAlpha = this.inv > 0 && Math.floor(this.time * 20) % 2 ? 0.4 : 1;
    c.save(); c.translate(160, this.y); c.rotate(this.vy * 0.0012); emoji(c, this.icon, 0, 0, 56); c.restore();
    c.globalAlpha = 1;
    txt(c, '❤️'.repeat(this.lives), 20, 30, 24, '#fff', 'left');
  }
}

/* ---------- Stapeln (Hafen-Kran, Bauland-Turm) ---------- */
export class Stack extends Minigame {
  title = (this.o.title as string) ?? 'Hafen-Kran'; icon = (this.o.icon as string) ?? '🏗️';
  howto = ['Die Kiste schwingt hin und her.', 'Tippe im richtigen Moment, damit sie genau auf dem Stapel landet. Was übersteht, fällt ab!'];
  controls = 'Tippen / Leertaste / A = fallen lassen';
  private stack: { x: number; w: number }[] = []; private cur = { x: 0, w: 200, dir: 1 }; private drop: { x: number; y: number; w: number } | null = null; private camY = 0; private combo = 0;
  init(): void { this.stack = [{ x: 300, w: 200 }]; this.cur = { x: 0, w: 200, dir: 1 }; this.drop = null; this.camY = 0; this.score = 0; this.combo = 0; }
  step(dt: number, i: MgInput): void {
    const sp = 220 + this.stack.length * 14;
    if (!this.drop) { this.cur.x += this.cur.dir * sp * dt; if (this.cur.x < 0) { this.cur.x = 0; this.cur.dir = 1; } if (this.cur.x + this.cur.w > W) { this.cur.x = W - this.cur.w; this.cur.dir = -1; } if (i.tap) this.drop = { x: this.cur.x, y: 0, w: this.cur.w }; }
    else {
      this.drop.y += 900 * dt;
      const targetY = this.stack.length * 34;
      if (this.drop.y >= 1) {
        const top = this.stack[this.stack.length - 1];
        const l = Math.max(top.x, this.drop.x), r2 = Math.min(top.x + top.w, this.drop.x + this.drop.w), w = r2 - l;
        if (w <= 4) { this.finish(this.stack.length >= 8, 'Turmhöhe: ' + (this.stack.length - 1)); return; }
        const perfect = Math.abs(this.drop.x - top.x) < 6;
        this.stack.push({ x: perfect ? top.x : l, w: perfect ? top.w : w });
        this.combo = perfect ? this.combo + 1 : 0;
        this.score += 1 + (perfect ? this.combo : 0);
        this.sfx(perfect ? 'star' : 'bump', 0.6);
        this.cur = { x: this.cur.dir > 0 ? 0 : W - (perfect ? top.w : w), w: perfect ? top.w : w, dir: this.cur.dir };
        this.drop = null;
        void targetY;
        if (this.stack.length >= 16) this.finish(true, 'Riesenturm!');
      }
    }
    this.camY += (Math.max(0, this.stack.length * 34 - 200) - this.camY) * Math.min(1, dt * 4);
  }
  draw(c: CanvasRenderingContext2D): void {
    sky(c, '#cfe9ff', '#fff6dc');
    const base = H - 30 + this.camY;
    c.fillStyle = '#8a6a4a'; c.fillRect(0, base, W, 40);
    this.stack.forEach((s, k) => { c.fillStyle = ['#e8453c', '#3f8cff', '#ffd23f', '#4cd07d', '#b36bff'][k % 5]; rr(c, s.x, base - (k + 1) * 34, s.w, 32, 6); c.fill(); });
    c.strokeStyle = '#333'; c.lineWidth = 3;
    const cy = 60, cx = this.drop ? this.drop.x + this.drop.w / 2 : this.cur.x + this.cur.w / 2;
    c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, cy); c.stroke();
    c.fillStyle = '#ffa21f';
    if (!this.drop) { rr(c, this.cur.x, cy, this.cur.w, 32, 6); c.fill(); }
    else { const top = base - (this.stack.length + 1) * 34; const y = cy + (top - cy) * Math.min(1, this.drop.y); rr(c, this.drop.x, y, this.drop.w, 32, 6); c.fill(); }
    if (this.combo > 1) txt(c, 'Perfekt ×' + this.combo, W / 2, 40, 28, '#ffd23f');
  }
}

/* ---------- Rhythmus (Regenbogen-Bühne, Dampfer-Orchester) ---------- */
export class Rhythm extends Minigame {
  title = (this.o.title as string) ?? 'Regenbogen-Disco'; icon = (this.o.icon as string) ?? '💃';
  howto = ['Noten fallen in vier Bahnen.', 'Triff sie, wenn sie die Linie berühren!', 'Treffer im Takt geben Kombo-Punkte.'];
  controls = 'Tippen auf die Bahn · Tasten D F J K oder ← ↓ ↑ →';
  private notes: { t: number; lane: number; hit: boolean; miss: boolean }[] = []; private combo = 0; private misses = 0; private flash = [0, 0, 0, 0];
  init(): void {
    const r = makeRng(3 + (this.o.level ?? 1)); this.notes = []; this.combo = 0; this.misses = 0; this.score = 0;
    const bpm = 112, beat = 60 / bpm;
    for (let k = 0; k < 64; k++) { if (r() < 0.25) continue; this.notes.push({ t: 2 + k * beat * 0.5, lane: Math.floor(r() * 4), hit: false, miss: false }); }
  }
  private press(lane: number): void {
    this.flash[lane] = 0.15;
    let best: (typeof this.notes)[number] | null = null, bd = 0.2;
    for (const n of this.notes) { if (n.hit || n.miss || n.lane !== lane) continue; const d = Math.abs(n.t - this.time); if (d < bd) { bd = d; best = n; } }
    if (best) { best.hit = true; this.combo++; this.score += bd < 0.07 ? 3 + Math.floor(this.combo / 8) : 1; this.sfx('note' + [0, 2, 4, 7][lane], 0.5); }
    else { this.combo = 0; }
  }
  step(dt: number, i: MgInput): void {
    const map: Record<string, number> = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
    if (i.key && map[i.key] !== undefined) this.press(map[i.key]);
    if (i.ptap) this.press(Math.max(0, Math.min(3, Math.floor((i.px - 200) / 100))));
    for (let k = 0; k < 4; k++) this.flash[k] = Math.max(0, this.flash[k] - dt);
    for (const n of this.notes) if (!n.hit && !n.miss && this.time - n.t > 0.2) { n.miss = true; this.misses++; this.combo = 0; }
    if (this.time > this.notes[this.notes.length - 1].t + 1.2) { const hits = this.notes.filter(n => n.hit).length; this.finish(hits >= this.notes.length * 0.6, hits + ' von ' + this.notes.length + ' Noten getroffen'); }
  }
  draw(c: CanvasRenderingContext2D): void {
    sky(c, '#2a1060', '#7a2ab0');
    const cols = ['#ff6b5b', '#ffd23f', '#2fd17b', '#3fa9ff'], line = 380;
    for (let k = 0; k < 4; k++) { c.fillStyle = this.flash[k] > 0 ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.08)'; c.fillRect(200 + k * 100 + 6, 0, 88, H); }
    c.fillStyle = '#fff'; c.fillRect(200, line, 400, 4);
    for (const n of this.notes) { if (n.hit) continue; const y = line - (n.t - this.time) * 300; if (y < -30 || y > H + 30) continue; c.fillStyle = n.miss ? '#666' : cols[n.lane]; rr(c, 200 + n.lane * 100 + 14, y - 14, 72, 28, 14); c.fill(); }
    ['←', '↓', '↑', '→'].forEach((s, k) => txt(c, s, 250 + k * 100, 420, 28));
    if (this.combo > 2) txt(c, 'Kombo ' + this.combo, 700, 60, 30, '#ffd23f');
  }
}

/* ---------- Merken (Pixel-Plan, Taschi-Memory) ---------- */
export class Memory extends Minigame {
  title = (this.o.title as string) ?? 'Pixel-Plan'; icon = (this.o.icon as string) ?? '🧩';
  howto = ['Decke immer zwei Karten auf.', 'Finde alle Paare – mit möglichst wenigen Zügen!'];
  controls = 'Karten antippen / anklicken';
  private cards: { e: string; open: boolean; done: boolean }[] = []; private first = -1; private second = -1; private wait = 0; private moves = 0;
  init(): void {
    const set = (this.o.set as string[]) ?? ['🐉', '🦊', '🐶', '🌈', '🏰', '🧽', '⭐', '🔱'];
    const r = makeRng(Math.floor(Math.random() * 1e6));
    const arr = [...set, ...set].map(e => ({ e, open: false, done: false }));
    for (let k = arr.length - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); [arr[k], arr[j]] = [arr[j], arr[k]]; }
    this.cards = arr; this.first = this.second = -1; this.moves = 0; this.score = 0;
  }
  private pos(k: number): { x: number; y: number } { const cols = 8; return { x: 60 + (k % cols) * 88, y: 90 + Math.floor(k / cols) * 130 }; }
  step(dt: number, i: MgInput): void {
    if (this.wait > 0) { this.wait -= dt; if (this.wait <= 0) { const a = this.cards[this.first], b = this.cards[this.second]; if (a.e === b.e) { a.done = b.done = true; this.score += 5; this.sfx('star', 0.5); } else { a.open = b.open = false; } this.first = this.second = -1; if (this.cards.every(c => c.done)) { this.score += Math.max(0, 30 - this.moves); this.finish(true, this.moves + ' Züge'); } } return; }
    if (!i.ptap) return;
    this.cards.forEach((c, k) => {
      const p = this.pos(k);
      if (c.open || c.done || i.px < p.x || i.px > p.x + 76 || i.py < p.y || i.py > p.y + 110) return;
      c.open = true; this.sfx('click');
      if (this.first < 0) this.first = k; else { this.second = k; this.moves++; this.wait = 0.7; }
    });
  }
  draw(c: CanvasRenderingContext2D): void {
    sky(c, '#3fa9ff', '#8a5bff');
    this.cards.forEach((cd, k) => { const p = this.pos(k); c.fillStyle = cd.done ? '#2fd17b' : cd.open ? '#fffaf0' : '#ffd23f'; rr(c, p.x, p.y, 76, 110, 12); c.fill(); if (cd.open || cd.done) emoji(c, cd.e, p.x + 38, p.y + 55, 44); else txt(c, '?', p.x + 38, p.y + 55, 40, '#fff'); });
    txt(c, 'Züge: ' + this.moves, W / 2, 50, 24);
  }
}

/* ---------- Melodie nachspielen (Kristall-Harfe, Orchester, Burger-Bestellung) ---------- */
export class Simon extends Minigame {
  title = (this.o.title as string) ?? 'Kristall-Harfe'; icon = (this.o.icon as string) ?? '🎵';
  howto = ['Hör genau hin und schau, welche Kristalle leuchten.', 'Spiel die Reihenfolge nach! Jede Runde wird sie länger.'];
  controls = 'Kristalle antippen · Tasten 1–5';
  private seq: number[] = []; private input: number[] = []; private showT = 0; private showing = true; private light = -1; private lightT = 0; private n = 5;
  private sym = (this.o.symbols as string[]) ?? ['🔴', '🟡', '🟢', '🔵', '🟣'];
  init(): void { this.n = this.sym.length; this.seq = [Math.floor(Math.random() * this.n)]; this.input = []; this.showing = true; this.showT = 0; this.score = 0; }
  private x(k: number): number { return W / 2 + (k - (this.n - 1) / 2) * 130; }
  private press(k: number): void {
    this.light = k; this.lightT = 0.25; this.sfx('note' + [0, 2, 4, 5, 7, 9][k], 0.6);
    this.input.push(k);
    const idx = this.input.length - 1;
    if (this.input[idx] !== this.seq[idx]) { this.finish(this.seq.length >= 6, 'Du hast dir ' + (this.seq.length - 1) + ' Töne gemerkt.'); return; }
    if (this.input.length === this.seq.length) { this.score += this.seq.length; if (this.seq.length >= ((this.o.target as number) ?? 8)) { this.finish(true, 'Meisterhaft!'); return; } this.seq.push(Math.floor(Math.random() * this.n)); this.input = []; this.showing = true; this.showT = -0.6; }
  }
  step(dt: number, i: MgInput): void {
    this.lightT -= dt; if (this.lightT <= 0) this.light = -1;
    if (this.showing) {
      this.showT += dt;
      const k = Math.floor(this.showT / 0.6);
      if (this.showT > 0 && k < this.seq.length && this.showT % 0.6 < dt + 0.001) { this.light = this.seq[k]; this.lightT = 0.4; this.sfx('note' + [0, 2, 4, 5, 7, 9][this.seq[k]], 0.6); }
      if (k >= this.seq.length) this.showing = false;
      return;
    }
    if (i.key && /^Digit[1-6]$/.test(i.key)) { const k = +i.key.slice(5) - 1; if (k < this.n) this.press(k); }
    if (i.ptap) for (let k = 0; k < this.n; k++) if (Math.hypot(i.px - this.x(k), i.py - 240) < 55) this.press(k);
  }
  draw(c: CanvasRenderingContext2D): void {
    sky(c, '#0b3550', '#1f6f8a');
    for (let k = 0; k < this.n; k++) { c.globalAlpha = this.light === k ? 1 : 0.55; c.fillStyle = this.light === k ? '#fff' : 'rgba(255,255,255,.15)'; c.beginPath(); c.arc(this.x(k), 240, 55, 0, 7); c.fill(); c.globalAlpha = 1; emoji(c, this.sym[k], this.x(k), 240, this.light === k ? 64 : 52); txt(c, String(k + 1), this.x(k), 320, 20); }
    txt(c, this.showing ? 'Hör zu …' : 'Du bist dran! (' + this.input.length + '/' + this.seq.length + ')', W / 2, 80, 30, '#ffd23f');
  }
}

/* ---------- Elfmeter (Fußball-Arena) ---------- */
export class Penalty extends Minigame {
  title = 'Elfmeter-Turnier'; icon = '⚽';
  howto = ['Der Zielpfeil wandert hin und her – tippe, um die Richtung festzulegen.', 'Dann wächst die Kraft – tippe nochmal. Ecken sind schwer zu halten!', '5 Schüsse – triff mindestens 3 Mal.'];
  controls = 'Tippen / Leertaste / A';
  private phase: 'aim' | 'power' | 'fly' = 'aim'; private aim = 0; private power = 0; private dir = 1; private shots = 0; private goals = 0; private ball = { x: W / 2, y: 400, t: 0, tx: 0, ty: 0 }; private keeper = W / 2; private keeperT = W / 2; private msg = ''; private msgT = 0;
  init(): void { this.phase = 'aim'; this.shots = 0; this.goals = 0; this.score = 0; this.reset(); }
  private reset(): void { this.ball = { x: W / 2, y: 400, t: 0, tx: 0, ty: 0 }; this.phase = 'aim'; this.aim = 0; this.power = 0; this.keeper = W / 2; }
  step(dt: number, i: MgInput): void {
    this.msgT -= dt;
    const lv = this.o.level ?? 1;
    if (this.phase === 'aim') { this.aim += this.dir * dt * 1.6; if (Math.abs(this.aim) > 1) this.dir *= -1; if (i.tap) { this.phase = 'power'; this.dir = 1; } }
    else if (this.phase === 'power') { this.power += this.dir * dt * 1.4; if (this.power > 1 || this.power < 0) this.dir *= -1; if (i.tap) { this.phase = 'fly'; this.ball.tx = W / 2 + this.aim * 230; this.ball.ty = 150 - this.power * 70; this.keeperT = W / 2 + (Math.random() < 0.5 + lv * 0.08 ? this.aim * 230 : (Math.random() - 0.5) * 300); this.sfx('kick' as string, 0.7); } }
    else {
      this.ball.t += dt * 1.8;
      const t = Math.min(1, this.ball.t);
      this.ball.x = W / 2 + (this.ball.tx - W / 2) * t; this.ball.y = 400 + (this.ball.ty - 400) * t - Math.sin(t * Math.PI) * 40;
      this.keeper += (this.keeperT - this.keeper) * Math.min(1, dt * (3 + lv));
      if (t >= 1) {
        const inGoal = Math.abs(this.ball.tx - W / 2) < 240 && this.power < 0.95;
        const saved = Math.abs(this.keeper - this.ball.tx) < 60;
        this.shots++;
        if (inGoal && !saved) { this.goals++; this.score += 5 + Math.round(Math.abs(this.aim) * 5); this.msg = 'TOOOR! ⚽'; this.sfx('success'); }
        else { this.msg = saved ? 'Gehalten! 🧤' : 'Daneben!'; this.sfx('fail', 0.6); }
        this.msgT = 1.2;
        if (this.shots >= 5) this.finish(this.goals >= 3, this.goals + ' von 5 Toren'); else this.reset();
      }
    }
  }
  draw(c: CanvasRenderingContext2D): void {
    sky(c, '#7fd8ff', '#c8ffd0');
    c.fillStyle = '#4cbf55'; c.fillRect(0, 230, W, H);
    c.strokeStyle = '#fff'; c.lineWidth = 8; c.strokeRect(W / 2 - 250, 70, 500, 170);
    c.lineWidth = 1; c.strokeStyle = 'rgba(255,255,255,.4)'; for (let k = 0; k < 20; k++) { c.beginPath(); c.moveTo(W / 2 - 250 + k * 25, 70); c.lineTo(W / 2 - 250 + k * 25, 240); c.stroke(); }
    emoji(c, '🧤', this.keeper, 190, 56);
    emoji(c, '⚽', this.ball.x, this.ball.y, 40);
    if (this.phase === 'aim') { c.strokeStyle = '#ffd23f'; c.lineWidth = 6; c.beginPath(); c.moveTo(W / 2, 390); c.lineTo(W / 2 + this.aim * 230, 160); c.stroke(); }
    if (this.phase === 'power') { c.fillStyle = 'rgba(255,255,255,.7)'; rr(c, 720, 140, 30, 240, 10); c.fill(); c.fillStyle = this.power > 0.9 ? '#ff4040' : '#ffd23f'; rr(c, 720, 380 - 240 * this.power, 30, 240 * this.power, 10); c.fill(); }
    txt(c, 'Tore ' + this.goals + ' / Schüsse ' + this.shots + ' (5)', W / 2, 30, 24);
    if (this.msgT > 0) txt(c, this.msg, W / 2, 300, 48, '#ffd23f');
  }
}

/* ---------- Frequenz (Funkwelle): Nadel im grünen Bereich stoppen ---------- */
export class Frequency extends Minigame {
  title = 'Frequenz-Dreher'; icon = '📻';
  howto = ['Die Nadel wandert über die Skala.', 'Stoppe sie im leuchtenden Bereich – dann ist der Sender klar zu hören!'];
  controls = 'Tippen / Leertaste / A';
  private needle = 0; private dir = 1; private zone = 0.5; private zw = 0.18; private round = 0; private hits = 0; private flash = 0;
  init(): void { this.round = 0; this.hits = 0; this.score = 0; this.next(); }
  private next(): void { this.zone = 0.15 + Math.random() * 0.7; this.zw = Math.max(0.05, 0.18 - this.round * 0.015); this.needle = 0; this.dir = 1; }
  step(dt: number, i: MgInput): void {
    this.flash -= dt;
    this.needle += this.dir * dt * (0.6 + this.round * 0.12); if (this.needle > 1 || this.needle < 0) this.dir *= -1;
    if (i.tap) { const ok = Math.abs(this.needle - this.zone) < this.zw / 2; if (ok) { this.hits++; this.score += 3 + this.round; this.sfx('star'); } else this.sfx('fail', 0.5); this.flash = 0.4; this.round++; if (this.round >= 8) this.finish(this.hits >= 5, this.hits + ' von 8 Sendern gefunden'); else this.next(); }
  }
  draw(c: CanvasRenderingContext2D): void {
    sky(c, '#2a1f4a', '#5b4bd6');
    c.fillStyle = '#fff6dc'; rr(c, 100, 160, 600, 120, 20); c.fill();
    c.fillStyle = 'rgba(47,209,123,.7)'; c.fillRect(120 + (this.zone - this.zw / 2) * 560, 175, this.zw * 560, 90);
    for (let k = 0; k <= 20; k++) { c.fillStyle = '#2a1f4a'; c.fillRect(120 + k * 28, 240, 2, k % 5 ? 14 : 24); }
    c.fillStyle = '#e8453c'; c.fillRect(118 + this.needle * 560, 170, 5, 100);
    txt(c, 'Sender ' + (this.round + 1) + ' / 8', W / 2, 100, 28);
    if (this.flash > 0) txt(c, '📡', W / 2, 340, 50);
  }
}
