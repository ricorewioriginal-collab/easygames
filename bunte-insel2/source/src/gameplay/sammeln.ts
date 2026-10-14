/* Sammeln (aus Bunte Insel): Angeln am Wasser (auswerfen → warten → „Es beißt!“ → im richtigen Moment ziehen),
   Käfer fangen mit dem Kescher (krabbeln/flattern im Gras), Buddeln an glitzernden Stellen am Strand. Alles fürs Sammelbuch. */
import type { Game, GameSystem } from '../game.ts';
import { BUGS, FINDS, FISH, type Collectible } from '../data/collect.ts';
import { makeRng } from '../core/rng.ts';
import { softDot } from '../engine/textures.ts';

interface Bug { def: Collectible; sprite: THREE.Sprite; x: number; z: number; y: number; t: number; vx: number; vz: number }
interface Spot { x: number; z: number; mesh: THREE.Sprite; id: string }

export class Sammeln implements GameSystem {
  id = 'sammeln';
  private rng = makeRng(5);
  private fishing: { state: 'cast' | 'wait' | 'bite' | 'reel'; t: number; bob: THREE.Mesh; line: THREE.Line; x: number; z: number } | null = null;
  private bugs: Bug[] = [];
  private spots: Spot[] = [];
  private bugT = 0;
  private spotT = 0;
  private bugTex = new Map<string, THREE.CanvasTexture>();
  constructor(private g: Game) { }
  private emojiTex(e: string): THREE.CanvasTexture {
    let t = this.bugTex.get(e);
    if (!t) { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d')!; c.font = '48px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 32, 36); t = new THREE.CanvasTexture(cv); this.bugTex.set(e, t); }
    return t;
  }
  private worldId(): string { return this.g.currentWorld?.id ?? ''; }
  private eligible(list: Collectible[]): Collectible[] {
    const w = this.worldId(), night = this.g.env.isNight;
    return list.filter(c => (!c.worlds || c.worlds.includes(w)) && (c.night === undefined || c.night === night || !c.night));
  }
  private pick(list: Collectible[]): Collectible {
    const el = this.eligible(list);
    const weights = el.map(c => (c.rare === 1 ? 10 : c.rare === 2 ? 4 : 1.3) * (c.night && this.g.env.isNight ? 2 : 1));
    let r = this.rng() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < el.length; i++) { r -= weights[i]; if (r <= 0) return el[i]; }
    return el[0];
  }
  /** Wasser in Blickrichtung? */
  private waterAhead(): { x: number; z: number } | null {
    const p = this.g.player;
    for (let d = 2; d <= 7; d += 1) {
      const x = p.pos.x + Math.sin(p.yaw) * d, z = p.pos.z + Math.cos(p.yaw) * d;
      const gr = this.g.physics.ground(x, z, p.pos.y);
      if (gr.water > gr.y + 0.4) return { x, z };
    }
    return null;
  }
  useTool(id: string): void {
    if (id === 'angel') this.startFishing();
    else if (id === 'kescher') this.g.toast('Geh zu einem Käfer im Gras und drück die Aktionstaste.', '🥅', 3000);
    else if (id === 'schaufel') this.g.toast('Glitzernde Stellen am Strand – dort kannst du buddeln.', '⛏️', 3000);
  }
  startFishing(): void {
    if (this.fishing) return;
    if (!this.g.has('angel')) { this.g.toast('Du brauchst eine Angel (Spielzeugladen).', '🎣'); return; }
    const w = this.waterAhead();
    if (!w) { this.g.toast('Stell dich ans Wasser und schau darauf.', '🎣'); return; }
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff4040 }));
    bob.position.set(w.x, 0.3, w.z);
    const wl = this.g.physics.ground(w.x, w.z, 5).water; bob.position.y = (Number.isFinite(wl) ? wl : 0) + 0.05;
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
    const line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0xffffff })); line.frustumCulled = false;
    this.g.scene.add(bob, line);
    this.fishing = { state: 'wait', t: 2 + this.rng() * 4, bob, line, x: w.x, z: w.z };
    this.g.avatar.play('fish', 1);
    this.g.sfx('whoosh', 0.5);
    this.g.busy++;
    this.g.toast('Warte … wenn es beißt, drück die Aktionstaste!', '🎣', 2500);
  }
  private endFishing(): void {
    if (!this.fishing) return;
    this.g.scene.remove(this.fishing.bob, this.fishing.line);
    this.fishing.bob.geometry.dispose(); this.fishing.line.geometry.dispose();
    this.fishing = null;
    this.g.busy = Math.max(0, this.g.busy - 1);
  }
  private catchFish(): void {
    const f = this.pick(FISH);
    const [a, b] = f.size ?? [10, 30];
    const size = Math.round(a + this.rng() * (b - a));
    const s = this.g.save.sammel.fish[f.id] ?? { n: 0, best: 0 };
    const isNew = s.n === 0, rec = size > s.best;
    s.n++; s.best = Math.max(s.best, size);
    this.g.save.sammel.fish[f.id] = s;
    if (f.id !== 'stiefel') this.g.give('fisch', 1, true);
    this.g.toast(f.icon + ' ' + f.name + ' (' + size + ' cm)' + (isNew ? ' – Neu im Sammelbuch!' : rec ? ' – Rekord!' : ''), undefined, 3200);
    if (isNew) this.g.addStars(f.rare + 1);
    this.g.avatar.play('cheer', 1.2);
    this.g.sfx('success');
    this.g.events.emit('fish', { id: f.id, size }); this.g.events.emit('interact', { id: 'angeln_fang', kind: 'fish' });
    this.g.events.emit('collect', { kind: 'fish', id: f.id });
    this.checkMaster();
  }
  private checkMaster(): void {
    const s = this.g.save.sammel;
    if (Object.keys(s.fish).length >= FISH.length && Object.keys(s.bugs).length >= BUGS.length && Object.keys(s.finds).length >= FINDS.length) this.g.achieve('sammelmeister');
  }
  update(dt: number, time: number): void {
    const g = this.g, p = g.player.pos;
    // Angeln
    const f = this.fishing;
    if (f) {
      f.t -= dt;
      const hand = new THREE.Vector3(); g.avatar.handR.getWorldPosition(hand);
      const arr = f.line.geometry.attributes.position; arr.setXYZ(0, hand.x, hand.y + 0.8, hand.z); arr.setXYZ(1, f.bob.position.x, f.bob.position.y, f.bob.position.z); arr.needsUpdate = true;
      if (f.state === 'wait') { f.bob.position.y += Math.sin(time * 3) * 0.002; if (f.t <= 0) { f.state = 'bite'; f.t = 1.1 * (g.settings.difficulty === 'easy' ? 1.6 : 1); g.sfx('splash', 0.6); g.toast('❗ Es beißt! Jetzt drücken!', undefined, 1000); } if (g.input.pressed('action') || g.input.pressed('jump')) { this.g.toast('Zu früh! Nochmal versuchen.', '🎣'); this.endFishing(); } }
      else if (f.state === 'bite') {
        f.bob.position.y = Math.sin(time * 30) * 0.08 + (f.bob.position.y);
        if (g.input.pressed('action') || g.input.pressed('jump')) { this.catchFish(); this.endFishing(); }
        else if (f.t <= 0) { g.toast('Entwischt! Beim nächsten Mal schneller.', '🐟'); this.endFishing(); }
      }
      return;
    }
    // Angel-Aktion am Wasser
    const nearWater = this.g.has('angel') && !g.vehicleCheck() && g.player.grounded && this.waterAhead();
    const ia = g.interact.get('angeln');
    if (nearWater && !ia) g.interact.add({ id: 'angeln', tag: '_samm', x: p.x, y: p.y, z: p.z, r: 2, icon: '🎣', label: 'Angeln', priority: -2, act: () => this.startFishing() });
    else if (ia) { if (!nearWater) g.interact.remove('angeln'); else { ia.x = p.x; ia.y = p.y; ia.z = p.z; } }
    // Käfer
    this.bugT -= dt;
    const w = g.currentWorld;
    const grassy = w && !w.underground && !g.currentZone?.combat;
    if (this.bugT <= 0) {
      this.bugT = 1.2;
      if (grassy && this.bugs.length < 6) {
        const a = this.rng() * Math.PI * 2, d = 8 + this.rng() * 14, x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
        const gr = g.physics.ground(x, z, p.y + 3);
        if (gr.y > 0.6 && gr.water < gr.y && !gr.solid) {
          const def = this.pick(BUGS);
          const mat = new THREE.SpriteMaterial({ map: this.emojiTex(def.icon), transparent: true, depthWrite: false });
          const sp = new THREE.Sprite(mat); sp.scale.setScalar(0.55); sp.position.set(x, gr.y + 0.4, z);
          g.scene.add(sp);
          const id = 'bug' + Math.floor(this.rng() * 1e9);
          const bug: Bug = { def, sprite: sp, x, z, y: gr.y, t: 0, vx: 0, vz: 0 };
          this.bugs.push(bug);
          g.interact.add({ id, tag: '_samm', meta: { ev: 'kaefer' }, x, y: gr.y, z, r: 2.4, icon: def.icon, label: () => g.has('kescher') ? 'Käfer fangen: ' + def.name : 'Kescher nötig (Spielzeugladen)', priority: 1,
            act: () => {
              if (!g.has('kescher')) { g.toast('Mit einem Kescher könntest du ' + def.name + ' fangen!', '🥅'); return; }
              if (def.rare === 3 && this.rng() < 0.3) { g.toast(def.name + ' ist entwischt!', '💨'); this.removeBug(bug, id); return; }
              const isNew = !g.save.sammel.bugs[def.id];
              g.save.sammel.bugs[def.id] = (g.save.sammel.bugs[def.id] ?? 0) + 1;
              g.toast(def.icon + ' ' + def.name + ' gefangen!' + (isNew ? ' Neu im Sammelbuch!' : ''), undefined, 2800);
              if (isNew) g.addStars(def.rare + 1);
              g.avatar.play('dig', 0.6); g.sfx('success', 0.6);
              g.events.emit('collect', { kind: 'bug', id: def.id }); g.events.emit('interact', { id: 'kaefer', kind: 'bug' });
              this.removeBug(bug, id); this.checkMaster();
            } });
          (bug as Bug & { iid: string }).iid = id;
        }
      }
    }
    for (const b of [...this.bugs]) {
      b.t += dt;
      const fly = b.def.icon === '🦋' || b.def.icon === '🐝' || b.def.icon === '✨' || b.def.icon === '🪰' || b.def.icon === '🌙' || b.def.icon === '🧚' || b.def.icon === '💎';
      if (this.rng() < dt * 0.8) { const a = this.rng() * Math.PI * 2; b.vx = Math.cos(a) * 0.8; b.vz = Math.sin(a) * 0.8; }
      b.x += b.vx * dt; b.z += b.vz * dt;
      b.sprite.position.set(b.x, b.y + (fly ? 1 + Math.sin(b.t * 3) * 0.4 : 0.25), b.z);
      const iid = (b as Bug & { iid: string }).iid, ia2 = g.interact.get(iid); if (ia2) { ia2.x = b.x; ia2.z = b.z; }
      if (Math.hypot(b.x - p.x, b.z - p.z) > 40 || b.t > 60) this.removeBug(b, iid);
    }
    // Buddelstellen an Stränden
    this.spotT -= dt;
    if (this.spotT <= 0) {
      this.spotT = 2;
      if (w && !w.underground && this.spots.length < 4) {
        const a = this.rng() * Math.PI * 2, s = w.shape, r = s.r - s.beach * 0.5, x = s.x + Math.cos(a) * r, z = s.z + Math.sin(a) * r;
        const gr = g.physics.ground(x, z, 10);
        if (gr.y > 0.15 && gr.y < 0.9 && !gr.solid && Math.hypot(x - p.x, z - p.z) < 120) {
          const mat = new THREE.SpriteMaterial({ map: softDot(), color: 0xfff2a0, transparent: true, depthWrite: false });
          const sp = new THREE.Sprite(mat); sp.scale.setScalar(0.9); sp.position.set(x, gr.y + 0.2, z); g.scene.add(sp);
          const id = 'dig' + Math.floor(this.rng() * 1e9);
          const spot: Spot = { x, z, mesh: sp, id };
          this.spots.push(spot);
          g.interact.add({ id, tag: '_samm', meta: { ev: 'buddeln' }, x, y: gr.y, z, r: 2.2, icon: '✨', label: () => g.has('schaufel') ? 'Buddeln' : 'Hier glitzert etwas … (Schaufel nötig)', priority: 1,
            act: () => {
              if (!g.has('schaufel')) { g.toast('Mit einer Schaufel könntest du hier graben.', '⛏️'); return; }
              const def = this.pick(FINDS);
              const isNew = !g.save.sammel.finds[def.id];
              g.save.sammel.finds[def.id] = (g.save.sammel.finds[def.id] ?? 0) + 1;
              if (def.id === 'muschel') g.give('muschel', 1, true);
              g.toast(def.icon + ' ' + def.name + ' gefunden!' + (isNew ? ' Neu im Sammelbuch!' : ''), undefined, 2800);
              if (isNew) g.addStars(def.rare + 1); else g.addStars(1);
              g.avatar.play('dig', 1); g.sfx('dig' as string, 0.5); g.fx.puff(x, gr.y, z, 0xf2dca0, 10);
              g.events.emit('collect', { kind: 'find', id: def.id }); g.events.emit('interact', { id: 'buddeln', kind: 'dig' });
              this.removeSpot(spot); this.checkMaster();
            } });
        }
      }
    }
    for (const s of [...this.spots]) {
      s.mesh.material.opacity = 0.5 + Math.sin(time * 4 + s.x) * 0.4;
      if (Math.hypot(s.x - p.x, s.z - p.z) > 160) this.removeSpot(s);
    }
  }
  private removeBug(b: Bug, iid: string): void { this.g.scene.remove(b.sprite); b.sprite.material.dispose(); this.bugs = this.bugs.filter(x => x !== b); this.g.interact.remove(iid); }
  private removeSpot(s: Spot): void { this.g.scene.remove(s.mesh); s.mesh.material.dispose(); this.spots = this.spots.filter(x => x !== s); this.g.interact.remove(s.id); }
  onEnterWorld(): void { for (const b of [...this.bugs]) this.removeBug(b, (b as Bug & { iid: string }).iid); for (const s of [...this.spots]) this.removeSpot(s); }
}
