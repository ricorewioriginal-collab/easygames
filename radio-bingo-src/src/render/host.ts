/**
 * Moderator Rico – echtes, freigestelltes Foto als Figur im 3D-Studio (statt einer nachgebauten Puppe):
 * leicht gewölbte Fläche (Kopf und Oberkörper treten plastisch hervor), dreht sich immer zur Kamera, atmet und wippt,
 * beim Sprechen bewegt sich der Unterkiefer (Verformung im Bart-/Kinnbereich), Gesten durch Neigen, Hüpfen und Jubeln.
 * Studiolicht färbt die Figur leicht ein, ein weicher Schatten verbindet sie mit dem Studio.
 */
import * as THREE from 'three';

// Freisteller 680 × 802 px; Mund und Kinn in Bildkoordinaten (u, v von unten, 0–1)
const IMG = { w: 680, h: 802, mouth: [0.49, 0.5], jaw: [0.43, 0.42] };
export const HOST_H = 1.0; // Höhe der Figur in Metern (Bild zeigt Kopf bis Brust)
type Gesture = 'idle' | 'point' | 'cheer' | 'wave' | 'present';

export class Host {
  readonly root = new THREE.Group();
  private card: THREE.Mesh;
  private jawU = { value: 0 };
  private talk = 0;
  private gestureT = 0;
  private gesture: Gesture = 'idle';
  private t = 0;
  /** Gewünschte Drehung zur Kamera (Gieren, relativ zur Grundausrichtung) */
  look = 0;
  private yaw = 0;

  constructor(url: string, quality: number) {
    const tex = new THREE.TextureLoader().load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const w = (HOST_H * IMG.w) / IMG.h;
    const geo = new THREE.PlaneGeometry(w, HOST_H, quality > 0 ? 48 : 28, quality > 0 ? 56 : 32);
    // Plastische Wölbung: Kopf (Ellipse oben) und Oberkörper treten nach vorn
    const p = geo.attributes.position as THREE.BufferAttribute,
      uv = geo.attributes.uv as THREE.BufferAttribute,
      jaw = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) {
      const u = uv.getX(i),
        v = uv.getY(i);
      const hx = (u - 0.42) / 0.26,
        hy = (v - 0.68) / 0.3,
        head = Math.max(0, 1 - hx * hx - hy * hy);
      const bx = (u - 0.52) / 0.55,
        body = Math.max(0, 1 - bx * bx) * (v < 0.48 ? 1 : Math.max(0, 1 - (v - 0.48) / 0.12));
      p.setZ(i, 0.075 * Math.sqrt(head) + 0.06 * Math.sqrt(body));
      const jx = (u - IMG.jaw[0]) / 0.17,
        jy = (v - IMG.jaw[1]) / 0.1;
      jaw[i] = Math.max(0, 1 - jx * jx - jy * jy) * (v < IMG.mouth[1] ? 1 : 0.2);
    }
    geo.setAttribute('aJaw', new THREE.BufferAttribute(jaw, 1));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.62, roughness: 0.85, metalness: 0, transparent: true, alphaTest: 0.08, side: THREE.DoubleSide });
    const jawU = this.jawU;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uJaw = jawU;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aJaw;\nuniform float uJaw;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.y -= uJaw * aJaw * 0.016;');
    };
    this.card = new THREE.Mesh(geo, mat);
    this.card.position.y = HOST_H / 2;
    this.card.castShadow = quality > 0;
    this.card.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
    this.root.add(this.card);
    // weicher Schatten hinter der Figur (Kontakt zum Studio)
    const sc = document.createElement('canvas');
    sc.width = sc.height = 128;
    const x = sc.getContext('2d')!,
      g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.25, HOST_H * 1.05), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    glow.position.set(0.03, HOST_H / 2 - 0.02, -0.06);
    this.root.add(glow);
  }
  setTalking(on: boolean) {
    this.talk = on ? 1 : 0;
  }
  act(g: Gesture, sec = 2.5) {
    this.gesture = g;
    this.gestureT = sec;
  }
  update(dt: number) {
    this.t += dt;
    const t = this.t;
    if (this.gestureT > 0) {
      this.gestureT -= dt;
      if (this.gestureT <= 0) this.gesture = 'idle';
    }
    const target = this.talk ? Math.max(0, 0.45 + 0.55 * Math.sin(t * 16) * Math.sin(t * 4.7 + 1)) : 0;
    this.jawU.value += (target - this.jawU.value) * Math.min(1, dt * 20);
    this.yaw += (this.look - this.yaw) * Math.min(1, dt * 4);
    let hop = 0,
      tilt = Math.sin(t * 0.9) * 0.012,
      lean = 0,
      sc = 1 + Math.sin(t * 1.6) * 0.006; // Atmen
    if (this.gesture === 'cheer') {
      hop = Math.abs(Math.sin(t * 8)) * 0.06;
      tilt = Math.sin(t * 8) * 0.05;
      sc += 0.02;
    } else if (this.gesture === 'point') {
      tilt = 0.06;
      lean = 0.05;
    } else if (this.gesture === 'wave') {
      tilt = Math.sin(t * 6) * 0.04;
    } else if (this.gesture === 'present') {
      lean = 0.06 + Math.sin(t * 2) * 0.01;
      tilt = -0.03;
    }
    if (this.talk) tilt += Math.sin(t * 5.3) * 0.012;
    this.card.rotation.set(-lean, this.yaw, tilt);
    this.card.position.y = HOST_H / 2 + hop + Math.sin(t * 2.1) * 0.004;
    this.card.scale.set(sc, sc, 1);
  }
}
