/* Kampf – NUR im Verbotenen Wald (Weltregel aus Bunte Insel). Überall sonst ist dieses System inaktiv.
   Schlag-Kombo, Ausweichrolle, Abwehr, Lichtwelle, Zielerfassung, Gegner mit erkennbaren Angriffen (Ausholen!),
   Bosse mit Phasen. Kindgerecht: kein Blut, Monster verpuffen in Sterne, wer müde wird, wacht am Waldtor auf. */
import type { Game, GameSystem } from '../game.ts';
import type { AudioEngine, MusicTheme } from '../audio/music.ts';
import { THEMES } from '../audio/themes.ts';
import type { Hud } from '../ui/hud.ts';
import { makeCreature, type Creature } from '../characters/creatures.ts';
import { clamp, damp, dampAngle, TAU } from '../core/math.ts';
import { makeRng } from '../core/rng.ts';
import { SWORDS } from '../data/items.ts';
import { FOREST } from '../world/worlds/hub.ts';
import { btn, h, modal } from '../ui/dom.ts';

type Behavior = 'chase' | 'charge' | 'ranged' | 'hop' | 'float';
interface EnemyDef { kind: string; name: string; hp: number; speed: number; dmg: number; beh: Behavior; reach: number; scale?: number; color?: number; color2?: number; xp: number }
export const ENEMIES: Record<string, EnemyDef> = {
  glibbi: { kind: 'glibbi', name: 'Glibbi', hp: 3, speed: 2.2, dmg: 0.5, beh: 'hop', reach: 1.5, xp: 4 },
  stachli: { kind: 'stachli', name: 'Stachli', hp: 4, speed: 2.6, dmg: 0.5, beh: 'chase', reach: 1.6, xp: 5 },
  pilzling: { kind: 'pilzling', name: 'Pilzling', hp: 4, speed: 1.6, dmg: 0.5, beh: 'ranged', reach: 9, xp: 6 },
  wichtel: { kind: 'wichtel', name: 'Dunkelwichtel', hp: 5, speed: 3.4, dmg: 0.5, beh: 'chase', reach: 1.6, xp: 7 },
  moosling: { kind: 'moosling', name: 'Wilder Moosling', hp: 4, speed: 2.4, dmg: 0.5, beh: 'hop', reach: 1.5, xp: 5 },
  dornenwolf: { kind: 'dornenwolf', name: 'Dornenwolf', hp: 6, speed: 3.2, dmg: 1, beh: 'charge', reach: 2, xp: 9 },
  frostgeist: { kind: 'frostgeist', name: 'Frostgeist', hp: 5, speed: 2, dmg: 0.5, beh: 'float', reach: 8, xp: 8 },
  tintenklecks: { kind: 'tintenklecks', name: 'Tintenklecks', hp: 5, speed: 2.4, dmg: 0.5, beh: 'hop', reach: 1.6, xp: 7 },
  kaeferbot: { kind: 'kaeferbot', name: 'Käfer-Roboter', hp: 7, speed: 2.6, dmg: 1, beh: 'charge', reach: 2, xp: 10 },
  lavadrache: { kind: 'lavadrache', name: 'Lavadrache', hp: 8, speed: 2.4, dmg: 1, beh: 'ranged', reach: 10, xp: 12 },
  schatten: { kind: 'schatten', name: 'Schattenwesen', hp: 5, speed: 2.8, dmg: 0.5, beh: 'float', reach: 1.6, xp: 8 }
};
interface BossDef { id: string; name: string; hp: number; color: number; color2: number; minions: string[]; dmg: number; scale: number; desc: string }
export const BOSSES: BossDef[] = [
  { id: 'waldgeist', name: 'Der Waldgeist', hp: 40, color: 0x6a9a6a, color2: 0xc9f0a0, minions: ['glibbi', 'pilzling'], dmg: 1, scale: 1.6, desc: 'Uralt und grummelig. Ruft Pilzlinge herbei.' },
  { id: 'dunkelriese', name: 'Der Dunkelriese', hp: 55, color: 0x3a2a5a, color2: 0xffe14a, minions: ['wichtel'], dmg: 1, scale: 1.9, desc: 'Groß und langsam – aber sein Stampfen ist gewaltig!' },
  { id: 'klecks', name: 'Der große Klecks', hp: 50, color: 0x2a2a3a, color2: 0x8f7fff, minions: ['tintenklecks'], dmg: 1, scale: 1.7, desc: 'Spritzt Tintenpfützen. Ausweichen!' },
  { id: 'titan', name: 'Titan Kron', hp: 70, color: 0x8a8f9a, color2: 0xff8a1f, minions: ['kaeferbot'], dmg: 1.5, scale: 2.1, desc: 'Ein steinerner Riese aus der Rätsel-Insel.' },
  { id: 'grauschleier', name: 'Der Grauschleier-Riese', hp: 90, color: 0x7a7a90, color2: 0xd8d8ff, minions: ['schatten', 'frostgeist'], dmg: 1.5, scale: 2.3, desc: 'Aus dem Grauschleier geboren – das Finale!' }
];

