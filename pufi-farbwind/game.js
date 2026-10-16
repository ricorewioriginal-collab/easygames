// Pufi & der Farbwind – eigenständiges Insel-Jump-and-Run.
// Alle Figuren, Namen, Grafiken (Canvas-Zeichnungen) und Klänge (WebAudio-Synthese) sind eigene Werke.
(() => {
'use strict';
const LV = window.PufiLevels, WORLDS = LV.WORLDS, COUNT = LV.COUNT, PER = LV.PER_WORLD;
const $ = id => document.getElementById(id);
const C = $('stage'), ctx = C.getContext('2d', { alpha: false });
const T = 16, VH = 270;
let VW = 480, SCALE = 2;

// ---------- Physik ----------
const RUN = 125, ACC_GROUND = 950, ACC_AIR = 620, DECEL = 1150;
const GRAV = 1000, GRAV_HOLD = 560, JUMP = 310, MAXFALL = 340;
const FLUTTER_TIME = 0.62, FLUTTER_LIFT = 72, POUND_SPEED = 470;
const MAX_EGGS = 6, MAX_STARS = 30, BASE_STARS = 10;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const approach = (v, target, step) => v < target ? Math.min(target, v + step) : Math.max(target, v - step);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// ---------- Spielstand ----------
const KEY = 'easygames.pufi-farbwind.v2', OLD_KEY = 'easygames.pufi-farbwind.v1';
const save = { unlocked: 1, best: {}, sound: true, music: true, controls: 'stick', touch: 'auto', bank: { lives: 0, coins: 0 } };
try {
  const x = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (x) {
    save.unlocked = clamp(+x.unlocked || 1, 1, COUNT); save.best = x.best && typeof x.best === 'object' ? x.best : {};
    save.sound = x.sound !== false; save.music = x.music !== false;
    save.controls = x.controls === 'dpad' ? 'dpad' : 'stick'; save.touch = ['on', 'off'].includes(x.touch) ? x.touch : 'auto';
    if (x.bank) save.bank = { lives: clamp(+x.bank.lives || 0, 0, 9), coins: clamp(+x.bank.coins || 0, 0, 99) };
  } else {
    const old = JSON.parse(localStorage.getItem(OLD_KEY) || 'null');
    if (old && old.unlocked) save.unlocked = clamp(Math.floor((+old.unlocked - 1) / 8) * PER + 1, 1, COUNT);
    if (old && old.sound === false) save.sound = false;
  }
} catch (_) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (_) {} };

// ---------- Klang ----------
const Sound = {
  ac: null, sfx: null, mus: null, timer: 0, step: 0, next: 0, world: -1,
  ensure() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume().catch(() => {}); return this.ac; }
    const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
    try {
      this.ac = new A(); const m = this.ac.createGain(); m.gain.value = 0.9; m.connect(this.ac.destination);
      this.sfx = this.ac.createGain(); this.sfx.gain.value = 0.55; this.sfx.connect(m);
      this.mus = this.ac.createGain(); this.mus.gain.value = 0.32; this.mus.connect(m);
    } catch (_) { this.ac = null; }
    return this.ac;
  },
  tone(f, d = 0.1, type = 'triangle', vol = 0.12, slide = 0.7, when = 0, bus) {
    if (!save.sound && !bus) return; const ac = this.ensure(); if (!ac) return;
    try {
      const t0 = (when || ac.currentTime), o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t0);
      if (slide !== 1) o.frequency.exponentialRampToValueAtTime(Math.max(40, f * slide), t0 + d);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0004, t0 + d);
      o.connect(g); g.connect(bus || this.sfx); o.start(t0); o.stop(t0 + d + 0.02);
    } catch (_) {}
  },
  play(name) {
    if (!save.sound) return;
    const s = this;
    switch (name) {
      case 'jump': s.tone(420, 0.12, 'square', 0.05, 1.6); break;
      case 'flutter': s.tone(700, 0.05, 'triangle', 0.05, 1.2); break;
      case 'coin': s.tone(1320, 0.08, 'square', 0.04, 1); s.tone(1760, 0.12, 'square', 0.035, 1, s.ac && s.ac.currentTime + 0.06); break;
      case 'red': s.tone(990, 0.1, 'square', 0.05, 1); s.tone(1480, 0.18, 'triangle', 0.06, 1, s.ac && s.ac.currentTime + 0.07); break;
      case 'star': s.tone(1568, 0.07, 'triangle', 0.06, 1.2); break;
      case 'flower': [784, 988, 1175, 1568].forEach((f, i) => s.tone(f, 0.14, 'triangle', 0.07, 1, s.ac && s.ac.currentTime + i * 0.07)); break;
      case 'tongue': s.tone(300, 0.1, 'sawtooth', 0.04, 2.2); break;
      case 'gulp': s.tone(240, 0.16, 'triangle', 0.09, 0.5); break;
      case 'egg': s.tone(520, 0.08, 'triangle', 0.08, 1.5); s.tone(780, 0.1, 'triangle', 0.06, 1, s.ac && s.ac.currentTime + 0.06); break;
      case 'throw': s.tone(620, 0.12, 'square', 0.05, 0.5); break;
      case 'bounce': s.tone(330, 0.06, 'triangle', 0.05, 1.3); break;
      case 'pop': s.tone(880, 0.12, 'square', 0.05, 0.4); break;
      case 'stomp': s.tone(200, 0.14, 'square', 0.07, 0.5); break;
      case 'pound': s.tone(140, 0.22, 'sawtooth', 0.08, 0.4); break;
      case 'hurt': s.tone(520, 0.16, 'sawtooth', 0.07, 0.5); s.tone(310, 0.3, 'triangle', 0.07, 0.6, s.ac && s.ac.currentTime + 0.12); break;
      case 'cry': s.tone(1046, 0.09, 'triangle', 0.05, 0.85); s.tone(880, 0.12, 'triangle', 0.05, 0.85, s.ac && s.ac.currentTime + 0.11); break;
      case 'tick': s.tone(1200, 0.03, 'square', 0.025, 1); break;
      case 'rescue': [660, 880, 1320].forEach((f, i) => s.tone(f, 0.12, 'triangle', 0.07, 1, s.ac && s.ac.currentTime + i * 0.06)); break;
      case 'ring': [523, 659, 784, 1046, 1318].forEach((f, i) => s.tone(f, 0.16, 'triangle', 0.06, 1, s.ac && s.ac.currentTime + i * 0.06)); break;
      case 'block': s.tone(260, 0.08, 'square', 0.06, 1.2); break;
      case 'boss': s.tone(180, 0.3, 'sawtooth', 0.08, 0.5); break;
      case 'lose': [440, 370, 311, 262].forEach((f, i) => s.tone(f, 0.22, 'triangle', 0.07, 0.9, s.ac && s.ac.currentTime + i * 0.16)); break;
      case 'clear': [523, 659, 784, 659, 784, 1046].forEach((f, i) => s.tone(f, 0.18, 'square', 0.045, 1, s.ac && s.ac.currentTime + i * 0.11)); break;
      case 'menu': s.tone(660, 0.06, 'triangle', 0.05, 1); break;
      case 'bonk': s.tone(150, 0.08, 'square', 0.05, 0.8); break;
    }
  },
  // Kleine, selbst komponierte Melodie je Insel aus einer pentatonischen Reihe.
  startMusic(w) {
    if (!save.music) return this.stopMusic(); const ac = this.ensure(); if (!ac) return;
    if (this.timer && this.world === w) return; this.stopMusic(); this.world = w;
    const scales = [[0, 2, 4, 7, 9], [0, 3, 5, 7, 10], [0, 2, 5, 7, 9], [0, 2, 4, 7, 11], [0, 3, 5, 7, 8], [0, 1, 5, 7, 10]];
    const roots = [60, 62, 57, 64, 55, 58], sc = scales[w], root = roots[w];
    let seed = 77 + w * 31; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const mel = [], bass = [];
    for (let bar = 0; bar < 4; bar++) for (let i = 0; i < 8; i++) {
      const rest = rnd() < 0.22 && i % 2 === 1; const deg = Math.floor(rnd() * sc.length), oct = rnd() < 0.25 ? 12 : 0;
      mel.push(rest ? null : root + sc[deg] + oct);
    }
    for (let bar = 0; bar < 4; bar++) { const b = root - 24 + [0, 5, 7, 3][(bar + w) % 4]; for (let i = 0; i < 8; i++) bass.push(i % 2 === 0 ? b : (i % 4 === 3 ? b + 7 : null)); }
    const freq = m => 440 * Math.pow(2, (m - 69) / 12), stepLen = 60 / (112 + w * 4) / 2;
    this.step = 0; this.next = ac.currentTime + 0.1;
    this.timer = setInterval(() => {
      if (!this.ac) return;
      while (this.next < this.ac.currentTime + 0.15) {
        const i = this.step % mel.length;
        if (mel[i]) this.tone(freq(mel[i]), stepLen * 1.6, 'triangle', 0.06, 1, this.next, this.mus);
        if (bass[i]) this.tone(freq(bass[i]), stepLen * 1.8, 'square', 0.025, 1, this.next, this.mus);
        if (i % 4 === 0) this.tone(90, 0.05, 'sine', 0.05, 0.5, this.next, this.mus);
        this.step++; this.next += stepLen;
      }
    }, 50);
  },
  stopMusic() { if (this.timer) clearInterval(this.timer); this.timer = 0; this.world = -1; }
};

// ---------- Eingabe ----------
const input = { left: false, right: false, up: false, down: false, jump: false, tongue: false, throw: false };
const holds = Object.fromEntries(Object.keys(input).map(k => [k, new Set()]));
let padAim = null; // Zielrichtung vom rechten Stick
function clearInputs() { for (const k in input) { input[k] = false; holds[k].clear(); } padAim = null; resetStick(); }
function action(key, on, source = 'kbd') {
  if (key === 'pause') { if (on) togglePause(); return; }
  const set = holds[key]; if (!set) return;
  const before = set.size > 0; if (on) set.add(source); else set.delete(source);
  const now = set.size > 0; if (now === before) return;
  input[key] = now;
  if (mode === 'bonus') { if (now) bonusPress(key); return; }
  if (mode !== 'play' || !P || P.dead) return;
  if (now) press(key); else release(key);
}

// ---------- Zustand ----------
let mode = 'title', L = null, P = null, cam = { x: 0, y: 0 }, t = 0, shake = 0;
let particles = [], session = { lives: 5, coins: 0 }, previousView = null, selected = 0, dirty = true;
let hudCache = {};

function newHero(x, y) {
  return { x, y, w: 14, h: 22, vx: 0, vy: 0, ground: false, face: 1, coyote: 0, jumpBuf: 0, flutterT: 0, flutterAvail: false, flutterN: 0,
    pound: 0, poundT: 0, tongue: null, mouth: null, aim: null, inv: 0, eggs: 0, trail: [], dead: null, platform: null, anim: 0, blink: 0, spitCd: 0 };
}

function build(n, keep) {
  const data = LV.build(n), wd = WORLDS[data.world];
  const lvl = {
    n, data, w: data.world, wd, cols: data.cols, rows: data.rows, grid: data.grid.map(r => r.split('')),
    enemies: [], items: [], clouds: [], movers: [], crumbles: [], springs: [], eggsFly: [], spits: [], bumps: {}, rings: [], goal: null,
    boss: null, arenaX: data.arenaX >= 0 ? data.arenaX * T : -1, locked: false, bossDone: keep ? keep.bossDone : false,
    collected: keep ? keep.collected : new Set(), counts: keep ? keep.counts : { red: 0, flowers: 0, coins: 0 },
    checkpoint: keep ? keep.checkpoint : null, stars: BASE_STARS, starTimer: 0, regen: 0, baby: null, kidnap: null, msg: null,
    clearT: -1, intro: 2.4, totals: data.totals, spawnT: 0, startX: 0, startY: 0
  };
  for (const s of data.spawns) {
    const x = s.c * T, y = s.r * T, key = s.c + ',' + s.r;
    switch (s.ch) {
      case 'P': lvl.startX = x; lvl.startY = y - 6; break;
      case 'G': lvl.goal = { x: x + 8, y: y + T }; break;
      case 'M': lvl.rings.push({ x: x + 8, y: y + 8, key, passed: lvl.checkpoint && lvl.checkpoint.key === key, t: 0 }); break;
      case 'o': case 'r': case 'F': case '*':
        if (!lvl.collected.has(key)) lvl.items.push({ type: { o: 'coin', r: 'red', F: 'flower', '*': 'star' }[s.ch], x: x + 2, y: y + 2, w: 12, h: 12, key, ph: s.c * 0.7 });
        break;
      case 'W': case 'V': lvl.clouds.push({ x: x - 4, y, baseY: y, w: 24, h: 16, kind: s.ch === 'V' && !lvl.collected.has('V' + key) ? 'flower' : 'stars', key: 'V' + key, ph: s.c, popped: false }); break;
      case 'x': lvl.crumbles.push({ x, y, w: T, h: 8, t: 0, state: 0, oneWay: true }); break;
      case 'm': lvl.movers.push({ x, y, w: T * 3, h: 8, baseX: x, range: 32, ph: s.c * 0.4, dx: 0, dy: 0, oneWay: true }); break;
      case 'J': lvl.springs.push({ x: x + 1, y: y + T - 10, w: 14, h: 10, sq: 0 }); break;
      case 'B': lvl.bossSpawn = { x, y }; break;
      default: if ('ghfkp'.includes(s.ch)) lvl.enemies.push(makeEnemy(s.ch, x, y));
    }
  }
  return lvl;
}

function makeEnemy(ch, x, y) {
  const base = { x: x + 1, y: y + 2, w: 14, h: 14, vx: 0, vy: 0, alive: true, face: -1, t: Math.random() * 3, ground: false, ch };
  switch (ch) {
    case 'g': return Object.assign(base, { kind: 'walker', vx: -28, edible: true, stomp: true });
    case 'h': return Object.assign(base, { kind: 'hopper', edible: true, stomp: true, hopT: 1 + Math.random() });
    case 'f': return Object.assign(base, { kind: 'flyer', edible: true, stomp: true, baseX: x, baseY: y - 8, fly: true });
    case 'k': return Object.assign(base, { kind: 'spiky', vx: -20, edible: false, stomp: false });
    case 'p': return Object.assign(base, { kind: 'plant', w: 14, h: 20, y: y - 4, edible: false, stomp: false, open: 0 });
  }
}

function startLevel(n, keep) {
  L = build(n, keep); selected = n;
  const cp = L.checkpoint;
  P = newHero(cp ? cp.x : L.startX, cp ? cp.y : L.startY);
  if (keep && keep.eggs !== undefined) P.eggs = keep.eggs;
  L.baby = { on: true, x: P.x, y: P.y, vx: 0, vy: 0 };
  cam.x = clamp(P.x - VW * 0.4, 0, L.cols * T - VW); cam.y = clamp(P.y - VH * 0.6, 0, L.rows * T - VH);
  particles = []; t = 0; hudCache = {};
  mode = 'play'; hideOverlay(); showTouch(true); clearInputs(); hud();
  Sound.startMusic(L.w);
}

// ---------- Kachelabfragen ----------
const tile = (c, r) => (c < 0 || c >= L.cols) ? '#' : (r < 0 || r >= L.rows) ? ' ' : L.grid[r][c];
const isSolid = ch => ch === '#' || ch === 'Q';

function moveBody(b, dt, opts = {}) {
  const res = { hitX: 0, hitY: 0, heads: [] };
  b.x += b.vx * dt;
  const r0 = Math.floor(b.y / T), r1 = Math.floor((b.y + b.h - 0.01) / T);
  if (b.vx > 0) {
    const c = Math.floor((b.x + b.w - 0.01) / T);
    for (let r = r0; r <= r1; r++) if (isSolid(tile(c, r))) { b.x = c * T - b.w; res.hitX = 1; res.tileX = [c, r]; break; }
  } else if (b.vx < 0) {
    const c = Math.floor(b.x / T);
    for (let r = r0; r <= r1; r++) if (isSolid(tile(c, r))) { b.x = (c + 1) * T; res.hitX = -1; res.tileX = [c, r]; break; }
  }
  const prevBottom = b.y + b.h; b.y += b.vy * dt; b.ground = false;
  const c0 = Math.floor((b.x + 0.5) / T), c1 = Math.floor((b.x + b.w - 0.5) / T);
  if (b.vy >= 0) {
    const r = Math.floor((b.y + b.h) / T);
    for (let c = c0; c <= c1; c++) {
      const ch = tile(c, r);
      if (isSolid(ch) || (ch === '=' && prevBottom <= r * T + 0.5)) { b.y = r * T - b.h; b.vy = 0; b.ground = true; res.hitY = 1; res.tileY = [c, r]; break; }
    }
    if (!b.ground && opts.platforms) for (const p of opts.platforms) {
      if (b.x + b.w > p.x + 1 && b.x < p.x + p.w - 1 && prevBottom <= p.y + 1 + Math.max(0, p.dy || 0) && b.y + b.h >= p.y) {
        b.y = p.y - b.h; b.vy = 0; b.ground = true; res.platform = p; res.hitY = 1; break;
      }
    }
  } else {
    const r = Math.floor(b.y / T);
    for (let c = c0; c <= c1; c++) if (isSolid(tile(c, r))) { res.heads.push([c, r]); }
    if (res.heads.length) { b.y = (r + 1) * T; b.vy = 0; res.hitY = -1; }
  }
  return res;
}

