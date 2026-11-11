/* Lufia-Gefühl, eigenständig umgesetzt: Gefährten mit eigener Geschichte (Bindung, Lagerfeuer-Gespräche, persönliche Kapitel,
   Lebensentscheidung), die „Vier Gesichter des Risses“ als wiederkehrende Gegenspieler, Seelenbegleiter (7 Seelen × 5 Stufen),
   Echo-Relikte und Tagesgrotte für die Echogrotte, Leitmotive. Zustand liegt in S.lf. */

/* ---------- Leitmotive: kurze Tonfolgen je Figur (Halbtöne über dem Grundton) ---------- */
const MOTIF = {
  zotik: [220, [0, 4, 7, 12, 7], 'triangle'],
  lyra: [329.63, [0, 7, 12, 11, 7, 4], 'sine'],
  nia: [392, [0, 2, 4, 7, 9, 7], 'triangle'],
  rovan: [146.83, [0, 0, 5, 7, 5, 0], 'square'],
  vexa: [207.65, [0, 1, 0, 6, 5], 'sawtooth'],
  korrod: [130.81, [0, -1, -2, -5, -7], 'sawtooth'],
  mirrel: [277.18, [0, 6, 1, 7, 2], 'square'],
  ashen: [110, [0, 0, 1, 0, -12], 'sine']
};

