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
    // Trümmer: kleine Klötzchen fliegen weg, prallen auf, verblassen
    debris(p, color, n, ground) {
      const THREE = T(), geo = this.chunk || (this.chunk = new THREE.BoxGeometry(0.28, 0.2, 0.24)), gy = ground !== undefined ? ground : p.y - 0.8;
      for (let i = 0; i < (n || 14); i++) {
        const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: new THREE.Color(i % 3 ? color : '#8a7a6a'), roughness: 0.8, transparent: true }));
        m.position.copy(p); m.scale.setScalar(0.6 + Math.random() * 0.9); this.scene.add(m);
        const a = Math.random() * 6.283, s = 2 + Math.random() * 4, v = new THREE.Vector3(Math.cos(a) * s, 3 + Math.random() * 5, Math.sin(a) * s), r = new THREE.Vector3(Math.random() * 9, Math.random() * 9, 0);
        const dur = 1.6 + Math.random() * 0.6; let lk = 0;
        this.extra.push({ m, t: 0, d: dur, own: [{ material: m.material }], up: (o, k) => {
          const dt = Math.min(0.05, (k - lk) * dur); lk = k; v.y -= 14 * dt; o.position.addScaledVector(v, dt);
          if (o.position.y < gy) { o.position.y = gy; v.y = Math.abs(v.y) * 0.35; v.x *= 0.6; v.z *= 0.6; r.multiplyScalar(0.6); }
          o.rotation.x += r.x * dt; o.rotation.y += r.y * dt; o.material.opacity = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
        } });
      }
    }
    // Rauchwolken (normal gemischt, damit sie dunkel bleiben)
    smoke(p, n, color, size) {
      const THREE = T(), geo = this.puff || (this.puff = new THREE.IcosahedronGeometry(1, 1));
      for (let i = 0; i < (n || 8); i++) {
        const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: new THREE.Color(color || '#8a8f99'), transparent: true, opacity: 0.85, depthWrite: false }));
        const off = new THREE.Vector3((Math.random() - 0.5) * 2.2, Math.random() * 0.8, (Math.random() - 0.5) * 2.2);
        m.position.copy(p).add(off); this.scene.add(m);
        const s0 = (size || 0.8) * (0.6 + Math.random() * 0.6), rise = 1.5 + Math.random() * 2, base = m.position.clone(), delay = Math.random() * 0.3;
        this.extra.push({ m, t: -delay, d: 1.8 + Math.random() * 0.8, own: [{ material: m.material }], up: (o, k) => {
          if (k < 0) { o.scale.setScalar(0.01); return; }
          o.scale.setScalar(s0 * (0.4 + k * 1.6)); o.position.set(base.x + off.x * k * 0.6, base.y + rise * k, base.z + off.z * k * 0.6); o.material.opacity = 0.85 * (1 - k);
        } });
      }
    }
    // Gewitterwolke über einem Punkt (wächst, dreht, verschwindet nach d Sekunden)
    cloud(p, d, color) {
      const THREE = T(), g = new THREE.Group(), mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(color || '#5a5f7a'), transparent: true, opacity: 0.95 });
      const geo = this.puff || (this.puff = new THREE.IcosahedronGeometry(1, 1));
      for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(geo, mat); const a = i / 9 * 6.283; m.position.set(Math.cos(a) * 1.6, (i % 3) * 0.3, Math.sin(a) * 1.2); m.scale.setScalar(0.9 + (i % 4) * 0.25); g.add(m); }
      const core = new THREE.Mesh(geo, mat); core.scale.set(1.8, 1.2, 1.6); core.position.y = 0.4; g.add(core);
      g.position.copy(p); g.scale.setScalar(0.01); this.scene.add(g);
      this.extra.push({ m: g, t: 0, d: d || 2.2, own: [{ material: mat }], up: (o, k) => {
        const grow = Math.min(1, k * 5), fade = k > 0.85 ? (1 - k) / 0.15 : 1; o.scale.setScalar(Math.max(0.01, grow * (1 + Math.sin(k * 40) * 0.03)) * (0.6 + 0.4 * fade)); o.rotation.y += 0.02; mat.opacity = 0.95 * fade;
      } });
      return g;
    }
    // Blitz: gezackte Kette heller Stäbe von a nach b, flackert kurz
    bolt(a, b, color) {
      const THREE = T(), g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color || '#fff6c8'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      const geo = this.rod || (this.rod = new THREE.CylinderGeometry(0.09, 0.09, 1, 5, 1));
      const n = 9; let prev = a.clone();
      for (let i = 1; i <= n; i++) {
        const q = a.clone().lerp(b, i / n); if (i < n) { q.x += (Math.random() - 0.5) * 1.4; q.z += (Math.random() - 0.5) * 1.4; }
        const m = new THREE.Mesh(geo, mat), len = prev.distanceTo(q); m.scale.set(1 + (n - i) * 0.12, len, 1 + (n - i) * 0.12);
        m.position.copy(prev).lerp(q, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(prev).normalize()); g.add(m); prev = q;
      }
      this.scene.add(g);
      this.extra.push({ m: g, t: 0, d: 0.45, own: [{ material: mat }], up: (o, k) => { mat.opacity = (Math.floor(k * 9) % 2 ? 0.35 : 1) * (1 - k * 0.6); } });
    }
    // freie Zeitanimation (nichts wird entfernt): up(k) mit k 0…1, danach done()
    anim(d, up, done) { this.extra.push({ m: null, t: 0, d, own: [], up: (o, k) => up(k), done }); }
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
          if (e.m) this.scene.remove(e.m);
          (e.own || [e.m]).forEach(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
          this.extra.splice(j, 1); if (e.done) e.done();
        }
      }
    }
    dispose() { this.scene.remove(this.pts); this.geo.dispose(); this.mat.dispose(); for (const e of this.extra) if (e.m) this.scene.remove(e.m); this.extra = []; }
  }
  SW.VFX = VFX;
})(globalThis.SW = globalThis.SW || {});
