/* Liste der 3D-Minispiele. Schnittstelle für Clubs, Story und Innenräume:
     import { MINIS, minisFor } from './minigames/minis';
     game.playMini('jump', { onDone: (r) => { …r.score, r.won… } });     // startet das Spiel, danach zurück an den alten Ort
     minisFor('club', adult)                                             // passende Spiele für einen Ort (Tag)
   Mit „Inhalte ab 18“ bekommen manche Spiele frechere Namen und Figuren, die Regeln bleiben gleich. */
import type { MiniDef } from './arcade';
import { DildoJump } from './DildoJump';
import { ToastSplash } from './ToastSplash';

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
];

export const miniById = (id: string) => MINIS.find((m) => m.id === id);
export function minisFor(tag: string, adult: boolean) { return MINIS.filter((m) => m.tags.includes(tag) && (adult || !m.adultOnly)); }
export const miniName = (m: MiniDef, adult: boolean) => (adult && m.adultName) || m.name;
export const miniIcon = (m: MiniDef, adult: boolean) => (adult && m.adultIcon) || m.icon;
export const miniSub = (m: MiniDef, adult: boolean) => (adult && m.adultSub) || m.sub;