function activePlatforms() { return L.movers.concat(L.crumbles.filter(c => c.state < 2)); }

// ---------- Aktionen ----------
function press(key) {
  if (key === 'jump') {
    P.jumpBuf = 0.12;
    if (!P.ground && P.coyote <= 0) P.flutterAvail = true;
  } else if (key === 'tongue') {
    if (P.aim) { P.aim = null; return; }
    if (P.mouth) spit(); else startTongue();
  } else if (key === 'throw') {
    if (P.mouth) { spit(); return; }
    if (P.aim) { throwEgg(); return; }
    if (P.eggs > 0) P.aim = { t: 0 }; else Sound.play('bonk');
  } else if (key === 'down') {
    if (P.mouth && P.ground) layEgg();
    else if (!P.ground && !P.pound) { P.pound = 1; P.poundT = 0.17; P.vx = 0; P.vy = 0; P.flutterT = 0; P.aim = null; Sound.play('pound'); }
    else if (P.mouth) layEgg();
  }
}
function release(key) {
  if (key === 'jump') P.flutterT = 0;
  if (key === 'throw' && P.aim && P.aim.t > 0.28) throwEgg();
}

function startTongue() {
  if (P.tongue) return;
  P.tongue = { t: 0, out: true, ang: input.up ? -0.78 : 0, caught: null, len: 0 };
  Sound.play('tongue');
}
function mouthPos() { return { x: P.x + P.w / 2 + P.face * 8, y: P.y + 7 }; }
function tongueTip() {
  const m = mouthPos(), tg = P.tongue;
  return { x: m.x + Math.cos(tg.ang) * tg.len * P.face, y: m.y + Math.sin(tg.ang) * tg.len };
}
function layEgg() {
  if (!P.mouth) return;
  P.mouth = null;
  if (P.eggs < MAX_EGGS) { P.eggs++; Sound.play('egg'); burst(P.x + P.w / 2 - P.face * 10, P.y + P.h - 4, '#fff6dc', 8); }
  else { L.stars = Math.min(MAX_STARS, L.stars + 1); Sound.play('star'); }
  hud();
}
function spit() {
  if (!P.mouth || P.spitCd > 0) return;
  const m = mouthPos();
  L.spits.push({ x: m.x - 6, y: m.y - 6, w: 12, h: 12, vx: P.face * 280, vy: 0, life: 1.2, ch: P.mouth });
  P.mouth = null; P.spitCd = 0.2; Sound.play('throw');
}
function aimAngle() {
  if (padAim) return padAim.ang;
  const ph = (P.aim.t / 1.5) % 1, tri = ph < 0.5 ? ph * 2 : 2 - ph * 2;
  return -0.2 + tri * 1.5; // von leicht unter waagerecht bis steil nach oben
}
function throwEgg() {
  if (!P.aim) return;
  if (P.eggs <= 0) { P.aim = null; return; }
  const ang = aimAngle(), dirX = padAim ? padAim.dir : P.face;
  if (padAim) P.face = padAim.dir;
  P.eggs--; P.aim = null;
  const cx = P.x + P.w / 2, cy = P.y + 8;
  L.eggsFly.push({ x: cx - 5 + dirX * 8, y: cy - 6, w: 10, h: 12, vx: Math.cos(ang) * 360 * dirX, vy: -Math.sin(ang) * 360, bounces: 2, life: 2.4, spin: 0 });
  Sound.play('throw'); hud();
}
function bump(c, r) {
  const k = c + ',' + r; if (L.bumps[k] > 0) return; L.bumps[k] = 0.25;
  Sound.play('block');
  if (P.eggs < MAX_EGGS) { P.eggs++; Sound.play('egg'); burst(c * T + 8, r * T, '#fff4cc', 8); }
  else { addCoin(); burst(c * T + 8, r * T, '#ffe08a', 6); }
  hud();
}
function addCoin() {
  session.coins++; L.counts.coins++;
  if (session.coins % 100 === 0) { session.lives++; showMsg('+1 LEBEN'); }
}
function collect(it) {
  if (it.got) return; it.got = true; if (it.key) L.collected.add(it.key);
  const cx = it.x + 6, cy = it.y + 6;
  if (it.type === 'coin') { addCoin(); Sound.play('coin'); burst(cx, cy, '#ffe28a', 5); }
  else if (it.type === 'red') { addCoin(); L.counts.red++; Sound.play('red'); burst(cx, cy, '#ff9a8a', 8); }
  else if (it.type === 'flower') { L.counts.flowers++; Sound.play('flower'); burst(cx, cy, '#ffc4dc', 14); showMsg('FARBBLÜTE ' + L.counts.flowers + '/' + L.totals.flowers); }
  else if (it.type === 'star') { L.stars = Math.min(MAX_STARS, L.stars + 1); Sound.play('star'); burst(cx, cy, '#fff8b0', 5); }
  hud();
}
function popCloud(cl) {
  if (cl.popped) return; cl.popped = true; Sound.play('pop'); burst(cl.x + 12, cl.y + 8, '#ffffff', 14);
  if (cl.kind === 'flower') L.items.push({ type: 'flower', x: cl.x + 6, y: cl.y, w: 12, h: 12, vx: 0, vy: -120, dyn: true, key: cl.key });
  else for (let i = 0; i < 5; i++) L.items.push({ type: 'star', x: cl.x + 6, y: cl.y, w: 12, h: 12, vx: (i - 2) * 45, vy: -150 - (i % 2) * 40, dyn: true, life: 6 });
}
function killEnemy(e, how) {
  if (!e.alive) return; e.alive = false;
  burst(e.x + e.w / 2, e.y + e.h / 2, how === 'egg' ? '#fff3c9' : '#ffd0e4', 10);
  Sound.play(how === 'stomp' ? 'stomp' : 'pop');
  if (how === 'egg' && Math.random() < 0.35) L.items.push({ type: 'star', x: e.x, y: e.y - 4, w: 12, h: 12, vx: 0, vy: -140, dyn: true, life: 6 });
}

function hurt(from) {
  if (P.inv > 0 || P.dead || L.clearT >= 0) return;
  const dir = from ? Math.sign(P.x - from.x) || -P.face : -P.face;
  P.vx = dir * 140; P.vy = -230; P.inv = 1.1; P.pound = 0; P.flutterT = 0; P.aim = null;
  rumble(180, 0.6);
  if (L.baby.on) {
    L.baby = { on: false, x: P.x - 5, y: P.y - 10, vx: -dir * 60, vy: -40, t: 0 };
    L.starTimer = 0; Sound.play('hurt'); Sound.play('cry');
  } else Sound.play('bonk');
}
function die(reason) {
  if (P.dead) return;
  P.dead = { t: 0, reason }; P.vx = 0; P.vy = -260; Sound.play('lose'); rumble(400, 1);
}
function respawn() {
  session.lives--;
  if (session.lives <= 0) { showGameOver(); return; }
  const keep = { collected: L.collected, counts: L.counts, checkpoint: L.checkpoint, eggs: P.eggs, bossDone: L.bossDone };
  startLevel(L.n, keep);
}

// ---------- Spiel-Schleife ----------
function tick(dt) {
  t += dt;
  for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 320 * dt; p.life -= dt; }
  if (particles.length) particles = particles.filter(p => p.life > 0);
  if (shake > 0) shake = Math.max(0, shake - dt * 18);
  if (L.intro > 0) L.intro -= dt;
  if (L.msg) { L.msg.t -= dt; if (L.msg.t <= 0) L.msg = null; }
  if (P.dead) {
    P.dead.t += dt; P.vy += GRAV * dt; P.y += P.vy * dt;
    if (P.dead.t > 1.9) respawn();
    return;
  }
  if (L.clearT >= 0) {
    L.clearT += dt; P.vx = L.roulette ? 0 : 60; P.face = 1; P.vy += GRAV * dt; moveBody(P, dt);
    if (L.clearT > 1.3 && !L.roulette) startRoulette();
    if (L.roulette && !L.roulette.finished) updateRoulette(dt);
    return;
  }
  updateMovers(dt);
  updateHero(dt);
  if (P.dead || mode !== 'play') return;
  updateTongue(dt);
  updateEggs(dt);
  updateEnemies(dt);
  updateItems(dt);
  updateBoss(dt);
  updateBaby(dt);
  if (P.dead || mode !== 'play') return;
  for (const r of L.rings) {
    r.t += dt;
    if (!r.passed && P.x + P.w / 2 > r.x && Math.abs(P.y - r.y) < 90) {
      r.passed = true; L.checkpoint = { x: r.x - 8, y: r.y - 30, key: r.key };
      L.stars = Math.min(MAX_STARS, L.stars + 10); Sound.play('ring'); burst(r.x, r.y, '#ffe9a8', 24); showMsg('FARBRING! +10 ★'); hud();
    }
  }
  if (L.goal && (!L.data.boss || L.bossDone) && P.x + P.w / 2 > L.goal.x && L.clearT < 0) {
    L.clearT = 0; Sound.play('clear'); burst(L.goal.x, L.goal.y - 30, '#fff1b5', 30); P.aim = null; P.tongue = null;
  }
  updateCamera(dt);
}

function updateMovers(dt) {
  for (const m of L.movers) {
    const nx = m.baseX + Math.sin(t * 1.1 + m.ph) * m.range;
    m.dx = nx - m.x; m.x = nx; m.dy = 0;
  }
  for (const c of L.crumbles) {
    if (c.state === 1) { c.t -= dt; if (c.t <= 0) { c.state = 2; c.t = 3; c.fall = 0; } }
    else if (c.state === 2) { c.t -= dt; c.fall += dt * 120; if (c.t <= 0) { c.state = 0; c.fall = 0; } }
  }
  for (const s of L.springs) s.sq = Math.max(0, s.sq - dt * 4);
  for (const k in L.bumps) { L.bumps[k] -= dt; if (L.bumps[k] <= 0) delete L.bumps[k]; }
}

function updateHero(dt) {
  const p = P;
  p.inv = Math.max(0, p.inv - dt); p.jumpBuf = Math.max(0, p.jumpBuf - dt); p.coyote = Math.max(0, p.coyote - dt);
  p.spitCd = Math.max(0, p.spitCd - dt); p.anim += dt; if (p.aim) p.aim.t += dt;
  if (p.platform && p.ground) { p.x += p.platform.dx || 0; }
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (p.pound) {
    p.vx = 0;
    if (p.pound === 1) { p.poundT -= dt; p.vy = 0; if (p.poundT <= 0) { p.pound = 2; p.vy = POUND_SPEED; } }
    else p.vy = POUND_SPEED;
  } else {
    if (dir) { const acc = p.ground ? ACC_GROUND : ACC_AIR; p.vx = approach(p.vx, dir * RUN, acc * dt); if (!p.aim || !padAim) p.face = dir; }
    else p.vx = approach(p.vx, 0, (p.ground ? DECEL : ACC_AIR * 0.5) * dt);
    if (p.jumpBuf > 0 && (p.ground || p.coyote > 0)) {
      p.vy = -JUMP; p.ground = false; p.coyote = 0; p.jumpBuf = 0; p.flutterAvail = true; p.flutterN = 0; p.platform = null;
      Sound.play('jump'); burst(p.x + p.w / 2, p.y + p.h, '#fff6df', 4);
    }
    if (input.jump && !p.ground && p.vy > 20 && p.flutterAvail && p.flutterT <= 0) {
      p.flutterAvail = false; p.flutterT = FLUTTER_TIME; p.flutterStr = Math.pow(0.6, p.flutterN); p.flutterN++;
    }
    if (p.flutterT > 0 && input.jump) {
      p.flutterT -= dt; p.vy = approach(p.vy, -FLUTTER_LIFT * p.flutterStr, 1700 * dt);
      if (Math.floor(p.flutterT * 14) !== Math.floor((p.flutterT + dt) * 14)) Sound.play('flutter');
    } else {
      p.flutterT = 0;
      p.vy = Math.min(MAXFALL, p.vy + (p.vy < 0 && input.jump ? GRAV_HOLD : GRAV) * dt);
    }
  }
  const wasGround = p.ground;
  const res = moveBody(p, dt, { platforms: activePlatforms() });
  p.platform = res.platform || null;
  const minX = L.locked ? L.arenaX : 0;
  if (p.x < minX) { p.x = minX; p.vx = 0; }
  if (p.x > L.cols * T - p.w) { p.x = L.cols * T - p.w; p.vx = 0; }
  for (const [c, r] of res.heads) if (tile(c, r) === 'Q') bump(c, r);
  if (p.ground) {
    p.coyote = 0.1; p.flutterAvail = false; p.flutterT = 0; p.flutterN = 0;
    if (p.pound === 2) {
      p.pound = 0; shake = 3; Sound.play('stomp'); burst(p.x + p.w / 2, p.y + p.h, '#f4e3c0', 12); rumble(120, 0.5);
      for (const e of L.enemies) if (e.alive && Math.abs(e.x + e.w / 2 - (p.x + p.w / 2)) < 40 && Math.abs(e.y + e.h - (p.y + p.h)) < 20) killEnemy(e, 'stomp');
    }
    const plat = res.platform;
    if (plat && plat.state === 0 && L.crumbles.includes(plat)) { plat.state = 1; plat.t = 0.45; }
  } else if (wasGround && p.vy >= 0) p.coyote = 0.1;
  for (const s of L.springs) {
    if (p.vy >= 0 && overlap(p, s) && p.y + p.h - p.vy * dt <= s.y + 6) {
      p.y = s.y - p.h; p.vy = -430; p.pound = 0; p.ground = false; p.flutterAvail = true; s.sq = 1; Sound.play('bounce'); burst(s.x + 7, s.y, '#ffd4ec', 8);
    }
  }
  // Gefahren auf Kacheln
  const c0 = Math.floor(p.x / T), c1 = Math.floor((p.x + p.w - 1) / T), r0 = Math.floor(p.y / T), r1 = Math.floor((p.y + p.h - 1) / T);
  for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) {
    const ch = tile(c, r);
    if (ch === '~' && p.y + p.h > r * T + 6) { die('Pufi ist in den Farbsumpf gefallen.'); return; }
    if (ch === '^' && p.y + p.h > r * T + 7) { hurt({ x: c * T + 8 }); p.vy = -280; }
  }
  if (p.y > L.rows * T + 24) { die('Pufi ist in die Tiefe gefallen.'); return; }
  if (p.ground && Math.abs(p.vx) < 1 && dir === 0) p.blink += dt; else p.blink = 0;
  // Eier folgen Pufi wie eine Kette.
  const tr = p.trail;
  while (tr.length < p.eggs) { const l = tr[tr.length - 1] || { x: p.x + p.w / 2, y: p.y + p.h - 6 }; tr.push({ x: l.x, y: l.y }); }
  if (tr.length > p.eggs) tr.length = p.eggs;
  let lx = p.x + p.w / 2 - p.face * 11, ly = p.y + p.h - 6;
  for (const e of tr) {
    const dx = e.x - lx, dy = e.y - ly, d = Math.hypot(dx, dy);
    if (d > 11) { e.x = lx + dx / d * 11; e.y = ly + dy / d * 11; }
    lx = e.x; ly = e.y;
  }
}

function updateTongue(dt) {
  const tg = P.tongue; if (!tg) return;
  tg.t += dt;
  const MAX = 58, SPEED = 520;
  if (tg.out) { tg.len += SPEED * dt; if (tg.len >= MAX) { tg.len = MAX; tg.out = false; } }
  else { tg.len -= SPEED * dt; if (tg.len <= 0) { if (tg.caught) { P.mouth = tg.caught; Sound.play('gulp'); } P.tongue = null; return; } }
  const tip = tongueTip(), box = { x: tip.x - 6, y: tip.y - 6, w: 12, h: 12 };
  if (tg.out && !tg.caught) {
    for (const e of L.enemies) if (e.alive && overlap(box, e)) {
      if (e.edible) { e.alive = false; tg.caught = e.ch; tg.out = false; tg.enemy = e; }
      else { tg.out = false; Sound.play('bonk'); }
      break;
    }
    const tc = Math.floor(tip.x / T), tr = Math.floor(tip.y / T);
    if (tg.out && isSolid(tile(tc, tr))) tg.out = false;
  }
  for (const it of L.items) if (!it.got && overlap(box, it)) collect(it);
}

