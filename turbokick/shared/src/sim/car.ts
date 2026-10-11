import { arenaSdf } from './arena';
import { quatBasis, quatIntegrate } from './math';
import { CAR_HALF, clamp, type CarInput, type CarState, type SimEvent, type TeamId } from './types';

/** Alle Fahr-/Physikwerte des Autos an einer Stelle (Einheiten: m, s) */
export const CAR_TUNING = {
  gravity: 6.5,
  /** Haftkraft zur Oberfläche, wenn am Boden (kleiner als Schwerkraft: an der flachen Decke fällt man herunter) */
  stick: 4.0,
  maxSpeed: 14,
  maxSpeedReverse: 9,
  accel: 16,
  accelReverse: 12,
  brake: 28,
  coast: 2.5,
  overspeedDrag: 4,
  boostAccel: 14.5,
  boostMaxSpeed: 23,
  boostTaper: 1.2,
  /** Boost-Verbrauch pro Sekunde */
  boostUse: 100 / 3,
  speedCap: 23.5,
  supersonicOn: 22,
  supersonicOff: 21.5,
  latGrip: 14,
  latGripHandbrake: 1.6,
  handbrakeDecel: 5,
  /** Kurvenradius = turnRadiusMin + turnRadiusSpread * (v/maxSpeed)² */
  turnRadiusMin: 2.2,
  turnRadiusSpread: 9,
  maxYawRate: 3.6,
  steerSmooth: 14,
  alignGain: 10,
  alignSmooth: 12,
  jumpImpulse: 3.0,
  jumpHoldAccel: 16,
  jumpHoldTime: 0.2,
  doubleJumpImpulse: 3.0,
  dodgeImpulse: 5.2,
  dodgeWindow: 1.5,
  dodgeDeadzone: 0.4,
  flipRate: 11.4,
  flipTime: 0.55,
  /** Zeit nach einem Sprung, in der der Bodenkontakt nicht als Landung zählt */
  jumpGuard: 0.15,
  airPitchRate: 3.6,
  airYawRate: 3.2,
  airRollRate: 5.5,
  airAccel: 14,
  airDamp: 1.5,
  wheelContact: 0.1,
  inertiaScale: 2.5,
  restitution: 0.1,
  restThreshold: 2,
  bodyFriction: 0.4,
  airWheelFriction: 0.2,
  substeps: 2,
  demolishSeconds: 3,
  startBoost: 33,
  carRestitution: 0.35,
} as const;

const T = CAR_TUNING;

export function createCarState(id: number, team: TeamId): CarState {
  return {
    id,
    team,
    pos: [0, CAR_HALF[1], 0],
    quat: [0, 0, 0, 1],
    vel: [0, 0, 0],
    angVel: [0, 0, 0],
    boost: T.startBoost,
    wheelsOnSurface: 4,
    jumpUsed: false,
    canDodge: false,
    demolished: 0,
    dodgeTimer: 0,
    jumpTimer: 0,
    boosting: false,
    input: { throttle: 0, steer: 0, pitch: 0, yaw: 0, roll: 0, jump: false, boost: false, handbrake: false },
    supersonic: false,
  };
}

/** Wie clampInput, aber ohne Allokation: schreibt die bereinigte Eingabe nach dst */
export function sanitizeInto(dst: CarInput, raw: Partial<CarInput> | undefined | null): void {
  if (typeof raw !== 'object' || raw === null) {
    dst.throttle = 0;
    dst.steer = 0;
    dst.pitch = 0;
    dst.yaw = 0;
    dst.roll = 0;
    dst.jump = false;
    dst.boost = false;
    dst.handbrake = false;
    return;
  }
  const ax = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? clamp(v, -1, 1) : 0);
  dst.throttle = ax(raw.throttle);
  dst.steer = ax(raw.steer);
  dst.pitch = ax(raw.pitch);
  dst.yaw = ax(raw.yaw);
  dst.roll = ax(raw.roll);
  dst.jump = raw.jump === true;
  dst.boost = raw.boost === true;
  dst.handbrake = raw.handbrake === true;
}

