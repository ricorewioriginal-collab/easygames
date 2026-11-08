/**
 * Prozedurale Menschen: glatte, anatomisch proportionierte Körper aus gerundeten Querschnitten (kein Low Poly),
 * Gesicht mit Augen (Iris, Lidschlag), Nase, Lippen, Brauen, Ohren; neun Frisuren, Bart, Kleidung als eigene Stoffschicht
 * (Farbe + Volumen auf der Haut), Röcke/Kleider als Extra-Mesh, Bade-Outfits. Animation per Code (Gehen, Rennen, Schwimmen, Graben …).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Look } from '../core/types';

export type Mode = 'idle' | 'walk' | 'swim' | 'jump' | 'dig' | 'talk' | 'wave' | 'sit' | 'kiss' | 'hug' | 'cheer' | 'lie' | 'dive';

type Region = 'skin' | 'top' | 'bottom' | 'swimTop' | 'swimBottom' | 'shoe';
interface Ring { y: number; rx: number; rz: number; cz?: number }

const tmpC = new THREE.Color();

/** Röhre aus elliptischen Ringen entlang y; f liefert Region je Ring-Höhe t (0 unten … 1 oben) und Winkel a (0 = vorn) */
function loft(rings: Ring[], seg: number, sub: number, bump: ((t: number, a: number, y: number) => number) | null, region: (t: number, a: number) => Region, paint: (r: Region, t: number, a: number) => [THREE.Color, number]): THREE.BufferGeometry {
  // immer von unten nach oben (einheitliche Flächenorientierung, t = 0 unten)
  if (rings[0].y > rings[rings.length - 1].y) rings = [...rings].reverse();
  // Ringe fein unterteilen (Catmull-Rom über y, rx, rz)
  const R: Ring[] = [];
  for (let i = 0; i < rings.length - 1; i++)
    for (let s = 0; s < sub; s++) {
      const u = s / sub,
        p0 = rings[Math.max(0, i - 1)],
        p1 = rings[i],
        p2 = rings[i + 1],
        p3 = rings[Math.min(rings.length - 1, i + 2)];
      const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
      R.push({ y: cr(p0.y, p1.y, p2.y, p3.y), rx: Math.max(0.002, cr(p0.rx, p1.rx, p2.rx, p3.rx)), rz: Math.max(0.002, cr(p0.rz, p1.rz, p2.rz, p3.rz)), cz: cr(p0.cz || 0, p1.cz || 0, p2.cz || 0, p3.cz || 0) });
    }
  R.push(rings[rings.length - 1]);
  const y0 = R[0].y,
    y1 = R[R.length - 1].y;
  const pos: number[] = [],
    col: number[] = [],
    idx: number[] = [];
  R.forEach((r, j) => {
    const t = (r.y - y0) / (y1 - y0 || 1);
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      const reg = region(t, a);
      const [c, off] = paint(reg, t, a);
      const b = bump ? bump(t, a, r.y) : 0;
      const sx = Math.sin(a),
        cz = Math.cos(a);
      pos.push(sx * (r.rx + off + b * Math.abs(sx) * 0.4), r.y, (r.cz || 0) + cz * (r.rz + off + b));
      col.push(c.r, c.g, c.b);
    }
    if (j > 0)
      for (let i = 0; i < seg; i++) {
        const a = (j - 1) * (seg + 1) + i,
          b2 = a + seg + 1;
        idx.push(a, b2, a + 1, a + 1, b2, b2 + 1);
      }
  });
  // Deckel unten und oben (eigene Randpunkte, damit die Schattierung der Röhre sauber bleibt)
  const capc = (j: number, down: boolean) => {
    const r = R[j],
      base = pos.length / 3,
      c0 = j * (seg + 1) * 3;
    pos.push(0, r.y + (down ? -0.004 : 0.004), r.cz || 0);
    col.push(col[c0], col[c0 + 1], col[c0 + 2]);
    for (let i = 0; i <= seg; i++) {
      const a = (j * (seg + 1) + i) * 3;
      pos.push(pos[a], pos[a + 1], pos[a + 2]);
      col.push(col[a], col[a + 1], col[a + 2]);
    }
    for (let i = 0; i < seg; i++) {
      const a = base + 1 + i;
      if (down) idx.push(base, a, a + 1);
      else idx.push(base, a + 1, a);
    }
  };
  capc(0, true);
  capc(R.length - 1, false);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function eyeTexture(iris: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const x = c.getContext('2d')!;
  x.fillStyle = '#f4efe8';
  x.fillRect(0, 0, 128, 64);
  const cx = 32,
    cy = 32;
  const g = x.createRadialGradient(cx, cy, 1, cx, cy, 11);
  g.addColorStop(0, '#000');
  g.addColorStop(0.32, '#000');
  g.addColorStop(0.36, iris);
  g.addColorStop(0.9, new THREE.Color(iris).multiplyScalar(0.6).getStyle());
  g.addColorStop(1, '#222');
  x.fillStyle = g;
  x.beginPath();
  x.ellipse(cx, cy, 10.5, 11, 0, 0, 7);
  x.fill();
  x.fillStyle = 'rgba(255,255,255,.9)';
  x.beginPath();
  x.arc(cx + 3, cy - 4, 2, 0, 7);
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let hairTex: THREE.CanvasTexture | null = null;
function strands(): THREE.CanvasTexture {
  if (hairTex) return hairTex;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const x = c.getContext('2d')!;
  x.fillStyle = '#808080';
  x.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 260; i++) {
    const l = 90 + Math.random() * 120;
    x.strokeStyle = `rgba(${l},${l},${l},.55)`;
    x.lineWidth = 0.6 + Math.random();
    const sx = Math.random() * 64;
    x.beginPath();
    x.moveTo(sx, 0);
    x.bezierCurveTo(sx + (Math.random() - 0.5) * 8, 40, sx + (Math.random() - 0.5) * 8, 90, sx + (Math.random() - 0.5) * 6, 128);
    x.stroke();
  }
  hairTex = new THREE.CanvasTexture(c);
  hairTex.wrapS = hairTex.wrapT = THREE.RepeatWrapping;
  hairTex.colorSpace = THREE.SRGBColorSpace;
  return hairTex;
}

