/* Geschlechtskrankheiten (STI) als Spielstatus, nur mit „Inhalte ab 18“: Ungeschützter Sex ist in Absprache möglich und
   bringt ein Risiko. Symptome zeigen sich nach ein paar Tagen (manchmal gar nicht), Test und Behandlung gibt es im
   Checkpoint Regenbogen. Die Fakten stimmen mit dem echten Leben überein (Stand 2025). Die Wahrscheinlichkeit je Kontakt
   ist niedrig und hängt an der Person: Wer frisch getestet ist oder auf PrEP regelmäßig testet, steckt seltener an. Kein Urteil: STI sind häufig, behandelbar und kein Grund zur Scham. */
import type { SaveData } from '../engine/Save';

export interface StiDef {
  id: string; name: string; icon: string;
  /** Ansteckungsrisiko je ungeschütztem Mal (Spiel) */ risk: number;
  /** Tage bis zu Symptomen; silent = Anteil ohne Symptome */ incub: number; silent: number;
  symptom: string; cure: string; cureDays: number; cost: number; info: string;
}
export const STIS: StiDef[] = [
  { id: 'chlamydien', name: 'Chlamydien', icon: '🦠', risk: .035, incub: 2, silent: .5, symptom: 'Es brennt beim Pinkeln, und irgendwas fühlt sich nicht richtig an.',
    cure: 'Antibiotikum (Doxycyclin) für eine Woche', cureDays: 3, cost: 0,
    info: 'Die häufigste bakterielle STI. Bei der Hälfte verläuft sie ohne Beschwerden, deshalb sind regelmäßige Tests wichtig. Gut heilbar mit Antibiotika. Bis zum Ende der Behandlung kein Sex, Partner*innen mitbehandeln.' },
  { id: 'tripper', name: 'Tripper (Gonorrhö)', icon: '💧', risk: .025, incub: 2, silent: .3, symptom: 'Brennen, Ausfluss, Halskratzen. Dein Körper meldet sich deutlich.',
    cure: 'Antibiotikum als Spritze (Ceftriaxon), einmalig', cureDays: 1, cost: 0,
    info: 'Wird auch beim Oralverkehr übertragen und sitzt oft im Hals oder Po, wo man nichts merkt. Behandlung mit einer Spritze. Weil Resistenzen zunehmen, gehört danach ein Kontrolltest dazu.' },
  { id: 'syphilis', name: 'Syphilis', icon: '🔴', risk: .008, incub: 4, silent: .2, symptom: 'Ein kleines, schmerzloses Geschwür, später vielleicht Ausschlag an Händen und Füßen.',
    cure: 'Penicillin als Spritze', cureDays: 2, cost: 0,
    info: 'Zeigt sich oft mit einem schmerzlosen Geschwür, das von selbst verschwindet – die Infektion bleibt aber. Unbehandelt kann sie Jahre später Organe schädigen. Mit Penicillin gut heilbar, ein Bluttest gibt Sicherheit.' },
];
/** HIV ist kein Spielstatus mit Heilung: Das Spiel zeigt den realistischen Weg PEP (innerhalb 72 Stunden) bzw. PrEP vorher */
export const HIV_RISK = .004;
export const PEP_DAYS = 3;

export interface StiState { [id: string]: { d: number; sym?: boolean; cure?: number } }
export function stiState(s: SaveData): StiState { try { return JSON.parse(String(s.flags.sti || '{}')) as StiState; } catch { return {}; } }
function setState(s: SaveData, st: StiState) { s.flags.sti = JSON.stringify(st); }

/** Würfel fürs Spiel (Tests können ihn ersetzen) */
export let roll = () => Math.random();
export function setRoll(f: () => number) { roll = f; }

/** Teststatus der anderen Person (fest je Person und Woche): steuert das Risiko, wird vorher in der Absprache genannt */
export interface PartnerStatus { id: 'frisch' | 'prep' | 'uu' | 'unklar'; label: string; f: number; hiv: number }
export const PARTNER_STATUS: PartnerStatus[] = [
  { id: 'frisch', label: 'vor ein paar Tagen negativ getestet', f: .25, hiv: .1 },
  { id: 'prep', label: 'auf PrEP, testet alle drei Monate', f: .6, hiv: 0 },
  { id: 'uu', label: 'HIV-positiv unter der Nachweisgrenze (U=U)', f: .7, hiv: 0 },
  { id: 'unklar', label: 'weiß den letzten Test nicht mehr genau', f: 1, hiv: 1 },
];
const h32 = (k: string) => { let h = 2166136261; for (let i = 0; i < k.length; i++) h = Math.imul(h ^ k.charCodeAt(i), 16777619); return h >>> 0; };
/** Status einer Person; mul > 1 = mehr wechselnde Kontakte (z. B. Darkroom), < 1 = feste Kontakte */
export function partnerStatus(key: string, day: number, mul = 1): PartnerStatus {
  const r = h32(key + ':test:' + Math.floor(day / 7)) % 100, w = mul > 1 ? [15, 40, 50] : [35, 65, 75];
  return PARTNER_STATUS[r < w[0] ? 0 : r < w[1] ? 1 : r < w[2] ? 2 : 3];
}
export interface ExposeOpts { /** Teststatus der Partner*innen (Gruppe: mehrere) */ partners?: Array<{ status?: PartnerStatus; mul?: number }> }

/** Folgen einer Begegnung: mit Kondom kein Risiko (Spiel), ohne Kondom ein kleiner Würfel je STI und Person.
    Ohne Angaben gilt eine Person mit unklarem Status. PrEP oder eigene U=U schützen vor HIV, nicht vor Bakterien. */
