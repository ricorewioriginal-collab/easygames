// Bau- und Kaufmodus: Werkzeuge, Katalog, Vorschau (grün/rot), Rückgängig/Wiederholen und Fertighäuser.
// Die eigentliche Logik (Prüfen, Buchen, Differenzen) liegt in ops.ts; hier nur Eingabe, Oberfläche und Vorschau-Meshes.
// Dächer erzeugt der Renderer automatisch aus den Wänden.
import * as THREE from 'three';
import type { Category } from '../data/types';
import { FLOOR_Y, WALL_T, objectPlacement } from '../render/lot-builder';
import { objectGeometry, objectMaterial } from '../render/object-mesh';
import { btn, clear, confirmDlg, h } from '../ui/dom';
import { buyable, getDef } from '../world/defs';
import { FLOOR_TYPES, MODEL_HOMES, WALL_PAINTS, templateFits } from '../world/templates';
import { LEVEL_H, WALL_H, type ObjInst, type Rot } from '../world/world';
import { History } from './history';
import type { BuildHost } from './host';
import {
  cellFor, effCost, execute, lineEdges, money, nearestEdge, nearestWall, planDeleteWalls, planFloor, planMove, planOpening, planPaint, planPlace,
  planRoom, planSell, planTemplate, planWalls, templateCost, wallFacing, type BuildCmd, type Ctx, type PEdge, type Plan,
} from './ops';

type Tool = 'wall' | 'fence' | 'half' | 'room' | 'floor' | 'paint' | 'door' | 'window' | 'stairs' | 'delete' | 'hand' | 'place' | 'sell' | 'pick';
type View = 'build' | 'buy' | 'homes';

export const CATEGORIES: Record<Category, { name: string; icon: string }> = {
  living: { name: 'Wohnen', icon: '🛋️' },
  sleep: { name: 'Schlafen', icon: '🛏️' },
  kitchen: { name: 'Küche', icon: '🍳' },
  bath: { name: 'Bad', icon: '🛁' },
  kids: { name: 'Kinder', icon: '🧸' },
  hobby: { name: 'Hobby', icon: '🎨' },
  office: { name: 'Büro', icon: '💻' },
  garden: { name: 'Garten', icon: '🌳' },
  fitness: { name: 'Fitness', icon: '🏋️' },
  light: { name: 'Licht', icon: '💡' },
  deco: { name: 'Deko', icon: '🖼️' },
  appliance: { name: 'Geräte', icon: '📺' },
  door: { name: 'Türen', icon: '🚪' },
  window: { name: 'Fenster', icon: '🪟' },
  stairs: { name: 'Treppen', icon: '🪜' },
  pet: { name: 'Haustiere', icon: '🐾' },
  work: { name: 'Arbeit', icon: '🧰' },
};

const BUILD_TOOLS: [Tool, string, string][] = [
  ['wall', '🧱', 'Wand'],
  ['fence', '🚧', 'Zaun'],
  ['half', '▭', 'Halbwand'],
  ['room', '⬛', 'Raum'],
  ['floor', '🟫', 'Boden'],
  ['paint', '🖌️', 'Streichen'],
  ['door', '🚪', 'Türen'],
  ['window', '🪟', 'Fenster'],
  ['stairs', '🪜', 'Treppen'],
  ['delete', '🗑️', 'Abriss'],
];
const BUY_TOOLS: [Tool, string, string][] = [
  ['hand', '✋', 'Bewegen'],
  ['pick', '🎯', 'Pipette'],
  ['sell', '💰', 'Verkaufen'],
];
const HINTS: Record<Tool, string> = {
  wall: 'Ziehen: Wand entlang der Rasterlinien · Tippen: ein Wandstück. Dächer entstehen automatisch.',
  fence: 'Ziehen: Zaun entlang der Rasterlinien · Tippen: ein Zaunstück.',
  half: 'Ziehen: halbe Wand/Geländer · Tippen: ein Stück.',
  room: 'Ziehen: Rechteck aufziehen – Boden und Wände in einem Schritt.',
  floor: 'Ziehen: Fläche belegen · Tippen: eine Kachel.',
  paint: 'Neben die Wand tippen – gestrichen wird die Seite, auf der du tippst. Ziehen streicht eine Wandlinie.',
  door: 'Tür wählen und auf eine Wand tippen · R dreht die Öffnungsrichtung.',
  window: 'Fenster wählen und auf eine feste Wand tippen.',
  stairs: 'Treppe wählen und platzieren – oben muss Boden zum Aussteigen liegen · R dreht.',
  delete: 'Tippen: Wand oder Objekt entfernen (mit Erstattung) · Ziehen: Wandlinie abreißen.',
  hand: 'Objekt antippen zum Aufnehmen, dann neu platzieren · R dreht · Entf verkauft.',
  place: 'Tippen zum Platzieren · R dreht · Esc bricht ab.',
  sell: 'Objekt antippen, um es für 85 % zu verkaufen.',
  pick: 'Objekt antippen, um es samt Farbe auszuwählen.',
};
const DRAG_TOOLS = new Set<Tool>(['wall', 'fence', 'half', 'room', 'floor', 'paint', 'delete']);
const WALL_KIND: Partial<Record<Tool, 0 | 1 | 2>> = { wall: 0, fence: 1, half: 2 };
const EDGE_H = [WALL_H, 1.05, 1.15];
const MAX_INST = 1400;

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _q = new THREE.Quaternion();
const C_OK = new THREE.Color('#5fe08a');
const C_BAD = new THREE.Color('#ff5a4a');
const C_DEL = new THREE.Color('#ff8a3d');

