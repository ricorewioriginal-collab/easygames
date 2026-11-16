/* Stadt-Szene: Rainbow City zum Herumlaufen (Spielmodus) und als Kulisse fürs Titelmenü (Kameraflug, tanzende Leute). */
import * as THREE from 'three';
import type { GameScene } from '../engine/Engine';
import { Actor } from './Actor';
import { World } from './World';
import { NPCS, goal, talk, poi as storyPoi, type NpcDef, type StoryCtx } from './story';
import type { Game } from './Game';
import { sfx, music } from '../engine/Audio';
import { toast, hints } from '../ui/ui';
import { rollEvent, testDue, post } from './social';
import { advance, minutesUntil, change, track, mood, moodIcon, NEEDS, clock as lifeClock, hour as lifeHour, DAY_SEC } from './life';
import type { Marker } from '../ui/Hud';

interface Npc { def: NpcDef; a: Actor; wp: number; wait: number; talking: boolean }

export const STICKERS: Array<[number, number]> = [[-15, 24], [45, 52], [-50, -50], [52, -30], [-45, 45], [18, -52], [-28, -32], [28, 28]];

export class CityScene implements GameScene {
  root = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, 1, .1, 400);
  bloom = 0;
  world!: World;
  player!: Actor;
  mode: 'title' | 'play' = 'title';
  private npcs: Npc[] = [];
  private crowd: Actor[] = [];
  private cam = { yaw: Math.PI, pitch: .38, dist: 7.5, tYaw: Math.PI };
  private camPos = new THREE.Vector3();
  private stickerMeshes: THREE.Mesh[] = [];
  private near: { kind: 'npc' | 'poi'; id: string; label: string } | null = null;
  private stepT = 0;
  private warnT = 30;
  private evT = 90;
  private hudT = 0;
  private titleT = 0;

  constructor(private g: Game) {}

  async build() {
    this.world = new World(this.root);
    await this.world.build();
    const s = this.g.save.data;
    this.player = await Actor.create({ body: s.body, palette: s.palette, skin: s.skin, cape: !!s.flags.cape, hat: !!s.flags.hat });
    this.root.add(this.player.root);
    await Promise.all(NPCS.map(async (d) => {
      const a = await Actor.create(d.look);
      a.root.position.set(d.x, .1, d.z); a.root.rotation.y = d.yaw ?? 0;
      if (d.anim) a.play(d.anim, 0);
      this.root.add(a.root);
      this.npcs.push({ def: d, a, wp: 0, wait: Math.random() * 3, talking: false });
      if (d.anim === 'sit') a.root.position.y = -.25;
    }));
    // Tanzende Menge auf dem Platz (Titelbild und Abendstimmung)
    const looks = ['rainbow', 'trans', 'bi', 'pan', 'gay', 'progress'];
    const bodies = ['Rogue', 'Knight', 'Barbarian', 'Rogue_Hooded', 'Mage', 'Rogue'];
    for (let i = 0; i < 6; i++) {
      const a = await Actor.create({ body: bodies[i], palette: looks[i], skin: i % 6 });
      const ang = (i / 6) * Math.PI * 2;
      a.root.position.set(-15 + Math.cos(ang) * 4.6, .1, 15 + Math.sin(ang) * 4.6);
      a.root.rotation.y = -ang - Math.PI / 2;
      a.play(i % 2 ? 'cheer' : 'dance1', 0, .9 + i * .05);
      this.root.add(a.root); this.crowd.push(a);
    }
    this.buildStickers();
  }

  /* ---------- Sticker zum Sammeln ---------- */
  private buildStickers() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d')!;
    const grd = x.createConicGradient(0, 64, 64);
    ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787', '#e40303'].forEach((col, i) => grd.addColorStop(i / 6, col));
    x.fillStyle = grd; x.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 26 : 60, a = (i / 10) * Math.PI * 2 - Math.PI / 2; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
    x.closePath(); x.fill(); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, toneMapped: false });
    const geo = new THREE.PlaneGeometry(1.2, 1.2);
    STICKERS.forEach(([sx, sz], i) => {
      const mesh = new THREE.Mesh(geo, m); mesh.position.set(sx, 1.4, sz); mesh.userData.i = i;
      this.root.add(mesh); this.stickerMeshes.push(mesh);
    });
    this.refreshStickers();
  }
  refreshStickers() { this.stickerMeshes.forEach((m) => (m.visible = !this.g.save.data.goals.includes('sticker' + m.userData.i))); }

  /* ---------- Modus ---------- */
  setTitle() {
    this.mode = 'title';
    this.player.root.visible = false;
    this.crowd.forEach((a) => (a.root.visible = true));
    this.titleT = 0;
    this.world.setTime(.55);
    this.g.hud.show(false); this.g.touch.show(false);
    music('title');
  }
  setPlay() {
    const s = this.g.save.data;
    this.mode = 'play';
    this.player.root.visible = true;
    this.player.setLook({ body: s.body, palette: s.palette, skin: s.skin, cape: !!s.flags.cape, hat: !!s.flags.hat });
    this.player.root.position.set(s.pos.x, .1, s.pos.z);
    this.player.root.rotation.y = s.pos.yaw;
    this.cam.yaw = this.cam.tYaw = s.pos.yaw + Math.PI;
    this.crowd.forEach((a) => (a.root.visible = this.world.night > .5));
    this.refreshStickers();
    this.g.hud.show(true); this.g.touch.show(true);
    hints([['move', 'Laufen'], ['a', 'Aktion'], ['cam', 'Kamera'], ['y', 'Menü']]);
    music('city');
    this.snapCam();
    this.refreshHud();
  }
  /* Ersetzt die Spielfigur nach dem Editor (andere Körperform = anderes Modell) */
  async rebuildPlayer() {
    const s = this.g.save.data;
    if (this.player.look.body === s.body) return;
    this.root.remove(this.player.root);
    this.player = await Actor.create({ body: s.body, palette: s.palette, skin: s.skin, cape: !!s.flags.cape, hat: !!s.flags.hat });
    this.root.add(this.player.root);
  }

  hour() { return lifeHour(this.g.save.data); }
  clock() { return lifeClock(this.g.save.data); }

  /* ---------- Geschichte ---------- */
  ctx(): StoryCtx {
    const g = this.g, s = g.save.data;
    return {
      s,
      say: (lines, done) => g.dialog.say(lines, () => { done?.(); this.refreshHud(); g.save.write(); }),
      toast: (t) => toast(t),
      reward: (m, r, why) => { s.money += m; s.rep += r; if (m || r) { toast(`${why}: ${m ? '+' + m + ' € ' : ''}${r ? '+' + r + ' Ruf' : ''}`); sfx('coin'); } this.refreshHud(); },
      step: (n) => { s.step = n; g.save.write(); this.refreshHud(); },
      skipToHour: (h) => { g.fade(() => { g.pass(minutesUntil(s, h)); toast(`Es ist jetzt ${this.clock()} Uhr.`); }); },
      hour: () => this.hour(),
      dance: () => g.goDance(true),
      chapterDone: () => { s.chapter = 2; s.step = 0; g.save.write(); g.chapterCard('Kapitel 1 abgeschlossen', 'Ankommen', 'Das Regenbogenhaus hat neue Hoffnung – und du hast Freund*innen gefunden. Kapitel 2 „Wurzeln schlagen“ folgt.'); this.refreshHud(); },
      enterHome: (after) => g.enterHome(after),
    };
  }

  refreshHud() {
    if (this.mode !== 'play' && this.g.where !== 'home') return;
    const s = this.g.save.data, gl = goal(s);
    if (this.g.where === 'home') this.g.hud.goal('Zuhause', 'Deine Wohnung', s.chapter === 1 && s.step === 2 ? 'Schau dich um.' : `Ziel: ${gl.title}`);
    else this.g.hud.goal(s.chapter === 1 ? 'Kapitel 1 · Ankommen' : 'Rainbow City', gl.title, gl.sub);
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    this.g.hud.stats([`${days[(s.day - 1) % 7]} ${this.clock()}`, `💶 ${s.money} €`, `${moodIcon(mood(s))} ${Math.round(mood(s))}`]);
    this.g.hud.needs(s.needs);
  }

  private markers(): Marker[] {
    const s = this.g.save.data, gl = goal(s), out: Marker[] = [];
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    if (gl.npc) { const n = this.npcs.find((x) => x.def.id === gl.npc); if (n) out.push({ id: 'g', icon: '⭐', label: n.def.name, pos: n.a.root.position.clone().setY(2.6) }); }
    if (gl.poi) { const p = this.world.pois.find((x) => x.id === gl.poi); if (p) out.push({ id: 'g', icon: '⭐', label: p.name, pos: v(p.x, 4, p.z) }); }
    if (s.chapter === 1 && s.step === 4) for (const n of this.npcs) if (n.def.petition && s.flags['sig_' + n.def.id] === undefined) out.push({ id: 'p' + n.def.id, icon: '✍️', pos: n.a.root.position.clone().setY(2.5) });
    return out;
  }

  /* ---------- Interaktion ---------- */
  private findNear() {
    const p = this.player.root.position;
    let best: typeof this.near = null, bd = 1e9;
    for (const n of this.npcs) {
      if (!n.a.root.visible) continue;
      const d = n.a.root.position.distanceTo(p);
      if (d < 2.6 && d < bd) { bd = d; best = { kind: 'npc', id: n.def.id, label: 'Sprechen mit ' + n.def.name }; }
    }
    if (!best) for (const q of this.world.pois) {
      if (q.id === 'plaza' || q.id === 'park') continue;
      const d = Math.hypot(q.x - p.x, q.z - p.z);
      if (d < q.r && d < bd) { bd = d; best = { kind: 'poi', id: q.id, label: q.icon + ' ' + q.name }; }
    }
    this.near = best;
    this.g.hud.prompt(best ? best.label : null);
    this.g.touch.label(best ? (best.kind === 'npc' ? 'Reden' : 'Rein') : 'Aktion');
  }

  interact() {
    if (!this.near || this.g.dialog.open) return;
    const c = this.ctx();
    if (this.near.kind === 'npc') {
      const n = this.npcs.find((x) => x.def.id === this.near!.id)!;
      n.talking = true;
      if (n.def.anim !== 'sit') { n.a.play('idle'); n.a.root.rotation.y = Math.atan2(this.player.root.position.x - n.a.root.position.x, this.player.root.position.z - n.a.root.position.z); }
      this.player.root.rotation.y = Math.atan2(n.a.root.position.x - this.player.root.position.x, n.a.root.position.z - this.player.root.position.z);
      this.player.play('idle');
      const end = () => { n.talking = false; };
      const prevSay = c.say; c.say = (l, d) => prevSay(l, () => { end(); d?.(); });
      talk(c, n.def.id);
      if (!this.g.dialog.open) end();
      const s = this.g.save.data, r = (s.rel[n.def.id] ||= { f: 0, last: 0 });
      if (r.last !== s.day) { r.last = s.day; r.f = Math.min(100, r.f + 6); change(s, { social: 10, fun: 2 }); this.g.done(track(s, 'talk')); }
      return;
    }
    if (storyPoi(c, this.near.id)) return;
    if (this.near.id === 'home') { this.g.enterHome(); return; }
    this.g.placeMenu(this.near.id);
  }

  /* ---------- Kamera ---------- */
  private snapCam() { this.updateCam(1, true); }
  private updateCam(dt: number, snap = false) {
    const inp = this.g.engine.input, st = this.g.save.data.settings;
    const k = .005 * st.camSpeed;
    this.cam.tYaw -= inp.look.x * k;
    this.cam.pitch = THREE.MathUtils.clamp(this.cam.pitch + inp.look.y * k * (st.invertY ? -1 : 1), .08, 1.1);
    this.cam.dist = THREE.MathUtils.clamp(this.cam.dist + inp.zoom * .8, 3.5, 14);
    if (inp.held('tabL')) this.cam.tYaw += dt * 2.2;
    if (inp.held('tabR')) this.cam.tYaw -= dt * 2.2;
    if (inp.pressed('camReset')) this.cam.tYaw = this.player.root.rotation.y + Math.PI;
    this.cam.yaw += (this.cam.tYaw - this.cam.yaw) * Math.min(1, dt * 12);
    const p = this.player.root.position;
    const tgt = new THREE.Vector3(p.x, p.y + 1.5, p.z);
    const want = new THREE.Vector3(
      tgt.x + Math.sin(this.cam.yaw) * Math.cos(this.cam.pitch) * this.cam.dist,
      tgt.y + Math.sin(this.cam.pitch) * this.cam.dist,
      tgt.z + Math.cos(this.cam.yaw) * Math.cos(this.cam.pitch) * this.cam.dist);
    if (snap) this.camPos.copy(want); else this.camPos.lerp(want, Math.min(1, dt * 8));
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(tgt);
  }

  /* ---------- Bild für Bild ---------- */
  update(dt: number, t: number) {
    const g = this.g, s = g.save.data;
    this.bloom = .35 + this.world.night * .5;
    // Figuren nur in der Nähe animieren (Leistung)
    const ref = this.mode === 'play' ? this.player.root.position : new THREE.Vector3(-15, 0, 15);
    for (const n of this.npcs) {
      const near = n.a.root.position.distanceToSquared(ref) < 70 * 70;
      if (near) n.a.update(dt);
      if (!n.talking && n.def.walk) this.walkNpc(n, dt);
      if (n.def.night) n.a.root.visible = this.world.night > .4;
    }
    for (const a of this.crowd) if (a.root.visible) a.update(dt);
    this.stickerMeshes.forEach((m) => { m.rotation.y = t * 2; m.position.y = 1.4 + Math.sin(t * 3 + m.userData.i) * .15; });

    if (this.mode === 'title') {
      this.titleT += dt;
      const a = this.titleT * .07;
      this.camera.position.set(-15 + Math.sin(a) * 11, 3.6 + Math.sin(a * .7) * .8, 15 + Math.cos(a) * 11);
      this.camera.lookAt(-15 - Math.sin(a) * 2, 1.6, 15 - Math.cos(a) * 2);
      this.world.follow(new THREE.Vector3(-15, 0, 15));
      this.world.update(dt, t);
      return;
    }

    // Spielzeit läuft nur ohne Dialog und Menü
    const busy = g.dialog.open || g.menuOpen;
    if (!busy) {
      s.playMs += dt * 1000;
      if (advance(s, dt / DAY_SEC * 1440)) toast(`Tag ${s.day} beginnt.`);
      this.world.setTime(s.time);
      this.warnT -= dt; this.evT -= dt;
      if (this.evT <= 0) {
        this.evT = 120;
        const e = rollEvent(s, Math.random());
        if (e) { toast((e.kind === 'rumor' ? '🗣️ ' : '✨ ') + e.text); if (e.money) s.money += e.money; if (e.kind === 'friend') change(s, { social: 12 }); if (e.kind === 'rumor') post(s, 'Flurfunk', e.text); }
      }
      if (this.warnT <= 0) {
        this.warnT = 45;
        const low = NEEDS.find((n) => s.needs[n.k] < 18);
        if (low) toast(`${low.icon} ${low.name} ist niedrig: ${low.tip}`);
        if (testDue(s) && s.flags.remind !== s.day) { s.flags.remind = s.day; toast('🩺 Erinnerung: Dein HIV/STI-Test ist fällig. Der Checkpoint hat offen.'); }
      }
      this.crowd.forEach((a) => (a.root.visible = this.world.night > .5));
    }
    this.player.update(dt);
    if (!busy) this.movePlayer(dt);
    this.updateCam(dt);
    this.world.follow(this.player.root.position);
    this.world.update(dt, t, this.player.root.position);

    this.hudT -= dt;
    if (this.hudT <= 0) { this.hudT = .5; this.refreshHud(); if (mood(s) >= 75 && !busy) g.done(track(s, 'mood')); }
    g.hud.markers(busy ? [] : this.markers(), this.camera);
    if (!busy) {
      this.findNear();
      const inp = g.engine.input;
      if (inp.pressed('confirm')) { inp.consume('confirm'); this.interact(); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.phone('map'); }
      else if (inp.pressed('menu') || inp.pressed('back')) { inp.consume('menu'); inp.consume('back'); g.pauseMenu(); }
      this.checkStickers();
    } else g.hud.prompt(null);
  }

  private movePlayer(dt: number) {
    const inp = this.g.engine.input, p = this.player.root.position;
    const mx = inp.move.x, my = inp.move.y, mag = Math.hypot(mx, my);
    if (mag > .08) {
      const yaw = this.cam.yaw;
      // Bewegung relativ zur Kamera
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = -fz, rz = fx;
      const dx = fx * my + rx * mx, dz = fz * my + rz * mx;
      const run = inp.held('sprint') && this.g.save.data.needs.energy >= 10;
      const sp = (run ? 7.8 : 4.4) * Math.min(1, mag);
      p.x += (dx / mag) * sp * dt * Math.min(1, mag); p.z += (dz / mag) * sp * dt * Math.min(1, mag);
      this.world.collide(p, .45);
      const want = Math.atan2(dx, dz);
      let d = want - this.player.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
      this.player.root.rotation.y += d * Math.min(1, dt * 14);
      this.player.play(run ? 'run' : 'walk', .18, run ? 1 : .6 + mag * .55);
      this.stepT -= dt * (run ? 1.6 : 1);
      if (this.stepT <= 0) { this.stepT = .38; sfx('step'); }
      const s = this.g.save.data; s.pos.x = p.x; s.pos.z = p.z; s.pos.yaw = this.player.root.rotation.y;
    } else if (this.player.anim === 'walk' || this.player.anim === 'run') this.player.play('idle');
  }

  private walkNpc(n: Npc, dt: number) {
    const w = n.def.walk!;
    if (n.wait > 0) { n.wait -= dt; if (n.a.anim !== 'idle') n.a.play('idle'); return; }
    const [tx, tz] = w[n.wp], p = n.a.root.position;
    const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
    if (d < .3) { n.wp = (n.wp + 1) % w.length; n.wait = 1.5 + Math.random() * 3; return; }
    p.x += (dx / d) * 1.6 * dt; p.z += (dz / d) * 1.6 * dt;
    n.a.root.rotation.y = Math.atan2(dx, dz);
    n.a.play('walk', .25, .7);
  }

  private checkStickers() {
    const p = this.player.root.position, s = this.g.save.data;
    for (const m of this.stickerMeshes) {
      if (!m.visible) continue;
      if (Math.hypot(m.position.x - p.x, m.position.z - p.z) < 1.4) {
        m.visible = false; s.goals.push('sticker' + m.userData.i); s.glitter += 10;
        const n = s.goals.filter((x) => x.startsWith('sticker')).length;
        sfx('win'); toast(`🌈 Pride-Sticker ${n}/${STICKERS.length} gefunden! +10 Glitzer`);
        if (n === STICKERS.length) { s.rep += 10; toast('Alle Sticker gesammelt! +10 Ruf'); }
        this.player.play('cheer'); setTimeout(() => this.player.play('idle'), 1200);
        this.g.save.write();
      }
    }
  }

}
