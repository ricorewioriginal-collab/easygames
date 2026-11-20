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
import { buildShell, shellTime, furnish, styleOf, type Shell } from './room';

interface Box { x: number; z: number; hx: number; hz: number }
const W = 12, D = 9, K = .9, H = 3.6; // Raum in Metern, KayKit-Möbel 1 Einheit ≈ 1 m (Figur ≈ 1,8 m)
const DOOR: Spot = { id: 'door', label: '🚪 Rausgehen', x: W / 2 - .8, z: 3.4, r: 1.5, act: { k: 'menu' } };

export class InteriorScene implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = .6;
  private player!: Actor;
  private folk: Actor[] = [];
  private boxes: Box[] = [];
  private glow: PBRMaterial[] = [];
  private sg!: ShadowGenerator;
  private shell!: Shell;
  private cam = { yaw: .95, tYaw: .95, pitch: .36, dist: 4.2 };
  private camPos = new Vector3();
  private lookIdle = 9;
  private snap = true;
  readonly spots: Spot[];
  private hudT = 0;
  private exitPos = new Vector3(W / 2 - .2, 3.4, 3.4);
  constructor(private g: Game, readonly theme: Theme, readonly placeId = '') {
    this.spots = [...theme.spots, DOOR];
    this.scene = g.engine.newScene(0x0e0a1a);
    this.camera = g.engine.newCamera(this.scene, 62, .1, 100);
  }

  async build() {
    const sc = this.scene, t = this.theme;
    const dark = styleOf(t) === 'dark';
    this.sg = roomLights(sc, { hemi: dark ? .5 : .85, sun: dark ? .45 : .95, lamp: dark ? 36 : 28, lampCol: t.light, lampPos: [0, 3.2, 0] }).sg;
    const amb = new HemisphericLight('amb', new Vector3(0, -1, 0), sc); amb.intensity = dark ? .16 : .25;
    this.shell = buildShell(sc, t, W, D, H);
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
        const [w, h, d] = it.box;
        if (!furnish(sc, it, t, W, D, this.glow)) {
          const m = pbr(sc, it.c, h < .15 ? .25 : .6, 0, it.e ? { emissive: it.c, ei: it.e } : {});
          const o = box(sc, w, h, d); o.material = m; o.position.set(it.x, (it.y || 0) + h / 2, it.z); o.receiveShadows = true; (o as typeof o & { _pcCast?: boolean })._pcCast = true;
          if (it.e) { m.metadata = { c: it.c }; this.glow.push(m); }
        }
        if (it.col) this.boxes.push({ x: it.x, z: it.z, hx: w / 2, hz: d / 2 });
      } else if ('screen' in it) {
        const o = planeZ(sc, it.screen[0], it.screen[1]); o.material = glow(sc, it.c, 1.2); o.position.set(it.x, it.y, it.z + .02); o.rotation.y = it.ry || 0;
      } else if ('view' in it) {
        // Fenster zur Skyline: Türme mit erleuchteten Fenstern, nachts der Blick aus dem Hochhaus
        const [vw, vh] = it.view, tex = canvasTex(sc, 1024, 256, (g2) => {
          const gr = g2.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#0b1030'); gr.addColorStop(.6, '#3a1d5c'); gr.addColorStop(1, '#ff7a6b'); g2.fillStyle = gr; g2.fillRect(0, 0, 1024, 256);
          let r = 7; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
          for (let i = 0; i < 60; i++) { g2.fillStyle = `rgba(255,255,255,${.3 + rnd() * .6})`; g2.fillRect(rnd() * 1024, rnd() * 110, 2, 2); }
          for (let layer = 0; layer < 2; layer++) for (let x = -10; x < 1024;) {
            const bw = 26 + rnd() * 48, bh = (layer ? 50 : 90) + rnd() * (layer ? 90 : 120); g2.fillStyle = layer ? '#0a0c1c' : '#1a1838'; g2.fillRect(x, 256 - bh, bw, bh);
            for (let wy = 256 - bh + 6; wy < 250; wy += 9) for (let wx = x + 4; wx < x + bw - 5; wx += 8) if (rnd() < (layer ? .45 : .3)) { g2.fillStyle = ['#ffd98a', '#ffe9c0', '#7fd4ff', '#ff9ad5'][Math.floor(rnd() * 4)]; g2.fillRect(wx, wy, 4, 5); }
            x += bw + 2 + rnd() * 6;
          }
          g2.fillStyle = '#0a0c1c'; for (let x = 0; x <= 1024; x += 170) g2.fillRect(x - 4, 0, 8, 256);   // Fensterrahmen
        });
        const o = planeZ(sc, vw, vh); o.material = glow(sc, 0xffffff, .85, { tex }); o.position.set(it.x, it.y, it.z + .02); o.rotation.y = it.ry || 0;
      } else this.neon(it.neon, it.c, it.x, it.y, it.z + .02, it.ry || 0, it.w || Math.min(8, it.neon.length * .42));
    }
    // Bilder an der linken Wand und Pflanzen in freien Ecken: kein Raum bleibt kahl
    const deco = (m: string, x: number, y: number, z: number, r: number, s = 1) => jobs.push(instance(sc, m + '.gltf').then((o) => { o.position.set(x, y, z); o.rotation.y = r; o.scaling.setAll(K * s); }).catch(() => { /* fehlt: egal */ }));
    deco('home/pictureframe_large_B', -W / 2 + .06, 1.9, -1.6, Math.PI / 2); deco('home/pictureframe_medium', -W / 2 + .06, 2, .4, Math.PI / 2); deco('home/pictureframe_large_A', -W / 2 + .06, 1.9, 2.4, Math.PI / 2);
    const clear = (x: number, z: number) => t.items.every((q) => Math.hypot(q.x - x, q.z - z) > 1.3) && t.spots.every((q) => Math.hypot(q.x - x, q.z - z) > 1.2);
    for (const [cx, cz, m] of [[-W / 2 + .7, D / 2 - .7, 'home/cactus_medium_B'], [-W / 2 + .7, -D / 2 + .7, 'home/cactus_medium_A'], [W / 2 - .7, -D / 2 + .7, 'home/cactus_medium_B']] as const)
      if (clear(cx, cz)) { deco(m, cx, 0, cz, 0); this.boxes.push({ x: cx, z: cz, hx: .3, hz: .3 }); }
    await Promise.all(jobs);
    // Markierung auf dem Boden für jede benutzbare Stelle
    const ringM = glow(sc, 0xffd23b, 1.2, { alpha: .55 });
    for (const s of this.theme.spots) { const o = ring(sc, .42, .55, 24); o.material = ringM; o.position.set(s.x, .03, s.z); }
    // Leben im Raum: im Club tanzt die Menge, sonst stehen Gäste zusammen und reden
    const party = t.music === 'club' || t.music === 'show';
    const guests = t.own ? [] : party ? ['Female_Party_01', 'Male_Adult_07', 'Female_Adult_09', 'Male_Adult_04', 'Female_Party_02', 'Male_Adult_02']
      : ['Female_Adult_04', 'Male_Adult_10'];
    const seed = [...t.id].reduce((n, ch) => n + ch.charCodeAt(0), 0);
    const folk = await Promise.all(guests.map((_, i) => Actor.create(sc, { body: guests[(i + seed) % guests.length], rb: guests[(i + seed) % guests.length], palette: 'rainbow', skin: 0 })));
    // freie Stelle: nicht in Möbeln, nicht auf einer benutzbaren Stelle, nicht vor der Tür
    const free = (x: number, z: number) => Math.abs(x) < W / 2 - .8 && Math.abs(z) < D / 2 - .8 && x < W / 2 - 2.2
      && this.boxes.every((b) => Math.abs(x - b.x) > b.hx + .5 || Math.abs(z - b.z) > b.hz + .5)
      && this.spots.every((q) => Math.hypot(q.x - x, q.z - z) > 1.1);
    const cand: [number, number][] = [];
    for (let gz = -3; gz <= 3; gz += .8) for (let gx = -4.6; gx <= 3.6; gx += .9) cand.push([gx, gz]);
    folk.forEach((a, i) => {
      const order = party ? [-.2, 1.8, -1.2, 1] : [-1.6, -.4, 1.2];
      let x = 0, z = 0, ok = false;
      for (const oz of order) { for (const ox of party ? [-2.4, -.2, 2, -1.3, 1.1] : [-1.6, -.5, 2.4, 3.5]) { if (free(ox + (i % 2) * .3, oz)) { x = ox + (i % 2) * .3; z = oz; ok = true; break; } } if (ok) break; }
      if (!ok) { const c = cand.find(([cx, cz]) => free(cx, cz)); if (!c) { a.root.visible = false; return; } [x, z] = c; }
      a.root.position.set(x, 0, z); a.root.rotation.y = party ? (i * 1.7) % (Math.PI * 2) : (i ? -Math.PI / 2 : Math.PI / 2);
      a.play(party ? (['dance1', 'dance2', 'dance3'] as const)[i % 3] : 'talk', 0, .9 + (i % 3) * .08);
      this.folk.push(a); this.boxes.push({ x, z, hx: .25, hz: .25 });
    });
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
    this.player.root.position.set(W / 2 - 2.4, 0, DOOR.z - .9);
    this.player.root.rotation.y = -Math.PI / 2 - .5;
    this.cam.yaw = this.cam.tYaw = .95; this.cam.pitch = .36; this.lookIdle = 0; this.snap = true;
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
    for (const a of this.folk) a.update(dt);
    const busy = g.dialog.open || g.menuOpen;
    this.hudT -= dt;
    for (const [i, m] of this.glow.entries()) m.emissiveColor = col(m.metadata.c, .35 + Math.sin(t * 3 + i) * .25);
    if (!busy) {
      const sv = g.save.data; sv.playMs += dt * 1000;
      if (advance(sv, dt / DAY_SEC * 1440)) toast(`Tag ${sv.day} beginnt.`);
      if (this.hudT <= 0) { this.hudT = .5; g.city.world.setTime(sv.time); g.city.refreshHud(); }
      const mx = inp.move.x, my = inp.move.y, mag = Math.hypot(mx, my);
      if (mag > .08) {
        // Bewegung relativ zur Kamera, wie draußen
        const yaw = this.cam.yaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw), dx = fx * my - fz * mx, dz = fz * my + fx * mx;
        p.x += dx / mag * 3.6 * dt * Math.min(1, mag); p.z += dz / mag * 3.6 * dt * Math.min(1, mag);
        p.x = Math.max(-W / 2 + .5, Math.min(W / 2 - .5, p.x)); p.z = Math.max(-D / 2 + .5, Math.min(D / 2 - .5, p.z));
        for (const b of this.boxes) {
          const dx = p.x - b.x, dz = p.z - b.z, px = b.hx + .35 - Math.abs(dx), pz = b.hz + .35 - Math.abs(dz);
          if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx) * px; else p.z += Math.sign(dz) * pz; }
        }
        { const want = Math.atan2(dx, dz); let dr = want - this.player.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); this.player.root.rotation.y += dr * Math.min(1, dt * 14); }
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
    // Kamera hinter der Figur wie draußen: wischen dreht, beim Laufen folgt sie; an Wänden und Decke rückt sie heran
    const c = this.cam, st = g.save.data.settings, lk = .005 * st.camSpeed;
    if (!busy) {
      c.tYaw -= inp.look.x * lk; c.pitch = Math.max(.08, Math.min(.9, c.pitch + inp.look.y * lk * (st.invertY ? -1 : 1)));
      this.lookIdle = inp.look.x || inp.look.y ? 0 : this.lookIdle + dt;
      if (this.lookIdle > 1.2 && Math.hypot(inp.move.x, inp.move.y) > .3) { let d = this.player.root.rotation.y + Math.PI - c.tYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) < 2.3) c.tYaw += d * Math.min(1, dt * 1.5); }
    }
    c.yaw += (c.tYaw - c.yaw) * Math.min(1, dt * 12);
    const ty = 1.45, vx = Math.sin(c.yaw) * Math.cos(c.pitch) * c.dist, vy = Math.sin(c.pitch) * c.dist, vz = Math.cos(c.yaw) * Math.cos(c.pitch) * c.dist;
    let f = 1;
    const lim = (v: number, room: number) => { if (v > 1e-4 && room / v < f) f = Math.max(.2, room / v); };
    lim(vx, W / 2 - .3 - p.x); lim(-vx, p.x + W / 2 - .3); lim(vz, D / 2 - .3 - p.z); lim(-vz, p.z + D / 2 - .3); lim(vy, H - .3 - ty);
    // wird es eng, schaut die Kamera steiler von oben, statt der Figur im Nacken zu sitzen
    const wx = p.x + vx * f, wy = Math.min(H - .3, ty + vy * f + (1 - f) * 1.5), wz = p.z + vz * f, e = this.snap ? 1 : Math.min(1, dt * 9);
    this.camPos.set(this.camPos.x + (wx - this.camPos.x) * e, this.camPos.y + (wy - this.camPos.y) * e, this.camPos.z + (wz - this.camPos.z) * e); this.snap = false;
    this.camera.position.copyFrom(this.camPos);
    this.camera.setTarget(new Vector3(p.x, ty + (g.engine.aspect < 1 ? .25 : 0), p.z));
    shellTime(this.shell, g.city.world.night, t);
  }
}
