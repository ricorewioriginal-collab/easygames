/* Wissen: queere Geschichte, Persönlichkeiten, Flaggen, Rechte und ein Quiz – im Handy unter „🧠 Wissen“.
   Die „Damals“-Karten der Story (faden.ts) stehen in der Zeitleiste, sobald man sie erlebt hat (roter Faden bleibt die Story).
   Begriffe (Glossar) und Gesundheit (PrEP, U=U, Tests) bleiben in ihren eigenen Apps, hier nur verlinkt – nichts doppelt. */
import type { SaveData } from '../engine/Save';
import { HISTORY, HIST_ORDER } from './faden';
import { PALETTES } from './palettes';
import { DRAG_HISTORY } from './dragLook';

export interface Entry { year?: string; title: string; text: string }

/** Zeitleiste: Ereignisse, die nicht schon als Story-Karte kommen (Story-Karten werden dazwischen einsortiert) */
export const TIMELINE: Array<Entry & { at: number }> = [
  { at: 1867, year: '29. August 1867', title: 'Ulrichs spricht öffentlich', text: 'Der Jurist Karl Heinrich Ulrichs fordert auf dem Deutschen Juristentag in München die Straffreiheit für Liebe zwischen Männern. Er wird niedergeschrien, gilt aber als einer der ersten, die sich öffentlich bekennen.' },
  { at: 1897, year: '15. Mai 1897', title: 'Das erste Komitee', text: 'Magnus Hirschfeld und Mitstreiter gründen in Berlin das Wissenschaftlich-humanitäre Komitee, die weltweit erste Organisation für die Rechte homosexueller Menschen.' },
  { at: 1919, year: '1919', title: 'Institut für Sexualwissenschaft', text: 'Hirschfeld eröffnet in Berlin das Institut für Sexualwissenschaft, mit Beratung, Forschung und Bibliothek. Im Mai 1933 plündern die Nazis das Institut und verbrennen seine Bücher.' },
  { at: 1987, year: '1987', title: 'ACT UP', text: 'In New York gründet sich ACT UP. In der Aids-Krise erzwingen Aktivist*innen mit lauten, kreativen Protesten schnellere Forschung und bezahlbare Medikamente. „Silence = Death“ wird zum Leitspruch.' },
  { at: 2001, year: '1. August 2001', title: 'Eingetragene Lebenspartnerschaft', text: 'In Deutschland können gleichgeschlechtliche Paare erstmals ihre Partnerschaft beim Amt eintragen lassen. Noch keine Ehe, aber ein Anfang.' },
  { at: 2018, year: 'Dezember 2018', title: 'Dritte Option „divers“', text: 'Nach einem Urteil des Bundesverfassungsgerichts von 2017 gibt es im Geburtenregister neben „weiblich“ und „männlich“ auch „divers“ oder gar keinen Eintrag.' },
  { at: 2020, year: 'Juni 2020', title: 'Verbot von Konversionsbehandlungen', text: 'Angebliche „Therapien“, die Homosexualität oder Transidentität „heilen“ wollen, sind in Deutschland bei Minderjährigen verboten. Werbung dafür auch. Queer sein ist keine Krankheit.' },
  { at: 2023, year: 'April 2023', title: 'Blutspende ohne Ausschluss', text: 'Ob jemand Blut spenden darf, hängt in Deutschland nicht mehr von der sexuellen Orientierung ab, sondern vom persönlichen Risikoverhalten. Pauschale Sperren für schwule und bisexuelle Männer fallen weg.' },
];
/** Jahr einer Story-Karte für die Sortierung */
const yearOf = (y: string) => Number((y.match(/\d{4}/) || ['1920'])[0]);

export interface TimelineRow extends Entry { story: boolean; seen: boolean }
export function timeline(s: SaveData): TimelineRow[] {
  const story = HIST_ORDER.map((k) => ({ ...HISTORY[k], at: yearOf(HISTORY[k].year), story: true, seen: !!s.flags['hist_' + k] }));
  // Drag-Geschichte aus der Drag-Karriere (drag.ts): erscheint nach dem jeweiligen Lip-Sync-Sieg
  story.push(...Object.entries(DRAG_HISTORY).map(([k, h]) => ({ ...h, at: yearOf(h.year), story: true, seen: !!s.flags['dwiss_' + k] })));
  return [...TIMELINE.map((e) => ({ ...e, story: false, seen: true })), ...story].sort((a, b) => a.at - b.at);
}

