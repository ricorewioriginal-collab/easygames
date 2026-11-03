// Leuchtfeuer – Spielkern ohne Grafik (Kapitel, Figuren, Spielstand und die Regeln der fünf Spiele). In Node testbar.

// ------------------------------------------------------------ Zufall (fest je Startzahl, damit Level gleich bleiben)
export function rng(seed = 1) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrapA = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

// ------------------------------------------------------------ Figuren (echte Menschen aus ../figuren/, normale Statur)
export const PEOPLE = {
  finn: { name: 'Finn', look: { body: 'm', skin: '#efc6a6', hair: { style: 'fringe', color: '#3a2a1f' }, top: '#ece4d6', topStyle: 'long', bottom: '#38435a', bottomStyle: 'pants', shoes: '#f2f2f2', size: 0.97 } },
  ben: { name: 'Ben', look: { body: 'm', skin: '#e3b38d', hair: { style: 'short', color: '#9a7444' }, top: '#e6e1d4', topStyle: 'long', coat: '#2f6b47', bottom: '#2a2f3b', bottomStyle: 'pants', shoes: '#e8e8e8', size: 1.04 } },
  lotte: { name: 'Lotte', look: { body: 'w', skin: '#f2cfb3', hair: { style: 'bob', color: '#a9471f' }, top: '#f2efe8', topStyle: 'long', coat: '#ee7a1f', bottom: '#2e3550', bottomStyle: 'pants', shoes: '#f4f4f4', size: 0.93 } },
  pia: { name: 'Pia', look: { body: 'w', skin: '#f0c9a8', hair: { style: 'pony', color: '#4a3020' }, top: '#d54a6e', topStyle: 'long', bottom: '#3b4d78', bottomStyle: 'pants', shoes: '#ffffff', size: 0.84 } },
  joerg: { name: 'Jörg Albrecht', look: { body: 'm', skin: '#dfae8a', hair: { style: 'short', color: '#6e6b68' }, top: '#5d6a73', topStyle: 'long', coat: '#e8e6e0', coatFab: 'cotton', bottom: '#2f3034', bottomStyle: 'pants', shoes: '#2f4a2c', beard: '#6e6b68', size: 1.01 } },
  anke: { name: 'Anke Albrecht', look: { body: 'w', skin: '#eac09e', hair: { style: 'bob', color: '#76502f' }, top: '#9c5066', topStyle: 'long', bottom: '#3c394a', bottomStyle: 'pants', shoes: '#2b2219' } },
  samira: { name: 'Samira', look: { body: 'w', skin: '#8f5b40', hair: { style: 'curly', color: '#120d0b' }, top: '#1e6fb6', topStyle: 'long', bottom: '#15161a', bottomStyle: 'pants', shoes: '#f2f2f2' } },
  tobi: { name: 'Tobi', look: { body: 'm', skin: '#efc6a3', hair: { style: 'short', color: '#c9a26a' }, top: '#7a2330', topStyle: 'long', bottom: '#2b303c', bottomStyle: 'pants', shoes: '#eeeeee' } },
  marlon: { name: 'Marlon', look: { body: 'm', skin: '#e7bd9a', hair: { style: 'fringe', color: '#15100d' }, top: '#8a8f9a', topStyle: 'long', coat: '#24272e', bottom: '#1b1d22', bottomStyle: 'pants', shoes: '#151515' } },
  marek: { name: 'Marek Kowalski', look: { body: 'm', skin: '#e0b090', hair: { style: 'buzz', color: '#5a5550' }, top: '#2d4a78', topStyle: 'long', bottom: '#2f3138', bottomStyle: 'pants', shoes: '#222222', beard: '#5a5550', size: 1.03 } },
  ehlers: { name: 'Frau Dr. Ehlers', look: { body: 'w', skin: '#ebc4a4', hair: { style: 'bun', color: '#b9b1a6' }, top: '#7b3f9c', topStyle: 'long', bottom: '#30303a', bottomStyle: 'pants', shoes: '#1d1d1d' } },
  mehmet: { name: 'Mehmet', look: { body: 'm', skin: '#b47c58', hair: { style: 'curly', color: '#120e0b' }, top: '#1f5a3a', topStyle: 'tee', bottom: '#14161a', bottomStyle: 'shorts', shoes: '#f4f4f4', size: 1.03 } },
  jannik: { name: 'Jannik', look: { body: 'm', skin: '#efc8a8', hair: { style: 'spiky', color: '#d2b07a' }, top: '#1f5a3a', topStyle: 'tee', bottom: '#14161a', bottomStyle: 'shorts', shoes: '#f4f4f4' } },
  kunde1: { name: 'Kundin', look: { body: 'w', skin: '#e8c0a0', hair: { style: 'long', color: '#2b1d14' }, top: '#3b6a8f', topStyle: 'long', bottom: '#2a2a33', bottomStyle: 'pants', shoes: '#1b1b1b' } },
  kunde2: { name: 'Kunde', look: { body: 'm', skin: '#c8926b', hair: { style: 'short', color: '#1a1410' }, top: '#8a5a2b', topStyle: 'long', bottom: '#30323a', bottomStyle: 'pants', shoes: '#2a2a2a', beard: '#1a1410' } },
  kunde3: { name: 'Kundin', look: { body: 'w', skin: '#f3d3bb', hair: { style: 'bun', color: '#d9d2c8' }, top: '#5f7d4a', topStyle: 'long', bottom: '#3a3640', bottomStyle: 'pants', shoes: '#3a2a20', size: 0.95 } },
  kunde4: { name: 'Kunde', look: { body: 'm', skin: '#f0c8a8', hair: { style: 'curly', color: '#6b3d1e' }, top: '#c9c3b5', topStyle: 'long', bottom: '#2c3a55', bottomStyle: 'pants', shoes: '#f0f0f0' } },
  kunde5: { name: 'Kundin', look: { body: 'w', skin: '#7a4e36', hair: { style: 'bob', color: '#0e0a08' }, top: '#b23a3a', topStyle: 'long', bottom: '#202430', bottomStyle: 'pants', shoes: '#f4f4f4' } }
};
export const WINTER = { ben: { hat: { type: 'beanie', color: '#c23a3a' } }, finn: { hat: { type: 'beanie', color: '#2b4a7a' } } };

// ------------------------------------------------------------ Leuchtkraft (Mut) 0 … 100
export const GLOW_START = 8;
export const clampGlow = v => clamp(Math.round(v), 0, 999);
export const glowPct = raw => clamp(Math.round(raw / maxStoryGlow() * 100), 0, 100);
export function ending(g) {
  if (g >= 78) return { id: 'feuer', title: 'Leuchtfeuer', text: 'Finn und Ben stehen am Wasser, und draußen glitt der Strahl über die Wellen. Gleichmäßig. Ruhig. Treu. Du hast Finn so oft mutig sein lassen, dass sein Licht für alle reicht: für Ben, für Lotte, für Pia – und sogar für Tobi.' };
  if (g >= 50) return { id: 'fenster', title: 'Ein Licht im Fenster', text: 'Nicht jeder Schritt war leicht, und manchmal hat Finn geschwiegen. Aber er ist rausgekommen, mit einem Plakat und mit einem Jungen. Im Fenster am Hafen brennt ein kleines, warmes Licht.' };
  return { id: 'strahl', title: 'Ein erster Strahl', text: 'Finn ist oft an den Rändern geblieben. Aber am Ende dieses Jahres steht er im Sand, und jemand neben ihm sieht dasselbe Licht. Das ist ein Anfang. Und manchmal reicht ein Anfang.' };
}

