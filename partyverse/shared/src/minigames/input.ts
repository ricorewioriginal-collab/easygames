import { InputFrame, InputLog, NEUTRAL_INPUT } from './types';

const q = (v: number): number =>
  Math.max(-100, Math.min(100, Math.round((Number.isFinite(v) ? v : 0) * 100)));

export function packFlags(i: InputFrame): number {
  return (i.a ? 1 : 0) | (i.b ? 2 : 0) | (i.pd ? 4 : 0);
}

/** Quantisiert eine Eingabe auf 1/100 (so wird sie auch vom Server nachgerechnet) */
export function quantize(i: Readonly<InputFrame>): InputFrame {
  return {
    x: q(i.x) / 100,
    y: q(i.y) / 100,
    a: !!i.a,
    b: !!i.b,
    px: q(i.px) / 100,
    py: q(i.py) / 100,
    pd: !!i.pd,
  };
}

export function sameInput(a: InputFrame, b: InputFrame): boolean {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.a === b.a &&
    a.b === b.b &&
    a.px === b.px &&
    a.py === b.py &&
    a.pd === b.pd
  );
}

/** Zeichnet eine Eingabefolge kompakt auf. */
export class InputRecorder {
  readonly log: InputLog = [];
  private last: InputFrame = { ...NEUTRAL_INPUT };
  private started = false;
  push(tick: number, input: Readonly<InputFrame>): InputFrame {
    const f = quantize(input);
    if (!this.started || !sameInput(f, this.last)) {
      this.log.push(tick, q(f.x), q(f.y), packFlags(f), q(f.px), q(f.py));
      this.last = f;
      this.started = true;
    }
    return f;
  }
}

export const MAX_LOG_LENGTH = 6 * 6000;

/** Prüft ein Protokoll auf Form und Wertebereiche (Server-Eingabevalidierung). */
export function validateLog(log: unknown, maxTicks: number): log is InputLog {
  if (!Array.isArray(log) || log.length % 6 !== 0 || log.length > MAX_LOG_LENGTH) return false;
  let prev = -1;
  for (let i = 0; i < log.length; i += 6) {
    const t = log[i];
    if (!Number.isInteger(t) || (t as number) <= prev || (t as number) < 0 || (t as number) > maxTicks)
      return false;
    prev = t as number;
    for (const k of [1, 2, 4, 5] as const) {
      const v = log[i + k];
      if (!Number.isInteger(v) || Math.abs(v as number) > 100) return false;
    }
    const f = log[i + 3];
    if (!Number.isInteger(f) || (f as number) < 0 || (f as number) > 7) return false;
  }
  return true;
}

/** Liefert die Eingabe für jeden Tick aus einem Protokoll. */
export class LogPlayer {
  private i = 0;
  private cur: InputFrame = { ...NEUTRAL_INPUT };
  constructor(private readonly log: InputLog) {}
  at(tick: number): InputFrame {
    while (this.i < this.log.length && (this.log[this.i] as number) <= tick) {
      const f = this.log[this.i + 3] as number;
      this.cur = {
        x: (this.log[this.i + 1] as number) / 100,
        y: (this.log[this.i + 2] as number) / 100,
        a: (f & 1) !== 0,
        b: (f & 2) !== 0,
        px: (this.log[this.i + 4] as number) / 100,
        py: (this.log[this.i + 5] as number) / 100,
        pd: (f & 4) !== 0,
      };
      this.i += 6;
    }
    return this.cur;
  }
}