function updateEggs(dt) {
  for (const e of L.eggsFly) {
    e.life -= dt; e.spin += dt * 14;
    const res = moveBody(e, dt);
    if (res.hitX) { e.vx = -e.vx; e.bounces--; Sound.play('bounce'); if (res.tileX && tile(res.tileX[0], res.tileX[1]) === 'Q') bump(res.tileX[0], res.tileX[1]); }
    if (res.hitY) {
      const tl = res.hitY > 0 ? res.tileY : res.heads[0];
      if (tl && tile(tl[0], tl[1]) === 'Q') bump(tl[0], tl[1]);
      e.vy = res.hitY > 0 ? -Math.abs(e.vy || 200) : Math.abs(e.vy || 200);
      if (res.hitY > 0) e.y -= 1;
      e.bounces--; Sound.play('bounce');
    }
    if (!e.vy && !e.vx) e.life = 0;
    if (e.bounces < 0) e.life = 0;
    for (const en of L.enemies) if (en.alive && overlap(e, en)) { killEnemy(en, 'egg'); e.life = 0; break; }
    for (const it of L.items) if (!it.got && overlap(e, it)) collect(it);
    for (const cl of L.clouds) if (!cl.popped && overlap(e, cl)) { popCloud(cl); e.life = 0; }
    const b = L.boss;
    if (b && b.hp > 0 && overlap(e, b)) { e.life = 0; hitBoss(); }
    if (e.y > L.rows * T + 20) e.life = 0;
    if (e.life <= 0) burst(e.x + 5, e.y + 6, '#fff1d2', 6);
  }
  L.eggsFly = L.eggsFly.filter(e => e.life > 0);
  for (const s of L.spits) {
    s.life -= dt; const res = moveBody(s, dt); if (res.hitX) s.life = 0;
    for (const en of L.enemies) if (en.alive && overlap(s, en)) { killEnemy(en, 'egg'); s.life = 0; break; }
    if (L.boss && L.boss.hp > 0 && overlap(s, L.boss)) { s.life = 0; hitBoss(); }
  }
  L.spits = L.spits.filter(s => s.life > 0);
}

function updateEnemies(dt) {
  const near = e => e.x > cam.x - 120 && e.x < cam.x + VW + 120;
  for (const e of L.enemies) {
    if (!e.alive || !near(e)) continue;
    e.t += dt;
    if (e.kind === 'walker' || e.kind === 'spiky') {
      e.vy = Math.min(MAXFALL, e.vy + GRAV * dt);
      const res = moveBody(e, dt);
      if (res.hitX) e.vx = -e.vx;
      if (e.ground) {
        const front = e.vx > 0 ? e.x + e.w + 1 : e.x - 1, below = Math.floor((e.y + e.h + 2) / T), fc = Math.floor(front / T);
        if (!isSolid(tile(fc, below)) && tile(fc, below) !== '=') e.vx = -e.vx;
      }
      e.face = Math.sign(e.vx) || e.face;
    } else if (e.kind === 'hopper') {
      e.vy = Math.min(MAXFALL, e.vy + GRAV * dt);
      if (e.ground) { e.vx = 0; e.hopT -= dt; if (e.hopT <= 0) { e.hopT = 1.3 + Math.random() * 0.6; e.vy = -280; e.face = Math.sign(P.x - e.x) || 1; e.vx = e.face * 45; } }
      const res = moveBody(e, dt); if (res.hitX) e.vx = -e.vx;
    } else if (e.kind === 'flyer') {
      const nx = e.baseX + Math.sin(e.t * 1.2) * 44; e.face = nx > e.x ? 1 : -1; e.x = nx; e.y = e.baseY + Math.sin(e.t * 3.1) * 8;
    } else if (e.kind === 'plant') {
      const d = Math.abs(P.x - e.x); e.open = approach(e.open, d < 56 ? 1 : 0, dt * 4);
    }
    if (e.y > L.rows * T + 40) { e.alive = false; continue; }
    if (e.life !== undefined) { e.life -= dt; if (e.life <= 0) { e.alive = false; burst(e.x + 7, e.y + 7, '#cbb8e6', 6); continue; } }
    // Kontakt mit Pufi
    if (overlap(P, e)) {
      const fromAbove = P.vy > 40 && P.y + P.h - P.vy * (1 / 60) <= e.y + 6;
      if (P.pound === 2) { killEnemy(e, 'stomp'); P.vy = -200; P.pound = 0; }
      else if (fromAbove && e.stomp) { killEnemy(e, 'stomp'); P.vy = input.jump ? -330 : -250; P.flutterAvail = true; P.flutterN = 0; }
      else hurt(e);
    }
  }
  if (L.enemies.length > 80) L.enemies = L.enemies.filter(e => e.alive);
}

function updateItems(dt) {
  for (const it of L.items) {
    if (it.got) continue;
    if (it.dyn) {
      it.vy = Math.min(MAXFALL, (it.vy || 0) + 600 * dt); it.vx = approach(it.vx || 0, 0, 60 * dt);
      moveBody(it, dt);
      if (it.life !== undefined) { it.life -= dt; if (it.life <= 0) { it.got = true; continue; } }
      if (it.y > L.rows * T) it.got = true;
    }
    if (overlap(P, it)) collect(it);
  }
  if (L.items.length > 60 && L.items.filter(i => i.got).length > 30) L.items = L.items.filter(i => !i.got);
  for (const cl of L.clouds) {
    if (cl.popped) continue; cl.y = cl.baseY + Math.sin(t * 2 + cl.ph) * 4;
    if (P.vy < 0 && overlap(P, cl)) popCloud(cl);
  }
}

function hitBoss() {
  const b = L.boss; if (!b || b.inv > 0 || b.hp <= 0) return;
  b.hp--; b.inv = 0.9; Sound.play('boss'); shake = 4; burst(b.x + b.w / 2, b.y + b.h / 2, '#ffd2e8', 16); rumble(160, 0.7);
  if (b.hp <= 0) {
    L.bossDone = true; L.locked = false; Sound.play('ring'); burst(b.x + b.w / 2, b.y + b.h / 2, '#fff0b0', 40);
    for (const e of L.enemies) if (e.alive && e.fromBoss) killEnemy(e, 'egg');
    L.stars = Math.min(MAX_STARS, L.stars + 10); showMsg((b.kind === 'fly' ? 'NEBELFÜRST' : 'RIESENWUSCHEL') + ' BESIEGT!'); hud();
  }
}

function updateBoss(dt) {
  if (L.arenaX < 0) return;
  if (!L.locked && !L.bossDone && !L.boss && P.x > L.arenaX + T * 2) {
    L.locked = true;
    const kind = WORLDS[L.w].boss ? 'fly' : 'ground', hp = L.data.final ? 7 : 3 + Math.floor(L.w / 2);
    const sp = L.bossSpawn || { x: L.arenaX + 15 * T, y: LV.BASE * T - 40 };
    L.boss = kind === 'fly'
      ? { kind, x: sp.x, y: 40, w: 46, h: 34, hp, max: hp, inv: 0, t: 0, drop: 2 }
      : { kind, x: sp.x, y: LV.BASE * T - 40, w: 42, h: 40, vx: 0, vy: 0, hp, max: hp, inv: 0, t: 0, hop: 1.6, ground: false };
    showMsg(kind === 'fly' ? 'DER NEBELFÜRST!' : 'DAS RIESENWUSCHEL!'); Sound.play('boss');
  }
  const b = L.boss; if (!b || b.hp <= 0) return;
  b.t += dt; b.inv = Math.max(0, b.inv - dt);
  const angry = b.hp <= Math.ceil(b.max / 2), ax = L.arenaX, aw = 30 * T;
  if (b.kind === 'fly') {
    b.x = ax + aw / 2 - b.w / 2 + Math.sin(b.t * (angry ? 0.95 : 0.7)) * (aw / 2 - 50);
    b.y = LV.BASE * T - 160 + Math.sin(b.t * 1.7) * 14;
    b.drop -= dt;
    if (b.drop <= 0) {
      b.drop = (L.data.final ? 1.5 : 2.4) - (angry ? 0.5 : 0);
      const e = makeEnemy('k', b.x + b.w / 2 - 8, b.y + b.h); e.fromBoss = true; e.vx = (P.x > b.x ? 1 : -1) * 24; e.life = 9; L.enemies.push(e);
    }
  } else {
    b.vy = Math.min(MAXFALL + 100, b.vy + GRAV * dt);
    if (b.ground) {
      b.vx = approach(b.vx, Math.sign(P.x - b.x) * (angry ? 50 : 32), 200 * dt);
      b.hop -= dt; if (b.hop <= 0) { b.hop = angry ? 1.2 : 1.9; b.vy = -380; b.vx = Math.sign(P.x - b.x) * (angry ? 110 : 85); }
    }
    const was = b.ground, res = moveBody(b, dt); if (res.hitX) b.vx = -b.vx * 0.5;
    if (!was && b.ground) { shake = 3; Sound.play('pound'); if (P.ground) { P.vy = -120; } }
    b.x = clamp(b.x, ax + T, ax + aw - b.w - T);
  }
  // Nachschub an Eiern: Wuschel fallen in die Arena, wenn Pufi keine Eier hat.
  L.spawnT -= dt;
  if (L.spawnT <= 0 && P.eggs < 2 && L.enemies.filter(e => e.alive && e.edible).length < 2) {
    L.spawnT = 5; const e = makeEnemy('g', ax + (P.x - ax < aw / 2 ? aw - 80 : 64), LV.BASE * T - 150); e.fromBoss = true; L.enemies.push(e);
  }
  if (overlap(P, b)) {
    const fromAbove = P.vy > 40 && P.y + P.h - P.vy / 60 <= b.y + 8;
    if (fromAbove) { P.vy = -320; P.pound = 0; Sound.play('bounce'); } else hurt(b);
  }
}

function updateBaby(dt) {
  const B = L.baby;
  if (B.on) {
    B.x = P.x; B.y = P.y;
    if (L.stars < BASE_STARS) { L.regen += dt; if (L.regen >= 1) { L.regen = 0; L.stars++; hud(); } } else L.regen = 0;
    return;
  }
  B.t += dt;
  // Die Blase treibt langsam durch das Bild und bleibt sichtbar.
  B.vx += Math.sin(B.t * 0.9) * 8 * dt; B.vy += Math.cos(B.t * 1.3) * 10 * dt;
  B.vx = clamp(B.vx, -60, 60) * (1 - dt * 0.4); B.vy = clamp(B.vy, -30, 30);
  B.x += B.vx * dt; B.y += B.vy * dt;
  if (B.x < cam.x + 10) { B.x = cam.x + 10; B.vx = Math.abs(B.vx); }
  if (B.x > cam.x + VW - 34) { B.x = cam.x + VW - 34; B.vx = -Math.abs(B.vx); }
  if (B.y < cam.y + 40) { B.y = cam.y + 40; B.vy = Math.abs(B.vy); }
  if (B.y > cam.y + VH - 60) { B.y = cam.y + VH - 60; B.vy = -Math.abs(B.vy); }
  const k = L.kidnap;
  if (!k) {
    L.starTimer += dt;
    if (L.starTimer >= 0.75) { L.starTimer = 0; L.stars = Math.max(0, L.stars - 1); Sound.play('tick'); if (L.stars % 3 === 0) Sound.play('cry'); hud(); }
    if (L.stars <= 0) { L.kidnap = { t: 0, sx: B.x + 160, sy: cam.y - 30 }; Sound.play('boss'); }
  } else {
    k.t += dt;
    if (k.t > 1.0) { B.vy = -70; B.vx = 0; B.y += -70 * dt; }
    if (k.t > 2.2) { L.kidnap = null; die('Die Nebelgreifer haben Tamo entführt!'); return; }
  }
  const dist = Math.hypot(P.x + P.w / 2 - (B.x + 12), P.y + P.h / 2 - (B.y + 12));
  if (dist < 22 && (!k || k.t < 1.0) && B.t > 0.8) {
    L.baby = { on: true, x: P.x, y: P.y }; L.kidnap = null; Sound.play('rescue'); burst(P.x + 7, P.y, '#e2fff3', 16); hud();
  }
}

function updateCamera(dt) {
  const look = P.face * VW * 0.1;
  let tx = P.x + P.w / 2 - VW / 2 + look;
  let minX = 0, maxX = L.cols * T - VW;
  if (L.locked) { const aw = 30 * T; if (VW >= aw) { minX = maxX = L.arenaX + (aw - VW) / 2; } else { minX = L.arenaX; maxX = L.arenaX + aw - VW; } }
  tx = clamp(tx, minX, Math.max(minX, maxX));
  cam.x += (tx - cam.x) * Math.min(1, dt * 4.5);
  cam.x = clamp(cam.x, Math.min(minX, Math.max(0, maxX)), Math.max(minX, maxX));
  const ty = clamp(P.y - VH * 0.58, 0, L.rows * T - VH);
  const sy = P.y - cam.y;
  const rate = (sy < 50 || sy > VH - 60) ? 6 : (P.ground ? 3 : 1.2);
  cam.y += (ty - cam.y) * Math.min(1, dt * rate);
}

function burst(x, y, color, n = 8) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, s = 50 + Math.random() * 90;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: 0.35 + Math.random() * 0.35, color });
  }
  if (particles.length > 180) particles.splice(0, particles.length - 180);
}
function showMsg(text) { L.msg = { text, t: 1.8 }; }

// ---------- Zeichnen ----------
function oval(x, y, rx, ry, fill, stroke = '#5e4a66', lw = 1.5) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
const skyCache = {};
function mix(a, b, f) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join('');
}
// Tageszeit je Level einer Insel: Morgen, Nachmittag, Abend, Burg-Dämmerung.
const MOODS = [null, ['#ffb37a', '#ffe2b0', 0.35], ['#2f2d66', '#f0a08f', 0.55], ['#3b2a55', '#9a6688', 0.5]];
function skyGradient(w) {
  const st = L.data.stage, k = w + ':' + st + ':' + VH; if (skyCache[k]) return skyCache[k];
  let [a, b] = WORLDS[w].sky; const m = MOODS[st];
  if (m && w !== 4) { a = mix(a, m[0], m[2]); b = mix(b, m[1], m[2]); }
  if (m && w === 4) { a = mix(a, ['#2a5a60', '#4a2f60', '#20203a'][st - 1], 0.5); }
  const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, a); g.addColorStop(1, b);
  return (skyCache[k] = g);
}

function drawBackground() {
  const wd = L.wd, w = L.w;
  ctx.fillStyle = skyGradient(w); ctx.fillRect(0, 0, VW, VH);
  const night = L.data.stage >= 2;
  if (w === 4 || night) { for (let i = 0; i < 26; i++) { const x = ((i * 97 - cam.x * 0.1) % (VW + 40) + VW + 40) % (VW + 40) - 20; oval(x, 20 + (i * 53) % 150, 1.4, 1.4, '#dff7ff', null); } }
  if (w !== 4) { if (night) { oval(VW * 0.78, 48, 18, 18, '#fff6dc', null); oval(VW * 0.78 + 7, 44, 15, 15, mix(WORLDS[w].sky[0], MOODS[L.data.stage][0], 0.55), null); } else oval(VW * 0.78, 52, 26, 26, w === 5 || L.data.stage === 1 ? '#ffd7a8' : '#fff4c0', null); }
  // Wolken
  if (w !== 4) for (let i = 0; i < 7; i++) {
    const x = ((i * 157 - cam.x * 0.08) % (VW + 120) + VW + 120) % (VW + 120) - 60, y = 26 + (i * 41) % 90 - cam.y * 0.05;
    oval(x, y, 24, 10, '#ffffffcc', null); oval(x - 14, y - 5, 13, 9, '#ffffffcc', null); oval(x + 12, y - 7, 16, 11, '#ffffffcc', null);
  }
  const by = VH - (cam.y - (L.rows * T - VH)) * 0.3;
  for (let layer = 0; layer < 2; layer++) {
    const f = layer ? 0.32 : 0.16, base = by - (layer ? 62 : 104), amp = layer ? 22 : 34;
    ctx.beginPath(); ctx.moveTo(0, VH);
    for (let x = 0; x <= VW + 12; x += 12) { const wx = x + cam.x * f; ctx.lineTo(x, base - Math.sin(wx / 90 + layer * 2) * amp - Math.sin(wx / 37) * 6 * (w === 4 ? -1 : 1)); }
    ctx.lineTo(VW, VH); ctx.closePath(); ctx.fillStyle = layer ? wd.near : wd.far; ctx.fill();
  }
  // Inseltypische Deko im Mittelgrund
  const off = cam.x * 0.45, step = 110;
  for (let i = -1; i < VW / step + 2; i++) {
    const idx = Math.floor(off / step) + i, x = idx * step - off, gy = by - 40 + Math.sin(idx * 1.7) * 8;
    if (w === 0) { rect(x - 2, gy - 34, 4, 34, '#6b9a7f'); for (let j = 0; j < 5; j++) { const a = j * 1.256; oval(x + Math.cos(a) * 8, gy - 38 + Math.sin(a) * 8, 7, 6, j % 2 ? '#f5b5cf' : '#ffe3a0', null); } oval(x, gy - 38, 5, 5, '#fff6cf', null); }
    else if (w === 1) { ctx.fillStyle = '#d8a27e'; ctx.beginPath(); ctx.moveTo(x - 30, gy + 10); ctx.lineTo(x - 10, gy - 50); ctx.lineTo(x + 14, gy - 54); ctx.lineTo(x + 34, gy + 10); ctx.fill(); rect(x - 14, gy - 30, 30, 4, '#f6d2a6'); }
    else if (w === 2) { rect(x - 3, gy - 46, 6, 46, '#e9d6cf'); oval(x, gy - 48, 22, 12, idx % 2 ? '#c597dd' : '#f0a6c8', '#7d6599', 1.5); oval(x - 8, gy - 52, 3, 3, '#fff3d6', null); oval(x + 7, gy - 50, 3, 3, '#fff3d6', null); }
    else if (w === 3) { oval(x, gy - 20, 28, 14, '#ffffff', null); oval(x + 16, gy - 28, 18, 12, '#ffffff', null); }
    else if (w === 4) { ctx.fillStyle = idx % 2 ? '#7fc9c4' : '#a49ee0'; ctx.beginPath(); ctx.moveTo(x - 10, gy + 6); ctx.lineTo(x, gy - 34); ctx.lineTo(x + 10, gy + 6); ctx.fill(); }
    else { rect(x - 22, gy - 50, 44, 60, '#5d4269'); for (let k = 0; k < 4; k++) rect(x - 22 + k * 12, gy - 58, 8, 8, '#5d4269'); rect(x - 5, gy - 34, 10, 14, '#ffc69a'); }
  }
  if (L.data.stage >= 2 && w !== 4) { ctx.fillStyle = 'rgba(40,30,90,0.16)'; ctx.fillRect(0, 0, VW, VH); }
  else if (L.data.stage === 1 && w !== 4) { ctx.fillStyle = 'rgba(255,170,90,0.08)'; ctx.fillRect(0, 0, VW, VH); }
}

