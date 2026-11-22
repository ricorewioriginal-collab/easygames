/* Schnittstelle für Story, Minispiele und andere Systeme: Ereignisse rund um Clubs, Geschäfte, das eigene Zuhause und die Drag-Karriere.
   Zuhören:  import { pcEvents } from './hooks';  pcEvents.on('clubGekauft', (e) => …)
   Im Browser auch über window.__pc.events (z. B. für Tests).
   Story-Angebot: s.flags['deal_<business-id>'] = Rabatt in Prozent (0–90) macht den Kauf günstiger, bis gekauft wurde. */
import { Emitter } from '../engine/events';

export interface PcEvents extends Record<string, unknown> {
  /** Ein Geschäft wurde gekauft (alle Geschäfte, auch Läden) */
  geschaeftGekauft: { id: string; name: string; price: number };
  /** Ein Club wurde gekauft (Prisma, One Love Bar, Bar Komet, Skybar Wolke 7) */
  clubGekauft: { id: string; name: string; price: number };
  /** DJ, Preise, Tür, Deko oder Awareness-Team eines Clubs geändert */
  clubGeaendert: { id: string; what: string; state: unknown };
  /** Eine Clubnacht wurde gespielt und abgerechnet */
  clubNacht: { id: string; name: string; guests: number; revenue: number; cost: number; rep: number; event: string };
  /** Tageseinnahmen aller Geschäfte ausgezahlt (morgens) */
  clubEinnahmen: { pay: number; notes: string[] };
  /** Zuhause ausgebaut: Möbel/Deko (kind 'item'), Boden/Licht ('style') oder Anbau-Raum ('room', level 1–3) */
  hausAusbau: { kind: 'item' | 'style' | 'room'; id: string; level: number };
  /** Rainbow Match: Date gelaufen (stage = neue Stufe 0–3, up = Stufe gestiegen, pts 0–6) */
  dateGelaufen: { id: string; name: string; stage: number; up: boolean; pts: number };
  /** Liebesnacht (nur 18+, angedeutet) mit einem Match */
  liebesnacht: { id: string; name: string };
  /** Wahlfamilie: jemand zieht ein oder aus */
  mitbewohner: { id: string; name: string; in: boolean };
  /** Gemeinsamer Abend zu Hause (Spiele-, Koch-, Film-, Geschichtsabend …) */
  wgAbend: { id: string; with: string[] };
  /** Haustier adoptiert */
  haustier: { kind: string; name: string };
  /** Auftrag an einem Treffpunkt (Sauna, Strandbar) erledigt */
  treffAuftrag: { place: string; id: string };
  /** Drag-Look am Schminkspiegel gespeichert (drag.ts, dragLook.ts) */
  dragLook: { look: Record<string, string>; style: string };
  /** Lip-Sync-Battle vorbei (stage 1–5 = Karriere-Stufe, 0 = Kronen-Verteidigung) */
  dragBattle: { rival: string; name: string; won: boolean; score: number; stage: number; defend: boolean };
  /** Alle fünf Queens geschlagen: Krone von Rainbow City (Flag dragKrone) */
  dragKrone: { name: string };
  /** Hauptberuf in der Jobbörse angenommen (beruf.ts) */
  beruf: { id: string; name: string };
  /** Training in der Muckibude (figur.ts): neue Muskelwerte 0–100 */
  training: { kind: string; mus: number };
  /** Neues Tattoo gestochen */
  tattoo: { id: string };
  /** Foto auf Glitzergram gepostet (gram.ts) */
  glitzergram: { likes: number; followers: number; spot: string; brief: string | null };
  /** Dreh als Erwachsenen-Darsteller*in abgeschlossen (dreh.ts, nur 18+) */
  drehTag: { title: string; stars: number; fans: number; pay: number };
  /** Eine Wissenskarte mit echter queerer Geschichte wurde freigeschaltet (Drag, CSD, Radio …) */
  wissen: { key: string; title: string; topic: string };
  /** Eigener CSD-Festwagen gebaut oder umgebaut (festwagen.ts) */
  wagenGestaltet: { flag: string; motto: string; deko: string; sound: string; score: number; first: boolean };
  /** Jury-Preis für den eigenen Wagen bei der CSD-Parade (Platz 1–3) */
  paradeWagen: { place: number; score: number; money: number; rep: number; motto: string };
  /** Eigene Radiosendung „Rainbow Talk“ auf Pride FM gesendet (pridefm.ts) */
  radioSendung: { points: number; listeners: number; money: number };
  /** One-Night-Stand mit einer fremden Person (flirtui.ts, 18+): Bewertung 1–5, ohne Kondom (abgesprochen), im Darkroom */
  oneNight: { name: string; stars: number; bare: boolean; dark: boolean };
  /** Hausparty gefeiert (adult = mit geschlossener Tür, nur angedeutet) */
  hausparty: { host: string; adult: boolean };
}
export const pcEvents = new Emitter<PcEvents>();
