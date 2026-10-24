/* Pestwacht · Kampfsystem (ein System für alles: sichtbare Schlacht, Auto-Kampf, Bot-gegen-Bot). Ohne DOM.
 * Trupps (Einheitentyp + Anzahl) bewegen sich auf einem Feld, wählen Ziele (taktische KI), greifen an, heilen, nutzen Heldenfähigkeiten.
 * Belagerung: Mauer/Tor muss erst fallen, Türme schießen. Ergebnis: Verluste, Verwundete, Erfahrung. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const BT = PW.Battle = {};
  const DT = 0.2, LIMIT = 150, WALL_X = 11;

  const FORM = { angriff: { atk: 1.15, def: 0.9, spd: 1.05 }, ausgewogen: { atk: 1, def: 1, spd: 1 }, verteidigung: { atk: 0.9, def: 1.2, spd: 0.85 } };
  BT.FORMATIONS = { angriff: 'Angriff', ausgewogen: 'Ausgewogen', verteidigung: 'Verteidigung' };
  const TERRAIN = {
    ebene: {}, ruinen: { defDef: 1.05 }, wald: { defDef: 1.1, ranged: 0.9 }, gebirge: { defDef: 1.25, spd: 0.85 }, sumpf: { spd: 0.8, plagueAtk: 1.15 }
  };

  function unitPower(type, n, mods) {
    const u = PW.UNITS[type]; mods = mods || {};
    return n * (u.atk * (1 + (mods['troop.atk'] || 0)) + u.def * 0.6) * (u.hp / 50) * (u.cls === 'support' ? 1.6 : 1);
  }
  function monPower(type, n) { const e = PW.ENEMIES[type] || PW.BOSSES[type]; return n * (e.dmg + e.armor * 0.6) * (e.hp / 50); }
  // Stärke-Schätzung (für KI und Anzeige). heroes: [{atk,def,hp}]
  BT.power = function (units, mon, heroes, mods) {
    let p = 0;
    if (units) for (const k in units) if (units[k] > 0 && PW.UNITS[k]) p += unitPower(k, units[k], mods);
    if (mon) for (const k in mon) if (mon[k] > 0) p += monPower(k, mon[k]);
    if (heroes) heroes.forEach(h => { p += (h.atk * 5 + h.def * 0.6) * (h.hp / 50); });
    return Math.round(p);
  };

  function squadFromUnit(s, type, n, mods, form) {
    const u = PW.UNITS[type], f = FORM[form] || FORM.ausgewogen;
    let atk = u.atk * (1 + (mods['troop.atk'] || 0)) * f.atk;
    if (u.cls === 'ranged') atk *= 1 + (mods['ranged.atk'] || 0);
    if (u.cls === 'cav') atk *= 1 + (mods['cav.atk'] || 0);
    const hpE = u.hp * (1 + (mods['troop.hp'] || 0));
    return { s, kind: 'unit', type, name: u.name, cls: u.cls, n0: n, n, hpE, hp: hpE * n, maxHp: hpE * n, atk, def: u.def * (1 + (mods['troop.def'] || 0)) * f.def,
      range: u.range, spd: u.spd * f.spd, vs: u.vs || {}, plagueMult: u.plague || 1, heal: u.heal || 0, wallDmg: (u.wall || 1.5) * (1 + (mods['siege.dmg'] || 0)) };
  }
  function squadFromMon(s, type, n, boss) {
    const e = boss ? PW.BOSSES[type] : PW.ENEMIES[type];
    return { s, kind: 'mon', type, name: e.name, cls: 'monster', n0: n, n, hpE: e.hp, hp: e.hp * n, maxHp: e.hp * n, atk: e.dmg * (boss ? 3 : 2), def: e.armor,
      range: 1.3, spd: Math.min(5, e.spd * 1.4), vs: {}, plague: !!e.plague, plagueMult: 1, heal: 0, wallDmg: e.dmg * 0.6, boss: !!boss };
  }
  function squadFromHero(s, h, form, mods) {
    const f = FORM[form] || FORM.ausgewogen;
    return { s, kind: 'hero', type: 'hero', heroId: h.id, name: h.name, cls: 'hero', n0: 1, n: 1, hpE: h.hp, hp: h.hp, maxHp: h.hp, atk: h.atk * 5 * f.atk * (1 + (mods['troop.atk'] || 0) * 0.5),
      def: h.def * f.def, range: h.ranged ? 6 : 1.5, spd: 3.4 * f.spd, vs: {}, plagueMult: h.cls === 'alchemist' ? 1.5 : 1, heal: h.cls === 'heiler' ? 6 : 0,
      wallDmg: h.cls === 'belagerer' ? 12 : 2, skill: h.skill ? { id: h.skill, cd: h.cd || 18, t: 6 } : null };
  }

  // Aufstellung: Nahkampf vorn, Fernkampf hinten, Reiter an den Flanken
  function place(b) {
    [0, 1].forEach(side => {
      const dir = side === 0 ? 1 : -1, base = side === 0 ? -24 : 24;
      const groups = { front: [], back: [], flank: [] };
      b.sq.forEach((q, i) => { if (q.s !== side) return; (q.cls === 'ranged' || q.cls === 'support' || (q.cls === 'hero' && q.range > 3) ? groups.back : q.cls === 'cav' ? groups.flank : groups.front).push(i); });
      const lay = (arr, xOff) => arr.forEach((i, k) => { const q = b.sq[i]; q.x = base + dir * xOff; q.y = (k - (arr.length - 1) / 2) * 5; });
      lay(groups.front, 6); lay(groups.back, 0);
      groups.flank.forEach((i, k) => { const q = b.sq[i]; q.x = base + dir * 4; q.y = (k % 2 ? -1 : 1) * (13 + Math.floor(k / 2) * 4); });
      if (side === 1 && b.wall > 0) b.sq.forEach(q => { if (q.s === 1) q.x = Math.max(q.x, WALL_X + 3); });
    });
  }

  BT.make = function (o) {
    const b = { t: 0, sq: [], done: false, win: -1, terrain: o.terrain || 'ebene', kind: o.kind || 'feld', rng: PW.makeRng('kampf:' + (o.seed || 1)),
      wall: o.siege ? o.siege.wall || 0 : 0, wallMax: o.siege ? o.siege.wall || 0 : 0, towers: o.siege ? o.siege.towers || 0 : 0, towerCd: 0,
      focus: [-1, -1], auto: [o.att.auto !== false, o.def.auto !== false], fx: [], names: [o.att.name || 'Angreifer', o.def.name || 'Verteidiger'],
      owners: [o.att.owner, o.def.owner], retreat: o.allowRetreat !== false, events: [], fled: -1 };
    [o.att, o.def].forEach((side, s) => {
      const mods = side.mods || {}, form = side.formation || 'ausgewogen';
      let lead = 0; (side.heroes || []).forEach(h => { lead += h.lead || 0; });
      const m2 = Object.assign({}, mods); m2['troop.atk'] = (m2['troop.atk'] || 0) + lead;
      if (side.units) PW.UNIT_IDS.forEach(k => { if (side.units[k] > 0) b.sq.push(squadFromUnit(s, k, side.units[k], m2, form)); });
      if (side.mon) Object.keys(side.mon).forEach(k => { if (side.mon[k] > 0 && PW.ENEMIES[k]) b.sq.push(squadFromMon(s, k, side.mon[k])); });
      if (side.boss) b.sq.push(squadFromMon(s, side.boss, 1, true));
      (side.heroes || []).forEach(h => b.sq.push(squadFromHero(s, h, form, mods)));
    });
    b.sq.forEach(q => { q.tgt = -1; q.cd = q.s === 0 ? 0.4 : 0; q.buf = {}; q.dealt = 0; q.kills = 0; });
    place(b);
    return b;
  };

  const alive = q => q.n > 0;
  // Kampfkraft einer Seite (Schaden je Sekunde × Lebenspunkte, nach Lanchester)
  BT.sidePower = function (b, s) { let d = 0, h = 0; b.sq.forEach(q => { if (q.s === s && q.n > 0) { d += q.atk * (q.kind === 'hero' ? 1 : q.n) * (1 + q.def / 30); h += q.hp; } }); return d * h / 1000; };

  function pickTarget(b, i) {
    const q = b.sq[i], foes = [];
    b.sq.forEach((e, j) => { if (e.s !== q.s && e.n > 0) foes.push(j); });
    if (!foes.length) return -1;
    // Spott (Letztes Bollwerk)
    const taunt = foes.find(j => b.sq[j].buf.taunt > 0); if (taunt != null) return taunt;
    // Angreifer vor stehender Mauer: Nahkampf, Belagerung und Monster schlagen auf das Tor
    if (q.s === 0 && b.wall > 0 && q.cls !== 'ranged' && q.cls !== 'support' && !(q.cls === 'hero' && q.range > 3)) return -2;
    const f = b.focus[q.s]; if (f >= 0 && b.sq[f] && b.sq[f].n > 0) return f;
    let best = -1, bs = -Infinity;
    for (const j of foes) {
      const e = b.sq[j], d = Math.hypot(e.x - q.x, e.y - q.y);
      let sc = -d;
      if (q.cls === 'cav' && (e.cls === 'ranged' || e.cls === 'support')) sc += 30;
      if (q.cls === 'ranged') sc += 12 * (1 - e.hp / Math.max(1, e.maxHp)) + (e.cls === 'melee' || e.cls === 'monster' ? 6 : 0);
      if ((q.vs[e.cls] || 1) > 1) sc += 8;
      if (q.plagueMult > 1 && e.plague) sc += 10;
      if (e.kind === 'hero') sc += 3;
      if (q.s === 1 && b.wall > 0 && q.cls !== 'ranged' && q.cls !== 'hero') sc -= 50; // hinter der Mauer: Nahkampf wartet
      if (sc > bs) { bs = sc; best = j; }
    }
    return best;
  }

  function hit(b, a, j, mult) {
    const q = b.sq[a], e = b.sq[j], T = TERRAIN[b.terrain] || {};
    let dmg = q.atk * (q.kind === 'hero' ? 1 : q.n) * (mult || 1);
    dmg *= (q.vs[e.cls] || 1) * (e.plague ? q.plagueMult : 1);
    if (q.cls === 'ranged' && T.ranged) dmg *= T.ranged;
    if (q.plague && T.plagueAtk) dmg *= T.plagueAtk;
    if (q.buf.flanke > 0 && (q.cls === 'melee' || q.cls === 'cav')) dmg *= 2;
    let def = e.def * (e.s === 1 && T.defDef ? T.defDef : 1);
    if (e.s === 1 && b.wall > 0 && q.cls === 'ranged') dmg *= 0.7;           // Deckung hinter der Mauer
    dmg *= 30 / (30 + def);
    if (e.buf.schild > 0) dmg *= 0.5;
    if (e.buf.taunt > 0) dmg *= 0.34;
    dmg *= 0.9 + b.rng() * 0.2;
    apply(b, j, dmg, a);
    return dmg;
  }
  function apply(b, j, dmg, a) {
    const e = b.sq[j]; if (e.n <= 0) return;
    const before = e.n;
    e.hp = Math.max(0, e.hp - dmg);
    e.n = e.kind === 'hero' ? (e.hp > 0 ? 1 : 0) : Math.ceil(e.hp / e.hpE - 1e-6);
    if (a != null) { b.sq[a].dealt += dmg; b.sq[a].kills += before - e.n; }
  }
  function heal(b, j, amt) { const e = b.sq[j]; if (e.n <= 0) return; e.hp = Math.min(e.hpE * e.n0, e.hp + amt); e.n = e.kind === 'hero' ? 1 : Math.ceil(e.hp / e.hpE - 1e-6); }

  // ---------- Heldenfähigkeiten ----------
  BT.canSkill = function (b, i) { const q = b.sq[i]; return !b.done && q && q.n > 0 && q.skill && q.skill.t <= 0; };
  BT.skill = function (b, i) {
    if (!BT.canSkill(b, i)) return false;
    const q = b.sq[i], id = q.skill.id, me = q.s;
    const allies = b.sq.map((x, k) => k).filter(k => b.sq[k].s === me && b.sq[k].n > 0), foes = b.sq.map((x, k) => k).filter(k => b.sq[k].s !== me && b.sq[k].n > 0);
    const densest = () => foes.slice().sort((x, y) => b.sq[y].n * b.sq[y].hpE - b.sq[x].n * b.sq[x].hpE)[0];
    const nearest = () => foes.slice().sort((x, y) => Math.hypot(b.sq[x].x - q.x, b.sq[x].y - q.y) - Math.hypot(b.sq[y].x - q.x, b.sq[y].y - q.y))[0];
    if (!foes.length && !['segen', 'dunst'].includes(id)) return false;
    switch (id) {
      case 'segen': allies.forEach(k => heal(b, k, b.sq[k].hpE * b.sq[k].n0 * 0.25)); break;
      case 'dunst': allies.forEach(k => { b.sq[k].buf.regen = 6; }); break;
      case 'schildwall': allies.forEach(k => { b.sq[k].buf.schild = 6; }); break;
      case 'bollwerk': q.buf.taunt = 6; break;
      case 'flanke': allies.forEach(k => { b.sq[k].buf.flanke = 8; }); break;
      case 'pfeilhagel': { const t = foes.slice().sort((x, y) => b.sq[y].n - b.sq[x].n).slice(0, 2); t.forEach(k => apply(b, k, q.atk * 4 * 30 / (30 + b.sq[k].def), i)); break; }
      case 'kalkbombe': { const k = densest(); apply(b, k, q.atk * 5 * (b.sq[k].plague ? 3 : 1) * 30 / (30 + b.sq[k].def), i); break; }
      case 'hinterhalt': { const k = nearest(); b.sq[k].buf.stun = 3; apply(b, k, q.atk * 2, i); break; }
      case 'rammstoss': if (me === 0 && b.wall > 0) { b.wall = Math.max(0, b.wall - q.atk * 25); } else { const k = densest(); apply(b, k, q.atk * 8 * 30 / (30 + b.sq[k].def), i); } break;
      case 'durchschlag': { const k = foes.slice().sort((x, y) => b.sq[y].def - b.sq[x].def)[0]; apply(b, k, q.atk * 10, i); break; }
      case 'feuerphiole': { const k = densest(); b.sq[k].buf.burn = 5; b.sq[k].buf.burnDps = q.atk * 1.6; break; }
      case 'sturm': { const r = foes.filter(k => b.sq[k].cls === 'ranged' || b.sq[k].cls === 'support'); const k = r.length ? r[0] : nearest(); apply(b, k, q.atk * 7 * 30 / (30 + b.sq[k].def), i); break; }
      default: return false;
    }
    q.skill.t = q.skill.cd;
    b.events.push({ t: b.t, kind: 'skill', i, id });
    return true;
  };
  // Auto-Kampf: einfache, aber zielgerichtete Fähigkeits-KI
  function autoSkill(b, i) {
    const q = b.sq[i], id = q.skill.id, me = q.s;
    let hurt = 0, tot = 0; b.sq.forEach(x => { if (x.s === me && x.n0) { hurt += x.hpE * x.n0 - x.hp; tot += x.hpE * x.n0; } });
    const foesN = b.sq.filter(x => x.s !== me && x.n > 0).length;
    if ((id === 'segen' || id === 'dunst') && hurt / Math.max(1, tot) < 0.25) return;
    if (id === 'rammstoss' && me === 0 && b.wall <= 0 && foesN === 0) return;
    if (b.t < 2) return;
    BT.skill(b, i);
  }

  BT.step = function (b, dt) {
    if (b.done) return;
    dt = dt || DT;
    b.t += dt; b.fx.length = 0;
    const T = TERRAIN[b.terrain] || {};
    for (let i = 0; i < b.sq.length; i++) {
      const q = b.sq[i]; if (q.n <= 0) continue;
      for (const k in q.buf) if (q.buf[k] > 0 && k !== 'burnDps') q.buf[k] -= dt;
      if (q.buf.regen > 0) heal(b, i, q.hpE * q.n0 * 0.03 * dt);
      if (q.buf.burn > 0) apply(b, i, (q.buf.burnDps || 0) * dt);
      if (q.skill) { q.skill.t -= dt; if (b.auto[q.s] && q.skill.t <= 0) autoSkill(b, i); }
      if (q.buf.stun > 0) continue;
      q.cd -= dt;
      if (q.tgt === -1 || (q.tgt >= 0 && b.sq[q.tgt].n <= 0) || (q.tgt === -2 && b.wall <= 0) || ((b.t * 5 | 0) % 5 === i % 5)) q.tgt = pickTarget(b, i);
      // Heiler: Verbündeten mit den meisten fehlenden LP heilen
      if (q.heal > 0) {
        let best = -1, miss = 0;
        b.sq.forEach((x, k) => { if (x.s === q.s && x.n > 0) { const m = x.hpE * x.n0 - x.hp; if (m > miss) { miss = m; best = k; } } });
        if (best >= 0 && q.cd <= 0 && miss > 0) { heal(b, best, q.heal * (q.kind === 'hero' ? 4 : q.n)); b.fx.push({ a: i, b: best, k: 'heal' }); if (q.cls === 'support') { q.cd = 1; continue; } }
      }
      const spd = q.spd * (T.spd || 1);
      let tx, ty, rng = q.range;
      if (q.tgt === -2) { tx = WALL_X - 1; ty = q.y; rng = 1.2; }
      else if (q.tgt >= 0) { tx = b.sq[q.tgt].x; ty = b.sq[q.tgt].y; }
      else continue;
      const dx = tx - q.x, dy = ty - q.y, d = Math.hypot(dx, dy);
      if (d > rng) {
        let nx = q.x + dx / d * spd * dt, ny = q.y + dy / d * spd * dt;
        if (b.wall > 0) { if (q.s === 0) nx = Math.min(nx, WALL_X - 0.8); else nx = Math.max(nx, WALL_X + 1.5); }
        q.x = nx; q.y = ny;
      } else if (q.cd <= 0) {
        q.cd = q.cls === 'ranged' ? 1.2 : 1;
        if (q.tgt === -2) {
          const w = q.wallDmg * (q.kind === 'hero' ? 5 : q.n) * (q.cls === 'siege' ? 1 : 0.5);
          b.wall = Math.max(0, b.wall - w); b.fx.push({ a: i, b: -2, k: 'wall' });
          if (b.wall <= 0) b.events.push({ t: b.t, kind: 'breach' });
        } else { hit(b, i, q.tgt); b.fx.push({ a: i, b: q.tgt, k: q.range > 3 ? 'ranged' : 'melee' }); }
      }
    }
    // Türme der Verteidiger
    if (b.towers > 0) {
      b.towerCd -= dt;
      if (b.towerCd <= 0) {
        b.towerCd = 1;
        let best = -1, bd = Infinity; b.sq.forEach((q, k) => { if (q.s === 0 && q.n > 0) { const d = Math.abs(q.x - WALL_X); if (d < bd) { bd = d; best = k; } } });
        if (best >= 0 && bd < 22) { apply(b, best, b.towers * 30 / (30 + b.sq[best].def)); b.fx.push({ a: -3, b: best, k: 'tower' }); }
      }
    }
    // Ende?
    const n0 = b.sq.some(q => q.s === 0 && q.n > 0), n1 = b.sq.some(q => q.s === 1 && q.n > 0);
    if (!n0 || !n1) { b.done = true; b.win = n0 ? 0 : 1; if (!n0 && !n1) b.win = 1; return; }
    if (b.t >= LIMIT) { b.done = true; b.win = 1; b.events.push({ t: b.t, kind: 'timeout' }); return; }
    // Rückzug (taktische KI der automatisch geführten Seiten)
    if (b.retreat && b.t > 15 && (b.t * 5 | 0) % 10 === 0) {
      const p0 = BT.sidePower(b, 0), p1 = BT.sidePower(b, 1);
      if (b.auto[0] && p0 < p1 * 0.18) { b.done = true; b.win = 1; b.fled = 0; b.events.push({ t: b.t, kind: 'retreat', s: 0 }); }
      else if (b.auto[1] && b.wall <= 0 && p1 < p0 * 0.12 && b.kind === 'feld') { b.done = true; b.win = 0; b.fled = 1; b.events.push({ t: b.t, kind: 'retreat', s: 1 }); }
    }
  };
  BT.retreat = function (b, s) { if (b.done) return; b.done = true; b.win = 1 - s; b.fled = s; b.events.push({ t: b.t, kind: 'retreat', s }); };
  BT.run = function (b) { let guard = 0; while (!b.done && guard++ < LIMIT / DT + 10) BT.step(b, DT); return BT.result(b); };

  // woundShare: { 0: Anteil, 1: Anteil } der Verluste, die verwundet überleben
  BT.result = function (b, woundShare) {
    woundShare = woundShare || {};
    const out = { win: b.win, t: Math.round(b.t), fled: b.fled, wall: Math.round(b.wall), wallMax: b.wallMax, sides: [] };
    [0, 1].forEach(s => {
      const r = { lost: {}, alive: {}, wounded: {}, mon: {}, heroes: [], killedPower: 0, lostN: 0 };
      b.sq.forEach(q => {
        if (q.s !== s) return;
        if (q.kind === 'unit') {
          const lost = q.n0 - q.n, w = Math.floor(lost * (woundShare[s] || 0));
          r.alive[q.type] = (r.alive[q.type] || 0) + q.n; r.lost[q.type] = (r.lost[q.type] || 0) + lost - w; r.wounded[q.type] = (r.wounded[q.type] || 0) + w; r.lostN += lost;
        } else if (q.kind === 'mon') { if (!q.boss) r.mon[q.type] = q.n; else r.bossAlive = q.n > 0; r.lostN += q.n0 - q.n; }
        else r.heroes.push({ id: q.heroId, alive: q.n > 0, hpLeft: q.hp / q.maxHp });
      });
      out.sides.push(r);
    });
    // Erfahrung: nach besiegter gegnerischer Stärke
    [0, 1].forEach(s => {
      let xp = 0; b.sq.forEach(q => { if (q.s !== s) xp += (q.n0 - q.n) * (q.atk + q.def) * (q.hpE / 60) * (q.kind === 'hero' ? 0.2 : 1); });
      out.sides[s].xp = Math.round(xp / 3 + (b.win === s ? 20 : 5));
    });
    return out;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
