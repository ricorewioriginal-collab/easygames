/* „Ich bin das Licht“ – der Roman von RicoReWi als Handlungsstrang in Pride City.
   Leon (Lady Luma) erzählt seine Geschichte in Rückblenden: zwölf Stationen aus dem Roman mit Entscheidungen,
   die Licht bringen, Lady Lumas Garderobe, eine Bühnenshow (Tanz-Battle) und drei Enden.
   Der vollständige Roman liegt in public/book/ich-bin-das-licht.json und ist im Handy lesbar. */

export interface LichtChoice { t: string; light: number; r: string; unwig?: boolean }
export interface LichtChapter {
  n: number; title: string; set: string; cast: string[]; lines: Array<[string, string]>;
  goal?: string; obj?: string; sit?: boolean; choices?: LichtChoice[]; studio?: boolean; show?: boolean; end?: boolean;
}

export const LICHT_CHAPTERS: LichtChapter[] = [
    { n: 1, goal: 'chair', obj: 'Setz dich an deinen Platz am Esstisch (rechts vorne).', sit: true, title: 'Licht und Schatten', set: 'dining', cast: ['leon', 'vater', 'mutter'],
      lines: [['', 'Bei Familie Sommer wird um Punkt halb sieben gegessen. Das ist das Gesetz des Vaters.'],
        ['', 'Im Fernsehen läuft eine Show. Zwei Männer halten sich an den Händen.'],
        ['vater', 'Muss das sein.'],
        ['leon', '(Ich habe gelernt, nichts zu sagen. Mein Gesicht ist gut darin. Mein Bauch weniger.)']],
      choices: [
        { t: 'Auf den Teller schauen, bis das Gewitter vorbeizieht', light: 3, r: 'Du kennst die Technik. Aber jedes Schweigen kostet ein bisschen Licht.' },
        { t: 'Leise sagen: „Ich find die eigentlich schön.“', light: 10, r: 'Dein Vater hebt das Handgelenk und schaut auf die Uhr. Der Satz ist trotzdem gesagt. Er gehört dir.' }] },
    { n: 1, goal: 'bed', obj: 'Sturmfreie Bude! Setz dich mit dem Laptop aufs Bett.', sit: true, title: 'Sturmfreie Zeit', set: 'bedroom', cast: ['leon'],
      lines: [['', 'Ein Samstag, die Eltern sind auf einer Geburtstagsfeier. Leon landet bei Drag Race.'],
        ['leon', 'Sie stehen da, als gehörte ihnen der Raum. Und wenn eine verliert, nehmen die anderen sie in den Arm.'],
        ['', 'Unten dreht sich ein Schlüssel im Schloss.']],
      choices: [
        { t: 'Laptop zuklappen und so tun, als würdest du schlafen', light: 3, r: 'Du wärst ein guter Geheimagent geworden. Aber Verstecken macht müde.' },
        { t: 'Die Folge zu Ende schauen, mit Kopfhörern', light: 8, r: 'Dein Herz klopft, als hättest du etwas gestohlen. Dabei hast du nur etwas angeschaut, das dich glücklich macht.' }] },
    { n: 2, goal: 'samira', obj: 'Setz dich zu Samira aufs Bett.', sit: true, title: 'Die Menschen, die bleiben', set: 'samira', cast: ['leon', 'samira'],
      lines: [['', 'Samira, seit der fünften Klasse. Eine Freundschaft, die leise funktioniert.'],
        ['samira', 'Du musst mir nichts erzählen. Aber du darfst.'],
        ['', 'Sie dreht an ihrem rechten Ohrring. Das macht sie immer, wenn sie nachdenkt.']],
      choices: [
        { t: 'Samira die ganze Wahrheit sagen', light: 12, r: 'Samira: „Ich weiß. Und ich bin noch da.“ Mehr braucht es nicht.' },
        { t: 'Noch nicht. Einfach nebeneinander sitzen.', light: 6, r: 'Samira wartet, bis du bereit bist. Das ist ihre ganze Strategie, und sie hält.' }] },
    { n: 3, goal: 'mert', obj: 'Es regnet. Folge Mert zur Tür mit dem bunten Licht.', title: 'Eine Nacht, die anders begann', set: 'street', cast: ['leon', 'mert', 'tobi'],
      lines: [['', 'Die Clique zieht los, Tobi hat eine Route mit vier Kneipen. Dann kommt der Regen.'],
        ['', 'Aus einer Tür fällt Musik, Wärme und ein Streifen farbiges Licht auf das nasse Pflaster.'],
        ['mert', 'Da rein!']],
      choices: [
        { t: 'Mit Mert reingehen', light: 12, r: 'Zwei Männer halten sich an der Bar an den Händen, und niemand schaut hin. Zum ersten Mal atmest du ganz aus.' },
        { t: 'Draußen im Regen stehen bleiben', light: 4, r: 'Mert kommt zurück, nass bis auf die Haut: „Kommst du jetzt, oder was?“ Du gehst doch rein.' }] },
    { n: 4, goal: 'mirror', obj: 'Geh zum Spiegel mit den Glühbirnen.', title: 'Der Spiegel mit den Glühbirnen', set: 'mirror', cast: ['leon'],
      lines: [['', 'Hinter der kleinen Bühne hängt ein Spiegel mit Glühbirnen.'],
        ['leon', 'Zum ersten Mal schaue ich hinein und sehe jemanden, der noch keinen Namen hat.'],
        ['', 'Stelle Lady Lumas ersten Look zusammen. Ihr Name kommt von lumen, das Licht.']],
      studio: true },
    { n: 5, goal: 'velvet', obj: 'Finde die One Love Bar und sprich Velvet an.', title: 'Die One Love Bar', set: 'door', cast: ['leon', 'velvet'],
      lines: [['', 'Holger schickt dich zur One Love Bar: „Da gibt es eine richtige Bühne. Und Velvet.“'],
        ['', 'Du stehst vor ihrer Tür und kannst dich nicht entscheiden, ob du reingehst.'],
        ['velvet', 'Entweder rennst du jetzt weg, oder du bleibst für immer.']],
      choices: [
        { t: 'Bleiben', light: 12, r: 'Velvet nickt: „Dann binde deine Schnürsenkel. Ich mag keine offenen Schnürsenkel.“' },
        { t: 'Einmal um den Block gehen und wiederkommen', light: 6, r: 'Als du zurückkommst, lehnt Velvet noch in der Tür. „Wusste ich doch.“' }] },
    { n: 6, goal: 'julian', obj: 'Die Türglocke bimmelt. Geh zu Julian.', title: 'Alte Wege, neue Gesichter', set: 'cafe', cast: ['leon', 'julian', 'mia'],
      lines: [['', 'Ein grauer Dienstag im April. Die Glocke über der Café-Tür bimmelt.'],
        ['julian', 'Hallo, Leon.'],
        ['leon', '(Ich habe den Lappen noch in der Hand und weiß nicht, wohin damit.)']],
      choices: [
        { t: 'Ihm einen Kaffee machen und zuhören', light: 10, r: 'Julian bleibt bis Ladenschluss. Manche Kapitel sind weniger abgeschlossen, als man dachte.' },
        { t: 'Weiter die Vitrine putzen', light: 5, r: 'Mia stellt zwei Tassen auf den Tresen und schaut dich an. Du setzt dich doch zu ihm.' }] },
    { n: 7, goal: 'velvet', obj: 'Velvet wartet auf der Bühne. Geh zu ihr.', title: 'Die zweite Bühne', set: 'stage', cast: ['luma', 'velvet'],
      lines: [['velvet', 'Heute kein Playback. Heute deine Stimme.'],
        ['leon', '(Wer sich versteckt, tut das nicht ohne Grund.)'],
        ['velvet', 'Man darf nur nicht vergessen, sich irgendwann wieder herauszuholen.']],
      choices: [
        { t: 'Mit der eigenen Stimme singen', light: 14, r: 'Die ersten Töne zittern. Dann wird es still im Saal, und dann laut.' },
        { t: 'Noch einmal Playback', light: 5, r: 'Applaus. Velvet schiebt dir danach einen Zettel hin: „Nächstes Mal deine Stimme.“' }] },
    { n: 9, goal: 'nadine', obj: 'Sieh dich in der alten Bar um und sprich mit Nadine.', title: 'Rückkehr ins Leben', set: 'bar', cast: ['leon', 'velvet', 'nadine'],
      lines: [['', 'Die One Love Bar war geschlossen. Jetzt will Nadine Brandt sie kaufen und neu aufbauen.'],
        ['nadine', 'Ich habe selbst einmal Menschen gebraucht, die mich nicht gefragt haben, wer ich bin.'],
        ['velvet', 'Man kann nicht einfach neu streichen. Die Risse bleiben. Das sind die Narben.']],
      choices: [
        { t: 'Mit Nadine und Velvet neu planen', light: 10, r: 'Faire Löhne, ein guter Umbau und ein Herz über der Tür, das nicht ausgeht.' },
        { t: 'Erst einmal vorsichtig bleiben', light: 6, r: 'Nadine versteht das. „Darum bauen wir es diesmal gemeinsam.“' }] },
    { n: 10, goal: 'mic', obj: 'Der Saal ist voll. Geh ans Mikrofon.', title: 'Die Nacht der Wiedereröffnung', set: 'stage', cast: ['luma'],
      lines: [['', 'Der Saal ist voll. Samira, Mert, Mia und Julian stehen ganz vorne.'],
        ['leon', 'Zwei verschüttete Kaffee, kein Frühstück. Die Angst gehört dazu.'],
        ['', 'Spiele den Buchsong. Jeder Treffer bringt Licht in den Saal.']],
      show: true },
    { n: 10, title: 'Nach dem Lied', set: 'stage', cast: ['luma', 'julian'],
      lines: [['', 'Das Lied ist vorbei. Im Saal wird es still.'],
        ['leon', 'Ich will nicht, dass sie nur Lady Luma feiern. Ich will, dass sie auch Leon sehen.']],
      choices: [
        { t: 'Die Perücke abnehmen', light: 15, unwig: true, r: 'Es war nicht geplant. Es passiert einfach. Beides gehört zusammen: Luma und Leon.' },
        { t: 'Sich als Lady Luma verbeugen', light: 8, r: 'Der Applaus ist riesig. Und irgendwann, das spürst du, nimmst du die Perücke auch hier ab.' }] },
    { n: 12, title: 'Mein Sohn', set: 'stage', cast: ['luma', 'julian', 'vater'],
      lines: [['', 'Julian hat gerade einen Antrag gemacht. Aus dem Saal kommen Rufe, Mert versucht ein Lied anzustimmen.'],
        ['', 'Am Fuß der Seitentreppe steht ein Schatten. Es ist dein Vater. Niemand hat ihn eingeladen.'],
        ['vater', 'Das … das ist mein Sohn.'],
        ['leon', 'Ein Satz macht die Vergangenheit nicht ungeschehen. Aber er ist ein Anfang.']],
      end: true }
  ];

