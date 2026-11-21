// Park-Editor: eigene Parks aus Bauteilen zusammenstellen, speichern und befahren.
// Ein Bedienkonzept für alle Geräte: Cursor bewegen (Stick, WASD, Tippen/Zeigen), Bauteil wählen, drehen, setzen, löschen.
import { Vector3, Color3, Matrix } from '@babylonjs/core/Maths/math';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Culling/ray';
import { Level, buildMeshes } from './level.js';
import { rebuildLevel } from './world.js';
import { PARKS } from './parks.js';
import { save, persist } from './save.js';
import * as A from './audio.js';

const PI = Math.PI;
export const MAX_PIECES = 60, MAX_SLOTS = 8, HALF = 32;
const ramp = (x, z, rot, w, d, h) => ({ t: 'ramp', x, z, rot, w, d, h, y0: 0 });

// Bauteile in lokalen Koordinaten (Mitte = Cursor, Rampen steigen nach +z). fp = halbe Grundfläche [x, z]
export const PIECES = [
  { id: 'kicker', name: 'Kicker', ic: '◢', fp: [1.5, 1.3], els: [ramp(0, 0, 0, 3, 2.6, 0.8)] },
  { id: 'bigkicker', name: 'Großer Kicker', ic: '◣', fp: [1.75, 1.8], els: [ramp(0, 0, 0, 3.5, 3.6, 1.5)] },
  { id: 'qp', name: 'Quarterpipe', ic: '◞', fp: [4, 2.35], els: [{ t: 'qp', x: 0, z: -2.35, rot: 0, w: 8, r: 3.2, h: 2.4, deck: 1.6 }] },
  { id: 'vert', name: 'Vert-Rampe', ic: '⌒', fp: [4, 2.6], els: [{ t: 'qp', x: 0, z: -2.6, rot: 0, w: 8, r: 3.6, h: 3.5, deck: 1.6 }] },
  { id: 'halfpipe', name: 'Halfpipe', ic: '◡', fp: [4, 6.7], els: [{ t: 'qp', x: 0, z: 2, rot: 0, w: 8, r: 3.2, h: 2.4, deck: 1.6 }, { t: 'qp', x: 0, z: -2, rot: PI, w: 8, r: 3.2, h: 2.4, deck: 1.6 }] },
  { id: 'funbox', name: 'Funbox', ic: '⏢', fp: [1.5, 3.7], els: [{ t: 'box', x: 0, z: 0, w: 3, d: 3, h: 0.8, grind: true, mat: 'deck' }, ramp(0, -2.6, 0, 3, 2.2, 0.8), ramp(0, 2.6, PI, 3, 2.2, 0.8)] },
  { id: 'pyramid', name: 'Pyramide', ic: '▲', fp: [3.9, 3.9], els: [{ t: 'box', x: 0, z: 0, w: 3, d: 3, h: 1, grind: true, mat: 'deck' }, ramp(0, -2.7, 0, 3, 2.4, 1), ramp(0, 2.7, PI, 3, 2.4, 1), ramp(-2.7, 0, PI / 2, 3, 2.4, 1), ramp(2.7, 0, -PI / 2, 3, 2.4, 1)] },
  { id: 'ledge', name: 'Ledge', ic: '▬', fp: [0.5, 3], els: [{ t: 'box', x: 0, z: 0, w: 1, d: 6, h: 0.5, grind: true, mat: 'ledge' }] },
  { id: 'pad', name: 'Manual-Pad', ic: '▭', fp: [1.2, 2.5], els: [{ t: 'box', x: 0, z: 0, w: 2.4, d: 5, h: 0.22, grind: true, mat: 'ledge' }] },
  { id: 'rail', name: 'Rail', ic: '═', fp: [0.3, 3.5], els: [{ t: 'rail', a: [0, 0.55, -3.5], b: [0, 0.55, 3.5] }] },
  { id: 'stairs', name: 'Treppe mit Geländer', ic: '☰', fp: [2.5, 5.2], els: [
    { t: 'box', x: 0, z: -0.2, w: 5, d: 4, h: 1.4, grind: true, mat: 'concrete' },
    { t: 'stairs', x: 0, z: -3.7, rot: PI, w: 5, d: 3, n: 5, h: 1.4 },
    { t: 'rail', a: [2.25, 2.25, -2.5], b: [2.25, 0.85, -4.8] },
    ramp(0, 3.5, PI, 5, 3.4, 1.4)] },
  { id: 'plat', name: 'Plattform', ic: '▙', fp: [2, 3.5], els: [{ t: 'box', x: 0, z: 1.5, w: 4, d: 4, h: 1.2, grind: true, mat: 'concrete' }, ramp(0, -2, 0, 4, 3, 1.2)] },
  { id: 'wall', name: 'Wallride-Wand', ic: '▮', fp: [4, 0.4], els: [{ t: 'wall', x: 0, z: 0, w: 8, d: 0.8, h: 3, mat: 'graffiti', top: 'wallTop' }] },
  { id: 'container', name: 'Container', ic: '▣', fp: [1.3, 3], els: [{ t: 'box', x: 0, z: 0, w: 2.6, d: 6, h: 2.6, grind: true, mat: 'container', side: 'container' }] },
  { id: 'pool', name: 'Pool', ic: '◯', fp: [5.5, 5.5], round: true, els: [{ t: 'bowl', x: 0, z: 0, R: 5.5, depth: 2, rt: 2.4 }] },
  { id: 'planter', name: 'Pflanzkübel', ic: '●', fp: [0.9, 0.9], round: true, els: [{ t: 'cyl', x: 0, z: 0, r: 0.9, h: 0.6, mat: 'planter' }] }
];
const BY_ID = Object.fromEntries(PIECES.map(p => [p.id, p]));
export const THEMES = [{ name: 'Tag', base: 0 }, { name: 'Abend', base: 1 }, { name: 'Nacht', base: 2 }];

