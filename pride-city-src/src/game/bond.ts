/* Beziehungen vertiefen: Nähe zu deinen Rainbow-Matches wächst über gemeinsame Unternehmungen, Geschenke, Nachrichten
   und Zeit zu zweit in der Stadt. Wer sich nicht meldet, entfernt sich. Ihr sprecht ab, ob ihr exklusiv oder offen lebt.
   Alles Erwachsene, alles mit Zustimmung; es gibt hier nichts Explizites. Stand im Spielstand unter flags (bd_…). */
import type { SaveData } from '../engine/Save';
import { PROFILES, dateRec, post, type Profile } from './social';
import { change } from './life';

export const LEVELS: Array<[number, string, string]> = [
  [0, 'Kennenlernen', '🤍'], [20, 'Vertraut', '💛'], [45, 'Eng', '🧡'], [70, 'Unzertrennlich', '❤️'], [90, 'Seelenverwandt', '💖'],
];
const k = (id: string, f: string) => `bd_${id}_${f}`;
export const closeness = (s: SaveData, id: string) => Math.max(0, Math.min(100, Number(s.flags['bd_' + id]) || 0));
export const levelOf = (v: number) => { let i = 0; LEVELS.forEach(([min], n) => { if (v >= min) i = n; }); return i; };
export const levelName = (s: SaveData, id: string) => { const l = LEVELS[levelOf(closeness(s, id))]; return `${l[2]} ${l[1]}`; };
/** Was eine neue Stufe bringt */
const MILESTONE = ['', 'Ihr habt jetzt Spitznamen füreinander.', 'schenkt dir ein Mixtape mit euren Liedern. Spaß +15', 'gibt dir einen Schlüssel: „Komm, wann du willst.“ Ruf +2', 'sagt: „Mit dir ist überall Zuhause.“ Ruf +3'];
/** Nähe ändern; liefert eine Meldung, wenn eine neue Stufe erreicht ist */
export function addCloseness(s: SaveData, id: string, d: number): string | null {
  const before = closeness(s, id), after = Math.max(0, Math.min(100, before + d));
  s.flags['bd_' + id] = after;
  const a = levelOf(before), b = levelOf(after), top = Number(s.flags[k(id, 'top')]) || 0;
  if (b <= a || b <= top) return null;
  s.flags[k(id, 'top')] = b;
  if (b === 2) change(s, { fun: 15 });
  if (b === 3) s.rep += 2;
  if (b === 4) s.rep += 3;
  const p = PROFILES.find((x) => x.id === id);
  return `${LEVELS[b][2]} ${p?.name || ''}: ${LEVELS[b][1]}. ${b === 1 ? MILESTONE[1] : `${p?.name || ''} ${MILESTONE[b]}`}`;
}
/** Kontakt gehabt (Date, Unternehmung, Nachricht, Geschenk) */
const touch = (s: SaveData, id: string) => { s.flags[k(id, 'seen')] = s.day; };

/* ---------- Geschenke ---------- */
export interface Gift { id: string; icon: string; name: string; price: number }
export const GIFTS: Gift[] = [
  { id: 'blumen', icon: '💐', name: 'Blumenstrauß', price: 8 }, { id: 'schoko', icon: '🍫', name: 'Pralinen', price: 6 },
  { id: 'vinyl', icon: '💿', name: 'Schallplatte', price: 20 }, { id: 'pflanze', icon: '🪴', name: 'Zimmerpflanze', price: 15 },
  { id: 'buch', icon: '📚', name: 'Buch aus den Bunten Seiten', price: 12 }, { id: 'karten', icon: '🎟️', name: 'Karten fürs Kaleidoskop', price: 40 },
  { id: 'kochbuch', icon: '🍳', name: 'Kochbuch', price: 18 }, { id: 'laufschuhe', icon: '👟', name: 'Laufsocken mit Regenbogen', price: 10 },
];
/** Was wer besonders mag (passt zu den Profilen in social.ts) */
export const LOVES: Record<string, string[]> = {
  kai: ['kochbuch', 'vinyl'], luca: ['vinyl', 'karten'], malik: ['buch', 'schoko'], robin: ['pflanze', 'buch'], ella: ['pflanze', 'karten', 'blumen'], jonas: ['kochbuch', 'laufschuhe', 'vinyl'],
  sami: ['kochbuch', 'buch'], noa: ['karten', 'vinyl'], henri: ['pflanze', 'buch', 'blumen'], aylin: ['schoko', 'karten'], ash: ['pflanze', 'schoko'], mateo: ['kochbuch', 'karten'],
};
export function giveGift(s: SaveData, p: Profile, g: Gift): { why?: string; text?: string; up?: string | null } {
  if (s.flags[k(p.id, 'gift')] === s.day) return { why: `${p.name} hat heute schon etwas von dir bekommen.` };
  if (s.money < g.price) return { why: `Dafür fehlen dir ${g.price - s.money} €.` };
  s.money -= g.price; s.flags[k(p.id, 'gift')] = s.day; touch(s, p.id);
  const love = (LOVES[p.id] || []).includes(g.id), same = s.flags[k(p.id, 'lastGift')] === g.id;
  s.flags[k(p.id, 'lastGift')] = g.id;
  const d = same ? 2 : love ? 12 : 5;
  return { text: same ? `„Oh, noch ${g.icon}. Danke!“ ${p.name} lächelt höflich.` : love ? `„${g.name}! Woher wusstest du das?“ ${p.name} strahlt.` : `„Wie lieb von dir!“ ${p.name} freut sich über ${g.icon}.`, up: addCloseness(s, p.id, d) };
}

