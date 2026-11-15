// Kinderbahn: eigener, einfacher Spielmodus für Kinder mit Spielzeug-3D-Modellen (Kenney Train/City/Nature Kit, CC0).
// Eine Rundstrecke mit drei Tier-Bahnhöfen: anhalten, Fahrgäste einsteigen lassen, am Ziel aussteigen lassen, Sterne sammeln.
// Bedienung für alle Geräte gleich: große Knöpfe (Touch), Tastatur (Leertaste/W/S/H/C) und Gamepad (A/RT/LT/X/Y/B).
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { h, btn, clear, dialog } from '../ui/dom';
import type { AudioEngine } from '../audio/audio';

export interface KidsTrain { id: string; name: string; icon: string; cars: string[] }
export const KIDS_TRAINS: KidsTrain[] = [
  { id: 'steam', name: 'Dampfzug', icon: '🚂', cars: ['train-locomotive-a', 'train-carriage-box', 'train-carriage-wood'] },
  { id: 'fast', name: 'Schnellzug', icon: '🚄', cars: ['train-electric-bullet-a', 'train-electric-bullet-b', 'train-electric-bullet-b'] },
  { id: 'tram', name: 'Straßenbahn', icon: '🚋', cars: ['train-tram-classic'] },
  { id: 'cargo', name: 'Güterzug', icon: '🚛', cars: ['train-diesel-a', 'train-carriage-coal', 'train-carriage-container-red', 'train-carriage-tank'] },
  { id: 'local', name: 'Personenzug', icon: '🚃', cars: ['train-locomotive-passenger-a', 'train-carriage-box', 'train-carriage-box'] },
];

interface Station { name: string; icon: string; color: string; s: number; waiting: Rider[]; group: THREE.Group; refill: number }
interface Rider { emoji: string; dest: number; sprite?: THREE.Sprite }

const BASE = './assets/kids/';
const ANIMALS = ['🐻', '🦊', '🐰', '🐼', '🐸', '🐯', '🐨', '🐷', '🐵', '🦁'];
const VMAX = 9, ACC = 3.2, DEC = 4.5, GAP = 2.75;

/** Spielzeug-Rundstrecke (geschlossen) als Kurve in der XZ-Ebene */
export function kidsCurve() {
  const pts = [[0, -34], [26, -30], [40, -10], [34, 14], [14, 24], [0, 14], [-14, 26], [-36, 18], [-42, -6], [-26, -28]]
    .map(([x, z]) => new THREE.Vector3(x, 0, z));
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
}

export class KidsGame {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private cam = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
  private curve = kidsCurve();
  private len: number;
  private cars: THREE.Object3D[] = [];
  private stations: Station[] = [];
  private riders: Rider[] = [];
  private s = 6; private v = 0; private go = false; private stars = 0;
  private camMode = 0; private camPos = new THREE.Vector3(); private camInit = false;
  private raf = 0; private last = 0; private disposed = false; private paused = false;
  private stopped: number | null = null; private boardT = 0;
  private hud!: { stars: HTMLElement; riders: HTMLElement; goBtn: HTMLButtonElement; msg: HTMLElement };
  private root: HTMLElement;
  private gpPrev: boolean[] = [];
  private msgT = 0;
  private hinted = -1;

