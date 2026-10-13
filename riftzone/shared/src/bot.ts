// Bot-KI: Absprungziel, Beute, Navigation mit Hindernis-Tastern, Kampf mit Reaktionszeit und Zielfehler,
// Deckung, Heilen, Bauen unter Beschuss, Wiederbeleben und Zonenwechsel.
import { BUILD_COST, DT, EYE_HEIGHT, MAP_SIZE, WATER_LEVEL } from './constants';
import { AMMO_MAX, DropKind, GRENADE_ID, consumable, weapon } from './items';
import { Rng, angleDiff, clamp, dist2, wrapAngle } from './math';
import { POIS } from './mapdef';
import { Kind } from './pieces';
import { Act, Btn, Mode, Phase, packAct, type PlayerInput } from './types';
import { SHOULDER, SLOT_COUNT, type Match, type Player } from './match';

const enum St {
  Drop,
  Loot,
  Fight,
  Heal,
  Rotate,
  Revive,
  Wander,
}

interface Brain {
  seq: number;
  skill: number;
  st: St;
  rng: Rng;
  dropX: number;
  dropZ: number;
  busBest: number;
  goalX: number;
  goalZ: number;
  goalY: number;
  goalItem: number;
  goalPiece: number;
  enemy: number;
  seenT: number;
  reaction: number;
  errYaw: number;
  errPitch: number;
  strafe: number;
  strafeT: number;
  stuckT: number;
  lastX: number;
  lastZ: number;
  detourT: number;
  detourX: number;
  detourZ: number;
  thinkCd: number;
  yaw: number;
  pitch: number;
  buildCd: number;
  buildSeq: number;
  jumpCd: number;
  hurtT: number;
  lastHp: number;
  avoid: number;
  avoidT: number;
  interactCd: number;
  wantSlot: number;
  coverT: number;
  noSightT: number;
  wanderT: number;
  harvestT: number;
}

const brainsOf = (m: Match): Map<number, Brain> => m.botBrains as Map<number, Brain>;

const SKILL = {
  view: [95, 130, 165],
  err0: [0.22, 0.13, 0.075],
  errDecay: [1.1, 1.9, 2.9],
  errFloor: [0.04, 0.022, 0.012],
  react: [0.7, 0.42, 0.24],
  turn: [4.5, 7, 10],
  buildChance: [0.0, 0.45, 0.85],
};

function brainFor(m: Match, p: Player): Brain {
  const brains = brainsOf(m);
  let b = brains.get(p.id);
  if (!b) {
    const rng = new Rng((m.cfg.seed ^ (p.id * 2654435761)) >>> 0);
    const skill = clamp(Math.round(m.cfg.botSkill + rng.range(-0.6, 0.6)), 0, 2);
    b = {
      seq: 0,
      skill,
      st: St.Drop,
      rng,
      dropX: 0,
      dropZ: 0,
      busBest: Infinity,
      goalX: p.body.x,
      goalZ: p.body.z,
      goalY: 0,
      goalItem: -1,
      goalPiece: -1,
      enemy: -1,
      seenT: 0,
      reaction: 0,
      errYaw: 0,
      errPitch: 0,
      strafe: 1,
      strafeT: 0,
      stuckT: 0,
      lastX: p.body.x,
      lastZ: p.body.z,
      detourT: 0,
      detourX: 0,
      detourZ: 0,
      thinkCd: p.id % 9,
      yaw: 0,
      pitch: 0,
      buildCd: 0,
      buildSeq: 0,
      jumpCd: 0,
      hurtT: 0,
      lastHp: 200,
      avoid: 0,
      avoidT: 0,
      interactCd: 0,
      wantSlot: -1,
      coverT: 0,
      noSightT: 0,
      wanderT: 0,
      harvestT: 0,
    };
    chooseDrop(m, p, b);
    brains.set(p.id, b);
  }
  return b;
}