// ------------------------------------------------------------ Geschichte
// Zeile: [sprecher, text]  (''= Erzähler).  game: { k: 'beam'|'poster'|'booth'|'run'|'case', lvl }
export const CHAPTERS = [
  { n: '1', title: 'Der erste Tag', set: 'schule', cast: ['finn', 'lotte'], player: 'finn',
    lines: [['', 'Warnholm riecht nach Rauch und Salz. Immer. Auch an diesem ersten Schultag nach den Sommerferien.'],
      ['', 'Finn Albrecht kommt wie immer zehn Minuten zu früh. Er ist einer, der an den Rändern geht. An den Rändern wird man selten angerempelt.'],
      ['lotte', 'FINN! Komm, wir müssen zum Schwarzen Brett. Die Ehlers hat den Projektplan für die Sturmnacht ausgehängt!']],
    obj: 'Geh mit Lotte zum Schwarzen Brett im Schulhof.', goal: 'brett',
    after: [['lotte', '„Sturmnacht – das große Herbstfest.“ Plakate macht der Kunstkurs zusammen mit dem Sportprofil …'],
      ['lotte', 'Gruppe F: Finn Albrecht und … Ben Kowalski.'],
      ['', 'Ben Kowalski. Siebzehn, Kapitän der Handballmannschaft, eine Narbe über der linken Augenbraue. Er hat in zwei Jahren kein einziges Mal mit Finn gesprochen.'],
      ['lotte', 'Du kannst tauschen. Ich rede mit der Ehlers.']],
    choices: [{ t: '„Nein. Ist nur ein Plakat.“', g: 10, r: 'Es klingt ruhiger, als Finn sich fühlt. Lotte hakt sich bei ihm unter. „Ich merke immer alles. Das ist ja das Problem.“' },
      { t: '„Vielleicht … ich überleg’s mir.“', g: 3, r: 'Lotte sieht ihn lange an. „Okay. Aber wenn irgendwas ist, sagst du es mir.“ Am Ende tauscht Finn nicht.' }] },
  { n: '2', title: 'Briefe in Flaschen', set: 'raeucherei', cast: ['finn', 'joerg'], player: 'finn',
    lines: [['', 'Samstagmorgen in der Räucherei: Buchenholz, Heilbutt und Etiketten. „Albrecht am Hafen, seit 1974.“'],
      ['joerg', 'Wenn mal einer anruft, der nett ist, dann darfst du ihn mitbringen. Dass das klar ist.'],
      ['', 'Ein Satz, so beiläufig wie das Wetter. Finn muss sich sehr auf die Etiketten konzentrieren.'],
      ['', 'Abends zeichnet er weiter an seinem Comic: Anselm, der Leuchtturmwärter, der Flaschen aus dem Meer fischt. Darin stecken Briefe von Menschen, die er nie gesehen hat.']],
    game: { k: 'beam', lvl: 0 }, gameLine: 'Spiel Anselms Nacht: Fang die Flaschenpost mit dem Lichtstrahl.',
    after: [['', 'Unter die neue Seite schreibt ein Leser mit dem Namen halbzeit_17: „Ich warte jede Woche auf Anselm.“']] },
  { n: '3', title: 'Dreißig Zentimeter', set: 'kunstraum', cast: ['finn', 'ben'], player: 'finn',
    lines: [['ben', 'Das ist ein Hai.'], ['', '„Das ist ein Boot“, sagt Finn. „Du hast das Boot gezeichnet.“'], ['ben', 'Ach so. Dann ist es ein Hai. … Komm, zeig mal, wie das geht. Ich lerne schnell, wenn ich’s sehe.'],
      ['', 'Ben rückt näher. Zwischen ihren Schultern liegen höchstens dreißig Zentimeter. Plötzlich scheint das die einzige Zahl der Welt zu sein, die zählt.']],
    game: { k: 'poster', lvl: 0 }, gameLine: 'Setz den Plakatentwurf zusammen: Finns feine Linien und Bens wilde Wellen.',
    after: [['', 'Da steht Tobi Raake in der Tür. „Na, Käpt’n? Malstunde?“'], ['ben', 'Ist nur ein Schulprojekt.'], ['', 'Als wär’s nichts. Als wäre Finn nichts.']],
    choices: [{ t: 'Finn packt seine Sachen und geht.', g: 2, r: 'Draußen regnet es. Finn fährt nach Hause, ohne sich umzudrehen.' },
      { t: '„Das hat wehgetan, Ben.“', g: 9, r: 'Ben öffnet den Mund. Schließt ihn wieder. Tobi lacht. Finn geht trotzdem – aber er hat es gesagt.' }] },
  { n: '4', title: 'Der Heimweg', set: 'schule', cast: ['finn', 'ben'], player: 'finn', at: 'rad',
    lines: [['', 'Am nächsten Morgen sitzt jemand auf dem Sattel eines alten, roten Rennrads am Fahrradständer. Die Klingel ist mit Isolierband festgeklebt.'],
      ['ben', 'Ich hab seit sieben Uhr hier gewartet. Was ich zu Tobi gesagt habe … das war scheiße. Ich hab’s nur gesagt, weil ich ein Feigling bin.']],
    choices: [{ t: '„Es heißt, dass ich dir zuhöre.“', g: 10, r: 'Etwas in Bens Gesicht entspannt sich so plötzlich, dass er fast schwankt. Nach der Schule laufen sie zusammen am Deich entlang nach Hause.' },
      { t: '„Ich brauch noch Zeit.“', g: 4, r: '„Okay“, sagt Ben. „Ich warte.“ Nach der Schule steht er wieder da. Sie gehen ein Stück zusammen am Deich entlang.' }],
    game: { k: 'run', lvl: 0 }, gameLine: 'Der Heimweg: Lauf mit Ben über den nassen Deich. Weich Pfützen und Treibgut aus, sammle die Laternenlichter.',
    after: [['', 'Als es wieder zu schütten beginnt, legt Ben ihm seine Jacke über die Schultern. Sie ist warm.']] },
  { n: '5', title: 'Hallenluft', set: 'halle', cast: ['finn', 'lotte', 'pia', 'ben', 'samira'], player: 'finn',
    lines: [['', 'Heimspiel gegen die HSG Nordstrand. Die Halle riecht nach Gummi, Schweiß und Harz, und der Lärm ist wie eine Wand aus Watte.'],
      ['lotte', 'Ich hab dir einen Platz in der dritten Reihe besorgt. Da siehst du alles und bist trotzdem unsichtbar.'],
      ['pia', 'Man muss Teamgeist zeigen! Ich bin im Fanteam.']],
    obj: 'Such dir mit Lotte und Pia einen Platz auf der Tribüne.', goal: 'tribuene',
    after: [['', 'Halbzeit, 14 : 12. Ben steht am Kreis, sieht hoch in die Menge – und sucht jemanden.'], ['', 'Pia hält ihre Fahne hoch: HOPP BEN. Ben grinst und hebt die Hand. Nur ein bisschen.']] },
  { n: '6', title: 'Was Samira weiß', set: 'zimmer', cast: ['finn'], player: 'finn',
    lines: [['', 'Sonntagmorgen, eine Benachrichtigung: halbzeit_17 hat einen Kommentar hinterlassen.'],
      ['', '„Ich war gestern auf einem Spielfeld und hab jemanden in der Menge gesucht. Und ich hab ihn gefunden. Ich glaube, ich bin ein bisschen verliebt.“'],
      ['', 'Spielfeld. In der Menge. Ihn. Etwas in Finns Brustkorb macht einen schweren Schlag, wie ein Anker, der auf Grund geht.']],
    choices: [{ t: 'Antworten: „Wie fühlt es sich an?“', g: 8, r: '„Wie Wasser, das ich nicht trinken kann, aber sehe. Und ich bin so durstig.“ Finn muss das Handy an die Brust drücken.' },
      { t: 'Das Handy umdrehen. Das ist bestimmt Zufall.', g: 2, r: 'Er legt das Handy hin. Dann hebt er es wieder auf. Und liest den Satz noch einmal.' }],
    after: [['', 'Auf der anderen Seite der Stadt sitzt Samira, die Torfrau, neben Ben auf der Bank. „Du guckst ihn an, als wäre er der letzte Siebenmeter der Saison.“']] },
  { n: '7', title: 'Fischbrötchen', set: 'raeucherei', cast: ['finn', 'ben', 'joerg', 'pia'], player: 'finn',
    lines: [['joerg', 'Du musst die Fische anfassen. Sonst weißt du nicht, wie sie sich anfühlen.'],
      ['ben', 'Kalt. Glitschig. Ein bisschen vorwurfsvoll.'],
      ['joerg', 'Vorwurfsvoll. Das ist gut. Das schreib ich mir auf. … Der Laden macht gleich auf. Ihr zwei übernehmt die Theke.']],
    game: { k: 'booth', lvl: 0 }, gameLine: 'Samstag in der Räucherei: Mach die Fischbrötchen genau so, wie die Kundschaft sie bestellt.',
    after: [['', 'Hinter der Kühlraumtür sitzt Pia und notiert alles. Finn hat Ben siebenmal angeschaut, wenn er dachte, dass keiner guckt. Ben ihn achtmal.']] },
  { n: '8', title: 'Der Sturm', set: 'aula', cast: ['finn', 'lotte', 'ben', 'marlon'], player: 'finn', storm: true,
    lines: [['lotte', 'Windstärke acht bis neun, in Böen zehn. Sturmflutwarnung für die gesamte Ostküste.'],
      ['', 'Über der Bühne hängt ihr Plakat: ein Leuchtturm auf einer wilden Klippe, Finns feine Linien und Bens wilde Wellen. Zwei Hände, wie zwei Stimmen in einem Lied.'],
      ['', 'Dann steht Marlon in der Tür. Der Mensch, der Finn am meisten verletzt hat. Und Ben, der gerade erst hereinkommt, bleibt stehen – und tritt einen Schritt zurück.']],
    choices: [{ t: 'Raus. Einfach raus.', g: 3, r: 'Finn läuft. Durch die Tür, über den Hof, hinaus in den Sturm.' },
      { t: '„Ich gehe, aber ich komme wieder.“', g: 7, r: 'Lotte nickt. Finn braucht Luft. Er läuft hinaus in den Sturm, Richtung Hafen.' }],
    game: { k: 'run', lvl: 1 }, gameLine: 'Sturmnacht: Lauf über den Deich nach Hause. Wellen schlagen über den Weg, Böen drücken dich zur Seite.',
    after: [['', 'Zu Hause wartet Anke mit einem Handtuch. Sie fragt nichts. Sie macht nur das Küchenlicht an und lässt es brennen.']] },
  { n: '9', title: 'Funkstille', set: 'zimmer', cast: ['finn'], player: 'finn', fog: true,
    lines: [['', 'Im November kommt der Nebel nach Warnholm und bleibt. Finn macht es sich zur Gewohnheit, früh zur Schule zu kommen und spät zu gehen.'],
      ['', 'Wenn Ben fragt, sagt er: „Alles gut, Ben.“ Höflich, freundlich. Es ist das Freundlichste, was er tun kann. Und das Grausamste.'],
      ['', 'Nachts sitzt er vor Seite 36. Anselm will sein Licht ausschalten.']],
    choices: [{ t: 'Anselm lässt das Licht an – im Nebel, wenn auch schwach.', g: 9, r: 'Finn zeichnet einen dünnen, gelben Strahl in den grauen Nebel. Er weiß selbst nicht, für wen.' },
      { t: 'Anselm schaltet das Licht aus.', g: 2, r: 'Die Seite bleibt dunkel. Aber am Ende zeichnet Finn eine einzige Flasche, die auf den Wellen treibt.' }],
    game: { k: 'beam', lvl: 1 }, gameLine: 'Nebel über dem Meer: Der Strahl reicht nicht weit. Finde die Flaschen trotzdem.' },
  { n: '10', title: 'Briefe, die ankommen', set: 'zimmer', cast: ['finn'], player: 'finn', night: true,
    lines: [['', 'Der Brief kommt an einem Dienstag, kurz nach elf. Eine ganze Seite, ohne Absätze.'],
      ['', '„Lieber Zeichner, ich bin siebzehn. Ich bin Kapitän einer Handballmannschaft in einer Stadt, in der Handball ungefähr so wichtig ist wie Wasser.“'],
      ['', '„Ich habe jedes Mal gewusst, dass ich ruhiger werde, wenn Anselm sein Licht anmacht. Dann habe ich einen Jungen kennengelernt. Er ist ruhig. Er zeichnet.“'],
      ['', '„Ich habe mich in ihn verliebt. Das weiß ich jetzt.“  – Ben']],
    choices: [{ t: 'Antworten: „Ich bin der Junge. Und der Zeichner.“', g: 10, r: 'Finn tippt, löscht, tippt. Dann drückt er auf Senden, bevor er es sich anders überlegt.' },
      { t: 'Noch nicht antworten. Erst muss er es ihm ins Gesicht sagen.', g: 6, r: 'Finn legt das Handy weg und holt die Mappe mit allen Seiten aus dem Schrank. Er weiß jetzt, wohin er sie bringen will.' }] },
  { n: '11', title: 'Das Geheimnis', set: 'markt', cast: ['finn', 'joerg', 'ben', 'marlon'], player: 'finn', winter: true,
    lines: [['', 'Der Weihnachtsmarkt von Warnholm ist klein, schief und genau deshalb schön. Fünfzehn Buden auf dem Hafenplatz – und der Schnee bleibt dieses Jahr wirklich liegen.'],
      ['joerg', 'Zwei mit Zwiebeln. … Hör auf zu grinsen. Du bist mein Sohn, ich erkenne es an den Ohren.'],
      ['joerg', 'Ich muss kurz zum Kühlwagen. Du hast die Bude.']],
    game: { k: 'booth', lvl: 1 }, gameLine: 'Weihnachtsmarkt: Die Schlange ist lang. Halte die Bude am Laufen, bis Jörg zurück ist.',
    after: [['', 'Am anderen Ende des Platzes steht Marlon. Ohne Mütze, die Haare nass vom Schnee. Zum ersten Mal ohne aufgesetzten Gesichtsausdruck.']],
    choices: [{ t: 'Zu ihm hinübergehen und zuhören.', g: 8, r: 'Marlon sagt, dass es ihm leidtut. Dass er Angst hatte. Finn sagt nicht, dass es okay ist. Aber er bleibt stehen, bis Marlon fertig ist.' },
      { t: 'Weiterarbeiten. Nicht heute.', g: 4, r: 'Finn dreht sich zur Theke. Als er wieder hinsieht, ist Marlon weg. Nur seine Spuren im Schnee bleiben.' }] },
  { n: '12', title: 'Der Leuchtturm', set: 'kap', cast: ['finn', 'ben'], player: 'finn', winter: true,
    lines: [['', 'Der Weg nach Kap Rotenhorn: keine Bäume, keine Häuser, nur Dünengras unter dünnem Schnee. Hinter den Dünen rollt das Meer wie der Atem eines schlafenden Tieres.'],
      ['ben', 'Du musst nichts sagen, wenn du nicht willst. Ich lauf einfach mit.']],
    obj: 'Geh mit Ben durch den Schnee bis zum alten Leuchtturm.', goal: 'turm',
    after: [['', 'Vor dem Turm öffnet Finn die Mappe. Siebenunddreißig Seiten. Anselm, die Flaschen, das Licht.']],
    choices: [{ t: '„Ich bin der Zeichner. Du hast mir die ganze Zeit geschrieben.“', g: 10, r: 'Ben sieht ihn an. „Ich weiß“, sagt er leise. „Ich hab’s gehofft. Seit dem Plakat.“ Dann lacht er, und Finn lacht mit, und der Wind nimmt beides mit.' },
      { t: 'Ihm wortlos die letzte Seite zeigen.', g: 8, r: 'Ben liest. Er liest lange. Dann nimmt er Finns Hand, ganz vorsichtig, als könnte sie zerbrechen.' }],
    game: { k: 'beam', lvl: 2 }, gameLine: 'Winternacht am Kap: Zeichne mit dem Licht Anselms Winterseite.' },
  { n: 'Fall 14', title: 'Pia ermittelt', set: 'kueche', cast: ['pia'], player: 'pia',
    lines: [['pia', 'Fall 14: Der Junge mit der Wasserflasche. Ermittlerin: Pia Albrecht. Assistent: keiner. Assistenten schwatzen.'],
      ['pia', 'Hauptverdächtiger: Finn Albrecht, mein Bruder. Tatbestand: Verliebtheit. Vermutung. Es fehlen Beweise.']],
    game: { k: 'case', lvl: 0 }, gameLine: 'Durchsuche Küche und Flur nach Beweisen – und löse den Fall.' },
  { n: '13', title: 'Wie man es sagt', set: 'garage', cast: ['ben', 'marek'], player: 'ben', night: true,
    lines: [['', 'Es gibt Sätze, die man hundertmal geübt hat und die im Moment der Wahrheit trotzdem aus der Tasche fallen wie Münzen mit einem Loch.'],
      ['', 'Ende Januar, ein Dienstagabend. Marek Kowalski steht in der Garage und repariert ein Fahrrad. Immer wenn er etwas im Kopf hat, greift er nach Werkzeug.'],
      ['ben', 'Papa. Hast du kurz Zeit?'], ['marek', 'Ich hab immer Zeit. … Dann hab ich jetzt Zeit.']],
    obj: 'Geh zu deinem Vater an die Werkbank.', goal: 'werkbank',
    choices: [{ t: '„Papa, ich habe einen Freund. Er heißt Finn.“', g: 10, r: 'Marek legt den Lappen weg. „Der Junge mit dem Plakat?“ Ben nickt. „Gut“, sagt Marek. „Dann bring ihn mal mit. Und jetzt halt mal das Rad fest.“' },
      { t: '„Papa, ich bin nicht so, wie du denkst.“', g: 7, r: '„Ben“, sagt Marek, „ich bin ein Mann von vierundfünfzig Jahren. Ich denke viel. Sag mir einfach, wer du bist.“ Und Ben sagt es.' }] },
  { n: '14', title: 'Gegenwind', set: 'kabine', cast: ['ben', 'samira', 'mehmet', 'jannik', 'tobi'], player: 'ben',
    lines: [['', 'Montag, achtzehn Uhr, Kabine der Handballmannschaft. Es riecht nach Harz, Deo und feuchtem Rasen. Samira nickt ihm zu: Du schaffst das.'],
      ['ben', 'Ich bin schwul. Ich hab einen Freund. Er heißt Finn. Ich wollte, dass ihr es von mir hört.'],
      ['mehmet', 'Und? … Wir spielen Handball. Du bist unser Käpt’n. Das ändert sich nicht. Willst du jetzt ein Trikot oder eine Rede?']],
    after: [['', 'Nicht überall weht so ein Wind. Auf dem Flur gibt es Gerede, und an Finns Spind steht eines Morgens ein hässliches Wort.'],
      ['', 'Aber es gibt auch Gegenwind von der anderen Seite: Jemand hat das Wort am Abend schon weggewischt. Hinter der Halle sitzt Tobi auf einem Container und weiß nicht, was er gerade getan hat.']],
    game: { k: 'run', lvl: 2 }, gameLine: 'Gegenwind: Ben läuft zum Training über den Deich. Halte durch, sammle die Lichter.',
    choices: [{ t: 'Ben bedankt sich bei Tobi.', g: 8, r: 'Tobi zuckt mit den Schultern und sieht weg. Aber er nickt. Ganz kurz.' },
      { t: 'Ben lässt es gut sein.', g: 4, r: 'Manche Dinge muss man nicht aussprechen. Sie stehen trotzdem im Raum.' }] },
  { n: '15', title: 'Leuchtfeuer', set: 'strand', cast: ['finn', 'ben', 'lotte', 'samira', 'pia', 'tobi', 'mehmet'], player: 'finn', dusk: true,
    lines: [['', 'Der letzte Schultag. In Kunst steht eine Eins, darunter von Frau Dr. Ehlers: „Ein Jahr, das Mut gezeigt hat. Bitte weiterzeichnen.“'],
      ['', 'Am Nordstrand brennt ein Feuer. Da ist Lotte mit der Kühlbox, Samira mit einem Tor aus Treibholz, Pia mit ihrem Notizheft. Und am Rand, mit einer Schüssel Kartoffelsalat: Tobi.'],
      ['tobi', 'Es tut mir leid. Was ich gesagt hab. Ich hab Mist gebaut und weiß nicht mal richtig warum.']],
    choices: [{ t: '„Doch, du weißt es. Du hattest Angst.“', g: 9, r: '„Falls du mal jemanden brauchst, der nicht lacht“, sagt Finn, „dann weißt du, wo du uns findest.“ Ben legt den Arm um ihn. „Und den Kartoffelsalat nehmen wir an.“' },
      { t: '„Setz dich. Das Feuer reicht für alle.“', g: 7, r: 'Tobi lacht, kurz und erleichtert, und lässt sich in den Sand fallen. Niemand sagt etwas dazu, und niemand muss.' }],
    obj: 'Geh mit Ben hinunter ans Wasser.', goal: 'wasser', objAfterChoice: true,
    after: [['ben', 'Schau.'], ['', 'Im Norden, jenseits der Dünen, blitzt ein Licht auf. Einmal. Zweimal. Der Leuchtturm Rotenhorn ist wieder in Betrieb.'],
      ['', '„Anselm hat sein Licht wieder“, flüstert Finn.']],
    game: { k: 'beam', lvl: 3 }, gameLine: 'Seite 37: Lass das Licht für beide leuchten.', end: true }
];