export const PEOPLE: Entry[] = [
  { year: '1868–1935', title: 'Magnus Hirschfeld', text: 'Berliner Arzt und Forscher. Kämpfte gegen Paragraf 175, gründete das erste Komitee für queere Rechte und das Institut für Sexualwissenschaft. Musste vor den Nazis ins Exil.' },
  { year: '1945–1992', title: 'Marsha P. Johnson', text: 'Schwarze trans Aktivistin und Drag-Künstlerin aus New York. Mitgründerin von STAR, einer Anlaufstelle für obdachlose queere Jugendliche. Das „P.“ stand für „Pay it no mind“.' },
  { year: '1951–2002', title: 'Sylvia Rivera', text: 'Latina-trans-Aktivistin aus New York und Mitgründerin von STAR. Kämpfte dafür, dass trans Menschen und Drag Queens in der Bewegung nicht vergessen werden.' },
  { year: '1930–1978', title: 'Harvey Milk', text: 'Einer der ersten offen schwulen Politiker der USA, 1977 in den Stadtrat von San Francisco gewählt. Sein Satz „You gotta give them hope“ wird bis heute zitiert. 1978 wurde er ermordet.' },
  { year: '1934–1992', title: 'Audre Lorde', text: 'Schwarze lesbische Dichterin und Feministin aus New York. Sie lehrte in den 1980ern auch in Berlin und prägte dort die afrodeutsche Bewegung mit.' },
  { year: '1912–1954', title: 'Alan Turing', text: 'Britischer Mathematiker, half im Zweiten Weltkrieg, den Enigma-Code zu knacken, und gilt als Vater der Informatik. 1952 wegen Homosexualität verurteilt, 2013 offiziell begnadigt.' },
  { year: '1912–1987', title: 'Bayard Rustin', text: 'Schwarzer schwuler Bürgerrechtler und Hauptorganisator des Marschs auf Washington 1963, bei dem Martin Luther King „I have a dream“ sagte.' },
  { year: '1946–1991', title: 'Freddie Mercury', text: 'Sänger von Queen, eine der größten Stimmen der Rockmusik. Starb 1991 an den Folgen von Aids. Sein Tod rückte die Krankheit weltweit ins Bewusstsein.' },
];

/** Bedeutung der echten Flaggen (Farbwelten aus palettes.ts, ohne die Fantasie-Welten) */
export const FLAG_INFO: Record<string, string> = {
  rainbow: 'Regenbogenflagge, 1978 von Gilbert Baker für San Francisco entworfen. Heute meist sechs Streifen: Leben, Heilung, Sonne, Natur, Harmonie, Geist.',
  progress: 'Progress-Pride-Flagge, 2018 von Daniel Quasar. Der Keil ergänzt Schwarz und Braun für Schwarze und PoC-Queers sowie die Trans-Farben.',
  trans: 'Trans-Flagge, 1999 von Monica Helms. Hellblau und Rosa, dazu Weiß für alle, die sich dazwischen oder außerhalb sehen. Egal wie man sie hält: Sie ist immer richtig herum.',
  bi: 'Bi-Flagge, 1998 von Michael Page. Pink und Blau für die Anziehung zu verschiedenen Geschlechtern, Lila für die Überschneidung.',
  lesbian: 'Lesbische Flagge in Orange und Rosa, 2018 von Emily Gwen. Steht für Gemeinschaft, Unabhängigkeit, Liebe und Weiblichkeit in all ihren Formen.',
  pan: 'Pan-Flagge, um 2010 im Netz entstanden. Pink, Gelb und Blau: Anziehung unabhängig vom Geschlecht.',
  nonbinary: 'Nichtbinäre Flagge, 2014 von Kye Rowan. Gelb für Geschlechter außerhalb der Zweiteilung, Weiß für viele, Lila für Mischungen, Schwarz für ohne Geschlecht.',
  ace: 'Asexuelle Flagge, 2010 aus der Community von AVEN. Schwarz, Grau, Weiß und Lila für das ganze Spektrum der Asexualität.',
  aro: 'Aromantische Flagge, Grün- und Grautöne für Menschen, die wenig oder keine romantische Anziehung empfinden.',
  gay: 'Flagge für schwule Männer (MLM) in Grün- und Blautönen, um 2019 verbreitet.',
  bear: 'Bear-Flagge, 1995 von Craig Byrnes. Die Fellfarben stehen für die Vielfalt der Bären-Community.',
  leather: 'Leder-Flagge, 1989 von Tony DeBlase. Schwarz und Blau mit weißem Streifen und einem roten Herz.',
};
export const flags = () => PALETTES.filter((p) => FLAG_INFO[p.id]).map((p) => ({ ...p, info: FLAG_INFO[p.id] }));