interface Pose { [k: string]: number }

export class Human {
  readonly root = new THREE.Group();
  private hips = new THREE.Group();
  private spine = new THREE.Group();
  private neck = new THREE.Group();
  private head = new THREE.Group();
  private shL = new THREE.Group();
  private shR = new THREE.Group();
  private elL = new THREE.Group();
  private elR = new THREE.Group();
  private thL = new THREE.Group();
  private thR = new THREE.Group();
  private knL = new THREE.Group();
  private knR = new THREE.Group();
  private eyes: THREE.Mesh[] = [];
  private lids: THREE.Mesh[] = [];
  private parts = new Map<THREE.Object3D, THREE.BufferGeometry[]>();
  private hairParts: THREE.BufferGeometry[] = [];
  private vmat!: THREE.MeshStandardMaterial;
  private hairMat: THREE.MeshStandardMaterial | null = null;
  private mats: THREE.Material[] = [];
  private geos: THREE.BufferGeometry[] = [];
  private k = 1;
  private hipY = 0.97;
  private ph = 0;
  private t = Math.random() * 10;
  private blink = 2;
  private cur: Pose = {};
  look: Look;
  /** Kopf drehen (Gieren relativ zum Körper) */
  lookYaw = 0;
  lookPitch = 0;
  mode: Mode = 'idle';
  speed = 0;

  constructor(look: Look, private detail = 1) {
    this.look = look;
    this.root.add(this.hips);
    this.hips.add(this.spine, this.thL, this.thR);
    this.spine.add(this.neck, this.shL, this.shR);
    this.neck.add(this.head);
    this.shL.add(this.elL);
    this.shR.add(this.elR);
    this.thL.add(this.knL);
    this.thR.add(this.knR);
    this.build();
  }

  dispose() {
    this.geos.forEach((g) => g.dispose());
    this.mats.forEach((m) => m.dispose());
    this.geos = [];
    this.mats = [];
  }

  setLook(look: Look) {
    this.look = look;
    for (const j of [this.hips, this.spine, this.neck, this.head, this.shL, this.shR, this.elL, this.elR, this.thL, this.thR, this.knL, this.knR])
      [...j.children].forEach((c) => (c as THREE.Mesh).isMesh && j.remove(c));
    this.dispose();
    this.eyes = [];
    this.build();
  }

  private mesh(g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D) {
    this.geos.push(g);
    const me = new THREE.Mesh(g, m);
    me.castShadow = true;
    me.receiveShadow = true;
    parent.add(me);
    return me;
  }

