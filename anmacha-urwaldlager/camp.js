/* Urwaldlager – Camp-Leben: Kandidaten-KI (Bedürfnisse, Tagesablauf, Arbeit, Gespräche, Streit, Freundschaften),
   Spieler-Aktionen (Holz, Wasser, Feuer, Kochen, Essen, Schlafen, Reden), Lagerfeuer-Runden und Video-Tagebuch */
(function (root) {
  'use strict';
  const E = root.UE, W = root.UWorld, I = root.UIn, D = root.JD, THREE = E.THREE, clamp = E.clamp;
  const SP = W.SP, pick = a => a[Math.floor(Math.random() * a.length)];
  const C = { npcs: [], byId: {}, claims: {}, playerCooking: false };
  let G = null, S = null, UI = null, Snd = null;
  const nm = c => c.short || (c.name.startsWith('Dr.') ? c.name.split(' ')[1] : c.name.split(' ')[0]);
  C.nm = nm;
  const fmt = (s, o) => s.replace(/\{(\w)\}/g, (m, k) => o[k] != null ? o[k] : m);

  // ---------- Beziehungen ----------
  C.key = (a, b) => a < b ? a + '|' + b : b + '|' + a;
  C.rel = (a, b) => a === b ? 100 : (G.rel[C.key(a, b)] || 0);
  C.addRel = (a, b, d, silent) => {
    if (a === b || !d) return; const k = C.key(a, b); G.rel[k] = clamp((G.rel[k] || 0) + d, -100, 100);
    if (!silent && (a === 'you' || b === 'you')) { const n = C.byId[a === 'you' ? b : a]; if (n) n.fx = { t: 1.8, txt: (d > 0 ? '+' : '') + Math.round(d) + (d > 0 ? ' 💚' : ' 💔'), cls: d > 0 ? 'good' : 'bad' }; }
  };
  C.relIcon = v => v >= 50 ? '💚' : v >= 15 ? '🙂' : v <= -35 ? '💔' : v <= -10 ? '😒' : '😐';
  C.cast = id => G.cast.find(c => c.id === id);
  C.alive = () => G.cast.filter(c => !c.out);

  // ---------- Aufbau ----------
  C.init = function (g, season, ui) {
    G = g; S = season; UI = ui; Snd = root.USnd; C.npcs.forEach(n => { if (n.fig) { W.scene.remove(n.fig.group); E.dispose(n.fig.group); } }); C.npcs = []; C.byId = {};
    G.cast.forEach((c, i) => {
      if (c.id === 'you') return; const L = Object.assign({}, c.look); const f = E.Figure(L); W.scene.add(f.group); f.setShadows(E.q.shadows);
      const n = { id: c.id, c, fig: f, x: 0, z: 0, yaw: 0, act: null, think: Math.random() * 2, say: null, fx: null, away: !!c.out, stuck: 0, lx: 0, lz: 0, speed: 2.4 + Math.random() * .5, col: '#ffffff' };
      C.npcs.push(n); C.byId[c.id] = n; f.group.visible = !c.out;
    });
    assignBeds(); C.placeForTime(); registerInteractions();
    W.npcShadows = on => C.npcs.forEach(n => n.fig.setShadows(on));
  };
  function assignBeds() { const all = G.cast; all.forEach((c, i) => { c.bed = i % W.beds.length; }); W.beds.forEach(b => { b.owner = null; }); all.forEach(c => { W.beds[c.bed].owner = c.id; }); }
  C.bedOf = id => W.beds[C.cast(id).bed];
  // Kandidaten passend zur Uhrzeit verteilen (Spielstart, Laden, nach Zeremonie)
  C.placeForTime = function () {
    const h = S.hour();
    C.npcs.forEach((n, i) => {
      n.act = null; n.think = .2 + Math.random(); n.away = n.c.out || (S.isAwayForTrial && S.isAwayForTrial(n.id)); n.fig.group.visible = !n.away;
      if (S.isNight()) { const b = C.bedOf(n.id); n.x = b.x; n.z = b.z; startAct(n, 'sleep', b, { dur: 9999 }); }
      else { const a = i / C.npcs.length * Math.PI * 2; n.x = Math.cos(a) * 6; n.z = Math.sin(a) * 6 + 1; }
    });
  };

  // ---------- Bedürfnisse ----------
  C.needsTick = function (gm) { // gm = vergangene Spielminuten
    const h = S.hour();
    G.cast.forEach(c => {
      if (c.out) return; const N = c.needs, n = C.byId[c.id], sleeping = c.id === 'you' ? W.player.state === 'sleep' : n && n.act && n.act.type === 'sleep' && n.act.phase === 'do';
      N.hunger = clamp(N.hunger - gm * .085, 0, 100);
      if (sleeping) N.energy = clamp(N.energy + gm * .3 * (G.camp.wet ? .7 : 1) * (G.camp.fuel > 0 || !S.isNight() ? 1 : .8), 0, 100);
      else { let dr = .055; if (c.id === 'you') { if (W.player.speed > 4) dr += .35; if (W.player.carry) dr += .06; } else if (n && n.act && (n.act.type === 'wood' || n.act.type === 'water' || n.act.type === 'cook')) dr += .07; if (N.hunger < 20) dr *= 1.6; N.energy = clamp(N.energy - gm * dr, 0, 100); }
      let mt = 55 + (N.hunger - 50) * .25 + (N.energy - 50) * .2 + (G.camp.fuel > 0 ? 0 : -8) + (W.rainK > .5 ? -6 : 0) + (G.camp.luxury ? 10 : 0);
      if (c.id !== 'you') { const fr = C.npcs.filter(o => o !== n && !o.away && C.rel(o.id, c.id) > 30).length; mt += fr * 3 - C.npcs.filter(o => o !== n && !o.away && C.rel(o.id, c.id) < -30).length * 4; }
      N.mood = clamp(N.mood + (mt - N.mood) * Math.min(1, gm * .01), 0, 100);
    });
    // Feuer brennt herunter
    const cp = G.camp; cp.fuel = clamp(cp.fuel - gm * (W.rainK > .5 ? .0045 : .0028), 0, 1); W.setFire(cp.fuel);
    W.energy = G.you.needs.energy;
  };

  // ---------- Kandidaten-KI ----------
  function startAct(n, type, target, o) { n.act = Object.assign({ type, tx: target ? target.x : n.x, tz: target ? target.z : n.z, phase: 'go', t: 0, dur: 4, pose: 'idle' }, o || {}); if (C.claims[type] != null) C.claims[type]++; }
  function endAct(n) { if (!n.act) return; if (C.claims[n.act.type] != null) C.claims[n.act.type] = Math.max(0, C.claims[n.act.type] - 1); if (n.act.seat) n.act.seat.used = null; if (n.act.branch) n.act.branch.claim = null; n.act = null; n.fig.hold(null); n.think = .3 + Math.random() * 1.2; }
  C.claims = { wood: 0, water: 0, fire: 0, cook: 0 };
  const freeSeat = (n, near) => { let best = null, bd = 1e9; W.seats.forEach(s => { if (s.used && s.used !== n.id) return; const d = Math.hypot(s.x - (near ? near.x : n.x), s.z - (near ? near.z : n.z)) + Math.random() * 2; if (d < bd) { bd = d; best = s; } }); return best; };
  const randomCampSpot = () => { const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 9; return { x: Math.cos(a) * r, z: Math.sin(a) * r + 1 }; };
  const isBusyForTalk = n => !n.act || ['wander', 'sit', 'idle', 'rest', 'sun', 'yoga', 'pond'].includes(n.act.type);
  C.isNominee = id => G.today && G.today.nominees && G.today.nominees.includes(id);
  function plan(n) {
    const c = n.c, p = D.TRAITS[c.trait], h = S.hour(), cp = G.camp, N = c.needs;
    if (S.isNight()) return startAct(n, 'sleep', C.bedOf(n.id), { dur: 9999 });
    if (G.today.ceremonyCalled && !G.today.ceremonyDone) { const s = S.stageSpot(n.id); return startAct(n, 'stage', s, { dur: 9999, yaw: s.yaw }); }
    if (C.isNominee(n.id) && h >= 9.5 && !G.today.npcTrialDone && !G.today.npcTrialGone) return startAct(n, 'toGate', SP.gate, { dur: .5, hurry: true });
    if (n.want && n.want.until > G.clock && W.player.state === 'free') { return startAct(n, 'approach', W.player, { dur: 30, follow: true }); }
    if (cp.meal.ready && !cp.meal.eaten.includes(c.id) && h >= 18.3) { const s = freeSeat(n, SP.fire); if (s) { s.used = n.id; return startAct(n, 'eat', SP.fire, { dur: 3, seat: s, then: 'sit' }); } }
    if (!G.today.breakfast && h >= 7 && h < 9 && p.fleiss > .6 && !C.claims.cook && cp.water > 0) { return startAct(n, 'breakfast', { x: .9, z: .9 }, { dur: 5, pose: 'work', say: 'cook' }); }
    if (h >= 19.4 && h < 22.3) { if (Math.random() < .55 + p.sozial * .4) { const s = freeSeat(n, SP.fire); if (s) { s.used = n.id; return startAct(n, 'sit', s, { dur: 30 + Math.random() * 40, seat: s, fire: true }); } } if (h > 21.2 && N.energy < 45) return startAct(n, 'sleep', C.bedOf(n.id), { dur: 9999 }); }
    if (h >= 17 && h < 19 && !cp.meal.ready && !G.today.dinnerDone && !C.claims.cook && !C.playerCooking && cp.water >= 2 && cp.fuel > .05 && (h > 17.6 || p.fleiss > .7)) return startAct(n, 'cook', { x: .9, z: -.9 }, { dur: 9, pose: 'work', say: 'cook' });
    if (N.energy < 22) { const hm = SP.hammock, used = C.npcs.some(o => o !== n && o.act && o.act.type === 'rest' && o.act.hm); return startAct(n, 'rest', used ? C.bedOf(n.id) : { x: hm.x, z: hm.z + .3 }, { dur: 18, pose: used ? 'sleep' : 'sleep', hm: !used }); }
    if (N.hunger < 28) { const f = W.fruit.filter(f => f.n > 0).sort((a, b) => Math.hypot(a.x - n.x, a.z - n.z) - Math.hypot(b.x - n.x, b.z - n.z))[0]; if (f && Math.random() < .5) return startAct(n, 'forage', { x: f.x + 1.2, z: f.z }, { dur: 3, pose: 'work', fruit: f }); }
    // Arbeit fürs Camp – Faule arbeiten selten, Fleißige oft
    const lazy = 1 - p.fleiss, tired = N.energy < 35 ? .45 : 1, reform = c.reform ? .35 : 0;
    const uW = (clamp((6 - cp.wood) / 6, 0, 1) * .9 + .1) * (p.fleiss + reform) * tired / (1 + C.claims.wood * 1.2);
    const uA = (clamp((6 - cp.water) / 6, 0, 1) * .9 + .1) * (p.fleiss + reform) * tired / (1 + C.claims.water * 1.4);
    const uF = cp.fuel < .4 && cp.wood > 0 && !C.claims.fire ? (1 - cp.fuel) * (p.fleiss + .3) : 0;
    const uS = p.sozial * .55 * (N.mood > 30 ? 1 : .5), uI = .25 + lazy * .6;
    const r = () => .75 + Math.random() * .5, opts = [['wood', uW * r()], ['water', uA * r()], ['fire', uF * r()], ['social', uS * r()], ['idle', uI * r()]].sort((a, b) => b[1] - a[1]);
    const choice = opts[0][0];
    if (choice === 'fire') return startAct(n, 'fire', SP.wood, { dur: 1.5, pose: 'work', stage: 0 });
    if (choice === 'wood') { const b = W.branches.filter(b => b.have && !b.claim).sort((a, b2) => Math.hypot(a.x - n.x, a.z - n.z) - Math.hypot(b2.x - n.x, b2.z - n.z))[0]; if (b) { b.claim = n.id; return startAct(n, 'wood', b, { dur: 2.5, pose: 'work', branch: b, stage: 0, say: 'work' }); } }
    if (choice === 'water') return startAct(n, 'water', SP.barrel, { dur: 1, stage: 0, say: 'water' });
    if (choice === 'social') { if (trySocial(n)) return; }
    // Freizeit je nach Typ
    const t = c.trait, rr = Math.random();
    if (t === 'diva' && rr < .5) return startAct(n, 'sun', { x: 9 + Math.random() * 3, z: 9 + Math.random() * 2 }, { dur: 20, pose: 'sleep' });
    if (t === 'sensibel' && rr < .5) return startAct(n, 'yoga', { x: 6 + Math.random() * 3, z: -2 + Math.random() * 3 }, { dur: 12, pose: 'cheer' });
    if ((t === 'stratege' || t === 'diva' || t === 'clown') && rr < .2 && c.diaryDay !== G.day) { c.diaryDay = G.day; return startAct(n, 'diary', { x: SP.hut.x, z: SP.hut.z }, { dur: 6, pose: 'talk' }); }
    if (rr < .25) return startAct(n, 'pond', { x: SP.well.x + Math.random() * 2, z: SP.well.z + (Math.random() - .5) * 4 }, { dur: 8, pose: 'crouch' });
    if (rr < .55) { const s = freeSeat(n); if (s) { s.used = n.id; return startAct(n, 'sit', s, { dur: 10 + Math.random() * 14, seat: s }); } }
    return startAct(n, 'wander', randomCampSpot(), { dur: 2 + Math.random() * 3 });
  }
  function trySocial(n) {
    const c = n.c, p = D.TRAITS[c.trait], h = S.hour();
    const cands = C.npcs.filter(o => o !== n && !o.away && isBusyForTalk(o) && Math.hypot(o.x - n.x, o.z - n.z) < 30);
    if (!cands.length) return false;
    // Streit? (geringe Beziehung, schlechte Laune oder Faulheit)
    const lazyTarget = p.fleiss > .75 && c.workDay >= 2 && h > 13.5 ? cands.find(o => o.c.workDay === 0 && D.TRAITS[o.c.trait].fleiss < .5 && !o.c.reform) : null;
    let partner = lazyTarget || null, argue = !!lazyTarget;
    if (!partner) {
      cands.sort((a, b) => (C.rel(n.id, b.id) + D.aff(c.trait, b.c.trait) * 30 + Math.random() * 40) - (C.rel(n.id, a.id) + D.aff(c.trait, a.c.trait) * 30 + Math.random() * 40));
      const enemy = cands.find(o => C.rel(n.id, o.id) < -25 && (c.needs.mood < 55 || o.c.needs.mood < 50) && Math.random() < p.drama * .5);
      if (enemy) { partner = enemy; argue = true; } else partner = cands[0];
    }
    const mx = (n.x + partner.x) / 2, mz = (n.z + partner.z) / 2, d = Math.hypot(partner.x - n.x, partner.z - n.z) || 1, ux = (partner.x - n.x) / d, uz = (partner.z - n.z) / d;
    const pa = { x: mx - ux * .75, z: mz - uz * .75 }, pb = { x: mx + ux * .75, z: mz + uz * .75 }; const [ax, az] = W.collide(pa.x, pa.z, .3), [bx, bz] = W.collide(pb.x, pb.z, .3);
    const type = argue ? 'argue' : 'chat', dur = argue ? 14 : 8 + Math.random() * 5;
    endAct(partner); startAct(n, type, { x: ax, z: az }, { dur, pose: argue ? 'argue' : 'talk', other: partner.id, lazy: !!lazyTarget }); startAct(partner, type, { x: bx, z: bz }, { dur, pose: argue ? 'argue' : 'talk', other: n.id, passive: true });
    if (argue) { G.today.args = (G.today.args || 0) + 1; S.log(`${nm(c)} und ${nm(partner.c)} streiten${lazyTarget ? ' über die Arbeit im Camp' : ''}.`); }
    return true;
  }
  // Aktivität abschließen (Wirkung)
  function finishAct(n) {
    const a = n.act, c = n.c, cp = G.camp;
    switch (a.type) {
      case 'wood': if (a.stage === 0) { if (a.branch && a.branch.have) { a.branch.have = false; a.branch.t = 0; W.updateProps(cp); n.fig.hold('wood'); a.stage = 1; a.phase = 'go'; a.tx = SP.wood.x - 1; a.tz = SP.wood.z + .8; a.dur = .6; a.pose = 'idle'; return; } break; }
        cp.wood = Math.min(12, cp.wood + 1); c.work++; c.workDay++; W.updateProps(cp); say(n, 'work', .3); break;
      case 'water': if (a.stage === 0) { n.fig.hold('bucket'); a.stage = 1; a.phase = 'go'; a.tx = SP.well.x - .3; a.tz = SP.well.z + (Math.random() - .5) * 2; a.dur = 2; a.pose = 'crouch'; return; }
        if (a.stage === 1) { n.fig.hold('bucketFull'); a.stage = 2; a.phase = 'go'; a.tx = SP.barrel.x + .9; a.tz = SP.barrel.z; a.dur = 1; a.pose = 'work'; return; }
        cp.water = Math.min(10, cp.water + 2); c.work++; c.workDay++; W.updateProps(cp); break;
      case 'fire': if (a.stage === 0) { if (cp.wood <= 0) break; cp.wood--; W.updateProps(cp); n.fig.hold('wood'); a.stage = 1; a.phase = 'go'; a.tx = 1.4; a.tz = .6; a.dur = 1.5; return; } cp.fuel = Math.min(1, cp.fuel + .4); W.setFire(cp.fuel); c.work++; c.workDay++; break;
      case 'cook': if (!cp.meal.ready && cp.water >= 2) { S.cookMeal(c.id, .45 + D.TRAITS[c.trait].fleiss * .25 + Math.random() * .1); c.work += 2; c.workDay += 2; } break;
      case 'breakfast': if (!G.today.breakfast) { S.breakfast(c.id); c.work++; c.workDay++; } break;
      case 'eat': S.eat(c.id); if (a.seat) { a.type = 'sit'; a.phase = 'do'; a.t = 0; a.dur = 20; a.pose = 'sit'; a.fire = true; return; } break;
      case 'forage': if (a.fruit && a.fruit.n > 0) { a.fruit.n--; c.needs.hunger = Math.min(100, c.needs.hunger + 14); W.updateProps(cp); } break;
      case 'chat': case 'argue': if (!a.passive) resolveTalk(n, C.byId[a.other], a.type === 'argue', a.lazy); break;
      case 'diary': S.aud(c.id, { E: 2 }, 'Tagebuch-Auftritt', true); break;
      case 'toGate': n.away = true; n.fig.group.visible = false; G.today.npcTrialGone = true; break;
      case 'approach': if (n.want) { n.want = null; C.addRel(n.id, 'you', -2); say(n, null, 1, 'Na gut, dann eben nicht.'); } break;
      case 'yoga': case 'pond': c.needs.mood = Math.min(100, c.needs.mood + 6); break;
      case 'rest': break;
    }
    endAct(n);
  }
  function resolveTalk(a, b, argue, lazy) {
    if (!b) return; const ta = a.c.trait, tb = b.c.trait;
    if (argue) {
      C.addRel(a.id, b.id, -7 - Math.random() * 4); S.aud(a.id, { E: 3, S: lazy ? 1 : -1 }, lazy ? 'stellt Faulpelz zur Rede' : 'Streit im Camp', true); S.aud(b.id, { E: 3, S: lazy ? -2 : -1 }, lazy ? 'wird wegen Faulheit kritisiert' : 'Streit im Camp', true);
      a.c.needs.mood -= 6; b.c.needs.mood -= 8; if (lazy && Math.random() < .5) { b.c.reform = true; }
      // andere ergreifen Partei
      C.npcs.forEach(o => { if (o === a || o === b || o.away) return; const d = Math.hypot(o.x - a.x, o.z - a.z); if (d < 12) { const side = C.rel(o.id, a.id) > C.rel(o.id, b.id) ? b : a; C.addRel(o.id, side.id, -2, true); } });
    } else {
      const d = 2 + D.aff(ta, tb) * 4 + (a.c.needs.mood + b.c.needs.mood - 100) / 40 + (Math.random() - .4) * 2; C.addRel(a.id, b.id, d);
      a.c.needs.mood = Math.min(100, a.c.needs.mood + 3); b.c.needs.mood = Math.min(100, b.c.needs.mood + 3);
      if (C.rel(a.id, b.id) > 55 && !G.friends.includes(C.key(a.id, b.id))) { G.friends.push(C.key(a.id, b.id)); S.log(`${nm(a.c)} und ${nm(b.c)} sind jetzt dicke Freunde.`); S.aud(a.id, { S: 1 }, 'Freundschaft im Camp', true); S.aud(b.id, { S: 1 }, 'Freundschaft im Camp', true); }
      if (C.rel(a.id, b.id) < -40 && !G.rivals.includes(C.key(a.id, b.id))) { G.rivals.push(C.key(a.id, b.id)); S.log(`${nm(a.c)} und ${nm(b.c)} können sich nicht ausstehen.`); }
    }
  }
  function say(n, kind, prob, txt) { if (prob != null && Math.random() > prob) return; let t = txt; if (!t) { const pool = kind === 'line' ? D.LINES[n.id] || D.SAY.chat : D.SAY[kind]; if (!pool) return; t = pick(pool); } n.say = { txt: t, t: 3.2, cls: kind === 'argue' ? 'argue' : '' }; }
  C.say = (id, kind, txt) => { const n = C.byId[id]; if (n) say(n, kind, null, txt); };

  function moveTo(n, dt, tx, tz, hurry) {
    const dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz); if (d < .25) return true;
    const sp = (hurry ? 4.2 : n.speed) * (n.c.needs.energy < 15 ? .7 : 1), step = Math.min(d, sp * dt);
    let nx = n.x + dx / d * step, nz = n.z + dz / d * step;
    // Ausweichen: andere Figuren
    for (const o of C.npcs) { if (o === n || o.away) continue; const ox = nx - o.x, oz = nz - o.z, od = Math.hypot(ox, oz); if (od < .6 && od > 1e-3) { nx += ox / od * (.6 - od) * .5; nz += oz / od * (.6 - od) * .5; } }
    const px = nx - W.player.x, pz = nz - W.player.z, pd = Math.hypot(px, pz); if (pd < .65 && pd > 1e-3) { nx += px / pd * (.65 - pd); nz += pz / pd * (.65 - pd); }
    [nx, nz] = W.collide(nx, nz, .3);
    const moved = Math.hypot(nx - n.x, nz - n.z); n.stuck = moved < step * .25 ? n.stuck + dt : Math.max(0, n.stuck - dt);
    if (n.stuck > 1.2) { const s = Math.random() < .5 ? 1 : -1; nx += -dz / d * s * .6; nz += dx / d * s * .6;[nx, nz] = W.collide(nx, nz, .3); n.stuck = 0; }
    n.yaw = E.angLerp(n.yaw, Math.atan2(nx - n.x, nz - n.z), Math.min(1, dt * 8)); n.x = nx; n.z = nz; n.spd = moved / Math.max(dt, 1e-4);
    return false;
  }
  C.update = function (dt) {
    const h = S.hour(), pl = W.player;
    for (const n of C.npcs) {
      if (n.away) continue;
      if (!n.act) { n.think -= dt; if (n.think <= 0) plan(n); }
      let pose = 'idle', speed = 0; const a = n.act;
      if (a) {
        if (a.follow) { a.tx = pl.x; a.tz = pl.z; }
        if (a.phase === 'go') {
          const there = moveTo(n, dt, a.tx, a.tz, a.hurry || a.type === 'stage' || a.type === 'toGate');
          pose = n.fig.heldKind === 'wood' ? 'carry' : 'walk'; speed = n.spd || 2;
          if (a.follow && Math.hypot(pl.x - n.x, pl.z - n.z) < 1.8) { a.phase = 'do'; a.t = 0; n.yaw = Math.atan2(pl.x - n.x, pl.z - n.z); say(n, null, 1, n.want && n.want.hello || 'Hey, hast du kurz Zeit?'); }
          else if (there && !a.follow) { a.phase = 'do'; a.t = 0; if (a.seat) { n.x = a.seat.x; n.z = a.seat.z; n.yaw = a.seat.yaw; } else if (a.yaw != null) n.yaw = a.yaw; else if (a.other && C.byId[a.other]) { const o = C.byId[a.other]; n.yaw = Math.atan2(o.x - n.x, o.z - n.z); } else if (a.type === 'sleep') { const b = C.bedOf(n.id); n.x = b.x; n.z = b.z; n.yaw = b.yaw; } if (a.say) say(n, a.say, .5); if (a.type === 'argue') say(n, a.lazy && !a.passive ? null : 'argue', 1, a.lazy && !a.passive ? 'Du hast heute noch gar nichts gemacht!' : null); }
          if (a.type === 'stage' || a.type === 'sleep') a.t += 0; else { a.goT = (a.goT || 0) + dt; if (a.goT > 40) { endAct(n); continue; } }
        } else {
          a.t += dt; pose = a.pose || (a.seat ? 'sit' : 'idle'); if (a.type === 'sit' || a.type === 'eat') pose = 'sit'; if (a.type === 'sleep') pose = 'sleep';
          if (a.type === 'chat' && Math.random() < dt * .35) say(n, Math.random() < .3 ? 'line' : 'chat');
          if (a.type === 'argue' && Math.random() < dt * .45) say(n, 'argue');
          if (a.follow) { n.yaw = Math.atan2(pl.x - n.x, pl.z - n.z); if (Math.hypot(pl.x - n.x, pl.z - n.z) > 3) a.phase = 'go'; }
          if (a.type === 'sit' && a.fire && Math.random() < dt * .03) say(n, Math.random() < .5 ? 'line' : 'happy');
          if ((a.type === 'stage') && a.yaw != null) n.yaw = a.yaw;
          if (a.t >= a.dur) finishAct(n);
          if (a.type === 'sleep' && !S.isNight()) endAct(n);
          if (a.type === 'stage' && G.today.ceremonyDone) endAct(n);
        }
        if (n.act && n.act.type === 'sit' && n.act.fire && h >= 22.3) endAct(n);
      }
      // Bedürfnis-Kommentare
      if (!n.say && Math.random() < dt * .01) { const N = n.c.needs; if (N.hunger < 25) say(n, 'hungry'); else if (N.energy < 20) say(n, 'tired'); else if (G.camp.fuel <= 0 && h > 18) say(n, 'cold'); else if (W.rainK > .6) say(n, 'rain'); else if (N.mood > 75) say(n, 'happy', .4); else if (N.mood < 30) say(n, 'sad'); }
      if (n.say) { n.say.t -= dt; if (n.say.t <= 0) n.say = null; } if (n.fx) { n.fx.t -= dt; if (n.fx.t <= 0) n.fx = null; }
      n.fig.anim(dt, pose, speed); n.fig.group.position.set(n.x, W.heightAt(n.x, n.z) + (pose === 'sleep' ? .25 : 0), n.z); n.fig.group.rotation.y = n.yaw;
      const r = C.rel(n.id, 'you'); n.col = r >= 50 ? '#9dff5c' : r <= -30 ? '#ff6b4a' : '#ffffff';
    }
    // Äste wachsen nach
    W.branches.forEach(b => { if (!b.have) { b.t += dt; if (b.t > 70) { b.have = true; W.updateProps(G.camp); } } });
  };
  // Namen und Sprechblasen
  C.labels = function () {
    const pl = W.player, list = C.npcs.filter(n => !n.away).map(n => ({ n, d: Math.hypot(n.x - pl.x, n.z - pl.z) })).sort((a, b) => a.d - b.d);
    let bubbles = 0;
    list.forEach(({ n, d }) => {
      const y = W.heightAt(n.x, n.z) + (n.act && n.act.type === 'sleep' && n.act.phase === 'do' ? .9 : n.act && (n.act.type === 'sit' || n.act.type === 'eat') && n.act.phase === 'do' ? 1.6 : 2.05);
      if (n.say && d < 20 && bubbles < 4) { W.label(n.x, y + .35, esc(n.say.txt), 'say ' + n.say.cls); bubbles++; }
      else if (n.fx && d < 25) W.label(n.x, y + .3, n.fx.txt, n.fx.cls === 'good' ? 'say' : 'say argue');
      else if (d < 9) { const r = C.rel(n.id, 'you'); W.label(n.x, y, `${esc(nm(n.c))}<span class="r">${C.relIcon(r)}</span>`); }
    });
  };
  const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  // ---------- Spieler-Interaktionen ----------
  const pl = W.player;
  function busy(sec, pose, done, label) { pl.state = 'busy'; pl.busyPose = pose || 'work'; pl.busyT = sec; pl.busyMax = sec; pl.busyDone = done; pl.busyLabel = label || ''; }
  C.isBusy = () => pl.state === 'busy'; C.busy = busy;
  C.updatePlayer = function (dt) {
    if (pl.state === 'busy') { pl.busyT -= dt; if (I.move.mag > .5 && pl.busyMax > 2.5) { pl.state = 'free'; pl.busyDone = null; UI.toast('Abgebrochen'); } if (pl.busyT <= 0) { pl.state = 'free'; const f = pl.busyDone; pl.busyDone = null; f && f(); } }
    if (pl.state === 'sit') { pl.sitT = (pl.sitT || 0) + dt; if (I.move.mag > .5 || I.pressed('act')) standUp(); else if (pl.hammock) { G.you.needs.energy = Math.min(100, G.you.needs.energy + dt * .9); G.you.needs.mood = Math.min(100, G.you.needs.mood + dt * .2); } }
    if (pl.state === 'talk' && !UI.dialogOpen()) pl.state = 'free';
    if (I.pressed('alt') && pl.carry === 'food') eatFruit();
  };
  function standUp() { pl.state = 'free'; if (pl.seat) { pl.seat.used = null; pl.seat = null; } if (pl.hammock) { pl.hammock = false; pl.x = SP.hammock.x; pl.z = SP.hammock.z + 1.2; } }
  C.standUp = standUp;
  function carry(k) { pl.carry = k || null; pl.fig.hold(k === 'food' ? 'food' : k); UI.carry && UI.carry(k); }
  C.carry = carry;
  function eatFruit() { carry(null); G.you.needs.hunger = Math.min(100, G.you.needs.hunger + 14); G.you.needs.mood = Math.min(100, G.you.needs.mood + 3); UI.toast('🍌 Lecker Frucht! (+14 Sattheit)'); Snd.swallow(); }
  function seenBy(range) { return C.npcs.filter(n => !n.away && Math.hypot(n.x - pl.x, n.z - pl.z) < (range || 14)); }
  function workCredit(kind) {
    const y = G.you; y.work++; y.workDay++; S.aud('you', { S: 1 }, kind === 'wood' ? 'sammelt Holz fürs Camp' : kind === 'water' ? 'holt Wasser fürs Camp' : kind === 'fire' ? 'hält das Feuer am Brennen' : 'packt im Camp mit an');
    seenBy(16).forEach(n => { const c = n.c; c.seenHelp = (c.seenHelp || 0) + 1; if (c.seenHelp % 3 === 1) { C.addRel(n.id, 'you', D.TRAITS[c.trait].fleiss > .7 ? 3 : 1); if (Math.random() < .4) say(n, 'thanks'); } });
    if (C.request && C.request.kind === kind) { const n = C.byId[C.request.id]; if (n) { C.addRel(n.id, 'you', 8); say(n, 'thanks', 1); S.aud('you', { S: 2 }, `erfüllt die Bitte von ${nm(n.c)}`); UI.toast(`✅ Bitte von ${nm(n.c)} erfüllt!`, 'good'); } C.request = null; }
    if (UI.tut) UI.tut(kind);
  }
  function registerInteractions() {
    W.interact.length = 0; const cp = () => G.camp;
    W.branches.forEach(b => W.addInteract({ x: b.x, z: b.z, r: 1.9, label: () => b.have && !pl.carry ? '🪵 Ast aufheben' : null, act: () => busy(.9, 'crouch', () => { if (!b.have) return; b.have = false; b.t = 0; W.updateProps(cp()); carry('wood'); Snd.thud(); UI.tut && UI.tut('pickwood'); }) }));
    W.fruit.forEach(f => W.addInteract({ x: f.x, z: f.z, r: 2.2, label: () => f.n > 0 && !pl.carry ? '🍌 Frucht pflücken' : null, act: () => busy(1, 'work', () => { if (f.n <= 0) return; f.n--; W.updateProps(cp()); carry('food'); UI.toast(UI.isTouch() ? 'Frucht: Taste „Essen“ oder an jemanden verschenken' : 'Frucht: [Q] essen oder im Gespräch verschenken'); }) }));
    W.addInteract({ x: SP.wood.x, z: SP.wood.z, r: 2.2, label: () => pl.carry === 'wood' ? '🪵 Holz auf den Stapel' : (!pl.carry && cp().wood > 0 && cp().fuel < .85 ? '🪵 Holz nehmen (fürs Feuer)' : null), act: () => { if (pl.carry === 'wood') { carry(null); cp().wood = Math.min(12, cp().wood + 1); W.updateProps(cp()); Snd.thud(); workCredit('wood'); UI.toast('🪵 Holzvorrat: ' + cp().wood); } else { cp().wood--; W.updateProps(cp()); carry('wood'); } } });
    W.addInteract({ x: SP.fire.x, z: SP.fire.z, r: 2.6, prio: .5, label: () => {
      const h = S.hour(), c = cp();
      if (pl.carry === 'wood') return '🔥 Holz ins Feuer legen';
      if (c.meal.ready && !c.meal.eaten.includes('you')) return '🍲 Essen nehmen';
      if (!pl.carry && h >= 16.5 && h < 19.2 && !c.meal.ready && !G.today.dinnerDone && !C.claims.cook) return '🍳 Abendessen kochen';
      if (!pl.carry && c.fuel < .5 && c.wood > 0) return '🔥 Feuer schüren (Holz vom Stapel)';
      return null;
    }, act: () => {
      const c = cp(), h = S.hour();
      if (pl.carry === 'wood') { carry(null); busy(.8, 'work', () => { c.fuel = Math.min(1, c.fuel + .4); W.setFire(c.fuel); workCredit('fire'); Snd.thud(); }); return; }
      if (c.meal.ready && !c.meal.eaten.includes('you')) { S.eat('you'); return; }
      if (h >= 16.5 && h < 19.2 && !c.meal.ready && !G.today.dinnerDone) { if (c.water < 2) { UI.toast('💧 Zum Kochen braucht ihr mindestens 2 Wasser im Fass!', 'bad'); return; } if (c.fuel <= .02) { UI.toast('🔥 Das Feuer ist aus – erst Holz nachlegen!', 'bad'); return; } C.cookMini(); return; }
      if (c.wood > 0) { c.wood--; W.updateProps(c); busy(.8, 'work', () => { c.fuel = Math.min(1, c.fuel + .4); W.setFire(c.fuel); workCredit('fire'); }); }
    } });
    W.addInteract({ x: SP.barrel.x, z: SP.barrel.z, r: 2.1, label: () => pl.carry === 'bucketFull' ? '💧 Wasser ins Fass gießen' : !pl.carry ? (cp().water < 10 ? '🪣 Eimer nehmen' : null) : null, act: () => { if (pl.carry === 'bucketFull') { busy(.7, 'work', () => { carry(null); cp().water = Math.min(10, cp().water + 2); W.updateProps(cp()); Snd.splash(); workCredit('water'); UI.toast('💧 Wasser im Fass: ' + cp().water); }); } else { carry('bucket'); UI.tut && UI.tut('bucket'); } } });
    W.addInteract({ x: SP.well.x, z: SP.well.z, r: 3.2, label: () => pl.carry === 'bucket' ? '🪣 Wasser schöpfen' : !pl.carry && (G.today.washed || 0) < 2 ? '🌊 Frisch machen' : null, act: () => { if (pl.carry === 'bucket') busy(1.3, 'crouch', () => { carry('bucketFull'); Snd.splash(); }); else busy(2, 'crouch', () => { G.today.washed = (G.today.washed || 0) + 1; G.you.needs.mood = Math.min(100, G.you.needs.mood + 8); G.you.needs.energy = Math.min(100, G.you.needs.energy + 6); Snd.splash(); UI.toast('🌊 Erfrischt! (+Stimmung, +Energie)'); }); } });
    W.addInteract({ x: SP.drum.x, z: SP.drum.z, r: 2.3, label: () => '🥁 Buschtrommel', act: () => UI.drumPanel() });
    W.addInteract({ x: SP.hut.x, z: SP.hut.z + .6, r: 2.4, label: () => G.today.diaryDone ? null : '🎥 Video-Tagebuch aufnehmen', act: () => C.diary() });
    W.addInteract({ x: SP.hammock.x, z: SP.hammock.z + .4, r: 2, label: () => C.npcs.some(n => n.act && n.act.hm && n.act.phase === 'do') ? null : '😌 In die Hängematte', act: () => { pl.state = 'sit'; pl.hammock = true; pl.x = SP.hammock.x; pl.z = SP.hammock.z; pl.yaw = 0; pl.sitT = 0; UI.toast('Ausruhen … (bewegen zum Aufstehen)'); } });
    W.addInteract({ pos: () => { const b = C.bedOf('you'); return b; }, r: 2, label: () => S.canSleep() ? '😴 Schlafen gehen' : (S.hour() >= 9 && S.hour() < 17 ? '💤 Nickerchen (1 Std.)' : null), act: () => { if (S.canSleep()) S.goSleep(); else nap(); } });
    W.seats.forEach(s => W.addInteract({ x: s.x, z: s.z, r: 1.2, label: () => s.used ? null : '🪵 Hinsetzen', act: () => { s.used = 'you'; pl.seat = s; pl.state = 'sit'; pl.x = s.x; pl.z = s.z; pl.yaw = s.yaw; pl.sitT = 0; C.checkCampfire(); } }));
    W.addInteract({ x: SP.gate.x, z: SP.gate.z - 1.2, r: 3, prio: 2, label: () => S.trialReady() ? '⭐ Zur Prüfung antreten!' : null, act: () => S.enterTrial() });
    W.addInteract({ x: SP.stage.x, z: SP.stage.z, r: 6.5, prio: 2, label: () => G.today.ceremonyCalled && !G.today.ceremonyDone && !G.today.ceremonyRunning ? '🎤 Zur Abendrunde' : null, act: () => S.ceremony() });
    C.npcs.forEach(n => W.addInteract({ pos: () => n.away ? null : n, r: 2.1, label: () => n.away || (n.act && n.act.type === 'sleep' && n.act.phase === 'do') ? null : (n.want ? `❗ ${nm(n.c)} will reden` : `💬 Mit ${nm(n.c)} reden`), act: () => C.talk(n) }));
    if (C.extraInteract) C.extraInteract();
  }
  C.register = registerInteractions;
  function nap() { busy(2.5, 'sleep', () => { S.advance(60); G.you.needs.energy = Math.min(100, G.you.needs.energy + 14); UI.toast('💤 Eine Stunde gedöst (+14 Energie)'); }); pl.busyPose = 'sleep'; const b = C.bedOf('you'); pl.x = b.x; pl.z = b.z; pl.yaw = b.yaw; }

  // ---------- Gespräche ----------
  const EFF = {
    plaudern: { '+': { rel: 5, S: 1 }, '0': { rel: 1 }, '-': { rel: -2 } },
    witz: { '+': { rel: 5, E: 3, S: 1 }, '0': { rel: 1, E: 1 }, '-': { rel: -4, E: 1 } },
    kompliment: { '+': { rel: 6, S: 1 }, '0': { rel: 2 }, '-': { rel: -3 } },
    hilfe: { '+': { rel: 5, S: 2, help: 1 }, '0': { rel: 2, help: 1 }, '-': { rel: -1 } },
    lastern: { '+': { rel: 4, E: 3, S: -2, gossip: 1 }, '0': { rel: 0, E: 1, S: -1, gossip: 1 }, '-': { rel: -6, S: -2, gossip: 1 } },
    buendnis: { '+': { rel: 8, S: 2, ally: 1 }, '0': { rel: 1 }, '-': { rel: -3 } },
    kritik: { '+': { rel: -2, E: 3, S: 2, reform: 1 }, '0': { rel: -4, E: 2 }, '-': { rel: -12, E: 5, S: -1, argue: 1 } },
    troesten: { '+': { rel: 12, S: 3, mood: 22 }, '0': { rel: 4, S: 1, mood: 8 }, '-': { rel: -1 } },
    teilen: { '+': { rel: 12, S: 2, give: 1 }, '0': { rel: 6, give: 1 }, '-': { rel: 0 } },
    einladen: { '+': { rel: 2, invite: 1 }, '0': { rel: 0 }, '-': { rel: -1 } },
    entschuldigen: { '+': { rel: 10, S: 1, clear: 1 }, '0': { rel: 4, clear: 1 }, '-': { rel: -2 } }
  };
  function score(n, opt) {
    const c = n.c, p = D.TRAITS[c.trait], r = C.rel(n.id, 'you'), N = c.needs, talks = (G.today.talked[n.id] || 0);
    let s = .6 + r / 45 + (N.mood - 50) / 60 - talks * .45 + (Math.sin(G.day * 7.1 + n.id.length * 3 + talks) * .35);
    if (p.likes.includes(opt)) s += 1.3; if (p.hates.includes(opt)) s -= 1.4;
    if (opt === 'witz') s += (p.humor - .5) * 2; if (opt === 'troesten') s += N.mood < 40 ? 1.2 : -1.2;
    if (opt === 'kritik') { s += (G.you.workDay - c.workDay) * .4 - (c.workDay > 0 ? 1.5 : 0) - p.drama; }
    if (opt === 'buendnis') s += (r - 50) / 15; if (opt === 'teilen') s += N.hunger < 50 ? 1.5 : -.5; if (opt === 'hilfe') s += n.act && ['wood', 'water', 'fire', 'cook'].includes(n.act.type) ? 1 : -.2;
    if (opt === 'lastern') { const x = C.lastX; if (x) s += -C.rel(n.id, x.id) / 30; s += p.drama - p.empathie; }
    if (opt === 'einladen') s += p.sozial; if (opt === 'entschuldigen') s += p.empathie;
    return s > 1 ? '+' : s < -.4 ? '-' : '0';
  }
  function optionsFor(n) {
    const c = n.c, o = [], h = S.hour(), r = C.rel(n.id, 'you'), N = c.needs;
    if (c.angry) o.push('entschuldigen');
    if (N.mood < 40) o.push('troesten');
    if (pl.carry === 'food') o.push('teilen');
    if (G.today.mission && G.today.mission.kind === 'invite' && !G.today.mission.done && !G.today.mission.ids.includes(n.id)) o.push('einladen');
    if (c.workDay === 0 && h > 13 && D.TRAITS[c.trait].fleiss < .6 && !c.reform) o.push('kritik');
    o.push('plaudern');
    if (n.act && ['wood', 'water', 'fire'].includes(n.act.type)) o.push('hilfe');
    if (r >= 40 && !c.ally && G.cast.filter(x => x.ally).length < 2) o.push('buendnis');
    o.push('witz', 'kompliment', 'lastern');
    return [...new Set(o)].slice(0, 4);
  }
  C.talk = function (n) {
    if (!n || n.away) return; endAct(n); startAct(n, 'idle', n, { dur: 999, pose: 'talk' }); n.act.phase = 'do'; n.yaw = Math.atan2(pl.x - n.x, pl.z - n.z); pl.yaw = Math.atan2(n.x - pl.x, n.z - pl.z); pl.state = 'talk';
    if (n.want) { const w = n.want; n.want = null; if (w.kind === 'moment') return moment(n, w); if (w.kind === 'request') return request(n, w); if (w.kind === 'confront') return confront(n); }
    let rounds = 0; const others = C.npcs.filter(o => o !== n && !o.away); C.lastX = others.sort((a, b) => C.rel('you', a.id) - C.rel('you', b.id))[0] || null;
    const show = (text, chips) => {
      const opts = rounds >= 3 ? [] : optionsFor(n).map(k => ({ id: k, label: k === 'lastern' ? (C.lastX ? fmt(D.TALK[k].l, { X: nm(C.lastX.c) }) : null) : D.TALK[k].l, sub: D.TALK[k].s })).filter(x => x.label);
      opts.push({ id: 'bye', label: '👋 Tschüss', sub: '' });
      UI.dialog({ who: c(n), text, chips, options: opts, onPick: id => { if (id === 'bye') return close(); rounds++; const res = applyTalk(n, id); show(res.text, res.chips); } });
    };
    const c = x => x.c; const close = () => { UI.closeDialog(); endTalk(n); };
    const greet = C.rel(n.id, 'you') < -30 ? 'Was willst du?' : pick(D.SAY.hi.concat(D.LINES[n.id] || []));
    show(greet, null); Snd.click();
  };
  function endTalk(n) { pl.state = 'free'; if (n.act && n.act.type === 'idle') endAct(n); S.advance(6); }
  function applyTalk(n, k) {
    const c = n.c, out = score(n, k), e = EFF[k][out], chips = [], talks = G.today.talked[n.id] || 0, f = Math.pow(.6, talks), X = C.lastX;
    G.today.talked[n.id] = talks + 1;
    if (e.rel) { const d = Math.round(e.rel * (e.rel > 0 ? f : 1)); C.addRel(n.id, 'you', d); chips.push(['Beziehung ' + nm(c), d]); }
    if (e.S || e.E) { S.aud('you', { S: e.S || 0, E: e.E || 0 }, { witz: 'erzählt Witze', lastern: 'lästert hinter dem Rücken', kritik: 'spricht Probleme offen an', troesten: 'tröstet Mitcamper', teilen: 'teilt ihr Essen', hilfe: 'hilft Mitcampern', buendnis: 'schmiedet ein Bündnis', kompliment: 'macht Komplimente', plaudern: 'ist gesellig', entschuldigen: 'entschuldigt sich' }[k] || 'Gespräch'); if (e.S) chips.push(['Sympathie', e.S]); if (e.E) chips.push(['Unterhaltung', e.E]); }
    if (e.mood) c.needs.mood = Math.min(100, c.needs.mood + e.mood);
    if (e.reform) { c.reform = true; } if (e.argue) { startArgueWithPlayer(n); }
    if (e.ally && !c.ally) { c.ally = true; S.log(`Bündnis mit ${nm(c)} geschlossen.`); chips.push(['Bündnis 🛡️', 1]); }
    if (e.give) { carry(null); c.needs.hunger = Math.min(100, c.needs.hunger + 14); }
    if (e.invite) { const m = G.today.mission; if (m && !m.ids.includes(n.id)) { m.ids.push(n.id); UI.toast(`🔥 Einladungen: ${m.ids.length}/${m.need}`); } }
    if (e.clear) { c.angry = false; }
    if (e.gossip && X) { G.gossip.push({ about: X.id, to: n.id, at: G.clock + 60 + Math.random() * 240, day: G.day, out, done: false }); if (out === '+') C.addRel(n.id, X.id, -3, true); }
    if (k === 'hilfe' && out !== '-' && n.act) { UI.toast(`🤝 Hilf ${nm(c)}: ${n.act.type === 'water' ? 'hol Wasser!' : 'bring Holz!'}`); C.request = { id: n.id, kind: n.act.type === 'water' ? 'water' : 'wood' }; }
    Snd[out === '+' ? 'star' : out === '-' ? 'bad' : 'click']();
    let text = fmt(pick(D.TALK[k][out]), { X: X ? nm(X.c) : 'jemand' });
    if (k === 'kritik' && out === '+') text += ' (packt jetzt öfter mit an)';
    return { text, chips };
  }
  function startArgueWithPlayer(n) { say(n, 'argue', 1); n.c.needs.mood -= 10; G.today.args = (G.today.args || 0) + 1; S.log(`Streit zwischen dir und ${nm(n.c)}.`); }
  // Moment: Mitcamper spricht dich mit einer Situation an
  function moment(n, w) {
    const ev = D.EVENTS[w.idx], others = C.npcs.filter(o => o !== n && !o.away), B = others.length ? pick(others) : n, o = { A: nm(n.c), B: nm(B.c) };
    UI.dialog({ who: n.c, text: fmt(ev.t, o), options: ev.ch.map((ch, i) => ({ id: i, label: fmt(ch.l, o) })), onPick: i => {
      const ch = ev.ch[i], chips = []; if (ch.sym) { S.aud('you', { S: ch.sym > 0 ? Math.ceil(ch.sym / 2) : Math.floor(ch.sym / 2), E: ch.sym >= 4 ? 2 : 0 }, 'Reaktion im Camp-Moment'); chips.push(['Sympathie', ch.sym > 0 ? Math.ceil(ch.sym / 2) : Math.floor(ch.sym / 2)]); }
      if (ch.en) { G.you.needs.energy = clamp(G.you.needs.energy + ch.en, 0, 100); chips.push(['Energie', ch.en]); } if (ch.food) { G.camp.wood = clamp(G.camp.wood + Math.round(ch.food / 4), 0, 12); }
      if (ch.bond) for (const k in ch.bond) { const tgt = k === 'A' ? n : B; C.addRel(tgt.id, 'you', Math.round(ch.bond[k] * .7)); chips.push(['Beziehung ' + nm(tgt.c), Math.round(ch.bond[k] * .7)]); }
      UI.dialog({ who: n.c, text: fmt(ch.r, o), chips, options: [{ id: 'ok', label: 'Weiter' }], onPick: () => { UI.closeDialog(); endTalk(n); } });
    } });
  }
  function request(n, w) {
    UI.dialog({ who: n.c, text: w.kind2 === 'water' ? 'Das Wasserfass ist fast leer. Holst du einen Eimer Wasser aus der Lagune?' : 'Uns geht das Holz aus. Bringst du einen Ast zum Stapel?', options: [{ id: 'ja', label: '👍 Klar, mach ich!' }, { id: 'nein', label: '🙅 Keine Zeit' }], onPick: id => {
      if (id === 'ja') { C.request = { id: n.id, kind: w.kind2 }; C.addRel(n.id, 'you', 2); UI.toast(w.kind2 === 'water' ? '🪣 Auftrag: Wasser holen' : '🪵 Auftrag: Holz bringen'); } else { C.addRel(n.id, 'you', -3); }
      UI.closeDialog(); endTalk(n);
    } });
  }
  function confront(n) {
    const c = n.c; c.angry = true;
    UI.dialog({ who: c, text: 'Ich hab gehört, was du über mich erzählt hast. Hinter meinem Rücken? Echt jetzt?', options: [{ id: 'sorry', label: '🙏 Entschuldigen' }, { id: 'leugnen', label: '🤥 Abstreiten' }, { id: 'stehen', label: '😤 Dazu stehen' }], onPick: id => {
      let d = 0, text = '', aud = {}; if (id === 'sorry') { d = score(n, 'entschuldigen') !== '-' ? 8 : 2; c.angry = d < 5; text = d > 5 ? 'Okay … Schwamm drüber. Aber nur dieses Mal.' : 'Hm. Mal sehen.'; aud = { S: 1 }; }
      else if (id === 'leugnen') { d = -6; text = 'Lüg mich nicht an! Alle haben es gehört.'; aud = { S: -2, E: 2 }; }
      else { d = -10; text = 'Wow. Dann wissen wir ja, woran wir sind!'; aud = { E: 4, S: -1 }; startArgueWithPlayer(n); }
      C.addRel(n.id, 'you', d); S.aud('you', aud, 'Konfrontation wegen Lästerei');
      UI.dialog({ who: c, text, chips: [['Beziehung ' + nm(c), d]], options: [{ id: 'ok', label: 'Weiter' }], onPick: () => { UI.closeDialog(); endTalk(n); } });
    } });
  }
  // Gerüchte sprechen sich herum
  C.gossipTick = function () {
    G.gossip.forEach(g => {
      if (g.done || G.clock + (G.day - g.day) * 1440 < g.at) return; g.done = true; const to = C.byId[g.to], about = C.byId[g.about]; if (!to || !about || about.away) return;
      const p = D.TRAITS[to.c.trait], chance = g.out === '-' ? .35 + p.empathie * .4 : .2 + p.drama * .45;
      if (Math.random() < chance) { C.addRel(about.id, 'you', -12); about.c.angry = true; about.want = { kind: 'confront', until: G.clock + 120, hello: 'Wir müssen reden!' }; S.log(`${nm(about.c)} hat von deinem Lästern erfahren.`); S.aud('you', { E: 2, S: -1 }, 'Lästerei fliegt auf'); }
    });
  };
  // Mitcamper kommen von sich aus auf dich zu
  C.socialTick = function () {
    const h = S.hour(); if (h < 8.5 || h > 21 || S.isNight()) return; if (C.npcs.some(n => n.want)) return;
    const free = C.npcs.filter(n => !n.away && isBusyForTalk(n) && Math.hypot(n.x - pl.x, n.z - pl.z) < 30);
    if (!free.length) return; const n = pick(free), cp = G.camp, r = Math.random();
    if ((cp.water < 3 || cp.wood < 2) && r < .45 && D.TRAITS[n.c.trait].fleiss > .5 && !C.request) { n.want = { kind: 'request', kind2: cp.water < 3 ? 'water' : 'wood', until: G.clock + 90, hello: 'Du, kannst du mir helfen?' }; return; }
    if (r < .8 && (G.today.moments || 0) < 2) { G.today.moments = (G.today.moments || 0) + 1; let idx; let tries = 0; do { idx = Math.floor(Math.random() * D.EVENTS.length); } while (G.usedMoments.includes(idx) && tries++ < 30); G.usedMoments.push(idx); if (G.usedMoments.length > D.EVENTS.length - 2) G.usedMoments = []; n.want = { kind: 'moment', idx, until: G.clock + 100 }; }
  };

  // ---------- Lagerfeuer-Runde ----------
  C.checkCampfire = function () {
    const h = S.hour(); if (G.today.campfireDone || h < 19.3 || h > 22.5) return;
    const seated = C.npcs.filter(n => n.act && n.act.type === 'sit' && n.act.fire && n.act.phase === 'do'); if (seated.length < 2) { UI.toast('Noch sitzt kaum jemand am Feuer – warte kurz.'); return; }
    G.today.campfireDone = true; let pool = D.CAMPFIRE.filter(c => !G.usedCampfire.includes(c.id)); if (!pool.length) { G.usedCampfire = []; pool = D.CAMPFIRE; } const cf = pick(pool); G.usedCampfire.push(cf.id);
    UI.choice({ title: '🔥 Lagerfeuer-Runde', text: cf.t, options: cf.ch.map((c, i) => ({ id: i, label: c.l })), onPick: i => {
      const ch = cf.ch[i], chips = [], aud = (d, why) => { S.aud('you', d, why); if (d.S) chips.push(['Sympathie', d.S]); if (d.E) chips.push(['Unterhaltung', d.E]); };
      const relAll = d => seated.forEach(n => C.addRel(n.id, 'you', d)), worker = C.npcs.filter(n => !n.away).sort((a, b) => b.c.workDay - a.c.workDay)[0], lazy = C.npcs.filter(n => !n.away).sort((a, b) => a.c.workDay - b.c.workDay)[0];
      switch (ch.fx) {
        case 'loben': if (worker) { C.addRel(worker.id, 'you', 8); S.aud(worker.id, { S: 2 }, 'wird am Feuer gelobt', true); } aud({ S: 2 }, 'lobt fair'); break;
        case 'selbst': { const avg = C.alive().reduce((a, c) => a + c.workDay, 0) / C.alive().length; if (G.you.workDay >= avg) aud({ S: 1, E: 2 }, 'nennt sich selbst – zu Recht'); else { aud({ S: -3, E: 2 }, 'nennt sich selbst – unverdient'); relAll(-2); } break; }
        case 'alle': relAll(1); aud({ S: 1 }, 'Teamgeist am Feuer'); break;
        case 'lustig': relAll(2); aud({ E: 4 }, 'lustige Geschichte'); break;
        case 'ruehrend': seated.forEach(n => C.addRel(n.id, 'you', n.c.trait === 'sensibel' ? 5 : 1)); aud({ S: 3 }, 'rührende Geschichte'); break;
        case 'grusel': seated.forEach(n => C.addRel(n.id, 'you', n.c.trait === 'clown' ? 3 : n.c.trait === 'sensibel' || n.c.trait === 'diva' ? -2 : 1)); seated.forEach(n => say(n, 'scared', .5)); aud({ E: 3 }, 'Gruselgeschichte'); break;
        case 'singen': relAll(2); aud({ E: 2, S: 1 }, 'singt am Feuer'); break;
        case 'trommeln': relAll(1); aud({ E: 3 }, 'trommelt am Feuer'); Snd.drum(); break;
        case 'zuhoeren': G.you.needs.energy = Math.min(100, G.you.needs.energy + 6); break;
        case 'anprangern': if (lazy) { C.addRel(lazy.id, 'you', -12); S.aud(lazy.id, { S: -2, E: 2 }, 'wird am Feuer als faul bezeichnet', true); say(lazy, 'argue', 1); seated.forEach(n => { if (D.TRAITS[n.c.trait].fleiss > .75 && n !== lazy) C.addRel(n.id, 'you', 3); }); } aud({ E: 5, S: lazy && lazy.c.workDay === 0 ? 1 : -2 }, 'prangert Faulheit an'); break;
        case 'plan': relAll(2); aud({ S: 2 }, 'schlichtet am Feuer'); C.npcs.forEach(n => { if (D.TRAITS[n.c.trait].fleiss < .5 && Math.random() < .5) n.c.reform = true; }); break;
        case 'still': break;
        case 'ehrlich': relAll(2); aud({ S: 3 }, 'ehrlich am Feuer'); break;
        case 'flunkern': relAll(1); aud({ E: 4, S: -1 }, 'flunkert maßlos'); break;
        case 'ausweichen': break;
        case 'nennen': { const t = C.npcs.filter(n => !n.away).sort((a, b) => S.favor(a.id) - S.favor(b.id))[0]; if (t) { C.addRel(t.id, 'you', -8); say(t, 'argue', 1); } aud({ E: 3, S: -1 }, 'nennt einen Rauswurf-Kandidaten'); break; }
        case 'souveraen': aud({ S: 2 }, 'bleibt souverän'); break;
        case 'witz': relAll(1); aud({ E: 2 }, 'witzelt am Feuer'); break;
      }
      seated.forEach(n => { n.c.needs.mood = Math.min(100, n.c.needs.mood + 8); }); G.you.needs.mood = Math.min(100, G.you.needs.mood + 10);
      const m = G.today.mission; if (m && m.kind === 'invite' && !m.done) { const ok = m.ids.filter(id => seated.some(n => n.id === id)).length; if (ok >= m.need) S.missionDone(); }
      S.log('Lagerfeuer-Runde: ' + ch.l); UI.choiceResult(ch.r, chips);
    } });
  };
  // ---------- Video-Tagebuch ----------
  C.diary = function () {
    if (G.today.diaryDone) return; const rival = C.npcs.filter(n => !n.away).sort((a, b) => C.rel('you', a.id) - C.rel('you', b.id))[0];
    UI.choice({ title: '🎥 Plauderhöhle', text: 'Das rote Licht leuchtet. Die Kamera gehört dir – was erzählst du?', options: D.DIARY.map((d, i) => ({ id: i, label: d.rival && rival ? d.l.replace('die größte Rivalin / den größten Rivalen', nm(rival.c)) : d.l })), onPick: i => {
      const d = D.DIARY[i]; G.today.diaryDone = true; S.aud('you', { S: d.S, E: d.E }, 'Video-Tagebuch'); if (d.rival && rival && Math.random() < .5) { G.gossip.push({ about: rival.id, to: rival.id, at: G.clock + 120, day: G.day, out: '+', done: false }); }
      if (d.team) C.npcs.forEach(n => { if (!n.away) C.addRel(n.id, 'you', 1, true); });
      S.advance(15); UI.choiceResult(d.r, [['Sympathie', d.S], ['Unterhaltung', d.E]].filter(x => x[1]));
    } });
  };

  // ---------- Kochen (Spieler) ----------
  C.cookMini = function () {
    C.playerCooking = true; pl.state = 'busy'; pl.busyPose = 'work'; pl.busyT = 999; pl.busyMax = 999;
    const box = document.getElementById('mini'); box.hidden = false; box.innerHTML = '<canvas></canvas><div style="position:absolute;bottom:calc(14px + var(--sab));left:0;right:0;text-align:center"><button class="btn gold big" id="mFan">🔥 Anfachen</button></div>';
    const cv = box.querySelector('canvas'), cx = cv.getContext('2d'); let W2 = 0, H2 = 0;
    const fit = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W2 = r.width; H2 = r.height; cv.width = W2 * d; cv.height = H2 * d; cx.setTransform(d, 0, 0, d, 0, 0); }; fit();
    const ING = [{ e: '🍚', n: 'Reis' }, { e: '🫘', n: 'Bohnen' }, { e: '⭐', n: 'Sternzutat' }, { e: '🌿', n: 'Wildkräuter' }];
    let t = 0, heat = .5, burn = 0, inZone = 0, stirA = 0, lastAng = null, stirRate = 0, ing = [], got = 0, spawned = 0, done = false, fanT = 0, lastKey = 0;
    const DUR = 16, zone = [.55, .82];
    const fan = () => { heat = Math.min(1.1, heat + .16); fanT = .3; Snd.click(); };
    box.querySelector('#mFan').onpointerdown = e => { e.preventDefault(); fan(); };
    const ang = (x, y) => Math.atan2(y - H2 * .55, x - W2 / 2);
    cv.onpointerdown = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; for (const it of ing) if (!it.got && Math.hypot(it.x - x, it.y - y) < 34) { it.drag = true; return; } lastAng = ang(x, y); cv.setPointerCapture(e.pointerId); };
    cv.onpointermove = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; const d = ing.find(i => i.drag); if (d) { d.x = x; d.y = y; return; } if (lastAng == null) return; const a = ang(x, y); let da = a - lastAng; if (da > Math.PI) da -= Math.PI * 2; if (da < -Math.PI) da += Math.PI * 2; stirA += Math.abs(da); lastAng = a; };
    cv.onpointerup = () => { const d = ing.find(i => i.drag); if (d) { d.drag = false; if (Math.hypot(d.x - W2 / 2, d.y - H2 * .55) < Math.min(W2, H2) * .3) { d.got = true; got++; Snd.star(); } } lastAng = null; };
    let raf = 0, last = performance.now();
    const loop = now => {
      const dt = Math.min(.1, (now - last) / 1000); last = now; if (done) return; t += dt; raf = requestAnimationFrame(loop);
      // Tastatur: A/D abwechselnd = rühren, Leertaste = anfachen, 1–4 = Zutat
      I.poll(); const k = I.move.x > .5 ? 1 : I.move.x < -.5 ? -1 : 0; if (k && k !== lastKey) stirA += 1.3; lastKey = k || lastKey; if (I.pressed('jump') || I.pressed('act')) fan(); ['n1', 'n2', 'n3', 'n4'].forEach((b, i) => { if (I.pressed(b)) { const it = ing.find(x => !x.got && x.i === i); if (it) { it.got = true; got++; Snd.star(); } } });
      stirRate = stirRate * Math.pow(.2, dt) + stirA * (1 - Math.pow(.2, dt)) / Math.max(dt, .001) * dt; stirA = 0;
      heat = Math.max(0, heat - dt * (.09 + W.rainK * .05)); fanT = Math.max(0, fanT - dt);
      const hot = heat > zone[1], stirring = stirRate > 1.1; if (heat > .45) burn = clamp(burn + dt * (stirring ? -.12 : .1) * (hot ? 2.2 : 1), 0, 1);
      if (heat >= zone[0] && heat <= zone[1]) inZone += dt;
      if (spawned < 4 && t > 2 + spawned * 3.2) { const i = spawned; ing.push({ i, x: i % 2 ? W2 - 60 : 60, y: H2 * .3 + (i > 1 ? H2 * .35 : 0), t: 0, got: false }); spawned++; }
      ing.forEach(it => { it.t += dt; if (!it.got && !it.drag && it.t > 4.5) it.gone = true; });
      draw();
      if (t >= DUR) finish();
    };
    function draw() {
      const c = cx, w = W2, h = H2, D2 = UTrials.draw; c.fillStyle = '#1a0f06'; c.fillRect(0, 0, w, h);
      const px = w / 2, py = h * .55, R = Math.min(w, h) * .3;
      const fg = c.createRadialGradient(px, py + R * .3, 5, px, py + R * .3, R * 1.6); fg.addColorStop(0, `rgba(255,${120 + heat * 80},40,${.3 + heat * .5})`); fg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = fg; c.fillRect(0, 0, w, h);
      c.fillStyle = '#2b2b2b'; c.beginPath(); c.arc(px, py, R + 10, 0, Math.PI * 2); c.fill(); const sg = c.createRadialGradient(px, py, 4, px, py, R); sg.addColorStop(0, burn > .6 ? '#5a3a20' : '#e8dcc0'); sg.addColorStop(1, burn > .4 ? '#6a4a2a' : '#c8b890'); c.fillStyle = sg; c.beginPath(); c.arc(px, py, R, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 6; i++) { const a = t * (1 + stirRate * .3) + i; c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(px + Math.cos(a) * R * .5, py + Math.sin(a) * R * .5, 4, 0, Math.PI * 2); c.fill(); }
      c.strokeStyle = '#7a5232'; c.lineWidth = 8; c.lineCap = 'round'; const sa = t * (1 + stirRate); c.beginPath(); c.moveTo(px + Math.cos(sa) * R * .3, py + Math.sin(sa) * R * .3); c.lineTo(px + Math.cos(sa) * R * 1.3, py + Math.sin(sa) * R * 1.3 - 30); c.stroke();
      ing.forEach(it => { if (it.got || it.gone) return; c.globalAlpha = it.t > 3.5 ? .5 + Math.sin(it.t * 20) * .3 : 1; c.fillStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.arc(it.x, it.y, 30, 0, Math.PI * 2); c.fill(); D2.emoji(c, ING[it.i].e, it.x, it.y, 34); D2.text(c, (I.touch ? '' : `[${it.i + 1}] `) + ING[it.i].n, it.x, it.y + 42, 12, '#fff'); c.globalAlpha = 1; });
      // Anzeigen
      const bw = Math.min(220, w * .4); D2.text(c, '🔥 Hitze', 16 + bw / 2, 18, 13, '#fff'); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(16, 28, bw, 12); c.fillStyle = 'rgba(120,255,100,.45)'; c.fillRect(16 + bw * zone[0], 28, bw * (zone[1] - zone[0]), 12); c.fillStyle = heat > zone[1] ? '#ff4a3a' : '#ffcf4a'; c.fillRect(16 + bw * clamp(heat, 0, 1) - 3, 24, 6, 20);
      D2.text(c, '♨ Anbrennen', w - 16 - bw / 2, 18, 13, '#fff'); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(w - 16 - bw, 28, bw, 12); c.fillStyle = burn > .6 ? '#ff4a3a' : '#ffa040'; c.fillRect(w - 16 - bw, 28, bw * burn, 12);
      D2.text(c, I.touch ? 'Im Kreis wischen = rühren · Zutaten in den Topf ziehen · „Anfachen“ für Hitze' : 'Maus kreisen oder A/D abwechselnd = rühren · Zutaten ziehen oder 1–4 · Leertaste = anfachen', w / 2, h - 16, Math.min(13, w * .028), '#ffe8b0', 'center', 700);
      D2.text(c, `🍳 ${Math.max(0, Math.ceil(DUR - t))} s`, w / 2, 18, 16, '#fff');
    }
    function finish() {
      done = true; cancelAnimationFrame(raf); box.hidden = true; box.innerHTML = ''; C.playerCooking = false; pl.state = 'free';
      const q = clamp(inZone / DUR * .55 + got / 4 * .3 + (1 - burn) * .25, 0, 1), word = q > .75 ? 'Ein Festmahl!' : q > .5 ? 'Richtig lecker!' : q > .3 ? 'Essbar.' : 'Etwas angebrannt …';
      S.cookMeal('you', .35 + q * .65); workCredit('cook'); S.aud('you', { S: q > .5 ? 3 : 1, E: q < .3 ? 2 : 0 }, q > .5 ? 'kocht ein tolles Essen' : 'kocht fürs Camp');
      C.npcs.forEach(n => { if (!n.away) C.addRel(n.id, 'you', q > .5 ? 3 : 1, true); }); UI.toast(`🍲 ${word} (Qualität ${Math.round(q * 100)} %)`, q > .5 ? 'good' : '');
    }
    raf = requestAnimationFrame(loop); UI.toast('🍳 Kochen: rühren, Hitze halten, Zutaten rein!');
  };

  // Debug/Test
  C.dbg = () => ({ npcs: C.npcs.map(n => ({ id: n.id, act: n.act && n.act.type, phase: n.act && n.act.phase, x: +n.x.toFixed(1), z: +n.z.toFixed(1), away: n.away })) });
  root.UCamp = C;
})(window);
