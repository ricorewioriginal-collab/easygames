/* AnMaCha UNDERCOVER 3D – Spuren für „Detektiv & Alibi“. Bei jedem Vorfall entstehen Spuren der im Fall aktiven Arten
   (data/cases.js). Die Werte stammen aus dem echten Partieverlauf (Positionsverlauf, Türen, Stationsnutzung, Aussehen),
   sind also logisch konsistent – aber jede Spur grenzt nur ein (keine automatische Täteranzeige). Verräter können eine
   begrenzte Zahl Spuren manipulieren (andere Person belasten); das hinterlässt manchmal selbst eine Spur. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  let nextId = 1;

  // ---------- Merkmalsklassen aus dem Aussehen ----------
  function sizeOf(look) {
    const C = AMU.COSMETICS, S = { kurz: 'S', mikro: 'S', kompakt: 'S', kid: 'S', kopfhoerer: 'S', rund: 'M', robo: 'L', gross: 'L', lang: 'L', langbeinig: 'L', schlank: 'M' };
    if (look && S[look.body]) return S[look.body];
    const i = C ? C.bodies.findIndex(b => b.id === (look && look.body)) : -1;
    return ['S', 'M', 'L'][(i >= 0 ? i : AMU.U.hash(String(look && look.body))) % 3];
  }
  function colorHex(look) {
    const C = AMU.COSMETICS; const c = C && C.colors.find(x => x.id === (look && look.color));
    return (c && c.hex) || (look && /^#/.test(look.color) ? look.color : '#888888');
  }
  function famOf(look) {
    const h = colorHex(look).replace('#', ''), r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (d < 0.18 || mx < 0.2) return 'neutral';
    let hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hue = (hue * 60 + 360) % 360;
    return hue < 70 || hue >= 290 ? 'warm' : 'kuehl';
  }
  function hairOf(look) {
    const id = String(look && look.hair || 'none');
    if (id === 'none' || id === 'glatze') return 'keine';
    return /kurz|irokese|stoppel|igel|undercut/.test(id) ? 'kurz' : 'lang';
  }
  function hatOf(look) { return look && look.hat && look.hat !== 'none' ? 'mit' : 'ohne'; }
  const CLASS = { schuh: sizeOf, faser: famOf, haar: hairOf, geraeusch: hatOf };
  const CLASS_TXT = {
    schuh: { S: 'kleine Schuhe (S)', M: 'mittlere Schuhe (M)', L: 'große Schuhe (L)' },
    faser: { warm: 'warmer Farbton (rot/orange/gelb/pink)', kuehl: 'kühler Farbton (grün/blau/lila)', neutral: 'neutraler Farbton (grau/weiß/schwarz/braun)' },
    haar: { keine: 'keine Haare', kurz: 'kurze Haare', lang: 'lange Haare' },
    geraeusch: { mit: 'mit Kopfbedeckung/Accessoire', ohne: 'ohne Kopfbedeckung' }
  };

  const Ev = {
    sizeOf, famOf, hairOf, hatOf, CLASS, CLASS_TXT,
    init(sim) {
      const r = sim.rng.fork('case');
      const c = AMU.CASES[sim.caseIdx != null ? sim.caseIdx : r.int(AMU.CASES.length)];
      let types = c.types === 'random5' ? r.shuffle(Object.keys(AMU.CLUE_TYPES)).slice(0, 5) : c.types.slice();
      if (!(sim.map.features || []).some(f => f.type === 'cams')) types = types.map(t => t === 'kamera' ? 'melder' : t).filter((t, i, a) => a.indexOf(t) === i);
      sim.ext.case = { id: c.id, n: c.n, intro: c.intro, twist: c.twist, types };
      sim.ext.spots = []; sim.ext.slog = [];
      sim.players.forEach(p => { p.casefile = []; if (p.team === 'traitor') p.tamper = c.twist === 'tamper' ? 3 : 2; });
    },
    stationUse(sim, p, sid) {
      if (!sim.ext.slog) return;
      sim.ext.slog.push({ pid: p.id, sid, t: sim.t, room: sim.grid.roomAt(sim.map.stations[sid].at[0], sim.map.stations[sid].at[1]) });
      if (sim.ext.slog.length > 300) sim.ext.slog.shift();
    },
    /** Wer war im Zeitfenster [t0, t1] im Raum (laut Verlauf, 1-s-Raster)? */
    inRoom(sim, room, t0, t1) {
      const out = new Set();
      sim.players.forEach(p => (sim.hist[p.id] || []).forEach(h => { if (h[0] >= t0 && h[0] <= t1 && h[1] === room) out.add(p.id); }));
      return out;
    },
    onKill(sim, killer, victim, body) {
      if (!sim.mode.flags.evidence || !sim.ext.case) return;
      const cs = sim.ext.case, r = sim.rng.fork('ev' + body.t), t = body.t, room = body.room;
      let types = cs.types.slice();
      if (cs.twist === 'many') types.push(r.pick(Object.keys(AMU.CLUE_TYPES).filter(x => !types.includes(x))));
      types = types.filter(Boolean);
      const look = killer.look;   // physische Spuren stammen vom echten Aussehen (auch beim Gestaltwandler)
      const shown = sim.publicPlayer(killer).id;
      types.forEach((type, k) => {
        let v;
        if (CLASS[type]) v = CLASS[type](look);
        else if (type === 'tuer') {
          // Raumwechsel in den/aus dem Tatraum in den 30 s davor
          const ids = new Set();
          sim.players.forEach(p => { const h = sim.hist[p.id] || []; for (let i = 1; i < h.length; i++) if (h[i][0] >= t - 30000 && h[i][0] <= t && h[i][1] !== h[i - 1][1] && (h[i][1] === room || h[i - 1][1] === room)) ids.add(p.id); });
          ids.delete(victim.id); v = Array.from(ids);
        } else if (type === 'kamera') {
          v = sim.players.filter(p => p !== victim && p.alive && sim.grid.roomAt(p.x, p.y) === room && !(p.hidden > sim.t)).map(p => sim.publicPlayer(p).id);
        } else if (type === 'zeit') v = Math.round((t - (sim.playStart || 0)) / 1000 + r.range(-6, 6));
        else if (type === 'zeuge') {
          const cand = sim.players.filter(p => p !== killer && p !== victim && sim.alive(p) && Math.hypot(p.x - body.x, p.y - body.y) < 12).sort((a, b) => Math.hypot(a.x - body.x, a.y - body.y) - Math.hypot(b.x - body.x, b.y - body.y));
          const w = cand[0] || sim.players.find(p => p !== killer && p !== victim && sim.alive(p));
          const rel = cs.twist === 'unreliable' ? 0.5 : 0.75;
          let who = shown;
          if (!r.chance(rel)) { const other = sim.players.filter(p => p !== victim && p !== killer && sim.alive(p) && p !== w); if (other.length) who = r.pick(other).id; }
          v = { by: w ? w.id : null, who, room };
        } else if (type === 'logbuch') {
          const ids = new Set(sim.ext.slog.filter(e => e.room === room && e.t >= t - 45000 && e.t <= t).map(e => e.pid)); ids.delete(victim.id); v = Array.from(ids);
        } else if (type === 'melder') {
          const ids = new Set();
          sim.players.forEach(p => { if (p === victim) return; (sim.hist[p.id] || []).forEach(h => { if (h[0] >= t - 30000 && h[0] <= t && Math.hypot(h[2] - body.x, h[3] - body.y) <= 5) ids.add(p.id); }); });
          v = Array.from(ids);
        }
        if (Array.isArray(v) && !v.includes(killer.id) && (type === 'melder') && r.chance(0.85)) v.push(killer.id);
        if (Array.isArray(v)) v = r.shuffle(v);
        const pos = Ev.spotPos(sim, body, type, k, r);
        sim.ext.spots.push({ id: nextId++, type, x: pos[0], y: pos[1], v, real: v, body: victim.id, t, room, tampered: false, mark: false, found: {} });
      });
      if (sim.ext.spots.length > 40) sim.ext.spots.splice(0, sim.ext.spots.length - 40);
    },
    spotPos(sim, body, type, k, r) {
      const g = sim.grid;
      if (type === 'tuer') { const d = g.doors.filter(x => x.room === body.room && x.gate == null).sort((a, b) => Math.hypot(a.x - body.x, a.y - body.y) - Math.hypot(b.x - body.x, b.y - body.y))[0]; if (d) return [d.x, d.y]; }
      for (let i = 0; i < 30; i++) {
        const a = r.range(0, Math.PI * 2), d = r.range(0.8, 2.6), x = body.x + Math.cos(a) * d, y = body.y + Math.sin(a) * d;
        if (!g.blocked(x, y) && g.los(body.x, body.y, x, y) && !sim.ext.spots.some(s => Math.hypot(s.x - x, s.y - y) < 0.8)) return [Math.floor(x) + 0.5, Math.floor(y) + 0.5];
      }
      return [body.x + 0.3 * k, body.y];
    },
    spotNear(sim, p) {
      return (sim.ext.spots || []).find(s => !s.found[p.id] && Math.hypot(s.x - p.x, s.y - p.y) <= sim.R.clue && sim.grid.los(p.x, p.y, s.x, s.y)) || null;
    },
    investigate(sim, p) {
      const s = Ev.spotNear(sim, p); if (!s) return null;
      p.busy = { kind: 'investigate', spot: s.id, start: sim.t, until: sim.t + (p.bot ? 2600 - p.diff * 300 : 2500), auto: true };
      return { ok: true, data: { investigate: s.id, until: 2500 } };
    },
    finishInvestigate(sim, p, b) {
      const s = (sim.ext.spots || []).find(x => x.id === b.spot); if (!s) return;
      s.found[p.id] = 1;
      const clue = { id: s.id, type: s.type, v: s.v, body: s.body, room: s.room, mark: s.mark ? 1 : 0, t: s.t };
      if (!p.casefile.some(c => c.id === s.id)) { p.casefile.push(clue); p.st.clues++; }
      sim.emit('clue', { clue }, p.id);
    },
    tamper(sim, p) {
      if (p.team !== 'traitor' || !(p.tamper > 0)) return { ok: false, why: 'keine Manipulation mehr' };
      const s = (sim.ext.spots || []).find(x => !x.tampered && Math.hypot(x.x - p.x, x.y - p.y) <= sim.R.clue);
      if (!s) return { ok: false, why: 'keine Spur hier' };
      const pool = sim.players.filter(o => o.team !== 'traitor' && sim.alive(o) && o.id !== s.body);
      if (!pool.length) return { ok: false, why: 'niemand' };
      const r = sim.rng.fork('tp' + s.id), frame = r.pick(pool);
      if (CLASS[s.type]) s.v = CLASS[s.type](frame.look);
      else if (Array.isArray(s.v)) { s.v = s.v.filter(id => sim.byId(id) && sim.byId(id).team !== 'traitor'); if (!s.v.includes(frame.id)) s.v.push(frame.id); s.v = r.shuffle(s.v); }
      else if (s.type === 'zeit') s.v = s.v + (r.chance(0.5) ? 1 : -1) * r.range(25, 45) | 0;
      else if (s.type === 'zeuge') s.v = Object.assign({}, s.v, { who: frame.id });
      s.tampered = true; s.mark = r.chance(0.4); p.tamper--;
      p.busy = { kind: 'tamper', start: sim.t, until: sim.t + 2000, auto: true };
      sim.emit('tampered', { left: p.tamper }, p.id);
      return { ok: true };
    },
    present(sim, p, clueId) {
      const c = (p.casefile || []).find(x => x.id === clueId); if (!c) return null;
      sim.meeting.presented = sim.meeting.presented || {};
      const k = p.id + ':' + c.id; if (sim.meeting.presented[k]) return null;
      sim.meeting.presented[k] = 1;
      return { id: c.id, type: c.type, v: c.v, room: c.room, body: c.body, mark: c.mark, t: c.t };
    },
    /** Passt Person pid zur Spur? true / false / null (keine Aussage). Für Bots und Anzeige. */
    fits(sim, clue, pid) {
      const p = sim.byId(pid); if (!p) return null;
      if (CLASS[clue.type]) return CLASS[clue.type](p.look) === clue.v;
      if (Array.isArray(clue.v)) return clue.v.includes(pid);
      if (clue.type === 'zeuge') return clue.v && clue.v.who === pid ? true : null;
      return null;
    },
    text(clue, names, rooms) {
      const T = AMU.CLUE_TYPES[clue.type], nm = id => names[id] || '?', rn = rooms[clue.room] || 'Gang';
      let s;
      if (CLASS_TXT[clue.type]) s = CLASS_TXT[clue.type][clue.v] || String(clue.v);
      else if (Array.isArray(clue.v)) s = clue.v.length ? clue.v.map(nm).join(', ') : 'niemand registriert';
      else if (clue.type === 'zeit') s = 'etwa bei ' + Math.floor(clue.v / 60) + ':' + String(Math.max(0, clue.v % 60)).padStart(2, '0') + ' Spielzeit';
      else if (clue.type === 'zeuge') s = (clue.v.by ? nm(clue.v.by) : 'Jemand') + ' will ' + nm(clue.v.who) + ' in der Nähe gesehen haben';
      else s = String(clue.v);
      return T.icon + ' ' + T.n + ' (' + rn + '): ' + s + (clue.mark ? ' – wirkt manipuliert!' : '');
    },
    view(sim, me) {
      if (!sim.ext.case) return null;
      const det = me.role === 'detective';
      return {
        case: { n: sim.ext.case.n, intro: sim.ext.case.intro, types: sim.ext.case.types },
        spots: (det || me.team === 'traitor') ? sim.ext.spots.filter(s => Math.hypot(s.x - me.x, s.y - me.y) < 14).map(s => ({ id: s.id, type: s.type, x: s.x, y: s.y, found: s.found[me.id] ? 1 : 0, t: me.team === 'traitor' && s.tampered ? 1 : 0 })) : [],
        casefile: me.casefile || [], tamper: me.team === 'traitor' ? me.tamper : undefined
      };
    }
  };
  AMU.Evidence = Ev;
  if (typeof module !== 'undefined' && module.exports) module.exports = Ev;
})(typeof window !== 'undefined' ? window : globalThis);
