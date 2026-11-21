/* Drag-Karriere im Haus Vega: Nach deiner ersten Drag-Show (Kapitel 3) nimmt dich Mama Vega in der One Love Bar unter
   ihre Fittiche. Am Schminkspiegel baust du deinen Look, auf der Bühne trittst du in fünf Lip-Sync-Battles gegen die
   Queens der Stadt an (Rhythmusspiel aus dem Tanz-Battle). Jede Rivalin hat eine Kategorie: Ein passender Look macht
   es leichter. Wer alle fünf schlägt, trägt die Krone von Rainbow City und verteidigt sie danach jede Nacht.
   Zu jedem Sieg gibt es eine „Damals“-Karte mit echter Drag-Geschichte. Ereignisse für die Story: hooks.ts. */
import type { Game } from './Game';
import type { Item, Line } from '../ui/ui';
import { hints, toast } from '../ui/ui';
import { sfx, music } from '../engine/Audio';
import { change, advance } from './life';
import { pcEvents } from './hooks';
import { DanceScene } from './minigames/DanceScene';
import { playerLook, type Look } from './Actor';
import { CATS, PARTS, DRAG_HISTORY, lookKey, lookOf, piece, match, dragStyle, type Cat, type DragLook, type PartKey } from './dragLook';
import type { SaveData } from '../engine/Save';

const VEGA = { who: 'Mama Vega', pron: 'sie/ihr', color: '#ffd23b' };
const V = (text: Line['text'], choices?: Line['choices']): Line => ({ ...VEGA, text, choices });

export interface Rival { id: string; name: string; color: string; cat: Cat; skill: number; pts: number; look: Look; hello: string; win: string; lose: string; hist: string }
const Q = (rb: string, style: string): Look => ({ body: rb, rb, palette: 'rainbow', skin: 0, style });
export const RIVALS: Rival[] = [
  { id: 'tuetue', name: 'Miss Tütü Tornado', color: '#ff6ad5', cat: 'glitzer', skill: .6, pts: 80, look: Q('Female_Party_01', 'glitzer'), hist: 'sarria',
    hello: 'Pailletten-Nacht, Schätzchen! Ich glitzere so hell, dass die Discokugel Urlaub nimmt.', win: 'Okay, okay. Du hast mich weggewirbelt. Ich nehme es mit Glitzer.', lose: 'Ein Tornado lässt sich nicht so leicht wegpusten. Komm wieder!' },
  { id: 'lakritz', name: 'Lakritz LaBelle', color: '#c9a2ff', cat: 'retro', skill: .66, pts: 85, look: Q('Female_Adult_06', 'gold'), hist: 'mahlsdorf',
    hello: 'Ich singe seit den Neunzigern auf dieser Bühne. Heute: Diven von damals. Zeig mir, dass du Geschichte kennst.', win: 'Du hast den alten Glanz verstanden. Das ehrt mich, Kindchen.', lose: 'Erfahrung schlägt Wimpern. Noch.' },
  { id: 'chrom', name: 'Contessa Chrom', color: '#5ce1ff', cat: 'neon', skill: .72, pts: 90, look: Q('Male_Adult_07', 'drag'), hist: 'divine',
    hello: 'Neon-Futur. Ich bin aus dem Jahr 3000 gekommen, nur um dich zu schlagen.', win: 'Die Zukunft gehört dir. Ich fliege zurück und schreibe es in die Geschichtsbücher.', lose: 'Zu langsam für die Zukunft. Lade dich auf und komm wieder.' },
  { id: 'bambi', name: 'Bambi Bling', color: '#ffb347', cat: 'regenbogen', skill: .78, pts: 95, look: Q('Male_Adult_05', 'crop'), hist: 'conchita',
    hello: 'Regenbogen-Revue! Ich habe alle sechs Farben an und drei, die es noch gar nicht gibt.', win: 'Du hast den Regenbogen zum Strahlen gebracht. Schwesterherz, das war groß.', lose: 'Ein Regenbogen braucht Regen. Heute war ich die Sonne.' },
  { id: 'diamanda', name: 'Diamanda Royale', color: '#ff3fb0', cat: 'royal', skill: .84, pts: 100, look: Q('Female_Party_02', 'gold'), hist: 'race',
    hello: 'Ich trage die Krone von Rainbow City seit sieben Jahren. Königlicher Auftritt, Darling. Ich gebe sie nicht einfach her.', win: 'Sieben Jahre … und heute fühlt es sich richtig an, sie weiterzugeben. Trag sie mit Herz.', lose: 'Die Krone bleibt, wo sie ist. Aber ich habe gezittert, das gebe ich zu.' },
];