/** Absprungziel wählen – Team-Mitglieder nehmen das Ziel des Teamführers. */
function chooseDrop(m: Match, p: Player, b: Brain): void {
  const lead = m.players.find((q) => q.team === p.team && q.bot && q.id < p.id);
  const lb = lead ? brainsOf(m).get(lead.id) : undefined;
  if (lb) {
    b.dropX = lb.dropX + b.rng.range(-12, 12);
    b.dropZ = lb.dropZ + b.rng.range(-12, 12);
    return;
  }
  if (b.rng.chance(0.75)) {
    const poi = b.rng.weighted(POIS as unknown as (typeof POIS)[number][], POIS.map((q) => q.loot * 1.5 + 1));
    // auf ein Gebäude des Ortes zielen
    const bl = m.content.buildings.filter((x) => x.poi === poi.id);
    const t = bl.length ? b.rng.pick(bl) : { x: poi.x, z: poi.z };
    b.dropX = t.x + b.rng.range(-8, 8);
    b.dropZ = t.z + b.rng.range(-8, 8);
  } else {
    const bl = m.content.buildings;
    const t = b.rng.pick(bl);
    b.dropX = t.x;
    b.dropZ = t.z;
  }
}

function weaponScore(id: number, dist: number): number {
  const w = weapon(id);
  if (!w || id === GRENADE_ID) return -1;
  switch (w.model) {
    case 'shotgun':
      return dist < 10 ? 10 : dist < 18 ? 5 : 0.5;
    case 'smg':
      return dist < 22 ? 8 : dist < 40 ? 5 : 1;
    case 'rifle':
    case 'burst':
      return dist < 10 ? 4 : dist < 90 ? 8 : 5;
    case 'sniper':
      return dist > 70 ? 9 : dist > 35 ? 4 : 0.2;
    case 'pistol':
      return dist < 40 ? 3 : 1.5;
    case 'launcher':
      return dist > 15 && dist < 80 ? 6 : 0.5;
    default:
      return 0;
  }
}

function bestWeaponSlot(p: Player, dist: number): number {
  let best = -1,
    bs = 0;
  for (let s = 1; s < SLOT_COUNT; s++) {
    const sl = p.slots[s]!;
    const w = weapon(sl.id);
    if (!w || sl.id === GRENADE_ID) continue;
    if (sl.qty <= 0 && p.ammo[w.ammo]! <= 0) continue;
    const sc = weaponScore(sl.id, dist) * (1 + sl.rarity * 0.08) * (sl.qty > 0 ? 1 : 0.6);
    if (sc > bs) {
      bs = sc;
      best = s;
    }
  }
  return best;
}

function healSlot(p: Player): number {
  for (let s = 1; s < SLOT_COUNT; s++) {
    const c = consumable(p.slots[s]!.id);
    if (!c) continue;
    if (c.shield > 0 && p.shield < c.shieldCap) return s;
    if (c.hp > 0 && p.hp < c.hpCap) return s;
  }
  return -1;
}

function weaponCount(p: Player): number {
  let n = 0;
  for (let s = 1; s < SLOT_COUNT; s++) {
    const w = weapon(p.slots[s]!.id);
    if (w && p.slots[s]!.id !== GRENADE_ID && (p.slots[s]!.qty > 0 || p.ammo[w.ammo]! > 0)) n++;
  }
  return n;
}

function freeSlots(p: Player): number {
  let n = 0;
  for (let s = 1; s < SLOT_COUNT; s++) if (p.slots[s]!.id < 0) n++;
  return n;
}

/** Interessiert sich der Bot für diesen Gegenstand? */
function wants(p: Player, kind: DropKind, id: number, rarity: number): number {
  if (kind === DropKind.Ammo) {
    for (let s = 1; s < SLOT_COUNT; s++) if (weapon(p.slots[s]!.id)?.ammo === id && p.ammo[id]! < (AMMO_MAX[id] ?? 0) * 0.7) return 3;
    return 0;
  }
  if (kind === DropKind.Material) return p.mats[id]! < 300 ? 1 : 0;
  const w = weapon(id);
  if (w) {
    if (id === GRENADE_ID) return freeSlots(p) > 1 ? 1 : 0;
    // gleiche Art schon vorhanden?
    for (let s = 1; s < SLOT_COUNT; s++) {
      const o = weapon(p.slots[s]!.id);
      if (o && o.model === w.model) return rarity > p.slots[s]!.rarity ? 2 : 0;
    }
    return freeSlots(p) > 0 ? 5 - Math.min(3, weaponCount(p)) : 0;
  }
  const c = consumable(id);
  if (c) {
    for (let s = 1; s < SLOT_COUNT; s++) if (p.slots[s]!.id === id && p.slots[s]!.qty < c.stack) return 2;
    return freeSlots(p) > 0 && weaponCount(p) >= 1 ? 2.5 : 0;
  }
  return 0;
}

