import * as THREE from 'three';
import type { EdgeStyle, Layout, LayoutEdge, NodeKind, WorldId } from '@shared/levels/types';
import { foldPhaseOfRound } from '@shared/levels/graph';
import type { Rng } from '@shared/rng';
import type { QualitySettings } from '../quality';
import { disposeTree, glow, toon } from '../materials';

/** Farben und Stimmung einer Welt */
export interface WorldTheme {
  name: string;
  skyTop: number;
  skyBottom: number;
  fog: number;
  fogNear: number;
  fogFar: number;
  ambient: number;
  sun: number;
  island: number;
  islandTop: number;
  pad: number;
  pads: Record<NodeKind, number>;
  edges: Record<EdgeStyle, number>;
}

const basePads = (accent: number): Record<NodeKind, number> => ({
  start: 0xffd84a,
  glimmer: 0x4fd6ff,
  thorn: 0xff5a7a,
  event: 0xb77bff,
  item: 0x6bdc7a,
  shop: 0xffa43a,
  portal: 0x9a7bff,
  gate: 0xd9b36a,
  chaos: accent,
});
const baseEdges = (a: number, b: number): Record<EdgeStyle, number> => ({
  path: a,
  bridge: b,
  light: 0xfff2a8,
  vine: 0x56b84a,
  stairs: a,
  rail: 0xc9ced8,
  rainbow: 0xff9ad5,
  beam: 0x7de8ff,
});

export const THEMES: Record<WorldId, WorldTheme> = {
  prismara: {
    name: 'PRISMARA',
    skyTop: 0x6a5cff,
    skyBottom: 0xffc6f0,
    fog: 0xd9c4ff,
    fogNear: 40,
    fogFar: 170,
    ambient: 0xcfc4ff,
    sun: 0xfff0d8,
    island: 0x8a77d8,
    islandTop: 0xe6c8ff,
    pad: 0xf4ecff,
    pads: basePads(0xff7be0),
    edges: baseEdges(0xe9dcff, 0xffd6a0),
  },
  'nova-nexus': {
    name: 'NOVA NEXUS',
    skyTop: 0x050a2a,
    skyBottom: 0x1b3a8a,
    fog: 0x0b1a4a,
    fogNear: 50,
    fogFar: 200,
    ambient: 0x7a90ff,
    sun: 0x9fd6ff,
    island: 0x2c3f7a,
    islandTop: 0x3fe0ff,
    pad: 0xcfe6ff,
    pads: basePads(0x35f0c8),
    edges: baseEdges(0x8fb4ff, 0x59e0ff),
  },
  wurzelwild: {
    name: 'WURZELWILD',
    skyTop: 0x4aa8d8,
    skyBottom: 0xd6f2a8,
    fog: 0xc4e8a0,
    fogNear: 35,
    fogFar: 150,
    ambient: 0xd8f0c0,
    sun: 0xfff2c0,
    island: 0x7a5a38,
    islandTop: 0x5fbf4a,
    pad: 0xe8dcae,
    pads: basePads(0xf2c14a),
    edges: baseEdges(0xcaa874, 0x9a7440),
  },
  'paradox-city': {
    name: 'PARADOX CITY',
    skyTop: 0x1a1030,
    skyBottom: 0xff6a9a,
    fog: 0x4a2a6a,
    fogNear: 45,
    fogFar: 190,
    ambient: 0xc8a4ff,
    sun: 0xffb0c8,
    island: 0x3a3a5a,
    islandTop: 0x6a6aa0,
    pad: 0xe4e0f4,
    pads: basePads(0xffd04a),
    edges: baseEdges(0xb4b0d8, 0x7ae0ff),
  },
  'infinity-carnival': {
    name: 'INFINITY CARNIVAL',
    skyTop: 0x2a1a6a,
    skyBottom: 0xffa84a,
    fog: 0xf0a8a0,
    fogNear: 40,
    fogFar: 170,
    ambient: 0xffd8c0,
    sun: 0xfff0b0,
    island: 0xc03a5a,
    islandTop: 0xffd04a,
    pad: 0xfff4dc,
    pads: basePads(0x4ae0ff),
    edges: baseEdges(0xffe0a0, 0xff6a8a),
  },
};

/** Welt-Dekoration (Himmel, schwebende Objekte …), von den Welt-Dateien erzeugt */
export interface Decor {
  group: THREE.Group;
  update(dt: number, t: number): void;
  dispose?(): void;
}
export interface DecorContext {
  layout: Layout;
  theme: WorldTheme;
  quality: QualitySettings;
  rng: Rng;
  /** Umfang des Bretts (Mittelpunkt und Halbausdehnung) */
  center: THREE.Vector3;
  radius: number;
}
export type DecorFactory = (ctx: DecorContext) => Decor;

