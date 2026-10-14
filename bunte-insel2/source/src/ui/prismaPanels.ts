/* Fenster der späteren Welten: Runen-Arena (Duelle, Deck, Turnier), Datenhain-Pflege, Schmiede, Tor ins Zotik-Spiel. */
import type { Game } from '../game.ts';
import { btn, clear, h, modal } from './dom.ts';
import { CARDS, deckEditor, type Rival } from '../minigames/runen.ts';
import { SWORDS } from '../data/items.ts';
import { COMPANIONS, type Companions } from '../gameplay/companions.ts';

const RIVALS: (Rival & { id: string; flag: string; reward: string[]; need?: string })[] = [
  { id: 'lina', flag: 'runen_lina', name: 'Lehrling Lina', icon: '🃏', level: 0.5, deck: ['c_funke', 'c_funke', 'c_welle', 'c_blatt', 'c_blatt', 'c_stein', 'c_welle', 'c_funke'], reward: ['c_perle', 'c_eiche'] },
  { id: 'karl', flag: 'runen_karl', name: 'Kartenkönig Karl', icon: '👑', level: 1.5, deck: ['c_glut', 'c_funke', 'c_funke', 'c_glut', 'c_stein', 'c_mond', 'c_funke', 'c_wind'], reward: ['c_stern', 'c_mond', 'c_kraken'], need: 'runen_lina' },
  { id: 'rune', flag: 'runen_rune', name: 'Runenmeister Rune', icon: '🧙', level: 2.6, deck: ['c_phoenix', 'c_schatten', 'c_perle', 'c_eiche', 'c_golem', 'c_mond', 'c_stern', 'c_wind'], reward: ['c_phoenix', 'c_schatten', 'c_golem'], need: 'runen_karl' }
];