export function exposure(s: SaveData, bare: boolean, o: ExposeOpts = {}) {
  if (!bare || !s.settings.adult) return { caught: [] as string[], hiv: false };
  const st = stiState(s), caught: string[] = [], ps = o.partners?.length ? o.partners : [{}];
  let hivP = 0;
  for (const p of ps) {
    const f = (p.status?.f ?? 1) * (p.mul ?? 1);
    for (const d of STIS) if (!st[d.id] && roll() < d.risk * f) { st[d.id] = { d: s.day }; caught.push(d.id); }
    hivP = Math.max(hivP, HIV_RISK * (p.status?.hiv ?? 1) * (p.mul ?? 1));
  }
  setState(s, st);
  s.flags.bare = s.day; s.flags.bareN = (Number(s.flags.bareN) || 0) + 1;
  const hiv = !s.health.prep && hivP > 0 && roll() < hivP;
  if (!s.health.prep && hivP > 0) s.flags.pepBy = s.day + PEP_DAYS;   // PEP-Fenster: innerhalb von 72 Stunden in den Checkpoint
  if (hiv) s.flags.hivRisk = s.day;
  return { caught, hiv };
}
/** Täglich prüfen: neue Symptome melden, Behandlungen abschließen. Gibt Meldungen zurück und Wirkung auf die Laune. */
export function stiTick(s: SaveData) {
  const st = stiState(s), news: string[] = [], healed: string[] = [];
  for (const d of STIS) {
    const x = st[d.id]; if (!x) continue;
    if (x.cure !== undefined) { if (s.day >= x.cure) { delete st[d.id]; healed.push(d.name); } continue; }
    // ob jemand Symptome bekommt, entscheidet eine feste Zahl je Ansteckung
    if (!x.sym && s.day - x.d >= d.incub && ((x.d * 31 + d.id.length * 7) % 100) / 100 >= d.silent) { x.sym = true; news.push(`${d.icon} ${d.symptom}`); }
  }
  setState(s, st);
  return { news, healed };
}
/** Aktive Infektionen mit Symptomen (für Anzeige und Laune) */
export function symptoms(s: SaveData) { const st = stiState(s); return STIS.filter((d) => st[d.id]?.sym && st[d.id].cure === undefined); }
/** Test im Checkpoint: findet alle Infektionen (auch ohne Symptome), startet die Behandlung */
export function testAndTreat(s: SaveData) {
  const st = stiState(s), found = STIS.filter((d) => st[d.id] && st[d.id].cure === undefined);
  for (const d of found) st[d.id].cure = s.day + d.cureDays;
  setState(s, st);
  const pep = !s.health.prep && Number(s.flags.pepBy) >= s.day && Number(s.flags.bare) > Number(s.flags.pepDone || 0);
  if (pep) { s.flags.pepDone = s.day; delete s.flags.hivRisk; }
  // PEP verpasst und angesteckt: Diagnose, Therapie beginnt sofort, nach ein paar Tagen unter der Nachweisgrenze (U=U)
  const hivNew = !pep && !!s.flags.hivRisk && !s.flags.hiv;
  if (hivNew) { s.flags.hiv = s.day; delete s.flags.hivRisk; }
  return { found, pep, hivNew };
}
/** HIV-Therapie: ab 5 Tagen nach Start unter der Nachweisgrenze – dann nicht mehr übertragbar (U=U) */
export const hivUU = (s: SaveData) => !!s.flags.hiv && s.day - Number(s.flags.hiv) >= 5;

/** Läuft gerade eine Behandlung? (Bis zum Ende besser kein Sex – das Spiel erinnert daran) */
export function inTreatment(s: SaveData) { const st = stiState(s); return STIS.filter((d) => st[d.id]?.cure !== undefined); }
/** Hat die Person aktuell eine unbehandelte Infektion (für den Hinweis vor dem nächsten Mal)? */
export function untreated(s: SaveData) { const st = stiState(s); return STIS.filter((d) => st[d.id] && st[d.id].cure === undefined); }

/** Infos für Checkpoint und Wissen-App */
export const STI_INFO: Array<[string, string]> = [
  ['Ungeschützt in Absprache', 'Sex ohne Kondom ist eine Entscheidung, die alle Beteiligten vorher gemeinsam treffen. Mit PrEP oder bei U=U ist HIV kein Thema, andere STI aber schon – deshalb: regelmäßig testen.'],
  ...STIS.map((d) => [d.name, d.info] as [string, string]),
  ['PEP', `Nach einem HIV-Risiko ohne PrEP: so schnell wie möglich, spätestens nach 72 Stunden, in die Notaufnahme oder HIV-Schwerpunktpraxis. Die Tabletten werden vier Wochen genommen. Im Spiel: innerhalb von ${PEP_DAYS} Tagen in den Checkpoint.`],
  ['Wie oft testen?', 'Wer wechselnde Partner*innen hat, testet alle drei Monate auf HIV, Syphilis, Tripper und Chlamydien – bei PrEP gehört das ohnehin dazu. Viele Checkpoints testen anonym und günstig.'],
  ['Doxy-PEP', 'Neu: Eine Tablette Doxycyclin innerhalb von 72 Stunden nach ungeschütztem Sex kann Syphilis und Chlamydien deutlich seltener machen. Sie ist in Deutschland bisher nur nach ärztlicher Beratung für Menschen mit hohem Risiko gedacht.'],
];
