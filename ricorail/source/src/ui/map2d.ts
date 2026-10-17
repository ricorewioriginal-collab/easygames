// 2D-Gleisplan: Stellwerksansicht, Weichen stellen, Übersichtskarte. Canvas, ohne Abhängigkeiten.
import type { World } from '../operations/world';
import type { RouteDef } from '../railway/interlocking';

export interface MapOpts {
  interactive: boolean;
  /** Spielerzug verfolgen */
  follow?: () => string | null;
  /** Nur diese Signale sind bedienbar (Stellwerksbereich); leer = alle */
  manual?: Set<string>;
  onMessage?: (msg: string, sev?: 'info' | 'warn' | 'error') => void;
  onSwitch?: () => void;
  compact?: boolean;
}

interface Poly { id: string; xs: Float32Array; zs: Float32Array; minX: number; maxX: number; minZ: number; maxZ: number }

const COL = { track: '#4d6585', yard: '#3a4a5c', occ: '#ff4d57', route: '#3ccf6e', routeIn: '#f2c94c', sw: '#f2a900', text: '#cfe0f5', bg: '#08111d', player: '#2ec4b6', train: '#ffffff' };

export class Map2D {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private w: World;
  private o: MapOpts;
  private polys: Poly[] = [];
  /** Ansicht: Mittelpunkt (Welt) und Maßstab px/m */
  cx = 0; cz = 0; scale = 0.05;
  private start: string | null = null;
  private pointers = new Map<number, { x: number; y: number }>();
  private dragMoved = 0;
  private pinch0 = 0;
  private dpr = 1;
  private disposed = false;
  private lastFit = false;