interface Preview {
  root: THREE.Group;
  boxGeo: THREE.BoxGeometry;
  instMat: THREE.MeshBasicMaterial;
  inst: THREE.InstancedMesh;
  okMat: THREE.MeshBasicMaterial;
  badMat: THREE.MeshBasicMaterial;
  obj: THREE.Mesh;
  tint: THREE.Mesh;
  objKey: string;
}

export class BuildMode {
  private _active = false;
  tab: 'build' | 'buy' = 'build';
  private view: View = 'build';
  private tool: Tool = 'wall';
  private hist = new History<BuildCmd>(100);
  private def: string | null = null;
  private ca = 0;
  private cb = 0;
  private rot: Rot = 0;
  private floorType = 1;
  private paint = 0;
  private cat: Category | 'all' = 'all';
  private search = '';
  private moving: string | null = null;
  private drag: { ax: number; az: number; bx: number; bz: number; side: 0 | 1 } | null = null;
  private pt = { x: 0, z: 0, ok: false };
  private sx = -1;
  private sy = -1;
  private hkey = NaN;
  private plan: Plan | null = null;
  private hoverObj: string | null = null;
  private highlighted: string | null = null;
  private pv: Preview | null = null;
  private padT = 0;
  private padAcc = 0;
  private shownFunds = NaN;
  private shownLevel = -1;
  // DOM
  private panel: HTMLElement | null = null;
  private hintEl: HTMLElement | null = null;
  private fundsEl: HTMLElement | null = null;
  private bodyEl: HTMLElement | null = null;
  private undoBtn: HTMLButtonElement | null = null;
  private redoBtn: HTMLButtonElement | null = null;
  private lvlBtns: HTMLButtonElement[] = [];

  constructor(private host: BuildHost) {}

  get active(): boolean {
    return this._active;
  }

  private ctx(): Ctx {
    return { g: this.host.g, hh: this.host.g.activeHh, lot: this.host.lot() };
  }

  // ---------- Öffnen/Schließen ----------
  open(tab: 'build' | 'buy'): void {
    this.tab = tab;
    this.view = tab;
    if (!this._active) {
      this._active = true;
      this.createPreview();
      this.host.grid(true);
      this.host.focusLot();
      if (!this.host.lot()) this.host.toast('Dein Haushalt hat kein Grundstück – hier kann nichts gebaut werden.', '🏚️', 'warn');
    }
    this.cancel();
    this.tool = tab === 'buy' ? 'hand' : 'wall';
    this.render();
  }

  close(): void {
    if (!this._active) return;
    this._active = false;
    this.cancel();
    this.hist.clear();
    this.setHighlight(null);
    this.host.grid(false);
    this.disposePreview();
    this.panel?.remove();
    this.panel = this.hintEl = this.fundsEl = this.bodyEl = this.undoBtn = this.redoBtn = null;
    this.lvlBtns = [];
    this.host.closed();
  }

  /** Auswahl/Ziehen/Aufnehmen abbrechen (Modus bleibt offen) */
  private cancel(): void {
    this.drag = null;
    this.moving = null;
    this.plan = null;
    this.hkey = NaN;
    this.setHighlight(null);
    this.hidePreview();
  }