const UP = new THREE.Vector3(0, 1, 0);
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();
const tmpC = new THREE.Color();

interface EdgeInst {
  edge: LayoutEdge;
  /** Instanzindizes in den drei InstancedMeshes */
  slabs: number[];
  dots: number[];
  arrow: number;
  vis: number; // aktuelle Sichtbarkeit 0..1
  target: number;
  pts: THREE.Vector3[];
}

/** Zeichnet ein komplettes Layout: Inseln, Felder, Wege (mit 4D-Faltung) – gleiche Technik für alle 50 Bretter. */
export class BoardView {
  readonly group = new THREE.Group();
  private readonly pads: THREE.Object3D[] = [];
  private readonly spinners: { o: THREE.Object3D; speed: number }[] = [];
  private readonly floaters: { o: THREE.Object3D; base: number; ph: number; spin: number }[] = [];
  private readonly edgeInst: EdgeInst[] = [];
  private slabs!: THREE.InstancedMesh;
  private dots!: THREE.InstancedMesh;
  private arrows!: THREE.InstancedMesh;
  private time = 0;
  private dirty = true;
  phase = 0;
  readonly center = new THREE.Vector3();
  radius = 20;

  constructor(
    readonly layout: Layout,
    readonly theme: WorldTheme,
    quality: QualitySettings,
  ) {
    this.buildIslands();
    this.buildPads(quality);
    this.buildEdges();
    this.setPhase(0, true);
    const box = new THREE.Box3();
    for (const n of layout.nodes) box.expandByPoint(tmpP.set(...n.pos));
    box.getCenter(this.center);
    this.radius = Math.max(8, box.getSize(new THREE.Vector3()).length() / 2);
  }

  /** Oberseite des Feldes (hier steht eine Figur) */
  nodePos(id: number, out = new THREE.Vector3()): THREE.Vector3 {
    const n = this.layout.nodes[id];
    if (!n) return out.set(0, 0, 0);
    return out.set(n.pos[0], n.pos[1] + 0.35, n.pos[2]);
  }

  /** Stellt die Faltungsphase der Runde ein; Wege blenden weich ein/aus. */
  setPhaseOfRound(round: number, instant = false): void {
    this.setPhase(foldPhaseOfRound(this.layout, round), instant);
  }
  setPhase(phase: number, instant = false): void {
    this.phase = phase;
    for (const e of this.edgeInst) {
      e.target = !e.edge.folds || e.edge.folds.includes(phase) ? 1 : 0;
      if (instant) e.vis = e.target;
    }
    this.dirty = true;
  }

  /** Hebt ein Feld kurz hervor (z. B. Wahlmöglichkeit) */
  highlight(ids: number[]): void {
    this.pads.forEach((p, i) => {
      const ring = p.getObjectByName('hl');
      if (ring) ring.visible = ids.includes(i);
    });
  }