function drawTiles() {
  const wd = L.wd;
  const c0 = Math.max(0, Math.floor(cam.x / T) - 1), c1 = Math.min(L.cols - 1, Math.ceil((cam.x + VW) / T) + 1);
  const r0 = Math.max(0, Math.floor(cam.y / T)), r1 = Math.min(L.rows - 1, Math.ceil((cam.y + VH) / T));
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const ch = L.grid[r][c], x = c * T, y = r * T;
    if (ch === '#') paintSolid(c, r, x, y);
    else if (ch === '=') paintLedge(x, y, c);
    else if (ch === 'Q') {
      const k = c + ',' + r, b = L.bumps[k] ? Math.sin(L.bumps[k] / 0.25 * Math.PI) * 4 : 0;
      rect(x + 1, y + 1 - b, T - 2, T - 2, '#ffe9b8'); ctx.strokeStyle = '#8a6a6f'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 1.5, y + 1.5 - b, T - 3, T - 3);
      oval(x + 8, y + 8 - b, 4, 5, '#fffaf0', '#a07e86', 1); oval(x + 7, y + 7 - b, 1.2, 1.2, '#f39bbb', null); oval(x + 9.5, y + 10 - b, 1, 1, '#9ad3b8', null);
    } else if (ch === '^') {
      for (let i = 0; i < 4; i++) { ctx.fillStyle = L.w === 4 ? '#9fe0d8' : '#e7aac0'; ctx.beginPath(); ctx.moveTo(x + i * 4, y + T); ctx.lineTo(x + i * 4 + 2, y + 6); ctx.lineTo(x + i * 4 + 4, y + T); ctx.fill(); }
    } else if (ch === '~') {
      const top = r > 0 && L.grid[r - 1][c] !== '~';
      rect(x, y, T, T, L.w === 4 ? '#3d7a8a' : '#c2577a');
      if (top) { rect(x, y + Math.sin(t * 3 + c) * 1.5, T, 3, L.w === 4 ? '#8fe0d8' : '#ffb07a'); }
    }
  }
}

// Jede Insel hat eigene Bodenkacheln: Wiese, Sandstein mit Honig, Moos mit Leuchtpilzen, Wolken, Kreidefels, Burgziegel.
function paintSolid(c, r, x, y) {
  const wd = L.wd, w = L.w, g = L.grid, solidAt = (cc, rr) => rr < 0 || rr >= L.rows || cc < 0 || cc >= L.cols ? (rr < 0) : isSolid(g[rr][cc]);
  const top = !solidAt(c, r - 1), bottom = r < L.rows - 1 && !solidAt(c, r + 1), left = !solidAt(c - 1, r), right = !solidAt(c + 1, r);
  const h = (c * 73856093 ^ r * 19349663) >>> 0;
  if (w === 3) { // Wolkenboden
    rect(x, y, T, T, '#f4f8ff'); if (r % 2) rect(x, y + 10, T, 6, '#e3edfb');
    if (top) { oval(x + 4, y + 2, 6, 5, '#ffffff', null); oval(x + 12, y + 1, 6, 5, '#ffffff', null); rect(x, y + 2, T, 3, '#ffffff'); }
    if (left) oval(x + 2, y + 8, 4, 7, '#ffffff', null); if (right) oval(x + 14, y + 8, 4, 7, '#ffffff', null);
    if (bottom) oval(x + 8, y + 14, 9, 4, '#d5e3f6', null);
    return;
  }
  if (w === 5) { // Burgziegel
    rect(x, y, T, T, wd.soil); const off = r % 2 ? 8 : 0;
    rect(x, y + 7, T, 1, wd.soilDark); rect(x + off, y, 1, 7, wd.soilDark); rect(x + (off + 8) % 16, y + 8, 1, 8, wd.soilDark);
    if (h % 9 === 0) rect(x + 3, y + 2, 4, 2, '#8a6d8c');
    if (top) { rect(x, y, T, 4, wd.grass); rect(x, y, T, 1, wd.grassLight); }
    if (left) rect(x, y, 2, T, wd.soilDark); if (right) rect(x + T - 2, y, 2, T, wd.soilDark);
    return;
  }
  rect(x, y, T, T, wd.soil);
  if (w === 1) { rect(x, y + 4, T, 3, '#c08a68'); rect(x, y + 11, T, 2, wd.soilDark); }
  else if (w === 4) { if (h % 4 === 0) { ctx.strokeStyle = wd.soilDark; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 3, y + 3); ctx.lineTo(x + 8, y + 9); ctx.lineTo(x + 6, y + 14); ctx.stroke(); } }
  else { if (h % 5 === 0) rect(x + 4, y + 7, 3, 2, wd.soilDark); if (h % 7 === 0) rect(x + 10, y + 11, 2, 2, wd.soilDark); }
  if (w === 2 && h % 11 === 0) oval(x + 8, y + 9, 1.5, 1.5, '#d7f7a8', null);
  if (left) rect(x, y, 2, T, wd.soilDark); if (right) rect(x + T - 2, y, 2, T, wd.soilDark);
  if (bottom && w === 4) { ctx.fillStyle = wd.soil; ctx.beginPath(); ctx.moveTo(x + 2, y + T); ctx.lineTo(x + 6 + h % 4, y + T + 6 + h % 7); ctx.lineTo(x + 11, y + T); ctx.fill(); }
  if (!top) return;
  if (w === 0) {
    rect(x, y, T, 5, wd.grass); rect(x, y, T, 1.5, wd.grassLight);
    oval(x + 4 + (c % 3), y + 5, 3.5, 2.2, wd.grass, null); oval(x + 12 - (c % 2), y + 5, 3, 2, wd.grass, null);
    if (h % 5 === 1) { rect(x + 7, y - 4, 1, 4, '#5f9a6a'); oval(x + 7.5, y - 5, 2.2, 2.2, ['#ff9cc0', '#ffd27a', '#ffffff'][h % 3], null); }
  } else if (w === 1) {
    rect(x, y, T, 4, wd.grass); rect(x, y, T, 1.5, wd.grassLight);
    if (h % 3 === 0) { rect(x + 5, y + 4, 3, 3 + h % 4, '#f2c45a'); oval(x + 6.5, y + 7 + h % 4, 1.6, 1.8, '#f2c45a', null); }
  } else if (w === 2) {
    rect(x, y, T, 4, wd.grass); rect(x, y, T, 1, wd.grassLight);
    if (h % 4 === 0) { rect(x + 7, y - 4, 2, 4, '#efe1d0'); oval(x + 8, y - 4, 4, 2.5, h % 8 ? '#ff9fd0' : '#b9f0ff', null); }
  } else if (w === 4) {
    rect(x, y, T, 3, wd.grass); rect(x, y, T, 1, wd.grassLight);
    if (h % 6 === 0) { ctx.fillStyle = h % 12 ? '#9fe8de' : '#c2b6ff'; ctx.beginPath(); ctx.moveTo(x + 4, y); ctx.lineTo(x + 7, y - 7); ctx.lineTo(x + 10, y); ctx.fill(); }
  }
}
function paintLedge(x, y, c) {
  const w = L.w, wd = L.wd;
  if (w === 3) { oval(x + 8, y + 3, 9, 5, '#ffffff', '#b8d6e8', 1); return; }
  if (w === 2) { oval(x + 8, y + 3, 9, 4, c % 2 ? '#c597dd' : '#f0a6c8', '#7d6599', 1); oval(x + 5, y + 2, 1.5, 1.5, '#fff3d6', null); return; }
  if (w === 1) { for (let i = 0; i < 2; i++) { ctx.fillStyle = '#f4c24e'; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.lineTo(x + 4 + i * 8 + Math.cos(a) * 4, y + 3 + Math.sin(a) * 3.5); } ctx.fill(); } rect(x, y + 6, T, 1, '#b07b3a'); return; }
  if (w === 4) { rect(x, y, T, 4, '#8fd8cf'); rect(x, y, T, 1, '#e5fff9'); ctx.fillStyle = '#6fb9b2'; ctx.beginPath(); ctx.moveTo(x + 3, y + 4); ctx.lineTo(x + 8, y + 9); ctx.lineTo(x + 13, y + 4); ctx.fill(); return; }
  if (w === 5) { rect(x, y, T, 4, '#9a8aa8'); for (let k = 0; k < 4; k++) rect(x + k * 4 + 1, y + 4, 2, 3, '#6d5d7c'); rect(x, y, T, 1, '#d8cce6'); return; }
  rect(x, y, T, 5, wd.plat); rect(x, y + 5, T, 2, '#00000022'); rect(x, y, T, 1.5, '#ffffff99'); rect(x + 7, y + 1, 1, 3, '#b98760');
}

function drawPlatforms() {
  const wd = L.wd;
  for (const m of L.movers) {
    if (L.w === 3) { oval(m.x + 24, m.y + 5, 26, 8, '#ffffff', '#a8cde0', 1.5); oval(m.x + 12, m.y, 10, 7, '#ffffff', null); oval(m.x + 34, m.y + 1, 12, 7, '#ffffff', null); }
    else { rect(m.x, m.y, m.w, 6, wd.plat); rect(m.x, m.y, m.w, 2, '#ffffffaa'); rect(m.x + 4, m.y + 6, m.w - 8, 3, '#00000033'); }
  }
  for (const c of L.crumbles) {
    if (c.state === 2 && c.fall > 60) continue;
    const y = c.y + (c.state === 2 ? c.fall : 0), jig = c.state === 1 ? Math.sin(t * 60) * 1 : 0;
    rect(c.x + 1 + jig, y, T - 2, 7, '#d6ae8a'); rect(c.x + 1 + jig, y, T - 2, 2, '#f6dcb4'); rect(c.x + 5 + jig, y + 3, 4, 1, '#94705c');
  }
  for (const s of L.springs) {
    const sq = s.sq * 4;
    rect(s.x + 5, s.y + 4 + sq / 2, 4, 6 - sq / 2, '#efe1d0');
    oval(s.x + 7, s.y + 4 + sq, 9, 5 - sq / 3, '#ff9fc4', '#7d5070', 1.5); oval(s.x + 4, s.y + 3 + sq, 1.6, 1.6, '#fff', null); oval(s.x + 10, s.y + 4 + sq, 1.4, 1.4, '#fff', null);
  }
}

function drawItem(it) {
  const x = it.x + 6, y = it.y + 6 + (it.dyn ? 0 : Math.sin(t * 3 + (it.ph || 0)) * 1.5);
  if (it.type === 'coin' || it.type === 'red') {
    const sw = Math.abs(Math.cos(t * 3 + (it.ph || 0))) * 5 + 1;
    oval(x, y, sw, 6.5, it.type === 'red' ? '#ffcf7a' : '#ffd96a', it.type === 'red' ? '#b14a4a' : '#a57a3e', 1.4);
    if (it.type === 'red') { oval(x, y, sw * 0.5, 3.6, '#ff8f7a', null); }
    else oval(x, y, sw * 0.4, 3.5, '#fff1b0', null);
  } else if (it.type === 'flower') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2) * 0.2);
    for (let i = 0; i < 5; i++) { const a = i * 1.2566; oval(Math.cos(a) * 5, Math.sin(a) * 5, 4, 4, ['#ff9cc0', '#ffd27a', '#9fd8ff', '#b9f0a8', '#d6a8ff'][i], '#8a5d79', 1); }
    oval(0, 0, 3.5, 3.5, '#fff7d0', '#8a5d79', 1); oval(-1.2, -0.5, 0.8, 1, '#4a3a55', null); oval(1.2, -0.5, 0.8, 1, '#4a3a55', null);
    ctx.restore();
  } else if (it.type === 'star') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2);
    ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? 2.8 : 6.5; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = '#fff3a0'; ctx.fill(); ctx.strokeStyle = '#c99a4a'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  }
}

function drawCloud(cl) {
  const x = cl.x + 12, y = cl.y + 8, flap = Math.sin(t * 12 + cl.ph) * 3;
  oval(x - 13, y - 2 - flap, 7, 4, '#ffffff', '#b8c5d8', 1); oval(x + 13, y - 2 - flap, 7, 4, '#ffffff', '#b8c5d8', 1);
  oval(x, y, 12, 8, '#ffffff', '#a9b9d2', 1.5); oval(x - 6, y - 4, 6, 5, '#ffffff', null); oval(x + 5, y - 5, 7, 5, '#ffffff', null);
  if (cl.kind === 'flower') { for (let i = 0; i < 5; i++) { const a = i * 1.2566; oval(x + Math.cos(a) * 3, y + 1 + Math.sin(a) * 3, 2, 2, '#ff9cc0', null); } oval(x, y + 1, 1.6, 1.6, '#ffe08a', null); }
  else { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? 2 : 4.5; ctx.lineTo(x + Math.cos(a) * rr, y + 1 + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = '#ffd96a'; ctx.fill(); }
}

function drawEnemy(e) {
  const x = e.x + e.w / 2, y = e.y + e.h, f = e.face, step = Math.sin(e.t * 10) * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
  if (e.kind === 'walker') {
    const col = ['#e98fb4', '#f2b36c', '#a58fd8', '#8fc8e8', '#7fc9a4', '#e88080'][L.w];
    oval(-4, -1 + step * 0.3, 4, 2.5, '#6a5878', null); oval(4, -1 - step * 0.3, 4, 2.5, '#6a5878', null);
    oval(0, -8, 8, 7.5, col, '#5e4a66', 1.5);
    for (let i = 0; i < 5; i++) oval(-6 + i * 3, -15 + Math.abs(i - 2), 2.5, 2.5, col, null);
    oval(2, -10, 4.5, 3.5, '#fff6e6', null); oval(3.4, -10, 1.3, 1.8, '#3f3550', null); oval(-1.6, -10, 1.3, 1.8, '#3f3550', null);
  } else if (e.kind === 'hopper') {
    const sq = e.ground ? 1 : 0;
    ctx.strokeStyle = '#6a5878'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-3, -4); ctx.lineTo(-5, 0); ctx.moveTo(3, -4); ctx.lineTo(5, 0); ctx.stroke();
    oval(0, -9 + sq, 7.5, 6.5 - sq, '#9fd47a', '#4f6a4a', 1.5); oval(-3, -14, 3, 3, '#ffffff', '#4f6a4a', 1); oval(3, -14, 3, 3, '#ffffff', '#4f6a4a', 1);
    oval(-2.5, -14, 1.2, 1.4, '#333', null); oval(3.5, -14, 1.2, 1.4, '#333', null);
  } else if (e.kind === 'flyer') {
    const flap = Math.sin(e.t * 18) * 4;
    oval(-8, -10 - flap, 6, 3, '#ffe9ff', '#8a77a8', 1); oval(8, -10 + flap, 6, 3, '#ffe9ff', '#8a77a8', 1);
    oval(0, -8, 7, 6.5, '#b49be0', '#5e4a76', 1.5); oval(2.5, -9, 2.4, 2.4, '#fff', null); oval(3, -9, 1, 1.4, '#333', null); oval(5.5, -6, 2, 1.2, '#f2a37a', null);
  } else if (e.kind === 'spiky') {
    ctx.rotate(e.t * 3 * f);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.fillStyle = '#efe3ff'; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 11, -7 + Math.sin(a) * 11); ctx.lineTo(Math.cos(a + 0.3) * 6, -7 + Math.sin(a + 0.3) * 6); ctx.lineTo(Math.cos(a - 0.3) * 6, -7 + Math.sin(a - 0.3) * 6); ctx.fill(); }
    oval(0, -7, 7, 7, '#7c5aa8', '#3d2d5a', 1.5); ctx.rotate(-e.t * 3 * f);
    oval(2, -8, 1.4, 1.8, '#ffe7a0', null); oval(-2, -8, 1.4, 1.8, '#ffe7a0', null);
  } else if (e.kind === 'plant') {
    rect(-1.5, -12, 3, 12, '#5f9a6a'); oval(-5, -4, 5, 2.5, '#7fc28a', null); oval(5, -6, 5, 2.5, '#7fc28a', null);
    const o = e.open * 5;
    oval(0, -17 - o * 0.3, 8, 6 + o * 0.3, '#ff7ea8', '#7a3d5a', 1.5);
    if (o > 0.5) { rect(-6, -18, 12, o, '#5a2240'); for (let i = 0; i < 4; i++) rect(-5 + i * 3, -18, 1.5, 2, '#fff'); }
    for (let i = 0; i < 6; i++) oval(-7 + i * 2.8, -22 - o * 0.6, 1.5, 1.5, '#ffe1ee', null);
  }
  ctx.restore();
}