/** Fahrzeug an einen Platz stellen (ruhend, am Boden), Boost = Startwert */
export function placeCar(car: CarState, x: number, y: number, z: number, facing: 1 | -1): void {
  car.pos[0] = x;
  car.pos[1] = y;
  car.pos[2] = z;
  car.quat[0] = 0;
  car.quat[1] = facing === 1 ? 0 : 1;
  car.quat[2] = 0;
  car.quat[3] = facing === 1 ? 1 : 0;
  car.vel[0] = car.vel[1] = car.vel[2] = 0;
  car.angVel[0] = car.angVel[1] = car.angVel[2] = 0;
  car.boost = T.startBoost;
  car.wheelsOnSurface = 4;
  car.jumpUsed = false;
  car.canDodge = false;
  car.demolished = 0;
  car.dodgeTimer = 0;
  car.jumpTimer = 0;
  car.boosting = false;
  car.supersonic = false;
  sanitizeInto(car.input, null);
}

// ---------------------------------------------------------------------------------------------
// Scratch-Speicher (modulweit, Simulation ist einthreadig)
// ---------------------------------------------------------------------------------------------
const B = new Float64Array(9);
const S4 = new Float64Array(4);
const CORNER = new Float64Array(24);
{
  let i = 0;
  for (const sy of [-1, 1])
    for (const sz of [1, -1])
      for (const sx of [1, -1]) {
        CORNER[i * 3] = sx * CAR_HALF[0];
        CORNER[i * 3 + 1] = sy * CAR_HALF[1];
        CORNER[i * 3 + 2] = sz * CAR_HALF[2];
        i++;
      }
}
const FX = 2 * CAR_HALF[0];
const FY = 2 * CAR_HALF[1];
const FZ = 2 * CAR_HALF[2];
const INV_IX = 1 / ((T.inertiaScale * (FY * FY + FZ * FZ)) / 12);
const INV_IY = 1 / ((T.inertiaScale * (FX * FX + FZ * FZ)) / 12);
const INV_IZ = 1 / ((T.inertiaScale * (FX * FX + FY * FY)) / 12);

const CR = new Float64Array(24); // Kontakt: Hebelarm
const CN = new Float64Array(24); // Kontakt: Normale
const CK = new Uint8Array(8); // Kontakt: Eckindex
const IW = new Float64Array(3);

/** Inverse Trägheit auf Vektor anwenden (Hauptachsen = Fahrzeugachsen in B) */
function applyIinv(vx: number, vy: number, vz: number): void {
  const a = (vx * B[0]! + vy * B[1]! + vz * B[2]!) * INV_IX;
  const b = (vx * B[3]! + vy * B[4]! + vz * B[5]!) * INV_IY;
  const c = (vx * B[6]! + vy * B[7]! + vz * B[8]!) * INV_IZ;
  IW[0] = B[0]! * a + B[3]! * b + B[6]! * c;
  IW[1] = B[1]! * a + B[4]! * b + B[7]! * c;
  IW[2] = B[2]! * a + B[5]! * b + B[8]! * c;
}

