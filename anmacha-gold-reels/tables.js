'use strict';
/* AnMaCha Casino – Tischspiele in 3D: Roulette, Blackjack, Video-Poker, Glücksrad. */
(function (G) {
  const THREE = G.THREE, Gfx = G.CasinoGfx, S = G.CasinoSymbols, L = G.CasinoLogic, C = G.CasinoCore;
  const { el, fmt, wallet, sound, wait } = C;
  const CHIPS = [10, 50, 100, 500, 1000, 5000];
  const CHIP_COL = { 10: '#2563eb', 50: '#dc2626', 100: '#16a34a', 500: '#7c3aed', 1000: '#f59e0b', 5000: '#0f172a' };
  const ease = { out: k => 1 - Math.pow(1 - k, 3), inOut: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), lin: k => k };
  const never = () => new Promise(() => {}); // bleibt offen und wird mit dem Tisch freigegeben: hält Abläufe nach dem Verlassen an

  // ---------- Karten ----------
  const CW = 0.9, CH = 1.26;
  function cardCanvas(c, theme) {
    const W = 180, H = 252, cv = Gfx.canvas(256, 256), g = cv.getContext('2d');
    g.translate((256 - W) / 2, 2);
    S.rr(g, 2, 2, W - 4, H - 4, 16);
    if (c < 0) {                                                  // Rückseite
      g.fillStyle = S.lg(g, 0, 0, W, H, theme.b, theme.c || theme.a); g.fill(); g.lineWidth = 6; g.strokeStyle = '#fff'; g.stroke();
      g.save(); g.clip(); g.globalAlpha = 0.18; g.strokeStyle = '#fff'; g.lineWidth = 3; for (let i = -H; i < W + H; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i - H, H); g.stroke(); g.beginPath(); g.moveTo(i - H, 0); g.lineTo(i, H); g.stroke(); } g.restore();
      g.beginPath(); g.arc(W / 2, H / 2, 40, 0, 7); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill(); S.text(g, 'A', W / 2, H / 2 + 3, 56, S.gold(g, H / 2 - 30, H / 2 + 30), '#2a0a00', 6);
      return cv;
    }
    g.fillStyle = '#fbfbf7'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#c9c9c0'; g.stroke();
    const red = L.isRed(c), col = red ? '#d61f2c' : '#15151c', r = L.RANKS[L.rank(c)], s = L.SUITS[L.suit(c)];
    g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 40px ' + S.FONT; g.fillText(r, 28, 32); g.font = '36px serif'; g.fillText(s, 28, 70);
    g.save(); g.translate(W, H); g.rotate(Math.PI); g.font = '900 40px ' + S.FONT; g.fillText(r, 28, 32); g.font = '36px serif'; g.fillText(s, 28, 70); g.restore();
    const rk = L.rank(c);
    if (rk >= 10) { S.rr(g, 46, 54, W - 92, H - 108, 10); g.fillStyle = red ? '#ffe4e6' : '#e0e7ff'; g.fill(); g.strokeStyle = col; g.lineWidth = 3; g.stroke(); g.fillStyle = col; g.font = '900 72px ' + S.FONT; g.fillText(r, W / 2, H / 2 - 12); g.font = '48px serif'; g.fillText(s, W / 2, H / 2 + 46); }
    else { g.font = (rk === 0 ? '120px' : '84px') + ' serif'; g.fillText(s, W / 2, H / 2 + 6); }
    return cv;
  }

  // ---------- gemeinsame Basis ----------
  class Table {
    constructor(app, def) { this.app = app; this.def = def; this.theme = def.theme; this.tw = []; this.dead = false; this.texCache = new Map(); }
    setup(fov) {
      this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(fov || 36, innerWidth / innerHeight, 0.1, 100);
      this.bg = Gfx.backdrop(this.scene, this.theme, { z: -18 }); Gfx.lights(this.scene, this.theme);
      this.shower = Gfx.coinShower(this.scene);
    }
    felt(w, d, label) {
      const c = Gfx.canvas(1024, 768), g = c.getContext('2d');
      g.fillStyle = S.rg(g, 512, 380, 40, 700, '#1f8a4c', '#0b4a27', '#062a16'); g.fillRect(0, 0, 1024, 768);
      g.globalAlpha = 0.06; for (let i = 0; i < 4000; i++) { g.fillStyle = Math.random() < 0.5 ? '#fff' : '#000'; g.fillRect(Math.random() * 1024, Math.random() * 768, 2, 2); } g.globalAlpha = 1;
      g.strokeStyle = 'rgba(255,215,120,.7)'; g.lineWidth = 6; g.strokeRect(14, 14, 996, 740);
      if (label) label(g);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: Gfx.canvasTex(c), roughness: 0.95 }));
      m.rotation.x = -Math.PI / 2; this.scene.add(m);
      const rim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.25, d + 0.5), new THREE.MeshStandardMaterial({ color: 0x3a1c0a, roughness: 0.5, metalness: 0.2 }));
      rim.position.y = -0.14; this.scene.add(rim);
      return m;
    }
    cardTex(c) { let t = this.texCache.get(c); if (!t) { t = Gfx.canvasTex(cardCanvas(c, this.theme)); this.texCache.set(c, t); } return t; }
    card(c) {
      const grp = new THREE.Group();
      const geo = new THREE.PlaneGeometry(CW, CH); const uv = geo.attributes.uv;                 // Karte belegt 180×252 von 256×256
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (38 + uv.getX(i) * 180) / 256, (256 - 2 - 252 + uv.getY(i) * 252) / 256);
      const front = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: this.cardTex(c), transparent: true, alphaTest: 0.5, roughness: 0.6 }));
      const back = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: this.cardTex(-1), transparent: true, alphaTest: 0.5, roughness: 0.6 })); back.rotation.y = Math.PI;
      grp.add(front, back); grp.userData.c = c; grp.userData.front = front;
      this.scene.add(grp); return grp;
    }
    setCard(grp, c) { grp.userData.c = c; grp.userData.front.material.map = this.cardTex(c); grp.userData.front.material.needsUpdate = true; }
    tween(obj, to, dur, opt) {
      if (this.dead) return never();
      opt = opt || {};
      return new Promise(res => this.tw.push({ obj, to, dur: dur * (C.data.turbo ? 0.55 : 1), t: -(opt.delay || 0), e: ease[opt.ease || 'out'], res, from: null, arc: opt.arc || 0 }));
    }
    runTweens(dt) {
      if (!this.tw.length) return false;
      for (let i = this.tw.length - 1; i >= 0; i--) {
        const T = this.tw[i]; T.t += dt; if (T.t < 0) continue;
        const o = T.obj;
        if (!T.from) { T.from = { x: o.position.x, y: o.position.y, z: o.position.z, rx: o.rotation.x, ry: o.rotation.y, rz: o.rotation.z, s: o.scale.x }; }
        const k = Math.min(1, T.t / T.dur), e = T.e(k), F = T.from, to = T.to;
        if ('x' in to) o.position.x = F.x + (to.x - F.x) * e;
        if ('y' in to || T.arc) o.position.y = F.y + (('y' in to ? to.y : F.y) - F.y) * e;   // Bogen nicht aufaddieren
        if ('z' in to) o.position.z = F.z + (to.z - F.z) * e;
        if (T.arc) o.position.y += Math.sin(k * Math.PI) * T.arc;
        if ('rx' in to) o.rotation.x = F.rx + (to.rx - F.rx) * e;
        if ('ry' in to) o.rotation.y = F.ry + (to.ry - F.ry) * e;
        if ('rz' in to) o.rotation.z = F.rz + (to.rz - F.rz) * e;
        if ('s' in to) o.scale.setScalar(F.s + (to.s - F.s) * e);
        if (k >= 1) { this.tw.splice(i, 1); T.res(); }
      }
      return true;
    }
    chipStack(amount, x, z) {
      const grp = new THREE.Group(); let rest = amount, h = 0;
      for (const v of CHIPS.slice().reverse()) while (rest >= v && h < 14) { rest -= v; const m = new THREE.Mesh(this.chipGeo || (this.chipGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24)), this.chipMat(v)); m.position.y = 0.03 + h * 0.062; m.rotation.y = Math.random() * 6; grp.add(m); h++; }
      grp.position.set(x, 0, z); this.scene.add(grp); return grp;
    }
    chipMat(v) {
      this.chipMats = this.chipMats || {}; if (this.chipMats[v]) return this.chipMats[v];
      const c = Gfx.canvas(128, 128), g = c.getContext('2d'); g.fillStyle = CHIP_COL[v]; g.beginPath(); g.arc(64, 64, 64, 0, 7); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 10; g.setLineDash([14, 14]); g.beginPath(); g.arc(64, 64, 54, 0, 7); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 34, 0, 7); g.fill(); S.text(g, C.short(v, true), 64, 66, v >= 1000 ? 22 : 28, CHIP_COL[v]);
      const side = new THREE.MeshStandardMaterial({ color: new THREE.Color(CHIP_COL[v]), roughness: 0.5 }), top = new THREE.MeshStandardMaterial({ map: Gfx.canvasTex(c), roughness: 0.5 });
      return (this.chipMats[v] = [side, top, top]);
    }
    removeObj(o) { if (!o) return; this.scene.remove(o); Gfx.dispose(o); }
    chipBar(onPick) {
      const bar = el('div', 'chips');
      CHIPS.forEach(v => { const b = el('button', 'chip', C.short(v, true)); b.style.setProperty('--c', CHIP_COL[v]); b.dataset.v = v; b.setAttribute('data-nav', ''); bar.appendChild(b); });
      const sel = () => bar.querySelectorAll('.chip').forEach(b => b.classList.toggle('on', +b.dataset.v === this.chip));
      this.chip = CHIPS[C.data.chip] || 10; sel();
      bar.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; this.chip = +b.dataset.v; C.data.chip = CHIPS.indexOf(this.chip); C.save(); sel(); sound.play('chip'); onPick && onPick(); });
      return bar;
    }
    celebrate(win, x) { if (this.dead) return never(); if (x < 8) return Promise.resolve(); sound.play('big'); this.shower.start(Math.min(1, x / 40), new THREE.Vector3(0, 0.5, 1.5)); return this.app.bigWin(x >= 30 ? 'MEGA WIN' : 'BIG WIN', win, this.theme).then(() => this.shower.stop()); }
    baseUpdate(dt, t) { let b = this.runTweens(dt); if (this.shower.update(dt)) b = true; this.bg.update(t); return b; }
    // Nach dem Verlassen bleiben laufende Abläufe an der nächsten Pause stehen; settle() rechnet die Runde sofort ab.
    pause(ms) { return wait(ms).then(() => (this.dead ? never() : undefined)); }
    leave() { this.dead = true; this.tw.length = 0; if (this.settle) this.settle(); if (this.scene) Gfx.dispose(this.scene); this.texCache.forEach(t => t.dispose()); this.texCache.clear(); }
    topH() { return document.getElementById('top').getBoundingClientRect().bottom || 56; }
  }

  // ======================= ROULETTE =======================
  class Roulette extends Table {
    enter(hud) {
      this.setup(34); this.bets = {}; this.last = C.data.lastRoul || null; this.hist = [];
      const scene = this.scene;
      const R = 2.2; this.R = R;
      // Kessel
      const prof = [[0, -0.3], [R * 1.25, -0.3], [R * 1.32, 0.05], [R * 1.28, 0.32], [R * 1.12, 0.36], [R * 1.02, 0.18], [R * 0.98, 0.1]].map(p => new THREE.Vector2(p[0], p[1]));
      const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), new THREE.MeshStandardMaterial({ color: 0x5a2a0e, roughness: 0.35, metalness: 0.25, side: THREE.DoubleSide }));
      scene.add(bowl);
      const track = new THREE.Mesh(new THREE.RingGeometry(R * 0.98, R * 1.14, 64, 1), new THREE.MeshStandardMaterial({ color: 0x24140a, roughness: 0.3, metalness: 0.3, side: THREE.DoubleSide }));
      track.rotation.x = -Math.PI / 2; track.position.y = 0.11; scene.add(track);
      // Drehteller mit Zahlen
      const c = Gfx.canvas(1024, 1024), g = c.getContext('2d'), N = 37, da = Math.PI * 2 / N;
      g.translate(512, 512);
      g.fillStyle = '#3a1c0a'; g.beginPath(); g.arc(0, 0, 512, 0, 7); g.fill();
      for (let i = 0; i < N; i++) {
        const n = L.WHEEL[i], a0 = i * da - da / 2, a1 = a0 + da, col = L.rouletteColor(n), fill = col === 'red' ? '#c8102e' : col === 'black' ? '#141414' : '#0a8a3a';
        g.beginPath(); g.arc(0, 0, 500, a0, a1); g.arc(0, 0, 330, a1, a0, true); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = '#d4af37'; g.lineWidth = 3; g.stroke();
        g.save(); g.rotate(i * da); g.translate(445, 0); g.rotate(Math.PI / 2); S.text(g, String(n), 0, 0, 40, '#fff'); g.restore();
        g.beginPath(); g.arc(0, 0, 390, a0, a1); g.arc(0, 0, 330, a1, a0, true); g.closePath(); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
      }
      g.fillStyle = S.rg(g, 0, 0, 20, 330, '#c08a3a', '#6a3a14', '#3a1c0a'); g.beginPath(); g.arc(0, 0, 330, 0, 7); g.fill();
      const rotor = new THREE.Group(); scene.add(rotor); this.rotor = rotor;
      const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 74), new THREE.MeshStandardMaterial({ map: Gfx.canvasTex(c), roughness: 0.4, metalness: 0.15 }));
      disc.rotation.x = -Math.PI / 2; disc.position.y = 0.06; rotor.add(disc);
      const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });
      const cone = new THREE.Mesh(new THREE.ConeGeometry(R * 0.28, 0.5, 32), gold); cone.position.y = 0.3; rotor.add(cone);
      for (let i = 0; i < 4; i++) { const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, R * 0.6, 8), gold); arm.rotation.z = Math.PI / 2; arm.rotation.y = i * Math.PI / 2; arm.position.y = 0.5; rotor.add(arm);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), gold); knob.position.set(Math.cos(i * Math.PI / 2) * R * 0.3, 0.5, -Math.sin(i * Math.PI / 2) * R * 0.3); rotor.add(knob); }
      for (let i = 0; i < N; i++) { const fr = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, R * 0.17), gold); const a = i * da + da / 2; fr.position.set(Math.cos(a) * R * 0.77, 0.09, Math.sin(a) * R * 0.77); fr.rotation.y = -a + Math.PI / 2; rotor.add(fr); }
      this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1 }));
      scene.add(this.ball); this.ballA = 0; this.ballR = R * 1.06; this.ballY = 0.2; this.placeBall();
      this.psi = 0;
      this.buildHud(hud); Gfx.set(this); C.input.setScreen(this.ctrl());
    }
    placeBall() { this.ball.position.set(Math.cos(this.ballA) * this.ballR, this.ballY, Math.sin(this.ballA) * this.ballR); }
    pocketAngle(n) { return L.WHEEL.indexOf(n) * Math.PI * 2 / 37; }
    buildHud(hud) {
      hud.innerHTML = '';
      const wrap = el('div', 'roul'); hud.appendChild(wrap); this.wrap = wrap;
      const info = el('div', 'rinfo glass', '<div class="hist"></div><div class="rres"></div>'); wrap.appendChild(info); this.info = info;
      const board = el('div', 'board'); wrap.appendChild(board); this.board = board;
      const ctl = el('div', 'tctl glass'); wrap.appendChild(ctl); this.ctl = ctl;
      ctl.appendChild(this.chipBar());
      const btns = el('div', 'tbtns', `<button class="pill" data-nav data-a="clear">LÖSCHEN</button><button class="pill" data-nav data-a="rebet">WIEDERHOLEN</button>
        <div class="val"><small>EINSATZ</small><b class="tot">0</b></div><button class="pill gold" data-nav data-default data-a="spin">DREHEN</button>`);
      ctl.appendChild(btns);
      btns.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; sound.play('click'); ({ clear: () => this.clear(), rebet: () => this.rebet(), spin: () => this.spin() })[b.dataset.a](); });
      board.addEventListener('click', e => { const b = e.target.closest('[data-bet]'); if (!b) return; this.place(b.dataset.bet); });
      board.addEventListener('contextmenu', e => { const b = e.target.closest('[data-bet]'); if (!b) return; e.preventDefault(); this.place(b.dataset.bet, true); });
      this.layoutBoard(); this.refresh();
    }
    layoutBoard() {
      const vert = innerWidth < innerHeight * 0.95; if (this.vert === vert && this.board.children.length) return; this.vert = vert;
      const cells = [];
      const add = (key, label, r, c, rs, cs, cls) => cells.push({ key, label, r, c, rs: rs || 1, cs: cs || 1, cls: cls || '' });
      for (let n = 1; n <= 36; n++) {
        const col = L.rouletteColor(n);
        if (!vert) add('n' + n, n, 3 - ((n - 1) % 3), 2 + Math.floor((n - 1) / 3), 1, 1, col);
        else add('n' + n, n, 2 + Math.floor((n - 1) / 3), 3 + ((n - 1) % 3), 1, 1, col);
      }
      if (!vert) {
        add('n0', 0, 1, 1, 3, 1, 'green');
        ['c3', 'c2', 'c1'].forEach((k, i) => add(k, '2:1', 1 + i, 14, 1, 1, 'out'));
        ['d1', 'd2', 'd3'].forEach((k, i) => add(k, (i * 12 + 1) + '–' + (i * 12 + 12), 4, 2 + i * 4, 1, 4, 'out'));
        [['low', '1–18'], ['even', 'GERADE'], ['red', '◆'], ['black', '◆'], ['odd', 'UNGERADE'], ['high', '19–36']].forEach((x, i) => add(x[0], x[1], 5, 2 + i * 2, 1, 2, 'out ' + (x[0] === 'red' ? 'red' : x[0] === 'black' ? 'black' : '')));
        this.board.style.gridTemplateColumns = 'repeat(14,1fr)'; this.board.style.gridTemplateRows = 'repeat(5,1fr)';
      } else {
        add('n0', 0, 1, 3, 1, 3, 'green');
        ['c1', 'c2', 'c3'].forEach((k, i) => add(k, '2:1', 14, 3 + i, 1, 1, 'out'));
        ['d1', 'd2', 'd3'].forEach((k, i) => add(k, (i * 12 + 1) + '–' + (i * 12 + 12), 2 + i * 4, 2, 4, 1, 'out vtxt'));
        [['low', '1–18'], ['even', 'GER.'], ['red', '◆'], ['black', '◆'], ['odd', 'UNG.'], ['high', '19–36']].forEach((x, i) => add(x[0], x[1], 2 + i * 2, 1, 2, 1, 'out vtxt ' + (x[0] === 'red' ? 'red' : x[0] === 'black' ? 'black' : '')));
        this.board.style.gridTemplateColumns = '1fr 1fr 1.4fr 1.4fr 1.4fr'; this.board.style.gridTemplateRows = 'repeat(14,1fr)';
      }
      this.board.classList.toggle('vert', vert);
      this.board.innerHTML = cells.map(x => `<button class="bc ${x.cls}" data-nav data-bet="${x.key}" style="grid-area:${x.r}/${x.c}/span ${x.rs}/span ${x.cs}"><span>${x.label}</span><i class="bchip" hidden></i></button>`).join('');
      this.refresh();
    }
    total() { let t = 0; for (const k in this.bets) t += this.bets[k]; return t; }
    place(key, remove) {
      if (this.spinning) return;
      if (remove) { if (this.bets[key]) { this.bets[key] = Math.max(0, this.bets[key] - this.chip); if (!this.bets[key]) delete this.bets[key]; sound.play('chip'); } }
      else { if (this.total() + this.chip > wallet.bal) { C.toast('Nicht genug Guthaben für diesen Chip'); return; } if (this.total() + this.chip > 50000) { C.toast('Höchsteinsatz ' + fmt(50000) + ' je Runde'); return; } this.bets[key] = (this.bets[key] || 0) + this.chip; sound.play('chip'); }
      this.clearMarks(); this.refresh();
    }
    clear() { if (this.spinning) return; this.bets = {}; this.refresh(); }
    rebet() { if (this.spinning || !this.last) return; let t = 0; for (const k in this.last) t += this.last[k]; if (t > wallet.bal) { C.toast('Nicht genug Guthaben'); return; } this.bets = Object.assign({}, this.last); this.refresh(); }
    refresh() {
      if (!this.board) return;
      this.board.querySelectorAll('[data-bet]').forEach(b => { const v = this.bets[b.dataset.bet], i = b.querySelector('.bchip'); i.hidden = !v; if (v) i.textContent = C.short(v, true); });
      this.ctl.querySelector('.tot').textContent = fmt(this.total());
      this.ctl.querySelector('[data-a=spin]').disabled = this.spinning || !this.total();
      this.ctl.querySelector('[data-a=rebet]').disabled = this.spinning || !this.last;
      this.ctl.querySelector('[data-a=clear]').disabled = this.spinning || !this.total();
      this.info.hidden = !this.hist.length && !this.spinning;
      this.info.querySelector('.hist').innerHTML = this.hist.map(n => `<i class="${L.rouletteColor(n)}">${n}</i>`).join('');
    }
    clearMarks() { this.board.querySelectorAll('.hit').forEach(b => b.classList.remove('hit')); this.info.querySelector('.rres').textContent = ''; }
    async spin() {
      if (this.spinning || !this.total()) return;
      const tot = this.total(); if (!wallet.take(tot)) { this.app.noMoney(tot); return; }
      this.spinning = true; this.clearMarks(); this.refresh();
      const n = L.rouletteSpin(), ret = L.roulettePayout(this.bets, n);
      wallet.give(ret, true);
      this.last = Object.assign({}, this.bets); C.data.lastRoul = this.last; C.save();
      // Kugel: läuft gegen den Teller und fällt in das Ziel-Fach
      const T = (C.data.turbo ? 3.2 : 5.6), now = this.t;
      this.spinA = { t0: now, T, a0: this.ballA, n, done: false, psi0: this.psi };
      sound.play('spin');
      await new Promise(res => { this.spinA.res = res; });
      if (this.dead) return;
      sound.play('lock');
      this.hist.unshift(n); this.hist = this.hist.slice(0, 14);
      this.board.querySelectorAll('[data-bet]').forEach(b => { if (L.rouletteBetPays(b.dataset.bet, n)) b.classList.add('hit'); });
      const col = L.rouletteColor(n);
      this.info.querySelector('.rres').innerHTML = `<b class="${col}">${n}</b> ` + (ret ? `Gewinn <b>${fmt(ret)}</b>` : 'Leider nichts');
      wallet.reveal(); if (ret) sound.play('win'); else sound.play('lose');
      await this.celebrate(ret, ret / tot);
      this.bets = {}; this.spinning = false; this.refresh();
    }
    ctrl() { return { root: this.wrap, primary: () => this.spin(), secondary: () => this.rebet(), info: () => this.help(), back: () => this.app.home() }; }
    help() { C.modal(`<h2>Roulette</h2><p>Europäisches Roulette mit einer Null. Wähle einen Chip und tippe auf Felder, um zu setzen (Rechtsklick oder erneut mit Chip-Wert entfernen: lange tippen ist nicht nötig, „LÖSCHEN“ räumt alles ab).</p>
      <div class="paytable"><div class="prow"><div><em>Zahl (Plein)</em><span>35 : 1</span></div></div><div class="prow"><div><em>Dutzend, Kolonne (2:1)</em><span>2 : 1</span></div></div><div class="prow"><div><em>Rot/Schwarz, Gerade/Ungerade, 1–18/19–36</em><span>1 : 1</span></div></div></div>
      <p class="muted small">Bei Null verlieren alle Außenwetten. Auszahlungsquote 97,3 %. Nur Spielgeld.</p>`); }
    resize() {
      if (!this.camera) return;
      this.layoutBoard();
      const top = this.topH(), ct = this.ctl.getBoundingClientRect();
      let rect;
      if (this.vert) { this.board.style.bottom = (innerHeight - ct.top + 6) + 'px'; rect = Gfx.freeRect(top + 40, innerHeight - this.board.getBoundingClientRect().top + 6, 0, 0); }
      else { this.board.style.bottom = ''; const bd = this.board.getBoundingClientRect(); rect = { x: 6, y: top + 40, w: Math.max(120, bd.left - 16), h: innerHeight - top - 50 }; }
      const d = Gfx.fit(this.camera, this.R * 2.8, this.R * 1.9, rect, { pad: 1 });
      this.camera.position.set(0, d * 0.82, d * 0.6); this.camera.lookAt(0, 0, 0);
    }
    update(dt, t) {
      this.t = t; let busy = this.baseUpdate(dt, t);
      const S = this.spinA, R = this.R, spinning = !!(S && !S.done);
      if (spinning) this.psi = S.psi0 + 1.1 * Math.min(S.T, t - S.t0); else this.psi += dt * 0.35;
      this.rotor.rotation.y = this.psi;
      if (S && !S.done) {
        busy = true;
        const u = Math.min(1, (t - S.t0) / S.T);
        // Zielwinkel zum Ende: Fach-Winkel minus Tellerdrehung (siehe Herleitung: Weltwinkel = a − ψ)
        if (S.end == null) { const psiEnd = S.psi0 + 1.1 * S.T; let end = this.pocketAngle(S.n) - psiEnd; const turns = 6; while (end < S.a0 + turns * Math.PI * 2) end += Math.PI * 2; S.end = end; }
        this.ballA = S.a0 + (S.end - S.a0) * (1 - Math.pow(1 - u, 2.6));
        const fall = Math.max(0, Math.min(1, (u - 0.6) / 0.3));
        this.ballR = R * (1.06 - 0.33 * fall); this.ballY = 0.2 - 0.06 * fall + Math.abs(Math.sin(fall * Math.PI * 4)) * 0.12 * (1 - fall);
        if (fall > 0 && fall < 1 && Math.random() < dt * 10) sound.play('ball');
        if (u >= 1) { S.done = true; S.res && S.res(); }
      } else if (S && S.done) { this.ballA = this.pocketAngle(S.n) - this.psi; this.ballR = R * 0.73; this.ballY = 0.14; }
      this.placeBall();
      return busy;
    }
    leave() { super.leave(); if (this.spinA && this.spinA.res) this.spinA.res(); }
  }

  // ======================= BLACKJACK =======================
  class Blackjack extends Table {
    enter(hud) {
      this.setup(38); this.shoe = L.Shoe(6); this.state = 'bet'; this.betAmt = C.data.bjBet || 100; this.objs = [];
      this.felt(12, 8, g => {
        g.strokeStyle = 'rgba(255,215,120,.75)'; g.lineWidth = 4; g.beginPath(); g.arc(512, -420, 960, Math.PI * 0.32, Math.PI * 0.68); g.stroke();
        S.text(g, 'BLACKJACK ZAHLT 3 : 2', 512, 330, 34, 'rgba(255,225,150,.9)');
        S.text(g, 'BANK MUSS BIS 16 ZIEHEN UND AB 17 STEHEN', 512, 374, 20, 'rgba(255,225,150,.7)');
        g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 4; g.beginPath(); g.arc(512, 629, 40, 0, 7); g.stroke();
        S.text(g, 'ANMACHA CASINO', 512, 120, 30, 'rgba(255,225,150,.35)');
      });
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 1.5), new THREE.MeshStandardMaterial({ color: 0x5a0a1a, roughness: 0.35, metalness: 0.5 })); shoe.position.set(4.6, 0.3, -2.6); shoe.rotation.y = -0.3; this.scene.add(shoe);
      this.buildHud(hud); Gfx.set(this); C.input.setScreen(this.ctrl());
    }
    buildHud(hud) {
      hud.innerHTML = '';
      const wrap = el('div', 'bj'); hud.appendChild(wrap); this.wrap = wrap;
      this.msg = el('div', 'tmsg'); wrap.appendChild(this.msg);
      const ctl = el('div', 'tctl glass'); wrap.appendChild(ctl); this.ctl = ctl;
      this.chipsEl = this.chipBar(); ctl.appendChild(this.chipsEl);
      const b = el('div', 'tbtns');
      b.innerHTML = `<div class="betrow"><button class="pill" data-nav data-a="clear">LÖSCHEN</button><button class="pill" data-nav data-a="add">+ CHIP</button><div class="val"><small>EINSATZ</small><b class="tot"></b></div><button class="pill gold" data-nav data-default data-a="deal">AUSTEILEN</button></div>
        <div class="actrow" hidden><button class="pill gold" data-nav data-a="hit">KARTE</button><button class="pill" data-nav data-a="stand">HALTEN</button><button class="pill" data-nav data-a="double">VERDOPPELN</button><button class="pill" data-nav data-a="split">TEILEN</button></div>`;
      ctl.appendChild(b); this.btns = b;
      this.chipsEl.addEventListener('click', e => { if (e.target.closest('.chip') && this.state === 'bet') this.addChip(); });
      b.addEventListener('click', e => { const x = e.target.closest('[data-a]'); if (!x || x.disabled) return; sound.play('click');
        ({ clear: () => { this.betAmt = 0; this.refresh(); }, add: () => this.addChip(), deal: () => this.deal(), hit: () => this.hit(), stand: () => this.stand(), double: () => this.double(), split: () => this.split() })[x.dataset.a](); });
      this.refresh(); this.say('Setze deinen Einsatz und tippe auf AUSTEILEN.');
    }
    addChip() { if (this.state !== 'bet') return; const n = this.betAmt + this.chip; if (n > Math.min(wallet.bal, 20000)) { C.toast(n > 20000 ? 'Höchsteinsatz ' + fmt(20000) : 'Nicht genug Guthaben'); return; } this.betAmt = n; this.refresh(); }
    say(t) { this.text = t; this.msg.innerHTML = (this.totals && this.state !== 'bet' ? `<div class="tl">${this.totals}</div>` : '') + `<div>${t}</div>`; }
    refresh() {
      const bet = this.state === 'bet', play = this.state === 'play';
      this.btns.querySelector('.betrow').hidden = !bet; this.btns.querySelector('.actrow').hidden = !play; this.chipsEl.hidden = !bet;
      this.btns.querySelector('.tot').textContent = fmt(this.betAmt);
      this.btns.querySelector('[data-a=deal]').disabled = !this.betAmt;
      if (play) { const h = this.hands[this.hi]; this.btns.querySelector('[data-a=double]').disabled = !(h.cards.length === 2 && wallet.can(h.bet) && !h.aces);
        this.btns.querySelector('[data-a=split]').disabled = !(L.bjCanSplit(h, this.hands) && wallet.can(h.bet)); }
      if (C.input.screen && document.body.classList.contains('kbd')) C.input.ensureFocus();
    }
    clearTable() { this.objs.forEach(o => this.removeObj(o)); this.objs = []; }
    async dealCard(c, x, z, faceUp, delay) {
      const m = this.card(c); m.position.set(4.6, 0.7, -2.6); m.rotation.set(Math.PI / 2, 0, -0.3); this.objs.push(m);
      sound.play('card');
      await this.tween(m, { x, y: 0.02 + this.objs.length * 0.002, z, rx: faceUp ? -Math.PI / 2 : Math.PI / 2, rz: 0 }, 0.45, { arc: 0.6, delay: delay || 0 });
      return m;
    }
    handX(i, n, k) { const spread = 0.55; const base = n === 1 ? 0 : (i === 0 ? -2.2 : 2.2); return base + (k - 0.5) * spread; }
    async deal() {
      if (this.state !== 'bet' || !this.betAmt) return;
      if (this.shoe.low()) { this.shoe.fill(); C.toast('Neuer Kartenschlitten'); }
      if (!wallet.take(this.betAmt)) { this.app.noMoney(this.betAmt); return; }
      C.data.bjBet = this.betAmt; C.save();
      this.clearTable(); this.state = 'deal'; this.paid = false; this.refresh();
      this.hands = [{ cards: [], bet: this.betAmt, meshes: [], split: false }]; this.hi = 0; this.dealer = []; this.dMesh = [];
      this.stack = this.chipStack(this.betAmt, 0, 2.55); this.objs.push(this.stack);
      const h = this.hands[0];
      for (let i = 0; i < 4; i++) {
        const c = this.shoe.draw();
        if (i % 2 === 0) { h.cards.push(c); h.meshes.push(await this.dealCard(c, this.handX(0, 1, h.cards.length - 1), 1.35 - (h.cards.length - 1) * 0.02, true)); }
        else { this.dealer.push(c); this.dMesh.push(await this.dealCard(c, (this.dealer.length - 1) * 0.6 - 0.3, -1.7, i === 1)); }
      }
      this.showTotals();
      const dBJ = L.bjIsBlackjack(this.dealer, false), pBJ = L.bjIsBlackjack(h.cards, false);
      const up = L.rank(this.dealer[0]);
      if (pBJ || (dBJ && (up === 0 || up >= 9))) { await this.reveal(); return this.finish(); }
      this.state = 'play'; this.refresh(); this.showTotals(); this.say('Karte ziehen oder halten?');
    }
    showTotals(final) {
      const hv = this.hands.map((h, i) => { const v = L.bjValue(h.cards); return `<b class="${i === this.hi && this.state === 'play' ? 'cur' : ''}">${v.soft && v.total < 21 ? (v.total - 10) + '/' + v.total : v.total}</b>`; }).join(' · ');
      const dv = final ? L.bjValue(this.dealer).total : L.bjValue([this.dealer[0]]).total;
      this.totals = `Bank: <b>${dv}</b> &nbsp;|&nbsp; Du: ${hv}`; this.say(this.text || '');
    }
    async hit() {
      if (this.state !== 'play') return; this.state = 'anim'; this.refresh();
      const h = this.hands[this.hi], c = this.shoe.draw(); h.cards.push(c);
      h.meshes.push(await this.dealCard(c, this.handX(this.hi, this.hands.length, h.cards.length - 1), 1.35 - (h.cards.length - 1) * 0.02 + (h.cards.length - 1) * 0.0, true));
      this.relayHand(this.hi);
      const v = L.bjValue(h.cards).total; this.showTotals();
      if (v > 21) { this.say('Überkauft!'); sound.play('lose'); await this.pause(500); return this.nextHand(); }
      if (v === 21 || h.aces) return this.nextHand();
      this.state = 'play'; this.refresh(); this.say('Karte ziehen oder halten?');
    }
    relayHand(i) { const h = this.hands[i]; h.meshes.forEach((m, k) => this.tween(m, { x: this.handX(i, this.hands.length, k) }, 0.25)); }
    stand() { if (this.state !== 'play') return; this.nextHand(); }
    async double() {
      const h = this.hands[this.hi]; if (this.state !== 'play' || h.cards.length !== 2 || !wallet.take(h.bet)) return;
      h.bet *= 2; h.doubled = true; this.refreshStack();
      this.state = 'anim'; this.refresh(); const c = this.shoe.draw(); h.cards.push(c);
      const m = await this.dealCard(c, this.handX(this.hi, this.hands.length, 2), 1.33, true); m.rotation.z = Math.PI / 2; h.meshes.push(m);
      this.showTotals(); await this.pause(300); this.nextHand();
    }
    async split() {
      const h = this.hands[this.hi]; if (this.state !== 'play' || !L.bjCanSplit(h, this.hands) || !wallet.take(h.bet)) return;
      this.state = 'anim'; this.refresh();
      const h2 = { cards: [h.cards.pop()], bet: h.bet, meshes: [h.meshes.pop()], split: true }; h.split = true;
      this.hands.push(h2); const aces = L.rank(h.cards[0]) === 0; h.aces = h2.aces = aces;
      this.relayHand(0); this.relayHand(1); this.refreshStack();
      for (let i = 0; i < 2; i++) { const hh = this.hands[i], c = this.shoe.draw(); hh.cards.push(c); hh.meshes.push(await this.dealCard(c, this.handX(i, 2, 1), 1.33, true)); }
      this.showTotals();
      if (aces) { this.hi = 1; return this.nextHand(); }
      if (L.bjValue(h.cards).total === 21) return this.nextHand();
      this.state = 'play'; this.refresh(); this.say('Erste Hand: Karte oder halten?');
    }
    refreshStack() { this.removeObj(this.stack); this.objs = this.objs.filter(o => o !== this.stack); this.stack = this.chipStack(this.hands.reduce((a, h) => a + h.bet, 0), 0, 2.55); this.objs.push(this.stack); }
    async nextHand() {
      if (this.hi < this.hands.length - 1) { this.hi++; const h = this.hands[this.hi]; if (L.bjValue(h.cards).total === 21) return this.nextHand(); this.state = 'play'; this.showTotals(); this.refresh(); this.say('Zweite Hand: Karte oder halten?'); return; }
      this.state = 'anim'; this.refresh();
      await this.reveal();
      const allBust = this.hands.every(h => L.bjValue(h.cards).total > 21);
      while (!allBust && L.bjDealerShouldHit(this.dealer)) {
        const c = this.shoe.draw(); this.dealer.push(c); this.dMesh.push(await this.dealCard(c, (this.dealer.length - 1) * 0.6 - 0.3, -1.7, true)); this.showTotals(true); await this.pause(250);
      }
      this.finish();
    }
    async reveal() { const m = this.dMesh[1]; if (m && m.rotation.x > 0) { sound.play('card'); await this.tween(m, { rx: -Math.PI / 2 }, 0.35, { arc: 0.3 }); } this.showTotals(true); }
    // Spiel verlassen mitten in der Hand: offene Hände bleiben stehen, die Bank zieht zu Ende, Auszahlung sofort.
    settle() {
      if (this.paid !== false) return;
      for (const h of this.hands) while (h.cards.length < 2) h.cards.push(this.shoe.draw());
      while (this.dealer.length < 2) this.dealer.push(this.shoe.draw());
      if (!this.hands.every(h => L.bjValue(h.cards).total > 21)) while (L.bjDealerShouldHit(this.dealer)) this.dealer.push(this.shoe.draw());
      this.paid = true; wallet.give(this.hands.reduce((a, h) => a + L.bjSettle(h, this.dealer).ret, 0));
    }
    async finish() {
      if (this.paid !== false) return;
      this.state = 'anim';
      let ret = 0, bet = 0; const res = [];
      for (const h of this.hands) { const r = L.bjSettle(h, this.dealer); ret += r.ret; bet += h.bet; res.push(r.res); }
      this.paid = true; wallet.give(ret);
      const word = { bj: 'BLACKJACK!', win: 'Gewonnen', push: 'Unentschieden', lose: 'Verloren' };
      this.showTotals(true);
      this.say(`<span class="big">${res.map(r => word[r]).join(' · ')}</span>` + (ret ? ` &nbsp;+${fmt(ret)}` : ''));
      sound.play(ret > bet ? 'win' : ret === bet ? 'click' : 'lose');
      await this.celebrate(ret, ret / Math.max(1, bet) * 3);
      await this.pause(1400);
      if (this.dead) return;
      this.state = 'bet'; this.totals = ''; if (this.betAmt > wallet.bal) this.betAmt = 0; this.refresh(); this.say('Neue Runde: Einsatz wählen und AUSTEILEN.');
    }
    ctrl() {
      return { root: this.wrap, primary: () => (this.state === 'bet' ? this.deal() : this.state === 'play' ? this.hit() : null), secondary: () => (this.state === 'play' ? this.stand() : this.addChip()),
        info: () => C.modal(`<h2>Blackjack</h2><p>Komme näher an 21 als die Bank, ohne zu überkaufen. Bildkarten zählen 10, Asse 1 oder 11.</p><p>Blackjack (Ass + 10er) zahlt <b>3 : 2</b>, ein normaler Sieg 1 : 1. Die Bank zieht bis 16 und steht ab 17. Verdoppeln auf den ersten zwei Karten, einmal Teilen bei gleichem Wert (geteilte Asse bekommen je eine Karte).</p><p class="muted small">6 Kartendecks, Auszahlungsquote ca. 99,5 % bei guter Spielweise. Nur Spielgeld.</p>`),
        back: () => this.app.home() };
    }
    resize() {
      if (!this.camera) return;
      const top = this.topH(), bottom = innerHeight - this.ctl.getBoundingClientRect().top;
      const rect = Gfx.freeRect(top + 30, bottom + 4, 0, 0);
      const port = rect.w < rect.h, flat = !port && rect.h < 320;      // flaches Querformat: näher ran, Bank-Karten unter die Anzeige
      const d = Gfx.fit(this.camera, port ? 5.6 : 8.6, port ? 5.2 : (flat ? 4.3 : 6.2), rect, { pad: 1 });
      this.camera.position.set(0, d * (port ? 0.95 : 0.86), d * (port ? 0.36 : 0.52) + 0.6); this.camera.lookAt(0, 0, port ? 0.1 : (flat ? -0.35 : 0.35));
    }
    update(dt, t) { return this.baseUpdate(dt, t); }
  }

  // ======================= VIDEO-POKER =======================
  class Poker extends Table {
    enter(hud) {
      this.setup(36); this.state = 'idle'; this.held = [false, false, false, false, false]; this.meshes = []; this.cards = [];
      this.bets = G.CasinoSlot.BETS.filter(b => b >= 10 && b <= 5000); this.betI = Math.max(0, this.bets.indexOf(C.data.vpBet || 100));
      this.felt(9, 6, g => { S.text(g, 'JACKS OR BETTER', 512, 610, 44, 'rgba(255,225,150,.45)'); });
      for (let i = 0; i < 5; i++) { const m = this.card(-1); m.position.set(this.cx(i), 0.02, 0.2); m.rotation.set(Math.PI / 2, 0, 0); this.meshes.push(m); }
      this.ray = new THREE.Raycaster(); this.ptr = new THREE.Vector2();
      this.onCanvas = e => { if (this.state !== 'hold') return; this.ptr.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); this.ray.setFromCamera(this.ptr, this.camera);
        const hit = this.ray.intersectObjects(this.meshes, true)[0]; if (hit) { let o = hit.object; while (o.parent && !this.meshes.includes(o)) o = o.parent; this.toggle(this.meshes.indexOf(o)); } };
      document.getElementById('gl').addEventListener('click', this.onCanvas);
      this.buildHud(hud); Gfx.set(this); C.input.setScreen(this.ctrl());
    }
    cx(i) { return (i - 2) * 1.12; }
    get bet() { return this.bets[this.betI]; }
    buildHud(hud) {
      hud.innerHTML = '';
      const wrap = el('div', 'vp'); hud.appendChild(wrap); this.wrap = wrap;
      this.pt = el('div', 'vptable glass'); wrap.appendChild(this.pt);
      this.holds = el('div', 'holds'); wrap.appendChild(this.holds);
      for (let i = 0; i < 5; i++) { const b = el('button', 'hold', 'HALTEN'); b.setAttribute('data-nav', ''); b.dataset.i = i; this.holds.appendChild(b); }
      this.holds.addEventListener('click', e => { const b = e.target.closest('.hold'); if (b) this.toggle(+b.dataset.i); });
      this.msg = el('div', 'tmsg'); wrap.appendChild(this.msg);
      const ctl = el('div', 'tctl glass'); wrap.appendChild(ctl); this.ctl = ctl;
      ctl.innerHTML = `<div class="tbtns"><div class="betbox"><button class="ib sm" data-nav data-a="down">−</button><div class="val"><small>EINSATZ</small><b class="tot"></b></div><button class="ib sm" data-nav data-a="up">+</button></div>
        <button class="pill gold" data-nav data-default data-a="go">GEBEN</button></div>`;
      ctl.addEventListener('click', e => { const x = e.target.closest('[data-a]'); if (!x || x.disabled) return; sound.play('click'); ({ down: () => this.chBet(-1), up: () => this.chBet(1), go: () => this.go() })[x.dataset.a](); });
      this.refresh(); this.say('Tippe auf GEBEN.');
    }
    chBet(d) { if (this.state === 'hold' || this.state === 'anim') return; this.betI = Math.max(0, Math.min(this.bets.length - 1, this.betI + d)); C.data.vpBet = this.bet; C.save(); this.refresh(); }
    say(t) { this.msg.innerHTML = t; }
    refresh(hl) {
      this.ctl.querySelector('.tot').textContent = fmt(this.bet);
      const go = this.ctl.querySelector('[data-a=go]'); go.textContent = this.state === 'hold' ? 'ZIEHEN' : 'GEBEN'; go.disabled = this.state === 'anim';
      this.ctl.querySelectorAll('.sm').forEach(b => { b.disabled = this.state === 'hold' || this.state === 'anim'; });
      this.pt.innerHTML = L.POKER.map(p => `<div class="${p[0] === hl ? 'hl' : ''}"><span>${p[1]}</span><b>${C.short(p[2] * this.bet)}</b></div>`).join('');
      this.holds.querySelectorAll('.hold').forEach((b, i) => { b.classList.toggle('on', this.held[i]); b.disabled = this.state !== 'hold'; b.textContent = this.held[i] ? 'GEHALTEN' : 'HALTEN'; });
    }
    toggle(i) { if (this.state !== 'hold' || i < 0) return; this.held[i] = !this.held[i]; sound.play('click'); const m = this.meshes[i]; this.tween(m, { z: this.held[i] ? -0.25 : 0.2, y: this.held[i] ? 0.12 : 0.02 }, 0.18); this.refresh(); }
    async go() {
      if (this.state === 'anim') return;
      if (this.state !== 'hold') {
        if (!wallet.take(this.bet)) { this.app.noMoney(this.bet); return; }
        this.state = 'anim'; this.paid = this.drawn = false; this.held = [false, false, false, false, false]; this.refresh(); this.say('');
        const deck = L.shuffle([...Array(52).keys()]); this.deck = deck; this.cards = deck.splice(0, 5);
        await Promise.all(this.meshes.map((m, i) => this.tween(m, { rx: Math.PI / 2, z: 0.2, y: 0.02 }, 0.2)));
        for (let i = 0; i < 5; i++) { this.setCard(this.meshes[i], this.cards[i]); sound.play('card'); this.tween(this.meshes[i], { rx: -Math.PI / 2 }, 0.3, { arc: 0.4, delay: i * 0.08 }); }
        await this.pause(700 * (C.data.turbo ? 0.55 : 1));
        const ev = L.pokerEval(this.cards);
        this.state = 'hold'; this.refresh(ev.id); this.say(ev.id ? `<b>${ev.name}</b> – Karten halten und ZIEHEN` : 'Karten halten und ZIEHEN');
        return;
      }
      this.state = 'anim'; this.refresh();
      const flips = [];
      for (let i = 0; i < 5; i++) if (!this.held[i]) { this.cards[i] = this.deck.pop(); flips.push(i); }
      this.drawn = true;
      await Promise.all(flips.map(i => this.tween(this.meshes[i], { rx: Math.PI / 2 }, 0.18)));
      flips.forEach((i, k) => { this.setCard(this.meshes[i], this.cards[i]); sound.play('card'); this.tween(this.meshes[i], { rx: -Math.PI / 2 }, 0.3, { arc: 0.4, delay: k * 0.08 }); });
      await this.pause(450 + flips.length * 80);
      const ev = L.pokerEval(this.cards), ret = ev.mult * this.bet;
      this.paid = true; wallet.give(ret);
      this.say(ev.id ? `<span class="big">${ev.name}</span> &nbsp;+${fmt(ret)}` : 'Kein Gewinn – nochmal?');
      sound.play(ret ? 'win' : 'lose');
      this.held = [false, false, false, false, false]; this.meshes.forEach(m => this.tween(m, { z: 0.2, y: 0.02 }, 0.2));
      this.state = 'done'; this.refresh(ev.id);
      await this.celebrate(ret, ev.mult);
    }
    ctrl() { return { root: this.wrap, primary: () => this.go(), secondary: () => {}, betDown: () => this.chBet(-1), betUp: () => this.chBet(1),
      info: () => C.modal('<h2>Video-Poker</h2><p>„Jacks or Better“: Du bekommst 5 Karten, hältst die guten (antippen) und ziehst für die anderen neue. Gewinn ab einem Paar Buben.</p><p class="muted small">Gewinntabelle 9/6, Auszahlungsquote ca. 99,5 % bei bester Spielweise. Nur Spielgeld.</p>'),
      back: () => this.app.home(), pad: null }; }
    resize() {
      if (!this.camera) return;
      const ct = this.ctl.getBoundingClientRect(); this.holds.style.bottom = (innerHeight - ct.top + 50) + 'px'; this.msg.style.bottom = (innerHeight - ct.top + 6) + 'px';
      const side = innerHeight <= 560 && innerWidth > innerHeight * 1.4;   // flaches Querformat: Gewinntabelle links daneben
      this.pt.classList.toggle('side', side);
      const top = this.topH() + (side ? 4 : this.pt.offsetHeight + 8), bottom = innerHeight - this.holds.getBoundingClientRect().top;
      const rect = Gfx.freeRect(top, bottom + 6, side ? this.pt.getBoundingClientRect().right + 4 : 0, 0);
      const d = Gfx.fit(this.camera, 6, 1.9, rect, { pad: 1.02 });
      this.camera.position.set(0, d * 0.94, d * 0.34); this.camera.lookAt(0, 0, 0); this.camera.updateMatrixWorld();
      const ps = [0, 1, 2, 3, 4].map(i => Gfx.project(this.camera, this.cx(i), 0, 0.2));
      const bw = Math.max(40, Math.min(110, (ps[4].x - ps[0].x) / 4 - 6));     // nie breiter als der Kartenabstand
      this.holds.classList.toggle('tight', bw < 70);
      this.holds.querySelectorAll('.hold').forEach((b, i) => { b.style.left = (ps[i].x - bw / 2) + 'px'; b.style.width = bw + 'px'; });
    }
    update(dt, t) { return this.baseUpdate(dt, t); }
    // Spiel verlassen mitten in der Runde: mit den gehaltenen Karten ziehen und sofort auszahlen.
    settle() {
      if (this.paid !== false) return;
      if (!this.drawn) for (let i = 0; i < 5; i++) if (!this.held[i]) this.cards[i] = this.deck.pop();
      this.paid = true; wallet.give(L.pokerEval(this.cards).mult * this.bet);
    }
    leave() { document.getElementById('gl').removeEventListener('click', this.onCanvas); super.leave(); }
  }

  // ======================= GLÜCKSRAD =======================
  class Wheel extends Table {
    enter(hud) {
      this.setup(34); this.bets = {}; this.last = null;
      const N = 54, da = Math.PI * 2 / N; this.da = da;
      const COL = { 1: '#f59e0b', 2: '#3b82f6', 5: '#a855f7', 10: '#22c55e', 20: '#ef4444', star: '#111827', logo: '#ff2d95' };
      const c = Gfx.canvas(1024, 1024), g = c.getContext('2d'); g.translate(512, 512);
      g.fillStyle = '#2a1508'; g.beginPath(); g.arc(0, 0, 512, 0, 7); g.fill();
      L.WHEEL_SEGS.forEach((k, i) => {
        const a = -Math.PI / 2 + i * da, a0 = a - da / 2, a1 = a + da / 2;
        g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 490, a0, a1); g.closePath(); g.fillStyle = COL[k]; g.fill(); g.strokeStyle = '#ffd36b'; g.lineWidth = 3; g.stroke();
        g.save(); g.rotate(a); g.translate(400, 0); g.rotate(Math.PI / 2); S.text(g, k === 'star' ? '★' : k === 'logo' ? 'A' : k, 0, 0, k.length > 1 && k !== 'star' && k !== 'logo' ? 40 : 46, '#fff', 'rgba(0,0,0,.6)', 6); g.restore();
      });
      g.fillStyle = S.rg(g, 0, 0, 10, 160, '#fff3c0', '#d4a017', '#6a4a00'); g.beginPath(); g.arc(0, 0, 150, 0, 7); g.fill(); S.text(g, 'ANMACHA', 0, 4, 46, '#3a1c00');
      const wheel = new THREE.Mesh(new THREE.CircleGeometry(2.6, 108), new THREE.MeshStandardMaterial({ map: Gfx.canvasTex(c), roughness: 0.45, metalness: 0.1 }));
      this.scene.add(wheel); this.wheel = wheel; wheel.position.y = 0.4;
      const rim = new THREE.Mesh(new THREE.TorusGeometry(2.62, 0.12, 12, 96), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 })); rim.position.copy(wheel.position); this.scene.add(rim);
      const pegM = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.8, roughness: 0.2 });
      this.pegs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 8), pegM, N); const mx = new THREE.Matrix4();
      for (let i = 0; i < N; i++) { const a = Math.PI / 2 - i * da - da / 2; mx.makeRotationX(Math.PI / 2); mx.setPosition(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0.08); this.pegs.setMatrixAt(i, mx); }
      wheel.add(this.pegs); this.pegs.position.y = 0;
      const ptr = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 3), new THREE.MeshStandardMaterial({ color: 0xff2d55, metalness: 0.4, roughness: 0.3 })); ptr.rotation.z = Math.PI; ptr.position.set(0, 0.4 + 2.85, 0.2); this.scene.add(ptr); this.ptr = ptr;
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.6, 1.6, 24), new THREE.MeshStandardMaterial({ color: 0x3a1c0a, metalness: 0.3, roughness: 0.5 })); stand.position.set(0, -2.9, -0.4); this.scene.add(stand);
      this.phi = 0; wheel.rotation.z = 0; this.lastPeg = 0;
      this.buildHud(hud); Gfx.set(this); C.input.setScreen(this.ctrl());
    }
    buildHud(hud) {
      hud.innerHTML = '';
      const wrap = el('div', 'wh'); hud.appendChild(wrap); this.wrap = wrap;
      this.msg = el('div', 'tmsg'); wrap.appendChild(this.msg);
      const fields = el('div', 'wfields'); wrap.appendChild(fields); this.fields = fields;
      fields.innerHTML = L.WHEEL_VALUES.map(v => `<button class="wf k${v[0]}" data-nav data-bet="${v[0]}"><span>${v[0] === 'star' ? '★' : v[0] === 'logo' ? 'A' : v[0]}</span><small>${v[1]} : 1</small><i class="bchip" hidden></i></button>`).join('');
      fields.addEventListener('click', e => { const b = e.target.closest('[data-bet]'); if (b) this.place(b.dataset.bet); });
      const ctl = el('div', 'tctl glass'); wrap.appendChild(ctl); this.ctl = ctl;
      ctl.appendChild(this.chipBar());
      const b = el('div', 'tbtns', `<button class="pill" data-nav data-a="clear">LÖSCHEN</button><button class="pill" data-nav data-a="rebet">WIEDERHOLEN</button><div class="val"><small>EINSATZ</small><b class="tot">0</b></div><button class="pill gold" data-nav data-default data-a="spin">DREHEN</button>`);
      ctl.appendChild(b);
      b.addEventListener('click', e => { const x = e.target.closest('[data-a]'); if (!x || x.disabled) return; sound.play('click'); ({ clear: () => { this.bets = {}; this.refresh(); }, rebet: () => this.rebet(), spin: () => this.spin() })[x.dataset.a](); });
      this.refresh(); this.say('Setze auf eine Zahl und lass das Rad drehen.');
    }
    say(t) { this.msg.innerHTML = t; }
    total() { let t = 0; for (const k in this.bets) t += this.bets[k]; return t; }
    place(k) { if (this.spinning) return; if (this.total() + this.chip > wallet.bal) { C.toast('Nicht genug Guthaben'); return; } this.bets[k] = (this.bets[k] || 0) + this.chip; sound.play('chip'); this.fields.querySelectorAll('.hit').forEach(x => x.classList.remove('hit')); this.refresh(); }
    rebet() { if (this.spinning || !this.last) return; let t = 0; for (const k in this.last) t += this.last[k]; if (t > wallet.bal) { C.toast('Nicht genug Guthaben'); return; } this.bets = Object.assign({}, this.last); this.refresh(); }
    refresh() {
      this.fields.querySelectorAll('[data-bet]').forEach(b => { const v = this.bets[b.dataset.bet], i = b.querySelector('.bchip'); i.hidden = !v; if (v) i.textContent = C.short(v, true); });
      this.ctl.querySelector('.tot').textContent = fmt(this.total());
      this.ctl.querySelector('[data-a=spin]').disabled = this.spinning || !this.total();
      this.ctl.querySelector('[data-a=rebet]').disabled = this.spinning || !this.last;
    }
    async spin() {
      if (this.spinning || !this.total()) return;
      const tot = this.total(); if (!wallet.take(tot)) { this.app.noMoney(tot); return; }
      this.spinning = true; this.refresh(); this.say('');
      const i = L.wheelSpin(), key = L.WHEEL_SEGS[i], ret = L.wheelPayout(this.bets, key);
      wallet.give(ret, true); this.last = Object.assign({}, this.bets);
      const tgt = i * this.da + (Math.random() - 0.5) * this.da * 0.7; let end = tgt; while (end < this.phi + Math.PI * 2 * 4) end += Math.PI * 2;
      this.anim = { t0: this.t, T: C.data.turbo ? 3 : 5.2, a: this.phi, b: end };
      await new Promise(r => { this.anim.res = r; });
      if (this.dead) return;
      this.fields.querySelector(`[data-bet="${key}"]`).classList.add('hit');
      this.say(`Das Rad zeigt <b>${key === 'star' ? '★' : key === 'logo' ? 'A' : key}</b> ` + (ret ? `– Gewinn <b>${fmt(ret)}</b>` : '– leider nichts'));
      wallet.reveal(); sound.play(ret ? 'win' : 'lose');
      await this.celebrate(ret, ret / tot);
      this.bets = {}; this.spinning = false; this.refresh();
    }
    ctrl() { return { root: this.wrap, primary: () => this.spin(), secondary: () => this.rebet(),
      info: () => C.modal(`<h2>Glücksrad</h2><p>Das Rad hat 54 Felder: 24× „1“, 15× „2“, 7× „5“, 4× „10“, 2× „20“ und je einmal ★ und A. Setze auf ein oder mehrere Felder; zeigt der Zeiger darauf, gewinnst du den aufgedruckten Wert mal deinem Einsatz (plus Einsatz zurück).</p><p class="muted small">Nur Spielgeld.</p>`),
      back: () => this.app.home() }; }
    resize() {
      if (!this.camera) return;
      this.fields.style.bottom = (innerHeight - this.ctl.getBoundingClientRect().top + 8) + 'px';
      const top = this.topH() + this.msg.offsetHeight, bottom = innerHeight - this.fields.getBoundingClientRect().top;
      const rect = Gfx.freeRect(top + 4, bottom + 4, 0, 0);
      const d = Gfx.fit(this.camera, 6, 6.4, rect, { pad: 1 });
      this.camera.position.set(0, 0.2, d); this.camera.lookAt(0, 0.2, 0);
    }
    update(dt, t) {
      this.t = t; let busy = this.baseUpdate(dt, t);
      const A = this.anim;
      if (A) {
        busy = true; const u = Math.min(1, (t - A.t0) / A.T); this.phi = A.a + (A.b - A.a) * (1 - Math.pow(1 - u, 3.2));
        const peg = Math.floor((this.phi + this.da / 2) / this.da); if (peg !== this.lastPeg) { this.lastPeg = peg; sound.play('tick'); this.ptr.rotation.z = Math.PI + 0.25; }
        if (u >= 1) { this.anim = null; A.res(); }
      }
      this.ptr.rotation.z += (Math.PI - this.ptr.rotation.z) * Math.min(1, dt * 12);
      this.wheel.rotation.z = this.phi;
      return busy;
    }
    leave() { super.leave(); if (this.anim && this.anim.res) this.anim.res(); }
  }

  G.CasinoTables = { Roulette, Blackjack, Poker, Wheel, cardCanvas, CHIPS };
})(window);
