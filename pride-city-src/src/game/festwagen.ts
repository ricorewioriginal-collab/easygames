/* Pride-Saison: dein eigener CSD-Festwagen. In der Festwagen-Werkstatt (oder im Handy unter „Wetter und Termine“)
   wählst du Flagge, Farbe, Motto, Deko und Musik. Samstags fährt der Wagen bei der CSD-Parade mit (citylife.ts), du
   springst auf und fährst die Hauptstraße entlang; nach einer Weile vergibt die Jury ihren Preis. Die Flaggen-Infos
   kommen aus der Wissen-App (wissen.ts), nichts doppelt. Ereignisse für die Story: wagenGestaltet, paradeWagen (hooks.ts). */
import type { Game } from './Game';
import type { Item } from '../ui/ui';
import type { SaveData } from '../engine/Save';
import { hints, toast } from '../ui/ui';
import { sfx } from '../engine/Audio';
import { pcEvents } from './hooks';
import { flags as flagList } from './wissen';
import { palette } from './palettes';
import { owned } from './empire';

export interface Opt { id: string; name: string; pts: number; cost: number; c?: number }
export const FARBEN: Opt[] = [
  { id: 'pink', name: 'Knallpink', pts: 1, cost: 0, c: 0xff3fb0 }, { id: 'tuerkis', name: 'Türkis', pts: 1, cost: 0, c: 0x3bd1ff },
  { id: 'gold', name: 'Gold', pts: 1, cost: 40, c: 0xffc83d }, { id: 'lila', name: 'Lila', pts: 1, cost: 0, c: 0x8a2be2 },
  { id: 'gruen', name: 'Mintgrün', pts: 1, cost: 0, c: 0x3ee69a }, { id: 'weiss', name: 'Perlweiß', pts: 1, cost: 0, c: 0xf4f0ff },
];
export const DEKOS: Opt[] = [
  { id: 'ballons', name: 'Ballon-Masten', pts: 1, cost: 0 },
  { id: 'federn', name: 'Federfächer', pts: 2, cost: 90 },
  { id: 'herz', name: 'Riesenherz', pts: 2, cost: 120 },
  { id: 'kugel', name: 'Discokugel XXL', pts: 3, cost: 220 },
];
export const SOUNDS: Opt[] = [
  { id: 'box', name: 'Bluetooth-Box', pts: 0, cost: 0 },
  { id: 'schlager', name: 'Schlager-Anlage', pts: 1, cost: 60 },
  { id: 'disco', name: 'Disco-Soundsystem', pts: 2, cost: 140 },
  { id: 'techno', name: 'Techno-Wall mit Bass', pts: 3, cost: 260 },
];
export const MOTTOS = ['STOLZ UND FREI', 'LIEBE GEWINNT', 'QUEER IST HIER', 'ALLE FARBEN', 'NIE WIEDER STILL', 'FAMILIE IST, WER BLEIBT'];
const BUILD = 150;

export interface Wagen { flag: string; farbe: string; motto: number; deko: string; sound: string }
const DEF: Wagen = { flag: 'rainbow', farbe: 'pink', motto: 0, deko: 'ballons', sound: 'box' };
const FLAGS = () => flagList();

/** Spielstand: flags.wagen = "flag,farbe,motto,deko,sound", flags.wagenHave = gekaufte Teile */
export function wagenOf(s: SaveData): Wagen | null {
  if (!s.flags.wagen) return null;
  const [flag, farbe, motto, deko, sound] = String(s.flags.wagen).split(','), w = { ...DEF };
  if (FLAGS().some((f) => f.id === flag)) w.flag = flag;
  if (FARBEN.some((o) => o.id === farbe)) w.farbe = farbe;
  if (Number(motto) >= 0 && Number(motto) < MOTTOS.length + 1) w.motto = Number(motto);
  if (DEKOS.some((o) => o.id === deko)) w.deko = deko;
  if (SOUNDS.some((o) => o.id === sound)) w.sound = sound;
  return w;
}
export const wagenKey = (w: Wagen) => [w.flag, w.farbe, w.motto, w.deko, w.sound].join(',');
const have = (s: SaveData) => new Set(String(s.flags.wagenHave || '').split(',').filter(Boolean));
const opt = (list: Opt[], id: string) => list.find((o) => o.id === id) || list[0];
/** Motto-Text (das letzte Motto ist der eigene Drag-Name, sobald man die Krone trägt) */
export function mottoText(s: SaveData, w: Wagen) {
  if (w.motto >= MOTTOS.length) return s.flags.dragKrone ? `KÖNIGIN ${String(s.flags.drag || s.name).toUpperCase()}` : MOTTOS[0];
  return MOTTOS[w.motto];
}
const mottoCount = (s: SaveData) => MOTTOS.length + (s.flags.dragKrone ? 1 : 0);
/** Jury-Punkte: Deko, Musik, Farbe; Bonus für gekrönte Drag-Queen an Bord und einen eigenen Club als Sponsor */
export function score(s: SaveData, w: Wagen) {
  return 2 + opt(FARBEN, w.farbe).pts + opt(DEKOS, w.deko).pts + opt(SOUNDS, w.sound).pts + (s.flags.dragKrone ? 2 : 0) + (owned(s).length ? 1 : 0);
}
export const MAX_SCORE = 12;
/** Platz bei der Jury (1–3) */
export const place = (pts: number) => (pts >= 10 ? 1 : pts >= 7 ? 2 : 3);
export const PRIZE = [[350, 5], [180, 3], [80, 2]];
/** Farben für Streifen und Wagen */
export const wagenColors = (w: Wagen) => ({ stripe: palette(w.flag).colors, body: opt(FARBEN, w.farbe).c! });

