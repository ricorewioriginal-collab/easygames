/* Roter Faden: verbindet Akt I (Rainbow City, Kapitel 1–5), Akt II (Hochstadt, saga.ts) und Akt III (die Inselkette, worlds.ts)
   zu einer Geschichte. Anrufe leiten von Akt zu Akt und von Insel zu Insel, das Finale „Pride der Inseln“ schließt alles ab.
   Nur Verbindung und Führung: Die Aufgaben selbst bleiben in story.ts, saga.ts und Isle.ts. */
import type { SaveData } from '../engine/Save';
import type { Line } from '../ui/ui';
import type { Goal, StoryCtx } from './story';
import { sagaDone, MISSIONS } from './saga';
import { WORLDS, worldStage } from './worlds';
import { nachtOver, nachtFirst, nachtDone } from './nacht';

export const ACTS = [
  { n: 1, title: 'Ein Leben in allen Farben', text: 'Ankommen in Rainbow City, das Regenbogenhaus retten und die größte Pride feiern.' },
  { n: 2, title: 'Die Lichter der Hochstadt', text: 'Das Revuetheater Kaleidoskop soll einem Glasturm weichen. Das Haus Vega braucht dich.' },
  { n: 3, title: 'Die Inseln der Farben', text: 'Fünf Inseln vor der Küste wollen ihre eigene Pride. Hilf allen, dann feiert ihr gemeinsam.' },
];

/** Reihenfolge der Inselkette entlang der Brücken (Lustwäldchen nur mit 18+) */
const CHAIN = ['einhorn', 'canaria', 'lindenhof', 'rummel', 'cruising'];
export const chain = (s: SaveData) => CHAIN.map((id) => WORLDS.find((w) => w.id === id)!).filter((w) => w && (!w.adult || s.settings.adult));
const isleDone = (s: SaveData, id: string) => worldStage(s.flags, id) >= 4;
export const islesLeft = (s: SaveData) => chain(s).filter((w) => !isleDone(s, w.id));
const sagaOver = (s: SaveData) => sagaDone(s) >= MISSIONS.length;

/** Aktueller Akt (1–3), 4 = alles erzählt */
export function act(s: SaveData) {
  if (s.chapter <= 5) return 1;
  if (!sagaOver(s) || !nachtOver(s)) return 2;
  return s.flags.fadenEnd ? 4 : 3;
}
export function actLabel(s: SaveData) { const a = ACTS[act(s) - 1]; return a ? `Akt ${['I', 'II', 'III'][a.n - 1]} · ${a.title}` : 'Rainbow City · Freies Spiel'; }

/** Ziel in Akt III: nächste Insel der Kette, dann das Finale */
export function fadenGoal(s: SaveData): Goal | null {
  if (act(s) !== 3) return null;
  const w = islesLeft(s)[0], all = chain(s).length;
  if (w) {
    const st = worldStage(s.flags, w.id), n = all - islesLeft(s).length + 1;
    return { title: `Insel ${n}/${all}: ${w.icon} ${w.name}`, sub: st ? `Mach weiter bei ${w.host.name}. Über die Brücke am Kai erreichst du jede Insel.` : `${w.host.name} wartet auf dem Platz. Über die Brücke am Kai, dann immer der Lichtsäule nach.`, isle: w.id };
  }
  if (!s.flags.fadenCall) return { title: 'Ruf bei Jules an', sub: 'Alle Inseln sind bereit. Jules weiß, wie es weitergeht.', npc: 'jules' };
  return { title: 'Die Pride der Inseln auf der Pride Plaza', sub: 'Alle Inseln feiern mit dir. Ab 12 Uhr geht es los.', poi: 'plaza' };
}

