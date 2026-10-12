/**
 * Three.js-Darstellung: Neon-Strecke, Tunnel, Hindernisse, Partikel und Bloom.
 * Alles wird prozedural erzeugt; keine Texturdateien oder Modelle.
 */
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  DoubleSide,
  EdgesGeometry,
  FogExp2,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  ShaderMaterial,
  TetrahedronGeometry,
  DodecahedronGeometry,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
  type Object3D,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { damp } from '../core/math';
import type { Quality } from '../core/storage';
import type { LevelDef, TunnelShape } from '../game/levels';
import type { GameSession } from '../game/session';
import type { Track } from '../game/track';
import type { EffectSlot } from '../game/unlocks';
import { makePalette, type Palette } from './palette';
import { Particles, type BurstStyle } from './particles';

export const LANE_WIDTH = 2.2;
const SHIP_Y = 0.75;
const VIEW_DIST = 95;
const TUNNEL_SPACING = 6;
const WHITE = new Color(1, 1, 1);

export const laneX = (lane: number): number => (lane - 1) * LANE_WIDTH;

export interface FrameState {
  time: number;
  dt: number;
  session: GameSession | null;
  track: Track | null;
  speed: number;
  lanePos: number;
  pulse: number;
  overdrive: boolean;
}

type ResolvedQuality = Exclude<Quality, 'auto'>;

interface QualityProfile {
  pixelRatio: number;
  bloom: boolean;
  bloomScale: number;
  rings: number;
  particles: number;
  floaters: number;
  stars: number;
}

const PROFILES: Record<ResolvedQuality, QualityProfile> = {
  low: {
    pixelRatio: 1,
    bloom: false,
    bloomScale: 0,
    rings: 14,
    particles: 300,
    floaters: 4,
    stars: 250,
  },
  medium: {
    pixelRatio: 1.5,
    bloom: true,
    bloomScale: 0.5,
    rings: 20,
    particles: 600,
    floaters: 8,
    stars: 500,
  },
  high: {
    pixelRatio: 2,
    bloom: true,
    bloomScale: 1,
    rings: 28,
    particles: 1000,
    floaters: 14,
    stars: 900,
  },
};

class Pool<T extends Object3D> {
  private items: T[] = [];
  private used = 0;
  constructor(
    private readonly parent: Object3D,
    private readonly factory: () => T,
  ) {}
  get(): T {
    let it = this.items[this.used];
    if (!it) {
      it = this.factory();
      this.items.push(it);
      this.parent.add(it);
    }
    this.used++;
    it.visible = true;
    return it;
  }
  finish(): void {
    for (let i = this.used; i < this.items.length; i++) this.items[i].visible = false;
    this.used = 0;
  }
}

function polygon(shape: TunnelShape, radius: number): BufferGeometry {
  const counts: Record<TunnelShape, number> = {
    ring: 40,
    hex: 6,
    tri: 3,
    square: 4,
    star: 10,
    octa: 8,
  };
  const n = counts[shape];
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.PI / 2;
    const r = shape === 'star' && i % 2 === 1 ? radius * 0.62 : radius;
    pts.push(Math.cos(a) * r, Math.sin(a) * r, 0);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3));
  return g;
}

const FLOOR_VERT = /* glsl */ `
  uniform float uBendX;
  uniform float uBendY;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    float d = max(0.0, -wp.z);
    wp.x += uBendX * d * d;
    wp.y += uBendY * d * d;
    vDepth = d;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FLOOR_FRAG = /* glsl */ `
  uniform float uScroll;
  uniform vec3 uColor;
  uniform vec3 uColor2;
  uniform float uPulse;
  uniform float uLaneHalf;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    float x = (vUv.x - 0.5) * 160.0;
    vec2 p = vec2(x / 2.2, vUv.y * 100.0 + uScroll);
    vec2 g = abs(fract(p) - 0.5) / fwidth(p);
    float grid = 1.0 - min(min(g.x, g.y), 1.0);
    float lane = step(abs(x), uLaneHalf);
    float fade = exp(-vDepth * 0.022);
    vec3 col = mix(uColor2, uColor, lane) * grid * (0.35 + lane * 0.65);
    col += uColor * lane * 0.06 * (1.0 + uPulse);
    gl_FragColor = vec4(col * fade * (0.8 + uPulse * 0.6), 1.0);
  }
