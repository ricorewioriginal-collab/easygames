import type { CarInput } from '../sim';
import { clampN, type Basis } from './nav';

/**
 * Fahrfertigkeiten als kleine Zeitabläufe (Ticks): Sprung, Doppelsprung, Ausweichmanöver (Dodge), Befreiungssprung.
 * Außerdem Luftsteuerung: Abfangen/Landen und Ausrichten der Nase auf einen Punkt.
 */

export const M_NONE = 0;
export const M_JUMP = 1;
export const M_DOUBLE = 2;
export const M_DODGE = 3;
export const M_FLIP = 4;

export class Maneuver {
  kind = M_NONE;
  /** Ticks seit Beginn */
  t = 0;

  start(kind: number): void {
    this.kind = kind;
    this.t = 0;
  }

  stop(): void {
    this.kind = M_NONE;
    this.t = 0;
  }

  /**
   * Schreibt die Sprungknöpfe (und beim Doppelsprung/Dodge die nötigen Achsen) des aktuellen Ticks in out.
   * Gibt true zurück, solange der Ablauf die Achsen selbst bestimmt (Dodge, Doppelsprung-Moment).
   */
  apply(out: CarInput, dodgeSteer: number): boolean {
    const t = this.t++;
    switch (this.kind) {
      case M_JUMP:
        out.jump = t < 12;
        if (t >= 14) this.stop();
        return false;
      case M_DOUBLE:
        // Sprung 9 Ticks halten, loslassen, dann neutral nochmals drücken (reiner Hochsprung)
        if (t < 9) out.jump = true;
        else if (t === 13 || t === 14) {
          out.jump = true;
          out.throttle = 0;
          out.steer = 0;
          out.pitch = 0;
          out.yaw = 0;
          return true;
        } else if (t > 20) this.stop();
        return false;
      case M_DODGE:
        if (t < 3) out.jump = true;
        else if (t === 5 || t === 6) {
          out.jump = true;
          out.throttle = 1;
          out.steer = dodgeSteer;
          out.pitch = 0;
          out.yaw = 0;
          return true;
        } else if (t > 44) this.stop();
        return t > 6 && t < 30;
      case M_FLIP:
        out.jump = t < 4;
        if (t > 30) this.stop();
        return false;
      default:
        return false;
    }
  }
}

/** Abfangen: Nase waagerecht, Räder nach unten (zum sauberen Landen). Schreibt pitch/roll/yaw. */
export function levelAir(out: CarInput, b: Basis): void {
  if (b.uy > 0.2) {
    out.pitch = clampN(-b.fy * 2.5, -1, 1);
    out.roll = clampN(-b.ly * 2.5, -1, 1);
  } else {
    // auf dem Kopf / seitlich: in eine Richtung rollen, bis die Räder unten sind
    out.roll = b.ly >= 0 ? -1 : 1;
    out.pitch = clampN(-b.fy * 2.5, -1, 1);
  }
  out.yaw = 0;
}

/**
 * Luftsteuerung auf einen Punkt (Welt): Nase auf das Ziel drehen, Räder halbwegs unten halten.
 * Gibt den Winkelfehler (rad, größerer der beiden Achsen) zurück.
 */
export function aimAir(out: CarInput, b: Basis, dx: number, dy: number, dz: number): number {
  const df = dx * b.fx + dy * b.fy + dz * b.fz;
  const dl = dx * b.lx + dy * b.ly + dz * b.lz;
  const du = dx * b.ux + dy * b.uy + dz * b.uz;
  const pitchErr = Math.atan2(du, df);
  const yawErr = Math.atan2(dl, df);
  out.pitch = clampN(pitchErr * 2.2, -1, 1);
  out.yaw = clampN(-yawErr * 2.2, -1, 1);
  out.roll = clampN(-b.ly * 2.5, -1, 1);
  return Math.max(Math.abs(pitchErr), Math.abs(yawErr));
}
