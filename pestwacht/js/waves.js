/* Pestwacht · Wellenverteidigung: Schwärme und Bosse greifen über feste Laufwege das Tor an, Türme feuern echte Geschosse,
 * Garnison und Helden kämpfen am Tor. Koordinaten in Rasterzellen der Stadt. Ohne DOM. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const WV = PW.Waves = {};
  const C = () => PW.City;
  const GATE = { x: 15, y: 28.6 }, HQF = { x: 14.9, y: 16.2 }, STEP = 0.1;

  // Laufwege (klar definierte Spawnpunkte außerhalb der Mauer)
  WV.LANES = [
    { name: 'Westpfad', pts: [[-7, 12], [-3, 22], [4, 31.5], [12, 31.5], [GATE.x, GATE.y]] },
    { name: 'Ostpfad', pts: [[37, 12], [33, 22], [26, 31.5], [18, 31.5], [GATE.x, GATE.y]] },
    { name: 'Südstraße', pts: [[15, 44], [15, 34], [GATE.x, GATE.y]] },
    { name: 'Nordschleife', pts: [[15, -8], [31, -4], [34, 12], [33, 26], [24, 32], [17, 31.5], [GATE.x, GATE.y]] }
  ];
  WV.INNER = [[GATE.x, GATE.y], [15, 25], [HQF.x, HQF.y]];

  WV.towerStats = function (S, b) {
    const d = PW.BLD[b.t].tower, m = S._mods || {}, lv = Math.max(1, b.lv);
    return { range: (d.range + 0.5 * (lv - 1)) * (1 + (m['tower.range'] || 0)), dmg: d.dmg * (1 + 0.35 * (lv - 1)) * (1 + (m['tower.dmg'] || 0)), rate: d.rate, kind: d.kind, speed: d.speed || 20,
      splash: d.splash || 0, burn: d.burn ? d.burn * (1 + 0.25 * (lv - 1)) : 0, pierce: !!d.pierce, aura: !!d.aura, slow: d.slow || 0 };
  };
  WV.towerDps = function (S) {
    let s = 0; S.city.b.forEach(b => { if (PW.BLD[b.t].tower && b.lv > 0) { const t = WV.towerStats(S, b); s += t.dmg / t.rate * (t.splash ? 2 : 1); } }); return Math.round(s);
  };
  WV.warnTime = S => PW.WAVES.warn + 15 * C().lv(S, 'kundschafter');
  WV.garrison = function (S) {
    const u = Object.assign({}, S.troops);
    S.stationed.forEach(st => { if (st.tile === S.world.caps[0]) for (const k in st.units) u[k] = (u[k] || 0) + st.units[k]; });
    return u;
  };
  WV.garrisonDps = function (S, a) {
    const u = WV.garrison(S), m = S._mods || {}; let d = 0;
    PW.UNIT_IDS.forEach(k => { d += (u[k] || 0) * PW.UNITS[k].atk * (k === 'bow' ? 1.2 : k === 'ram' ? 0.2 : 1); });
    d *= 0.25 * (1 + (m['troop.atk'] || 0)) * (1 + 0.03 * C().lv(S, 'schmiede'));
    PW.Heroes.list(S).forEach(h => { if (PW.Heroes.available(S, h)) d += PW.Heroes.stats(S, h).atk * 1.2; });
    if (a && a.buf.flanke > 0) d *= 2;
    return d;
  };

  // Zusammensetzung einer Welle aus Budget
  WV.compose = function (S, n, forceBoss, raid) {
    const diff = PW.DIFFICULTY[S.cfg.diff] || PW.DIFFICULTY.normal;
    const pl = S._regionPlague || 0;
    const budget = Math.round((raid ? 16 : 36) * diff.wave * (1 + 0.4 * (n - 1)) * (1 + pl * 0.6));
    const types = raid ? ['bandit'] : ['ratte', 'gaenger'].concat(n >= 2 ? ['bandit'] : [], n >= 3 ? ['kraehe'] : [], n >= 4 ? ['bestie'] : []);
    const lanesN = Math.min(4, 1 + Math.floor((n + 1) / 3));
    const lanes = []; const order = [2, 0, 1, 3]; for (let k = 0; k < lanesN; k++) lanes.push(order[(k + n) % 4]);
    const q = []; let left = budget, t = 1;
    while (left > 0) {
      const ty = types[PW.randInt(S, types.length)], e = PW.ENEMIES[ty], grp = ty === 'ratte' ? 6 : ty === 'kraehe' ? 3 : ty === 'bestie' ? 1 : 2;
      const lane = lanes[PW.randInt(S, lanes.length)];
      for (let g = 0; g < grp && left > 0; g++) { q.push({ t: t + g * 0.35, type: ty, lane }); left -= e.reward; }
      t += 1.6 + PW.rand(S) * 1.4;
    }
    let boss = raid ? null : forceBoss || (n % PW.WAVES.bossEvery === 0 ? PW.BOSS_ORDER[(n / PW.WAVES.bossEvery - 1) % PW.BOSS_ORDER.length] : null);
    if (boss) q.push({ t: t + 3, type: boss, lane: lanes[0], boss: 1 });
    return { q, budget, boss, lanes };
  };

  WV.start = function (S, opt) {
    if (S.waves.active) return false;
    opt = opt || {};
    const n = opt.raid ? Math.max(1, S.waves.n) : S.waves.n + 1, c = WV.compose(S, n, opt.boss, opt.raid);
    S.city.gate = Math.min(S.city.gate, C().gateMax(S));
    S.waves.active = { n, t: 0, q: c.q, en: [], proj: [], budget: c.budget, boss: c.boss, kills: 0, lanes: c.lanes, buf: {}, hcd: {}, hqHp: C().maxHp(C().first(S, 'hq')), lost: {}, dmgAcc: 0, early: !!opt.early, raid: !!opt.raid, fx: [], tcd: {}, uid: 0 };
    S.waves.warned = false;
    PW.log(S, opt.raid ? '🗡️ Plünderer greifen die Zuflucht an!' : '🐀 Welle ' + n + ' greift an' + (c.boss ? ' – angeführt von ' + PW.BOSSES[c.boss].name + '!' : '') + ' (' + c.lanes.map(l => WV.LANES[l].name).join(', ') + ')', 'warn');
    return true;
  };
  WV.callEarly = function (S) { if (S.waves.active) return false; return WV.start(S, { early: true }); };

  function spawn(S, a, item) {
    const d = item.boss ? PW.BOSSES[item.type] : PW.ENEMIES[item.type], lane = WV.LANES[item.lane], p = lane.pts[0];
    const hpM = item.boss ? 1 + 0.2 * Math.floor(a.n / PW.WAVES.bossEvery - 1) : 1 + 0.1 * (a.n - 1);
    const e = { id: ++a.uid, type: item.type, boss: !!item.boss, hp: d.hp * hpM, max: d.hp * hpM, x: (item.x != null ? item.x : p[0]) + (PW.rand(S) - 0.5) * 1.5, y: (item.y != null ? item.y : p[1]) + (PW.rand(S) - 0.5) * 1.5,
      lane: item.lane, seg: item.seg || 0, st: 'walk', cd: 0, slow: 0, burn: 0, burnDps: 0, stun: 0, fly: !!d.fly, tgt: null, sp: 0, prog: item.prog || 0 };
    if (e.fly) { const bs = S.city.b.filter(b => b.lv > 0 && b.t !== 'mauer' && b.w); const b = bs.length ? bs[PW.randInt(S, bs.length)] : null; e.tgt = b ? b.id : null; }
    a.en.push(e);
  }
  function enemyDef(e) { return e.boss ? PW.BOSSES[e.type] : PW.ENEMIES[e.type]; }
  function moveAlong(e, pts, dist) {
    while (dist > 0 && e.seg < pts.length - 1) {
      const t = pts[e.seg + 1], dx = t[0] - e.x, dy = t[1] - e.y, d = Math.hypot(dx, dy);
      if (d <= dist) { e.x = t[0]; e.y = t[1]; e.seg++; dist -= d; e.prog += d; }
      else { e.x += dx / d * dist; e.y += dy / d * dist; e.prog += dist; dist = 0; }
    }
    return e.seg >= pts.length - 1;
  }
  function damage(S, a, e, dmg, kind, pierce) {
    if (e.hp <= 0) return;
    const d = enemyDef(e);
    if (!pierce) dmg *= 20 / (20 + d.armor);
    if (d.arrowResist && (kind === 'pfeil' || kind === 'bolzen')) dmg *= 1 - d.arrowResist;
    e.hp -= dmg;
    if (e.hp <= 0) { a.kills++; a.fx.push({ k: 'tod', x: e.x, y: e.y, boss: e.boss }); }
  }
  WV.damage = damage;

  // Zielwahl der Türme: Pfeil = am weitesten vorgerückt, Balliste = stärkstes, Feuer = dichteste Gruppe
  WV.pickTarget = function (a, tw, st) {
    let best = null, bs = -Infinity;
    for (const e of a.en) {
      if (e.hp <= 0) continue;
      const d = Math.hypot(e.x - tw.x, e.y - tw.y); if (d > st.range) continue;
      let s;
      if (st.kind === 'bolzen') s = e.hp + (e.boss ? 1e4 : 0);
      else if (st.kind === 'feuer') { s = 0; for (const o of a.en) if (o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) < st.splash) s++; }
      else s = (e.st === 'gate' ? 1000 : 0) + (e.st === 'inner' ? 2000 : 0) + e.prog + (e.fly ? 50 : 0);
      if (s > bs) { bs = s; best = e; }
    }
    return best;
  };

  WV.step = function (S, dt) {
    const a = S.waves.active; if (!a) return;
    a.t += dt; a.fx.length = Math.min(a.fx.length, 40);
    for (const k in a.buf) if (a.buf[k] > 0) a.buf[k] -= dt;
    // Spawnen
    while (a.q.length && a.q[0].t <= a.t) spawn(S, a, a.q.shift());
    a.q.sort((x, y) => x.t - y.t);
    const gateUp = S.city.gate > 0;
    // Feinde bewegen und angreifen
    let atGate = [], inner = [];
    for (const e of a.en) {
      if (e.hp <= 0) continue;
      const d = enemyDef(e);
      if (e.burn > 0) { e.burn -= dt; damage(S, a, e, e.burnDps * dt, 'feuer', true); if (e.hp <= 0) continue; }
      if (e.stun > 0) { e.stun -= dt; continue; }
      if (d.spawn) { e.sp += dt; if (e.sp >= d.spawn.every) { e.sp = 0; for (let k = 0; k < d.spawn.n; k++) a.q.push({ t: a.t + k * 0.2, type: d.spawn.type, lane: e.lane, x: e.x, y: e.y, seg: e.seg, prog: e.prog }); } }
      if (d.healAura) a.en.forEach(o => { if (o !== e && o.hp > 0 && o.hp < o.max && enemyDef(o).plague && Math.hypot(o.x - e.x, o.y - e.y) < 5) o.hp = Math.min(o.max, o.hp + d.healAura * dt); });
      const spd = d.spd * (1 - e.slow) * (S.cfg.slowWaves ? 0.8 : 1); e.slow = 0;
      e.cd -= dt;
      if (e.fly) {
        let bb = e.tgt && C().get(S, e.tgt);
        if (!bb || bb.lv < 1 || (e.bites || 0) >= 6) { const hq = C().first(S, 'hq'); if ((e.bites || 0) >= 6 && hq) { e.tgt = hq.id; } else { const bs = S.city.b.filter(x => x.lv > 0 && x.w); const nb = bs.length ? bs[PW.randInt(S, bs.length)] : null; e.tgt = nb ? nb.id : null; } bb = e.tgt && C().get(S, e.tgt); if (!bb) continue; }
        const tx = bb.x + bb.w / 2, ty = bb.y + bb.h / 2, dx = tx - e.x, dy = ty - e.y, dd = Math.hypot(dx, dy);
        if (dd > 0.8) { e.x += dx / dd * spd * dt; e.y += dy / dd * spd * dt; e.prog += spd * dt; }
        else {
          atGate.push(e);                                  // Schützen auf den Dächern wehren sich
          if (e.cd <= 0) { e.cd = 1; e.bites = (e.bites || 0) + 1; bb.hp = Math.max(1, bb.hp - d.dmg); if (bb.t === 'hq') a.hqHp -= d.dmg; a.fx.push({ k: 'biss', x: e.x, y: e.y }); }
        }
        continue;
      }
      if (e.st === 'walk') {
        if (moveAlong(e, WV.LANES[e.lane].pts, spd * dt)) { e.st = gateUp ? 'gate' : 'inner'; e.seg = 0; }
      } else if (e.st === 'gate') {
        if (!gateUp) { e.st = 'inner'; e.seg = 0; continue; }
        atGate.push(e);
        if (e.cd <= 0) { e.cd = 1; let dm = d.dmg * (e.boss && e.type === 'hauptmann' ? 2 : 1); if (a.buf.schild > 0) dm *= 0.5; S.city.gate = Math.max(0, S.city.gate - dm); a.fx.push({ k: 'tor', x: e.x, y: e.y }); if (S.city.gate <= 0) PW.log(S, '💥 Das Tor ist gefallen! Feinde dringen ein', 'warn'); }
      } else if (e.st === 'inner') {
        inner.push(e);
        if (moveAlong(e, WV.INNER, spd * dt)) {
          if (e.cd <= 0) { e.cd = 1; a.hqHp -= d.dmg * (a.buf.schild > 0 ? 0.5 : 1); a.fx.push({ k: 'hq', x: e.x, y: e.y }); }
        }
        a.dmgAcc += d.dmg * dt * 0.6;           // Feinde in der Stadt verletzen die Garnison
      }
    }
    // Garnison und Helden kämpfen am Tor / in der Stadt
    const fighters = inner.length ? inner : atGate;
    if (fighters.length) {
      const dps = WV.garrisonDps(S, a);
      if (dps > 0) { const per = dps * dt / Math.min(4, fighters.length); fighters.slice(0, 4).forEach(e => damage(S, a, e, per, 'nah')); }
      if (inner.length) loseTroops(S, a);
    }
    // Türme
    S.city.b.forEach(b => {
      const D = PW.BLD[b.t]; if (!D.tower || b.lv < 1 || b.st === 'bau') return;
      const st = WV.towerStats(S, b), tw = { x: b.x + 0.5, y: b.y + 0.5 };
      if (st.aura) { a.en.forEach(e => { if (e.hp > 0 && Math.hypot(e.x - tw.x, e.y - tw.y) < st.range) { e.slow = Math.max(e.slow, st.slow); if (enemyDef(e).plague) damage(S, a, e, st.dmg * dt, 'rauch', true); } }); return; }
      a.tcd[b.id] = (a.tcd[b.id] || 0) - dt;
      if (a.tcd[b.id] > 0) return;
      const e = WV.pickTarget(a, tw, st); if (!e) return;
      a.tcd[b.id] = st.rate;
      a.proj.push({ x: tw.x, y: tw.y, z: 2.4, eid: e.id, dmg: st.dmg, kind: st.kind, spd: st.speed, splash: st.splash, burn: st.burn, pierce: st.pierce, from: b.id });
    });
    // Geschosse
    for (let k = a.proj.length - 1; k >= 0; k--) {
      const p = a.proj[k], e = a.en.find(x => x.id === p.eid);
      if (!e || e.hp <= 0) { a.proj.splice(k, 1); continue; }
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy), mv = p.spd * dt;
      if (d <= mv) {
        if (p.splash) a.en.forEach(o => { if (o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) < p.splash) { damage(S, a, o, p.dmg, p.kind, p.pierce); if (p.burn) { o.burn = 3; o.burnDps = p.burn; } } });
        else damage(S, a, e, p.dmg, p.kind, p.pierce);
        a.fx.push({ k: 'treffer', x: e.x, y: e.y, kind: p.kind });
        a.proj.splice(k, 1);
      } else { p.x += dx / d * mv; p.y += dy / d * mv; }
    }
    // Helden-Fähigkeiten automatisch, wenn eingestellt
    if (S.cfg.autoSkills !== false) PW.Heroes.list(S).forEach(h => { if (PW.Heroes.available(S, h) && !(a.hcd[h] > 0) && a.en.some(e => e.hp > 0 && e.st !== 'walk')) WV.skill(S, h); });
    for (const h in a.hcd) if (a.hcd[h] > 0) a.hcd[h] -= dt;
    // Ende?
    a.en = a.en.filter(e => e.hp > 0);
    if (a.hqHp <= 0) return WV.finish(S, false);
    if (a.t > 480 && !a.q.length) { PW.log(S, 'Die letzten Angreifer ziehen sich zurück', 'info'); a.en = []; a.budget = Math.round(a.budget * 0.7); return WV.finish(S, true); }
    if (!a.q.length && !a.en.length) return WV.finish(S, true);
  };
  function loseTroops(S, a) {
    // je 60 Schaden fällt ein Verteidiger (Spießträger zuerst)
    while (a.dmgAcc >= 60) {
      a.dmgAcc -= 60;
      const k = ['spear', 'hunter', 'rider', 'bow', 'medic', 'ram'].find(x => (S.troops[x] || 0) > 0); if (!k) { a.dmgAcc = 0; break; }
      S.troops[k]--; a.lost[k] = (a.lost[k] || 0) + 1;
    }
  }

  // Heldenfähigkeit in der Verteidigung
  WV.skillInfo = {
    segen: 'Repariert das Tor um 15 %', dunst: 'Repariert das Tor um 10 %, Garnison heilt', schildwall: 'Tor nimmt 8 s halben Schaden', bollwerk: 'Tor nimmt 8 s halben Schaden',
    pfeilhagel: 'Flächenschaden', kalkbombe: 'Flächenschaden, dreifach gegen Seuchenwesen', feuerphiole: 'Setzt Feinde in Brand', hinterhalt: 'Betäubt Feinde am Tor 3 s',
    flanke: 'Garnison 8 s doppelter Schaden', sturm: 'Garnison 8 s doppelter Schaden', rammstoss: 'Schwerer Treffer gegen den stärksten Feind', durchschlag: 'Schwerer Treffer gegen den stärksten Feind'
  };
  WV.skill = function (S, h) {
    const a = S.waves.active; if (!a || !PW.Heroes.available(S, h) || a.hcd[h] > 0) return false;
    const st = PW.Heroes.stats(S, h), id = st.skill, live = a.en.filter(e => e.hp > 0);
    const front = live.filter(e => e.st !== 'walk' || e.fly);
    const cluster = () => { let best = null, bn = 0; live.forEach(e => { const n = live.filter(o => Math.hypot(o.x - e.x, o.y - e.y) < 4).length; if (n > bn) { bn = n; best = e; } }); return best; };
    const gm = C().gateMax(S);
    switch (id) {
      case 'segen': S.city.gate = Math.min(gm, S.city.gate + gm * 0.15); break;
      case 'dunst': S.city.gate = Math.min(gm, S.city.gate + gm * 0.1); a.dmgAcc = Math.max(0, a.dmgAcc - 60); break;
      case 'schildwall': case 'bollwerk': a.buf.schild = 8; break;
      case 'flanke': case 'sturm': a.buf.flanke = 8; break;
      case 'hinterhalt': front.forEach(e => { e.stun = 3; }); break;
      case 'pfeilhagel': case 'kalkbombe': case 'feuerphiole': {
        const c = cluster(); if (!c) return false;
        live.forEach(e => { if (Math.hypot(e.x - c.x, e.y - c.y) < 4) { damage(S, a, e, st.atk * (id === 'kalkbombe' && enemyDef(e).plague ? 9 : 4), 'held', true); if (id === 'feuerphiole') { e.burn = 4; e.burnDps = st.atk * 0.8; } } });
        a.fx.push({ k: 'skill', x: c.x, y: c.y, id }); break;
      }
      case 'rammstoss': case 'durchschlag': { const t = live.slice().sort((x, y) => y.hp - x.hp)[0]; if (!t) return false; damage(S, a, t, st.atk * 14, 'held', true); a.fx.push({ k: 'skill', x: t.x, y: t.y, id }); break; }
      default: return false;
    }
    a.hcd[h] = PW.HERO[h].skill.cd;
    return true;
  };

  WV.finish = function (S, won) {
    const a = S.waves.active; if (!a) return;
    S.waves.active = null;
    if (!a.raid) { S.waves.n = a.n; S.waves.next = S.time + PW.WAVES.every * (S.cfg.waveScale || 1); }
    const ws = 0.3 + ((S._mods || {}).wounded || 0);
    for (const k in a.lost) { const w = Math.floor(a.lost[k] * ws); S.wounded[k] = (S.wounded[k] || 0) + w; }
    const hq = C().first(S, 'hq');
    if (won) {
      const m = a.early ? 1.25 : 1, rew = { coin: Math.round(a.budget * 3 * m), know: Math.round(a.budget * 1.2 * m), herb: Math.round(a.budget * 0.8 * m), iron: Math.round(a.budget * 0.4 * m) };
      if (a.boss) { const B = PW.BOSSES[a.boss]; rew.coin += B.reward; rew.med = 30; PW.stat(S, 'bosses'); if (a.boss === 'schwarmfuerst') PW.stat(S, 'swarmlord'); PW.stat(S, 'boss_' + a.boss); }
      PW.addRes(S.res, rew, S._caps);
      if (!a.raid) PW.stat(S, 'waves');
      PW.Heroes.list(S).forEach(h => { if (PW.Heroes.available(S, h)) PW.Heroes.addXp(S, h, 25 + a.budget * 1.5 + (a.boss ? 200 : 0)); });
      PW.log(S, '🏆 Welle ' + a.n + ' abgewehrt' + (a.boss ? ' – ' + PW.BOSSES[a.boss].name + ' besiegt!' : '') + ' Beute: ' + PW.costText(rew), 'gut');
      S.waves.last = { n: a.n, won: true, rew, lost: a.lost, boss: a.boss };
    } else {
      const loss = {}; PW.RES.forEach(k => { if (k === 'know') return; const n = Math.floor(S.res[k] * 0.25); if (n) { S.res[k] -= n; loss[k] = n; } });
      S.city.b.forEach(b => { if (b.lv > 0) b.hp = Math.max(1, Math.round(b.hp * 0.75)); });
      if (hq) hq.hp = Math.max(1, Math.round(C().maxHp(hq) * 0.4));
      S.pop.grief = (S.pop.grief || 0) + 6; PW.stat(S, 'wavesLost');
      PW.log(S, '🔥 Die Zuflucht wurde überrannt (Welle ' + a.n + '). Verloren: ' + PW.costText(loss) + '. Repariere Tor und Gebäude und baue die Verteidigung aus.', 'warn');
      S.waves.last = { n: a.n, won: false, loss, lost: a.lost, boss: a.boss };
    }
    if (S._ui && S._ui.waveDone) S._ui.waveDone(S.waves.last);
  };
  WV.repairGateCost = function (S) { const miss = C().gateMax(S) - S.city.gate; return miss > 1 ? { stone: Math.ceil(miss * 0.12), wood: Math.ceil(miss * 0.05) } : null; };
  WV.repairGate = function (S) {
    if (S.waves.active) return { ok: false, why: 'Nicht während eines Angriffs' };
    const c = WV.repairGateCost(S); if (!c) return { ok: false, why: 'Das Tor ist unbeschädigt' };
    if (!PW.pay(S.res, c, S.spent)) return { ok: false, why: 'Zu wenig Rohstoffe' };
    S.city.gate = C().gateMax(S); PW.log(S, '🧱 Tor repariert', 'bau'); return { ok: true };
  };

  WV.tick = function (S, dt) {
    const w = S.waves;
    if (w.active) { let t = dt; while (t > 1e-6 && S.waves.active) { const s = Math.min(STEP, t); WV.step(S, s); t -= s; } return; }   // auch Überfälle bei abgeschalteten Wellen laufen zu Ende
    if (S.cfg.waves === false) return;
    if (S.campaign && S.campaign.noWaves) { w.next = Math.max(w.next, S.time + 60); return; }
    if (!w.warned && S.time >= w.next - WV.warnTime(S)) { w.warned = true; const nn = w.n + 1; PW.log(S, '🔔 Kundschafter melden: Welle ' + nn + ' in ' + PW.fmtTime(w.next - S.time) + (nn % PW.WAVES.bossEvery === 0 ? ' – ein Boss ist dabei!' : ''), 'warn', { wave: 1 }); }
    if (S.time >= w.next) WV.start(S);
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
