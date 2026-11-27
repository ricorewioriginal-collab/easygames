/* Eigenes Leben für die Menschen auf der Straße: Jede Person hat einen Tagesablauf, ein Gedächtnis für dich
   (Begegnungen, Stimmung, ob du sie fast überfahren hast) und eine eigene Geschichte in vier Teilen, die du
   Tag für Tag beim Ansprechen erfährst. Am Ende entscheidest du mit, wie sie ausgeht.
   Reine Logik (ohne Babylon), damit sie sich testen lässt. Stand je Person in flags.mem_<key>. */
import type { SaveData } from '../engine/Save';
import { hash } from './flirt';

export interface Mem { met: number; last: number; mood: number; ch: number; chDay: number; near: number; done?: string }
export interface Ending { label: string; reply: string; money?: number; rep?: number; social?: number; fun?: number }
export interface Story { id: string; icon: string; title: string; parts: [string, string, string, string]; end: [Ending, Ending] }

/** Persönliche Geschichten (alle frei erfunden): Teil 1–3 erzählen, Teil 4 fragt dich um Rat */
export const STORIES: Story[] = [
  { id: 'baeckerei', icon: '🥐', title: 'Die Backstube', parts: [
    'Ich steh jeden Morgen um vier in der Backstube meiner Oma. Sie hat sie 1974 eröffnet, damals ganz allein.',
    'Oma weiß seit zwanzig Jahren, dass ich auf Männer stehe. Sie hat nur gesagt: „Hauptsache, er isst ordentlich.“',
    'Jetzt will sie in Rente. Die Backstube oder mein Traum: ein eigenes queeres Café am Hafen.',
    'Ich muss mich entscheiden. Was würdest du tun?'],
    end: [{ label: '🥐 Die Backstube weiterführen', reply: 'Du hast recht. Omas Rezepte, mein Regenbogen-Zuckerguss. Komm vorbei, das erste Croissant geht auf mich!', social: 12, money: 40 },
      { label: '☕ Das eigene Café wagen', reply: 'Ja! Und Oma wird Stammgast, das hat sie schon angekündigt. Danke, dass du mich ermutigt hast!', fun: 10, rep: 4 }] },
  { id: 'chor', icon: '🎶', title: 'Der Chor', parts: [
    'Ich singe im queeren Chor „Tonleiterinnen“. Seit drei Jahren in der letzten Reihe.',
    'Nächste Woche ist das große Konzert, und die Chorleitung hat mir ein Solo gegeben. Mir ist schlecht.',
    'Ich hab in der Schule nie gesungen. Da hieß es immer, meine Stimme sei „zu weich für einen Jungen“.',
    'Soll ich das Solo singen?'],
    end: [{ label: '🎤 Sing es, laut und weich!', reply: 'Okay. Ich singe es für den kleinen Jungen von damals. Und du kommst und klatschst am lautesten!', fun: 12, rep: 3 },
      { label: '🫶 Mach es zu zweit, im Duett', reply: 'Ein Duett mit meiner besten Freundin … das fühlt sich richtig an. Danke!', social: 12 }] },
  { id: 'brief', icon: '✉️', title: 'Der Brief', parts: [
    'Ich trage seit Wochen einen Brief mit mir herum. An meinen Vater.',
    'Wir haben seit meiner Transition nicht mehr gesprochen. Sieben Jahre jetzt.',
    'Letzte Woche hat er mir zum Geburtstag gratuliert. Mit meinem richtigen Namen. Zum ersten Mal.',
    'Soll ich ihm den Brief schicken?'],
    end: [{ label: '📮 Schick ihn ab', reply: 'Ich hab ihn eingeworfen. Mir zittern die Hände, aber es fühlt sich frei an. Danke, dass du zugehört hast.', social: 14 },
      { label: '📞 Ruf ihn lieber an', reply: 'Seine Stimme hören … ja. Vielleicht heute Abend. Du hast mir echt Mut gemacht.', social: 10, fun: 4 }] },
  { id: 'hund', icon: '🐶', title: 'Keks', parts: [
    'Siehst du manchmal einen kleinen grauen Hund hier rumlaufen? Das ist Keks, er gehört niemandem.',
    'Ich füttere ihn jeden Tag. Mein Mann sagt, in unsere Einzimmerwohnung passt kein Hund.',
    'Gestern hat Keks vor unserer Haustür geschlafen. Mein Mann hat ihm eine Decke rausgelegt. Heimlich.',
    'Sollen wir ihn aufnehmen?'],
    end: [{ label: '🏠 Holt Keks nach Hause', reply: 'Mein Mann hat schon ein Körbchen gekauft. Er tut so, als wäre es meine Idee gewesen. 😄', fun: 12, social: 6 },
      { label: '🐾 Bringt ihn ins Tierheim am Kai', reply: 'Das Tierheim sucht ihm eine große Familie. Und wir gehen ihn jeden Sonntag besuchen.', rep: 4, social: 6 }] },
  { id: 'gruender', icon: '💻', title: 'Die App', parts: [
    'Ich programmiere nachts an einer App, die queere Leute mit sicheren Wohnungen zusammenbringt.',
    'Ein Investor will einsteigen. Viel Geld. Aber er will „das Queere“ aus dem Namen nehmen, „wegen der Reichweite“.',
    'Mein Team ist geteilter Meinung. Ohne das Geld halten wir noch zwei Monate durch.',
    'Nehme ich das Geld?'],
    end: [{ label: '🏳️‍🌈 Kein Deal ohne Regenbogen', reply: 'Genau. Wir machen eine Spendenrunde in der Community. Hier, für dich ein kleines Dankeschön aus der Kasse!', rep: 6, money: 60 },
      { label: '🤝 Nachverhandeln', reply: 'Gute Idee: Geld ja, Name bleibt. Wenn er nicht will, will er uns nicht verdienen.', money: 90 }] },
  { id: 'tanz', icon: '💃', title: 'Die Tanzschule', parts: [
    'Ich gebe Tanzkurse für gleichgeschlechtliche Paare. Standard und Latein, beide dürfen führen.',
    'Ein älteres Paar, beide über siebzig, lernt bei mir Walzer für ihre Hochzeit. Nach 45 Jahren zusammen.',
    'Gestern hat einer von ihnen geweint, weil sie früher nie zusammen tanzen durften. Nicht öffentlich.',
    'Ich möchte ihnen etwas schenken. Was meinst du?'],
    end: [{ label: '🎊 Ein Tanzabend nur für sie', reply: 'Ein ganzer Ballsaal voller Leute, die für sie klatschen. Ich organisiere das! Du bist eingeladen.', social: 10, fun: 8 },
      { label: '🎥 Ein Video ihres Hochzeitstanzes', reply: 'Damit die Welt sieht, wie Liebe nach 45 Jahren aussieht. Das wird wunderschön.', rep: 5, social: 6 }] },
  { id: 'pflege', icon: '🩺', title: 'Nachtschicht', parts: [
    'Ich bin Pflegerin im Krankenhaus. Nachtschicht, seit zehn Jahren.',
    'Letzte Nacht lag ein alter Mann bei uns. Er hat mir von seinem Freund erzählt, der in den Achtzigern an AIDS gestorben ist.',
    'Er hat niemanden mehr. Er hat gefragt, ob ich ihm morgen ein Foto von damals aus seiner Wohnung hole.',
    'Ich darf das eigentlich nicht. Was soll ich tun?'],
    end: [{ label: '🖼️ Hol ihm das Foto', reply: 'Er hat das Foto die ganze Nacht festgehalten und gelächelt. Manche Regeln sind dafür da, gebrochen zu werden.', social: 14 },
      { label: '🌈 Organisier Besuch aus der Szene', reply: 'Die AIDS-Hilfe schickt Leute, die ihn besuchen. Er ist nicht mehr allein. Danke für die Idee!', rep: 5, social: 8 }] },
  { id: 'band', icon: '🎸', title: 'Die Band', parts: [
    'Ich spiele Bass in einer Punkband. Nur Lesben. Wir heißen „Die Scherenschnitte“.',
    'Ein großes Festival will uns buchen. Aber wir sollen um 14 Uhr spielen, vor fast leerem Platz.',
    'Unsere Sängerin will absagen. Ich finde, man fängt halt irgendwo an.',
    'Spielen wir?'],
    end: [{ label: '🤘 Spielt! Jeder Anfang zählt', reply: 'Wir spielen. Und wenn nur drei Leute da sind: Das werden die drei glücklichsten Menschen des Festivals!', fun: 12 },
      { label: '🎪 Eigenes Konzert im Prisma', reply: 'Unser eigenes Konzert, unsere Regeln, volle Bude. Das ist sowieso mehr Punk!', social: 8, rep: 4 }] },
  { id: 'opa', icon: '👴', title: 'Opa Heinz', parts: [
    'Mein Opa Heinz ist 89. Letzte Woche hat er mir erzählt, dass er in den Fünfzigern einen Freund hatte. Einen „richtigen“.',
    'Damals war das verboten. Paragraf 175. Sie mussten sich trennen, und Opa hat Oma geheiratet.',
    'Ich hab den Mann gefunden. Er lebt, in einem Altenheim, zwei Stunden von hier.',
    'Soll ich die beiden zusammenbringen?'],
    end: [{ label: '💌 Bring sie zusammen', reply: 'Sie saßen drei Stunden auf einer Parkbank und haben Händchen gehalten. Ich hab Rotz und Wasser geheult.', social: 16 },
      { label: '🗣️ Frag erst deinen Opa', reply: 'Du hast recht, es ist seine Geschichte. Ich frag ihn heute Abend. Er wird Ja sagen, ich spür das.', social: 10, fun: 4 }] },
  { id: 'kochen', icon: '🍲', title: 'Die Suppenküche', parts: [
    'Ich koche jeden Sonntag für queere Jugendliche, die zu Hause rausgeflogen sind.',
    'Am Anfang kamen drei. Jetzt sind es zwanzig. Mein Küchenschrank ist leer.',
    'Ein Restaurant am Neonplatz will mir übrig gebliebenes Essen spenden. Aber nur, wenn ich ihren Namen auf ein Plakat schreibe.',
    'Machst du da mit?'],
    end: [{ label: '🍽️ Ja, Hauptsache alle sind satt', reply: 'Alle satt, alle glücklich. Und das Plakat hab ich mit Regenbogen bemalt. Hier, ein Teller für dich!', social: 10, fun: 6 },
      { label: '🤲 Lieber eine Nachbarschafts-Spende', reply: 'Die ganze Straße bringt jetzt Töpfe vorbei. Das ist Familie. Danke!', rep: 6, social: 6 }] },
  { id: 'fotografin', icon: '📷', title: 'Die Ausstellung', parts: [
    'Ich fotografiere queere Paare in ihren Küchen. Ganz normaler Alltag, Kaffee, Zeitung, Liebe.',
    'Eine Galerie will die Bilder ausstellen. Mein erstes Mal.',
    'Eines der Paare will nicht mehr gezeigt werden. Einer von ihnen ist Lehrer und hat Angst.',
    'Was mache ich mit dem Foto?'],
    end: [{ label: '🙈 Foto raus, Schutz geht vor', reply: 'Natürlich. An die Stelle hänge ich einen leeren Rahmen mit dem Satz: „Nicht alle können schon sichtbar sein.“', rep: 6, social: 6 },
      { label: '🎨 Gesichter unkenntlich machen', reply: 'Nur Hände und Kaffeetassen. Er hat zugestimmt. Ehrlich gesagt ist es jetzt das schönste Bild.', fun: 8, money: 50 }] },
  { id: 'marathon', icon: '🏃', title: 'Der Lauf', parts: [
    'Ich trainiere für meinen ersten Marathon. Mit Prothese, seit dem Unfall vor drei Jahren.',
    'Mein Freund läuft jeden Morgen mit. Er hasst Laufen. Er macht es trotzdem.',
    'Beim Probelauf bin ich nach 30 Kilometern zusammengebrochen. Der Arzt sagt: noch ein Jahr warten.',
    'Was meinst du?'],
    end: [{ label: '⏳ Warte das Jahr ab', reply: 'Ein Jahr mehr Training, ein Jahr mehr Morgenläufe mit ihm. Das ist kein Warten, das ist Vorfreude.', social: 10, fun: 4 },
      { label: '🏅 Lauf den Halbmarathon', reply: 'Halbmarathon, und er läuft mit. Wir kommen Hand in Hand ins Ziel, versprochen!', fun: 12 }] },
  { id: 'drag', icon: '👑', title: 'Erste Show', parts: [
    'Tagsüber bin ich Steuerberater. Nachts heiße ich „Miss Bilanzia“.',
    'Mein Chef hat ein Foto von mir in Drag auf Glitzergram gefunden. Er hat nichts gesagt. Noch nicht.',
    'Heute hat er mich in sein Büro gerufen und gefragt, ob ich bei der Firmenfeier auftreten will.',
    'Sag ich zu?'],
    end: [{ label: '💄 Zusagen, mit voller Perücke', reply: 'Miss Bilanzia betritt die Firmenfeier! Die Buchhaltung wird nie wieder so glitzern.', fun: 14, rep: 3 },
      { label: '🕶️ Erst mal nur Moderation', reply: 'Ich moderiere in Anzug mit Glitzer-Fliege. Ein Schritt nach dem anderen. Danke!', social: 8, money: 40 }] },
  { id: 'garten', icon: '🌻', title: 'Der Gemeinschaftsgarten', parts: [
    'Hinter dem Park gibt es eine Brache. Ich will dort einen Gemeinschaftsgarten anlegen.',
    'Fünfzehn Leute machen mit. Die Hälfte davon kenne ich aus der Selbsthilfegruppe.',
    'Die Stadt will die Fläche an einen Parkhaus-Investor verkaufen. Abstimmung in zwei Wochen.',
    'Wie kämpfen wir?'],
    end: [{ label: '📣 Unterschriften sammeln', reply: '2.000 Unterschriften! Die Stadt hat den Verkauf gestoppt. Du bist ab jetzt Ehrengärtner*in!', rep: 8 },
      { label: '🌱 Einfach anfangen zu pflanzen', reply: 'Wir haben über Nacht Sonnenblumen gesetzt. Keiner traut sich, die auszureißen. 🌻', fun: 10, social: 6 }] },
  { id: 'heirat', icon: '💍', title: 'Der Antrag', parts: [
    'Ich will meiner Freundin einen Antrag machen. Seit zwei Jahren trage ich den Ring mit mir rum.',
    'Das Problem: Sie hat einmal gesagt, Heiraten sei „so spießig“.',
    'Gestern ist sie vor einem Brautmodenladen stehen geblieben. Lange. Sehr lange.',
    'Wie mache ich den Antrag?'],
    end: [{ label: '🌈 Groß, auf der Parade', reply: 'Auf dem Paradewagen, vor tausend Leuten. Wenn sie nein sagt, zieh ich nach Grönland. 😅 (Sie sagt bestimmt ja!)', fun: 12, social: 4 },
      { label: '🕯️ Klein, nur ihr zwei', reply: 'Auf unserem Balkon, bei Kerzenlicht. Sie hat ja gesagt, bevor ich fertig war! 💍', social: 14 }] },
  { id: 'nachbarin', icon: '🏢', title: 'Frau Kowalski', parts: [
    'Meine Nachbarin, Frau Kowalski, hat am Anfang nie gegrüßt. Wegen der Regenbogenflagge am Balkon, dachte ich.',
    'Letzten Winter ist sie gestürzt. Ich hab ihr wochenlang die Einkäufe hochgetragen.',
    'Heute hängt an ihrem Balkon auch eine Flagge. Klein, aber sie hängt.',
    'Ich will mich bedanken. Wie?'],
    end: [{ label: '☕ Lad sie zum Kaffee ein', reply: 'Sie hat Kuchen mitgebracht und erzählt, dass ihr Enkel schwul ist. Sie hat ihn seit Jahren nicht gesehen. Jetzt ruft sie ihn an.', social: 14 },
      { label: '🏳️‍🌈 Nimm sie mit zur Parade', reply: 'Frau Kowalski auf der Parade, mit Sonnenhut und Fähnchen. Bester Tag des Jahres!', fun: 12, rep: 2 }] },
];