  /** Teil zum Gelenk-Mesh hinzufügen (wird pro Gelenk zu einem Draw-Call zusammengeführt) */
  private part(j: THREE.Object3D, g: THREE.BufferGeometry, color?: THREE.Color) {
    if (color) {
      const n = g.attributes.position.count,
        c = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) c.set([color.r, color.g, color.b], i * 3);
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    }
    if (g.attributes.uv) g.deleteAttribute('uv');
    if (!g.attributes.normal) g.computeVertexNormals();
    let l = this.parts.get(j);
    if (!l) this.parts.set(j, (l = []));
    l.push(g);
  }
  private flush() {
    for (const [j, list] of this.parts) {
      const g = list.length > 1 ? mergeGeometries(list)! : list[0];
      if (list.length > 1) list.forEach((x) => x.dispose());
      this.mesh(g, this.vmat, j);
    }
    this.parts.clear();
  }

  private build() {
    const L = this.look,
      k = (this.k = L.height / 1.75),
      w = L.body === 'w',
      b = 1 + (L.build - 0.4) * 0.3,
      cu = L.curve;
    const swim = !!L.swimming;
    const seg = this.detail > 0 ? 24 : 14,
      sub = this.detail > 0 ? 4 : 2;
    const skin = new THREE.Color(L.skin);
    const colors: Record<Region, THREE.Color> = {
      skin,
      top: new THREE.Color(L.topColor),
      bottom: new THREE.Color(L.bottom === 'kleid' ? L.topColor : L.bottomColor),
      swimTop: new THREE.Color(L.swimColor),
      swimBottom: new THREE.Color(L.swimColor),
      shoe: new THREE.Color(L.shoes),
    };
    const OFF: Record<Region, number> = { skin: 0, top: 0.007, bottom: 0.008, swimTop: 0.003, swimBottom: 0.003, shoe: 0.01 };
    const paint = (r: Region, t: number, a: number): [THREE.Color, number] => {
      if (r === 'skin') {
        // leichte Hautvariation (Wärme an Gelenken)
        tmpC.copy(skin).offsetHSL(0, 0.02 * Math.sin(a * 3 + t * 9), 0.015 * Math.cos(t * 13));
        return [tmpC.clone(), 0];
      }
      tmpC.copy(colors[r]).multiplyScalar(0.95 + 0.05 * Math.sin(t * 40 + a * 2));
      return [tmpC.clone(), OFF[r] * k];
    };
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0 });
    this.mats.push(mat);
    this.vmat = mat;

    // Kleidungsabdeckung
    const topCover = (part: 'torso' | 'up' | 'fore', t: number, a: number): Region | null => {
      if (swim) {
        if (part !== 'torso') return null;
        if (L.swim === 'bikini') return t > 0.5 && t < 0.72 ? 'swimTop' : null;
        if (L.swim === 'badeanzug') return t < 0.82 && (t < 0.74 || Math.abs(Math.sin(a)) < 0.75) ? 'swimTop' : null;
        return null;
      }
      const tp = L.top;
      if (part === 'torso') {
        if (tp === 'top') return t > 0.32 ? 'top' : null;
        if (tp === 'tank') return t < 0.86 || Math.abs(Math.sin(a)) < 0.6 ? 'top' : null;
        return 'top';
      }
      if (part === 'up') {
        const cov = { tshirt: 0.55, polo: 0.6, hemd: 1, bluse: 0.75, kleid: 0.25, tank: -1, top: 0.15 }[tp];
        return 1 - t < cov ? 'top' : null;
      }
      return tp === 'hemd' && t > 0.45 ? 'top' : null;
    };
    const botCover = (part: 'pelvis' | 'thigh' | 'shin' | 'foot', t: number): Region | null => {
      if (swim) {
        if (part === 'pelvis') {
          if (L.swim === 'bikini' || L.swim === 'badeanzug') return t < 0.55 ? 'swimBottom' : L.swim === 'badeanzug' ? 'swimTop' : null;
          return t < 0.8 ? 'swimBottom' : null;
        }
        if (part === 'thigh') return L.swim === 'trunks' ? (t > 0.55 ? 'swimBottom' : null) : L.swim === 'badehose' ? (t > 0.82 ? 'swimBottom' : null) : null;
        return null;
      }
      const bt = L.bottom;
      if (part === 'foot') return 'shoe';
      if (part === 'pelvis') return bt === 'kleid' && t > 0.5 ? 'top' : 'bottom';
      if (part === 'thigh') return bt === 'jeans' || bt === 'chino' ? 'bottom' : bt === 'shorts' ? (t > 0.4 ? 'bottom' : null) : t > 0.85 ? 'bottom' : null;
      if (part === 'shin') return bt === 'jeans' || bt === 'chino' ? (t > 0.04 ? 'bottom' : 'shoe') : t < 0.06 ? 'shoe' : null;
      return null;
    };
    const R = (rings: Ring[]) => rings.map((r) => ({ y: r.y * k, rx: r.rx * k, rz: r.rz * k, cz: (r.cz || 0) * k }));

    // ---------- Becken ----------
    this.hipY = 0.97 * k;
    this.hips.position.y = this.hipY;
    const hw = w ? 1 + cu * 0.12 : 1;
    const pelvis = R([
      { y: -0.135, rx: 0.05, rz: 0.04 },
      { y: -0.1, rx: 0.13 * hw * b, rz: 0.095 * b },
      { y: -0.04, rx: 0.165 * hw * b, rz: 0.112 * b },
      { y: 0.03, rx: 0.158 * hw * b, rz: 0.107 * b },
      { y: 0.1, rx: (w ? 0.135 : 0.148) * b, rz: 0.1 * b },
    ]);
    this.part(this.hips, loft(pelvis, seg, sub, (t, a) => (Math.cos(a) < -0.3 ? (0.012 + cu * 0.018) * k * Math.exp(-(((t - 0.35) / 0.25) ** 2)) * -Math.cos(a) : 0), (t) => botCover('pelvis', t) || 'skin', paint));
    // ---------- Oberkörper ----------
    this.spine.position.y = 0.1 * k;
    const sw = (w ? 0.158 : 0.182) * b;
    const torso = R([
      { y: -0.02, rx: (w ? 0.135 : 0.148) * b, rz: 0.1 * b },
      { y: 0.06, rx: (w ? 0.126 : 0.142) * b * (1 + Math.max(0, L.build - 0.7) * 0.4), rz: 0.093 * b * (1 + Math.max(0, L.build - 0.7) * 0.5) },
      { y: 0.16, rx: (w ? 0.134 : 0.152) * b, rz: 0.104 * b },
      { y: 0.25, rx: (w ? 0.148 : 0.17) * b, rz: 0.114 * b },
      { y: 0.32, rx: sw, rz: 0.112 * b },
      { y: 0.375, rx: sw * 0.98, rz: 0.1 * b },
      { y: 0.42, rx: sw * 0.84, rz: 0.082 },
      { y: 0.46, rx: 0.075, rz: 0.06 },
    ]);
    const bust = (t: number, a: number) => {
      if (Math.cos(a) < 0) return 0;
      const amp = (w ? 0.012 + cu * 0.04 : 0.008 + L.build * 0.008) * k;
      const s = w ? 0.42 : 0.6;
      return amp * Math.exp(-(((t - 0.6) / 0.11) ** 2)) * (Math.exp(-(((a - 0.5) / s) ** 2)) + Math.exp(-(((a - (Math.PI * 2 - 0.5)) / s) ** 2)));
    };
    this.part(this.spine, loft(torso, seg, sub, bust, (t, a) => topCover('torso', t, a) || 'skin', paint));
    // Rock / Kleid
    if (!swim && (L.bottom === 'rock' || L.bottom === 'kleid')) {
      const len = (L.bottom === 'kleid' ? 0.52 : 0.42) * k;
      const pts = [new THREE.Vector2(0.15 * hw * b * k, 0.08 * k), new THREE.Vector2(0.17 * hw * b * k, -0.05 * k), new THREE.Vector2(0.2 * k, -len * 0.6), new THREE.Vector2(0.24 * k, -len)];
      const sk = new THREE.LatheGeometry(pts, seg);
      sk.scale(1, 1, 0.82);
      const sm = new THREE.MeshStandardMaterial({ color: colors.bottom, roughness: 0.75, side: THREE.DoubleSide });
      this.mats.push(sm);
      this.mesh(sk, sm, this.hips);
    }
    // ---------- Hals und Kopf ----------
    this.neck.position.y = 0.44 * k;
    this.part(this.neck, loft(R([{ y: -0.02, rx: 0.05, rz: 0.048 }, { y: 0.06, rx: 0.043, rz: 0.045 }, { y: 0.11, rx: 0.042, rz: 0.044 }]), 16, 2, null, () => 'skin', paint));
    this.head.position.y = 0.05 * k;
    this.buildHead(mat, k, w);
    // ---------- Arme ----------
    for (const side of [1, -1]) {
      const sh = side > 0 ? this.shL : this.shR,
        el = side > 0 ? this.elL : this.elR;
      sh.position.set(side * (sw * k - 0.004 * k), 0.35 * k, -0.005 * k);
      const ua = 0.29 * k,
        fa = 0.26 * k,
        ab = w ? 0.9 : 1.05 + (L.build - 0.4) * 0.3;
      const up = R([
        { y: 0.045, rx: 0.035 * ab, rz: 0.035 * ab },
        { y: 0.01, rx: 0.053 * ab, rz: 0.052 * ab },
        { y: -0.06, rx: 0.05 * ab, rz: 0.048 * ab },
        { y: -0.17, rx: 0.044 * ab, rz: 0.041 * ab },
        { y: -0.29, rx: 0.036 * ab, rz: 0.034 * ab },
      ]);
      this.part(sh, loft(up, 14, sub, null, (t, a) => topCover('up', t, a) || 'skin', paint));
      el.position.y = -ua;
      const fore = R([
        { y: 0.015, rx: 0.036 * ab, rz: 0.034 * ab },
        { y: -0.05, rx: 0.038 * ab, rz: 0.035 * ab },
        { y: -0.17, rx: 0.029 * ab, rz: 0.024 * ab },
        { y: -0.26, rx: 0.024 * ab, rz: 0.018 * ab },
      ]);
      this.part(el, loft(fore, 12, sub, null, (t, a) => topCover('fore', t, a) || 'skin', paint));
      // Ellbogen: kleine Kugel überdeckt die Naht
      const elb = new THREE.SphereGeometry(0.031 * ab * k, 12, 8);
      const er = topCover('up', 0.02, 0) || 'skin';
      elb.scale(1, 1.05, 1);
      if (er !== 'skin') elb.scale(1 + OFF[er] / (0.037 * ab), 1, 1 + OFF[er] / (0.037 * ab));
      this.part(el, elb, er === 'skin' ? skin : colors[er]);
      // Hand mit Daumen
      const hand = new THREE.SphereGeometry(1, 12, 10);
      hand.scale(0.028 * k, 0.07 * k, 0.017 * k);
      hand.translate(0, -fa - 0.055 * k, 0.004 * k);
      const thumb = new THREE.SphereGeometry(1, 8, 6);
      thumb.scale(0.009 * k, 0.03 * k, 0.01 * k);
      thumb.rotateZ(side * 0.5);
      thumb.translate(side * -0.02 * k, -fa - 0.04 * k, 0.016 * k);
      this.part(el, hand, skin);
      this.part(el, thumb, skin);
    }
    // ---------- Beine ----------
    for (const side of [1, -1]) {
      const th = side > 0 ? this.thL : this.thR,
        kn = side > 0 ? this.knL : this.knR;
      th.position.set(side * 0.088 * k * (w ? 1 + cu * 0.08 : 1), -0.06 * k, 0);
      const lb = b * (w ? 1 + cu * 0.06 : 1);
      const thigh = R([
        { y: 0.05, rx: 0.07 * lb, rz: 0.07 * lb },
        { y: 0, rx: 0.088 * lb, rz: 0.088 * lb },
        { y: -0.12, rx: 0.08 * lb, rz: 0.082 * lb },
        { y: -0.32, rx: 0.062 * lb, rz: 0.064 * lb },
        { y: -0.43, rx: 0.05 * lb, rz: 0.052 * lb },
      ]);
      this.part(th, loft(thigh, 16, sub, null, (t) => botCover('thigh', t) || 'skin', paint));
      kn.position.y = -0.43 * k;
      const shin = R([
        { y: 0.02, rx: 0.05 * lb, rz: 0.05 * lb },
        { y: -0.1, rx: 0.052 * lb, rz: 0.056 * lb, cz: -0.006 },
        { y: -0.25, rx: 0.042 * lb, rz: 0.044 * lb },
        { y: -0.37, rx: 0.031, rz: 0.032 },
        { y: -0.42, rx: 0.03, rz: 0.031 },
      ]);
      this.part(kn, loft(shin, 14, sub, null, (t) => botCover('shin', t) || 'skin', paint));
      // Knie
      const kr = botCover('thigh', 0.01) || 'skin';
      const knee = new THREE.SphereGeometry((0.045 * lb + (kr !== 'skin' ? OFF[kr] : 0)) * k, 14, 10);
      knee.scale(1, 1.05, 1.02);
      this.part(kn, knee, kr === 'skin' ? skin : colors[kr]);
      // Fuß bzw. Schuh
      const barefoot = swim || (L.bottom === 'shorts' && L.top === 'tank' && false);
      const foot = new THREE.SphereGeometry(1, 14, 8);
      foot.scale(0.043 * k, 0.038 * k, 0.12 * k);
      foot.translate(0, -0.43 * k, 0.045 * k);
      this.part(kn, foot, barefoot ? skin : colors.shoe);
    }
    this.flush();
    if (this.hairParts.length) {
      const g = this.hairParts.length > 1 ? mergeGeometries(this.hairParts)! : this.hairParts[0];
      if (this.hairParts.length > 1) this.hairParts.forEach((x) => x.dispose());
      this.mesh(g, this.hairMat!, this.head);
      this.hairParts = [];
    }
    this.cur = {};
  }

  private buildHead(mat: THREE.Material, k: number, w: boolean) {
    const L = this.look;
    const skin = new THREE.Color(L.skin);
    const hw = this.detail > 0 ? 64 : 28,
      hh = this.detail > 0 ? 48 : 20;
    const g = new THREE.SphereGeometry(0.1 * k, hw, hh);
    const p = g.attributes.position as THREE.BufferAttribute,
      v = new THREE.Vector3();
    const col = new Float32Array(p.count * 3);
    const stub = L.beard === 1 ? 0.5 : L.beard === 2 ? 0.3 : 0;
    const G = (a: number, s: number) => Math.exp(-((a / s) ** 2));
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).divideScalar(0.1 * k);
      const ax = Math.abs(v.x),
        fz = Math.max(0, v.z);
      // Grundform: schmaler, höher, Hinterkopf voller
      let x = v.x * 0.84,
        y = v.y * 1.12,
        z = v.z * (v.z < 0 ? 1.06 : 0.97);
      const low = Math.max(0, -v.y);
      x *= 1 - low * low * (w ? 0.45 : 0.34); // Kiefer verjüngen
      if (v.z > 0) z += low * 0.14 * v.z - Math.max(0, v.y - 0.35) * 0.06; // Kinn vor, Stirn leicht zurück
      if (v.y < -0.78) y = -0.78 * 1.12 - (low - 0.78) * 0.55; // Kinnunterseite
      // Wangenknochen, Augenhöhlen, Brauenbogen, Schläfen
      z += G(v.y + 0.02, 0.18) * G(ax - 0.58, 0.22) * 0.05 * fz;
      z -= G(v.y - 0.1, 0.11) * G(ax - 0.33, 0.13) * 0.075 * fz;
      z += G(v.y - 0.27, 0.07) * G(ax - 0.3, 0.25) * 0.025 * fz;
      x -= G(v.y - 0.25, 0.25) * G(v.z - 0.3, 0.4) * 0.03 * Math.sign(v.x);
      // Nase: Rücken, Spitze, Flügel
      const nx = G(v.x, 0.085);
      const along = v.y < 0.12 && v.y > -0.3 ? (0.12 - v.y) / 0.42 : 0;
      z += nx * fz * fz * (along * 0.12 + G(v.y + 0.25, 0.06) * 0.06);
      z += G(v.y + 0.28, 0.05) * G(ax - 0.11, 0.05) * 0.035 * fz;
      // Mund: leichte Wölbung, Lippenlinie
      z += G(v.y + 0.48, 0.12) * G(v.x, 0.22) * 0.025 * fz;
      p.setXYZ(i, x * 0.1 * k, y * 0.1 * k + 0.1 * k, z * 0.1 * k);
      // Farbe: Wangen, Lippen, Bartschatten, Augenschatten
      tmpC.copy(skin);
      tmpC.lerp(new THREE.Color(0xd86a6a), G(v.y + 0.12, 0.18) * G(ax - 0.5, 0.18) * fz * (w ? 0.2 : 0.08));
      tmpC.multiplyScalar(1 - G(v.y - 0.1, 0.09) * G(ax - 0.33, 0.13) * fz * 0.25);
      const lip = G(v.y + 0.475, 0.055) * G(v.x / 1.4, 0.16) * fz;
      tmpC.lerp(new THREE.Color(L.lips), Math.min(1, lip * 2.2));
      if (lip > 0.1 && Math.abs(v.y + 0.475) < 0.012) tmpC.multiplyScalar(0.55);
      if (stub && v.z > -0.25 && v.y < -0.2 && lip < 0.2) tmpC.lerp(new THREE.Color(L.hairColor), stub * Math.min(1, (-0.2 - v.y) * 3.5) * (1 - G(v.y + 0.3, 0.1) * nx));
      col.set([tmpC.r, tmpC.g, tmpC.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    this.part(this.head, g);
    void mat;
    const H = (x: number, y: number, z: number) => new THREE.Vector3(x * k, y * k, z * k);
    const sm = (c: THREE.ColorRepresentation, r = 0.6) => {
      const m = new THREE.MeshStandardMaterial({ color: c, roughness: r });
      this.mats.push(m);
      return m;
    };
    // Augen mit Lidern
    const em = new THREE.MeshStandardMaterial({ map: eyeTexture(L.eyes), roughness: 0.12 });
    const lidC = new THREE.Color(L.skin).multiplyScalar(0.92);
    const lidM = sm(lidC, 0.7);
    this.mats.push(em);
    this.lids = [];
    for (const s of [1, -1]) {
      const r = 0.0122 * k;
      const e = this.mesh(new THREE.SphereGeometry(r, 18, 14), em, this.head);
      e.position.copy(H(s * 0.03, 0.111, 0.076));
      e.rotation.y = -s * 0.08;
      e.castShadow = false;
      this.eyes.push(e);
      const lid = this.mesh(new THREE.SphereGeometry(r * 1.12, 18, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), lidM, this.head);
      lid.position.copy(e.position);
      lid.castShadow = false;
      this.lids.push(lid);
      const low = new THREE.SphereGeometry(r * 1.08, 18, 6, 0, Math.PI * 2, Math.PI * 0.8, Math.PI * 0.2);
      low.rotateX(-0.05);
      low.translate(e.position.x, e.position.y, e.position.z);
      this.part(this.head, low, lidC);
    }
    // Lippen (dezent, mit Hautton gemischt)
    const lipC = new THREE.Color(L.lips).lerp(skin, w ? 0.25 : 0.5);
    for (const [y, sy, sz, sx] of [[0.0535, 0.0045, 0.0075, 0.019], [0.0455, 0.0058, 0.008, 0.017]]) {
      const lg = new THREE.SphereGeometry(1, 16, 8);
      lg.scale(sx * k, sy * k, sz * k);
      lg.translate(0, y * k, 0.0885 * k);
      this.part(this.head, lg, lipC);
    }
    const hc = new THREE.Color(L.hairColor);
    if (L.beard === 2) {
      const mg = new THREE.CapsuleGeometry(0.004 * k, 0.03 * k, 3, 8);
      mg.rotateZ(Math.PI / 2);
      mg.translate(0, 0.0595 * k, 0.092 * k);
      this.part(this.head, mg, hc);
    }
    // Brauen
    for (const s of [1, -1]) {
      const bg = new THREE.CapsuleGeometry((w ? 0.0026 : 0.0036) * k, 0.028 * k, 3, 6);
      bg.rotateZ(Math.PI / 2 + s * (w ? 0.14 : 0.06));
      bg.rotateY(s * 0.25);
      bg.translate(s * 0.031 * k, 0.131 * k, 0.093 * k);
      this.part(this.head, bg, hc);
    }
    // Ohren
    for (const s of [1, -1]) {
      const eg = new THREE.SphereGeometry(1, 10, 8);
      eg.scale(0.008 * k, 0.027 * k, 0.017 * k);
      eg.rotateY(s * 0.35);
      eg.translate(s * 0.082 * k, 0.1 * k, -0.006 * k);
      this.part(this.head, eg, skin);
    }
    this.buildHair(k, w);
  }

  private buildHair(k: number, w: boolean) {
    const L = this.look;
    if (L.hair === 'glatze' && L.beard < 2) return;
    const hm = new THREE.MeshStandardMaterial({ color: L.hairColor, map: strands(), roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide });
    this.mats.push(hm);
    this.hairMat = hm;
    const hp = (g: THREE.BufferGeometry) => {
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      this.hairParts.push(g);
    };
    const hd = this.detail > 0 ? 40 : 20;
    /** Haarschicht über dem Kopf. Haaransatz als Polarwinkel vorn/seitlich/hinten; Werte über π/2 hängen senkrecht herab (lange Haare) */
    const cap = (scale: number, front: number, side: number, back: number, lift = 0, hang = 0.6) => {
      const g = new THREE.SphereGeometry(0.1 * k * scale, hd, Math.round(hd * 0.9), 0, Math.PI * 2, 0, Math.PI);
      const p = g.attributes.position as THREE.BufferAttribute,
        v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).normalize();
        const az = Math.atan2(v.x, v.z); // 0 = vorn
        const aa = Math.abs(az);
        const lim = aa < Math.PI / 2 ? front + (side - front) * Math.pow(aa / (Math.PI / 2), 1.5) : side + (back - side) * ((aa - Math.PI / 2) / (Math.PI / 2));
        const pol = Math.min(Math.acos(Math.max(-1, Math.min(1, v.y))), lim);
        let x: number, y: number, z: number;
        if (pol <= Math.PI / 2) {
          const s = Math.sin(pol);
          x = Math.sin(az) * s * 0.86;
          y = Math.cos(pol) * 1.12 + lift * Math.max(0, Math.cos(pol));
          z = Math.cos(az) * s * (v.z < 0 ? 1.07 : 0.99);
        } else {
          const d = (pol - Math.PI / 2) * hang; // herabhängend
          const flare = 1 + d * 0.25;
          x = Math.sin(az) * 0.86 * flare;
          y = -d * 2.2;
          z = Math.cos(az) * (v.z < 0 ? 1.07 : 0.99) * flare;
        }
        p.setXYZ(i, x * 0.1 * k * scale, y * 0.1 * k * scale + 0.1 * k, z * 0.1 * k * scale);
      }
      g.computeVertexNormals();
      hp(g);
    };
    const S = L.hair;
    if (S === 'undercut') cap(1.06, 1.0, 0.9, 1.15, 0.28);
    else if (S === 'afro') cap(1.42, 1.0, 1.45, 1.65, 0.1);
    else if (S === 'kurz') cap(1.05, 1.08, 1.55, 1.85, 0.07);
    else if (S === 'locken') {
      cap(1.07, 1.08, 1.6, 1.9, 0.12);
      for (let i = 0; i < (this.detail ? 30 : 12); i++) {
        const a = i * 2.4,
          r = 0.035 + ((i * 7) % 5) * 0.01;
        const c = new THREE.SphereGeometry(0.02 * k, 8, 6);
        c.translate(Math.sin(a) * r * k * 0.9, (0.19 - r * 0.45) * k + 0.1 * k * 0.02, Math.cos(a) * r * k - 0.01 * k);
        hp(c);
      }
    } else if (S === 'lang') cap(1.05, 1.12, 2.6, 3.0, 0.05, 0.75);
    else if (S === 'bob') cap(1.06, 1.12, 2.15, 2.25, 0.06, 0.55);
    else if (S === 'zopf' || S === 'dutt') cap(1.04, 1.1, 1.6, 1.95, 0.03);
    if (S === 'zopf') {
      const tm = new THREE.CapsuleGeometry(0.026 * k, 0.2 * k, 4, 10);
      tm.rotateX(0.4);
      tm.translate(0, 0.11 * k, -0.125 * k);
      hp(tm);
    }
    if (S === 'dutt') {
      const bun = new THREE.SphereGeometry(0.042 * k, 14, 10);
      bun.translate(0, 0.205 * k, -0.075 * k);
      hp(bun);
    }
    if (L.beard === 2) {
      // Vollbart: Schicht über Kinn und Kiefer
      const g = new THREE.SphereGeometry(0.1 * k, hd, Math.round(hd * 0.6), Math.PI * 0.05, Math.PI * 0.9, Math.PI * 0.68, Math.PI * 0.28);
      const p = g.attributes.position as THREE.BufferAttribute,
        v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).divideScalar(0.1 * k);
        const low = Math.max(0, -v.y);
        const x = v.x * 0.84 * (1 - low * low * 0.34) * 1.03;
        let y = v.y * 1.12;
        const z = (v.z * 0.97 + low * 0.14 * Math.max(0, v.z)) * 1.035;
        if (v.y < -0.78) y = -0.78 * 1.12 - (low - 0.78) * 0.55 - 0.03;
        p.setXYZ(i, x * 0.1 * k, y * 0.1 * k + 0.1 * k - 0.002 * k, z * 0.1 * k);
      }
      g.computeVertexNormals();
      hp(g);
    }
    void w;
  }

  /** Gesichtsposition (Weltkoordinaten) für Kamera und Porträts */
  faceWorld(out = new THREE.Vector3()): THREE.Vector3 {
    this.root.updateWorldMatrix(true, true);
    return out.set(0, 0.11 * this.k, 0.02).applyMatrix4(this.head.matrixWorld);
  }
  get height() {
    return this.look.height;
  }

  /** Animation: Zielhaltung je Modus, weich überblendet */
  update(dt: number) {
    this.t += dt;
    const t = this.t,
      sp = this.speed,
      k = this.k;
    const P: Pose = {};
    const run = Math.max(0, Math.min(1, (sp - 2.4) / 2.5));
    const amp = Math.min(1, sp / 1.6) * (0.55 + run * 0.35);
    if (this.mode === 'walk' || (this.mode === 'idle' && sp > 0.2)) this.ph += dt * sp * (4.3 - run * 1.1) / k;
    const s = Math.sin(this.ph),
      c = Math.cos(this.ph);
    const breathe = Math.sin(t * 1.6) * 0.015;
    // Grundhaltung
    Object.assign(P, { hipY: this.hipY, rootX: 0, rootY: 0, hipRY: 0, hipRZ: Math.sin(t * 0.4) * 0.02, spX: breathe, spY: 0, spZ: 0, nkX: 0, hdX: this.lookPitch, hdY: this.lookYaw, hdZ: 0, thLX: 0, thRX: 0, thLZ: 0.02, thRZ: -0.02, knL: 0.04, knR: 0.04, shLX: 0.04, shRX: 0.04, shLZ: 0.08, shRZ: -0.08, shLY: 0, shRY: 0, elL: -0.18, elR: -0.18, elLZ: 0, elRZ: 0 });
    switch (this.mode) {
      case 'idle':
      case 'walk':
        if (sp > 0.15) {
          Object.assign(P, {
            hipY: this.hipY - Math.abs(c) * 0.025 * amp * k - run * 0.04 * k,
            hipRY: s * 0.09 * amp,
            spY: -s * 0.14 * amp,
            spX: 0.04 + run * 0.18,
            thLX: -s * amp,
            thRX: s * amp,
            knL: 0.05 + Math.max(0, c) * amp * 1.5,
            knR: 0.05 + Math.max(0, -c) * amp * 1.5,
            shLX: s * amp * 0.75,
            shRX: -s * amp * 0.75,
            elL: -0.25 - amp * 0.4 - run * 0.6,
            elR: -0.25 - amp * 0.4 - run * 0.6,
          });
        }
        break;
      case 'swim': {
        if (sp > 0.3) {
          const q = t * 5.5;
          Object.assign(P, { rootX: 1.25, hipY: this.hipY, shLX: -q % (Math.PI * 2), shRX: -(q + Math.PI) % (Math.PI * 2), shLZ: 0.2, shRZ: -0.2, elL: -0.3, elR: -0.3, thLX: Math.sin(t * 9) * 0.25, thRX: -Math.sin(t * 9) * 0.25, knL: 0.2, knR: 0.2, hdX: -0.7 });
          P.shLX = -((q % (Math.PI * 2)) - Math.PI);
          P.shRX = -(((q + Math.PI) % (Math.PI * 2)) - Math.PI);
        } else Object.assign(P, { shLZ: 1.2 + Math.sin(t * 2.5) * 0.25, shRZ: -1.2 - Math.sin(t * 2.5) * 0.25, shLX: -0.3, shRX: -0.3, elL: -0.4, elR: -0.4, thLX: Math.sin(t * 2.5) * 0.3, thRX: -Math.sin(t * 2.5) * 0.3, knL: 0.5, knR: 0.5 });
        break;
      }
      case 'dive':
        Object.assign(P, { rootX: 2.6, shLX: -3, shRX: -3, elL: 0, elR: 0, thLX: Math.sin(t * 8) * 0.3, thRX: -Math.sin(t * 8) * 0.3 });
        break;
      case 'jump':
        Object.assign(P, { thLX: -0.7, thRX: -0.25, knL: 1.2, knR: 0.5, shLX: -0.6, shRX: 0.4, shLZ: 0.4, shRZ: -0.4, elL: -0.6, elR: -0.6, spX: 0.1 });
        break;
      case 'dig': {
        const d = Math.sin(t * 6);
        Object.assign(P, { spX: 0.55 + d * 0.2, hipY: this.hipY - 0.08 * k, thLX: -0.4, thRX: -0.1, knL: 0.6, knR: 0.3, shLX: -1.1 + d * 0.5, shRX: -1.1 + d * 0.5, shLZ: -0.1, shRZ: 0.1, elL: -0.5, elR: -0.5, hdX: 0.3 });
        break;
      }
      case 'talk':
        Object.assign(P, { elR: -0.9 + Math.sin(t * 2.8) * 0.25, shRX: -0.25 + Math.sin(t * 1.7) * 0.1, elL: -0.35 + Math.sin(t * 2.1 + 1) * 0.15, hdX: this.lookPitch + Math.sin(t * 3.3) * 0.04, hdZ: Math.sin(t * 1.1) * 0.05 });
        break;
      case 'wave':
        Object.assign(P, { shRZ: -2.6, shRX: -0.2, elR: -0.3, elRZ: Math.sin(t * 9) * 0.45 });
        break;
      case 'cheer':
        Object.assign(P, { shLZ: 2.7, shRZ: -2.7, elL: -0.2, elR: -0.2, hipY: this.hipY + Math.abs(Math.sin(t * 7)) * 0.05 * k });
        break;
      case 'sit':
        Object.assign(P, { hipY: 0.44 * k, thLX: -1.45, thRX: -1.45, knL: 1.45, knR: 1.45, thLZ: 0.12, thRZ: -0.12, shLX: -0.35, shRX: -0.35, elL: -0.7, elR: -0.7, spX: 0.08 });
        break;
      case 'lie':
        Object.assign(P, { rootX: -1.5, hipY: 0.14 * k, shLZ: 0.3, shRZ: -0.3, knL: 0.1, knR: 0.25 });
        break;
      case 'kiss':
        Object.assign(P, { spX: 0.12, hdX: 0.12, hdZ: 0.28, shLX: -0.9, shRX: -0.9, shLZ: 0.5, shRZ: -0.5, elL: -1.2, elR: -1.2, elLZ: -0.4, elRZ: 0.4 });
        break;
      case 'hug':
        Object.assign(P, { spX: 0.08, shLX: -1.15, shRX: -1.15, shLZ: 0.35, shRZ: -0.35, elL: -1.0, elR: -1.0, hdZ: 0.15 });
        break;
    }
    // Lidschlag
    this.blink -= dt;
    let eyeS = 1;
    if (this.blink < 0.12) eyeS = Math.abs(this.blink - 0.06) / 0.06;
    if (this.blink < 0) this.blink = 2 + Math.random() * 4;
    this.lids.forEach((l) => (l.rotation.x = -0.32 + (1 - eyeS) * 1.35));
    // weich überblenden
    const f = Math.min(1, dt * 12);
    for (const key in P) this.cur[key] = this.cur[key] === undefined ? P[key] : this.cur[key] + (P[key] - this.cur[key]) * f;
    const C = this.cur;
    this.hips.position.y = C.hipY;
    this.hips.rotation.set(C.rootX, C.hipRY, C.hipRZ);
    if (C.rootX > 0.5) this.hips.position.y = this.hipY * 0.35;
    this.spine.rotation.set(C.spX, C.spY, C.spZ);
    this.head.rotation.set(C.hdX, C.hdY, C.hdZ);
    this.thL.rotation.set(C.thLX, 0, C.thLZ);
    this.thR.rotation.set(C.thRX, 0, C.thRZ);
    this.knL.rotation.x = C.knL;
    this.knR.rotation.x = C.knR;
    this.shL.rotation.set(C.shLX, C.shLY, C.shLZ);
    this.shR.rotation.set(C.shRX, C.shRY, C.shRZ);
    this.elL.rotation.set(C.elL, 0, C.elLZ);
    this.elR.rotation.set(C.elR, 0, C.elRZ);
  }
}
