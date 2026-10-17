// Stadtleben: Tagesabläufe der Bewohner (abstrakt), Erscheinen/Verschwinden in Sichtweite, Besuche, Feiern, Spaziergänger, Kolleg:innen.
import { lotById, LOTS } from '../data/lots';
import { lotEntrance, ROADS_H, ROADS_V, ROAD_END_X } from '../world/map';
import { def, type QCtx } from './interact';
import { isOpen } from './interactions';
import { nextActionUid, type Game } from './game';
import type { Sim } from './types';
import { careerDef } from './career';

/** von der KI gesteuerte Figur (kein Mitglied des aktiven Haushalts, kein Mehrspieler-Gast) */
export const isTownie = (g: Game, s: Sim): boolean => !g.isControllable(s) && !s.guest;

export function focusLot(g: Game): string {
  const a = g.active;
  if (a && !a.away && !a.trip) {
    const l = g.lotOf(a);
    if (l) return l;
  }
  return g.world.lotAt(g.focus.x, g.focus.z)?.id ?? '';
}

function spawnAt(g: Game, s: Sim, lot: string, arriving: boolean): void {
  const L = lotById(lot);
  if (!L) return;
  s.rt.spawned = true;
  s.queue = [];
  s.rt.path = null;
  s.rt.y = 0;
  s.l = 0;
  s.loc = lot;
  if (arriving) {
    const [ex, ez] = lotEntrance(lot);
    s.x = ex;
    s.z = ez;
    s.queue.push({ uid: nextActionUid(), def: 'goTo', phase: 'queued', t: 0, dur: 0, user: false, data: { lot } });
    return;
  }
  // irgendwo auf dem Grundstück (begehbar)
  for (let i = 0; i < 40; i++) {
    const x = L.x + g.rng.int(1, L.w - 2),
      z = L.z + g.rng.int(1, L.d - 2);
    if (g.world.cellWalkable(0, x, z)) {
      s.x = x + 0.5;
      s.z = z + 0.5;
      return;
    }
  }
  const [ex, ez] = lotEntrance(lot);
  s.x = ex;
  s.z = ez;
}

export function despawn(g: Game, s: Sim): void {
  s.rt.spawned = false;
  for (const q of s.queue) if (q.phase === 'perform') q.phase = 'done';
  s.queue = [];
  s.rt.path = null;
  s.rt.socialWith = null;
  s.rt.y = 0;
  g.release(s.id);
  delete s.flags.walker;
  delete s.flags.leaving;
}

function leave(_g: Game, s: Sim): void {
  if (s.flags.leaving) return;
  s.flags.leaving = 1;
  for (const q of s.queue) if (q.phase !== 'done') {
    q.phase = 'done';
    q.data = { ...(q.data ?? {}), cancelled: 1 };
  }
  s.queue.push({ uid: nextActionUid(), def: 'leaveLot', phase: 'queued', t: 0, dur: 0, user: false });
}

def({
  id: 'leaveLot', label: 'Geht', icon: '👋', on: 'self', hidden: true, auto: false,
  route: (c) => {
    const lot = c.g.lotOf(c.s);
    if (!lot) return null;
    const [ex, ez] = lotEntrance(lot);
    return { x: ex, z: ez, l: 0 };
  },
  dur: 0.3, anim: 'wave',
  done: (c) => {
    if (isTownie(c.g, c.s)) despawn(c.g, c.s);
  },
});

/** Arbeiten am Arbeitsplatz (sichtbare Kolleg:innen) */
def({
  id: 'npcWork', label: 'Arbeitet', icon: '💼', on: 'obj', hidden: true, func: ['register', 'espresso', 'examtable', 'medcabinet', 'radiodesk', 'mixer', 'computer', 'bar', 'shelfshop', 'blackboard', 'desk'], slot: 'any',
  advFn: (c: QCtx) => (c.s.flags.atWork && c.o && c.o.lot === c.g.lotOf(c.s) ? 55 : -100),
  avail: (c: QCtx) => (c.s.flags.atWork && isTownie(c.g, c.s) ? true : false),
  dur: 25,
  anim: (c) => {
    const f = c.o ? (c.g.world.objs.get(c.o.id) ? c.o.def : '') : '';
    return f.includes('kasse') || f.includes('bartheke') || f.includes('laden') ? 'register' : f.includes('liege') ? 'examine' : f.includes('moderation') ? 'mic' : f.includes('siebtraeger') ? 'cook' : f.includes('tafel') ? 'talk' : 'type';
  },
});

