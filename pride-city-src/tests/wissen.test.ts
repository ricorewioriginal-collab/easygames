import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { timeline, quizPool, todaysQuiz, quizReward, QUIZ, flags, PEOPLE } from '../src/game/wissen';
import { HIST_ORDER } from '../src/game/faden';
import { DRAG_HISTORY } from '../src/game/dragLook';

const LOCKED = HIST_ORDER.length + Object.keys(DRAG_HISTORY).length;

describe('Wissen', () => {
  it('Zeitleiste ist sortiert, Story-Karten erst nach dem Erleben offen', () => {
    const s = defaults(), tl = timeline(s);
    expect(tl.length).toBeGreaterThan(HIST_ORDER.length);
    for (let i = 1; i < tl.length; i++) expect(Number(tl[i].year?.match(/\d{4}/)?.[0] || 1920)).toBeGreaterThanOrEqual(Number(tl[i - 1].year?.match(/\d{4}/)?.[0] || 1920));
    expect(tl.filter((r) => !r.seen).length).toBe(LOCKED);
    s.flags.hist_k1 = true; expect(timeline(s).filter((r) => !r.seen).length).toBe(LOCKED - 1);
    s.flags.dwiss_race = true; expect(timeline(s).filter((r) => !r.seen).length).toBe(LOCKED - 2);
  });
  it('Quiz: Fragen zu Story-Karten erst nach der Karte, Antworten gültig, Belohnung einmal am Tag', () => {
    const s = defaults();
    for (const q of QUIZ) { expect(q.a[q.ok]).toBeTruthy(); expect(new Set(q.a).size).toBe(q.a.length); }
    expect(quizPool(s).some((q) => q.need)).toBe(false);
    s.flags.hist_k1 = true; expect(quizPool(s).some((q) => q.need === 'k1')).toBe(true);
    const qs = todaysQuiz(s); expect(qs.length).toBe(3); expect(new Set(qs).size).toBe(3);
    expect(todaysQuiz(s)).toEqual(qs);
    const g = s.glitter;
    expect(quizReward(s, 3)).toEqual({ glitter: 15, rep: 2 }); expect(s.glitter).toBe(g + 15);
    expect(quizReward(s, 3)).toEqual({ glitter: 0, rep: 0 });
  });
  it('Flaggen und Persönlichkeiten haben Texte', () => {
    expect(flags().length).toBeGreaterThanOrEqual(10);
    for (const p of PEOPLE) expect(p.text.length).toBeGreaterThan(40);
  });
});
