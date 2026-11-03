import { describe, it, expect } from 'vitest';
import * as C from '../src/core.js';

describe('Geschichte', () => {
  it('hat 16 Kapitel mit gültigen Spielen und Figuren', () => {
    expect(C.CHAPTERS.length).toBe(16);
    for (const c of C.CHAPTERS) {
      for (const id of c.cast) expect(C.PEOPLE[id], id).toBeTruthy();
      expect(c.cast).toContain(c.player);
      if (c.game) expect(['beam', 'poster', 'booth', 'run', 'case']).toContain(c.game.k);
      for (const l of c.lines.concat(c.after || [])) expect(l[0] === '' || C.PEOPLE[l[0]], l[0]).toBeTruthy();
    }
  });
  it('Ablauf passt zu den Kapiteln', () => {
    expect(C.FLOW.length).toBe(C.CHAPTERS.length);
    C.FLOW.forEach((f, i) => { const c = C.CHAPTERS[i];
      expect(f.flow.includes('explore'), 'explore ' + i).toBe(!!c.goal); expect(f.flow.includes('game'), 'game ' + i).toBe(!!c.game);
      expect(f.flow.includes('choices'), 'choices ' + i).toBe(!!c.choices); expect(f.flow.includes('after'), 'after ' + i).toBe(!!c.after);
      for (const id of f.follow || []) expect(c.cast).toContain(id); });
  });
  it('Enden hängen am Prozentwert', () => {
    expect(C.ending(90).id).toBe('feuer'); expect(C.ending(60).id).toBe('fenster'); expect(C.ending(20).id).toBe('strahl');
    expect(C.glowPct(C.maxStoryGlow())).toBe(100);
  });
  it('Spielstand wird repariert', () => {
    const s = C.fixSave({ v: 1, best: { beam: [5] }, story: { resume: { i: 99 } } });
    expect(s.best.beam.length).toBe(5); expect(s.best.beam[0]).toBe(5); expect(s.story.resume).toBe(null);
    expect(C.fixSave(null).v).toBe(1);
  });
});

describe('Leuchtturm', () => {
  it('fängt Flaschen, wenn der Strahl sie trifft', () => {
    const s = C.newBeam(0);
    for (let i = 0; i < 80 * 30 && !s.over; i++) {
      const b = s.bottles[0] || s.ships[0]; if (b) C.beamAim(s, b.a, 1 / 30);
      C.beamTick(s, 1 / 30);
    }
    expect(s.over).toBe(true); expect(s.caught).toBeGreaterThan(5); expect(C.beamStars(s)).toBeGreaterThan(0);
  });
  it('ohne Zielen geht wenig', () => {
    const s = C.newBeam(1); s.angle = -1.25;
    for (let i = 0; i < 80 * 30; i++) C.beamTick(s, 1 / 30);
    expect(s.caught).toBeLessThan(s.total);
  });
});

describe('Plakat', () => {
  it('ist gemischt und lösbar', () => {
    for (let l = 0; l < 3; l++) {
      const s = C.newPoster(l); expect(C.posterSolved(s)).toBe(false);
      for (let i = 0; i < s.n; i++) {
        const j = s.perm.indexOf(i); if (j !== i) { C.posterPick(s, i); C.posterPick(s, j); }
        while (s.rot[i]) C.posterRotate(s, i);
      }
      expect(s.done).toBe(true); expect(C.posterStars(s)).toBeGreaterThan(0);
    }
  });
});

describe('Bude', () => {
  it('richtige Bestellung bringt Münzen', () => {
    const s = C.newBooth(0);
    for (let i = 0; i < 80 * 20 && !s.over; i++) {
      C.boothTick(s, 0.05);
      const o = s.q[0]; if (o) { C.boothClear(s); for (let k = 0; k < o.count; k++) C.boothFish(s, o.fish); if (o.onion) C.boothOnion(s); expect(C.boothServe(s)).toBe(true); }
    }
    expect(s.served).toBeGreaterThan(5); expect(s.wrong).toBe(0); expect(C.boothStars(s)).toBe(3);
  });
  it('falsche Bestellung zählt als Fehler', () => {
    const s = C.newBooth(1); while (!s.q.length) C.boothTick(s, 0.1);
    const o = s.q[0]; C.boothFish(s, C.FISH.find(f => f.id !== o.fish).id); expect(C.boothServe(s)).toBe(false); expect(s.wrong).toBe(1);
  });
});

describe('Deich-Lauf', () => {
  it('ein guter Läufer kommt ans Ziel', () => {
    for (let l = 0; l < 3; l++) {
      const s = C.newRun(l);
      for (let i = 0; i < 200 * 60 && !s.over; i++) {
        // einfacher Autopilot: nächstes Hindernis in der eigenen Spur ansehen
        const ahead = s.items.filter(it => it.type !== 'licht' && it.z > s.z && it.z < s.z + 7).sort((a, b) => a.z - b.z)[0];
        if (ahead) {
          const mine = ahead.lanes ? ahead.lanes.includes(s.lane) : ahead.lane === s.lane;
          if (mine) {
            if (ahead.type === 'moewe' && ahead.z - s.z < 2.5) C.runDuck(s);
            else if ((ahead.type === 'drift' || ahead.type === 'pfuetze') && ahead.z - s.z < 2.6) C.runJump(s);
            else if (ahead.type === 'welle' || ahead.type === 'bank') { const free = [-1, 0, 1].find(x => !(ahead.lanes || [ahead.lane]).includes(x) && !s.items.some(it => it.type !== 'licht' && (it.lanes || [it.lane]).includes(x) && Math.abs(it.z - ahead.z) < 4)); if (free !== undefined) C.runMove(s, Math.sign(free - s.lane)); }
          }
        }
        C.runTick(s, 1 / 60);
      }
      expect(s.won, 'Level ' + l).toBe(true);
    }
  });
});

describe('Fall 14', () => {
  it('braucht vier Beweise und die richtige Lösung', () => {
    const s = C.newCase(); expect(C.caseReady(s)).toBe(false);
    for (const c of C.CLUES.slice(0, 4)) C.caseFind(s, c.id);
    expect(C.caseReady(s)).toBe(true); expect(C.caseVerdict(s, 1).ok).toBe(false); expect(C.caseVerdict(s, 0).ok).toBe(true); expect(C.caseStars(s)).toBe(1);
  });
});