// Ablauf je Kapitel (Reihenfolge der Teile) und wer beim Laufen mitgeht
export const FLOW = [
  { flow: ['lines', 'explore', 'after', 'choices'], follow: ['lotte'] },
  { flow: ['lines', 'game', 'after'] },
  { flow: ['lines', 'game', 'after', 'choices'] },
  { flow: ['lines', 'choices', 'game', 'after'] },
  { flow: ['lines', 'explore', 'after'], follow: ['lotte', 'pia'] },
  { flow: ['lines', 'choices', 'after'] },
  { flow: ['lines', 'game', 'after'] },
  { flow: ['lines', 'choices', 'game', 'after'] },
  { flow: ['lines', 'choices', 'game'] },
  { flow: ['lines', 'choices'] },
  { flow: ['lines', 'game', 'after', 'choices'] },
  { flow: ['lines', 'explore', 'after', 'choices', 'game'], follow: ['ben'] },
  { flow: ['lines', 'game'] },
  { flow: ['lines', 'explore', 'choices'] },
  { flow: ['lines', 'after', 'game', 'choices'], runner: 'ben' },
  { flow: ['lines', 'choices', 'explore', 'after', 'game'], follow: ['ben'] }
];

// ------------------------------------------------------------ Spielstand
export function newSave() {
  return { v: 1, glowBest: 0, story: { done: 0, endings: [], resume: null }, best: { beam: [0, 0, 0, 0, 0], poster: [0, 0, 0], booth: [0, 0], run: [0, 0, 0, 0], case: 0 }, letters: [], clues: [], opt: { sfx: true, music: true, quality: 'auto', diff: 'normal' } };
}
export function fixSave(s) {
  const d = newSave(); if (!s || typeof s !== 'object' || s.v !== 1) return d;
  const out = Object.assign(d, s); out.story = Object.assign(newSave().story, s.story || {}); out.opt = Object.assign(newSave().opt, s.opt || {});
  const b = newSave().best; out.best = Object.assign(b, s.best || {});
  const fresh = newSave().best; for (const k of ['beam', 'poster', 'booth', 'run']) { const def = fresh[k]; out.best[k] = def.map((_, i) => +((s.best && s.best[k] && s.best[k][i]) || 0)); }
  if (!Array.isArray(out.letters)) out.letters = []; if (!Array.isArray(out.clues)) out.clues = [];
  if (out.story.resume && !(out.story.resume.i >= 0 && out.story.resume.i < CHAPTERS.length)) out.story.resume = null;
  return out;
}
export const DIFF = { leicht: { name: 'Leicht', k: 0.75 }, normal: { name: 'Normal', k: 1 }, schwer: { name: 'Schwer', k: 1.3 } };
export const stars3 = (v, a, b, c) => v >= c ? 3 : v >= b ? 2 : v >= a ? 1 : 0;

