/* Viral: Passant*innen zücken das Handy, wenn du auf der Straße etwas Spektakuläres machst (langer Drift, wilder Crash,
   Vollgas-Fahrt). Ein paar Sekunden später landet der Clip auf Glitzergram: Aufrufe, neue Follower, Kommentar im Feed.
   Reine Logik hier (testbar), die Erkennung läuft über Stunts.update() im Fahr-Takt von CityScene. */
import type { SaveData } from '../engine/Save';
import { post } from './social';
import { followers } from './gram';

export type Stunt = 'drift' | 'crash' | 'tempo';
const TITLES: Record<Stunt, string[]> = {
  drift: ['Drift des Tages 🔥', 'Seitwärts durch Rainbow City 💨', 'Wer hat dem das beigebracht?! 🏎️', 'Reifen weg, Style da ✨'],
  crash: ['Das war knapp 😱', 'Blechtanz an der Kreuzung 🙈', 'Versicherung: nein danke 😅', 'Alle okay, nur der Lack nicht 💅'],
  tempo: ['Gesehen: Raketenstart auf der Hauptstraße 🚀', 'Zu schnell für die Kamera 📸', 'Rainbow City im Zeitraffer ⚡'],
};
const COMMENTS = ['Ich war dabei!!', 'Wie cool ist das denn', 'Bitte mehr davon', 'Ikone 👑', 'Rainbow City liefert wieder', 'Mein Herz 😂', 'Wer ist das? Ich folge sofort'];
/** höchstens so viele virale Clips pro Spieltag */
export const PER_DAY = 4;

export function canGoViral(s: SaveData) { return Number(s.flags.viralDay) !== s.day || (Number(s.flags.viralN) || 0) < PER_DAY; }

export interface Clip { title: string; views: number; gain: number; by: string; text: string; comment: string }
/** power 0–1: wie spektakulär (Drift-Dauer, Aufprall, Tempo). Rechnet Aufrufe und Follower aus und schreibt den Feed-Eintrag. */
export function goViral(s: SaveData, kind: Stunt, power: number, by: string, r = Math.random()): Clip | null {
  if (!canGoViral(s)) return null;
  if (Number(s.flags.viralDay) !== s.day) { s.flags.viralDay = s.day; s.flags.viralN = 0; }
  s.flags.viralN = (Number(s.flags.viralN) || 0) + 1;
  const fol = followers(s), p = Math.max(0, Math.min(1, power));
  const views = Math.round((800 + p * 9000 + fol * 1.8) * (.6 + r * .9) / 10) * 10;
  const gain = Math.max(3, Math.round(views / 220 * (.7 + r * .6)));
  s.flags.fol = fol + gain;
  s.flags.viralAll = (Number(s.flags.viralAll) || 0) + 1;
  const t = TITLES[kind], title = t[Math.floor(r * t.length) % t.length];
  const comment = COMMENTS[Math.floor(r * 97) % COMMENTS.length];
  const text = `🎥 „${title}“ · ${views.toLocaleString('de-DE')} Aufrufe · „${comment}“`;
  post(s, `@${by.toLowerCase().replace(/[^a-zäöüß0-9]/g, '')}_filmt`, text);
  return { title, views, gain, by, text, comment };
}

/** Erkennt Stunts beim Fahren: Drift (Dauer), Crash (Wucht) und Vollgas-Strecke. Liefert den Stunt, sobald er vorbei ist. */
export class Stunts {
  private drift = 0;
  private fast = 0;
  update(dt: number, f: { slip: number; v: number; max: number; plain: boolean }): { kind: Stunt; power: number } | null {
    if (!f.plain) { this.drift = 0; this.fast = 0; return null; }
    const v = Math.abs(f.v);
    if (Math.abs(f.slip) > .3 && v > 7) this.drift += dt;
    else if (this.drift > 0) { const d = this.drift; this.drift = 0; if (d > 1.4) return { kind: 'drift', power: Math.min(1, (d - 1) / 3) }; }
    if (v > Math.max(24, f.max * .9)) this.fast += dt;
    else if (this.fast > 0) { const d = this.fast; this.fast = 0; if (d > 5) return { kind: 'tempo', power: Math.min(1, (d - 4) / 8) }; }
    return null;
  }
  crash(hit: number): { kind: Stunt; power: number } | null { return hit > 11 ? { kind: 'crash', power: Math.min(1, (hit - 9) / 16) } : null; }
}
