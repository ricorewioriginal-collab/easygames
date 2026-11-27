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
import { buildShell, shellTime, furnish, styleOf, RoomCam, type Shell } from './room';
import { ClubDeco, CLUB_LAYOUT } from './clubdeco';
import { BUSINESSES, owns, SELLERS } from './empire';
import { clubOf, nightDone, nightOpen, DJS, QEVENTS, type ClubState } from './club';
import { RoomFriends } from './Friends';
import type { PState } from './online';
import { popOf } from './manage';
import { hour } from './life';
import type { Color3, Mesh } from '../engine/bjs';
import { guestCast, type Guest } from './flirt';
import { SZENE } from './szene';
import { bedMess, darkroom } from './spuren';
import { darkAtmo } from '../engine/Audio';
import { TAREK_LOOK, tarekInside } from './tarek';

interface Box { x: number; z: number; hx: number; hz: number }
const W = 12, D = 9, K = .9, H = 3.6; // Raum in Metern, KayKit-Möbel 1 Einheit ≈ 1 m (Figur ≈ 1,8 m)
const DOOR: Spot = { id: 'door', label: '🚪 Rausgehen', x: W / 2 - .8, z: 3.4, r: 1.5, act: { k: 'menu' } };

export class InteriorScene implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = .6;
  player!: Actor;
  private folk: Actor[] = [];
  /** Gäste mit Namen (ansprechbar), gleiche Reihenfolge wie folk */
  readonly guests: Array<{ a: Actor; g: Guest }> = [];
  private guestSpot: Spot | null = null;
  /** Spuren wilder Nächte am Bett (nur 18+) */
  private mess: Mesh | null = null;
  private darkTick: ((t: number) => void) | null = null;
  /** Hausparty läuft: Gäste tanzen, Licht pulsiert schnell */
  partyOn = false;
  private boxes: Box[] = [];
  private glow: PBRMaterial[] = [];
  private sg!: ShadowGenerator;
  private shell!: Shell;
  private cam = new RoomCam(W, D, H);
  readonly spots: Spot[];
  private hudT = 0;
  private exitPos = new Vector3(W / 2 - .2, 3.4, 3.4);
  /** Club-Ansicht (Deko, DJ, Menge) und dynamische Stellen (Club führen/kaufen) */
  private club: ClubDeco | null = null;
  private clubRing: ReturnType<typeof ring> | null = null;
  private extra: Spot[] = [];
  /** Story-Modus: Tarek in U-Haft im Besuchsraum der Wache (tarek.ts), nur sichtbar, solange er sitzt */
  private cameo: { a: Actor; spot: Spot; ring: Mesh } | null = null;
  /** läuft gerade eine Clubnacht: Name fürs Banner */
  party = '';
  /** Online: Ort-ID für Freund*innen im selben Raum (leer = privat, z. B. Wohnung, Anbau, Wohnhäuser) */
  readonly netKey: string;
  private roomFriends: RoomFriends | null = null;
  private friendSpot: Spot | null = null;
  constructor(private g: Game, readonly theme: Theme, readonly placeId = '') {
    this.spots = [...theme.spots, DOOR];
    this.netKey = placeId && !theme.own && /^[a-z0-9_]{1,24}$/.test(placeId) ? placeId : '';
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
if (t.id !== 'darkroom') {     deco('home/pictureframe_large_B', -W / 2 + .06, 1.9, -1.6, Math.PI / 2); deco('home/pictureframe_medium', -W / 2 + .06, 2, .4, Math.PI / 2); deco('home/pictureframe_large_A', -W / 2 + .06, 1.9, 2.4, Math.PI / 2); }
    const clear = (x: number, z: number) => t.items.every((q) => Math.hypot(q.x - x, q.z - z) > 1.3) && t.spots.every((q) => Math.hypot(q.x - x, q.z - z) > 1.2);
    if (t.id !== 'darkroom') for (const [cx, cz, m] of [[-W / 2 + .7, D / 2 - .7, 'home/cactus_medium_B'], [-W / 2 + .7, -D / 2 + .7, 'home/cactus_medium_A'], [W / 2 - .7, -D / 2 + .7, 'home/cactus_medium_B']] as const)
      if (clear(cx, cz)) { deco(m, cx, 0, cz, 0); this.boxes.push({ x: cx, z: cz, hx: .3, hz: .3 }); }
    await Promise.all(jobs);
    // Markierung auf dem Boden für jede benutzbare Stelle
    const ringM = glow(sc, 0xffd23b, 1.2, { alpha: .55 });
    for (const s of this.theme.spots) { if (s.act.k === 'darkroom' && !this.g.save.data.settings.adult) continue; const o = ring(sc, .42, .55, 24); o.material = ringM; o.position.set(s.x, .03, s.z); }
    // Leben im Raum: verschiedene Menschen je Raum (Figur, Hautton, Haare, Szene-Look, Outfit), alle ansprechbar
    const party = t.music === 'club' || t.music === 'show', darkRoom = t.id === 'darkroom', adult = this.g.save.data.settings.adult;
    if (t.id === 'police') {
      const a = await Actor.create(sc, TAREK_LOOK), cx = -3.4, cz = -1.6;
      a.root.position.set(cx, 0, cz); a.root.rotation.y = 0; a.play('idle');
      const o = ring(sc, .42, .55, 24); o.material = ringM; o.position.set(cx, .03, cz + 1.2);
      this.cameo = { a, ring: o, spot: { id: 'tarek', label: '🔒 Besuchsraum: Tarek', x: cx, z: cz + 1.2, r: 1.4, act: { k: 'story', id: 'tarek' } } };
      this.boxes.push({ x: cx, z: cz, hx: .25, hz: .25 });
      this.showCameo();
    }
    const cast = t.own ? [] : guestCast(t.id + '|' + this.placeId, darkRoom ? 5 : party ? 6 : 3, { adult, party, swim: t.id === 'bad' || t.id === 'sauna', dark: darkRoom });
    const folk = await Promise.all(cast.map((c) => Actor.create(sc, { body: c.rb, rb: c.rb, palette: 'rainbow', skin: 0, style: c.style, outfit: c.outfit, hot: adult, gear: c.typ ? SZENE[c.typ].gear : undefined })));
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
      const ty = cast[i].typ ? SZENE[cast[i].typ!] : null;
      a.play(ty ? ty.anim[i % ty.anim.length] : party && !darkRoom ? (['dance1', 'dance2', 'dance3'] as const)[i % 3] : darkRoom ? 'idle' : (['talk', 'idle', 'drink'] as const)[i % 3], 0, .9 + (i % 3) * .08);
      this.folk.push(a); this.guests.push({ a, g: cast[i] }); this.boxes.push({ x, z, hx: .25, hz: .25 });
    });
    // fremde Schlafzimmer: Spuren der letzten Nacht (nur mit 18+ sichtbar)
    const seed = [...t.id].reduce((n, ch) => n + ch.charCodeAt(0), 0);
    const bed = t.own ? null : t.items.find((q) => 'm' in q && q.m === 'home/bed_double_A');
    if (bed) { this.mess = bedMess(sc, bed.x, bed.z, seed); this.mess?.setEnabled(adult); }
    if (darkRoom) { this.darkTick = darkroom(sc, W, D); const dim = new Set<PBRMaterial>(); this.folk.forEach((a) => a.root.getChildMeshes().forEach((m) => { const mt = m.material as PBRMaterial | null; if (mt && 'albedoColor' in mt && !dim.has(mt)) { dim.add(mt); mt.albedoColor.scaleInPlace(.25); mt.environmentIntensity = .05; } })); }
    this.player = await Actor.create(sc, streetLook(playerLook(this.g.save.data)));
    if (this.netKey) this.roomFriends = new RoomFriends(sc, this.g.city.friends, this.netKey);
    if (CLUB_LAYOUT[t.id] && !t.own) {
      this.club = new ClubDeco(sc, t.id, W, D, H, this.glow);
      const [cx, cz] = CLUB_LAYOUT[t.id].spot, o = ring(sc, .42, .55, 24); o.material = glow(sc, 0x3ee69a, 1.4, { alpha: .6 }); o.position.set(cx, .035, cz); this.clubRing = o;
    }
    collectCasters(sc, this.sg);
  }

  /** Eigene Lage für Online (Raumkoordinaten mit Ort) */
  netState(): PState { const r = this.player.root; return { x: r.position.x, z: r.position.z, r: r.rotation.y, a: String(this.player.anim), c: '', h: -1, w: this.netKey }; }
  /** Geschäft zu diesem Raum (Club, Bar), falls es eins ist */
  get business() { return this.club ? BUSINESSES.find((b) => b.poi === this.theme.id) || null : null; }
  /** Club-Zustand neu anwenden (nach Kauf, Einstellungen, Clubnacht) */
  refreshClub() {
    const b = this.business; if (!b || !this.club) return;
    const s = this.g.save.data, mine = owns(s, b.id), guest = !mine && this.g.clubGuest?.p === this.netKey ? this.g.clubGuest : null, sale = !mine && !b.gift && !guest;
    // zu Gast im Club einer Freundin/eines Freundes: deren Einstellungen und Party-Banner
    const gst: ClubState | null = guest ? { dj: DJS.find((d) => d.id === guest.dj) || DJS[0], price: 1, door: guest.door, deco: guest.deco, decos: guest.deco ? [guest.deco] : [], aware: guest.aw } : null;
    const gev = guest ? `🎉 BEI ${guest.from.toUpperCase()}${guest.e ? ' · ' + (QEVENTS.find((q) => q.id === guest.e)?.night || '') : ''}` : '';
    this.club.apply(mine ? clubOf(s, b.id) : gst, { sale, event: this.party || gev || undefined, party: !!this.party || !!guest }, this.folk, popOf(s, b.id));
    const [x, z] = CLUB_LAYOUT[this.theme.id].spot;
    const night = mine && nightOpen(hour(s)) && !nightDone(s, b.id);
    this.extra = mine ? [{ id: 'club', label: night ? '📋 Club führen · 🪩 Türen auf' : '📋 Club führen', x, z, r: 1.6, act: { k: 'club' } }]
      : sale ? [{ id: 'deal', label: `🤝 ${SELLERS[b.poi]?.who || 'Besitzer*in'}: Club kaufen`, x, z, r: 1.6, act: { k: 'deal' } }] : [];
    this.clubRing?.setEnabled(this.extra.length > 0);
  }

  /** Mit einem Gast reden: Person dreht sich zu dir, danach geht es im Gesprächsmenü weiter (Game.strangerTalk) */
  private talkGuest(i: number) {
    const q = this.guests[i]; if (!q) return;
    const a = q.a, p = this.player.root.position, prev = a.anim;
    a.root.rotation.y = Math.atan2(p.x - a.root.position.x, p.z - a.root.position.z);
    this.player.root.rotation.y = Math.atan2(a.root.position.x - p.x, a.root.position.z - p.z);
    if (!this.partyOn) a.play('talk');
    this.g.strangerTalk(q.g.st, { actor: a, room: this, look: { body: q.g.rb, rb: q.g.rb, palette: 'rainbow', skin: 0, style: q.g.style, outfit: 'clothed', gear: q.g.typ ? SZENE[q.g.typ].gear : undefined }, szene: q.g.typ }, () => { if (!this.partyOn && prev) a.play(prev); });
  }
  /** Ist der Raum eine Wohnung oder Partylocation (für Hauspartys)? */
  get partyPlace() { return this.theme.id.startsWith('res_') || this.theme.music === 'club' || this.theme.music === 'show'; }
  /** Hausparty: alle tanzen, Licht pulsiert schnell; aus = zurück zum Alltag */
  houseParty(on: boolean) {
    this.partyOn = on;
    this.guests.forEach((q, i) => q.a.play(on ? (['dance1', 'dance2', 'dance3'] as const)[i % 3] : this.theme.music === 'club' ? (['dance1', 'dance2', 'dance3'] as const)[i % 3] : 'talk'));
    this.player.play(on ? 'dance2' : 'idle');
    music(on ? 'club' : this.theme.music || 'city');
  }

  /** Neue Figur, wenn im Kleiderschrank die Figur gewechselt wurde */
  async syncPlayer() {
    const look = streetLook(playerLook(this.g.save.data));
    if (this.player.look.body === look.body) { this.player.setLook(look); return; }
    const old = this.player;
    this.player = await Actor.create(this.scene, look);
    this.player.root.position.copyFrom(old.root.position); this.player.root.rotation.y = old.root.rotation.y;
    old.dispose();
    collectCasters(this.scene, this.sg);
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
    this.cam.reset();
    this.player.setLook(streetLook(playerLook(this.g.save.data)));
    this.g.hud.show(true); this.g.touch.show(true);
    this.g.city.refreshHud();
    hints([['move', 'Laufen'], ['a', 'Benutzen'], ['x', 'Handy'], ['y', 'Menü']]);
    music(this.theme.music || 'city');
    toast(`${this.theme.icon} ${this.theme.title}`);
    this.refreshClub();
    this.mess?.setEnabled(this.g.save.data.settings.adult);
    if (this.darkTick) darkAtmo(() => this.g.inside === this && this.g.where === 'inside' && !this.scene.isDisposed);
  }

  private showCameo() { if (!this.cameo) return; const on = tarekInside(this.g.save.data); this.cameo.a.root.setEnabled(on); this.cameo.ring.setEnabled(on); return on; }
  update(dt: number, t: number) {
    const g = this.g, inp = g.engine.input, p = this.player.root.position;
    this.player.update(dt);
    for (const a of this.folk) if (a.root.isEnabled()) a.update(dt);
    if (this.cameo?.a.root.isEnabled()) this.cameo.a.update(dt);
    this.club?.update(dt);
    if (this.netKey && this.g.city.friends.net.on) { this.g.city.friends.send(dt, this.netState()); this.roomFriends?.update(dt); }
    const busy = g.dialog.open || g.menuOpen;
    this.hudT -= dt;
    // Leuchtfarben pulsieren (ohne Setter, Basisfarbe zwischengespeichert; Tempo steigt in der Clubnacht)
    this.darkTick?.(t);
    const pulse = this.partyOn ? 9 : this.club?.pulse || 3;
    for (const [i, m] of this.glow.entries()) { const md = m.metadata as { c: number; cc?: Color3 }; (md.cc ||= col(md.c)).scaleToRef(.35 + Math.sin(t * pulse + i) * .25, m.emissiveColor); }
    if (!busy) {
      const sv = g.save.data; sv.playMs += dt * 1000;
      if (advance(sv, dt / DAY_SEC * 1440)) toast(`Tag ${sv.day} beginnt.`);
      if (this.hudT <= 0) { this.hudT = .5; g.city.world.setTime(sv.time); g.city.refreshHud(); }
      const mx = inp.move.x, my = inp.move.y, mag = Math.hypot(mx, my);
      if (mag > .08) {
        // Bewegung relativ zur Kamera, wie draußen
        const [dx, dz] = this.cam.dir(mx, my);
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
      const fr = this.roomFriends?.count ? this.roomFriends.nearest(p.x, p.z, 1.6) : null;
      this.friendSpot = fr ? { id: 'friend:' + fr.id, label: '🌐 ' + fr.name, x: fr.x, z: fr.z, r: 1.6, act: { k: 'menu' } } : null;
      // nächste ansprechbare Person (alle Gäste sind erwachsen und haben etwas zu sagen)
      let gi = -1, gd = 1.5;
      this.guests.forEach((q, i) => { if (!q.a.root.visible) return; const d = Math.hypot(q.a.root.position.x - p.x, q.a.root.position.z - p.z); if (d < gd) { gd = d; gi = i; } });
      this.guestSpot = gi >= 0 ? { id: 'guest:' + gi, label: '💬 ' + this.guests[gi].g.st.name, x: this.guests[gi].a.root.position.x, z: this.guests[gi].a.root.position.z, r: 1.5, act: { k: 'menu' } } : null;
      const adult = g.save.data.settings.adult;
      const list = [...this.spots.filter((q) => adult || q.act.k !== 'darkroom'), ...this.extra, ...(this.cameo && this.showCameo() ? [this.cameo.spot] : []), ...(this.friendSpot ? [this.friendSpot] : []), ...(this.guestSpot ? [this.guestSpot] : [])];
      for (const s of list) { const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < (s.r || 1.8) && d < bd) { bd = d; best = s; } }
      g.hud.prompt(best ? best.label : null);
      g.touch.label(best ? 'Nutzen' : 'Aktion');
      if (inp.pressed('confirm') && best) { inp.consume('confirm'); this.player.play('interact'); if (best === DOOR) g.leaveInterior(); else if (best === this.friendSpot) g.friendMenu(best.id.slice(7)); else if (best === this.guestSpot) this.talkGuest(+best.id.slice(6)); else g.interiorAct(best, this); }
      else if (inp.pressed('phone')) { inp.consume('phone'); g.phone(); }
      else if (inp.pressed('map')) { inp.consume('map'); g.phone('map'); }
      else if (inp.pressed('menu') || inp.pressed('back')) { inp.consume('menu'); inp.consume('back'); g.pauseMenu(); }
      g.hud.markers([...(best === DOOR ? [] : [{ id: 'exit', icon: '🚪', label: 'Ausgang', pos: this.exitPos }]), ...(this.roomFriends?.count ? this.roomFriends.marks() : [])], (q) => g.engine.project(q));
    } else { g.hud.prompt(null); g.hud.markers([]); }
    const st = g.save.data.settings;
    this.cam.update(dt, this.camera, p, this.player.root.rotation.y, { look: inp.look, move: inp.move, speed: st.camSpeed, invertY: st.invertY, busy, portrait: g.engine.aspect < 1 });
    shellTime(this.shell, g.city.world.night, t);
  }
}