/** Sprecher*innen aus dem Roman mit Farben für den Dialog */
export const LICHT_PEOPLE: Record<string, { name: string; color: string; pron?: string }> = {
  leon: { name: 'Leon', color: '#ff7ac8', pron: 'er/ihn' }, luma: { name: 'Lady Luma', color: '#ff3fb0', pron: 'sie/ihr' },
  vater: { name: 'Vater', color: '#8a8f80' }, mutter: { name: 'Mutter', color: '#b98aa0' }, samira: { name: 'Samira', color: '#e2a33b' },
  mert: { name: 'Mert', color: '#c43b3b' }, tobi: { name: 'Tobi', color: '#3c8a5c' }, velvet: { name: 'Velvet', color: '#c9a2ff' },
  julian: { name: 'Julian', color: '#3a8fdf' }, mia: { name: 'Mia', color: '#2f8f86' }, nadine: { name: 'Nadine Brandt', color: '#d8c7a6' },
};

/** Lady Lumas Garderobe (Auswahl wie im Roman-Spiel) */
export const LUMA = {
  wig: ['Cover-Locken', 'Wallende Mähne', 'Hochsteckfrisur', 'Glamour-Bob'],
  dress: ['Glitzer-Abendkleid', 'Pailletten-Minikleid', 'Disco-Jumpsuit', 'Lichtumhang'],
  jewel: ['Kronleuchter-Ohrringe', 'Krone', 'Krone und Ohrringe'],
};

export const LICHT_START = 6;
export const LICHT_SHOW = 20; // Licht für die Bühnenshow (gewonnen), 10 bei Niederlage
export function lichtMax() { return LICHT_START + LICHT_CHAPTERS.reduce((s, c) => s + (c.choices ? Math.max(...c.choices.map((x) => x.light)) : 0), 0) + 10 + LICHT_SHOW; }
export function lichtEnding(light: number) {
  if (light >= 85) return { id: 'licht', title: 'Ich bin das Licht', text: 'Du hast dich nicht länger versteckt. Der ganze Saal leuchtet, und du mit ihm.' };
  if (light >= 55) return { id: 'glanz', title: 'Glamour in den Adern', text: 'Viele mutige Schritte, ein paar leise. Der Glanz kommt von innen, und er wächst.' };
  return { id: 'funke', title: 'Ein erster Funke', text: 'Du hast noch oft geschwiegen. Das ist erlaubt. Hör nicht auf, dich kennenzulernen.' };
}