/** Satz, mit dem die Inselgastgeber*innen in Akt III auf die Geschichte Bezug nehmen */
export function isleVia(s: SaveData, id: string): string | null {
  if (act(s) !== 3 || worldStage(s.flags, id) > 0) return null;
  const i = chain(s).findIndex((w) => w.id === id);
  return i <= 0 ? 'Jules hat angerufen und gesagt, du kommst. Rainbow City schickt uns die Person, die zwei Viertel gerettet hat!' : `${chain(s)[i - 1].host.name} hat dich schon angekündigt. Du bist also die Person, die überall hilft.`;
}

const call = (who: string, color: string, text: string[]): Line[] => text.map((t) => ({ who: `📞 ${who}`, color, text: t }));
let calm = 0;

/** Anrufe zwischen den Akten und Inseln – aus storyTick, also nur, wenn nichts anderes läuft */
export function fadenTick(c: StoryCtx) {
  const s = c.s, f = s.flags, a = act(s);
  if (a === 1 || a === 4) return;
  if (++calm < 6) return; // drei ruhige Sekunden, bevor es klingelt
  const ring = (key: string, who: string, color: string, text: string[], done?: () => void) => {
    calm = 0; f[key] = true;
    c.phone(call(who, color, text), done);
  };
  if (a === 2 && !f.faden2) {
    const fresh = sagaDone(s) === 0;
    ring('faden2', 'Mama Vega', '#ff3fb0', [
      'Hier ist Vega, Mutter vom Haus Vega drüben in der Hochstadt. Ganz Rainbow City redet von deiner Pride.',
      fresh ? 'Wir haben auch ein Haus, das gerettet werden muss: das Kaleidoskop am Neonplatz. Komm über die Regenbogenbrücke, ich warte auf dich.' : 'Du hast uns schon so geholfen. Bring es mit uns zu Ende, das Kaleidoskop braucht dich noch.',
    ], () => c.card('Akt II', ACTS[1].title, ACTS[1].text).then(() => history(s, 'a2', c.card)));
    return;
  }
  if (a === 2 && f.faden2 && !f.nachtCall && nachtFirst(s) && nachtDone(s) === 0) {
    ring('nachtCall', 'Rocco Sterling', '#ffcf5a', [
      'Guten Abend. Rocco Sterling, Sterling Nights. Bar Komet, Skybar Wolke 7, du kennst das.',
      'Ich habe dich tanzen sehen. Ich brauche jemanden, der Nächte führen kann. Komm nach 21 Uhr zur Skybar in der Hochstadt, dann reden wir.',
    ]);
    return;
  }
  if (a === 3 && !f.faden3) {
    const w = islesLeft(s)[0];
    ring('faden3', 'Jules', '#9c59d1', [
      'Das Kaleidoskop bleibt! Yusuf hat es mir sofort geschrieben. Du bist unglaublich.',
      'Und jetzt kommt Post von den Inseln vor der Küste. Fünf Orte, fünf Gastgeber*innen. Alle wollen ihre eigene Pride, und alle brauchen Hilfe.',
      w ? `Fang bei ${w.icon} ${w.name} an. ${w.host.name} wartet dort. Die Brücke liegt am Kai im Hafen. Wenn alle Inseln bereit sind, feiern wir zusammen: die Pride der Inseln.` : 'Wenn alle bereit sind, feiern wir zusammen: die Pride der Inseln.',
    ], () => { f.fadenNext = w?.id || ''; c.card('Akt III', ACTS[2].title, ACTS[2].text).then(() => history(s, 'a3', c.card)); });
    return;
  }
  if (a !== 3) return;
  const w = islesLeft(s)[0];
  if (w && f.fadenNext !== w.id) {
    const prev = chain(s).find((x) => x.id === f.fadenNext);
    calm = 0; f.fadenNext = w.id;
    c.phone(call(prev && isleDone(s, prev.id) ? prev.host.name : w.host.name, prev && isleDone(s, prev.id) ? prev.host.color : w.host.color, [
      prev && isleDone(s, prev.id) ? `Danke für alles auf ${prev.icon} ${prev.name}! Ich habe schon bei ${w.host.name} angerufen.` : `Hier ist ${w.host.name}.`,
      `${w.icon} ${w.name} braucht dich als Nächstes. Komm über die Brücke, ich warte auf dem Platz.`,
    ]));
    return;
  }
  if (!w && !f.fadenCall) {
    ring('fadenCall', 'Jules', '#9c59d1', [
      'Alle Inseln haben zugesagt! Stella, Lola, Frau Ahmadi und Mika kommen mit ihren Leuten nach Rainbow City.',
      'Die Pride der Inseln steigt auf der Pride Plaza, ab 12 Uhr. Und du läufst ganz vorne.',
    ]);
  }
}