interface Enemy { def: EnemyDef; c: Creature; pos: THREE.Vector3; yaw: number; hp: number; state: 'idle' | 'move' | 'wind' | 'attack' | 'hurt' | 'dead'; t: number; vy: number; boss?: BossDef; phase: number; inv: number; shotT: number; charge?: { x: number; z: number } }
interface Shot { mesh: THREE.Mesh; vx: number; vz: number; vy: number; t: number; dmg: number }
interface Pickup { mesh: THREE.Mesh; kind: 'herz' | 'energie' | 'stern'; t: number }
interface Puddle { mesh: THREE.Mesh; t: number; x: number; z: number; r: number; warn: boolean }

export class Combat implements GameSystem {
  id = 'combat';
  hud: Hud | null = null;
  private enemies: Enemy[] = [];
  private shots: Shot[] = [];
  private pickups: Pickup[] = [];
  private puddles: Puddle[] = [];
  energy = 3;
  private combo = 0;
  private comboT = 0;
  private atkCd = 0;
  private dodgeT = 0;
  private inv = 0;
  private spawnT = 3;
  private rng = makeRng(99);
  private blocking = false;
  inForest = false;
  private lock: Enemy | null = null;
  private boss: Enemy | null = null;
  private bossBar: HTMLElement | null = null;
  private dummies: { x: number; z: number; hits: number }[] = [{ x: -168 + 9, z: -102, hits: 0 }, { x: -168, z: -102 + 9, hits: 0 }, { x: -168 - 9, z: -102, hits: 0 }, { x: -168, z: -102 - 9, hits: 0 }];
  onBossDefeated: ((id: string) => void) | null = null;
  constructor(private g: Game, private audio: AudioEngine) { }
  get maxHp(): number { return this.g.save.hp; }
  private hp = 5;
  onStart(): void { this.hp = this.maxHp; this.clearAll(); }
  heal(n: number): boolean { const b = this.hp; this.hp = Math.min(this.maxHp, this.hp + n); return this.hp > b; }
  hudInfo(): { hp: number; max: number; energy: number } | null { return this.inForest ? { hp: this.hp, max: this.maxHp, energy: this.energy } : null; }
  music(): MusicTheme | null { return this.boss ? THEMES.arena : null; }
  private diff(): number { return this.g.settings.difficulty === 'easy' ? 0.6 : this.g.settings.difficulty === 'hard' ? 1.4 : 1; }
  private swordDmg(): number { return SWORDS.find(s => s.id === this.g.save.equip.sword)?.dmg ?? 1; }

