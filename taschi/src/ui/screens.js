// Title screen, save slot selection, character creator and intro slides.
import { h, FocusNav } from './ui.js';
import { SPECIES } from '../data/species.js';
import { REGIONS } from '../data/regions.js';
import { INTRO_SLIDES } from '../data/story.js';
import { PLAYER_PRESETS, GENDERS, BODY_FOR_GENDER, SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS, HAIR_STYLES } from '../engine/characters.js';
import { fmtTime } from './menus.js';
import { logo, sparks } from './brand.js';

const hex = (c) => '#' + c.toString(16).padStart(6, '0');

export function titleScreen(game, { onContinue, onNew, onSlots, onSettings, onOnline, joinCode }) {
  const sum = game.store.summary(game.slot);
  const item = (ic, label, sub, onclick, extra = {}) => h('button.tmenu-item.focusable', { onclick, ...extra }, h('span.ic', {}, ic), h('span.tx', {}, h('b', {}, label), sub ? h('small', {}, sub) : null));
  const where = sum.empty ? '' : REGIONS[Math.min(15, sum.region)].name;
  const profile = sum.empty ? h('div.tprofile.empty', {}, h('div.tp-head', {}, 'Platz ' + game.slot), h('div.tp-name', {}, 'Neues Abenteuer'), h('div.tp-line', {}, 'Wähle deine Figur und finde dein erstes Taschi.'))
    : h('div.tprofile', {}, h('div.tp-head', {}, 'Platz ' + game.slot + ' · Zuletzt gespielt'), h('div.tp-name', {}, sum.name),
      h('div.tp-line', {}, '📍 ' + where),
      h('div.tp-stats', {}, h('span', {}, h('b', {}, sum.badges), '/16 Siegel'), h('span', {}, h('b', {}, sum.dex ?? 0), ' Taschis'), h('span', {}, h('b', {}, fmtTime(sum.playTime || 0)), ' Spielzeit')),
      h('div.tp-badges', {}, REGIONS.map((r, i) => h('i' + (sum.badges > i ? '.on' : '')))));
  const menu = h('div.tmenu-list', {},
    sum.empty ? null : item('▶', 'Fortsetzen', sum.name + ' · ' + sum.badges + '/16 Siegel · ' + where, onContinue, { 'data-autofocus': '' }),
    !sum.empty && joinCode ? item('🌐', 'Online beitreten', 'Raum ' + joinCode + ' · mit ' + sum.name, () => onOnline(joinCode)) : null,
    sum.empty ? (joinCode ? h('p.tnote', {}, '🌐 Einladung zu Raum ' + joinCode + ': Starte zuerst ein Abenteuer, dann kannst du beitreten.') : null)
      : item('🌐', 'Online & Freunde', 'Tauschen und kämpfen – Freunde treten per Link oder Code von überall bei', () => onOnline(null)),
    item('✦', 'Neues Abenteuer', 'Eine neue Reise durch die 16 Regionen', onNew, sum.empty ? { 'data-autofocus': '' } : {}),
    item('▤', 'Spielstand wählen', 'Platz ' + game.slot + ' von 3', onSlots),
    item('⚙', 'Einstellungen', 'Steuerung, Grafik, Ton und Stimmen', onSettings),
    item('☁', 'Spielstand sichern', 'Mit Google auf allen Geräten weiterspielen', () => { const r = el.querySelector('.tright'); r.classList.toggle('cloud'); }));
  const press = h('div.tpress', {}, h('span.key', {}, game.input.lastDevice === 'touch' ? '👆' : game.input.pad ? 'A' : '⏎'), game.input.lastDevice === 'touch' ? 'Tippe zum Starten' : 'Drücke eine Taste');
  const el = h('div#title.layer.stage-press', {},
    sparks(16, 5),
    h('div.tlogo', {}, logo('xl')),
    press,
    h('div.tmain', {}, h('div.tleft', {}, menu), h('div.tright', {}, profile, h('div', { id: 'cloudSlot', style: { pointerEvents: 'auto' } }))),
    h('div.tfoot', {}, h('div.tpad', {}, game.input.pad ? '🎮 Controller verbunden' : ''), game.ui.hintsBar([['confirm', 'Wählen'], ['back', 'Zurück']]), h('div.version', {}, 'Version 2.1 · eigene Welt, eigene Wesen')));
  // move the shared AnMaCha cloud panel into the title menu
  const cloud = document.getElementById('cloudMount');
  if (cloud) el.querySelector('#cloudSlot').append(cloud);
  // Konsolen-Ablauf: erst „Drücke eine Taste“, dann das Hauptmenü. B führt zurück.
  let stage = 'press';
  const setStage = (st) => {
    stage = st;
    el.classList.toggle('stage-press', st === 'press'); el.classList.toggle('stage-menu', st === 'menu');
    if (st === 'menu') { game.audio.sfx('confirm'); requestAnimationFrame(() => { screen.nav.current = null; screen.nav.ensure(); }); }
  };
  el.addEventListener('click', (e) => { if (stage === 'press') { e.stopPropagation(); setStage('menu'); } }, true);
  const screen = {
    el,
    onInput: (input) => {
      if (stage !== 'press') return false;
      if (['confirm', 'back', 'menu', 'run', 'team', 'map'].some(a => input.pressed(a))) setStage('menu');
      return true;
    },
    onBack: () => setStage('press')
  };
  if (joinCode) setStage('menu');
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
    // Figur: Mensch oder Zotik, der Fuchs-Abenteurer aus dem Spiel „Zotik“ (eigener Körper, kein Outfit)
    const pickFigure = (z) => {
      if (z === !!look.zotik) return;
      const isPreset = !name.trim() || name === 'Zotik' || Object.values(PLAYER_PRESETS).some(p => p.name === name);
      if (z) { look = { zotik: true }; if (isPreset) name = 'Zotik'; }
      else { look = { ...PLAYER_PRESETS[gender] }; delete look.name; delete look.gender; if (isPreset) name = PLAYER_PRESETS[gender].name; }
      rerender();
    };
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
          mode === 'wardrobe' ? h('p.muted', {}, 'Zieh dich um, wie du willst. Deine Taschis erkennen dich trotzdem!') : h('p.muted', {}, look.zotik ? 'Wähle, wer du bist, und gib dir einen Namen.' : 'Wähle, wer du bist, und gib dir einen Namen. Danach kannst du dein Abenteuer-Outfit anpassen.'),
          row('Figur', [[false, 'Mensch'], [true, '🦊 Zotik']].map(([z, label]) => h('button.chip.focusable' + (!!look.zotik === z ? '.sel' : ''), { onclick: () => pickFigure(z) }, label))),
          look.zotik ? null : row('Ich bin', GENDERS.map(([g, label]) => h('button.chip.focusable' + (gender === g ? '.sel' : ''), { onclick: () => pickGender(g), 'data-autofocus': gender === g ? '' : undefined }, label))),
          mode === 'wardrobe' ? null : row('Name', h('button.chip.focusable.namebtn', { onclick: async () => { const n = await game.ui.textEntry({ title: 'Dein Name', value: name, max: 12, placeholder: 'Dein Name' }); if (n !== null) { name = n || name; rerender(); } } }, '✎ ' + (name || 'Dein Name'))),
          ...(look.zotik ? [h('p.muted', {}, 'Zotik, der Fuchs-Abenteurer: grüner Schal, Lederweste, Schwert auf dem Rücken. Er reist als Taschi-Abenteurer durch die 16 Regionen – und in Sonnenhain wartet etwas, das genauso aussieht wie er …')] : [
          h('h3', {}, 'Aussehen'),
          sw('Haut', 'skin', SKIN_TONES, true),
          chips('Frisur', 'hair', HAIR_STYLES, ['Kurz', 'Stachelig', 'Zopf', 'Lang', 'Dutt', 'Bob', 'Locken', 'Zöpfe']),
          sw('Haarfarbe', 'hairColor', HAIR_COLORS, true),
          chips('Augen', 'lashes', [false, true], ['Schlicht', 'Wimpern']),
          h('h3', {}, 'Outfit'),
          chips('Kopf', 'hat', ['trainercap', 'cap', 'beanie', 'beret', 'sunhat', null], ['Abenteuerbrille', 'Kappe', 'Mütze', 'Barett', 'Sonnenhut', 'Keine']),
          look.hat ? sw(look.hat === 'trainercap' ? 'Stirnband' : 'Kappenfarbe', 'hatColor', CAP_COLORS) : null,
          look.hat === 'trainercap' ? sw('Brillengläser', 'capFront', [0x8ff0ff, 0xffc86a, 0x9af0a0, 0xff9ac8, 0xc8b0ff, 0xf2efe6]) : null,
          chips('Oberteil', 'top', ['trainer', 'jacket', 'hoodie', 'vest', 'tshirt', 'dress'], ['Abenteuerjacke', 'Jacke', 'Hoodie', 'Weste', 'Shirt', 'Kleid']),
          sw('Farbe', 'topColor', OUTFIT_COLORS, true),
          ['trainer', 'jacket', 'vest', 'uniform'].includes(look.top) ? sw(look.top === 'trainer' ? 'Schultern & Kragen' : 'Akzent', 'accent', CAP_COLORS) : null,
          look.top === 'trainer' ? sw('Shirt', 'inner', CAP_COLORS) : null,
          look.top === 'dress' ? null : chips('Unten', 'bottom', ['pants', 'shorts', 'skirt'], ['Hose', 'Shorts', 'Rock']),
          look.top === 'dress' ? null : sw('Hosenfarbe', 'bottomColor', PANT_COLORS),
          sw('Handschuhe', 'gloves', GLOVE_COLORS),
          sw('Schuhe', 'shoes', [0x3a3330, 0xd8483a, 0x3a7fd0, 0xf2efe6, 0x2fa07a, 0xe86aa0]),
          chips('Gürtel', 'belt', [0x5a4030, 0x2a2d36, 0x3a3048, null], ['Braun', 'Schwarz', 'Lila', 'Keiner']),
          sw('Rucksack', 'backpack', [...BAG_COLORS, null])]),
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
      h('div.panel-head', {}, h('h2', {}, 'Taschi-Kapsel')),
      h('div.panel-body', {}, h('div.viewport3d', { id: 'starterview' }),
        h('h2', { style: { margin: '10px 0 4px' } }, sp.name, ' ', h('span.type', { style: { background: { feuer: '#f07a3e', wasser: '#4d9ef0', pflanze: '#4fb86a' }[sp.type] } }, { feuer: '🔥 Feuer', wasser: '💧 Wasser', pflanze: '🌱 Pflanze' }[sp.type])),
        h('p', {}, sp.bio),
        h('div.optrow', {}, h('button.bigbtn.primary.focusable', { onclick: () => done(true), 'data-autofocus': '' }, 'Ich wähle ' + sp.name + '!'), h('button.bigbtn.focusable', { onclick: () => done(false) }, 'Andere Kapsel ansehen'))),
      game.ui.hintsBar([['confirm', 'Wählen'], ['back', 'Zurück']])));
    const screen = { el };
    const done = (v) => { game.ui.pop(screen); game.preview.detach(); resolve(v); };
    screen.onBack = () => done(false);
    game.ui.push(screen);
    requestAnimationFrame(() => { game.preview.attach(el.querySelector('#starterview')); const c = game.preview.showCreature(id); c.play('happy', 1); game.audio.sfx('cry', { id, sp }); });
  });
}
