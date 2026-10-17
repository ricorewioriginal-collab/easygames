// Berufe und Schule: Schichtplan, Arbeitsweg, aktive Schichten vor Ort (Café, Klinik, Radio), Lohn ohne Doppelbuchung,
// Leistung, Beförderung, Kündigung, Urlaub. Schule für Kinder und Jugendliche.
import { CAREERS } from '../data/careers';
import { SKILLS } from '../data/traits';
import { lotById } from '../data/lots';
import type { CareerDef, CareerLevel, SkillId } from '../data/types';
import { AGE_STAGES } from '../data/types';
import { lotEntrance } from '../world/map';
import { def, idef, type Ctx, type QCtx } from './interact';
import { mayUse } from './interactions';
import { nextActionUid, type Game } from './game';
import type { Sim } from './types';

export const careerDef = (id: string | undefined): CareerDef | undefined => CAREERS.find((c) => c.id === id);
export function levelOf(s: Sim): CareerLevel | undefined {
  const c = careerDef(s.career?.id);
  return c?.levels[Math.min(s.career!.level, c.levels.length - 1)];
}
export const SCHOOL_LOT = 'sh-schule';
export const SCHOOL_START = 8;
export const SCHOOL_END = 15;

/** Arbeitet die Figur an diesem Spieltag? */
export function worksOn(s: Sim, day: number): boolean {
  const lv = levelOf(s);
  return !!lv && !!s.career && lv.days.includes(day % 7) && s.career.offDay !== day;
}
export function shiftWindow(s: Sim, day: number): [number, number] | null {
  const lv = levelOf(s);
  if (!lv) return null;
  const a = day * 1440 + lv.start * 60;
  return [a, a + lv.hours * 60];
}

/** Lernziele für die nächste Beförderung (fehlende Fähigkeiten) */
export function promotionGaps(g: Game, s: Sim): { skill: SkillId; need: number; have: number }[] {
  const c = careerDef(s.career?.id);
  if (!c || !s.career) return [];
  const next = c.levels[s.career.level + 1];
  if (!next?.req) return [];
  const out: { skill: SkillId; need: number; have: number }[] = [];
  for (const [k, v] of Object.entries(next.req) as [SkillId, number][]) {
    const have = g.skillLv(s, k);
    if (have < v) out.push({ skill: k, need: v, have });
  }
  return out;
}

export function canJoin(g: Game, s: Sim, id: string): true | string {
  const c = careerDef(id);
  if (!c) return 'Unbekannter Beruf';
  if (AGE_STAGES.indexOf(s.age) < AGE_STAGES.indexOf(c.minAge)) return c.minAge === 'teen' ? 'Erst ab dem Jugendalter' : 'Erst für Erwachsene';
  if (c.minAge === 'teen' && s.age !== 'teen' && id === 'nebenjob') return 'Nur für Jugendliche';
  if (s.career?.id === id) return 'Schon in diesem Beruf';
  void g;
  return true;
}

export function joinCareer(g: Game, s: Sim, id: string, level = 0): boolean {
  if (canJoin(g, s, id) !== true) return false;
  const c = careerDef(id)!;
  s.career = { id, level: Math.min(level, c.levels.length - 1), perf: 30, shifts: 0, missed: 0, vac: 3, sick: 0, shift: null, onSite: false, tasks: 0, paidKey: '', offDay: -1 };
  g.memory(s, `Neuer Job: ${c.levels[s.career.level]!.title} (${c.name})`, c.icon, true);
  if (g.isControllable(s)) g.notify(`${s.first} arbeitet jetzt als ${c.levels[s.career.level]!.title}.`, c.icon, s.id, 'good');
  g.bus.emit('career', { sim: s.id, career: id, level: s.career.level + 1, kind: 'join' });
  return true;
}

export function quitCareer(g: Game, s: Sim): void {
  if (!s.career) return;
  const id = s.career.id;
  if (s.career.shift !== null) endShift(g, s, true);
  s.career = null;
  g.bus.emit('career', { sim: s.id, career: id, level: 0, kind: 'quit' });
  g.memory(s, 'Job gekündigt', '📦');
}

