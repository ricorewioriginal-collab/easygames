// Streckeneditor: 2D-Draufsicht auf <canvas>, bearbeitet ein NetworkDef (gleiches Schema wie der Simulator).
import type { NetworkDef, SignalKind, StationDef, ThemeDef } from '../railway/schema';
import type { Issue } from '../railway/validate';
import type { SaveStore } from '../save/store';
import { ROUTES } from '../data/routes';
import { EditModel } from './model';
import { nearest, pointAt, polyLen, type P2 } from './geom';

/** Alle sichtbaren Texte (später übersetzbar) */
export const EDITOR_TEXT = {
  title: 'Streckeneditor',
  tools: { select: 'Auswählen', track: 'Gleis zeichnen', node: 'Weiche/Knoten', signal: 'Signal', platform: 'Bahnsteig/Station', crossing: 'Bahnübergang', delete: 'Löschen' },
  undo: 'Rückgängig', redo: 'Wiederholen', check: 'Prüfen', test: 'Testfahrt', save: 'Speichern', export: 'Export', import: 'Import', close: 'Schließen',
  straight: 'Gerade', curve: 'Bogen', endChain: 'Fertig',
  hint: {
    select: 'Tippen = auswählen, Knoten ziehen = verschieben, leere Fläche ziehen = verschieben, zwei Finger/Mausrad = zoomen',
    track: 'Anfang tippen, dann Ende tippen (Bogen: erst Kontrollpunkt, dann Ende). Fängt Knoten und Gleise in der Nähe.',
    trackCurve: 'Kontrollpunkt des Bogens tippen',
    trackEnd: 'Ende tippen – oder „Fertig“',
    node: 'Auf ein Gleis tippen, um dort einen Knoten (für eine Weiche) einzufügen',
    signal: 'Auf ein Gleis tippen – das Signal gilt in Richtung des näheren Gleisendes',
    platform: 'Auf ein Gleis tippen – Bahnsteig auf der angetippten Seite',
    crossing: 'Auf ein Gleis tippen, um einen Bahnübergang zu setzen',
    delete: 'Element antippen, um es zu löschen',
  },
  start: { title: 'Streckeneditor', empty: 'Neues leeres Netz', templates: 'Vorlage (Kopie einer Strecke)', saved: 'Gespeicherte Netze', importFile: 'Datei importieren', none: 'Noch keine gespeicherten Netze', cancel: 'Abbrechen', del: 'Löschen' },
  panel: {
    net: 'Netz', name: 'Name', terrain: 'Gelände', season: 'Jahreszeit', buildings: 'Bebauung', stats: (t: number, km: number, st: number) => `${t} Gleise · ${km.toFixed(1)} km · ${st} Stationen`,
    track: 'Gleis', vmax: 'Höchstgeschwindigkeit (km/h)', elec: 'Elektrifiziert', tunnel: 'Tunnel', bridge: 'Brücke', yard: 'Rangiergleis', length: 'Länge',
    node: 'Knoten', height: 'Höhe (m)', sw: 'Weiche', trunk: 'Stamm', legs: 'Stränge (gerade, abzweigend)', vDiv: 'Abzweig (km/h)', swap: 'Stränge tauschen',
    signal: 'Signal', kind: 'Art', kinds: { main: 'Hauptsignal', block: 'Blocksignal', shunt: 'Rangiersignal' } as Record<SignalKind, string>,
    dir: 'Richtung', dirs: { '1': 'a → b', '-1': 'b → a' } as Record<string, string>, off: 'Abstand zum Gleisende (m)',
    platform: 'Bahnsteig', station: 'Station', stKind: 'Stationsart', stKinds: { station: 'Bahnhof', halt: 'Haltepunkt', yard: 'Rangierbahnhof', depot: 'Betriebswerk', freight: 'Güterbahnhof' } as Record<StationDef['kind'], string>,
    side: 'Seite', sides: { L: 'links', R: 'rechts' } as Record<string, string>, nr: 'Gleisnummer', from: 'von (m)', to: 'bis (m)', pax: 'Fahrgäste/h',
    crossing: 'Bahnübergang', pos: 'Position (m)', industry: 'Anschluss', del: 'Löschen',
    terrains: { plain: 'Flachland', hills: 'Hügel', mountain: 'Gebirge', city: 'Stadt', coast: 'Küste', river: 'Fluss' } as Record<ThemeDef['terrain'], string>,
    seasons: { spring: 'Frühling', summer: 'Sommer', autumn: 'Herbst', winter: 'Winter' } as Record<string, string>,
    builds: { village: 'Dorf', town: 'Kleinstadt', city: 'Großstadt', neon: 'Neon', alpine: 'Alpin', harbour: 'Hafen' } as Record<string, string>,
  },
  issues: 'Prüfergebnis', noIssues: 'Keine Probleme gefunden', errors: (n: number) => `${n} Fehler`, warns: (n: number) => `${n} Warnungen`,
  testBlocked: 'Testfahrt nicht möglich – bitte zuerst die Fehler beheben.',
  saved: 'Netz gespeichert', saveFail: 'Speichern fehlgeschlagen', exported: 'Datei wird heruntergeladen',
  imported: 'Netz importiert', importFail: 'Import fehlgeschlagen: ',
  unsaved: 'Ungespeicherte Änderungen verwerfen?', discard: 'Verwerfen', keep: 'Weiter bearbeiten', saveClose: 'Speichern & schließen',
  station: (n: number) => `Bahnhof ${n}`,
  panelToggle: 'Eigenschaften',
};

type Tool = 'select' | 'track' | 'node' | 'signal' | 'platform' | 'crossing' | 'delete';
type Sel =
  | { k: 'node'; id: string } | { k: 'track'; id: string } | { k: 'signal'; id: string } | { k: 'crossing'; id: string }
  | { k: 'platform'; id: string; idx: number } | { k: 'industry'; id: string } | null;

const T = EDITOR_TEXT;
const SNAP_PX = 12;

