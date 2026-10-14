/* Rucksack (Gegenstände mit „Was ist das?“/„Wofür?“), Ausrüstung, Läden und Geschenke. */
import type { Game } from '../game.ts';
import { ABILITIES, ITEMS, type ItemCat, SWORDS } from '../data/items.ts';
import { btn, clear, h, modal } from './dom.ts';

const CATS: { id: ItemCat | 'alle'; label: string }[] = [
  { id: 'alle', label: '🎒 Alles' }, { id: 'essen', label: '🍎 Essen' }, { id: 'werkzeug', label: '🧰 Werkzeug' }, { id: 'quest', label: '📜 Aufgaben' }, { id: 'sammeln', label: '💎 Schätze' }, { id: 'geschenk', label: '🎁 Geschenke' }, { id: 'material', label: '🧱 Material' }
];

export function openInventory(g: Game, onUse: (id: string) => boolean): void {
  const m = modal({ title: 'Rucksack', icon: '🎒', wide: true, tabs: [...CATS.map(c => ({ id: c.id, label: c.label })), { id: 'ausr', label: '⚔️ Ausrüstung' }], onTab: id => draw(id) });
  let sel: string | null = null;
  const draw = (cat: string) => {
    clear(m.body);
    const s = g.save;
    if (cat === 'ausr') {
      const sw = SWORDS.find(x => x.id === s.equip.sword) ?? SWORDS[0];
      m.body.append(h('div', { class: 'card' }, h('b', null, sw.icon + ' ' + sw.name), h('p', { class: 'muted' }, 'Wirkt nur im Verbotenen Wald (Kraft ×' + sw.dmg + '). Bessere Schwerter schmiedet Brokk auf der Rätsel-Insel.')),
        h('h3', { style: 'margin-top:12px' }, '✨ Fähigkeiten'), h('div', { class: 'grid' }, Object.values(ABILITIES).map(a => h('div', { class: 'card' + (s.abilities.includes(a.id) ? ' on' : ' locked') }, h('b', null, (s.abilities.includes(a.id) ? a.icon : '🔒') + ' ' + a.name), h('div', { class: 'muted', style: 'font-size:.85rem' }, s.abilities.includes(a.id) ? a.desc : 'Noch nicht gelernt.')))));
      return;
    }
    const items = Object.entries(s.inventory).filter(([id, n]) => n > 0 && ITEMS[id] && (cat === 'alle' || ITEMS[id].cat === cat));
    if (!items.length) { m.body.append(h('p', null, 'Hier ist noch nichts. Bewohner, Läden, Truhen und Abenteuer füllen deinen Rucksack!')); return; }
    const grid = h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(100px,1fr))' });
    const detail = h('div', { class: 'detail' });
    for (const [id, n] of items) {
      const d = ITEMS[id];
      grid.append(h('button', { type: 'button', class: 'item' + (sel === id ? ' on' : ''), onclick: () => { sel = id; draw(cat); } }, h('span', { class: 'n' }, '×' + n), h('span', { class: 'ic' }, d.icon), h('span', { class: 'nm' }, d.name)));
    }
    if (sel && ITEMS[sel] && s.inventory[sel]) {
      const d = ITEMS[sel];
      detail.append(h('div', { class: 'card' }, h('h3', null, d.icon + ' ' + d.name), h('p', null, h('b', null, 'Was ist das? '), d.what), h('p', null, h('b', null, 'Wofür? '), d.use),
        h('div', { class: 'row' }, d.heal ? btn('😋 Essen', () => { if (onUse(d.id)) draw(cat); }, 'green small') : null, d.cat === 'werkzeug' ? btn('🧰 Benutzen', () => { m.close(); onUse(d.id); }, 'blue small') : null)));
    }
    m.body.append(grid, detail);
  };
}

