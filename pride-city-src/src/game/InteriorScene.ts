/* Innenraum eines Hauses (Laden, Treffpunkt oder Wohnung, Babylon.js): Einrichtung und Stellen aus interiors.ts,
   Bewegung wie in der Wohnung. */
import type { GameScene } from '../engine/Engine';
import { Vector3, HemisphericLight, type FreeCamera, type Scene, type PBRMaterial, type ShadowGenerator, col } from '../engine/bjs';
import { instance } from '../engine/Assets';
import { planeZ, ground, box, ring, pbr, glow, canvasTex } from '../engine/geo';
import { Actor, playerLook, streetLook } from './Actor';
import type { Game } from './Game';
import { hints, toast } from '../ui/ui';
import { advance, DAY_SEC } from './life';
import { music } from '../engine/Audio';
import type { Spot, Theme } from './interiors';
import { roomLights, collectCasters } from './HomeScene';

interface Box { x: number; z: number; hx: number; hz: number }
const W = 12, D = 9, K = 1.6;
const DOOR: Spot = { id: 'door', label: '🚪 Rausgehen', x: W / 2 - .8, z: 3.4, r: 1.5, act: { k: 'menu' } };

export class InteriorScene implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = .6;
  private player!: Actor;
  private boxes: Box[] = [];
  private glow: PBRMaterial[] = [];
  private sg!: ShadowGenerator;
  readonly spots: Spot[];
  private hudT = 0;
  private exitPos = new Vector3(W / 2 - .2, 3.4, 3.4);
  constructor(private g: Game, readonly theme: Theme, readonly placeId = '') {
    this.spots = [...theme.spots, DOOR];
    this.scene = g.engine.newScene(0x0e0a1a);
    this.camera = g.engine.newCamera(this.scene, 50, .1, 100);
  }

  async build() {
    const sc = this.scene, t = this.theme;
    this.sg = roomLights(sc, { hemi: 1.05, sun: 1.2, lamp: 26, lampCol: t.light, lampPos: [0, 3.4, 0] }).sg;
    const amb = new HemisphericLight('amb', new Vector3(0, -1, 0), sc); amb.intensity = .25;
    const floor = ground(sc, W, D); floor.material = pbr(sc, t.floor, .75); floor.receiveShadows = true;
    const wallM = pbr(sc, t.wall, .9);
    const wall = (w: number, d: number, x: number, z: number) => { const m = box(sc, w, 4, d); m.material = wallM; m.position.set(x, 2, z); m.receiveShadows = true; };
    wall(W, .2, 0, -D / 2); wall(.2, D, -W / 2, 0); wall(.2, D, W / 2, 0);
    // Tür rechts mit Leuchtschild
    const dx = W / 2 - .12, dz = DOOR.z;
    const door = box(sc, .06, 2.5, 1.3); door.material = pbr(sc, 0x7a3fb0, .6); door.position.set(dx, 1.25, dz);
    this.neon('🚪 AUSGANG', '#5dff9b', dx - .08, 3, dz, -Math.PI / 2, 1.2);
    const mat = ground(sc, 1, 1.3); mat.material = pbr(sc, 0xff4fa3, 1); mat.position.set(dx - .6, .015, dz); mat.receiveShadows = true;

    const jobs: Promise<unknown>[] = [];
    for (const it of t.items) {
      if ('m' in it) jobs.push(instance(sc, it.m + '.gltf').then((o) => {
        o.position.set(it.x, it.y || 0, it.z); o.rotation.y = it.r || 0; o.scaling.setAll(K * (it.s || 1));
        if (it.col) { const b = o.getHierarchyBoundingVectors(true); this.boxes.push({ x: (b.min.x + b.max.x) / 2, z: (b.min.z + b.max.z) / 2, hx: Math.max(.2, (b.max.x - b.min.x) / 2 - .08), hz: Math.max(.2, (b.max.z - b.min.z) / 2 - .08) }); }
      }).catch(() => { /* Modell fehlt: Raum bleibt nutzbar */ }));
      else if ('box' in it) {
        const [w, h, d] = it.box, m = pbr(sc, it.c, .7, 0, it.e ? { emissive: it.c, ei: it.e } : {});
        const o = box(sc, w, h, d); o.material = m; o.position.set(it.x, (it.y || 0) + h / 2, it.z); o.receiveShadows = true; (o as typeof o & { _pcCast?: boolean })._pcCast = true;
        if (it.e) { m.metadata = { c: it.c }; this.glow.push(m); }
        if (it.col) this.boxes.push({ x: it.x, z: it.z, hx: w / 2, hz: d / 2 });
      } else if ('screen' in it) {
        const o = planeZ(sc, it.screen[0], it.screen[1]); o.material = glow(sc, it.c, 1.2); o.position.set(it.x, it.y, it.z + .02); o.rotation.y = it.ry || 0;
      } else this.neon(it.neon, it.c, it.x, it.y, it.z + .02, it.ry || 0, it.w || Math.min(8, it.neon.length * .42));
    }
    await Promise.all(jobs);
    // Markierung auf dem Boden für jede benutzbare Stelle
    const ringM = glow(sc, 0xffd23b, 1.2, { alpha: .55 });
    for (const s of this.theme.spots) { const o = ring(sc, .42, .55, 24); o.material = ringM; o.position.set(s.x, .03, s.z); }
    this.player = await Actor.create(sc, streetLook(playerLook(this.g.save.data)));
    collectCasters(sc, this.sg);
  }

  private neon(text: string, color: string, x: number, y: number, z: number, ry: number, w: number) {
    const sc = this.scene;
    const tex = canvasTex(sc, 512, 96, (g2) => { g2.font = '900 64px system-ui, sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.shadowColor = color; g2.shadowBlur = 18; g2.fillStyle = color; g2.fillText(text, 256, 50, 500); }, true);
    const m = planeZ(sc, w, w * 96 / 512); m.material = glow(sc, 0xffffff, 1.6, { tex });
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
    for (const [i, m] of this.glow.entries()) m.emissiveColor = col(m.metadata.c, .35 + Math.sin(t * 3 + i) * .25);
    if (!busy) {
      const sv = g.save.data; sv.playMs += dt * 1000;
      if (advance(sv, dt / DAY_SEC * 1440)) toast(`Tag ${sv.day} beginnt.`);
      if (this.hudT <= 0) { this.hudT = .5; g.city.world.setTime(sv.time); g.city.refreshHud(); }
      const mx = inp.move.x, my = inp.move.y, mag = Math.hypot(mx, my);
      if (mag > .08) {
        p.x += mx * 3.6 * dt; p.z -= my * 3.6 * dt;
        p.x = Math.max(-W / 2 + .5, Math.min(W / 2 - .5, p.x)); p.z = Math.max(-D / 2 + .5, Math.min(D / 2 - .3, p.z));
        for (const b of this.boxes) {
          const dx = p.x - b.x, dz = p.z - b.z, px = b.hx + .35 - Math.abs(dx), pz = b.hz + .35 - Math.abs(dz);
          if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx) * px; else p.z += Math.sign(dz) * pz; }
        }
        this.player.root.rotation.y = Math.atan2(mx, -my);
        this.player.play('walk', .18, Math.max(1, 3.6 * Math.min(1, mag) / 1.02 * .55));
      } else if (this.player.anim === 'walk') this.player.play('idle');
      let best: Spot | null = null, bd = 9;
      for (const s of this.spots) { const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < (s.r || 1.8) && d < bd) { bd = d; best = s; } }
      g.hud.prompt(best ? best.label : null);
      g.touch.label(best ? 'Nutzen' : 'Aktion');
      if (inp.pressed('confirm') && best) { inp.consume('confirm'); this.player.play('interact'); if (best === DOOR) g.leaveInterior(); else g.interiorAct(best, this); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.phone('map'); }
      else if (inp.pressed('menu') || inp.pressed('back')) { inp.consume('menu'); inp.consume('back'); g.pauseMenu(); }
      g.hud.markers(best === DOOR ? [] : [{ id: 'exit', icon: '🚪', label: 'Ausgang', pos: this.exitPos }], (q) => g.engine.project(q));
    } else { g.hud.prompt(null); g.hud.markers([]); }
    const k = Math.max(1, 1.25 / g.engine.aspect);
    this.camera.position.set(p.x * .45 / k, 7.6 * (1 + (k - 1) * .6), 9.4 * k + p.z * .2);
    this.camera.setTarget(new Vector3(p.x * .6, .8, p.z * .5 - .6));
  }
}
