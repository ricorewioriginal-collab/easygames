// Zusatz-Bildschirme: Pension & Zucht (später auch Camp, Glücksrad, Kampfturm).
// Alles läuft über das gemeinsame Fokus-Modell (Touch, Tastatur/Maus, Controller).
import { h, FocusNav } from './ui.js';
import { panel, monCard } from './menus.js';
import { SPECIES } from '../data/species.js';
import * as D from '../logic/daycare.js';
import * as Camp from '../logic/camp.js';
import * as Daily from '../logic/daily.js';
import * as Tower from '../logic/tower.js';
import { ITEMS } from '../data/items.js';

const nameOf = (m) => m.nick || SPECIES[m.id].name;
function reusable(game, build, opts = {}) {
  const screen = { el: null };
  const rerender = () => { const old = screen.el; screen.el = build(rerender); screen.el.classList.add('noanim'); old.replaceWith(screen.el); screen.nav = new FocusNav(screen.el); screen.nav.ensure(); };
  screen.el = build(rerender);
  return new Promise(res => { screen.onBack = () => game.ui.pop(screen); screen.onClose = () => { opts.onClose && opts.onClose(); res(); }; game.ui.push(screen); });
}

// ------------------------------------------------------------------ Pension
export function openDaycare(game) {
  const s = game.save, dc = D.ensureDaycare(s);
  const build = (rerender) => {
    const [a, b] = dc.mons;
    const comp = a && b ? D.compatibility(a.m, b.m) : null;
    return panel(game, 'Pension Sonnenblume', h('div', {},
      h('p.muted', {}, 'Bei Wirtin Ilse wohnen bis zu zwei Taschis. Sie sammeln Erfahrung, während du unterwegs bist (1 EP pro Schritt). Taschis mit gemeinsamem Typ legen manchmal ein Ei. Abholen kostet ★' + D.FEE_BASE + ' plus ★' + D.FEE_PER_LEVEL + ' pro gewonnenem Level.'),
      h('h3', {}, 'In der Pension (' + dc.mons.length + '/' + D.DAYCARE_SLOTS + ')'),
      dc.mons.length ? h('div.grid', {}, dc.mons.map((e, i) => monCard(game, e.m, 1, async () => {
        const ok = await game.ui.ask([{ who: 'Wirtin Ilse', text: nameOf(e.m) + ' ist seit ' + e.steps + ' Schritten hier (Lv ' + e.startLv + ' → ' + e.m.lv + '). Abholen kostet ★' + D.fee(e) + '.' }], ['Abholen', 'Hierlassen'], { cancelIndex: 1 });
        if (ok !== 0) return;
        const r = D.withdraw(s, i); game.audio.sfx(r.ok ? 'item' : 'error'); game.ui.toast(r.text, '🏡'); if (r.ok) { game.world.refreshFollower(); game.saveNow(); } rerender();
      }))) : h('p.muted', {}, 'Noch niemand da.'),
      comp !== null ? h('p', {}, h('b', {}, '💞 ' + D.compatText(comp))) : null,
      dc.egg ? h('button.bigbtn.primary.focusable', { 'data-autofocus': '', onclick: () => { const r = D.collectEgg(s, game.rng); game.audio.sfx(r.ok ? 'item' : 'error'); game.ui.toast(r.text, '🥚'); if (r.ok) game.saveNow(); rerender(); } }, '🥚 Ei abholen') : null,
      dc.mons.length < D.DAYCARE_SLOTS ? [h('h3', {}, 'Taschi abgeben'), h('div.grid', {}, s.team.map((m, i) => monCard(game, m, i, () => {
        const r = D.deposit(s, s.team, i); game.audio.sfx(r.ok ? 'confirm' : 'error'); game.ui.toast(r.text, '🏡'); if (r.ok) { game.world.refreshFollower(); game.saveNow(); } rerender();
      })))] : null,
      (s.eggs || []).length ? h('p.muted', {}, 'Du trägst ' + s.eggs.length + ' Ei' + (s.eggs.length > 1 ? 'er' : '') + ' bei dir (Team › Eier).') : null), { small: true });
  };
  return reusable(game, build);
}

