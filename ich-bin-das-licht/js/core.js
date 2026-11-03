// Ich bin das Licht – Spiellogik ohne Grafik (Story, Licht, Garderobe, Rhythmus).  Tests: node --test ich-bin-das-licht/tests/core.test.js
(function (root) {
  'use strict';

  // Buchsong „Ich bin das Licht“ (feat. Leon Sommer & Lady Luma) – offizielles YouTube-Video
  const SONG = { id: '5ZFsCy3vqLI', title: 'Ich bin das Licht', artist: 'Leon Sommer & Lady Luma', bpm: 120, offset: 0.0, fallbackLen: 214 };

  // ------------------------------------------------------------ Garderobe (Lady Luma)
  const WARDROBE = {
    wig: [
      { id: 'cover', name: 'Cover-Locken', style: 'curly', scale: 1.32 },
      { id: 'mane', name: 'Wallende Mähne', style: 'long', scale: 1.18 },
      { id: 'tower', name: 'Hochsteckfrisur', style: 'bun', scale: 1.22, tower: true },
      { id: 'bob', name: 'Glamour-Bob', style: 'bob', scale: 1.12 }
    ],
    wigColor: [
      { id: 'rose', name: 'Rosé-Blond', c: '#f2b6c8' }, { id: 'platin', name: 'Platin', c: '#efe6da' },
      { id: 'magenta', name: 'Magenta', c: '#d6267e' }, { id: 'nacht', name: 'Nachtblau', c: '#2a3f9e' }, { id: 'kupfer', name: 'Kupfer', c: '#c2582b' }
    ],
    dress: [
      { id: 'gown', name: 'Glitzer-Abendkleid', kind: 'gown' },
      { id: 'mini', name: 'Pailletten-Minikleid', kind: 'mini' },
      { id: 'suit', name: 'Disco-Jumpsuit', kind: 'suit' },
      { id: 'cape', name: 'Lichtumhang', kind: 'cape' }
    ],
    dressColor: [
      { id: 'pink', name: 'Pink', c: '#ff2f9a' }, { id: 'silber', name: 'Silber', c: '#d9dce8' }, { id: 'violett', name: 'Violett', c: '#7b3dff' },
      { id: 'blau', name: 'Elektroblau', c: '#2e6bff' }, { id: 'gold', name: 'Gold', c: '#f2c14e' }, { id: 'schwarz', name: 'Samtschwarz', c: '#1a1424' }
    ],
    jewel: [
      { id: 'chandelier', name: 'Kronleuchter-Ohrringe' }, { id: 'crown', name: 'Krone' }, { id: 'both', name: 'Krone und Ohrringe' }, { id: 'none', name: 'Nichts' }
    ]
  };
  const DEFAULT_LOOK = { wig: 'cover', wigColor: 'rose', dress: 'gown', dressColor: 'pink', jewel: 'chandelier' };
  const LOOK_KEYS = ['wig', 'wigColor', 'dress', 'dressColor', 'jewel'];
  function normLook(l) {
    const o = {}; for (const k of LOOK_KEYS) { const list = WARDROBE[k], v = l && l[k]; o[k] = list.some(e => e.id === v) ? v : DEFAULT_LOOK[k]; } return o;
  }
  function pick(k, id) { return WARDROBE[k].find(e => e.id === id) || WARDROBE[k][0]; }
  function cycle(look, k, dir) {
    const list = WARDROBE[k], i = list.findIndex(e => e.id === look[k]); const n = (i + dir + list.length) % list.length;
    return Object.assign({}, look, { [k]: list[n].id });
  }
  function lookName(look) { const l = normLook(look); return pick('dress', l.dress).name + ' in ' + pick('dressColor', l.dressColor).name; }

  // ------------------------------------------------------------ Geschichte (12 Kapitel des Romans, verdichtet)
  // set: 3D-Kulisse, cast: wer steht dort, lines: Gesprächszeilen, choices: Entscheidungen (light = Licht dazu)
  const CHAPTERS = [
    { n: 1, title: 'Licht und Schatten', set: 'dining', cast: ['leon', 'vater', 'mutter'],
      lines: [['', 'Bei Familie Sommer wird um Punkt halb sieben gegessen. Das ist das Gesetz des Vaters.'],
        ['', 'Im Fernsehen läuft eine Show. Zwei Männer halten sich an den Händen.'],
        ['vater', 'Muss das sein.'],
        ['leon', '(Ich habe gelernt, nichts zu sagen. Mein Gesicht ist gut darin. Mein Bauch weniger.)']],
      choices: [
        { t: 'Auf den Teller schauen, bis das Gewitter vorbeizieht', light: 3, r: 'Du kennst die Technik. Aber jedes Schweigen kostet ein bisschen Licht.' },
        { t: 'Leise sagen: „Ich find die eigentlich schön.“', light: 10, r: 'Dein Vater hebt das Handgelenk und schaut auf die Uhr. Der Satz ist trotzdem gesagt. Er gehört dir.' }] },
    { n: 1, title: 'Sturmfreie Zeit', set: 'bedroom', cast: ['leon'],
      lines: [['', 'Ein Samstag, die Eltern sind auf einer Geburtstagsfeier. Leon landet bei Drag Race.'],
        ['leon', 'Sie stehen da, als gehörte ihnen der Raum. Und wenn eine verliert, nehmen die anderen sie in den Arm.'],
        ['', 'Unten dreht sich ein Schlüssel im Schloss.']],
      choices: [
        { t: 'Laptop zuklappen und so tun, als würdest du schlafen', light: 3, r: 'Du wärst ein guter Geheimagent geworden. Aber Verstecken macht müde.' },
        { t: 'Die Folge zu Ende schauen, mit Kopfhörern', light: 8, r: 'Dein Herz klopft, als hättest du etwas gestohlen. Dabei hast du nur etwas angeschaut, das dich glücklich macht.' }] },
    { n: 2, title: 'Die Menschen, die bleiben', set: 'samira', cast: ['leon', 'samira'],
      lines: [['', 'Samira, seit der fünften Klasse. Eine Freundschaft, die leise funktioniert.'],
        ['samira', 'Du musst mir nichts erzählen. Aber du darfst.'],
        ['', 'Sie dreht an ihrem rechten Ohrring. Das macht sie immer, wenn sie nachdenkt.']],
      choices: [
        { t: 'Samira die ganze Wahrheit sagen', light: 12, r: 'Samira: „Ich weiß. Und ich bin noch da.“ Mehr braucht es nicht.' },
        { t: 'Noch nicht. Einfach nebeneinander sitzen.', light: 6, r: 'Samira wartet, bis du bereit bist. Das ist ihre ganze Strategie, und sie hält.' }] },
    { n: 3, title: 'Eine Nacht, die anders begann', set: 'street', cast: ['leon', 'mert', 'tobi'],
      lines: [['', 'Die Clique zieht los, Tobi hat eine Route mit vier Kneipen. Dann kommt der Regen.'],
        ['', 'Aus einer Tür fällt Musik, Wärme und ein Streifen farbiges Licht auf das nasse Pflaster.'],
        ['mert', 'Da rein!']],
      choices: [
        { t: 'Mit Mert reingehen', light: 12, r: 'Zwei Männer halten sich an der Bar an den Händen, und niemand schaut hin. Zum ersten Mal atmest du ganz aus.' },
        { t: 'Draußen im Regen stehen bleiben', light: 4, r: 'Mert kommt zurück, nass bis auf die Haut: „Kommst du jetzt, oder was?“ Du gehst doch rein.' }] },
    { n: 4, title: 'Der Spiegel mit den Glühbirnen', set: 'mirror', cast: ['leon'],
      lines: [['', 'Hinter der kleinen Bühne hängt ein Spiegel mit Glühbirnen.'],
        ['leon', 'Zum ersten Mal schaue ich hinein und sehe jemanden, der noch keinen Namen hat.'],
        ['', 'Stelle Lady Lumas ersten Look zusammen. Ihr Name kommt von lumen, das Licht.']],
      studio: true },
    { n: 5, title: 'Die One Love Bar', set: 'door', cast: ['leon', 'velvet'],
      lines: [['', 'Holger schickt dich zur One Love Bar: „Da gibt es eine richtige Bühne. Und Velvet.“'],
        ['', 'Du stehst vor ihrer Tür und kannst dich nicht entscheiden, ob du reingehst.'],
        ['velvet', 'Entweder rennst du jetzt weg, oder du bleibst für immer.']],
      choices: [
        { t: 'Bleiben', light: 12, r: 'Velvet nickt: „Dann binde deine Schnürsenkel. Ich mag keine offenen Schnürsenkel.“' },
        { t: 'Einmal um den Block gehen und wiederkommen', light: 6, r: 'Als du zurückkommst, lehnt Velvet noch in der Tür. „Wusste ich doch.“' }] },
    { n: 6, title: 'Alte Wege, neue Gesichter', set: 'cafe', cast: ['leon', 'julian', 'mia'],
      lines: [['', 'Ein grauer Dienstag im April. Die Glocke über der Café-Tür bimmelt.'],
        ['julian', 'Hallo, Leon.'],
        ['leon', '(Ich habe den Lappen noch in der Hand und weiß nicht, wohin damit.)']],
      choices: [
        { t: 'Ihm einen Kaffee machen und zuhören', light: 10, r: 'Julian bleibt bis Ladenschluss. Manche Kapitel sind weniger abgeschlossen, als man dachte.' },
        { t: 'Weiter die Vitrine putzen', light: 5, r: 'Mia stellt zwei Tassen auf den Tresen und schaut dich an. Du setzt dich doch zu ihm.' }] },
    { n: 7, title: 'Die zweite Bühne', set: 'stage', cast: ['luma', 'velvet'],
      lines: [['velvet', 'Heute kein Playback. Heute deine Stimme.'],
        ['leon', '(Wer sich versteckt, tut das nicht ohne Grund.)'],
        ['velvet', 'Man darf nur nicht vergessen, sich irgendwann wieder herauszuholen.']],
      choices: [
        { t: 'Mit der eigenen Stimme singen', light: 14, r: 'Die ersten Töne zittern. Dann wird es still im Saal, und dann laut.' },
        { t: 'Noch einmal Playback', light: 5, r: 'Applaus. Velvet schiebt dir danach einen Zettel hin: „Nächstes Mal deine Stimme.“' }] },
    { n: 9, title: 'Rückkehr ins Leben', set: 'bar', cast: ['leon', 'velvet', 'nadine'],
      lines: [['', 'Die One Love Bar war geschlossen. Jetzt will Nadine Brandt sie kaufen und neu aufbauen.'],
        ['nadine', 'Ich habe selbst einmal Menschen gebraucht, die mich nicht gefragt haben, wer ich bin.'],
        ['velvet', 'Man kann nicht einfach neu streichen. Die Risse bleiben. Das sind die Narben.']],
      choices: [
        { t: 'Mit Nadine und Velvet neu planen', light: 10, r: 'Faire Löhne, ein guter Umbau und ein Herz über der Tür, das nicht ausgeht.' },
        { t: 'Erst einmal vorsichtig bleiben', light: 6, r: 'Nadine versteht das. „Darum bauen wir es diesmal gemeinsam.“' }] },
    { n: 10, title: 'Die Nacht der Wiedereröffnung', set: 'stage', cast: ['luma'],
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

  const PEOPLE = {
    leon: { name: 'Leon', look: { body: 'm', skin: '#d9a07a', hair: { style: 'short', color: '#1d1714' }, top: '#d8d4e2', topStyle: 'tee', coat: '#1c1a26', coatFab: 'leather', bottom: '#2a3550', bottomStyle: 'pants', shoes: '#e9e9ee' } },
    luma: { name: 'Lady Luma' },
    vater: { name: 'Vater', look: { body: 'm', skin: '#e0b08c', hair: { style: 'short', color: '#7d7a78' }, top: '#8a8f80', topStyle: 'long', coat: '#4a4438', bottom: '#3a3a40', botFab: 'cotton', bottomStyle: 'pants', shoes: '#2b2219', beard: '#6d6a68', size: 1.02 } },
    mutter: { name: 'Mutter', look: { body: 'w', skin: '#e8bc98', hair: { style: 'bob', color: '#6b4a2e' }, top: '#b98aa0', topStyle: 'long', fab: 'satin', bottom: '#3d3a4a', botFab: 'cotton', bottomStyle: 'pants', shoes: '#2b2219' } },
    samira: { name: 'Samira', look: { body: 'w', skin: '#b98262', hair: { style: 'long', color: '#140f0d' }, top: '#e2a33b', topStyle: 'long', bottom: '#253055', bottomStyle: 'pants', shoes: '#f2f2f2', hat: { type: 'band', color: '#d9b45a' } } },
    mert: { name: 'Mert', look: { body: 'm', skin: '#c89169', hair: { style: 'curly', color: '#16110e' }, top: '#c43b3b', topStyle: 'tee', bottom: '#2a3350', bottomStyle: 'pants', shoes: '#f5f5f5', beard: '#16110e' } },
    tobi: { name: 'Tobi', look: { body: 'm', skin: '#efc6a3', hair: { style: 'fringe', color: '#c9a26a' }, top: '#3c8a5c', topStyle: 'long', bottom: '#33384a', botFab: 'cotton', bottomStyle: 'pants', shoes: '#eeeeee', hat: { type: 'tophat', color: '#e9c46a' } } },
    velvet: { name: 'Velvet', look: { body: 'w', skin: '#8d5a3f', hair: { style: 'long', color: '#0c0a10' }, top: '#5a1446', topStyle: 'long', fab: 'satin', coat: '#2a0c22', coatFab: 'sparkle', bottom: '#14080f', botFab: 'satin', bottomStyle: 'pants', shoes: '#0e0e0e', size: 1.08, hat: { type: 'crown', color: '#c9a2ff' } } },
    julian: { name: 'Julian', look: { body: 'm', skin: '#e9c0a0', hair: { style: 'fringe', color: '#4a3020' }, top: '#f2f0ea', topStyle: 'long', coat: '#3a5f7f', bottom: '#2a2e3a', botFab: 'cotton', bottomStyle: 'pants', shoes: '#3a2a20', beard: '#4a3020' } },
    mia: { name: 'Mia', look: { body: 'w', skin: '#f0c9a8', hair: { style: 'pony', color: '#a2341e' }, top: '#2f8f86', topStyle: 'tee', bottom: '#2a2e3a', bottomStyle: 'pants', shoes: '#ffffff' } },
    nadine: { name: 'Nadine Brandt', look: { body: 'w', skin: '#e2b48e', hair: { style: 'bun', color: '#d8c7a6' }, top: '#f2efe8', topStyle: 'long', fab: 'satin', coat: '#20283f', bottom: '#20283f', botFab: 'cotton', bottomStyle: 'pants', shoes: '#111111' } }
  };


  // ------------------------------------------------------------ Licht (0 … 100)
  const LIGHT_START = 6;
  function clampLight(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function maxStoryLight() { return LIGHT_START + CHAPTERS.reduce((s, c) => s + (c.choices ? Math.max(...c.choices.map(x => x.light)) : 0), 0) + 10 + 20; }
  function ending(light) {
    if (light >= 85) return { id: 'licht', title: 'Ich bin das Licht', text: 'Du hast dich nicht länger versteckt. Der ganze Saal leuchtet, und du mit ihm.' };
    if (light >= 55) return { id: 'glanz', title: 'Glamour in den Adern', text: 'Viele mutige Schritte, ein paar leise. Der Glanz kommt von innen, und er wächst.' };
    return { id: 'funke', title: 'Ein erster Funke', text: 'Du hast noch oft geschwiegen. Das ist erlaubt. Hör nicht auf, dich kennenzulernen.' };
  }

  // ------------------------------------------------------------ Rhythmus
  const DIFF = {
    leicht: { name: 'Leicht', step: 2, doubles: 0, fall: 2.1, lanes: 4 },
    normal: { name: 'Normal', step: 1, doubles: 0.06, fall: 1.7, lanes: 4 },
    schwer: { name: 'Schwer', step: 0.5, doubles: 0.12, fall: 1.35, lanes: 4 }
  };
  const WIN = { perfect: 0.07, good: 0.14, brave: 0.22 };
  const PTS = { perfect: 300, good: 150, brave: 60 };

  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

  // Noten auf dem Taktraster: Strophe ruhiger, Refrain dichter (Abschnitte à 16 Schläge)
  function chart(opt) {
    const d = DIFF[opt.diff] || DIFF.normal, bpm = opt.bpm || SONG.bpm, beat = 60 / bpm, len = opt.len || SONG.fallbackLen;
    const start = Math.max(2, opt.lead == null ? 4 : opt.lead), end = len - 3, r = rng(opt.seed || 7), notes = [];
    let lane = 1;
    for (let t = start + (opt.offset || 0); t < end; t += beat * d.step) {
      const bar = Math.floor((t - start) / (beat * 16));
      const chorus = bar % 4 === 2 || bar % 4 === 3;
      if (!chorus && d.step < 1 && Math.round((t - start) / beat * 2) % 2 === 1 && r() < 0.5) continue;
      if (!chorus && d.step >= 1 && r() < 0.18) continue;
      const mv = r(); lane = mv < 0.4 ? (lane + 1) % 4 : mv < 0.8 ? (lane + 3) % 4 : Math.floor(r() * 4);
      notes.push({ t: +t.toFixed(3), lane });
      if (chorus && r() < d.doubles * 2) notes.push({ t: +t.toFixed(3), lane: (lane + 2) % 4 });
    }
    return notes;
  }

  function newShow(opt) {
    return { notes: chart(opt).map(n => Object.assign({ hit: null }, n)), diff: opt.diff || 'normal', score: 0, combo: 0, maxCombo: 0,
      counts: { perfect: 0, good: 0, brave: 0, miss: 0 }, cursor: 0, ev: [] };
  }
  function mult(combo) { return combo >= 30 ? 4 : combo >= 20 ? 3 : combo >= 10 ? 2 : 1; }
  function judge(dt) { const a = Math.abs(dt); return a <= WIN.perfect ? 'perfect' : a <= WIN.good ? 'good' : a <= WIN.brave ? 'brave' : null; }

  // Taste in Spur lane zur Songzeit t gedrückt
  function press(S, lane, t) {
    let best = null, bd = 9;
    for (let i = S.cursor; i < S.notes.length; i++) {
      const n = S.notes[i]; if (n.t - t > WIN.brave) break;
      if (n.hit || n.lane !== lane) continue;
      const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; }
    }
    if (!best) { S.ev.push({ k: 'empty', lane }); return null; }
    const j = judge(best.t - t); if (!j) return null;
    best.hit = j; S.counts[j]++; S.combo++; S.maxCombo = Math.max(S.maxCombo, S.combo);
    S.score += PTS[j] * mult(S.combo); S.ev.push({ k: 'hit', j, lane, t: best.t });
    return j;
  }
  // verpasste Noten abhaken
  function tick(S, t) {
    while (S.cursor < S.notes.length) {
      const n = S.notes[S.cursor];
      if (n.hit) { S.cursor++; continue; }
      if (t - n.t > WIN.brave) { n.hit = 'miss'; S.counts.miss++; S.combo = 0; S.ev.push({ k: 'miss', lane: n.lane }); S.cursor++; continue; }
      break;
    }
  }
  function accuracy(S) {
    const c = S.counts, tot = c.perfect + c.good + c.brave + c.miss; if (!tot) return 0;
    return (c.perfect + c.good * 0.7 + c.brave * 0.4) / tot;
  }
  function stars(acc) { return acc >= 0.9 ? 3 : acc >= 0.72 ? 2 : acc >= 0.45 ? 1 : 0; }
  function showLight(S) { return Math.round(accuracy(S) * 20); }

  // ------------------------------------------------------------ Spielstand
  function newSave() { return { v: 1, best: { leicht: 0, normal: 0, schwer: 0 }, stars: { leicht: 0, normal: 0, schwer: 0 }, look: Object.assign({}, DEFAULT_LOOK), story: { done: 0, bestLight: 0, endings: [] }, opt: { diff: 'normal', offset: 0, bpm: SONG.bpm, yt: false, sfx: true, quality: 'auto' } }; }
  function fixSave(s) {
    const d = newSave(); if (!s || typeof s !== 'object') return d;
    const o = Object.assign(d, s);
    o.best = Object.assign(newSave().best, s.best); o.stars = Object.assign(newSave().stars, s.stars);
    o.story = Object.assign(newSave().story, s.story); o.opt = Object.assign(newSave().opt, s.opt); o.look = normLook(s.look);
    return o;
  }

  const API = { SONG, WARDROBE, DEFAULT_LOOK, LOOK_KEYS, normLook, pick, cycle, lookName, CHAPTERS, PEOPLE, LIGHT_START, clampLight, maxStoryLight, ending,
    DIFF, WIN, PTS, chart, newShow, press, tick, judge, mult, accuracy, stars, showLight, newSave, fixSave };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.IBDL = API;
})(typeof window !== 'undefined' ? window : globalThis);
