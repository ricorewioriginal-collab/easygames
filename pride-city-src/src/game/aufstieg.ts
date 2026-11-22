/* „Aufstieg“: Glitzergram, Muckibude und Immobilien als Nebenstränge der Geschichte. Kurze Anrufe, sobald etwas
   Neues erreicht ist: Influencerin Zoe Funkel bringt dich auf Glitzergram, Coach Mehmet in Form, Reporterin Sanne
   Kowalski vom Rainbow-Kurier führt das Mogul-Ranking. Nach Akt IV wird Viktor Krals Hotel Kranhaus versteigert.
   Läuft aus storyTick, nur wenn sonst niemand anruft. Alle Figuren sind erfunden. */
import type { SaveData } from '../engine/Save';
import type { Line } from '../ui/ui';
import type { StoryCtx } from './story';
import { followers } from './gram';
import { muskel } from './figur';
import { owned, owns } from './empire';
import { myRank } from './mogul';
import { post } from './social';

const call = (who: string, color: string, text: string[]): Line[] => text.map((t) => ({ who: `📞 ${who}`, color, text: t }));
const ZOE = '#ff6ad5', MEHMET = '#ffd23b', SANNE = '#7fd4ff', TOM = '#ff7a1a';

interface Beat { id: string; when: (s: SaveData) => boolean; lines: (s: SaveData) => Line[]; done?: (c: StoryCtx) => void }
export const BEATS: Beat[] = [
  { id: 'gramCall', when: (s) => s.chapter >= 2 || s.day >= 3,
    lines: (s) => call('Zoe Funkel', ZOE, [
      `${s.name || 'Hey'}! Zoe hier, Zoe Funkel. Achtzigtausend Leute folgen mir auf Glitzergram, und alle reden über die neue Person in der Stadt. Über dich!`,
      'Mach ein Profil. Handy auf, Glitzergram, Fotomodus. Drohne oder Selfie, Filter drauf, posten. Goldene Stunde, Neon in der Nacht, Leute im Bild: Das lieben die Leute.',
      'Ab ein paar hundert Followern melden sich die Läden für Kooperationen. Ich schick dir meine Tipps. Und jetzt: Zeig mir deine Stadt! 📸']),
    done: (c) => post(c.s, 'Zoe Funkel', 'Neue Lieblingsperson in Rainbow City entdeckt. Folgt ihr, bevor alle es tun! ✨') },
  { id: 'gram1k', when: (s) => followers(s) >= 1000,
    lines: () => call('Zoe Funkel', ZOE, [
      'Tausend Follower! Weißt du, wie lange ich dafür gebraucht habe? Sag es niemandem.',
      'Ab jetzt zahlt dir Glitzergram etwas pro Like, der Creator-Fonds. Nicht viel, aber genug für Glitzer. Und die großen Marken schauen jetzt auch hin.']),
    done: (c) => c.reward(100, 3, '1.000 Follower auf Glitzergram') },
  { id: 'gram10k', when: (s) => followers(s) >= 10000,
    lines: (s) => call('Zoe Funkel', ZOE, [
      `${s.name}, zehntausend! Du bist offiziell eingeladen: Glitzergram-Gala im Grand Hotel Aurora, roter Teppich, Blitzlicht, alle da.`,
      'Und weißt du was? Ich hab dich nicht entdeckt. Du warst schon da. Ich hab nur laut gesagt, was alle sehen. 💖']),
    done: (c) => { c.reward(500, 10, 'Star von Glitzergram'); post(c.s, 'Glitzergram', `Gala-Gast des Abends: @${(c.s.name || 'du').toLowerCase()} mit über 10.000 Followern. 🌟`); } },
  { id: 'fitCall', when: (s) => s.chapter >= 2 && (Number(s.flags.workouts) > 0 || s.day >= 5),
    lines: () => call('Coach Mehmet', MEHMET, [
      'Mehmet hier, Muckibude Muskelkater. Ich hab gehört, du willst die Stadt erobern. Dann fang mit dem Rücken an. Gerade halten, Krone richten.',
      'Krafttraining an der Hantelbank, Beinetag bei mir, zwei Einheiten am Tag zählen. Man sieht es dir an, versprochen. Und wer drei Tage faul ist, baut langsam wieder ab.',
      'Ach, und hinten in der Boutique sticht Ink-Ines Tattoos. Nur so. Falls du was zum Zeigen brauchst. 💪']) },
  { id: 'fit60', when: (s) => muskel(s) >= 60,
    lines: (s) => call('Coach Mehmet', MEHMET, [
      `${s.name}, ich hab dein Foto an der Spiegelwand gesehen. Das ist nicht mehr dieselbe Person, die vor ein paar Wochen reinkam. Respekt.`,
      'Ich werde älter, die Muckibude braucht neue Besitzer*innen. Wenn du willst: Für dich gibt es ein Drittel Nachlass. Schau im Imperium nach.']),
    done: (c) => { c.s.flags.deal_gym = Math.max(Number(c.s.flags.deal_gym) || 0, 33); c.toast('🏋️ Muckibude Muskelkater: 33 % Nachlass im Imperium'); } },
  { id: 'mogulCall', when: (s) => owned(s).length >= 1,
    lines: (s) => call('Sanne Kowalski, Rainbow-Kurier', SANNE, [
      `Sanne Kowalski vom Rainbow-Kurier. ${s.name}, Sie haben gerade Ihr erstes Geschäft übernommen? Dann stehen Sie ab heute in unserem Mogul-Ranking.`,
      'Ganz oben: Glanz Immobilien und Viktor Krals Holding. Leute, die Häuser kaufen, wo es bunt ist, und sie grau machen. Es wäre schön, wenn mal jemand anderes oben steht.',
      'Läden, Bars, Kinos, Hotels: Alles zählt. Das Ranking finden Sie im Handy unter Imperium.']) },
  { id: 'mogul3', when: (s) => owned(s).length >= 1 && myRank(s) <= 3,
    lines: (s) => call('Sanne Kowalski, Rainbow-Kurier', SANNE, [
      `Platz ${myRank(s)} im Mogul-Ranking! Unsere Leserbriefe sind voll. Alle wollen wissen, wer die Person ist, die Hildes Genossenschaft unterstützt und trotzdem wächst.`]),
    done: (c) => { c.reward(0, 5, 'Unter den Top 3 des Mogul-Rankings'); post(c.s, 'Rainbow-Kurier', `Mogul-Ranking: ${c.s.name} steigt in die Top 3 auf. 📈`); } },
  { id: 'mogul1', when: (s) => owned(s).length >= 1 && myRank(s) === 1,
    lines: (s) => call('Sanne Kowalski, Rainbow-Kurier', SANNE, [
      `${s.name}, Sie sind die Nummer eins. Titelseite morgen früh: „Die Stadt gehört wieder allen.“`,
      'Hilde hat in der Redaktion angerufen und gefragt, ob wir das Foto groß genug drucken. Wir drucken es sehr groß.']),
    done: (c) => { c.reward(300, 10, 'Mogul*in von Rainbow City'); post(c.s, 'Rainbow-Kurier', `TITELSEITE: ${c.s.name} ist die Nummer eins des Mogul-Rankings. „Die Stadt gehört wieder allen.“ 🏳️‍🌈`); } },
  { id: 'kranCall', when: (s) => !!s.flags.flutEnd,
    lines: () => call('Tom Wierzbicki', TOM, [
      'Tom hier. Krals Vermögen wird versteigert. Der Monolith wird Jugendzentrum, das ist durch. Aber da ist noch sein Hotel Kranhaus auf Rostwerk.',
      'Glanz Immobilien bietet mit. Wenn die es kriegen, wird aus dem Kran ein Luxusklotz für Leute wie Kral. Kauf du es. Das Gericht gibt dir ein Viertel Nachlass, weil du den Fall aufgeklärt hast.']),
    done: (c) => { c.s.flags.deal_kranhaus = Math.max(Number(c.s.flags.deal_kranhaus) || 0, 25); c.toast('🏗️ Hotel Kranhaus: 25 % Nachlass im Imperium (Hotels)'); } },
  { id: 'kranDone', when: (s) => owns(s, 'kranhaus'),
    lines: (s) => call('Tom Wierzbicki', TOM, [
      `Hast du schon hochgeschaut? Die Kids aus dem Monolith haben eine Regenbogenfahne an den Kranarm gehängt, zwölf Meter lang. Für dich, ${s.name}.`,
      'Wo Kral Grau wollte, ist jetzt ein Hotel für alle. Hein meint, er kocht da sonntags Fischsuppe für die Gäste. Ob die Gäste wollen oder nicht.']),
    done: (c) => c.reward(0, 6, 'Hotel Kranhaus für alle') },
];

let calm = 0;
/** einmal je storyTick (zweimal je Sekunde), nur wenn sonst niemand angerufen hat */
export function aufTick(c: StoryCtx) {
  const s = c.s, f = s.flags;
  if (f.flutRun || f.sagaRun || f.nachtRun) { calm = 0; return; }
  if (++calm < 24) return;
  const b = BEATS.find((x) => !f[x.id] && x.when(s)); if (!b) return;
  calm = 0; f[b.id] = s.day;
  c.phone(b.lines(s), () => b.done?.(c));
}
export const aufHush = () => { calm = 0; };
