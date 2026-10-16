// Title screen, save slot selection, character creator and intro slides.
import { h, FocusNav } from './ui.js';
import { SPECIES } from '../data/species.js';
import { REGIONS } from '../data/regions.js';
import { INTRO_SLIDES } from '../data/story.js';
import { PLAYER_PRESETS, GENDERS, BODY_FOR_GENDER, SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS, HAIR_STYLES } from '../engine/characters.js';
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

// Character creation and wardrobe with a live 3D preview.
// mode 'new': gender, name and look for a new adventure.
// mode 'upgrade': the same for an older save (name is pre-filled).
// mode 'wardrobe': change clothes, hair and body later; resolves null on cancel.
const CAP_COLORS = [0xd8483a, 0x3a7fd0, 0x2fa07a, 0xf0a030, 0x7d4fa3, 0xe86aa0, 0x2a2d36, 0xf2efe6];
const PANT_COLORS = [0x34465f, 0x2f3e55, 0x4a3a2a, 0x5a5a62, 0x2a2d36, 0x6a4a3a, 0x3a5a3a, 0xc8b490];
const GLOVE_COLORS = [null, 0x2fa07a, 0xd8483a, 0x3a7fd0, 0x2a2d36, 0xf2efe6, 0xf0a030];
const BAG_COLORS = [0xf09a3a, 0xf2c94a, 0x3a7fd0, 0x2fa07a, 0xd8483a, 0x7d4fa3];
export function creatorScreen(game, { mode = 'new', player = null } = {}) {
  return new Promise(resolve => {
    const start = player?.look && Object.keys(player.look).length ? player.look : null;
    let gender = player?.gender || 'm';
    let look = start ? { ...start } : { ...PLAYER_PRESETS[gender] };
    // older saves have no gender yet: start from the new trainer look and keep skin and hair colour
    if (start && !player?.gender) look = { ...PLAYER_PRESETS.m, skin: start.skin ?? PLAYER_PRESETS.m.skin, hairColor: start.hairColor ?? PLAYER_PRESETS.m.hairColor };
    let name = player?.name || PLAYER_PRESETS[gender].name;
    delete look.name; delete look.gender;
    const screen = { el: null };
    const update = () => { game.preview.showCharacter(look).hold('wave'); };
    const same = (a, b) => a === b || (a == null && b == null);
    const row = (label, ...items) => h('div.optrow', {}, h('span.lbl', {}, label), ...items);
    const sw = (label, key, list, byIndex = false) => row(label, list.map((c, i) => {
      const v = byIndex ? i : c;
      return h('button.swatch.focusable' + (same(look[key] ?? null, v) ? '.sel' : ''), { 'aria-label': label, style: c == null ? { background: 'repeating-linear-gradient(45deg,#fff 0 5px,#d8dee6 5px 10px)' } : { background: hex(c) }, onclick: () => { look[key] = v; rerender(); } });
    }));
    const chips = (label, key, values, labels) => row(label, values.map((v, i) => h('button.chip.focusable' + (same(look[key] ?? null, v) ? '.sel' : ''), { onclick: () => { look[key] = v; rerender(); } }, labels[i])));
    const pickGender = (g) => {
      gender = g;
      if (mode === 'wardrobe') look.body = BODY_FOR_GENDER[g];
      else { look = { ...PLAYER_PRESETS[g] }; delete look.name; delete look.gender; if (!player?.name && (!name.trim() || Object.values(PLAYER_PRESETS).some(p => p.name === name))) name = PLAYER_PRESETS[g].name; }
      rerender();
    };
    const finish = (ok) => {
      game.ui.pop(screen); game.preview.detach();
      if (!ok) return resolve(null);
      const n = name.trim().slice(0, 12) || PLAYER_PRESETS[gender].name;
      resolve({ name: n, gender, preset: gender, look: { ...look, body: look.body || BODY_FOR_GENDER[gender] } });
    };
    const title = mode === 'wardrobe' ? 'Kleiderschrank' : 'Wer bist du?';
    const render = () => h('div.screen', {}, h('div.panel', {},
      h('div.panel-head', {}, h('h2', {}, title), mode === 'wardrobe' ? h('button.closebtn.focusable', { 'aria-label': 'Abbrechen', onclick: () => finish(false) }, '✕') : null),
      h('div.panel-body', {}, h('div.creator', {},
        h('div.creatorview', {}, h('div.viewport3d', { id: 'creatorview' })),
        h('div', {},
          mode === 'wardrobe' ? h('p.muted', {}, 'Zieh dich um, wie du willst. Deine Taschis erkennen dich trotzdem!') : h('p.muted', {}, 'Wähle, wer du bist, und gib dir einen Namen. Danach kannst du dein Trainer-Outfit anpassen.'),
          row('Ich bin', GENDERS.map(([g, label]) => h('button.chip.focusable' + (gender === g ? '.sel' : ''), { onclick: () => pickGender(g), 'data-autofocus': gender === g ? '' : undefined }, label))),
          mode === 'wardrobe' ? null : row('Name', h('input.name', { value: name, maxlength: 12, placeholder: 'Dein Name', oninput: (e) => { name = e.target.value; } })),
          h('h3', {}, 'Aussehen'),
          sw('Haut', 'skin', SKIN_TONES, true),
          chips('Frisur', 'hair', HAIR_STYLES, ['Kurz', 'Stachelig', 'Zopf', 'Lang', 'Dutt', 'Bob', 'Locken', 'Zöpfe']),
          sw('Haarfarbe', 'hairColor', HAIR_COLORS, true),
          chips('Augen', 'lashes', [false, true], ['Schlicht', 'Wimpern']),
          h('h3', {}, 'Outfit'),
          chips('Kopf', 'hat', ['trainercap', 'cap', 'beanie', 'beret', 'sunhat', null], ['Trainerkappe', 'Kappe', 'Mütze', 'Barett', 'Sonnenhut', 'Keine']),
          look.hat ? sw('Kappenfarbe', 'hatColor', CAP_COLORS) : null,
          look.hat === 'trainercap' ? sw('Kappe vorne', 'capFront', CAP_COLORS) : null,
          chips('Oberteil', 'top', ['trainer', 'jacket', 'hoodie', 'vest', 'tshirt', 'dress'], ['Trainerjacke', 'Jacke', 'Hoodie', 'Weste', 'Shirt', 'Kleid']),
          sw('Farbe', 'topColor', OUTFIT_COLORS, true),
          ['trainer', 'jacket', 'vest', 'uniform'].includes(look.top) ? sw(look.top === 'trainer' ? 'Ärmel & Kragen' : 'Akzent', 'accent', CAP_COLORS) : null,
          look.top === 'trainer' ? sw('Shirt', 'inner', CAP_COLORS) : null,
          look.top === 'dress' ? null : chips('Unten', 'bottom', ['pants', 'shorts', 'skirt'], ['Hose', 'Shorts', 'Rock']),
          look.top === 'dress' ? null : sw('Hosenfarbe', 'bottomColor', PANT_COLORS),
          sw('Handschuhe', 'gloves', GLOVE_COLORS),
          sw('Schuhe', 'shoes', [0x3a3330, 0xd8483a, 0x3a7fd0, 0xf2efe6, 0x2fa07a, 0xe86aa0]),
          chips('Gürtel', 'belt', [0x5a4030, 0x2a2d36, 0x3a3048, null], ['Braun', 'Schwarz', 'Lila', 'Keiner']),
          sw('Rucksack', 'backpack', [...BAG_COLORS, null]),
          h('div.optrow', { style: { marginTop: '14px' } },
            mode === 'wardrobe' ? h('button.bigbtn.focusable', { onclick: () => finish(false) }, 'Abbrechen') : null,
            h('button.bigbtn.primary.focusable', { onclick: () => finish(true) }, mode === 'wardrobe' ? '✓ Fertig' : '✓ So starte ich!'))))),
      game.ui.hintsBar([['confirm', 'Wählen']].concat(mode === 'wardrobe' ? [['back', 'Abbrechen']] : []))));
    const rerender = () => {
      // keep scroll position and the focused control (by position in the list)
      const old = screen.el, y = old.querySelector('.panel-body')?.scrollTop || 0, at = screen.nav ? screen.nav.items().indexOf(screen.nav.current) : -1;
      screen.el = render(); screen.el.classList.add('noanim'); old.replaceWith(screen.el);
      screen.el.querySelector('.panel-body').scrollTop = y;
      screen.nav = new FocusNav(screen.el);
      const items = screen.nav.items();
      if (at >= 0 && items.length) screen.nav.focus(items[Math.min(at, items.length - 1)]); else screen.nav.ensure();
      attach();
    };
    const attach = () => requestAnimationFrame(() => { const v = screen.el.querySelector('#creatorview'); if (v) { game.preview.attach(v); update(); } });
    screen.el = render();
    screen.onBack = () => { if (mode === 'wardrobe') finish(false); };
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