// ============================================================ 1) Leuchtturm – Briefe in Flaschen
// Strahl dreht sich um den Turm (Winkel 0 = geradeaus aufs Meer). Flaschen treiben im Wasser: lange genug angestrahlt → gefangen.
// Kutter fahren quer vorbei: einmal lange genug anleuchten → sicher geleitet. Nebel verkürzt die Reichweite, ein Lichtblitz (Space/X) hilft kurz.
export const BEAM_LEVELS = [
  { id: 'herbst', name: 'Herbstnacht', time: 75, range: 46, width: 0.34, bottles: 9, ships: 2, fog: 0, sky: 'night', sea: 'calm' },
  { id: 'nebel', name: 'Novembernebel', time: 80, range: 24, width: 0.4, bottles: 10, ships: 3, fog: 1, sky: 'fog', sea: 'calm' },
  { id: 'winter', name: 'Winterseite', time: 80, range: 42, width: 0.32, bottles: 11, ships: 3, fog: 0.3, sky: 'snow', sea: 'rough' },
  { id: 'sommer', name: 'Seite 37 – Für beide', time: 90, range: 50, width: 0.36, bottles: 12, ships: 3, fog: 0, sky: 'dusk', sea: 'calm', finale: true },
  { id: 'sturm', name: 'Sturmflut', time: 90, range: 38, width: 0.3, bottles: 14, ships: 5, fog: 0.5, sky: 'storm', sea: 'storm' }
];
export const LETTERS = [
  'Lieber Anselm, ich warte jede Woche auf dein Licht.', 'Ich habe heute jemanden in der Menge gesucht. Und gefunden.', 'Wie Wasser, das ich nicht trinken kann, aber sehe.',
  'Manchmal ist Höflichkeit nur eine Tür, die leise zugeht.', 'Ich habe ein Poster, das ich nicht aufgehängt habe, aber nie abgenommen habe.', 'Es gibt Räume in mir, die ich nie betreten habe.',
  'Wenn du dein Licht anmachst, werde ich ruhiger.', 'Ich bin ein schlechter Zeichner. Aber ein guter Zuschauer.', 'Bitte schalt dein Licht nicht aus.',
  'Du hast mir einen Namen gegeben, für etwas, das ich nicht benennen konnte.', 'Es gibt Briefe, die ankommen, auch wenn man den Absender nie gesehen hat.', 'Ich bin hier. Du bist hier. Das reicht.'
];
export function newBeam(lvl, opt = {}) {
  const L = BEAM_LEVELS[lvl] || BEAM_LEVELS[0], k = (DIFF[opt.diff] || DIFF.normal).k, r = rng(101 + lvl * 37 + (opt.seed || 0));
  const s = { lvl, L, t: 0, dur: L.time, angle: 0, vel: 0, range: L.range, width: L.width, flash: 0, flashCd: 0, bottles: [], ships: [], caught: 0, guided: 0, lost: 0,
    score: 0, combo: 0, ev: [], over: false, total: Math.round(L.bottles), letters: [], r, k, spawnB: 0, spawnS: 0, nextId: 1 };
  // Flaschen kommen über die Zeit verteilt (Anteil i/n der Spielzeit), Kutter ebenso
  s.planB = Array.from({ length: s.total }, (_, i) => (i / s.total) * L.time * 0.85 + r() * 3);
  s.planS = Array.from({ length: L.ships }, (_, i) => 6 + (i / L.ships) * L.time * 0.8 + r() * 4);
  return s;
}
const ARC = 1.25;   // sichtbarer Bereich: ± 1,25 rad
export function beamInput(s, dir, dt) {   // dir −1…1 (Stick, Pfeile)
  const acc = 7.5, max = 1.7;
  s.vel += dir * acc * dt; s.vel *= Math.pow(0.02, dt); s.vel = clamp(s.vel, -max, max);
  s.angle = clamp(s.angle + s.vel * dt, -ARC, ARC); if (Math.abs(s.angle) >= ARC) s.vel = 0;
}
export function beamAim(s, a, dt) { const d = clamp(a, -ARC, ARC) - s.angle; s.vel = clamp(d / Math.max(dt, 0.016), -2.2, 2.2); s.angle += s.vel * dt; }
export function beamFlash(s) { if (s.flashCd > 0 || s.over) return false; s.flash = 1.2; s.flashCd = 6; s.ev.push({ k: 'flash' }); return true; }
export function beamRange(s) { return s.range * (s.flash > 0 ? 1.55 : 1); }
export function beamWidth(s) { return s.width * (s.flash > 0 ? 1.3 : 1); }
export function lit(s, o) { return Math.abs(wrapA(o.a - s.angle)) < beamWidth(s) / 2 + 1.2 / Math.max(6, o.d) && o.d < beamRange(s); }
export function beamTick(s, dt) {
  if (s.over) return;
  s.t += dt; s.flash = Math.max(0, s.flash - dt); s.flashCd = Math.max(0, s.flashCd - dt);
  const r = s.r, L = s.L;
  while (s.spawnB < s.planB.length && s.planB[s.spawnB] <= s.t) {
    s.spawnB++; const far = L.fog ? 0.55 : 1;
    s.bottles.push({ id: s.nextId++, a: (r() * 2 - 1) * (ARC - 0.12), d: (14 + r() * 40) * far + 6, va: (r() - 0.5) * 0.05, vd: -(0.6 + r() * 0.9) * s.k, glow: 0, life: (24 + r() * 10) / s.k, bob: r() * 6 });
  }
  while (s.spawnS < s.planS.length && s.planS[s.spawnS] <= s.t) {
    s.spawnS++; const side = r() < 0.5 ? -1 : 1;
    s.ships.push({ id: s.nextId++, a: side * (ARC + 0.1), d: 22 + r() * 22, va: -side * (0.05 + r() * 0.03) * s.k, glow: 0, done: false });
  }
  for (const b of s.bottles) {
    b.a += b.va * dt; b.d = Math.max(4, b.d + b.vd * dt); b.life -= dt;
    if (lit(s, b)) { b.glow += dt * (s.flash > 0 ? 2.2 : 1); if (b.glow >= 0.7) { b.got = true; s.caught++; s.combo++; const pts = 100 + Math.min(10, s.combo) * 20; s.score += pts; const li = s.letters.length; s.letters.push(li); s.ev.push({ k: 'bottle', id: b.id, pts, letter: li }); } }
    else b.glow = Math.max(0, b.glow - dt * 0.5);
    if (!b.got && b.life <= 0) { b.gone = true; s.combo = 0; s.ev.push({ k: 'sink', id: b.id }); }
  }
  s.bottles = s.bottles.filter(b => !b.got && !b.gone);
  for (const sh of s.ships) {
    sh.a += sh.va * dt;
    if (!sh.done && lit(s, sh)) { sh.glow += dt; if (sh.glow >= 1.1) { sh.done = true; s.guided++; s.score += 250; s.ev.push({ k: 'ship', id: sh.id }); } }
    if (Math.abs(sh.a) > ARC + 0.2 && Math.sign(sh.a) === Math.sign(sh.va)) { sh.gone = true; if (!sh.done) { s.lost++; s.combo = 0; s.ev.push({ k: 'shipLost', id: sh.id }); } }
  }
  s.ships = s.ships.filter(x => !x.gone);
  if (s.t >= s.dur) { s.over = true; s.ev.push({ k: 'end' }); }
}
export function beamStars(s) { const q = s.caught / Math.max(1, s.total) * 0.75 + s.guided / Math.max(1, s.L.ships) * 0.25; return stars3(q, 0.35, 0.6, 0.85); }

