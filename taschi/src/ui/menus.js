// Pause menu with tabs (Team, Taschidex, Tasche, Quests, Karte, Trainer,
// Optionen, System) plus shop, storage, travel and status pages.
import { h, typeBadge, hpBar, FocusNav } from './ui.js';
import { SPECIES, SPECIES_IDS, learnset } from '../data/species.js';
import { MOVES, STATUS } from '../data/moves.js';
import { TYPES } from '../data/types.js';
import { ITEMS, ITEM_ORDER, CATEGORY_NAMES, sellPrice, shopStock } from '../data/items.js';
import { REGIONS } from '../data/regions.js';
import { CHAPTERS } from '../data/story.js';
import { maxHp, statOf, xpToNext, evolutionChain, describeEvolution } from '../logic/monster.js';
import * as Items from '../logic/items.js';
import * as P from '../logic/progress.js';
import { habitatsOf } from '../logic/encounters.js';
import { PROFILES } from '../engine/renderer.js';
import { ACTIONS, ACTION_LABELS, glyph } from '../core/input.js';

const TABS = [['team', 'Team'], ['dex', 'Taschidex'], ['bag', 'Tasche'], ['quests', 'Quests'], ['map', 'Karte'], ['card', 'Trainer'], ['options', 'Optionen'], ['system', 'System']];
export const fmtTime = (s) => Math.floor(s / 3600) + ' h ' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ' min';
const nameOf = (m) => m.nick || SPECIES[m.id].name;

function panel(game, title, body, { tabs = null, active = null, onTab = null, hints = [['confirm', 'Wählen'], ['back', 'Zurück']], small = false } = {}) {
  const el = h('div.screen', {}, h('div.panel' + (small ? '.small' : ''), {},
    h('div.panel-head', {}, h('h2', {}, title), h('button.closebtn.focusable', { 'aria-label': 'Schließen', onclick: () => game.ui.pop() }, '✕')),
    tabs ? h('div.tabs', {}, tabs.map(([id, label]) => h('button.tab' + (id === active ? '.active' : ''), { onclick: () => onTab(id) }, label))) : null,
    h('div.panel-body', {}, body),
    game.ui.hintsBar(hints)));
  return el;
}
function portrait(game, id) { return h('div.portrait', {}, h('img', { src: game.preview.thumbnail(id), alt: '' })); }
function monCard(game, m, i, onclick, extra = {}) {
  const sp = SPECIES[m.id], max = maxHp(m);
  return h('button.card.focusable' + (i === 0 ? '.lead' : '') + (m.hp <= 0 ? '.fainted' : ''), { onclick, ...extra },
    portrait(game, m.id),
    h('div.meta', {}, h('div.name', {}, nameOf(m) + '  ', h('span.muted', {}, 'Lv ' + m.lv)), h('div', {}, typeBadge(sp.type), sp.type2 ? typeBadge(sp.type2) : null, m.status ? h('span.status', { style: { background: STATUS[m.status].color } }, STATUS[m.status].short) : null),
      hpBar(m.hp, max), h('div.sub', {}, m.hp + ' / ' + max + ' KP')));
}

export function openPauseMenu(game, tab = 'team') {
  const ui = game.ui;
  let cur = tab;
  const screen = { el: null };
  const render = () => {
    const body = TAB_RENDER[cur](game, rerender);
    const el = panel(game, 'Menü', body, { tabs: TABS, active: cur, onTab: (id) => { cur = id; rerender(); }, hints: [['tabPrev', 'Reiter'], ['tabNext', ''], ['confirm', 'Wählen'], ['back', 'Schließen']] });
    return el;
  };
  const post = () => requestAnimationFrame(() => {
    const v = screen.el.querySelector('#cardview');
    if (v) { game.preview.attach(v); game.preview.showCharacter(game.save.player.look).hold('wave'); } else game.preview.detach();
  });
  const rerender = () => { const old = screen.el; screen.el = render(); old.replaceWith(screen.el); screen.nav = new FocusNav(screen.el); screen.nav.ensure(); post(); };
  screen.el = render();
  post();
  screen.onBack = () => ui.pop(screen);
  screen.onMenu = () => ui.pop(screen);
  screen.onTab = (d) => { const i = TABS.findIndex(t => t[0] === cur); cur = TABS[(i + d + TABS.length) % TABS.length][0]; rerender(); };
  screen.onClose = () => game.preview.detach();
  ui.push(screen);
  return screen;
}

