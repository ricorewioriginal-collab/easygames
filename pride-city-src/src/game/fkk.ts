/* FKK-Abende (nur mit „Inhalte ab 18“): In Clubs und im Kopfkino sind an festen Wochentagen alle nackt, wie beim FKK.
   Nicht sexuell: Gäste tanzen, plaudern und schauen Filme wie sonst auch, nur ohne Kleidung. Wer mag, ruft den Abend
   auch an einem anderen Tag aus (flags.fkk_<raum> = Tag). Die Spielfigur zieht sich dort selbst aus oder wieder an. */
import type { SaveData } from '../engine/Save';

export interface FkkNight { name: string; days: number[]; text: string; cost: number }
/** Wochentage: 0 = Montag … 6 = Sonntag */
export const FKK: Record<string, FkkNight> = {
  kopfkino: { name: 'FKK-Filmnacht', days: [2, 5], text: 'Mittwochs und samstags läuft im Kopfkino die FKK-Filmnacht: Kleidung an der Garderobe, Handtuch auf den Sitz, Popcorn wie immer.', cost: 15 },
  club: { name: 'Naked Rave im Prisma', days: [4], text: 'Freitags tanzt das Prisma nackt. Kleidung kommt in die Garderobe, nur Schuhe und gute Laune bleiben an.', cost: 25 },
  bar: { name: 'FKK-Party im Leuchtturm', days: [5], text: 'Samstags feiert der Leuchtturm seine FKK-Party. Alle sind nackt, niemand starrt, alle tanzen.', cost: 25 },
};
const wd = (s: SaveData) => (s.day - 1) % 7;
const DAYS = ['montags', 'dienstags', 'mittwochs', 'donnerstags', 'freitags', 'samstags', 'sonntags'];
/** Läuft heute an diesem Ort ein FKK-Abend? */
export const fkkOn = (s: SaveData, room: string) => !!s.settings.adult && !!FKK[room] && (FKK[room].days.includes(wd(s)) || s.flags['fkk_' + room] === s.day);
/** Wann der Abend regulär stattfindet, z. B. „mittwochs und samstags“ */
export const fkkWhen = (room: string) => FKK[room].days.map((d) => DAYS[d]).join(' und ');
