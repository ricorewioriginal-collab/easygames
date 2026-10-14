/* Hauptgeschichte „Der zerbrochene Regenbogen-Kompass“ – nur im Story-Modus.
   Jedes Kapitel führt in neue Welten; dort lösen die Weltgeschichten (data/quests/worlds) das jeweilige Problem und bringen
   einen Kompass-Splitter. Lasse setzt die Splitter ein, und Stück für Stück wird das Geheimnis um Flick gelüftet. */
import type { QuestDef } from '../../gameplay/quests.ts';
import { LIGHTHOUSE } from '../../world/worlds/hub.ts';

const toLasse = (text: string, lines: string[], next: number): QuestDef['stages'][number] => ({
  text, hints: ['Lasse wartet am Leuchtturm im Osten der Hauptinsel.', 'Der Leuchtturm ist rot-weiß gestreift. Folge der gelben Lichtsäule.', 'Geh zu Lasse am Fuß des Leuchtturms und sprich mit ihm.'],
  objectives: [{ id: 'lasse', type: 'talk', target: 'lasse', label: 'Bring die Splitter zu Leuchtturmwärter Lasse' }],
  dialog: { lasse: { start: { t: lines[0], next: 'b' }, b: { t: lines[1], next: 'c' }, c: { t: lines[2], do: [{ take: ['splitter', 99] }, { chapter: next }, { burst: true }], end: false } } }
});

