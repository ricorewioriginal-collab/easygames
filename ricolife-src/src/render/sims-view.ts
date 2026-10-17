// Darstellung der Figuren, Haustiere und Autos (Fahrten) plus Sprechblasen/Namen als DOM-Ebene über der 3D-Szene.
// Nur sichtbare, nahe Figuren werden animiert; Modelle werden beim Verschwinden freigegeben (Speicher sparen).
import * as THREE from 'three';
import { LEVEL_H } from '../world/world';
import type { Game } from '../sim/game';
import type { Sim } from '../sim/types';
import { tripPos } from '../sim/actions';
import { HumanModel } from './human';
import { PetModel, type PetAnim } from './pet';
import { FLOOR_Y } from './lot-builder';

const LYING = new Set(['sleep', 'baby']);
const PET_ANIMS = new Set<PetAnim>(['idle', 'walk', 'run', 'sit', 'sleep', 'eat', 'play', 'beg', 'pet']);
const CAR_COLORS = [0xd8574a, 0x3f7fbf, 0xf0c44c, 0x5aa36b, 0xe8e2d6, 0x404a55, 0x9a6ac9, 0xe88b3a];

interface HumanEntry {
  m: HumanModel;
  key: string;
  anim: string;
  t: number;
  proxy: THREE.Mesh;
  ring: THREE.Mesh | null;
}
interface PetEntry {
  m: PetModel;
  anim: string;
  t: number;
  proxy: THREE.Mesh;
}