function visibleEnemy(m: Match, p: Player, b: Brain): Player | null {
  const view = SKILL.view[b.skill]!;
  const ex = p.body.x,
    ey = p.body.y + EYE_HEIGHT,
    ez = p.body.z;
  const cand: [number, Player][] = [];
  for (const q of m.players) {
    if (!q.alive || q.team === p.team || q.body.mode === Mode.Bus || q.body.mode === Mode.Dead) continue;
    const d2 = dist2(q.body.x, q.body.z, ex, ez);
    if (d2 > view * view) continue;
    // Blickfeld (außer bei Angreifer oder sehr nah)
    const ang = Math.atan2(-(q.body.x - ex), -(q.body.z - ez));
    const inFov = Math.abs(angleDiff(p.yaw, ang)) < 1.25 || d2 < 15 * 15 || q.id === p.lastAttacker;
    if (!inFov) continue;
    cand.push([d2, q]);
  }
  cand.sort((a, c) => a[0] - c[0]);
  for (let i = 0; i < Math.min(3, cand.length); i++) {
    const q = cand[i]![1];
    if (m.world.lineOfSight(ex, ey, ez, q.body.x, q.body.y + 1.3, q.body.z)) return q;
  }
  return null;
}

/** Richtung zum Ziel mit einfachem Ausweichen (Taster nach vorn, links, rechts). */
function steer(m: Match, p: Player, b: Brain, tx: number, tz: number, inp: PlayerInput): number {
  const bx = p.body.x,
    bz = p.body.z;
  let want = Math.atan2(-(tx - bx), -(tz - bz));
  if (b.detourT > 0) {
    b.detourT -= DT;
    want = Math.atan2(-(b.detourX - bx), -(b.detourZ - bz));
  }
  // Taster alle 3 Ticks
  if (m.tick % 3 === p.id % 3 && p.body.mode !== Mode.Swim) {
    let door = -1;
    const probe = (a: number): number => {
      const dx = -Math.sin(a),
        dz = -Math.cos(a);
      const h = m.world.raycast(bx, p.body.y + 0.9, bz, dx, 0, dz, 3.2, false);
      if (h.piece >= 0 && h.t < 2.4 && m.world.pieces[h.piece]!.kind === Kind.Door) door = h.piece;
      return h.t;
    };
    const f = probe(want);
    if (door >= 0 && b.interactCd <= 0) {
      inp.actions.push(packAct(Act.InteractPress));
      b.interactCd = 0.8;
    } else if (f < 3.1) {
      const l = probe(want + 0.75),
        r = probe(want - 0.75);
      b.avoid = l >= r ? 0.75 : -0.75;
      if (Math.max(l, r) < 1.5) b.avoid *= 2;
      b.avoidT = 0.5;
      // Nur über niedrige Hindernisse springen/klettern
      if (f < 1.2 && b.jumpCd <= 0) {
        const dx = -Math.sin(want),
          dz = -Math.cos(want);
        const high = m.world.raycast(bx, p.body.y + 2.6, bz, dx, 0, dz, 2, false).t;
        if (high >= 2) {
          inp.buttons |= Btn.Jump;
          b.jumpCd = 0.6;
        }
      }
    }
  }
  if (b.avoidT > 0) {
    b.avoidT -= DT;
    want += b.avoid;
  }
  return want;
}