  constructor(private canvas: HTMLCanvasElement, private host: HTMLElement, private audio: AudioEngine, private train: KidsTrain, private onExit: () => void) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.1;
    this.len = this.curve.getLength();
    this.root = h('div', { class: 'kids' });
    host.appendChild(this.root);
  }

  /** Modelle laden und Welt aufbauen; meldet Fortschritt 0..1 */
  async load(prog: (f: number) => void) {
    const loader = new GLTFLoader();
    const names = [...new Set([...this.train.cars, 'track'])].map((n) => `train/${n}.glb`)
      .concat(['nature/tree_oak.glb', 'nature/tree_pineDefaultA.glb', 'nature/tree_default.glb', 'nature/flower_redA.glb', 'nature/rock_largeA.glb', 'nature/plant_bush.glb', 'city/building-type-a.glb', 'city/building-type-c.glb', 'city/building-type-f.glb']);
    const models = new Map<string, GLTF>();
    let done = 0;
    await Promise.all(names.map(async (n) => {
      const g = await loader.loadAsync(BASE + n);
      // Spielzeug-Look ohne Umgebungs-Spiegelung: nicht metallisch, matt (sonst wirken Modelle schwarz)
      g.scene.traverse((o) => { const me = o as THREE.Mesh; const mm = me.material as THREE.MeshStandardMaterial | undefined; if (mm && 'metalness' in mm) { mm.metalness = 0; mm.roughness = Math.max(0.7, mm.roughness ?? 1); } });
      models.set(n, g); prog(++done / names.length);
    }));
    this.build(models);
  }

  private build(m: Map<string, GLTF>) {
    const sc = this.scene;
    sc.background = new THREE.Color(0x9fd6ff);
    sc.fog = new THREE.Fog(0x9fd6ff, 90, 220);
    sc.add(new THREE.HemisphereLight(0xdff2ff, 0x6f9a4a, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(40, 80, 30); sc.add(sun);
    // Wiese mit sanften Farbflecken
    const ground = new THREE.Mesh(new THREE.CircleGeometry(220, 48), new THREE.MeshLambertMaterial({ color: 0x7cc64e }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; sc.add(ground);
    // Gleis: Gleisstücke (1 Einheit) entlang der Kurve, instanziert
    const N = Math.ceil(this.len / 0.98), mats: THREE.Matrix4[] = [];
    for (let i = 0; i < N; i++) mats.push(this.frame(i * this.len / N));
    instanced(sc, m.get('train/track.glb')!, mats);
    // Bahnhöfe
    const defs = [{ name: 'Bärenhausen', icon: '🐻', color: '#e0703a' }, { name: 'Fuchsdorf', icon: '🦊', color: '#f2a900' }, { name: 'Hasenwiese', icon: '🐰', color: '#3c8de0' }];
    defs.forEach((d, i) => {
      const s = (this.len * (i + 0.15)) / defs.length;
      const g = new THREE.Group(); g.matrixAutoUpdate = false;
      const f = this.frame(s); g.matrix.copy(f); sc.add(g);
      const plat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 9), new THREE.MeshLambertMaterial({ color: 0xd9d4c7 }));
      plat.position.set(1.9, 0.17, 0); g.add(plat);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.36, 9), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      edge.position.set(0.75, 0.18, 0); g.add(edge);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 5), new THREE.MeshLambertMaterial({ color: new THREE.Color(d.color) }));
      roof.position.set(2.1, 2.6, 0); g.add(roof);
      for (const z of [-2, 2]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), new THREE.MeshLambertMaterial({ color: 0x555555 })); p.position.set(2.9, 1.4, z); g.add(p); }
      const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex(`${d.icon} ${d.name}`, d.color), depthWrite: false }));
      sign.scale.set(5, 1.25, 1); sign.position.set(2.2, 3.6, 0); g.add(sign);
      const st: Station = { ...d, s, waiting: [], group: g, refill: 0 };
      this.stations.push(st);
      // Haus neben dem Bahnhof
      const house = m.get(`city/building-type-${'acf'[i]}.glb`)!.scene.clone();
      house.scale.setScalar(2.2); house.position.set(7, 0, 0); house.rotation.y = -Math.PI / 2; g.add(house);
    });
    for (let i = 0; i < this.stations.length; i++) this.refill(i, 3);
    // Bäume, Büsche, Blumen, Steine – nicht auf dem Gleis oder den Bahnhöfen
    const deco = ['nature/tree_oak.glb', 'nature/tree_pineDefaultA.glb', 'nature/tree_default.glb', 'nature/flower_redA.glb', 'nature/rock_largeA.glb', 'nature/plant_bush.glb'];
    const rnd = rng(7), pts = this.curve.getSpacedPoints(200);
    deco.forEach((d, k) => {
      const list: THREE.Matrix4[] = [];
      const count = k < 3 ? 45 : 35;
      for (let tries = 0; list.length < count && tries < count * 20; tries++) {
        const r = 8 + rnd() * 90, a = rnd() * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r;
        if (pts.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < (k < 3 ? 36 : 12))) continue;
        if (this.stations.some((st) => { const q = new THREE.Vector3().setFromMatrixPosition(st.group.matrix); return (q.x - x) ** 2 + (q.z - z) ** 2 < 140; })) continue;
        const sc2 = (k < 3 ? 2.6 : k === 4 ? 1.6 : 2.2) * (0.8 + rnd() * 0.5);
        list.push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6.3), new THREE.Vector3(sc2, sc2, sc2)));
      }
      instanced(sc, m.get(d)!, list);
    });
    // Zug
    for (const c of this.train.cars) {
      const o = m.get(`train/${c}.glb`)!.scene.clone();
      const wrap = new THREE.Group(); wrap.add(o); o.position.y = 0.36 + 0.12; // Räder auf die Schienen
      sc.add(wrap); this.cars.push(wrap);
    }
  }

  /** Lage auf der Strecke: Position + Ausrichtung (Fahrtrichtung = +z wie die Modelle) */
  private frame(s: number, y = 0) {
    const u = (((s % this.len) + this.len) % this.len) / this.len;
    const p = this.curve.getPointAt(u), t = this.curve.getTangentAt(u);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), t.setY(0).normalize());
    return new THREE.Matrix4().compose(p.setY(y), q, new THREE.Vector3(1, 1, 1));
  }

  private refill(i: number, n: number) {
    const st = this.stations[i];
    while (st.waiting.length < n) {
      let dest = Math.floor(Math.random() * this.stations.length); if (dest === i) dest = (i + 1) % this.stations.length;
      const emoji = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
      const r: Rider = { emoji, dest };
      r.sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex(emoji, this.stations[dest].color), depthWrite: false }));
      r.sprite.scale.set(1.3, 1.3, 1);
      st.group.add(r.sprite);
      st.waiting.push(r);
    }
    st.waiting.forEach((r, k) => r.sprite!.position.set(1.9, 1.05, -3 + k * 1.5));
  }

  start() {
    this.ui();
    addEventListener('resize', this.resize); addEventListener('keydown', this.kd);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
    this.say('Drück ▶ zum Losfahren!');
  }

  private ui() {
    const goBtn = btn('▶', () => this.toggle(), 'kbtn go', { 'aria-label': 'Losfahren oder anhalten' }) as HTMLButtonElement;
    const msg = h('div', { class: 'kmsg', 'aria-live': 'polite' });
    this.hud = { stars: h('div', { class: 'kstars' }, '⭐ 0'), riders: h('div', { class: 'kriders' }), goBtn, msg };
    clear(this.root);
    this.root.append(
      h('div', { class: 'ktop' }, btn('🏠', () => void this.menu(), 'kbtn small', { 'aria-label': 'Menü' }), this.hud.stars, this.hud.riders),
      msg,
      h('div', { class: 'kbot' },
        btn('📯', () => this.horn(), 'kbtn', { 'aria-label': 'Hupen' }),
        goBtn,
        btn('🎥', () => this.nextCam(), 'kbtn', { 'aria-label': 'Kamera wechseln' })));
  }

  private toggle() { this.go = !this.go; this.audio.play('ui_click'); this.hud.goBtn.textContent = this.go ? '⏸' : '▶'; this.hud.goBtn.classList.toggle('on', this.go); if (this.go) this.stopped = null; }
  private horn() { this.audio.play(this.train.id === 'steam' ? 'whistle_start' : 'horn_start'); setTimeout(() => this.audio.play(this.train.id === 'steam' ? 'whistle_stop' : 'horn_stop'), 500); }
  private nextCam() { this.camMode = (this.camMode + 1) % 3; this.camInit = false; this.audio.play('ui_click'); }
  private say(t: string) { this.hud.msg.textContent = t; this.hud.msg.classList.add('on'); this.msgT = 3.5; }

  private async menu() {
    this.paused = true;
    const i = await dialog('Pause', 'Du hast ' + this.stars + ' ⭐ gesammelt.', ['▶ Weiterspielen', '🏠 Zurück zum Menü']);
    if (i === 1) { this.dispose(); this.onExit(); return; }
    this.paused = false; this.last = performance.now();
  }

  private kd = (e: KeyboardEvent) => {
    if (document.querySelector('.overlay')) return;
    const k = e.code;
    if (k === 'Space' || k === 'Enter') { e.preventDefault(); this.toggle(); }
    else if (k === 'KeyW' || k === 'ArrowUp') { if (!this.go) this.toggle(); }
    else if (k === 'KeyS' || k === 'ArrowDown') { if (this.go) this.toggle(); }
    else if (k === 'KeyH') this.horn();
    else if (k === 'KeyC') this.nextCam();
    else if (k === 'Escape') void this.menu();
  };

  private pad() {
    const gp = [...(navigator.getGamepads?.() ?? [])].find((p) => p && p.connected);
    if (!gp || document.querySelector('.overlay')) return;
    const e = (i: number) => { const p = !!gp.buttons[i]?.pressed, r = p && !this.gpPrev[i]; this.gpPrev[i] = p; return r; };
    const rt = (gp.buttons[7]?.value ?? 0) > 0.5, lt = (gp.buttons[6]?.value ?? 0) > 0.5;
    if (e(0)) this.toggle();
    if (rt && !this.go) this.toggle();
    if (lt && this.go) this.toggle();
    if (e(2)) this.horn();
    if (e(3)) this.nextCam();
    if (e(1) || e(9)) void this.menu();
  }

  private resize = () => {
    const w = innerWidth, hh = innerHeight;
    this.renderer.setSize(w, hh, false); this.cam.aspect = w / hh;
    this.cam.fov = w < hh ? 70 : 55; this.cam.updateProjectionMatrix();
  };

  private loop = (now: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    this.pad();
    if (!this.paused) this.step(dt);
    this.place(dt);
    this.renderer.render(this.scene, this.cam);
  };

  private step(dt: number) {
    const target = this.go ? VMAX : 0;
    const mid0 = this.s - (this.cars.length - 1) * GAP / 2;
    // nächster Bahnhof vor dem Zug: Hinweis und sanftes Halten genau am Bahnsteig
    let ahead = Infinity, ai = -1;
    this.stations.forEach((st, i) => { const d = wrap(st.s - mid0, this.len); if (d > 0.3 && d < ahead) { ahead = d; ai = i; } });
    if (this.go && ai >= 0 && ahead < 22 && this.hinted !== ai) { this.hinted = ai; this.say(`Gleich kommt ${this.stations[ai].icon} ${this.stations[ai].name} – drück ⏸ zum Anhalten!`); }
    if (!this.go && ahead < 16 && this.v > 0) {
      // Halt-Hilfe: rollt genau bis zum Bahnsteig (Kinder müssen nicht punktgenau bremsen)
      const vt = Math.max(0.8, Math.sqrt(2 * 2.5 * ahead));
      this.v = this.v < vt ? Math.min(vt, this.v + ACC * dt) : Math.max(vt, this.v - DEC * 1.6 * dt);
      if (ahead < 0.45) this.v = 0;
    } else this.v = this.v < target ? Math.min(target, this.v + ACC * dt) : Math.max(target, this.v - DEC * dt);
    this.s = (this.s + this.v * dt) % this.len;
    if (this.msgT > 0 && (this.msgT -= dt) <= 0) this.hud.msg.classList.remove('on');
    // Haltepunkt: Zugmitte am Bahnsteig
    const mid = this.s - (this.cars.length - 1) * GAP / 2;
    const at = this.stations.findIndex((st) => Math.abs(wrap(mid - st.s, this.len)) < 4.5);
    if (this.v === 0 && at >= 0 && this.stopped !== at) { this.stopped = at; this.boardT = 0; this.arrive(at); }
    if (this.stopped !== null && this.v === 0) {
      this.boardT += dt;
      const st = this.stations[this.stopped];
      if (this.boardT > 0.6 && st.waiting.length && this.riders.length < 6) {
        this.boardT = 0;
        const r = st.waiting.shift()!; r.sprite?.removeFromParent(); disposeSprite(r.sprite);
        this.riders.push(r); this.audio.play('door_beep'); this.drawRiders();
        if (!st.waiting.length || this.riders.length >= 6) this.say('Alle eingestiegen – weiter geht\'s! ▶');
      }
    }
    // Bahnhöfe füllen sich wieder
    this.stations.forEach((st, i) => { if (st.waiting.length < 3 && this.stopped !== i && (st.refill += dt) > 6) { st.refill = 0; this.refill(i, st.waiting.length + 1); } });
  }

  private arrive(i: number) {
    const st = this.stations[i];
    const out = this.riders.filter((r) => r.dest === i);
    this.riders = this.riders.filter((r) => r.dest !== i);
    this.audio.play('chime');
    if (out.length) {
      this.stars += out.length; this.audio.play('ui_ok');
      this.hud.stars.textContent = `⭐ ${this.stars}`;
      this.hud.stars.classList.remove('pop'); void this.hud.stars.offsetWidth; this.hud.stars.classList.add('pop');
      this.say(`${st.icon} ${st.name}: ${out.map((r) => r.emoji).join(' ')} ${out.length === 1 ? 'ist' : 'sind'} angekommen! +${out.length} ⭐`);
    } else this.say(`${st.icon} ${st.name}`);
    this.drawRiders();
  }

  private drawRiders() {
    clear(this.hud.riders);
    for (const r of this.riders) this.hud.riders.appendChild(h('span', { style: `border-color:${this.stations[r.dest].color}`, title: `nach ${this.stations[r.dest].name}` }, r.emoji));
  }

  private place(dt: number) {
    this.cars.forEach((c, i) => {
      const s = this.s - i * GAP;
      const f = this.frame(s);
      c.matrixAutoUpdate = false; c.matrix.copy(f); c.matrixWorldNeedsUpdate = true;
    });
    // Kamera
    const lead = new THREE.Vector3().setFromMatrixPosition(this.frame(this.s));
    const ahead = new THREE.Vector3().setFromMatrixPosition(this.frame(this.s + 8));
    const back = new THREE.Vector3().setFromMatrixPosition(this.frame(this.s - this.cars.length * GAP - 7));
    let want: THREE.Vector3, look: THREE.Vector3;
    if (this.camMode === 0) { want = back.clone().add(new THREE.Vector3(0, 6.5, 0)); look = ahead.setY(0.5); }
    else if (this.camMode === 1) { want = lead.clone().add(new THREE.Vector3(0, 32, 18)); look = lead.clone(); }
    else { const side = new THREE.Vector3().subVectors(ahead, back).normalize().cross(new THREE.Vector3(0, 1, 0)).multiplyScalar(-11); want = lead.clone().add(side).add(new THREE.Vector3(0, 2.5, 0)); look = lead.clone().setY(1); }
    if (!this.camInit) { this.camPos.copy(want); this.camInit = true; }
    this.camPos.lerp(want, Math.min(1, dt * 3));
    this.cam.position.copy(this.camPos); this.cam.lookAt(look);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    removeEventListener('resize', this.resize); removeEventListener('keydown', this.kd);
    this.scene.traverse((o) => {
      const me = o as THREE.Mesh;
      if (me.geometry) me.geometry.dispose();
      const mat = me.material as THREE.Material | THREE.Material[] | undefined;
      for (const x of Array.isArray(mat) ? mat : mat ? [mat] : []) { (x as THREE.MeshStandardMaterial).map?.dispose(); x.dispose(); }
    });
    this.renderer.dispose();
    this.root.remove();
  }
}