`;

export class WorldRenderer {
  readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(70, 1, 0.1, 400);
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private profile: QualityProfile = PROFILES.high;
  private qualitySetting: Quality = 'auto';
  private resolved: ResolvedQuality = 'high';
  private readonly palette: Palette;
  private level: LevelDef | null = null;
  private paletteId = 'level';
  private equipped: Record<EffectSlot, string> = {
    ship: 'prism',
    trail: 'ribbon',
    palette: 'level',
    burst: 'shards',
  };

  private readonly world = new Group();
  private floor!: Mesh<PlaneGeometry, ShaderMaterial>;
  private laneLines: Line[] = [];
  private rings: LineLoop[] = [];
  private ringGeo: BufferGeometry | null = null;
  private receptors: Mesh<RingGeometry, MeshBasicMaterial>[] = [];
  private receptorFlash = [0, 0, 0];
  private stars!: Points;
  private floaters: LineSegments[] = [];
  private ship = new Group();
  private shipCore: Mesh | null = null;
  private trail: { mesh: Mesh; offset: (i: number, t: number) => number; width: number }[] = [];
  private trailHistory: { x: number; t: number }[] = [];
  private particles!: Particles;
  private notePool!: Pool<Mesh>;
  private orbPool!: Pool<Mesh>;
  private wallPool!: Pool<Mesh>;
  private readonly noteGeo = new OctahedronGeometry(0.55, 0);
  private readonly noteEdges = new EdgesGeometry(this.noteGeo);
  private readonly orbGeo = new IcosahedronGeometry(0.3, 0);
  private readonly wallGeo = new BoxGeometry(LANE_WIDTH * 0.92, 2.2, 0.35);
  private readonly wallEdges = new EdgesGeometry(this.wallGeo);
  private readonly noteMat = new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
  });
  private readonly noteMissMat = new MeshBasicMaterial({
    color: 0x444455,
    transparent: true,
    opacity: 0.5,
  });
  private readonly noteEdgeMat = new LineBasicMaterial({ color: 0xffffff });
  private readonly orbMat = new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    blending: AdditiveBlending,
  });
  private readonly wallMat = new MeshBasicMaterial({
    color: 0xff3355,
    transparent: true,
    opacity: 0.28,
    side: DoubleSide,
    depthWrite: false,
  });
  private readonly wallEdgeMat = new LineBasicMaterial({ color: 0xff6688 });
  private readonly laneMat = new LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
  });
  private readonly shipMat = new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
  });
  private readonly shipEdgeMat = new LineBasicMaterial({ color: 0xffffff });
  private readonly tmpColor = new Color();
  private shake = 0;
  private bendX = 0;
  private bendY = 0;
  private twist = 0;
  private fpsAvg = 60;
  private lowFpsTime = 0;
  private width = 1;
  private height = 1;
  shakeEnabled = true;
  reducedMotion = false;
  onQualityDrop: ((q: ResolvedQuality) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.palette = makePalette('level', 0.8, 0.55, 0);
    this.scene.add(this.world);
    this.scene.fog = new FogExp2(0x000000, 0.018);
    this.buildStatic();
    this.applyQuality('auto');
  }

  private buildStatic(): void {
    const floorGeo = new PlaneGeometry(160, 300, 16, 60);
    floorGeo.rotateX(-Math.PI / 2);
    floorGeo.translate(0, 0, -140);
    this.floor = new Mesh(
      floorGeo,
      new ShaderMaterial({
        vertexShader: FLOOR_VERT,
        fragmentShader: FLOOR_FRAG,
        uniforms: {
          uScroll: { value: 0 },
          uColor: { value: new Color() },
          uColor2: { value: new Color() },
          uPulse: { value: 0 },
          uLaneHalf: { value: LANE_WIDTH * 1.5 },
          uBendX: { value: 0 },
          uBendY: { value: 0 },
        },
        depthWrite: false,
      }),
    );
    this.floor.frustumCulled = false;
    this.floor.renderOrder = -1;
    this.world.add(this.floor);

    for (let i = 0; i < 4; i++) {
      const g = new BufferGeometry();
      g.setAttribute('position', new BufferAttribute(new Float32Array(48 * 3), 3));
      const line = new Line(g, this.laneMat);
      line.frustumCulled = false;
      this.laneLines.push(line);
      this.world.add(line);
    }

    for (let l = 0; l < 3; l++) {
      const r = new Mesh(
        new RingGeometry(0.55, 0.75, 32),
        new MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.5,
          side: DoubleSide,
          depthWrite: false,
        }),
      );
      r.rotation.x = -Math.PI / 2;
      r.position.set(laneX(l), 0.03, 0);
      this.receptors.push(r);
      this.world.add(r);
    }

    this.notePool = new Pool(this.world, () => {
      const m = new Mesh(this.noteGeo, this.noteMat);
      m.add(new LineSegments(this.noteEdges, this.noteEdgeMat));
      return m;
    });
    this.orbPool = new Pool(this.world, () => new Mesh(this.orbGeo, this.orbMat));
    this.wallPool = new Pool(this.world, () => {
      const m = new Mesh(this.wallGeo, this.wallMat);
      m.add(new LineSegments(this.wallEdges, this.wallEdgeMat));
      return m;
    });

    this.ship.position.set(0, SHIP_Y, 0);
    this.world.add(this.ship);
  }

  private rebuildQualityDependent(): void {
    for (const r of this.rings) this.world.remove(r);
    this.rings = [];
    this.buildRings();
    if (this.stars) {
      this.world.remove(this.stars);
      this.stars.geometry.dispose();
    }
    const n = this.profile.stars;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 30 + Math.random() * 90;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r * 0.6 + 10;
      pos[i * 3 + 2] = -Math.random() * 300;
    }
    const sg = new BufferGeometry();
    sg.setAttribute('position', new BufferAttribute(pos, 3));
    this.stars = new Points(
      sg,
      new PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        fog: false,
      }),
    );
    this.world.add(this.stars);

    for (const f of this.floaters) this.world.remove(f);
    this.floaters = [];
    const geos = [
      new IcosahedronGeometry(2, 0),
      new OctahedronGeometry(2.4, 0),
      new TetrahedronGeometry(2.4, 0),
      new DodecahedronGeometry(2, 0),
    ];
    for (let i = 0; i < this.profile.floaters; i++) {
      const f = new LineSegments(
        new EdgesGeometry(geos[i % geos.length]),
        new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }),
      );
      this.resetFloater(f, -Math.random() * VIEW_DIST * 1.5);
      this.floaters.push(f);
      this.world.add(f);
    }

    if (this.particles) {
      this.world.remove(this.particles.points);
      this.particles.points.geometry.dispose();
    }
    this.particles = new Particles(this.profile.particles);
    this.particles.setPixelStyle(this.equipped.burst === 'pixels');
    this.world.add(this.particles.points);
  }

  private resetFloater(f: LineSegments, z: number): void {
    const side = Math.random() < 0.5 ? -1 : 1;
    f.position.set(side * (12 + Math.random() * 18), -2 + Math.random() * 16, z);
    f.userData.spin = (Math.random() - 0.5) * 1.2;
    const s = 0.6 + Math.random() * 1.6;
    f.scale.setScalar(s);
  }

  private buildRings(): void {
    const shape = this.level?.tunnel ?? 'hex';
    this.ringGeo?.dispose();
    this.ringGeo = polygon(shape, 8);
    for (let i = 0; i < this.profile.rings; i++) {
      const ring = new LineLoop(
        this.ringGeo,
        new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }),
      );
      ring.frustumCulled = false;
      this.rings.push(ring);
      this.world.add(ring);
    }
  }

  setQuality(q: Quality): void {
    this.applyQuality(q);
  }

  private applyQuality(q: Quality): void {
    this.qualitySetting = q;
    let res: ResolvedQuality;
    if (q === 'auto') {
      const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
      res = coarse ? 'medium' : 'high';
    } else res = q;
    this.setResolved(res);
  }

  private setResolved(res: ResolvedQuality): void {
    this.resolved = res;
    this.profile = PROFILES[res];
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.profile.pixelRatio));
    this.composer?.dispose();
    this.composer = null;
    this.bloom = null;
    if (this.profile.bloom) {
      const composer = new EffectComposer(this.renderer);
      composer.addPass(new RenderPass(this.scene, this.camera));
      const size = new Vector2(
        this.width * this.profile.bloomScale,
        this.height * this.profile.bloomScale,
      );
      this.bloom = new UnrealBloomPass(size, 0.7, 0.3, 0.55);
      composer.addPass(this.bloom);
      composer.addPass(new OutputPass());
      this.composer = composer;
    }
    this.rebuildQualityDependent();
    this.resize(this.width, this.height);
    this.fpsAvg = 60;
    this.lowFpsTime = 0;
  }

  get quality(): ResolvedQuality {
    return this.resolved;
  }

  resize(w: number, h: number): void {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.renderer.setSize(this.width, this.height, false);
    this.composer?.setSize(this.width, this.height);
    if (this.bloom) {
      this.bloom.resolution.set(
        this.width * this.profile.bloomScale,
        this.height * this.profile.bloomScale,
      );
    }
    const aspect = this.width / this.height;
    this.camera.aspect = aspect;
    // Im Hochformat das Sichtfeld so weiten, dass alle drei Spuren sichtbar bleiben.
    const needHalfWidth = 5.2;
    const dist = 7;
    const vfov = (2 * Math.atan(needHalfWidth / dist / aspect) * 180) / Math.PI;
    this.camera.fov = Math.min(100, Math.max(62, vfov));
    this.camera.updateProjectionMatrix();
  }

  setLevel(level: LevelDef): void {
    const shapeChanged = this.level?.tunnel !== level.tunnel;
    this.level = level;
    if (shapeChanged) {
      for (const r of this.rings) this.world.remove(r);
      this.rings = [];
      this.buildRings();
    }
  }

  setCosmetics(equipped: Record<EffectSlot, string>): void {
    const shipChanged = equipped.ship !== this.equipped.ship || !this.shipCore;
    const trailChanged = equipped.trail !== this.equipped.trail || this.trail.length === 0;
    this.equipped = { ...equipped };
    this.paletteId = equipped.palette;
    if (shipChanged) this.buildShip(equipped.ship);
    if (trailChanged) this.buildTrail(equipped.trail);
    this.particles.setPixelStyle(equipped.burst === 'pixels');
  }

  private buildShip(id: string): void {
    this.ship.clear();
    let geo: BufferGeometry;
    switch (id) {
      case 'octa':
        geo = new OctahedronGeometry(0.55, 0);
        break;
      case 'dart':
        geo = new ConeGeometry(0.32, 1.7, 4);
        geo.rotateX(-Math.PI / 2);
        break;
      case 'crystal':
        geo = new IcosahedronGeometry(0.55, 0);
        break;
      case 'halo':
        geo = new TorusGeometry(0.48, 0.09, 8, 32);
        break;
      default:
        geo = new ConeGeometry(0.5, 1.25, 3);
        geo.rotateX(-Math.PI / 2);
    }
    const core = new Mesh(geo, this.shipMat);
    core.add(new LineSegments(new EdgesGeometry(geo), this.shipEdgeMat));
    this.shipCore = core;
    this.ship.add(core);
  }

  private buildTrail(id: string): void {
    for (const t of this.trail) {
      this.world.remove(t.mesh);
      t.mesh.geometry.dispose();
    }
    this.trail = [];
    const make = (width: number, offset: (i: number, t: number) => number) => {
      const n = 32;
      const g = new BufferGeometry();
      g.setAttribute('position', new BufferAttribute(new Float32Array(n * 2 * 3), 3));
      g.setAttribute('color', new BufferAttribute(new Float32Array(n * 2 * 3), 3));
      const idx: number[] = [];
      for (let i = 0; i < n - 1; i++) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      g.setIndex(idx);
      const m = new Mesh(
        g,
        new MeshBasicMaterial({
          vertexColors: true,
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide,
        }),
      );
      m.frustumCulled = false;
      this.world.add(m);
      this.trail.push({ mesh: m, offset, width });
    };
    if (id === 'helix') {
      make(0.18, (i, t) => Math.sin(t * 9 + i * 0.5) * 0.45);
      make(0.18, (i, t) => -Math.sin(t * 9 + i * 0.5) * 0.45);
    } else if (id === 'comet') {
      make(1.1, () => 0);
    } else if (id === 'sparks') {
      make(0.25, () => 0);
    } else {
      make(0.55, () => 0);
    }
  }

  flashLane(lane: number): void {
    if (lane >= 0 && lane < 3) this.receptorFlash[lane] = 1;
  }

  burst(lane: number, kind: 'perfect' | 'great' | 'good' | 'orb' | 'wall' | 'miss'): void {
    const x = laneX(lane) + this.bendOffsetX(0);
    const style: BurstStyle =
      kind === 'wall' || kind === 'miss'
        ? 'shards'
        : this.equipped.burst === 'rings'
          ? 'rings'
          : this.equipped.burst === 'nova'
            ? 'nova'
            : this.equipped.burst === 'pixels'
              ? 'pixels'
              : 'shards';
    const color =
      kind === 'wall' || kind === 'miss'
        ? this.palette.danger
        : kind === 'orb'
          ? this.palette.secondary
          : kind === 'perfect'
            ? this.tmpColor.copy(WHITE).lerp(this.palette.primary, 0.3)
            : this.palette.primary;
    const counts = { perfect: 34, great: 22, good: 14, orb: 10, wall: 40, miss: 8 } as const;
    const scale = this.profile.particles / 1000;
    const count = Math.max(
      4,
      Math.round(counts[kind] * (0.5 + scale * 0.5) * (style === 'nova' ? 1.6 : 1)),
    );
    this.particles.spawn(
      x,
      SHIP_Y,
      kind === 'orb' ? 0 : -0.2,
      count,
      color,
      style,
      kind === 'perfect' ? 1.2 : 1,
    );
    if (kind === 'wall') this.addShake(0.6);
    else if (kind === 'perfect') this.addShake(0.08);
  }

  addShake(amount: number): void {
    if (!this.shakeEnabled || this.reducedMotion) return;
    this.shake = Math.min(1, this.shake + amount);
  }

  private bendOffsetX(z: number): number {
    const d = Math.max(0, -z);
    return this.bendX * d * d;
  }

  private bendOffsetY(z: number): number {
    const d = Math.max(0, -z);
    return this.bendY * d * d;
  }

  render(s: FrameState): void {
    const t = s.time;
    const dt = Math.min(0.1, Math.max(0, s.dt));
    this.trackFps(dt);
    const level = this.level;
    const motion = this.reducedMotion ? 0.35 : 1;
    const bend = (level?.bend ?? 0.3) * motion;
    this.bendX = Math.sin(t * 0.13) * bend * 0.0022;
    this.bendY = Math.cos(t * 0.09) * bend * 0.0012 - 0.0004 * bend;
    this.twist = (level?.twist ?? 0) * motion;

    makePalette(this.paletteId, level?.hue ?? 0.8, level?.hue2 ?? 0.55, t, this.palette);
    const pal = this.palette;
    const od = s.overdrive ? 1 : 0;
    this.renderer.setClearColor(pal.background);
    (this.scene.fog as FogExp2).color.copy(pal.background);

    const scroll = t * s.speed;
    const fu = this.floor.material.uniforms;
    fu.uScroll.value = scroll / 3;
    (fu.uColor.value as Color).copy(pal.primary);
    (fu.uColor2.value as Color).copy(pal.secondary).multiplyScalar(0.5);
    fu.uPulse.value = s.pulse * 0.8 + od * 0.4;
    fu.uBendX.value = this.bendX;
    fu.uBendY.value = this.bendY;

    // Spurbegrenzungen als gekrümmte Linien.
    this.laneMat.color.copy(pal.primary).lerp(WHITE, 0.25 + s.pulse * 0.3);
    for (let i = 0; i < 4; i++) {
      const x0 = (i - 1.5) * LANE_WIDTH;
      const arr = this.laneLines[i].geometry.attributes.position.array as Float32Array;
      for (let k = 0; k < 48; k++) {
        const z = 6 - k * 2.1;
        arr[k * 3] = x0 + this.bendOffsetX(z);
        arr[k * 3 + 1] = 0.02 + this.bendOffsetY(z);
        arr[k * 3 + 2] = z;
      }
      this.laneLines[i].geometry.attributes.position.needsUpdate = true;
    }

    // Tunnel aus pulsierenden Polygonen.
    const nRings = this.rings.length;
    const offset = scroll % TUNNEL_SPACING;
    for (let i = 0; i < nRings; i++) {
      const ring = this.rings[i];
      const z = 6 - i * TUNNEL_SPACING + offset;
      const depth = Math.max(0, -z);
      ring.position.set(this.bendOffsetX(z), 2.2 + this.bendOffsetY(z), z);
      const pulse = 1 + s.pulse * 0.08 * Math.exp(-depth * 0.02) + od * 0.05;
      ring.scale.setScalar(pulse);
      ring.rotation.z = this.twist * depth * 0.02 + t * 0.15 * (this.twist > 0 ? 1 : 0.2);
      const mat = ring.material as LineBasicMaterial;
      const k = (i / nRings + t * 0.05) % 1;
      mat.color.copy(pal.primary).lerp(pal.secondary, Math.abs(k * 2 - 1));
      mat.opacity = Math.min(1, 0.25 + Math.exp(-depth * 0.02) * 0.75);
    }

    // Sterne und schwebende Körper ziehen vorbei.
    this.stars.position.z = (scroll * 0.15) % 300;
    for (const f of this.floaters) {
      f.position.z += s.speed * dt * 0.6;
      f.rotation.x += f.userData.spin * dt;
      f.rotation.y += f.userData.spin * 0.7 * dt;
      if (f.position.z > 10) this.resetFloater(f, -VIEW_DIST - Math.random() * 40);
      const m = f.material as LineBasicMaterial;
      m.color.copy(pal.secondary).lerp(pal.primary, 0.5 + 0.5 * Math.sin(t + f.position.x));
    }

    // Empfänger-Ringe auf der Trefferlinie.
    for (let l = 0; l < 3; l++) {
      this.receptorFlash[l] = damp(this.receptorFlash[l], 0, 10, dt);
      const r = this.receptors[l];
      const active = Math.round(s.lanePos) === l ? 1 : 0;
      r.material.color.copy(pal.primary).lerp(WHITE, this.receptorFlash[l]);
      r.material.opacity = 0.25 + active * 0.35 + this.receptorFlash[l] * 0.4;
      r.scale.setScalar(1 + this.receptorFlash[l] * 0.35 + s.pulse * 0.08);
    }

    // Gleiter.
    const shipX = laneX(s.lanePos);
    this.ship.position.x = shipX;
    this.ship.position.y = SHIP_Y + Math.sin(t * 3) * 0.06 * motion;
    this.ship.rotation.z = damp(
      this.ship.rotation.z,
      (Math.round(s.lanePos) - s.lanePos) * 1.2,
      12,
      dt,
    );
    if (this.shipCore) {
      const spin = this.equipped.ship === 'octa' || this.equipped.ship === 'crystal' ? t * 1.6 : 0;
      this.shipCore.rotation.y = spin;
      if (this.equipped.ship === 'halo')
        this.shipCore.rotation.x = Math.PI / 2 + Math.sin(t * 2) * 0.3;
      this.shipCore.scale.setScalar(1 + s.pulse * 0.12 + od * 0.1);
    }
    this.shipMat.color.copy(pal.primary).lerp(WHITE, 0.35 + od * 0.4);
    this.shipEdgeMat.color.copy(pal.secondary).lerp(WHITE, 0.6);

    this.updateTrail(s, shipX, t, dt);
    this.updateObjects(s);
    this.particles.update(dt);

    // Kamera folgt sanft, mit Erschütterung bei Treffern.
    this.shake = damp(this.shake, 0, 6, dt);
    const sh = this.shake * this.shake * 0.5;
    const camX = shipX * 0.35 + (Math.random() - 0.5) * sh;
    this.camera.position.set(camX, 3.1 + (Math.random() - 0.5) * sh, 7);
    this.camera.lookAt(shipX * 0.5, 0.9, -14);
    this.camera.rotateZ(Math.sin(t * 0.2) * 0.02 * bend + (s.lanePos - 1) * -0.015 * motion);

    if (this.bloom) this.bloom.strength = 0.6 + s.pulse * 0.2 + od * 0.3;
    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }

  private updateTrail(s: FrameState, shipX: number, t: number, dt: number): void {
    const hist = this.trailHistory;
    hist.unshift({ x: shipX, t });
    if (hist.length > 32) hist.length = 32;
    const pal = this.palette;
    for (const tr of this.trail) {
      const pos = tr.mesh.geometry.attributes.position.array as Float32Array;
      const col = tr.mesh.geometry.attributes.color.array as Float32Array;
      const width = tr.width * (this.equipped.trail === 'comet' ? 1 + s.pulse * 0.5 : 1);
      for (let i = 0; i < 32; i++) {
        const h = hist[Math.min(i, hist.length - 1)];
        const z = 0.4 + i * 0.07 * (s.speed / 20);
        const x = h.x + tr.offset(i, t - i * 0.016);
        const w = width * (1 - i / 32);
        const k = (1 - i / 32) * 0.9;
        const a = i * 6;
        pos[a] = x - w / 2;
        pos[a + 1] = SHIP_Y - 0.1;
        pos[a + 2] = z;
        pos[a + 3] = x + w / 2;
        pos[a + 4] = SHIP_Y - 0.1;
        pos[a + 5] = z;
        const c = i < 6 ? pal.primary : pal.secondary;
        col[a] = col[a + 3] = c.r * k;
        col[a + 1] = col[a + 4] = c.g * k;
        col[a + 2] = col[a + 5] = c.b * k;
      }
      tr.mesh.geometry.attributes.position.needsUpdate = true;
      tr.mesh.geometry.attributes.color.needsUpdate = true;
    }
    if (this.equipped.trail === 'sparks' && dt > 0 && Math.random() < 0.8) {
      this.particles.spawn(shipX, SHIP_Y - 0.1, 0.5, 1, pal.secondary, 'trail');
    }
  }

  private updateObjects(s: FrameState): void {
    const session = s.session;
    const track = s.track;
    const pal = this.palette;
    this.noteMat.color.copy(pal.primary).lerp(WHITE, 0.2);
    this.noteEdgeMat.color.copy(pal.secondary).lerp(WHITE, 0.7);
    this.orbMat.color.copy(pal.secondary).lerp(WHITE, 0.3);
    this.wallMat.color.copy(pal.danger);
    this.wallEdgeMat.color.copy(pal.danger).lerp(WHITE, 0.3);
    if (session && track) {
      const evs = track.events;
      const t = s.time;
      const horizon = VIEW_DIST / s.speed;
      for (let i = Math.max(0, session.firstOpenIndex - 24); i < evs.length; i++) {
        const ev = evs[i];
        const dtEv = ev.time - t;
        if (dtEv > horizon) break;
        if (session.isGone(ev.id)) continue;
        const z = -dtEv * s.speed;
        if (z > 7) continue;
        const bx = this.bendOffsetX(z);
        const by = this.bendOffsetY(z);
        if (ev.kind === 'note') {
          const m = this.notePool.get();
          const missed = session.isResolved(ev.id) || i < session.firstOpenIndex;
          m.material = missed ? this.noteMissMat : this.noteMat;
          m.position.set(laneX(ev.lane) + bx, SHIP_Y + by, z);
          m.rotation.set(0, t * 2 + ev.id, Math.PI / 4);
          m.scale.setScalar(1 + s.pulse * 0.15);
        } else if (ev.kind === 'orb') {
          if (z > 1) continue;
          const m = this.orbPool.get();
          m.position.set(
            laneX(ev.lane) + bx,
            SHIP_Y + 0.1 + by + Math.sin(t * 6 + ev.id) * 0.12,
            z,
          );
          m.rotation.set(t * 3, t * 2, 0);
          m.scale.setScalar(1 + s.pulse * 0.3);
        } else {
          for (const l of ev.lanes) {
            const m = this.wallPool.get();
            m.position.set(laneX(l) + bx, 1.1 + by, z);
            m.scale.set(1, 1 + s.pulse * 0.05, 1);
          }
        }
      }
    }
    this.notePool.finish();
    this.orbPool.finish();
    this.wallPool.finish();
  }

  private trackFps(dt: number): void {
    if (dt <= 0) return;
    this.fpsAvg = this.fpsAvg * 0.95 + (1 / dt) * 0.05;
    if (this.qualitySetting !== 'auto' || this.resolved === 'low') return;
    if (this.fpsAvg < 42) this.lowFpsTime += dt;
    else this.lowFpsTime = Math.max(0, this.lowFpsTime - dt);
    if (this.lowFpsTime > 3) {
      const next: ResolvedQuality = this.resolved === 'high' ? 'medium' : 'low';
      this.setResolved(next);
      this.onQualityDrop?.(next);
    }
  }

  get fps(): number {
    return this.fpsAvg;
  }
}