/* ---------- Gefährten ---------- */
const NAMES = { lyra: 'Lyra', nia: 'Nia', rovan: 'Rovan' };
/* Lagerfeuer-Gespräche: ch = abgeschlossenes Kapitel, b = nötige Bindung */
const TALK = {
  lyra: [
    { ch: 0, b: 0, t: 'Sternbilder', L: [['Lyra', 'Siehst du das Sternbild da? Meine Mutter nannte es „die Laterne“. Sie sagte, es zeigt immer nach Hause.'], ['Zotik', 'Und wo ist zu Hause, wenn man zwischen Welten reist?'], ['Lyra', 'Vielleicht da, wo das Feuer brennt. Hier, gerade.']] },
    { ch: 3, b: 0, t: 'Ilva', q: 1, L: [['Lyra', 'Ich hatte eine Schwester. Ilva. Sie war beim Großen Bruch dabei, wie meine Mutter.'], ['Zotik', 'War?'], ['Lyra', 'Niemand hat sie je gefunden. Aber in den Notizen steht ein Satz: „Ilvas Stimme hallt in Noctaris.“'], ['Lyra', 'Wenn wir je dorthin kommen … hilfst du mir, ihr Echo zu suchen?'], ['Zotik', 'Versprochen.']] },
    { ch: 5, b: 20, t: 'Stimmen vergessen', L: [['Lyra', 'Weißt du, wovor ich Angst habe? Nicht vor Elyon. Nicht vor den Rissen.'], ['Lyra', 'Ich habe Angst, dass ich vergesse, wie Ilva gelacht hat. Jeden Tag ist es ein bisschen leiser.'], ['Zotik', 'Dann erzähl es mir. Dann erinnern wir uns zu zweit.'], ['Lyra', '… Sie hat gegluckst. Wie ein kleiner Bach.']] },
    { ch: 7, b: 40, t: 'Danach', L: [['Lyra', 'Was machst du, wenn alles vorbei ist, Zotik?'], ['Zotik', 'Darüber habe ich noch nie nachgedacht. Vielleicht einfach reisen. Ohne Risse.'], ['Lyra', 'Klingt schön. Mit … jemandem an deiner Seite?'], ['Zotik', 'Mit jemandem, der die Sterne kennt.']] }
  ],
  nia: [
    { ch: 0, b: 0, t: 'Der erste Pfeil', L: [['Nia', 'Mein erster Pfeil ist in einem Kürbis gelandet. Ich hatte auf einen Vogel gezielt.'], ['Zotik', 'Und der Vogel?'], ['Nia', 'Hat gelacht. Ich schwöre, er hat gelacht.']] },
    { ch: 2, b: 0, t: 'Meisterin Kesh', q: 1, L: [['Nia', 'Meine Lehrmeisterin hieß Kesh. Sie hat mir alles beigebracht – und ist dann einfach in die Wüste gegangen.'], ['Nia', 'Solmera. Ihr letzter Brief kam von dort. „Der Sand hat meinen Bogen, hol ihn, wenn du bereit bist.“'], ['Zotik', 'Dann holen wir ihn. Zusammen.']] },
    { ch: 5, b: 20, t: 'Daneben', L: [['Nia', 'Ich tue immer so, als wäre mir alles egal. Ist es nicht.'], ['Nia', 'Wenn ich danebenschieße, trifft es vielleicht einen von euch.'], ['Zotik', 'Du schießt nicht daneben, Nia. Nicht, wenn es zählt.']] },
    { ch: 7, b: 40, t: 'Ein eigener Name', L: [['Nia', 'Kesh sagte, ein Bogenschütze bekommt irgendwann einen zweiten Namen. Wenn er sich verdient hat.'], ['Zotik', 'Und deiner?'], ['Nia', 'Ich glaube … „die, die bleibt“. Klingt kitschig, oder?'], ['Zotik', 'Klingt richtig.']] }
  ],
  rovan: [
    { ch: 1, b: 0, t: 'Das Schild', L: [['Rovan', 'Dieses Schild hat mehr Kratzer als ich Jahre. Jeder einer, den ich nicht vergessen will.'], ['Zotik', 'Welcher war der erste?'], ['Rovan', 'Der, den ich bekam, als ich weglief.']] },
    { ch: 4, b: 0, t: 'Der Schwur', q: 1, L: [['Rovan', 'Beim Großen Bruch war ich Wächter in Frosthain. Ich hörte den Kern schreien – und bin gelaufen.'], ['Rovan', 'Ich habe geschworen, nie wieder zu laufen. Aber ein Schwur, den man nur sich selbst gibt, ist leicht.'], ['Rovan', 'In Frosthain liegt mein alter Posten. Dort will ich ihn erneuern. Vor Zeugen.'], ['Zotik', 'Dann bin ich dein Zeuge.']] },
    { ch: 6, b: 20, t: 'Alt werden', L: [['Rovan', 'Ihr seid jung. Ihr glaubt, man kann alles reparieren.'], ['Zotik', 'Kann man nicht?'], ['Rovan', 'Nein. Aber man kann daneben stehen bleiben, während es heilt. Das habe ich von euch gelernt.']] },
    { ch: 8, b: 40, t: 'Weitergeben', L: [['Rovan', 'Wenn ich irgendwann nicht mehr kann, nimm das Schild.'], ['Zotik', 'Rovan …'], ['Rovan', 'Nicht heute. Aber irgendwann. Es gehört zu dem, der bleibt.']] }
  ]
};
/* persönliche Kapitel: Welt, Ort, Gegner, Text davor/danach */
const PQ = {
  lyra: { w: 8, em: '💫', name: 'Ilvas Echo', foe: 'Ilvas Schattenecho', col: 0x9a8aff,
    pre: [['Erzähler', 'Zwischen den Laternen hängt eine Stimme. Sie gluckst – wie ein kleiner Bach.'], ['Lyra', 'Ilva …? Nein. Das ist nur ihr Echo. Und der Riss hat es verdreht!']],
    post: [['Erzähler', 'Das Schattenecho zerfällt. Was bleibt, ist ein leises Lachen – und dann Stille.'], ['Lyra', 'Ich habe sie gehört. Wirklich gehört. Danke, Zotik.'], ['Lyra', 'Jetzt kann ich mich erinnern, ohne Angst zu haben, es zu verlieren.']] },
  nia: { w: 4, em: '🏹', name: 'Keshs Bogen', foe: 'Sandwächter des Bogens', col: 0xffc860,
    pre: [['Erzähler', 'Im Sand steckt ein Bogen aus dunklem Holz. Darum kreist etwas, das nicht losgelassen werden will.'], ['Nia', 'Keshs Bogen! Na gut, Sand. Dann eben auf die harte Tour.']],
    post: [['Nia', 'Er liegt in meiner Hand, als wäre er immer meiner gewesen.'], ['Erzähler', 'In den Griff ist ein Satz geritzt: „Für die, die bleibt.“'], ['Nia', '… Sie wusste es. Die ganze Zeit.']] },
  rovan: { w: 6, em: '🛡️', name: 'Rovans alter Posten', foe: 'Frostgestalt der Flucht', col: 0x8ad8ff,
    pre: [['Rovan', 'Hier stand ich. Und von hier bin ich gelaufen.'], ['Erzähler', 'Aus dem Eis tritt eine Gestalt – Rovan, jünger, mit Angst in den Augen.'], ['Rovan', 'Diesmal bleibe ich stehen.']],
    post: [['Rovan', 'Ich, Rovan, Wächter von Frosthain, schwöre: Ich bleibe. Bei ihnen. Bis zum Ende.'], ['Zotik', 'Gehört.'], ['Rovan', 'Das Schild fühlt sich leichter an. Seltsam.']] }
};