  private buildIslands(): void {
    const t = this.theme;
    for (const isl of this.layout.islands) {
      const g = new THREE.Group();
      g.position.set(...isl.center);
      const r = Math.max(1.6, isl.radius);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.55, 1.1, 20, 1), toon(t.island));
      body.position.y = -0.7;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.22, 20, 1), toon(t.islandTop));
      top.position.y = -0.04;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(r * 0.55, r * 0.9, 14), toon(t.island));
      tip.rotation.x = Math.PI;
      tip.position.y = -1.7 - r * 0.45 + 0.45;
      body.castShadow = body.receiveShadow = true;
      g.add(body, top, tip);
      if (isl.spin) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.97, 0.09, 6, 40), glow(t.pads.chaos));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.1;
        g.add(ring);
        this.spinners.push({ o: ring, speed: isl.spin });
      }
      this.group.add(g);
    }
  }

  private buildPads(quality: QualitySettings): void {
    const t = this.theme;
    for (const n of this.layout.nodes) {
      const g = new THREE.Group();
      g.position.set(...n.pos);
      const col = t.pads[n.kind];
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.3, 0.3, 14), toon(t.pad));
      base.castShadow = quality.shadows;
      base.receiveShadow = true;
      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 0.95, 0.06, 14),
        toon(col, { emissive: col, emissiveIntensity: 0.25 }),
      );
      top.position.y = 0.17;
      const hl = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.07, 6, 28), glow(0xffffff));
      hl.rotation.x = Math.PI / 2;
      hl.position.y = 0.25;
      hl.name = 'hl';
      hl.visible = false;
      g.add(base, top, hl);
      const icon = this.icon(n.kind, col);
      if (icon) {
        icon.position.y = 1.15;
        g.add(icon);
        this.floaters.push({ o: icon, base: 1.15, ph: n.id * 0.9, spin: n.kind === 'start' ? 0 : 1.2 });
      }
      this.pads.push(g);
      this.group.add(g);
    }
  }

  private icon(kind: NodeKind, col: number): THREE.Object3D | null {
    const m = toon(col, { emissive: col, emissiveIntensity: 0.35 });
    switch (kind) {
      case 'glimmer':
        return new THREE.Mesh(new THREE.OctahedronGeometry(0.42), m);
      case 'thorn': {
        const g = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const c = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.7, 6), m);
          c.position.set(Math.cos(i * 2.1) * 0.3, 0, Math.sin(i * 2.1) * 0.3);
          g.add(c);
        }
        return g;
      }
      case 'event':
        return new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), m);
      case 'item': {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), m));
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.52, 0.14), toon(0xffffff));
        g.add(rib);
        return g;
      }
      case 'shop': {
        const g = new THREE.Group();
        const hut = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.7), toon(0xfff1d0));
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.45, 4), m);
        roof.position.y = 0.46;
        roof.rotation.y = Math.PI / 4;
        g.add(hut, roof);
        return g;
      }
      case 'portal':
        return new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.13, 8, 22), glow(col));
      case 'gate': {
        const g = new THREE.Group();
        for (const s of [-0.45, 0.45]) {
          const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.9, 0.16), m);
          p.position.x = s;
          g.add(p);
        }
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.16), m);
        top.position.y = 0.45;
        g.add(top);
        return g;
      }
      case 'chaos':
        return new THREE.Mesh(new THREE.DodecahedronGeometry(0.45), m);
      case 'start': {
        const g = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 6), toon(0xffffff));
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.38, 0.04), m);
        flag.position.set(0.32, 0.42, 0);
        g.add(pole, flag);
        return g;
      }
    }
  }

  private edgePoints(e: LayoutEdge, lane: number): THREE.Vector3[] {
    const a = new THREE.Vector3(...this.layout.nodes[e.from]!.pos);
    const b = new THREE.Vector3(...this.layout.nodes[e.to]!.pos);
    const side = new THREE.Vector3().subVectors(b, a).cross(UP).normalize().multiplyScalar(lane);
    const len = a.distanceTo(b);
    const n = Math.max(2, Math.round(len / 0.95));
    const arc = e.arc ?? 0;
    const pts: THREE.Vector3[] = [];
    // Anfang/Ende außerhalb der Felder (Radius ~1.2)
    const margin = Math.min(0.4, 1.3 / len);
    for (let i = 0; i <= n; i++) {
      const u = margin + (1 - 2 * margin) * (i / n);
      const p = new THREE.Vector3().lerpVectors(a, b, u).add(side);
      p.y += Math.sin(u * Math.PI) * arc + 0.18;
      pts.push(p);
    }
    return pts;
  }

  private buildEdges(): void {
    const edges = this.layout.edges;
    const has = new Set(edges.map((e) => e.from * 1000 + e.to));
    const insts: EdgeInst[] = [];
    let slabN = 0;
    let dotN = 0;
    for (const e of edges) {
      const lane = has.has(e.to * 1000 + e.from) ? 0.34 : 0;
      const pts = this.edgePoints(e, lane);
      const isGlow = e.style === 'light' || e.style === 'rainbow' || e.style === 'beam';
      const inst: EdgeInst = { edge: e, slabs: [], dots: [], arrow: insts.length, vis: 1, target: 1, pts };
      for (let i = 0; i < pts.length - 1; i++)
        (isGlow ? inst.dots : inst.slabs).push(isGlow ? dotN++ : slabN++);
      insts.push(inst);
    }
    this.edgeInst.push(...insts);
    const slabGeo = new THREE.BoxGeometry(1, 0.1, 0.5);
    this.slabs = new THREE.InstancedMesh(slabGeo, toon(0xffffff), Math.max(1, slabN));
    this.dots = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.17, 8, 6),
      glow(0xffffff),
      Math.max(1, dotN),
    );
    this.arrows = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.2, 0.45, 6),
      glow(0xffffff),
      Math.max(1, insts.length),
    );
    this.slabs.count = slabN;
    this.dots.count = dotN;
    this.slabs.receiveShadow = true;
    this.slabs.frustumCulled = this.dots.frustumCulled = this.arrows.frustumCulled = false;
    this.group.add(this.slabs, this.dots, this.arrows);
    // Farben einmalig setzen
    for (const e of this.edgeInst) {
      const c = this.theme.edges[e.edge.style];
      tmpC.setHex(c);
      for (const s of e.slabs) this.slabs.setColorAt(s, tmpC);
      for (const d of e.dots) this.dots.setColorAt(d, tmpC);
      this.arrows.setColorAt(e.arrow, tmpC.clone().lerp(new THREE.Color(0xffffff), 0.35));
    }
    for (const m of [this.slabs, this.dots, this.arrows])
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }

  private writeEdges(): void {
    const dir = new THREE.Vector3();
    for (const e of this.edgeInst) {
      const { pts, vis, edge } = e;
      const scale = Math.max(0.0001, vis);
      const style = edge.style;
      const hide = vis < 0.02;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i]!;
        const b = pts[i + 1]!;
        dir.subVectors(b, a);
        const len = dir.length();
        dir.normalize();
        tmpP.addVectors(a, b).multiplyScalar(0.5);
        if (style === 'stairs') tmpP.y += ((i % 2) - 0.5) * 0.18;
        if (style === 'vine') tmpP.y += Math.sin(i * 1.7 + this.time * 0.8) * 0.06;
        tmpQ.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
        const w = style === 'bridge' ? 1.1 : style === 'rail' ? 0.35 : style === 'vine' ? 0.4 : 0.8;
        const isGlow = style === 'light' || style === 'rainbow' || style === 'beam';
        if (isGlow) {
          const di = e.dots[i]!;
          const wob = Math.sin(this.time * 3 + i * 0.7 + e.arrow) * 0.07;
          tmpP.y += wob;
          tmpS.setScalar(hide ? 0.0001 : scale * (style === 'beam' ? 0.7 : 1));
          tmpM.compose(tmpP, tmpQ, tmpS);
          this.dots.setMatrixAt(di, tmpM);
        } else {
          tmpS.set(hide ? 0.0001 : len * 1.04, hide ? 0.0001 : scale, w * scale);
          tmpM.compose(tmpP, tmpQ, tmpS);
          this.slabs.setMatrixAt(e.slabs[i]!, tmpM);
        }
      }
      // Pfeil bei ca. 62 % Länge
      const k = Math.min(pts.length - 2, Math.max(0, Math.floor((pts.length - 1) * 0.62)));
      const a = pts[k]!;
      const b = pts[k + 1]!;
      dir.subVectors(b, a).normalize();
      tmpP.copy(a).lerp(b, 0.5);
      tmpP.y += 0.28;
      tmpQ.setFromUnitVectors(UP, dir);
      tmpS.setScalar(hide ? 0.0001 : scale);
      tmpM.compose(tmpP, tmpQ, tmpS);
      this.arrows.setMatrixAt(e.arrow, tmpM);
    }
    this.slabs.instanceMatrix.needsUpdate =
      this.dots.instanceMatrix.needsUpdate =
      this.arrows.instanceMatrix.needsUpdate =
        true;
  }

  update(dt: number): void {
    this.time += dt;
    let moving = false;
    for (const e of this.edgeInst) {
      if (e.vis !== e.target) {
        const d = e.target - e.vis;
        e.vis = Math.abs(d) < 0.01 ? e.target : e.vis + d * Math.min(1, dt * 5);
        moving = true;
      }
    }
    for (const s of this.spinners) s.o.rotation.z += s.speed * dt;
    for (const f of this.floaters) {
      f.o.position.y = f.base + Math.sin(this.time * 2 + f.ph) * 0.12;
      f.o.rotation.y += f.spin * dt;
    }
    const glowEdges = this.dots.count > 0;
    if (moving || this.dirty || glowEdges || this.edgeInst.some((e) => e.edge.style === 'vine')) {
      this.writeEdges();
      this.dirty = false;
    }
  }

  dispose(): void {
    disposeTree(this.group);
    this.slabs.dispose();
    this.dots.dispose();
    this.arrows.dispose();
  }
}