/** Finale an der Plaza – true, wenn der rote Faden das übernommen hat */
export function fadenPoi(c: StoryCtx, id: string): boolean {
  const s = c.s;
  if (id !== 'plaza' || act(s) !== 3 || islesLeft(s).length || !s.flags.fadenCall) return false;
  const J = { who: 'Jules', pron: 'they/them', color: '#9c59d1' };
  if (c.hour() < 12 && c.hour() > 4) {
    c.say([{ ...J, text: 'Die Inseln legen gerade an. Um 12 Uhr geht es los!', choices: [{ label: 'Bis 12 Uhr warten', fn: () => c.skipToHour(12) }, { label: 'Später', fn: () => {} }] }]);
    return true;
  }
  const hosts = chain(s).map((w) => ({ who: w.host.name, color: w.host.color }));
  const said: Record<string, string> = {
    'Stella Sternenstaub': 'Die Einhörner haben extra Glitzer aufgelegt. Für dich!',
    'Lola Caliente': 'Die Strandbühne von Playa Arcoíris ist heute hier. ¡Vamos!',
    'Frau Ahmadi': 'Ganz Lindenhof ist mitgekommen. Sogar die, die früher nur geschaut haben.',
    Mika: 'Das Riesenrad konnte ich nicht mitbringen. Aber den ganzen Rummel!',
    Bruno: 'Das Lustwäldchen feiert heute bei Tageslicht. Ausnahmsweise.',
  };
  c.say([
    { ...J, text: `Schau dich um, ${s.name}. Rainbow City, die Hochstadt und alle Inseln an einem Platz.` },
    ...hosts.map((h) => ({ ...h, text: said[h.who] || 'Danke für alles!' })),
    { who: 'Mama Vega', color: '#ff3fb0', text: 'Das Haus Vega läuft die erste Kategorie. Und du, Liebes, tanzt den Schluss.' },
    { ...J, text: 'Musik ab! Pride der Inseln, TANZT!' },
  ], () => { s.flags.inselShow = true; c.dance(); });
  return true;
}

/** Nach dem Tanz des Finales – true, wenn es der Finaltanz war */
export function fadenDance(c: StoryCtx, won: boolean): boolean {
  const s = c.s;
  if (!s.flags.inselShow) return false;
  delete s.flags.inselShow;
  s.flags.fadenEnd = s.day;
  c.say([
    { who: 'Jules', pron: 'they/them', color: '#9c59d1', text: won ? 'DAS war die schönste Pride aller Zeiten!' : 'Bestnote hin oder her: Die ganze Küste hat mit dir getanzt.' },
    { who: 'Mo', pron: 'sie/ihr', color: '#ff7a3d', text: 'Weißt du noch, wie du mit deinem Koffer vor dem Café standest? Jetzt kennt dich jede Insel.' },
    { who: 'Rainbow City', color: '#444', text: 'Alle drei Akte sind erzählt. Rainbow City, die Hochstadt und die Inseln gehören dir: Arbeite, date, feiere und führe dein Imperium weiter.' },
  ], () => {
    c.reward(won ? 500 : 300, 25, 'Pride der Inseln');
    c.card('Akt III abgeschlossen', 'Die Inseln der Farben', 'Fünf Inseln, eine Hochstadt und Rainbow City feiern zusammen. Dein Leben in allen Farben ist erzählt, und es geht weiter.').then(() => history(s, 'end', c.card));
  });
  return true;
}