// Bauteil an (x, z) mit Drehung k·90° in Welt-Elemente umrechnen
export function placePiece(pc) {
  const P = BY_ID[pc.t]; if (!P) return [];
  const R = (pc.r || 0) * PI / 2, c = Math.cos(R), s = Math.sin(R);
  const W = (lx, lz) => [pc.x + lx * c + lz * s, pc.z - lx * s + lz * c];
  return P.els.map(e => {
    const o = Object.assign({}, e);
    if (e.t === 'rail') { const [ax, az] = W(e.a[0], e.a[2]), [bx, bz] = W(e.b[0], e.b[2]); o.a = [ax, e.a[1], az]; o.b = [bx, e.b[1], bz]; }
    else { [o.x, o.z] = W(e.x || 0, e.z || 0); o.rot = (e.rot || 0) + R; }
    return o;
  });
}
const extent = pc => { const f = BY_ID[pc.t].fp; return (pc.r || 0) % 2 ? [f[1], f[0]] : [f[0], f[1]]; };
const inside = pc => { const [hx, hz] = extent(pc); return Math.abs(pc.x) + hx <= HALF - 0.5 && Math.abs(pc.z) + hz <= HALF - 0.5; };
const covers = (pc, x, z) => { const [hx, hz] = extent(pc); return Math.abs(x - pc.x) <= hx && Math.abs(z - pc.z) <= hz; };

// Park-Definition aus einem Speicherplatz
export function parkFromSlot(slot) {
  const B = PARKS[(THEMES[slot.theme || 0] || THEMES[0]).base];
  const wm = B.elements[0] && B.elements[0].t === 'wall' ? B.elements[0].mat : 'graffiti';
  const els = [
    { t: 'wall', x: 0, z: HALF + 0.5, w: HALF * 2 + 2, d: 1, h: 3.2, mat: wm, top: 'wallTop' }, { t: 'wall', x: 0, z: -HALF - 0.5, w: HALF * 2 + 2, d: 1, h: 3.2, mat: wm, top: 'wallTop' },
    { t: 'wall', x: HALF + 0.5, z: 0, w: 1, d: HALF * 2, h: 3.2, mat: wm, top: 'wallTop' }, { t: 'wall', x: -HALF - 0.5, z: 0, w: 1, d: HALF * 2, h: 3.2, mat: wm, top: 'wallTop' }
  ];
  for (const pc of slot.pieces) els.push(...placePiece(pc));
  const lamp = B.neon ? 'neonLamp' : 'lamp';
  return Object.assign({}, B, {
    id: 'mine-' + slot.id, name: slot.name, sub: 'Eigener Park · ' + THEMES[slot.theme || 0].name, custom: true, slot: slot.id,
    bounds: [-HALF, -HALF, HALF, HALF], spawn: [0, -HALF + 3, 0], elements: els,
    deco: B.deco.filter(d => d.t === 'city' || d.t === 'crane' || d.t === 'antenna').concat([[-34, -34], [34, -34], [-34, 34], [34, 34]].map(([x, z]) => ({ t: lamp, x, z }))),
    letters: [], tape: null, gaps: [], goals: [], coins: []
  });
}

