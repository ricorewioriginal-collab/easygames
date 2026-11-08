/** 3D-Darstellung eines Rätselortes (Höhle, Ruine, Gewölbe, Tempel) samt Bodenmodell für die Spielfigur */
import * as THREE from 'three';
import { CELL, Puzzle } from '../core/puzzle';
import type { Ground } from '../game/player';
import { T } from './textures';

const THEMES = {
  cave: { wall: '#6a6058', floor: '#5a5048', fog: 0x0a0806, amb: 0x3a3a50, torch: 0xffa040 },
  ruin: { wall: '#6a7a5a', floor: '#5a6048', fog: 0x060a06, amb: 0x2a3a2a, torch: 0xffb050 },
  cellar: { wall: '#8a7a6a', floor: '#6a5a4a', fog: 0x08070a, amb: 0x34303a, torch: 0xffc070 },
  temple: { wall: '#5a4038', floor: '#4a3a32', fog: 0x120604, amb: 0x4a2a20, torch: 0xff7030 },
};

export class DungeonView implements Ground {
  readonly scene = new THREE.Scene();
  readonly lamp = new THREE.PointLight(0xffd8a0, 0, 20, 1.2);
  private crates = new Map<string, THREE.Mesh>();
  private doors = new Map<string, THREE.Object3D>();
  private plates = new Map<string, THREE.Mesh>();
  private levers = new Map<number, THREE.Object3D>();
  private chests = new Map<string, THREE.Object3D>();
  private vines = new Map<string, THREE.Object3D>();
  private altarGems: THREE.Mesh[] = [];
  private torches: { light: THREE.PointLight; flame: THREE.Mesh; base: number }[] = [];
  private lava: THREE.MeshStandardMaterial | null = null;
  private t = 0;

