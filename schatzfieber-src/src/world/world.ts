/** Die Insel als Ganzes: Szene, Boden, Sammelstellen, Graben/Tauchen/Klettern, Bewohner:innen und Tagesablauf */
import * as THREE from 'three';
import { Environment } from './env';
import { buildTerrain } from './terrain';
import { buildFlora, setWind } from './flora';
import { buildTown, buildBeachHouse, type TownResult } from './town';
import { Colliders } from './collide';
import { height, ground, landMask, poi, LAGOON, roadDist } from './island';
import { rng, smooth } from './noise';
import { T } from './textures';
import type { Ground } from '../game/player';
import { Human } from '../char/human';
import { NPCS } from '../core/npcs';
import { dailyPick, npcSpot, type Save } from '../core/state';
import type { NpcDef } from '../core/types';

export interface Spot3 { x: number; z: number; y: number }
export const CLIMBS = [
  { id: 'eagle', name: 'Adlerhorst', bottom: { x: 151, z: 46 }, top: { x: 166, z: 26 }, loot: 'spyglass' },
  { id: 'rim', name: 'Kraterrand', bottom: { x: 82, z: -95 }, top: { x: 100, z: -114 }, loot: 'skull' },
];

export interface NpcActor { def: NpcDef; body: Human; target: THREE.Vector3 | null; present: boolean; facing: number }

export class World implements Ground {
  readonly scene = new THREE.Scene();
  readonly col = new Colliders();
  readonly env: Environment;
  readonly town: TownResult;
  private house: THREE.Group;
  private houseStage = -1;
  readonly shells: Spot3[] = [];
  readonly coconuts: Spot3[] = [];
  readonly digs: Spot3[] = [];
  readonly dives: Spot3[] = [];
  private shellM: THREE.Mesh[] = [];
  private cocoM: THREE.Mesh[] = [];
  private digM: THREE.Object3D[] = [];
  private diveM: THREE.Object3D[] = [];
  private sparkles: THREE.Sprite[] = [];
  readonly npcs: NpcActor[] = [];
  private t = 0;
  private day = -1;
  active = { shells: [] as number[], coconuts: [] as number[], digs: [] as number[], dives: [] as number[] };