/** Besuch einladen (Handy) oder spontan */
export function startVisit(g: Game, s: Sim, lot: string, minutes: number, announce = true): boolean {
  if (s.away || s.trip || !isTownie(g, s) || s.age === 'baby') return false;
  s.visit = { lot, until: g.clock.min + minutes };
  s.loc = lot;
  if (focusLot(g) === lot) spawnAt(g, s, lot, true);
  if (announce) g.notify(`${s.first} ${s.last} kommt zu Besuch.`, '🚪', s.id, 'info');
  g.bus.emit('visit', { sim: s.id, lot });
  return true;
}
export function endVisit(g: Game, s: Sim): void {
  s.visit = undefined;
  s.loc = s.home;
  if (s.rt.spawned) leave(g, s);
}

/** Feier: bis zu sechs Bekannte kommen für drei Stunden */
export function throwParty(g: Game): string | true {
  const h = g.hh;
  const a = g.active;
  if (!h?.lot || !a) return 'Kein Zuhause';
  const key = `party:${h.id}:${g.clock.day}`;
  if (!g.money(h.id, -80, 'Feier: Snacks und Deko', key)) return 'Feier kostet 80 RT (eine pro Tag)';
  const guests = g.known(a).filter((x) => isTownie(g, x) && !x.away && x.age !== 'baby' && x.age !== 'toddler').sort((x, y) => (g.peekRel(a.id, y.id)?.f ?? 0) - (g.peekRel(a.id, x.id)?.f ?? 0));
  let n = 0;
  for (const s of guests) if (n < 6 && startVisit(g, s, h.lot, 180, false)) n++;
  if (!n) {
    // niemand kommt: Geld zurück, später am Tag erneut versuchbar
    g.money(h.id, 80, 'Feier abgesagt: Erstattung');
    h.booked = h.booked.filter((k) => k !== key);
    return 'Niemand hat Zeit – erst ein paar Leute kennenlernen';
  }
  g.flags.partyUntil = g.clock.min + 180;
  g.flags.partyLot = 1;
  for (const m of g.members()) g.addMood(m, 'partyfun', { hours: 3 });
  g.notify(`Feier! ${n} Gäste sind eingeladen.`, '🎉', undefined, 'good');
  g.bus.emit('interaction', { sim: a.id, id: 'party' });
  return true;
}

/** Wunsch-Aufenthaltsort eines Stadtbewohners zur aktuellen Stunde */
function plan(g: Game, s: Sim): string {
  const now = g.clock.min;
  if (s.visit) return s.visit.lot;
  const h = g.clock.hour;
  const home = s.home || g.homeLotOf(s) || '';
  if (h >= 22.5 || h < 7) return home;
  if ((s.flags.outUntil ?? 0) > now && s.loc) return s.loc;
  const wkend = g.clock.weekday >= 5;
  let p = 0.3 + (wkend ? 0.15 : 0);
  if (g.hasTrait(s, 'social')) p += 0.15;
  if (g.hasTrait(s, 'loner')) p -= 0.15;
  if (s.age === 'child' || s.age === 'toddler') p *= 0.6;
  if (g.weather.now === 'storm') p *= 0.3;
  else if (g.weather.now === 'rain' || g.weather.now === 'snow') p *= 0.7;
  if (!g.rng.chance(p)) return home;
  const opts = (s.hangouts.length ? s.hangouts : LOTS.filter((l) => l.kind !== 'home').map((l) => l.id)).filter((id) => {
    const L = lotById(id);
    return L && (!L.open || isOpen(g, L.open));
  });
  if (!opts.length) return home;
  s.flags.outUntil = now + g.rng.int(60, 200);
  return g.rng.pick(opts);
}

function spawnedCount(g: Game): number {
  let n = 0;
  for (const s of g.sims.values()) if (s.rt.spawned && isTownie(g, s)) n++;
  return n;
}