// ============================================================ 2) Sturmnacht-Plakat – Schiebe- und Drehpuzzle
export const POSTER_LEVELS = [{ name: 'Entwurf', cols: 3, rows: 3, rot: false }, { name: 'Plakat A1', cols: 4, rows: 3, rot: true }, { name: 'Meisterwerk', cols: 5, rows: 4, rot: true }];
export function newPoster(lvl, seed = 7) {
  const L = POSTER_LEVELS[lvl] || POSTER_LEVELS[0], n = L.cols * L.rows, r = rng(seed + lvl * 13);
  const s = { lvl, L, n, perm: Array.from({ length: n }, (_, i) => i), rot: new Array(n).fill(0), cur: 0, sel: -1, moves: 0, t: 0, done: false };
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s.perm[i], s.perm[j]] = [s.perm[j], s.perm[i]]; }
  if (L.rot) for (let i = 0; i < n; i++) s.rot[i] = Math.floor(r() * 4);
  if (posterSolved(s)) { [s.perm[0], s.perm[1]] = [s.perm[1], s.perm[0]]; }
  return s;
}
export const posterSolved = s => s.perm.every((p, i) => p === i) && s.rot.every(x => x === 0);
export function posterCorrect(s) { let c = 0; for (let i = 0; i < s.n; i++) if (s.perm[i] === i && s.rot[i] === 0) c++; return c; }
export function posterMove(s, dx, dy) { const { cols, rows } = s.L; const x = (s.cur % cols + dx + cols) % cols, y = (Math.floor(s.cur / cols) + dy + rows) % rows; s.cur = y * cols + x; }
export function posterPick(s, i = s.cur) {   // erstes Antippen wählt, zweites tauscht
  if (s.done) return 'done';
  s.cur = i;
  if (s.sel < 0) { s.sel = i; return 'sel'; }
  if (s.sel === i) { s.sel = -1; return 'unsel'; }
  const a = s.sel; [s.perm[a], s.perm[i]] = [s.perm[i], s.perm[a]]; [s.rot[a], s.rot[i]] = [s.rot[i], s.rot[a]]; s.sel = -1; s.moves++;
  if (posterSolved(s)) s.done = true; return 'swap';
}
export function posterRotate(s, i = s.cur) { if (s.done || !s.L.rot) return false; s.rot[i] = (s.rot[i] + 1) % 4; s.moves++; if (posterSolved(s)) s.done = true; return true; }
export function posterScore(s) { const par = s.n * (s.L.rot ? 1.6 : 1); return Math.max(100, Math.round(3000 * s.n / 9 - Math.max(0, s.moves - par) * 40 - s.t * 3)); }
export function posterStars(s) { const par = s.n * (s.L.rot ? 1.6 : 1); return s.done ? (s.moves <= par * 1.15 ? 3 : s.moves <= par * 1.7 ? 2 : 1) : 0; }

