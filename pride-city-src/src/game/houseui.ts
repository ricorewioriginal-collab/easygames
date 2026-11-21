/* Menüs zum Zuhause-Ausbau (an der Tür „Anbau“ in der Wohnung): Anbau-Räume bauen und betreten, Möbel und Deko kaufen,
   Boden und Licht wählen. Gekauftes erscheint sofort in der Wohnung (HomeScene.applyUpgrades). Regeln in house.ts. */
import type { Game } from './Game';
import type { Item } from '../ui/ui';
import { hints, toast } from '../ui/ui';
import { sfx } from '../engine/Audio';
import { change } from './life';
import { HOME_ITEMS, FLAG_FACTS, FLOORS, LIGHTS, ROOMS, ownsItem, ownsStyle, floorOf, lightOf, roomLevel, buyItem, setStyle, buildRoom, homeValue } from './house';

const panel = (t: string, body: string) => `<div class="col"><div class="panel"><h3>${t}</h3>${body}<div class="slot"></div></div></div>`;

export function houseMenu(g: Game, tab: '' | 'rooms' | 'items' | 'style' = '') {
  const s = g.save.data, close = () => { g.closeMenu(); g.touch.show(true); }, main = () => houseMenu(g);
  const done = (why: string | null, ok: string, again: () => void) => { if (why) { sfx('miss'); toast(why); return; } sfx('win'); toast(ok); g.save.write(); g.city.refreshHud(); g.home?.applyUpgrades(); again(); };
  g.touch.show(false);
  if (!tab) {
    const built = ROOMS.filter((r) => roomLevel(s, r.id) > 0);
    g.openMenu(panel('🔨 Zuhause ausbauen', `<p>Mach die Wohnung zu deinem Palast: Möbel und Deko, die man sieht, und ganz neue Räume hinter dieser Tür.<br>🏠 Wert deines Ausbaus: <b>${homeValue(s)} €</b> · 💰 ${s.money} €</p>`), [
      ...built.map((r) => ({ icon: r.icon, label: `${r.name} betreten`, sub: `Stufe ${roomLevel(s, r.id)} von 3 · ${r.lv.slice(0, roomLevel(s, r.id)).join(', ')}`, fn: () => { g.closeMenu(); g.enterAnnex(r.id); } })),
      { icon: '🏗️', label: 'Anbau: Räume bauen und erweitern', sub: `${built.length} von ${ROOMS.length} Räumen gebaut`, fn: () => houseMenu(g, 'rooms') },
      { icon: '🛋️', label: 'Möbel und Deko', sub: `${HOME_ITEMS.filter((i) => ownsItem(s, i.id)).length} von ${HOME_ITEMS.length} in der Wohnung`, fn: () => houseMenu(g, 'items') },
      { icon: '🎨', label: 'Boden und Licht', sub: `${floorOf(s).name} · Licht ${lightOf(s).name}`, fn: () => houseMenu(g, 'style') },
      { icon: '←', label: 'Zurück', fn: close }], close, '');
  } else if (tab === 'rooms') {
    g.openMenu(panel('🏗️ Anbau', '<p>Jeder Raum hat drei Ausbaustufen. Neue Stufe = neue Möbel und neue Dinge zum Tun.</p>'), [
      ...ROOMS.map((r) => { const l = roomLevel(s, r.id); return { icon: r.icon, label: l >= 3 ? `${r.name} ✓` : l ? `${r.name}: Stufe ${l + 1} bauen` : `${r.name} bauen`, sub: l >= 3 ? 'voll ausgebaut' : `${r.costs[l]} € · ${r.lv[l]}${l ? '' : ' · ' + r.text}`, disabled: l >= 3,
        fn: () => done(buildRoom(s, r.id), `${r.icon} ${r.name}: Stufe ${l + 1} fertig! Hinter der Tür „Anbau“.`, () => houseMenu(g, 'rooms')) }; }),
      { icon: '←', label: 'Zurück', fn: main }], main, '');
  } else if (tab === 'items') {
    g.openMenu(panel('🛋️ Möbel und Deko', '<p>Alles erscheint sofort in der Wohnung. Vieles kannst du benutzen.</p>'), [
      ...HOME_ITEMS.map((i) => ({ icon: i.icon, label: ownsItem(s, i.id) ? `${i.name} ✓` : `${i.name} kaufen`, sub: ownsItem(s, i.id) ? i.text : `${i.cost} € · ${i.text}`, disabled: ownsItem(s, i.id),
        fn: () => done(buyItem(s, i.id), `${i.icon} ${i.name} steht in deiner Wohnung!`, () => houseMenu(g, 'items')) })),
      { icon: '←', label: 'Zurück', fn: main }], main, '');
  } else {
    const opt = (kind: 'floor' | 'light') => (kind === 'floor' ? FLOORS : LIGHTS).map((o) => { const own = ownsStyle(s, kind, o.id), cur = (kind === 'floor' ? floorOf(s) : lightOf(s)).id === o.id; return {
      icon: kind === 'floor' ? '🪵' : '💡', label: `${kind === 'floor' ? 'Boden' : 'Licht'}: ${o.name}${cur ? ' ✓' : ''}`, sub: cur ? 'ist gerade dran' : own ? 'gekauft · wählen' : `${o.cost} €`, disabled: cur,
      fn: () => done(setStyle(s, kind, o.id), `${o.name}: sieht toll aus!`, () => houseMenu(g, 'style')) } as Item; });
    g.openMenu(panel('🎨 Boden und Licht', '<p>Einmal gekauft, jederzeit wechselbar.</p>'), [...opt('floor'), ...opt('light'), { icon: '←', label: 'Zurück', fn: main }], main, '');
  }
  hints([['dpad', 'Wählen'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
}

/** Gekauftes Möbelstück benutzen */
export function useHomeItem(g: Game, id: string) {
  const s = g.save.data, it = HOME_ITEMS.find((x) => x.id === id); if (!it?.use) return;
  if (id === 'flaggen') { g.dialog.say(FLAG_FACTS.map((text) => ({ who: '🏳️‍🌈 Flaggenwand', color: '#ff6ad5', text }))); change(s, it.use.d); return; }
  sfx('ok');
  g.fade(() => { g.pass(it.use!.min); change(s, it.use!.d); toast(it.use!.msg); g.save.write(); g.city.refreshHud(); });
}
