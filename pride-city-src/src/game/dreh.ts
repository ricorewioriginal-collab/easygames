/* Erwachsenen-Darsteller*in und Sextape (nur mit „Inhalte ab 18“). Alles bleibt Andeutung wie bei den Liebesszenen:
   Set, Kamera, Regie-Zeilen, Kuss, Unterwäsche, Decke, Abblende mit Ton – keine Nacktheit, nichts Explizites im Bild.
   Was man dabei lernt, ist echt: Ausweis, aktueller STI-Test, Absprachen und Grenzen vor jeder Szene, Stoppwort,
   Kondom oder Testpool, Gage und Rechte am Bild, und dass Aufnahmen ohne Zustimmung zu teilen strafbar ist.
   Gedreht wird „on location“ in deiner Wohnung (liebe.ts, Modus 'set'), das Sextape mit der Handykamera (Modus 'tape'). */
import type { Game } from './Game';
import type { Line } from '../ui/ui';
import type { Look } from './Actor';
import { toast } from '../ui/ui';
import { sfx, nightSounds } from '../engine/Audio';
import { change } from './life';
import { post } from './social';
import { pcEvents } from './hooks';
import { GUEST_POOL, hash, stranger } from './flirt';
import { NIGHT_S, pairVoices } from './liebe';
import { annehmen, drehStufe, DREH_STUFEN, bonus } from './beruf';

const REGIE = { who: 'Regisseurin Coco', color: '#ff5fa2' };
const C = (text: string, choices?: Line['choices']): Line => ({ ...REGIE, text, choices });
const ICH = (text: string): Line => ({ who: 'Du', color: '#ff4fa3', text });

/** Szenen-Mottos (Klischees mit Augenzwinkern, alle Figuren erwachsen) */
export const SZENEN = [
  { id: 'zimmer', title: 'Zimmerservice um Mitternacht', lines: ['Klopf, klopf … Champagner gefällig?', 'Mehr Blickkontakt, das Tablett ist egal!', 'Die Kissen dürfen fliegen.'] },
  { id: 'klempner', title: 'Der Klempner kommt zweimal', lines: ['„Ich hab gehört, hier tropft was?“ – und Action!', 'Werkzeugkasten weg, du brauchst beide Hände.', 'Langsam, wir haben Zeit bis zum Abspann.'] },
  { id: 'massage', title: 'Die Massage', lines: ['Öl, Kerzen, leise Musik. Atmen …', 'Hände dahin, wo ihr es abgesprochen habt!', 'Ich will das Seufzen bis in die letzte Reihe hören.'] },
  { id: 'kalender', title: 'Feuerwehr-Kalender, Monat Juli', lines: ['Helm ab, Blick in die Kamera!', 'Die Hitze ist echt, das Feuer nicht.', 'Und jetzt … Wasser marsch? Nein, Spaß. Kuss!'] },
  { id: 'umkleide', title: 'Nach dem Training', lines: ['Handtuch über die Schulter, und los.', 'Ihr seid verschwitzt und verliebt. Spielt das!', 'Bank, Wand, Bett – ihr kennt den Ablauf.'] },
  { id: 'taxi', title: 'Taxi nach Mitternacht', lines: ['„Wohin soll\'s gehen?“ – „Zu mir.“ Action!', 'Mehr Spannung, das Taxameter läuft!', 'Tür zu, Licht runter.'] },
];
const STAGE = ['Rocco Glanz', 'Vicky Velvet', 'Dante Desire', 'Kiki Karamell', 'Max Muskel', 'Lola Lust', 'Jay Jaguar', 'Bambi Blitz', 'Toni Turbo', 'Sunny Samt'];