// Ei schlüpft unterwegs
export async function hatchScene(game, egg) {
  const ui = game.ui;
  game.audio.sfx('evolve');
  await ui.say([{ text: 'Oh? Das Ei bewegt sich …' }, { text: '… es knackt …' }]);
  const m = D.hatch(game.save, egg, game.rng);
  if (!m) return;
  game.audio.sfx('item');
  await ui.say([{ text: SPECIES[m.id].name + ' ist geschlüpft!' + (m.shiny ? ' Es schillert! ✨' : '') + (game.save.team.includes(m) ? '' : ' (Dein Team ist voll – es wartet im Lager.)') }]);
  const nick = await ui.ask([{ text: 'Möchtest du ' + SPECIES[m.id].name + ' einen Spitznamen geben?' }], ['Ja', 'Nein'], { cancelIndex: 1 });
  if (nick === 0) { const n = await ui.textEntry({ title: 'Spitzname für ' + SPECIES[m.id].name, max: 14 }); if (n) m.nick = n; }
  game.world.refreshFollower();
  game.saveNow(true);
}

// ------------------------------------------------------------------ Camp
export function openCamp(game) {
  const s = game.save;
  let sel = s.team.find(m => m.hp > 0) || s.team[0];
  const view = () => requestAnimationFrame(() => { const v = document.getElementById('campview'); if (v) { game.preview.attach(v); game.preview.showCreature(sel.id, { shiny: !!sel.shiny }); } });
  const build = (rerender) => {
    const left = Camp.campLeft(s, sel), f = sel.friendship ?? 70;
    const el = panel(game, '⛺ Taschi-Camp', h('div.split', {},
      h('div', {}, h('div.viewport3d.camp', { id: 'campview' }), h('p', { style: { textAlign: 'center' } }, h('b', {}, nameOf(sel)), ' · ', Camp.friendshipLabel(f)),
        h('div.bar.friend', {}, h('i', { style: { width: Math.round(f / 255 * 100) + '%' } }))),
      h('div', {},
        h('p.muted', {}, 'Verbring Zeit mit deinem Team. Mehr Freundschaft heißt mehr EP – und beste Freunde (❤❤❤) halten im Kampf manchmal einen K.o.-Treffer aus oder schütteln Statusveränderungen ab.'),
        h('div.optrow', {}, Object.entries(Camp.CAMP_ACTIONS).map(([k, a]) => h('button.chip.focusable', { onclick: () => {
          const r = Camp.campAction(s, sel, k);
          game.audio.sfx(r.ok ? (r.reached ? 'levelup' : 'heal') : 'error');
          if (r.ok) { game.preview.model?.play?.('cry', 0.8); hearts(); }
          game.ui.toast(r.text, a.icon); rerender(); view();
        } }, a.icon + ' ' + a.label + (a.item ? ' (' + (s.bag[a.item] || 0) + ')' : '')))),
        h('p.muted', {}, left ? 'Heute noch ' + left + ' Freundschaftspunkte möglich.' : nameOf(sel) + ' ist für heute rundum glücklich.'),
        h('h3', {}, 'Wer kommt dran?'),
        h('div.grid', {}, s.team.map((m, i) => monCard(game, m, i, () => { sel = m; rerender(); view(); }, m === sel ? { 'data-autofocus': '' } : {}))))), { hints: [['confirm', 'Wählen'], ['back', 'Camp abbauen']] });
    return el;
  };
  const hearts = () => { const v = document.getElementById('campview'); if (!v) return; for (let i = 0; i < 5; i++) { const e = h('span.heart', { style: { left: 30 + Math.random() * 40 + '%', animationDelay: i * 0.12 + 's' } }, '❤'); v.append(e); setTimeout(() => e.remove(), 1600); } };
  view();
  game.audio.play?.('town');
  return reusable(game, build, { onClose: () => { game.preview.detach(); game.updateMusic?.(true); game.saveNow(); } });
}

