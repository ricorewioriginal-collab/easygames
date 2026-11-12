// Kurzlebige Effekte: Funkenregen, Ringe, Hiebe, Lichtblitze, Schutzblase. Leuchten über Bloom.
import * as THREE from 'three';
import { dotTex, slashTex } from './textures.js';

// Weiche Leuchtstreifen (Mitte hell, Ränder durchsichtig) und Säulenverlauf (unten hell, oben weg)
let _strip = null, _pillar = null;
function canvasTex(w, h, paint) {
  const c = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!c) return null;
  c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function glowStripTex() {
  return _strip || (_strip = canvasTex(8, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }));
}
function pillarTex() {
  return _pillar || (_pillar = canvasTex(64, 64, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.6, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(Math.random() * w, 0, 2, h); }
  }));
}

export class Fx {
  constructor(view) {
    this.v = view;
    this.list = [];
  }
  add(obj, scene, life, step) {
    scene.add(obj);
    this.list.push({ obj, scene, life, t: 0, step });
  }
  // Partikelausbruch: count Funken, speed, life Sekunden, gravity (negativ = fallen), size
  burst(pos, color, count, speed, life, gravity, size, scene) {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3), vel = [];
    for (let i = 0; i < count; i++) {
      p[i * 3] = pos.x; p[i * 3 + 1] = pos.y; p[i * 3 + 2] = pos.z;
      const d = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.9 + 0.1, Math.random() - 0.5).normalize().multiplyScalar(speed * (0.35 + Math.random() * 0.65));
      vel.push(d);
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({ map: dotTex(), color: new THREE.Color(color).multiplyScalar(2.5), size, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    this.add(pts, scene, life, (k, dt) => {
      const a = g.attributes.position;
      for (let i = 0; i < count; i++) {
        const v = vel[i];
        v.y += gravity * dt;
        v.multiplyScalar(1 - dt * 1.2);
        a.array[i * 3] += v.x * dt; a.array[i * 3 + 1] += v.y * dt; a.array[i * 3 + 2] += v.z * dt;
      }
      a.needsUpdate = true;
      m.opacity = 1 - k * k;
    });
  }
  ring(pos, color, r0, r1, life, scene, flat = true) {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.2), transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 64), m);
    if (flat) mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(pos);
    this.add(mesh, scene, life, (k) => { const r = r0 + (r1 - r0) * (1 - (1 - k) * (1 - k)); mesh.scale.setScalar(r); m.opacity = 1 - k; });
  }
  slash(pos, color, scale, scene) {
    const m = new THREE.MeshBasicMaterial({ map: slashTex(), color: new THREE.Color(color).multiplyScalar(2.4), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2 * scale, 1 * scale), m);
    mesh.position.copy(pos);
    mesh.quaternion.copy(this.v.camera.quaternion);
    mesh.rotateZ(-0.7 + Math.random() * 0.4);
    mesh.renderOrder = 20;
    this.add(mesh, scene, 0.32, (k) => { mesh.scale.setScalar(0.7 + k * 0.6); m.opacity = 1 - k; mesh.rotateZ(0.02); });
  }
  // Lichtblitz aus einem festen Vorrat (neue Lichter würden alle Shader neu übersetzen)
  flash(pos, color, intensity, life, scene) {
    const pool = scene.userData.flashPool;
    if (!pool) return;
    const l = pool.find(x => !x.userData.busy) || pool[0];
    l.userData.busy = true;
    l.color.set(color);
    l.position.copy(pos);
    const item = { obj: new THREE.Object3D(), scene, life, t: 0, step: (k) => { l.intensity = intensity * (1 - k); if (k >= 1) { l.intensity = 0; l.userData.busy = false; } } };
    scene.add(item.obj);
    this.list.push(item);
  }
  bubble(pos, color, r, life, scene) {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.4), transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vF;').replace('#include <project_vertex>', '#include <project_vertex>\nvec3 nn = normalize(normalMatrix * normal); vF = 1.0 - abs(nn.z);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vF;').replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( diffuse, opacity * (0.15 + pow(vF, 2.0)) );');
    };
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), m);
    mesh.position.copy(pos);
    this.add(mesh, scene, life, (k) => { m.opacity = k < 0.2 ? k * 5 : (1 - k) * 1.25; mesh.scale.setScalar(0.9 + 0.1 * Math.sin(k * 20)); });
  }
  // Verzögert ausführen (für Effektfolgen)
  later(t, fn, scene) {
    const o = new THREE.Object3D();
    let fired = false;
    this.add(o, scene, t, (k) => { if (k >= 1 && !fired) { fired = true; fn(); } });
  }
  // Leuchtband entlang einer Punktfolge (zur Kamera gedreht), z. B. Blitz oder Leuchtspur
  ribbon(points, width, color, life, scene, grow = 0) {
    const cam = this.v.camera.position;
    const n = points.length, pos = new Float32Array(n * 2 * 3), uv = new Float32Array(n * 2 * 2), idx = [];
    for (let i = 0; i < n; i++) {
      const p = points[i], q = points[Math.min(n - 1, i + 1)], r = points[Math.max(0, i - 1)];
      const dir = q.clone().sub(r).normalize(), view = cam.clone().sub(p).normalize();
      const side = dir.clone().cross(view).normalize().multiplyScalar(width * (1 - 0.6 * i / n) * 0.5);
      pos.set([p.x + side.x, p.y + side.y, p.z + side.z, p.x - side.x, p.y - side.y, p.z - side.z], i * 6);
      uv.set([i / (n - 1), 0, i / (n - 1), 1], i * 4);
      if (i < n - 1) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    const m = new THREE.MeshBasicMaterial({ map: glowStripTex(), color: new THREE.Color(color).multiplyScalar(3), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, m);
    mesh.frustumCulled = false;
    mesh.renderOrder = 15;
    const total = idx.length;
    this.add(mesh, scene, life, (k) => {
      if (grow) g.setDrawRange(0, Math.max(6, Math.floor(Math.min(1, k / grow) * total / 6) * 6));
      m.opacity = k < 0.6 ? 1 : (1 - k) / 0.4;
    });
    return mesh;
  }
  // Blitz von oben in das Ziel
  lightning(to, color, scene, h = 7) {
    for (let b = 0; b < 2; b++) {
      const pts = [];
      const top = to.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, h, (Math.random() - 0.5) * 1.5));
      for (let i = 0; i <= 12; i++) {
        const p = top.clone().lerp(to, i / 12);
        if (i && i < 12) p.add(new THREE.Vector3((Math.random() - 0.5) * 0.7, 0, (Math.random() - 0.5) * 0.7));
        pts.push(p);
      }
      this.ribbon(pts, b ? 0.18 : 0.42, b ? '#ffffff' : color, 0.35, scene);
    }
    this.flash(to, color, 60, 0.35, scene);
  }
  // Lichtsäule vom Boden nach oben
  pillar(pos, color, r, h, life, scene, alpha = 1) {
    const m = new THREE.MeshBasicMaterial({ map: pillarTex(), color: new THREE.Color(color).multiplyScalar(2.5), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, h, 32, 1, true), m);
    mesh.position.copy(pos).add(new THREE.Vector3(0, h / 2, 0));
    mesh.renderOrder = 12;
    this.add(mesh, scene, life, (k) => {
      const e = k < 0.15 ? k / 0.15 : 1;
      mesh.scale.set(0.3 + 0.7 * e + k * 0.3, e, 0.3 + 0.7 * e + k * 0.3);
      mesh.position.y = pos.y + h * e / 2;
      m.opacity = alpha * (k < 0.7 ? 1 : (1 - k) / 0.3);
      mesh.rotation.y += 0.04;
    });
  }
  // Leuchtende Kugel, die anwächst (Supernova, Zauberkern)
  orb(pos, color, r0, r1, life, scene) {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vF;').replace('#include <project_vertex>', '#include <project_vertex>\nvec3 nn = normalize(normalMatrix * normal); vF = abs(nn.z);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vF;').replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( diffuse, opacity * (0.25 + 0.75 * pow(vF, 1.5)) );');
    };
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), m);
    mesh.position.copy(pos);
    this.add(mesh, scene, life, (k) => { mesh.scale.setScalar(r0 + (r1 - r0) * (1 - (1 - k) ** 3)); m.opacity = k < 0.5 ? 1 : (1 - k) * 2; });
  }
  // Geschoss mit Leuchtspur von a nach b (Bogen), ruft bei Ankunft hit()
  shot(a, b, color, dur, scene, arc = 0.6, hit) {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(4) }));
    head.position.copy(a);
    const trail = [];
    let done = false;
    this.add(head, scene, dur, (k) => {
      head.position.lerpVectors(a, b, k);
      head.position.y += Math.sin(k * Math.PI) * arc;
      trail.push(head.position.clone());
      if (trail.length > 2 && trail.length % 2 === 0) this.ribbon(trail.slice(-3), 0.12, color, 0.18, scene);
      if (k >= 1 && !done) { done = true; hit && hit(); }
    });
  }
  update(dt) {
    for (const f of this.list) {
      f.t += dt;
      f.step(Math.min(1, f.t / f.life), dt);
    }
    this.list = this.list.filter(f => {
      if (f.t < f.life) return true;
      f.step(1, 0);
      f.scene.remove(f.obj);
      f.obj.geometry?.dispose();
      f.obj.material?.dispose();
      f.obj.dispose?.();
      return false;
    });
  }
  clear(scene) {
    this.list = this.list.filter(f => { if (f.scene !== scene) return true; scene.remove(f.obj); f.obj.geometry?.dispose(); f.obj.material?.dispose(); return false; });
  }
}