/** Fallback, falls für eine Welt keine eigene Dekoration vorliegt: nur ein paar treibende Kristalle */
export const plainDecor: DecorFactory = (ctx) => {
  const group = new THREE.Group();
  const items: THREE.Mesh[] = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.8 + ctx.rng.next() * 1.6),
      toon(ctx.theme.pads.glimmer),
    );
    const a = ctx.rng.next() * Math.PI * 2;
    const r = ctx.radius * (1.2 + ctx.rng.next());
    m.position.set(
      ctx.center.x + Math.cos(a) * r,
      ctx.center.y + ctx.rng.range(-8, 14),
      ctx.center.z + Math.sin(a) * r,
    );
    group.add(m);
    items.push(m);
  }
  return {
    group,
    update(dt) {
      for (const m of items) m.rotation.y += dt * 0.4;
    },
    dispose: () => disposeTree(group),
  };
};

/** Himmelskugel mit Farbverlauf (ein Mesh, kein Bild nötig) */
export function skyDome(top: number, bottom: number, radius = 400): THREE.Mesh {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) } },
    vertexShader:
      'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader:
      'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = smoothstep(-0.25, 0.75, vP.y); gl_FragColor = vec4(mix(bottom, top, h), 1.0); }',
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 14), mat);
  m.renderOrder = -10;
  return m;
}
