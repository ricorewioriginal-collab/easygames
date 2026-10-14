/* Begleiter: Polizeihund Blitz (folgt, bellt, Tricks, Spürnase), Ballon Pappnase (schwebt an der Hand),
   und Partner aus anderen Welten (Zündel, Felli, Willi …). Immer nur ein Tier-Begleiter aktiv, Pappnase zusätzlich. */
import type { Game, GameSystem } from '../game.ts';
import { makeCreature, type Creature } from '../characters/creatures.ts';
import { damp, dampAngle } from '../core/math.ts';

export interface CompanionDef { id: string; name: string; icon: string; kind: string; color?: number; color2?: number; hat?: number; scale?: number; desc: string; fly?: boolean }
export const COMPANIONS: Record<string, CompanionDef> = {
  blitz: { id: 'blitz', name: 'Blitz', icon: '🐕', kind: 'hund', color: 0x8a5a2a, color2: 0xe8c79a, hat: 0x2f5fc0, desc: 'Polizeihund mit Spürnase. Folgt dir überall hin.' },
  pappnase: { id: 'pappnase', name: 'Pappnase', icon: '🎈', kind: 'pappnase', desc: 'Dein Ballon mit dem aufgemalten Gesicht.', fly: true },
  zuendel: { id: 'zuendel', name: 'Zündel', icon: '🐲', kind: 'babydrache', color: 0x4cbf55, color2: 0xfff1c0, scale: 1.3, desc: 'Kleiner, tollpatschiger Drache. Zündet Fackeln an.' },
  felli: { id: 'felli', name: 'Moosling Felli', icon: '🌿', kind: 'moosling', color: 0x7fbf5a, scale: 0.6, desc: 'Ein Moosling aus Lunaris. Lässt Blumen wachsen.' },
  bello: { id: 'bello', name: 'Bello', icon: '🐶', kind: 'hund', color: 0xe8e0d0, color2: 0xffffff, desc: 'Fröhlicher Familienhund.' },
  mieze: { id: 'mieze', name: 'Mieze', icon: '🐱', kind: 'katze', color: 0xff9a3a, desc: 'Verschmuste Katze.' },
  hoppel: { id: 'hoppel', name: 'Hoppel', icon: '🐰', kind: 'hase', desc: 'Kuscheliger Hase.' },
  pixel: { id: 'pixel', name: 'Pixel', icon: '💠', kind: 'datenwesen', color: 0x58d9ff, color2: 0xff79c9, scale: 0.7, desc: 'Dein Datenhain-Begleiter.' },
  flick: { id: 'flick', name: 'Flick', icon: '☁️', kind: 'frostgeist', color: 0xe8ecff, scale: 0.7, desc: 'Das Himmelswölkchen – jetzt dein Freund.', fly: true },
  taschi: { id: 'taschi', name: 'Glutzahn', icon: '🔴', kind: 'taschi', color: 0xff8a3d, color2: 0xfff1c0, scale: 0.8, desc: 'Ein Taschi, das dir vertraut.' }
};

interface Active { def: CompanionDef; c: Creature; pos: THREE.Vector3; yaw: number; speed: number; trick: number; trickT: number; vy: number; line?: THREE.Line }