/** Spaziergänger auf den Gehwegen in der Nähe des Fokus */
function walkers(g: Game): void {
  let n = 0;
  for (const s of g.sims.values()) if (s.flags.walker) n++;
  if (n >= 3 || spawnedCount(g) >= g.settings.maxNpcs) return;
  const h = g.clock.hour;
  if (h < 7 || h > 22) return;
  const pool = [...g.sims.values()].filter((s) => isTownie(g, s) && !s.rt.spawned && !s.away && !s.visit && s.loc.startsWith('apt-') && s.age !== 'baby' && s.age !== 'toddler');
  if (!pool.length) return;
  const s = g.rng.pick(pool);
  // Gehweg-Abschnitt nahe dem Fokus (2 Kacheln neben jeder Straße)
  const segs: [number, number, number, number][] = [];
  const fx = g.focus.x,
    fz = g.focus.z;
  for (const [a] of ROADS_H)
    for (const z of [a - 1, a + 5])
      if (Math.abs(z - fz) < 35) segs.push([Math.max(1, fx - 30), z + 0.5, Math.min(ROAD_END_X - 1, fx + 30), z + 0.5]);
  for (const [a] of ROADS_V)
    for (const x of [a - 1, a + 5])
      if (Math.abs(x - fx) < 35) segs.push([x + 0.5, Math.max(1, fz - 30), x + 0.5, Math.min(98, fz + 30)]);
  if (!segs.length) return;
  const sg = g.rng.pick(segs);
  const fwd = g.rng.chance(0.5);
  const [ax, az, bx, bz] = fwd ? sg : [sg[2], sg[3], sg[0], sg[1]];
  if (!g.world.cellWalkable(0, Math.floor(ax), Math.floor(az)) || !g.world.cellWalkable(0, Math.floor(bx), Math.floor(bz))) return;
  s.rt.spawned = true;
  s.flags.walker = 1;
  s.x = ax;
  s.z = az;
  s.l = 0;
  s.queue = [{ uid: nextActionUid(), def: 'walkHere', phase: 'queued', t: 0, dur: 0, user: false, data: { x: bx, z: bz, l: 0 } }];
}

export function installNpcs(g: Game): void {
  g.systems.push({
    name: 'npcs',
    minute: (g2) => {
      const focus = focusLot(g2);
      let count = spawnedCount(g2);
      const now = g2.clock.min;
      for (const s of g2.sims.values()) {
        if (!isTownie(g2, s)) continue;
        // Besuch vorbei?
        if (s.visit && now >= s.visit.until) endVisit(g2, s);
        // Kolleg:innen an aktiven Arbeitsplätzen sichtbar machen
        const cd = careerDef(s.career?.id);
        if (s.away?.kind === 'work' && cd?.active && cd.lot === focus && now < s.away.until - 10 && count < g2.settings.maxNpcs) {
          s.visit = { lot: cd.lot, until: s.away.until };
          s.away = null;
          s.flags.atWork = 1;
          spawnAt(g2, s, cd.lot, false);
          s.outfit = 'work';
          count++;
          continue;
        }
        if (s.flags.atWork && (!s.visit || now >= s.visit.until || s.career?.shift === null)) {
          delete s.flags.atWork;
          s.outfit = 'everyday';
        }
        if (s.flags.walker) {
          if (!s.queue.length || s.away) despawn(g2, s);
          continue;
        }
        const want = !s.away && !s.trip && !!focus && s.loc === focus;
        if (want && !s.rt.spawned && count < g2.settings.maxNpcs) {
          spawnAt(g2, s, focus, !!s.flags.arriving);
          delete s.flags.arriving;
          count++;
        } else if (!want && s.rt.spawned) {
          if (s.away || g2.lotOf(s) !== focus) despawn(g2, s);
          else leave(g2, s);
          count--;
        }
      }
      if (now % 5 < 1) walkers(g2);
    },
    hourly: (g2) => {
      const focus = focusLot(g2);
      for (const s of g2.sims.values()) {
        if (!isTownie(g2, s) || s.away || s.trip) continue;
        if (s.rt.spawned && s.queue.length && s.queue[0]!.user) continue;
        const next = plan(g2, s);
        if (next !== s.loc) {
          if (next === focus) s.flags.arriving = 1;
          s.loc = next;
        }
      }
      // spontaner Besuch bei der aktiven Familie
      const h = g2.hh;
      const hr = g2.clock.hour;
      if (h?.lot && hr >= 10 && hr <= 19 && g2.rng.chance(0.12) && !g2.flags.partyUntil) {
        const a = g2.active;
        const friends = a ? g2.friends(a, 20).filter((x) => isTownie(g2, x) && !x.away && !x.visit) : [];
        if (friends.length) startVisit(g2, g2.rng.pick(friends), h.lot, g2.rng.int(90, 200));
      }
      if (g2.flags.partyUntil && g2.clock.min >= g2.flags.partyUntil) {
        delete g2.flags.partyUntil;
        delete g2.flags.partyLot;
        for (const m of g2.members()) g2.memory(m, 'Eine tolle Feier gegeben', '🎉', true);
      }
    },
  });
}