/** Urlaubstag am nächsten Arbeitstag nehmen */
export function takeVacation(g: Game, s: Sim): string | true {
  if (!s.career) return 'Kein Job';
  if (s.career.vac <= 0) return 'Keine Urlaubstage mehr';
  for (let d = g.clock.day + (g.clock.hour >= (levelOf(s)?.start ?? 9) ? 1 : 0); d < g.clock.day + 8; d++)
    if (worksOn(s, d)) {
      s.career.offDay = d;
      s.career.vac--;
      return true;
    }
  return 'Kein Arbeitstag in Sicht';
}

function startShift(g: Game, s: Sim): void {
  const c = careerDef(s.career?.id);
  const win = shiftWindow(s, g.clock.day);
  if (!c || !s.career || !win) return;
  if (g.clock.min >= win[1]) return;
  s.career.shift = Math.max(g.clock.min, win[0] - 30);
  s.career.tasks = 0;
  s.outfit = 'work';
  if (c.active && g.isControllable(s)) {
    s.career.onSite = true;
    s.loc = c.lot;
    g.notify(`${s.first} ist bei der Arbeit (${c.name}). Erledige Aufgaben für eine gute Leistung!`, c.icon, s.id, 'info');
  } else {
    s.career.onSite = false;
    s.away = { kind: 'work', until: win[1], lot: c.lot };
    s.rt.path = null;
    if (g.isControllable(s) && c.shiftEvents.length) s.flags.shiftEv = g.rng.int(0, c.shiftEvents.length - 1) + 1;
  }
}

function moodPerf(g: Game, s: Sim): number {
  const m = g.mood(s);
  return m > 40 ? 6 : m > 0 ? 3 : m > -40 ? -2 : -6;
}

export function endShift(g: Game, s: Sim, early = false): void {
  const c = careerDef(s.career?.id);
  const lv = levelOf(s);
  const cs = s.career;
  if (!c || !lv || !cs || cs.shift === null) return;
  const win = shiftWindow(s, Math.floor(cs.shift / 1440)) ?? [cs.shift, cs.shift + lv.hours * 60];
  const worked = Math.max(0, Math.min(g.clock.min, win[1]) - Math.max(cs.shift, win[0])) / 60;
  const hours = Math.min(lv.hours, Math.round(worked * 4) / 4);
  let dPerf = moodPerf(g, s);
  if (c.active && cs.onSite) {
    const goal = Math.max(3, Math.round(lv.hours * 0.8));
    dPerf += Math.round((cs.tasks / goal) * 16) - 6;
  } else dPerf += 6;
  if (early) dPerf -= 10;
  cs.perf = Math.max(-50, Math.min(120, cs.perf + dPerf));
  const pay = Math.round(lv.pay * hours * (0.9 + Math.max(0, cs.perf) / 500));
  const key = `pay:${s.id}:${Math.floor(cs.shift / 1440)}`;
  if (pay > 0 && s.hh && g.money(s.hh, pay, `Lohn ${c.name} (${hours} Std.)`, key)) {
    cs.paidKey = key;
    g.bus.emit('work', { sim: s.id, career: c.id, pay });
    if (g.isControllable(s)) g.notify(`${s.first} hat ${pay} RT verdient${early ? ' (früher gegangen)' : ''}. Leistung: ${Math.round(Math.max(0, cs.perf))} %`, '💶', s.id, early ? 'warn' : 'good');
  }
  cs.shifts++;
  cs.shift = null;
  cs.onSite = false;
  cs.tasks = 0;
  if (s.outfit === 'work') s.outfit = 'everyday';
  if (s.away?.kind === 'work') {
    // zurück: vor der Arbeitsstätte absetzen, dann nach Hause
    s.away = null;
    const [ex, ez] = lotEntrance(c.lot);
    s.x = ex;
    s.z = ez;
    s.l = 0;
    s.loc = c.lot;
    if (g.homeLotOf(s)) g.queueAction(s, 'goHome', { user: false });
  } else if (g.isControllable(s) && !early && g.homeLotOf(s) && g.lotOf(s) !== g.homeLotOf(s)) g.queueAction(s, 'goHome', { user: false });
  if (cs.perf >= 90) {
    if (!g.flags.starworker) g.bus.emit('flag', { id: 'starworker' });
    g.flags.starworker = 1;
  }
  checkPromotion(g, s);
}

