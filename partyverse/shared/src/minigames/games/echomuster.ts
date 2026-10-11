import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { lerp } from '../util';

/**
 * Echo-Muster: Kristallsäulen leuchten in einer Folge auf. Danach wird die Folge nachgespielt.
 * Die Folge wächst mit jeder Runde, ab Länge 6 kommen zwei Säulen dazu. Ein Fehler beendet das Spiel.
 */
export interface EchoState {
  /** Gesamte Folge (vorab aus dem Seed erzeugt, Werte 0..5) */
  seq: number[];
  phase: 'intro' | 'show' | 'input' | 'ok' | 'over';
  /** Aktuelle Länge der Folge */
  len: number;
  /** Anzahl sichtbarer Säulen (4 oder 6) */
  pillars: number;
  /** Ticks in der aktuellen Phase */
  timer: number;
  /** Gesamte Spielzeit in Ticks */
  t: number;
  /** Index der gerade vorgespielten Note */
  showIdx: number;
  /** Nächste erwartete Note beim Nachspielen */
  pos: number;
  /** Ticks seit der letzten Eingabe (bzw. Beginn des Nachspielens) */
  idle: number;
  /** Ticks, die das Nachspielen der laufenden Runde bisher dauert */
  inputTicks: number;
  /** Restliche Leuchtdauer je Säule */
  lit: number[];
  /** Längste vollständig nachgespielte Folge */
  cleared: number;
  bonus: number;
  /** Richtig nachgespielte Noten der noch unvollendeten Runde */
  partial: number;
  failed: boolean;
  /** Zähler für die Ansicht: jede angenommene Eingabe erhöht ihn */
  presses: number;
  lastPress: number;
  /** Zuletzt gedrückte Säule war falsch / richtig */
  lastOk: boolean;
  /** Welche Säule wurde als falsch gedrückt (-1 = keine) */
  wrong: number;
  prevPick: number;
  seed: number;
}

const SEQ_LEN = 48;
const START_LEN = 2;
const SIX_FROM = 6;
const INTRO = 50;
const INPUT_TIMEOUT = 300;

/** Winkel der Säulen im Kreis (Grad, 90 = oben/hinten). Reihenfolge: oben, links, rechts, unten, B, A. */
export const PILLAR_ANGLES = [90, 180, 0, 270, 45, 135];

export const noteOn = (len: number): number => Math.max(11, 20 - Math.floor(len / 2));
export const noteGap = (len: number): number => Math.max(5, 9 - Math.floor(len / 3));