export const RIGHTS: Entry[] = [
  { title: 'Ehe und Familie', text: 'Seit 2017 dürfen in Deutschland alle Paare heiraten und gemeinsam Kinder adoptieren. Im Spiel: Antrag mit Ring, Hochzeit und Adoption im Regenbogenhaus.' },
  { title: 'Schutz vor Diskriminierung', text: 'Das Allgemeine Gleichbehandlungsgesetz (seit 2006) verbietet Benachteiligung wegen der sexuellen Identität, etwa im Job oder bei der Wohnungssuche. Hilfe gibt es bei der Antidiskriminierungsstelle des Bundes.' },
  { title: 'Selbstbestimmung', text: 'Seit November 2024 ändern trans, inter und nichtbinäre Menschen Vornamen und Geschlechtseintrag mit einer Erklärung beim Standesamt.' },
  { title: 'Keine „Heilung“', text: 'Konversionsbehandlungen an Minderjährigen sind seit 2020 verboten. Die Weltgesundheitsorganisation führt Homosexualität seit 1990 nicht mehr als Krankheit.' },
  { title: 'Hilfe holen', text: 'Wer Gewalt oder Anfeindung erlebt, kann sich an queere Beratungsstellen und Anti-Gewalt-Projekte in vielen Städten wenden oder die Polizei rufen (110). Niemand muss das allein durchstehen.' },
];