export class Companions implements GameSystem {
  id = 'companions';
  private pet: Active | null = null;
  private balloon: Active | null = null;
  scentTarget: { x: number; z: number } | null = null;
  private scentT = 0;
  constructor(private g: Game) { }
  onStart(): void { this.spawnAll(); }
  add(id: string): void {
    const s = this.g.save;
    if (!s.companions.includes(id)) { s.companions.push(id); const d = COMPANIONS[id]; if (d) this.g.toast(d.name + ' begleitet dich jetzt!', d.icon, 3000); }
    if (id !== 'pappnase') { s.companion = id; this.spawnAll(); }
  }
  setActive(id: string | null): void { this.g.save.companion = id; this.spawnAll(); }
  get activeId(): string | null { return this.pet?.def.id ?? null; }
  private make(def: CompanionDef): Active {
    const c = makeCreature(def.kind, { color: def.color, color2: def.color2, hat: def.hat, scale: def.scale });
    const p = this.g.player.pos;
    const a: Active = { def, c, pos: new THREE.Vector3(p.x - 1.5, p.y, p.z - 1.5), yaw: 0, speed: 0, trick: 0, trickT: 0, vy: 0 };
    c.root.position.copy(a.pos);
    this.g.scene.add(c.root);
    return a;
  }
  private spawnAll(): void {
    const s = this.g.save;
    this.pet?.c.dispose(); this.pet = null;
    if (this.balloon) { this.balloon.c.dispose(); if (this.balloon.line) { this.balloon.line.geometry.dispose(); this.g.scene.remove(this.balloon.line); } this.balloon = null; }
    if (s.companion && COMPANIONS[s.companion] && s.companions.includes(s.companion)) this.pet = this.make(COMPANIONS[s.companion]);
    if (s.companions.includes('pappnase') && !s.flags.pappnase_home) {
      this.balloon = this.make(COMPANIONS.pappnase);
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));
      this.balloon.line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0xffffff }));
      this.balloon.line.frustumCulled = false;
      this.g.scene.add(this.balloon.line);
    }
  }
  teleportAll(): void {
    const p = this.g.player.pos;
    for (const a of [this.pet, this.balloon]) if (a) { a.pos.set(p.x - 1.2, p.y + (a.def.fly ? 2 : 0), p.z - 1.2); }
  }
  trick(): void {
    if (!this.pet) return;
    this.pet.trick = 1 + Math.floor(Math.random() * 3); this.pet.trickT = 1.4;
    this.g.sfx(this.pet.def.kind === 'hund' ? 'bark' : 'magic', 0.7);
    this.g.bark(this.pet.def.name, ['Wuff! 🐾', 'Pfötchen!', 'Rolle!', 'Sitz!'][this.pet.trick] ?? '!', this.pet.def.icon);
  }
  petPos(): THREE.Vector3 | null { return this.pet?.pos ?? null; }
  update(dt: number): void {
    const g = this.g, p = g.player.pos, inVeh = g.vehicleCheck();
    if (this.pet) {
      const a = this.pet;
      const behind = { x: p.x - Math.sin(g.player.yaw) * 1.8 + Math.cos(g.player.yaw) * 0.9, z: p.z - Math.cos(g.player.yaw) * 1.8 - Math.sin(g.player.yaw) * 0.9 };
      let tx = behind.x, tz = behind.z;
      // Spürnase: Blitz läuft voraus Richtung Ziel
      if (this.scentTarget && a.def.id === 'blitz') {
        const dx = this.scentTarget.x - p.x, dz = this.scentTarget.z - p.z, L = Math.hypot(dx, dz) || 1;
        tx = p.x + dx / L * Math.min(6, L); tz = p.z + dz / L * Math.min(6, L);
        this.scentT -= dt;
        if (this.scentT < 0) { this.scentT = 0.12; g.fx.trail(a.pos.x, a.pos.y + 0.2, a.pos.z, 0xffd23f); }
      }
      const dx = tx - a.pos.x, dz = tz - a.pos.z, d = Math.hypot(dx, dz);
      const far = Math.hypot(p.x - a.pos.x, p.z - a.pos.z);
      if (far > 35 || (inVeh && far > 14)) { a.pos.set(p.x - 1.5, p.y, p.z - 1.5); }
      let sp = 0;
      if (a.trickT > 0) { a.trickT -= dt; a.c.mood?.('happy'); a.c.root.rotation.z = a.trick === 2 ? Math.sin((1.4 - a.trickT) * 9) * 1.4 : 0; }
      else if (d > 1.0) {
        sp = Math.min(8.5, d * 2.2);
        a.yaw = dampAngle(a.yaw, Math.atan2(dx, dz), 8, dt);
        g.physics.move(a.pos, Math.sin(a.yaw) * sp * dt, Math.cos(a.yaw) * sp * dt, 0.3, 0.8);
        a.c.root.rotation.z = 0;
      } else { a.yaw = dampAngle(a.yaw, Math.atan2(p.x - a.pos.x, p.z - a.pos.z), 4, dt); a.c.root.rotation.z = 0; }
      a.speed = damp(a.speed, sp, 6, dt);
      const gr = g.physics.ground(a.pos.x, a.pos.z, a.pos.y + 0.6);
      const gy = gr.water > gr.y + 0.6 ? gr.water - 0.5 : gr.y;
      a.pos.y = a.def.fly ? damp(a.pos.y, p.y + 1.6, 4, dt) : damp(a.pos.y, gy, 14, dt);
      a.c.root.position.copy(a.pos); a.c.root.rotation.y = a.yaw;
      a.c.root.visible = !(inVeh && far < 3);
      if (a.trickT <= 0) a.c.mood?.(sp > 0.5 ? 'idle' : g.player.speed > 0 ? 'idle' : 'happy');
      a.c.update(dt, a.speed);
    }
    if (this.balloon) {
      const b = this.balloon, hand = new THREE.Vector3();
      g.avatar.handR.getWorldPosition(hand);
      const want = { x: hand.x - Math.sin(g.player.yaw) * 0.4, y: hand.y + 2.2, z: hand.z - Math.cos(g.player.yaw) * 0.4 };
      b.pos.x = damp(b.pos.x, want.x, 3, dt); b.pos.y = damp(b.pos.y, want.y + Math.sin(g.time * 1.7) * 0.15, 3, dt); b.pos.z = damp(b.pos.z, want.z, 3, dt);
      b.c.root.position.copy(b.pos);
      b.c.root.rotation.y = g.player.yaw + Math.sin(g.time * 0.8) * 0.3;
      b.c.root.visible = !inVeh;
      b.c.update(dt, 0);
      if (b.line) { const arr = b.line.geometry.attributes.position; arr.setXYZ(0, hand.x, hand.y, hand.z); arr.setXYZ(1, b.pos.x, b.pos.y - 0.5, b.pos.z); arr.needsUpdate = true; b.line.visible = !inVeh; }
    }
    // Begleiter antippen
    if (this.pet) {
      const a = this.pet, ia = g.interact.get('companion');
      if (!ia) g.interact.add({ id: 'companion', tag: '_comp', x: a.pos.x, y: a.pos.y, z: a.pos.z, r: 2, icon: a.def.icon, label: () => (this.pet ? this.pet.def.name : '') + ' streicheln', priority: -1, act: () => { g.avatar.play('pet', 1.2); this.trick(); } });
      else { ia.x = a.pos.x; ia.y = a.pos.y; ia.z = a.pos.z; }
    }
  }
}