  onZone(z: { combat?: boolean } | null): void {
    const was = this.inForest;
    this.inForest = !!z?.combat;
    if (this.inForest && !was) { this.hud?.toast('Verbotener Wald: Hier wird gekämpft! ⚔️ J/Schlag · 🌀 K · 🛡️ L · 🌟 U', '🌲', 4000); this.spawnT = 2; }
    if (!this.inForest && was) { this.clearAll(); this.hp = this.maxHp; }
  }
  private clearAll(): void {
    for (const e of this.enemies) e.c.dispose();
    this.enemies = []; this.boss = null; this.lock = null;
    for (const s of this.shots) this.g.scene.remove(s.mesh); this.shots = [];
    for (const p of this.pickups) this.g.scene.remove(p.mesh); this.pickups = [];
    for (const p of this.puddles) this.g.scene.remove(p.mesh); this.puddles = [];
    this.bossBar?.remove(); this.bossBar = null;
    this.g.rig.lockTarget = null;
  }
  private pool(): string[] {
    const s = this.g.save, ch = s.story.chapter, done = (id: string) => s.quests[id]?.done;
    const p = ['glibbi', 'stachli', 'pilzling'];
    if (ch >= 3 || done('w_schluessel') || s.mode === 'free') p.push('wichtel', 'moosling');
    if (ch >= 4 || s.fight.defeated > 15) p.push('dornenwolf', 'frostgeist', 'tintenklecks');
    if (ch >= 6 || s.fight.defeated > 40) p.push('kaeferbot', 'lavadrache', 'schatten');
    return p;
  }
  private spawn(kind: string, x: number, z: number, boss?: BossDef): Enemy {
    const def = ENEMIES[kind] ?? ENEMIES.glibbi;
    const c = boss ? makeCreature('boss', { color: boss.color, color2: boss.color2, scale: boss.scale }) : makeCreature(def.kind, { scale: def.scale });
    const y = this.g.physics.ground(x, z, 50).y;
    const e: Enemy = { def, c, pos: new THREE.Vector3(x, y, z), yaw: 0, hp: boss ? boss.hp * this.diff() : def.hp * (0.8 + this.diff() * 0.2), state: 'idle', t: 0, vy: 0, boss, phase: 0, inv: 0, shotT: 2 + this.rng() * 2 };
    c.root.position.copy(e.pos);
    this.g.scene.add(c.root);
    this.enemies.push(e);
    this.g.fx.puff(x, y + 0.5, z, 0x8f7fff, 12);
    return e;
  }
  /** Boss rufen (Altar im Herz des Waldes). */
  summonBoss(id: string): void {
    if (this.boss) return;
    const b = BOSSES.find(x => x.id === id);
    if (!b) return;
    const e = this.spawn('glibbi', -182, -158, b);
    e.def = { ...e.def, name: b.name, dmg: b.dmg, speed: 1.6, reach: 3.5, beh: 'chase', xp: 80 };
    this.boss = e;
    this.g.focusCamera(e.pos.x, e.pos.y + 4, e.pos.z, 2.4);
    this.hud?.banner('⚔️ ' + b.name, b.desc);
    this.audio.sfx('levelup', 0.6);
    this.bossBar = h('div', { class: 'panel', style: 'position:fixed;left:50%;top:calc(70px + var(--safe-t));transform:translateX(-50%);padding:8px 14px;width:min(420px,70vw);z-index:12;pointer-events:none' }, h('b', null, '👑 ' + b.name), h('div', { class: 'progress', style: 'margin-top:4px;height:14px' }, h('i', { style: 'width:100%;background:linear-gradient(90deg,#ff6b5b,#ffd23f)' })));
    document.getElementById('ui')!.append(this.bossBar);
  }
  bossAltarPanel(): void {
    const s = this.g.save;
    const m = modal({ title: 'Herz des Waldes', icon: '🌑' });
    m.body.append(h('p', null, 'Hier kannst du die Wächter des Waldes herausfordern. Wer müde wird, wacht am Waldtor auf – nichts geht verloren.'));
    for (const b of BOSSES) {
      if (b.id === 'grauschleier' && !(s.mode === 'story' && s.story.chapter >= 8) && !s.fight.bosses.includes('grauschleier')) continue;
      const done = s.fight.bosses.includes(b.id);
      m.body.append(h('div', { class: 'card row', style: 'margin:8px 0' }, h('div', null, h('b', null, (done ? '✅ ' : '👑 ') + b.name), h('div', { class: 'muted', style: 'font-size:.85rem' }, b.desc)), h('span', { class: 'spacer' }), btn(done ? 'Nochmal' : 'Herausfordern', () => { m.close(); this.summonBoss(b.id); }, 'pink small')));
    }
  }
  private damagePlayer(n: number, fromX: number, fromZ: number): void {
    if (this.inv > 0 || this.dodgeT > 0) return;
    const p = this.g.player;
    const dx = p.pos.x - fromX, dz = p.pos.z - fromZ, L = Math.hypot(dx, dz) || 1;
    if (this.blocking) {
      const facing = (dx / L) * -Math.sin(p.yaw) + (dz / L) * -Math.cos(p.yaw);
      if (facing > 0.2) { n *= 0.15; this.audio.sfx('bump', 0.6); this.g.fx.sparkle(p.pos.x, p.pos.y + 1, p.pos.z, 0x9fe8ff, 6); }
    }
    n *= this.diff();
    this.hp = Math.max(0, this.hp - n);
    this.inv = 0.9;
    p.push.x = dx / L * 9; p.push.z = dz / L * 9;
    this.g.rig.addShake(0.25);
    this.audio.sfx('hurt', 0.7);
    this.g.avatar.play('block', 0.3);
    if (this.hp <= 0) this.faint();
  }
  private faint(): void {
    this.g.save.fight.faints++;
    const fade = document.querySelector('.fade') ?? h('div', { class: 'fade' }); if (!fade.parentElement) document.body.append(fade);
    fade.classList.add('on');
    this.g.busy++;
    setTimeout(() => {
      this.clearAll();
      this.hp = this.maxHp;
      this.g.teleport(FOREST.gate.x + 6, FOREST.gate.z + 6, Math.atan2(6, 6));
      this.g.busy = Math.max(0, this.g.busy - 1);
      fade.classList.remove('on');
      this.hud?.toast('Puh, eingeschlafen … Du wachst am Waldtor wieder auf. Iss etwas, bevor du zurückgehst!', '😴', 4500);
    }, 700);
  }
  private hitEnemy(e: Enemy, dmg: number, knock: number): void {
    if (e.inv > 0 || e.state === 'dead') return;
    e.hp -= dmg;
    e.inv = 0.25;
    e.state = e.boss ? e.state : 'hurt'; e.t = 0;
    const p = this.g.player.pos, dx = e.pos.x - p.x, dz = e.pos.z - p.z, L = Math.hypot(dx, dz) || 1;
    if (!e.boss) this.g.physics.move(e.pos, dx / L * knock, dz / L * knock, 0.5, 1);
    e.c.mood?.('hit');
    this.audio.sfx('hit', 0.7);
    this.g.fx.burst(e.pos.x, e.pos.y + 0.8, e.pos.z, [0xffffff, 0xfff2a0], 8, 4);
    if (e.hp <= 0) this.kill(e);
  }
  private kill(e: Enemy): void {
    e.state = 'dead';
    this.audio.sfx('poof', 0.8);
    this.g.fx.burst(e.pos.x, e.pos.y + 0.8, e.pos.z, [0xffd23f, 0xff6fb5, 0x7fd8ff, 0xffffff], e.boss ? 80 : 24, e.boss ? 9 : 5);
    e.c.dispose();
    this.enemies = this.enemies.filter(x => x !== e);
    const s = this.g.save;
    s.fight.defeated++;
    this.g.addXp(e.def.xp);
    if (this.rng() < 0.5 || e.boss) this.drop(e.pos.x, e.pos.z, 'stern');
    if (this.rng() < 0.25) this.drop(e.pos.x + 0.6, e.pos.z, 'herz');
    if (this.rng() < 0.3) this.drop(e.pos.x - 0.6, e.pos.z, 'energie');
    if (e.boss) {
      const id = e.boss.id;
      if (!s.fight.bosses.includes(id)) { s.fight.bosses.push(id); this.g.addStars(20, e.boss.name + ' besiegt'); this.g.give('kristall', 2); }
      this.boss = null; this.bossBar?.remove(); this.bossBar = null;
      for (const m of [...this.enemies]) this.kill(m);
      this.hud?.banner('🏆 ' + e.boss.name + ' besiegt!', 'Er verpufft in tausend Sterne – und der Wald atmet auf.');
      this.g.events.emit('defeat', { enemy: 'boss:' + id, boss: true });
      this.onBossDefeated?.(id);
    } else this.g.events.emit('defeat', { enemy: e.def.kind, boss: false });
    if (this.lock === e) { this.lock = null; this.g.rig.lockTarget = null; }
  }
  private drop(x: number, z: number, kind: Pickup['kind']): void {
    const col = kind === 'herz' ? 0xff4f8a : kind === 'energie' ? 0x7fd8ff : 0xffd23f;
    const m = new THREE.Mesh(kind === 'stern' ? new THREE.OctahedronGeometry(0.3) : new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshBasicMaterial({ color: col }));
    m.position.set(x, this.g.physics.ground(x, z, 50).y + 0.6, z);
    this.g.scene.add(m);
    this.pickups.push({ mesh: m, kind, t: 0 });
  }
  private attack(): void {
    const p = this.g.player;
    this.combo = this.comboT > 0 ? (this.combo % 3) + 1 : 1;
    this.comboT = 0.55; this.atkCd = this.combo === 3 ? 0.45 : 0.25;
    this.g.avatar.play(this.combo === 3 ? 'spin' : 'attack', this.combo === 3 ? 0.45 : 0.3);
    this.audio.sfx('swing', 0.7);
    const reach = this.combo === 3 ? 3.2 : 2.4, arc = this.combo === 3 ? Math.PI : 0.9;
    const dmg = (this.combo === 3 ? 2 : 1) * this.swordDmg();
    // Ausrichten auf nahes Ziel (Zielhilfe)
    const tgt = this.lock ?? this.nearestEnemy(4);
    if (tgt) p.yaw = Math.atan2(tgt.pos.x - p.pos.x, tgt.pos.z - p.pos.z);
    const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw);
    p.push.x += fx * 3; p.push.z += fz * 3;
    for (const e of [...this.enemies]) {
      const dx = e.pos.x - p.pos.x, dz = e.pos.z - p.pos.z, d = Math.hypot(dx, dz);
      const r = reach + (e.boss ? e.boss.scale * 0.8 : 0);
      if (d > r) continue;
      const ang = Math.acos(clamp((dx * fx + dz * fz) / (d || 1), -1, 1));
      if (ang <= arc) this.hitEnemy(e, dmg, this.combo === 3 ? 2.5 : 1.2);
    }
    // Trainingspuppen
    this.dummies.forEach((dm, i) => {
      if (Math.hypot(dm.x - p.pos.x, dm.z - p.pos.z) < 2.8) { dm.hits++; this.audio.sfx('hit', 0.5); this.g.fx.sparkle(dm.x, p.pos.y + 1.6, dm.z, 0xffffff, 5); this.g.events.emit('interact', { id: 'puppe', kind: 'training' }); if (dm.hits % 5 === 0) this.g.events.emit('interact', { id: 'puppe' + i, kind: 'training' }); }
    });
  }
  private special(): void {
    if (this.energy < 1) { this.hud?.toast('Keine Energie für die Lichtwelle – sammle 💠 von Monstern.', '🌟'); return; }
    if (!this.g.hasAbility('lichtwelle')) { this.hud?.toast('Die Lichtwelle bringt dir Kampfmeister Kai bei (Trainings-Lichtung).', '🥋'); return; }
    this.energy -= 1;
    const p = this.g.player.pos;
    this.g.avatar.play('cast', 0.6);
    this.audio.sfx('magic', 0.9);
    for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU; this.g.fx.emit(p.x, p.y + 1, p.z, Math.cos(a) * 12, 0.5, Math.sin(a) * 12, i % 2 ? 0xfff2a0 : 0x9fe8ff, 0.5, 0.6, 0); }
    for (const e of [...this.enemies]) if (Math.hypot(e.pos.x - p.x, e.pos.z - p.z) < 7) this.hitEnemy(e, 3 * this.swordDmg(), 4);
  }
  private nearestEnemy(max: number): Enemy | null {
    let best: Enemy | null = null, bd = max;
    const p = this.g.player.pos;
    for (const e of this.enemies) { const d = Math.hypot(e.pos.x - p.x, e.pos.z - p.z); if (d < bd) { bd = d; best = e; } }
    return best;
  }
  update(dt: number, time: number): void {
    const g = this.g, inp = g.input, p = g.player;
    this.inv = Math.max(0, this.inv - dt); this.atkCd = Math.max(0, this.atkCd - dt); this.comboT = Math.max(0, this.comboT - dt);
    // Trainingspuppen gibt es immer (sie sind Teil der Trainings-Lichtung)
    if (!this.inForest || g.vehicleCheck()) { this.blocking = false; return; }
    if (g.busy === 0) {
      if (inp.pressed('attack') && this.atkCd <= 0 && this.dodgeT <= 0) this.attack();
      if (inp.pressed('dodge') && this.dodgeT <= 0) {
        this.dodgeT = 0.42; this.inv = 0.45;
        const mx = inp.moveX, my = inp.moveY, cy = g.rig.yaw;
        const dx = Math.sin(cy) * my - Math.cos(cy) * mx || Math.sin(p.yaw), dz = Math.cos(cy) * my + Math.sin(cy) * mx || Math.cos(p.yaw);
        const L = Math.hypot(dx, dz) || 1;
        p.push.x = dx / L * 15; p.push.z = dz / L * 15;
        g.avatar.play('spin', 0.4); this.audio.sfx('whoosh', 0.6);
      }
      this.blocking = inp.isHeld('block');
      if (this.blocking && !g.avatar.emoting) g.avatar.play('block', 0.2);
      if (inp.pressed('special')) this.special();
      if (inp.pressed('lockon')) { this.lock = this.lock ? null : this.nearestEnemy(18); g.rig.lockTarget = this.lock?.pos ?? null; }
    }
    this.dodgeT = Math.max(0, this.dodgeT - dt);
    // Gegner auftauchen lassen
    const cap = Math.round((this.boss ? 3 : 5) * (0.7 + this.diff() * 0.3));
    this.spawnT -= dt;
    const inner = Math.hypot(p.pos.x - FOREST.x, p.pos.z - FOREST.z) < FOREST.r - 10;
    const nearTraining = Math.hypot(p.pos.x + 168, p.pos.z + 102) < 16;
    if (this.spawnT <= 0 && this.enemies.length < cap && inner && !nearTraining) {
      this.spawnT = 3.5 + this.rng() * 3;
      const a = this.rng() * TAU, d = 12 + this.rng() * 8;
      const x = p.pos.x + Math.cos(a) * d, z = p.pos.z + Math.sin(a) * d;
      if (Math.hypot(x - FOREST.x, z - FOREST.z) < FOREST.r - 8 && Math.hypot(x + 168, z + 102) > 16) { const pool = this.pool(); this.spawn(pool[Math.floor(this.rng() * pool.length)], x, z); }
    }
    // Gegner-KI
    for (const e of [...this.enemies]) this.think(e, dt, time);
    // Geschosse
    for (const s of [...this.shots]) {
      s.t += dt; s.vy -= 6 * dt;
      s.mesh.position.x += s.vx * dt; s.mesh.position.z += s.vz * dt; s.mesh.position.y += s.vy * dt;
      const d = Math.hypot(s.mesh.position.x - p.pos.x, s.mesh.position.z - p.pos.z);
      if (d < 0.8 && Math.abs(s.mesh.position.y - (p.pos.y + 1)) < 1.2) { this.damagePlayer(s.dmg, s.mesh.position.x - s.vx, s.mesh.position.z - s.vz); s.t = 99; }
      if (s.t > 3 || s.mesh.position.y < g.field.height(s.mesh.position.x, s.mesh.position.z)) { g.scene.remove(s.mesh); s.mesh.geometry.dispose(); this.shots.splice(this.shots.indexOf(s), 1); }
    }
    // Pfützen (Boss-Flächenangriffe mit Vorwarnung)
    for (const pu of [...this.puddles]) {
      pu.t -= dt;
      const m = pu.mesh.material as THREE.MeshBasicMaterial;
      if (pu.warn) { m.opacity = 0.25 + Math.sin(time * 18) * 0.15; if (pu.t <= 0) { pu.warn = false; pu.t = 0.6; m.color.setHex(0x8f7fff); m.opacity = 0.7; g.rig.addShake(0.3); this.audio.sfx('bump', 0.8); if (Math.hypot(p.pos.x - pu.x, p.pos.z - pu.z) < pu.r && p.grounded) this.damagePlayer(1, pu.x, pu.z); } }
      else if (pu.t <= 0) { g.scene.remove(pu.mesh); pu.mesh.geometry.dispose(); this.puddles.splice(this.puddles.indexOf(pu), 1); }
    }
    // Beute
    for (const pk of [...this.pickups]) {
      pk.t += dt; pk.mesh.rotation.y += dt * 3; pk.mesh.position.y += Math.sin(pk.t * 4) * 0.005;
      const d = Math.hypot(pk.mesh.position.x - p.pos.x, pk.mesh.position.z - p.pos.z);
      if (d < 4) { pk.mesh.position.x = damp(pk.mesh.position.x, p.pos.x, 6, dt); pk.mesh.position.z = damp(pk.mesh.position.z, p.pos.z, 6, dt); }
      if (d < 1.0 || pk.t > 20) {
        if (pk.t <= 20) { if (pk.kind === 'herz') this.heal(1); if (pk.kind === 'energie') this.energy = Math.min(5, this.energy + 1); if (pk.kind === 'stern') g.addStars(1); this.audio.sfx('pickup', 0.6); }
        g.scene.remove(pk.mesh); pk.mesh.geometry.dispose(); this.pickups.splice(this.pickups.indexOf(pk), 1);
      }
    }
    if (this.boss && this.bossBar) { const i = this.bossBar.querySelector('i') as HTMLElement; i.style.width = clamp(this.boss.hp / (this.boss.boss!.hp * this.diff()) * 100, 0, 100) + '%'; }
    if (this.lock && !this.enemies.includes(this.lock)) { this.lock = null; g.rig.lockTarget = null; }
    // Energie lädt langsam nach
    this.energy = Math.min(5, this.energy + dt * 0.05);
  }
  private think(e: Enemy, dt: number, time: number): void {
    const g = this.g, p = g.player.pos;
    e.t += dt; e.inv = Math.max(0, e.inv - dt);
    const dx = p.x - e.pos.x, dz = p.z - e.pos.z, d = Math.hypot(dx, dz);
    let speed = 0;
    if (d > 45 && !e.boss) { e.c.dispose(); this.enemies = this.enemies.filter(x => x !== e); return; }
    const want = Math.atan2(dx, dz);
    e.yaw = dampAngle(e.yaw, want, e.state === 'attack' ? 1 : 6, dt);
    const reach = e.def.reach + (e.boss ? e.boss.scale : 0);
    switch (e.state) {
      case 'hurt': if (e.t > 0.35) { e.state = 'move'; e.t = 0; } break;
      case 'idle': if (d < 22) { e.state = 'move'; e.t = 0; } break;
      case 'move': {
        if (e.def.beh === 'ranged' || e.def.beh === 'float') {
          if (d < reach * 0.6) speed = -e.def.speed * 0.6; else if (d > reach) speed = e.def.speed;
          e.shotT -= dt;
          if (e.shotT <= 0 && d < reach + 2) { e.state = 'wind'; e.t = 0; }
        } else {
          speed = d > reach * 0.8 ? e.def.speed * (e.boss ? 1 : 1) : 0;
          if (d < reach) { e.state = 'wind'; e.t = 0; }
        }
        if (e.boss) {
          e.phase += dt;
          if (e.phase > 6) { e.phase = 0; this.bossSpecial(e); }
        }
        break;
      }
      case 'wind': // deutliches Ausholen (gut erkennbar)
        e.c.root.scale.setScalar(1 + Math.sin(e.t * 30) * 0.06);
        if (e.t > (e.boss ? 0.8 : 0.55)) {
          e.c.root.scale.setScalar(1);
          e.state = 'attack'; e.t = 0;
          if (e.def.beh === 'ranged' || e.def.beh === 'float') { this.shoot(e); e.shotT = 2.2 + this.rng() * 1.5; }
          else if (e.def.beh === 'charge') e.charge = { x: dx / (d || 1), z: dz / (d || 1) };
        }
        break;
      case 'attack':
        if (e.def.beh === 'charge' && e.charge && e.t < 0.6) { g.physics.move(e.pos, e.charge.x * 11 * dt, e.charge.z * 11 * dt, 0.6, 1); if (d < reach * 0.8) this.damagePlayer(e.def.dmg, e.pos.x, e.pos.z); }
        else if (e.def.beh !== 'ranged' && e.def.beh !== 'float' && e.t < 0.05 && d < reach + 0.4) this.damagePlayer(e.def.dmg, e.pos.x, e.pos.z);
        if (e.t > 0.7) { e.state = 'move'; e.t = 0; }
        break;
    }
    if (speed) { const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw); g.physics.move(e.pos, fx * speed * dt, fz * speed * dt, e.boss ? 1.5 : 0.5, 1); }
    // Im Wald bleiben
    const fd = Math.hypot(e.pos.x - FOREST.x, e.pos.z - FOREST.z);
    if (fd > FOREST.r - 6) { e.pos.x = FOREST.x + (e.pos.x - FOREST.x) * (FOREST.r - 6) / fd; e.pos.z = FOREST.z + (e.pos.z - FOREST.z) * (FOREST.r - 6) / fd; }
    const gy = g.physics.ground(e.pos.x, e.pos.z, e.pos.y + 1).y;
    e.pos.y = damp(e.pos.y, gy, 10, dt);
    e.c.root.position.copy(e.pos);
    e.c.root.rotation.y = e.yaw;
    e.c.update(dt, Math.abs(speed));
    if (e.inv > 0) e.c.root.visible = Math.sin(time * 60) > 0; else e.c.root.visible = true;
  }
  private shoot(e: Enemy): void {
    const p = this.g.player.pos;
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), new THREE.MeshBasicMaterial({ color: e.def.kind === 'frostgeist' ? 0xbfe9ff : e.def.kind === 'lavadrache' ? 0xff7a3a : 0xc79bff }));
    m.position.set(e.pos.x, e.pos.y + 1, e.pos.z);
    this.g.scene.add(m);
    const dx = p.x - e.pos.x, dz = p.z - e.pos.z, d = Math.hypot(dx, dz) || 1, sp = 7;
    this.shots.push({ mesh: m, vx: dx / d * sp, vz: dz / d * sp, vy: 2.5 + d * 0.15, t: 0, dmg: e.def.dmg });
    this.audio.sfx('whoosh', 0.5);
  }
  private bossSpecial(e: Enemy): void {
    const b = e.boss!, p = this.g.player.pos;
    const r = this.rng();
    if (r < 0.4) {
      // Minions rufen
      for (let i = 0; i < 2; i++) { const a = this.rng() * TAU; this.spawn(b.minions[i % b.minions.length], e.pos.x + Math.cos(a) * 4, e.pos.z + Math.sin(a) * 4); }
      this.hud?.toast(b.name + ' ruft Helfer!', '📣', 1800);
    } else {
      // Flächenangriff mit Vorwarnung (rote Kreise)
      const n = b.id === 'klecks' ? 4 : 3;
      for (let i = 0; i < n; i++) {
        const x = p.x + (this.rng() - 0.5) * 8, z = p.z + (this.rng() - 0.5) * 8, rr = 2.6;
        const mm = new THREE.Mesh(new THREE.CircleGeometry(rr, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff4040, transparent: true, opacity: 0.35, depthWrite: false }));
        mm.position.set(x, this.g.physics.ground(x, z, 50).y + 0.06, z); mm.renderOrder = 3;
        this.g.scene.add(mm);
        this.puddles.push({ mesh: mm, t: 1.3, x, z, r: rr, warn: true });
      }
      this.hud?.toast('Achtung – rote Kreise! Ausweichen! 🌀', '⚠️', 1500);
    }
  }
  /** Trainings-Lichtung: Puppen gibt es auch ohne Gegner. */
  dummyHits(): number { return this.dummies.reduce((a, d) => a + d.hits, 0); }
}