const CSS = `
.rre{position:absolute;inset:0;display:flex;flex-direction:column;background:#11161c;color:#e8edf2;font:14px/1.3 system-ui,sans-serif;z-index:50;touch-action:none;user-select:none}
.rre button{min-height:44px;min-width:44px;padding:4px 10px;border:1px solid #34404c;border-radius:8px;background:#1d252e;color:inherit;font:inherit;cursor:pointer}
.rre button:disabled{opacity:.4}
.rre button.on{background:#2f6fd6;border-color:#4d8bf0}
.rre-bar{display:flex;gap:6px;padding:6px;overflow-x:auto;flex:none;background:#161d24;border-bottom:1px solid #2a343f;scrollbar-width:thin}
.rre-bar button{white-space:nowrap;flex:none}
.rre-bar .sep{flex:none;width:1px;background:#2a343f;margin:0 2px}
.rre-sub{display:flex;gap:6px;padding:4px 6px;align-items:center;flex:none;background:#131a20;min-height:32px;font-size:13px;color:#aab6c2}
.rre-sub button{min-height:36px}
.rre-main{flex:1;display:flex;min-height:0}
.rre-cv{flex:1;position:relative;min-width:0}
.rre-cv canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block}
.rre-side{width:310px;flex:none;overflow:auto;background:#161d24;border-left:1px solid #2a343f;padding:8px;user-select:text}
.rre-side h3{margin:6px 0;font-size:15px}
.rre-row{display:flex;flex-direction:column;gap:3px;margin:6px 0}
.rre-row.ck{flex-direction:row;align-items:center;gap:8px}
.rre-row input,.rre-row select{min-height:40px;padding:4px 8px;border-radius:6px;border:1px solid #34404c;background:#0f1419;color:inherit;font:inherit}
.rre-row.ck input{width:26px;height:26px;min-height:0}
.rre-iss{list-style:none;margin:0;padding:0}
.rre-iss li{padding:8px;border-radius:6px;margin:3px 0;background:#1d252e;cursor:pointer}
.rre-iss li.error{border-left:4px solid #e5484d}.rre-iss li.warn{border-left:4px solid #f5a524}
.rre-toast{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);background:#000c;padding:10px 16px;border-radius:8px;pointer-events:none;max-width:90%;text-align:center}
.rre-modal{position:absolute;inset:0;background:#000a;display:flex;align-items:center;justify-content:center;z-index:5}
.rre-box{background:#1a2129;border:1px solid #34404c;border-radius:12px;padding:14px;max-width:min(520px,94vw);max-height:88vh;overflow:auto;display:flex;flex-direction:column;gap:8px}
.rre-box h2{margin:0 0 4px;font-size:18px}.rre-box h4{margin:8px 0 2px;color:#aab6c2;font-size:13px}
.rre-box .r{display:flex;gap:6px}.rre-box .r button:first-child{flex:1;text-align:left}
.rre-ptog{display:none}
@media (max-width:720px){
 .rre-main{flex-direction:column}
 .rre-side{width:auto;max-height:42vh;border-left:0;border-top:1px solid #2a343f}
 .rre-side.hide{display:none}
 .rre-ptog{display:inline-block}
}`;

const vColor = (v: number) => (v <= 40 ? '#e5484d' : v <= 80 ? '#f5a524' : v <= 120 ? '#e9d84a' : v <= 160 ? '#46c46e' : '#3fa7ff');

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, any> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'class') e.className = v; else if (v !== undefined && v !== false) (e as any)[k] = v;
  }
  for (const c of kids) e.append(c);
  return e;
}

export class TrackEditor {
  private host: HTMLElement;
  private opts: { onTestDrive(def: NetworkDef): void; onClose(): void; store: SaveStore };
  private root: HTMLDivElement | null = null;
  private cv!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private side!: HTMLDivElement;
  private sub!: HTMLDivElement;
  private btn: Record<string, HTMLButtonElement> = {};
  private model: EditModel | null = null;
  private tool: Tool = 'select';
  private curve = false;
  private sel: Sel = null;
  private issues: Issue[] | null = null;
  // Ansicht: Mittelpunkt (Welt) und Maßstab (px pro m, CSS-Pixel)
  private cx = 0; private cz = 0; private sc = 0.2;
  private w = 1; private h = 1; private dpr = 1;
  private dirty = true; private raf = 0;
  private ptrs = new Map<number, { x: number; y: number; x0: number; y0: number }>();
  private drag: { kind: 'pan' | 'node' | 'pinch'; id?: string; moved: boolean; d0?: number; sc0?: number } | null = null;
  private pending: { start: P2; ctrl?: P2 } | null = null;
  private hover: P2 | null = null;
  private unsaved = false;
  private toastT: ReturnType<typeof setTimeout> | null = null;
  private ro: ResizeObserver | null = null;
  private fileIn!: HTMLInputElement;
  private offKey: (() => void) | null = null;

  constructor(host: HTMLElement, opts: { onTestDrive(def: NetworkDef): void; onClose(): void; store: SaveStore }) {
    this.host = host; this.opts = opts;
  }

  /** Öffnet den Editor; ohne Netz erscheint die Startauswahl (neu, Vorlage, gespeichert, Import) */
  open(def?: NetworkDef): void {
    if (!this.root) this.build();
    if (def) this.setModel(new EditModel(JSON.parse(JSON.stringify(def))));
    else { if (!this.model) this.setModel(EditModel.empty()); void this.startDialog(); }
  }

  dispose(): void {
    cancelAnimationFrame(this.raf); this.ro?.disconnect(); this.offKey?.();
    if (this.toastT) clearTimeout(this.toastT);
    this.root?.remove(); this.root = null; this.model = null;
  }

  // ---------------------------------------------------------------- Aufbau
  private build() {
    if (!document.getElementById('rre-css')) document.head.append(el('style', { id: 'rre-css', textContent: CSS }));
    const b = (key: string, label: string, fn: () => void, title?: string) => (this.btn[key] = el('button', { textContent: label, title: title ?? label, onclick: fn }));
    const tools: [Tool, string][] = [['select', '👆'], ['track', '🛤️'], ['node', '🔀'], ['signal', '🚦'], ['platform', '🚉'], ['crossing', '🚸'], ['delete', '🗑️']];
    const bar = el('div', { class: 'rre-bar' },
      ...tools.map(([t, ic]) => b('t_' + t, `${ic} ${T.tools[t]}`, () => this.setTool(t))),
      el('span', { class: 'sep' }),
      b('undo', `↶ ${T.undo}`, () => this.model?.undo()), b('redo', `↷ ${T.redo}`, () => this.model?.redo()),
      el('span', { class: 'sep' }),
      b('check', `✔ ${T.check}`, () => this.check()), b('test', `▶ ${T.test}`, () => this.testDrive()),
      b('save', `💾 ${T.save}`, () => void this.saveNet()), b('export', `⬇ ${T.export}`, () => this.exportFile()), b('import', `⬆ ${T.import}`, () => this.fileIn.click()),
      b('ptog', T.panelToggle, () => this.side.classList.toggle('hide')),
      b('close', `✕ ${T.close}`, () => this.close()),
    );
    this.btn.ptog.classList.add('rre-ptog');
    this.sub = el('div', { class: 'rre-sub' });
    this.cv = el('canvas');
    this.side = el('div', { class: 'rre-side' });
    this.fileIn = el('input', { type: 'file', accept: '.json,application/json', style: 'display:none', onchange: () => this.importFile() });
    this.root = el('div', { class: 'rre' }, bar, this.sub, el('div', { class: 'rre-main' }, el('div', { class: 'rre-cv' }, this.cv), this.side), this.fileIn);
    this.host.append(this.root);
    this.ctx = this.cv.getContext('2d')!;
    this.bindInput();
    const resize = () => this.resize();
    if (typeof ResizeObserver !== 'undefined') { this.ro = new ResizeObserver(resize); this.ro.observe(this.cv.parentElement!); } else window.addEventListener('resize', resize);
    this.resize();
    this.setTool('select');
    const loop = () => { this.raf = requestAnimationFrame(loop); if (this.dirty) { this.dirty = false; this.draw(); } };
    this.raf = requestAnimationFrame(loop);
  }

