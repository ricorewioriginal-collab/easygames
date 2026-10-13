// Lobby-Bühne: Figur auf einer schwebenden Plattform mit Riftkristallen (für Hauptmenü und Spind).
import * as THREE from 'three';
import { Mode, type Cosmetics } from '../../../shared/src/types';
import { CharacterRig, type CharState } from './characters';
import type { Renderer3D } from './renderer';

export class LobbyStage {
  readonly scene = new THREE.Scene();
  readonly cam = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  private rig: CharacterRig | null = null;
  private cosKey = '';
  private readonly crystals: THREE.Mesh[] = [];
  private t = 0;
  yaw = Math.PI + 0.35;
  emote = -1;
  emoteUntil = 0;
  holding = 100;
  private running = false;
  private raf = 0;
  private last = 0;
  private readonly mates: CharacterRig[] = [];
  /** Horizontaler Versatz (Figur rechts/links vom Menü) */
  offsetX = 0;

  constructor(private readonly R: Renderer3D) {
    this.scene.background = new THREE.Color(0x0e1230);
    this.scene.fog = new THREE.Fog(0x0e1230, 14, 40);
    const hemi = new THREE.HemisphereLight(0xb9c6ff, 0x2a1a4a, 1.1);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 6, 4);
    this.scene.add(key);
    const rim = new THREE.PointLight(0xb64bff, 30, 12);
    rim.position.set(-2.5, 2.5, -2);
    this.scene.add(rim);
    const rim2 = new THREE.PointLight(0x3ff2ff, 24, 12);
    rim2.position.set(2.5, 1.5, -2.5);
    this.scene.add(rim2);
    // Plattform
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.2, 0.5, 6), new THREE.MeshLambertMaterial({ color: 0x232a5a }));
    plat.position.y = -0.25;
    this.scene.add(plat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.04, 6, 6), new THREE.MeshBasicMaterial({ color: 0x3ff2ff }));
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = Math.PI / 6;
    this.scene.add(ring);
    // Schwebende Kristalle
    const cg = new THREE.OctahedronGeometry(0.3, 0);
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(cg, new THREE.MeshLambertMaterial({ color: i % 2 ? 0xb64bff : 0x3ff2ff, emissive: i % 2 ? 0x4a1a8a : 0x0a5a6a }));
      const a = (i / 14) * Math.PI * 2;
      m.position.set(Math.cos(a) * (4 + (i % 3)), 0.5 + (i % 4) * 0.8, -3 + Math.sin(a) * 3 - 3);
      m.scale.set(0.6 + (i % 3) * 0.3, 1.4 + (i % 2), 0.6 + (i % 3) * 0.3);
      this.scene.add(m);
      this.crystals.push(m);
    }
    // Boden
    const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 32), new THREE.MeshLambertMaterial({ color: 0x0b0f24 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    this.scene.add(floor);
  }

  setCosmetics(cos: Cosmetics): void {
    const key = JSON.stringify(cos);
    if (key === this.cosKey) return;
    this.cosKey = key;
    this.rig?.dispose();
    this.rig = new CharacterRig(cos);
    this.scene.add(this.rig.root);
  }

  /** Gruppenmitglieder neben der eigenen Figur */
  setMates(list: Cosmetics[]): void {
    for (const m of this.mates) m.dispose();
    this.mates.length = 0;
    list.slice(0, 3).forEach((c, i) => {
      const r = new CharacterRig(c);
      this.scene.add(r.root);
      r.root.userData.slot = i;
      this.mates.push(r);
    });
  }

  playEmote(id: number, sec = 4): void {
    this.emote = id;
    this.emoteUntil = this.t + sec;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number): void => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      this.render(dt);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private render(dt: number): void {
    this.t += dt;
    this.R.resize();
    const a = this.R.aspect;
    this.cam.aspect = a;
    // Figur bei schmalen Bildschirmen weiter weg
    const dist = a < 0.8 ? 7.5 : 5.2;
    this.cam.position.set(this.offsetX * (a < 0.8 ? 0 : 1), 1.6, dist);
    this.cam.lookAt(this.offsetX * (a < 0.8 ? 0 : 1), 1.0, 0);
    this.cam.updateProjectionMatrix();
    if (this.t > this.emoteUntil) this.emote = -1;
    const st = (x: number, yaw: number, emote: number): CharState => ({
      x,
      y: 0,
      z: 0,
      yaw,
      pitch: 0,
      mode: Mode.Ground,
      crouch: false,
      speed: 0,
      aiming: false,
      firing: false,
      building: false,
      reloading: false,
      using: false,
      reviving: false,
      emote,
      weapon: emote >= 0 ? -1 : this.holding,
      rarity: 0,
      vy: 0,
    });
    this.rig?.update(st(0, this.yaw, this.emote), dt);
    this.mates.forEach((m, i) => {
      const x = (i % 2 === 0 ? -1 : 1) * (1.7 + Math.floor(i / 2) * 1.4);
      m.update(st(x, Math.PI + (i % 2 ? -0.3 : 0.3), -1), dt);
      m.root.position.z = -0.8;
    });
    this.crystals.forEach((c, i) => {
      c.rotation.y += dt * (0.3 + (i % 3) * 0.2);
      c.position.y += Math.sin(this.t * 0.8 + i) * dt * 0.15;
    });
    this.R.gl.render(this.scene, this.cam);
  }
}