  constructor(canvas: HTMLCanvasElement, w: World, o: MapOpts) {
    this.canvas = canvas; this.w = w; this.o = o;
    this.ctx = canvas.getContext('2d')!;
    for (const t of w.net.tracks.values()) {
      const n = t.px.length, step = Math.max(1, Math.floor(n / 60));
      const xs: number[] = [], zs: number[] = [];
      for (let i = 0; i < n; i += step) { xs.push(t.px[i]); zs.push(t.pz[i]); }
      if ((n - 1) % step) { xs.push(t.px[n - 1]); zs.push(t.pz[n - 1]); }
      this.polys.push({ id: t.id, xs: new Float32Array(xs), zs: new Float32Array(zs), minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) });
    }
    this.fit();
    if (o.interactive) {
      canvas.addEventListener('pointerdown', this.down);
      canvas.addEventListener('pointermove', this.move);
      canvas.addEventListener('pointerup', this.up);
      canvas.addEventListener('pointercancel', this.up);
      canvas.addEventListener('wheel', this.wheel, { passive: false });
    }
  }

  dispose() {
    this.disposed = true;
    const c = this.canvas;
    c.removeEventListener('pointerdown', this.down); c.removeEventListener('pointermove', this.move);
    c.removeEventListener('pointerup', this.up); c.removeEventListener('pointercancel', this.up); c.removeEventListener('wheel', this.wheel);
  }

  /** Ganze Anlage oder Bereich einpassen */
  fit(area?: { x0: number; x1: number; z0: number; z1: number }) {
    const b = area ?? this.w.net.bounds();
    this.cx = (b.x0 + b.x1) / 2; this.cz = (b.z0 + b.z1) / 2;
    const W = Math.max(50, this.canvas.clientWidth || 300), H = Math.max(50, this.canvas.clientHeight || 200);
    this.scale = Math.min(W / Math.max(200, b.x1 - b.x0), H / Math.max(200, b.z1 - b.z0)) * 0.9;
    this.lastFit = true;
  }

  /** Bereich um Signale einpassen */
  fitSignals(ids: Iterable<string>) {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const id of ids) { const s = this.w.net.signals.get(id); if (!s) continue; const p = this.w.net.track(s.track).point(s.s); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }
    if (x0 < Infinity) this.fit({ x0: x0 - 300, x1: x1 + 300, z0: z0 - 300, z1: z1 + 300 });
  }

  private toScreen(x: number, z: number): [number, number] {
    const W = this.canvas.width / this.dpr, H = this.canvas.height / this.dpr;
    return [W / 2 + (x - this.cx) * this.scale, H / 2 + (z - this.cz) * this.scale];
  }
  private toWorld(sx: number, sy: number): [number, number] {
    const W = this.canvas.width / this.dpr, H = this.canvas.height / this.dpr;
    return [this.cx + (sx - W / 2) / this.scale, this.cz + (sy - H / 2) / this.scale];
  }

  draw() {
    if (this.disposed) return;
    const c = this.canvas, ctx = this.ctx;
    const dpr = Math.min(2, window.devicePixelRatio || 1); this.dpr = dpr;
    const W = c.clientWidth, H = c.clientHeight;
    if (!W || !H) return;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); if (this.lastFit) this.fit(); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, W, H);
    const w = this.w, il = w.il;
    const f = this.o.follow?.();
    if (f) { const t = w.trains.get(f); if (t) { const p = w.net.pos(t.head); this.cx = p.x; this.cz = p.z; } }
    const [vx0, vz0] = this.toWorld(0, 0), [vx1, vz1] = this.toWorld(W, H);
    const lw = this.o.compact ? 2 : Math.max(2, Math.min(5, this.scale * 6));
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // Gleise
    for (const p of this.polys) {
      if (p.maxX < vx0 || p.minX > vx1 || p.maxZ < vz0 || p.minZ > vz1) continue;
      const occ = !il.isFree(p.id);
      const lk = il.locked.get(p.id);
      const tr = w.net.track(p.id);
      ctx.strokeStyle = occ ? COL.occ : lk ? (lk.entered ? COL.routeIn : COL.route) : tr.def.yard ? COL.yard : COL.track;
      ctx.lineWidth = occ || lk ? lw + 1 : lw;
      ctx.beginPath();
      for (let i = 0; i < p.xs.length; i++) { const [x, y] = this.toScreen(p.xs[i], p.zs[i]); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke();
    }
    const detail = this.scale > 0.02 && !this.o.compact;
    // Weichen
    if (detail) for (const sw of w.net.switches.values()) {
      const nd = w.net.nodeDefs.get(sw.node)!; if (nd.x < vx0 || nd.x > vx1 || nd.z < vz0 || nd.z > vz1) continue;
      const [x, y] = this.toScreen(nd.x, nd.z);
      const leg = w.net.track(sw.legs[sw.state]); const atA = leg.def.a === sw.node;
      const q = leg.point(atA ? Math.min(leg.len, 25) : Math.max(0, leg.len - 25));
      const [x2, y2] = this.toScreen(q.x, q.z);
      ctx.strokeStyle = w.net.failed.has(sw.id) ? COL.occ : COL.sw; ctx.lineWidth = lw + 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (x2 - x) * Math.min(1, 14 / Math.max(1, Math.hypot(x2 - x, y2 - y))), y + (y2 - y) * Math.min(1, 14 / Math.max(1, Math.hypot(x2 - x, y2 - y)))); ctx.stroke();
      ctx.fillStyle = COL.sw; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    // Signale
    if (detail) for (const s of w.net.signals.values()) {
      const tr = w.net.track(s.track); const p = tr.point(s.s);
      if (p.x < vx0 || p.x > vx1 || p.z < vz0 || p.z > vz1) continue;
      const dx = p.dx * s.dir, dz = p.dz * s.dir;
      const off = 9 / Math.max(this.scale, 1e-6) * 0.6;
      const [x, y] = this.toScreen(p.x - dz * off, p.z + dx * off);
      const st = il.signalState.get(s.id)!;
      const man = !this.o.manual || this.o.manual.size === 0 || this.o.manual.has(s.id);
      const col = il.failedSignals.has(s.id) ? '#b04cff' : st.aspect === 'stop' ? COL.occ : st.aspect === 'go' ? '#3ccf6e' : '#f2c94c';
      const a = Math.atan2(dz, dx);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      const r = s.def.kind === 'block' ? 4.5 : s.def.kind === 'shunt' ? 3.5 : 6;
      ctx.fillStyle = col; ctx.strokeStyle = this.start === s.id ? '#fff' : man && this.o.interactive ? '#0008' : '#0004'; ctx.lineWidth = this.start === s.id ? 3 : 1.5;
      ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(-r, -r * 0.8); ctx.lineTo(-r, r * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      if (this.scale > 0.12 && s.def.name && s.def.kind !== 'block') { ctx.fillStyle = '#8aa3c0'; ctx.font = '10px system-ui'; ctx.fillText(s.def.name.replace(/^.*\./, ''), x + 6, y - 6); }
    }
    // Stationsnamen
    ctx.font = `${this.o.compact ? 10 : 12}px system-ui`; ctx.fillStyle = COL.text; ctx.textAlign = 'center';
    for (const st of w.net.def.stations) {
      const p0 = st.platforms[0]; if (!p0 || st.kind === 'yard') continue;
      const q = w.net.track(p0.track).point((p0.s0 + p0.s1) / 2);
      if (q.x < vx0 || q.x > vx1 || q.z < vz0 || q.z > vz1) continue;
      if (this.o.compact && st.pax === 0) continue;
      const [x, y] = this.toScreen(q.x, q.z);
      ctx.fillText(st.name, x, y - 12);
    }
    // Züge
    ctx.textAlign = 'left';
    for (const t of w.trains.values()) {
      const sp = w.spans.get(t.id) ?? [];
      const isP = t.id === w.player;
      ctx.strokeStyle = isP ? COL.player : t.isCut ? '#9aa' : COL.train; ctx.lineWidth = lw + 3;
      for (const s of sp) {
        const tr = w.net.track(s.t); const a = tr.point(s.s0), b = tr.point(s.s1);
        const [x1, y1] = this.toScreen(a.x, a.z), [x2, y2] = this.toScreen(b.x, b.z);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      if (!this.o.compact || isP) {
        const hp = w.net.pos(t.head); const [x, y] = this.toScreen(hp.x, hp.z);
        ctx.fillStyle = isP ? COL.player : '#fff'; ctx.font = '11px system-ui';
        if (detail || isP) ctx.fillText(t.isCut ? 'Wagen' : t.name, x + 6, y + 14);
      }
    }
  }

  // ------------------------------------------------------------ Bedienung
  private down = (e: PointerEvent) => {
    this.canvas.setPointerCapture?.(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    this.dragMoved = 0;
    if (this.pointers.size === 2) { const [a, b] = [...this.pointers.values()]; this.pinch0 = Math.hypot(a.x - b.x, a.y - b.y); }
  };
  private move = (e: PointerEvent) => {
    const p = this.pointers.get(e.pointerId); if (!p) return;
    if (this.pointers.size === 2) {
      p.x = e.offsetX; p.y = e.offsetY;
      const [a, b] = [...this.pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinch0 > 0) { this.zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d / this.pinch0); this.pinch0 = d; }
      this.dragMoved = 99; return;
    }
    const dx = e.offsetX - p.x, dy = e.offsetY - p.y;
    p.x = e.offsetX; p.y = e.offsetY;
    this.dragMoved += Math.abs(dx) + Math.abs(dy);
    if (this.dragMoved > 6 && !this.o.follow?.()) { this.cx -= dx / this.scale; this.cz -= dy / this.scale; this.lastFit = false; }
  };
  private up = (e: PointerEvent) => {
    const was = this.pointers.size;
    this.pointers.delete(e.pointerId);
    if (was === 1 && this.dragMoved < 8 && e.type === 'pointerup') this.tap(e.offsetX, e.offsetY);
  };
  private wheel = (e: WheelEvent) => { e.preventDefault(); this.zoomAt(e.offsetX, e.offsetY, e.deltaY < 0 ? 1.2 : 1 / 1.2); };
  zoomAt(sx: number, sy: number, f: number) {
    const [wx, wz] = this.toWorld(sx, sy);
    this.scale = Math.min(3, Math.max(0.002, this.scale * f));
    const [wx2, wz2] = this.toWorld(sx, sy);
    this.cx += wx - wx2; this.cz += wz - wz2; this.lastFit = false;
  }

  private tap(sx: number, sy: number) {
    const w = this.w;
    const near = (x: number, z: number, r: number) => { const [a, b] = this.toScreen(x, z); return Math.hypot(a - sx, b - sy) < r; };
    // Signal?
    let best: { id: string; d: number } | null = null;
    for (const s of w.net.signals.values()) {
      if (s.def.kind === 'block' && !this.o.manual?.has(s.id)) continue;
      const tr = w.net.track(s.track); const p = tr.point(s.s);
      const off = 9 / Math.max(this.scale, 1e-6) * 0.6;
      const [a, b] = this.toScreen(p.x - p.dz * s.dir * off, p.z + p.dx * s.dir * off);
      const d = Math.hypot(a - sx, b - sy);
      if (d < 22 && (!best || d < best.d)) best = { id: s.id, d };
    }
    if (best) { this.signalTap(best.id); return; }
    // Weiche?
    for (const sw of w.net.switches.values()) {
      const nd = w.net.nodeDefs.get(sw.node)!;
      if (near(nd.x, nd.z, 20)) {
        const r = w.net.setSwitch(sw.id, (sw.state + 1) % sw.legs.length);
        this.o.onMessage?.(r ?? `Weiche ${sw.id} umgestellt`, r ? 'warn' : 'info');
        if (!r) this.o.onSwitch?.();
        return;
      }
    }
    if (this.start) { this.start = null; this.o.onMessage?.('Auswahl aufgehoben'); }
  }

  private signalTap(id: string) {
    const w = this.w, il = w.il;
    const allowed = !this.o.manual || this.o.manual.size === 0 || this.o.manual.has(id);
    if (!this.start) {
      if (!allowed) { this.o.onMessage?.('Dieses Signal wird vom Nachbarstellwerk (automatisch) bedient.', 'warn'); return; }
      if (il.set.has(id)) {
        // Fahrstraße zurücknehmen
        const approaching = [...w.trains.values()].some((t) => { const sp = w.spans.get(t.id) ?? []; const sig = w.net.signals.get(id)!; return sp.some((s) => s.t === sig.track); });
        this.o.onMessage?.(il.cancel(id, approaching), 'info'); return;
      }
      this.start = id; this.o.onMessage?.('Startsignal gewählt – jetzt Zielsignal antippen.'); return;
    }
    const from = this.start; this.start = null;
    if (from === id) { this.o.onMessage?.('Auswahl aufgehoben'); return; }
    const r = this.findRoute(from, id);
    if (!r) { this.o.onMessage?.('Keine Fahrstraße zwischen diesen Signalen.', 'warn'); return; }
    const why = il.setRoute(r, null);
    this.o.onMessage?.(why ?? `Fahrstraße ${r.id.replace(/[^>]*\./g, '')} eingestellt`, why ? 'warn' : 'info');
    if (!why) w.dirtyAI = true;
  }

  private findRoute(from: string, to: string): RouteDef | undefined {
    const routes = this.w.il.routesFrom.get(from) ?? [];
    return routes.find((r) => r.to === to) ?? routes.find((r) => { const s = this.w.net.signals.get(to)!; return r.steps.some((x) => x.t === s.track); });
  }
}