const wrap = (d: number, L: number) => ((d % L) + L * 1.5) % L - L / 2;
function rng(seed: number) { let a = seed >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
function disposeSprite(s?: THREE.Sprite) { if (!s) return; s.material.map?.dispose(); s.material.dispose(); }

/** Alle Meshes eines Modells als InstancedMesh an den gegebenen Stellen */
function instanced(sc: THREE.Scene, g: GLTF, mats: THREE.Matrix4[]) {
  if (!mats.length) return;
  g.scene.updateMatrixWorld(true);
  g.scene.traverse((o) => {
    const me = o as THREE.Mesh; if (!me.isMesh) return;
    const im = new THREE.InstancedMesh(me.geometry, me.material, mats.length);
    const tmp = new THREE.Matrix4();
    mats.forEach((m, i) => im.setMatrixAt(i, tmp.multiplyMatrices(m, me.matrixWorld)));
    im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere();
    sc.add(im);
  });
}

function canvasTex(w: number, hh: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas'); c.width = w; c.height = hh;
  const g = c.getContext('2d')!; draw(g);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function labelTex(text: string, color: string) {
  return canvasTex(512, 128, (g) => {
    g.fillStyle = color; roundRect(g, 4, 4, 504, 120, 28); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 60px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 68);
  });
}
function emojiTex(e: string, color: string) {
  return canvasTex(128, 128, (g) => {
    g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 58, 0, Math.PI * 2); g.fill();
    g.lineWidth = 10; g.strokeStyle = color; g.stroke();
    g.font = '70px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 64, 70);
  });
}
function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, hh: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

