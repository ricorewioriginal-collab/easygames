// Editor-Datenmodell (ohne DOM): bearbeitet ein NetworkDef im Simulator-Schema, mit Rückgängig/Wiederholen.
import { NETWORK_SCHEMA, type CargoType, type IndustryDef, type NetworkDef, type NodeDef, type SignalKind, type StationDef, type SwitchDef, type TrackDef } from '../railway/schema';
import { validate, type Issue } from '../railway/validate';
import { routeNet } from '../data/routes';
import { endDir, makePts, polyLen, splitPts, type P2 } from './geom';

export const MODEL_TEXT = {
  newNet: 'Neues Netz',
  badJson: 'Datei ist kein gültiges JSON.',
  noSchema: 'Keine RicoRail-Netzdatei (Feld „schema“ fehlt).',
  badSchema: (v: unknown) => `Netzformat ${String(v)} wird nicht unterstützt (erwartet ${NETWORK_SCHEMA}).`,
  noArrays: 'Netzdatei unvollständig: Knoten oder Gleise fehlen.',
  unknown: (what: string, id: string) => `${what} ${id} nicht gefunden`,
  sameNode: 'Anfang und Ende des Gleises sind derselbe Knoten.',
  copy: 'Kopie',
};

const HISTORY_MAX = 100;
/** Obergrenze für Verlaufsspeicher (Zeichen), damit große Netze das Handy nicht überlasten */
const HISTORY_BYTES = 24_000_000;