export class SimsView {
  readonly group = new THREE.Group();
  private humans = new Map<string, HumanEntry>();
  private pets = new Map<string, PetEntry>();
  private cars = new Map<string, THREE.Group>();
  private proxyGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.8, 8).translate(0, 0.9, 0);
  private petProxyGeo = new THREE.BoxGeometry(0.7, 0.6, 0.9).translate(0, 0.3, 0);
  private proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  private ringGeo = new THREE.RingGeometry(0.42, 0.55, 28).rotateX(-Math.PI / 2);
  private ringMat = new THREE.MeshBasicMaterial({ color: 0x8bd4c2, transparent: true, opacity: 0.85, depthWrite: false });
  private carBody = new THREE.BoxGeometry(1.7, 0.7, 3.6).translate(0, 0.55, 0);
  private carTop = new THREE.BoxGeometry(1.5, 0.55, 1.9).translate(0, 1.15, -0.2);
  private carMats = CAR_COLORS.map((c) => new THREE.MeshLambertMaterial({ color: c }));
  private glassMat = new THREE.MeshLambertMaterial({ color: 0x9fc6d8 });
  private labels: HTMLElement;
  private labelEls = new Map<string, HTMLElement>();
  private level = 0;
  private cut = false;
  private v = new THREE.Vector3();
  shadows = true;
  showNames = true;

  constructor(host: HTMLElement) {
    this.group.name = 'Figuren';
    this.labels = document.createElement('div');
    this.labels.className = 'labels';
    host.appendChild(this.labels);
  }

  /** Etagenfilter: Figuren über der angezeigten Etage ausblenden */
  setLevel(level: number, cut: boolean): void {
    this.level = level;
    this.cut = cut;
  }

  private human(s: Sim): HumanEntry {
    let e = this.humans.get(s.id);
    const key = `${s.age}|${s.outfit}|${JSON.stringify(s.look).length}|${s.look.hair}|${s.look.skin}|${s.look.hairColor}`;
    if (!e) {
      const m = new HumanModel(s.look, s.age, s.outfit);
      const proxy = new THREE.Mesh(this.proxyGeo, this.proxyMat);
      proxy.userData.sim = s.id;
      m.object.add(proxy);
      this.group.add(m.object);
      e = { m, key, anim: '', t: 0, proxy, ring: null };
      this.humans.set(s.id, e);
      this.setShadow(m.object);
    } else if (e.key !== key) {
      e.m.setLook(s.look, s.age, s.outfit);
      e.key = key;
      this.setShadow(e.m.object);
    }
    return e;
  }
  private setShadow(o: THREE.Object3D): void {
    o.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).castShadow = this.shadows;
    });
  }

  private dropHuman(id: string): void {
    const e = this.humans.get(id);
    if (!e) return;
    this.group.remove(e.m.object);
    e.m.dispose();
    this.humans.delete(id);
  }

  /** pro Frame */
  update(g: Game, dt: number, camera: THREE.Camera, focus: { x: number; z: number }, selected: string | null, highlight: string | null): void {
    const seen = new Set<string>();
    const carSeen = new Set<string>();
    const maxD = 90;
    for (const s of g.sims.values()) {
      if (s.trip) {
        const tp = s.trip.pts.length ? tripPos(s) : [s.x, s.z, s.rot] as [number, number, number];
        if (tp && Math.hypot(tp[0] - focus.x, tp[1] - focus.z) < maxD * 1.5) {
          carSeen.add(s.id);
          this.car(s.id, tp[0], tp[1], tp[2]);
        }
        continue;
      }
      if (!s.rt.spawned || s.away) continue;
      if (Math.hypot(s.x - focus.x, s.z - focus.z) > maxD) continue;
      seen.add(s.id);
      const e = this.human(s);
      const o = e.m.object;
      const base = s.l * LEVEL_H + FLOOR_Y;
      o.position.set(s.x, base + s.rt.y, s.z);
      o.rotation.y = s.rot;
      o.visible = !(this.cut && s.l > this.level && s.rt.y < LEVEL_H * 0.5);
      if (e.anim !== s.rt.anim) {
        e.anim = s.rt.anim;
        e.t = 0;
      }
      e.t += dt;
      if (o.visible) {
        const seated = s.rt.y > 0.1 && !LYING.has(s.rt.anim) && s.rt.y < 1.2 && s.rt.anim !== 'walk' && s.rt.anim !== 'run';
        e.m.update({ anim: s.rt.anim, t: e.t, emo: s.emo, emoPower: s.emoPower, talking: !!s.rt.speech || s.rt.anim === 'talk', holding: s.rt.holding, seatY: seated ? s.rt.y : undefined }, dt);
      }
      e.m.setHighlight(highlight === s.id);
      if (selected === s.id) {
        if (!e.ring) {
          e.ring = new THREE.Mesh(this.ringGeo, this.ringMat);
          e.ring.position.y = 0.04;
          e.ring.renderOrder = 2;
          o.add(e.ring);
        }
        e.ring.position.y = 0.04 - (s.rt.y > 0.1 && s.rt.y < 1.2 ? s.rt.y : 0);
        e.ring.visible = !LYING.has(s.rt.anim);
      } else if (e.ring) {
        o.remove(e.ring);
        e.ring = null;
      }
    }
    for (const id of [...this.humans.keys()]) if (!seen.has(id)) this.dropHuman(id);
    for (const [id, c] of this.cars)
      if (!carSeen.has(id)) {
        this.group.remove(c);
        this.cars.delete(id);
      }
    // Haustiere
    const pseen = new Set<string>();
    for (const p of g.pets.values()) {
      if (!p.rt.spawned || Math.hypot(p.x - focus.x, p.z - focus.z) > maxD) continue;
      pseen.add(p.id);
      let e = this.pets.get(p.id);
      if (!e) {
        const m = new PetModel(p.kind, p.fur);
        const proxy = new THREE.Mesh(this.petProxyGeo, this.proxyMat);
        proxy.userData.pet = p.id;
        m.object.add(proxy);
        this.group.add(m.object);
        e = { m, anim: '', t: 0, proxy };
        this.pets.set(p.id, e);
        this.setShadow(m.object);
      }
      const a = (PET_ANIMS.has(p.rt.anim as PetAnim) ? p.rt.anim : 'idle') as PetAnim;
      if (e.anim !== a) {
        e.anim = a;
        e.t = 0;
      }
      e.t += dt;
      e.m.object.position.set(p.x, p.l * LEVEL_H + FLOOR_Y, p.z);
      e.m.object.rotation.y = p.rot;
      e.m.object.visible = !(this.cut && p.l > this.level);
      if (e.m.object.visible) e.m.update(a, e.t, dt);
    }
    for (const [id, e] of this.pets)
      if (!pseen.has(id)) {
        this.group.remove(e.m.object);
        e.m.dispose();
        this.pets.delete(id);
      }
    this.updateLabels(g, camera, selected);
  }

  private car(id: string, x: number, z: number, rot: number): void {
    let c = this.cars.get(id);
    if (!c) {
      c = new THREE.Group();
      let h = 0;
      for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
      const body = new THREE.Mesh(this.carBody, this.carMats[h % this.carMats.length]);
      const top = new THREE.Mesh(this.carTop, this.glassMat);
      body.castShadow = this.shadows;
      c.add(body, top);
      this.group.add(c);
      this.cars.set(id, c);
    }
    // weich folgen (Positionen kommen in Spielminuten-Schritten)
    const k = c.userData.init ? 0.35 : 1;
    c.userData.init = 1;
    c.position.x += (x - c.position.x) * k;
    c.position.z += (z - c.position.z) * k;
    let d = rot - c.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    c.rotation.y += d * k;
  }

  /** Sprechblasen, Chat und Namen der ausgewählten Figur (DOM, nur für wenige Figuren) */
  private updateLabels(g: Game, camera: THREE.Camera, selected: string | null): void {
    const W = window.innerWidth,
      H = window.innerHeight;
    const want = new Set<string>();
    for (const [id, e] of this.humans) {
      const s = g.sims.get(id);
      if (!s || !e.m.object.visible) continue;
      const bub = s.rt.bubble && s.rt.bubble.until > g.clock.min ? s.rt.bubble.icon : '';
      const speech = s.rt.speech ?? '';
      const name = (this.showNames && id === selected) || s.guest ? s.first : '';
      if (!bub && !speech && !name) continue;
      this.v.set(s.x, s.l * LEVEL_H + s.rt.y + e.m.height + 0.35, s.z).project(camera);
      if (this.v.z > 1 || this.v.x < -1.1 || this.v.x > 1.1 || this.v.y < -1.1 || this.v.y > 1.1) continue;
      want.add(id);
      let el = this.labelEls.get(id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'lbl';
        this.labels.appendChild(el);
        this.labelEls.set(id, el);
      }
      const txt = speech ? `${name ? name + ': ' : ''}${speech}` : `${bub}${name ? ' ' + name : ''}`;
      if (el.dataset.t !== txt) {
        el.dataset.t = txt;
        el.textContent = txt;
        el.classList.toggle('speech', !!speech);
      }
      el.style.transform = `translate(${((this.v.x + 1) / 2) * W}px, ${((1 - this.v.y) / 2) * H}px) translate(-50%, -100%)`;
    }
    for (const [id, el] of this.labelEls)
      if (!want.has(id)) {
        el.remove();
        this.labelEls.delete(id);
      }
  }

  /** Figur/Haustier unter dem Strahl (über einfache Hüllkörper statt Skinned-Mesh) */
  pick(ray: THREE.Raycaster): { sim?: string; pet?: string; dist: number } | null {
    const objs: THREE.Object3D[] = [];
    for (const e of this.humans.values()) if (e.m.object.visible) objs.push(e.proxy);
    for (const e of this.pets.values()) if (e.m.object.visible) objs.push(e.proxy);
    const hit = ray.intersectObjects(objs, false)[0];
    if (!hit) return null;
    return { sim: hit.object.userData.sim as string | undefined, pet: hit.object.userData.pet as string | undefined, dist: hit.distance };
  }

  /** Bildschirmposition einer Figur (für Menüs) */
  screenPos(g: Game, id: string, camera: THREE.Camera): { x: number; y: number } | null {
    const s = g.sims.get(id);
    if (!s) return null;
    this.v.set(s.x, s.l * LEVEL_H + s.rt.y + 1.2, s.z).project(camera);
    if (this.v.z > 1) return null;
    return { x: ((this.v.x + 1) / 2) * window.innerWidth, y: ((1 - this.v.y) / 2) * window.innerHeight };
  }

  setShadows(on: boolean): void {
    this.shadows = on;
    for (const e of this.humans.values()) this.setShadow(e.m.object);
    for (const e of this.pets.values()) this.setShadow(e.m.object);
  }

  dispose(): void {
    for (const id of [...this.humans.keys()]) this.dropHuman(id);
    for (const e of this.pets.values()) e.m.dispose();
    this.pets.clear();
    this.cars.clear();
    this.group.clear();
    this.labels.remove();
    this.proxyGeo.dispose();
    this.petProxyGeo.dispose();
    this.ringGeo.dispose();
    this.carBody.dispose();
    this.carTop.dispose();
    for (const m of this.carMats) m.dispose();
    this.glassMat.dispose();
    this.proxyMat.dispose();
    this.ringMat.dispose();
  }
}