export function checkPromotion(g: Game, s: Sim): void {
  const c = careerDef(s.career?.id);
  const cs = s.career;
  if (!c || !cs) return;
  if (cs.perf >= 100 && cs.level < c.levels.length - 1) {
    const gaps = promotionGaps(g, s);
    if (!gaps.length) promote(g, s);
    else {
      cs.perf = 100;
      if (g.isControllable(s) && !s.flags[`gapNote${cs.level}`]) {
        s.flags[`gapNote${cs.level}`] = 1;
        g.notify(`${s.first} ist bereit für die Beförderung – es fehlt noch: ${gaps.map((x) => `${SKILLS[x.skill].name} ${x.need}`).join(', ')}.`, '📈', s.id, 'info');
      }
    }
  }
  if (cs.perf <= -40 || (cs.missed >= 3 && cs.perf <= 0)) fire(g, s);
}

export function promote(g: Game, s: Sim): void {
  const c = careerDef(s.career?.id);
  const cs = s.career;
  if (!c || !cs || cs.level >= c.levels.length - 1) return;
  cs.level++;
  cs.perf = 35;
  cs.missed = 0;
  const lv = c.levels[cs.level]!;
  g.addMood(s, 'promoted');
  g.memory(s, `Beförderung: ${lv.title}`, '🎉', true);
  if (s.hh) g.money(s.hh, lv.pay * 4, `Beförderungsprämie ${c.name}`, `promo:${s.id}:${c.id}:${cs.level}`);
  if (g.isControllable(s)) g.notify(`Beförderung! ${s.first} ist jetzt ${lv.title}. Neuer Lohn: ${lv.pay} RT/Std.`, '🎉', s.id, 'good');
  g.bus.emit('career', { sim: s.id, career: c.id, level: cs.level + 1, kind: 'promote' });
}

function fire(g: Game, s: Sim): void {
  const c = careerDef(s.career?.id);
  if (!c || !s.career) return;
  if (s.career.level > 0 && s.career.perf > -60) {
    // erst Herabstufung
    s.career.level--;
    s.career.perf = 20;
    s.career.missed = 0;
    g.addMood(s, 'demoted');
    if (g.isControllable(s)) g.notify(`${s.first} wurde herabgestuft. Pünktlich sein und gute Laune helfen!`, '📉', s.id, 'bad');
    g.bus.emit('career', { sim: s.id, career: c.id, level: s.career.level + 1, kind: 'demote' });
    return;
  }
  s.career = null;
  g.addMood(s, 'fired');
  g.memory(s, `Job verloren (${c.name})`, '📦', true);
  if (g.isControllable(s)) g.notify(`${s.first} wurde entlassen. Über das Handy kann ein neuer Job gesucht werden.`, '📦', s.id, 'bad');
  g.bus.emit('career', { sim: s.id, career: c.id, level: 0, kind: 'fired' });
}

/** Schicht-Ereignis (passive Berufe) auswählen: Spieler entscheidet im Dialog */
export function resolveShiftEvent(g: Game, s: Sim, choice: number): string {
  const c = careerDef(s.career?.id);
  const ev = c?.shiftEvents[(s.flags.shiftEv ?? 1) - 1];
  delete s.flags.shiftEv;
  if (!c || !ev || !s.career) return '';
  const ch = ev.choices[choice] ?? ev.choices[0]!;
  let perf = ch.perf;
  if (ch.skill) {
    const lv = g.skillLv(s, ch.skill);
    if (lv < 2 && perf > 0 && g.rng.chance(0.35)) perf = Math.round(perf / 3);
    g.addSkill(s, ch.skill, 25);
  }
  s.career.perf = Math.max(-50, Math.min(120, s.career.perf + perf));
  return ch.result.replaceAll('{name}', s.first);
}

// ---------- Schule ----------
export function schoolGrade(perf: number): string {
  return perf >= 90 ? '1 (sehr gut)' : perf >= 75 ? '2 (gut)' : perf >= 55 ? '3 (befriedigend)' : perf >= 35 ? '4 (ausreichend)' : perf >= 15 ? '5 (mangelhaft)' : '6 (ungenügend)';
}
export function ensureSchool(s: Sim): void {
  if ((s.age === 'child' || s.age === 'teen') && !s.school) s.school = { perf: 50, hw: 0, attended: -1, in: false };
  if (s.age !== 'child' && s.age !== 'teen') s.school = null;
}