function stuckCheck(p: Player, b: Brain, inp: PlayerInput, moving: boolean): void {
  if (!moving) {
    b.stuckT = 0;
    return;
  }
  if (p.body.mode !== Mode.Ground && p.body.mode !== Mode.Swim) return;
  if (m2(p.body.x, p.body.z, b.lastX, b.lastZ) < 0.12 * 0.12) b.stuckT += DT;
  else b.stuckT = Math.max(0, b.stuckT - DT * 2);
  b.lastX = p.body.x;
  b.lastZ = p.body.z;
  if (b.stuckT > 0.8 && b.jumpCd <= 0) {
    inp.buttons |= Btn.Jump;
    b.jumpCd = 0.8;
  }
  if (b.stuckT > 2.2) {
    const a = b.rng.next() * Math.PI * 2;
    b.detourX = clamp(p.body.x + Math.cos(a) * 14, 10, MAP_SIZE - 10);
    b.detourZ = clamp(p.body.z + Math.sin(a) * 14, 10, MAP_SIZE - 10);
    b.detourT = 1.8;
    b.stuckT = 0;
  }
}
const m2 = dist2;

function aimAt(p: Player, b: Brain, q: Player, dt: number, head: boolean): number {
  // Ziel: Brust oder Kopf, Versatz durch Kamerastrahl über der Schulter berücksichtigen
  const tx = q.body.x + q.body.vx * 0.08,
    ty = q.body.y + (q.body.mode === Mode.Downed ? 0.4 : head ? 1.55 : 1.15),
    tz = q.body.z + q.body.vz * 0.08;
  let yaw = Math.atan2(-(tx - p.body.x), -(tz - p.body.z));
  const ox = p.body.x + Math.cos(yaw) * SHOULDER,
    oz = p.body.z - Math.sin(yaw) * SHOULDER;
  yaw = Math.atan2(-(tx - ox), -(tz - oz));
  const oy = p.body.y + EYE_HEIGHT + 0.25;
  const hd = Math.hypot(tx - ox, tz - oz);
  const pitch = Math.atan2(ty - oy, hd);
  // Fehler abbauen
  b.errYaw *= Math.exp(-SKILL.errDecay[b.skill]! * dt);
  b.errPitch *= Math.exp(-SKILL.errDecay[b.skill]! * dt);
  const floor = SKILL.errFloor[b.skill]!;
  const jy = (b.rng.next() - 0.5) * floor * 2,
    jp = (b.rng.next() - 0.5) * floor;
  const wantYaw = yaw + b.errYaw + jy,
    wantPitch = pitch + b.errPitch + jp;
  const maxTurn = SKILL.turn[b.skill]! * dt;
  b.yaw = wrapAngle(b.yaw + clamp(angleDiff(b.yaw, wantYaw), -maxTurn, maxTurn));
  b.pitch = b.pitch + clamp(wantPitch - b.pitch, -maxTurn, maxTurn);
  return Math.abs(angleDiff(b.yaw, yaw)) + Math.abs(b.pitch - pitch);
}

function lookToward(b: Brain, yaw: number, dt: number, rate = 6): void {
  const maxTurn = rate * dt;
  b.yaw = wrapAngle(b.yaw + clamp(angleDiff(b.yaw, yaw), -maxTurn, maxTurn));
  b.pitch += clamp(-0.05 - b.pitch, -maxTurn, maxTurn);
}