// ============================================================ 3) Zwei mit Zwiebeln – Räucherei / Weihnachtsmarkt
export const FISH = [{ id: 'lachs', name: 'Lachs', key: 'Q', c: '#f08a5d' }, { id: 'matjes', name: 'Matjes', key: 'F', c: '#c9c2c8' }, { id: 'makrele', name: 'Makrele', key: 'E', c: '#b58b4a' }];
export const BOOTH_LEVELS = [{ name: 'Räucherei am Hafen', time: 80, gap: 7.5, patience: 22, maxQ: 3, double: 0 }, { name: 'Weihnachtsmarkt', time: 95, gap: 5.2, patience: 19, maxQ: 4, double: 0.35 }];
const QUOTES = { ok: ['Danke! Sieht aus wie bei Albrechts seit 1974.', 'Perfekt. Mit Liebe gemacht, das schmeckt man.', 'Na also. Der Fisch hat’s schon schwer genug.', 'Zwei mit Zwiebeln – wie bestellt!'], bad: ['Äh … ich hatte Matjes gesagt?', 'Ohne Zwiebeln, hatte ich gesagt!', 'Das ist nicht ganz meins.'], leave: ['Ich komm später wieder.', 'Zu lange, Jungs.'] };
export function newBooth(lvl, opt = {}) {
  const L = BOOTH_LEVELS[lvl] || BOOTH_LEVELS[0], k = (DIFF[opt.diff] || DIFF.normal).k;
  return { lvl, L, k, t: 0, dur: L.time, q: [], next: 1.2, made: { fish: null, onion: false, count: 0 }, served: 0, wrong: 0, left: 0, coins: 0, tips: 0, streak: 0, ev: [], over: false, r: rng(55 + lvl * 9 + (opt.seed || 0)), id: 1 };
}
function newOrder(s) {
  const r = s.r, fish = FISH[Math.floor(r() * FISH.length)].id, onion = r() < 0.6, count = r() < s.L.double ? 2 : 1;
  return { id: s.id++, who: 'kunde' + (1 + Math.floor(r() * 5)), fish, onion, count, pat: s.L.patience / s.k, max: s.L.patience / s.k };
}
export function orderText(o) { const f = FISH.find(x => x.id === o.fish).name; return (o.count === 2 ? 'Zwei ' : 'Ein ') + f + (o.count === 2 ? 'brötchen' : 'brötchen') + (o.onion ? ' mit Zwiebeln' : ' ohne Zwiebeln'); }
export function boothFish(s, id) { if (s.over) return; if (s.made.fish === id) s.made.count = Math.min(2, s.made.count + 1); else { s.made.fish = id; s.made.count = 1; } s.ev.push({ k: 'fish', id }); }
export function boothOnion(s) { if (s.over || !s.made.fish) return; s.made.onion = !s.made.onion; s.ev.push({ k: 'onion', on: s.made.onion }); }
export function boothClear(s) { s.made = { fish: null, onion: false, count: 0 }; }
export function boothServe(s) {
  if (s.over || !s.q.length || !s.made.fish) return null;
  const o = s.q[0], m = s.made, ok = m.fish === o.fish && m.onion === o.onion && m.count === o.count, r = s.r;
  boothClear(s);
  if (ok) {
    s.q.shift(); s.served++; s.streak++; const tip = Math.round(o.pat / o.max * 3); s.coins += 4 * o.count + tip; s.tips += tip;
    s.ev.push({ k: 'served', id: o.id, tip, say: QUOTES.ok[Math.floor(r() * QUOTES.ok.length)] }); return true;
  }
  s.wrong++; s.streak = 0; o.pat = Math.max(1, o.pat - 4); s.ev.push({ k: 'wrong', id: o.id, say: QUOTES.bad[Math.floor(r() * QUOTES.bad.length)] }); return false;
}
export function boothTick(s, dt) {
  if (s.over) return;
  s.t += dt; s.next -= dt;
  if (s.next <= 0 && s.q.length < s.L.maxQ && s.t < s.dur - 6) { const o = newOrder(s); s.q.push(o); s.ev.push({ k: 'arrive', id: o.id, who: o.who }); s.next = s.L.gap / s.k * (0.75 + s.r() * 0.5); }
  for (const o of s.q) { o.pat -= dt; if (o.pat <= 0 && !o.gone) { o.gone = true; s.left++; s.streak = 0; s.ev.push({ k: 'leave', id: o.id, say: QUOTES.leave[Math.floor(s.r() * QUOTES.leave.length)] }); } }
  s.q = s.q.filter(o => !o.gone);
  if (s.t >= s.dur) { s.over = true; s.ev.push({ k: 'end' }); }
}
export const boothScore = s => s.coins * 25 + s.served * 50 - s.wrong * 20;
export function boothStars(s) { const tot = s.served + s.left + s.wrong * 0.5; return stars3(s.served / Math.max(1, tot), 0.5, 0.72, 0.9); }