// ---------- Interaktionen ----------
def({
  id: 'goToWork', label: 'Zur Arbeit gehen', icon: '💼', on: 'self', ages: ['teen', 'youngadult', 'adult', 'senior'], auto: false, group: 'Ich',
  avail: (c) => {
    if (!c.s.career) return false;
    const win = shiftWindow(c.s, c.g.clock.day);
    if (!win || !worksOn(c.s, c.g.clock.day)) return 'Heute frei';
    if (c.g.clock.min < win[0] - 120) return 'Noch zu früh';
    if (c.g.clock.min >= win[1]) return 'Schicht schon vorbei';
    if (c.s.career.shift !== null) return 'Schon bei der Arbeit';
    return true;
  },
  route: (c) => {
    c.a.data = { ...(c.a.data ?? {}), lot: careerDef(c.s.career?.id)?.lot ?? '' };
    return idef('goTo')!.route!(c);
  },
  dur: 0.5, anim: 'wave',
  done: (c) => startShift(c.g, c.s),
});
def({
  id: 'leaveWork', label: 'Feierabend machen', icon: '🏁', on: 'self', ages: ['teen', 'youngadult', 'adult', 'senior'], auto: false, group: 'Ich',
  avail: (c) => (c.s.career?.onSite ? true : false),
  route: () => null, dur: 0.2, anim: 'wave',
  done: (c) => {
    const win = shiftWindow(c.s, c.g.clock.day);
    endShift(c.g, c.s, !!win && c.g.clock.min < win[1] - 15);
  },
});
def({
  id: 'goToSchool', label: 'Zur Schule gehen', icon: '🎒', on: 'self', ages: ['child', 'teen'], auto: false, group: 'Ich',
  avail: (c) => {
    if (!c.s.school) return false;
    if (c.g.clock.weekday >= 5) return 'Wochenende';
    if (c.g.clock.hour >= SCHOOL_END) return 'Schule ist aus';
    if (c.s.school.attended === c.g.clock.day) return 'Heute schon dort gewesen';
    return true;
  },
  route: (c) => {
    c.a.data = { ...(c.a.data ?? {}), lot: SCHOOL_LOT };
    return idef('goTo')!.route!(c);
  },
  dur: 0.5, anim: 'wave',
  done: (c) => {
    const s = c.s;
    if (!s.school) return;
    s.school.in = true;
    s.school.attended = c.g.clock.day;
    if (c.g.clock.hour > SCHOOL_START + 1) s.school.perf = Math.max(0, s.school.perf - 4);
    s.away = { kind: 'school', until: c.g.clock.day * 1440 + SCHOOL_END * 60, lot: SCHOOL_LOT };
    s.rt.path = null;
  },
});

// Arbeitsaufgaben aktiver Berufe (zählen für die Leistung)
interface TaskSpec { id: string; career: string; label: string; icon: string; func: string; dur: number; anim: Parameters<typeof def>[0]['anim']; skill: SkillId; slot: 'use' | 'sit' | 'near' | 'any'; prop?: string }
const TASKS: TaskSpec[] = [
  { id: 'workEspresso', career: 'gastro', label: 'Kaffeespezialität zubereiten', icon: '☕', func: 'espresso', dur: 8, anim: 'cook', skill: 'cooking', slot: 'near', prop: 'cup' },
  { id: 'workRegister', career: 'gastro', label: 'Gäste kassieren', icon: '💶', func: 'register', dur: 10, anim: 'register', skill: 'charisma', slot: 'use' },
  { id: 'workServe', career: 'gastro', label: 'Tische bedienen', icon: '🍰', func: 'table', dur: 6, anim: 'serve', skill: 'charisma', slot: 'near', prop: 'tray' },
  { id: 'workExamine', career: 'medizin', label: 'Patient:in untersuchen', icon: '🩺', func: 'examtable', dur: 14, anim: 'examine', skill: 'logic', slot: 'near' },
  { id: 'workMeds', career: 'medizin', label: 'Medikamente vorbereiten', icon: '💊', func: 'medcabinet', dur: 8, anim: 'serve', skill: 'logic', slot: 'use' },
  { id: 'workReception', career: 'medizin', label: 'Empfang übernehmen', icon: '📋', func: 'register', dur: 10, anim: 'register', skill: 'charisma', slot: 'use' },
  { id: 'workReport', career: 'medizin', label: 'Befunde schreiben', icon: '🗂️', func: 'computer', dur: 12, anim: 'type', skill: 'writing', slot: 'sit' },
  { id: 'workMic', career: 'medien', label: 'Live moderieren', icon: '🎙️', func: 'radiodesk', dur: 15, anim: 'mic', skill: 'charisma', slot: 'sit' },
  { id: 'workMix', career: 'medien', label: 'Musik mischen', icon: '🎚️', func: 'mixer', dur: 12, anim: 'dance', skill: 'music', slot: 'use' },
  { id: 'workResearch', career: 'medien', label: 'Beitrag recherchieren', icon: '📰', func: 'computer', dur: 12, anim: 'type', skill: 'writing', slot: 'sit' },
];
export const WORK_TASKS = TASKS;

