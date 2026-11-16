/* „Leuchtfeuer“ – der Jugendroman von RicoReWi als Handlungsstrang in Pride City.
   Finn (heute erwachsen, mit Ben in Rainbow City) erzählt am Leuchtturm auf dem Steg von seinem letzten Schuljahr in Warnholm:
   16 Rückblenden mit Entscheidungen, die Leuchtkraft bringen, Erinnerungen an die fünf Spiele aus dem Buch und drei Enden.
   Der vollständige Roman liegt in public/book/leuchtfeuer.json und ist im Handy lesbar. Daten aus leuchtfeuer-src/src/core.js übernommen. */

export interface LfChoice { t: string; g: number; r: string }
export interface LfChapter { n: string; title: string; cast: string[]; lines: Array<[string, string]>; choices?: LfChoice[]; game?: string; end?: boolean }

export const LF_CHAPTERS: LfChapter[] = [
 {
  n: "1",
  title: "Der erste Tag",
  cast: [
   "finn",
   "lotte"
  ],
  lines: [
   [
    "",
    "Warnholm riecht nach Rauch und Salz. Immer. Auch an diesem ersten Schultag nach den Sommerferien."
   ],
   [
    "",
    "Finn Albrecht kommt wie immer zehn Minuten zu früh. Er ist einer, der an den Rändern geht. An den Rändern wird man selten angerempelt."
   ],
   [
    "lotte",
    "FINN! Komm, wir müssen zum Schwarzen Brett. Die Ehlers hat den Projektplan für die Sturmnacht ausgehängt!"
   ],
   [
    "lotte",
    "„Sturmnacht – das große Herbstfest.“ Plakate macht der Kunstkurs zusammen mit dem Sportprofil …"
   ],
   [
    "lotte",
    "Gruppe F: Finn Albrecht und … Ben Kowalski."
   ],
   [
    "",
    "Ben Kowalski. Siebzehn, Kapitän der Handballmannschaft, eine Narbe über der linken Augenbraue. Er hat in zwei Jahren kein einziges Mal mit Finn gesprochen."
   ],
   [
    "lotte",
    "Du kannst tauschen. Ich rede mit der Ehlers."
   ]
  ],
  choices: [
   {
    t: "„Nein. Ist nur ein Plakat.“",
    g: 10,
    r: "Es klingt ruhiger, als Finn sich fühlt. Lotte hakt sich bei ihm unter. „Ich merke immer alles. Das ist ja das Problem.“"
   },
   {
    t: "„Vielleicht … ich überleg’s mir.“",
    g: 3,
    r: "Lotte sieht ihn lange an. „Okay. Aber wenn irgendwas ist, sagst du es mir.“ Am Ende tauscht Finn nicht."
   }
  ]
 },
 {
  n: "2",
  title: "Briefe in Flaschen",
  cast: [
   "finn",
   "joerg"
  ],
  lines: [
   [
    "",
    "Samstagmorgen in der Räucherei: Buchenholz, Heilbutt und Etiketten. „Albrecht am Hafen, seit 1974.“"
   ],
   [
    "joerg",
    "Wenn mal einer anruft, der nett ist, dann darfst du ihn mitbringen. Dass das klar ist."
   ],
   [
    "",
    "Ein Satz, so beiläufig wie das Wetter. Finn muss sich sehr auf die Etiketten konzentrieren."
   ],
   [
    "",
    "Abends zeichnet er weiter an seinem Comic: Anselm, der Leuchtturmwärter, der Flaschen aus dem Meer fischt. Darin stecken Briefe von Menschen, die er nie gesehen hat."
   ],
   [
    "",
    "Unter die neue Seite schreibt ein Leser mit dem Namen halbzeit_17: „Ich warte jede Woche auf Anselm.“"
   ]
  ],
  game: "🗼 Das Leuchtturm-Licht – Spiel Anselms Nacht: Fang die Flaschenpost mit dem Lichtstrahl."
 },
 {
  n: "3",
  title: "Dreißig Zentimeter",
  cast: [
   "finn",
   "ben"
  ],
  lines: [
   [
    "ben",
    "Das ist ein Hai."
   ],
   [
    "",
    "„Das ist ein Boot“, sagt Finn. „Du hast das Boot gezeichnet.“"
   ],
   [
    "ben",
    "Ach so. Dann ist es ein Hai. … Komm, zeig mal, wie das geht. Ich lerne schnell, wenn ich’s sehe."
   ],
   [
    "",
    "Ben rückt näher. Zwischen ihren Schultern liegen höchstens dreißig Zentimeter. Plötzlich scheint das die einzige Zahl der Welt zu sein, die zählt."
   ],
   [
    "",
    "Da steht Tobi Raake in der Tür. „Na, Käpt’n? Malstunde?“"
   ],
   [
    "ben",
    "Ist nur ein Schulprojekt."
   ],
   [
    "",
    "Als wär’s nichts. Als wäre Finn nichts."
   ]
  ],
  choices: [
   {
    t: "Finn packt seine Sachen und geht.",
    g: 2,
    r: "Draußen regnet es. Finn fährt nach Hause, ohne sich umzudrehen."
   },
   {
    t: "„Das hat wehgetan, Ben.“",
    g: 9,
    r: "Ben öffnet den Mund. Schließt ihn wieder. Tobi lacht. Finn geht trotzdem – aber er hat es gesagt."
   }
  ],
  game: "🎨 Das Sturmnacht-Plakat – Setz den Plakatentwurf zusammen: Finns feine Linien und Bens wilde Wellen."
 },
 {
  n: "4",
  title: "Der Heimweg",
  cast: [
   "finn",
   "ben"
  ],
  lines: [
   [
    "",
    "Am nächsten Morgen sitzt jemand auf dem Sattel eines alten, roten Rennrads am Fahrradständer. Die Klingel ist mit Isolierband festgeklebt."
   ],
   [
    "ben",
    "Ich hab seit sieben Uhr hier gewartet. Was ich zu Tobi gesagt habe … das war scheiße. Ich hab’s nur gesagt, weil ich ein Feigling bin."
   ],
   [
    "",
    "Als es wieder zu schütten beginnt, legt Ben ihm seine Jacke über die Schultern. Sie ist warm."
   ]
  ],
  choices: [
   {
    t: "„Es heißt, dass ich dir zuhöre.“",
    g: 10,
    r: "Etwas in Bens Gesicht entspannt sich so plötzlich, dass er fast schwankt. Nach der Schule laufen sie zusammen am Deich entlang nach Hause."
   },
   {
    t: "„Ich brauch noch Zeit.“",
    g: 4,
    r: "„Okay“, sagt Ben. „Ich warte.“ Nach der Schule steht er wieder da. Sie gehen ein Stück zusammen am Deich entlang."
   }
  ],
  game: "💨 Gegenwind am Deich – Der Heimweg: Lauf mit Ben über den nassen Deich. Weich Pfützen und Treibgut aus, sammle die Laternenlichter."
 },
 {
  n: "5",
  title: "Hallenluft",
  cast: [
   "finn",
   "lotte",
   "pia",
   "ben",
   "samira"
  ],
  lines: [
   [
    "",
    "Heimspiel gegen die HSG Nordstrand. Die Halle riecht nach Gummi, Schweiß und Harz, und der Lärm ist wie eine Wand aus Watte."
   ],
   [
    "lotte",
    "Ich hab dir einen Platz in der dritten Reihe besorgt. Da siehst du alles und bist trotzdem unsichtbar."
   ],
   [
    "pia",
    "Man muss Teamgeist zeigen! Ich bin im Fanteam."
   ],
   [
    "",
    "Halbzeit, 14 : 12. Ben steht am Kreis, sieht hoch in die Menge – und sucht jemanden."
   ],
   [
    "",
    "Pia hält ihre Fahne hoch: HOPP BEN. Ben grinst und hebt die Hand. Nur ein bisschen."
   ]
  ]
 },
 {
  n: "6",
  title: "Was Samira weiß",
  cast: [
   "finn"
  ],
  lines: [
   [
    "",
    "Sonntagmorgen, eine Benachrichtigung: halbzeit_17 hat einen Kommentar hinterlassen."
   ],
   [
    "",
    "„Ich war gestern auf einem Spielfeld und hab jemanden in der Menge gesucht. Und ich hab ihn gefunden. Ich glaube, ich bin ein bisschen verliebt.“"
   ],
   [
    "",
    "Spielfeld. In der Menge. Ihn. Etwas in Finns Brustkorb macht einen schweren Schlag, wie ein Anker, der auf Grund geht."
   ],
   [
    "",
    "Auf der anderen Seite der Stadt sitzt Samira, die Torfrau, neben Ben auf der Bank. „Du guckst ihn an, als wäre er der letzte Siebenmeter der Saison.“"
   ]
  ],
  choices: [
   {
    t: "Antworten: „Wie fühlt es sich an?“",
    g: 8,
    r: "„Wie Wasser, das ich nicht trinken kann, aber sehe. Und ich bin so durstig.“ Finn muss das Handy an die Brust drücken."
   },
   {
    t: "Das Handy umdrehen. Das ist bestimmt Zufall.",
    g: 2,
    r: "Er legt das Handy hin. Dann hebt er es wieder auf. Und liest den Satz noch einmal."
   }
  ]
 },
 {
  n: "7",
  title: "Fischbrötchen",
  cast: [
   "finn",
   "ben",
   "joerg",
   "pia"
  ],
  lines: [
   [
    "joerg",
    "Du musst die Fische anfassen. Sonst weißt du nicht, wie sie sich anfühlen."
   ],
   [
    "ben",
    "Kalt. Glitschig. Ein bisschen vorwurfsvoll."
   ],
   [
    "joerg",
    "Vorwurfsvoll. Das ist gut. Das schreib ich mir auf. … Der Laden macht gleich auf. Ihr zwei übernehmt die Theke."
   ],
   [
    "",
    "Hinter der Kühlraumtür sitzt Pia und notiert alles. Finn hat Ben siebenmal angeschaut, wenn er dachte, dass keiner guckt. Ben ihn achtmal."
   ]
  ],
  game: "🐟 „Zwei mit Zwiebeln“ – Samstag in der Räucherei: Mach die Fischbrötchen genau so, wie die Kundschaft sie bestellt."
 },
 {
  n: "8",
  title: "Der Sturm",
  cast: [
   "finn",
   "lotte",
   "ben",
   "marlon"
  ],
  lines: [
   [
    "lotte",
    "Windstärke acht bis neun, in Böen zehn. Sturmflutwarnung für die gesamte Ostküste."
   ],
   [
    "",
    "Über der Bühne hängt ihr Plakat: ein Leuchtturm auf einer wilden Klippe, Finns feine Linien und Bens wilde Wellen. Zwei Hände, wie zwei Stimmen in einem Lied."
   ],
   [
    "",
    "Dann steht Marlon in der Tür. Der Mensch, der Finn am meisten verletzt hat. Und Ben, der gerade erst hereinkommt, bleibt stehen – und tritt einen Schritt zurück."
   ],
   [
    "",
    "Zu Hause wartet Anke mit einem Handtuch. Sie fragt nichts. Sie macht nur das Küchenlicht an und lässt es brennen."
   ]
  ],
  choices: [
   {
    t: "Raus. Einfach raus.",
    g: 3,
    r: "Finn läuft. Durch die Tür, über den Hof, hinaus in den Sturm."
   },
   {
    t: "„Ich gehe, aber ich komme wieder.“",
    g: 7,
    r: "Lotte nickt. Finn braucht Luft. Er läuft hinaus in den Sturm, Richtung Hafen."
   }
  ],
  game: "💨 Gegenwind am Deich – Sturmnacht: Lauf über den Deich nach Hause. Wellen schlagen über den Weg, Böen drücken dich zur Seite."
 },
 {
  n: "9",
  title: "Funkstille",
  cast: [
   "finn"
  ],
  lines: [
   [
    "",
    "Im November kommt der Nebel nach Warnholm und bleibt. Finn macht es sich zur Gewohnheit, früh zur Schule zu kommen und spät zu gehen."
   ],
   [
    "",
    "Wenn Ben fragt, sagt er: „Alles gut, Ben.“ Höflich, freundlich. Es ist das Freundlichste, was er tun kann. Und das Grausamste."
   ],
   [
    "",
    "Nachts sitzt er vor Seite 36. Anselm will sein Licht ausschalten."
   ]
  ],
  choices: [
   {
    t: "Anselm lässt das Licht an – im Nebel, wenn auch schwach.",
    g: 9,
    r: "Finn zeichnet einen dünnen, gelben Strahl in den grauen Nebel. Er weiß selbst nicht, für wen."
   },
   {
    t: "Anselm schaltet das Licht aus.",
    g: 2,
    r: "Die Seite bleibt dunkel. Aber am Ende zeichnet Finn eine einzige Flasche, die auf den Wellen treibt."
   }
  ],
  game: "🗼 Das Leuchtturm-Licht – Nebel über dem Meer: Der Strahl reicht nicht weit. Finde die Flaschen trotzdem."
 },
 {
  n: "10",
  title: "Briefe, die ankommen",
  cast: [
   "finn"
  ],
  lines: [
   [
    "",
    "Der Brief kommt an einem Dienstag, kurz nach elf. Eine ganze Seite, ohne Absätze."
   ],
   [
    "",
    "„Lieber Zeichner, ich bin siebzehn. Ich bin Kapitän einer Handballmannschaft in einer Stadt, in der Handball ungefähr so wichtig ist wie Wasser.“"
   ],
   [
    "",
    "„Ich habe jedes Mal gewusst, dass ich ruhiger werde, wenn Anselm sein Licht anmacht. Dann habe ich einen Jungen kennengelernt. Er ist ruhig. Er zeichnet.“"
   ],
   [
    "",
    "„Ich habe mich in ihn verliebt. Das weiß ich jetzt.“  – Ben"
   ]
  ],
  choices: [
   {
    t: "Antworten: „Ich bin der Junge. Und der Zeichner.“",
    g: 10,
    r: "Finn tippt, löscht, tippt. Dann drückt er auf Senden, bevor er es sich anders überlegt."
   },
   {
    t: "Noch nicht antworten. Erst muss er es ihm ins Gesicht sagen.",
    g: 6,
    r: "Finn legt das Handy weg und holt die Mappe mit allen Seiten aus dem Schrank. Er weiß jetzt, wohin er sie bringen will."
   }
  ]
 },
 {
  n: "11",
  title: "Das Geheimnis",
  cast: [
   "finn",
   "joerg",
   "ben",
   "marlon"
  ],
  lines: [
   [
    "",
    "Der Weihnachtsmarkt von Warnholm ist klein, schief und genau deshalb schön. Fünfzehn Buden auf dem Hafenplatz – und der Schnee bleibt dieses Jahr wirklich liegen."
   ],
   [
    "joerg",
    "Zwei mit Zwiebeln. … Hör auf zu grinsen. Du bist mein Sohn, ich erkenne es an den Ohren."
   ],
   [
    "joerg",
    "Ich muss kurz zum Kühlwagen. Du hast die Bude."
   ],
   [
    "",
    "Am anderen Ende des Platzes steht Marlon. Ohne Mütze, die Haare nass vom Schnee. Zum ersten Mal ohne aufgesetzten Gesichtsausdruck."
   ]
  ],
  choices: [
   {
    t: "Zu ihm hinübergehen und zuhören.",
    g: 8,
    r: "Marlon sagt, dass es ihm leidtut. Dass er Angst hatte. Finn sagt nicht, dass es okay ist. Aber er bleibt stehen, bis Marlon fertig ist."
   },
   {
    t: "Weiterarbeiten. Nicht heute.",
    g: 4,
    r: "Finn dreht sich zur Theke. Als er wieder hinsieht, ist Marlon weg. Nur seine Spuren im Schnee bleiben."
   }
  ],
  game: "🐟 „Zwei mit Zwiebeln“ – Weihnachtsmarkt: Die Schlange ist lang. Halte die Bude am Laufen, bis Jörg zurück ist."
 },
 {
  n: "12",
  title: "Der Leuchtturm",
  cast: [
   "finn",
   "ben"
  ],
  lines: [
   [
    "",
    "Der Weg nach Kap Rotenhorn: keine Bäume, keine Häuser, nur Dünengras unter dünnem Schnee. Hinter den Dünen rollt das Meer wie der Atem eines schlafenden Tieres."
   ],
   [
    "ben",
    "Du musst nichts sagen, wenn du nicht willst. Ich lauf einfach mit."
   ],
   [
    "",
    "Vor dem Turm öffnet Finn die Mappe. Siebenunddreißig Seiten. Anselm, die Flaschen, das Licht."
   ]
  ],
  choices: [
   {
    t: "„Ich bin der Zeichner. Du hast mir die ganze Zeit geschrieben.“",
    g: 10,
    r: "Ben sieht ihn an. „Ich weiß“, sagt er leise. „Ich hab’s gehofft. Seit dem Plakat.“ Dann lacht er, und Finn lacht mit, und der Wind nimmt beides mit."
   },
   {
    t: "Ihm wortlos die letzte Seite zeigen.",
    g: 8,
    r: "Ben liest. Er liest lange. Dann nimmt er Finns Hand, ganz vorsichtig, als könnte sie zerbrechen."
   }
  ],
  game: "🗼 Das Leuchtturm-Licht – Winternacht am Kap: Zeichne mit dem Licht Anselms Winterseite."
 },
 {
  n: "Fall 14",
  title: "Pia ermittelt",
  cast: [
   "pia"
  ],
  lines: [
   [
    "pia",
    "Fall 14: Der Junge mit der Wasserflasche. Ermittlerin: Pia Albrecht. Assistent: keiner. Assistenten schwatzen."
   ],
   [
    "pia",
    "Hauptverdächtiger: Finn Albrecht, mein Bruder. Tatbestand: Verliebtheit. Vermutung. Es fehlen Beweise."
   ]
  ],
  game: "🔎 Pias Fall 14 – Durchsuche Küche und Flur nach Beweisen – und löse den Fall."
 },
 {
  n: "13",
  title: "Wie man es sagt",
  cast: [
   "ben",
   "marek"
  ],
  lines: [
   [
    "",
    "Es gibt Sätze, die man hundertmal geübt hat und die im Moment der Wahrheit trotzdem aus der Tasche fallen wie Münzen mit einem Loch."
   ],
   [
    "",
    "Ende Januar, ein Dienstagabend. Marek Kowalski steht in der Garage und repariert ein Fahrrad. Immer wenn er etwas im Kopf hat, greift er nach Werkzeug."
   ],
   [
    "ben",
    "Papa. Hast du kurz Zeit?"
   ],
   [
    "marek",
    "Ich hab immer Zeit. … Dann hab ich jetzt Zeit."
   ]
  ],
  choices: [
   {
    t: "„Papa, ich habe einen Freund. Er heißt Finn.“",
    g: 10,
    r: "Marek legt den Lappen weg. „Der Junge mit dem Plakat?“ Ben nickt. „Gut“, sagt Marek. „Dann bring ihn mal mit. Und jetzt halt mal das Rad fest.“"
   },
   {
    t: "„Papa, ich bin nicht so, wie du denkst.“",
    g: 7,
    r: "„Ben“, sagt Marek, „ich bin ein Mann von vierundfünfzig Jahren. Ich denke viel. Sag mir einfach, wer du bist.“ Und Ben sagt es."
   }
  ]
 },
 {
  n: "14",
  title: "Gegenwind",
  cast: [
   "ben",
   "samira",
   "mehmet",
   "jannik",
   "tobi"
  ],
  lines: [
   [
    "",
    "Montag, achtzehn Uhr, Kabine der Handballmannschaft. Es riecht nach Harz, Deo und feuchtem Rasen. Samira nickt ihm zu: Du schaffst das."
   ],
   [
    "ben",
    "Ich bin schwul. Ich hab einen Freund. Er heißt Finn. Ich wollte, dass ihr es von mir hört."
   ],
   [
    "mehmet",
    "Und? … Wir spielen Handball. Du bist unser Käpt’n. Das ändert sich nicht. Willst du jetzt ein Trikot oder eine Rede?"
   ],
   [
    "",
    "Nicht überall weht so ein Wind. Auf dem Flur gibt es Gerede, und an Finns Spind steht eines Morgens ein hässliches Wort."
   ],
   [
    "",
    "Aber es gibt auch Gegenwind von der anderen Seite: Jemand hat das Wort am Abend schon weggewischt. Hinter der Halle sitzt Tobi auf einem Container und weiß nicht, was er gerade getan hat."
   ]
  ],
  choices: [
   {
    t: "Ben bedankt sich bei Tobi.",
    g: 8,
    r: "Tobi zuckt mit den Schultern und sieht weg. Aber er nickt. Ganz kurz."
   },
   {
    t: "Ben lässt es gut sein.",
    g: 4,
    r: "Manche Dinge muss man nicht aussprechen. Sie stehen trotzdem im Raum."
   }
  ],
  game: "💨 Gegenwind am Deich – Gegenwind: Ben läuft zum Training über den Deich. Halte durch, sammle die Lichter."
 },
 {
  n: "15",
  title: "Leuchtfeuer",
  cast: [
   "finn",
   "ben",
   "lotte",
   "samira",
   "pia",
   "tobi",
   "mehmet"
  ],
  lines: [
   [
    "",
    "Der letzte Schultag. In Kunst steht eine Eins, darunter von Frau Dr. Ehlers: „Ein Jahr, das Mut gezeigt hat. Bitte weiterzeichnen.“"
   ],
   [
    "",
    "Am Nordstrand brennt ein Feuer. Da ist Lotte mit der Kühlbox, Samira mit einem Tor aus Treibholz, Pia mit ihrem Notizheft. Und am Rand, mit einer Schüssel Kartoffelsalat: Tobi."
   ],
   [
    "tobi",
    "Es tut mir leid. Was ich gesagt hab. Ich hab Mist gebaut und weiß nicht mal richtig warum."
   ],
   [
    "ben",
    "Schau."
   ],
   [
    "",
    "Im Norden, jenseits der Dünen, blitzt ein Licht auf. Einmal. Zweimal. Der Leuchtturm Rotenhorn ist wieder in Betrieb."
   ],
   [
    "",
    "„Anselm hat sein Licht wieder“, flüstert Finn."
   ]
  ],
  choices: [
   {
    t: "„Doch, du weißt es. Du hattest Angst.“",
    g: 9,
    r: "„Falls du mal jemanden brauchst, der nicht lacht“, sagt Finn, „dann weißt du, wo du uns findest.“ Ben legt den Arm um ihn. „Und den Kartoffelsalat nehmen wir an.“"
   },
   {
    t: "„Setz dich. Das Feuer reicht für alle.“",
    g: 7,
    r: "Tobi lacht, kurz und erleichtert, und lässt sich in den Sand fallen. Niemand sagt etwas dazu, und niemand muss."
   }
  ],
  game: "🗼 Das Leuchtturm-Licht – Seite 37: Lass das Licht für beide leuchten.",
  end: true
 }
];