// ============================================================ 4) Gegenwind – Lauf über den Deich
export const RUN_LEVELS = [
  { name: 'Der Heimweg', len: 520, speed: 8.5, acc: 0.012, weather: 'rain', gust: 0, wave: 0.0, density: 0.75 },
  { name: 'Sturmnacht', len: 700, speed: 9.5, acc: 0.014, weather: 'storm', gust: 1, wave: 0.35, density: 0.95 },
  { name: 'Gegenwind', len: 820, speed: 10, acc: 0.016, weather: 'winter', gust: 0.7, wave: 0.15, density: 1.05 },
  { name: 'Endlos am Deich', len: 0, speed: 9, acc: 0.02, weather: 'dusk', gust: 0.6, wave: 0.2, density: 1 }
];
// Hindernisse: drift = Treibgut (springen), moewe = Möwe (ducken), pfuetze = Pfütze (ausweichen/springen), welle = Welle (über 2 Spuren, ausweichen), bank = Bank (ausweichen)
export function newRun(lvl, opt = {}) {
  const L = RUN_LEVELS[lvl] || RUN_LEVELS[0], k = (DIFF[opt.diff] || DIFF.normal).k;
  const s = { lvl, L, k, z: 0, speed: L.speed * (0.9 + k * 0.1), lane: 0, x: 0, y: 0, vy: 0, duck: 0, hurt: 0, lives: 3, lights: 0, items: [], gen: 18, t: 0, gustT: 4, gust: 0, gustDir: 0, ev: [], over: false, won: false, r: rng(77 + lvl * 31 + (opt.seed || 0)), id: 1 };
  genRun(s, 120); return s;
}
function genRun(s, upto) {
  const r = s.r, L = s.L;
  while (s.gen < upto) {
    const gap = (9 + r() * 9) / L.density / Math.min(1.25, s.k);
    s.gen += gap; if (L.len && s.gen > L.len - 15) { s.gen = upto + 1; break; }
    const roll = r(), lane = Math.floor(r() * 3) - 1;
    let type = roll < 0.3 ? 'drift' : roll < 0.48 ? 'moewe' : roll < 0.66 ? 'pfuetze' : roll < 0.66 + L.wave ? 'welle' : 'bank';
    if (type === 'welle') { const l2 = lane === 1 ? 0 : lane + 1; s.items.push({ id: s.id++, type, lane, lanes: [lane, l2], z: s.gen }); }
    else s.items.push({ id: s.id++, type, lane, z: s.gen });
    // Lichter in einer freien Spur
    const free = [-1, 0, 1].filter(l => l !== lane); const fl = free[Math.floor(r() * free.length)];
    for (let i = 0; i < 3; i++) s.items.push({ id: s.id++, type: 'licht', lane: fl, z: s.gen - 3 + i * 2.2, y: type === 'drift' && fl === lane ? 1.6 : 0.9 });
  }
}
export function runMove(s, d) { if (s.over) return; const n = clamp(s.lane + d, -1, 1); if (n !== s.lane) { s.lane = n; s.ev.push({ k: 'lane' }); } }
export function runJump(s) { if (s.over || s.y > 0.01) return false; s.vy = 6.8; s.duck = 0; s.ev.push({ k: 'jump' }); return true; }
export function runDuck(s) { if (s.over) return; s.duck = 0.75; if (s.y > 0) s.vy = Math.min(s.vy, -8); s.ev.push({ k: 'duck' }); }
function hitBox(s, it) {
  const inLane = it.lanes ? it.lanes.includes(s.lane) && Math.abs(s.x - s.lane) < 0.6 : Math.abs(s.x - it.lane) < 0.55;
  if (!inLane || Math.abs(it.z - s.z) > 0.7) return false;
  if (it.type === 'drift' || it.type === 'pfuetze') return s.y < 0.55;
  if (it.type === 'moewe') return s.duck <= 0;
  if (it.type === 'licht') return Math.abs((it.y || 0.9) - (s.y + 0.9)) < 1.1;
  return true;   // welle, bank: nur ausweichen
}
export function runTick(s, dt) {
  if (s.over) return;
  s.t += dt; s.speed += s.L.acc * dt * 60 * (s.L.len ? 0.5 : 1);
  s.z += s.speed * dt;
  s.vy -= 20 * dt; s.y = Math.max(0, s.y + s.vy * dt); if (s.y === 0) s.vy = 0;
  s.duck = Math.max(0, s.duck - dt); s.hurt = Math.max(0, s.hurt - dt);
  // Böen schieben seitlich, man muss gegenhalten (sanft: nie aus der Spur werfen, nur verzögern)
  if (s.L.gust) { s.gustT -= dt; if (s.gustT <= 0) { s.gust = 1.4; s.gustDir = s.r() < 0.5 ? -1 : 1; s.gustT = 5 + s.r() * 5; s.ev.push({ k: 'gust', dir: s.gustDir }); } }
  s.gust = Math.max(0, s.gust - dt);
  const target = s.lane + s.gustDir * (s.gust > 0 ? 0.28 * s.L.gust : 0);
  s.x += (target - s.x) * Math.min(1, dt * 12);
  for (const it of s.items) {
    if (it.done || it.z < s.z - 2) continue;
    if (hitBox(s, it)) {
      it.done = true;
      if (it.type === 'licht') { s.lights++; s.ev.push({ k: 'light' }); }
      else if (s.hurt <= 0) { s.lives--; s.hurt = 1.4; s.speed = Math.max(s.L.speed * 0.8, s.speed * 0.85); s.ev.push({ k: 'hit', type: it.type }); if (s.lives <= 0) { s.over = true; s.won = false; s.ev.push({ k: 'end' }); return; } }
    }
  }
  s.items = s.items.filter(it => it.z > s.z - 6);
  genRun(s, s.z + 120);
  if (s.L.len && s.z >= s.L.len) { s.over = true; s.won = true; s.ev.push({ k: 'end' }); }
}
export const runScore = s => Math.round(s.z) + s.lights * 25 + (s.won ? s.lives * 150 : 0);
export function runStars(s) { if (!s.L.len) return stars3(s.z, 400, 900, 1600); if (!s.won) return 0; return s.lives >= 3 ? 3 : s.lives === 2 ? 2 : 1; }

