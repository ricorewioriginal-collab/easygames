/* Jobs (aus Gay Life! übernommen): Eine Schicht dauert 4 Stunden und besteht aus drei Situationen mit je drei Antworten (0–2 Punkte).
   Lohn = 4 × Stundenlohn nach Stufe + Leistungsbonus, mal Stimmungsfaktor. Stufen steigen mit Erfahrung.
   Höchstens 2 Schichten pro Tag, nur zu den Öffnungszeiten, nicht bei Erschöpfung. */
import type { SaveData } from '../engine/Save';
import { change, hour, moodFactor, type Need } from './life';

export interface Job {
  id: string; name: string; poi: string; place: string; base: number; from: number; to: number;
  cost: Partial<Record<Need, number>>; titles: string[]; sc: Array<[string, Array<[string, number]>]>;
}

export const JOBS: Job[] = [
  { id: 'shop', name: 'Verkäufer*in', poi: 'boutique', place: 'Boutique Fabelhaft', base: 9, from: 10, to: 20, cost: { energy: -12, social: 6, fun: -4 }, titles: ['Aushilfe', 'Verkauf', 'Stylist*in', 'Filialleitung'],
    sc: [
      ['Jemand sucht ein Outfit für die Pride-Parade.', [['Bunt, mutig und bequem zum Tanzen zusammenstellen', 2], ['Nach dem Budget fragen und dann mischen', 1], ['Das teuerste Teil empfehlen', 0]]],
      ['Ein Kunde ist unsicher, ob ihm die Jacke steht.', [['Ehrlich sagen, was gut sitzt, und eine Alternative zeigen', 2], ['„Steht dir alles!“', 0], ['Den Spiegel entscheiden lassen', 1]]],
      ['Kurz vor Ladenschluss wollen drei Leute gleichzeitig bedient werden.', [['Reihenfolge freundlich klären, Wartenden ein Getränk anbieten', 2], ['Alle gleichzeitig halb bedienen', 0], ['Nur den ersten bedienen', 1]]],
      ['Eine Hose ist falsch ausgezeichnet.', [['Preis prüfen, entschuldigen, den richtigen Preis machen', 2], ['Zum falschen Preis verkaufen, damit es schnell geht', 0], ['Chef*in fragen und warten lassen', 1]]],
      ['Jemand möchte umtauschen, hat aber keinen Bon.', [['Kulanz anbieten: Gutschein statt Geld', 2], ['Glatt ablehnen', 0], ['Umtauschen, ohne zu fragen', 1]]]] },
  { id: 'gym', name: 'Fitnesstrainer*in', poi: 'gym', place: 'Muckibude Muskelkater', base: 10, from: 8, to: 21, cost: { energy: -22, hygiene: -20, hunger: -12, fun: 4 }, titles: ['Praktikum', 'Training', 'Personal Training', 'Studioleitung'],
    sc: [
      ['Ein Neuling will sofort das schwerste Gewicht stemmen.', [['Technik zeigen und mit leichtem Gewicht anfangen', 2], ['Machen lassen', 0], ['Verbieten', 1]]],
      ['Jemand klagt über Schmerzen im Knie.', [['Pause, Übung anpassen, bei Anhalten zum Arzt raten', 2], ['„Durchbeißen!“', 0], ['Nach Hause schicken', 1]]],
      ['Eine Gruppe verliert mittendrin die Lust.', [['Musik drehen, Spiel daraus machen', 2], ['Strenger werden', 0], ['Die Einheit verkürzen', 1]]],
      ['Jemand will schnell 10 Kilo abnehmen.', [['Realistisches Ziel setzen und Plan machen', 2], ['Crash-Diät empfehlen', 0], ['Nicken und kassieren', 1]]],
      ['Das Gerät ist kaputt, das Studio ist voll.', [['Schild aufstellen und Alternativen anbieten', 2], ['Ignorieren', 0], ['Studio schließen', 1]]]] },
  { id: 'cast', name: 'Fotograf*in', poi: 'studio', place: 'Studio Klappe Auf', base: 11, from: 10, to: 20, cost: { energy: -14, social: 4, fun: 2 }, titles: ['Assistenz', 'Fotografie', 'Bildredaktion', 'Studioinhaber*in'],
    sc: [
      ['Ein Paar ist nervös vor der Kamera.', [['Witz erzählen, erst Probebilder machen', 2], ['Sofort Anweisungen geben', 1], ['Schweigend knipsen', 0]]],
      ['Das Licht ist zu hart.', [['Diffusor aufbauen und Position ändern', 2], ['Nachbearbeiten und hoffen', 1], ['Weiter wie bisher', 0]]],
      ['Jemand mag sich auf keinem Foto.', [['Gemeinsam das beste auswählen, ehrlich loben', 2], ['Alles stark bearbeiten', 1], ['Achselzucken', 0]]],
      ['Eine Gruppe will ein Foto mit zwölf Leuten.', [['Reihen bilden, mehrere Aufnahmen, Augen prüfen', 2], ['Einmal drücken', 0], ['Aufteilen in Zweiergruppen', 1]]],
      ['Eine Kundin ist mit den Bildern unzufrieden.', [['Zuhören und kostenlos nachbessern', 2], ['Auf den Vertrag verweisen', 0], ['Rabatt geben, ohne nachzufragen', 1]]]] },
  { id: 'stage', name: 'DJ', poi: 'club', place: 'Club Prisma', base: 12, from: 20, to: 2, cost: { energy: -18, social: 12, fun: 8 }, titles: ['Warm-up-DJ', 'Resident-DJ', 'Headliner', 'Festival-Star'],
    sc: [
      ['Die Tanzfläche ist halb leer.', [['Bekanntes Lied spielen und langsam steigern', 2], ['Sofort Gas geben', 0], ['Pause machen', 1]]],
      ['Jemand wünscht sich ein ganz anderes Genre.', [['Freundlich vertrösten, später einbauen', 2], ['Ablehnen', 0], ['Kurzfristig umswitchen', 1]]],
      ['Ein Übergang geht schief, kurz Stille.', [['Ruhig bleiben, mit Effekt übergehen', 2], ['Entschuldigend ins Mikro', 1], ['Panisch alles neu starten', 0]]],
      ['Die Menge will eine Zugabe.', [['Euphorie nutzen: ein Hit, dann sauberer Schluss', 2], ['Doppelt so lang spielen', 1], ['Ablehnen', 0]]],
      ['Der Bass übertönt die Gespräche an der Bar.', [['Lautstärke etwas senken, Tiefen regeln', 2], ['Egal, ist ein Club', 0], ['Alles leiser', 1]]]] },
  { id: 'event', name: 'Eventmanager*in', poi: 'center', place: 'Regenbogenhaus', base: 11, from: 10, to: 18, cost: { energy: -16, social: 4, fun: -2 }, titles: ['Helfer*in', 'Planung', 'Eventmanagement', 'Festival-Leitung'],
    sc: [
      ['Der Festwagen ist zu hoch für die Unterführung.', [['Route prüfen und Umweg planen', 2], ['Aufbau kürzen, ohne zu fragen', 1], ['Trotzdem losfahren', 0]]],
      ['Zwei Gruppen wollen denselben Platz in der Parade.', [['Beide hören, Reihenfolge fair auslosen', 2], ['Wer zuerst kam, gewinnt', 1], ['Beide wegschicken', 0]]],
      ['Das Budget ist fast aufgebraucht.', [['Prioritäten setzen und Sponsoren fragen', 2], ['Überziehen', 0], ['Alles absagen', 1]]],
      ['Ein Team ist erschöpft.', [['Pause einplanen, Aufgaben neu verteilen', 2], ['Durchhalten befehlen', 0], ['Selbst alles übernehmen', 1]]],
      ['Regen ist angesagt.', [['Plan B mit Überdachung vorbereiten', 2], ['Hoffen', 0], ['Das Event verschieben', 1]]]] },
];

