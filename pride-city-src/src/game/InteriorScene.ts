/* Innenraum eines Hauses (Laden, Treffpunkt oder Wohnung): Einrichtung und Stellen aus interiors.ts, Bewegung wie in der Wohnung. */
import * as THREE from 'three';
import type { GameScene } from '../engine/Engine';
import { instance } from '../engine/Assets';
import { Actor, playerLook, streetLook } from './Actor';
import type { Game } from './Game';
import { hints, toast } from '../ui/ui';
import { advance, DAY_SEC } from './life';
import { music } from '../engine/Audio';
import type { Spot, Theme } from './interiors';

interface Box { x: number; z: number; hx: number; hz: number }
const W = 12, D = 9, K = 1.6;
const DOOR: Spot = { id: 'door', label: '🚪 Rausgehen', x: W / 2 - .8, z: 3.4, r: 1.5, act: { k: 'menu' } };

export class InteriorScene implements GameScene {
  root = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
  bloom = .6;
  private player!: Actor;
  private boxes: Box[] = [];
  private glow: THREE.MeshStandardMaterial[] = [];
  readonly spots: Spot[];
  private hudT = 0;
  private exitPos = new THREE.Vector3(W / 2 - .2, 3.4, 3.4);
  constructor(private g: Game, readonly theme: Theme, readonly placeId = '') { this.spots = [...theme.spots, DOOR]; }