  // ---------- Vorschau ----------
  private createPreview(): void {
    if (this.pv) return;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const instMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5, depthWrite: false });
    const inst = new THREE.InstancedMesh(boxGeo, instMat, MAX_INST);
    inst.setColorAt(0, C_OK);
    inst.count = 0;
    inst.frustumCulled = false;
    inst.renderOrder = 5;
    const okMat = new THREE.MeshBasicMaterial({ color: C_OK, transparent: true, opacity: 0.35, depthWrite: false });
    const badMat = new THREE.MeshBasicMaterial({ color: C_BAD, transparent: true, opacity: 0.45, depthWrite: false });
    const geo0 = objectGeometry('missing');
    const obj = new THREE.Mesh(geo0, [objectMaterial('solid'), objectMaterial('glass'), objectMaterial('emissive')]);
    const tint = new THREE.Mesh(geo0, okMat);
    tint.scale.setScalar(1.02);
    tint.renderOrder = 6;
    obj.add(tint);
    obj.visible = false;
    const root = new THREE.Group();
    root.name = 'build-preview';
    root.add(inst, obj);
    this.host.scene.add(root);
    this.pv = { root, boxGeo, instMat, inst, okMat, badMat, obj, tint, objKey: '' };
  }
  private disposePreview(): void {
    const pv = this.pv;
    if (!pv) return;
    this.host.scene.remove(pv.root);
    pv.inst.dispose();
    pv.boxGeo.dispose();
    pv.instMat.dispose();
    pv.okMat.dispose();
    pv.badMat.dispose();
    // Objektgeometrie/-materialien sind geteilt (object-mesh) – nicht freigeben
    this.pv = null;
  }
  private hidePreview(): void {
    if (!this.pv) return;
    this.pv.inst.count = 0;
    this.pv.obj.visible = false;
  }
  private addBox(i: number, x: number, y: number, z: number, sx: number, sy: number, sz: number, c: THREE.Color): number {
    const pv = this.pv!;
    if (i >= MAX_INST) return i;
    _p.set(x, y, z);
    _s.set(sx, sy, sz);
    _m.compose(_p, _q, _s);
    pv.inst.setMatrixAt(i, _m);
    pv.inst.setColorAt(i, c);
    return i + 1;
  }
  private showShapes(plan: Plan, l: number): void {
    const pv = this.pv;
    if (!pv) return;
    let i = 0;
    const y0 = l * LEVEL_H;
    const k = WALL_KIND[this.tool];
    const tall = k !== undefined ? EDGE_H[k]! : WALL_H;
    if (plan.cells)
      for (const c of plan.cells) i = this.addBox(i, c.x + 0.5, y0 + FLOOR_Y + 0.03, c.z + 0.5, 0.96, 0.04, 0.96, c.ok && plan.ok ? C_OK : C_BAD);
    if (plan.edges)
      for (const e of plan.edges) {
        const col = !e.ok || !plan.ok ? C_BAD : this.tool === 'delete' ? C_DEL : C_OK;
        i = this.edgeBox(i, e, y0, this.tool === 'paint' ? WALL_H - 0.1 : tall, col);
      }
    pv.inst.count = i;
    pv.inst.instanceMatrix.needsUpdate = true;
    if (pv.inst.instanceColor) pv.inst.instanceColor.needsUpdate = true;
  }
  private edgeBox(i: number, e: PEdge, y0: number, hgt: number, col: THREE.Color): number {
    const paint = this.tool === 'paint';
    const t = paint ? 0.04 : this.tool === 'delete' ? WALL_T + 0.08 : WALL_T + 0.02;
    // Streichen: dünne Fläche auf der gewählten Seite
    const off = paint ? (this.drag?.side ?? this.paintSide) * 2 - 1 : 0;
    const o = paint ? off * (WALL_T / 2 + 0.03) : 0;
    if (e.dir === 0) return this.addBox(i, e.x + 0.5, y0 + hgt / 2, e.z + o, 1.0, hgt, t, col);
    return this.addBox(i, e.x + o, y0 + hgt / 2, e.z + 0.5, t, hgt, 1.0, col);
  }
  private paintSide: 0 | 1 = 0;

  private readonly tmpO: ObjInst = { id: '_preview', def: 'missing', x: 0, z: 0, l: 0, r: 0, lot: '' };
  private showObject(defId: string, ca: number, cb: number, x: number, z: number, l: number, r: Rot, dir: 0 | 1 | undefined, ok: boolean): void {
    const pv = this.pv;
    if (!pv) return;
    const key = `${defId}|${ca}|${cb}`;
    if (pv.objKey !== key) {
      const geo = objectGeometry(defId, ca, cb);
      pv.obj.geometry = geo;
      pv.tint.geometry = geo;
      pv.objKey = key;
    }
    const o = this.tmpO;
    o.def = defId;
    o.x = x;
    o.z = z;
    o.l = l;
    o.r = r;
    o.dir = dir;
    const p = objectPlacement(this.host.g.world, o);
    pv.obj.position.set(p.x, p.y + 0.01, p.z);
    pv.obj.rotation.set(0, (p.q * Math.PI) / 2, 0);
    pv.tint.material = ok ? pv.okMat : pv.badMat;
    pv.obj.visible = true;
  }

  private setHighlight(id: string | null): void {
    if (this.highlighted === id) return;
    this.highlighted = id;
    this.host.highlight(id);
  }

  // ---------- Eingabe ----------
  hover(x: number, y: number): void {
    if (!this._active) return;
    this.sx = x;
    this.sy = y;
    this.refresh(false);
  }

  /** Bodenpunkt holen und Plan neu berechnen, wenn sich etwas Relevantes geändert hat */
  private refresh(force: boolean): void {
    const gp = this.sx >= 0 ? this.host.groundAt(this.sx, this.sy) : null;
    if (!gp) {
      this.pt.ok = false;
      if (!this.drag) {
        this.plan = null;
        this.hidePreview();
        this.setHint();
      }
      return;
    }
    this.pt.x = gp.x;
    this.pt.z = gp.z;
    this.pt.ok = true;
    const objTools = this.tool === 'hand' || this.tool === 'sell' || this.tool === 'pick' || this.tool === 'delete';
    const pick = objTools && !this.moving && !this.drag ? this.host.pickObject(this.sx, this.sy) : null;
    const lvl = this.host.level();
    const k = (((Math.round(gp.x * 4) * 4096 + Math.round(gp.z * 4)) * 4 + this.rot) * 2 + lvl) * 2 + (pick ? 1 : 0);
    if (!force && k === this.hkey && pick === this.hoverObj) return;
    this.hkey = k;
    this.hoverObj = pick;
    this.compute(lvl);
  }

  private compute(l: number): void {
    if (this.view === 'homes') {
      this.plan = null;
      this.hidePreview();
      this.setHighlight(null);
      this.setHint();
      return;
    }
    const c = this.ctx();
    const { x: px, z: pz } = this.pt;
    let plan: Plan | null = null;
    let showObj = false;
    let hl: string | null = null;
    const t = this.tool;
    const wk = WALL_KIND[t];
    if (wk !== undefined) {
      if (this.drag) plan = planWalls(c, l, lineEdges(this.drag.ax, this.drag.az, this.drag.bx, this.drag.bz), wk);
      else {
        const e = nearestEdge(px, pz);
        plan = planWalls(c, l, [e], wk);
      }
    } else if (t === 'room' || t === 'floor') {
      const d = this.drag ?? { ax: Math.floor(px), az: Math.floor(pz), bx: Math.floor(px), bz: Math.floor(pz) };
      plan = t === 'room' ? planRoom(c, l, d.ax, d.az, d.bx, d.bz, Math.max(0, this.floorType), this.paint) : planFloor(c, l, d.ax, d.az, d.bx, d.bz, this.floorType);
    } else if (t === 'paint') {
      if (this.drag) plan = planPaint(c, l, lineEdges(this.drag.ax, this.drag.az, this.drag.bx, this.drag.bz), this.drag.side, this.paint);
      else {
        const w = nearestWall(c.g.world, l, px, pz);
        if (w) this.paintSide = w.side;
        plan = planPaint(c, l, w ? [w] : [], w?.side ?? 0, this.paint);
      }
    } else if (t === 'delete') {
      if (this.drag) plan = planDeleteWalls(c, l, lineEdges(this.drag.ax, this.drag.az, this.drag.bx, this.drag.bz));
      else if (this.hoverObj && c.lot && c.g.world.objs.get(this.hoverObj)?.lot === c.lot.id) {
        plan = planSell(c, this.hoverObj);
        hl = this.hoverObj;
      } else {
        const w = nearestWall(c.g.world, l, px, pz, 0.6);
        plan = planDeleteWalls(c, l, w ? [w] : []);
      }
    } else if (t === 'hand' || t === 'sell' || t === 'pick') {
      if (this.moving) {
        const o = c.g.world.objs.get(this.moving);
        if (!o) this.moving = null;
        else {
          hl = o.id;
          const def = getDef(o.def);
          if (def.mount === 'opening') {
            const e = this.openingAt(def.w, px, pz);
            plan = planMove(c, o.id, e.x, e.z, l, this.rot, e.dir);
            this.showObject(o.def, o.ca ?? 0, o.cb ?? 0, e.x, e.z, l, this.rot, e.dir, plan.ok);
          } else {
            const r = def.mount === 'wall' ? (wallFacing(c.g.world, l, px, pz) ?? this.rot) : this.rot;
            const [x, z] = cellFor(o.def, r, px, pz);
            plan = planMove(c, o.id, x, z, l, r);
            this.showObject(o.def, o.ca ?? 0, o.cb ?? 0, x, z, l, r, undefined, plan.ok);
          }
          showObj = true;
        }
      } else if (this.hoverObj) {
        const o = c.g.world.objs.get(this.hoverObj);
        if (o && (t === 'pick' || (c.lot && o.lot === c.lot.id))) {
          hl = o.id;
          if (t === 'sell') plan = planSell(c, o.id);
        }
      }
    } else if ((t === 'place' || t === 'door' || t === 'window' || t === 'stairs') && this.def) {
      const def = getDef(this.def);
      if (def.mount === 'opening') {
        const e = this.openingAt(def.w, px, pz);
        plan = planOpening(c, def.id, e.x, e.z, l, e.dir, this.rot, this.ca, this.cb);
        this.showObject(def.id, this.ca, this.cb, e.x, e.z, l, this.rot, e.dir, plan.ok);
      } else {
        const r = def.mount === 'wall' ? (wallFacing(c.g.world, l, px, pz) ?? this.rot) : this.rot;
        const [x, z] = cellFor(def.id, r, px, pz);
        plan = planPlace(c, def.id, x, z, l, r, this.ca, this.cb);
        this.showObject(def.id, this.ca, this.cb, x, z, l, r, undefined, plan.ok);
      }
      showObj = true;
    }
    this.plan = plan;
    if (this.pv) {
      if (!showObj) this.pv.obj.visible = false;
      if (plan && (plan.edges || plan.cells)) this.showShapes(plan, l);
      else this.pv.inst.count = 0;
    }
    this.setHighlight(hl);
    this.setHint();
  }

  /** Öffnung an der nächsten Kante unter dem Punkt (Breite w entlang der Kante zentriert) */
  private openingAt(w: number, px: number, pz: number): { x: number; z: number; dir: 0 | 1 } {
    const e = nearestEdge(px, pz);
    if (w <= 1) return { x: e.x, z: e.z, dir: e.dir };
    return e.dir === 0 ? { x: Math.round(px - w / 2), z: e.z, dir: 0 } : { x: e.x, z: Math.round(pz - w / 2), dir: 1 };
  }

  tap(x: number, y: number, button: number): void {
    if (!this._active) return;
    if (button === 2) {
      this.escape(false);
      return;
    }
    this.sx = x;
    this.sy = y;
    this.refresh(true);
    const c = this.ctx();
    const t = this.tool;
    if (t === 'hand' && !this.moving) {
      const id = this.hoverObj;
      const o = id ? c.g.world.objs.get(id) : undefined;
      if (!o) return;
      if (!c.lot || o.lot !== c.lot.id) {
        this.host.toast('Das gehört nicht zu deinem Grundstück.', '⛔', 'warn');
        return;
      }
      this.moving = o.id;
      this.rot = o.r;
      this.host.sfx('click');
      this.refresh(true);
      return;
    }
    if (t === 'pick') {
      const o = this.hoverObj ? c.g.world.objs.get(this.hoverObj) : undefined;
      if (!o) return;
      this.selectDef(o.def, o.ca ?? 0, o.cb ?? 0);
      this.rot = o.r;
      return;
    }
    if (!this.plan) return;
    this.commit(this.plan);
  }

  private commit(plan: Plan): void {
    if (!plan.ok) {
      this.host.sfx('bad');
      this.host.toast(plan.reason ?? 'Nicht möglich', '⛔', 'warn');
      return;
    }
    const r = execute(this.ctx(), plan);
    if (!r.ok) {
      this.host.sfx('bad');
      this.host.toast(r.reason, '⛔', 'warn');
      return;
    }
    this.hist.push(r.cmd);
    this.host.sfx(plan.kind === 'Kauf' ? 'buy' : plan.kind === 'Verkauf' ? 'coin' : 'build');
    if (this.moving) this.moving = null;
    this.updateButtons();
    this.refresh(true);
  }

  dragStart(x: number, y: number): boolean {
    if (!this._active || !DRAG_TOOLS.has(this.tool)) return false;
    const gp = this.host.groundAt(x, y);
    if (!gp) return false;
    const cellTool = this.tool === 'room' || this.tool === 'floor';
    const ax = cellTool ? Math.floor(gp.x) : Math.round(gp.x),
      az = cellTool ? Math.floor(gp.z) : Math.round(gp.z);
    let side: 0 | 1 = 0;
    if (this.tool === 'paint') {
      const w = nearestWall(this.host.g.world, this.host.level(), gp.x, gp.z);
      side = w?.side ?? 0;
    }
    this.drag = { ax, az, bx: ax, bz: az, side };
    this.sx = x;
    this.sy = y;
    this.refresh(true);
    return true;
  }
  dragMove(x: number, y: number): void {
    if (!this.drag) return;
    this.sx = x;
    this.sy = y;
    const gp = this.host.groundAt(x, y);
    if (!gp) return;
    const cellTool = this.tool === 'room' || this.tool === 'floor';
    const bx = cellTool ? Math.floor(gp.x) : Math.round(gp.x),
      bz = cellTool ? Math.floor(gp.z) : Math.round(gp.z);
    if (bx === this.drag.bx && bz === this.drag.bz) return;
    this.drag.bx = bx;
    this.drag.bz = bz;
    this.refresh(true);
  }
  dragEnd(x: number, y: number): void {
    if (!this.drag) return;
    this.dragMove(x, y);
    const plan = this.plan;
    const empty = this.drag.ax === this.drag.bx && this.drag.az === this.drag.bz && !(this.tool === 'room' || this.tool === 'floor');
    this.drag = null;
    if (plan && !empty) this.commit(plan);
    this.refresh(true);
  }

  key(action: string): boolean {
    if (!this._active) return false;
    switch (action) {
      case 'escape':
        this.escape(true);
        return true;
      case 'undo':
        this.undo();
        return true;
      case 'redo':
        this.redo();
        return true;
      case 'rotate':
        this.rotate();
        return true;
      case 'delete':
        this.deleteHere();
        return true;
      default:
        return false;
    }
  }

  pad(b: string): boolean {
    if (!this._active) return false;
    this.padT = 4;
    const cx = window.innerWidth / 2,
      cy = window.innerHeight / 2;
    switch (b) {
      case 'a':
        this.tap(cx, cy, 0);
        return true;
      case 'b':
        this.escape(true);
        return true;
      case 'x':
        this.rotate();
        return true;
      case 'y':
        this.sx = cx;
        this.sy = cy;
        this.refresh(true);
        this.deleteHere();
        return true;
      case 'lb':
      case 'rb':
        this.cycle(b === 'rb' ? 1 : -1);
        return true;
      default:
        return false;
    }
  }

  update(dt: number): void {
    if (!this._active) return;
    this.padAcc += dt;
    if (this.padT > 0) {
      this.padT -= dt;
      if (this.padAcc > 0.1) {
        this.padAcc = 0;
        this.hover(window.innerWidth / 2, window.innerHeight / 2);
      }
    } else if (this.padAcc > 0.25 && !this.drag && this.sx >= 0) {
      // Kamera bewegt sich unter ruhendem Zeiger: Vorschau nachführen (rechnet nur bei geänderter Zelle neu)
      this.padAcc = 0;
      this.refresh(false);
    }
    const h = this.host.g.hh;
    const f = h?.funds ?? 0;
    if (f !== this.shownFunds && this.fundsEl) {
      this.shownFunds = f;
      this.fundsEl.textContent = `💰 ${money(f)}${this.host.g.settings.creative ? ' · Kreativ' : ''}`;
    }
    const lv = this.host.level();
    if (lv !== this.shownLevel) {
      this.shownLevel = lv;
      this.lvlBtns.forEach((b, i) => b.classList.toggle('on', i === lv));
      this.host.grid(true);
      this.hkey = NaN;
    }
  }

  undo(): void {
    if (!this._active) return;
    const r = this.hist.undo();
    if (!r) return this.host.toast('Nichts zum Rückgängigmachen.', '↶', 'info');
    if (r.res !== true) this.host.toast(r.res, '⛔', 'warn');
    else this.host.sfx('click');
    this.afterHistory();
  }
  redo(): void {
    if (!this._active) return;
    const r = this.hist.redo();
    if (!r) return this.host.toast('Nichts zum Wiederholen.', '↷', 'info');
    if (r.res !== true) this.host.toast(r.res, '⛔', 'warn');
    else this.host.sfx('click');
    this.afterHistory();
  }
  private afterHistory(): void {
    this.moving = null;
    this.updateButtons();
    this.refresh(true);
  }

  private escape(mayClose: boolean): void {
    if (this.drag || this.moving) return this.cancelAndRefresh();
    if (this.def && (this.tool === 'place' || this.tool === 'door' || this.tool === 'window' || this.tool === 'stairs')) {
      this.def = null;
      if (this.tool === 'place') this.tool = 'hand';
      this.render();
      return;
    }
    if (mayClose) this.close();
  }
  private cancelAndRefresh(): void {
    this.cancel();
    this.refresh(true);
  }

  private rotate(): void {
    const def = this.moving ? getDef(this.host.g.world.objs.get(this.moving)?.def ?? 'missing') : this.def ? getDef(this.def) : null;
    if (def?.mount === 'opening') this.rot = this.rot >= 2 ? 0 : 2;
    else this.rot = ((this.rot + 1) % 4) as Rot;
    this.host.sfx('click');
    this.refresh(true);
  }

  /** Entf: aufgenommenes oder angezeigtes Objekt verkaufen, sonst Wand unter dem Zeiger abreißen */
  private deleteHere(): void {
    const c = this.ctx();
    const id = this.moving ?? this.hoverObj ?? (this.sx >= 0 ? this.host.pickObject(this.sx, this.sy) : null);
    if (id && c.lot && c.g.world.objs.get(id)?.lot === c.lot.id) {
      this.moving = null;
      this.commit(planSell(c, id));
      return;
    }
    if (this.pt.ok) {
      const w = nearestWall(c.g.world, this.host.level(), this.pt.x, this.pt.z, 0.6);
      if (w) this.commit(planDeleteWalls(c, this.host.level(), [w]));
    }
  }

  private cycle(d: 1 | -1): void {
    if (this.view === 'buy') {
      const list = this.catalog();
      if (!list.length) return;
      const i = this.def ? list.findIndex((x) => x.id === this.def) : -1;
      const n = list[(i + d + list.length) % list.length]!;
      this.selectDef(n.id, 0, 0);
    } else if (this.view === 'build') {
      const i = BUILD_TOOLS.findIndex((x) => x[0] === this.tool);
      this.setTool(BUILD_TOOLS[(i + d + BUILD_TOOLS.length) % BUILD_TOOLS.length]![0]);
    }
  }

  // ---------- Auswahl ----------
  private setTool(t: Tool): void {
    this.cancel();
    this.tool = t;
    if (t === 'door' || t === 'window' || t === 'stairs') {
      const cur = this.def ? getDef(this.def) : null;
      if (!cur || cur.cat !== t) this.def = buyable().find((d) => d.cat === t)?.id ?? null;
      this.rot = 0;
    } else if (t !== 'place') this.def = null;
    this.render();
  }
  private selectDef(id: string, ca: number, cb: number): void {
    const def = getDef(id);
    this.cancel();
    this.def = id;
    this.ca = ca;
    this.cb = cb;
    if (def.mount === 'opening' && this.rot !== 0 && this.rot !== 2) this.rot = 0;
    if (this.view === 'build' && (def.cat === 'door' || def.cat === 'window' || def.cat === 'stairs')) this.tool = def.cat;
    else this.tool = 'place';
    this.render();
  }

  private catalog(): ReturnType<typeof buyable> {
    const q = this.search.trim().toLowerCase();
    return buyable().filter((d) => (this.cat === 'all' || d.cat === this.cat) && (!q || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || CATEGORIES[d.cat].name.toLowerCase().includes(q)));
  }

  // ---------- Oberfläche ----------
  private render(): void {
    if (!this._active) return;
    if (!this.panel) this.buildPanel();
    const body = clear(this.bodyEl!);
    for (const b of this.panel!.querySelectorAll<HTMLElement>('.bm-tab')) b.classList.toggle('on', b.dataset.v === this.view);
    if (this.view === 'build') this.renderBuild(body);
    else if (this.view === 'buy') this.renderBuy(body);
    else this.renderHomes(body);
    this.updateButtons();
    this.hkey = NaN;
    this.refresh(true);
    this.setHint();
  }

  private buildPanel(): void {
    const tab = (v: View, icon: string, label: string): HTMLElement =>
      btn([h('span', { class: 'bm-ico' }, icon), h('span', null, label)], () => {
        this.view = v;
        if (v !== 'homes') {
          this.tab = v;
          this.setTool(v === 'buy' ? 'hand' : 'wall');
        } else {
          this.cancel();
          this.render();
        }
      }, 'bm-tab', { 'data-v': v });
    this.undoBtn = btn('↶', () => this.undo(), 'icon', { title: 'Rückgängig (Strg+Z)', 'aria-label': 'Rückgängig' });
    this.redoBtn = btn('↷', () => this.redo(), 'icon', { title: 'Wiederholen (Strg+Y)', 'aria-label': 'Wiederholen' });
    this.lvlBtns = [0, 1].map((l) => btn(l === 0 ? 'EG' : 'OG', () => this.host.setLevel(l), 'bm-lvl', { title: l === 0 ? 'Erdgeschoss' : 'Obergeschoss' }));
    this.shownLevel = -1;
    this.shownFunds = NaN;
    this.fundsEl = h('span', { class: 'bm-funds' });
    this.hintEl = h('div', { class: 'bm-hint', 'aria-live': 'polite' });
    this.bodyEl = h('div', { class: 'bm-body' });
    this.panel = h(
      'div',
      { class: 'bm-panel', role: 'region', 'aria-label': 'Bau- und Kaufmodus', onpointerdown: (e: Event) => e.stopPropagation() },
      h(
        'div',
        { class: 'bm-head' },
        h('div', { class: 'bm-tabs' }, tab('build', '🔨', 'Bauen'), tab('buy', '🛋️', 'Kaufen'), tab('homes', '🏠', 'Fertighäuser')),
        h('div', { class: 'bm-acts' }, this.fundsEl, ...this.lvlBtns, this.undoBtn, this.redoBtn, btn('⟳', () => this.rotate(), 'icon', { title: 'Drehen (R)', 'aria-label': 'Drehen' }), btn('✕', () => this.close(), 'icon', { title: 'Schließen (Esc)', 'aria-label': 'Bau-/Kaufmodus schließen' })),
      ),
      this.hintEl,
      this.bodyEl,
    );
    this.host.uiRoot.appendChild(this.panel);
  }

  private toolRow(tools: [Tool, string, string][]): HTMLElement {
    return h(
      'div',
      { class: 'bm-row bm-tools' },
      tools.map(([t, icon, label]) => btn([h('span', { class: 'bm-ico' }, icon), h('span', null, label)], () => this.setTool(t), `bm-tool ${this.tool === t ? 'on' : ''}`, { 'aria-pressed': this.tool === t ? 'true' : 'false' })),
    );
  }
  private swatches(list: { name: string; color: string }[], cur: number, onPick: (i: number) => void, from = 0): HTMLElement {
    const row = h('div', { class: 'bm-row bm-swatches' });
    list.forEach((p, i) => {
      if (i < from) return;
      row.appendChild(
        h('button', {
          class: `bm-sw ${i === cur ? 'on' : ''}`,
          type: 'button',
          title: p.name,
          'aria-label': p.name,
          style: `background:${p.color}`,
          onclick: (e: Event) => {
            e.stopPropagation();
            onPick(i);
            this.render();
          },
        }),
      );
    });
    return row;
  }
  private itemCard(d: ReturnType<typeof buyable>[number]): HTMLElement {
    const price = effCost(this.host.g, d.price);
    return h(
      'button',
      {
        class: `bm-item ${this.def === d.id ? 'on' : ''}`,
        type: 'button',
        title: d.desc,
        onclick: (e: Event) => {
          e.stopPropagation();
          this.selectDef(d.id, 0, 0);
        },
      },
      h('span', { class: 'bm-ico big' }, CATEGORIES[d.cat].icon),
      h('span', { class: 'bm-name' }, d.name),
      h('span', { class: 'bm-price' }, price ? money(price) : 'gratis'),
    );
  }
  private colorRows(): HTMLElement | null {
    if (!this.def) return null;
    const d = getDef(this.def);
    if (!d.colorsA?.length && !d.colorsB?.length) return null;
    const mk = (cols: string[] | undefined, cur: number, set: (i: number) => void, label: string): HTMLElement | null =>
      cols && cols.length > 1 ? h('div', { class: 'bm-colors' }, h('small', { class: 'muted' }, label), this.swatches(cols.map((c, i) => ({ name: `${label} ${i + 1}`, color: c })), cur, set)) : null;
    return h(
      'div',
      { class: 'bm-row' },
      mk(d.colorsA, this.ca, (i) => (this.ca = i), 'Farbe'),
      mk(d.colorsB, this.cb, (i) => (this.cb = i), 'Akzent'),
    );
  }

  private renderBuild(body: HTMLElement): void {
    body.appendChild(this.toolRow(BUILD_TOOLS));
    const t = this.tool;
    if (t === 'floor' || t === 'room') {
      body.appendChild(h('div', { class: 'bm-sub' }, h('small', { class: 'muted' }, 'Boden'), this.swatches(FLOOR_TYPES, this.floorType, (i) => (this.floorType = i))));
      if (t === 'floor')
        body.appendChild(h('div', { class: 'bm-row' }, btn('🧹 Boden entfernen', () => {
          this.floorType = -1;
          this.render();
        }, `small ${this.floorType < 0 ? 'on' : ''}`)));
      if (t === 'room') {
        if (this.floorType < 0) this.floorType = 1;
        body.appendChild(h('div', { class: 'bm-sub' }, h('small', { class: 'muted' }, 'Innenwände'), this.swatches(WALL_PAINTS, this.paint, (i) => (this.paint = i))));
      }
    } else if (t === 'paint') {
      body.appendChild(h('div', { class: 'bm-sub' }, h('small', { class: 'muted' }, 'Farbe/Tapete'), this.swatches(WALL_PAINTS, this.paint, (i) => (this.paint = i))));
    } else if (t === 'door' || t === 'window' || t === 'stairs') {
      body.appendChild(h('div', { class: 'bm-row bm-grid' }, buyable().filter((d) => d.cat === t).map((d) => this.itemCard(d))));
      const cr = this.colorRows();
      if (cr) body.appendChild(cr);
    }
  }

  private renderBuy(body: HTMLElement): void {
    const search = h('input', {
      type: 'search',
      class: 'bm-search',
      placeholder: 'Suchen …',
      'aria-label': 'Katalog durchsuchen',
      value: this.search,
      oninput: (e: Event) => {
        this.search = (e.target as HTMLInputElement).value;
        fill();
      },
      onkeydown: (e: Event) => e.stopPropagation(),
    });
    const tools = this.toolRow(BUY_TOOLS);
    tools.appendChild(search);
    body.appendChild(tools);
    const cats = (Object.keys(CATEGORIES) as Category[]).filter((c) => buyable().some((d) => d.cat === c));
    body.appendChild(
      h(
        'div',
        { class: 'bm-row bm-cats' },
        h('button', { class: `chip ${this.cat === 'all' ? 'on' : ''}`, type: 'button', onclick: () => ((this.cat = 'all'), this.render()) }, '✨ Alle'),
        cats.map((c) => h('button', { class: `chip ${this.cat === c ? 'on' : ''}`, type: 'button', onclick: () => ((this.cat = c), this.render()) }, `${CATEGORIES[c].icon} ${CATEGORIES[c].name}`)),
      ),
    );
    const grid = h('div', { class: 'bm-row bm-grid' });
    const fill = (): void => {
      clear(grid);
      const list = this.catalog();
      if (!list.length) grid.appendChild(h('div', { class: 'muted bm-empty' }, 'Nichts gefunden.'));
      for (const d of list) grid.appendChild(this.itemCard(d));
    };
    fill();
    body.appendChild(grid);
    const cr = this.colorRows();
    if (cr) body.appendChild(cr);
  }

  private renderHomes(body: HTMLElement): void {
    const lot = this.host.lot();
    const g = this.host.g;
    const row = h('div', { class: 'bm-row bm-grid' });
    for (const m of MODEL_HOMES) {
      const fits = !!lot && templateFits(m.id, lot.id);
      const cost = fits && lot ? effCost(g, templateCost(g, lot, m.id)) : 0;
      row.appendChild(
        h(
          'div',
          { class: 'bm-home card' },
          h('b', null, `${m.id === 'empty' ? '🌱' : '🏠'} ${m.name}`),
          h('small', { class: 'muted' }, m.desc),
          h('div', { class: 'bm-price' }, !fits ? 'Passt nicht auf dein Grundstück' : cost >= 0 ? `Kosten: ${money(cost)}` : `Erlös: ${money(-cost)}`),
          btn('Anwenden', () => this.applyHome(m.id, m.name), `small primary ${fits ? '' : 'dis'}`, fits ? {} : { disabled: true }),
        ),
      );
    }
    body.appendChild(row);
  }

  private applyHome(id: string, name: string): void {
    const c = this.ctx();
    const plan = planTemplate(c, id, name);
    if (!plan.ok) return this.host.toast(plan.reason ?? 'Nicht möglich', '⛔', 'warn');
    const cost = effCost(c.g, plan.cost);
    const txt = `Die jetzige Bebauung wird abgerissen (Rückkauf 85 %) und durch „${name}“ ersetzt. ${cost >= 0 ? `Kosten: ${money(cost)}` : `Du erhältst ${money(-cost)}`}. Mit „Rückgängig“ lässt sich das zurücknehmen.`;
    confirmDlg('Fertighaus bauen?', txt, 'Bauen', () => {
      this.commit(plan);
      this.host.focusLot();
      this.render();
    });
  }

  private updateButtons(): void {
    if (this.undoBtn) this.undoBtn.disabled = !this.hist.canUndo;
    if (this.redoBtn) this.redoBtn.disabled = !this.hist.canRedo;
  }

  private setHint(): void {
    const el = this.hintEl;
    if (!el) return;
    const p = this.plan;
    let text: string;
    let bad = false;
    if (this.view === 'homes') text = 'Fertighaus wählen – die Kosten verrechnen den Rückkauf der jetzigen Bebauung.';
    else if (!this.host.lot()) {
      text = '⛔ Dein Haushalt hat kein Grundstück.';
      bad = true;
    } else if (p) {
      const cost = effCost(this.host.g, p.cost);
      const price = cost > 0 ? ` · ${money(cost)}` : cost < 0 ? ` · +${money(-cost)}` : '';
      if (p.ok) text = `✅ ${p.label}${price}`;
      else {
        text = `⛔ ${p.reason ?? 'Nicht möglich'}`;
        bad = true;
      }
    } else if (this.moving) text = HINTS.hand;
    else if (this.tool === 'place' && this.def) text = `${getDef(this.def).name}: ${HINTS.place}`;
    else text = HINTS[this.tool];
    if (el.textContent !== text) el.textContent = text;
    el.classList.toggle('bad', bad);
  }
}