/* ---------- Unternehmungen ---------- */
export interface Outing { id: string; icon: string; name: string; text: string; cost: number; min: number; bond: number; need: Parameters<typeof change>[1]; /** ab Date-Stufe */ st: number; /** nur abends und nachts */ evening?: boolean; /** eigener Wagen nötig */ car?: boolean }
export const OUTINGS: Outing[] = [
  { id: 'park', icon: '🌳', name: 'Spaziergang im Regenbogenpark', text: 'Ihr dreht drei Runden und merkt es nicht, weil ihr nur redet.', cost: 0, min: 60, bond: 5, need: { social: 16, fun: 8 }, st: 0 },
  { id: 'pizza', icon: '🍕', name: 'Essen bei Pizza Nonna', text: 'Eine Pizza, zwei Gabeln, und die Nonna zwinkert euch zu.', cost: 18, min: 75, bond: 7, need: { hunger: 50, social: 14, fun: 8 }, st: 0 },
  { id: 'kino', icon: '🎬', name: 'Spätvorstellung im Kino Astra', text: 'In der letzten Reihe. Vom Film wisst ihr danach wenig.', cost: 28, min: 130, bond: 8, need: { fun: 24, social: 12 }, st: 1 },
  { id: 'strand', icon: '🌅', name: 'Sonnenuntergang am Strand', text: 'Schuhe aus, Füße im Wasser, die Stadt wird hinter euch golden.', cost: 0, min: 90, bond: 8, need: { fun: 16, social: 16, energy: 6 }, st: 1, evening: true },
  { id: 'fahrt', icon: '🚗', name: 'Spritztour mit Radio', text: 'Fenster runter, euer Lied auf RicoReWi Radio, einmal über die Regenbogenbrücke und zurück.', cost: 0, min: 60, bond: 9, need: { fun: 20, social: 12 }, st: 1, car: true },
  { id: 'kochen', icon: '🍳', name: 'Zusammen kochen', text: 'Zu viel Knoblauch, zu wenig Töpfe, genau richtig.', cost: 10, min: 90, bond: 9, need: { hunger: 60, social: 18, fun: 10 }, st: 2 },
  { id: 'skybar', icon: '🌃', name: 'Skybar Wolke 7', text: 'Zwei Cocktails über den Dächern. Unter euch funkelt alles.', cost: 26, min: 90, bond: 10, need: { fun: 22, social: 16 }, st: 2, evening: true },
  { id: 'ball', icon: '💃', name: 'Ball im Kaleidoskop', text: 'Ihr lauft zusammen in der Kategorie „Paar des Abends“. Mama Vega gibt zehn Punkte.', cost: 30, min: 150, bond: 12, need: { fun: 30, social: 20, energy: -12 }, st: 2, evening: true },
  { id: 'hotel', icon: '🏨', name: 'Wochenende im Grand Hotel Aurora', text: 'Frühstück ans Bett, Spa, kein Handy. Zwei Tage wie zwei Wochen Urlaub.', cost: 180, min: 600, bond: 20, need: { energy: 100, hygiene: 100, fun: 40, social: 40 }, st: 3 },
];
export function outingWhy(s: SaveData, id: string, o: Outing, evening: boolean, hasCar: boolean): string | null {
  if (dateRec(s, id).st < o.st) return `ab „${['Match', 'Erstes Date', 'Verliebt', 'Zusammen'][o.st]}“`;
  if (s.flags[k(id, 'out')] === s.day) return 'Heute habt ihr schon etwas unternommen.';
  if (o.evening && !evening) return 'erst ab 18 Uhr';
  if (o.car && !hasCar) return 'dafür brauchst du einen eigenen Wagen (Garage)';
  if (s.money < o.cost) return `dir fehlen ${o.cost - s.money} €`;
  return null;
}
export function doOuting(s: SaveData, id: string, o: Outing) {
  s.money -= o.cost; s.flags[k(id, 'out')] = s.day; touch(s, id); change(s, o.need);
  s.flags.outings = (Number(s.flags.outings) || 0) + 1;
  return addCloseness(s, id, o.bond);
}