const XP = [0, 6, 16, 32];
export const jobById = (id: string) => JOBS.find((j) => j.id === id);
export const jobsAt = (poi: string) => JOBS.filter((j) => j.poi === poi);
export function rec(s: SaveData, id: string) { return (s.jobs[id] ||= { xp: 0, shifts: 0, earned: 0 }); }
export function level(s: SaveData, id: string) { const x = Number(s.jobs[id]?.xp) || 0; let l = 0; XP.forEach((t, i) => { if (x >= t) l = i; }); return l; }
export function title(s: SaveData, j: Job) { return j.titles[level(s, j.id)]; }
export function wage(s: SaveData, j: Job) { return Math.round(j.base * (1 + .25 * level(s, j.id))); }
export function open(j: Job, h: number) { return j.from < j.to ? h >= j.from && h < j.to : h >= j.from || h < j.to; }

/** Warum gerade keine Schicht geht – oder null */
export function blocked(s: SaveData, j: Job): string | null {
  if (!open(j, hour(s))) return `Geöffnet von ${j.from} bis ${j.to} Uhr.`;
  if (s.jobDay.d === s.day && s.jobDay.n >= 2) return 'Heute hast du schon zwei Schichten gearbeitet.';
  if (s.needs.energy < 15) return 'Du bist zu erschöpft. Erst schlafen oder einen Kaffee trinken.';
  return null;
}

/** Drei Situationen für eine Schicht (abhängig vom Tag, damit sie wechseln) */
export function situations(s: SaveData, j: Job) {
  const start = (s.day * 3 + (s.jobs[j.id]?.shifts || 0)) % j.sc.length;
  return [0, 1, 2].map((i) => j.sc[(start + i * 2) % j.sc.length]);
}

/** Schicht abrechnen. points 0..6. Liefert Lohn und ob es eine Beförderung gab. */
export function finish(s: SaveData, j: Job, points: number) {
  const r = rec(s, j.id), before = level(s, j.id);
  const pay = Math.round((wage(s, j) * 4 + points * 4) * moodFactor(s));
  r.shifts++; r.xp += 1 + points; r.earned += pay;
  s.money += pay;
  s.jobDay = s.jobDay.d === s.day ? { d: s.day, n: s.jobDay.n + 1 } : { d: s.day, n: 1 };
  change(s, j.cost);
  return { pay, promoted: level(s, j.id) > before ? title(s, j) : null };
}