/** Regie-Situationen am Set: jeweils 0–2 Punkte, die beste Antwort ist die professionelle */
const SITUATIONEN: Array<[string, Array<[string, number]>]> = [
  ['Mitten in der Szene will die Regie etwas, das du vorher ausgeschlossen hast.', [['„Stopp. Das war nicht abgesprochen.“ – Absprache gilt', 2], ['Mitmachen, um keinen Ärger zu kriegen', 0], ['Nach dem Take in Ruhe sagen', 1]]],
  ['Dein Szenenpartner wirkt plötzlich angespannt.', [['Kurz unterbrechen und nachfragen, ob alles okay ist', 2], ['Weiterspielen, es läuft doch', 0], ['Der Regie ein Zeichen geben', 1]]],
  ['Das Licht ist zu hart, alle schwitzen.', [['Pause, Wasser, Softbox weiter weg', 2], ['Durchziehen', 0], ['Puder drauf und weiter', 1]]],
  ['Du hast deinen Text vergessen.', [['Improvisieren und dabei grinsen', 2], ['Nochmal von vorn', 1], ['Erstarren', 0]]],
  ['Die Produktion will das Video auch auf einer anderen Seite verkaufen.', [['Erst Vertrag lesen, eigene Zustimmung schriftlich', 2], ['Egal, Hauptsache Geld', 0], ['Mehr Gage verlangen', 1]]],
  ['Das Kondom ist beim Umziehen kaputtgegangen.', [['Neues holen, Szene wartet', 2], ['Ohne weitermachen', 0], ['Szene abbrechen', 1]]],
];

const tested = (g: Game) => { const s = g.save.data; return !!s.health.test && s.day - Number(s.health.test) <= 14; };

/** Studio Klappe Auf, Nachtschicht: Casting beim ersten Mal, danach ein Dreh pro Tag */
export function dreh(g: Game) {
  const s = g.save.data;
  g.closeMenu(); g.touch.show(true);
  if (!s.settings.adult) return;
  if (!s.flags.drehCast) { casting(g); return; }
  if (s.flags.drehDay === s.day) { g.dialog.say([C('Für heute ist die Szene im Kasten. Morgen wieder, und vorher gut schlafen.')]); return; }
  if (!tested(g)) { g.dialog.say([C('Dein letzter STI-Test ist älter als 14 Tage. Ohne aktuellen Test dreht hier niemand. Ab zum Checkpoint, das geht schnell und ist gratis.')]); s.pin = 'checkpoint'; return; }
  if (s.needs.energy < 25) { g.dialog.say([C('Du siehst müde aus. Am Set brauchst du Energie. Erst schlafen.')]); return; }
  const h = hash('dreh' + s.day + (Number(s.flags.drehN) || 0));
  const opts = [0, 1, 2].map((i) => SZENEN[(h + i * 2) % SZENEN.length]);
  g.dialog.say([C(`Heute drehen wir on location, in deiner Wohnung. Die Location-Miete zahlt die Produktion. Welches Drehbuch?`, opts.map((sz) => ({ label: `🎬 „${sz.title}“`, fn: () => setTimeout(() => cast(g, sz.id, h), 50) })))]);
}

function casting(g: Game) {
  const s = g.save.data;
  g.dialog.say([
    C('Willkommen in der Nachtschicht von Studio Klappe Auf. Ich bin Coco, ich führe Regie. Erst die Regeln, dann der Spaß.'),
    C('Ausweis: Am Set sind alle mindestens 18. Ohne Ausweiskopie dreht niemand.'),
    C('Gesundheit: Alle zwei Wochen ein STI-Test, dazu Kondome oder ein Testpool, in dem alle frisch getestet sind.'),
    C('Grenzen: Vor jeder Szene besprecht ihr, was geht und was nicht. Es gibt ein Stoppwort. Ein Nein gilt sofort, auch mitten im Take.'),
    C('Und dein Bild gehört dir: Was wo veröffentlicht wird, steht im Vertrag. Lies ihn. Immer.', [
      { label: '✍️ Klingt fair, ich bin dabei', fn: () => setTimeout(() => {
        s.flags.drehCast = s.day;
        const take = () => { annehmen(s, 'dreh'); pcEvents.emit('beruf', { id: 'dreh', name: 'Erwachsenen-Darsteller*in' }); };
        g.dialog.say([C(tested(g) ? 'Dein Test ist aktuell, perfekt. Du kannst ab sofort einmal am Tag drehen.' : 'Hol dir noch einen Test im Checkpoint, dann kann es losgehen.', [
          { label: '⭐ Als Hauptberuf annehmen', sub: '+20 % Gage', fn: take },
          { label: 'Erst mal nebenbei', fn: () => {} },
        ])], () => { g.save.write(); if (!tested(g)) s.pin = 'checkpoint'; });
      }, 50) },
      { label: 'Doch nicht mein Ding', fn: () => setTimeout(() => g.dialog.say([C('Völlig okay. Die Tür bleibt offen.')]), 50) },
    ]),
  ]);
}

