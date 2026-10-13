// Title screen, save slot selection, character creator and intro slides.
import { h, FocusNav } from './ui.js';
import { SPECIES } from '../data/species.js';
import { REGIONS } from '../data/regions.js';
import { INTRO_SLIDES } from '../data/story.js';
import { PLAYER_PRESETS, SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS, HAIR_STYLES } from '../engine/characters.js';
import { fmtTime } from './menus.js';

const hex = (c) => '#' + c.toString(16).padStart(6, '0');

export function titleScreen(game, { onContinue, onNew, onSlots, onSettings }) {
  const sum = game.store.summary(game.slot);
  const el = h('div#title.layer', {},
    h('div.logo', {}, h('div.orb'), h('h1', {}, 'TASCHI'), h('p.sub', {}, 'DIE 16 LICHTER')),
    h('div.menu', {},
      sum.empty ? null : h('button.bigbtn.primary.focusable', { onclick: onContinue, 'data-autofocus': '' }, h('span.ic', {}, '▶'), h('span', {}, 'Fortsetzen', h('div.muted', { style: { fontSize: '.7em', fontWeight: 400 } }, sum.name + ' · ' + sum.badges + '/16 Siegel · ' + REGIONS[Math.min(15, sum.region)].name))),
      h('button.bigbtn.focusable' + (sum.empty ? '.primary' : ''), { onclick: onNew, 'data-autofocus': sum.empty ? '' : undefined }, h('span.ic', {}, '✦'), 'Neues Abenteuer'),
      h('button.bigbtn.focusable', { onclick: onSlots }, h('span.ic', {}, '▤'), 'Spielstand wählen (Platz ' + game.slot + ')'),
      h('button.bigbtn.focusable', { onclick: onSettings }, h('span.ic', {}, '⚙'), 'Einstellungen'),
      h('div', { id: 'cloudSlot', style: { pointerEvents: 'auto' } })),
    h('div.press', {}, game.input.pad ? '🎮 Controller verbunden' : ''),
    h('div.version', {}, 'Version 2.0 · eigene Welt, eigene Wesen'));
  // move the shared AnMaCha cloud panel into the title menu
  const cloud = document.getElementById('cloudMount');
  if (cloud) el.querySelector('#cloudSlot').append(cloud);
  const screen = { el, onBack: () => {} };
  return screen;
}

export function slotScreen(game) {
  return new Promise(resolve => {
    const screen = { el: null };
    const render = () => h('div.screen', {}, h('div.panel.small', {},
      h('div.panel-head', {}, h('h2', {}, 'Spielstände'), h('button.closebtn.focusable', { onclick: () => done(null) }, '✕')),
      h('div.panel-body', {}, h('div.list', {}, [1, 2, 3].map(n => {
        const s = game.store.summary(n);
        return h('div.row', {}, h('button.grow.focusable', { style: { textAlign: 'left', pointerEvents: 'auto', padding: '6px' }, onclick: () => done(n) },
          h('b', {}, 'Platz ' + n + (n === game.slot ? ' ✓' : '')), h('div.muted', {}, s.empty ? 'Leer' : s.name + ' · ' + s.badges + '/16 Siegel · ' + s.dex + ' Taschis · ' + fmtTime(s.playTime || 0) + (s.source === 'legacy' ? ' · aus Version 1' : ''))),
          s.empty ? null : h('button.chip.focusable', { onclick: async () => { const c = await game.ui.ask([{ text: 'Spielstand ' + n + ' wirklich löschen? Exportiere ihn vorher, wenn du ihn behalten willst. (Version-1-Daten bleiben als Sicherung erhalten.)' }], ['Abbrechen', 'Löschen'], { cancelIndex: 0 }); if (c === 1) { game.store.remove(n); rerender(); } } }, 'Löschen'));
      }))),
      game.ui.hintsBar([['confirm', 'Wählen'], ['back', 'Zurück']])));
    const rerender = () => { const old = screen.el; screen.el = render(); old.replaceWith(screen.el); screen.nav = new FocusNav(screen.el); screen.nav.ensure(); };
    const done = (v) => { game.ui.pop(screen); resolve(v); };
    screen.el = render();
    screen.onBack = () => done(null);
    game.ui.push(screen);
  });
}

