/**
 * Erzeugt aus einer generierten Komposition die spielbaren Ereignisse.
 * Noten liegen auf Kick-, Snare- und Melodieschlägen, Wände auf Taktschwerpunkten,
 * Orbs auf Hi-Hats/Arpeggios. Dadurch ist jedes Ereignis musikalisch verankert.
 */
import { chance, mulberry32, pick } from '../core/rng';
import { sectionAt, stepToSeconds, type Song } from '../audio/music';

export const LANES = 3;
export type EventKind = 'note' | 'orb' | 'wall';

export interface ChartEvent {
  id: number;
  step: number;
  time: number;
  kind: EventKind;
  /** Hauptspur (bei Wänden die erste blockierte Spur). */
  lane: number;
  /** Bei Wänden alle blockierten Spuren, sonst nur [lane]. */
  lanes: number[];
}

export interface ChartParams {
  seed: number;
  density: number;
  wallRate: number;
  orbRate: number;
  minGap: number;
  doubleWalls: boolean;
  startStep: number;
  endStep: number;
}

interface StepInfo {
  kick: boolean;
  snare: boolean;
  lead: number;
  hat: boolean;
}

const KIND_ORDER: Record<EventKind, number> = { wall: 0, note: 1, orb: 2 };

export function generateChart(
  song: Song,
  p: ChartParams,
  stepOffset = 0,
  idStart = 0,
): ChartEvent[] {
  const rng = mulberry32(p.seed);
  const info: StepInfo[] = Array.from({ length: song.totalSteps }, () => ({
    kick: false,
    snare: false,
    lead: -1,
    hat: false,
  }));
  for (const n of song.notes) {
    const si = info[n.step];
    if (!si) continue;
    if (n.inst === 'kick') si.kick = true;
    else if (n.inst === 'snare' || n.inst === 'clap') si.snare = si.snare || n.vel > 0.6;
    else if (n.inst === 'lead') si.lead = Math.max(si.lead, n.midi);
    else if (n.inst === 'hat' || n.inst === 'openhat' || n.inst === 'arp') si.hat = true;
  }

  const start = Math.max(0, p.startStep);
  const end = Math.min(song.totalSteps, p.endStep);
  const notes: { step: number; lane: number }[] = [];
  let lane = 1;
  let lastStep = -999;
  let lastPitch = -1;

  for (let s = start; s < end; s++) {
    const si = info[s];
    const sec = sectionAt(song, s);
    const offbeat8 = si.hat && s % 2 === 0 && p.density > 0.85 && sec.kind === 'drop';
    const weight = si.kick ? 0.95 : si.snare ? 0.9 : si.lead >= 0 ? 0.8 : offbeat8 ? 0.5 : 0;
    if (weight === 0) continue;
    const gap = sec.kind === 'drop' || sec.kind === 'build' ? p.minGap : Math.max(p.minGap, 4);
    if (s - lastStep < gap) continue;
    const prob = Math.min(1, p.density * (0.6 + sec.energy * 0.9) * weight * 1.2);
    if (!chance(rng, prob)) continue;
    if (si.lead >= 0 && lastPitch >= 0 && si.lead !== lastPitch) {
      lane += si.lead > lastPitch ? 1 : -1;
    } else if (chance(rng, 0.55)) {
      lane += pick(rng, [-1, 1]);
    }
    if (lane < 0) lane = 1;
    if (lane >= LANES) lane = LANES - 2;
    if (si.lead >= 0) lastPitch = si.lead;
    notes.push({ step: s, lane });
    lastStep = s;
  }

  const noteNear = (s: number, radius: number): number[] =>
    notes.filter((n) => Math.abs(n.step - s) <= radius).map((n) => n.lane);

  const walls: { step: number; lanes: number[] }[] = [];
  let lastWall = -999;
  const wallGap = p.doubleWalls ? 6 : 8;
  for (let s = Math.max(start, 16); s < end - 4; s += 2) {
    const sec = sectionAt(song, s);
    if (sec.kind === 'intro' || sec.kind === 'outro') continue;
    if (s - lastWall < wallGap) continue;
    const si = info[s];
    const accent = s % 4 === 0 || si.snare;
    if (!accent) continue;
    if (!chance(rng, p.wallRate * sec.energy * 0.5)) continue;
    const forbidden = new Set(noteNear(s, 3));
    const candidates = [0, 1, 2].filter((l) => !forbidden.has(l));
    if (candidates.length === 0) continue;
    const count = p.doubleWalls && candidates.length >= 2 && chance(rng, 0.35) ? 2 : 1;
    const shuffled = [...candidates].sort(() => rng() - 0.5);
    let blocked = shuffled.slice(0, count).sort((a, b) => a - b);
    if (blocked.length >= LANES) blocked = blocked.slice(0, LANES - 1);
    if (blocked.length === 0) continue;
    walls.push({ step: s, lanes: blocked });
    lastWall = s;
  }

  const wallBlocks = (s: number, l: number): boolean =>
    walls.some((w) => Math.abs(w.step - s) <= 1 && w.lanes.includes(l));

  const orbs: { step: number; lane: number }[] = [];
  let lastOrb = -999;
  let ni = 0;
  for (let s = start; s < end; s++) {
    const si = info[s];
    if (!si.hat) continue;
    const sec = sectionAt(song, s);
    if (sec.kind === 'intro' || sec.kind === 'outro') continue;
    if (s - lastOrb < 2) continue;
    if (noteNear(s, 1).length > 0) continue;
    if (!chance(rng, p.orbRate * sec.energy * 0.28)) continue;
    while (ni < notes.length - 1 && notes[ni + 1].step <= s) ni++;
    const prevLane = notes.length ? notes[ni].lane : 1;
    let l = chance(rng, 0.7) ? prevLane : pick(rng, [0, 1, 2]);
    if (wallBlocks(s, l)) {
      const free = [0, 1, 2].find((x) => !wallBlocks(s, x));
      if (free === undefined) continue;
      l = free;
    }
    orbs.push({ step: s, lane: l });
    lastOrb = s;
  }

  const events: Omit<ChartEvent, 'id'>[] = [
    ...notes.map((n) => ({ step: n.step, kind: 'note' as const, lane: n.lane, lanes: [n.lane] })),
    ...walls.map((w) => ({
      step: w.step,
      kind: 'wall' as const,
      lane: w.lanes[0],
      lanes: w.lanes,
    })),
    ...orbs.map((o) => ({ step: o.step, kind: 'orb' as const, lane: o.lane, lanes: [o.lane] })),
  ].map((e) => ({
    ...e,
    step: e.step + stepOffset,
    time: stepToSeconds(e.step + stepOffset, song.bpm),
  }));
  events.sort((a, b) => a.step - b.step || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
  return events.map((e, i) => ({ ...e, id: idStart + i }));
}