export const MAIN_QUESTS: QuestDef[] = [
  {
    id: 'main_0', title: 'Der Sturm über dem Leuchtturm', icon: '🌩️', world: 'hub', kind: 'main', chapter: 0, modes: ['story'], giver: 'rosi',
    summary: 'Nach einem seltsamen grauen Sturm ist der Regenbogen-Kompass im Leuchtturm zerbrochen.',
    stages: [
      { text: 'Bürgermeisterin Rosi sucht dich. Sie steht am Rathaus am Ortsplatz.', hints: ['Rosi ist am Ortsplatz in der Mitte der Insel.', 'Das Rathaus hat ein lila Dach und einen kleinen Turm.', 'Geh zum Rathaus nördlich vom Brunnen und sprich Rosi an.'],
        objectives: [{ id: 'rosi', type: 'talk', target: 'rosi', label: 'Sprich mit Bürgermeisterin Rosi' }],
        dialog: { rosi: {
          start: { t: 'Da bist du ja, {name}! Hast du den Sturm heute Nacht auch gehört? Ein grauer Wirbel ist direkt über den Leuchtturm gezogen.', emote: 'think', next: 'b' },
          b: { t: 'Seitdem flimmern die Brücken, und Eis-Emma weiß nicht mehr, welche Sorte sie gestern erfunden hat. Irgendwas stimmt nicht.', choices: [{ t: 'Ich schau mir den Leuchtturm an!', to: 'c' }, { t: 'Vielleicht war es nur ein Gewitter?', to: 'd' }] },
          c: { t: 'Wunderbar! Leuchtturmwärter Lasse wartet dort. Und nimm Blitz mit – seine Nase ist Gold wert.', end: false },
          d: { t: 'Gewitter machen keine Gedächtnislücken! Bitte, schau beim Leuchtturm nach. Lasse wartet dort auf dich.', end: false }
        } } },
      { text: 'Geh zum Leuchtturm im Osten und sprich mit Lasse.', hints: ['Der Leuchtturm steht auf dem Hügel im Osten.', 'Folge der breiten Straße nach Osten und dann dem Weg zum Hügel.', 'Lasse steht am Fuß des Leuchtturms.'],
        objectives: [{ id: 'lasse', type: 'talk', target: 'lasse', label: 'Sprich mit Leuchtturmwärter Lasse' }],
        dialog: { lasse: {
          start: { t: 'Moin, {name}. Gut, dass du kommst. Der Regenbogen-Kompass da oben … er ist in tausend Stücke gesprungen. Na ja – in neun.', next: 'b' },
          b: { t: 'Lauf die Wendeltreppe hoch und schau ihn dir selbst an. Aber halt dich am Geländer fest!', end: false }
        } } },
      { text: 'Steig die Wendeltreppe des Leuchtturms hinauf und untersuche den Kompass.', hints: ['Die Treppe windet sich außen um den Turm.', 'Springe die Holzstufen hinauf – mit Doppelsprung geht es schneller.', 'Ganz oben auf der Galerie steht der Kompass. Drück dort die Aktionstaste.'],
        objectives: [{ id: 'kompass', type: 'interact', target: 'kompass', label: 'Untersuche den Regenbogen-Kompass', at: { x: LIGHTHOUSE.x, z: LIGHTHOUSE.z, r: 5 } }] },
      { text: 'Erzähl Rosi, was du oben gesehen hast.', hints: ['Rosi ist wieder am Rathaus.', 'Benutze die Karte (🗺️), wenn du dich verläufst.', 'Sprich mit Rosi am Ortsplatz.'],
        objectives: [{ id: 'rosi2', type: 'talk', target: 'rosi', label: 'Berichte Rosi' }],
        dialog: { rosi: {
          start: { t: 'Und? Was hast du gefunden?', next: 'b' },
          b: { who: 'player', t: 'Der Kompass ist zerbrochen. Neun Splitter sind über alle Inseln verstreut – und es lag graue Wolkenwatte herum.', next: 'c' },
          c: { t: 'Wolkenwatte? Seltsam … Dann hilft nur eins: Wir müssen die Splitter zurückholen! Der erste Hinweis kommt aus der Stadtinsel im Norden – dort ist die Uhr stehen geblieben.', next: 'd' },
          d: { t: 'Hier, nimm diese Karte. Neue Brücken öffnen sich, wenn der Kompass wieder ein bisschen leuchtet. Viel Glück!', do: [{ chapter: 1 }, { stars: 10 }], end: false }
        } } }
    ],
    rewards: { xp: 60, text: 'Du hast herausgefunden, dass der Kompass zerbrochen ist – das Abenteuer beginnt!' }
  },
  {
    id: 'main_1', title: 'Die Zeit ist stehen geblieben', icon: '🏙️', world: 'stadt', kind: 'main', chapter: 1, modes: ['story'],
    summary: 'In der Stadtinsel ist der Uhrturm stehen geblieben – und mit ihm die Erinnerungen der Bewohner.',
    stages: [
      { text: 'Reise über die Steinbrücke im Norden zur Stadtinsel und hilf Uhrmacher Otto.', hints: ['Die Brücke zur Stadt beginnt am Nordende der großen Straße.', 'In der Stadt steht der Uhrturm am Brunnenplatz. Otto ist ganz in der Nähe.', 'Löse Ottos Aufgabe „Die stehende Uhr“ – dann leuchtet ein Splitter auf.'],
        objectives: [{ id: 'stadt', type: 'flag', target: 'done_stadt', label: 'Bring den Uhrturm der Stadt wieder zum Laufen' }] },
      toLasse('Bring den ersten Splitter zu Lasse.', ['Ein Splitter! Er leuchtet blau wie das Zifferblatt. Gut gemacht!', 'Hm, siehst du die graue Watte daran? Dieselbe wie oben am Kompass. Jemand hat die Splitter absichtlich verteilt …', 'Der Kompass leuchtet schon ein wenig – die Brücken zur Fellretter-Bucht im Süden sind wieder klar!'], 2)
    ],
    rewards: { stars: 15, xp: 80, text: 'Die Uhr tickt wieder – und der erste Splitter ist zurück.' }
  },
  {
    id: 'main_2', title: 'Spuren im Sand', icon: '🐾', world: 'fellretter', kind: 'main', chapter: 2, modes: ['story'],
    summary: 'Die Welpen der Fellretter-Bucht sind verschwunden. Folgen sie einer grauen Wolke?',
    stages: [
      { text: 'Hilf den Fellrettern, ihre verschwundenen Welpen zu finden.', hints: ['Die Fellretter-Bucht liegt im Süden.', 'Kapitänin Pia an der Bellwarte erklärt alles. Blitz bekommt dort eine besondere Fähigkeit.', 'Löse „Wo sind die Welpen?“ in der Fellretter-Bucht.'],
        objectives: [{ id: 'fr', type: 'flag', target: 'done_fellretter', label: 'Finde alle Welpen der Fellretter' }] },
      toLasse('Bring den Splitter zu Lasse.', ['Die Welpen sind einer kleinen grauen Wolke hinterhergelaufen, sagst du? Die wollten spielen …', 'Eine Wolke, die mit Welpen spielen will. Vielleicht ist sie gar nicht böse. Vielleicht ist sie … einsam?', 'Der Kompass wird heller! Jetzt öffnen sich die Brücken zum Dampfer-Hafen und zu den Drachenhöhen.'], 3)
    ],
    rewards: { stars: 15, xp: 90, text: 'Die Welpen sind zurück – und die Spur der grauen Wolke wird deutlicher.' }
  },
  {
    id: 'main_3', title: 'Farbe und Feuer', icon: '🐉', world: 'drachen', kind: 'main', chapter: 3, modes: ['story'],
    summary: 'Im Dampfer-Hafen ist die Farbe verschwunden, in den Drachenhöhen sind die Fackeln erloschen.',
    stages: [
      { text: 'Bring die Farbe zurück in den Dampfer-Hafen und entzünde die Fackeln der Drachenhöhen.', hints: ['Der Dampfer-Hafen liegt hinter der Stadt im Nordwesten, die Drachenhöhen im Süden.', 'Im Hafen hilft dir Dampfer-Willi, in den Drachenhöhen der kleine Drache Zündel.', 'Löse „Farbe für den Hafen“ und „Das Feuer der Drachen“.'],
        objectives: [{ id: 'dampf', type: 'flag', target: 'done_dampfer', label: 'Farbe für den Dampfer-Hafen' }, { id: 'drach', type: 'flag', target: 'done_drachen', label: 'Das Feuer der Drachen' }] },
      toLasse('Bring beide Splitter zu Lasse.', ['Zwei auf einmal! Und die Drachen sagen, sie hätten nachts ein Wölkchen weinen hören?', 'Ich glaube, ich weiß jetzt, wer es ist: Flick, das Himmelswölkchen. Als Kind hab ich es oft gesehen. Es kam immer zum Spielen – bis keiner mehr nach oben geschaut hat.', 'Weiter geht’s: Die Regenbogenwelt, der Freizeitpark und die Fußball-Arena sind jetzt erreichbar!'], 4)
    ],
    rewards: { stars: 20, xp: 120, text: 'Farbe und Feuer sind zurück. Und der Name des Wölkchens: Flick.' }
  },
  {
    id: 'main_4', title: 'Vergessene Erinnerungen', icon: '🌈', world: 'regenbogen', kind: 'main', chapter: 4, modes: ['story'],
    summary: 'In der Regenbogenwelt vergessen Familien ihre gemeinsamen Erinnerungen. Im Freizeitpark stehen die Fahrgeschäfte still.',
    stages: [
      { text: 'Hilf der Regenbogenwelt, ihre Erinnerungen wiederzufinden, und bring den Freizeitpark zum Laufen.', hints: ['Die Regenbogenwelt liegt im Westen, der Freizeitpark im Osten.', 'Lehrer Leo kennt sich mit Erinnerungsfotos aus, Parkdirektorin Pia braucht Zahnräder.', 'Löse „Das Erinnerungsalbum“ und „Der stille Park“.'],
        objectives: [{ id: 'rb', type: 'flag', target: 'done_regenbogen', label: 'Das Erinnerungsalbum' }, { id: 'pk', type: 'flag', target: 'done_park', label: 'Der stille Park' }, { id: 'fb', type: 'flag', target: 'done_fussball', label: 'Pokal der Fußball-Arena (freiwillig)', optional: true }] },
      { text: 'Entscheide: Wie willst du Flick begegnen, wenn du es triffst?', hints: ['Sprich mit Lasse.', 'Es gibt keine falsche Antwort.', 'Lasse am Leuchtturm.'],
        objectives: [{ id: 'lasse', type: 'talk', target: 'lasse', label: 'Sprich mit Lasse über Flick' }],
        dialog: { lasse: {
          start: { t: 'Flick hat die Erinnerungen nicht gestohlen – er hat sie sich nur „ausgeliehen“, um nicht allein zu sein. Was denkst du, wie sollen wir ihm begegnen?', choices: [
            { t: '🤝 Wir laden ihn ein, unser Freund zu sein.', do: [{ choice: ['flick', 'freund'] }], to: 'f' },
            { t: '🌈 Wir zeigen ihm, dass alle zum Himmel hochschauen.', do: [{ choice: ['flick', 'himmel'] }], to: 'h' }] },
          f: { t: 'Ein großes Herz hast du. Merk dir das – am Ende zählt es.', do: [{ take: ['splitter', 99] }, { chapter: 5 }], end: false },
          h: { t: 'Eine schöne Idee: ein Regenbogen, den jeder sieht. Merk dir das – am Ende zählt es.', do: [{ take: ['splitter', 99] }, { chapter: 5 }], end: false }
        } } }
    ],
    rewards: { stars: 20, xp: 140, text: 'Die Erinnerungen kehren zurück – und du hast entschieden, wie du Flick begegnen willst.' }
  },
  {
    id: 'main_5', title: 'Das Licht der Märchen', icon: '🏰', world: 'maerchen', kind: 'main', chapter: 5, modes: ['story'],
    summary: 'Im Märchenland schläft das Schloss, im Schlüsselreich sind die Lichter aus.',
    stages: [
      { text: 'Wecke Schloss Sternenglanz und öffne die Schlüssellöcher des Schlüsselreichs.', hints: ['Das Märchenland liegt im Westen, das Schlüsselreich dahinter.', 'Prinzessin Lilia und Lichtwanderin Luma helfen dir.', 'Löse „Das schlafende Schloss“ und „Die fünf Lichtschlüssel“.'],
        objectives: [{ id: 'm', type: 'flag', target: 'done_maerchen', label: 'Das schlafende Schloss' }, { id: 's', type: 'flag', target: 'done_schluessel', label: 'Die fünf Lichtschlüssel' }, { id: 'w', type: 'flag', target: 'done_wunsch', label: 'Wunsch-Insel (freiwillig)', optional: true }] },
      toLasse('Bring die Splitter zu Lasse.', ['Du kannst jetzt zaubern? Lichtzauber! Na, das wird Flick gefallen – er liebt alles, was glitzert.', 'Nur noch wenige Splitter. Einer liegt tief unten in Atlantis, einer in der Schwammi-Bucht, einer in der Funkwelle.', 'Die Treppe zur Tiefe an der Südküste ist jetzt offen. Und die Brücken zur Schwammi-Bucht und zur Funkwelle auch!'], 6)
    ],
    rewards: { stars: 25, xp: 160, text: 'Märchenlicht und Schlüssellicht leuchten wieder.' }
  },
  {
    id: 'main_6', title: 'Tief unter den Wellen', icon: '🔱', world: 'atlantis', kind: 'main', chapter: 6, modes: ['story'],
    summary: 'In Atlantis ist das Herz verstummt, in der Funkwelle rauscht nur noch, und in der Schwammi-Bucht ist die Knusper-Krabbe zu.',
    stages: [
      { text: 'Bring das Herz von Atlantis zum Klingen, finde die Sender der Funkwelle und hilf der Schwammi-Bucht.', hints: ['Atlantis: Treppe an der Südküste. Funkwelle: Südosten. Schwammi-Bucht: hinter der Stadt.', 'Die Kristall-Harfe in Atlantis, der Funkturm und die Knusper-Krabbe sind die Orte.', 'Löse „Das stille Herz“, „Rauschen auf allen Kanälen“ und „Die geschlossene Krabbe“.'],
        objectives: [{ id: 'a', type: 'flag', target: 'done_atlantis', label: 'Das stille Herz von Atlantis' }, { id: 'f', type: 'flag', target: 'done_funkwelle', label: 'Rauschen auf allen Kanälen' }, { id: 's', type: 'flag', target: 'done_schwamm', label: 'Die geschlossene Krabbe' }] },
      toLasse('Bring die Splitter zu Lasse.', ['Unglaublich! Fast alle Splitter sind zurück.', 'Der letzte ist besonders: Flick hat ihn auf die Prisma-Insel getragen, ganz in den Nordosten. Dort wohnen Wesen, die Energie, Karten und Daten lieben.', 'Die Brücke über das Bauland zur Prisma-Insel ist jetzt offen – und alle anderen Inseln auch!'], 7)
    ],
    rewards: { stars: 25, xp: 180, text: 'Tiefe, Töne und Treue – fast alle Splitter sind zurück.' }
  },
  {
    id: 'main_7', title: 'Die Prisma-Insel', icon: '🌀', world: 'prisma', kind: 'main', chapter: 7, modes: ['story'],
    summary: 'Auf der Prisma-Insel hütet jedes Gebiet ein Stück des letzten Splitters.',
    stages: [
      { text: 'Meistere den Ki-Garten, die Runen-Arena und den Datenhain.', hints: ['Die Prisma-Insel liegt ganz im Nordosten, hinter dem Bauland.', 'Meisterin Ama im Ki-Garten, Runenmeister Rune in der Arena, Forscherin Bit im Datenhain.', 'Gewinne das Ki-Turnier, das Runen-Turnier und hilf einem Datenwesen, sich zu entwickeln.'],
        objectives: [{ id: 'k', type: 'flag', target: 'done_ki', label: 'Ki-Garten: das Turnier' }, { id: 'r', type: 'flag', target: 'done_runen', label: 'Runen-Arena: das Turnier' }, { id: 'd', type: 'flag', target: 'done_daten', label: 'Datenhain: ein Freund entwickelt sich' }] },
      { text: 'Bring den letzten Splitter zu Lasse.', hints: ['Lasse am Leuchtturm.', 'Folge der Lichtsäule.', 'Sprich mit Lasse.'],
        objectives: [{ id: 'l', type: 'talk', target: 'lasse', label: 'Sprich mit Lasse' }],
        dialog: { lasse: {
          start: { t: 'Der Kompass ist ganz! Aber schau – er leuchtet nur grau. Etwas fehlt.', next: 'b' },
          b: { t: 'Flicks Traurigkeit hat sich im Verbotenen Wald zu einem riesigen Grauschleier zusammengeballt. Solange der dort wütet, kann der Kompass nicht strahlen.', next: 'c' },
          c: { t: 'Kampfmeister Kai hat dich gut trainiert. Geh ins Herz des Waldes – und befreie Flick von seinem Grauschleier. Ich glaube an dich!', do: [{ chapter: 8 }], end: false }
        } } }
    ],
    rewards: { stars: 30, xp: 200, text: 'Alle Splitter sind gefunden. Jetzt fehlt nur noch Flick.' }
  },
  {
    id: 'main_8', title: 'Das Herz des Waldes', icon: '🌑', world: 'hub', kind: 'main', chapter: 8, modes: ['story'],
    summary: 'Im Herz des Verbotenen Waldes wartet der Grauschleier-Riese.',
    stages: [
      { text: 'Besiege den Grauschleier-Riesen im Herz des Verbotenen Waldes.', hints: ['Das Herz des Waldes liegt ganz im Nordwesten des Waldes.', 'Nimm Essen mit! Achte auf die roten Kreise und weiche mit der Rolle aus.', 'Am Steinkreis „Herz des Waldes“ die Aktion drücken und den Grauschleier-Riesen herausfordern.'],
        objectives: [{ id: 'boss', type: 'defeat', target: 'boss:grauschleier', label: 'Besiege den Grauschleier-Riesen' }] },
      { text: 'Ein kleines graues Wölkchen bleibt zurück. Sprich mit Flick.', hints: ['Flick schwebt im Herz des Waldes.', 'Es ist ganz klein und schaut traurig.', 'Sprich mit Flick.'],
        objectives: [{ id: 'flick', type: 'talk', target: 'flick', label: 'Sprich mit Flick' }],
        dialog: { flick: {
          start: { t: '… Bist du gekommen, um mit mir zu schimpfen? Ich wollte doch nur, dass mal jemand nach oben schaut.', next: 'b' },
          b: { t: 'Ich hab den Kompass kaputtgemacht. Und den Welpen hinterhergespielt. Und die Erinnerungen ausgeliehen, weil meine eigenen so leer waren …', next: 'c' },
          c: { t: 'Was machst du jetzt mit mir?', choices: [
            { t: '🤝 Komm mit! Du kannst unser Freund sein – auf dem Insel-Fest und überall.', do: [{ choice: ['ende', 'freund'] }], to: 'f' },
            { t: '🌈 Flieg wieder hoch – und wir alle schauen jeden Tag zu dir hinauf.', do: [{ choice: ['ende', 'himmel'] }], to: 'h' }] },
          f: { t: 'Wirklich? Ein Freund? … Dann komme ich mit! Ich kann übrigens Regen machen, wenn deine Blumen Durst haben!', do: [{ flag: 'flick_freund' }, { companion: 'flick' }, { burst: true }], end: false },
          h: { t: 'Jeden Tag? Versprochen? Dann male ich euch jeden Abend einen Regenbogen an den Himmel!', do: [{ flag: 'flick_himmel' }, { burst: true }], end: false }
        } } },
      { text: 'Geh zum großen Insel-Fest am Ortsplatz!', hints: ['Rosi wartet am Brunnen.', 'Der Ortsplatz ist in der Mitte der Hauptinsel.', 'Sprich mit Rosi.'],
        objectives: [{ id: 'fest', type: 'talk', target: 'rosi', label: 'Feiere mit Rosi das Insel-Fest' }],
        dialog: { rosi: {
          start: { t: '{name}! Der Kompass strahlt in allen Farben, alle Brücken leuchten, und alle erinnern sich wieder – sogar Eis-Emma an ihre Sorte!', next: 'b' },
          b: { t: 'Im Namen aller Inseln: Danke! Hiermit erkläre ich das große Insel-Fest für eröffnet! 🎉', do: [{ chapter: 9 }, { cosmetic: 'hat:krone' }, { cosmetic: 'glasses:stern' }, { stars: 100 }, { burst: true }], end: false }
        } } }
    ],
    rewards: { xp: 400, text: 'Das große Insel-Fest! Die Bunte Insel strahlt wieder – und Flick hat ein Zuhause gefunden.' }
  }
];