function drawPufi(x, y, face, opts = {}) {
  // x,y = Mittelpunkt unten. Pufi ist ein rosafarbener Wolkendrache mit Blattkamm.
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(face * 0.74, 0.74);
  if (opts.spin) ctx.rotate(opts.spin);
  ctx.translate(-12, -33);
  const run = opts.run || 0, legA = Math.sin(opts.phase || 0) * 4 * run, flutter = opts.flutter;
  const fl = flutter ? Math.sin(t * 40) * 5 : 0;
  // Schwanz
  ctx.beginPath(); ctx.moveTo(2, 16); ctx.quadraticCurveTo(-10, 13, -12, 5); ctx.quadraticCurveTo(-2, 8, 6, 13); ctx.closePath();
  ctx.fillStyle = '#f19bb3'; ctx.fill(); ctx.strokeStyle = '#765872'; ctx.lineWidth = 1.8; ctx.stroke();
  // Beine
  oval(6 + legA + fl, 30, 6.5, 3.5, '#6881a8', '#665978', 1.2); oval(19 - legA - fl, 30, 6.5, 3.5, '#6881a8', '#665978', 1.2);
  // Körper
  oval(12, 19, 13, 11, '#e987a8', '#765872', 2); oval(12, 21, 7.5, 7.5, '#ffe7c9', null);
  // Arme
  oval(19, 20, 3.5, 2.5, '#f19bb3', '#765872', 1);
  // Kopf
  const cheek = opts.full ? 3 : 0;
  oval(9, 6, 9.5, 9.5, '#ed96b0', '#765872', 2);
  oval(17, 9, 11 + cheek, 7.5 + cheek, '#f09bb4', '#765872', 2);
  oval(24 + cheek, 11, 6.5, 4.8, '#f4a8bc', '#765872', 1.5);
  if (opts.mouth) { oval(25, 14, 4, 3, '#7a2e4a', '#765872', 1); }
  const blink = opts.blink ? 0.4 : 3.4;
  oval(8, 6, 2.2, blink, '#483f59', null); if (!opts.blink) oval(9, 4.8, 0.8, 1, '#fff5d9', null);
  oval(26 + cheek, 10, 1.1, 1.1, '#674755', null); oval(19, 13, 2.6, 1.7, '#e97598', null);
  // Blattkamm
  ctx.beginPath(); ctx.moveTo(3, 0); ctx.quadraticCurveTo(0, -9, 7, -7); ctx.quadraticCurveTo(11, -3, 7, 3); ctx.closePath(); ctx.fillStyle = '#a8c97e'; ctx.fill(); ctx.strokeStyle = '#637856'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, 0); ctx.quadraticCurveTo(10, -10, 17, -6); ctx.quadraticCurveTo(19, -1, 13, 3); ctx.closePath(); ctx.fillStyle = '#92b97b'; ctx.fill(); ctx.stroke();
  // Tamo auf dem Rücken
  if (opts.baby) drawTamo(1, 6, 0.42, 1);
  ctx.restore();
}

function drawTamo(x, y, s, face) {
  // Tamo: kleiner Wolkentapir mit Flossen – Pufis eigener Schützling.
  ctx.save(); ctx.translate(x, y); ctx.scale(s * face, s);
  oval(-18, 2, 9, 6, '#86d9cb', '#506678', 2.4);
  oval(-10, 13, 8, 5, '#6282ad', '#506678', 2.4); oval(11, 13, 8, 5, '#6282ad', '#506678', 2.4);
  oval(0, 0, 21, 17, '#78c7bf', '#4d687a', 3); oval(-3, 4, 11, 8, '#bae6cf', null);
  oval(15, -12, 11, 11, '#89d7ce', '#4d687a', 2.4); oval(12, -22, 4.5, 10, '#78c7bf', '#4d687a', 2);
  oval(25, -2, 10, 9, '#89d7ce', '#4d687a', 2.4); oval(21, -5, 4.6, 5.6, '#fff9e3', null); oval(22, -5, 2, 3, '#3e5469', null);
  oval(32, 1, 2, 2, '#4d687a', null);
  ctx.restore();
}

function drawHero() {
  const p = P;
  if (p.inv > 0 && Math.floor(t * 16) % 2 && !p.dead) return;
  const run = p.ground ? Math.min(1, Math.abs(p.vx) / RUN) : 0;
  const spin = p.pound === 1 ? (1 - p.poundT / 0.17) * Math.PI * 2 * p.face : 0;
  const tongueOut = !!p.tongue;
  drawPufi(p.x + p.w / 2, p.y + p.h + 1, p.face, {
    run, phase: p.anim * 16, flutter: p.flutterT > 0, spin, full: !!p.mouth, mouth: tongueOut,
    baby: L.baby.on && !p.dead, blink: p.blink > 2 && (p.blink % 3) < 0.15
  });
  if (p.tongue) {
    const m = mouthPos(), tip = tongueTip();
    ctx.strokeStyle = '#7a3f5a'; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
    ctx.strokeStyle = '#ff8fb1'; ctx.lineWidth = 2.8; ctx.stroke();
    oval(tip.x, tip.y, 3.6, 3.2, '#ffb0c8', '#7a3f5a', 1);
    if (p.tongue.enemy) { const e = p.tongue.enemy; ctx.save(); e.x = tip.x - e.w / 2; e.y = tip.y - e.h / 2; drawEnemy(e); ctx.restore(); }
  }
}

function drawEggTrail() {
  for (let i = P.trail.length - 1; i >= 0; i--) { const e = P.trail[i]; drawEgg(e.x, e.y + Math.sin(t * 6 + i) * 0.8, 0); }
}
function drawEgg(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  oval(0, 0, 5, 6.2, '#fff8ea', '#8f6d7f', 1.3); oval(-1.8, -2, 1.4, 1.4, '#f49ac0', null); oval(2, 1, 1.5, 1.5, '#8fd2c0', null); oval(-1, 3, 1.1, 1.1, '#c6a6f0', null);
  ctx.restore();
}

function drawAim() {
  if (!P.aim) return;
  const ang = aimAngle(), dx = padAim ? padAim.dir : P.face, cx = P.x + P.w / 2, cy = P.y + 8;
  ctx.setLineDash([3, 5]); ctx.strokeStyle = '#fff8d6'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * 72 * dx, cy - Math.sin(ang) * 72); ctx.stroke(); ctx.setLineDash([]);
  const tx = cx + Math.cos(ang) * 78 * dx, ty = cy - Math.sin(ang) * 78;
  oval(tx, ty, 6, 6, null, '#ff6f9e', 2); rect(tx - 1, ty - 9, 2, 5, '#ff6f9e'); rect(tx - 1, ty + 4, 2, 5, '#ff6f9e'); rect(tx - 9, ty - 1, 5, 2, '#ff6f9e'); rect(tx + 4, ty - 1, 5, 2, '#ff6f9e');
}

function drawBoss() {
  const b = L.boss; if (!b || b.hp <= 0) return;
  if (b.inv > 0 && Math.floor(t * 20) % 2) return;
  const x = b.x + b.w / 2, y = b.y + b.h;
  if (b.kind === 'ground') {
    const col = ['#e98fb4', '#f2b36c', '#a58fd8', '#8fc8e8', '#7fc9a4', '#e88080'][L.w], f = Math.sign(P.x - b.x) || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
    oval(-12, -3, 9, 5, '#6a5878', null); oval(12, -3, 9, 5, '#6a5878', null);
    oval(0, -21, 22, 20, col, '#5e4a66', 2.5);
    for (let i = 0; i < 9; i++) oval(-18 + i * 4.5, -40 + Math.abs(i - 4) * 1.5, 5, 5, col, null);
    oval(5, -24, 11, 8, '#fff6e6', null); oval(9, -24, 3, 4.5, '#3f3550', null); oval(-1, -24, 3, 4.5, '#3f3550', null);
    ctx.fillStyle = '#ffd77a'; ctx.beginPath(); ctx.moveTo(-10, -42); ctx.lineTo(-6, -52); ctx.lineTo(-1, -44); ctx.lineTo(4, -54); ctx.lineTo(9, -44); ctx.lineTo(13, -50); ctx.lineTo(14, -40); ctx.closePath(); ctx.fill();
    ctx.restore();
  } else {
    const flap = Math.sin(t * 10) * 8;
    oval(x - 26, y - 22 - flap, 16, 7, '#4f4870', '#2a2645', 1.5); oval(x + 26, y - 22 + flap, 16, 7, '#4f4870', '#2a2645', 1.5);
    oval(x, y - 18, 24, 17, '#45406a', '#24203d', 2.5); oval(x - 10, y - 24, 9, 8, '#5a5482', null); oval(x + 9, y - 26, 10, 8, '#5a5482', null);
    oval(x - 7, y - 18, 3.5, 4.5, '#ffe28a', null); oval(x + 7, y - 18, 3.5, 4.5, '#ffe28a', null);
    oval(x, y - 9, 6, 2.5, '#f0a1a9', null);
  }
  // Lebensleiste
  const bw = 120, bx = VW / 2 - bw / 2 + cam.x, byy = cam.y + 30;
  rect(bx - 2, byy - 2, bw + 4, 9, '#2b2440cc'); rect(bx, byy, bw * b.hp / b.max, 5, '#ff8fb1');
}

function drawBaby() {
  const B = L.baby; if (B.on) return;
  const k = L.kidnap;
  // Nebelgreifer
  if (k) {
    const prog = Math.min(1, k.t / 1.0);
    for (let i = 0; i < 2; i++) {
      const gx = k.sx + (B.x + 12 + (i ? 14 : -14) - k.sx) * prog, gy = k.sy + (B.y - 4 - k.sy) * prog;
      const flap = Math.sin(t * 20 + i) * 4;
      oval(gx - 9, gy - flap, 8, 4, '#667192', '#30385e', 1.2); oval(gx + 9, gy + flap, 8, 4, '#667192', '#30385e', 1.2);
      oval(gx, gy, 7, 6.5, '#3d456b', '#252941', 1.5); oval(gx - 2.5, gy - 1, 1.6, 2.2, '#ffe090', null); oval(gx + 2.5, gy - 1, 1.6, 2.2, '#ffe090', null);
    }
  }
  const bx = B.x + 12, by = B.y + 12, wob = Math.sin(t * 5) * 1.5;
  drawTamo(bx - 2, by + 2, 0.4, Math.sin(t * 2) > 0 ? 1 : -1);
  oval(bx, by, 15 + wob, 15 - wob, '#dff4ff44', '#ffffffcc', 2);
  oval(bx - 6, by - 7, 4, 2.5, '#ffffffaa', null);
  if (Math.floor(t * 3) % 2 === 0) { ctx.font = 'bold 9px sans-serif'; ctx.fillStyle = '#fff8cc'; ctx.strokeStyle = '#4d5278'; ctx.lineWidth = 2.5; ctx.strokeText('PIU!', bx - 10, by - 18); ctx.fillText('PIU!', bx - 10, by - 18); }
}

function drawGoal() {
  if (L.goal) {
    const active = !L.data.boss || L.bossDone, x = L.goal.x, y = L.goal.y;
    if (!active) return;
    ctx.globalAlpha = 1;
    rect(x - 20, y - 64, 6, 64, '#fff2dc'); rect(x + 14, y - 64, 6, 64, '#fff2dc');
    ctx.strokeStyle = '#ff9ec0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y - 62, 17, Math.PI, 0); ctx.stroke();
    for (let i = 0; i < 6; i++) { const a = t * 1.5 + i * 1.047; oval(x + Math.cos(a) * 12, y - 34 + Math.sin(a) * 18, 3, 3, ['#ff9cc0', '#ffd27a', '#9fd8ff', '#b9f0a8', '#d6a8ff', '#ffffff'][i], null); }
    ctx.fillStyle = '#5b4a6e'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ZIEL', x, y - 82); ctx.textAlign = 'left';
  }
  for (const r of L.rings) {
    const pulse = 1 + Math.sin(t * 4) * 0.05;
    ctx.save(); ctx.translate(r.x, r.y); ctx.scale(pulse, pulse);
    ctx.lineWidth = 5; ctx.strokeStyle = r.passed ? '#fff3c4' : '#ffb0cf'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 22, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = r.passed ? '#ffe08a' : '#ffffff'; ctx.stroke();
    for (let i = 0; i < 4; i++) { const a = r.t * 3 + i * 1.57; oval(Math.cos(a) * 12, Math.sin(a) * 22, 2, 2, '#ffffff', null); }
    ctx.restore();
  }
  if (L.arenaX >= 0 && L.locked) {
    const x = L.arenaX; rect(x - 6, LV.BASE * T - 80, 6, 80, '#7d6a8f'); for (let i = 0; i < 5; i++) rect(x - 8, LV.BASE * T - 80 + i * 16, 10, 3, '#b49cc6');
  }
}

function drawHUDCanvas() {
  // Großer Countdown, wenn Tamo in der Blase schwebt.
  if (!L.baby.on && !P.dead) {
    const s = L.stars, pulse = 1 + (L.starTimer / 0.75) * 0.15;
    ctx.save(); ctx.translate(VW / 2, 58); ctx.scale(pulse, pulse);
    ctx.font = '900 34px "Trebuchet MS",system-ui,sans-serif'; ctx.textAlign = 'center';
    ctx.lineWidth = 6; ctx.strokeStyle = '#4b2e5a'; ctx.strokeText(String(s), 0, 0);
    ctx.fillStyle = s <= 5 ? '#ff7a8e' : '#fff3a0'; ctx.fillText(String(s), 0, 0);
    ctx.restore(); ctx.textAlign = 'left';
    const bx = L.baby.x - cam.x;
    if (bx < 0 || bx > VW) { ctx.font = 'bold 11px sans-serif'; ctx.fillStyle = '#fff4b3'; ctx.fillText(bx < 0 ? '◀ TAMO' : 'TAMO ▶', bx < 0 ? 8 : VW - 60, 96); }
  }
  const banner = (text, y, size = 16) => {
    ctx.font = '900 ' + size + 'px "Trebuchet MS",system-ui,sans-serif'; ctx.textAlign = 'center';
    ctx.lineWidth = 5; ctx.strokeStyle = '#3e2c54'; ctx.strokeText(text, VW / 2, y); ctx.fillStyle = '#fff1c4'; ctx.fillText(text, VW / 2, y); ctx.textAlign = 'left';
  };
  if (L.intro > 0) { ctx.globalAlpha = Math.min(1, L.intro); banner((L.w + 1) + '-' + (L.data.stage + 1) + '  ' + L.data.name + (L.data.boss ? ' · Burg' : ''), VH * 0.38, 18); ctx.globalAlpha = 1; }
  if (L.msg) { ctx.globalAlpha = Math.min(1, L.msg.t * 2); banner(L.msg.text, VH * 0.3, 15); ctx.globalAlpha = 1; }
  if (P.dead) banner(P.dead.reason, VH * 0.45, 14);
  if (L.clearT >= 0 && !L.roulette) banner('GESCHAFFT!', VH * 0.4, 24);
  if (L.roulette) drawRoulette();
}