/* ---------- Die Vier Gesichter des Risses ---------- */
const FACE = { vexa: ['Vexa', 'Gesicht der Furcht', 0xb03aff], korrod: ['Korrod', 'Gesicht des Zerfalls', 0x7a9a3a], mirrel: ['Mirrel', 'Gesicht der Täuschung', 0x3ad8d8], ashen: ['Ashen', 'Gesicht der Leere', 0x8a8a9a] };
export const LCUT = {
  LUN_FUTURE: [['Erzähler', 'Viele Generationen später. Am Weltenstein von Lunaris sitzt ein Kind und hält ein Ohr an den kalten Stein.'], ['Kind', 'Großmutter, stimmt es, dass er noch summt? Der Fuchs, der die Welten gehalten hat?'], ['Großmutter', 'Hör genau hin. Dann hörst du ihn. Und die, die mit ihm gegangen sind.'], ['Erzähler', 'Doch die Geschichte beginnt viel früher. In einer Nacht, in der Zotik zum ersten Mal träumte.']],
  FACE_VEXA: [['???', 'Da ist er ja. Der kleine Weltenhörer.'], ['Vexa', 'Ich bin Vexa. Das erste der Vier Gesichter des Risses. Ich bin das Zittern in deinen Pfoten.'], ['Zotik', 'Ich habe keine Angst vor dir!'], ['Vexa', 'Noch nicht. Zeig mir, wie lange das hält.']],
  FACE_VEXA_END: [['Vexa', 'Das genügt. Du bist noch zu klein, um Angst richtig zu kennen.'], ['Vexa', 'Wir sehen uns wieder, wenn du etwas zu verlieren hast.'], ['Erzähler', 'Vexa verschwindet in einem Riss. Die Luft riecht nach Gewitter.'], ['Lyra', 'Zotik! Alles in Ordnung? Das war … keine Wächterin. Das war etwas anderes.']],
  FACE_KORROD: [['Korrod', 'Sand. Immer nur Sand. Alles, was ihr baut, wird zu mir.'], ['Vexa', 'Korrod, sei nicht so trübsinnig. Sieh, wie der Kleine gewachsen ist.'], ['Korrod', 'Er wächst. Also zerfällt er. Nur langsamer.'], ['Erzähler', 'Die beiden lösen sich auf wie eine Fata Morgana.']],
  FACE_MIRREL: [['Mirrel', 'Wie schön, ihr seid alle da. Oder bin nur ich da – und ihr seid ich?'], ['Rovan', 'Lass die Spielchen.'], ['Mirrel', 'Rovan. Du bist gelaufen, weißt du noch? Vielleicht läufst du wieder.'], ['Erzähler', 'Mirrel zerspringt wie ein Spiegel. Rovan steht lange still.']],
  FACE_ASHEN: [['Ashen', '…'], ['Erzähler', 'Eine Gestalt ohne Gesicht steht zwischen den Laternen. Wo sie hinsieht, erlöschen sie.'], ['Ashen', 'Wenn alles gehört ist, bleibt Stille. Ich bin die Stille danach.'], ['Lyra', 'Das vierte Gesicht. Jetzt sind sie vollzählig.']],
  FACE_AST: [['Vexa', 'Jetzt hast du etwas zu verlieren, Weltenhörer. Ich sehe es an deinen Freunden.'], ['Korrod', 'Und alles, was man hat, verliert man.'], ['Zotik', 'Dann versucht es. Diesmal laufe ich nicht weg – und keiner von uns.']],
  FACE_AST_END: [['Vexa', 'Das … Zittern. Es ist weg.'], ['Korrod', 'Dann zerfalle ich eben zuerst.'], ['Erzähler', 'Zwei Gesichter des Risses lösen sich in Licht auf.']],
  FACE_ELY: [['Mirrel', 'Wir sind die Letzten. Oder die Ersten – das weiß hier keiner so genau.'], ['Ashen', 'Wenn ihr den Kern erreicht, endet das Hören. Bleibt.'], ['Lyra', 'Nein. Wir gehen weiter.']],
  FACE_ELY_END: [['Ashen', 'Stille … ist auch eine Antwort.'], ['Mirrel', 'Wie ehrlich. Wie langweilig.'], ['Erzähler', 'Die Vier Gesichter des Risses sind verstummt. Nur der Kern summt noch.']],
  ENDING_SACRIFICE: [['Zotik', 'Ich gehe allein. Der Kern hat mir einmal geantwortet. Er wird es wieder tun.'], ['Lyra', 'Zotik, nein!'], ['Rovan', 'Lasst ihn. Manche Schwüre gibt man nur sich selbst.'], ['Erzähler', 'Zotik legt die Pfoten auf den Kern. Sieben Töne, ein Akkord – und dann ein achter, der nur ihm gehört.'], ['Erzähler', 'Die Risse schließen sich, einer nach dem anderen. Der Kern summt ruhig. Von Zotik bleibt ein Licht im Stein.'], ['Nia', 'Er summt. Hört ihr? Er summt mit.'], ['Erzähler', 'Viele Generationen später hält ein Kind ein Ohr an den Weltenstein. Und hört ihn.']]
};