/* ---------- Echte queere Geschichte: an jeder Wegmarke der eigenen Handlung ein wahres Ereignis („Damals“-Karte) ---------- */
export const HISTORY: Record<string, { year: string; title: string; text: string }> = {
  k1: { year: '28. Juni 1969', title: 'Stonewall', text: 'In der Nacht zum 28. Juni 1969 wehren sich die Gäste des Stonewall Inn in New York gegen eine Polizeirazzia. Zu den bekanntesten Gesichtern der Bewegung danach gehören Marsha P. Johnson und Sylvia Rivera. Aus dem Aufstand wird die moderne queere Bewegung, und aus dem Jahrestag die Pride.' },
  k2: { year: '30. Juni 1979', title: 'Der erste CSD in Berlin', text: 'Rund 450 Menschen ziehen 1979 durch Berlin, im selben Jahr wie in Bremen. Der Name „Christopher Street Day“ erinnert an die Straße des Stonewall Inn. Hilde ist seitdem auf jeder Pride gewesen.' },
  k3: { year: '1970er und 1980er', title: 'Ballroom und Wahlfamilien', text: 'In New York gründen Schwarze und Latinx-Queers die Ballroom-Szene: Häuser mit „Müttern“ an der Spitze, Kategorien, Voguing. Für viele, die zu Hause rausgeflogen sind, werden die Häuser zur Familie.' },
  k4: { year: '11. Juni 1994', title: 'Paragraf 175 fällt', text: 'Über 120 Jahre stellte Paragraf 175 Sex zwischen Männern in Deutschland unter Strafe. 1994 wird er endgültig gestrichen. 2017 hebt der Bundestag die alten Urteile auf und entschädigt die Verurteilten.' },
  k5: { year: '30. Juni 2017', title: 'Ehe für alle', text: 'Der Bundestag beschließt die Ehe für alle, seit dem 1. Oktober 2017 dürfen gleichgeschlechtliche Paare in Deutschland heiraten und gemeinsam adoptieren. Vor dem Reichstag wird mit Konfetti gefeiert.' },
  a2: { year: '1920er Jahre', title: 'Das Eldorado', text: 'Im Berlin der Zwanzigerjahre treten im Eldorado und vielen anderen Lokalen Travestie-Stars auf, queere Menschen feiern offen. Anfang der Dreißigerjahre werden die Lokale geschlossen, unter den Nazis folgt die Verfolgung. Darum ist jedes gerettete Revuetheater mehr als ein Gebäude.' },
  a3: { year: '17. Mai 1990', title: 'Gesund, nicht krank', text: 'Am 17. Mai 1990 streicht die Weltgesundheitsorganisation Homosexualität von ihrer Liste der Krankheiten. Der 17. Mai ist seitdem der Internationale Tag gegen Homo-, Bi-, Inter- und Transfeindlichkeit (IDAHOBIT), überall auf der Welt.' },
  end: { year: '1. November 2024', title: 'Selbstbestimmt', text: 'In Deutschland tritt das Selbstbestimmungsgesetz in Kraft: Trans, inter und nichtbinäre Menschen können Vornamen und Geschlechtseintrag beim Standesamt selbst ändern lassen, ohne Gutachten und Gericht. Jeder 31. März ist Trans Day of Visibility.' },
};
/** „Damals“-Karte zeigen und merken (Story-Menü listet alle gesehenen) */
export function history(s: SaveData, key: string, card: StoryCtx['card']): Promise<void> {
  const h = HISTORY[key]; if (!h) return Promise.resolve();
  s.flags['hist_' + key] = true;
  return card(`Damals · ${h.year}`, h.title, h.text);
}
export const HIST_ORDER = ['k1', 'k2', 'k3', 'a2', 'k4', 'a3', 'k5', 'end'];
