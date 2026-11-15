import * as THREE from 'three';
import type { Screen } from '../render/engine';
import { createCarPreview, type ActorLook } from '../render/actors';
import { disposeTree } from '../render/materials';

/** Weiche radiale Verlaufs-Textur (eigene Instanz, wird mit der Szene entsorgt) */
function radialTex(stops: Array<[number, string]>): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  if (g) {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [o, col] of stops) gr.addColorStop(o, col);
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Senkrechter Lichtstreifen (oben/unten ausgeblendet) */
function stripTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 128;
  const g = c.getContext('2d');
  if (g) {
    const gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(0.35, 'rgba(255,255,255,0.9)');
    gr.addColorStop(0.7, 'rgba(255,255,255,0.6)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 128);
  }
  return new THREE.CanvasTexture(c);
}

/**
 * Schaukasten im Studio-Stil: das eigene Auto auf einer sechseckigen Drehbühne mit Goldkante,
 * weiche Lichtsäulen im Hintergrund und schwebende Lichtpartikel – Hintergrund für Menü und Garage.
 */
export class Showroom implements Screen {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 200);
  private preview: { object: THREE.Group; update(dt: number): void; dispose(): void } | null = null;
  private stage = new THREE.Group();
  private holder = new THREE.Group();
  private t = 0;
  private shift = 0;
  private curShift = 0;
  private edge: THREE.MeshBasicMaterial;
  private sweep: THREE.Mesh;
  private pillars: Array<{ m: THREE.Mesh; mat: THREE.MeshBasicMaterial; base: number; ph: number }> = [];
  private dust: THREE.Points;
  private dustPos: Float32Array;

  constructor(
    look: ActorLook,
    team: 0 | 1,
    private readonly calm: boolean,
  ) {
    const bg = 0x06060d;
    this.scene.background = new THREE.Color(bg);
    this.scene.fog = new THREE.Fog(bg, 9, 30);
    this.scene.add(new THREE.HemisphereLight(0xb9c4ff, 0x140a1e, 1.0));
    const key = new THREE.DirectionalLight(0xfff4e0, 2.0);
    key.position.set(3, 7, 6);
    const rim = new THREE.DirectionalLight(0xa24dff, 1.6);
    rim.position.set(-6, 3, -5);
    const rim2 = new THREE.DirectionalLight(0xffc23d, 0.9);
    rim2.position.set(6, 2.5, -3);
    this.scene.add(key, rim, rim2);

    // Boden: matt, damit keine Lichtstreifen entstehen; weicher Lichtfleck unter der Bühne
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(60, 48),
      new THREE.MeshStandardMaterial({ color: 0x0a0a16, metalness: 0.1, roughness: 0.85 }),
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    // Hintergrund-Schein (Gold unten, Violett außen)
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 30),
      new THREE.MeshBasicMaterial({
        map: radialTex([
          [0, 'rgba(255,194,61,0.30)'],
          [0.35, 'rgba(162,77,255,0.18)'],
          [1, 'rgba(6,6,13,0)'],
        ]),
        transparent: true,
        depthWrite: false,
        fog: false,
      }),
    );
    back.position.set(0, 5, -18);
    this.stage.add(back);

    // Lichtsäulen im Halbkreis hinter der Bühne
    const strip = stripTex();
    const pg = new THREE.PlaneGeometry(0.22, 9);
    for (let i = 0; i < 9; i++) {
      const a = -1.1 + (i / 8) * 2.2;
      const col = i % 3 === 1 ? 0xffc23d : 0x8a5cff;
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        map: strip,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const m = new THREE.Mesh(pg, mat);
      m.position.set(Math.sin(a) * 13, 4.5, -Math.cos(a) * 13);
      m.lookAt(0, 4.5, 0);
      this.stage.add(m);
      this.pillars.push({ m, mat, base: 0.35 + (i % 2) * 0.15, ph: i * 0.9 });
    }

    // Drehbühne: Sechseck mit Goldkante und Lichtfleck
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.MeshBasicMaterial({
        map: radialTex([
          [0, 'rgba(255,194,61,0.55)'],
          [0.45, 'rgba(162,77,255,0.18)'],
          [1, 'rgba(0,0,0,0)'],
        ]),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.01;
    this.stage.add(glow);
    const plat = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.25, 0.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x15152a, metalness: 0.55, roughness: 0.4 }),
    );
    plat.position.y = 0.1;
    plat.rotation.y = Math.PI / 6;
    this.edge = new THREE.MeshBasicMaterial({ color: 0xffc23d, toneMapped: false });
    const rim3 = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.03, 6, 6), this.edge);
    rim3.rotation.x = Math.PI / 2;
    rim3.rotation.z = Math.PI / 6;
    rim3.position.y = 0.205;
    const inner = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.012, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x8a5cff, transparent: true, opacity: 0.8 }),
    );
    inner.rotation.x = Math.PI / 2;
    inner.rotation.z = Math.PI / 6;
    inner.position.y = 0.206;
    // Lichtkante, die über die Bühne wandert
    this.sweep = new THREE.Mesh(
      new THREE.RingGeometry(1.74, 2.08, 6, 1, 0, Math.PI / 3),
      new THREE.MeshBasicMaterial({
        color: 0xffc23d,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    this.sweep.rotation.x = -Math.PI / 2;
    this.sweep.position.y = 0.207;
    for (const o of [plat, rim3, inner, this.sweep, glow]) o.scale.multiplyScalar(0.82);
    this.stage.add(plat, rim3, inner, this.sweep);
    this.holder.position.y = 0.2;
    this.stage.add(this.holder);

    // Schwebende Lichtpartikel
    const n = calm ? 0 : 140;
    this.dustPos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      this.dustPos[i * 3] = (Math.random() - 0.5) * 18;
      this.dustPos[i * 3 + 1] = Math.random() * 7;
      this.dustPos[i * 3 + 2] = -Math.random() * 12 + 2;
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(this.dustPos, 3));
    this.dust = new THREE.Points(
      dg,
      new THREE.PointsMaterial({
        color: 0xffd98a,
        size: 0.05,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.stage.add(this.dust);

    this.scene.add(this.stage);
    this.setLook(look, team);
  }

  /** Verschiebt die Bühne im Bild nach rechts/links (Platz für das Menü) */
  setShift(x: number): void {
    if (this.t === 0) this.curShift = x;
    this.shift = x;
  }

  setLook(look: ActorLook, team: 0 | 1): void {
    this.preview?.dispose();
    this.holder.clear();
    this.preview = createCarPreview(look, team);
    this.holder.add(this.preview.object);
  }

  update(dt: number): void {
    this.t += dt;
    const t = this.t;
    this.preview?.update(dt);
    // Bühne gleitet weich an ihren Platz
    this.curShift += (this.shift - this.curShift) * Math.min(1, dt * 6);
    this.stage.position.x = this.curShift;
    if (!this.calm) {
      this.holder.rotation.y += dt * 0.35;
      this.sweep.rotation.z = -t * 1.2;
      this.edge.color.setHSL(0.11, 1, 0.58 + Math.sin(t * 2) * 0.06);
      for (const p of this.pillars) p.mat.opacity = p.base + Math.sin(t * 0.8 + p.ph) * 0.15;
      const a = this.dustPos;
      for (let i = 1; i < a.length; i += 3) {
        a[i] = (a[i] as number) + dt * 0.25;
        if ((a[i] as number) > 7) a[i] = 0;
      }
      (this.dust.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    }
    // Kamera: leichtes Schweben, Blick auf die Bühne
    const sway = this.calm ? 0 : Math.sin(t * 0.25) * 0.35;
    this.camera.position.set(sway, 2.1 + (this.calm ? 0 : Math.sin(t * 0.2) * 0.1), 7.3);
    // Hochformat: Bühne ins obere Bilddrittel, unten liegen die Kacheln
    this.camera.lookAt(this.curShift * 0.32, this.camera.aspect < 1 ? -1.4 : 0.8, 0);
  }

  dispose(): void {
    this.preview?.dispose();
    disposeTree(this.scene);
  }
}