  constructor(readonly pz: Puzzle, quality: number) {
    const th = THEMES[pz.def.theme];
    const s = this.scene;
    s.background = new THREE.Color(th.fog);
    s.fog = new THREE.Fog(th.fog, 6, 34);
    s.add(new THREE.AmbientLight(th.amb, 3.4), new THREE.HemisphereLight(0x8090b0, 0x302018, 1.2));
    this.lamp.castShadow = false;
    s.add(this.lamp);
    const W = pz.w * CELL,
      H = pz.h * CELL;
    // Boden und Decke
    const ft = T.stone(th.floor, 21).clone();
    ft.repeat.set(pz.w, pz.h);
    ft.needsUpdate = true;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(W / 2 - CELL / 2, 0, H / 2 - CELL / 2);
    floor.receiveShadow = true;
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ color: 0x15110e, roughness: 1 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(W / 2 - CELL / 2, 4.6, H / 2 - CELL / 2);
    s.add(floor, ceil);
    // Wände (instanziert), Lava
    const wallCells: [number, number][] = [],
      lavaCells: [number, number][] = [];
    for (let y = 0; y < pz.h; y++)
      for (let x = 0; x < pz.w; x++) {
        const c = pz.at(x, y);
        if (c === '#') {
          // nur Wände neben begehbaren Feldern
          let edge = false;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (pz.at(x + dx, y + dy) !== '#' && pz.at(x + dx, y + dy) !== ' ') edge = true;
          if (edge) wallCells.push([x, y]);
        } else if (c === '~') lavaCells.push([x, y]);
      }
    const wg = new THREE.BoxGeometry(CELL, 4.6, CELL);
    wg.translate(0, 2.3, 0);
    const wt = T.stone(th.wall, 22).clone();
    wt.repeat.set(1, 1.5);
    wt.needsUpdate = true;
    const walls = new THREE.InstancedMesh(wg, new THREE.MeshStandardMaterial({ map: wt, roughness: 0.92 }), wallCells.length);
    const d = new THREE.Object3D();
    wallCells.forEach(([x, y], i) => {
      d.position.set(x * CELL, 0, y * CELL);
      d.updateMatrix();
      walls.setMatrixAt(i, d.matrix);
    });
    walls.receiveShadow = true;
    s.add(walls);
    if (lavaCells.length) {
      this.lava = new THREE.MeshStandardMaterial({ color: 0xff5a10, emissive: 0xff3a00, emissiveIntensity: 1.6, roughness: 0.6 });
      const lg = new THREE.BoxGeometry(CELL, 0.2, CELL);
      const lm = new THREE.InstancedMesh(lg, this.lava, lavaCells.length);
      lavaCells.forEach(([x, y], i) => {
        d.position.set(x * CELL, -0.05, y * CELL);
        d.updateMatrix();
        lm.setMatrixAt(i, d.matrix);
      });
      s.add(lm);
      const ll = new THREE.PointLight(0xff5a20, 2.5, 22, 1.5);
      const [lx, ly] = lavaCells[Math.floor(lavaCells.length / 2)];
      ll.position.set(lx * CELL, 1.5, ly * CELL);
      s.add(ll);
    }
    const wood = new THREE.MeshStandardMaterial({ map: T.wood('#8a5a30'), roughness: 0.8 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x3a3632, metalness: 0.7, roughness: 0.45 });
    const stone = new THREE.MeshStandardMaterial({ map: T.stone(th.wall, 23), roughness: 0.9 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xffc83a, metalness: 0.9, roughness: 0.25, emissive: 0x3a2a00 });
    // Kisten
    for (const k of pz.crates) {
      const [x, y] = k.split(',').map(Number);
      const m = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2, 2.2), wood);
      m.position.set(x * CELL, 1, y * CELL);
      m.castShadow = m.receiveShadow = true;
      const band = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.22, 2.26), metal);
      band.position.y = 0.6;
      const band2 = band.clone();
      band2.position.y = -0.6;
      m.add(band, band2);
      s.add(m);
      this.crates.set(k, m);
    }
    // Objekte
    let torchN = 0;
    for (const o of pz.objects()) {
      const px = o.x * CELL,
        pzz = o.y * CELL,
        key = Puzzle.key(o.x, o.y);
      if ('abc'.includes(o.ch)) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.18, 20), new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.7, emissive: 0x302000, emissiveIntensity: 0.4 }));
        p.position.set(px, 0.09, pzz);
        s.add(p);
        this.plates.set(key, p);
      } else if ('ABCLKO'.includes(o.ch)) {
        const g = new THREE.Group();
        if (o.ch === 'K' || o.ch === 'O') {
          const slab = new THREE.Mesh(new THREE.BoxGeometry(CELL, 4.6, 0.6), stone);
          slab.position.y = 2.3;
          g.add(slab);
          const sym = new THREE.Mesh(new THREE.CircleGeometry(0.7, 24), new THREE.MeshStandardMaterial({ color: o.ch === 'O' ? 0xff5aa0 : 0xd8c690, emissive: o.ch === 'O' ? 0x801040 : 0x403010, emissiveIntensity: 1 }));
          sym.position.set(0, 2.2, 0.32);
          const sym2 = sym.clone();
          sym2.position.z = -0.32;
          sym2.rotation.y = Math.PI;
          g.add(sym, sym2);
        } else {
          for (let i = -2; i <= 2; i++) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.4, 6), metal);
            bar.position.set(i * 0.55, 2.2, 0);
            g.add(bar);
          }
          const cross = new THREE.Mesh(new THREE.BoxGeometry(CELL, 0.18, 0.18), metal);
          cross.position.y = 3.2;
          const cross2 = cross.clone();
          cross2.position.y = 1.2;
          g.add(cross, cross2);
        }
        // Ausrichtung quer zum Gang
        const horiz = pz.at(o.x - 1, o.y) === '#' && pz.at(o.x + 1, o.y) === '#';
        g.rotation.y = horiz ? 0 : Math.PI / 2;
        g.position.set(px, pz.isOpen(o.x, o.y) ? -4.5 : 0, pzz);
        s.add(g);
        this.doors.set(key, g);
      } else if (o.ch === 'V') {
        const g = new THREE.Group();
        const vm = new THREE.MeshStandardMaterial({ map: T.leaves(100), alphaTest: 0.5, side: THREE.DoubleSide });
        for (let i = 0; i < 6; i++) {
          const v = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 4.4), vm);
          v.position.set(-1.2 + i * 0.5, 2.2, (i % 2) * 0.3 - 0.15);
          v.rotation.y = (i % 3) * 0.6;
          g.add(v);
        }
        g.position.set(px, 0, pzz);
        g.visible = !pz.isOpen(o.x, o.y);
        s.add(g);
        this.vines.set(key, g);
      } else if ('1234'.includes(o.ch)) {
        const g = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), stone);
        base.position.y = 0.5;
        const arm = new THREE.Group();
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), metal);
        stick.position.y = 0.6;
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshStandardMaterial({ color: 0xc8202a, roughness: 0.4 }));
        knob.position.y = 1.2;
        arm.add(stick, knob);
        arm.position.y = 1;
        arm.rotation.x = -0.6;
        g.add(base, arm);
        // Tier-/Richtungszeichen
        const label = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshStandardMaterial({ map: this.labelTex(pz.def.leverNames?.[+o.ch - 1] || o.ch), transparent: true }));
        label.position.set(0, 0.55, 0.51);
        g.add(label);
        g.position.set(px, 0, pzz);
        s.add(g);
        this.levers.set(+o.ch, arm);
      } else if (o.ch === 'H') {
        const st = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.5), new THREE.MeshStandardMaterial({ map: T.glyph(), roughness: 0.85 }));
        st.position.set(px, 1.1, pzz);
        st.castShadow = true;
        s.add(st);
      } else if ('tTZ'.includes(o.ch)) {
        const g = new THREE.Group();
        const big = o.ch !== 't';
        const bw = big ? 1.6 : 1.1;
        const body = new THREE.Mesh(new THREE.BoxGeometry(bw, bw * 0.6, bw * 0.65), wood);
        body.position.y = bw * 0.3;
        const lid = new THREE.Group();
        const lidM = new THREE.Mesh(new THREE.CylinderGeometry(bw * 0.33, bw * 0.33, bw, 12, 1, false, 0, Math.PI), wood);
        lidM.rotation.z = Math.PI / 2;
        lidM.position.z = bw * 0.33;
        lid.add(lidM);
        lid.position.set(0, bw * 0.6, -bw * 0.33);
        lid.name = 'lid';
        const trim = new THREE.Mesh(new THREE.BoxGeometry(bw * 1.02, 0.1, bw * 0.67), gold);
        trim.position.y = bw * 0.58;
        g.add(body, lid, trim);
        if (o.ch === 'Z') {
          for (let i = 0; i < 40; i++) {
            const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 10), gold);
            const a = i * 2.39,
              r = 0.6 + (i % 7) * 0.22;
            coin.position.set(Math.cos(a) * r, 0.02 + (i % 3) * 0.03, Math.sin(a) * r + 0.3);
            coin.rotation.set(Math.random(), 0, Math.random() * 0.4);
            g.add(coin);
          }
          const glow = new THREE.PointLight(0xffd070, 3, 10, 1.5);
          glow.position.y = 1.5;
          g.add(glow);
        }
        if (pz.chests.has(key)) lid.rotation.x = -1.9;
        g.position.set(px, 0, pzz);
        // Truhe zur offenen Seite drehen
        for (const [dx, dy, r] of [[0, 1, 0], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2], [0, -1, Math.PI]] as [number, number, number][])
          if (!pz.solid(o.x + dx, o.y + dy) || pz.at(o.x + dx, o.y + dy) === '.') {
            g.rotation.y = r;
            break;
          }
        s.add(g);
        this.chests.set(key, g);
      } else if (o.ch === 'Q') {
        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 1.2, 16), stone);
        ped.position.set(px, 0.6, pzz);
        s.add(ped);
        for (let i = 0; i < 3; i++) {
          const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), new THREE.MeshStandardMaterial({ color: [0xffc83a, 0xc0d0ff, 0xfff0a0][i], emissive: 0x000000, emissiveIntensity: 2, metalness: 0.5, roughness: 0.2 }));
          gem.position.set(px + Math.cos((i / 3) * Math.PI * 2) * 0.45, 1.35, pzz + Math.sin((i / 3) * Math.PI * 2) * 0.45);
          gem.visible = false;
          s.add(gem);
          this.altarGems.push(gem);
        }
      } else if (o.ch === 'S') {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.2, 32), new THREE.MeshBasicMaterial({ color: 0x9adfff, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(px, 0.03, pzz);
        s.add(ring);
        const light = new THREE.PointLight(0x9adfff, 1.2, 8, 2);
        light.position.set(px, 2.5, pzz);
        s.add(light);
      }
    }
    // Fackeln an Wänden neben Bodenfeldern
    const maxT = quality > 1 ? 10 : quality > 0 ? 7 : 4;
    for (let y = 1; y < pz.h - 1 && torchN < maxT * 3; y += 3)
      for (let x = 1; x < pz.w - 1; x += 4) {
        if (pz.at(x, y) !== '.' || torchN >= maxT) continue;
        for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
          if (pz.at(x + dx, y + dy) !== '#') continue;
          const tx = x * CELL + dx * (CELL / 2 - 0.15),
            tz = y * CELL + dy * (CELL / 2 - 0.15);
          const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.6, 6), metal);
          holder.position.set(tx, 2.6, tz);
          const flame = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.4, 8), new THREE.MeshBasicMaterial({ color: th.torch, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
          flame.position.set(tx, 3.05, tz);
          const light = new THREE.PointLight(th.torch, 1.6, 12, 1.6);
          light.position.set(tx - dx * 0.4, 3.1, tz - dy * 0.4);
          s.add(holder, flame, light);
          this.torches.push({ light, flame, base: 1.6 });
          torchN++;
          break;
        }
      }
  }

  private labelTex(text: string) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d')!;
    x.fillStyle = 'rgba(30,24,18,.75)';
    x.fillRect(0, 0, 128, 128);
    x.fillStyle = '#e8d8a0';
    x.font = 'bold 22px Georgia, serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(text, 64, 64, 120);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /** Kiste verschoben (Animation läuft in update) */
  moveCrate(from: string, to: string) {
    const m = this.crates.get(from);
    if (!m) return;
    this.crates.delete(from);
    const [x, y] = to.split(',').map(Number);
    m.userData.tx = x * CELL;
    m.userData.tz = y * CELL;
    this.crates.set(to, m);
    this.plateGlow();
  }
  /** Nach dem Zurücksetzen alle Kisten neu verteilen */
  resetCrates() {
    const meshes = [...this.crates.values()];
    this.crates.clear();
    [...this.pz.crates].forEach((k, i) => {
      const m = meshes[i];
      const [x, y] = k.split(',').map(Number);
      m.userData.tx = x * CELL;
      m.userData.tz = y * CELL;
      this.crates.set(k, m);
    });
    this.plateGlow();
  }
  plateGlow() {
    for (const [k, p] of this.plates) (p.material as THREE.MeshStandardMaterial).emissiveIntensity = this.pz.crates.has(k) ? 2.2 : 0.4;
  }
  setLever(n: number, down: boolean) {
    const a = this.levers.get(n);
    if (a) a.userData.target = down ? 0.6 : -0.6;
  }
  resetLevers() {
    for (const a of this.levers.values()) a.userData.target = -0.6;
  }
  openChest(key: string) {
    const c = this.chests.get(key)?.getObjectByName('lid');
    if (c) c.userData.target = -1.9;
  }
  cutVine(key: string) {
    const v = this.vines.get(key);
    if (v) v.userData.cut = 1;
  }
  showGems(n: number) {
    this.altarGems.forEach((g, i) => {
      g.visible = i < n;
      (g.material as THREE.MeshStandardMaterial).emissive.set(i < n ? 0x806020 : 0);
    });
  }

  update(dt: number, player: THREE.Vector3, lampOn: boolean) {
    this.t += dt;
    for (const [k, g] of this.doors) {
      const [x, y] = k.split(',').map(Number);
      const ty = this.pz.isOpen(x, y) ? -4.5 : 0;
      g.position.y += (ty - g.position.y) * Math.min(1, dt * 2);
    }
    for (const m of this.crates.values()) {
      if (m.userData.tx === undefined) continue;
      m.position.x += (m.userData.tx - m.position.x) * Math.min(1, dt * 8);
      m.position.z += (m.userData.tz - m.position.z) * Math.min(1, dt * 8);
    }
    for (const a of this.levers.values()) if (a.userData.target !== undefined) a.rotation.x += (a.userData.target - a.rotation.x) * Math.min(1, dt * 10);
    for (const c of this.chests.values()) {
      const lid = c.getObjectByName('lid');
      if (lid?.userData.target !== undefined) lid.rotation.x += (lid.userData.target - lid.rotation.x) * Math.min(1, dt * 4);
    }
    for (const v of this.vines.values())
      if (v.userData.cut) {
        v.scale.y = Math.max(0.01, v.scale.y - dt * 2);
        if (v.scale.y <= 0.02) v.visible = false;
      }
    for (const tc of this.torches) {
      const f = 0.85 + Math.sin(this.t * 13 + tc.base * 7) * 0.08 + Math.sin(this.t * 23) * 0.05;
      tc.light.intensity = tc.base * f;
      tc.flame.scale.set(1, f, 1);
    }
    if (this.lava) this.lava.emissiveIntensity = 1.4 + Math.sin(this.t * 2) * 0.3;
    this.lamp.position.set(player.x, player.y + 2.2, player.z);
    this.lamp.intensity = lampOn ? 6 : 1.2;
  }

  // ---------- Ground ----------
  height() {
    return 0;
  }
  water() {
    return -Infinity;
  }
  floor() {
    return -Infinity;
  }
  solve(p: { x: number; z: number }, r: number) {
    const [cx, cy] = Puzzle.cellOf(p.x, p.z);
    const h = CELL / 2;
    for (let iy = cy - 1; iy <= cy + 1; iy++)
      for (let ix = cx - 1; ix <= cx + 1; ix++) {
        if (!this.pz.solid(ix, iy)) continue;
        // Objekte (Hebel, Inschrift, Truhen) sind kleiner als ganze Felder
        const c = this.pz.at(ix, iy);
        const half = '1234HtTQZ'.includes(c) ? 0.75 : h;
        const bx = ix * CELL,
          bz = iy * CELL;
        const qx = Math.max(bx - half, Math.min(bx + half, p.x)),
          qz = Math.max(bz - half, Math.min(bz + half, p.z));
        const dx = p.x - qx,
          dz = p.z - qz,
          d = Math.hypot(dx, dz);
        if (d < r) {
          if (d > 1e-5) {
            p.x = qx + (dx / d) * r;
            p.z = qz + (dz / d) * r;
          } else {
            p.x += r;
          }
        }
      }
  }
  camRay(o: THREE.Vector3, d: THREE.Vector3, max: number): number {
    for (let t = 0.3; t < max; t += 0.2) {
      const [cx, cy] = Puzzle.cellOf(o.x + d.x * t, o.z + d.z * t);
      const c = this.pz.at(cx, cy);
      if (c === '#' || o.y + d.y * t > 4.3) return Math.max(0.5, t - 0.35);
      if ('ABCLKO'.includes(c) && !this.pz.isOpen(cx, cy)) return Math.max(0.5, t - 0.35);
    }
    return max;
  }
}