export function newSlot() {
  const ids = save.myParks.map(s => s.id), id = (ids.length ? Math.max(...ids) : 0) + 1;
  const slot = { id, name: 'Mein Park ' + id, theme: 0, pieces: [
    { t: 'qp', x: 0, z: 26, r: 0 }, { t: 'kicker', x: -8, z: 4, r: 0 }, { t: 'ledge', x: 8, z: 0, r: 0 }, { t: 'rail', x: 0, z: -8, r: 0 }
  ] };
  save.myParks.push(slot); persist(); return slot;
}

export class Editor {
  constructor(game) { this.game = game; this.sel = 2; this.rot = 0; this.cur = { x: 0, z: 0 }; this.camYaw = 0; this.zoom = 1; this.undo = []; this.testing = false; this.active = false; this.camK = 0; }
  get slot() { return save.myParks.find(s => s.id === this.slotId); }

  async open(slotId) {
    const g = this.game; this.slotId = slotId; this.undo = []; this.testing = false;
    const slot = this.slot; if (!slot) return;
    await g.load(0, parkFromSlot(slot));
    this.enter(true);
  }
  // in den Bau-Modus wechseln (nach dem Laden oder nach einer Testfahrt)
  enter(fresh) {
    const g = this.game; this.active = true; this.testing = false;
    g.state = 'edit'; g.paused = false; g.input.enabled = true; g.input.clear();
    A.setRoll(0, false); A.setGrind(false);
    if (g.skater) g.skater.holder.setEnabled(false);
    if (fresh) { this.cur = { x: 0, z: 0 }; this.camYaw = 0; this.camPos = null; }
    this.makeGhost(); g.ui.editHud(true, this); this.refresh();
  }
  leave() { this.active = false; this.testing = false; this.disposeGhost(); this.game.ui.editHud(false); if (this.game.skater) this.game.skater.holder.setEnabled(true); }

  // ------------------------------------------------------------ Vorschau
  disposeGhost() { if (this.ghost) { this.ghost.dispose(false, false); this.ghost = null; } if (this.hl) { this.hl.dispose(); this.hl = null; } }
  makeGhost() {
    const sc = this.game.scene; this.disposeGhost();
    if (!this.gMat || this.gMat.getScene() !== sc) {
      const mk = (n, c, a) => { const m = new StandardMaterial(n, sc); m.diffuseColor = Color3.FromHexString(c); m.emissiveColor = Color3.FromHexString(c).scale(0.6); m.alpha = a; m.disableLighting = false; m.backFaceCulling = false; return m; };
      this.gMat = mk('ghostOk', '#3ef08a', 0.5); this.gBad = mk('ghostBad', '#ff4f6d', 0.5); this.fMat = mk('fpOk', '#3ef08a', 0.28); this.fBad = mk('fpBad', '#ff4f6d', 0.3); this.hMat = mk('hl', '#ffd43a', 0.35);
    }
    const root = this.ghost = new TransformNode('ghost', sc);
    const P = PIECES[this.sel], lv = new Level({ elements: placePiece({ t: P.id, x: 0, z: 0, r: this.rot }), bounds: [-50, -50, 50, 50] });
    const self = this, proxy = new Proxy({}, { get: () => self.ok === false ? self.gBad : self.gMat });
    const ms = buildMeshes(lv, sc, proxy);
    for (const m of ms) { m.unfreezeWorldMatrix(); m.parent = root; m.isPickable = false; m.position.y += 0.02; }
    const [hx, hz] = extent({ t: P.id, r: this.rot });
    const fp = this.fp = P.round ? MeshBuilder.CreateDisc('fp', { radius: hx, tessellation: 40 }, sc) : MeshBuilder.CreatePlane('fp', { width: hx * 2, height: hz * 2 }, sc);
    fp.rotation.x = PI / 2; fp.position.y = 0.04; fp.parent = root; fp.isPickable = false;
    this.ghostMeshes = ms; this.ok = null;
    this.hl = MeshBuilder.CreateBox('hl', { size: 1 }, sc); this.hl.material = this.hMat; this.hl.isPickable = false; this.hl.setEnabled(false);
  }
  snapped() { return { x: Math.round(this.cur.x), z: Math.round(this.cur.z) }; }
  candidate() { const s = this.snapped(); return { t: PIECES[this.sel].id, x: s.x, z: s.z, r: this.rot }; }
  hovered() { const s = this.slot, c = this.snapped(); for (let i = s.pieces.length - 1; i >= 0; i--) if (covers(s.pieces[i], c.x, c.z)) return i; return -1; }
  valid() { const s = this.slot; return s.pieces.length < MAX_PIECES && inside(this.candidate()); }