export interface TrackOpts { ctrl?: P2 | null; vmax?: number; elec?: boolean; tunnel?: boolean; bridge?: boolean; yard?: boolean; name?: string; id?: string }
export type TrackProps = Partial<Pick<TrackDef, 'vmax' | 'elec' | 'tunnel' | 'bridge' | 'yard' | 'name' | 'rack' | 'single'>>;

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export class EditModel {
  def: NetworkDef;
  private undoS: string[] = [];
  private redoS: string[] = [];
  private depth = 0;
  private txStart: string | null = null;
  /** wird nach jeder Änderung aufgerufen (UI-Neuzeichnen) */
  onChange: (() => void) | null = null;

  constructor(def: NetworkDef) { this.def = EditModel.normalize(def); }

  // ---------------------------------------------------------------- Vorlagen / Datei
  static empty(name = MODEL_TEXT.newNet): EditModel {
    return new EditModel({ schema: NETWORK_SCHEMA, id: `custom-${Date.now()}`, name, world: 'custom', theme: { terrain: 'plain', season: 'summer', buildings: 'village' }, nodes: [], tracks: [], switches: [], signals: [], stations: [], industries: [], crossings: [], speeds: [], scenery: [] });
  }
  /** Kopie einer vorhandenen Strecke als Vorlage */
  static fromRoute(id: string): EditModel {
    const d = clone(routeNet(id));
    d.id = `custom-${Date.now()}`; d.world = 'custom'; d.name = `${d.name} (${MODEL_TEXT.copy})`;
    return new EditModel(d);
  }
  static fromJSON(text: string): EditModel {
    let raw: any;
    try { raw = JSON.parse(text); } catch { throw new Error(MODEL_TEXT.badJson); }
    if (!raw || typeof raw !== 'object' || !('schema' in raw)) throw new Error(MODEL_TEXT.noSchema);
    if (raw.schema !== NETWORK_SCHEMA) throw new Error(MODEL_TEXT.badSchema(raw.schema));
    if (!Array.isArray(raw.nodes) || !Array.isArray(raw.tracks)) throw new Error(MODEL_TEXT.noArrays);
    return new EditModel(raw as NetworkDef);
  }
  /** Fehlende Listen/Felder ergänzen */
  private static normalize(d: NetworkDef): NetworkDef {
    for (const k of ['nodes', 'tracks', 'switches', 'signals', 'stations', 'industries', 'crossings', 'speeds'] as const) if (!Array.isArray(d[k])) (d as any)[k] = [];
    if (!d.theme || typeof d.theme !== 'object') d.theme = { terrain: 'plain' };
    if (!d.id) d.id = `custom-${Date.now()}`;
    if (!d.name) d.name = MODEL_TEXT.newNet;
    if (!['real', 'fantasy', 'custom'].includes(d.world)) d.world = 'custom';
    for (const st of d.stations) if (!Array.isArray(st.platforms)) st.platforms = [];
    return d;
  }
  toJSON(): string { return JSON.stringify(this.def); }

  // ---------------------------------------------------------------- Verlauf
  get canUndo() { return this.undoS.length > 0; }
  get canRedo() { return this.redoS.length > 0; }
  /** Mehrere Änderungen als ein Rückgängig-Schritt (z. B. Ziehen eines Knotens) */
  begin() { if (this.depth++ === 0) this.txStart = this.toJSON(); }
  end() {
    if (this.depth === 0) return;
    if (--this.depth === 0) {
      const s = this.txStart!; this.txStart = null;
      if (s !== this.toJSON()) { this.pushUndo(s); this.redoS = []; }
      this.changed();
    }
  }
  transact<T>(fn: () => T): T { this.begin(); try { return fn(); } finally { this.end(); } }
  private pushUndo(s: string) {
    this.undoS.push(s);
    let bytes = 0; for (const x of this.undoS) bytes += x.length;
    while (this.undoS.length > HISTORY_MAX || (bytes > HISTORY_BYTES && this.undoS.length > 1)) bytes -= this.undoS.shift()!.length;
  }
  private changed() { if (this.depth === 0) this.onChange?.(); }
  /** Führt eine Änderung als Schritt aus */
  private op<T>(fn: () => T): T {
    if (this.depth > 0) return fn();
    const before = this.toJSON();
    let r: T;
    try { r = fn(); } catch (e) { this.def = JSON.parse(before); throw e; }
    this.pushUndo(before); this.redoS = []; this.changed();
    return r;
  }
  undo(): boolean {
    const s = this.undoS.pop(); if (s === undefined) return false;
    this.redoS.push(this.toJSON()); this.def = JSON.parse(s); this.onChange?.(); return true;
  }
  redo(): boolean {
    const s = this.redoS.pop(); if (s === undefined) return false;
    this.pushUndo(this.toJSON()); this.def = JSON.parse(s); this.onChange?.(); return true;
  }

  // ---------------------------------------------------------------- Hilfen
  private uid(prefix: string, used: { id: string }[]): string {
    const set = new Set(used.map((x) => x.id)); let i = used.length + 1;
    while (set.has(`${prefix}${i}`)) i++;
    return `${prefix}${i}`;
  }
  node(id: string): NodeDef { const n = this.def.nodes.find((x) => x.id === id); if (!n) throw new Error(MODEL_TEXT.unknown('Knoten', id)); return n; }
  track(id: string): TrackDef { const t = this.def.tracks.find((x) => x.id === id); if (!t) throw new Error(MODEL_TEXT.unknown('Gleis', id)); return t; }
  trackLen(id: string): number { return polyLen(this.track(id).pts); }
  /** Gleisenden an einem Knoten */
  endsAt(node: string): { t: TrackDef; atA: boolean }[] {
    const out: { t: TrackDef; atA: boolean }[] = [];
    for (const t of this.def.tracks) { if (t.a === node) out.push({ t, atA: true }); if (t.b === node) out.push({ t, atA: false }); }
    return out;
  }

  // ---------------------------------------------------------------- Knoten & Gleise
  addNode(x: number, z: number, y = 0): string {
    return this.op(() => { const id = this.uid('n', this.def.nodes); this.def.nodes.push({ id, x: Math.round(x * 100) / 100, y, z: Math.round(z * 100) / 100 }); return id; });
  }
  /** Verschiebt einen Knoten; angeschlossene Gleise werden zum Knoten hin anteilig mitgezogen */
  moveNode(id: string, x: number, z: number): void {
    this.op(() => {
      const n = this.node(id), dx = x - n.x, dz = z - n.z;
      n.x = Math.round(x * 100) / 100; n.z = Math.round(z * 100) / 100;
      for (const t of this.def.tracks) {
        if (t.a !== id && t.b !== id) continue;
        const k = t.pts.length / 3;
        for (let i = 0; i < k; i++) {
          const f = t.a === id && t.b === id ? 1 : t.a === id ? 1 - i / (k - 1) : i / (k - 1);
          t.pts[i * 3] = Math.round((t.pts[i * 3] + dx * f) * 100) / 100; t.pts[i * 3 + 2] = Math.round((t.pts[i * 3 + 2] + dz * f) * 100) / 100;
        }
      }
    });
  }
  setNodeY(id: string, y: number): void {
    this.op(() => {
      const n = this.node(id); n.y = y;
      // Höhen der angeschlossenen Gleise linear neu verteilen
      for (const t of this.def.tracks) if (t.a === id || t.b === id) {
        const a = this.node(t.a), b = this.node(t.b), k = t.pts.length / 3;
        for (let i = 0; i < k; i++) t.pts[i * 3 + 1] = Math.round((a.y + (b.y - a.y) * (i / (k - 1))) * 100) / 100;
      }
    });
  }
  /** Löscht einen Knoten samt angeschlossener Gleise */
  deleteNode(id: string): void {
    this.op(() => {
      for (const t of this.def.tracks.filter((x) => x.a === id || x.b === id)) this.removeTrack(t.id);
      this.def.nodes = this.def.nodes.filter((n) => n.id !== id);
      this.def.switches = this.def.switches.filter((s) => s.node !== id);
    });
  }

  addTrack(aNode: string, bNode: string, opts: TrackOpts = {}): string {
    return this.op(() => {
      if (aNode === bNode) throw new Error(MODEL_TEXT.sameNode);
      const a = this.node(aNode), b = this.node(bNode);
      const id = opts.id && !this.def.tracks.some((t) => t.id === opts.id) ? opts.id : this.uid('t', this.def.tracks);
      const t: TrackDef = { id, a: aNode, b: bNode, pts: makePts(a, b, opts.ctrl), vmax: opts.vmax ?? 100 };
      if (opts.elec) t.elec = true; if (opts.tunnel) t.tunnel = true; if (opts.bridge) t.bridge = true; if (opts.yard) t.yard = true;
      if (opts.name) t.name = opts.name;
      this.def.tracks.push(t);
      return id;
    });
  }
  deleteTrack(id: string): void { this.op(() => { this.track(id); this.removeTrack(id); }); }
  private removeTrack(id: string) {
    const t = this.track(id), d = this.def;
    d.tracks = d.tracks.filter((x) => x.id !== id);
    d.signals = d.signals.filter((s) => s.track !== id);
    d.crossings = d.crossings.filter((c) => c.track !== id);
    d.industries = d.industries.filter((c) => c.track !== id);
    d.speeds = d.speeds.filter((c) => c.track !== id);
    // Stationen, die dadurch keinen Bahnsteig mehr haben, entfallen
    const lost = new Set<StationDef>();
    for (const st of d.stations) { const n = st.platforms.length; st.platforms = st.platforms.filter((p) => p.track !== id); if (n && !st.platforms.length) lost.add(st); }
    d.stations = d.stations.filter((st) => !lost.has(st));
    d.switches = d.switches.filter((s) => s.trunk !== id && !s.legs.includes(id));
    for (const n of d.nodes) if (n.pairs) { n.pairs = n.pairs.filter((p) => !p.includes(id)); if (!n.pairs.length) delete n.pairs; }
    // verwaiste Endknoten entfernen
    for (const nid of [t.a, t.b]) if (!d.tracks.some((x) => x.a === nid || x.b === nid)) d.nodes = d.nodes.filter((n) => n.id !== nid);
  }
  /** Teilt ein Gleis bei Bogenlänge s → neue Knoten-ID */
  splitTrack(id: string, s: number): string {
    return this.op(() => {
      const t = this.track(id), d = this.def, L = polyLen(t.pts);
      s = Math.max(1, Math.min(L - 1, s));
      const { A, B, P } = splitPts(t.pts, s);
      const nid = this.uid('n', d.nodes);
      d.nodes.push({ id: nid, x: P[0], y: P[1], z: P[2] });
      const oldB = t.b, id2 = this.uid('t', d.tracks);
      const t2: TrackDef = { ...clone(t), id: id2, a: nid, b: oldB, pts: B };
      if (t.km0 !== undefined) t2.km0 = Math.round((t.km0 + (t.kmRev ? -1 : 1) * polyLen(A) / 1000) * 1000) / 1000;
      t.pts = A; t.b = nid;
      d.tracks.splice(d.tracks.indexOf(t) + 1, 0, t2);
      const sA = polyLen(A);
      for (const sg of d.signals) if (sg.track === id && sg.dir === 1) sg.track = id2;
      for (const c of d.crossings) if (c.track === id && c.s > sA) { c.track = id2; c.s = Math.round((c.s - sA) * 10) / 10; }
      const range = (o: { track: string; s0: number; s1: number }) => {
        if (o.track !== id) return;
        if ((o.s0 + o.s1) / 2 > sA) { o.track = id2; o.s0 = Math.max(0, o.s0 - sA); o.s1 = o.s1 - sA; } else o.s1 = Math.min(o.s1, sA);
        o.s0 = Math.round(o.s0 * 10) / 10; o.s1 = Math.round(o.s1 * 10) / 10;
      };
      for (const st of d.stations) st.platforms.forEach(range);
      d.industries.forEach(range); d.speeds.forEach(range);
      for (const sw of d.switches) if (sw.node === oldB) { if (sw.trunk === id) sw.trunk = id2; sw.legs = sw.legs.map((l) => (l === id ? id2 : l)); }
      const nb = d.nodes.find((n) => n.id === oldB);
      if (nb?.pairs) nb.pairs = nb.pairs.map(([p, q]) => [p === id ? id2 : p, q === id ? id2 : q] as [string, string]);
      return nid;
    });
  }
  setTrackProps(id: string, props: TrackProps): void {
    this.op(() => {
      const t = this.track(id) as any;
      for (const [k, v] of Object.entries(props)) {
        if (k === 'vmax') { const n = Number(v); if (n > 0 && n <= 400) t.vmax = Math.round(n); continue; }
        if (v === false || v === '' || v === undefined || v === null) delete t[k]; else t[k] = v;
      }
    });
  }

  // ---------------------------------------------------------------- Ausstattung
  addSignal(track: string, dir: 1 | -1, kind: SignalKind, name?: string, off?: number): string {
    return this.op(() => {
      this.track(track);
      const id = name && !this.def.signals.some((s) => s.id === name) ? name : this.uid(kind === 'shunt' ? 'Ra' : kind === 'block' ? 'B' : 'S', this.def.signals);
      const sg = { id, track, dir, kind } as const;
      this.def.signals.push({ ...sg, ...(name ? { name } : {}), ...(off !== undefined ? { off } : {}) });
      return id;
    });
  }
  setSignalProps(id: string, p: { name?: string; kind?: SignalKind; dir?: 1 | -1; off?: number }): void {
    this.op(() => {
      const s = this.def.signals.find((x) => x.id === id); if (!s) throw new Error(MODEL_TEXT.unknown('Signal', id));
      if (p.name !== undefined) { if (p.name) s.name = p.name; else delete s.name; }
      if (p.kind) s.kind = p.kind; if (p.dir) s.dir = p.dir;
      if (p.off !== undefined) { if (p.off > 0) s.off = p.off; else delete s.off; }
    });
  }
  deleteSignal(id: string): void { this.op(() => { this.def.signals = this.def.signals.filter((s) => s.id !== id); }); }

  addStation(name: string, kind: StationDef['kind'] = 'station'): string {
    return this.op(() => { const id = this.uid('st', this.def.stations); this.def.stations.push({ id, name, kind, platforms: [], pax: 200 }); return id; });
  }
  /** Bahnsteig an Gleis; Station wird über den Namen gefunden oder neu angelegt → Stations-ID */
  addPlatform(track: string, s0: number, s1: number, side: 'L' | 'R', stationName: string): string {
    return this.op(() => {
      const L = this.trackLen(track);
      if (s1 < s0) [s0, s1] = [s1, s0];
      s0 = Math.max(0, Math.round(s0 * 10) / 10); s1 = Math.min(Math.round(L * 10) / 10, Math.round(s1 * 10) / 10);
      let st = this.def.stations.find((x) => x.name === stationName);
      if (!st) { st = { id: this.uid('st', this.def.stations), name: stationName, kind: 'station', platforms: [], pax: 200 }; this.def.stations.push(st); }
      st.platforms.push({ track, s0, s1, side, nr: String(st.platforms.length + 1) });
      return st.id;
    });
  }
  setStationProps(id: string, p: { name?: string; kind?: StationDef['kind']; pax?: number }): void {
    this.op(() => {
      const st = this.def.stations.find((x) => x.id === id); if (!st) throw new Error(MODEL_TEXT.unknown('Station', id));
      if (p.name) st.name = p.name; if (p.kind) st.kind = p.kind; if (p.pax !== undefined && p.pax >= 0) st.pax = Math.round(p.pax);
    });
  }
  setPlatformProps(stationId: string, idx: number, p: { side?: 'L' | 'R'; nr?: string; s0?: number; s1?: number }): void {
    this.op(() => {
      const pl = this.def.stations.find((x) => x.id === stationId)?.platforms[idx]; if (!pl) throw new Error(MODEL_TEXT.unknown('Bahnsteig', `${stationId}/${idx}`));
      if (p.side) pl.side = p.side; if (p.nr) pl.nr = p.nr;
      if (p.s0 !== undefined) pl.s0 = p.s0; if (p.s1 !== undefined) pl.s1 = p.s1;
    });
  }
  deletePlatform(stationId: string, idx: number): void {
    this.op(() => {
      const st = this.def.stations.find((x) => x.id === stationId); if (!st) return;
      st.platforms.splice(idx, 1);
      if (!st.platforms.length) this.def.stations = this.def.stations.filter((x) => x !== st);
    });
  }
  deleteStation(id: string): void { this.op(() => { this.def.stations = this.def.stations.filter((x) => x.id !== id); }); }

  addCrossing(track: string, s: number): string {
    return this.op(() => { this.track(track); const id = this.uid('BU', this.def.crossings); this.def.crossings.push({ id, track, s: Math.round(s * 10) / 10 }); return id; });
  }
  deleteCrossing(id: string): void { this.op(() => { this.def.crossings = this.def.crossings.filter((c) => c.id !== id); }); }

  addIndustry(name: string, track: string, s0: number, s1: number, cargo: CargoType[], action: IndustryDef['action'] = 'both'): string {
    return this.op(() => {
      this.track(track); if (s1 < s0) [s0, s1] = [s1, s0];
      const id = this.uid('ind', this.def.industries);
      this.def.industries.push({ id, name, track, s0: Math.round(s0 * 10) / 10, s1: Math.round(s1 * 10) / 10, cargo: [...cargo], action });
      return id;
    });
  }
  deleteIndustry(id: string): void { this.op(() => { this.def.industries = this.def.industries.filter((c) => c.id !== id); }); }

  setNetProps(p: { name?: string; theme?: Partial<NetworkDef['theme']> }): void {
    this.op(() => { if (p.name) this.def.name = p.name; if (p.theme) this.def.theme = { ...this.def.theme, ...p.theme } as NetworkDef['theme']; });
  }

  // ---------------------------------------------------------------- Weichen
  /**
   * Legt Weichen an Knoten mit drei Gleisenden an (Stamm = Ende, das den beiden anderen entgegenzeigt; Strang 0 = gerade)
   * und entfernt Weichen, die nicht mehr passen. Gültige vorhandene Weichen bleiben unverändert.
   */
  autoSwitches(): { added: number; removed: number } {
    return this.op(() => {
      const d = this.def; let added = 0, removed = 0;
      const ends = new Map<string, { t: TrackDef; atA: boolean }[]>();
      for (const t of d.tracks) for (const atA of [true, false]) { const n = atA ? t.a : t.b; const a = ends.get(n) ?? []; a.push({ t, atA }); ends.set(n, a); }
      const keep: SwitchDef[] = [];
      const byNode = new Map(d.switches.map((s) => [s.node, s]));
      for (const sw of d.switches) {
        const e = ends.get(sw.node) ?? [];
        const ids = e.map((x) => x.t.id);
        const valid = e.length >= 3 && e.length === 1 + sw.legs.length && ids.includes(sw.trunk) && sw.legs.every((l) => ids.includes(l)) && new Set([sw.trunk, ...sw.legs]).size === e.length;
        if (!valid) { removed++; byNode.delete(sw.node); continue; }
        if (e.length === 3) {
          const want = this.switchGeom(e);
          if (want && (want.trunk !== sw.trunk || !want.legs.every((l) => sw.legs.includes(l)))) { removed++; byNode.delete(sw.node); continue; }
        }
        keep.push(sw);
      }
      d.switches = keep;
      for (const [node, e] of ends) {
        if (e.length !== 3 || byNode.has(node) || d.nodes.find((n) => n.id === node)?.pairs) continue;
        const g = this.switchGeom(e); if (!g) continue;
        const id = this.uid('W', d.switches);
        d.switches.push({ id, node, trunk: g.trunk, legs: g.legs, state: 0, vDiv: 60 }); added++;
      }
      return { added, removed };
    });
  }
  /** Weiche: Abzweiggeschwindigkeit, Stränge tauschen (gerade ↔ abzweigend) */
  setSwitchProps(id: string, p: { vDiv?: number; swapLegs?: boolean }): void {
    this.op(() => {
      const sw = this.def.switches.find((x) => x.id === id); if (!sw) throw new Error(MODEL_TEXT.unknown('Weiche', id));
      if (p.vDiv !== undefined && p.vDiv > 0 && p.vDiv <= 200) sw.vDiv = Math.round(p.vDiv);
      if (p.swapLegs && sw.legs.length >= 2) sw.legs = [sw.legs[1], sw.legs[0], ...sw.legs.slice(2)];
    });
  }
  private switchGeom(e: { t: TrackDef; atA: boolean }[]): { trunk: string; legs: string[] } | null {
    if (new Set(e.map((x) => x.t.id)).size !== 3) return null; // Gleis mit beiden Enden am Knoten
    const dirs = e.map((x) => endDir(x.t.pts, x.atA));
    let ti = 0, best = Infinity;
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3, k = (i + 2) % 3;
      const mx = dirs[j].x + dirs[k].x, mz = dirs[j].z + dirs[k].z, h = Math.hypot(mx, mz) || 1;
      const sc = (dirs[i].x * mx + dirs[i].z * mz) / h;
      if (sc < best) { best = sc; ti = i; }
    }
    const legs = [0, 1, 2].filter((i) => i !== ti)
      .sort((p, q) => (dirs[ti].x * dirs[p].x + dirs[ti].z * dirs[p].z) - (dirs[ti].x * dirs[q].x + dirs[ti].z * dirs[q].z))
      .map((i) => e[i].t.id);
    return { trunk: e[ti].t.id, legs };
  }

  // ---------------------------------------------------------------- Prüfen
  validate(): Issue[] {
    // validate.ts kann bei kaputten Verweisen (z. B. Weichenstrang ohne Gleis) werfen → als Fehler melden
    try { return validate(this.def).issues; } catch (e) { return [{ sev: 'error', msg: String((e as Error)?.message ?? e) }]; }
  }
  /** true, wenn keine Fehler (Warnungen erlaubt) */
  ok(): boolean { return !this.validate().some((i) => i.sev === 'error'); }
}