for (const t of TASKS) {
  def({
    id: t.id, label: t.label, icon: t.icon, on: 'obj', func: [t.func], ages: ['teen', 'youngadult', 'adult', 'senior'], slot: t.slot, group: 'Arbeit', prop: t.prop,
    advFn: (c: QCtx) => (c.s.career?.onSite && c.s.career.id === t.career ? 70 - (c.s.career.tasks % 3) * 5 : -100),
    avail: (c: QCtx) => {
      const cs = c.s.career;
      if (!cs || cs.id !== t.career || !cs.onSite) return false;
      const lot = careerDef(cs.id)?.lot;
      if (!c.o || c.o.lot !== lot) return false;
      return mayUse(c.g, c.s, c.o) ? true : false;
    },
    dur: t.dur, anim: t.anim, skill: t.skill, xp: 1.4, rate: { fun: -0.15, energy: -0.08 }, busy: true,
    done: (c: Ctx) => {
      const cs = c.s.career;
      if (!cs) return;
      cs.tasks++;
      cs.perf = Math.min(120, cs.perf + 1.5 + c.g.skillLv(c.s, t.skill) * 0.2);
      c.g.bubble(c.s, '✅', 3);
    },
  });
}

// ---------- System ----------
export function installCareer(g: Game): void {
  g.systems.push({
    name: 'career',
    minute: (g2) => {
      const now = g2.clock.min;
      const day = g2.clock.day;
      for (const s of g2.sims.values()) {
        if (s.guest) continue;
        if (s.career) careerMinute(g2, s, now, day);
        if (s.school) schoolMinute(g2, s, now, day);
      }
    },
    daily: (g2) => {
      for (const s of g2.sims.values()) {
        ensureSchool(s);
        if (s.school) {
          const sc = s.school;
          const attendedYesterday = sc.attended === g2.clock.day - 1;
          const weekday = (g2.clock.day - 1) % 7 < 5;
          if (weekday) sc.perf = Math.max(0, Math.min(100, sc.perf + (attendedYesterday ? 2 : -10) + Math.round(sc.hw * 8) - 3 + (g2.mood(s) > 30 ? 2 : 0)));
          sc.hw = 0;
        }
        if (s.career && g2.clock.dayOfSeason === 0) {
          s.career.vac = Math.min(5, s.career.vac + 1);
          s.career.sick = 0;
        }
      }
    },
  });
}