const TAB_RENDER = {
  team(game, rerender) {
    const s = game.save;
    return h('div', {}, h('p.muted', {}, 'Wähle ein Taschi für Details. Das erste Taschi kämpft zuerst und begleitet dich.'),
      h('div.grid', {}, s.team.map((m, i) => monCard(game, m, i, () => openStatus(game, m, rerender)))),
      h('p.muted', {}, 'Im Lager: ' + s.box.length + ' Taschis · Lager im Heilzentrum verwalten.'));
  },
  dex(game) {
    const s = game.save;
    const caught = P.caughtCount(s), seen = P.seenCount(s);
    return h('div', {}, h('p', {}, h('span.pill', {}, '◉ Gefangen ' + caught), ' ', h('span.pill', {}, '👁 Gesehen ' + seen), ' ', h('span.pill', {}, 'Arten ' + SPECIES_IDS.length)),
      h('div.grid', { style: { gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 170px), 1fr))' } }, SPECIES_IDS.map(id => {
        const st = s.dex[id], sp = SPECIES[id];
        return h('button.card.focusable', { onclick: () => st && openDexEntry(game, id) },
          st ? portrait(game, id) : h('div.portrait', {}, '?'),
          h('div.meta', {}, h('div.sub', {}, '#' + String(sp.dexNo).padStart(3, '0')), h('div.name', {}, st ? sp.name : '???'), st ? h('div.sub', {}, st === 2 ? '◉ gefangen' : 'gesehen') : null));
      })));
  },
  bag(game, rerender) {
    const s = game.save;
    const cats = {};
    for (const id of ITEM_ORDER) if (s.bag[id] > 0) (cats[ITEMS[id].category] ||= []).push(id);
    const blocks = Object.entries(cats).map(([cat, ids]) => h('div', {}, h('h3', {}, CATEGORY_NAMES[cat]), h('div.list', {}, ids.map(id => h('button.row.focusable', { onclick: () => Items.usableOutside(id) ? useItemFlow(game, id, rerender) : game.ui.say([{ text: ITEMS[id].name + ': ' + ITEMS[id].desc }]) },
      h('div.grow', {}, h('b', {}, ITEMS[id].name), h('div.muted', {}, ITEMS[id].desc)), h('span.right', {}, '×' + s.bag[id]))))));
    return h('div', {}, h('p', {}, h('span.pill', {}, '★ ' + s.coins + ' Sternmünzen')), blocks.length ? blocks : h('p', {}, 'Deine Tasche ist leer.'));
  },
  quests(game) {
    const s = game.save, obj = P.mainObjective(s), ch = CHAPTERS[P.chapterOf(s)];
    const active = P.activeQuests(s);
    const done = P.ALL_QUESTS.filter(q => s.quests[q.id]?.done);
    return h('div', {},
      h('div.row', {}, h('div.grow', {}, h('b', {}, 'Kapitel ' + (P.chapterOf(s) + 1) + ': ' + ch.title), h('div.muted', {}, ch.text))),
      h('h3', {}, 'Hauptauftrag'), h('div.row.focusable', {}, h('div.grow', {}, '➜ ' + obj.text)),
      h('h3', {}, 'Aktive Aufgaben (' + active.length + ')'),
      h('div.list', {}, active.length ? active.map(({ q, st }) => h('div.row.focusable', {}, h('div.grow', {}, h('b', {}, q.title + ' · ' + REGIONS[q.region].name), h('div.muted', {}, (st.status === 'ready' ? '✓ Bereit zur Abgabe – ' : '') + (q.steps[st.step]?.text || q.desc) + ' ' + (q.steps[st.step] ? P.stepProgress(s, q.steps[st.step]) : '')), h('div.muted', {}, 'Auftraggeber: ' + q.giver)))) : h('p.muted', {}, 'Sprich mit Bewohnern, um Aufgaben zu erhalten.')),
      h('h3', {}, 'Erledigt (' + done.length + ')'), h('div.list', {}, done.slice(-12).map(q => h('div.row', {}, '✓ ' + q.title))));
  },
  map(game) {
    const s = game.save, here = game.world.current?.region;
    // 16 regions laid out as a winding path, summit at the top
    const pos = REGIONS.map((r, i) => { const row = Math.floor(i / 4), col = row % 2 ? 3 - i % 4 : i % 4; return [12 + col * 25, 86 - row * 20]; });
    pos.push([50, 8]);
    const svg = `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${pos.map(p => p.join(',')).join(' ')}" fill="none" stroke="#fff8" stroke-width="1.6" stroke-dasharray="2 1.5"/></svg>`;
    const nodes = pos.map(([x, y], i) => {
      const r = REGIONS[i];
      const unlocked = i < 16 ? P.regionUnlocked(s, i) : P.summitOpen(s);
      const col = i < 16 ? TYPES[r.types[0]].color : '#3c5fa8';
      return h('button.node.focusable' + (unlocked ? '' : '.locked') + (here === i ? '.here' : ''), { style: { left: x + '%', top: y + '%', background: col }, title: i < 16 ? r.name : 'Sternengipfel', onclick: () => game.ui.say([{ text: i < 16 ? r.name + ' (' + r.town + ') · ' + r.types.map(t => TYPES[t].name).join('/') + ' · ' + (s.badges > i ? 'Siegel ✓' : 'Siegel offen') + ' · Champion ' + (s.champions[i] ? '✓' : 'offen') + (unlocked ? '' : ' · noch nicht erreichbar') : 'Sternengipfel – Halle der Sternenliga' + (unlocked ? '' : ' · erst mit allen Siegeln und Brix’ Zugangskarte') }]) }, i < 16 ? String(i + 1) : '★');
    });
    return h('div', {}, h('div.mapview', { html: svg }, nodes),
      h('h3', {}, 'Championübersicht'),
      h('div.list', {}, REGIONS.map(r => h('div.row', {}, h('div.grow', {}, h('b', {}, (r.id + 1) + '. ' + r.name), ' ', h('span.muted', {}, 'Arena: ' + r.gym.leader + ' · Champion: ' + r.champion.name)), h('span.right', {}, (s.badges > r.id ? '✦' : '◌') + ' ' + (s.champions[r.id] ? '♛' : '◌'))))));
  },
  card(game) {
    const s = game.save;
    const badges = REGIONS.map((r, i) => h('div.badge' + (s.badges > i ? '.won' : ''), { style: s.badges > i ? { background: TYPES[r.types[0]].color } : {}, title: r.name }, TYPES[r.types[0]].icon));
    return h('div.split', {},
      h('div', {}, h('div.viewport3d', { id: 'cardview' }), h('p', { style: { textAlign: 'center' } }, h('b', {}, s.player.name))),
      h('div', {}, h('div.statgrid', {},
        'Spielzeit', h('span'), h('b', {}, fmtTime(s.playTime)),
        'Taschidex', h('span'), h('b', {}, P.caughtCount(s) + ' / ' + SPECIES_IDS.length),
        'Siegel', h('span'), h('b', {}, s.badges + ' / 16'),
        'Champions', h('span'), h('b', {}, Object.keys(s.champions).length + ' / 16'),
        'Sternenliga', h('span'), h('b', {}, s.league + ' / 5'),
        'Siege', h('span'), h('b', {}, s.stats.wins || 0),
        'Sternmünzen', h('span'), h('b', {}, '★ ' + s.coins)),
        h('h3', {}, 'Licht-Siegel'), h('div.badgecase', {}, badges)));
  },
  options(game, rerender) {
    const st = game.settings, ui = game.ui;
    const cycle = (k, list, labels) => h('button.chip.focusable', { onclick: () => { const i = list.indexOf(st.get(k)); st.set(k, list[(i + 1) % list.length]); rerender(); } }, labels[list.indexOf(st.get(k))] ?? String(st.get(k)));
    const slider = (k, min, max, step, fmt = (v) => v) => h('span', { style: { display: 'inline-flex', gap: '6px', alignItems: 'center' } },
      h('button.chip.focusable', { onclick: () => { st.set(k, Math.max(min, +(st.get(k) - step).toFixed(2))); rerender(); } }, '−'),
      h('b', { style: { minWidth: '56px', textAlign: 'center' } }, fmt(st.get(k))),
      h('button.chip.focusable', { onclick: () => { st.set(k, Math.min(max, +(st.get(k) + step).toFixed(2))); rerender(); } }, '+'));
    const row = (label, ctrl) => h('div.optrow', {}, h('span.lbl', {}, label), ctrl);
    const pct = (v) => Math.round(v * 100) + '%';
    const pad = game.input.pad;
    return h('div', {},
      h('h3', {}, 'Grafik & Leistung'),
      row('Profil', cycle('graphics', ['low', 'medium', 'high'], ['Leistung', 'Ausgewogen', 'Qualität'])),
      row('Auflösung', cycle('adaptive', [true, false], ['Automatisch anpassen', 'Fest'])),
      row('Tageszeit', cycle('dayCycle', ['cycle', 'day', 'realtime'], ['Tageszyklus', 'Immer Tag', 'Echtzeit'])),
      row('Leistungsanzeige', cycle('showStats', [false, true], ['Aus', 'An'])),
      h('h3', {}, 'Audio'),
      row('Musik', slider('musicVolume', 0, 1, 0.1, pct)), row('Effekte', slider('sfxVolume', 0, 1, 0.1, pct)), row('Umgebung', slider('ambienceVolume', 0, 1, 0.1, pct)),
      row('Ton', cycle('muted', [false, true], ['An', 'Stumm'])),
      h('h3', {}, 'Steuerung'),
      row('Textgeschw.', cycle('textSpeed', [1, 2, 3], ['Langsam', 'Normal', 'Schnell'])),
      row('Kamera', slider('camSensitivity', 0.4, 2, 0.2, (v) => v.toFixed(1) + '×')),
      row('Kamera-Abst.', slider('camDistance', 0.7, 1.6, 0.1, (v) => v.toFixed(1) + '×')),
      row('Y-Achse', cycle('invertY', [false, true], ['Normal', 'Invertiert'])),
      row('Auto-Kamera', cycle('camAuto', [true, false], ['An', 'Aus'])),
      row('Laufen', cycle('autoRun', [false, true], ['Gehen (Sprint halten)', 'Rennen (Gehen halten)'])),
      row('Tempo', slider('walkSpeed', 0.7, 1.5, 0.1, (v) => v.toFixed(1) + '×')),
      h('h3', {}, 'Touch'),
      row('Hand', cycle('hand', ['left', 'right'], ['Joystick links', 'Joystick rechts'])),
      row('Joystick', cycle('joyMode', ['floating', 'fixed'], ['Frei positionierbar', 'Fest'])),
      row('Größe', slider('joySize', 90, 200, 10, (v) => v + ' px')),
      row('Deckkraft', slider('joyOpacity', 30, 100, 10, (v) => v + '%')),
      row('Totzone', slider('deadzone', 0.04, 0.4, 0.02, pct)),
      h('h3', {}, 'Tastatur (frei belegbar)'),
      h('div.list', {}, ACTIONS.map(a => h('button.row.focusable', { onclick: () => { ui.toast('Drücke eine Taste für „' + ACTION_LABELS[a] + '“ (Esc bricht ab)'); game.input.startRemapKey(a, (ok) => { if (ok) ui.toast('Belegt!'); rerender(); }); } }, h('div.grow', {}, ACTION_LABELS[a]), h('span.right', {}, game.input.keyLabel(a))))),
      h('h3', {}, 'Controller'),
      h('p.muted', {}, pad ? '🎮 Verbunden: ' + pad.id.slice(0, 60) + ' (' + game.input.padType + ')' : 'Kein Controller erkannt. Verbinde einen Controller per Bluetooth/USB und drücke eine Taste.'),
      h('div.list', {}, ACTIONS.map(a => h('button.row.focusable', { onclick: () => { if (!game.input.pad) { ui.toast('Kein Controller verbunden.'); return; } ui.toast('Drücke eine Controller-Taste für „' + ACTION_LABELS[a] + '“'); game.input.startRemapPad(a, () => { ui.toast('Belegt!'); rerender(); }); } }, h('div.grow', {}, ACTION_LABELS[a]), h('span.right', {}, glyph(game.input.padType, st.get('pad')[a]) ?? '–')))),
      h('div.optrow', {}, h('button.chip.focusable', { onclick: () => { st.reset(['keys', 'pad']); rerender(); ui.toast('Standardbelegung wiederhergestellt'); } }, 'Standardbelegung'),
        h('button.chip.focusable', { onclick: () => game.toggleFullscreen() }, 'Vollbild an/aus')));
  },
  system(game) {
    const s = game.save;
    return h('div', {},
      h('p', {}, 'Speicherplatz ' + game.slot + ' · ' + s.player.name + ' · ' + fmtTime(s.playTime) + (s.updated ? ' · zuletzt gespeichert ' + new Date(s.updated).toLocaleString('de-DE') : '')),
      h('p.muted', {}, 'Dein Abenteuer wird automatisch lokal gespeichert. Mit Google-Anmeldung (im Titelmenü) wird es zusätzlich über die AnMaCha-Cloud synchronisiert.'),
      h('div.list', {},
        h('button.row.focusable', { onclick: () => { game.saveNow(true); game.ui.toast('Gespeichert', '💾'); } }, '💾 Jetzt speichern'),
        h('button.row.focusable', { onclick: () => game.exportSave() }, '⇩ Spielstand exportieren (JSON)'),
        h('button.row.focusable', { onclick: () => game.importSave() }, '⇧ Spielstand importieren'),
        h('button.row.focusable', { onclick: () => game.toTitle() }, '⌂ Zum Titelbildschirm')));
  }
};

