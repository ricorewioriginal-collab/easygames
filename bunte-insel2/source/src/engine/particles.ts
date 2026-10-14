/* Partikel in einem einzigen Zeichenaufruf: Konfetti, Funkeln, Staub, Spritzer, Sterne, Rauch. */
import { softDot } from './textures.ts';

const MAX = 1600;
export class Particles {
  private pos = new Float32Array(MAX * 3);
  private col = new Float32Array(MAX * 3);
  private size = new Float32Array(MAX);
  private vel = new Float32Array(MAX * 3);
  private life = new Float32Array(MAX);
  private max = new Float32Array(MAX);
  private grav = new Float32Array(MAX);
  private s0 = new Float32Array(MAX);
  private next = 0;
  private points: THREE.Points;
  private geo: THREE.BufferGeometry;
  private _c = new THREE.Color();
  constructor(scene: THREE.Scene, private factor: number) {
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: softDot() }, scale: { value: window.innerHeight / 2 } },
      vertexShader: 'attribute float size; attribute vec3 color; varying vec3 vC; uniform float scale; void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * scale / -mv.z; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform sampler2D map; varying vec3 vC; void main(){ vec4 t = texture2D(map, gl_PointCoord); if (t.a < 0.05) discard; gl_FragColor = vec4(vC, t.a); }',
      transparent: true, depthWrite: false
    });
    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 6;
    scene.add(this.points);
    window.addEventListener('resize', () => { mat.uniforms.scale.value = window.innerHeight / 2; });
  }
  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, color: number, size: number, life: number, gravity = 9): void {
    const i = this.next; this.next = (this.next + 1) % MAX;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this._c.setHex(color);
    this.col[i * 3] = this._c.r; this.col[i * 3 + 1] = this._c.g; this.col[i * 3 + 2] = this._c.b;
    this.size[i] = size; this.s0[i] = size; this.life[i] = life; this.max[i] = life; this.grav[i] = gravity;
  }
  private n(k: number): number { return Math.max(1, Math.round(k * this.factor)); }
  burst(x: number, y: number, z: number, colors: number[], n = 24, speed = 6): void {
    for (let i = 0; i < this.n(n); i++) {
      const a = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, s = speed * (0.5 + Math.random() * 0.6), r = Math.sqrt(1 - u * u);
      this.emit(x, y, z, Math.cos(a) * r * s, Math.abs(u) * s + 2, Math.sin(a) * r * s, colors[i % colors.length], 0.25 + Math.random() * 0.2, 0.9 + Math.random() * 0.6, 9);
    }
  }
  sparkle(x: number, y: number, z: number, color = 0xfff2a0, n = 8): void {
    for (let i = 0; i < this.n(n); i++) this.emit(x + (Math.random() - 0.5), y + Math.random(), z + (Math.random() - 0.5), (Math.random() - 0.5) * 0.6, 0.8 + Math.random(), (Math.random() - 0.5) * 0.6, color, 0.22, 0.8 + Math.random() * 0.5, -0.5);
  }
  puff(x: number, y: number, z: number, color = 0xffffff, n = 10): void {
    for (let i = 0; i < this.n(n); i++) { const a = Math.random() * Math.PI * 2; this.emit(x, y + 0.2, z, Math.cos(a) * 2, 0.6 + Math.random(), Math.sin(a) * 2, color, 0.45, 0.6, 1); }
  }
  splash(x: number, y: number, z: number, n = 18): void {
    for (let i = 0; i < this.n(n); i++) { const a = Math.random() * Math.PI * 2; this.emit(x, y + 0.1, z, Math.cos(a) * 2.5, 3 + Math.random() * 3, Math.sin(a) * 2.5, 0xd8f6ff, 0.25, 0.8, 12); }
  }
  trail(x: number, y: number, z: number, color: number): void { this.emit(x, y, z, 0, 0.2, 0, color, 0.3, 0.5, 0); }
  update(dt: number): void {
    let any = false;
    for (let i = 0; i < MAX; i++) {
      if (this.life[i] <= 0) { if (this.size[i] !== 0) { this.size[i] = 0; any = true; } continue; }
      any = true;
      this.life[i] -= dt;
      this.vel[i * 3 + 1] -= this.grav[i] * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      const k = this.life[i] / this.max[i];
      this.size[i] = this.s0[i] * Math.min(1, k * 2.5);
    }
    if (any) {
      this.geo.attributes.position.needsUpdate = true;
      this.geo.attributes.color.needsUpdate = true;
      this.geo.attributes.size.needsUpdate = true;
    }
  }
}
