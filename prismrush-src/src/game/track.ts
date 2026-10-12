/**
 * Eine Spielstrecke: Musik + Ereignisse. Endliche Level bestehen aus einem
 * Abschnitt, der Endlos-Modus hängt bei Bedarf weitere generierte Abschnitte an.
 */
import type { MusicSource } from '../audio/engine';
import {
  STEPS_PER_BAR,
  sectionAt,
  secondsToStep,
  stepToSeconds,
  type NoteEvent,
  type Section,
  type Song,
} from '../audio/music';
import { generateChart, type ChartEvent, type ChartParams } from './chart';

export interface ChunkPlan {
  song: Song;
  /** Chart-Parameter relativ zum Abschnitt; null = vorgegebene Ereignisse. */
  params: ChartParams | null;
  events?: Omit<ChartEvent, 'id' | 'time'>[];
}

interface Chunk {
  song: Song;
  startStep: number;
}

export class Track implements MusicSource {
  readonly events: ChartEvent[] = [];
  private chunks: Chunk[] = [];
  private nextChunkStart = 0;
  private exhausted = false;

  constructor(
    readonly bpm: number,
    private readonly provider: (index: number) => ChunkPlan | null,
    readonly endless: boolean,
    /** Optionale Umwandlung je Ereignis (Spiegeln, Entfernen …); null verwirft es. */
    private readonly mapEvent?: (e: ChartEvent) => ChartEvent | null,
  ) {
    this.appendChunk();
  }

  private appendChunk(): boolean {
    if (this.exhausted) return false;
    const plan = this.provider(this.chunks.length);
    if (!plan) {
      this.exhausted = true;
      return false;
    }
    const startStep = this.nextChunkStart;
    const idStart = this.events.length;
    let evs: ChartEvent[];
    if (plan.params) {
      evs = generateChart(plan.song, plan.params, startStep, idStart);
    } else {
      evs = (plan.events ?? []).map((e, i) => ({
        ...e,
        step: e.step + startStep,
        time: stepToSeconds(e.step + startStep, this.bpm),
        id: idStart + i,
      }));
    }
    if (this.mapEvent) {
      const map = this.mapEvent;
      evs = evs
        .map((e) => map(e))
        .filter((e): e is ChartEvent => e !== null)
        .map((e, i) => ({ ...e, id: idStart + i }));
    }
    for (const e of evs) this.events.push(e);
    this.chunks.push({ song: plan.song, startStep });
    this.nextChunkStart += plan.song.totalSteps;
    if (!this.endless) this.exhausted = true;
    return true;
  }

  /** Stellt sicher, dass Musik/Ereignisse mindestens bis step generiert sind. */
  ensureUntil(step: number): void {
    while (!this.exhausted && this.nextChunkStart <= step) {
      if (!this.appendChunk()) break;
    }
  }

  get totalSteps(): number {
    return this.endless ? Number.POSITIVE_INFINITY : this.nextChunkStart;
  }

  get duration(): number {
    return this.endless ? Number.POSITIVE_INFINITY : stepToSeconds(this.nextChunkStart, this.bpm);
  }

  get rootMidi(): number {
    return this.chunks[0].song.rootMidi;
  }

  stepAt(seconds: number): number {
    return secondsToStep(seconds, this.bpm);
  }

  timeOfStep(step: number): number {
    return stepToSeconds(step, this.bpm);
  }

  notesInRange(fromStep: number, toStep: number): NoteEvent[] {
    this.ensureUntil(toStep + STEPS_PER_BAR);
    const out: NoteEvent[] = [];
    for (const c of this.chunks) {
      const cEnd = c.startStep + c.song.totalSteps;
      if (cEnd <= fromStep || c.startStep >= toStep) continue;
      const notes = c.song.notes;
      let lo = 0;
      let hi = notes.length;
      const rel = fromStep - c.startStep;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (notes[mid].step < rel) lo = mid + 1;
        else hi = mid;
      }
      for (let i = lo; i < notes.length; i++) {
        const abs = notes[i].step + c.startStep;
        if (abs >= toStep) break;
        out.push({ ...notes[i], step: abs });
      }
    }
    return out;
  }

  sectionAt(step: number): Section {
    for (const c of this.chunks) {
      if (step < c.startStep + c.song.totalSteps) {
        return sectionAt(c.song, Math.max(0, step - c.startStep));
      }
    }
    const last = this.chunks[this.chunks.length - 1];
    return sectionAt(last.song, last.song.totalSteps - 1);
  }
}

export function singleSongTrack(
  plan: ChunkPlan,
  mapEvent?: (e: ChartEvent) => ChartEvent | null,
): Track {
  return new Track(plan.song.bpm, (i) => (i === 0 ? plan : null), false, mapEvent);
}