const panel = (t: string, body: string) => `<div class="col"><div class="panel"><h3>${t}</h3>${body}<div class="slot"></div></div></div>`;

/** Werkstatt: Wagen gestalten. Neue Deko/Musik/Farben kosten einmalig, der erste Wagen 150 € Material. */
export function wagenMenu(g: Game, back?: () => void) {
  const s = g.save.data, close = () => { g.closeMenu(); g.touch.show(true); back?.(); };
  const w: Wagen = wagenOf(s) || { ...DEF }, got = have(s), built = !!s.flags.wagen;
  const cyc = <T,>(list: T[], cur: T, d: number) => list[(list.indexOf(cur) + d + list.length) % list.length];
  const cost = () => (built ? 0 : BUILD) + [opt(FARBEN, w.farbe), opt(DEKOS, w.deko), opt(SOUNDS, w.sound)].filter((o) => o.cost && !got.has(o.id)).reduce((a, o) => a + o.cost, 0);
  const tag = (o: Opt) => (o.cost && !got.has(o.id) ? ` · ${o.cost} €` : '');
  const info = () => {
    const f = FLAGS().find((x) => x.id === w.flag)!, pts = score(s, w), toSat = (5 - (s.day - 1) % 7 + 7) % 7;
    return `<p><b>„${mottoText(s, w)}“</b> · Jury-Punkte <b>${pts}/${MAX_SCORE}</b> (${['', 'Favorit auf Platz 1', 'Chancen auf Platz 2', 'Platz 3 drin'][place(pts)]})</p><p><small>🏳️ ${f.info}</small></p><p><small>Parade jeden Samstag 12–18 Uhr auf der Hauptstraße · ${toSat ? `nächste in ${toSat} ${toSat === 1 ? 'Tag' : 'Tagen'}` : 'heute!'}${s.flags.dragKrone ? ' · 👑 Deine Krone fährt mit (+2)' : ''}${owned(s).length ? ' · 🏙️ Dein Geschäft sponsert (+1)' : ''}</small></p>`;
  };
  const upd = () => { const e = document.querySelector('#ui .wagenInfo'); if (e) e.innerHTML = info(); };
  const items: Item[] = [
    { icon: '🏳️‍🌈', label: 'Flagge', sub: 'Streifen am Wagen · mehr in 🧠 Wissen', value: () => FLAGS().find((f) => f.id === w.flag)!.name, left: () => { w.flag = cyc(FLAGS().map((f) => f.id), w.flag, -1); upd(); }, right: () => { w.flag = cyc(FLAGS().map((f) => f.id), w.flag, 1); upd(); } },
    { icon: '🎨', label: 'Farbe', sub: 'Fahrerhaus und Rahmen', value: () => opt(FARBEN, w.farbe).name + tag(opt(FARBEN, w.farbe)), left: () => { w.farbe = cyc(FARBEN, opt(FARBEN, w.farbe), -1).id; upd(); }, right: () => { w.farbe = cyc(FARBEN, opt(FARBEN, w.farbe), 1).id; upd(); } },
    { icon: '📣', label: 'Motto', sub: 'Banner an beiden Seiten', value: () => mottoText(s, w), left: () => { w.motto = (w.motto - 1 + mottoCount(s)) % mottoCount(s); upd(); }, right: () => { w.motto = (w.motto + 1) % mottoCount(s); upd(); } },
    { icon: '🎈', label: 'Deko', sub: 'oben auf dem Wagen', value: () => opt(DEKOS, w.deko).name + tag(opt(DEKOS, w.deko)), left: () => { w.deko = cyc(DEKOS, opt(DEKOS, w.deko), -1).id; upd(); }, right: () => { w.deko = cyc(DEKOS, opt(DEKOS, w.deko), 1).id; upd(); } },
    { icon: '🔊', label: 'Musik', sub: 'je lauter, desto mehr Jubel', value: () => opt(SOUNDS, w.sound).name + tag(opt(SOUNDS, w.sound)), left: () => { w.sound = cyc(SOUNDS, opt(SOUNDS, w.sound), -1).id; upd(); }, right: () => { w.sound = cyc(SOUNDS, opt(SOUNDS, w.sound), 1).id; upd(); } },
    { icon: '🛠️', label: built ? 'Wagen umbauen' : 'Wagen bauen', sub: 'speichern', fn: () => {
      const c = cost();
      if (s.money < c) { sfx('miss'); toast(`Dafür fehlen ${c - s.money} €.`); return; }
      s.money -= c; [opt(FARBEN, w.farbe), opt(DEKOS, w.deko), opt(SOUNDS, w.sound)].forEach((o) => o.cost && got.add(o.id));
      s.flags.wagenHave = [...got].join(','); s.flags.wagen = wagenKey(w); g.save.write(); g.city.refreshHud();
      sfx(c ? 'coin' : 'win'); toast(`🛠️ ${built ? 'Umgebaut' : 'Dein Festwagen steht'}! ${c ? `−${c} € · ` : ''}Samstag rollt er bei der Parade mit.`);
      pcEvents.emit('wagenGestaltet', { flag: w.flag, motto: mottoText(s, w), deko: w.deko, sound: w.sound, score: score(s, w), first: !built });
      g.city.life.parade.refreshOwn();
      close();
    } },
    { icon: '←', label: 'Zurück', fn: close },
  ];
  // Beschriftung „Wagen bauen“ zeigt die Kosten live
  const bi = items[5]; Object.defineProperty(bi, 'sub', { get: () => (cost() ? `${cost()} € · speichern` : 'kostenlos speichern') });
  g.touch.show(false);
  g.openMenu(panel('🛠️ Dein CSD-Festwagen', `<div class="wagenInfo">${info()}</div>`), items, close, '');
  hints([['dpad', 'Wählen · ←/→ wechseln'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
}