  private setModel(m: EditModel) {
    this.model = m; this.sel = null; this.issues = null; this.pending = null; this.unsaved = false;
    m.onChange = () => { this.unsaved = true; if (this.sel && !this.selExists()) this.sel = null; this.refresh(); };
    this.fit(); this.refresh();
  }

  private refresh() {
    this.dirty = true;
    if (this.model) { this.btn.undo.disabled = !this.model.canUndo; this.btn.redo.disabled = !this.model.canRedo; }
    this.renderSub(); this.renderSide();
  }

  private resize() {
    const r = this.cv.parentElement!.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.cv.width = Math.round(this.w * this.dpr); this.cv.height = Math.round(this.h * this.dpr);
    this.dirty = true;
  }

  private fit() {
    const d = this.model?.def; if (!d) return;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const n of d.nodes) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); z0 = Math.min(z0, n.z); z1 = Math.max(z1, n.z); }
    for (const t of d.tracks) for (let i = 0; i < t.pts.length; i += 3) { x0 = Math.min(x0, t.pts[i]); x1 = Math.max(x1, t.pts[i]); z0 = Math.min(z0, t.pts[i + 2]); z1 = Math.max(z1, t.pts[i + 2]); }
    if (!Number.isFinite(x0)) { this.cx = 0; this.cz = 0; this.sc = 0.5; return; }
    this.cx = (x0 + x1) / 2; this.cz = (z0 + z1) / 2;
    this.sc = Math.min(4, 0.9 * Math.min(this.w / Math.max(50, x1 - x0), this.h / Math.max(50, z1 - z0)));
    this.dirty = true;
  }

  // ---------------------------------------------------------------- Koordinaten
  private toScr(x: number, z: number): [number, number] { return [(x - this.cx) * this.sc + this.w / 2, (z - this.cz) * this.sc + this.h / 2]; }
  private toWorld(sx: number, sy: number): P2 { return { x: (sx - this.w / 2) / this.sc + this.cx, z: (sy - this.h / 2) / this.sc + this.cz }; }
  private evPos(e: PointerEvent | WheelEvent): [number, number] { const r = this.cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }

  // ---------------------------------------------------------------- Eingabe
  private bindInput() {
    const cv = this.cv;
    cv.addEventListener('pointerdown', (e) => {
      try { cv.setPointerCapture(e.pointerId); } catch { /* z. B. bereits beendeter Zeiger */ }
      const [x, y] = this.evPos(e);
      this.ptrs.set(e.pointerId, { x, y, x0: x, y0: y });
      if (this.ptrs.size === 2) {
        const [a, b] = [...this.ptrs.values()];
        if (this.drag?.kind === 'node') this.model?.end();
        this.drag = { kind: 'pinch', moved: true, d0: Math.hypot(a.x - b.x, a.y - b.y), sc0: this.sc };
        return;
      }
      if (this.ptrs.size > 2) return;
      const w = this.toWorld(x, y);
      const hit = this.tool === 'select' ? this.hitNode(w) : null;
      if (hit && this.model) { this.model.begin(); this.drag = { kind: 'node', id: hit, moved: false }; this.sel = { k: 'node', id: hit }; this.renderSide(); }
      else this.drag = { kind: 'pan', moved: false };
    });
    cv.addEventListener('pointermove', (e) => {
      const [x, y] = this.evPos(e);
      const p = this.ptrs.get(e.pointerId);
      if (!p) { if (this.tool === 'track' && e.pointerType === 'mouse') { this.hover = this.snapPoint(this.toWorld(x, y)); this.dirty = true; } return; }
      const dx = x - p.x, dy = y - p.y; p.x = x; p.y = y;
      const d = this.drag; if (!d) return;
      if (Math.hypot(x - p.x0, y - p.y0) > 6) d.moved = true;
      if (d.kind === 'pinch' && this.ptrs.size >= 2) {
        const [a, b] = [...this.ptrs.values()];
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, before = this.toWorld(mx, my);
        this.sc = Math.max(0.005, Math.min(20, d.sc0! * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, d.d0!)));
        const after = this.toWorld(mx, my);
        this.cx += before.x - after.x; this.cz += before.z - after.z;
        this.cx -= dx / 2 / this.sc; this.cz -= dy / 2 / this.sc;
      } else if (d.kind === 'pan' && d.moved) { this.cx -= dx / this.sc; this.cz -= dy / this.sc; }
      else if (d.kind === 'node' && d.moved && this.model) { const w = this.toWorld(x, y); this.model.moveNode(d.id!, w.x, w.z); this.renderSide(); }
      if (this.tool === 'track') this.hover = this.snapPoint(this.toWorld(x, y));
      this.dirty = true;
    });
    const up = (e: PointerEvent) => {
      const p = this.ptrs.get(e.pointerId); if (!p) return;
      this.ptrs.delete(e.pointerId);
      const d = this.drag;
      if (d?.kind === 'pinch') { if (this.ptrs.size === 0) this.drag = null; return; }
      this.drag = null;
      if (d?.kind === 'node') { this.model?.end(); if (!d.moved) this.renderSide(); return; }
      if (d && !d.moved && e.type === 'pointerup') this.tap(this.toWorld(p.x, p.y));
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      const [x, y] = this.evPos(e), before = this.toWorld(x, y);
      this.sc = Math.max(0.005, Math.min(20, this.sc * Math.exp(-e.deltaY * 0.0015)));
      const after = this.toWorld(x, y); this.cx += before.x - after.x; this.cz += before.z - after.z; this.dirty = true;
    }, { passive: false });
    const key = (e: KeyboardEvent) => {
      if (!this.root || (e.target as HTMLElement)?.closest?.('input,select,textarea')) return;
      const m = this.model; if (!m) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) m.redo(); else m.undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); m.redo(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { if (this.sel) { e.preventDefault(); this.deleteSel(); } }
      else if (e.key === 'Escape') { this.pending = null; this.sel = null; this.refresh(); }
    };
    window.addEventListener('keydown', key);
    this.offKey = () => window.removeEventListener('keydown', key);
  }

  private setTool(t: Tool) {
    this.tool = t; this.pending = null; this.hover = null;
    for (const k of Object.keys(T.tools)) this.btn['t_' + k]?.classList.toggle('on', k === t);
    this.refresh();
  }

  private renderSub() {
    const s = this.sub; s.textContent = '';
    if (this.tool === 'track') {
      s.append(
        el('button', { textContent: T.straight, class: this.curve ? '' : 'on', onclick: () => { this.curve = false; this.pending = null; this.refresh(); } }),
        el('button', { textContent: T.curve, class: this.curve ? 'on' : '', onclick: () => { this.curve = true; this.pending = null; this.refresh(); } }),
      );
      if (this.pending) s.append(el('button', { textContent: T.endChain, onclick: () => { this.pending = null; this.refresh(); } }));
      s.append(el('span', { textContent: !this.pending ? T.hint.track : this.curve && !this.pending.ctrl ? T.hint.trackCurve : T.hint.trackEnd }));
    } else s.append(el('span', { textContent: T.hint[this.tool] }));
  }

  // ---------------------------------------------------------------- Treffer
  private tol() { return SNAP_PX / this.sc; }
  private hitNode(w: P2): string | null {
    let best: string | null = null, bd = this.tol();
    for (const n of this.model?.def.nodes ?? []) { const d = Math.hypot(n.x - w.x, n.z - w.z); if (d < bd) { bd = d; best = n.id; } }
    return best;
  }
  private hitTrack(w: P2): { id: string; s: number; d: number } | null {
    let best: { id: string; s: number; d: number } | null = null; const tol = this.tol();
    for (const t of this.model?.def.tracks ?? []) {
      const r = nearest(t.pts, w.x, w.z);
      if (r.d < tol && (!best || r.d < best.d)) best = { id: t.id, s: r.s, d: r.d };
    }
    return best;
  }
  private sigPos(sgId: string): { x: number; z: number; dx: number; dz: number } | null {
    const m = this.model!; const sg = m.def.signals.find((x) => x.id === sgId); if (!sg) return null;
    const t = m.def.tracks.find((x) => x.id === sg.track); if (!t) return null;
    const L = polyLen(t.pts), off = Math.min(sg.off ?? 12, L * 0.5), p = pointAt(t.pts, sg.dir > 0 ? L - off : off);
    return { x: p.x, z: p.z, dx: p.dx * sg.dir, dz: p.dz * sg.dir };
  }
  /** Element unter dem Punkt (Reihenfolge: Signal, Bahnübergang, Bahnsteig, Anschluss, Knoten, Gleis) */
  private hitAny(w: P2): Sel {
    const m = this.model!, tol = this.tol();
    // Signal steht 7 px rechts neben dem Gleis (wie in draw())
    for (const sg of m.def.signals) { const p = this.sigPos(sg.id); if (p && Math.hypot(p.x - p.dz * 7 / this.sc - w.x, p.z + p.dx * 7 / this.sc - w.z) < tol) return { k: 'signal', id: sg.id }; }
    for (const c of m.def.crossings) { const t = m.def.tracks.find((x) => x.id === c.track); if (!t) continue; const p = pointAt(t.pts, c.s); if (Math.hypot(p.x - w.x, p.z - w.z) < tol) return { k: 'crossing', id: c.id }; }
    const tr = this.hitTrack(w);
    if (tr) {
      for (const st of m.def.stations) for (let i = 0; i < st.platforms.length; i++) { const pl = st.platforms[i]; if (pl.track === tr.id && tr.s >= pl.s0 - 2 && tr.s <= pl.s1 + 2) return { k: 'platform', id: st.id, idx: i }; }
      for (const ind of m.def.industries) if (ind.track === tr.id && tr.s >= ind.s0 && tr.s <= ind.s1) return { k: 'industry', id: ind.id };
    }
    const n = this.hitNode(w); if (n) return { k: 'node', id: n };
    return tr ? { k: 'track', id: tr.id } : null;
  }
  /** Fangpunkt beim Zeichnen: Knoten > Gleis > freie Stelle */
  private snapPoint(w: P2): P2 {
    const n = this.hitNode(w); if (n) { const nd = this.model!.node(n); return { x: nd.x, z: nd.z }; }
    const tr = this.hitTrack(w); if (tr) { const p = pointAt(this.model!.track(tr.id).pts, tr.s); return { x: p.x, z: p.z }; }
    return w;
  }
  /** Knoten an Weltpunkt finden oder erzeugen (Gleis wird ggf. geteilt) – nur innerhalb einer Transaktion aufrufen */
  private resolveNode(w: P2, y: number): string {
    const m = this.model!;
    const n = this.hitNode(w); if (n) return n;
    const tr = this.hitTrack(w);
    if (tr) { const L = m.trackLen(tr.id); if (tr.s < 3) return m.track(tr.id).a; if (tr.s > L - 3) return m.track(tr.id).b; return m.splitTrack(tr.id, tr.s); }
    return m.addNode(w.x, w.z, y);
  }

  // ---------------------------------------------------------------- Werkzeugaktionen
  private tap(w: P2) {
    const m = this.model; if (!m) return;
    try {
      switch (this.tool) {
        case 'select': this.sel = this.hitAny(w); this.refresh(); break;
        case 'delete': { const s = this.hitAny(w); if (s) { this.sel = s; this.deleteSel(); } break; }
        case 'track': this.trackTap(w); break;
        case 'node': {
          const tr = this.hitTrack(w); if (!tr) break;
          const id = m.transact(() => { const nid = m.splitTrack(tr.id, tr.s); m.autoSwitches(); return nid; });
          this.sel = { k: 'node', id }; this.refresh(); break;
        }
        case 'signal': {
          const tr = this.hitTrack(w); if (!tr) break;
          const L = m.trackLen(tr.id), dir: 1 | -1 = tr.s > L / 2 ? 1 : -1;
          const id = m.addSignal(tr.id, dir, 'main', undefined, Math.round(Math.max(5, Math.min(L * 0.5, dir > 0 ? L - tr.s : tr.s))));
          this.sel = { k: 'signal', id }; this.refresh(); break;
        }
        case 'platform': {
          const tr = this.hitTrack(w); if (!tr) break;
          const t = m.track(tr.id), L = m.trackLen(tr.id), half = Math.min(100, L / 2);
          const s0 = Math.max(0, Math.min(L - 2 * half, tr.s - half));
          const p = pointAt(t.pts, tr.s), cross = p.dx * (w.z - p.z) - p.dz * (w.x - p.x);
          const side: 'L' | 'R' = cross > 0 ? 'R' : 'L'; // z = Süden: positives Kreuzprodukt = rechts in Fahrtrichtung a→b
          const name = this.nearStation(p) ?? T.station(m.def.stations.length + 1);
          const sid = m.addPlatform(tr.id, s0, s0 + 2 * half, side, name);
          const st = m.def.stations.find((x) => x.id === sid)!;
          this.sel = { k: 'platform', id: sid, idx: st.platforms.length - 1 }; this.refresh(); break;
        }
        case 'crossing': { const tr = this.hitTrack(w); if (!tr) break; const id = m.addCrossing(tr.id, tr.s); this.sel = { k: 'crossing', id }; this.refresh(); break; }
      }
    } catch (e) { this.toast(String((e as Error).message)); }
  }
  private nearStation(p: P2): string | null {
    const m = this.model!;
    for (const st of m.def.stations) for (const pl of st.platforms) {
      const t = m.def.tracks.find((x) => x.id === pl.track); if (!t) continue;
      const c = pointAt(t.pts, (pl.s0 + pl.s1) / 2); if (Math.hypot(c.x - p.x, c.z - p.z) < 300) return st.name;
    }
    return null;
  }
  private trackTap(w: P2) {
    const m = this.model!;
    const pt = this.snapPoint(w);
    if (!this.pending) { this.pending = { start: pt }; this.refresh(); return; }
    if (this.curve && !this.pending.ctrl) { this.pending.ctrl = w; this.refresh(); return; }
    const { start, ctrl } = this.pending;
    if (Math.hypot(pt.x - start.x, pt.z - start.z) < this.tol()) { this.pending = null; this.refresh(); return; } // gleicher Punkt = beenden
    let endNode = '';
    m.transact(() => {
      const sn = this.hitNode(start), y = sn ? m.node(sn).y : (m.def.nodes[0]?.y ?? 0);
      const a = this.resolveNode(start, y);
      const b = this.resolveNode(pt, m.node(a).y);
      if (a === b) return;
      const vmax = this.lastVmax();
      m.addTrack(a, b, { ctrl: ctrl ?? null, vmax });
      m.autoSwitches();
      endNode = b;
    });
    // Kette: Ende wird neuer Anfang
    if (endNode) { const n = m.node(endNode); this.pending = { start: { x: n.x, z: n.z } }; } else this.pending = null;
    this.refresh();
  }
  private lastVmax(): number {
    const s = this.sel; const m = this.model!;
    if (s?.k === 'track') { const t = m.def.tracks.find((x) => x.id === s.id); if (t) return t.vmax; }
    return m.def.tracks[m.def.tracks.length - 1]?.vmax ?? 100;
  }

  private selExists(): boolean {
    const s = this.sel, d = this.model?.def; if (!s || !d) return false;
    switch (s.k) {
      case 'node': return d.nodes.some((x) => x.id === s.id);
      case 'track': return d.tracks.some((x) => x.id === s.id);
      case 'signal': return d.signals.some((x) => x.id === s.id);
      case 'crossing': return d.crossings.some((x) => x.id === s.id);
      case 'industry': return d.industries.some((x) => x.id === s.id);
      case 'platform': return !!d.stations.find((x) => x.id === s.id)?.platforms[s.idx];
    }
  }
  private deleteSel() {
    const m = this.model, s = this.sel; if (!m || !s) return;
    try {
      m.transact(() => {
        switch (s.k) {
          case 'node': m.deleteNode(s.id); break;
          case 'track': m.deleteTrack(s.id); break;
          case 'signal': m.deleteSignal(s.id); break;
          case 'crossing': m.deleteCrossing(s.id); break;
          case 'industry': m.deleteIndustry(s.id); break;
          case 'platform': m.deletePlatform(s.id, s.idx); break;
        }
        if (s.k === 'node' || s.k === 'track') m.autoSwitches();
      });
    } catch (e) { this.toast(String((e as Error).message)); }
    this.sel = null; this.refresh();
  }

  // ---------------------------------------------------------------- Eigenschaften
  private renderSide() {
    const side = this.side, m = this.model; if (!side || !m) return;
    side.textContent = '';
    const d = m.def, s = this.sel;
    const row = (label: string, input: HTMLElement) => el('div', { class: 'rre-row' }, el('label', { textContent: label }), input);
    const text = (v: string, fn: (v: string) => void) => el('input', { type: 'text', value: v, onchange: (e: Event) => fn((e.target as HTMLInputElement).value.trim()) });
    const numIn = (v: number | undefined, fn: (v: number) => void, step = 1) => el('input', { type: 'number', step: String(step), value: v === undefined ? '' : String(v), onchange: (e: Event) => { const n = Number((e.target as HTMLInputElement).value); if (Number.isFinite(n)) fn(n); } });
    const sel = <K extends string>(v: K | undefined, opts: Record<K, string>, fn: (v: K) => void) => {
      const e = el('select', { onchange: (ev: Event) => fn((ev.target as HTMLSelectElement).value as K) });
      for (const [k, l] of Object.entries(opts) as [K, string][]) e.append(el('option', { value: k, textContent: l, selected: k === v }));
      return e;
    };
    const ck = (label: string, v: boolean | undefined, fn: (v: boolean) => void) => el('label', { class: 'rre-row ck' }, el('input', { type: 'checkbox', checked: !!v, onchange: (e: Event) => fn((e.target as HTMLInputElement).checked) }), label);
    const del = () => el('button', { textContent: `🗑️ ${T.panel.del}`, onclick: () => this.deleteSel() });
    const safe = (fn: () => void) => { try { fn(); } catch (e) { this.toast(String((e as Error).message)); } };

    if (!s) {
      const km = d.tracks.reduce((a, t) => a + polyLen(t.pts), 0) / 1000;
      side.append(el('h3', { textContent: T.panel.net }),
        row(T.panel.name, text(d.name, (v) => v && safe(() => m.setNetProps({ name: v })))),
        row(T.panel.terrain, sel(d.theme.terrain, T.panel.terrains, (v) => safe(() => m.setNetProps({ theme: { terrain: v } })))),
        row(T.panel.season, sel(d.theme.season ?? 'summer', T.panel.seasons as Record<NonNullable<ThemeDef['season']>, string>, (v) => safe(() => m.setNetProps({ theme: { season: v } })))),
        row(T.panel.buildings, sel(d.theme.buildings ?? 'village', T.panel.builds as Record<NonNullable<ThemeDef['buildings']>, string>, (v) => safe(() => m.setNetProps({ theme: { buildings: v } })))),
        el('p', { textContent: T.panel.stats(d.tracks.length, km, d.stations.length) }));
    } else if (s.k === 'track') {
      const t = d.tracks.find((x) => x.id === s.id); if (!t) return;
      side.append(el('h3', { textContent: `${T.panel.track} ${t.id}` }),
        row(T.panel.name, text(t.name ?? '', (v) => safe(() => m.setTrackProps(t.id, { name: v })))),
        row(T.panel.vmax, numIn(t.vmax, (v) => safe(() => m.setTrackProps(t.id, { vmax: v })), 5)),
        ck(T.panel.elec, t.elec, (v) => safe(() => m.setTrackProps(t.id, { elec: v }))),
        ck(T.panel.tunnel, t.tunnel, (v) => safe(() => m.setTrackProps(t.id, { tunnel: v }))),
        ck(T.panel.bridge, t.bridge, (v) => safe(() => m.setTrackProps(t.id, { bridge: v }))),
        ck(T.panel.yard, t.yard, (v) => safe(() => m.setTrackProps(t.id, { yard: v }))),
        el('p', { textContent: `${T.panel.length}: ${Math.round(polyLen(t.pts))} m · ${t.a} → ${t.b}` }), del());
    } else if (s.k === 'node') {
      const n = d.nodes.find((x) => x.id === s.id); if (!n) return;
      side.append(el('h3', { textContent: `${T.panel.node} ${n.id}` }), el('p', { textContent: `x ${Math.round(n.x)} · z ${Math.round(n.z)}` }),
        row(T.panel.height, numIn(n.y, (v) => safe(() => m.setNodeY(n.id, v)), 0.5)));
      const sw = d.switches.find((x) => x.node === n.id);
      if (sw) side.append(el('h3', { textContent: `${T.panel.sw} ${sw.id}` }), el('p', { textContent: `${T.panel.trunk}: ${sw.trunk} · ${T.panel.legs}: ${sw.legs.join(', ')}` }),
        row(T.panel.vDiv, numIn(sw.vDiv ?? 60, (v) => safe(() => m.setSwitchProps(sw.id, { vDiv: v })), 5)),
        el('button', { textContent: `⇄ ${T.panel.swap}`, onclick: () => safe(() => m.setSwitchProps(sw.id, { swapLegs: true })) }));
      side.append(del());
    } else if (s.k === 'signal') {
      const g = d.signals.find((x) => x.id === s.id); if (!g) return;
      side.append(el('h3', { textContent: `${T.panel.signal} ${g.id}` }),
        row(T.panel.name, text(g.name ?? '', (v) => safe(() => m.setSignalProps(g.id, { name: v })))),
        row(T.panel.kind, sel(g.kind, T.panel.kinds, (v) => safe(() => m.setSignalProps(g.id, { kind: v })))),
        row(T.panel.dir, sel(String(g.dir), T.panel.dirs, (v) => safe(() => m.setSignalProps(g.id, { dir: Number(v) as 1 | -1 })))),
        row(T.panel.off, numIn(g.off ?? 12, (v) => safe(() => m.setSignalProps(g.id, { off: v })))), del());
    } else if (s.k === 'platform') {
      const st = d.stations.find((x) => x.id === s.id), pl = st?.platforms[s.idx]; if (!st || !pl) return;
      side.append(el('h3', { textContent: `${T.panel.station}` }),
        row(T.panel.name, text(st.name, (v) => v && safe(() => m.setStationProps(st.id, { name: v })))),
        row(T.panel.stKind, sel(st.kind, T.panel.stKinds, (v) => safe(() => m.setStationProps(st.id, { kind: v })))),
        row(T.panel.pax, numIn(st.pax ?? 0, (v) => safe(() => m.setStationProps(st.id, { pax: v })), 10)),
        el('h3', { textContent: `${T.panel.platform} (${pl.track})` }),
        row(T.panel.nr, text(pl.nr, (v) => v && safe(() => m.setPlatformProps(st.id, s.idx, { nr: v })))),
        row(T.panel.side, sel(pl.side, T.panel.sides as Record<'L' | 'R', string>, (v) => safe(() => m.setPlatformProps(st.id, s.idx, { side: v })))),
        row(T.panel.from, numIn(pl.s0, (v) => safe(() => m.setPlatformProps(st.id, s.idx, { s0: v })))),
        row(T.panel.to, numIn(pl.s1, (v) => safe(() => m.setPlatformProps(st.id, s.idx, { s1: v })))), del());
    } else if (s.k === 'crossing') {
      const c = d.crossings.find((x) => x.id === s.id); if (!c) return;
      side.append(el('h3', { textContent: `${T.panel.crossing} ${c.id}` }), el('p', { textContent: `${T.panel.pos}: ${c.s} (${c.track})` }), del());
    } else if (s.k === 'industry') {
      const c = d.industries.find((x) => x.id === s.id); if (!c) return;
      side.append(el('h3', { textContent: `${T.panel.industry}: ${c.name}` }), el('p', { textContent: `${c.cargo.join(', ')} · ${c.track} ${c.s0}–${c.s1} m` }), del());
    }
    if (this.issues) this.renderIssues();
  }

  private renderIssues() {
    const is = this.issues!; const e = is.filter((i) => i.sev === 'error').length, w = is.length - e;
    this.side.append(el('h3', { textContent: `${T.issues}: ${is.length ? `${T.errors(e)}, ${T.warns(w)}` : T.noIssues}` }));
    const ul = el('ul', { class: 'rre-iss' });
    for (const i of is.slice(0, 200)) ul.append(el('li', { class: i.sev, textContent: i.msg, onclick: () => this.focus(i.ref) }));
    this.side.append(ul);
  }

  private focus(ref?: string) {
    const m = this.model; if (!m || !ref) return;
    const d = m.def; let p: P2 | null = null;
    const n = d.nodes.find((x) => x.id === ref) ?? d.nodes.find((x) => x.id === d.switches.find((s) => s.id === ref)?.node);
    if (n) { p = n; this.sel = { k: 'node', id: n.id }; }
    const t = d.tracks.find((x) => x.id === ref);
    if (!p && t) { p = pointAt(t.pts, polyLen(t.pts) / 2); this.sel = { k: 'track', id: t.id }; }
    if (!p && d.signals.some((x) => x.id === ref)) { p = this.sigPos(ref); this.sel = { k: 'signal', id: ref }; }
    const st = d.stations.find((x) => x.id === ref);
    if (!p && st?.platforms[0]) { const tt = d.tracks.find((x) => x.id === st.platforms[0].track); if (tt) { p = pointAt(tt.pts, st.platforms[0].s0); this.sel = { k: 'platform', id: st.id, idx: 0 }; } }
    if (p) { this.cx = p.x; this.cz = p.z; this.sc = Math.max(this.sc, 0.8); }
    this.refresh();
  }

  // ---------------------------------------------------------------- Zeichnen
  private draw() {
    const c = this.ctx, m = this.model; if (!c || !m) return;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.fillStyle = '#0d1217'; c.fillRect(0, 0, this.w, this.h);
    this.drawGrid();
    const d = m.def, sel = this.sel;
    // Gleise
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const t of d.tracks) {
      const hi = sel?.k === 'track' && sel.id === t.id;
      c.beginPath(); this.path(t.pts);
      if (t.bridge) { c.strokeStyle = '#8b98a5'; c.lineWidth = 7; c.setLineDash([]); c.stroke(); }
      c.strokeStyle = hi ? '#ffffff' : t.yard ? '#7d8790' : vColor(t.vmax);
      c.lineWidth = hi ? 5 : t.yard ? 2 : 3; c.setLineDash(t.tunnel ? [8, 6] : []); c.stroke();
    }
    c.setLineDash([]);
    // Bahnsteige
    c.lineCap = 'butt';
    for (const st of d.stations) st.platforms.forEach((pl, i) => {
      const t = d.tracks.find((x) => x.id === pl.track); if (!t) return;
      const off = (pl.side === 'R' ? 1 : -1) * Math.max(4 / this.sc, 4);
      c.beginPath();
      for (let k = 0; k <= 8; k++) {
        const p = pointAt(t.pts, pl.s0 + (pl.s1 - pl.s0) * k / 8);
        const [sx, sy] = this.toScr(p.x - p.dz * off, p.z + p.dx * off);
        if (k) c.lineTo(sx, sy); else c.moveTo(sx, sy);
      }
      c.strokeStyle = sel?.k === 'platform' && sel.id === st.id && sel.idx === i ? '#ffffff' : '#c9b48a'; c.lineWidth = 5; c.stroke();
    });
    // Anschlüsse
    for (const ind of d.industries) {
      const t = d.tracks.find((x) => x.id === ind.track); if (!t) continue;
      c.beginPath(); for (let k = 0; k <= 6; k++) { const p = pointAt(t.pts, ind.s0 + (ind.s1 - ind.s0) * k / 6); const [sx, sy] = this.toScr(p.x, p.z); if (k) c.lineTo(sx, sy); else c.moveTo(sx, sy); }
      c.strokeStyle = sel?.k === 'industry' && sel.id === ind.id ? '#fff' : '#a0632e'; c.lineWidth = 8; c.globalAlpha = 0.6; c.stroke(); c.globalAlpha = 1;
    }
    // Bahnübergänge
    for (const cr of d.crossings) {
      const t = d.tracks.find((x) => x.id === cr.track); if (!t) continue;
      const p = pointAt(t.pts, cr.s); const [sx, sy] = this.toScr(p.x, p.z);
      c.strokeStyle = sel?.k === 'crossing' && sel.id === cr.id ? '#fff' : '#ff5a5a'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(sx - 6, sy - 6); c.lineTo(sx + 6, sy + 6); c.moveTo(sx + 6, sy - 6); c.lineTo(sx - 6, sy + 6); c.stroke();
    }
    // Weichen und Knoten
    const showNodes = this.sc > 0.15 || this.tool === 'track' || this.tool === 'node' || this.tool === 'select';
    for (const sw of d.switches) {
      const n = d.nodes.find((x) => x.id === sw.node); if (!n) continue;
      const [sx, sy] = this.toScr(n.x, n.z);
      c.fillStyle = '#ffd34d'; c.beginPath(); c.moveTo(sx, sy - 6); c.lineTo(sx + 6, sy); c.lineTo(sx, sy + 6); c.lineTo(sx - 6, sy); c.closePath(); c.fill();
    }
    if (showNodes && this.sc > 0.05) for (const n of d.nodes) {
      const [sx, sy] = this.toScr(n.x, n.z); if (sx < -10 || sy < -10 || sx > this.w + 10 || sy > this.h + 10) continue;
      const hi = sel?.k === 'node' && sel.id === n.id;
      c.fillStyle = hi ? '#ffffff' : '#9fb3c8'; c.beginPath(); c.arc(sx, sy, hi ? 6 : 3.5, 0, Math.PI * 2); c.fill();
    }
    // Signale: kleiner Pfeil in Fahrtrichtung, rechts neben dem Gleis
    for (const sg of d.signals) {
      const p = this.sigPos(sg.id); if (!p) continue;
      const [sx0, sy0] = this.toScr(p.x, p.z);
      const nx = -p.dz, ny = p.dx; // rechts in Fahrtrichtung (Bildschirm: z nach unten)
      const sx = sx0 + nx * 7, sy = sy0 + ny * 7;
      const hi = sel?.k === 'signal' && sel.id === sg.id;
      c.fillStyle = hi ? '#ffffff' : sg.kind === 'main' ? '#ff4d4d' : sg.kind === 'block' ? '#4da3ff' : '#e0e0e0';
      c.beginPath(); c.moveTo(sx + p.dx * 7, sy + p.dz * 7); c.lineTo(sx - p.dx * 5 + nx * 4, sy - p.dz * 5 + ny * 4); c.lineTo(sx - p.dx * 5 - nx * 4, sy - p.dz * 5 - ny * 4); c.closePath(); c.fill();
    }
    // Stationsnamen
    c.font = '600 13px system-ui,sans-serif'; c.textAlign = 'center'; c.fillStyle = '#ffe9b8';
    for (const st of d.stations) {
      const pl = st.platforms[0]; if (!pl) continue;
      const t = d.tracks.find((x) => x.id === pl.track); if (!t) continue;
      const p = pointAt(t.pts, (pl.s0 + pl.s1) / 2); const [sx, sy] = this.toScr(p.x, p.z);
      c.fillText(st.name, sx, sy - 14);
    }
    // Zeichenvorschau
    if (this.tool === 'track' && this.pending) {
      const a = this.pending.start, ctl = this.pending.ctrl, b = this.hover;
      c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath();
      const [ax, ay] = this.toScr(a.x, a.z); c.moveTo(ax, ay);
      if (ctl && b) { const [qx, qy] = this.toScr(ctl.x, ctl.z), [bx, by] = this.toScr(b.x, b.z); c.quadraticCurveTo(qx, qy, bx, by); }
      else if (b) { const [bx, by] = this.toScr((ctl ?? b).x, (ctl ?? b).z); c.lineTo(bx, by); }
      c.stroke(); c.setLineDash([]);
      c.fillStyle = '#fff'; c.beginPath(); c.arc(ax, ay, 5, 0, Math.PI * 2); c.fill();
      if (ctl) { const [qx, qy] = this.toScr(ctl.x, ctl.z); c.strokeRect(qx - 4, qy - 4, 8, 8); }
    }
    this.drawLegend();
  }
  /** Polylinie in Bildschirmkoordinaten, Punkte unter 2 px Abstand werden übersprungen */
  private path(pts: number[]) {
    const c = this.ctx; let lx = NaN, ly = NaN; const n = pts.length / 3;
    for (let i = 0; i < n; i++) {
      const [sx, sy] = this.toScr(pts[i * 3], pts[i * 3 + 2]);
      if (i === 0) { c.moveTo(sx, sy); lx = sx; ly = sy; continue; }
      if (i < n - 1 && Math.abs(sx - lx) + Math.abs(sy - ly) < 2) continue;
      c.lineTo(sx, sy); lx = sx; ly = sy;
    }
  }
  private drawGrid() {
    const c = this.ctx;
    let step = 10; while (step * this.sc < 60) step *= String(step)[0] === '1' ? 5 : 2; // 10, 50, 100, 500, 1000 …
    const tl = this.toWorld(0, 0), br = this.toWorld(this.w, this.h);
    c.strokeStyle = '#1a232c'; c.lineWidth = 1; c.beginPath();
    for (let x = Math.floor(tl.x / step) * step; x <= br.x; x += step) { const [sx] = this.toScr(x, 0); c.moveTo(Math.round(sx) + 0.5, 0); c.lineTo(Math.round(sx) + 0.5, this.h); }
    for (let z = Math.floor(tl.z / step) * step; z <= br.z; z += step) { const [, sy] = this.toScr(0, z); c.moveTo(0, Math.round(sy) + 0.5); c.lineTo(this.w, Math.round(sy) + 0.5); }
    c.stroke();
    c.fillStyle = '#6b7884'; c.font = '11px system-ui,sans-serif'; c.textAlign = 'left';
    c.fillText(step >= 1000 ? `${step / 1000} km` : `${step} m`, 8, this.h - 8);
  }
  private drawLegend() {
    const c = this.ctx, items: [string, number][] = [['≤40', 40], ['≤80', 80], ['≤120', 120], ['≤160', 160], ['>160', 200]];
    c.font = '11px system-ui,sans-serif'; c.textAlign = 'left';
    let x = this.w - 8 - items.length * 46;
    for (const [l, v] of items) { c.fillStyle = vColor(v); c.fillRect(x, this.h - 16, 10, 4); c.fillStyle = '#9aa7b3'; c.fillText(l, x + 13, this.h - 10); x += 46; }
  }

  // ---------------------------------------------------------------- Aktionen
  private check() {
    if (!this.model) return;
    this.issues = this.model.validate(); this.side.classList.remove('hide'); this.renderSide();
    const e = this.issues.filter((i) => i.sev === 'error').length;
    this.toast(this.issues.length ? `${T.errors(e)}, ${T.warns(this.issues.length - e)}` : T.noIssues);
  }
  private testDrive() {
    const m = this.model; if (!m) return;
    this.issues = m.validate();
    if (this.issues.some((i) => i.sev === 'error')) { this.side.classList.remove('hide'); this.renderSide(); this.toast(T.testBlocked); return; }
    this.opts.onTestDrive(JSON.parse(m.toJSON()));
  }
  private async saveNet(): Promise<boolean> {
    const m = this.model; if (!m) return false;
    const ok = await this.opts.store.saveNet(JSON.parse(m.toJSON()));
    if (ok) this.unsaved = false;
    this.toast(ok ? T.saved : `${T.saveFail}${this.opts.store.lastError ? ': ' + this.opts.store.lastError : ''}`);
    return ok;
  }
  private exportFile() {
    const m = this.model; if (!m) return;
    const name = (m.def.name || 'netz').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 60) || 'netz';
    const url = URL.createObjectURL(new Blob([m.toJSON()], { type: 'application/json' }));
    const a = el('a', { href: url, download: `${name}.ricorail.json` }); this.root!.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    this.toast(T.exported);
  }
  private importFile() {
    const f = this.fileIn.files?.[0]; this.fileIn.value = ''; if (!f) return;
    f.text().then((txt) => {
      try { this.setModel(EditModel.fromJSON(txt)); this.unsaved = true; this.closeModal(); this.toast(T.imported); }
      catch (e) { this.toast(T.importFail + (e as Error).message); }
    }, (e) => this.toast(T.importFail + String(e)));
  }
  private close() {
    if (!this.unsaved) { this.opts.onClose(); return; }
    this.modal(T.unsaved, [
      [T.saveClose, async () => { if (await this.saveNet()) { this.closeModal(); this.opts.onClose(); } }],
      [T.discard, () => { this.closeModal(); this.unsaved = false; this.opts.onClose(); }],
      [T.keep, () => this.closeModal()],
    ]);
  }

  // ---------------------------------------------------------------- Dialoge
  private modalEl: HTMLDivElement | null = null;
  private modal(title: string, buttons: [string, () => void][], extra?: HTMLElement[]) {
    this.closeModal();
    const box = el('div', { class: 'rre-box' }, el('h2', { textContent: title }), ...(extra ?? []), ...buttons.map(([l, fn]) => el('button', { textContent: l, onclick: fn })));
    this.modalEl = el('div', { class: 'rre-modal' }, box);
    this.root!.append(this.modalEl);
  }
  private closeModal() { this.modalEl?.remove(); this.modalEl = null; }

  private async startDialog() {
    const S = T.start;
    const parts: HTMLElement[] = [];
    parts.push(el('button', { textContent: `＋ ${S.empty}`, onclick: () => { this.setModel(EditModel.empty()); this.closeModal(); } }));
    parts.push(el('button', { textContent: `⬆ ${S.importFile}`, onclick: () => this.fileIn.click() }));
    parts.push(el('h4', { textContent: S.templates }));
    for (const r of ROUTES) parts.push(el('button', { textContent: r.name, onclick: () => { try { this.setModel(EditModel.fromRoute(r.id)); this.closeModal(); } catch (e) { this.toast(String((e as Error).message)); } } }));
    parts.push(el('h4', { textContent: S.saved }));
    const list = el('div', { style: 'display:flex;flex-direction:column;gap:6px' }, el('p', { textContent: '…' }));
    parts.push(list);
    this.modal(S.title, [[S.cancel, () => this.closeModal()]], parts);
    // Gespeicherte Netze nachladen (IndexedDB ist asynchron)
    let nets: { id: string; name: string; updated: number }[] = [];
    try { nets = await this.opts.store.listNets(); } catch { /* ignorieren */ }
    list.textContent = '';
    if (!nets.length) list.append(el('p', { textContent: S.none }));
    for (const n of nets) {
      const r = el('div', { class: 'r' },
        el('button', { textContent: `${n.name} · ${new Date(n.updated).toLocaleDateString('de-DE')}`, onclick: async () => {
          const def = await this.opts.store.loadNet(n.id);
          if (def) { this.setModel(new EditModel(def)); this.closeModal(); } else this.toast(T.importFail + n.id);
        } }),
        el('button', { textContent: '🗑️', title: S.del, onclick: async () => { await this.opts.store.deleteNet(n.id); r.remove(); } }));
      list.append(r);
    }
  }

  private toast(msg: string) {
    if (!this.root) return;
    this.root.querySelector('.rre-toast')?.remove();
    const t = el('div', { class: 'rre-toast', textContent: msg }); this.root.append(t);
    if (this.toastT) clearTimeout(this.toastT);
    this.toastT = setTimeout(() => t.remove(), 3500);
  }
}