export function installPrismaPanels(g: Game): void {
  g.panels.runenArena = () => {
    const m = modal({ title: 'Runen-Arena', icon: '🃏', wide: true, tabs: [{ id: 'duell', label: '⚔️ Duelle' }, { id: 'deck', label: '🎴 Mein Deck' }, { id: 'samml', label: '📚 Sammlung' }], onTab: id => draw(id) });
    const s = g.save;
    const draw = (id: string) => {
      clear(m.body);
      if (id === 'duell') {
        if (!s.quests.w_runen) m.body.append(h('p', { class: 'muted' }, 'Tipp: Runenmeister Rune hat eine Turnier-Aufgabe für dich. Du kannst aber jederzeit frei spielen.'));
        for (const r of RIVALS) {
          const done = !!g.flag(r.flag), locked = r.need && !g.flag(r.need);
          m.body.append(h('div', { class: 'card row' + (locked ? ' locked' : ''), style: 'margin:8px 0' }, h('div', { style: 'font-size:2rem' }, r.icon), h('div', null, h('b', null, r.name + (done ? ' ✅' : '')), h('div', { class: 'muted', style: 'font-size:.85rem' }, locked ? 'Erst den vorherigen Gegner besiegen.' : 'Belohnung: ' + r.reward.map(c => CARDS[c].icon).join(' '))), h('span', { class: 'spacer' }),
            locked ? null : btn(r.id === 'rune' ? '🏆 Finale' : '⚔️ Duell', () => { m.close(); duel(r); }, r.id === 'rune' ? 'pink small' : 'grape small')));
        }
        m.body.append(h('div', { class: 'card', style: 'margin-top:10px' }, h('b', null, '📜 Regeln'), h('p', { class: 'muted' }, '3 Bahnen, 6 Karten. Element-Vorteil (+2) gegen die gegnerische Karte auf derselben Bahn: 🔥 › 🍃 › 💧 › 🔥, ✨ ⇄ 🌑. Effekte: Wachstum, Spiegel, Schild, Sturm, Funke. Wer mehr Bahnen hält, gewinnt.')));
      } else if (id === 'deck') {
        m.body.append(deckEditor(s.cards.owned, s.cards.deck, d => { s.cards.deck = d; g.toast('Deck gespeichert!', '🎴'); }));
      } else {
        const ids = Object.keys(CARDS);
        m.body.append(h('p', null, Object.keys(s.cards.owned).length + ' von ' + ids.length + ' Karten gesammelt.'), h('div', { class: 'hand', style: 'min-height:auto' }, ids.map(cid => { const c = CARDS[cid], n = s.cards.owned[cid] ?? 0; return h('div', { class: 'rcard el-' + c.e, style: n ? '' : 'opacity:.25;filter:grayscale(1)', title: c.text ?? '' }, h('span', { class: 'p' }, String(c.p)), h('span', { class: 'e' }, n ? c.icon : '❔'), h('span', { class: 'nm' }, n ? c.name + ' ×' + n : '???')); })));
      }
    };
    const duel = (r: (typeof RIVALS)[number]) => {
      g.startMinigame('runen', { rival: r, deck: s.cards.deck.length === 8 ? s.cards.deck : undefined, onEnd: (win: boolean) => {
        if (!win) return;
        const first = !g.flag(r.flag);
        g.setFlag(r.flag);
        const reward = first ? r.reward : [r.reward[Math.floor(Math.random() * r.reward.length)]];
        for (const c of reward) s.cards.owned[c] = (s.cards.owned[c] ?? 0) + 1;
        g.toast('Neue Karten: ' + reward.map(c => CARDS[c].icon + ' ' + CARDS[c].name).join(', '), '🎴', 4000);
        if (r.id === 'rune' && first) g.achieve('runenmeister');
      } });
    };
  };
  g.panels.datenhain = () => {
    const s = g.save;
    const m = modal({ title: 'Datennest', icon: '💠' });
    const now = () => Date.now();
    const draw = () => {
      clear(m.body);
      let c = s.creatures.find(x => x.id === 'pixel');
      if (!c) {
        m.body.append(h('div', { style: 'text-align:center;font-size:4rem' }, '🥚'), h('p', { style: 'text-align:center' }, 'Im Nest liegt ein leuchtendes Datenei. Es knistert und blinkt …'),
          h('div', { class: 'row', style: 'justify-content:center' }, btn('💠 Aufnehmen', () => {
            s.creatures.push({ id: 'pixel', species: 'datenwesen', name: 'Pixel', stage: 0, bond: 10, xp: 0, hunger: 50, mood: 60 });
            g.setFlag('pixel_adoptiert'); (g.system<Companions>('companions'))?.add('pixel'); g.sfx('magic'); g.burst(g.player.pos.x, g.player.pos.y + 1.5, g.player.pos.z, [0x58d9ff, 0xff79c9], 40); draw();
          }, 'green')));
        return;
      }
      const cd = (k: string) => Math.max(0, ((s.stats['pixel_' + k] ?? 0) + 12000 - now()) / 1000);
      const act = (k: string, fn: () => boolean) => { if (cd(k) > 0) { g.toast('Pixel braucht noch ' + Math.ceil(cd(k)) + ' Sekunden Pause.', '⏳'); return; } if (fn()) { s.stats['pixel_' + k] = now(); evolve(); draw(); } };
      const evolve = () => {
        if (c!.stage === 0 && c!.bond >= 100) {
          c!.stage = 1; g.setFlag('pixel_entwickelt');
          COMPANIONS.pixel.scale = 1.0; COMPANIONS.pixel.color = 0xff79c9; COMPANIONS.pixel.name = 'Pixel (Prisma-Form)';
          (g.system<Companions>('companions'))?.setActive('pixel');
          g.bigToast('Pixel entwickelt sich zur Prisma-Form! ✨', '💠'); g.sfx('levelup'); g.burst(g.player.pos.x, g.player.pos.y + 1.5, g.player.pos.z, [0x58d9ff, 0xff79c9, 0xffcf55, 0x8df47a], 80);
        }
      };
      const bar = (label: string, v: number, col: string) => h('div', { style: 'margin:6px 0' }, h('div', { class: 'row' }, h('b', null, label), h('span', { class: 'spacer' }), h('span', { class: 'muted' }, Math.round(v) + ' %')), h('div', { class: 'progress' }, h('i', { style: 'width:' + Math.min(100, v) + '%;background:' + col })));
      m.body.append(h('div', { style: 'text-align:center;font-size:4rem' }, c.stage ? '🌈' : '🟦'), h('h3', { style: 'text-align:center' }, c.name + (c.stage ? ' – Prisma-Form' : ' – Datenform')),
        bar('❤️ Freundschaft', c.bond, 'linear-gradient(90deg,#ff79c9,#ffcf55)'), bar('🍪 Satt', 100 - c.hunger, 'linear-gradient(90deg,#8df47a,#58d9ff)'), bar('😊 Laune', c.mood, 'linear-gradient(90deg,#58d9ff,#b48aff)'),
        h('div', { class: 'row', style: 'justify-content:center;margin-top:10px' },
          btn('🍪 Füttern (' + g.count('datenkeks') + ')', () => act('feed', () => { if (!g.take('datenkeks')) { g.toast('Keine Datenkekse – Bit verkauft welche!', '🍪'); return false; } c!.hunger = Math.max(0, c!.hunger - 40); c!.bond = Math.min(100, c!.bond + 18); c!.mood = Math.min(100, c!.mood + 10); g.sfx('pickup'); return true; }), 'green small'),
          btn('🎾 Spielen', () => act('play', () => { c!.mood = Math.min(100, c!.mood + 25); c!.bond = Math.min(100, c!.bond + 12); c!.hunger = Math.min(100, c!.hunger + 10); g.sfx('jump2'); g.avatar.play('cheer', 1); return true; }), 'blue small'),
          btn('🏋️ Trainieren', () => act('train', () => { if (c!.mood < 30) { g.toast('Pixel ist zu müde. Spiel erst mit ihm!', '😴'); return false; } c!.xp += 10; c!.bond = Math.min(100, c!.bond + 10); c!.mood -= 15; g.sfx('magic'); return true; }), 'grape small')),
        h('p', { class: 'muted', style: 'text-align:center' }, c.stage ? 'Pixel begleitet dich als Partner (Begleiter-Wahl im Pausenmenü).' : 'Bei voller Freundschaft entwickelt sich Pixel!'));
    };
    draw();
  };
  g.panels.schmieden = () => {
    const s = g.save, i = SWORDS.findIndex(x => x.id === s.equip.sword);
    if (i >= SWORDS.length - 1) { g.toast('Dein Lichtschwert ist schon das beste Schwert!', '🌟'); g.give('kristall', 2, true); return; }
    s.equip.sword = SWORDS[i + 1].id;
    g.sfx('chop'); g.burst(g.player.pos.x, g.player.pos.y + 1.2, g.player.pos.z, [0xffa21f, 0xffd23f], 30);
    g.bigToast('KLONG! Neues Schwert: ' + SWORDS[i + 1].icon + ' ' + SWORDS[i + 1].name + ' (nur im Verbotenen Wald)', '⚒️');
  };
  g.panels.zotikTor = () => { g.persist(); location.href = '../zotik/?from=bunteinsel2'; };
  g.panels.companions = () => {
    const s = g.save, comp = g.system<Companions>('companions');
    const m = modal({ title: 'Begleiter', icon: '🐾' });
    m.body.append(h('div', { class: 'grid' }, s.companions.filter(id => id !== 'pappnase' && COMPANIONS[id]).map(id => { const d = COMPANIONS[id]; return h('div', { class: 'card' + (s.companion === id ? ' on' : '') }, h('div', { style: 'font-size:2rem' }, d.icon), h('b', null, d.name), h('p', { class: 'muted', style: 'font-size:.85rem' }, d.desc), s.companion === id ? h('span', { class: 'chip' }, '✅ dabei') : btn('Mitnehmen', () => { comp?.setActive(id); m.close(); }, 'green small')); })),
      h('div', { class: 'row', style: 'margin-top:10px' }, btn(s.flags.pappnase_home ? '🎈 Pappnase mitnehmen' : '🎈 Pappnase zu Hause lassen', () => { s.flags.pappnase_home = s.flags.pappnase_home ? 0 : 1; comp?.setActive(s.companion); m.close(); }, 'ghost small'), btn('Allein gehen', () => { comp?.setActive(null); m.close(); }, 'ghost small')));
  };
}