/** Szenenpartner*in aussuchen, Absprache, drei Regie-Situationen, dann der Dreh */
function cast(g: Game, sceneId: string, h: number) {
  const sz = SZENEN.find((x) => x.id === sceneId)!;
  const rb = GUEST_POOL[h % GUEST_POOL.length], stage = STAGE[(h >>> 4) % STAGE.length], st = stranger('dreh:' + stage, rb, stage);
  let pts = 0;
  const steps: Line[] = [
    C(`Dein Szenenpartner heute: ${stage}. Profi, seit fünf Jahren dabei, super entspannt.`),
    { who: stage, color: st.color, text: 'Hi! Lass uns kurz absprechen: Küssen ja, Ausziehen bis zur Unterwäsche, der Rest unter der Decke. Stoppwort ist „Ananas“. Passt das?', choices: [
      { label: '🤝 Passt, Stoppwort „Ananas“', fn: () => { pts += 1; } },
      { label: 'Ich ergänze noch eine Grenze', sub: 'wird respektiert', fn: () => { pts += 1; } },
    ] },
    C('Schutz am Set?', [
      { label: '🎈 Kondome, liegen bereit', fn: () => {} },
      { label: '🧪 Testpool: beide frisch getestet', fn: () => {} },
    ]),
  ];
  const sit = SITUATIONEN.map((x, i) => [x, (h >> i) & 7] as const).sort((a, b) => a[1] - b[1]).slice(0, 2).map((x) => x[0]);
  for (const [q, opts] of sit) steps.push(C(q, opts.map(([label, p]) => ({ label, fn: () => { pts += p; sfx(p === 2 ? 'coin' : p === 1 ? 'move' : 'miss'); } }))));
  g.dialog.say(steps, () => shoot(g, sz, st, rb, stage, pts));
}

function shoot(g: Game, sz: typeof SZENEN[number], st: ReturnType<typeof stranger>, rb: string, stage: string, pts: number) {
  const s = g.save.data;
  const look: Look = { body: rb, rb, palette: 'rainbow', skin: 0, outfit: 'clothed', style: undefined, top: /^Female|_Female/.test(rb) };
  const lines: Array<[number, string]> = [[1.4, 'Und … Action!'], [5.2, sz.lines[0]], [10.4, sz.lines[1]], [14.4, sz.lines[2]], [18.4, 'Decke hoch, Kamera zwei ran …'], [23.4, 'Cut! Im Kasten. Großartig!']];
  g.enterHome(() => {
    void g.home!.romance(look, stage, () => {
      const b = document.createElement('div'); b.className = 'night';
      b.innerHTML = `<p>🎬 „${sz.title.replace(/</g, '')}“</p><small>Absprache ✔︎ · Test aktuell ✔︎ · Stoppwort ✔︎ · Abblende</small>`;
      document.body.appendChild(b); nightSounds(NIGHT_S, pairVoices(s, st.pron));
      setTimeout(() => { b.remove(); g.pass(180); review(g, sz.title, stage, st.color, pts); }, NIGHT_S * 1000);
    }, { mode: 'set', title: `🎬 „${sz.title}“ mit ${stage}`, lines });
  });
}

/** Bewertung, Fans, Gage und Karriere-Stufe */
export function drehResult(s: { flags: Record<string, string | number | boolean> }, pts: number, roll: number) {
  const stars = Math.max(1, Math.min(5, Math.round(1 + pts * .7 + roll * 1.4)));
  const before = drehStufe(s as never);
  const fans = stars * 260 + Math.round(roll * 300) + before * 400;
  s.flags.drehFans = (Number(s.flags.drehFans) || 0) + fans;
  s.flags.drehN = (Number(s.flags.drehN) || 0) + 1;
  const after = drehStufe(s as never);
  return { stars, fans, up: after > before ? DREH_STUFEN[after] : null, gage: 120 + after * 90 + stars * 35 };
}
function review(g: Game, title: string, stage: string, color: string, pts: number) {
  const s = g.save.data;
  const r = drehResult(s, pts, Math.random());
  const pay = Math.round(r.gage * bonus(s, 'dreh'));
  s.money += pay; s.flags.drehDay = s.day; s.rep += r.stars >= 4 ? 2 : 1;
  change(s, { energy: -25, hygiene: -35, fun: 15, social: 10 });
  post(s, 'Studio Klappe Auf', `Neu: „${title}“ mit ${s.name || 'dir'} und ${stage}. ${'⭐'.repeat(r.stars)}`);
  pcEvents.emit('drehTag', { title, stars: r.stars, fans: r.fans, pay });
  g.save.write(); g.city.refreshHud();
  const lines: Line[] = [
    C(r.stars >= 4 ? 'Das war echt. Die Chemie hat man bis hinter die Kamera gespürt.' : r.stars >= 3 ? 'Solide Szene. Beim nächsten Mal noch mehr Blickkontakt.' : 'Holprig, aber ehrlich. Jeder fängt mal an.'),
    { who: stage, color, text: pts >= 4 ? 'Danke, dass du so auf die Absprachen geachtet hast. So macht Arbeit Spaß. 💜' : 'Gut gemacht! Nächstes Mal sagst du früher, wenn was nicht passt, okay?' },
  ];
  if (r.up) lines.push(C(r.up === 'Legende' ? 'Du bist eine Legende. Die Golden-Peach-Trophäe gehört dir. 🍑🏆' : `Die Fans lieben dich. Du bist jetzt ${r.up}!`));
  g.dialog.say(lines, () => g.hud.banner(`🎬 ${'⭐'.repeat(r.stars)} „${title}“`, `+${pay} € Gage · +${r.fans} Fans · ${DREH_STUFEN[drehStufe(s)]}`, 'good', 4600));
}