export const KIDS_CSS = `
.kids{position:fixed;inset:0;pointer-events:none;font-size:calc(18px*var(--fs))}
.kids .ktop{position:absolute;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.kids .kstars{pointer-events:auto;background:#fff;color:#333;border-radius:999px;padding:8px 16px;font-weight:900;font-size:1.3em;box-shadow:0 4px 12px #0003}
.kids .kstars.pop{animation:kpop .45s ease-out}
@keyframes kpop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
.kids .kriders{display:flex;gap:6px;flex-wrap:wrap}
.kids .kriders span{background:#fff;border:4px solid #999;border-radius:50%;width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;font-size:1.4em}
.kids .kmsg{position:absolute;left:50%;top:22%;transform:translateX(-50%);background:rgba(255,255,255,.95);color:#333;font-weight:800;padding:12px 20px;border-radius:20px;box-shadow:0 6px 18px #0003;max-width:88vw;text-align:center;opacity:0;transition:opacity .3s}
.kids .kmsg.on{opacity:1}
.kids .kbot{position:absolute;left:0;right:0;bottom:max(14px,env(safe-area-inset-bottom));display:flex;gap:18px;justify-content:center;align-items:flex-end}
.kids .kbtn{pointer-events:auto;width:76px;height:76px;border-radius:50%;border:4px solid #fff;background:#3c8de0;color:#fff;font-size:2em;box-shadow:0 6px 16px #0004;cursor:pointer;touch-action:manipulation}
.kids .kbtn.go{width:110px;height:110px;font-size:2.8em;background:#3ccf6e}
.kids .kbtn.go.on{background:#f2a900}
.kids .kbtn.small{width:56px;height:56px;font-size:1.5em;background:#fff;color:#333}
.kids .kbtn:focus-visible{outline:4px solid #f2a900;outline-offset:3px}
.ktiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.ktiles .btn{min-height:120px;font-size:1.2em;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border-radius:22px}
.ktiles .btn span{font-size:2.6em}
`;
