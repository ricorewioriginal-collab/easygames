// Kurzlebige Effekte: Funkenregen, Ringe, Hiebe, Lichtblitze, Schutzblase. Leuchten über Bloom.
import * as THREE from 'three';
import { dotTex, slashTex } from './textures.js';

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