  // ------------------------------------------------------------ Aktionen
  place() {
    const s = this.slot; if (!this.valid()) { A.sfx('uiBack'); this.game.ui.editMsg(s.pieces.length >= MAX_PIECES ? `Höchstens ${MAX_PIECES} Bauteile` : 'Bauteil passt hier nicht – weiter in die Mitte'); return; }
    const pc = this.candidate(); s.pieces.push(pc); this.undo.push({ add: pc }); this.changed(); A.sfx('grindStart');
  }
  remove() {
    const s = this.slot, i = this.hovered(); if (i < 0) { A.sfx('uiBack'); this.game.ui.editMsg('Kein Bauteil unter dem Cursor'); return; }
    const [pc] = s.pieces.splice(i, 1); this.undo.push({ del: pc, i }); this.changed(); A.sfx('bail');
  }
  back() {
    const s = this.slot, u = this.undo.pop(); if (!u) { A.sfx('uiBack'); return; }
    if (u.add) { const i = s.pieces.lastIndexOf(u.add); if (i >= 0) s.pieces.splice(i, 1); } else s.pieces.splice(Math.min(u.i, s.pieces.length), 0, u.del);
    this.changed(); A.sfx('ui');
  }
  clearAll() { const s = this.slot; if (!s.pieces.length) return; for (let i = s.pieces.length - 1; i >= 0; i--) this.undo.push({ del: s.pieces[i], i }); s.pieces.length = 0; this.changed(); }
  pick(d) { this.sel = (this.sel + d + PIECES.length) % PIECES.length; this.makeGhost(); this.refresh(); A.sfx('ui'); }
  choose(i) { this.sel = i; this.makeGhost(); this.refresh(); A.sfx('ui'); }
  turn() { this.rot = (this.rot + 1) % 4; this.makeGhost(); this.refresh(); A.sfx('ui'); }
  cam() { this.camYaw += PI / 2; A.sfx('ui'); }
  zoomStep(d = 1) { this.zoom = (this.zoom + d + 3) % 3; }
  changed() {
    persist();
    const g = this.game; g.custom = parkFromSlot(this.slot);
    rebuildLevel(g, g.custom); if (g.shadow) g.shadow.splitFrustum && g.shadow.splitFrustum();
    this.refresh();
  }
  refresh() { this.game.ui.editInfo(this); }
  async setTheme() {
    const s = this.slot; s.theme = ((s.theme || 0) + 1) % THEMES.length; persist();
    const c = { ...this.cur }, y = this.camYaw; await this.game.load(0, parkFromSlot(s)); this.enter(false); this.cur = c; this.camYaw = y;
  }
  // Testfahrt am Cursor, Blick in Kamerarichtung
  async test() {
    const g = this.game, c = this.snapped(); this.disposeGhost(); this.active = false; this.testing = true; g.ui.editHud(false);
    g.skater.holder.setEnabled(true);
    await g.start('free', 0, undefined, { def: g.custom, keep: true, spawn: [c.x, c.z, this.camYaw] });
    g.ui.flash('Testfahrt');
  }

