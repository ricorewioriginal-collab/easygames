'use strict';
/* AnMaCha Casino – Lobby, Navigation zwischen den Spielen, gemeinsame Einblendungen (Big Win, Freispiele, Risiko). */
(function (G) {
  const THREE = G.THREE, Gfx = G.CasinoGfx, S = G.CasinoSymbols, L = G.CasinoLogic, C = G.CasinoCore, T = G.CasinoTables;
  const { $, el, fmt, wallet, sound, wait } = C;
  const MACHINES = G.CasinoMachines.MACHINES;
  const TABLES = [
    { id: 'roulette', title: 'Roulette', tag: 'Europäisch · 3D-Kessel', cls: T.Roulette, theme: { a: '#d4af37', b: '#c8102e', c: '#0a8a3a', bg: '#0a1a10', tile: ['#123', '#012'] } },
    { id: 'blackjack', title: 'Blackjack', tag: '3 : 2 · Teilen & Verdoppeln', cls: T.Blackjack, theme: { a: '#ffd24a', b: '#0f766e', c: '#22c55e', bg: '#04140c', tile: ['#0b3', '#021'] } },
    { id: 'poker', title: 'Video-Poker', tag: 'Jacks or Better 9/6', cls: T.Poker, theme: { a: '#60a5fa', b: '#7c3aed', c: '#22d3ee', bg: '#070b24', tile: ['#123', '#012'] } },
    { id: 'wheel', title: 'Glücksrad', tag: 'Money Wheel · bis 40 : 1', cls: T.Wheel, theme: { a: '#ffd24a', b: '#ff2d95', c: '#3b82f6', bg: '#1a0820', tile: ['#123', '#012'] } }
  ];
  const hud = $('#hud'), lobbyEl = $('#lobby'), topTitle = $('#ttl');
  let current = null, lobbyScene = null, filter = C.data.filter || 'all';

  // ---------- Kopfleiste ----------
  const balEl = $('#bal b');
  let shownBal = wallet.shown, balAnim = 0;
  wallet.on(v => {
    cancelAnimationFrame(balAnim); const from = shownBal, t0 = performance.now(), dur = Math.min(900, 200 + Math.abs(v - from) / 20);
    const step = now => { const k = Math.min(1, (now - t0) / dur); shownBal = from + (v - from) * k; balEl.textContent = fmt(shownBal); if (k < 1) balAnim = requestAnimationFrame(step); };
    balAnim = requestAnimationFrame(step);
  });
  balEl.textContent = fmt(wallet.shown);
  const sndBtn = $('#snd');
  const setSndIcon = () => { sndBtn.textContent = sound.on ? '🔊' : '🔇'; };
  setSndIcon();
  sndBtn.onclick = () => App.toggleSound();
  $('#back').onclick = () => { sound.play('click'); if (current) App.home(); else if (inFrame()) history.back(); else location.href = '../'; };
  $('#fs').onclick = () => { const d = document; try { if (d.fullscreenElement) d.exitFullscreen(); else d.documentElement.requestFullscreen({ navigationUI: 'hide' }); } catch (e) { /* nicht unterstützt */ } };
  if (!document.documentElement.requestFullscreen) $('#fs').hidden = true;
  function inFrame() { try { return top !== self; } catch (e) { return true; } }

  // ---------- Lobby ----------
  function cardArt(def, kind) {
    const c = Gfx.canvas(480, 300), g = c.getContext('2d'), th = def.theme;
    g.fillStyle = S.lg(g, 0, 0, 480, 300, th.bg, '#05030b'); g.fillRect(0, 0, 480, 300);
    g.globalAlpha = 0.55; g.fillStyle = S.rg(g, 240, 120, 10, 300, th.b, 'rgba(0,0,0,0)'); g.fillRect(0, 0, 480, 300); g.globalAlpha = 1;
    g.globalAlpha = 0.25; for (let i = 0; i < 12; i++) { g.strokeStyle = i % 2 ? th.a : th.c; g.lineWidth = 2; g.beginPath(); g.moveTo(240, 330); g.lineTo(i * 44 - 20, -10); g.stroke(); } g.globalAlpha = 1;
    if (kind === 'slot') {
      const m = def, pick = m.symbols.filter(s => s.pay).slice(0, 3), arts = pick.map(s => s.art || s.id);
      const show = m.cover || [arts[1] || arts[0], arts[0], arts[2] || arts[0]];
      show.forEach((a, i) => { g.save(); const x = 70 + i * 120, y = i === 1 ? 50 : 72, sz = i === 1 ? 150 : 120; g.translate(x + (i === 1 ? -15 : 0), y); g.scale(sz / 200, sz / 200); S.drawArt(g, a); g.restore(); });
    } else if (def.id === 'roulette') {
      g.save(); g.translate(240, 120); for (let i = 0; i < 37; i++) { const a0 = i / 37 * Math.PI * 2, a1 = (i + 1) / 37 * Math.PI * 2, n = L.WHEEL[i]; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 105, a0, a1); g.fillStyle = n === 0 ? '#0a8a3a' : L.RED.has(n) ? '#c8102e' : '#151515'; g.fill(); }
      g.fillStyle = S.rg(g, 0, 0, 5, 70, '#c08a3a', '#3a1c0a'); g.beginPath(); g.arc(0, 0, 66, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#d4af37'; g.beginPath(); g.arc(0, 0, 108, 0, 7); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(70, -58, 9, 0, 7); g.fill(); g.restore();
    } else if (def.id === 'blackjack' || def.id === 'poker') {
      const cards = def.id === 'blackjack' ? [0, 12 + 13] : [0, 12, 11, 10, 9].map(r => r + 26);
      cards.forEach((cc, i) => { const cv = T.cardCanvas(cc, def.theme); g.save(); const n = cards.length; g.translate(240 + (i - (n - 1) / 2) * (n > 2 ? 52 : 70), 140); g.rotate((i - (n - 1) / 2) * 0.16); g.drawImage(cv, -38 - 58, -2 - 90, 256 * 0.72, 256 * 0.72); g.restore(); });
    } else {
      g.save(); g.translate(240, 120); const segs = L.WHEEL_SEGS, COL = { 1: '#f59e0b', 2: '#3b82f6', 5: '#a855f7', 10: '#22c55e', 20: '#ef4444', star: '#111827', logo: '#ff2d95' };
      segs.forEach((k, i) => { const a = i / 54 * Math.PI * 2; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 108, a, a + Math.PI * 2 / 54); g.fillStyle = COL[k]; g.fill(); });
      g.lineWidth = 8; g.strokeStyle = '#d4af37'; g.beginPath(); g.arc(0, 0, 110, 0, 7); g.stroke(); g.fillStyle = '#ffd24a'; g.beginPath(); g.arc(0, 0, 30, 0, 7); g.fill();
      g.fillStyle = '#ff2d55'; g.beginPath(); g.moveTo(-14, -128); g.lineTo(14, -128); g.lineTo(0, -100); g.fill(); g.restore();
    }
    const grad = g.createLinearGradient(0, 200, 0, 300); grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,.85)'); g.fillStyle = grad; g.fillRect(0, 180, 480, 120);
    const t = def.title.toUpperCase(); let fs = 46; g.font = 'italic 900 46px ' + S.FONT; const tw = g.measureText(t).width; if (tw > 430) fs = Math.floor(46 * 430 / tw);
    S.text(g, t, 240, 252, fs, S.gold(g, 225, 280), '#1a0800', 7, true);
    return c;
  }
  function buildLobby() {
    const items = [...MACHINES.map(m => ({ def: m, kind: 'slot' })), ...TABLES.map(t => ({ def: t, kind: 'table' }))];
    lobbyEl.innerHTML = `
      <div class="hero"><div class="logo"><span>AnMaCha</span><b>CASINO</b></div>
        <div class="heroBtns"><button class="pill gold" data-nav id="daily">🎁 Tagesbonus</button><button class="pill" data-nav id="refill" hidden>💰 Spielgeld nachfüllen</button>
          <button class="pill" data-nav id="cur" title="Währung der Anzeige (nur Spielgeld)"></button><button class="pill" data-nav id="autofs" title="Spiele automatisch im Vollbild öffnen"></button></div></div>
      <div class="tabs" role="tablist"><button class="tab" data-nav data-f="all">Alle</button><button class="tab" data-nav data-f="slot">🎰 Slots</button><button class="tab" data-nav data-f="table">🃏 Tischspiele</button></div>
      <div class="grid"></div>
      <div id="cloudMount" class="cloudbox"></div>
      <p class="note">Nur Spielgeld – keine Einzahlung, keine Auszahlung, keine echten Gewinne. Ab 18 empfohlen. Steuerung: Touch, Maus, Tastatur (Pfeile, Enter, Leertaste, Esc) oder Gamecontroller (A wählen/drehen, B zurück, LB/RB Einsatz, Y Info).</p>`;
    const grid = lobbyEl.querySelector('.grid');
    items.forEach(({ def, kind }, i) => {
      const b = el('button', 'gcard ' + kind); b.setAttribute('data-nav', ''); if (i === 0) b.setAttribute('data-default', '');
      b.dataset.kind = kind; b.dataset.id = def.id; b.style.setProperty('--a', def.theme.a); b.style.setProperty('--b', def.theme.b);
      b.appendChild(cardArt(def, kind));
      if (def.cover && def.cover.some(a => a.startsWith('logo:'))) S.whenLogos(def.cover.filter(a => a.startsWith('logo:')).map(a => a.slice(5))).then(() => b.replaceChild(cardArt(def, kind), b.firstChild));
      b.appendChild(el('div', 'gmeta', `<b>${def.title}</b><small>${def.tag}</small>`));
      b.onclick = () => { sound.play('click'); location.hash = (kind === 'slot' ? 'slot/' : 'table/') + def.id; };
      grid.appendChild(b);
    });
    lobbyEl.querySelectorAll('.tab').forEach(t => { t.onclick = () => { filter = t.dataset.f; C.data.filter = filter; C.save(); applyFilter(); sound.play('click'); }; });
    $('#daily').onclick = () => {
      const today = new Date().toISOString().slice(0, 10);
      if (C.data.daily === today) { C.toast('Der Tagesbonus ist heute schon abgeholt – morgen wieder!'); return; }
      C.data.daily = today; wallet.give(2500); C.save(); sound.play('big'); C.toast('🎁 +' + fmt(2500) + ' Spielgeld'); refreshLobby();
    };
    $('#cur').onclick = () => { C.setCurrency(C.data.cur === 'USD' ? 'EUR' : 'USD'); sound.play('click'); balEl.textContent = fmt(wallet.shown); shownBal = wallet.shown; refreshLobby(); };
    $('#autofs').onclick = () => { C.data.autoFs = !C.data.autoFs; C.save(); sound.play('click'); refreshLobby(); };
    $('#refill').onclick = () => { wallet.refill(); sound.play('coin'); C.toast('💰 +' + fmt(wallet.START) + ' Spielgeld'); refreshLobby(); };
    applyFilter(); refreshLobby();
  }
  function applyFilter() { lobbyEl.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.f === filter)); lobbyEl.querySelectorAll('.gcard').forEach(c => { c.hidden = filter !== 'all' && c.dataset.kind !== filter; }); }
  function refreshLobby() {
    const today = new Date().toISOString().slice(0, 10);
    $('#daily').classList.toggle('done', C.data.daily === today); $('#daily').textContent = C.data.daily === today ? '✓ Bonus abgeholt' : '🎁 Tagesbonus +' + fmt(2500);
    $('#refill').hidden = wallet.bal >= 1000;
    $('#cur').textContent = C.data.cur === 'USD' ? '💲 Dollar' : '💶 Euro';
    $('#autofs').textContent = '⛶ Vollbild ' + (C.data.autoFs ? 'an' : 'aus'); $('#autofs').hidden = !document.fullscreenEnabled;
  }
  wallet.on(() => { if (!current) refreshLobby(); });

  function lobby3d() {
    if (!Gfx.ok) return null;
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100); camera.position.set(0, 0, 12);
    const th = { a: '#ffd24a', b: '#ff2d95', c: '#8b5cf6', bg: '#160a2c' };
    const bg = Gfx.backdrop(scene, th, { dots: 90 }); Gfx.lights(scene, th);
    const N = 26, geo = new THREE.CylinderGeometry(0.5, 0.5, 0.09, 28); geo.rotateX(Math.PI / 2);
    const coins = new THREE.InstancedMesh(geo, Gfx.coinMaterials(), N); scene.add(coins);
    const P = []; for (let i = 0; i < N; i++) P.push({ x: (Math.random() - 0.5) * 22, y: (Math.random() - 0.5) * 14, z: -2 - Math.random() * 6, r: Math.random() * 6, w: 0.3 + Math.random() * 0.8, v: 0.15 + Math.random() * 0.35 });
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
    return {
      scene, camera, idleFps: 30,
      resize() { camera.aspect = innerWidth / innerHeight; camera.clearViewOffset(); camera.updateProjectionMatrix(); },
      update(dt, t) {
        bg.update(t);
        for (let i = 0; i < N; i++) { const p = P[i]; p.y -= p.v * dt; if (p.y < -8) p.y = 8; m4.compose(v.set(p.x + Math.sin(t * 0.3 + i) * 0.4, p.y, p.z), q.setFromEuler(e.set(t * p.w + p.r, t * p.w * 0.6, 0)), s); coins.setMatrixAt(i, m4); }
        coins.instanceMatrix.needsUpdate = true; return false;
      },
      dispose() { Gfx.dispose(scene); }
    };
  }

  // ---------- Navigation ----------
  async function route() {
    const h = location.hash.replace(/^#/, ''); const [kind, id] = h.split('/');
    const def = kind === 'slot' ? MACHINES.find(m => m.id === id) : kind === 'table' ? TABLES.find(t => t.id === id) : null;
    if (current) { current.leave(); current = null; wallet.reveal(); }
    G.CasinoOverlay.closeAll();
    hud.innerHTML = '';
    if (!def) { showLobby(); return; }
    if (!Gfx.ok) { C.toast('3D wird von diesem Gerät nicht unterstützt'); location.hash = ''; return; }
    // Spiele im Vollbild: klappt nur direkt nach einer Berührung/einem Klick, sonst bleibt die Ansicht wie sie ist
    if (C.data.autoFs && document.fullscreenEnabled) {
      // Slots wie in der Spielhalle quer (geht nur im Vollbild, z. B. Android); Tischspiele dürfen auch hochkant
      const lock = () => { try { if (kind === 'slot' && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* nicht unterstützt */ } };
      if (document.fullscreenElement) lock();
      else { try { const p = document.documentElement.requestFullscreen({ navigationUI: 'hide' }); if (p && p.then) p.then(lock, () => {}); } catch (e) { /* nicht erlaubt */ } }
    }
    if (kind !== 'slot') unlockOrientation();
    lobbyEl.hidden = true; document.body.classList.add('ingame'); document.body.classList.remove('inlobby');
    topTitle.textContent = def.title; document.title = def.title + ' – AnMaCha Casino';
    if (lobbyScene) { lobbyScene.dispose(); lobbyScene = null; }
    current = kind === 'slot' ? new G.CasinoSlot.SlotScreen(def, App) : new def.cls(App, def);
    await current.enter(hud);
    if (current && current.resize) current.resize(innerWidth, innerHeight);
  }
  function unlockOrientation() { try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { /* nicht unterstützt */ } }
  function showLobby() {
    unlockOrientation();
    lobbyEl.hidden = false; document.body.classList.remove('ingame'); document.body.classList.add('inlobby');
    topTitle.textContent = 'AnMaCha Casino'; document.title = 'AnMaCha Casino';
    if (!lobbyScene) lobbyScene = lobby3d();
    if (lobbyScene) Gfx.set(lobbyScene);
    refreshLobby();
    C.input.setScreen({ root: lobbyEl, back: () => { if (!inFrame()) location.href = '../'; }, primary: null });
  }
  addEventListener('hashchange', route);
  addEventListener('resize', () => { if (current && current.resize) current.resize(innerWidth, innerHeight); });

  // ---------- gemeinsame Einblendungen ----------
  const App = {
    home() { if (location.hash) location.hash = ''; else route(); },
    toggleSound() { sound.on = !sound.on; setSndIcon(); C.toast(sound.on ? '🔊 Ton an' : '🔇 Ton aus', 1000); },
    splash: (html, theme, ms) => G.CasinoOverlay.splash(html, theme, ms),
    bigWin: (title, amount, theme) => G.CasinoOverlay.bigWin(title, amount, theme),
    async noMoney(need) {
      sound.play('lose');
      const low = wallet.bal < 1000;
      const r = await C.modal(`<h2>Zu wenig Spielgeld</h2><p>Für diesen Einsatz (${fmt(need)}) reicht dein Guthaben von ${fmt(wallet.bal)} nicht.</p>` + (low ? '<p>Du kannst dir kostenlos neues Spielgeld holen.</p>' : '<p>Verringere den Einsatz.</p>'),
        { buttons: low ? [{ label: '💰 +' + fmt(wallet.START) + ' Spielgeld', value: 'refill' }, { label: 'Schließen', value: null, cls: ' ' }] : [{ label: 'OK', value: null }] });
      if (r === 'refill') { wallet.refill(); sound.play('coin'); }
    },
    gamble: amount => G.CasinoOverlay.gamble(amount),
    pickBonus: (st, theme, opt) => G.CasinoOverlay.pickBonus(st, theme, opt),
    bonusWheel: (st, theme, opt) => G.CasinoOverlay.bonusWheel(st, theme, opt)
  };
  G.Casino = App;

  // Start
  const ok = Gfx.init($('#gl'));
  if (!ok) { document.body.classList.add('no3d'); }
  buildLobby();
  route();
})(window);
