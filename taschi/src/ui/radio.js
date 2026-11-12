// Abenteurer-Radio: Senderwahl (Menü) und die Live-Titelzeile oben im Bild.
// Gleiche Fokus-Navigation wie alle Menüs: Touch, Maus, Tastatur, Controller.
import { h, FocusNav } from './ui.js';
import { panel } from './menus.js';
import { STATIONS } from '../core/radio.js';

const LINKS = [['laut.fm', 'https://laut.fm'], ['anmacha.de', 'https://www.anmacha.de'], ['ricorewi-radio.de', 'https://www.ricorewi-radio.de']];
const pct = (v) => Math.round(v * 100) + ' %';

// Live-Titel oben in der Mitte (nur in Welt und Kampf)
export function radioTicker(game) {
  const name = h('b'), song = h('span.rt-song'), el = h('div#radioTicker', { 'aria-live': 'polite' }, h('span.rt-eq', {}, h('i'), h('i'), h('i')), h('div.rt-text', {}, name, song));
  game.ui.root.append(el);
  let shown = null;
  const paint = (r) => {
    const st = r.station;
    el.classList.toggle('live', !!st && r.live);
    if (!st) return;
    name.textContent = '📻 ' + st.title;
    song.textContent = r.status || r.song || st.name + ' · live';
  };
  game.radio.onChange(paint); paint(game.radio);
  return {
    update(visible) {
      const v = visible && game.radio.on;
      if (v !== shown) { shown = v; el.classList.toggle('show', v); }
    }
  };
}

export function openRadio(game) {
  const radio = game.radio, st = game.settings;
  const screen = { el: null };
  const render = () => {
    const cur = radio.station;
    const vol = st.get('radioVolume') ?? 0.4;
    const setVol = (d) => { st.set('radioVolume', Math.max(0, Math.min(1, +(vol + d).toFixed(2)))); rerender('vol' + (d > 0 ? '+' : '-')); };
    const body = h('div.radiopanel', {},
      h('div.radiohero' + (cur ? '.on' : ''), {},
        h('div.rh-icon', {}, '📻'),
        h('div.rh-main', {},
          h('div.rh-kicker', {}, cur ? (radio.live ? '● LIVE' : 'Verbinde …') : '13 Sender · live'),
          h('div.rh-title', {}, cur ? cur.title : 'Abenteurer-Radio'),
          h('div.rh-sub', {}, cur ? (radio.status || radio.song || cur.name + ' · laut.fm') : 'Echte Radiosender statt Spielmusik – such dir einen aus.')),
        cur ? h('button.btn.focusable.rh-off', { dataset: { radio: 'off' }, onclick: () => { radio.stop(); game.audio.sfx('confirm'); rerender(); } }, '⏹ Aus') : null),
      h('div.optrow.radiovol', {}, h('span.lbl', {}, 'Lautstärke'),
        h('button.chip.focusable', { dataset: { radio: 'vol-' }, onclick: () => setVol(-0.1) }, '−'),
        h('div.bar.rv-bar', {}, h('i', { style: { width: vol * 100 + '%' } })), h('b.rv-val', {}, pct(vol)),
        h('button.chip.focusable', { dataset: { radio: 'vol+' }, onclick: () => setVol(0.1) }, '+'),
        h('button.chip.focusable' + (st.get('radioDuck') !== false ? '.sel' : ''), { dataset: { radio: 'duck' }, onclick: () => { st.set('radioDuck', st.get('radioDuck') === false); rerender('duck'); } }, '💬 Bei Dialogen leiser')),
      h('div.radiogrid', {}, STATIONS.map((s, i) => h('button.rstation.focusable' + (cur === s ? '.active' : ''), { dataset: { radio: s.slug }, 'aria-pressed': String(cur === s), onclick: () => { if (cur === s) radio.stop(); else radio.play(s.slug); game.audio.sfx('confirm'); rerender(s.slug); } },
        h('span.rs-no', {}, String(i + 1).padStart(2, '0')),
        h('span.rs-words', {}, h('b', {}, s.title), h('small', {}, s.name)),
        cur === s ? h('span.rt-eq', {}, h('i'), h('i'), h('i')) : null))),
      h('div.radiofoot', {}, h('span', {}, 'Quelle:'), LINKS.map(([t, u]) => h('a.rlink.focusable', { href: u, target: '_blank', rel: 'noopener' }, t))));
    return panel(game, '📻 Abenteurer-Radio', body, { hints: [['confirm', 'Sender wählen'], ['back', 'Zurück']] });
  };
  const rerender = (focusKey) => {
    const old = screen.el; screen.el = render(); screen.el.classList.add('noanim'); old.replaceWith(screen.el);
    screen.nav = new FocusNav(screen.el);
    const keep = focusKey && screen.el.querySelector('[data-radio="' + focusKey + '"]');
    if (keep) screen.nav.focus(keep); else screen.nav.ensure();
  };
  const off = radio.onChange(() => { const t = screen.el?.querySelector('.rh-sub'), k = screen.el?.querySelector('.rh-kicker'); const c = radio.station; if (t && c) t.textContent = radio.status || radio.song || c.name + ' · laut.fm'; if (k && c) k.textContent = radio.live ? '● LIVE' : 'Verbinde …'; });
  screen.el = render();
  return new Promise(res => { screen.onBack = () => game.ui.pop(screen); screen.onClose = () => { off(); res(); }; game.ui.push(screen); });
}
