/**
 * RADIO-BINGO – das 3D-Fernsehstudio: spiegelnder Boden mit LED-Ringen, gebogene LED-Wand mit der Zahlentafel, großer Bildschirm,
 * gläserne Kugeltrommel mit 75 bzw. 90 wirbelnden Kugeln, Steigrohr, Kugel-Schiene, Moderatorpult mit Moderator Rico,
 * Studio-Publikum, bewegte Scheinwerfer, Konfetti und eine Kameraregie (Totale, Trommel, Moderator, Kugel).
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Host, HOST_H } from './host';
import type { Kind } from '../core/bingo';

const COL75 = ['#2f7bff', '#ff3b5c', '#e8ecf5', '#22c55e', '#ffc61a'];
export const ballColor = (n: number, kind: Kind) => (kind === 90 ? ['#2f7bff', '#ff3b5c', '#22c55e', '#ffc61a', '#a855f7', '#ff8a1f', '#14d4d4', '#ff4fd8', '#e8ecf5'][Math.min(8, Math.floor(n / 10))] : COL75[Math.min(4, Math.floor((n - 1) / 15))]);
const LET = ['B', 'I', 'N', 'G', 'O'];

function canvasTex(w: number, h: number, draw: (x: CanvasRenderingContext2D) => void, tex?: THREE.CanvasTexture): THREE.CanvasTexture {
  const cv = (tex?.image as HTMLCanvasElement) || document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const x = cv.getContext('2d')!;
  x.clearRect(0, 0, w, h);
  draw(x);
  const t = tex || new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
/** Kugel-Textur: farbige Kugel mit weißem Kreis, Zahl und (75er) Buchstabe */
function ballTexture(n: number, kind: Kind, tex?: THREE.CanvasTexture) {
  return canvasTex(
    512,
    256,
    (x) => {
      x.fillStyle = ballColor(n, kind);
      x.fillRect(0, 0, 512, 256);
      for (const cx of [128, 384]) {
        x.fillStyle = '#fff';
        x.beginPath();
        x.ellipse(cx, 128, 74, 92, 0, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = '#141428';
        x.textAlign = 'center';
        x.font = '800 86px system-ui, sans-serif';
        x.fillText(String(n), cx, 160);
        if (kind === 75) {
          x.font = '800 30px system-ui, sans-serif';
          x.fillText(LET[Math.min(4, Math.floor((n - 1) / 15))], cx, 82);
        }
      }
    },
    tex,
  );
}

type Shot = 'wide' | 'drum' | 'host' | 'ball' | 'board';

export class Studio {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(42, 1, 0.05, 80);
  readonly host: Host;
  private kind: Kind = 75;
  private clock = new THREE.Clock();
  private balls!: THREE.InstancedMesh;
  private bp: { p: THREE.Vector3; v: THREE.Vector3; n: number; out: boolean }[] = [];
  private drumR = 0.78;
  private drumC = new THREE.Vector3(0, 1.55, 0);
  private mixing = 0.35;
  private big: THREE.Mesh;
  private bigTex: THREE.CanvasTexture;
  private rail: THREE.Mesh[] = [];
  private boardTex: THREE.CanvasTexture;
  private screenTex: THREE.CanvasTexture;
  private lights: THREE.SpotLight[] = [];
  private beams: THREE.Mesh[] = [];
  private rings: THREE.Mesh[] = [];
  private crowd!: THREE.InstancedMesh;
  private crowdBase: { x: number; y: number; z: number; ph: number }[] = [];
  private cheer = 0;
  private confetti: THREE.Points | null = null;
  private confV: Float32Array | null = null;
  private confT = 0;
  private shotName: Shot = 'wide';
  private camPos = new THREE.Vector3(0, 2.6, 9.5);
  private camLook = new THREE.Vector3(0, 1.5, 0);
  private anim: { t: number; d: number; n: number; res: () => void; t0: number } | null = null;
  private portrait = false;
  private raf = 0;
  onFrame: ((dt: number) => void) | null = null;
  quality: number;

  constructor(canvas: HTMLCanvasElement, quality: number) {
    this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: quality > 0, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality > 0 ? 1.75 : 1));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = quality > 0;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const s = this.scene;
    s.background = new THREE.Color(0x07041a);
    s.fog = new THREE.Fog(0x07041a, 14, 34);
    const pm = new THREE.PMREMGenerator(this.renderer);
    s.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    s.environmentIntensity = 0.35;
    s.add(new THREE.HemisphereLight(0x8fa0ff, 0x1a0830, 0.45));
    const key = new THREE.DirectionalLight(0xfff1e0, 1.5);
    key.position.set(-3, 7, 6);
    key.castShadow = quality > 0;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -2;
    key.shadow.bias = -0.0005;
    s.add(key);
    // ---- Boden: dunkel spiegelnd mit LED-Ringen ----
    const floor = new THREE.Mesh(new THREE.CircleGeometry(16, 96), new THREE.MeshStandardMaterial({ color: 0x0c0a22, roughness: 0.22, metalness: 0.6 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    s.add(floor);
    [1.6, 2.6, 3.8, 5.2].forEach((r, i) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.05, 128), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff2e88 : 0x34d8ff, transparent: true, opacity: 0.85 }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.005;
      s.add(ring);
      this.rings.push(ring);
    });
    // Bühne unter der Trommel
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.65, 0.28, 64), new THREE.MeshStandardMaterial({ color: 0x1a1240, roughness: 0.35, metalness: 0.5 }));
    stage.position.y = 0.14;
    stage.receiveShadow = true;
    s.add(stage);
    const stageLed = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color: 0xffc61a }));
    stageLed.rotation.x = Math.PI / 2;
    stageLed.position.y = 0.27;
    s.add(stageLed);
    // ---- LED-Wand mit Zahlentafel und großem Bildschirm ----
    this.boardTex = canvasTex(1024, 360, () => {});
    this.screenTex = canvasTex(1024, 512, () => {});
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 11, 6.5, 96, 1, true, Math.PI * 0.72, Math.PI * 0.56),
      new THREE.MeshStandardMaterial({ color: 0x120c34, roughness: 0.5, metalness: 0.3, side: THREE.BackSide, emissive: 0x0b0628, map: this.gridTex(), emissiveMap: null }),
    );
    wall.position.set(0, 3.25, 3);
    s.add(wall);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.53), new THREE.MeshBasicMaterial({ map: this.boardTex, toneMapped: false }));
    board.position.set(0, 1.9, -7.6);
    s.add(board);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.1), new THREE.MeshBasicMaterial({ map: this.screenTex, toneMapped: false }));
    screen.position.set(0, 4.75, -7.4);
    s.add(screen);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(7.5, 2.8, 0.1), new THREE.MeshStandardMaterial({ color: 0x0a0820, metalness: 0.7, roughness: 0.3 }));
    frame.position.set(0, 1.9, -7.68);
    s.add(frame);
    // ---- Kugeltrommel ----
    const glass = new THREE.Mesh(
      new THREE.SphereGeometry(this.drumR + 0.04, 64, 48),
      new THREE.MeshPhysicalMaterial({ color: 0xdff4ff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.16, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
    );
    glass.position.copy(this.drumC);
    s.add(glass);
    const ringM = new THREE.MeshStandardMaterial({ color: 0xd9dde8, metalness: 0.95, roughness: 0.18 });
    for (const rot of [0, Math.PI / 2]) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(this.drumR + 0.05, 0.022, 12, 96), ringM);
      r.position.copy(this.drumC);
      r.rotation.y = rot;
      s.add(r);
    }
    const eq = new THREE.Mesh(new THREE.TorusGeometry(this.drumR + 0.05, 0.03, 12, 96), new THREE.MeshStandardMaterial({ color: 0xffc61a, metalness: 0.8, roughness: 0.25, emissive: 0x402800 }));
    eq.position.copy(this.drumC);
    eq.rotation.x = Math.PI / 2;
    s.add(eq);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.42, 0.55, 40), ringM);
    stand.position.set(0, 0.55, 0);
    s.add(stand);
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 1.1, 32, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }),
    );
    tube.position.set(0, this.drumC.y + this.drumR + 0.5, 0);
    s.add(tube);
    const tray = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 10, 40), ringM);
    tray.position.set(0, this.drumC.y + this.drumR + 1.07, 0);
    tray.rotation.x = Math.PI / 2;
    s.add(tray);
    // Kugeln in der Trommel (instanziert)
    this.balls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, quality > 0 ? 20 : 12, quality > 0 ? 14 : 8), new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.05 }), 90);
    this.balls.castShadow = false;
    s.add(this.balls);
    // große Ziehungs-Kugel
    this.bigTex = ballTexture(1, 75);
    this.big = new THREE.Mesh(new THREE.SphereGeometry(0.075, 48, 32), new THREE.MeshStandardMaterial({ map: this.bigTex, roughness: 0.22, metalness: 0.05 }));
    this.big.visible = false;
    s.add(this.big);
    // Schiene mit den letzten Kugeln
    const railBar = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.04, 0.2), ringM);
    railBar.position.set(2.1, 1.0, 0.3);
    railBar.rotation.y = -0.35;
    s.add(railBar);
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 24), new THREE.MeshStandardMaterial({ map: ballTexture(1, 75), roughness: 0.25 }));
      m.visible = false;
      this.rail.push(m);
      s.add(m);
    }
    // ---- Moderatorpult und Moderator ----
    const desk = new THREE.Group();
    const deskBody = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 1.1, 48, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1b1450, roughness: 0.3, metalness: 0.4 }));
    deskBody.rotation.y = Math.PI / 2;
    deskBody.position.y = 0.55;
    const deskTop = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.05, 48, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x3a2f7a, roughness: 0.25, metalness: 0.7, emissive: 0x120a30 }));
    deskTop.rotation.y = Math.PI / 2;
    deskTop.position.y = 1.11;
    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.34),
      new THREE.MeshBasicMaterial({
        map: canvasTex(512, 192, (x) => {
          const g = x.createLinearGradient(0, 0, 512, 0);
          g.addColorStop(0, '#ff2e88');
          g.addColorStop(1, '#34d8ff');
          x.fillStyle = g;
          x.font = '900 92px system-ui, sans-serif';
          x.textAlign = 'center';
          x.fillText('RADIO', 256, 90);
          x.fillStyle = '#ffc61a';
          x.fillText('BINGO', 256, 180);
        }),
        transparent: true,
        toneMapped: false,
      }),
    );
    logo.position.set(0, 0.66, 0.6);
    desk.add(deskBody, deskTop, logo);
    desk.position.set(-2.55, 0, 1.3);
    desk.rotation.y = 0.35;
    s.add(desk);
    this.host = new Host('./host-cut.webp', quality);
    this.host.root.position.set(-2.7, 2.05 - HOST_H, 0.92);
    this.host.root.rotation.y = 0.32;
    s.add(this.host.root);
    // ---- Publikum (Tribünen links und rechts) ----
    const n = quality > 0 ? 64 : 36;
    this.crowd = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.17, 0.42, 4, 10), new THREE.MeshStandardMaterial({ roughness: 0.7 }), n);
    const col = new THREE.Color(),
      m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1,
        row = Math.floor(i / 2) % 4,
        k = Math.floor(i / 8);
      const a = side * (0.95 + k * 0.08),
        r = 7.2 + row * 0.9;
      const x = Math.sin(a) * r,
        z = Math.cos(a) * r * 0.55 - 1.5,
        y = 0.52 + row * 0.42;
      this.crowdBase.push({ x, y, z, ph: Math.random() * 6 });
      m4.makeTranslation(x, y, z);
      this.crowd.setMatrixAt(i, m4);
      this.crowd.setColorAt(i, col.setHSL(Math.random(), 0.55, 0.45));
    }
    s.add(this.crowd);
    for (const side of [-1, 1]) {
      for (let row = 0; row < 4; row++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.42, 0.9), new THREE.MeshStandardMaterial({ color: 0x15103a, roughness: 0.5 }));
        const a = side * 1.25,
          r = 7.2 + row * 0.9;
        step.position.set(Math.sin(a) * r, 0.21 + row * 0.42 - 0.21, Math.cos(a) * r * 0.55 - 1.5);
        step.scale.y = 1 + row * 2;
        step.position.y = (0.42 * (1 + row * 2)) / 2;
        step.rotation.y = side * -0.9;
        s.add(step);
      }
    }
    // ---- Scheinwerfer mit sichtbaren Lichtkegeln ----
    const colors = [0xff2e88, 0x34d8ff, 0xffc61a, 0xa855f7];
    for (let i = 0; i < 4; i++) {
      const sp = new THREE.SpotLight(colors[i], quality > 0 ? 30 : 18, 18, 0.32, 0.6, 1.4);
      sp.position.set(-6 + i * 4, 7.5, -2 + (i % 2) * 3);
      sp.target.position.set(0, 0, 0);
      s.add(sp, sp.target);
      this.lights.push(sp);
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(1.4, 7.5, 32, 1, true),
        new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      );
      beam.geometry.translate(0, -3.75, 0);
      beam.position.copy(sp.position);
      s.add(beam);
      this.beams.push(beam);
    }
    this.setKind(75);
    this.setTableau([], 75);
    this.setScreen('RADIO-BINGO', 'Die große Kugelshow');
    this.resize();
    addEventListener('resize', () => this.resize());
    this.loop();
  }
  private gridTex() {
    const t = canvasTex(512, 256, (x) => {
      x.fillStyle = '#0d0830';
      x.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 64; i++)
        for (let j = 0; j < 32; j++) {
          x.fillStyle = `rgba(${80 + ((i * 7) % 120)},${40 + ((j * 11) % 80)},255,${0.06 + ((i + j) % 5) * 0.03})`;
          x.fillRect(i * 8 + 1, j * 8 + 1, 6, 6);
        }
    });
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(4, 2);
    return t;
  }
  resize() {
    const c = this.renderer.domElement,
      w = c.clientWidth || innerWidth,
      h = c.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.portrait = w / h < 0.9;
    this.camera.fov = this.portrait ? 58 : 42;
    const [ir, ib] = this.inset;
    if (ir > 0 || ib > 0) this.camera.setViewOffset(w + ir, h + ib, ir, ib, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }
  setKind(kind: Kind) {
    this.kind = kind;
    this.bp = [];
    const col = new THREE.Color();
    for (let i = 0; i < 90; i++) {
      const n = i + 1,
        out = n > kind;
      const p = new THREE.Vector3((Math.random() - 0.5) * 0.9, -0.4 + Math.random() * 0.3, (Math.random() - 0.5) * 0.9);
      this.bp.push({ p, v: new THREE.Vector3(), n, out });
      this.balls.setColorAt(i, col.set(ballColor(n, kind)));
    }
    if (this.balls.instanceColor) this.balls.instanceColor.needsUpdate = true;
    this.rail.forEach((m) => (m.visible = false));
  }
  /** Kugeln für eine neue Ziehung zurück in die Trommel */
  refill() {
    this.bp.forEach((b) => (b.out = b.n > this.kind));
    this.rail.forEach((m) => (m.visible = false));
  }
  setMix(v: number) {
    this.mixing = v;
  }
  setTableau(drawn: number[], kind: Kind, last = 0) {
    const s = new Set(drawn);
    canvasTex(
      1024,
      360,
      (x) => {
        x.fillStyle = '#080522';
        x.fillRect(0, 0, 1024, 360);
        const rows = kind === 75 ? 5 : 9,
          cols = kind === 75 ? 15 : 10,
          lw = kind === 75 ? 70 : 60,
          cw = (1024 - lw - 16) / cols,
          rh = (360 - 16) / rows;
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        for (let r = 0; r < rows; r++) {
          if (kind === 75) {
            x.fillStyle = COL75[r];
            x.font = '900 46px system-ui, sans-serif';
            x.fillText(LET[r], 8 + lw / 2, 8 + rh * r + rh / 2);
          }
          for (let c = 0; c < cols; c++) {
            const n = kind === 75 ? r * 15 + c + 1 : r * 10 + c + (r === 0 ? 1 : 0) + (r === 8 && c === 9 ? 0 : 0);
            if (kind === 90 && (n < 1 || n > 90)) continue;
            const on = s.has(n),
              cx = 8 + lw + cw * c + cw / 2,
              cy = 8 + rh * r + rh / 2;
            x.fillStyle = on ? ballColor(n, kind) : 'rgba(255,255,255,.06)';
            if (on) {
              x.shadowColor = ballColor(n, kind);
              x.shadowBlur = n === last ? 26 : 12;
            }
            x.beginPath();
            x.arc(cx, cy, Math.min(cw, rh) * 0.42, 0, Math.PI * 2);
            x.fill();
            x.shadowBlur = 0;
            x.fillStyle = on ? (ballColor(n, kind) === '#e8ecf5' || ballColor(n, kind) === '#ffc61a' ? '#141428' : '#fff') : 'rgba(255,255,255,.28)';
            x.font = `800 ${Math.round(Math.min(cw, rh) * 0.4)}px system-ui, sans-serif`;
            x.fillText(String(n), cx, cy + 2);
            if (n === last) {
              x.strokeStyle = '#fff';
              x.lineWidth = 4;
              x.stroke();
            }
          }
        }
      },
      this.boardTex,
    );
  }
  setScreen(title: string, sub = '', ball = 0) {
    canvasTex(
      1024,
      512,
      (x) => {
        const g = x.createLinearGradient(0, 0, 1024, 512);
        g.addColorStop(0, '#2a0a5c');
        g.addColorStop(0.5, '#120738');
        g.addColorStop(1, '#063a5c');
        x.fillStyle = g;
        x.fillRect(0, 0, 1024, 512);
        x.textAlign = 'center';
        if (ball) {
          x.fillStyle = ballColor(ball, this.kind);
          x.beginPath();
          x.arc(512, 230, 170, 0, Math.PI * 2);
          x.fill();
          x.fillStyle = '#fff';
          x.beginPath();
          x.arc(512, 230, 112, 0, Math.PI * 2);
          x.fill();
          x.fillStyle = '#141428';
          x.font = '900 120px system-ui, sans-serif';
          x.fillText(String(ball), 512, 272);
          if (this.kind === 75) {
            x.font = '900 44px system-ui, sans-serif';
            x.fillText(LET[Math.min(4, Math.floor((ball - 1) / 15))], 512, 178);
          }
          x.fillStyle = '#fff';
          x.font = '700 40px system-ui, sans-serif';
          x.fillText(sub, 512, 475);
        } else {
          x.fillStyle = '#ffc61a';
          x.font = '900 104px system-ui, sans-serif';
          x.fillText(title, 512, 240);
          x.fillStyle = '#fff';
          x.font = '700 50px system-ui, sans-serif';
          x.fillText(sub, 512, 330);
        }
      },
      this.screenTex,
    );
  }
  private snap = false;
  /** Kameraeinstellung wechseln; cut = harter Schnitt wie im Fernsehen statt Kamerafahrt */
  shot(s: Shot, cut = false) {
    this.shotName = s;
    if (cut) this.snap = true;
  }
  /** Eine Kugel ziehen: Trommel wirbelt, Kugel steigt durchs Rohr, fliegt groß vor die Kamera und rollt auf die Schiene */
  drawBall(n: number, dur = 1.8): Promise<void> {
    const b = this.bp[n - 1];
    if (b) b.out = true;
    ballTexture(n, this.kind, this.bigTex);
    this.big.visible = true;
    this.mixing = 1;
    return new Promise((res) => {
      const a = { t: 0, d: dur, n, res, t0: performance.now() };
      this.anim = a;
      setTimeout(() => {
        if (this.anim === a) this.finishAnim();
      }, dur * 1000 + 600);
    });
  }
  private finishAnim() {
    const A = this.anim;
    if (!A) return;
    this.anim = null;
    this.big.visible = false;
    this.big.scale.setScalar(1);
    this.toRail(A.n);
    A.res();
  }
  /** Bereich, den die Karten verdecken (px rechts bzw. unten) – das Bild wird so verschoben, dass das Studio im freien Teil sitzt */
  setInset(right: number, bottom: number) {
    this.inset = [right, bottom];
    this.resize();
  }
  private inset: [number, number] = [0, 0];
  private toRail(n: number) {
    // Schiene: neueste Kugel vorn, ältere rücken auf
    for (let i = this.rail.length - 1; i > 0; i--) {
      const a = this.rail[i],
        b = this.rail[i - 1];
      a.visible = b.visible;
      (a.material as THREE.MeshStandardMaterial).map = (b.material as THREE.MeshStandardMaterial).map;
      (a.material as THREE.MeshStandardMaterial).needsUpdate = true;
      a.userData.n = b.userData.n;
    }
    const m = this.rail[0],
      mat = m.material as THREE.MeshStandardMaterial;
    mat.map = ballTexture(n, this.kind);
    mat.needsUpdate = true;
    m.visible = true;
    m.userData.n = n;
    this.rail.forEach((r, i) => {
      r.position.set(1.15 + i * 0.36 * Math.cos(-0.35), 1.18, 0.3 + 0.36 * i * Math.sin(0.35) + 0.0);
      r.position.set(1.12 + Math.cos(0.35) * i * 0.36, 1.18, 0.65 - Math.sin(0.35) * i * 0.36 + 0.0);
    });
  }
  celebrate(big = false) {
    this.cheer = big ? 5 : 3;
    this.host.act('cheer', big ? 4 : 2.6);
    const N = this.quality > 0 ? (big ? 1400 : 700) : big ? 600 : 300,
      pos = new Float32Array(N * 3),
      col = new Float32Array(N * 3),
      c = new THREE.Color();
    this.confV = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos.set([(Math.random() - 0.5) * 8, 6 + Math.random() * 3, (Math.random() - 0.5) * 6 + 1], i * 3);
      this.confV.set([(Math.random() - 0.5) * 1.5, -1 - Math.random() * 1.6, (Math.random() - 0.5) * 1.5], i * 3);
      c.setHSL(big ? 0.12 + Math.random() * 0.05 : Math.random(), 0.9, 0.6);
      col.set([c.r, c.g, c.b], i * 3);
    }
    if (this.confetti) this.scene.remove(this.confetti);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.confetti = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 1 }));
    this.confT = big ? 7 : 5;
    this.scene.add(this.confetti);
  }
  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    if (document.hidden) return;
    const dt = Math.min(0.05, this.clock.getDelta()),
      t = this.clock.elapsedTime;
    this.update(dt, t);
    if (this.onFrame) this.onFrame(dt);
    this.renderer.render(this.scene, this.camera);
  };
  private update(dt: number, t: number) {
    // Kugeln wirbeln (Schwerkraft + Luftstoß von unten, Abprallen an der Glaswand)
    const m4 = new THREE.Matrix4(),
      R = this.drumR - 0.08,
      mix = this.mixing;
    for (let i = 0; i < this.bp.length; i++) {
      const b = this.bp[i];
      if (b.out) {
        m4.makeScale(0, 0, 0);
        this.balls.setMatrixAt(i, m4);
        continue;
      }
      b.v.y -= 6 * dt;
      if (b.p.y < -0.2 && Math.random() < mix * 0.25) b.v.add(new THREE.Vector3((Math.random() - 0.5) * 3, 3 + Math.random() * 5 * mix, (Math.random() - 0.5) * 3));
      b.v.multiplyScalar(1 - 0.6 * dt);
      b.p.addScaledVector(b.v, dt);
      const l = b.p.length();
      if (l > R) {
        const nrm = b.p.clone().divideScalar(l);
        b.p.copy(nrm).multiplyScalar(R);
        const vn = b.v.dot(nrm);
        if (vn > 0) b.v.addScaledVector(nrm, -1.6 * vn);
      }
      m4.makeTranslation(this.drumC.x + b.p.x, this.drumC.y + b.p.y, this.drumC.z + b.p.z);
      this.balls.setMatrixAt(i, m4);
    }
    this.balls.instanceMatrix.needsUpdate = true;
    this.mixing += (0.35 - this.mixing) * dt * 0.6;
    // Ziehungs-Animation
    const A = this.anim;
    if (A) {
      A.t = (performance.now() - A.t0) / 1000;
      const k = A.t / A.d,
        top = new THREE.Vector3(0, this.drumC.y + this.drumR + 1.07, 0),
        cam = this.camera.position.clone().lerp(this.camLook, 0.82);
      if (k < 0.35) this.big.position.lerpVectors(this.drumC.clone().add(new THREE.Vector3(0, this.drumR - 0.1, 0)), top, k / 0.35);
      else if (k < 0.75) {
        const q = (k - 0.35) / 0.4,
          e = q * q * (3 - 2 * q);
        this.big.position.lerpVectors(top, cam, e);
        this.big.scale.setScalar(1 + e * 1.4);
      } else this.big.position.copy(cam);
      this.big.rotation.y = -Math.PI / 2 + Math.sin(A.t * 2) * 0.15;
      this.big.lookAt(this.camera.position);
      this.big.rotateY(-Math.PI / 2);
      if (A.t >= A.d) this.finishAnim();
    }
    // Scheinwerfer schwenken, LED-Ringe pulsieren
    this.lights.forEach((l, i) => {
      l.target.position.set(Math.sin(t * 0.4 + i * 1.7) * 4, 0, Math.cos(t * 0.33 + i) * 3);
      const b = this.beams[i];
      b.lookAt(l.target.position);
      b.rotateX(-Math.PI / 2);
    });
    this.rings.forEach((r, i) => ((r.material as THREE.MeshBasicMaterial).opacity = 0.45 + 0.4 * Math.sin(t * 2 + i + (this.cheer > 0 ? t * 6 : 0)) ** 2));
    // Publikum wippt, jubelt bei Bingo
    this.cheer = Math.max(0, this.cheer - dt);
    const cm = new THREE.Matrix4();
    this.crowdBase.forEach((c, i) => {
      const hop = this.cheer > 0 ? Math.abs(Math.sin(t * 9 + c.ph)) * 0.25 : Math.sin(t * 1.5 + c.ph) * 0.02;
      cm.makeTranslation(c.x, c.y + hop, c.z);
      this.crowd.setMatrixAt(i, cm);
    });
    this.crowd.instanceMatrix.needsUpdate = true;
    // Konfetti
    if (this.confetti && this.confV) {
      this.confT -= dt;
      const p = this.confetti.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        p.setXYZ(i, p.getX(i) + this.confV[i * 3] * dt + Math.sin(t * 3 + i) * 0.01, Math.max(0.02, p.getY(i) + this.confV[i * 3 + 1] * dt), p.getZ(i) + this.confV[i * 3 + 2] * dt);
      }
      p.needsUpdate = true;
      (this.confetti.material as THREE.PointsMaterial).opacity = Math.min(1, this.confT);
      if (this.confT <= 0) {
        this.scene.remove(this.confetti);
        this.confetti.geometry.dispose();
        this.confetti = null;
      }
    }
    // Moderator schaut zur Kamera
    this.host.update(dt);
    // Kameraregie
    const P = this.portrait;
    const shots: Record<Shot, [THREE.Vector3, THREE.Vector3]> = {
      wide: [new THREE.Vector3(Math.sin(t * 0.08) * 1.2, P ? 3.4 : 2.7, P ? 11.5 : 9.2), new THREE.Vector3(-0.4, 1.6, -1)],
      drum: [new THREE.Vector3(1.1, 2.5, P ? 6.2 : 5.0), new THREE.Vector3(0, 1.75, 0)],
      host: [new THREE.Vector3(-2.3, 1.78, P ? 3.3 : 2.75), new THREE.Vector3(-2.66, 1.66, 0.95)],
      ball: [new THREE.Vector3(0.3, 2.7, P ? 6.0 : 4.9), new THREE.Vector3(0, 2.25, 0)],
      board: [new THREE.Vector3(0, 2.6, 2.5), new THREE.Vector3(0, 2.4, -7.6)],
    };
    const [cp, cl] = shots[this.shotName];
    const k = this.snap ? 1 : Math.min(1, dt * 1.6);
    this.snap = false;
    this.camPos.lerp(cp, k);
    this.camLook.lerp(cl, k);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
    const hp = new THREE.Vector3();
    this.host.root.getWorldPosition(hp);
    const want = Math.atan2(this.camera.position.x - hp.x, this.camera.position.z - hp.z) - this.host.root.rotation.y;
    this.host.look = Math.max(-1.1, Math.min(1.1, want));
  }
  dispose() {
    cancelAnimationFrame(this.raf);
  }
}