// ============================================================ 5) Pia ermittelt – Fall 14
export const CLUES = [
  { id: 'handy', at: 'tisch', l: 'Handy ansehen', t: 'Beweis 1: Finn lächelt neuerdings auf sein Handy. Er lächelt sonst nur auf Papier.' },
  { id: 'salz', at: 'herd', l: 'Kartoffelsalat prüfen', t: 'Beweis 2: Der Kartoffelsalat wurde dreimal gesalzen. Von Finn. Er hat gar nicht gemerkt, dass ich ihn beobachte.' },
  { id: 'duschgel', at: 'flur', l: 'Badezimmertür', t: 'Beweis 3: Neues Duschgel. Mit Zitrone. Finn hat noch nie ein Duschgel mit Zitrone benutzt.' },
  { id: 'spiegel', at: 'spiegel', l: 'Spiegel untersuchen', t: 'Beweis 4: Abends vor dem Spiegel: „Hallo, Ben.“ Zweimal. Mit verschiedenen Betonungen.' },
  { id: 'krimi', at: 'regal', l: 'Regal durchsuchen', t: 'Beweis 5: Ben hat mir einen Krimi geschenkt. Das ist ein Bestechungsversuch. Ich nehme ihn trotzdem an.' },
  { id: 'skizze', at: 'mappe', l: 'Skizzenbuch öffnen', t: 'Beweis 6: Im Skizzenbuch: ein Junge mit Wasserflasche und Narbe über der linken Augenbraue. Elfmal.' }
];
export const VERDICTS = [
  { t: 'Tatbestand: Verliebtheit. Beide. Fall gelöst.', ok: true, r: 'Fall 14 ist gelöst. Das Geständnis kommt beim Abendessen, ganz von selbst: Finn wird rot bis zu den Ohren. Mama lächelt. Papa schaut sehr interessiert auf seine Kartoffeln.' },
  { t: 'Tatbestand: Finn ist krank. Zu viel Zitrone.', ok: false, r: 'Pia prüft die Beweise noch einmal. Nein. Krank sieht anders aus. Ein guter Detektiv irrt sich – und ermittelt weiter.' },
  { t: 'Tatbestand: Ben will nur Papas Fischbrötchen.', ok: false, r: 'Ein starkes Motiv! Aber erklärt das, warum Ben Finn achtmal angeschaut hat? Pia streicht die Theorie durch.' }
];
export function newCase() { return { found: [], t: 0, wrongs: 0, done: false }; }
export function caseFind(s, id) { if (s.found.includes(id) || !CLUES.some(c => c.id === id)) return false; s.found.push(id); return true; }
export const caseReady = s => s.found.length >= 4;
export function caseVerdict(s, i) { const v = VERDICTS[i]; if (!v) return null; if (v.ok) s.done = true; else s.wrongs++; return v; }
export const caseScore = s => Math.max(100, 600 + s.found.length * 150 - s.wrongs * 200 - Math.round(s.t * 2));
export const caseStars = s => !s.done ? 0 : s.found.length >= 6 && !s.wrongs ? 3 : s.found.length >= 5 ? 2 : 1;

// ------------------------------------------------------------ Mut aus den Spielen (Story)
export function gameGlow(kind, stars) { return [0, 2, 4, 6][clamp(stars | 0, 0, 3)]; }
export const maxStoryGlow = () => GLOW_START + CHAPTERS.reduce((a, c) => a + (c.choices ? Math.max(...c.choices.map(x => x.g)) : 0) + (c.game ? 6 : 0), 0);