// ------------------------------------------------------------------ status page
export function openStatus(game, m, after) {
  const s = game.save, sp = SPECIES[m.id];
  const stat = (k, label) => { const v = statOf(m, k); return [label, h('div.bar', {}, h('i', { style: { width: Math.min(100, v / 2.2) + '%' } })), h('b', {}, v)]; };
  const chain = evolutionChain(m.id);
  const body = h('div.split', {},
    h('div', {}, h('div.viewport3d', { id: 'statusview' }), h('p', { style: { textAlign: 'center' } }, typeBadge(sp.type), sp.type2 ? typeBadge(sp.type2) : null)),
    h('div', {},
      h('div.statgrid', {}, 'KP', hpBar(m.hp, maxHp(m)), h('b', {}, m.hp + '/' + maxHp(m)), ...stat('atk', 'Angriff'), ...stat('def', 'Verteidigung'), ...stat('speed', 'Initiative'),
        'EP', h('div.bar.xp', {}, h('i', { style: { width: m.xp / xpToNext(m.lv) * 100 + '%' } })), h('b', {}, m.xp + '/' + xpToNext(m.lv))),
      h('h3', {}, 'Attacken'),
      h('div.list', {}, m.moves.map(x => { const mv = MOVES[x.id]; return h('div.row', {}, h('div.grow', {}, typeBadge(mv.type), ' ', h('b', {}, mv.name), h('div.muted', {}, (mv.power ? 'Stärke ' + mv.power + ' · ' : 'Status · ') + 'Genauigkeit ' + Math.round(mv.acc * 100) + '% ' + (mv.desc ? '· ' + mv.desc : ''))), h('span.right', {}, x.pp + '/' + mv.pp + ' AP')); })),
      h('h3', {}, 'Entwicklung'),
      h('p', {}, chain.map(id => (id === m.id ? '▶ ' : '') + (s.dex[id] ? SPECIES[id].name : '???')).join('  →  ')),
      h('p.muted', {}, describeEvolution(m.id) ? 'Nächste Stufe ' + describeEvolution(m.id) : 'Letzte Entwicklungsstufe.'),
      h('div.optrow', {},
        h('button.chip.focusable', { onclick: () => { const i = s.team.indexOf(m); if (i > 0) { s.team.splice(i, 1); s.team.unshift(m); game.world.refreshFollower(); game.ui.toast(nameOf(m) + ' führt jetzt das Team an.'); } } }, 'An die Spitze'),
        h('button.chip.focusable', { onclick: async () => { const n = prompt('Spitzname für ' + sp.name + ' (leer = keiner):', m.nick || ''); if (n !== null) { m.nick = n.trim().slice(0, 14) || undefined; game.ui.toast('Gespeichert'); } } }, 'Spitzname'))));
  const screen = { el: panel(game, nameOf(m) + ' · Lv ' + m.lv, body) };
  screen.onBack = () => game.ui.pop(screen);
  screen.onClose = () => { game.preview.detach(); after && after(); };
  game.ui.push(screen);
  requestAnimationFrame(() => { const v = screen.el.querySelector('#statusview'); if (v) { game.preview.attach(v); game.preview.showCreature(m.id); } });
}