function draw() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.lineJoin = 'round';
  if (!L) { ctx.fillStyle = '#303552'; ctx.fillRect(0, 0, VW, VH); return; }
  drawBackground();
  const sx = shake ? (Math.random() - 0.5) * shake : 0, sy = shake ? (Math.random() - 0.5) * shake : 0;
  ctx.save(); ctx.translate(-Math.round(cam.x) + sx, -Math.round(cam.y) + sy);
  drawTiles(); drawPlatforms(); drawGoal();
  for (const cl of L.clouds) if (!cl.popped && cl.x > cam.x - 40 && cl.x < cam.x + VW + 40) drawCloud(cl);
  for (const it of L.items) if (!it.got && it.x > cam.x - 20 && it.x < cam.x + VW + 20) drawItem(it);
  for (const e of L.enemies) if (e.alive && e.x > cam.x - 30 && e.x < cam.x + VW + 30) drawEnemy(e);
  drawBoss();
  drawEggTrail();
  for (const e of L.eggsFly) drawEgg(e.x + 5, e.y + 6, e.spin);
  for (const s of L.spits) { ctx.save(); const e = { kind: { g: 'walker', h: 'hopper', f: 'flyer' }[s.ch] || 'walker', x: s.x, y: s.y, w: 12, h: 12, face: Math.sign(s.vx), t: t * 3 }; ctx.translate(0, 0); drawEnemy(e); ctx.restore(); }
  if (!L.attract) { drawHero(); drawAim(); drawBaby(); }
  for (const q of particles) rect(q.x - 1.5, q.y - 1.5, 3, 3, q.color);
  ctx.restore();
  drawHUDCanvas();
}

// ---------- Blüten-Roulette am Ziel ----------
// Zehn Felder; jede gefundene Farbblüte färbt zwei Felder. Landet der Zeiger auf einer Blüte, startet ein Bonusspiel.
function startRoulette() {
  const fl = L.counts.flowers, segs = [];
  for (let i = 0; i < 10; i++) segs.push(i % 5 < fl);
  const win = fl > 0 && Math.random() < fl / 5;
  const pick = [...segs.keys()].filter(i => segs[i] === win);
  const target = pick[Math.floor(Math.random() * pick.length)];
  L.roulette = { t: 0, segs, win, target, ang: 0, done: false, wait: 0, from: 0, total: Math.PI * 2 * 4 + (target + 0.5) * Math.PI / 5 };
  Sound.play('ring');
}
function updateRoulette(dt) {
  const R = L.roulette;
  if (!R.done) {
    R.t += dt; const k = Math.min(1, R.t / 2.4), ease = 1 - Math.pow(1 - k, 3);
    const before = Math.floor(R.ang / (Math.PI / 5)); R.ang = R.total * ease;
    if (Math.floor(R.ang / (Math.PI / 5)) !== before) Sound.play('tick');
    if (k >= 1) { R.done = true; Sound.play(R.win ? 'flower' : 'bonk'); }
  } else {
    R.wait += dt;
    if (R.wait > 1.1) { L.roulette.finished = true; if (R.win) startBonus(BONUS_KINDS[Math.floor(Math.random() * BONUS_KINDS.length)], true); else showClear(); }
  }
}
function drawRoulette() {
  const R = L.roulette, cx = VW / 2, cy = VH * 0.47, rad = 64;
  ctx.fillStyle = 'rgba(30,24,56,0.55)'; ctx.fillRect(0, 0, VW, VH);
  for (let i = 0; i < 10; i++) {
    const a0 = -Math.PI / 2 + i * Math.PI / 5 - R.ang, a1 = a0 + Math.PI / 5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, rad, a0, a1); ctx.closePath();
    ctx.fillStyle = R.segs[i] ? (i % 2 ? '#ffb3cf' : '#ffd6e6') : (i % 2 ? '#7d7fa8' : '#9a9cc2'); ctx.fill(); ctx.strokeStyle = '#fff3d8'; ctx.lineWidth = 2; ctx.stroke();
    const am = (a0 + a1) / 2, ix = cx + Math.cos(am) * rad * 0.66, iy = cy + Math.sin(am) * rad * 0.66;
    if (R.segs[i]) { for (let k = 0; k < 5; k++) { const a = k * 1.2566; oval(ix + Math.cos(a) * 4, iy + Math.sin(a) * 4, 3, 3, '#ff7fae', null); } oval(ix, iy, 2.4, 2.4, '#ffe08a', null); }
    else oval(ix, iy, 3, 3, '#5b5d86', null);
  }
  oval(cx, cy, 10, 10, '#fff3d8', '#5b4a6e', 2);
  ctx.fillStyle = '#ff6f9e'; ctx.beginPath(); ctx.moveTo(cx - 8, cy - rad - 12); ctx.lineTo(cx + 8, cy - rad - 12); ctx.lineTo(cx, cy - rad + 4); ctx.closePath(); ctx.fill();
  ctx.font = '900 15px "Trebuchet MS",system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#3e2c54';
  const txt = !R.done ? 'BLÜTEN-ROULETTE' : R.win ? 'BONUSSPIEL!' : 'DIESMAL NICHT …';
  ctx.strokeText(txt, cx, cy + rad + 26); ctx.fillStyle = '#fff1c4'; ctx.fillText(txt, cx, cy + rad + 26); ctx.textAlign = 'left';
}

// ---------- Bonusspiele ----------
const BONUS_KINDS = ['balloons', 'cards', 'wheel'];
const BONUS_NAMES = { balloons: 'BALLONJAGD', cards: 'GLÜCKSKARTEN', wheel: 'FARBRAD' };
const BONUS_HELP = {
  balloons: 'Lauf links und rechts und wirf mit A oder B Farbeier nach oben. Platzt ein Ballon, bekommst du seinen Preis. 25 Sekunden!',
  cards: 'Deck Karten auf (Pfeile oder Stick, A oder antippen). Sammle Preise – aber der zweite Nebelgreifer beendet die Runde.',
  wheel: 'Drücke A oder tippe, um die drei Walzen nacheinander anzuhalten. Drei gleiche Bilder bringen den Hauptgewinn.'
};
let BG = null;
function startBonus(kind, fromLevel) {
  BG = { kind, fromLevel, t: 0, prizes: { lives: 0, coins: 0 }, over: false, overT: 0, msg: '', cool: 0 };
  if (kind === 'balloons') Object.assign(BG, { x: VW / 2, vx: 0, balloons: [], eggs: [], spawn: 0, time: 25 });
  if (kind === 'cards') {
    const deck = ['life', 'life', 'c10', 'c10', 'c10', 'c10', 'c20', 'c20', 'x2', 'x2', 'bad', 'bad'];
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    Object.assign(BG, { cards: deck.map(k => ({ k, open: 0, flip: 0 })), cur: 0, bad: 0, mult: 1 });
  }
  if (kind === 'wheel') Object.assign(BG, { reels: [0, 1, 2].map(i => ({ pos: Math.random() * 5, speed: 7 + i * 1.6, stopped: false })), stopIdx: 0 });
  mode = 'bonus'; hideOverlay(); $('hud').hidden = true; showTouch(true); clearInputs(); dirty = true;
  Sound.startMusic(5 - (BONUS_KINDS.indexOf(kind) % 3));
}
function bonusPrize(kind, el) {
  if (kind === 'life') { BG.prizes.lives += el || 1; Sound.play('flower'); }
  else { BG.prizes.coins += el; Sound.play('coin'); }
}
function bonusPress(key) {
  if (!BG || BG.over) return;
  if (BG.kind === 'balloons') {
    if ((key === 'jump' || key === 'throw' || key === 'tongue') && BG.cool <= 0) { BG.eggs.push({ x: BG.x, y: VH - 58, vy: -330 }); BG.cool = 0.22; Sound.play('throw'); }
  } else if (BG.kind === 'cards') {
    const c = BG.cur;
    if (key === 'left') BG.cur = (c + 11) % 12; else if (key === 'right') BG.cur = (c + 1) % 12;
    else if (key === 'up') BG.cur = (c + 8) % 12; else if (key === 'down') BG.cur = (c + 4) % 12;
    else if (key === 'jump' || key === 'throw' || key === 'tongue') flipCard(c);
    if (['left', 'right', 'up', 'down'].includes(key)) Sound.play('menu');
  } else if (BG.kind === 'wheel') {
    if (key === 'jump' || key === 'throw' || key === 'tongue' || key === 'down') stopReel();
  }
}
function flipCard(i) {
  const c = BG.cards[i]; if (!c || c.open) return;
  c.open = 1; c.flip = 0; BG.cur = i;
  if (c.k === 'bad') { BG.bad++; Sound.play('hurt'); if (BG.bad >= 2) endBonus('Der Nebelgreifer hat zugeschnappt!'); }
  else if (c.k === 'life') bonusPrize('life', BG.mult);
  else if (c.k === 'x2') { BG.mult = 2; Sound.play('ring'); }
  else bonusPrize('coin', (c.k === 'c20' ? 20 : 10) * BG.mult);
  if (!BG.over && BG.cards.every(x => x.open || x.k === 'bad')) endBonus('Alle Preise gefunden!');
}
const WHEEL = ['flower', 'star', 'heart', 'coin', 'egg'];
function stopReel() {
  const r = BG.reels[BG.stopIdx]; if (!r) return;
  r.stopped = true; r.pos = Math.round(r.pos) % 5; BG.stopIdx++; Sound.play('block');
  if (BG.stopIdx === 3) {
    const sy = BG.reels.map(x => WHEEL[(Math.round(x.pos) % 5 + 5) % 5]);
    const same = sy[0] === sy[1] && sy[1] === sy[2], pair = sy[0] === sy[1] || sy[1] === sy[2] || sy[0] === sy[2];
    if (same && sy[0] === 'heart') { bonusPrize('life', 3); endBonus('HAUPTGEWINN: +3 Leben!'); }
    else if (same) { bonusPrize('life', 2); bonusPrize('coin', 20); endBonus('Drei gleiche: +2 Leben und 20 Münzen!'); }
    else if (pair) { bonusPrize('life', 1); endBonus('Zwei gleiche: +1 Leben!'); }
    else { bonusPrize('coin', 5); endBonus('Trostpreis: 5 Münzen.'); }
  }
}
function endBonus(msg) { if (BG.over) return; BG.over = true; BG.overT = 0; BG.msg = msg; }
function tickBonus(dt) {
  const b = BG; b.t += dt; b.cool = Math.max(0, b.cool - dt);
  if (b.over) { b.overT += dt; if (b.overT > 1.6) finishBonus(); return; }
  if (b.kind === 'balloons') {
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    b.vx = approach(b.vx, dir * 150, 900 * dt); b.x = clamp(b.x + b.vx * dt, 16, VW - 16);
    b.time -= dt; b.spawn -= dt;
    if (b.spawn <= 0) { b.spawn = 0.55 + Math.random() * 0.5; const r = Math.random(); b.balloons.push({ x: 24 + Math.random() * (VW - 48), y: VH + 20, vy: 28 + Math.random() * 30, k: r < 0.16 ? 'life' : r < 0.55 ? 'c5' : 'c1', col: ['#ff8fb1', '#8fd2ff', '#ffe08a', '#b9f0a8', '#d6a8ff'][Math.floor(Math.random() * 5)], ph: Math.random() * 6 }); }
    for (const e of b.eggs) e.y += e.vy * dt;
    for (const bl of b.balloons) {
      bl.y -= bl.vy * dt; bl.x += Math.sin(b.t * 2 + bl.ph) * 12 * dt;
      for (const e of b.eggs) if (!bl.pop && !e.hit && Math.hypot(e.x - bl.x, e.y - bl.y) < 16) { bl.pop = true; e.hit = true; burst(bl.x, bl.y, bl.col, 12); bonusPrize(bl.k === 'life' ? 'life' : 'coin', bl.k === 'life' ? 1 : bl.k === 'c5' ? 5 : 1); }
    }
    b.eggs = b.eggs.filter(e => e.y > -20 && !e.hit); b.balloons = b.balloons.filter(x => !x.pop && x.y > -40);
    if (b.time <= 0) endBonus('Zeit um!');
  } else if (b.kind === 'cards') {
    for (const c of b.cards) if (c.open && c.flip < 1) c.flip = Math.min(1, c.flip + dt * 5);
  } else if (b.kind === 'wheel') {
    for (const r of b.reels) if (!r.stopped) r.pos = (r.pos + r.speed * dt) % 5;
  }
  for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 320 * dt; p.life -= dt; }
  if (particles.length) particles = particles.filter(p => p.life > 0);
}
function finishBonus() {
  const b = BG; BG = null; particles = [];
  if (b.fromLevel) { session.lives += b.prizes.lives; for (let i = 0; i < b.prizes.coins; i++) { session.coins++; if (session.coins % 100 === 0) session.lives++; } }
  else { save.bank.lives = Math.min(9, save.bank.lives + b.prizes.lives); save.bank.coins = Math.min(99, save.bank.coins + b.prizes.coins); persist(); }
  const text = BONUS_NAMES[b.kind] + ': ' + b.msg + ' Gewinn: ' + (b.prizes.lives ? '+' + b.prizes.lives + ' Leben ' : '') + (b.prizes.coins ? '+' + b.prizes.coins + ' Münzen' : '') + (!b.prizes.lives && !b.prizes.coins ? 'leider nichts.' : b.fromLevel ? '' : ' – gutgeschrieben für deine nächste Runde.');
  showOverlay('bonusdone', 'BONUS VORBEI', text, [{ label: 'WEITER ▶', primary: true, fn: () => b.fromLevel && L ? showClear() : openBonusMenu() }]);
}
function drawPrizeIcon(k, x, y, s = 1) {
  if (k === 'life' || k === 'heart') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#ff6f8e'; ctx.beginPath(); ctx.moveTo(0, 5); ctx.bezierCurveTo(-9, -2, -5, -9, 0, -4); ctx.bezierCurveTo(5, -9, 9, -2, 0, 5); ctx.fill(); ctx.restore(); }
  else if (k === 'star') { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = (i % 2 ? 3 : 7) * s; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = '#ffe36a'; ctx.fill(); }
  else if (k === 'flower') { for (let i = 0; i < 5; i++) { const a = i * 1.2566; oval(x + Math.cos(a) * 5 * s, y + Math.sin(a) * 5 * s, 3.6 * s, 3.6 * s, ['#ff9cc0', '#ffd27a', '#9fd8ff', '#b9f0a8', '#d6a8ff'][i], null); } oval(x, y, 3 * s, 3 * s, '#fff7d0', null); }
  else if (k === 'egg') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); drawEgg(0, 0, 0); ctx.restore(); }
  else { oval(x, y, 6 * s, 6 * s, '#ffd96a', '#a57a3e', 1.4); oval(x, y, 2.5 * s, 3.5 * s, '#fff1b0', null); }
}
function drawBonus() {
  const b = BG; ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.lineJoin = 'round';
  const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, b.kind === 'wheel' ? '#4a3a78' : b.kind === 'cards' ? '#2f5a6e' : '#86d3f0'); g.addColorStop(1, b.kind === 'balloons' ? '#fff1d0' : '#c48fb8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  for (let i = 0; i < 18; i++) oval((i * 73 + b.t * 8) % (VW + 20) - 10, 20 + (i * 47) % (VH - 60), 1.6, 1.6, '#ffffffaa', null);
  const banner = (text, y, size) => { ctx.font = '900 ' + size + 'px "Trebuchet MS",system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#3e2c54'; ctx.strokeText(text, VW / 2, y); ctx.fillStyle = '#fff1c4'; ctx.fillText(text, VW / 2, y); ctx.textAlign = 'left'; };
  banner(BONUS_NAMES[b.kind], 26, 18);
  ctx.font = '900 12px "Trebuchet MS",system-ui,sans-serif'; ctx.fillStyle = '#fff6dc';
  ctx.fillText('♥ +' + b.prizes.lives + '   ● +' + b.prizes.coins, 10, 20);
  if (b.kind === 'balloons') {
    ctx.textAlign = 'right'; ctx.fillText('⏱ ' + Math.max(0, Math.ceil(b.time)), VW - 10, 20); ctx.textAlign = 'left';
    rect(0, VH - 30, VW, 30, '#8fd38f'); rect(0, VH - 30, VW, 4, '#c9f0a8');
    for (const bl of b.balloons) {
      ctx.strokeStyle = '#ffffff88'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bl.x, bl.y + 14); ctx.lineTo(bl.x + Math.sin(b.t * 3 + bl.ph) * 3, bl.y + 30); ctx.stroke();
      oval(bl.x, bl.y, 12, 14, bl.col, '#5e4a66', 1.5); oval(bl.x - 4, bl.y - 5, 3, 4, '#ffffffaa', null);
      drawPrizeIcon(bl.k === 'life' ? 'life' : 'coin', bl.x, bl.y + 1, bl.k === 'c1' ? 0.6 : 0.8);
    }
    for (const e of b.eggs) drawEgg(e.x, e.y, b.t * 10);
    drawPufi(b.x, VH - 30, b.vx < -1 ? -1 : 1, { run: Math.min(1, Math.abs(b.vx) / 120), phase: b.t * 16, baby: true, mouth: b.cool > 0.1 });
  } else if (b.kind === 'cards') {
    const cw = 52, ch = 62, gx = VW / 2 - (4 * cw + 3 * 10) / 2, gy = 46;
    b.layout = { cw, ch, gx, gy };
    b.cards.forEach((c, i) => {
      const x = gx + (i % 4) * (cw + 10), y = gy + Math.floor(i / 4) * (ch + 8), sw = c.open ? Math.abs(Math.cos(c.flip * Math.PI)) : 1, face = c.open && c.flip > 0.5;
      ctx.save(); ctx.translate(x + cw / 2, y + ch / 2); ctx.scale(sw || 0.05, 1);
      rect(-cw / 2, -ch / 2, cw, ch, face ? '#fff6e2' : '#6f7fb8'); ctx.strokeStyle = i === b.cur && !b.over ? '#ffe08a' : '#fff3d8'; ctx.lineWidth = i === b.cur ? 3 : 1.5; ctx.strokeRect(-cw / 2 + 1, -ch / 2 + 1, cw - 2, ch - 2);
      if (!face) { for (let k = 0; k < 5; k++) { const a = k * 1.2566; oval(Math.cos(a) * 7, Math.sin(a) * 7, 5, 5, '#8f9fd8', null); } oval(0, 0, 4, 4, '#ffe08a', null); }
      else if (c.k === 'bad') { oval(-9, -6, 8, 4, '#667192', '#30385e', 1); oval(9, -6, 8, 4, '#667192', '#30385e', 1); oval(0, -2, 10, 9, '#3d456b', '#252941', 1.5); oval(-3, -3, 2, 3, '#ffe090', null); oval(3, -3, 2, 3, '#ffe090', null); }
      else if (c.k === 'x2') { ctx.font = '900 20px "Trebuchet MS",sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#c4508a'; ctx.fillText('×2', 0, 7); ctx.textAlign = 'left'; }
      else { drawPrizeIcon(c.k === 'life' ? 'life' : 'coin', 0, -6, 1.6); ctx.font = '900 11px "Trebuchet MS",sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#5b4a6e'; ctx.fillText(c.k === 'life' ? '1UP' : c.k === 'c20' ? '20' : '10', 0, 22); ctx.textAlign = 'left'; }
      ctx.restore();
    });
    ctx.font = '900 11px "Trebuchet MS",sans-serif'; ctx.fillStyle = '#fff6dc'; ctx.textAlign = 'center';
    ctx.fillText('Nebelgreifer: ' + b.bad + '/2' + (b.mult > 1 ? '   ×2 aktiv' : ''), VW / 2, VH - 12); ctx.textAlign = 'left';
  } else if (b.kind === 'wheel') {
    const rw = 62, rh = 120, gx = VW / 2 - (3 * rw + 2 * 12) / 2, gy = 50;
    rect(gx - 12, gy - 12, 3 * rw + 2 * 12 + 24, rh + 24, '#2b2244'); ctx.strokeStyle = '#ffd98e'; ctx.lineWidth = 3; ctx.strokeRect(gx - 12, gy - 12, 3 * rw + 2 * 12 + 24, rh + 24);
    b.reels.forEach((r, i) => {
      const x = gx + i * (rw + 12); rect(x, gy, rw, rh, '#fff6e2');
      ctx.save(); ctx.beginPath(); ctx.rect(x, gy, rw, rh); ctx.clip();
      for (let k = -1; k <= 2; k++) { const idx = ((Math.floor(r.pos) + k) % 5 + 5) % 5, frac = r.pos - Math.floor(r.pos), y = gy + rh / 2 + (k - frac) * 44; drawPrizeIcon(WHEEL[idx], x + rw / 2, y, 1.8); }
      ctx.restore();
      if (i === b.stopIdx && !b.over) { ctx.strokeStyle = '#ff6f9e'; ctx.lineWidth = 3; ctx.strokeRect(x - 2, gy - 2, rw + 4, rh + 4); }
    });
    rect(gx - 12, gy + rh / 2 - 1, 3 * rw + 48, 2, '#ff6f9e88');
    ctx.font = '900 11px "Trebuchet MS",sans-serif'; ctx.fillStyle = '#fff6dc'; ctx.textAlign = 'center'; ctx.fillText('A / Tippen: Walze ' + Math.min(3, b.stopIdx + 1) + ' anhalten', VW / 2, VH - 14); ctx.textAlign = 'left';
  }
  for (const q of particles) rect(q.x - 1.5, q.y - 1.5, 3, 3, q.color);
  if (b.over) { ctx.fillStyle = 'rgba(30,24,56,0.45)'; ctx.fillRect(0, 0, VW, VH); banner(b.msg, VH / 2, 16); }
}
C.addEventListener('pointerdown', e => {
  if (mode !== 'bonus' || !BG || BG.over) return;
  if (BG.kind === 'wheel') { stopReel(); return; }
  if (BG.kind === 'cards' && BG.layout) {
    const r = C.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * VW, y = (e.clientY - r.top) / r.height * VH, Lo = BG.layout;
    const col = Math.floor((x - Lo.gx) / (Lo.cw + 10)), row = Math.floor((y - Lo.gy) / (Lo.ch + 8));
    if (col >= 0 && col < 4 && row >= 0 && row < 3) flipCard(row * 4 + col);
  }
});