/* ---------- Sextape mit dem Handy ---------- */
/** Fragt vor der Liebesszene, ob beide filmen wollen; go(true) = Sextape */
export function tapeAsk(g: Game, name: string, color: string, key: string, go: (tape: boolean) => void): Line {
  const yes = hash('tape:' + key) % 5 < 3;
  return { who: 'Du', color: '#ff4fa3', text: 'Wollen wir es mit dem Handy filmen? Nur, wenn du das auch willst.', choices: [
    { label: '📹 Sextape aufnehmen?', sub: 'beide müssen Ja sagen', fn: () => setTimeout(() => g.dialog.say([{ who: name, color, text: yes ? 'Ooh, ja! Aber das Video bleibt bei uns, außer wir entscheiden zusammen was anderes. 😏' : 'Lieber nicht, ich mag es ohne Kamera. Aber du darfst bleiben. 😉' }], () => go(yes)), 50) },
    { label: 'Ohne Kamera', fn: () => setTimeout(() => go(false), 50) },
  ] };
}
/** Am Morgen danach: Was passiert mit dem Video? (Zustimmung beider, sonst strafbar) */
export function tapeAfter(g: Game, name: string, color: string, key: string, done: () => void) {
  const s = g.save.data, share = hash('teilen:' + key) % 2 === 0;
  s.flags.tapes = (Number(s.flags.tapes) || 0) + 1;
  g.dialog.say([{ who: name, color, text: 'Und … unser Video? 🙈', choices: [
    { label: '🔒 Nur für uns zwei behalten', fn: () => { change(s, { fun: 8 }); setTimeout(() => g.dialog.say([{ who: name, color, text: 'Gut. Unser kleines Geheimnis. 💜' }], done), 50); } },
    { label: '🌐 Gemeinsam auf eine Fanseite stellen?', sub: 'nur mit Ja von beiden', fn: () => setTimeout(() => {
      if (!share) { g.dialog.say([{ who: name, color, text: 'Nein, das will ich nicht. Bitte lösch es oder behalt es nur für dich.' }, ICH('Klar. Ohne dein Ja geht gar nichts. Wer so was ohne Zustimmung teilt, macht sich strafbar (§ 201a StGB). 💜')], done); return; }
      const pay = 60 + Math.floor(Math.random() * 140), fans = 150 + Math.floor(Math.random() * 300);
      s.money += pay; s.flags.drehFans = (Number(s.flags.drehFans) || 0) + fans;
      post(s, 'Du', '📹 Neues Video mit Herz online. Zu zweit beschlossen, zu zweit verdient.');
      sfx('coin'); toast(`📹 Hochgeladen: +${pay} € · +${fans} Fans (geteilt mit ${name})`);
      g.dialog.say([{ who: name, color, text: 'Halbe-halbe, und wir löschen es, wenn eine*r von uns das will. Deal? 🤝' }], done);
    }, 50) },
    { label: '🗑️ Löschen', fn: () => setTimeout(() => g.dialog.say([{ who: name, color, text: 'Auch gut. Die Erinnerung bleibt. 😘' }], done), 50) },
  ] }]);
}
