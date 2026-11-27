/* Buslinie 69 „Regenbogen-Ring“: langsamer und billiger als die Tram, dafür sitzt immer jemand neben dir, der etwas
   zu erzählen hat. Jede Fahrt ein kurzes Gespräch mit Antwort-Wahl (Kontakte, Spaß, manchmal ein Tipp). */
import type { Line } from '../ui/ui';

export const BUS_COST = 1;
export const BUS_MIN = 25;

interface Talk { who: string; color: string; lines: string[]; nice: [string, string]; quiet: string; tip?: string }
const TALKS: Talk[] = [
  { who: 'Oma Gerda', color: '#c9a0ff', lines: ['Junger Mensch, Sie sehen aus, als wüssten Sie, wo man hier gut tanzt.', 'Mein Enkel hat mich zum CSD eingeladen. Ich war seit 1979 nicht mehr auf einer Demo!'],
    nice: ['🥰 „Sie werden es lieben! Ich zeig Ihnen den besten Platz.“', 'Gerda kramt ein Bonbon aus der Tasche: „Für die gute Laune.“'], quiet: 'Gerda lächelt und schaut aus dem Fenster.' },
  { who: 'Jonas, Student', color: '#5ad7ff', lines: ['Sorry, kurze Frage: Ist das hier richtig zum Regenbogenhaus?', 'Ich hab morgen mein erstes Treffen in der Jugendgruppe. Bin voll nervös.'],
    nice: ['💜 „Du schaffst das. Da sind alle mal neu gewesen.“', 'Jonas atmet aus: „Danke. Echt.“ Er tippt sich deine Nummer ins Handy.'], quiet: 'Jonas nickt und steckt die Kopfhörer wieder ein.', tip: 'Das Regenbogenhaus hilft mit Beratung und Spenden-Aktionen.' },
  { who: 'Busfahrerin Mo', color: '#ffb347', lines: ['Festhalten, Kurve! Ich fahr die 69 seit zwanzig Jahren.', 'Die besten Geschichten passieren nachts zwischen Laternenmeile und Hafen.'],
    nice: ['😄 „Erzählen Sie mal eine!“', 'Mo lacht: „Einmal hat ein Drag-Ensemble hier hinten geprobt. Mit Nebelmaschine.“'], quiet: 'Mo dreht das Radio lauter.' },
  { who: 'Kai, Bauarbeiter', color: '#7fd67f', lines: ['Puh, Feierabend. Weißt du, was ich am liebsten hätte? Einen Falafel-Dürüm aus dem Späti.', 'Und dann ab ins Fitnessstudio. Laufband, sonst rostet man.'],
    nice: ['💪 „Wir sehen uns in der Muckibude!“', 'Kai grinst: „Der Protein-Shake da ist gut. Training wirkt doppelt so gut, sag ich dir.“'], quiet: 'Kai gähnt und lehnt den Kopf ans Fenster.', tip: 'Protein-Shake in der Muckibude: Training wirkt 50 % stärker.' },
  { who: 'Lale mit Hund', color: '#ff8fb8', lines: ['Bello, sitz! Sorry, er ist so neugierig.', 'Wenn du mal ein Leckerli dabeihast, ist er dein bester Freund. Versprochen.'],
    nice: ['🐶 „Na, du Süßer!“', 'Bello legt dir die Pfote aufs Knie. Lale strahlt.'], quiet: 'Bello schnüffelt an deinen Schuhen.' },
  { who: 'Ein Paar in Lederjacken', color: '#ff6ad5', lines: ['Wir haben uns genau in diesem Bus kennengelernt. Linie 69, letzte Reihe.', 'Heute ist unser zehnter Jahrestag. Wir fahren einmal die ganze Runde.'],
    nice: ['🥂 „Herzlichen Glückwunsch!“', 'Die beiden küssen sich, der halbe Bus applaudiert.'], quiet: 'Die beiden halten Händchen und summen ein Lied.' },
  { who: 'Teenie mit Regenbogen-Pin', color: '#ffd23b', lines: ['Darf ich fragen … wie war das bei dir, als du es deinen Eltern gesagt hast?', 'Ich will es meiner Mama am Wochenende erzählen.'],
    nice: ['🌈 „Nimm dir Zeit. Und du bist nicht allein, egal wie es läuft.“', 'Das Teenie wischt sich eine Träne weg und lächelt: „Danke.“'], quiet: 'Das Teenie schaut verlegen aufs Handy.', tip: 'Das Regenbogenhaus hat eine Jugendgruppe.' },
  { who: 'Herr Petersen', color: '#a0c4ff', lines: ['Diese Stadt! Früher war hier alles grau, wissen Sie.', 'Seit es die Lichterkette gibt, trau ich mich abends wieder raus.'],
    nice: ['✨ „Wir passen aufeinander auf.“', 'Herr Petersen tippt sich an den Hut: „So ist es recht.“'], quiet: 'Herr Petersen faltet seine Zeitung auf.' },
];

/** Gespräch für eine Busfahrt (seed 0–1 wählt die Person). pick(nett) läuft nach der Antwort,
    danach folgt die Reaktion (busAfter). */
export function busTalk(seed: number, pick: (nice: boolean) => void): Line[] {
  const t = talkOf(seed), say = (text: string): Line => ({ who: t.who, color: t.color, text });
  const out: Line[] = [{ who: '🚌 Linie 69', color: '#ff4fa3', text: 'Du setzt dich. Neben dir sitzt jemand und fängt gleich an zu erzählen.' }, ...t.lines.map(say)];
  out[out.length - 1] = { ...out[out.length - 1], choices: [
    { label: t.nice[0], fn: () => pick(true) },
    { label: '🎧 Nur nicken und Musik hören', fn: () => pick(false) },
  ] };
  return out;
}
export const talkOf = (seed: number) => TALKS[Math.floor(Math.abs(seed) * TALKS.length) % TALKS.length];
/** Reaktion nach der Antwort, dazu ein Tipp (falls die Person einen hat) */
export const busAfter = (seed: number, nice: boolean): Line => { const t = talkOf(seed); return { who: t.who, color: t.color, text: (nice ? t.nice[1] : t.quiet) + (nice && t.tip ? ` (Tipp: ${t.tip})` : '') }; };
export const TALK_COUNT = TALKS.length;