// ---------- HUD (DOM, nur bei Änderung) ----------
function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; const el = $(id); if (el) el.textContent = v; } }
function hud() {
  if (!L || !P) return;
  setText('hLevel', (L.w + 1) + '-' + (L.data.stage + 1));
  setText('hStars', '★ ' + L.stars);
  setText('hLives', '♥ ' + session.lives);
  setText('hEggs', '🥚 ' + P.eggs + '/' + MAX_EGGS);
  setText('hCoins', '● ' + session.coins);
  setText('hRed', '◎ ' + L.counts.red + '/' + L.totals.red);
  setText('hFlowers', '✿ ' + L.counts.flowers + '/' + L.totals.flowers);
  const danger = !L.baby.on; if (hudCache.danger !== danger) { hudCache.danger = danger; $('hStars').classList.toggle('danger', danger); }
}

// ---------- Menüs ----------
function showOverlay(view, title, text, buttons, extra) {
  endBoot(); mode = view; $('overlay').hidden = false; $('overlay').dataset.view = view;
  $('heading').textContent = title; $('description').textContent = text || '';
  const box = $('extra'); box.replaceChildren(); if (extra) extra(box);
  const list = $('buttons'); list.replaceChildren();
  for (const b of buttons) {
    const el = document.createElement('button'); el.type = 'button'; el.textContent = b.label; if (b.primary) el.className = 'primary';
    if (b.id) el.id = b.id;
    el.addEventListener('click', () => { Sound.play('menu'); b.fn(el); });
    list.appendChild(el);
  }
  $('hud').hidden = !['pause', 'clear', 'gameover'].includes(view);
  showTouch(false); clearInputs(); dirty = true;
  setTimeout(() => { const f = $('overlay').querySelector('button.primary') || $('overlay').querySelector('button:not([disabled])'); if (f && !lastTouch) f.focus({ preventScroll: true }); }, 0);
  if (view !== 'pause') Sound.stopMusic();
}
function hideOverlay() { endBoot(); $('overlay').hidden = true; $('hud').hidden = false; }
function title() {
  if (!L || !L.attract) previewLevel(attractWorld * PER);
  const bank = save.bank.lives || save.bank.coins ? 'Bonus-Guthaben: ♥ +' + save.bank.lives + '  ● +' + save.bank.coins : 'Trag Tamo über sechs Inseln und rette ihn vor den Nebelgreifern!';
  showOverlay('title', 'PUFI & DER FARBWIND', bank, [
    { label: save.unlocked > 1 ? 'WEITERSPIELEN' : 'SPIEL STARTEN', primary: true, fn: () => begin(Math.min(save.unlocked - 1, COUNT - 1)) },
    { label: 'INSELKARTE', fn: openMap },
    { label: 'BONUSSPIELE', fn: openBonusMenu },
    { label: 'OPTIONEN', fn: openOptions },
    { label: 'STEUERUNG', fn: openHelp },
    { label: 'GOOGLE-SPEICHER', fn: openCloud }
  ]);
}
// Bonusspiele aus dem Hauptmenü: Ballonjagd sofort, die anderen nach Insel 1 bzw. 2.
const BONUS_NEED = { balloons: 1, cards: PER + 1, wheel: PER * 2 + 1 };
function openBonusMenu() {
  if (!L || !L.attract) previewLevel(attractWorld * PER);
  showOverlay('bonusmenu', 'BONUSSPIELE', 'Gewinne Leben und Münzen für deine nächste Runde. Im Level startet ein Bonusspiel, wenn das Blüten-Roulette am Ziel auf einer Blüte landet.', [
    ...BONUS_KINDS.map(k => {
      const open = save.unlocked >= BONUS_NEED[k];
      return { label: open ? BONUS_NAMES[k] : '🔒 ' + BONUS_NAMES[k] + ' · nach Insel ' + Math.round((BONUS_NEED[k] - 1) / PER), fn: () => startBonus(k, false) };
    }),
    { label: 'ZURÜCK', fn: title }
  ], box => {
    box.innerHTML = '<p class="tip">' + BONUS_KINDS.map(k => '<b>' + BONUS_NAMES[k] + ':</b> ' + BONUS_HELP[k]).join('<br>') + '</p>';
  });
  const list = $('buttons').children; BONUS_KINDS.forEach((k, i) => { if (save.unlocked < BONUS_NEED[k]) list[i].disabled = true; });
}
function openCloud() {
  showOverlay('cloud', 'GOOGLE-SPEICHER', 'Melde dich mit Google an, dann werden Inseln, Bestwerte und Einstellungen auf allen deinen Geräten gesichert. Ohne Anmeldung bleibt alles nur auf diesem Gerät.', [
    { label: 'ZURÜCK', primary: true, fn: title }
  ]);
  if (!$('cloudMount').firstChild) $('cloudMount').textContent = 'Der Google-Speicher ist gerade nicht erreichbar (offline?).';
}
// Lade- und Startbildschirm: kurzer Ladebalken, dann wartet das Spiel auf einen Tastendruck (schaltet auch den Ton frei).
let booted = false, bootReady = false, attractWorld = 0, attractT = 0;
function bootScreen() {
  mode = 'boot'; previewLevel(0); $('overlay').hidden = true; $('hud').hidden = true;
  const start = performance.now();
  const ready = () => setTimeout(() => { bootReady = true; $('boot').classList.add('ready'); $('bootPrompt').textContent = lastTouch || matchMedia('(pointer:coarse)').matches ? 'TIPPEN ZUM STARTEN' : 'DRÜCKE START ODER ENTER'; }, Math.max(0, 1100 - (performance.now() - start)));
  if (document.readyState === 'complete') ready(); else window.addEventListener('load', ready, { once: true });
}
function endBoot() {
  if (booted) return; booted = true;
  const b = $('boot'); b.classList.add('gone'); setTimeout(() => { b.hidden = true; }, 450);
}
function pressStart() {
  if (mode !== 'boot' || !bootReady) return;
  Sound.ensure(); Sound.play('ring'); title();
}
$('boot').addEventListener('pointerdown', e => { e.preventDefault(); if (e.pointerType === 'touch') lastTouch = true; pressStart(); });
function previewLevel(n) { L = build(n); P = newHero(L.startX, L.startY); L.baby = { on: true }; L.intro = 0; L.attract = true; L.dir = 1; cam.x = 0; cam.y = L.rows * T - VH; dirty = true; }
function begin(n) { session = { lives: 5 + save.bank.lives, coins: save.bank.coins }; save.bank = { lives: 0, coins: 0 }; persist(); autoFullscreen(); startLevel(n); }
function openMap() {
  showOverlay('map', 'DIE FARBWIND-INSELN', 'Wähle ein freigeschaltetes Level. Bestwerte bis 100 Punkte: Sterne, rote Münzen und Farbblüten zählen.', [
    { label: 'ZURÜCK', fn: title }
  ], box => {
    const grid = document.createElement('div'); grid.className = 'map';
    for (let w = 0; w < WORLDS.length; w++) {
      const row = document.createElement('div'); row.className = 'world';
      const name = document.createElement('span'); name.className = 'wname'; name.textContent = (w + 1) + ' ' + WORLDS[w].name; row.appendChild(name);
      for (let l = 0; l < PER; l++) {
        const n = w * PER + l, b = document.createElement('button'); b.type = 'button'; b.className = 'lvl';
        const best = save.best[n]; b.disabled = n >= save.unlocked;
        b.textContent = (w + 1) + '-' + (l + 1) + (l === PER - 1 ? ' ♜' : '') + (best !== undefined ? '\n' + best : '');
        b.title = best !== undefined ? 'Bestwert ' + best + '/100' : '';
        if (best === 100) b.classList.add('perfect');
        b.addEventListener('click', () => { Sound.play('menu'); begin(n); });
        row.appendChild(b);
      }
      grid.appendChild(row);
    }
    box.appendChild(grid);
  });
  setTimeout(() => { const f = $('overlay').querySelector('.lvl:not([disabled]):last-of-type') || $('overlay').querySelector('.lvl:not([disabled])'); const all = [...$('overlay').querySelectorAll('.lvl:not([disabled])')]; const last = all[all.length - 1]; if (last && !lastTouch) last.focus({ preventScroll: true }); else if (f && !lastTouch) f.focus(); }, 0);
}
function openOptions() {
  const back = mode === 'pause' ? () => showPause() : title;
  previousView = back;
  const label = {
    controls: () => 'TOUCH LINKS: ' + (save.controls === 'stick' ? 'STICK' : 'STEUERKREUZ'),
    touch: () => 'TOUCH-TASTEN: ' + ({ auto: 'AUTOMATISCH', on: 'IMMER', off: 'AUS' })[save.touch],
    music: () => 'MUSIK: ' + (save.music ? 'AN' : 'AUS'),
    sound: () => 'EFFEKTE: ' + (save.sound ? 'AN' : 'AUS')
  };
  showOverlay('options', 'OPTIONEN', padName ? '🎮 Controller verbunden: ' + padName : 'Tipp: Ein Gamepad kann jederzeit angeschlossen werden.', [
    { label: label.controls(), fn: el => { save.controls = save.controls === 'stick' ? 'dpad' : 'stick'; persist(); el.textContent = label.controls(); syncTouchLayout(); } },
    { label: label.touch(), fn: el => { save.touch = { auto: 'on', on: 'off', off: 'auto' }[save.touch]; persist(); el.textContent = label.touch(); } },
    { label: label.music(), fn: el => { save.music = !save.music; persist(); el.textContent = label.music(); } },
    { label: label.sound(), fn: el => { save.sound = !save.sound; persist(); el.textContent = label.sound(); updateSoundButton(); } },
    { label: 'VOLLBILD', fn: toggleFullscreen, id: 'optFs' },
    { label: 'ZURÜCK', primary: true, fn: back }
  ]);
  if (!fsSupported()) { const b = $('optFs'); if (b) b.hidden = true; }
}
function openHelp() {
  showOverlay('help', 'STEUERUNG', '', [{ label: 'ZURÜCK', primary: true, fn: title }], box => {
    box.innerHTML = '<table class="keys"><tr><th></th><th>PC</th><th>Gamepad</th><th>Touch</th></tr>' +
      '<tr><td>Laufen</td><td>← → / A D</td><td>Stick / Steuerkreuz</td><td>Stick links</td></tr>' +
      '<tr><td>Springen · halten = Flattern</td><td>Leertaste / Z</td><td>A (unten)</td><td>A</td></tr>' +
      '<tr><td>Zunge (mit ↑ schräg)</td><td>X / J</td><td>X (links)</td><td>X</td></tr>' +
      '<tr><td>Ei zielen · werfen</td><td>C / K</td><td>B (rechts) / R1</td><td>B</td></tr>' +
      '<tr><td>Ei legen · Stampfen</td><td>↓ / S</td><td>Stick ↓ / Y</td><td>Y</td></tr>' +
      '<tr><td>Pause · Vollbild</td><td>Esc / P · F</td><td>Start</td><td>Ⅱ · ⛶</td></tr></table>' +
      '<p class="tip">Werfen: einmal tippen startet den Zielpfeil, nochmal tippen wirft. Halten und loslassen geht auch. Mit dem rechten Stick zielst du direkt.<br>Wird Pufi getroffen, schwebt Tamo in einer Blase davon und die Sterne zählen herunter. Hol ihn zurück, bevor sie auf 0 fallen! Der Farbring in der Levelmitte speichert deinen Fortschritt und schenkt +10 Sterne.</p>';
  });
}
function showPause() {
  showOverlay('pause', 'PAUSE', (L.w + 1) + '-' + (L.data.stage + 1) + ' ' + L.data.name, [
    { label: 'WEITER ▶', primary: true, fn: resume },
    { label: 'LEVEL NEU STARTEN', fn: () => startLevel(L.n) },
    { label: 'OPTIONEN', fn: openOptions },
    { label: 'INSELKARTE', fn: openMap }
  ]);
}
function togglePause() { if (mode === 'play') showPause(); else if (mode === 'pause') resume(); }
function resume() { if (!L || !P) return title(); mode = 'play'; hideOverlay(); showTouch(true); clearInputs(); Sound.startMusic(L.w); }
function showGameOver() {
  showOverlay('gameover', 'SPIEL VORBEI', 'Die Nebelgreifer waren schneller. Neue Runde, neues Glück – mit fünf Leben ab dem Levelanfang.', [
    { label: 'NOCHMAL ▶', primary: true, fn: () => begin(L.n) },
    { label: 'INSELKARTE', fn: openMap }
  ]);
}
function levelScore() {
  const st = Math.min(MAX_STARS, L.stars), red = L.totals.red ? Math.round(20 * L.counts.red / L.totals.red) : 20, fl = L.totals.flowers ? Math.round(50 * L.counts.flowers / L.totals.flowers) : 50;
  return { st, red, fl, total: st + red + fl };
}
function showClear() {
  const sc = levelScore(), n = L.n, old = save.best[n];
  if (old === undefined || sc.total > old) save.best[n] = sc.total;
  save.unlocked = Math.max(save.unlocked, Math.min(COUNT, n + 2)); persist();
  const last = n === COUNT - 1;
  showOverlay('clear', last ? 'DER FARBWIND IST FREI!' : 'LEVEL GESCHAFFT!', last ? 'Pufi und Tamo haben alle sechs Inseln gerettet. Danke fürs Spielen!' : '', [
    { label: last ? 'ZUR INSELKARTE' : 'NÄCHSTES LEVEL ▶', primary: true, fn: () => last ? openMap() : startLevel(n + 1) },
    { label: 'INSELKARTE', fn: openMap }
  ], box => {
    box.innerHTML = '<div class="tally"><span>★ Sterne</span><b>' + sc.st + '/30</b><span>◎ Rote Münzen ' + L.counts.red + '/' + L.totals.red + '</span><b>' + sc.red + '/20</b><span>✿ Farbblüten ' + L.counts.flowers + '/' + L.totals.flowers + '</span><b>' + sc.fl + '/50</b><span class="sum">Punkte</span><b class="sum">' + sc.total + (sc.total === 100 ? ' ✦ PERFEKT' : '') + '</b></div>' + (old !== undefined ? '<p class="tip">Bisheriger Bestwert: ' + old + '</p>' : '');
  });
}

