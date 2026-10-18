'use strict';
/* AnMaCha Casino – Spielautomat in 3D: Walzen sind echte Zylinder, deren Bildstreifen vor jedem Dreh neu bemalt wird. */
(function (G) {
  const THREE = G.THREE, Gfx = G.CasinoGfx, S = G.CasinoSymbols, L = G.CasinoLogic, C = G.CasinoCore;
  const { el, fmt, wallet, sound, wait } = C;
  const CELL = 128, K = 16, DA = Math.PI * 2 / K, RAD = K / (Math.PI * 2), REEL_W = 1, GAP = 0.07;
  const BETS = [10, 20, 40, 50, 100, 200, 400, 500, 1000, 2000, 4000, 5000, 10000];
  const C1 = 1.15;                                         // Rückfedern beim Stoppen
  const easeBack = v => 1 + (C1 + 1) * Math.pow(v - 1, 3) + C1 * Math.pow(v - 1, 2);

  // ---------- eine Walze ----------
  class Reel {
    constructor(slot, r, parent) {
      this.slot = slot; this.r = r; this.rows = slot.m.rows;
      this.cv = Gfx.canvas(CELL, CELL * K); this.g = this.cv.getContext('2d');
      this.tex = Gfx.canvasTex(this.cv);
      this.base = 0; this.phi = this.target(0); this.anim = null; this.cells = new Array(K).fill(null);
      const geo = new THREE.BufferGeometry(), seg = K * 4, pos = [], uv = [], idx = [];
      for (let i = 0; i <= seg; i++) {
        const th = i / seg * Math.PI * 2, y = RAD * Math.sin(th), z = RAD * Math.cos(th);
        pos.push(-REEL_W / 2, y, z, REEL_W / 2, y, z); uv.push(0, i / seg, 1, i / seg);
        if (i < seg) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, d, a, d, c); }
      }
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
      this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.tex }));
      this.mesh.position.set(slot.reelX(r), 0, -RAD); this.mesh.rotation.x = this.phi;
      (parent || slot.group).add(this.mesh);
    }
    target(base) { return (base + (this.rows - 1) / 2 + 0.5) * DA; }
    cellOfRow(y, base) { return ((base == null ? this.base : base) + this.rows - 1 - y) % K; }
    paint(c, key) { this.cells[c] = key; this.g.drawImage(this.slot.tileFor(key), 0, (K - 1 - c) * CELL); }
    // Streifen für den nächsten Dreh vorbereiten: sichtbare Felder bleiben, Ziel liegt gegenüber
    prepare(keys, filler) {
      const vis = new Set(); for (let y = 0; y < this.rows; y++) vis.add(this.cellOfRow(y));
      const nb = (this.base + K / 2) % K; const tgt = new Map(); keys.forEach((k, y) => tgt.set(this.cellOfRow(y, nb), k));
      for (let c = 0; c < K; c++) { if (vis.has(c)) continue; this.paint(c, tgt.has(c) ? tgt.get(c) : filler()); }
      this.tex.needsUpdate = true; this.next = nb;
    }
    // sichtbare Felder direkt ersetzen (z. B. Ausdehnen)
    setVisible(keys) { keys.forEach((k, y) => { if (k != null) this.paint(this.cellOfRow(y), k); }); this.tex.needsUpdate = true; }
    start(T, omega) {
      const td = Math.min(0.32, T * 0.4), a = 0.12;
      const lin = Math.max(0.05, T - td - a / 2);
      let D = omega * (lin + td / (C1 + 3));
      const want = this.target(this.next); D += ((want - (this.phi + D)) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const w = D / (lin + td / (C1 + 3));
      this.anim = { u: 0, T, td, a, w, phi0: this.phi, D, scale: 1, lin };
    }
    update(dt) {
      const A = this.anim; if (!A) return false;
      A.u += dt * A.scale; const u = A.u, run = A.T - A.td;
      let p;
      if (u < A.a) p = A.w * u * u / (2 * A.a);
      else if (u < run) p = A.w * (u - A.a / 2);
      else { const v = Math.min(1, (u - run) / A.td); p = A.w * A.lin + A.w * A.td / (C1 + 3) * easeBack(v); }
      this.phi = A.phi0 + p; this.mesh.rotation.x = this.phi;
      if (u >= A.T) { this.phi = A.phi0 + A.D; this.mesh.rotation.x = this.phi; this.base = this.next; this.anim = null; this.slot.onStop(this.r); }
      return true;
    }
  }

  // ---------- Automat ----------
  class SlotScreen {
    constructor(cfg, app) {
      this.cfg = cfg; this.app = app; this.m = L.compile(cfg); this.theme = cfg.theme;
      this.bets = BETS.filter(b => b >= (cfg.minBet || 10));
      const saved = C.data.bets[cfg.id];
      this.betI = this.bets.indexOf(saved) >= 0 ? this.bets.indexOf(saved) : Math.min(2, this.bets.length - 1);
      this.tiles = new Map(); this.texCache = new Map(); this.busy = false; this.auto = false; this.dead = false;
      this.winCycle = null; this.stopWaiters = []; this.t = 0;
    }
    get bet() { return this.bets[this.betI]; }
    reelX(r) { return (r - (this.m.reels - 1) / 2) * (REEL_W + GAP); }

    tileFor(key) {
      let c = this.tiles.get(key); if (c) return c;
      const [art, val, hot] = key.split('|');
      c = Gfx.canvas(CELL, CELL); S.paintTile(c.getContext('2d'), 0, 0, CELL, art, this.theme, { val, hot: hot === '1' });
      this.tiles.set(key, c); return c;
    }
    key(sym, val, hot) {
      if (sym === -2) return 'mystery';
      if (sym == null || sym < 0) return 'blank';
      const s = this.m.symbols[sym], art = s.art || s.id;
      if (sym === this.m.coin) return (art === 'nugget' ? 'nugget|' : 'coin|') + (val ? coinLabel(this.m, val, this.bet) : '') + (hot ? '|1' : '');
      return art + (hot ? '||1' : '');
    }
    randKey() { const g = L.randomGrid(this.m); const s = g[0][0]; return this.key(s, s === this.m.coin ? this.randCoin() : null); }
    randCoin() { const v = this.m.holdwin.values; return v[Math.floor(Math.random() * 4)]; }

    async enter(hud) {
      const m = this.m;
      // Logos/Bilder vorladen (nur für diesen Automaten)
      const logos = m.symbols.map(s => s.art || '').filter(a => a.startsWith('logo:')).map(a => a.slice(5));
      if (logos.length) await S.whenLogos(logos);
      if (this.dead) return;
      this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
      this.bg = Gfx.backdrop(this.scene, this.theme);
      Gfx.lights(this.scene, this.theme);
      this.group = new THREE.Group(); this.scene.add(this.group);
      this.buildCabinet();
      this.reels = []; for (let r = 0; r < m.reels; r++) this.reels.push(new Reel(this, r));
      const g0 = L.randomGrid(m);
      this.reels.forEach((R, r) => { for (let c = 0; c < K; c++) R.paint(c, this.randKey()); R.setVisible(g0[r].map(s => this.key(s, s === m.coin ? this.randCoin() : null))); });
      this.shower = Gfx.coinShower(this.scene);
      this.buildHud(hud);
      this.update(0, 0);
      Gfx.set(this);
      C.input.setScreen(this.ctrl());
    }

    buildCabinet() {
      const m = this.m, th = this.theme, grp = this.group;
      const rw = m.reels * REEL_W + (m.reels - 1) * GAP;
      const wh = 2 * RAD * Math.sin(m.rows * DA / 2);
      this.winH = wh; this.reelsW = rw;
      const fw = 0.22, mh = 1.05, bh = 0.55;
      this.cab = { w: rw + 2 * fw + 0.5, h: wh + 2 * fw + mh + bh, cy: (mh - bh) / 2, fw, mh, bh };
      const metal = new THREE.MeshStandardMaterial({ color: new THREE.Color(th.a), metalness: 0.85, roughness: 0.28, emissive: new THREE.Color(th.a).multiplyScalar(0.12) });
      const dark = new THREE.MeshStandardMaterial({ color: 0x0a0814, metalness: 0.3, roughness: 0.6 });
      this.mats = { metal, dark };
      const box = (w, h, d, x, y, z, mat) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); b.position.set(x, y, z); grp.add(b); return b; };
      // Rückwand hinter den Walzen
      const back = new THREE.Mesh(new THREE.PlaneGeometry(rw + 0.6, wh + 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(th.tile[1]) })); back.position.z = -RAD * 1.6; grp.add(back);
      // Rahmen
      box(rw + 2 * fw, fw, 0.36, 0, wh / 2 + fw / 2, 0.08, metal); box(rw + 2 * fw, fw, 0.36, 0, -wh / 2 - fw / 2, 0.08, metal);
      box(fw, wh + 2 * fw, 0.36, -rw / 2 - fw / 2, 0, 0.08, metal); box(fw, wh + 2 * fw, 0.36, rw / 2 + fw / 2, 0, 0.08, metal);
      for (let r = 1; r < m.reels; r++) box(GAP * 0.7, wh, 0.12, this.reelX(r) - (REEL_W + GAP) / 2, 0, 0.02, dark);
      // Seitenleisten mit Lauflicht
      this.leds = [-1, 1].map(s => box(0.12, wh + mh + bh, 0.14, s * (rw / 2 + fw + 0.13), (mh - bh) / 2, 0.06, new THREE.MeshBasicMaterial({ color: new THREE.Color(th.b) })));
      // Kopfschild
      const mc = Gfx.canvas(1024, 256); this.marqueeCanvas = mc; this.drawMarquee('');
      this.marqueeTex = Gfx.canvasTex(mc);
      const mq = new THREE.Mesh(new THREE.PlaneGeometry(rw + 2 * fw, mh), new THREE.MeshBasicMaterial({ map: this.marqueeTex }));
      mq.position.set(0, wh / 2 + fw + mh / 2, 0.16); grp.add(mq);
      box(rw + 2 * fw + 0.1, mh + 0.1, 0.1, 0, wh / 2 + fw + mh / 2, 0.08, dark);
      // Glühbirnen rund um das Kopfschild
      const bulbs = [], bw = rw + 2 * fw, by0 = wh / 2 + fw;
      for (let i = 0; i <= 14; i++) { bulbs.push([-bw / 2 + bw * i / 14, by0 + mh]); }
      for (let i = 1; i < 4; i++) { bulbs.push([-bw / 2, by0 + mh * i / 4]); bulbs.push([bw / 2, by0 + mh * i / 4]); }
      const bm = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), bulbs.length);
      const mx = new THREE.Matrix4(); bulbs.forEach((p, i) => { mx.makeTranslation(p[0], p[1], 0.2); bm.setMatrixAt(i, mx); bm.setColorAt(i, new THREE.Color(th.a)); });
      grp.add(bm); this.bulbs = bm; this.bulbN = bulbs.length;
      // Unterteil
      const bc = Gfx.canvas(1024, 128), bg = bc.getContext('2d');
      bg.fillStyle = S.lg(bg, 0, 0, 0, 128, '#1b1430', '#07050f'); bg.fillRect(0, 0, 1024, 128);
      S.text(bg, 'ANMACHA CASINO', 512, 68, 54, S.gold(bg, 30, 100), '#1a0d00', 6);
      bg.fillStyle = th.b; bg.fillRect(0, 0, 1024, 6);
      const bottom = new THREE.Mesh(new THREE.PlaneGeometry(rw + 2 * fw, bh), new THREE.MeshBasicMaterial({ map: Gfx.canvasTex(bc) }));
      bottom.position.set(0, -wh / 2 - fw - bh / 2, 0.16); grp.add(bottom);
      // Schatten oben/unten und Glasspiegelung über den Walzen
      const sc = Gfx.canvas(4, 256), sg = sc.getContext('2d'); const q = sg.createLinearGradient(0, 0, 0, 256);
      q.addColorStop(0, 'rgba(0,0,0,.85)'); q.addColorStop(0.18, 'rgba(0,0,0,.15)'); q.addColorStop(0.5, 'rgba(0,0,0,0)'); q.addColorStop(0.82, 'rgba(0,0,0,.15)'); q.addColorStop(1, 'rgba(0,0,0,.85)'); sg.fillStyle = q; sg.fillRect(0, 0, 4, 256);
      const shadeM = new THREE.Mesh(new THREE.PlaneGeometry(rw, wh), new THREE.MeshBasicMaterial({ map: Gfx.canvasTex(sc, { noMip: true }), transparent: true, depthWrite: false }));
      shadeM.position.z = 0.03; grp.add(shadeM);
      const gc = Gfx.canvas(256, 256), gg = gc.getContext('2d'); const q2 = gg.createLinearGradient(0, 0, 256, 256);
      q2.addColorStop(0, 'rgba(255,255,255,0)'); q2.addColorStop(0.42, 'rgba(255,255,255,0)'); q2.addColorStop(0.5, 'rgba(255,255,255,.10)'); q2.addColorStop(0.6, 'rgba(255,255,255,0)'); gg.fillStyle = q2; gg.fillRect(0, 0, 256, 256);
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(rw, wh), new THREE.MeshBasicMaterial({ map: Gfx.canvasTex(gc, { noMip: true }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glass.position.z = 0.04; grp.add(glass);
      // Gewinnrahmen und Hold-&-Win-Münzen (Pool)
      this.frames = []; this.locks = [];
      for (let r = 0; r < m.reels; r++) for (let y = 0; y < m.rows; y++) {
        const f = new THREE.Mesh(new THREE.PlaneGeometry(REEL_W * 1.02, 1.02), new THREE.MeshBasicMaterial({ map: Gfx.frameTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        const lk = new THREE.Mesh(new THREE.PlaneGeometry(REEL_W * 0.98, 0.98), new THREE.MeshBasicMaterial({ transparent: true }));
        const p = this.cellPos(r, y); [f, lk].forEach((o, i) => { o.position.set(p.x, p.y, p.z + 0.02 + i * 0.005); o.rotation.x = p.rx; o.visible = false; grp.add(o); });
        this.frames.push(f); this.locks.push(lk);
      }
    }
    cellPos(r, y) { const th = ((this.m.rows - 1) / 2 - y) * DA; return { x: this.reelX(r), y: RAD * Math.sin(th), z: RAD * Math.cos(th) - RAD, rx: -th }; }
    frame(r, y) { return this.frames[r * this.m.rows + y]; }
    lock(r, y) { return this.locks[r * this.m.rows + y]; }
    lockTex(key) { let t = this.texCache.get(key); if (!t) { t = Gfx.canvasTex(this.tileFor(key)); this.texCache.set(key, t); } return t; }

    drawMarquee(sub) {
      this.mqSub = sub; if (!sub && this.app.mystery) sub = 'MYSTERY JACKPOT ' + fmt(this.app.mystery());
      const c = this.marqueeCanvas, g = c.getContext('2d'), th = this.theme;
      g.fillStyle = S.lg(g, 0, 0, 0, 256, th.tile[0], '#05030b'); g.fillRect(0, 0, 1024, 256);
      g.globalAlpha = 0.35; g.fillStyle = S.rg(g, 512, 128, 20, 520, th.b, 'rgba(0,0,0,0)'); g.fillRect(0, 0, 1024, 256); g.globalAlpha = 1;
      const t = this.cfg.title.toUpperCase(); g.font = 'italic 900 110px ' + S.FONT; const size = Math.min(110, Math.floor(110 * 940 / g.measureText(t).width));
      g.shadowColor = th.a; g.shadowBlur = 24; S.text(g, t, 512, sub ? 104 : 128, size, S.gold(g, 60, 190), '#1a0800', 9, true); g.shadowBlur = 0;
      if (sub) S.text(g, sub, 512, 206, 46, '#fff', th.b, 8);
      if (this.marqueeTex) this.marqueeTex.needsUpdate = true;
    }

    // ---------- HTML-Bedienung ----------
    buildHud(hud) {
      const m = this.m, cfg = this.cfg;
      hud.innerHTML = '';
      const jp = m.holdwin ? el('div', 'jackbar') : null;
      if (jp) { hud.appendChild(jp); this.jackbar = jp; }
      this.banner = el('div', 'banner'); this.banner.hidden = true; hud.appendChild(this.banner);
      const bar = el('div', 'slotbar glass');
      bar.innerHTML = `
        <div class="r1"><button class="ib" data-nav data-act="info" aria-label="Gewinntabelle">ℹ️</button>
        <div class="betbox"><button class="ib sm" data-nav data-act="down" aria-label="Einsatz verringern">−</button>
          <div class="val"><small>EINSATZ</small><b class="bet"></b></div>
          <button class="ib sm" data-nav data-act="up" aria-label="Einsatz erhöhen">+</button></div></div>
        <div class="winbox"><small>GEWINN</small><b class="win">0</b></div>
        <div class="r2"><button class="pill" data-nav data-act="max">MAX</button>
        <button class="pill risk" data-nav data-act="risk" hidden>RISIKO</button>
        <button class="pill nudge" data-nav data-act="nudge" hidden>NACHDREH</button>
        <button class="pill" data-nav data-act="auto">AUTO</button>
        <button class="ib" data-nav data-act="turbo" aria-label="Turbo">⚡</button></div>
        <button class="spin" data-nav data-default data-act="spin" aria-label="Drehen"><span>SPIN</span></button>`;
      hud.appendChild(bar); this.bar = bar;
      this.q = s => bar.querySelector(s);
      bar.addEventListener('click', e => {
        const b = e.target.closest('[data-act]'); if (!b || b.disabled) return; sound.play('click');
        ({ info: () => this.info(), down: () => this.changeBet(-1), up: () => this.changeBet(1), max: () => this.maxBet(), auto: () => this.toggleAuto(),
          turbo: () => this.toggleTurbo(), spin: () => this.spin(), risk: () => this.gamble(), nudge: () => this.nudge() })[b.dataset.act]();
      });
      // Spin gedrückt halten = Autoplay
      const sp = this.q('.spin'); let hold = 0;
      sp.addEventListener('pointerdown', () => { hold = setTimeout(() => { hold = -1; if (!this.auto) this.toggleAuto(); }, 650); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => sp.addEventListener(ev, () => { if (hold > 0) clearTimeout(hold); }));
      sp.addEventListener('click', e => { if (hold === -1) { hold = 0; e.stopImmediatePropagation(); } }, true);
      this.fx = document.getElementById('fx'); this.fxg = this.fx.getContext('2d');
      this.refreshHud(); this.setWin(0);
    }
    refreshHud() {
      const q = this.q; if (!q) return;
      q('.bet').textContent = fmt(this.bet);
      const lock = this.busy || this.free;
      q('[data-act=down]').disabled = lock || this.betI === 0; q('[data-act=up]').disabled = lock || this.betI === this.bets.length - 1; q('[data-act=max]').disabled = lock;
      q('[data-act=auto]').classList.toggle('on', this.auto); q('[data-act=turbo]').classList.toggle('on', !!C.data.turbo);
      q('.spin').classList.toggle('busy', this.busy); q('.spin span').textContent = this.busy ? (this.auto ? 'STOP' : '■') : 'SPIN';
      if (this.jackbar) {
        const J = this.m.holdwin.jackpots; this.jackbar.innerHTML = Object.keys(J).sort((a, b) => J[b] - J[a]).map(k => `<div class="jp ${k.toLowerCase()}"><small>${k}</small><b>${C.short(J[k] * this.bet)}</b></div>`).join('');
      }
    }
    setWin(v) { if (this.q) this.q('.win').textContent = fmt(v); }
    changeBet(d) { if (this.busy || this.free) return; const n = Math.max(0, Math.min(this.bets.length - 1, this.betI + d)); if (n === this.betI) return; this.betI = n; C.data.bets[this.cfg.id] = this.bet; C.save(); this.refreshHud(); this.clearWinShow(); }
    maxBet() { if (this.busy || this.free) return; let i = this.bets.length - 1; while (i > 0 && this.bets[i] > wallet.bal) i--; this.betI = i; C.data.bets[this.cfg.id] = this.bet; C.save(); this.refreshHud(); }
    toggleAuto() { this.auto = !this.auto; this.refreshHud(); if (this.auto && !this.busy) this.spin(); }
    toggleTurbo() { C.data.turbo = !C.data.turbo; C.save(); this.refreshHud(); C.toast(C.data.turbo ? '⚡ Turbo an' : 'Turbo aus', 1200); }
    get speed() { return C.data.turbo ? 0.45 : 1; }

    ctrl() {
      return { root: this.bar ? this.bar.parentNode : document.body, primary: () => this.spin(), secondary: () => this.toggleAuto(), betDown: () => this.changeBet(-1), betUp: () => this.changeBet(1),
        info: () => this.info(), back: () => this.app.home() };
    }

    // ---------- Spielablauf ----------
    async spin() {
      if (this.dead || C.modalOpen) return;
      if (this.busy) { this.quick(); if (this.auto) { this.auto = false; this.refreshHud(); } return; }
      this.q('[data-act=risk]').hidden = true; this.lastWin = 0; this.hideNudge();
      const bet = this.bet;
      if (!wallet.take(bet)) { this.auto = false; this.refreshHud(); this.app.noMoney(bet); return; }
      this.clearWinShow(); this.busy = true; this.quickStop = false; this.refreshHud(); this.setWin(0);
      const round = L.playRound(this.m, bet);
      wallet.give(round.total, true);
      const mjp = this.app.mysteryFeed ? this.app.mysteryFeed(bet) : 0;      // Mystery-Jackpot: wächst mit jedem Einsatz, fällt zufällig
      if (mjp) wallet.give(mjp, true);
      this.winSum = 0;
      try {
        await this.runSteps(round.steps);
      } finally {
        if (!this.dead) {
          wallet.reveal(); this.busy = false; this.free = false; this.refreshHud();
        }
      }
      if (this.dead) return;
      this.setWin(round.total);
      const x = round.total / bet;
      if (x >= 15) await this.celebrate(round.total, x);
      if (mjp) await this.mysteryWin(mjp);
      else if (!this.mqSub) this.drawMarquee('');
      if (this.dead) return;
      this.lastWin = round.total;
      if (round.total > 0 && !this.auto && round.steps.length === 1 && round.total <= bet * 50) this.q('[data-act=risk]').hidden = false;
      const b0 = round.steps[0];
      this.offer = !round.total && !mjp && !this.auto && round.steps.length === 1 && !b0.lucky ? L.nudgeOffer(this.m, bet, b0.grid) : null;
      if (this.offer) { this.offer.grid = b0.grid; this.offer.bet = bet; this.showNudge(); }
      this.startWinCycle(round.steps.filter(s => s.type === 'spin' || s.type === 'respin').pop());
      if (this.auto) { setTimeout(() => { if (this.auto && !this.busy && !this.dead) this.spin(); }, C.data.turbo ? 250 : 650); }
    }
    async runSteps(steps) {
      for (const st of steps) {
        if (this.dead) return;
        if (st.type === 'spin' || st.type === 'respin') {
          if (st.mode === 'free') { this.setBanner(`${this.freeName} <b>${st.freeNo}</b> / ${st.freeNo + st.freeLeft}` + (st.mult > 1 ? ` · ×${st.mult}` : '') + (this.upLevel ? ' · ⬆ ' + this.upLabel : '')); this.drawMarquee(`${this.freeName} ${st.freeNo} / ${st.freeNo + st.freeLeft}`); }
          if (st.type === 'respin') this.setBanner('RESPIN – Wild bleibt stehen');
          if (st.lucky) { await this.animSpin(st, { keys: st.lucky.pre.map((col, r) => col.map((v, y) => this.key(v, st.vals && st.vals[r][y]))) }); await this.playLucky(st); }
          else await this.animSpin(st);
          await this.showWins(st);
          if (st.lucky) this.endLucky(st);
          if (st.type === 'respin') this.banner.hidden = true;
          if (st.mode === 'free') await this.freeExtras(st);
        }
        else if (st.type === 'pick' || st.type === 'wheel') await this.playBonus(st);
        else if (st.type === 'holdwin') await this.playHoldWin(st);
        else if (st.type === 'freeStart') await this.freeStart(st);
        else if (st.type === 'freeEnd') await this.freeEnd(st);
      }
    }
    allReels() { return this.wins && this.wins.length ? this.reels.concat(...this.wins.map(w => w.reels)) : this.reels; }
    quick() { this.quickStop = true; this.reels && this.allReels().forEach(R => { if (R.anim) R.anim.scale = 3.5; }); }
    onStop(r) {
      sound.play('stop');
      if (this.teasing && this.teasing.delete(r)) for (let y = 0; y < this.m.rows; y++) this.frame(r, y).visible = false;
      const st = this.cur, m = this.m;
      if (st && st.grid && st.grid[r] && (m.scat >= 0 || m.bon >= 0 || m.coin >= 0)) {   // Scatter, Bonus und Nuggets leuchten beim Landen kurz auf
        let n = 0; st.grid[r].forEach((v, y) => { if (v === m.scat || v === m.bon || v === m.coin) { n++; const f = this.frame(r, y); f.visible = true; f.userData.t = this.t; f.userData.until = this.t + 0.9; } });
        if (n) sound.play('coin');
      }
      if (this.allReels().every(R => !R.anim)) { sound.whirr(false); const w = this.stopWaiters; this.stopWaiters = []; w.forEach(f => f()); }
    }
    allStopped() { return new Promise(res => { if (this.allReels().every(R => !R.anim)) res(); else this.stopWaiters.push(res); }); }

    async animSpin(st, opt) {
      opt = opt || {}; this.cur = st;
      const m = this.m, held = st.held || [];
      const sp = this.speed, omega = 26;
      let scatSeen = 0, extra = 0; this.teasing = new Set();
      sound.play('spin'); sound.whirr(true);
      for (let r = 0; r < m.reels; r++) {
        if (held.includes(r)) continue;
        const R = this.reels[r];
        let col = st.grid[r].map((s, y) => this.key(s, st.vals && st.vals[r][y]));
        if (st.expandReels && st.expandReels.includes(r)) {            // erst ein einzelnes Wild zeigen, dann ausdehnen
          const yy = Math.floor(Math.random() * m.rows); col = col.map((k, y) => (y === yy ? k : this.randKeyNoWild()));
        }
        if (opt.keys) col = opt.keys[r];
        R.prepare(col, opt.filler || (() => this.randKey()));
        let T = (0.55 + r * 0.17) * sp + extra;
        if (!opt.noTease && m.scat >= 0 && scatSeen >= 2 && r < m.reels) {     // Spannung: Walze dreht länger und leuchtet
          extra += 0.7 * sp; T += 0.7 * sp; this.teasing.add(r); for (let y = 0; y < m.rows; y++) this.flash(r, y); sound.play('tease');
        }
        scatSeen += st.grid[r].filter(v => v === m.scat).length;
        if (this.quickStop) T = 0.25 + r * 0.05;
        R.start(T, omega);
      }
      if (this.reels.some(R => R.anim)) await this.allStopped(); else sound.whirr(false);
    }
    randKeyNoWild() { let k; do { k = this.randKey(); } while (k.startsWith(this.key(this.m.wild).split('|')[0]) && this.m.wild >= 0); return k; }

    async showWins(st) {
      const m = this.m;
      if (st.expandReels) {                                         // Respin-Wild füllt die Walze
        for (const r of st.expandReels) { this.reels[r].setVisible(new Array(m.rows).fill(this.key(m.wild, null, true))); for (let y = 0; y < m.rows; y++) this.flash(r, y); }
        sound.play('feature'); await wait(650 * this.speed);
      }
      if (st.expand) {                                              // Buch: Sondersymbol dehnt sich aus
        const k = this.key(st.expand.sym, null, true);
        for (const r of st.expand.reels) { this.reels[r].setVisible(new Array(m.rows).fill(k)); for (let y = 0; y < m.rows; y++) this.flash(r, y); sound.play('lock'); await wait(260 * this.speed); }
      }
      const all = st.wins.slice(); const cells = [];
      all.forEach(w => w.cells.forEach(c => cells.push(c)));
      if (st.scat && st.scat.amt) st.scat.cells.forEach(c => cells.push(c));
      if (st.expand) st.expand.reels.forEach(r => { for (let y = 0; y < m.rows; y++) cells.push([r, y]); });
      if (st.lucky && st.lucky.drops) st.lucky.drops.forEach(d => cells.push([d[0], d[1]]));
      if (!st.win) { if (st.mode === 'free') await wait(250 * this.speed); return; }
      cells.forEach(c => this.flash(c[0], c[1]));
      this.drawLines(all);
      sound.play(st.win >= this.bet * 5 ? 'big' : 'win');
      const from = this.winSum; this.winSum += st.win;
      await this.countUp(from, this.winSum, Math.min(1600, 350 + st.win / this.bet * 60) * this.speed);
      wallet.reveal(st.win);
      await wait((st.mode === 'free' ? 450 : 300) * this.speed);
      this.clearFlash(); this.clearLines();
    }
    async countUp(a, b, ms) {
      const t0 = performance.now(); let lastTick = 0; this.party = true;
      while (true) {
        const k = Math.min(1, (performance.now() - t0) / ms); this.setWin(a + (b - a) * k);
        if (performance.now() - lastTick > 70) { sound.play('count'); lastTick = performance.now(); }
        if (k >= 1 || this.dead) break; await wait(30);
      }
      this.party = false;
    }
    flash(r, y) { const f = this.frame(r, y); f.visible = true; f.userData.t = this.t; f.userData.until = 0; Gfx.kick(); }
    clearFlash() { this.frames.forEach(f => { f.visible = false; }); }
    drawLines(wins) {
      const c = this.fx, g = this.fxg, dpr = Math.min(2, devicePixelRatio || 1);
      if (c.width !== Math.round(innerWidth * dpr)) { c.width = Math.round(innerWidth * dpr); c.height = Math.round(innerHeight * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight);
      if (!this.m.lines) return;
      const cols = [this.theme.a, this.theme.b, this.theme.c, '#ffffff'];
      wins.forEach((w, i) => {
        if (w.line < 0) return; const ln = this.m.lines[w.line];
        g.beginPath();
        ln.forEach((y, r) => { const p = this.cellPos(r, y), s = Gfx.project(this.camera, p.x, p.y, p.z + 0.1); if (r === 0) { const s0 = Gfx.project(this.camera, p.x - 0.62, p.y, p.z + 0.1); g.moveTo(s0.x, s0.y); } g.lineTo(s.x, s.y); if (r === ln.length - 1) { const s1 = Gfx.project(this.camera, p.x + 0.62, p.y, p.z + 0.1); g.lineTo(s1.x, s1.y); } });
        g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 9; g.stroke(); g.strokeStyle = cols[i % cols.length]; g.lineWidth = 4.5; g.stroke();
      });
      c.hidden = false;
    }
    clearLines() { if (this.fxg) this.fxg.clearRect(0, 0, this.fx.width, this.fx.height); }
    clearWinShow() { if (this.winCycle) { clearInterval(this.winCycle); this.winCycle = null; } this.clearFlash(); this.clearLines(); }
    startWinCycle(st) {
      if (!st || !st.wins.length || this.auto) return;
      let i = 0; const list = st.wins;
      const show = () => { if (this.busy || this.dead) return this.clearWinShow(); this.clearFlash(); const w = list[i % list.length]; w.cells.forEach(c => this.flash(c[0], c[1])); this.drawLines([w]); i++; };
      if (list.length > 1) { show(); this.winCycle = setInterval(show, 1300); }
    }

    // ---------- Glücks-Features (zufällig im Grundspiel) ----------
    async playLucky(st) {
      const L0 = st.lucky, m = this.m, sp = this.speed, hot = s => this.key(s, null, true);
      const T = { wildReel: ['WILD-WALZE', 'Ganze Walzen werden zum Wild!'], mystery: ['MYSTERY', 'Alle ?-Felder zeigen dasselbe Symbol!'], wildRain: ['WILD-REGEN', 'Wilds regnen auf die Walzen!'],
        mult: ['MULTIPLIKATOR ×' + L0.x, `Dieser Dreh zählt ×${L0.x}!`], cash: ['GELDREGEN', 'Goldmünzen regnen auf die Walzen!'],
        hammer: ['GOLDHAMMER', 'Der Hammer schlägt Wilds auf die Walzen!'] }[L0.type];
      const cell = (r, y, key) => { const k = new Array(m.rows).fill(null); k[y] = key; this.reels[r].setVisible(k); this.flash(r, y); };
      this.party = true; this.drawMarquee(T[0]);
      await this.app.featureIntro(T[0], `<p>${T[1]}</p>`, this.theme, { ms: 1800 });
      if (this.dead) return;
      if (L0.type === 'wildReel') for (const r of L0.reels) { for (let y = 0; y < m.rows; y++) cell(r, y, hot(m.wild)); sound.play('feature'); await wait(450 * sp); }
      if (L0.type === 'wildRain') for (const [r, y] of L0.cells) { cell(r, y, hot(m.wild)); sound.play('lock'); await wait(300 * sp); }
      if (L0.type === 'mystery') {
        L0.cells.forEach(([r, y]) => this.flash(r, y)); sound.play('tease'); await wait(600 * sp);
        for (const [r, y] of L0.cells) { cell(r, y, hot(L0.sym)); sound.play('lock'); await wait(170 * sp); }
      }
      if (L0.type === 'cash') for (const [r, y, v] of L0.drops) { this.setLockKey(r, y, 'coin|' + C.short(v, true) + '|1', true); sound.play('coin'); await wait(260 * sp); }
      if (L0.type === 'hammer') for (const [r, y, v] of L0.hits) { await this.hammerHit(r, y); cell(r, y, this.key(v, st.vals && st.vals[r][y], true)); await wait(220 * sp); }
      if (L0.type === 'mult') { sound.play('big'); this.setBanner(`MULTIPLIKATOR <b>×${L0.x}</b>`); }
      await wait(350 * sp); this.clearFlash(); this.party = false;
    }
    // Hammer schwingt über dem Feld, Schlag mit Bildschirmwackeln
    async hammerHit(r, y) {
      const p = this.cellPos(r, y), q = Gfx.project(this.camera, p.x, p.y, p.z + 0.1), h = el('div', 'hammer', '🔨');
      h.style.left = q.x + 'px'; h.style.top = q.y + 'px'; document.body.appendChild(h);
      await wait(260 * this.speed); sound.play('hammer'); this.flash(r, y);
      const gl = document.getElementById('gl'); gl.classList.remove('shake'); void gl.offsetWidth; gl.classList.add('shake');
      setTimeout(() => { h.remove(); gl.classList.remove('shake'); }, 300);
    }
    endLucky(st) {
      if (st.lucky.drops) st.lucky.drops.forEach(([r, y]) => { this.lock(r, y).visible = false; });
      if (st.lucky.type === 'mult') this.banner.hidden = true;
      this.drawMarquee('');
    }

    // ---------- Freispiele ----------
    async freeStart(st) {
      this.free = true; this.refreshHud(); sound.play('feature'); this.upLevel = 0; this.upLabel = ''; this.freeName = st.title ? 'SONDERSPIEL' : 'FREISPIEL';
      const sp = st.special != null ? this.m.symbols[st.special] : null;
      const FF = { upgrade: 'Jeder Freispiel mit Wild wertet die niedrigsten Symbole auf und bringt +1 Freispiel', sticky: 'Wilds bleiben bis zum Ende kleben', multUp: 'Der Multiplikator steigt nach jedem Gewinn – bis ×' + (this.m.ff && this.m.ff.max),
        walk: 'Walking Wilds: Jedes Wild bleibt stehen und wandert jeden Freispiel eine Walze nach links' };
      const title = st.title || 'FREISPIELE', xm = Math.max(st.mult || 0, this.m.freeMult || 1);
      this.drawMarquee(title);
      const cells = []; if (this.cur && this.cur.grid) this.cur.grid.forEach((col, r) => col.forEach((v, y) => { if (v === this.m.scat) cells.push([r, y]); }));
      cells.forEach(c => this.flash(c[0], c[1])); if (cells.length) await wait(900 * this.speed); this.clearFlash();
      this.tint(true);
      await this.app.featureIntro(title, (xm > 1 ? `<p>Alle Gewinne ×${xm}</p>` : '') + (st.ff ? `<p>${FF[st.ff]}</p>` : '') +
        (sp ? `<p>Sondersymbol:</p><canvas class="splashsym" data-art="${sp.art || sp.id}"></canvas>` : ''), this.theme, { count: st.count, ms: sp ? 3800 : 3200 });
      this.freeTotal = st.count;
    }
    symName(i) { const s = this.m.symbols[i]; return ({ T: '10', J: 'B', Q: 'D' })[s.id] || (s.id.length < 3 ? s.id : (s.name || s.id)); }
    // nach jedem Freispiel: Retrigger, Upgrade, klebende Wilds, steigender Multiplikator
    async freeExtras(st) {
      const m = this.m;
      if (st.free) { sound.play('fanfare'); this.party = true; C.toast(`+${m.scatter.retrigger || st.free} Freispiele!`); await wait(900 * this.speed); this.party = false; }
      if (st.newSticky && st.newSticky.length) {
        for (const [r, y] of st.newSticky) { this.setLockKey(r, y, this.key(m.wild, null, true), true); sound.play('lock'); await wait(140 * this.speed); }
      }
      if (st.walkNext) {                                           // Walking Wilds: eine Walze nach links
        (st.stuck || []).forEach(([r, y]) => { this.lock(r, y).visible = false; });
        if (st.walkNext.length) { const k = this.key(m.wild, null, true); st.walkNext.forEach(([r, y]) => this.setLockKey(r, y, k, true)); sound.play('lock'); await wait(380 * this.speed); }
      }
      if (st.upgrade) {
        this.upLevel = st.upgrade.level; this.upLabel = this.symName(st.upgrade.to);
        sound.play('feature'); C.toast(`⬆ ${st.upgrade.from.map(i => this.symName(i)).join(', ')} → ${this.upLabel}` + (st.extra ? ` · +${st.extra} Freispiel` : ''), 1600);
        this.setBanner(`FREISPIEL <b>${st.freeNo}</b> / ${st.freeNo + st.freeLeft} · ⬆ ${this.upLabel}`);
        await wait(500 * this.speed);
      }
      if (st.nextMult) { sound.play('lock'); C.toast(`Multiplikator ×${st.nextMult}`, 1200); }
    }
    setLockKey(r, y, key, fresh) { const lk = this.lock(r, y); lk.material.map = this.lockTex(key); lk.material.needsUpdate = true; lk.visible = true; if (fresh) { lk.scale.setScalar(1.3); lk.userData.pop = this.t; } Gfx.kick(); }

    // ---------- Bonusspiele (Schatzwahl, Bonusrad) ----------
    async playBonus(st) {
      this.free = true; this.refreshHud(); sound.play('feature');
      this.drawMarquee(st.type === 'wheel' ? 'BONUSRAD' : 'BONUS');
      const cells = []; this.cur.grid.forEach((col, r) => col.forEach((v, y) => { if (v === this.m.bon) cells.push([r, y]); }));
      cells.forEach(c => this.flash(c[0], c[1])); sound.play('tease'); await wait(900 * this.speed); this.clearFlash();
      await this.app.featureIntro(st.type === 'wheel' ? 'BONUSRAD' : 'BONUSSPIEL', st.type === 'wheel' ? '<p>Das Rad entscheidet: Geld oder Freispiele!</p>' : `<p>Wähle ${st.vals.length} Felder – jedes zeigt einen Gewinn!</p>`, this.theme, { ms: 2400 });
      if (this.dead) return;
      const opt = { auto: this.auto, faces: this.m.bonus.faces };
      if (st.type === 'wheel') await this.app.bonusWheel(st, this.theme, opt); else await this.app.pickBonus(st, this.theme, opt);
      if (this.dead) return;
      if (st.win) { const from = this.winSum; this.winSum += st.win; await this.countUp(from, this.winSum, 900 * this.speed); wallet.reveal(st.win); }
      this.drawMarquee('');
    }
    async freeEnd(st) {
      this.banner.hidden = true; this.drawMarquee(''); this.upLevel = 0;
      if (this.m.ff && (this.m.ff.type === 'sticky' || this.m.ff.type === 'walk')) this.locks.forEach(l => { l.visible = false; });
      this.tint(false);
      if (st.win > 0 && st.win < this.bet * 15) { this.shower.start(Math.min(1, st.win / this.bet / 60 + 0.25), new THREE.Vector3(0, -this.winH / 2, 1)); await this.app.totalWin(`${st.played} ${this.freeName}E`, st.win, this.theme); this.shower.stop(); }
      else await this.app.splash(`<h2>${this.freeName}E BEENDET</h2><p>${st.played} ${this.freeName === 'FREISPIEL' ? 'Freispiele' : 'Sonderspiele'}</p><p class="big">${fmt(st.win)}</p>`, this.theme, 2000 * this.speed);
    }
    setBanner(html) { this.banner.innerHTML = html; this.banner.hidden = false; }

    // ---------- Hold & Win / Nugget-Feature ----------
    lockW(w, r, y) { return this.locks[(w * this.m.reels + r) * this.m.rows + y]; }
    frameW(w, r, y) { return this.frames[(w * this.m.reels + r) * this.m.rows + y]; }
    // Lage der Zusatzfelder: quer nebeneinander (links, rechts), hochkant über dem Kopfschild und unter dem Fuß
    winOffset(w) {
      const c = this.cab, half = this.winH / 2 + c.fw, gap = 0.62;
      if (this.nugLay === 'h') return { x: (w === 1 ? -1 : 1) * (this.cab.w + 0.3), y: 0 };
      return { x: 0, y: w === 1 ? half + c.mh + gap + half : -(half + c.bh + gap + half) };
    }
    featureBox(n) {
      const c = this.cab, half = this.winH / 2 + c.fw, B = this.baseBox;
      if (this.nugLay === 'h') { const W = this.cab.w + 0.3, lo = -W * (n > 1 ? 1 : 0) - B.w / 2, hi = (n > 2 ? W : 0) + B.w / 2; return { x: (lo + hi) / 2, y: B.y, w: hi - lo, h: B.h }; }
      const top = n > 1 ? this.winOffset(1).y + half + 0.5 : half + c.mh, bot = n > 2 ? this.winOffset(2).y - half : -(half + c.bh);
      return { x: 0, y: (top + bot) / 2, w: B.w + 0.1, h: top - bot };
    }
    addWindow(w, label) {
      const m = this.m, th = this.theme, rw = this.reelsW, wh = this.winH, fw = this.cab.fw, o = this.winOffset(w);
      const grp = new THREE.Group(); grp.position.set(o.x, o.y, 0); grp.scale.setScalar(0.01); this.group.add(grp);
      const metal = this.mats.metal.clone(), dark = this.mats.dark.clone();
      const box = (bw, bh, d, x, y, z, mat) => { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, d), mat); b.position.set(x, y, z); grp.add(b); };
      const back = new THREE.Mesh(new THREE.PlaneGeometry(rw + 0.6, wh + 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(th.tile[1]) })); back.position.z = -RAD * 1.6; grp.add(back);
      box(rw + 2 * fw, fw, 0.36, 0, wh / 2 + fw / 2, 0.08, metal); box(rw + 2 * fw, fw, 0.36, 0, -wh / 2 - fw / 2, 0.08, metal);
      box(fw, wh + 2 * fw, 0.36, -rw / 2 - fw / 2, 0, 0.08, metal); box(fw, wh + 2 * fw, 0.36, rw / 2 + fw / 2, 0, 0.08, metal);
      for (let r = 1; r < m.reels; r++) box(GAP * 0.7, wh, 0.12, this.reelX(r) - (REEL_W + GAP) / 2, 0, 0.02, dark);
      [-1, 1].forEach(sg => box(rw + 2 * fw, 0.8, 0.1, 0, sg * (wh / 2 + fw + 0.4), 0.04, dark));   // verdeckt die Walzenrundung
      // Schild DOPPEL / DREIFACH über dem Feld
      const lc = Gfx.canvas(512, 96), lg = lc.getContext('2d'); lg.fillStyle = S.lg(lg, 0, 0, 0, 96, th.b, '#2a0a00'); S.rr(lg, 4, 4, 504, 88, 40); lg.fill();
      lg.lineWidth = 6; lg.strokeStyle = S.gold(lg, 0, 96); lg.stroke(); S.text(lg, label, 256, 50, 56, S.gold(lg, 20, 80), '#1a0800', 7, true);
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.49), new THREE.MeshBasicMaterial({ map: Gfx.canvasTex(lc), transparent: true }));
      plate.position.set(0, wh / 2 + fw + 0.28, 0.2); grp.add(plate);
      const win = { grp, reels: [], pop: this.t };
      for (let r = 0; r < m.reels; r++) {
        const R = new Reel(this, r, grp); win.reels.push(R);
        R.setVisible(new Array(m.rows).fill('blank'));
        for (let y = 0; y < m.rows; y++) {
          const f = new THREE.Mesh(new THREE.PlaneGeometry(REEL_W * 1.02, 1.02), new THREE.MeshBasicMaterial({ map: Gfx.frameTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
          const lk = new THREE.Mesh(new THREE.PlaneGeometry(REEL_W * 0.98, 0.98), new THREE.MeshBasicMaterial({ transparent: true }));
          const p = this.cellPos(r, y); [f, lk].forEach((ob, i) => { ob.position.set(p.x, p.y, p.z + 0.02 + i * 0.005); ob.rotation.x = p.rx; ob.visible = false; grp.add(ob); });
          this.frames.push(f); this.locks.push(lk);
        }
      }
      this.wins.push(win); Gfx.kick();
    }
    removeWindows() {
      const n = this.m.reels * this.m.rows;
      this.locks.slice(n).forEach(l => { l.material.map = null; });          // Münzbilder liegen im gemeinsamen Cache
      for (const w of this.wins || []) { this.group.remove(w.grp); Gfx.dispose(w.grp); }
      this.wins = []; this.frames.length = n; this.locks.length = n;
    }
    async playHoldWin(st) {
      const m = this.m, hw = m.holdwin, bet = this.bet, W = st.windows || 1, nug = W > 1;
      const name = nug ? 'NUGGET-FEATURE' : 'HOLD &amp; WIN';
      this.free = true; this.refreshHud(); this.drawMarquee(nug ? 'NUGGET-FEATURE' : 'HOLD & WIN');
      const cells = []; this.cur.grid.forEach((col, r) => col.forEach((v, y) => { if (v === m.coin) cells.push([r, y]); }));
      cells.forEach(c => this.flash(c[0], c[1])); sound.play('tease'); await wait(800 * this.speed); this.clearFlash();
      await this.app.featureIntro(nug ? 'NUGGET-FEATURE' : 'HOLD & WIN', nug ? 'Nuggets bleiben liegen · 3 Respins · volle Mitte öffnet ein neues Feld!' : 'Münzen bleiben liegen – 3 Respins!', this.theme, { coins: true });
      if (this.dead) return;
      this.wins = [];
      if (nug) this.nugLay = this.rect && this.rect.w > this.rect.h ? 'h' : 'v';
      const coinKey = (v, hot) => this.key(m.coin, v, hot);
      const setLock = (w, r, y, v, fresh) => { const lk = this.lockW(w, r, y); lk.material.map = this.lockTex(coinKey(v, true)); lk.material.needsUpdate = true; lk.visible = true; if (fresh) { lk.scale.setScalar(1.35); lk.userData.pop = this.t; } Gfx.kick(); };
      st.start.forEach((col, r) => col.forEach((v, y) => { if (v) setLock(0, r, y, v); }));
      const labels = ['', 'DOPPEL', 'DREIFACH'];
      const finals = st.finals || [st.final];
      const lockState = finals.map(() => Array.from({ length: m.reels }, () => new Array(m.rows).fill(false)));
      st.start.forEach((col, r) => col.forEach((v, y) => { if (v) lockState[0][r][y] = true; }));
      let open = 1;
      const banner = rs => this.setBanner(`${name} · Respins: <b>${rs}</b>` + (nug ? ` · Feld <b>${open}</b>/${W}` : ''));
      const openWin = async w => {
        open = w + 1; sound.play('big');
        const mid = Math.floor(m.reels / 2); for (let y = 0; y < m.rows; y++) { const f = this.frameW(w - 1, mid, y); f.visible = true; f.userData.t = this.t; }
        this.addWindow(w, labels[w] || ('FELD ' + (w + 1))); this.viewTo(this.featureBox(open));
        C.toast(`${labels[w]}-FEATURE! Neues Feld offen`, 1600); banner(hw.respins || 3);
        await wait(1100 * this.speed); this.clearFlash();
      };
      for (const w of st.startOpen || []) await openWin(w);
      let respins = hw.respins || 3; banner(respins);
      const blank = 'blank', coinFill = () => (Math.random() < 0.16 ? coinKey(this.randCoin()) : blank);
      for (const rd of st.rounds) {
        if (this.dead) return;
        const sp = this.speed; let T0 = 0;
        sound.play('spin'); sound.whirr(true);
        for (let w = 0; w < open; w++) {
          const reels = w ? this.wins[w - 1].reels : this.reels;
          for (let r = 0; r < m.reels; r++) {
            if (lockState[w][r].every(Boolean)) continue;
            const col = []; for (let y = 0; y < m.rows; y++) { const f = rd.fresh.find(x => x[0] === r && x[1] === y && (x[3] || 0) === w); col.push(f ? coinKey(f[2]) : blank); }
            reels[r].prepare(col, coinFill);
            reels[r].start(this.quickStop ? 0.25 + r * 0.05 : (0.5 + r * 0.12 + w * 0.18) * sp, 22); T0++;
          }
        }
        this.cur = null;
        if (T0) await this.allStopped(); else sound.whirr(false);
        for (const f of rd.fresh) { const w = f[3] || 0; lockState[w][f[0]][f[1]] = true; setLock(w, f[0], f[1], f[2], true); sound.play('lock'); if (typeof f[2][1] === 'string') { sound.play('big'); C.toast(f[2][1] + '-JACKPOT!', 1400); } await wait(150 * sp); }
        respins = rd.respins;
        for (const w of rd.opened || []) await openWin(w);
        banner(respins);
        await wait(250 * sp);
      }
      // zusammenzählen: Feld für Feld, Nugget für Nugget
      let sum = 0; const start = this.winSum;
      this.setBanner(nug ? 'NUGGETS WERDEN GEZÄHLT' : 'MÜNZEN WERDEN GEZÄHLT');
      for (let w = 0; w < finals.length; w++) for (let r = 0; r < m.reels; r++) for (let y = 0; y < m.rows; y++) {
        const v = finals[w][r][y]; if (!v) continue;
        sum += L.coinValue(hw, v) * bet; const f = this.frameW(w, r, y); f.visible = true; f.userData.t = this.t;
        const lk = this.lockW(w, r, y); lk.scale.setScalar(1.25); lk.userData.pop = this.t;
        sound.play('coin'); this.setWin(start + sum); await wait(110 * this.speed);
      }
      if (st.full) { sound.play('big'); this.setBanner('GRAND JACKPOT!'); await this.app.splash(`<h2>GRAND JACKPOT</h2><p class="big">${fmt(hw.jackpots.GRAND * bet)}</p>`, this.theme, 2600); }
      this.winSum += st.win; this.setWin(this.winSum); wallet.reveal(st.win);
      if (st.win < this.bet * 15) await this.app.totalWin(nug ? 'NUGGET-GEWINN' : 'HOLD & WIN GEWINN', st.win, this.theme);   // große Summen feiert danach BIG/MEGA WIN
      else await wait(700 * this.speed);
      this.locks.forEach(l => { l.visible = false; }); this.clearFlash(); this.banner.hidden = true; this.drawMarquee('');
      if (this.wins.length) { this.removeWindows(); this.viewTo(null, true); }
      // Walzen wieder mit normalen Symbolen füllen
      this.reels.forEach(R => { const g = L.randomGrid(m); R.setVisible(g[0].map(s => this.key(s, s === m.coin ? this.randCoin() : null))); });
    }

    async celebrate(win, x) {
      sound.play('big'); this.party = true; this.shower.start(Math.min(1, x / 60), new THREE.Vector3(0, -this.winH / 2, 1));
      await this.app.bigWin('BIG WIN', win, this.theme, { tiers: [{ v: 40 * this.bet, t: 'MEGA WIN' }, { v: 100 * this.bet, t: 'EPIC WIN' }] });
      this.shower.stop(); this.party = false;
    }
    // Freispiel-Stimmung: Hintergrund wird wärmer und heller
    tint(on) { if (this.bg && this.bg.plane) { this.bg.plane.material.color.set(on ? 0xffe3a8 : 0xffffff); this.bg.plane.material.color.multiplyScalar(on ? 1.6 : 1); Gfx.kick(); } }

    // ---------- Mystery-Jackpot ----------
    async mysteryWin(v) {
      this.party = true; this.drawMarquee('MYSTERY JACKPOT!'); sound.play('fanfare');
      await this.app.featureIntro('MYSTERY JACKPOT', '<p>Der Jackpot aller Automaten ist gefallen!</p>', this.theme, { ms: 2200 });
      if (this.dead) return;
      this.shower.start(1, new THREE.Vector3(0, -this.winH / 2, 1));
      await this.app.bigWin('MYSTERY JACKPOT', v, this.theme);
      this.shower.stop(); this.party = false; wallet.reveal(); this.drawMarquee('');
    }

    // ---------- Nachdreh: eine Walze gegen Aufpreis neu drehen ----------
    showNudge() {
      const o = this.offer, b = this.q('[data-act=nudge]'); if (!o || !b) return;
      b.innerHTML = `↻ W${o.reel + 1} · ${C.short(o.price)}`; b.hidden = false; b.title = `Walze ${o.reel + 1} nochmal drehen für ${fmt(o.price)}`;
      for (let y = 0; y < this.m.rows; y++) { const f = this.frame(o.reel, y); f.visible = true; f.userData.t = this.t; f.userData.until = this.t + 1.6; }
      Gfx.kick();
    }
    hideNudge() { const b = this.q && this.q('[data-act=nudge]'); if (b) b.hidden = true; this.offer = null; }
    async nudge() {
      const o = this.offer; if (this.busy || !o || o.bet !== this.bet) return this.hideNudge();
      if (!wallet.take(o.price)) { this.hideNudge(); return this.app.noMoney(o.price); }
      this.hideNudge(); this.clearWinShow(); this.busy = true; this.refreshHud(); this.setWin(0);
      const st = L.nudge(this.m, o.bet, o.grid, o.reel);
      wallet.give(st.win, true); this.winSum = 0;
      try { this.setBanner(`NACHDREH – Walze ${o.reel + 1}`); await this.animSpin(st, { noTease: true }); this.banner.hidden = true; if (!this.dead) await this.showWins(st); }
      finally { if (!this.dead) { wallet.reveal(); this.busy = false; this.refreshHud(); } }
      if (this.dead) return;
      this.setWin(st.win); this.lastWin = st.win;
      if (st.win >= o.bet * 15) await this.celebrate(st.win, st.win / o.bet);
      this.startWinCycle(st);
    }

    // ---------- Risiko (Rot/Schwarz) ----------
    async gamble() {
      if (this.busy || !this.lastWin) return;
      this.q('[data-act=risk]').hidden = true; this.clearWinShow();
      let res = await this.app.gamble(this.lastWin, { ladder: L.ladderStart(this.lastWin, this.bet) >= 0 });
      if (res && res.ladder != null) res = await this.ladder(res.ladder);
      if (this.dead) return;
      this.lastWin = 0; this.setWin(res);
    }
    // Sonderspiel-Leiter; oben angekommen startet eine eigene Runde Sonderspiele
    async ladder(amount) {
      const r = await this.app.ladder(amount, this.bet, this.theme);
      if (!r.special || this.dead) return r.win;
      const bet = this.bet, round = L.specialRound(this.m, bet);
      wallet.give(round.total, true); this.winSum = 0; this.busy = true; this.refreshHud();
      try { await this.runSteps(round.steps); }
      finally { if (!this.dead) { wallet.reveal(); this.busy = false; this.free = false; this.refreshHud(); } }
      if (this.dead) return 0;
      const won = r.win + round.total; this.setWin(won);
      if (round.total >= bet * 15) await this.celebrate(round.total, round.total / bet);
      return won;
    }

    info() {
      const m = this.m, bet = this.bet, u = bet / m.unit * m.scale;
      const rows = m.symbols.map((s, i) => {
        let pays = '';
        if (s.pay && i !== m.scat) pays = Object.keys(s.pay).sort((a, b) => b - a).map(n => `<span>${n}× <b>${fmt(Math.round(s.pay[n] * u * (i === m.wild ? 1 : 1)))}</b></span>`).join('');
        if (i === m.scat && m.scatter.pay) pays = Object.keys(m.scatter.pay).sort((a, b) => b - a).map(n => `<span>${n}× <b>${fmt(Math.round(m.scatter.pay[n] * bet * m.scale))}</b></span>`).join('');
        if (!pays && !s.name) return '';
        return `<div class="prow"><canvas data-art="${s.art || s.id}" width="64" height="64"></canvas><div><em>${s.name || ''}</em>${pays}</div></div>`;
      }).join('');
      const lines = m.lines ? `${m.nLines} Gewinnlinien, von links nach rechts` : '243 Gewinnwege, von links nach rechts' + ' (Beträge je Weg)';
      C.modal(`<h2>${this.cfg.title}</h2><p class="muted">${lines} · Einsatz ${fmt(bet)}</p><div class="paytable">${rows}</div><p>${this.cfg.info}</p>
        <p><b>Glücks-Features:</b> Bei jedem Dreh kann zufällig eines starten – jedes Mal ein anderes: ${L.luckyTypes(m).map(t => ({ wildReel: 'Wild-Walze', mystery: 'Mystery-Symbole', wildRain: 'Wild-Regen', mult: 'Multiplikator ×2 bis ×5', cash: 'Geldregen', hammer: 'Goldhammer' })[t]).join(', ')}.</p>
        <p><b>Sonderspiel-Leiter:</b> Im RISIKO führt der Knopf LEITER zur Leiter (ab dem 1-fachen Einsatz). STOP lässt das Licht entscheiden: oben eine Sprosse höher, unten alles weg. Ganz oben gibt es ${L.SPECIAL.count} Sonderspiele mit ×${L.SPECIAL.mult}.</p>
        <p><b>Nachdreh:</b> Knapp daneben? Nach einem Dreh ohne Gewinn kannst du eine Walze gegen einen Aufpreis nochmal drehen (dabei landen keine Scatter oder Bonus-Symbole).</p>
        <p><b>Mystery-Jackpot:</b> Ein Teil jedes Einsatzes an allen Automaten fließt in einen gemeinsamen Jackpot (Anzeige oben im Automaten). Er fällt zufällig – spätestens bei ${fmt(this.app.MYSTERY_MAX || 0)}.</p>
        <p class="muted small">Nach einem Gewinn kannst du mit <b>RISIKO</b> auf Rot oder Schwarz setzen und den Gewinn verdoppeln. Theoretische Auszahlungsquote ca. 95 %. Nur Spielgeld.</p>`,
      { cls: 'wide', onOpen: box => box.querySelectorAll('canvas[data-art]').forEach(c => { const g = c.getContext('2d'); g.scale(64 / 200, 64 / 200); S.drawArt(g, c.dataset.art); }) });
    }

    // ---------- Rahmen ----------
    resize() {
      if (!this.camera) return;
      const top = (document.getElementById('top').getBoundingClientRect().bottom || 56) + (this.jackbar ? this.jackbar.offsetHeight + 4 : 0);
      const bottom = innerHeight - (this.bar ? Math.min(this.bar.getBoundingClientRect().top, this.q('.winbox').getBoundingClientRect().top) : innerHeight - 120);
      const rect = Gfx.freeRect(top + 2, bottom + 4, 4, 4);
      // Walzen so groß wie möglich: Kopfschild und Fußleiste dürfen hinter die Leisten ragen, die Seitenlichter an den Rand
      const c = this.cab, wide = rect.w > rect.h * 1.2, low = wide && rect.h < 480, up = low ? 0.4 : wide ? 1 : 0.85, dn = low ? 0.15 : wide ? 1 : 0.5;
      const fh = this.winH + 2 * c.fw + up * c.mh + dn * c.bh, fcy = (up * c.mh - dn * c.bh) / 2;
      document.body.classList.toggle('slotwide', low);
      this.rect = rect; this.baseBox = { x: 0, y: fcy, w: this.reelsW + 2 * c.fw + 0.04, h: fh };
      this.applyView();
      if (this.fx) this.clearLines();
    }
    // Kamera auf einen Ausschnitt richten; bei offenem Nugget-Feld mit weichem Übergang
    applyView() {
      let b = this.baseBox; const v = this.view;
      if (v) { const k = Math.min(1, (this.t - v.t0) / v.dur), e = k * k * (3 - 2 * k), a = v.from; b = { x: a.x + (v.to.x - a.x) * e, y: a.y + (v.to.y - a.y) * e, w: a.w + (v.to.w - a.w) * e, h: a.h + (v.to.h - a.h) * e }; if (k >= 1 && v.end) this.view = null; }
      const d = Gfx.fit(this.camera, b.w, b.h, this.rect, { pad: 1.01 });
      this.camC = b; this.camDist = d; this.camera.position.set(b.x, b.y, d); this.camera.lookAt(b.x, b.y, 0);
    }
    viewTo(to, end) { const from = this.camC || this.baseBox; this.view = { from: Object.assign({}, from), to: to || this.baseBox, t0: this.t, dur: 0.9, end }; Gfx.kick(); }
    update(dt, t) {
      this.t = t;
      let busy = false;
      if (this.reels) for (const R of this.allReels()) if (R.update(dt)) busy = true;
      if (this.shower && this.shower.update(dt)) busy = true;
      if (this.bg) this.bg.update(t);
      // Lauflichter und Glühbirnen
      const party = this.party || this.free;
      if (this.leds) { const h = (t * (party ? 0.5 : 0.08)) % 1; this.leds[0].material.color.setHSL(h, 0.9, 0.55); this.leds[1].material.color.setHSL((h + 0.5) % 1, 0.9, 0.55); }
      if (this.bulbs) {
        const step = Math.floor(t * (party ? 16 : busy ? 14 : 5)); if (step !== this.bulbStep) { this.bulbStep = step; const a = new THREE.Color(this.theme.a), b = new THREE.Color('#ffffff'), o = new THREE.Color('#3a2a10');
          for (let i = 0; i < this.bulbN; i++) this.bulbs.setColorAt(i, (i + step) % 3 === 0 ? b : (i + step) % 3 === 1 ? a : o); this.bulbs.instanceColor.needsUpdate = true; }
      }
      if (this.frames) for (const f of this.frames) if (f.visible) { if (f.userData.until && t > f.userData.until) { f.visible = false; f.userData.until = 0; continue; } if (f.userData.until) busy = true; const k = 0.5 + 0.5 * Math.sin((t - (f.userData.t || 0)) * 9); f.material.opacity = 0.55 + 0.45 * k; f.scale.setScalar(1 + 0.03 * k); }
      if (this.locks) for (const l of this.locks) if (l.visible && l.userData.pop != null) { const k = Math.min(1, (t - l.userData.pop) * 4); l.scale.setScalar(1.3 - 0.3 * k); if (k >= 1) l.userData.pop = null; else busy = true; }
      if (this.view && this.rect) { const v = this.view; this.applyView(); if (t - v.t0 < v.dur) busy = true; }
      if (this.wins) for (const w of this.wins) if (w.pop != null) { const k = Math.min(1, (t - w.pop) / 0.7); w.grp.scale.setScalar(Math.max(0.01, easeBack(k))); if (k >= 1) w.pop = null; else busy = true; }
      if (this.camera && this.camDist) { const c = this.camC; this.camera.position.x = c.x + Math.sin(t * 0.25) * 0.08; this.camera.lookAt(c.x, c.y, 0); }
      return busy;
    }
    leave() {
      this.dead = true; this.auto = false; document.body.classList.remove('slotwide'); this.clearWinShow(); sound.whirr(false);
      if (this.fx) this.clearLines();
      if (this.scene) Gfx.dispose(this.scene);
      this.texCache.forEach(t => t.dispose()); this.texCache.clear(); this.tiles.clear();
    }
  }
  function coinLabel(m, v, bet) { return typeof v[1] === 'string' ? v[1] : C.short(v[1] * bet, true); }

  G.CasinoSlot = { SlotScreen, BETS };
})(window);