/** Welche Säule (0..n-1) wird durch diese Eingabe gewählt? -1 = keine. */
export function pickPillar(input: Readonly<InputFrame>, n: number): number {
  if (input.pd) {
    const r = Math.hypot(input.px, input.py);
    if (r < 0.1) return -1;
    const ang = (Math.atan2(input.py, input.px) * 180) / Math.PI;
    let best = -1;
    let bd = 999;
    for (let i = 0; i < n; i++) {
      let d = Math.abs(ang - (PILLAR_ANGLES[i] as number));
      d = Math.min(d, 360 - d);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  }
  if (input.b && n > 4) return 4;
  if (input.a && n > 5) return 5;
  if (Math.abs(input.y) >= Math.abs(input.x)) {
    if (input.y > 0.5) return 0;
    if (input.y < -0.5) return 3;
  }
  if (input.x < -0.5) return 1;
  if (input.x > 0.5) return 2;
  return -1;
}

const startShow = (s: EchoState): void => {
  s.phase = 'show';
  s.timer = 0;
  s.showIdx = 0;
  s.pos = 0;
  s.partial = 0;
  s.pillars = s.len >= SIX_FROM ? 6 : 4;
};

export const game: MiniGame<EchoState> = {
  id: 'echomuster',
  name: 'Echo-Muster',
  tagline: 'Merk dir die Klänge der Kristalle',
  instructions: [
    'Die Kristallsäulen leuchten nacheinander auf und klingen.',
    'Spiele die Folge danach in derselben Reihenfolge nach.',
    'Jede Runde kommt eine Note dazu, später gibt es sechs Säulen.',
    'Ein Fehler beendet das Spiel. Wer schneller nachspielt, bekommt Bonuspunkte.',
  ],
  controls: { desktop: 'Pfeiltasten/WASD (oben, links, rechts, unten), Shift = Säule 5, Leertaste = Säule 6, oder Mausklick auf die Säule', touch: 'Säulen direkt antippen' },
  category: 'memory',
  duration: 35,
  usesPointer: true,
  touch: { stick: false, a: false, b: false },
  init(seed) {
    const rnd = new Rng(seed);
    const seq: number[] = [];
    for (let i = 0; i < SEQ_LEN; i++) {
      // Vor der sechsten Position gibt es nur vier Säulen; danach alle sechs
      let v = rnd.int(i < SIX_FROM - 1 ? 4 : 6);
      // Keine Dreierwiederholung derselben Säule
      if (i >= 2 && seq[i - 1] === v && seq[i - 2] === v) v = (v + 1 + rnd.int(3)) % (i < SIX_FROM - 1 ? 4 : 6);
      seq.push(v);
    }
    return {
      seq, phase: 'intro', len: START_LEN, pillars: 4, timer: 0, t: 0, showIdx: 0, pos: 0, idle: 0, inputTicks: 0,
      lit: [0, 0, 0, 0, 0, 0], cleared: 0, bonus: 0, partial: 0, failed: false, presses: 0, lastPress: -1, lastOk: true, wrong: -1, prevPick: -1, seed,
    };
  },
  step(s, input) {
    if (s.phase === 'over') return;
    s.t++;
    s.timer++;
    for (let i = 0; i < 6; i++) if ((s.lit[i] as number) > 0) (s.lit[i] as number)--;
    const pick = pickPillar(input, s.pillars);
    const press = pick >= 0 && pick !== s.prevPick;
    s.prevPick = pick;
    if (s.t >= game.duration * 60) {
      s.phase = 'over';
      return;
    }
    if (s.phase === 'intro') {
      if (s.timer >= INTRO) startShow(s);
    } else if (s.phase === 'show') {
      const on = noteOn(s.len);
      const per = on + noteGap(s.len);
      const idx = Math.floor(s.timer / per);
      const within = s.timer % per;
      if (idx >= s.len) {
        if (s.timer >= s.len * per + 12) {
          s.phase = 'input';
          s.timer = 0;
          s.idle = 0;
          s.inputTicks = 0;
          s.pos = 0;
        }
      } else {
        s.showIdx = idx;
        if (within === 0) {
          s.lit[s.seq[idx] as number] = on;
          s.presses++;
          s.lastPress = s.seq[idx] as number;
          s.lastOk = true;
        }
      }
    } else if (s.phase === 'input') {
      s.idle++;
      s.inputTicks++;
      if (press) {
        s.presses++;
        s.lastPress = pick;
        s.idle = 0;
        if (pick === s.seq[s.pos]) {
          s.lastOk = true;
          s.lit[pick] = 14;
          s.pos++;
          s.partial = s.pos;
          if (s.pos >= s.len) {
            s.cleared = s.len;
            s.bonus += Math.max(0, Math.round(s.len * 25 - s.inputTicks * 0.25));
            s.partial = 0;
            s.phase = 'ok';
            s.timer = 0;
          }
        } else {
          s.lastOk = false;
          s.wrong = pick;
          s.failed = true;
          s.phase = 'over';
        }
      } else if (s.idle >= INPUT_TIMEOUT) {
        s.failed = true;
        s.phase = 'over';
      }
    } else if (s.phase === 'ok') {
      if (s.timer >= 34) {
        s.len = Math.min(s.len + 1, SEQ_LEN);
        startShow(s);
      }
    }
  },
  done: (s) => s.phase === 'over',
  score: (s) => s.cleared * 100 + s.bonus + s.partial * 10,
  bot(s, skill, rng): InputFrame {
    if (s.phase !== 'input') return { ...NEUTRAL_INPUT };
    // Stateless: Zeitpunkt und Fehler hängen nur vom Zustand ab (Hash), damit der Bot über Ticks hinweg konsistent bleibt.
    const h = hash(s.seed, s.len * 64 + s.pos);
    const delay = Math.round(lerp(44, 17, skill) + (h % 9) + (s.pos === 0 ? lerp(24, 8, skill) : 0));
    if (s.idle !== delay) return { ...NEUTRAL_INPUT };
    const pErr = 0.012 + 0.22 * (1 - skill) * (1 - skill);
    const want = s.seq[s.pos] as number;
    const wrongRoll = (hash(s.seed + 7, s.len * 64 + s.pos) % 10000) / 10000;
    // rng wird nur für die (gleichbleibende) Wahl genutzt, sobald wirklich gedrückt wird
    const target = wrongRoll < pErr ? (want + 1 + Math.floor(rng.next() * (s.pillars - 1))) % s.pillars : want;
    return pillarInput(target);
  },
  hud: (s) => ({
    left: `Länge ${s.phase === 'over' ? s.cleared : s.len}`,
    right: `${Math.max(0, Math.ceil(game.duration - s.t / 60))} s`,
    hint: s.phase === 'show' || s.phase === 'intro' ? 'Merken …' : s.phase === 'input' ? `Du bist dran (${s.pos}/${s.len})` : s.phase === 'ok' ? 'Richtig!' : s.failed ? 'Falsche Säule!' : 'Zeit um',
  }),
};

function pillarInput(i: number): InputFrame {
  switch (i) {
    case 0: return { ...NEUTRAL_INPUT, y: 1 };
    case 1: return { ...NEUTRAL_INPUT, x: -1 };
    case 2: return { ...NEUTRAL_INPUT, x: 1 };
    case 3: return { ...NEUTRAL_INPUT, y: -1 };
    case 4: return { ...NEUTRAL_INPUT, b: true };
    default: return { ...NEUTRAL_INPUT, a: true };
  }
}

/** Kleiner Ganzzahl-Hash (deterministisch, ohne Zufallsgenerator) */
export function hash(a: number, b: number): number {
  let h = (Math.imul(a | 0, 0x9e3779b1) ^ Math.imul(b | 0, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0;
  return (h ^ (h >>> 15)) >>> 0;
}