  async build() {
    const r = this.root, t = this.theme;
    r.background = new THREE.Color(0x0e0a1a);
    r.add(new THREE.HemisphereLight(0xfff4ea, 0x302840, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(-3, 9, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 }); r.add(sun);
    const lamp = new THREE.PointLight(t.light, 26, 18); lamp.position.set(0, 3.4, 0); r.add(lamp, new THREE.AmbientLight(0xffffff, .35));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: t.floor, roughness: .75 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; r.add(floor);
    const wallM = new THREE.MeshStandardMaterial({ color: t.wall, roughness: .9 });
    const wall = (w: number, d: number, x: number, z: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d), wallM); m.position.set(x, 2, z); m.receiveShadow = true; r.add(m); };
    wall(W, .2, 0, -D / 2); wall(.2, D, -W / 2, 0); wall(.2, D, W / 2, 0);
    // Tür rechts mit Leuchtschild
    const dx = W / 2 - .12, dz = DOOR.z;
    const door = new THREE.Mesh(new THREE.BoxGeometry(.06, 2.5, 1.3), new THREE.MeshStandardMaterial({ color: 0x7a3fb0, roughness: .6 })); door.position.set(dx, 1.25, dz); r.add(door);
    r.add(this.neon('🚪 AUSGANG', '#5dff9b', dx - .08, 3, dz, -Math.PI / 2, 1.2));
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.3), new THREE.MeshStandardMaterial({ color: 0xff4fa3, roughness: 1 })); mat.rotation.x = -Math.PI / 2; mat.position.set(dx - .6, .015, dz); r.add(mat);

    const jobs: Promise<unknown>[] = [];
    for (const it of t.items) {
      if ('m' in it) jobs.push(instance(it.m + '.gltf').then((o) => {
        o.position.set(it.x, it.y || 0, it.z); o.rotation.y = it.r || 0; o.scale.setScalar(K * (it.s || 1)); r.add(o);
        if (it.col) { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()); this.boxes.push({ x: c.x, z: c.z, hx: Math.max(.2, (b.max.x - b.min.x) / 2 - .08), hz: Math.max(.2, (b.max.z - b.min.z) / 2 - .08) }); }
      }).catch(() => { /* Modell fehlt: Raum bleibt nutzbar */ }));
      else if ('box' in it) {
        const [w, h, d] = it.box, m = new THREE.MeshStandardMaterial({ color: it.c, roughness: .7, emissive: it.e ? it.c : 0x000000, emissiveIntensity: it.e || 0 });
        const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(it.x, (it.y || 0) + h / 2, it.z); o.castShadow = o.receiveShadow = true; r.add(o);
        if (it.e) this.glow.push(m);
        if (it.col) this.boxes.push({ x: it.x, z: it.z, hx: w / 2, hz: d / 2 });
      } else if ('screen' in it) {
        const o = new THREE.Mesh(new THREE.PlaneGeometry(it.screen[0], it.screen[1]), new THREE.MeshBasicMaterial({ color: it.c, toneMapped: false })); o.position.set(it.x, it.y, it.z + .02); o.rotation.y = it.ry || 0; r.add(o);
      } else r.add(this.neon(it.neon, it.c, it.x, it.y, it.z + .02, it.ry || 0, it.w || Math.min(8, it.neon.length * .42)));
    }
    await Promise.all(jobs);
    // Markierung auf dem Boden für jede benutzbare Stelle
    const ringG = new THREE.RingGeometry(.42, .55, 24), ringM = new THREE.MeshBasicMaterial({ color: 0xffd23b, transparent: true, opacity: .55, toneMapped: false });
    for (const s of this.theme.spots) { const o = new THREE.Mesh(ringG, ringM); o.rotation.x = -Math.PI / 2; o.position.set(s.x, .03, s.z); r.add(o); }
    this.player = await Actor.create(streetLook(playerLook(this.g.save.data)));
    r.add(this.player.root);
  }

  private neon(text: string, color: string, x: number, y: number, z: number, ry: number, w: number) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 96;
    const g2 = c.getContext('2d')!; g2.font = '900 64px system-ui, sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle';
    g2.shadowColor = color; g2.shadowBlur = 18; g2.fillStyle = color; g2.fillText(text, 256, 50, 500);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 96 / 512), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    m.position.set(x, y, z); m.rotation.y = ry; return m;
  }

  enter() {
    this.player.root.position.set(W / 2 - 1.2, 0, DOOR.z);
    this.player.root.rotation.y = -Math.PI / 2;
    this.player.setLook(streetLook(playerLook(this.g.save.data)));
    this.g.hud.show(true); this.g.touch.show(true);
    this.g.city.refreshHud();
    hints([['move', 'Laufen'], ['a', 'Benutzen'], ['x', 'Handy'], ['y', 'Menü']]);
    music(this.theme.music || 'city');
    toast(`${this.theme.icon} ${this.theme.title}`);
  }

  update(dt: number, t: number) {
    const g = this.g, inp = g.engine.input, p = this.player.root.position;
    this.player.update(dt);
    const busy = g.dialog.open || g.menuOpen;
    this.hudT -= dt;
    for (const [i, m] of this.glow.entries()) m.emissiveIntensity = .35 + Math.sin(t * 3 + i) * .25;
    if (!busy) {
      const sv = g.save.data; sv.playMs += dt * 1000;
      if (advance(sv, dt / DAY_SEC * 1440)) toast(`Tag ${sv.day} beginnt.`);
      if (this.hudT <= 0) { this.hudT = .5; g.city.world.setTime(sv.time); g.city.refreshHud(); }
      const mx = inp.move.x, my = inp.move.y;
      if (Math.hypot(mx, my) > .08) {
        p.x += mx * 3.6 * dt; p.z -= my * 3.6 * dt;
        p.x = Math.max(-W / 2 + .5, Math.min(W / 2 - .5, p.x)); p.z = Math.max(-D / 2 + .5, Math.min(D / 2 - .3, p.z));
        for (const b of this.boxes) {
          const dx = p.x - b.x, dz = p.z - b.z, px = b.hx + .35 - Math.abs(dx), pz = b.hz + .35 - Math.abs(dz);
          if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx) * px; else p.z += Math.sign(dz) * pz; }
        }
        this.player.root.rotation.y = Math.atan2(mx, -my);
        this.player.play('walk', .18, .9);
      } else if (this.player.anim === 'walk') this.player.play('idle');
      let best: Spot | null = null, bd = 9;
      for (const s of this.spots) { const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < (s.r || 1.8) && d < bd) { bd = d; best = s; } }
      g.hud.prompt(best ? best.label : null);
      g.touch.label(best ? 'Nutzen' : 'Aktion');
      if (inp.pressed('confirm') && best) { inp.consume('confirm'); this.player.play('interact'); if (best === DOOR) g.leaveInterior(); else g.interiorAct(best, this); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.phone('map'); }
      else if (inp.pressed('menu') || inp.pressed('back')) { inp.consume('menu'); inp.consume('back'); g.pauseMenu(); }
      g.hud.markers(best === DOOR ? [] : [{ id: 'exit', icon: '🚪', label: 'Ausgang', pos: this.exitPos }], this.camera);
    } else { g.hud.prompt(null); g.hud.markers([], this.camera); }
    const k = Math.max(1, 1.25 / this.camera.aspect);
    this.camera.position.set(p.x * .45 / k, 7.6 * (1 + (k - 1) * .6), 9.4 * k + p.z * .2);
    this.camera.lookAt(p.x * .6, .8, p.z * .5 - .6);
  }
}