/** Erzeugt die Eingabe eines Bots für diesen Tick. */
export function botThink(m: Match, p: Player): PlayerInput {
  const b = brainFor(m, p);
  const inp: PlayerInput = { seq: ++b.seq, mx: 0, mz: 0, yaw: b.yaw, pitch: b.pitch, buttons: 0, actions: [], viewTick: m.tick };
  const body = p.body;
  b.jumpCd -= DT;
  b.buildCd -= DT;
  b.interactCd -= DT;
  // Schaden bemerkt?
  const hpNow = p.hp + p.shield;
  if (hpNow < b.lastHp - 0.5) b.hurtT = 2.5;
  b.lastHp = hpNow;
  b.hurtT -= DT;

  switch (body.mode) {
    case Mode.Bus: {
      const [x, , z] = m.busPos();
      const d = Math.hypot(x - b.dropX, z - b.dropZ);
      if (m.canJump() && (d > b.busBest + 4 || d < 140 || m.busT > m.busDuration - 2)) inp.actions.push(packAct(Act.JumpBus));
      b.busBest = Math.min(b.busBest, d);
      return inp;
    }
    case Mode.Freefall:
    case Mode.Glide: {
      const dx = b.dropX - body.x,
        dz = b.dropZ - body.z;
      const hd = Math.hypot(dx, dz);
      b.yaw = Math.atan2(-dx, -dz);
      inp.yaw = b.yaw;
      const above = body.y - m.world.terrain.height(body.x, body.z);
      if (hd > 6) inp.mz = 1;
      if (body.mode === Mode.Freefall && hd < above * 0.55) inp.buttons |= Btn.Dive;
      if (body.mode === Mode.Glide && hd < 20) inp.buttons |= Btn.Dive;
      return inp;
    }
    case Mode.Vehicle:
      inp.actions.push(packAct(Act.InteractPress));
      return inp;
    case Mode.Dead:
      return inp;
    default:
      break;
  }

  // ---- Entscheidungen (gestaffelt) ----
  b.thinkCd--;
  let enemy = b.enemy >= 0 ? m.byId.get(b.enemy) : undefined;
  if (enemy && (!enemy.alive || enemy.body.mode === Mode.Dead)) {
    enemy = undefined;
    b.enemy = -1;
  }
  if (b.thinkCd <= 0) {
    b.thinkCd = 8 + (p.id % 3);
    const vis = visibleEnemy(m, p, b);
    if (vis) {
      if (vis.id !== b.enemy) {
        b.enemy = vis.id;
        b.reaction = SKILL.react[b.skill]! * b.rng.range(0.8, 1.3);
        const e0 = SKILL.err0[b.skill]!;
        b.errYaw = b.rng.range(-e0, e0);
        b.errPitch = b.rng.range(-e0 * 0.5, e0 * 0.5);
      }
      enemy = vis;
      b.seenT = m.time;
      b.noSightT = 0;
    } else if (enemy && m.time - b.seenT > 4) {
      b.enemy = -1;
      enemy = undefined;
    }
    decide(m, p, b, enemy ?? null);
  }

  // Unten: Kriechen zum nächsten Teamkameraden oder weg vom Gegner
  if (body.mode === Mode.Downed) {
    const mate = m.players.find((q) => q.team === p.team && q !== p && q.alive && q.body.mode !== Mode.Downed);
    const tx = mate ? mate.body.x : body.x + (enemy ? body.x - enemy.body.x : 1),
      tz = mate ? mate.body.z : body.z + (enemy ? body.z - enemy.body.z : 0);
    const want = steer(m, p, b, tx, tz, inp);
    lookToward(b, want, DT);
    inp.yaw = b.yaw;
    inp.mz = Math.hypot(tx - body.x, tz - body.z) > 2 ? 1 : 0;
    return inp;
  }

  switch (b.st) {
    case St.Fight:
      if (enemy) fight(m, p, b, enemy, inp);
      else b.st = St.Wander;
      break;
    case St.Heal: {
      const hs = healSlot(p);
      if (hs < 0) {
        b.st = St.Wander;
        break;
      }
      if (p.sel !== hs) inp.actions.push(packAct(Act.Slot, hs));
      else inp.buttons |= Btn.Fire;
      // In Deckung: leicht bewegen erlaubt nicht – stehen bleiben
      inp.yaw = b.yaw;
      break;
    }
    case St.Revive: {
      const q = m.byId.get(b.goalItem);
      if (!q || q.body.mode !== Mode.Downed) {
        b.st = St.Wander;
        break;
      }
      const d = Math.hypot(q.body.x - body.x, q.body.z - body.z);
      const want = steer(m, p, b, q.body.x, q.body.z, inp);
      lookToward(b, want, DT);
      if (d > 1.6) {
        inp.mz = 1;
        stuckCheck(p, b, inp, true);
      } else inp.buttons |= Btn.Interact;
      break;
    }
    default:
      move(m, p, b, inp);
      break;
  }
  inp.yaw = b.yaw;
  inp.pitch = b.pitch;
  if (b.wantSlot >= 0 && p.sel !== b.wantSlot && !p.build) {
    inp.actions.push(packAct(Act.Slot, b.wantSlot));
  }
  return inp;
}