// Character creation: 4 presets + customisation, live 3D preview.
export function creatorScreen(game) {
  return new Promise(resolve => {
    let preset = 'rio';
    let look = { ...PLAYER_PRESETS.rio };
    let name = PLAYER_PRESETS.rio.name;
    const screen = { el: null };
    const update = () => { game.preview.showCharacter(look).hold('wave'); };
    const sw = (key, list, val) => h('div.optrow', {}, h('span.lbl', {}, { skin: 'Haut', hairColor: 'Haarfarbe', topColor: 'Kleidung', backpack: 'Rucksack' }[key]),
      list.map((c, i) => h('button.swatch.focusable' + ((typeof look[key] === 'number' && look[key] === (val === 'index' ? i : c)) ? '.sel' : ''), { style: { background: hex(c) }, onclick: () => { look[key] = val === 'index' ? i : c; rerender(); } })));
    const chips = (key, list, labels) => h('div.optrow', {}, h('span.lbl', {}, { hair: 'Frisur', hat: 'Kopfbedeckung', top: 'Oberteil', bottom: 'Hose' }[key]),
      list.map((v, i) => h('button.chip.focusable' + (look[key] === v ? '.sel' : ''), { onclick: () => { look[key] = v; rerender(); } }, labels[i])));
    const render = () => h('div.screen', {}, h('div.panel', {},
      h('div.panel-head', {}, h('h2', {}, 'Wer bist du?')),
      h('div.panel-body', {}, h('div.creator', {},
        h('div', {}, h('div.viewport3d', { id: 'creatorview' }),
          h('div.optrow', { style: { justifyContent: 'center' } }, Object.entries(PLAYER_PRESETS).map(([k, p]) => h('button.chip.focusable' + (preset === k ? '.sel' : ''), { onclick: () => { preset = k; look = { ...p }; name = p.name; rerender(); } }, p.name)))),
        h('div', {},
          h('div.optrow', {}, h('span.lbl', {}, 'Name'), h('input.name', { value: name, maxlength: 12, oninput: (e) => { name = e.target.value; } })),
          sw('skin', SKIN_TONES, 'index'),
          chips('hair', HAIR_STYLES, ['Kurz', 'Stachelig', 'Zopf', 'Lang', 'Dutt', 'Bob', 'Locken', 'Zöpfe']),
          sw('hairColor', HAIR_COLORS, 'index'),
          chips('top', ['jacket', 'hoodie', 'vest', 'tshirt'], ['Jacke', 'Hoodie', 'Weste', 'Shirt']),
          sw('topColor', OUTFIT_COLORS, 'index'),
          chips('bottom', ['pants', 'shorts', 'skirt'], ['Hose', 'Shorts', 'Rock']),
          chips('hat', [null, 'cap', 'beanie', 'beret', 'sunhat'], ['Keine', 'Kappe', 'Mütze', 'Barett', 'Sonnenhut']),
          sw('backpack', [0xf09a3a, 0xf2c94a, 0x3a7fd0, 0x2fa07a, 0xd8483a, 0x7d4fa3], 'value'),
          h('div.optrow', { style: { marginTop: '14px' } }, h('button.bigbtn.primary.focusable', { onclick: () => { const n = name.trim().slice(0, 12) || 'Rio'; game.ui.pop(screen); game.preview.detach(); resolve({ name: n, preset, look: { ...look, body: 'teen' } }); } }, '✓ So starte ich!'))))),
      game.ui.hintsBar([['confirm', 'Wählen']])));
    const rerender = () => { const old = screen.el; screen.el = render(); old.replaceWith(screen.el); screen.nav = new FocusNav(screen.el); screen.nav.ensure(); attach(); };
    const attach = () => requestAnimationFrame(() => { const v = screen.el.querySelector('#creatorview'); if (v) { game.preview.attach(v); update(); } });
    screen.el = render();
    screen.onBack = () => {};
    game.ui.push(screen);
    attach();
  });
}

export function introSlides(game) {
  return new Promise(resolve => {
    let i = 0;
    const box = h('div.slides');
    const el = h('div.screen', { style: { background: 'radial-gradient(ellipse at center, #1f3f66, #0a1424)' } }, box);
    const show = () => { const s = INTRO_SLIDES[i]; box.replaceChildren(h('h2', {}, s.title), h('p', {}, s.text), h('p.press', {}, (i < INTRO_SLIDES.length - 1 ? 'Weiter' : 'Los geht’s') + ' ▶')); };
    const next = () => { game.audio.sfx('confirm'); i++; if (i >= INTRO_SLIDES.length) { game.ui.pop(screen); resolve(); } else show(); };
    const screen = { el, onInput: (input) => { if (input.pressed('confirm')) next(); if (input.pressed('back')) { i = INTRO_SLIDES.length; next(); } input.nav(); return true; } };
    el.addEventListener('click', next);
    show();
    game.ui.push(screen);
  });
}

// Starter preview: 3D model, type, bio; resolves true when confirmed.
export function starterPreview(game, id) {
  return new Promise(resolve => {
    const sp = SPECIES[id];
    const el = h('div.screen', {}, h('div.panel.small', {},
      h('div.panel-head', {}, h('h2', {}, 'Taschiball')),
      h('div.panel-body', {}, h('div.viewport3d', { id: 'starterview' }),
        h('h2', { style: { margin: '10px 0 4px' } }, sp.name, ' ', h('span.type', { style: { background: { feuer: '#f07a3e', wasser: '#4d9ef0', pflanze: '#4fb86a' }[sp.type] } }, { feuer: '🔥 Feuer', wasser: '💧 Wasser', pflanze: '🌱 Pflanze' }[sp.type])),
        h('p', {}, sp.bio),
        h('div.optrow', {}, h('button.bigbtn.primary.focusable', { onclick: () => done(true), 'data-autofocus': '' }, 'Ich wähle ' + sp.name + '!'), h('button.bigbtn.focusable', { onclick: () => done(false) }, 'Anderen Ball ansehen'))),
      game.ui.hintsBar([['confirm', 'Wählen'], ['back', 'Zurück']])));
    const screen = { el };
    const done = (v) => { game.ui.pop(screen); game.preview.detach(); resolve(v); };
    screen.onBack = () => done(false);
    game.ui.push(screen);
    requestAnimationFrame(() => { game.preview.attach(el.querySelector('#starterview')); const c = game.preview.showCreature(id); c.play('happy', 1); game.audio.sfx('cry', { pitch: 380 + sp.speed * 2 }); });
  });
}
