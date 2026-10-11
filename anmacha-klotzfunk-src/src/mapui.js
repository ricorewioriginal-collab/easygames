// Weltkarten-Fenster: zeichnet nur bei Bedarf (Öffnen, Verschieben, Zoomen), keine eigene Schleife.
import { TILE, MAX_MARKS } from './worldmap.js';
import { villageIn, regionOf } from './structures.js';

const ZOOMS = [0.25, 0.5, 1, 2]; // Kartenpixel je Block (1 Farbfeld = 4×4 Blöcke)

export class MapScreen {
  constructor(game, $, toast) {
    this.game = game; this.$ = $; this.toast = toast;
    this.cv = $('wm'); this.ctx = this.cv.getContext('2d');
    this.off = document.createElement('canvas'); this.offCtx = this.off.getContext('2d');
    this.zi = 3; this.cx = 0; this.cz = 0; this.sel = null; this.drag = null;
    const cv = this.cv;
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 }; });
    cv.addEventListener('pointermove', e => {
      const d = this.drag;
      if (!d || d.id !== e.pointerId) return;
      const k = this.scale(), z = ZOOMS[this.zi];
      this.cx -= (e.clientX - d.x) * k / z; this.cz -= (e.clientY - d.y) * k / z;
      d.moved += Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y); d.x = e.clientX; d.y = e.clientY;
      this.draw();
    });
    const up = e => {
      const d = this.drag;
      if (!d || d.id !== e.pointerId) return;
      this.drag = null;
      if (d.moved < 8) { const p = this.toWorld(e); this.select(p.x, p.z); }
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { this.drag = null; });
    cv.addEventListener('wheel', e => { e.preventDefault(); this.zoom(e.deltaY < 0 ? 1 : -1); }, { passive: false });
    $('mapZin').onclick = () => this.zoom(1);
    $('mapZout').onclick = () => this.zoom(-1);
    $('mapMe').onclick = () => { this.cx = game.player.x; this.cz = game.player.z; this.draw(); };
    $('mapMark').onclick = () => {
      if (!this.sel) return;
      if (!game.map.addMark(this.sel.x, this.sel.z)) { this.toast(`Höchstens ${MAX_MARKS} Markierungen`); return; }
      game.unsaved = true; this.list(); this.draw();
    };
    $('mapGo').onclick = () => { if (this.sel) this.setWp(this.sel.x, this.sel.z); };
    $('mapMarks').addEventListener('click', e => {
      const b = e.target.closest('button[data-i]');
      if (!b) return;
      const m = game.map.marks[Number(b.dataset.i)];
      if (!m) return;
      if (b.dataset.a === 'go') this.setWp(m.x, m.z);
      else if (b.dataset.a === 'del') { game.map.removeMark(Number(b.dataset.i)); game.unsaved = true; this.list(); }
      else { this.cx = m.x; this.cz = m.z; }
      this.draw();
    });
    $('mapMarks').addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.i == null) return;
      const m = game.map.marks[Number(t.dataset.i)];
      if (m) { m.n = t.value.trim().slice(0, 24) || m.n; t.value = m.n; game.unsaved = true; this.draw(); }
    });
  }
  scale() { return this.cv.width / Math.max(1, this.cv.clientWidth); }
  toWorld(e) {
    const r = this.cv.getBoundingClientRect(), k = this.scale(), z = ZOOMS[this.zi];
    return { x: this.cx + ((e.clientX - r.left) * k - this.cv.width / 2) / z, z: this.cz + ((e.clientY - r.top) * k - this.cv.height / 2) / z };
  }
  zoom(d) { this.zi = Math.max(0, Math.min(ZOOMS.length - 1, this.zi + d)); this.draw(); }
  select(x, z) {
    const g = this.game, cx = Math.floor(x / 16), cz = Math.floor(z / 16);
    this.sel = { x: Math.round(x), z: Math.round(z) };
    this.$('mapSel').textContent = `Gewählt: X ${this.sel.x} · Z ${this.sel.z}${g.map.has(cx, cz) ? '' : ' (noch unentdeckt)'}`;
    this.$('mapAct').hidden = false;
    this.draw();
  }
  setWp(x, z) {
    const g = this.game;
    g.wp = { x: Math.round(x), y: Math.round(g.player.y), z: Math.round(z) }; g.unsaved = true;
    this.toast('Wegpunkt gesetzt 📍');
  }
  open() {
    const g = this.game, cv = this.cv, dpr = Math.min(1.5, window.devicePixelRatio || 1);
    this.cx = g.player.x; this.cz = g.player.z; this.sel = null;
    this.$('mapSel').textContent = 'Tippe auf die Karte, um einen Ort zu wählen. Ziehen verschiebt die Karte.';
    this.$('mapAct').hidden = true;
    g.map.markAround(g.player.x, g.player.z, Math.min(g.viewDist, 5)); g.map.syncRadios(g.world);
    requestAnimationFrame(() => { // erst nach dem Einblenden hat die Fläche ihre Größe
      cv.width = Math.max(200, Math.round(cv.clientWidth * dpr)); cv.height = Math.max(160, Math.round(cv.clientHeight * dpr));
      this.list(); this.draw();
    });
  }
  list() {
    const ul = this.$('mapMarks'), g = this.game;
    ul.textContent = '';
    g.map.marks.forEach((m, i) => {
      const li = document.createElement('li'), inp = document.createElement('input');
      inp.value = m.n; inp.maxLength = 24; inp.dataset.i = i; inp.setAttribute('aria-label', 'Name der Markierung');
      const btn = (a, t, l) => { const b = document.createElement('button'); b.dataset.i = i; b.dataset.a = a; b.textContent = t; b.title = l; b.setAttribute('aria-label', l); return b; };
      li.append(btn('show', '★', 'Auf der Karte zeigen'), inp, btn('go', '📍', 'Wegpunkt hierher'), btn('del', '✕', 'Markierung löschen'));
      ul.append(li);
    });
    this.$('mapMarksH').hidden = !g.map.marks.length;
  }
  draw() {
    const g = this.game, cv = this.cv, c = this.ctx, W = cv.width, Hh = cv.height, z = ZOOMS[this.zi], map = g.map;
    if (!map || !g.world) return;
    const x0 = this.cx - W / 2 / z, z0 = this.cz - Hh / 2 / z;
    const c0x = Math.floor(x0 / 16), c0z = Math.floor(z0 / 16), nx = Math.ceil(W / z / 16) + 2, nz = Math.ceil(Hh / z / 16) + 2;
    // Entdeckte Chunks in ein kleines Bild (TILE Pixel je Chunk) schreiben, dann hochskaliert zeichnen
    if (this.off.width !== nx * TILE || this.off.height !== nz * TILE) { this.off.width = nx * TILE; this.off.height = nz * TILE; this.img = this.offCtx.createImageData(nx * TILE, nz * TILE); }
    const d = this.img.data; d.fill(0);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      if (!map.has(c0x + i, c0z + j)) continue;
      const t = map.tile(g.world, c0x + i, c0z + j);
      for (let y = 0; y < TILE; y++) d.set(t.subarray(y * TILE * 4, (y + 1) * TILE * 4), ((j * TILE + y) * nx * TILE + i * TILE) * 4);
    }
    this.offCtx.putImageData(this.img, 0, 0);
    c.fillStyle = '#0b1020'; c.fillRect(0, 0, W, Hh);
    c.imageSmoothingEnabled = false;
    const sx = v => (v - x0) * z, sz = v => (v - z0) * z;
    c.drawImage(this.off, sx(c0x * 16), sz(c0z * 16), nx * 16 * z, nz * 16 * z);
    const f = Math.max(11, Math.round(13 * W / Math.max(1, cv.clientWidth)));
    c.font = `${f}px system-ui,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const icon = (x, y, s, label) => {
      const px = sx(x), py = sz(y);
      if (px < -20 || py < -20 || px > W + 20 || py > Hh + 20) return;
      c.fillText(s, px, py);
      if (label) { c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.7)'; c.strokeText(label, px, py + f); c.fillStyle = '#fff'; c.fillText(label, px, py + f); }
    };
    c.fillStyle = '#fff';
    if (g.world.gen === 3) { // Dörfer, sobald ihr Platz entdeckt ist
      const r0x = regionOf(x0), r1x = regionOf(x0 + W / z), r0z = regionOf(z0), r1z = regionOf(z0 + Hh / z);
      if ((r1x - r0x + 1) * (r1z - r0z + 1) <= 64) for (let rz = r0z; rz <= r1z; rz++) for (let rx = r0x; rx <= r1x; rx++) {
        const v = villageIn(g.seed, rx, rz);
        if (v && map.has(v.x >> 4, v.z >> 4)) icon(v.x, v.z, '🏘', z >= 0.5 ? 'Dorf' : '');
      }
    }
    for (const r of map.radios.values()) icon(r[0], r[2], '📻', '');
    for (const m of map.marks) icon(m.x, m.z, '★', m.n);
    if (g.grave) icon(g.grave.x, g.grave.z, '✝', '');
    if (g.wp) icon(g.wp.x, g.wp.z, '📍', g.story && !g.story.done ? 'Storyziel' : '');
    if (this.sel) { c.strokeStyle = '#ff2d95'; c.lineWidth = 2; c.strokeRect(sx(this.sel.x) - 7, sz(this.sel.z) - 7, 14, 14); }
    if (g.mp) for (const [, a] of g.mp.avatars.list) if (a.x != null) icon(a.x, a.z, '👤', z >= 0.5 ? a.name : '');
    // Spieler-Pfeil (Blickrichtung)
    const p = g.player;
    c.save(); c.translate(sx(p.x), sz(p.z)); c.rotate(-g.yaw); c.scale(f / 9, f / 9);
    c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, -6); c.lineTo(4.5, 5); c.lineTo(0, 2.5); c.lineTo(-4.5, 5); c.closePath(); c.fill(); c.stroke();
    c.restore();
    this.$('mapInfo').textContent = `${map.count} Gebiete entdeckt · Zoom ${this.zi + 1}/${ZOOMS.length} · X ${Math.round(g.player.x)} Z ${Math.round(g.player.z)}`;
  }
}