  // ------------------------------------------------------------ Bildschirm-Zeiger (Maus/Touch)
  groundAt(px, py) {
    const g = this.game, ray = g.scene.createPickingRay(px, py, Matrix.Identity(), g.cam);
    if (ray.direction.y > -1e-3) return null;
    const t = -ray.origin.y / ray.direction.y; return { x: ray.origin.x + ray.direction.x * t, z: ray.origin.z + ray.direction.z * t };
  }
  pointerTo(px, py) { const p = this.groundAt(px, py); if (!p) return false; this.cur.x = Math.max(-HALF, Math.min(HALF, p.x)); this.cur.z = Math.max(-HALF, Math.min(HALF, p.z)); return true; }

  // ------------------------------------------------------------ Schleife
  frame(dt) {
    const g = this.game, inp = g.input;
    if (inp.pressed('pause')) { g.ui.editMenu(); return; }
    if (inp.pressed('ollie')) this.place();
    if (inp.pressed('flip')) this.remove();
    if (inp.pressed('grab')) this.back();
    if (inp.pressed('grind') || inp.pressed('revert')) this.turn();
    if (inp.pressed('spinL')) this.pick(-1);
    if (inp.pressed('spinR')) this.pick(1);
    if (inp.pressed('goals')) { this.test(); return; }
    // Cursor relativ zur Kamera bewegen
    const sp = (9 + this.zoom * 5) * dt, fx = Math.sin(this.camYaw), fz = Math.cos(this.camYaw);
    if (inp.x || inp.y) { this.cur.x += (inp.y * fx + inp.x * fz) * sp; this.cur.z += (inp.y * fz - inp.x * fx) * sp; this.cur.x = Math.max(-HALF, Math.min(HALF, this.cur.x)); this.cur.z = Math.max(-HALF, Math.min(HALF, this.cur.z)); }
    this.camYaw += inp.rx * 2.2 * dt;
    if (inp.ry) this.zoomF = Math.max(0, Math.min(2, (this.zoomF ?? this.zoom) + inp.ry * 1.5 * dt));
    else this.zoomF = this.zoomF == null ? this.zoom : this.zoomF + (this.zoom - this.zoomF) * Math.min(1, dt * 6);
    // Vorschau
    const c = this.snapped(), ok = this.valid();
    if (this.ghost) {
      this.ghost.position.set(c.x, 0, c.z);
      if (ok !== this.ok) { this.ok = ok; for (const m of this.ghostMeshes) m.material = ok ? this.gMat : this.gBad; this.fp.material = ok ? this.fMat : this.fBad; }
      const hi = this.hovered(), s = this.slot;
      if (hi !== this._hi) { this._hi = hi; this.refresh(); }
      if (hi >= 0) { const pc = s.pieces[hi], [hx, hz] = extent(pc); this.hl.setEnabled(true); this.hl.position.set(pc.x, 0.06, pc.z); this.hl.scaling.set(hx * 2 + 0.2, 0.08, hz * 2 + 0.2); }
      else this.hl.setEnabled(false);
    }
    // Kamera: schräg von oben, weich nachgeführt
    const d = 16 + (this.zoomF ?? this.zoom) * 11;
    const tx = c.x - fx * d * 0.62, tz = c.z - fz * d * 0.62, ty = d * 0.78;
    const k = 1 - Math.exp(-8 * dt);
    if (!this.camPos) this.camPos = new Vector3(tx, ty, tz), this.camLook = new Vector3(c.x, 0, c.z);
    this.camPos.x += (tx - this.camPos.x) * k; this.camPos.y += (ty - this.camPos.y) * k; this.camPos.z += (tz - this.camPos.z) * k;
    this.camLook.x += (c.x - this.camLook.x) * k; this.camLook.z += (c.z - this.camLook.z) * k;
    g.cam.position.copyFrom(this.camPos); g.cam.setTarget(this.camLook); g.cam.fov = 0.9;
  }
}