function decide(m: Match, p: Player, b: Brain, enemy: Player | null): void {
  const body = p.body;
  // Teamkamerad niedergeschlagen?
  if (!enemy) {
    const downed = m.players.find((q) => q.team === p.team && q !== p && q.alive && q.body.mode === Mode.Downed && dist2(q.body.x, q.body.z, body.x, body.z) < 70 * 70);
    if (downed) {
      b.st = St.Revive;
      b.goalItem = downed.id;
      return;
    }
  }
  const armed = weaponCount(p) > 0;
  const enemyDist = enemy ? Math.hypot(enemy.body.x - body.x, enemy.body.z - body.z) : Infinity;
  if (enemy && (armed || (enemyDist < 3.5 && b.hurtT > 0))) {
    const lowHp = p.hp + p.shield < 45;
    if (lowHp && healSlot(p) >= 0 && b.rng.chance(0.5) && Math.hypot(enemy.body.x - body.x, enemy.body.z - body.z) > 20) {
      // Rückzug in Deckung
      b.st = St.Rotate;
      b.coverT = 3;
      const ax = body.x - enemy.body.x,
        az = body.z - enemy.body.z;
      const l = Math.hypot(ax, az) || 1;
      b.goalX = body.x + (ax / l) * 22;
      b.goalZ = body.z + (az / l) * 22;
      return;
    }
    b.st = St.Fight;
    return;
  }
  b.wantSlot = -1;
  // Heilen wenn sicher
  if (m.time - b.seenT > 2.5 && b.hurtT <= 0 && healSlot(p) >= 0 && (p.hp < 80 || p.shield < 50)) {
    b.st = St.Heal;
    return;
  }
  // Zone
  const z = m.zone;
  if (m.phase === Phase.Play) {
    const outNow = Math.hypot(body.x - z.cx, body.z - z.cz) > z.r - 15;
    const urgent = z.shrinking || z.timer < 25;
    const outNext = Math.hypot(body.x - z.tx, body.z - z.tz) > z.tr * 0.85;
    if (outNow || (urgent && outNext)) {
      b.st = St.Rotate;
      const a = b.rng.next() * Math.PI * 2;
      const rr = z.tr * 0.5 * b.rng.next();
      if (b.goalItem !== -99 || Math.hypot(b.goalX - z.tx, b.goalZ - z.tz) > z.tr) {
        b.goalX = z.tx + Math.cos(a) * rr;
        b.goalZ = z.tz + Math.sin(a) * rr;
        b.goalItem = -99;
      }
      return;
    }
  }
  // Beute suchen
  let best = -1,
    bs = 0;
  for (const it of m.items) {
    if (!it.alive) continue;
    const d2 = dist2(it.x, it.z, body.x, body.z);
    if (d2 > 50 * 50 || Math.abs(it.y - body.y) > 12) continue;
    const w = wants(p, it.kind, it.item, it.rarity);
    if (w <= 0) continue;
    const sc = w / (8 + Math.sqrt(d2));
    if (sc > bs) {
      bs = sc;
      best = it.id;
    }
  }
  // Kisten
  let chest = -1,
    cd = 40 * 40;
  if (weaponCount(p) < 3 || healSlot(p) < 0) {
    m.world.query(body.x - 40, body.z - 40, body.x + 40, body.z + 40, (pc) => {
      if (pc.kind !== Kind.Chest || pc.state !== 0 || !pc.alive) return;
      const d2 = dist2(pc.x, pc.z, body.x, body.z);
      if (d2 < cd && Math.abs(pc.y - body.y) < 10) {
        cd = d2;
        chest = pc.id;
      }
    });
  }
  if (chest >= 0 && (best < 0 || cd < 12 * 12 || bs < 0.08)) {
    const pc = m.world.pieces[chest]!;
    b.st = St.Loot;
    b.goalItem = -1;
    b.goalPiece = chest;
    b.goalX = pc.x;
    b.goalZ = pc.z;
    b.goalY = pc.y;
    return;
  }
  if (best >= 0) {
    const it = m.items.find((i) => i.id === best)!;
    b.st = St.Loot;
    b.goalItem = best;
    b.goalPiece = -1;
    b.goalX = it.x;
    b.goalZ = it.z;
    b.goalY = it.y;
    return;
  }
  // Teamführer folgen
  const lead = m.players.find((q) => q.team === p.team && q.alive && q.id < p.id && q.body.mode !== Mode.Downed);
  if (lead && dist2(lead.body.x, lead.body.z, body.x, body.z) > 35 * 35) {
    b.st = St.Wander;
    b.goalX = lead.body.x + b.rng.range(-6, 6);
    b.goalZ = lead.body.z + b.rng.range(-6, 6);
    b.wanderT = 6;
    return;
  }
  // Umherziehen: zum nächsten Ort in der Zone
  if (b.st !== St.Wander || b.wanderT <= 0 || dist2(b.goalX, b.goalZ, body.x, body.z) < 9) {
    b.st = St.Wander;
    b.wanderT = 25;
    const inZone = m.content.buildings.filter((x) => Math.hypot(x.x - z.tx, x.z - z.tz) < Math.max(40, z.tr * 0.9) && dist2(x.x, x.z, body.x, body.z) > 30 * 30);
    if (inZone.length) {
      const t = b.rng.pick(inZone);
      b.goalX = t.x;
      b.goalZ = t.z;
    } else {
      const a = b.rng.next() * Math.PI * 2;
      b.goalX = clamp(z.tx + Math.cos(a) * z.tr * 0.6, 60, MAP_SIZE - 60);
      b.goalZ = clamp(z.tz + Math.sin(a) * z.tr * 0.6, 60, MAP_SIZE - 60);
    }
  }
}