// ---------- Vollbild & Größe ----------
function fsSupported() { const d = document.documentElement; return !!(d.requestFullscreen || d.webkitRequestFullscreen); }
function fsActive() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function toggleFullscreen() {
  try {
    if (fsActive()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    const d = document.documentElement, req = d.requestFullscreen || d.webkitRequestFullscreen;
    const r = req.call(d, { navigationUI: 'hide' });
    const lock = () => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (_) {} };
    if (r && r.then) r.then(lock).catch(() => {}); else lock();
  } catch (_) {}
}
function autoFullscreen() { if (lastTouch && fsSupported() && !fsActive()) toggleFullscreen(); }
function resize() {
  const cw = window.innerWidth || 960, ch = window.innerHeight || 540, aspect = cw / ch;
  VW = Math.round(clamp(VH * aspect, 320, 640));
  let cssW = cw, cssH = cw * VH / VW;
  if (cssH > ch) { cssH = ch; cssW = ch * VW / VH; }
  const dpr = window.devicePixelRatio || 1;
  SCALE = clamp(Math.round((dpr * cssH / VH) * 4) / 4, 1, 3);
  C.width = Math.round(VW * SCALE); C.height = Math.round(VH * SCALE);
  C.style.width = cssW + 'px'; C.style.height = cssH + 'px';
  for (const k in skyCache) delete skyCache[k];
  document.body.classList.toggle('portrait', aspect < 1);
  dirty = true;
  if (L && mode !== 'play') { cam.x = clamp(cam.x, 0, Math.max(0, L.cols * T - VW)); }
}

// ---------- Tastatur ----------
const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  Space: 'jump', KeyZ: 'jump', KeyY: 'jump', KeyX: 'tongue', KeyJ: 'tongue', KeyC: 'throw', KeyK: 'throw', KeyL: 'throw', Escape: 'pause', KeyP: 'pause' };
window.addEventListener('keydown', e => {
  lastTouch = false;
  if (e.code === 'KeyF' && !e.repeat) { toggleFullscreen(); return; }
  if (e.code === 'KeyM' && !e.repeat) { save.music = !save.music; persist(); if (save.music && mode === 'play') Sound.startMusic(L.w); else Sound.stopMusic(); return; }
  if (mode === 'boot') { if (!/^F\d+$/.test(e.code) && !e.repeat) { e.preventDefault(); pressStart(); } return; }
  if (mode !== 'play' && mode !== 'bonus') {
    if (e.code === 'Escape') { e.preventDefault(); menuBack(); return; }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) { e.preventDefault(); menuMove(e.code.replace('Arrow', '').toLowerCase()); }
    return;
  }
  const k = KEYS[e.code]; if (!k) return; e.preventDefault(); if (!e.repeat) action(k, true, 'key:' + e.code);
});
window.addEventListener('keyup', e => { const k = KEYS[e.code]; if (k) { e.preventDefault(); action(k, false, 'key:' + e.code); } });
window.addEventListener('blur', () => { if (mode === 'play') showPause(); clearInputs(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (mode === 'play') showPause(); clearInputs(); Sound.stopMusic(); } });

function menuButtons() { return [...$('overlay').querySelectorAll('button:not([disabled]):not([hidden])')].filter(b => b.offsetParent !== null || b.getClientRects().length); }
function menuMove(dir) {
  const list = menuButtons(); if (!list.length) return;
  const cur = document.activeElement, i = list.indexOf(cur);
  if (i < 0) { list[0].focus(); return; }
  const r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let best = null, bestD = 1e9;
  for (const b of list) {
    if (b === cur) continue; const q = b.getBoundingClientRect(), dx = q.left + q.width / 2 - cx, dy = q.top + q.height / 2 - cy;
    const ok = dir === 'up' ? dy < -4 : dir === 'down' ? dy > 4 : dir === 'left' ? dx < -4 : dx > 4; if (!ok) continue;
    const d = (dir === 'up' || dir === 'down') ? Math.abs(dy) + Math.abs(dx) * 2 : Math.abs(dx) + Math.abs(dy) * 2;
    if (d < bestD) { bestD = d; best = b; }
  }
  if (!best) best = list[(i + (dir === 'up' || dir === 'left' ? list.length - 1 : 1)) % list.length];
  best.focus(); Sound.play('menu');
}
function menuBack() {
  if (mode === 'pause') resume();
  else if (mode === 'options' && previousView) previousView();
  else if (['map', 'help', 'options', 'bonusmenu', 'cloud'].includes(mode)) title();
}

// ---------- Touch ----------
let lastTouch = false, stickPointer = null, stickOrigin = null;
function touchWanted() { return save.touch === 'on' || (save.touch === 'auto' && (lastTouch || matchMedia('(pointer:coarse)').matches)); }
function showTouch(on) { $('touch').hidden = !(on && touchWanted()); syncTouchLayout(); }
function syncTouchLayout() { $('stickZone').hidden = save.controls !== 'stick'; $('dpad').hidden = save.controls !== 'dpad'; }
window.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') { if (!lastTouch) { lastTouch = true; if (mode === 'play' || mode === 'bonus') showTouch(true); } } else if (e.pointerType === 'mouse') { /* Maus zählt nicht als Touch */ } }, { capture: true, passive: true });
document.querySelectorAll('[data-action]').forEach(b => {
  const key = b.dataset.action;
  b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) {} b.classList.add('pressed'); action(key, true, 'touch:' + e.pointerId); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(type, e => { b.classList.remove('pressed'); action(key, false, 'touch:' + e.pointerId); });
  b.addEventListener('contextmenu', e => e.preventDefault());
});
const zone = $('stickZone'), knob = $('stickKnob'), baseEl = $('stickBase');
function resetStick() {
  stickPointer = null; stickOrigin = null;
  if (knob) { knob.style.transform = 'translate(0px,0px)'; baseEl.classList.remove('active'); }
  for (const k of ['left', 'right', 'up', 'down']) { holds[k].delete('stick'); input[k] = holds[k].size > 0; }
}
function stickMove(e) {
  if (stickPointer !== e.pointerId || !stickOrigin) return;
  const dx = e.clientX - stickOrigin.x, dy = e.clientY - stickOrigin.y, max = 38, len = Math.hypot(dx, dy) || 1;
  const kx = len > max ? dx / len * max : dx, ky = len > max ? dy / len * max : dy;
  knob.style.transform = 'translate(' + kx + 'px,' + ky + 'px)';
  const dead = 12;
  action('left', dx < -dead && Math.abs(dx) > Math.abs(dy) * 0.45, 'stick');
  action('right', dx > dead && Math.abs(dx) > Math.abs(dy) * 0.45, 'stick');
  action('up', dy < -24 && Math.abs(dy) > Math.abs(dx) * 0.8, 'stick');
  action('down', dy > 24 && Math.abs(dy) > Math.abs(dx) * 0.8, 'stick');
}
zone.addEventListener('pointerdown', e => {
  if (stickPointer !== null) return; e.preventDefault(); stickPointer = e.pointerId;
  const zr = zone.getBoundingClientRect();
  stickOrigin = { x: clamp(e.clientX, zr.left + 44, zr.right - 44), y: clamp(e.clientY, zr.top + 44, zr.bottom - 44) };
  baseEl.style.left = (stickOrigin.x - zr.left) + 'px'; baseEl.style.top = (stickOrigin.y - zr.top) + 'px'; baseEl.classList.add('active');
  try { zone.setPointerCapture(e.pointerId); } catch (_) {}
  stickMove(e);
});
zone.addEventListener('pointermove', e => { if (e.pointerId === stickPointer) { e.preventDefault(); stickMove(e); } });
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) zone.addEventListener(type, e => { if (e.pointerId === stickPointer) resetStick(); });

// ---------- Gamepad ----------
let padName = '', padPrev = {}, padRepeat = 0, padIndex = -1;
window.addEventListener('gamepadconnected', e => { padName = (e.gamepad.id || 'Gamepad').replace(/\(.*?\)/g, '').trim().slice(0, 40); padIndex = e.gamepad.index; lastTouch = false; if (mode === 'play') showTouch(true); });
window.addEventListener('gamepaddisconnected', e => { if (e.gamepad.index === padIndex) { padIndex = -1; padName = ''; for (const k in holds) holds[k].delete('pad'); for (const k in input) input[k] = holds[k].size > 0; } });
function rumble(ms, strength) {
  try { const gp = navigator.getGamepads && navigator.getGamepads()[padIndex]; const a = gp && gp.vibrationActuator; if (a && a.playEffect) a.playEffect('dual-rumble', { duration: ms, strongMagnitude: strength, weakMagnitude: strength * 0.6 }).catch(() => {}); } catch (_) {}
}
function pollPad(dt) {
  if (padIndex < 0 || !navigator.getGamepads) return;
  let gp; try { gp = navigator.getGamepads()[padIndex]; } catch (_) { return; }
  if (!gp || !gp.connected) return;
  const btn = i => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5));
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
  const st = {
    left: btn(14) || ax < -0.4, right: btn(15) || ax > 0.4, up: btn(12) || ay < -0.6, down: btn(13) || ay > 0.6 || btn(3),
    jump: btn(0), tongue: btn(2) || btn(4) || btn(6), throw: btn(1) || btn(5) || btn(7), start: btn(9), back: btn(8)
  };
  if (mode === 'boot') { if ((st.jump && !padPrev.jump) || (st.start && !padPrev.start)) pressStart(); }
  else if (mode === 'bonus') { for (const k of ['left', 'right', 'up', 'down', 'jump', 'tongue', 'throw']) if (st[k] !== !!padPrev[k]) action(k, st[k], 'pad'); }
  else if (mode === 'play') {
    for (const k of ['left', 'right', 'up', 'down', 'jump', 'tongue', 'throw']) if (st[k] !== !!padPrev[k]) action(k, st[k], 'pad');
    if (st.start && !padPrev.start) togglePause();
    const mag = Math.hypot(rx, ry);
    if (P && P.aim && mag > 0.5) padAim = { ang: clamp(Math.atan2(-ry, Math.abs(rx)), -0.35, 1.5), dir: rx < 0 ? -1 : 1 };
    else padAim = null;
  } else {
    padRepeat -= dt;
    const dir = st.up ? 'up' : st.down && !btn(3) ? 'down' : st.left ? 'left' : st.right ? 'right' : null;
    const prevDir = padPrev.dir;
    if (dir && (dir !== prevDir || padRepeat <= 0)) { menuMove(dir); padRepeat = dir !== prevDir ? 0.35 : 0.15; }
    st.dir = dir;
    if (st.jump && !padPrev.jump) { const f = document.activeElement; if (f && f.tagName === 'BUTTON' && $('overlay').contains(f)) f.click(); else { const pb = $('overlay').querySelector('button.primary'); if (pb) pb.click(); } }
    if ((st.throw && !padPrev.throw) || (st.start && !padPrev.start && mode === 'pause')) menuBack();
  }
  padPrev = st;
}

// ---------- Kopfleiste ----------
function updateSoundButton() { $('sound').textContent = save.sound ? '♪' : '♪̸'; $('sound').setAttribute('aria-pressed', String(save.sound)); }
$('sound').addEventListener('click', () => { save.sound = !save.sound; save.music = save.sound; persist(); updateSoundButton(); if (save.music && mode === 'play') Sound.startMusic(L.w); else Sound.stopMusic(); });
$('pause').addEventListener('click', () => { if (mode === 'play') showPause(); else if (mode === 'pause') resume(); });
$('fullscreen').addEventListener('click', toggleFullscreen);
if (!fsSupported()) $('fullscreen').hidden = true;
for (const ev of ['resize', 'orientationchange', 'fullscreenchange', 'webkitfullscreenchange']) window.addEventListener(ev, resize);
document.addEventListener('fullscreenchange', resize);

// ---------- Hauptschleife ----------
let prev = 0, acc = 0;
const STEP = 1 / 60;
function frame(ms) {
  const dt = prev ? Math.min(0.1, (ms - prev) / 1000) : 0; prev = ms;
  pollPad(dt);
  if (mode === 'play' && L) {
    acc += dt; let n = 0;
    while (acc >= STEP && n++ < 6) { tick(STEP); acc -= STEP; if (mode !== 'play') break; }
    if (acc > STEP * 6) acc = 0;
    if (mode === 'play' || dirty) { draw(); dirty = false; }
  } else if (mode === 'bonus' && BG) {
    acc += dt; let n = 0;
    while (acc >= STEP && n++ < 6 && BG) { tickBonus(STEP); acc -= STEP; }
    if (acc > STEP * 6) acc = 0;
    if (BG) drawBonus();
  } else if (L && L.attract && (mode === 'boot' || !$('overlay').hidden) && !document.hidden) {
    // Vorspann hinter dem Menü: langsamer Kameraflug mit 30 Bildern/s, danach die nächste Insel.
    attractT += dt;
    if (attractT >= 1 / 30 || dirty) {
      const max = Math.max(0, L.cols * T - VW); cam.x += 26 * attractT * L.dir; attractT = 0; t += 1 / 30;
      if (cam.x >= max) { cam.x = max; L.dir = -1; } else if (cam.x <= 0 && L.dir < 0) { attractWorld = (attractWorld + 1) % WORLDS.length; previewLevel(attractWorld * PER); }
      draw(); if (mode === 'boot') drawBootArt(); dirty = false;
    }
  } else if (dirty) { draw(); dirty = false; }
  requestAnimationFrame(frame);
}

function drawBootArt() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, 'rgba(28,32,56,0.15)'); g.addColorStop(1, 'rgba(28,32,56,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  const bob = Math.sin(t * 3) * 4;
  ctx.save(); ctx.translate(VW / 2, VH * 0.74 + bob); ctx.scale(2.2, 2.2); drawPufi(0, 0, 1, { baby: true, blink: Math.floor(t * 2) % 7 === 0 }); ctx.restore();
}
resize(); updateSoundButton(); syncTouchLayout(); bootScreen(); requestAnimationFrame(frame);

// Testschnittstelle (verändert das Spiel nicht).
window.PufiTest = {
  state: () => ({ mode, L, P, cam, save, session, VW, SCALE }),
  start: n => begin(n), startLevel, tick, draw, action, press, hurt, die, throwEgg, layEgg, showClear, levelScore, hitBoss, activePlatforms, openOptions, openMap, title, resume, togglePause, build,
  startBonus, bonusPress, tickBonus, flipCard, stopReel, openBonusMenu, openCloud, pressStart, bonus: () => BG
};
})();