export const LF_PEOPLE: Record<string, { name: string; color: string; pron?: string }> = {
  finn: { name: 'Finn', color: '#f2b544', pron: 'er/ihn' }, ben: { name: 'Ben', color: '#2f8f5a', pron: 'er/ihn' }, lotte: { name: 'Lotte', color: '#ee7a1f' }, pia: { name: 'Pia', color: '#d54a6e' },
  joerg: { name: 'Jörg Albrecht', color: '#8fa0aa' }, marek: { name: 'Marek Kowalski', color: '#9a7444' }, mehmet: { name: 'Mehmet', color: '#c98b4a' }, tobi: { name: 'Tobi', color: '#c9a26a' }, samira: { name: 'Samira', color: '#1e6fb6' }, anke: { name: 'Anke Albrecht', color: '#9c5066' },
};

export const LF_START = 8;
export const lfMax = () => LF_START + LF_CHAPTERS.reduce((a, c) => a + (c.choices ? Math.max(...c.choices.map((x) => x.g)) : 0) + (c.game ? 6 : 0), 0);
export const lfPct = (g: number) => Math.max(0, Math.min(100, Math.round(g / lfMax() * 100)));
export function lfEnding(g: number) {
  const p = lfPct(g);
  if (p >= 78) return { id: 'feuer', title: 'Leuchtfeuer', text: 'Finn und Ben stehen am Wasser, und draußen glitt der Strahl über die Wellen. Gleichmäßig. Ruhig. Treu. Du hast Finn so oft mutig sein lassen, dass sein Licht für alle reicht: für Ben, für Lotte, für Pia – und sogar für Tobi.' };
  if (p >= 50) return { id: 'fenster', title: 'Ein Licht im Fenster', text: 'Nicht jeder Schritt war leicht, und manchmal hat Finn geschwiegen. Aber er ist rausgekommen, mit einem Plakat und mit einem Jungen. Im Fenster am Hafen brennt ein kleines, warmes Licht.' };
  return { id: 'strahl', title: 'Ein erster Strahl', text: 'Finn ist oft an den Rändern geblieben. Aber am Ende dieses Jahres steht er im Sand, und jemand neben ihm sieht dasselbe Licht. Das ist ein Anfang. Und manchmal reicht ein Anfang.' };
}