const key = (k: string) => 'mem_' + hash(k).toString(36);
/** Gedächtnis einer Person (neu angelegt, falls noch unbekannt) */
export function memOf(s: SaveData, k: string): Mem {
  const raw = s.flags[key(k)];
  if (typeof raw === 'string') { try { return JSON.parse(raw) as Mem; } catch { /* neu anlegen */ } }
  return { met: 0, last: 0, mood: 0, ch: 0, chDay: 0, near: 0 };
}
export function saveMem(s: SaveData, k: string, m: Mem) { s.flags[key(k)] = JSON.stringify(m); }
export function storyOf(k: string) { return STORIES[hash('st' + k) % STORIES.length]; }

/** Begegnung merken: Stimmung −5 … +5 */
export function remember(s: SaveData, k: string, ev: 'talk' | 'near' | 'greet') {
  const m = memOf(s, k);
  if (ev === 'talk') { if (m.last !== s.day) m.mood = Math.min(5, m.mood + 1); m.met++; m.last = s.day; }
  if (ev === 'near') { m.near++; m.mood = Math.max(-5, m.mood - 2); }
  saveMem(s, k, m); return m;
}

export interface Ctx { hour: number; rain: boolean; wanted: number; name: string }
/** Begrüßung je nach Gedächtnis, Tageszeit, Wetter und deinem Ruf */
export function greet(m: Mem, c: Ctx, h: number): string {
  const pick = (a: string[]) => a[h % a.length];
  if (c.wanted >= 2) return pick(['Oh … die Polizei sucht dich, oder? Ich hab nichts gesehen. 🙈', 'Psst, da vorne stand gerade eine Streife. Pass auf dich auf.']);
  if (m.near > 0 && m.mood < 0) return pick([`Du schon wieder! Du hättest mich ${m.near > 1 ? 'schon mehrmals' : 'neulich'} fast über den Haufen gefahren!`, 'Ach, die Person mit dem Bleifuß. Na, heute zu Fuß unterwegs?', 'Ich spring heute vorsichtshalber schon mal zur Seite. 😒']);
  if (m.met === 0) {
    if (c.rain) return pick(['Puh, dieses Wetter! Ich bin pitschnass. Hi übrigens!', 'Regen in Rainbow City … wenigstens gibt es danach einen Regenbogen. Hallo!']);
    if (c.hour < 10) return pick(['Morgen! Ich bin noch nicht ganz wach, sorry.', 'Guten Morgen! Ich bin auf dem Weg zur Arbeit.']);
    if (c.hour >= 20 || c.hour < 4) return pick(['Na, auch unterwegs heute Nacht? Hi!', 'Hallo! Ich bin auf dem Weg ins Nachtleben.']);
    return pick(['Hallo! Schön, mal jemanden Neues kennenzulernen.', 'Hi! Bist du neu in der Gegend?']);
  }
  if (m.mood >= 3) return pick([`${c.name}! Wie schön, dich zu sehen! 🥰`, `Da ist ja ${c.name}! Ich hab gerade an dich gedacht.`, `${c.name}, mein Lieblingsmensch auf dieser Straße!`]);
  return pick([`Hey ${c.name}, wir kennen uns doch!`, `Oh, hallo ${c.name}! Alles gut bei dir?`, `${c.name}! Na, was treibst du heute?`]);
}