/* ---------- Seelenbegleiter ---------- */
export const SOULS = {
  hain: { em: '🌿', n: 'Hain', el: 'nature', col: 0, fav: 'fruit', w: 0, st: ['Moosling', 'Blütling', 'Dornling', 'Waldgeist', 'Hainwächter'], fx: 'ausgewogen' },
  licht: { em: '✨', n: 'Licht', el: 'light', col: 0xffe27a, fav: 'shards', w: 4, st: ['Schimmerling', 'Strahling', 'Glanzfell', 'Sonnengeist', 'Morgenwächter'], fx: 'Lichtschaden' },
  flut: { em: '💧', n: 'Flut', el: '', col: 0x4ab0ff, fav: 'potion', w: 5, st: ['Tröpfling', 'Wellchen', 'Gischtfell', 'Flutgeist', 'Tiefenwächter'], fx: 'heilt dich alle 12 s' },
  frost: { em: '❄️', n: 'Frost', el: 'ice', col: 0x8ad8ff, fav: 'potion', w: 6, st: ['Flöckling', 'Reifling', 'Eiszahn', 'Frostgeist', 'Gletscherwächter'], fx: 'Eisschaden, verlangsamt' },
  glut: { em: '🔥', n: 'Glut', el: 'fire', col: 0xff7a3a, fav: 'ether', w: 7, st: ['Funkling', 'Glutling', 'Flammfell', 'Aschegeist', 'Phönixwächter'], fx: 'Feuerschaden' },
  schatten: { em: '🌑', n: 'Schatten', el: '', col: 0x8a6aaa, fav: 'fruit', w: 8, st: ['Dämmerling', 'Nebling', 'Schattenfell', 'Nachtgeist', 'Traumwächter'], fx: '+25 % Schaden' },
  sturm: { em: '⚡', n: 'Sturm', el: 'storm', col: 0xb08aff, fav: 'ether', w: 9, st: ['Zischling', 'Böling', 'Donnerfell', 'Sturmgeist', 'Himmelswächter'], fx: 'Sturmschaden' }
};
const FOOD = { potion: 'Heiltrank', ether: 'Äther', fruit: 'Kristallfrucht', shards: 'Splitter' };
export const SOUL_LV = [1, 5, 10, 15, 20];
const RELIC = ['Echo der Laterne', 'Echo des Pfeils', 'Echo des Schildes', 'Echo der Wurzel', 'Echo der Flut', 'Echo des Frostes', 'Echo der Glut', 'Echo der Nacht', 'Echo des Himmels'];