/* ---------- Nachrichten ---------- */
export interface Chat { text: string; replies: Array<[string, number, string]> }
export const CHATS: Chat[] = [
  { text: 'Guten Morgen! Ich hab von dir geträumt. Du hattest einen Hut auf. Einen sehr großen.', replies: [['Erzähl mir alles. Welche Farbe?', 3, 'Regenbogen natürlich. Du sahst fantastisch aus. 😄'], ['Haha, okay.', 1, 'Mehr kriegst du nicht aus mir raus! 😜'], ['Hab gerade keine Zeit.', -2, 'Oh. Okay. Bis später.']] },
  { text: 'Schwieriger Tag heute. Kann ich dir kurz was erzählen?', replies: [['Klar, ich höre zu. Was ist los?', 4, 'Danke. Allein, dass du fragst, hilft schon. 💜'], ['Kopf hoch, wird schon!', 1, 'Ja … wird schon. Danke.'], ['Später vielleicht.', -3, 'Verstehe.']] },
  { text: 'Ich stehe im Späti und kann mich nicht entscheiden. Chips oder Schokolade?', replies: [['Beides. Wir teilen heute Abend.', 3, 'DAS ist die richtige Antwort. 🥰'], ['Schokolade!', 2, 'Gute Wahl. Ich heb dir ein Stück auf.'], ['Mir egal.', -1, 'Romantik pur. 🙄']] },
  { text: 'Meine Mutter fragt, ob du am Sonntag zum Essen kommst. Kein Druck!', replies: [['Sehr gern. Was soll ich mitbringen?', 4, 'Sie fällt gleich in Ohnmacht vor Freude. Nachtisch! 🍰'], ['Puh, ein bisschen früh, oder? Aber danke!', 1, 'Total okay. Ich sag, wir brauchen noch Zeit. 💛'], ['Auf keinen Fall.', -3, 'Okay. Deutlicher ging es nicht.']] },
  { text: 'Hab eben unser Lied im Radio gehört und musste mitten auf der Straße grinsen.', replies: [['Ich dreh es gerade auch auf. Tanz mit!', 3, 'Die Leute gucken schon. Mir egal! 💃'], ['Süß. ❤️', 2, '❤️'], ['Welches Lied?', -2, 'Im Ernst jetzt?']] },
  { text: 'Kurze Frage: Wie stehst du eigentlich zu Kuscheln beim Film, bis einem der Arm einschläft?', replies: [['Dafür sind Arme da.', 3, 'Ich wusste, wir passen zusammen.'], ['Nur mit Snackpause.', 2, 'Verhandelbar. 🍿'], ['Ich brauche meinen Platz.', 0, 'Auch gut. Zwei Decken, ein Sofa.']] },
  { text: 'Ich war heute beim Test im Checkpoint. Alles gut. Wollte nur, dass du es weißt.', replies: [['Danke, dass du das teilst. Ich gehe diese Woche auch.', 4, 'Genau deshalb mag ich dich so. 🩺💜'], ['Super!', 2, '😊'], ['Warum erzählst du mir das?', -2, 'Weil mir das wichtig ist. Dachte, dir auch.']] },
  { text: 'Wenn wir morgen alles stehen und liegen lassen könnten: Wohin fahren wir?', replies: [['Ans Meer. Mit dir im Bulli.', 3, 'Ich packe schon mal die Badehose ein. 🚐'], ['Nirgendwohin. Hier ist es schön mit dir.', 3, 'Okay, jetzt hast du mich. 🥹'], ['Weiß nicht.', 0, 'Dann überlege ich für uns beide.']] },
];
export const chatOf = (s: SaveData, id: string) => CHATS[(s.day * 3 + id.length * 5 + id.charCodeAt(0)) % CHATS.length];
export const chatOpen = (s: SaveData, id: string) => dateRec(s, id).st >= 1 && s.flags[k(id, 'chat')] !== s.day;
export function replyChat(s: SaveData, id: string, i: number) {
  const c = chatOf(s, id), r = c.replies[i];
  s.flags[k(id, 'chat')] = s.day; touch(s, id);
  if (r[1] > 0) change(s, { social: 6 });
  return { answer: r[2], up: addCloseness(s, id, r[1]) };
}

