/* Liste der 3D-Minispiele. Schnittstelle für Clubs, Story und Innenräume:
     import { MINIS, minisFor } from './minigames/minis';
     game.playMini('jump', { onDone: (r) => { …r.score, r.won… } });     // startet das Spiel, danach zurück an den alten Ort
     minisFor('club', adult)                                             // passende Spiele für einen Ort (Tag)
   Mit „Inhalte ab 18“ bekommen manche Spiele frechere Namen und Figuren, die Regeln bleiben gleich. */
import type { MiniDef } from './arcade';
import { DildoJump } from './DildoJump';
import { ToastSplash } from './ToastSplash';
import { ParadeRunner } from './ParadeRunner';
import { PoolDive } from './PoolDive';
import { LegDay } from './LegDay';
import { Karaoke } from './Karaoke';
import { Sauna } from './Sauna';
import { GlitterMatch } from './GlitterMatch';
import { CastingDay } from './CastingDay';
import { DarkRoom } from './DarkRoom';
import { OutfitCheck } from './OutfitCheck';
import { BarShift } from './BarShift';
import { DjBooth } from './DjBooth';

export type { MiniDef, MiniResult } from './arcade';

export const MINIS: MiniDef[] = [
  {
    id: 'jump', icon: '🚀', name: 'Raketen-Hüpfer', sub: 'Hüpf den Neon-Turm hinauf, sammle Herzen, zünde den Turbo',
    adultIcon: '🍆', adultName: 'Dildo Jump', adultSub: 'Big Bertha hüpft den Neon-Turm hinauf – Gleitgel-Pads, Turbo, Glitzer',
    btn: '🚀<small>Turbo</small>', goal: 1500, tags: ['club', 'bar', 'home', 'arcade'], song: 'neon',
    make: (g, d, a, done) => new DildoJump(g, d, a, done, 0x170a2e),
  },
  {
    id: 'toast', icon: '🍞', name: 'Toast-Glasur', sub: 'Fliegende Toasts mit Regenbogen-Zuckerguss treffen – 60 Sekunden',
    adultIcon: '💦', adultName: 'Toast-Spritzer', adultSub: 'Fliegende Toasts schön weiß einspritzen – 60 Sekunden, Goldtoast zählt dreifach',
    btn: '💦<small>Spritzen</small>', goal: 900, tags: ['home', 'cafe', 'club', 'arcade'], song: 'club',
    make: (g, d, a, done) => new ToastSplash(g, d, a, done, 0x2a1530),
  },
  {
    id: 'run', icon: '🏃', name: 'Parade-Runner', sub: 'Neben dem Festwagen durch die Pride-Parade rennen – Spuren, Sprünge, Glitzer',
    btn: '⤒<small>Springen</small>', goal: 700, tags: ['parade', 'arcade', 'garage'], gl: 'run', song: 'title',
    make: (g, d, a, done) => new ParadeRunner(g, d, a, done, 0xffc6e6),
  },
  {
    id: 'pool', icon: '🏊', name: 'Strandbad-Sprung', sub: 'Fünf Sprünge vom Turm: Kraft, Winkel, Saltos – und sauber eintauchen',
    btn: '🤸<small>A</small>', goal: 450, tags: ['pool', 'beach'], gl: 'pool', song: 'title', noPad: true,
    make: (g, d, a, done) => new PoolDive(g, d, a, done, 0xbfe8ff),
  },
  {
    id: 'gym', icon: '🏋️', name: 'Beinetag', sub: 'Mehmet scheucht dich: im grünen Bereich stemmen, jede Wiederholung wird schwerer',
    btn: '💪<small>Stemmen</small>', goal: 240, tags: ['gym'], gl: 'gym', song: 'neon', noPad: true,
    make: (g, d, a, done) => new LegDay(g, d, a, done, 0x101820),
  },
  {
    id: 'kara', icon: '🎤', name: 'Karaoke', sub: 'Drei Lieder aus Gay Life!: Silben im Takt singen, das Publikum geht mit',
    btn: '🎤<small>Singen</small>', goal: 600, tags: ['bar', 'club', 'home'], gl: 'kara', song: 'show',
    make: (g, d, a, done) => new Karaoke(g, d, a, done, 0x0c0618),
  },
  {
    id: 'sauna', icon: '🧖', name: 'Sauna-Aufguss', sub: 'Hitze im grünen Bereich halten, Aufguss und Kaltdusche – und das Handtuch retten',
    btn: '🫳<small>Handtuch</small>', goal: 300, tags: ['sauna'], gl: 'sauna', song: 'title',
    make: (g, d, a, done) => new Sauna(g, d, a, done, 0x6a3a20),
  },
  {
    id: 'match', icon: '✨', name: 'Glitzer-Match', sub: 'Glitzersteine tauschen, Ketten bilden, 25 Züge',
    btn: '✨<small>Tauschen</small>', goal: 900, tags: ['arcade', 'home'], gl: 'match', song: 'neon', noPad: true,
    make: (g, d, a, done) => new GlitterMatch(g, d, a, done, 0x120a26),
  },
  {
    id: 'cast', icon: '🎬', name: 'Casting-Tag', sub: 'Regisseur Rüdiger ruft Szenen, du spielst blitzschnell die passende Reaktion',
    btn: '🎬<small>Action</small>', goal: 600, tags: ['studio', 'home'], gl: 'cast', song: 'title',
    make: (g, d, a, done) => new CastingDay(g, d, a, done, 0x140f0a),
  },
  {
    id: 'dark', icon: '🔦', name: 'Blackout-Party', sub: 'Stockfinster: mit der Taschenlampe verlorene Sachen finden, niemanden anrempeln',
    adultIcon: '🌑', adultName: 'Dunkelkammer', adultSub: 'Stockfinster: Unterhose, Gleitgel und Handy wiederfinden, ohne jemanden anzurempeln',
    btn: '✋<small>Greifen</small>', goal: 600, tags: ['club', 'dark'], gl: 'dark', song: 'club',
    make: (g, d, a, done) => new DarkRoom(g, d, a, done, 0x05030a),
  },
  {
    id: 'style', icon: '🪞', name: 'Outfit-Check', sub: 'Fünf Anlässe, eine strenge Jury: den passenden Look wählen und über den Laufsteg',
    btn: '👠<small>Laufen</small>', goal: 900, tags: ['shop', 'home'], gl: 'style', song: 'show',
    make: (g, d, a, done) => new OutfitCheck(g, d, a, done, 0x120818),
  },
  {
    id: 'bar', icon: '🍸', name: 'Barkeeper-Schicht', sub: 'Club Leuchtturm: Cocktails nach Karte mixen, servieren, Trinkgeld kassieren – 75 Sekunden',
    btn: '🍸<small>Mixen</small>', goal: 800, tags: ['bar', 'club', 'home'], song: 'club',
    make: (g, d, a, done) => new BarShift(g, d, a, done, 0x0c1420),
  },
  {
    id: 'dj', icon: '🎧', name: 'DJ-Pult', sub: 'Pride Rave: Crossfader zur Wunschmusik der Menge schieben und den Drop treffen',
    btn: '💥<small>Drop</small>', goal: 1000, tags: ['club', 'home', 'arcade'], gl: 'rave', song: 'club',
    make: (g, d, a, done) => new DjBooth(g, d, a, done, 0x0a0614),
  },
];

/** 3D-Fassung eines Gay-Life!-Minispiels (für Innenräume, die bisher das 2D-Original öffnen) */
export const miniForGl = (gl: string) => MINIS.find((m) => m.gl === gl);
export const miniById = (id: string) => MINIS.find((m) => m.id === id);
export function minisFor(tag: string, adult: boolean) { return MINIS.filter((m) => m.tags.includes(tag) && (adult || !m.adultOnly)); }
export const miniName = (m: MiniDef, adult: boolean) => (adult && m.adultName) || m.name;
export const miniIcon = (m: MiniDef, adult: boolean) => (adult && m.adultIcon) || m.icon;
export const miniSub = (m: MiniDef, adult: boolean) => (adult && m.adultSub) || m.sub;