// ------------------------------------------------------------------ Glücksrad
export function openWheel(game) {
  const s = game.save, n = Daily.WHEEL.length;
  const wheel = h('div.wheel', {}, Daily.WHEEL.map((p, i) => h('span.slice', { style: { transform: 'rotate(' + (i * 360 / n) + 'deg) translateY(-108px) rotate(' + (-i * 360 / n) + 'deg)' } }, p.label)));
  let spun = false;
  const info = h('p', {}, Daily.wheelReady(s) ? 'Einmal am Tag darfst du drehen. Viel Glück!' : 'Heute schon gedreht – morgen gibt es einen neuen Versuch.');
  const btn = h('button.bigbtn.primary.focusable', { 'data-autofocus': '', onclick: () => {
    if (spun) return;
    const r = Daily.spinWheel(s, game.rng);
    if (!r) { game.audio.sfx('error'); return; }
    spun = true; btn.disabled = true; game.audio.sfx('confirm');
    const deg = 360 * 5 + (360 - r.index * 360 / n);
    wheel.style.transform = 'rotate(' + deg + 'deg)';
    setTimeout(() => { game.audio.sfx('item'); info.textContent = 'Gewonnen: ' + r.prize.label + '!'; game.ui.toast('Glücksrad: ' + r.prize.label, '🎡'); game.saveNow(); }, 3200);
  } }, '🎡 Drehen');
  if (!Daily.wheelReady(s)) btn.disabled = true;
  const el = panel(game, '🎡 Glücksrad', h('div.wheelbox', {}, h('div.wheelwrap', {}, h('div.pointer', {}, '▼'), wheel), info, btn), { small: true });
  const screen = { el };
  screen.onBack = () => game.ui.pop(screen);
  game.ui.push(screen);
  return new Promise(res => { screen.onClose = res; });
}

// ------------------------------------------------------------------ Kampfturm
export function openTower(game) {
  const s = game.save, t = Tower.ensureTower(s);
  const picked = [];
  return new Promise(resolve => {
    const build = (rerender) => panel(game, '🗼 Kampfturm', h('div', {},
      h('p', {}, h('span.pill', {}, '🏆 Rekord: ' + t.best + ' Siege'), ' ', h('span.pill', {}, '◆ ' + t.tp + ' TP')),
      h('p.muted', {}, 'Wähle drei Taschis. Im Turm kämpfen alle auf Level ' + Tower.TOWER_LEVEL + ', ohne Gegenstände aus der Tasche. Nach jedem Kampf wird geheilt. Jede Etage hat ' + Tower.FLOOR_SIZE + ' Kämpfe, am Ende wartet ein Etagenboss. Eine Niederlage beendet die Serie.'),
      h('h3', {}, 'Team wählen (' + picked.length + '/' + Tower.TOWER_TEAM + ')'),
      h('div.grid', {}, [...s.team, ...s.box.slice(0, 30)].map((m, i) => monCard(game, m, i === 0 ? 0 : 1, () => { const k = picked.indexOf(m); if (k >= 0) picked.splice(k, 1); else if (picked.length < Tower.TOWER_TEAM) picked.push(m); rerender(); }, picked.includes(m) ? { 'data-learn': 'Gewählt ' + (picked.indexOf(m) + 1) } : {}))),
      h('div.optrow', {},
        h('button.bigbtn.primary.focusable' + (picked.length === Tower.TOWER_TEAM ? '' : '.disabled'), { onclick: () => { if (picked.length !== Tower.TOWER_TEAM) { game.ui.toast('Wähle drei Taschis.'); return; } game.ui.pop(screen); resolve(picked.slice()); } }, '▶ Herausforderung starten'),
        h('button.chip.focusable', { onclick: () => openTowerShop(game).then(rerender) }, '◆ TP-Tausch'))));
    const screen = { el: null };
    const rerender = () => { const old = screen.el; screen.el = build(rerender); screen.el.classList.add('noanim'); old.replaceWith(screen.el); screen.nav = new FocusNav(screen.el); screen.nav.ensure(); };
    screen.el = build(rerender);
    screen.onBack = () => { game.ui.pop(screen); resolve(null); };
    game.ui.push(screen);
  });
}
export function openTowerShop(game) {
  const s = game.save, t = Tower.ensureTower(s);
  const build = (rerender) => panel(game, '◆ TP-Tausch', h('div', {}, h('p', {}, h('span.pill', {}, '◆ ' + t.tp + ' TP')),
    h('div.list', {}, Tower.TOWER_SHOP.map(e => h('button.row.focusable', { onclick: () => { const r = Tower.buy(s, e); game.audio.sfx(r.ok ? 'item' : 'error'); game.ui.toast(r.ok ? ITEMS[e.item].name + ' erhalten!' : r.text, '◆'); rerender(); } },
      h('div.grow', {}, h('b', {}, ITEMS[e.item].name), h('div.muted', {}, ITEMS[e.item].desc)), h('span.right', {}, e.tp + ' TP'))))), { small: true });
  return reusable(game, build);
}
