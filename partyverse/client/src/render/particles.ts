import * as THREE from 'three';

let tex: THREE.CanvasTexture | null = null;
function puffTexture(): THREE.CanvasTexture {
  if (!tex) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d') as CanvasRenderingContext2D;
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.5, 'rgba(255,255,255,0.7)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    tex = new THREE.CanvasTexture(c);
    tex.userData.shared = true;
  }
  return tex;
}

interface P {
  s: THREE.Sprite;
  v: THREE.Vector3;
  life: number;
  max: number;
  g: number;
}

/** Einfaches Partikelsystem aus wiederverwendeten Sprites. `scale` (0…1) richtet sich nach der Qualitätseinstellung. */
export class ParticlePool {
  private free: THREE.Sprite[] = [];
  private live: P[] = [];
  constructor(
    scene: THREE.Object3D,
    maxCount = 160,
    public scale = 1,
  ) {
    const t = puffTexture();
    for (let i = 0; i < maxCount; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
      s.visible = false;
      scene.add(s);
      this.free.push(s);
    }
  }

  burst(
    pos: THREE.Vector3,
    color: number,
    count = 14,
    opts: { speed?: number; size?: number; life?: number; gravity?: number } = {},
  ): void {
    const n = Math.round(count * this.scale);
    for (let i = 0; i < n; i++) {
      const s = this.free.pop();
      if (!s) return;
      const a = Math.random() * Math.PI * 2;
      const e = (Math.random() - 0.3) * 1.2;
      const sp = (opts.speed ?? 3) * (0.4 + Math.random() * 0.8);
      s.visible = true;
      s.position.copy(pos);
      (s.material as THREE.SpriteMaterial).color.setHex(color);
      (s.material as THREE.SpriteMaterial).opacity = 1;
      s.scale.setScalar((opts.size ?? 0.35) * (0.6 + Math.random() * 0.8));
      const life = (opts.life ?? 0.9) * (0.6 + Math.random() * 0.6);
      this.live.push({
        s,
        v: new THREE.Vector3(Math.cos(a) * sp, 1 + e * sp, Math.sin(a) * sp),
        life,
        max: life,
        g: opts.gravity ?? 6,
      });
    }
  }

  update(dt: number): void {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const p = this.live[i] as P;
      p.life -= dt;
      p.v.y -= p.g * dt;
      p.s.position.addScaledVector(p.v, dt);
      (p.s.material as THREE.SpriteMaterial).opacity = Math.max(0, p.life / p.max);
      if (p.life <= 0) {
        p.s.visible = false;
        this.free.push(p.s);
        this.live.splice(i, 1);
      }
    }
  }

  dispose(): void {
    for (const s of [...this.free, ...this.live.map((l) => l.s)]) {
      s.removeFromParent();
      s.material.dispose();
    }
    this.free = [];
    this.live = [];
  }
}