/** Nächster Teil der eigenen Geschichte (ein Teil pro Tag); null, wenn heute schon erzählt oder fertig */
export function nextPart(s: SaveData, k: string): { story: Story; i: number; text: string } | null {
  const m = memOf(s, k), st = storyOf(k);
  if (m.done || m.ch >= 4 || (m.ch > 0 && m.chDay === s.day)) return null;
  return { story: st, i: m.ch, text: st.parts[m.ch] };
}
/** Teil gehört: weiterschalten */
export function heardPart(s: SaveData, k: string) { const m = memOf(s, k); m.ch = Math.min(4, m.ch + 1); m.chDay = s.day; m.mood = Math.min(5, m.mood + 1); saveMem(s, k, m); return m; }
/** Ende gewählt: Belohnung und Erinnerung */
export function finish(s: SaveData, k: string, e: Ending) {
  const m = memOf(s, k); m.done = e.label; m.ch = 4; m.mood = 5; saveMem(s, k, m);
  if (e.money) s.money += e.money; if (e.rep) s.rep += e.rep;
  s.flags.storiesDone = Number(s.flags.storiesDone || 0) + 1;
  return m;
}

/** Tagesablauf: Wo ist die Person gerade? */
export type Phase = 'schlaf' | 'weg' | 'mittag' | 'tag' | 'abend';
export function phaseAt(hour: number, h: number): Phase {
  const early = h % 3;   // Frühaufsteher*innen, Normale, Nachteulen
  if (hour < 5 + early) return h % 2 ? 'schlaf' : 'abend';
  if (hour < 9) return 'weg';
  if (hour >= 12 && hour < 13.5) return 'mittag';
  if (hour >= 18 + early) return 'abend';
  return 'tag';
}