export function openDexEntry(game, id) {
  const s = game.save, sp = SPECIES[id];
  const caught = s.dex[id] === 2;
  const hab = habitatsOf(id).slice(0, 6).map(x => REGIONS[x.region].name + ' (' + { grass: 'Gras', water: 'Wasser', cave: 'Höhle', flowers: 'Blumen', night: 'Nacht' }[x.habitat] + ')');
  const chain = evolutionChain(id);
  const body = h('div.split', {},
    h('div', {}, h('div.viewport3d', { id: 'dexview' })),
    h('div', {}, h('p', {}, typeBadge(sp.type), sp.type2 ? typeBadge(sp.type2) : null, ' ', h('span.muted', {}, '#' + String(sp.dexNo).padStart(3, '0'))),
      h('p', {}, sp.bio),
      caught ? h('div.statgrid', {}, 'KP', h('div.bar', {}, h('i', { style: { width: sp.hp / 1.4 + '%' } })), h('b', {}, sp.hp), 'Angriff', h('div.bar', {}, h('i', { style: { width: sp.atk / 1.4 + '%' } })), h('b', {}, sp.atk), 'Verteidigung', h('div.bar', {}, h('i', { style: { width: sp.def / 1.4 + '%' } })), h('b', {}, sp.def), 'Initiative', h('div.bar', {}, h('i', { style: { width: sp.speed / 1.4 + '%' } })), h('b', {}, sp.speed)) : h('p.muted', {}, 'Fange dieses Taschi, um seine Werte zu erfahren.'),
      h('p', {}, h('b', {}, 'Verhalten: '), { shy: 'scheu – flieht vor Reisenden', curious: 'neugierig – beobachtet Reisende', playful: 'verspielt', aggressive: 'angriffslustig – stürmt auf Reisende zu', sleepy: 'verschlafen' }[sp.behavior] || '–'),
      h('p', {}, h('b', {}, 'Fundorte: '), sp.ancient ? 'Uralter Schrein (Legende)' : id === 'schnurrik' ? 'Begleiter der Schattengilde' : hab.join(', ') || 'durch Entwicklung'),
      h('p', {}, h('b', {}, 'Entwicklung: '), chain.map(c => s.dex[c] ? SPECIES[c].name : '???').join(' → ')),
      caught ? h('p.muted', {}, 'Lernt: ' + learnset(id).map(([lv, m]) => MOVES[m].name + ' (' + lv + ')').join(', ')) : null));
  const screen = { el: panel(game, sp.name, body) };
  screen.onBack = () => game.ui.pop(screen);
  screen.onClose = () => game.preview.detach();
  game.ui.push(screen);
  requestAnimationFrame(() => { const v = screen.el.querySelector('#dexview'); if (v) { game.preview.attach(v); game.preview.showCreature(id); } });
}