  constructor(renderer: THREE.WebGLRenderer, private quality: number) {
    const { mesh, heightTex } = buildTerrain(quality);
    this.scene.add(mesh);
    this.env = new Environment(this.scene, renderer, heightTex, quality);
    const flora = buildFlora(quality, this.col);
    this.scene.add(flora.group);
    this.town = buildTown(quality, this.col);
    this.scene.add(this.town.group);
    this.house = new THREE.Group();
    this.scene.add(this.house);
    // Sammelstellen (feste Pools, täglich wechselnde Auswahl)
    const r = rng(777);
    for (let i = 0; this.shells.length < 44 && i < 9000; i++) {
      const x = (r() - 0.5) * 520,
        z = (r() - 0.5) * 520,
        h = height(x, z);
      if (h < 0.4 || h > 2.2 || landMask(x, z) > 0.5) continue;
      this.shells.push({ x, z, y: h });
    }
    flora.palms.forEach((p, i) => {
      if (this.coconuts.length >= 34 || i % 4) return;
      const a = i * 1.7,
        x = p.x + Math.cos(a) * 1.3,
        z = p.z + Math.sin(a) * 1.3;
      this.coconuts.push({ x, z, y: height(x, z) });
    });
    for (let i = 0; this.digs.length < 32 && i < 9000; i++) {
      const x = (r() - 0.5) * 480,
        z = (r() - 0.5) * 480,
        h = height(x, z);
      const g = ground(x, z, h);
      if (h < 0.8 || h > 30 || g === 'road' || g === 'ash' || roadDist(x, z) < 5 || Math.hypot(x, z - 145) < 70) continue;
      if (this.digs.some((d) => Math.hypot(d.x - x, d.z - z) < 25)) continue;
      this.digs.push({ x, z, y: h });
    }
    for (let i = 0; this.dives.length < 14 && i < 9000; i++) {
      const a = r() * Math.PI * 2,
        d = 200 + r() * 90,
        x = Math.cos(a) * d,
        z = Math.sin(a) * d,
        h = height(x, z);
      if (h > -3 || h < -12 || Math.hypot(x - 34, z - 214) < 30) continue;
      if (this.dives.some((v) => Math.hypot(v.x - x, v.z - z) < 30)) continue;
      this.dives.push({ x, z, y: 0 });
    }
    const shellMat = new THREE.MeshStandardMaterial({ color: 0xf8e0d0, roughness: 0.4 });
    const shellG = new THREE.ConeGeometry(0.14, 0.2, 9, 1);
    shellG.rotateX(Math.PI / 2);
    shellG.scale(1, 0.45, 1);
    for (const s of this.shells) {
      const m = new THREE.Mesh(shellG, shellMat);
      m.position.set(s.x, s.y + 0.04, s.z);
      m.rotation.y = s.x;
      m.visible = false;
      this.scene.add(m);
      this.shellM.push(m);
    }
    const cocoG = new THREE.SphereGeometry(0.16, 12, 10),
      cocoMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1e, roughness: 0.9 });
    for (const c of this.coconuts) {
      const m = new THREE.Mesh(cocoG, cocoMat);
      m.position.set(c.x, c.y + 0.12, c.z);
      m.castShadow = true;
      m.visible = false;
      this.scene.add(m);
      this.cocoM.push(m);
    }
    const moundG = new THREE.SphereGeometry(0.7, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    moundG.scale(1, 0.3, 1);
    const moundMat = new THREE.MeshStandardMaterial({ map: T.sand(), color: 0xd8c090, roughness: 1 });
    const spark = new THREE.SpriteMaterial({ map: T.glow(), color: 0xfff0a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    for (const d of this.digs) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(moundG, moundMat));
      const s = new THREE.Sprite(spark);
      s.position.y = 0.7;
      s.scale.setScalar(0.9);
      g.add(s);
      this.sparkles.push(s);
      g.position.set(d.x, d.y, d.z);
      g.visible = false;
      this.scene.add(g);
      this.digM.push(g);
    }
    const bub = new THREE.SpriteMaterial({ map: T.glow(), color: 0xc8f4ff, transparent: true, depthWrite: false, opacity: 0.85 });
    for (const d of this.dives) {
      const g = new THREE.Group();
      for (let i = 0; i < 7; i++) {
        const s = new THREE.Sprite(bub);
        s.position.set(Math.cos(i * 2.4) * 0.8, 0.1, Math.sin(i * 2.4) * 0.8);
        s.scale.setScalar(0.35 + (i % 3) * 0.15);
        g.add(s);
      }
      g.position.set(d.x, 0.1, d.z);
      g.visible = false;
      this.scene.add(g);
      this.diveM.push(g);
    }
    // Kletterwände (Lianen) an den Klettersteinen
    const vineMat = new THREE.MeshStandardMaterial({ map: T.leaves(100), alphaTest: 0.5, side: THREE.DoubleSide });
    for (const c of CLIMBS) {
      const y = height(c.bottom.x, c.bottom.z);
      const g = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const v = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 6), vineMat);
        v.position.set(-1.6 + i * 0.8, 3, 0);
        g.add(v);
      }
      const ang = Math.atan2(c.top.x - c.bottom.x, c.top.z - c.bottom.z);
      g.rotation.y = ang;
      g.position.set(c.bottom.x + Math.sin(ang) * 1.2, y, c.bottom.z + Math.cos(ang) * 1.2);
      this.scene.add(g);
      const chestY = height(c.top.x, c.top.z);
      const chest = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 0.7), new THREE.MeshStandardMaterial({ map: T.wood('#8a5a30') }));
      chest.position.set(c.top.x + 1.5, chestY + 0.3, c.top.z);
      chest.name = 'chest_' + c.id;
      chest.castShadow = true;
      this.scene.add(chest);
    }
    // Bewohner:innen
    for (const def of NPCS) {
      const body = new Human(def.look, quality > 0 ? 1 : 0);
      body.root.visible = false;
      this.scene.add(body.root);
      this.npcs.push({ def, body, target: null, present: false, facing: 0 });
    }
  }

  setHouse(stage: number) {
    if (stage === this.houseStage) return;
    this.houseStage = stage;
    this.scene.remove(this.house);
    this.house.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    this.house = buildBeachHouse(stage, this.col, this.town.lampMat);
    this.scene.add(this.house);
  }

  /** Alle Figuren beim nächsten Update direkt an ihren Platz setzen */
  resetNpcs() {
    for (const a of this.npcs) a.present = false;
  }
  /** Tagesauswahl der Sammelstellen */
  newDay(s: Save) {
    this.day = s.day;
    this.active.shells = dailyPick(s.day, this.shells.length, 18, 1);
    this.active.coconuts = dailyPick(s.day, this.coconuts.length, 14, 2);
    this.active.digs = dailyPick(s.day, this.digs.length, 7, 3);
    this.active.dives = dailyPick(s.day, this.dives.length, 5, 4);
    this.syncPicks(s);
  }
  syncPicks(s: Save) {
    const on = (list: number[], i: number, key: string) => list.includes(i) && !s.picked.includes(key + i);
    this.shellM.forEach((m, i) => (m.visible = on(this.active.shells, i, 'shell')));
    this.cocoM.forEach((m, i) => (m.visible = on(this.active.coconuts, i, 'coco')));
    this.digM.forEach((m, i) => (m.visible = on(this.active.digs, i, 'dig')));
    this.diveM.forEach((m, i) => (m.visible = on(this.active.dives, i, 'dive') && !!s.inv.goggles));
    for (const c of CLIMBS) {
      const ch = this.scene.getObjectByName('chest_' + c.id);
      if (ch) ch.visible = !s.flags['climb_' + c.id];
    }
  }

  /** Stelle einer Figur in der Welt */
  spotPos(def: NpcDef, s: Save): THREE.Vector3 | null {
    const sp = npcSpot(s, def);
    if (!sp) return null;
    const p = poi(sp.poi);
    const x = p.x + sp.dx,
      z = p.z + sp.dz;
    const y = Math.max(height(x, z), this.col.floorAt(x, z, 50));
    return new THREE.Vector3(x, y === -Infinity ? 0 : y, z);
  }

  update(dt: number, s: Save, playerPos: THREE.Vector3, busyNpc: string | null) {
    this.t += dt;
    if (s.day !== this.day) this.newDay(s);
    const hours = s.time / 60;
    this.env.update(hours, this.t, playerPos);
    setWind(this.t);
    const n = this.env.night;
    this.town.lampMat.emissiveIntensity = n * 2.2;
    for (const l of this.town.lights) l.intensity = n * (this.quality > 0 ? 18 : 10);
    const beamM = (this.town.beam.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
    beamM.opacity = n * 0.22;
    this.town.beam.rotation.y += dt * 0.6;
    this.town.falls.offset.y -= dt * 0.9;
    const fl = this.town.fire.getObjectByName('flame')!;
    const fireOn = hours >= 18 || hours < 2;
    fl.visible = fireOn;
    fl.scale.set(1, 0.85 + Math.sin(this.t * 14) * 0.15, 1);
    this.town.boats.forEach((b, i) => {
      b.position.y = 0.35 + Math.sin(this.t * 1.1 + i) * 0.12;
      b.rotation.z = Math.sin(this.t * 0.9 + i * 2) * 0.05;
    });
    this.sparkles.forEach((sp, i) => {
      const k = 0.6 + Math.abs(Math.sin(this.t * 3 + i)) * 0.6;
      sp.scale.setScalar(k);
    });
    // Bewohner:innen
    for (const a of this.npcs) {
      if (a.def.id === busyNpc) {
        a.body.update(dt);
        continue;
      }
      const target = this.spotPos(a.def, s);
      if (!target) {
        a.present = false;
        a.body.root.visible = false;
        continue;
      }
      const pos = a.body.root.position;
      const far = (pos.distanceTo(playerPos) > 70 && target.distanceTo(playerPos) > 70) || pos.distanceTo(target) > 30;
      if (!a.present || far) {
        pos.copy(target);
        a.present = true;
      }
      a.body.root.visible = pos.distanceTo(playerPos) < (this.quality > 0 ? 140 : 90);
      const d = Math.hypot(target.x - pos.x, target.z - pos.z);
      if (d > 0.4) {
        // zum Ziel gehen
        const sp = Math.min(1.5, d);
        const ang = Math.atan2(target.x - pos.x, target.z - pos.z);
        pos.x += Math.sin(ang) * sp * dt;
        pos.z += Math.cos(ang) * sp * dt;
        pos.y = Math.max(height(pos.x, pos.z), this.col.floorAt(pos.x, pos.z, pos.y + 0.5));
        a.facing = ang;
        a.body.mode = 'walk';
        a.body.speed = sp;
      } else {
        a.body.mode = 'idle';
        a.body.speed = 0;
        const pd = Math.hypot(playerPos.x - pos.x, playerPos.z - pos.z);
        if (pd < 5) a.facing = Math.atan2(playerPos.x - pos.x, playerPos.z - pos.z);
        else a.facing += Math.sin(this.t * 0.2 + a.def.age) * dt * 0.1;
      }
      let df = a.facing - a.body.root.rotation.y;
      df = Math.atan2(Math.sin(df), Math.cos(df));
      a.body.root.rotation.y += df * Math.min(1, dt * 5);
      if (a.body.root.visible) a.body.update(dt);
    }
  }

  /** Nähe zum Meer für das Rauschen */
  seaNear(p: THREE.Vector3) {
    return smooth(0.75, 0.25, landMask(p.x, p.z));
  }
  inLagoon(x: number, z: number) {
    return Math.hypot(x - LAGOON.x, z - LAGOON.z) < LAGOON.r + 2;
  }

  // ---------- Ground ----------
  height(x: number, z: number) {
    return height(x, z);
  }
  water(x: number, z: number) {
    return this.inLagoon(x, z) ? LAGOON.y : 0;
  }
  solve(p: { x: number; z: number }, r: number, y: number) {
    this.col.resolve(p, r, y);
  }
  floor(x: number, z: number, y: number) {
    return this.col.floorAt(x, z, y);
  }
  camRay(o: THREE.Vector3, d: THREE.Vector3, max: number) {
    return this.col.rayBoxes(o.x, o.y, o.z, d.x, d.y, d.z, max);
  }
  limit(p: THREE.Vector3) {
    const d = Math.hypot(p.x, p.z);
    if (d > 300) {
      p.x *= 300 / d;
      p.z *= 300 / d;
    }
  }
}
