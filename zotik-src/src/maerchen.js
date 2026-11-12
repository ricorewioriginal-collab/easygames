// Märchenwelten (wie Kingdom Hearts): sieben eigene Welten nach gemeinfreien Vorlagen, erreichbar nur über das Märchentor in Lunaris
// (die Hauptwelt) – zurück geht es immer über das Sternentor nach Lunaris. Jede Welt: eigene Landschaft und Wahrzeichen, Figuren in
// eigener Gestaltung (bewusst keine Film-Optik), drei kleine Aufträge nach der Vorlage, am Ende ein Schlüsselloch zum Versiegeln.
// Welten-Nummern 21–27. Zustand: S.mw[id] = { m: Auftrag, st: 0 frei / 1 läuft, c: Zähler, got: {Teil: 1}, done: 1 }.
export const MW_FIRST = 21, MW_LAST = 27;
const CX = 0, CZ = -30, R = 44, PATHX = z => Math.sin(z * .08) * 5;
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ---------------- Welten ---------------- */
// foes: a = Fernkämpfer (schwebt), b = Nahkämpfer, x/y = Bossgegner. Aufträge: collect (Teile einsammeln), ring (Stellen auslösen),
// find (jemanden finden), defeat (Gegnerwelle), boss. g = Auftraggeber (NPC-id).
const WORLDS = [
  { n: 21, id: 'spiegel', name: 'Der Spiegelwald', sub: 'Schneewittchen · Brüder Grimm', src: 'Kinder- und Hausmärchen der Brüder Grimm (1812)', em: '🍎', col: 0xc070ff,
    amp: 1.1, ground: [0x2c4a34, 0x3a5a3a], path: 0x6a5a44, ridge: 0x22362a, border: ['oak', 'oak', 'pine'], decor: [['oak', 16], ['mush', 14], ['rock', 6], ['bush', 10]],
    atm: { top: [.03, .02, .08], mid: [.08, .06, .16], hor: [.26, .18, .3], aur: [.4, .2, .6], ms: [.2, .15, .3], gr: [.06, .09, .06], moon: 0xe0d0ff, mg: [0x3a2a4a, 0x1a1a2a], fog: 0x1a1426, fd: .016, hemi: [0xb0a0e0, 0x3a3a2a, .9], lite: [0xd8c8ff, .85], stars: 1, expo: 1.25 },
    pads: [[-16, -22, 7], [0, -56, 7], [18, -40, 8], [10, -12, 4]], pools: [[18, -40, 5.5, 0x8ab0ff]], key: [0, -54],
    foes: { a: ['spiegel', 'Spiegelsplitter', 0xd8e4ff], b: ['thornwolf', 'Dornwolf', 0x4a3a5a], x: ['koenigin', 'Die Spiegelkönigin', 0xa070e0, 'Herrin des Zauberspiegels', 'Spieglein, Spieglein …!'] },
    npcs: [
      { id: 'schnee', name: 'Schneewittchen', x: -11, z: -16, face: 2.4, v: { cloth: 0x7a1e2a, cloth2: 0xe8dcc0, hair: 0x14100e, skin: 0xf4e0d4, cape: 0x5a3a26, hs: 2, sc: .95 }, idle: [['Schneewittchen', 'Die Zwerge sagen, ich soll niemandem die Tür öffnen. Aber dir traue ich – du hast ein ehrliches Gesicht, kleiner Fuchs.']] },
      { id: 'erzbart', name: 'Erzbart', x: -20, z: -16, face: 1.8, v: { cloth: 0x5a4a3a, cloth2: 0x3a2e24, hair: 0xd8d0c0, beard: 1, hood: 1, sc: .62, wide: 1.3, pack: 1 }, extra: 'lamp', idle: [['Erzbart', 'Sieben Zwerge, sieben Betten, sieben Becher. Und eine, die alles aufgeräumt hat. Wir sind froh, dass sie da ist.']] },
      { id: 'zwerg2', name: 'Kieselzahn', x: -12, z: -27, face: .4, v: { cloth: 0x4a5a3a, cloth2: 0x3a2e24, hair: 0x6a4a2a, beard: 1, hood: 1, sc: .58, wide: 1.25 }, extra: 'pick', idle: [['Kieselzahn', 'Hinter den sieben Bergen graben wir nach Erz. Gold glänzt, aber eine warme Suppe ist mehr wert.']] },
      { id: 'zwerg3', name: 'Funkelstein', x: -22, z: -27, face: -.6, v: { cloth: 0x3a4a6a, cloth2: 0x2a2a3a, hair: 0x9a8a7a, beard: 1, hood: 1, sc: .6, wide: 1.3 }, extra: 'pick', idle: [['Funkelstein', 'Die Königin hat einen Spiegel, der nie lügt. Darum hasst sie ihn – und jeden, der schöner ist als sie.']] }],
    intro: [['Erzähler', 'Ein Wald, in dem jeder Teich ein Spiegel ist. Hinter sieben Bergen steht ein kleines Haus mit sieben Lichtern.'], ['Zotik', 'Riecht nach Tannen … und nach frisch gebackenem Brot.'], ['Felli', 'Fiep!']],
    ms: [
      { t: 'collect', g: 'erzbart', n: 'Sieben Grubenlaternen', item: 'Grubenlaterne', look: 'lamp', pts: [[-30, -6], [-34, -34], [-8, -46], [26, -18], [32, -50], [6, -32], [-26, -54]],
        a: [['Erzbart', 'Ein Fuchs mit Schwert! Hör zu: Die Spiegelsplitter haben uns auf dem Heimweg erschreckt, und wir haben alle sieben Grubenlaternen fallen lassen.'], ['Erzbart', 'Ohne Licht finden wir morgen den Stollen nicht. Bring sie uns zurück – sie liegen überall im Wald verstreut.']],
        d: [['Erzbart', 'Alle sieben! Ha! Heute Abend gibt es Suppe für acht – für neun, mit dem Kleinen da.'], ['Schneewittchen', 'Du bist mutig, Zotik. Darf ich dich um noch etwas bitten?']] },
      { t: 'defeat', g: 'schnee', n: 'Die Spione der Königin', foe: 'a', cnt: 6, at: [18, -32], r: 9,
        a: [['Schneewittchen', 'Am Spiegelsee schwirren Splitter des Zauberspiegels. Durch sie sieht die Königin alles, was im Wald geschieht.'], ['Schneewittchen', 'Wenn sie mich finden, kommt sie wieder – mit einem Gürtel, einem Kamm oder einem Apfel. Bitte zerschlag die Splitter!']],
        d: [['Schneewittchen', 'Der See ist wieder still. Danke, Zotik.'], ['Erzbart', 'Zu früh gefreut. Hört ihr das? Glas, das singt … Sie kommt selbst!']] },
      { t: 'boss', g: 'schnee', n: 'Die Spiegelkönigin', foe: 'x', at: [0, -48],
        a: [['Schneewittchen', 'Die Königin hat sich in ihren Spiegel gehüllt und wartet vor dem großen Rahmen im Norden.'], ['Zotik', 'Dann sorge ich dafür, dass ihr Spiegel ab heute nur noch eines sagt: Es ist vorbei.']],
        d: [['Erzähler', 'Der Spiegel zerspringt in tausend Funken. Was bleibt, ist ein leerer Rahmen – und darin ein Schlüsselloch aus Licht.'], ['Schneewittchen', 'Der Wald atmet auf. Geh, Zotik – versiegle das Licht, bevor die Dunkelheit es findet.']] }],
    outro: [['Schneewittchen', 'Komm uns besuchen. Die Tür ist für dich immer offen.'], ['Erzbart', 'Und bring Hunger mit!']] },

  { n: 22, id: 'dschungel', name: 'Dschungel von Seeonee', sub: 'Das Dschungelbuch · Rudyard Kipling', src: 'Rudyard Kipling, The Jungle Book (1894)', em: '🐯', col: 0xe8a040,
    amp: 1.5, ground: [0x2a5a24, 0x3a6a2a], path: 0x7a6440, ridge: 0x1e4a1e, border: ['palm', 'jungle', 'jungle'], decor: [['jungle', 14], ['palm', 10], ['fern', 22], ['rock', 6]],
    atm: { top: [.1, .25, .45], mid: [.3, .5, .55], hor: [.75, .7, .45], aur: [.1, .2, .1], ms: [.3, .35, .2], gr: [.12, .22, .08], moon: 0xfff0c0, mg: [0x2a5a2a, 0x1a3a1a], fog: 0x5a7a4a, fd: .014, hemi: [0xd0f0b0, 0x3a4a1a, .85], lite: [0xfff0c0, 1.1], stars: 0, expo: 1.05 },
    pads: [[0, -56, 8], [24, -34, 9], [-20, -30, 6], [-8, -10, 4]], rects: [[16, 33, -45, -25]], key: [0, -56],
    foes: { a: ['falter', 'Dschungelfalter', 0x6ad86a], b: ['sand', 'Bandar-log', 0x8a6a44], x: ['sphinx', 'Shere Khan', 0xe08a2a, 'Der lahme Tiger', 'Shere Khan brüllt – das Gras zittert!'] },
    npcs: [
      { id: 'mowgli', name: 'Mowgli', x: -5, z: -9, face: 2.8, v: { cloth: 0x3a5a2a, cloth2: 0x8a5a3a, hair: 0x14100c, skin: 0xb07a50, sc: .78, hs: 4 }, idle: [['Mowgli', 'Wir sind vom selben Blut, du und ich! – So grüßt man im Dschungel. Merk es dir.']] },
      { id: 'baloo', name: 'Baloo', x: -13, z: -14, face: 2.2, ani: ['sphinx', 0x6a4a2e, 1.55], idle: [['Baloo', 'Ich lehre die jungen Wölfe das Gesetz des Dschungels. Langweilig? Mag sein. Aber es rettet Leben.']] },
      { id: 'bagheera', name: 'Bagheera', x: 9, z: -12, face: -2.4, ani: ['sphinx', 0x15141c, 1.25], idle: [['Bagheera', 'Ich habe Mowgli einst mit einem frisch erlegten Bullen freigekauft. Seitdem passe ich auf ihn auf.']] }],
    intro: [['Erzähler', 'Warme Luft, Vogelrufe, Lianen bis zum Boden. Irgendwo im Norden ragt der Ratsfelsen aus dem Grün.'], ['Zotik', 'Hier ist alles größer als ich. Sogar die Blätter.']],
    ms: [
      { t: 'ring', g: 'baloo', n: 'Das Gesetz des Dschungels', item: 'Lehrstein', look: 'stone', pts: [[-28, -18, 'Lehrstein der Jäger'], [-24, -46, 'Lehrstein der Schlangen'], [-4, -36, 'Lehrstein der Vögel']],
        a: [['Baloo', 'Du willst durch den Dschungel? Dann lern zuerst die Meisterworte! An drei Lehrsteinen sind sie eingeritzt.'], ['Baloo', 'Berühre jeden Stein und sprich die Worte nach: für die Jäger, die Schlangen und die Vögel.']],
        d: [['Baloo', 'Wir sind vom selben Blut, du und ich! – Gut gesprochen. Jetzt beißt dich hier keiner mehr aus Versehen.'], ['Bagheera', 'Zu spät für Lob, Baloo. Die Bandar-log haben Mowgli geholt!']] },
      { t: 'defeat', g: 'bagheera', n: 'Die Kalten Höhlen', foe: 'b', cnt: 6, at: [24, -30], r: 8,
        a: [['Bagheera', 'Das Affenvolk hat Mowgli in die Kalten Höhlen verschleppt – eine verlassene Stadt im Osten. Sie haben kein Gesetz und kein Gedächtnis.'], ['Bagheera', 'Treib sie auseinander! Ich schleiche von der anderen Seite heran.']],
        d: [['Mowgli', 'Danke! Die Bandar-log wollten, dass ich ihnen zeige, wie man Seile aus Ranken flicht. Dann haben sie es vergessen und mich angeschrien.'], ['Baloo', 'Bleib in der Nähe, Mannjunges. Shere Khan sucht dich – heute Nacht kommt er zum Ratsfelsen.']] },
      { t: 'boss', g: 'mowgli', n: 'Shere Khan', foe: 'x', at: [0, -48],
        a: [['Mowgli', 'Shere Khan sagt, ich gehöre ihm. Aber ich habe die Rote Blume – das Feuer der Menschen. Davor fürchtet er sich.'], ['Zotik', 'Du hältst das Feuer, ich halte mein Schwert. Zusammen jagen wir ihn vom Felsen.']],
        d: [['Erzähler', 'Shere Khan flieht mit versengtem Fell in die Nacht. Auf dem Ratsfelsen glimmt ein Schlüsselloch auf.'], ['Bagheera', 'Das Rudel ist sicher. Tu, was du tun musst, Weltenhörer.']] }],
    outro: [['Mowgli', 'Gute Jagd, Zotik!'], ['Baloo', 'Und vergiss die Meisterworte nicht.']] },

  { n: 23, id: 'meer', name: 'Das Meerkönigreich', sub: 'Die kleine Meerjungfrau · H. C. Andersen', src: 'Hans Christian Andersen, Den lille Havfrue (1837)', em: '🐚', col: 0x6ad8ff,
    amp: 1.3, ground: [0xb8a87a, 0x9a9070], path: 0xd8c89a, ridge: 0x4a5a6a, border: ['kelp', 'coral', 'rockbig'], decor: [['coral', 16], ['kelp', 16], ['rock', 8], ['shell', 10]], under: 1,
    atm: { top: [.02, .12, .25], mid: [.04, .22, .38], hor: [.1, .4, .5], aur: [.1, .4, .45], ms: [.1, .3, .4], gr: [.15, .25, .3], moon: 0xa0f0ff, mg: [0x1a4a5a, 0x0a2a3a], fog: 0x0e3a52, fd: .026, hemi: [0x8ae0ff, 0x1a3a4a, .9], lite: [0xa0f0ff, .8], stars: 0, expo: 1.15 },
    pads: [[0, -58, 8], [20, -30, 8], [-16, -20, 6], [-24, -50, 6]], rects: [[-10, 10, -66, -56], [16, 25, -40, -26]], key: [0, -54],
    foes: { a: ['qualle', 'Nesselqualle', 0x8ad8ff], b: ['krabbe', 'Riffkrabbe', 0xe0704a], x: ['uhr', 'Die Meerhexe', 0x6a3a9a, 'Hüterin der Polypen', 'Die Polypen greifen nach dir!'] },
    npcs: [
      { id: 'nixe', name: 'Die kleine Meerjungfrau', x: -12, z: -14, face: 2.6, v: { cloth: 0x2a8a8a, cloth2: 0x2a8a8a, hair: 0xe8e4f0, skin: 0xf0dcd0, hs: 2, sc: .9 }, extra: 'tail', idle: [['Die kleine Meerjungfrau', 'In meinem Garten wachsen nur rote Blumen – rund und rot wie die Sonne. Und in der Mitte steht ein Marmorjunge, den das Meer mir geschenkt hat.']] },
      { id: 'oma', name: 'Großmutter', x: 7, z: -48, face: -2.6, v: { cloth: 0x4a7aa8, cloth2: 0x4a7aa8, hair: 0xf0f0f0, skin: 0xe8d0c0, hs: 3, sc: .95 }, extra: 'tail', idle: [['Großmutter', 'Meerleute werden dreihundert Jahre alt und werden dann zu Schaum. Menschen haben eine Seele, die weiterlebt. So erzählt man es hier unten.']] }],
    intro: [['Erzähler', 'Weit draußen im Meer ist das Wasser so blau wie die Blätter der schönsten Kornblume. Dort unten steht das Schloss des Meerkönigs.'], ['Zotik', 'Ich … kann hier atmen? Das Weltentor ist wirklich unglaublich.']],
    ms: [
      { t: 'collect', g: 'oma', n: 'Perlen für den Schlossgarten', item: 'Perle', look: 'pearl', pts: [[-30, -10], [-34, -40], [-6, -42], [30, -14], [34, -46], [10, -24]],
        a: [['Großmutter', 'Zum Fest der jüngsten Enkelin trägt jedes Kind Perlen im Haar. Der Sturm hat die Austern aufgerissen, und die Perlen liegen überall im Sand.'], ['Großmutter', 'Sammelst du sie ein? Sechs Stück, dann reicht es für alle.']],
        d: [['Großmutter', 'Wunderschön. Danke, kleiner Landgänger.'], ['Die kleine Meerjungfrau', 'Zotik! Oben ist ein Schiff gesunken – im Wrack ist noch jemand!']] },
      { t: 'find', g: 'nixe', n: 'Der Schiffsjunge im Wrack', who: 'Schiffsjunge', at: [24.6, -29], look: 'prince',
        a: [['Die kleine Meerjungfrau', 'Im Sturm ist das Schiff des Prinzen gesunken. Ich habe ihn ans Ufer getragen – aber sein Schiffsjunge ist noch im Wrack eingeschlossen!'], ['Zotik', 'Ich hole ihn raus. Wo liegt das Wrack?'], ['Die kleine Meerjungfrau', 'Östlich, hinter den Korallen.']],
        f: [['Schiffsjunge', 'Luft! … Ich meine – danke! Ich dachte, ich sehe nie wieder den Himmel.'], ['Zotik', 'Halt dich an mir fest. Wir schwimmen nach oben.']],
        d: [['Die kleine Meerjungfrau', 'Du hast ihn gerettet. Aber die Meerhexe hat alles gesehen – sie will den Sturm noch einmal rufen.']] },
      { t: 'boss', g: 'nixe', n: 'Die Meerhexe', foe: 'x', at: [-22, -46],
        a: [['Die kleine Meerjungfrau', 'Hinter den brausenden Strudeln wohnt die Meerhexe. Ihr Haus ist aus Knochen gebaut, und ihr Garten aus Polypen, die nach allem greifen.'], ['Zotik', 'Dann wird es Zeit, dass jemand zurückgreift.']],
        d: [['Erzähler', 'Die Polypen lassen los, die Strudel verstummen. Im Schloss des Meerkönigs leuchtet ein Schlüsselloch aus Perlmutt.'], ['Großmutter', 'Das Meer ist dir dankbar, Zotik.']] }],
    outro: [['Die kleine Meerjungfrau', 'Wenn du oben die Sonne siehst – grüß sie von mir.']] },

  { n: 24, id: 'notredame', name: 'Notre-Dame von Paris', sub: 'Der Glöckner von Notre-Dame · Victor Hugo', src: 'Victor Hugo, Notre-Dame de Paris (1831)', em: '🔔', col: 0xffd070,
    amp: .25, ground: [0x8a8478, 0x9a9488], path: 0xb8b0a0, ridge: 0x6a6460, border: ['house', 'house', 'house'], decor: [['lamp', 8], ['barrel', 8], ['bush', 4]],
    atm: { top: [.12, .14, .3], mid: [.4, .32, .4], hor: [.95, .6, .4], aur: [.2, .1, .3], ms: [.3, .2, .3], gr: [.2, .18, .16], moon: 0xffe0b0, mg: [0x4a4250, 0x2a2432], fog: 0x6a5a6a, fd: .012, hemi: [0xffd8c0, 0x3a3030, .8], lite: [0xffd0a0, 1], stars: 0, expo: 1.05 },
    pads: [[0, -62, 14], [-24, -22, 8], [0, -44, 10]], rects: [[-14, 14, -71, -60]], key: [0, -56],
    foes: { a: ['geist', 'Nebelgeist', 0xc8c8d8], b: ['archiv', 'Stadtwache', 0x6a6a7a], x: ['sonne', 'Steinerner Wasserspeier', 0x8a8a92, 'Erweckt von Frollos Zorn', 'Der Stein reißt sich vom Turm los!'] },
    npcs: [
      { id: 'quasimodo', name: 'Quasimodo', x: 8, z: -40, face: -2.6, v: { cloth: 0x6a5232, cloth2: 0x4a3a28, hair: 0xb04a22, skin: 0xe0b090, wide: 1.35, sc: .92, hood: 1 }, idle: [['Quasimodo', 'Die Glocken sind meine Familie. Marie ist die größte. Wenn sie singt, zittert ganz Paris – und ich höre sie trotzdem.']] },
      { id: 'esmeralda', name: 'Esmeralda', x: -16, z: -14, face: 2.4, v: { cloth: 0xc8402a, cloth2: 0x2a6a4a, hair: 0x1a120c, skin: 0xd8a478, hs: 2, cape: 0x2a6a4a }, extra: 'tamb', idle: [['Esmeralda', 'Djali kann mit dem Huf die Stunde klopfen. Die Leute lachen – und manche bekreuzigen sich.']] },
      { id: 'gringoire', name: 'Gringoire', x: 14, z: -18, face: -1.8, v: { cloth: 0x3a3a5a, cloth2: 0x2a2a3a, hair: 0x6a4a2a, hat: 1, sc: 1 }, idle: [['Gringoire', 'Ich bin Dichter. Mein Mysterienspiel hat heute niemand gesehen – alle haben dem Narrenpapst zugejubelt. Paris!']] }],
    intro: [['Erzähler', 'Paris, im Jahr 1482. Über den Dächern erheben sich die Türme von Notre-Dame, und die Stadt summt wie ein Bienenkorb.'], ['Zotik', 'So viele Steine. Und jeder davon sieht aus, als hätte jemand Jahre daran gemeißelt.']],
    ms: [
      { t: 'ring', g: 'quasimodo', n: 'Die drei Glocken', item: 'Glocke', look: 'bell', pts: [[-12, -46, 'Glocke Marie'], [12, -48, 'Glocke Jacqueline'], [-2, -36, 'Glocke Emmanuel']],
        a: [['Quasimodo', 'Die Glocken wurden zum Ausbessern herabgelassen und stehen jetzt auf dem Vorplatz. Wenn sie heute nicht läuten, glaubt Paris, die Kathedrale sei tot.'], ['Quasimodo', 'Schlag jede einmal an: Marie, Jacqueline und Emmanuel!']],
        d: [['Erzähler', 'Der Klang rollt über die Seine. Tauben steigen auf, ganz Paris hält den Atem an.'], ['Quasimodo', 'Sie singen! … Du hast sie singen lassen.'], ['Esmeralda', 'Zotik! Djali ist weg – sie ist im Gedränge davongelaufen!']] },
      { t: 'find', g: 'esmeralda', n: 'Djali im Hof der Wunder', who: 'Djali', at: [-30, -32], look: 'goat',
        a: [['Esmeralda', 'Meine kleine Ziege Djali! Wahrscheinlich ist sie in den Hof der Wunder gelaufen – dort, wo die Bettler und Gaukler wohnen, im Westen.'], ['Esmeralda', 'Sie hat goldene Hufe und ein Glöckchen am Hals. Bitte bring sie zurück.']],
        f: [['Djali', 'Määäh!'], ['Zotik', 'Da bist du ja. Komm, Esmeralda wartet.']],
        d: [['Esmeralda', 'Djali! Danke, Zotik.'], ['Quasimodo', 'Etwas stimmt nicht. Frollo stand eben oben auf dem Turm und hat die Wasserspeier verflucht. Einer … bewegt sich!']] },
      { t: 'boss', g: 'quasimodo', n: 'Der Wasserspeier', foe: 'x', at: [0, -50],
        a: [['Quasimodo', 'Ein Wasserspeier hat sich vom Turm gelöst. Er hockt vor dem Portal und lässt niemanden hinein.'], ['Zotik', 'Steine, die fliegen. Na schön. Ich zeige ihm, wie man landet.']],
        d: [['Erzähler', 'Der Wasserspeier zerfällt zu Staub. Im Mittelportal von Notre-Dame glimmt ein Schlüsselloch auf.'], ['Esmeralda', 'Paris hat einen neuen Helden – einen sehr kleinen, sehr flauschigen.']] }],
    outro: [['Quasimodo', 'Wenn du die Glocken hörst, weißt du: Ich denke an dich.']] },

  { n: 25, id: 'camelot', name: 'Camelot', sub: 'Die Sage von König Artus', src: 'Artussage (u. a. Thomas Malory, Le Morte d’Arthur, 1485)', em: '⚔️', col: 0x8ab8ff,
    amp: 1, ground: [0x4a7a3a, 0x5a8a44], path: 0x9a8a64, ridge: 0x3a5a2e, border: ['oak', 'pine', 'rockbig'], decor: [['oak', 12], ['bush', 12], ['rock', 8], ['flower', 14]],
    atm: { top: [.2, .35, .6], mid: [.45, .6, .75], hor: [.85, .85, .8], aur: [.1, .15, .2], ms: [.3, .35, .4], gr: [.12, .2, .1], moon: 0xffffff, mg: [0x3a5a3a, 0x2a3a2a], fog: 0x8aa0b0, fd: .011, hemi: [0xe0f0ff, 0x3a4a2a, .85], lite: [0xfff4e0, 1.15], stars: 0, expo: 1 },
    pads: [[0, -66, 14], [0, -38, 6], [22, -24, 9], [-22, -36, 8]], rects: [[-19, 19, -74, -64]], key: [0, -38],
    foes: { a: ['funke', 'Irrlicht', 0x8ad0ff], b: ['archiv', 'Schattenritter', 0x2a2a3a], x: ['archiv', 'Der Schwarze Ritter', 0x14141c, 'Wächter der Furt', 'Der Schwarze Ritter senkt die Lanze!'] },
    npcs: [
      { id: 'artus', name: 'Artus', x: 5, z: -32, face: -2.8, v: { cloth: 0x2a4a8a, cloth2: 0x6a5a4a, hair: 0xc89a5a, skin: 0xf0d0b0, cape: 0x8a2a2a, sc: .95 }, idle: [['Artus', 'Ich bin nur Knappe bei Sir Kay. Aber Merlin sagt, ich sei für mehr bestimmt. Merlin sagt viel.']] },
      { id: 'merlin', name: 'Merlin', x: -17, z: -30, face: 1.8, v: { cloth: 0x2a2a6a, cloth2: 0x1a1a3a, hair: 0xe8e8f0, beard: 1, hat: 1, sc: 1.02 }, extra: 'staff', idle: [['Merlin', 'Ich lebe rückwärts durch die Zeit. Darum weiß ich, wie es ausgeht – aber nicht, wie es anfängt.']] }],
    intro: [['Erzähler', 'Auf dem Hügel steht Camelot, weiß wie Kreide. Vor der Burg steckt ein Schwert in einem Stein, und niemand kann es herausziehen.'], ['Zotik', 'Ein Schwert im Stein. Ich frage lieber nicht, ob meins auch so festsitzen könnte.']],
    ms: [
      { t: 'defeat', g: 'artus', n: 'Das Turnier der Schatten', foe: 'b', cnt: 5, at: [22, -22], r: 8,
        a: [['Artus', 'Auf dem Turnierplatz sind Ritter aufgetaucht, die keinen Schatten werfen – weil sie selbst Schatten sind.'], ['Artus', 'Die echten Ritter sind alle beim Fest. Hilfst du mir, den Platz zu räumen?']],
        d: [['Artus', 'Der Platz ist frei! Sir Kay wird mir kein Wort glauben.'], ['Merlin', 'Er muss dir nicht glauben, junger Artus. Aber du musst etwas lernen. Zotik – komm zu mir.']] },
      { t: 'ring', g: 'merlin', n: 'Merlins Steinkreis', item: 'Runenstein', look: 'stone', pts: [[-28, -34, 'Runenstein des Mutes'], [-20, -44, 'Runenstein der Treue'], [-15, -36, 'Runenstein der Demut']],
        a: [['Merlin', 'Im Steinkreis schlafen drei Runen: Mut, Treue und Demut. Ein König braucht alle drei – und wer ihm dient, auch.'], ['Merlin', 'Weck sie auf, indem du jede berührst. In welcher Reihenfolge? Das ist das einzige, was egal ist.']],
        d: [['Merlin', 'Die Runen leuchten. Jetzt kann der Stein entscheiden.'], ['Artus', 'Zotik! Ein schwarzer Ritter steht vor dem Schwert im Stein und lässt niemanden heran!']] },
      { t: 'boss', g: 'artus', n: 'Der Schwarze Ritter', foe: 'x', at: [0, -46],
        a: [['Artus', 'Er sagt, nur wer ihn besiegt, darf das Schwert berühren.'], ['Zotik', 'Dann halte schon mal die Hand bereit, Artus.']],
        d: [['Erzähler', 'Der Schwarze Ritter kniet nieder und löst sich in Nebel auf. Artus legt die Hand an das Schwert – und es gleitet aus dem Stein wie aus Wasser.'], ['Merlin', 'Seht: der König. Und im Stein, wo das Schwert steckte, ein Schlüsselloch.']] }],
    outro: [['Artus', 'An meiner Tafel ist immer ein Platz für dich frei – sie ist rund, da ist keiner wichtiger als der andere.']] },

  { n: 26, id: 'theben', name: 'Theben', sub: 'Die Taten des Herakles (Herkules)', src: 'Griechische Mythologie (u. a. Apollodor, Bibliotheke)', em: '🦁', col: 0xffc060,
    amp: 1.2, ground: [0xb8a070, 0xc8b080], path: 0xe0d0a8, ridge: 0x9a7a5a, border: ['cypress', 'rockbig', 'olive'], decor: [['olive', 12], ['cypress', 10], ['rock', 10], ['column', 6]],
    atm: { top: [.15, .35, .75], mid: [.45, .65, .9], hor: [1, .9, .7], aur: [.1, .1, .2], ms: [.3, .3, .3], gr: [.25, .22, .14], moon: 0xffffff, mg: [0x8a7a5a, 0x5a4a3a], fog: 0xd0c0a0, fd: .009, hemi: [0xfff0d0, 0x6a5a3a, .9], lite: [0xfff0d0, 1.3], stars: 0, expo: 1 },
    pads: [[0, -62, 13], [-22, -30, 9], [26, -40, 7], [0, -46, 7]], rects: [[-11, 11, -72, -60], [20, 33, -47, -38]], key: [0, -58],
    foes: { a: ['stern', 'Sonnenfunke', 0xffc060], b: ['skorpion', 'Wüstenskorpion', 0xa07040], x: ['schlange', 'Die Hydra', 0x3a8a4a, 'Neunköpfige aus dem Sumpf von Lerna', 'Für jeden Kopf wachsen zwei nach!'], y: ['sphinx', 'Der Nemeische Löwe', 0xd8a040, 'Sein Fell hält jede Klinge ab', 'Der Löwe brüllt!'] },
    npcs: [
      { id: 'herakles', name: 'Herakles', x: 6, z: -10, face: -2.6, v: { cloth: 0x8a5a2a, cloth2: 0x6a4a2a, hair: 0x2a1a10, skin: 0xc89070, beard: 1, wide: 1.35, sc: 1.18 }, idle: [['Herakles', 'Zwölf Aufgaben hat mir König Eurystheus gestellt. Zwölf! Er hofft, dass ich bei einer davon aufgebe.']] },
      { id: 'iolaos', name: 'Iolaos', x: -6, z: -42, face: 2.8, v: { cloth: 0xe0d8c0, cloth2: 0x8a6a4a, hair: 0x5a3a1a, skin: 0xd8a888, sc: .92 }, extra: 'torch', idle: [['Iolaos', 'Ich bin Herakles’ Neffe und sein Wagenlenker. Er sagt, ohne mich hätte er die Hydra nie geschafft. Er sagt das selten.']] }],
    intro: [['Erzähler', 'Sonne auf weißem Stein. Zwischen Zypressen und Olivenbäumen liegt ein Tempel, und von Norden riecht es nach Sumpf.'], ['Zotik', 'Warm hier. Felli, bleib im Schatten.']],
    ms: [
      { t: 'collect', g: 'herakles', n: 'Die Äpfel der Hesperiden', item: 'Goldener Apfel', look: 'gapple', pts: [[-30, -24], [-26, -38], [-14, -26], [-32, -48], [-16, -18]],
        a: [['Herakles', 'Eine meiner Aufgaben: goldene Äpfel aus dem Garten der Hesperiden. Der Drache Ladon schläft gerade – aber die Äpfel sind vom Baum gefallen und liegen im ganzen Garten im Westen.'], ['Herakles', 'Ich trage gerade den Himmel für Atlas. Sammelst du sie für mich? Fünf Stück.']],
        d: [['Herakles', 'Fünf goldene Äpfel! Eurystheus wird sich ärgern.'], ['Herakles', 'Die nächste Aufgabe ist härter: ein Löwe, dessen Fell keine Klinge durchdringt. Er haust in der Höhle im Osten.']] },
      { t: 'boss', g: 'herakles', n: 'Der Nemeische Löwe', foe: 'y', at: [26, -36],
        a: [['Herakles', 'Mein Rat: Schwert und Pfeile prallen an ihm ab. Ich habe ihn am Ende mit bloßen Händen gerungen.'], ['Zotik', 'Ich bin nicht so groß wie du. Ich bin aber schneller.']],
        d: [['Herakles', 'Bei Zeus! Du hast ihn bezwungen. Sein Fell soll fortan mich schützen.'], ['Iolaos', 'Onkel! Die Hydra ist aus dem Sumpf gekrochen und liegt vor dem Tempel!']] },
      { t: 'boss', g: 'iolaos', n: 'Die Hydra', foe: 'x', at: [0, -48],
        a: [['Iolaos', 'Schlägst du ihr einen Kopf ab, wachsen zwei nach. Ich halte die Fackel bereit – zusammen schaffen wir das!'], ['Zotik', 'Dann zielen wir aufs Herz, nicht auf die Köpfe.']],
        d: [['Erzähler', 'Die Hydra sinkt zurück in den Sumpf. Auf den Stufen des Tempels erscheint ein Schlüsselloch aus Sonnenlicht.'], ['Herakles', 'Zwei Taten an einem Tag – und eine davon war deine. Ich werde in meinen Liedern von dir erzählen.']] }],
    outro: [['Herakles', 'Bleib stark, kleiner Held. Stärke ist nicht, wie viel man trägt, sondern dass man wieder aufsteht.']] },

  { n: 27, id: 'mauer', name: 'Die Große Mauer', sub: 'Die Ballade von Hua Mulan', src: 'Ballade von Mulan (Nordchina, 5.–6. Jh.)', em: '🏮', col: 0xff6a4a,
    amp: 1.6, ground: [0x6a7a4a, 0x7a8a54], path: 0xa89a74, ridge: 0x5a5a4a, border: ['rockbig', 'pine', 'rockbig'], decor: [['pine', 12], ['rock', 12], ['bush', 8], ['bamboo', 10]],
    atm: { top: [.25, .3, .5], mid: [.6, .6, .7], hor: [.95, .8, .65], aur: [.2, .15, .2], ms: [.3, .3, .35], gr: [.15, .18, .12], moon: 0xfff0e0, mg: [0x5a5a6a, 0x3a3a4a], fog: 0xa8a0a0, fd: .012, hemi: [0xffe8d8, 0x4a4a3a, .85], lite: [0xfff0e0, 1.1], stars: 0, expo: 1 },
    pads: [[0, -62, 12], [-18, -14, 8], [0, -48, 8]], rects: [[-50, 50, -68, -59], [-30, -10, -30, -6]], key: [0, -58],
    foes: { a: ['funke', 'Funkengeist', 0xff8040], b: ['archiv', 'Eindringling', 0x6a3a2a], x: ['archiv', 'Der Sturmreiter', 0x8a2020, 'Anführer der Eindringlinge', 'Der Sturmreiter ruft zum Angriff!'] },
    npcs: [
      { id: 'mulan', name: 'Hua Mulan', x: 6, z: -12, face: -2.6, v: { cloth: 0x8a4a2a, cloth2: 0x3a3a3a, hair: 0x14100c, skin: 0xf0d0b0, hs: 3, cape: 0x6a2a1a, sc: .95 }, extra: 'spear', idle: [['Hua Mulan', 'Klick-klack, klick-klack – so klang der Webstuhl meiner Mutter. Jetzt klingt mein Leben nach Hufen und Trommeln.']] },
      { id: 'feldherr', name: 'Feldherr', x: -14, z: -20, face: 2.2, v: { cloth: 0x4a4a5a, cloth2: 0x2a2a2a, hair: 0x2a2a2a, beard: 1, hat: 1, wide: 1.2, sc: 1.05 }, idle: [['Feldherr', 'Zwölf Jahre dient Hua schon in meinem Heer. Die besten zwölf Jahre, die dieses Heer je hatte.']] }],
    intro: [['Erzähler', 'Über die Berge zieht sich eine Mauer aus Stein, so lang, dass niemand ihr Ende kennt. Davor liegt ein Lager mit Zelten und Bannern.'], ['Zotik', 'Eine Mauer, die über Berge klettert. Und ich dachte, Treppen sind anstrengend.']],
    ms: [
      { t: 'ring', g: 'feldherr', n: 'Die Signalfeuer', item: 'Signalfeuer', look: 'beacon', pts: [[-30, -42, 'Westliches Signalfeuer'], [30, -34, 'Östliches Signalfeuer'], [-6, -32, 'Mittleres Signalfeuer']],
        a: [['Feldherr', 'Späher melden Reiter im Norden. Die Signalfeuer müssen brennen, damit die Türme entlang der Mauer gewarnt werden.'], ['Feldherr', 'Entzünde alle drei – im Westen, im Osten und in der Mitte!']],
        d: [['Erzähler', 'Rauchsäulen steigen auf, und von Turm zu Turm springt die Warnung über die Berge.'], ['Hua Mulan', 'Gut gemacht! Jetzt halten wir das Tor.']] },
      { t: 'defeat', g: 'mulan', n: 'Das Tor halten', foe: 'b', cnt: 6, at: [0, -44], r: 9,
        a: [['Hua Mulan', 'Sie kommen über den Pass. Sechs Späher vorneweg – wenn wir die aufhalten, verliert der Rest den Mut.'], ['Hua Mulan', 'Ich nehme die linke Seite. Du die rechte. Und Zotik – pass auf deinen Schwanz auf.']],
        d: [['Hua Mulan', 'Das Tor hält!'], ['Feldherr', 'Dort! Der Sturmreiter selbst – ihr Anführer. Wenn er fällt, ist der Krieg vorbei.']] },
      { t: 'boss', g: 'mulan', n: 'Der Sturmreiter', foe: 'x', at: [0, -50],
        a: [['Hua Mulan', 'Zwölf Jahre habe ich gekämpft, damit mein Vater zu Hause bleiben konnte. Heute bringe ich es zu Ende.'], ['Zotik', 'Zusammen.']],
        d: [['Erzähler', 'Der Sturmreiter fällt, und sein Heer zieht sich in die Steppe zurück. Im großen Tor der Mauer glänzt ein Schlüsselloch.'], ['Hua Mulan', 'Weißt du, was ich jetzt mache? Nach Hause gehen. Mein altes Kleid anziehen. Und sehen, ob meine Kameraden mich wiedererkennen.']] }],
    outro: [['Hua Mulan', 'Der Hase hüpft, die Häsin blinzelt – doch laufen beide Seite an Seite, wer kann da sagen, wer wer ist?']] }
];
export const MW = WORLDS;