/* ---------- Quiz: Hilde fragt, einmal am Tag gibt es Glitzer und Ruf ---------- */
export interface Q { q: string; a: string[]; ok: number; why: string; /** Story-Karte, die man erst gesehen haben muss */ need?: string }
export const QUIZ: Q[] = [
  { q: 'In welcher Stadt liegt das Stonewall Inn?', a: ['San Francisco', 'New York', 'Berlin'], ok: 1, why: 'Christopher Street, New York. Daher auch der Name „CSD“.', need: 'k1' },
  { q: 'Wann zog der erste CSD durch Berlin?', a: ['1969', '1979', '1994'], ok: 1, why: 'Am 30. Juni 1979, im selben Jahr wie in Bremen.', need: 'k2' },
  { q: 'Wann wurde Paragraf 175 endgültig gestrichen?', a: ['1969', '1994', '2017'], ok: 1, why: '1994. Die alten Urteile wurden 2017 aufgehoben.', need: 'k4' },
  { q: 'Seit wann gibt es in Deutschland die Ehe für alle?', a: ['2001', '2017', '2024'], ok: 1, why: 'Beschlossen am 30. Juni 2017, gültig seit 1. Oktober 2017.', need: 'k5' },
  { q: 'Wofür steht der 17. Mai?', a: ['Tag gegen Homo-, Bi-, Inter- und Transfeindlichkeit', 'Christopher Street Day', 'Coming-out-Tag'], ok: 0, why: 'Am 17. Mai 1990 strich die WHO Homosexualität von der Krankheitsliste.', need: 'a3' },
  { q: 'Wer entwarf 1978 die Regenbogenflagge?', a: ['Gilbert Baker', 'Harvey Milk', 'Monica Helms'], ok: 0, why: 'Gilbert Baker, für die Pride in San Francisco.' },
  { q: 'Welche Farben hat die Trans-Flagge?', a: ['Pink, Lila, Blau', 'Hellblau, Rosa, Weiß', 'Gelb, Weiß, Lila, Schwarz'], ok: 1, why: 'Hellblau, Rosa und Weiß, entworfen 1999 von Monica Helms.' },
  { q: 'Wer gründete 1897 das erste Komitee für queere Rechte?', a: ['Magnus Hirschfeld', 'Alan Turing', 'Karl Lagerfeld'], ok: 0, why: 'Magnus Hirschfeld, mit dem Wissenschaftlich-humanitären Komitee in Berlin.' },
  { q: 'Was bedeutet U=U?', a: ['Unter der Nachweisgrenze ist HIV beim Sex nicht übertragbar', 'Unbedingt Untersuchen', 'HIV ist heilbar'], ok: 0, why: 'Undetectable = Untransmittable: Wirksame Therapie schützt auch Partner*innen.' },
  { q: 'Wovor schützt die PrEP?', a: ['Vor allen STI', 'Vor HIV', 'Vor Schwangerschaft'], ok: 1, why: 'Nur vor HIV. Kondome senken zusätzlich das Risiko für andere STI.' },
  { q: 'Wann ist die PEP nach einem Risiko am wirksamsten?', a: ['Innerhalb von 2 bis höchstens 72 Stunden', 'Nach einer Woche', 'Nur am selben Abend'], ok: 0, why: 'So früh wie möglich, spätestens nach 72 Stunden, in Notaufnahme oder HIV-Praxis.' },
  { q: 'Was heißt nichtbinär?', a: ['Kein Interesse an Sex', 'Geschlecht jenseits von nur Mann oder nur Frau', 'Mag beide Geschlechter'], ok: 1, why: 'Eine Geschlechtsidentität. Mit Sexualität hat das erst einmal nichts zu tun.' },
  { q: 'Welches Gesetz schützt seit 2006 vor Diskriminierung im Job?', a: ['Das Allgemeine Gleichbehandlungsgesetz', 'Das Selbstbestimmungsgesetz', 'Paragraf 175'], ok: 0, why: 'Das AGG verbietet Benachteiligung auch wegen der sexuellen Identität.' },
  { q: 'Wer sagte „You gotta give them hope“?', a: ['Harvey Milk', 'Freddie Mercury', 'Audre Lorde'], ok: 0, why: 'Harvey Milk, Stadtrat in San Francisco.' },
  { q: 'Wofür steht das „P.“ bei Marsha P. Johnson?', a: ['Pride', 'Pay it no mind', 'Peace'], ok: 1, why: '„Pay it no mind“, ihre Antwort auf Fragen nach ihrem Geschlecht.' },
  { q: 'Seit wann gibt es den Eintrag „divers“?', a: ['1994', '2018', '2024'], ok: 1, why: 'Seit Dezember 2018, nach einem Urteil von 2017.' },
  { q: 'Was gilt immer, auch im Club und im Darkroom?', a: ['Wer nicht Nein sagt, will', 'Nur Ja heißt Ja', 'Zustimmung einmal reicht für immer'], ok: 1, why: 'Zustimmung ist Pflicht und kann jederzeit zurückgenommen werden.' },
];
export const quizPool = (s: SaveData) => QUIZ.filter((q) => !q.need || s.flags['hist_' + q.need]);
/** Drei Fragen für heute, gleich für den ganzen Tag */
export function todaysQuiz(s: SaveData): Q[] {
  const pool = quizPool(s), out: Q[] = [];
  let h = s.day * 2654435761 >>> 0;
  const left = [...pool];
  while (out.length < 3 && left.length) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; out.push(left.splice(h % left.length, 1)[0]); }
  return out;
}
export const quizDoneToday = (s: SaveData) => s.flags.quizDay === s.day;
/** Ergebnis buchen: Glitzer und Ruf nur einmal am Tag */
export function quizReward(s: SaveData, right: number) {
  if (quizDoneToday(s)) return { glitter: 0, rep: 0 };
  s.flags.quizDay = s.day; s.flags.quizRight = (Number(s.flags.quizRight) || 0) + right;
  const glitter = right * 5, rep = right === 3 ? 2 : right ? 1 : 0;
  s.glitter += glitter; s.rep += rep;
  return { glitter, rep };
}
