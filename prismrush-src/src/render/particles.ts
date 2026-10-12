/** CPU-Partikelsystem mit einem einzigen Draw-Call. */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Points,
  PointsMaterial,
  type Texture,
} from 'three';

export type BurstStyle = 'shards' | 'rings' | 'nova' | 'pixels' | 'trail';

function spriteTexture(square: boolean): Texture {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  if (g) {
    if (square) {
      g.fillStyle = '#fff';
      g.fillRect(14, 14, 36, 36);
    } else {
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
    }
  }
  return new CanvasTexture(c);
}

export class Particles {
  readonly points: Points;
  private readonly pos: Float32Array;
  private readonly col: Float32Array;
  private readonly vel: Float32Array;
  private readonly base: Float32Array;
  private readonly life: Float32Array;
  private readonly maxLife: Float32Array;
  private readonly grav: Float32Array;
  private next = 0;
  private readonly roundTex = spriteTexture(false);
  private readonly squareTex = spriteTexture(true);
  private readonly material: PointsMaterial;

  constructor(private readonly max: number) {
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.base = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.grav = new Float32Array(max);
    for (let i = 0; i < max; i++) this.pos[i * 3 + 1] = -999;
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(this.pos, 3));
    geo.setAttribute('color', new BufferAttribute(this.col, 3));
    this.material = new PointsMaterial({
      size: 0.3,
      map: this.roundTex,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    });
    this.points = new Points(geo, this.material);
    this.points.frustumCulled = false;
  }

  setPixelStyle(pixels: boolean): void {
    this.material.map = pixels ? this.squareTex : this.roundTex;
    this.material.needsUpdate = true;
  }

  spawn(
    x: number,
    y: number,
    z: number,
    count: number,
    color: Color,
    style: BurstStyle,
    power = 1,
  ): void {
    for (let n = 0; n < count; n++) {
      const i = this.next;
      this.next = (this.next + 1) % this.max;
      const i3 = i * 3;
      this.pos[i3] = x;
      this.pos[i3 + 1] = y;
      this.pos[i3 + 2] = z;
      let vx: number;
      let vy: number;
      let vz: number;
      if (style === 'rings') {
        const a = (n / count) * Math.PI * 2;
        const s = 5 * power;
        vx = Math.cos(a) * s;
        vy = Math.sin(a) * s;
        vz = (Math.random() - 0.5) * 0.5;
      } else if (style === 'trail') {
        vx = (Math.random() - 0.5) * 0.8;
        vy = (Math.random() - 0.3) * 0.8;
        vz = 3 + Math.random() * 3;
      } else {
        const u = Math.random() * 2 - 1;
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(1 - u * u);
        const s = (style === 'nova' ? 9 : 5.5) * power * (0.4 + Math.random() * 0.6);
        vx = r * Math.cos(a) * s;
        vy = Math.abs(u) * s * 0.8 + 1;
        vz = r * Math.sin(a) * s;
      }
      this.vel[i3] = vx;
      this.vel[i3 + 1] = vy;
      this.vel[i3 + 2] = vz;
      this.base[i3] = color.r;
      this.base[i3 + 1] = color.g;
      this.base[i3 + 2] = color.b;
      const life = style === 'trail' ? 0.45 : style === 'nova' ? 0.9 : 0.65;
      this.life[i] = life * (0.7 + Math.random() * 0.3);
      this.maxLife[i] = this.life[i];
      this.grav[i] = style === 'pixels' ? -14 : style === 'trail' ? 0 : -4;
    }
  }

  update(dt: number): void {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) continue;
      const i3 = i * 3;
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        this.pos[i3 + 1] = -999;
        this.col[i3] = this.col[i3 + 1] = this.col[i3 + 2] = 0;
        continue;
      }
      const drag = Math.exp(-2.2 * dt);
      this.vel[i3] *= drag;
      this.vel[i3 + 1] = this.vel[i3 + 1] * drag + this.grav[i] * dt;
      this.vel[i3 + 2] *= drag;
      this.pos[i3] += this.vel[i3] * dt;
      this.pos[i3 + 1] += this.vel[i3 + 1] * dt;
      this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
      const k = this.life[i] / this.maxLife[i];
      this.col[i3] = this.base[i3] * k;
      this.col[i3 + 1] = this.base[i3 + 1] * k;
      this.col[i3 + 2] = this.base[i3 + 2] * k;
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
  }
}
