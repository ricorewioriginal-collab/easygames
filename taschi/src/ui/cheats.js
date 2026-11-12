// Cheat-Menü: jede Zeile ist ein Schalter (Touch antippen, Klick, Enter oder
// Controller-A). Gleiche Fokus-Navigation wie alle anderen Menüs.
import { h, FocusNav } from './ui.js';
import { panel } from './menus.js';
import * as Cheats from '../logic/cheats.js';

export function openCheats(game) {
  const s = game.save;
  Cheats.ensure(s);
  const screen = { el: null };
  const flip = (id) => {
    const r = Cheats.toggle(s, id, game.rng);
    if (!r.changed) return;
    const c = Cheats.CHEAT[id];
    game.audio.sfx(r.on ? 'item' : 'confirm');
    game.ui.toast(c.name + (r.on ? ' an' : ' aus'), c.icon);
    if (c.kind === 'gift') { game.world?.refreshFollower?.(); game.saveNow(); }
    rerender(id);
  };
  const render = () => {
    const groups = [...new Set(Cheats.CHEATS.map(c => c.group))];
    const body = h('div', {},
      h('p.muted', {}, 'Antippen oder bestätigen schaltet einen Cheat an oder aus. Geschenke (Taschis, Entwicklung, Items) nimmt das Ausschalten genau wieder zurück. Im Online-Kampf wirken keine Cheats.'),
      groups.map(g => [h('h3', {}, g), h('div.list.cheatlist', {}, Cheats.CHEATS.filter(c => c.group === g).map(c => {
        const on = Cheats.isOn(s, c.id);
        return h('button.row.focusable' + (on ? '.on' : ''), { dataset: { cheat: c.id }, 'aria-pressed': String(on), onclick: () => flip(c.id) },
          h('span.cic', {}, c.icon), h('div.grow', {}, h('b', {}, c.name), h('div.muted', {}, c.desc)), h('span.pill.cheatsw', {}, on ? 'AN' : 'AUS'));
      }))]),
      h('div.optrow', {}, h('button.btn.focusable', { onclick: () => { if (!Cheats.anyOn(s)) return; Cheats.allOff(s); game.world?.refreshFollower?.(); game.saveNow(); game.ui.toast('Alle Cheats aus', '🎮'); rerender(); } }, '⟲ Alle Cheats aus')));
    return panel(game, '🎮 Cheats', body, { hints: [['confirm', 'An/Aus'], ['back', 'Zurück']] });
  };
  const rerender = (focusId) => {
    const old = screen.el; screen.el = render(); screen.el.classList.add('noanim'); old.replaceWith(screen.el);
    screen.nav = new FocusNav(screen.el);
    const keep = focusId && screen.el.querySelector('[data-cheat="' + focusId + '"]');
    if (keep && screen.nav.focus) screen.nav.focus(keep); else screen.nav.ensure();
  };
  screen.el = render();
  return new Promise(res => { screen.onBack = () => game.ui.pop(screen); screen.onClose = res; game.ui.push(screen); });
}
