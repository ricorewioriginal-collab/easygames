// In-game HUD: location/objective box, minimap, interaction prompt, region
// banner, touch controls and controller indicator. Only what is needed is
// shown; everything hides during dialogs, menus and battles.
import { h } from './ui.js';
import { REGIONS } from '../data/regions.js';
import { HALF } from '../logic/layout.js';
import { SPECIES } from '../data/species.js';
import { maxHp } from '../logic/monster.js';
import { THREE } from '../engine/three.js';
import { paintLayout, adventureMarks, drawMark } from './regionmap.js';

const V = new THREE.Vector3();

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
    // Begleiter-Plakette links unten (Bild, Name, KP) und Namensschilder über wilden Taschis
    this.buddy = h('div.buddy.hidden', {}, h('img'), h('div.bd', {}, h('b'), h('div.bar', {}, h('i'))));
    this.el.append(this.buddy);
    this.tags = []; this.tagLayer = h('div.wtags'); this.el.append(this.tagLayer);
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
      h('div.tbtns', {}, h('div.tstack', {}, btn('small', '🐾', 'ride'), btn('small', '🏃', 'run')), this.aBtn),
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
    this.coarse ??= matchMedia('(pointer:coarse)');
    const touchy = this.coarse.matches || this.game.input.lastDevice === 'touch';
    const hide = !this.visible || !touchy || this.game.input.lastDevice === 'gamepad';
    if (hide !== this.touchHidden) { this.touchHidden = hide; this.touch.classList.toggle('hidden', hide); }
  }
  // DOM writes force the browser to restyle the page, which is costly on
  // phones; only touch the HUD when a text actually changed.
  setText(el, t) { if (el.textContent !== t) el.textContent = t; }
  banner(title, sub) {
    const b = h('div.region-banner', {}, h('div.s', {}, sub || ''), h('div.t', {}, title));
    this.el.append(b); setTimeout(() => b.remove(), 3500);
  }
  update(dt) {
    const g = this.game, w = g.world;
    this.updateTouchVisibility();
    if (g.settings.get('showStats')) { const s = g.renderer.stats; this.setText(this.stats, `fps ${s.fps}  ${s.ms}ms  scale ${s.scale}\ncalls ${s.calls}  tris ${(s.tris / 1000).toFixed(0)}k\ngeo ${s.geos}  tex ${s.tex}  ${g.renderer.profileName}`); }
    if (!this.visible || !w.current) return;
    const s = g.save;
    const c = w.current;
    const regName = c.region === 16 ? 'Sternengipfel' : REGIONS[c.region].name;
    const place = c.type === 'interior' ? ({ heal: 'Heilzentrum', shop: 'Laden', lab: 'Labor', house: 'Wohnhaus', arena: REGIONS[Math.min(15, c.region)].gym.theme, cave: c.interior.name, station: 'Forschungsstation', league: 'Halle der Sternenliga' }[c.kind]) : (c.region === 16 ? 'Gipfelplateau' : g.inTown() ? REGIONS[c.region].town : 'Route ' + regName);
    this.setText(this.loc.children[0], place + ' · ' + regName);
    if (performance.now() > (this.objNext || 0)) { this.objNext = performance.now() + 500; this.setText(this.loc.children[1], '➜ ' + g.objective().text); }
    const mins = Math.floor(s.worldTime), hh = Math.floor(mins / 60), mm = mins % 60;
    this.setText(this.loc.children[2], (g.isNight() ? '🌙 ' : '☀ ') + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + '  ·  ✦ ' + s.badges + '/16  ·  ★ ' + s.coins);
    // prompt
    const near = g.busy || g.ui.blocking ? null : w.near;
    const hint = near ? g.ui.hint('confirm') : '', ptext = near ? (near.prompt || 'Interagieren') + ': ' + (near.label || '') : '';
    const pkey = near ? hint + '|' + ptext : '';
    if (pkey !== this.promptKey) {
      this.promptKey = pkey;
      this.prompt.classList.toggle('hidden', !near);
      if (near) this.prompt.replaceChildren(h('span.key', {}, hint), ptext);
      this.setText(this.aBtn, near?.prompt || 'Aktion');
    }
    if (performance.now() > this.miniNext) { this.drawMinimap(); this.updateBuddy(); this.miniNext = performance.now() + 250; }
    this.updateTags();
  }
  updateBuddy() {
    const g = this.game, w = g.world, s = g.save;
    const m = (w.mount && s.team.find(x => x.uid === w.mount.uid)) || s.team.find(x => x.uid === s.companion && x.hp > 0) || s.team.find(x => x.hp > 0);
    this.buddy.classList.toggle('hidden', !m);
    // auf Touch-Geräten direkt unter den Zielkasten (der je nach Textlänge mehrzeilig ist)
    if (m && !this.touch.classList.contains('hidden')) { const top = Math.round(this.loc.getBoundingClientRect().bottom + 8) + 'px'; if (this.buddy.style.top !== top) this.buddy.style.top = top; } else if (this.buddy.style.top) this.buddy.style.top = '';
    if (!m) return;
    const src = g.preview.thumbnail(m.id), key = m.uid + ':' + m.hp + ':' + m.lv + ':' + src.length;
    if (key === this.buddyKey) return;
    this.buddyKey = key;
    const img = this.buddy.firstChild, max = maxHp(m), p = Math.max(0, Math.min(100, m.hp / max * 100));
    if (img.getAttribute('src') !== src) img.src = src;
    this.buddy.querySelector('b').textContent = (m.nick || SPECIES[m.id].name) + '  Lv. ' + m.lv;
    const bar = this.buddy.querySelector('.bar'); bar.className = 'bar' + (p < 22 ? ' low' : p < 50 ? ' mid' : '');
    bar.firstChild.style.width = p + '%';
  }
  // Namensschild (Level, Geschlecht, Name, ◉ = schon gefangen) über den nächsten wilden Taschis
  updateTags() {
    const g = this.game, w = g.world, cam = w.camera, pp = w.player?.root.position;
    const show = this.visible && !g.busy && !g.ui.blocking && w.current?.type === 'region' && pp;
    const list = show ? w.wild.filter(x => x.c.root.visible && x.c.root.position.distanceTo(pp) < 15).sort((a, b) => a.c.root.position.distanceTo(pp) - b.c.root.position.distanceTo(pp)).slice(0, 3) : [];
    while (this.tags.length < list.length) { const t = h('div.wtag', {}, h('div.l1', {}, h('span.lv'), h('span.sx')), h('div.nm'), h('i.ar')); this.tagLayer.append(t); this.tags.push(t); }
    const W = innerWidth, H = innerHeight;
    this.tags.forEach((t, i) => {
      const x = list[i];
      if (!x) { if (!t.hidden) t.hidden = true; return; }
      const r = x.c.root;
      V.copy(r.position); V.y += (x.c.bodyTop || 1.2) * r.scale.y + 0.6;
      V.project(cam);
      if (V.z > 1 || Math.abs(V.x) > 1.1 || Math.abs(V.y) > 1.1) { t.hidden = true; return; }
      t.hidden = false;
      const key = x.id + x.lv + x.g + (g.save.dex[x.id] || 0);
      if (t.dataset.k !== key) {
        t.dataset.k = key;
        const seen = g.save.dex[x.id];
        t.querySelector('.lv').textContent = 'Lv. ' + x.lv;
        const sx = t.querySelector('.sx'); sx.className = 'sx ' + (seen === 2 ? 'cg' : x.g); sx.textContent = seen === 2 ? '◉' : x.g === 'w' ? '♀' : '♂';
        t.querySelector('.nm').textContent = seen ? SPECIES[x.id].name : '???';
      }
      const d = r.position.distanceTo(pp);
      t.style.transform = `translate(${((V.x + 1) / 2 * W).toFixed(1)}px, ${((1 - V.y) / 2 * H).toFixed(1)}px) translate(-50%, -100%)`;
      t.style.opacity = d > 11 ? ((15 - d) / 4).toFixed(2) : '';
    });
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
      paintLayout(x, L, P, sc);
      // Abenteuer-Ziele (Rätsel, Gilde, Funde, Aufgaben) – am Rand festgehalten
      const lim = W / 2 - 9;
      for (const m of adventureMarks(this.game)) { const [mx, mz] = P(m.x, m.z); const d = Math.hypot(mx, mz), k = d > lim ? lim / d : 1; if (k < 1 && (m.kind === 'questNew' || m.kind === 'questReady' || m.kind === 'solved')) continue; drawMark(x, mx * k, mz * k, m.kind, 6, -yaw); }
      // objective marker
      const obj = this.game.objectiveTarget();
      if (obj) { const [ox, oz] = P(obj.x, obj.z); const d = Math.hypot(ox, oz), lim = W / 2 - 10; const k = d > lim ? lim / d : 1; x.lineWidth = 5; x.strokeStyle = '#2a2f3a'; x.beginPath(); x.arc(ox * k, oz * k, 9, 0, Math.PI * 2); x.stroke(); x.lineWidth = 3; x.strokeStyle = '#ffd35a'; x.stroke(); x.fillStyle = '#ffd35a'; x.beginPath(); x.arc(ox * k, oz * k, 2.5, 0, Math.PI * 2); x.fill(); }
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