function move(m: Match, p: Player, b: Brain, inp: PlayerInput): void {
  const body = p.body;
  b.wanderT -= DT;
  if (b.coverT > 0) b.coverT -= DT;
  // Waffe in der Hand halten (beste für mittlere Distanz)
  if (b.st !== St.Heal) {
    const s = bestWeaponSlot(p, 30);
    b.wantSlot = s >= 0 ? s : 0;
    if (p.build) inp.actions.push(packAct(Act.BuildToggle));
  }
  // Ziel aktualisieren (Gegenstand weg?)
  if (b.st === St.Loot) {
    if (b.goalItem >= 0) {
      const it = m.items.find((i) => i.id === b.goalItem);
      if (!it || !it.alive) {
        b.thinkCd = 0;
        b.st = St.Wander;
      }
    } else if (b.goalPiece >= 0) {
      const pc = m.world.pieces[b.goalPiece]!;
      if (pc.state !== 0) {
        b.thinkCd = 0;
        b.st = St.Wander;
      }
    }
  }
  const d = Math.hypot(b.goalX - body.x, b.goalZ - body.z);
  if (b.st === St.Loot && d < 2.1 && Math.abs(b.goalY - body.y) < 2.2) {
    if (b.interactCd <= 0) {
      inp.actions.push(packAct(Act.InteractPress));
      b.interactCd = 0.4;
      b.thinkCd = Math.min(b.thinkCd, 4);
    }
    // zum Gegenstand schauen
    lookToward(b, Math.atan2(-(b.goalX - body.x), -(b.goalZ - body.z)), DT, 8);
    return;
  }
  // Holz sammeln, wenn wenig Material (nur Bau-Modus)
  if (m.cfg.build && b.skill > 0 && p.mats[0]! < 40 && b.st === St.Wander && b.harvestT <= 0) {
    let tree = -1;
    m.world.query(body.x - 4, body.z - 4, body.x + 4, body.z + 4, (pc) => {
      if (pc.kind === Kind.Tree && pc.alive) tree = pc.id;
    });
    if (tree >= 0) {
      const pc = m.world.pieces[tree]!;
      b.wantSlot = 0;
      lookToward(b, Math.atan2(-(pc.x - body.x), -(pc.z - body.z)), DT, 10);
      if (Math.hypot(pc.x - body.x, pc.z - body.z) > 1.8) inp.mz = 1;
      else if (p.sel === 0) inp.buttons |= Btn.Fire;
      if (pc.hp < 40) b.harvestT = 6;
      return;
    }
  }
  b.harvestT -= DT;
  if (d > 1.2) {
    const want = steer(m, p, b, b.goalX, b.goalZ, inp);
    lookToward(b, want, DT);
    inp.mz = 1;
    // Sprinten über weite Strecken, im Wasser oder auf Rückzug
    if (d > 25 || b.st === St.Rotate || body.mode === Mode.Swim) inp.buttons |= Btn.Sprint;
    stuckCheck(p, b, inp, true);
  } else if (b.st === St.Rotate) {
    b.thinkCd = 0;
  }
}