function useItemFlow(game, id, rerender) {
  const s = game.save;
  const screen = { el: panel(game, ITEMS[id].name + ' benutzen', h('div', {}, h('p.muted', {}, ITEMS[id].desc), h('div.grid', {}, s.team.map((m, i) => monCard(game, m, i, () => {
    const res = Items.useFromBag(s.bag, id, m);
    game.audio.sfx(res.ok ? 'heal' : 'error');
    game.ui.pop(screen);
    if (res.evolved) game.evolveInWorld(m, res.evolved);
    else game.ui.toast(res.text);
    rerender();
  })))), { small: true }) };
  screen.onBack = () => game.ui.pop(screen);
  game.ui.push(screen);
}

// ------------------------------------------------------------------ shop
export function openShop(game, clerkName) {
  const s = game.save;
  let mode = 'buy';
  const screen = { el: null };
  const render = () => {
    const stock = shopStock(s.badges);
    const sellable = ITEM_ORDER.filter(id => s.bag[id] > 0 && sellPrice(id) > 0);
    const body = h('div', {}, h('p', {}, h('span.pill', {}, '★ ' + s.coins), ' ', h('button.chip.focusable' + (mode === 'buy' ? '.sel' : ''), { onclick: () => { mode = 'buy'; rerender(); } }, 'Kaufen'), ' ', h('button.chip.focusable' + (mode === 'sell' ? '.sel' : ''), { onclick: () => { mode = 'sell'; rerender(); } }, 'Verkaufen')),
      mode === 'buy' ? h('div.list', {}, stock.map(id => h('div.row', {}, h('div.grow', {}, h('b', {}, ITEMS[id].name), ' ', h('span.muted', {}, '(im Besitz: ' + (s.bag[id] || 0) + ')'), h('div.muted', {}, ITEMS[id].desc)), h('span.right', {}, '★' + ITEMS[id].price),
        ...[1, 5, 10].map(n => h('button.chip.focusable', { onclick: () => { const r = Items.buy(s, id, n); game.audio.sfx(r.ok ? 'item' : 'error'); game.ui.toast(r.text); rerender(); } }, '×' + n)))),
        h('p.muted', {}, 'Bonus: Für je 10 Taschibälle gibt es einen gratis dazu. Mit mehr Siegeln wächst das Sortiment.'))
        : h('div.list', {}, sellable.length ? sellable.map(id => h('div.row', {}, h('div.grow', {}, h('b', {}, ITEMS[id].name), h('div.muted', {}, '×' + s.bag[id])), h('span.right', {}, '★' + sellPrice(id)), h('button.chip.focusable', { onclick: () => { const r = Items.sell(s, id, 1); game.audio.sfx(r.ok ? 'item' : 'error'); game.ui.toast(r.text); rerender(); } }, 'Verkaufen'))) : h('p', {}, 'Nichts zu verkaufen.')));
    return panel(game, 'Laden · ' + clerkName, body);
  };
  const rerender = () => { const old = screen.el; screen.el = render(); old.replaceWith(screen.el); screen.nav = new FocusNav(screen.el); screen.nav.ensure(); };
  screen.el = render();
  return new Promise(res => { screen.onBack = () => game.ui.pop(screen); screen.onClose = res; game.ui.push(screen); });
}

