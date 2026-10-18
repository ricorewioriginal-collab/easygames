/* Spinwelten 3D – Effekte: Partikel (ein Punkte-Pool je Szene), Ringwellen, Flugkörper (Sturmkern), Schutzkuppel. */
(function (SW) {
  'use strict';
  const T = () => globalThis.THREE;
  let dotTex = null;
  function dot() {
    if (dotTex) return dotTex;
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    dotTex = new (T().CanvasTexture)(c); return dotTex;
  }
  class VFX {
    constructor(scene, max) {
      const THREE = T(); this.scene = scene; this.max = max || 600; this.n = 0;
      this.pos = new Float32Array(this.max * 3); this.col = new Float32Array(this.max * 3);
      this.vel = new Float32Array(this.max * 3); this.life = new Float32Array(this.max); this.age = new Float32Array(this.max); this.grav = new Float32Array(this.max);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
      this.mat = new THREE.PointsMaterial({ size: 0.55, map: dot(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; scene.add(this.pts);
      this.geo = g; this.extra = []; this.c = new THREE.Color();
      for (let i = 0; i < this.max; i++) this.pos[i * 3 + 1] = -9999;
    }
    burst(p, o) {
      o = o || {}; this.c.set(o.color || '#ffffff');
      const n = o.n || 30, sp = o.speed || 4, up = o.up || 2, life = o.life || 1, c2 = o.color2 ? new (T().Color)(o.color2) : null;
      for (let k = 0; k < n; k++) {
        const i = this.n; this.n = (this.n + 1) % this.max;
        this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
        const a = Math.random() * 6.283, e = Math.random() * 2 - 1, s = sp * (0.3 + Math.random() * 0.7);
        this.vel[i * 3] = Math.cos(a) * Math.sqrt(1 - e * e) * s; this.vel[i * 3 + 1] = Math.abs(e) * s * 0.6 + up * Math.random(); this.vel[i * 3 + 2] = Math.sin(a) * Math.sqrt(1 - e * e) * s;
        const cc = c2 && k % 2 ? c2 : this.c;
        this.col[i * 3] = cc.r; this.col[i * 3 + 1] = cc.g; this.col[i * 3 + 2] = cc.b;
        this.life[i] = life * (0.6 + Math.random() * 0.6); this.age[i] = 0; this.grav[i] = o.gravity !== undefined ? o.gravity : 6;
      }
    }
    ring(p, color, maxR) {
      const THREE = T(), m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.0, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.rotation.x = -Math.PI / 2; m.position.copy(p); this.scene.add(m);
      this.extra.push({ m, t: 0, d: 0.9, up: (o, k) => { o.scale.setScalar(1 + k * (maxR || 3)); o.material.opacity = 0.9 * (1 - k); } });
    }
    // Flugkörper von a nach b (Bogen), ruft onHit am Ziel auf
    projectile(a, b, color, dur, onHit) {
      const THREE = T(), g = new THREE.Group();
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), new THREE.MeshStandardMaterial({ color: new THREE.Color(color), emissive: new THREE.Color(color), emissiveIntensity: 1.2, roughness: 0.3 }));
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
      g.add(core); g.add(halo); g.position.copy(a); this.scene.add(g);
      const mid = a.clone().lerp(b, 0.5); mid.y += a.distanceTo(b) * 0.35;
      this.extra.push({ m: g, t: 0, d: dur || 1.1, own: [core, halo], up: (o, k) => {
        const q = 1 - k; o.position.set(q * q * a.x + 2 * q * k * mid.x + k * k * b.x, q * q * a.y + 2 * q * k * mid.y + k * k * b.y, q * q * a.z + 2 * q * k * mid.z + k * k * b.z);
        o.rotation.x += 0.3; o.rotation.y += 0.2;
        if (Math.random() < 0.7) this.burst(o.position, { n: 2, color, speed: 0.6, up: 0, life: 0.5, gravity: 0 });
      }, done: onHit });
    }
    // Schutzkuppel, die zerspringt
    shield(p, r, color) {
      const THREE = T(), m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(color || '#7dffcf'), transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      m.position.copy(p); this.scene.add(m);
      this.extra.push({ m, t: 0, d: 1.4, own: [m], up: (o, k) => { o.material.opacity = k < 0.6 ? 0.45 * Math.min(1, k * 5) : 0.45 * (1 - (k - 0.6) / 0.4); o.scale.setScalar(k < 0.6 ? 1 : 1 + (k - 0.6) * 0.8); },
        done: () => this.burst(p, { n: 50, color: color || '#7dffcf', speed: 6, up: 2, life: 0.9 }) });
    }
    update(dt) {
      for (let i = 0; i < this.max; i++) {
        if (this.age[i] >= this.life[i]) continue;
        this.age[i] += dt;
        const k = i * 3;
        if (this.age[i] >= this.life[i]) { this.pos[k + 1] = -9999; continue; }
        this.vel[k + 1] -= this.grav[i] * dt;
        this.pos[k] += this.vel[k] * dt; this.pos[k + 1] += this.vel[k + 1] * dt; this.pos[k + 2] += this.vel[k + 2] * dt;
        const f = 1 - this.age[i] / this.life[i];
        this.col[k] *= 0.985 + f * 0.015; this.col[k + 1] *= 0.985 + f * 0.015; this.col[k + 2] *= 0.985 + f * 0.015;
      }
      this.geo.attributes.position.needsUpdate = true; this.geo.attributes.color.needsUpdate = true;
      for (let j = this.extra.length - 1; j >= 0; j--) {
        const e = this.extra[j]; e.t += dt; const k = Math.min(1, e.t / e.d); e.up(e.m, k);
        if (k >= 1) {
          this.scene.remove(e.m);
          (e.own || [e.m]).forEach(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
          this.extra.splice(j, 1); if (e.done) e.done();
        }
      }
    }
    dispose() { this.scene.remove(this.pts); this.geo.dispose(); this.mat.dispose(); for (const e of this.extra) this.scene.remove(e.m); this.extra = []; }
  }
  SW.VFX = VFX;
})(globalThis.SW = globalThis.SW || {});