/** Kollision der 8 Eckpunkte mit der Arena: Lageverschiebung + Impulse (Starrkörper, Masse 1) */
function collideArena(car: CarState, grounded: boolean): void {
  const pos = car.pos;
  const vel = car.vel;
  const w = car.angVel;
  let n = 0;
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (let i = 0; i < 8; i++) {
    const lx = CORNER[i * 3]!;
    const ly = CORNER[i * 3 + 1]!;
    const lz = CORNER[i * 3 + 2]!;
    const rx = B[0]! * lx + B[3]! * ly + B[6]! * lz;
    const ry = B[1]! * lx + B[4]! * ly + B[7]! * lz;
    const rz = B[2]! * lx + B[5]! * ly + B[8]! * lz;
    const d = arenaSdf(pos[0] + rx, pos[1] + ry, pos[2] + rz, S4);
    if (d < 0) {
      const nx = S4[1]!;
      const ny = S4[2]!;
      const nz = S4[3]!;
      const need = -d - (cx * nx + cy * ny + cz * nz);
      if (need > 0) {
        cx += nx * need;
        cy += ny * need;
        cz += nz * need;
      }
      CR[n * 3] = rx;
      CR[n * 3 + 1] = ry;
      CR[n * 3 + 2] = rz;
      CN[n * 3] = nx;
      CN[n * 3 + 1] = ny;
      CN[n * 3 + 2] = nz;
      CK[n] = i;
      n++;
    }
  }
  if (n === 0) return;
  pos[0] += cx;
  pos[1] += cy;
  pos[2] += cz;
  for (let it = 0; it < 2; it++) {
    for (let c = 0; c < n; c++) {
      const rx = CR[c * 3]!;
      const ry = CR[c * 3 + 1]!;
      const rz = CR[c * 3 + 2]!;
      const nx = CN[c * 3]!;
      const ny = CN[c * 3 + 1]!;
      const nz = CN[c * 3 + 2]!;
      const vpx = vel[0] + w[1] * rz - w[2] * ry;
      const vpy = vel[1] + w[2] * rx - w[0] * rz;
      const vpz = vel[2] + w[0] * ry - w[1] * rx;
      const vn = vpx * nx + vpy * ny + vpz * nz;
      if (vn >= 0) continue;
      // Hebel r × n, durch Trägheit
      applyIinv(ry * nz - rz * ny, rz * nx - rx * nz, rx * ny - ry * nx);
      const ix = IW[0]!;
      const iy = IW[1]!;
      const iz = IW[2]!;
      const denom = 1 + ((iy * rz - iz * ry) * nx + (iz * rx - ix * rz) * ny + (ix * ry - iy * rx) * nz);
      const e = -vn > T.restThreshold ? T.restitution : 0;
      const jn = (-(1 + e) * vn) / denom;
      vel[0] += nx * jn;
      vel[1] += ny * jn;
      vel[2] += nz * jn;
      w[0] += ix * jn;
      w[1] += iy * jn;
      w[2] += iz * jn;
      const isWheel = CK[c]! < 4;
      const mu = isWheel ? (grounded ? 0 : T.airWheelFriction) : T.bodyFriction;
      if (mu > 0) {
        const px = vel[0] + w[1] * rz - w[2] * ry;
        const py = vel[1] + w[2] * rx - w[0] * rz;
        const pz = vel[2] + w[0] * ry - w[1] * rx;
        const pn = px * nx + py * ny + pz * nz;
        const tx = px - nx * pn;
        const ty = py - ny * pn;
        const tz = pz - nz * pn;
        const tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
        if (tl > 1e-6) {
          const jt = Math.min(tl / denom, mu * jn);
          const dx = -tx / tl;
          const dy = -ty / tl;
          const dz = -tz / tl;
          vel[0] += dx * jt;
          vel[1] += dy * jt;
          vel[2] += dz * jt;
          applyIinv(ry * dz - rz * dy, rz * dx - rx * dz, rx * dy - ry * dx);
          w[0] += IW[0]! * jt;
          w[1] += IW[1]! * jt;
          w[2] += IW[2]! * jt;
        }
      }
    }
  }
}

/**
 * Ein Tick für ein (nicht zerstörtes) Auto: Eingabe übernehmen, Fahrmodell/Luftsteuerung/Sprung/Boost, Integration, Arena-Kollision.
 * Zeitabhängige Zustände (jumpTimer, dodgeTimer) liegen im CarState.
 */
