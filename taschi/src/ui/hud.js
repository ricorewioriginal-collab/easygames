// In-game HUD: location/objective box, minimap, interaction prompt, region
// banner, touch controls and controller indicator. Only what is needed is
// shown; everything hides during dialogs, menus and battles.
import { h } from './ui.js';
import { REGIONS } from '../data/regions.js';
import { HALF } from '../logic/layout.js';

export class HUD {
  constructor(game) {
    this.game = game;
    this.el = h('div#hud.layer');
    this.loc = h('div.locbox', {}, h('div.reg'), h('div.obj'), h('div.time'));
    this.mini = h('canvas#minimap', { width: 160, height: 160 });
    this.el.append(h('div.hud-top', {}, this.loc, this.mini));
    this.prompt = h('div.prompt.hidden');
    this.el.append(this.prompt);
    this.padInfo = h('div.padinfo.hidden'); this.el.append(this.padInfo);
    game.ui.root.append(this.el);
    // touch controls
    this.touch = h('div#touch.layer');
    this.touchLayer = h('div#touchLayer');
    this.joy = h('div#joy', {}, h('div#nub'));
    const btn = (cls, label, action) => {
      const b = h('button.tbtn.' + cls, {}, label);
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); game.audio.unlock(); game.input.lastDevice = 'touch'; game.input.press(action); b.classList.add('down'); });
      const up = (e) => { e.preventDefault(); game.input.release(action); b.classList.remove('down'); };
      b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
      return b;
    };
    this.aBtn = btn('a', 'Aktion', 'confirm');
    this.touch.append(this.touchLayer, this.joy,
      h('div.tbtns', {}, btn('small', '🏃', 'run'), this.aBtn),
      h('div.tmenu', {}, btn('small', '☰', 'menu'), btn('small', '◉', 'team'), btn('small', '🗺', 'map')));
    game.ui.root.append(this.touch);
    game.input.bindTouch(this.touchLayer, this.joy, this.joy.firstChild);
    this.stats = h('div#stats.hidden'); game.ui.root.append(this.stats);
    this.mctx = this.mini.getContext('2d');
    this.miniNext = 0;
    this.visible = false;
    game.input.on('pad', (pad) => { this.padInfo.textContent = pad ? '🎮 ' + pad.id.replace(/\(.*?\)/g, '').slice(0, 40) + ' verbunden' : '🎮 Controller getrennt'; this.padInfo.classList.remove('hidden'); clearTimeout(this.padT); this.padT = setTimeout(() => this.padInfo.classList.add('hidden'), 3500); });
    game.settings.on('change', () => this.applySettings());
    this.applySettings();
  }
  applySettings() {
    document.body.dataset.hand = this.game.settings.get('hand');
    this.game.input.placeJoystick();
    this.stats.classList.toggle('hidden', !this.game.settings.get('showStats'));
  }
  show(v) { this.visible = v; this.el.classList.toggle('hidden', !v); this.updateTouchVisibility(); }
  updateTouchVisibility() {
    const touchy = matchMedia('(pointer:coarse)').matches || this.game.input.lastDevice === 'touch';
    this.touch.classList.toggle('hidden', !this.visible || !touchy || this.game.input.lastDevice === 'gamepad');
  }
  banner(title, sub) {
    const b = h('div.region-banner', {}, h('div.s', {}, sub || ''), h('div.t', {}, title));
    this.el.append(b); setTimeout(() => b.remove(), 3500);
  }
  update(dt) {
    const g = this.game, w = g.world;
    this.updateTouchVisibility();
    if (g.settings.get('showStats')) { const s = g.renderer.stats; this.stats.textContent = `fps ${s.fps}  ${s.ms}ms  scale ${s.scale}\ncalls ${s.calls}  tris ${(s.tris / 1000).toFixed(0)}k\ngeo ${s.geos}  tex ${s.tex}  ${g.renderer.profileName}`; }
    if (!this.visible || !w.current) return;
    const s = g.save;
    const c = w.current;
    const regName = c.region === 16 ? 'Sternengipfel' : REGIONS[c.region].name;
    const place = c.type === 'interior' ? ({ heal: 'Heilzentrum', shop: 'Laden', lab: 'Labor', house: 'Wohnhaus', arena: REGIONS[Math.min(15, c.region)].gym.theme, cave: c.interior.name, station: 'Forschungsstation', league: 'Halle der Sternenliga' }[c.kind]) : (c.region === 16 ? 'Gipfelplateau' : g.inTown() ? REGIONS[c.region].town : 'Route ' + regName);
    this.loc.children[0].textContent = place + ' · ' + regName;
    this.loc.children[1].textContent = '➜ ' + g.objective().text;
    const mins = Math.floor(s.worldTime), hh = Math.floor(mins / 60), mm = mins % 60;
    this.loc.children[2].textContent = (g.isNight() ? '🌙 ' : '☀ ') + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + '  ·  ✦ ' + s.badges + '/16  ·  ★ ' + s.coins;
    // prompt
    const near = g.busy || g.ui.blocking ? null : w.near;
    if (near) {
      this.prompt.classList.remove('hidden');
      this.prompt.replaceChildren(h('span.key', {}, g.ui.hint('confirm')), (near.prompt || 'Interagieren') + ': ' + (near.label || ''));
      this.aBtn.textContent = near.prompt || 'Aktion';
    } else { this.prompt.classList.add('hidden'); this.aBtn.textContent = 'Aktion'; }
    if (performance.now() > this.miniNext) { this.drawMinimap(); this.miniNext = performance.now() + 250; }
  }
  drawMinimap() {
    const x = this.mctx, W = 160, w = this.game.world, c = w.current;
    x.clearRect(0, 0, W, W);
    x.save(); x.beginPath(); x.arc(W / 2, W / 2, W / 2, 0, Math.PI * 2); x.clip();
    const p = w.player.root.position;
    const yaw = w.cam.yaw;
    if (c.type !== 'region') {
      x.fillStyle = c.interior.dark ? '#1a1f2a' : '#4a4f5a'; x.fillRect(0, 0, W, W);
      const sc = 4.2;
      x.translate(W / 2, W / 2); x.rotate(yaw);
      x.fillStyle = c.interior.dark ? '#3a4050' : '#d8d0c0';
      x.fillRect(-p.x * sc - c.interior.w / 2 * sc, -p.z * sc - c.interior.d / 2 * sc, c.interior.w * sc, c.interior.d * sc);
      x.fillStyle = '#ffd35a'; x.beginPath(); x.arc((c.interior.exit.x - p.x) * sc, (c.interior.exit.z - p.z) * sc, 5, 0, Math.PI * 2); x.fill();
    } else {
      const L = c.layout, sc = 1.25;
      x.fillStyle = '#5a9a5a'; x.fillRect(0, 0, W, W);
      x.translate(W / 2, W / 2); x.rotate(yaw);
      const P = (wx, wz) => [(wx - p.x) * sc, (wz - p.z) * sc];
      x.fillStyle = '#4a8ad0';
      for (const wt of L.water) {
        if (wt.kind === 'lake' || wt.kind === 'ice') { const [cx, cz] = P(wt.cx, wt.cz); x.beginPath(); x.ellipse(cx, cz, wt.rx * sc, wt.rz * sc, 0, 0, Math.PI * 2); x.fill(); }
        if (wt.kind === 'river' || wt.kind === 'lava') { x.strokeStyle = wt.kind === 'lava' ? '#ff6a2a' : '#4a8ad0'; x.lineWidth = wt.width * sc; x.beginPath(); wt.pts.forEach(([a, b], i) => { const [px, pz] = P(a, b); i ? x.lineTo(px, pz) : x.moveTo(px, pz); }); x.stroke(); }
        if (wt.kind === 'bay') { const [cx, cz] = P(wt.cx, wt.cz); x.beginPath(); x.arc(cx, cz, wt.r * sc, 0, Math.PI * 2); x.fill(); }
        if (wt.kind === 'sea') { const [lx] = P(wt.side > 0 ? wt.line : -wt.line - 300, 0); x.fillRect(wt.side > 0 ? lx : lx, -400, 300 * sc, 800); }
      }
      x.strokeStyle = '#e8d8a8'; x.lineCap = 'round';
      for (const rd of L.roads) { x.lineWidth = rd.width * sc * 0.8; x.beginPath(); rd.pts.forEach(([a, b], i) => { const [px, pz] = P(a, b); i ? x.lineTo(px, pz) : x.moveTo(px, pz); }); x.stroke(); }
      x.fillStyle = '#2f6a3a';
      for (const gr of L.grass) { const [gx, gz] = P(gr.x - gr.w / 2, gr.z - gr.d / 2); x.fillRect(gx, gz, gr.w * sc, gr.d * sc); }
      for (const b of L.buildings) { const [bx, bz] = P(b.x, b.z); x.fillStyle = { heal: '#e0566e', shop: '#3f7fc4', arena: '#f5cd77', lab: '#ffffff', pavilion: '#f5cd77', station: '#7d4fa3', league: '#ffd27a' }[b.kind] || '#c89a6a'; x.fillRect(bx - 3, bz - 3, 6, 6); }
      // objective marker
      const obj = this.game.objectiveTarget();
      if (obj) { const [ox, oz] = P(obj.x, obj.z); const d = Math.hypot(ox, oz), lim = W / 2 - 10; const k = d > lim ? lim / d : 1; x.fillStyle = '#ffd35a'; x.beginPath(); x.arc(ox * k, oz * k, 6, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#2a2f3a'; x.lineWidth = 2; x.stroke(); }
      void HALF;
    }
    x.restore();
    // player arrow (camera-relative map: player faces up when walking away)
    x.save(); x.translate(W / 2, W / 2); x.rotate(-(w.player.root.rotation.y - yaw) + Math.PI);
    x.fillStyle = '#ff5a4a'; x.strokeStyle = '#fff'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, -9); x.lineTo(6, 7); x.lineTo(0, 3); x.lineTo(-6, 7); x.closePath(); x.fill(); x.stroke();
    x.restore();
  }
}