function fight(m: Match, p: Player, b: Brain, e: Player, inp: PlayerInput): void {
  const body = p.body;
  const dx = e.body.x - body.x,
    dz = e.body.z - body.z;
  const dist = Math.hypot(dx, dz);
  const slot = bestWeaponSlot(p, dist);
  if (p.build && b.buildSeq === 0) inp.actions.push(packAct(Act.BuildToggle));
  if (slot >= 0) b.wantSlot = slot;
  else b.wantSlot = 0;
  const w = p.sel > 0 ? weapon(p.slots[p.sel]!.id) : undefined;

  // Bauen unter Beschuss: Wand (und ggf. Rampe) zwischen sich und Gegner
  if (m.cfg.build && b.hurtT > 1.5 && b.buildCd <= 0 && p.mats.some((x) => x >= BUILD_COST) && b.rng.chance(SKILL.buildChance[b.skill]! * 0.25)) {
    b.buildSeq = b.skill >= 2 ? 3 : 2;
    b.buildCd = 3.5;
  }
  if (b.buildSeq > 0) {
    // Blick zum Gegner (waagrecht), Wand setzen, dann ggf. Rampe
    lookToward(b, Math.atan2(-dx, -dz), DT, 20);
    b.pitch = 0;
    if (b.buildSeq === 3 || b.buildSeq === 2) {
      inp.actions.push(packAct(Act.BuildPiece, 0));
      inp.buttons |= Btn.Fire;
      b.buildSeq = b.buildSeq === 3 ? 1 : 0;
      if (b.buildSeq === 0) inp.actions.push(packAct(Act.BuildToggle));
    } else if (b.buildSeq === 1) {
      inp.actions.push(packAct(Act.BuildPiece, 2));
      inp.buttons |= Btn.Fire;
      inp.mz = 1;
      b.buildSeq = 0;
      inp.actions.push(packAct(Act.BuildToggle));
    }
    return;
  }

  const head = b.skill >= 2 && dist < 40 && b.rng.chance(0.3);
  const err = aimAt(p, b, e, DT, head);
  b.reaction -= DT;
  const range = w ? w.range : 3;
  const sl = p.slots[p.sel];
  const canShoot = p.sel > 0 && !!w && !!sl && sl.qty > 0 && p.reloadT <= 0;
  const tol = 0.07 + 2.2 / Math.max(4, dist);
  if (canShoot && b.reaction <= 0 && err < tol && dist < range) inp.buttons |= Btn.Fire;
  if (p.sel === 0 && dist < 2.5) inp.buttons |= Btn.Fire;
  if (w && w.model !== 'shotgun' && dist > 25 && b.skill > 0) inp.buttons |= Btn.Aim;
  if (sl && w && sl.qty <= 0 && p.ammo[w.ammo]! > 0 && p.reloadT <= 0) inp.actions.push(packAct(Act.Reload));

  // Bewegung: seitlich ausweichen, Abstand passend zur Waffe
  b.strafeT -= DT;
  if (b.strafeT <= 0) {
    b.strafe = b.rng.chance(0.5) ? 1 : -1;
    b.strafeT = b.rng.range(0.5, 1.4);
  }
  const ideal = !w ? 1.5 : w.model === 'shotgun' ? 6 : w.model === 'smg' ? 12 : w.model === 'sniper' ? 90 : 30;
  inp.mx = b.strafe * (b.skill === 0 ? 0.5 : 1);
  inp.mz = dist > ideal * 1.4 ? 1 : dist < ideal * 0.6 ? -0.8 : 0;
  // Hindernis voraus: ausweichen
  stuckCheck(p, b, inp, Math.abs(inp.mz) > 0 || Math.abs(inp.mx) > 0);
  if (b.skill >= 1 && b.jumpCd <= 0 && b.rng.chance(b.skill === 2 ? 0.02 : 0.006)) {
    inp.buttons |= Btn.Jump;
    b.jumpCd = 1.2;
  }
  // Wasser: einfach rausschwimmen
  if (body.y < WATER_LEVEL) inp.mz = 1;
}