export const dragOpen = (s: SaveData) => s.chapter > 3 || (s.chapter === 3 && s.step >= 3) || !!s.flags.drag;
export const dragWins = (s: SaveData) => Math.min(RIVALS.length, Number(s.flags.dragWins) || 0);
export const dragQueen = (s: SaveData) => !!s.flags.dragKrone;
const stageName = (s: SaveData) => String(s.flags.drag || s.name);
const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(4 - n);
const panel = (t: string, body: string) => `<div class="col"><div class="panel"><h3>${t}</h3>${body}<div class="slot"></div></div></div>`;

/** Spot in der One Love Bar: Spiegel oder Bühne */
export function dragAct(g: Game, what: 'look' | 'battle') {
  const s = g.save.data;
  if (!dragOpen(s)) { g.dialog.say([V('Erst stehst du einmal selbst auf der Bühne, Liebes. Nova plant da etwas mit dir im Club Prisma. Danach komm zu Mama.')]); return; }
  if (what === 'look') { mirror(g); return; }
  stage(g);
}

/* ---------- Schminkspiegel ---------- */
function mirror(g: Game) {
  const s = g.save.data, close = () => { g.closeMenu(); g.touch.show(true); };
  const cur = () => lookOf(s.flags), next = dragWins(s) < RIVALS.length ? RIVALS[dragWins(s)] : null;
  const set = (k: PartKey, dir: number) => {
    const l = cur(), list = PARTS.find((p) => p[0] === k)![2] as readonly { id: string }[], i = list.findIndex((p) => p.id === l[k]);
    l[k] = list[(i + dir + list.length) % list.length].id; s.flags.dragLook = lookKey(l); sfx('move');
    dirty = true;
    const info = document.querySelector('#ui .dragInfo'); if (info) info.innerHTML = body();
  };
  let dirty = false;
  const apply = async () => { if (!dirty || !s.flags.dragOn) return; dirty = false; await g.inside?.syncPlayer(); await g.city.rebuildPlayer(); };
  const body = () => {
    const l = cur(), m = (Object.keys(CATS) as Cat[]).map((c) => `${CATS[c].icon} ${CATS[c].name}: <b>${stars(match(l, c))}</b>`).join('<br>');
    return `<p>Mama Vega reicht dir Puder und Pinsel. <i>„Ein Look erzählt eine Geschichte, ${stageName(s)}. Welche erzählst du heute?“</i></p><p><small>${m}</small></p>${next ? `<p>Nächstes Battle: <b>${next.name}</b> · ${CATS[next.cat].icon} ${CATS[next.cat].name} · dein Look passt ${stars(match(l, next.cat))}</p>` : '<p>👑 Du trägst die Krone. Jede Nacht kann eine Herausforderin kommen.</p>'}`;
  };
  const open = () => {
    const items: Item[] = [
      ...PARTS.map(([k, label]) => ({ icon: label.split(' ')[0], label: label.split(' ').slice(1).join(' '), sub: CATS[piece(k, cur()[k]).cat].icon + ' ' + CATS[piece(k, cur()[k]).cat].name, value: () => piece(k, cur()[k]).name, left: () => set(k, -1), right: () => set(k, 1) } as Item)),
      { icon: s.flags.dragOn ? '🧽' : '💃', label: s.flags.dragOn ? 'Abschminken' : 'Im Drag-Look ausgehen', sub: s.flags.dragOn ? 'wieder im Alltags-Look' : 'auch draußen in der Stadt, bis du dich abschminkst', fn: () => {
        s.flags.dragOn = !s.flags.dragOn; dirty = true; g.save.write(); sfx(s.flags.dragOn ? 'win' : 'open');
        toast(s.flags.dragOn ? `${stageName(s)} betritt die Stadt. ✨` : `Abgeschminkt. Hallo, ${s.name}!`);
        void apply(); open();
      } },
      { icon: '📜', label: 'Drag-Geschichte', sub: `${Object.keys(DRAG_HISTORY).filter((k) => s.flags['dwiss_' + k]).length}/${Object.keys(DRAG_HISTORY).length} Karten · echte Geschichten`, fn: () => history(g, open) },
      { icon: '←', label: 'Fertig', fn: () => { s.flags.dragLook = lookKey(cur()); g.save.write(); pcEvents.emit('dragLook', { look: cur(), style: dragStyle(cur()) }); void apply(); close(); } },
    ];
    g.touch.show(false);
    g.openMenu(panel('💄 Schminkspiegel', `<div class="dragInfo">${body()}</div>`), items, () => { void apply(); close(); }, '');
    hints([['dpad', 'Wählen · ←/→ wechseln'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
  };
  open();
}

function history(g: Game, back: () => void) {
  const s = g.save.data;
  const list = Object.entries(DRAG_HISTORY).map(([k, h]) => s.flags['dwiss_' + k] ? `<p><b>${h.year} · ${h.title}</b><br><small>${h.text}</small></p>` : '<p>🔒 <small>Gewinne ein Lip-Sync-Battle, um diese Geschichte zu lesen.</small></p>').join('');
  g.openMenu(panel('📜 Drag-Geschichte', list), [{ icon: '←', label: 'Zurück', fn: back }], back, '');
}

/* ---------- Bühne: Lip-Sync-Battles ---------- */
function stage(g: Game) {
  const s = g.save.data, w = dragWins(s), l = lookOf(s.flags);
  if (s.needs.energy < 12) { g.dialog.say([V('Du siehst aus wie eine Wimper nach dem Regen. Schlaf dich aus, dann sehen wir uns auf der Bühne.')]); return; }
  if (w >= RIVALS.length) {
    if (s.flags.dragDefend === s.day) { g.dialog.say([V('Heute hast du deine Krone schon verteidigt. Eine Königin braucht auch Schönheitsschlaf.')]); return; }
    const r = RIVALS[s.day % RIVALS.length];
    g.dialog.say([V(`Heute fordert dich ${r.name} heraus. Sie hat trainiert. Kategorie: ${CATS[r.cat].name}.`, [
      { label: 'Krone verteidigen', fn: () => battle(g, r, true) }, { label: 'Heute nicht', fn: () => {} }])]);
    return;
  }
  const r = RIVALS[w], m = match(l, r.cat);
  const intro: Line[] = w === 0 && !s.flags.dragMet ? [
    V(`Da ist ja ${stageName(s)}! Ich habe dich im Prisma gesehen. Roh wie ein ungeschliffener Strass, aber mit Feuer.`),
    V('Ich bin Mama Vega, Mutter vom Haus Vega. In dieser Stadt tragen fünf Queens die Bühne. Wer alle fünf im Lip-Sync schlägt, bekommt die Krone von Rainbow City.'),
    V('Jede hat ihre Kategorie. Bau dir am Spiegel einen Look, der dazu passt, dann trägt dich das Publikum.')] : [];
  s.flags.dragMet = true;
  g.dialog.say([...intro,
    { who: r.name, color: r.color, text: r.hello },
    V(`Battle ${w + 1} von ${RIVALS.length}: ${CATS[r.cat].icon} ${CATS[r.cat].name}. Dein Look passt ${stars(m)}.${m < 2 ? ' Am Spiegel geht da noch was.' : ''}`, [
      { label: 'Lip-Sync for your life!', fn: () => battle(g, r, false) }, { label: 'Erst zum Spiegel', fn: () => mirror(g) }, { label: 'Später', fn: () => {} }])]);
}

function battle(g: Game, r: Rival, defend: boolean) {
  const s0 = g.save.data, l = lookOf(s0.flags), m = match(l, r.cat);
  // passender Look: Rivalin trifft seltener (bis −14 %); Verteidigung ist etwas schwerer
  const skill = Math.max(.4, r.skill + (defend ? .05 : 0) - m * .035);
  g.closeMenu();
  g.loading.show('One Love Bar', `Lip-Sync gegen ${r.name}`);
  g.loading.progress(.4, 'Scheinwerfer an');
  const me = { ...playerLook(s0), style: dragStyle(l) };
  const sc = new DanceScene(g, (won, score) => {
    const s = g.save.data;
    change(s, { fun: 18, social: 10, energy: -12 }); advance(s, 25);
    g.save.write();
    g.fade(() => { g.resume(); g.city.refreshHud(); result(g, r, won, score, defend); });
  }, { look: me, rival: { name: r.name, look: r.look, skill, pts: r.pts } });
  sc.build().then(() => { g.loading.progress(1, 'Werk!'); g.engine.setScene(sc); g.loading.hide(); })
    .catch((e) => { console.error(e); g.loading.hide(); toast('Die Bühne konnte nicht starten.'); g.resume(); });
  music(null);
}

function result(g: Game, r: Rival, won: boolean, score: number, defend: boolean) {
  const s = g.save.data, w = dragWins(s);
  pcEvents.emit('dragBattle', { rival: r.id, name: r.name, won, score, stage: defend ? 0 : w + 1, defend });
  if (!won) { g.dialog.say([{ who: r.name, color: r.color, text: r.lose }, V('Kopf hoch, Krone gerade. Morgen ist eine neue Show. Vielleicht noch einmal an den Spiegel?')]); sfx('miss'); return; }
  const pay = defend ? 120 : 80 + w * 60, rep = defend ? 2 : 2 + w;
  s.money += pay; s.rep += rep; sfx('win'); sfx('cheer');
  if (defend) {
    s.flags.dragDefend = s.day; s.flags.dragDefends = (Number(s.flags.dragDefends) || 0) + 1; g.save.write(); g.city.refreshHud();
    g.hud.banner('👑 Krone verteidigt!', `+${pay} € Trinkgeld · +${rep} Ruf`, 'good', 4200);
    g.dialog.say([{ who: r.name, color: r.color, text: 'Du bist und bleibst die Königin. Bis zum nächsten Mal!' }]);
    return;
  }
  s.flags.dragWins = w + 1;
  const last = w + 1 >= RIVALS.length;
  if (last) s.flags.dragKrone = true;
  g.save.write(); g.city.refreshHud();
  g.hud.banner(last ? '👑 Die Krone von Rainbow City!' : `🎤 ${r.name} geschlagen!`, `+${pay} € · +${rep} Ruf${last ? '' : ` · noch ${RIVALS.length - w - 1} Battles`}`, 'good', 4600);
  const h = DRAG_HISTORY[r.hist];
  g.dialog.say([{ who: r.name, color: r.color, text: r.win },
    last ? V(`Meine Damen, Herren und alle dazwischen und darüber hinaus: ${stageName(s)} ist die neue Königin von Rainbow City!`) : V('Das Publikum tobt! Eine Queen weniger zwischen dir und der Krone.')], async () => {
    if (h && !s.flags['dwiss_' + r.hist]) { s.flags['dwiss_' + r.hist] = true; g.save.write(); pcEvents.emit('wissen', { key: 'drag_' + r.hist, title: h.title, topic: 'drag' }); await g.chapterCard(`Damals · ${h.year}`, h.title, h.text); }
    if (last) { pcEvents.emit('dragKrone', { name: stageName(s) }); await g.chapterCard('Drag-Karriere', 'Die Krone von Rainbow City', `${stageName(s)} hat alle fünf Queens geschlagen. Ab jetzt kann dich jede Nacht eine Herausforderin auf der Bühne der One Love Bar fordern.`); }
  });
}

/** Für Tests und die Story: Ziel der Drag-Karriere als Text (null = nichts offen) */
export function dragGoal(s: SaveData): string | null {
  if (!dragOpen(s) || dragQueen(s)) return null;
  const r = RIVALS[dragWins(s)];
  return `Drag-Karriere ${dragWins(s) + 1}/${RIVALS.length}: Lip-Sync gegen ${r.name} (One Love Bar)`;
}
export type { DragLook };
export { DRAG_HISTORY };