export function createMaerchen(C) {
  const { T, G, PG, M, mk, glow } = C;
  const W = n => WORLDS.find(w => w.n === n);
  const st = id => { const S = C.S(); S.mw = S.mw || {}; return S.mw[id] = S.mw[id] || { m: 0, st: 0, c: 0, got: {} }; };
  const seals = () => WORLDS.filter(w => st(w.id).done).length;
  const open = () => { const S = C.S(); return S.stage >= 1 && !C.MP().on; };
  let cur = null;   // laufende Welt: {w, g, items[], ints[], keyG}

  /* ---------- Gelände ---------- */
  function heightFn(w) {
    const pads = w.pads, rects = w.rects || [], pools = w.pools || [], ph = w.n * 1.37, amp = w.amp;
    return (x, z) => {
      const dx = x - CX, dz = z - CZ, d = Math.hypot(dx, dz);
      let q = (Math.sin(x * .07 + ph) * Math.cos(z * .06 + ph * .5) * 1.2 + Math.sin(x * .031 + z * .027 + ph) * 1.6 + Math.sin(x * .17 + z * .13) * .25) * amp;
      let f = 1 - (1 - sm(2.5, 6, Math.abs(x - PATHX(z)))) * sm(-64, -58, z) * (1 - sm(10, 14, z));   // Weg bleibt eben
      for (const [px, pz, r] of pads) f = Math.min(f, sm(r, r + 6, Math.hypot(x - px, z - pz)));
      for (const [x0, x1, z0, z1] of rects) f = Math.min(f, sm(0, 6, Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1))));   // lange Bauten (Mauer, Burg) stehen eben
      f = Math.min(f, sm(6, 11, Math.hypot(x, z - 5)));   // Ankunftsplatz
      q *= f;
      for (const [px, pz, r] of pools) { const pd = Math.hypot(x - px, z - pz); q -= 1.3 * (1 - sm(r - 1, r + 1.5, pd)); }
      const k = Math.max(0, d - R); return q + k * k * .38;   // Rand: steiler, sichtbarer Hang
    };
  }

  /* ---------- Bausteine ---------- */
  function solidBox(x, z, w, d, ry) { const L = Math.max(w, d), r = Math.min(w, d) / 2, n = Math.max(1, Math.ceil((L - r * 2) / (r * .6)) + 1), c = Math.cos(ry || 0), s = Math.sin(ry || 0);
    for (let i = 0; i < n; i++) { const u = n === 1 ? 0 : (i / (n - 1) - .5) * (L - r * 2), lx = w >= d ? u : 0, lz = w >= d ? 0 : u; C.addCol(x + lx * c + lz * s, z - lx * s + lz * c, r); } }
  function B(g) {
    const o = {
      box(x, y, z, w, h, d, col, op) { op = op || {}; const m = mk(G.box, M(col, op.mat || {}), x, y + h / 2, z, w, h, d, op.cast !== false); if (op.ry) m.rotation.y = op.ry; if (op.rx) m.rotation.x = op.rx; if (op.rz) m.rotation.z = op.rz; g.add(m); if (op.solid) solidBox(x, z, w, d, op.ry); return m; },
      cyl(x, y, z, r, h, col, op) { op = op || {}; const m = mk(op.lo ? G.cyl0 : G.cyl, M(col, op.mat || {}), x, y + h / 2, z, r, h, r, op.cast !== false); g.add(m); if (op.solid) C.addCol(x, z, r); return m; },
      cone(x, y, z, r, h, col, op) { op = op || {}; const m = mk(op.lo ? G.cone0 : G.cone, M(col, op.mat || {}), x, y + h / 2, z, r, h, op.rz2 || r, op.cast !== false); if (op.ry) m.rotation.y = op.ry; g.add(m); if (op.solid) C.addCol(x, z, r * .85); return m; },
      sph(x, y, z, sx, sy, sz, col, op) { op = op || {}; const m = mk(G.sph, M(col, op.mat || {}), x, y, z, sx, sy, sz, op.cast !== false); g.add(m); if (op.solid) C.addCol(x, z, Math.min(sx, sz) * .95); return m; },
      ico(x, y, z, sx, sy, sz, col, op) { op = op || {}; const m = mk(G.ico, M(col, op.mat || { f: 1 }), x, y, z, sx, sy, sz); g.add(m); if (op.solid) C.addCol(x, z, Math.min(sx, sz) * .9); return m; },
      tor(x, y, z, s, col, op) { op = op || {}; const m = mk(G.tor, M(col, op.mat || {}), x, y, z, s, s, op.d || s, false); if (op.rx != null) m.rotation.x = op.rx; if (op.ry) m.rotation.y = op.ry; g.add(m); return m; },
      glow(col, sz, x, y, z, op) { const s = glow(col, sz, x, y, z, op); g.add(s); return s; }
    };
    return o;
  }

  /* ---------- Streu-Dekoration (Instanzen, ein Zeichenaufruf je Teil) ---------- */
  // Teil: [Geometrie, Farbe, y, sx, sy, sz, Material-Optionen]; col = Kollisionsradius (Stamm/Fels) bei Maßstab 1
  const DECOR = {
    oak: { parts: [[() => PG.trunk, 0x4a3426, 1.3, .5, 2.6, .5], [() => PG.canopy, 0x2a4a2a, 3.6, 2.3, 1.9, 2.3, { f: 1 }]], col: .42 },
    pine: { parts: [[() => PG.trunk, 0x4a3426, 1, .4, 2, .4], [() => PG.pine, 0x1e4a2e, 3.6, 1.9, 4.2, 1.9, { f: 1 }]], col: .36 },
    jungle: { parts: [[() => PG.trunk, 0x5a4430, 2.2, .45, 4.4, .45], [() => PG.canopy, 0x2a7a2a, 5, 3, 1.5, 3, { f: 1 }], [() => G.cyl0, 0x3a6a2a, 2.4, .05, 4.6, .05]], col: .38 },
    palm: { parts: [[() => G.cyl0, 0x7a6040, 2.2, .22, 4.4, .22], [() => G.ico, 0x3a8a2a, 4.5, 2.4, .45, 2.4, { f: 1 }]], col: .25 },
    fern: { parts: [[() => G.ico, 0x3a7a2a, .45, .9, .55, .9, { f: 1 }]], col: 0 },
    rock: { parts: [[() => PG.rock, 0x6a6a72, .45, 1.1, .9, 1.1, { f: 1 }]], col: .95 },
    rockbig: { parts: [[() => PG.rock, 0x6a6460, 1.6, 4, 4.5, 4, { f: 1 }]], col: 3.6 },
    bush: { parts: [[() => G.ico, 0x2e5a2e, .6, 1.1, .85, 1.1, { f: 1 }]], col: .85 },
    mush: { parts: [[() => G.cyl0, 0xe8e0d0, .25, .09, .5, .09], [() => PG.cap, 0x9a4ad8, .5, .35, .32, .35, { e: 0x7a2ab8, ei: 1.2 }]], col: 0 },
    flower: { parts: [[() => G.sph0, 0xffd04a, .18, .14, .14, .14, { e: 0x8a6a10, ei: .6 }], [() => G.ico, 0x3a7a2a, .1, .3, .15, .3]], col: 0 },
    kelp: { parts: [[() => G.cyl0, 0x2a8a4a, 2.4, .12, 4.8, .12, { e: 0x0a3a1a, ei: 1 }], [() => G.ico, 0x3a9a5a, 4.6, .5, .9, .5]], col: 0 },
    coral: { parts: [[() => G.cone0, 0xe0607a, .8, .55, 1.6, .55, { e: 0x601020, ei: .8 }], [() => G.sph0, 0xffa0c0, 1.6, .35, .35, .35, { e: 0x803050, ei: 1 }]], col: .5 },
    shell: { parts: [[() => G.sph0, 0xf0e0d0, .1, .35, .14, .3, { m: .4, r: .3 }]], col: 0 },
    olive: { parts: [[() => PG.trunk, 0x6a5a44, 1, .45, 2, .45], [() => PG.canopy, 0x7a8a5a, 2.6, 1.9, 1.3, 1.9, { f: 1 }]], col: .38 },
    cypress: { parts: [[() => G.cyl0, 0x4a3a2a, .6, .22, 1.2, .22], [() => G.cone, 0x1e3a24, 3.4, .9, 5.6, .9, { f: 1 }]], col: .3 },
    column: { parts: [[() => G.cyl, 0xe8e0d0, 1.4, .55, 2.8, .55], [() => G.box, 0xe0d8c8, 2.9, 1.3, .25, 1.3]], col: .62 },
    lamp: { parts: [[() => G.cyl0, 0x2a2a2e, 1.4, .08, 2.8, .08], [() => G.sph0, 0xffd890, 2.9, .2, .26, .2, { e: 0xffc060, ei: 2 }]], col: .2 },
    barrel: { parts: [[() => G.cyl, 0x6a4a2a, .5, .4, 1, .4]], col: .45 },
    bamboo: { parts: [[() => G.cyl0, 0x7aa04a, 2.2, .1, 4.4, .1], [() => G.cyl0, 0x8ab05a, 2, .1, 4, .1], [() => G.ico, 0x5a8a3a, 4.2, .8, .5, .8]], col: .2 },
    house: { parts: [[() => G.box, 0xd8c8a8, 4.5, 4.2, 9, 4.2], [() => G.cone0, 0x4a4a5a, 9.8, 3.4, 2.4, 3.4, { f: 1 }]], col: 0 }
  };
  const offs = { jungle: [[0, 0], [1.2, .6]], bamboo: [[0, 0], [.5, .3], [-.3, .5]] };   // seitliche Versätze für Mehrfach-Teile
  function scatter(g, list, keep) {   // list: [[x,z,kind,scale,rot]]
    const by = {}; for (const it of list) (by[it[2]] = by[it[2]] || []).push(it);
    for (const k in by) { const D = DECOR[k], L = by[k]; D.parts.forEach((p, pi) => { const geo = p[0](), im = new T.InstancedMesh(geo, M(p[1], p[6] || {}), L.length), q = new T.Object3D();
      L.forEach(([x, z, , s, r], i) => { const of = (offs[k] && offs[k][pi]) || [0, 0], y = cur.h(x, z); q.position.set(x + of[0] * s, y + p[2] * s, z + of[1] * s); q.rotation.set(0, r, 0); q.scale.set(p[3] * s, p[4] * s, p[5] * s); q.updateMatrix(); im.setMatrixAt(i, q.matrix); });
      im.castShadow = k !== 'flower' && k !== 'shell'; im.receiveShadow = true; im.frustumCulled = false; g.add(im); keep.push(im); });
      if (D.col) for (const [x, z, , s] of L) if (Math.hypot(x - CX, z - CZ) < R + 1) C.addCol(x, z, D.col * s); }
  }

  /* ---------- Figuren ---------- */
  function extra(P, kind, sc) {
    const r = P.root, s = 1 / (sc || 1), add = m => { r.add(m); return m; };
    if (kind === 'lamp') { add(mk(G.cyl0, M(0x2a2a2e), .35 * s, .55 * s, .1 * s, .03 * s, .3 * s, .03 * s)); add(mk(G.sph0, M(0xffd890, { e: 0xffc060, ei: 2.2 }), .35 * s, .4 * s, .1 * s, .1 * s, .13 * s, .1 * s, false)); add(glow(0xffc060, 1.2 * s, .35 * s, .4 * s, .1 * s, .7)); }
    if (kind === 'pick') { const h = add(mk(G.cyl0, M(0x6a4a2a), .32 * s, .6 * s, 0, .03 * s, .8 * s, .03 * s)); h.rotation.z = .5; add(mk(G.box, M(0x8a8a92, { m: .7 }), .52 * s, .95 * s, 0, .4 * s, .06 * s, .06 * s)); }
    if (kind === 'tail') { const t = add(mk(G.cone, M(P.tailCol || 0x2a8a8a, { e: 0x0a3a3a, ei: .8, r: .4 }), 0, .3 * s, 0, .3 * s, .62 * s, .3 * s)); t.rotation.x = Math.PI; const f = add(mk(G.box, M(P.tailCol || 0x2a8a8a, { e: 0x0a3a3a, ei: .8 }), 0, .03 * s, .12 * s, .55 * s, .04 * s, .3 * s)); f.rotation.x = .3; }
    if (kind === 'tamb') { const t = add(mk(G.cyl, M(0xd8b070, { m: .3 }), -.38 * s, .95 * s, .15 * s, .18 * s, .05 * s, .18 * s)); t.rotation.x = 1.2; }
    if (kind === 'staff') { add(mk(G.cyl0, M(0x5a4030), .38 * s, .95 * s, .1 * s, .035 * s, 1.9 * s, .035 * s)); add(mk(G.oct, M(0x8ad0ff, { e: 0x4aa0ff, ei: 2 }), .38 * s, 1.95 * s, .1 * s, .1 * s, .14 * s, .1 * s, false)); add(glow(0x8ad0ff, 1.1 * s, .38 * s, 1.95 * s, .1 * s, .6)); }
    if (kind === 'torch') { add(mk(G.cyl0, M(0x5a4030), .36 * s, .9 * s, .15 * s, .04 * s, .9 * s, .04 * s)); add(mk(G.cone0, M(0xff8a2a, { e: 0xff6a10, ei: 2.4 }), .36 * s, 1.45 * s, .15 * s, .1 * s, .26 * s, .1 * s, false)); add(glow(0xffa040, 1.4 * s, .36 * s, 1.5 * s, .15 * s, .7)); }
    if (kind === 'spear') { const sp = add(mk(G.cyl0, M(0x5a3a22), .36 * s, 1 * s, .05 * s, .03 * s, 2.2 * s, .03 * s)); sp.rotation.z = -.08; add(mk(G.cone0, M(0xc8c8d0, { m: .8, r: .3 }), .45 * s, 2.15 * s, .05 * s, .05 * s, .22 * s, .05 * s)); add(mk(G.box, M(0xc83a2a), .43 * s, 1.95 * s, .05 * s, .02 * s, .14 * s, .1 * s, false)); }
  }
  function npcModel(d) {
    if (d.ani) { const [kind, col, sc] = d.ani, P = C.CR().makeKind(kind, col, false); P.root.scale.setScalar(sc); P.arms = [new T.Group()]; if (!P.legs || P.legs.length < 2) P.legs = [new T.Group(), new T.Group()]; if (!P.head) P.head = new T.Group(); return P; }
    const P = C.makeVillager(d.v); if (d.extra) { if (d.extra === 'tail') P.tailCol = d.v.cloth; extra(P, d.extra, d.v.sc); } return P;
  }
  function piece(look) {   // Auftragsteile: Laterne, Perle, Apfel, …
    const g = new T.Group();
    switch (look) {
      case 'lamp': g.add(mk(G.box, M(0x3a3a3e, { m: .5 }), 0, .45, 0, .32, .5, .32)); g.add(mk(G.sph0, M(0xffd890, { e: 0xffc060, ei: 2.4 }), 0, .45, 0, .2, .22, .2, false)); g.add(glow(0xffc060, 2.2, 0, .5, 0, .8)); break;
      case 'pearl': g.add(mk(G.sph0, M(0xe0d8d0, { e: 0x6a6a7a, ei: 1, m: .4, r: .2 }), 0, .1, 0, .5, .2, .4)); g.add(mk(G.sph, M(0xffffff, { e: 0xd8e8ff, ei: 1.4, r: .1 }), 0, .3, 0, .2, .2, .2, false)); g.add(glow(0xd8f0ff, 1.8, 0, .35, 0, .8)); break;
      case 'gapple': g.add(mk(G.sph, M(0xffc830, { e: 0xa07010, ei: 1.4, m: .6, r: .25 }), 0, .32, 0, .28, .28, .28)); g.add(mk(G.cyl0, M(0x4a3a20), 0, .62, 0, .03, .12, .03, false)); g.add(glow(0xffd860, 2, 0, .35, 0, .8)); break;
      default: g.add(mk(G.oct, M(0xffe08a, { e: 0xffc040, ei: 2 }), 0, .5, 0, .25, .35, .25)); g.add(glow(0xffd860, 2, 0, .5, 0, .8));
    }
    return g;
  }
  function trigger(look, lit) {   // Auslöse-Stellen: Lehrstein, Glocke, Runenstein, Signalfeuer
    const g = new T.Group(), b = B(g), fire = new T.Group(); g.add(fire); let ring = null;
    switch (look) {
      case 'bell': b.box(-1.1, 0, 0, .25, 3, .25, 0x5a3a22); b.box(1.1, 0, 0, .25, 3, .25, 0x5a3a22); b.box(0, 2.9, 0, 2.6, .25, .3, 0x5a3a22);
        b.cone(0, 1.2, 0, .85, 1.6, 0xb08a3a, { mat: { m: .85, r: .3 } }); b.sph(0, 2.75, 0, .45, .3, .45, 0xb08a3a, { mat: { m: .85, r: .3 } }); break;
      case 'beacon': b.cyl(0, 0, 0, 1.3, 1.2, 0x8a8478, { mat: { r: 1 } }); for (let i = 0; i < 5; i++) { const l = b.cyl(Math.cos(i * 1.26) * .4, 1.3, Math.sin(i * 1.26) * .4, .12, 1, 0x5a3a1a, { lo: 1 }); l.rotation.z = .4 * Math.cos(i); }
        fire.add(mk(G.cone0, M(0xff8a2a, { e: 0xff6a10, ei: 2.4 }), 0, 2.1, 0, .6, 1.4, .6, false)); fire.add(glow(0xffa040, 5, 0, 2.2, 0, .8)); break;
      default: b.ico(0, 1, 0, .9, 1.5, .7, 0x7a7a82, { mat: { f: 1, r: 1 } }); ring = b.tor(0, 1.3, .62, .35, 0x8ad0ff, { mat: { e: 0x4aa0ff, ei: .2 }, rx: 0, d: .05 });
    }
    fire.visible = !!lit; if (ring) ring.material = M(lit ? 0x8affc0 : 0x6a7a8a, { e: lit ? 0x4adf8a : 0x1a2a3a, ei: lit ? 2 : .3 });
    return { g, fire, ring };
  }

  /* ---------- Wahrzeichen je Welt ---------- */
  const LAND = {
    spiegel(b, w) {
      // Zwergenhaus mit Fachwerk und Satteldach
      b.box(-16, 0, -24, 8, 3.2, 5.5, 0xe8dcc0, { solid: 1 }); for (const x of [-19.8, -12.2]) b.box(x, 0, -24, .3, 3.2, 5.7, 0x5a3a22, { cast: false });
      for (const s of [-1, 1]) b.box(-16, 3.5, -24 + s * 1.5, 8.8, .3, 3.4, 0x7a3a2a, { rx: s * .62 });
      b.box(-16, 0, -21.2, 1.3, 2.1, .1, 0x5a3a22); for (const x of [-18.6, -13.4]) { b.box(x, 1.3, -21.22, 1, .9, .06, 0xffd890, { mat: { e: 0xffc060, ei: 1.6 }, cast: false }); }
      b.cyl(-13, 3.3, -25, .35, 1.8, 0x6a5a50, { lo: 1 }); for (let i = 0; i < 7; i++) b.box(-19.5 + i * .55, .02, -20.2, .3, .3, .05, 0x8a5a3a, { cast: false });   // sieben kleine Stufen
      // großer Zauberspiegel im Norden (Rahmen mit Schlüsselloch)
      b.box(0, 0, -57.5, 4.6, .9, 1.4, 0x3a2a4a, { solid: 1 }); b.tor(0, 3.6, -57.5, 2.1, 0xc8a24a, { mat: { m: .9, r: .25 }, rx: 0, d: 1.2 });
      b.sph(0, 3.6, -57.5, 1.95, 1.95, .08, 0xd8e8ff, { mat: { m: 1, r: .05 } }); b.glow(0xc8a0ff, 7, 0, 3.6, -57, .45);
      // Apfelbaum
      b.cyl(10, 0, -12, .35, 2.4, 0x5a3a22, { solid: 1 }); b.ico(10, 3.4, -12, 2.2, 1.7, 2.2, 0x3a6a2a); for (let i = 0; i < 7; i++) b.sph(10 + Math.cos(i) * 1.6, 2.6 + (i % 3) * .5, -12 + Math.sin(i) * 1.6, .17, .17, .17, 0xd02a2a, { mat: { e: 0x500a0a, ei: .8 } });
    },
    dschungel(b) {
      // Ratsfelsen: flacher Felsblock mit Steinkreis
      b.ico(0, .8, -58, 5.2, 1.6, 4.2, 0x8a7a64, { solid: 1, mat: { f: 1, r: 1 } }); for (let i = 0; i < 9; i++) { const a = i * .7 - 2.8; b.ico(Math.sin(a) * 7.5, .4, -58 + Math.cos(a) * 6.5, .7, .6, .7, 0x6a6458, { solid: 1 }); }
      // Kalte Höhlen: verfallene Affenstadt
      for (const [x, z, h] of [[18, -40, 4.5], [30, -40, 3], [18, -28, 2], [31, -27, 4.8], [24, -42, 5.4]]) { b.box(x, 0, z, 1.6, h, 1.6, 0x8a8a7a, { solid: 1, mat: { r: 1 } }); b.ico(x, h + .2, z, 1.2, .5, 1.2, 0x3a7a2a); }
      b.box(24, 0, -42, 8, 5.4, 1.6, 0x7a7a6c, { solid: 1 }); b.box(24, 0, -42.9, 3, 3.6, .2, 0x2a2a24, { cast: false }); for (let i = 0; i < 4; i++) b.box(24, i * .3, -38.5 + i * .5, 4, .3, .6, 0x8a8a7a);
      // Banyanbaum
      b.cyl(-20, 0, -30, 1.4, 6, 0x5a4430, { solid: 1 }); b.ico(-20, 7.5, -30, 6, 2.5, 6, 0x2a6a2a); for (let i = 0; i < 8; i++) b.cyl(-20 + Math.cos(i * .8) * 4.2, 0, -30 + Math.sin(i * .8) * 4.2, .12, 6.6, 0x6a5440, { lo: 1, solid: 1 });
    },
    meer(b) {
      // Schloss des Meerkönigs: Korallentürme und Perlmuttbögen
      b.box(0, 0, -63, 16, 6, 4, 0xe8b8c8, { solid: 1, mat: { e: 0x5a2a3a, ei: .4 } });
      for (const x of [-8, -3, 3, 8]) { b.cyl(x, 0, -60.5, 1.2, 9 - Math.abs(x) * .4, 0xf0c8d8, { solid: 1 }); b.cone(x, 9 - Math.abs(x) * .4, -60.5, 1.4, 3, 0x6ad8c8, { mat: { e: 0x2a7a6a, ei: .8 } }); }
      b.tor(0, 3.2, -60.9, 2.6, 0xf8f0ff, { mat: { e: 0xa0d8ff, ei: .8, m: .6, r: .2 }, rx: 0, d: 1 }); b.glow(0xa0f0ff, 9, 0, 4, -60, .4);
      // gesunkenes Schiff (schräg im Sand)
      b.box(20, -.4, -33, 3.6, 2.6, 11, 0x5a3a24, { solid: 1, rz: .22 }); b.box(20, 2.2, -33, 3.2, .2, 10, 0x6a4a30, { rz: .22 }); const ms = b.cyl(19.3, 0, -31, .2, 9, 0x4a3020, { lo: 1 }); ms.rotation.z = .35; b.box(17.6, 4.6, -31, 4, 2.6, .05, 0xd8d0b8, { rz: .35, cast: false });
      // Garten der Meerjungfrau: rote Sonnenblumen und die Marmorstatue (Andersen)
      for (let i = 0; i < 12; i++) { const a = i * .52; b.sph(-16 + Math.cos(a) * 3.6, .4, -20 + Math.sin(a) * 3.6, .35, .35, .35, 0xe0302a, { mat: { e: 0x7a1010, ei: 1 } }); }
      b.cyl(-16, 0, -20, .6, .8, 0xe8e8f0, { solid: 1 }); b.cyl(-16, .8, -20, .28, 1.2, 0xf4f4f8); b.sph(-16, 2.25, -20, .25, .28, .25, 0xf4f4f8);
      // Höhle der Meerhexe: Knochenbögen und Polypen
      for (let i = 0; i < 6; i++) { const a = i * 1.05; const t = b.cyl(-24 + Math.cos(a) * 5, 0, -52 + Math.sin(a) * 5, .12, 2.6 + (i % 2), 0x5a8a3a, { lo: 1, mat: { e: 0x1a4a1a, ei: 1 } }); t.rotation.z = Math.sin(i) * .3; }
      for (const s of [-1, 1]) { const r = b.tor(-24 + s * 2, 2.6, -56, 2.4, 0xe8e0c8, { rx: 0, ry: s * .5, d: .6 }); r.scale.y = 1.6; }
      // Lichtsäulen von der Oberfläche
      for (const [x, z] of [[-10, -36], [12, -18], [6, -46], [-28, -14]]) { const m = mk(G.cyl, new T.MeshBasicMaterial({ color: 0x8ae8ff, transparent: true, opacity: .07, depthWrite: false, blending: T.AdditiveBlending }), x, 10, z, 2.4, 22, 2.4, false); b.g.add(m); }
    },
    notredame(b) {
      // Westfassade von Notre-Dame: zwei Türme, Fensterrose, drei Portale, Königsgalerie
      const Z = -66, S = 0xb8b0a0, D = 0x9a9284;
      b.box(0, 0, Z, 26, 14, 8, S, { solid: 1, mat: { r: .95 } });
      for (const x of [-9.5, 9.5]) { b.box(x, 14, Z, 7, 10, 7, S); for (const dx of [-2.2, 0, 2.2]) b.box(x + dx, 17, Z + 3.52, .9, 5, .1, 0x2a2a34, { cast: false }); b.box(x, 24, Z, 7.6, .5, 7.6, D); }
      b.box(0, 14, Z, 12, 2.4, 6.4, D); for (let i = 0; i < 9; i++) b.box(-5.4 + i * 1.35, 14.6, Z + 3.25, .5, 1.6, .2, 0x8a8478);
      b.tor(0, 10, Z + 4.05, 2.6, D, { rx: 0, d: .8 }); const rose = b.cyl(0, 10, Z + 4.02, 2.4, .1, 0x6a5aff, { mat: { e: 0x4a3ad8, ei: 1.2 }, cast: false }); rose.rotation.x = Math.PI / 2; rose.position.y = 10;
      for (const x of [-8, 0, 8]) { b.box(x, 0, Z + 4.06, 3.4, 5.4, .1, 0x2a2420, { cast: false }); b.cone(x, 5.4, Z + 4.06, 1.75, 1.6, D, { cast: false, rz2: .1 }); }
      for (let i = 0; i < 28; i++) b.box(-13 + i * .96, 8, Z + 4.1, .5, .15, .3, D, { cast: false });
      // Hof der Wunder: Zeltplanen und Feuertonnen
      for (const [x, z, c] of [[-28, -18, 0x8a2a2a], [-20, -26, 0x4a6a2a], [-30, -28, 0x6a4a8a]]) { b.cyl(x, 0, z, .12, 2.6, 0x5a4030, { lo: 1, solid: 1 }); const t = b.cone(x, 1.4, z, 2.4, 1.6, c, { lo: 1, mat: { f: 1 } }); t.rotation.y = .4; }
      for (const [x, z] of [[-24, -22], [-26, -30]]) { b.cyl(x, 0, z, .45, 1, 0x3a3a3a, { solid: 1 }); b.glow(0xff9a40, 3, x, 1.3, z, .7); }
      b.box(0, 0, -44, 12, .08, 12, 0xa8a090, { cast: false });   // Vorplatz
    },
    camelot(b) {
      // Burg Camelot: Mauer mit Zinnen, Rundtürme mit Spitzdächern, Tor
      const Z = -70, S = 0xe8e4dc;
      b.box(0, 0, Z, 30, 7, 3, S, { solid: 1 }); for (let i = 0; i < 15; i++) b.box(-14 + i * 2, 7, Z + 1.2, 1, .9, .6, S);
      for (const x of [-15, 15, -6, 6]) { const big = Math.abs(x) > 10; b.cyl(x, 0, Z + .5, big ? 2.6 : 1.8, big ? 11 : 9, S, { solid: 1 }); b.cone(x, big ? 11 : 9, Z + .5, big ? 3 : 2.1, big ? 5 : 4, 0x3a5aa8, { mat: { f: 1 } }); b.box(x, (big ? 11 : 9) + (big ? 5 : 4), Z + .5, .05, 1.2, .05, 0x5a4030); b.box(x + .4, (big ? 11 : 9) + (big ? 5.6 : 4.6), Z + .5, .8, .5, .04, 0xd8b030, { cast: false }); }
      b.box(0, 0, Z + 1.55, 3.6, 4.6, .1, 0x3a2a1a, { cast: false });
      // Schwert im Stein
      b.ico(0, .6, -38, 1.6, 1.1, 1.4, 0x8a8a90, { solid: 1, mat: { f: 1, r: 1 } }); b.box(0, 1.3, -38, .9, .5, .6, 0x4a4a52, { mat: { m: .7 } });
      b.box(0, 1.8, -38, .12, 1.6, .04, 0xd8e0ea, { mat: { m: .95, r: .15 } }); b.box(0, 2.6, -38, .7, .1, .1, 0xd8b030, { mat: { m: .9, r: .3 } }); b.box(0, 2.7, -38, .07, .4, .07, 0x4a2a1a); b.glow(0xd8e8ff, 3, 0, 2.2, -38, .5);
      // Turnierplatz mit Zaun und Bannern
      for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; if (Math.abs(Math.sin(a)) < .3 && Math.cos(a) > 0) continue; const x = 22 + Math.cos(a) * 9, z = -22 + Math.sin(a) * 8; b.box(x, 0, z, .2, 1.2, .2, 0x6a4a2a); }
      b.box(22, .9, -22, 14, .12, .12, 0x6a4a2a); for (const [x, c] of [[15, 0xc83a2a], [29, 0x2a5ac8]]) { b.cyl(x, 0, -30.5, .08, 4, 0x5a4030, { lo: 1, solid: 1 }); b.box(x + .55, 2.8, -30.5, 1, 1.4, .04, c, { cast: false }); }
      // Merlins Steinkreis
      for (let i = 0; i < 8; i++) { const a = i * .785, x = -22 + Math.cos(a) * 7, z = -38 + Math.sin(a) * 6; if (i % 3 === 1) continue; b.box(x, 0, z, .9, 2.8, .6, 0x8a8a8e, { solid: 1, ry: -a }); }
    },
    theben(b) {
      // Tempel: Stufenbau, zwei Säulenreihen, Giebel
      const Z = -66, S = 0xece4d4;
      b.box(0, 0, Z, 20, .8, 10, S, { solid: 1 }); b.box(0, .8, Z, 18.4, .5, 8.6, S);
      for (let i = 0; i < 7; i++) for (const dz of [-3.6, 3.6]) b.cyl(-7.8 + i * 2.6, 1.3, Z + dz, .45, 5, S);
      b.box(0, 6.3, Z, 18.6, .8, 9, S); const p = b.cone(0, 7.1, Z, 10.6, 2.4, S, { lo: 1, rz2: 5.2 }); p.rotation.y = Math.PI / 4; p.scale.set(10.4, 2.4, 5.4);
      // Garten der Hesperiden: Apfelbaum mit goldenen Früchten
      b.cyl(-22, 0, -30, .5, 2.6, 0x6a5a44, { solid: 1 }); b.ico(-22, 3.8, -30, 3, 2, 3, 0x5a8a3a); for (let i = 0; i < 8; i++) b.sph(-22 + Math.cos(i * .8) * 2.2, 3 + (i % 3) * .4, -30 + Math.sin(i * .8) * 2.2, .2, .2, .2, 0xffc830, { mat: { e: 0xa07010, ei: 1.2, m: .5 } });
      // Höhle des Löwen: Felsbogen
      b.ico(29, 1.8, -42, 3.4, 3.4, 3, 0x9a7a5a, { solid: 1 }); b.ico(23, 1.8, -44, 2.6, 3, 2.6, 0x9a7a5a, { solid: 1 }); b.box(26, 0, -44.5, 3, 2.6, .2, 0x1a140e, { cast: false });
      // Sumpf von Lerna vor dem Tempel
      for (let i = 0; i < 9; i++) b.cyl(-6 + i * 1.5, 0, -52 + Math.sin(i) * 1.5, .06, 1.4, 0x6a8a3a, { lo: 1 });
    },
    mauer(b) {
      // Große Mauer quer über den Norden, Torturm mit geschwungenem Dach, Wachtürme
      const Z = -64, S = 0x9a948a;
      for (const [x0, x1] of [[-46, -4], [4, 46]]) { const w = x1 - x0, x = (x0 + x1) / 2; b.box(x, 0, Z, w, 6, 4, S, { solid: 1, mat: { r: 1 } }); for (let i = 0; i < w / 2; i++) b.box(x0 + 1 + i * 2, 6, Z + 1.7, 1, .9, .5, S); }
      b.box(0, 0, Z, 8, 9, 6, 0xa8a296, { solid: 1 }); b.box(0, 0, Z + 3.05, 3.4, 5, .1, 0x2a2420, { cast: false });
      b.box(0, 9, Z, 6.4, 3, 4.4, 0xb83a2a); const rf = b.cone(0, 12, Z, 6.4, 2.2, 0x2a2a30, { lo: 1, mat: { f: 1 } }); rf.rotation.y = Math.PI / 4; rf.scale.set(6.4, 2.2, 4.6);
      for (const x of [-28, 28]) { b.box(x, 0, Z, 6, 9, 6, S, { solid: 1 }); b.box(x, 9, Z, 6.6, .8, 6.6, 0x7a746a); }
      for (const x of [-2.6, 2.6]) { b.cyl(x, 0, Z + 4.4, .08, 4, 0x5a4030, { lo: 1, solid: 1 }); b.box(x + .5, 2.6, Z + 4.4, .9, 1.6, .04, 0xc83a2a, { cast: false }); }
      // Heerlager mit Zelten und Lampions
      for (const [x, z] of [[-22, -10], [-26, -18], [-14, -26], [-24, -26]]) { const t = b.cone(x, 0, z, 2.2, 2.4, 0xd8ccb0, { lo: 1, solid: 1, mat: { f: 1 } }); t.rotation.y = .3; }
      for (const [x, z] of [[-18, -14], [-20, -22]]) { b.cyl(x, 0, z, .06, 2.4, 0x3a2a1a, { lo: 1, solid: 1 }); b.sph(x, 2.6, z, .32, .4, .32, 0xe84a2a, { mat: { e: 0xc02a10, ei: 1.4 } }); b.glow(0xff7a40, 2.4, x, 2.6, z, .6); }
    }
  };

  /* ---------- Welt aufbauen ---------- */
  function build(n) {
    const w = W(n), h = heightFn(w), S = C.S(), s = st(w.id);
    const pools = w.pools || [];
    const blk = (x, z) => C.tooSteep(h, x, z) || Math.hypot(x - CX, z - CZ) > R + 6 || pools.some(([px, pz, r]) => Math.hypot(x - px, z - pz) < r - .4);
    const WD = { n, C: C.CHP[n], h, blocked: blk, zone: () => 'story', ims: [], edKeys: [], terr: null, story: true, mw: w, lv: Math.max(3, S.lvl - 1),
      zn: { story: [w.name, w.sub], village: [w.name, ''], forest: [w.name, ''], cave: [w.name, ''], ruin: [w.name, ''] }, path: PATHX, mbg: null, spawn: [0, 2],
      refresh, menuQuest, kill, zoneEnter() { }, ensureBoss() { }, sealedNow: () => false, spawnMini() { }, tick };
    C.setWLD(WD); cur = { w, h, g: null, items: [], ints: [], boss: null };
    C.setAtmos(w.atm);
    // Boden mit Farbverlauf, Weg und Randhang
    const geo = new T.PlaneGeometry(140, 140, 84, 84); geo.rotateX(-Math.PI / 2); geo.translate(CX, 0, CZ);
    const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new T.Color(), c1 = new T.Color(w.ground[0]), c2 = new T.Color(w.ground[1]), cp = new T.Color(w.path), cr = new T.Color(w.ridge);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = h(x, z); p.setY(i, y); const d = Math.hypot(x - CX, z - CZ);
      c.copy(c1).lerp(c2, .5 + Math.sin(x * .21 + z * .17) * .5); const pd = Math.abs(x - PATHX(z)); if (z < 10 && z > -60 && pd < 2.6) c.lerp(cp, 1 - sm(1.6, 2.6, pd)); c.lerp(cr, sm(R, R + 5, d)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const terr = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: .95, flatShading: true })); terr.receiveShadow = true; C.scene.add(terr); WD.terr = terr;
    for (const [px, pz, r, wc] of pools) { const wm = mk(new T.CircleGeometry(r + .6, 40), new T.MeshStandardMaterial({ color: wc, metalness: .6, roughness: .08, transparent: true, opacity: .82 }), px, -.35, pz, 1, 1, 1, false); wm.rotation.x = -Math.PI / 2; C.scene.add(wm); }
    // Wahrzeichen
    const g = new T.Group(); C.scene.add(g); cur.g = g; const b = B(g); b.g = g; LAND[w.id](b, w);
    // Rand: dichter Bewuchs/Felsen/Häuser auf dem Hang (sichtbare Grenze)
    const R2 = C.rng(9100 + n), list = [];
    for (let k = 0; k < 2; k++) { const rr = R + 3 + k * 4.5, N = Math.round(rr * 6.283 / (w.border.includes('house') ? 5.2 : 3.4)); for (let i = 0; i < N; i++) { const a = (i + k * .5) / N * 6.283, x = CX + Math.sin(a) * rr, z = CZ + Math.cos(a) * rr; if (Math.hypot(x, z - 10) < 11) continue; const kind = w.border[(i + k) % w.border.length]; list.push([x, z, kind, kind === 'rockbig' ? .7 + R2() * .5 : kind === 'house' ? .8 + R2() * .4 : 1.1 + R2() * .6, kind === 'house' ? -a : R2() * 6.3]); } }
    // Innen: Streuung abseits von Weg, Wahrzeichen und Auftragsstellen
    const busy = [...w.pads.map(([x, z, r]) => [x, z, r + 2]), [0, 5, 8], ...pools.map(([x, z, r]) => [x, z, r + 2])];
    for (const m of w.ms) { for (const q of (m.pts || [])) busy.push([q[0], q[1], 3]); if (m.at) busy.push([m.at[0], m.at[1], m.r || 4]); }
    for (const d of w.npcs) busy.push([d.x, d.z, 3]);
    for (const [kind, cnt] of w.decor) { let n2 = 0, tries = 0; while (n2 < cnt && tries++ < cnt * 30) { const a = R2() * 6.283, rr = Math.sqrt(R2()) * (R - 3), x = CX + Math.sin(a) * rr, z = CZ + Math.cos(a) * rr;
      if (Math.abs(x - PATHX(z)) < 4 && z < 12 && z > -62) continue; if (busy.some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br + 1.5)) continue; if ((w.rects || []).some(([x0, x1, z0, z1]) => x > x0 - 2 && x < x1 + 2 && z > z0 - 2 && z < z1 + 2)) continue; if (list.some(q => DECOR[q[2]].col && Math.hypot(q[0] - x, q[1] - z) < 2.6)) continue;
      list.push([x, z, kind, .8 + R2() * .5, R2() * 6.3]); n2++; } }
    scatter(g, list, WD.ims);
    // Unterwasser: aufsteigende Blasen
    if (w.under) C.animObjs.push({ fn(t) { if (cur && Math.random() < .25) C.emit(C.pl.x + (Math.random() - .5) * 30, cur.h(C.pl.x, C.pl.z) + .2, C.pl.z + (Math.random() - .5) * 30, 0xc8f4ff, 1, .3, 3, .12, -1.5); } });
    C.mergeStatic(g);
    // Figuren
    for (const d of w.npcs) { const P = npcModel(d); const o = C.addNpc('mw_' + d.id, d.name, d.x, d.z, P, () => talk(d), d.face, () => mark(d.id)); o.mwId = d.id; }
    // Gegner-Arten dieser Welt
    for (const k of ['a', 'b', 'x', 'y']) { const f = w.foes[k]; if (!f) continue; const key = 'mw' + n + k, base = k === 'a' ? C.ED.rift : k === 'b' ? C.ED.wolf : C.ED.boss;
      C.ED[key] = Object.assign({}, base, { name: f[1], col: f[2], make: () => C.CR().makeKind(f[0], f[2], k === 'x' || k === 'y'), sc: k === 'a' ? 1 : k === 'b' ? (f[0] === 'archiv' || f[0] === 'sand' ? 1.05 : 1) : 1.6, base: k === 'a' ? 'rift' : 'wolf' },
        k === 'x' || k === 'y' ? { boss: true, sub: f[3], p2t: f[4], minion: 'mw' + n + 'a', aggro: 30 } : {}); WD.edKeys.push(key); }
    // ein paar Gegner in der Wildnis (für Erfahrung), fern vom Ankunftsplatz
    let ne = 0, tries = 0; while (ne < 7 && tries++ < 200) { const a = R2() * 6.283, rr = 14 + R2() * (R - 18), x = CX + Math.sin(a) * rr, z = CZ + Math.cos(a) * rr; if (z > -6 || blk(x, z) || !C.colFree(x, z, 1)) continue; C.spawnEnemy('mw' + n + (ne % 3 ? 'b' : 'a'), x, z); ne++; }
    // Sternentor (zurück nach Lunaris)
    starGate(-8, 4);
    // Auftrag fortsetzen (Teile, Stellen, Gegner)
    if (s.st === 1) arm(w, s);
    keyhole(w, s);
    // Karte
    WD.mbg = minimap(w); C.setMBG(WD.mbg);
    refresh();
    return WD;
  }
  function starGate(x, z) {
    const g = new T.Group(), y = cur.h(x, z); g.position.set(x, y, z); g.rotation.y = Math.PI / 2; const col = 0xffd8ff;
    g.add(mk(G.cyl, M(0x8d93b0, { r: .6 }), 0, .2, 0, 3, .4, 3)); const ring = mk(G.tor, M(col, { e: 0xc8a0ff, ei: 1.6, r: .3 }), 0, 2.7, 0, 2.1, 2.1, 2.1, false); g.add(ring);
    const sw = mk(new T.CircleGeometry(1, 28), new T.MeshBasicMaterial({ color: 0xc8a0ff, transparent: true, opacity: .35, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }), 0, 2.7, 0, 1.9, 1.9, 1, false); g.add(sw);
    for (const s of [-1, 1]) g.add(mk(G.cyl0, M(0x8e93ae), s * 2.4, 1.4, 0, .32, 2.8, .32)); g.add(glow(0xe0b0ff, 6, 0, 2.7, 0, .5)); C.scene.add(g); C.addCol(x, z, 1.6);
    C.animObjs.push({ fn(t) { ring.rotation.z = t * .6; sw.material.opacity = .28 + Math.sin(t * 2) * .08; } });
    C.INT.push({ x: x + 2.4, z, name: 'Sternentor', pr: 'Zurück nach Lunaris', rad: 3.2, talk() { C.say([['Zotik', 'Das Sternentor führt zurück nach Lunaris. Von dort aus kann ich in jede andere Welt reisen.']], null, [{ t: '🌙 Zurück nach Lunaris', fn: () => C.travel(1) }, { t: 'Noch bleiben', fn() { } }]); } });
  }
  function minimap(w) {
    const c = document.createElement('canvas'); c.width = 260; c.height = 310; const x = c.getContext('2d'), hx = v => (v | 0).toString(16).padStart(2, '0'), hex = n => '#' + hx(n >> 16 & 255) + hx(n >> 8 & 255) + hx(n & 255);
    x.fillStyle = '#0a0e24'; x.fillRect(0, 0, 260, 310); x.fillStyle = hex(w.ground[0]); x.beginPath(); x.arc(CX + 130, CZ + 234, R, 0, 6.283); x.fill();
    x.strokeStyle = hex(w.path); x.lineWidth = 3; x.beginPath(); for (let z = 10; z > -60; z -= 2) x[z === 10 ? 'moveTo' : 'lineTo'](PATHX(z) + 130, z + 234); x.stroke();
    for (const [px, pz, r, wc] of (w.pools || [])) { x.fillStyle = hex(wc); x.beginPath(); x.arc(px + 130, pz + 234, r, 0, 6.283); x.fill(); }
    x.fillStyle = hex(w.col); for (const [px, pz] of w.pads) x.fillRect(px + 128, pz + 232, 4, 4); x.fillStyle = '#e0b0ff'; x.fillRect(120, 236, 4, 4); return c;
  }

  /* ---------- Aufträge ---------- */
  const mis = () => { if (!cur) return null; const s = st(cur.w.id); return s.done || s.m >= cur.w.ms.length ? null : cur.w.ms[s.m]; };
  function mark(id) { const m = mis(), s = cur && st(cur.w.id); return !!m && m.g === id && s.st === 0; }
  function objText() {
    if (!cur) return ''; const w = cur.w, s = st(w.id), m = mis();
    if (s.done) return 'Welt versiegelt ✅ – das Sternentor am Ankunftsplatz führt zurück nach Lunaris.';
    if (!m) return 'Versiegle das Schlüsselloch (' + (w.npcs.find(d => d.id === w.ms[w.ms.length - 1].g) || {}).name + ' zeigt dir den Weg).';
    const gn = (w.npcs.find(d => d.id === m.g) || {}).name;
    if (s.st === 0) return 'Sprich mit ' + gn + '.';
    if (m.t === 'collect') return m.n + ': ' + Object.keys(s.got).length + ' / ' + m.pts.length + ' ' + m.item + (m.pts.length - Object.keys(s.got).length === 1 ? '' : '') + ' gefunden.';
    if (m.t === 'ring') return m.n + ': ' + Object.keys(s.got).length + ' / ' + m.pts.length + ' – ' + m.pts.filter((q, i) => !s.got[i]).map(q => q[2]).join(', ') + '.';
    if (m.t === 'defeat') return m.n + ': ' + s.c + ' / ' + m.cnt + ' besiegt.';
    if (m.t === 'find') return m.n + ': Suche ' + m.who + '.';
    return m.n + ': Besiege ' + w.foes[m.foe][1] + '.';
  }
  function refresh() { if (!cur) return; const s = st(cur.w.id); C.$('qt').textContent = cur.w.em + ' ' + cur.w.name + ' · ' + Math.min(s.done ? 3 : s.m, 3) + '/3'; C.$('qo').textContent = objText(); }
  function menuQuest() { if (!cur) return ''; const w = cur.w, s = st(w.id);
    return `<h3>${w.em} ${w.name}</h3><p style="color:var(--dim);font-size:13px">${w.sub} – Vorlage: ${w.src}. Zurück geht es nur über das Sternentor nach Lunaris.</p>` + w.ms.map((m, i) => `<div class="row"><span>${s.done || i < s.m ? '✅' : i === s.m ? '▶️' : '🔒'} ${m.n}</span><span><small>${i === s.m && !s.done ? objText() : ''}</small></span></div>`).join('') + `<div class="row"><span>${s.done ? '✅' : '🔒'} Schlüsselloch versiegeln</span><span></span></div>`; }
  function talk(d) {
    const w = cur.w, s = st(w.id), m = mis();
    if (m && m.g === d.id && s.st === 0) return C.say(m.a, () => { s.st = 1; s.c = 0; s.got = {}; arm(w, s); C.sfx('quest'); C.banner('Auftrag', m.n); refresh(); C.saveGame(true); });
    if (m && m.g === d.id && s.st === 1) return C.say([[d.name, 'Noch nicht geschafft? ' + objText()]]);
    if (s.done && w.outro.some(l => l[0] === d.name)) return C.say(w.outro.filter(l => l[0] === d.name).concat(d.idle));
    C.say(d.idle);
  }
  function arm(w, s) {   // Auftrag in der Welt sichtbar machen (auch nach erneutem Betreten)
    const m = mis(); if (!m) return;
    if (m.t === 'collect') m.pts.forEach((q, i) => { if (s.got[i]) return; const o = piece(m.look); o.position.set(q[0], cur.h(q[0], q[1]), q[1]); C.scene.add(o); cur.items.push({ o, i, x: q[0], z: q[1] }); });
    if (m.t === 'ring') m.pts.forEach((q, i) => { const t = trigger(m.look, s.got[i]); t.g.position.set(q[0], cur.h(q[0], q[1]), q[1]); C.scene.add(t.g); C.addCol(q[0], q[1], m.look === 'beacon' ? 1.3 : m.look === 'bell' ? 1.2 : .8);
      const it = { x: q[0], z: q[1] + (m.look === 'bell' || m.look === 'beacon' ? 2 : 1.6), name: q[2], get pr() { return s.got[i] ? '✔ erledigt' : m.look === 'bell' ? 'Glocke läuten' : m.look === 'beacon' ? 'Feuer entzünden' : 'Berühren'; }, rad: 2.6, vis: () => mis() === m && s.st === 1, talk() { ringAt(m, s, i, t); } };
      C.INT.push(it); cur.ints.push(it); });
    if (m.t === 'defeat') { const left = m.cnt - s.c; for (let i = 0; i < left; i++) { const a = i / Math.max(1, left) * 6.283, r = m.r * (.45 + (i % 2) * .4); let x = m.at[0] + Math.sin(a) * r, z = m.at[1] + Math.cos(a) * r; for (let k = 0; k < 8 && (C.W().blocked(x, z) || !C.colFree(x, z, .8)); k++) { x = m.at[0] + Math.sin(a + k) * r * .6; z = m.at[1] + Math.cos(a + k) * r * .6; }
      const e = C.spawnEnemy('mw' + w.n + m.foe, x, z); e.mw = 1; e.awake = true; e.st = 'chase'; } }
    if (m.t === 'boss') { const e = C.spawnEnemy('mw' + w.n + m.foe, m.at[0], m.at[1]); e.mw = 2; e.wake = m.at; e.face = 0; C.setBoss(e); cur.boss = e; }
    if (m.t === 'find') { const [x, z] = m.at, g = new T.Group(); g.position.set(x, cur.h(x, z), z);
      if (m.look === 'goat') { const P = C.CR().makeKind('sphinx', 0xf0ece0, false); P.root.scale.setScalar(.55); g.add(P.root); for (const sx of [-1, 1]) { const hn = mk(G.cone0, M(0x8a7a5a), sx * .12, 1.05, .45, .04, .22, .04); hn.rotation.x = -.5; g.add(hn); } for (const lx of [-.2, .2]) for (const lz of [-.3, .3]) g.add(mk(G.sph0, M(0xe8c040, { m: .8 }), lx, .05, lz, .06, .06, .06, false)); }
      else { const P = C.makeVillager({ cloth: 0x3a5a8a, cloth2: 0xe8e0d0, hair: 0x6a4a2a, sc: .85 }); g.add(P.root); P.root.position.set(0, 0, 0); P.root.rotation.z = .3; }
      g.add(glow(0xffe08a, 2.4, 0, 1.6, 0, .55)); C.scene.add(g); C.addCol(x, z, .6); cur.find = g;
      const it = { x, z: z + 1.6, name: m.who, pr: 'Helfen', rad: 2.8, vis: () => mis() === m && s.st === 1, talk() { C.say(m.f, () => { g.visible = false; done(); }); } }; C.INT.push(it); cur.ints.push(it); }
  }
  function ringAt(m, s, i, t) { if (s.got[i]) return; s.got[i] = 1; C.sfx(m.look === 'bell' ? 'bell' : m.look === 'beacon' ? 'fire' : 'light'); t.fire.visible = true; if (t.ring) t.ring.material = M(0x8affc0, { e: 0x4adf8a, ei: 2 });
    C.FX().pillar(t.g.position.x, t.g.position.y, t.g.position.z, m.look === 'beacon' ? 0xffa040 : 0xffe8a0, 1, 6, 1.2); C.toast('✔ ' + m.pts[i][2]); refresh();
    if (Object.keys(s.got).length >= m.pts.length) done(); else C.saveGame(true); }
  function done() {
    const w = cur.w, s = st(w.id), m = mis(); if (!m) return; const S = C.S(), xp = 60 + S.lvl * 14, sh = 50 + s.m * 30;
    s.m++; s.st = 0; s.c = 0; s.got = {}; for (const it of cur.ints) it.vis = () => false; cur.ints = [];
    C.gainXp(xp); S.shards += sh; C.sfx('level'); C.banner('Auftrag erfüllt', m.n); C.toast(`✨ +${xp} EP · 💎 +${sh}`);
    C.say(m.d, () => { if (!mis()) keyhole(w, s); refresh(); });
    refresh(); C.saveGame(true);
  }
  function kill(e) {
    if (cur && e === cur.boss) { cur.boss = null; C.clearBoss(); }
    const s = cur && st(cur.w.id), m = mis(); if (!m || s.st !== 1) return;
    if (m.t === 'defeat' && e.mw === 1) { s.c++; refresh(); if (s.c >= m.cnt) done(); }
    if (m.t === 'boss' && e.mw === 2) done();
  }
  function tick(dt) {
    if (!cur) return; const s = st(cur.w.id), m = mis(), pl = C.pl;
    for (let i = cur.items.length - 1; i >= 0; i--) { const it = cur.items[i]; it.o.rotation.y += dt * 1.6; it.o.position.y = cur.h(it.x, it.z) + Math.sin(C.time() * 2.6 + i) * .12;
      if (m && m.t === 'collect' && s.st === 1 && Math.hypot(pl.x - it.x, pl.z - it.z) < 1.7 && !pl.dead) { s.got[it.i] = 1; C.scene.remove(it.o); cur.items.splice(i, 1); C.sfx('pick'); C.emit(it.x, cur.h(it.x, it.z) + .6, it.z, 0xffe08a, 18, 3, .7, .5, -2);
        const got = Object.keys(s.got).length; C.toast(`${cur.w.em} ${m.item} (${got}/${m.pts.length})`); refresh(); if (got >= m.pts.length) done(); else C.saveGame(true); } }
  }
  function keyhole(w, s) {
    if (mis() || !cur) return; if (cur.key) return; const [x, z] = w.key, y = cur.h(x, z), g = new T.Group(); g.position.set(x, y, z);
    const lit = !s.done, mat = M(lit ? 0xfff0c0 : 0x8a8a9a, { e: lit ? 0xffd070 : 0x2a2a3a, ei: lit ? 2.4 : .4 });
    const k1 = mk(G.cyl, mat, 0, 2.6, 0, .32, .08, .32, false); k1.rotation.x = Math.PI / 2; g.add(k1); const k2 = mk(G.cone0, mat, 0, 2.05, 0, .26, .7, .06, false); g.add(k2);
    if (lit) { g.add(glow(0xffe08a, 5, 0, 2.4, 0, .7)); C.animObjs.push({ fn(t) { g.rotation.y = Math.sin(t) * .25; } }); }
    g.position.z += 2.2; C.scene.add(g); cur.key = g;
    const it = { x, z: z + 3.6, name: 'Schlüsselloch', get pr() { return st(w.id).done ? '✔ Versiegelt' : 'Versiegeln'; }, rad: 3, talk() {
      if (st(w.id).done) return C.say([['Zotik', 'Das Schlüsselloch ist versiegelt. Diese Welt ist sicher.']]);
      C.sfx('portal'); C.FX().pillar(x, y, z + 2.2, 0xffe08a, 1.6, 12, 2.2); C.FX().circle(x, y, z + 2.2, 0xffd070, 4, 1.6);
      C.say([['Erzähler', 'Ein Lichtstrahl schießt aus Zotiks Klinge in das Schlüsselloch. Mit einem Klang wie von tausend Glocken schließt es sich.'], ['Zotik', 'Versiegelt. Das Herz dieser Welt ist sicher – kein Riss kommt hier mehr durch.']].concat(w.outro), () => {
        const S = C.S(), s2 = st(w.id); s2.done = 1; S.shards += 300; S.potions += 2; S.items.phoenix = (S.items.phoenix || 0) + 1; C.gainXp(250 + S.lvl * 20); C.sfx('level');
        const k = seals(); C.banner('Welt versiegelt', w.em + ' ' + w.name + ' · Siegel ' + k + '/' + WORLDS.length); C.toast('💎 +300 · 🧪 +2 · 🔥 Phönix-Trank');
        if (k >= WORLDS.length && !S.fl.mwAll) { S.fl.mwAll = 1; C.giveGear('w_maer'); C.say([['Erzähler', 'Alle sieben Märchenwelten sind versiegelt. Aus den Siegeln formt sich eine Klinge, in der jede Geschichte weiterklingt.'], ['Zotik', 'Die Erzählerklinge … Danke, ihr alle.']]); }
        mat.color.setHex(0x8a8a9a); mat.emissive.setHex(0x2a2a3a); refresh(); C.saveGame(true); });
    } };
    C.INT.push(it);
  }

  /* ---------- Märchentor in Lunaris (Hauptwelt) ---------- */
  function gateTalk() {
    if (C.MP().on) return C.say([['Zotik', 'Das Märchentor flackert. Mit Gästen im Mehrspieler bleibt es geschlossen – die Märchenwelten sind (noch) ein Abenteuer für einen allein.']]);
    if (C.S().stage < 1) return C.say([['Zotik', 'Ein Tor aus Buchseiten … es schläft noch. Erst sollte ich mit Mira sprechen.']]);
    const k = seals();
    C.say([['Märchentor', 'Zwischen den Seiten liegen Welten, die man aus Geschichten kennt. Wähle eine – zurück führt dich das Sternentor immer hierher nach Lunaris.' + (k ? ' (Versiegelt: ' + k + '/' + WORLDS.length + ')' : '')]], null,
      WORLDS.map(w => ({ t: (st(w.id).done ? '✅ ' : w.em + ' ') + w.name, fn: () => C.travel(w.n) })).concat([{ t: 'Abbrechen', fn() { } }]));
  }
  function travelRows(curCh) {
    let h = `<h3>📖 Märchenwelten</h3><p style="color:var(--dim);font-size:13px">${curCh === 1 ? 'Von Lunaris aus erreichbar – über das Märchentor oder direkt hier.' : 'Nur über die Hauptwelt Lunaris erreichbar (Märchentor neben dem Weltentor).'}</p>`;
    for (const w of WORLDS) { const s = st(w.id); h += `<div class="row"><span>${s.done ? '✅' : w.em} ${w.name}<br><small style="color:var(--dim)">${w.sub} · ${s.done ? 'versiegelt' : (s.m || 0) + '/3 Aufträge'}</small></span><span>${curCh === w.n ? '<small>hier</small>' : curCh === 1 && open() ? `<button class="trv" data-n="${w.n}">Reisen</button>` : ''}</span></div>`; }
    return h;
  }
  function leave() { cur = null; }
  return { build, leave, gateTalk, travelRows, open, seals, st, W, WORLDS, get cur() { return cur; }, objText, done, CX, CZ, R };
}
