/* Rainbow News: kurze Nachrichten im Autoradio. Alle paar Minuten Fahrt mit eingeschaltetem Radio meldet sich die
   Nachrichtenstimme zwischen den Songs (Radio wird leiser) und erzählt, was in der Stadt los ist: deine viralen Clips,
   Fahndungen, Drag-Krone, Wetter, Parade. Reine Textlogik hier, Ton und Anzeige in CityScene. */
import type { SaveData } from '../engine/Save';
import { followers } from './gram';

export interface NewsCtx { hour: number; sky: string; stars: number; parade: boolean; name: string }
const pick = <T>(a: T[], r: number) => a[Math.floor(r * a.length) % a.length];

/** Mögliche Meldungen, die wichtigsten zuerst (Meldungen über dich nur einmal je Anlass) */
export function headlines(s: SaveData, c: NewsCtx): Array<{ key: string; text: string }> {
  const out: Array<{ key: string; text: string }> = [], who = c.name || 'eine Person aus der Szene';
  if (s.flags.viralLast && Number(s.flags.viralDayLast) >= s.day - 1)
    out.push({ key: 'viral:' + s.flags.viralLast + s.flags.viralViews, text: `Das Video des Tages: „${String(s.flags.viralLast).replace(/[^\p{L}\p{N} ?!.,'-]/gu, '').trim()}“ mit ${Number(s.flags.viralViews).toLocaleString('de-DE')} Aufrufen. Zu sehen ist ${who}. Rainbow City kann nicht genug davon bekommen.` });
  if (c.stars > 0) out.push({ key: 'wanted:' + s.day + ':' + c.stars, text: `Die Polizei sucht gerade nach ${who}. Zeugen sprechen von viel Glitzer und wenig Geduld. Bleiben Sie gelassen.` });
  if (s.flags.dragKrone) out.push({ key: 'krone', text: `Die Krone von Rainbow City bleibt in festen Händen: ${who} hat alle fünf Queens im Lip-Sync geschlagen.` });
  if (c.parade) out.push({ key: 'parade:' + s.day, text: 'Heute ist CSD! Der Umzug zieht über die Hauptstraße. Bitte weiträumig umfahren oder einfach mitlaufen.' });
  const fol = followers(s);
  if (fol >= 1000) out.push({ key: 'fol:' + Math.floor(fol / 1000), text: `Glitzergram-Ranking: ${who} hat jetzt über ${Math.floor(fol / 1000) * 1000} Follower. Influencer-Alarm in der Innenstadt.` });
  return out;
}
const FILLER = [
  'Am Hafen öffnet heute Abend die Strandbar länger. Der Sonnenuntergang ist inklusive.',
  'Der Checkpoint erinnert: anonyme Tests gibt es ohne Termin. Passt auf euch auf.',
  'Stau auf der Regenbogenbrücke. Grund: ein Pärchen macht ein Selfie. Wieder mal.',
  'Die Bar Komet sucht neue Talente für die Karaoke-Nacht. Mut zählt mehr als Töne.',
  'Im Park wurde ein Hund namens Krümel beim Klauen einer Brezel gesichtet. Er ist unschuldig, sagt er.',
  'Die Stadt verlängert die Nachtbusse der Linie 69. Feiern bis zum Morgen bleibt also erlaubt.',
];
const WX: Record<string, string> = {
  klar: 'Das Wetter: Sonne pur über Rainbow City. Sonnencreme nicht vergessen.',
  wolkig: 'Das Wetter: wolkig, aber trocken. Perfekt für einen Bummel.',
  regen: 'Das Wetter: Regen. Die Straßen sind glatt, fahren Sie vorsichtig.',
  gewitter: 'Das Wetter: Gewitter. Bitte nicht unter Palmen Schutz suchen.',
  nebel: 'Das Wetter: dichter Nebel am Hafen. Licht an und langsam.',
  schnee: 'Das Wetter: Schnee! Rainbow City sieht aus wie ein Glitzer-Schneekugel.',
};

/** Nächste Sendung: höchstens eine neue Meldung über dich, sonst Stadtgeschehen, dazu das Wetter */
export function bulletin(s: SaveData, c: NewsCtx, r = Math.random()): string[] {
  const seen = String(s.flags.newsSeen || '').split('|');
  const fresh = headlines(s, c).find((h) => !seen.includes(h.key));
  if (fresh) s.flags.newsSeen = [fresh.key, ...seen].slice(0, 12).join('|');
  const h = c.hour, hello = h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';
  return [`${hello}, Rainbow City, hier sind die Rainbow News.`, fresh ? fresh.text : pick(FILLER, r), WX[c.sky] || WX.klar];
}