export function stepCar(
  car: CarState,
  raw: Partial<CarInput> | undefined,
  dt: number,
  events: SimEvent[],
): void {
  const prevJump = car.input.jump;
  sanitizeInto(car.input, raw);
  const inp = car.input;
  const pos = car.pos;
  const vel = car.vel;
  const w = car.angVel;

  quatBasis(car.quat, B);
  const ax0 = B[0]!;
  const ax1 = B[1]!;
  const ax2 = B[2]!;
  const ay0 = B[3]!;
  const ay1 = B[4]!;
  const ay2 = B[5]!;
  const az0 = B[6]!;
  const az1 = B[7]!;
  const az2 = B[8]!;

  // --- Kontakte sondieren (Räder = untere 4 Ecken, alle 8 für „Körperkontakt“)
  let wheels = 0;
  let touching = 0;
  let wnx = 0;
  let wny = 0;
  let wnz = 0;
  let tnx = 0;
  let tny = 0;
  let tnz = 0;
  for (let i = 0; i < 8; i++) {
    const lx = CORNER[i * 3]!;
    const ly = CORNER[i * 3 + 1]!;
    const lz = CORNER[i * 3 + 2]!;
    const d = arenaSdf(
      pos[0] + B[0]! * lx + B[3]! * ly + B[6]! * lz,
      pos[1] + B[1]! * lx + B[4]! * ly + B[7]! * lz,
      pos[2] + B[2]! * lx + B[5]! * ly + B[8]! * lz,
      S4,
    );
    if (d < T.wheelContact) {
      touching++;
      tnx += S4[1]!;
      tny += S4[2]!;
      tnz += S4[3]!;
      if (i < 4) {
        wheels++;
        wnx += S4[1]!;
        wny += S4[2]!;
        wnz += S4[3]!;
      }
    }
  }
  car.wheelsOnSurface = wheels;

  const guard = car.jumpUsed && car.jumpTimer < T.jumpGuard;
  const surface = touching > 0 && !guard;
  let grounded = wheels >= 3 && !guard;

  // --- Sprung-/Ausweich-Zustand
  if (car.dodgeTimer > 0) {
    car.dodgeTimer -= dt;
    if (car.dodgeTimer <= 0) {
      car.dodgeTimer = 0;
      w[0] *= 0.3;
      w[1] *= 0.3;
      w[2] *= 0.3;
    }
  }
  if (surface) {
    if (car.dodgeTimer > 0) {
      w[0] *= 0.3;
      w[1] *= 0.3;
      w[2] *= 0.3;
    }
    car.jumpUsed = false;
    car.canDodge = false;
    car.jumpTimer = 0;
    car.dodgeTimer = 0;
  } else {
    car.jumpTimer += dt;
    if (car.jumpTimer >= T.dodgeWindow) car.canDodge = false;
    else if (!car.jumpUsed) car.canDodge = true;
  }

  // Oberflächennormale
  let nx = 0;
  let ny = 1;
  let nz = 0;
  if (grounded) {
    const l = Math.sqrt(wnx * wnx + wny * wny + wnz * wnz);
    if (l > 1e-6) {
      nx = wnx / l;
      ny = wny / l;
      nz = wnz / l;
    } else grounded = false;
  } else if (surface) {
    const l = Math.sqrt(tnx * tnx + tny * tny + tnz * tnz);
    if (l > 1e-6) {
      nx = tnx / l;
      ny = tny / l;
      nz = tnz / l;
    }
  }

  // Schwerkraft immer
  vel[1] -= T.gravity * dt;

  // --- Sprung gehalten
  if (car.jumpUsed && car.jumpTimer < T.jumpHoldTime) {
    if (inp.jump) {
      vel[0] += ay0 * T.jumpHoldAccel * dt;
      vel[1] += ay1 * T.jumpHoldAccel * dt;
      vel[2] += ay2 * T.jumpHoldAccel * dt;
    } else car.jumpTimer = T.jumpHoldTime;
  }

  // --- Boost
  const wantBoost = inp.boost && car.boost > 0;
  car.boosting = wantBoost;

  if (grounded) {
    // Tangentialrichtung f (Nase auf Oberfläche), s = n × f (links)
    const dAz = az0 * nx + az1 * ny + az2 * nz;
    let fx = az0 - nx * dAz;
    let fy = az1 - ny * dAz;
    let fz = az2 - nz * dAz;
    const fl = Math.sqrt(fx * fx + fy * fy + fz * fz);
    if (fl < 0.2) {
      grounded = false;
    } else {
      fx /= fl;
      fy /= fl;
      fz /= fl;
      const sx = ny * fz - nz * fy;
      const sy = nz * fx - nx * fz;
      const sz = nx * fy - ny * fx;
      const vnn = vel[0] * nx + vel[1] * ny + vel[2] * nz;
      const tvx = vel[0] - nx * vnn;
      const tvy = vel[1] - ny * vnn;
      const tvz = vel[2] - nz * vnn;
      const vf = tvx * fx + tvy * fy + tvz * fz;
      const vs = tvx * sx + tvy * sy + tvz * sz;
      const th = inp.throttle;
      const ath = th < 0 ? -th : th;

      // Längsbeschleunigung
      let a = 0;
      if (th > 0) {
        if (vf < -0.5) a = T.brake * th;
        else {
          const r = vf > 0 ? vf / T.maxSpeed : 0;
          a = T.accel * th * (r < 1 ? 1 - r * r : 0);
        }
      } else if (th < 0) {
        if (vf > 0.5) a = -T.brake * ath;
        else {
          const r = vf < 0 ? -vf / T.maxSpeedReverse : 0;
          a = -T.accelReverse * ath * (r < 1 ? 1 - r * r : 0);
        }
      } else if (!wantBoost) {
        const c = T.coast;
        const lim = (vf < 0 ? -vf : vf) / dt;
        a = vf > 0 ? -Math.min(c, lim) : vf < 0 ? Math.min(c, lim) : 0;
      }
      if (!wantBoost && vf > T.maxSpeed && th >= 0) a -= Math.min(T.overspeedDrag, (vf - T.maxSpeed) / dt);
      if (inp.handbrake) {
        const lim = (vf < 0 ? -vf : vf) / dt;
        a += vf > 0 ? -Math.min(T.handbrakeDecel, lim) : vf < 0 ? Math.min(T.handbrakeDecel, lim) : 0;
      }
      if (wantBoost) {
        const k = clamp((T.boostMaxSpeed - vf) / T.boostTaper, 0, 1);
        a += T.boostAccel * k;
      }
      const grip = Math.min(1, (inp.handbrake ? T.latGripHandbrake : T.latGrip) * dt);
      const dvf = a * dt;
      const dvs = -vs * grip;
      vel[0] += fx * dvf + sx * dvs;
      vel[1] += fy * dvf + sy * dvs;
      vel[2] += fz * dvf + sz * dvs;
      // Haftkraft
      vel[0] -= nx * T.stick * dt;
      vel[1] -= ny * T.stick * dt;
      vel[2] -= nz * T.stick * dt;
      // kleine Restgeschwindigkeit am flachen Boden abschalten
      if (th === 0 && !wantBoost && ny > 0.95) {
        const nv2 = tvx * tvx + tvy * tvy + tvz * tvz;
        if (nv2 < 0.0225) {
          vel[0] -= tvx;
          vel[1] -= tvy;
          vel[2] -= tvz;
        }
      }

      // Lenkung: Gierung um die Oberflächennormale
      const avf = vf < 0 ? -vf : vf;
      const dir = vf > 0.3 ? 1 : vf < -0.3 ? -1 : th < 0 ? -1 : 1;
      const rr = Math.min(avf / T.maxSpeed, 1.8);
      const radius = T.turnRadiusMin + T.turnRadiusSpread * rr * rr;
      const ve = Math.max(avf, 2.5 * Math.min(1, ath + (wantBoost ? 1 : 0)));
      let rate = (ve / radius) * (inp.handbrake ? 1.35 : 1);
      if (rate > T.maxYawRate) rate = T.maxYawRate;
      const target = -inp.steer * rate * dir;
      const wN = w[0] * nx + w[1] * ny + w[2] * nz;
      const k1 = Math.min(1, T.steerSmooth * dt);
      const dN = (target - wN) * k1;
      w[0] += nx * dN;
      w[1] += ny * dN;
      w[2] += nz * dN;
      // Ausrichtung an der Oberfläche: Rest-Drehung (senkrecht zu n) in Richtung ay × n
      const wN2 = w[0] * nx + w[1] * ny + w[2] * nz;
      const px = w[0] - nx * wN2;
      const py = w[1] - ny * wN2;
      const pz = w[2] - nz * wN2;
      const tx = (ay1 * nz - ay2 * ny) * T.alignGain;
      const ty = (ay2 * nx - ay0 * nz) * T.alignGain;
      const tz = (ay0 * ny - ay1 * nx) * T.alignGain;
      const k2 = Math.min(1, T.alignSmooth * dt);
      w[0] += (tx - px) * k2;
      w[1] += (ty - py) * k2;
      w[2] += (tz - pz) * k2;
    }
  }

  if (!grounded) {
    // Boost in Nasenrichtung
    if (wantBoost) {
      const sp = Math.sqrt(vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2]);
      const k = clamp((T.boostMaxSpeed - sp) / T.boostTaper, 0, 1);
      const ab = T.boostAccel * k * dt;
      vel[0] += az0 * ab;
      vel[1] += az1 * ab;
      vel[2] += az2 * ab;
    }
    // Luftsteuerung nur ohne Oberflächenkontakt (und nicht während eines Flips).
    // Zwei Räder/Karosseriekontakt reichen noch nicht zum Fahren, sind aber auch
    // kein freier Flug: Gas/Lenken senden zugleich Pitch/Yaw und würden das Auto
    // beim Aufsetzen sonst weiter kippen. Der Sprung-Guard erlaubt Luftsteuerung
    // unmittelbar nach einem absichtlichen Absprung.
    if (car.dodgeTimer <= 0 && !surface) {
      const wx = w[0] * ax0 + w[1] * ax1 + w[2] * ax2;
      const wy = w[0] * ay0 + w[1] * ay1 + w[2] * ay2;
      const wz = w[0] * az0 + w[1] * az1 + w[2] * az2;
      const lim = T.airAccel * dt;
      const damp = Math.max(0, 1 - T.airDamp * dt);
      const nwx = inp.pitch !== 0 ? wx + clamp(-inp.pitch * T.airPitchRate - wx, -lim, lim) : wx * damp;
      const nwy = inp.yaw !== 0 ? wy + clamp(-inp.yaw * T.airYawRate - wy, -lim, lim) : wy * damp;
      const nwz = inp.roll !== 0 ? wz + clamp(inp.roll * T.airRollRate - wz, -lim, lim) : wz * damp;
      const dx = nwx - wx;
      const dy = nwy - wy;
      const dz = nwz - wz;
      w[0] += ax0 * dx + ay0 * dy + az0 * dz;
      w[1] += ax1 * dx + ay1 * dy + az1 * dz;
      w[2] += ax2 * dx + ay2 * dy + az2 * dz;
    }
  }

  if (wantBoost) {
    car.boost -= T.boostUse * dt;
    if (car.boost < 0) car.boost = 0;
  }

  // --- neuer Sprung / Doppelsprung / Ausweichmanöver
  if (inp.jump && !prevJump) {
    if (surface) {
      let jx = ay0;
      let jy = ay1;
      let jz = ay2;
      if (!grounded) {
        jx = nx;
        jy = ny;
        jz = nz;
        // Rückenlage o. Ä.: zum Aufrichten drehen
        const cx = ay1 * nz - ay2 * ny;
        const cy = ay2 * nx - ay0 * nz;
        const cz = ay0 * ny - ay1 * nx;
        if (cx * cx + cy * cy + cz * cz > 0.09) {
          w[0] = cx * 6;
          w[1] = cy * 6;
          w[2] = cz * 6;
        } else {
          w[0] = az0 * 6;
          w[1] = az1 * 6;
          w[2] = az2 * 6;
        }
      }
      vel[0] += jx * T.jumpImpulse;
      vel[1] += jy * T.jumpImpulse;
      vel[2] += jz * T.jumpImpulse;
      car.jumpUsed = true;
      car.canDodge = true;
      car.jumpTimer = 0;
      events.push({ t: 'jump', car: car.id, kind: 'jump' });
    } else if (car.canDodge) {
      const fi = clamp(inp.throttle - inp.pitch, -1, 1);
      const si = clamp(inp.steer + inp.yaw, -1, 1);
      const mag = Math.sqrt(fi * fi + si * si);
      if (mag < T.dodgeDeadzone) {
        vel[0] += ay0 * T.doubleJumpImpulse;
        vel[1] += ay1 * T.doubleJumpImpulse;
        vel[2] += ay2 * T.doubleJumpImpulse;
        events.push({ t: 'jump', car: car.id, kind: 'jump' });
      } else {
        let hx = az0;
        let hz = az2;
        let hl = Math.sqrt(hx * hx + hz * hz);
        if (hl < 0.2) {
          hx = 0;
          hz = 1;
          hl = 1;
        }
        const fwx = hx / hl;
        const fwz = hz / hl;
        const dx = fi * fwx + si * -fwz;
        const dz = fi * fwz + si * fwx;
        const ux = dx / mag;
        const uz = dz / mag;
        const imp = T.dodgeImpulse * Math.min(mag, 1);
        vel[0] += ux * imp;
        vel[2] += uz * imp;
        w[0] = uz * T.flipRate;
        w[1] = 0;
        w[2] = -ux * T.flipRate;
        car.dodgeTimer = T.flipTime;
        events.push({ t: 'jump', car: car.id, kind: 'dodge' });
      }
      car.canDodge = false;
      car.jumpUsed = true;
      if (car.jumpTimer < T.jumpHoldTime) car.jumpTimer = T.jumpHoldTime;
    }
  }

  // --- Tempolimit, Supersonic
  let sp2 = vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2];
  if (sp2 > T.speedCap * T.speedCap) {
    const k = T.speedCap / Math.sqrt(sp2);
    vel[0] *= k;
    vel[1] *= k;
    vel[2] *= k;
    sp2 = T.speedCap * T.speedCap;
  }
  if (sp2 >= T.supersonicOn * T.supersonicOn) car.supersonic = true;
  else if (sp2 < T.supersonicOff * T.supersonicOff) car.supersonic = false;

  // --- Integration mit Kollision
  const h = dt / T.substeps;
  for (let s = 0; s < T.substeps; s++) {
    pos[0] += vel[0] * h;
    pos[1] += vel[1] * h;
    pos[2] += vel[2] * h;
    quatIntegrate(car.quat, w[0], w[1], w[2], h);
    quatBasis(car.quat, B);
    collideArena(car, grounded);
  }
}

