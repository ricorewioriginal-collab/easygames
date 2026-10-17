// Figureninfo: Persönlichkeit, Fähigkeiten, Beziehungen, Beruf/Schule, Lebensziel und Geschichte, Inventar, Tagebuch.
import { SKILLS, ASPIRATIONS, traitById, SKILL_XP, skillLevel } from '../data/traits';
import type { SkillId } from '../data/types';
import { itemDef } from '../sim/game';
import { AGE_NAMES } from '../sim/look';
import { careerDef, levelOf, promotionGaps, takeVacation, quitCareer, schoolGrade } from '../sim/career';
import { aspirationProgress, goalProgress, questOf, storyById } from '../sim/stories';
import { sellItem, sellValue, eatItem } from '../sim/world-sys';
import { WEEKDAYS_SHORT } from '../core/clock';
import { fmtMoney } from '../core/util';
import type { Sim } from '../sim/types';
import type { AppApi } from './api';
import { h, modal, tabs, bar, btn, toast, confirmDlg } from './dom';
import { EMO_ICONS, EMO_NAMES } from './hud';

const PRON: Record<Sim['pronoun'], string> = { sie: 'sie/ihr', er: 'er/ihm', they: 'they/dey' };

export function openSimInfo(app: AppApi, simId: string, tab = 'me'): void {
  const g = app.g;
  const s = g.sim(simId);
  if (!s) return;
  const own = g.isControllable(s) || (app.isGuest && g.activeSim === s.id);
  let m: { close: () => void } | null = null;
  const reopen = (t: string): void => {
    m?.close();
    openSimInfo(app, simId, t);
  };

  const me = (): Node => {
    const asp = ASPIRATIONS.find((a) => a.id === s.aspiration);
    return h(
      'div',
      { class: 'col' },
      h('div', { class: 'kv' }, h('span', null, 'Alter'), h('b', null, AGE_NAMES[s.age])),
      h('div', { class: 'kv' }, h('span', null, 'Pronomen'), h('b', null, PRON[s.pronoun])),
      h('div', { class: 'kv' }, h('span', null, 'Stimmung'), h('b', null, `${EMO_ICONS[s.emo] ?? ''} ${EMO_NAMES[s.emo] ?? ''}`)),
      h('div', { class: 'kv' }, h('span', null, 'Lebensziel'), h('b', null, asp ? `${asp.icon} ${asp.name}` : '–')),
      s.favFood ? h('div', { class: 'kv' }, h('span', null, 'Lieblingsessen'), h('b', null, s.favFood)) : null,
      h('h3', null, 'Merkmale'),
      h('div', { class: 'col' }, s.traits.map((t) => {
        const d = traitById(t);
        return h('div', { class: 'card' }, h('b', null, `${d.icon} ${d.name}`), h('div', { class: 'muted' }, d.desc));
      })),
      s.bio ? h('p', { class: 'muted' }, s.bio) : null,
    );
  };

  const skills = (): Node => {
    const list = (Object.keys(SKILLS) as SkillId[]).map((k) => {
      const xp = s.skills[k] ?? 0;
      const lv = skillLevel(xp);
      const a = SKILL_XP[lv] ?? 0,
        b = SKILL_XP[lv + 1] ?? a;
      const p = b > a ? ((xp - a) / (b - a)) * 100 : 100;
      return { k, lv, p, xp };
    });
    list.sort((x, y) => y.xp - x.xp);
    return h('div', { class: 'col' }, list.map((x) => h('div', null, h('div', { class: 'kv' }, h('span', null, `${SKILLS[x.k].icon} ${SKILLS[x.k].name}`), h('b', null, `Stufe ${x.lv}/10`)), bar(x.lv >= 10 ? 100 : x.p, 'xp'))), h('small', { class: 'muted' }, 'Fähigkeiten steigen durch passende Tätigkeiten. Stimmungen wie „Inspiriert“ oder „Konzentriert“ helfen.'));
  };

  const rels = (): Node => {
    const out: { o: Sim; f: number; r: number; k?: string; h: string[] }[] = [];
    for (const [k, r] of g.rels) {
      if (!r.met) continue;
      const [a, b] = k.split('|');
      const oid = a === s.id ? b : b === s.id ? a : null;
      const o = g.sim(oid);
      if (o) out.push({ o, f: r.f, r: r.r, k: r.k, h: r.h });
    }
    out.sort((a, b) => b.f + b.r - (a.f + a.r));
    if (!out.length) return h('p', { class: 'muted' }, 'Noch niemanden kennengelernt. Geh raus und stell dich vor!');
    const kind = (x: (typeof out)[number]): string => (x.k === 'married' ? '💒 Ehe' : x.k === 'engaged' ? '💍 Verlobt' : x.k === 'partner' ? '💑 Partner' : x.k === 'ex' ? '💔 Ex' : g.isFamily(s, x.o) ? '👪 Familie' : x.f >= 60 ? '⭐ Gute Freundschaft' : x.f >= 40 ? '🤝 Freundschaft' : x.f <= -40 ? '⚡ Feindschaft' : x.f < 0 ? '😒 Unbeliebt' : '👋 Bekannt');
    return h('div', { class: 'col' }, out.slice(0, 40).map((x) => h('div', { class: 'card' },
      h('div', { class: 'row' }, h('b', { class: 'grow' }, `${x.o.first} ${x.o.last}`), h('small', null, kind(x))),
      h('div', { class: 'row' }, h('small', { style: 'width:80px' }, 'Freundschaft'), h('div', { class: 'grow' }, bar((x.f + 100) / 2, 'rel'))),
      x.r > 0 ? h('div', { class: 'row' }, h('small', { style: 'width:80px' }, 'Romantik'), h('div', { class: 'grow' }, bar(x.r, 'rom'))) : null,
      x.h[0] ? h('small', { class: 'muted' }, x.h[0]) : null,
      x.o.rt.spawned && !x.o.away ? btn('🎯 Zeigen', () => { app.focusOn(x.o.x, x.o.z); m?.close(); }, 'small') : null,
    )));
  };

  const job = (): Node => {
    if (s.school) {
      return h('div', { class: 'col' }, h('h3', null, '🏫 Grundschule & Gesamtschule Sonnenhain'), h('div', { class: 'kv' }, h('span', null, 'Unterricht'), h('b', null, 'Mo–Fr, 08:00–15:00')), h('div', { class: 'kv' }, h('span', null, 'Leistung'), h('b', null, schoolGrade(s.school.perf))), bar(s.school.perf), h('div', { class: 'kv' }, h('span', null, 'Hausaufgaben heute'), h('b', null, `${Math.round(s.school.hw * 100)} %`)), h('small', { class: 'muted' }, 'Pünktlich zur Schule gehen und Hausaufgaben machen verbessert die Note. Gute Laune hilft auch.'));
    }
    const cs = s.career;
    const c = careerDef(cs?.id);
    if (!cs || !c) return h('div', { class: 'col' }, h('p', null, 'Kein Job.'), own && (g.isAdult(s) || s.age === 'teen') ? btn('📱 Job suchen', () => { m?.close(); app.openPhone('jobs'); }, 'primary') : null);
    const lv = levelOf(s)!;
    const gaps = promotionGaps(g, s);
    const next = c.levels[cs.level + 1];
    return h(
      'div',
      { class: 'col' },
      h('h3', null, `${c.icon} ${c.name} – ${lv.title}`),
      h('p', { class: 'muted' }, c.desc),
      h('div', { class: 'kv' }, h('span', null, 'Stufe'), h('b', null, `${cs.level + 1} / ${c.levels.length}`)),
      h('div', { class: 'kv' }, h('span', null, 'Lohn'), h('b', null, `${lv.pay} RT pro Stunde`)),
      h('div', { class: 'kv' }, h('span', null, 'Arbeitszeit'), h('b', null, `${lv.days.map((d) => WEEKDAYS_SHORT[d]).join(', ')} · ${String(lv.start).padStart(2, '0')}:00–${String((lv.start + lv.hours) % 24).padStart(2, '0')}:00`)),
      h('div', { class: 'kv' }, h('span', null, 'Arbeitsort'), h('b', null, g.lotName(c.lot) + (c.active ? ' (Schicht vor Ort spielbar)' : ''))),
      h('div', { class: 'kv' }, h('span', null, 'Leistung'), h('b', null, `${Math.round(Math.max(0, cs.perf))} %`)),
      bar(Math.max(0, cs.perf)),
      h('div', { class: 'kv' }, h('span', null, 'Urlaubstage'), h('b', null, String(cs.vac))),
      next ? h('p', null, `Nächste Stufe: ${next.title} (${next.pay} RT/Std.)`, gaps.length ? h('br') : null, gaps.length ? h('small', { class: 'muted' }, 'Dafür fehlt: ' + gaps.map((x) => `${SKILLS[x.skill].name} ${x.have}→${x.need}`).join(', ')) : null) : h('p', null, '🏆 Höchste Stufe erreicht!'),
      own
        ? h('div', { class: 'row' },
            btn('🏖️ Urlaubstag nehmen', () => {
              const r = takeVacation(g, s);
              toast(r === true ? 'Urlaubstag eingetragen.' : r, r === true ? '🏖️' : '⚠️', r === true ? 'good' : 'warn');
              reopen('job');
            }),
            btn('📦 Kündigen', () => confirmDlg('Kündigen?', `${s.first} verlässt den Job als ${lv.title}.`, 'Kündigen', () => { quitCareer(g, s); reopen('job'); }), 'danger'),
          )
        : null,
    );
  };

  const goals = (): Node => {
    const asp = ASPIRATIONS.find((a) => a.id === s.aspiration);
    const parts: Node[] = [];
    if (asp) {
      parts.push(h('h3', null, `${asp.icon} Lebensziel: ${asp.name}`), h('p', { class: 'muted' }, asp.desc));
      asp.goals.forEach((goal, i) => {
        const p = Math.min(goal.n, aspirationProgress(g, s, goal));
        const done = i < s.aspStep;
        parts.push(h('div', { class: `card ${i === s.aspStep ? 'sel' : ''}` }, h('div', { class: 'row' }, h('span', null, done ? '✅' : i === s.aspStep ? '🎯' : '🔒'), h('span', { class: 'grow' }, goal.label)), i === s.aspStep ? bar((p / goal.n) * 100) : null));
      });
    }
    const st = storyById(g.story?.id);
    const q = questOf(g);
    if (st && g.story) {
      parts.push(h('h3', { style: 'margin-top:12px' }, `${st.icon} Geschichte: ${st.title}`));
      if (g.story.finished) parts.push(h('p', null, '🏆 Abgeschlossen! Das Leben geht frei weiter.'));
      else if (q) {
        parts.push(h('b', null, q.title));
        parts.push(h('p', { class: 'muted' }, q.intro));
        for (const goal of q.goals) {
          const p = Math.min(goal.n, Math.floor(goalProgress(g, goal)));
          parts.push(h('div', { class: 'card' }, h('div', { class: 'row' }, h('span', null, p >= goal.n ? '✅' : '▫️'), h('span', { class: 'grow' }, goal.label), h('small', null, `${p}/${goal.n}`)), bar((p / goal.n) * 100)));
        }
        parts.push(h('small', { class: 'muted' }, `Erledigt: ${g.story.done.length} von ${st.quests.length} Aufgaben (mit Verzweigungen)`));
      }
    }
    return h('div', { class: 'col' }, parts);
  };

  const inv = (): Node => {
    const ids = Object.keys(s.inv).filter((k) => (s.inv[k] ?? 0) > 0);
    if (!ids.length) return h('p', { class: 'muted' }, 'Das Inventar ist leer. Angeln, Gärtnern, Malen oder Einkaufen füllt es.');
    return h('div', { class: 'col' }, ids.map((id) => {
      const it = itemDef(id);
      if (!it) return null;
      const v = sellValue(g, s, id);
      return h('div', { class: 'card row' }, h('span', { style: 'font-size:1.6em' }, it.icon), h('div', { class: 'grow' }, h('b', null, `${it.name} ×${s.inv[id]}`), h('div', null, h('small', { class: 'muted' }, v ? `Verkaufswert ${fmtMoney(v)}` : ''))),
        own && it.hunger ? btn('Essen', () => { eatItem(g, s, id); reopen('inv'); }, 'small') : null,
        own && v > 0 ? btn('Verkaufen', () => { const got = sellItem(g, s, id, 1); toast(`Verkauft für ${fmtMoney(got)}.`, '💶', 'good'); app.sfx('coin'); reopen('inv'); }, 'small') : null);
    }));
  };

  const diary = (): Node => {
    if (!s.mem.length) return h('p', { class: 'muted' }, 'Noch keine Einträge.');
    return h('div', { class: 'col' }, s.mem.slice(0, 50).map((e) => h('div', { class: `kv ${e.big ? '' : 'muted'}` }, h('span', null, `${e.i} ${e.t}`), h('small', null, `Tag ${e.d + 1}`))));
  };

  const t = tabs(
    [
      { id: 'me', label: 'Ich', render: me },
      { id: 'skills', label: 'Fähigkeiten', render: skills },
      { id: 'rels', label: 'Beziehungen', render: rels },
      { id: 'job', label: s.school ? 'Schule' : 'Beruf', render: job },
      { id: 'story', label: 'Ziele', render: goals },
      { id: 'inv', label: 'Inventar', render: inv },
      { id: 'diary', label: 'Tagebuch', render: diary },
    ],
    tab,
  );
  m = modal({ title: `${s.first} ${s.last}`, icon: EMO_ICONS[s.emo] ?? '🙂', body: t, wide: true });
}