function careerMinute(g: Game, s: Sim, now: number, day: number): void {
  const cs = s.career!;
  const c = careerDef(cs.id);
  const win = shiftWindow(s, day);
  if (!c || !win) return;
  // laufende Schicht beenden
  if (cs.shift !== null) {
    if (now >= win[1] && Math.floor(cs.shift / 1440) === day) return endShift(g, s);
    if (Math.floor(cs.shift / 1440) < day) return endShift(g, s);
    // aktive Schicht: Arbeitsplatz verlassen?
    if (cs.onSite && !s.trip && g.lotOf(s) !== c.lot) {
      s.flags.offSite = (s.flags.offSite ?? 0) + 1;
      if (s.flags.offSite > 20) {
        delete s.flags.offSite;
        endShift(g, s, true);
      }
    } else delete s.flags.offSite;
    return;
  }
  if (!worksOn(s, day) || now >= win[1]) return;
  const ctrl = g.isControllable(s);
  if (ctrl) {
    if (now >= win[0] - 60 && now < win[0] - 59) g.notify(`${s.first} muss in einer Stunde zur Arbeit (${c.name}, ${String(levelOf(s)!.start).padStart(2, '0')}:00).`, '⏰', s.id, 'info');
    const going = s.queue.some((q) => q.def === 'goToWork');
    const lead = Math.min(45, 15 + Math.round(distToWork(g, s) / 9));
    if (!going && now >= win[0] - lead && now < win[0] + 50 && !s.away && s.age !== 'baby') {
      const cur = s.queue[0];
      if (cur && !cur.user && cur.phase !== 'done') {
        cur.phase = 'done';
        cur.data = { ...(cur.data ?? {}), cancelled: 1 };
      }
      s.queue = s.queue.filter((q) => q.user || q === cur);
      s.queue.push({ uid: nextActionUid(), def: 'goToWork', phase: 'queued', t: 0, dur: 0, user: false });
    }
  } else if (now >= win[0] && !s.away && !s.trip) {
    // Stadtbewohner: unsichtbar zur Arbeit (Darstellung übernimmt npcs.ts)
    cs.shift = now;
    s.away = { kind: 'work', until: win[1], lot: c.lot };
    s.queue = [];
    s.visit = undefined;
    return;
  }
  // verpasst?
  if (now >= win[0] + 60 && s.flags.missDay !== day) {
    s.flags.missDay = day;
    cs.missed++;
    cs.perf -= 15;
    if (ctrl) g.notify(`${s.first} hat die Schicht verpasst! Leistung sinkt.`, '⚠️', s.id, 'bad');
    g.addMood(s, 'worried');
    checkPromotion(g, s);
  }
}

function distToWork(_g: Game, s: Sim): number {
  const lot = lotById(careerDef(s.career?.id)?.lot ?? '');
  if (!lot) return 0;
  return Math.hypot(lot.x + lot.w / 2 - s.x, lot.z + lot.d / 2 - s.z);
}

function schoolMinute(g: Game, s: Sim, now: number, day: number): void {
  const sc = s.school!;
  const wd = day % 7;
  const start = day * 1440 + SCHOOL_START * 60;
  const end = day * 1440 + SCHOOL_END * 60;
  if (s.away?.kind === 'school') {
    if (now >= end || now >= s.away.until) {
      // Schulbus bringt nach Hause
      s.away = null;
      sc.in = false;
      const home = g.homeLotOf(s);
      if (home) {
        const [ex, ez] = lotEntrance(home);
        s.x = ex;
        s.z = ez;
        s.l = 0;
        s.loc = home;
        if (g.isControllable(s)) g.notify(`${s.first} ist aus der Schule zurück. Hausaufgaben nicht vergessen!`, '🎒', s.id, 'info');
      }
      g.addSkill(s, 'logic', 20);
      g.addNeed(s, 'social', 25);
      g.addNeed(s, 'fun', -10);
    }
    return;
  }
  if (wd >= 5 || sc.attended === day) return;
  const ctrl = g.isControllable(s);
  if (ctrl) {
    if (now >= start - 40 && now < end - 120 && !s.away && !s.trip && !s.queue.some((q) => q.def === 'goToSchool')) {
      const cur = s.queue[0];
      if (cur && !cur.user && cur.phase !== 'done') {
        cur.phase = 'done';
        cur.data = { ...(cur.data ?? {}), cancelled: 1 };
      }
      s.queue.push({ uid: nextActionUid(), def: 'goToSchool', phase: 'queued', t: 0, dur: 0, user: false });
    }
    if (now >= start + 90 && s.flags.schoolMiss !== day && sc.attended !== day) {
      s.flags.schoolMiss = day;
      sc.perf = Math.max(0, sc.perf - 8);
      g.notify(`${s.first} hat die Schule geschwänzt.`, '🏫', s.id, 'warn');
    }
  } else if (now >= start && now < end && !s.away && !s.trip) {
    sc.attended = day;
    s.away = { kind: 'school', until: end, lot: SCHOOL_LOT };
    s.queue = [];
    s.visit = undefined;
  }
}