// ---------------------------------------------------------------------------------------------
// Auto–Auto
// ---------------------------------------------------------------------------------------------
const SPH_OFF = 0.2;
const SPH_R = 0.42;

/**
 * Auto–Auto-Kollision über je zwei Kugeln pro Auto (weich-elastisch). Supersonic-Rammen zerstört gegnerische Autos.
 * Zerstörte Autos nehmen nicht teil.
 */
export function collideCars(cars: CarState[], events: SimEvent[]): void {
  const n = cars.length;
  for (let i = 0; i < n; i++) {
    const a = cars[i]!;
    if (a.demolished > 0) continue;
    for (let j = i + 1; j < n; j++) {
      const b = cars[j]!;
      if (b.demolished > 0) continue;
      const dx0 = b.pos[0] - a.pos[0];
      const dy0 = b.pos[1] - a.pos[1];
      const dz0 = b.pos[2] - a.pos[2];
      if (dx0 * dx0 + dy0 * dy0 + dz0 * dz0 > 2.56) continue;
      // Nasenachsen
      const aq = a.quat;
      const bq = b.quat;
      const aNx = 2 * (aq[0] * aq[2] + aq[3] * aq[1]);
      const aNy = 2 * (aq[1] * aq[2] - aq[3] * aq[0]);
      const aNz = 1 - 2 * (aq[0] * aq[0] + aq[1] * aq[1]);
      const bNx = 2 * (bq[0] * bq[2] + bq[3] * bq[1]);
      const bNy = 2 * (bq[1] * bq[2] - bq[3] * bq[0]);
      const bNz = 1 - 2 * (bq[0] * bq[0] + bq[1] * bq[1]);
      // tiefste Kugel-Kugel-Durchdringung
      let best = 0;
      let bnx = 0;
      let bny = 0;
      let bnz = 0;
      for (let sa = -1; sa <= 1; sa += 2) {
        for (let sb = -1; sb <= 1; sb += 2) {
          const dx = dx0 + (bNx * sb - aNx * sa) * SPH_OFF;
          const dy = dy0 + (bNy * sb - aNy * sa) * SPH_OFF;
          const dz = dz0 + (bNz * sb - aNz * sa) * SPH_OFF;
          const d2 = dx * dx + dy * dy + dz * dz;
          const rr = 2 * SPH_R;
          if (d2 < rr * rr) {
            const d = Math.sqrt(d2);
            const pen = rr - d;
            if (pen > best) {
              best = pen;
              if (d > 1e-6) {
                bnx = dx / d;
                bny = dy / d;
                bnz = dz / d;
              } else {
                bnx = 1;
                bny = 0;
                bnz = 0;
              }
            }
          }
        }
      }
      if (best <= 0) continue;
      const rvx = b.vel[0] - a.vel[0];
      const rvy = b.vel[1] - a.vel[1];
      const rvz = b.vel[2] - a.vel[2];
      const vn = rvx * bnx + rvy * bny + rvz * bnz; // < 0: nähern sich an
      // Demolition: Angreifer supersonic, Spitze zeigt auf den Gegner, gegnerisches Team
      if (a.team !== b.team && vn < -3) {
        const aOk = a.supersonic && aNx * bnx + aNy * bny + aNz * bnz > 0.5;
        const bOk = b.supersonic && -(bNx * bnx + bNy * bny + bNz * bnz) > 0.5;
        let attacker = -1;
        if (aOk && bOk) {
          const sa = a.vel[0] * a.vel[0] + a.vel[1] * a.vel[1] + a.vel[2] * a.vel[2];
          const sb = b.vel[0] * b.vel[0] + b.vel[1] * b.vel[1] + b.vel[2] * b.vel[2];
          attacker = sb > sa ? 1 : 0;
        } else if (aOk) attacker = 0;
        else if (bOk) attacker = 1;
        if (attacker >= 0) {
          const atk = attacker === 0 ? a : b;
          const vic = attacker === 0 ? b : a;
          vic.demolished = T.demolishSeconds;
          vic.vel[0] = vic.vel[1] = vic.vel[2] = 0;
          vic.angVel[0] = vic.angVel[1] = vic.angVel[2] = 0;
          vic.boosting = false;
          events.push({ t: 'demo', victim: vic.id, attacker: atk.id });
          if (vic === a) break;
          continue;
        }
      }
      // weiche Abstoßung
      a.pos[0] -= bnx * best * 0.5;
      a.pos[1] -= bny * best * 0.5;
      a.pos[2] -= bnz * best * 0.5;
      b.pos[0] += bnx * best * 0.5;
      b.pos[1] += bny * best * 0.5;
      b.pos[2] += bnz * best * 0.5;
      if (vn < 0) {
        const j2 = (-(1 + T.carRestitution) * vn) / 2;
        a.vel[0] -= bnx * j2;
        a.vel[1] -= bny * j2;
        a.vel[2] -= bnz * j2;
        b.vel[0] += bnx * j2;
        b.vel[1] += bny * j2;
        b.vel[2] += bnz * j2;
      }
    }
  }
}

