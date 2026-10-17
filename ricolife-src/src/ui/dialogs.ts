// Spieldialoge: Zufallsereignisse, Geschichte (Einleitung, Abschluss, Verzweigung), Schicht-Ereignisse, Merkmalwahl.
import { TRAITS } from '../data/traits';
import { eventText, resolveEvent, storyById, storyContinue } from '../sim/stories';
import { careerDef, resolveShiftEvent } from '../sim/career';
import type { Sim } from '../sim/types';
import type { AppApi } from './api';
import { h, modal, btn, modalOpen } from './dom';

let busy = false;

/** prüft, ob ein Dialog anzuzeigen ist (einmal pro Frame aufrufen) */
export function pumpDialogs(app: AppApi): void {
  if (busy || modalOpen() || app.mode !== 'live') return;
  const g = app.g;
  if (app.isGuest) return;
  if (g.pendingStory) return storyDialog(app);
  if (g.pendingEvent) return eventDialog(app);
  for (const s of g.members()) {
    if (s.flags.shiftEv && s.away?.kind === 'work') return shiftDialog(app, s);
    if (s.flags.pickTrait) return traitDialog(app, s);
  }
}

function pauseWhile(app: AppApi): () => void {
  const g = app.g;
  const prev = g.clock.speed;
  if (!app.isHost) g.clock.speed = 0;
  busy = true;
  return () => {
    busy = false;
    if (!app.isHost && g.clock.speed === 0) g.clock.speed = prev || 1;
  };
}

function eventDialog(app: AppApi): void {
  const et = eventText(app.g);
  if (!et) {
    app.g.pendingEvent = null;
    return;
  }
  const done = pauseWhile(app);
  app.sfx('event');
  const m = modal({
    title: et.title,
    icon: et.ev.icon,
    locked: true,
    body: h('div', null, h('p', null, et.text), h('div', { class: 'col', style: 'margin-top:10px' }, et.ev.choices.map((c, i) => btn(c.label, () => {
      const res = resolveEvent(app.g, i);
      m.close();
      modal({ title: et.title, icon: et.ev.icon, body: h('p', null, res), buttons: [{ label: 'Weiter', cls: 'primary' }], onClose: done });
    }, 'warm')))),
  });
}

function storyDialog(app: AppApi): void {
  const g = app.g;
  const p = g.pendingStory!;
  const st = storyById(g.story?.id);
  const q = st?.quests.find((x) => x.id === p.quest);
  if (!st || !q) {
    g.pendingStory = null;
    return;
  }
  const done = pauseWhile(app);
  const mentor = g.sim(st.mentor);
  const who = mentor ? `${mentor.first} ${mentor.last}` : 'Jemand';
  app.sfx('event');
  if (p.kind === 'intro') {
    modal({ title: q.title, icon: st.icon, body: h('div', null, h('p', null, h('b', null, `${who}: `), `„${q.intro}“`), h('h3', null, 'Ziele'), h('ul', null, q.goals.map((goal) => h('li', null, goal.label)))), buttons: [{ label: 'Los geht’s!', cls: 'primary', onClick: () => storyContinue(g) }], onClose: () => { if (g.pendingStory === p) storyContinue(g); done(); } });
  } else if (p.kind === 'outro') {
    modal({ title: `Geschafft: ${q.title}`, icon: '🏆', body: h('p', null, h('b', null, `${who}: `), `„${q.outro}“`), buttons: [{ label: 'Weiter', cls: 'primary', onClick: () => storyContinue(g) }], onClose: () => { if (g.pendingStory === p) storyContinue(g); done(); } });
  } else if (p.kind === 'branch') {
    const m = modal({ title: `Geschafft: ${q.title}`, icon: '🏆', locked: true, body: h('div', null, h('p', null, h('b', null, `${who}: `), `„${q.outro}“`), h('h3', null, 'Wie geht es weiter?'), h('div', { class: 'col' }, (q.branch ?? []).map((b, i) => btn(b.label, () => { storyContinue(g, i); m.close(); done(); }, 'warm')))) });
  } else {
    modal({ title: `${st.title} – abgeschlossen!`, icon: '🎉', body: h('div', null, h('p', null, 'Herzlichen Glückwunsch! Die Geschichte ist zu Ende erzählt – aber das Leben in Lindenhafen geht weiter. Alle Freiheiten bleiben.'), h('p', { class: 'muted' }, st.summary)), buttons: [{ label: 'Weiterspielen', cls: 'primary', onClick: () => { g.pendingStory = null; } }], onClose: () => { g.pendingStory = null; done(); } });
  }
}

function shiftDialog(app: AppApi, s: Sim): void {
  const c = careerDef(s.career?.id);
  const ev = c?.shiftEvents[(s.flags.shiftEv ?? 1) - 1];
  if (!c || !ev) {
    delete s.flags.shiftEv;
    return;
  }
  const done = pauseWhile(app);
  const m = modal({
    title: `${s.first} bei der Arbeit`,
    icon: c.icon,
    locked: true,
    body: h('div', null, h('p', null, ev.text.replaceAll('{name}', s.first)), h('div', { class: 'col' }, ev.choices.map((ch, i) => btn(ch.label, () => {
      const res = resolveShiftEvent(app.g, s, i);
      m.close();
      modal({ title: c.name, icon: c.icon, body: h('p', null, res), buttons: [{ label: 'OK', cls: 'primary' }], onClose: done });
    }, 'warm')))),
  });
}

function traitDialog(app: AppApi, s: Sim): void {
  const done = pauseWhile(app);
  const opts = TRAITS.filter((t) => !s.traits.includes(t.id) && !(t.conflicts ?? []).some((c) => s.traits.includes(c)));
  const m = modal({
    title: `Neues Merkmal für ${s.first}`,
    icon: '✨',
    locked: true,
    body: h('div', null, h('p', null, `${s.first} ist älter geworden. Welches Merkmal prägt ${s.pronoun === 'er' ? 'ihn' : s.pronoun === 'sie' ? 'sie' : 'die Figur'} von nun an?`), h('div', { class: 'grid2' }, opts.map((t) => btn(h('span', null, `${t.icon} ${t.name}`), () => {
      if (s.traits.length < 3) s.traits.push(t.id);
      delete s.flags.pickTrait;
      m.close();
      done();
    }, '', { title: t.desc })))),
  });
}