// ------------------------------------------------------------------ storage (PC)
export function openStorage(game) {
  const s = game.save;
  const screen = { el: null };
  const render = () => panel(game, 'Taschi-Lager', h('div', {},
    h('h3', {}, 'Team (' + s.team.length + '/6) – antippen zum Einlagern'),
    h('div.grid', {}, s.team.map((m, i) => monCard(game, m, i, () => { if (s.team.length <= 1) { game.ui.toast('Mindestens ein Taschi muss im Team bleiben.'); return; } s.team.splice(i, 1); s.box.unshift(m); game.world.refreshFollower(); rerender(); }))),
    h('h3', {}, 'Lager (' + s.box.length + ') – antippen zum Aufnehmen'),
    s.box.length ? h('div.grid', {}, s.box.map((m, i) => monCard(game, m, 1, () => { if (s.team.length >= 6) { game.ui.toast('Dein Team ist voll.'); return; } s.box.splice(i, 1); s.team.push(m); game.world.refreshFollower(); rerender(); }))) : h('p.muted', {}, 'Das Lager ist leer.')));
  const rerender = () => { const old = screen.el; screen.el = render(); old.replaceWith(screen.el); screen.nav = new FocusNav(screen.el); screen.nav.ensure(); };
  screen.el = render();
  return new Promise(res => { screen.onBack = () => game.ui.pop(screen); screen.onClose = res; game.ui.push(screen); });
}

// ------------------------------------------------------------------ travel
export function openTravel(game) {
  const s = game.save;
  return new Promise(res => {
    const list = REGIONS.filter(r => s.visited[r.id]);
    const screen = { el: panel(game, 'Flugtaxi', h('div', {}, h('p.muted', {}, 'Fliege zu jedem Heilzentrum, das du schon besucht hast.'),
      h('div.list', {}, list.map(r => h('button.row.focusable', { onclick: () => { game.ui.pop(screen); res(r.id); } }, h('div.grow', {}, h('b', {}, (r.id + 1) + '. ' + r.town), ' ', h('span.muted', {}, r.name)), h('span.right', {}, r.types.map(t => TYPES[t].icon).join(' ')))),
        s.flags.summitDone ? h('button.row.focusable', { onclick: () => { game.ui.pop(screen); res(16); } }, h('div.grow', {}, h('b', {}, '★ Sternengipfel'))) : null)), { small: true }) };
    screen.onBack = () => { game.ui.pop(screen); res(null); };
    game.ui.push(screen);
  });
}
