'use strict';
/* Spielkern von AnMaCha Markthalle 24 (ohne Grafik, testbar): Laden, Kunden, Personal, Wirtschaft, Tagesablauf. */
const Sim = (() => {
  const D = typeof Data !== 'undefined' ? Data : require('./data.js');
  const DAYLEN = 600, MIN_PER_SEC = 1.2, DOW = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], RAMP_MAX = 18, rampMax = S => RAMP_MAX + 10 * S.objs.filter(o => o.k === 'lager').length;
  let R = Math.random;
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1)), pick = a => a[Math.floor(R() * a.length)], clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const wpick = (items, wf) => { let t = 0; const w = items.map(i => { const x = Math.max(0, wf(i)); t += x; return x; }); if (t <= 0) return null; let x = R() * t; for (let i = 0; i < items.length; i++) { x -= w[i]; if (x <= 0) return items[i]; } return items[items.length - 1]; };
  const P = D.PRODUCTS, lvlNeed = l => Math.round(150 * Math.pow(l, 1.7));
  const GRIDS = new WeakMap();   // abgeleitete Laufgitter (nicht gespeichert)

  // ---------- Aufbau ----------
  function emptyDay() { return { rev: 0, cogs: 0, items: 0, served: 0, lost: 0, happy: 0, recipes: 0, stolen: 0, spawned: 0, units: {}, revBy: {}, miss: 0 }; }
  function create() {
    const S = { v: 1, day: 1, t: 0, simT: 0, phase: 'prep', money: 200000, xp: 0, level: 1, rep: 55, W: 18, H: 12, exp: 0, nid: 1, objs: [], ramp: [], backlog: [], orders: [], price: {}, mkt: {}, cf: {}, riv: {}, lic: {}, up: {}, staff: [], customers: [], police: [], fx: [], messes: [], regs: [], inv: [], loan: 0,
      player: { x: 3.5, y: 9.5, vx: 0, vy: 0, carry: [], yaw: 0 }, weather: 'sonne', forecast: 'sonne', rivalSale: null, ev: [], radio: { on: true, genre: 'pop', ads: {} }, quests: [], today: emptyDay(), hist: [], summary: null, wish: {}, heat: [], spawnAcc: 0, closeT: 0, ccount: 0, log: [], autoOpen: false, strike: false, blackout: false, bestRev: 0, totalRev: 0, stars: 0, shopName: 'Markthalle 24', slogan: 'Frisch · Fair · Freundlich', signCol: '#0f2b5a', named: false, buzz: 0, assist: true, hints: true, promo: {}, cart: {}, rules: {}, floor: 'fliese', wall: 'beige', own: { floor: { fliese: true }, wall: { beige: true } }, reviews: [], ach: {}, tot: { recipes: 0, caught: 0, served: 0, refused: 0, viol: 0, paper: 0, mis: 0 }, paper: 0 };
    Object.keys(D.CATS).forEach(c => { if (D.CATS[c].cost === 0) S.lic[c] = true; });
    Object.values(P).forEach(p => { S.mkt[p.id] = 1; S.cf[p.id] = 1; S.riv[p.id] = .97; S.price[p.id] = Math.round(p.ref * 1.12 / 5) * 5; });
    add(S, 'ramp', 1, 1); add(S, 'container', 4, 1); add(S, 'pc', 2, 4); add(S, 'obst', 5, 2); add(S, 'obst', 8, 2); add(S, 'regal', 11, 2); add(S, 'kuehl', 14, 2); add(S, 'regal', 5, 6); add(S, 'kasse', 11, 7); add(S, 'radio', 15, 5);
    const set = (o, p, q) => { o.p = p; o.qty = q; o.age = 0; }, ob = byKind(S, 'obst'), rg = byKind(S, 'regal'); set(ob[0], 'apfel', 14); set(ob[1], 'broetchen', 18); set(rg[0], 'wasser', 12); set(byKind(S, 'kuehl')[0], 'milch', 8);
    ['banane', 'limo', 'wasser', 'milch', 'broetchen', 'apfel'].forEach(p => S.ramp.push({ p, n: P[p].box, age: 0 }));
    S.objs.forEach(o => { if (isShelf(o) && o.p) { o.tag = true; o.tagp = effPrice(S, o); } }); S.heat = new Array(S.W * S.H).fill(0); rebuild(S); newQuests(S); S.forecast = rollWeather(0); S.weather = 'sonne'; note(S, 'Willkommen in der Markthalle 24! Bestelle Ware im Markt und fülle die Regale.', 'info');
    return S;
  }
  function add(S, k, x, y) { const t = D.OBJ[k]; const o = { id: S.nid++, k, x, y, w: t.w, h: t.h, p: null, qty: 0, age: 0, disc: false, q: [], svc: 0 }; S.objs.push(o); return o; }
  const byKind = (S, k) => S.objs.filter(o => o.k === k), isShelf = o => D.OBJ[o.k].cap > 0, obj = (S, id) => S.objs.find(o => o.id === id);
  const note = (S, t, kind) => { S.log.push({ t, kind: kind || 'info', day: S.day }); if (S.log.length > 40) S.log.shift(); };
  function rebuild(S) {
    const g = new Uint8Array(S.W * S.H); for (let x = 0; x < S.W; x++) { g[x] = 1; g[(S.H - 1) * S.W + x] = 1; } for (let y = 0; y < S.H; y++) { g[y * S.W] = 1; g[y * S.W + S.W - 1] = 1; }
    g[(S.H - 1) * S.W + 2] = 0; S.objs.forEach(o => { for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) g[y * S.W + x] = 1; }); GRIDS.set(S, g);
  }
  const grid = S => GRIDS.get(S) || (rebuild(S), GRIDS.get(S));
  const solid = (S, x, y) => x < 0 || y < 0 || x >= S.W || y >= S.H || grid(S)[y * S.W + x] === 1;
  const doorTile = S => [2, S.H - 1];
  function path(S, sx, sy, tx, ty) {
    sx |= 0; sy |= 0; if (sx === tx && sy === ty) return []; const W = S.W, H = S.H, g = grid(S), par = new Int32Array(W * H).fill(-2), q = new Int32Array(W * H); let h = 0, t = 0; q[t++] = sy * W + sx; par[sy * W + sx] = -1; const goal = ty * W + tx;
    if (g[goal] && !(tx === 2 && ty === H - 1)) return null;
    while (h < t) { const c = q[h++]; if (c === goal) break; const cx = c % W, cy = (c / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const n = ny * W + nx; if (par[n] !== -2 || g[n]) continue; par[n] = c; q[t++] = n; } }
    if (par[goal] === -2) return null; const out = []; for (let c = goal; c !== -1; c = par[c]) out.push([c % W, (c / W) | 0]); out.pop(); return out.reverse();
  }
  function accessTiles(S, o) { const out = []; for (let y = o.y - 1; y <= o.y + o.h; y++) for (let x = o.x - 1; x <= o.x + o.w; x++) { const inx = x >= o.x && x < o.x + o.w, iny = y >= o.y && y < o.y + o.h; if (inx === iny) continue; if (!solid(S, x, y)) out.push([x, y]); } return out; }
  function pathToObj(S, sx, sy, o) { let best = null; accessTiles(S, o).sort((a, b) => Math.abs(a[0] - sx) + Math.abs(a[1] - sy) - Math.abs(b[0] - sx) - Math.abs(b[1] - sy)).slice(0, 3).forEach(a => { const p = path(S, sx, sy, a[0], a[1]); if (p && (!best || p.length < best.length)) best = p; }); return best; }
  const cap = (S, o) => { const t = D.OBJ[o.k]; if (!t.cap) return 0; const sz = o.p ? P[o.p].size : 1; return Math.max(2, Math.floor(t.cap * (S.up.regalpl ? 1.25 : 1) / sz)); };
  const fits = (o, p) => { const t = D.OBJ[o.k]; if (!t.cap) return false; if (!t.st.includes(P[p].st)) return false; if (t.only && !t.only.includes(P[p].cat)) return false; return true; };
  const ref = (S, p) => Math.max(5, Math.round(P[p].ref * S.mkt[p]));
  const wholesale = (S, p) => Math.max(5, Math.round(P[p].cost * S.cf[p]));
  const rival = (S, p) => Math.round(ref(S, p) * S.riv[p] * (S.rivalSale && S.rivalSale === P[p].cat ? .82 : 1));
  const effPrice = (S, o) => Math.max(1, Math.round(S.price[o.p] * (o.disc ? .7 : 1) * (S.promo[o.p] ? .8 : 1)));
  const offered = S => { const m = {}; S.objs.forEach(o => { if (isShelf(o) && o.p && o.qty > 0) m[o.p] = (m[o.p] || 0) + o.qty; }); return m; };

  // ---------- Wetter, Märkte, Tageswechsel ----------
  function season(S, day) {
    const dd = (day == null ? S.day : day) - 1, i = Math.floor((dd % 112) / 28), d = dd % 28 + 1, sn = D.SEASONS[i], h = sn.hol && d >= sn.hol.from && d <= sn.hol.to ? sn.hol : null; return { i, d, n: sn.n, e: sn.e, hol: h, prod: sn.prod };
  }
  function rollWeather(si) { const w = D.SEASONS[si || 0].w; return wpick(['sonne', 'wolke', 'regen', 'heiss', 'kalt'], x => w[x]); }
  function newQuests(S) { S.quests = []; const ids = D.QUESTS.slice().sort(() => R() - .5).slice(0, 3); ids.forEach(q => { const n = ri(q.n[0], q.n[1]); S.quests.push({ id: q.id, n: q.div ? Math.round(n / 10) * 10 : n, done: false }); }); }
  function questVal(S, q) { const d = D.QUESTS.find(x => x.id === q.id), v = S.today[d.key] || 0; return d.div ? Math.floor(v / d.div) : v; }
  function nextDay(S) {
    S.police = []; S.fx = []; S.paper = 0; S.day++; S.t = 0; S.phase = 'prep'; S.summary = null; S.customers = []; S.closeT = 0; S.spawnAcc = 0; S.today = emptyDay(); S.weather = S.forecast; S.forecast = rollWeather(season(S, S.day + 1).i); S.promo = {}; S.rivalSale = null; S.ev = []; S.blackout = false; S.radio.ads = {};
    Object.keys(P).forEach(p => { S.mkt[p] = clamp(S.mkt[p] + (R() - .5) * .08 + (1 - S.mkt[p]) * .25, .88, 1.18); S.cf[p] = clamp(S.cf[p] + (R() - .5) * .06 + (1 - S.cf[p]) * .3, .9, 1.12); S.riv[p] = clamp(.9 + R() * .12 + (S.level > 4 ? -.02 : 0), .86, 1.04); });
    if (R() < .22) S.ev.push({ k: 'ausflug', t0: 150, t1: 260 }); if (R() < .15) S.ev.push({ k: 'stromausfall', t0: 200, t1: 320 }); if (R() < .15) S.ev.push({ k: 'promi', t0: 220, t1: 221 });
    if (R() < .15) S.ev.push({ k: 'inspektion', t0: 580, t1: 600 }); if (R() < .15) { S.rivalSale = pick(Object.keys(D.CATS).filter(c => S.lic[c])); S.ev.push({ k: 'rivalsale', t0: 0, t1: 600 }); }
    if (S.strike) { S.strike = false; note(S, 'Lieferstreik! Heute kam nichts an – die Bestellung kommt morgen.', 'bad'); } else deliver(S, 'day');
    if (R() < .1 && S.level > 2) { S.strike = true; S.ev.push({ k: 'streik', t0: 0, t1: 0 }); }
    bake(S); flush(S); newQuests(S); if (S.up.auto) autoOrder(S); S.buzz *= .85; S.player.carry.forEach(b => b.age = (b.age || 0)); S.heat = S.heat.map(h => h * .5);
    const sz = season(S); note(S, `Tag ${S.day} (${DOW[(S.day - 1) % 7]}) · ${sz.e} ${sz.n}: ${D.WEATHER[S.weather].name}.`, 'info'); if (sz.hol && (sz.d === sz.hol.from)) note(S, `${sz.hol.e} ${sz.hol.n} beginnt! Die Kunden wollen besondere Ware – stock rechtzeitig auf.`, 'good'); else if (season(S, S.day + 1).hol && !sz.hol) note(S, `${season(S, S.day + 1).hol.e} Morgen beginnt die ${season(S, S.day + 1).hol.n}.`, 'info');
  }
  function bake(S) {
    S.objs.forEach(o => { if (D.OBJ[o.k].bake && o.p) { const n = cap(S, o) - o.qty, cost = Math.round(wholesale(S, o.p) * .5) * n; if (n > 0 && S.money >= cost) { S.money -= cost; o.age = (o.age * o.qty) / Math.max(1, o.qty + n); o.qty += n; if (!S.today.baked) S.today.baked = 0; S.today.baked += cost; } } });
  }
  function deliver(S, when) { S.orders = S.orders.filter(o => { if (o.when !== when && !(when === 'express' && o.when === 'express' && S.simT >= o.eta)) return true; if (when === 'express' && S.simT < o.eta) return true; for (let i = 0; i < o.boxes; i++) S.backlog.push({ p: o.p, n: P[o.p].box, age: 0 }); return false; }); }
  function flush(S) { while (S.backlog.length && S.ramp.length < rampMax(S)) S.ramp.push(S.backlog.shift()); }
  // ---------- Bestell-PC: Warenkorb, Lagerübersicht, Nachbestell-Regeln ----------
  const unitsOf = (S, p) => S.objs.filter(o => isShelf(o) && o.p === p).reduce((a, o) => a + o.qty, 0) + S.ramp.concat(S.backlog, S.player.carry).filter(b => b.p === p).reduce((a, b) => a + b.n, 0) + S.orders.filter(o => o.p === p).reduce((a, o) => a + o.boxes * P[p].box, 0);
  const capOf = (S, p) => S.objs.filter(o => isShelf(o) && o.p === p).reduce((a, o) => a + cap(S, o), 0);
  function rule(S, p) { return S.rules[p] || { on: true, min: .3, boxes: 1 }; }
  function setRule(S, p, patch) { const r = Object.assign({}, rule(S, p), patch); r.min = clamp(r.min, .05, .9); r.boxes = clamp(Math.round(r.boxes), 1, 10); S.rules[p] = r; }
  function autoOrder(S) { if (!S.up.auto) return; const seen = {}; S.objs.forEach(o => { if (!isShelf(o) || !o.p || seen[o.p]) return; seen[o.p] = 1; const r = rule(S, o.p); if (r.on === false) return; const cp = capOf(S, o.p); if (cp && unitsOf(S, o.p) < cp * r.min) order(S, o.p, r.boxes, false, true); }); }
  function cartSet(S, p, n) { n = clamp(Math.round(n), 0, 60); if (!P[p] || !S.lic[P[p].cat]) return false; if (n <= 0) delete S.cart[p]; else S.cart[p] = n; return true; }
  const cartCost = (S, express) => Object.keys(S.cart).reduce((a, p) => a + Math.round(wholesale(S, p) * P[p].box * S.cart[p] * (express ? 1.25 : 1)), 0);
  function cartOrder(S, express) { const ps = Object.keys(S.cart); if (!ps.length) return false; if (S.money < cartCost(S, express)) { note(S, 'Nicht genug Geld für den Warenkorb.', 'bad'); return false; } ps.forEach(p => order(S, p, S.cart[p], express, true)); S.cart = {}; return true; }
  function suggest(S) { const out = {}, seen = {}; S.objs.forEach(o => { if (!isShelf(o) || !o.p || seen[o.p]) return; seen[o.p] = 1; const need = capOf(S, o.p) - unitsOf(S, o.p); if (need >= P[o.p].box * .5) out[o.p] = Math.max(1, Math.round(need / P[o.p].box)); }); return out; }
  const nearPC = S => S.objs.some(o => o.k === 'pc' && rectDist(S.player.x, S.player.y, o) < 2.0);
  function bakeOne(S, o) { const n = cap(S, o) - o.qty, c = Math.round(wholesale(S, o.p) * .5) * n; if (n <= 0 || S.money < c) return 0; S.money -= c; o.age = (o.age * o.qty) / Math.max(1, o.qty + n); o.qty += n; S.today.baked = (S.today.baked || 0) + c; return n; }
  // ---------- Umbau: Boden, Wände ----------
  function buyFloor(S, id) { const f = D.FLOORS[id]; if (!f) return false; if (S.own.floor[id]) { S.floor = id; return true; } if (S.level < f.lvl || S.money < f.price) return false; S.money -= f.price; S.own.floor[id] = true; S.floor = id; return true; }
  function buyWall(S, id) { const w = D.WALLS[id]; if (!w) return false; if (S.own.wall[id]) { S.wall = id; return true; } if (S.money < 30000) return false; S.money -= 30000; S.own.wall[id] = true; S.wall = id; return true; }
  function order(S, p, boxes, express, quiet) {
    if (!S.lic[P[p].cat] || boxes < 1) return false; const cost = Math.round(wholesale(S, p) * P[p].box * boxes * (express ? 1.25 : 1)); if (S.money < cost) { if (!quiet) note(S, 'Nicht genug Geld für die Bestellung.', 'bad'); return false; }
    S.money -= cost; if (express && S.up.drohne) { S.orders.push({ p, boxes, when: 'express', eta: S.simT + 40 }); } else S.orders.push({ p, boxes, when: 'day' }); return true;
  }
  const power = S => 400 + S.objs.reduce((a, o) => a + (D.OBJ[o.k].power || 0), 0) + (S.up.klima ? 300 : 0) + S.staff.filter(s => s.k === 'robo').length * 600 + (S.up.neon ? 150 : 0);
  const rent = S => (S.day < 3 ? 1000 : 2500 + 200 * S.level) + 150 * S.exp * S.level;
  function endDay(S) {
    const T = S.today, bills = [], waste = []; let wasteVal = 0;
    S.objs.forEach(o => { if (!isShelf(o) || !o.p) return; const pr = P[o.p]; o.age += 1; if (pr.life && o.age > pr.life && o.qty > 0) { wasteVal += o.qty * wholesale(S, o.p); waste.push(pr.name + ' ×' + o.qty); o.qty = 0; o.age = 0; } });
    S.ramp = S.ramp.filter(b => { b.age++; const l = P[b.p].life; if (l && b.age > l) { wasteVal += b.n * wholesale(S, b.p); waste.push(P[b.p].name + ' ×' + b.n); return false; } return true; });
    bills.push(['Miete', rent(S)], ['Strom', power(S)]); if (S.objs.some(o => o.k === 'container')) bills.push(['Müllabfuhr', 500]); const wages = S.staff.reduce((a, s) => a + wageOf(s), 0); if (wages) bills.push(['Löhne', wages]); if (S.loan) bills.push(['Zinsen', Math.round(S.loan * .03)]);
    const ins = S.ev.find(e => e.k === 'inspektion'); if (ins && S.messes.length > 2) bills.push(['Hygiene-Strafe', 5000 * (S.messes.length - 2)]);
    const tot = bills.reduce((a, b) => a + b[1], 0); S.money -= tot; const profit = T.rev - T.cogs - tot - wasteVal - T.stolen;
    const done = []; S.quests.forEach(q => { const d = D.QUESTS.find(x => x.id === q.id), v = questVal(S, q); q.ok = d.max ? (v <= q.n && T.served >= 10) : v >= q.n; if (q.ok) { S.money += d.r; S.xp += 40; done.push(d.t.replace('{n}', q.n) + ' (+' + D.fmt(d.r) + ')'); } });
    S.xp += Math.max(0, Math.round(profit / 120)); let lv = 0; while (S.xp >= lvlNeed(S.level) && S.level < 20) { S.level++; lv++; }
    S.hist.push({ d: S.day, rev: T.rev, profit, cust: T.served }); if (S.hist.length > 14) S.hist.shift(); S.totalRev += T.rev; S.bestRev = Math.max(S.bestRev, T.rev);
    const top = Object.keys(T.units).sort((a, b) => T.units[b] - T.units[a]).slice(0, 3).map(p => P[p].e + ' ' + P[p].name + ' ×' + T.units[p]);
    const ach = checkAch(S); S.summary = { ach, day: S.day, rev: T.rev, cogs: T.cogs, bills, waste, wasteVal, stolen: T.stolen, profit, served: T.served, lost: T.lost, items: T.items, top, done, lv, level: S.level, stars: stars(S) }; S.phase = 'summary';
    S.customers = []; S.messes = S.messes.slice(0, 2);
  }
  const stars = S => Math.round(S.rep / 20 * 10) / 10;
  const ACHK = { tag1: S => S.day >= 1 && S.hist.length >= 1, stufe5: S => S.level >= 5, stufe10: S => S.level >= 10, umsatz500: S => S.bestRev >= 50000, umsatz2000: S => S.bestRev >= 200000, team3: S => S.staff.length >= 3, ruf4: S => S.rep >= 80, rezept10: S => S.tot.recipes >= 10, dieb5: S => S.tot.caught >= 5, anbau2: S => S.exp >= 2, radio: S => !!S.up.radio, stamm25: S => S.regs.length >= 25, buzz: S => S.buzz >= .2, jugend5: S => S.tot.refused >= 5, recycling: S => S.tot.paper >= 50, kunden1000: S => S.tot.served >= 1000, reich: S => S.money >= 1000000 };
  function checkAch(S) { const out = []; D.ACH.forEach(a => { if (!S.ach[a[0]] && ACHK[a[0]](S)) { S.ach[a[0]] = true; S.money += a[4]; out.push(a[2] + ' ' + a[1] + ' (+' + D.fmt(a[4]) + ')'); } }); return out; }
  const achDone = S => D.ACH.filter(a => S.ach[a[0]]).length;

  // ---------- Spawnen & Kunden ----------
  const curve = t => .55 + .45 * (Math.exp(-(((t - 230) / 110) ** 2)) + Math.exp(-(((t - 440) / 90) ** 2)));
  function demandMul(S, p) {
    const pr = P[p], w = D.WEATHER[S.weather], sz = season(S); let m = pr.pop * (w.cat[pr.cat] || 1) * ((w.prod && w.prod[p]) || 1) * (sz.prod[p] || 1) * (sz.hol && sz.hol.prod[p] || 1) * (S.promo[p] ? 1.8 : 1); if (S.radio.on && S.up.radio && S.radio.ads[p]) m *= 2.6; return m;
  }
  function spawnRate(S) {
    const off = offered(S), n = Object.keys(off).length; if (!n) return 0; let sum = 0, cnt = 0; Object.keys(off).forEach(p => { sum += S.price[p] / ref(S, p); cnt++; }); const idx = sum / cnt;
    const ap = clamp(1 + (1.05 - idx) * 1.5, .5, 1.35), as = clamp(.45 + .05 * n, .45, 1.9), dow = [1, 1, 1, 1.05, 1.15, 1.4, .85][(S.day - 1) % 7], deko = 1 + Math.min(10, byKind(S, 'deko').length) * .02, size = .85 + S.W * S.H / 216 * .15;
    const ev = S.ev.find(e => e.k === 'ausflug' && S.t >= e.t0 && S.t <= e.t1) ? 1.5 : 1; const clean = 1 - Math.min(.3, S.messes.length * .04);
    return (.16 + .016 * S.level) * curve(S.t) * (.55 + S.rep / 100 * .9) * ap * as * dow * deko * size * D.WEATHER[S.weather].spawn * (S.up.neon ? 1.15 : 1) * (1 + (D.FLOORS[S.floor || 'fliese'].appeal || 0)) * (S.up.tuer ? 1.03 : 1) * (S.up.park ? 1.06 : 1) * (1 + clamp(S.buzz, -.25, .5)) * (1 + .03 * Object.keys(S.promo).length) * (season(S).hol ? 1.1 : 1) * (1 + Math.min(.12, byKind(S, 'ofen').filter(o => o.qty > 0).length * .06)) * ev * clean * (S.radio.on && S.up.radio ? 1.05 : 1);
  }
  function makeList(S, type, age) {
    const T = D.TYPES[type], unl = Object.values(P).filter(p => S.lic[p.cat]), n = ri(T.n[0], T.n[1]), list = [], off = offered(S); let recipe = null;
    if (R() < T.recipe && S.level >= 2) { const rs = D.RECIPES.filter(r => r.items.filter(i => S.lic[P[i].cat]).length >= 3); if (rs.length) { const r = pick(rs); recipe = { id: r.id, need: r.items.filter(i => S.lic[P[i].cat]) }; recipe.need.forEach(i => list.push({ p: i, q: 1, got: 0 })); } }
    while (list.length < n && list.length < unl.length) { const p = wpick(unl, x => demandMul(S, x.id) * (T.likes[x.cat] || 1) * (off[x.id] ? 1 : .2) * (list.some(l => l.p === x.id) ? 0 : 1) * (age < 18 && x.age ? 1.7 : 1)); if (!p) break; list.push({ p: p.id, q: ri(T.q[0], T.q[1]), got: 0 }); }
    return { list, recipe };
  }
  function spawn(S, forceType) {
    const music = S.radio.on && S.up.radio ? S.radio.genre : null; const types = Object.keys(D.TYPES).filter(t => !D.TYPES[t].minLvl || S.level >= D.TYPES[t].minLvl);
    const ausflug = S.ev.some(e => e.k === 'ausflug' && S.t >= e.t0 && S.t <= e.t1), type = forceType || wpick(types, t => D.TYPES[t].w * (music && D.TYPES[t].music === music ? 1.35 : 1) * (ausflug && t === 'stud' ? 4 : 1)); if (!type) return null;
    let reg = -1; if (S.regs.length && R() < .4) { const cand = S.regs.map((r, i) => i).filter(i => S.regs[i].t === type); const i = wpick(cand, i => 1 + S.regs[i].loy); if (i != null) reg = i; }
    const name = reg >= 0 ? S.regs[reg].n : pick(D.FIRST) + ' ' + pick(D.LAST)[0] + '.', age = ri(D.TYPES[type].age[0], D.TYPES[type].age[1]), L = makeList(S, type, age), door = doorTile(S);
    const c = { id: S.ccount++, type, age, name, reg, x: door[0] + .5, y: door[1] + .5, path: [], pi: 0, spd: D.TYPES[type].spd * (.9 + R() * .2), st: 'shop', list: L.list, li: 0, recipe: L.recipe, basket: [], mood: 80, wait: 0, tim: 0, shelf: null, thief: R() < .03 + .002 * S.level && type !== 'krit' && type !== 'sen', stole: 0, hits: 0, miss: 0, reg_q: null, slot: -1, bub: null, bt: 0, svc: 0, pay: 0, found: 0, want: 0 };
    c.list.forEach(l => { c.want += l.q; }); S.customers.push(c); S.today.spawned++; return c;
  }
  function follow(c, d) { if (c.pi >= c.path.length) return true; const tx = c.path[c.pi][0] + .5, ty = c.path[c.pi][1] + .5, dx = tx - c.x, dy = ty - c.y, dist = Math.hypot(dx, dy), step = c.spd * d; if (dist <= step) { c.x = tx; c.y = ty; c.pi++; return c.pi >= c.path.length; } c.x += dx / dist * step; c.y += dy / dist * step; return false; }
  const bub = (c, e) => { c.bub = e; c.bt = 2.2; };
  const setPath = (c, p) => { c.path = p || []; c.pi = 0; };
  function nextItem(S, c) {
    while (c.li < c.list.length) { const it = c.list[c.li]; const shelves = S.objs.filter(o => isShelf(o) && o.p === it.p && o.qty > 0).sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y)); const o = shelves.find(s => pathToObj(S, c.x, c.y, s)); if (!o) { c.miss += it.q; S.wish[it.p] = (S.wish[it.p] || 0) + 1; bub(c, '❓'); c.mood -= 8; S.today.miss++; c.li++; continue; } c.shelf = o.id; const pth = pathToObj(S, c.x, c.y, o); setPath(c, pth); c.tim = .5 + R() * .8; return true; }
    return false;
  }
  function priceCheck(S, c, o) {
    const T = D.TYPES[c.type], r = ref(S, o.p), pr = effPrice(S, o), ratio = pr / r, tol = T.tol + (c.reg >= 0 ? S.regs[c.reg].loy * .0006 : 0), riv = rival(S, o.p);
    if (!o.tag && R() < (T.hunt ? .6 : .3)) return { ok: false, why: '❓' };
    if (T.hunt || R() < .3) { if (pr > riv * 1.06 && R() < clamp((pr / riv - 1.06) * 3 + .15, 0, .85)) return { ok: false, why: '🏪' }; }
    if (ratio > 1 + tol) { if (R() < clamp((ratio - 1 - tol) * 4, 0, 1)) return { ok: false, why: '💸' }; return { ok: true, mul: .6 }; }
    return { ok: true, mul: ratio < .9 ? 1.5 : 1 };
  }
  function heading(S, c) {
    const regs = S.objs.filter(o => o.k === 'kasse' || o.k === 'sco'); if (!regs.length) { c.st = 'leave'; return; }
    const best = regs.map(r => ({ r, s: r.q.length * 2.2 + Math.hypot(r.x - c.x, r.y - c.y) * .15 - (operated(S, r) ? 3 : 0) })).sort((a, b) => a.s - b.s)[0].r; best.q.push(c.id); c.reg_q = best.id; c.st = 'queue'; c.slot = -1;
  }
  const slotPos = (S, r, i) => { let y = r.y + 1 + i; while (y > r.y + 1 && solid(S, r.x, y)) y--; return [r.x, y]; };
  function serviceTile(r) { return [r.x, r.y - 1]; }
  function opRate(S, r) {
    const pl = S.player; const st = serviceTile(r); if (Math.hypot(pl.x - (st[0] + .5), pl.y - (st[1] + .5)) < 1.25) return .45;
    if (r.k === 'sco') return .55; const s = S.staff.find(x => x.k === 'kasse' && x.reg === r.id && Math.hypot(x.x - (st[0] + .5), x.y - (st[1] + .5)) < .6); return s ? s.rate : 0;
  }
  const operated = (S, r) => opRate(S, r) > 0;
  function leaveFor(S, c, why) { c.st = 'leave'; const d = doorTile(S); setPath(c, path(S, c.x, c.y, d[0], d[1]) || []); if (why) bub(c, why); }
  function review(S, c, sat, abandoned) {
    if (c.type !== 'infl' && c.type !== 'krit' && R() > .3) return; const stars = clamp(Math.round(sat * 4 + 1), 1, 5), miss = c.list.find(l => l.got === 0); let t;
    if (stars >= 4) t = pick(['Alles da, nette Preise, gerne wieder!', 'Frische Ware und schnelle Kasse.', 'Mein neuer Lieblingsladen!', 'Sauber, übersichtlich und fair.']);
    else if (miss && c.miss) t = pick([`Schon wieder kein ${P[miss.p].name}!`, `Regal leer: ${P[miss.p].name} fehlte.`, `Ohne ${P[miss.p].name} kein Einkauf.`]);
    else if (c.hits) t = pick(['Viel zu teuer, Billigo ist günstiger.', 'Die Preise sind frech.', 'Für das Geld erwarte ich mehr.']);
    else if (c.wait > D.TYPES[c.type].pat * .6) t = pick(['Ewig an der Kasse gestanden.', 'Nur eine Kasse offen? Wirklich?', 'Die Schlange wollte nicht enden.']);
    else if (S.messes.length >= 2) t = pick(['Überall Pfützen, eklig.', 'Bitte mal wischen!']); else t = 'Ganz okay, nichts Besonderes.';
    S.reviews.push({ n: c.name, s: stars, t: (c.type === 'infl' ? '🤳 ' : '') + t, d: S.day }); if (S.reviews.length > 30) S.reviews.shift(); S.buzz = clamp(S.buzz + (stars - 3) * .004 * (c.type === 'infl' ? 12 : 1), -.25, .5);
  }
  function giveBack(S, c) { c.basket.forEach(b => { const sh = S.objs.find(o => isShelf(o) && o.p === b.p && o.qty + b.q <= cap(S, o)); if (sh) sh.qty += b.q; }); c.basket = []; }
  function finish(S, c, abandoned) {
    if (abandoned) giveBack(S, c);
    const T = S.today, T0 = D.TYPES[c.type]; let total = 0, units = 0; c.basket.forEach(b => { total += b.q * b.price; units += b.q; });
    if (!abandoned && units) { S.money += total; T.rev += total; T.items += units; T.served++; c.basket.forEach(b => { const cg = wholesale(S, b.p) * b.q; T.cogs += cg; T.units[b.p] = (T.units[b.p] || 0) + b.q; T.revBy[b.p] = (T.revBy[b.p] || 0) + b.q * b.price; }); S.xp += 2; }
    const done = c.list.reduce((a, l) => a + l.got, 0), found = c.want ? done / c.want : 1, qs = 1 - clamp(c.wait / T0.pat, 0, 1), ps = 1 - clamp(c.hits / Math.max(1, c.list.length), 0, 1), clean = 1 - Math.min(1, S.messes.length * .12);
    let sat = clamp(.45 * found + .2 * qs + .15 * ps + .1 * clean + .1 * clamp(c.mood / 100, 0, 1), 0, 1); if (S.staff.some(s => s.trait === 'freundlich')) sat = Math.min(1, sat + .04); if (abandoned || !units) sat = Math.min(sat, .3);
    const w = c.type === 'krit' ? 4 : 1; S.rep = clamp(S.rep + (sat * 100 - S.rep) * .045 * w, 5, 100); if (sat > .8) { T.happy++; if (c.reg >= 0) S.regs[c.reg].loy = Math.min(100, S.regs[c.reg].loy + 6); else if (S.regs.length < 120 && R() < .35) S.regs.push({ n: c.name, t: c.type, loy: 10 }); } if (sat < .45 && c.reg >= 0) S.regs[c.reg].loy = Math.max(0, S.regs[c.reg].loy - 8);
    if (abandoned || !units) T.lost++; if (c.recipe && !abandoned && c.recipe.need.every(i => c.list.some(l => l.p === i && l.got > 0))) { const bonus = Math.round(total * .12); S.money += bonus; T.rev += bonus; T.recipes++; S.xp += 6; bub(c, '🎉'); }
    c.sat = sat; S.tot.served += abandoned || !units ? 0 : 1; if (c.recipe && !abandoned && c.recipe.need.every(i => c.list.some(l => l.p === i && l.got > 0))) S.tot.recipes++; review(S, c, sat, abandoned);
  }
  const WANTED = ['flee', 'stun', 'held', 'arrest', 'flee2', 'change', 'id'], cost = (S, list) => list.reduce((a, b) => a + wholesale(S, b.p) * b.q, 0);
  function startFlee(S, c) { c.loot = true; leaveFor(S, c); c.st = 'flee'; c.spd *= 1.5; c.stole = 0; bub(c, S.up.kamera ? '🚨' : '🏃'); c.bt = 3; S.fx.push({ t: 'flee' }); note(S, '🚨 Ladendieb! Schnapp ihn dir – schubsen mit E, oder der Wachmann jagt ihn!', 'bad'); }
  function hold(S, c, by) { giveBack(S, c); c.loot = false; c.st = 'held'; c.held = 0; c.stun = 0; c.stars = 1; bub(c, '🚔'); c.bt = 4; S.xp += by === 'player' ? 10 : 6; S.tot.caught++; S.money += by === 'player' ? 1500 : 800; S.fx.push({ t: 'cuff' }); note(S, by === 'player' ? '🚔 Dieb festgehalten! Fangprämie +' + D.fmt(1500) : '💂 Der Wachmann hat den Dieb! Fangprämie +' + D.fmt(800), 'good'); callPolice(S, c); }
  function callPolice(S, c) { const d = doorTile(S); S.police.push({ id: S.nid++, x: d[0] + .5, y: d[1] + .6, path: [], pi: 0, tgt: c.id, st: 'in', t: 0 }); S.fx.push({ t: 'police' }); }
  function tickPolice(S, p, d) {
    const c = S.customers.find(x => x.id === p.tgt), door = doorTile(S); p.t += d; const spd = 3.3;
    const walk = () => { if (p.pi >= p.path.length) return true; const tx = p.path[p.pi][0] + .5, ty = p.path[p.pi][1] + .5, dx = tx - p.x, dy = ty - p.y, dist = Math.hypot(dx, dy), st = spd * d; if (dist <= st) { p.x = tx; p.y = ty; p.pi++; return p.pi >= p.path.length; } p.x += dx / dist * st; p.y += dy / dist * st; return false; };
    if (p.st === 'in') { if (!c || c.dead) { p.st = 'out'; p.path = path(S, p.x, p.y, door[0], door[1]) || []; p.pi = 0; return; } if (!p.path.length || p.pi >= p.path.length) { p.path = path(S, p.x, p.y, Math.floor(c.x), Math.floor(c.y)) || []; p.pi = 0; } walk(); if (Math.hypot(p.x - c.x, p.y - c.y) < 1.1) { c.st = 'arrest'; p.st = 'out'; p.path = path(S, p.x, p.y, door[0], door[1]) || []; p.pi = 0; bub(c, '😵'); c.bt = 2; S.fx.push({ t: 'cuff' }); } }
    else { if (c && c.st === 'arrest') { c.x = p.x + .45; c.y = p.y - .1; } if (walk() || p.path.length === 0) { if (c && c.st === 'arrest') { c.dead = true; note(S, '🚔 Die Polizei hat den Dieb abgeholt.', 'good'); } p.dead = true; } }
  }
  function doneShopping(S, c) {
    if (c.thief && c.basket.length && (c.stole || R() < .6)) { startFlee(S, c); return; }
    if (!c.basket.length) { finish(S, c, true); leaveFor(S, c, c.miss ? '😞' : null); } else heading(S, c);
  }
  const pending = S => S.customers.find(c => c.st === 'change') || null;

  // ---------- Altersnachweis ----------
  const reqAge = c => c.basket.reduce((m, b) => Math.max(m, P[b.p].age || 0), 0), pendingId = S => S.customers.find(c => c.st === 'id') || null;
  const fdate = d => String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0') + '.' + d.getUTCFullYear();
  function makeIdCard(S, c, req) {
    const fake = c.age < req && R() < .3, shown = fake ? req + ri(0, 4) : c.age, t = new Date(Date.UTC(2026, 9, 10)); t.setUTCDate(t.getUTCDate() + S.day - 1);
    const b = new Date(t); b.setUTCFullYear(b.getUTCFullYear() - shown); b.setUTCDate(b.getUTCDate() - ri(1, 300));
    const cues = { holo: true, photo: true, print: true }; if (fake) cues[pick(['holo', 'photo', 'print'])] = false;
    return { name: c.name, bd: fdate(b), today: fdate(t), req, fake, cues, look: c.age };
  }
  function idGate(S, c, r) {   // true = Kunde wartet auf Ausweis-Entscheidung oder ist weg
    c.idDone = true; const req = reqAge(c); if (!req || c.age >= 30) return false; const minor = c.age < req;
    if (S.up.idscan) return idApply(S, c, !minor, 'auto');
    if (S.staff.some(x => x.k === 'kasse' && x.reg === r.id)) { const ok = R() < .85; return idApply(S, c, ok ? !minor : minor, 'staff'); }
    c.card = makeIdCard(S, c, req); c.st = 'id'; c.idT = 0; bub(c, '🪪'); c.bt = 30; S.fx.push({ t: 'id' }); return true;
  }
  function idApply(S, c, sell, src) {   // true = Kunde verlässt die Kasse
    const req = reqAge(c), minor = c.age < req, r = obj(S, c.reg_q);
    if (sell) {
      if (minor) { S.money -= 50000; S.rep = clamp(S.rep - 3, 5, 100); S.tot.viol++; S.fx.push({ t: 'bad' }); note(S, '🚨 Alkohol an Minderjährige verkauft! Bußgeld ' + D.fmt(50000), 'bad'); }
      c.st = 'pay'; c.svc = 0; c.card = null; return false;
    }
    const gone = c.basket.filter(b => (P[b.p].age || 0) > 0 && (!minor || P[b.p].age > c.age)); c.basket = c.basket.filter(b => !gone.includes(b));
    gone.forEach(b => { const sh = S.objs.find(o => isShelf(o) && o.p === b.p && o.qty + b.q <= cap(S, o)); if (sh) sh.qty += b.q; });
    if (minor) { S.tot.refused++; S.xp += 6; S.rep = clamp(S.rep + .6, 5, 100); S.fx.push({ t: 'cash' }); note(S, '🪪 Richtig abgelehnt – Jugendschutz gewahrt.', 'good'); }
    else { c.mood -= 40; S.rep = clamp(S.rep - 1, 5, 100); S.fx.push({ t: 'bad' }); note(S, src === 'timeout' ? '⏱️ Zu langsam – Kunde ist genervt.' : '😠 Erwachsener Kunde zu Unrecht abgelehnt!', 'bad'); }
    c.card = null; c.units = c.basket.reduce((a, b) => a + b.q, 0); c.total = c.basket.reduce((a, b) => a + b.q * b.price, 0);
    const notes = [500, 1000, 2000, 5000, 10000]; c.given = c.cash ? (notes.find(n => n >= c.total) || Math.ceil(c.total / 1000) * 1000) : c.total;
    if (c.basket.length) { c.st = 'pay'; c.svc = 0; return false; }
    if (r) r.q = r.q.filter(i => i !== c.id); if (minor) leaveFor(S, c, '😒'); else { finish(S, c, true); leaveFor(S, c, '😠'); } return true;
  }
  function idDecision(S, sell) { const c = pendingId(S); if (!c) return null; idApply(S, c, !!sell, 'player'); return true; }
  function giveChange(S, amt, auto) {   // Wechselgeld in Cent; auto = zu langsam, wird korrekt ausgezahlt
    const c = pending(S); if (!c) return null; const due = c.given - c.total, diff = Math.round(amt) - due, r = obj(S, c.reg_q); if (r) r.q = r.q.filter(i => i !== c.id);
    finish(S, c, false); let msg; if (auto) { c.sat = Math.min(c.sat, .55); S.rep = clamp(S.rep - .3, 5, 100); msg = '⏱️ Zu lange gebraucht – Kunde ist genervt.'; }
    else if (diff === 0) { const tip = Math.round(c.total * .03); S.money += tip; S.today.rev += tip; msg = '✔ Passt! Trinkgeld ' + D.fmt(tip); S.xp += .3; }
    else if (diff > 0) { S.money -= diff; msg = '😬 Zu viel Rückgeld: ' + D.fmt(diff) + ' verloren.'; }
    else { S.money -= diff; c.sat = Math.min(c.sat, .35); S.rep = clamp(S.rep - 1.2, 5, 100); msg = '😠 Zu wenig Rückgeld – Kunde beschwert sich (' + D.fmt(-diff) + ' einbehalten).'; }
    leaveFor(S, c, diff === 0 && !auto ? '😊' : diff ? '😠' : null); S.fx.push({ t: diff === 0 && !auto ? 'cash' : 'bad' }); note(S, msg, diff === 0 && !auto ? 'good' : 'bad'); return { diff, msg };
  }
  function setIdentity(S, o) { const cl = s => String(s || '').replace(/[<>&"]/g, '').trim(); if (o.name != null) S.shopName = cl(o.name).slice(0, 22) || 'Markthalle 24'; if (o.slogan != null) S.slogan = cl(o.slogan).slice(0, 36); if (o.col && D.SIGNCOLS.some(x => x[0] === o.col)) S.signCol = o.col; S.named = true; }
  function tickCustomer(S, c, d) {
    c.bt = Math.max(0, c.bt - d); if (!c.bt) c.bub = null;
    if (WANTED.includes(c.st)) {
      if (c.st === 'id') { c.wait += d * .3; c.idT += d; if (c.idT > 30) idApply(S, c, false, 'timeout'); }
      else if (c.st === 'flee') { if (S.up.kamera) { c.bub = '🚨'; c.bt = 1; } if (follow(c, d)) { const lost = cost(S, c.basket); S.today.stolen += lost; S.rep = clamp(S.rep - .8, 5, 100); c.basket = []; c.dead = true; note(S, '😠 Ein Dieb ist mit Ware im Wert von ' + D.fmt(lost) + ' entkommen!', 'bad'); } }
      else if (c.st === 'flee2') { if (follow(c, d)) c.dead = true; }
      else if (c.st === 'change') { c.wait += d * .5; c.chW += d; if (c.chW > 28) giveChange(S, c.given - c.total, true); }
      else if (c.st === 'stun') { c.stun -= d; c.stars = 1; if (c.stun <= 0) { c.stars = 0; c.st = 'flee2'; c.spd *= 1.1; leaveFor(S, c); c.st = 'flee2'; bub(c, '😖'); } }
      else if (c.st === 'held') { c.held += d; if (c.held > 25 && !S.police.some(p => p.tgt === c.id)) { c.stars = 0; c.st = 'flee2'; leaveFor(S, c); c.st = 'flee2'; } }
      return;
    } const hx = Math.floor(c.x), hy = Math.floor(c.y); if (S.heat[hy * S.W + hx] != null) S.heat[hy * S.W + hx] += d;
    if (c.st === 'shop') {
      if (c.shelf == null) { if (c.li < c.list.length && !nextItem(S, c)) c.li = c.list.length; if (c.li >= c.list.length) { doneShopping(S, c); return; } }
      if (c.shelf != null) {
        if (!follow(c, d)) return; c.tim -= d; if (c.tim > 0) return; const o = obj(S, c.shelf), it = c.list[c.li]; c.shelf = null;
        if (o && o.p === it.p && o.qty > 0) { const pc = priceCheck(S, c, o); if (pc.ok) { const q = Math.min(o.qty, Math.max(1, Math.round(it.q * pc.mul))); o.qty -= q; it.got += q; c.basket.push({ p: it.p, q, price: effPrice(S, o) }); if (o.tag && o.tagp !== effPrice(S, o)) { if (effPrice(S, o) > o.tagp * 1.01) { c.mood -= 22; c.hits++; bub(c, '😠'); S.tot.mis++; } else c.mood = Math.min(100, c.mood + 6); } if (R() < .004 && S.messes.length < 12) S.messes.push({ x: Math.floor(c.x), y: Math.floor(c.y), id: S.nid++, k: 'trash' }); if (c.thief && !c.stole && R() < .5) c.stole = it.p; } else { c.hits++; c.mood -= 12; bub(c, pc.why); S.today.miss++; } } else { c.miss += it.q; bub(c, '❓'); c.mood -= 8; S.wish[it.p] = (S.wish[it.p] || 0) + 1; }
        c.li++; if (R() < .012 * (D.WEATHER[S.weather].mess || 1) && S.messes.length < 12) S.messes.push({ x: Math.floor(c.x), y: Math.floor(c.y), id: S.nid++ });
      }
    } else if (c.st === 'queue') {
      const r = obj(S, c.reg_q); if (!r) { leaveFor(S, c, '😡'); return; } const idx = r.q.indexOf(c.id); c.wait += d; c.mood -= d * (S.up.klima ? .12 : .2); if (idx !== c.slot) { c.slot = idx; const sp = slotPos(S, r, idx); setPath(c, path(S, c.x, c.y, sp[0], sp[1])); }
      follow(c, d); if (c.wait > D.TYPES[c.type].pat * (S.staff.some(s => s.trait === 'freundlich') ? 1.1 : 1)) { r.q.splice(r.q.indexOf(c.id), 1); bub(c, '😡'); finish(S, c, true); leaveFor(S, c); return; }
      if (idx === 0 && c.pi >= c.path.length) { c.st = 'pay'; c.units = c.basket.reduce((a, b) => a + b.q, 0); c.svc = 1.1 + c.units * .75; c.total = c.basket.reduce((a, b) => a + b.q * b.price, 0); c.cash = R() < (c.type === 'sen' ? .75 : c.type === 'stud' ? .3 : .5); const notes = [500, 1000, 2000, 5000, 10000], ex = R() < .25; c.given = c.cash ? (ex ? c.total : (notes.find(n => n >= c.total) || Math.ceil(c.total / 1000) * 1000)) : c.total; }
    } else if (c.st === 'pay') {
      const r = obj(S, c.reg_q); if (!r) { leaveFor(S, c); return; } const rate = opRate(S, r); c.wait += rate > 0 ? d * .3 : d; if (c.wait > D.TYPES[c.type].pat * 1.4) { r.q.shift(); bub(c, '😡'); finish(S, c, true); leaveFor(S, c); return; } c.svc -= d * rate; if (c.svc <= 0) { if (!c.idDone && idGate(S, c, r)) return; const manual = c.cash && c.given > c.total && !S.up.kassensys && r.k === 'kasse' && !S.staff.some(x => x.k === 'kasse' && x.reg === r.id); if (manual) { c.st = 'change'; c.chW = 0; } else { r.q.shift(); finish(S, c, false); leaveFor(S, c, c.sat > .8 ? '😊' : null); } }
    } else if (c.st === 'leave') { if (follow(c, d)) c.dead = true; }
  }

  // ---------- Personal ----------
  function hire(S, k) {
    const t = D.STAFF[k]; if (S.level < t.lvl) return false; const price = t.buy || 0; if (S.money < price) { note(S, 'Nicht genug Geld.', 'bad'); return false; } S.money -= price;
    const trait = k === 'robo' ? 'fleissig' : pick(D.TRAITS)[0], s = { id: S.nid++, k, name: k === 'robo' ? 'Bot-' + ri(10, 99) : pick(D.FIRST), trait, x: 2.5, y: S.H - 1.5, path: [], pi: 0, carry: null, task: null, reg: null, rate: 1 * (trait === 'flink' ? 1.25 : 1), spd: 2.4 * (trait === 'flink' ? 1.25 : 1) * (k === 'robo' ? .9 : 1), idle: 0 };
    s.lv = 1; s.bspd = s.spd; S.staff.push(s); return s;
  }
  const wageOf = s => Math.round(D.STAFF[s.k].wage * (1 + .12 * ((s.lv || 1) - 1)));
  function train(S, id) { const s = S.staff.find(x => x.id === id); if (!s) return false; const lv = s.lv || 1, cost = 15000 * lv; if (lv >= 5 || S.money < cost) return false; S.money -= cost; s.lv = lv + 1; const f = (s.trait === 'flink' ? 1.25 : 1); s.rate = f * (1 + .12 * (s.lv - 1)); s.spd = (s.k === 'robo' ? 2.4 * .9 : 2.4) * f * (1 + .1 * (s.lv - 1)); s.bspd = s.spd; note(S, `🎓 ${s.name} ist jetzt Stufe ${s.lv}.`, 'good'); return true; }
  function togglePromo(S, p) { if (S.promo[p]) { delete S.promo[p]; return true; } if (Object.keys(S.promo).length >= 2) { note(S, 'Höchstens 2 Tagesangebote gleichzeitig.', 'bad'); return false; } S.promo[p] = true; return true; }
  function fire(S, id) { const s = S.staff.find(x => x.id === id); if (!s) return; if (s.carry) S.ramp.push(s.carry); S.staff = S.staff.filter(x => x !== s); }
  function sfollow(s, d) { if (s.pi >= s.path.length) return true; const tx = s.path[s.pi][0] + .5, ty = s.path[s.pi][1] + .5, dx = tx - s.x, dy = ty - s.y, dist = Math.hypot(dx, dy), step = s.spd * d; if (dist <= step) { s.x = tx; s.y = ty; s.pi++; return s.pi >= s.path.length; } s.x += dx / dist * step; s.y += dy / dist * step; return false; }
  function tickStaff(S, s, d) {
    if (s.k === 'kasse') { const mine = S.objs.filter(o => o.k === 'kasse'); if (!obj(S, s.reg)) s.reg = null; if (!s.reg) { const free = mine.find(r => !S.staff.some(x => x.reg === r.id)); if (free) s.reg = free.id; } if (s.reg) { const r = obj(S, s.reg), st = serviceTile(r); if (!s.path.length && Math.hypot(s.x - (st[0] + .5), s.y - (st[1] + .5)) > .4) setPath(s, path(S, s.x, s.y, st[0], st[1]) || []); sfollow(s, d); } return; }
    if (s.k === 'putz') { if (!s.path.length || s.pi >= s.path.length) { const m = S.messes.slice().sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0]; if (m && !s.task) { const p = path(S, s.x, s.y, m.x, m.y); if (p) { setPath(s, p); s.task = m; } } else if (s.task && s.pi >= s.path.length) { S.messes = S.messes.filter(x => x !== s.task && x.id !== s.task.id); s.task = null; s.path = []; } } sfollow(s, d); if (s.trait === 'schusselig' && R() < .0008 && S.messes.length < 12) S.messes.push({ x: Math.floor(s.x), y: Math.floor(s.y), id: S.nid++ }); return; }
    if (s.k === 'baecker') { const ov = S.objs.filter(o => D.OBJ[o.k].bake && o.p).sort((a, b) => ratio(S, a) - ratio(S, b))[0]; if (!ov) return; const tg = accessTiles(S, ov)[0]; if (!tg) return; const dist = Math.hypot(s.x - tg[0] - .5, s.y - tg[1] - .5); if (dist > .6 && (!s.path.length || s.pi >= s.path.length)) setPath(s, path(S, s.x, s.y, tg[0], tg[1]) || []); sfollow(s, d); if (dist <= .9 && ratio(S, ov) < .5) { s.bk = (s.bk || 0) + d * (s.rate || 1); if (s.bk > 6) { s.bk = 0; bakeOne(S, ov); } } return; }
    if (s.k === 'wache') { if (!s.bspd) s.bspd = s.spd; const th = S.customers.find(c => c.st === 'flee' && Math.hypot(s.x - c.x, s.y - c.y) < (S.up.kamera ? 16 : 9)); if (th) { s.spd = 3.5; s.cd = (s.cd || 0) - d; if (s.cd <= 0 || !s.path.length) { s.cd = .3; setPath(s, path(S, s.x, s.y, Math.floor(th.x), Math.floor(th.y)) || []); } if (Math.hypot(s.x - th.x, s.y - th.y) < 1.05) { hold(S, th, 'guard'); s.path = []; } sfollow(s, d); return; } s.spd = s.bspd; const door = doorTile(S); if (!s.path.length && Math.hypot(s.x - 3.5, s.y - (S.H - 2.5)) > .6) setPath(s, path(S, s.x, s.y, 3, S.H - 2) || []); sfollow(s, d); return; }
    // Regalauffüller / Bot
    if (s.path.length && s.pi < s.path.length) { sfollow(s, d); return; } s.path = []; s.pi = 0;
    if (s.task && s.task.t === 'pick') { const b = s.task.box, i = S.ramp.indexOf(b); if (i >= 0) { S.ramp.splice(i, 1); s.carry = b; flush(S); } s.task = null; }
    else if (s.task && s.task.t === 'drop') { const o = obj(S, s.task.shelf); if (o && s.carry && o.p === s.carry.p) addStock(S, o, s.carry); if (s.carry && s.carry.n <= 0) s.carry = null; s.task = null; }
    if (s.task) return; s.idle += d; if (s.idle < .4) return; s.idle = 0;
    if (s.carry) { const o = S.objs.filter(x => isShelf(x) && x.p === s.carry.p && x.qty < cap(S, x)).sort((a, b) => a.qty / cap(S, a) - b.qty / cap(S, b))[0]; if (o) { const p = pathToObj(S, s.x, s.y, o); if (p) { setPath(s, p); s.task = { t: 'drop', shelf: o.id }; return; } } S.ramp.push(s.carry); s.carry = null; return; }
    const ramp = byKind(S, 'ramp')[0]; if (!ramp || !S.ramp.length) return; let best = null, bs = 9; S.ramp.forEach(b => { const o = S.objs.filter(x => isShelf(x) && x.p === b.p && x.qty < cap(S, x)).sort((a, c) => a.qty / cap(S, a) - c.qty / cap(S, c))[0]; if (o) { const r = o.qty / cap(S, o); if (r < bs && r < .85) { bs = r; best = b; } } });
    if (best) { const p = pathToObj(S, s.x, s.y, ramp); if (p) { setPath(s, p); s.task = { t: 'pick', box: best }; } }
  }
  function addStock(S, o, box, n) { const room = cap(S, o) - o.qty; if (room <= 0) return 0; const mv = Math.min(room, box.n, n == null ? 1e9 : n); o.age = (o.age * o.qty + (box.age || 0) * mv) / (o.qty + mv); o.qty += mv; box.n -= mv; return mv; }

  // ---------- Spieler ----------
  const pl_run = S => !!S.player.run;
  function movePlayer(S, d) {
    const pl = S.player, sp = 3.4 * (pl_run(S) ? 1.55 : 1); let vx = pl.vx, vy = pl.vy; const l = Math.hypot(vx, vy); if (l > 1) { vx /= l; vy /= l; }
    const mv = (dx, dy) => { const nx = pl.x + dx, ny = pl.y + dy, r = .28; for (const [cx, cy] of [[nx - r, ny - r], [nx + r, ny - r], [nx - r, ny + r], [nx + r, ny + r]]) if (solid(S, Math.floor(cx), Math.floor(cy))) return false; pl.x = nx; pl.y = ny; return true; };
    mv(vx * sp * d, 0); mv(0, vy * sp * d);
  }
  const rectDist = (px, py, o) => { const dx = Math.max(o.x - px, 0, px - (o.x + o.w)), dy = Math.max(o.y - py, 0, py - (o.y + o.h)); return Math.hypot(dx, dy); };
  const carryCap = S => S.up.wagen ? 3 : 1;
  function context(S, focus) {
    const pl = S.player; for (const c of S.customers) { if ((c.st === 'flee' || c.st === 'stun') && Math.hypot(pl.x - c.x, pl.y - c.y) < 1.6) return { a: 'stop', c, label: c.st === 'flee' ? '👊 Dieb schubsen!' : '🚔 Festhalten & Polizei rufen' }; }
    for (const r of S.objs) { if (r.k !== 'kasse') continue; const st = serviceTile(r); if (Math.hypot(pl.x - (st[0] + .5), pl.y - (st[1] + .5)) > 1.25) continue; const c = S.customers.find(x => x.st === 'pay' && x.reg_q === r.id); if (c) { const left = Math.ceil((c.svc - 1.1) / .75 - 1e-6); return { a: 'scan', c, label: left > 0 ? `📟 Scannen (${left} Artikel)` : '💶 Kassieren' }; } }
    const near = S.objs.filter(o => rectDist(pl.x, pl.y, o) < 1.5), fd = o => rectDist(pl.x, pl.y, o) - (focus && o.id === focus.id ? 5 : 0);
    const eb = pl.carry.find(b => b.empty); if (eb) { const ct = near.find(o => o.k === 'container'); if (ct) return { a: 'trash', o: ct, label: S.paper >= CONT_MAX ? '🗑️ Container voll!' : '🗑️ Leeren Karton entsorgen' }; }
    const nb = pl.carry.find(b => !b.empty); if (nb) { const b = nb, sh = near.filter(o => isShelf(o) && ((o.p === b.p && o.qty < cap(S, o)) || (!o.p && fits(o, b.p)) || (o.p && o.qty === 0 && fits(o, b.p) && o.p !== b.p))).sort((a, c) => fd(a) - fd(c))[0]; if (sh) return { a: 'stock', o: sh, label: `${P[b.p].e} einräumen (${b.n} im Karton)` }; }
    const tgc = near.filter(o => needsTag(S, o)).sort((a, c) => fd(a) - fd(c))[0]; if (tgc) return { a: 'tag', o: tgc, label: `🏷️ Preisschild aufstecken (${D.fmt(effPrice(S, tgc))})` };
    const m = S.messes.find(m => Math.hypot(m.x + .5 - pl.x, m.y + .5 - pl.y) < 1.2); if (m) return { a: 'clean', m, label: m.k === 'trash' ? '🧹 Müll aufheben' : '🧽 Pfütze wischen' };
    const rp = near.find(o => o.k === 'ramp'); if (rp) { if (pl.carry.length < carryCap(S) && S.ramp.length) return { a: 'pick', label: '📦 Karton nehmen' }; if (pl.carry.some(b => !b.empty)) return { a: 'back', label: '↩️ Karton zurückstellen' }; }
    const pcn = near.find(o => o.k === 'pc'); if (pcn) return { a: 'pc', o: pcn, label: '💻 Bestell-PC benutzen' };
    const rd = near.find(o => o.k === 'radio'); if (rd) return { a: 'radio', o: rd, label: '📻 Radio an/aus' };
    return null;
  }
  // ---------- Einräumen: Hilfsfunktionen, Einräum-Hilfe, Wegweiser ----------
  const ratio = (S, o) => o.qty / Math.max(1, cap(S, o));
  function shelfFor(S, b) {
    const c = S.objs.filter(o => isShelf(o) && ((o.p === b.p && o.qty < cap(S, o)) || (!o.p && fits(o, b.p)) || (o.p && o.qty === 0 && o.p !== b.p && fits(o, b.p))));
    c.sort((a, d) => (d.p === b.p ? 1 : 0) - (a.p === b.p ? 1 : 0) || ratio(S, a) - ratio(S, d)); return c[0] || null;
  }
  const freeFor = (S, p) => S.objs.some(o => isShelf(o) && !o.p && fits(o, p)), isNew = (S, b) => !S.objs.some(o => isShelf(o) && o.p === b.p) && freeFor(S, b.p);
  function boxIdx(S) { let bi = 0, bs = 9; S.ramp.forEach((b, i) => { const o = S.objs.filter(x => isShelf(x) && x.p === b.p).sort((a, c) => ratio(S, a) - ratio(S, c))[0], r = o ? ratio(S, o) : isNew(S, b) ? .6 : 1.5; if (r < bs) { bs = r; bi = i; } }); return bi; }
  const CONT_MAX = 40;
  const needsTag = (S, o) => isShelf(o) && o.p && o.qty > 0 && (!o.tag || o.tagp !== effPrice(S, o));
  function tagShelf(S, o, auto) { o.tag = true; o.tagp = effPrice(S, o); S.fx.push({ t: 'tag', o: o.id, auto: !!auto }); if (!auto) S.xp += .1; }
  function stockInto(S, o, b, n) {   // legt n Stück (Standard: 1) aus dem Karton ins Regal
    const pl = S.player; if (!o.p || (o.qty === 0 && o.p !== b.p)) { o.p = b.p; o.age = 0; o.disc = false; o.tag = false; } const k = addStock(S, o, b, n == null ? 1 : n); b.put = (b.put || 0) + k; if (k > 0) { S.fx.push({ t: 'put', p: b.p, o: o.id }); if (needsTag(S, o)) tagShelf(S, o, true); }
    if (b.n <= 0) { const keep = S.objs.some(x => x.k === 'container'); if (keep) b.empty = true; else { const i = pl.carry.indexOf(b); if (i >= 0) pl.carry.splice(i, 1); } S.fx.push({ t: 'boxdone', p: b.p, n: b.put, keep }); }
    else if (k === 0 || cap(S, o) - o.qty <= 0) { S.fx.push({ t: 'full', p: b.p, n: b.put }); b.put = 0; if (!shelfFor(S, b)) { const i = pl.carry.indexOf(b); if (i >= 0) { pl.carry.splice(i, 1); S.ramp.push(b); S.fx.push({ t: 'back', p: b.p }); } } }
    return k;
  }
  function trashBox(S) {
    const pl = S.player, i = pl.carry.findIndex(b => b.empty); if (i < 0) return false;
    if (S.paper >= CONT_MAX) { pl.carry.splice(i, 1); S.messes.push({ x: Math.floor(pl.x), y: Math.floor(pl.y), id: S.nid++, k: 'trash' }); S.fx.push({ t: 'bad' }); note(S, 'Container voll! Der Karton liegt jetzt auf dem Boden – morgen wird geleert.', 'bad'); return false; }
    pl.carry.splice(i, 1); S.paper++; S.tot.paper++; S.money += 5; S.fx.push({ t: 'trash' }); return true;
  }
  function pickBox(S) { const b = S.ramp.splice(boxIdx(S), 1)[0]; if (b) { S.player.carry.push(b); S.fx.push({ t: 'pick', p: b.p }); } flush(S); return b; }
  function assistTick(S, d) {
    if (S.assist === false || S.phase === 'summary') return; const pl = S.player; let busy = false, eb = pl.carry.find(b => b.empty), nb = pl.carry.find(b => !b.empty);
    if (eb) { const ct = S.objs.find(o => o.k === 'container'); if (ct && rectDist(pl.x, pl.y, ct) < 1.4) { busy = true; pl.dw = (pl.dw || 0) + d; if (pl.dw > .3) { trashBox(S); pl.dw = 0; } } }
    else if (nb) { const sh = shelfFor(S, nb); if (sh && rectDist(pl.x, pl.y, sh) < 1.4) { busy = true; pl.dw = (pl.dw || 0) + d; if (pl.dw > .3) { pl.acc = (pl.acc || 0) + d * 7; while (pl.acc >= 1) { pl.acc -= 1; if (!stockInto(S, sh, nb, 1) || pl.carry.indexOf(nb) < 0) { pl.acc = 0; break; } } } } }
    else { const rp = S.objs.find(o => o.k === 'ramp'); if (rp && S.ramp.length && rectDist(pl.x, pl.y, rp) < 1.4 && S.ramp.some(b => isNew(S, b) || S.objs.some(o => isShelf(o) && o.p === b.p && ratio(S, o) < .75))) { busy = true; pl.dw = (pl.dw || 0) + d; if (pl.dw > .3) { pickBox(S); pl.dw = 0; } } }
    if (!busy) { const tg = S.objs.find(o => needsTag(S, o) && rectDist(pl.x, pl.y, o) < 1.2); if (tg) { busy = true; pl.dw = (pl.dw || 0) + d; if (pl.dw > .9) { tagShelf(S, tg); pl.dw = 0; } } }
    if (!busy) pl.dw = 0;
  }
  function nextStep(S) {
    if (S.phase === 'summary' || S.hints === false) return null; const pl = S.player, ctr = o => ({ x: o.x + o.w / 2, y: o.y + o.h / 2 });
    const th = S.customers.find(c => c.st === 'flee' || c.st === 'stun'); if (th) return { txt: th.st === 'flee' ? '🚨 Dieb! Lauf hin und schubse ihn mit E' : '🚔 Noch mal E: festhalten & Polizei rufen', x: th.x, y: th.y, e: '🚨' };
    if (S.phase === 'open' || S.phase === 'closing') { const r = S.objs.find(o => o.k === 'kasse' && S.customers.some(c => (c.st === 'pay' || c.st === 'queue') && c.reg_q === o.id)); if (r && !S.staff.some(s => s.k === 'kasse' && s.reg === r.id)) { const st = serviceTile(r); if (Math.hypot(pl.x - st[0] - .5, pl.y - st[1] - .5) > 1.2) return { txt: '💶 Kunden warten! Geh hinter die Kasse – dort scannst du mit E', x: st[0] + .5, y: st[1] + .5, e: '💶' }; } }
    if (pl.carry.some(b => b.empty)) { const ct = S.objs.find(o => o.k === 'container'); if (ct) { const t = ctr(ct); return { txt: '🗑️ Leeren Karton in den Altpapier-Container werfen (einfach hinlaufen)', x: t.x, y: t.y, e: '🗑️' }; } }
    if (pl.carry.some(b => !b.empty)) { const b = pl.carry.find(b => !b.empty), sh = shelfFor(S, b); if (sh) { const t = ctr(sh); return { txt: `${P[b.p].e} Bring den Karton zum markierten Regal – einfach hinlaufen, es räumt sich von selbst ein`, x: t.x, y: t.y, e: P[b.p].e }; } return { txt: '🔧 Kein Regal dafür frei – baue ein passendes Regal (Bauen) oder stell den Karton zurück', x: null, y: null }; }
    const tgs = S.objs.filter(o => needsTag(S, o)).sort((a, c) => Math.hypot(a.x - pl.x, a.y - pl.y) - Math.hypot(c.x - pl.x, c.y - pl.y)); if (tgs.length) { const o = tgs[0], t = ctr(o); return { txt: `🏷️ Preisschild ${o.tag ? 'ist veraltet' : 'fehlt'}: ${P[o.p].e} ${P[o.p].name} – hinlaufen (von selbst oder E)`, x: t.x, y: t.y, e: '🏷️' }; }
    const low = S.objs.filter(o => isShelf(o) && o.p && ratio(S, o) < (S.phase === 'prep' ? .7 : .45));
    if (low.length) { const rp = S.objs.find(o => o.k === 'ramp'); if (S.ramp.some(b => low.some(o => o.p === b.p)) && rp) { const t = ctr(rp); return { txt: '📦 Hol einen Karton an der Warenannahme (markiert) – einfach hinlaufen', x: t.x, y: t.y, e: '📦' }; } if (S.ramp.length && rp) { const t = ctr(rp); return { txt: '📦 Hol einen Karton an der Warenannahme (markiert)', x: t.x, y: t.y, e: '📦' }; } const pcx = S.objs.find(o => o.k === 'pc'), pt = pcx ? ctr(pcx) : { x: null, y: null }; return { txt: `💻 ${P[low[0].p].name} wird knapp – bestelle am Bestell-PC (Lieferung morgen früh)`, x: pt.x, y: pt.y, e: '💻' }; }
    const fresh = S.ramp.find(b => isNew(S, b)), rp2 = S.objs.find(o => o.k === 'ramp'); if (fresh && rp2) { const t = ctr(rp2); return { txt: `📦 Neue Ware an der Warenannahme (${P[fresh.p].name}) – hol den Karton, er kommt ins freie Regal`, x: t.x, y: t.y, e: '📦' }; }
    if (S.phase === 'prep') return { txt: '▶ Alles bereit! Oben auf „Laden öffnen“ tippen.', x: null, y: null };
    return null;
  }
  function act(S, focus) {
    const c = context(S, focus); if (!c) return null; const pl = S.player;
    if (c.a === 'stop') { const t = c.c; if (t.st === 'flee') { giveBack(S, t); t.loot = false; t.st = 'stun'; t.stun = 4.5; t.stars = 1; bub(t, '💥'); t.bt = 1.3; S.xp += 3; S.fx.push({ t: 'smack' }); } else if (t.st === 'stun') hold(S, t, 'player'); }
    else if (c.a === 'scan') { c.c.svc = Math.max(0, c.c.svc - .78); S.xp += .05; }
    else if (c.a === 'stock') stockInto(S, c.o, pl.carry.find(b => !b.empty), 1);
    else if (c.a === 'trash') trashBox(S);
    else if (c.a === 'tag') tagShelf(S, c.o);
    else if (c.a === 'pc') S.fx.push({ t: 'pc' });
    else if (c.a === 'clean') { S.messes = S.messes.filter(m => m !== c.m); S.xp += 1; }
    else if (c.a === 'pick') pickBox(S);
    else if (c.a === 'back') { const i = pl.carry.findIndex(b => !b.empty); if (i >= 0) S.ramp.push(pl.carry.splice(i, 1)[0]); }
    return c;
  }

  // ---------- Bauen, Preise, Geld ----------
  function layoutOK(S) {
    rebuild(S); const door = doorTile(S), start = [door[0], door[1] - 1]; if (solid(S, start[0], start[1])) return false; const W = S.W, H = S.H, seen = new Uint8Array(W * H), st = [start[1] * W + start[0]]; seen[st[0]] = 1;
    while (st.length) { const c = st.pop(), cx = c % W, cy = (c / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy; if (solid(S, nx, ny) || seen[ny * W + nx]) continue; seen[ny * W + nx] = 1; st.push(ny * W + nx); } }
    return S.objs.every(o => accessTiles(S, o).some(a => seen[a[1] * W + a[0]])) && S.objs.filter(o => o.k === 'kasse' || o.k === 'sco').every(r => { const st2 = serviceTile(r); return !solid(S, r.x, r.y + 1) && (r.k === 'sco' || (!solid(S, st2[0], st2[1]) && seen[st2[1] * W + st2[0]])); });
  }
  function place(S, k, x, y, rot, fromInv) {
    const t = D.OBJ[k]; if (!t || t.fixed) return null; if (!fromInv && (S.level < t.lvl || S.money < t.price)) return null; const w = rot ? t.h : t.w, h = rot ? t.w : t.h;
    if (x < 1 || y < 1 || x + w > S.W - 1 || y + h > S.H - 1) return null; if (y + h > S.H - 2 && x <= 3 && x + w > 1) return null;
    for (const o of S.objs) if (x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y) return null; if (S.messes.some(m => m.x >= x && m.x < x + w && m.y >= y && m.y < y + h)) S.messes = S.messes.filter(m => !(m.x >= x && m.x < x + w && m.y >= y && m.y < y + h));
    const pl = S.player; if (pl.x > x - .3 && pl.x < x + w + .3 && pl.y > y - .3 && pl.y < y + h + .3) return null;
    const o = { id: S.nid++, k, x, y, w, h, p: null, qty: 0, age: 0, disc: false, q: [], svc: 0 }; S.objs.push(o); if (!layoutOK(S)) { S.objs.pop(); rebuild(S); return null; }
    if (fromInv) { const it = fromInv; if (it.p && fits(o, it.p)) { o.p = it.p; o.qty = Math.min(it.qty, cap(S, o)); o.age = it.age; } } else S.money -= t.price; return o;
  }
  function pickUp(S, id) {
    const o = obj(S, id); if (!o || D.OBJ[o.k].fixed) return false; if ((o.k === 'kasse' || o.k === 'sco') && (o.q.length || S.customers.some(c => c.reg_q === o.id))) return false; S.objs = S.objs.filter(x => x !== o); S.staff.forEach(s => { if (s.reg === id) s.reg = null; });
    S.inv.push({ k: o.k, p: o.p, qty: o.qty, age: o.age }); rebuild(S); return true;
  }
  function sell(S, id) { const o = obj(S, id); if (!o || D.OBJ[o.k].fixed || !pickUp(S, id)) return false; S.inv.pop(); S.money += Math.round(D.OBJ[o.k].price * .6); if (o.qty) S.ramp.push({ p: o.p, n: o.qty, age: o.age }); return true; }
  function setPrice(S, p, c) { S.price[p] = clamp(Math.round(c), Math.max(5, Math.round(wholesale(S, p) * .5)), P[p].ref * 4); }
  function assign(S, id, p) { const o = obj(S, id); if (!o || !isShelf(o) || (p && !fits(o, p)) || (p && !S.lic[P[p].cat])) return false; if (o.qty > 0 && o.p !== p) { S.ramp.push({ p: o.p, n: o.qty, age: o.age }); o.qty = 0; } o.p = p; o.age = 0; o.disc = false; o.tag = false; return true; }
  function buyLic(S, cat) { const c = D.CATS[cat]; if (S.lic[cat] || S.level < c.lvl || S.money < c.cost) return false; S.money -= c.cost; S.lic[cat] = true; return true; }
  function buyUp(S, id) { const u = D.UPGRADES.find(x => x.id === id); if (!u || S.up[id] || S.level < u.lvl || S.money < u.price) return false; S.money -= u.price; S.up[id] = true; return true; }
  function expand(S) { const n = D.EXPAND[S.exp + 1]; if (!n || S.level < n.lvl || S.money < n.price) return false; S.money -= n.price; S.exp++; const oh = S.H, ow = S.W; S.W = n.W; S.H = n.H; const heat = new Array(S.W * S.H).fill(0); S.heat = heat; rebuild(S); S.player.y = Math.min(S.player.y, S.H - 2); return true; }
  const loanMax = S => 300000 + 50000 * S.level;
  function borrow(S, a) { if (S.loan + a > loanMax(S)) return false; S.loan += a; S.money += a; return true; }
  function repay(S, a) { a = Math.min(a, S.loan, S.money); if (a <= 0) return false; S.loan -= a; S.money -= a; return true; }

  // ---------- Hauptschritt ----------
  function openShop(S) { if (S.phase !== 'prep') return false; if (!S.objs.some(o => o.k === 'kasse' || o.k === 'sco')) { note(S, 'Ohne Kasse kein Geschäft!', 'bad'); return false; } if (!Object.keys(offered(S)).length) { note(S, 'Fülle erst ein Regal mit Ware.', 'bad'); return false; } S.phase = 'open'; S.t = 0; S.spawnAcc = 0; return true; }
  function tick(S, d) {
    S.simT += d; movePlayer(S, d);
    if (S.phase === 'open') {
      S.t += d; S.spawnAcc += spawnRate(S) * d; const cap0 = 10 + 2 * S.level; while (S.spawnAcc >= 1) { S.spawnAcc -= 1; if (S.customers.length < cap0) spawn(S); }
      S.ev.forEach(e => { if (e.k === 'promi' && !e.done && S.t >= e.t0) { e.done = 1; const c = spawn(S, 'krit'); if (c) note(S, '🧐 Eine Testerin ist im Laden – gib dein Bestes!', 'info'); } if (e.k === 'stromausfall') { const on = S.t >= e.t0 && S.t <= e.t1; if (on && !S.blackout) { S.blackout = true; note(S, '⚡ Stromausfall! Kühlung ist aus.', 'bad'); } if (!on && S.blackout && S.t > e.t1) { S.blackout = false; if (!S.up.notstrom) { S.objs.forEach(o => { if (isShelf(o) && o.p && (o.k === 'kuehl' || o.k === 'frost')) { const l = Math.round(o.qty * .4); o.qty -= l; S.today.stolen += l * wholesale(S, o.p); } }); note(S, 'Kühlware ist teilweise verdorben.', 'bad'); } else note(S, 'Notstrom hat alles gerettet.', 'good'); } } });
      if (S.t >= DAYLEN) { S.phase = 'closing'; S.closeT = 0; note(S, 'Feierabend! Letzte Kunden werden bedient.', 'info'); }
    }
    if (S.phase === 'closing') { S.closeT += d; if (S.closeT > 40) S.customers.forEach(c => { if (c.st !== 'leave' && c.st !== 'pay' && !WANTED.includes(c.st)) { const r = obj(S, c.reg_q); if (r) r.q = r.q.filter(i => i !== c.id); finish(S, c, true); leaveFor(S, c); } }); }
    S.orders.some(o => o.when === 'express') && deliver(S, 'express'); if (S.backlog.length) flush(S);
    while (S.xp >= lvlNeed(S.level) && S.level < 20) { S.level++; note(S, `⭐ Stufe ${S.level} erreicht! Neue Möglichkeiten im Menü.`, 'good'); }
    assistTick(S, d); S.customers.forEach(c => tickCustomer(S, c, d)); S.customers = S.customers.filter(c => !c.dead); S.police.forEach(p => tickPolice(S, p, d)); S.police = S.police.filter(p => !p.dead); S.staff.forEach(s => tickStaff(S, s, d));
    if (S.phase === 'closing' && !S.customers.length) endDay(S);
  }
  function step(S, dt) { if (S.phase === 'summary') return; const n = Math.max(1, Math.ceil(dt / .1)), d = dt / n; for (let i = 0; i < n; i++) { tick(S, d); if (S.phase === 'summary') break; } }
  const clock = S => { const m = Math.floor(8 * 60 + Math.min(S.t, DAYLEN) * MIN_PER_SEC); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const save = S => JSON.stringify(S, (k, v) => k[0] === '_' ? undefined : v);
  const load = js => { const S = JSON.parse(js); if (S.buzz == null) S.buzz = 0; if (!S.shopName) { S.shopName = 'Markthalle 24'; S.slogan = 'Frisch · Fair · Freundlich'; S.signCol = '#0f2b5a'; S.named = true; } S.cart = S.cart || {}; S.rules = S.rules || {}; if (!S.floor) { S.floor = 'fliese'; S.wall = 'beige'; S.own = { floor: { fliese: true }, wall: { beige: true } }; } if (S.assist == null) S.assist = true; if (S.hints == null) S.hints = true; S.reviews = S.reviews || []; S.ach = S.ach || {}; S.tot = Object.assign({ recipes: 0, caught: 0, served: 0, refused: 0, viol: 0, paper: 0, mis: 0 }, S.tot || {}); S.paper = S.paper || 0; S.objs.forEach(o => { if (isShelf(o) && o.p && o.tag == null) { o.tag = true; o.tagp = effPrice(S, o); } }); S.promo = S.promo || {}; S.staff.forEach(s => { if (!s.lv) s.lv = 1; }); S.police = S.police || []; S.fx = []; S.customers.forEach(c => { if (c.st === 'arrest' || c.st === 'held') { c.dead = true; } }); S.police = []; rebuild(S); if (!S.objs.some(o => o.k === 'radio')) for (const [x, y] of [[15, 5], [15, 8], [3, 8], [9, 9], [6, 9], [4, 4], [16, 9]]) if (place(S, 'radio', x, y, false, {})) break; if (!S.objs.some(o => o.k === 'container')) for (const [x, y] of [[4, 1], [4, 2], [3, 3], [16, 3], [16, 8], [1, 9]]) if (place(S, 'container', x, y, false, {})) break; if (!S.objs.some(o => o.k === 'pc')) for (const [x, y] of [[2, 4], [3, 6], [2, 8], [4, 9], [13, 9], [15, 9]]) if (place(S, 'pc', x, y, false, {})) break; return S; };
  return { create, step, openShop, nextDay, order, hire, fire, place, pickUp, sell, setPrice, assign, buyLic, buyUp, expand, borrow, repay, act, context, layoutOK, rebuild, spawn, path, cap, fits, ref, rival, wholesale, effPrice, offered, isShelf, byKind, obj, clock, stars, save, load, rent, power, lvlNeed, loanMax, solid, doorTile, serviceTile, questVal, spawnRate, setRng: f => { R = f; }, pending, pendingId, idDecision, giveChange, setIdentity, cartSet, cartCost, cartOrder, suggest, unitsOf, capOf, rule, setRule, nearPC, buyFloor, buyWall, stockInto, season, train, togglePromo, wageOf, nextStep, shelfFor, DAYLEN, RAMP_MAX, rampMax, achDone, DOW, endDay, note, addStock };
})();
if (typeof module !== 'undefined') module.exports = Sim;