/* ---------- Zeit zu zweit in der Stadt (Begleitung) ---------- */
/** Nähe durch gemeinsame Zeit: höchstens 8 Punkte am Tag */
export function together(s: SaveData, id: string): string | null {
  const key = k(id, 'walk'), dayKey = k(id, 'walkDay');
  if (s.flags[dayKey] !== s.day) { s.flags[dayKey] = s.day; s.flags[key] = 0; }
  const n = Number(s.flags[key]) || 0; if (n >= 8) return null;
  s.flags[key] = n + 1; touch(s, id);
  return addCloseness(s, id, 1);
}

/* ---------- Absprache und Pflege ---------- */
export type Model = '' | 'mono' | 'offen';
export const model = (s: SaveData) => (s.flags.relModel === 'mono' || s.flags.relModel === 'offen' ? s.flags.relModel : '') as Model;
/** feste Partner*innen (Stufe „Zusammen“) */
export const partners = (s: SaveData) => PROFILES.filter((p) => s.dates[p.id] && dateRec(s, p.id).st >= 3);
/** Eifersucht: Wer exklusiv lebt und sich mit jemand anderem verliebt, verletzt die Absprache */
export function jealousy(s: SaveData, other: string): string | null {
  if (model(s) !== 'mono' || dateRec(s, other).st < 2) return null;
  const hurt = partners(s).filter((p) => p.id !== other); if (!hurt.length) return null;
  for (const p of hurt) s.flags['bd_' + p.id] = Math.max(0, closeness(s, p.id) - 15);
  post(s, hurt[0].name, 'Wir hatten doch etwas ausgemacht. Können wir reden?');
  return `${hurt[0].name} hat davon gehört und ist verletzt. Ihr hattet Exklusivität ausgemacht. Nähe −15`;
}
/** Neuer Tag: Wer sich länger als vier Tage nicht meldet, verliert Nähe. Liefert Meldungen. */
export function bondTick(s: SaveData): string[] {
  if (s.flags.bdDay === s.day) return [];
  const first = s.flags.bdDay === undefined; s.flags.bdDay = s.day;
  if (first) return [];
  const out: string[] = [];
  for (const p of PROFILES) {
    if (!s.dates[p.id]) continue;
    const r = dateRec(s, p.id); if (r.st < 2) continue;
    const seen = Math.max(r.last, Number(s.flags[k(p.id, 'seen')]) || 0), away = s.day - seen;
    if (away > 4 && closeness(s, p.id) > 10) {
      s.flags['bd_' + p.id] = Math.max(10, closeness(s, p.id) - 3);
      if (away === 5 || away % 4 === 0) { post(s, p.name, 'Ich vermisse dich. Meldest du dich mal? 💌'); out.push(`💌 ${p.name} vermisst dich. Schreib zurück oder unternehmt etwas.`); }
    }
  }
  return out;
}

/* ---------- Folgen eines Dates (Rainbow Match) ---------- */
/** Was nach einem Date passiert: Gerede im Feed, offiziell zusammen, ehrliche Absage. Liefert eine Meldung für das HUD. */
export function dateFolge(s: SaveData, id: string, pts: number, up: boolean): { title: string; text: string; good: boolean } | null {
  const p = PROFILES.find((x) => x.id === id); if (!p) return null;
  const st = dateRec(s, id).st;
  if (!up && pts <= 1) {
    // ehrlich statt Ghosting: Absage per Nachricht, Match bleibt als Kontakt
    post(s, p.name, 'Ich glaube, zwischen uns passt es nicht. Danke für den Abend und alles Gute! 🌈');
    return { title: `💬 ${p.name} schreibt ehrlich ab`, text: 'Kein Ghosting: Eine kurze, freundliche Absage ist fairer als Schweigen. Das gilt auch für dich.', good: false };
  }
  if (!up) return null;
  if (st === 1) { post(s, 'Mo', `Hab dich mit ${p.name} gesehen. 👀 Ich sag nix! (Ich sag es allen.)`); return { title: '👀 Die Stadt redet', text: `Mo hat euch gesehen. Im Feed wird schon über dich und ${p.name} getuschelt.`, good: true }; }
  if (st === 2) { touch(s, id); return { title: `💌 ${p.name} denkt an dich`, text: `${p.name} schickt dir ab jetzt jeden Tag Nachrichten. Antworten bringt Nähe.`, good: true }; }
  if (st === 3) {
    if (!s.flags['bd_' + id + '_official']) { s.flags['bd_' + id + '_official'] = s.day; s.rep += 1; }
    post(s, p.name, 'Offiziell: Wir sind zusammen. 💞'); 
    return { title: `💞 ${p.name} und du: offiziell zusammen`, text: 'Ihr könnt jetzt zusammenziehen (Handy, Familie) oder euch mit einem Ring verloben.', good: true };
  }
  return null;
}