export function createLufia(C) {
  const S = () => C.S(), X = C.X;
  const st = () => { const s = S(); s.lf = s.lf || { pz: 0 }; const l = s.lf; l.b = l.b || {}; l.tk = l.tk || {}; l.pq = l.pq || {}; l.fa = l.fa || {}; l.so = l.so || ['hain']; l.rel = l.rel || []; l.dc = l.dc || []; return l };
  const lv = id => Math.min(5, Math.floor((st().b[id] || 0) / 20));
  let pend = [], idle = 0, fight = null, flutT = 0, tinted = '', unwin = null, applied = '', tickT = 0;

  function motif(id, delay) {
    const m = MOTIF[id]; if (!m) return; const [f0, seq, ty] = m;
    seq.forEach((s, i) => C.tone(f0 * Math.pow(2, s / 12), .22, ty, .05, null, (delay || 0) + i * .17));
  }
  function addBond(id, v) {
    if (!NAMES[id]) return; const l = st(), a = l.b[id] || 0, b = Math.min(100, a + v); l.b[id] = b;
    if (Math.floor(b / 20) > Math.floor(a / 20)) { C.toast(`💞 Bindung mit ${NAMES[id]}: Stufe ${Math.floor(b / 20)} (Teamangriff stärker)`); motif(id) }
  }
  const bondMul = (id, team) => { const b = st().b[id] || 0, p = st().pq[id] === 2 ? .15 : 0; return team ? 1 + b / 200 + p + (id === 'lyra' && st().vow === 'bund' ? .15 : 0) : 1 + b / 250 + p };
  const party = () => (S().party || []).filter(id => NAMES[id]);

  /* ---- Ereignisse beim Betreten einer Welt (nach der Ankunftsszene, wenn Ruhe ist) ---- */
  function arrive(n) {
    fight = null; unwin = null; pend = []; const l = st(), W = C.WLD();
    if (!W || W.cave || (C.guest && C.guest())) return;
    l.fa = l.fa || {};
    if (n === 2 && !l.fa.v && !C.chDone(2)) pend.push(() => faceVexa());
    if (n === 4 && !l.fa.k) pend.push(() => { l.fa.k = 1; motif('korrod'); C.cutscene('FACE_KORROD', () => C.saveGame(true)) });
    if (n === 6 && !l.fa.m) pend.push(() => { l.fa.m = 1; motif('mirrel'); C.cutscene('FACE_MIRREL', () => C.saveGame(true)) });
    if (n === 8 && !l.fa.a) pend.push(() => { l.fa.a = 1; motif('ashen'); C.cutscene('FACE_ASHEN', () => C.saveGame(true)) });
    if (n === 9 && !l.fa.f9) spot(n, 300, '👁️', 'Riss der Gesichter', 'Den Gesichtern entgegentreten', () => faceFight(n, ['vexa', 'korrod'], 'FACE_AST', 'f9'), () => !l.fa.f9 && !fight);
    if (n === 10 && !l.fa.f10) spot(n, 301, '👁️', 'Riss der Gesichter', 'Den Gesichtern entgegentreten', () => faceFight(n, ['mirrel', 'ashen'], 'FACE_ELY', 'f10'), () => !l.fa.f10 && !fight);
    for (const id in PQ) { const q = PQ[id]; if (q.w === n && l.pq[id] === 1) spot(n, 200 + n, q.em, q.name, 'Untersuchen', () => pqStart(id), () => st().pq[id] === 1 && !fight) }
    for (const k in SOULS) { const so = SOULS[k]; if (so.w === n && !l.so.includes(k)) spot(n, 100 + n, so.em, 'Seelenlicht', 'Seele rufen', () => soulFind(k), () => !st().so.includes(k)) }
  }
  function spot(n, key, em, name, pr, fn, vis) {
    const p = C.nqSpot(key); if (!p) return; const g = C.nqMarker(p[0], p[1], em); g.userData.on = vis;
    C.INT().push({ x: p[0], z: p[1], name, pr, rad: 3, vis, talk: fn });
  }
  /* Gegner mit eigenem Namen aus dem Grundgegner der Welt */
  function foe(n, key, name, sub, col, mul, x, z) {
    const W = C.WLD(), ED = C.ED, base = ED['b' + n] || ED.rift, k = 'lf_' + key;
    if (!ED[k]) { ED[k] = Object.assign({}, base, { name, sub, mini: true, make: () => C.tint(base.make(), col, .55) }); if (W && W.edKeys) W.edKeys.push(k) }
    const e = C.spawnEnemy(k, x, z); e.summoned = true; e.elite = 1; e.hp = e.max = Math.round(e.max * mul); e.m.root.scale.setScalar((e.d.sc || 1) * 1.4); e.rad *= 1.3; e.st = 'chase'; return e;
  }
  const near = (d) => { const p = C.pl, a = Math.random() * 6.283; return [p.x + Math.cos(a) * d, p.z + Math.sin(a) * d] };

  function faceVexa() {
    const l = st(); motif('vexa');
    C.cutscene('FACE_VEXA', () => {
      const [x, z] = near(7), e = foe(2, 'vexa', 'Vexa', 'Gesicht der Furcht', FACE.vexa[2], 1, x, z);
      e.hp = e.max = 999999; e.unwin = true; unwin = { e, t: 30 }; X.unwin = true; C.toast('😨 Vexa ist zu stark – halte durch!');
    });
    l.fa.v = 1;
  }
  function unwinEnd() {
    if (!unwin) return; const e = unwin.e; unwin = null; X.unwin = false;
    if (e && !e.dead) { e.dead = true; e.dt = 99; e.atk = null; e.m.root.visible = false; if (e.tel) e.tel.visible = false }
    C.pl.iframes = Math.max(C.pl.iframes || 0, 3); const s = S(); s.hp = Math.max(s.hp, Math.round(C.maxHp() * .6)); C.hideBoss();
    C.cutscene('FACE_VEXA_END', () => { C.gainXp(60); C.saveGame(true) });
  }
  function faceFight(n, ids, cut, flag) {
    if (fight) return; ids.forEach((id, i) => motif(id, i * 1.1));
    C.cutscene(cut, () => {
      const es = ids.map((id, i) => { const [x, z] = near(6 + i * 2); return foe(n, id, FACE[id][0], FACE[id][1], FACE[id][2], 4.2, x, z) });
      fight = { es, done: () => { st().fa[flag] = 1; C.cutscene(cut + '_END', () => { const s = S(); s.shards += 800; C.gainXp(400); C.toast('🏆 Gesichter des Risses besiegt · 💎 +800'); C.saveGame(true) }) } };
    });
  }
  function pqStart(id) {
    if (fight) return; if (!party().includes(id)) return C.say([['Zotik', `Das ist ${NAMES[id]}s Sache. Ohne ${NAMES[id]} gehe ich hier nicht weiter.`]]);
    const q = PQ[id], n = q.w; motif(id);
    C.say(q.pre.map(x => x.slice()), () => {
      const [x, z] = near(6), e = foe(n, 'pq_' + id, q.foe, NAMES[id] + 's Kapitel', q.col, 3.6, x, z);
      fight = { es: [e], done: () => { st().pq[id] = 2; addBond(id, 20); motif(id); C.say(q.post.map(x => x.slice()), () => { const s = S(); s.shards += 500; C.gainXp(300); C.toast(`📖 ${NAMES[id]}s Kapitel abgeschlossen · Bindung +20 · ${NAMES[id]} kämpft dauerhaft stärker`); C.saveGame(true) }) } };
    });
  }

  /* ---- Seelen ---- */
  function soulFind(k) {
    const l = st(), so = SOULS[k]; if (l.so.includes(k)) return; l.so.push(k); C.sfx('level');
    C.say([['Erzähler', `Ein ${so.em} Seelenlicht schwebt heran und kreist um Felli.`], ['Felli', 'Pip?! Pip pip!'], ['Zotik', `Die Seele des ${so.n}s. Im Seelenbegleiter-Menü kann Felli jetzt diese Gestalt annehmen.`]], () => C.saveGame(true));
    C.toast(`${so.em} Seele „${so.n}“ gefunden (${l.so.length}/7)`);
  }
  const soul = () => SOULS[st().sk] ? st().sk : 'hain';
  function soulSet(k) { const l = st(); if (!l.so.includes(k)) return; l.sk = k; applied = k; C.felliStages(SOULS[k].st); tickT = 0; C.sfx('ui'); C.toast(`${SOULS[k].em} Felli nimmt die Seele „${SOULS[k].n}“ an`); C.saveGame(true) }
  function tintFelli() {
    const f = C.felli(); if (!f) return; let cnt = 0; f.root.traverse(o => { if (o.material) cnt++ }); const k = soul(), key = k + ':' + cnt; if (key === tinted) return; tinted = key;
    const col = SOULS[k].col, tc = col ? new C.T.Color(col) : null;
    f.root.traverse(o => { if (!o.material || Array.isArray(o.material)) return; if (!o.userData.m0) o.userData.m0 = o.material; const m0 = o.userData.m0; if (!tc) { o.material = m0; return } const c = m0.clone(); if (c.color) c.color.lerp(tc, .5); if (c.emissive && c.emissive.getHex() > 0) c.emissive.lerp(tc, .5); o.material = c });
  }
  function soulHTML() {
    const l = st(), cur = soul();
    let h = `<h3>✦ Seelenbegleiter (${l.so.length}/7 Seelen)</h3><p style="color:var(--dim);font-size:13px">Felli kann die Seelen annehmen, die ihr in den Welten findet (Seelenlicht). Jede Seele hat fünf Stufen (ab 1, 5, 10, 15 und 20) und ein Lieblingsessen, das doppelte Erfahrung gibt.</p>`;
    for (const k in SOULS) {
      const so = SOULS[k], has = l.so.includes(k);
      h += `<div class="row"><span>${has ? so.em + ' ' + so.n + ' · ' + so.fx + ' · mag ' + FOOD[so.fav] : '❔ unbekannte Seele'}</span><span>${has ? (k === cur ? '✔ aktiv' : `<button class="cpb" data-lfs="${k}">Annehmen</button>`) : '–'}</span></div>`;
    }
    return h;
  }
  /* ---- Lager: Bindung, Gespräche, Lebensentscheidung ---- */
  function nextTalk(id) { const l = st(), seen = l.tk[id] || 0, t = TALK[id][seen]; if (!t) return null; if (t.ch && !C.chDone(t.ch)) return { lock: 'nach Kapitel ' + t.ch }; if ((l.b[id] || 0) < t.b) return { lock: 'Bindung ' + t.b }; return t }
  function campHTML() {
    const ps = party(); if (!ps.length) return '';
    const l = st();
    let h = '<h3>🔥 Lagerfeuer</h3>';
    for (const id of ps) {
      const t = nextTalk(id), b = l.b[id] || 0;
      h += `<div class="row"><span>${NAMES[id]} · 💞 ${b}/100 (Stufe ${lv(id)})${l.pq[id] === 2 ? ' · 📖' : ''}</span><span>${t && !t.lock ? `<button class="cpb" data-lft="${id}">Gespräch: ${t.t}</button>` : t ? '🔒 ' + t.lock : 'alles erzählt'}</span></div>`;
      if (l.pq[id] === 1) h += `<div class="row"><span style="color:var(--dim)">📖 Persönliches Kapitel: ${PQ[id].name} (Welt ${PQ[id].w})</span><span></span></div>`;
    }
    if (decOk()) h += `<div class="row"><span>🌌 Lyra möchte unter dem Sternenhimmel mit dir reden</span><span><button class="cpb" data-lfv="1">Zu ihr gehen</button></span></div>`;
    else if (l.vow) h += `<div class="row"><span>🌌 ${l.vow === 'bund' ? 'Zotik & Lyra: ein Versprechen' : 'Zotik & Lyra: beste Freunde'}</span><span></span></div>`;
    return h;
  }
  const decOk = () => { const l = st(); return !l.vow && party().includes('lyra') && C.chDone(5) && (l.b.lyra || 0) >= 40 && (l.tk.lyra || 0) >= 3 };
  function talk(id) {
    const t = nextTalk(id); if (!t || t.lock) return; const l = st(); C.closeMenu(); motif(id);
    C.say(t.L.map(x => x.slice()), () => { l.tk[id] = (l.tk[id] || 0) + 1; addBond(id, 8); if (t.q && !l.pq[id]) { l.pq[id] = 1; C.toast(`📖 Neues persönliches Kapitel: ${PQ[id].name} (Welt ${PQ[id].w})`) } C.saveGame(true) });
  }
  function decide() {
    if (!decOk()) return; C.closeMenu(); motif('lyra');
    C.say([['Erzähler', 'Das Feuer ist heruntergebrannt. Lyra sitzt etwas abseits und zählt Sterne.'], ['Lyra', 'Zotik … wenn das hier vorbei ist, gehen wir dann getrennte Wege?'], ['Lyra', 'Ich will es einfach wissen. Egal, wie die Antwort ist.']], null,
      [{ t: 'Ein Versprechen: wir bleiben zusammen', fn: () => vow('bund') }, { t: 'Beste Freunde – für immer', fn: () => vow('freund') }]);
  }
  function vow(v) {
    const l = st(); l.vow = v; addBond('lyra', 10);
    C.say(v === 'bund' ? [['Zotik', 'Kein getrennter Weg. Ich verspreche es dir – unter der Laterne.'], ['Lyra', 'Dann halte ich dich daran fest. Für immer.'], ['Erzähler', 'Ein Band aus Sternenlicht legt sich um beide. (Lyras Teamangriff dauerhaft stärker)']] : [['Zotik', 'Was auch passiert – du bist meine beste Freundin. Daran ändert kein Riss etwas.'], ['Lyra', 'Beste Freunde. Das ist mehr, als die meisten je haben.'], ['Erzähler', 'Lyra lacht – und es klingt wie ein kleiner Bach. (Lyras Heilung kommt öfter)']], () => C.saveGame(true));
  }
  function bind(c, tab, re) {
    c.querySelectorAll('[data-lft]').forEach(b => b.onclick = () => talk(b.dataset.lft));
    c.querySelectorAll('[data-lfv]').forEach(b => b.onclick = () => decide());
    c.querySelectorAll('[data-lfs]').forEach(b => b.onclick = () => { soulSet(b.dataset.lfs); re() });
  }

  /* ---- Echogrotte: Relikte und Tagesgrotte ---- */
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') };
  const daySeed = () => { let h = 2166136261; for (const ch of 'echo' + today()) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 };
  function relic(f) {
    const i = f / 10 - 1, l = st(); if (i < 0 || i > 8 || f % 10 || l.rel.includes(i)) return; l.rel.push(i); C.sfx('level');
    C.banner('💠 Echo-Relikt', RELIC[i] + ` (${l.rel.length}/9)`);
    if (l.rel.length === 9) { S().shards += 5000; C.toast('🏆 Alle neun Echo-Relikte! 💎 +5000 · Titel „Echohüter“') }
  }
  function dayDone(f) { const l = st(), d = today(); let r = l.dc.find(x => x.d === d); if (!r) { r = { d, f: 0 }; l.dc.unshift(r) } r.f = Math.max(r.f, f); l.dc = l.dc.slice(0, 14) }
  function caveHTML() {
    const l = st(), r = l.dc.find(x => x.d === today());
    return `<div class="row"><span>💠 Echo-Relikte</span><span>${l.rel.length} / 9</span></div><div class="row"><span>📅 Tagesgrotte heute</span><span>${r ? 'Ebene ' + r.f : '–'}</span></div>` +
      (l.dc.length ? `<div class="row"><span>Bestenliste (deine Tagesläufe)</span><span>${l.dc.slice().sort((a, b) => b.f - a.f).slice(0, 5).map(x => x.d.slice(5) + ': ' + x.f).join(' · ')}</span></div>` : '');
  }

  /* ---- jeden Frame ---- */
  function update(dt) {
    if (X.tmulT > 0) X.tmulT -= dt;
    if (unwin) { unwin.t -= dt; if (unwin.t <= 0 && !C.dlgOn()) unwinEnd() }
    if (fight && fight.es.every(e => e.dead)) { const f = fight; fight = null; C.hideBoss(); setTimeout(f.done, 600) }
    if (pend.length) { idle = (C.dlgOn() || C.menuOpen() || C.pl.dead) ? 0 : idle + dt; if (idle > 1.5) { idle = 0; pend.shift()() } }
    if (soul() === 'flut' && S().felli && S().felli.on) { flutT += dt; if (flutT > 12) { flutT = 0; const s = S(), m = C.maxHp(); if (s.hp < m) { const h = Math.round(m * .08); s.hp = Math.min(m, s.hp + h); C.dnum(C.pl.x, C.pl.y + 2.3, C.pl.z, '+' + h, 'h') } } }
    tickT -= dt; if (tickT <= 0) { tickT = .5; const k = soul(); if (k !== applied) { applied = k; C.felliStages(SOULS[k].st) } tintFelli() }
  }
  /* Bindung wächst im Kampf: jeder besiegte Gegner, Bosse viel mehr */
  function kill(e) { if (!e || e.unwin) return; const v = e.d && (e.d.boss || e.cboss) ? 3 : e.elite ? 1 : .15; for (const id of party()) addBond(id, v) }

  return {
    motif, addBond, bondMul, arrive, update, kill, unwinEnd, campHTML, soulHTML, caveHTML, bind, relic, dayDone, daySeed, today,
    em: () => SOULS[soul()].em, soulEl: () => SOULS[soul()].el || undefined, soulMul: () => soul() === 'schatten' ? 1.25 : 1, fav: k => SOULS[soul()].fav === k, soul,
    bond: id => st().b[id] || 0, unwinOn: () => !!unwin, st
  };
}