/* ---------- Läden ---------- */
export interface ShopItem { item?: string; cosmetic?: string; name?: string; icon?: string; price: number; desc?: string }
export const SHOPS: Record<string, { name: string; icon: string; items: ShopItem[] }> = {
  spielzeug: { name: 'Spielzeugladen von Frau Bunt', icon: '🧸', items: [
    { item: 'angel', price: 15 }, { item: 'kescher', price: 12 }, { item: 'schaufel', price: 12 },
    { cosmetic: 'hat:cowboy', name: 'Cowboyhut', icon: '🤠', price: 20 }, { cosmetic: 'hat:hasenohren', name: 'Hasenohren', icon: '🐰', price: 15 }, { cosmetic: 'hat:katzenohren', name: 'Katzenohren', icon: '🐱', price: 15 },
    { cosmetic: 'acc:umhang', name: 'Heldenumhang', icon: '🦸', price: 25 }, { cosmetic: 'glasses:herz', name: 'Herzbrille', icon: '😍', price: 18 }] },
  eisdiele: { name: 'Eisdiele', icon: '🍦', items: [{ item: 'eis', price: 4 }, { item: 'kuchen', price: 8 }] },
  baeckerei: { name: 'Bäckerei', icon: '🥐', items: [{ item: 'kuchen', price: 8 }, { item: 'apfel', price: 2 }, { item: 'honig', price: 5 }] },
  apotheke: { name: 'Apotheke', icon: '💊', items: [{ item: 'heiltrank', price: 12 }] },
  blumen: { name: 'Blumenladen', icon: '💐', items: [{ item: 'blume', price: 6 }, { item: 'gieskanne', price: 8 }] },
  hof: { name: 'Hofladen', icon: '🧺', items: [{ item: 'apfel', price: 2 }, { item: 'karotte', price: 2 }, { item: 'honig', price: 5 }] },
  krabbe: { name: 'Knusper-Krabbe', icon: '🦀', items: [{ item: 'burger', price: 10 }] },
  fangladen: { name: 'Fangladen', icon: '🔴', items: [{ item: 'taschileckerli', price: 3 }, { item: 'taschiball', price: 5 }] },
  datenshop: { name: 'Daten-Kiosk', icon: '💠', items: [{ item: 'datenkeks', price: 3 }] },
  wanderhand: { name: 'Markt Wanderhand', icon: '🦊', items: [{ item: 'heiltrank', price: 10 }, { cosmetic: 'acc:schal', name: 'Wanderschal', icon: '🧣', price: 15 }, { cosmetic: 'hat:muetze', name: 'Bommelmütze', icon: '🧶', price: 12 }] },
  baumarkt: { name: 'Bauland-Lager', icon: '🧱', items: [{ item: 'block', price: 1 }, { item: 'knallbeere', price: 6 }] },
  kleider: { name: 'Kleiderladen', icon: '👗', items: [{ cosmetic: 'hat:blume', name: 'Blumenkranz', icon: '🌼', price: 12 }, { cosmetic: 'hat:helm', name: 'Fahrradhelm', icon: '⛑️', price: 10 }, { cosmetic: 'glasses:sonne', name: 'Sonnenbrille', icon: '🕶️', price: 12 }, { cosmetic: 'acc:rucksack', name: 'Rucksack', icon: '🎒', price: 10 }] },
  piraten: { name: 'Piratenkiste', icon: '🏴‍☠️', items: [{ cosmetic: 'hat:piratenhut', name: 'Piratenhut', icon: '🏴‍☠️', price: 20 }] }
};

export function openShop(g: Game, id: string): void {
  const sh = SHOPS[id];
  if (!sh) { g.toast('Dieser Laden ist geschlossen.', '🚪'); return; }
  const m = modal({ title: sh.name, icon: sh.icon, wide: true });
  const draw = () => {
    clear(m.body);
    m.body.append(h('p', { class: 'muted' }, 'Du hast ⭐ ' + g.save.stars + '. Tippe auf etwas zum Kaufen.'));
    m.body.append(h('div', { class: 'grid' }, sh.items.map(it => {
      const d = it.item ? ITEMS[it.item] : null;
      const owned = it.cosmetic ? g.save.cosmetics.includes(it.cosmetic) : false;
      const name = it.name ?? d?.name ?? '?', icon = it.icon ?? d?.icon ?? '❔';
      return h('div', { class: 'card' }, h('div', { style: 'font-size:2rem' }, icon), h('b', null, name), h('div', { class: 'muted', style: 'font-size:.82rem;min-height:2.4em' }, it.desc ?? d?.use ?? 'Zum Anziehen im Kleiderschrank.'),
        owned ? h('span', { class: 'chip' }, '✅ Gehört dir') : btn('⭐ ' + it.price, () => {
          if (!g.spendStars(it.price)) return;
          if (it.item) g.give(it.item, 1);
          if (it.cosmetic) { g.unlockCosmetic(it.cosmetic); }
          g.events.emit('collect', { kind: 'kauf', id: it.item ?? it.cosmetic ?? '' });
          draw();
        }, 'green small'));
    })));
  };
  draw();
}

/** Geschenk an eine Figur auswählen. */
export function openGift(g: Game, npcName: string, likes: string[], give: (item: string) => void): void {
  const m = modal({ title: 'Geschenk für ' + npcName, icon: '🎁' });
  const items = Object.entries(g.save.inventory).filter(([id, n]) => n > 0 && ITEMS[id]?.gift);
  if (!items.length) { m.body.append(h('p', null, 'Du hast gerade nichts zum Verschenken. Blumen gibt es im Blumenladen, Kuchen in der Bäckerei!')); return; }
  m.body.append(h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(100px,1fr))' }, items.map(([id, n]) => h('button', { type: 'button', class: 'item', onclick: () => { m.close(); give(id); } }, h('span', { class: 'n' }, '×' + n), h('span', { class: 'ic' }, ITEMS[id].icon), h('span', { class: 'nm' }, ITEMS[id].name)))));
  if (likes.length && (g.save.npcs[''] ?? true)) m.body.append(h('p', { class: 'muted', style: 'margin-top:10px' }, 'Tipp: Jede Figur hat Lieblingsgeschenke – probier es aus!'));
}
