/* Tagebuch: Quests (aktiv/erledigt) mit Zielen und mehrstufigen Hinweisen, Entdeckungen, Freundschaften, Erfolge, Sammelbuch. */
import type { Game } from '../game.ts';
import type { QuestDef, QuestEngine } from '../gameplay/quests.ts';
import type { NpcSystem } from '../gameplay/npc.ts';
import { ACHIEVEMENTS } from '../data/achievements.ts';
import { ABILITIES } from '../data/items.ts';
import { btn, clear, h, modal } from './dom.ts';
import { FISH, BUGS, FINDS } from '../data/collect.ts';

export function openJournal(g: Game, qe: QuestEngine, npcs: NpcSystem, worldName: (id: string) => string, tab = 'quests'): void {
  const m = modal({ title: 'Tagebuch', icon: '📖', wide: true, tab, tabs: [{ id: 'quests', label: '📜 Aufgaben' }, { id: 'done', label: '✅ Erledigt' }, { id: 'welt', label: '🗺️ Entdeckt' }, { id: 'freunde', label: '❤️ Freunde' }, { id: 'sammel', label: '📚 Sammelbuch' }, { id: 'erfolge', label: '🏆 Erfolge' }], onTab: id => draw(id) });
  const s = g.save;
  const questCard = (q: QuestDef, open: boolean) => {
    const st = s.quests[q.id];
    const card = h('div', { class: 'q' + (s.tracked === q.id ? ' on' : '') + (st?.done ? ' done' : '') });
    card.append(h('div', { class: 'qt' }, q.icon + ' ' + q.title, h('span', { class: 'spacer' }), h('span', { class: 'chip', style: 'font-size:.75rem' }, q.kind === 'main' ? '📖 Hauptgeschichte' : q.kind === 'world' ? '🌍 ' + worldName(q.world) : '✨ Nebenabenteuer')));
    if (st?.done) { card.append(h('div', { class: 'qs' }, q.rewards.text ?? q.summary)); return card; }
    const stage = q.stages[st!.stage];
    card.append(h('div', { class: 'qs' }, stage.text));
    if (open) {
      for (const o of stage.objectives) {
        const ok = qe.objDone(q.id, o), have = st!.progress[o.id] ?? 0;
        card.append(h('div', { class: 'objective' }, ok ? '✅' : o.optional ? '➕' : '⬜', o.label + ((o.n ?? 1) > 1 ? ' (' + Math.min(have, o.n!) + '/' + o.n + ')' : '')));
      }
      const hintBox = h('div', { class: 'hint-steps' });
      const showHints = () => {
        clear(hintBox);
        for (let i = 0; i < (st!.hints ?? 0); i++) hintBox.append(h('div', { class: 'h' }, ['💡 Tipp: ', '🔎 Genauer: ', '🗝️ Lösung: '][i] + stage.hints[i]));
        if ((st!.hints ?? 0) < 3 && g.settings.hints !== 'off') hintBox.append(btn((st!.hints ?? 0) === 0 ? '💡 Hinweis zeigen' : '💡 Noch ein Hinweis', () => { qe.useHint(q.id); showHints(); }, 'ghost small'));
      };
      showHints();
      card.append(h('div', { class: 'row', style: 'margin-top:8px' }, s.tracked === q.id ? h('span', { class: 'chip' }, '📍 wird verfolgt') : btn('📍 Verfolgen', () => { s.tracked = q.id; draw('quests'); }, 'blue small')), hintBox);
    } else card.addEventListener('click', () => { s.tracked = q.id; draw('quests'); });
    return card;
  };
  const draw = (id: string) => {
    clear(m.body);
    if (id === 'quests') {
      const active = qe.list('active').sort((a, b) => (a.kind === 'main' ? -1 : 0) - (b.kind === 'main' ? -1 : 0));
      if (!active.length) m.body.append(h('p', null, 'Gerade keine offenen Aufgaben. Sprich mit Bewohnern – viele brauchen Hilfe! Auf der Karte siehst du, wo jemand eine Aufgabe hat (📜).'));
      const tracked = active.find(q => q.id === s.tracked);
      const list = h('div', { class: 'qlist' });
      if (tracked) list.append(questCard(tracked, true));
      for (const q of active) if (q !== tracked) list.append(questCard(q, false));
      m.body.append(list);
      const ab = s.abilities.map(a => ABILITIES[a]).filter(Boolean);
      if (ab.length) m.body.append(h('h3', { style: 'margin-top:16px' }, '✨ Deine Fähigkeiten'), h('div', { class: 'row' }, ab.map(a => h('span', { class: 'chip', title: a.desc }, a.icon + ' ' + a.name))));
    } else if (id === 'done') {
      const done = qe.list('done');
      m.body.append(h('p', { class: 'muted' }, done.length + ' Abenteuer erlebt.'), h('div', { class: 'qlist' }, done.map(q => questCard(q, false))));
    } else if (id === 'welt') {
      const worlds = g.worlds.defs;
      m.body.append(h('div', { class: 'grid' }, worlds.map(w => {
        const seen = s.visited.includes(w.id);
        const pois = Object.entries(w.pois);
        const found = pois.filter(([k]) => s.discovered.includes(w.id + ':' + k)).length;
        return h('div', { class: 'card' + (seen ? '' : ' locked') }, h('b', null, (seen ? w.icon : '❔') + ' ' + (seen ? w.name : 'Unentdeckt')), h('div', { class: 'muted', style: 'font-size:.85rem' }, seen ? found + ' / ' + pois.length + ' Orte entdeckt' : 'Noch nicht besucht'), seen ? h('div', { class: 'progress', style: 'margin-top:6px' }, h('i', { style: 'width:' + (found / Math.max(1, pois.length) * 100) + '%' })) : null);
      })));
    } else if (id === 'freunde') {
      const known = Object.entries(s.npcs).filter(([, r]) => r.talks > 0).sort((a, b) => b[1].friend - a[1].friend);
      if (!known.length) m.body.append(h('p', null, 'Sprich mit den Bewohnern, um Freundschaften zu schließen. Plaudern (einmal am Tag) und Geschenke lassen Herzen wachsen.'));
      m.body.append(h('div', { class: 'grid' }, known.map(([id, r]) => {
        const d = npcs.defs.get(id);
        if (!d) return null;
        return h('div', { class: 'card' }, h('b', null, d.icon + ' ' + d.name), h('div', { class: 'muted', style: 'font-size:.85rem' }, d.role + ' · ' + worldName(d.world)), h('div', null, '❤️'.repeat(Math.ceil(r.friend / 2)) + '🤍'.repeat(5 - Math.ceil(r.friend / 2))), d.likes?.length && r.friend >= 4 ? h('div', { class: 'muted', style: 'font-size:.8rem' }, 'Mag: ' + d.likes.map(i => g.itemDef(i)?.icon ?? '').join(' ')) : null);
      })));
    } else if (id === 'sammel') {
      const sec = (title: string, list: { id: string; icon: string; name: string; where: string }[], have: Record<string, unknown>) => [h('h3', null, title + ' (' + list.filter(x => have[x.id]).length + '/' + list.length + ')'), h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(110px,1fr))' }, list.map(x => h('div', { class: 'item' + (have[x.id] ? '' : ' locked'), title: x.where }, h('span', { class: 'ic' }, have[x.id] ? x.icon : '❔'), h('span', { class: 'nm' }, have[x.id] ? x.name : '???'), h('span', { class: 'muted', style: 'font-size:.7rem' }, x.where))))];
      m.body.append(...sec('🎣 Fische', FISH, s.sammel.fish), ...sec('🦋 Käfer & Falter', BUGS, s.sammel.bugs), ...sec('⛏️ Fundstücke', FINDS, s.sammel.finds));
    } else if (id === 'erfolge') {
      const got = new Set(s.achievements);
      m.body.append(h('p', { class: 'muted' }, got.size + ' von ' + ACHIEVEMENTS.length + ' Erfolgen'), h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(240px,1fr))' }, ACHIEVEMENTS.map(a => h('div', { class: 'card achv' + (got.has(a.id) ? ' on' : '') }, h('div', { class: 'ic' }, got.has(a.id) ? a.icon : '🔒'), h('div', null, h('b', null, a.name), h('div', { class: 'muted', style: 'font-size:.85rem' }, a.desc))))));
    }
  };
}
